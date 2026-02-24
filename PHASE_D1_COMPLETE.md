# Phase D.1 Complete: Multi-Agent Context Builder

**Status:** ✅ Complete  
**Date:** February 24, 2026  
**File:** `backend/services/openclaw/agentContext.js` (298 lines)

---

## What Was Built

### Core Service: `agentContext.js`

A multi-agent context builder that creates role-specific prompts for each Auxora module (Strategist, Executor, Advertiser, Analyzer).

**Key Features:**
- ✅ Role-specific system prompts combining SOUL + USER + MEMORY + daily logs
- ✅ Intelligent extraction of client preferences, learnings, and issues from markdown
- ✅ Context-aware card enrichment (generic alerts → client-specific messages)
- ✅ Root cause analysis from memory and recent activity
- ✅ Agent attribution metadata for frontend display

---

## Files Created

### Service Implementation
```
backend/services/openclaw/agentContext.js (298 lines)
```

### Demo Client Data
```
backend/data/clients/demo/
├── USER.md                    # YamaBushi Wagyu brand profile
├── MEMORY.md                  # Accumulated learnings & campaign history
└── memory/
    └── 2026-02-24.md         # Today's activity log
```

### Test Suite
```
backend/test-agentContext.js (147 lines)
```

---

## API Reference

### 1. `buildContext(clientId, role, taskContext)`

Builds full context for an agent role.

```javascript
const context = await agentContext.buildContext('demo', 'advertiser', {
  campaign: 'Meta - Wagyu Enthusiasts',
  trigger: 'high_cpa'
});

// Returns:
{
  systemPrompt: '# Auxora...\n## Your Role: Advertiser...',
  taskContext: { campaign: '...', trigger: '...' },
  clientId: 'demo',
  role: 'advertiser',
  meta: {
    clientName: 'Kenji Tanaka',
    brandName: 'YamaBushi Wagyu',
    preferences: { targetROAS: 3.0, maxCPA: 45, ... },
    recentIssues: ['Generic "premium beef" messaging...', ...],
    learnings: ['Interest targeting performed well', ...],
  }
}
```

**Parameters:**
- `clientId` (string) — Client identifier
- `role` (string) — One of: `strategist`, `executor`, `advertiser`, `analyzer`
- `taskContext` (object) — Task-specific data (metrics, events, campaign details)

**Returns:** Promise<object> with systemPrompt, meta, taskContext, etc.

---

### 2. `enrichCardWithContext(card, context)`

Enriches action cards with client-specific context.

```javascript
const card = {
  title: 'Your ads are losing money',
  body: 'Campaign performance has declined.',
  severity: 'high'
};

const enriched = agentContext.enrichCardWithContext(card, context);

// Result:
{
  title: 'Your YamaBushi Wagyu ads are losing money',
  body: 'Campaign performance has declined.\n\n💡 Context: This may be related to: Generic "premium beef" messaging gets lost in noise\n\n📚 Past Learning: Speed/convenience messaging resonates...',
  severity: 'high'
}
```

**How it works:**
- Adds brand name to generic titles
- Matches card content against recent issues from MEMORY.md
- Surfaces relevant learnings from past campaigns

---

### 3. `generateCauseAnalysis(rule, context)`

Generates root cause analysis from memory and logs.

```javascript
const rule = {
  metric: 'cpa',
  condition: 'above 50',
  threshold: 50
};

const analysis = agentContext.generateCauseAnalysis(rule, context);

// Returns:
"**Likely Cause:** Higher CPCs, lower conversion rate, or targeting too broad.

Note: Broad match keywords have historically driven up CPA for this client.

**What's Still Working:** Interest targeting (food bloggers, grilling, Japanese cuisine) performed well"
```

**Parameters:**
- `rule` (object) — Triggered rule with { metric, condition, threshold }
- `context` (object) — Context from buildContext()

**Returns:** String with human-readable cause analysis

---

### 4. `getAgentAttribution(role)`

Returns display metadata for frontend card attribution.

```javascript
const attr = agentContext.getAgentAttribution('advertiser');

// Returns:
{
  role: 'advertiser',
  icon: '📢',
  label: 'Advertiser',
  color: '#10B981'  // Green
}
```

**Supported roles:**
- `strategist` 🎯 Blue (#3B82F6)
- `executor` ⚙️ Purple (#8B5CF6)
- `advertiser` 📢 Green (#10B981)
- `analyzer` 🔍 Amber (#F59E0B)

---

## Role Prompts (ROLE_PROMPTS)

Pre-defined role descriptions for each agent module:

### Strategist 🎯
Research market, analyze competitors, conduct customer interviews, generate GTM reports. Thinks like a senior growth strategist but communicates in plain language.

### Executor ⚙️
Set up growth infrastructure: Shopify optimization, landing pages, ad creatives, domain setup, campaign configuration. Precise and methodical.

### Advertiser 📢
Manage campaigns across Meta and Google: creation, budget allocation, targeting, bid strategy, creative rotation. Optimizes for ROAS and CPA targets.

### Analyzer 🔍
Monitor performance 24/7, detect issues (overspend, low ROAS, high CPA, ad fatigue), generate action cards, auto-execute safety measures. Client's guardian.

---

## Extraction Helpers (Internal)

These parse USER.md and MEMORY.md into structured data:

| Function | Extracts |
|----------|----------|
| `extractClientName(userMd)` | Client contact name |
| `extractBrandName(userMd)` | Brand name |
| `extractPreferences(userMd)` | Target ROAS, max CPA, budget, communication prefs |
| `extractRecentIssues(memoryMd)` | Last 3 known problems |
| `extractLearnings(memoryMd)` | Top 5 accumulated insights |

**Implementation:** Simple regex/string matching (not LLM-based) for fast, reliable parsing.

---

## Integration Examples

### 1. Analyzer Module (Heartbeat)

```javascript
const { buildContext, enrichCardWithContext } = require('./services/openclaw/agentContext');

async function analyzeMetrics(clientId, metrics) {
  // Build analyzer context
  const context = await buildContext(clientId, 'analyzer', {
    metrics,
    triggeredBy: 'heartbeat',
    timestamp: new Date().toISOString()
  });
  
  // Generate cards using context.systemPrompt
  const cards = await generateCardsFromMetrics(context);
  
  // Enrich cards with client-specific details
  const enrichedCards = cards.map(card => 
    enrichCardWithContext(card, context)
  );
  
  return enrichedCards;
}
```

### 2. Advertiser Module (Campaign Creation)

```javascript
const { buildContext, getAgentAttribution } = require('./services/openclaw/agentContext');

async function createCampaign(clientId, campaignRequest) {
  const context = await buildContext(clientId, 'advertiser', {
    campaignRequest,
    triggeredBy: 'user_request'
  });
  
  // Use context.systemPrompt to guide LLM campaign setup
  // Use context.meta.preferences for ROAS/CPA targets
  
  const campaign = await setupCampaignWithLLM(
    context.systemPrompt,
    context.meta.preferences
  );
  
  // Add attribution for frontend
  campaign.createdBy = getAgentAttribution('advertiser');
  
  return campaign;
}
```

### 3. Strategist Module (GTM Report)

```javascript
const { buildContext } = require('./services/openclaw/agentContext');

async function generateGTMReport(clientId) {
  const context = await buildContext(clientId, 'strategist', {
    reportType: 'gtm',
    scope: 'full'
  });
  
  // context.meta.learnings provides historical insights
  // context.meta.recentIssues shows what to avoid
  
  const report = await generateReport(
    context.systemPrompt,
    context.meta
  );
  
  return report;
}
```

---

## Testing

### Quick Test
```bash
cd ~/Downloads/Dev/nexspark/backend
node -e "const ac = require('./services/openclaw/agentContext'); ac.buildContext('demo', 'analyzer').then(c => console.log(Object.keys(c)))"
```

### Full Test Suite
```bash
node test-agentContext.js
```

**Expected output:**
```
✅ All 4 roles build context successfully
✅ Card enrichment adds brand name and context
✅ Cause analysis surfaces relevant learnings
✅ Agent attribution returns correct metadata
✅ All 5 exports are present
```

---

## Demo Client Data

**YamaBushi Farms** (demo client) includes:
- Premium Japanese Wagyu D2C brand
- $15k/month ad budget
- Target ROAS 3.0+, Max CPA $45
- Active campaigns: Meta (Wagyu Enthusiasts), Google Search
- Recent learnings: Interest targeting works, broad match doesn't
- Recent issues: Generic messaging underperforms

**Files:**
- `USER.md`: Full brand profile, goals, preferences
- `MEMORY.md`: Campaign history, audience insights, learnings
- `memory/2026-02-24.md`: Today's activity log

---

## Next Steps

### Phase D.2: Action Card Generation
- Use `buildContext()` to create analyzer prompts
- Call LLM with context.systemPrompt + metrics
- Use `enrichCardWithContext()` to add client specifics
- Store cards with `getAgentAttribution()` metadata

### Phase D.3: Multi-Agent Orchestration
- Route tasks to appropriate agent modules using role-specific contexts
- Coordinate between Strategist → Executor → Advertiser → Analyzer
- Share learnings across agents via MEMORY.md updates

### Phase D.4: Memory Management
- Implement weekly memory compaction (already in memoryService)
- Auto-update MEMORY.md from daily logs
- Prune old daily files (>30 days)

---

## File Statistics

| File | Lines | Size |
|------|-------|------|
| agentContext.js | 298 | ~13 KB |
| test-agentContext.js | 147 | ~4.4 KB |
| USER.md (demo) | 57 | ~2.0 KB |
| MEMORY.md (demo) | 157 | ~3.5 KB |
| memory/2026-02-24.md | 44 | ~1.6 KB |

**Total:** 703 lines, ~24.5 KB

---

## Design Decisions

### Why Regex-Based Extraction?
- **Speed:** No LLM calls needed for every context build
- **Reliability:** Deterministic parsing, no hallucinations
- **Cost:** Zero API cost per extraction
- **Graceful Degradation:** Returns defaults when markdown format varies

### Why Separate from memoryService?
- **Separation of Concerns:** memoryService handles file I/O, agentContext handles interpretation
- **Reusability:** Other services can use memoryService without agent-specific logic
- **Testing:** Easier to test extraction functions in isolation

### Why Role-Specific Prompts?
- **Precision:** Each agent module has different responsibilities and outputs
- **Safety:** Strategist shouldn't execute campaigns, Advertiser shouldn't modify infrastructure
- **Clarity:** Role prompts make it obvious what each module should/shouldn't do

---

## Known Limitations

1. **Markdown Format Dependency:** Extraction functions expect specific markdown structure (e.g., `**Client Contact:**`). If USER.md format changes, extractions may fail (but return safe defaults).

2. **No Semantic Search:** Recent issues and learnings are matched via keyword overlap, not semantic similarity. Could miss relevant context if wording differs significantly.

3. **Static Role Prompts:** Role descriptions are hardcoded. To update, must edit ROLE_PROMPTS object.

4. **No Multi-Language Support:** Extraction regex assumes English markdown. Non-English USER.md files may not parse correctly.

---

## Success Metrics

✅ All 4 agent roles can build context  
✅ Extraction functions parse demo client data correctly  
✅ Card enrichment adds brand name + context  
✅ Cause analysis surfaces relevant learnings  
✅ Test suite passes 100%  
✅ ~300 lines (within target)  
✅ Zero external dependencies beyond memoryService  

---

**Phase D.1 Status:** ✅ **COMPLETE**

Ready for Phase D.2: Action Card Generation with LLM integration.
