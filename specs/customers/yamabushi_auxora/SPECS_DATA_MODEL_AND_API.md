# Yamabushi x Auxora Data Model & API Spec
## 客户执行生命周期数据与接口规范

Version: 1.0  
Scope: Client execution domain (pre-sales to weekly optimization)

---

## 1) Domain Model | 领域模型

## Core Entities | 核心实体

1. **Client**
2. **GTMPlan**
3. **ConsensusRecord**
4. **ServiceAgreement**
5. **ExecutionPhase**
6. **BudgetPhase**
7. **ChannelPlan**
8. **WeeklySync**
9. **KPIChannelRecord**
10. **KPICampaignRecord**
11. **KPIAudienceRecord**
12. **KPICreativeRecord**
13. **TaskItem**
14. **RiskItem**
15. **DecisionLog**
16. **OpenClawHeartbeat**
17. **OpenClawAlert**
18. **GateCheckResult**
19. **OpenClawPolicy**

---

## 2) Relational Schema (Logical) | 关系模型（逻辑）

### 2.1 Client
- `id` UUID PK
- `name` text
- `industry` text
- `website` text
- `status` enum(`lead`,`active`,`paused`,`closed`)
- `created_at`, `updated_at`

### 2.2 GTM Plan
- `id` UUID PK
- `client_id` FK -> clients.id
- `target_revenue_monthly` numeric
- `target_roas` numeric
- `channel_mix` jsonb
- `roadmap_6m` jsonb
- `status` enum(`draft`,`aligned`,`locked`)
- `created_at`, `updated_at`

### 2.3 Service Agreement
- `id` UUID PK
- `client_id` FK
- `effective_date` date
- `trial_days` int
- `retainer_monthly` numeric
- `spend_fee_min` numeric
- `spend_fee_max` numeric
- `term_months` int
- `deposit_amount` numeric
- `deposit_currency` text
- `deposit_refund_policy` text
- `termination_notice_days` int
- `payment_terms` text
- `phase_boundary` jsonb (trial vs paid service boundary)
- `signer_client_name` text
- `signer_provider_name` text
- `signed_at_client` timestamptz nullable
- `signed_at_provider` timestamptz nullable
- `doc_id` text (e-sign platform id)
- `status` enum(`pending`,`partially_signed`,`signed`,`active_paid`,`terminated`)
- `doc_url` text
- `created_at`, `updated_at`

### 2.4 Execution Phase
- `id` UUID PK
- `client_id` FK
- `name` text
- `stage_order` int
- `start_date`, `end_date`
- `goal` text
- `status` enum(`not_started`,`in_progress`,`blocked`,`done`)
- `created_at`, `updated_at`

### 2.5 Budget Phase
- `id` UUID PK
- `client_id` FK
- `phase_name` text
- `phase_ratio` numeric
- `phase_budget` numeric
- `daily_budget` numeric
- `start_date`, `end_date`
- `status` enum(`planned`,`active`,`completed`)

### 2.6 Channel Plan
- `id` UUID PK
- `budget_phase_id` FK
- `channel` enum(`google`,`meta`,`shopify`,`seo`,`email`,`other`)
- `objective` text
- `budget_ratio` numeric
- `budget_amount` numeric
- `target_kpi` jsonb
- `status` enum(`planned`,`active`,`paused`,`completed`)

### 2.7 Weekly Sync
- `id` UUID PK
- `client_id` FK
- `week_start`, `week_end`
- `summary` text
- `week_goal` text
- `week_result` text
- `key_wins` jsonb
- `key_losses` jsonb
- `performance_overview` jsonb
- `insights` jsonb
- `next_actions` jsonb
- `owner_assignments` jsonb
- `status` enum(`draft`,`reviewed`,`published`)
- `created_by` UUID
- `created_at`, `updated_at`

### 2.8 KPI Channel Record
- `id` UUID PK
- `weekly_sync_id` FK
- `channel` text
- `spend`, `impressions`, `clicks`, `ctr`, `cpc`, `purchases`, `cpa`, `gmv`, `roas` numeric
- `metadata` jsonb

### 2.9 KPI Campaign Record
- `id` UUID PK
- `weekly_sync_id` FK
- `channel` text
- `campaign_id_external` text
- `campaign_name` text
- `spend`, `impressions`, `clicks`, `ctr`, `cpc`, `add_to_cart`, `purchases`, `cpa`, `gmv`, `roas` numeric
- `metadata` jsonb

### 2.10 KPI Audience Record
- `id` UUID PK
- `weekly_sync_id` FK
- `channel` text
- `audience_name` text
- `spend`, `impressions`, `clicks`, `ctr`, `cpc`, `add_to_cart`, `purchases`, `cpa`, `gmv`, `roas` numeric
- `metadata` jsonb

### 2.11 KPI Creative Record
- `id` UUID PK
- `weekly_sync_id` FK
- `channel` text
- `creative_id_external` text
- `creative_name` text
- `spend`, `impressions`, `clicks`, `ctr`, `cpc`, `add_to_cart`, `purchases`, `cpa`, `gmv`, `roas` numeric
- `metadata` jsonb

### 2.12 Task Item
- `id` UUID PK
- `client_id` FK
- `weekly_sync_id` nullable FK
- `title` text
- `description` text
- `owner_role` text
- `priority` enum(`low`,`medium`,`high`,`critical`)
- `status` enum(`todo`,`in_progress`,`blocked`,`done`,`cancelled`)
- `due_date` date
- `depends_on_task_id` UUID nullable
- `created_at`, `updated_at`

### 2.13 Risk Item
- `id` UUID PK
- `client_id` FK
- `weekly_sync_id` nullable FK
- `risk_type` text
- `severity` enum(`low`,`medium`,`high`,`critical`)
- `probability` numeric
- `impact` text
- `mitigation_plan` text
- `owner_role` text
- `review_cycle` enum(`daily`,`weekly`,`biweekly`,`monthly`)
- `status` enum(`open`,`monitoring`,`mitigated`,`closed`)

### 2.14 Decision Log
- `id` UUID PK
- `client_id` FK
- `source` enum(`chat`,`panel`,`system`,`openclaw`)
- `decision_type` enum(`budget`,`creative`,`audience`,`contract`,`ops`,`kpi`)
- `title` text
- `before_state` jsonb
- `after_state` jsonb
- `rationale` text
- `approved_by` UUID nullable
- `created_at`

### 2.15 Gate Check Result
- `id` UUID PK
- `client_id` FK
- `gate_name` text
- `passed` boolean
- `missing_items` jsonb
- `blocker_level` enum(`none`,`low`,`medium`,`high`,`critical`)
- `next_required_action` text
- `created_at` timestamptz

### 2.16 OpenClaw Policy
- `id` UUID PK
- `client_id` FK
- `max_budget_shift_pct_per_action` numeric
- `max_budget_shift_pct_per_day` numeric
- `cooldown_minutes` int
- `daily_auto_action_limit` int
- `requires_approval_above_pct` numeric
- `allowed_action_types` jsonb
- `created_at`, `updated_at`

---

## 3) API Contract | API 合同

Base path: `/api/client-ops`

## 3.1 Client & GTM
- `POST /clients`
- `GET /clients/:id`
- `POST /clients/:id/gtm-plan`
- `GET /clients/:id/gtm-plan`
- `POST /clients/:id/consensus`

## 3.2 Agreement
- `POST /clients/:id/agreement`
- `GET /clients/:id/agreement`
- `POST /clients/:id/agreement/sign`
- `GET /clients/:id/agreement/completeness`

## 3.3 Execution & Budget
- `POST /clients/:id/execution-phases`
- `GET /clients/:id/execution-phases`
- `POST /clients/:id/budget-phases`
- `GET /clients/:id/budget-phases`
- `POST /budget-phases/:id/channel-plans`
- `PATCH /channel-plans/:id`

## 3.4 Weekly Sync
- `POST /clients/:id/weekly-sync`
- `GET /clients/:id/weekly-sync?week=YYYY-MM-DD`
- `POST /weekly-sync/:id/kpi-records/import`
- `PATCH /weekly-sync/:id/publish`
- `POST /weekly-sync/:id/kpi-campaign/import`
- `POST /weekly-sync/:id/kpi-audience/import`
- `POST /weekly-sync/:id/kpi-creative/import`

## 3.5 Tasks / Risks / Decisions
- `POST /clients/:id/tasks`
- `PATCH /tasks/:id`
- `POST /clients/:id/risks`
- `PATCH /risks/:id`
- `POST /clients/:id/decisions`
- `GET /clients/:id/decision-log`

## 3.6 OpenClaw
- `POST /clients/:id/openclaw/heartbeat/run`
- `GET /clients/:id/openclaw/alerts`
- `POST /openclaw/alerts/:id/ack`
- `POST /openclaw/actions/apply`
- `GET /clients/:id/openclaw/policy`
- `PATCH /clients/:id/openclaw/policy`

## 3.7 Gate & Compliance
- `POST /clients/:id/gates/:gateName/check`
- `GET /clients/:id/gates/history`

---

## 4) Request/Response Examples | 请求响应示例

### 4.1 Create Weekly Sync
`POST /api/client-ops/clients/{clientId}/weekly-sync`

```json
{
  "week_start": "2026-02-03",
  "week_end": "2026-02-09",
  "summary": "Meta stable, Google in learning phase.",
  "insights": {
    "positive": ["Meta CPM decreased by 11%"],
    "risks": ["Google zero purchase in week"],
    "actions": [
      "Create Video-1 derivative",
      "Refine search negative keywords"
    ]
  }
}
```

```json
{
  "id": "uuid",
  "status": "draft",
  "created_at": "2026-02-10T10:00:00Z"
}
```

### 4.2 Update Task
`PATCH /api/client-ops/tasks/{taskId}`

```json
{
  "status": "in_progress",
  "owner_role": "MediaBuyer",
  "due_date": "2026-02-15"
}
```

### 4.3 Agreement Completeness
`GET /api/client-ops/clients/{clientId}/agreement/completeness`

```json
{
  "status": "incomplete",
  "missing_fields": [
    "deposit_amount",
    "termination_notice_days",
    "signed_at_client"
  ],
  "completion_score": 0.73
}
```

---

## 5) Permissions & Roles | 权限与角色

Roles:
- `client_novice`
- `client_advanced`
- `agency_operator`
- `agency_admin`
- `system_agent`

Permission matrix:
- `client_novice`: read plan, respond in chat, confirm key decisions
- `client_advanced`: all novice permissions + editable budget/task fields
- `agency_operator`: full operational edit
- `agency_admin`: approval and override
- `system_agent`: write recommendations with audit trail only

---

## 6) Audit Requirements | 审计要求

Every critical mutation must generate an audit record:
- Who changed
- What changed (`before_state`, `after_state`)
- Why (`rationale`)
- Approval reference (if needed)
- Timestamp

Critical mutation examples:
- Budget phase ratio changes
- KPI target updates
- Stage gate bypass
- OpenClaw auto-action execution
- Agreement financial/termination term edits

---

## 7) Error Model | 错误模型

Standard response:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "phase_ratio must sum to 100",
    "details": {
      "field": "phase_ratio"
    }
  }
}
```

Common codes:
- `VALIDATION_ERROR`
- `NOT_FOUND`
- `UNAUTHORIZED`
- `FORBIDDEN`
- `CONFLICT`
- `RATE_LIMITED`
- `INTEGRATION_ERROR`

---

## 8) Acceptance Criteria | 验收标准

1. Data model supports full client lifecycle from GTM to weekly optimization.
2. API contract supports both chat-driven and panel-driven edits.
3. Permissions enforce novice vs advanced vs agency capabilities.
4. Audit logs are complete for all critical operations.
5. Weekly sync and budget phases can be queried and updated reliably.
6. Agreement completeness and gate checks are API-verifiable.
7. KPI model supports channel/campaign/audience/creative four-level analysis.

