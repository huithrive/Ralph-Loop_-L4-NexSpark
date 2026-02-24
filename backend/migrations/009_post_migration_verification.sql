-- 009_post_migration_verification.sql
-- Post-migration verification script (read-only checks).
-- Purpose: one-shot validation for constraints, triggers, and residual bad data.

-- ============================================================================
-- 1) Constraints existence check
-- ============================================================================
WITH expected_constraints AS (
    SELECT 'clients'::text AS table_name, 'chk_clients_status'::text AS constraint_name UNION ALL
    SELECT 'service_agreements', 'chk_service_agreements_status' UNION ALL
    SELECT 'service_agreements', 'chk_service_agreements_bounds' UNION ALL
    SELECT 'weekly_syncs', 'chk_weekly_syncs_status' UNION ALL
    SELECT 'weekly_syncs', 'chk_weekly_syncs_week_range' UNION ALL
    SELECT 'weekly_syncs', 'uq_weekly_syncs_client_week' UNION ALL
    SELECT 'task_items', 'chk_task_items_priority' UNION ALL
    SELECT 'task_items', 'chk_task_items_status' UNION ALL
    SELECT 'task_items', 'fk_task_items_depends_on' UNION ALL
    SELECT 'risk_items', 'chk_risk_items_severity' UNION ALL
    SELECT 'risk_items', 'chk_risk_items_review_cycle' UNION ALL
    SELECT 'risk_items', 'chk_risk_items_status' UNION ALL
    SELECT 'risk_items', 'chk_risk_items_probability' UNION ALL
    SELECT 'decision_logs', 'chk_decision_logs_source' UNION ALL
    SELECT 'decision_logs', 'chk_decision_logs_type' UNION ALL
    SELECT 'gate_check_results', 'chk_gate_check_results_blocker_level' UNION ALL
    SELECT 'openclaw_actions', 'chk_openclaw_actions_status' UNION ALL
    SELECT 'openclaw_policies', 'chk_openclaw_policies_bounds'
),
actual_constraints AS (
    SELECT
        rel.relname::text AS table_name,
        con.conname::text AS constraint_name
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = con.connamespace
    WHERE nsp.nspname = 'public'
)
SELECT
    'constraint_check' AS check_type,
    e.table_name,
    e.constraint_name,
    CASE WHEN a.constraint_name IS NOT NULL THEN 'PASS' ELSE 'FAIL' END AS status
FROM expected_constraints e
LEFT JOIN actual_constraints a
    ON a.table_name = e.table_name
   AND a.constraint_name = e.constraint_name
ORDER BY e.table_name, e.constraint_name;

-- ============================================================================
-- 2) Trigger existence check
-- ============================================================================
WITH expected_triggers AS (
    SELECT 'clients'::text AS table_name, 'update_clients_updated_at'::text AS trigger_name UNION ALL
    SELECT 'service_agreements', 'update_service_agreements_updated_at' UNION ALL
    SELECT 'weekly_syncs', 'update_weekly_syncs_updated_at' UNION ALL
    SELECT 'task_items', 'update_task_items_updated_at' UNION ALL
    SELECT 'risk_items', 'update_risk_items_updated_at' UNION ALL
    SELECT 'openclaw_policies', 'update_openclaw_policies_updated_at' UNION ALL
    SELECT 'openclaw_actions', 'update_openclaw_actions_updated_at'
),
actual_triggers AS (
    SELECT
        event_object_table::text AS table_name,
        trigger_name::text AS trigger_name
    FROM information_schema.triggers
    WHERE trigger_schema = 'public'
)
SELECT
    'trigger_check' AS check_type,
    e.table_name,
    e.trigger_name AS item_name,
    CASE WHEN a.trigger_name IS NOT NULL THEN 'PASS' ELSE 'FAIL' END AS status
FROM expected_triggers e
LEFT JOIN actual_triggers a
    ON a.table_name = e.table_name
   AND a.trigger_name = e.trigger_name
ORDER BY e.table_name, e.trigger_name;

-- ============================================================================
-- 3) Residual bad data check (should all be 0)
-- ============================================================================
SELECT 'bad_data_check' AS check_type, 'clients_invalid_status' AS item_name, COUNT(*)::bigint AS bad_count
FROM clients
WHERE status IS NULL OR status NOT IN ('lead', 'active', 'paused', 'closed')
UNION ALL
SELECT 'bad_data_check', 'service_agreements_invalid_status', COUNT(*)::bigint
FROM service_agreements
WHERE status IS NULL OR status NOT IN ('pending', 'partially_signed', 'signed', 'active_paid', 'terminated')
UNION ALL
SELECT 'bad_data_check', 'service_agreements_negative_numeric', COUNT(*)::bigint
FROM service_agreements
WHERE (deposit_amount IS NOT NULL AND deposit_amount < 0)
   OR (trial_days IS NOT NULL AND trial_days < 0)
   OR (term_months IS NOT NULL AND term_months <= 0)
   OR (termination_notice_days IS NOT NULL AND termination_notice_days < 0)
   OR (retainer_monthly IS NOT NULL AND retainer_monthly < 0)
   OR (spend_fee_min IS NOT NULL AND spend_fee_min < 0)
   OR (spend_fee_max IS NOT NULL AND spend_fee_max < 0)
UNION ALL
SELECT 'bad_data_check', 'weekly_syncs_invalid_status', COUNT(*)::bigint
FROM weekly_syncs
WHERE status IS NULL OR status NOT IN ('draft', 'reviewed', 'published')
UNION ALL
SELECT 'bad_data_check', 'weekly_syncs_invalid_week_range', COUNT(*)::bigint
FROM weekly_syncs
WHERE week_start IS NOT NULL AND week_end IS NOT NULL AND week_end < week_start
UNION ALL
SELECT 'bad_data_check', 'task_items_invalid_priority', COUNT(*)::bigint
FROM task_items
WHERE priority IS NULL OR priority NOT IN ('low', 'medium', 'high', 'critical')
UNION ALL
SELECT 'bad_data_check', 'task_items_invalid_status', COUNT(*)::bigint
FROM task_items
WHERE status IS NULL OR status NOT IN ('todo', 'in_progress', 'blocked', 'done', 'cancelled')
UNION ALL
SELECT 'bad_data_check', 'task_items_self_dependency', COUNT(*)::bigint
FROM task_items
WHERE depends_on_task_id IS NOT NULL AND depends_on_task_id = id
UNION ALL
SELECT 'bad_data_check', 'risk_items_invalid_severity', COUNT(*)::bigint
FROM risk_items
WHERE severity IS NULL OR severity NOT IN ('low', 'medium', 'high', 'critical')
UNION ALL
SELECT 'bad_data_check', 'risk_items_invalid_review_cycle', COUNT(*)::bigint
FROM risk_items
WHERE review_cycle IS NULL OR review_cycle NOT IN ('daily', 'weekly', 'biweekly', 'monthly')
UNION ALL
SELECT 'bad_data_check', 'risk_items_invalid_status', COUNT(*)::bigint
FROM risk_items
WHERE status IS NULL OR status NOT IN ('open', 'monitoring', 'mitigated', 'closed')
UNION ALL
SELECT 'bad_data_check', 'risk_items_invalid_probability', COUNT(*)::bigint
FROM risk_items
WHERE probability IS NOT NULL AND (probability < 0 OR probability > 1)
UNION ALL
SELECT 'bad_data_check', 'decision_logs_invalid_source', COUNT(*)::bigint
FROM decision_logs
WHERE source IS NULL OR source NOT IN ('chat', 'panel', 'system', 'openclaw')
UNION ALL
SELECT 'bad_data_check', 'decision_logs_invalid_type', COUNT(*)::bigint
FROM decision_logs
WHERE decision_type IS NOT NULL
  AND decision_type NOT IN ('budget', 'creative', 'audience', 'contract', 'ops', 'kpi')
UNION ALL
SELECT 'bad_data_check', 'gate_check_results_invalid_blocker_level', COUNT(*)::bigint
FROM gate_check_results
WHERE blocker_level IS NULL OR blocker_level NOT IN ('none', 'low', 'medium', 'high', 'critical')
UNION ALL
SELECT 'bad_data_check', 'openclaw_actions_invalid_status', COUNT(*)::bigint
FROM openclaw_actions
WHERE status IS NULL OR status NOT IN ('planned', 'applied', 'blocked', 'failed', 'rolled_back')
UNION ALL
SELECT 'bad_data_check', 'openclaw_policies_out_of_bounds', COUNT(*)::bigint
FROM openclaw_policies
WHERE (max_budget_shift_pct_per_action IS NOT NULL AND (max_budget_shift_pct_per_action < 0 OR max_budget_shift_pct_per_action > 100))
   OR (max_budget_shift_pct_per_day IS NOT NULL AND (max_budget_shift_pct_per_day < 0 OR max_budget_shift_pct_per_day > 100))
   OR (requires_approval_above_pct IS NOT NULL AND (requires_approval_above_pct < 0 OR requires_approval_above_pct > 100))
   OR (cooldown_minutes IS NOT NULL AND cooldown_minutes < 0)
   OR (daily_auto_action_limit IS NOT NULL AND daily_auto_action_limit < 0)
UNION ALL
SELECT 'bad_data_check', 'kpi_channel_negative_metric', COUNT(*)::bigint
FROM kpi_channel_records
WHERE (spend IS NOT NULL AND spend < 0)
   OR (impressions IS NOT NULL AND impressions < 0)
   OR (clicks IS NOT NULL AND clicks < 0)
   OR (ctr IS NOT NULL AND ctr < 0)
   OR (cpc IS NOT NULL AND cpc < 0)
   OR (add_to_cart IS NOT NULL AND add_to_cart < 0)
   OR (purchases IS NOT NULL AND purchases < 0)
   OR (cpa IS NOT NULL AND cpa < 0)
   OR (gmv IS NOT NULL AND gmv < 0)
   OR (roas IS NOT NULL AND roas < 0)
UNION ALL
SELECT 'bad_data_check', 'kpi_campaign_negative_metric', COUNT(*)::bigint
FROM kpi_campaign_records
WHERE (spend IS NOT NULL AND spend < 0)
   OR (impressions IS NOT NULL AND impressions < 0)
   OR (clicks IS NOT NULL AND clicks < 0)
   OR (ctr IS NOT NULL AND ctr < 0)
   OR (cpc IS NOT NULL AND cpc < 0)
   OR (add_to_cart IS NOT NULL AND add_to_cart < 0)
   OR (purchases IS NOT NULL AND purchases < 0)
   OR (cpa IS NOT NULL AND cpa < 0)
   OR (gmv IS NOT NULL AND gmv < 0)
   OR (roas IS NOT NULL AND roas < 0)
UNION ALL
SELECT 'bad_data_check', 'kpi_audience_negative_metric', COUNT(*)::bigint
FROM kpi_audience_records
WHERE (spend IS NOT NULL AND spend < 0)
   OR (impressions IS NOT NULL AND impressions < 0)
   OR (clicks IS NOT NULL AND clicks < 0)
   OR (ctr IS NOT NULL AND ctr < 0)
   OR (cpc IS NOT NULL AND cpc < 0)
   OR (add_to_cart IS NOT NULL AND add_to_cart < 0)
   OR (purchases IS NOT NULL AND purchases < 0)
   OR (cpa IS NOT NULL AND cpa < 0)
   OR (gmv IS NOT NULL AND gmv < 0)
   OR (roas IS NOT NULL AND roas < 0)
UNION ALL
SELECT 'bad_data_check', 'kpi_creative_negative_metric', COUNT(*)::bigint
FROM kpi_creative_records
WHERE (spend IS NOT NULL AND spend < 0)
   OR (impressions IS NOT NULL AND impressions < 0)
   OR (clicks IS NOT NULL AND clicks < 0)
   OR (ctr IS NOT NULL AND ctr < 0)
   OR (cpc IS NOT NULL AND cpc < 0)
   OR (add_to_cart IS NOT NULL AND add_to_cart < 0)
   OR (purchases IS NOT NULL AND purchases < 0)
   OR (cpa IS NOT NULL AND cpa < 0)
   OR (gmv IS NOT NULL AND gmv < 0)
   OR (roas IS NOT NULL AND roas < 0)
ORDER BY item_name;

-- ============================================================================
-- 4) Quick overall summary
-- ============================================================================
WITH
constraint_failures AS (
    SELECT COUNT(*)::bigint AS cnt
    FROM (
        WITH expected_constraints AS (
            SELECT 'clients'::text AS table_name, 'chk_clients_status'::text AS constraint_name UNION ALL
            SELECT 'service_agreements', 'chk_service_agreements_status' UNION ALL
            SELECT 'service_agreements', 'chk_service_agreements_bounds' UNION ALL
            SELECT 'weekly_syncs', 'chk_weekly_syncs_status' UNION ALL
            SELECT 'weekly_syncs', 'chk_weekly_syncs_week_range' UNION ALL
            SELECT 'weekly_syncs', 'uq_weekly_syncs_client_week' UNION ALL
            SELECT 'task_items', 'chk_task_items_priority' UNION ALL
            SELECT 'task_items', 'chk_task_items_status' UNION ALL
            SELECT 'task_items', 'fk_task_items_depends_on' UNION ALL
            SELECT 'risk_items', 'chk_risk_items_severity' UNION ALL
            SELECT 'risk_items', 'chk_risk_items_review_cycle' UNION ALL
            SELECT 'risk_items', 'chk_risk_items_status' UNION ALL
            SELECT 'risk_items', 'chk_risk_items_probability' UNION ALL
            SELECT 'decision_logs', 'chk_decision_logs_source' UNION ALL
            SELECT 'decision_logs', 'chk_decision_logs_type' UNION ALL
            SELECT 'gate_check_results', 'chk_gate_check_results_blocker_level' UNION ALL
            SELECT 'openclaw_actions', 'chk_openclaw_actions_status' UNION ALL
            SELECT 'openclaw_policies', 'chk_openclaw_policies_bounds'
        )
        SELECT e.table_name, e.constraint_name
        FROM expected_constraints e
        LEFT JOIN (
            SELECT rel.relname::text AS table_name, con.conname::text AS constraint_name
            FROM pg_constraint con
            JOIN pg_class rel ON rel.oid = con.conrelid
            JOIN pg_namespace nsp ON nsp.oid = con.connamespace
            WHERE nsp.nspname = 'public'
        ) a
            ON a.table_name = e.table_name
           AND a.constraint_name = e.constraint_name
        WHERE a.constraint_name IS NULL
    ) missing_constraints
),
trigger_failures AS (
    SELECT COUNT(*)::bigint AS cnt
    FROM (
        WITH expected_triggers AS (
            SELECT 'clients'::text AS table_name, 'update_clients_updated_at'::text AS trigger_name UNION ALL
            SELECT 'service_agreements', 'update_service_agreements_updated_at' UNION ALL
            SELECT 'weekly_syncs', 'update_weekly_syncs_updated_at' UNION ALL
            SELECT 'task_items', 'update_task_items_updated_at' UNION ALL
            SELECT 'risk_items', 'update_risk_items_updated_at' UNION ALL
            SELECT 'openclaw_policies', 'update_openclaw_policies_updated_at' UNION ALL
            SELECT 'openclaw_actions', 'update_openclaw_actions_updated_at'
        )
        SELECT e.table_name, e.trigger_name
        FROM expected_triggers e
        LEFT JOIN information_schema.triggers t
          ON t.trigger_schema = 'public'
         AND t.event_object_table = e.table_name
         AND t.trigger_name = e.trigger_name
        WHERE t.trigger_name IS NULL
    ) missing_triggers
),
bad_data_total AS (
    SELECT SUM(bad_count)::bigint AS cnt
    FROM (
        SELECT COUNT(*)::bigint AS bad_count FROM clients
        WHERE status IS NULL OR status NOT IN ('lead', 'active', 'paused', 'closed')
        UNION ALL
        SELECT COUNT(*)::bigint FROM service_agreements
        WHERE status IS NULL OR status NOT IN ('pending', 'partially_signed', 'signed', 'active_paid', 'terminated')
        UNION ALL
        SELECT COUNT(*)::bigint FROM weekly_syncs
        WHERE status IS NULL OR status NOT IN ('draft', 'reviewed', 'published')
        UNION ALL
        SELECT COUNT(*)::bigint FROM weekly_syncs
        WHERE week_start IS NOT NULL AND week_end IS NOT NULL AND week_end < week_start
        UNION ALL
        SELECT COUNT(*)::bigint FROM task_items
        WHERE priority IS NULL OR priority NOT IN ('low', 'medium', 'high', 'critical')
        UNION ALL
        SELECT COUNT(*)::bigint FROM task_items
        WHERE status IS NULL OR status NOT IN ('todo', 'in_progress', 'blocked', 'done', 'cancelled')
        UNION ALL
        SELECT COUNT(*)::bigint FROM risk_items
        WHERE severity IS NULL OR severity NOT IN ('low', 'medium', 'high', 'critical')
        UNION ALL
        SELECT COUNT(*)::bigint FROM risk_items
        WHERE review_cycle IS NULL OR review_cycle NOT IN ('daily', 'weekly', 'biweekly', 'monthly')
        UNION ALL
        SELECT COUNT(*)::bigint FROM risk_items
        WHERE status IS NULL OR status NOT IN ('open', 'monitoring', 'mitigated', 'closed')
        UNION ALL
        SELECT COUNT(*)::bigint FROM risk_items
        WHERE probability IS NOT NULL AND (probability < 0 OR probability > 1)
    ) bad_rows
)
SELECT
    constraint_failures.cnt AS missing_constraints,
    trigger_failures.cnt AS missing_triggers,
    bad_data_total.cnt AS bad_data_rows,
    CASE
      WHEN constraint_failures.cnt = 0
       AND trigger_failures.cnt = 0
       AND bad_data_total.cnt = 0 THEN 'PASS'
      ELSE 'FAIL'
    END AS overall_status
FROM constraint_failures, trigger_failures, bad_data_total;
