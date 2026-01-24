// Landing Page Generation API
// Part of NexSpark Executor Module

const express = require('express');
const { body, validationResult } = require('express-validator');
const LovableService = require('../../services/lovableService');
const { GTMReport } = require('../../models');
const logger = require('../../utils/logger');
const { success: formatSuccessResponse, error: formatErrorResponse } = require('../../utils/responseFormatter');

const router = express.Router();
const lovableService = new LovableService();

/**
 * POST /api/executor/landing-pages/generate
 * Generate a landing page based on GTM report
 */
router.post('/generate', [
  body('report_id').notEmpty().withMessage('Report ID is required'),
  body('page_type').optional().isIn(['landing_page', 'sales_page', 'product_page']).withMessage('Invalid page type'),
  body('brand_assets.logo').optional().isURL().withMessage('Logo must be a valid URL'),
  body('brand_assets.images').optional().isArray().withMessage('Images must be an array'),
  body('customization.primary_color').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Primary color must be a valid hex color')
], async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(formatErrorResponse(
        'Invalid request parameters',
        'VALIDATION_ERROR',
        errors.array()
      ));
    }

    const {
      report_id,
      page_type = 'landing_page',
      brand_assets = {},
      customization = {}
    } = req.body;

    logger.info('Landing page generation requested', {
      reportId: report_id,
      pageType: page_type,
      hasBrandAssets: Object.keys(brand_assets).length > 0
    });

    // Fetch GTM report
    const gtmReport = await GTMReport.findById(report_id);
    if (!gtmReport) {
      return res.status(404).json(formatErrorResponse(
        'GTM report not found',
        'REPORT_NOT_FOUND',
        { report_id }
      ));
    }

    // Validate report has necessary data
    if (!gtmReport.report_data || !gtmReport.report_data.executive_summary) {
      return res.status(400).json(formatErrorResponse(
        'GTM report missing required data for landing page generation',
        'INCOMPLETE_REPORT',
        { report_id }
      ));
    }

    // Prepare generation options
    const generationOptions = {
      pageType: page_type,
      images: brand_assets.images || [],
      customization
    };

    // Add logo to images if provided
    if (brand_assets.logo) {
      generationOptions.images.unshift(brand_assets.logo);
    }

    // Generate landing page
    const result = await lovableService.generateLandingPage(gtmReport, generationOptions);

    // Log successful generation
    logger.info('Landing page generated successfully', {
      reportId: report_id,
      pageType: page_type,
      urlLength: result.data.lovable_url.length
    });

    res.status(200).json(formatSuccessResponse(
      result.data,
      'Landing page generation URL created successfully'
    ));

  } catch (error) {
    logger.error('Landing page generation failed', error, {
      reportId: req.body.report_id,
      pageType: req.body.page_type
    });

    res.status(500).json(formatErrorResponse(
      'Landing page generation failed',
      'GENERATION_ERROR',
      { error: error.message }
    ));
  }
});

/**
 * POST /api/executor/landing-pages/preview
 * Generate a preview of landing page parameters without creating the Lovable URL
 */
router.post('/preview', [
  body('report_id').notEmpty().withMessage('Report ID is required')
], async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(formatErrorResponse(
        'Invalid request parameters',
        'VALIDATION_ERROR',
        errors.array()
      ));
    }

    const { report_id } = req.body;

    logger.info('Landing page preview requested', { reportId: report_id });

    // Fetch GTM report
    const gtmReport = await GTMReport.findById(report_id);
    if (!gtmReport) {
      return res.status(404).json(formatErrorResponse(
        'GTM report not found',
        'REPORT_NOT_FOUND',
        { report_id }
      ));
    }

    // Extract preview data
    const reportData = gtmReport.report_data || {};
    const executiveSummary = reportData.executive_summary || {};
    const targetAudience = reportData.target_audience || {};
    const channelStrategy = reportData.channel_strategy || {};

    // Generate preview prompt
    const prompt = lovableService.buildLandingPagePrompt({
      executiveSummary,
      targetAudience,
      channelStrategy
    });

    const preview = {
      report_id,
      page_elements: {
        value_proposition: executiveSummary.market_opportunity || 'Not defined',
        target_audience: targetAudience.primary_persona?.demographics || 'Not defined',
        pain_points: targetAudience.primary_persona?.pain_points || [],
        recommended_channels: (channelStrategy.recommended_channels || []).slice(0, 3).map(c => c.channel)
      },
      generation_prompt: prompt,
      prompt_length: prompt.length,
      estimated_url_length: 100 + prompt.length * 1.2, // Rough estimate with encoding
      ready_for_generation: !!(executiveSummary.market_opportunity && targetAudience.primary_persona)
    };

    logger.info('Landing page preview generated', {
      reportId: report_id,
      promptLength: prompt.length,
      readyForGeneration: preview.ready_for_generation
    });

    res.status(200).json(formatSuccessResponse(
      preview,
      'Landing page preview generated successfully'
    ));

  } catch (error) {
    logger.error('Landing page preview failed', error, {
      reportId: req.body.report_id
    });

    res.status(500).json(formatErrorResponse(
      'Landing page preview failed',
      'PREVIEW_ERROR',
      { error: error.message }
    ));
  }
});

/**
 * GET /api/executor/landing-pages/health
 * Health check for landing page service
 */
router.get('/health', async (req, res) => {
  try {
    const healthStatus = await lovableService.getHealthStatus();

    res.status(200).json(formatSuccessResponse(
      healthStatus,
      'Landing page service is operational'
    ));

  } catch (error) {
    logger.error('Landing page health check failed', error);

    res.status(500).json(formatErrorResponse(
      'Landing page service health check failed',
      'HEALTH_CHECK_ERROR',
      { error: error.message }
    ));
  }
});

module.exports = router;