// Analytics Service - Module 4 Analyzer
// Orchestrates performance data fetching from multiple sources

const GoMarbleMcpService = require('../gomarbleMcpService');
const logger = require('../../utils/logger');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

class AnalyticsService {
  constructor() {
    this.gomarbleService = new GoMarbleMcpService();
    this.healthChecks = new Map(); // Cache health check results
  }

  /**
   * Get performance data for a campaign
   * @param {string} campaignId - Campaign ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Performance metrics
   */
  async getPerformanceData(campaignId, options = {}) {
    try {
      const {
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        endDate = new Date(),
        platform = 'both', // 'meta', 'google', 'both'
        dataSource = 'auto' // 'auto', 'gomarble_mcp', 'direct_api', 'mock'
      } = options;

      logger.info('Fetching performance data', {
        campaignId,
        platform,
        dataSource,
        dateRange: { startDate, endDate }
      });

      // Get campaign details
      const campaign = await this.getCampaignDetails(campaignId);
      if (!campaign) {
        throw new Error(`Campaign ${campaignId} not found`);
      }

      // Choose data source strategy
      const actualDataSource = await this.selectDataSource(dataSource, platform);

      let performanceData;

      switch (actualDataSource) {
        case 'gomarble_mcp':
          performanceData = await this.fetchViaGoMarbleMCP(campaign, startDate, endDate);
          break;
        case 'direct_api':
          performanceData = await this.fetchViaDirectAPIs(campaign, startDate, endDate);
          break;
        case 'mock':
        default:
          performanceData = await this.generateMockData(campaign, startDate, endDate);
          break;
      }

      // Calculate additional metrics
      const enrichedData = this.calculateAdditionalMetrics(performanceData);

      // Store snapshot in database
      await this.storePerformanceSnapshot(campaignId, campaign.user_id, enrichedData, actualDataSource, startDate, endDate);

      logger.info('Performance data retrieved successfully', {
        campaignId,
        platform: campaign.platform,
        dataSource: actualDataSource,
        metricsCount: Object.keys(enrichedData.metrics).length
      });

      return {
        campaign_id: campaignId,
        campaign_name: campaign.campaign_name,
        platform: campaign.platform,
        date_range: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        },
        data_source: actualDataSource,
        metrics: enrichedData.metrics,
        insights: enrichedData.insights,
        last_updated: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Failed to get performance data', error, { campaignId });
      throw error;
    }
  }

  /**
   * Select the best available data source
   * @private
   */
  async selectDataSource(requestedSource, platform) {
    if (requestedSource !== 'auto') {
      return requestedSource;
    }

    try {
      // Check GoMarble MCP health
      const gomarbleHealthy = await this.checkGoMarbleHealth();
      if (gomarbleHealthy) {
        return 'gomarble_mcp';
      }

      // Check direct API health
      const directApiHealthy = await this.checkDirectAPIHealth(platform);
      if (directApiHealthy) {
        return 'direct_api';
      }

      // Fallback to mock data
      logger.warn('All data sources unavailable, using mock data');
      return 'mock';

    } catch (error) {
      logger.error('Error selecting data source', error);
      return 'mock';
    }
  }

  /**
   * Fetch performance data via GoMarble MCP (Primary)
   * @private
   */
  async fetchViaGoMarbleMCP(campaign, startDate, endDate) {
    try {
      logger.info('Fetching via GoMarble MCP', { campaign_id: campaign.id });

      // Mock access token - in production, get from OAuth
      const accessToken = 'mock_gomarble_access_token';

      let metaData = {};
      let googleData = {};

      if (campaign.platform === 'meta' || campaign.platform === 'both') {
        if (campaign.meta_campaign_id) {
          metaData = await this.gomarbleService.getMetaPerformance(
            accessToken,
            campaign.meta_campaign_id,
            startDate,
            endDate
          );
        }
      }

      if (campaign.platform === 'google' || campaign.platform === 'both') {
        if (campaign.google_campaign_id) {
          googleData = await this.gomarbleService.getGooglePerformance(
            accessToken,
            campaign.google_campaign_id,
            startDate,
            endDate
          );
        }
      }

      // Combine and normalize data
      return this.combinePerformanceData(metaData, googleData, campaign.platform);

    } catch (error) {
      logger.error('GoMarble MCP fetch failed', error);
      throw new Error(`GoMarble MCP unavailable: ${error.message}`);
    }
  }

  /**
   * Fetch performance data via Direct APIs (Fallback)
   * @private
   */
  async fetchViaDirectAPIs(campaign, startDate, endDate) {
    try {
      logger.info('Fetching via direct APIs', { campaign_id: campaign.id });

      // For now, use mock data - in production, implement direct API calls
      return this.generateMockData(campaign, startDate, endDate);

    } catch (error) {
      logger.error('Direct API fetch failed', error);
      throw new Error(`Direct APIs unavailable: ${error.message}`);
    }
  }

  /**
   * Generate mock performance data
   * @private
   */
  async generateMockData(campaign, startDate, endDate) {
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const baseMultiplier = Math.max(daysDiff, 1);

    // Generate realistic mock data
    const impressions = Math.floor(Math.random() * 50000 * baseMultiplier) + 1000;
    const clicks = Math.floor(impressions * (Math.random() * 0.05 + 0.01)); // 1-6% CTR
    const conversions = Math.floor(clicks * (Math.random() * 0.08 + 0.02)); // 2-10% CVR
    const spend = parseFloat((Math.random() * 1000 * baseMultiplier + 50).toFixed(2));
    const revenue = conversions * (Math.random() * 100 + 50); // $50-150 per conversion

    return {
      metrics: {
        impressions,
        reach: Math.floor(impressions * (Math.random() * 0.3 + 0.6)), // 60-90% of impressions
        frequency: parseFloat((impressions / (impressions * 0.75)).toFixed(2)),
        clicks,
        ctr: parseFloat(((clicks / impressions) * 100).toFixed(2)),
        cpc: parseFloat((spend / clicks).toFixed(2)),
        conversions,
        conversion_rate: parseFloat(((conversions / clicks) * 100).toFixed(2)),
        cpa: parseFloat((spend / Math.max(conversions, 1)).toFixed(2)),
        spend,
        revenue: parseFloat(revenue.toFixed(2)),
        roas: parseFloat((revenue / spend).toFixed(2)),
        date_range_days: daysDiff
      }
    };
  }

  /**
   * Combine performance data from multiple sources
   * @private
   */
  combinePerformanceData(metaData, googleData, platform) {
    const combined = {
      impressions: 0,
      reach: 0,
      clicks: 0,
      conversions: 0,
      spend: 0,
      revenue: 0
    };

    // Add Meta data
    if (metaData.metrics) {
      Object.keys(combined).forEach(key => {
        combined[key] += metaData.metrics[key] || 0;
      });
    }

    // Add Google data
    if (googleData.metrics) {
      Object.keys(combined).forEach(key => {
        combined[key] += googleData.metrics[key] || 0;
      });
    }

    return { metrics: combined };
  }

  /**
   * Calculate additional performance metrics
   * @private
   */
  calculateAdditionalMetrics(data) {
    const metrics = data.metrics;

    // Calculate derived metrics
    if (metrics.impressions > 0) {
      metrics.ctr = parseFloat(((metrics.clicks / metrics.impressions) * 100).toFixed(2));
      metrics.frequency = parseFloat((metrics.impressions / Math.max(metrics.reach, 1)).toFixed(2));
    }

    if (metrics.clicks > 0) {
      metrics.cpc = parseFloat((metrics.spend / metrics.clicks).toFixed(2));
      metrics.conversion_rate = parseFloat(((metrics.conversions / metrics.clicks) * 100).toFixed(2));
    }

    if (metrics.conversions > 0) {
      metrics.cpa = parseFloat((metrics.spend / metrics.conversions).toFixed(2));
    }

    if (metrics.spend > 0) {
      metrics.roas = parseFloat((metrics.revenue / metrics.spend).toFixed(2));
    }

    // Generate insights
    const insights = this.generateInsights(metrics);

    return { metrics, insights };
  }

  /**
   * Generate performance insights
   * @private
   */
  generateInsights(metrics) {
    const insights = [];

    if (metrics.ctr < 1) {
      insights.push({
        type: 'warning',
        metric: 'ctr',
        message: `Low click-through rate (${metrics.ctr}%). Consider testing new ad creatives.`,
        recommendation: 'Create new video or image creatives with stronger hooks'
      });
    } else if (metrics.ctr > 3) {
      insights.push({
        type: 'positive',
        metric: 'ctr',
        message: `Excellent click-through rate (${metrics.ctr}%). Your ads are resonating well.`,
        recommendation: 'Scale this creative to more audiences'
      });
    }

    if (metrics.cpa > 50) {
      insights.push({
        type: 'warning',
        metric: 'cpa',
        message: `High cost per acquisition ($${metrics.cpa}). Optimization needed.`,
        recommendation: 'Adjust targeting or bidding strategy'
      });
    }

    if (metrics.roas < 2) {
      insights.push({
        type: 'critical',
        metric: 'roas',
        message: `Low return on ad spend (${metrics.roas}x). Campaign may be unprofitable.`,
        recommendation: 'Consider pausing or significantly optimizing this campaign'
      });
    } else if (metrics.roas > 4) {
      insights.push({
        type: 'positive',
        metric: 'roas',
        message: `Strong return on ad spend (${metrics.roas}x). Consider increasing budget.`,
        recommendation: 'Increase daily budget to scale profitable performance'
      });
    }

    return insights;
  }

  /**
   * Store performance snapshot in database
   * @private
   */
  async storePerformanceSnapshot(campaignId, userId, data, dataSource, startDate, endDate) {
    try {
      const query = `
        INSERT INTO performance_snapshots (campaign_id, user_id, platform, date_range_start, date_range_end, metrics, data_source)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `;

      const result = await pool.query(query, [
        campaignId,
        userId,
        'both', // Platform from campaign
        startDate,
        endDate,
        JSON.stringify(data.metrics),
        dataSource
      ]);

      logger.debug('Performance snapshot stored', {
        snapshotId: result.rows[0].id,
        campaignId,
        dataSource
      });

    } catch (error) {
      logger.error('Failed to store performance snapshot', error);
      // Don't throw - snapshot storage failure shouldn't break the API
    }
  }

  /**
   * Get campaign details from database
   * @private
   */
  async getCampaignDetails(campaignId) {
    try {
      const query = 'SELECT * FROM campaigns WHERE id = $1';
      const result = await pool.query(query, [campaignId]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Failed to get campaign details', error);
      return null;
    }
  }

  /**
   * Check GoMarble MCP service health
   * @private
   */
  async checkGoMarbleHealth() {
    try {
      // Cache health check for 5 minutes
      const cacheKey = 'gomarble_health';
      const cached = this.healthChecks.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
        return cached.healthy;
      }

      const healthy = await this.gomarbleService.checkHealth();

      this.healthChecks.set(cacheKey, {
        healthy,
        timestamp: Date.now()
      });

      return healthy;

    } catch (error) {
      logger.error('GoMarble health check failed', error);
      return false;
    }
  }

  /**
   * Check direct API health
   * @private
   */
  async checkDirectAPIHealth(platform) {
    // Mock implementation - in production, ping actual APIs
    return Math.random() > 0.3; // 70% chance of being healthy
  }

  /**
   * Get performance history for a campaign
   */
  async getPerformanceHistory(campaignId, days = 30) {
    try {
      const query = `
        SELECT timestamp, metrics, data_source
        FROM performance_snapshots
        WHERE campaign_id = $1
        AND timestamp >= $2
        ORDER BY timestamp DESC
        LIMIT 100
      `;

      const result = await pool.query(query, [
        campaignId,
        new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      ]);

      return result.rows.map(row => ({
        timestamp: row.timestamp,
        metrics: row.metrics,
        data_source: row.data_source
      }));

    } catch (error) {
      logger.error('Failed to get performance history', error);
      return [];
    }
  }

  /**
   * Get service health status
   */
  /**
   * Get a flat metrics snapshot for a client — used by OpenClaw heartbeatLoop
   * @param {string} clientId - Client identifier
   * @returns {Promise<Object>} Flat metrics object for rule evaluation
   */
  async getClientMetricsSnapshot(clientId) {
    try {
      // Get all active campaigns for this client
      const campaignResult = await pool.query(
        'SELECT id, platform, status FROM campaigns WHERE client_id = $1 AND status = $2',
        [clientId, 'active']
      );

      const campaigns = campaignResult.rows;
      if (!campaigns.length) {
        return { clientId, hasCampaigns: false, timestamp: new Date().toISOString() };
      }

      // Aggregate metrics across all campaigns (last 24h)
      let totalSpend = 0, totalRevenue = 0, totalPurchases = 0;
      let totalImpressions = 0, totalClicks = 0;
      let dailyBudget = 0;
      const campaignMetrics = [];

      for (const campaign of campaigns) {
        const metrics = await this.getPerformanceData(campaign.id, {
          startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
          endDate: new Date()
        });

        const m = metrics.aggregated || metrics;
        totalSpend += m.spend || 0;
        totalRevenue += m.revenue || 0;
        totalPurchases += m.purchases || 0;
        totalImpressions += m.impressions || 0;
        totalClicks += m.clicks || 0;
        dailyBudget += m.dailyBudget || 0;

        campaignMetrics.push({
          campaignId: campaign.id,
          platform: campaign.platform,
          spend: m.spend || 0,
          revenue: m.revenue || 0,
          roas: m.spend > 0 ? (m.revenue / m.spend) : 0,
          cpa: m.purchases > 0 ? (m.spend / m.purchases) : Infinity,
          ctr: m.impressions > 0 ? ((m.clicks / m.impressions) * 100) : 0,
          frequency: m.frequency || 0
        });
      }

      return {
        clientId,
        hasCampaigns: true,
        timestamp: new Date().toISOString(),
        // Aggregate metrics
        totalSpend,
        totalRevenue,
        totalPurchases,
        blendedRoas: totalSpend > 0 ? (totalRevenue / totalSpend) : 0,
        blendedCpa: totalPurchases > 0 ? (totalSpend / totalPurchases) : Infinity,
        blendedCtr: totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100) : 0,
        dailyBudget,
        budgetPacing: dailyBudget > 0 ? (totalSpend / dailyBudget) : 0,
        // Per-campaign breakdown
        campaigns: campaignMetrics,
        campaignCount: campaigns.length
      };
    } catch (error) {
      logger.error('Failed to get client metrics snapshot', { clientId, error: error.message });
      return { clientId, hasCampaigns: false, error: error.message, timestamp: new Date().toISOString() };
    }
  }

  async getHealthStatus() {
    try {
      const gomarbleHealthy = await this.checkGoMarbleHealth();
      const directApiHealthy = await this.checkDirectAPIHealth('both');

      return {
        service: 'AnalyticsService',
        status: 'operational',
        data_sources: {
          gomarble_mcp: {
            status: gomarbleHealthy ? 'healthy' : 'degraded',
            priority: 'primary'
          },
          direct_apis: {
            status: directApiHealthy ? 'healthy' : 'degraded',
            priority: 'fallback'
          },
          mock_data: {
            status: 'healthy',
            priority: 'last_resort'
          }
        },
        capabilities: [
          'Performance data fetching',
          'Multi-source aggregation',
          'Automatic fallback',
          'Historical tracking',
          'Insights generation'
        ]
      };

    } catch (error) {
      logger.error('Failed to get analytics health status', error);
      return {
        service: 'AnalyticsService',
        status: 'error',
        error: error.message
      };
    }
  }
}

module.exports = AnalyticsService;