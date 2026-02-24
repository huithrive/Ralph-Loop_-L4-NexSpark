/**
 * Shopify Integration Client
 * Core functions for OAuth, product fetching, and data normalization
 */

const crypto = require('crypto');

// Constants
const SHOP_DOMAIN_PATTERN = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/;
const SHOP_HANDLE_PATTERN = /^[a-z0-9][a-z0-9-]*$/;
const HTML_TAG_PATTERN = /<[^>]+>/g;

const CURRENCY_SYMBOLS = {
  USD: '$',
  CAD: '$',
  AUD: '$',
  NZD: '$',
  EUR: 'EUR ',
  GBP: 'GBP ',
  JPY: 'JPY ',
};

const DEFAULT_API_VERSION = '2024-10';

/**
 * Normalize a shop domain input to canonical myshopify.com format
 * Handles:
 * - Plain handles: "demo-store" → "demo-store.myshopify.com"
 * - Full domains: "demo-store.myshopify.com" → "demo-store.myshopify.com"
 * - Admin URLs: "https://admin.shopify.com/store/demo-store" → "demo-store.myshopify.com"
 * - URLs with/without scheme: "https://demo-store.myshopify.com" → "demo-store.myshopify.com"
 * 
 * @param {string|null|undefined} raw - Raw shop identifier
 * @returns {string|null} Normalized domain or null if invalid
 */
function normalizeShopDomain(raw) {
  if (!raw) return null;
  
  const value = raw.trim().toLowerCase();
  if (!value) return null;

  // Support short store handle input like "demo-store"
  if (!value.includes('://') && !value.includes('/') && 
      !value.includes('?') && !value.includes('#')) {
    if (SHOP_DOMAIN_PATTERN.test(value)) return value;
    if (SHOP_HANDLE_PATTERN.test(value)) return `${value}.myshopify.com`;
  }

  // Parse as URL
  const hasScheme = value.includes('://');
  let parsed;
  try {
    parsed = new URL(hasScheme ? value : `https://${value}`);
  } catch {
    return null;
  }

  const host = (parsed.hostname || '').trim().replace(/\.$/, '');
  if (!host) return null;

  if (SHOP_DOMAIN_PATTERN.test(host)) return host;
  if (!hasScheme && SHOP_HANDLE_PATTERN.test(host)) {
    return `${host}.myshopify.com`;
  }

  // Support Shopify admin URL format: https://admin.shopify.com/store/<handle>
  if (host === 'admin.shopify.com') {
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length >= 2 && parts[0] === 'store') {
      const handle = parts[1];
      if (SHOP_HANDLE_PATTERN.test(handle)) {
        return `${handle}.myshopify.com`;
      }
    }
  }

  return null;
}

/**
 * Build Shopify OAuth install URL
 * 
 * @param {Object} params
 * @param {string} params.shopDomain - Normalized shop domain
 * @param {string} params.apiKey - Shopify app API key
 * @param {string} params.scopes - Comma-separated scope list
 * @param {string} params.redirectUri - OAuth callback URL
 * @param {string} params.state - State parameter (JWT token)
 * @returns {string} OAuth authorization URL
 */
function buildOAuthInstallUrl({ shopDomain, apiKey, scopes, redirectUri, state }) {
  const params = new URLSearchParams({
    client_id: apiKey,
    scope: scopes,
    redirect_uri: redirectUri,
    state,
  });
  return `https://${shopDomain}/admin/oauth/authorize?${params.toString()}`;
}

/**
 * Validate OAuth callback HMAC signature
 * 
 * @param {Object} queryParams - Query parameters from OAuth callback
 * @param {string} apiSecret - Shopify app API secret
 * @returns {boolean} True if HMAC is valid
 */
function isValidOAuthHmac(queryParams, apiSecret) {
  const providedHmac = queryParams.hmac;
  if (!providedHmac) return false;

  // Build payload from sorted params (exclude hmac and signature)
  const payload = Object.keys(queryParams)
    .filter(key => key !== 'hmac' && key !== 'signature')
    .sort()
    .map(key => `${key}=${queryParams[key]}`)
    .join('&');

  // Compute HMAC-SHA256
  const digest = crypto
    .createHmac('sha256', apiSecret)
    .update(payload)
    .digest('hex');

  // Constant-time comparison
  return crypto.timingSafeEqual(
    Buffer.from(digest),
    Buffer.from(providedHmac)
  );
}

/**
 * Exchange authorization code for admin access token
 * 
 * @param {Object} params
 * @param {string} params.shopDomain - Shop domain
 * @param {string} params.code - Authorization code from OAuth callback
 * @param {string} params.apiKey - Shopify app API key
 * @param {string} params.apiSecret - Shopify app API secret
 * @returns {Promise<{accessToken: string, scope: string|null}>}
 */
async function exchangeAdminAccessToken({ shopDomain, code, apiKey, apiSecret }) {
  const url = `https://${shopDomain}/admin/oauth/access_token`;
  const payload = {
    client_id: apiKey,
    client_secret: apiSecret,
    code,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Shopify OAuth token exchange failed: ${response.status} ${text}`);
  }

  const body = await response.json();
  const accessToken = body.access_token;
  
  if (typeof accessToken !== 'string' || !accessToken) {
    throw new Error('Shopify OAuth response missing access_token');
  }

  const scope = typeof body.scope === 'string' ? body.scope : null;
  return { accessToken, scope };
}

/**
 * Create a Storefront API access token using Admin API
 * 
 * @param {Object} params
 * @param {string} params.shopDomain - Shop domain
 * @param {string} params.adminAccessToken - Admin API access token
 * @param {string} [params.title='NexSpark Landing'] - Token title
 * @param {string} [params.apiVersion] - Shopify API version (defaults to env or 2024-10)
 * @returns {Promise<string>} Storefront access token
 */
async function createStorefrontAccessToken({ 
  shopDomain, 
  adminAccessToken, 
  title = 'NexSpark Landing',
  apiVersion = process.env.SHOPIFY_API_VERSION || DEFAULT_API_VERSION,
}) {
  const url = `https://${shopDomain}/admin/api/${apiVersion}/graphql.json`;
  
  const mutation = `
    mutation StorefrontAccessTokenCreate($input: StorefrontAccessTokenInput!) {
      storefrontAccessTokenCreate(input: $input) {
        storefrontAccessToken {
          accessToken
          title
        }
        userErrors {
          field
          message
        }
      }
    }
  `.trim();

  const payload = {
    query: mutation,
    variables: { input: { title } },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'X-Shopify-Access-Token': adminAccessToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Shopify storefront token request failed: ${response.status} ${text}`);
  }

  const body = await response.json();

  // Check for GraphQL errors
  if (body.errors && Array.isArray(body.errors) && body.errors.length > 0) {
    throw new Error(`Shopify storefront token error: ${JSON.stringify(body.errors)}`);
  }

  const createPayload = body.data?.storefrontAccessTokenCreate || {};
  const userErrors = createPayload.userErrors;
  
  if (Array.isArray(userErrors) && userErrors.length > 0) {
    throw new Error(`Shopify storefront token user error: ${JSON.stringify(userErrors)}`);
  }

  const token = createPayload.storefrontAccessToken?.accessToken;
  
  if (typeof token !== 'string' || !token) {
    throw new Error('Shopify storefront token response missing accessToken');
  }

  return token;
}

/**
 * Fetch products from Shopify Admin API
 * 
 * @param {Object} params
 * @param {string} params.shopDomain - Shop domain
 * @param {string} params.adminAccessToken - Admin API access token
 * @param {number} [params.limit=24] - Max products to fetch (1-250)
 * @param {string} [params.apiVersion] - Shopify API version
 * @returns {Promise<Array<Object>>} Raw product data from Shopify
 */
async function fetchAdminProducts({ 
  shopDomain, 
  adminAccessToken, 
  limit = 24,
  apiVersion = process.env.SHOPIFY_API_VERSION || DEFAULT_API_VERSION,
}) {
  const boundedLimit = Math.max(1, Math.min(limit, 250));
  const url = `https://${shopDomain}/admin/api/${apiVersion}/products.json`;
  
  const params = new URLSearchParams({
    limit: String(boundedLimit),
    status: 'active',
  });

  const response = await fetch(`${url}?${params}`, {
    method: 'GET',
    headers: {
      'X-Shopify-Access-Token': adminAccessToken,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Shopify products fetch failed: ${response.status} ${text}`);
  }

  const body = await response.json();
  const products = body.products;
  
  if (!Array.isArray(products)) return [];
  return products.filter(p => typeof p === 'object' && p !== null);
}

/**
 * Map raw Shopify admin products to normalized format
 * 
 * @param {Array<Object>} rawProducts - Raw products from Admin API
 * @param {string} [currency='USD'] - Currency code for price formatting
 * @returns {Array<Object>} Normalized product objects
 */
function mapAdminProducts(rawProducts, currency = 'USD') {
  const mapped = [];

  for (const product of rawProducts) {
    const variantsRaw = product.variants;
    if (!Array.isArray(variantsRaw) || variantsRaw.length === 0) continue;

    const imagesRaw = product.images;
    const imagesList = Array.isArray(imagesRaw) ? imagesRaw : [];
    
    // Build image lookup by ID
    const imageById = {};
    for (const img of imagesList) {
      if (typeof img === 'object' && img !== null && img.id != null) {
        imageById[String(img.id)] = img;
      }
    }

    // Map variants
    const variants = [];
    for (const variant of variantsRaw) {
      if (typeof variant !== 'object' || variant === null) continue;

      const variantId = _toShopifyGid(variant.id, 'ProductVariant');
      if (!variantId) continue;

      const variantPrice = _toFloat(variant.price);
      const comparePrice = _toFloat(variant.compare_at_price);

      // Find variant image
      let variantImage = null;
      const imageId = variant.image_id;
      if (imageId != null) {
        const variantImgObj = imageById[String(imageId)];
        if (typeof variantImgObj === 'object' && typeof variantImgObj.src === 'string') {
          variantImage = variantImgObj.src;
        }
      }

      const variantObj = {
        id: variantId,
        title: variant.title || 'Default',
        price: variantPrice,
        priceFormatted: _formatMoney(variantPrice, currency),
        available: _variantAvailable(variant),
        image: variantImage,
      };

      if (comparePrice !== null) {
        variantObj.compareAtPrice = comparePrice;
        variantObj.compareAtPriceFormatted = _formatMoney(comparePrice, currency);
      }

      variants.push(variantObj);
    }

    if (variants.length === 0) continue;

    // Use first variant for default pricing
    const firstVariant = variants[0];
    const price = firstVariant.price;
    const compareAt = firstVariant.compareAtPrice || null;

    const imageList = _mapImages(imagesList, product.title);
    const tags = _splitTags(product.tags);

    const productObj = {
      id: _toStrId(product.id) || '',
      handle: product.handle || '',
      title: product.title || 'Untitled Product',
      description: _toPlainText(product.body_html),
      descriptionHtml: product.body_html || '',
      price,
      priceFormatted: _formatMoney(price, currency),
      compareAtPrice: compareAt,
      compareAtPriceFormatted: compareAt !== null ? _formatMoney(compareAt, currency) : null,
      image: imageList.length > 0 ? imageList[0].src : '',
      images: imageList,
      variants,
      defaultVariantId: firstVariant.id,
      available: variants.some(v => v.available),
      tags,
      productType: product.product_type || '',
      vendor: product.vendor || '',
      status: product.status || '',
    };

    mapped.push(productObj);
  }

  return mapped;
}

// ============================================================================
// Private helper functions
// ============================================================================

/**
 * Convert value to string ID
 */
function _toStrId(value) {
  if (value == null) return null;
  return String(value);
}

/**
 * Convert numeric ID to Shopify GID format
 * @param {*} value - ID value
 * @param {string} resource - Resource type (e.g., 'ProductVariant')
 * @returns {string|null}
 */
function _toShopifyGid(value, resource) {
  const raw = _toStrId(value);
  if (raw === null) return null;

  // Already in GID format
  if (raw.startsWith('gid://shopify/')) return raw;

  // Convert numeric ID to GID
  if (/^\d+$/.test(raw)) {
    return `gid://shopify/${resource}/${raw}`;
  }

  return raw;
}

/**
 * Convert value to float, return 0.0 on error
 */
function _toFloat(value) {
  if (value == null) return 0.0;
  const num = parseFloat(value);
  return isNaN(num) ? 0.0 : num;
}

/**
 * Strip HTML tags and normalize whitespace
 */
function _toPlainText(value) {
  if (typeof value !== 'string') return '';
  
  // Remove HTML tags
  let noTags = value.replace(HTML_TAG_PATTERN, ' ');
  
  // Decode HTML entities (basic implementation)
  noTags = noTags
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  
  // Normalize whitespace
  return noTags.replace(/\s+/g, ' ').trim();
}

/**
 * Split comma-separated tags
 */
function _splitTags(value) {
  if (typeof value !== 'string') return [];
  return value.split(',').map(t => t.trim()).filter(Boolean);
}

/**
 * Check if variant is available for purchase
 */
function _variantAvailable(variant) {
  // Explicit available flag
  if (typeof variant.available === 'boolean') {
    return variant.available;
  }

  // "continue" inventory policy means always available
  if (variant.inventory_policy === 'continue') {
    return true;
  }

  // Check inventory quantity
  const quantity = variant.inventory_quantity;
  if (typeof quantity === 'number') {
    return quantity > 0;
  }

  // Default to available
  return true;
}

/**
 * Format money with currency symbol
 */
function _formatMoney(value, currency) {
  const normalized = value == null ? 0.0 : parseFloat(value);
  const code = (currency || 'USD').toUpperCase();
  const symbol = CURRENCY_SYMBOLS[code] || `${code} `;
  return `${symbol}${normalized.toFixed(2)}`;
}

/**
 * Map images to normalized format
 */
function _mapImages(images, fallbackAlt) {
  const mapped = [];
  
  for (const image of images) {
    if (typeof image !== 'object' || image === null) continue;
    
    const src = image.src;
    if (typeof src !== 'string' || !src) continue;

    let alt = image.alt;
    if (typeof alt !== 'string' || !alt.trim()) {
      alt = typeof fallbackAlt === 'string' ? fallbackAlt : '';
    }

    mapped.push({ src, altText: alt });
  }

  return mapped;
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  normalizeShopDomain,
  buildOAuthInstallUrl,
  isValidOAuthHmac,
  exchangeAdminAccessToken,
  createStorefrontAccessToken,
  fetchAdminProducts,
  mapAdminProducts,
};
