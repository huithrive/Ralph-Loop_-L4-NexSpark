/**
 * @module actionCardService
 * @description Card factory + execution pipeline for OpenClaw action cards.
 * Maps optimizer rules → plain-language cards → trust-routed execution or queue.
 */

const { v4: uuidv4 } = require('uuid');
const { Pool } = require('pg');
const permissionService = require('./permissionService');
const logger = require('../../utils/logger');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ---------------------------------------------------------------------------
// ActionCard class
// ---------------------------------------------------------------------------

class ActionCard {
  constructor({
    id,
    clientId,
    cardType,
    trustLevel,
    severity,
    title,
    body,
    impact,
    action,        // { type, targetId, params }
    status = 'pending',
    notificationSent = { email: false, whatsapp: false, inApp: false },
    createdAt = new Date(),
    executedAt = null,
    respondedAt = null,
    heartbeatId = null,
  }) {
    this.id = id || uuidv4();
    this.clientId = clientId;
    this.cardType = cardType;
    this.trustLevel = trustLevel;
    this.severity = severity;
    this.title = title;
    this.body = body;
    this.impact = impact;
    this.action = action || { type: null, targetId: null, params: {} };
    this.status = status;
    this.notificationSent = notificationSent;
    this.createdAt = createdAt;
    this.executedAt = executedAt;
    this.respondedAt = respondedAt;
    this.heartbeatId = heartbeatId;
  }
}

// ---------------------------------------------------------------------------
// Card templates  (rule type + severity → card definition)
// ---------------------------------------------------------------------------

const CARD_TEMPLATES = {
  low_roas_critical: {
    cardType: 'cpa_spike',
    severity: 'critical',
    title: 'Your ads are costing more than they earn',
    body: 'Your return on ad spend dropped below the critical threshold. We recommend pausing the underperforming campaigns to stop the bleeding.',
    impact: 'Prevents further budget loss on unprofitable ads',
    actionType: 'pause_campaign',
  },
  low_roas_warning: {
    cardType: 'rec_pause_broad',
    severity: 'warning',
    title: "One of your ad groups isn't performing well",
    body: "An ad group's return on spend is below your target. Consider pausing it and reallocating budget to your winning ads.",
    impact: 'Saves budget by focusing on better-performing ads',
    actionType: 'pause_ad_set',
  },
  high_cpa: {
    cardType: 'cpa_spike_detailed',
    severity: 'warning',
    title: 'Cost per customer jumped significantly',
    body: 'It now costs more than usual to acquire each customer. This could be due to audience fatigue, increased competition, or seasonal shifts.',
    impact: 'Reducing CPA helps you get more customers for the same budget',
    actionType: 'adjust_budget',
  },
  high_frequency: {
    cardType: 'rec_video_test',
    severity: 'warning',
    title: 'People are seeing the same ad too often',
    body: 'Your ad frequency is above the recommended limit. Viewers start ignoring (or getting annoyed by) ads they see too many times. Fresh creative — especially video — can re-engage them.',
    impact: 'New creative can lower costs and boost engagement',
    actionType: 'creative_swap',
  },
  budget_pacing_critical: {
    cardType: 'emergency_pause',
    severity: 'critical',
    title: 'We paused your ads to protect your budget',
    body: 'Your ad spend was running far ahead of plan — more than double the daily target. We hit the brakes to make sure you don't overspend.',
    impact: 'Prevents unexpected charges on your ad account',
    actionType: 'pause_campaign',
  },
  budget_pacing_warning: {
    cardType: 'budget_warning',
    severity: 'warning',
    title: 'Your ads are spending faster than planned',
    body: 'Daily spend is pacing above the target. If this continues, your monthly budget may run out early.',
    impact: 'Adjusting now keeps your campaigns running all month',
    actionType: 'adjust_budget',
  },
  neg_keywords: {
    cardType: 'neg_keywords',
    severity: 'info',
    title: 'Blocked wasteful search terms',
    body: 'We found search terms that are triggering your ads but not converting. These have been added as negative keywords so you stop paying for irrelevant clicks.',
    impact: 'Saves budget by cutting wasted ad clicks',
    actionType: 'neg_keywords',
  },
  milestone_roas: {
    cardType: 'roas_target',
    severity: 'success',
    title: 'Your ROAS target has been reached!',
    body: "Great news — your return on ad spend hit the target you set. Your campaigns are profitable and performing well.",
    impact: 'Your ads are generating strong returns',
    actionType: null, // informational — no action
  },
  low_ctr: {
    cardType: 'creative_refresh',
    severity: 'warning',
    title: 'Your ads aren\'t getting enough clicks',
    body: 'Click-through rate dropped below 1%. This usually means the creative or copy needs a refresh to capture attention.',
    impact: 'Better CTR means more traffic at the same cost',
    actionType: 'creative_swap',
  },
  scale_winner: {
    cardType: 'rec_scale_vitamins',
    severity: 'success',
    title: 'One of your campaigns is ready to scale',
    body: 'This campaign has maintained strong ROAS consistently. Increasing its budget could bring in more revenue without hurting efficiency.',
    impact: 'More revenue from your best-performing campaign',
    actionType: 'adjust_budget',
  },
  phase_boundary: {
    cardType: 'phase2_transition',
    severity: 'info',
    title: 'Time to move to the next phase',
    body: 'Your campaigns have hit the benchmarks for the current phase. We recommend transitioning to the next phase of your growth plan.',
    impact: 'Keeps your growth plan on track',
    actionType: 'phase_transition',
  },
};

// ---------------------------------------------------------------------------
// Template key resolution  (rule → template key)
// ---------------------------------------------------------------------------

function resolveTemplateKey(rule) {
  const { type, severity } = rule;

  if (type === 'low_roas') {
    return severity === 'critical' ? 'low_roas_critical' : 'low_roas_warning';
  }
  if (type === 'budget_pacing') {
    return severity === 'critical' ? 'budget_pacing_critical' : 'budget_pacing_warning';
  }
  // Direct match for everything else
  return type; // e.g. 'high_cpa', 'high_frequency', 'neg_keywords', etc.
}

// ---------------------------------------------------------------------------
// DB helpers
// ---------------------------------------------------------------------------

async function insertCard(card) {
  const sql = `
    INSERT INTO openclaw_actions
      (id, client_id, card_type, trust_level, severity, title, body, impact,
       action_type, action_target_id, action_params, status, created_at, heartbeat_id)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
    RETURNING *`;
  const vals = [
    card.id, card.clientId, card.cardType, card.trustLevel, card.severity,
    card.title, card.body, card.impact,
    card.action.type, card.action.targetId, JSON.stringify(card.action.params || {}),
    card.status, card.createdAt, card.heartbeatId,
  ];
  const { rows } = await pool.query(sql, vals);
  return rows[0];
}

async function updateCardStatus(cardId, status, extra = {}) {
  const sets = ['status = $2'];
  const vals = [cardId, status];
  let idx = 3;

  if (extra.executedAt) {
    sets.push(`executed_at = $${idx}`);
    vals.push(extra.executedAt);
    idx++;
  }
  if (extra.respondedAt) {
    sets.push(`responded_at = $${idx}`);
    vals.push(extra.respondedAt);
    idx++;
  }
  if (extra.rejectedReason) {
    sets.push(`rejected_reason = $${idx}`);
    vals.push(extra.rejectedReason);
    idx++;
  }

  const sql = `UPDATE openclaw_actions SET ${sets.join(', ')} WHERE id = $1 RETURNING *`;
  const { rows } = await pool.query(sql, vals);
  return rows[0];
}

async function fetchCardById(cardId) {
  const { rows } = await pool.query('SELECT * FROM openclaw_actions WHERE id = $1', [cardId]);
  return rows[0] || null;
}

function rowToActionCard(row) {
  return new ActionCard({
    id: row.id,
    clientId: row.client_id,
    cardType: row.card_type,
    trustLevel: row.trust_level,
    severity: row.severity,
    title: row.title,
    body: row.body,
    impact: row.impact,
    action: {
      type: row.action_type,
      targetId: row.action_target_id,
      params: row.action_params || {},
    },
    status: row.status,
    createdAt: row.created_at,
    executedAt: row.executed_at,
    respondedAt: row.responded_at,
    heartbeatId: row.heartbeat_id,
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate ActionCards from triggered optimizer rules.
 *
 * @param {Array<Object>} triggeredRules - e.g. [{ type: 'low_roas', severity: 'critical', targetId: '...', params: {...}, metrics: {...} }]
 * @param {Object} clientContext - { clientId, clientPrefs, heartbeatId }
 * @returns {Promise<ActionCard[]>}
 */
async function generateCards(triggeredRules, clientContext) {
  const { clientId, clientPrefs, heartbeatId } = clientContext;
  const cards = [];

  for (const rule of triggeredRules) {
    const templateKey = resolveTemplateKey(rule);
    const template = CARD_TEMPLATES[templateKey];

    if (!template) {
      logger.warn(`[actionCardService] No card template for rule "${rule.type}" (key: ${templateKey}). Skipping.`);
      continue;
    }

    // Classify trust level via permissionService
    const actionType = template.actionType || rule.type;
    const classification = permissionService.classifyAction(actionType, {
      ...rule.params,
      roas: rule.metrics?.roas,
      budgetPacingPct: rule.metrics?.budgetPacingPct,
    }, clientPrefs);

    const card = new ActionCard({
      clientId,
      cardType: template.cardType,
      trustLevel: classification.trustLevel,
      severity: template.severity,
      title: template.title,
      body: template.body,
      impact: template.impact,
      action: {
        type: actionType,
        targetId: rule.targetId || null,
        params: rule.params || {},
      },
      heartbeatId: heartbeatId || null,
    });

    // If emergency flag, auto-execute immediately
    if (classification.emergency) {
      card.status = 'auto_executed';
      card.executedAt = new Date();
    }

    await insertCard(card);
    cards.push(card);

    logger.info(`[actionCardService] Generated card: ${card.cardType} [${card.trustLevel}] for client ${clientId}`);
  }

  return cards;
}

/**
 * Execute a card's action (stub — logs and returns mock result).
 *
 * @param {ActionCard|Object} card
 * @returns {Promise<Object>} execution result
 */
async function executeCard(card) {
  const actionType = card.action?.type || card.action_type;

  if (!actionType) {
    logger.info(`[actionCardService] Card ${card.id} has no action type — informational only.`);
    return { success: true, mock: true, skipped: true, reason: 'informational' };
  }

  logger.info(`[actionCardService] Executing card ${card.id} — action: ${actionType}, target: ${card.action?.targetId || card.action_target_id}`);

  // Stub: switch on action type for future wiring
  switch (actionType) {
    case 'pause_campaign':
      logger.info(`[actionCardService] STUB: Would pause campaign ${card.action?.targetId}`);
      break;
    case 'pause_ad_set':
      logger.info(`[actionCardService] STUB: Would pause ad set ${card.action?.targetId}`);
      break;
    case 'adjust_budget':
      logger.info(`[actionCardService] STUB: Would adjust budget for ${card.action?.targetId}`, card.action?.params);
      break;
    case 'creative_swap':
      logger.info(`[actionCardService] STUB: Would swap creative for ${card.action?.targetId}`);
      break;
    case 'neg_keywords':
      logger.info(`[actionCardService] STUB: Would add negative keywords for ${card.action?.targetId}`);
      break;
    case 'phase_transition':
      logger.info(`[actionCardService] STUB: Would transition phase for client`);
      break;
    default:
      logger.info(`[actionCardService] STUB: Unknown action type "${actionType}" — no-op`);
  }

  // Mark executed in DB
  const cardId = card.id;
  await updateCardStatus(cardId, 'executed', { executedAt: new Date() });

  return { success: true, mock: true };
}

/**
 * Approve a pending card and execute it.
 *
 * @param {string} cardId
 * @returns {Promise<Object>} { card, execution }
 */
async function approveCard(cardId) {
  const row = await fetchCardById(cardId);
  if (!row) throw new Error(`Card ${cardId} not found`);
  if (row.status !== 'pending') throw new Error(`Card ${cardId} is not pending (status: ${row.status})`);

  await updateCardStatus(cardId, 'approved', { respondedAt: new Date() });
  const card = rowToActionCard(row);
  const execution = await executeCard(card);

  return { card, execution };
}

/**
 * Reject a pending card.
 *
 * @param {string} cardId
 * @param {string} [reason]
 * @returns {Promise<Object>} updated row
 */
async function rejectCard(cardId, reason = null) {
  const row = await fetchCardById(cardId);
  if (!row) throw new Error(`Card ${cardId} not found`);
  if (row.status !== 'pending') throw new Error(`Card ${cardId} is not pending (status: ${row.status})`);

  const updated = await updateCardStatus(cardId, 'rejected', {
    respondedAt: new Date(),
    rejectedReason: reason,
  });
  logger.info(`[actionCardService] Card ${cardId} rejected. Reason: ${reason || 'none'}`);
  return rowToActionCard({ ...row, ...updated });
}

/**
 * Get all pending (active) cards for a client.
 *
 * @param {string} clientId
 * @returns {Promise<ActionCard[]>}
 */
async function getActiveCards(clientId) {
  const { rows } = await pool.query(
    `SELECT * FROM openclaw_actions WHERE client_id = $1 AND status = 'pending' ORDER BY created_at DESC`,
    [clientId]
  );
  return rows.map(rowToActionCard);
}

/**
 * Get card history for a client over the last N days.
 *
 * @param {string} clientId
 * @param {number} [days=30]
 * @returns {Promise<ActionCard[]>}
 */
async function getCardHistory(clientId, days = 30) {
  const { rows } = await pool.query(
    `SELECT * FROM openclaw_actions WHERE client_id = $1 AND created_at >= NOW() - INTERVAL '1 day' * $2 ORDER BY created_at DESC`,
    [clientId, days]
  );
  return rows.map(rowToActionCard);
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  ActionCard,
  CARD_TEMPLATES,
  generateCards,
  executeCard,
  approveCard,
  rejectCard,
  getActiveCards,
  getCardHistory,
};
