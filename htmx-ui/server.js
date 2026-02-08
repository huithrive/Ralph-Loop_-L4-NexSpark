const express = require('express');
const path = require('path');
const mock = require('./data/mock');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

function isHtmx(req) {
  return req.headers['hx-request'] === 'true';
}

function render(res, req, page, locals) {
  const data = { ...locals };
  if (isHtmx(req)) {
    return res.render('pages/' + page, data);
  }
  const pageHtml = new Promise(function (resolve, reject) {
    res.app.render('pages/' + page, data, function (err, html) {
      if (err) return reject(err);
      resolve(html);
    });
  });
  pageHtml.then(function (body) {
    res.render('layout', { ...data, body });
  }).catch(function (err) {
    console.error(err);
    res.status(500).send('Render error');
  });
}

function delay(ms) {
  return new Promise(function (resolve) { setTimeout(resolve, ms); });
}

/* ──────────────────────────────────────────────
   Dashboard
   ────────────────────────────────────────────── */

app.get('/', function (req, res) {
  render(res, req, 'dashboard', {
    currentPage: 'dashboard',
    headerTitle: 'Dashboard',
    breadcrumb: [{ label: 'Dashboard' }],
    dashboard: mock.dashboard,
  });
});

app.get('/fragments/dashboard/summary-cards', function (req, res) {
  res.render('fragments/dashboard/summary-cards', { kpis: mock.dashboard.kpis });
});

app.get('/fragments/dashboard/goal-progress', function (req, res) {
  res.render('fragments/dashboard/goal-progress', { goal: mock.dashboard.goal });
});

app.get('/fragments/dashboard/module-status', function (req, res) {
  res.render('fragments/dashboard/module-status', { modules: mock.dashboard.moduleStatus });
});

app.get('/fragments/dashboard/activity-feed', function (req, res) {
  res.render('fragments/dashboard/activity-feed', { feed: mock.dashboard.activityFeed });
});

/* ──────────────────────────────────────────────
   Strategist
   ────────────────────────────────────────────── */

app.get('/strategist', function (req, res) {
  render(res, req, 'strategist/index', {
    currentPage: 'strategist',
    headerTitle: 'Strategist',
    breadcrumb: [{ label: 'Strategist' }],
    recentResearch: mock.strategist.recentResearch,
  });
});

app.post('/fragments/strategist/research-results', async function (req, res) {
  await delay(1500);
  res.render('fragments/strategist/research-results', { result: mock.strategist.researchResult });
});

app.get('/fragments/strategist/research-list', function (req, res) {
  res.render('fragments/strategist/research-list', { research: mock.strategist.recentResearch });
});

app.get('/strategist/interview', function (req, res) {
  render(res, req, 'strategist/interview', {
    currentPage: 'strategist',
    headerTitle: 'Voice Interview',
    breadcrumb: [
      { label: 'Strategist', url: '/strategist' },
      { label: 'Interview' },
    ],
    questions: mock.strategist.interviewQuestions,
    currentQuestion: 0,
  });
});

app.post('/fragments/strategist/interview-question', async function (req, res) {
  await delay(800);
  const step = parseInt(req.body.step || 0, 10);
  const questions = mock.strategist.interviewQuestions;
  const responses = mock.strategist.sampleResponses;

  if (step >= questions.length) {
    return res.render('fragments/strategist/interview-analysis', {
      analysis: mock.strategist.interviewAnalysis,
    });
  }

  res.render('fragments/strategist/interview-question', {
    question: questions[step],
    step: step,
    total: questions.length,
    previousResponse: step > 0 ? responses[step - 1] : null,
  });
});

app.post('/fragments/strategist/interview-analysis', async function (req, res) {
  await delay(2000);
  res.render('fragments/strategist/interview-analysis', {
    analysis: mock.strategist.interviewAnalysis,
  });
});

app.get('/strategist/report', function (req, res) {
  render(res, req, 'strategist/report', {
    currentPage: 'strategist',
    headerTitle: 'GTM Report',
    breadcrumb: [
      { label: 'Strategist', url: '/strategist' },
      { label: 'GTM Report' },
    ],
    report: mock.strategist.gtmReport,
  });
});

app.get('/fragments/strategist/report-content', function (req, res) {
  res.render('fragments/strategist/report-content', { report: mock.strategist.gtmReport });
});

/* ──────────────────────────────────────────────
   Executor
   ────────────────────────────────────────────── */

app.get('/executor', function (req, res) {
  render(res, req, 'executor/index', {
    currentPage: 'executor',
    headerTitle: 'Executor',
    breadcrumb: [{ label: 'Executor' }],
  });
});

app.get('/executor/landing-pages', function (req, res) {
  render(res, req, 'executor/landing-pages', {
    currentPage: 'executor',
    headerTitle: 'Landing Pages',
    breadcrumb: [
      { label: 'Executor', url: '/executor' },
      { label: 'Landing Pages' },
    ],
    pages: mock.executor.landingPages,
  });
});

app.post('/fragments/executor/landing-page-result', async function (req, res) {
  await delay(2000);
  res.render('fragments/executor/landing-page-result', {
    page: {
      id: 'lp-new',
      name: req.body.name || 'New Landing Page',
      url: 'https://greenhydro.nexspark.demo/new',
      status: 'draft',
      conversions: 0,
      views: 0,
      conversionRate: '—',
      createdAt: 'Just now',
    },
  });
});

app.get('/executor/shopify', function (req, res) {
  render(res, req, 'executor/shopify', {
    currentPage: 'executor',
    headerTitle: 'Shopify Store',
    breadcrumb: [
      { label: 'Executor', url: '/executor' },
      { label: 'Shopify' },
    ],
    shopify: mock.executor.shopify,
  });
});

app.get('/fragments/executor/shopify-status', function (req, res) {
  res.render('fragments/executor/shopify-status', { shopify: mock.executor.shopify });
});

app.get('/executor/domains', function (req, res) {
  render(res, req, 'executor/domains', {
    currentPage: 'executor',
    headerTitle: 'Domain Setup',
    breadcrumb: [
      { label: 'Executor', url: '/executor' },
      { label: 'Domains' },
    ],
  });
});

app.get('/fragments/executor/domain-search-results', async function (req, res) {
  await delay(600);
  const query = (req.query.q || '').toLowerCase().trim();
  if (!query) {
    return res.render('fragments/executor/domain-search-results', { results: [], query: '' });
  }
  const results = mock.executor.domainResults.filter(function (d) {
    return d.domain.includes(query);
  });
  res.render('fragments/executor/domain-search-results', { results, query });
});

app.get('/executor/creative', function (req, res) {
  render(res, req, 'executor/creative', {
    currentPage: 'executor',
    headerTitle: 'Creative Studio',
    breadcrumb: [
      { label: 'Executor', url: '/executor' },
      { label: 'Creative Studio' },
    ],
    creatives: mock.executor.creatives,
  });
});

app.get('/fragments/executor/creative-list', function (req, res) {
  res.render('fragments/executor/creative-list', { creatives: mock.executor.creatives });
});

app.post('/fragments/executor/creative-status', async function (req, res) {
  await delay(1500);
  res.render('fragments/executor/creative-status', {
    creative: {
      id: 'cr-new',
      name: req.body.name || 'New Creative',
      type: req.body.type || 'image',
      style: req.body.style || 'cinematic',
      status: 'processing',
      thumbnail: '⏳',
      createdAt: 'Just now',
    },
  });
});

/* ──────────────────────────────────────────────
   Advertiser
   ────────────────────────────────────────────── */

app.get('/advertiser', function (req, res) {
  render(res, req, 'advertiser/index', {
    currentPage: 'advertiser',
    headerTitle: 'Advertiser',
    breadcrumb: [{ label: 'Advertiser' }],
  });
});

app.get('/advertiser/connections', function (req, res) {
  render(res, req, 'advertiser/connections', {
    currentPage: 'advertiser',
    headerTitle: 'Connections',
    breadcrumb: [
      { label: 'Advertiser', url: '/advertiser' },
      { label: 'Connections' },
    ],
    connections: mock.advertiser.connections,
  });
});

app.get('/fragments/advertiser/connection-cards', function (req, res) {
  res.render('fragments/advertiser/connection-cards', { connections: mock.advertiser.connections });
});

app.get('/advertiser/campaigns', function (req, res) {
  render(res, req, 'advertiser/campaigns', {
    currentPage: 'advertiser',
    headerTitle: 'Campaigns',
    breadcrumb: [
      { label: 'Advertiser', url: '/advertiser' },
      { label: 'Campaigns' },
    ],
    campaigns: mock.advertiser.campaigns,
    wizardSteps: mock.advertiser.wizardSteps,
  });
});

app.get('/fragments/advertiser/campaign-list', function (req, res) {
  res.render('fragments/advertiser/campaign-list', { campaigns: mock.advertiser.campaigns });
});

app.post('/fragments/advertiser/campaign-step', async function (req, res) {
  await delay(500);
  const step = parseInt(req.body.step || 0, 10);
  const steps = mock.advertiser.wizardSteps;
  res.render('fragments/advertiser/campaign-step', {
    step,
    stepName: steps[step] || steps[0],
    totalSteps: steps.length,
    steps,
  });
});

app.get('/advertiser/pixel', function (req, res) {
  render(res, req, 'advertiser/pixel', {
    currentPage: 'advertiser',
    headerTitle: 'Meta Pixel',
    breadcrumb: [
      { label: 'Advertiser', url: '/advertiser' },
      { label: 'Meta Pixel' },
    ],
    pixel: mock.advertiser.pixel,
  });
});

app.get('/fragments/advertiser/pixel-status', function (req, res) {
  res.render('fragments/advertiser/pixel-status', { pixel: mock.advertiser.pixel });
});

/* ──────────────────────────────────────────────
   Analyzer
   ────────────────────────────────────────────── */

app.get('/analyzer', function (req, res) {
  render(res, req, 'analyzer/index', {
    currentPage: 'analyzer',
    headerTitle: 'Analyzer',
    breadcrumb: [{ label: 'Analyzer' }],
    kpis: mock.analyzer.kpis,
    chartData: mock.analyzer.chartData,
    performanceData: mock.analyzer.performanceData,
  });
});

app.get('/fragments/analyzer/kpi-panel', function (req, res) {
  res.render('fragments/analyzer/kpi-panel', { kpis: mock.analyzer.kpis });
});

app.get('/fragments/analyzer/performance-table', function (req, res) {
  res.render('fragments/analyzer/performance-table', { rows: mock.analyzer.performanceData });
});

app.get('/fragments/analyzer/chart-data', function (req, res) {
  res.render('fragments/analyzer/chart-data', { chartData: mock.analyzer.chartData });
});

app.get('/analyzer/performance', function (req, res) {
  const campaignId = req.query.campaign || 'camp-001';
  const campaign = mock.advertiser.campaigns.find(function (c) { return c.id === campaignId; }) || mock.advertiser.campaigns[0];
  render(res, req, 'analyzer/performance', {
    currentPage: 'analyzer',
    headerTitle: 'Campaign Performance',
    breadcrumb: [
      { label: 'Analyzer', url: '/analyzer' },
      { label: campaign.name },
    ],
    campaign,
    chartData: mock.analyzer.chartData,
  });
});

app.get('/analyzer/optimize', function (req, res) {
  render(res, req, 'analyzer/optimize', {
    currentPage: 'analyzer',
    headerTitle: 'Optimizations',
    breadcrumb: [
      { label: 'Analyzer', url: '/analyzer' },
      { label: 'Optimize' },
    ],
    optimizations: mock.analyzer.optimizations,
  });
});

app.post('/fragments/analyzer/optimization-results', async function (req, res) {
  await delay(2000);
  res.render('fragments/analyzer/optimization-results', {
    optimizations: mock.analyzer.optimizations,
  });
});

/* ──────────────────────────────────────────────
   Start
   ────────────────────────────────────────────── */

app.listen(PORT, function () {
  console.log('NexSpark UI running at http://localhost:' + PORT);
});
