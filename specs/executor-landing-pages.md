# Module 2: Executor - Landing Page Builder

## Purpose
Automated landing page creation using Lovable API, Shopify integration, and domain management.

## Components

### 1. Lovable API Integration
**Endpoint:** POST `/api/executor/landing-page/create`

**Input:**
```json
{
  "user_id": "uuid",
  "research_id": "uuid",
  "brand_assets": {
    "logo_url": "string",
    "colors": ["#hex1", "#hex2"],
    "fonts": ["font1", "font2"]
  },
  "content": {
    "hero_headline": "string",
    "hero_subheadline": "string",
    "product_features": ["feature1", "feature2"],
    "testimonials": [],
    "cta_text": "string"
  }
}
```

**Output:**
```json
{
  "landing_page_id": "uuid",
  "preview_url": "https://preview.lovable.dev/xxx",
  "published_url": "https://yourdomain.com",
  "pages_created": ["homepage", "product", "thank-you"],
  "status": "published"
}
```

**Implementation:**
- File: `backend/services/lovable.js`
- File: `backend/api/executor/landing-page.js`
- Lovable API: Use GTM research data to populate pages
- Generate responsive HTML/CSS
- Include: Hero, Features, Social Proof, CTA, FAQ, Footer

### 2. Shopify Integration
**Endpoint:** POST `/api/executor/shopify/setup`

**Features:**
- Connect to existing Shopify store OR create new
- Auto-create products from research data
- Install Meta Pixel via ScriptTag API
- Set up webhooks for order tracking
- Sync inventory and pricing

**Files:**
- `backend/services/shopify.js`
- `backend/api/executor/shopify.js`
- `backend/models/shopify-store.js`

**Shopify APIs:**
- Admin API for product creation
- ScriptTag API for pixel injection
- Webhook API for events

### 3. Domain Management (NameSilo)
**Endpoint:** POST `/api/executor/domain/acquire`

**Features:**
- Check domain availability
- Suggest brand-based alternatives
- Purchase domain via NameSilo API
- Configure DNS (A records, CNAME)
- Set up SSL certificate
- Connect domain to landing page

**Files:**
- `backend/services/namesilo.js`
- `backend/api/executor/domain.js`

## Database Schema

### landing_pages table
```sql
CREATE TABLE landing_pages (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  research_id UUID REFERENCES research_results(id),
  lovable_project_id VARCHAR(255),
  preview_url TEXT,
  published_url TEXT,
  domain VARCHAR(255),
  pages JSONB,
  brand_assets JSONB,
  status VARCHAR(50),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### shopify_stores table
```sql
CREATE TABLE shopify_stores (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  store_url VARCHAR(255),
  access_token TEXT,
  products JSONB,
  pixel_installed BOOLEAN,
  webhooks JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## Environment Variables
```
LOVABLE_API_KEY=xxx
SHOPIFY_API_KEY=xxx
SHOPIFY_API_SECRET=xxx
NAMESILO_API_KEY=xxx
```

## Acceptance Criteria
- [ ] Lovable API integration creates landing pages
- [ ] Shopify connection and product creation works
- [ ] Domain acquisition via NameSilo succeeds
- [ ] DNS configuration automated
- [ ] Landing page accessible via custom domain
- [ ] Meta Pixel installed on Shopify
- [ ] All endpoints have error handling
- [ ] Integration tests pass
