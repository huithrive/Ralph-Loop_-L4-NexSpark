# agentContext.js Quick Reference

## 🚀 Getting Started (30 seconds)

```javascript
const agentContext = require('./services/openclaw/agentContext');

// Build context for any agent module
const context = await agentContext.buildContext('demo', 'analyzer');

// Use it!
console.log(context.meta.brandName);        // "YamaBushi Wagyu"
console.log(context.meta.clientName);       // "Kenji Tanaka"
console.log(context.meta.preferences);      // { targetROAS: 3.0, maxCPA: 45, ... }
console.log(context.meta.learnings);        // ["Interest targeting works", ...]
console.log(context.systemPrompt);          // Full prompt for LLM
```

---

## 📂 What You Got

### Main Service
```
backend/services/openclaw/agentContext.js
```
**298 lines** — Multi-agent context builder with 5 exported functions

### Demo Client
```
backend/data/clients/demo/
├── USER.md           # Brand profile
├── MEMORY.md         # Learnings
└── memory/
    └── 2026-02-24.md # Today's log
```

### Test Suite
```
backend/test-agentContext.js
```
Run: `node test-agentContext.js`

---

## 🎯 5 Functions You Need

### 1. buildContext(clientId, role, taskContext)
```javascript
const context = await agentContext.buildContext('demo', 'advertiser', {
  campaign: 'Meta - Wagyu Enthusiasts'
});
```
**Returns:** Full context object with systemPrompt, meta, taskContext

---

### 2. enrichCardWithContext(card, context)
```javascript
const enriched = agentContext.enrichCardWithContext({
  title: 'Your ads are losing money',
  body: 'Campaign performance declined.',
  severity: 'high'
}, context);
```
**Returns:** Card with brand name + context from memory

---

### 3. generateCauseAnalysis(rule, context)
```javascript
const analysis = agentContext.generateCauseAnalysis({
  metric: 'roas',
  condition: 'below 2.5',
  threshold: 2.5
}, context);
```
**Returns:** Human-readable root cause analysis

---

### 4. getAgentAttribution(role)
```javascript
const attr = agentContext.getAgentAttribution('advertiser');
// { role: 'advertiser', icon: '📢', label: 'Advertiser', color: '#10B981' }
```
**Returns:** Display metadata for frontend

---

### 5. ROLE_PROMPTS
```javascript
console.log(agentContext.ROLE_PROMPTS.advertiser);
// "You are the Advertiser module of Auxora..."
```
**Object with 4 role descriptions:** strategist, executor, advertiser, analyzer

---

## 🔧 Common Patterns

### Pattern 1: Analyzer (Heartbeat)
```javascript
const context = await agentContext.buildContext(clientId, 'analyzer', { metrics });
const cards = await generateCards(context.systemPrompt, metrics);
const enriched = cards.map(c => agentContext.enrichCardWithContext(c, context));
```

### Pattern 2: Advertiser (Campaign Setup)
```javascript
const context = await agentContext.buildContext(clientId, 'advertiser', { request });
const campaign = await createCampaign(context.systemPrompt, context.meta.preferences);
campaign.createdBy = agentContext.getAgentAttribution('advertiser');
```

### Pattern 3: Strategist (Report)
```javascript
const context = await agentContext.buildContext(clientId, 'strategist');
const report = await generateReport(context.systemPrompt, context.meta.learnings);
```

---

## ✅ Test It

```bash
# Quick test
cd ~/Downloads/Dev/nexspark/backend
node -e "const ac = require('./services/openclaw/agentContext'); \
  ac.buildContext('demo', 'analyzer').then(c => console.log('✅ Works!', c.meta.brandName))"

# Full test suite
node test-agentContext.js
```

---

## 📊 What's in context.meta?

```javascript
{
  clientName: 'Kenji Tanaka',           // Extracted from USER.md
  brandName: 'YamaBushi Wagyu',         // Extracted from USER.md
  preferences: {
    targetROAS: 3.0,                    // Parsed from USER.md
    maxCPA: 45,
    communication: 'WhatsApp for urgent...',
    monthlyBudget: 15000
  },
  recentIssues: [                        // From MEMORY.md
    'Generic messaging underperforms',
    'Lookalike 1% was paused',
    'Broad match drove up CPA'
  ],
  learnings: [                           // From MEMORY.md
    'Interest targeting works well',
    'Speed messaging resonates',
    'Higher-ticket items have better ROAS'
  ]
}
```

---

## 🎨 Agent Roles

| Role | Icon | Color | Purpose |
|------|------|-------|---------|
| strategist | 🎯 | Blue | Research, GTM, market analysis |
| executor | ⚙️ | Purple | Infrastructure, Shopify, landing pages |
| advertiser | 📢 | Green | Campaign management, Meta, Google |
| analyzer | 🔍 | Amber | Performance monitoring, alerts, safety |

---

## 📝 File Locations

| What | Where |
|------|-------|
| Main service | `backend/services/openclaw/agentContext.js` |
| Memory service (dep) | `backend/services/openclaw/memoryService.js` |
| Demo client data | `backend/data/clients/demo/` |
| Test suite | `backend/test-agentContext.js` |
| This guide | `AGENTCONTEXT_QUICKSTART.md` |
| Full docs | `PHASE_D1_COMPLETE.md` |

---

## 🐛 Troubleshooting

**Problem:** `buildContext()` returns empty meta  
**Fix:** Check client files are in `backend/data/clients/{clientId}/`, not `backend/clients/`

**Problem:** Extraction functions return defaults  
**Fix:** Verify USER.md has `**Client Contact:**` and `**Brand Name:**` format

**Problem:** Test fails with "Module not found"  
**Fix:** Run from `backend/` directory: `cd backend && node test-agentContext.js`

---

## 📚 Next Steps

1. **Phase D.2:** Use `buildContext()` in action card generation (heartbeatLoop.js)
2. **Phase D.3:** Multi-agent orchestration with role-specific contexts
3. **Phase D.4:** Memory compaction (already in memoryService, just wire it up)

---

**Questions?** Check `PHASE_D1_COMPLETE.md` for full API reference and examples.
