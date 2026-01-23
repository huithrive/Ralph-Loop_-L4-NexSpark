// Tests for Shopify E-commerce Service
const ShopifyService = require('../services/shopifyService');

// Mock the Shopify API to avoid real API calls
jest.mock('@shopify/shopify-api/adapters/node');

const mockShopifyConfig = {
  scopes: ['read_products', 'write_products'],
  hostName: 'localhost'
};

const mockAuth = {
  begin: jest.fn(),
  callback: jest.fn()
};

const mockClients = {
  Rest: jest.fn()
};

const mockShopifyApi = {
  config: mockShopifyConfig,
  auth: mockAuth,
  clients: mockClients
};

jest.mock('@shopify/shopify-api', () => ({
  shopifyApi: jest.fn(() => mockShopifyApi)
}));

// Mock environment variables
const originalEnv = process.env;

describe('Shopify Service Tests', () => {
  let shopifyService;

  beforeEach(() => {
    // Reset environment variables
    process.env = {
      ...originalEnv,
      SHOPIFY_API_KEY: 'test-api-key',
      SHOPIFY_API_SECRET: 'test-api-secret',
      SHOPIFY_APP_HOST: 'test-app.com'
    };

    // Mock console to reduce test output noise
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // Reset mock functions
    mockAuth.begin.mockReset();
    mockAuth.callback.mockReset();
    mockClients.Rest.mockReset();

    shopifyService = new ShopifyService();
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  describe('Service Initialization', () => {
    test('should initialize service with valid configuration', () => {
      expect(shopifyService.shopify).toBeDefined();
      expect(shopifyService.shopify.config.scopes).toContain('read_products');
      expect(shopifyService.shopify.config.scopes).toContain('write_products');
    });

    test('should throw error without API key', () => {
      delete process.env.SHOPIFY_API_KEY;
      expect(() => new ShopifyService()).toThrow('SHOPIFY_API_KEY environment variable is required');
    });

    test('should throw error without API secret', () => {
      delete process.env.SHOPIFY_API_SECRET;
      expect(() => new ShopifyService()).toThrow('SHOPIFY_API_SECRET environment variable is required');
    });

    test('should provide health status', async () => {
      const health = await shopifyService.getHealthStatus();

      expect(health.service).toBe('ShopifyService');
      expect(health.status).toBe('operational');
      expect(health.api_version).toBe('2026-01');
      expect(Array.isArray(health.scopes)).toBe(true);
      expect(Array.isArray(health.features)).toBe(true);
    });
  });

  describe('OAuth Flow', () => {
    test('should generate OAuth URL', async () => {
      const shop = 'test-shop.myshopify.com';
      const state = 'test-state';
      const expectedUrl = 'https://test-shop.myshopify.com/admin/oauth/authorize?client_id=test&scope=read_products';

      mockAuth.begin.mockResolvedValue(expectedUrl);

      const authUrl = await shopifyService.generateAuthUrl(shop, state);

      expect(mockAuth.begin).toHaveBeenCalledWith({
        shop,
        callbackPath: '/api/executor/shopify/callback',
        isOnline: false,
        rawRequest: null,
        rawResponse: null
      });
      expect(authUrl).toBe(expectedUrl);
    });

    test('should handle OAuth callback', async () => {
      const query = {
        shop: 'test-shop.myshopify.com',
        code: 'test-code',
        state: 'test-state'
      };

      const mockSession = {
        id: 'session-id',
        shop: 'test-shop.myshopify.com',
        accessToken: 'test-token',
        isOnline: false
      };

      mockAuth.callback.mockResolvedValue(mockSession);

      const session = await shopifyService.handleOAuthCallback(query);

      expect(mockAuth.callback).toHaveBeenCalled();
      expect(session).toEqual(mockSession);
    });

    test('should handle OAuth errors gracefully', async () => {
      const shop = 'invalid-shop';
      const state = 'test-state';

      mockAuth.begin.mockRejectedValue(new Error('Invalid shop domain'));

      await expect(shopifyService.generateAuthUrl(shop, state))
        .rejects.toThrow('OAuth URL generation failed');
    });
  });

  describe('Product Creation', () => {
    let mockClient;
    let mockSession;

    beforeEach(() => {
      mockSession = {
        shop: 'test-shop.myshopify.com',
        accessToken: 'test-token'
      };

      mockClient = {
        post: jest.fn(),
        get: jest.fn()
      };

      mockClients.Rest.mockImplementation(() => mockClient);
    });

    test('should create a product successfully', async () => {
      const productData = {
        title: 'Test Product',
        description: 'Test Description',
        price: '99.99'
      };

      const mockProduct = {
        id: 123456,
        title: 'Test Product',
        status: 'draft'
      };

      mockClient.post.mockResolvedValue({
        body: { product: mockProduct }
      });

      const result = await shopifyService.createProduct(mockSession, productData);

      expect(mockClient.post).toHaveBeenCalledWith({
        path: 'products',
        data: expect.objectContaining({
          product: expect.objectContaining({
            title: 'Test Product',
            body_html: 'Test Description'
          })
        })
      });
      expect(result).toEqual(mockProduct);
    });

    test('should create products from GTM report', async () => {
      const mockGtmReport = {
        id: 'test-report-id',
        report_data: {
          executive_summary: {
            market_opportunity: 'SaaS growth opportunity',
            recommended_strategy: 'Focus on automation'
          },
          target_audience: {
            primary_persona: {
              demographics: 'Small business owners',
              pain_points: ['Time management', 'Cost efficiency']
            }
          },
          channel_strategy: {
            recommended_channels: [
              { channel: 'Facebook Ads', rationale: 'High reach' },
              { channel: 'Google Ads', rationale: 'Intent-based' }
            ]
          }
        }
      };

      const mockProduct = {
        id: 123456,
        title: 'SaaS Growth Accelerator',
        status: 'draft'
      };

      mockClient.post.mockResolvedValue({
        body: { product: mockProduct }
      });

      // Mock delay function to speed up tests
      jest.spyOn(shopifyService, 'delay').mockResolvedValue();

      const result = await shopifyService.createProductsFromGTMReport(mockSession, mockGtmReport);

      expect(result).toHaveLength(2); // Main product + complementary product
      expect(mockClient.post).toHaveBeenCalledTimes(2);
      expect(result[0]).toEqual(mockProduct);
    });

    test('should extract product ideas from GTM report', () => {
      const reportData = {
        executive_summary: {
          market_opportunity: 'E-commerce automation opportunity'
        },
        target_audience: {
          primary_persona: {
            demographics: 'Online store owners',
            pain_points: ['Inventory management', 'Customer service']
          }
        },
        channel_strategy: {
          recommended_channels: [
            { channel: 'Facebook Ads' },
            { channel: 'Email Marketing' }
          ]
        }
      };

      const products = shopifyService.extractProductIdeasFromReport(reportData);

      expect(products).toHaveLength(2); // Main + complementary
      expect(products[0].title).toBe('E-commerce Success System');
      expect(products[0].description).toContain('E-commerce automation opportunity');
      expect(products[1].title).toBe('Starter Guide - Quick Setup');
    });

    test('should generate appropriate product titles', () => {
      const testCases = [
        {
          summary: { market_opportunity: 'SaaS platform growth' },
          expected: 'SaaS Growth Accelerator'
        },
        {
          summary: { market_opportunity: 'E-commerce automation' },
          expected: 'E-commerce Success System'
        },
        {
          summary: { market_opportunity: 'Marketing automation tools' },
          expected: 'Marketing Mastery Program'
        },
        {
          summary: { market_opportunity: 'General business growth' },
          expected: 'Business Growth Blueprint'
        }
      ];

      testCases.forEach(({ summary, expected }) => {
        const title = shopifyService.generateProductTitle(summary);
        expect(title).toBe(expected);
      });
    });

    test('should handle product creation errors', async () => {
      const productData = { title: 'Test Product' };
      mockClient.post.mockRejectedValue(new Error('API Error'));

      await expect(shopifyService.createProduct(mockSession, productData))
        .rejects.toThrow('Product creation failed');
    });
  });

  describe('Meta Pixel Installation', () => {
    let mockClient;
    let mockSession;

    beforeEach(() => {
      mockSession = {
        shop: 'test-shop.myshopify.com',
        accessToken: 'test-token'
      };

      mockClient = {
        post: jest.fn()
      };

      mockClients.Rest.mockImplementation(() => mockClient);
    });

    test('should install Meta Pixel successfully', async () => {
      const pixelId = '123456789';
      const mockScriptTag = {
        id: 987654,
        event: 'onload',
        src: 'https://connect.facebook.net/en_US/fbevents.js'
      };

      mockClient.post.mockResolvedValue({
        body: { script_tag: mockScriptTag }
      });

      const result = await shopifyService.installMetaPixel(mockSession, pixelId);

      expect(mockClient.post).toHaveBeenCalledTimes(2); // Main script + pixel script
      expect(result).toEqual(mockScriptTag);
    });

    test('should handle pixel installation errors', async () => {
      const pixelId = '123456789';
      mockClient.post.mockRejectedValue(new Error('Script tag creation failed'));

      await expect(shopifyService.installMetaPixel(mockSession, pixelId))
        .rejects.toThrow('Meta Pixel installation failed');
    });
  });

  describe('Shop Information', () => {
    let mockClient;
    let mockSession;

    beforeEach(() => {
      mockSession = {
        shop: 'test-shop.myshopify.com',
        accessToken: 'test-token'
      };

      mockClient = {
        get: jest.fn()
      };

      mockClients.Rest.mockImplementation(() => mockClient);
    });

    test('should retrieve shop information', async () => {
      const mockShopInfo = {
        id: 12345,
        name: 'Test Shop',
        email: 'test@example.com',
        domain: 'test-shop.myshopify.com',
        currency: 'USD'
      };

      mockClient.get.mockResolvedValue({
        body: { shop: mockShopInfo }
      });

      const shopInfo = await shopifyService.getShopInfo(mockSession);

      expect(mockClient.get).toHaveBeenCalledWith({ path: 'shop' });
      expect(shopInfo).toEqual(mockShopInfo);
    });

    test('should handle shop info retrieval errors', async () => {
      mockClient.get.mockRejectedValue(new Error('Unauthorized'));

      await expect(shopifyService.getShopInfo(mockSession))
        .rejects.toThrow('Shop info retrieval failed');
    });
  });

  describe('Utility Functions', () => {
    test('should implement delay function', async () => {
      const start = Date.now();
      await shopifyService.delay(10);
      const end = Date.now();

      expect(end - start).toBeGreaterThanOrEqual(10);
    });

    test('should generate product description from GTM data', () => {
      const executiveSummary = {
        market_opportunity: 'Transform your business with automation'
      };
      const targetAudience = {
        primary_persona: {
          pain_points: ['Manual processes', 'Time waste', 'High costs']
        }
      };

      const description = shopifyService.generateProductDescription(executiveSummary, targetAudience);

      expect(description).toContain('Transform your business with automation');
      expect(description).toContain('Manual processes');
      expect(description).toContain('Time waste');
      expect(description).toContain('High costs');
      expect(description).toContain('<h2>');
      expect(description).toContain('<ul>');
    });

    test('should generate product tags from GTM data', () => {
      const reportData = {
        channel_strategy: {
          recommended_channels: [
            { channel: 'Facebook Ads' },
            { channel: 'Google Ads' }
          ]
        },
        target_audience: {
          primary_persona: {
            demographics: 'Small business owners'
          }
        }
      };

      const tags = shopifyService.generateProductTags(reportData);

      expect(tags).toContain('nexspark-generated');
      expect(tags).toContain('facebook-ads');
      expect(tags).toContain('google-ads');
      expect(tags).toContain('targeted-audience');
    });
  });
});