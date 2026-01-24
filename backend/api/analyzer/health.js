// System Health API - Module 4 Analyzer
// System health monitoring and status endpoints

const express = require('express');
const { query, param, validationResult } = require('express-validator');
const MonitoringService = require('../../services/analyzer/monitoringService');
const logger = require('../../utils/logger');
const { success: formatSuccessResponse, error: formatErrorResponse } = require('../../utils/responseFormatter');

const router = express.Router();
const monitoringService = new MonitoringService();

/**
 * GET /api/analyzer/health/system
 * Get comprehensive system health status
 */
router.get('/system', [
  query('include_history').optional().isBoolean().withMessage('include_history must be boolean'),
  query('services').optional().custom((value) => {
    if (typeof value === 'string') {
      const validServices = ['database', 'gomarble_mcp', 'meta_api', 'google_ads', 'shopify', 'server'];
      const requestedServices = value.split(',').map(s => s.trim());
      const invalidServices = requestedServices.filter(s => !validServices.includes(s));
      if (invalidServices.length > 0) {
        throw new Error(`Invalid services: ${invalidServices.join(', ')}`);
      }
    }
    return true;
  })
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
      include_history = false,
      services
    } = req.query;

    logger.info('System health check requested', {
      include_history,
      specific_services: services || 'all'
    });

    // Get current system health
    const systemHealth = await monitoringService.getSystemHealth();

    // Filter services if specified
    if (services) {
      const requestedServices = services.split(',').map(s => s.trim());
      const filteredServices = {};

      requestedServices.forEach(serviceName => {
        if (systemHealth.services[serviceName]) {
          filteredServices[serviceName] = systemHealth.services[serviceName];
        }
      });

      systemHealth.services = filteredServices;
    }

    // Add history if requested
    if (include_history === 'true') {
      const serviceNames = Object.keys(systemHealth.services);
      const historyPromises = serviceNames.map(async serviceName => {
        const history = await monitoringService.getServiceHealthHistory(serviceName, 24);
        return { serviceName, history };
      });

      const historyResults = await Promise.all(historyPromises);
      systemHealth.service_history = historyResults.reduce((acc, { serviceName, history }) => {
        acc[serviceName] = history;
        return acc;
      }, {});
    }

    // Calculate system score
    const healthScore = calculateHealthScore(systemHealth.services);
    systemHealth.health_score = healthScore;

    // Add recommendations based on health
    systemHealth.recommendations = generateHealthRecommendations(systemHealth);

    logger.info('System health retrieved', {
      overall_status: systemHealth.overall_status,
      services_count: Object.keys(systemHealth.services).length,
      health_score: healthScore.overall
    });

    res.status(200).json(formatSuccessResponse(
      systemHealth,
      'System health status retrieved successfully'
    ));

  } catch (error) {
    logger.error('Failed to get system health', error);

    res.status(500).json(formatErrorResponse(
      'Failed to retrieve system health',
      500,
      'HEALTH_ERROR',
      { error: error.message }
    ));
  }
});

/**
 * GET /api/analyzer/health/services/:service_name
 * Get detailed health status for a specific service
 */
router.get('/services/:service_name', [
  param('service_name').isIn(['database', 'gomarble_mcp', 'meta_api', 'google_ads', 'shopify', 'server']).withMessage('Invalid service name'),
  query('hours').optional().isInt({ min: 1, max: 168 }).withMessage('Hours must be between 1 and 168 (1 week)')
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

    const { service_name } = req.params;
    const { hours = 24 } = req.query;

    logger.info('Service health details requested', { service_name, hours });

    // Get current system health
    const systemHealth = await monitoringService.getSystemHealth();
    const serviceHealth = systemHealth.services[service_name];

    if (!serviceHealth) {
      return res.status(404).json(formatErrorResponse(
        `Service ${service_name} not found`,
        404,
        'SERVICE_NOT_FOUND',
        { service_name }
      ));
    }

    // Get service history
    const history = await monitoringService.getServiceHealthHistory(service_name, parseInt(hours));

    // Calculate service statistics
    const stats = calculateServiceStatistics(history, parseInt(hours));

    const response = {
      service_name,
      current_status: serviceHealth,
      statistics: stats,
      history: history.slice(0, 50), // Limit to 50 recent entries
      uptime_stats: systemHealth.uptime_stats[service_name] || {},
      time_range: {
        hours: parseInt(hours),
        from: new Date(Date.now() - parseInt(hours) * 60 * 60 * 1000).toISOString(),
        to: new Date().toISOString()
      }
    };

    logger.info('Service health details retrieved', {
      service_name,
      status: serviceHealth.status,
      history_entries: history.length
    });

    res.status(200).json(formatSuccessResponse(
      response,
      `${service_name} health details retrieved successfully`
    ));

  } catch (error) {
    logger.error('Failed to get service health details', error, {
      service_name: req.params.service_name
    });

    res.status(500).json(formatErrorResponse(
      'Failed to retrieve service health details',
      500,
      'SERVICE_HEALTH_ERROR',
      { service_name: req.params.service_name, error: error.message }
    ));
  }
});

/**
 * GET /api/analyzer/health/alerts
 * Get recent health alerts and issues
 */
router.get('/alerts', [
  query('hours').optional().isInt({ min: 1, max: 168 }).withMessage('Hours must be between 1 and 168'),
  query('priority').optional().isIn(['urgent', 'high', 'medium', 'low']).withMessage('Invalid priority'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100')
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
      hours = 24,
      priority,
      limit = 50
    } = req.query;

    logger.info('Health alerts requested', { hours, priority, limit });

    // Get alerts from notification queue
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    let query = `
      SELECT notification_type, title, message, data, priority, created_at, read
      FROM notification_queue
      WHERE notification_type LIKE '%system%' OR notification_type LIKE '%health%'
      AND created_at >= NOW() - INTERVAL '${parseInt(hours)} hours'
    `;

    const params = [];

    if (priority) {
      query += ` AND priority = $${params.length + 1}`;
      params.push(priority);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
    params.push(parseInt(limit));

    const result = await pool.query(query, params);

    const alerts = result.rows.map(row => ({
      type: row.notification_type,
      title: row.title,
      message: row.message,
      data: row.data,
      priority: row.priority,
      created_at: row.created_at,
      read: row.read
    }));

    // Summarize alerts
    const summary = {
      total_alerts: alerts.length,
      unread_alerts: alerts.filter(a => !a.read).length,
      by_priority: alerts.reduce((acc, alert) => {
        acc[alert.priority] = (acc[alert.priority] || 0) + 1;
        return acc;
      }, {}),
      time_range: {
        hours: parseInt(hours),
        from: new Date(Date.now() - parseInt(hours) * 60 * 60 * 1000).toISOString(),
        to: new Date().toISOString()
      }
    };

    const response = {
      alerts,
      summary,
      filters: {
        priority,
        limit: parseInt(limit)
      }
    };

    logger.info('Health alerts retrieved', {
      count: alerts.length,
      unread: summary.unread_alerts,
      urgent: summary.by_priority.urgent || 0
    });

    res.status(200).json(formatSuccessResponse(
      response,
      `Retrieved ${alerts.length} health alerts`
    ));

  } catch (error) {
    logger.error('Failed to get health alerts', error);

    res.status(500).json(formatErrorResponse(
      'Failed to retrieve health alerts',
      500,
      'ALERTS_ERROR',
      { error: error.message }
    ));
  }
});

/**
 * POST /api/analyzer/health/check
 * Trigger manual health check
 */
router.post('/check', async (req, res) => {
  try {
    logger.info('Manual health check triggered');

    // Perform health check
    const healthResults = await monitoringService.performHealthCheck();

    const response = {
      check_completed_at: new Date().toISOString(),
      services_checked: healthResults.length,
      results: healthResults.map(result => ({
        service: result.service_name,
        status: result.status,
        response_time: result.response_time_ms,
        error: result.error_message
      }))
    };

    logger.info('Manual health check completed', {
      services_checked: healthResults.length,
      healthy_services: healthResults.filter(r => r.status === 'healthy').length
    });

    res.status(200).json(formatSuccessResponse(
      response,
      'Manual health check completed'
    ));

  } catch (error) {
    logger.error('Manual health check failed', error);

    res.status(500).json(formatErrorResponse(
      'Manual health check failed',
      500,
      'HEALTH_CHECK_ERROR',
      { error: error.message }
    ));
  }
});

/**
 * GET /api/analyzer/health/monitoring/status
 * Get monitoring service status
 */
router.get('/monitoring/status', async (req, res) => {
  try {
    const healthStatus = await monitoringService.getHealthStatus();

    res.status(200).json(formatSuccessResponse(
      healthStatus,
      'Monitoring service status retrieved'
    ));

  } catch (error) {
    logger.error('Failed to get monitoring status', error);

    res.status(500).json(formatErrorResponse(
      'Failed to get monitoring status',
      500,
      'MONITORING_STATUS_ERROR',
      { error: error.message }
    ));
  }
});

// Helper methods for health calculations

/**
 * Calculate health score for services
 * @private
 */
function calculateHealthScore(services) {
  const serviceNames = Object.keys(services);
  if (serviceNames.length === 0) {
    return { overall: 0, breakdown: {} };
  }

  const scores = serviceNames.map(name => {
    const service = services[name];
    let score = 100;

    switch (service.status) {
      case 'healthy':
        score = 100;
        break;
      case 'degraded':
        score = 70;
        break;
      case 'critical':
        score = 30;
        break;
      case 'down':
        score = 0;
        break;
      default:
        score = 50;
    }

    // Adjust score based on response time
    if (service.response_time_ms > 5000) {
      score -= 20; // Slow response
    } else if (service.response_time_ms > 2000) {
      score -= 10; // Moderate response
    }

    return { name, score: Math.max(0, score) };
  });

  const overall = Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length);

  return {
    overall,
    breakdown: scores.reduce((acc, s) => {
      acc[s.name] = s.score;
      return acc;
    }, {})
  };
}

/**
 * Calculate service statistics
 * @private
 */
function calculateServiceStatistics(history, hours) {
  if (history.length === 0) {
    return {
      uptime_percentage: 0,
      avg_response_time: 0,
      total_checks: 0,
      status_distribution: {}
    };
  }

  const totalChecks = history.length;
  const healthyChecks = history.filter(h => h.status === 'healthy').length;
  const uptimePercentage = (healthyChecks / totalChecks) * 100;

  const responseTimes = history.filter(h => h.response_time_ms).map(h => h.response_time_ms);
  const avgResponseTime = responseTimes.length > 0 ?
    responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length : 0;

  const statusDistribution = history.reduce((acc, h) => {
    acc[h.status] = (acc[h.status] || 0) + 1;
    return acc;
  }, {});

  return {
    uptime_percentage: parseFloat(uptimePercentage.toFixed(2)),
    avg_response_time: Math.round(avgResponseTime),
    total_checks: totalChecks,
    status_distribution: statusDistribution,
    time_range_hours: hours
  };
}

/**
 * Generate health recommendations
 * @private
 */
function generateHealthRecommendations(systemHealth) {
  const recommendations = [];

  // Check for critical services
  const criticalServices = Object.entries(systemHealth.services)
    .filter(([name, service]) => service.status === 'down' || service.status === 'critical');

  if (criticalServices.length > 0) {
    recommendations.push({
      priority: 'urgent',
      type: 'critical_services',
      title: 'Critical Services Need Attention',
      description: `${criticalServices.length} service(s) are down or critical: ${criticalServices.map(([name]) => name).join(', ')}`,
      action: 'Investigate and restore critical services immediately'
    });
  }

  // Check for degraded services
  const degradedServices = Object.entries(systemHealth.services)
    .filter(([name, service]) => service.status === 'degraded');

  if (degradedServices.length > 0) {
    recommendations.push({
      priority: 'high',
      type: 'degraded_services',
      title: 'Services Running Degraded',
      description: `${degradedServices.length} service(s) are degraded: ${degradedServices.map(([name]) => name).join(', ')}`,
      action: 'Monitor closely and investigate performance issues'
    });
  }

  // Check overall uptime
  const uptimes = Object.values(systemHealth.uptime_stats || {});
  const avgUptime = uptimes.length > 0 ?
    uptimes.reduce((sum, stat) => sum + stat.uptime_percentage, 0) / uptimes.length : 100;

  if (avgUptime < 95) {
    recommendations.push({
      priority: 'medium',
      type: 'low_uptime',
      title: 'Low System Uptime',
      description: `Average uptime is ${avgUptime.toFixed(1)}%, below 95% target`,
      action: 'Review system stability and implement redundancy'
    });
  }

  return recommendations;
}

// Attach helper methods to router for access
router.calculateHealthScore = calculateHealthScore;
router.calculateServiceStatistics = calculateServiceStatistics;
router.generateHealthRecommendations = generateHealthRecommendations;

module.exports = router;