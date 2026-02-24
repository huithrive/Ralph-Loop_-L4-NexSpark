# Auxora Architecture — OpenClaw-Centric

## Core Principle

**OpenClaw IS the brain. Chat IS the interface. Everything flows through one system.**

```
User (IM Chat) ←→ Chat Router ←→ Module Registry ←→ Effect Pipeline ←→ Notifications
                                        ↑
                              Heartbeat Loop (proactive)
```

Two entry points, one brain:
1. **User says something** → Chat Router classifies → routes to Module → Module responds with Effects
2. **Heartbeat fires** → Metrics check → Rules evaluate → Cards generated → Effects emitted

Both paths emit Effects. Effects are the universal currency.

---

## 1. Module Registry (`moduleRegistry.js`)

Borrowed from Yuhong's `AgentModule` pattern, adapted for OpenClaw.

```js
// Each module registers itself
registry.register({
  name: 'strategist',
  description: 'Market research, competitor analysis, GTM strategy reports',
  routingExamples: ['analyze my competitors', 'what should my pricing be'],
  
  // Chat handling (reactive)
  handleMessage: async (session, userText, context) => effects[],
  
  // Heartbeat handling (proactive)  
  evaluateMetrics: async (clientId, metrics) => rules[],
  generateCards: async (clientId, rules, context) => cards[],
  
  // Effect handlers this module provides
  effectHandlers: {
    'ReportGenerated': handleReportGenerated,
    'InterviewComplete': handleInterviewComplete,
  },
  
  // Stage ownership — which chat stages this module handles
  stages: ['discovery', 'report-gen', 'strategy'],
  
  // Attribution (for frontend)
  icon: '🎯',
  label: 'Strategist',
  color: '#3B82F6',
});
```

### Modules:

| Module | Chat Stages | Heartbeat | Effects |
|--------|-------------|-----------|---------|
| **Strategist** | discovery, report-gen, strategy | — | ReportGenerated, InterviewComplete, DataCollected |
| **Executor** | competitor-research, execution-setup, campaign-planning | — | ConnectionMade, CampaignCreated, TrackingInstalled |
| **Advertiser** | launch | campaign metrics | CampaignLaunched, CreativeSwapped, BudgetAdjusted |
| **Analyzer** | monitoring, optimization, scaling | all metrics | AlertRaised, AutoActionTaken, PhaseTransitioned, MilestoneReached |

---

## 2. Effect System (`effectSystem.js`)

Borrowed from Yuhong's `Effect` + `EffectResult` pattern.

Every action in the system emits Effects. Effects are processed by a pipeline.

```js
// Define effects as typed objects
class Effect {
  constructor(type, data) {
    this.type = type;
    this.data = data;
    this.timestamp = Date.now();
    this.source = null; // set by pipeline
  }
}

// Examples:
new Effect('DataCollected', { field: 'website', value: 'yamabushi.com' })
new Effect('ReportGenerated', { clientId: 'demo', reportId: 'rpt-1' })
new Effect('AlertRaised', { severity: 'warning', title: 'CPA Spike', cardId: 'card-123' })
new Effect('AutoActionTaken', { action: 'pause', targetId: 'campaign-456', savings: '$45/week' })
new Effect('MilestoneReached', { type: 'roas', value: 7.78, target: 3.0 })
new Effect('BudgetAdjusted', { campaignId: '...', oldBudget: 390, newBudget: 590 })

// Effect pipeline — every effect runs through these handlers in order:
const PIPELINE = [
  memoryWriter,     // Write to client memory files
  dbLogger,         // Log to openclaw_actions table
  notifier,         // Route notification (L1/L2/L3)
  dashboardUpdater, // Push SSE to frontend
  auditLogger,      // Append to audit trail
];
```

### Why this matters:
Before: `executionBridge.pauseEntity()` → returns `{ success: true }` → caller manually writes memory, sends notification, updates dashboard (3 separate places, each partially implemented).

After: `executionBridge.pauseEntity()` → emits `Effect('EntityPaused', {...})` → pipeline handles ALL side effects automatically.

---

## 3. Chat Router (`chatRouter.js`)

Replaces the monolithic `auxora-chat.js` stage-switching.

```js
async function routeMessage(sessionId, userText) {
  const session = getSession(sessionId);
  const effects = [];
  
  // 1. Check if current stage has an owning module
  const currentModule = registry.getModuleForStage(session.stage);
  
  if (currentModule) {
    // Module handles the message
    const context = await agentContext.buildContext(session.clientId, currentModule.name);
    const moduleEffects = await currentModule.handleMessage(session, userText, context);
    effects.push(...moduleEffects);
  } else {
    // No module owns this stage — use LLM classifier
    const routing = await classifier.classify(userText, session);
    const targetModule = registry.getModule(routing.specialist);
    const moduleEffects = await targetModule.handleMessage(session, userText, context);
    effects.push(...moduleEffects);
  }
  
  // 2. Process ALL effects through pipeline
  const results = await effectPipeline.process(effects);
  
  // 3. Convert results to SSE events for frontend
  return results.sseEvents;
}
```

### Key difference from Yuhong's `IntentClassifier`:
- Yuhong: EVERY message goes through LLM classification (expensive, slow)
- Ours: Stage-based routing FIRST (free, instant), LLM classification ONLY when no stage matches (rare — mostly post-strategy free-form Q&A)

---

## 4. Heartbeat Integration

The heartbeat loop already exists. It now emits Effects instead of directly calling services.

```js
// Before (current heartbeatLoop.js):
const card = await actionCardService.generateCards(clientId, rules, context);
await actionCardService.executeCard(card);  // Does execution + notification + memory (tangled)

// After:
const cards = await module.generateCards(clientId, rules, context);
for (const card of cards) {
  if (card.trustLevel === 'L1') {
    const result = await executionBridge.execute(card);
    effects.push(new Effect('AutoActionTaken', { card, result }));
  } else {
    effects.push(new Effect('CardQueued', { card }));
  }
}
await effectPipeline.process(effects);  // Pipeline handles everything
```

---

## 5. Session Model (Enhanced)

```js
const session = {
  id: 'uuid',
  clientId: 'demo',
  stage: 'discovery',        // Current stage
  module: 'strategist',      // Current owning module  
  collectedData: {},          // Onboarding data
  decisions: {},              // Approved campaign decisions
  messages: [],               // Chat history
  connections: {},            // OAuth connections
  pendingCards: [],           // L2/L3 cards awaiting response
  notificationPolicy: null,   // User's notification preference
  memory: {                   // In-session memory (supplements file-based)
    lastModule: null,
    context: {},
  },
};
```

---

## 6. File Structure

```
backend/services/openclaw/
├── moduleRegistry.js        # NEW — Module registration + lookup
├── effectSystem.js          # NEW — Effect types + pipeline
├── chatRouter.js            # NEW — Replaces auxora-chat.js stage logic
├── modules/                 # NEW — One file per module
│   ├── strategistModule.js  #   Discovery + Report + Strategy stages
│   ├── executorModule.js    #   Setup + Campaign Planning stages  
│   ├── advertiserModule.js  #   Launch + Campaign management
│   └── analyzerModule.js    #   Monitoring + Optimization + Scaling
├── heartbeatLoop.js         # REFACTOR — Emit effects instead of direct calls
├── actionCardService.js     # REFACTOR — Card generation only, execution via effects
├── executionBridge.js       # REFACTOR — Returns effects instead of raw results
├── agentContext.js           # KEEP — Context builder (add module-aware prompts)
├── memoryService.js          # KEEP — File-based memory
├── permissionService.js      # KEEP — Trust classification
└── notificationService.js    # KEEP — Becomes an effect handler
```

---

## 7. Migration Strategy

**Phase 1: Foundation** (this session)
- [ ] `effectSystem.js` — Effect class + pipeline + handlers
- [ ] `moduleRegistry.js` — Registry + module interface
- [ ] Refactor `executionBridge.js` to emit effects

**Phase 2: Modules** (this session)
- [ ] Extract `strategistModule.js` from auxora-chat.js (discovery/report/strategy stages)
- [ ] Extract `executorModule.js` (setup/planning stages)
- [ ] Extract `advertiserModule.js` (launch stage)
- [ ] Extract `analyzerModule.js` (monitoring/optimization/scaling stages)

**Phase 3: Router** (this session)
- [ ] `chatRouter.js` — Stage-based routing + LLM fallback
- [ ] Wire into v3-api.js (replace direct auxora-chat import)
- [ ] Verify full flow works end-to-end

**Phase 4: Heartbeat Unification** 
- [ ] Refactor heartbeatLoop to use modules + effect pipeline
- [ ] Remove duplicate code between heartbeat and chat paths

---

## 8. Plain Language Principle

Every user-facing message must pass the "DTC founder test":
- ❌ "CPA exceeded threshold by 53%, triggering L2 action card"
- ✅ "Your cost per customer jumped from $34 to $52. I can fix this — want me to pause that audience and put the money where it's working?"

The module system makes this easier: each module has its own system prompt tuned for its domain, and the effect pipeline's notification handlers format everything for non-technical users.

---

## 9. Why OpenClaw-Centric > Traditional Agent Framework

| Aspect | Traditional (Yuhong's) | OpenClaw-Centric (Ours) |
|--------|----------------------|------------------------|
| **Trigger** | User message only | Heartbeat + User message |
| **Routing cost** | Every message → LLM | Stage-based (free) + LLM fallback (rare) |
| **Side effects** | Scattered in handlers | Unified Effect pipeline |
| **Memory** | DB records | Markdown files (human-readable, debuggable) |
| **Execution** | Tool calls in agent | Trust-gated bridge with L1/L2/L3 |
| **Notifications** | None (chat only) | Multi-channel (email, WhatsApp, in-app) |
| **Autonomy** | Zero (waits for user) | L1 auto-execute, L2 confirm, L3 approve |

The OpenClaw approach gives us a system that **works while the user sleeps**. That's the product differentiator.
