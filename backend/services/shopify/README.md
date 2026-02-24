# Shopify Integration Module

Node.js port of the Shopify integration from the Python reference implementation.

## Features

- **OAuth 2.0 Flow**: Complete Shopify app installation and authorization
- **Domain Normalization**: Smart parsing of shop domains, handles, and admin URLs
- **Token Management**: Admin and Storefront API token generation and storage
- **Product Fetching**: Fetch and normalize product data from Shopify Admin API
- **Security**: HMAC validation for OAuth callbacks

## Files

- **shopifyClient.js** - Core client functions (OAuth, products, normalization)
- **index.js** - Module exports
- **shopifyRouter.js** - Express router with REST endpoints
- **README.md** - This file

## Environment Variables

```bash
# Required
SHOPIFY_API_KEY=your_app_api_key
SHOPIFY_API_SECRET=your_app_api_secret
JWT_SECRET=your_jwt_secret

# Optional
SHOPIFY_SCOPES=read_products,write_products,read_product_listings
SHOPIFY_API_VERSION=2024-10
BASE_URL=http://localhost:3001
```

## API Endpoints

### 1. Generate Install URL

```http
GET /api/integrations/shopify/install?shop=my-store&user_id=uuid
```

**Query Parameters:**
- `shop` (required): Shop domain or handle (e.g., `my-store` or `my-store.myshopify.com`)
- `user_id` (required): User UUID
- `project_id` (optional): Project UUID to bind after authorization

**Response:**
```json
{
  "success": true,
  "data": {
    "install_url": "https://my-store.myshopify.com/admin/oauth/authorize?...",
    "shop_domain": "my-store.myshopify.com",
    "state": "uuid-state-token",
    "redirect_uri": "http://localhost:3001/api/integrations/shopify/callback",
    "expires_in": 600
  },
  "message": "Visit the install_url to authorize NexSpark with your Shopify store"
}
```

### 2. OAuth Callback (Automatic)

```http
GET /api/integrations/shopify/callback?code=xxx&shop=my-store.myshopify.com&state=xxx&hmac=xxx
```

Shopify redirects here after user authorizes the app. The endpoint:
1. Validates HMAC signature
2. Verifies state token
3. Exchanges code for access token
4. Creates storefront access token
5. Stores tokens in database

**Response:**
```json
{
  "success": true,
  "data": {
    "shop_domain": "my-store.myshopify.com",
    "user_id": "uuid",
    "scope": "read_products,write_products",
    "has_storefront_token": true
  },
  "message": "Shopify store connected successfully"
}
```

### 3. List Connections

```http
GET /api/integrations/shopify/connections?user_id=uuid
```

**Response:**
```json
{
  "success": true,
  "data": {
    "connections": [
      {
        "shop_domain": "my-store.myshopify.com",
        "scope": "read_products,write_products",
        "connected_at": "2024-01-24T10:00:00Z",
        "last_used_at": "2024-01-24T12:00:00Z",
        "is_active": true
      }
    ],
    "total": 1
  }
}
```

### 4. Bind Store to Project

```http
POST /api/integrations/shopify/projects/:projectId/bind
Content-Type: application/json

{
  "user_id": "uuid",
  "shop_domain": "my-store.myshopify.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "project_id": "uuid",
    "shop_domain": "my-store.myshopify.com"
  },
  "message": "Shopify store bound to project successfully"
}
```

### 5. Fetch Project Products

```http
GET /api/integrations/shopify/projects/:projectId/products?user_id=uuid&limit=24&currency=USD
```

**Query Parameters:**
- `user_id` (required): User UUID
- `limit` (optional): Number of products (1-250, default 24)
- `currency` (optional): Currency code (default USD)

**Response:**
```json
{
  "success": true,
  "data": {
    "shop_domain": "my-store.myshopify.com",
    "products": [
      {
        "id": "12345",
        "handle": "cool-product",
        "title": "Cool Product",
        "description": "A plain text description",
        "descriptionHtml": "<p>HTML description</p>",
        "price": 29.99,
        "priceFormatted": "$29.99",
        "compareAtPrice": 39.99,
        "compareAtPriceFormatted": "$39.99",
        "image": "https://cdn.shopify.com/...",
        "images": [
          { "src": "https://...", "altText": "Product image" }
        ],
        "variants": [
          {
            "id": "gid://shopify/ProductVariant/67890",
            "title": "Default",
            "price": 29.99,
            "priceFormatted": "$29.99",
            "available": true,
            "image": "https://..."
          }
        ],
        "defaultVariantId": "gid://shopify/ProductVariant/67890",
        "available": true,
        "tags": ["summer", "sale"],
        "productType": "T-Shirt",
        "vendor": "Cool Brand",
        "status": "active"
      }
    ],
    "total": 24,
    "currency": "USD"
  }
}
```

## Client Functions

### normalizeShopDomain(raw)

Normalize shop domain input to canonical `myshopify.com` format.

```javascript
const { normalizeShopDomain } = require('./services/shopify');

normalizeShopDomain('demo-store'); // => 'demo-store.myshopify.com'
normalizeShopDomain('demo-store.myshopify.com'); // => 'demo-store.myshopify.com'
normalizeShopDomain('https://admin.shopify.com/store/demo-store'); // => 'demo-store.myshopify.com'
normalizeShopDomain('invalid'); // => null
```

### buildOAuthInstallUrl({ shopDomain, apiKey, scopes, redirectUri, state })

Build Shopify OAuth authorization URL.

### isValidOAuthHmac(queryParams, apiSecret)

Validate HMAC signature from Shopify OAuth callback.

### exchangeAdminAccessToken({ shopDomain, code, apiKey, apiSecret })

Exchange authorization code for admin access token.

Returns: `{ accessToken, scope }`

### createStorefrontAccessToken({ shopDomain, adminAccessToken, title })

Create a Storefront API access token using Admin API.

Returns: `storefrontToken` (string)

### fetchAdminProducts({ shopDomain, adminAccessToken, limit })

Fetch products from Shopify Admin API.

Returns: Array of raw product objects

### mapAdminProducts(rawProducts, currency)

Map raw Shopify products to normalized format.

Returns: Array of normalized product objects with:
- Consistent field names
- Parsed prices
- Formatted money
- Shopify GID variant IDs
- Flattened image structure

## Domain Normalization Patterns

The `normalizeShopDomain()` function handles:

```javascript
// Short handles
"my-store" → "my-store.myshopify.com"

// Full domains
"my-store.myshopify.com" → "my-store.myshopify.com"

// URLs with scheme
"https://my-store.myshopify.com" → "my-store.myshopify.com"

// Admin URLs
"https://admin.shopify.com/store/my-store" → "my-store.myshopify.com"

// Invalid inputs
"invalid!" → null
```

## Product Mapping

Raw Shopify product data is normalized to:

- **Prices**: Parsed as floats, formatted with currency symbols
- **Variant IDs**: Converted to GID format (`gid://shopify/ProductVariant/123`)
- **Descriptions**: HTML stripped for plain text, kept as HTML in `descriptionHtml`
- **Images**: Mapped with `src` and `altText`
- **Availability**: Calculated from inventory and policy
- **Tags**: Split from comma-separated string to array

## Mounting the Router

Add to `server.js`:

```javascript
const shopifyIntegrationRouter = require('./services/shopify/shopifyRouter');
app.use('/api/integrations/shopify', shopifyIntegrationRouter);
```

## Database Models

Requires:
- `OAuthState` - Temporary state storage for OAuth flow
- `OAuthToken` - Persistent token storage with `shop_domain` field

## Security Notes

- **HMAC Validation**: All OAuth callbacks are validated with HMAC-SHA256
- **State Expiration**: OAuth states expire after 10 minutes
- **Constant-Time Comparison**: HMAC digest compared using `crypto.timingSafeEqual`
- **Scope Tracking**: Actual granted scopes stored with token

## Error Handling

All functions throw descriptive errors:
- Network errors from Shopify API
- Invalid HMAC signatures
- Missing/malformed tokens in responses
- Validation errors

## Testing

Test domain normalization:
```javascript
const { normalizeShopDomain } = require('./services/shopify');

console.log(normalizeShopDomain('test-store')); // => 'test-store.myshopify.com'
```

Test OAuth flow:
1. Call `/install` endpoint
2. Visit the `install_url`
3. Authorize the app
4. Get redirected to `/callback`
5. Check `OAuthToken` database for stored token

## Differences from Python Implementation

1. **State Storage**: Uses database (`OAuthState` model) instead of JWT for state
2. **Async/Await**: All functions use native async/await
3. **Fetch API**: Uses native `fetch` instead of `httpx`
4. **Crypto**: Uses native `crypto` module for HMAC
5. **Express**: REST endpoints instead of FastAPI
6. **CommonJS**: Uses `require`/`module.exports` instead of ES modules

## Future Enhancements

- [ ] Store storefront token separately
- [ ] Project binding database integration
- [ ] Webhook handlers for product updates
- [ ] Token refresh logic
- [ ] Rate limiting for API calls
- [ ] GraphQL Admin API support
- [ ] Bulk product operations
