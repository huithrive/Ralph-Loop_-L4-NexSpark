/**
 * executionBridge.js — Unified execution layer for action cards
 *
 * Wraps gomarbleMcpService and other services with a consistent interface
 * for actionCardService. Handles token retrieval, error handling, and
 * graceful fallbacks.
 */

const GoMarbleMcpService = require('../gomarbleMcpService');
const logger = require('../../utils/logger');

const gomarble = new GoMarbleMcpService();

// Simple in-memory token cache (replace with DB lookups in production)
const tokenCache = new Map();

/**
 * Get access token for a client's platform.
 * In production, this should query the database for stored tokens.
 * @param {string} clientId
 * @param {string} platform - 'meta' or 'google'
 * @returns {Promise<string|null>} Access token or null
 */
async function getClientToken(clientId, platform) {
  const cacheKey = `${clientId}:${platform}`;
  
  if (tokenCache.has(cacheKey)) {
    return tokenCache.get(cacheKey);
  }

  // TODO: Query database for stored OAuth tokens
  // For now, return null which will trigger mock mode in gomarbleMcpService
  logger.warn(`[executionBridge] No token found for client ${clientId} on ${platform} — will use mock mode`);
  return null;
}

/**
 * Parse platform from target ID (e.g., "meta_campaign_123" or "google_campaign_456")
 * @param {string} targetId
 * @returns {string} 'meta' or 'google' (defaults to 'meta')
 */
function parsePlatform(targetId) {
  if (!targetId) return 'meta';
  if (targetId.startsWith('google_')) return 'google';
  if (targetId.startsWith('meta_')) return 'meta';
  // Default to meta for backward compatibility
  return 'meta';
}

/**
 * Pause a campaign or ad set.
 * @param {string} clientId
 * @param {string} targetId - Campaign or ad set ID
 * @param {string} entityType - 'campaign' or 'ad_set'
 * @returns {Promise<Object>} { success, result, error }
 */
async function pauseEntity(clientId, targetId, entityType = 'campaign') {
  try {
    const platform = parsePlatform(targetId);
    const token = await getClientToken(clientId, platform);

    logger.info(`[executionBridge] Pausing ${entityType} ${targetId} on ${platform}`);

    const result = await gomarble.updateCampaignStatus(
      token,
      targetId,
      platform,
      'paused'
    );

    return { success: true, mock: gomarble.mockMode, result };
  } catch (error) {
    logger.error(`[executionBridge] Failed to pause ${entityType}`, error, { clientId, targetId });
    return { success: false, error: error.message };
  }
}

/**
 * Adjust budget for a campaign or ad set.
 * @param {string} clientId
 * @param {string} targetId
 * @param {number} newBudget - New daily budget amount
 * @returns {Promise<Object>} { success, result, error }
 */
async function adjustBudget(clientId, targetId, newBudget) {
  try {
    const platform = parsePlatform(targetId);
    const token = await getClientToken(clientId, platform);

    logger.info(`[executionBridge] Adjusting budget for ${targetId} to ${newBudget}`);

    // GoMarble MCP doesn't have a direct updateBudget method yet
    // For now, log and mark as execution_pending
    logger.warn(`[executionBridge] Budget adjustment not yet implemented in gomarbleMcpService — marking as pending`);

    // Graceful fallback: return pending status
    return {
      success: false,
      mock: true,
      pending: true,
      message: 'Budget adjustment requires manual action or future API implementation',
      newBudget,
    };
  } catch (error) {
    logger.error(`[executionBridge] Failed to adjust budget`, error, { clientId, targetId, newBudget });
    return { success: false, error: error.message };
  }
}

/**
 * Add negative keywords to a campaign or ad set.
 * @param {string} clientId
 * @param {string} targetId
 * @param {Array<string>} keywords - Array of negative keywords
 * @returns {Promise<Object>} { success, result, error }
 */
async function addNegativeKeywords(clientId, targetId, keywords) {
  try {
    const platform = parsePlatform(targetId);
    const token = await getClientToken(clientId, platform);

    logger.info(`[executionBridge] Adding ${keywords.length} negative keywords to ${targetId}`);

    // GoMarble MCP doesn't have this method yet
    logger.warn(`[executionBridge] Negative keyword management not yet implemented — marking as pending`);

    return {
      success: false,
      mock: true,
      pending: true,
      message: 'Negative keyword addition requires manual action or future API implementation',
      keywords,
    };
  } catch (error) {
    logger.error(`[executionBridge] Failed to add negative keywords`, error, { clientId, targetId, keywords });
    return { success: false, error: error.message };
  }
}

/**
 * Swap creative for an ad.
 * @param {string} clientId
 * @param {string} targetId
 * @param {string} newCreativeId
 * @returns {Promise<Object>} { success, result, error }
 */
async function swapCreative(clientId, targetId, newCreativeId) {
  try {
    logger.info(`[executionBridge] Swapping creative for ${targetId} to ${newCreativeId}`);

    // Not yet implemented in gomarbleMcpService
    logger.warn(`[executionBridge] Creative swap not yet implemented — marking as pending`);

    return {
      success: false,
      mock: true,
      pending: true,
      message: 'Creative swap requires manual action or future API implementation',
      newCreativeId,
    };
  } catch (error) {
    logger.error(`[executionBridge] Failed to swap creative`, error, { clientId, targetId, newCreativeId });
    return { success: false, error: error.message };
  }
}

/**
 * Trigger a phase transition for a client.
 * @param {string} clientId
 * @param {Object} transition - { from, to }
 * @returns {Promise<Object>} { success, result, error }
 */
async function transitionPhase(clientId, transition) {
  try {
    logger.info(`[executionBridge] Transitioning phase for client ${clientId}: ${transition.from} → ${transition.to}`);

    // Phase transitions are internal state changes, not API calls
    // TODO: Update client record in database with new phase
    logger.warn(`[executionBridge] Phase transition requires database update — marking as pending`);

    return {
      success: false,
      mock: true,
      pending: true,
      message: 'Phase transition requires database schema and migration logic',
      transition,
    };
  } catch (error) {
    logger.error(`[executionBridge] Failed to transition phase`, error, { clientId, transition });
    return { success: false, error: error.message };
  }
}

module.exports = {
  pauseEntity,
  adjustBudget,
  addNegativeKeywords,
  swapCreative,
  transitionPhase,
  getClientToken,
  parsePlatform,
};
