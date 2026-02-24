/**
 * Deep Research API endpoint
 * POST /api/strategist/research
 */

const express = require('express');
const router = express.Router();
const { validateResearchInput } = require('../../validators/researchValidator');
const { conductResearch } = require('../../services/strategist/researchService');
const logger = require('../../utils/logger');

/**
 * POST / — Run deep market research
 * Body: { website_url, product_description }
 */
router.post('/', async (req, res) => {
  try {
    const { website_url, product_description } = req.body;

    // Validate
    const validation = validateResearchInput({ website_url, product_description });
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.errors
      });
    }

    // Conduct research
    const result = await conductResearch(website_url, product_description);

    res.json({
      success: true,
      research_id: result.research_id,
      status: 'complete',
      data: result.data,
      cached: result.cached
    });

  } catch (error) {
    logger.error('Research endpoint error', error);

    if (error.statusCode === 400) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.validationErrors || [{ message: error.message }]
      });
    }

    res.status(500).json({
      success: false,
      error: 'Research failed',
      message: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
    });
  }
});

module.exports = router;
