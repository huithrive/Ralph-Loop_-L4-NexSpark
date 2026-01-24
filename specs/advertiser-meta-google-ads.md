# Module 3: Advertiser - Meta and Google Ads

## Purpose
Automated Meta Ads and Google Ads campaign setup using GoMarble MCP API. Creatives are pulled from the Executor module (Module 2), which handles all creative asset generation.

## Components

### 1. Meta Pixel Installation
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

### 2. Campaign Setup (Meta Ads & Google Ads)
**Endpoint:** POST `/api/advertiser/campaign/create`

**Input:**
```json
{
  "user_id": "uuid",
  "research_id": "uuid",
  "platform": "meta" | "google" | "both",
  "creative_ids": ["uuid1", "uuid2"], // Pulled from Executor module
  "campaign_name": "string",
  "objective": "conversions" | "traffic" | "awareness",
  "budget_daily": 20.00,
  "targeting": {
    "audience": "gtm_persona",
    "locations": ["US", "CA"],
    "age_range": [25, 54],
    "interests": []
  },
  "ad_copy": "string"
}
```

**Meta Ads Structure:**
```
Campaign (Conversions - Purchase)
└── Ad Set (Targeting, Budget, Placement)
    └── Ads (Creative + Copy)
```

**Google Ads Structure:**
```
Campaign (Search/Display/Video)
└── Ad Group (Keywords/Targeting)
    └── Ads (Creative + Copy)
```

**Features:**
- **Meta Ads:**
  - Objective: Conversions (Purchase)
  - Budget: $20-$50/day (recommended)
  - Targeting: Based on GTM personas
  - Placements: Automatic (Instagram, Facebook)
  - Optimization: Conversions
- **Google Ads:**
  - Campaign types: Search, Display, Video (YouTube)
  - Budget: $20-$50/day (recommended)
  - Targeting: Keywords, demographics, interests
  - Optimization: Conversions

**Creative Integration:**
- **Creatives are pulled from Executor module (Module 2)**
- Endpoint: `GET /api/executor/creatives?user_id={user_id}&research_id={research_id}`
- Returns available video and image creatives for use in campaigns
- No creative generation happens in this module

**Integration Strategy:**
1. **Primary:** Use GoMarble MCP API (`https://apps.gomarble.ai/mcp-api/sse`)
   - OAuth 2.0 authentication
   - SSE-based protocol
   - Provides unified interface for Meta Business Manager and Google Ads
   - Connects to Meta BM (Business Manager) accounts
   - Connects to Google Ads accounts
   - Files: `backend/services/gomarble-mcp.js`, `backend/services/gomarble-ads.js`
2. **Fallback:** Direct API integrations
   - Meta Marketing API (direct) - only if GoMarble fails
   - Google Ads API (direct) - only if GoMarble fails
   - Files: `backend/services/meta-ads.js`, `backend/services/google-ads.js` (fallback implementations)

**Files:**
- `backend/services/gomarble-mcp.js` (primary)
- `backend/services/gomarble-ads.js` (primary - handles both Meta and Google)
- `backend/services/meta-ads.js` (fallback)
- `backend/services/google-ads.js` (fallback)
- `backend/api/advertiser/campaign.js`
- `backend/models/campaign.js`

### 3. Authorization Flow
**OAuth Endpoints (via GoMarble MCP):**
- GET `/api/advertiser/auth/meta/connect` - Connect Meta Business Manager
- GET `/api/advertiser/auth/meta/callback` - Meta OAuth callback
- GET `/api/advertiser/auth/google/connect` - Connect Google Ads account
- GET `/api/advertiser/auth/google/callback` - Google OAuth callback
- GET `/api/advertiser/auth/shopify/connect` - Connect Shopify (for pixel installation)
- GET `/api/advertiser/auth/shopify/callback` - Shopify OAuth callback

## Database Schema

### campaigns table
```sql
CREATE TABLE campaigns (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  research_id UUID REFERENCES research_results(id),
  platform VARCHAR(20) NOT NULL, -- 'meta', 'google', 'both'
  campaign_name VARCHAR(255) NOT NULL,
  objective VARCHAR(50), -- 'conversions', 'traffic', 'awareness'
  
  -- Meta Ads fields
  meta_campaign_id VARCHAR(255),
  meta_ad_account_id VARCHAR(255),
  meta_ad_set_id VARCHAR(255),
  meta_ad_id VARCHAR(255),
  
  -- Google Ads fields
  google_campaign_id VARCHAR(255),
  google_ad_group_id VARCHAR(255),
  google_ad_id VARCHAR(255),
  
  -- Common fields
  creative_ids JSONB, -- Array of creative IDs from Executor module
  ad_copy TEXT,
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'active', 'paused', 'completed'
  budget_daily DECIMAL,
  targeting JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_campaigns_user ON campaigns(user_id);
CREATE INDEX idx_campaigns_research ON campaigns(research_id);
CREATE INDEX idx_campaigns_platform ON campaigns(platform);
CREATE INDEX idx_campaigns_status ON campaigns(status);
```

## Environment Variables
```
# GoMarble MCP (Primary) - Connects to Meta BM and Google Ads
GOMARBLE_MCP_URL=https://apps.gomarble.ai/mcp-api/sse
GOMARBLE_OAUTH_CLIENT_ID=xxx
GOMARBLE_OAUTH_CLIENT_SECRET=xxx

# Meta Direct API (Fallback)
META_APP_ID=xxx
META_APP_SECRET=xxx
META_ACCESS_TOKEN=xxx

# Google Ads Direct API (Fallback)
GOOGLE_ADS_CLIENT_ID=xxx
GOOGLE_ADS_CLIENT_SECRET=xxx
GOOGLE_ADS_REFRESH_TOKEN=xxx
GOOGLE_ADS_DEVELOPER_TOKEN=xxx
```

## Acceptance Criteria
- [ ] GoMarble MCP API integration configured (OAuth 2.0, SSE protocol)
- [ ] Connection to Meta Business Manager via GoMarble works
- [ ] Connection to Google Ads via GoMarble works
- [ ] Campaign creation for Meta Ads via GoMarble MCP API works (primary)
- [ ] Campaign creation for Google Ads via GoMarble MCP API works (primary)
- [ ] Fallback to direct Meta API if GoMarble fails
- [ ] Fallback to direct Google Ads API if GoMarble fails
- [ ] **Creatives pulled from Executor module (Module 2) successfully**
- [ ] Meta Pixel installed and verified on Shopify
- [ ] Ad sets/ad groups created with proper targeting
- [ ] Ads published with creatives from Executor module
- [ ] OAuth flow for Meta BM, Google Ads, and Shopify complete
- [ ] All standard events tracked (PageView, ViewContent, AddToCart, Purchase)
- [ ] Error handling and retry logic
- [ ] Demo/mock implementation if integration fails after 3 iterations
