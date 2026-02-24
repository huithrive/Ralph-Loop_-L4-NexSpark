/**
 * Research cache wrapper
 */

const ResearchResult = require('../models/ResearchResult');
const { conductResearch } = require('./strategist/researchService');

/**
 * Get cached research or run fresh
 * @param {string} url - Website URL
 * @param {string} description - Product description
 * @param {number} maxAgeHours - Cache max age in hours (default 24)
 * @returns {Promise<{ research_id: string, data: object, cached: boolean }>}
 */
async function getCachedOrFresh(url, description, maxAgeHours = 24) {
  const cached = await ResearchResult.findRecentByUrl(url, maxAgeHours);
  if (cached) {
    return {
      research_id: cached.id,
      data: cached.toJSON(),
      cached: true
    };
  }

  return conductResearch(url, description);
}

module.exports = { getCachedOrFresh };
