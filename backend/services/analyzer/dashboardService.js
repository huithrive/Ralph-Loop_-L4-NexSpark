// Dashboard Service - Module 4 Analyzer
// Real-time dashboard data aggregation and WebSocket updates

const AnalyticsService = require('./analyticsService');
const MonitoringService = require('./monitoringService');
const logger = require('../../utils/logger');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

class DashboardService {
  constructor() {
    this.analyticsService = new AnalyticsService();
    this.monitoringService = new MonitoringService();
    this.updateInterval = 5 * 60 * 1000; // 5 minutes
    this.dashboardCache = new Map();
    this.websocketClients = new Map(); // Store WebSocket connections by user ID
  }

  /**
   * Start real-time dashboard updates
   */
  startRealTimeUpdates() {
    logger.info('Starting real-time dashboard updates');

    // Initial dashboard data refresh
    this.refreshAllDashboards();

    // Set up recurring updates
    this.updateInterval = setInterval(() => {
      this.refreshAllDashboards();
    }, this.updateInterval);

    logger.info('Real-time dashboard updates started', {
      interval: this.updateInterval / 1000 / 60
    });
  }

  /**
   * Stop real-time updates
   */
  stopRealTimeUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      logger.info('Real-time dashboard updates stopped');
    }
  }

  /**
   * Get complete dashboard data for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Dashboard data
   */
  async getDashboardData(userId) {
    try {
      logger.info('Getting dashboard data', { userId });

      // Check cache first
      const cacheKey = `dashboard_${userId}`;
      const cached = this.dashboardCache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < 2 * 60 * 1000) { // 2 minute cache
        logger.debug('Returning cached dashboard data', { userId });
        return cached.data;
      }

      // Get user's dashboard configuration
      const config = await this.getUserDashboardConfig(userId);

      // Aggregate all dashboard components
      const [
        campaignPerformance,
        websiteAnalytics,
        revenueTracking,
        goalProgress,
        systemHealth,
        recentNotifications
      ] = await Promise.all([
        this.getCampaignPerformanceData(userId),
        this.getWebsiteAnalyticsData(userId),
        this.getRevenueTrackingData(userId),
        this.getGoalProgressData(userId, config.goal_revenue),
        this.getSystemHealthSummary(),
        this.getRecentNotifications(userId)
      ]);

      const dashboardData = {
        user_id: userId,
        dashboard_config: config,
        campaign_performance: campaignPerformance,
        website_analytics: websiteAnalytics,
        revenue_tracking: revenueTracking,
        goal_progress: goalProgress,
        system_health: systemHealth,
        notifications: recentNotifications,
        last_updated: new Date().toISOString(),
        next_update: new Date(Date.now() + this.updateInterval).toISOString()
      };

      // Cache the result
      this.dashboardCache.set(cacheKey, {
        data: dashboardData,
        timestamp: Date.now()
      });

      logger.info('Dashboard data generated', {
        userId,
        campaignsCount: campaignPerformance.campaigns?.length || 0,
        notificationsCount: recentNotifications.length
      });

      return dashboardData;

    } catch (error) {
      logger.error('Failed to get dashboard data', error, { userId });
      throw error;
    }
  }

  /**
   * Get user's dashboard configuration
   * @private
   */
  async getUserDashboardConfig(userId) {
    try {
      const query = `
        SELECT config, goal_revenue, goal_deadline, notification_preferences, updated_at
        FROM dashboard_configs
        WHERE user_id = $1
      `;

      const result = await pool.query(query, [userId]);

      if (result.rows.length === 0) {
        // Create default config
        return await this.createDefaultDashboardConfig(userId);
      }

      return result.rows[0];

    } catch (error) {
      logger.error('Failed to get dashboard config', error);
      return await this.createDefaultDashboardConfig(userId);
    }
  }

  /**
   * Create default dashboard configuration
   * @private
   */
  async createDefaultDashboardConfig(userId) {
    const defaultConfig = {
      layout: 'grid',
      widgets: ['campaign_performance', 'revenue_tracking', 'goal_progress', 'notifications'],
      theme: 'light',
      auto_refresh: true,
      refresh_interval: 5
    };

    const query = `
      INSERT INTO dashboard_configs (user_id, config, goal_revenue, goal_deadline)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id) DO UPDATE SET
        config = EXCLUDED.config,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const goalDeadline = new Date();
    goalDeadline.setMonth(goalDeadline.getMonth() + 3); // 3 months from now

    const result = await pool.query(query, [
      userId,
      JSON.stringify(defaultConfig),
      10000.00, // $10K default goal
      goalDeadline
    ]);

    return result.rows[0];
  }

  /**
   * Get campaign performance data
   * @private
   */
  async getCampaignPerformanceData(userId) {
    try {
      // Get user's campaigns
      const campaignsQuery = `
        SELECT id, campaign_name, platform, status, budget_daily, created_at
        FROM campaigns
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 10
      `;

      const campaignsResult = await pool.query(campaignsQuery, [userId]);
      const campaigns = campaignsResult.rows;

      if (campaigns.length === 0) {
        return {
          campaigns: [],
          summary: {
            total_campaigns: 0,
            active_campaigns: 0,
            total_spend: 0,
            total_revenue: 0,
            average_roas: 0
          }
        };
      }

      // Get performance data for each campaign
      const campaignPerformance = [];
      let totalSpend = 0;
      let totalRevenue = 0;

      for (const campaign of campaigns) {
        try {
          const performance = await this.analyticsService.getPerformanceData(campaign.id, {
            startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
            endDate: new Date()
          });

          campaignPerformance.push({
            campaign_id: campaign.id,
            campaign_name: campaign.campaign_name,
            platform: campaign.platform,
            status: campaign.status,
            metrics: performance.metrics,
            insights: performance.insights || []
          });

          totalSpend += performance.metrics.spend || 0;
          totalRevenue += performance.metrics.revenue || 0;

        } catch (error) {
          logger.warn('Failed to get campaign performance', error, { campaignId: campaign.id });

          // Add campaign with no data
          campaignPerformance.push({
            campaign_id: campaign.id,
            campaign_name: campaign.campaign_name,
            platform: campaign.platform,
            status: campaign.status,
            metrics: {},
            error: 'Performance data unavailable'
          });
        }
      }

      return {
        campaigns: campaignPerformance,
        summary: {
          total_campaigns: campaigns.length,
          active_campaigns: campaigns.filter(c => c.status === 'active').length,
          total_spend: parseFloat(totalSpend.toFixed(2)),
          total_revenue: parseFloat(totalRevenue.toFixed(2)),
          average_roas: totalSpend > 0 ? parseFloat((totalRevenue / totalSpend).toFixed(2)) : 0
        }
      };

    } catch (error) {
      logger.error('Failed to get campaign performance data', error);
      return {
        campaigns: [],
        summary: {
          total_campaigns: 0,
          active_campaigns: 0,
          total_spend: 0,
          total_revenue: 0,
          average_roas: 0
        },
        error: error.message
      };
    }
  }

  /**
   * Get website analytics data
   * @private
   */
  async getWebsiteAnalyticsData(userId) {
    try {
      // Mock website analytics - in production, integrate with Meta Pixel, Google Analytics
      const mockData = {
        page_views: Math.floor(Math.random() * 10000) + 1000,
        unique_visitors: Math.floor(Math.random() * 3000) + 500,
        bounce_rate: parseFloat((Math.random() * 30 + 20).toFixed(1)), // 20-50%
        avg_session_duration: Math.floor(Math.random() * 180) + 60, // 1-4 minutes
        conversion_rate: parseFloat((Math.random() * 5 + 1).toFixed(2)), // 1-6%
        top_pages: [
          { page: '/', views: Math.floor(Math.random() * 2000) + 500 },
          { page: '/products', views: Math.floor(Math.random() * 1500) + 300 },
          { page: '/about', views: Math.floor(Math.random() * 800) + 100 }
        ],
        traffic_sources: {
          direct: Math.floor(Math.random() * 30) + 20,
          organic: Math.floor(Math.random() * 25) + 15,
          social: Math.floor(Math.random() * 20) + 10,
          paid: Math.floor(Math.random() * 25) + 15,
          referral: Math.floor(Math.random() * 10) + 5
        },
        date_range: '7 days'
      };

      return mockData;

    } catch (error) {
      logger.error('Failed to get website analytics data', error);
      return {
        error: error.message,
        date_range: '7 days'
      };
    }
  }

  /**
   * Get revenue tracking data
   * @private
   */
  async getRevenueTrackingData(userId) {
    try {
      // Mock revenue data - in production, integrate with Shopify, Stripe
      const dailyRevenue = [];
      let totalRevenue = 0;

      // Generate last 30 days of revenue data
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        const revenue = Math.random() * 500 + 100; // $100-600 per day
        totalRevenue += revenue;

        dailyRevenue.push({
          date: date.toISOString().split('T')[0],
          revenue: parseFloat(revenue.toFixed(2))
        });
      }

      const previousMonthRevenue = totalRevenue * (0.8 + Math.random() * 0.4); // ±20% variation
      const growth = ((totalRevenue - previousMonthRevenue) / previousMonthRevenue * 100);

      return {
        current_month: parseFloat(totalRevenue.toFixed(2)),
        previous_month: parseFloat(previousMonthRevenue.toFixed(2)),
        growth_percentage: parseFloat(growth.toFixed(1)),
        daily_revenue: dailyRevenue,
        average_daily: parseFloat((totalRevenue / 30).toFixed(2)),
        date_range: '30 days'
      };

    } catch (error) {
      logger.error('Failed to get revenue tracking data', error);
      return {
        current_month: 0,
        previous_month: 0,
        growth_percentage: 0,
        daily_revenue: [],
        average_daily: 0,
        error: error.message
      };
    }
  }

  /**
   * Get goal progress data
   * @private
   */
  async getGoalProgressData(userId, goalRevenue = 10000) {
    try {
      // Get revenue data
      const revenueData = await this.getRevenueTrackingData(userId);
      const currentRevenue = revenueData.current_month || 0;

      const progressPercentage = (currentRevenue / goalRevenue) * 100;
      const remainingRevenue = Math.max(goalRevenue - currentRevenue, 0);

      // Calculate projected completion date based on current growth
      const dailyAverage = revenueData.average_daily || 0;
      const daysToGoal = dailyAverage > 0 ? Math.ceil(remainingRevenue / dailyAverage) : null;

      let projectedDate = null;
      if (daysToGoal) {
        projectedDate = new Date();
        projectedDate.setDate(projectedDate.getDate() + daysToGoal);
      }

      return {
        goal_amount: goalRevenue,
        current_amount: currentRevenue,
        remaining_amount: remainingRevenue,
        progress_percentage: Math.min(progressPercentage, 100),
        on_track: progressPercentage >= 25, // 25% progress indicator
        projected_completion: projectedDate?.toISOString().split('T')[0] || null,
        days_remaining: daysToGoal,
        daily_average_needed: remainingRevenue > 0 ? parseFloat((remainingRevenue / 30).toFixed(2)) : 0
      };

    } catch (error) {
      logger.error('Failed to get goal progress data', error);
      return {
        goal_amount: goalRevenue,
        current_amount: 0,
        remaining_amount: goalRevenue,
        progress_percentage: 0,
        on_track: false,
        error: error.message
      };
    }
  }

  /**
   * Get system health summary
   * @private
   */
  async getSystemHealthSummary() {
    try {
      const health = await this.monitoringService.getSystemHealth();

      return {
        overall_status: health.overall_status,
        service_count: Object.keys(health.services || {}).length,
        healthy_services: Object.values(health.services || {}).filter(s => s.status === 'healthy').length,
        critical_issues: Object.values(health.services || {}).filter(s => s.status === 'down' || s.status === 'critical').length,
        last_check: health.last_health_check,
        uptime_percentage: this.calculateAverageUptime(health.uptime_stats || {})
      };

    } catch (error) {
      logger.error('Failed to get system health summary', error);
      return {
        overall_status: 'unknown',
        service_count: 0,
        healthy_services: 0,
        critical_issues: 0,
        error: error.message
      };
    }
  }

  /**
   * Calculate average uptime across services
   * @private
   */
  calculateAverageUptime(uptimeStats) {
    const uptimes = Object.values(uptimeStats).map(s => s.uptime_percentage || 0);
    return uptimes.length > 0 ? parseFloat((uptimes.reduce((a, b) => a + b, 0) / uptimes.length).toFixed(2)) : 0;
  }

  /**
   * Get recent notifications for user
   * @private
   */
  async getRecentNotifications(userId, limit = 10) {
    try {
      const query = `
        SELECT notification_type, title, message, data, priority, created_at, read
        FROM notification_queue
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2
      `;

      const result = await pool.query(query, [userId, limit]);

      return result.rows.map(row => ({
        type: row.notification_type,
        title: row.title,
        message: row.message,
        data: row.data,
        priority: row.priority,
        created_at: row.created_at,
        read: row.read
      }));

    } catch (error) {
      logger.error('Failed to get recent notifications', error);
      return [];
    }
  }

  /**
   * Refresh dashboard data for all active users
   * @private
   */
  async refreshAllDashboards() {
    try {
      // Get list of active users (those with dashboard configs)
      const usersQuery = `
        SELECT DISTINCT user_id
        FROM dashboard_configs
        WHERE updated_at >= NOW() - INTERVAL '7 days'
      `;

      const usersResult = await pool.query(usersQuery);
      const userIds = usersResult.rows.map(row => row.user_id);

      logger.debug('Refreshing dashboards for users', { userCount: userIds.length });

      // Refresh dashboard data for each user
      for (const userId of userIds) {
        try {
          // Invalidate cache to force refresh
          this.dashboardCache.delete(`dashboard_${userId}`);

          // Generate fresh dashboard data
          const dashboardData = await this.getDashboardData(userId);

          // Send WebSocket update if client is connected
          this.sendWebSocketUpdate(userId, dashboardData);

        } catch (error) {
          logger.warn('Failed to refresh dashboard for user', error, { userId });
        }
      }

    } catch (error) {
      logger.error('Failed to refresh all dashboards', error);
    }
  }

  /**
   * Register WebSocket client
   */
  registerWebSocketClient(userId, ws) {
    this.websocketClients.set(userId, ws);
    logger.debug('WebSocket client registered', { userId });

    // Send initial dashboard data
    this.getDashboardData(userId).then(data => {
      this.sendWebSocketUpdate(userId, data);
    }).catch(error => {
      logger.error('Failed to send initial WebSocket data', error, { userId });
    });
  }

  /**
   * Unregister WebSocket client
   */
  unregisterWebSocketClient(userId) {
    this.websocketClients.delete(userId);
    logger.debug('WebSocket client unregistered', { userId });
  }

  /**
   * Send WebSocket update to user
   * @private
   */
  sendWebSocketUpdate(userId, data) {
    const ws = this.websocketClients.get(userId);
    if (ws && ws.readyState === 1) { // WebSocket.OPEN
      try {
        ws.send(JSON.stringify({
          type: 'dashboard_update',
          data: data,
          timestamp: new Date().toISOString()
        }));

        logger.debug('WebSocket update sent', { userId });

      } catch (error) {
        logger.error('Failed to send WebSocket update', error, { userId });
        // Remove dead connection
        this.unregisterWebSocketClient(userId);
      }
    }
  }

  /**
   * Get service health status
   */
  async getHealthStatus() {
    try {
      return {
        service: 'DashboardService',
        status: 'operational',
        update_interval_minutes: this.updateInterval / 1000 / 60,
        cached_dashboards: this.dashboardCache.size,
        websocket_connections: this.websocketClients.size,
        capabilities: [
          'Real-time dashboard data',
          'Campaign performance aggregation',
          'Revenue tracking',
          'Goal progress monitoring',
          'WebSocket updates',
          'Notification management'
        ]
      };

    } catch (error) {
      logger.error('Failed to get dashboard health status', error);
      return {
        service: 'DashboardService',
        status: 'error',
        error: error.message
      };
    }
  }
}

module.exports = DashboardService;