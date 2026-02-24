-- Module 4: Analyzer Database Schema
-- Performance tracking, optimization actions, and system monitoring

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Performance snapshots for campaign metrics storage
CREATE TABLE IF NOT EXISTS performance_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL,
    user_id UUID NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    platform VARCHAR(20) NOT NULL, -- 'meta', 'google', 'both'
    date_range_start TIMESTAMP NOT NULL,
    date_range_end TIMESTAMP NOT NULL,
    metrics JSONB NOT NULL, -- All performance metrics (impressions, clicks, conversions, spend, etc.)
    data_source VARCHAR(50) DEFAULT 'gomarble_mcp', -- 'gomarble_mcp', 'meta_direct', 'google_direct', 'mock'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optimization actions tracking
CREATE TABLE IF NOT EXISTS optimization_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL,
    user_id UUID NOT NULL,
    trigger_type VARCHAR(100) NOT NULL, -- 'low_ctr', 'high_cpa', 'low_roas', 'poor_performance'
    trigger_value DECIMAL(10,2), -- The metric value that triggered the action
    trigger_threshold DECIMAL(10,2), -- The threshold that was exceeded
    action_type VARCHAR(100) NOT NULL, -- 'pause_campaign', 'adjust_budget', 'modify_targeting', 'suggest_creative'
    action_data JSONB, -- Details of the action taken
    result JSONB, -- Result of the action (success/failure, new metrics)
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'failed'
    automated BOOLEAN DEFAULT true, -- Whether action was automated or manual
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- System health monitoring
CREATE TABLE IF NOT EXISTS system_health_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_name VARCHAR(100) NOT NULL, -- 'meta_api', 'google_ads', 'shopify', 'gomarble_mcp', 'database', 'server'
    status VARCHAR(20) NOT NULL, -- 'healthy', 'degraded', 'down', 'unknown'
    response_time_ms INTEGER, -- API response time in milliseconds
    error_message TEXT,
    metrics JSONB, -- Service-specific metrics
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Weekly report generation tracking
CREATE TABLE IF NOT EXISTS weekly_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    report_type VARCHAR(50) DEFAULT 'weekly_performance', -- 'weekly_performance', 'monthly_summary', 'custom'
    date_range_start DATE NOT NULL,
    date_range_end DATE NOT NULL,
    report_data JSONB NOT NULL, -- Complete report data
    pdf_url VARCHAR(2048), -- URL to generated PDF
    email_sent BOOLEAN DEFAULT false,
    email_sent_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'generating', -- 'generating', 'completed', 'failed', 'sent'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dashboard configurations and user preferences
CREATE TABLE IF NOT EXISTS dashboard_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE,
    config JSONB NOT NULL DEFAULT '{}', -- Dashboard layout, widgets, preferences
    goal_revenue DECIMAL(12,2) DEFAULT 10000.00, -- User's revenue goal (default $10K)
    goal_deadline DATE,
    notification_preferences JSONB DEFAULT '{"email": true, "push": false, "sms": false}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Real-time notification queue for WebSocket
CREATE TABLE IF NOT EXISTS notification_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    notification_type VARCHAR(100) NOT NULL, -- 'performance_alert', 'optimization_complete', 'goal_progress', 'system_issue'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB, -- Additional notification data
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    read BOOLEAN DEFAULT false,
    sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_performance_snapshots_campaign ON performance_snapshots(campaign_id);
CREATE INDEX IF NOT EXISTS idx_performance_snapshots_user ON performance_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_snapshots_timestamp ON performance_snapshots(timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_snapshots_platform ON performance_snapshots(platform);

CREATE INDEX IF NOT EXISTS idx_optimization_actions_campaign ON optimization_actions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_optimization_actions_user ON optimization_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_optimization_actions_status ON optimization_actions(status);
CREATE INDEX IF NOT EXISTS idx_optimization_actions_created ON optimization_actions(created_at);

CREATE INDEX IF NOT EXISTS idx_system_health_service ON system_health_logs(service_name);
CREATE INDEX IF NOT EXISTS idx_system_health_status ON system_health_logs(status);
CREATE INDEX IF NOT EXISTS idx_system_health_checked ON system_health_logs(checked_at);

CREATE INDEX IF NOT EXISTS idx_weekly_reports_user ON weekly_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_reports_status ON weekly_reports(status);
CREATE INDEX IF NOT EXISTS idx_weekly_reports_created ON weekly_reports(created_at);

CREATE INDEX IF NOT EXISTS idx_notification_queue_user ON notification_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_queue_sent ON notification_queue(sent);
CREATE INDEX IF NOT EXISTS idx_notification_queue_read ON notification_queue(read);
CREATE INDEX IF NOT EXISTS idx_notification_queue_priority ON notification_queue(priority);