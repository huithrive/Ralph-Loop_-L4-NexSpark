#!/bin/bash

# Create Handover Package for Execution Layer Development
# This script creates a comprehensive package with all necessary files

PACKAGE_NAME="nexspark-execution-layer-handover"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
PACKAGE_DIR="${PACKAGE_NAME}_${TIMESTAMP}"

echo "🚀 Creating Handover Package: ${PACKAGE_DIR}"

# Create package directory structure
mkdir -p "${PACKAGE_DIR}"
mkdir -p "${PACKAGE_DIR}/documentation"
mkdir -p "${PACKAGE_DIR}/source_code"
mkdir -p "${PACKAGE_DIR}/database"
mkdir -p "${PACKAGE_DIR}/examples"

# Copy documentation
echo "📚 Copying documentation..."
cp HANDOVER_PROMPT.md "${PACKAGE_DIR}/"
cp TECHNICAL_SPECIFICATION.md "${PACKAGE_DIR}/documentation/"
cp BACKEND_INFRASTRUCTURE_STATUS.md "${PACKAGE_DIR}/documentation/"
cp AGENT_INTEGRATION_PLAN.md "${PACKAGE_DIR}/documentation/"
cp AGENT_ARCHITECTURE.md "${PACKAGE_DIR}/documentation/"
cp IMPLEMENTATION_CHECKLIST.md "${PACKAGE_DIR}/documentation/"
cp DAY_1_MVP_AGENT_COMPLETE.md "${PACKAGE_DIR}/documentation/"
cp WORKFLOW_COMPARISON.md "${PACKAGE_DIR}/documentation/"
cp QUICK_ANSWER.md "${PACKAGE_DIR}/documentation/"
cp README.md "${PACKAGE_DIR}/documentation/" 2>/dev/null || echo "# Nexspark Growth Agent" > "${PACKAGE_DIR}/documentation/README.md"

# Copy source code
echo "💻 Copying source code..."
cp -r src "${PACKAGE_DIR}/source_code/"
cp -r public "${PACKAGE_DIR}/source_code/"
cp package.json "${PACKAGE_DIR}/source_code/"
cp tsconfig.json "${PACKAGE_DIR}/source_code/"
cp wrangler.jsonc "${PACKAGE_DIR}/source_code/"
cp ecosystem.config.cjs "${PACKAGE_DIR}/source_code/"
cp .gitignore "${PACKAGE_DIR}/source_code/"

# Create database schema file
echo "🗄️ Creating database schema..."
cat > "${PACKAGE_DIR}/database/schema.sql" << 'SQL'
-- Nexspark Execution Layer Database Schema
-- Cloudflare D1 SQLite Database

-- =============================================
-- EXISTING TABLES (from strategy layer)
-- =============================================

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id TEXT PRIMARY KEY,
  email TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  total_analyses INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS analysis_records (
  analysis_id TEXT PRIMARY KEY,
  user_id TEXT,
  summary TEXT,
  full_report TEXT,
  status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES user_profiles(user_id)
);

-- =============================================
-- NEW TABLES (execution layer)
-- =============================================

-- Campaigns Table
CREATE TABLE IF NOT EXISTS campaigns (
  campaign_id TEXT PRIMARY KEY,
  strategy_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  platform TEXT NOT NULL, -- 'google_ads' | 'meta_ads'
  external_id TEXT, -- Platform's campaign ID
  name TEXT NOT NULL,
  type TEXT, -- 'SEARCH' | 'DISPLAY' | 'VIDEO'
  objective TEXT, -- 'CONVERSIONS' | 'TRAFFIC' | 'AWARENESS'
  status TEXT NOT NULL, -- 'draft' | 'active' | 'paused' | 'completed'
  budget_daily REAL,
  budget_total REAL,
  spend REAL DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue REAL DEFAULT 0,
  config TEXT, -- JSON: full campaign structure
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  launched_at DATETIME,
  completed_at DATETIME,
  FOREIGN KEY (strategy_id) REFERENCES analysis_records(analysis_id),
  FOREIGN KEY (user_id) REFERENCES user_profiles(user_id)
);

CREATE INDEX IF NOT EXISTS idx_campaigns_user ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_strategy ON campaigns(strategy_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);

-- Ad Groups Table
CREATE TABLE IF NOT EXISTS ad_groups (
  ad_group_id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  external_id TEXT,
  name TEXT NOT NULL,
  status TEXT NOT NULL,
  bid_amount REAL,
  keywords TEXT, -- JSON array
  config TEXT, -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(campaign_id)
);

CREATE INDEX IF NOT EXISTS idx_ad_groups_campaign ON ad_groups(campaign_id);

-- Ad Creatives Table
CREATE TABLE IF NOT EXISTS ad_creatives (
  creative_id TEXT PRIMARY KEY,
  ad_group_id TEXT NOT NULL,
  external_id TEXT,
  type TEXT NOT NULL, -- 'text' | 'image' | 'video'
  headlines TEXT, -- JSON array
  descriptions TEXT, -- JSON array
  image_url TEXT,
  video_url TEXT,
  final_url TEXT,
  status TEXT NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  ctr REAL DEFAULT 0,
  quality_score REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ad_group_id) REFERENCES ad_groups(ad_group_id)
);

CREATE INDEX IF NOT EXISTS idx_ad_creatives_ad_group ON ad_creatives(ad_group_id);

-- Landing Pages Table
CREATE TABLE IF NOT EXISTS landing_pages (
  page_id TEXT PRIMARY KEY,
  strategy_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  shopify_page_id TEXT,
  name TEXT NOT NULL,
  page_type TEXT, -- 'product_launch' | 'lead_capture' | 'sales'
  url TEXT,
  status TEXT NOT NULL, -- 'draft' | 'published' | 'archived'
  sections TEXT, -- JSON: array of sections
  html TEXT,
  views INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  conversion_rate REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  published_at DATETIME,
  FOREIGN KEY (strategy_id) REFERENCES analysis_records(analysis_id),
  FOREIGN KEY (user_id) REFERENCES user_profiles(user_id)
);

CREATE INDEX IF NOT EXISTS idx_landing_pages_user ON landing_pages(user_id);
CREATE INDEX IF NOT EXISTS idx_landing_pages_strategy ON landing_pages(strategy_id);

-- Campaign Performance Table
CREATE TABLE IF NOT EXISTS campaign_performance (
  performance_id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  date DATE NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  spend REAL DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue REAL DEFAULT 0,
  ctr REAL,
  cpc REAL,
  cpa REAL,
  roas REAL,
  recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(campaign_id)
);

CREATE INDEX IF NOT EXISTS idx_campaign_performance_campaign ON campaign_performance(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_performance_date ON campaign_performance(date);

-- A/B Tests Table
CREATE TABLE IF NOT EXISTS ab_tests (
  test_id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  test_type TEXT NOT NULL, -- 'ad_copy' | 'landing_page' | 'targeting'
  variant_a_id TEXT NOT NULL,
  variant_b_id TEXT NOT NULL,
  status TEXT NOT NULL, -- 'running' | 'completed' | 'paused'
  winner TEXT, -- 'a' | 'b' | 'no_winner'
  confidence REAL,
  metrics TEXT, -- JSON: detailed metrics
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(campaign_id)
);

CREATE INDEX IF NOT EXISTS idx_ab_tests_campaign ON ab_tests(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ab_tests_status ON ab_tests(status);

-- Optimization Recommendations Table
CREATE TABLE IF NOT EXISTS optimization_recommendations (
  recommendation_id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  type TEXT NOT NULL, -- 'increase_budget' | 'pause_keyword' | 'test_ad'
  priority TEXT NOT NULL, -- 'high' | 'medium' | 'low'
  reason TEXT NOT NULL,
  action TEXT NOT NULL,
  expected_impact TEXT,
  confidence REAL,
  status TEXT NOT NULL, -- 'pending' | 'applied' | 'dismissed'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  applied_at DATETIME,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(campaign_id)
);

CREATE INDEX IF NOT EXISTS idx_recommendations_campaign ON optimization_recommendations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_status ON optimization_recommendations(status);

-- User Credentials Table (encrypted tokens)
CREATE TABLE IF NOT EXISTS user_credentials (
  credential_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  platform TEXT NOT NULL, -- 'google_ads' | 'meta_ads' | 'shopify'
  access_token TEXT NOT NULL, -- encrypted
  refresh_token TEXT, -- encrypted
  expires_at INTEGER,
  account_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user_profiles(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_credentials_user ON user_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_user_credentials_platform ON user_credentials(platform);
SQL

# Create example code files
echo "📝 Creating example code..."

# Example: ExecutionAgent class
cat > "${PACKAGE_DIR}/examples/execution-agent.ts" << 'TYPESCRIPT'
/**
 * ExecutionAgent - Extends MinimumViableAgent for campaign execution
 * 
 * This is a starter template for building the execution layer.
 * Extend this class with your campaign generation and launch logic.
 */

import { MinimumViableAgent, AgentRequest, AgentExecution } from './minimum-viable-agent'

interface ExecutionPlan {
  adCampaigns: {
    google: any[]
    meta: any[]
  }
  landingPages: any[]
  budget: number
  timeline: Record<string, string[]>
}

interface AdCampaign {
  campaign_id: string
  platform: 'google_ads' | 'meta_ads'
  name: string
  budget: number
  config: any
}

interface LandingPage {
  page_id: string
  name: string
  sections: any[]
  html: string
}

export class ExecutionAgent extends MinimumViableAgent {
  /**
   * Parse strategy report into executable plan
   */
  async parseStrategy(strategyId: string): Promise<ExecutionPlan> {
    // TODO: Implement strategy parsing
    // 1. Fetch strategy from D1
    // 2. Extract ad campaign requirements
    // 3. Extract landing page requirements
    // 4. Extract budget allocation
    // 5. Create timeline
    
    throw new Error('Not implemented')
  }

  /**
   * Generate ad campaigns from execution plan
   */
  async generateAdCampaigns(plan: ExecutionPlan): Promise<AdCampaign[]> {
    // TODO: Implement campaign generation
    // 1. For each platform (Google, Meta):
    //    - Generate campaign structure
    //    - Generate ad copy (Claude AI)
    //    - Generate ad images (DALL-E)
    //    - Set targeting
    //    - Allocate budget
    // 2. Store campaigns in D1
    // 3. Return campaign objects
    
    throw new Error('Not implemented')
  }

  /**
   * Generate landing pages from execution plan
   */
  async generateLandingPages(plan: ExecutionPlan): Promise<LandingPage[]> {
    // TODO: Implement landing page generation
    // 1. For each page:
    //    - Generate section structure
    //    - Generate copy (Claude AI)
    //    - Generate HTML
    //    - Store in D1
    // 2. Return page objects
    
    throw new Error('Not implemented')
  }

  /**
   * Launch campaign via platform API
   */
  async launchCampaign(campaign: AdCampaign): Promise<any> {
    // TODO: Implement campaign launch
    // 1. Get user credentials from D1
    // 2. Refresh OAuth token if needed
    // 3. Call platform API (Google Ads / Meta Ads)
    // 4. Update campaign status in D1
    // 5. Return launch result
    
    throw new Error('Not implemented')
  }

  /**
   * Deploy landing page to Shopify
   */
  async deployLandingPage(page: LandingPage, shopifyStoreUrl: string): Promise<any> {
    // TODO: Implement Shopify deployment
    // 1. Get Shopify credentials
    // 2. Create page via Shopify API
    // 3. Update page status in D1
    // 4. Return deployment result
    
    throw new Error('Not implemented')
  }

  /**
   * Track campaign performance
   */
  async trackPerformance(campaignId: string): Promise<any> {
    // TODO: Implement performance tracking
    // 1. Fetch campaign from D1
    // 2. Get platform (Google/Meta)
    // 3. Call metrics API
    // 4. Store metrics in campaign_performance table
    // 5. Return metrics
    
    throw new Error('Not implemented')
  }

  /**
   * Generate optimization recommendations
   */
  async generateOptimizations(campaignId: string): Promise<any[]> {
    // TODO: Implement optimization engine
    // 1. Fetch campaign performance
    // 2. Analyze metrics vs targets
    // 3. Generate recommendations
    // 4. Store in optimization_recommendations table
    // 5. Return recommendations
    
    throw new Error('Not implemented')
  }
}
TYPESCRIPT

# Example: API endpoints
cat > "${PACKAGE_DIR}/examples/execution-endpoints.ts" << 'TYPESCRIPT'
/**
 * Execution Layer API Endpoints
 * 
 * Add these to src/index.tsx
 */

import { Hono } from 'hono'
import { ExecutionAgent } from './services/agent/execution-agent'

const app = new Hono()

// Parse strategy into execution plan
app.post('/api/execution/parse-strategy', async (c) => {
  try {
    const { strategy_id } = await c.req.json()
    
    const agent = new ExecutionAgent(c.env)
    const plan = await agent.parseStrategy(strategy_id)
    
    return c.json({ success: true, plan })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Generate campaigns from strategy
app.post('/api/execution/generate-campaigns', async (c) => {
  try {
    const { strategy_id, platforms } = await c.req.json()
    
    const agent = new ExecutionAgent(c.env)
    const plan = await agent.parseStrategy(strategy_id)
    const campaigns = await agent.generateAdCampaigns(plan)
    
    return c.json({ success: true, campaigns })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Generate landing page
app.post('/api/execution/generate-landing-page', async (c) => {
  try {
    const { strategy_id, page_type } = await c.req.json()
    
    const agent = new ExecutionAgent(c.env)
    const plan = await agent.parseStrategy(strategy_id)
    const pages = await agent.generateLandingPages(plan)
    
    return c.json({ success: true, page: pages[0] })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Launch campaign
app.post('/api/execution/launch-campaign', async (c) => {
  try {
    const { campaign_id } = await c.req.json()
    
    const agent = new ExecutionAgent(c.env)
    // Fetch campaign from D1
    const campaign = await c.env.DB.prepare(`
      SELECT * FROM campaigns WHERE campaign_id = ?
    `).bind(campaign_id).first()
    
    const result = await agent.launchCampaign(campaign)
    
    return c.json({ success: true, result })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Deploy landing page to Shopify
app.post('/api/execution/deploy-shopify-page', async (c) => {
  try {
    const { page_id, shopify_store } = await c.req.json()
    
    const agent = new ExecutionAgent(c.env)
    // Fetch page from D1
    const page = await c.env.DB.prepare(`
      SELECT * FROM landing_pages WHERE page_id = ?
    `).bind(page_id).first()
    
    const result = await agent.deployLandingPage(page, shopify_store)
    
    return c.json({ success: true, result })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Get campaign performance
app.get('/api/execution/campaign-performance/:campaignId', async (c) => {
  try {
    const campaignId = c.req.param('campaignId')
    
    const agent = new ExecutionAgent(c.env)
    const metrics = await agent.trackPerformance(campaignId)
    
    return c.json({ success: true, metrics })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Get optimization recommendations
app.get('/api/execution/optimize/:campaignId', async (c) => {
  try {
    const campaignId = c.req.param('campaignId')
    
    const agent = new ExecutionAgent(c.env)
    const recommendations = await agent.generateOptimizations(campaignId)
    
    return c.json({ success: true, recommendations })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

export default app
TYPESCRIPT

# Create setup guide
cat > "${PACKAGE_DIR}/SETUP_GUIDE.md" << 'MARKDOWN'
# 🚀 Setup Guide - Execution Layer Development

## Prerequisites

### Required Accounts
1. **Google Ads Developer Account**
   - Sign up: https://ads.google.com/
   - Get developer token: https://developers.google.com/google-ads/api/docs/first-call/dev-token
   
2. **Meta Developer Account**
   - Sign up: https://developers.facebook.com/
   - Create app: https://developers.facebook.com/apps/

3. **Shopify Partner Account**
   - Sign up: https://partners.shopify.com/
   - Create development store: https://help.shopify.com/en/partners/dashboard/managing-stores/development-stores

4. **OpenAI API Account**
   - Sign up: https://platform.openai.com/
   - Get API key: https://platform.openai.com/api-keys

### Required Tools
- Node.js 18+ 
- npm or yarn
- Cloudflare Wrangler CLI
- Git

## Step 1: Install Dependencies

```bash
cd source_code
npm install

# Install additional dependencies for execution layer
npm install google-ads-api facebook-nodejs-business-sdk @shopify/shopify-api openai
```

## Step 2: Set Up Cloudflare D1 Database

```bash
# Create D1 database
npx wrangler d1 create nexspark-execution

# Apply schema
npx wrangler d1 execute nexspark-execution --file=../database/schema.sql --local

# Update wrangler.jsonc with database ID
```

## Step 3: Configure Environment Variables

Create `.dev.vars` file:
```
ANTHROPIC_API_KEY=your_claude_api_key
RAPIDAPI_KEY=your_rapidapi_key
STRIPE_SECRET_KEY=your_stripe_secret_key
GOOGLE_ADS_CLIENT_ID=your_google_client_id
GOOGLE_ADS_CLIENT_SECRET=your_google_client_secret
GOOGLE_ADS_DEVELOPER_TOKEN=your_developer_token
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
SHOPIFY_API_KEY=your_shopify_api_key
SHOPIFY_API_SECRET=your_shopify_api_secret
OPENAI_API_KEY=your_openai_api_key
```

For production, use Cloudflare Secrets:
```bash
npx wrangler secret put GOOGLE_ADS_CLIENT_ID
npx wrangler secret put META_APP_ID
# ... etc
```

## Step 4: Review Current Code

1. **Agent Architecture**
   - Read: `source_code/src/services/agent/minimum-viable-agent.ts`
   - This is the MVP agent you'll extend

2. **API Routes**
   - Read: `source_code/src/index.tsx`
   - See how current endpoints are structured

3. **Data Models**
   - Review TypeScript interfaces in source files
   - Understand current data structures

## Step 5: Implement ExecutionAgent

1. Create `src/services/agent/execution-agent.ts`
2. Copy starter code from `examples/execution-agent.ts`
3. Implement each method step by step

## Step 6: Add API Endpoints

1. Open `src/index.tsx`
2. Add execution endpoints from `examples/execution-endpoints.ts`
3. Test endpoints locally

## Step 7: Implement Integrations

### Google Ads Integration
```typescript
// src/services/integrations/google-ads.ts
import { GoogleAdsApi } from 'google-ads-api'

export class GoogleAdsIntegration {
  private client: GoogleAdsApi
  
  constructor(env: any) {
    this.client = new GoogleAdsApi({
      client_id: env.GOOGLE_ADS_CLIENT_ID,
      client_secret: env.GOOGLE_ADS_CLIENT_SECRET,
      developer_token: env.GOOGLE_ADS_DEVELOPER_TOKEN
    })
  }
  
  async createCampaign(config: any) {
    // Implementation
  }
  
  async getMetrics(campaignId: string) {
    // Implementation
  }
}
```

### Meta Ads Integration
```typescript
// src/services/integrations/meta-ads.ts
import { FacebookAdsApi } from 'facebook-nodejs-business-sdk'

export class MetaAdsIntegration {
  private api: FacebookAdsApi
  
  constructor(env: any) {
    this.api = FacebookAdsApi.init(env.META_ACCESS_TOKEN)
  }
  
  async createCampaign(config: any) {
    // Implementation
  }
  
  async getInsights(campaignId: string) {
    // Implementation
  }
}
```

### Shopify Integration
```typescript
// src/services/integrations/shopify.ts
import { shopifyApi } from '@shopify/shopify-api'

export class ShopifyIntegration {
  private api: any
  
  constructor(env: any) {
    this.api = shopifyApi({
      apiKey: env.SHOPIFY_API_KEY,
      apiSecretKey: env.SHOPIFY_API_SECRET,
      // ...
    })
  }
  
  async createPage(config: any) {
    // Implementation
  }
}
```

## Step 8: Build UI Components

1. Create campaign dashboard
2. Create campaign preview
3. Create landing page preview
4. Add to existing pages

## Step 9: Test Locally

```bash
# Build
npm run build

# Run locally
npm run dev

# Test endpoints
curl -X POST http://localhost:3000/api/execution/generate-campaigns \
  -H "Content-Type: application/json" \
  -d '{"strategy_id":"test123"}'
```

## Step 10: Deploy

```bash
# Deploy to Cloudflare Pages
npm run deploy

# Verify deployment
curl https://your-deployment.pages.dev/api/execution/status
```

## Troubleshooting

### Common Issues

**Issue: API authentication errors**
- Check environment variables are set
- Verify OAuth tokens are valid
- Refresh tokens if expired

**Issue: Database errors**
- Verify D1 database is created
- Check schema is applied
- Ensure bindings in wrangler.jsonc

**Issue: Campaign launch failures**
- Check platform account permissions
- Verify budget limits
- Review error logs

## Next Steps

1. Read all documentation in `documentation/` folder
2. Review `HANDOVER_PROMPT.md` for detailed requirements
3. Follow `TECHNICAL_SPECIFICATION.md` for API specs
4. Implement features phase by phase
5. Test thoroughly before production

## Support Resources

- Google Ads API Docs: https://developers.google.com/google-ads/api/docs
- Meta Ads API Docs: https://developers.facebook.com/docs/marketing-apis
- Shopify API Docs: https://shopify.dev/docs/api
- Cloudflare D1 Docs: https://developers.cloudflare.com/d1/
- Hono Framework Docs: https://hono.dev/

Good luck building! 🚀
MARKDOWN

# Create README for package
cat > "${PACKAGE_DIR}/README.md" << 'MARKDOWN'
# 📦 Nexspark Execution Layer Handover Package

## What's Included

This package contains everything you need to build the execution layer for Nexspark:

### 📚 Documentation (10+ guides)
- **HANDOVER_PROMPT.md** - Complete handover brief (24KB)
- **TECHNICAL_SPECIFICATION.md** - Detailed technical specs (38KB)
- **BACKEND_INFRASTRUCTURE_STATUS.md** - Current system overview (18KB)
- **AGENT_INTEGRATION_PLAN.md** - Week 1-3 integration plan (12KB)
- **AGENT_ARCHITECTURE.md** - Agent system architecture (33KB)
- **SETUP_GUIDE.md** - Step-by-step setup instructions
- Plus 5 more supporting docs

### 💻 Source Code
- Complete current codebase
- Agent system (MVP complete)
- All API endpoints
- Frontend pages
- Configuration files

### 🗄️ Database
- Complete D1 schema (SQL)
- All tables for execution layer
- Indexes and relationships

### 📝 Examples
- ExecutionAgent class template
- API endpoint examples
- Integration code starters

## Quick Start

1. **Read This First**
   ```bash
   1. Open HANDOVER_PROMPT.md
   2. Read TECHNICAL_SPECIFICATION.md
   3. Review SETUP_GUIDE.md
   ```

2. **Set Up Environment**
   ```bash
   cd source_code
   npm install
   # Follow SETUP_GUIDE.md for detailed steps
   ```

3. **Create API Accounts**
   - Google Ads Developer
   - Meta Developer
   - Shopify Partner
   - OpenAI API

4. **Start Building**
   - Phase 1: Foundation (Week 1-2)
   - Phase 2: Campaign Generation (Week 3-4)
   - Phase 3: Landing Pages (Week 5-6)
   - Phase 4: Campaign Management (Week 7-8)
   - Phase 5: Integration & Testing (Week 9-10)

## Your Mission

Build the execution layer that transforms growth strategies into live campaigns:
- ✅ Paid Ads (Google Ads, Meta Ads)
- ✅ Landing Pages (Shopify)
- ✅ Campaign Management Backend

## Current Status

✅ Strategy generation: COMPLETE
✅ Agent MVP: COMPLETE
✅ Backend infrastructure: PRODUCTION-READY
🚀 Execution layer: YOUR MISSION

## Expected Outcome

When you're done, users will:
1. Generate strategy ($20)
2. Click "Launch Campaigns"
3. Review generated campaigns
4. Click "Approve & Launch"
5. **BOOM!** Campaigns live across Google, Meta, Shopify
6. Manage everything from dashboard

## Timeline

- **Week 1-2:** Foundation & database
- **Week 3-4:** Campaign generation
- **Week 5-6:** Landing pages
- **Week 7-8:** Campaign management
- **Week 9-10:** Testing & integration

## Success Metrics

- Campaign generation: <2 minutes
- Launch success rate: >95%
- User satisfaction: >85%
- Cost per campaign: <$5

## Support

- Read all documentation thoroughly
- Review example code
- Follow SETUP_GUIDE.md
- Reference TECHNICAL_SPECIFICATION.md for APIs

## Let's Build! 🚀

Transform Nexspark from a strategy tool to a full execution platform!

**Questions?** Review documentation or ask!
MARKDOWN

# Create archive
echo "📦 Creating archive..."
tar -czf "${PACKAGE_DIR}.tar.gz" "${PACKAGE_DIR}"

# Create info file
cat > "${PACKAGE_DIR}_INFO.txt" << INFO
Nexspark Execution Layer Handover Package
=========================================

Created: $(date)
Package: ${PACKAGE_DIR}.tar.gz
Size: $(du -h "${PACKAGE_DIR}.tar.gz" | cut -f1)

Contents:
- Documentation: 10+ guides (94KB+)
- Source Code: Complete codebase
- Database: D1 schema with all tables
- Examples: Starter templates
- Setup Guide: Step-by-step instructions

To Extract:
  tar -xzf ${PACKAGE_DIR}.tar.gz
  cd ${PACKAGE_DIR}
  cat README.md

First Steps:
  1. Read HANDOVER_PROMPT.md
  2. Read TECHNICAL_SPECIFICATION.md
  3. Follow SETUP_GUIDE.md
  4. Start building!

Mission:
  Build execution layer for:
  - Paid Ads (Google + Meta)
  - Landing Pages (Shopify)
  - Campaign Management

Timeline: 10 weeks (phased approach)

Ready to transform strategies into revenue! 🚀
INFO

echo "✅ Package created successfully!"
echo ""
echo "📦 Package: ${PACKAGE_DIR}.tar.gz"
echo "📄 Info: ${PACKAGE_DIR}_INFO.txt"
echo "📊 Size: $(du -h "${PACKAGE_DIR}.tar.gz" | cut -f1)"
echo ""
echo "🎉 Ready for handover!"
