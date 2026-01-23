# Module 3: Advertiser - Meta Ads & Creative Generation

## Purpose
Automated Meta Ads campaign setup with AI-generated creative assets.

## Components

### 1. Creative Asset Generation
**Endpoint:** POST `/api/advertiser/creative/generate`

**Input:**
```json
{
  "research_id": "uuid",
  "brand_assets": {
    "product_images": ["url1", "url2"],
    "logo_url": "string",
    "brand_colors": ["#hex1"]
  },
  "creative_count": 4,
  "styles": ["product-video", "lifestyle", "ugc", "promo"]
}
```

**Output:**
```json
{
  "creatives": [
    {
      "id": "uuid",
      "type": "video",
      "url": "https://storage.../creative1.mp4",
      "thumbnail": "url",
      "duration": 15,
      "style": "product-video"
    }
  ]
}
```

**AI Services:**
- Kling AI for video generation
- Pixverse for alternative videos
- Claude for ad copy generation

**Files:**
- `backend/services/kling.js`
- `backend/services/pixverse.js`
- `backend/api/advertiser/creative.js`

### 2. Meta Pixel Installation
**Endpoint:** POST `/api/advertiser/pixel/install`

**Process:**
1. Request Meta Pixel access via OAuth
2. Generate Pixel ID
3. Inject pixel code into Shopify via ScriptTag
4. Verify pixel firing
5. Set up standard events: PageView, ViewContent, AddToCart, Purchase

**Files:**
- `backend/services/meta-pixel.js`
- `backend/api/advertiser/pixel.js`

### 3. Campaign Setup
**Endpoint:** POST `/api/advertiser/campaign/create`

**Meta Ads Structure:**
```
Campaign (Conversions - Purchase)
└── Ad Set (Targeting, Budget, Placement)
    └── Ads (Creative + Copy)
```

**Features:**
- Objective: Conversions (Purchase)
- Budget: $20-$50/day (recommended)
- Targeting: Based on GTM personas
- Placements: Automatic (Instagram, Facebook)
- Optimization: Conversions

**Integration Strategy:**
1. **Primary:** Use GoMarble MCP API (`https://apps.gomarble.ai/mcp-api/sse`)
   - OAuth 2.0 authentication
   - SSE-based protocol
   - Provides Meta Ads and Google Ads integration
   - Files: `backend/services/gomarble-mcp.js`, `backend/services/gomarble-meta-ads.js`
2. **Fallback:** Direct Meta Marketing API integration
   - Only if GoMarble API is not working
   - Files: `backend/services/meta-ads.js` (fallback implementation)

**Files:**
- `backend/services/gomarble-mcp.js` (primary)
- `backend/services/gomarble-meta-ads.js` (primary)
- `backend/services/meta-ads.js` (fallback)
- `backend/api/advertiser/campaign.js`
- `backend/models/campaign.js`

### 4. Authorization Flow
**OAuth Endpoints:**
- GET `/api/advertiser/auth/meta/connect`
- GET `/api/advertiser/auth/meta/callback`
- GET `/api/advertiser/auth/shopify/connect`
- GET `/api/advertiser/auth/shopify/callback`

## Database Schema

### creatives table
```sql
CREATE TABLE creatives (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  research_id UUID,
  creative_type VARCHAR(50),
  url TEXT,
  thumbnail_url TEXT,
  metadata JSONB,
  created_at TIMESTAMP
);
```

### campaigns table
```sql
CREATE TABLE campaigns (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  meta_campaign_id VARCHAR(255),
  meta_ad_account_id VARCHAR(255),
  status VARCHAR(50),
  budget_daily DECIMAL,
  targeting JSONB,
  creatives JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## Environment Variables
```
# GoMarble MCP (Primary)
GOMARBLE_MCP_URL=https://apps.gomarble.ai/mcp-api/sse
GOMARBLE_OAUTH_CLIENT_ID=xxx
GOMARBLE_OAUTH_CLIENT_SECRET=xxx

# Meta Direct API (Fallback)
META_APP_ID=xxx
META_APP_SECRET=xxx
META_ACCESS_TOKEN=xxx

# Creative Generation
KLING_API_KEY=xxx
PIXVERSE_API_KEY=xxx
```

## Acceptance Criteria
- [ ] GoMarble MCP API integration configured (OAuth 2.0, SSE protocol)
- [ ] Campaign creation via GoMarble MCP API works (primary)
- [ ] Fallback to direct Meta API if GoMarble fails
- [ ] Kling/Pixverse generate 3-4 video creatives
- [ ] Meta Pixel installed and verified
- [ ] Ad sets created with proper targeting
- [ ] Ads published with creatives
- [ ] OAuth flow for Meta and Shopify complete
- [ ] All standard events tracked
- [ ] Error handling and retry logic
- [ ] Demo/mock implementation if integration fails after 3 iterations
