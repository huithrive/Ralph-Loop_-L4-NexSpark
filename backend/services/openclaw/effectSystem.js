/**
 * effectSystem.js — Unified Effect Pipeline
 * 
 * Every action in the system (chat response, heartbeat action, card execution)
 * emits Effects. Effects flow through a pipeline of handlers that manage all
 * side effects: memory writes, DB logging, notifications, dashboard updates.
 * 
 * Inspired by NexSpark's Effect/EffectResult pattern, adapted for OpenClaw.
 */

const { v4: uuidv4 } = require('uuid');
const logger = require('../../utils/logger');

// ============================================================================
// EFFECT TYPES — All possible side effects in the system
// ============================================================================

const EffectType = {
  // --- Strategist module ---
  DATA_COLLECTED:       'DataCollected',
  INTERVIEW_COMPLETE:   'InterviewComplete',
  REPORT_GENERATED:     'ReportGenerated',
  
  // --- Executor module ---
  CONNECTION_MADE:      'ConnectionMade',
  TRACKING_INSTALLED:   'TrackingInstalled',
  CAMPAIGN_CREATED:     'CampaignCreated',
  
  // --- Advertiser module ---
  CAMPAIGN_LAUNCHED:    'CampaignLaunched',
  CREATIVE_SWAPPED:     'CreativeSwapped',
  BUDGET_ADJUSTED:      'BudgetAdjusted',
  ENTITY_PAUSED:        'EntityPaused',
  KEYWORDS_ADDED:       'KeywordsAdded',
  
  // --- Analyzer module ---
  ALERT_RAISED:         'AlertRaised',
  AUTO_ACTION_TAKEN:    'AutoActionTaken',
  CARD_QUEUED:          'CardQueued',
  CARD_APPROVED:        'CardApproved',
  CARD_REJECTED:        'CardRejected',
  PHASE_TRANSITIONED:   'PhaseTransitioned',
  MILESTONE_REACHED:    'MilestoneReached',
  
  // --- System ---
  STAGE_CHANGED:        'StageChanged',
  NOTIFICATION_SENT:    'NotificationSent',
  ERROR_OCCURRED:       'ErrorOccurred',
};

// ============================================================================
// EFFECT CLASS
// ============================================================================

class Effect {
  /**
   * @param {string} type - One of EffectType values
   * @param {object} data - Effect-specific payload
   * @param {object} [options] - Optional metadata
   * @param {string} [options.source] - Module that emitted this effect
   * @param {string} [options.clientId] - Client this effect belongs to
   * @param {string} [options.sessionId] - Chat session ID
   */
  constructor(type, data = {}, options = {}) {
    this.id = uuidv4();
    this.type = type;
    this.data = data;
    this.source = options.source || null;
    this.clientId = options.clientId || null;
    this.sessionId = options.sessionId || null;
    this.timestamp = Date.now();
  }
}

// ============================================================================
// EFFECT RESULT — What a pipeline handler returns
// ============================================================================

class EffectResult {
  constructor() {
    this.sseEvents = [];      // SSE events to push to frontend
    this.chatMessages = [];   // Chat messages to append
    this.errors = [];         // Errors encountered
    this.metadata = {};       // Arbitrary metadata for downstream handlers
  }
  
  addSSE(event, data) {
    this.sseEvents.push({ event, data });
    return this;
  }
  
  addMessage(type, data) {
    this.chatMessages.push({ type, ...data });
    return this;
  }
  
  addError(error) {
    this.errors.push(error);
    return this;
  }
}

// ============================================================================
// PIPELINE HANDLERS — Process effects in order
// ============================================================================

/**
 * Memory Writer — Writes significant effects to client memory files
 */
async function memoryWriter(effect, context) {
  const result = new EffectResult();
  const memoryService = require('./memoryService');
  
  const memoryWorthy = [
    EffectType.INTERVIEW_COMPLETE,
    EffectType.REPORT_GENERATED,
    EffectType.CONNECTION_MADE,
    EffectType.CAMPAIGN_LAUNCHED,
    EffectType.AUTO_ACTION_TAKEN,
    EffectType.PHASE_TRANSITIONED,
    EffectType.MILESTONE_REACHED,
    EffectType.CARD_APPROVED,
    EffectType.CARD_REJECTED,
    EffectType.BUDGET_ADJUSTED,
    EffectType.ENTITY_PAUSED,
  ];
  
  if (!memoryWorthy.includes(effect.type) || !effect.clientId) {
    return result;
  }
  
  try {
    const entry = formatMemoryEntry(effect);
    if (entry) {
      await memoryService.appendDailyLog(effect.clientId, entry);
    }
  } catch (err) {
    logger.error('[effectSystem:memoryWriter] Failed to write memory', err);
    result.addError({ handler: 'memoryWriter', error: err.message });
  }
  
  return result;
}

/**
 * DB Logger — Logs effects to openclaw_actions table
 */
async function dbLogger(effect, context) {
  const result = new EffectResult();
  
  // Only log actionable effects
  const dbWorthy = [
    EffectType.AUTO_ACTION_TAKEN,
    EffectType.CARD_QUEUED,
    EffectType.CARD_APPROVED,
    EffectType.CARD_REJECTED,
    EffectType.CAMPAIGN_LAUNCHED,
    EffectType.BUDGET_ADJUSTED,
    EffectType.ENTITY_PAUSED,
    EffectType.PHASE_TRANSITIONED,
    EffectType.MILESTONE_REACHED,
    EffectType.ERROR_OCCURRED,
  ];
  
  if (!dbWorthy.includes(effect.type)) {
    return result;
  }
  
  try {
    const db = getDB();
    if (db) {
      await db.query(
        `INSERT INTO openclaw_actions (id, client_id, action_type, payload, source_module, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [effect.id, effect.clientId, effect.type, JSON.stringify(effect.data), effect.source]
      );
    }
  } catch (err) {
    logger.error('[effectSystem:dbLogger] Failed to log to DB', err);
    result.addError({ handler: 'dbLogger', error: err.message });
  }
  
  return result;
}

/**
 * Notifier — Routes notifications based on trust level
 */
async function notifier(effect, context) {
  const result = new EffectResult();
  
  const notifyWorthy = [
    EffectType.ALERT_RAISED,
    EffectType.CARD_QUEUED,
    EffectType.AUTO_ACTION_TAKEN,
    EffectType.MILESTONE_REACHED,
    EffectType.REPORT_GENERATED,
    EffectType.PHASE_TRANSITIONED,
  ];
  
  if (!notifyWorthy.includes(effect.type) || !effect.clientId) {
    return result;
  }
  
  try {
    let notificationService;
    try {
      notificationService = require('./notificationService');
    } catch {
      return result; // Notification service not available
    }
    
    const card = effect.data.card || {
      id: effect.id,
      clientId: effect.clientId,
      severity: effect.data.severity || 'info',
      title: effect.data.title || effect.type,
      body: effect.data.body || '',
      trustLevel: effect.data.trustLevel || 'L1',
    };
    
    await notificationService.notify(effect.clientId, card);
  } catch (err) {
    logger.error('[effectSystem:notifier] Failed to send notification', err);
    result.addError({ handler: 'notifier', error: err.message });
  }
  
  return result;
}

/**
 * Dashboard Updater — Pushes SSE events for real-time frontend updates
 */
async function dashboardUpdater(effect, context) {
  const result = new EffectResult();
  
  // Map effects to SSE events
  const sseMap = {
    [EffectType.DATA_COLLECTED]:     { event: 'progress_step', mapper: e => ({ field: e.data.field }) },
    [EffectType.REPORT_GENERATED]:   { event: 'stage', mapper: () => ({ stage: 'strategy', label: 'Strategy' }) },
    [EffectType.CONNECTION_MADE]:    { event: 'canvas_update', mapper: e => ({ view: 'setup-dashboard', platform: e.data.platform }) },
    [EffectType.CAMPAIGN_LAUNCHED]:  { event: 'canvas_update', mapper: () => ({ view: 'launch-dashboard' }) },
    [EffectType.ALERT_RAISED]:       { event: 'canvas_update', mapper: () => ({ view: 'openclaw-alert' }) },
    [EffectType.AUTO_ACTION_TAKEN]:  { event: 'canvas_update', mapper: () => ({ view: 'openclaw-actions' }) },
    [EffectType.MILESTONE_REACHED]:  { event: 'canvas_update', mapper: e => ({ view: 'milestone', milestone: e.data }) },
    [EffectType.STAGE_CHANGED]:      { event: 'stage', mapper: e => ({ stage: e.data.to, label: e.data.label }) },
    [EffectType.PHASE_TRANSITIONED]: { event: 'stage', mapper: e => ({ stage: e.data.to, label: e.data.label }) },
  };
  
  const mapping = sseMap[effect.type];
  if (mapping) {
    result.addSSE(mapping.event, mapping.mapper(effect));
  }
  
  return result;
}

/**
 * Audit Logger — Append to audit trail (lightweight, always runs)
 */
async function auditLogger(effect, context) {
  const result = new EffectResult();
  
  // Log everything at debug level for full audit trail
  logger.info(`[effect] ${effect.type} | client=${effect.clientId || '-'} | source=${effect.source || '-'} | id=${effect.id}`);
  
  return result;
}

// ============================================================================
// EFFECT PIPELINE
// ============================================================================

// Default pipeline order
const DEFAULT_PIPELINE = [
  memoryWriter,
  dbLogger,
  notifier,
  dashboardUpdater,
  auditLogger,
];

// Custom handlers registered by modules
const customHandlers = new Map();

class EffectPipeline {
  constructor(handlers = DEFAULT_PIPELINE) {
    this.handlers = [...handlers];
  }
  
  /**
   * Register a custom effect handler from a module
   * @param {string} effectType - Effect type to handle
   * @param {Function} handler - async (effect, context) => EffectResult
   */
  registerHandler(effectType, handler) {
    if (customHandlers.has(effectType)) {
      throw new Error(`Duplicate handler for effect type: ${effectType}`);
    }
    customHandlers.set(effectType, handler);
  }
  
  /**
   * Process a single effect through the pipeline
   * @param {Effect} effect
   * @param {object} [context] - Optional context (session, etc.)
   * @returns {Promise<EffectResult>}
   */
  async processOne(effect, context = {}) {
    const merged = new EffectResult();
    
    // Run custom handler first (if registered for this effect type)
    const custom = customHandlers.get(effect.type);
    if (custom) {
      try {
        const customResult = await custom(effect, context);
        mergeResults(merged, customResult);
      } catch (err) {
        logger.error(`[effectSystem] Custom handler failed for ${effect.type}`, err);
        merged.addError({ handler: 'custom', effectType: effect.type, error: err.message });
      }
    }
    
    // Run default pipeline handlers
    for (const handler of this.handlers) {
      try {
        const handlerResult = await handler(effect, context);
        mergeResults(merged, handlerResult);
      } catch (err) {
        logger.error(`[effectSystem] Pipeline handler failed for ${effect.type}`, err);
        merged.addError({ handler: handler.name, error: err.message });
      }
    }
    
    return merged;
  }
  
  /**
   * Process multiple effects through the pipeline
   * @param {Effect[]} effects
   * @param {object} [context]
   * @returns {Promise<EffectResult>}
   */
  async process(effects, context = {}) {
    const merged = new EffectResult();
    
    for (const effect of effects) {
      const result = await this.processOne(effect, context);
      mergeResults(merged, result);
    }
    
    return merged;
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function mergeResults(target, source) {
  if (!source) return;
  target.sseEvents.push(...(source.sseEvents || []));
  target.chatMessages.push(...(source.chatMessages || []));
  target.errors.push(...(source.errors || []));
  Object.assign(target.metadata, source.metadata || {});
}

function formatMemoryEntry(effect) {
  const ts = new Date(effect.timestamp).toISOString().slice(11, 16);
  const d = effect.data;
  
  const formatters = {
    [EffectType.INTERVIEW_COMPLETE]: () => `- ${ts} ✅ Onboarding interview completed`,
    [EffectType.REPORT_GENERATED]: () => `- ${ts} 📊 GTM Strategy Report generated`,
    [EffectType.CONNECTION_MADE]: () => `- ${ts} 🔗 Connected ${d.platform} (${d.details || 'success'})`,
    [EffectType.CAMPAIGN_LAUNCHED]: () => `- ${ts} 🚀 Campaign launched: ${d.campaignName || d.campaignId}`,
    [EffectType.AUTO_ACTION_TAKEN]: () => `- ${ts} ⚡ Auto-action: ${d.action} on ${d.targetId} (${d.reason || 'rule-based'})`,
    [EffectType.PHASE_TRANSITIONED]: () => `- ${ts} 📈 Phase transition: ${d.from} → ${d.to}`,
    [EffectType.MILESTONE_REACHED]: () => `- ${ts} 🏆 Milestone: ${d.title || d.type} (${d.value})`,
    [EffectType.CARD_APPROVED]: () => `- ${ts} ✅ Approved: ${d.title || d.cardId}`,
    [EffectType.CARD_REJECTED]: () => `- ${ts} ❌ Rejected: ${d.title || d.cardId} — reason: ${d.reason || 'none given'}`,
    [EffectType.BUDGET_ADJUSTED]: () => `- ${ts} 💰 Budget adjusted: ${d.campaignId} — $${d.oldBudget} → $${d.newBudget}`,
    [EffectType.ENTITY_PAUSED]: () => `- ${ts} ⏸️ Paused: ${d.entityType} ${d.targetId}`,
  };
  
  const formatter = formatters[effect.type];
  return formatter ? formatter() : null;
}

// Lazy DB getter
let _db = null;
function getDB() {
  if (_db) return _db;
  try {
    _db = require('../../db');
  } catch {
    _db = null;
  }
  return _db;
}

// ============================================================================
// SINGLETON
// ============================================================================

const pipeline = new EffectPipeline();

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  Effect,
  EffectType,
  EffectResult,
  EffectPipeline,
  pipeline,         // Singleton instance
  
  // Convenience factory
  emit: (type, data, options) => new Effect(type, data, options),
};
