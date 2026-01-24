-- OAuth Token Management Tables
-- Persistent storage for OAuth access tokens and refresh tokens

-- OAuth states for temporary session management
CREATE TABLE oauth_states (
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
CREATE TABLE oauth_tokens (
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

-- Indexes for performance
CREATE INDEX idx_oauth_states_state ON oauth_states(state);
CREATE INDEX idx_oauth_states_platform ON oauth_states(platform);
CREATE INDEX idx_oauth_states_expires ON oauth_states(expires_at);

CREATE INDEX idx_oauth_tokens_user ON oauth_tokens(user_id);
CREATE INDEX idx_oauth_tokens_platform ON oauth_tokens(platform);
CREATE INDEX idx_oauth_tokens_active ON oauth_tokens(is_active);
CREATE INDEX idx_oauth_tokens_expires ON oauth_tokens(expires_at);
CREATE INDEX idx_oauth_tokens_user_platform ON oauth_tokens(user_id, platform);