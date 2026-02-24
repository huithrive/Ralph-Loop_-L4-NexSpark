# DB Migration Draft (Minimum Set)
## Yamabushi x Auxora

This is a minimum migration draft to align database schema with the updated specs.

---

## 1) Migration Strategy

Order:
1. Additive schema changes first (new columns/tables/indexes)
2. Backfill defaults
3. Add constraints after backfill
4. Release API changes
5. Enable strict gate checks

Safe rollout principle:
- Prefer nullable-add + progressive validation
- Avoid destructive changes in first rollout

---

## 2) Migration Set

## M01: Service Agreement hardening

### Target table
- `service_agreements` (create if not exists)

### New/required columns
- `deposit_amount NUMERIC`
- `deposit_currency TEXT DEFAULT 'USD'`
- `deposit_refund_policy TEXT`
- `termination_notice_days INT`
- `payment_terms TEXT`
- `phase_boundary JSONB`
- `signer_client_name TEXT`
- `signer_provider_name TEXT`
- `signed_at_client TIMESTAMPTZ`
- `signed_at_provider TIMESTAMPTZ`
- `doc_id TEXT`
- `status TEXT` (allow values: pending, partially_signed, signed, active_paid, terminated)

### Indexes
- `idx_service_agreements_client_id`
- `idx_service_agreements_status`

---

## M02: Weekly Sync expansion

### Target table
- `weekly_syncs`

### New columns
- `week_goal TEXT`
- `week_result TEXT`
- `key_wins JSONB DEFAULT '[]'::jsonb`
- `key_losses JSONB DEFAULT '[]'::jsonb`
- `owner_assignments JSONB DEFAULT '[]'::jsonb`

### Indexes
- `idx_weekly_syncs_client_week` on `(client_id, week_start, week_end)`

---

## M03: KPI 4-level detail tables

### New table: `kpi_channel_records`
- `id UUID PK`
- `weekly_sync_id UUID FK`
- `channel TEXT`
- metric columns:
  - `spend NUMERIC`
  - `impressions NUMERIC`
  - `clicks NUMERIC`
  - `ctr NUMERIC`
  - `cpc NUMERIC`
  - `add_to_cart NUMERIC`
  - `purchases NUMERIC`
  - `cpa NUMERIC`
  - `gmv NUMERIC`
  - `roas NUMERIC`
- `metadata JSONB`

### New table: `kpi_campaign_records`
- `id UUID PK`
- `weekly_sync_id UUID FK`
- `channel TEXT`
- `campaign_id_external TEXT`
- `campaign_name TEXT`
- same metric columns
- `metadata JSONB`

### New table: `kpi_audience_records`
- `id UUID PK`
- `weekly_sync_id UUID FK`
- `channel TEXT`
- `audience_name TEXT`
- same metric columns
- `metadata JSONB`

### New table: `kpi_creative_records`
- `id UUID PK`
- `weekly_sync_id UUID FK`
- `channel TEXT`
- `creative_id_external TEXT`
- `creative_name TEXT`
- same metric columns
- `metadata JSONB`

### Suggested indexes
- `idx_kpi_*_weekly_sync_id`
- `idx_kpi_campaign_channel_campaign_id`
- `idx_kpi_audience_channel_audience_name`
- `idx_kpi_creative_channel_creative_id`

---

## M04: Decision and risk enhancements

### Target table: `decision_logs`
- add `decision_type TEXT` with values:
  - budget, creative, audience, contract, ops, kpi

### Target table: `risk_items`
- add `owner_role TEXT`
- add `review_cycle TEXT` with values:
  - daily, weekly, biweekly, monthly

### Target table: `task_items`
- add `depends_on_task_id UUID NULL`

---

## M05: Gate checks

### New table: `gate_check_results`
- `id UUID PK`
- `client_id UUID FK`
- `gate_name TEXT`
- `passed BOOLEAN`
- `missing_items JSONB`
- `blocker_level TEXT`
- `next_required_action TEXT`
- `checked_at TIMESTAMPTZ DEFAULT now()`

### Indexes
- `idx_gate_checks_client_gate`
- `idx_gate_checks_checked_at`

---

## M06: OpenClaw policies and enriched actions

### New table: `openclaw_policies`
- `id UUID PK`
- `client_id UUID FK UNIQUE`
- `max_budget_shift_pct_per_action NUMERIC`
- `max_budget_shift_pct_per_day NUMERIC`
- `cooldown_minutes INT`
- `daily_auto_action_limit INT`
- `requires_approval_above_pct NUMERIC`
- `allowed_action_types JSONB DEFAULT '[]'::jsonb`
- `blocked_action_types JSONB DEFAULT '[]'::jsonb`
- `created_at TIMESTAMPTZ DEFAULT now()`
- `updated_at TIMESTAMPTZ DEFAULT now()`

### Target table: `openclaw_actions`
- add `policy_snapshot JSONB`
- add `why_triggered TEXT`
- add `estimated_impact JSONB`
- add `rollback_plan JSONB`

---

## 3) Example SQL Snippets

```sql
-- Example: add columns to service_agreements
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
  ADD COLUMN IF NOT EXISTS doc_id TEXT;
```

```sql
-- Example: create gate_check_results
CREATE TABLE IF NOT EXISTS gate_check_results (
  id UUID PRIMARY KEY,
  client_id UUID NOT NULL,
  gate_name TEXT NOT NULL,
  passed BOOLEAN NOT NULL,
  missing_items JSONB DEFAULT '[]'::jsonb,
  blocker_level TEXT,
  next_required_action TEXT,
  checked_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 4) Data Backfill Notes

- For historical agreements:
  - set `status = 'signed'` where doc_url exists and no status.
- For weekly_sync existing rows:
  - initialize `key_wins`, `key_losses`, `owner_assignments` as empty arrays.

---

## 5) Rollback Plan

If rollout fails:
1. Disable strict gate validation at API layer.
2. Keep additive columns/tables (no destructive rollback required).
3. Re-run with reduced constraints and staged data backfill.

---

## 6) Post-Migration Verification Checklist

- [ ] Agreement completeness endpoint returns expected missing fields
- [ ] KPI imports succeed for all 4 granularities
- [ ] Gate check records are written at transitions
- [ ] OpenClaw policy is readable/updatable per client
- [ ] Auto-actions persist policy snapshot and rollback info

