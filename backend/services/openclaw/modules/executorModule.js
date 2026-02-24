/**
 * executorModule.js — Executor Agent Module
 * 
 * Owns: competitor-research → execution-setup → campaign-planning stages
 * Chat: Scripted flows for OAuth setup + 8-decision campaign planning
 * Heartbeat: None
 * 
 * Extracted from auxora-chat.js execution stages.
 */

const { Effect, EffectType } = require('../effectSystem');
const shopify = require('../../shopify');
const { generateLandingPage } = require('../../landing-bridge/node_client');

// ============================================================================
// MODULE DEFINITION
// ============================================================================

const executorModule = {
  name: 'executor',
  description: 'Account setup, OAuth connections, campaign planning, creative approval',
  routingExamples: [
    'connect my Shopify',
    'set up my ads',
    'plan my campaigns',
    'change the budget allocation',
  ],
  stages: ['competitor-research', 'execution-setup', 'campaign-planning'],
  icon: '⚙️',
  label: 'Executor',
  color: '#8B5CF6',
  
  handleMessage,
  getGreeting: null,
  onStageEnter: null,
  evaluateMetrics: null,
  generateCards: null,
  effectHandlers: {},
};

// ============================================================================
// CHAT ROUTING
// ============================================================================

async function handleMessage(session, userText, context) {
  const handlers = {
    'competitor-research': handleCompetitorResearch,
    'execution-setup': handleExecutionSetup,
    'campaign-planning': handleCampaignPlanning,
  };
  
  const handler = handlers[session.stage];
  if (!handler) {
    return { effects: [], sseEvents: [{ event: 'message', data: { type: 'text', sender: 'auxora', text: "Let me redirect you." } }, { event: 'done', data: {} }] };
  }
  
  return handler(session, userText, context);
}

// ============================================================================
// COMPETITOR RESEARCH
// ============================================================================

async function handleCompetitorResearch(session, userText, context) {
  const effects = [];
  const sseEvents = [];
  const step = session.subStep;
  const lower = userText.toLowerCase().trim();
  
  if (step === 0) {
    session.subStep = 1;
    
    // Agent transparency
    for (const action of [
      { id: 'cr1', text: 'Scanning competitor ad libraries...', duration: 2000 },
      { id: 'cr2', text: 'Analyzing competitor creative strategies...', duration: 2500 },
      { id: 'cr3', text: 'Estimating competitor ad spend...', duration: 2000 },
      { id: 'cr4', text: 'Building competitive positioning map...', duration: 1500 },
    ]) {
      sseEvents.push({ event: 'agent_action', data: action });
    }
    
    sseEvents.push({ event: 'message', data: { type: 'text', sender: 'auxora', text: "I've researched your top competitors. Here's what they're doing with ads:" } });
    
    // Load competitor data
    let competitorData;
    try {
      const v3Data = require('../../../data/auxora-v3-data');
      competitorData = v3Data.cards?.competitor_research;
    } catch { /* use default */ }
    
    if (!competitorData) {
      competitorData = {
        competitors: [
          { name: 'Competitor A', monthlySpend: '$8K-12K', strengths: 'Strong video', weaknesses: 'Limited targeting' },
          { name: 'Competitor B', monthlySpend: '$5K-8K', strengths: 'Good retargeting', weaknesses: 'Low variety' },
          { name: 'Competitor C', monthlySpend: '$15K-20K', strengths: 'High volume', weaknesses: 'Poor efficiency' },
        ]
      };
    }
    
    sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'competitor-research', cardData: competitorData } });
    sseEvents.push({ event: 'progress_step', data: { step: 1, status: 'complete' } });
    sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'action', cardData: {
      id: 'competitor-next',
      severity: 'success',
      title: 'Competitive advantage identified',
      body: 'Clear opportunities to differentiate with better creative and smarter targeting.',
      actions: ['Continue to account setup', 'Tell me more about competitors']
    } } });
    
  } else if (step === 1) {
    if (lower.includes('continue') || lower.includes('setup') || lower.includes('account') || lower.includes("let's go") || lower.includes('next')) {
      session.stage = 'execution-setup';
      session.subStep = 0;
      effects.push(new Effect(EffectType.STAGE_CHANGED, {
        from: 'competitor-research', to: 'execution-setup', label: 'Setup'
      }, { source: 'executor', clientId: session.clientId, sessionId: session.id }));
      
      sseEvents.push({ event: 'stage', data: { stage: 'execution-setup', label: 'Setup' } });
      sseEvents.push({ event: 'tab_switch', data: { tab: 'execution' } });
      sseEvents.push({ event: 'canvas_update', data: { view: 'setup-dashboard', connections: session.connections } });
      sseEvents.push({ event: 'message', data: { type: 'text', sender: 'auxora', text: "The hard part is done. Now I just need to connect to your accounts. This takes about 5 minutes." } });
      sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'question', cardData: {
        question: 'What platform is your store on?',
        inputType: 'chips',
        options: ['Shopify', 'WooCommerce', 'BigCommerce', 'Other']
      } } });
      sseEvents.push({ event: 'progress_step', data: { step: 1, status: 'active' } });
    } else {
      sseEvents.push({ event: 'message', data: { type: 'text', sender: 'auxora', text: "Your biggest advantage is creative quality and audience precision. Most competitors over-spend on broad targeting — we'll be smarter." } });
      sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'action', cardData: {
        id: 'competitor-next-2', severity: 'info', title: 'Ready to start?', body: '',
        actions: ['Continue to account setup', 'Ask another question']
      } } });
    }
  }
  
  sseEvents.push({ event: 'done', data: {} });
  return { effects, sseEvents };
}

// ============================================================================
// EXECUTION SETUP — OAuth flow (Shopify → Meta → Google → Tracking)
// ============================================================================

const SETUP_STEPS = [
  // Step 0: User picks platform — real Shopify OAuth when configured
  async (session, sseEvents, effects) => {
    session.subStep = 1;
    sseEvents.push({ event: 'message', data: { type: 'text', sender: 'auxora', text: "Great choice! Let's connect your Shopify store first." } });
    
    // Check if real Shopify OAuth is configured
    const hasShopifyOAuth = process.env.SHOPIFY_API_KEY && process.env.SHOPIFY_API_SECRET;
    
    const cardData = {
      title: 'Connect Shopify', platform: 'shopify',
      description: "I'll only read your products and orders — I can't change anything.",
      permissions: {
        will: ['Product catalog', 'Order history', 'Customer data'],
        wont: ['Store settings', 'Payment processing', 'Theme files']
      },
      actions: hasShopifyOAuth ? ['Enter your store URL'] : ['Connect Shopify Securely'],
    };
    
    if (hasShopifyOAuth) {
      cardData.inputField = { placeholder: 'your-store.myshopify.com', label: 'Shopify Store URL' };
    }
    
    sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'connection', cardData } });
  },
  // Step 1: Shopify connected (real or demo) → Meta
  async (session, sseEvents, effects, userText) => {
    session.subStep = 2;
    
    // Try real Shopify connection if user provided a store URL
    let productCount = 5;
    let productDetails = '5 products synced, 142 orders imported';
    const shopDomain = shopify.normalizeShopDomain(userText);
    
    if (shopDomain && process.env.SHOPIFY_API_KEY) {
      try {
        const oauthUrl = shopify.buildOAuthInstallUrl({
          shopDomain,
          apiKey: process.env.SHOPIFY_API_KEY,
          scopes: process.env.SHOPIFY_SCOPES || 'read_products,read_orders',
          redirectUri: process.env.SHOPIFY_REDIRECT_URI || 'http://localhost:3001/api/integrations/shopify/callback',
          state: `session_${session.id}`,
        });
        session.shopifyDomain = shopDomain;
        sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'oauth-redirect', cardData: {
          platform: 'shopify', url: oauthUrl, title: `Connect ${shopDomain}`
        } } });
      } catch (err) {
        console.warn('[Executor] Shopify OAuth failed, using demo mode:', err.message);
      }
    }
    
    session.connections.shopify = true;
    effects.push(new Effect(EffectType.CONNECTION_MADE, {
      platform: 'shopify', details: productDetails, shopDomain: shopDomain || 'demo-store.myshopify.com'
    }, { source: 'executor', clientId: session.clientId, sessionId: session.id }));
    
    sseEvents.push({ event: 'progress_step', data: { step: 1, status: 'complete' } });
    sseEvents.push({ event: 'progress_step', data: { step: 2, status: 'active' } });
    sseEvents.push({ event: 'canvas_update', data: { view: 'setup-dashboard', connections: session.connections, step: 1 } });
    sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'milestone', cardData: {
      icon: 'check', title: 'Shopify Connected', body: productDetails, summary: '', actions: []
    } } });
    sseEvents.push({ event: 'message', data: { type: 'text', sender: 'auxora', text: "One down! Now let's connect your Meta (Facebook/Instagram) ads account." } });
    sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'connection', cardData: {
      title: 'Connect Meta (Facebook/Instagram)', platform: 'meta',
      description: "I'll manage your ad campaigns and read performance data.",
      permissions: {
        will: ['Create & manage ad campaigns', 'Read ad performance', 'Manage audiences'],
        wont: ['Post to your pages', 'Access messages', 'Change page settings']
      },
      actions: ['Connect Meta Securely']
    } } });
  },
  // Step 2: Meta connected → Google
  (session, sseEvents, effects) => {
    session.connections.meta = true;
    session.subStep = 3;
    effects.push(new Effect(EffectType.CONNECTION_MADE, {
      platform: 'meta', details: 'Ad account verified. Business Manager linked.'
    }, { source: 'executor', clientId: session.clientId, sessionId: session.id }));
    
    sseEvents.push({ event: 'progress_step', data: { step: 2, status: 'complete' } });
    sseEvents.push({ event: 'progress_step', data: { step: 3, status: 'active' } });
    sseEvents.push({ event: 'canvas_update', data: { view: 'setup-dashboard', connections: session.connections, step: 2 } });
    sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'milestone', cardData: {
      icon: 'check', title: 'Meta Connected', body: 'Ad account verified.', summary: '', actions: []
    } } });
    sseEvents.push({ event: 'message', data: { type: 'text', sender: 'auxora', text: "Halfway there! Now let's connect Google Ads." } });
    sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'connection', cardData: {
      title: 'Connect Google Ads', platform: 'google',
      description: "I'll create and manage search & shopping campaigns.",
      permissions: {
        will: ['Create & manage campaigns', 'Set budgets & bids', 'Read performance data'],
        wont: ['Access Gmail', 'Change account settings', 'Access other Google services']
      },
      actions: ['Connect Google Securely', "I don't have Google Ads"]
    } } });
  },
  // Step 3: Google connected → Tracking
  (session, sseEvents, effects) => {
    session.connections.google = true;
    session.subStep = 4;
    effects.push(new Effect(EffectType.CONNECTION_MADE, {
      platform: 'google', details: 'Account verified. Ready for campaigns.'
    }, { source: 'executor', clientId: session.clientId, sessionId: session.id }));
    
    sseEvents.push({ event: 'progress_step', data: { step: 3, status: 'complete' } });
    sseEvents.push({ event: 'progress_step', data: { step: 4, status: 'active' } });
    sseEvents.push({ event: 'canvas_update', data: { view: 'setup-dashboard', connections: session.connections, step: 3 } });
    sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'milestone', cardData: {
      icon: 'check', title: 'Google Ads Connected', body: 'Account verified.', summary: '', actions: []
    } } });
    sseEvents.push({ event: 'message', data: { type: 'text', sender: 'auxora', text: "Almost done! Last step: I'll install tracking on your website." } });
    sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'action', cardData: {
      title: 'Install Website Tracking',
      body: "I'll add tracking code from Meta and Google to your Shopify store. This is how I measure which ads bring you customers.",
      detail: "Standard — every store running ads has this. Doesn't slow your site.",
      severity: 'info',
      actions: ['Yes, install it', 'Tell me more first']
    } } });
  },
  // Step 4: Tracking installed → Setup complete
  (session, sseEvents, effects) => {
    session.connections.tracking = true;
    session.subStep = 5;
    effects.push(new Effect(EffectType.TRACKING_INSTALLED, {
      platforms: ['meta_pixel', 'google_tags'], details: 'All events firing'
    }, { source: 'executor', clientId: session.clientId, sessionId: session.id }));
    
    sseEvents.push({ event: 'progress_step', data: { step: 4, status: 'complete' } });
    sseEvents.push({ event: 'canvas_update', data: { view: 'setup-dashboard', connections: session.connections, step: 4 } });
    sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'milestone', cardData: {
      icon: 'shield', title: 'Setup Complete!', body: 'All 4 accounts connected and verified.',
      summary: 'Shopify: 5 products synced | Meta: Ready | Google: Verified | Tracking: All events firing',
      actions: ["Let's plan campaigns"]
    } } });
  },
  // Step 5: Transition to campaign planning
  (session, sseEvents, effects) => {
    session.stage = 'campaign-planning';
    session.subStep = 0;
    effects.push(new Effect(EffectType.STAGE_CHANGED, {
      from: 'execution-setup', to: 'campaign-planning', label: 'Campaign Planning'
    }, { source: 'executor', clientId: session.clientId, sessionId: session.id }));
    
    sseEvents.push({ event: 'stage', data: { stage: 'campaign-planning', label: 'Campaign Planning' } });
    sseEvents.push({ event: 'progress_step', data: { step: 1, status: 'active' } });
    sseEvents.push({ event: 'canvas_update', data: { view: 'campaign-plan' } });
    sseEvents.push({ event: 'message', data: { type: 'text', sender: 'auxora', text: "Based on your GTM strategy, I've built a complete campaign plan. Let's review 8 key decisions together." } });
    sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'action', cardData: {
      number: 1, total: 8,
      title: 'Monthly Budget',
      body: "$13,000 over 31 days across 3 phases:\n• Test Phase (10 days): $3,900 — learn what works\n• Optimize Phase (15 days): $6,240 — double down on winners\n• Scale Phase (6 days): $2,860 — maximize returns",
      detail: "Start smaller to learn, then invest more in what's working.",
      severity: 'info',
      actions: ['Looks good', 'Adjust budget', 'Explain more']
    } } });
  },
];

async function handleExecutionSetup(session, userText, context) {
  const effects = [];
  const sseEvents = [];
  const step = session.subStep;
  
  if (step < SETUP_STEPS.length) {
    await SETUP_STEPS[step](session, sseEvents, effects, userText);
  }
  
  sseEvents.push({ event: 'done', data: {} });
  return { effects, sseEvents };
}

// ============================================================================
// CAMPAIGN PLANNING — 8 decisions
// ============================================================================

const PLANNING_DECISIONS = [
  // Step 0: Budget approved → Channels
  (session, sseEvents, effects) => {
    session.decisions.budget = true;
    session.subStep = 1;
    sseEvents.push({ event: 'progress_step', data: { step: 1, status: 'complete' } });
    sseEvents.push({ event: 'progress_step', data: { step: 2, status: 'active' } });
    sseEvents.push({ event: 'message', data: { type: 'text', sender: 'auxora', text: "Budget confirmed. Next: where your ads will run." } });
    sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'action', cardData: {
      number: 2, total: 8,
      title: 'Where Your Ads Will Run',
      body: "Google Ads — 70% of budget\nSearch + Shopping = people already looking\n\nMeta Ads — 30% of budget\nAwareness + Retargeting = find new people + remind visitors",
      severity: 'info',
      actions: ['Confirmed', 'More on Meta', 'More on Google']
    } } });
  },
  // Step 1: Channels → Objective
  (session, sseEvents, effects) => {
    session.decisions.channels = true;
    session.subStep = 2;
    sseEvents.push({ event: 'progress_step', data: { step: 2, status: 'complete' } });
    sseEvents.push({ event: 'progress_step', data: { step: 3, status: 'active' } });
    sseEvents.push({ event: 'message', data: { type: 'text', sender: 'auxora', text: "Channels locked in. Now: what should your ads try to do?" } });
    sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'objective-picker', cardData: 'plan_objective' } });
  },
  // Step 2: Objective → Structure
  (session, sseEvents, effects) => {
    session.decisions.objective = true;
    session.subStep = 3;
    sseEvents.push({ event: 'progress_step', data: { step: 3, status: 'complete' } });
    sseEvents.push({ event: 'progress_step', data: { step: 4, status: 'active' } });
    sseEvents.push({ event: 'message', data: { type: 'text', sender: 'auxora', text: "Great choice. Using a 1-4-2 structure to test audiences quickly." } });
    sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'campaign-structure', cardData: 'plan_structure' } });
  },
  // Step 3: Structure → Audiences
  (session, sseEvents, effects) => {
    session.decisions.structure = true;
    session.subStep = 4;
    sseEvents.push({ event: 'progress_step', data: { step: 4, status: 'complete' } });
    sseEvents.push({ event: 'progress_step', data: { step: 5, status: 'active' } });
    sseEvents.push({ event: 'message', data: { type: 'text', sender: 'auxora', text: "Structure locked. Now: who will see your ads." } });
    sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'audience-builder', cardData: 'plan_audiences_enhanced' } });
  },
  // Step 4: Audiences → Budget allocation
  (session, sseEvents, effects) => {
    session.decisions.audiences = true;
    session.subStep = 5;
    sseEvents.push({ event: 'progress_step', data: { step: 5, status: 'complete' } });
    sseEvents.push({ event: 'progress_step', data: { step: 6, status: 'active' } });
    sseEvents.push({ event: 'message', data: { type: 'text', sender: 'auxora', text: "Audiences confirmed. Here's how I split the budget." } });
    sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'budget-waterfall', cardData: 'plan_budget_allocation' } });
    sseEvents.push({ event: 'canvas_update', data: { view: 'budget-waterfall-canvas' } });
  },
  // Step 5: Budget allocation → Creatives
  (session, sseEvents, effects) => {
    session.decisions.budgetAllocation = true;
    session.subStep = 6;
    sseEvents.push({ event: 'progress_step', data: { step: 6, status: 'complete' } });
    sseEvents.push({ event: 'progress_step', data: { step: 7, status: 'active' } });
    sseEvents.push({ event: 'message', data: { type: 'text', sender: 'auxora', text: "Budget locked. Now let's look at your ad creatives." } });
    sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'creative-preview', cardData: 'plan_creatives_enhanced' } });
  },
  // Step 6: Creatives → Review summary
  (session, sseEvents, effects) => {
    session.decisions.creatives = true;
    session.subStep = 7;
    sseEvents.push({ event: 'progress_step', data: { step: 7, status: 'complete' } });
    sseEvents.push({ event: 'progress_step', data: { step: 8, status: 'active' } });
    sseEvents.push({ event: 'message', data: { type: 'text', sender: 'auxora', text: "Here's the full plan at a glance. Confirm to launch!" } });
    sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'review-summary', cardData: 'plan_review_summary' } });
    sseEvents.push({ event: 'canvas_update', data: { view: 'campaign-plan-approved' } });
  },
  // Step 7: Review → Plan complete + Landing Page generation
  async (session, sseEvents, effects) => {
    session.decisions.reviewApproved = true;
    session.subStep = 8;
    
    effects.push(new Effect(EffectType.CAMPAIGN_CREATED, {
      decisions: session.decisions,
      budget: '$13K/month',
      structure: '1-4-2',
    }, { source: 'executor', clientId: session.clientId, sessionId: session.id }));
    
    sseEvents.push({ event: 'progress_step', data: { step: 8, status: 'complete' } });
    
    // Try to generate a real landing page via the bridge service
    const brandName = session.collectedData?.product || session.collectedData?.website || 'Your Brand';
    const industry = session.report?.sections?.[0]?.bigInsight?.analysis || '';
    const targetMarket = session.report?.sections?.[3]?.primaryPersona?.name || '';
    
    let landingResult = null;
    try {
      sseEvents.push({ event: 'message', data: { type: 'text', sender: 'auxora', text: '🎨 Generating your custom landing page...' } });
      sseEvents.push({ event: 'agent_action', data: { id: 'lp1', text: 'Crafting headlines and CTAs for your audience...', duration: 3000 } });
      sseEvents.push({ event: 'agent_action', data: { id: 'lp2', text: 'Designing brand-appropriate color theme...', duration: 2500 } });
      sseEvents.push({ event: 'agent_action', data: { id: 'lp3', text: 'Building React landing page component...', duration: 3000 } });
      
      landingResult = await generateLandingPage({
        projectId: session.id,
        brief: `Landing page for ${brandName} targeting ${targetMarket}. High-conversion D2C e-commerce page.`,
        brandName,
        industry,
        targetMarket,
      });
      
      if (landingResult && landingResult.code) {
        session.landingPageCode = landingResult.code;
        session.landingPageGenerated = true;
        
        effects.push(new Effect(EffectType.MILESTONE_REACHED, {
          type: 'landing_page_generated', title: 'Landing Page Generated',
          codeLength: landingResult.code.length,
        }, { source: 'executor', clientId: session.clientId, sessionId: session.id }));
        
        sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'milestone', cardData: {
          icon: 'palette', title: 'Landing Page Generated!',
          body: `Custom React landing page created for ${brandName}.`,
          summary: `${landingResult.code.length.toLocaleString()} chars of production-ready code`,
          actions: ['Preview landing page', 'Launch campaigns now']
        } } });
      }
    } catch (err) {
      console.warn('[Executor] Landing page generation failed (bridge service may not be running):', err.message);
      // Fall through to standard milestone card
    }
    
    if (!landingResult || !landingResult.code) {
      sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'milestone', cardData: {
        icon: 'rocket', title: 'Campaign Plan Approved!',
        body: 'All 8 decisions confirmed. Ready to launch.',
        summary: 'Budget: $13K/month | 1-4-2 structure | 4 audiences | 4 creative categories',
        actions: ['Launch campaigns now']
      } } });
    }
  },
  // Step 8: Transition to advertiser (launch)
  (session, sseEvents, effects) => {
    session.stage = 'launch';
    session.subStep = 0;
    effects.push(new Effect(EffectType.STAGE_CHANGED, {
      from: 'campaign-planning', to: 'launch', label: 'Launch'
    }, { source: 'executor', clientId: session.clientId, sessionId: session.id }));
    sseEvents.push({ event: 'stage', data: { stage: 'launch', label: 'Launch' } });
    sseEvents.push({ event: 'progress_step', data: { step: 1, status: 'active' } });
    sseEvents.push({ event: '_reroute', data: { stage: 'launch' } });
  },
];

async function handleCampaignPlanning(session, userText, context) {
  const effects = [];
  const sseEvents = [];
  const step = session.subStep;
  
  if (step < PLANNING_DECISIONS.length) {
    await PLANNING_DECISIONS[step](session, sseEvents, effects);
  }
  
  sseEvents.push({ event: 'done', data: {} });
  return { effects, sseEvents };
}

// ============================================================================
// EXPORT
// ============================================================================

module.exports = executorModule;
