// Optimization API - Module 4 Analyzer
// Automated campaign optimization and recommendations

const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const OptimizerService = require('../../services/analyzer/optimizerService');
const logger = require('../../utils/logger');
const { success: formatSuccessResponse, error: formatErrorResponse } = require('../../utils/responseFormatter');

const router = express.Router();
const optimizerService = new OptimizerService();

/**
 * POST /api/analyzer/optimize/:campaign_id
 * Run optimization analysis and actions for a campaign
 */
router.post('/:campaign_id', [
  param('campaign_id').isUUID().withMessage('Valid campaign_id is required'),
  body('auto_execute').optional().isBoolean().withMessage('auto_execute must be boolean'),
  body('dry_run').optional().isBoolean().withMessage('dry_run must be boolean'),
  body('rules_override').optional().isObject().withMessage('rules_override must be an object'),
  body('max_actions').optional().isInt({ min: 1, max: 10 }).withMessage('max_actions must be 1-10')
], async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(formatErrorResponse(
        'Invalid request parameters',
        400,
        'VALIDATION_ERROR',
        { validationErrors: errors.array() }
      ));
    }

    const { campaign_id } = req.params;
    const {
      auto_execute = false,
      dry_run = true,
      rules_override = null,
      max_actions = 5
    } = req.body;

    logger.info('Campaign optimization requested', {
      campaign_id,
      auto_execute,
      dry_run,
      max_actions
    });

    // Run optimization
    const optimizationResult = await optimizerService.optimizeCampaign(campaign_id, {
      autoExecute: auto_execute,
      dryRun: dry_run,
      rulesOverride: rules_override
    });

    // Limit recommendations if specified
    if (optimizationResult.recommendations && optimizationResult.recommendations.length > max_actions) {
      optimizationResult.recommendations = optimizationResult.recommendations.slice(0, max_actions);
    }

    logger.info('Campaign optimization completed', {
      campaign_id,
      status: optimizationResult.status,
      issues_count: optimizationResult.issues_detected,
      recommendations_count: optimizationResult.recommendations?.length || 0,
      executed: auto_execute && !dry_run
    });

    const message = auto_execute && !dry_run ?
      'Campaign optimization executed successfully' :
      'Campaign optimization analysis completed';

    res.status(200).json(formatSuccessResponse(optimizationResult, message));

  } catch (error) {
    logger.error('Campaign optimization failed', error, {
      campaign_id: req.params.campaign_id
    });

    if (error.message.includes('already being optimized')) {
      res.status(409).json(formatErrorResponse(
        'Campaign optimization already in progress',
        409,
        'OPTIMIZATION_IN_PROGRESS',
        { campaign_id: req.params.campaign_id }
      ));
    } else if (error.message.includes('not found')) {
      res.status(404).json(formatErrorResponse(
        'Campaign not found',
        404,
        'CAMPAIGN_NOT_FOUND',
        { campaign_id: req.params.campaign_id }
      ));
    } else {
      res.status(500).json(formatErrorResponse(
        'Campaign optimization failed',
        500,
        'OPTIMIZATION_ERROR',
        { campaign_id: req.params.campaign_id, error: error.message }
      ));
    }
  }
});

/**
 * GET /api/analyzer/optimize/:campaign_id/history
 * Get optimization history for a campaign
 */
router.get('/:campaign_id/history', [
  param('campaign_id').isUUID().withMessage('Valid campaign_id is required'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(formatErrorResponse(
        'Invalid request parameters',
        400,
        'VALIDATION_ERROR',
        { validationErrors: errors.array() }
      ));
    }

    const { campaign_id } = req.params;
    const { limit = 20 } = req.query;

    logger.info('Optimization history requested', { campaign_id, limit });

    const history = await optimizerService.getOptimizationHistory(campaign_id, parseInt(limit));

    const response = {
      campaign_id,
      total_optimizations: history.length,
      history: history.map(item => ({
        trigger: item.trigger,
        action: item.action,
        timestamps: item.timestamps,
        success: item.action.status === 'completed'
      })),
      summary: {
        completed_actions: history.filter(h => h.action.status === 'completed').length,
        failed_actions: history.filter(h => h.action.status === 'failed').length,
        pending_actions: history.filter(h => h.action.status === 'pending').length
      }
    };

    logger.info('Optimization history retrieved', {
      campaign_id,
      history_count: history.length
    });

    res.status(200).json(formatSuccessResponse(
      response,
      `Optimization history retrieved (${history.length} entries)`
    ));

  } catch (error) {
    logger.error('Failed to get optimization history', error, {
      campaign_id: req.params.campaign_id
    });

    res.status(500).json(formatErrorResponse(
      'Failed to retrieve optimization history',
      500,
      'HISTORY_ERROR',
      { campaign_id: req.params.campaign_id, error: error.message }
    ));
  }
});

/**
 * POST /api/analyzer/optimize/bulk
 * Run optimization for multiple campaigns
 */
router.post('/bulk', [
  body('campaign_ids').isArray({ min: 1, max: 10 }).withMessage('campaign_ids must be array of 1-10 UUIDs'),
  body('campaign_ids.*').isUUID().withMessage('All campaign_ids must be valid UUIDs'),
  body('auto_execute').optional().isBoolean().withMessage('auto_execute must be boolean'),
  body('dry_run').optional().isBoolean().withMessage('dry_run must be boolean'),
  body('parallel').optional().isBoolean().withMessage('parallel must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(formatErrorResponse(
        'Invalid request parameters',
        400,
        'VALIDATION_ERROR',
        { validationErrors: errors.array() }
      ));
    }

    const {
      campaign_ids,
      auto_execute = false,
      dry_run = true,
      parallel = false
    } = req.body;

    logger.info('Bulk optimization requested', {
      campaign_count: campaign_ids.length,
      auto_execute,
      dry_run,
      parallel
    });

    const results = [];

    if (parallel) {
      // Run optimizations in parallel
      const promises = campaign_ids.map(campaignId =>
        optimizerService.optimizeCampaign(campaignId, {
          autoExecute: auto_execute,
          dryRun: dry_run
        }).catch(error => ({
          campaign_id: campaignId,
          status: 'failed',
          error: error.message
        }))
      );

      const parallelResults = await Promise.all(promises);
      results.push(...parallelResults);

    } else {
      // Run optimizations sequentially
      for (const campaignId of campaign_ids) {
        try {
          const result = await optimizerService.optimizeCampaign(campaignId, {
            autoExecute: auto_execute,
            dryRun: dry_run
          });
          results.push(result);

          // Small delay between sequential optimizations
          await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error) {
          results.push({
            campaign_id: campaignId,
            status: 'failed',
            error: error.message
          });

          logger.warn('Campaign optimization failed in bulk operation', error, { campaignId });
        }
      }
    }

    // Summarize results
    const summary = {
      total_campaigns: campaign_ids.length,
      successful_optimizations: results.filter(r => r.status !== 'failed').length,
      failed_optimizations: results.filter(r => r.status === 'failed').length,
      total_issues_detected: results.reduce((sum, r) => sum + (r.issues_detected || 0), 0),
      total_recommendations: results.reduce((sum, r) => sum + (r.recommendations?.length || 0), 0),
      execution_mode: auto_execute && !dry_run ? 'executed' : 'analysis_only'
    };

    const response = {
      summary,
      results,
      processing: {
        parallel,
        completed_at: new Date().toISOString()
      }
    };

    logger.info('Bulk optimization completed', {
      total_campaigns: campaign_ids.length,
      successful: summary.successful_optimizations,
      failed: summary.failed_optimizations
    });

    res.status(200).json(formatSuccessResponse(
      response,
      `Bulk optimization completed: ${summary.successful_optimizations}/${campaign_ids.length} successful`
    ));

  } catch (error) {
    logger.error('Bulk optimization failed', error, req.body);

    res.status(500).json(formatErrorResponse(
      'Bulk optimization failed',
      500,
      'BULK_OPTIMIZATION_ERROR',
      { error: error.message }
    ));
  }
});

/**
 * GET /api/analyzer/optimize/rules
 * Get current optimization rules and thresholds
 */
router.get('/rules', async (req, res) => {
  try {
    const rules = {
      optimization_rules: {
        low_ctr: {
          threshold: 1.0,
          unit: 'percentage',
          description: 'Click-through rate below threshold triggers creative optimization',
          actions: ['pause_ad', 'suggest_creative', 'adjust_targeting'],
          priority: 'high'
        },
        high_cpa: {
          threshold: 75.0,
          unit: 'dollars',
          description: 'Cost per acquisition above threshold triggers bid optimization',
          actions: ['adjust_bidding', 'narrow_targeting', 'pause_if_severe'],
          priority: 'high'
        },
        low_roas: {
          threshold: 1.5,
          unit: 'ratio',
          description: 'Return on ad spend below threshold triggers budget optimization',
          actions: ['decrease_budget', 'optimize_targeting', 'pause_if_critical'],
          priority: 'critical'
        },
        high_frequency: {
          threshold: 3.0,
          unit: 'ratio',
          description: 'Ad frequency above threshold triggers audience expansion',
          actions: ['expand_audience', 'refresh_creative'],
          priority: 'medium'
        },
        low_conversion_rate: {
          threshold: 2.0,
          unit: 'percentage',
          description: 'Conversion rate below threshold triggers targeting optimization',
          actions: ['optimize_landing_page', 'adjust_targeting', 'test_new_offer'],
          priority: 'medium'
        },
        budget_pacing: {
          threshold: 1.5,
          unit: 'ratio',
          description: 'Budget spending above threshold triggers bid adjustments',
          actions: ['adjust_bids', 'schedule_optimization'],
          priority: 'medium'
        }
      },
      rule_priorities: ['critical', 'high', 'medium', 'low'],
      supported_actions: [
        'pause_campaign',
        'pause_ad',
        'adjust_bidding',
        'decrease_budget',
        'increase_budget',
        'narrow_targeting',
        'expand_audience',
        'suggest_creative',
        'refresh_creative',
        'optimize_landing_page',
        'adjust_targeting',
        'test_new_offer',
        'adjust_bids',
        'schedule_optimization'
      ]
    };

    res.status(200).json(formatSuccessResponse(
      rules,
      'Optimization rules retrieved successfully'
    ));

  } catch (error) {
    logger.error('Failed to get optimization rules', error);

    res.status(500).json(formatErrorResponse(
      'Failed to retrieve optimization rules',
      500,
      'RULES_ERROR',
      { error: error.message }
    ));
  }
});

/**
 * GET /api/analyzer/optimize/health
 * Get optimizer service health status
 */
router.get('/health', async (req, res) => {
  try {
    const healthStatus = await optimizerService.getHealthStatus();

    res.status(200).json(formatSuccessResponse(
      healthStatus,
      'Optimizer service health check completed'
    ));

  } catch (error) {
    logger.error('Optimizer health check failed', error);

    res.status(500).json(formatErrorResponse(
      'Optimizer health check failed',
      500,
      'HEALTH_CHECK_ERROR',
      { error: error.message }
    ));
  }
});

module.exports = router;