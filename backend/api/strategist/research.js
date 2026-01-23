/**
 * Research API endpoints for the Strategist module
 */

const express = require('express');
const { validateResearchRequest, validatePagination } = require('../../utils/validators');
const { sendSuccess, sendError, sendResponse } = require('../../utils/responseFormatter');
const {
  conductResearch,
  getResearchResult,
  getRecentResearch,
  searchByWebsite,
  deleteResearchResult,
  getResearchStats
} = require('../../services/researchService');
const logger = require('../../utils/logger');

const router = express.Router();

/**
 * POST /api/strategist/research
 * Conduct market research for a website and product
 */
router.post('/research', async (req, res) => {
  const startTime = Date.now();

  try {
    // Validate request body
    const validation = validateResearchRequest(req.body);
    if (!validation.valid) {
      return sendError(res, 'Validation failed', 400, 'VALIDATION_ERROR', {
        validationErrors: validation.errors
      });
    }

    const { website_url, product_description } = req.body;

    logger.info('Research request received', {
      websiteUrl: website_url,
      productDescriptionLength: product_description.length,
      ip: req.ip
    });

    // Conduct research
    const result = await conductResearch(website_url, product_description);

    const duration = Date.now() - startTime;

    logger.info('Research request completed', {
      researchId: result.research_id,
      cached: result.cached,
      duration: duration
    });

    // Return successful response
    sendSuccess(res, {
      research_id: result.research_id,
      status: result.status,
      cached: result.cached,
      data: result.data,
      metrics: result.metrics
    }, 'Market research completed successfully', {
      processing: {
        duration: duration,
        cached: result.cached,
        tokenUsage: result.usage
      }
    });

  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error('Research request failed', error, {
      websiteUrl: req.body?.website_url,
      duration: duration
    });

    // Handle specific error types
    if (error.message.includes('Rate limit')) {
      return sendError(res, 'Rate limit exceeded. Please try again later.', 429, 'RATE_LIMIT');
    }

    if (error.message.includes('API key')) {
      return sendError(res, 'API configuration error', 500, 'API_ERROR');
    }

    if (error.message.includes('validation') || error.message.includes('required')) {
      return sendError(res, error.message, 400, 'VALIDATION_ERROR');
    }

    // Generic server error
    sendError(res, 'Failed to conduct market research', 500, 'RESEARCH_ERROR', {
      duration: duration
    });
  }
});

/**
 * GET /api/strategist/research/:id
 * Get research result by ID
 */
router.get('/research/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
      return sendError(res, 'Research ID is required', 400, 'VALIDATION_ERROR');
    }

    logger.debug('Research result requested', { researchId: id });

    const result = await getResearchResult(id);

    if (!result) {
      return sendError(res, 'Research result not found', 404, 'NOT_FOUND');
    }

    sendSuccess(res, result, 'Research result retrieved successfully');

  } catch (error) {
    logger.error('Failed to get research result', error, { researchId: req.params.id });
    sendError(res, 'Failed to retrieve research result', 500, 'RETRIEVAL_ERROR');
  }
});

/**
 * GET /api/strategist/research
 * Get recent research results with pagination
 */
router.get('/research', async (req, res) => {
  try {
    const pagination = validatePagination(req.query);
    const { search } = req.query;

    logger.debug('Research list requested', {
      page: pagination.page,
      limit: pagination.limit,
      search: search || 'none'
    });

    let result;

    if (search && search.trim()) {
      // Search by website URL
      const results = await searchByWebsite(search.trim(), pagination.limit);
      result = {
        results: results,
        pagination: {
          page: 1,
          limit: pagination.limit,
          total: results.length,
          pages: 1
        }
      };
    } else {
      // Get recent research with pagination
      result = await getRecentResearch(pagination.page, pagination.limit);
    }

    sendSuccess(res, result.results, 'Research results retrieved successfully', {
      pagination: result.pagination
    });

  } catch (error) {
    logger.error('Failed to get research list', error);
    sendError(res, 'Failed to retrieve research list', 500, 'RETRIEVAL_ERROR');
  }
});

/**
 * DELETE /api/strategist/research/:id
 * Delete research result by ID
 */
router.delete('/research/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
      return sendError(res, 'Research ID is required', 400, 'VALIDATION_ERROR');
    }

    logger.info('Research deletion requested', { researchId: id });

    const deleted = await deleteResearchResult(id);

    if (!deleted) {
      return sendError(res, 'Research result not found', 404, 'NOT_FOUND');
    }

    sendSuccess(res, { deleted: true }, 'Research result deleted successfully');

  } catch (error) {
    logger.error('Failed to delete research result', error, { researchId: req.params.id });
    sendError(res, 'Failed to delete research result', 500, 'DELETION_ERROR');
  }
});

/**
 * GET /api/strategist/research/stats
 * Get research statistics
 */
router.get('/research/stats', async (req, res) => {
  try {
    logger.debug('Research statistics requested');

    const stats = await getResearchStats();

    sendSuccess(res, stats, 'Research statistics retrieved successfully');

  } catch (error) {
    logger.error('Failed to get research statistics', error);
    sendError(res, 'Failed to retrieve research statistics', 500, 'STATS_ERROR');
  }
});

/**
 * POST /api/strategist/research/:id/retry
 * Retry failed research with new parameters
 */
router.post('/research/:id/retry', async (req, res) => {
  const startTime = Date.now();

  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
      return sendError(res, 'Research ID is required', 400, 'VALIDATION_ERROR');
    }

    logger.info('Research retry requested', { originalResearchId: id });

    // Get original research to extract URL and description
    const originalResult = await getResearchResult(id);

    if (!originalResult) {
      return sendError(res, 'Original research result not found', 404, 'NOT_FOUND');
    }

    const { website_url, product_description } = originalResult.data;

    // Conduct new research (skip cache)
    const result = await conductResearch(website_url, product_description, {
      skipCache: true
    });

    const duration = Date.now() - startTime;

    logger.info('Research retry completed', {
      originalResearchId: id,
      newResearchId: result.research_id,
      duration: duration
    });

    sendSuccess(res, {
      research_id: result.research_id,
      status: result.status,
      data: result.data,
      retry: true,
      original_research_id: id
    }, 'Research retry completed successfully', {
      processing: {
        duration: duration,
        retry: true
      }
    });

  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error('Research retry failed', error, {
      originalResearchId: req.params.id,
      duration: duration
    });

    sendError(res, 'Failed to retry research', 500, 'RETRY_ERROR', {
      duration: duration
    });
  }
});

/**
 * Error handling middleware for research routes
 */
router.use((error, req, res, next) => {
  logger.error('Unhandled error in research routes', error, {
    method: req.method,
    path: req.path,
    body: req.body
  });

  sendError(res, 'An unexpected error occurred', 500, 'INTERNAL_ERROR');
});

module.exports = router;