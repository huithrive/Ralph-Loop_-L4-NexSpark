/**
 * Auxora V3 — Chat Service
 * Session store + Claude integration for real AI chat
 * Scripted flows for Advertiser + Analyzer stages
 */

var Anthropic = require('@anthropic-ai/sdk');
var crypto = require('crypto');

var client = new Anthropic();

// ─── SESSION STORE ─────────────────────────────────
var sessions = new Map();

function createSession() {
  var id = crypto.randomUUID();
  var session = {
    id: id,
    stage: 'discovery',
    subStep: 0,          // tracks position within a scripted stage
    collectedData: {},
    decisions: {},        // stores approved campaign decisions
    messages: [],
    questionCount: 0,
    report: null,
    connections: { shopify: false, meta: false, google: false, tracking: false },
    notificationPolicy: null,  // set after 48h: 'passive', 'weekly', or 'daily'
    createdAt: Date.now()
  };
  sessions.set(id, session);
  return session;
}

function getSession(id) {
  return sessions.get(id) || null;
}

// Clean up old sessions every 30 minutes
setInterval(function() {
  var cutoff = Date.now() - (2 * 60 * 60 * 1000); // 2 hours
  sessions.forEach(function(session, id) {
    if (session.createdAt < cutoff) {
      sessions.delete(id);
    }
  });
}, 30 * 60 * 1000);

// ─── SYSTEM PROMPTS ────────────────────────────────

function buildDiscoveryPrompt(session) {
  var collected = session.collectedData;
  var fields = ['website', 'product', 'revenue', 'goal', 'budget'];
  var collectedList = '';
  var missing = [];

  fields.forEach(function(f) {
    if (collected[f]) {
      collectedList += '- ' + f + ': ' + collected[f] + '\n';
    } else {
      missing.push(f);
    }
  });

  if (!collectedList) collectedList = 'Nothing yet';

  return 'You are Auxora, the world\'s first Vibe Business Agent for D2C brands. You deliver end-to-end revenue — strategy, landing page, ads, email, SEO — fully automated in 24 hours. You\'re AI-native and outcome-aligned: you don\'t take your cut until the ROAS proves the model is working.\n\n' +
    'You\'re having a conversation to learn about the user\'s business. Collect these 5 data points:\n' +
    '- Website URL\n' +
    '- What they sell / industry\n' +
    '- Current monthly revenue\n' +
    '- Revenue goal (6 months)\n' +
    '- Monthly ad budget\n\n' +
    'ALREADY COLLECTED:\n' + collectedList + '\n' +
    'STILL NEEDED: ' + (missing.length ? missing.join(', ') : 'All collected!') + '\n' +
    'QUESTIONS ASKED: ' + session.questionCount + '\n\n' +
    'RULES:\n' +
    '1. Be warm and concise. Acknowledge what the user said before asking next.\n' +
    '2. Ask ONE question at a time.\n' +
    '3. If you can extract data from a casual answer, do so without re-asking.\n' +
    '4. When all 5 points are collected, say you\'re ready to research their market and include a stage_transition entry.\n' +
    '5. Adapt tone to their industry.\n' +
    '6. Keep messages short — 1-2 sentences max for text entries.\n\n' +
    'RESPONSE FORMAT: Respond ONLY with a JSON array of entries. Valid entry types:\n' +
    '- { "type": "text", "text": "your message" }\n' +
    '- { "type": "card", "cardType": "question", "cardData": { "question": "...", "inputType": "text"|"chips", "placeholder": "...", "options": ["..."] } }\n' +
    '- { "_extracted": { "fieldName": "value" } }  (only newly extracted fields from THIS message. Valid field names: website, product, revenue, goal, budget)\n' +
    '- { "type": "stage_transition", "to": "report-gen" }  (ONLY when all 5 data points are collected)\n\n' +
    'Use chips for categorical answers (budget ranges, yes/no). Use text for open-ended.\n' +
    'Respond ONLY with the JSON array. No markdown, no explanation.';
}

function buildStrategyPrompt(session) {
  var d = session.collectedData;
  var reportSummary = session.report ? (session.report.summary || '') : '';
  var sectionTitles = '';
  if (session.report && session.report.sections) {
    sectionTitles = session.report.sections.map(function(s) { return s.title; }).join(', ');
  }

  return 'You are Auxora, the world\'s first Vibe Business Agent for D2C brands. The user has completed onboarding and you\'ve generated their GTM strategy report.\n\n' +
    'BUSINESS DATA:\n' +
    '- Website: ' + (d.website || 'N/A') + '\n' +
    '- Product: ' + (d.product || 'N/A') + '\n' +
    '- Revenue: ' + (d.revenue || 'N/A') + '\n' +
    '- Goal: ' + (d.goal || 'N/A') + '\n' +
    '- Budget: ' + (d.budget || 'N/A') + '\n\n' +
    'REPORT SUMMARY: ' + reportSummary + '\n' +
    'REPORT SECTIONS: ' + sectionTitles + '\n\n' +
    'CURRENT STAGE: ' + session.stage + '\n\n' +
    'The user can now:\n' +
    '1. Ask questions about their report (explain sections, KPIs, etc.)\n' +
    '2. Say "Let\'s get started" or "Let\'s go" to move to competitor research and then execution\n' +
    '3. Request changes to the strategy\n\n' +
    'If the user wants to proceed/start/execute/connect, transition to execution-setup stage.\n\n' +
    'RESPONSE FORMAT: Respond ONLY with a JSON array of entries:\n' +
    '- { "type": "text", "text": "your message" }\n' +
    '- { "type": "stage_transition", "to": "execution-setup" }  (when user wants to start execution)\n\n' +
    'Be enthusiastic and action-oriented. Keep messages to 2-3 sentences.\n' +
    'Respond ONLY with the JSON array. No markdown, no explanation.';
}

var REPORT_PROMPT = 'Generate a comprehensive Go-to-Market Strategy Report as JSON matching this EXACT schema.\n' +
  'This is a professional consulting-grade report (McKinsey-style) with 9 detailed sections + executive summary.\n\n' +
  '{\n' +
  '  "companyName": "string",\n' +
  '  "reportTitle": "Go-to-Market Strategy Report",\n' +
  '  "preparedBy": "Auxora",\n' +
  '  "date": "string (e.g. February 2026)",\n' +
  '  "executiveSummary": {\n' +
  '    "whatItIs": "string — 1-2 sentence description of the company and its unique positioning",\n' +
  '    "marketGap": "string — the strategic opportunity the company can capture",\n' +
  '    "strategyPhases": [\n' +
  '      { "phase": "Discovery|Foundation|Scale", "timeline": "Months X-Y", "focus": "string", "investment": "$X,XXX/mo", "targetOutcome": "string" }\n' +
  '    ],\n' +
  '    "keySuccessFactors": ["string — 5 bullet points"]\n' +
  '  },\n' +
  '  "sections": [\n' +
  '    {\n' +
  '      "id": "growth-opportunity",\n' +
  '      "title": "Your Growth Opportunity",\n' +
  '      "sectionNumber": 1,\n' +
  '      "bigInsight": {\n' +
  '        "quote": "string — bold, attention-grabbing 1-liner insight in quotes",\n' +
  '        "analysis": "string — 2-3 paragraphs of market analysis with specific numbers",\n' +
  '        "bottomLine": "string — What this means for you: actionable takeaway"\n' +
  '      }\n' +
  '    },\n' +
  '    {\n' +
  '      "id": "market-landscape",\n' +
  '      "title": "Market Landscape",\n' +
  '      "sectionNumber": 2,\n' +
  '      "marketOverview": "string — 2 paragraphs about market size, growth, key dynamics",\n' +
  '      "keyStrategicInsight": "string — the strategic positioning opportunity"\n' +
  '    },\n' +
  '    {\n' +
  '      "id": "competitor-deep-dive",\n' +
  '      "title": "Competitor Deep Dive",\n' +
  '      "sectionNumber": 3,\n' +
  '      "competitors": [\n' +
  '        {\n' +
  '          "name": "string",\n' +
  '          "website": "string",\n' +
  '          "keyMetrics": { "traffic": "string", "revenue": "string", "stage": "string" },\n' +
  '          "trafficSources": [{ "source": "Direct|Organic|Paid|Social|Referral", "percentage": "string" }],\n' +
  '          "strengths": ["string"],\n' +
  '          "weaknesses": ["string"],\n' +
  '          "keyTakeaway": "string — actionable insight about how to position against this competitor"\n' +
  '        }\n' +
  '      ]\n' +
  '    },\n' +
  '    {\n' +
  '      "id": "ideal-customer-profile",\n' +
  '      "title": "Ideal Customer Profile",\n' +
  '      "sectionNumber": 4,\n' +
  '      "primaryPersona": {\n' +
  '        "name": "string — archetype name in quotes (e.g. The Overwhelmed Creative)",\n' +
  '        "demographics": ["string — 4-5 bullet points"],\n' +
  '        "psychographics": ["string — 3-4 bullet points"],\n' +
  '        "onlineBehavior": ["string — 3-4 bullet points"],\n' +
  '        "triggerEvent": "string — what makes them search for a solution"\n' +
  '      },\n' +
  '      "secondaryICPs": [\n' +
  '        { "persona": "string", "keyDifference": "string", "testPriority": "High|Medium|Low" }\n' +
  '      ],\n' +
  '      "validationPlan": ["string — 3-4 audience test descriptions"]\n' +
  '    },\n' +
  '    {\n' +
  '      "id": "geographic-opportunity",\n' +
  '      "title": "Geographic Opportunity",\n' +
  '      "sectionNumber": 5,\n' +
  '      "marketTiers": [\n' +
  '        { "tier": "Tier 1|Tier 2|Tier 3", "label": "string (e.g. Premium Markets)", "markets": ["string"] }\n' +
  '      ],\n' +
  '      "costComparison": [\n' +
  '        { "market": "string", "cpc": "string", "cpm": "string", "language": "string", "recommendation": "string" }\n' +
  '      ],\n' +
  '      "launchStrategy": ["string — phased geographic launch plan"]\n' +
  '    },\n' +
  '    {\n' +
  '      "id": "seo-keyword-opportunity",\n' +
  '      "title": "SEO & Keyword Opportunity",\n' +
  '      "sectionNumber": 6,\n' +
  '      "brandAnalysis": "string — current brand search position",\n' +
  '      "categoryKeywords": [\n' +
  '        { "keyword": "string", "monthlySearches": "string", "cpc": "string", "competition": "Low|Medium|High", "priority": "string" }\n' +
  '      ],\n' +
  '      "contentGaps": [\n' +
  '        { "topic": "string", "competitorRanking": "string", "difficulty": "Easy|Medium|Hard", "contentType": "string" }\n' +
  '      ],\n' +
  '      "quickWins": ["string — 3 immediate SEO actions"]\n' +
  '    },\n' +
  '    {\n' +
  '      "id": "growth-roadmap",\n' +
  '      "title": "Six-Month Growth Roadmap",\n' +
  '      "sectionNumber": 7,\n' +
  '      "phases": [\n' +
  '        {\n' +
  '          "name": "Discovery|Foundation|Scale",\n' +
  '          "period": "Months X-Y",\n' +
  '          "goal": "string",\n' +
  '          "budget": "string",\n' +
  '          "keyStrategies": ["string — 3-4 strategy bullet points"],\n' +
  '          "successMetrics": ["string — 4-6 measurable targets"],\n' +
  '          "keyMilestone": "string"\n' +
  '        }\n' +
  '      ]\n' +
  '    },\n' +
  '    {\n' +
  '      "id": "budget-metrics",\n' +
  '      "title": "Budget & Metrics Framework",\n' +
  '      "sectionNumber": 8,\n' +
  '      "monthlyAllocation": [\n' +
  '        { "channel": "string", "amount": "string", "percentage": "string" }\n' +
  '      ],\n' +
  '      "scalingRules": {\n' +
  '        "scaleWhen": ["string"],\n' +
  '        "safetyRules": ["string"],\n' +
  '        "pauseWhen": ["string"]\n' +
  '      },\n' +
  '      "kpiTargets": [\n' +
  '        { "metric": "string", "month1_2": "string", "month3_4": "string", "month5_6": "string" }\n' +
  '      ]\n' +
  '    },\n' +
  '    {\n' +
  '      "id": "next-steps",\n' +
  '      "title": "Next Steps & Resources",\n' +
  '      "sectionNumber": 9,\n' +
  '      "immediateActions": [\n' +
  '        { "action": "string", "timeEstimate": "string", "whyItMatters": "string" }\n' +
  '      ],\n' +
  '      "recommendedTools": [\n' +
  '        { "category": "string", "tool": "string", "cost": "string", "why": "string" }\n' +
  '      ]\n' +
  '    }\n' +
  '  ]\n' +
  '}\n\n' +
  'RULES:\n' +
  '- Generate ALL 9 sections in the "sections" array, in order (sectionNumber 1-9)\n' +
  '- executiveSummary must have exactly 3 strategyPhases and 5 keySuccessFactors\n' +
  '- Section 3 (competitors): exactly 3 competitors, each with 3 strengths and 3 weaknesses\n' +
  '- Section 4 (ICP): 1 primary persona and 3 secondary ICPs\n' +
  '- Section 5 (geo): 3 market tiers with 3-4 markets each, plus 4 rows in costComparison\n' +
  '- Section 6 (SEO): 4 category keywords, 2 content gaps, 3 quick wins\n' +
  '- Section 7 (roadmap): exactly 3 phases (Discovery/Foundation/Scale) with 3 strategies and 3 metrics each\n' +
  '- Section 8 (budget): 4 channels in allocation, 4 KPI rows\n' +
  '- Section 9 (next steps): 5 immediate actions, 4 recommended tools\n' +
  '- Keep text fields concise (1-2 sentences max for analysis). Use realistic numbers.\n' +
  '- Respond ONLY with the JSON object. No markdown, no code fences, no explanation.';

// ─── CLAUDE CALLS ──────────────────────────────────

async function callClaude(systemPrompt, messages, maxTokens) {
  var response = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: maxTokens || 1024,
    system: systemPrompt,
    messages: messages
  });

  var text = response.content[0].text.trim();
  return text;
}

function parseClaudeResponse(text) {
  // Strip markdown code fences if present
  var cleaned = text.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // Try to find JSON array or object in the text
    var arrMatch = cleaned.match(/\[[\s\S]*\]/);
    if (arrMatch) {
      try { return JSON.parse(arrMatch[0]); } catch (e2) { /* fall through */ }
    }
    var objMatch = cleaned.match(/\{[\s\S]*\}/);
    if (objMatch) {
      try { return JSON.parse(objMatch[0]); } catch (e2) { /* fall through */ }
    }
    console.error('Failed to parse Claude response:', text);
    return null;
  }
}

// ─── HELPER: delay for scripted flow pacing ─────────
function sleep(ms) {
  return new Promise(function(resolve) { setTimeout(resolve, ms); });
}

// ─── PROCESS MESSAGE ───────────────────────────────

async function* processMessage(sessionId, userText) {
  var session = getSession(sessionId);
  if (!session) {
    yield { event: 'error', data: { error: 'Session not found' } };
    return;
  }

  // Add user message to history
  session.messages.push({ role: 'user', content: userText });
  session.questionCount++;

  yield { event: 'typing', data: { show: true } };

  try {
    // Route to the right handler based on session stage
    if (session.stage === 'strategy') {
      yield* processStrategyMessage(session, userText);
      return;
    }

    // Competitor research — scripted stage
    if (session.stage === 'competitor-research') {
      yield* processCompetitorResearch(session, userText);
      return;
    }

    // Scripted stages — no Claude needed
    if (session.stage === 'execution-setup') {
      yield* processExecutionSetup(session, userText);
      return;
    }
    if (session.stage === 'campaign-planning') {
      yield* processCampaignPlanning(session, userText);
      return;
    }
    if (session.stage === 'launch') {
      yield* processLaunch(session, userText);
      return;
    }
    if (session.stage === 'monitoring') {
      yield* processMonitoring(session, userText);
      return;
    }
    if (session.stage === 'weekly-sync') {
      yield* processWeeklySync(session, userText);
      return;
    }
    if (session.stage === 'optimization') {
      yield* processOptimization(session, userText);
      return;
    }
    if (session.stage === 'scaling') {
      yield* processScaling(session, userText);
      return;
    }

    // Discovery stage — Claude-driven
    var systemPrompt = buildDiscoveryPrompt(session);
    var response = await callClaude(systemPrompt, session.messages);
    var entries = parseClaudeResponse(response);

    if (!entries || !Array.isArray(entries)) {
      yield { event: 'message', data: { type: 'text', sender: 'auxora', text: 'Let me try that again. Could you tell me more about your business?' } };
      yield { event: 'done', data: {} };
      return;
    }

    // Build assistant response text for conversation history
    var assistantText = '';
    var triggerReport = false;

    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];

      // Handle extracted data
      if (entry._extracted) {
        var extractedKeys = Object.keys(entry._extracted);
        for (var k = 0; k < extractedKeys.length; k++) {
          session.collectedData[extractedKeys[k]] = entry._extracted[extractedKeys[k]];
        }
        // Emit progress_step based on collected field count
        var fieldCount = Object.keys(session.collectedData).length;
        if (fieldCount === 1) {
          yield { event: 'progress_step', data: { step: 1, status: 'complete' } };
          yield { event: 'progress_step', data: { step: 2, status: 'active' } };
        } else if (fieldCount >= 2 && fieldCount < 4) {
          yield { event: 'progress_step', data: { step: 2, status: 'complete' } };
          yield { event: 'progress_step', data: { step: 3, status: 'active' } };
        } else if (fieldCount >= 4) {
          yield { event: 'progress_step', data: { step: 3, status: 'complete' } };
        }
        continue;
      }

      // Handle stage transition
      if (entry.type === 'stage_transition') {
        triggerReport = true;
        continue;
      }

      // Handle text messages
      if (entry.type === 'text') {
        assistantText += (assistantText ? ' ' : '') + entry.text;
        yield { event: 'message', data: { type: 'text', sender: 'auxora', text: entry.text } };
      }

      // Handle card entries
      if (entry.type === 'card') {
        yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: entry.cardType, cardData: entry.cardData } };
      }
    }

    // Store assistant response in history
    if (assistantText) {
      session.messages.push({ role: 'assistant', content: assistantText });
    }

    // If all data collected, generate report
    if (triggerReport) {
      yield { event: 'progress_step', data: { step: 4, status: 'active' } };
      yield { event: 'stage', data: { stage: 'report-gen', label: 'Research' } };

      // Show progress bar in chat while generating
      yield { event: 'chat_progress', data: {
        title: 'Building Your Growth Strategy',
        steps: [
          'Analyzing your market & competitors',
          'Identifying target audiences',
          'Mapping advertising channels',
          'Calculating budget allocation',
          'Compiling growth report'
        ]
      } };

      // Agent transparency: show what we're doing (9-section Lovart framework)
      yield { event: 'agent_action', data: { id: 'rpt1', text: 'Identifying growth opportunity...', duration: 2500 } };
      yield { event: 'agent_action', data: { id: 'rpt2', text: 'Mapping competitive landscape...', duration: 3000 } };
      yield { event: 'agent_action', data: { id: 'rpt3', text: 'Deep-diving competitor strategies...', duration: 2500 } };
      yield { event: 'agent_action', data: { id: 'rpt4', text: 'Building ideal customer profile...', duration: 2000 } };
      yield { event: 'agent_action', data: { id: 'rpt5', text: 'Analyzing geographic opportunities...', duration: 2000 } };
      yield { event: 'agent_action', data: { id: 'rpt6', text: 'Researching SEO & keyword gaps...', duration: 2500 } };
      yield { event: 'agent_action', data: { id: 'rpt7', text: 'Constructing 6-month growth roadmap...', duration: 2500 } };
      yield { event: 'agent_action', data: { id: 'rpt8', text: 'Compiling consulting-grade GTM report...', duration: 3000 } };

      // Generate report (with keepalive heartbeats to prevent browser timeout)
      var reportResult = null;
      var reportDone = false;
      var reportErr = null;
      generateReport(session).then(function(r) {
        reportResult = r;
        reportDone = true;
      }).catch(function(e) {
        reportErr = e;
        reportDone = true;
      });
      while (!reportDone) {
        yield { event: 'keepalive', data: { status: 'generating' } };
        await sleep(3000);
      }
      var report = reportResult;
      if (reportErr) console.error('Report generation error:', reportErr.message);
      session.report = report;
      session.stage = 'strategy';

      // Dismiss the chat progress bar
      yield { event: 'chat_progress_done', data: {} };

      if (report) {
        yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'progress', cardData: {
          title: 'Researching Your Market',
          steps: [
            { text: 'Analyzing market size & trends' },
            { text: 'Identifying competitors' },
            { text: 'Mapping target audiences' },
            { text: 'Building channel strategy' },
            { text: 'Compiling growth report' }
          ]
        } } };

        yield { event: 'message', data: { type: 'text', sender: 'auxora', text: 'Your Go-to-Market Strategy Report is ready — 9 sections of consulting-grade analysis covering your growth opportunity, competitors, customers, and a full 6-month roadmap.' } };

        yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'gtm-report', cardData: report } };

        yield { event: 'stage', data: { stage: 'strategy', label: 'Strategy' } };

        // Next-step buttons so user doesn't have to type
        yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'action', cardData: {
          id: 'post-report-actions',
          severity: 'success',
          title: 'What would you like to do next?',
          body: 'You can explore your strategy or start connecting your ad accounts to launch campaigns.',
          actions: ['Start executing', 'Tell me more about the strategy', 'Adjust the budget']
        } } };
      }
    }

    yield { event: 'done', data: {} };

  } catch (err) {
    console.error('Claude API error:', err.message);
    yield { event: 'message', data: { type: 'text', sender: 'auxora', text: 'I had a brief hiccup. Could you repeat that?' } };
    yield { event: 'done', data: {} };
  }
}

// ─── STRATEGY STAGE (Claude-driven) ─────────────────

async function* processStrategyMessage(session, userText) {
  try {
    // Direct handling for known button actions — skip Claude call
    var lowerText = userText.toLowerCase().trim();
    if (lowerText === 'start executing' || lowerText === 'let\'s get started' || lowerText === 'let\'s go' || lowerText === 'move to execution') {
      // Route to competitor research first (before execution-setup)
      session.stage = 'competitor-research';
      session.subStep = 0;
      yield { event: 'stage', data: { stage: 'competitor-research', label: 'Competitor Research' } };
      yield { event: 'progress_step', data: { step: 1, status: 'active' } };
      yield* processCompetitorResearch(session, userText);
      return;
    }

    var systemPrompt = buildStrategyPrompt(session);
    var response = await callClaude(systemPrompt, session.messages);
    var entries = parseClaudeResponse(response);

    if (!entries || !Array.isArray(entries)) {
      yield { event: 'message', data: { type: 'text', sender: 'auxora', text: 'Great question! Let me think about that in context of your growth strategy.' } };
      yield { event: 'done', data: {} };
      return;
    }

    var assistantText = '';

    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];

      if (entry.type === 'text') {
        assistantText += (assistantText ? ' ' : '') + entry.text;
        yield { event: 'message', data: { type: 'text', sender: 'auxora', text: entry.text } };
      }

      if (entry.type === 'stage_transition' && entry.to === 'execution-setup') {
        // Route through competitor research first
        session.stage = 'competitor-research';
        session.subStep = 0;
        yield { event: 'stage', data: { stage: 'competitor-research', label: 'Competitor Research' } };
        yield { event: 'progress_step', data: { step: 1, status: 'active' } };
        yield* processCompetitorResearch(session, userText);
      }
    }

    if (assistantText) {
      session.messages.push({ role: 'assistant', content: assistantText });
    }

    // Always offer next-step buttons if we haven't transitioned stages
    if (session.stage === 'strategy') {
      yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'action', cardData: {
        id: 'strategy-actions-' + Date.now(),
        severity: 'info',
        title: 'Next steps',
        body: '',
        actions: ['Start executing', 'Ask another question', 'Adjust the strategy']
      } } };
    }

    yield { event: 'done', data: {} };

  } catch (err) {
    console.error('Strategy Claude error:', err.message);
    yield { event: 'message', data: { type: 'text', sender: 'auxora', text: 'Let me try that again. What would you like to do with your growth strategy?' } };
    yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'action', cardData: {
      id: 'strategy-retry-actions',
      severity: 'info',
      title: 'Next steps',
      body: '',
      actions: ['Start executing', 'Try again']
    } } };
    yield { event: 'done', data: {} };
  }
}

// ═══════════════════════════════════════════════════════════
// ACT 1: EXECUTION SETUP — Scripted OAuth flow
// ═══════════════════════════════════════════════════════════

async function* processExecutionSetup(session, userText) {
  var step = session.subStep;
  var lower = userText.toLowerCase();

  if (step === 0) {
    // User picked a platform (Shopify, etc.)
    session.subStep = 1;
    yield { event: 'message', data: { type: 'text', sender: 'auxora', text: 'Great choice! Let\'s connect your Shopify store first.' } };
    yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'connection', cardData: {
      title: 'Connect Shopify',
      platform: 'shopify',
      description: 'I\'ll only read your products and orders — I can\'t change anything.',
      permissions: {
        will: ['Product catalog', 'Order history', 'Customer data'],
        wont: ['Store settings', 'Payment processing', 'Theme files']
      },
      actions: ['Connect Shopify Securely']
    } } };

  } else if (step === 1) {
    // User clicked Connect Shopify
    session.connections.shopify = true;
    session.subStep = 2;
    yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'progress', cardData: {
      title: 'Connecting Shopify',
      steps: [
        { text: 'Logging into Shopify' },
        { text: 'Reading product catalog' },
        { text: 'Syncing order history' },
        { text: 'Setting up tracking hooks' }
      ]
    } } };
    yield { event: 'progress_step', data: { step: 1, status: 'complete' } };
    yield { event: 'progress_step', data: { step: 2, status: 'active' } };
    yield { event: 'canvas_update', data: { view: 'setup-dashboard', connections: session.connections, step: 1 } };
    yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'milestone', cardData: {
      icon: 'check', title: 'Shopify Connected', body: '5 products synced, 142 orders imported.',
      summary: '', actions: []
    } } };
    yield { event: 'message', data: { type: 'text', sender: 'auxora', text: 'One down! Now let\'s connect your Meta (Facebook/Instagram) ads account.' } };
    yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'connection', cardData: {
      title: 'Connect Meta (Facebook/Instagram)',
      platform: 'meta',
      description: 'I\'ll manage your ad campaigns and read performance data.',
      permissions: {
        will: ['Create & manage ad campaigns', 'Read ad performance', 'Manage audiences'],
        wont: ['Post to your pages', 'Access messages', 'Change page settings']
      },
      actions: ['Connect Meta Securely']
    } } };

  } else if (step === 2) {
    // User clicked Connect Meta
    session.connections.meta = true;
    session.subStep = 3;
    yield { event: 'progress_step', data: { step: 2, status: 'complete' } };
    yield { event: 'progress_step', data: { step: 3, status: 'active' } };
    yield { event: 'canvas_update', data: { view: 'setup-dashboard', connections: session.connections, step: 2 } };
    yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'milestone', cardData: {
      icon: 'check', title: 'Meta Connected', body: 'Ad account verified. Business Manager linked.',
      summary: '', actions: []
    } } };
    yield { event: 'message', data: { type: 'text', sender: 'auxora', text: 'Halfway there! Now let\'s connect Google Ads.' } };
    yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'connection', cardData: {
      title: 'Connect Google Ads',
      platform: 'google',
      description: 'I\'ll create and manage search & shopping campaigns for you.',
      permissions: {
        will: ['Create & manage campaigns', 'Set budgets & bids', 'Read performance data'],
        wont: ['Access Gmail', 'Change account settings', 'Access other Google services']
      },
      actions: ['Connect Google Securely', 'I don\'t have Google Ads']
    } } };

  } else if (step === 3) {
    // User clicked Connect Google
    session.connections.google = true;
    session.subStep = 4;
    yield { event: 'progress_step', data: { step: 3, status: 'complete' } };
    yield { event: 'progress_step', data: { step: 4, status: 'active' } };
    yield { event: 'canvas_update', data: { view: 'setup-dashboard', connections: session.connections, step: 3 } };
    yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'milestone', cardData: {
      icon: 'check', title: 'Google Ads Connected', body: 'Account verified. Ready for campaigns.',
      summary: '', actions: []
    } } };
    yield { event: 'message', data: { type: 'text', sender: 'auxora', text: 'Almost done! Last step: I\'ll install tracking on your website.' } };
    yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'action', cardData: {
      title: 'Install Website Tracking',
      body: 'I\'ll add tracking code from Meta and Google to your Shopify store. This is how I measure which ads bring you customers.',
      detail: 'This is standard — every store running ads has this. It doesn\'t slow down your site.',
      severity: 'info',
      actions: ['Yes, install it', 'Tell me more first']
    } } };

  } else if (step === 4) {
    // User approved tracking install
    session.connections.tracking = true;
    session.subStep = 5;
    yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'progress', cardData: {
      title: 'Installing Tracking',
      steps: [
        { text: 'Installing Meta Pixel' },
        { text: 'Installing Google Tags' },
        { text: 'Configuring conversion events' },
        { text: 'Verifying data flow' }
      ]
    } } };
    yield { event: 'progress_step', data: { step: 4, status: 'complete' } };
    yield { event: 'canvas_update', data: { view: 'setup-dashboard', connections: session.connections, step: 4 } };
    yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'milestone', cardData: {
      icon: 'shield',
      title: 'Setup Complete!',
      body: 'All 4 accounts connected and verified.',
      summary: 'Shopify: 5 products synced | Meta: Ad account ready | Google: Account verified | Tracking: All events firing',
      actions: ['Let\'s plan campaigns']
    } } };

  } else if (step === 5) {
    // User clicked "Let's plan campaigns" — transition to campaign planning
    session.stage = 'campaign-planning';
    session.subStep = 0;
    yield { event: 'stage', data: { stage: 'campaign-planning', label: 'Campaign Planning' } };
    yield { event: 'progress_step', data: { step: 1, status: 'active' } };
    yield { event: 'canvas_update', data: { view: 'campaign-plan' } };
    yield { event: 'message', data: { type: 'text', sender: 'auxora', text: 'Based on your GTM strategy, I\'ve built a complete campaign plan. Let\'s review 8 key decisions together.' } };
    yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'action', cardData: {
      number: 1, total: 8,
      title: 'Monthly Budget',
      body: '$13,000 over 31 days across 3 phases:\n\u2022 Test Phase (10 days): $3,900 \u2014 learn what works\n\u2022 Optimize Phase (15 days): $6,240 \u2014 double down on winners\n\u2022 Scale Phase (6 days): $2,860 \u2014 maximize returns',
      detail: 'We start smaller to learn, then invest more in what\'s working.',
      severity: 'info',
      actions: ['Looks good', 'Adjust budget', 'Explain more']
    } } };
  }

  yield { event: 'done', data: {} };
}

// ═══════════════════════════════════════════════════════════
// ACT 2: CAMPAIGN PLANNING — 8 approval decisions
// ═══════════════════════════════════════════════════════════

async function* processCampaignPlanning(session, userText) {
  var step = session.subStep;

  if (step === 0) {
    // User approved budget → show channels
    session.decisions.budget = true;
    session.subStep = 1;
    yield { event: 'progress_step', data: { step: 1, status: 'complete' } };
    yield { event: 'progress_step', data: { step: 2, status: 'active' } };
    yield { event: 'message', data: { type: 'text', sender: 'auxora', text: 'Budget confirmed. Next: where your ads will run.' } };
    yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'action', cardData: {
      number: 2, total: 8,
      title: 'Where Your Ads Will Run',
      body: 'Google Ads \u2014 70% of budget\nSearch + Shopping campaigns = people already looking for products like yours\n\nMeta Ads \u2014 30% of budget\nAwareness + Retargeting = find new people + remind visitors to buy',
      detail: 'Google captures people actively searching. Meta introduces your brand to new potential customers and reminds visitors who didn\'t buy yet.',
      severity: 'info',
      actions: ['Confirmed', 'More on Meta', 'More on Google']
    } } };

  } else if (step === 1) {
    // User approved channels → show objective
    session.decisions.channels = true;
    session.subStep = 2;
    yield { event: 'progress_step', data: { step: 2, status: 'complete' } };
    yield { event: 'progress_step', data: { step: 3, status: 'active' } };
    yield { event: 'message', data: { type: 'text', sender: 'auxora', text: 'Channels locked in. Now: what should your ads try to do?' } };
    yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'objective-picker', cardData: 'plan_objective' } };

  } else if (step === 2) {
    // User approved objective → show structure
    session.decisions.objective = userText || 'Sales';
    session.subStep = 3;
    yield { event: 'progress_step', data: { step: 3, status: 'complete' } };
    yield { event: 'progress_step', data: { step: 4, status: 'active' } };
    yield { event: 'message', data: { type: 'text', sender: 'auxora', text: 'Great choice. Your product is high-AOV, so I\'m using a 1-4-2 structure to test audiences quickly.' } };
    yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'campaign-structure', cardData: 'plan_structure' } };

  } else if (step === 3) {
    // User approved structure → show audiences
    session.decisions.structure = true;
    session.subStep = 4;
    yield { event: 'progress_step', data: { step: 4, status: 'complete' } };
    yield { event: 'progress_step', data: { step: 5, status: 'active' } };
    yield { event: 'message', data: { type: 'text', sender: 'auxora', text: 'Structure locked. Now: who will see your ads.' } };
    yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'audience-builder', cardData: 'plan_audiences_enhanced' } };

  } else if (step === 4) {
    // User approved audiences → show budget allocation
    session.decisions.audiences = true;
    session.subStep = 5;
    yield { event: 'progress_step', data: { step: 5, status: 'complete' } };
    yield { event: 'progress_step', data: { step: 6, status: 'active' } };
    yield { event: 'message', data: { type: 'text', sender: 'auxora', text: 'Audiences confirmed. Here\'s how I split the budget across them.' } };
    yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'budget-waterfall', cardData: 'plan_budget_allocation' } };
    yield { event: 'canvas_update', data: { view: 'budget-waterfall-canvas' } };

  } else if (step === 5) {
    // User approved budget allocation → show creatives
    session.decisions.budgetAllocation = true;
    session.subStep = 6;
    yield { event: 'progress_step', data: { step: 6, status: 'complete' } };
    yield { event: 'progress_step', data: { step: 7, status: 'active' } };
    yield { event: 'message', data: { type: 'text', sender: 'auxora', text: 'Budget allocation locked. Now let\'s look at your ad creatives.' } };
    yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'creative-preview', cardData: 'plan_creatives_enhanced' } };

  } else if (step === 6) {
    // User approved creatives → show review summary
    session.decisions.creatives = true;
    session.subStep = 7;
    yield { event: 'progress_step', data: { step: 7, status: 'complete' } };
    yield { event: 'progress_step', data: { step: 8, status: 'active' } };
    yield { event: 'message', data: { type: 'text', sender: 'auxora', text: 'Here\'s the full plan at a glance. Confirm to launch!' } };
    yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'review-summary', cardData: 'plan_review_summary' } };
    yield { event: 'canvas_update', data: { view: 'campaign-plan-approved' } };

  } else if (step === 7) {
    // User approved review → plan complete, transition to launch
    session.decisions.reviewApproved = true;
    session.subStep = 8;
    yield { event: 'progress_step', data: { step: 8, status: 'complete' } };
    yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'milestone', cardData: {
      icon: 'rocket',
      title: 'Campaign Plan Approved!',
      body: 'All 8 decisions confirmed. Your campaigns are ready to launch.',
      summary: 'Budget: $13K/month | 1-4-2 structure | 4 audience groups | 4 categories of creatives | Remarketing capped at 25%',
      actions: ['Launch campaigns now']
    } } };

  } else if (step === 8) {
    // User clicked "Launch campaigns now" — transition to launch
    session.stage = 'launch';
    session.subStep = 0;
    yield { event: 'stage', data: { stage: 'launch', label: 'Launch' } };
    yield { event: 'progress_step', data: { step: 1, status: 'active' } };
    yield* processLaunchSequence(session);
  }

  yield { event: 'done', data: {} };
}

// ═══════════════════════════════════════════════════════════
// ACT 3: LAUNCH — Automated campaign creation
// ═══════════════════════════════════════════════════════════

async function* processLaunchSequence(session) {
  yield { event: 'message', data: { type: 'text', sender: 'auxora', text: 'Launching your campaigns now! Watch the agent activity below:' } };

  // Agent action events for real-time transparency
  yield { event: 'agent_action', data: { id: 'la1', text: 'Configuring Meta pixel events...', duration: 2000 } };
  yield { event: 'agent_action', data: { id: 'la2', text: 'Creating 4 audience segments on Meta...', duration: 2500 } };
  yield { event: 'agent_action', data: { id: 'la3', text: 'Setting bid strategy: lowest cost with cap...', duration: 1500 } };
  yield { event: 'agent_action', data: { id: 'la4', text: 'Uploading 8 ad creatives to Meta...', duration: 3000 } };
  yield { event: 'agent_action', data: { id: 'la5', text: 'Creating Google Search campaign...', duration: 2000 } };
  yield { event: 'agent_action', data: { id: 'la6', text: 'Creating Google Shopping campaign...', duration: 2000 } };
  yield { event: 'agent_action', data: { id: 'la7', text: 'Setting daily budgets: $420/day CBO...', duration: 1500 } };
  yield { event: 'agent_action', data: { id: 'la8', text: 'Submitting Meta campaigns for review...', duration: 2000 } };
  yield { event: 'agent_action', data: { id: 'la9', text: 'Activating Google campaigns...', duration: 1500 } };
  yield { event: 'agent_action', data: { id: 'la10', text: 'Final verification: all tracking events firing...', duration: 2000 } };

  yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'progress', cardData: {
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
  } } };

  yield { event: 'progress_step', data: { step: 2, status: 'active' } };
  yield { event: 'canvas_update', data: { view: 'launch-dashboard' } };
  yield { event: 'progress_step', data: { step: 3, status: 'active' } };
  yield { event: 'progress_step', data: { step: 4, status: 'active' } };

  // "You're Live!" milestone
  yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'milestone', cardData: {
    icon: 'rocket',
    title: 'You\'re Live!',
    body: '5 campaigns running across Google and Meta.',
    summary: 'Google: 2 campaigns (Search + Shopping) \u2014 Active\nMeta: 3 campaigns (Awareness + Retargeting + Lookalike) \u2014 Active/In Review',
    actions: []
  } } };

  // Enhanced "What to Expect" with learning phase expectations
  yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'report', cardData: 'learning_phase_expectations' } };

  yield { event: 'message', data: { type: 'text', sender: 'auxora', text: 'Sit back and relax. I\'ll message you with your first results in 48 hours.' } };

  // Transition to monitoring
  session.stage = 'monitoring';
  session.subStep = 0;
  yield { event: 'progress_step', data: { step: 4, status: 'complete' } };
  yield { event: 'tab_switch', data: { tab: 'openclaw' } };
  yield { event: 'stage', data: { stage: 'monitoring', label: 'Monitoring' } };
  yield { event: 'canvas_update', data: { view: 'openclaw-dashboard' } };
  yield { event: 'progress_step', data: { step: 1, status: 'active' } };

  yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'action', cardData: {
    title: 'See Your First Results',
    body: 'Click below to see what happened in the first 48 hours.',
    severity: 'success',
    actions: ['Show 48-hour results']
  } } };
}

async function* processLaunch(session, userText) {
  // If user sends any message during launch, continue to launch sequence
  yield* processLaunchSequence(session);
  yield { event: 'done', data: {} };
}

// ═══════════════════════════════════════════════════════════
// ACT 4: MONITORING — First results and weekly reports
// ═══════════════════════════════════════════════════════════

async function* processMonitoring(session, userText) {
  var step = session.subStep;

  if (step === 0) {
    // Show 48-hour first briefing with positive-first format
    session.subStep = 1;
    yield { event: 'tab_switch', data: { tab: 'results' } };
    yield { event: 'canvas_update', data: { view: 'results-early' } };
    yield { event: 'progress_step', data: { step: 1, status: 'complete' } };
    yield { event: 'progress_step', data: { step: 2, status: 'active' } };

    // Daily spend tracker on canvas
    yield { event: 'canvas_update', data: { view: 'daily-spend-tracker' } };

    yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'report', cardData: 'daily_briefing_enhanced' } };

    yield { event: 'message', data: { type: 'text', sender: 'auxora', text: 'Two sales already \u2014 you\'re ahead of schedule! Before we continue, how would you like me to send you updates?' } };

    // Notification preference card
    yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'notification-settings', cardData: 'notification_preference' } };

  } else if (step === 1) {
    // User chose notification preference → show Week 1 report prompt
    session.notificationPolicy = userText.toLowerCase().includes('daily') ? 'daily' :
      userText.toLowerCase().includes('passive') ? 'passive' : 'weekly';
    session.subStep = 2;
    yield { event: 'message', data: { type: 'text', sender: 'auxora', text: 'Got it \u2014 ' + (session.notificationPolicy === 'weekly' ? 'weekly reports every Monday' : session.notificationPolicy === 'daily' ? 'daily briefings' : 'dashboard only, you check when you want') + '. I\'ll only break the pattern for emergencies.' } };
    yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'action', cardData: {
      title: 'Week 1 Report Ready',
      body: 'Full performance report with breakdown by channel and audience.',
      severity: 'success',
      actions: ['Show Week 1 report']
    } } };

  } else if (step === 2) {
    // Week 1 report
    session.subStep = 3;
    yield { event: 'canvas_update', data: { view: 'results-week1' } };
    yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'report', cardData: {
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
          'Organic Buyers audience \u2014 spent $94, only 1 sale',
          'Static image ads \u2014 underperforming vs video'
        ]},
        { title: 'Bottom Line', items: [
          'For every $1 you spent on ads, you got $2.92 back.',
          'Your ads are profitable from week 1!'
        ]}
      ]
    } } };
    yield { event: 'message', data: { type: 'text', sender: 'auxora', text: 'I have 3 recommendations for next week. Ready to see them?' } };
    yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'action', cardData: {
      title: 'Recommendations Ready',
      body: '3 optimizations to improve your Week 2 results.',
      severity: 'success',
      actions: ['Yes, show me']
    } } };

  } else if (step === 3) {
    // Week 1 recommendations — rec 1
    session.subStep = 4;
    yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'action', cardData: {
      number: 1, total: 3,
      title: 'Invest More in Wagyu Enthusiasts',
      body: 'This audience has your best results:\n\u2022 $28 per customer (lowest cost)\n\u2022 $4.05 return for every $1 spent\n\u2022 I want to show ads to 30% more people in this group.',
      severity: 'success',
      actions: ['Approve', 'Adjust', 'Skip']
    } } };

  } else if (step === 4) {
    // Rec 2
    session.subStep = 5;
    yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'action', cardData: {
      number: 2, total: 3,
      title: 'Pause Organic Buyers (for now)',
      body: 'Spent $94, only 1 sale. Costing more than they bring in.\nI\'ll redirect that budget to audiences that are working.',
      severity: 'warning',
      actions: ['Approve', 'Keep running', 'Skip']
    } } };

  } else if (step === 5) {
    // Rec 3
    session.subStep = 6;
    yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'action', cardData: {
      number: 3, total: 3,
      title: 'Create New Video Based on Sizzle Reel',
      body: 'Your Sizzle Reel outperforms everything \u2014 3.8% click rate.\nI want to create a similar version to test if we can beat it.',
      severity: 'info',
      actions: ['Approve', 'Skip']
    } } };

  } else if (step === 6) {
    // All recs approved → Week 2 report
    session.subStep = 7;
    yield { event: 'message', data: { type: 'text', sender: 'auxora', text: 'All 3 recommendations applied! Let\'s see how Week 2 went:' } };
    yield { event: 'progress_step', data: { step: 2, status: 'complete' } };
    yield { event: 'progress_step', data: { step: 3, status: 'active' } };
    yield { event: 'canvas_update', data: { view: 'results-week1vs2' } };
    yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'report', cardData: {
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
    } } };
    yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'action', cardData: {
      title: 'Move to Phase 2: Optimization',
      body: 'Budget increase: $390/week \u2192 $590/week\nFocus on proven winners\nTest 2 new audiences to find more growth',
      severity: 'success',
      actions: ['Let\'s do it', 'Tell me more', 'Stay in Phase 1']
    } } };

  } else if (step === 7) {
    // Transition to optimization
    session.stage = 'optimization';
    session.subStep = 0;
    yield { event: 'stage', data: { stage: 'optimization', label: 'Optimization' } };
    yield { event: 'progress_step', data: { step: 1, status: 'active' } };
    yield { event: 'tab_switch', data: { tab: 'openclaw' } };
    yield { event: 'canvas_update', data: { view: 'openclaw-dashboard' } };
    yield { event: 'message', data: { type: 'text', sender: 'auxora', text: 'Phase 2 is active! Budget increased to $590/week. OpenClaw is monitoring 24/7.' } };
    yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'action', cardData: {
      title: 'Continue to Week 3',
      body: 'OpenClaw detected something you should see.',
      severity: 'warning',
      actions: ['Show me']
    } } };
  }

  yield { event: 'done', data: {} };
}

// ═══════════════════════════════════════════════════════════
// ACT 5: OPTIMIZATION — Alerts, auto-actions, Week 3-4
// ═══════════════════════════════════════════════════════════

async function* processOptimization(session, userText) {
  var step = session.subStep;

  if (step === 0) {
    // OpenClaw Alert
    session.subStep = 1;
    yield { event: 'agent_action', data: { id: 'oc1', text: 'Analyzing audience performance metrics...', duration: 2000 } };
    yield { event: 'agent_action', data: { id: 'oc2', text: 'Detected anomaly: CPA spike in Health & Wellness...', duration: 1500 } };
    yield { event: 'agent_action', data: { id: 'oc3', text: 'Calculating budget reallocation options...', duration: 2000 } };
    yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'alert', cardData: {
      title: 'Cost Per Customer Spiked',
      severity: 'warning',
      confidence: '81%',
      body: 'Health & Wellness audience: cost per customer jumped from $34 to $52 (+53%) in the last 24 hours.',
      cause: 'People are seeing the same ad too many times. After 8.4 views each, click rates drop \u2014 this is called "ad fatigue."',
      recommendation: 'Pause this audience and move $60/week to Wagyu Enthusiasts (which has 4.5x return).',
      actions: ['Approve \u2014 pause and reallocate', 'Keep running', 'Tell me more']
    } } };
    yield { event: 'canvas_update', data: { view: 'openclaw-alert' } };

  } else if (step === 1) {
    var lower = userText.toLowerCase();
    if (lower === 'undo' || lower.includes('undo')) {
      // Undo confirmation flow
      yield { event: 'message', data: { type: 'text', sender: 'auxora', text: 'Are you sure? Reverting will re-enable 12 previously blocked search terms. Estimated cost: ~$45/week in wasted spend.' } };
      yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'action', cardData: {
        title: 'Confirm Undo',
        body: 'This will restore the 12 negative keywords that were automatically blocked.',
        severity: 'warning',
        actions: ['Yes, undo it', 'Never mind, keep them blocked']
      } } };
      // Don't advance subStep — stay at 1 so next message continues
      yield { event: 'done', data: {} };
      return;
    }

    // Alert approved → auto-action notification
    session.subStep = 2;
    yield { event: 'progress_step', data: { step: 1, status: 'complete' } };
    yield { event: 'progress_step', data: { step: 2, status: 'active' } };
    yield { event: 'agent_action', data: { id: 'oc4', text: 'Pausing Health & Wellness audience...', duration: 1500 } };
    yield { event: 'agent_action', data: { id: 'oc5', text: 'Reallocating $60/week to Wagyu Enthusiasts...', duration: 1500 } };
    yield { event: 'message', data: { type: 'text', sender: 'auxora', text: 'Done! Audience paused, budget reallocated. Here\'s something else OpenClaw did automatically:' } };
    yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'auto-action', cardData: {
      title: 'Added 12 Negative Keywords',
      timestamp: '2:14 PM',
      body: 'Blocked search terms that were wasting money \u2014 people searching for "wagyu restaurant near me" were clicking your ads but not buying (they want restaurants, not delivery).',
      impact: 'Estimated savings: ~$45/week',
      policy: 'Pre-authorized (negative keywords)',
      actions: ['View Details', 'Undo']
    } } };
    yield { event: 'canvas_update', data: { view: 'openclaw-actions' } };
    yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'action', cardData: {
      title: 'Week 3 Report Ready',
      body: 'Your results keep improving.',
      severity: 'success',
      actions: ['Show Week 3 report']
    } } };

  } else if (step === 2) {
    // Week 3 report
    session.subStep = 3;
    yield { event: 'progress_step', data: { step: 2, status: 'complete' } };
    yield { event: 'progress_step', data: { step: 3, status: 'active' } };
    yield { event: 'tab_switch', data: { tab: 'results' } };
    yield { event: 'canvas_update', data: { view: 'results-week3' } };
    yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'report', cardData: {
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
          'Revenue trend: $1,134 \u2192 $1,890 \u2192 $3,450'
        ]},
        { title: 'Top Performers', items: [
          'Wagyu Enthusiasts: 14 purchases, $5.92 return per $1',
          'Gift Buyers (new): 5 purchases, solid start',
          'Sizzle Reel v2: 4.1% click rate \u2014 new best'
        ]}
      ]
    } } };
    yield { event: 'message', data: { type: 'text', sender: 'auxora', text: '$3,450 in one week! Let\'s see the Month 1 final results.' } };
    yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'action', cardData: {
      title: 'Month 1 Complete',
      body: 'Week 4 report and Phase 2 milestone are ready.',
      severity: 'success',
      actions: ['Show Month 1 results']
    } } };

  } else if (step === 3) {
    // Week 4 + Phase 2 milestone
    session.subStep = 4;
    yield { event: 'progress_step', data: { step: 3, status: 'complete' } };
    yield { event: 'progress_step', data: { step: 4, status: 'active' } };
    yield { event: 'canvas_update', data: { view: 'results-month1' } };
    yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'report', cardData: {
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
    } } };
    yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'milestone', cardData: {
      icon: 'trophy',
      title: 'Phase 2 Target Reached!',
      body: '$7.78 return per $1 \u2014 that\'s $7.78 back for every $1 you spend on ads.',
      summary: 'Exceeded the 3.0x target by 159%!\nMonth 1 total: $12,254 revenue, $2,131 spend, $10,123 net profit.',
      sparkline: [2.92, 4.59, 5.86, 7.78],
      actions: ['Scale to Phase 3', 'Stay at current level']
    } } };

  } else if (step === 4) {
    // Transition to scaling
    session.stage = 'scaling';
    session.subStep = 0;
    yield { event: 'progress_step', data: { step: 4, status: 'complete' } };
    yield { event: 'stage', data: { stage: 'scaling', label: 'Scaling' } };
    yield { event: 'progress_step', data: { step: 1, status: 'complete' } };
    yield { event: 'progress_step', data: { step: 2, status: 'active' } };
    yield* processScalingPlan(session);
  }

  yield { event: 'done', data: {} };
}

// ═══════════════════════════════════════════════════════════
// ACT 6: SCALING — Growth to revenue goal
// ═══════════════════════════════════════════════════════════

async function* processScalingPlan(session) {
  yield { event: 'tab_switch', data: { tab: 'execution' } };
  yield { event: 'canvas_update', data: { view: 'scaling-plan' } };
  yield { event: 'message', data: { type: 'text', sender: 'auxora', text: 'Phase 3: Time to scale! Here are 3 growth moves:' } };

  yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'action', cardData: {
    number: 1, total: 3,
    title: 'Scale Budget to $1,500/week',
    body: 'Your 6.08x return justifies much higher spend.\nAt $1,500/week, projected: 60+ purchases, $9K+ revenue weekly.',
    detail: 'We\'ll increase gradually over 2 weeks to maintain performance.',
    severity: 'success',
    actions: ['Approve', 'Adjust amount', 'Skip']
  } } };
}

async function* processScaling(session, userText) {
  var step = session.subStep;

  if (step === 0) {
    // User approved budget scale → TikTok
    session.subStep = 1;
    yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'action', cardData: {
      number: 2, total: 3,
      title: 'Add TikTok Ads',
      body: 'Your video ads perform great \u2014 TikTok is a natural fit.\nTest with 10% of budget ($150/week) to start.',
      detail: 'Video-first platform. Your Sizzle Reel style content would perform well here.',
      severity: 'info',
      actions: ['Approve', 'Skip']
    } } };

  } else if (step === 1) {
    // TikTok approved → Email
    session.subStep = 2;
    yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'action', cardData: {
      number: 3, total: 3,
      title: 'Launch Email Retargeting',
      body: '77 customers so far. Repeat orders at zero ad cost.\nEmail campaigns for: welcome series, reorder reminders, new product launches.',
      detail: 'Your existing customers already love your product. Email drives repeat purchases with zero ad spend.',
      severity: 'success',
      actions: ['Approve', 'Skip']
    } } };

  } else if (step === 2) {
    // All scaling approved → Month 2 report
    session.subStep = 3;
    yield { event: 'progress_step', data: { step: 2, status: 'complete' } };
    yield { event: 'progress_step', data: { step: 3, status: 'active' } };
    yield { event: 'message', data: { type: 'text', sender: 'auxora', text: 'All scaling moves approved! Fast forward to Month 2 results:' } };
    yield { event: 'tab_switch', data: { tab: 'results' } };
    yield { event: 'canvas_update', data: { view: 'results-month2' } };
    yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'report', cardData: {
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
      ]
    } } };

    // $25K milestone
    yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'milestone', cardData: {
      icon: 'trophy',
      title: '$25,000 Monthly Revenue Milestone!',
      body: '50% of the way to your $50K intermediate target.',
      summary: 'Month 1: $12,254 \u2192 Month 2: $25,420 (+107% growth)\n159 total customers, 82 repeat buyers\nOn track for $50K by Month 4',
      sparkline: [12254, 25420, 38000, 50000],
      actions: ['View Month 3 plan', 'Download report']
    } } };

  } else if (step === 3) {
    // Final — steady state message
    session.subStep = 4;
    yield { event: 'progress_step', data: { step: 3, status: 'complete' } };
    yield { event: 'progress_step', data: { step: 4, status: 'active' } };
    yield { event: 'message', data: { type: 'text', sender: 'auxora', text: 'Here\'s your ongoing rhythm:' } };
    yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'report', cardData: {
      title: 'YOUR WEEKLY RHYTHM',
      icon: 'calendar',
      sections: [
        { title: 'Monday Morning', items: [
          'Weekly performance report with key metrics',
          '2-4 recommendations to approve'
        ]},
        { title: 'Daily', items: [
          'Quick briefing: spend, revenue, any issues',
          '"Nothing needs your attention" on good days'
        ]},
        { title: 'Real-time', items: [
          'OpenClaw alerts if issues detected (you approve the fix)',
          'Auto-actions for pre-authorized optimizations (negative keywords, bid adjustments)'
        ]},
        { title: 'Monthly', items: [
          'Full performance report with growth trajectory',
          'Milestone celebrations as you hit targets',
          'Strategy adjustments for next growth phase'
        ]}
      ]
    } } };
    yield { event: 'message', data: { type: 'text', sender: 'auxora', text: '5 minutes on Monday, approve a few things, go back to your business. Revenue keeps growing. That\'s the Auxora experience.' } };
    yield { event: 'progress_step', data: { step: 4, status: 'complete' } };
    yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'milestone', cardData: {
      icon: 'star',
      title: 'Demo Complete',
      body: 'You\'ve seen the full Auxora journey: from discovery to $25K/month and growing.',
      summary: 'This wireframe covers the complete user experience.\nReady to build the real thing?',
      actions: ['Start over', 'View all results']
    } } };
  }

  yield { event: 'done', data: {} };
}

// ─── GREETING ──────────────────────────────────────

async function* getGreeting(sessionId) {
  var session = getSession(sessionId);
  if (!session) {
    yield { event: 'error', data: { error: 'Session not found' } };
    return;
  }

  yield { event: 'progress_step', data: { step: 1, status: 'active' } };
  yield { event: 'typing', data: { show: true } };

  // Use Claude for the greeting too
  try {
    var systemPrompt = buildDiscoveryPrompt(session);
    var messages = [{ role: 'user', content: 'Hi, I just arrived. Greet me briefly — introduce yourself as Auxora, the world\'s first Vibe Business Agent that delivers end-to-end revenue for D2C brands. Mention that what takes an agency 30 days and $12,000, you do in 1 day for $200. Then ask your first question to learn about my business.' }];

    var response = await callClaude(systemPrompt, messages);
    var entries = parseClaudeResponse(response);

    if (!entries || !Array.isArray(entries)) {
      // Fallback greeting
      yield { event: 'message', data: { type: 'text', sender: 'auxora', text: 'Hey! I\'m Auxora — the world\'s first Vibe Business Agent for D2C brands. What takes an agency 30 days & $12,000, I do in 1 day for $200.' } };
      yield { event: 'message', data: { type: 'text', sender: 'auxora', text: 'Strategy, landing page, ads, email, SEO — fully automated and live in 24 hours. Let\'s get you there.' } };
      yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'question', cardData: { question: 'What\'s your website URL?', inputType: 'text', placeholder: 'e.g. mybrand.com' } } };
      yield { event: 'done', data: {} };
      return;
    }

    var assistantText = '';

    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      if (entry.type === 'text') {
        assistantText += (assistantText ? ' ' : '') + entry.text;
        yield { event: 'message', data: { type: 'text', sender: 'auxora', text: entry.text } };
      }
      if (entry.type === 'card') {
        yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: entry.cardType, cardData: entry.cardData } };
      }
    }

    // Store in session history (the hidden user prompt + assistant response)
    session.messages.push({ role: 'user', content: 'Hi, I just arrived. Greet me briefly — introduce yourself as Auxora, the world\'s first Vibe Business Agent that delivers end-to-end revenue for D2C brands. Mention that what takes an agency 30 days and $12,000, you do in 1 day for $200. Then ask your first question to learn about my business.' });
    if (assistantText) {
      session.messages.push({ role: 'assistant', content: assistantText });
    }

  } catch (err) {
    console.error('Greeting error:', err.message);
    // Fallback
    yield { event: 'message', data: { type: 'text', sender: 'auxora', text: 'Hey! I\'m Auxora — the world\'s first Vibe Business Agent for D2C brands. Let me learn about your business.' } };
    yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'question', cardData: { question: 'What\'s your website URL?', inputType: 'text', placeholder: 'e.g. mybrand.com' } } };
  }

  yield { event: 'done', data: {} };
}

// ─── REPORT GENERATION (Enhanced — Opus 4.6 + 12 sections) ───

async function generateReport(session) {
  var d = session.collectedData;
  var businessContext = 'BUSINESS DATA:\n' +
    '- Website: ' + (d.website || 'N/A') + '\n' +
    '- Product/Industry: ' + (d.product || 'N/A') + '\n' +
    '- Current Monthly Revenue: ' + (d.revenue || 'N/A') + '\n' +
    '- Revenue Goal (6 months): ' + (d.goal || 'N/A') + '\n' +
    '- Monthly Ad Budget: ' + (d.budget || 'N/A');

  // Include any fetched URL content as enrichment
  if (session.urlContent) {
    businessContext += '\n\nADDITIONAL REFERENCE MATERIAL (from URL):\n' +
      'Title: ' + (session.urlContent.title || 'N/A') + '\n' +
      'Content:\n' + (session.urlContent.text || '').substring(0, 4000);
  }

  // Helper: race API call against a timeout
  function withTimeout(promise, ms) {
    return new Promise(function(resolve, reject) {
      var timer = setTimeout(function() { reject(new Error('Report generation timed out after ' + (ms/1000) + 's')); }, ms);
      promise.then(function(v) { clearTimeout(timer); resolve(v); }).catch(function(e) { clearTimeout(timer); reject(e); });
    });
  }

  // Fallback: use template from mock data
  function getTemplateFallback() {
    try {
      var v3Data = require('../data/auxora-v3-data');
      var template = (v3Data.cards && v3Data.cards.gtm_report_template) || (v3Data.canvasData && v3Data.canvasData.gtm_report_template);
      if (template) {
        console.log('Using GTM report template as fallback');
        var copy = JSON.parse(JSON.stringify(template));
        if (d.website) copy.companyName = d.website.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/.*$/, '');
        return copy;
      }
    } catch (e) { /* ignore */ }
    return null;
  }

  try {
    // Use Sonnet with 90-second timeout — falls back to template if slow
    var response = await withTimeout(client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 10000,
      system: REPORT_PROMPT + '\n\n' + businessContext,
      messages: [{ role: 'user', content: 'Generate the 9-section Go-to-Market Strategy Report as concise JSON. All sections required.' }]
    }), 60000);

    var text = response.content[0].text.trim();
    var report = parseClaudeResponse(text);
    return report;
  } catch (err) {
    console.error('Report generation error:', err.message);
    // Fast fallback to template (no retry — template data is already high quality)
    return getTemplateFallback();
  }
}

// ═══════════════════════════════════════════════════════════
// COMPETITOR RESEARCH — Scripted stage between strategy and execution
// ═══════════════════════════════════════════════════════════

async function* processCompetitorResearch(session, userText) {
  var step = session.subStep;
  var lower = userText.toLowerCase().trim();

  if (step === 0) {
    // Initial entry — show competitor research with agent actions
    session.subStep = 1;
    yield { event: 'agent_action', data: { id: 'cr1', text: 'Scanning competitor ad libraries...', duration: 2000 } };
    yield { event: 'agent_action', data: { id: 'cr2', text: 'Analyzing competitor creative strategies...', duration: 2500 } };
    yield { event: 'agent_action', data: { id: 'cr3', text: 'Estimating competitor ad spend...', duration: 2000 } };
    yield { event: 'agent_action', data: { id: 'cr4', text: 'Building competitive positioning map...', duration: 1500 } };

    yield { event: 'message', data: { type: 'text', sender: 'auxora', text: 'I\'ve researched your top competitors. Here\'s what they\'re doing with ads:' } };

    // Use mock data for competitor research
    var v3Data = require('../data/auxora-v3-data');
    var competitorData = v3Data.cards.competitor_research || {
      competitors: [
        { name: 'Competitor A', website: 'competitor-a.com', monthlySpend: '$8K-12K', topCreatives: 3, strengths: 'Strong video content', weaknesses: 'Limited audience targeting' },
        { name: 'Competitor B', website: 'competitor-b.com', monthlySpend: '$5K-8K', topCreatives: 2, strengths: 'Good retargeting', weaknesses: 'Low creative variety' },
        { name: 'Competitor C', website: 'competitor-c.com', monthlySpend: '$15K-20K', topCreatives: 5, strengths: 'High volume spend', weaknesses: 'Poor ad efficiency' }
      ]
    };

    yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'competitor-research', cardData: competitorData } };

    yield { event: 'progress_step', data: { step: 1, status: 'complete' } };

    yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'action', cardData: {
      id: 'competitor-next',
      severity: 'success',
      title: 'Competitive advantage identified',
      body: 'Based on competitor analysis, I see clear opportunities to differentiate with better creative and smarter targeting.',
      actions: ['Continue to account setup', 'Tell me more about competitors']
    } } };

  } else if (step === 1) {
    // User wants to proceed or ask more
    if (lower.includes('continue') || lower.includes('setup') || lower.includes('account') || lower.includes('let\'s go') || lower.includes('next')) {
      session.stage = 'execution-setup';
      session.subStep = 0;
      yield { event: 'stage', data: { stage: 'execution-setup', label: 'Setup' } };
      yield { event: 'tab_switch', data: { tab: 'execution' } };
      yield { event: 'canvas_update', data: { view: 'setup-dashboard', connections: session.connections } };
      yield { event: 'message', data: { type: 'text', sender: 'auxora', text: 'The hard part is done. Now I just need to connect to your accounts so I can manage everything. This takes about 5 minutes.' } };
      yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'question', cardData: { question: 'What platform is your store on?', inputType: 'chips', options: ['Shopify', 'WooCommerce', 'BigCommerce', 'Other'] } } };
      yield { event: 'progress_step', data: { step: 1, status: 'active' } };
    } else {
      yield { event: 'message', data: { type: 'text', sender: 'auxora', text: 'Based on the competitor analysis, your biggest advantage is in creative quality and audience precision. Most competitors over-spend on broad targeting — we\'ll be smarter with niche audiences and video-first creative.' } };
      yield { event: 'card', data: { type: 'card', sender: 'auxora', cardType: 'action', cardData: {
        id: 'competitor-next-2',
        severity: 'info',
        title: 'Ready to start?',
        body: '',
        actions: ['Continue to account setup', 'Ask another question']
      } } };
    }
  }

  yield { event: 'done', data: {} };
}

module.exports = {
  createSession: createSession,
  getSession: getSession,
  processMessage: processMessage,
  getGreeting: getGreeting
};
