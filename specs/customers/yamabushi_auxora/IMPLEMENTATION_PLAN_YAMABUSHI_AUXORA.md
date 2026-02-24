# Yamabushi x Auxora Implementation Plan
## Yamabushi x Auxora 客户专项实施计划

Version: 1.0  
Status: Ready for Claude execution  
Scope: Client-specific full-chain delivery (Pre-sales to OpenClaw operations)

---

## 1) Objective | 目标

Build a production-ready client delivery workflow for Yamabushi that connects:

`GTM report -> consensus -> agreement -> execution -> weekly sync -> OpenClaw optimization`

为 Yamabushi 构建可上线的客户执行链路，覆盖：

`GTM 报告 -> 共识确认 -> 协议签署 -> 执行阶段 -> 每周同步 -> OpenClaw 持续优化`

---

## 2) Normalized Inputs | 输入结构化结果

### 2.1 Source Files | 来源文件
- `Growth Strategy Report - Yamabushi Farms.pdf`
- `Yamabushi ... Service Agreement ... .pdf`
- `Feb _ YamaBushi _ Weekly Sync.pdf`
- `投放计划.csv`
- `项目同步表.csv`

### 2.2 Bilingual Field Dictionary | 双语字段字典

| Domain | English Field | 中文字段 | Type | Example | Notes |
|---|---|---|---|---|---|
| Client | client_name | 客户名称 | string | Yamabushi Farms | from agreement/report |
| Contract | effective_date | 生效日期 | date | 2025-09-16 | from agreement |
| Contract | trial_period_days | 试用期天数 | int | 14 | free trial phase |
| Contract | monthly_retainer | 月固定服务费 | number | 500 | USD |
| Contract | spend_fee_ratio | 投放服务费比例 | range | 5%-10% | post initial term |
| GTM | current_revenue_monthly | 当前月收入 | number | 50000 | USD |
| GTM | target_revenue_monthly | 目标月收入 | number | 250000 | USD, month 6 |
| GTM | target_roas_paid | 付费ROAS目标 | number | 4.5 | by month 6 |
| GTM | channels_priority | 渠道优先级 | array | SEO, Email, Paid Ads | from GTM report |
| Budget Plan | phase_name | 阶段名称 | string | 第一阶段流量铺垫启动期 | from CSV |
| Budget Plan | phase_budget_ratio | 阶段预算占比 | number | 30% / 48% / 22% | 3 phases |
| Budget Plan | channel_split | 渠道拆分 | json | Google 70 / Meta 30 | phase dependent |
| Weekly Sync | week_range | 周期范围 | string | 02/04-02/10 | weekly report |
| Weekly Sync | spend | 花费 | number | 697.30 | USD |
| Weekly Sync | purchases | 购买数 | int | 15 | all from Meta that week |
| Weekly Sync | cpa | 单次获客成本 | number | 46.49 | USD |
| Weekly Sync | roas | ROAS | number | 0.84 | weekly blended |
| Weekly Sync | key_insight | 核心洞察 | text | Meta stable, Google learning | bilingual memo |
| Weekly Sync | next_actions | 下周动作 | array | creative iteration, negative keywords | from TO-DO section |
| Delivery | deliverable_name | 交付物名称 | string | Weekly performance report | from sync table |
| Delivery | owner_role | 责任角色 | enum | Strategist/MediaBuyer/Designer | agency ops |
| Risk | risk_level | 风险等级 | enum | low/medium/high/critical | operational governance |

### 2.3 Data Quality Notes | 数据质量备注
- `投放计划.csv` contains campaign strategy templates (some fashion terms). Keep budget math and phase logic; remap product context to mushroom supplement.
- `项目同步表.csv` has sparse/missing date cells (`?`, `ing`). Treat as draft operational checklist and convert to structured tasks with status defaults.

### 2.4 One-Pass Hardening Checklist | 一次性补齐清单（已纳入）
- Agreement model hardening: deposit/refund/notice/payment/signature evidence.
- Weekly Sync granularity hardening: channel -> campaign -> audience -> creative.
- OpenClaw guardrail hardening: hard policy fields and action limits.
- Stage gate compliance hardening: agreement completeness + credential + attribution checks.
- Execution order hardening: workflow/data first, then UX.

---

## 3) Phase Plan | 阶段计划

## Phase A: Pre-Sales Intelligence (Week -2 to 0)
### Goal | 目标
Produce GTM package and align on growth thesis.

### Deliverables | 交付物
- Market/competitor analysis
- Audience and positioning
- 6-month roadmap and KPI tree
- Budget recommendation and channel mix

### Entry Criteria | 进入条件
- Website + product basics available

### Exit Criteria | 退出条件
- Client confirms GTM assumptions and target KPIs

---

## Phase B: Consensus & Agreement (Week 0)
### Goal | 目标
Lock scope, responsibilities, payment model, and communication cadence.

### Deliverables | 交付物
- Signed service agreement
- Service boundary checklist
- Weekly sync cadence and stakeholder list

### Exit Criteria | 退出条件
- Contract signed
- Trial-to-paid transition conditions approved
- Agreement completeness score reaches 100% for critical fields

---

## Phase C: Build & Setup Execution (Weeks 1-2)
### Goal | 目标
Setup core growth infrastructure and launch baseline campaigns.

### Workstreams | 工作流
1. Store and tracking setup (Pixel, events, attribution)
2. Landing + creative readiness
3. Initial media launch (Meta + Google)
4. KPI dashboard baseline

### Acceptance | 验收
- Event tracking validated
- Initial campaigns live
- Weekly reporting schema operational
- Credential baseline and attribution validation passed

---

## Phase D: Phase-Based Media Scaling (Weeks 3-8)
### Goal | 目标
Run 3-stage budget plan with controlled learning and conversion ramp-up.

### Stage Targets | 阶段目标
- Stage 1: Traffic seeding, ROAS 0.8-1.0
- Stage 2: Conversion ramp, ROAS 1.0-1.5
- Stage 3: Stability and retargeting, ROAS 1.5-2.0

### Acceptance | 验收
- Stage budget ratio and channel split respected
- Weekly optimization decisions logged
- Audience and creative performance segmented

---

## Phase E: Weekly Sync Operating Loop (Weeks 3+)
### Goal | 目标
Convert raw metrics into weekly decisions and next actions.

### Weekly Loop | 周循环
1. Data ingest (Meta/Google/Shopify)
2. KPI variance review (spend, CPA, ROAS, conversion)
3. Audience/creative diagnosis
4. Decision log update
5. Next-week action list and owner assignment

### Acceptance | 验收
- Weekly report produced every cycle
- Action items have owner + deadline
- Risk register updated

---

## Phase F: OpenClaw Optimization (Continuous)
### Goal | 目标
Move from reactive management to proactive heartbeat optimization.

### Mechanism | 机制
- Scheduled heartbeat checks
- Threshold alerting
- Suggested actions for budget, bidding, creatives, and targeting
- Daily digest + weekly strategy summary

### Acceptance | 验收
- Alerts are actionable (not noisy)
- Recommendation adoption is tracked
- Score trend improves over rolling 4 weeks

---

## 4) Milestones & KPIs | 里程碑与指标

### Business Milestones | 业务里程碑
- M1: Contract + setup complete
- M2: Tracking accuracy verified
- M3: Stable weekly optimization loop
- M4: ROAS trend above baseline

### KPI Set | 核心KPI
- Revenue
- ROAS (blended and by channel)
- CPA
- Conversion rate
- Add-to-cart cost
- Subscription adoption

---

## 5) Blocker Policy | 阻塞策略

### Classification | 分级
- P0: launch-blocking
- P1: major performance risk
- P2: optimization backlog

### Resolution Rule | 处理规则
- 3 attempts rule: if unresolved after 3 cycles, apply fallback/demo path and continue.
- All blockers require: root cause, attempted fixes, owner, ETA.

---

## 6) Roles & Ownership | 角色与责任

| Role | Responsibility |
|---|---|
| Strategist | GTM assumptions, hypothesis, KPI framework |
| Media Buyer | Budget pacing, campaign optimization |
| Creative Lead | Creative iteration roadmap and testing |
| Analyst | Weekly sync report and insight validation |
| PM Observer | Storyboard and UX flow quality |
| Credential Agent | API/secret readiness and setup guidance |

---

## 7) Definition of Done | 完成定义

This plan is complete when:
1. All phases A-F have explicit deliverables and owners.
2. Weekly sync loop is repeatable and measurable.
3. OpenClaw optimization is active with traceable outcomes.
4. Documents are actionable for Claude to implement frontend + backend workflows.

