# Yamabushi x Auxora Client Pack
## Claude Execution Entry

This folder contains the client-specific documentation pack for Yamabushi.

---

## Files

1. `IMPLEMENTATION_PLAN_YAMABUSHI_AUXORA.md`
2. `SPECS_PRODUCT_INTERACTION.md`
3. `SPECS_WORKFLOW_AND_STATES.md`
4. `SPECS_DATA_MODEL_AND_API.md`
5. `SPECS_AGENCY_OPERATIONS.md`
6. `SPECS_OPENCLAW_HEARTBEAT.md`
7. `CLAUDE_EXECUTION_PROMPT_YAMABUSHI.md`
8. `DB_MIGRATION_DRAFT_YAMABUSHI.md`
9. `GAP_CLOSURE_NOTES.md`

---

## Recommended Implementation Order for Claude

### Step 0: Single Entry Prompt + Migration Plan
Read:
- `CLAUDE_EXECUTION_PROMPT_YAMABUSHI.md`
- `DB_MIGRATION_DRAFT_YAMABUSHI.md`

Implement:
- Follow fixed build order and hard constraints
- Apply additive DB migrations before strict API validation

### Step 1: Foundation
Read:
- `IMPLEMENTATION_PLAN_YAMABUSHI_AUXORA.md`
- `SPECS_WORKFLOW_AND_STATES.md`

Implement:
- Core lifecycle states
- Stage gates
- Task/risk/decision skeleton

### Step 2: Data + APIs
Read:
- `SPECS_DATA_MODEL_AND_API.md`

Implement:
- Domain entities
- API endpoints
- Permission matrix and audit model

### Step 3: Product UX
Read:
- `SPECS_PRODUCT_INTERACTION.md`

Implement:
- Dual-pane workspace
- Novice/Advanced role behavior
- Chat-panel synchronization and audit logging

### Step 4: Agency Operations
Read:
- `SPECS_AGENCY_OPERATIONS.md`

Implement:
- Weekly meeting SOP templates
- Deliverable checklists
- Escalation and SLA flows

### Step 5: OpenClaw Loop
Read:
- `SPECS_OPENCLAW_HEARTBEAT.md`

Implement:
- Heartbeat job
- Threshold rules
- Recommendations and auto-action policy
- Weekly sync integration

---

## Acceptance Sequence

1. Lifecycle states validated (PreSales -> Optimization)
2. Weekly sync generated with KPIs + actions
3. Dual-pane interaction fully functional
4. Audit logs generated on critical changes
5. OpenClaw alerts and recommendations visible and actionable
6. Agreement completeness and gate compliance checks pass

---

## Notes

- Keep user-facing UX simple and guided.
- Keep agency operations rich and explicit.
- Apply bilingual labels for key business objects in UI and reports.

