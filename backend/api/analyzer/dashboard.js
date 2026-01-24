// Dashboard API - Module 4 Analyzer
// Real-time dashboard data and WebSocket management

const express = require('express');
const { query, param, body, validationResult } = require('express-validator');
const DashboardService = require('../../services/analyzer/dashboardService');
const logger = require('../../utils/logger');
const { success: formatSuccessResponse, error: formatErrorResponse } = require('../../utils/responseFormatter');

const router = express.Router();
const dashboardService = new DashboardService();

/**
 * GET /api/analyzer/dashboard/:user_id
 * Get complete dashboard data for a user
 */
router.get('/:user_id', [
  param('user_id').isUUID().withMessage('Valid user_id is required'),
  query('sections').optional().custom((value) => {
    if (typeof value === 'string') {
      const validSections = ['campaign_performance', 'website_analytics', 'revenue_tracking', 'goal_progress', 'system_health', 'notifications'];
      const requestedSections = value.split(',').map(s => s.trim());
      const invalidSections = requestedSections.filter(s => !validSections.includes(s));
      if (invalidSections.length > 0) {
        throw new Error(`Invalid sections: ${invalidSections.join(', ')}`);
      }
    }
    return true;
  }),
  query('cache').optional().isBoolean().withMessage('cache must be boolean')
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

    const { user_id } = req.params;
    const {
      sections,
      cache = true
    } = req.query;

    logger.info('Dashboard data requested', {
      user_id,
      sections: sections || 'all',
      cache
    });

    // Get complete dashboard data
    const dashboardData = await dashboardService.getDashboardData(user_id);

    // Filter sections if specified
    let filteredData = dashboardData;
    if (sections) {
      const requestedSections = sections.split(',').map(s => s.trim());
      filteredData = {
        user_id: dashboardData.user_id,
        dashboard_config: dashboardData.dashboard_config,
        last_updated: dashboardData.last_updated,
        next_update: dashboardData.next_update
      };

      requestedSections.forEach(section => {
        if (dashboardData[section]) {
          filteredData[section] = dashboardData[section];
        }
      });
    }

    logger.info('Dashboard data retrieved', {
      user_id,
      sections_count: Object.keys(filteredData).length - 4, // Exclude metadata
      campaigns_count: filteredData.campaign_performance?.campaigns?.length || 0,
      notifications_count: filteredData.notifications?.length || 0
    });

    res.status(200).json(formatSuccessResponse(
      filteredData,
      'Dashboard data retrieved successfully'
    ));

  } catch (error) {
    logger.error('Failed to get dashboard data', error, {
      user_id: req.params.user_id
    });

    res.status(500).json(formatErrorResponse(
      'Failed to retrieve dashboard data',
      500,
      'DASHBOARD_ERROR',
      { user_id: req.params.user_id, error: error.message }
    ));
  }
});

/**
 * GET /api/analyzer/dashboard/:user_id/summary
 * Get dashboard summary with key metrics only
 */
router.get('/:user_id/summary', [
  param('user_id').isUUID().withMessage('Valid user_id is required')
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

    const { user_id } = req.params;

    logger.info('Dashboard summary requested', { user_id });

    // Get full dashboard data
    const dashboardData = await dashboardService.getDashboardData(user_id);

    // Extract summary metrics
    const summary = {
      user_id,
      campaign_performance: {
        total_campaigns: dashboardData.campaign_performance?.summary?.total_campaigns || 0,
        active_campaigns: dashboardData.campaign_performance?.summary?.active_campaigns || 0,
        total_spend: dashboardData.campaign_performance?.summary?.total_spend || 0,
        total_revenue: dashboardData.campaign_performance?.summary?.total_revenue || 0,
        average_roas: dashboardData.campaign_performance?.summary?.average_roas || 0
      },
      revenue_tracking: {
        current_month: dashboardData.revenue_tracking?.current_month || 0,
        growth_percentage: dashboardData.revenue_tracking?.growth_percentage || 0,
        average_daily: dashboardData.revenue_tracking?.average_daily || 0
      },
      goal_progress: {
        goal_amount: dashboardData.goal_progress?.goal_amount || 10000,
        current_amount: dashboardData.goal_progress?.current_amount || 0,
        progress_percentage: dashboardData.goal_progress?.progress_percentage || 0,
        on_track: dashboardData.goal_progress?.on_track || false
      },
      system_health: {
        overall_status: dashboardData.system_health?.overall_status || 'unknown',
        critical_issues: dashboardData.system_health?.critical_issues || 0
      },
      unread_notifications: dashboardData.notifications?.filter(n => !n.read).length || 0,
      last_updated: dashboardData.last_updated
    };

    logger.info('Dashboard summary retrieved', {
      user_id,
      campaigns: summary.campaign_performance.total_campaigns,
      revenue: summary.revenue_tracking.current_month,
      goal_progress: summary.goal_progress.progress_percentage
    });

    res.status(200).json(formatSuccessResponse(
      summary,
      'Dashboard summary retrieved successfully'
    ));

  } catch (error) {
    logger.error('Failed to get dashboard summary', error, {
      user_id: req.params.user_id
    });

    res.status(500).json(formatErrorResponse(
      'Failed to retrieve dashboard summary',
      500,
      'SUMMARY_ERROR',
      { user_id: req.params.user_id, error: error.message }
    ));
  }
});

/**
 * PUT /api/analyzer/dashboard/:user_id/config
 * Update user's dashboard configuration
 */
router.put('/:user_id/config', [
  param('user_id').isUUID().withMessage('Valid user_id is required'),
  body('layout').optional().isIn(['grid', 'list', 'cards']).withMessage('Invalid layout'),
  body('widgets').optional().isArray().withMessage('Widgets must be an array'),
  body('theme').optional().isIn(['light', 'dark']).withMessage('Invalid theme'),
  body('auto_refresh').optional().isBoolean().withMessage('auto_refresh must be boolean'),
  body('refresh_interval').optional().isInt({ min: 1, max: 60 }).withMessage('Refresh interval must be 1-60 minutes'),
  body('goal_revenue').optional().isFloat({ min: 1 }).withMessage('Goal revenue must be positive number'),
  body('goal_deadline').optional().isISO8601().withMessage('Invalid goal_deadline format'),
  body('notification_preferences').optional().isObject().withMessage('notification_preferences must be object')
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

    const { user_id } = req.params;
    const configUpdates = req.body;

    logger.info('Dashboard config update requested', {
      user_id,
      updates: Object.keys(configUpdates)
    });

    // Get current config
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    let currentConfigQuery = `
      SELECT config, goal_revenue, goal_deadline, notification_preferences
      FROM dashboard_configs
      WHERE user_id = $1
    `;

    let currentConfigResult = await pool.query(currentConfigQuery, [user_id]);
    let currentConfig = {};

    if (currentConfigResult.rows.length > 0) {
      const row = currentConfigResult.rows[0];
      currentConfig = {
        config: row.config || {},
        goal_revenue: row.goal_revenue,
        goal_deadline: row.goal_deadline,
        notification_preferences: row.notification_preferences || {}
      };
    }

    // Merge updates
    const updatedConfig = { ...currentConfig.config };
    const configFields = ['layout', 'widgets', 'theme', 'auto_refresh', 'refresh_interval'];

    configFields.forEach(field => {
      if (configUpdates[field] !== undefined) {
        updatedConfig[field] = configUpdates[field];
      }
    });

    // Prepare update values
    const goalRevenue = configUpdates.goal_revenue !== undefined ?
      configUpdates.goal_revenue : currentConfig.goal_revenue;

    const goalDeadline = configUpdates.goal_deadline ?
      new Date(configUpdates.goal_deadline) : currentConfig.goal_deadline;

    const notificationPrefs = configUpdates.notification_preferences ?
      { ...currentConfig.notification_preferences, ...configUpdates.notification_preferences } :
      currentConfig.notification_preferences;

    // Update database
    const updateQuery = `
      INSERT INTO dashboard_configs (user_id, config, goal_revenue, goal_deadline, notification_preferences)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id) DO UPDATE SET
        config = EXCLUDED.config,
        goal_revenue = EXCLUDED.goal_revenue,
        goal_deadline = EXCLUDED.goal_deadline,
        notification_preferences = EXCLUDED.notification_preferences,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const updateResult = await pool.query(updateQuery, [
      user_id,
      JSON.stringify(updatedConfig),
      goalRevenue,
      goalDeadline,
      JSON.stringify(notificationPrefs)
    ]);

    const updatedRow = updateResult.rows[0];

    const response = {
      user_id,
      config: updatedRow.config,
      goal_revenue: updatedRow.goal_revenue,
      goal_deadline: updatedRow.goal_deadline,
      notification_preferences: updatedRow.notification_preferences,
      updated_at: updatedRow.updated_at
    };

    logger.info('Dashboard config updated', {
      user_id,
      fields_updated: Object.keys(configUpdates)
    });

    res.status(200).json(formatSuccessResponse(
      response,
      'Dashboard configuration updated successfully'
    ));

  } catch (error) {
    logger.error('Failed to update dashboard config', error, {
      user_id: req.params.user_id
    });

    res.status(500).json(formatErrorResponse(
      'Failed to update dashboard configuration',
      500,
      'CONFIG_UPDATE_ERROR',
      { user_id: req.params.user_id, error: error.message }
    ));
  }
});

/**
 * GET /api/analyzer/dashboard/:user_id/notifications
 * Get user's notifications
 */
router.get('/:user_id/notifications', [
  param('user_id').isUUID().withMessage('Valid user_id is required'),
  query('unread_only').optional().isBoolean().withMessage('unread_only must be boolean'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100')
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

    const { user_id } = req.params;
    const {
      unread_only = false,
      limit = 20
    } = req.query;

    logger.info('Notifications requested', { user_id, unread_only, limit });

    // Get notifications from database
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    let query = `
      SELECT notification_type, title, message, data, priority, created_at, read
      FROM notification_queue
      WHERE user_id = $1
    `;

    const params = [user_id];

    if (unread_only === 'true') {
      query += ` AND read = false`;
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
    params.push(parseInt(limit));

    const result = await pool.query(query, params);

    const notifications = result.rows.map(row => ({
      type: row.notification_type,
      title: row.title,
      message: row.message,
      data: row.data,
      priority: row.priority,
      created_at: row.created_at,
      read: row.read
    }));

    const summary = {
      total_notifications: notifications.length,
      unread_count: notifications.filter(n => !n.read).length,
      by_priority: notifications.reduce((acc, n) => {
        acc[n.priority] = (acc[n.priority] || 0) + 1;
        return acc;
      }, {}),
      latest_notification: notifications[0]?.created_at || null
    };

    const response = {
      user_id,
      notifications,
      summary,
      filters: {
        unread_only: unread_only === 'true',
        limit: parseInt(limit)
      }
    };

    logger.info('Notifications retrieved', {
      user_id,
      count: notifications.length,
      unread: summary.unread_count
    });

    res.status(200).json(formatSuccessResponse(
      response,
      `Retrieved ${notifications.length} notifications`
    ));

  } catch (error) {
    logger.error('Failed to get notifications', error, {
      user_id: req.params.user_id
    });

    res.status(500).json(formatErrorResponse(
      'Failed to retrieve notifications',
      500,
      'NOTIFICATIONS_ERROR',
      { user_id: req.params.user_id, error: error.message }
    ));
  }
});

/**
 * PUT /api/analyzer/dashboard/:user_id/notifications/mark-read
 * Mark notifications as read
 */
router.put('/:user_id/notifications/mark-read', [
  param('user_id').isUUID().withMessage('Valid user_id is required'),
  body('notification_ids').optional().isArray().withMessage('notification_ids must be array'),
  body('all').optional().isBoolean().withMessage('all must be boolean')
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

    const { user_id } = req.params;
    const {
      notification_ids,
      all = false
    } = req.body;

    if (!notification_ids && !all) {
      return res.status(400).json(formatErrorResponse(
        'Either notification_ids or all=true is required',
        400,
        'MISSING_PARAMETERS'
      ));
    }

    logger.info('Mark notifications as read', {
      user_id,
      all,
      count: notification_ids?.length || 'all'
    });

    // Update notifications
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    let query, params;

    if (all) {
      query = `
        UPDATE notification_queue
        SET read = true
        WHERE user_id = $1 AND read = false
      `;
      params = [user_id];
    } else {
      query = `
        UPDATE notification_queue
        SET read = true
        WHERE user_id = $1 AND id = ANY($2) AND read = false
      `;
      params = [user_id, notification_ids];
    }

    const result = await pool.query(query, params);
    const updatedCount = result.rowCount;

    logger.info('Notifications marked as read', {
      user_id,
      updated_count: updatedCount
    });

    res.status(200).json(formatSuccessResponse(
      {
        user_id,
        updated_count: updatedCount,
        marked_all: all
      },
      `${updatedCount} notifications marked as read`
    ));

  } catch (error) {
    logger.error('Failed to mark notifications as read', error, {
      user_id: req.params.user_id
    });

    res.status(500).json(formatErrorResponse(
      'Failed to mark notifications as read',
      500,
      'MARK_READ_ERROR',
      { user_id: req.params.user_id, error: error.message }
    ));
  }
});

/**
 * GET /api/analyzer/dashboard/health
 * Get dashboard service health status
 */
router.get('/health', async (req, res) => {
  try {
    const healthStatus = await dashboardService.getHealthStatus();

    res.status(200).json(formatSuccessResponse(
      healthStatus,
      'Dashboard service health check completed'
    ));

  } catch (error) {
    logger.error('Dashboard health check failed', error);

    res.status(500).json(formatErrorResponse(
      'Dashboard health check failed',
      500,
      'HEALTH_CHECK_ERROR',
      { error: error.message }
    ));
  }
});

module.exports = router;