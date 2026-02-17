var express = require('express');
var router = express.Router();
var mock = require('../data/mock');
var alexandarDemo = require('../data/alexandar-demo');
var alexandarConversations = require('../data/alexandar-conversations');
var sakuraDemo = require('../data/sakura-demo');
var vibeDemo = require('../data/vibe-demo');
var auxoraDemo = require('../data/auxora-demo');

function renderAsync(res, template, data) {
  return new Promise(function (resolve) {
    res.app.render(template, data, function (err, html) {
      if (err) console.error('Template render error:', template, err.message);
      resolve(err ? '' : html);
    });
  });
}

function delay(ms) {
  return new Promise(function (resolve) { setTimeout(resolve, ms); });
}

/* ── Landing Page ── */
router.get('/', function (req, res) {
  res.render('guided-layout');
});

/* ── Auxora AI Growth Co-Founder Demo ── */
router.get('/auxora', function (req, res) {
  res.render('auxora/demo', { demo: auxoraDemo });
});

router.get('/auxora/demo', function (req, res) {
  res.render('auxora/demo', { demo: auxoraDemo });
});

router.get('/auxora/onboarding', function (req, res) {
  res.render('auxora/onboarding', { demo: auxoraDemo });
});

router.get('/auxora/execution', function (req, res) {
  res.render('auxora/execution', { demo: auxoraDemo });
});

router.get('/auxora/openclaw', function (req, res) {
  res.render('auxora/openclaw', { demo: auxoraDemo });
});

router.get('/auxora/results', function (req, res) {
  res.render('auxora/results', { demo: auxoraDemo });
});

/* ── Alexandar CGO Demo ── */
router.get('/alexandar', function (req, res) {
  res.render('alexandar/demo', { demo: alexandarDemo });
});

router.get('/alexandar/day/:day', function (req, res) {
  var dayNum = parseInt(req.params.day, 10);
  var day = alexandarDemo.timeline.days.find(function(d) { return d.day === dayNum; });
  if (!day) {
    return res.redirect('/alexandar');
  }
  res.render('alexandar/day', { demo: alexandarDemo, day: day });
});

/* ── Alexandar Interactive Demo ── */
router.get('/alexandar/demo', function (req, res) {
  res.render('alexandar/interactive', { conversations: alexandarConversations });
});

/* ── Sakura SourceFlow Interactive Demo ── */
router.get('/sakura/demo', function (req, res) {
  res.render('sakura/interactive', {
    client: sakuraDemo.client,
    strategy: sakuraDemo.strategy,
    conversations: sakuraDemo.conversations,
  });
});

/* ── Vibe Business Platform Demo ── */
router.get('/vibe/demo', function (req, res) {
  res.render('vibe/interactive', {
    client: vibeDemo.client,
    onboarding: vibeDemo.onboarding,
    execution: vibeDemo.execution,
    weeklyData: vibeDemo.weeklyData,
    conversations: vibeDemo.conversations,
    results: vibeDemo.results,
  });
});

/* ── Research API ── */
router.post('/guided/api/research', async function (req, res) {
  var url = (req.body.url || '').trim();
  var domain = url.replace(/^https?:\/\//, '').replace(/\/.*$/, '') || 'greenhydro.com';

  var html = '';

  html += await renderAsync(res, 'guided/chat-message', {
    msg: { role: 'user', type: 'text', showLabel: true, text: url || domain },
  });

  html += await renderAsync(res, 'guided/chat-message', {
    msg: { role: 'agent', type: 'text', showLabel: true, text: 'Analyzing <strong>' + domain + '</strong>... Let me research your market.' },
  });

  html += await renderAsync(res, 'guided/chat-message', {
    msg: {
      role: 'agent', type: 'progress', steps: [
        { text: 'Analyzing market size & trends', done: true },
        { text: 'Identifying competitors', done: true },
        { text: 'Mapping advertising channels', done: true },
        { text: 'Building customer personas', done: true },
        { text: 'Compiling research report', done: true },
      ],
    },
  });

  var r = mock.strategist.researchResult;
  html += await renderAsync(res, 'guided/chat-message', {
    msg: {
      role: 'agent', type: 'text',
      text: 'Research complete. Found a <strong>' + r.marketSize + '</strong> market growing at ' + r.growthRate + ' with ' + r.competitors.length + ' major competitors and ' + r.channels.length + ' recommended channels.',
    },
  });

  html += await renderAsync(res, 'guided/chat-message', {
    msg: {
      role: 'agent', type: 'artifact-link',
      artifact: { id: 'research', title: 'Market Research', icon: '🎯', description: 'Competitors, channels, personas', route: '/guided/canvas/research' },
    },
  });

  html += await renderAsync(res, 'guided/chat-message', {
    msg: { role: 'agent', type: 'text', text: 'I\'d like to ask you <strong>3 quick questions</strong> to personalize your go-to-market strategy. Ready?' },
  });

  html += await renderAsync(res, 'guided/chat-message', {
    msg: {
      role: 'agent', type: 'choices',
      choices: [
        { label: 'Start Interview', icon: '🎙️', onboardingAction: 'start-interview' },
        { label: 'Skip to Report', icon: '📋', onboardingAction: 'skip-to-report' },
      ],
    },
  });

  res.send(html);
});

/* ── Interview Ask ── */
router.post('/guided/api/interview-ask', async function (req, res) {
  var step = parseInt(req.body.step || 0, 10);
  var questions = mock.strategist.interviewQuestions;
  var indices = [0, 1, 3];
  var idx = indices[step] !== undefined ? indices[step] : 0;
  var q = questions[idx];

  var html = '';

  if (step === 0) {
    html += await renderAsync(res, 'guided/chat-message', {
      msg: { role: 'agent', type: 'divider', text: 'Interview' },
    });
  }

  html += await renderAsync(res, 'guided/chat-message', {
    msg: { role: 'agent', type: 'text', showLabel: step === 0, text: '<strong>Q' + (step + 1) + ':</strong> ' + q.question },
  });

  res.send(html);
});

/* ── Interview Answer ── */
router.post('/guided/api/interview-answer', async function (req, res) {
  var step = parseInt(req.body.step || 0, 10);
  var answer = (req.body.message || '').trim();
  var url = (req.body.url || '').trim();

  var html = '';

  html += await renderAsync(res, 'guided/chat-message', {
    msg: { role: 'user', type: 'text', showLabel: true, text: answer },
  });

  var acks = [
    'Great insight on your target customer. Let me note that down.',
    'Solid differentiators. That gives me a clear positioning angle.',
    'Perfect. I have everything I need to build your strategy.',
  ];

  html += await renderAsync(res, 'guided/chat-message', {
    msg: { role: 'agent', type: 'text', text: acks[step] || 'Got it.' },
  });

  var nextStep = step + 1;

  if (nextStep < 3) {
    var questions = mock.strategist.interviewQuestions;
    var indices = [0, 1, 3];
    var idx = indices[nextStep];
    var q = questions[idx];

    html += await renderAsync(res, 'guided/chat-message', {
      msg: { role: 'agent', type: 'text', text: '<strong>Q' + (nextStep + 1) + ':</strong> ' + q.question },
    });
  } else {
    html += await renderAsync(res, 'guided/chat-message', {
      msg: { role: 'agent', type: 'divider', text: 'Generating Report' },
    });

    html += await renderAsync(res, 'guided/chat-message', {
      msg: { role: 'agent', type: 'text', showLabel: true, text: 'Generating your personalized <strong>Go-To-Market Report</strong>...' },
    });

    html += await renderAsync(res, 'guided/chat-message', {
      msg: {
        role: 'agent', type: 'progress', steps: [
          { text: 'Combining research data', done: true },
          { text: 'Applying interview insights', done: true },
          { text: 'Building channel strategy', done: true },
          { text: 'Creating 90-day action plan', done: true },
          { text: 'Calculating KPIs', done: true },
        ],
      },
    });

    html += await renderAsync(res, 'guided/chat-message', {
      msg: {
        role: 'agent', type: 'kpi-inline',
        kpis: [
          { label: 'Target Revenue', value: '$10K/mo', change: '6 months', trend: 'up' },
          { label: 'Target ROAS', value: '3.0x', change: 'Achievable', trend: 'up' },
          { label: 'Budget', value: '$5K', change: '90 days', trend: 'up' },
        ],
      },
    });

    html += await renderAsync(res, 'guided/chat-message', {
      msg: { role: 'agent', type: 'text', text: 'Your 7-section GTM report is ready. It covers executive summary, market analysis, target audience, competitive landscape, channel strategy, a 90-day action plan, and KPIs.' },
    });

    html += await renderAsync(res, 'guided/chat-message', {
      msg: {
        role: 'agent', type: 'artifact-link',
        artifact: { id: 'report', title: 'GTM Report', icon: '📋', description: '7 sections — executive summary to KPIs', route: '/guided/canvas/report' },
      },
    });

    html += await renderAsync(res, 'guided/chat-message', {
      msg: { role: 'agent', type: 'text', text: 'What would you like to do next?' },
    });

    html += await renderAsync(res, 'guided/onboarding-choices', {
      choices: [
        { label: 'Build Landing Page', icon: '⚡', action: 'landing-page' },
        { label: 'Generate Creatives', icon: '🎨', action: 'generate-creative' },
        { label: 'Launch Campaigns', icon: '📢', action: 'campaigns' },
      ],
    });
  }

  res.set('HX-Trigger', JSON.stringify({ 'update-interview-canvas': { step: nextStep, answer: answer } }));
  res.send(html);
});

/* ── Interview Canvas ── */
router.get('/guided/api/interview-canvas', function (req, res) {
  var step = parseInt(req.query.step || 0, 10);
  var answers = [];
  try {
    answers = JSON.parse(req.query.answers || '[]');
  } catch (e) {
    answers = [];
  }
  res.render('guided/interview-canvas', { step: step, answers: answers });
});

/* ── Canvas: Research ── */
router.get('/guided/canvas/research', function (req, res) {
  res.render('fragments/strategist/research-results', {
    result: mock.strategist.researchResult,
  });
});

/* ── Canvas: Report ── */
router.get('/guided/canvas/report', function (req, res) {
  res.render('pages/strategist/report', {
    report: mock.strategist.gtmReport,
  });
});

/* ── Builder: Start ── */
router.post('/guided/api/builder-start', async function (req, res) {
  var questions = mock.builder.questions;
  var q = questions[0];
  var html = '';

  html += await renderAsync(res, 'guided/chat-message', {
    msg: { role: 'agent', type: 'divider', text: 'Landing Page Builder' },
  });

  html += await renderAsync(res, 'guided/chat-message', {
    msg: { role: 'agent', type: 'text', showLabel: true, text: 'Let\'s build your landing page. I\'ll ask <strong>3 quick questions</strong> to generate a custom page.' },
  });

  html += await renderAsync(res, 'guided/chat-message', {
    msg: { role: 'agent', type: 'text', text: '<strong>Q1:</strong> ' + q.text + '<br><span class="text-muted text-sm">' + q.hint + '</span>' },
  });

  res.send(html);
});

/* ── Builder: Answer ── */
router.post('/guided/api/builder-answer', async function (req, res) {
  var step = parseInt(req.body.step || 0, 10);
  var answer = (req.body.message || '').trim();
  var questions = mock.builder.questions;
  var html = '';

  html += await renderAsync(res, 'guided/chat-message', {
    msg: { role: 'user', type: 'text', showLabel: true, text: answer },
  });

  var acks = [
    'Great headline. That\'ll grab attention.',
    'Solid CTA. Clear and action-driven.',
    'Perfect. I\'ve got your selling points.',
  ];

  html += await renderAsync(res, 'guided/chat-message', {
    msg: { role: 'agent', type: 'text', text: acks[step] || 'Got it.' },
  });

  var nextStep = step + 1;

  if (nextStep < 3) {
    var q = questions[nextStep];
    html += await renderAsync(res, 'guided/chat-message', {
      msg: { role: 'agent', type: 'text', text: '<strong>Q' + (nextStep + 1) + ':</strong> ' + q.text + '<br><span class="text-muted text-sm">' + q.hint + '</span>' },
    });
  } else {
    html += await renderAsync(res, 'guided/chat-message', {
      msg: { role: 'agent', type: 'text', showLabel: true, text: 'All set. Now pick a <strong>template</strong> for your landing page.' },
    });

    html += await renderAsync(res, 'guided/chat-message', {
      msg: {
        role: 'agent', type: 'choices',
        choices: mock.builder.templates.map(function (t) {
          return { label: t.name + (t.recommended ? ' ★' : ''), onboardingAction: 'pick-template-' + t.id };
        }),
      },
    });
  }

  res.send(html);
});

/* ── Builder: Templates Canvas ── */
router.get('/guided/canvas/builder-templates', function (req, res) {
  res.render('guided/builder-templates', {
    templates: mock.builder.templates,
  });
});

/* ── Builder: Select Template ── */
router.post('/guided/api/builder-select-template', async function (req, res) {
  var templateId = (req.body.templateId || '').trim();
  var templates = mock.builder.templates;
  var selected = templates.find(function (t) { return t.id === templateId; }) || templates[0];
  var html = '';

  html += await renderAsync(res, 'guided/chat-message', {
    msg: { role: 'user', type: 'text', showLabel: true, text: 'Template: ' + selected.name },
  });

  html += await renderAsync(res, 'guided/chat-message', {
    msg: {
      role: 'agent', type: 'progress', steps: [
        { text: 'Applying ' + selected.name + ' template', done: true },
        { text: 'Generating hero section', done: true },
        { text: 'Building feature cards', done: true },
        { text: 'Adding social proof', done: true },
        { text: 'Finalizing page', done: true },
      ],
    },
  });

  html += await renderAsync(res, 'guided/chat-message', {
    msg: {
      role: 'agent', type: 'artifact-link',
      artifact: { id: 'builder-preview', title: 'Landing Page Preview', icon: '⚡', description: 'Full preview with all sections', route: '/guided/canvas/builder-preview' },
    },
  });

  html += await renderAsync(res, 'guided/chat-message', {
    msg: { role: 'agent', type: 'text', text: 'Your page is ready! Type refinements like <strong>"make the headline bigger"</strong> or <strong>"blue cta"</strong>, or publish when you\'re happy.' },
  });

  html += await renderAsync(res, 'guided/chat-message', {
    msg: {
      role: 'agent', type: 'choices',
      choices: [
        { label: 'Bigger Headline', onboardingAction: 'builder-refine-bigger headline' },
        { label: 'Blue CTA', onboardingAction: 'builder-refine-blue cta' },
        { label: 'Publish', onboardingAction: 'builder-publish' },
      ],
    },
  });

  res.send(html);
});

/* ── Builder: Preview Canvas ── */
router.get('/guided/canvas/builder-preview', function (req, res) {
  var mods = {};
  try {
    mods = JSON.parse(req.query.mods || '{}');
  } catch (e) {
    mods = {};
  }

  var answers = {};
  try {
    answers = JSON.parse(req.query.answers || '{}');
  } catch (e) {
    answers = {};
  }

  var page = JSON.parse(JSON.stringify(mock.builder.generatedPage));

  if (answers.headline) page.hero.headline = answers.headline;
  if (answers.cta) {
    page.hero.ctaText = answers.cta;
    page.pricing.ctaText = answers.cta;
  }
  if (answers.sellingPoints) {
    var points = answers.sellingPoints.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    points.forEach(function (p, i) {
      if (page.features[i]) page.features[i].title = p;
    });
  }

  res.render('guided/builder-preview', { page: page, mods: mods });
});

/* ── Builder: Refine ── */
router.post('/guided/api/builder-refine', async function (req, res) {
  var message = (req.body.message || '').trim().toLowerCase();
  var refinements = mock.builder.refinements;
  var html = '';

  html += await renderAsync(res, 'guided/chat-message', {
    msg: { role: 'user', type: 'text', showLabel: true, text: req.body.message || message },
  });

  var matchedKey = Object.keys(refinements).find(function (key) {
    return message.indexOf(key) !== -1;
  });

  if (matchedKey) {
    var ref = refinements[matchedKey];
    html += await renderAsync(res, 'guided/chat-message', {
      msg: { role: 'agent', type: 'text', text: ref.ack + ' Preview updated.' },
    });

    res.set('HX-Trigger', JSON.stringify({ 'builder-canvas-reload': { section: ref.section, field: ref.field, value: ref.value } }));
  } else {
    html += await renderAsync(res, 'guided/chat-message', {
      msg: { role: 'agent', type: 'text', text: 'I\'ve applied that change. Preview updated.' },
    });

    res.set('HX-Trigger', JSON.stringify({ 'builder-canvas-reload': {} }));
  }

  html += await renderAsync(res, 'guided/chat-message', {
    msg: {
      role: 'agent', type: 'choices',
      choices: [
        { label: 'Bigger Headline', onboardingAction: 'builder-refine-bigger headline' },
        { label: 'Blue CTA', onboardingAction: 'builder-refine-blue cta' },
        { label: 'Publish', onboardingAction: 'builder-publish' },
      ],
    },
  });

  res.send(html);
});

/* ── Builder: Publish ── */
router.post('/guided/api/builder-publish', async function (req, res) {
  var html = '';

  html += await renderAsync(res, 'guided/chat-message', {
    msg: { role: 'agent', type: 'divider', text: 'Published' },
  });

  html += await renderAsync(res, 'guided/chat-message', {
    msg: { role: 'agent', type: 'text', showLabel: true, text: 'Your landing page is <strong>live</strong>! Here\'s how it\'s set up:' },
  });

  html += await renderAsync(res, 'guided/chat-message', {
    msg: {
      role: 'agent', type: 'kpi-inline',
      kpis: [
        { label: 'Status', value: 'Live' },
        { label: 'Template', value: 'Hero Bold' },
        { label: 'Sections', value: '5' },
        { label: 'Est. Load Time', value: '1.2s' },
      ],
    },
  });

  html += await renderAsync(res, 'guided/chat-message', {
    msg: { role: 'agent', type: 'text', text: 'What would you like to do next?' },
  });

  html += await renderAsync(res, 'guided/onboarding-choices', {
    choices: [
      { label: 'Generate Creatives', icon: '🎨', action: 'generate-creative' },
      { label: 'Launch Campaigns', icon: '📢', action: 'campaigns' },
      { label: 'View Dashboard', icon: '🏠', action: 'free-mode' },
    ],
  });

  res.send(html);
});

/* ── Creative Gen: Start ── */
router.post('/guided/api/creative-start', async function (req, res) {
  var questions = mock.creativeGen.questions;
  var q = questions[0];
  var html = '';

  html += await renderAsync(res, 'guided/chat-message', {
    msg: { role: 'agent', type: 'divider', text: 'Creative Generator' },
  });

  html += await renderAsync(res, 'guided/chat-message', {
    msg: { role: 'agent', type: 'text', showLabel: true, text: 'Let\'s generate ad creatives for your campaigns. I\'ll ask <strong>3 quick questions</strong> about what you need.' },
  });

  html += await renderAsync(res, 'guided/chat-message', {
    msg: { role: 'agent', type: 'text', text: '<strong>Q1:</strong> ' + q.text + '<br><span class="text-muted text-sm">' + q.hint + '</span>' },
  });

  html += await renderAsync(res, 'guided/chat-message', {
    msg: {
      role: 'agent', type: 'choices',
      choices: [
        { label: 'Image', onboardingAction: 'creative-answer-image' },
        { label: 'Video', onboardingAction: 'creative-answer-video' },
      ],
    },
  });

  res.send(html);
});

/* ── Creative Gen: Answer ── */
router.post('/guided/api/creative-answer', async function (req, res) {
  var step = parseInt(req.body.step || 0, 10);
  var answer = (req.body.message || '').trim();
  var questions = mock.creativeGen.questions;
  var html = '';

  html += await renderAsync(res, 'guided/chat-message', {
    msg: { role: 'user', type: 'text', showLabel: true, text: answer },
  });

  var acks = [
    'Got it — <strong>' + answer + '</strong> creative.',
    'Nice choice. <strong>' + answer + '</strong> style will work well for your brand.',
    'Great concept. Let me generate that for you now.',
  ];

  html += await renderAsync(res, 'guided/chat-message', {
    msg: { role: 'agent', type: 'text', text: acks[step] || 'Got it.' },
  });

  var nextStep = step + 1;

  if (nextStep < 3) {
    var q = questions[nextStep];
    html += await renderAsync(res, 'guided/chat-message', {
      msg: { role: 'agent', type: 'text', text: '<strong>Q' + (nextStep + 1) + ':</strong> ' + q.text + '<br><span class="text-muted text-sm">' + q.hint + '</span>' },
    });

    if (nextStep === 1) {
      html += await renderAsync(res, 'guided/chat-message', {
        msg: {
          role: 'agent', type: 'choices',
          choices: mock.creativeGen.styles.map(function (s) {
            return { label: s.name, onboardingAction: 'creative-answer-' + s.id };
          }),
        },
      });
    }
  } else {
    html += await renderAsync(res, 'guided/chat-message', {
      msg: {
        role: 'agent', type: 'progress', steps: [
          { text: 'Analyzing brand style', done: true },
          { text: 'Composing scene layout', done: true },
          { text: 'Generating base image', done: true },
          { text: 'Creating variations', done: true },
          { text: 'Scoring quality', done: true },
        ],
      },
    });

    html += await renderAsync(res, 'guided/chat-message', {
      msg: {
        role: 'agent', type: 'artifact-link',
        artifact: { id: 'creative-preview', title: 'Generated Creative', icon: '🎨', description: '4 variations with quality scores', route: '/guided/canvas/creative-preview' },
      },
    });

    html += await renderAsync(res, 'guided/chat-message', {
      msg: { role: 'agent', type: 'text', text: 'Your creative is ready with <strong>4 variations</strong>. Pick a favorite, generate another, or continue to campaigns.' },
    });

    html += await renderAsync(res, 'guided/chat-message', {
      msg: {
        role: 'agent', type: 'choices',
        choices: [
          { label: 'Generate Another', onboardingAction: 'generate-creative' },
          { label: 'Launch Campaigns', onboardingAction: 'campaigns' },
          { label: 'Explore More', onboardingAction: 'free-mode' },
        ],
      },
    });
  }

  res.send(html);
});

/* ── Creative Gen: Preview Canvas ── */
router.get('/guided/canvas/creative-preview', function (req, res) {
  var answers = {};
  try {
    answers = JSON.parse(req.query.answers || '{}');
  } catch (e) {
    answers = {};
  }

  var creative = JSON.parse(JSON.stringify(mock.creativeGen.generatedCreative));
  if (answers.type) creative.type = answers.type;
  if (answers.style) creative.style = answers.style;
  if (answers.prompt) creative.prompt = answers.prompt;

  res.render('guided/creative-preview', { creative: creative });
});

/* ── Free-form Chat (post-onboarding) ── */
router.post('/guided/api/chat', async function (req, res) {
  var message = (req.body.message || '').trim();
  if (!message) return res.send('');

  var html = '';
  html += await renderAsync(res, 'guided/chat-message', {
    msg: { role: 'user', type: 'text', showLabel: true, text: message },
  });

  var command = parseGuidedCommand(message);

  if (command && mock.chat.flows[command]) {
    var flow = mock.chat.flows[command];
    for (var i = 0; i < flow.messages.length; i++) {
      html += await renderAsync(res, 'guided/chat-message', { msg: flow.messages[i] });
    }
  } else {
    html += await renderAsync(res, 'guided/chat-message', {
      msg: {
        role: 'agent', type: 'text', showLabel: true,
        text: 'I didn\'t recognize that command. Try a slash command like <code>/research</code>, <code>/dashboard</code>, or <code>/campaigns</code>.',
      },
    });
    html += await renderAsync(res, 'guided/chat-message', {
      msg: {
        role: 'agent', type: 'choices',
        choices: [
          { label: 'View Dashboard', icon: '🏠', command: '/dashboard' },
          { label: 'Run Research', icon: '🎯', command: '/research' },
          { label: 'See Campaigns', icon: '📢', command: '/campaigns' },
        ],
      },
    });
  }

  res.send(html);
});

function parseGuidedCommand(input) {
  var text = (input || '').trim().toLowerCase();

  if (text.startsWith('/')) {
    var cmd = text.slice(1).split(/\s+/)[0];
    if (mock.chat.flows[cmd]) return cmd;
  }

  var keywords = mock.chat.nlKeywords;
  var keys = Object.keys(keywords);
  for (var i = 0; i < keys.length; i++) {
    var flow = keys[i];
    var words = keywords[flow];
    for (var j = 0; j < words.length; j++) {
      if (text.indexOf(words[j]) !== -1) return flow;
    }
  }

  return null;
}

/* ── Canvas routes for free mode ── */
router.get('/guided/canvas/dashboard', function (req, res) {
  res.render('pages/dashboard', {
    currentPage: 'dashboard',
    headerTitle: 'Dashboard',
    breadcrumb: [{ label: 'Dashboard' }],
    dashboard: mock.dashboard,
  });
});

router.get('/guided/canvas/campaigns', function (req, res) {
  res.render('pages/advertiser/campaigns', {
    currentPage: 'advertiser',
    headerTitle: 'Campaigns',
    breadcrumb: [{ label: 'Campaigns' }],
    campaigns: mock.advertiser.campaigns,
    wizardSteps: mock.advertiser.wizardSteps,
  });
});

router.get('/guided/canvas/performance', function (req, res) {
  var campaign = mock.advertiser.campaigns[0];
  res.render('pages/analyzer/performance', {
    currentPage: 'analyzer',
    headerTitle: 'Campaign Performance',
    breadcrumb: [{ label: 'Performance' }],
    campaign: campaign,
    chartData: mock.analyzer.chartData,
  });
});

router.get('/guided/canvas/optimize', function (req, res) {
  res.render('pages/analyzer/optimize', {
    currentPage: 'analyzer',
    headerTitle: 'Optimizations',
    breadcrumb: [{ label: 'Optimize' }],
    optimizations: mock.analyzer.optimizations,
  });
});

router.get('/guided/canvas/creative', function (req, res) {
  res.render('pages/executor/creative', {
    currentPage: 'executor',
    headerTitle: 'Creative Studio',
    breadcrumb: [{ label: 'Creative Studio' }],
    creatives: mock.executor.creatives,
  });
});

router.get('/guided/canvas/landing-pages', function (req, res) {
  res.render('pages/executor/landing-pages', {
    currentPage: 'executor',
    headerTitle: 'Landing Pages',
    breadcrumb: [{ label: 'Landing Pages' }],
    pages: mock.executor.landingPages,
  });
});

router.get('/guided/canvas/shopify', function (req, res) {
  res.render('pages/executor/shopify', {
    currentPage: 'executor',
    headerTitle: 'Shopify Store',
    breadcrumb: [{ label: 'Shopify' }],
    shopify: mock.executor.shopify,
  });
});

router.get('/guided/canvas/connections', function (req, res) {
  res.render('pages/advertiser/connections', {
    currentPage: 'advertiser',
    headerTitle: 'Connections',
    breadcrumb: [{ label: 'Connections' }],
    connections: mock.advertiser.connections,
  });
});

router.get('/guided/canvas/pixel', function (req, res) {
  res.render('pages/advertiser/pixel', {
    currentPage: 'advertiser',
    headerTitle: 'Meta Pixel',
    breadcrumb: [{ label: 'Meta Pixel' }],
    pixel: mock.advertiser.pixel,
  });
});

router.get('/guided/canvas/interview', function (req, res) {
  res.render('pages/strategist/interview', {
    currentPage: 'strategist',
    headerTitle: 'Voice Interview',
    breadcrumb: [{ label: 'Interview' }],
    questions: mock.strategist.interviewQuestions,
    currentQuestion: 0,
  });
});

router.get('/guided/canvas/domains', function (req, res) {
  res.render('pages/executor/domains', {
    currentPage: 'executor',
    headerTitle: 'Domain Setup',
    breadcrumb: [{ label: 'Domains' }],
  });
});

module.exports = router;
