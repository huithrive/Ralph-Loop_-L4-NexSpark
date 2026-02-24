/**
 * heartbeatLoop.js — The Nervous System (v2 — Effect Pipeline)
 *
 * Core scheduler that runs every N minutes (default 30), iterates over
 * active clients, pulls metrics, routes through module registry,
 * and emits effects through the unified pipeline.
 *
 * v2 changes:
 * - Uses moduleRegistry to find modules with evaluateMetrics/generateCards
 * - All side effects (memory, DB, notifications) go through effectPipeline
 * - Heartbeat itself emits effects instead of calling services directly
 */

const cron = require('node-cron');
const openclawConfig = require('../../config/openclawConfig');
const memoryService = require('./memoryService');
const permissionService = require('./permissionService');
const registry = require('./moduleRegistry');
const { Effect, EffectType, pipeline } = require('./effectSystem');
const agentContext = require('./agentContext');

// Existing analyzer services
const analyticsService = require('../analyzer/analyticsService');
const reportService = require('../analyzer/reportService');

// DB access
let db;
try {
  db = require('../../db');
} catch {
  db = { query: async () => ({ rows: [] }) };
}

const logger = require('../../utils/logger');

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

async function getActiveClients() {
  try {
    const result = await db.query(
      `SELECT DISTINCT client_id FROM campaigns WHERE status = 'active'`
    );
    return result.rows.map((r) => r.client_id);
  } catch (err) {
    logger.error('[heartbeat] Failed to fetch active clients:', err);
    return [];
  }
}

function getSpecialTriggers(now) {
  const triggers = [];
  const day = now.getDay();
  const hour = now.getHours();
  const date = now.getDate();

  if (day === 1 && hour === 9) triggers.push('weekly_report');
  if (date === 1 && hour === 9) triggers.push('monthly_report');

  return triggers;
}

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
// Core Heartbeat Logic — Now Effect-driven
// ---------------------------------------------------------------------------

/**
 * Process a single client's heartbeat cycle.
 * Routes through module registry and emits effects.
 */
async function processClient(clientId) {
  const startMs = Date.now();
  const effects = [];

  // 1. Get metrics snapshot
  const metrics = await analyticsService.getClientMetricsSnapshot(clientId);
  if (!metrics) {
    await memoryService.appendDailyLog(clientId, '⚠️ No metrics available — skipping heartbeat cycle.');
    return { clientId, skipped: true, reason: 'no_metrics' };
  }

  // 2. Find all modules that can evaluate metrics
  const metricsModules = registry.getAllModules().filter(m => m.evaluateMetrics);

  // 3. Evaluate rules across all modules
  let allRules = [];
  for (const mod of metricsModules) {
    try {
      const rules = await mod.evaluateMetrics(clientId, metrics);
      if (rules && rules.length > 0) {
        // Tag each rule with its source module
        for (const rule of rules) {
          rule._sourceModule = mod.name;
        }
        allRules.push(...rules);
      }
    } catch (err) {
      logger.error(`[heartbeat] ${mod.name}.evaluateMetrics failed for ${clientId}:`, err);
    }
  }

  // 4. Build agent context for card enrichment
  let agentCtx = null;
  try {
    agentCtx = await agentContext.buildContext(clientId, 'analyzer', {
      trigger: 'heartbeat',
      metricsSnapshot: metrics,
      rulesTriggered: allRules.length,
    });
  } catch (e) {
    logger.warn(`[heartbeat] agentContext not available for ${clientId}: ${e.message}`);
  }

  // 5. Generate cards from rules (via modules or default actionCardService)
  const results = { autoExecuted: [], queued: [], errors: [] };
  const clientPrefs = await memoryService.getUserPreferences(clientId);

  for (const rule of allRules) {
    try {
      // Find the module that generated this rule
      const mod = registry.getModule(rule._sourceModule);
      let cards = [];

      if (mod && mod.generateCards) {
        cards = await mod.generateCards(clientId, [rule], {
          clientPrefs,
          agentContext: agentCtx,
        });
      }

      if (!cards || cards.length === 0) continue;
      const card = cards[0];

      // 6. Trust classification
      const classification = permissionService.classifyAction(
        rule.actionType || rule.type || rule.rule,
        { ...rule.params, ...metrics },
        clientPrefs
      );

      if (classification.trustLevel === 'L1' || classification.emergency) {
        // L1 → auto-execute via effect
        if (permissionService.canAutoExecute({
          actionType: rule.actionType || rule.type || rule.rule,
          params: { ...rule.params, ...metrics },
          clientId,
          clientPrefs,
        })) {
          // Emit auto-action effect
          effects.push(new Effect(EffectType.AUTO_ACTION_TAKEN, {
            card,
            rule,
            action: rule.actionType || rule.type || rule.rule,
            targetId: rule.targetId || rule.campaignId,
            reason: classification.reason,
            trustLevel: 'L1',
          }, { source: rule._sourceModule || 'analyzer', clientId }));

          permissionService.incrementDailyCount(clientId);
          results.autoExecuted.push(rule);
        } else {
          // Daily limit reached — queue
          effects.push(new Effect(EffectType.CARD_QUEUED, {
            card,
            rule,
            reason: 'L1 daily limit reached',
            trustLevel: 'L1',
          }, { source: rule._sourceModule || 'analyzer', clientId }));
          results.queued.push(rule);
        }
      } else {
        // L2/L3 → queue and notify
        effects.push(new Effect(EffectType.CARD_QUEUED, {
          card,
          rule,
          reason: classification.reason,
          trustLevel: classification.trustLevel,
        }, { source: rule._sourceModule || 'analyzer', clientId }));
        results.queued.push(rule);
      }
    } catch (ruleErr) {
      results.errors.push({ rule: rule.actionType || rule.type, error: ruleErr.message });
      effects.push(new Effect(EffectType.ERROR_OCCURRED, {
        action: 'heartbeat_rule',
        rule: rule.actionType || rule.type,
        error: ruleErr.message,
      }, { source: rule._sourceModule || 'analyzer', clientId }));
    }
  }

  // 7. Check milestones
  const milestones = checkMilestones(clientId, metrics);
  for (const m of milestones) {
    effects.push(new Effect(EffectType.MILESTONE_REACHED, {
      type: m.type,
      title: `${m.type} reached ${m.value}`,
      value: m.current,
      target: m.value,
    }, { source: 'analyzer', clientId }));
  }

  // 8. Phase boundary detection
  const phaseBoundary = detectPhaseBoundary(metrics);
  if (phaseBoundary) {
    effects.push(new Effect(EffectType.PHASE_TRANSITIONED, {
      from: phaseBoundary.from,
      to: phaseBoundary.to,
      label: phaseBoundary.to.charAt(0).toUpperCase() + phaseBoundary.to.slice(1),
    }, { source: 'analyzer', clientId }));
  }

  // 9. Process ALL effects through unified pipeline
  const pipelineResult = await pipeline.process(effects, { clientId, metrics });

  if (pipelineResult.errors.length > 0) {
    logger.warn(`[heartbeat] ${pipelineResult.errors.length} pipeline errors for ${clientId}:`, 
      pipelineResult.errors.slice(0, 3));
  }

  // 10. Structured heartbeat log
  const elapsed = Date.now() - startMs;
  await memoryService.appendDailyLog(clientId, {
    type: 'heartbeat',
    timestamp: new Date().toISOString(),
    metricsSnapshot: {
      roas: metrics.blendedRoas || metrics.roas,
      spend: metrics.totals?.spend || metrics.spend,
      budget: metrics.totals?.dailyBudget || metrics.dailyBudget,
    },
    rulesTriggered: allRules.length,
    effectsEmitted: effects.length,
    autoExecuted: results.autoExecuted.length,
    queued: results.queued.length,
    milestones: milestones.length,
    phaseBoundary: phaseBoundary ? `${phaseBoundary.from} → ${phaseBoundary.to}` : null,
    elapsedMs: elapsed,
  });

  await memoryService.appendDailyLog(
    clientId,
    `💓 Heartbeat: ${effects.length} effects (${results.autoExecuted.length} auto, ${results.queued.length} queued, ${milestones.length} milestones) [${elapsed}ms]`
  );

  return { clientId, results, milestones, phaseBoundary, effects: effects.length, elapsedMs: elapsed };
}

/**
 * Check milestones — pure function, no side effects
 */
function checkMilestones(clientId, metrics) {
  const { milestones } = openclawConfig;
  const crossed = [];

  if (metrics.roas) {
    for (const target of milestones.roasTargets) {
      if (metrics.roas >= target) {
        crossed.push({ type: 'roas_target', value: target, current: metrics.roas });
      }
    }
  }

  if (metrics.totalRevenue) {
    for (const target of milestones.revenueTargets) {
      if (metrics.totalRevenue >= target) {
        crossed.push({ type: 'revenue_target', value: target, current: metrics.totalRevenue });
      }
    }
  }

  if (metrics.customerCount) {
    for (const target of milestones.customerTargets) {
      if (metrics.customerCount >= target) {
        crossed.push({ type: 'customer_target', value: target, current: metrics.customerCount });
      }
    }
  }

  return crossed;
}

/**
 * Run the full heartbeat cycle for all active clients.
 */
async function runHeartbeat() {
  if (isRunning) {
    logger.warn('[heartbeat] Already running — skipping.');
    return;
  }

  isRunning = true;
  const cycleStart = new Date();
  logger.info(`[heartbeat] Starting cycle at ${cycleStart.toISOString()}`);

  try {
    const clientIds = await getActiveClients();
    if (!clientIds.length) {
      logger.info('[heartbeat] No active clients.');
      lastRunTime = cycleStart;
      return;
    }

    const specialTriggers = getSpecialTriggers(cycleStart);
    const isSunday = cycleStart.getDay() === 0;
    const isMorning = cycleStart.getHours() >= 6 && cycleStart.getHours() < 12;

    let alertCount = 0;

    for (const clientId of clientIds) {
      try {
        const result = await processClient(clientId);
        if (result.results) {
          alertCount += result.results.queued.length;
        }

        // Weekly memory compaction on Sunday mornings
        if (isSunday && isMorning) {
          try {
            await memoryService.compactMemory(clientId);
            await memoryService.appendDailyLog(clientId, '🗂️ Weekly memory compaction completed');
          } catch (compactErr) {
            logger.error(`[heartbeat] Memory compaction failed for ${clientId}:`, compactErr);
          }
        }
      } catch (clientErr) {
        logger.error(`[heartbeat] Client ${clientId} failed:`, clientErr);
        try {
          await memoryService.appendDailyLog(clientId, `❌ Heartbeat failed: ${clientErr.message}`);
        } catch { /* best effort */ }
      }
    }

    // Special triggers (weekly/monthly reports)
    for (const trigger of specialTriggers) {
      for (const clientId of clientIds) {
        try {
          await handleSpecialTrigger(trigger, clientId);
        } catch (triggerErr) {
          logger.error(`[heartbeat] ${trigger} failed for ${clientId}:`, triggerErr);
        }
      }
    }

    activeAlertCount = alertCount;
    lastRunTime = cycleStart;

    const elapsed = Date.now() - cycleStart.getTime();
    logger.info(`[heartbeat] Cycle complete: ${clientIds.length} clients, ${alertCount} alerts, ${elapsed}ms`);
  } finally {
    isRunning = false;
  }
}

/**
 * Handle weekly/monthly report triggers via effect pipeline
 */
async function handleSpecialTrigger(trigger, clientId) {
  const effects = [];

  if (trigger === 'weekly_report') {
    const report = await reportService.generateWeeklyReport(clientId);
    effects.push(new Effect(EffectType.MILESTONE_REACHED, {
      type: 'weekly_report',
      title: 'Weekly Performance Report',
      report,
      period: 'weekly',
    }, { source: 'analyzer', clientId }));
  } else if (trigger === 'monthly_report') {
    const report = await reportService.generateMonthlyReport(clientId);
    effects.push(new Effect(EffectType.MILESTONE_REACHED, {
      type: 'monthly_report',
      title: 'Monthly Performance Report',
      report,
      period: 'monthly',
    }, { source: 'analyzer', clientId }));
  }

  if (effects.length > 0) {
    await pipeline.process(effects, { clientId });
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

function start() {
  if (cronTask) {
    logger.warn('[heartbeat] Already started.');
    return;
  }

  // Ensure modules are registered
  const modules = registry.getAllModules();
  const metricsModules = modules.filter(m => m.evaluateMetrics);
  logger.info(`[heartbeat] ${modules.length} modules registered, ${metricsModules.length} have evaluateMetrics`);

  const intervalMin = openclawConfig.heartbeat.intervalMin || 30;
  const cronExpr = `*/${intervalMin} * * * *`;

  cronTask = cron.schedule(cronExpr, () => {
    runHeartbeat().catch((err) => {
      logger.error('[heartbeat] Unhandled error:', err);
    });
  });

  logger.info(`[heartbeat] Started: ${cronExpr} (every ${intervalMin}min)`);
}

function stop() {
  if (cronTask) {
    cronTask.stop();
    cronTask = null;
    logger.info('[heartbeat] Stopped.');
  }
}

async function triggerNow(clientId) {
  logger.info(`[heartbeat] Manual trigger for: ${clientId}`);
  return processClient(clientId);
}

function getStatus() {
  const intervalMin = openclawConfig.heartbeat.intervalMin || 30;
  let nextRun = null;
  if (lastRunTime) {
    nextRun = new Date(lastRunTime.getTime() + intervalMin * 60 * 1000);
  }

  const modules = registry.getAllModules();
  const metricsModules = modules.filter(m => m.evaluateMetrics);

  return {
    running: !!cronTask,
    isProcessing: isRunning,
    lastRunTime: lastRunTime ? lastRunTime.toISOString() : null,
    nextRun: nextRun ? nextRun.toISOString() : null,
    activeAlertCount,
    intervalMin,
    modulesRegistered: modules.length,
    metricsModules: metricsModules.map(m => m.name),
  };
}

module.exports = {
  start,
  stop,
  triggerNow,
  getStatus,
  _internals: {
    runHeartbeat,
    processClient,
    getActiveClients,
    getSpecialTriggers,
    checkMilestones,
    detectPhaseBoundary,
  },
};
