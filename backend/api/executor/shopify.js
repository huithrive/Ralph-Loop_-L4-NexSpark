// Shopify Integration API
// Part of NexSpark Executor Module

const express = require('express');
const { body, validationResult } = require('express-validator');
const ShopifyService = require('../../services/shopifyService');
const { GTMReport } = require('../../models');
const logger = require('../../utils/logger');
const { success: formatSuccessResponse, error: formatErrorResponse } = require('../../utils/responseFormatter');

const router = express.Router();
const shopifyService = new ShopifyService();

// In-memory session storage (replace with database in production)
const sessionStorage = new Map();

/**
 * GET /api/executor/shopify/auth
 * Initiate Shopify OAuth flow
 */
router.get('/auth', [
  body('shop').notEmpty().withMessage('Shop domain is required'),
  body('shop').matches(/^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/).withMessage('Invalid shop domain format')
], async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(formatErrorResponse(
        'Invalid request parameters',
        'VALIDATION_ERROR',
        errors.array()
      ));
    }

    const { shop } = req.query;
    const state = Math.random().toString(36).substring(7); // Generate random state

    logger.info('Shopify OAuth initiation requested', { shop, state });

    // Generate OAuth URL
    const authUrl = await shopifyService.generateAuthUrl(shop, state);

    // Store state for validation (in production, use database)
    sessionStorage.set(state, { shop, timestamp: Date.now() });

    logger.info('Shopify OAuth URL generated', { shop, state });

    res.status(200).json(formatSuccessResponse({
      auth_url: authUrl,
      state,
      shop,
      instructions: [
        '1. Click the auth_url to authorize NexSpark with your Shopify store',
        '2. You will be redirected back to complete the setup',
        '3. Once authorized, you can create products and install tracking pixels',
        '4. Save the state parameter for the callback verification'
      ]
    }, 'Shopify OAuth URL generated successfully'));

  } catch (error) {
    logger.error('Shopify OAuth initiation failed', error, { shop: req.query.shop });

    res.status(500).json(formatErrorResponse(
      'OAuth initiation failed',
      'OAUTH_INITIATION_ERROR',
      { error: error.message }
    ));
  }
});

/**
 * GET /api/executor/shopify/callback
 * Handle Shopify OAuth callback
 */
router.get('/callback', async (req, res) => {
  try {
    const { code, shop, state, hmac } = req.query;

    logger.info('Shopify OAuth callback received', { shop, hasCode: !!code, state });

    if (!code || !shop) {
      return res.status(400).json(formatErrorResponse(
        'Missing required OAuth parameters',
        'OAUTH_CALLBACK_ERROR',
        { missing: !code ? 'code' : 'shop' }
      ));
    }

    // Validate state (in production, verify against database)
    if (state && sessionStorage.has(state)) {
      const storedData = sessionStorage.get(state);
      if (storedData.shop !== shop) {
        return res.status(400).json(formatErrorResponse(
          'State validation failed',
          'OAUTH_STATE_ERROR',
          { provided_shop: shop, expected_shop: storedData.shop }
        ));
      }
      sessionStorage.delete(state); // Clean up
    }

    // Process OAuth callback
    const session = await shopifyService.handleOAuthCallback(req.query);

    // Store session (in production, use database)
    sessionStorage.set(session.id, session);

    // Get shop information
    const shopInfo = await shopifyService.getShopInfo(session);

    logger.info('Shopify OAuth completed successfully', {
      shop: session.shop,
      sessionId: session.id,
      shopName: shopInfo.name
    });

    res.status(200).json(formatSuccessResponse({
      session_id: session.id,
      shop: session.shop,
      shop_info: {
        name: shopInfo.name,
        email: shopInfo.email,
        domain: shopInfo.domain,
        currency: shopInfo.currency,
        timezone: shopInfo.timezone
      },
      access_token: session.accessToken ? 'present' : 'missing',
      next_steps: [
        'Store the session_id for future API calls',
        'Use POST /api/executor/shopify/products to create products',
        'Use POST /api/executor/shopify/pixel to install tracking'
      ]
    }, 'Shopify OAuth completed successfully'));

  } catch (error) {
    logger.error('Shopify OAuth callback failed', error, { shop: req.query.shop });

    res.status(500).json(formatErrorResponse(
      'OAuth callback processing failed',
      'OAUTH_CALLBACK_ERROR',
      { error: error.message }
    ));
  }
});

/**
 * POST /api/executor/shopify/products
 * Create products in Shopify store
 */
router.post('/products', [
  body('session_id').notEmpty().withMessage('Session ID is required'),
  body('products').optional().isArray().withMessage('Products must be an array'),
  body('gtm_report_id').optional().isUUID().withMessage('GTM Report ID must be valid UUID')
], async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(formatErrorResponse(
        'Invalid request parameters',
        'VALIDATION_ERROR',
        errors.array()
      ));
    }

    const { session_id, products, gtm_report_id } = req.body;

    // Retrieve session
    const session = sessionStorage.get(session_id);
    if (!session) {
      return res.status(404).json(formatErrorResponse(
        'Session not found or expired',
        'SESSION_NOT_FOUND',
        { session_id }
      ));
    }

    logger.info('Product creation requested', {
      shop: session.shop,
      sessionId: session_id,
      hasCustomProducts: !!products,
      hasGtmReport: !!gtm_report_id
    });

    let createdProducts = [];

    if (gtm_report_id) {
      // Create products from GTM report
      const gtmReport = await GTMReport.findById(gtm_report_id);
      if (!gtmReport) {
        return res.status(404).json(formatErrorResponse(
          'GTM report not found',
          'REPORT_NOT_FOUND',
          { gtm_report_id }
        ));
      }

      createdProducts = await shopifyService.createProductsFromGTMReport(session, gtmReport);

    } else if (products && products.length > 0) {
      // Create custom products
      for (const productData of products) {
        try {
          const product = await shopifyService.createProduct(session, productData);
          createdProducts.push(product);
        } catch (error) {
          logger.warn('Failed to create individual product', error, {
            productTitle: productData.title
          });
        }
      }
    } else {
      return res.status(400).json(formatErrorResponse(
        'Either products array or gtm_report_id is required',
        'MISSING_PRODUCT_DATA'
      ));
    }

    logger.info('Products created successfully', {
      shop: session.shop,
      productsCreated: createdProducts.length,
      productIds: createdProducts.map(p => p.id)
    });

    res.status(200).json(formatSuccessResponse({
      shop: session.shop,
      products_created: createdProducts.length,
      products: createdProducts.map(product => ({
        id: product.id,
        title: product.title,
        handle: product.handle,
        status: product.status,
        admin_url: `https://${session.shop}/admin/products/${product.id}`,
        public_url: product.status === 'active' ?
          `https://${session.shop.replace('.myshopify.com', '')}.com/products/${product.handle}` :
          null
      }))
    }, 'Products created successfully'));

  } catch (error) {
    logger.error('Product creation failed', error, {
      sessionId: req.body.session_id,
      shop: sessionStorage.get(req.body.session_id)?.shop
    });

    res.status(500).json(formatErrorResponse(
      'Product creation failed',
      'PRODUCT_CREATION_ERROR',
      { error: error.message }
    ));
  }
});

/**
 * POST /api/executor/shopify/pixel
 * Install Meta Pixel in Shopify store
 */
router.post('/pixel', [
  body('session_id').notEmpty().withMessage('Session ID is required'),
  body('pixel_id').notEmpty().withMessage('Meta Pixel ID is required'),
  body('pixel_id').matches(/^[0-9]+$/).withMessage('Meta Pixel ID must be numeric')
], async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(formatErrorResponse(
        'Invalid request parameters',
        'VALIDATION_ERROR',
        errors.array()
      ));
    }

    const { session_id, pixel_id } = req.body;

    // Retrieve session
    const session = sessionStorage.get(session_id);
    if (!session) {
      return res.status(404).json(formatErrorResponse(
        'Session not found or expired',
        'SESSION_NOT_FOUND',
        { session_id }
      ));
    }

    logger.info('Meta Pixel installation requested', {
      shop: session.shop,
      sessionId: session_id,
      pixelId: pixel_id
    });

    // Install Meta Pixel
    const scriptTag = await shopifyService.installMetaPixel(session, pixel_id);

    logger.info('Meta Pixel installed successfully', {
      shop: session.shop,
      pixelId: pixel_id,
      scriptTagId: scriptTag.id
    });

    res.status(200).json(formatSuccessResponse({
      shop: session.shop,
      pixel_id: pixel_id,
      script_tag_id: scriptTag.id,
      installation_status: 'active',
      verification_url: `https://${session.shop.replace('.myshopify.com', '')}.com`,
      next_steps: [
        'Meta Pixel is now tracking page views on your store',
        'Test the pixel using Facebook Pixel Helper browser extension',
        'Set up custom events for purchases and add-to-cart actions'
      ]
    }, 'Meta Pixel installed successfully'));

  } catch (error) {
    logger.error('Meta Pixel installation failed', error, {
      sessionId: req.body.session_id,
      pixelId: req.body.pixel_id
    });

    res.status(500).json(formatErrorResponse(
      'Meta Pixel installation failed',
      'PIXEL_INSTALLATION_ERROR',
      { error: error.message }
    ));
  }
});

/**
 * GET /api/executor/shopify/session/:sessionId
 * Get session status and shop information
 */
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = sessionStorage.get(sessionId);
    if (!session) {
      return res.status(404).json(formatErrorResponse(
        'Session not found or expired',
        'SESSION_NOT_FOUND',
        { session_id: sessionId }
      ));
    }

    // Get current shop info
    const shopInfo = await shopifyService.getShopInfo(session);

    res.status(200).json(formatSuccessResponse({
      session_id: sessionId,
      shop: session.shop,
      is_online: session.isOnline,
      shop_info: {
        name: shopInfo.name,
        email: shopInfo.email,
        domain: shopInfo.domain,
        currency: shopInfo.currency,
        timezone: shopInfo.timezone,
        created_at: shopInfo.created_at
      },
      scopes: shopifyService.shopify.config.scopes
    }, 'Session details retrieved successfully'));

  } catch (error) {
    logger.error('Session retrieval failed', error, { sessionId: req.params.sessionId });

    res.status(500).json(formatErrorResponse(
      'Session retrieval failed',
      'SESSION_RETRIEVAL_ERROR',
      { error: error.message }
    ));
  }
});

/**
 * GET /api/executor/shopify/health
 * Health check for Shopify service
 */
router.get('/health', async (req, res) => {
  try {
    const healthStatus = await shopifyService.getHealthStatus();

    res.status(200).json(formatSuccessResponse(
      healthStatus,
      'Shopify service is operational'
    ));

  } catch (error) {
    logger.error('Shopify health check failed', error);

    res.status(500).json(formatErrorResponse(
      'Shopify service health check failed',
      'HEALTH_CHECK_ERROR',
      { error: error.message }
    ));
  }
});

module.exports = router;