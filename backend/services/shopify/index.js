/**
 * Shopify Integration Service
 * Exports all client functions for use throughout the application
 */

const {
  normalizeShopDomain,
  buildOAuthInstallUrl,
  isValidOAuthHmac,
  exchangeAdminAccessToken,
  createStorefrontAccessToken,
  fetchAdminProducts,
  mapAdminProducts,
} = require('./shopifyClient');

module.exports = {
  normalizeShopDomain,
  buildOAuthInstallUrl,
  isValidOAuthHmac,
  exchangeAdminAccessToken,
  createStorefrontAccessToken,
  fetchAdminProducts,
  mapAdminProducts,
};
