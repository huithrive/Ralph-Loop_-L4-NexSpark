# NexSpark Backend

## Migration Verification

- Run all migrations:
  - `npm run migrate`
- Run migration verification report:
  - `npm run verify:migrations`
- Troubleshooting guide:
  - `../docs/DB_VERIFICATION_RUNBOOK.md`

## Strategist Part I Import

- Import from extracted `NexSpark-main.zip`:
  - `npm run import:strategist-part1`
- Imported snapshot location:
  - `strategist/` (active baseline)
  - `strategist_part1/` (legacy imported snapshot)
- Import metadata:
  - `strategist/IMPORT_MANIFEST.json`

### Baseline Policy

- Strategist baseline is now `backend/strategist/` (imported Part I code).
- Legacy Express strategist runtime under `backend/api/strategist/` has been removed.
- Current backend proxies `/api/strategist/*` to `STRATEGIST_RUNTIME_URL`.

### Strategist Runtime Bridge

- Configure in `backend/.env`:
  - `STRATEGIST_RUNTIME_URL=https://your-strategist-runtime-url`
  - Optional: `STRATEGIST_RUNTIME_BEARER_TOKEN=...`
  - Optional: `STRATEGIST_RUNTIME_API_KEY=...`
- Request mapping examples:
  - `/api/strategist/interview/*` -> `/api/interview/*` (upstream)
  - `/api/strategist/reports/*` -> `/api/report/*` (upstream)
