/**
 * Research service for conducting AI-powered market research
 */

const { callClaudeForJSON } = require('./claudeService');
const { RESEARCH_SYSTEM_PROMPT, createResearchPrompt } = require('../prompts/researchPrompts');
const { parseResearchResponse, extractKeyMetrics } = require('../parsers/researchParser');
const ResearchResult = require('../models/ResearchResult');
const logger = require('../utils/logger');

/**
 * Conduct comprehensive market research using Claude AI
 * @param {string} websiteUrl - Website URL to analyze
 * @param {string} productDescription - Product description
 * @param {object} options - Optional configuration
 * @returns {Promise<object>} - Research result with ID and data
 */
async function conductResearch(websiteUrl, productDescription, options = {}) {
  const startTime = Date.now();

  try {
    logger.info('Starting market research', {
      websiteUrl,
      productDescriptionLength: productDescription.length
    });

    // Check for recent research cache
    if (!options.skipCache) {
      const cachedResult = await ResearchResult.findRecentByUrl(websiteUrl, 24);
      if (cachedResult) {
        logger.info('Returning cached research result', {
          researchId: cachedResult.id,
          age: Math.round((Date.now() - new Date(cachedResult.created_at).getTime()) / (1000 * 60))
        });

        return {
          research_id: cachedResult.id,
          status: 'completed',
          cached: true,
          data: cachedResult.toJSON(),
          duration: Date.now() - startTime
        };
      }
    }

    // Generate research prompt
    const userPrompt = createResearchPrompt(websiteUrl, productDescription);

    logger.debug('Calling Claude AI for market research', {
      systemPromptLength: RESEARCH_SYSTEM_PROMPT.length,
      userPromptLength: userPrompt.length
    });

    // Call Claude API
    const claudeResponse = await callClaudeForJSON(
      RESEARCH_SYSTEM_PROMPT,
      userPrompt,
      {
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        temperature: 0.7
      }
    );

    if (!claudeResponse.success) {
      throw new Error('Claude API call failed');
    }

    logger.info('Claude API call completed', {
      inputTokens: claudeResponse.usage.input_tokens,
      outputTokens: claudeResponse.usage.output_tokens,
      duration: claudeResponse.duration
    });

    // Parse and validate the research data
    const researchData = claudeResponse.data;

    // Extract key metrics for logging
    const metrics = extractKeyMetrics(researchData);

    logger.info('Research data parsed', {
      ...metrics,
      parseError: !!researchData.parseError
    });

    // Store research result in database
    const researchResult = await ResearchResult.create({
      website_url: websiteUrl,
      product_description: productDescription,
      market_size: researchData.marketSize,
      competitors: researchData.competitors,
      target_audience: researchData.targetAudience,
      channels: researchData.channels,
      pain_points: researchData.painPoints,
      raw_response: JSON.stringify({
        claudeResponse: claudeResponse.data,
        opportunities: researchData.opportunities,
        threats: researchData.threats,
        recommendations: researchData.recommendations,
        parseError: researchData.parseError
      })
    });

    const totalDuration = Date.now() - startTime;

    logger.info('Market research completed', {
      researchId: researchResult.id,
      totalDuration: totalDuration,
      claudeDuration: claudeResponse.duration,
      tokenUsage: claudeResponse.usage
    });

    return {
      research_id: researchResult.id,
      status: 'completed',
      cached: false,
      data: researchResult.toJSON(),
      duration: totalDuration,
      usage: claudeResponse.usage,
      metrics
    };

  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error('Market research failed', error, {
      websiteUrl,
      duration,
      errorType: error.constructor.name
    });

    throw error;
  }
}

/**
 * Retry failed research with different parameters
 * @param {string} websiteUrl - Website URL
 * @param {string} productDescription - Product description
 * @param {string} previousError - Previous error message
 * @returns {Promise<object>} - Research result
 */
async function retryResearch(websiteUrl, productDescription, previousError) {
  try {
    logger.info('Retrying market research', {
      websiteUrl,
      previousError: previousError.substring(0, 100)
    });

    // Retry with higher temperature for more creative responses
    const result = await conductResearch(websiteUrl, productDescription, {
      skipCache: true,
      temperature: 0.8,
      retry: true
    });

    return result;

  } catch (error) {
    logger.error('Research retry also failed', error, { websiteUrl });
    throw error;
  }
}

/**
 * Get research result by ID
 * @param {string} researchId - Research result ID
 * @returns {Promise<object|null>} - Research result or null
 */
async function getResearchResult(researchId) {
  try {
    const result = await ResearchResult.findById(researchId);

    if (!result) {
      logger.warn('Research result not found', { researchId });
      return null;
    }

    logger.debug('Research result retrieved', { researchId });

    return {
      research_id: result.id,
      data: result.toJSON(),
      created_at: result.created_at
    };

  } catch (error) {
    logger.error('Failed to get research result', error, { researchId });
    throw error;
  }
}

/**
 * Get recent research results with pagination
 * @param {number} page - Page number
 * @param {number} limit - Results per page
 * @returns {Promise<object>} - Paginated research results
 */
async function getRecentResearch(page = 1, limit = 20) {
  try {
    const offset = (page - 1) * limit;
    const { results, total } = await ResearchResult.getRecent(limit, offset);

    logger.debug('Recent research results retrieved', {
      page,
      limit,
      total,
      returned: results.length
    });

    return {
      results: results.map(result => ({
        research_id: result.id,
        website_url: result.website_url,
        created_at: result.created_at,
        summary: {
          competitors_count: result.competitors ? result.competitors.length : 0,
          channels_count: result.channels ? result.channels.length : 0,
          pain_points_count: result.pain_points ? result.pain_points.length : 0
        }
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };

  } catch (error) {
    logger.error('Failed to get recent research', error, { page, limit });
    throw error;
  }
}

/**
 * Search research results by website URL
 * @param {string} websiteUrl - Website URL to search for
 * @param {number} limit - Maximum results to return
 * @returns {Promise<array>} - Array of research results
 */
async function searchByWebsite(websiteUrl, limit = 10) {
  try {
    const results = await ResearchResult.findByWebsiteUrl(websiteUrl, limit);

    logger.debug('Research results found by website', {
      websiteUrl,
      count: results.length
    });

    return results.map(result => ({
      research_id: result.id,
      website_url: result.website_url,
      product_description: result.product_description.substring(0, 200) + '...',
      created_at: result.created_at
    }));

  } catch (error) {
    logger.error('Failed to search research by website', error, { websiteUrl });
    throw error;
  }
}

/**
 * Validate research input parameters
 * @param {string} websiteUrl - Website URL
 * @param {string} productDescription - Product description
 * @throws {Error} - Validation error
 */
function validateResearchInput(websiteUrl, productDescription) {
  if (!websiteUrl || typeof websiteUrl !== 'string') {
    throw new Error('Website URL is required and must be a string');
  }

  if (!productDescription || typeof productDescription !== 'string') {
    throw new Error('Product description is required and must be a string');
  }

  // Validate URL format
  try {
    new URL(websiteUrl);
  } catch (error) {
    throw new Error('Website URL must be a valid URL');
  }

  // Validate description length
  if (productDescription.trim().length < 10) {
    throw new Error('Product description must be at least 10 characters long');
  }

  if (productDescription.length > 5000) {
    throw new Error('Product description must be no more than 5000 characters long');
  }
}

/**
 * Delete research result
 * @param {string} researchId - Research result ID
 * @returns {Promise<boolean>} - True if deleted
 */
async function deleteResearchResult(researchId) {
  try {
    const deleted = await ResearchResult.delete(researchId);

    if (deleted) {
      logger.info('Research result deleted', { researchId });
    } else {
      logger.warn('Research result not found for deletion', { researchId });
    }

    return deleted;

  } catch (error) {
    logger.error('Failed to delete research result', error, { researchId });
    throw error;
  }
}

/**
 * Get research statistics
 * @returns {Promise<object>} - Research statistics
 */
async function getResearchStats() {
  try {
    // This would require additional SQL queries - simplified for now
    const { results: recentResults } = await ResearchResult.getRecent(100, 0);

    const stats = {
      totalResearch: recentResults.length,
      todayResearch: recentResults.filter(r =>
        new Date(r.created_at).toDateString() === new Date().toDateString()
      ).length,
      weekResearch: recentResults.filter(r => {
        const createdDate = new Date(r.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return createdDate >= weekAgo;
      }).length,
      avgCompetitors: Math.round(
        recentResults.reduce((sum, r) =>
          sum + (r.competitors ? r.competitors.length : 0), 0
        ) / recentResults.length || 0
      ),
      avgChannels: Math.round(
        recentResults.reduce((sum, r) =>
          sum + (r.channels ? r.channels.length : 0), 0
        ) / recentResults.length || 0
      )
    };

    logger.debug('Research statistics calculated', stats);

    return stats;

  } catch (error) {
    logger.error('Failed to calculate research statistics', error);
    throw error;
  }
}

module.exports = {
  conductResearch,
  retryResearch,
  getResearchResult,
  getRecentResearch,
  searchByWebsite,
  validateResearchInput,
  deleteResearchResult,
  getResearchStats
};