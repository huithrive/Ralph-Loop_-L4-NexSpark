-- 008_yamabushi_constraints_hardening.sql
-- Hardening migration for production-grade constraints and updated_at triggers.
-- Goal: converge from flexible v1 schema to stricter, auditable schema.

BEGIN;

-- Keep migration behavior predictable in CI/prod.
SET lock_timeout = '10s';
SET statement_timeout = '60s';

-- ----------------------------------------------------------------------------
-- 0) Ensure shared trigger function exists
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 1) Data normalization before adding constraints
-- ----------------------------------------------------------------------------

-- clients
UPDATE clients
SET status = 'lead'
WHERE status IS NULL OR status = '' OR status NOT IN ('lead', 'active', 'paused', 'closed');

-- service_agreements
UPDATE service_agreements
SET deposit_currency = 'USD'
WHERE deposit_currency IS NULL OR deposit_currency = '';

UPDATE service_agreements
SET status = 'pending'
WHERE status IS NULL
   OR status = ''
   OR status NOT IN ('pending', 'partially_signed', 'signed', 'active_paid', 'terminated');

UPDATE service_agreements
SET trial_days = 0
WHERE trial_days IS NOT NULL AND trial_days < 0;

UPDATE service_agreements
SET term_months = 1
WHERE term_months IS NOT NULL AND term_months <= 0;

UPDATE service_agreements
SET deposit_amount = 0
WHERE deposit_amount IS NOT NULL AND deposit_amount < 0;

UPDATE service_agreements
SET termination_notice_days = 0
WHERE termination_notice_days IS NOT NULL AND termination_notice_days < 0;

UPDATE service_agreements
SET retainer_monthly = 0
WHERE retainer_monthly IS NOT NULL AND retainer_monthly < 0;

UPDATE service_agreements
SET spend_fee_min = 0
WHERE spend_fee_min IS NOT NULL AND spend_fee_min < 0;

UPDATE service_agreements
SET spend_fee_max = 0
WHERE spend_fee_max IS NOT NULL AND spend_fee_max < 0;

-- weekly_syncs
UPDATE weekly_syncs
SET status = 'draft'
WHERE status IS NULL OR status = '' OR status NOT IN ('draft', 'reviewed', 'published');

UPDATE weekly_syncs
SET week_end = week_start
WHERE week_start IS NOT NULL AND week_end IS NOT NULL AND week_end < week_start;

-- task_items
UPDATE task_items
SET priority = 'medium'
WHERE priority IS NULL OR priority = '' OR priority NOT IN ('low', 'medium', 'high', 'critical');

UPDATE task_items
SET status = 'todo'
WHERE status IS NULL OR status = '' OR status NOT IN ('todo', 'in_progress', 'blocked', 'done', 'cancelled');

-- risk_items
UPDATE risk_items
SET severity = 'medium'
WHERE severity IS NULL OR severity = '' OR severity NOT IN ('low', 'medium', 'high', 'critical');

UPDATE risk_items
SET review_cycle = 'weekly'
WHERE review_cycle IS NULL OR review_cycle = '' OR review_cycle NOT IN ('daily', 'weekly', 'biweekly', 'monthly');

UPDATE risk_items
SET status = 'open'
WHERE status IS NULL OR status = '' OR status NOT IN ('open', 'monitoring', 'mitigated', 'closed');

UPDATE risk_items
SET probability = 0
WHERE probability IS NOT NULL AND probability < 0;

UPDATE risk_items
SET probability = 1
WHERE probability IS NOT NULL AND probability > 1;

-- decision_logs
UPDATE decision_logs
SET source = 'system'
WHERE source IS NULL OR source = '' OR source NOT IN ('chat', 'panel', 'system', 'openclaw');

UPDATE decision_logs
SET decision_type = NULL
WHERE decision_type IS NOT NULL
  AND decision_type NOT IN ('budget', 'creative', 'audience', 'contract', 'ops', 'kpi');

-- gate_check_results
UPDATE gate_check_results
SET blocker_level = 'none'
WHERE blocker_level IS NULL
   OR blocker_level = ''
   OR blocker_level NOT IN ('none', 'low', 'medium', 'high', 'critical');

-- openclaw_actions
UPDATE openclaw_actions
SET status = 'planned'
WHERE status IS NULL
   OR status = ''
   OR status NOT IN ('planned', 'applied', 'blocked', 'failed', 'rolled_back');

-- openclaw_policies
UPDATE openclaw_policies
SET max_budget_shift_pct_per_action = 0
WHERE max_budget_shift_pct_per_action IS NOT NULL AND max_budget_shift_pct_per_action < 0;

UPDATE openclaw_policies
SET max_budget_shift_pct_per_day = 0
WHERE max_budget_shift_pct_per_day IS NOT NULL AND max_budget_shift_pct_per_day < 0;

UPDATE openclaw_policies
SET requires_approval_above_pct = 0
WHERE requires_approval_above_pct IS NOT NULL AND requires_approval_above_pct < 0;

UPDATE openclaw_policies
SET cooldown_minutes = 0
WHERE cooldown_minutes IS NOT NULL AND cooldown_minutes < 0;

UPDATE openclaw_policies
SET daily_auto_action_limit = 0
WHERE daily_auto_action_limit IS NOT NULL AND daily_auto_action_limit < 0;

UPDATE openclaw_policies
SET max_budget_shift_pct_per_action = 100
WHERE max_budget_shift_pct_per_action IS NOT NULL AND max_budget_shift_pct_per_action > 100;

UPDATE openclaw_policies
SET max_budget_shift_pct_per_day = 100
WHERE max_budget_shift_pct_per_day IS NOT NULL AND max_budget_shift_pct_per_day > 100;

UPDATE openclaw_policies
SET requires_approval_above_pct = 100
WHERE requires_approval_above_pct IS NOT NULL AND requires_approval_above_pct > 100;

-- ----------------------------------------------------------------------------
-- 2) Unique constraints / relational hardening
-- ----------------------------------------------------------------------------

-- One weekly sync per client and week window.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'uq_weekly_syncs_client_week'
  ) THEN
    ALTER TABLE weekly_syncs
      ADD CONSTRAINT uq_weekly_syncs_client_week UNIQUE (client_id, week_start, week_end);
  END IF;
END $$;

-- Self-dependency foreign key for task dependency chain.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_task_items_depends_on'
  ) THEN
    ALTER TABLE task_items
      ADD CONSTRAINT fk_task_items_depends_on
      FOREIGN KEY (depends_on_task_id)
      REFERENCES task_items(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 3) Check constraints (enum-like and numeric bounds)
-- ----------------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_clients_status') THEN
    ALTER TABLE clients
      ADD CONSTRAINT chk_clients_status
      CHECK (status IN ('lead', 'active', 'paused', 'closed'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_service_agreements_status') THEN
    ALTER TABLE service_agreements
      ADD CONSTRAINT chk_service_agreements_status
      CHECK (status IN ('pending', 'partially_signed', 'signed', 'active_paid', 'terminated'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_service_agreements_bounds') THEN
    ALTER TABLE service_agreements
      ADD CONSTRAINT chk_service_agreements_bounds
      CHECK (
        (trial_days IS NULL OR trial_days >= 0) AND
        (term_months IS NULL OR term_months > 0) AND
        (deposit_amount IS NULL OR deposit_amount >= 0) AND
        (termination_notice_days IS NULL OR termination_notice_days >= 0) AND
        (retainer_monthly IS NULL OR retainer_monthly >= 0) AND
        (spend_fee_min IS NULL OR spend_fee_min >= 0) AND
        (spend_fee_max IS NULL OR spend_fee_max >= 0)
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_weekly_syncs_status') THEN
    ALTER TABLE weekly_syncs
      ADD CONSTRAINT chk_weekly_syncs_status
      CHECK (status IN ('draft', 'reviewed', 'published'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_weekly_syncs_week_range') THEN
    ALTER TABLE weekly_syncs
      ADD CONSTRAINT chk_weekly_syncs_week_range
      CHECK (week_end >= week_start);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_task_items_priority') THEN
    ALTER TABLE task_items
      ADD CONSTRAINT chk_task_items_priority
      CHECK (priority IN ('low', 'medium', 'high', 'critical'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_task_items_status') THEN
    ALTER TABLE task_items
      ADD CONSTRAINT chk_task_items_status
      CHECK (status IN ('todo', 'in_progress', 'blocked', 'done', 'cancelled'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_risk_items_severity') THEN
    ALTER TABLE risk_items
      ADD CONSTRAINT chk_risk_items_severity
      CHECK (severity IN ('low', 'medium', 'high', 'critical'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_risk_items_review_cycle') THEN
    ALTER TABLE risk_items
      ADD CONSTRAINT chk_risk_items_review_cycle
      CHECK (review_cycle IN ('daily', 'weekly', 'biweekly', 'monthly'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_risk_items_status') THEN
    ALTER TABLE risk_items
      ADD CONSTRAINT chk_risk_items_status
      CHECK (status IN ('open', 'monitoring', 'mitigated', 'closed'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_risk_items_probability') THEN
    ALTER TABLE risk_items
      ADD CONSTRAINT chk_risk_items_probability
      CHECK (probability IS NULL OR (probability >= 0 AND probability <= 1));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_decision_logs_source') THEN
    ALTER TABLE decision_logs
      ADD CONSTRAINT chk_decision_logs_source
      CHECK (source IN ('chat', 'panel', 'system', 'openclaw'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_decision_logs_type') THEN
    ALTER TABLE decision_logs
      ADD CONSTRAINT chk_decision_logs_type
      CHECK (
        decision_type IS NULL OR
        decision_type IN ('budget', 'creative', 'audience', 'contract', 'ops', 'kpi')
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_gate_check_results_blocker_level') THEN
    ALTER TABLE gate_check_results
      ADD CONSTRAINT chk_gate_check_results_blocker_level
      CHECK (blocker_level IN ('none', 'low', 'medium', 'high', 'critical'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_openclaw_actions_status') THEN
    ALTER TABLE openclaw_actions
      ADD CONSTRAINT chk_openclaw_actions_status
      CHECK (status IN ('planned', 'applied', 'blocked', 'failed', 'rolled_back'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_openclaw_policies_bounds') THEN
    ALTER TABLE openclaw_policies
      ADD CONSTRAINT chk_openclaw_policies_bounds
      CHECK (
        (max_budget_shift_pct_per_action IS NULL OR (max_budget_shift_pct_per_action >= 0 AND max_budget_shift_pct_per_action <= 100)) AND
        (max_budget_shift_pct_per_day IS NULL OR (max_budget_shift_pct_per_day >= 0 AND max_budget_shift_pct_per_day <= 100)) AND
        (requires_approval_above_pct IS NULL OR (requires_approval_above_pct >= 0 AND requires_approval_above_pct <= 100)) AND
        (cooldown_minutes IS NULL OR cooldown_minutes >= 0) AND
        (daily_auto_action_limit IS NULL OR daily_auto_action_limit >= 0)
      );
  END IF;
END $$;

-- Metric sanity checks for KPI tables (non-negative metrics).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_kpi_channel_metrics_nonnegative') THEN
    ALTER TABLE kpi_channel_records
      ADD CONSTRAINT chk_kpi_channel_metrics_nonnegative
      CHECK (
        (spend IS NULL OR spend >= 0) AND
        (impressions IS NULL OR impressions >= 0) AND
        (clicks IS NULL OR clicks >= 0) AND
        (ctr IS NULL OR ctr >= 0) AND
        (cpc IS NULL OR cpc >= 0) AND
        (add_to_cart IS NULL OR add_to_cart >= 0) AND
        (purchases IS NULL OR purchases >= 0) AND
        (cpa IS NULL OR cpa >= 0) AND
        (gmv IS NULL OR gmv >= 0) AND
        (roas IS NULL OR roas >= 0)
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_kpi_campaign_metrics_nonnegative') THEN
    ALTER TABLE kpi_campaign_records
      ADD CONSTRAINT chk_kpi_campaign_metrics_nonnegative
      CHECK (
        (spend IS NULL OR spend >= 0) AND
        (impressions IS NULL OR impressions >= 0) AND
        (clicks IS NULL OR clicks >= 0) AND
        (ctr IS NULL OR ctr >= 0) AND
        (cpc IS NULL OR cpc >= 0) AND
        (add_to_cart IS NULL OR add_to_cart >= 0) AND
        (purchases IS NULL OR purchases >= 0) AND
        (cpa IS NULL OR cpa >= 0) AND
        (gmv IS NULL OR gmv >= 0) AND
        (roas IS NULL OR roas >= 0)
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_kpi_audience_metrics_nonnegative') THEN
    ALTER TABLE kpi_audience_records
      ADD CONSTRAINT chk_kpi_audience_metrics_nonnegative
      CHECK (
        (spend IS NULL OR spend >= 0) AND
        (impressions IS NULL OR impressions >= 0) AND
        (clicks IS NULL OR clicks >= 0) AND
        (ctr IS NULL OR ctr >= 0) AND
        (cpc IS NULL OR cpc >= 0) AND
        (add_to_cart IS NULL OR add_to_cart >= 0) AND
        (purchases IS NULL OR purchases >= 0) AND
        (cpa IS NULL OR cpa >= 0) AND
        (gmv IS NULL OR gmv >= 0) AND
        (roas IS NULL OR roas >= 0)
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_kpi_creative_metrics_nonnegative') THEN
    ALTER TABLE kpi_creative_records
      ADD CONSTRAINT chk_kpi_creative_metrics_nonnegative
      CHECK (
        (spend IS NULL OR spend >= 0) AND
        (impressions IS NULL OR impressions >= 0) AND
        (clicks IS NULL OR clicks >= 0) AND
        (ctr IS NULL OR ctr >= 0) AND
        (cpc IS NULL OR cpc >= 0) AND
        (add_to_cart IS NULL OR add_to_cart >= 0) AND
        (purchases IS NULL OR purchases >= 0) AND
        (cpa IS NULL OR cpa >= 0) AND
        (gmv IS NULL OR gmv >= 0) AND
        (roas IS NULL OR roas >= 0)
      );
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 4) NOT NULL hardening (after cleanup)
-- ----------------------------------------------------------------------------
ALTER TABLE clients
  ALTER COLUMN status SET NOT NULL;

ALTER TABLE service_agreements
  ALTER COLUMN status SET NOT NULL;

ALTER TABLE weekly_syncs
  ALTER COLUMN status SET NOT NULL;

ALTER TABLE task_items
  ALTER COLUMN priority SET NOT NULL,
  ALTER COLUMN status SET NOT NULL;

ALTER TABLE risk_items
  ALTER COLUMN severity SET NOT NULL,
  ALTER COLUMN review_cycle SET NOT NULL,
  ALTER COLUMN status SET NOT NULL;

ALTER TABLE decision_logs
  ALTER COLUMN source SET NOT NULL;

ALTER TABLE gate_check_results
  ALTER COLUMN blocker_level SET NOT NULL;

ALTER TABLE openclaw_actions
  ALTER COLUMN status SET NOT NULL;

-- ----------------------------------------------------------------------------
-- 5) updated_at triggers (consistency across mutable tables)
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON clients
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_service_agreements_updated_at ON service_agreements;
CREATE TRIGGER update_service_agreements_updated_at
BEFORE UPDATE ON service_agreements
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_weekly_syncs_updated_at ON weekly_syncs;
CREATE TRIGGER update_weekly_syncs_updated_at
BEFORE UPDATE ON weekly_syncs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_task_items_updated_at ON task_items;
CREATE TRIGGER update_task_items_updated_at
BEFORE UPDATE ON task_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_risk_items_updated_at ON risk_items;
CREATE TRIGGER update_risk_items_updated_at
BEFORE UPDATE ON risk_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_openclaw_policies_updated_at ON openclaw_policies;
CREATE TRIGGER update_openclaw_policies_updated_at
BEFORE UPDATE ON openclaw_policies
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_openclaw_actions_updated_at ON openclaw_actions;
CREATE TRIGGER update_openclaw_actions_updated_at
BEFORE UPDATE ON openclaw_actions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;

-- ----------------------------------------------------------------------------
-- Rollback notes (manual, if needed)
-- ----------------------------------------------------------------------------
-- 1) Disable app writes.
-- 2) Drop newly added CHECK/UNIQUE constraints selectively by name.
-- 3) Revert NOT NULL constraints only if required:
--      ALTER TABLE <table> ALTER COLUMN <col> DROP NOT NULL;
-- 4) Keep data normalization updates (safe forward fix).
-- 5) Re-enable writes after application compatibility check.
