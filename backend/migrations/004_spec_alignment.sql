-- Alignment with Module 2 and 3 Specifications
-- Creates missing tables and aligns with updated specs

-- Create users table (referenced in specs)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create landing_pages table (Module 2 spec)
CREATE TABLE IF NOT EXISTS landing_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    research_id UUID REFERENCES research_results(id),
    lovable_project_id VARCHAR(255),
    preview_url TEXT,
    published_url TEXT,
    domain VARCHAR(255),
    pages JSONB,
    brand_assets JSONB,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create shopify_stores table (Module 2 spec)
CREATE TABLE IF NOT EXISTS shopify_stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    store_url VARCHAR(255),
    access_token TEXT,
    products JSONB,
    pixel_installed BOOLEAN DEFAULT FALSE,
    webhooks JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create creatives table (Module 2 spec - replaces creative_generations)
CREATE TABLE IF NOT EXISTS creatives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    research_id UUID REFERENCES research_results(id),
    creative_type VARCHAR(50) NOT NULL, -- 'video' or 'image'
    source_image_url TEXT,
    prompt TEXT NOT NULL,
    style VARCHAR(50),
    duration INTEGER, -- 5 or 8 seconds
    quality VARCHAR(10), -- '360p', '540p', '720p', '1080p'
    motion_mode VARCHAR(20), -- 'normal' or 'fast'
    camera_movement VARCHAR(50),
    negative_prompt TEXT,
    use_case VARCHAR(50), -- 'advertisement', 'seo_content', 'social_media'
    provider VARCHAR(50) DEFAULT 'pixverse', -- 'pixverse', 'kling', 'runway', etc.
    provider_video_id VARCHAR(255), -- External API video ID
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    video_url TEXT,
    thumbnail_url TEXT,
    metadata JSONB, -- Store full API response
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create campaigns table (Module 3 spec)
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_landing_pages_user ON landing_pages(user_id);
CREATE INDEX IF NOT EXISTS idx_landing_pages_research ON landing_pages(research_id);

CREATE INDEX IF NOT EXISTS idx_shopify_stores_user ON shopify_stores(user_id);

CREATE INDEX IF NOT EXISTS idx_creatives_user ON creatives(user_id);
CREATE INDEX IF NOT EXISTS idx_creatives_research ON creatives(research_id);
CREATE INDEX IF NOT EXISTS idx_creatives_status ON creatives(status);

CREATE INDEX IF NOT EXISTS idx_campaigns_user ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_research ON campaigns(research_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_platform ON campaigns(platform);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);