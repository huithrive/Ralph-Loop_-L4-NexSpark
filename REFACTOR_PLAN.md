# Auxora — OpenClaw Wiring Plan

> Updated: 2026-02-24 | Principle: WIRING, not rewriting. Frontend cards are done. Backend logic exists. We're adding the OpenClaw nervous system in between.

---

## 0. What Already Exists (Do Not Rebuild)

### Frontend — V3 App (`htmx-ui/views/auxora/v3-app.ejs` + `data/auxora-v3-data.js`)

Served at `localhost:3001/auxora/v3/app`. Cream/warm theme (Playfair Display, `#FAF7F4`/`#BF6744`/`#4A6741`). **This is final — no dark dashboard.**

- **Layout**: Left chat + right canvas dual panel, resize handle
- **4 Tabs**: Build Plan → Connect & Launch → Monitor → Revenue
- **Journey Bar**: 4 milestones (Plan → Connect → Live → Revenue)
- **Dynamic Stepper**: Per-stage step configs (11 stage types)
- **Simple/Pro mode toggle**: Controls detail level on cards
- **Agent Status Bar**: Spinner + action count + expandable log
- **Canvas Detail Overlay**: Slide-over for deep-dive views

**50+ card types in `v3Data.cards`** — all rendering logic complete in `auxora-v3.js`.

### Backend — 4 Modules (~19K lines)

| Module | Key Services | Key APIs |
|--------|-------------|----------|
| **Strategist** | ResearchResult, InterviewSession, GTMReport models; researchParser | `api/strategistProxy.js` |
| **Executor** | shopifyService, lovableService, domainService, creativeService, pixverseService | `api/executor/{creative,domains,landingPages,shopify}.js` |
| **Advertiser** | gomarbleMcpService, Campaign/OAuthToken models | `api/advertiser/{auth,campaign,pixel}.js` |
| **Analyzer** | analyticsService, optimizerService, monitoringService, dashboardService, reportService | `api/analyzer/{performance,optimize,dashboard,reports,health}.js` |

### What's Missing: The Nervous System

No heartbeat loop. No memory layer. No trust boundaries. No card generation from real data. No out-of-app notifications. That's what this plan wires up.

---

## 1. V3 Frontend Cards → Backend Service Mapping

### 1.1 Card-to-Service Table

Every card in `v3Data.cards` mapped to: which backend service generates it, what triggers it, and which OpenClaw mechanism controls it.

#### Tab 1: Build Plan (Onboarding)

| Card Key | Card Type | Backend Service | Trigger | OpenClaw Mechanism |
|----------|-----------|----------------|---------|-------------------|
| `q_website` | question | — (user input) | Chat flow start | — |
| `q_product` | question | — (user input) | Sequential after q_website | — |
| `q_revenue` | question | — (user input) | Sequential | — |
| `q_goal` | question | — (user input) | Sequential | — |
| `q_budget` | question | — (user input) | Sequential | — |
| `q_platform` | question | — (user input) | Sequential | — |
| `research_progress` | progress | `strategistProxy.js` → Strategist worker | User submits URL | Agent Status Bar shows progress |
| `gtm_report` | report | `ResearchResult` + `GTMReport` models via Strategist | Research complete | Canvas slide-over |
| `gtm_report_template` | report | `GTMReport` model (full 9-section version) | Same as above (detailed view) | Canvas slide-over |
| `competitor_research` | report | `ResearchResult` model + Strategist parser | Part of GTM research | Canvas section |
| `decision_revenue` | action | `GTMReport.phases[].targetOutcome` | Strategy stage start | L3 trust (user confirms) |
| `decision_roas` | action | `GTMReport.kpiTargets` | Sequential decision flow | L3 trust |
| `decision_channels` | action | `GTMReport.monthlyAllocation` | Sequential | L3 trust |
| `decision_budget` | action | `GTMReport.scalingRules` | Sequential | L3 trust |
| `decision_audiences` | action | `GTMReport.idealCustomerProfile` | Sequential | L3 trust |
| `strategy_confirmed` | milestone | — (client-side state) | All 5 decisions approved | Memory: append to USER.md |

#### Tab 2: Connect & Launch (Execution)

| Card Key | Card Type | Backend Service | Trigger | OpenClaw Mechanism |
|----------|-----------|----------------|---------|-------------------|
| `connect_shopify` | connection | `shopifyService.initiateOAuth()` | Execution stage start | L3 trust (account access) |
| `shopify_connected` | progress | `shopifyService.syncProducts()` | OAuth callback success | Agent Status Bar |
| `connect_meta` | connection | `api/advertiser/auth.js` → GoMarble OAuth | Sequential | L3 trust |
| `connect_google` | connection | `api/advertiser/auth.js` → GoMarble OAuth | Sequential | L3 trust |
| `install_tracking` | action | `api/advertiser/pixel.js` | All accounts connected | L2 trust (confirm) |
| `tracking_progress` | progress | `api/advertiser/pixel.js` → verify events | User approves tracking | Agent Status Bar |
| `setup_complete` | milestone | — (all connections verified) | All 4 green | Memory: log to daily |
| `account_setup` | checklist | Aggregated from shopify/meta/google/pixel status | Setup stage | Canvas dashboard |
| `service_agreement` | agreement | — (static content) | Post-strategy | L3 trust (legal) |
| `plan_budget` | action | `GTMReport.phases` | Campaign planning start | L2 trust |
| `plan_channels` | action | `GTMReport.monthlyAllocation` | Sequential | L2 trust |
| `plan_objective` | action | — (recommendation engine) | Sequential | L2 trust |
| `plan_structure` | action | — (campaign template engine) | Sequential | L2 trust |
| `plan_audiences_enhanced` | action | `GTMReport.idealCustomerProfile` + GoMarble | Sequential | L2 trust |
| `plan_budget_allocation` | action | `GTMReport.scalingRules` | Sequential | L2 trust |
| `plan_creatives_enhanced` | action | `creativeService` inventory | Sequential | L2 trust |
| `plan_review_summary` | action | Aggregation of all plan_* cards | Final review | L3 trust (approve & launch) |
| `plan_approved` | milestone | — | User approves summary | Memory: full plan to MEMORY.md |
| `launch_progress` | progress | `gomarbleMcpService.createCampaign()` sequence | Plan approved | Agent Status Bar |
| `launch_checklist` | checklist | Aggregated from pixel/tags/UTM/audiences/creatives/review | During launch | Canvas |
| `youre_live` | milestone | Campaign status = active from GoMarble | All campaigns submitted | Memory + Notification |

#### Tab 3: Monitor (OpenClaw)

| Card Key | Card Type | Backend Service | Trigger | OpenClaw Mechanism |
|----------|-----------|----------------|---------|-------------------|
| `learning_phase_expectations` | info | — (static, shown once) | Post-launch | Memory: preference stored |
| `notification_preference` | preference | `notificationService.js` (NEW) | 48h post-launch | Memory: USER.md prefs |
| `what_to_expect` | info | — (static) | Post-launch | — |
| `first_48h_report` | report | `analyticsService.getPerformanceData()` | heartbeatLoop at T+48h | Heartbeat trigger |
| `daily_compact` | report | `analyticsService` snapshot | heartbeatLoop daily | Heartbeat |
| `daily_briefing` | report | `reportService.generateDailyReport()` | heartbeatLoop morning | Heartbeat |
| `daily_briefing_enhanced` | report | `reportService` + `dashboardService` | heartbeatLoop (enhanced view) | Heartbeat + Canvas |
| `cpa_spike` | alert | `optimizerService.evaluateRules()` → `high_cpa` rule | heartbeatLoop detects anomaly | **L2 trust** + Email notification |
| `cpa_spike_detailed` | alert | Same + `memoryService.assembleContext()` for cause analysis | Same (Pro mode view) | L2 trust |
| `neg_keywords` | auto-action | `optimizerService` → `gomarbleMcpService` | heartbeatLoop + search term analysis | **L1 trust** (auto, logged) |
| `auto_action_keywords` | auto-action | Same as above (display variant) | Same | L1 trust |
| `week1_report` | report | `reportService.generateWeeklyReport()` | heartbeatLoop Monday AM | Heartbeat |
| `week2_report` | report | Same | Monday AM week 2 | Heartbeat |
| `week3_report` | report | Same | Monday AM week 3 | Heartbeat |
| `week4_report` | report | Same | Monday AM week 4 | Heartbeat |
| `weekly_report` | report | Same (generic) | Every Monday | Heartbeat |
| `month2_report` | report | `reportService.generateMonthlyReport()` | Month boundary | Heartbeat |

#### Tab 3: Monitor — Recommendation Cards

| Card Key | Card Type | Backend Service | Trigger | Trust Level |
|----------|-----------|----------------|---------|-------------|
| `rec_scale_vitamins` | action | `optimizerService.evaluateRules()` → `scale_winner` | Weekly report generation | **L2 confirm** |
| `rec_pause_broad` | action | `optimizerService` → `low_roas` rule | Weekly report | **L2 confirm** |
| `rec_video_test` | action | `creativeService` + fatigue detection | Weekly report | **L2 confirm** |
| `week1_rec_wagyu` | action | `optimizerService` → `scale_winner` | Week 1 report | L2 confirm |
| `week1_rec_pause_organic` | action | `optimizerService` → `low_roas` | Week 1 report | L2 confirm |
| `week1_rec_new_video` | action | `creativeService` + CTR analysis | Week 1 report | L2 confirm |
| `week3_rec_foodies` | action | `optimizerService` → audience expansion | Week 3 report | L2 confirm |
| `week3_rec_retargeting` | action | `optimizerService` → cart abandonment | Week 3 report | L2 confirm |
| `week3_rec_budget_increase` | action | `optimizerService` → `scale_budget` rule | Week 3 report | **L3 approve** (>30%) |
| `phase2_transition` | action | Phase boundary logic in heartbeat | Week 2 milestones met | L3 approve |

#### Tab 4: Revenue (Results & Scaling)

| Card Key | Card Type | Backend Service | Trigger | Trust Level |
|----------|-----------|----------------|---------|-------------|
| `campaigns_live` | milestone | Campaign status check | Launch confirmed | Memory log |
| `roas_target` | milestone | `analyticsService` → ROAS crosses target | heartbeatLoop check | Memory + Notification |
| `phase2_milestone` | milestone | Phase metrics check | ROAS target exceeded | Memory + Notification |
| `revenue_25k_milestone` | milestone | Revenue threshold check | Monthly revenue cross | Memory + Notification |
| `scale_budget` | action | `optimizerService` → scale rules | Phase 3 trigger | **L3 approve** |
| `scale_tiktok` | action | Channel expansion logic | Proven ROAS + video performance | L3 approve |
| `scale_email` | action | Customer count threshold | Customer base > 50 | L2 confirm |

### 1.2 Canvas Data → Backend Service Mapping

| Canvas Key | Backend Service | Trigger |
|------------|----------------|---------|
| `competitor_analysis` | `ResearchResult` model via Strategist | GTM report gen |
| `setupDashboard` | Aggregated OAuth + pixel status | Setup stage |
| `campaignHierarchy` | `gomarbleMcpService.getCampaignStructure()` | Post-launch |
| `budgetWaterfall` | `dashboardService.getBudgetData()` | Post-launch |
| `creativeComparison` | `analyticsService` + `creativeService` | Weekly report |
| `dailySpendTracker` | `analyticsService.getDailySpend()` | Daily heartbeat |
| `campaignPlan` | `GTMReport` budget phases | Campaign planning |
| `launchDashboard` | `gomarbleMcpService` + pixel status | Launch |
| `openclawDashboard` | `heartbeatLoop` status + `actionCardService` | Monitor tab |
| `resultsDashboards.*` | `dashboardService` + `reportService` | Results tab |

---

## 2. OpenClaw Layer Architecture

### 2.1 New Files to Create

```
backend/
├── services/
│   ├── openclaw/
│   │   ├── heartbeatLoop.js          # Core scheduler — the nervous system
│   │   ├── actionCardService.js       # Card generation + trust routing + execution
│   │   ├── memoryService.js           # Per-client SOUL/USER/MEMORY markdown
│   │   ├── notificationService.js     # Multi-channel delivery (in-app/email/WhatsApp)
│   │   └── permissionService.js       # Trust level classification
│   └── ...existing services unchanged
├── api/
│   ├── openclaw/
│   │   ├── heartbeat.js               # GET/POST heartbeat status/trigger/history
│   │   ├── actions.js                 # GET/POST action cards CRUD
│   │   ├── memory.js                  # GET/PUT client context
│   │   ├── notifications.js           # GET/PUT notification preferences
│   │   └── permissions.js             # GET/PUT trust config
│   └── ...existing APIs unchanged
├── config/
│   └── openclawConfig.js              # All thresholds, intervals, trust defaults
├── templates/
│   └── notifications/
│       ├── email/
│       │   ├── emergency-pause.html       # L3: "We paused your ads"
│       │   ├── budget-alert.html          # L3: "Spending way over budget"
│       │   ├── tracking-broken.html       # L3: "We can't measure your ads"
│       │   ├── weekly-summary.html        # L2: Monday morning recap
│       │   ├── action-needed.html         # L2: "We have a suggestion"
│       │   ├── daily-digest.html          # L1: Optional daily auto-action log
│       │   ├── milestone-reached.html     # Celebration: "You hit $25K!"
│       │   └── welcome-live.html          # "Your ads are live!"
│       └── whatsapp/
│           ├── emergency-pause.txt
│           ├── budget-alert.txt
│           ├── tracking-broken.txt
│           ├── weekly-summary.txt
│           ├── action-needed.txt
│           └── milestone-reached.txt
└── data/
    ├── auxora/
    │   ├── SOUL.md                    # Auxora personality
    │   └── HEARTBEAT.md               # Check routine template
    └── clients/
        └── {clientId}/
            ├── USER.md                # Client preferences + notification prefs
            ├── MEMORY.md              # Long-term learnings
            ├── PERMISSIONS.md         # Trust boundary overrides
            └── memory/
                └── YYYY-MM-DD.md      # Daily operation logs
```

### 2.2 Existing Files to Modify

| File | Change | Lines |
|------|--------|-------|
| `backend/server.js` | Register `/api/openclaw/*` routes, start heartbeatLoop on listen | +20 |
| `backend/services/analyzer/optimizerService.js` | Export `evaluateRules(metrics)` as pure function (no side effects) | +35 |
| `backend/services/analyzer/analyticsService.js` | Add `getClientMetricsSnapshot(clientId)` returning flat metrics obj | +15 |
| `backend/api/advertiser/campaign.js` | Add `executeBulkAction(actions)` for batch pause/unpause/budget | +25 |
| `htmx-ui/routes/v3-api.js` | Add `/api/v3/openclaw/*` proxy endpoints for V3 app | +30 |

### 2.3 Files NOT Modified

All Executor services (shopify, domain, lovable, creative, pixverse) — called as-is.
All Strategist models and parsers — called as-is.
All test files — kept, new tests added separately.
Frontend CSS/JS — card rendering is done; new cards use existing card types.

---

## 3. Component Specifications

### 3.1 `heartbeatLoop.js` — The Nervous System

```
┌─────────────────────────────────────────────────────────┐
│                    heartbeatLoop.js                       │
│                                                          │
│  node-cron: "*/30 * * * *" (every 30 min)               │
│                                                          │
│  For each active client:                                 │
│    1. analyticsService.getClientMetricsSnapshot(id)      │
│    2. optimizerService.evaluateRules(metrics)            │
│    3. memoryService.assembleContext(id)                   │
│    4. actionCardService.generateCards(rules, context)     │
│    5. L1 cards → actionCardService.executeCard(card)     │
│    6. L2/L3 cards → DB queue + notificationService       │
│    7. memoryService.appendDailyLog(id, results)          │
│    8. Check milestones (ROAS target, revenue, phase)     │
│    9. Generate reports if scheduled (daily/weekly)        │
│                                                          │
│  Calls these EXISTING services:                          │
│    → analyticsService.getPerformanceData()               │
│    → optimizerService.evaluateRules() [new export]       │
│    → reportService.generateWeeklyReport()                │
│    → reportService.generateDailyReport()                 │
│    → monitoringService.performHealthCheck()              │
│    → gomarbleMcpService (via actionCardService)          │
│                                                          │
│  Calls these NEW services:                               │
│    → memoryService                                       │
│    → actionCardService                                   │
│    → notificationService                                 │
│    → permissionService                                   │
└─────────────────────────────────────────────────────────┘
```

**Special heartbeat triggers** (not just every-30-min):
- **T+48h post-launch**: Generate `first_48h_report` card
- **Monday 9 AM**: Generate weekly report card
- **1st of month**: Generate monthly report card
- **Phase boundary**: Check if metrics justify phase transition
- **Milestone cross**: ROAS target, revenue threshold, customer count

### 3.2 `actionCardService.js` — Card Factory + Trust Router

```javascript
// Inputs:  triggered rules from optimizerService + client context from memoryService
// Outputs: ActionCard objects with trust level, stored in DB, routed to execution or queue

ActionCard {
  id: uuid,
  clientId: string,
  cardType: string,         // Maps to v3Data.cards key (e.g. 'cpa_spike', 'rec_scale_vitamins')
  trustLevel: 'L1' | 'L2' | 'L3',
  severity: 'info' | 'success' | 'warning' | 'critical',
  title: string,            // Plain language
  body: string,             // Explanation
  impact: string,           // "Saves ~$45/week"
  action: {
    type: string,           // 'pause_ad_set', 'adjust_budget', 'swap_creative', etc.
    targetId: string,       // GoMarble campaign/adset ID
    params: object          // { budgetDelta: 25, direction: 'increase' }
  },
  status: 'pending' | 'approved' | 'rejected' | 'executed' | 'auto_executed',
  notificationSent: { email: bool, whatsapp: bool, inApp: bool },
  createdAt, executedAt, respondedAt
}
```

**Card generation pipeline:**
1. `optimizerService.evaluateRules(metrics)` returns triggered rules
2. For each rule, map to card template (rule type → v3Data.cards key)
3. `memoryService.assembleContext()` provides client preferences + history
4. `permissionService.classifyAction()` assigns trust level
5. Enrich card with plain-language title/body (using templates, not LLM)
6. Route: L1 → auto-execute → log. L2/L3 → queue → notify.

**Rule → Card Type mapping:**

| Optimizer Rule | Card Key | Default Trust |
|---------------|----------|---------------|
| `low_roas` (ROAS < 0.5) | `cpa_spike` | L1 auto-pause |
| `low_roas` (0.5 < ROAS < 1.5) | `rec_pause_broad` | L2 confirm |
| `high_cpa` (CPA > threshold × 1.5) | `cpa_spike_detailed` | L2 confirm |
| `high_frequency` (freq > 3) | `rec_video_test` | L2 confirm |
| `low_ctr` (CTR < 1%) | creative refresh card | L2 confirm |
| `budget_pacing` (> 200%) | emergency pause | **L3 + Email + WhatsApp** |
| `budget_pacing` (> 150%) | budget warning | L2 + Email |
| scale_winner (ROAS > 3x, stable) | `rec_scale_vitamins` pattern | L2 confirm |
| phase_boundary | `phase2_transition` | L3 approve |
| budget_increase > 30% | `scale_budget` | L3 approve |
| new_campaign | — | L3 approve |
| neg_keywords (search term waste) | `neg_keywords` | L1 auto |
| bid_adjustment (≤ 10%) | — | L1 auto |

### 3.3 `memoryService.js` — Per-Client Persistent Context

```
data/auxora/SOUL.md                     ← Auxora personality (shared)
data/clients/{clientId}/USER.md         ← Client preferences, notification prefs, tone
data/clients/{clientId}/MEMORY.md       ← Learnings: what worked, what didn't, patterns
data/clients/{clientId}/PERMISSIONS.md  ← Trust level overrides
data/clients/{clientId}/memory/
  └── 2026-02-24.md                     ← Today's heartbeat logs, actions taken
```

**Methods:**
- `readSoul()` → SOUL.md contents
- `readUserContext(clientId)` → USER.md + MEMORY.md + recent daily logs
- `assembleContext(clientId)` → Full context string for card generation
- `appendDailyLog(clientId, entry)` → Append to today's daily file
- `updateMemory(clientId, insight)` → Append distilled learning to MEMORY.md
- `getUserPreferences(clientId)` → Parse USER.md for notification prefs, trust overrides

**USER.md structure (per client):**
```markdown
# Client: Len Chen — YamaBushi Farms

## Preferences
- Notification: weekly (chosen via notification_preference card)
- Channels: email + whatsapp
- Email: len@yamabushifarms.com
- WhatsApp: +1-555-0123
- Tone: friendly, no jargon
- Risk tolerance: conservative ("先暂停再分析")

## Trust Overrides
- neg_keywords: L1 auto (pre-authorized)
- bid_adjust ≤ 10%: L1 auto
- pause_underperformer: L1 auto (if ROAS < 0.5)
- budget_shift ≤ $50/week: L2 confirm
- Everything else: L3 approve

## Active Campaigns
- YamaBushi — Sales Campaign (Meta)
- YamaBushi — Google Search
- YamaBushi — Google Shopping
```

### 3.4 `openclawConfig.js` — Central Configuration

```javascript
module.exports = {
  heartbeat: {
    intervalMin: 30,
    maxActionsPerDay: 10,        // L1 auto-execute cap
    heartbeatTimeoutSec: 15      // Single heartbeat max duration
  },
  thresholds: {
    roas: { critical: 0.5, warning: 1.5, good: 3.0 },
    cpa: { multiplier: 1.5 },    // Alert if CPA > target × 1.5
    ctr: { minimum: 1.0 },       // Below 1% = low
    frequency: { maximum: 3.0 }, // Above 3 = fatigue
    budget: { overspend_warning: 1.5, overspend_critical: 2.0 }
  },
  trust: {
    L1_auto: ['neg_keywords', 'bid_adjust_small', 'pause_critical_roas'],
    L2_confirm: ['pause_underperformer', 'budget_shift_moderate', 'creative_swap', 'audience_adjust'],
    L3_approve: ['new_campaign', 'budget_increase_large', 'phase_transition', 'strategy_change', 'account_access']
  },
  notifications: {
    quietHours: { start: 23, end: 8 },  // No WhatsApp 11pm-8am
    maxPerDay: { email: 2, whatsapp: 1 },
    emergencyOverridesQuietHours: true
  },
  milestones: {
    roasTargets: [2.0, 3.0, 5.0],
    revenueTargets: [10000, 25000, 50000, 100000],
    customerTargets: [50, 100, 500]
  }
};
```

---

## 4. Card-to-Trust Level Complete Mapping

### L1 — Auto-Execute (No notification, or optional daily digest)

| Action | Condition | Reversible | Card Key |
|--------|-----------|------------|----------|
| Pause ad set | ROAS < 0.5 for 24h+ | Yes (unpause) | `cpa_spike` (auto variant) |
| Add negative keywords | Search term report waste | Yes (remove) | `neg_keywords` |
| Bid adjustment ≤ 10% | Pacing optimization | Yes | — (logged only) |
| Budget micro-shift ≤ $10/day | Between ad sets | Yes | — (logged only) |

**Daily limit**: 10 auto-actions per client. Exceeded → queue as L2.

### L2 — Confirm (In-app card + optional email)

| Action | Condition | Card Key |
|--------|-----------|----------|
| Pause underperformer | ROAS 0.5–1.5 for 7d | `rec_pause_broad`, `week1_rec_pause_organic` |
| Budget shift $10–30% | Between ad sets/campaigns | `rec_scale_vitamins`, `week1_rec_wagyu` |
| Creative rotation | CTR declining + freq > 3 | `rec_video_test`, `week1_rec_new_video` |
| Audience adjustment | Performance data supports | `week3_rec_foodies`, `week3_rec_retargeting` |
| Install tracking | First-time setup | `install_tracking` |
| Budget pacing warning | Spend > 150% of daily | budget warning card |

### L3 — Approve (In-app + email + WhatsApp for critical)

| Action | Condition | Card Key | WhatsApp? |
|--------|-----------|----------|-----------|
| Budget increase > 30% | Performance justifies | `scale_budget`, `week3_rec_budget_increase` | No |
| Phase transition | Milestone metrics met | `phase2_transition` | No |
| New campaign creation | Strategy expansion | — | No |
| New channel (TikTok etc.) | Scale decision | `scale_tiktok` | No |
| Strategy change | Major pivot | — | No |
| Account connection | OAuth grants | `connect_shopify/meta/google` | No |
| All 5 strategy decisions | Onboarding | `decision_*` cards | No |
| Campaign plan approval | Pre-launch | `plan_review_summary` | No |
| **Emergency pause** | **ROAS < 0.2 or budget > 200%** | emergency card | **Yes** |
| **Tracking broken** | **Pixel/tag failure** | tracking alert | **Yes** |

---

## 5. Out-of-App Notification Service

### 5.1 Design Principle: 小白用户 (Complete Beginners)

The target user is a D2C brand owner who:
- Doesn't know what ROAS, CPA, CTR, or CPM mean
- Checks their phone, not a dashboard
- Needs to feel **protected**, not overwhelmed
- Wants to know: "Is my money safe? Are my ads working?"

**Every notification follows this format:**
1. **First line** = plain English what happened
2. **One sentence** why it matters to their money
3. **One button/link** to take action
4. No charts. No tables. No percentages unless absolutely necessary.

### 5.2 `notificationService.js` — Channel Router

```
notificationService.send(clientId, event) {
  1. Load user prefs from memoryService.getUserPreferences(clientId)
  2. Determine channels based on trust level:
     - L1 → skip (or batch into daily digest if user opted in)
     - L2 → in-app card + email (if user chose weekly/daily)
     - L3 critical → in-app + email + WhatsApp (always)
  3. Check quiet hours (23:00–08:00) — defer non-emergency
  4. Check daily send limits (email: 2/day, WhatsApp: 1/day)
  5. Load template from templates/notifications/{channel}/{template}.{ext}
  6. Fill template with event data (plain language)
  7. Send via channel provider:
     - Email: SendGrid / AWS SES
     - WhatsApp: Twilio WhatsApp Business API
     - In-app: DB insert → frontend polls or SSE
  8. Record send in DB (openclaw_notifications table)
  9. memoryService.appendDailyLog(clientId, notificationSent)
}
```

**Channel routing rules:**

| Trust Level | In-App | Email | WhatsApp | When |
|-------------|--------|-------|----------|------|
| L1 auto-action | ✅ logged | ❌ (or daily digest) | ❌ | After auto-execute |
| L2 confirm | ✅ card | ✅ if user chose daily/weekly | ❌ | When card generated |
| L3 approve | ✅ card | ✅ always | ❌ | When card generated |
| L3 emergency | ✅ card | ✅ immediately | ✅ immediately | Overrides quiet hours |
| Milestone | ✅ card | ✅ celebration email | ✅ if user has WhatsApp | When milestone crossed |
| Weekly report | ✅ card | ✅ Monday morning | ❌ | Monday 9 AM |

### 5.3 Notification Templates

**Emergency: Ads Paused (L3 — Email + WhatsApp)**

Email subject: `🚨 We paused your ads to protect your budget`
```
Hi Len,

Your ad spending jumped to 3x your daily budget today — something went wrong 
on Facebook's side. We paused everything to stop the bleeding.

Your money is safe. No more will be spent until you say so.

→ [Review what happened]

— Auxora
```

WhatsApp:
```
🚨 Len, we paused your YamaBushi ads.

Spending jumped to 3x your budget today. We stopped it to protect your money.

Nothing will run until you approve it. Tap to review:
→ https://app.auxora.ai/review/abc123
```

**Tracking Broken (L3 — Email + WhatsApp)**

Email subject: `⚠️ We can't measure your ads right now`
```
Hi Len,

The tracking code on your website stopped working. This means we can't tell 
which ads are bringing you customers.

We've paused your ad spending until this is fixed — no point running ads 
we can't measure.

→ [Fix tracking (takes 2 minutes)]

— Auxora
```

WhatsApp:
```
⚠️ Len, your website tracking stopped working.

We can't tell which ads bring customers, so we paused spending to save money.

Tap to fix it (takes 2 min):
→ https://app.auxora.ai/fix/abc123
```

**CPA Spike (L2 — Email only)**

Email subject: `Your ads are costing more than usual — here's what we suggest`
```
Hi Len,

One of your ad groups started costing 50% more per customer today. 
This happens when people have seen the same ad too many times.

We think you should pause this group and move the budget to your 
best-performing ads. This would save about $60/week.

→ [Review our suggestion]

— Auxora
```

**Weekly Report (Email)**

Email subject: `Your week in 30 seconds: $3,450 revenue, 22 customers`
```
Hi Len,

This week your ads brought in $3,450 from 22 customers.
That's 83% more than last week — your best week yet!

Top performer: your Sizzle Reel video keeps crushing it.

We have 3 suggestions to make next week even better.

→ [See full report + approve suggestions]

— Auxora
```

**Milestone (Email + WhatsApp)**

Email subject: `🎉 You just hit $25,000/month!`
```
Hi Len,

You're halfway to your $50K goal!

This month: $25,420 in revenue from your ads.
That's more than double your first month.

→ [See what's next]

— Auxora
```

WhatsApp:
```
🎉 Len! YamaBushi just hit $25,000/month in ad revenue!

That's 2x your first month. Halfway to your $50K goal.

Tap to see what's next:
→ https://app.auxora.ai/results
```

**Daily Digest (optional, L1 summary — Email only)**

Email subject: `Today's autopilot report: 1 thing handled, all healthy`
```
Hi Len,

Quick update — your ads are running smoothly.

Today I automatically:
• Blocked 12 wasteful search terms (saving ~$45/week)

Everything else looks healthy. Nothing needs your attention.

→ [Open dashboard]

— Auxora
```

### 5.4 User Preference Storage

Stored in `data/clients/{clientId}/USER.md` under `## Notification Preferences`:

```markdown
## Notification Preferences
- Frequency: weekly          # passive | weekly | daily
- Email: len@yamabushifarms.com
- WhatsApp: +1-555-0123      # optional
- Quiet hours: 23:00-08:00
- Emergency override: yes    # always send for L3 critical
- Daily digest: no           # L1 auto-action summary
- Milestone celebrations: yes
```

Also persisted in DB (`openclaw_notification_prefs` table) for fast lookup:

```sql
CREATE TABLE openclaw_notification_prefs (
  client_id VARCHAR(64) PRIMARY KEY,
  frequency VARCHAR(20) DEFAULT 'weekly',     -- passive, weekly, daily
  email VARCHAR(255),
  whatsapp VARCHAR(20),
  quiet_start SMALLINT DEFAULT 23,
  quiet_end SMALLINT DEFAULT 8,
  emergency_override BOOLEAN DEFAULT true,
  daily_digest BOOLEAN DEFAULT false,
  milestone_celebrations BOOLEAN DEFAULT true,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 6. Phase-by-Phase Implementation

### Phase A: Core Wiring (3 days)

**Goal**: Heartbeat runs, reads metrics, generates cards, writes memory.

**Day 1 — Config + Memory**

| # | Task | File | Depends On |
|---|------|------|------------|
| A1 | Create OpenClaw config with all thresholds | `backend/config/openclawConfig.js` | — |
| A2 | Create memoryService (read/write SOUL/USER/MEMORY/daily) | `backend/services/openclaw/memoryService.js` | A1 |
| A3 | Write SOUL.md (Auxora personality) | `data/auxora/SOUL.md` | — |
| A4 | Write HEARTBEAT.md (check routine) | `data/auxora/HEARTBEAT.md` | — |
| A5 | Create sample client directory structure | `data/clients/demo/` | — |

**Day 2 — Heartbeat + Optimizer Export**

| # | Task | File | Depends On |
|---|------|------|------------|
| A6 | Add `getClientMetricsSnapshot()` to analyticsService | `backend/services/analyzer/analyticsService.js` (+15 lines) | — |
| A7 | Export `evaluateRules(metrics)` pure function from optimizerService | `backend/services/analyzer/optimizerService.js` (+35 lines) | — |
| A8 | Create permissionService (trust level classification) | `backend/services/openclaw/permissionService.js` | A1 |
| A9 | Create heartbeatLoop (cron + check pipeline) | `backend/services/openclaw/heartbeatLoop.js` | A2, A6, A7, A8 |
| A10 | `npm install node-cron` | `backend/package.json` | — |

**Day 3 — Action Cards + API + Integration**

| # | Task | File | Depends On |
|---|------|------|------------|
| A11 | Create actionCardService (generate + route + execute) | `backend/services/openclaw/actionCardService.js` | A7, A8 |
| A12 | Add `executeBulkAction()` to campaign API | `backend/api/advertiser/campaign.js` (+25 lines) | — |
| A13 | Create heartbeat API (status/trigger/history) | `backend/api/openclaw/heartbeat.js` | A9 |
| A14 | Create actions API (list/approve/reject) | `backend/api/openclaw/actions.js` | A11 |
| A15 | Register openclaw routes + start heartbeat in server.js | `backend/server.js` (+20 lines) | A13, A14 |
| A16 | DB migration: `openclaw_actions` table | `backend/migrations/003_openclaw_actions.sql` | — |
| A17 | Smoke test: `curl POST /api/openclaw/heartbeat/trigger` | — | A15 |

### Phase B.1: Card Execution Pipeline (4 days)

**Goal**: Cards are generated from real optimizer rules, L1 auto-executes, L2/L3 queues for approval.

**Day 4–5 — Card Generation from Rules**

| # | Task | File |
|---|------|------|
| B1 | Build rule→card mapping table in actionCardService | `backend/services/openclaw/actionCardService.js` |
| B2 | Generate card title/body using plain-language templates (no LLM) | Same |
| B3 | Implement `executeCard()` → calls `gomarbleMcpService` or `campaign.executeBulkAction()` | Same |
| B4 | Implement `approveCard()` / `rejectCard()` with status transitions | Same |
| B5 | L1 pipeline: auto-execute → log → daily limit check | Same |

**Day 6–7 — Heartbeat Integration**

| # | Task | File |
|---|------|------|
| B6 | Wire heartbeatLoop to full pipeline: metrics → rules → cards → execute/queue | `heartbeatLoop.js` |
| B7 | Add milestone detection (ROAS target, revenue threshold, phase boundary) | `heartbeatLoop.js` |
| B8 | Add weekly/daily report generation triggers (Monday 9 AM, daily morning) | `heartbeatLoop.js` |
| B9 | Memory logging: every heartbeat writes to daily log | `heartbeatLoop.js` + `memoryService.js` |
| B10 | Tests: heartbeat, actionCard, permission | `backend/tests/openclaw/*.test.js` |

### Phase B.2: Out-of-App Notification Service (3 days)

**Goal**: Users who don't live in the app feel protected. Email + WhatsApp for critical alerts.

**Day 8 — Notification Infrastructure**

| # | Task | File |
|---|------|------|
| B11 | Create notificationService with channel routing logic | `backend/services/openclaw/notificationService.js` |
| B12 | Implement quiet hours, daily send limits, emergency override | Same |
| B13 | DB migration: `openclaw_notification_prefs` + `openclaw_notification_log` | `backend/migrations/004_notifications.sql` |
| B14 | Create notification preferences API | `backend/api/openclaw/notifications.js` |
| B15 | Wire `notification_preference` card (from v3Data) to save prefs to USER.md + DB | `notificationService.js` + `memoryService.js` |

**Day 9 — Email Templates + Provider**

| # | Task | File |
|---|------|------|
| B16 | Set up SendGrid/SES integration (env var for API key) | `notificationService.js` |
| B17 | Create all 8 email templates (see §5.3) | `backend/templates/notifications/email/*.html` |
| B18 | Template engine: fill template with event data, client name, CTA link | `notificationService.js` |
| B19 | Test: trigger L3 emergency → verify email sent | manual test |

**Day 10 — WhatsApp + Integration**

| # | Task | File |
|---|------|------|
| B20 | Set up Twilio WhatsApp Business API integration | `notificationService.js` |
| B21 | Create all 6 WhatsApp templates (see §5.3) | `backend/templates/notifications/whatsapp/*.txt` |
| B22 | Wire actionCardService → notificationService: L2 cards trigger email, L3 critical triggers email + WhatsApp | `actionCardService.js` |
| B23 | Wire milestone detection → celebration notifications | `heartbeatLoop.js` |
| B24 | Wire weekly report generation → email delivery | `heartbeatLoop.js` |
| B25 | End-to-end test: heartbeat detects budget overspend → L3 card → email + WhatsApp sent | manual test |

### Phase C: Frontend Wiring (3 days)

**Goal**: V3 app canvas panels display real heartbeat data, action cards, and notification preferences.

**Day 11–12 — API Integration**

| # | Task | File |
|---|------|------|
| C1 | Add openclaw API proxy routes in htmx-ui | `htmx-ui/routes/v3-api.js` (+30 lines) |
| C2 | Wire Monitor tab canvas (`canvasOpenclaw`) to `/api/openclaw/heartbeat/status` | `htmx-ui/public/js/auxora-v3.js` |
| C3 | Wire action cards in chat panel to `/api/openclaw/actions` | Same |
| C4 | Wire approve/reject buttons to POST endpoints | Same |
| C5 | Wire `notification_preference` card to save prefs via API | Same |
| C6 | Wire Results tab canvas to `/api/openclaw/actions/history` + reports | Same |

**Day 13 — Real-Time + Polish**

| # | Task | File |
|---|------|------|
| C7 | Add SSE or 30s polling for new action cards in Monitor tab | `auxora-v3.js` |
| C8 | Wire Agent Status Bar to heartbeat status (green/yellow/red pulse) | `auxora-v3.js` |
| C9 | Wire `openclawDashboard` canvas data to live heartbeat data | `auxora-v3.js` |
| C10 | End-to-end demo: heartbeat fires → card appears in chat → approve → executed | manual |

### Phase D: Multi-Agent Context (3 days)

**Goal**: Memory-enriched card generation. Each agent role has context.

| # | Task | File |
|---|------|------|
| D1 | Create agentContext builder (SOUL + role prompt + USER + MEMORY + task) | `backend/services/openclaw/agentContext.js` |
| D2 | Enrich card generation with client history from MEMORY.md | `actionCardService.js` |
| D3 | Add cause analysis to alert cards using context (e.g. "Week 2 Lifestyle group started declining") | `actionCardService.js` |
| D4 | Memory compaction: weekly summarize daily logs → update MEMORY.md | `memoryService.js` |
| D5 | Agent status in frontend: which module generated each card | `auxora-v3.js` |

---

## 7. Database Changes

### New Tables

```sql
-- Phase A
CREATE TABLE openclaw_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id VARCHAR(64) NOT NULL,
  card_type VARCHAR(64) NOT NULL,           -- maps to v3Data.cards key
  trust_level VARCHAR(4) NOT NULL,          -- L1, L2, L3
  severity VARCHAR(16) NOT NULL,            -- info, success, warning, critical
  title TEXT NOT NULL,
  body TEXT,
  impact TEXT,
  action_type VARCHAR(64),                  -- pause_ad_set, adjust_budget, etc.
  action_target_id VARCHAR(128),
  action_params JSONB,
  status VARCHAR(20) DEFAULT 'pending',     -- pending, approved, rejected, executed, auto_executed
  rejected_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  executed_at TIMESTAMP,
  responded_at TIMESTAMP,
  heartbeat_id UUID                         -- which heartbeat generated this
);

CREATE TABLE openclaw_heartbeats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id VARCHAR(64) NOT NULL,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  metrics_snapshot JSONB,                   -- { roas, cpa, ctr, frequency, spend, budget }
  rules_triggered JSONB,                    -- [{ rule, severity, ... }]
  actions_generated INTEGER DEFAULT 0,
  actions_auto_executed INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'running'      -- running, completed, failed
);

-- Phase B.2
CREATE TABLE openclaw_notification_prefs (
  client_id VARCHAR(64) PRIMARY KEY,
  frequency VARCHAR(20) DEFAULT 'weekly',
  email VARCHAR(255),
  whatsapp VARCHAR(20),
  quiet_start SMALLINT DEFAULT 23,
  quiet_end SMALLINT DEFAULT 8,
  emergency_override BOOLEAN DEFAULT true,
  daily_digest BOOLEAN DEFAULT false,
  milestone_celebrations BOOLEAN DEFAULT true,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE openclaw_notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id VARCHAR(64) NOT NULL,
  channel VARCHAR(16) NOT NULL,             -- email, whatsapp, in_app
  template VARCHAR(64) NOT NULL,            -- emergency-pause, weekly-summary, etc.
  action_id UUID REFERENCES openclaw_actions(id),
  sent_at TIMESTAMP DEFAULT NOW(),
  delivered BOOLEAN,
  opened BOOLEAN,
  clicked BOOLEAN
);
```

---

## 8. Dependencies

```bash
cd backend && npm install node-cron
# Email: @sendgrid/mail OR aws-sdk (SES)
# WhatsApp: twilio
npm install @sendgrid/mail twilio
```

Total new deps: 3 (`node-cron`, `@sendgrid/mail`, `twilio`). Everything else uses existing deps.

---

## 9. Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                         V3 Frontend (EJS + JS)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  ┌──────────────┐  │
│  │  Build Plan   │  │Connect/Launch│  │ Monitor  │  │   Revenue    │  │
│  │  (Tab 1)      │  │  (Tab 2)     │  │ (Tab 3)  │  │   (Tab 4)    │  │
│  │              │  │              │  │          │  │              │  │
│  │ q_* cards    │  │ connect_*    │  │ daily_*  │  │ milestone_*  │  │
│  │ decision_*   │  │ plan_*       │  │ cpa_*    │  │ scale_*      │  │
│  │ gtm_report   │  │ launch_*     │  │ rec_*    │  │ month2_*     │  │
│  └──────┬───────┘  └──────┬───────┘  └────┬─────┘  └──────┬───────┘  │
│         │                 │               │                │          │
│         └─────────────────┼───────────────┼────────────────┘          │
│                           │               │                           │
│                     /api/openclaw/*   (poll/SSE)                       │
└───────────────────────────┼───────────────┼───────────────────────────┘
                            │               │
┌───────────────────────────┼───────────────┼───────────────────────────┐
│                    OpenClaw Nervous System (NEW)                       │
│                           │               │                           │
│  ┌────────────────────────┴───────────────┴────────────────────────┐  │
│  │                      heartbeatLoop.js                           │  │
│  │                   (node-cron, every 30 min)                     │  │
│  └──┬──────────┬──────────┬──────────┬──────────┬─────────────────┘  │
│     │          │          │          │          │                     │
│     ▼          ▼          ▼          ▼          ▼                     │
│  ┌──────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌──────────────────────┐ │
│  │memory│ │action  │ │permis- │ │config  │ │  notificationService │ │
│  │Svc   │ │CardSvc │ │sionSvc │ │        │ │                      │ │
│  │      │ │        │ │        │ │openclaw│ │  ┌─────┐ ┌────────┐  │ │
│  │SOUL  │ │generate│ │L1/L2/L3│ │Config  │ │  │Email│ │WhatsApp│  │ │
│  │USER  │ │execute │ │classify│ │.js     │ │  │SG   │ │Twilio  │  │ │
│  │MEMORY│ │approve │ │        │ │        │ │  └─────┘ └────────┘  │ │
│  │daily │ │reject  │ │        │ │        │ │  + templates/        │ │
│  └──┬───┘ └───┬────┘ └────────┘ └────────┘ └──────────┬───────────┘ │
│     │         │                                        │             │
└─────┼─────────┼────────────────────────────────────────┼─────────────┘
      │         │                                        │
      │         ▼                                        ▼
┌─────┼───────────────────────────────────────┐  ┌──────────────────┐
│     │    Existing Backend (19K lines)        │  │  External APIs   │
│     │                                        │  │                  │
│     │  ┌─────────────┐  ┌────────────────┐  │  │  SendGrid (email)│
│     │  │ analytics   │  │ optimizer      │  │  │  Twilio (WhatsApp)│
│     │  │ Service     │  │ Service        │  │  │                  │
│     │  │ .getMetrics │  │ .evaluateRules │  │  └──────────────────┘
│     │  └──────┬──────┘  └───────┬────────┘  │
│     │         │                 │            │
│     │  ┌──────┴──────┐  ┌──────┴────────┐  │
│     │  │ report      │  │ dashboard     │  │
│     │  │ Service     │  │ Service       │  │
│     │  └──────┬──────┘  └───────┬───────┘  │
│     │         │                 │           │
│     │  ┌──────┴─────────────────┴────────┐  │
│     │  │      gomarbleMcpService         │  │
│     │  │   (Meta + Google unified API)   │  │
│     │  └─────────────────────────────────┘  │
│     │                                        │
│     │  ┌─────────────────────────────────┐  │
│  ◄──┘  │  campaign.executeBulkAction()   │  │
│  (fs)  │  (new export, +25 lines)        │  │
│        └─────────────────────────────────┘  │
│                                              │
│  Executor: shopify/domain/lovable/creative   │
│  Strategist: research/interview/GTM models   │
│  (all untouched)                             │
└──────────────────────────────────────────────┘
```

---

## 10. End-to-End Demo Scenario

### "Budget Overspend → Emergency Pause → WhatsApp Alert"

```
[T+0]    💓 heartbeatLoop fires
           → analyticsService.getClientMetricsSnapshot('yamabushi')
           → returns: { dailySpend: $258, dailyBudget: $100, ... }
           → budget_pacing ratio: 2.58x (> 2.0 critical threshold)

[T+2s]   🔍 optimizerService.evaluateRules(metrics)
           → triggers: budget_pacing rule, severity: critical

[T+3s]   🔒 permissionService.classifyAction('emergency_pause')
           → L3 critical (but auto-execute for safety, log as L3)
           → actionCardService.executeCard(pauseAllCard)
           → gomarbleMcpService.pauseAllCampaigns(yamabushi)

[T+4s]   📱 notificationService.send('yamabushi', {
             template: 'emergency-pause',
             trustLevel: 'L3',
             data: { overspendRatio: '2.6x', dailySpend: '$258', budget: '$100' }
           })
           → Channel routing:
             ✅ in-app: action card with status 'auto_executed'
             ✅ email: "🚨 We paused your ads to protect your budget"
             ✅ WhatsApp: "🚨 Len, we paused your YamaBushi ads..."
           → Overrides quiet hours (emergency)

[T+5s]   📝 memoryService.appendDailyLog('yamabushi',
             "09:30 EMERGENCY: Budget overspend 2.6x detected. All campaigns paused.
              Notified via email + WhatsApp. Awaiting client review.")

[T+?]    👤 Len taps WhatsApp link → opens app → sees action card
           → Reviews what happened
           → Clicks "Resume with $100/day cap"
           → actionCardService.approveCard(resumeCard)
           → Campaigns resume with budget cap
```

### "Monday Morning Weekly Report → Email"

```
[Mon 9:00 AM] 💓 heartbeatLoop detects: Monday + 9 AM
                → reportService.generateWeeklyReport('yamabushi')
                → Returns: { revenue: 3450, spend: 589, roas: 5.86, purchases: 22 }

[Mon 9:01 AM] 🃏 actionCardService generates:
                → week3_report card (in-app)
                → 3 recommendation cards: rec_foodies, rec_retargeting, rec_budget_increase

[Mon 9:01 AM] 📧 notificationService.send('yamabushi', {
                template: 'weekly-summary',
                data: { revenue: '$3,450', purchases: 22, deltaVsLastWeek: '+83%' }
              })
              → Email: "Your week in 30 seconds: $3,450 revenue, 22 customers"
              → No WhatsApp (not emergency)

[Mon 9:15 AM] 👤 Len opens email → clicks "See full report" → app opens
                → Sees weekly report card + 3 recommendation cards
                → Approves all 3
                → actionCardService executes each approved card
```

---

## 11. Risk & Mitigation

| Risk | Mitigation |
|------|------------|
| GoMarble API downtime | analyticsService has mock mode; heartbeat degrades to cached data |
| Auto-execute mistakes (L1) | Only reversible actions (pause, neg keywords); daily cap of 10; all actions log `before_state` |
| Notification spam | Hard limits: 2 emails/day, 1 WhatsApp/day; quiet hours 23:00-08:00; emergency overrides only |
| Memory files grow large | Weekly compaction: daily logs → distilled insights in MEMORY.md; keep 30 days raw |
| Email deliverability | Use SendGrid with verified domain; keep emails simple text, not marketing-heavy |
| WhatsApp template approval | Pre-register message templates with Twilio; use approved template format |
| User never opens app | Email + WhatsApp ensure they're informed; L3 critical pauses automatically for safety |
| Heartbeat performance | Target < 5s per client; `Promise.all` for parallel metric fetching |

---

## 12. Success Criteria by Phase

| Metric | Phase A | Phase B.1 | Phase B.2 | Phase C | Phase D |
|--------|---------|-----------|-----------|---------|---------|
| Heartbeat runs on schedule | ✅ | ✅ | ✅ | ✅ | ✅ |
| Cards generated from real rules | — | ✅ | ✅ | ✅ | ✅ |
| L1 auto-execute works | — | ✅ | ✅ | ✅ | ✅ |
| L2/L3 cards queue for approval | — | ✅ | ✅ | ✅ | ✅ |
| Email notifications sent | — | — | ✅ | ✅ | ✅ |
| WhatsApp emergency alerts | — | — | ✅ | ✅ | ✅ |
| Notification preferences saved | — | — | ✅ | ✅ | ✅ |
| V3 app shows live cards | — | — | — | ✅ | ✅ |
| Approve/reject from UI works | — | — | — | ✅ | ✅ |
| Memory-enriched card context | — | — | — | — | ✅ |
| Full end-to-end demo | — | — | — | ✅ | ✅ |

---

## 13. Timeline Summary

| Phase | Duration | Days | Focus |
|-------|----------|------|-------|
| **A** | Week 1 | 3 days | Config, memory, heartbeat, basic cards |
| **B.1** | Week 2 (Mon–Thu) | 4 days | Card execution pipeline, trust routing |
| **B.2** | Week 2 (Fri) – Week 3 (Tue) | 3 days | Email + WhatsApp notifications |
| **C** | Week 3 (Wed–Fri) | 3 days | Frontend wiring, live data in V3 app |
| **D** | Week 4 | 3 days | Multi-agent context, memory enrichment |

**Total: ~16 working days (3–4 weeks)**

---

*This document maps every V3 frontend card to a backend service, defines the OpenClaw wiring layer, and specifies exact files to create/modify. Execute phase by phase, update progress inline.*
