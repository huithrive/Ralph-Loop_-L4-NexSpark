// GoMarble MCP API Service - Module 3 Primary Integration
// Provides unified interface for Meta Business Manager and Google Ads

const axios = require('axios');
const logger = require('../utils/logger');

class GoMarbleMcpService {
  constructor() {
    this.baseURL = process.env.GOMARBLE_MCP_URL || 'https://apps.gomarble.ai/mcp-api/sse';
    this.clientId = process.env.GOMARBLE_OAUTH_CLIENT_ID;
    this.clientSecret = process.env.GOMARBLE_OAUTH_CLIENT_SECRET;

    if (!this.clientId || !this.clientSecret) {
      logger.warn('GoMarble MCP credentials not found, service will use mock mode');
      this.mockMode = true;
    }
  }

  /**
   * Generate OAuth authorization URL for Meta Business Manager
   * @param {string} redirectUri - OAuth redirect URI
   * @param {string} state - OAuth state parameter
   * @returns {string} Authorization URL
   */
  getMetaAuthUrl(redirectUri, state) {
    if (this.mockMode) {
      // Return proper OAuth URL format for testing
      const params = new URLSearchParams({
        response_type: 'code',
        client_id: 'test-client-id',
        redirect_uri: redirectUri,
        scope: 'meta_business_manager',
        state,
        platform: 'meta'
      });
      return `${this.baseURL}/oauth/authorize?${params.toString()}`;
    }

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: redirectUri,
      scope: 'meta_business_manager',
      state,
      platform: 'meta'
    });

    return `${this.baseURL}/oauth/authorize?${params.toString()}`;
  }

  /**
   * Generate OAuth authorization URL for Google Ads
   * @param {string} redirectUri - OAuth redirect URI
   * @param {string} state - OAuth state parameter
   * @returns {string} Authorization URL
   */
  getGoogleAuthUrl(redirectUri, state) {
    if (this.mockMode) {
      // Return proper OAuth URL format for testing
      const params = new URLSearchParams({
        response_type: 'code',
        client_id: 'test-client-id',
        redirect_uri: redirectUri,
        scope: 'google_ads',
        state,
        platform: 'google'
      });
      return `${this.baseURL}/oauth/authorize?${params.toString()}`;
    }

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: redirectUri,
      scope: 'google_ads',
      state,
      platform: 'google'
    });

    return `${this.baseURL}/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchange OAuth code for access token
   * @param {string} code - Authorization code
   * @param {string} redirectUri - Redirect URI
   * @param {string} platform - Platform ('meta' or 'google')
   * @returns {Promise<Object>} Token response
   */
  async exchangeCodeForToken(code, redirectUri, platform) {
    if (this.mockMode) {
      return this.mockExchangeToken(code, platform);
    }

    try {
      const response = await axios.post(`${this.baseURL}/oauth/token`, {
        grant_type: 'authorization_code',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        redirect_uri: redirectUri,
        platform
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 30000
      });

      logger.info('OAuth token exchanged successfully', { platform });
      return response.data;

    } catch (error) {
      logger.error('OAuth token exchange failed', error, { platform, code });
      throw new Error(`Token exchange failed: ${error.message}`);
    }
  }

  /**
   * Create Meta Ads campaign via GoMarble MCP
   * @param {string} accessToken - Access token
   * @param {Object} campaignData - Campaign configuration
   * @returns {Promise<Object>} Campaign creation result
   */
  async createMetaCampaign(accessToken, campaignData) {
    if (this.mockMode) {
      return this.mockCreateMetaCampaign(campaignData);
    }

    try {
      const payload = {
        platform: 'meta',
        campaign_name: campaignData.campaign_name,
        objective: campaignData.objective || 'conversions',
        budget_daily: campaignData.budget_daily,
        targeting: campaignData.targeting,
        ad_set: {
          name: `${campaignData.campaign_name} - Ad Set`,
          optimization_goal: 'OFFSITE_CONVERSIONS',
          billing_event: 'IMPRESSIONS',
          bid_amount: Math.round(campaignData.budget_daily * 100), // Convert to cents
          daily_budget: Math.round(campaignData.budget_daily * 100)
        },
        ads: campaignData.creative_ids.map((creativeId, index) => ({
          name: `${campaignData.campaign_name} - Ad ${index + 1}`,
          creative_id: creativeId,
          ad_copy: campaignData.ad_copy || 'Default ad copy'
        }))
      };

      const response = await axios.post(`${this.baseURL}/campaigns/meta`, payload, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 60000
      });

      logger.info('Meta campaign created via GoMarble MCP', {
        campaign_name: campaignData.campaign_name,
        campaign_id: response.data.campaign_id
      });

      return response.data;

    } catch (error) {
      logger.error('Meta campaign creation failed', error, { campaign_name: campaignData.campaign_name });
      throw new Error(`Meta campaign creation failed: ${error.message}`);
    }
  }

  /**
   * Create Google Ads campaign via GoMarble MCP
   * @param {string} accessToken - Access token
   * @param {Object} campaignData - Campaign configuration
   * @returns {Promise<Object>} Campaign creation result
   */
  async createGoogleCampaign(accessToken, campaignData) {
    if (this.mockMode) {
      return this.mockCreateGoogleCampaign(campaignData);
    }

    try {
      const payload = {
        platform: 'google',
        campaign_name: campaignData.campaign_name,
        campaign_type: 'VIDEO', // For video ads
        budget_daily: campaignData.budget_daily,
        targeting: campaignData.targeting,
        ad_group: {
          name: `${campaignData.campaign_name} - Ad Group`,
          default_cpc_bid: Math.round(campaignData.budget_daily * 0.1 * 1000000) // Convert to micros
        },
        ads: campaignData.creative_ids.map((creativeId, index) => ({
          name: `${campaignData.campaign_name} - Ad ${index + 1}`,
          creative_id: creativeId,
          headline: campaignData.ad_copy || 'Default headline',
          description: 'Compelling ad description'
        }))
      };

      const response = await axios.post(`${this.baseURL}/campaigns/google`, payload, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 60000
      });

      logger.info('Google campaign created via GoMarble MCP', {
        campaign_name: campaignData.campaign_name,
        campaign_id: response.data.campaign_id
      });

      return response.data;

    } catch (error) {
      logger.error('Google campaign creation failed', error, { campaign_name: campaignData.campaign_name });
      throw new Error(`Google campaign creation failed: ${error.message}`);
    }
  }

  /**
   * Get campaign performance data
   * @param {string} accessToken - Access token
   * @param {string} campaignId - Campaign ID
   * @param {string} platform - Platform ('meta' or 'google')
   * @returns {Promise<Object>} Performance data
   */
  async getCampaignPerformance(accessToken, campaignId, platform) {
    if (this.mockMode) {
      return this.mockGetPerformance(campaignId, platform);
    }

    try {
      const response = await axios.get(`${this.baseURL}/campaigns/${platform}/${campaignId}/performance`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        },
        timeout: 30000
      });

      logger.info('Campaign performance retrieved', { campaignId, platform });
      return response.data;

    } catch (error) {
      logger.error('Failed to get campaign performance', error, { campaignId, platform });
      throw new Error(`Performance retrieval failed: ${error.message}`);
    }
  }

  /**
   * Update campaign status
   * @param {string} accessToken - Access token
   * @param {string} campaignId - Campaign ID
   * @param {string} platform - Platform ('meta' or 'google')
   * @param {string} status - New status ('active', 'paused')
   * @returns {Promise<Object>} Update result
   */
  async updateCampaignStatus(accessToken, campaignId, platform, status) {
    if (this.mockMode) {
      return this.mockUpdateCampaign(campaignId, platform, status);
    }

    try {
      const response = await axios.patch(`${this.baseURL}/campaigns/${platform}/${campaignId}`, {
        status
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 30000
      });

      logger.info('Campaign status updated', { campaignId, platform, status });
      return response.data;

    } catch (error) {
      logger.error('Failed to update campaign status', error, { campaignId, platform, status });
      throw new Error(`Campaign update failed: ${error.message}`);
    }
  }

  /**
   * Check service health and connectivity
   * @returns {Promise<Object>} Health status
   */
  async checkHealth() {
    if (this.mockMode) {
      return {
        status: 'healthy',
        mode: 'mock',
        timestamp: new Date().toISOString()
      };
    }

    try {
      const response = await axios.get(`${this.baseURL}/health`, {
        timeout: 10000
      });

      return {
        status: 'healthy',
        mode: 'live',
        api_status: response.data.status,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('GoMarble MCP health check failed', error);
      return {
        status: 'unhealthy',
        mode: 'live',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Mock methods for testing

  mockExchangeToken(code, platform) {
    return Promise.resolve({
      access_token: `mock_${platform}_token_${Date.now()}`,
      refresh_token: `mock_refresh_${platform}_${Date.now()}`,
      expires_in: 3600,
      scope: `${platform}_ads`,
      platform
    });
  }

  mockCreateMetaCampaign(campaignData) {
    return Promise.resolve({
      campaign_id: `meta_campaign_${Math.floor(Math.random() * 1000000)}`,
      campaign_name: campaignData.campaign_name,
      ad_account_id: 'act_1234567890',
      ad_set_id: `adset_${Math.floor(Math.random() * 1000000)}`,
      ad_id: `ad_${Math.floor(Math.random() * 1000000)}`,
      status: 'active',
      budget_daily: campaignData.budget_daily,
      created_at: new Date().toISOString()
    });
  }

  mockCreateGoogleCampaign(campaignData) {
    return Promise.resolve({
      campaign_id: `google_campaign_${Math.floor(Math.random() * 1000000)}`,
      campaign_name: campaignData.campaign_name,
      customer_id: '1234567890',
      ad_group_id: `adgroup_${Math.floor(Math.random() * 1000000)}`,
      ad_id: `ad_${Math.floor(Math.random() * 1000000)}`,
      status: 'enabled',
      budget_daily: campaignData.budget_daily,
      created_at: new Date().toISOString()
    });
  }

  mockGetPerformance(campaignId, platform) {
    return Promise.resolve({
      campaign_id: campaignId,
      platform,
      impressions: Math.floor(Math.random() * 10000),
      clicks: Math.floor(Math.random() * 500),
      conversions: Math.floor(Math.random() * 50),
      spend: (Math.random() * 100).toFixed(2),
      ctr: (Math.random() * 5).toFixed(2),
      cpc: (Math.random() * 2).toFixed(2),
      date_range: {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString()
      }
    });
  }

  mockUpdateCampaign(campaignId, platform, status) {
    return Promise.resolve({
      campaign_id: campaignId,
      platform,
      status,
      updated_at: new Date().toISOString()
    });
  }
}

module.exports = GoMarbleMcpService;