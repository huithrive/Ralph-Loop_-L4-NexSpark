# DB Verification Runbook

This runbook explains how to troubleshoot failures from:

- `npm run verify:migrations`
- `backend/migrations/009_post_migration_verification.sql`

Scope:
- Constraint check failures
- Trigger check failures
- Residual bad data failures

---

## 1) Quick Start

From `backend/`:

```bash
npm run verify:migrations
```

Read output in this order:
1. `4) Overall Summary`
2. `1) Constraint Check`
3. `2) Trigger Check`
4. `3) Residual Bad Data Check`

If `overall_status` is `FAIL`, continue with sections below.

---

## 2) Failure Triage Matrix

- `missing_constraints > 0`
  - Cause: hardening migration (`008`) not applied or partially applied.
  - Action: inspect missing constraint name, re-run migrations, then apply targeted `ALTER TABLE ... ADD CONSTRAINT`.

- `missing_triggers > 0`
  - Cause: trigger creation failed or table was recreated without trigger.
  - Action: re-create trigger using `update_updated_at_column()`.

- `bad_data_rows > 0`
  - Cause: legacy/invalid rows inserted before constraints, or constraints not active.
  - Action: identify item from bad-data list and run targeted cleanup update.

---

## 3) Locate Missing Constraint -> Table

Use the exact `constraint_name` shown as `FAIL`:

```sql
SELECT
  con.conname AS constraint_name,
  rel.relname AS table_name,
  pg_get_constraintdef(con.oid) AS definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE con.conname = '<constraint_name_from_output>';
```

If no row is returned, create it manually (example):

```sql
ALTER TABLE weekly_syncs
ADD CONSTRAINT chk_weekly_syncs_status
CHECK (status IN ('draft', 'reviewed', 'published'));
```

---

## 4) Locate Missing Trigger -> Table

Use the exact `item_name` from trigger check:

```sql
SELECT
  trigger_name,
  event_object_table AS table_name,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name = '<trigger_name_from_output>';
```

If missing, recreate (example):

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_weekly_syncs_updated_at ON weekly_syncs;
CREATE TRIGGER update_weekly_syncs_updated_at
BEFORE UPDATE ON weekly_syncs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 5) Fix Residual Bad Data by Item

Find rows for one failing item (example: `weekly_syncs_invalid_status`):

```sql
SELECT id, status
FROM weekly_syncs
WHERE status IS NULL OR status NOT IN ('draft', 'reviewed', 'published')
LIMIT 100;
```

Patch rows:

```sql
UPDATE weekly_syncs
SET status = 'draft'
WHERE status IS NULL OR status NOT IN ('draft', 'reviewed', 'published');
```

Common cleanup templates:

```sql
-- OpenClaw policy percentage bounds
UPDATE openclaw_policies
SET max_budget_shift_pct_per_action = LEAST(GREATEST(COALESCE(max_budget_shift_pct_per_action, 0), 0), 100),
    max_budget_shift_pct_per_day    = LEAST(GREATEST(COALESCE(max_budget_shift_pct_per_day, 0), 0), 100),
    requires_approval_above_pct     = LEAST(GREATEST(COALESCE(requires_approval_above_pct, 0), 0), 100);

-- Risk probability bounds
UPDATE risk_items
SET probability = LEAST(GREATEST(probability, 0), 1)
WHERE probability IS NOT NULL;
```

---

## 6) Re-Run Sequence

After fixes:

```bash
cd backend
npm run migrate
npm run verify:migrations
```

Target final output:
- `missing_constraints = 0`
- `missing_triggers = 0`
- `bad_data_rows = 0`
- `overall_status = PASS`

---

## 7) Safety Notes

- Run cleanup updates in a transaction for production:
  - `BEGIN; ... COMMIT;`
- Backup before bulk updates.
- Avoid dropping constraints in production unless absolutely necessary.
- Prefer data correction over relaxing constraints.
