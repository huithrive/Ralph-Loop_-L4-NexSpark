/**
 * Auxora V3 Demo Data
 * Chat-first conversational interface — entire agency experience in one message thread
 * Reuses V2 numeric data (YamaBushi Farms) restructured for card format
 */

var auxoraV3 = {

  brand: {
    name: 'Auxora',
    tagline: 'Your AI Growth Team',
    client: 'Len Chen',
    company: 'YamaBushi Farms',
    industry: 'Premium A5 Japanese Wagyu',
    website: 'yamabushifarms.com'
  },

  stages: [
    { id: 'discovery', label: 'Discovery', short: 'Disc', order: 1 },
    { id: 'report-gen', label: 'Report Generation', short: 'Rpt', order: 2 },
    { id: 'strategy', label: 'Strategy', short: 'Strat', order: 3 },
    { id: 'competitor-research', label: 'Competitor Research', short: 'Comp', order: 4 },
    { id: 'execution-setup', label: 'Execution Setup', short: 'Setup', order: 5 },
    { id: 'campaign-planning', label: 'Campaign Planning', short: 'Plan', order: 5 },
    { id: 'launch', label: 'Launch', short: 'Launch', order: 6 },
    { id: 'monitoring', label: 'Monitoring', short: 'Mon', order: 7 },
    { id: 'weekly-sync', label: 'Weekly Sync', short: 'Sync', order: 8 },
    { id: 'optimization', label: 'Optimization', short: 'Opt', order: 9 },
    { id: 'scaling', label: 'Scaling', short: 'Scale', order: 10 }
  ],

  stepperConfigs: {
    'discovery': { steps: ['Enter URL', 'Research', 'Interview', 'GTM Report'] },
    'competitor-research': { steps: ['Research'] },
    'execution-setup': { steps: ['Store', 'Meta', 'Google', 'Tracking'] },
    'campaign-planning': { steps: ['Budget', 'Channels', 'Objective', 'Structure', 'Audiences', 'Allocation', 'Creatives', 'Review'] },
    'launch': { steps: ['Create', 'Submit', 'Verify', 'Live'] },
    'monitoring': { steps: ['48h Check', 'Week 1', 'Week 2', 'Phase 2'] },
    'optimization': { steps: ['Analyze', 'Recommend', 'Adjust', 'Scale'] },
    'scaling': { steps: ['Phase 1', 'Phase 2', 'Phase 3', 'Goal'] }
  },

  landing: {
    headline: 'Your AI Growth Team',
    subheadline: 'From strategy to execution — we help D2C brands grow revenue with certainty through AI-driven paid advertising.',
    features: [
      { title: 'Strategy', desc: 'AI research & GTM plan tailored to your brand, competitors, and market.' },
      { title: 'Execute', desc: 'Launch ads on Meta + Google. Campaigns built & managed for you.' },
      { title: 'Optimize', desc: '24/7 AI monitoring & scaling. OpenClaw never sleeps.' }
    ],
    testimonial: {
      quote: 'Auxora grew our revenue from $50K to $180K in 4 months. It\'s like having a full agency team for $20/month.',
      author: 'Len Chen',
      company: 'YamaBushi Farms'
    },
    pricing: [
      { tier: 'GTM Report', price: '$1.99', period: 'one-time', features: ['Market analysis', 'Competitor data', 'Strategy plan', 'Audience segments'], cta: 'Get Report', primary: false },
      { tier: 'Full Service', price: '$20', period: '/mo + ad spend', features: ['Everything in Report', 'Campaign management', 'Weekly reports', '24/7 OpenClaw AI', 'Creative recommendations'], cta: 'Start Trial', primary: true },
      { tier: 'Enterprise', price: 'Custom', period: '', features: ['Custom SLAs', 'Dedicated account', 'Multi-brand support', 'API access'], cta: 'Talk to Us', primary: false }
    ]
  },

  conversation: [
    // ─── STAGE 1: DISCOVERY ───────────────────────────

    { id: 1, stage: 'discovery', type: 'text', sender: 'auxora', delay: 800,
      text: 'Hi! I\'m Auxora, your AI growth partner. I help D2C brands grow revenue through paid advertising on Meta and Google.' },

    { id: 2, stage: 'discovery', type: 'text', sender: 'auxora', delay: 1200,
      text: 'Let me learn about your business so I can create a personalized growth strategy.' },

    { id: 3, stage: 'discovery', type: 'card', sender: 'auxora', delay: 1000,
      cardType: 'question', cardData: 'q_website' },

    { id: 4, stage: 'discovery', type: 'text', sender: 'user', delay: 1500,
      text: 'yamabushifarms.com' },

    { id: 5, stage: 'discovery', type: 'text', sender: 'auxora', delay: 800,
      text: 'Great! A premium Wagyu brand. Let me ask a few more questions.' },

    { id: 6, stage: 'discovery', type: 'card', sender: 'auxora', delay: 1000,
      cardType: 'question', cardData: 'q_product' },

    { id: 7, stage: 'discovery', type: 'text', sender: 'user', delay: 1500,
      text: 'Premium A5 Japanese Wagyu beef, direct to consumer' },

    { id: 8, stage: 'discovery', type: 'card', sender: 'auxora', delay: 1000,
      cardType: 'question', cardData: 'q_revenue' },

    { id: 9, stage: 'discovery', type: 'text', sender: 'user', delay: 1500,
      text: '$50,000/month' },

    { id: 10, stage: 'discovery', type: 'card', sender: 'auxora', delay: 1000,
      cardType: 'question', cardData: 'q_goal' },

    { id: 11, stage: 'discovery', type: 'text', sender: 'user', delay: 1500,
      text: '$250,000/month in 6 months' },

    { id: 12, stage: 'discovery', type: 'card', sender: 'auxora', delay: 1000,
      cardType: 'question', cardData: 'q_budget' },

    { id: 13, stage: 'discovery', type: 'text', sender: 'user', delay: 1500,
      text: '$5K - $20K' },

    { id: 14, stage: 'discovery', type: 'text', sender: 'auxora', delay: 800,
      text: 'Perfect. I have everything I need. Let me research your market now.' },

    { id: 15, stage: 'discovery', type: 'card', sender: 'auxora', delay: 1200,
      cardType: 'progress', cardData: 'research_progress' },

    { id: 16, stage: 'discovery', type: 'text', sender: 'auxora', delay: 2000,
      text: 'Your growth strategy is ready!' },

    { id: 17, stage: 'discovery', type: 'card', sender: 'auxora', delay: 800,
      cardType: 'report', cardData: 'gtm_report',
      buttons: [
        { label: 'View Full Report', action: 'slide-over', value: 'gtm_report' },
        { label: 'Yes, let\'s go', action: 'advance', value: 'strategy' }
      ]
    },

    // ─── STAGE 2: STRATEGY ───────────────────────────

    { id: 18, stage: 'strategy', type: 'stage-gate', delay: 500,
      text: 'Strategy' },

    { id: 19, stage: 'strategy', type: 'text', sender: 'auxora', delay: 1000,
      text: 'Let\'s align on the key decisions. I\'ll walk you through each one.' },

    { id: 20, stage: 'strategy', type: 'card', sender: 'auxora', delay: 1200,
      cardType: 'action', cardData: 'decision_revenue' },

    { id: 21, stage: 'strategy', type: 'text', sender: 'user', delay: 1500,
      text: 'Confirmed' },

    { id: 22, stage: 'strategy', type: 'card', sender: 'auxora', delay: 1200,
      cardType: 'action', cardData: 'decision_roas' },

    { id: 23, stage: 'strategy', type: 'text', sender: 'user', delay: 1500,
      text: 'Confirmed' },

    { id: 24, stage: 'strategy', type: 'card', sender: 'auxora', delay: 1200,
      cardType: 'action', cardData: 'decision_channels' },

    { id: 25, stage: 'strategy', type: 'text', sender: 'user', delay: 1500,
      text: 'Confirmed' },

    { id: 26, stage: 'strategy', type: 'card', sender: 'auxora', delay: 1200,
      cardType: 'action', cardData: 'decision_budget' },

    { id: 27, stage: 'strategy', type: 'text', sender: 'user', delay: 1500,
      text: 'Confirmed' },

    { id: 28, stage: 'strategy', type: 'card', sender: 'auxora', delay: 1200,
      cardType: 'action', cardData: 'decision_audiences' },

    { id: 29, stage: 'strategy', type: 'text', sender: 'user', delay: 1500,
      text: 'Confirmed' },

    { id: 30, stage: 'strategy', type: 'card', sender: 'auxora', delay: 1000,
      cardType: 'milestone', cardData: 'strategy_confirmed' },

    // ─── STAGE 3: CONTRACT ───────────────────────────

    { id: 31, stage: 'contract', type: 'stage-gate', delay: 500,
      text: 'Contract' },

    { id: 32, stage: 'contract', type: 'text', sender: 'auxora', delay: 1000,
      text: 'Here\'s how our partnership works. I\'ll explain each term simply.' },

    { id: 33, stage: 'contract', type: 'card', sender: 'auxora', delay: 1200,
      cardType: 'agreement', cardData: 'service_agreement' },

    { id: 34, stage: 'contract', type: 'text', sender: 'user', delay: 2000,
      text: 'I agree — let\'s start!' },

    { id: 35, stage: 'contract', type: 'text', sender: 'auxora', delay: 800,
      text: 'Welcome aboard! Let\'s get your accounts connected.' },

    // ─── STAGE 4: EXECUTION ──────────────────────────

    { id: 36, stage: 'execution', type: 'stage-gate', delay: 500,
      text: 'Execution' },

    { id: 37, stage: 'execution', type: 'text', sender: 'auxora', delay: 1000,
      text: 'I\'ll walk you through connecting each account. This takes about 5 minutes.' },

    { id: 38, stage: 'execution', type: 'card', sender: 'auxora', delay: 1200,
      cardType: 'checklist', cardData: 'account_setup' },

    { id: 39, stage: 'execution', type: 'text', sender: 'user', delay: 2000,
      text: 'All accounts connected!' },

    { id: 40, stage: 'execution', type: 'text', sender: 'auxora', delay: 800,
      text: 'Everything\'s connected! I\'m now setting up your first campaigns.' },

    { id: 41, stage: 'execution', type: 'card', sender: 'auxora', delay: 1500,
      cardType: 'checklist', cardData: 'launch_checklist' },

    { id: 42, stage: 'execution', type: 'text', sender: 'auxora', delay: 1500,
      text: 'Your Meta campaigns are live! I\'ll monitor everything and send your first performance update in 48 hours.' },

    { id: 43, stage: 'execution', type: 'card', sender: 'auxora', delay: 1000,
      cardType: 'milestone', cardData: 'campaigns_live' },

    { id: 44, stage: 'execution', type: 'text', sender: 'user', delay: 1500,
      text: 'Let\'s go!' },

    { id: 45, stage: 'execution', type: 'text', sender: 'auxora', delay: 800,
      text: 'I\'ll keep you posted. OpenClaw is now monitoring 24/7.' },

    // ─── STAGE 5: WEEKLY SYNC ────────────────────────

    { id: 46, stage: 'weekly-sync', type: 'stage-gate', delay: 500,
      text: 'Weekly Sync' },

    { id: 47, stage: 'weekly-sync', type: 'text', sender: 'auxora', delay: 1000,
      text: 'Good morning! Here\'s your Week 3 performance report.' },

    { id: 48, stage: 'weekly-sync', type: 'card', sender: 'auxora', delay: 1500,
      cardType: 'report', cardData: 'weekly_report',
      buttons: [
        { label: 'View Full Report', action: 'slide-over', value: 'weekly_report' }
      ]
    },

    { id: 49, stage: 'weekly-sync', type: 'text', sender: 'auxora', delay: 1200,
      text: 'Based on this data, here are my recommendations for next week:' },

    { id: 50, stage: 'weekly-sync', type: 'card', sender: 'auxora', delay: 1200,
      cardType: 'action', cardData: 'rec_scale_vitamins' },

    { id: 51, stage: 'weekly-sync', type: 'text', sender: 'user', delay: 1500,
      text: 'Approved' },

    { id: 52, stage: 'weekly-sync', type: 'card', sender: 'auxora', delay: 1200,
      cardType: 'action', cardData: 'rec_pause_broad' },

    { id: 53, stage: 'weekly-sync', type: 'text', sender: 'user', delay: 1500,
      text: 'Approved' },

    { id: 54, stage: 'weekly-sync', type: 'card', sender: 'auxora', delay: 1200,
      cardType: 'action', cardData: 'rec_video_test' },

    { id: 55, stage: 'weekly-sync', type: 'text', sender: 'user', delay: 1500,
      text: 'Approved' },

    // ─── STAGE 6: OPTIMIZATION ───────────────────────

    { id: 56, stage: 'optimization', type: 'stage-gate', delay: 500,
      text: 'Optimization' },

    { id: 57, stage: 'optimization', type: 'text', sender: 'auxora', delay: 1000,
      text: 'Heads up — I detected an issue.' },

    { id: 58, stage: 'optimization', type: 'card', sender: 'auxora', delay: 1200,
      cardType: 'alert', cardData: 'cpa_spike' },

    { id: 59, stage: 'optimization', type: 'text', sender: 'user', delay: 1500,
      text: 'Approved — pause and reallocate' },

    { id: 60, stage: 'optimization', type: 'card', sender: 'auxora', delay: 1000,
      cardType: 'auto-action', cardData: 'neg_keywords' },

    { id: 61, stage: 'optimization', type: 'text', sender: 'auxora', delay: 1200,
      text: 'Good morning! Quick update:' },

    { id: 62, stage: 'optimization', type: 'card', sender: 'auxora', delay: 1200,
      cardType: 'report', cardData: 'daily_briefing' },

    { id: 63, stage: 'optimization', type: 'text', sender: 'auxora', delay: 1500,
      text: 'We just hit a major milestone!' },

    { id: 64, stage: 'optimization', type: 'card', sender: 'auxora', delay: 1000,
      cardType: 'milestone', cardData: 'roas_target' }
  ],

  cards: {
    // ─── QUESTION CARDS ──────────────────────────────
    q_website: {
      question: 'What\'s your brand\'s website?',
      inputType: 'text',
      placeholder: 'https://yourbrand.com'
    },
    q_product: {
      question: 'What do you sell?',
      inputType: 'chips',
      options: ['Supplements', 'Fashion', 'Beauty', 'Food', 'Home', 'Other']
    },
    q_revenue: {
      question: 'What\'s your current monthly revenue?',
      inputType: 'chips',
      options: ['< $10K', '$10K - $50K', '$50K - $100K', '$100K+']
    },
    q_goal: {
      question: 'What\'s your revenue goal for the next 6 months?',
      inputType: 'text',
      placeholder: 'e.g. $250,000/month'
    },
    q_budget: {
      question: 'What\'s your monthly advertising budget?',
      inputType: 'chips',
      options: ['< $1K', '$1K - $5K', '$5K - $20K', '$20K+']
    },
    q_platform: {
      question: 'What platform is your store on?',
      inputType: 'chips',
      options: ['Shopify', 'WooCommerce', 'BigCommerce', 'Other']
    },

    // ─── PROGRESS CARD ───────────────────────────────
    research_progress: {
      title: 'Researching Your Market',
      steps: [
        { text: 'Analyzing yamabushifarms.com', status: 'done' },
        { text: 'Researching premium beef market', status: 'done' },
        { text: 'Identifying competitors', status: 'done' },
        { text: 'Building audience segments', status: 'done' },
        { text: 'Calculating channel strategy', status: 'done' },
        { text: 'Generating 6-month roadmap', status: 'done' }
      ],
      progress: 100
    },

    // ─── REPORT CARDS ────────────────────────────────
    gtm_report: {
      title: 'YAMABUSHI FARMS — GROWTH STRATEGY',
      icon: 'chart',
      summary: 'The premium beef market is $7.2B with 8.3% CAGR. Your top 3 competitors spend $20K-$80K/mo on ads. DTC premium food is rising 23% YoY.',
      kpis: [
        { label: 'Market Size', value: '$7.2B', delta: '8.3% CAGR', trend: 'up' },
        { label: 'Competitors', value: '3', delta: '$20-80K/mo spend', trend: 'neutral' },
        { label: 'Addressable', value: '15.7M', delta: '3 segments', trend: 'up' },
        { label: 'Target ROAS', value: '3.0x', delta: '6 months', trend: 'up' }
      ],
      sections: [
        { title: 'Recommended Strategy', items: [
          'Meta Ads (30%) — Awareness + Retarget',
          'Google Ads (70%) — Search + Shopping',
          '3-stage budget: Seed > Ramp > Scale'
        ]},
        { title: 'Top Audiences', items: [
          'Wagyu Enthusiasts — 2.4M addressable, 35-55, $120K+',
          'Health-Conscious Foodies — 5.1M, 28-45, $85K+',
          'Gift Buyers — 8.2M seasonal, 30-60, $100K+'
        ]},
        { title: 'Revenue Projection', items: [
          'Month 1: $65K (Seed phase, ROAS 1.5-2.0x)',
          'Month 3: $120K (Ramp phase, ROAS 2.5-3.0x)',
          'Month 6: $250K (Scale phase, ROAS 3.0-4.5x)'
        ]}
      ],
      sparkline: [50, 55, 65, 80, 100, 120, 150, 180, 210, 250]
    },

    weekly_report: {
      title: 'WEEK 3 PERFORMANCE',
      icon: 'chart',
      badge: 'Oct 21-27',
      kpis: [
        { label: 'Spend', value: '$178.92', delta: '+12%', trend: 'up' },
        { label: 'Sales', value: '6', delta: '+25%', trend: 'up' },
        { label: 'CPA', value: '$29.82', delta: '-8%', trend: 'down' },
        { label: 'ROAS', value: '1.99x', delta: '+15%', trend: 'up' }
      ],
      sections: [
        { title: 'By Channel', items: [
          'Meta: $107 spend | 4 purchases | ROAS 1.85x',
          'Google: $72 spend | 2 purchases | ROAS 2.15x'
        ]},
        { title: 'What Worked', items: [
          'Vitamin audience: ROAS 1.85x (up from 1.52x)',
          'Sizzle Video creative: CTR 3.1%',
          'Meta CPM decreased 18%'
        ]},
        { title: 'Needs Attention', items: [
          'Organic audience: ROAS 0.73 (still underperforming)',
          'Farm Carousel: CTR 1.8% (below benchmark)',
          'Google broad match: high CPC on generic terms'
        ]}
      ]
    },

    daily_briefing: {
      title: 'DAILY BRIEFING',
      icon: 'sun',
      badge: 'Tuesday, Nov 5',
      kpis: [
        { label: 'Spend', value: '$24.28', delta: 'on track', trend: 'neutral' },
        { label: 'Revenue', value: '$189.00', delta: 'ROAS 7.78x', trend: 'up' },
        { label: 'Purchases', value: '3', delta: 'today', trend: 'up' }
      ],
      sections: [
        { title: 'Heartbeat Status', items: [
          'Status: Healthy',
          'Last check: 8 min ago | Next: 22 min',
          'Active alerts: 0 | Actions today: 1'
        ]},
        { title: 'Weekly Progress', items: [
          'Budget: 75% of weekly spend used',
          'Goal: 12 purchases | Current: 9',
          'Nothing needs your attention right now.'
        ]}
      ]
    },

    // ─── ENHANCED MONITORING CARDS ────────────────────
    daily_briefing_enhanced: {
      title: 'DAILY BRIEFING',
      icon: 'sun',
      badge: 'Tuesday, Nov 5',
      positiveFirst: true,
      kpis: [
        { label: 'Revenue Today', value: '$189.00', delta: '3 purchases', trend: 'up' },
        { label: 'Total This Week', value: '$567', delta: '9 of 12 goal', trend: 'up' },
        { label: 'Today\'s Spend', value: '$24.28', delta: 'on track', trend: 'neutral' }
      ],
      spendTracker: {
        budget: 390,
        days: [
          { day: 'Mon', spent: 56, budget: 56 },
          { day: 'Tue', spent: 24, budget: 56 },
          { day: 'Wed', spent: 0, budget: 56 },
          { day: 'Thu', spent: 0, budget: 56 },
          { day: 'Fri', spent: 0, budget: 56 },
          { day: 'Sat', spent: 0, budget: 56 },
          { day: 'Sun', spent: 0, budget: 56 }
        ]
      },
      sections: [
        { title: 'Wins', items: [
          '3 purchases today \u2014 your best day this week!',
          'Sizzle Reel video driving 40% of clicks',
          'Wagyu Enthusiasts audience converting at $28/customer'
        ]},
        { title: 'Status', items: [
          'All campaigns healthy. OpenClaw checked 8 min ago.',
          'Nothing needs your attention today.'
        ]}
      ]
    },
    notification_preference: {
      title: 'How often should I update you?',
      subtitle: 'After 48 hours of data, you can choose your notification style:',
      tiers: [
        { id: 'passive', label: 'Dashboard Only', icon: 'eye', desc: 'Check your dashboard anytime \u2014 I won\'t send alerts unless something is truly critical.', recommended: false },
        { id: 'weekly', label: 'Weekly Report', icon: 'calendar', desc: 'One report every Monday morning. Plus emergency alerts only (max 1/day).', recommended: true },
        { id: 'daily', label: 'Daily Briefing', icon: 'sun', desc: 'Quick morning update with spend, revenue, and any issues. Plus emergency alerts.', recommended: false }
      ],
      emergencyNote: 'Emergency alerts are always on for: ROAS < 0.2, tracking breaks, budget 200%+ overspend. Max 1 alert per day.',
      actions: ['Weekly Report (recommended)', 'Dashboard Only', 'Daily Briefing']
    },
    learning_phase_expectations: {
      title: 'WHAT TO EXPECT',
      icon: 'calendar',
      sections: [
        { title: 'Week 1 = Learning Period', items: [
          'Facebook and Google are figuring out who to show your ads to.',
          'Results will be inconsistent \u2014 that\'s completely normal.',
          'I will NOT send you alerts this week unless something breaks.',
          'Think of it like a new employee\'s first week \u2014 they need time to ramp up.'
        ]},
        { title: 'My Alert Schedule', items: [
          'Days 1-7: Almost zero alerts. Dashboard always available if you want to check.',
          'Day 8+: Weekly report every Monday morning.',
          'Emergency only: ROAS drops below 0.2x, tracking breaks, or budget 200%+ overspend.',
          'Maximum 1 alert per day \u2014 I won\'t spam you.'
        ]},
        { title: 'Things You DON\'T Need To Do', items: [
          'Don\'t check Meta or Google yourself \u2014 I monitor everything',
          'Don\'t worry about daily fluctuations \u2014 early swings are normal',
          'Don\'t change anything \u2014 let the platforms learn'
        ]}
      ]
    },

    // ─── ACTION CARDS (STRATEGY DECISIONS) ───────────
    decision_revenue: {
      number: 1,
      total: 5,
      title: 'Revenue Target',
      body: 'Goal: $250,000/month by month 6\nCurrent: $50,000/month\nGrowth needed: 5x',
      detail: 'This is ambitious but achievable based on your market size and competitor benchmarks.',
      severity: 'info',
      actions: ['Confirm', 'Adjust target', 'Skip']
    },
    decision_roas: {
      number: 2,
      total: 5,
      title: 'ROAS Target',
      body: 'Blended ROAS target: 3.0x by month 6\nMonth 1 expected: 1.5-2.0x\nMonth 3 expected: 2.5-3.0x',
      detail: 'Conservative ramp accounts for learning phase. Most brands hit 2x+ by week 5.',
      severity: 'info',
      actions: ['Confirm', 'Adjust target', 'Skip']
    },
    decision_channels: {
      number: 3,
      total: 5,
      title: 'Channel Mix',
      body: 'Google Ads: 70% of budget\nMeta Ads: 30% of budget',
      detail: 'Google captures high-intent search traffic. Meta builds awareness and retargets. Your product is highly searchable.',
      severity: 'info',
      actions: ['Confirm', 'Adjust split', 'Skip']
    },
    decision_budget: {
      number: 4,
      total: 5,
      title: 'Budget Plan',
      body: '$13,000 total over 31 days, 3 phases:\nPhase 1 (10d): $3,900 — Data collection\nPhase 2 (15d): $6,240 — Optimization\nPhase 3 (6d): $2,860 — Scale & profit',
      detail: 'Front-loading spend accelerates learning. Phase 3 focuses budget on proven winners only.',
      severity: 'info',
      actions: ['Confirm', 'Adjust budget', 'Skip']
    },
    decision_audiences: {
      number: 5,
      total: 5,
      title: 'Priority Audiences',
      body: '1. Wagyu Enthusiasts — 2.4M, highest intent\n2. Vitamin & Supplement Shoppers — 4.2M\n3. Organic Product Buyers — 6.1M\n4. Luxury Gift Shoppers — 3.5M (seasonal)',
      detail: 'Audiences ranked by expected ROAS. We\'ll test all 4 and double down on winners by Phase 2.',
      severity: 'info',
      actions: ['Confirm', 'Edit audiences', 'Skip']
    },

    // ─── ACTION CARDS (WEEKLY RECOMMENDATIONS) ───────
    rec_scale_vitamins: {
      number: 1,
      total: 3,
      title: 'Scale Vitamin Audience +30%',
      body: 'This audience has ROAS 1.85x and room to scale.\nEstimated impact: +4 purchases/week',
      severity: 'success',
      actions: ['Approve', 'Adjust', 'Skip']
    },
    rec_pause_broad: {
      number: 2,
      total: 3,
      title: 'Pause Broad Audience',
      body: 'Organic audience ROAS at 0.73x after 3 weeks.\nSave $68/week and reallocate to winners.',
      severity: 'warning',
      actions: ['Approve', 'Keep Running', 'Skip']
    },
    rec_video_test: {
      number: 3,
      total: 3,
      title: 'Create Sizzle Video v2',
      body: 'Original Sizzle Video has 3.1% CTR — our best performer.\nTest a derivative to find even higher engagement.',
      severity: 'info',
      actions: ['Approve', 'Skip']
    },

    // ─── CHECKLIST CARDS ─────────────────────────────
    account_setup: {
      title: 'ACCOUNT SETUP',
      items: [
        { text: 'Meta Business Manager', status: 'done', detail: 'Connected — BM verified' },
        { text: 'Shopify Store', status: 'done', detail: 'Connected — 5 products synced' },
        { text: 'Google Ads', status: 'done', detail: 'Connected — Account verified' },
        { text: 'Google Analytics', status: 'done', detail: 'Connected — GA4 property linked' }
      ],
      actions: ['I\'ve done it', 'Help me', 'Later']
    },
    launch_checklist: {
      title: 'LAUNCH CHECKLIST',
      items: [
        { text: 'Meta Pixel installed and verified', status: 'done', detail: '95% event match rate' },
        { text: 'Google conversion tracking active', status: 'done', detail: '3 conversion actions' },
        { text: 'UTM parameters configured', status: 'done', detail: 'All campaigns tagged' },
        { text: 'Audience segments created', status: 'done', detail: '4 segments ready' },
        { text: 'Ad creatives uploaded', status: 'done', detail: '6 variants (3 video, 3 image)' },
        { text: 'Campaign review', status: 'done', detail: 'Meta approved' },
        { text: 'Google campaigns', status: 'done', detail: 'Live tomorrow 9am' }
      ]
    },

    // ─── ALERT CARD ──────────────────────────────────
    cpa_spike: {
      title: 'CPA Spike Detected',
      severity: 'warning',
      confidence: '81%',
      body: '"Health & Wellness" audience CPA jumped from $34 to $52 (+53%) in the last 24h.',
      cause: 'Creative fatigue — CTR dropped while frequency increased 2.1x over 7 days.',
      recommendation: 'Pause this audience and reallocate $60/week to Supplements audience (ROAS 1.85x).',
      actions: ['Approve', 'Keep Running', 'Tell Me More']
    },

    // ─── AUTO-ACTION CARD ────────────────────────────
    neg_keywords: {
      title: 'Added 12 Negative Keywords',
      timestamp: '2:14 PM',
      body: 'Automatically added 12 negative keywords to your Google Search campaign based on today\'s search term report.',
      impact: 'Est. savings: $45/week',
      policy: 'Pre-authorized (negative keywords)',
      actions: ['View Details', 'Undo']
    },

    // ─── AGREEMENT CARD ──────────────────────────────
    service_agreement: {
      title: 'SERVICE AGREEMENT',
      sections: [
        { heading: 'Trial Period', text: '14 days free. Cancel anytime, no questions.' },
        { heading: 'Monthly Fee', text: '$500/month retainer + 5-10% of ad spend' },
        { heading: 'What You Get', items: [
          'Full campaign management (Meta + Google)',
          'Weekly performance reports',
          '24/7 AI optimization (OpenClaw)',
          'Creative recommendations',
          'Strategy adjustments'
        ]},
        { heading: 'What We Need', items: [
          'Access to ad accounts',
          'Creative assets (photos/videos)',
          'Response to weekly check-ins'
        ]},
        { heading: 'Cancellation', text: '30 days notice. No lock-in after trial.' }
      ],
      actions: ['I agree — Start my trial', 'I have questions']
    },

    // ─── MILESTONE CARDS ─────────────────────────────
    strategy_confirmed: {
      icon: 'trophy',
      title: 'Strategy Confirmed!',
      body: 'All 5 decisions aligned.',
      summary: 'Target: $250K/mo | ROAS: 3.0x | Google 70% / Meta 30% | 3-stage budget | 4 audiences',
      actions: ['Review Agreement']
    },
    campaigns_live: {
      icon: 'rocket',
      title: 'Campaigns Are Live!',
      body: 'Meta campaigns active. Google launching tomorrow. Budget: $390/week.',
      summary: 'Stage 1: Data Collection — Phase 1 of 3\nMeta 30% ($117/wk) | Google 70% ($273/wk)',
      sparkline: [0, 2, 5, 12, 20, 35, 50]
    },
    roas_target: {
      icon: 'trophy',
      title: 'ROAS Target Reached!',
      body: 'Your blended ROAS hit 7.78x this week — up from 1.95x when we started 5 weeks ago.',
      summary: 'Week 5: $945 revenue on $121 spend. 12 purchases — more than Weeks 1-2 combined!',
      sparkline: [1.95, 1.57, 1.99, 1.99, 7.78],
      actions: ['Scale to $5K/mo', 'Stay current']
    },

    // ─── ACT 1: SETUP & CONNECT ─────────────────────
    connect_shopify: {
      title: 'Connect Shopify',
      platform: 'shopify',
      description: 'I\'ll only read your products and orders — I can\'t change anything.',
      permissions: {
        will: ['Product catalog', 'Order history', 'Customer data'],
        wont: ['Store settings', 'Payment processing', 'Theme files']
      },
      actions: ['Connect Shopify Securely']
    },
    shopify_connected: {
      title: 'Shopify Connected',
      steps: [
        { text: 'Logging into Shopify', status: 'done' },
        { text: 'Reading product catalog', status: 'done' },
        { text: 'Syncing order history', status: 'done' },
        { text: 'Setting up tracking hooks', status: 'done' }
      ],
      summary: '5 products synced'
    },
    connect_meta: {
      title: 'Connect Meta (Facebook/Instagram)',
      platform: 'meta',
      description: 'I\'ll manage your ad campaigns and read performance data.',
      permissions: {
        will: ['Create & manage ad campaigns', 'Read ad performance', 'Manage audiences'],
        wont: ['Post to your pages', 'Access messages', 'Change page settings']
      },
      actions: ['Connect Meta Securely']
    },
    connect_google: {
      title: 'Connect Google Ads',
      platform: 'google',
      description: 'I\'ll create and manage search & shopping campaigns for you.',
      permissions: {
        will: ['Create & manage campaigns', 'Set budgets & bids', 'Read performance data'],
        wont: ['Access Gmail', 'Change account settings', 'Access other Google services']
      },
      actions: ['Connect Google Securely', 'I don\'t have Google Ads', 'Help me']
    },
    install_tracking: {
      title: 'Install Website Tracking',
      body: 'I\'ll add tracking code from Meta and Google to your Shopify store. This is how I measure which ads bring you customers.',
      detail: 'This is standard — every store running ads has this. It doesn\'t slow down your site.',
      severity: 'info',
      actions: ['Yes, install it', 'Tell me more first']
    },
    tracking_progress: {
      title: 'Installing Tracking',
      steps: [
        { text: 'Installing Meta Pixel' },
        { text: 'Installing Google Tags' },
        { text: 'Configuring conversion events' },
        { text: 'Verifying data flow' }
      ]
    },
    setup_complete: {
      icon: 'shield',
      title: 'Setup Complete!',
      body: 'All 4 accounts connected and verified.',
      summary: 'Shopify: 5 products synced | Meta: Ad account ready | Google: Account verified | Tracking: All events firing',
      actions: ['Let\'s plan campaigns']
    },

    // ─── ACT 2: CAMPAIGN PLANNING ───────────────────
    plan_budget: {
      number: 1,
      total: 4,
      title: 'Monthly Budget',
      body: '$13,000 over 31 days across 3 phases:\n\u2022 Test Phase (10 days): $3,900 \u2014 learn what works\n\u2022 Optimize Phase (15 days): $6,240 \u2014 double down on winners\n\u2022 Scale Phase (6 days): $2,860 \u2014 maximize returns',
      detail: 'We start smaller to learn, then invest more in what\'s working.',
      severity: 'info',
      actions: ['Looks good', 'Adjust budget', 'Explain more']
    },
    plan_channels: {
      number: 2,
      total: 4,
      title: 'Where Your Ads Will Run',
      body: 'Google Ads \u2014 70% of budget\nSearch + Shopping campaigns = people already looking for products like yours\n\nMeta Ads \u2014 30% of budget\nAwareness + Retargeting = find new people + remind visitors to buy',
      detail: 'Google captures people actively searching. Meta introduces your brand to new potential customers and reminds visitors who didn\'t buy yet.',
      severity: 'info',
      actions: ['Confirmed', 'More on Meta', 'More on Google']
    },
    plan_audiences: {
      number: 3,
      total: 4,
      title: 'Who Will See Your Ads',
      body: 'I ranked these by how likely they are to buy:\n\n1. Wagyu Enthusiasts \u2014 2.4M people, 35-55 age, $120K+ income\n2. Health-Conscious Foodies \u2014 5.1M, 28-45, $85K+\n3. Gift Buyers \u2014 8.2M seasonal, 30-60, $100K+\n4. Organic Product Buyers \u2014 6.1M, 25-50, $75K+',
      detail: 'We\'ll test all 4 and invest more in the winners. I\'ll automatically shift budget to the best-performing groups.',
      severity: 'info',
      actions: ['Confirmed', 'Edit audiences', 'Explain more']
    },
    plan_creatives: {
      number: 4,
      total: 4,
      title: 'Your Ad Creatives',
      body: '3 Video Ads:\n\u2022 "Sizzle Reel" \u2014 15s close-up cooking footage\n\u2022 "Unboxing Experience" \u2014 30s delivery-to-plate journey\n\u2022 "Chef\'s Pick" \u2014 20s professional testimonial\n\n3 Image Ads:\n\u2022 Premium plating photo with pricing\n\u2022 Lifestyle dinner party scene\n\u2022 Before/after comparison (raw to cooked)',
      detail: 'Multiple versions let me find which connect best. I\'ll automatically show more of the winners.',
      severity: 'info',
      actions: ['Launch with these', 'Review each one', 'Add my own photos']
    },

    // ─── NEW: Expanded Campaign Planning Cards (8-step) ───
    plan_objective: {
      number: 3,
      total: 8,
      title: 'Ad Objective',
      subtitle: 'What should your ads try to do?',
      objectives: [
        { id: 'awareness', label: 'Awareness', icon: 'eye', desc: 'Show your brand to new people' },
        { id: 'traffic', label: 'Traffic', icon: 'click', desc: 'Send people to your website' },
        { id: 'engagement', label: 'Engagement', icon: 'heart', desc: 'Get likes, comments, shares' },
        { id: 'leads', label: 'Leads', icon: 'form', desc: 'Collect contact information' },
        { id: 'app', label: 'App Promotion', icon: 'phone', desc: 'Drive app installs' },
        { id: 'sales', label: 'Sales', icon: 'cart', desc: 'Get people to buy your product', recommended: true },
        { id: 'catalog', label: 'Catalog Sales', icon: 'grid', desc: 'Promote products from your catalog' }
      ],
      detail: 'For DTC brands, Sales is almost always the right choice. It tells Meta to find people who are likely to purchase, not just browse.',
      proDetail: 'Objective: Conversions (Purchase event). Using CBO with minimum ROAS bid strategy. Meta optimizes delivery toward highest-value purchasers within your audiences.',
      actions: ['Use Sales (recommended)', 'Let me pick']
    },
    plan_structure: {
      number: 4,
      total: 8,
      title: 'Campaign Structure',
      subtitle: '4 audience groups, 2 ads each \u2014 to find your winner fast',
      structure: {
        campaign: 'YamaBushi \u2014 Sales Campaign',
        model: '1-4-2',
        adSets: [
          { name: 'Wagyu Enthusiasts', ads: ['Sizzle Reel (video)', 'Premium Plating (image)'] },
          { name: 'Health Foodies', ads: ['Unboxing Experience (video)', 'Lifestyle Scene (image)'] },
          { name: 'Gift Buyers', ads: ['Chef\'s Pick (video)', 'Premium Plating (image)'] },
          { name: 'Remarketing', ads: ['Sizzle Reel (video)', 'Before/After (image)'] }
        ]
      },
      alternatives: [
        { model: '1-1-1', desc: 'Simplest: 1 campaign, 1 audience, 1 ad. For testing a single angle.' },
        { model: '1-2-2', desc: 'Two audiences, 2 ads each. Good for smaller budgets.' },
        { model: '1-4-1', desc: '4 audiences, 1 ad each. Tests audiences with a proven creative.' },
        { model: '1-4-2', desc: '4 audiences, 2 ads each. Best for learning phase.', recommended: true }
      ],
      detail: 'I\'m using 1-4-2 because your budget supports 4 test groups with enough data per ad. As we scale, we\'ll evolve to 1-30-1 or 1-100-1.',
      proDetail: 'Campaign: CBO at $419/day. 4 Ad Sets with min spend guarantees. Each Ad Set contains 2 ads (1 video + 1 static) for creative diversity. Placement: Advantage+ (all placements). Bid strategy: Lowest cost with bid cap.',
      actions: ['Use 1-4-2 (recommended)', 'Show alternatives']
    },
    plan_audiences_enhanced: {
      number: 5,
      total: 8,
      title: 'Who Will See Your Ads',
      audiences: [
        { name: 'Wagyu Enthusiasts', size: '2.4M', type: 'interest', budget: 30, budgetAmt: '$126/day', demographics: '35-55, $120K+', bidStrategy: 'Lowest cost' },
        { name: 'Health-Conscious Foodies', size: '5.1M', type: 'interest', budget: 25, budgetAmt: '$105/day', demographics: '28-45, $85K+', bidStrategy: 'Lowest cost' },
        { name: 'Gift Buyers', size: '8.2M', type: 'lookalike', budget: 20, budgetAmt: '$84/day', demographics: '30-60, $100K+', bidStrategy: 'Lowest cost' },
        { name: 'Remarketing \u2014 Site Visitors', size: '~500', type: 'remarketing', budget: 25, budgetAmt: '$105/day', demographics: 'People who visited but didn\'t buy', bidStrategy: 'Cost cap $40' }
      ],
      rules: [
        { rule: 'Remarketing budget \u2264 50% of total', status: 'pass', current: '25%' },
        { rule: 'At least 2 interest-based audiences', status: 'pass', current: '2 audiences' },
        { rule: 'Minimum audience size > 100K', status: 'pass', current: 'All pass' }
      ],
      detail: 'Each audience type serves a different purpose. Interest audiences find new customers. Lookalike audiences find people similar to your buyers. Remarketing reminds visitors who didn\'t purchase.',
      proDetail: 'Audience types: 2\u00d7 Interest (saved audiences via detailed targeting), 1\u00d7 LAL (1% Lookalike from website visitors), 1\u00d7 Remarketing (Custom Audience: Website visitors 7d, excl. purchasers). Budget caps enforce remarketing \u2264 50% rule per Kevin\'s methodology.',
      actions: ['Confirmed', 'Edit audiences', 'Explain types']
    },
    plan_budget_allocation: {
      number: 6,
      total: 8,
      title: 'Budget Allocation',
      subtitle: 'How your daily $419 is split',
      allocation: [
        { type: 'Interest Audiences', pct: 50, amount: '$210/day', color: '#3B82F6', detail: 'Wagyu Enthusiasts + Health Foodies' },
        { type: 'Lookalike Audiences', pct: 25, amount: '$105/day', color: '#8B5CF6', detail: 'Gift Buyers (similar to your best customers)' },
        { type: 'Remarketing', pct: 25, amount: '$105/day', color: '#F59E0B', detail: 'Site visitors who didn\'t buy (capped at 50%)' }
      ],
      rules: [
        { rule: 'Remarketing \u2264 50% of total spend', status: 'pass', detail: 'Currently 25%. Over-reliance on remarketing leads to audience exhaustion.' },
        { rule: 'Interest audiences get largest share', status: 'pass', detail: 'Finding new customers is the growth engine.' },
        { rule: 'Lookalike gets seed audience match', status: 'pass', detail: 'Using 1% Lookalike from purchase events.' }
      ],
      detail: 'Interest audiences get the largest share because finding new customers is how you grow. Remarketing is capped at 50% to avoid the "death spiral" of only retargeting a shrinking pool.',
      proDetail: 'CBO distributes $419/day across 4 Ad Sets with minimum spend floors: $80 min per Interest Ad Set, $60 min for LAL, $50 min for Remarketing. Meta auto-allocates remaining budget to best performers. Remarketing hard cap at $210/day (50%).',
      actions: ['Looks good', 'Adjust split']
    },
    plan_creatives_enhanced: {
      number: 7,
      total: 8,
      title: 'Your Ad Creatives',
      categories: [
        { category: 'Design', creatives: [
          { name: 'Premium Plating', format: 'Image 1080\u00d71080', placements: ['Feed', 'Stories', 'Reels'], type: 'image' },
          { name: 'Before/After', format: 'Carousel 1080\u00d71080', placements: ['Feed'], type: 'carousel' }
        ]},
        { category: 'Scene', creatives: [
          { name: 'Lifestyle Dinner', format: 'Image 1080\u00d71350', placements: ['Feed', 'Stories'], type: 'image' },
          { name: 'Sizzle Reel', format: 'Video 9:16 15s', placements: ['Reels', 'Stories', 'Feed'], type: 'video' }
        ]},
        { category: 'Testimonial', creatives: [
          { name: 'Chef\'s Pick', format: 'Video 1:1 20s', placements: ['Feed', 'In-Stream'], type: 'video' },
          { name: 'Unboxing Experience', format: 'Video 9:16 30s', placements: ['Reels', 'Stories'], type: 'video' }
        ]},
        { category: 'Offer', creatives: [
          { name: 'First Order 10% Off', format: 'Image 1080\u00d71080', placements: ['Feed', 'Stories'], type: 'image' },
          { name: 'Bundle Deal', format: 'Image 1080\u00d71350', placements: ['Feed'], type: 'image' }
        ]}
      ],
      detail: 'I\'m testing 4 creative categories: Design (product shots), Scene (lifestyle), Testimonial (social proof), and Offer (discounts). The winners from each category will be scaled.',
      proDetail: 'Creative matrix: 8 assets across 4 categories. Each Ad Set gets 2 creatives (cross-category). Using Dynamic Creative Optimization (DCO) for headline/description variants. Primary text: 3 variants. Headlines: 5 variants. Auto-placement optimization enabled.',
      actions: ['Launch with these', 'Review each one', 'Add my own']
    },
    plan_review_summary: {
      number: 8,
      total: 8,
      title: 'Campaign Review',
      subtitle: 'Everything at a glance',
      summary: {
        objective: 'Sales (Conversions \u2014 Purchase event)',
        structure: '1 Campaign \u2192 4 Ad Sets \u2192 8 Ads (1-4-2 model)',
        budget: '$13,000/month ($419/day), 3 phases',
        channels: 'Meta 30% ($3,900) | Google 70% ($9,100)',
        audiences: '2 Interest + 1 Lookalike + 1 Remarketing',
        allocation: 'Interest 50% | Lookalike 25% | Remarketing 25% (capped)',
        creatives: '8 assets: 3 video, 3 image, 2 carousel',
        timeline: 'Phase 1: Test (10d) \u2192 Phase 2: Optimize (15d) \u2192 Phase 3: Scale (6d)'
      },
      actions: ['Approve & Launch', 'Go back and edit']
    },

    plan_approved: {
      icon: 'rocket',
      title: 'Campaign Plan Approved!',
      body: 'All 8 decisions confirmed. Your campaigns are ready to launch.',
      summary: 'Objective: Sales | Structure: 1-4-2 | Budget: $13K/month | 4 audiences | 8 creatives',
      actions: ['Launch campaigns now']
    },

    // ─── ACT 3: LAUNCH ─────────────────────────────
    launch_progress: {
      title: 'Launching Your Campaigns',
      steps: [
        { text: 'Creating audiences on Meta' },
        { text: 'Creating audiences on Google' },
        { text: 'Uploading ad creatives' },
        { text: 'Setting daily budgets' },
        { text: 'Submitting Meta for review' },
        { text: 'Activating Google campaigns' },
        { text: 'Final verification' }
      ]
    },
    youre_live: {
      icon: 'rocket',
      title: 'You\'re Live!',
      body: '5 campaigns running across Google and Meta.',
      summary: 'Google: 2 campaigns (Search + Shopping) \u2014 Active\nMeta: 3 campaigns (Awareness + Retargeting + Lookalike) \u2014 Active/In Review',
      actions: []
    },
    what_to_expect: {
      title: 'WHAT TO EXPECT',
      icon: 'calendar',
      sections: [
        { title: 'Timeline', items: [
          'First 48 hours: Learning phase \u2014 platforms figure out who to show your ads to',
          'Days 3-7: Data accumulates \u2014 early patterns emerge',
          'Week 2: Real insights \u2014 enough data to make smart changes'
        ]},
        { title: 'Things You DON\'T Need To Do', items: [
          'Don\'t check Meta or Google yourself \u2014 I monitor everything',
          'Don\'t worry about daily fluctuations \u2014 early swings are normal',
          'Don\'t change anything \u2014 let the platforms learn'
        ]},
        { title: 'What I\'ll Send You', items: [
          'Daily briefing starting in 48 hours',
          'Full weekly report every Monday',
          'Instant alerts if anything needs your attention'
        ]}
      ]
    },

    // ─── ACT 4: FIRST RESULTS ───────────────────────
    first_48h_report: {
      title: 'FIRST 48 HOURS',
      icon: 'chart',
      badge: 'Day 2',
      kpis: [
        { label: 'People Saw Your Ads', value: '8,240', delta: 'impressions', trend: 'neutral' },
        { label: 'Clicked to Your Site', value: '186', delta: '2.3% click rate', trend: 'up' },
        { label: 'Added to Cart', value: '12', delta: 'potential buyers', trend: 'up' },
        { label: 'Purchases', value: '2', delta: '$189 revenue', trend: 'up' }
      ],
      sections: [
        { title: 'Is This Good?', items: [
          'Yes! 2 sales in 48 hours during the learning phase is strong.',
          'Most brands see their first sale in 3-5 days \u2014 you\'re ahead of schedule.',
          'The platforms are still learning who to show your ads to.'
        ]},
        { title: 'Early Winners', items: [
          'Google Shopping is your strongest channel so far',
          '"Sizzle Reel" video has the best click rate at 3.1%',
          'Wagyu Enthusiasts audience is responding well'
        ]}
      ]
    },
    daily_compact: {
      title: 'DAILY BRIEFING',
      icon: 'sun',
      badge: 'Day 4',
      kpis: [
        { label: 'Yesterday\'s Spend', value: '$52.40', delta: 'on track', trend: 'neutral' },
        { label: 'Running Revenue', value: '$567', delta: '5 purchases total', trend: 'up' },
        { label: 'Status', value: 'Healthy', delta: 'all systems', trend: 'up' }
      ],
      sections: [
        { title: 'Update', items: [
          'All campaigns healthy. No issues detected.',
          'Learning phase: Day 4 of 7',
          'Nothing needs your attention today.'
        ]}
      ]
    },
    week1_report: {
      title: 'WEEK 1 PERFORMANCE',
      icon: 'chart',
      badge: 'Week 1',
      kpis: [
        { label: 'Spent', value: '$388', delta: 'on budget', trend: 'neutral' },
        { label: 'Revenue', value: '$1,134', delta: '8 purchases', trend: 'up' },
        { label: 'Return per $1', value: '$2.92', delta: 'profitable!', trend: 'up' },
        { label: 'Cost per Customer', value: '$48.50', delta: 'improving', trend: 'down' }
      ],
      sections: [
        { title: 'What\'s Working', items: [
          'Google Shopping \u2014 strongest channel, 5 of 8 purchases',
          'Wagyu Enthusiasts \u2014 best audience, $28 per customer',
          '"Sizzle Reel" video \u2014 3.8% click rate, 3 sales'
        ]},
        { title: 'What Needs Adjustment', items: [
          'Organic Buyers audience \u2014 spent $94, only 1 sale. Low return.',
          'Static image ads \u2014 underperforming vs video'
        ]},
        { title: 'Bottom Line', items: [
          'For every $1 you spent on ads, you got $2.92 back.',
          'Your ads are profitable from week 1 \u2014 that\'s ahead of most brands.',
          'I have 3 recommendations for next week.'
        ]}
      ]
    },
    week1_rec_wagyu: {
      number: 1,
      total: 3,
      title: 'Invest More in Wagyu Enthusiasts',
      body: 'This audience has your best results:\n\u2022 $28 per customer (lowest)\n\u2022 $4.05 return for every $1 spent\n\u2022 I want to show ads to 30% more people in this group.',
      severity: 'success',
      actions: ['Approve', 'Adjust', 'Skip']
    },
    week1_rec_pause_organic: {
      number: 2,
      total: 3,
      title: 'Pause Organic Buyers (for now)',
      body: 'Spent $94, only 1 sale. Costing more than they bring in.\nI\'ll redirect that budget to audiences that are working.',
      severity: 'warning',
      actions: ['Approve', 'Keep running', 'Skip']
    },
    week1_rec_new_video: {
      number: 3,
      total: 3,
      title: 'Create New Video Based on Sizzle Reel',
      body: 'Your Sizzle Reel outperforms everything \u2014 3.8% click rate.\nI want to create a similar version to test if we can beat it.',
      severity: 'info',
      actions: ['Approve', 'Skip']
    },
    week2_report: {
      title: 'WEEK 2 PERFORMANCE',
      icon: 'chart',
      badge: 'Week 2',
      kpis: [
        { label: 'Spent', value: '$412', delta: '+6% vs W1', trend: 'up' },
        { label: 'Revenue', value: '$1,890', delta: '+67% vs W1', trend: 'up' },
        { label: 'Purchases', value: '12', delta: '+50% vs W1', trend: 'up' },
        { label: 'Return per $1', value: '$4.59', delta: '+57% vs W1', trend: 'up' }
      ],
      sections: [
        { title: 'Your Changes Are Working', items: [
          'Wagyu audience doubled: 4 purchases \u2192 8 purchases',
          'Pausing Organic saved $94/week \u2014 reinvested in winners',
          'New Sizzle v2 video \u2014 even better click rate than original'
        ]},
        { title: 'What\'s Next', items: [
          'Learning phase is over. Your campaigns are optimized.',
          'At this pace: $8-10K/month from ads alone.',
          'Ready to move to Phase 2: Optimization'
        ]}
      ]
    },
    phase2_transition: {
      title: 'Move to Phase 2: Optimization',
      body: 'Budget increase: $390/week \u2192 $590/week\nFocus on proven winners\nTest 2 new audiences to find more growth',
      detail: 'Your week 2 results justify increasing spend. We\'ll keep the same winning audiences and test new ones.',
      severity: 'success',
      actions: ['Let\'s do it', 'Tell me more', 'Stay in Phase 1']
    },

    // ─── ACT 5: OPTIMIZATION (WEEKS 3-4 + ALERTS) ───
    week3_report: {
      title: 'WEEK 3 PERFORMANCE',
      icon: 'chart',
      badge: 'Week 3',
      kpis: [
        { label: 'Spent', value: '$589', delta: '+43% budget', trend: 'up' },
        { label: 'Revenue', value: '$3,450', delta: '+83% vs W2', trend: 'up' },
        { label: 'Purchases', value: '22', delta: '+83% vs W2', trend: 'up' },
        { label: 'Return per $1', value: '$5.86', delta: '+28% vs W2', trend: 'up' }
      ],
      sections: [
        { title: 'Progress', items: [
          'On pace for $15K/month from ads',
          'That\'s 30% of the way to your $50K intermediate target',
          'Revenue trend: $1,134 \u2192 $1,890 \u2192 $3,450 (week over week)'
        ]},
        { title: 'Top Performers', items: [
          'Wagyu Enthusiasts: 14 purchases, $5.92 return per $1',
          'Gift Buyers (new): 5 purchases, solid start',
          'Sizzle Reel v2: 4.1% click rate \u2014 new best'
        ]}
      ]
    },
    week3_rec_foodies: {
      number: 1,
      total: 3,
      title: 'Test Foodies Audience',
      body: 'Health-conscious foodies overlap with your best buyers.\n5.1M potential reach. Low risk test at $50/week.',
      severity: 'info',
      actions: ['Approve', 'Skip']
    },
    week3_rec_retargeting: {
      number: 2,
      total: 3,
      title: 'Launch Cart Abandonment Retargeting',
      body: 'You have 47 people who added to cart but didn\'t buy.\nReminder ads to these people convert at 8-12x the rate of cold ads.',
      severity: 'success',
      actions: ['Approve', 'Skip']
    },
    week3_rec_budget_increase: {
      number: 3,
      total: 3,
      title: 'Increase Budget to $750/week',
      body: 'Your 5.86x return justifies more spend.\nProjected impact: 30+ purchases/week at $750 budget.',
      severity: 'success',
      actions: ['Approve', 'Adjust amount', 'Skip']
    },
    week4_report: {
      title: 'WEEK 4 PERFORMANCE',
      icon: 'chart',
      badge: 'Week 4',
      kpis: [
        { label: 'Spent', value: '$742', delta: '+26% budget', trend: 'up' },
        { label: 'Revenue', value: '$5,780', delta: '+68% vs W3', trend: 'up' },
        { label: 'Purchases', value: '35', delta: '+59% vs W3', trend: 'up' },
        { label: 'Return per $1', value: '$7.78', delta: '+33% vs W3', trend: 'up' }
      ],
      sections: [
        { title: 'Month 1 Summary', items: [
          'Total revenue from ads: $12,254',
          'Total ad spend: $2,131',
          'Net profit from ads: $10,123',
          'Average return: $5.75 for every $1 spent'
        ]},
        { title: 'Best Performers', items: [
          'Wagyu Enthusiasts: 52% of all purchases',
          'Cart abandonment retargeting: 12x return (highest)',
          'Sizzle Reel v2: consistent 4%+ click rate'
        ]}
      ]
    },
    phase2_milestone: {
      icon: 'trophy',
      title: 'Phase 2 Target Reached!',
      body: '$7.78 return per $1 \u2014 that\'s $7.78 back for every $1 you spend on ads.',
      summary: 'Exceeded the 3.0x target by 159%! Month 1 total: $12,254 revenue, $2,131 spend, $10,123 net profit.',
      sparkline: [2.92, 4.59, 5.86, 7.78],
      actions: ['Scale to Phase 3', 'Stay at current level']
    },
    cpa_spike_detailed: {
      title: 'Cost Per Customer Spiked',
      severity: 'warning',
      confidence: '81%',
      body: 'Health & Wellness audience: cost per customer jumped from $34 to $52 (+53%) in the last 24 hours.',
      cause: 'People are seeing the same ad too many times. After 8.4 views each, click rates drop \u2014 this is called "ad fatigue."',
      recommendation: 'Pause this audience and move $60/week to Wagyu Enthusiasts (which has 4.5x return).',
      impact: 'Save $60/week + better results from reallocation',
      actions: ['Approve \u2014 pause and reallocate', 'Keep running', 'Tell me more']
    },
    auto_action_keywords: {
      title: 'Added 12 Negative Keywords',
      timestamp: '2:14 PM',
      body: 'Blocked search terms that were wasting money \u2014 people searching for "wagyu restaurant near me" were clicking your ads but not buying (they want restaurants, not delivery).',
      impact: 'Estimated savings: ~$45/week',
      policy: 'Pre-authorized (negative keywords)',
      actions: ['View Details', 'Undo']
    },

    // ─── COMPETITOR RESEARCH ─────────────────────────
    competitor_research: {
      competitors: [
        {
          name: 'Snake River Farms',
          website: 'snakeriverfarms.com',
          monthlySpend: '$25K-35K',
          topCreatives: 6,
          strengths: 'Strong brand recognition, high-quality product photography, aggressive retargeting',
          weaknesses: 'Limited video content, broad targeting wastes budget on non-buyers',
          targeting: 'Broad food enthusiast interests + heavy remarketing to site visitors',
          adCopy: ['American Wagyu, Delivered', 'The steak your grill deserves', 'Farm to Table in 48 Hours'],
          creativeTypes: ['Product photos', 'Lifestyle shots', 'Recipe carousels']
        },
        {
          name: 'Crowd Cow',
          website: 'crowdcow.com',
          monthlySpend: '$40K-60K',
          topCreatives: 8,
          strengths: 'High ad volume, diverse creative testing, strong unboxing videos',
          weaknesses: 'Over-reliance on discount offers, high customer acquisition cost',
          targeting: 'Lookalike audiences from purchasers + interest-based (cooking, BBQ)',
          adCopy: ['Craft Meat, Curated for You', 'From Independent Farms to Your Door', '15% Off Your First Box'],
          creativeTypes: ['Unboxing videos', 'Comparison charts', 'UGC testimonials', 'Discount promos']
        },
        {
          name: 'Holy Grail Steak Co.',
          website: 'holygrailsteak.com',
          monthlySpend: '$10K-15K',
          topCreatives: 4,
          strengths: 'Premium positioning, gift-focused campaigns during holidays',
          weaknesses: 'Low ad frequency, limited platform diversity (Meta only)',
          targeting: 'High-income demographics + gift buyer interests',
          adCopy: ['The World\'s Finest Steaks', 'A Gift They\'ll Never Forget', 'True A5 Japanese Wagyu'],
          creativeTypes: ['Hero product shots', 'Gift packaging photos', 'Chef endorsements']
        }
      ]
    },

    // ─── GTM REPORT TEMPLATE (fallback/demo) ──────────
    gtm_report_template: {
      companyName: 'YamaBushi Farms',
      reportTitle: 'Growth Strategy Report',
      date: 'February 2026',
      heroKpis: [
        { label: 'Total Addressable Market', value: '$7.2B' },
        { label: 'Monthly Budget', value: '$13,000' },
        { label: 'Time to Revenue', value: '48 hours' },
        { label: 'Target ROAS', value: '4.0x' }
      ],
      reportSections: [
        {
          id: 'executive-summary',
          title: 'Executive Summary',
          contentType: 'text',
          text: 'YamaBushi Farms is positioned to capture significant market share in the premium A5 Japanese Wagyu DTC segment. The $7.2B premium beef market is growing at 8.3% annually, with DTC channels accounting for an increasing share as consumers seek restaurant-quality experiences at home.\n\nWith a $13,000 monthly ad budget allocated across Google and Meta, we project reaching profitability within 48 hours of launch, achieving 4.0x ROAS by Week 2, and scaling to $50,000+ monthly revenue within 90 days.'
        },
        {
          id: 'business-profile',
          title: 'Business Profile',
          contentType: 'text',
          text: 'YamaBushi Farms sells premium A5 Japanese Wagyu beef direct-to-consumer through their Shopify store. Current monthly revenue is approximately $8,000 with a 6-month goal of $50,000/month.\n\nThe brand differentiates through authentic Japanese sourcing, premium packaging, and educational content about Wagyu grades and preparation methods. Current marketing relies primarily on organic social media and word-of-mouth referrals.'
        },
        {
          id: 'market-opportunity',
          title: 'Market Opportunity',
          contentType: 'kpis',
          text: 'The premium beef market presents a strong growth opportunity for DTC brands with authentic positioning.',
          kpis: [
            { label: 'Market Size (TAM)', value: '$7.2B' },
            { label: 'Annual Growth Rate', value: '8.3%' },
            { label: 'DTC Penetration', value: '12%' },
            { label: 'Avg Order Value', value: '$156' }
          ]
        },
        {
          id: 'competitive-landscape',
          title: 'Competitive Landscape',
          contentType: 'competitors',
          text: 'Three primary competitors operate in the premium Wagyu DTC space:',
          competitors: [
            { name: 'Snake River Farms', strengths: 'Brand recognition, photography', weaknesses: 'Limited video, broad targeting', estSpend: '$25-35K/mo' },
            { name: 'Crowd Cow', strengths: 'High volume testing, unboxing videos', weaknesses: 'Discount dependency, high CAC', estSpend: '$40-60K/mo' },
            { name: 'Holy Grail Steak Co.', strengths: 'Premium positioning, gift campaigns', weaknesses: 'Low frequency, Meta only', estSpend: '$10-15K/mo' }
          ]
        },
        {
          id: 'ideal-customer-profile',
          title: 'Ideal Customer Profile',
          contentType: 'personas',
          personas: [
            { name: 'The Wagyu Enthusiast', description: 'Passionate about premium beef, follows food influencers, willing to pay for quality. Household income $120K+, age 28-55.', tags: ['Foodies', 'Premium Buyers', '$120K+ Income', 'Food Instagram'] },
            { name: 'The Gift Buyer', description: 'Looking for unique, memorable gifts for special occasions. Searches around holidays, birthdays, Father\'s Day.', tags: ['Gift Seekers', 'Seasonal', 'High AOV', 'Corporate Gifts'] },
            { name: 'The Home Chef', description: 'Loves cooking at home, watches cooking shows, invests in quality ingredients. Sees Wagyu as the ultimate cooking challenge.', tags: ['Home Cooking', 'YouTube Foodies', 'Kitchen Gear', 'Recipe Blogs'] }
          ]
        },
        {
          id: 'budget-strategy',
          title: 'Budget Strategy',
          contentType: 'text',
          text: 'Monthly budget of $13,000 allocated in three phases:\n\n**Phase 1 — Test (Days 1-10):** $3,900 (30%)\nBroad testing across audiences and creatives. Goal: identify winning combinations.\n\n**Phase 2 — Optimize (Days 11-25):** $6,240 (48%)\nDouble down on winners, pause underperformers. Goal: achieve 3.0x+ ROAS.\n\n**Phase 3 — Scale (Days 26-31):** $2,860 (22%)\nMaximize returns from proven campaigns. Goal: establish sustainable growth.'
        },
        {
          id: 'platform-strategy',
          title: 'Platform Strategy',
          contentType: 'text',
          text: '**Google Ads (70% — $9,100/mo):**\nGoogle Shopping for product discovery, Search for high-intent buyers ("buy wagyu online"), Performance Max for cross-channel reach. Expected ROAS: 4-6x.\n\n**Meta Ads (30% — $3,900/mo):**\nVideo-first creative for awareness, retargeting for conversions, Lookalike audiences from existing customers. Expected ROAS: 2.5-4x.\n\nGoogle gets the majority allocation because high-intent search drives the most efficient conversions for premium food products.'
        },
        {
          id: 'content-creative-strategy',
          title: 'Content & Creative Strategy',
          contentType: 'items',
          items: [
            'Video-first approach: 60% video, 40% static — video drives 2.3x higher engagement for food products',
            'Hero creative: "Sizzle Reel" — 15-second cooking video showcasing the marbling and sear',
            'Unboxing experience video — premium packaging creates shareable moments',
            'Lifestyle scenes — dinner party, date night, family BBQ settings',
            'UGC testimonial clips from real customers',
            'Product photography with close-up marbling detail for Shopping ads',
            'Seasonal campaigns: Valentine\'s, Father\'s Day, Holiday Gift Guides'
          ]
        },
        {
          id: 'success-metrics',
          title: 'Success Metrics & KPIs',
          contentType: 'kpis',
          kpis: [
            { label: 'Target ROAS', value: '4.0x by Week 4' },
            { label: 'Customer Acquisition Cost', value: 'Under $45' },
            { label: 'Click-Through Rate', value: '2.5%+ average' },
            { label: 'Conversion Rate', value: '3.0%+ from ads' },
            { label: 'Monthly Revenue from Ads', value: '$50,000 by Month 3' },
            { label: 'Repeat Purchase Rate', value: '25%+ by Month 2' }
          ]
        },
        {
          id: 'risk-assessment',
          title: 'Risk Assessment',
          contentType: 'risks',
          risks: [
            { level: 'medium', risk: 'High CAC during learning phase', mitigation: 'Start with smaller test budgets, scale only proven audiences' },
            { level: 'low', risk: 'Seasonal demand fluctuation', mitigation: 'Gift-focused campaigns during holidays, subscription push in off-season' },
            { level: 'medium', risk: 'Creative fatigue after 3-4 weeks', mitigation: 'Rotate 6+ creative variants, refresh top performers biweekly' },
            { level: 'high', risk: 'Supply chain constraints if demand spikes', mitigation: 'Coordinate with operations team, set daily spend caps aligned with inventory' },
            { level: 'low', risk: 'Competitor price undercutting', mitigation: 'Differentiate on quality and authenticity, avoid price wars' }
          ]
        },
        {
          id: 'ninety-day-roadmap',
          title: '90-Day Roadmap',
          contentType: 'timeline',
          phases: [
            { name: 'Foundation', period: 'Days 1-14', description: 'Launch campaigns, complete learning phase, identify winning audiences and creatives. Target: first sales within 48 hours.' },
            { name: 'Growth', period: 'Days 15-45', description: 'Scale winning campaigns, add retargeting, launch email capture. Target: $25K/month revenue, 3.0x+ ROAS.' },
            { name: 'Scale', period: 'Days 46-90', description: 'Increase budgets on proven channels, add TikTok, launch referral program. Target: $50K/month revenue, 4.0x+ ROAS.' }
          ]
        },
        {
          id: 'next-steps',
          title: 'Summary & Next Steps',
          contentType: 'items',
          items: [
            'Connect your Shopify store for product catalog sync',
            'Link Meta Business Manager for Facebook/Instagram campaigns',
            'Set up Google Ads account with Merchant Center',
            'Install tracking pixels (Meta Pixel + Google Tags) on your store',
            'Provide 3-5 high-quality product photos and any existing video content',
            'Review and approve campaign structure and audience targeting',
            'Launch campaigns — expected first sale within 48 hours'
          ]
        }
      ]
    },

    // ─── ACT 6: GROWTH & SCALING ────────────────────
    scale_budget: {
      number: 1,
      total: 3,
      title: 'Scale Budget to $1,500/week',
      body: 'Your 6.08x return justifies much higher spend.\nAt $1,500/week, projected: 60+ purchases, $9K+ revenue weekly.',
      detail: 'We\'ll increase gradually over 2 weeks to maintain performance.',
      severity: 'success',
      actions: ['Approve', 'Adjust amount', 'Skip']
    },
    scale_tiktok: {
      number: 2,
      total: 3,
      title: 'Add TikTok Ads',
      body: 'Your video ads perform great \u2014 TikTok is a natural fit.\nTest with 10% of budget ($150/week) to start.',
      detail: 'Video-first platform. Your Sizzle Reel style content would perform well here.',
      severity: 'info',
      actions: ['Approve', 'Skip']
    },
    scale_email: {
      number: 3,
      total: 3,
      title: 'Launch Email Retargeting',
      body: '77 customers so far. Repeat orders at zero ad cost.\nEmail campaigns for: welcome series, reorder reminders, new product launches.',
      detail: 'Your existing customers already love your product. Email drives repeat purchases with zero ad spend.',
      severity: 'success',
      actions: ['Approve', 'Skip']
    },
    month2_report: {
      title: 'MONTH 2 PERFORMANCE',
      icon: 'chart',
      badge: 'Month 2',
      kpis: [
        { label: 'Revenue', value: '$25,420', delta: '+107% vs M1', trend: 'up' },
        { label: 'Ad Spend', value: '$4,180', delta: 'on budget', trend: 'neutral' },
        { label: 'Return per $1', value: '$6.08', delta: '+6% vs M1', trend: 'up' },
        { label: 'Customers', value: '159', delta: '+82 repeat', trend: 'up' }
      ],
      sections: [
        { title: 'Channel Breakdown', items: [
          'Google: $15,200 revenue (60%) \u2014 Search + Shopping dominant',
          'Meta: $7,800 revenue (31%) \u2014 Retargeting strongest',
          'Email: $2,100 revenue (8%) \u2014 Zero ad cost, pure profit',
          'TikTok: $320 revenue (1%) \u2014 Early days, testing'
        ]},
        { title: 'Key Wins', items: [
          'Cost per customer dropped from $48 to $18 (-63%)',
          'Retargeting drives 34% of all purchases',
          'Email list: 241 subscribers generating $2,100/month in repeat orders'
        ]}
      ],
      sparkline: [12254, 25420]
    },
    revenue_25k_milestone: {
      icon: 'trophy',
      title: '$25,000 Monthly Revenue Milestone!',
      body: '50% of the way to your $50K intermediate target.',
      summary: 'Month 1: $12,254 \u2192 Month 2: $25,420 (+107% growth)\n159 total customers, 82 repeat buyers\nOn track for $50K by Month 4',
      sparkline: [12254, 25420, 38000, 50000],
      actions: ['View Month 3 plan', 'Download report']
    }
  },

  // ─── CANVAS DATA (DASHBOARD MOCK DATA) ────────────
  canvasData: {
    competitor_analysis: {
      title: 'Competitive Analysis',
      competitors: [
        {
          name: 'Snake River Farms',
          website: 'snakeriverfarms.com',
          monthlySpend: '$25K-35K/mo',
          strengths: ['Strong brand recognition', 'High-quality product photography', 'Aggressive retargeting campaigns'],
          weaknesses: ['Limited video content', 'Broad targeting wastes budget', 'No TikTok presence'],
          targeting: 'Broad food enthusiast interests + heavy remarketing to site visitors',
          creatives: [
            { type: 'Product Photo', emoji: '📸', label: 'Hero Shots' },
            { type: 'Lifestyle', emoji: '🍽️', label: 'Dinner Scenes' },
            { type: 'Carousel', emoji: '🔄', label: 'Recipe Steps' }
          ]
        },
        {
          name: 'Crowd Cow',
          website: 'crowdcow.com',
          monthlySpend: '$40K-60K/mo',
          strengths: ['High ad volume testing', 'Diverse creative formats', 'Strong unboxing videos'],
          weaknesses: ['Over-reliance on discounts', 'High customer acquisition cost', 'Brand dilution'],
          targeting: 'Lookalike audiences from purchasers + interest-based (cooking, BBQ, organic food)',
          creatives: [
            { type: 'Unboxing Video', emoji: '📦', label: 'Unboxing' },
            { type: 'Comparison', emoji: '📊', label: 'vs Regular' },
            { type: 'UGC', emoji: '🎬', label: 'Testimonials' },
            { type: 'Promo', emoji: '🏷️', label: 'Discount Offers' }
          ]
        },
        {
          name: 'Holy Grail Steak Co.',
          website: 'holygrailsteak.com',
          monthlySpend: '$10K-15K/mo',
          strengths: ['Premium brand positioning', 'Gift-focused seasonal campaigns', 'High perceived value'],
          weaknesses: ['Low ad frequency', 'Meta only (no Google)', 'Limited creative variety'],
          targeting: 'High-income demographics + gift buyer interests + seasonal targeting',
          creatives: [
            { type: 'Hero Product', emoji: '🥩', label: 'Premium Shots' },
            { type: 'Gift Box', emoji: '🎁', label: 'Gift Packaging' },
            { type: 'Chef', emoji: '👨‍🍳', label: 'Endorsements' }
          ]
        }
      ]
    },
    setupDashboard: {
      connections: [
        { platform: 'Shopify', icon: 'shopify', status: 'pending', detail: '' },
        { platform: 'Meta (Facebook/Instagram)', icon: 'meta', status: 'pending', detail: '' },
        { platform: 'Google Ads', icon: 'google', status: 'pending', detail: '' },
        { platform: 'Website Tracking', icon: 'tracking', status: 'pending', detail: '' }
      ],
      kpis: [
        { label: 'Connected Accounts', value: '0', delta: 'of 4' },
        { label: 'Ad Spend', value: '$0', delta: 'not started' },
        { label: 'Return per $1', value: '--', delta: 'no data yet' },
        { label: 'Timeline', value: 'Day 1', delta: 'setup phase' }
      ]
    },
    campaignHierarchy: {
      campaign: {
        name: 'YamaBushi \u2014 Sales Campaign',
        objective: 'Sales (Purchase)',
        budget: '$419/day (CBO)',
        status: 'Active',
        adSets: [
          { name: 'Wagyu Enthusiasts', type: 'interest', budget: '$126/day', status: 'Active', ads: [
            { name: 'Sizzle Reel', format: 'Video 9:16', status: 'Active', spend: '$45', roas: '4.2x' },
            { name: 'Premium Plating', format: 'Image 1:1', status: 'Active', spend: '$38', roas: '3.1x' }
          ]},
          { name: 'Health Foodies', type: 'interest', budget: '$105/day', status: 'Active', ads: [
            { name: 'Unboxing Experience', format: 'Video 9:16', status: 'Active', spend: '$32', roas: '2.8x' },
            { name: 'Lifestyle Scene', format: 'Image 4:5', status: 'Learning', spend: '$18', roas: '1.4x' }
          ]},
          { name: 'Gift Buyers', type: 'lookalike', budget: '$84/day', status: 'Active', ads: [
            { name: 'Chef\'s Pick', format: 'Video 1:1', status: 'Active', spend: '$28', roas: '2.2x' },
            { name: 'Premium Plating', format: 'Image 1:1', status: 'Active', spend: '$22', roas: '1.8x' }
          ]},
          { name: 'Remarketing', type: 'remarketing', budget: '$105/day', status: 'Active', ads: [
            { name: 'Sizzle Reel', format: 'Video 9:16', status: 'Active', spend: '$42', roas: '8.5x' },
            { name: 'Before/After', format: 'Carousel', status: 'Active', spend: '$35', roas: '6.2x' }
          ]}
        ]
      }
    },
    budgetWaterfall: {
      daily: 419,
      monthly: 13000,
      allocation: [
        { type: 'Interest', pct: 50, amount: 210, color: '#3B82F6' },
        { type: 'Lookalike', pct: 25, amount: 105, color: '#8B5CF6' },
        { type: 'Remarketing', pct: 25, amount: 105, color: '#F59E0B' }
      ],
      remarkCap: { max: 50, current: 25, status: 'healthy' }
    },
    creativeComparison: {
      creatives: [
        { name: 'Sizzle Reel', category: 'Scene', format: 'Video 9:16', spend: '$87', impressions: '12,400', ctr: '3.8%', purchases: 6, roas: '5.2x', verdict: 'winner' },
        { name: 'Unboxing Experience', category: 'Testimonial', format: 'Video 9:16', spend: '$50', impressions: '8,200', ctr: '2.9%', purchases: 3, roas: '3.4x', verdict: 'strong' },
        { name: 'Premium Plating', category: 'Design', format: 'Image 1:1', spend: '$60', impressions: '9,800', ctr: '2.1%', purchases: 4, roas: '2.8x', verdict: 'decent' },
        { name: 'Chef\'s Pick', category: 'Testimonial', format: 'Video 1:1', spend: '$42', impressions: '6,100', ctr: '2.4%', purchases: 2, roas: '2.2x', verdict: 'testing' },
        { name: 'Lifestyle Scene', category: 'Scene', format: 'Image 4:5', spend: '$35', impressions: '5,400', ctr: '1.4%', purchases: 1, roas: '1.1x', verdict: 'underperforming' },
        { name: 'Before/After', category: 'Design', format: 'Carousel', spend: '$28', impressions: '4,200', ctr: '1.8%', purchases: 2, roas: '3.1x', verdict: 'promising' }
      ]
    },
    dailySpendTracker: {
      weekBudget: 390,
      days: [
        { day: 'Mon', spent: 56, budget: 56, status: 'on_track' },
        { day: 'Tue', spent: 52, budget: 56, status: 'on_track' },
        { day: 'Wed', spent: 61, budget: 56, status: 'slight_over' },
        { day: 'Thu', spent: 48, budget: 56, status: 'under' },
        { day: 'Fri', spent: 55, budget: 56, status: 'on_track' },
        { day: 'Sat', spent: 0, budget: 56, status: 'pending' },
        { day: 'Sun', spent: 0, budget: 56, status: 'pending' }
      ],
      totalSpent: 272,
      pctUsed: 70,
      daysRemaining: 2
    },
    campaignPlan: {
      kpis: [
        { label: 'Total Budget', value: '$13,000', delta: '31 days' },
        { label: 'Duration', value: '31 days', delta: '3 phases' },
        { label: 'Daily Average', value: '$419', delta: 'varies by phase' },
        { label: 'Phases', value: '3', delta: 'Test \u2192 Optimize \u2192 Scale' }
      ],
      phases: [
        { name: 'Test', days: 10, budget: 3900, pct: 30 },
        { name: 'Optimize', days: 15, budget: 6240, pct: 48 },
        { name: 'Scale', days: 6, budget: 2860, pct: 22 }
      ],
      channelSplit: { google: 70, meta: 30 }
    },
    launchDashboard: {
      campaigns: [
        { name: 'Google Search \u2014 Wagyu', platform: 'google', status: 'Active', budget: '$125/day' },
        { name: 'Google Shopping \u2014 All Products', platform: 'google', status: 'Active', budget: '$68/day' },
        { name: 'Meta \u2014 Awareness Campaign', platform: 'meta', status: 'In Review', budget: '$45/day' },
        { name: 'Meta \u2014 Retargeting', platform: 'meta', status: 'Active', budget: '$30/day' },
        { name: 'Meta \u2014 Lookalike Audiences', platform: 'meta', status: 'In Review', budget: '$25/day' }
      ],
      tracking: [
        { name: 'Meta Pixel', status: 'healthy', detail: '95% event match' },
        { name: 'Google Tags', status: 'healthy', detail: '3 conversions tracked' },
        { name: 'UTM Parameters', status: 'healthy', detail: 'All campaigns tagged' }
      ]
    },
    openclawDashboard: {
      status: 'Active',
      lastCheck: '8 min ago',
      nextCheck: '22 min',
      activeAlerts: 0,
      todayActions: 1,
      watching: [
        'Cost per customer across all audiences',
        'Click rates on all ad creatives',
        'Tracking pixel health & data accuracy',
        'Budget pacing (spending too fast or too slow)'
      ],
      recentActions: [
        { time: '2:14 PM', action: 'Added 12 negative keywords', impact: '$45/week savings' },
        { time: 'Yesterday', action: 'Adjusted bid for Shopping campaign', impact: '+8% impression share' },
        { time: '2 days ago', action: 'Paused underperforming ad variant', impact: '$12/week savings' }
      ]
    },
    resultsDashboards: {
      early: {
        title: 'Early Results',
        kpis: [
          { label: 'Revenue So Far', value: '$189', delta: '2 purchases', trend: 'up' },
          { label: 'Spent on Ads', value: '$86', delta: 'on budget', trend: 'neutral' },
          { label: 'Return per $1', value: '$2.20', delta: 'day 2', trend: 'up' },
          { label: 'Purchases', value: '2', delta: 'first 48h', trend: 'up' }
        ],
        learningPhase: { day: 2, total: 7, pct: 29 }
      },
      week1: {
        title: 'Week 1 Results',
        kpis: [
          { label: 'Revenue', value: '$1,134', delta: '8 purchases', trend: 'up' },
          { label: 'Ad Spend', value: '$388', delta: 'on budget', trend: 'neutral' },
          { label: 'Return per $1', value: '$2.92', delta: 'profitable', trend: 'up' },
          { label: 'Customers', value: '8', delta: 'new buyers', trend: 'up' }
        ],
        byAudience: [
          { name: 'Wagyu Enthusiasts', spent: '$124', sales: 4, verdict: 'Winner' },
          { name: 'Health Foodies', spent: '$98', sales: 2, verdict: 'Promising' },
          { name: 'Gift Buyers', spent: '$72', sales: 1, verdict: 'Testing' },
          { name: 'Organic Buyers', spent: '$94', sales: 1, verdict: 'Underperforming' }
        ],
        byCreative: [
          { name: 'Sizzle Reel (video)', clicks: 89, sales: 3, verdict: 'Best performer' },
          { name: 'Unboxing (video)', clicks: 52, sales: 2, verdict: 'Strong' },
          { name: 'Premium Plating (image)', clicks: 28, sales: 2, verdict: 'Decent' },
          { name: 'Lifestyle Scene (image)', clicks: 17, sales: 1, verdict: 'Below average' }
        ]
      },
      week1vs2: {
        title: 'Week 1 vs Week 2',
        metrics: [
          { name: 'Revenue', w1: '$1,134', w2: '$1,890', delta: '+67%' },
          { name: 'Purchases', w1: '8', w2: '12', delta: '+50%' },
          { name: 'Return per $1', w1: '$2.92', w2: '$4.59', delta: '+57%' },
          { name: 'Cost per Customer', w1: '$48.50', w2: '$34.33', delta: '-29%' }
        ]
      },
      month1: {
        title: 'Month 1 Results',
        kpis: [
          { label: 'Return per $1', value: '$5.75', trend: 'up' },
          { label: 'Revenue', value: '$12,254', trend: 'up' },
          { label: 'Ad Spend', value: '$2,131', trend: 'neutral' },
          { label: 'Net Profit', value: '$10,123', trend: 'up' }
        ],
        weeklyRevenue: [1134, 1890, 3450, 5780],
        weeklyReturn: [2.92, 4.59, 5.86, 7.78],
        topAudience: 'Wagyu Enthusiasts',
        topCreative: 'Sizzle Reel v2',
        topPlatform: 'Google Shopping'
      },
      month2: {
        title: 'Month 2 Results',
        kpis: [
          { label: 'Revenue', value: '$25,420', delta: '+107%', trend: 'up' },
          { label: 'Ad Spend', value: '$4,180', delta: 'on budget', trend: 'neutral' },
          { label: 'Return per $1', value: '$6.08', delta: 'stable', trend: 'up' },
          { label: 'Total Customers', value: '159', delta: '+82 repeat', trend: 'up' }
        ],
        monthlyRevenue: [12254, 25420],
        projectedRevenue: [12254, 25420, 38000, 50000, 65000, 80000],
        progressToGoal: { current: 25420, intermediate: 50000, final: 250000, pct: 50 }
      }
    }
  },

  // ─── WHATSAPP SIDEBAR MESSAGES ─────────────────────
  whatsapp: [
    { from: 'auxora', text: 'Hi Len! I\'m Auxora, your AI growth partner. Ready to start?', time: '9:00 AM' },
    { from: 'auxora', text: 'Market research complete! Premium beef market is $7.2B with 8.3% growth.', time: '9:15 AM' },
    { from: 'len', text: 'Looks great! Proceed!', time: '9:20 AM' },
    { from: 'auxora', text: 'Strategy confirmed. 5 key decisions aligned. Moving to agreement.', time: '10:30 AM' },
    { from: 'len', text: 'Let\'s do it!', time: '10:35 AM' },
    { from: 'auxora', text: 'All accounts connected. Campaigns launching now!', time: '2:00 PM' },
    { from: 'len', text: 'Exciting! Keep me posted', time: '2:15 PM' },
    { from: 'auxora', text: 'Week 3: ROAS 1.99x! 6 purchases. Vitamin audience is our winner.', time: 'Mon 10:00 AM' },
    { from: 'auxora', text: '3 recommendations for next week. Check the app to approve.', time: 'Mon 10:01 AM' },
    { from: 'len', text: 'All approved!', time: 'Mon 10:15 AM' },
    { from: 'auxora', text: 'Alert: CPA spike on Health audience. Recommend pause + reallocate.', time: 'Wed 2:10 PM' },
    { from: 'len', text: 'Go ahead, pause it', time: 'Wed 2:20 PM' },
    { from: 'auxora', text: 'ROAS 7.78x this week! $945 revenue on $121 spend. We hit the target!', time: 'Mon 12:00 PM' },
    { from: 'len', text: 'Amazing! Let\'s scale!', time: 'Mon 12:10 PM' }
  ]
};

module.exports = auxoraV3;
