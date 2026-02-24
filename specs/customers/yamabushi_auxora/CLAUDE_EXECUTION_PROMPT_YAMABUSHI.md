# Claude Execution Prompt (Yamabushi x Auxora)

Use this document as the single entry prompt for implementation.

---

## 1) Mission

Build the Yamabushi client execution system in Auxora style with:
- Full lifecycle workflow: GTM -> Consensus -> Contract -> Execution -> Weekly Sync -> OpenClaw
- Dual-pane UX: left guided chat, right editable plan/context panel
- Agency-grade operational depth with simple client-facing interaction
- Strict auditability and gate-based progression

---

## 2) Source of Truth (Read First)

Read these files in order:

1. `specs/customers/yamabushi_auxora/README.md`
2. `specs/customers/yamabushi_auxora/IMPLEMENTATION_PLAN_YAMABUSHI_AUXORA.md`
3. `specs/customers/yamabushi_auxora/SPECS_WORKFLOW_AND_STATES.md`
4. `specs/customers/yamabushi_auxora/SPECS_DATA_MODEL_AND_API.md`
5. `specs/customers/yamabushi_auxora/SPECS_PRODUCT_INTERACTION.md`
6. `specs/customers/yamabushi_auxora/SPECS_AGENCY_OPERATIONS.md`
7. `specs/customers/yamabushi_auxora/SPECS_OPENCLAW_HEARTBEAT.md`
8. `specs/customers/yamabushi_auxora/GAP_CLOSURE_NOTES.md`

External client context:
- GTM report, service agreement, weekly sync, and CSV plans from `/Users/huithrive/Downloads/`

---

## 3) Hard Constraints

1. Do not simplify away agreement-critical fields (deposit/refund/notice/sign evidence).
2. Implement KPI ingestion and storage at 4 levels:
   - channel
   - campaign
   - audience
   - creative
3. Enforce stage gates; no manual bypass without audit trail.
4. OpenClaw auto-actions must obey machine guardrails.
5. Every critical mutation must write decision/audit logs.
6. Keep novice UX simple; keep advanced mode powerful.

---

## 4) Build Order (Do Not Reorder)

### Phase 1: Workflow + States
- Implement lifecycle states and gate checks
- Implement blocker handling and escalation routes

### Phase 2: Data + API Contracts
- Create/extend schema from `SPECS_DATA_MODEL_AND_API.md`
- Implement endpoints under `/api/client-ops` and `/api/openclaw`
- Implement agreement completeness endpoint

### Phase 3: Product UX
- Build dual-pane workspace
- Implement novice mode vs advanced mode behavior
- Implement chat <-> panel sync preview and conflict resolution

### Phase 4: Agency Ops
- Implement weekly SOP templates and operational artifact tracking
- Implement risk and decision workflows

### Phase 5: OpenClaw
- Implement heartbeat scheduler
- Implement threshold rule engine and recommendations
- Implement policy CRUD and auto-action guardrails
- Integrate heartbeat output into weekly sync draft

---

## 5) Implementation Checklist

### Backend
- [ ] Agreement model includes all critical business fields
- [ ] Gate result persistence implemented
- [ ] KPI 4-level tables and import APIs implemented
- [ ] DecisionLog supports decision_type and before/after state
- [ ] OpenClaw policies enforced in action execution path

### Frontend
- [ ] Left chat prompt flow for novice users
- [ ] Right panel editable controls for advanced users
- [ ] Stage rail with clear gate pass/fail statuses
- [ ] Weekly sync page with KPI variance and action planning
- [ ] OpenClaw monitor page with alerts/actions/policy visibility

### Quality
- [ ] Contract completeness tests
- [ ] Stage-gate transition tests
- [ ] KPI import validation tests
- [ ] OpenClaw guardrail tests
- [ ] Audit log coverage tests

---

## 6) Fallback Rule

If a feature fails after 3 implementation attempts:
- Mark as blocker
- Implement demo-safe fallback path
- Continue downstream implementation
- Record blocker with root cause, attempted fixes, owner, ETA

---

## 7) Deliverables

At completion, provide:
1. Updated backend models/migrations/APIs
2. Updated frontend dual-pane workflow UI
3. Test report and blocker checklist
4. Short “how to run” instructions for local verification

---

## 8) Definition of Done

Done means:
- A user can move from GTM to weekly optimization in a single coherent system
- Agreement, execution, and optimization are all stateful and auditable
- OpenClaw can monitor, alert, and safely act within policy limits
- Novice and advanced UX both work as designed

