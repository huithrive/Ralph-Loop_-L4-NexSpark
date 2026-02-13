# NexSpark — High-Level Architecture

## What We're Building

A chat-driven AI growth OS that guides e-commerce founders from zero to running ad campaigns. Split-pane UI: **chat** (left) drives interaction, **canvas** (right) displays artifacts.

---

## System Overview

```
┌─────────────────────────────────────────────────────┐
│                    Client (SPA)                      │
│  ┌──────────────┐         ┌───────────────────────┐ │
│  │  Chat Panel   │◄──────►│    Canvas Panel        │ │
│  └──────┬───────┘         └──────────┬────────────┘ │
│    ┌────┴────────────────────────────┴────┐         │
│    │       Client State Machine            │         │
│    │  phase · step · answers · mods        │         │
│    └──────────────────┬───────────────────┘         │
└───────────────────────┼─────────────────────────────┘
                        │ REST + SSE
┌───────────────────────┼─────────────────────────────┐
│                   API Server                         │
│                                                      │
│  ┌────────────────────┴───────────────────────┐     │
│  │            Flow Orchestrator                │     │
│  │  Routes per phase · returns chat messages   │     │
│  │  + optional canvas trigger                  │     │
│  └──┬────────┬────────┬────────┬─────────┬────┘     │
│     │        │        │        │         │          │
│  Research  Interview  Builder  Creative  Campaign   │
│  Service   Service    Service  Service   Service    │
│     │        │        │        │         │          │
│  ┌──┴────────┴────────┴────────┴─────────┴──┐      │
│  │           AI Layer (Claude + Image Gen)    │      │
│  └──────────────────┬────────────────────────┘      │
│  ┌──────────────────┴────────────────────────┐      │
│  │  Integrations (Shopify · Meta · Google)    │      │
│  └───────────────────────────────────────────┘      │
│  ┌───────────────────────────────────────────┐      │
│  │  Data (Postgres + Redis)                   │      │
│  └───────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────┘
```

---

## Core Concepts

| Concept | What it is |
|---------|------------|
| **Phase** | A step in the journey (research → interview → report → builder → creative → campaigns → free). Controls UI layout. |
| **Flow** | A server-returned sequence of chat messages within a phase (questions, progress, acks). |
| **Artifact** | A canvas-rendered output (report, LP preview, creative preview). Linked from chat, loaded on click. |
| **Transition** | Phase change triggered by user action. Can toggle layout (fullwidth chat ↔ split). |

---

## Phase & Flow Engine

### Phase Graph (not a linear pipeline)

Phases are nodes in a **directed graph**, not a linear sequence. Any phase can transition to any other phase it declares, and users can defer, skip, and return.

```
                    ┌──────────────────────────────┐
                    │          Free Mode            │
                    │  (hub — any phase reachable)  │
                    └──┬─────┬─────┬─────┬─────┬───┘
                       │     │     │     │     │
            ┌──────────┘     │     │     │     └──────────┐
            ▼                ▼     ▼     ▼                ▼
      ┌──────────┐    ┌───────┐  ┌───────┐    ┌──────────┐
      │ Research  │───►│Interview│►│Report │    │ Campaign │
      │  (split)  │    │(fullw) │  │(split)│    │  (split) │
      └──────────┘    └───────┘  └───┬───┘    └──────────┘
                                     │               ▲
                          ┌──────────┼──────────┐    │
                          ▼          ▼          │    │
                    ┌──────────┐  ┌──────────┐  │    │
                    │ Builder   │  │ Creative │  │    │
                    │(fw→split) │  │(fw→split)│  │    │
                    └─────┬────┘  └─────┬────┘  │    │
                          │             │       │    │
                          └──────┬──────┘       │    │
                                 └──────────────┘────┘
                              (back to report, free, or each other)
```

Key difference from a pipeline: **Free Mode is a hub.** Once unlocked, users can enter any phase from Free Mode via slash commands or choices. Phases can also transition directly between each other (builder → creative → campaigns).

### Phase Definition

```
Phase {
  id:          string
  layout:      'split' | 'fullwidth'
  flows:       Flow[]
  transitions: { [action]: phaseId }
  resumable:   boolean              // can user return to this phase later?
  entryGuard?: (state) → boolean   // prerequisites (e.g. report must exist)
}
```

Example:
```
builder: {
  layout: 'fullwidth',
  flows: [gather, pick, preview],
  transitions: {
    publish:    'free',
    creative:   'creative',
    campaigns:  'campaigns',
    skip:       'free',           // user can defer and come back
  },
  resumable: true,                // re-entering restores last flow/step
  entryGuard: (state) => !!state.report  // needs report first
}
```

### Flow Definition

```
Flow {
  id:          string
  steps:       FlowStep[]
  onComplete:  {
    nextFlow?:    flowId
    layout?:      'split'
    canvas?:      string
    transition?:  string
  }
}

FlowStep {
  key:         string
  handler:     (input, state, ctx) → StepResult
  skippable:   boolean             // user can say "skip" to move on
}

StepResult {
  messages:    ChatMessage[]
  canvas?:     string
  stateUpdate: object
  advance:     boolean             // false = stay on current step (follow-up)
}
```

### How `advance: false` Enables Follow-up Questions

The previous design assumed every user input advances the step. In reality, a user might ask "what makes a good headline?" before actually providing one. The `advance` flag handles this:

```
User: "What makes a good headline?"
  → handler detects this is a question, not an answer
  → returns { messages: [explanation], advance: false }
  → step stays at 0, user can ask more or provide their headline

User: "The Last Water Bottle You'll Ever Need"
  → handler detects this is an answer
  → returns { messages: [ack + next Q], advance: true, stateUpdate: { headline: "..." } }
  → step advances to 1
```

The handler decides whether input is an answer or a follow-up. Simple approach: if input ends with `?` or matches question patterns, treat as follow-up. Better approach: use Claude to classify intent.

### How Skip and Resume Works

**Skipping a phase:**
```
User clicks "Skip for now" during builder gather
  → transition: 'skip' → 'free'
  → state.suspended.builder = { flow: 'gather', step: 1, answers: { headline: '...' } }
  → user lands in free mode
```

**Resuming a phase:**
```
User types "/landing-page" or clicks "Build Landing Page" in free mode
  → entryGuard passes (report exists)
  → checks state.suspended.builder
  → if found: restores flow/step/answers, chat shows "Picking up where you left off..."
  → if not: starts fresh from flow 0, step 0
```

**State shape for suspend/resume:**
```
state: {
  phase: 'free',
  suspended: {
    builder:  { flow: 'gather', step: 1, answers: { headline: '...' } },
    creative: null,   // never started
  },
  completed: {
    research: true,
    interview: true,
    report: true,
    builder: false,   // suspended, not complete
  }
}
```

### How They Work Together

```
User types "What makes a good CTA?"
       │
       ▼
┌─────────────────────┐
│   Client Router      │  phase: 'builder', flow: 'gather', step: 1
└──────────┬──────────┘
           │ POST /api/flow/step { input: "What makes a good CTA?" }
           ▼
┌─────────────────────┐
│   Flow Orchestrator  │  calls gather.handler(input, state, ctx)
│                      │  handler classifies as question → advance: false
└──────────┬──────────┘
           │ { messages: [explanation], advance: false }
           ▼
┌─────────────────────┐
│   Client Router      │  appends explanation to chat
│                      │  step stays at 1 (still waiting for CTA)
└─────────────────────┘

User types "Shop Now — 20% Off"
       │
       ▼
  (same flow, step still 1)
           │ POST /api/flow/step { input: "Shop Now — 20% Off" }
           ▼
  handler classifies as answer → advance: true
           │ { messages: [ack, next Q], advance: true, stateUpdate: { cta: '...' } }
           ▼
  step advances to 2
```

### Where State Lives

| What | Where | Why |
|------|-------|-----|
| Phase + flow + step + answers | Client (JS) | Fast transitions, no round-trip for UI changes |
| Suspended phase snapshots | Client + Redis | Resume after skip or page refresh |
| Completed phase flags | Client + Redis | Entry guards, progress tracking |
| Artifacts (reports, pages) | Postgres | Persistent, shareable |
| Phase/flow definitions | Server config | Single source of truth for valid transitions |

The client owns the "cursor" (where am I) and "memory" (what I've done, what's suspended). The server owns the "rules" (what's valid) and "content" (what messages to return).

---

## Layers

### 1. Client — State Machine + Split Pane
- Tracks: phase, step, answers, mods
- Chat renders server-returned HTML (text, choices, progress, KPIs, artifact links)
- Canvas loads artifacts via GET routes
- Layout: `data-phase` attribute toggles fullwidth/split via CSS

### 2. API — Flow Orchestrator + Domain Services
- **Orchestrator**: Stateless routes that take user input → delegate to service → return `{ chatMessages[], canvasTrigger? }`
- **Services** (same contract each): `(input, state) → messages + state update`
  - Research · Interview · Builder · Creative · Campaign
- Server is stateless — flow state lives on client, persisted to Redis for recovery

### 3. AI Layer
- Claude: market analysis, copy generation, interview analysis, optimization recs
- Image gen API: creative asset generation + variations
- Shared prompt composition, streaming for long tasks

### 4. Integrations
- Shopify, Meta Ads, Google Ads, DNS — each an adapter: `connect()`, `sync()`, `execute()`

### 5. Data
- **Postgres**: users, projects, artifacts, campaign configs
- **Redis**: sessions, flow state cache, generated asset cache

---

## Guided Flow

```
Landing (enter URL)
  → Research (auto)
    → Interview (3 Qs, chat fullwidth)
      → Report (canvas)
        ├→ Builder (3 Qs → template → preview → refine → publish)
        ├→ Creative Gen (3 Qs → generate → preview variations)
        └→ Campaigns (wizard → launch)
          → Free Mode (slash commands)
```

---

## Foundation (build first, then distribute modules)

The foundation is everything a module developer should **never** have to think about. They write step handlers + canvas templates, register a phase definition, and everything else is handled.

### Foundation Components

```
┌─────────────────────────────────────────────────┐
│                  Foundation                       │
│                                                   │
│  1. Client Shell          4. Message Protocol     │
│  2. Phase Engine          5. Session Manager      │
│  3. Flow Orchestrator     6. AI SDK               │
│                                                   │
├───────────────────────────────────────────────────┤
│                                                   │
│  Module: Builder    Module: Creative    Module: …  │
│  - phase def        - phase def                   │
│  - step handlers    - step handlers               │
│  - canvas views     - canvas views                │
│                                                   │
└───────────────────────────────────────────────────┘
```

### 1. Client Shell

The split-pane UI chrome that every module renders inside.

- Chat panel: message list, input bar, typing indicator, auto-scroll
- Canvas panel: tab bar, content loader, empty state
- Layout engine: reads `data-phase` → applies fullwidth or split via CSS transitions
- Message renderer: takes a `ChatMessage` type (text, choices, progress, kpi-inline, artifact-link, divider) and renders the correct HTML

**Why first**: Without this, nobody can see anything.

### 2. Phase Engine (client)

The client-side state machine that manages navigation.

- Holds current phase, flow, step, and collected state (answers, mods)
- On user input: routes to the correct handler based on phase/flow
- On server response: appends messages, merges state updates, advances step
- On flow complete: checks `onComplete` — advance flow, change layout, or trigger transition
- On phase transition: validates against phase definition, sets new phase, resets flow/step

**Why first**: Modules register phase definitions into this engine. Without it, there's no way to plug in.

### 3. Flow Orchestrator (server)

The single API entry point that dispatches to module handlers.

```
POST /api/flow/step
  body: { phase, flow, step, input, state }
  → looks up phase registry
  → calls moduleHandler(input, state)
  → returns { messages[], canvas?, stateUpdate }
```

- Phase registry: a map of phase ID → module handler
- Validates that the requested phase/flow/step is valid
- Composes the `StepResult` into the response format the client expects

**Why first**: This is the contract between client and all modules. Nail it once.

### 4. Message Protocol

The shared vocabulary for chat messages. Every module returns these types — the client knows how to render each one.

```
ChatMessage =
  | { type: 'text', role, text, showLabel? }
  | { type: 'choices', choices: { label, action }[] }
  | { type: 'progress', steps: { text, done }[] }
  | { type: 'kpi-inline', kpis: { label, value, change?, trend? }[] }
  | { type: 'artifact-link', artifact: { id, title, icon, route } }
  | { type: 'divider', text }
```

**Why first**: This is the interface every module codes against. Change it later and you break everyone.

### 5. Session Manager

Manages flow state persistence and recovery.

- Client-side: in-memory state object with `getState()` / `mergeState()`
- On every step: snapshots state to Redis via background POST
- On page refresh: hydrates from Redis, resumes at last phase/flow/step
- Per-project: each user+project has an independent session

**Why first**: Without recovery, users lose progress on refresh. Without per-project sessions, you can't support multiple projects.

### 6. AI SDK

Shared wrapper for LLM and image generation calls.

- `ai.chat(systemPrompt, messages)` → text response (Claude)
- `ai.generate(prompt, style, options)` → image/video asset
- `ai.stream(systemPrompt, messages, onChunk)` → streaming for long tasks
- Handles retries, rate limits, token budgets
- Every module calls the same SDK — no direct API calls in module code

**Why first**: Every module needs AI. If each module rolls its own API calls, you get inconsistent error handling, no shared rate limiting, and duplicated boilerplate.

### What a Module Developer Builds

Take the Landing Page Builder module. Here's exactly what the developer writes vs what the foundation handles.

**Developer writes:**

```
modules/builder/
  phase.js            ← phase + flow definitions
  handlers/
    gather.js         ← 3-step Q&A handler (headline, CTA, selling points)
    pick.js           ← template selection handler
    preview.js        ← refinement handler (keyword → canvas mod)
    publish.js        ← publish handler (returns KPIs + transitions)
  canvas/
    templates.ejs     ← 4 template cards in a grid
    preview.ejs       ← full LP preview (hero, features, testimonials, pricing, trust)
```

**phase.js:**
```js
module.exports = {
  id: 'builder',
  layout: 'fullwidth',
  flows: [
    {
      id: 'gather',
      steps: [
        { key: 'headline',      handler: require('./handlers/gather') },
        { key: 'cta',           handler: require('./handlers/gather') },
        { key: 'sellingPoints', handler: require('./handlers/gather') },
      ],
      onComplete: { nextFlow: 'pick', layout: 'split', canvas: '/canvas/builder/templates' }
    },
    {
      id: 'pick',
      steps: [
        { key: 'template', handler: require('./handlers/pick') },
      ],
      onComplete: { nextFlow: 'preview', canvas: '/canvas/builder/preview' }
    },
    {
      id: 'preview',
      steps: [],                // freeform — any input goes to refine handler
      freeformHandler: require('./handlers/preview'),
      onComplete: null          // transitions handled by publish action
    }
  ],
  transitions: {
    publish:   'free',
    creative:  'creative',
    campaigns: 'campaigns'
  }
};
```

**handlers/gather.js** (one of the step handlers):
```js
// Foundation provides: messages helper, ai sdk, state
module.exports = function gatherStep(input, state, ctx) {
  var step = state.builderStep;
  var acks = [
    'Great headline. That\'ll grab attention.',
    'Solid CTA. Clear and action-driven.',
    'Perfect. I\'ve got your selling points.'
  ];

  return {
    messages: [
      ctx.msg.userText(input),
      ctx.msg.agentText(acks[step]),
      step < 2 ? ctx.msg.agentText(QUESTIONS[step + 1]) : ctx.msg.agentText('Pick a template.'),
      step >= 2 ? ctx.msg.choices(TEMPLATE_CHOICES) : null,
    ].filter(Boolean),
    stateUpdate: { builderStep: step + 1 }
  };
};
```

**Foundation handles everything else:**
- Routing user input to `gatherStep` based on current phase/flow/step
- Rendering `messages` array into chat HTML
- Applying `layout: 'split'` when gather flow completes
- Loading `canvas: '/canvas/builder/templates'` into the canvas panel
- Persisting `stateUpdate` to client state + Redis backup
- Validating `transitions.publish` when publish action fires

**The module developer never touches:** the chat panel, canvas loader, layout engine, state machine, session persistence, or message rendering. They write domain logic and templates.

### Build Order

| Order | Component | Depends On | Enables |
|-------|-----------|------------|---------|
| 1 | Message Protocol | nothing | everything |
| 2 | Client Shell | Message Protocol | visual testing |
| 3 | Phase Engine | Message Protocol | module registration |
| 4 | Flow Orchestrator | Message Protocol | server-side modules |
| 5 | Session Manager | Phase Engine | state recovery |
| 6 | AI SDK | nothing | AI-powered modules |

Items 1-4 are the critical path. 5 and 6 can be built in parallel by separate people.

---

## Tech Stack

### Frontend: React + Vite + TypeScript

The client is a state machine + message renderer + canvas loader. React provides the component model needed for complex canvas views (LP preview with nested sections, creative grid with score bars). TypeScript gives shared types with the server.

### Backend: Python + FastAPI

| Component | Choice | Why |
|-----------|--------|-----|
| **API Framework** | FastAPI | Async-first, Pydantic models for typed request/response, built-in SSE streaming, dependency injection, auto-generated OpenAPI docs. |
| **Agent Framework** | Pydantic AI | Type-safe AI agents built on Pydantic — same models your API already uses. Tool calling, structured output, multi-step reasoning. |
| **LLM SDK** | anthropic (Python) | First-class streaming, tool use, batching. Pydantic AI wraps this, or call direct for simple cases. |
| **ORM** | SQLAlchemy 2.0 (async) | Mature async sessions, Alembic for migrations. |
| **Cache/State** | redis-py (async) | Session state, flow state snapshots, pub/sub for real-time. |
| **Validation** | Pydantic v2 | Built into FastAPI. Define message protocol once, get validation on every request. |
| **Task Queue** | Celery or arq | Long-running AI jobs (creative generation, research analysis) run in background workers. |

### Why FastAPI over alternatives

- **vs Django** — Django is ORM-centric and not async-first. Wrong shape for a flow orchestrator + AI agents.
- **vs Flask** — No async, no built-in validation. You'd reinvent what FastAPI gives for free.
- **vs NestJS (Node)** — NestJS is fine for CRUD APIs but adds nothing for AI agent development. The Python AI ecosystem (Anthropic SDK, Pydantic AI, LangGraph) is significantly ahead.

### Message Protocol as Pydantic Models

The architecture's `ChatMessage` and `StepResult` become Pydantic models — validated automatically on every request:

```python
class ChatMessage(BaseModel):
    type: Literal["text", "choices", "progress", "kpi-inline", "artifact-link", "divider"]
    role: Literal["agent", "user"] = "agent"

class TextMessage(ChatMessage):
    type: Literal["text"] = "text"
    text: str
    show_label: bool = False

class StepResult(BaseModel):
    messages: list[ChatMessage]
    canvas: str | None = None
    state_update: dict = {}
```

Every module handler returns a `StepResult`. FastAPI validates it. The React client gets typed JSON.

### Module Registration via FastAPI Routers

Each module gets its own `APIRouter`, mounted by the orchestrator:

```python
# modules/builder/router.py
router = APIRouter(prefix="/builder")

@router.post("/step")
async def handle_step(req: StepRequest, state: SessionState = Depends(get_session)):
    handler = FLOW_HANDLERS[req.flow][req.step]
    return handler(req.input, state)
```

```python
# core/app.py
from modules.builder.router import router as builder_router
from modules.creative.router import router as creative_router

app.include_router(builder_router)
app.include_router(creative_router)
```

### Project Structure

```
server/
  core/
    app.py                ← FastAPI app, mounts module routers
    orchestrator.py       ← phase registry, flow dispatch
    models.py             ← ChatMessage, StepResult, PhaseDefinition (Pydantic)
    session.py            ← Redis-backed session state
    ai.py                 ← Anthropic + image gen wrapper
  modules/
    builder/
      phase.py            ← phase + flow definitions
      handlers.py         ← gather, pick, preview, publish
      canvas.py           ← routes that return canvas data
    creative/
      phase.py
      handlers.py
      canvas.py
    research/
      ...
  integrations/
    shopify.py
    meta_ads.py
    google_ads.py
  workers/
    tasks.py              ← Celery/arq tasks for long-running AI jobs

client/                   ← React + Vite + TypeScript
  src/
    shell/                ← chat panel, canvas panel, layout engine
    engine/               ← phase engine, state machine
    renderers/            ← chat message components (text, choices, progress, etc.)
    types/                ← TypeScript mirrors of Pydantic models
```

---

## Infrastructure — Docker Compose

All components run as containers, orchestrated by Docker Compose. Same setup for local dev and cloud deployment.

### Container Architecture

```
docker-compose.yml

  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │  client   │  │  server   │  │  worker   │
  │ React+Vite│  │  FastAPI  │  │  Celery   │
  │  :5173    │  │  :8000    │  │           │
  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘
        │              │              │
  ┌─────┴──────────────┴──────────────┴─────┐
  │              Docker network              │
  ├────────────┬────────────┬───────────────┤
  │  postgres  │  redis     │  rabbitmq     │
  │  :5432     │  :6379     │  :5672/:15672 │
  └────────────┴────────────┴───────────────┘
```

### Services

| Service | Image | Purpose | Dev Mode |
|---------|-------|---------|----------|
| **client** | Node + Vite | React SPA, serves on :5173 | Volume-mount `client/src`, Vite hot reload |
| **server** | Python + FastAPI | API + flow orchestrator, serves on :8000 | Volume-mount `server/`, uvicorn `--reload` |
| **worker** | Python + Celery | Background AI jobs (creative gen, research) | Same image as server, different entrypoint |
| **postgres** | postgres:16 | Users, projects, artifacts | Persistent volume for data |
| **redis** | redis:7 | Sessions, flow state cache | Ephemeral (cache only) |
| **rabbitmq** | rabbitmq:3-management | Celery message broker | Management UI on :15672 |

### Why RabbitMQ as Celery Broker (not Redis)

Redis can act as a Celery broker but it's a cache, not a message queue. For production workloads it lacks:

- **Message persistence** — Redis drops unacked messages on restart. RabbitMQ persists to disk.
- **Delivery guarantees** — RabbitMQ supports publisher confirms and consumer acks. No silent message loss.
- **Routing** — RabbitMQ exchanges and routing keys let you route tasks to specific workers (e.g. GPU workers for image gen vs CPU workers for research analysis).
- **Priority queues** — user-facing tasks (refinements) get priority over background tasks (batch creative generation).
- **Dead letter queues** — failed tasks go to a DLQ for inspection instead of being silently dropped.
- **Backpressure** — RabbitMQ flow control prevents workers from being overwhelmed. Redis has no equivalent.

**Separation of concerns:** Redis handles what it's good at (cache, sessions, pub/sub for real-time). RabbitMQ handles what it's good at (reliable task delivery).

```
Server (FastAPI)
  │
  ├──► Redis          session state, flow state cache, SSE pub/sub
  │
  └──► RabbitMQ       task dispatch to Celery workers
        ├── default    general tasks (report gen, analysis)
        ├── gpu        image/video generation tasks
        └── dlq        failed tasks for retry/inspection
              │
              ▼
       Worker (Celery)
```

### Local Dev

```bash
docker compose up        # starts everything
# client:   http://localhost:5173  (hot reload)
# server:   http://localhost:8000  (auto reload)
# rabbit:   http://localhost:15672 (management UI, guest/guest)
# postgres: localhost:5432
# redis:    localhost:6379
```

Source code is volume-mounted, so edits to client or server code reflect immediately without rebuilding containers.

### Cloud Deployment

**Single VM (early stage):** Run the same `docker compose up -d` on an AWS EC2 or Azure VM. Add nginx as a reverse proxy in front. This works for early users and demos.

**Scaling up (later):** The same Docker images deploy to AWS ECS, Azure Container Apps, or Kubernetes. No code changes — just swap the orchestrator from Compose to the cloud platform's container service. Split services across instances as load grows (e.g. multiple worker replicas for heavy AI generation).

### Environment Config

```
.env.local          ← local dev (default ports, no auth, mock integrations)
.env.staging        ← UAT (real infra, test API keys, staging domain)
.env.production     ← live (real DB creds, prod API keys, prod domain)
```

**Staging mirrors production** — same Docker images, same infra (Postgres, Redis, RabbitMQ), same cloud provider. The only differences:

| Concern | Staging | Production |
|---------|---------|------------|
| Domain | staging.nexspark.io | app.nexspark.io |
| Database | Separate Postgres instance, seeded with test data | Production data |
| API keys | Sandbox keys (Shopify dev store, Meta test account) | Live keys |
| AI calls | Same Claude API, lower rate limits | Full rate limits |
| Data reset | Wiped and re-seeded before each UAT cycle | Never wiped |
| Access | Team + UAT testers only | All users |

Staging runs on the same VM/container setup as production (not a scaled-down version). This ensures UAT catches environment-specific issues — not just code bugs.

Docker Compose reads the env file. Same images, different config per environment.

---

## Key Design Decisions

1. **Chat is primary** — all actions flow through chat. Canvas is display-only.
2. **Server returns JSON, client renders** — server returns typed `StepResult` objects, React renders chat messages. Clean separation of data and presentation.
3. **Stateless server** — flow state on client, server endpoints are pure functions. Redis for session recovery.
4. **Layout via CSS phase** — `data-phase` attribute controls layout transitions.
5. **Artifact-link pattern** — chat contains links that load canvas routes on click. Decouples chat from canvas.
6. **Pydantic as the contract** — message protocol defined as Pydantic models. Validated on every request. TypeScript types generated from them for the client.
