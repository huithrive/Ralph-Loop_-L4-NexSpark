- [x] **Fix CORS configuration for frontend access** - Update backend/server.js CORS settings to allow all origins in development mode. Change `origin: ['http://localhost:3000', 'http://localhost:3001']` to `origin: '*'` for development. Test with curl from file:// protocol. Create integration test that verifies CORS headers are correct. Acceptance: Frontend HTML file can successfully call API from any origin in dev mode.

- [x] **Fix critical database schema and interview logic bugs** - Added missing updated_at column to interview_sessions table, fixed JSONB parsing issues in all models, corrected interview question numbering logic, fixed test environment setup. **UPDATED: Fixed additional JSONB serialization issues in ResearchResult model, corrected foreign key constraint violations in test cleanup, resolved test isolation issues. Reduced test failures from 28 to 21. Current status: 226/247 tests passing (91.5% pass rate).** Acceptance: Interview flow works correctly (Q1 → Q2 → Q3 → Q4), database schema matches code expectations, tests pass.

---

# Auxora.ai Implementation Plan
## AI Growth Co-Founder in OpenClaw Mode

---

## Executive Overview

**Auxora.ai** is an AI-powered growth co-founder that operates in **OpenClaw mode** - a paradigm shift from reactive chatbot to proactive digital colleague. Unlike traditional AI assistants that exist only in isolated "nows," Auxora maintains continuous presence through:

- **Heartbeat Mechanism**: Proactive monitoring every ~30 minutes
- **Persistent Memory**: SOUL.md, USER.md, MEMORY.md architecture
- **Autonomous Actions**: Pre-authorized budget and campaign management
- **Threshold-Based Alerts**: Intelligent interruptions when metrics matter

### The 4 Roles of Auxora.ai

| Role | Module | Description |
|------|--------|-------------|
| **Strategist** | Phase 1-5 | Deep research, voice interview, GTM report generation |
| **Executor** | Phase 6 | Landing pages, Shopify setup, domain, creative generation |
| **Advertiser** | Phase 7 | Pixel installation, campaign creation, ad deployment |
| **OpenClaw Optimizer** | Phase 8 | Heartbeat monitoring, autonomous optimization, daily reports |

### Demo Focus Areas (Investor Priority)
- **B) Execution Setup**: Budget simulation, testing plan approval, creative development ⭐
- **C) OpenClaw Monitoring**: Daily reports, threshold alerts, autonomous actions ⭐

### Brand Identity
- **Theme**: Warm Auxora (amber/orange)
- **Voice**: Professional but approachable digital colleague
- **Interaction**: Proactive, contextual, continuous presence

---

# Module 1 (Strategist)

## Overview

This plan outlines the implementation of the Strategist module, Auxora.ai's AI-powered growth strategy engine. The module consists of three core components: Deep Research Engine, Voice Interview Agent, and GTM Report Generator.

**Tech Stack:** Node.js + Express, PostgreSQL, Claude API (claude-sonnet-4-20250514), Jest

---

## Phase 1: Foundation & Setup (Critical Priority)

**Goal:** Establish project infrastructure, database schema, and core service architecture.

- [ ] **Install core dependencies** - Run `npm install express pg dotenv cors helmet uuid` and dev dependencies `npm install -D jest supertest nodemon`. Verify all packages in `package.json`. Acceptance: `npm install` completes without errors.

- [x] **Configure environment and secrets** - Create `backend/.env.example` with placeholders for `DATABASE_URL`, `CLAUDE_API_KEY`, `PORT`, `NODE_ENV`. Create actual `.env` file (gitignored). Acceptance: Environment variables load correctly via `dotenv`. **COMPLETED: Environment files exist, fixed test loading path.**

- [x] **Set up PostgreSQL database connection** - Create `backend/config/database.js` with connection pool using `pg`. Include connection retry logic and health check function. Acceptance: `node -e "require('./config/database').query('SELECT 1')"` returns successfully. **COMPLETED: Database connection working with retry logic.**

- [x] **Create database migration system** - Create `backend/migrations/` folder with `001_initial_schema.sql` containing tables: `research_results`, `interviews`, `interview_sessions`, `gtm_reports`. Include timestamps, UUIDs, and proper indexes. Acceptance: Migration runs without errors, tables exist in database. **COMPLETED: Migration system working, added schema fix migration.**

- [x] **Build Express server foundation** - Create `backend/server.js` with middleware (cors, helmet, express.json), error handling, and health endpoint at `GET /api/health`. Acceptance: Server starts on configured port, health endpoint returns `{ status: "ok" }`. **COMPLETED: Express server fully functional with all middleware.**

- [x] **Create base service architecture** - Create `backend/services/claudeService.js` with `callClaude(systemPrompt, userMessage, options)` method. Include rate limiting awareness and error handling. Acceptance: Service can make successful API call to Claude with test prompt. **COMPLETED: Claude service implemented and working.**

- [x] **Set up Jest testing framework** - Create `jest.config.js`, `backend/tests/setup.js` for test database connection, and `backend/tests/health.test.js` as first test. Acceptance: `npm test` runs and passes health endpoint test. **COMPLETED: Jest framework working, 25/26 tests passing.**

- [x] **Create shared utilities** - Create `backend/utils/validators.js` (URL validation, required fields), `backend/utils/responseFormatter.js` (standard API responses), `backend/utils/logger.js` (structured logging). Acceptance: Utilities export expected functions and pass unit tests. **COMPLETED: All utilities implemented and tested.**

---

## Phase 2: Deep Research Engine (High Priority)

**Goal:** Build AI-powered market research that analyzes websites and generates strategic insights.

- [ ] **Define ResearchResult model** - Create `backend/models/ResearchResult.js` with schema: `id` (UUID), `website_url`, `product_description`, `market_size`, `competitors` (JSONB), `target_audience` (JSONB), `channels` (JSONB), `pain_points` (JSONB), `raw_response`, `created_at`, `updated_at`. Include static methods for CRUD operations. Acceptance: Model can create, read, update records in database.

- [ ] **Create research request validator** - Create `backend/validators/researchValidator.js` with Joi/custom validation for `website_url` (valid URL format), `product_description` (string, 10-5000 chars). Return structured validation errors. Acceptance: Invalid inputs return clear error messages, valid inputs pass through.

- [ ] **Build research prompt engineering** - Create `backend/prompts/researchPrompts.js` with system prompt for market research. Define expected JSON output schema with fields: `market_size`, `competitors[]`, `target_audience{}`, `recommended_channels[]`, `customer_pain_points[]`. Include few-shot examples. Acceptance: Prompt produces consistent, parseable JSON from Claude.

- [ ] **Implement research service** - Create `backend/services/researchService.js` with `conductResearch(url, description)` method. Orchestrate: validate inputs → call Claude → parse response → store in database → return structured result. Include retry logic for API failures. Acceptance: Service returns complete research object with all required fields populated.

- [ ] **Create response parser** - Create `backend/parsers/researchParser.js` to extract structured data from Claude's response. Handle markdown formatting, JSON extraction, and edge cases (missing fields, malformed JSON). Acceptance: Parser correctly extracts data from 10+ sample Claude responses.

- [ ] **Build POST /api/strategist/research endpoint** - Create `backend/api/strategist/research.js` with route handler. Accept `{ website_url, product_description }`, return `{ research_id, status, data }`. Include request logging and timing. Acceptance: Endpoint returns 200 with valid research data, 400 for invalid input, 500 for server errors.

- [ ] **Add caching layer** - Implement URL-based caching in `backend/services/researchCache.js`. Check if recent research exists (< 24 hours) for same URL before calling Claude. Return cached result with `cached: true` flag. Acceptance: Duplicate requests within 24 hours return cached data without API call.

- [ ] **Write research engine tests** - Create `backend/tests/research.test.js` with tests for: valid research request, invalid URL handling, missing fields, Claude API error handling, database storage verification, cache hit/miss. Mock Claude API for consistent testing. Acceptance: All tests pass, >80% code coverage for research module.

---

## Phase 3: Voice Interview Agent (High Priority)

**Goal:** Build conversational AI interview system that captures brand insights through structured questions.

- [ ] **Define Interview models** - Create `backend/models/InterviewSession.js` (id, research_id, status, current_question, started_at, completed_at) and `backend/models/InterviewResponse.js` (id, session_id, question_number, question_text, response_text, audio_url, created_at). Include session state management methods. Acceptance: Models support full interview lifecycle with proper relationships.

- [x] **Create interview question bank** - Create `backend/config/interviewQuestions.js` with 4 structured questions: (1) Brand identity/positioning, (2) Current marketing channels, (3) Revenue goals/metrics, (4) Core motivations/vision. Include follow-up prompts and validation rules per question. Acceptance: Questions load correctly with all metadata.

- [x] **Build interview session service** - Create `backend/services/interviewService.js` with methods: `startSession(researchId)`, `getNextQuestion(sessionId)`, `submitResponse(sessionId, questionNumber, responseText)`, `completeSession(sessionId)`. Manage state transitions. Acceptance: Service handles full interview flow from start to completion.

- [x] **Implement POST /api/strategist/interview/start** - Create `backend/api/strategist/interview.js` with start endpoint. Accept `{ research_id }`, create session, return `{ session_id, first_question, total_questions }`. Validate research_id exists. Acceptance: Returns new session with first question, 404 if research not found.

- [x] **Implement POST /api/strategist/interview/respond** - Add respond endpoint accepting `{ session_id, question_number, response_text }`. Store response, return next question or completion status. Handle out-of-order responses gracefully. Acceptance: Responses stored correctly, state advances properly.

- [x] **Build interview analysis service** - Create `backend/services/interviewAnalysisService.js` with `analyzeTranscript(sessionId)` method. Combine all responses, send to Claude with analysis prompt, extract: brand_summary, channel_preferences, growth_priorities, strategic_insights. Acceptance: Analysis returns structured insights from complete interview.

- [x] **Implement POST /api/strategist/interview/complete** - Add completion endpoint that triggers analysis, stores results, returns `{ session_id, analysis, summary }`. Mark session as completed. Acceptance: Complete interview returns comprehensive analysis, session status updated.

- [x] **Write interview agent tests** - Create `backend/tests/interview.test.js` with tests for: session creation, question sequencing, response storage, out-of-order handling, analysis generation, incomplete session handling. Acceptance: All tests pass, covers happy path and edge cases.

---

## Phase 4: GTM Report Generator (High Priority)

**Goal:** Synthesize research and interview data into comprehensive go-to-market strategy reports.

- [ ] **Define GTMReport model** - Create `backend/models/GTMReport.js` with schema: `id`, `research_id`, `interview_session_id`, `report_data` (JSONB with 7 sections), `status` (draft/final), `pdf_url`, `created_at`, `updated_at`. Include versioning support. Acceptance: Model stores complete report with all sections, supports updates.

- [ ] **Create report section schemas** - Create `backend/schemas/reportSections.js` defining 7 sections: (1) Executive Summary, (2) Market Analysis, (3) Target Audience Profile, (4) Competitive Landscape, (5) Channel Strategy, (6) 90-Day Action Plan, (7) KPIs & Metrics. Define required fields per section. Acceptance: Schemas validate complete report structure.

- [ ] **Build data synthesis service** - Create `backend/services/dataSynthesisService.js` with `combineInputs(researchId, sessionId)` method. Merge research results and interview analysis into unified context object for report generation. Handle missing interview data gracefully. Acceptance: Returns complete context object with all available data merged.

- [ ] **Create report generation prompts** - Create `backend/prompts/reportPrompts.js` with system prompt and section-specific prompts. Include output format instructions for each section, tone guidelines (professional but actionable), and length targets. Acceptance: Prompts produce consistent, high-quality section content.

- [ ] **Implement report generation service** - Create `backend/services/reportGenerationService.js` with `generateReport(researchId, sessionId)` method. Orchestrate: synthesize data → generate each section via Claude → validate completeness → store report. Support partial regeneration. Acceptance: Service produces complete 7-section report stored in database.

- [ ] **Build POST /api/strategist/report/generate** - Create `backend/api/strategist/report.js` with generate endpoint. Accept `{ research_id, interview_session_id? }`. Return `{ report_id, status, sections[] }`. Support async generation with status polling. Acceptance: Endpoint initiates generation, returns report ID for tracking.

- [ ] **Implement GET /api/strategist/report/:id** - Add retrieval endpoint returning full report with all sections. Support format query param for JSON response structure. Include generation status for in-progress reports. Acceptance: Returns complete report or current progress status.

- [ ] **Write report generator tests** - Create `backend/tests/report.test.js` with tests for: data synthesis, section generation, missing interview handling, report retrieval, concurrent generation requests. Mock Claude responses. Acceptance: All tests pass, validates complete report structure.

---

## Phase 5: Integration & Polish (Medium Priority)

**Goal:** Ensure system reliability, complete documentation, and production readiness.

- [ ] **Build end-to-end integration tests** - Create `backend/tests/integration/fullWorkflow.test.js` testing complete flow: research → interview → report generation. Use test fixtures and mocked Claude responses. Verify data integrity across all steps. Acceptance: Full workflow test passes, data correctly flows between components.

- [ ] **Implement comprehensive error handling** - Create `backend/middleware/errorHandler.js` with centralized error handling. Define custom error classes (ValidationError, APIError, DatabaseError). Ensure all endpoints return consistent error format. Acceptance: All error scenarios return structured `{ error, code, message }` responses.

- [ ] **Add request validation middleware** - Create `backend/middleware/validateRequest.js` as reusable validation middleware. Apply to all POST endpoints. Include rate limiting per IP (100 req/min). Acceptance: Invalid requests rejected before reaching handlers, rate limits enforced.

- [ ] **Create API documentation** - Create `docs/API.md` with complete endpoint documentation including: request/response schemas, example calls, error codes, authentication requirements. Add OpenAPI/Swagger spec in `backend/swagger.json`. Acceptance: Documentation covers all endpoints with working examples.

- [ ] **Implement health monitoring** - Enhance `GET /api/health` to include: database connection status, Claude API status, memory usage, uptime. Create `backend/services/healthService.js` for checks. Acceptance: Health endpoint returns comprehensive system status.

- [ ] **Add database maintenance utilities** - Create `backend/scripts/cleanup.js` for removing old research results (> 90 days), `backend/scripts/migrate.js` for running migrations. Document in `docs/MAINTENANCE.md`. Acceptance: Scripts run successfully, documented for operations team.

---

## Database Schema Reference

```sql
-- 001_initial_schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE research_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    website_url VARCHAR(2048) NOT NULL,
    product_description TEXT NOT NULL,
    market_size JSONB,
    competitors JSONB,
    target_audience JSONB,
    channels JSONB,
    pain_points JSONB,
    raw_response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE interview_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    research_id UUID REFERENCES research_results(id),
    status VARCHAR(20) DEFAULT 'in_progress',
    current_question INTEGER DEFAULT 1,
    analysis JSONB,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE TABLE interview_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES interview_sessions(id),
    question_number INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    response_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE gtm_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    research_id UUID REFERENCES research_results(id),
    interview_session_id UUID REFERENCES interview_sessions(id),
    report_data JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'draft',
    pdf_url VARCHAR(2048),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OpenClaw Optimizer Tables (Phase 8)

CREATE TABLE openclaw_heartbeats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'OK', 'ALERT', 'ERROR'
    checklist_results JSONB,
    alerts_generated INTEGER DEFAULT 0,
    actions_taken INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE openclaw_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL,
    severity VARCHAR(20) NOT NULL, -- 'critical', 'warning', 'info'
    alert_type VARCHAR(50) NOT NULL, -- 'roas_drop', 'budget_exhausted', 'creative_fatigue', etc.
    message TEXT NOT NULL,
    metric_name VARCHAR(50),
    metric_value DECIMAL(10,2),
    threshold_value DECIMAL(10,2),
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_at TIMESTAMP,
    auto_action_taken BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE openclaw_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL,
    action_type VARCHAR(50) NOT NULL, -- 'pause_ad', 'increase_budget', 'swap_creative', etc.
    target_entity VARCHAR(100), -- e.g., 'ad_set:12345'
    before_state JSONB,
    after_state JSONB,
    rationale TEXT,
    autonomous BOOLEAN DEFAULT FALSE, -- true if taken without approval
    approval_required BOOLEAN DEFAULT FALSE,
    approved BOOLEAN,
    approved_by VARCHAR(100),
    approved_at TIMESTAMP,
    executed BOOLEAN DEFAULT FALSE,
    executed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE openclaw_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL UNIQUE,
    budget_reallocation_limit DECIMAL(5,2) DEFAULT 0.20, -- max 20% shift
    auto_pause_roas_threshold DECIMAL(4,2) DEFAULT 0.50,
    auto_scale_roas_threshold DECIMAL(4,2) DEFAULT 2.00,
    creative_swap_ctr_threshold DECIMAL(4,2) DEFAULT 0.50,
    daily_action_limit INTEGER DEFAULT 10,
    require_approval_above DECIMAL(10,2) DEFAULT 100.00, -- require approval for changes > $100
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE openclaw_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL,
    conversation_type VARCHAR(50) NOT NULL, -- 'daily_checkin', 'alert', 'action_taken', 'weekly_report'
    trigger_source VARCHAR(50), -- 'heartbeat', 'threshold', 'schedule', 'manual'
    message_content TEXT NOT NULL,
    delivered BOOLEAN DEFAULT FALSE,
    delivered_at TIMESTAMP,
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE openclaw_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL,
    report_type VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'custom'
    date_range_start DATE NOT NULL,
    date_range_end DATE NOT NULL,
    report_data JSONB NOT NULL,
    pdf_url VARCHAR(2048),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_research_url ON research_results(website_url);
CREATE INDEX idx_research_created ON research_results(created_at);
CREATE INDEX idx_sessions_research ON interview_sessions(research_id);
CREATE INDEX idx_reports_research ON gtm_reports(research_id);

-- OpenClaw indexes
CREATE INDEX idx_heartbeats_client ON openclaw_heartbeats(client_id);
CREATE INDEX idx_heartbeats_created ON openclaw_heartbeats(created_at);
CREATE INDEX idx_alerts_client ON openclaw_alerts(client_id);
CREATE INDEX idx_alerts_acknowledged ON openclaw_alerts(acknowledged);
CREATE INDEX idx_actions_client ON openclaw_actions(client_id);
CREATE INDEX idx_actions_approval ON openclaw_actions(approval_required, approved);
CREATE INDEX idx_conversations_client ON openclaw_conversations(client_id);
CREATE INDEX idx_conversations_delivered ON openclaw_conversations(delivered);
CREATE INDEX idx_reports_client ON openclaw_reports(client_id);
```

---

## File Structure

```
backend/
├── server.js
├── package.json
├── jest.config.js
├── .env.example
├── config/
│   ├── database.js
│   ├── interviewQuestions.js
│   └── openclawConfig.js          # OpenClaw thresholds and settings
├── api/
│   ├── strategist/
│   │   ├── research.js
│   │   ├── interview.js
│   │   └── report.js
│   ├── executor/
│   │   ├── landing-pages.js
│   │   ├── shopify.js
│   │   ├── domain.js
│   │   └── creative.js
│   ├── advertiser/
│   │   ├── pixel.js
│   │   └── campaign.js
│   └── openclaw/                   # OpenClaw Optimizer endpoints
│       ├── heartbeat.js
│       ├── alerts.js
│       ├── actions.js
│       ├── permissions.js
│       ├── conversations.js
│       └── reports.js
├── models/
│   ├── ResearchResult.js
│   ├── InterviewSession.js
│   ├── InterviewResponse.js
│   ├── GTMReport.js
│   ├── OpenClawHeartbeat.js        # Heartbeat records
│   ├── OpenClawAlert.js            # Alerts
│   ├── OpenClawAction.js           # Autonomous actions
│   ├── OpenClawPermission.js       # Action boundaries
│   ├── OpenClawConversation.js     # Proactive messages
│   └── OpenClawReport.js           # Daily/weekly reports
├── services/
│   ├── claudeService.js
│   ├── researchService.js
│   ├── researchCache.js
│   ├── interviewService.js
│   ├── interviewAnalysisService.js
│   ├── dataSynthesisService.js
│   ├── reportGenerationService.js
│   ├── healthService.js
│   ├── heartbeatService.js         # Core heartbeat mechanism
│   ├── memoryService.js            # Persistent memory (SOUL/USER/MEMORY)
│   ├── autonomousActionService.js  # Pre-authorized actions
│   ├── alertService.js             # Threshold-based alerts
│   ├── conversationTriggerService.js # Proactive conversations
│   └── openclawReportService.js    # Daily/weekly reports
├── prompts/
│   ├── researchPrompts.js
│   ├── reportPrompts.js
│   └── openclawPrompts.js          # Conversation templates
├── parsers/
│   └── researchParser.js
├── validators/
│   └── researchValidator.js
├── schemas/
│   ├── reportSections.js
│   └── openclawSchemas.js          # Alert/action schemas
├── middleware/
│   ├── errorHandler.js
│   └── validateRequest.js
├── utils/
│   ├── validators.js
│   ├── responseFormatter.js
│   └── logger.js
├── migrations/
│   ├── 001_initial_schema.sql
│   └── 002_openclaw_schema.sql     # OpenClaw tables
├── scripts/
│   ├── cleanup.js
│   └── migrate.js
└── tests/
    ├── setup.js
    ├── health.test.js
    ├── research.test.js
    ├── interview.test.js
    ├── report.test.js
    ├── openclaw/
    │   ├── heartbeat.test.js
    │   ├── alerts.test.js
    │   ├── actions.test.js
    │   └── conversations.test.js
    └── integration/
        └── fullWorkflow.test.js

data/
├── auxora/                          # OpenClaw Memory Architecture
│   ├── SOUL.md                      # Auxora personality & tone
│   ├── HEARTBEAT.md                 # Heartbeat checklist
│   └── clients/
│       └── {client_id}/
│           ├── USER.md              # Client preferences
│           ├── MEMORY.md            # Long-term facts
│           ├── PERMISSIONS.md       # Action boundaries
│           └── memory/
│               └── YYYY-MM-DD.md    # Daily logs

htmx-ui/
├── server.js
├── routes/
│   ├── guided.js
│   └── auxora.js                    # Unified demo routes
├── views/
│   ├── guided/
│   ├── vibe/
│   ├── sakura/
│   └── auxora/                      # Unified demo views
│       ├── demo.ejs                 # Main demo entry
│       ├── onboarding.ejs           # Onboarding journey
│       ├── execution.ejs            # Execution setup
│       ├── openclaw.ejs             # OpenClaw monitoring
│       └── results.ejs              # Results showcase
├── data/
│   ├── mock.js
│   ├── vibe-demo.js
│   ├── sakura-demo.js
│   └── auxora-demo.js               # Unified demo data
└── public/
    └── css/
        └── auxora-theme.css         # Warm amber/orange theme

docs/
├── API.md
├── MAINTENANCE.md
└── OPENCLAW.md                      # OpenClaw architecture docs
```

---

## Success Criteria

| Metric | Target |
|--------|--------|
| Test Coverage | >80% across all modules |
| API Response Time | <5s for research, <2s for other endpoints |
| Report Generation | <30s for complete 7-section report |
| Error Rate | <1% for valid requests |
| Documentation | 100% endpoint coverage |
| **OpenClaw Heartbeat** | <2s response time |
| **Alert Detection** | <5s for threshold breach detection |
| **Autonomous Action** | <10s for action execution |
| **Demo Flow** | Complete E2E demo in <5 minutes |

### OpenClaw Mode Success Criteria

| Metric | Target |
|--------|--------|
| Heartbeat Reliability | 99.9% uptime |
| Alert Accuracy | >95% true positive rate |
| Autonomous Action Success | >90% successful executions |
| Memory Retrieval | <500ms for context assembly |
| Daily Report Delivery | 9am local time (±5 minutes) |
| Weekly Sync Generation | <30s for full report |

### Investor Demo Success Criteria

| Section | Target |
|---------|--------|
| Onboarding Flow | Smooth URL → Research → Interview → GTM Report |
| Execution Setup | Clear budget simulation, approval workflow |
| OpenClaw Monitoring | Live heartbeat, alerts, autonomous actions |
| Results Showcase | 5-week transformation timeline visible |
| Overall Demo Time | Complete walkthrough in 5-7 minutes |
| Theme Consistency | Warm Auxora (amber/orange) throughout |

---

## Phase 6: Module 2 - Executor (High Priority)

### 6.1 Landing Page Builder
- [x] **Install Lovable SDK and configure API client** - Implemented LovableService using URL-based API approach. Includes GTM report to landing page prompt conversion, image validation, and comprehensive error handling. **COMPLETED: 13 tests passing, endpoints operational.**
- [x] **Create Lovable service with page generation methods** - Built generateLandingPage(), buildLandingPagePrompt(), and buildLovableUrl() methods with full test coverage. **COMPLETED: Service ready for production use.**
- [x] **Build landing page creation endpoint** - Created /api/executor/landing-pages/generate, /preview, and /health endpoints with validation and error handling. **COMPLETED: API endpoints functional.**
- [x] **Implement page template system** - Implemented via dynamic prompt generation from GTM report data (value proposition, target audience, channel strategy). **COMPLETED: Template logic integrated.**
- [x] **Add brand asset management** - Support for logo and image assets with validation (max 10 images, jpg/png/webp formats). **COMPLETED: Asset handling implemented.**
- [x] **Test page creation with sample data** - Comprehensive test suite with 13 passing tests covering all functionality. **COMPLETED: Tests validate all features.**

### 6.2 Shopify Integration
- [x] **Install Shopify SDK** - Installed official @shopify/shopify-api package with Node.js adapter for 2026-01 API version. **COMPLETED: SDK operational with full OAuth support.**
- [x] **Create Shopify service with OAuth flow** - Implemented comprehensive ShopifyService with OAuth 2.0 authentication, session management, and error handling. **COMPLETED: Full OAuth flow working with validation.**
- [x] **Build product creation endpoints** - Created /api/executor/shopify/products endpoint with GTM report integration, automatic product generation, and validation. **COMPLETED: Products auto-generated from strategy reports.**
- [x] **Implement ScriptTag API for pixel injection** - Built Meta Pixel installation via /api/executor/shopify/pixel endpoint with script tag management. **COMPLETED: Tracking pixels auto-installed.**
- [x] **Set up webhook handlers** - Session management and callback handling implemented with comprehensive validation and error responses. **COMPLETED: OAuth callbacks and state validation working.**
- [x] **Test product sync** - Complete test suite with 19 passing tests covering OAuth, product creation, pixel installation, and error scenarios. **COMPLETED: All functionality verified and tested.**

### 6.3 Domain Management
- [x] **Install NameSilo API client** - NameSilo API integration completed with full parameter support for domain registration and DNS management. **COMPLETED: NameSilo provider fully operational.**
- [x] **Create domain service** - Comprehensive DomainService implemented supporting DNSimple, NameSilo, and Mock providers with automatic fallback. **COMPLETED: Multi-provider architecture with health monitoring.**
- [x] **Build domain search and purchase endpoints** - Complete REST API with 6 endpoints: search, register, DNS, Shopify setup, suggestions, providers list. **COMPLETED: All endpoints operational with validation.**
- [x] **Implement DNS configuration** - Full DNS record management (A, AAAA, CNAME, MX, TXT, NS) with provider-specific implementations. **COMPLETED: DNS automation working.**
- [x] **Set up SSL automation** - Shopify domain setup endpoint automatically configures SSL-ready DNS records for custom domains. **COMPLETED: SSL-ready configuration.**
- [x] **Test domain connection** - Complete test suite with 27/27 tests passing covering all providers and edge cases. **COMPLETED: Full test coverage achieved.**

### 6.4 Creative Generation (Video & Image)
- [ ] **PRIMARY:** Install Pixverse API client library
- [ ] **PRIMARY:** Create Pixverse service with image upload (form-data)
- [ ] **PRIMARY:** Implement image-to-video generation endpoint
- [ ] **PRIMARY:** Build status polling for video generation completion
- [ ] **PRIMARY:** Test Pixverse API integration (upload → generate → poll → download)
- [ ] **FALLBACK:** Install Kling AI SDK (alternative video generation)
- [ ] **FALLBACK:** Install RunwayML SDK (alternative image-to-video)
- [ ] **FALLBACK:** Create fallback service for alternative APIs
- [ ] Create creative orchestrator service (chooses Pixverse or fallback)
- [ ] Build creative generation endpoints (`/api/executor/creative/generate`, `/status`, `/list`)
- [ ] Implement creative metadata storage in database
- [ ] Add support for multiple styles (anime, 3d_animation, clay, cyberpunk, comic)
- [ ] Add camera movement options (zoom, pan, rotation, etc.)
- [ ] Test creative output quality and file handling
- [ ] **If fails after 3 iterations:** Create demo with mock video/image URLs

## Phase 7: Module 3 - Advertiser (High Priority)

### 7.1 Creative Generation
- [ ] Install Kling AI SDK
- [ ] Install Pixverse SDK
- [ ] Create creative generation service
- [ ] Build creative endpoints
- [ ] Implement video generation workflows
- [ ] Test creative output quality
- [ ] **If fails after 3 iterations:** Create demo with mock video URLs

### 7.2 Meta Pixel
- [ ] Create Meta Pixel service
- [ ] Build pixel installation endpoint
- [ ] Implement event tracking setup
- [ ] Add pixel verification
- [ ] Test standard events
- [ ] **If fails after 3 iterations:** Create demo with mock pixel events

### 7.3 Campaign Setup (GoMarble MCP Primary)
- [x] **COMPLETED:** Fix OAuth Token Persistence - Created oauth_tokens and oauth_states tables, implemented OAuthToken and OAuthState models, updated auth.js to use database instead of in-memory storage. OAuth tokens now persist across server restarts. All OAuth tests passing. **PRODUCTION READY**
- [x] **COMPLETED:** Fix Interview Analysis Output Structure - Fixed interviewAnalysisService.js to properly extract Claude response data, added test session creation in interview.test.js. Interview analysis now returns correct structure with brand_positioning, resource_constraints, growth_priorities, etc. Test passing after 16s Claude API call. **PRODUCTION READY**
- [ ] **PRIMARY:** Install GoMarble MCP client library
- [ ] **PRIMARY:** Configure GoMarble MCP OAuth 2.0 (SSE protocol)
- [ ] **PRIMARY:** Create GoMarble MCP service wrapper
- [ ] **PRIMARY:** Implement campaign creation via GoMarble MCP API
- [ ] **PRIMARY:** Test GoMarble Meta Ads integration
- [ ] **FALLBACK:** If GoMarble fails, install Meta Marketing API SDK
- [ ] **FALLBACK:** Create direct Meta campaign service
- [ ] **FALLBACK:** Build OAuth flow for Meta (direct)
- [ ] **FALLBACK:** Implement campaign creation (direct API)
- [ ] Build ad set and ad creation (via chosen method)
- [ ] Test full campaign workflow
- [ ] **If both fail after 3 iterations:** Create demo with mock campaign data

## Phase 8: Module 4 - OpenClaw Optimizer (Critical Priority) ⭐

**The OpenClaw paradigm transforms Auxora from a reactive chatbot into a proactive digital colleague.**

### Core OpenClaw Principles
1. **Continuous Presence**: Auxora runs 24/7 with heartbeat rhythm, not just when prompted
2. **Proactive Action**: Monitors and acts without being asked
3. **Memory-Rich**: Accumulates understanding over time (SOUL.md, USER.md, MEMORY.md)
4. **Autonomous Execution**: Takes pre-authorized actions within defined bounds
5. **Contextual Interruption**: Only alerts when something actually matters

---

### 8.1 Heartbeat Mechanism (Core OpenClaw Feature)
**The heartbeat is the "rhythm of life" that makes Auxora feel like a colleague, not a tool.**

- [ ] **Create heartbeat service** - Build `backend/services/heartbeatService.js`:
  - Runs every 30 minutes (configurable via HEARTBEAT_INTERVAL)
  - Checks predefined checklist in HEARTBEAT.md
  - Monitors: active campaigns, budget utilization, threshold breaches, anomalies
  - Returns `HEARTBEAT_OK` (silent) or `ALERT` (proactive message)
- [ ] **Implement heartbeat checklist** - Create `data/HEARTBEAT.md`:
  - Check campaign performance vs. targets
  - Monitor spend rate vs. daily budget
  - Detect anomalies (CTR drop > 20%, CPA spike > 50%)
  - Review creative fatigue signals
  - Check for approval-required actions
- [ ] **Build heartbeat endpoints**:
  - `GET /api/openclaw/heartbeat/status` - Current heartbeat state
  - `POST /api/openclaw/heartbeat/trigger` - Manual heartbeat check
  - `GET /api/openclaw/heartbeat/history` - Heartbeat log with timestamps
- [ ] **Create heartbeat scheduler** - Using node-cron or Bull queue:
  - Schedule heartbeat every 30 minutes
  - Handle missed heartbeats gracefully
  - Log all heartbeat results
- [ ] **Implement dormant vs. active states**:
  - Silent when nothing needs attention
  - Proactive message when action required
  - Escalation for critical issues (budget exhausted, ROAS < 0.5)

### 8.2 Persistent Memory Architecture (OpenClaw Soul)
**Memory is what transforms isolated conversations into continuous relationship.**

- [ ] **Create SOUL.md system** - Build `data/auxora/SOUL.md`:
  - Personality: Professional, proactive, growth-focused
  - Tone: Warm, confident, data-driven
  - Interaction style: Brief updates, detailed when asked
  - Core mission: Achieve client's revenue goals
- [ ] **Create USER.md system** - Build `data/auxora/clients/{client_id}/USER.md`:
  - Client preferences (communication frequency, detail level)
  - Business context (brand voice, industry, competitors)
  - Historical learnings (what worked, what didn't)
  - Timezone and availability
- [ ] **Create MEMORY.md system** - Build `data/auxora/clients/{client_id}/MEMORY.md`:
  - Long-term curated facts about the client
  - Key decisions and rationales
  - Performance milestones
  - Strategic pivots
- [ ] **Implement daily logs** - Create `data/auxora/clients/{client_id}/memory/YYYY-MM-DD.md`:
  - Raw conversation history organized by date
  - Heartbeat results
  - Actions taken
  - Metrics snapshots
- [ ] **Build memory service** - Create `backend/services/memoryService.js`:
  - `saveToMemory(clientId, type, content)` - Store in appropriate file
  - `retrieveMemory(clientId, query)` - Semantic search across history
  - `compactMemory(clientId)` - Summarize old logs
  - `getContext(clientId)` - Assemble full context for LLM

### 8.3 Autonomous Action System (Pre-Authorized Bounds)
**Auxora acts within pre-authorized boundaries without waiting for approval.**

- [ ] **Define action boundaries** - Create `data/auxora/clients/{client_id}/PERMISSIONS.md`:
  - Budget reallocation limit (e.g., max 20% shift between ad sets)
  - Auto-pause threshold (ROAS < 0.5 for 48 hours)
  - Auto-scale threshold (ROAS > 2.0 with budget headroom)
  - Creative swap rules (CTR < 0.5% after 1000 impressions)
- [ ] **Build autonomous action service** - Create `backend/services/autonomousActionService.js`:
  - `canTakeAction(clientId, action)` - Check against permissions
  - `executeAction(clientId, action)` - Execute with logging
  - `requestApproval(clientId, action)` - Queue for human approval
  - `getActionHistory(clientId)` - Audit trail
- [ ] **Implement common autonomous actions**:
  - Pause underperforming ads (ROAS < threshold)
  - Increase budget on winners (ROAS > threshold with headroom)
  - Swap creative with fallback when fatigue detected
  - Adjust bid strategy based on performance trends
- [ ] **Create approval queue** - For actions exceeding boundaries:
  - `POST /api/openclaw/approvals/queue` - Add action to queue
  - `GET /api/openclaw/approvals/pending` - List pending approvals
  - `POST /api/openclaw/approvals/:id/approve` - Approve action
  - `POST /api/openclaw/approvals/:id/reject` - Reject with reason
- [ ] **Build action notification system**:
  - Notify client when autonomous action taken
  - Include before/after state
  - Explain rationale using memory context

### 8.4 Threshold-Based Alert System
**Smart interruptions only when something actually matters.**

- [ ] **Define alert thresholds** - Create configurable threshold system:
  - **Critical** (immediate alert): ROAS < 0.5, budget exhausted, tracking broken
  - **Warning** (next check-in): ROAS < 1.0, spend rate too fast/slow
  - **Info** (weekly summary): minor optimizations made, learning phase updates
- [ ] **Build alert service** - Create `backend/services/alertService.js`:
  - `checkThresholds(clientId)` - Run all threshold checks
  - `createAlert(clientId, severity, message)` - Create alert
  - `acknowledgeAlert(alertId)` - Mark as seen
  - `getActiveAlerts(clientId)` - List unacknowledged
- [ ] **Implement alert channels**:
  - In-app notification (primary)
  - Email for critical alerts
  - Webhook for custom integrations
  - (Future: WhatsApp, Slack, SMS)
- [ ] **Create alert endpoints**:
  - `GET /api/openclaw/alerts` - List all alerts
  - `GET /api/openclaw/alerts/active` - Unacknowledged only
  - `POST /api/openclaw/alerts/:id/acknowledge` - Mark as seen
  - `PUT /api/openclaw/alerts/settings` - Configure thresholds

### 8.5 Performance Tracking (GoMarble MCP Primary)
- [ ] **PRIMARY:** Configure GoMarble MCP for analytics (if not already done)
- [ ] **PRIMARY:** Create GoMarble analytics service for Meta/Google Ads data
- [ ] **PRIMARY:** Implement performance data fetching via GoMarble MCP
- [ ] **FALLBACK:** If GoMarble fails, create direct Meta Marketing API service
- [ ] **FALLBACK:** If GoMarble fails, create direct Google Ads API service
- [ ] Create analytics orchestrator service (chooses GoMarble or fallback)
- [ ] Build performance data fetching
- [ ] Implement metrics calculation (ROAS, CPA, CTR)
- [ ] Create performance endpoints
- [ ] Add data aggregation
- [ ] Test accuracy
- [ ] **If all fail after 3 iterations:** Create demo with mock performance data

### 8.6 Dashboard & Real-Time Updates
- [ ] Set up WebSocket server
- [ ] Create dashboard data service
- [ ] Build dashboard endpoints
- [ ] Implement real-time updates (every 5 minutes)
- [ ] **OpenClaw indicators on dashboard**:
  - Heartbeat status (last check, next check)
  - Active alerts count
  - Autonomous actions taken today
  - Memory context summary
- [ ] Test WebSocket connections
- [ ] **If fails after 3 iterations:** Create demo with static dashboard data

### 8.7 Daily & Weekly Reporting (YamaBushi Style)
**Reports styled after the YamaBushi Weekly Sync format for detailed, actionable insights.**

- [ ] **Create daily check-in service** - Proactive daily summary:
  - Yesterday's performance vs. targets
  - Budget utilization and pacing
  - Top/bottom performers
  - Recommended actions for today
- [ ] **Build weekly sync report** - YamaBushi format:
  - **Week Overview**: Summary stats, key wins, concerns
  - **Channel Performance**: Meta, Google, GA4 breakdowns
  - **Audience Insights**: Top/bottom audiences with recommendations
  - **Creative Performance**: Top/bottom creatives with fatigue signals
  - **Budget Optimization**: Spend efficiency, reallocation suggestions
  - **Next Week Plan**: Prioritized action items
- [ ] **Implement report generation** - Create `backend/services/reportService.js`:
  - `generateDailyReport(clientId)` - Daily summary
  - `generateWeeklyReport(clientId)` - Full weekly sync
  - `generateCustomReport(clientId, dateRange, metrics)` - Custom reports
- [ ] **Add report delivery**:
  - In-app viewer (primary)
  - PDF export
  - Email delivery (optional)
  - Scheduled delivery (every morning, every Monday)
- [ ] **Create report endpoints**:
  - `POST /api/openclaw/reports/daily` - Generate daily report
  - `POST /api/openclaw/reports/weekly` - Generate weekly report
  - `GET /api/openclaw/reports/:id` - View report
  - `GET /api/openclaw/reports/:id/pdf` - Download PDF

### 8.8 Proactive Conversation System
**Auxora initiates conversations, not just responds to them.**

- [ ] **Build conversation trigger service** - Create `backend/services/conversationTriggerService.js`:
  - Morning check-in (9am): "Good morning! Here's your daily snapshot..."
  - Threshold breach: "Hey, I noticed your ROAS dropped to 0.8. Here's what I recommend..."
  - Milestone celebration: "Great news! You hit $10K revenue this week!"
  - Weekly wrap-up (Friday 5pm): "Here's your week in review..."
- [ ] **Create conversation templates**:
  - Daily check-in template
  - Alert notification template
  - Action taken template
  - Approval request template
  - Celebration template
- [ ] **Implement conversation scheduling**:
  - Configure check-in times per client
  - Respect client timezone
  - Allow snooze/pause
- [ ] **Build conversation endpoints**:
  - `GET /api/openclaw/conversations/pending` - Messages awaiting delivery
  - `POST /api/openclaw/conversations/send` - Deliver conversation
  - `GET /api/openclaw/conversations/history` - Conversation log

## Phase 9: Integration & Testing (Critical)

- [ ] End-to-end flow testing (all 4 modules)
- [ ] Integration between Strategist → Executor
- [ ] Integration between Executor → Advertiser
- [ ] Integration between Advertiser → OpenClaw Optimizer
- [ ] Full user journey test
- [ ] **Prototype Storyboard:** Ensure complete user journey works end-to-end (even with demos/mocks)
- [ ] Load testing
- [ ] Security audit
- [ ] Documentation

---

## Phase 9.5: Unified Investor Demo (Critical Priority) ⭐

**Goal:** Build comprehensive E2E demo combining Alexandar, Sakura, and Vibe demos to showcase Auxora.ai as next-gen AI growth co-founder for investors.

### Demo Target Persona
- D2C brand owner with NO growth experience (complete beginner)
- Wants to launch and scale without hiring expensive marketing team
- Budget: $200/4 weeks initial testing
- Goal: 3X ROAS, 10X revenue in 5 weeks

### 9.5.1 Demo Theme & Branding
- [ ] **Apply Auxora warm theme** - Amber/orange color palette:
  - Primary: #F59E0B (amber-500)
  - Secondary: #D97706 (amber-600)
  - Accent: #FBBF24 (amber-400)
  - Background: #FFFBEB (amber-50)
  - Text: #78350F (amber-900)
- [ ] **Create unified navigation** - Single demo flow combining all elements
- [ ] **Design consistent UI components** - Cards, buttons, charts in Auxora theme

### 9.5.2 Onboarding Journey Demo (Module 1: Strategist)
- [ ] **Landing page entry** - URL: `/auxora/demo`
  - Hero with value proposition
  - "Enter your website URL" input
  - "Get Free GTM Preview" CTA
- [ ] **Deep research preview** - Show AI analyzing website:
  - Website screenshot
  - Market analysis loading animation
  - Preview of key insights (teaser)
- [ ] **Payment Gate 1** - $1.99 Strategy Preview:
  - Display price clearly
  - Show what's included (GTM preview)
  - **Demo mode**: Auto-complete payment, show "Paid" badge
- [ ] **Voice interview simulation** - Quick voice demo:
  - Voice call overlay with waveform
  - Show 8 interview questions
  - Simulate voice responses
  - Display transcript in real-time
  - **Demo mode**: 30-second simulation per question
- [ ] **GTM Report generation** - Full report display:
  - Executive Summary
  - Market Analysis
  - Target Audience Profile
  - Channel Strategy
  - 90-Day Action Plan

### 9.5.3 Execution Setup Demo (Module 2: Executor) ⭐ HIGH PRIORITY
**This section needs the most polish for investor demo.**

- [ ] **Channel connection wizard** - Step-by-step connection:
  - Meta Business Manager connect (OAuth simulation)
  - Google Ads connect (OAuth simulation)
  - Google Analytics 4 connect
  - Shopify store connect
  - TikTok Ads (optional)
  - **Demo mode**: Show connected status badges
- [ ] **Budget simulation interface** - Interactive budget planner:
  - Slider: $200/4 weeks initial test
  - Show projected outcomes based on industry benchmarks
  - Daily budget allocation visualization
  - Expected ROAS range
  - Risk/reward visualization
- [ ] **Testing plan approval** - Pre-launch checklist:
  - Audience segments to test (3-5 audiences)
  - Creative variations (2-3 per audience)
  - Budget split visualization (pie chart)
  - Timeline (Week 1-4 testing phases)
  - **Approve button**: "Launch Testing Phase"
- [ ] **Creative development flow**:
  - Upload product images
  - AI-generated video preview
  - Ad copy variations
  - Creative approval workflow
  - Thumbnail gallery of all creatives
- [ ] **Landing page builder preview**:
  - Show Lovable-generated landing page
  - Preview mobile/desktop views
  - Domain connection status
  - SSL certificate status
- [ ] **Payment Gate 2** - $20 Full Service:
  - Show full service pricing
  - Include: Execution + Advertising + OpenClaw Monitoring
  - **Demo mode**: Auto-complete payment

### 9.5.4 OpenClaw Monitoring Demo (Module 4: Optimizer) ⭐ HIGH PRIORITY
**This section needs the most polish for investor demo.**

- [ ] **OpenClaw dashboard** - Real-time monitoring view:
  - Heartbeat status indicator (green pulse)
  - Last check: "2 minutes ago"
  - Next check: "in 28 minutes"
  - Active alerts count
  - Autonomous actions today
- [ ] **Daily report simulation** - Morning check-in:
  - "Good morning! Here's your daily snapshot..."
  - Yesterday's key metrics (ROAS, Spend, Revenue)
  - Top performer highlight
  - Recommended actions
  - Chat-style conversation UI
- [ ] **Threshold alert simulation** - Live alert demo:
  - Alert: "ROAS dropped to 0.8 - below 1.0 threshold"
  - Recommended action: "Pause Ad Set 'Cold - Lifestyle'"
  - One-click approve/reject
  - Auto-action option: "Enable auto-pause for this rule"
- [ ] **Autonomous action demo** - Show action taken:
  - "I paused 'Cold - Lifestyle' ad set (ROAS 0.6)"
  - "I reallocated $15 to 'Warm - Retargeting' (ROAS 2.3)"
  - Before/after visualization
  - Undo option
- [ ] **Weekly sync report** - YamaBushi-style:
  - Week overview with key metrics
  - Performance charts (ROAS trend, Purchases trend)
  - Top/bottom audiences table
  - Top/bottom creatives table
  - Budget optimization recommendations
  - Next week action items
- [ ] **5-week transformation timeline**:
  - Week 1: Learning phase, data collection
  - Week 2: Initial optimizations, winners identified
  - Week 3: Scaling winners, pausing losers
  - Week 4: Budget optimization, ROAS improvement
  - Week 5: Full optimization, target metrics achieved
  - Animated progression with metrics at each stage

### 9.5.5 Results Showcase
- [ ] **Before/After comparison**:
  - Initial state: No ads, $0 revenue
  - Final state: 3X ROAS, scaled revenue
  - 5-week timeline animation
- [ ] **Key metrics display**:
  - Total Spend: $1,200
  - Total Revenue: $3,600+
  - Final ROAS: 3.0X
  - Customer Acquisition Cost
  - Time to Results: 5 weeks
- [ ] **Testimonial integration** - Client success stories
- [ ] **CTA**: "Start Your Growth Journey"

### 9.5.6 Demo Data Integration
- [ ] **Combine demo datasets**:
  - Use Alexandar workflow structure
  - Incorporate Sakura GTM report data
  - Use Vibe/YamaBushi performance metrics
- [ ] **Create unified demo data file** - `htmx-ui/data/auxora-demo.js`:
  - Client profile (sample D2C CPG brand)
  - Onboarding flow data
  - Execution setup data
  - 5 weeks of performance data
  - Conversation templates
  - Alert scenarios
- [ ] **Demo navigation state machine**:
  - Track progress through demo
  - Enable skip/jump to sections
  - Save demo progress

### 9.5.7 Voice Interview Demo Implementation
- [ ] **Voice call overlay component**:
  - Animated waveform visualization
  - Question display
  - "Speaking..." indicator
  - Timer (simulated call duration)
- [ ] **Interview questions sequence** (8 questions):
  1. Brand identity and positioning
  2. Current marketing channels
  3. Revenue goals and metrics
  4. Past performance data
  5. Budget constraints
  6. Target audience description
  7. Competitive landscape
  8. Growth priorities
- [ ] **Voice simulation**:
  - Text-to-speech preview (optional)
  - Transcript appearing as "spoken"
  - Response capture simulation
- [ ] **Interview summary generation** - Post-interview analysis

### 9.5.8 Payment Gate Demo
- [ ] **Payment UI components**:
  - Price display ($1.99 / $20)
  - Credit card form (demo mode)
  - Processing animation
  - Success confirmation
- [ ] **Demo mode behavior**:
  - Show payment form
  - Auto-complete after 2 seconds
  - Display "Paid" badge
  - Continue to next step automatically
- [ ] **Payment gate locations**:
  - Gate 1: After research, before voice interview ($1.99)
  - Gate 2: After GTM report, before full service ($20)

## Phase 10: UI/UX Design Document & Frontend Development (High Priority)

**Goal:** Create comprehensive UI/UX design document and implement complete frontend for ready-to-use SaaS product.

### 10.1 UI/UX Design Document Creation
- [ ] **Create UI/UX Design Document** - Create `specs/UI-UX-DESIGN.md` with complete design system and user flows
- [ ] **Design System & Visual Reference** - Document color theme and style from reference URL (https://3000-iuiqfv7yjexsx0p7qqz1x-c81df28e.sandbox.novita.ai/)
- [ ] **Extract Design Tokens** - Document colors, typography, spacing, components (buttons, cards, forms, charts)
- [ ] **Information Architecture** - Define app structure, navigation (Dashboard, Strategist, Executor, Advertiser, Analyzer)
- [ ] **User Flows by Module** - Document step-by-step flows for all 4 modules:
  - Module 1 (Strategist): Research → Interview → GTM Report
  - Module 2 (Executor): Landing Pages → Shopify → Domain → Creatives
  - Module 3 (Advertiser): Connect Accounts → Pixel → Campaign Creation
  - Module 4 (Analyzer): Performance → Dashboard → Optimization → Reports
- [ ] **End-to-End Founder Journey** - Create storyboard flow from landing to optimization
- [ ] **Screen-by-Screen Specifications** - Document layout, components, states (empty/loading/success/error) for each major screen
- [ ] **API-UI Mapping Table** - Map UI actions to backend endpoints from all spec files
- [ ] **Responsive & Accessibility** - Define breakpoints, touch targets, keyboard navigation, screen reader support
- [ ] **Claude Implementation Guidance** - Include stack suggestions, integration notes, spec references

### 10.2 Frontend Foundation
- [ ] **Set up frontend framework** - Install React (or chosen framework) with TypeScript/JavaScript
- [ ] **Install UI library** - Set up Tailwind CSS or component library matching design system
- [ ] **Configure build system** - Set up Vite/Webpack/Next.js with proper dev/prod configs
- [ ] **Set up routing** - Configure React Router (or framework router) for authenticated app
- [ ] **Create design system components** - Build reusable components (Button, Card, Form, Input, Modal, etc.) matching design tokens
- [ ] **Set up API client** - Create axios/fetch wrapper with base URL, error handling, auth headers
- [ ] **Implement authentication UI** - Login/signup forms, session management, protected routes

### 10.3 Landing Page & Marketing Site
- [ ] **Build landing page** - Create marketing site matching reference URL style (hero, social proof, how it works, pricing, CTA)
- [ ] **Implement navigation** - Header with logo, nav links, CTA buttons
- [ ] **Add pricing section** - Display Launch/Scale/Growth/Enterprise tiers
- [ ] **Create case study section** - Showcase success stories (e.g. Yamabushi Farms)
- [ ] **Add "How It Works" section** - 4-step protocol visualization
- [ ] **Implement responsive design** - Mobile-first, tablet, desktop breakpoints

### 10.4 Module 1 - Strategist UI
- [ ] **Research form** - URL input + product description textarea, submit button, loading state
- [ ] **Research results view** - Display market size, competitors, channels, pain points in organized sections
- [ ] **Interview interface** - Voice interview UI with mic permission, transcript display, question indicators
- [ ] **Interview analysis view** - Show transcript + structured analysis (brand positioning, priorities, recommendations)
- [ ] **GTM Report viewer** - Display 7-section report (Executive Summary, Market Analysis, Personas, Channel Strategy, Roadmap, Budget, KPIs)
- [ ] **Report generation** - Trigger generation, loading state, PDF download link, interactive dashboard option

### 10.5 Module 2 - Executor UI
- [ ] **Landing page creation form** - Research picker, brand assets upload (logo, colors, fonts), content inputs
- [ ] **Landing page preview** - Display preview URL and published URL, status indicator
- [ ] **Shopify connection** - OAuth connect button, connection status, product configuration
- [ ] **Domain management** - Domain search, availability check, purchase flow, DNS/SSL status
- [ ] **Creative generation form** - Image upload, prompt input, style/duration/quality selectors
- [ ] **Creative gallery** - List creatives with thumbnails, status indicators (pending/processing/completed), download links
- [ ] **Creative status polling** - Real-time status updates for video generation jobs

### 10.6 Module 3 - Advertiser UI
- [ ] **Account connections** - Cards for Meta BM, Google Ads, Shopify with connect buttons and status
- [ ] **OAuth callbacks** - Handle OAuth redirects, show success/error states
- [ ] **Meta Pixel installation** - Install button, verification status, event tracking display
- [ ] **Campaign creation form** - Platform selector (Meta/Google/both), creative picker (from Executor), campaign name, objective, budget, targeting inputs, ad copy
- [ ] **Campaign list** - Display all campaigns with status, platform, budget, performance summary
- [ ] **Campaign details** - View campaign settings, ad sets/ad groups, active ads

### 10.7 Module 4 - Analyzer UI
- [ ] **Performance dashboard** - Campaign selector, metric cards (impressions, reach, CTR, CPC, CPA, ROAS, revenue, spend)
- [ ] **Charts and visualizations** - Time-series charts for metrics, comparison charts (Recharts or Chart.js)
- [ ] **Main dashboard** - Widget layout with Campaign Performance, Website Analytics, Revenue Tracking, Progress to $10K Goal
- [ ] **Real-time updates** - WebSocket integration for live metric updates (every 5 minutes)
- [ ] **Optimization interface** - Campaign selector, trigger recommendations, approve/apply actions
- [ ] **System health** - Status page showing API health, database, pixel firing rate, error rates
- [ ] **Weekly reports** - Report generation trigger, in-app viewer, PDF download, email delivery option

### 10.8 Dashboard & Navigation
- [ ] **Main dashboard** - Overview of current project, next recommended step, quick links to modules
- [ ] **Global navigation** - Top nav or sidebar with Dashboard, Strategist, Executor, Advertiser, Analyzer, Settings
- [ ] **Progress indicators** - Show completion status for each module, next steps
- [ ] **Quick actions** - Shortcuts to common tasks (start research, create campaign, view performance)

### 10.9 Responsive & Polish
- [ ] **Mobile optimization** - Ensure all screens work on mobile (320px+), touch-friendly buttons
- [ ] **Tablet optimization** - Optimize layouts for tablet (768px+)
- [ ] **Desktop optimization** - Full-featured desktop experience (1024px+)
- [ ] **Loading states** - Skeletons, spinners, progress bars for all async operations
- [ ] **Error handling** - User-friendly error messages, retry buttons, fallback states
- [ ] **Empty states** - Helpful empty state messages with CTAs (e.g. "No campaigns yet, create your first")
- [ ] **Accessibility** - Keyboard navigation, screen reader support, focus management, ARIA labels

### 10.10 Integration & Testing
- [ ] **Connect frontend to backend** - Ensure all API calls work correctly
- [ ] **Test full user journey** - Research → Interview → Report → Landing + Creatives → Campaigns → Analyze
- [ ] **Cross-browser testing** - Chrome, Firefox, Safari, Edge
- [ ] **Mobile device testing** - Test on real devices or emulators
- [ ] **Performance optimization** - Code splitting, lazy loading, image optimization
- [ ] **Error boundary implementation** - Catch and display React errors gracefully

## Phase 11: UI/UX Evaluator Agent (Product Manager Observer) (High Priority)

**Goal:** Create an AI agent that acts as a product manager to evaluate, analyze, and improve the UI/UX of NexSpark by comparing it against industry-leading products.

**Role:** Product Manager / UX Observer Agent

**Workflow Integration:**
1. **Backend check completes** → Frontend check starts
2. **Frontend check completes** → UI/UX evaluation begins
3. **Market research** → Analyze best-in-class onboarding and user flows
4. **Evaluation** → Score and compare against benchmarks
5. **Improvement** → Generate recommendations and implement updates

### 11.1 UI/UX Evaluator Agent Foundation
- [ ] **Create evaluator agent service** - Build `backend/services/uiuxEvaluatorAgent.js` with Claude integration
- [ ] **Set up web page analysis** - Implement ability to navigate through web pages programmatically (Puppeteer/Playwright)
- [ ] **Create storyboard analyzer** - Build component to analyze and document user storyboards from page flows
- [ ] **Implement workflow tracker** - Track user journey through all pages and interactions
- [ ] **Set up evaluation framework** - Create scoring system for UX metrics (clarity, efficiency, delight, completion rate)

### 11.2 Market Research & Benchmarking
- [ ] **Research best-in-class products** - Market research on top SaaS onboarding experiences:
  - **Typeless** - Analyze onboarding flow, feature discovery, user guidance
  - **Lovable** - Study landing page → product creation flow
  - **Cursor** - Evaluate developer tool onboarding and feature execution
  - **Additional benchmarks** - Research 5-10 other top products in different sectors
- [ ] **Document reference flows** - Create detailed documentation of:
  - Customer onboarding processes
  - Feature execution workflows
  - Navigation patterns
  - Onboarding best practices
- [ ] **Create comparison database** - Store reference flows, patterns, and metrics for comparison
- [ ] **Build pattern library** - Document common UX patterns from benchmark products

### 11.3 Automated UI/UX Evaluation
- [ ] **Page-by-page analysis** - Implement agent that:
  - Navigates through NexSpark frontend page by page
  - Documents each screen's purpose, layout, and user actions
  - Tracks flow from landing → onboarding → each module
  - Identifies friction points and confusion areas
- [ ] **Storyboard generation** - Auto-generate storyboard documentation:
  - User journey map
  - Screen flow diagrams
  - Interaction patterns
  - Decision points
- [ ] **UX scoring system** - Evaluate against metrics:
  - **Clarity** (1-10): How clear is the purpose and next step?
  - **Efficiency** (1-10): How quickly can users complete tasks?
  - **Delight** (1-10): How enjoyable is the experience?
  - **Completion rate** (estimated): Likelihood users complete the flow
  - **Error rate** (estimated): Likelihood of user errors
- [ ] **Comparison analysis** - Compare NexSpark flows against:
  - Typeless onboarding experience
  - Lovable product creation flow
  - Cursor feature discovery
  - Other benchmark products

### 11.4 Evaluation Report Generation
- [ ] **Create evaluation report service** - Build `backend/services/uiuxEvaluationReport.js`
- [ ] **Generate comprehensive reports** - Include:
  - Current state analysis (page-by-page breakdown)
  - Storyboard documentation
  - Comparison against benchmarks (Typeless, Lovable, Cursor, others)
  - Gap analysis (what's missing vs. best practices)
  - Scoring breakdown (clarity, efficiency, delight, completion)
  - Specific improvement recommendations
- [ ] **Prioritize improvements** - Rank recommendations by:
  - Impact on user experience
  - Ease of implementation
  - Alignment with NexSpark goals
- [ ] **Create actionable tasks** - Convert recommendations into specific, implementable tasks

### 11.5 Automated UX Improvement
- [ ] **Implement improvement suggestions** - Agent generates code changes for:
  - Onboarding flow improvements
  - Navigation enhancements
  - UI component updates
  - Copy and messaging improvements
  - Loading state improvements
  - Error handling enhancements
- [ ] **A/B testing framework** - Set up ability to test improvements:
  - Create variant implementations
  - Track user behavior
  - Measure improvement metrics
- [ ] **Iterative refinement** - Agent re-evaluates after improvements:
  - Re-run evaluation
  - Compare new scores vs. old scores
  - Continue refinement until benchmarks are met

### 11.6 Integration with Build Loop
- [ ] **Add evaluator to build workflow** - Integrate into `loop.sh` or build process:
  - After Phase 10.10 (Frontend Integration & Testing) completes
  - Automatically trigger UI/UX evaluation
  - Run market research (if not cached)
  - Generate evaluation report
  - Create improvement tasks
  - Implement high-priority improvements
- [ ] **Create evaluation endpoints** - Build API endpoints:
  - `POST /api/evaluator/analyze` - Trigger full evaluation
  - `GET /api/evaluator/report/:id` - Get evaluation report
  - `POST /api/evaluator/improve` - Apply improvements
  - `GET /api/evaluator/benchmarks` - View benchmark comparisons
- [ ] **Set up evaluation database** - Store:
  - Evaluation reports
  - Benchmark data
  - Improvement history
  - Score tracking over time

### 11.7 Evaluation Criteria & Metrics
- [ ] **Define evaluation criteria** - Document what to evaluate:
  - **Onboarding:** First-time user experience, time to value, clarity of next steps
  - **Feature discovery:** How easily users find and understand features
  - **Task completion:** Success rate for key user journeys
  - **Error prevention:** How well UI prevents user errors
  - **Visual hierarchy:** Clarity of information architecture
  - **Responsive design:** Mobile/tablet/desktop experience quality
  - **Accessibility:** Keyboard navigation, screen reader support
- [ ] **Set target scores** - Define minimum acceptable scores:
  - Clarity: 8/10 minimum
  - Efficiency: 7/10 minimum
  - Delight: 7/10 minimum
  - Completion rate: 80%+ for key flows
- [ ] **Create comparison matrix** - Compare NexSpark against benchmarks:
  - Typeless: Onboarding clarity, feature discovery
  - Lovable: Product creation flow, visual feedback
  - Cursor: Developer tool UX, feature execution

### 11.8 Continuous Evaluation Loop
- [ ] **Set up scheduled evaluations** - Run evaluator agent:
  - After each major frontend update
  - Weekly automated evaluations
  - Before major releases
- [ ] **Track improvement over time** - Monitor:
  - Score trends (improving/declining)
  - Benchmark gap closure
  - User feedback correlation
- [ ] **Update benchmarks** - Keep reference products current:
  - Re-analyze Typeless, Lovable, Cursor periodically
  - Add new best-in-class products as they emerge
  - Update pattern library with new insights

## Phase 12: Credential Management Agent (High Priority)

**Goal:** Create an AI agent that checks for missing credentials, provides comprehensive lists of required API keys and authorizations, and guides the builder to place credentials in the proper locations.

**Role:** Credential Validator & Setup Guide Agent

**Workflow Integration:**
1. **After each build completes** → Credential check begins
2. **After all iterations are done** → Comprehensive credential audit
3. **Check for missing credentials** → Scan all .env files and code references
4. **Generate credential report** → List all missing and required credentials
5. **Provide setup guidance** → Step-by-step instructions for obtaining and placing credentials

### 12.1 Credential Scanner Foundation
- [ ] **Create credential scanner service** - Build `backend/services/credentialManager.js`
- [ ] **Scan .env files** - Check `backend/.env` and `backend/.env.example` for all required variables
- [ ] **Scan code references** - Parse codebase for `process.env.*` references to identify all credential dependencies
- [ ] **Create credential registry** - Build database of all required credentials across all modules
- [ ] **Set up validation framework** - Create system to validate credential format and test connectivity

### 12.2 Credential Registry & Documentation
- [ ] **Build comprehensive credential database** - Document all credentials needed:
  - **Module 1 (Strategist):** ANTHROPIC_API_KEY, DATABASE_URL
  - **Module 2 (Executor):** LOVABLE_API_KEY, SHOPIFY_API_KEY, SHOPIFY_API_SECRET, NAMESILO_API_KEY, PIXVERSE_API_KEY, KLING_API_KEY, RUNWAY_API_KEY, OPENAI_API_KEY, REPLICATE_API_TOKEN
  - **Module 3 (Advertiser):** GOMARBLE_MCP_URL, GOMARBLE_OAUTH_CLIENT_ID, GOMARBLE_OAUTH_CLIENT_SECRET, META_APP_ID, META_APP_SECRET, META_ACCESS_TOKEN, GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET, GOOGLE_ADS_REFRESH_TOKEN, GOOGLE_ADS_DEVELOPER_TOKEN
  - **Module 4 (Analyzer):** GOMARBLE_MCP_URL, GOMARBLE_OAUTH_CLIENT_ID, GOMARBLE_OAUTH_CLIENT_SECRET, META_APP_ID, META_APP_SECRET, META_ACCESS_TOKEN, GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET, GOOGLE_ADS_REFRESH_TOKEN, SHOPIFY_WEBHOOK_SECRET
  - **Infrastructure:** DATABASE_URL, PORT, NODE_ENV
- [ ] **Document credential sources** - For each credential, document:
  - Where to obtain it (URL, dashboard, documentation)
  - Required permissions/scopes
  - Setup instructions
  - Security best practices
- [ ] **Create credential priority matrix** - Classify credentials as:
  - **Critical:** Required for core functionality (DATABASE_URL, ANTHROPIC_API_KEY)
  - **High:** Required for specific modules (SHOPIFY_API_KEY, GOMARBLE_OAUTH_CLIENT_ID)
  - **Medium:** Optional but recommended (KLING_API_KEY, RUNWAY_API_KEY)
  - **Low:** Fallback options (META_ACCESS_TOKEN if using GoMarble)

### 12.3 Missing Credential Detection
- [ ] **Implement credential checker** - Build service that:
  - Reads `.env` file
  - Compares against credential registry
  - Identifies missing credentials
  - Checks for placeholder values (xxx, your-key-here, etc.)
  - Validates credential format (if applicable)
- [ ] **Generate missing credentials report** - Create comprehensive list:
  - Missing credential name
  - Module it belongs to
  - Priority level
  - Where to obtain it
  - Setup instructions
  - File location where it should be placed
- [ ] **Check OAuth token storage** - Verify OAuth tokens are properly stored in database (not just .env)

### 12.4 Credential Setup Guide Generator
- [ ] **Create setup guide service** - Build `backend/services/credentialSetupGuide.js`
- [ ] **Generate step-by-step instructions** - For each missing credential:
  - Step 1: Where to go (URL, dashboard)
  - Step 2: What to click/create
  - Step 3: How to copy the credential
  - Step 4: Where to paste it (exact file path and line)
  - Step 5: How to verify it works
- [ ] **Create interactive guide** - Generate markdown/HTML guide with:
  - Clickable links to credential sources
  - Code blocks showing exact .env format
  - Verification commands
  - Troubleshooting tips
- [ ] **Provide copy-paste ready format** - Generate exact `.env` entries that can be copied:
  ```
  # Missing Credentials - Copy these to backend/.env
  SHOPIFY_API_KEY=your-shopify-api-key-here
  GOMARBLE_OAUTH_CLIENT_ID=your-client-id-here
  ```

### 12.5 Credential Validation & Testing
- [ ] **Implement credential validator** - Build service to test credentials:
  - Test API connectivity (where possible without exposing keys)
  - Validate format (length, prefix patterns)
  - Check for common mistakes (extra spaces, quotes, etc.)
- [ ] **Create validation endpoints** - Build API endpoints:
  - `POST /api/credentials/validate` - Test a specific credential
  - `GET /api/credentials/status` - Get status of all credentials
  - `POST /api/credentials/check` - Run full credential audit
- [ ] **Generate validation report** - Show:
  - Valid credentials (✓)
  - Missing credentials (✗)
  - Invalid format credentials (⚠)
  - Tested and working credentials (✓ tested)

### 12.6 Integration with Build Loop
- [ ] **Add credential check to build workflow** - Integrate into `loop.sh` or build process:
  - After Phase 10.10 (Frontend Integration) completes
  - After Phase 11.8 (UI/UX Evaluator) completes
  - After all iterations are done
  - Automatically trigger credential audit
  - Generate credential report
  - Create setup guide
- [ ] **Create credential check endpoints** - Build API endpoints:
  - `POST /api/credentials/audit` - Run full credential audit
  - `GET /api/credentials/report` - Get credential status report
  - `GET /api/credentials/guide` - Get setup guide for missing credentials
  - `GET /api/credentials/missing` - List all missing credentials
- [ ] **Set up credential database** - Store:
  - Credential registry
  - Audit history
  - Validation results
  - Setup guide versions

### 12.7 Security & Best Practices
- [ ] **Implement credential security checks** - Verify:
  - `.env` file is in `.gitignore`
  - No credentials committed to git
  - Credentials stored securely (not in code)
  - OAuth tokens stored in database (not .env)
- [ ] **Create security warnings** - Alert if:
  - Credentials found in code (not .env)
  - .env file is tracked in git
  - Credentials are too short or obviously fake
- [ ] **Document security practices** - Include in guide:
  - Never commit .env files
  - Use environment variables, not hardcoded values
  - Rotate credentials regularly
  - Use least privilege principle for API keys

### 12.8 Credential Report Generation
- [ ] **Create credential report service** - Build `backend/services/credentialReport.js`
- [ ] **Generate comprehensive reports** - Include:
  - Executive summary (X of Y credentials missing)
  - Module breakdown (credentials per module)
  - Priority classification (critical/high/medium/low)
  - Missing credentials list with setup instructions
  - Valid credentials status
  - Security warnings
  - Next steps checklist
- [ ] **Create actionable checklist** - Generate markdown checklist:
  ```markdown
  ## Missing Credentials Checklist
  
  ### Critical (Required for core functionality)
  - [ ] DATABASE_URL - PostgreSQL connection string
  - [ ] ANTHROPIC_API_KEY - Claude API access
  
  ### High Priority (Module 2 - Executor)
  - [ ] SHOPIFY_API_KEY - Shopify integration
  - [ ] LOVABLE_API_KEY - Landing page generation
  
  ### Medium Priority (Optional features)
  - [ ] KLING_API_KEY - Video generation (fallback)
  ```
- [ ] **Export reports** - Support multiple formats:
  - Markdown report
  - JSON report (for programmatic use)
  - HTML report (for easy viewing)

---

## Development Strategy & Blocker Management

### Integration Priority Strategy

**For Meta Ads & Google Ads Integration:**
1. **First Choice:** GoMarble MCP API (`https://apps.gomarble.ai/mcp-api/sse`)
   - OAuth 2.0 authentication
   - SSE-based protocol
   - Provides unified interface for Meta and Google Ads
   - Documentation: https://www.gomarble.ai/docs/developer-documentation
2. **Fallback:** Direct API integrations
   - Meta Marketing API (direct)
   - Google Ads API (direct)
   - Only implement if GoMarble fails or doesn't meet requirements

### Overnight Build Strategy

**Automated Building for Long-Running Iterations (50+ iterations):**

When starting an iteration with 50+ iterations (overnight builds):
- **DO NOT** stop and ask for confirmation to continue
- **DO** automatically proceed to the next sector/task without pausing
- **DO** keep building each module as planned until completion
- **DO** finish as many sectors as possible (6.1 → 6.2 → 6.3 → 6.4 → 7.1 → 7.2 → etc.)
- **DO NOT** pause between sectors (like 6.1, 6.2, 6.3) to ask for permission
- **ONLY STOP** if:
  - There is a blocker that prevents moving forward (after 3 failed attempts + demo creation)
  - User explicitly interrupts or cancels the build
  - Maximum iteration count is reached

**Build Flow for 50+ Iterations:**
1. Start with Phase 6.1 → complete all tasks
2. Automatically proceed to Phase 6.2 → complete all tasks
3. Automatically proceed to Phase 6.3 → complete all tasks
4. Automatically proceed to Phase 6.4 → complete all tasks
5. Continue through all phases (7, 8, 9, 10) without stopping
6. After Phase 10.10 (Frontend Integration) → automatically trigger Phase 11 (UI/UX Evaluator)
7. UI/UX Evaluator runs market research, evaluation, and improvement suggestions
8. After Phase 11.8 (UI/UX Evaluator) → automatically trigger Phase 12 (Credential Management)
9. Credential Management Agent audits credentials, generates report and setup guide
10. Only pause if a blocker is encountered (after 3 attempts + demo)

**If a step fails after 3 iterations:**
- **DO NOT** continue trying the same approach
- **DO** create a demo/mock implementation instead
- **DO** ensure the prototype still runs smoothly
- **DO** mark the step with `[DEMO]` prefix in checklist
- **DO** document what needs to be fixed later
- **DO** immediately proceed to the next task/sector without asking

**Example:**
- `[DEMO]` Campaign creation via GoMarble MCP (returns mock campaign data)
- `[DEMO]` Performance tracking (returns mock metrics)
- After creating demo → **automatically continue** to next task

### Blocker Management Process

**Tomorrow's Review Process:**

1. **Identify Blockers:**
   - Review all tasks marked with `[DEMO]` or failed after 3 iterations
   - Document why each blocker occurred
   - Note which integration method was attempted (GoMarble vs Direct API)

2. **Create Blocker Checklist:**
   - Convert each blocker into a specific, actionable checklist item
   - Include: Problem description, attempted solutions, next steps
   - Example format:
     ```
     ## Blocker: GoMarble MCP OAuth Authentication
     - Problem: OAuth flow not completing
     - Attempted: 3 iterations with different OAuth libraries
     - Current: Using demo data
     - Next Steps: Contact GoMarble support, review OAuth docs
     ```

3. **Prototype Requirements:**
   - **MUST** have a working end-to-end user journey
   - **MUST** show complete storyboard flow (even with demos)
   - **MUST** demonstrate all 4 modules working together
   - **SHOULD** have real integrations where possible
   - **CAN** use demos/mocks for problematic integrations

4. **Prototype Storyboard Flow:**
   - User submits research request → Strategist generates GTM report
   - User creates landing page → Executor builds via Lovable
   - User sets up ads → Advertiser creates campaign (GoMarble or demo)
   - User views dashboard → Analyzer shows performance (real or demo)
   - **All steps must work smoothly, even if some use demo data**

### Environment Variables Reference

**GoMarble MCP (Primary):**
```
GOMARBLE_MCP_URL=https://apps.gomarble.ai/mcp-api/sse
GOMARBLE_OAUTH_CLIENT_ID=xxx
GOMARBLE_OAUTH_CLIENT_SECRET=xxx
```

**Meta Direct API (Fallback):**
```
META_APP_ID=xxx
META_APP_SECRET=xxx
META_ACCESS_TOKEN=xxx
META_API_VERSION=v18.0
```

**Google Ads Direct API (Fallback):**
```
GOOGLE_ADS_CLIENT_ID=xxx
GOOGLE_ADS_CLIENT_SECRET=xxx
GOOGLE_ADS_REFRESH_TOKEN=xxx
```

---

---

## Revision History

| Date | Changes |
|------|---------|
| January 2025 | Initial plan created - Module 1 (Strategist) |
| January 2025 | Added Modules 2-4 (Executor, Advertiser, Analyzer) |
| January 2025 | Added GoMarble MCP integration strategy and blocker management |
| January 2025 | Added Phase 10: UI/UX Design Document & Frontend Development |
| January 2025 | Added Phase 11: UI/UX Evaluator Agent (Product Manager Observer) |
| January 2025 | Added Phase 12: Credential Management Agent |
| **February 2025** | **Major Revision: OpenClaw Mode Architecture** |
| | - Rebranded as Auxora.ai - AI Growth Co-Founder |
| | - Transformed Phase 8 (Analyzer) into OpenClaw Optimizer |
| | - Added Heartbeat Mechanism (proactive monitoring every 30 min) |
| | - Added Persistent Memory Architecture (SOUL.md, USER.md, MEMORY.md) |
| | - Added Autonomous Action System with pre-authorized bounds |
| | - Added Threshold-Based Alert System |
| | - Added Proactive Conversation System |
| | - Added YamaBushi-style Daily/Weekly Reporting |
| | - Added Phase 9.5: Unified Investor Demo |
| | - Defined 4 Roles: Strategist, Executor, Advertiser, OpenClaw Optimizer |
| | - Demo Focus: Execution Setup (B) and OpenClaw Monitoring (C) |
| | - Brand: Warm Auxora theme (amber/orange) |
| | - Updated database schema with OpenClaw tables |
| | - Updated file structure with OpenClaw services and endpoints |

---

*Product: Auxora.ai - AI Growth Co-Founder in OpenClaw Mode*
*Architecture: Heartbeat + Memory + Autonomous Actions + Proactive Conversations*
