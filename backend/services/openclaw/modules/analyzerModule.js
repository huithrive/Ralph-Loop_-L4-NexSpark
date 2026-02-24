/**
 * analyzerModule.js — Analyzer/OpenClaw Agent Module
 * 
 * Owns: monitoring → optimization → scaling → weekly-sync stages
 * Chat: Performance reports, alerts, recommendations, scaling decisions
 * Heartbeat: Metrics evaluation → rules → action cards
 * 
 * This is the "24/7 guardian" module — the heart of OpenClaw.
 */

const { Effect, EffectType } = require('../effectSystem');
const { getClient: getGoMarbleClient } = require('../../gomarble');
const { 
  processCampaignData, 
  processAccountData,
  getTopPerformers,
  comparePeriods 
} = require('../../gomarble/advertisingService');

const analyzerModule = {
  name: 'analyzer',
  description: 'Campaign monitoring, performance alerts, optimization recommendations, scaling decisions',
  routingExamples: [
    'how are my ads performing',
    'show me this week\'s results',
    'what should I optimize',
    'scale my budget',
    'why did my costs go up',
  ],
  stages: ['monitoring', 'optimization', 'scaling', 'weekly-sync'],
  icon: '🔍',
  label: 'Analyzer',
  color: '#F59E0B',
  
  handleMessage,
  getGreeting: null,
  onStageEnter: null,
  
  // Heartbeat capabilities
  evaluateMetrics: async (clientId, metrics) => {
    // Try to fetch live metrics from GoMarble if API key is configured
    const liveMetrics = await fetchLiveMetrics(clientId);
    
    if (liveMetrics && !liveMetrics._mock) {
      console.log('[AnalyzerModule] Using live GoMarble metrics');
      // Delegate to optimizer with live data
      const optimizerService = require('../../analyzer/optimizerService');
      return optimizerService.evaluateRules(liveMetrics);
    }
    
    // Fallback: use provided metrics or delegate to existing optimizer
    console.log('[AnalyzerModule] Using provided/demo metrics');
    const optimizerService = require('../../analyzer/optimizerService');
    return optimizerService.evaluateRules(metrics);
  },
  
  generateCards: async (clientId, rules, context) => {
    const actionCardService = require('../actionCardService');
    return actionCardService.generateCards(clientId, rules, context);
  },
  
  // Live metrics fetcher
  fetchLiveMetrics,
  
  effectHandlers: {},
};

// ============================================================================
// CHAT ROUTING
// ============================================================================

async function handleMessage(session, userText, context) {
  const handlers = {
    'monitoring': handleMonitoring,
    'optimization': handleOptimization,
    'scaling': handleScaling,
    'weekly-sync': handleWeeklySync,
  };
  
  const handler = handlers[session.stage];
  if (!handler) {
    return { effects: [], sseEvents: [{ event: 'done', data: {} }] };
  }
  return handler(session, userText, context);
}

// ============================================================================
// MONITORING — First results + notification preference
// ============================================================================

async function handleMonitoring(session, userText, context) {
  const effects = [];
  const sseEvents = [];
  const step = session.subStep;
  
  if (step === 0) {
    // 48-hour first briefing
    session.subStep = 1;
    sseEvents.push({ event: 'tab_switch', data: { tab: 'results' } });
    sseEvents.push({ event: 'canvas_update', data: { view: 'results-early' } });
    sseEvents.push({ event: 'progress_step', data: { step: 1, status: 'complete' } });
    sseEvents.push({ event: 'progress_step', data: { step: 2, status: 'active' } });
    sseEvents.push({ event: 'canvas_update', data: { view: 'daily-spend-tracker' } });
    sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'report', cardData: 'daily_briefing_enhanced' } });
    sseEvents.push({ event: 'message', data: { type: 'text', sender: 'auxora', text: "Two sales already — you're ahead of schedule! Before we continue, how would you like me to send you updates?" } });
    sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'notification-settings', cardData: 'notification_preference' } });
    
  } else if (step === 1) {
    // Notification preference → Week 1 prompt
    session.notificationPolicy = userText.toLowerCase().includes('daily') ? 'daily' :
      userText.toLowerCase().includes('passive') ? 'passive' : 'weekly';
    session.subStep = 2;
    
    const policyText = session.notificationPolicy === 'weekly' ? 'weekly reports every Monday' :
      session.notificationPolicy === 'daily' ? 'daily briefings' : 'dashboard only';
    
    sseEvents.push({ event: 'message', data: { type: 'text', sender: 'auxora', text: `Got it — ${policyText}. I'll only break the pattern for emergencies.` } });
    sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'action', cardData: {
      title: 'Week 1 Report Ready', body: 'Full performance report with breakdown.', severity: 'success',
      actions: ['Show Week 1 report']
    } } });
    
  } else if (step === 2) {
    // Week 1 report
    session.subStep = 3;
    sseEvents.push({ event: 'canvas_update', data: { view: 'results-week1' } });
    sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'report', cardData: {
      title: 'WEEK 1 PERFORMANCE', icon: 'chart', badge: 'Week 1',
      kpis: [
        { label: 'Spent', value: '$388', delta: 'on budget', trend: 'neutral' },
        { label: 'Revenue', value: '$1,134', delta: '8 purchases', trend: 'up' },
        { label: 'Return per $1', value: '$2.92', delta: 'profitable!', trend: 'up' },
        { label: 'Cost per Customer', value: '$48.50', delta: 'improving', trend: 'down' }
      ],
      sections: [
        { title: "What's Working", items: [
          'Google Shopping — strongest channel, 5 of 8 purchases',
          'Wagyu Enthusiasts — best audience, $28 per customer',
          '"Sizzle Reel" video — 3.8% click rate, 3 sales'
        ]},
        { title: 'What Needs Adjustment', items: [
          'Organic Buyers audience — spent $94, only 1 sale',
          'Static image ads — underperforming vs video'
        ]},
        { title: 'Bottom Line', items: [
          'For every $1 you spent on ads, you got $2.92 back.',
          'Your ads are profitable from week 1!'
        ]}
      ]
    } } });
    
    effects.push(new Effect(EffectType.MILESTONE_REACHED, {
      type: 'week1_profitable', title: 'Week 1 Profitable', value: 2.92
    }, { source: 'analyzer', clientId: session.clientId, sessionId: session.id }));
    
    sseEvents.push({ event: 'message', data: { type: 'text', sender: 'auxora', text: 'I have 3 recommendations for next week. Ready?' } });
    sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'action', cardData: {
      title: 'Recommendations Ready', body: '3 optimizations for Week 2.', severity: 'success',
      actions: ['Yes, show me']
    } } });
    
  } else if (step === 3) {
    // Rec 1: Invest more in winners
    session.subStep = 4;
    sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'action', cardData: {
      number: 1, total: 3,
      title: 'Invest More in Wagyu Enthusiasts',
      body: 'Best results: $28 per customer, $4.05 return per $1.\nI want to show ads to 30% more people in this group.',
      severity: 'success',
      actions: ['Approve', 'Adjust', 'Skip']
    } } });
    
  } else if (step === 4) {
    // Rec 2: Pause underperformer
    session.subStep = 5;
    sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'action', cardData: {
      number: 2, total: 3,
      title: 'Pause Organic Buyers (for now)',
      body: "Spent $94, only 1 sale. I'll redirect to what's working.",
      severity: 'warning',
      actions: ['Approve', 'Keep running', 'Skip']
    } } });
    
  } else if (step === 5) {
    // Rec 3: New creative
    session.subStep = 6;
    sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'action', cardData: {
      number: 3, total: 3,
      title: 'Create New Video Based on Sizzle Reel',
      body: 'Your Sizzle Reel outperforms everything — 3.8% click rate.\nLet me create a variation to test.',
      severity: 'info',
      actions: ['Approve', 'Skip']
    } } });
    
  } else if (step === 6) {
    // All recs applied → Week 2
    session.subStep = 7;
    
    effects.push(new Effect(EffectType.CARD_APPROVED, {
      title: 'Week 1 Recommendations', count: 3
    }, { source: 'analyzer', clientId: session.clientId, sessionId: session.id }));
    
    sseEvents.push({ event: 'message', data: { type: 'text', sender: 'auxora', text: 'All 3 recommendations applied! Week 2 results:' } });
    sseEvents.push({ event: 'progress_step', data: { step: 2, status: 'complete' } });
    sseEvents.push({ event: 'progress_step', data: { step: 3, status: 'active' } });
    sseEvents.push({ event: 'canvas_update', data: { view: 'results-week1vs2' } });
    sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'report', cardData: {
      title: 'WEEK 2 PERFORMANCE', icon: 'chart', badge: 'Week 2',
      kpis: [
        { label: 'Spent', value: '$412', delta: '+6% vs W1', trend: 'up' },
        { label: 'Revenue', value: '$1,890', delta: '+67% vs W1', trend: 'up' },
        { label: 'Purchases', value: '12', delta: '+50% vs W1', trend: 'up' },
        { label: 'Return per $1', value: '$4.59', delta: '+57% vs W1', trend: 'up' }
      ],
      sections: [
        { title: 'Your Changes Are Working', items: [
          'Wagyu audience doubled: 4 → 8 purchases',
          'Pausing Organic saved $94/week',
          'Sizzle v2: even better click rate'
        ]},
        { title: "What's Next", items: [
          'Learning phase over. Campaigns optimized.',
          'On pace: $8-10K/month from ads.',
          'Ready for Phase 2: Optimization'
        ]}
      ]
    } } });
    
    sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'action', cardData: {
      title: 'Move to Phase 2: Optimization',
      body: 'Budget increase: $390/week → $590/week\nFocus on proven winners\nTest 2 new audiences',
      severity: 'success',
      actions: ["Let's do it", 'Tell me more', 'Stay in Phase 1']
    } } });
    
  } else if (step === 7) {
    // Transition to optimization
    session.stage = 'optimization';
    session.subStep = 0;
    
    effects.push(new Effect(EffectType.PHASE_TRANSITIONED, {
      from: 'test', to: 'optimize', label: 'Optimization'
    }, { source: 'analyzer', clientId: session.clientId, sessionId: session.id }));
    
    sseEvents.push({ event: 'stage', data: { stage: 'optimization', label: 'Optimization' } });
    sseEvents.push({ event: 'progress_step', data: { step: 1, status: 'active' } });
    sseEvents.push({ event: 'tab_switch', data: { tab: 'openclaw' } });
    sseEvents.push({ event: 'canvas_update', data: { view: 'openclaw-dashboard' } });
    sseEvents.push({ event: 'message', data: { type: 'text', sender: 'auxora', text: 'Phase 2 active! Budget: $590/week. OpenClaw monitoring 24/7.' } });
    sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'action', cardData: {
      title: 'Continue to Week 3', body: 'OpenClaw detected something.', severity: 'warning',
      actions: ['Show me']
    } } });
  }
  
  sseEvents.push({ event: 'done', data: {} });
  return { effects, sseEvents };
}

// ============================================================================
// OPTIMIZATION — Alerts, auto-actions, Week 3-4
// ============================================================================

async function handleOptimization(session, userText, context) {
  const effects = [];
  const sseEvents = [];
  const step = session.subStep;
  const lower = userText.toLowerCase();
  
  if (step === 0) {
    // CPA spike alert
    session.subStep = 1;
    
    for (const action of [
      { id: 'oc1', text: 'Analyzing audience performance metrics...', duration: 2000 },
      { id: 'oc2', text: 'Detected anomaly: CPA spike in Health & Wellness...', duration: 1500 },
      { id: 'oc3', text: 'Calculating budget reallocation options...', duration: 2000 },
    ]) {
      sseEvents.push({ event: 'agent_action', data: action });
    }
    
    effects.push(new Effect(EffectType.ALERT_RAISED, {
      severity: 'warning', title: 'CPA Spike Detected',
      metric: 'cpa', oldValue: 34, newValue: 52, change: '+53%',
      audience: 'Health & Wellness'
    }, { source: 'analyzer', clientId: session.clientId, sessionId: session.id }));
    
    sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'alert', cardData: {
      title: 'Cost Per Customer Spiked', severity: 'warning', confidence: '81%',
      body: 'Health & Wellness audience: cost jumped from $34 to $52 (+53%) in 24 hours.',
      cause: 'People are seeing the same ad too many times (8.4 views each). This is "ad fatigue."',
      recommendation: 'Pause this audience and move $60/week to Wagyu Enthusiasts (4.5x return).',
      actions: ['Approve — pause and reallocate', 'Keep running', 'Tell me more']
    } } });
    sseEvents.push({ event: 'canvas_update', data: { view: 'openclaw-alert' } });
    
  } else if (step === 1) {
    if (lower === 'undo' || lower.includes('undo')) {
      sseEvents.push({ event: 'message', data: { type: 'text', sender: 'auxora', text: 'Are you sure? Reverting will re-enable 12 blocked search terms. Estimated cost: ~$45/week wasted.' } });
      sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'action', cardData: {
        title: 'Confirm Undo', body: 'Restore 12 blocked negative keywords.', severity: 'warning',
        actions: ['Yes, undo it', 'Keep them blocked']
      } } });
      sseEvents.push({ event: 'done', data: {} });
      return { effects, sseEvents };
    }
    
    // Alert approved → auto-action
    session.subStep = 2;
    
    effects.push(new Effect(EffectType.CARD_APPROVED, {
      title: 'Pause Health & Wellness + Reallocate'
    }, { source: 'analyzer', clientId: session.clientId, sessionId: session.id }));
    
    sseEvents.push({ event: 'progress_step', data: { step: 1, status: 'complete' } });
    sseEvents.push({ event: 'progress_step', data: { step: 2, status: 'active' } });
    
    for (const action of [
      { id: 'oc4', text: 'Pausing Health & Wellness audience...', duration: 1500 },
      { id: 'oc5', text: 'Reallocating $60/week to Wagyu Enthusiasts...', duration: 1500 },
    ]) {
      sseEvents.push({ event: 'agent_action', data: action });
    }
    
    sseEvents.push({ event: 'message', data: { type: 'text', sender: 'auxora', text: "Done! Here's something OpenClaw did automatically:" } });
    
    effects.push(new Effect(EffectType.AUTO_ACTION_TAKEN, {
      action: 'add_negative_keywords', count: 12,
      reason: 'restaurant-intent searches wasting budget',
      savings: '$45/week'
    }, { source: 'analyzer', clientId: session.clientId, sessionId: session.id }));
    
    sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'auto-action', cardData: {
      title: 'Added 12 Negative Keywords', timestamp: '2:14 PM',
      body: 'Blocked "wagyu restaurant near me" searches — people wanting restaurants, not delivery.',
      impact: 'Estimated savings: ~$45/week',
      policy: 'Pre-authorized (negative keywords)',
      actions: ['View Details', 'Undo']
    } } });
    sseEvents.push({ event: 'canvas_update', data: { view: 'openclaw-actions' } });
    sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'action', cardData: {
      title: 'Week 3 Report Ready', body: 'Results keep improving.', severity: 'success',
      actions: ['Show Week 3 report']
    } } });
    
  } else if (step === 2) {
    // Week 3 report
    session.subStep = 3;
    sseEvents.push({ event: 'progress_step', data: { step: 2, status: 'complete' } });
    sseEvents.push({ event: 'progress_step', data: { step: 3, status: 'active' } });
    sseEvents.push({ event: 'tab_switch', data: { tab: 'results' } });
    sseEvents.push({ event: 'canvas_update', data: { view: 'results-week3' } });
    sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'report', cardData: {
      title: 'WEEK 3 PERFORMANCE', icon: 'chart', badge: 'Week 3',
      kpis: [
        { label: 'Spent', value: '$589', delta: '+43% budget', trend: 'up' },
        { label: 'Revenue', value: '$3,450', delta: '+83% vs W2', trend: 'up' },
        { label: 'Purchases', value: '22', delta: '+83% vs W2', trend: 'up' },
        { label: 'Return per $1', value: '$5.86', delta: '+28% vs W2', trend: 'up' }
      ],
      sections: [
        { title: 'Progress', items: [
          'On pace for $15K/month', '30% toward $50K target',
          'Revenue trend: $1,134 → $1,890 → $3,450'
        ]},
        { title: 'Top Performers', items: [
          'Wagyu Enthusiasts: 14 purchases, $5.92 return',
          'Gift Buyers (new): 5 purchases',
          'Sizzle Reel v2: 4.1% click rate — new best'
        ]}
      ]
    } } });
    sseEvents.push({ event: 'message', data: { type: 'text', sender: 'auxora', text: "$3,450 in one week! Let's see Month 1 final results." } });
    sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'action', cardData: {
      title: 'Month 1 Complete', body: 'Week 4 + Phase 2 milestone ready.', severity: 'success',
      actions: ['Show Month 1 results']
    } } });
    
  } else if (step === 3) {
    // Week 4 + Phase 2 milestone
    session.subStep = 4;
    sseEvents.push({ event: 'progress_step', data: { step: 3, status: 'complete' } });
    sseEvents.push({ event: 'progress_step', data: { step: 4, status: 'active' } });
    sseEvents.push({ event: 'canvas_update', data: { view: 'results-month1' } });
    sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'report', cardData: {
      title: 'WEEK 4 PERFORMANCE', icon: 'chart', badge: 'Week 4',
      kpis: [
        { label: 'Spent', value: '$742', delta: '+26%', trend: 'up' },
        { label: 'Revenue', value: '$5,780', delta: '+68% vs W3', trend: 'up' },
        { label: 'Purchases', value: '35', delta: '+59% vs W3', trend: 'up' },
        { label: 'Return per $1', value: '$7.78', delta: '+33% vs W3', trend: 'up' }
      ],
      sections: [
        { title: 'Month 1 Summary', items: [
          'Total revenue: $12,254', 'Total spend: $2,131',
          'Net profit: $10,123', 'Average return: $5.75 per $1'
        ]},
        { title: 'Best Performers', items: [
          'Wagyu Enthusiasts: 52% of purchases',
          'Cart abandonment retargeting: 12x return',
          'Sizzle Reel v2: consistent 4%+ click rate'
        ]}
      ]
    } } });
    
    effects.push(new Effect(EffectType.MILESTONE_REACHED, {
      type: 'roas', title: 'Phase 2 Target Reached', value: 7.78, target: 3.0,
      summary: 'Exceeded 3.0x target by 159%'
    }, { source: 'analyzer', clientId: session.clientId, sessionId: session.id }));
    
    sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'milestone', cardData: {
      icon: 'trophy', title: 'Phase 2 Target Reached!',
      body: '$7.78 return per $1 — exceeded 3.0x target by 159%!',
      summary: 'Month 1: $12,254 revenue, $2,131 spend, $10,123 profit.',
      sparkline: [2.92, 4.59, 5.86, 7.78],
      actions: ['Scale to Phase 3', 'Stay at current level']
    } } });
    
  } else if (step === 4) {
    // Transition to scaling
    session.stage = 'scaling';
    session.subStep = 0;
    
    effects.push(new Effect(EffectType.PHASE_TRANSITIONED, {
      from: 'optimize', to: 'scale', label: 'Scaling'
    }, { source: 'analyzer', clientId: session.clientId, sessionId: session.id }));
    
    sseEvents.push({ event: 'progress_step', data: { step: 4, status: 'complete' } });
    sseEvents.push({ event: 'stage', data: { stage: 'scaling', label: 'Scaling' } });
    sseEvents.push({ event: 'progress_step', data: { step: 1, status: 'complete' } });
    sseEvents.push({ event: 'progress_step', data: { step: 2, status: 'active' } });
    sseEvents.push({ event: '_reroute', data: { stage: 'scaling' } });
  }
  
  sseEvents.push({ event: 'done', data: {} });
  return { effects, sseEvents };
}

// ============================================================================
// SCALING — Growth to revenue goal
// ============================================================================

async function handleScaling(session, userText, context) {
  const effects = [];
  const sseEvents = [];
  const step = session.subStep;
  
  if (step === 0) {
    session.subStep = 1;
    sseEvents.push({ event: 'tab_switch', data: { tab: 'execution' } });
    sseEvents.push({ event: 'canvas_update', data: { view: 'scaling-plan' } });
    sseEvents.push({ event: 'message', data: { type: 'text', sender: 'auxora', text: 'Phase 3: Time to scale! 3 growth moves:' } });
    sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'action', cardData: {
      number: 1, total: 3, title: 'Scale Budget to $1,500/week',
      body: 'Your 6.08x return justifies higher spend.\nProjected: 60+ purchases, $9K+ revenue weekly.',
      severity: 'success', actions: ['Approve', 'Adjust amount', 'Skip']
    } } });
    
  } else if (step === 1) {
    // Budget scale → TikTok
    session.subStep = 2;
    effects.push(new Effect(EffectType.BUDGET_ADJUSTED, {
      type: 'scale', oldBudget: 590, newBudget: 1500, unit: 'week'
    }, { source: 'analyzer', clientId: session.clientId, sessionId: session.id }));
    
    sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'action', cardData: {
      number: 2, total: 3, title: 'Add TikTok Ads',
      body: 'Video ads perform great — TikTok is natural.\nTest with 10% budget ($150/week).',
      severity: 'info', actions: ['Approve', 'Skip']
    } } });
    
  } else if (step === 2) {
    // TikTok → Email
    session.subStep = 3;
    sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'action', cardData: {
      number: 3, total: 3, title: 'Launch Email Retargeting',
      body: '77 customers. Repeat orders at zero ad cost.\nWelcome series, reorder reminders, new product launches.',
      severity: 'success', actions: ['Approve', 'Skip']
    } } });
    
  } else if (step === 3) {
    // All scaling → Month 2
    session.subStep = 4;
    sseEvents.push({ event: 'progress_step', data: { step: 2, status: 'complete' } });
    sseEvents.push({ event: 'progress_step', data: { step: 3, status: 'active' } });
    sseEvents.push({ event: 'message', data: { type: 'text', sender: 'auxora', text: 'All scaling approved! Month 2 results:' } });
    sseEvents.push({ event: 'tab_switch', data: { tab: 'results' } });
    sseEvents.push({ event: 'canvas_update', data: { view: 'results-month2' } });
    sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'report', cardData: {
      title: 'MONTH 2 PERFORMANCE', icon: 'chart', badge: 'Month 2',
      kpis: [
        { label: 'Revenue', value: '$25,420', delta: '+107% vs M1', trend: 'up' },
        { label: 'Ad Spend', value: '$4,180', delta: 'on budget', trend: 'neutral' },
        { label: 'Return per $1', value: '$6.08', delta: '+6% vs M1', trend: 'up' },
        { label: 'Customers', value: '159', delta: '+82 repeat', trend: 'up' }
      ],
      sections: [
        { title: 'Channel Breakdown', items: [
          'Google: $15,200 (60%) — Search + Shopping dominant',
          'Meta: $7,800 (31%) — Retargeting strongest',
          'Email: $2,100 (8%) — Zero ad cost, pure profit',
          'TikTok: $320 (1%) — Early days'
        ]},
        { title: 'Key Wins', items: [
          'Cost per customer: $48 → $18 (-63%)',
          'Retargeting: 34% of purchases',
          'Email list: 241 subscribers, $2,100/month repeat'
        ]}
      ]
    } } });
    
    effects.push(new Effect(EffectType.MILESTONE_REACHED, {
      type: 'revenue', title: '$25K Monthly Revenue', value: 25420, target: 25000
    }, { source: 'analyzer', clientId: session.clientId, sessionId: session.id }));
    
    sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'milestone', cardData: {
      icon: 'trophy', title: '$25,000 Monthly Revenue!',
      body: '50% toward $50K target.',
      summary: 'M1: $12,254 → M2: $25,420 (+107%)\n159 customers, 82 repeat\nOn track for $50K by Month 4',
      sparkline: [12254, 25420, 38000, 50000],
      actions: ['View Month 3 plan', 'Download report']
    } } });
    
  } else if (step === 4) {
    // Steady state — weekly rhythm
    session.subStep = 5;
    sseEvents.push({ event: 'progress_step', data: { step: 3, status: 'complete' } });
    sseEvents.push({ event: 'progress_step', data: { step: 4, status: 'active' } });
    sseEvents.push({ event: 'message', data: { type: 'text', sender: 'auxora', text: "Here's your ongoing rhythm:" } });
    sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'report', cardData: {
      title: 'YOUR WEEKLY RHYTHM', icon: 'calendar',
      sections: [
        { title: 'Monday Morning', items: ['Weekly report + 2-4 recommendations'] },
        { title: 'Daily', items: ['Quick briefing: spend, revenue, issues', '"Nothing needs attention" on good days'] },
        { title: 'Real-time', items: ['OpenClaw alerts if issues detected', 'Auto-actions for pre-authorized optimizations'] },
        { title: 'Monthly', items: ['Full performance report', 'Milestone celebrations', 'Strategy adjustments'] }
      ]
    } } });
    sseEvents.push({ event: 'message', data: { type: 'text', sender: 'auxora', text: "5 minutes on Monday, approve a few things, go back to your business. That's the Auxora experience." } });
    sseEvents.push({ event: 'progress_step', data: { step: 4, status: 'complete' } });
    sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'milestone', cardData: {
      icon: 'star', title: 'Demo Complete',
      body: "Full Auxora journey: discovery to $25K/month.",
      summary: 'Ready to build the real thing?',
      actions: ['Start over', 'View all results']
    } } });
  }
  
  sseEvents.push({ event: 'done', data: {} });
  return { effects, sseEvents };
}

// Weekly sync placeholder
async function handleWeeklySync(session, userText, context) {
  return { effects: [], sseEvents: [{ event: 'done', data: {} }] };
}

// ============================================================================
// LIVE METRICS — GoMarble Integration
// ============================================================================

/**
 * Fetch live advertising metrics from GoMarble.
 * 
 * Flow:
 * 1. Get account list from GoMarble
 * 2. Fetch last 7 days of campaign-level insights
 * 3. Process and structure data for optimizer
 * 
 * @param {string} clientId - Client identifier
 * @returns {Promise<Object|null>} Structured metrics or null if unavailable
 */
async function fetchLiveMetrics(clientId) {
  try {
    const gomarble = getGoMarbleClient();
    
    // Step 1: Get Facebook accounts
    const accountsResponse = await gomarble.listFacebookAccounts();
    const accounts = processAccountData('facebook', accountsResponse.data);
    
    if (!accounts || accounts.length === 0) {
      console.warn('[AnalyzerModule] No Facebook accounts found');
      return null;
    }
    
    // Use first active account (or client-specific mapping in production)
    const primaryAccount = accounts.find(a => a.status === 'active') || accounts[0];
    console.log(`[AnalyzerModule] Using account: ${primaryAccount.name} (${primaryAccount.id})`);
    
    // Step 2: Fetch last 7 days campaign insights
    const insightsResponse = await gomarble.getFacebookInsights(primaryAccount.id, {
      level: 'campaign',
      date_preset: 'last_7d',
      fields: 'campaign_name,spend,impressions,clicks,ctr,cpm,cpc,purchase_roas,purchases,reach,frequency',
      limit: 100,
    });
    
    const { campaigns, summary } = processCampaignData(
      'facebook',
      primaryAccount.id,
      insightsResponse.data
    );
    
    // Step 3: Structure metrics for optimizer
    const metrics = {
      clientId,
      platform: 'facebook',
      accountId: primaryAccount.id,
      accountName: primaryAccount.name,
      period: 'last_7d',
      fetchedAt: new Date().toISOString(),
      _mock: insightsResponse._mock || false,
      
      // Summary metrics
      totalSpend: summary.totalSpend,
      totalRevenue: summary.totalRevenue,
      totalProfit: summary.totalProfit,
      avgRoas: summary.avgRoas,
      avgCtr: summary.avgCtr,
      avgCpm: summary.avgCpm,
      
      // Campaign breakdown
      campaigns: campaigns.map(c => ({
        name: c.name,
        spend: c.spend,
        revenue: c.revenue,
        profit: c.profit,
        roas: c.roas,
        impressions: c.impressions,
        clicks: c.clicks,
        ctr: c.ctr,
        cpm: c.cpm,
      })),
      
      // Top performers
      topCampaigns: getTopPerformers(campaigns, 'roas', 5),
      
      // Health flags
      alerts: generateAlerts(campaigns, summary),
    };
    
    console.log(`[AnalyzerModule] Fetched metrics: ${campaigns.length} campaigns, $${summary.totalSpend.toFixed(2)} spend, ${summary.avgRoas.toFixed(2)}x ROAS`);
    
    return metrics;
    
  } catch (error) {
    console.error('[AnalyzerModule] Failed to fetch live metrics:', error.message);
    return null;
  }
}

/**
 * Generate alert flags from campaign data.
 * @private
 */
function generateAlerts(campaigns, summary) {
  const alerts = [];
  
  // Alert: High spend, low ROAS
  const poorPerformers = campaigns.filter(c => c.spend > 100 && c.roas < 1.0);
  if (poorPerformers.length > 0) {
    alerts.push({
      severity: 'warning',
      type: 'low_roas',
      title: 'Low ROAS Campaigns Detected',
      campaigns: poorPerformers.map(c => c.name),
      count: poorPerformers.length,
    });
  }
  
  // Alert: Very high CPM (potential ad fatigue)
  const highCpmCampaigns = campaigns.filter(c => c.cpm > 50);
  if (highCpmCampaigns.length > 0) {
    alerts.push({
      severity: 'info',
      type: 'high_cpm',
      title: 'High CPM Detected',
      campaigns: highCpmCampaigns.map(c => c.name),
      count: highCpmCampaigns.length,
    });
  }
  
  // Alert: Overall profitability
  if (summary.totalProfit < 0) {
    alerts.push({
      severity: 'critical',
      type: 'negative_profit',
      title: 'Campaigns Running at Loss',
      profit: summary.totalProfit,
    });
  }
  
  return alerts;
}

module.exports = analyzerModule;
