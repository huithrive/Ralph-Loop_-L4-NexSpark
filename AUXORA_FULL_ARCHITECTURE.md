# Auxora Full Module Architecture

**Version:** 1.0  
**Last Updated:** February 24, 2026  
**Authors:** Integration Team  
**Purpose:** Unified architecture document merging Ralph Loop (Node.js) and Yuhong's Research Module (Python)

---

## Executive Summary

This document defines the complete Auxora platform architecture by merging two codebases:
- **Ralph Loop (Node.js)**: OpenClaw nervous system, Advertiser (GoMarble MCP), Analyzer, Executor
- **Yuhong's Research Module (Python)**: Router/Specialist architecture, Interview system, Business Research, GTM Report generation

**Key Integration Goal:** Port Yuhong's Research module to Node.js and integrate it as the **Strategist** module within our existing OpenClaw-powered platform.

---

## 1. Complete Module Map

| Module | Source | Status | Key Capabilities | Tech Stack |
|--------|--------|--------|------------------|------------|
| **Strategist** | Yuhong (research module) | 🟡 Complete (Python) → **Needs porting** | • 6-question interview system<br>• Website scraping & profile extraction<br>• Business research w/ SimilarWeb<br>• 876-line GTM prompt → comprehensive report<br>• LLM-based intent routing<br>• Milestone-driven workflow | Python: FastAPI, SQLAlchemy, pydantic-ai, Jinja2 |
| **Executor** | Ralph Loop | 🟢 Partial | • Shopify store setup<br>• Landing page deployment (Lovable)<br>• Creative generation (Pixverse)<br>• Domain management<br>• **Missing**: Full integration with Strategist output | Node.js: Express, PostgreSQL |
| **Advertiser** | Ralph Loop | 🟢 Partial | • GoMarble MCP integration (Meta + Google)<br>• Campaign creation & management<br>• Pixel installation<br>• Budget control<br>• **Missing**: Auto-launch from GTM Report | Node.js: Express, GoMarble MCP API |
| **Analyzer** | Ralph Loop | 🟢 Complete | • Real-time analytics dashboard<br>• Multi-platform data aggregation<br>• Optimizer engine (rule-based)<br>• Report generation<br>• Performance monitoring | Node.js: Express, PostgreSQL |
| **OpenClaw** | Ralph Loop | 🟢 Complete | • Heartbeat loop (30-min cycles)<br>• Memory service (agent context)<br>• Trust system (auto/manual routing)<br>• Action card factory<br>• Notification service (email, WhatsApp, in-app)<br>• Permission service | Node.js: Express, PostgreSQL |

---

## 2. Integration Plan: Python → Node.js Port

### 2.1 Interview System

**Source Files (Python):**
- `server/core/onboarding.py` — 6 interview questions with suggestions
- `server/modules/research/tools.py` — `save_answer()`, `complete_interview()`

**Target Files (Node.js):**
```
backend/services/strategist/
├── interviewService.js       # Core interview logic
├── questions.js               # Interview questions config
└── validators.js              # Answer validation
```

**Key Interfaces:**

```javascript
// backend/services/strategist/interviewService.js

class InterviewService {
  /**
   * Get the next unanswered question for a project
   * @param {string} projectId - UUID
   * @returns {Promise<{index: number, question: string, total: number}>}
   */
  async getNextQuestion(projectId) {
    const project = await Project.findByPk(projectId);
    const answers = project.interviewData?.answers || {};
    const questionSet = INTERVIEW_QUESTIONS;
    
    for (let i = 0; i < questionSet.length; i++) {
      if (!answers[i]) {
        return { index: i, question: questionSet[i].text, total: questionSet.length };
      }
    }
    return null; // All answered
  }

  /**
   * Save user answer and progress interview
   * @param {string} projectId
   * @param {string} answer
   * @returns {Promise<{nextQuestion: object|null, complete: boolean}>}
   */
  async saveAnswer(projectId, answer) {
    const project = await Project.findByPk(projectId);
    const answers = project.interviewData?.answers || {};
    const currentIndex = this._getCurrentQuestionIndex(answers);
    
    answers[currentIndex] = answer;
    project.interviewData = { ...project.interviewData, answers };
    await project.save();
    
    const next = await this.getNextQuestion(projectId);
    return {
      nextQuestion: next,
      complete: next === null
    };
  }

  /**
   * Mark interview as complete, set milestone
   * @param {string} projectId
   * @returns {Promise<void>}
   */
  async completeInterview(projectId) {
    const project = await Project.findByPk(projectId);
    project.milestones = {
      ...project.milestones,
      interview_complete: true,
      business_research_started: false
    };
    await project.save();
    
    // Trigger OpenClaw notification
    await notificationService.create({
      type: 'milestone',
      title: 'Interview Complete',
      message: 'Business research is ready to begin',
      projectId
    });
  }
}
```

**Effort:** **M** (Medium — 3-5 days)  
**Dependencies:** None  
**Priority:** 🔴 High (blocking for full flow)

---

### 2.2 Business Research

**Source Files (Python):**
- `server/modules/research/extract.py` — Website scraping + profile extraction (Playwright, BeautifulSoup)
- `server/modules/research/tools.py` — `run_business_research()`, `update_business_profile()`

**Target Files (Node.js):**
```
backend/services/strategist/
├── researchService.js         # Orchestration
├── extractionService.js       # Website scraping (Playwright)
└── profileBuilder.js          # Business profile construction
```

**Key Interfaces:**

```javascript
// backend/services/strategist/researchService.js

class ResearchService {
  /**
   * Run comprehensive business research
   * @param {string} projectId
   * @returns {Promise<object>} Research data
   */
  async runBusinessResearch(projectId) {
    const project = await Project.findByPk(projectId);
    const websiteUrl = project.url;
    const interviewAnswers = project.interviewData?.answers || {};
    
    // Step 1: Extract website data
    const websiteData = await extractionService.scrapeWebsite(websiteUrl);
    
    // Step 2: Build business profile
    const profile = await profileBuilder.buildProfile({
      websiteData,
      interviewAnswers,
      url: websiteUrl
    });
    
    // Step 3: Get traffic data (if available)
    const trafficData = await trafficService.getSimilarWebData(websiteUrl);
    
    // Step 4: Competitor analysis (basic)
    const competitors = await this._findCompetitors(profile.industry);
    
    const researchData = {
      profile,
      websiteData,
      trafficData,
      competitors,
      completedAt: new Date().toISOString()
    };
    
    // Save to project
    project.businessProfile = profile;
    project.researchData = researchData;
    project.milestones = {
      ...project.milestones,
      business_research_complete: true
    };
    await project.save();
    
    return researchData;
  }
}
```

```javascript
// backend/services/strategist/extractionService.js

const { chromium } = require('playwright');
const cheerio = require('cheerio');

class ExtractionService {
  /**
   * Scrape website and extract key information
   * @param {string} url
   * @returns {Promise<object>}
   */
  async scrapeWebsite(url) {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      const html = await page.content();
      const $ = cheerio.load(html);
      
      // Extract key elements
      const data = {
        title: $('title').text() || $('h1').first().text(),
        description: $('meta[name="description"]').attr('content') || '',
        headings: $('h1, h2, h3').map((i, el) => $(el).text()).get(),
        images: $('img[src]').map((i, el) => $(el).attr('src')).get().slice(0, 10),
        links: $('a[href]').map((i, el) => ({ href: $(el).attr('href'), text: $(el).text() })).get().slice(0, 20),
        text: $('body').text().replace(/\s+/g, ' ').trim().slice(0, 5000),
        screenshot: await page.screenshot({ type: 'png', fullPage: false })
      };
      
      return data;
    } finally {
      await browser.close();
    }
  }
}
```

**Effort:** **L** (Large — 1-2 weeks)  
**Dependencies:** Interview System, Traffic Service  
**Priority:** 🔴 High

---

### 2.3 GTM Report Generation

**Source Files (Python):**
- `server/modules/research/prompt.py` — 876-line GTM prompt builder (Jinja2)
- `server/modules/research/gtm_service.py` — Report generation orchestration
- `server/modules/research/gtm_tools.py` — SimilarWeb API integration
- `server/modules/research/tools.py` — `generate_gtm_report()`

**Target Files (Node.js):**
```
backend/services/strategist/
├── gtmReportService.js        # Report generation orchestration
├── gtmPromptBuilder.js        # 876-line prompt (port from Jinja2)
├── trafficService.js          # SimilarWeb API client
└── templates/
    └── gtm-prompt.ejs         # EJS template (instead of Jinja2)
```

**Key Interfaces:**

```javascript
// backend/services/strategist/gtmReportService.js

const ejs = require('ejs');
const path = require('path');
const claudeService = require('../claudeService');
const trafficService = require('./trafficService');

class GTMReportService {
  /**
   * Generate comprehensive Go-To-Market report
   * @param {string} projectId
   * @returns {Promise<{reportId: string, sections: object}>}
   */
  async generateReport(projectId) {
    const project = await Project.findByPk(projectId);
    
    // Validate prerequisites
    if (!project.milestones?.business_research_complete) {
      throw new Error('Business research must be complete before generating GTM report');
    }
    
    // Gather context
    const context = {
      businessProfile: project.businessProfile,
      researchData: project.researchData,
      interviewAnswers: project.interviewData?.answers || {},
      trafficData: await trafficService.getSimilarWebData(project.url)
    };
    
    // Build 876-line prompt
    const prompt = await this._buildGTMPrompt(context);
    
    // Call Claude with long context (200k tokens)
    const completion = await claudeService.complete({
      model: 'claude-opus-4',
      maxTokens: 8000,
      temperature: 0.7,
      messages: [{ role: 'user', content: prompt }]
    });
    
    const report = this._parseReportSections(completion);
    
    // Save as Artifact
    const artifact = await Artifact.create({
      projectId,
      type: 'gtm_report',
      title: `GTM Strategy Report - ${project.businessProfile?.name}`,
      content: report,
      metadata: { generatedAt: new Date().toISOString() }
    });
    
    // Update milestone
    project.milestones = {
      ...project.milestones,
      gtm_report_generated: true
    };
    await project.save();
    
    return {
      reportId: artifact.id,
      sections: report
    };
  }

  /**
   * Build the 876-line GTM prompt using EJS template
   * @private
   */
  async _buildGTMPrompt(context) {
    const templatePath = path.join(__dirname, 'templates', 'gtm-prompt.ejs');
    const prompt = await ejs.renderFile(templatePath, context);
    return prompt;
  }

  /**
   * Parse Claude output into structured sections
   * @private
   */
  _parseReportSections(rawText) {
    // Extract sections based on markdown headers
    const sections = {
      executiveSummary: '',
      marketAnalysis: '',
      targetAudience: '',
      positioning: '',
      channelStrategy: '',
      contentPlan: '',
      budgetAllocation: '',
      kpis: '',
      timeline: ''
    };
    
    const lines = rawText.split('\n');
    let currentSection = null;
    
    for (const line of lines) {
      if (line.startsWith('## Executive Summary')) currentSection = 'executiveSummary';
      else if (line.startsWith('## Market Analysis')) currentSection = 'marketAnalysis';
      else if (line.startsWith('## Target Audience')) currentSection = 'targetAudience';
      else if (line.startsWith('## Positioning')) currentSection = 'positioning';
      else if (line.startsWith('## Channel Strategy')) currentSection = 'channelStrategy';
      else if (line.startsWith('## Content Plan')) currentSection = 'contentPlan';
      else if (line.startsWith('## Budget')) currentSection = 'budgetAllocation';
      else if (line.startsWith('## KPIs')) currentSection = 'kpis';
      else if (line.startsWith('## Timeline')) currentSection = 'timeline';
      else if (currentSection) {
        sections[currentSection] += line + '\n';
      }
    }
    
    return sections;
  }
}
```

```javascript
// backend/services/strategist/trafficService.js

const axios = require('axios');

class TrafficService {
  constructor() {
    this.apiKey = process.env.SIMILARWEB_API_KEY;
    this.baseURL = 'https://api.similarweb.com/v1';
  }

  /**
   * Get SimilarWeb traffic data for a domain
   * @param {string} url - Full URL (will extract domain)
   * @returns {Promise<object|null>}
   */
  async getSimilarWebData(url) {
    if (!this.apiKey) {
      console.warn('SimilarWeb API key not configured');
      return null;
    }
    
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      
      const [traffic, engagement, keywords] = await Promise.all([
        this._getTrafficData(domain),
        this._getEngagementData(domain),
        this._getKeywords(domain)
      ]);
      
      return { traffic, engagement, keywords };
    } catch (error) {
      console.error('SimilarWeb API error:', error.message);
      return null;
    }
  }

  async _getTrafficData(domain) {
    const res = await axios.get(`${this.baseURL}/website/${domain}/total-traffic-and-engagement/visits`, {
      params: { api_key: this.apiKey, start_date: '2025-11', end_date: '2026-01', granularity: 'monthly' }
    });
    return res.data;
  }

  async _getEngagementData(domain) {
    const res = await axios.get(`${this.baseURL}/website/${domain}/total-traffic-and-engagement/visits`, {
      params: { api_key: this.apiKey }
    });
    return res.data;
  }

  async _getKeywords(domain) {
    const res = await axios.get(`${this.baseURL}/website/${domain}/search-keywords/organic`, {
      params: { api_key: this.apiKey, limit: 20 }
    });
    return res.data;
  }
}
```

**Effort:** **L** (Large — 2 weeks)  
**Dependencies:** Business Research, Claude Service  
**Priority:** 🔴 Critical (core differentiator)

---

### 2.4 Router/Specialist Pattern

**Source Files (Python):**
- `server/core/agent/routing.py` — `IntentClassifier` (LLM-based routing)
- `server/core/agent/registry.py` — Module registry
- `server/core/agent/module.py` — `AgentModule` dataclass

**Target Files (Node.js):**
```
backend/services/openclaw/
├── routerService.js           # LLM intent classifier
├── moduleRegistry.js          # Module registration
└── agentModule.js             # Module definition class
```

**Key Interfaces:**

```javascript
// backend/services/openclaw/agentModule.js

class AgentModule {
  constructor({
    name,
    description,
    routingExamples = [],
    tools = [],
    requiresMilestones = [],
    producesMilestones = []
  }) {
    this.name = name;
    this.description = description;
    this.routingExamples = routingExamples;
    this.tools = tools;
    this.requiresMilestones = requiresMilestones;
    this.producesMilestones = producesMilestones;
  }
}

module.exports = AgentModule;
```

```javascript
// backend/services/openclaw/routerService.js

const claudeService = require('../claudeService');
const moduleRegistry = require('./moduleRegistry');

class RouterService {
  /**
   * Route user input to appropriate module/specialist
   * @param {string} userInput
   * @param {object} projectContext - Current project state
   * @param {Array} conversationHistory
   * @returns {Promise<{module: string, confidence: number, reason: string}>}
   */
  async route(userInput, projectContext, conversationHistory = []) {
    // Check for session continuation (if last message was from a specialist)
    const activeSpecialist = this._detectActiveSession(conversationHistory);
    if (activeSpecialist) {
      const topicSwitch = await this._detectTopicSwitch(userInput, activeSpecialist, projectContext);
      if (!topicSwitch) {
        return {
          module: activeSpecialist,
          confidence: 0.95,
          reason: `Continuing ${activeSpecialist} session`
        };
      }
    }
    
    // Build classification prompt from registered modules
    const prompt = this._buildClassificationPrompt(userInput, projectContext);
    
    // Call Claude Haiku for fast routing
    const response = await claudeService.complete({
      model: 'claude-haiku-4',
      maxTokens: 100,
      temperature: 0.0,
      messages: [{ role: 'user', content: prompt }]
    });
    
    const result = this._parseRoutingResponse(response);
    return result;
  }

  _buildClassificationPrompt(userInput, projectContext) {
    const modules = moduleRegistry.getAllModules();
    const moduleDescriptions = modules.map(m => {
      const examples = m.routingExamples.map(ex => `  - "${ex}"`).join('\n');
      return `**${m.name}**: ${m.description}\nExamples:\n${examples}`;
    }).join('\n\n');
    
    const milestones = projectContext.milestones || {};
    const milestoneStatus = Object.entries(milestones)
      .map(([k, v]) => `- ${k}: ${v ? '✅' : '❌'}`)
      .join('\n');
    
    return `You are a routing assistant. Classify the user's intent into one of these modules:

${moduleDescriptions}

**Current Project State:**
${milestoneStatus}

**User Input:** "${userInput}"

Respond ONLY with: <module_name> | <confidence 0-1> | <reason>
Example: strategist | 0.92 | User wants to generate GTM report`;
  }

  _parseRoutingResponse(response) {
    const parts = response.split('|').map(s => s.trim());
    return {
      module: parts[0] || 'general',
      confidence: parseFloat(parts[1]) || 0.5,
      reason: parts[2] || 'Default routing'
    };
  }

  _detectActiveSession(history) {
    if (history.length === 0) return null;
    const lastMessage = history[history.length - 1];
    return lastMessage.metadata?.module || null;
  }

  async _detectTopicSwitch(userInput, activeModule, context) {
    const prompt = `Is the user switching topics or continuing the ${activeModule} conversation?
    
User input: "${userInput}"

Respond with: SWITCH or CONTINUE`;
    
    const response = await claudeService.complete({
      model: 'claude-haiku-4',
      maxTokens: 10,
      temperature: 0.0,
      messages: [{ role: 'user', content: prompt }]
    });
    
    return response.trim().toUpperCase().includes('SWITCH');
  }
}
```

**Effort:** **M** (Medium — 1 week)  
**Dependencies:** Module Registry  
**Priority:** 🟡 Medium (can start with basic routing, improve later)

---

### 2.5 Block-based Messaging → V3 Card Mapping

**Source Files (Python):**
- `server/core/messaging/blocks.py` — 16 ContentBlock types (Text, Progress, Choices, KPI, Chart, Table, Image, Video, etc.)

**Target:** Already exists in Ralph Loop as **V3 Card Types** (50+ types)

**Mapping Table:**

| Yuhong Block | Ralph Loop Card | Status | Notes |
|--------------|----------------|--------|-------|
| `TextBlock` | `text` card | ✅ Exists | Direct 1:1 mapping |
| `ProgressBlock` | `progress` card | ✅ Exists | Step-based progress UI |
| `ChoicesBlock` | `choices` / `action_grid` | ✅ Exists | Supports suggestions + actions |
| `KpiBlock` | `kpi_grid` / `metric_card` | ✅ Exists | KPI with trend indicators |
| `DividerBlock` | `divider` card | ✅ Exists | Section separator |
| `TaskStatusBlock` | `task_status` card | ✅ Exists | Background task tracking |
| `ErrorBlock` | `error` / `alert` card | ✅ Exists | Error messages with severity |
| `ArtifactRefBlock` | `artifact_preview` card | ✅ Exists | Artifact cards with preview |
| `ImageBlock` | `image` card | ✅ Exists | Image display with caption |
| `VideoBlock` | `video` card | ✅ Exists | Video embed |
| `TableBlock` | `table` card | ✅ Exists | Data tables |
| `ChartBlock` | `chart` card | ✅ Exists | Victory charts (line, bar, pie) |
| `FormBlock` | `form` card | ⚠️ Partial | Needs enhancement for multi-field |
| `CodeBlock` | `code` / `terminal` | ✅ Exists | Syntax highlighted code |
| `CalendarBlock` | `calendar` card | 🟡 Custom | Need to add |
| `MapBlock` | `map` card | 🟡 Custom | Need to add |

**No porting needed** — Yuhong's blocks are a subset of our existing card types. We just need to ensure the Strategist service uses our card factory when building responses.

**Effort:** **S** (Small — 2-3 days to wire up)  
**Priority:** 🟢 Low (cosmetic, works out of the box)

---

### 2.6 Effect System → ActionCard Integration

**Source Files (Python):**
- `server/core/agent/effects.py` — `Effect`, `EffectResult` dataclasses (side-effects from tool calls)

**Concept:** In Yuhong's system, when a tool is called (e.g., `generate_gtm_report()`), it can emit "effects" like:
- `TaskStarted(task_id, type, message)` → UI shows task in progress
- `CanvasOpen(url, tab_name)` → Opens a new UI tab/canvas
- `NotificationSent(...)` → System notification

**Ralph Loop Equivalent:** Already exists! Our `actionCardService` does the same:
- Tool execution → creates ActionCard → routed to auto-execute or manual approval queue
- Notifications via `notificationService`

**Integration Plan:**

```javascript
// backend/services/strategist/effectHandler.js

const actionCardService = require('../openclaw/actionCardService');
const notificationService = require('../openclaw/notificationService');

class EffectHandler {
  /**
   * Handle effects emitted by Strategist tools
   * @param {string} effectType - 'task_started' | 'canvas_open' | 'notification'
   * @param {object} payload
   */
  async handleEffect(effectType, payload, projectId) {
    switch (effectType) {
      case 'task_started':
        return await actionCardService.createCard({
          projectId,
          cardType: 'task_progress',
          title: payload.message,
          body: `Task: ${payload.taskType}`,
          metadata: { taskId: payload.taskId }
        });
        
      case 'canvas_open':
        return await notificationService.create({
          type: 'action',
          title: 'New Canvas Ready',
          message: `View: ${payload.tabName}`,
          actionUrl: payload.url,
          projectId
        });
        
      case 'notification':
        return await notificationService.create({
          type: payload.level || 'info',
          title: payload.title,
          message: payload.message,
          projectId
        });
        
      default:
        console.warn(`Unknown effect type: ${effectType}`);
    }
  }
}
```

**Effort:** **S** (Small — 1-2 days)  
**Priority:** 🟢 Low (nice-to-have, not blocking)

---

## 3. Unified Data Model

### Current State

**Ralph Loop (PostgreSQL):**
```javascript
// backend/models/
- InterviewSession.js     // Interview responses
- InterviewResponse.js    // Individual answers
- ResearchResult.js       // Business research data
- GTMReport.js            // Generated reports
- Campaign.js             // Ad campaigns
- Creative.js             // Creative assets
- CreativeGeneration.js   // AI generation jobs
```

**Yuhong (PostgreSQL via SQLAlchemy):**
```python
# server/db/models/
- Project               # Main project entity
- User                  # User accounts
- Artifact              # Generated reports/documents
- Message               # Chat messages
- Notification          # In-app notifications
- BackgroundTask        # Async job tracking
- ChatSession           # Conversation sessions
```

### Unified Schema (Node.js)

**Migrate to single unified schema:**

```javascript
// backend/models/Project.js (NEW - merge concepts)

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'Users', key: 'id' }
  },
  title: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  // ── Milestones (Yuhong's approach - drives routing) ──
  milestones: {
    type: DataTypes.JSONB,
    defaultValue: {
      interview_complete: false,
      business_research_complete: false,
      gtm_report_generated: false,
      execution_setup_complete: false,
      campaign_launched: false,
      optimization_active: false
    }
  },
  
  // ── Interview Data ──
  interviewData: {
    type: DataTypes.JSONB,
    defaultValue: {
      questionSet: [], // Array of question texts
      answers: {}      // { "0": "answer", "1": "answer", ... }
    }
  },
  
  // ── Business Research Data ──
  businessProfile: {
    type: DataTypes.JSONB,
    allowNull: true,
    // { name, industry, targetAudience, uniqueValue, ... }
  },
  researchData: {
    type: DataTypes.JSONB,
    allowNull: true,
    // { websiteData, trafficData, competitors, ... }
  },
  
  // ── OpenClaw State ──
  trustLevel: {
    type: DataTypes.ENUM('none', 'low', 'medium', 'high'),
    defaultValue: 'low'
  },
  
  // ── Soft Delete ──
  isArchived: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  // ── Timestamps ──
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE
}, {
  tableName: 'projects',
  timestamps: true
});

module.exports = Project;
```

```javascript
// backend/models/Artifact.js (NEW - from Yuhong)

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Artifact = sequelize.define('Artifact', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  projectId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'Projects', key: 'id' }
  },
  type: {
    type: DataTypes.ENUM(
      'gtm_report',
      'creative_brief',
      'ad_copy',
      'landing_page',
      'shopify_theme'
    ),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  content: {
    type: DataTypes.JSONB, // Structured sections
    allowNull: false
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE
}, {
  tableName: 'artifacts',
  timestamps: true
});

module.exports = Artifact;
```

**Migration Strategy:**
1. Create new `Project` and `Artifact` models
2. Write migration script to port existing `InterviewSession` + `ResearchResult` + `GTMReport` data into new schema
3. Update all services to use new models
4. Deprecate old models after 1 sprint

---

## 4. Unified User Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUXORA COMPLETE FLOW                          │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│  1. ONBOARDING   │  [Strategist Module]
│   6 Questions    │  
│                  │  • What does your business do?
│  interviewService│  • Who are your customers?
│                  │  • What's your unique value?
│                  │  • Current marketing efforts?
│                  │  • Budget range?
│                  │  • Primary goals?
└────────┬─────────┘
         │ milestone: interview_complete = true
         ↓
┌──────────────────┐
│  2. RESEARCH     │  [Strategist Module]
│   Business Intel │
│                  │  • Website scraping (Playwright)
│  researchService │  • Profile extraction (AI + NLP)
│                  │  • SimilarWeb traffic data
│                  │  • Competitor analysis
└────────┬─────────┘
         │ milestone: business_research_complete = true
         ↓
┌──────────────────┐
│  3. GTM REPORT   │  [Strategist Module]
│   Strategy       │
│                  │  • 876-line prompt → Claude Opus
│  gtmReportService│  • Comprehensive GTM strategy:
│                  │    - Market analysis
│                  │    - Target audience personas
│                  │    - Positioning & messaging
│                  │    - Channel strategy (Meta, Google, SEO, etc.)
│                  │    - Content plan (ad copy, creatives, landing pages)
│                  │    - Budget allocation
│                  │    - KPIs & success metrics
│                  │    - 90-day timeline
└────────┬─────────┘
         │ milestone: gtm_report_generated = true
         │ artifact: GTM Report saved
         ↓
┌──────────────────┐
│  4. EXECUTION    │  [Executor Module]
│   Asset Creation │
│                  │  • Shopify store setup (shopifyService)
│  executorService │  • Landing page deployment (lovableService)
│                  │  • Creative generation (creativeService + pixverseService)
│                  │  • Domain setup (domainService)
└────────┬─────────┘
         │ milestone: execution_setup_complete = true
         ↓
┌──────────────────┐
│  5. ADVERTISING  │  [Advertiser Module]
│   Campaign Launch│
│                  │  • GoMarble MCP OAuth (Meta Business Manager)
│  gomarbleService │  • Campaign creation (budget, targeting, creatives)
│                  │  • Pixel installation
│                  │  • Ad set & ad creation
│                  │  • Budget control & scheduling
└────────┬─────────┘
         │ milestone: campaign_launched = true
         ↓
┌──────────────────┐
│  6. MONITORING   │  [OpenClaw + Analyzer]
│   Nervous System │
│                  │  HEARTBEAT LOOP (every 30 min):
│  heartbeatService│  ├─ Fetch metrics (Meta, Google, Shopify)
│  analyzerService │  ├─ Run optimizer rules (ROAS, CPA, CTR, etc.)
│  actionCardService│  ├─ Generate action cards (auto or manual)
│                  │  ├─ Route based on trust level
│                  │  └─ Send notifications (email, WhatsApp, in-app)
└────────┬─────────┘
         │ milestone: optimization_active = true
         ↓
┌──────────────────┐
│  7. OPTIMIZATION │  [Analyzer + Advertiser]
│   Continuous     │
│                  │  • Trust-based auto-execution
│  optimizerService│  • Manual approval for high-risk actions
│  dashboardService│  • Weekly/monthly reports
│  reportService   │  • Budget reallocation
│                  │  • Creative refresh triggers
└──────────────────┘
```

---

## 5. Prioritized Build Tasks

### Phase 1: Foundation (Sprint 1-2, ~3 weeks)

| # | Task | Effort | Dependencies | Priority | Owner |
|---|------|--------|--------------|----------|-------|
| 1.1 | Port Interview System to Node.js | **M** | None | 🔴 Critical | Backend |
| 1.2 | Create `Project` + `Artifact` unified models | **S** | None | 🔴 Critical | Backend |
| 1.3 | Build extraction service (Playwright scraping) | **M** | None | 🔴 Critical | Backend |
| 1.4 | Integrate SimilarWeb API (traffic service) | **S** | None | 🟡 Medium | Backend |
| 1.5 | Port Business Research orchestration | **M** | 1.3, 1.4 | 🔴 Critical | Backend |

**Deliverable:** Interview → Research flow working end-to-end

---

### Phase 2: GTM Report (Sprint 3-4, ~2-3 weeks)

| # | Task | Effort | Dependencies | Priority | Owner |
|---|------|--------|--------------|----------|-------|
| 2.1 | Port 876-line GTM prompt to EJS template | **L** | Phase 1 complete | 🔴 Critical | Backend |
| 2.2 | Build GTM Report generation service | **L** | 2.1 | 🔴 Critical | Backend |
| 2.3 | Create Artifact storage + retrieval | **S** | 1.2 | 🔴 Critical | Backend |
| 2.4 | Build GTM Report UI (artifact viewer) | **M** | 2.3 | 🟡 Medium | Frontend |
| 2.5 | Test full Strategist flow (Interview → Research → GTM) | **M** | 2.1-2.4 | 🔴 Critical | QA |

**Deliverable:** Complete Strategist module (Python → Node.js port complete)

---

### Phase 3: Integration (Sprint 5-6, ~2 weeks)

| # | Task | Effort | Dependencies | Priority | Owner |
|---|------|--------|--------------|----------|-------|
| 3.1 | Wire Strategist → Executor bridge | **M** | Phase 2 | 🔴 Critical | Backend |
| 3.2 | Auto-generate Shopify store from GTM Report | **L** | 3.1 | 🟡 Medium | Backend |
| 3.3 | Auto-generate landing pages from GTM Report | **M** | 3.1 | 🟡 Medium | Backend |
| 3.4 | Auto-generate creatives from GTM Report | **L** | 3.1 | 🟡 Medium | Backend + AI |
| 3.5 | Build Router Service (LLM-based intent routing) | **M** | Phase 2 | 🟢 Low | Backend |
| 3.6 | Wire Router into chat handler | **S** | 3.5 | 🟢 Low | Backend |

**Deliverable:** Strategist + Executor working together

---

### Phase 4: Polish & Scale (Sprint 7+, ongoing)

| # | Task | Effort | Dependencies | Priority | Owner |
|---|------|--------|--------------|----------|-------|
| 4.1 | Effect system → ActionCard mapping | **S** | Phase 3 | 🟢 Low | Backend |
| 4.2 | Add Calendar + Map card types | **S** | None | 🟢 Low | Frontend |
| 4.3 | Optimize prompt templates (reduce token usage) | **M** | Phase 2 | 🟢 Low | Backend |
| 4.4 | Background task queue (Redis/Bull) for long-running jobs | **M** | Phase 3 | 🟡 Medium | DevOps |
| 4.5 | Multi-project support + workspace switcher | **L** | Phase 3 | 🟡 Medium | Full-stack |

**Deliverable:** Production-ready unified platform

---

## 6. Architecture Diagram

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                              AUXORA PLATFORM                                   │
│                         (Node.js + PostgreSQL + Claude)                        │
└───────────────────────────────────────────────────────────────────────────────┘

                                  ┌─────────────┐
                                  │   Browser   │
                                  │  (Next.js)  │
                                  └──────┬──────┘
                                         │
                                         │ WebSocket (chat)
                                         │ HTTP (API)
                                         │
┌────────────────────────────────────────┼──────────────────────────────────────┐
│                                   BACKEND                                      │
│                                 (Express.js)                                   │
│                                                                                │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                         OPENCLAW NERVOUS SYSTEM                         │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │  │
│  │  │  Heartbeat   │  │   Memory     │  │  Trust       │  │  Router    │ │  │
│  │  │  Loop (30min)│  │   Service    │  │  System      │  │  Service   │ │  │
│  │  │              │  │              │  │              │  │  (LLM)     │ │  │
│  │  │ • Fetch data │  │ • Agent ctx  │  │ • Auto/manual│  │ • Intent   │ │  │
│  │  │ • Run rules  │  │ • Project    │  │ • Risk score │  │   classify │ │  │
│  │  │ • Generate   │  │   history    │  │              │  │ • Route to │ │  │
│  │  │   action cards│ │              │  │              │  │   module   │ │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘ │  │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │  │
│  │  │                     ActionCard Service                            │  │  │
│  │  │  • Card factory (templates)                                       │  │  │
│  │  │  • Execution pipeline (auto or queue)                             │  │  │
│  │  │  • Notification dispatch (email, WhatsApp, in-app)                │  │  │
│  │  └──────────────────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                                │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                           MODULE LAYER                                  │  │
│  │                                                                          │  │
│  │  ┌───────────────┐  ┌───────────────┐  ┌──────────────┐  ┌──────────┐ │  │
│  │  │  STRATEGIST   │  │   EXECUTOR    │  │  ADVERTISER  │  │ ANALYZER │ │  │
│  │  ├───────────────┤  ├───────────────┤  ├──────────────┤  ├──────────┤ │  │
│  │  │ Interview     │  │ Shopify       │  │ GoMarble MCP │  │ Analytics│ │  │
│  │  │ Service       │  │ Service       │  │ Service      │  │ Service  │ │  │
│  │  │               │  │               │  │              │  │          │ │  │
│  │  │ Research      │  │ Landing Page  │  │ Campaign Mgmt│  │ Optimizer│ │  │
│  │  │ Service       │  │ (Lovable)     │  │              │  │ Service  │ │  │
│  │  │  └─ Extract   │  │               │  │ Pixel Setup  │  │          │ │  │
│  │  │  └─ Profile   │  │ Creative Gen  │  │              │  │ Dashboard│ │  │
│  │  │               │  │ (Pixverse)    │  │ Budget Ctrl  │  │ Service  │ │  │
│  │  │ GTM Report    │  │               │  │              │  │          │ │  │
│  │  │ Service       │  │ Domain Setup  │  │              │  │ Report   │ │  │
│  │  │  └─ Traffic   │  │               │  │              │  │ Service  │ │  │
│  │  │  └─ Prompt    │  │               │  │              │  │          │ │  │
│  │  │     Builder   │  │               │  │              │  │          │ │  │
│  │  └───────────────┘  └───────────────┘  └──────────────┘  └──────────┘ │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                                │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                         EXTERNAL SERVICES                               │  │
│  │                                                                          │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │  │
│  │  │   Claude     │  │  SimilarWeb  │  │  Playwright  │  │ SendGrid   │ │  │
│  │  │   (Opus/     │  │  (Traffic    │  │  (Scraping)  │  │ (Email)    │ │  │
│  │  │    Sonnet)   │  │   Data)      │  │              │  │            │ │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘ │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │  │
│  │  │  GoMarble    │  │   Shopify    │  │   Lovable    │  │ Pixverse   │ │  │
│  │  │  MCP API     │  │   API        │  │   API        │  │ (Video)    │ │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘ │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘

                                         │
                                         ↓
                                ┌─────────────────┐
                                │   PostgreSQL    │
                                │                 │
                                │  Tables:        │
                                │  • users        │
                                │  • projects ★   │
                                │  • artifacts ★  │
                                │  • campaigns    │
                                │  • creatives    │
                                │  • messages     │
                                │  • notifications│
                                │  • action_cards │
                                └─────────────────┘

★ = New unified models from merge
```

---

## 7. Key Decisions & Rationale

### 7.1 Why Port to Node.js (instead of keeping Python)?

**Decision:** Port Yuhong's Research module from Python to Node.js

**Rationale:**
1. **Unified stack**: Entire codebase in one language → easier onboarding, deployment, maintenance
2. **Existing infrastructure**: Ralph Loop has mature OpenClaw nervous system, trust routing, notification system
3. **Frontend integration**: Next.js frontend already integrated with Node.js backend (WebSocket, SSE, API)
4. **Team velocity**: Team is already productive in Node.js ecosystem
5. **Deployment simplicity**: Single runtime, single container, single PM2 process

**Trade-offs:**
- Porting effort (4-6 weeks)
- Loss of Python ML ecosystem (but we use Claude API, not local models)
- pydantic-ai specific features need Node.js equivalents (but we have LangChain/simple fetch)

---

### 7.2 Milestone-Driven Routing vs. Rule-Based Routing

**Decision:** Adopt Yuhong's milestone-driven approach

**Current Ralph Loop:** No explicit milestones, logic is scattered across services

**Yuhong's Approach:**
```javascript
project.milestones = {
  interview_complete: false,
  business_research_complete: false,
  gtm_report_generated: false,
  execution_setup_complete: false,
  campaign_launched: false,
  optimization_active: false
}
```

**Benefits:**
- Clear project state tracking
- Router can make better decisions (e.g., "can't generate GTM report if interview not complete")
- Easy to display progress UI
- Debugging is simpler (check milestones)

**Implementation:** Add `milestones` JSONB column to `Project` model, check milestones in router + services

---

### 7.3 Artifact Model for Generated Content

**Decision:** Adopt Yuhong's `Artifact` model for all generated content (reports, briefs, ad copy, etc.)

**Why:**
- Clean separation: Projects have state, Artifacts have content
- Versioning: Can store multiple versions of GTM reports
- Reusability: Link same artifact to multiple projects
- Metadata: Store generation timestamp, model used, token count, etc.

**Schema:**
```javascript
Artifact {
  id: UUID
  projectId: UUID
  type: 'gtm_report' | 'creative_brief' | 'ad_copy' | 'landing_page' | ...
  title: String
  content: JSONB    // Structured sections
  metadata: JSONB   // { generatedAt, model, tokens, ... }
}
```

---

### 7.4 EJS vs. Jinja2 for Prompt Templates

**Decision:** Use EJS (JavaScript template engine) instead of porting Jinja2 templates

**Why:**
- Native to Node.js ecosystem (no Python dependency)
- Similar syntax (`<%= variable %>` vs `{{ variable }}`)
- Smaller footprint (no need to maintain two template engines)

**Porting Guide:**

| Jinja2 | EJS |
|--------|-----|
| `{{ variable }}` | `<%= variable %>` |
| `{% if condition %}...{% endif %}` | `<% if (condition) { %>...<% } %>` |
| `{% for item in items %}...{% endfor %}` | `<% items.forEach(item => { %>...<% }); %>` |
| `{{ variable \| default('N/A') }}` | `<%= variable || 'N/A' %>` |

---

## 8. Testing Strategy

### Unit Tests

Each service should have Jest tests:

```javascript
// backend/services/strategist/__tests__/interviewService.test.js

describe('InterviewService', () => {
  test('getNextQuestion returns first unanswered', async () => {
    const project = await Project.create({
      userId: testUser.id,
      title: 'Test Project',
      interviewData: { answers: { 0: 'Answer 1' } }
    });
    
    const next = await interviewService.getNextQuestion(project.id);
    expect(next.index).toBe(1);
  });
  
  test('saveAnswer progresses interview', async () => {
    // ... test
  });
  
  test('completeInterview sets milestone', async () => {
    // ... test
  });
});
```

### Integration Tests

Test full flows:

```javascript
// backend/__tests__/integration/strategist-flow.test.js

describe('Strategist Module Flow', () => {
  test('Interview → Research → GTM Report', async () => {
    // 1. Complete interview
    const project = await Project.create({ ... });
    for (let i = 0; i < 6; i++) {
      await interviewService.saveAnswer(project.id, `Answer ${i}`);
    }
    await interviewService.completeInterview(project.id);
    
    // 2. Run research
    const research = await researchService.runBusinessResearch(project.id);
    expect(research.profile).toBeDefined();
    
    // 3. Generate GTM report
    const report = await gtmReportService.generateReport(project.id);
    expect(report.sections.executiveSummary).toBeDefined();
  });
});
```

### E2E Tests (Playwright)

Frontend flow tests:

```javascript
// tests/e2e/strategist.spec.js

test('User completes interview and sees GTM report', async ({ page }) => {
  await page.goto('/projects/new');
  
  // Answer all 6 questions
  for (let i = 0; i < 6; i++) {
    await page.fill('textarea', `Answer ${i}`);
    await page.click('button:has-text("Next")');
  }
  
  // Wait for research to complete
  await page.waitForSelector('text=Research Complete');
  
  // Generate GTM report
  await page.click('button:has-text("Generate GTM Report")');
  await page.waitForSelector('text=GTM Report Ready', { timeout: 60000 });
  
  // Verify report sections
  await expect(page.locator('h2:has-text("Executive Summary")')).toBeVisible();
});
```

---

## 9. Deployment & DevOps

### Environment Variables

```bash
# Strategist Module
ANTHROPIC_API_KEY=sk-ant-...
ROUTING_MODEL=claude-haiku-4          # Fast router
STRATEGIST_MODEL=claude-opus-4        # Deep research + GTM report
SIMILARWEB_API_KEY=...                # Traffic data

# Executor Module
SHOPIFY_API_KEY=...
LOVABLE_API_KEY=...
PIXVERSE_API_KEY=...

# Advertiser Module
GOMARBLE_MCP_URL=https://apps.gomarble.ai/mcp-api/sse
GOMARBLE_OAUTH_CLIENT_ID=...
GOMARBLE_OAUTH_CLIENT_SECRET=...

# OpenClaw
HEARTBEAT_INTERVAL_MS=1800000         # 30 minutes
TRUST_THRESHOLD_AUTO=0.8              # Auto-execute if trust >= 0.8
SENDGRID_API_KEY=...
WHATSAPP_API_TOKEN=...

# Database
DATABASE_URL=postgresql://...
REDIS_URL=redis://...                 # For background jobs
```

### Docker Compose

```yaml
# docker-compose.yml

version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      # ... all env vars
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:3001
    depends_on:
      - backend
    restart: unless-stopped
    
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: auxora
      POSTGRES_USER: auxora
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    restart: unless-stopped
    
  redis:
    image: redis:7-alpine
    restart: unless-stopped

volumes:
  pgdata:
```

---

## 10. Success Metrics

### Technical Metrics

- **Test coverage**: >80% for Strategist services
- **API latency**: 
  - Interview endpoints: <200ms
  - Research: <30s
  - GTM Report: <90s (LLM call)
- **Uptime**: 99.5% (heartbeat must be reliable)

### Business Metrics

- **Interview completion rate**: >70% (users who start, finish)
- **GTM Report satisfaction**: >4.2/5 stars
- **Time to first campaign**: <48 hours (from signup to live ads)
- **Automation rate**: >60% of optimization actions auto-executed

### User Experience Metrics

- **Time to value**: <10 minutes (signup → first insight)
- **Support ticket rate**: <5% of users need help
- **Milestone completion**: >80% reach execution phase

---

## 11. Future Enhancements

### Phase 5+ (Post-MVP)

1. **Multi-language support** (Strategist prompts in Spanish, French, etc.)
2. **Industry-specific templates** (SaaS vs. E-commerce vs. Local Business)
3. **Competitor tracking** (daily monitoring + alerts)
4. **A/B testing framework** (auto-test ad variations)
5. **Voice of Customer** (integrate survey data, reviews into research)
6. **Co-pilot mode** (real-time chat during campaign setup)
7. **White-label** (agencies can rebrand Auxora)

---

## Appendix A: File Mapping Reference

| Python File | Node.js File | Status |
|-------------|--------------|--------|
| `server/core/onboarding.py` | `backend/services/strategist/questions.js` | 🟡 Port |
| `server/modules/research/tools.py` | `backend/services/strategist/interviewService.js` | 🟡 Port |
| `server/modules/research/extract.py` | `backend/services/strategist/extractionService.js` | 🟡 Port |
| `server/modules/research/prompt.py` | `backend/services/strategist/gtmPromptBuilder.js` + `templates/gtm-prompt.ejs` | 🟡 Port |
| `server/modules/research/gtm_service.py` | `backend/services/strategist/gtmReportService.js` | 🟡 Port |
| `server/modules/research/gtm_tools.py` | `backend/services/strategist/trafficService.js` | 🟡 Port |
| `server/core/agent/routing.py` | `backend/services/openclaw/routerService.js` | 🟡 Port |
| `server/core/agent/module.py` | `backend/services/openclaw/agentModule.js` | 🟡 Port |
| `server/core/agent/effects.py` | `backend/services/strategist/effectHandler.js` | 🟡 Port |
| `server/core/messaging/blocks.py` | ✅ Exists (V3 card types) | ✅ No action |
| `server/db/models/project.py` | `backend/models/Project.js` (NEW) | 🟡 Create |
| `server/db/models/artifact.py` | `backend/models/Artifact.js` (NEW) | 🟡 Create |

---

## Appendix B: Claude Prompt Token Budget

**Strategist Module Token Usage:**

| Component | Avg Tokens | Notes |
|-----------|-----------|-------|
| Interview answers | 500 | 6 questions × ~80 tokens |
| Business profile | 800 | Extracted website data |
| Research data | 1200 | SimilarWeb + competitors |
| GTM prompt template | 5000 | 876-line prompt builder |
| Context window | ~7500 | Total input to Claude Opus |
| Report output | 8000 | Comprehensive GTM report |

**Total per GTM report:** ~15,500 tokens (~$0.50 with Opus pricing)

**Optimization Strategy:**
- Use Claude Haiku for routing (~100 tokens, $0.001)
- Use Claude Sonnet for research extraction (~2000 tokens, $0.02)
- Use Claude Opus only for GTM report (high quality needed)

---

## Appendix C: Database Migration Script

```javascript
// backend/migrations/20260224_merge_strategist_schema.js

const { Sequelize } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    // Create new Project table
    await queryInterface.createTable('projects', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      userId: { type: Sequelize.UUID, allowNull: false },
      title: { type: Sequelize.STRING(500), allowNull: false },
      url: { type: Sequelize.TEXT, allowNull: true },
      milestones: { type: Sequelize.JSONB, defaultValue: {} },
      interviewData: { type: Sequelize.JSONB, defaultValue: {} },
      businessProfile: { type: Sequelize.JSONB, allowNull: true },
      researchData: { type: Sequelize.JSONB, allowNull: true },
      trustLevel: { type: Sequelize.ENUM('none', 'low', 'medium', 'high'), defaultValue: 'low' },
      isArchived: { type: Sequelize.BOOLEAN, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });
    
    // Create new Artifact table
    await queryInterface.createTable('artifacts', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      projectId: { type: Sequelize.UUID, allowNull: false },
      type: { type: Sequelize.ENUM('gtm_report', 'creative_brief', 'ad_copy', 'landing_page'), allowNull: false },
      title: { type: Sequelize.STRING(500), allowNull: false },
      content: { type: Sequelize.JSONB, allowNull: false },
      metadata: { type: Sequelize.JSONB, defaultValue: {} },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });
    
    // Migrate existing InterviewSession + GTMReport data
    await queryInterface.sequelize.query(`
      INSERT INTO projects (id, userId, title, url, interviewData, milestones, createdAt, updatedAt)
      SELECT 
        gen_random_uuid() as id,
        'system-user-id' as userId,  -- Replace with actual user mapping
        'Migrated Project' as title,
        '' as url,
        jsonb_build_object('answers', answers) as interviewData,
        jsonb_build_object('interview_complete', true) as milestones,
        created_at as createdAt,
        updated_at as updatedAt
      FROM interview_sessions
      WHERE status = 'completed'
    `);
  },
  
  down: async (queryInterface) => {
    await queryInterface.dropTable('artifacts');
    await queryInterface.dropTable('projects');
  }
};
```

---

## Summary

This document defines the complete architecture for merging Ralph Loop (Node.js) and Yuhong's Research Module (Python) into a unified **Auxora platform**.

**Key Takeaways:**
1. **Strategist module** (Interview → Research → GTM Report) will be ported from Python to Node.js
2. **Integration effort**: 6-8 weeks (Phase 1-3)
3. **Unified data model**: New `Project` + `Artifact` models with milestone-driven routing
4. **Complete flow**: Onboarding → Research → GTM Report → Execution → Advertising → Monitoring → Optimization
5. **OpenClaw nervous system** ties everything together (heartbeat, trust, action cards, notifications)

**Next Steps:**
1. Review this document with team (get sign-off)
2. Set up project tracking (GitHub Projects or Linear)
3. Start Phase 1: Port Interview System (Sprint 1)
4. Weekly sync meetings to track progress

---

**Document Status:** ✅ Complete  
**Last Reviewed:** February 24, 2026  
**Approved By:** [Pending stakeholder review]
