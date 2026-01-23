// Shopify E-commerce Integration Service
// Part of NexSpark Executor Module - enables product creation and store setup

// Import Node.js adapter for Shopify API
require('@shopify/shopify-api/adapters/node');
const { shopifyApi } = require('@shopify/shopify-api');
const logger = require('../utils/logger');

/**
 * Shopify Integration Service
 *
 * Handles OAuth authentication, product creation, and store setup
 * Supports both public and custom apps
 */
class ShopifyService {
  constructor() {
    // Initialize Shopify API with configuration
    this.shopify = shopifyApi({
      apiKey: process.env.SHOPIFY_API_KEY,
      apiSecretKey: process.env.SHOPIFY_API_SECRET,
      hostName: process.env.SHOPIFY_APP_HOST || 'localhost',
      scopes: [
        'read_products',
        'write_products',
        'read_orders',
        'write_orders',
        'read_customers',
        'write_customers',
        'read_script_tags',
        'write_script_tags'
      ],
      apiVersion: '2026-01',
      isEmbeddedApp: false,
      userAgentPrefix: 'NexSpark-Executor'
    });

    this.validateConfiguration();

    logger.info('Shopify service initialized', {
      apiVersion: '2026-01',
      scopes: this.shopify.config.scopes,
      hostName: this.shopify.config.hostName
    });
  }

  /**
   * Validate service configuration
   */
  validateConfiguration() {
    if (!process.env.SHOPIFY_API_KEY) {
      throw new Error('SHOPIFY_API_KEY environment variable is required');
    }
    if (!process.env.SHOPIFY_API_SECRET) {
      throw new Error('SHOPIFY_API_SECRET environment variable is required');
    }

    logger.info('Shopify configuration validated', {
      hasApiKey: !!process.env.SHOPIFY_API_KEY,
      hasApiSecret: !!process.env.SHOPIFY_API_SECRET,
      hostName: process.env.SHOPIFY_APP_HOST
    });
  }

  /**
   * Generate OAuth authorization URL for shop
   *
   * @param {string} shop - Shop domain (e.g., 'mystore.myshopify.com')
   * @param {string} state - Random state parameter for security
   * @returns {string} Authorization URL
   */
  async generateAuthUrl(shop, state) {
    try {
      logger.info('Generating Shopify OAuth URL', { shop, state });

      const authRoute = await this.shopify.auth.begin({
        shop,
        callbackPath: '/api/executor/shopify/callback',
        isOnline: false, // Offline tokens for long-term access
        rawRequest: null,
        rawResponse: null
      });

      logger.info('OAuth URL generated successfully', { shop, authUrl: authRoute });
      return authRoute;

    } catch (error) {
      logger.error('Failed to generate OAuth URL', error, { shop, state });
      throw new Error(`OAuth URL generation failed: ${error.message}`);
    }
  }

  /**
   * Handle OAuth callback and exchange code for access token
   *
   * @param {Object} query - Query parameters from OAuth callback
   * @returns {Object} Session with access token
   */
  async handleOAuthCallback(query) {
    try {
      logger.info('Processing Shopify OAuth callback', {
        shop: query.shop,
        hasCode: !!query.code
      });

      const session = await this.shopify.auth.callback({
        rawRequest: { url: `?${new URLSearchParams(query).toString()}` },
        rawResponse: null
      });

      logger.info('OAuth callback processed successfully', {
        shop: session.shop,
        sessionId: session.id,
        isOnline: session.isOnline
      });

      return session;

    } catch (error) {
      logger.error('Failed to process OAuth callback', error, { query });
      throw new Error(`OAuth callback processing failed: ${error.message}`);
    }
  }

  /**
   * Create a product in Shopify store
   *
   * @param {Object} session - Authenticated Shopify session
   * @param {Object} productData - Product information
   * @returns {Object} Created product
   */
  async createProduct(session, productData) {
    try {
      logger.info('Creating Shopify product', {
        shop: session.shop,
        productTitle: productData.title
      });

      const client = new this.shopify.clients.Rest({ session });

      // Prepare product data for Shopify API
      const product = {
        title: productData.title,
        body_html: productData.description || '',
        vendor: productData.vendor || 'NexSpark',
        product_type: productData.product_type || 'Digital Product',
        status: productData.status || 'draft',
        published: productData.published || false,
        tags: productData.tags ? productData.tags.join(',') : '',
        images: productData.images || [],
        variants: productData.variants || [{
          price: productData.price || '0.00',
          inventory_quantity: productData.inventory_quantity || 0,
          inventory_management: 'shopify',
          fulfillment_service: 'manual'
        }],
        options: productData.options || [{
          name: 'Title',
          values: ['Default Title']
        }]
      };

      const response = await client.post({
        path: 'products',
        data: { product }
      });

      const createdProduct = response.body.product;

      logger.info('Product created successfully', {
        shop: session.shop,
        productId: createdProduct.id,
        productTitle: createdProduct.title,
        status: createdProduct.status
      });

      return createdProduct;

    } catch (error) {
      logger.error('Failed to create product', error, {
        shop: session.shop,
        productTitle: productData.title
      });
      throw new Error(`Product creation failed: ${error.message}`);
    }
  }

  /**
   * Create multiple products based on GTM report
   *
   * @param {Object} session - Authenticated Shopify session
   * @param {Object} gtmReport - GTM strategy report
   * @returns {Array} Created products
   */
  async createProductsFromGTMReport(session, gtmReport) {
    try {
      logger.info('Creating products from GTM report', {
        shop: session.shop,
        reportId: gtmReport.id
      });

      const reportData = gtmReport.report_data || {};
      const targetAudience = reportData.target_audience || {};
      const channelStrategy = reportData.channel_strategy || {};
      const actionPlan = reportData.action_plan_90_day || {};

      // Extract product recommendations from GTM report
      const productIdeas = this.extractProductIdeasFromReport(reportData);

      const createdProducts = [];

      for (const productIdea of productIdeas) {
        try {
          const product = await this.createProduct(session, productIdea);
          createdProducts.push(product);

          // Add delay between product creations to respect rate limits
          await this.delay(500);
        } catch (error) {
          logger.warn('Failed to create individual product', error, {
            productTitle: productIdea.title
          });
        }
      }

      logger.info('GTM-based products created', {
        shop: session.shop,
        reportId: gtmReport.id,
        totalProducts: createdProducts.length
      });

      return createdProducts;

    } catch (error) {
      logger.error('Failed to create products from GTM report', error, {
        shop: session.shop,
        reportId: gtmReport.id
      });
      throw error;
    }
  }

  /**
   * Extract product ideas from GTM report data
   *
   * @param {Object} reportData - GTM report data
   * @returns {Array} Product creation objects
   */
  extractProductIdeasFromReport(reportData) {
    const products = [];

    const executiveSummary = reportData.executive_summary || {};
    const targetAudience = reportData.target_audience || {};
    const channelStrategy = reportData.channel_strategy || {};

    // Create main product based on executive summary
    if (executiveSummary.market_opportunity) {
      products.push({
        title: this.generateProductTitle(executiveSummary),
        description: this.generateProductDescription(executiveSummary, targetAudience),
        price: '97.00', // Default pricing
        tags: this.generateProductTags(reportData),
        product_type: 'Digital Product',
        vendor: 'NexSpark Generated',
        status: 'draft'
      });
    }

    // Create complementary products if channel strategy suggests multiple offerings
    if (channelStrategy.recommended_channels && channelStrategy.recommended_channels.length > 1) {
      products.push({
        title: 'Starter Guide - Quick Setup',
        description: 'Get started quickly with our simplified setup guide.',
        price: '27.00',
        tags: ['starter', 'guide', 'quick-setup'],
        product_type: 'Digital Guide',
        vendor: 'NexSpark Generated',
        status: 'draft'
      });
    }

    return products.slice(0, 3); // Limit to 3 products max
  }

  /**
   * Generate product title from GTM data
   */
  generateProductTitle(executiveSummary) {
    const opportunity = executiveSummary.market_opportunity || '';
    const strategy = executiveSummary.recommended_strategy || '';

    // Simple title generation logic
    if (opportunity.toLowerCase().includes('saas')) {
      return 'SaaS Growth Accelerator';
    } else if (opportunity.toLowerCase().includes('ecommerce') || opportunity.toLowerCase().includes('e-commerce')) {
      return 'E-commerce Success System';
    } else if (opportunity.toLowerCase().includes('marketing')) {
      return 'Marketing Mastery Program';
    } else {
      return 'Business Growth Blueprint';
    }
  }

  /**
   * Generate product description from GTM data
   */
  generateProductDescription(executiveSummary, targetAudience) {
    const opportunity = executiveSummary.market_opportunity || 'Transform your business';
    const persona = targetAudience.primary_persona || {};
    const painPoints = persona.pain_points || [];

    let description = '<h2>Transform Your Business Today</h2>';
    description += `<p>${opportunity}</p>`;

    if (painPoints.length > 0) {
      description += '<h3>Solve Your Biggest Challenges:</h3><ul>';
      painPoints.slice(0, 3).forEach(pain => {
        description += `<li>${pain}</li>`;
      });
      description += '</ul>';
    }

    description += '<p><strong>Ready to accelerate your growth? Get started today!</strong></p>';
    return description;
  }

  /**
   * Generate product tags from GTM report
   */
  generateProductTags(reportData) {
    const tags = ['nexspark-generated'];

    const channelStrategy = reportData.channel_strategy || {};
    if (channelStrategy.recommended_channels) {
      channelStrategy.recommended_channels.slice(0, 2).forEach(channel => {
        if (channel.channel) {
          tags.push(channel.channel.toLowerCase().replace(/\s+/g, '-'));
        }
      });
    }

    const targetAudience = reportData.target_audience || {};
    if (targetAudience.primary_persona?.demographics) {
      tags.push('targeted-audience');
    }

    return tags;
  }

  /**
   * Install Meta Pixel script tag
   *
   * @param {Object} session - Authenticated Shopify session
   * @param {string} pixelId - Meta Pixel ID
   * @returns {Object} Created script tag
   */
  async installMetaPixel(session, pixelId) {
    try {
      logger.info('Installing Meta Pixel', { shop: session.shop, pixelId });

      const client = new this.shopify.clients.Rest({ session });

      const scriptTag = {
        event: 'onload',
        src: 'https://connect.facebook.net/en_US/fbevents.js',
        display_scope: 'online_store'
      };

      const response = await client.post({
        path: 'script_tags',
        data: { script_tag: scriptTag }
      });

      // Also create a custom pixel tracking script
      const pixelScript = {
        event: 'onload',
        src: `data:application/javascript,
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${pixelId}');
          fbq('track', 'PageView');`,
        display_scope: 'online_store'
      };

      await client.post({
        path: 'script_tags',
        data: { script_tag: pixelScript }
      });

      logger.info('Meta Pixel installed successfully', {
        shop: session.shop,
        pixelId,
        scriptTagId: response.body.script_tag.id
      });

      return response.body.script_tag;

    } catch (error) {
      logger.error('Failed to install Meta Pixel', error, {
        shop: session.shop,
        pixelId
      });
      throw new Error(`Meta Pixel installation failed: ${error.message}`);
    }
  }

  /**
   * Get shop information
   *
   * @param {Object} session - Authenticated Shopify session
   * @returns {Object} Shop details
   */
  async getShopInfo(session) {
    try {
      const client = new this.shopify.clients.Rest({ session });

      const response = await client.get({
        path: 'shop'
      });

      return response.body.shop;

    } catch (error) {
      logger.error('Failed to get shop info', error, { shop: session.shop });
      throw new Error(`Shop info retrieval failed: ${error.message}`);
    }
  }

  /**
   * Utility function to add delay
   */
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get service health status
   */
  async getHealthStatus() {
    return {
      service: 'ShopifyService',
      status: 'operational',
      api_version: '2026-01',
      scopes: this.shopify.config.scopes,
      configuration: {
        has_api_key: !!process.env.SHOPIFY_API_KEY,
        has_api_secret: !!process.env.SHOPIFY_API_SECRET,
        host_name: this.shopify.config.hostName
      },
      features: [
        'OAuth authentication',
        'Product creation',
        'Meta Pixel installation',
        'Script tag management',
        'GTM report integration'
      ]
    };
  }
}

module.exports = ShopifyService;