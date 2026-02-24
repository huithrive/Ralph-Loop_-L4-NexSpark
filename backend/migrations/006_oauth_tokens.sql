-- OAuth Token Management Tables
-- Persistent storage for OAuth access tokens and refresh tokens

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- OAuth states for temporary session management
CREATE TABLE IF NOT EXISTS oauth_states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    state VARCHAR(255) NOT NULL UNIQUE,
    platform VARCHAR(20) NOT NULL, -- 'meta', 'google', 'shopify'
    user_id UUID, -- Optional user association
    redirect_uri VARCHAR(2048),
    shop_domain VARCHAR(255), -- For Shopify OAuth
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OAuth access tokens for API authentication
CREATE TABLE IF NOT EXISTS oauth_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    platform VARCHAR(20) NOT NULL, -- 'meta', 'google', 'shopify'
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_type VARCHAR(50) DEFAULT 'Bearer',
    scope TEXT, -- Granted permissions/scopes
    expires_at TIMESTAMP, -- Access token expiration
    shop_domain VARCHAR(255), -- For Shopify tokens
    meta_business_manager_id VARCHAR(255), -- For Meta tokens
    google_ads_customer_id VARCHAR(255), -- For Google Ads tokens
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP,

    -- Ensure one active token per user per platform
    CONSTRAINT unique_user_platform_active UNIQUE (user_id, platform, is_active)
);

-- Ensure backward-compatible columns if tables existed before migration tracking
ALTER TABLE oauth_states
    ADD COLUMN IF NOT EXISTS id UUID DEFAULT uuid_generate_v4(),
    ADD COLUMN IF NOT EXISTS state VARCHAR(255),
    ADD COLUMN IF NOT EXISTS platform VARCHAR(20),
    ADD COLUMN IF NOT EXISTS user_id UUID,
    ADD COLUMN IF NOT EXISTS redirect_uri VARCHAR(2048),
    ADD COLUMN IF NOT EXISTS shop_domain VARCHAR(255),
    ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE oauth_tokens
    ADD COLUMN IF NOT EXISTS id UUID DEFAULT uuid_generate_v4(),
    ADD COLUMN IF NOT EXISTS user_id UUID,
    ADD COLUMN IF NOT EXISTS platform VARCHAR(20),
    ADD COLUMN IF NOT EXISTS access_token TEXT,
    ADD COLUMN IF NOT EXISTS refresh_token TEXT,
    ADD COLUMN IF NOT EXISTS token_type VARCHAR(50) DEFAULT 'Bearer',
    ADD COLUMN IF NOT EXISTS scope TEXT,
    ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS shop_domain VARCHAR(255),
    ADD COLUMN IF NOT EXISTS meta_business_manager_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS google_ads_customer_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMP;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_oauth_states_state ON oauth_states(state);
CREATE INDEX IF NOT EXISTS idx_oauth_states_platform ON oauth_states(platform);
CREATE INDEX IF NOT EXISTS idx_oauth_states_expires ON oauth_states(expires_at);

CREATE INDEX IF NOT EXISTS idx_oauth_tokens_user ON oauth_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_platform ON oauth_tokens(platform);
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_active ON oauth_tokens(is_active);
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_expires ON oauth_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_user_platform ON oauth_tokens(user_id, platform);

-- Make unique constraint idempotent by guarding it explicitly
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'unique_user_platform_active'
  ) THEN
    ALTER TABLE oauth_tokens
      ADD CONSTRAINT unique_user_platform_active UNIQUE (user_id, platform, is_active);
  END IF;
END $$;