/**
 * Auxora V3 — API Routes
 * SSE endpoints for real AI chat + Advertiser/Analyzer mock APIs
 */

var express = require('express');
var router = express.Router();
// Initialize OpenClaw module system
require('../../backend/services/openclaw/init');
// Use OpenClaw chatRouter (drop-in replacement for auxora-chat)
var chat = require('../../backend/services/openclaw/chatRouter');
var v3Data = require('../data/auxora-v3-data');

// Helper: stream async generator as SSE events
function streamSSE(res, generator) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  });
  // Ensure headers are flushed immediately
  if (typeof res.flushHeaders === 'function') res.flushHeaders();

  (async function() {
    try {
      for await (var item of generator) {
        console.log('[SSE] Sending:', item.event, JSON.stringify(item.data).substring(0, 80));
        res.write('event: ' + item.event + '\n');
        res.write('data: ' + JSON.stringify(item.data) + '\n\n');
        // Explicitly flush to ensure SSE events reach client immediately
        if (typeof res.flush === 'function') res.flush();
      }
    } catch (err) {
      console.error('SSE stream error:', err.message);
      res.write('event: error\ndata: {"error":"Internal error"}\n\n');
    }
    res.end();
  })();
}

// Helper: delayed JSON response for mock APIs
function mockResponse(res, data, delayMs) {
  setTimeout(function() {
    res.json(data);
  }, delayMs || 300);
}

// Enable JSON body parsing for POST requests
router.use(express.json());

// ═══════════════════════════════════════════════════════════════
// CHAT SESSION ENDPOINTS (existing)
// ═══════════════════════════════════════════════════════════════

// POST /api/v3/session — Create a new chat session
router.post('/api/v3/session', function(req, res) {
  var session = chat.createSession();
  res.json({ sessionId: session.id });
});

// GET /api/v3/session/:id/start — SSE stream: greeting + first question
router.get('/api/v3/session/:id/start', function(req, res) {
  var session = chat.getSession(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  streamSSE(res, chat.getGreeting(req.params.id));
});

// POST /api/v3/session/:id/message — SSE stream: process user message
router.post('/api/v3/session/:id/message', function(req, res) {
  var session = chat.getSession(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  var text = (req.body.text || '').trim();
  if (!text) {
    return res.status(400).json({ error: 'Empty message' });
  }
  streamSSE(res, chat.processMessage(req.params.id, text));
});

// ═══════════════════════════════════════════════════════════════
// ADVERTISER API — Account Connections
// ═══════════════════════════════════════════════════════════════

// GET /api/advertiser/oauth/:platform/start — Returns mock OAuth URL
router.get('/api/advertiser/oauth/:platform/start', function(req, res) {
  var platform = req.params.platform;
  var urls = {
    shopify: '/api/advertiser/oauth/shopify/callback?code=mock_shopify_auth_code',
    meta: '/api/advertiser/oauth/meta/callback?code=mock_meta_auth_code',
    google: '/api/advertiser/oauth/google/callback?code=mock_google_auth_code'
  };
  mockResponse(res, {
    platform: platform,
    authUrl: urls[platform] || '/api/advertiser/oauth/callback',
    state: 'mock_state_' + Date.now()
  }, 200);
});

// GET /api/advertiser/oauth/:platform/callback — Mock OAuth callback
router.get('/api/advertiser/oauth/:platform/callback', function(req, res) {
  var platform = req.params.platform;
  var details = {
    shopify: { storeName: 'YamaBushi Farms', products: 5, plan: 'Shopify Plus' },
    meta: { businessName: 'YamaBushi Farms BM', adAccountId: 'act_123456', pages: 1 },
    google: { accountName: 'YamaBushi Farms Ads', customerId: '123-456-7890', currency: 'USD' }
  };
  mockResponse(res, {
    platform: platform,
    status: 'connected',
    details: details[platform] || {},
    connectedAt: new Date().toISOString()
  }, 500);
});

// GET /api/advertiser/connections/status — All connections health
router.get('/api/advertiser/connections/status', function(req, res) {
  mockResponse(res, {
    connections: [
      { platform: 'shopify', status: 'connected', detail: '5 products synced', healthy: true },
      { platform: 'meta', status: 'connected', detail: 'Ad account verified', healthy: true },
      { platform: 'google', status: 'connected', detail: 'Account active', healthy: true },
      { platform: 'tracking', status: 'connected', detail: 'All pixels firing', healthy: true }
    ],
    totalConnected: 4,
    totalRequired: 4,
    allHealthy: true
  });
});

// GET /api/advertiser/shopify/status — Shopify-specific status
router.get('/api/advertiser/shopify/status', function(req, res) {
  mockResponse(res, {
    connected: true,
    storeName: 'YamaBushi Farms',
    products: 5,
    orders: 142,
    trackingInstalled: true
  });
});

// ═══════════════════════════════════════════════════════════════
// ADVERTISER API — Pixel/Tracking
// ═══════════════════════════════════════════════════════════════

// POST /api/advertiser/pixel/install — Auto-install tracking pixels
router.post('/api/advertiser/pixel/install', function(req, res) {
  mockResponse(res, {
    status: 'installed',
    pixels: [
      { type: 'meta_pixel', id: 'px_12345', status: 'active', eventMatch: '95%' },
      { type: 'google_tag', id: 'GT-ABCDE', status: 'active', conversions: 3 }
    ],
    utmConfigured: true,
    installedAt: new Date().toISOString()
  }, 800);
});

// GET /api/advertiser/pixel/verify — Verify tracking events
router.get('/api/advertiser/pixel/verify', function(req, res) {
  mockResponse(res, {
    metaPixel: { status: 'healthy', eventMatch: '95%', lastEvent: '2 min ago' },
    googleTag: { status: 'healthy', conversions: 3, lastEvent: '5 min ago' },
    utm: { status: 'configured', campaigns: 5, allTagged: true },
    overall: 'healthy'
  }, 400);
});

// ═══════════════════════════════════════════════════════════════
// ADVERTISER API — Campaign Management
// ═══════════════════════════════════════════════════════════════

// POST /api/advertiser/campaigns/plan — Store approved campaign plan
router.post('/api/advertiser/campaigns/plan', function(req, res) {
  mockResponse(res, {
    planId: 'plan_' + Date.now(),
    status: 'approved',
    decisions: {
      budget: { total: 13000, duration: 31, phases: 3 },
      channels: { google: 70, meta: 30 },
      audiences: 4,
      creatives: 6
    },
    approvedAt: new Date().toISOString()
  });
});

// POST /api/advertiser/campaigns/create — Create campaigns on platforms
router.post('/api/advertiser/campaigns/create', function(req, res) {
  mockResponse(res, {
    campaigns: [
      { id: 'goog_search_1', name: 'Google Search — Wagyu', platform: 'google', type: 'search', status: 'active' },
      { id: 'goog_shop_1', name: 'Google Shopping — All Products', platform: 'google', type: 'shopping', status: 'active' },
      { id: 'meta_aware_1', name: 'Meta — Awareness Campaign', platform: 'meta', type: 'awareness', status: 'in_review' },
      { id: 'meta_retarget_1', name: 'Meta — Retargeting', platform: 'meta', type: 'retargeting', status: 'active' },
      { id: 'meta_lookalike_1', name: 'Meta — Lookalike Audiences', platform: 'meta', type: 'lookalike', status: 'in_review' }
    ],
    totalCampaigns: 5,
    status: 'launched',
    launchedAt: new Date().toISOString()
  }, 1000);
});

// POST /api/advertiser/campaigns/adjust-budget — Budget adjustments
router.post('/api/advertiser/campaigns/adjust-budget', function(req, res) {
  var body = req.body || {};
  mockResponse(res, {
    status: 'adjusted',
    previousBudget: body.previousBudget || 390,
    newBudget: body.newBudget || 590,
    effectiveDate: new Date().toISOString(),
    reason: body.reason || 'Phase transition'
  });
});

// POST /api/advertiser/campaigns/scale — Phase scaling
router.post('/api/advertiser/campaigns/scale', function(req, res) {
  var body = req.body || {};
  mockResponse(res, {
    status: 'scaling',
    fromPhase: body.fromPhase || 2,
    toPhase: body.toPhase || 3,
    newWeeklyBudget: body.newBudget || 1500,
    changes: [
      'Budget increased to $1,500/week',
      'Added TikTok channel (10% allocation)',
      'Email retargeting campaigns activated'
    ],
    effectiveDate: new Date().toISOString()
  });
});

// GET /api/advertiser/campaigns/status — Campaign statuses
router.get('/api/advertiser/campaigns/status', function(req, res) {
  mockResponse(res, {
    campaigns: [
      { id: 'goog_search_1', name: 'Google Search — Wagyu', status: 'active', spend: 125, impressions: 3420, clicks: 89, purchases: 5 },
      { id: 'goog_shop_1', name: 'Google Shopping — All Products', status: 'active', spend: 68, impressions: 2180, clicks: 52, purchases: 3 },
      { id: 'meta_aware_1', name: 'Meta — Awareness', status: 'active', spend: 45, impressions: 5640, clicks: 28, purchases: 1 },
      { id: 'meta_retarget_1', name: 'Meta — Retargeting', status: 'active', spend: 30, impressions: 1200, clicks: 45, purchases: 4 },
      { id: 'meta_lookalike_1', name: 'Meta — Lookalike', status: 'active', spend: 25, impressions: 1800, clicks: 17, purchases: 1 }
    ],
    totalActive: 5,
    totalSpend: 293,
    totalPurchases: 14
  });
});

// POST /api/advertiser/audiences/pause — Pause an audience
router.post('/api/advertiser/audiences/pause', function(req, res) {
  var body = req.body || {};
  mockResponse(res, {
    status: 'paused',
    audience: body.audience || 'Organic Buyers',
    savedBudget: body.savedBudget || 94,
    reallocatedTo: body.reallocatedTo || 'Wagyu Enthusiasts',
    effectiveDate: new Date().toISOString()
  });
});

// ═══════════════════════════════════════════════════════════════
// ANALYZER API — Performance Data
// ═══════════════════════════════════════════════════════════════

// GET /api/analyzer/performance/summary — Period summary
router.get('/api/analyzer/performance/summary', function(req, res) {
  var period = req.query.period || '7d';
  var summaries = {
    '48h': { spend: 86, revenue: 189, purchases: 2, returnPer1: 2.20, impressions: 8240, clicks: 186 },
    '7d': { spend: 388, revenue: 1134, purchases: 8, returnPer1: 2.92, impressions: 24500, clicks: 620 },
    '14d': { spend: 800, revenue: 3024, purchases: 20, returnPer1: 3.78, impressions: 52000, clicks: 1340 },
    '30d': { spend: 2131, revenue: 12254, purchases: 77, returnPer1: 5.75, impressions: 148000, clicks: 4200 }
  };
  mockResponse(res, summaries[period] || summaries['7d']);
});

// GET /api/analyzer/performance/daily — Daily briefing
router.get('/api/analyzer/performance/daily', function(req, res) {
  mockResponse(res, {
    date: new Date().toISOString().split('T')[0],
    spend: 52.40,
    revenue: 189,
    purchases: 3,
    status: 'healthy',
    alerts: 0,
    autoActions: 1,
    budgetPacing: { spent: 75, total: 100, unit: 'percent_of_weekly' },
    purchaseGoal: { current: 9, target: 12, unit: 'weekly' }
  });
});

// GET /api/analyzer/performance/weekly — Weekly report
router.get('/api/analyzer/performance/weekly', function(req, res) {
  var week = parseInt(req.query.week) || 1;
  var weeks = {
    1: { spend: 388, revenue: 1134, purchases: 8, returnPer1: 2.92, costPerCustomer: 48.50, deltaRevenue: null, deltaPurchases: null, deltaReturn: null },
    2: { spend: 412, revenue: 1890, purchases: 12, returnPer1: 4.59, costPerCustomer: 34.33, deltaRevenue: '+67%', deltaPurchases: '+50%', deltaReturn: '+57%' },
    3: { spend: 589, revenue: 3450, purchases: 22, returnPer1: 5.86, costPerCustomer: 26.77, deltaRevenue: '+83%', deltaPurchases: '+83%', deltaReturn: '+28%' },
    4: { spend: 742, revenue: 5780, purchases: 35, returnPer1: 7.78, costPerCustomer: 21.20, deltaRevenue: '+68%', deltaPurchases: '+59%', deltaReturn: '+33%' }
  };
  mockResponse(res, weeks[week] || weeks[1]);
});

// GET /api/analyzer/performance/by-audience — Audience breakdown
router.get('/api/analyzer/performance/by-audience', function(req, res) {
  mockResponse(res, {
    audiences: [
      { name: 'Wagyu Enthusiasts', spend: 124, revenue: 503, purchases: 4, returnPer1: 4.05, costPerCustomer: 31, verdict: 'winner' },
      { name: 'Health-Conscious Foodies', spend: 98, revenue: 287, purchases: 2, returnPer1: 2.93, costPerCustomer: 49, verdict: 'promising' },
      { name: 'Gift Buyers', spend: 72, revenue: 156, purchases: 1, returnPer1: 2.17, costPerCustomer: 72, verdict: 'testing' },
      { name: 'Organic Buyers', spend: 94, revenue: 88, purchases: 1, returnPer1: 0.94, costPerCustomer: 94, verdict: 'underperforming' }
    ]
  });
});

// GET /api/analyzer/performance/by-creative — Creative breakdown
router.get('/api/analyzer/performance/by-creative', function(req, res) {
  mockResponse(res, {
    creatives: [
      { name: 'Sizzle Reel (video)', type: 'video', clicks: 89, clickRate: 3.8, purchases: 3, verdict: 'best_performer' },
      { name: 'Unboxing Experience (video)', type: 'video', clicks: 52, clickRate: 2.9, purchases: 2, verdict: 'strong' },
      { name: 'Premium Plating (image)', type: 'image', clicks: 28, clickRate: 2.1, purchases: 2, verdict: 'decent' },
      { name: 'Lifestyle Scene (image)', type: 'image', clicks: 17, clickRate: 1.4, purchases: 1, verdict: 'below_average' }
    ]
  });
});

// GET /api/analyzer/campaigns/learning-status — Learning phase info
router.get('/api/analyzer/campaigns/learning-status', function(req, res) {
  mockResponse(res, {
    inLearningPhase: true,
    day: 2,
    totalDays: 7,
    percentComplete: 29,
    message: 'Facebook and Google need about 7 days to optimize who sees your ads.'
  });
});

// ═══════════════════════════════════════════════════════════════
// ANALYZER API — OpenClaw Monitoring
// ═══════════════════════════════════════════════════════════════

// GET /api/analyzer/openclaw/health — Monitoring status (REAL BACKEND)
router.get('/api/analyzer/openclaw/health', async function(req, res) {
  try {
    const heartbeatLoop = require('../../backend/services/openclaw/heartbeatLoop');
    const status = heartbeatLoop.getStatus();
    res.json(status);
  } catch(e) {
    console.error('[OpenClaw Health] Error:', e.message);
    res.json({ status: 'inactive', error: e.message });
  }
});

// GET /api/analyzer/openclaw/actions — Auto-action log (REAL BACKEND)
router.get('/api/analyzer/openclaw/actions', async function(req, res) {
  try {
    const actionCardService = require('../../backend/services/openclaw/actionCardService');
    const clientId = req.query.clientId || 'demo';
    const cards = await actionCardService.getActiveCards(clientId);
    const history = await actionCardService.getCardHistory(clientId, 7);
    res.json({ active: cards, history: history, total: history.length });
  } catch(e) {
    console.error('[OpenClaw Actions] Error:', e.message);
    res.json({ active: [], history: [], error: e.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// ANALYZER API — Recommendations & Alerts
// ═══════════════════════════════════════════════════════════════

// POST /api/analyzer/recommendations/approve — Approve optimization (REAL BACKEND)
router.post('/api/analyzer/recommendations/approve', async function(req, res) {
  try {
    const actionCardService = require('../../backend/services/openclaw/actionCardService');
    const { cardId, action } = req.body;
    if (action === 'approve' || action === 'approved') {
      const result = await actionCardService.approveCard(cardId);
      res.json({ status: 'approved', ...result });
    } else if (action === 'reject' || action === 'rejected') {
      const result = await actionCardService.rejectCard(cardId, req.body.reason);
      res.json({ status: 'rejected', ...result });
    } else {
      res.json({ status: 'acknowledged', action });
    }
  } catch(e) {
    console.error('[OpenClaw Approve] Error:', e.message);
    res.status(400).json({ error: e.message });
  }
});

// POST /api/analyzer/alerts/respond — Respond to alert
router.post('/api/analyzer/alerts/respond', function(req, res) {
  var body = req.body || {};
  mockResponse(res, {
    status: 'resolved',
    alertId: body.alertId || 'alert_' + Date.now(),
    action: body.action || 'approved',
    changes: body.action === 'approved' ? [
      'Paused Health & Wellness audience',
      'Reallocated $60/week to Wagyu Enthusiasts',
      'Monitoring for improvement over next 48h'
    ] : ['Alert acknowledged, no changes made'],
    resolvedAt: new Date().toISOString()
  });
});

// POST /api/analyzer/monitoring/start — Initialize OpenClaw monitoring
router.post('/api/analyzer/monitoring/start', function(req, res) {
  mockResponse(res, {
    status: 'active',
    monitoringId: 'mon_' + Date.now(),
    checkInterval: '30 minutes',
    alertThresholds: {
      cpaSpike: '30% increase in 24h',
      budgetOverpace: '20% over daily budget',
      trackingFailure: 'Any pixel event drops',
      creativeDecline: '25% CTR drop in 48h'
    },
    startedAt: new Date().toISOString()
  });
});

// GET /api/analyzer/campaigns/health — Campaign health summary
router.get('/api/analyzer/campaigns/health', function(req, res) {
  mockResponse(res, {
    overall: 'healthy',
    campaigns: [
      { name: 'Google Search — Wagyu', health: 'good', pacing: 'on_track' },
      { name: 'Google Shopping', health: 'good', pacing: 'on_track' },
      { name: 'Meta — Awareness', health: 'good', pacing: 'slightly_under' },
      { name: 'Meta — Retargeting', health: 'excellent', pacing: 'on_track' },
      { name: 'Meta — Lookalike', health: 'learning', pacing: 'on_track' }
    ]
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// OPENCLAW API — Real Backend Integration
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────
// Heartbeat Control & Status
// ─────────────────────────────────────────────────

// GET /api/openclaw/heartbeat/status — Current heartbeat status
router.get('/api/openclaw/heartbeat/status', async function(req, res) {
  try {
    const heartbeatLoop = require('../../backend/services/openclaw/heartbeatLoop');
    const status = heartbeatLoop.getStatus();
    res.json(status);
  } catch(e) {
    console.error('[OpenClaw Heartbeat Status] Error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// GET /api/openclaw/heartbeat/last — Last heartbeat details
router.get('/api/openclaw/heartbeat/last', async function(req, res) {
  try {
    const heartbeatLoop = require('../../backend/services/openclaw/heartbeatLoop');
    const lastHeartbeat = heartbeatLoop.getLastHeartbeat();
    res.json(lastHeartbeat || { message: 'No heartbeat recorded yet' });
  } catch(e) {
    console.error('[OpenClaw Last Heartbeat] Error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// POST /api/openclaw/heartbeat/start — Start heartbeat loop
router.post('/api/openclaw/heartbeat/start', async function(req, res) {
  try {
    const heartbeatLoop = require('../../backend/services/openclaw/heartbeatLoop');
    const clientId = req.body.clientId || 'demo';
    const intervalMinutes = req.body.intervalMinutes || 30;
    await heartbeatLoop.start(clientId, intervalMinutes);
    res.json({ status: 'started', clientId, intervalMinutes });
  } catch(e) {
    console.error('[OpenClaw Start Heartbeat] Error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// POST /api/openclaw/heartbeat/stop — Stop heartbeat loop
router.post('/api/openclaw/heartbeat/stop', async function(req, res) {
  try {
    const heartbeatLoop = require('../../backend/services/openclaw/heartbeatLoop');
    heartbeatLoop.stop();
    res.json({ status: 'stopped' });
  } catch(e) {
    console.error('[OpenClaw Stop Heartbeat] Error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────────
// Action Cards Management
// ─────────────────────────────────────────────────

// GET /api/openclaw/actions — Get active action cards
router.get('/api/openclaw/actions', async function(req, res) {
  try {
    const actionCardService = require('../../backend/services/openclaw/actionCardService');
    const clientId = req.query.clientId || 'demo';
    const cards = await actionCardService.getActiveCards(clientId);
    res.json({ cards, count: cards.length });
  } catch(e) {
    console.error('[OpenClaw Get Actions] Error:', e.message);
    res.status(500).json({ error: e.message, cards: [] });
  }
});

// GET /api/openclaw/actions/:id — Get specific action card by ID
router.get('/api/openclaw/actions/:id', async function(req, res) {
  try {
    const actionCardService = require('../../backend/services/openclaw/actionCardService');
    const clientId = req.query.clientId || 'demo';
    const cards = await actionCardService.getActiveCards(clientId);
    const card = cards.find(c => c.id === req.params.id);
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }
    res.json(card);
  } catch(e) {
    console.error('[OpenClaw Get Action by ID] Error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// POST /api/openclaw/actions/:id/approve — Approve action card
router.post('/api/openclaw/actions/:id/approve', async function(req, res) {
  try {
    const actionCardService = require('../../backend/services/openclaw/actionCardService');
    const result = await actionCardService.approveCard(req.params.id);
    res.json({ status: 'approved', cardId: req.params.id, ...result });
  } catch(e) {
    console.error('[OpenClaw Approve Card] Error:', e.message);
    res.status(400).json({ error: e.message });
  }
});

// POST /api/openclaw/actions/:id/reject — Reject action card
router.post('/api/openclaw/actions/:id/reject', async function(req, res) {
  try {
    const actionCardService = require('../../backend/services/openclaw/actionCardService');
    const reason = req.body.reason || 'User rejected';
    const result = await actionCardService.rejectCard(req.params.id, reason);
    res.json({ status: 'rejected', cardId: req.params.id, reason, ...result });
  } catch(e) {
    console.error('[OpenClaw Reject Card] Error:', e.message);
    res.status(400).json({ error: e.message });
  }
});

// GET /api/openclaw/actions/history — Get action card history
router.get('/api/openclaw/actions/history', async function(req, res) {
  try {
    const actionCardService = require('../../backend/services/openclaw/actionCardService');
    const clientId = req.query.clientId || 'demo';
    const days = parseInt(req.query.days) || 30;
    const history = await actionCardService.getCardHistory(clientId, days);
    res.json({ history, count: history.length, days });
  } catch(e) {
    console.error('[OpenClaw Get History] Error:', e.message);
    res.status(500).json({ error: e.message, history: [] });
  }
});

// ─────────────────────────────────────────────────
// Notification Preferences
// ─────────────────────────────────────────────────

// GET /api/openclaw/notifications/preferences — Get notification preferences
router.get('/api/openclaw/notifications/preferences', async function(req, res) {
  try {
    const notificationService = require('../../backend/services/openclaw/notificationService');
    const clientId = req.query.clientId || 'demo';
    const preferences = await notificationService.getPreferences(clientId);
    res.json(preferences);
  } catch(e) {
    console.error('[OpenClaw Get Preferences] Error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/openclaw/notifications/preferences — Update notification preferences
router.put('/api/openclaw/notifications/preferences', async function(req, res) {
  try {
    const notificationService = require('../../backend/services/openclaw/notificationService');
    const clientId = req.body.clientId || 'demo';
    const updates = req.body.preferences || req.body;
    await notificationService.updatePreferences(clientId, updates);
    res.json({ status: 'updated', clientId, updates });
  } catch(e) {
    console.error('[OpenClaw Update Preferences] Error:', e.message);
    res.status(400).json({ error: e.message });
  }
});

// GET /api/openclaw/notifications/log — Get notification log (placeholder)
router.get('/api/openclaw/notifications/log', async function(req, res) {
  try {
    const clientId = req.query.clientId || 'demo';
    // Future: implement notification logging in notificationService
    res.json({ 
      clientId, 
      log: [], 
      message: 'Notification logging not yet implemented' 
    });
  } catch(e) {
    console.error('[OpenClaw Notification Log] Error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────────
// Memory & Context
// ─────────────────────────────────────────────────

// GET /api/openclaw/memory/:clientId/context — Get USER.md + MEMORY.md summary
router.get('/api/openclaw/memory/:clientId/context', async function(req, res) {
  try {
    const memoryService = require('../../backend/services/openclaw/memoryService');
    const clientId = req.params.clientId;
    const userContext = await memoryService.readUserContext(clientId);
    const memoryContext = await memoryService.readMemory(clientId);
    res.json({ 
      clientId, 
      userContext: userContext || 'No USER.md found',
      memoryContext: memoryContext || 'No MEMORY.md found'
    });
  } catch(e) {
    console.error('[OpenClaw Memory Context] Error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════════════════════════
// NEW ENDPOINTS — Pro-level campaign detail
// ═══════════════════════════════════════════════════════════

// GET /api/advertiser/campaigns/hierarchy — Campaign tree structure
router.get('/api/advertiser/campaigns/hierarchy', function(req, res) {
  mockResponse(res, v3Data.canvasData.campaignHierarchy || {
    campaign: {
      name: 'Summer DTC Push',
      objective: 'Sales',
      dailyBudget: 420,
      adSets: [
        { name: 'Wagyu Enthusiasts', type: 'interest', budget: 140, ads: [
          { name: 'Sizzle Reel v1', format: 'Video 15s', spend: 82, roas: 4.05 },
          { name: 'Premium Plating', format: 'Image 1080x1080', spend: 58, roas: 3.20 }
        ]},
        { name: 'Health-Conscious Foodies', type: 'interest', budget: 100, ads: [
          { name: 'Unboxing Experience', format: 'Video 30s', spend: 62, roas: 2.80 },
          { name: 'Lifestyle Scene', format: 'Image 1080x1080', spend: 38, roas: 1.90 }
        ]},
        { name: 'Top Customer Lookalike', type: 'lookalike', budget: 80, ads: [
          { name: 'Chef\'s Pick', format: 'Video 20s', spend: 80, roas: 3.50 }
        ]},
        { name: 'Cart Abandoners', type: 'remarketing', budget: 100, ads: [
          { name: 'Discount Reminder', format: 'Image 1080x1080', spend: 45, roas: 8.20 },
          { name: 'Sizzle Reel v2', format: 'Video 15s', spend: 55, roas: 6.40 }
        ]}
      ]
    }
  });
});

// GET /api/analyzer/performance/by-creative-detail — Creative comparison data
router.get('/api/analyzer/performance/by-creative-detail', function(req, res) {
  mockResponse(res, v3Data.canvasData.creativeComparison || {
    title: 'Creative Performance Comparison',
    creatives: [
      { name: 'Sizzle Reel v2', category: 'Scene', spend: 312, roas: 5.8, ctr: 4.1, purchases: 18, status: 'Active' },
      { name: 'Sizzle Reel v1', category: 'Scene', spend: 245, roas: 4.2, ctr: 3.8, purchases: 12, status: 'Active' },
      { name: 'Discount Reminder', category: 'Offer', spend: 180, roas: 8.2, ctr: 2.9, purchases: 15, status: 'Active' },
      { name: 'Premium Plating', category: 'Design', spend: 198, roas: 3.2, ctr: 2.1, purchases: 7, status: 'Active' },
      { name: 'Chef\'s Pick', category: 'Testimonial', spend: 156, roas: 3.5, ctr: 2.6, purchases: 6, status: 'Active' },
      { name: 'Lifestyle Scene', category: 'Scene', spend: 134, roas: 1.9, ctr: 1.4, purchases: 3, status: 'Paused' }
    ]
  });
});

// POST /api/analyzer/notifications/preferences — Save notification preference
router.post('/api/analyzer/notifications/preferences', function(req, res) {
  var body = req.body || {};
  var tier = body.tier || 'weekly';
  mockResponse(res, {
    status: 'saved',
    preference: tier,
    settings: {
      passive: tier === 'passive',
      weeklyReport: tier === 'weekly' || tier === 'daily',
      dailyBriefing: tier === 'daily',
      emergencyAlerts: true
    },
    emergencyThresholds: {
      roasBelow: 0.2,
      trackingBreak: true,
      budgetOverspend: '200%'
    },
    maxEmergencyPerDay: 1,
    savedAt: new Date().toISOString()
  });
});

// GET /api/analyzer/budget/daily-tracker — Daily spend pacing data
router.get('/api/analyzer/budget/daily-tracker', function(req, res) {
  mockResponse(res, v3Data.canvasData.dailySpendTracker || {
    title: 'Daily Spend Pacing',
    budget: 420,
    days: [
      { day: 'Mon', budget: 60, spent: 58, status: 'on_track' },
      { day: 'Tue', budget: 60, spent: 63, status: 'slight_over' },
      { day: 'Wed', budget: 60, spent: 55, status: 'on_track' },
      { day: 'Thu', budget: 60, spent: 61, status: 'slight_over' },
      { day: 'Fri', budget: 60, spent: 57, status: 'on_track' },
      { day: 'Sat', budget: 60, spent: 0, status: 'pending' },
      { day: 'Sun', budget: 60, spent: 0, status: 'pending' }
    ]
  });
});

// ═══════════════════════════════════════════════════════════
// WS6: URL / FILE READING ENDPOINTS
// ═══════════════════════════════════════════════════════════

var urlReader = require('../services/url-reader');

// POST /api/tools/read-url — Fetch and extract text from a URL
router.post('/api/tools/read-url', async function(req, res) {
  var url = (req.body || {}).url;
  if (!url) {
    return res.status(400).json({ error: 'url is required' });
  }

  try {
    var result = await urlReader.fetchUrlContent(url);
    res.json({ status: 'ok', data: result });
  } catch (err) {
    console.error('URL read error:', err.message);
    res.status(500).json({ error: 'Failed to fetch URL: ' + err.message });
  }
});

// POST /api/tools/read-file — Read a local HTML/text file
router.post('/api/tools/read-file', async function(req, res) {
  var filePath = (req.body || {}).filePath;
  if (!filePath) {
    return res.status(400).json({ error: 'filePath is required' });
  }

  try {
    var result = await urlReader.readLocalFile(filePath);
    res.json({ status: 'ok', data: result });
  } catch (err) {
    console.error('File read error:', err.message);
    res.status(500).json({ error: 'Failed to read file: ' + err.message });
  }
});

module.exports = router;
