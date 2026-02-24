/**
 * strategistModule.js — Strategist Agent Module
 * 
 * Owns: discovery → report-gen → strategy stages
 * Chat: Claude-driven onboarding interview + strategy Q&A
 * Heartbeat: None (strategist doesn't monitor metrics)
 * 
 * Extracted from auxora-chat.js discovery/strategy stages.
 */

const Anthropic = require('@anthropic-ai/sdk');
const { Effect, EffectType } = require('../effectSystem');
const researchService = require('../../strategist/researchService');

const client = new Anthropic();

// ============================================================================
// STRUCTURED INTERVIEW QUESTIONS
// ============================================================================

const INTERVIEW_QUESTIONS = [
  {
    fieldName: 'website',
    question: "What's your website URL?",
    inputType: 'text',
    placeholder: 'e.g. mybrand.com',
    options: []
  },
  {
    fieldName: 'businessType',
    question: 'What does your business do?',
    inputType: 'text+chips',
    placeholder: 'Describe your business...',
    options: [
      'E-commerce / DTC Brand',
      'SaaS / Software',
      'Local Service Business',
      'Content / Media',
      'B2B Services',
      'Marketplace / Platform'
    ]
  },
  {
    fieldName: 'targetCustomers',
    question: 'Who are your target customers?',
    inputType: 'text+chips',
    placeholder: 'Describe your ideal customers...',
    options: [
      'Young professionals 25-35',
      'Parents with kids',
      'Small business owners',
      'Health & fitness enthusiasts',
      'Tech-savvy millennials',
      'Luxury consumers'
    ]
  },
  {
    fieldName: 'currentRevenue',
    question: "What's your current monthly revenue?",
    inputType: 'chips',
    options: [
      'Pre-revenue',
      '$1K-$5K/mo',
      '$5K-$20K/mo',
      '$20K-$50K/mo',
      '$50K+/mo'
    ]
  },
  {
    fieldName: 'revenueGoal',
    question: "What's your revenue goal for the next 90 days?",
    inputType: 'chips',
    options: [
      'First $1K',
      '$5K/mo',
      '$10K/mo',
      '$25K/mo',
      '$50K+/mo'
    ]
  },
  {
    fieldName: 'marketingBudget',
    question: "What's your monthly marketing budget?",
    inputType: 'chips',
    options: [
      '$0 - just starting',
      '$500-$1K/mo',
      '$1K-$3K/mo',
      '$3K-$10K/mo',
      '$10K+/mo'
    ]
  }
];

// ============================================================================
// MODULE DEFINITION
// ============================================================================

const strategistModule = {
  name: 'strategist',
  description: 'Market research, competitor analysis, onboarding interview, GTM strategy reports',
  routingExamples: [
    'analyze my competitors',
    'what should my pricing be',
    'tell me about my market',
    'who are my target customers',
    'adjust my strategy',
  ],
  stages: ['discovery', 'report-gen', 'strategy'],
  icon: '🎯',
  label: 'Strategist',
  color: '#3B82F6',
  
  handleMessage,
  getGreeting,
  onStageEnter: null,
  evaluateMetrics: null, // Strategist doesn't do heartbeat
  generateCards: null,
  effectHandlers: {},
};

// ============================================================================
// CHAT HANDLING
// ============================================================================

/**
 * Handle a user message in strategist-owned stages
 * @param {object} session
 * @param {string} userText
 * @param {object} context - From agentContext.buildContext()
 * @returns {Promise<{effects: Effect[], sseEvents: object[]}>}
 */
async function handleMessage(session, userText, context) {
  const effects = [];
  const sseEvents = [];
  
  if (session.stage === 'strategy') {
    return handleStrategyMessage(session, userText, context);
  }
  
  // Discovery stage — Claude-driven interview
  return handleDiscoveryMessage(session, userText, context);
}

// ============================================================================
// DISCOVERY — Structured 6-Question Interview
// ============================================================================

async function handleDiscoveryMessage(session, userText, context) {
  const effects = [];
  const sseEvents = [];
  
  session.messages.push({ role: 'user', content: userText });
  session.questionCount++;
  
  // Determine which question the user is answering (based on how many fields already collected)
  const currentQuestionIndex = Object.keys(session.collectedData).length;
  
  // Store the answer for the current question
  if (currentQuestionIndex < INTERVIEW_QUESTIONS.length) {
    const currentQuestion = INTERVIEW_QUESTIONS[currentQuestionIndex];
    session.collectedData[currentQuestion.fieldName] = userText;
    
    effects.push(new Effect(EffectType.DATA_COLLECTED, {
      field: currentQuestion.fieldName,
      value: userText
    }, { source: 'strategist', clientId: session.clientId, sessionId: session.id }));
    
    // Update progress steps
    const fieldCount = Object.keys(session.collectedData).length;
    if (fieldCount === 1) {
      sseEvents.push({ event: 'progress_step', data: { step: 1, status: 'complete' } });
      sseEvents.push({ event: 'progress_step', data: { step: 2, status: 'active' } });
    } else if (fieldCount >= 2 && fieldCount < 4) {
      sseEvents.push({ event: 'progress_step', data: { step: 2, status: 'complete' } });
      sseEvents.push({ event: 'progress_step', data: { step: 3, status: 'active' } });
    } else if (fieldCount >= 4) {
      sseEvents.push({ event: 'progress_step', data: { step: 3, status: 'complete' } });
    }
  }
  
  // Check if all questions answered
  const answeredCount = Object.keys(session.collectedData).length;
  if (answeredCount >= INTERVIEW_QUESTIONS.length) {
    // All data collected → generate report with transition message from Claude
    try {
      const systemPrompt = `You are Auxora, the world's first Vibe Business Agent for D2C brands. The user just answered all interview questions. Acknowledge their answer briefly and enthusiastically transition to report generation. Keep it to 1 sentence.`;
      const response = await callClaude(systemPrompt, [{ role: 'user', content: userText }], 256);
      sseEvents.push({ event: 'message', data: { type: 'text', sender: 'auxora', text: response } });
    } catch (err) {
      sseEvents.push({ event: 'message', data: { type: 'text', sender: 'auxora', text: "Perfect! I've got everything I need." } });
    }
    
    // Trigger report generation
    sseEvents.push({ event: 'message', data: { type: 'text', sender: 'auxora', text: "Let me generate your custom growth report — it'll take about 60 seconds." } });
    sseEvents.push({ event: 'progress_step', data: { step: 4, status: 'active' } });
    sseEvents.push({ event: 'stage', data: { stage: 'report-gen', label: 'Generating Report' } });
    sseEvents.push({ event: 'chat_progress', data: {
      title: 'Building Your Growth Strategy',
      steps: [
        'Analyzing your market & competitors',
        'Identifying target audiences',
        'Mapping advertising channels',
        'Calculating budget allocation',
        'Compiling growth report'
      ]
    } });
    
    // Agent transparency — COT-style steps
    const agentSteps = [
      { id: 'rpt1', text: 'Identifying growth opportunity...', duration: 8000 },
      { id: 'rpt2', text: 'Mapping competitive landscape...', duration: 8000 },
      { id: 'rpt3', text: 'Deep-diving competitor strategies...', duration: 7000 },
      { id: 'rpt4', text: 'Building ideal customer profile...', duration: 7000 },
      { id: 'rpt5', text: 'Analyzing geographic opportunities...', duration: 6000 },
      { id: 'rpt6', text: 'Researching SEO & keyword gaps...', duration: 7000 },
      { id: 'rpt7', text: 'Constructing 6-month growth roadmap...', duration: 7000 },
      { id: 'rpt8', text: 'Compiling consulting-grade GTM report...', duration: 8000 },
    ];
    for (const step of agentSteps) {
      sseEvents.push({ event: 'agent_action', data: step });
    }
    
    // Store deferred work
    session._deferredWork = async () => {
      return generateReport(session);
    };
    
    sseEvents.push({ event: 'done', data: {} });
    return { effects, sseEvents };
  }
  
  // Ask next question with Claude acknowledgment
  const nextQuestion = INTERVIEW_QUESTIONS[answeredCount];
  
  try {
    // Use Claude to acknowledge the previous answer and ask the next question
    const systemPrompt = `You are Auxora, the world's first Vibe Business Agent. The user just answered: "${userText}". Acknowledge their answer briefly (1 short sentence), then ask: "${nextQuestion.question}". Be warm and conversational.`;
    const response = await callClaude(systemPrompt, [{ role: 'user', content: userText }], 256);
    
    sseEvents.push({ event: 'message', data: { type: 'text', sender: 'auxora', text: response } });
  } catch (err) {
    // Fallback acknowledgment
    sseEvents.push({ event: 'message', data: { type: 'text', sender: 'auxora', text: 'Got it! Next question:' } });
  }
  
  // Send the structured question card
  sseEvents.push({ event: 'card', data: { 
    type: 'card', 
    sender: 'auxora', 
    cardType: 'question', 
    cardData: {
      question: nextQuestion.question,
      inputType: nextQuestion.inputType,
      placeholder: nextQuestion.placeholder,
      options: nextQuestion.options
    }
  }});
  
  sseEvents.push({ event: 'done', data: {} });
  return { effects, sseEvents };
}

// ============================================================================
// STRATEGY — Post-report Q&A
// ============================================================================

async function handleStrategyMessage(session, userText, context) {
  const effects = [];
  const sseEvents = [];
  
  const lower = userText.toLowerCase().trim();
  
  // Direct handling for action buttons
  if (lower === 'start executing' || lower === "let's get started" || lower === "let's go" || lower === 'move to execution') {
    // Transition to executor module's first stage
    session.stage = 'competitor-research';
    session.subStep = 0;
    effects.push(new Effect(EffectType.STAGE_CHANGED, {
      from: 'strategy', to: 'competitor-research', label: 'Competitor Research'
    }, { source: 'strategist', clientId: session.clientId, sessionId: session.id }));
    sseEvents.push({ event: 'stage', data: { stage: 'competitor-research', label: 'Competitor Research' } });
    sseEvents.push({ event: 'progress_step', data: { step: 1, status: 'active' } });
    // Return — chatRouter will re-route to executor module for the new stage
    sseEvents.push({ event: '_reroute', data: { stage: 'competitor-research' } });
    sseEvents.push({ event: 'done', data: {} });
    return { effects, sseEvents };
  }
  
  try {
    const systemPrompt = buildStrategyPrompt(session);
    session.messages.push({ role: 'user', content: userText });
    const response = await callClaude(systemPrompt, session.messages);
    const entries = parseResponse(response);
    
    if (!entries || !Array.isArray(entries)) {
      sseEvents.push({ event: 'message', data: { type: 'text', sender: 'auxora', text: 'Great question! Let me think about that.' } });
      sseEvents.push({ event: 'done', data: {} });
      return { effects, sseEvents };
    }
    
    let assistantText = '';
    for (const entry of entries) {
      if (entry.type === 'text') {
        assistantText += (assistantText ? ' ' : '') + entry.text;
        sseEvents.push({ event: 'message', data: { type: 'text', sender: 'auxora', text: entry.text } });
      }
      if (entry.type === 'stage_transition' && entry.to === 'execution-setup') {
        session.stage = 'competitor-research';
        session.subStep = 0;
        effects.push(new Effect(EffectType.STAGE_CHANGED, {
          from: 'strategy', to: 'competitor-research', label: 'Competitor Research'
        }, { source: 'strategist', clientId: session.clientId, sessionId: session.id }));
        sseEvents.push({ event: 'stage', data: { stage: 'competitor-research', label: 'Competitor Research' } });
        sseEvents.push({ event: '_reroute', data: { stage: 'competitor-research' } });
      }
    }
    
    if (assistantText) {
      session.messages.push({ role: 'assistant', content: assistantText });
    }
    
    // Offer next-step buttons if still in strategy
    if (session.stage === 'strategy') {
      sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'action', cardData: {
        id: 'strategy-actions-' + Date.now(),
        severity: 'info',
        title: 'Next steps',
        body: '',
        actions: ['Start executing', 'Ask another question', 'Adjust the strategy']
      } } });
    }
    
  } catch (err) {
    console.error('Strategy Claude error:', err.message);
    sseEvents.push({ event: 'message', data: { type: 'text', sender: 'auxora', text: 'Let me try that again.' } });
  }
  
  sseEvents.push({ event: 'done', data: {} });
  return { effects, sseEvents };
}

// ============================================================================
// MOCK RESEARCH DATA
// ============================================================================

function mockResearchData(collectedData) {
  const { businessType, targetCustomers, currentRevenue, revenueGoal, marketingBudget } = collectedData;
  
  // Generate 3 mock competitors based on business type
  const competitorsByType = {
    'E-commerce / DTC Brand': ['Warby Parker', 'Allbirds', 'Glossier'],
    'SaaS / Software': ['Notion', 'Airtable', 'Linear'],
    'Local Service Business': ['Thumbtack', 'Yelp Business', 'Nextdoor'],
    'Content / Media': ['Substack', 'Medium', 'Ghost'],
    'B2B Services': ['HubSpot', 'Salesforce', 'Mailchimp'],
    'Marketplace / Platform': ['Etsy', 'Shopify', 'Faire']
  };
  
  const competitors = (competitorsByType[businessType] || ['Competitor A', 'Competitor B', 'Competitor C']).map((name, i) => ({
    name,
    estimatedTraffic: `${(100 + i * 50)}K monthly visits`,
    topChannels: ['Organic Search (40%)', 'Paid Ads (25%)', 'Social Media (20%)', 'Direct (15%)'],
    estimatedAdSpend: `$${(5000 + i * 2000)}/mo`
  }));
  
  // Mock traffic data
  const trafficData = {
    organicSearchVolume: '45K monthly searches',
    topKeywords: [
      { keyword: `${businessType.toLowerCase()} solutions`, volume: '8.2K/mo', difficulty: 'Medium' },
      { keyword: `best ${businessType.toLowerCase()}`, volume: '6.5K/mo', difficulty: 'High' },
      { keyword: `affordable ${businessType.toLowerCase()}`, volume: '4.1K/mo', difficulty: 'Low' }
    ]
  };
  
  // Mock market size based on business type
  const marketSizes = {
    'E-commerce / DTC Brand': '$1.2B TAM, growing 18% YoY',
    'SaaS / Software': '$850M TAM, growing 25% YoY',
    'Local Service Business': '$650M TAM, growing 12% YoY',
    'Content / Media': '$420M TAM, growing 22% YoY',
    'B2B Services': '$2.1B TAM, growing 15% YoY',
    'Marketplace / Platform': '$980M TAM, growing 20% YoY'
  };
  
  const marketSize = marketSizes[businessType] || '$750M TAM, growing 16% YoY';
  
  return {
    competitors,
    trafficData,
    marketSize,
    targetAudience: targetCustomers,
    currentStage: currentRevenue === 'Pre-revenue' ? 'Launch' : 'Growth',
    growthPotential: `${revenueGoal} achievable with ${marketingBudget} budget`
  };
}

// ============================================================================
// REPORT GENERATION
// ============================================================================

async function generateReport(session) {
  const effects = [];
  const sseEvents = [];
  
  sseEvents.push({ event: 'progress_step', data: { step: 4, status: 'active' } });
  sseEvents.push({ event: 'stage', data: { stage: 'report-gen', label: 'Research' } });
  
  // Progress bar
  sseEvents.push({ event: 'chat_progress', data: {
    title: 'Building Your Growth Strategy',
    steps: [
      'Analyzing your market & competitors',
      'Identifying target audiences',
      'Mapping advertising channels',
      'Calculating budget allocation',
      'Compiling growth report'
    ]
  } });
  
  // Agent transparency
  const agentSteps = [
    { id: 'rpt1', text: 'Identifying growth opportunity...', duration: 2500 },
    { id: 'rpt2', text: 'Mapping competitive landscape...', duration: 3000 },
    { id: 'rpt3', text: 'Deep-diving competitor strategies...', duration: 2500 },
    { id: 'rpt4', text: 'Building ideal customer profile...', duration: 2000 },
    { id: 'rpt5', text: 'Analyzing geographic opportunities...', duration: 2000 },
    { id: 'rpt6', text: 'Researching SEO & keyword gaps...', duration: 2500 },
    { id: 'rpt7', text: 'Constructing 6-month growth roadmap...', duration: 2500 },
    { id: 'rpt8', text: 'Compiling consulting-grade GTM report...', duration: 3000 },
  ];
  for (const step of agentSteps) {
    sseEvents.push({ event: 'agent_action', data: step });
  }
  
  // Generate with Claude
  try {
    const d = session.collectedData;
    
    // Run REAL business research with SimilarWeb API
    console.log('[strategistModule] Running business research...');
    const research = await researchService.runBusinessResearch(d);
    console.log('[strategistModule] Research complete:', research.competitors.length, 'competitors analyzed');
    
    // Build enriched business context with new 6 fields
    const businessContext = `BUSINESS DATA:
- Website: ${d.website || 'N/A'}
- Business Type: ${d.businessType || 'N/A'}
- Target Customers: ${d.targetCustomers || 'N/A'}
- Current Revenue: ${d.currentRevenue || 'N/A'}
- Revenue Goal (90 days): ${d.revenueGoal || 'N/A'}
- Marketing Budget: ${d.marketingBudget || 'N/A'}

MARKET RESEARCH:
- Market Size: ${research.marketSize}
- Current Stage: ${research.currentStage}
- Growth Potential: ${research.growthPotential}

COMPETITORS (Real SimilarWeb Data):
${research.competitors.map((c, i) => `${i + 1}. ${c.name}
   - Traffic: ${c.estimatedTraffic}
   - Top Countries: ${c.topCountries ? c.topCountries.join(', ') : 'N/A'}
   - Traffic Sources: ${Array.isArray(c.trafficSources) ? c.trafficSources.join(', ') : 'N/A'}
   - Estimated Ad Spend: ${c.estimatedAdSpend}
   - Data Source: ${c.dataSource || 'SimilarWeb'}`).join('\n')}

SEO & KEYWORDS:
- Organic Search Volume: ${research.trafficData.organicSearchVolume}
- Top Keywords: ${research.trafficData.topKeywords.map(k => `"${k.keyword}" (${k.volume}, ${k.difficulty})`).join(', ')}`;
    
    const report = await generateReportWithClaude(businessContext, session.urlContent);
    session.report = report;
    session.stage = 'strategy';
    
    effects.push(new Effect(EffectType.INTERVIEW_COMPLETE, {
      collectedData: session.collectedData
    }, { source: 'strategist', clientId: session.clientId, sessionId: session.id }));
    
    effects.push(new Effect(EffectType.REPORT_GENERATED, {
      reportId: session.id + '-report',
      sections: report?.sections?.length || 0,
    }, { source: 'strategist', clientId: session.clientId, sessionId: session.id }));
    
    sseEvents.push({ event: 'chat_progress_done', data: {} });
    
    if (report) {
      sseEvents.push({ event: 'message', data: { type: 'text', sender: 'auxora', text: 'Your Go-to-Market Strategy Report is ready — 9 sections of consulting-grade analysis.' } });
      sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'gtm-report', cardData: report } });
      sseEvents.push({ event: 'stage', data: { stage: 'strategy', label: 'Strategy' } });
      sseEvents.push({ event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'action', cardData: {
        id: 'post-report-actions',
        severity: 'success',
        title: 'What would you like to do next?',
        body: 'Explore your strategy or start connecting your ad accounts.',
        actions: ['Start executing', 'Tell me more about the strategy', 'Adjust the budget']
      } } });
    }
    
  } catch (err) {
    console.error('Report generation error:', err.message);
    sseEvents.push({ event: 'chat_progress_done', data: {} });
    sseEvents.push({ event: 'message', data: { type: 'text', sender: 'auxora', text: 'I had trouble generating the report. Let me try a simpler version.' } });
    
    effects.push(new Effect(EffectType.ERROR_OCCURRED, {
      action: 'report_generation', error: err.message
    }, { source: 'strategist', clientId: session.clientId, sessionId: session.id }));
  }
  
  return { effects, sseEvents };
}

// ============================================================================
// GREETING
// ============================================================================

async function getGreeting(session) {
  const effects = [];
  const sseEvents = [];
  
  sseEvents.push({ event: 'progress_step', data: { step: 1, status: 'active' } });
  sseEvents.push({ event: 'typing', data: { show: true } });
  
  try {
    // Use Claude for greeting only
    const systemPrompt = `You are Auxora, the world's first Vibe Business Agent for D2C brands. Introduce yourself briefly (1-2 sentences). Mention that what takes an agency 30 days and $12,000, you do in 1 day for $200. Be enthusiastic and warm.`;
    const response = await callClaude(systemPrompt, [{ role: 'user', content: 'Hi, I just arrived.' }], 256);
    
    sseEvents.push({ event: 'message', data: { type: 'text', sender: 'auxora', text: response } });
    
    // Store greeting in session
    session.messages.push({ role: 'user', content: 'Hi, I just arrived.' });
    session.messages.push({ role: 'assistant', content: response });
    
  } catch (err) {
    console.error('Greeting error:', err.message);
    sseEvents.push({ event: 'message', data: { type: 'text', sender: 'auxora', text: "Hey! I'm Auxora — the world's first Vibe Business Agent for D2C brands. What takes an agency 30 days & $12,000, I do in 1 day for $200." } });
  }
  
  // Always ask the first structured question
  const firstQuestion = INTERVIEW_QUESTIONS[0];
  sseEvents.push({ event: 'card', data: { 
    type: 'card', 
    sender: 'auxora', 
    cardType: 'question', 
    cardData: {
      question: firstQuestion.question,
      inputType: firstQuestion.inputType,
      placeholder: firstQuestion.placeholder,
      options: firstQuestion.options
    }
  }});
  
  sseEvents.push({ event: 'done', data: {} });
  return { effects, sseEvents };
}

// ============================================================================
// PROMPTS (moved from auxora-chat.js)
// ============================================================================

function buildDiscoveryPrompt(session) {
  const collected = session.collectedData;
  const fields = ['website', 'businessType', 'targetCustomers', 'currentRevenue', 'revenueGoal', 'marketingBudget'];
  let collectedList = '';
  const missing = [];
  
  fields.forEach(f => {
    if (collected[f]) {
      collectedList += '- ' + f + ': ' + collected[f] + '\n';
    } else {
      missing.push(f);
    }
  });
  
  if (!collectedList) collectedList = 'Nothing yet';
  
  return `You are Auxora, the world's first Vibe Business Agent for D2C brands. You deliver end-to-end revenue — strategy, landing page, ads, email, SEO — fully automated in 24 hours. You're AI-native and outcome-aligned.

You're having a structured conversation to learn about the user's business. Collect these 6 data points:
- Website URL
- Business Type / Industry
- Target Customers
- Current Monthly Revenue
- Revenue Goal (90 days)
- Monthly Marketing Budget

ALREADY COLLECTED:
${collectedList}
STILL NEEDED: ${missing.length ? missing.join(', ') : 'All collected!'}
QUESTIONS ASKED: ${session.questionCount}

NOTE: This is now a structured interview flow. Questions are asked deterministically with template options.`;
}

function buildStrategyPrompt(session) {
  const d = session.collectedData;
  const reportSummary = session.report?.summary || '';
  const sectionTitles = session.report?.sections?.map(s => s.title).join(', ') || '';
  
  return `You are Auxora, the world's first Vibe Business Agent for D2C brands. The user has completed onboarding and you've generated their GTM strategy report.

BUSINESS DATA:
- Website: ${d.website || 'N/A'}
- Business Type: ${d.businessType || 'N/A'}
- Target Customers: ${d.targetCustomers || 'N/A'}
- Current Revenue: ${d.currentRevenue || 'N/A'}
- Revenue Goal (90 days): ${d.revenueGoal || 'N/A'}
- Marketing Budget: ${d.marketingBudget || 'N/A'}

REPORT SUMMARY: ${reportSummary}
REPORT SECTIONS: ${sectionTitles}
CURRENT STAGE: ${session.stage}

The user can:
1. Ask questions about their report
2. Say "Let's get started" to move to execution
3. Request changes to the strategy

If the user wants to proceed, transition to execution-setup.

RESPONSE FORMAT: JSON array:
- { "type": "text", "text": "your message" }
- { "type": "stage_transition", "to": "execution-setup" }

Be enthusiastic and action-oriented. 2-3 sentences.
Respond ONLY with the JSON array.`;
}

// ============================================================================
// CLAUDE HELPERS
// ============================================================================

async function callClaude(systemPrompt, messages, maxTokens = 1024) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: maxTokens,
    system: systemPrompt,
    messages,
  });
  return response.content[0].text.trim();
}

function parseResponse(text) {
  const cleaned = text.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const arrMatch = cleaned.match(/\[[\s\S]*\]/);
    if (arrMatch) {
      try { return JSON.parse(arrMatch[0]); } catch { /* fall through */ }
    }
    const objMatch = cleaned.match(/\{[\s\S]*\}/);
    if (objMatch) {
      try { return JSON.parse(objMatch[0]); } catch { /* fall through */ }
    }
    console.error('Failed to parse Claude response:', text.slice(0, 200));
    return null;
  }
}

const REPORT_PROMPT = require('./prompts/reportPrompt');

async function generateReportWithClaude(businessContext, urlContent) {
  let enrichedContext = businessContext;
  if (urlContent) {
    enrichedContext += `\n\nADDITIONAL REFERENCE:\nTitle: ${urlContent.title || 'N/A'}\nContent:\n${(urlContent.text || '').substring(0, 4000)}`;
  }
  
  const response = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 10000,
    system: REPORT_PROMPT + '\n\n' + enrichedContext,
    messages: [{ role: 'user', content: 'Generate the 9-section Go-to-Market Strategy Report as concise JSON. All sections required.' }],
  });
  
  return parseResponse(response.content[0].text.trim());
}

// ============================================================================
// EXPORT
// ============================================================================

module.exports = strategistModule;
