/**
 * GTM Strategy Report API Endpoints
 *
 * REST API for generating and managing strategic GTM reports
 */

const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const reportGenerationService = require('../../services/reportGenerationService');
const dataSynthesisService = require('../../services/dataSynthesisService');
const ResearchResult = require('../../models/ResearchResult');
const InterviewSession = require('../../models/InterviewSession');
const logger = require('../../utils/logger');

const router = express.Router();

/**
 * POST /api/strategist/reports/generate
 * Generate a complete GTM strategy report
 */
router.post('/generate',
  [
    body('researchId')
      .isUUID('4')
      .withMessage('Research ID must be a valid UUID'),
    body('interviewSessionId')
      .optional()
      .isUUID('4')
      .withMessage('Interview session ID must be a valid UUID'),
    body('options')
      .optional()
      .isObject()
      .withMessage('Options must be an object'),
    body('options.generateBySections')
      .optional()
      .isBoolean()
      .withMessage('generateBySections must be a boolean'),
    body('options.autoImprove')
      .optional()
      .isBoolean()
      .withMessage('autoImprove must be a boolean'),
    body('options.qualityThreshold')
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage('Quality threshold must be between 0 and 100')
  ],
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Request validation errors',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
      }

      const { researchId, interviewSessionId, options = {} } = req.body;

      logger.info('GTM report generation requested', {
        researchId,
        interviewSessionId: interviewSessionId || 'none',
        userAgent: req.get('User-Agent'),
        ip: req.ip
      });

      // Set default options
      const generationOptions = {
        generateBySections: options.generateBySections || false,
        autoImprove: options.autoImprove !== undefined ? options.autoImprove : true,
        qualityThreshold: options.qualityThreshold || 80
      };

      // Generate the report
      const result = await reportGenerationService.generateGTMReport(
        researchId,
        interviewSessionId,
        generationOptions
      );

      // Log successful generation
      logger.info('GTM report generated successfully', {
        researchId,
        interviewSessionId,
        qualityScore: result.metadata.validation.qualityScore,
        generationTime: result.metadata.generationTime
      });

      res.status(200).json({
        success: true,
        message: 'GTM strategy report generated successfully',
        data: {
          report: result.report,
          metadata: result.metadata
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('GTM report generation failed', error, {
        researchId: req.body.researchId,
        interviewSessionId: req.body.interviewSessionId
      });

      // Handle specific error types (check more specific patterns first)
      if (error.message.includes('Invalid inputs')) {
        return res.status(400).json({
          error: 'Invalid Request',
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }

      if (error.message.includes('not found')) {
        return res.status(404).json({
          error: 'Resource Not Found',
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }

      // Claude API errors
      if (error.message.includes('Claude') || error.code === 'CLAUDE_API_ERROR') {
        return res.status(503).json({
          error: 'AI Service Unavailable',
          message: 'Report generation service is temporarily unavailable',
          retryAfter: 30,
          timestamp: new Date().toISOString()
        });
      }

      res.status(500).json({
        error: 'Report Generation Failed',
        message: 'An unexpected error occurred during report generation',
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * POST /api/strategist/reports/preview
 * Generate a preview (executive summary only) of the GTM report
 */
router.post('/preview',
  [
    body('researchId')
      .isUUID('4')
      .withMessage('Research ID must be a valid UUID'),
    body('interviewSessionId')
      .optional()
      .isUUID('4')
      .withMessage('Interview session ID must be a valid UUID')
  ],
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Request validation errors',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
      }

      const { researchId, interviewSessionId } = req.body;

      logger.info('GTM report preview requested', {
        researchId,
        interviewSessionId: interviewSessionId || 'none'
      });

      const preview = await reportGenerationService.generateReportPreview(
        researchId,
        interviewSessionId
      );

      res.status(200).json({
        success: true,
        message: 'GTM report preview generated successfully',
        data: preview,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('GTM report preview generation failed', error, {
        researchId: req.body.researchId,
        interviewSessionId: req.body.interviewSessionId
      });

      if (error.message.includes('not found')) {
        return res.status(404).json({
          error: 'Resource Not Found',
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }

      res.status(500).json({
        error: 'Preview Generation Failed',
        message: 'Failed to generate report preview',
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * POST /api/strategist/reports/validate-inputs
 * Validate that inputs are sufficient for report generation
 */
router.post('/validate-inputs',
  [
    body('researchId')
      .isUUID('4')
      .withMessage('Research ID must be a valid UUID'),
    body('interviewSessionId')
      .optional()
      .isUUID('4')
      .withMessage('Interview session ID must be a valid UUID')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
      }

      const { researchId, interviewSessionId } = req.body;

      const validation = await dataSynthesisService.validateSynthesisInputs(
        researchId,
        interviewSessionId
      );

      // If inputs are valid, also get data quality assessment
      let dataQuality = null;
      if (validation.valid) {
        try {
          const context = await dataSynthesisService.combineInputs(researchId, interviewSessionId);
          dataQuality = context.dataQuality;
        } catch (error) {
          logger.warn('Failed to assess data quality during validation', error);
        }
      }

      res.status(200).json({
        success: true,
        data: {
          valid: validation.valid,
          issues: validation.issues || [],
          dataQuality,
          recommendations: validation.valid
            ? ['Inputs are sufficient for report generation']
            : ['Please resolve the identified issues before generating a report']
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Input validation failed', error);

      res.status(500).json({
        error: 'Validation Failed',
        message: 'Failed to validate inputs for report generation',
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * GET /api/strategist/reports/options
 * Get available report generation options and their descriptions
 */
router.get('/options', (req, res) => {
  try {
    const options = reportGenerationService.getGenerationOptions();

    res.status(200).json({
      success: true,
      message: 'Report generation options retrieved successfully',
      data: {
        options,
        examples: {
          basicReport: {
            generateBySections: false,
            autoImprove: true
          },
          highQualityReport: {
            generateBySections: true,
            autoImprove: true,
            qualityThreshold: 90
          },
          fastReport: {
            generateBySections: false,
            autoImprove: false
          }
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to get report options', error);

    res.status(500).json({
      error: 'Options Retrieval Failed',
      message: 'Failed to retrieve report generation options',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/strategist/reports/data-synthesis/:researchId
 * Get synthesized data preview for a research ID
 */
router.get('/data-synthesis/:researchId',
  [
    param('researchId')
      .isUUID('4')
      .withMessage('Research ID must be a valid UUID'),
    query('interviewSessionId')
      .optional()
      .isUUID('4')
      .withMessage('Interview session ID must be a valid UUID')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
      }

      const { researchId } = req.params;
      const { interviewSessionId } = req.query;

      logger.info('Data synthesis preview requested', { researchId, interviewSessionId });

      const context = await dataSynthesisService.combineInputs(researchId, interviewSessionId);

      // Remove sensitive or large data for preview
      const preview = {
        business: context.business,
        market: {
          size: context.market.size,
          competitors: context.market.competitors.map(c => ({
            name: c.name,
            positioning: c.positioning
          })),
          painPoints: context.market.painPoints.map(p => ({
            problem: p.problem,
            severity: p.severity
          })),
          opportunities: context.market.opportunities.slice(0, 3),
          threats: context.market.threats.slice(0, 3)
        },
        marketing: {
          channels: context.marketing.channels.map(c => ({
            name: c.name,
            priority: c.priority
          }))
        },
        dataQuality: context.dataQuality,
        meta: context.meta
      };

      res.status(200).json({
        success: true,
        message: 'Data synthesis preview retrieved successfully',
        data: preview,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Data synthesis preview failed', error);

      if (error.message.includes('not found')) {
        return res.status(404).json({
          error: 'Resource Not Found',
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }

      res.status(500).json({
        error: 'Data Synthesis Failed',
        message: 'Failed to retrieve data synthesis preview',
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * GET /api/strategist/reports/health
 * Health check for report generation services
 */
router.get('/health', async (req, res) => {
  try {
    const health = {
      reportService: 'operational',
      synthesisService: 'operational',
      claudeService: 'unknown',
      timestamp: new Date().toISOString()
    };

    // Test Claude service availability (optional quick test)
    try {
      // Simple test call with very short timeout
      await require('../../services/claudeService').callClaude(
        'Respond with "OK"',
        { timeout: 5000, maxRetries: 1 }
      );
      health.claudeService = 'operational';
    } catch (error) {
      health.claudeService = 'degraded';
      logger.warn('Claude service health check failed', error);
    }

    const status = Object.values(health).every(s => s === 'operational') ? 'healthy' : 'degraded';

    res.status(status === 'healthy' ? 200 : 503).json({
      success: true,
      status,
      services: health,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Report service health check failed', error);

    res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;