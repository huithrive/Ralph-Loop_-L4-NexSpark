/**
 * @module permissionService
 * @description Trust-level classification for OpenClaw actions (L1/L2/L3).
 */

const openclawConfig = require('../../config/openclawConfig');

// In-memory daily action counter (reset at midnight)
const dailyCounters = new Map(); // clientId → { date: 'YYYY-MM-DD', count: number }

/**
 * @typedef {Object} Classification
 * @property {'L1'|'L2'|'L3'} trustLevel
 * @property {string} reason
 * @property {boolean} [emergency] - If true, auto-execute even at L3 (safety override)
 */

/**
 * Merge default trust config with per-client overrides.
 * @param {Object} [clientPrefs] - From memoryService.getUserPreferences(clientId)
 * @returns {Object} Merged trust config
 */
function getTrustConfig(clientPrefs) {
  const defaults = openclawConfig.trust;
  if (!clientPrefs?.trustOverrides) return defaults;
  return {
    ...defaults,
    ...clientPrefs.trustOverrides,
    // Merge arrays if present
    L1_auto: clientPrefs.trustOverrides.L1_auto || defaults.L1_auto,
    L2_confirm: clientPrefs.trustOverrides.L2_confirm || defaults.L2_confirm,
    L3_approve: clientPrefs.trustOverrides.L3_approve || defaults.L3_approve,
  };
}

/**
 * Classify an action into a trust level.
 *
 * @param {string} actionType - e.g. 'neg_keywords', 'bid_adjust', 'pause_campaign', 'budget_increase', 'new_campaign', etc.
 * @param {Object} params - Action-specific parameters
 * @param {number} [params.adjustPct] - Bid/budget adjustment percentage
 * @param {number} [params.roas] - Current ROAS value
 * @param {number} [params.roasDurationH] - Hours the ROAS has been at this level
 * @param {number} [params.budgetPacingPct] - Current budget pacing as percentage (100 = on track)
 * @param {number} [params.budgetIncreasePct] - Proposed budget increase percentage
 * @param {Object} [clientPrefs] - Per-client preference overrides
 * @returns {Classification}
 */
function classifyAction(actionType, params = {}, clientPrefs = null) {
  const thresholds = openclawConfig.thresholds;

  // --- Special: budget pacing emergency ---
  if (params.budgetPacingPct > (thresholds.budget.overspend_critical * 100)) {
    return {
      trustLevel: 'L3',
      reason: `Budget pacing at ${params.budgetPacingPct}% (>${thresholds.budget.overspend_critical * 100}%). Emergency auto-pause to protect spend.`,
      emergency: true,
    };
  }

  const trust = getTrustConfig(clientPrefs);

  // --- L1: auto-execute ---
  if (actionType === 'neg_keywords') {
    return { trustLevel: 'L1', reason: 'Negative keyword addition — safe, reversible.' };
  }

  if (actionType === 'bid_adjust' && Math.abs(params.adjustPct || 0) <= 10) {
    return { trustLevel: 'L1', reason: `Bid adjustment ${params.adjustPct}% (≤10% threshold).` };
  }

  if (actionType === 'pause_campaign' && (params.roas || Infinity) < thresholds.roas.critical && (params.roasDurationH || 0) >= 24) {
    return { trustLevel: 'L1', reason: `Pause: ROAS ${params.roas} < ${thresholds.roas.critical} for ${params.roasDurationH}h+ (critical).` };
  }

  // Check explicit list membership
  if (trust.L1_auto.includes(actionType)) {
    return { trustLevel: 'L1', reason: `Action "${actionType}" is in L1 auto-execute list.` };
  }

  // --- L3: require approval (check before L2 since some overlap) ---
  if (actionType === 'budget_increase' && (params.budgetIncreasePct || 0) > 30) {
    return { trustLevel: 'L3', reason: `Budget increase ${params.budgetIncreasePct}% exceeds 30% threshold.` };
  }

  if (['new_campaign', 'phase_transition', 'strategy_change', 'account_access'].includes(actionType)) {
    return { trustLevel: 'L3', reason: `Action "${actionType}" requires explicit approval.` };
  }

  if (trust.L3_approve.includes(actionType)) {
    return { trustLevel: 'L3', reason: `Action "${actionType}" is in L3 approval list.` };
  }

  // --- L2: confirm ---
  if (actionType === 'pause_campaign' && (params.roas || Infinity) > thresholds.roas.critical && (params.roas || Infinity) < thresholds.roas.warning) {
    return { trustLevel: 'L2', reason: `Pause underperformer: ROAS ${params.roas} between ${thresholds.roas.critical}–${thresholds.roas.warning}.` };
  }

  if (actionType === 'budget_shift' && (params.adjustPct || 0) > 10 && (params.adjustPct || 0) <= 30) {
    return { trustLevel: 'L2', reason: `Budget shift ${params.adjustPct}% (10–30% range).` };
  }

  if (actionType === 'bid_adjust' && Math.abs(params.adjustPct || 0) > 10) {
    return { trustLevel: 'L2', reason: `Bid adjustment ${params.adjustPct}% exceeds L1 threshold of 10%.` };
  }

  if (['creative_swap', 'creative_rotation', 'audience_adjust'].includes(actionType)) {
    return { trustLevel: 'L2', reason: `Action "${actionType}" requires confirmation.` };
  }

  if (trust.L2_confirm.includes(actionType)) {
    return { trustLevel: 'L2', reason: `Action "${actionType}" is in L2 confirm list.` };
  }

  // --- Default: unknown actions → L3 (safe) ---
  return { trustLevel: 'L3', reason: `Unknown action "${actionType}" — defaulting to L3 for safety.` };
}

/**
 * Check if an action card can be auto-executed (L1 + under daily limit).
 *
 * @param {Object} card - Action card object
 * @param {string} card.actionType - Action type string
 * @param {Object} [card.params] - Action parameters
 * @param {string} card.clientId - Client identifier
 * @param {Object} [card.clientPrefs] - Per-client overrides
 * @returns {boolean}
 */
function canAutoExecute(card) {
  const classification = classifyAction(card.actionType, card.params, card.clientPrefs);

  // Emergency L3 actions auto-execute (safety override)
  if (classification.emergency) return true;

  if (classification.trustLevel !== 'L1') return false;

  const maxPerDay = openclawConfig.heartbeat.maxActionsPerDay;
  const count = getDailyActionCount(card.clientId);
  return count < maxPerDay;
}

/**
 * Get the number of L1 auto-actions executed today for a client.
 *
 * @param {string} clientId
 * @returns {number}
 */
function getDailyActionCount(clientId) {
  const today = new Date().toISOString().slice(0, 10);
  const entry = dailyCounters.get(clientId);
  if (!entry || entry.date !== today) return 0;
  return entry.count;
}

/**
 * Increment the daily L1 action counter for a client.
 *
 * @param {string} clientId
 */
function incrementDailyCount(clientId) {
  const today = new Date().toISOString().slice(0, 10);
  const entry = dailyCounters.get(clientId);
  if (!entry || entry.date !== today) {
    dailyCounters.set(clientId, { date: today, count: 1 });
  } else {
    entry.count += 1;
  }
}

module.exports = {
  classifyAction,
  canAutoExecute,
  getDailyActionCount,
  incrementDailyCount,
  getTrustConfig,
};
