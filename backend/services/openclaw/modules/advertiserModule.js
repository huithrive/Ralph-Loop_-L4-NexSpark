/**
 * advertiserModule.js — Advertiser Agent Module
 * 
 * Owns: launch stage
 * Chat: Launch sequence with agent transparency
 * Heartbeat: Campaign metrics monitoring (future)
 */

const { Effect, EffectType } = require('../effectSystem');

const advertiserModule = {
  name: 'advertiser',
  description: 'Campaign launch, ad management, budget optimization, creative rotation',
  routingExamples: [
    'launch my campaigns',
    'how are my ads doing',
    'change my ad budget',
    'pause that campaign',
  ],
  stages: ['launch'],
  icon: '📢',
  label: 'Advertiser',
  color: '#10B981',
  
  handleMessage,
  getGreeting: null,
  onStageEnter: null,
  evaluateMetrics: null,   // TODO: wire to heartbeat for campaign monitoring
  generateCards: null,
  effectHandlers: {},
};

async function handleMessage(session, userText, context) {
  const effects = [];
  const sseEvents = [];
  
  // Launch sequence
  sseEvents.push({ event: 'message', data: { type: 'text', sender: 'auxora', text: 'Launching your campaigns now! Watch the agent activity below:' } });
  
  // Agent transparency — real-time steps
  const launchSteps = [
    { id: 'la1', text: 'Configuring Meta pixel events...', duration: 2000 },
    { id: 'la2', text: 'Creating 4 audience segments on Meta...', duration: 2500 },
    { id: 'la3', text: 'Setting bid strategy: lowest cost with cap...', duration: 1500 },
    { id: 'la4', text: 'Uploading 8 ad creatives to Meta...', duration: 3000 },
    { id: 'la5', text: 'Creating Google Search campaign...', duration: 2000 },
    { id: 'la6', text: 'Creating Google Shopping campaign...', duration: 2000 },
    { id: 'la7', text: 'Setting daily budgets: $420/day CBO...', duration: 1500 },
    { id: 'la8', text: 'Submitting Meta campaigns for review...', duration: 2000 },
    { id: 'la9', text: 'Activating Google campaigns...', duration: 1500 },
    { id: 'la10', text: 'Final verification: all tracking events firing...', duration: 2000 },
  ];
  
  for (const step of launchSteps) {
    sseEvents.push({ event: 'agent_action', data: step });
  }
  
  sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'progress', cardData: {
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
  } } });
  
  sseEvents.push({ event: 'canvas_update', data: { view: 'launch-dashboard' } });
  
  // "You're Live!" milestone
  effects.push(new Effect(EffectType.CAMPAIGN_LAUNCHED, {
    campaigns: [
      { platform: 'google', type: 'Search', status: 'Active' },
      { platform: 'google', type: 'Shopping', status: 'Active' },
      { platform: 'meta', type: 'Awareness', status: 'Active' },
      { platform: 'meta', type: 'Retargeting', status: 'Active' },
      { platform: 'meta', type: 'Lookalike', status: 'In Review' },
    ]
  }, { source: 'advertiser', clientId: session.clientId, sessionId: session.id }));
  
  sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'milestone', cardData: {
    icon: 'rocket', title: "You're Live!",
    body: '5 campaigns running across Google and Meta.',
    summary: 'Google: 2 campaigns (Search + Shopping) — Active\nMeta: 3 campaigns (Awareness + Retargeting + Lookalike) — Active/In Review',
    actions: []
  } } });
  
  // Learning phase expectations
  sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'report', cardData: 'learning_phase_expectations' } });
  
  sseEvents.push({ event: 'message', data: { type: 'text', sender: 'auxora', text: "Sit back and relax. I'll message you with your first results in 48 hours." } });
  
  // Transition to analyzer's monitoring stage
  session.stage = 'monitoring';
  session.subStep = 0;
  
  effects.push(new Effect(EffectType.STAGE_CHANGED, {
    from: 'launch', to: 'monitoring', label: 'Monitoring'
  }, { source: 'advertiser', clientId: session.clientId, sessionId: session.id }));
  
  sseEvents.push({ event: 'tab_switch', data: { tab: 'openclaw' } });
  sseEvents.push({ event: 'stage', data: { stage: 'monitoring', label: 'Monitoring' } });
  sseEvents.push({ event: 'canvas_update', data: { view: 'openclaw-dashboard' } });
  sseEvents.push({ event: 'progress_step', data: { step: 1, status: 'active' } });
  
  sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'action', cardData: {
    title: 'See Your First Results',
    body: 'Click below to see what happened in the first 48 hours.',
    severity: 'success',
    actions: ['Show 48-hour results']
  } } });
  
  sseEvents.push({ event: 'done', data: {} });
  return { effects, sseEvents };
}

module.exports = advertiserModule;
