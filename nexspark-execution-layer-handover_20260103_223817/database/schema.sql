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
