-- 007_yamabushi_minimum_schema.sql
-- Minimum executable schema migration for Yamabushi x Auxora client-ops domain.
-- Safe-first approach: additive schema, idempotent statements where possible.

BEGIN;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- Base table: clients (required by most client-ops entities)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    industry TEXT,
    website TEXT,
    status VARCHAR(20) DEFAULT 'lead', -- lead, active, paused, closed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);

-- ---------------------------------------------------------------------------
-- M01: Service Agreement hardening
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS service_agreements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id),
    effective_date DATE,
    trial_days INT,
    retainer_monthly NUMERIC,
    spend_fee_min NUMERIC,
    spend_fee_max NUMERIC,
    term_months INT,
    deposit_amount NUMERIC,
    deposit_currency TEXT DEFAULT 'USD',
    deposit_refund_policy TEXT,
    termination_notice_days INT,
    payment_terms TEXT,
    phase_boundary JSONB,
    signer_client_name TEXT,
    signer_provider_name TEXT,
    signed_at_client TIMESTAMPTZ,
    signed_at_provider TIMESTAMPTZ,
    doc_id TEXT,
    doc_url TEXT,
    status VARCHAR(30) DEFAULT 'pending', -- pending, partially_signed, signed, active_paid, terminated
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE service_agreements
    ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC,
    ADD COLUMN IF NOT EXISTS deposit_currency TEXT DEFAULT 'USD',
    ADD COLUMN IF NOT EXISTS deposit_refund_policy TEXT,
    ADD COLUMN IF NOT EXISTS termination_notice_days INT,
    ADD COLUMN IF NOT EXISTS payment_terms TEXT,
    ADD COLUMN IF NOT EXISTS phase_boundary JSONB,
    ADD COLUMN IF NOT EXISTS signer_client_name TEXT,
    ADD COLUMN IF NOT EXISTS signer_provider_name TEXT,
    ADD COLUMN IF NOT EXISTS signed_at_client TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS signed_at_provider TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS doc_id TEXT,
    ADD COLUMN IF NOT EXISTS status VARCHAR(30);

UPDATE service_agreements
SET status = 'signed'
WHERE (status IS NULL OR status = '')
  AND doc_url IS NOT NULL;

UPDATE service_agreements
SET status = 'pending'
WHERE status IS NULL OR status = '';

CREATE INDEX IF NOT EXISTS idx_service_agreements_client_id ON service_agreements(client_id);
CREATE INDEX IF NOT EXISTS idx_service_agreements_status ON service_agreements(status);

-- ---------------------------------------------------------------------------
-- M02: Weekly Sync expansion
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS weekly_syncs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id),
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    summary TEXT,
    week_goal TEXT,
    week_result TEXT,
    key_wins JSONB DEFAULT '[]'::jsonb,
    key_losses JSONB DEFAULT '[]'::jsonb,
    performance_overview JSONB,
    insights JSONB,
    next_actions JSONB,
    owner_assignments JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(20) DEFAULT 'draft', -- draft, reviewed, published
    created_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE weekly_syncs
    ADD COLUMN IF NOT EXISTS week_goal TEXT,
    ADD COLUMN IF NOT EXISTS week_result TEXT,
    ADD COLUMN IF NOT EXISTS key_wins JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS key_losses JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS owner_assignments JSONB DEFAULT '[]'::jsonb;

UPDATE weekly_syncs
SET key_wins = '[]'::jsonb
WHERE key_wins IS NULL;

UPDATE weekly_syncs
SET key_losses = '[]'::jsonb
WHERE key_losses IS NULL;

UPDATE weekly_syncs
SET owner_assignments = '[]'::jsonb
WHERE owner_assignments IS NULL;

CREATE INDEX IF NOT EXISTS idx_weekly_syncs_client_week ON weekly_syncs(client_id, week_start, week_end);

-- ---------------------------------------------------------------------------
-- M03: KPI 4-level detail tables
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS kpi_channel_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    weekly_sync_id UUID REFERENCES weekly_syncs(id) ON DELETE CASCADE,
    channel TEXT NOT NULL,
    spend NUMERIC,
    impressions NUMERIC,
    clicks NUMERIC,
    ctr NUMERIC,
    cpc NUMERIC,
    add_to_cart NUMERIC,
    purchases NUMERIC,
    cpa NUMERIC,
    gmv NUMERIC,
    roas NUMERIC,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kpi_campaign_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    weekly_sync_id UUID REFERENCES weekly_syncs(id) ON DELETE CASCADE,
    channel TEXT NOT NULL,
    campaign_id_external TEXT,
    campaign_name TEXT,
    spend NUMERIC,
    impressions NUMERIC,
    clicks NUMERIC,
    ctr NUMERIC,
    cpc NUMERIC,
    add_to_cart NUMERIC,
    purchases NUMERIC,
    cpa NUMERIC,
    gmv NUMERIC,
    roas NUMERIC,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kpi_audience_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    weekly_sync_id UUID REFERENCES weekly_syncs(id) ON DELETE CASCADE,
    channel TEXT NOT NULL,
    audience_name TEXT,
    spend NUMERIC,
    impressions NUMERIC,
    clicks NUMERIC,
    ctr NUMERIC,
    cpc NUMERIC,
    add_to_cart NUMERIC,
    purchases NUMERIC,
    cpa NUMERIC,
    gmv NUMERIC,
    roas NUMERIC,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kpi_creative_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    weekly_sync_id UUID REFERENCES weekly_syncs(id) ON DELETE CASCADE,
    channel TEXT NOT NULL,
    creative_id_external TEXT,
    creative_name TEXT,
    spend NUMERIC,
    impressions NUMERIC,
    clicks NUMERIC,
    ctr NUMERIC,
    cpc NUMERIC,
    add_to_cart NUMERIC,
    purchases NUMERIC,
    cpa NUMERIC,
    gmv NUMERIC,
    roas NUMERIC,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_kpi_channel_weekly_sync_id ON kpi_channel_records(weekly_sync_id);
CREATE INDEX IF NOT EXISTS idx_kpi_campaign_weekly_sync_id ON kpi_campaign_records(weekly_sync_id);
CREATE INDEX IF NOT EXISTS idx_kpi_campaign_channel_campaign_id ON kpi_campaign_records(channel, campaign_id_external);
CREATE INDEX IF NOT EXISTS idx_kpi_audience_weekly_sync_id ON kpi_audience_records(weekly_sync_id);
CREATE INDEX IF NOT EXISTS idx_kpi_audience_channel_audience_name ON kpi_audience_records(channel, audience_name);
CREATE INDEX IF NOT EXISTS idx_kpi_creative_weekly_sync_id ON kpi_creative_records(weekly_sync_id);
CREATE INDEX IF NOT EXISTS idx_kpi_creative_channel_creative_id ON kpi_creative_records(channel, creative_id_external);

-- ---------------------------------------------------------------------------
-- M04: Decision and risk enhancements
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS task_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id),
    weekly_sync_id UUID REFERENCES weekly_syncs(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    owner_role TEXT,
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
    status VARCHAR(20) DEFAULT 'todo', -- todo, in_progress, blocked, done, cancelled
    due_date DATE,
    depends_on_task_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE task_items
    ADD COLUMN IF NOT EXISTS depends_on_task_id UUID;

CREATE TABLE IF NOT EXISTS risk_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id),
    weekly_sync_id UUID REFERENCES weekly_syncs(id) ON DELETE SET NULL,
    risk_type TEXT,
    severity VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
    probability NUMERIC,
    impact TEXT,
    mitigation_plan TEXT,
    owner_role TEXT,
    review_cycle VARCHAR(20) DEFAULT 'weekly', -- daily, weekly, biweekly, monthly
    status VARCHAR(20) DEFAULT 'open', -- open, monitoring, mitigated, closed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE risk_items
    ADD COLUMN IF NOT EXISTS owner_role TEXT,
    ADD COLUMN IF NOT EXISTS review_cycle VARCHAR(20) DEFAULT 'weekly';

CREATE TABLE IF NOT EXISTS decision_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id),
    source VARCHAR(20) DEFAULT 'system', -- chat, panel, system, openclaw
    decision_type VARCHAR(20), -- budget, creative, audience, contract, ops, kpi
    title TEXT NOT NULL,
    before_state JSONB,
    after_state JSONB,
    rationale TEXT,
    approved_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE decision_logs
    ADD COLUMN IF NOT EXISTS decision_type VARCHAR(20),
    ADD COLUMN IF NOT EXISTS before_state JSONB,
    ADD COLUMN IF NOT EXISTS after_state JSONB;

CREATE INDEX IF NOT EXISTS idx_task_items_client_id ON task_items(client_id);
CREATE INDEX IF NOT EXISTS idx_task_items_status ON task_items(status);
CREATE INDEX IF NOT EXISTS idx_risk_items_client_id ON risk_items(client_id);
CREATE INDEX IF NOT EXISTS idx_risk_items_status ON risk_items(status);
CREATE INDEX IF NOT EXISTS idx_decision_logs_client_id ON decision_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_decision_logs_type ON decision_logs(decision_type);

-- ---------------------------------------------------------------------------
-- M05: Gate checks
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gate_check_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id),
    gate_name TEXT NOT NULL,
    passed BOOLEAN NOT NULL DEFAULT FALSE,
    missing_items JSONB DEFAULT '[]'::jsonb,
    blocker_level VARCHAR(20) DEFAULT 'none', -- none, low, medium, high, critical
    next_required_action TEXT,
    checked_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gate_checks_client_gate ON gate_check_results(client_id, gate_name);
CREATE INDEX IF NOT EXISTS idx_gate_checks_checked_at ON gate_check_results(checked_at);

-- ---------------------------------------------------------------------------
-- M06: OpenClaw policies and enriched actions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS openclaw_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) UNIQUE,
    max_budget_shift_pct_per_action NUMERIC,
    max_budget_shift_pct_per_day NUMERIC,
    cooldown_minutes INT,
    daily_auto_action_limit INT,
    requires_approval_above_pct NUMERIC,
    allowed_action_types JSONB DEFAULT '[]'::jsonb,
    blocked_action_types JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS openclaw_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id),
    action_type TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'planned', -- planned, applied, blocked, failed, rolled_back
    policy_snapshot JSONB,
    why_triggered TEXT,
    estimated_impact JSONB,
    rollback_plan JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE openclaw_actions
    ADD COLUMN IF NOT EXISTS policy_snapshot JSONB,
    ADD COLUMN IF NOT EXISTS why_triggered TEXT,
    ADD COLUMN IF NOT EXISTS estimated_impact JSONB,
    ADD COLUMN IF NOT EXISTS rollback_plan JSONB;

CREATE INDEX IF NOT EXISTS idx_openclaw_policies_client_id ON openclaw_policies(client_id);
CREATE INDEX IF NOT EXISTS idx_openclaw_actions_client_id ON openclaw_actions(client_id);
CREATE INDEX IF NOT EXISTS idx_openclaw_actions_status ON openclaw_actions(status);

COMMIT;
