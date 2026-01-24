// Performance Tracking API - Module 4 Analyzer
// Real-time campaign performance tracking and analytics

const express = require('express');
const { query, param, validationResult } = require('express-validator');
const AnalyticsService = require('../../services/analyzer/analyticsService');
const logger = require('../../utils/logger');
const { success: formatSuccessResponse, error: formatErrorResponse } = require('../../utils/responseFormatter');

const router = express.Router();
const analyticsService = new AnalyticsService();

/**
 * GET /api/analyzer/performance/:campaign_id
 * Get performance data for a specific campaign
 */
router.get('/:campaign_id', [
  param('campaign_id').isUUID().withMessage('Valid campaign_id is required'),
  query('start_date').optional().isISO8601().withMessage('Invalid start_date format (ISO8601 required)'),
  query('end_date').optional().isISO8601().withMessage('Invalid end_date format (ISO8601 required)'),
  query('data_source').optional().isIn(['auto', 'gomarble_mcp', 'direct_api', 'mock']).withMessage('Invalid data_source'),
  query('include_history').optional().isBoolean().withMessage('include_history must be boolean')
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
      start_date,
      end_date,
      data_source = 'auto',
      include_history = false
    } = req.query;

    logger.info('Performance data requested', {
      campaign_id,
      start_date,
      end_date,
      data_source,
      include_history
    });

    // Parse dates if provided
    let startDate, endDate;
    if (start_date) {
      startDate = new Date(start_date);
    }
    if (end_date) {
      endDate = new Date(end_date);
    }

    // Get performance data
    const performance = await analyticsService.getPerformanceData(campaign_id, {
      startDate,
      endDate,
      dataSource: data_source
    });

    // Get historical data if requested
    let history = null;
    if (include_history === 'true') {
      const historyDays = startDate && endDate ?
        Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) * 2 : // Double the period for context
        30; // Default to 30 days

      history = await analyticsService.getPerformanceHistory(campaign_id, historyDays);
    }

    const response = {
      ...performance,
      history: history
    };

    logger.info('Performance data retrieved', {
      campaign_id,
      data_source: performance.data_source,
      metrics_count: Object.keys(performance.metrics).length,
      has_history: !!history
    });

    res.status(200).json(formatSuccessResponse(
      response,
      'Campaign performance data retrieved successfully'
    ));

  } catch (error) {
    logger.error('Failed to get performance data', error, {
      campaign_id: req.params.campaign_id
    });

    if (error.message.includes('not found')) {
      res.status(404).json(formatErrorResponse(
        'Campaign not found',
        404,
        'CAMPAIGN_NOT_FOUND',
        { campaign_id: req.params.campaign_id }
      ));
    } else {
      res.status(500).json(formatErrorResponse(
        'Failed to retrieve performance data',
        500,
        'PERFORMANCE_ERROR',
        { campaign_id: req.params.campaign_id, error: error.message }
      ));
    }
  }
});

/**
 * GET /api/analyzer/performance
 * Get performance data for multiple campaigns or user overview
 */
router.get('/', [
  query('user_id').optional().isUUID().withMessage('Invalid user_id'),
  query('campaign_ids').optional().custom((value) => {
    if (typeof value === 'string') {
      const ids = value.split(',').map(id => id.trim());
      if (!ids.every(id => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id))) {
        throw new Error('All campaign_ids must be valid UUIDs');
      }
    }
    return true;
  }),
  query('start_date').optional().isISO8601().withMessage('Invalid start_date format'),
  query('end_date').optional().isISO8601().withMessage('Invalid end_date format'),
  query('data_source').optional().isIn(['auto', 'gomarble_mcp', 'direct_api', 'mock']).withMessage('Invalid data_source'),
  query('aggregate').optional().isBoolean().withMessage('aggregate must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(formatErrorResponse(
        'Invalid query parameters',
        400,
        'VALIDATION_ERROR',
        { validationErrors: errors.array() }
      ));
    }

    const {
      user_id,
      campaign_ids,
      start_date,
      end_date,
      data_source = 'auto',
      aggregate = false
    } = req.query;

    if (!user_id && !campaign_ids) {
      return res.status(400).json(formatErrorResponse(
        'Either user_id or campaign_ids is required',
        400,
        'MISSING_PARAMETERS'
      ));
    }

    logger.info('Multiple campaign performance requested', {
      user_id,
      campaign_ids,
      aggregate
    });

    let campaignIds = [];
    if (campaign_ids) {
      campaignIds = campaign_ids.split(',').map(id => id.trim());
    } else if (user_id) {
      // Get campaigns for user
      const { Pool } = require('pg');
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });

      const campaignQuery = `
        SELECT id FROM campaigns
        WHERE user_id = $1
        AND status IN ('active', 'paused')
        ORDER BY created_at DESC
        LIMIT 20
      `;

      const campaignResult = await pool.query(campaignQuery, [user_id]);
      campaignIds = campaignResult.rows.map(row => row.id);
    }

    if (campaignIds.length === 0) {
      return res.status(200).json(formatSuccessResponse(
        {
          campaigns: [],
          summary: {
            total_campaigns: 0,
            total_spend: 0,
            total_revenue: 0,
            average_roas: 0
          }
        },
        'No campaigns found'
      ));
    }

    // Parse dates
    let startDate, endDate;
    if (start_date) startDate = new Date(start_date);
    if (end_date) endDate = new Date(end_date);

    // Get performance data for all campaigns
    const campaignPerformance = [];
    let totalMetrics = {
      impressions: 0,
      clicks: 0,
      conversions: 0,
      spend: 0,
      revenue: 0
    };

    for (const campaignId of campaignIds) {
      try {
        const performance = await analyticsService.getPerformanceData(campaignId, {
          startDate,
          endDate,
          dataSource: data_source
        });

        campaignPerformance.push(performance);

        // Add to totals for aggregation
        if (aggregate === 'true') {
          Object.keys(totalMetrics).forEach(key => {
            totalMetrics[key] += performance.metrics[key] || 0;
          });
        }

      } catch (error) {
        logger.warn('Failed to get performance for campaign', error, { campaignId });

        campaignPerformance.push({
          campaign_id: campaignId,
          error: 'Performance data unavailable',
          metrics: {}
        });
      }
    }

    // Calculate aggregated metrics
    let summary = null;
    if (aggregate === 'true') {
      if (totalMetrics.impressions > 0) {
        totalMetrics.ctr = parseFloat(((totalMetrics.clicks / totalMetrics.impressions) * 100).toFixed(2));
      }
      if (totalMetrics.clicks > 0) {
        totalMetrics.cpc = parseFloat((totalMetrics.spend / totalMetrics.clicks).toFixed(2));
        totalMetrics.conversion_rate = parseFloat(((totalMetrics.conversions / totalMetrics.clicks) * 100).toFixed(2));
      }
      if (totalMetrics.conversions > 0) {
        totalMetrics.cpa = parseFloat((totalMetrics.spend / totalMetrics.conversions).toFixed(2));
      }
      if (totalMetrics.spend > 0) {
        totalMetrics.roas = parseFloat((totalMetrics.revenue / totalMetrics.spend).toFixed(2));
      }

      summary = {
        total_campaigns: campaignIds.length,
        successful_campaigns: campaignPerformance.filter(p => !p.error).length,
        ...totalMetrics
      };
    }

    const response = {
      campaigns: campaignPerformance,
      summary,
      data_source: data_source,
      date_range: {
        start: startDate?.toISOString() || null,
        end: endDate?.toISOString() || null
      },
      aggregated: aggregate === 'true',
      last_updated: new Date().toISOString()
    };

    logger.info('Multiple campaign performance retrieved', {
      campaign_count: campaignIds.length,
      successful_count: campaignPerformance.filter(p => !p.error).length,
      aggregated: aggregate === 'true'
    });

    res.status(200).json(formatSuccessResponse(
      response,
      `Performance data for ${campaignIds.length} campaigns retrieved`
    ));

  } catch (error) {
    logger.error('Failed to get multiple campaign performance', error, req.query);

    res.status(500).json(formatErrorResponse(
      'Failed to retrieve campaign performance data',
      500,
      'PERFORMANCE_ERROR',
      { error: error.message }
    ));
  }
});

/**
 * GET /api/analyzer/performance/:campaign_id/history
 * Get performance history for a campaign
 */
router.get('/:campaign_id/history', [
  param('campaign_id').isUUID().withMessage('Valid campaign_id is required'),
  query('days').optional().isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365')
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
    const { days = 30 } = req.query;

    logger.info('Performance history requested', { campaign_id, days });

    const history = await analyticsService.getPerformanceHistory(campaign_id, parseInt(days));

    const response = {
      campaign_id,
      days_requested: parseInt(days),
      snapshots_count: history.length,
      history,
      date_range: {
        start: history.length > 0 ? history[history.length - 1].timestamp : null,
        end: history.length > 0 ? history[0].timestamp : null
      }
    };

    res.status(200).json(formatSuccessResponse(
      response,
      `Performance history for ${days} days retrieved`
    ));

  } catch (error) {
    logger.error('Failed to get performance history', error, {
      campaign_id: req.params.campaign_id
    });

    res.status(500).json(formatErrorResponse(
      'Failed to retrieve performance history',
      500,
      'HISTORY_ERROR',
      { campaign_id: req.params.campaign_id, error: error.message }
    ));
  }
});

/**
 * GET /api/analyzer/performance/health
 * Get analytics service health status
 */
router.get('/health', async (req, res) => {
  try {
    const healthStatus = await analyticsService.getHealthStatus();

    res.status(200).json(formatSuccessResponse(
      healthStatus,
      'Analytics service health check completed'
    ));

  } catch (error) {
    logger.error('Analytics health check failed', error);

    res.status(500).json(formatErrorResponse(
      'Analytics health check failed',
      500,
      'HEALTH_CHECK_ERROR',
      { error: error.message }
    ));
  }
});

module.exports = router;