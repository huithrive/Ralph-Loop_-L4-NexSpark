// Monitoring Service - Module 4 Analyzer
// System health monitoring and status tracking

const logger = require('../../utils/logger');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

class MonitoringService {
  constructor() {
    this.services = {
      database: { url: process.env.DATABASE_URL, timeout: 5000 },
      gomarble_mcp: { url: process.env.GOMARBLE_MCP_URL, timeout: 10000 },
      meta_api: { baseUrl: 'https://graph.facebook.com', timeout: 8000 },
      google_ads: { baseUrl: 'https://googleads.googleapis.com', timeout: 8000 },
      shopify: { baseUrl: 'https://shopify.dev', timeout: 6000 },
      server: { internal: true, timeout: 1000 }
    };
    this.healthCheckInterval = 5 * 60 * 1000; // 5 minutes
    this.statusCache = new Map();
  }

  /**
   * Start continuous health monitoring
   */
  startMonitoring() {
    logger.info('Starting system health monitoring');

    // Initial health check
    this.performHealthCheck();

    // Set up recurring health checks
    this.monitoringInterval = setInterval(() => {
      this.performHealthCheck();
    }, this.healthCheckInterval);

    logger.info('Health monitoring started', {
      interval: this.healthCheckInterval / 1000 / 60,
      services: Object.keys(this.services).length
    });
  }

  /**
   * Stop health monitoring
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      logger.info('Health monitoring stopped');
    }
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck() {
    try {
      logger.debug('Starting system health check');

      const healthResults = [];

      // Check each service
      for (const [serviceName, config] of Object.entries(this.services)) {
        const result = await this.checkServiceHealth(serviceName, config);
        healthResults.push(result);

        // Update cache
        this.statusCache.set(serviceName, {
          ...result,
          lastChecked: new Date()
        });
      }

      // Store results in database
      await this.storeHealthResults(healthResults);

      // Check for critical issues
      const criticalIssues = healthResults.filter(r => r.status === 'down' || r.status === 'critical');
      if (criticalIssues.length > 0) {
        await this.handleCriticalIssues(criticalIssues);
      }

      logger.debug('Health check completed', {
        totalServices: healthResults.length,
        healthyServices: healthResults.filter(r => r.status === 'healthy').length,
        criticalIssues: criticalIssues.length
      });

      return healthResults;

    } catch (error) {
      logger.error('Health check failed', error);
      return [];
    }
  }

  /**
   * Check health of a specific service
   * @private
   */
  async checkServiceHealth(serviceName, config) {
    const startTime = Date.now();

    try {
      let status = 'healthy';
      let responseTime = null;
      let metrics = {};
      let errorMessage = null;

      switch (serviceName) {
        case 'database':
          const dbResult = await this.checkDatabaseHealth(config);
          status = dbResult.status;
          responseTime = dbResult.responseTime;
          metrics = dbResult.metrics;
          errorMessage = dbResult.error;
          break;

        case 'server':
          const serverResult = await this.checkServerHealth();
          status = serverResult.status;
          responseTime = serverResult.responseTime;
          metrics = serverResult.metrics;
          break;

        case 'gomarble_mcp':
          const gomarbleResult = await this.checkAPIEndpoint(`${config.url}/health`, config.timeout);
          status = gomarbleResult.status;
          responseTime = gomarbleResult.responseTime;
          errorMessage = gomarbleResult.error;
          break;

        case 'meta_api':
          const metaResult = await this.checkAPIEndpoint(`${config.baseUrl}/v18.0/me`, config.timeout, {
            requiresAuth: true
          });
          status = metaResult.status;
          responseTime = metaResult.responseTime;
          errorMessage = metaResult.error;
          break;

        case 'google_ads':
          // Mock Google Ads health check
          status = Math.random() > 0.1 ? 'healthy' : 'degraded';
          responseTime = Math.floor(Math.random() * 2000) + 500;
          break;

        case 'shopify':
          const shopifyResult = await this.checkAPIEndpoint(`${config.baseUrl}/docs`, config.timeout);
          status = shopifyResult.status;
          responseTime = shopifyResult.responseTime;
          errorMessage = shopifyResult.error;
          break;

        default:
          status = 'unknown';
      }

      return {
        service_name: serviceName,
        status,
        response_time_ms: responseTime,
        error_message: errorMessage,
        metrics,
        checked_at: new Date()
      };

    } catch (error) {
      return {
        service_name: serviceName,
        status: 'down',
        response_time_ms: Date.now() - startTime,
        error_message: error.message,
        metrics: {},
        checked_at: new Date()
      };
    }
  }

  /**
   * Check database health
   * @private
   */
  async checkDatabaseHealth(config) {
    const startTime = Date.now();

    try {
      // Test connection and query
      const result = await pool.query('SELECT 1 as health, NOW() as timestamp');
      const responseTime = Date.now() - startTime;

      // Get connection pool stats
      const poolStats = {
        total_connections: pool.totalCount,
        idle_connections: pool.idleCount,
        waiting_requests: pool.waitingCount
      };

      return {
        status: 'healthy',
        responseTime,
        metrics: poolStats,
        error: null
      };

    } catch (error) {
      return {
        status: 'down',
        responseTime: Date.now() - startTime,
        metrics: {},
        error: error.message
      };
    }
  }

  /**
   * Check server health (internal)
   * @private
   */
  async checkServerHealth() {
    const startTime = Date.now();

    try {
      const memoryUsage = process.memoryUsage();
      const uptime = process.uptime();

      const metrics = {
        uptime_seconds: Math.floor(uptime),
        memory_usage_mb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        memory_total_mb: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        cpu_usage: process.cpuUsage(),
        node_version: process.version
      };

      // Determine status based on metrics
      let status = 'healthy';
      if (metrics.memory_usage_mb > 500) {
        status = 'degraded';
      }
      if (metrics.memory_usage_mb > 1000) {
        status = 'critical';
      }

      return {
        status,
        responseTime: Date.now() - startTime,
        metrics
      };

    } catch (error) {
      return {
        status: 'down',
        responseTime: Date.now() - startTime,
        metrics: {},
        error: error.message
      };
    }
  }

  /**
   * Check API endpoint health
   * @private
   */
  async checkAPIEndpoint(url, timeout, options = {}) {
    const startTime = Date.now();

    try {
      // Mock API health check - in production, use actual HTTP requests
      const mockLatency = Math.random() * 1000 + 200; // 200-1200ms
      await this.sleep(Math.min(mockLatency, timeout));

      const responseTime = Date.now() - startTime;
      const success = responseTime < timeout && Math.random() > 0.05; // 95% success rate

      return {
        status: success ? 'healthy' : 'degraded',
        responseTime,
        error: success ? null : 'Mock API timeout or error'
      };

    } catch (error) {
      return {
        status: 'down',
        responseTime: Date.now() - startTime,
        error: error.message
      };
    }
  }

  /**
   * Store health check results in database
   * @private
   */
  async storeHealthResults(results) {
    try {
      const query = `
        INSERT INTO system_health_logs (service_name, status, response_time_ms, error_message, metrics)
        VALUES ($1, $2, $3, $4, $5)
      `;

      for (const result of results) {
        await pool.query(query, [
          result.service_name,
          result.status,
          result.response_time_ms,
          result.error_message,
          JSON.stringify(result.metrics || {})
        ]);
      }

      logger.debug('Health results stored', { resultsCount: results.length });

    } catch (error) {
      logger.error('Failed to store health results', error);
      // Don't throw - storage failure shouldn't break monitoring
    }
  }

  /**
   * Handle critical service issues
   * @private
   */
  async handleCriticalIssues(criticalIssues) {
    try {
      logger.warn('Critical system issues detected', {
        issuesCount: criticalIssues.length,
        services: criticalIssues.map(i => i.service_name)
      });

      for (const issue of criticalIssues) {
        // Create notification for critical issues
        await this.createSystemAlert({
          type: 'system_critical',
          service: issue.service_name,
          status: issue.status,
          error: issue.error_message,
          responseTime: issue.response_time_ms
        });
      }

    } catch (error) {
      logger.error('Failed to handle critical issues', error);
    }
  }

  /**
   * Create system alert notification
   * @private
   */
  async createSystemAlert(alertData) {
    try {
      // Store in notification queue for admin users
      const query = `
        INSERT INTO notification_queue (user_id, notification_type, title, message, data, priority)
        VALUES ($1, $2, $3, $4, $5, $6)
      `;

      const title = `System Alert: ${alertData.service} ${alertData.status}`;
      const message = `Service ${alertData.service} is ${alertData.status}. ${alertData.error || 'No additional details'}`;

      // Use a system admin user ID - in production, get from config
      const adminUserId = '00000000-0000-0000-0000-000000000000';

      await pool.query(query, [
        adminUserId,
        'system_alert',
        title,
        message,
        JSON.stringify(alertData),
        'urgent'
      ]);

      logger.debug('System alert created', { service: alertData.service });

    } catch (error) {
      logger.error('Failed to create system alert', error);
    }
  }

  /**
   * Get current system health status
   */
  async getSystemHealth() {
    try {
      // Get latest health check for each service
      const query = `
        WITH latest_checks AS (
          SELECT DISTINCT ON (service_name)
            service_name, status, response_time_ms, error_message, metrics, checked_at
          FROM system_health_logs
          ORDER BY service_name, checked_at DESC
        )
        SELECT * FROM latest_checks
        ORDER BY service_name
      `;

      const result = await pool.query(query);

      const services = result.rows.reduce((acc, row) => {
        acc[row.service_name] = {
          status: row.status,
          response_time_ms: row.response_time_ms,
          error_message: row.error_message,
          metrics: row.metrics,
          last_checked: row.checked_at
        };
        return acc;
      }, {});

      // Calculate overall system status
      const statuses = Object.values(services).map(s => s.status);
      let overallStatus = 'healthy';

      if (statuses.includes('down')) {
        overallStatus = 'critical';
      } else if (statuses.includes('critical')) {
        overallStatus = 'critical';
      } else if (statuses.includes('degraded')) {
        overallStatus = 'degraded';
      }

      // Calculate uptime percentage (last 24 hours)
      const uptimeStats = await this.calculateUptimeStats();

      return {
        overall_status: overallStatus,
        services,
        uptime_stats: uptimeStats,
        last_health_check: new Date().toISOString(),
        monitored_services: Object.keys(this.services).length
      };

    } catch (error) {
      logger.error('Failed to get system health', error);
      return {
        overall_status: 'error',
        services: {},
        error: error.message
      };
    }
  }

  /**
   * Calculate uptime statistics
   * @private
   */
  async calculateUptimeStats() {
    try {
      const query = `
        SELECT
          service_name,
          COUNT(*) as total_checks,
          COUNT(CASE WHEN status = 'healthy' THEN 1 END) as healthy_checks,
          AVG(response_time_ms) as avg_response_time
        FROM system_health_logs
        WHERE checked_at >= NOW() - INTERVAL '24 hours'
        GROUP BY service_name
      `;

      const result = await pool.query(query);

      return result.rows.reduce((acc, row) => {
        const uptime = row.total_checks > 0 ? (row.healthy_checks / row.total_checks * 100) : 0;
        acc[row.service_name] = {
          uptime_percentage: parseFloat(uptime.toFixed(2)),
          total_checks: parseInt(row.total_checks),
          avg_response_time_ms: parseFloat(row.avg_response_time || 0)
        };
        return acc;
      }, {});

    } catch (error) {
      logger.error('Failed to calculate uptime stats', error);
      return {};
    }
  }

  /**
   * Get health history for a service
   */
  async getServiceHealthHistory(serviceName, hours = 24) {
    try {
      const query = `
        SELECT status, response_time_ms, error_message, checked_at
        FROM system_health_logs
        WHERE service_name = $1
        AND checked_at >= NOW() - INTERVAL '${hours} hours'
        ORDER BY checked_at DESC
        LIMIT 100
      `;

      const result = await pool.query(query, [serviceName]);

      return result.rows.map(row => ({
        status: row.status,
        response_time_ms: row.response_time_ms,
        error_message: row.error_message,
        timestamp: row.checked_at
      }));

    } catch (error) {
      logger.error('Failed to get service health history', error, { serviceName });
      return [];
    }
  }

  /**
   * Get service health status
   */
  async getHealthStatus() {
    try {
      const systemHealth = await this.getSystemHealth();

      return {
        service: 'MonitoringService',
        status: 'operational',
        monitoring_interval_minutes: this.healthCheckInterval / 1000 / 60,
        monitored_services: Object.keys(this.services),
        system_health: systemHealth,
        capabilities: [
          'Continuous health monitoring',
          'Service status tracking',
          'Performance metrics collection',
          'Alert generation',
          'Uptime statistics'
        ]
      };

    } catch (error) {
      logger.error('Failed to get monitoring health status', error);
      return {
        service: 'MonitoringService',
        status: 'error',
        error: error.message
      };
    }
  }

  /**
   * Utility: Sleep for specified milliseconds
   * @private
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = MonitoringService;