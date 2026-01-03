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
