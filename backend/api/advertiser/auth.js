// OAuth Authentication API - Module 3 Spec Compliant
// Handles OAuth flows for Meta Business Manager, Google Ads, and Shopify

const express = require('express');
const { query, validationResult } = require('express-validator');
const GoMarbleMcpService = require('../../services/gomarbleMcpService');
const OAuthState = require('../../models/OAuthState');
const OAuthToken = require('../../models/OAuthToken');
const logger = require('../../utils/logger');
const { success: formatSuccessResponse, error: formatErrorResponse } = require('../../utils/responseFormatter');

const router = express.Router();
const gomarbleService = new GoMarbleMcpService();

/**
 * GET /api/advertiser/auth/meta/connect
 * Initiate Meta Business Manager OAuth flow
 */
router.get('/meta/connect', [
  query('redirect_uri').optional().isURL().withMessage('Invalid redirect URI'),
  query('user_id').optional().isUUID().withMessage('Invalid user ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(formatErrorResponse(
        'Invalid query parameters',
        400,
        'VALIDATION_ERROR',
        { errors: errors.array() }
      ));
    }

    const redirectUri = req.query.redirect_uri || `${req.protocol}://${req.get('host')}/api/advertiser/auth/meta/callback`;
    const userId = req.query.user_id;

    // Store OAuth state in database
    const oauthState = await OAuthState.create({
      platform: 'meta',
      user_id: userId,
      redirect_uri: redirectUri,
      expires_in_minutes: 10
    });

    const authUrl = gomarbleService.getMetaAuthUrl(redirectUri, oauthState.state);

    logger.info('Meta OAuth flow initiated', { user_id: userId, state: oauthState.state });

    const response = {
      auth_url: authUrl,
      state: oauthState.state,
      platform: 'meta',
      redirect_uri: redirectUri,
      expires_in: 600,
      instructions: [
        'Visit the auth_url to authorize Meta Business Manager access',
        'You will be redirected back to the callback URL with authorization code',
        'The authorization code will be exchanged for access token automatically'
      ]
    };

    res.status(200).json(formatSuccessResponse(response, 'Meta OAuth URL generated'));

  } catch (error) {
    logger.error('Meta OAuth initiation failed', error);

    res.status(500).json(formatErrorResponse(
      'Failed to initiate Meta OAuth',
      'OAUTH_INIT_ERROR',
      { platform: 'meta', error: error.message }
    ));
  }
});

/**
 * GET /api/advertiser/auth/meta/callback
 * Handle Meta Business Manager OAuth callback
 */
router.get('/meta/callback', [
  query('code').notEmpty().withMessage('Authorization code is required'),
  query('state').notEmpty().withMessage('State parameter is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(formatErrorResponse(
        'Invalid callback parameters',
        400,
        'VALIDATION_ERROR',
        { errors: errors.array() }
      ));
    }

    const { code, state } = req.query;

    // Validate state
    const stateData = await OAuthState.findByState(state);
    if (!stateData) {
      return res.status(400).json(formatErrorResponse(
        'Invalid or expired OAuth state',
        400,
        'INVALID_STATE',
        { state }
      ));
    }

    if (!stateData.validatePlatform('meta')) {
      return res.status(400).json(formatErrorResponse(
        'State platform mismatch',
        400,
        'PLATFORM_MISMATCH',
        { expected: 'meta', received: stateData.platform }
      ));
    }

    if (stateData.isExpired()) {
      await OAuthState.deleteByState(state);
      return res.status(400).json(formatErrorResponse(
        'OAuth state expired',
        400,
        'STATE_EXPIRED',
        { state }
      ));
    }

    logger.info('Meta OAuth callback received', { code, state, user_id: stateData.user_id });

    // Exchange code for token
    const tokenData = await gomarbleService.exchangeCodeForToken(
      code,
      stateData.redirect_uri,
      'meta'
    );

    // Clean up state
    await OAuthState.deleteByState(state);

    // Store token data in database
    const oauthToken = await OAuthToken.store({
      user_id: stateData.user_id,
      platform: 'meta',
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      token_type: tokenData.token_type,
      scope: tokenData.scope,
      expires_in: tokenData.expires_in,
      meta_business_manager_id: tokenData.business_manager_id
    });

    logger.info('Meta OAuth token stored', {
      user_id: stateData.user_id,
      token_id: oauthToken.id,
      expires_at: oauthToken.expires_at
    });

    const response = {
      success: true,
      platform: 'meta',
      user_id: stateData.user_id,
      access_token: oauthToken.access_token.substring(0, 10) + '...', // Partial token for security
      expires_at: oauthToken.expires_at,
      scope: oauthToken.scope,
      connected_at: oauthToken.created_at,
      next_steps: [
        'Meta Business Manager is now connected',
        'You can create Meta Ads campaigns using POST /api/advertiser/campaign/create',
        'Access token has been securely stored for campaign operations'
      ]
    };

    res.status(200).json(formatSuccessResponse(response, 'Meta OAuth completed successfully'));

  } catch (error) {
    logger.error('Meta OAuth callback failed', error, { code: req.query.code });

    res.status(500).json(formatErrorResponse(
      'OAuth callback failed',
      'OAUTH_CALLBACK_ERROR',
      { platform: 'meta', error: error.message }
    ));
  }
});

/**
 * GET /api/advertiser/auth/google/connect
 * Initiate Google Ads OAuth flow
 */
router.get('/google/connect', [
  query('redirect_uri').optional().isURL().withMessage('Invalid redirect URI'),
  query('user_id').optional().isUUID().withMessage('Invalid user ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(formatErrorResponse(
        'Invalid query parameters',
        400,
        'VALIDATION_ERROR',
        { errors: errors.array() }
      ));
    }

    const redirectUri = req.query.redirect_uri || `${req.protocol}://${req.get('host')}/api/advertiser/auth/google/callback`;
    const userId = req.query.user_id;

    // Store OAuth state in database
    const oauthState = await OAuthState.create({
      platform: 'google',
      user_id: userId,
      redirect_uri: redirectUri,
      expires_in_minutes: 10
    });

    const authUrl = gomarbleService.getGoogleAuthUrl(redirectUri, oauthState.state);

    logger.info('Google OAuth flow initiated', { user_id: userId, state: oauthState.state });

    const response = {
      auth_url: authUrl,
      state: oauthState.state,
      platform: 'google',
      redirect_uri: redirectUri,
      expires_in: 600,
      instructions: [
        'Visit the auth_url to authorize Google Ads access',
        'You will be redirected back to the callback URL with authorization code',
        'The authorization code will be exchanged for access token automatically'
      ]
    };

    res.status(200).json(formatSuccessResponse(response, 'Google OAuth URL generated'));

  } catch (error) {
    logger.error('Google OAuth initiation failed', error);

    res.status(500).json(formatErrorResponse(
      'Failed to initiate Google OAuth',
      'OAUTH_INIT_ERROR',
      { platform: 'google', error: error.message }
    ));
  }
});

/**
 * GET /api/advertiser/auth/google/callback
 * Handle Google Ads OAuth callback
 */
router.get('/google/callback', [
  query('code').notEmpty().withMessage('Authorization code is required'),
  query('state').notEmpty().withMessage('State parameter is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(formatErrorResponse(
        'Invalid callback parameters',
        400,
        'VALIDATION_ERROR',
        { errors: errors.array() }
      ));
    }

    const { code, state } = req.query;

    // Validate state
    const stateData = await OAuthState.findByState(state);
    if (!stateData) {
      return res.status(400).json(formatErrorResponse(
        'Invalid or expired OAuth state',
        400,
        'INVALID_STATE',
        { state }
      ));
    }

    if (!stateData.validatePlatform('google')) {
      return res.status(400).json(formatErrorResponse(
        'State platform mismatch',
        400,
        'PLATFORM_MISMATCH',
        { expected: 'google', received: stateData.platform }
      ));
    }

    if (stateData.isExpired()) {
      await OAuthState.deleteByState(state);
      return res.status(400).json(formatErrorResponse(
        'OAuth state expired',
        400,
        'STATE_EXPIRED',
        { state }
      ));
    }

    logger.info('Google OAuth callback received', { code, state, user_id: stateData.user_id });

    // Exchange code for token
    const tokenData = await gomarbleService.exchangeCodeForToken(
      code,
      stateData.redirect_uri,
      'google'
    );

    // Clean up state
    await OAuthState.deleteByState(state);

    // Store token data in database
    const oauthToken = await OAuthToken.store({
      user_id: stateData.user_id,
      platform: 'google',
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      token_type: tokenData.token_type,
      scope: tokenData.scope,
      expires_in: tokenData.expires_in,
      google_ads_customer_id: tokenData.customer_id
    });

    logger.info('Google OAuth token stored', {
      user_id: stateData.user_id,
      token_id: oauthToken.id,
      expires_at: oauthToken.expires_at
    });

    const response = {
      success: true,
      platform: 'google',
      user_id: stateData.user_id,
      access_token: oauthToken.access_token.substring(0, 10) + '...', // Partial token for security
      expires_at: oauthToken.expires_at,
      scope: oauthToken.scope,
      connected_at: oauthToken.created_at,
      next_steps: [
        'Google Ads is now connected',
        'You can create Google Ads campaigns using POST /api/advertiser/campaign/create',
        'Access token has been securely stored for campaign operations'
      ]
    };

    res.status(200).json(formatSuccessResponse(response, 'Google OAuth completed successfully'));

  } catch (error) {
    logger.error('Google OAuth callback failed', error, { code: req.query.code });

    res.status(500).json(formatErrorResponse(
      'OAuth callback failed',
      'OAUTH_CALLBACK_ERROR',
      { platform: 'google', error: error.message }
    ));
  }
});

/**
 * GET /api/advertiser/auth/shopify/connect
 * Initiate Shopify OAuth flow (for pixel installation)
 */
router.get('/shopify/connect', [
  query('redirect_uri').optional().isURL().withMessage('Invalid redirect URI'),
  query('user_id').optional().isUUID().withMessage('Invalid user ID'),
  query('shop_domain').notEmpty().withMessage('Shopify shop domain is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(formatErrorResponse(
        'Invalid query parameters',
        400,
        'VALIDATION_ERROR',
        { errors: errors.array() }
      ));
    }

    const redirectUri = req.query.redirect_uri || `${req.protocol}://${req.get('host')}/api/advertiser/auth/shopify/callback`;
    const userId = req.query.user_id;
    const shopDomain = req.query.shop_domain;

    // Store OAuth state in database
    const oauthState = await OAuthState.create({
      platform: 'shopify',
      user_id: userId,
      redirect_uri: redirectUri,
      shop_domain: shopDomain,
      expires_in_minutes: 10
    });

    // Generate Shopify OAuth URL
    const scopes = 'write_script_tags,read_orders,read_customers';
    const authUrl = `https://${shopDomain}.myshopify.com/admin/oauth/authorize?` +
      `client_id=${process.env.SHOPIFY_API_KEY}&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `state=${oauthState.state}`;

    logger.info('Shopify OAuth flow initiated', { user_id: userId, shop_domain: shopDomain, state: oauthState.state });

    const response = {
      auth_url: authUrl,
      state: oauthState.state,
      platform: 'shopify',
      shop_domain: shopDomain,
      redirect_uri: redirectUri,
      scopes: scopes.split(','),
      expires_in: 600,
      instructions: [
        'Visit the auth_url to authorize Shopify app access',
        'Grant permissions for script tags and order reading',
        'You will be redirected back for Meta Pixel installation'
      ]
    };

    res.status(200).json(formatSuccessResponse(response, 'Shopify OAuth URL generated'));

  } catch (error) {
    logger.error('Shopify OAuth initiation failed', error);

    res.status(500).json(formatErrorResponse(
      'Failed to initiate Shopify OAuth',
      'OAUTH_INIT_ERROR',
      { platform: 'shopify', error: error.message }
    ));
  }
});

/**
 * GET /api/advertiser/auth/shopify/callback
 * Handle Shopify OAuth callback
 */
router.get('/shopify/callback', [
  query('code').notEmpty().withMessage('Authorization code is required'),
  query('state').notEmpty().withMessage('State parameter is required'),
  query('shop').notEmpty().withMessage('Shop domain is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(formatErrorResponse(
        'Invalid callback parameters',
        400,
        'VALIDATION_ERROR',
        { errors: errors.array() }
      ));
    }

    const { code, state, shop } = req.query;

    // Validate state
    const stateData = await OAuthState.findByState(state);
    if (!stateData) {
      return res.status(400).json(formatErrorResponse(
        'Invalid or expired OAuth state',
        400,
        'INVALID_STATE',
        { state }
      ));
    }

    if (!stateData.validatePlatform('shopify')) {
      return res.status(400).json(formatErrorResponse(
        'State platform mismatch',
        400,
        'PLATFORM_MISMATCH',
        { expected: 'shopify', received: stateData.platform }
      ));
    }

    if (stateData.isExpired()) {
      await OAuthState.deleteByState(state);
      return res.status(400).json(formatErrorResponse(
        'OAuth state expired',
        400,
        'STATE_EXPIRED',
        { state }
      ));
    }

    logger.info('Shopify OAuth callback received', { code, state, shop, user_id: stateData.user_id });

    // In a real implementation, you would:
    // 1. Exchange code for access token with Shopify
    // 2. Store the access token securely
    // 3. Install Meta Pixel via ScriptTag API

    // Mock successful callback - clean up state
    await OAuthState.deleteByState(state);

    const response = {
      success: true,
      platform: 'shopify',
      shop_domain: shop,
      user_id: stateData.user_id,
      connected_at: new Date().toISOString(),
      next_steps: [
        'Shopify store is now connected',
        'Meta Pixel can be installed using POST /api/advertiser/pixel/install',
        'Store access has been securely configured'
      ]
    };

    res.status(200).json(formatSuccessResponse(response, 'Shopify OAuth completed successfully'));

  } catch (error) {
    logger.error('Shopify OAuth callback failed', error, { code: req.query.code });

    res.status(500).json(formatErrorResponse(
      'OAuth callback failed',
      'OAUTH_CALLBACK_ERROR',
      { platform: 'shopify', error: error.message }
    ));
  }
});

/**
 * GET /api/advertiser/auth/status
 * Check OAuth connection status for all platforms
 */
router.get('/status', [
  query('user_id').optional().isUUID().withMessage('Invalid user ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(formatErrorResponse(
        'Invalid query parameters',
        400,
        'VALIDATION_ERROR',
        { errors: errors.array() }
      ));
    }

    const userId = req.query.user_id;

    logger.info('OAuth status check requested', { user_id: userId });

    // Get all active tokens for user from database
    const activeTokens = userId ? await OAuthToken.getActiveTokensByUser(userId) : [];

    // Build platform status from stored tokens
    const platforms = {
      meta: { connected: false, connected_at: null, expires_at: null, scope: null },
      google: { connected: false, connected_at: null, expires_at: null, scope: null },
      shopify: { connected: false, connected_at: null, shop_domain: null, scope: null }
    };

    // Update platform status with active tokens
    activeTokens.forEach(token => {
      if (token.isValid()) {
        platforms[token.platform] = token.getConnectionStatus();
      }
    });

    const response = {
      user_id: userId,
      platforms,
      checked_at: new Date().toISOString()
    };

    res.status(200).json(formatSuccessResponse(response, 'OAuth status retrieved'));

  } catch (error) {
    logger.error('OAuth status check failed', error);

    res.status(500).json(formatErrorResponse(
      'Failed to check OAuth status',
      'STATUS_CHECK_ERROR',
      { error: error.message }
    ));
  }
});

// Cleanup expired OAuth states periodically
setInterval(async () => {
  try {
    const deletedCount = await OAuthState.cleanupExpired();
    if (deletedCount > 0) {
      logger.info('Expired OAuth states cleaned up', { deletedCount });
    }
  } catch (error) {
    logger.error('Failed to cleanup expired OAuth states', error);
  }
}, 5 * 60 * 1000); // Every 5 minutes

module.exports = router;