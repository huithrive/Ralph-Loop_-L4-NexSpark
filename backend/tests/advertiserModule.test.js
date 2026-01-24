// Advertiser Module Tests - Module 3
// Tests for campaign management, OAuth, and Meta Pixel functionality

const request = require('supertest');
const express = require('express');
const Campaign = require('../models/Campaign');
const Creative = require('../models/Creative');
const GoMarbleMcpService = require('../services/gomarbleMcpService');
const { query } = require('../config/database');

// Create test app
const app = express();
app.use(express.json());

// Mount advertiser routes
const campaignRoutes = require('../api/advertiser/campaign');
const authRoutes = require('../api/advertiser/auth');
const pixelRoutes = require('../api/advertiser/pixel');
app.use('/api/advertiser/campaign', campaignRoutes);
app.use('/api/advertiser/auth', authRoutes);
app.use('/api/advertiser/pixel', pixelRoutes);

// Mock environment variables for testing
// Intentionally not setting GoMarble credentials to force mock mode
delete process.env.GOMARBLE_OAUTH_CLIENT_ID;
delete process.env.GOMARBLE_OAUTH_CLIENT_SECRET;
process.env.SHOPIFY_API_KEY = 'test-shopify-key';

// Helper function to create test users
async function createTestUsers() {
  const testUsers = [
    {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'testuser@example.com',
      name: 'Test User'
    },
    {
      id: '123e4567-e89b-12d3-a456-426614174001',
      email: 'testuser2@example.com',
      name: 'Test User 2'
    }
  ];

  for (const user of testUsers) {
    await query(
      `INSERT INTO users (id, email, name) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING`,
      [user.id, user.email, user.name]
    ).catch(() => {}); // Ignore conflicts
  }

  // Also create test research results that campaigns reference
  const testResearchIds = [
    '123e4567-e89b-12d3-a456-426614174001',
    '123e4567-e89b-12d3-a456-426614174002'
  ];

  for (const researchId of testResearchIds) {
    await query(
      `INSERT INTO research_results (id, website_url, product_description, market_size, competitors, target_audience, channels, pain_points) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING`,
      [researchId, 'https://testbusiness.com', 'Test business description', '{}', '{}', '{}', '{}', '{}']
    ).catch(() => {}); // Ignore conflicts
  }
}

describe('Advertiser Module (Module 3)', () => {
  beforeEach(async () => {
    // Create test users and research results
    await createTestUsers();

    // Clean up test data
    await Campaign.cleanup(0).catch(() => {});
    await Creative.cleanup(0).catch(() => {});
  });

  describe('GoMarble MCP Service', () => {
    let gomarbleService;

    beforeEach(() => {
      gomarbleService = new GoMarbleMcpService();
    });

    test('should initialize in mock mode without credentials', () => {
      // Credentials are already not set in test environment
      const service = new GoMarbleMcpService();
      expect(service.mockMode).toBe(true);
    });

    test('should generate Meta OAuth URL', () => {
      const redirectUri = 'https://example.com/callback';
      const state = 'test-state';

      const authUrl = gomarbleService.getMetaAuthUrl(redirectUri, state);

      expect(authUrl).toContain(encodeURIComponent(redirectUri));
      expect(authUrl).toContain(state);
      expect(authUrl).toContain('platform=meta');
    });

    test('should generate Google OAuth URL', () => {
      const redirectUri = 'https://example.com/callback';
      const state = 'test-state';

      const authUrl = gomarbleService.getGoogleAuthUrl(redirectUri, state);

      expect(authUrl).toContain(encodeURIComponent(redirectUri));
      expect(authUrl).toContain(state);
      expect(authUrl).toContain('platform=google');
    });

    test('should mock token exchange', async () => {
      const result = await gomarbleService.exchangeCodeForToken('test-code', 'https://example.com', 'meta');

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(result).toHaveProperty('expires_in');
      expect(result.platform).toBe('meta');
    });

    test('should mock Meta campaign creation', async () => {
      const campaignData = {
        campaign_name: 'Test Campaign',
        budget_daily: 20,
        creative_ids: ['creative-1', 'creative-2'],
        targeting: { locations: ['US'], age_range: [25, 54] }
      };

      const result = await gomarbleService.createMetaCampaign('test-token', campaignData);

      expect(result).toHaveProperty('campaign_id');
      expect(result).toHaveProperty('ad_account_id');
      expect(result).toHaveProperty('ad_set_id');
      expect(result).toHaveProperty('ad_id');
      expect(result.campaign_name).toBe('Test Campaign');
      expect(result.budget_daily).toBe(20);
    });

    test('should mock Google campaign creation', async () => {
      const campaignData = {
        campaign_name: 'Test Google Campaign',
        budget_daily: 30,
        creative_ids: ['creative-1'],
        targeting: { keywords: ['test', 'campaign'] }
      };

      const result = await gomarbleService.createGoogleCampaign('test-token', campaignData);

      expect(result).toHaveProperty('campaign_id');
      expect(result).toHaveProperty('customer_id');
      expect(result).toHaveProperty('ad_group_id');
      expect(result).toHaveProperty('ad_id');
      expect(result.campaign_name).toBe('Test Google Campaign');
    });

    test('should check service health', async () => {
      const health = await gomarbleService.checkHealth();

      expect(health).toHaveProperty('status');
      expect(health).toHaveProperty('mode');
      expect(health).toHaveProperty('timestamp');
    });
  });

  describe('Campaign Model', () => {
    test('should create campaign', async () => {
      const campaignData = {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        research_id: '123e4567-e89b-12d3-a456-426614174001',
        platform: 'meta',
        campaign_name: 'Test Campaign',
        objective: 'conversions',
        creative_ids: ['creative-1', 'creative-2'],
        ad_copy: 'Great product!',
        budget_daily: 25.00,
        targeting: { locations: ['US'], age_range: [25, 45] }
      };

      const campaign = await Campaign.create(campaignData);

      expect(campaign).toHaveProperty('id');
      expect(campaign.campaign_name).toBe('Test Campaign');
      expect(campaign.platform).toBe('meta');
      expect(campaign.status).toBe('draft');
      expect(campaign.budget_daily).toBe('25');
    });

    test('should find campaign by ID', async () => {
      const campaignData = {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        research_id: '123e4567-e89b-12d3-a456-426614174001',
        platform: 'google',
        campaign_name: 'Findable Campaign',
        objective: 'traffic',
        creative_ids: ['creative-1'],
        budget_daily: 15.00,
        targeting: { keywords: ['test'] }
      };

      const created = await Campaign.create(campaignData);
      const found = await Campaign.findById(created.id);

      expect(found).toBeTruthy();
      expect(found.id).toBe(created.id);
      expect(found.campaign_name).toBe('Findable Campaign');
      expect(Array.isArray(found.creative_ids)).toBe(true);
      expect(typeof found.targeting).toBe('object');
    });

    test('should update campaign', async () => {
      const campaignData = {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        research_id: '123e4567-e89b-12d3-a456-426614174001',
        platform: 'both',
        campaign_name: 'Updatable Campaign',
        objective: 'awareness',
        creative_ids: ['creative-1'],
        budget_daily: 40.00,
        targeting: { interests: ['fitness'] }
      };

      const campaign = await Campaign.create(campaignData);

      const updates = {
        status: 'active',
        meta_campaign_id: 'meta_123456',
        google_campaign_id: 'google_789012',
        budget_daily: 50.00
      };

      const updated = await Campaign.update(campaign.id, updates);

      expect(updated.status).toBe('active');
      expect(updated.meta_campaign_id).toBe('meta_123456');
      expect(updated.google_campaign_id).toBe('google_789012');
      expect(updated.budget_daily).toBe('50');
    });

    test('should list campaigns with filters', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';

      // Create test campaigns
      await Campaign.create({
        user_id: userId,
        research_id: '123e4567-e89b-12d3-a456-426614174001',
        platform: 'meta',
        campaign_name: 'Meta Campaign 1',
        objective: 'conversions',
        creative_ids: ['creative-1'],
        budget_daily: 20,
        targeting: {}
      });

      await Campaign.create({
        user_id: userId,
        research_id: '123e4567-e89b-12d3-a456-426614174001',
        platform: 'google',
        campaign_name: 'Google Campaign 1',
        objective: 'traffic',
        creative_ids: ['creative-2'],
        budget_daily: 30,
        targeting: {}
      });

      const allCampaigns = await Campaign.list({ user_id: userId });
      expect(allCampaigns).toHaveLength(2);

      const metaCampaigns = await Campaign.list({ user_id: userId, platform: 'meta' });
      expect(metaCampaigns).toHaveLength(1);
      expect(metaCampaigns[0].campaign_name).toBe('Meta Campaign 1');
    });

    test('should get campaign statistics', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';

      // Create test campaign
      const campaign = await Campaign.create({
        user_id: userId,
        research_id: '123e4567-e89b-12d3-a456-426614174001',
        platform: 'meta',
        campaign_name: 'Stats Campaign',
        objective: 'conversions',
        creative_ids: ['creative-1'],
        budget_daily: 25,
        targeting: {}
      });

      await Campaign.update(campaign.id, { status: 'active' });

      const stats = await Campaign.getStats(userId);

      expect(stats).toHaveProperty('totals');
      expect(stats).toHaveProperty('daily_stats');
      expect(stats.totals.total).toBeGreaterThan(0);
      expect(stats.totals.active).toBeGreaterThan(0);
    });
  });

  describe('Campaign API Endpoints', () => {
    test('should require valid creative IDs for campaign creation', async () => {
      const response = await request(app)
        .post('/api/advertiser/campaign/create')
        .send({
          user_id: '123e4567-e89b-12d3-a456-426614174000',
          research_id: '123e4567-e89b-12d3-a456-426614174001',
          platform: 'meta',
          creative_ids: ['non-existent-creative'],
          campaign_name: 'Invalid Creative Campaign',
          budget_daily: 20,
          targeting: { locations: ['US'] }
        });

      expect(response.status).toBe(400);
      expect(response.body.error_code).toBe('INVALID_CREATIVES');
    });

    test('should validate campaign creation parameters', async () => {
      const response = await request(app)
        .post('/api/advertiser/campaign/create')
        .send({
          user_id: 'invalid-uuid',
          research_id: '123e4567-e89b-12d3-a456-426614174001',
          platform: 'invalid-platform',
          creative_ids: [],
          budget_daily: 'not-a-number'
        });

      expect(response.status).toBe(400);
      expect(response.body.error_code).toBe('VALIDATION_ERROR');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should return 404 for non-existent campaign', async () => {
      const response = await request(app)
        .get('/api/advertiser/campaign/00000000-0000-0000-0000-000000000000');

      expect(response.status).toBe(404);
      expect(response.body.error_code).toBe('NOT_FOUND');
    });

    test('should validate status update parameters', async () => {
      const response = await request(app)
        .put('/api/advertiser/campaign/123e4567-e89b-12d3-a456-426614174000/status')
        .send({
          status: 'invalid-status'
        });

      expect(response.status).toBe(400);
      expect(response.body.error_code).toBe('VALIDATION_ERROR');
    });

    test('should list campaigns with query parameters', async () => {
      const response = await request(app)
        .get('/api/advertiser/campaigns')
        .query({
          user_id: '123e4567-e89b-12d3-a456-426614174000',
          platform: 'meta',
          limit: 10
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should get campaign performance (mock data)', async () => {
      // First create a campaign
      const campaignData = {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        research_id: '123e4567-e89b-12d3-a456-426614174001',
        platform: 'meta',
        campaign_name: 'Performance Test Campaign',
        objective: 'conversions',
        creative_ids: [],
        budget_daily: 30,
        targeting: {}
      };

      const campaign = await Campaign.create(campaignData);

      const response = await request(app)
        .get(`/api/advertiser/campaign/${campaign.id}/performance`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('metrics');
      expect(response.body.data.metrics).toHaveProperty('impressions');
      expect(response.body.data.metrics).toHaveProperty('clicks');
      expect(response.body.data.metrics).toHaveProperty('conversions');
    });
  });

  describe('OAuth Authentication Endpoints', () => {
    test('should generate Meta OAuth URL', async () => {
      const response = await request(app)
        .get('/api/advertiser/auth/meta/connect')
        .query({
          user_id: '123e4567-e89b-12d3-a456-426614174000',
          redirect_uri: 'https://example.com/callback'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('auth_url');
      expect(response.body.data).toHaveProperty('state');
      expect(response.body.data.platform).toBe('meta');
    });

    test('should generate Google OAuth URL', async () => {
      const response = await request(app)
        .get('/api/advertiser/auth/google/connect')
        .query({
          user_id: '123e4567-e89b-12d3-a456-426614174000'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('auth_url');
      expect(response.body.data.platform).toBe('google');
    });

    test('should validate OAuth callback parameters', async () => {
      const response = await request(app)
        .get('/api/advertiser/auth/meta/callback')
        .query({
          // Missing required code and state
        });

      expect(response.status).toBe(400);
      expect(response.body.error_code).toBe('VALIDATION_ERROR');
    });

    test('should handle invalid OAuth state', async () => {
      const response = await request(app)
        .get('/api/advertiser/auth/meta/callback')
        .query({
          code: 'test-code',
          state: 'invalid-state'
        });

      expect(response.status).toBe(400);
      expect(response.body.error_code).toBe('INVALID_STATE');
    });

    test('should generate Shopify OAuth URL', async () => {
      const response = await request(app)
        .get('/api/advertiser/auth/shopify/connect')
        .query({
          user_id: '123e4567-e89b-12d3-a456-426614174000',
          shop_domain: 'test-shop'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('auth_url');
      expect(response.body.data.platform).toBe('shopify');
      expect(response.body.data.shop_domain).toBe('test-shop');
    });

    test('should check OAuth status', async () => {
      const response = await request(app)
        .get('/api/advertiser/auth/status')
        .query({
          user_id: '123e4567-e89b-12d3-a456-426614174000'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('platforms');
      expect(response.body.data.platforms).toHaveProperty('meta');
      expect(response.body.data.platforms).toHaveProperty('google');
      expect(response.body.data.platforms).toHaveProperty('shopify');
    });
  });

  describe('Meta Pixel Installation', () => {
    test('should install Meta Pixel on Shopify', async () => {
      const response = await request(app)
        .post('/api/advertiser/pixel/install')
        .send({
          user_id: '123e4567-e89b-12d3-a456-426614174000',
          shop_domain: 'test-shop.myshopify.com',
          pixel_id: '1234567890'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('pixel_id');
      expect(response.body.data).toHaveProperty('script_tag_id');
      expect(response.body.data.installation_status).toBe('completed');
      expect(response.body.data.standard_events).toContain('PageView');
      expect(response.body.data.standard_events).toContain('Purchase');
    });

    test('should validate pixel installation parameters', async () => {
      const response = await request(app)
        .post('/api/advertiser/pixel/install')
        .send({
          user_id: 'invalid-uuid',
          // Missing shop_domain
        });

      expect(response.status).toBe(400);
      expect(response.body.error_code).toBe('VALIDATION_ERROR');
    });

    test('should verify pixel installation', async () => {
      const pixelId = '1234567890';
      const response = await request(app)
        .get(`/api/advertiser/pixel/verify/${pixelId}`)
        .query({
          shop_domain: 'test-shop.myshopify.com'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('verification_status');
      expect(response.body.data).toHaveProperty('pixel_firing');
      expect(response.body.data).toHaveProperty('events_received');
      expect(response.body.data).toHaveProperty('recommendations');
    });

    test('should uninstall Meta Pixel', async () => {
      const response = await request(app)
        .delete('/api/advertiser/pixel/uninstall')
        .send({
          user_id: '123e4567-e89b-12d3-a456-426614174000',
          shop_domain: 'test-shop.myshopify.com',
          script_tag_id: '12345'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.removal_status).toBeDefined();
    });

    test('should require shop domain for pixel verification', async () => {
      const response = await request(app)
        .get('/api/advertiser/pixel/verify/1234567890')
        // Missing shop_domain query parameter
        .query({});

      expect(response.status).toBe(400);
      expect(response.body.error_code).toBe('MISSING_SHOP_DOMAIN');
    });
  });

  describe('Integration with Module 2 (Executor)', () => {
    test('should integrate with Creative model for campaign creation', async () => {
      // First create a user and research (mock)
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const researchId = '123e4567-e89b-12d3-a456-426614174001';

      // Create a completed creative
      const creative = await Creative.create({
        user_id: userId,
        research_id: researchId,
        creative_type: 'video',
        prompt: 'Test video for campaign',
        duration: 5,
        quality: '720p'
      });

      // Mark as completed
      await Creative.update(creative.id, {
        status: 'completed',
        video_url: 'https://example.com/video.mp4'
      });

      // Now try to create a campaign with this creative
      const response = await request(app)
        .post('/api/advertiser/campaign/create')
        .send({
          user_id: userId,
          research_id: researchId,
          platform: 'meta',
          creative_ids: [creative.id],
          campaign_name: 'Creative Integration Campaign',
          budget_daily: 25,
          targeting: { locations: ['US'] }
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('campaign_id');
    });

    test('should list creatives for campaign creation', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const researchId = '123e4567-e89b-12d3-a456-426614174001';

      // Get available creatives for campaign (from Module 2)
      const creatives = await Creative.getForCampaign(userId, researchId);

      expect(Array.isArray(creatives)).toBe(true);
      // This may be empty if no completed creatives exist, which is expected
    });
  });

  afterAll(async () => {
    // Clean up test data
    await Campaign.cleanup(0).catch(() => {});
    await Creative.cleanup(0).catch(() => {});
  });
});