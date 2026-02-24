/**
 * heartbeatLoop.js — The Nervous System
 *
 * Core scheduler that runs every N minutes (default 30), iterates over
 * active clients, pulls metrics, evaluates optimizer rules, generates
 * action cards, auto-executes L1 cards, queues L2/L3, logs everything,
 * and checks milestones + special time-based triggers.
 */

const cron = require('node-cron');
const openclawConfig = require('../../config/openclawConfig');
const memoryService = require('./memoryService');
const permissionService = require('./permissionService');

// Existing analyzer services
const analyticsService = require('../analyzer/analyticsService');
const optimizerService = require('../analyzer/optimizerService');
const reportService = require('../analyzer/reportService');

// TODO: actionCardService will be created separately
// const actionCardService = require('./actionCardService');
// const notificationService = require('./notificationService');

// Placeholder DB access — replace with real pool/knex when wired
let db;
try {
  db = require('../../db');
} catch {
  // Fallback: no DB available yet — stub it
  db = {
    query: async () => ({ rows: [] }),
  };
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

let cronTask = null;
let lastRunTime = null;
let activeAlertCount = 0;
let isRunning = false;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get list of active client IDs from the database.
 */
async function getActiveClients() {
  try {
    const result = await db.query(
      `SELECT DISTINCT client_id FROM campaigns WHERE status = 'active'`
    );
    return result.rows.map((r) => r.client_id);
  } catch (err) {
    console.error('[heartbeat] Failed to fetch active clients:', err.message);
    return [];
  }
}

/**
 * Check if now is a special trigger time.
 */
function getSpecialTriggers(now) {
  const triggers = [];
  const day = now.getDay(); // 0=Sun, 1=Mon
  const hour = now.getHours();
  const date = now.getDate();

  // Monday 9 AM → weekly report
  if (day === 1 && hour === 9) {
    triggers.push('weekly_report');
  }

  // 1st of month, 9 AM → monthly report
  if (date === 1 && hour === 9) {
    triggers.push('monthly_report');
  }

  return triggers;
}

/**
 * Check milestones for a client against current metrics.
 */
async function checkMilestones(clientId, metrics) {
  const { milestones } = openclawConfig;
  const crossed = [];

  // ROAS targets
  if (metrics.roas) {
    for (const target of milestones.roasTargets) {
      if (metrics.roas >= target) {
        crossed.push({ type: 'roas_target', value: target, current: metrics.roas });
      }
    }
  }

  // Revenue targets
  if (metrics.totalRevenue) {
    for (const target of milestones.revenueTargets) {
      if (metrics.totalRevenue >= target) {
        crossed.push({ type: 'revenue_target', value: target, current: metrics.totalRevenue });
      }
    }
  }

  // Customer targets
  if (metrics.customerCount) {
    for (const target of milestones.customerTargets) {
      if (metrics.customerCount >= target) {
        crossed.push({ type: 'customer_target', value: target, current: metrics.customerCount });
      }
    }
  }

  // TODO: Deduplicate against already-celebrated milestones stored in client memory
  // For now, log all crossed milestones and let actionCardService handle dedup

  for (const m of crossed) {
    await memoryService.appendDailyLog(
      clientId,
      `🏆 Milestone: ${m.type} crossed ${m.value} (current: ${m.current})`
    );
    // TODO: actionCardService.generateMilestoneCard(clientId, m)
    // TODO: notificationService.sendMilestoneNotification(clientId, m)
  }

  return crossed;
}

/**
 * Detect phase boundaries based on config and metrics.
 */
function detectPhaseBoundary(metrics) {
  const { phases } = openclawConfig;
  if (!metrics.daysActive) return null;

  const testEnd = phases.test.days;
  const optimizeEnd = testEnd + phases.optimize.days;

  if (metrics.daysActive === testEnd) return { from: 'test', to: 'optimize' };
  if (metrics.daysActive === optimizeEnd) return { from: 'optimize', to: 'scale' };
  return null;
}

// ---------------------------------------------------------------------------
// Core Heartbeat Logic
// ---------------------------------------------------------------------------

/**
 * Process a single client's heartbeat cycle.
 * Isolated so one client's error doesn't affect others.
 */
async function processClient(clientId) {
  const startMs = Date.now();

  // 1. Get metrics snapshot
  const metrics = await analyticsService.getClientMetricsSnapshot(clientId);
  if (!metrics) {
    await memoryService.appendDailyLog(clientId, '⚠️ No metrics available — skipping heartbeat cycle.');
    return { clientId, skipped: true, reason: 'no_metrics' };
  }

  // 2. Evaluate optimizer rules
  const triggeredRules = await optimizerService.evaluateRules(metrics);

  // 3. Assemble context for card generation
  const context = await memoryService.assembleContext(clientId);

  // 4. Get client preferences for trust classification
  const clientPrefs = await memoryService.getUserPreferences(clientId);

  // 5. Process each triggered rule
  const results = { autoExecuted: [], queued: [], errors: [] };

  for (const rule of (triggeredRules || [])) {
    try {
      // Classify trust level
      const classification = permissionService.classifyAction(
        rule.actionType || rule.type,
        { ...rule.params, ...metrics },
        clientPrefs
      );

      // TODO: Generate action card via actionCardService
      // const card = await actionCardService.generateCard({
      //   clientId,
      //   rule,
      //   classification,
      //   context,
      //   metrics,
      // });

      if (classification.trustLevel === 'L1' || classification.emergency) {
        // L1 → auto-execute
        if (permissionService.canAutoExecute({
          actionType: rule.actionType || rule.type,
          params: { ...rule.params, ...metrics },
          clientId,
          clientPrefs,
        })) {
          // TODO: await actionCardService.executeCard(card);
          permissionService.incrementDailyCount(clientId);
          results.autoExecuted.push(rule);

          await memoryService.appendDailyLog(
            clientId,
            `✅ L1 auto-executed: ${rule.actionType || rule.type} — ${classification.reason}`
          );
        } else {
          // Daily limit reached — queue instead
          results.queued.push(rule);
          await memoryService.appendDailyLog(
            clientId,
            `⏸️ L1 daily limit reached, queued: ${rule.actionType || rule.type}`
          );
        }
      } else {
        // L2/L3 → queue in DB + trigger notification
        // TODO: await actionCardService.queueCard(card);
        // TODO: await notificationService.notify(clientId, card);
        results.queued.push(rule);

        await memoryService.appendDailyLog(
          clientId,
          `📋 ${classification.trustLevel} queued: ${rule.actionType || rule.type} — ${classification.reason}`
        );
      }
    } catch (ruleErr) {
      results.errors.push({ rule: rule.actionType || rule.type, error: ruleErr.message });
      console.error(`[heartbeat] Rule error for client ${clientId}:`, ruleErr.message);
    }
  }

  // 6. Check milestones
  const milestones = await checkMilestones(clientId, metrics);

  // 7. Phase boundary detection
  const phaseBoundary = detectPhaseBoundary(metrics);
  if (phaseBoundary) {
    await memoryService.appendDailyLog(
      clientId,
      `🔄 Phase boundary detected: ${phaseBoundary.from} → ${phaseBoundary.to}`
    );
    // TODO: actionCardService.generateCard({ clientId, rule: { type: 'phase_transition', ...phaseBoundary }, ... })
    // TODO: notificationService.notify(clientId, phaseCard)
  }

  // 8. Summary log
  const elapsed = Date.now() - startMs;
  await memoryService.appendDailyLog(
    clientId,
    `💓 Heartbeat complete: ${results.autoExecuted.length} auto, ${results.queued.length} queued, ${results.errors.length} errors, ${milestones.length} milestones (${elapsed}ms)`
  );

  return { clientId, results, milestones, phaseBoundary, elapsedMs: elapsed };
}

/**
 * Run the full heartbeat cycle for all active clients.
 */
async function runHeartbeat() {
  if (isRunning) {
    console.warn('[heartbeat] Already running — skipping overlapping cycle.');
    return;
  }

  isRunning = true;
  const cycleStart = new Date();
  console.log(`[heartbeat] Starting cycle at ${cycleStart.toISOString()}`);

  try {
    const clientIds = await getActiveClients();
    if (!clientIds.length) {
      console.log('[heartbeat] No active clients found.');
      lastRunTime = cycleStart;
      return;
    }

    // Check special triggers
    const specialTriggers = getSpecialTriggers(cycleStart);

    // Process each client — isolated error handling
    const clientResults = [];
    let alertCount = 0;

    for (const clientId of clientIds) {
      try {
        const result = await processClient(clientId);
        clientResults.push(result);
        if (result.results) {
          alertCount += result.results.queued.length;
        }
      } catch (clientErr) {
        console.error(`[heartbeat] Client ${clientId} failed:`, clientErr.message);
        clientResults.push({ clientId, error: clientErr.message });

        // Log the failure but continue with other clients
        try {
          await memoryService.appendDailyLog(
            clientId,
            `❌ Heartbeat failed: ${clientErr.message}`
          );
        } catch { /* best effort */ }
      }
    }

    // Handle special triggers for all clients
    for (const trigger of specialTriggers) {
      for (const clientId of clientIds) {
        try {
          if (trigger === 'weekly_report') {
            // TODO: const report = await reportService.generateWeeklyReport(clientId);
            // TODO: const card = await actionCardService.generateReportCard(clientId, 'weekly', report);
            // TODO: await notificationService.notify(clientId, card);
            await memoryService.appendDailyLog(clientId, '📊 Weekly report triggered');
          } else if (trigger === 'monthly_report') {
            // TODO: const report = await reportService.generateMonthlyReport(clientId);
            // TODO: const card = await actionCardService.generateReportCard(clientId, 'monthly', report);
            // TODO: await notificationService.notify(clientId, card);
            await memoryService.appendDailyLog(clientId, '📊 Monthly report triggered');
          }
        } catch (triggerErr) {
          console.error(`[heartbeat] ${trigger} failed for ${clientId}:`, triggerErr.message);
        }
      }
    }

    activeAlertCount = alertCount;
    lastRunTime = cycleStart;

    const elapsed = Date.now() - cycleStart.getTime();
    console.log(
      `[heartbeat] Cycle complete: ${clientIds.length} clients, ${alertCount} alerts, ${elapsed}ms`
    );
  } finally {
    isRunning = false;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Start the heartbeat cron loop.
 */
function start() {
  if (cronTask) {
    console.warn('[heartbeat] Already started.');
    return;
  }

  const intervalMin = openclawConfig.heartbeat.intervalMin || 30;
  const cronExpr = `*/${intervalMin} * * * *`;

  cronTask = cron.schedule(cronExpr, () => {
    runHeartbeat().catch((err) => {
      console.error('[heartbeat] Unhandled error in cycle:', err);
    });
  });

  console.log(`[heartbeat] Started with schedule: ${cronExpr}`);
}

/**
 * Stop the heartbeat cron loop.
 */
function stop() {
  if (cronTask) {
    cronTask.stop();
    cronTask = null;
    console.log('[heartbeat] Stopped.');
  }
}

/**
 * Manually trigger a heartbeat for a single client.
 * @param {string} clientId
 * @returns {Promise<Object>} Result of the single-client heartbeat
 */
async function triggerNow(clientId) {
  console.log(`[heartbeat] Manual trigger for client: ${clientId}`);
  return processClient(clientId);
}

/**
 * Get current heartbeat status.
 * @returns {Object} Status info
 */
function getStatus() {
  const intervalMin = openclawConfig.heartbeat.intervalMin || 30;
  let nextRun = null;

  if (lastRunTime) {
    nextRun = new Date(lastRunTime.getTime() + intervalMin * 60 * 1000);
  }

  return {
    running: !!cronTask,
    isProcessing: isRunning,
    lastRunTime: lastRunTime ? lastRunTime.toISOString() : null,
    nextRun: nextRun ? nextRun.toISOString() : null,
    activeAlertCount,
    intervalMin,
  };
}

module.exports = {
  start,
  stop,
  triggerNow,
  getStatus,
  // Expose for testing
  _internals: {
    runHeartbeat,
    processClient,
    getActiveClients,
    getSpecialTriggers,
    checkMilestones,
    detectPhaseBoundary,
  },
};
