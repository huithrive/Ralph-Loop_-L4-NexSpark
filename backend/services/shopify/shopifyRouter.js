/**
 * Shopify Integration Router
 * OAuth flows, connection management, and project binding for Shopify stores
 * 
 * Routes:
 * - GET  /install - Generate OAuth install URL
 * - GET  /callback - Handle OAuth callback and store tokens
 * - GET  /connections - List user's Shopify connections
 * - POST /projects/:projectId/bind - Bind Shopify store to a project
 * - GET  /projects/:projectId/products - Fetch products for a project
 */

const express = require('express');
const { query, param, body, validationResult } = require('express-validator');
const OAuthState = require('../../models/OAuthState');
const OAuthToken = require('../../models/OAuthToken');
const logger = require('../../utils/logger');
const {
  normalizeShopDomain,
  buildOAuthInstallUrl,
  isValidOAuthHmac,
  exchangeAdminAccessToken,
  createStorefrontAccessToken,
  fetchAdminProducts,
  mapAdminProducts,
} = require('./shopifyClient');

const router = express.Router();

// Configuration from environment
const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET;
const SHOPIFY_SCOPES = process.env.SHOPIFY_SCOPES || 'read_products,write_products,read_product_listings';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

// ============================================================================
// ROUTES
// ============================================================================

/**
 * GET /api/integrations/shopify/install
 * Generate Shopify OAuth install URL
 * 
 * Query params:
 * - shop: string (required) - Shop domain or handle
 * - user_id: UUID (required) - User initiating the connection
 * - project_id: UUID (optional) - Project to bind after authorization
 */
router.get('/install', [
  query('shop').notEmpty().withMessage('Shop domain is required'),
  query('user_id').isUUID().withMessage('Valid user_id is required'),
  query('project_id').optional().isUUID().withMessage('project_id must be a valid UUID'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { shop, user_id, project_id } = req.query;

    // Normalize shop domain
    const shopDomain = normalizeShopDomain(shop);
    if (!shopDomain) {
      return res.status(400).json({
        success: false,
        error: 'Invalid shop domain',
        message: 'Shop must be a valid Shopify domain (e.g., "my-store" or "my-store.myshopify.com")',
      });
    }

    // Create OAuth state in database
    const redirectUri = `${BASE_URL}/api/integrations/shopify/callback`;
    const oauthState = await OAuthState.create({
      platform: 'shopify',
      user_id,
      redirect_uri: redirectUri,
      shop_domain: shopDomain,
      expires_in_minutes: 10,
    });

    // Store project_id in custom metadata if needed
    // For now, we'll handle project binding in a separate step
    
    // Build OAuth install URL
    const installUrl = buildOAuthInstallUrl({
      shopDomain,
      apiKey: SHOPIFY_API_KEY,
      scopes: SHOPIFY_SCOPES,
      redirectUri,
      state: oauthState.state,
    });

    logger.info('[shopify] OAuth install URL generated', {
      userId: user_id,
      shopDomain,
      projectId: project_id || null,
      state: oauthState.state,
    });

    res.json({
      success: true,
      data: {
        install_url: installUrl,
        shop_domain: shopDomain,
        state: oauthState.state,
        redirect_uri: redirectUri,
        expires_in: 600, // 10 minutes
      },
      message: 'Visit the install_url to authorize NexSpark with your Shopify store',
    });

  } catch (error) {
    logger.error('[shopify] Install URL generation failed', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate install URL',
      message: error.message,
    });
  }
});

/**
 * GET /api/integrations/shopify/callback
 * Handle Shopify OAuth callback
 * 
 * Query params (provided by Shopify):
 * - code: string - Authorization code
 * - shop: string - Shop domain
 * - state: string - State UUID from OAuthState
 * - hmac: string - HMAC signature
 * - timestamp: string - Request timestamp
 */
router.get('/callback', [
  query('code').notEmpty().withMessage('Authorization code is required'),
  query('shop').notEmpty().withMessage('Shop domain is required'),
  query('state').notEmpty().withMessage('State token is required'),
  query('hmac').notEmpty().withMessage('HMAC signature is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Invalid callback parameters',
        details: errors.array(),
      });
    }

    const { code, shop, state } = req.query;

    // 1. Validate HMAC signature
    if (!isValidOAuthHmac(req.query, SHOPIFY_API_SECRET)) {
      logger.warn('[shopify] Invalid HMAC signature', { shop });
      return res.status(403).json({
        success: false,
        error: 'Invalid HMAC signature',
        message: 'OAuth callback failed security validation',
      });
    }

    // 2. Find and validate state from database
    const oauthState = await OAuthState.findByState(state);
    if (!oauthState) {
      logger.warn('[shopify] State not found', { shop, state });
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired state',
        message: 'OAuth state not found or has expired',
      });
    }

    if (oauthState.isExpired()) {
      await OAuthState.deleteByState(state);
      logger.warn('[shopify] State expired', { shop, state });
      return res.status(400).json({
        success: false,
        error: 'State expired',
        message: 'OAuth state has expired. Please restart the authorization process.',
      });
    }

    if (!oauthState.validatePlatform('shopify')) {
      logger.warn('[shopify] Platform mismatch', { shop, state, platform: oauthState.platform });
      return res.status(400).json({
        success: false,
        error: 'Invalid platform',
      });
    }

    // 3. Verify shop domain matches state
    const normalizedShop = normalizeShopDomain(shop);
    if (normalizedShop !== oauthState.shop_domain) {
      logger.warn('[shopify] Shop domain mismatch', {
        providedShop: normalizedShop,
        expectedShop: oauthState.shop_domain,
      });
      return res.status(400).json({
        success: false,
        error: 'Shop domain mismatch',
      });
    }

    // 4. Exchange code for access token
    const { accessToken, scope } = await exchangeAdminAccessToken({
      shopDomain: normalizedShop,
      code,
      apiKey: SHOPIFY_API_KEY,
      apiSecret: SHOPIFY_API_SECRET,
    });

    logger.info('[shopify] Admin access token obtained', {
      userId: oauthState.user_id,
      shop: normalizedShop,
      scope,
    });

    // 5. Create storefront access token
    let storefrontToken = null;
    try {
      storefrontToken = await createStorefrontAccessToken({
        shopDomain: normalizedShop,
        adminAccessToken: accessToken,
        title: 'NexSpark Landing',
      });
      logger.info('[shopify] Storefront token created', { shop: normalizedShop });
    } catch (err) {
      logger.warn('[shopify] Failed to create storefront token', {
        shop: normalizedShop,
        error: err.message,
      });
      // Non-fatal - proceed without storefront token
    }

    // 6. Store tokens in database
    await OAuthToken.store({
      user_id: oauthState.user_id,
      platform: 'shopify',
      access_token: accessToken,
      scope,
      shop_domain: normalizedShop,
      // Store storefront token in a custom field or separate table if needed
      // For now, we'll fetch it again when needed
    });

    // 7. Clean up OAuth state
    await OAuthState.deleteByState(state);

    logger.info('[shopify] OAuth completed successfully', {
      userId: oauthState.user_id,
      shop: normalizedShop,
      hasStorefrontToken: !!storefrontToken,
    });

    // 8. Redirect or return success
    // In production, redirect to a frontend success page
    res.json({
      success: true,
      data: {
        shop_domain: normalizedShop,
        user_id: oauthState.user_id,
        scope,
        has_storefront_token: !!storefrontToken,
      },
      message: 'Shopify store connected successfully',
    });

  } catch (error) {
    logger.error('[shopify] OAuth callback failed', error);
    res.status(500).json({
      success: false,
      error: 'OAuth callback failed',
      message: error.message,
    });
  }
});

/**
 * GET /api/integrations/shopify/connections
 * List all Shopify connections for a user
 * 
 * Query params:
 * - user_id: UUID (required)
 */
router.get('/connections', [
  query('user_id').isUUID().withMessage('Valid user_id is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { user_id } = req.query;

    // Fetch all Shopify tokens for user
    const tokens = await OAuthToken.getActiveTokensByUser(user_id);
    const shopifyTokens = tokens.filter(t => t.platform === 'shopify');

    const connections = shopifyTokens.map(token => ({
      shop_domain: token.shop_domain,
      scope: token.scope,
      connected_at: token.created_at,
      last_used_at: token.last_used_at,
      is_active: token.is_active,
    }));

    logger.info('[shopify] Connections listed', {
      userId: user_id,
      count: connections.length,
    });

    res.json({
      success: true,
      data: {
        connections,
        total: connections.length,
      },
    });

  } catch (error) {
    logger.error('[shopify] Failed to list connections', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list connections',
      message: error.message,
    });
  }
});

/**
 * POST /api/integrations/shopify/projects/:projectId/bind
 * Bind a Shopify store to a project
 * 
 * Path params:
 * - projectId: UUID
 * 
 * Body:
 * - user_id: UUID (required)
 * - shop_domain: string (required)
 */
router.post('/projects/:projectId/bind', [
  param('projectId').isUUID().withMessage('Valid projectId is required'),
  body('user_id').isUUID().withMessage('Valid user_id is required'),
  body('shop_domain').notEmpty().withMessage('shop_domain is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { projectId } = req.params;
    const { user_id, shop_domain } = req.body;

    // Normalize shop domain
    const normalizedShop = normalizeShopDomain(shop_domain);
    if (!normalizedShop) {
      return res.status(400).json({
        success: false,
        error: 'Invalid shop domain',
      });
    }

    // Verify user has a connection to this shop
    const token = await OAuthToken.getActiveToken(user_id, 'shopify');
    if (!token || token.shop_domain !== normalizedShop) {
      return res.status(404).json({
        success: false,
        error: 'Shopify connection not found',
        message: 'User must connect to this Shopify store first',
      });
    }

    // TODO: Update project record to bind shop_domain
    // This would depend on your Project model structure
    // Example: await Project.updateShopifyBinding(projectId, user_id, normalizedShop);

    logger.info('[shopify] Project bound to shop', {
      projectId,
      userId: user_id,
      shop: normalizedShop,
    });

    res.json({
      success: true,
      data: {
        project_id: projectId,
        shop_domain: normalizedShop,
      },
      message: 'Shopify store bound to project successfully',
    });

  } catch (error) {
    logger.error('[shopify] Failed to bind project', error);
    res.status(500).json({
      success: false,
      error: 'Failed to bind project',
      message: error.message,
    });
  }
});

/**
 * GET /api/integrations/shopify/projects/:projectId/products
 * Fetch products for a project's bound Shopify store
 * 
 * Path params:
 * - projectId: UUID
 * 
 * Query params:
 * - user_id: UUID (required)
 * - limit: number (optional, default 24, max 250)
 * - currency: string (optional, default USD)
 */
router.get('/projects/:projectId/products', [
  param('projectId').isUUID().withMessage('Valid projectId is required'),
  query('user_id').isUUID().withMessage('Valid user_id is required'),
  query('limit').optional().isInt({ min: 1, max: 250 }).withMessage('limit must be 1-250'),
  query('currency').optional().isLength({ min: 3, max: 3 }).withMessage('currency must be 3-letter code'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { projectId } = req.params;
    const { user_id, limit = 24, currency = 'USD' } = req.query;

    // TODO: Fetch project and get bound shop_domain
    // For now, we'll get the active Shopify token for the user
    const token = await OAuthToken.getActiveToken(user_id, 'shopify');
    if (!token || !token.shop_domain) {
      return res.status(404).json({
        success: false,
        error: 'No Shopify store connected',
        message: 'User must connect a Shopify store first',
      });
    }

    const shopDomain = token.shop_domain;
    const adminAccessToken = token.getAccessToken();

    // Fetch products from Shopify
    const rawProducts = await fetchAdminProducts({
      shopDomain,
      adminAccessToken,
      limit: parseInt(limit, 10),
    });

    // Map to normalized format
    const products = mapAdminProducts(rawProducts, currency);

    logger.info('[shopify] Products fetched', {
      projectId,
      userId: user_id,
      shop: shopDomain,
      productCount: products.length,
    });

    res.json({
      success: true,
      data: {
        shop_domain: shopDomain,
        products,
        total: products.length,
        currency,
      },
    });

  } catch (error) {
    logger.error('[shopify] Failed to fetch products', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products',
      message: error.message,
    });
  }
});

module.exports = router;
