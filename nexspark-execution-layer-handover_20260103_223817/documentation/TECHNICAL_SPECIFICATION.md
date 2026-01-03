# 🔧 Technical Specification: Execution Layer

## Document Purpose
This document provides detailed technical specifications for building the execution layer on top of the existing Nexspark strategy generation system.

---

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Current Architecture](#current-architecture)
3. [Execution Layer Architecture](#execution-layer-architecture)
4. [API Specifications](#api-specifications)
5. [Database Schema](#database-schema)
6. [Integration Specifications](#integration-specifications)
7. [Data Flow](#data-flow)
8. [Error Handling](#error-handling)
9. [Performance Requirements](#performance-requirements)
10. [Security Requirements](#security-requirements)

---

## 1. System Overview

### Current System (Strategy Generation)
```
INPUT: Business interview responses (10 questions)
PROCESSING: Claude AI analysis + RapidAPI traffic data
OUTPUT: Comprehensive growth strategy (PDF report)
```

### New System (Strategy + Execution)
```
INPUT: Generated strategy
PROCESSING: Parse strategy → Generate campaigns → Launch via APIs
OUTPUT: Live campaigns (Google Ads, Meta Ads, Shopify LP)
```

---

## 2. Current Architecture

### Tech Stack
```yaml
Frontend:
  - HTML5 + TailwindCSS
  - Vanilla JavaScript
  - Stripe.js

Backend:
  - Cloudflare Workers (Hono framework)
  - TypeScript
  - Claude AI (Sonnet 4.5)
  - RapidAPI

Storage:
  - Cloudflare KV (state, 1hr TTL)
  - localStorage (frontend state)
  - Cloudflare D1 (planned, not yet implemented)

Hosting:
  - Cloudflare Pages
```

### Current API Endpoints
```typescript
// Interview & Summary
POST /api/interview/summarize
  Input: { responses: string[] }
  Output: { success: boolean, summary: object }

// Preview Generation
POST /api/preview/competitors
POST /api/preview/roadmap
POST /api/preview/benchmarks
  Input: { summary: object }
  Output: { [section]: object }

// Payment
POST /api/payment/create-intent
POST /api/payment/verify
  Input: { amount: number, userId: string }
  Output: { clientSecret: string } | { paid: boolean }

// Full Report
POST /api/analysis/generate-strategy
  Input: { summary, website, industry }
  Output: { strategy: object, executionId: string }

// Agent System (MVP)
POST /api/agent/execute
GET /api/agent/status/:executionId
  Input: { userId, request, context }
  Output: { executionId, progress, result }
```

### Current Data Models
```typescript
interface InterviewSummary {
  business: string
  industry: string
  target_revenue: string
  current_stage: string
  pain_points: string[]
  goals: string[]
}

interface StrategyReport {
  summary: InterviewSummary
  competitors: Competitor[]
  roadmap: Roadmap
  paid_ads_strategy: PaidAdsStrategy
  gtm_strategy: GTMStrategy
  financial_projections: FinancialProjections
}
```

---

## 3. Execution Layer Architecture

### ExecutionAgent Class
```typescript
/**
 * ExecutionAgent extends MinimumViableAgent
 * Handles strategy → execution transformation
 */
export class ExecutionAgent extends MinimumViableAgent {
  constructor(env: CloudflareBindings) {
    super(env)
  }

  /**
   * Parse strategy and extract actionable items
   */
  async parseStrategy(strategyId: string): Promise<ExecutionPlan> {
    const strategy = await this.getStrategy(strategyId)
    
    return {
      adCampaigns: this.extractAdCampaigns(strategy),
      landingPages: this.extractLandingPages(strategy),
      budget: this.extractBudget(strategy),
      timeline: this.extractTimeline(strategy)
    }
  }

  /**
   * Generate ad campaigns from strategy
   */
  async generateAdCampaigns(plan: ExecutionPlan): Promise<AdCampaign[]> {
    const campaigns: AdCampaign[] = []
    
    // Google Ads campaigns
    for (const googlePlan of plan.adCampaigns.google) {
      const campaign = await this.generateGoogleAdsCampaign(googlePlan)
      campaigns.push(campaign)
    }
    
    // Meta Ads campaigns
    for (const metaPlan of plan.adCampaigns.meta) {
      const campaign = await this.generateMetaAdsCampaign(metaPlan)
      campaigns.push(campaign)
    }
    
    return campaigns
  }

  /**
   * Generate landing pages from strategy
   */
  async generateLandingPages(plan: ExecutionPlan): Promise<LandingPage[]> {
    const pages: LandingPage[] = []
    
    for (const pagePlan of plan.landingPages) {
      const page = await this.generateLandingPage(pagePlan)
      pages.push(page)
    }
    
    return pages
  }

  /**
   * Launch campaigns via APIs
   */
  async launchCampaigns(campaigns: AdCampaign[]): Promise<LaunchResults> {
    const results = []
    
    for (const campaign of campaigns) {
      try {
        const result = await this.launchCampaign(campaign)
        results.push({ success: true, campaign, result })
      } catch (error) {
        results.push({ success: false, campaign, error })
      }
    }
    
    return { results, successCount: results.filter(r => r.success).length }
  }

  /**
   * Track campaign performance
   */
  async trackPerformance(campaignId: string): Promise<PerformanceMetrics> {
    // Fetch from Google Ads API, Meta API, etc.
    const metrics = await this.fetchCampaignMetrics(campaignId)
    
    // Store in D1
    await this.storeCampaignPerformance(campaignId, metrics)
    
    return metrics
  }

  /**
   * Generate optimization recommendations
   */
  async generateOptimizations(campaignId: string): Promise<Recommendation[]> {
    const performance = await this.trackPerformance(campaignId)
    const recommendations = []
    
    // Analyze performance and suggest optimizations
    if (performance.cpa > campaign.target_cpa * 1.2) {
      recommendations.push({
        type: 'reduce_budget',
        reason: 'CPA 20% above target',
        action: 'Reduce daily budget by 25%'
      })
    }
    
    if (performance.ctr < 2) {
      recommendations.push({
        type: 'improve_ad_copy',
        reason: 'CTR below 2%',
        action: 'Test new ad headlines'
      })
    }
    
    return recommendations
  }
}
```

### Service Classes

#### AdGeneratorService
```typescript
/**
 * Generates ad campaigns from strategy
 */
export class AdGeneratorService {
  constructor(
    private claudeAPI: ClaudeAPI,
    private imageAPI: ImageGenerationAPI
  ) {}

  /**
   * Generate Google Ads campaign structure
   */
  async generateGoogleAdsCampaign(input: CampaignInput): Promise<GoogleAdsCampaign> {
    // 1. Generate campaign structure
    const structure = await this.generateCampaignStructure(input)
    
    // 2. Generate ad copy
    const adCopy = await this.generateAdCopy(input, structure)
    
    // 3. Generate targeting
    const targeting = await this.generateTargeting(input)
    
    // 4. Set budget
    const budget = this.calculateBudget(input)
    
    return {
      name: `${input.business} - ${input.objective}`,
      type: 'SEARCH',
      budget: budget,
      targeting: targeting,
      ad_groups: structure.ad_groups.map(ag => ({
        name: ag.name,
        keywords: ag.keywords,
        ads: adCopy.filter(ad => ad.ad_group === ag.name)
      }))
    }
  }

  /**
   * Generate ad copy with Claude AI
   */
  async generateAdCopy(input: CampaignInput, structure: CampaignStructure): Promise<AdCopy[]> {
    const prompt = `
Generate Google Ads copy for:
Business: ${input.business}
Industry: ${input.industry}
Objective: ${input.objective}
Target Audience: ${input.targetAudience}
Value Propositions: ${input.valueProps.join(', ')}

Generate 3 ad variations with:
- Headlines (3 per ad, max 30 chars each)
- Descriptions (2 per ad, max 90 chars each)
- Display path
- Call-to-action

Make them compelling, benefit-focused, and include numbers when possible.
`
    
    const response = await this.claudeAPI.generate(prompt)
    return this.parseAdCopy(response)
  }

  /**
   * Generate ad images with AI
   */
  async generateAdImages(input: CampaignInput): Promise<string[]> {
    const imagePrompts = [
      `Professional ${input.industry} product showcase, clean modern design, high quality`,
      `${input.business} hero image, engaging, vibrant colors, professional`,
      `${input.targetAudience} using ${input.product}, lifestyle shot, authentic`
    ]
    
    const images = []
    for (const prompt of imagePrompts) {
      const image = await this.imageAPI.generate(prompt)
      images.push(image.url)
    }
    
    return images
  }
}
```

#### LandingPageGeneratorService
```typescript
/**
 * Generates Shopify landing pages from strategy
 */
export class LandingPageGeneratorService {
  constructor(
    private claudeAPI: ClaudeAPI,
    private shopifyAPI: ShopifyAPI
  ) {}

  /**
   * Generate landing page structure
   */
  async generateLandingPage(input: LandingPageInput): Promise<LandingPage> {
    // 1. Generate page structure
    const structure = await this.generatePageStructure(input)
    
    // 2. Generate copy for each section
    const sections = await Promise.all(
      structure.sections.map(s => this.generateSectionContent(s, input))
    )
    
    // 3. Generate HTML
    const html = this.renderHTML(sections)
    
    // 4. Create in Shopify
    const shopifyPage = await this.shopifyAPI.createPage({
      title: input.pageName,
      body_html: html,
      template_suffix: 'landing-page'
    })
    
    return {
      page_id: this.generateId(),
      shopify_page_id: shopifyPage.id,
      name: input.pageName,
      url: shopifyPage.handle,
      sections: sections,
      html: html,
      status: 'draft'
    }
  }

  /**
   * Generate section content with Claude AI
   */
  async generateSectionContent(section: Section, input: LandingPageInput): Promise<SectionContent> {
    const prompts = {
      hero: `Write a compelling hero section for ${input.business}. Include headline (10 words), subheadline (20 words), and CTA text (3 words). Focus on ${input.primaryBenefit}.`,
      
      features: `List 4 key features for ${input.business}. Each feature needs: title (3-5 words), description (15-20 words), icon name. Focus on ${input.valueProps.join(', ')}.`,
      
      social_proof: `Write 3 customer testimonials for ${input.business}. Include name, role, company, and testimonial (30-40 words each). Make them authentic and specific.`,
      
      cta: `Write a final call-to-action section for ${input.business}. Include headline (8 words), subheadline (15 words), CTA button text (3 words). Create urgency.`
    }
    
    const prompt = prompts[section.type]
    const response = await this.claudeAPI.generate(prompt)
    
    return {
      type: section.type,
      content: this.parseContent(response, section.type)
    }
  }
}
```

#### CampaignManagerService
```typescript
/**
 * Manages campaign lifecycle
 */
export class CampaignManagerService {
  constructor(
    private db: D1Database,
    private googleAds: GoogleAdsAPI,
    private metaAds: MetaAdsAPI
  ) {}

  /**
   * Launch campaign via appropriate API
   */
  async launchCampaign(campaign: AdCampaign): Promise<LaunchResult> {
    try {
      let result
      
      if (campaign.platform === 'google_ads') {
        result = await this.launchGoogleAdsCampaign(campaign)
      } else if (campaign.platform === 'meta_ads') {
        result = await this.launchMetaAdsCampaign(campaign)
      }
      
      // Store in database
      await this.db.prepare(`
        INSERT INTO campaigns (campaign_id, platform, name, status, budget, config, launched_at)
        VALUES (?, ?, ?, 'active', ?, ?, CURRENT_TIMESTAMP)
      `).bind(
        campaign.campaign_id,
        campaign.platform,
        campaign.name,
        campaign.budget,
        JSON.stringify(campaign)
      ).run()
      
      return {
        success: true,
        campaign_id: campaign.campaign_id,
        external_id: result.id,
        status: 'active'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Fetch campaign performance
   */
  async fetchPerformance(campaignId: string): Promise<PerformanceMetrics> {
    // Get campaign from DB
    const campaign = await this.db.prepare(`
      SELECT * FROM campaigns WHERE campaign_id = ?
    `).bind(campaignId).first()
    
    if (!campaign) throw new Error('Campaign not found')
    
    // Fetch from appropriate API
    let metrics
    if (campaign.platform === 'google_ads') {
      metrics = await this.googleAds.getMetrics(campaign.external_id)
    } else if (campaign.platform === 'meta_ads') {
      metrics = await this.metaAds.getInsights(campaign.external_id)
    }
    
    // Calculate KPIs
    return {
      impressions: metrics.impressions,
      clicks: metrics.clicks,
      spend: metrics.spend,
      conversions: metrics.conversions,
      revenue: metrics.revenue,
      ctr: (metrics.clicks / metrics.impressions) * 100,
      cpc: metrics.spend / metrics.clicks,
      cpa: metrics.spend / metrics.conversions,
      roas: metrics.revenue / metrics.spend,
      updated_at: new Date().toISOString()
    }
  }

  /**
   * Store performance data
   */
  async storePerformance(campaignId: string, metrics: PerformanceMetrics): Promise<void> {
    await this.db.prepare(`
      INSERT INTO campaign_performance (
        performance_id, campaign_id, date,
        impressions, clicks, spend, conversions, revenue,
        cpa, roas, recorded_at
      ) VALUES (?, ?, DATE('now'), ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      this.generateId(),
      campaignId,
      metrics.impressions,
      metrics.clicks,
      metrics.spend,
      metrics.conversions,
      metrics.revenue,
      metrics.cpa,
      metrics.roas
    ).run()
  }
}
```

---

## 4. API Specifications

### New Execution Endpoints

#### POST /api/execution/parse-strategy
```typescript
// Parse strategy into executable plan
Request:
{
  "strategy_id": "strategy_abc123"
}

Response:
{
  "success": true,
  "plan": {
    "ad_campaigns": [
      {
        "platform": "google_ads",
        "type": "search",
        "objective": "conversions",
        "budget": 500,
        "duration": "ongoing"
      }
    ],
    "landing_pages": [
      {
        "type": "product_launch",
        "sections": ["hero", "features", "social_proof", "cta"]
      }
    ],
    "timeline": {
      "week_1": ["Setup campaigns", "Create landing pages"],
      "week_2": ["Launch campaigns", "Monitor performance"]
    }
  }
}
```

#### POST /api/execution/generate-campaigns
```typescript
// Generate full campaign structures
Request:
{
  "strategy_id": "strategy_abc123",
  "platforms": ["google_ads", "meta_ads"]
}

Response:
{
  "success": true,
  "campaigns": [
    {
      "campaign_id": "camp_xyz789",
      "platform": "google_ads",
      "name": "Product Launch - Search",
      "type": "SEARCH",
      "budget": {
        "daily": 50,
        "total": 1500
      },
      "ad_groups": [
        {
          "name": "Brand Keywords",
          "keywords": ["saas project management", "team collaboration software"],
          "ads": [
            {
              "headlines": [
                "Streamline Your Workflow",
                "Save 10 Hours Per Week",
                "Try Free for 14 Days"
              ],
              "descriptions": [
                "AI-powered task management for modern teams. Start free.",
                "Join 10,000+ teams using our platform. No credit card required."
              ],
              "final_url": "https://example.com/signup"
            }
          ]
        }
      ],
      "targeting": {
        "locations": ["US", "CA", "UK"],
        "languages": ["en"],
        "demographics": "25-54"
      },
      "status": "draft"
    }
  ]
}
```

#### POST /api/execution/generate-landing-page
```typescript
// Generate landing page structure and content
Request:
{
  "strategy_id": "strategy_abc123",
  "page_type": "product_launch",
  "primary_benefit": "Save time with AI automation"
}

Response:
{
  "success": true,
  "page": {
    "page_id": "page_123abc",
    "name": "Product Launch - Main LP",
    "sections": [
      {
        "type": "hero",
        "content": {
          "headline": "Cut Your Project Management Time by 50%",
          "subheadline": "AI-powered task automation saves your team 10+ hours every week",
          "cta_text": "Start Free Trial",
          "cta_url": "/signup",
          "background_image": "url-to-generated-image"
        }
      },
      {
        "type": "features",
        "content": {
          "title": "Everything Your Team Needs",
          "features": [
            {
              "icon": "automation",
              "title": "Smart Automation",
              "description": "Let AI handle repetitive tasks so your team can focus on what matters"
            },
            {
              "icon": "analytics",
              "title": "Real-Time Analytics",
              "description": "Track progress and performance with intelligent dashboards"
            }
          ]
        }
      },
      {
        "type": "social_proof",
        "content": {
          "testimonials": [
            {
              "name": "Sarah Johnson",
              "role": "Head of Operations",
              "company": "TechCorp",
              "text": "This tool transformed how our team works. We're 50% more productive and haven't looked back.",
              "avatar": "url-to-avatar"
            }
          ],
          "stats": [
            { "number": "10,000+", "label": "Teams Using Daily" },
            { "number": "50%", "label": "Time Saved" }
          ]
        }
      }
    ],
    "html": "<full-html-output>",
    "preview_url": "https://preview.nexspark.com/page_123abc",
    "status": "draft"
  }
}
```

#### POST /api/execution/launch-campaign
```typescript
// Launch campaign via platform API
Request:
{
  "campaign_id": "camp_xyz789",
  "platform": "google_ads",
  "user_credentials": {
    "access_token": "user_oauth_token",
    "account_id": "123-456-7890"
  }
}

Response:
{
  "success": true,
  "result": {
    "campaign_id": "camp_xyz789",
    "external_id": "google_campaign_id_456",
    "status": "active",
    "launched_at": "2025-01-01T12:00:00Z",
    "dashboard_url": "https://ads.google.com/campaign/456"
  }
}
```

#### POST /api/execution/deploy-shopify-page
```typescript
// Deploy landing page to Shopify
Request:
{
  "page_id": "page_123abc",
  "shopify_store": "mystore.myshopify.com",
  "access_token": "shopify_access_token",
  "publish": true
}

Response:
{
  "success": true,
  "result": {
    "page_id": "page_123abc",
    "shopify_page_id": 12345678,
    "live_url": "https://mystore.com/pages/product-launch",
    "status": "published",
    "deployed_at": "2025-01-01T12:00:00Z"
  }
}
```

#### GET /api/execution/campaign-performance/:campaignId
```typescript
// Fetch campaign performance metrics
Response:
{
  "success": true,
  "metrics": {
    "campaign_id": "camp_xyz789",
    "platform": "google_ads",
    "date_range": {
      "start": "2025-01-01",
      "end": "2025-01-31"
    },
    "metrics": {
      "impressions": 125000,
      "clicks": 3200,
      "spend": 1450.00,
      "conversions": 42,
      "revenue": 8400.00,
      "ctr": 2.56,
      "cpc": 0.45,
      "cpa": 34.52,
      "roas": 5.79
    },
    "daily_breakdown": [
      {
        "date": "2025-01-01",
        "impressions": 4200,
        "clicks": 105,
        "spend": 48.50,
        "conversions": 2
      }
    ]
  }
}
```

#### GET /api/execution/optimize/:campaignId
```typescript
// Get optimization recommendations
Response:
{
  "success": true,
  "recommendations": [
    {
      "type": "increase_budget",
      "priority": "high",
      "reason": "ROAS 5.79x exceeds target 3.0x",
      "action": "Increase daily budget from $50 to $75",
      "expected_impact": "+30% conversions, maintain ROAS >4.0x",
      "confidence": 0.87
    },
    {
      "type": "pause_keyword",
      "priority": "medium",
      "reason": "Keyword 'generic tool' has CPA $98 (3x target)",
      "action": "Pause keyword 'generic tool' in Brand Keywords ad group",
      "expected_impact": "Save $150/week, improve overall CPA by 8%",
      "confidence": 0.92
    },
    {
      "type": "test_ad_copy",
      "priority": "low",
      "reason": "Ad variation B has 35% higher CTR than A",
      "action": "Make variation B primary ad, test new variation C",
      "expected_impact": "+15% clicks at same cost",
      "confidence": 0.78
    }
  ]
}
```

---

## 5. Database Schema (Cloudflare D1)

### campaigns
```sql
CREATE TABLE campaigns (
  campaign_id TEXT PRIMARY KEY,
  strategy_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  platform TEXT NOT NULL, -- 'google_ads' | 'meta_ads'
  external_id TEXT, -- Platform's campaign ID
  name TEXT NOT NULL,
  type TEXT, -- 'SEARCH' | 'DISPLAY' | 'VIDEO' etc
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

CREATE INDEX idx_campaigns_user ON campaigns(user_id);
CREATE INDEX idx_campaigns_strategy ON campaigns(strategy_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
```

### ad_groups
```sql
CREATE TABLE ad_groups (
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

CREATE INDEX idx_ad_groups_campaign ON ad_groups(campaign_id);
```

### ad_creatives
```sql
CREATE TABLE ad_creatives (
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

CREATE INDEX idx_ad_creatives_ad_group ON ad_creatives(ad_group_id);
```

### landing_pages
```sql
CREATE TABLE landing_pages (
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

CREATE INDEX idx_landing_pages_user ON landing_pages(user_id);
CREATE INDEX idx_landing_pages_strategy ON landing_pages(strategy_id);
```

### campaign_performance
```sql
CREATE TABLE campaign_performance (
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

CREATE INDEX idx_campaign_performance_campaign ON campaign_performance(campaign_id);
CREATE INDEX idx_campaign_performance_date ON campaign_performance(date);
```

### ab_tests
```sql
CREATE TABLE ab_tests (
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

CREATE INDEX idx_ab_tests_campaign ON ab_tests(campaign_id);
CREATE INDEX idx_ab_tests_status ON ab_tests(status);
```

### optimization_recommendations
```sql
CREATE TABLE optimization_recommendations (
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

CREATE INDEX idx_recommendations_campaign ON optimization_recommendations(campaign_id);
CREATE INDEX idx_recommendations_status ON optimization_recommendations(status);
```

---

## 6. Integration Specifications

### Google Ads API Integration

#### Authentication
```typescript
// OAuth 2.0 flow
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_ADS_CLIENT_ID,
  process.env.GOOGLE_ADS_CLIENT_SECRET,
  'https://nexspark.com/auth/google/callback'
)

// Required scopes
const scopes = [
  'https://www.googleapis.com/auth/adwords'
]
```

#### Create Campaign
```typescript
import { GoogleAdsApi } from 'google-ads-api'

const client = new GoogleAdsApi({
  client_id: env.GOOGLE_ADS_CLIENT_ID,
  client_secret: env.GOOGLE_ADS_CLIENT_SECRET,
  developer_token: env.GOOGLE_ADS_DEVELOPER_TOKEN
})

// Create campaign
const campaign = await client.Campaign.create({
  customer_id: '123-456-7890',
  campaign: {
    name: 'Product Launch - Search',
    advertising_channel_type: 'SEARCH',
    status: 'ENABLED',
    bidding_strategy_type: 'TARGET_CPA',
    target_cpa: {
      target_cpa_micros: 45000000 // $45.00
    },
    campaign_budget: {
      amount_micros: 50000000, // $50.00 daily
      delivery_method: 'STANDARD'
    },
    network_settings: {
      target_google_search: true,
      target_search_network: true
    }
  }
})
```

#### Fetch Metrics
```typescript
const report = await client.report({
  entity: 'campaign',
  attributes: [
    'campaign.id',
    'campaign.name',
    'campaign.status'
  ],
  metrics: [
    'metrics.impressions',
    'metrics.clicks',
    'metrics.cost_micros',
    'metrics.conversions',
    'metrics.conversions_value'
  ],
  constraints: {
    'campaign.id': campaignId
  },
  date_constant: 'LAST_30_DAYS'
})
```

### Meta Ads API Integration

#### Authentication
```typescript
import { FacebookAdsApi } from 'facebook-nodejs-business-sdk'

const api = FacebookAdsApi.init(accessToken)
```

#### Create Campaign
```typescript
import { Campaign, AdAccount } from 'facebook-nodejs-business-sdk'

const adAccount = new AdAccount(`act_${adAccountId}`)

const campaign = await adAccount.createCampaign([], {
  name: 'Product Launch - Meta',
  objective: 'CONVERSIONS',
  status: 'ACTIVE',
  special_ad_categories: [],
  daily_budget: 5000, // cents
  bid_strategy: 'LOWEST_COST_WITHOUT_CAP'
})
```

#### Fetch Insights
```typescript
const insights = await campaign.getInsights([], {
  fields: [
    'impressions',
    'clicks',
    'spend',
    'conversions',
    'revenue',
    'ctr',
    'cpc',
    'cpa',
    'roas'
  ],
  time_range: {
    since: '2025-01-01',
    until: '2025-01-31'
  }
})
```

### Shopify API Integration

#### Authentication
```typescript
import { shopifyApi, ApiVersion } from '@shopify/shopify-api'

const shopify = shopifyApi({
  apiKey: env.SHOPIFY_API_KEY,
  apiSecretKey: env.SHOPIFY_API_SECRET,
  scopes: ['write_pages', 'read_analytics'],
  hostName: 'myapp.com',
  apiVersion: ApiVersion.January24
})
```

#### Create Page
```typescript
const client = new shopify.clients.Rest({
  session: session
})

const response = await client.post({
  path: 'pages',
  data: {
    page: {
      title: 'Product Launch',
      body_html: generatedHTML,
      template_suffix: 'landing-page',
      published: true
    }
  }
})
```

#### Fetch Analytics
```typescript
const analytics = await client.get({
  path: `pages/${pageId}/metafields`,
  query: {
    namespace: 'analytics',
    key: 'views'
  }
})
```

---

## 7. Data Flow

### Campaign Generation Flow
```
1. User completes strategy generation
   └─> Strategy stored in localStorage + KV

2. User clicks "Launch Campaigns"
   └─> POST /api/execution/parse-strategy

3. ExecutionAgent parses strategy
   └─> Extract: budget, targeting, value props, timeline

4. System generates campaigns
   └─> POST /api/execution/generate-campaigns
   └─> Claude AI generates ad copy
   └─> DALL-E generates ad images
   └─> Structure created (campaigns, ad groups, ads)

5. User reviews campaign preview
   └─> Frontend displays: campaigns, ads, targeting, budget

6. User approves (or edits)
   └─> If edits: update campaign structure
   └─> If approves: proceed to launch

7. System launches campaigns
   └─> POST /api/execution/launch-campaign
   └─> OAuth flow (if needed)
   └─> API calls to Google Ads / Meta Ads
   └─> Campaign created on platform
   └─> Campaign ID stored in D1

8. Dashboard displays live campaigns
   └─> GET /api/execution/campaign-performance/:id
   └─> Fetch metrics from platform APIs
   └─> Display in real-time

9. System tracks performance
   └─> Daily cron job fetches metrics
   └─> Store in campaign_performance table
   └─> Calculate KPIs

10. System generates optimizations
    └─> GET /api/execution/optimize/:id
    └─> Analyze performance data
    └─> Generate recommendations
    └─> Display to user
```

### Landing Page Generation Flow
```
1. User clicks "Create Landing Page"
   └─> POST /api/execution/generate-landing-page

2. System generates page structure
   └─> Parse strategy for value props
   └─> Determine sections needed
   └─> Generate section order

3. Claude AI generates copy
   └─> Hero section copy
   └─> Features copy
   └─> Social proof copy
   └─> CTA copy

4. System generates HTML
   └─> Apply template
   └─> Insert generated copy
   └─> Add styling (Tailwind CSS)

5. User previews page
   └─> Preview URL generated
   └─> User reviews design and copy

6. User approves (or edits)
   └─> If edits: regenerate sections
   └─> If approves: proceed to deploy

7. System deploys to Shopify
   └─> POST /api/execution/deploy-shopify-page
   └─> OAuth flow (if needed)
   └─> Create page via Shopify API
   └─> Page goes live

8. System tracks page performance
   └─> Fetch views from Shopify analytics
   └─> Track conversions
   └─> Calculate conversion rate
```

---

## 8. Error Handling

### Error Categories

#### Transient Errors (Retry)
```typescript
const TRANSIENT_ERRORS = [
  'RATE_LIMIT_EXCEEDED',
  'SERVICE_UNAVAILABLE',
  'NETWORK_TIMEOUT',
  'TEMPORARY_ERROR'
]

async function retryableCall<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (!TRANSIENT_ERRORS.includes(error.code)) {
        throw error
      }
      
      lastError = error
      await sleep(Math.pow(2, i) * 1000) // Exponential backoff
    }
  }
  
  throw lastError
}
```

#### Permanent Errors (Fail Fast)
```typescript
const PERMANENT_ERRORS = [
  'INVALID_API_KEY',
  'INSUFFICIENT_PERMISSIONS',
  'INVALID_ACCOUNT_ID',
  'BUDGET_EXCEEDED',
  'POLICY_VIOLATION'
]

function handleError(error: any): ErrorResponse {
  if (PERMANENT_ERRORS.includes(error.code)) {
    return {
      success: false,
      error: {
        code: error.code,
        message: getUserFriendlyMessage(error.code),
        retryable: false
      }
    }
  }
  
  return {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      retryable: true
    }
  }
}
```

#### User-Facing Error Messages
```typescript
const ERROR_MESSAGES = {
  RATE_LIMIT_EXCEEDED: 'We\'re processing too many requests. Please try again in a few minutes.',
  INVALID_API_KEY: 'Your account connection has expired. Please reconnect your account.',
  BUDGET_EXCEEDED: 'Your daily budget has been reached. Campaigns will resume tomorrow.',
  POLICY_VIOLATION: 'Ad content violates platform policies. Please review and edit.',
  NETWORK_TIMEOUT: 'Connection timed out. Please check your internet and try again.'
}
```

---

## 9. Performance Requirements

### Response Times
```
- Campaign generation: < 2 minutes
- Landing page generation: < 1 minute
- Campaign launch: < 30 seconds
- Performance metrics fetch: < 5 seconds
- Dashboard load: < 2 seconds
```

### Scalability
```
- Concurrent users: 100+
- Campaigns per user: unlimited
- API rate limits:
  - Google Ads: 15,000 requests/day per account
  - Meta Ads: 200 calls/hour per user
  - Shopify: 2 calls/second per store
```

### Cost Optimization
```
- Cache performance metrics (15 min TTL)
- Batch API requests where possible
- Use webhook for real-time updates (reduce polling)
- Implement request deduplication
```

---

## 10. Security Requirements

### API Key Storage
```typescript
// NEVER store in code or git
// Use Cloudflare Secrets
env.GOOGLE_ADS_API_KEY
env.META_ADS_API_KEY
env.SHOPIFY_API_KEY
env.OPENAI_API_KEY

// Set via wrangler CLI
npx wrangler secret put GOOGLE_ADS_API_KEY
```

### OAuth Token Management
```typescript
// Store user tokens encrypted in D1
interface UserCredentials {
  user_id: string
  platform: 'google_ads' | 'meta_ads' | 'shopify'
  access_token: string // encrypted
  refresh_token: string // encrypted
  expires_at: number
}

// Refresh tokens before expiry
async function ensureValidToken(userId: string, platform: string): Promise<string> {
  const creds = await getCredentials(userId, platform)
  
  if (Date.now() >= creds.expires_at - 300000) { // 5 min buffer
    const newToken = await refreshToken(creds.refresh_token)
    await updateCredentials(userId, platform, newToken)
    return newToken.access_token
  }
  
  return decrypt(creds.access_token)
}
```

### Budget Safeguards
```typescript
// Prevent overspending
interface BudgetSafeguards {
  max_daily_spend: number // $1000 default
  max_campaign_budget: number // $10,000 default
  require_approval_above: number // $500 per campaign
  emergency_pause_threshold: number // 150% of budget
}

async function checkBudget(campaign: Campaign): Promise<boolean> {
  const userSettings = await getUserSafeguards(campaign.user_id)
  
  if (campaign.budget_daily > userSettings.max_daily_spend) {
    throw new Error('Campaign exceeds daily spend limit')
  }
  
  if (campaign.budget_daily > userSettings.require_approval_above) {
    await requestApproval(campaign)
  }
  
  return true
}
```

### Data Privacy
```typescript
// GDPR compliance
interface PrivacySettings {
  data_retention_days: number // 90 days default
  allow_analytics: boolean
  allow_remarketing: boolean
}

// Anonymize user data
async function anonymizeOldData(): Promise<void> {
  const cutoffDate = Date.now() - (90 * 24 * 60 * 60 * 1000)
  
  await db.prepare(`
    UPDATE campaigns 
    SET config = json_set(config, '$.user_email', 'redacted')
    WHERE created_at < ?
  `).bind(cutoffDate).run()
}
```

---

## 🎯 Implementation Checklist

### Phase 1: Foundation
- [ ] Set up D1 database with all tables
- [ ] Create ExecutionAgent class
- [ ] Build strategy parser
- [ ] Implement data models (Campaign, LandingPage, etc)
- [ ] Set up API integration clients (Google, Meta, Shopify)

### Phase 2: Campaign Generation
- [ ] Build AdGeneratorService
- [ ] Implement ad copy generation (Claude AI)
- [ ] Implement ad image generation (DALL-E)
- [ ] Create campaign structure builder
- [ ] Build campaign preview UI

### Phase 3: Campaign Launch
- [ ] Implement OAuth flows (Google, Meta, Shopify)
- [ ] Build CampaignManagerService
- [ ] Create launch functions for each platform
- [ ] Add error handling and retries
- [ ] Build launch confirmation UI

### Phase 4: Landing Pages
- [ ] Build LandingPageGeneratorService
- [ ] Implement section generators (hero, features, etc)
- [ ] Create HTML renderer
- [ ] Build Shopify integration
- [ ] Create page preview UI

### Phase 5: Performance Tracking
- [ ] Implement metrics fetching (all platforms)
- [ ] Build performance aggregation
- [ ] Create daily sync cron job
- [ ] Build dashboard UI
- [ ] Add charts and visualizations

### Phase 6: Optimization
- [ ] Build optimization recommendation engine
- [ ] Implement A/B testing framework
- [ ] Create automated optimization rules
- [ ] Build recommendation UI
- [ ] Add email notifications

---

## 📊 Success Metrics

### Technical Metrics
- [ ] Campaign generation < 2 minutes
- [ ] 95%+ launch success rate
- [ ] < 5 second API response times
- [ ] 99.5%+ uptime
- [ ] < $5 cost per campaign generated

### Business Metrics
- [ ] 50%+ of users launch campaigns
- [ ] 80%+ user satisfaction
- [ ] < 10% churn rate
- [ ] $200+ revenue per user (vs $20 strategy only)
- [ ] 3x increase in user LTV

---

**End of Technical Specification**

**Next Steps:**
1. Review this spec thoroughly
2. Set up development environment
3. Create API accounts
4. Start Phase 1 implementation
5. Reference this spec throughout development

**Questions?** Review handover documentation or ask!
