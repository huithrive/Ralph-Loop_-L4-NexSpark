# UI/UX Evaluator Agent - Product Manager Observer

## Purpose
AI-powered product manager agent that evaluates, analyzes, and improves NexSpark's UI/UX by comparing it against industry-leading products like Typeless, Lovable, and Cursor.

## Role
Product Manager / UX Observer Agent that acts as a quality gate and continuous improvement system for the frontend experience.

## Workflow Integration

**Trigger Points:**
1. After backend check completes → Frontend check starts
2. After frontend check completes → UI/UX evaluation begins automatically
3. After each major frontend update
4. Weekly automated evaluations
5. Before major releases

**Evaluation Process:**
1. **Market Research** - Analyze best-in-class onboarding and user flows
2. **Page-by-Page Analysis** - Navigate through NexSpark frontend systematically
3. **Storyboard Documentation** - Generate user journey maps and flow diagrams
4. **Benchmark Comparison** - Compare against Typeless, Lovable, Cursor, and other benchmarks
5. **Scoring & Gap Analysis** - Score UX metrics and identify improvements
6. **Recommendation Generation** - Create actionable improvement tasks
7. **Automated Implementation** - Apply high-priority improvements automatically

## Components

### 1. Market Research & Benchmarking
**Endpoint:** POST `/api/evaluator/research/benchmarks`

**Purpose:**
Research and document best-in-class SaaS onboarding experiences and user flows.

**Reference Products:**
- **Typeless** - Analyze onboarding flow, feature discovery, user guidance patterns
- **Lovable** - Study landing page → product creation flow, visual feedback
- **Cursor** - Evaluate developer tool onboarding, feature execution workflows
- **Additional Benchmarks** - Research 5-10 other top products across different sectors

**Research Areas:**
- Customer onboarding processes (first-time user experience)
- Feature discovery and execution workflows
- Navigation patterns and information architecture
- Onboarding best practices and patterns
- Error prevention and recovery flows
- Loading states and feedback mechanisms
- Mobile/tablet/desktop responsive patterns

**Output:**
```json
{
  "benchmark_id": "uuid",
  "products_analyzed": [
    {
      "name": "Typeless",
      "category": "AI Writing Tool",
      "onboarding_flow": "detailed flow description",
      "key_patterns": ["pattern1", "pattern2"],
      "strengths": ["strength1", "strength2"],
      "screenshots": ["url1", "url2"],
      "score": {
        "clarity": 9,
        "efficiency": 8,
        "delight": 9
      }
    }
  ],
  "pattern_library": {
    "onboarding_patterns": [],
    "navigation_patterns": [],
    "feedback_patterns": []
  },
  "created_at": "timestamp"
}
```

**Files:**
- `backend/services/uiuxEvaluatorAgent.js`
- `backend/services/benchmarkResearch.js`
- `backend/api/evaluator/research.js`

### 2. Automated Page-by-Page Analysis
**Endpoint:** POST `/api/evaluator/analyze`

**Purpose:**
Navigate through NexSpark frontend systematically, analyzing each page and interaction.

**Process:**
1. Start at landing page
2. Navigate through onboarding flow
3. Analyze each module (Strategist, Executor, Advertiser, Analyzer)
4. Document each screen's purpose, layout, and user actions
5. Track flow from landing → onboarding → each module
6. Identify friction points and confusion areas

**Input:**
```json
{
  "frontend_url": "http://localhost:3000",
  "start_page": "landing",
  "user_journey": "full" | "onboarding" | "module_specific",
  "module": "strategist" | "executor" | "advertiser" | "analyzer" | "all"
}
```

**Output:**
```json
{
  "evaluation_id": "uuid",
  "pages_analyzed": [
    {
      "url": "/",
      "page_name": "Landing Page",
      "purpose": "Marketing and signup",
      "layout": "Hero section, features, pricing, CTA",
      "user_actions": ["View features", "Click CTA", "Navigate to signup"],
      "friction_points": ["point1", "point2"],
      "clarity_score": 8,
      "efficiency_score": 7,
      "delight_score": 8,
      "screenshot": "url",
      "html_structure": "simplified HTML"
    }
  ],
  "storyboard": {
    "user_journey": "detailed journey map",
    "screen_flow": "flow diagram",
    "interaction_patterns": [],
    "decision_points": []
  },
  "overall_scores": {
    "clarity": 7.5,
    "efficiency": 7.0,
    "delight": 7.5,
    "completion_rate_estimate": 0.75
  },
  "created_at": "timestamp"
}
```

**Technical Implementation:**
- Use Puppeteer or Playwright for browser automation
- Navigate through pages programmatically
- Extract page structure, content, and interactions
- Capture screenshots for documentation
- Use Claude to analyze and score each page

**Files:**
- `backend/services/uiuxEvaluatorAgent.js`
- `backend/services/pageAnalyzer.js`
- `backend/api/evaluator/analyze.js`

### 3. Storyboard Generation
**Endpoint:** GET `/api/evaluator/storyboard/:evaluation_id`

**Purpose:**
Auto-generate comprehensive storyboard documentation from page analysis.

**Output:**
```json
{
  "storyboard_id": "uuid",
  "evaluation_id": "uuid",
  "user_journey_map": {
    "stages": [
      {
        "stage": "Discovery",
        "screens": ["landing", "pricing"],
        "user_goals": ["Understand value prop", "See pricing"],
        "pain_points": [],
        "success_metrics": []
      },
      {
        "stage": "Onboarding",
        "screens": ["signup", "welcome", "tutorial"],
        "user_goals": ["Create account", "Understand product"],
        "pain_points": [],
        "success_metrics": []
      }
    ]
  },
  "screen_flow_diagram": "Mermaid diagram or JSON structure",
  "interaction_patterns": [
    {
      "pattern": "Progressive disclosure",
      "screens": ["screen1", "screen2"],
      "effectiveness": "high"
    }
  ],
  "decision_points": [
    {
      "point": "Choose module to start",
      "location": "/dashboard",
      "options": ["Strategist", "Executor", "Advertiser", "Analyzer"],
      "clarity": "high"
    }
  ],
  "created_at": "timestamp"
}
```

**Files:**
- `backend/services/storyboardGenerator.js`
- `backend/api/evaluator/storyboard.js`

### 4. Benchmark Comparison & Scoring
**Endpoint:** POST `/api/evaluator/compare`

**Purpose:**
Compare NexSpark UX against benchmark products and generate gap analysis.

**Input:**
```json
{
  "evaluation_id": "uuid",
  "benchmark_ids": ["typeless", "lovable", "cursor"],
  "focus_areas": ["onboarding", "feature_discovery", "navigation"]
}
```

**Output:**
```json
{
  "comparison_id": "uuid",
  "evaluation_id": "uuid",
  "comparisons": [
    {
      "benchmark": "Typeless",
      "area": "Onboarding",
      "nexspark_score": 7.5,
      "benchmark_score": 9.0,
      "gap": 1.5,
      "nexspark_approach": "Current approach description",
      "benchmark_approach": "Typeless approach description",
      "recommendations": ["rec1", "rec2"]
    }
  ],
  "overall_gap_analysis": {
    "strengths": ["strength1", "strength2"],
    "weaknesses": ["weakness1", "weakness2"],
    "opportunities": ["opp1", "opp2"],
    "threats": ["threat1", "threat2"]
  },
  "priority_improvements": [
    {
      "improvement": "Improve onboarding clarity",
      "priority": "high",
      "impact": "high",
      "effort": "medium",
      "benchmark_reference": "Typeless"
    }
  ],
  "created_at": "timestamp"
}
```

**Scoring Metrics:**
- **Clarity (1-10):** How clear is the purpose and next step?
- **Efficiency (1-10):** How quickly can users complete tasks?
- **Delight (1-10):** How enjoyable is the experience?
- **Completion Rate (0-1):** Estimated likelihood users complete the flow
- **Error Rate (0-1):** Estimated likelihood of user errors

**Files:**
- `backend/services/benchmarkComparator.js`
- `backend/api/evaluator/compare.js`

### 5. Evaluation Report Generation
**Endpoint:** GET `/api/evaluator/report/:evaluation_id`

**Purpose:**
Generate comprehensive evaluation report with recommendations.

**Output:**
```json
{
  "report_id": "uuid",
  "evaluation_id": "uuid",
  "executive_summary": "High-level summary of findings",
  "current_state": {
    "overall_score": 7.3,
    "strengths": [],
    "weaknesses": [],
    "page_breakdown": []
  },
  "benchmark_comparison": {
    "vs_typeless": {},
    "vs_lovable": {},
    "vs_cursor": {}
  },
  "gap_analysis": {
    "critical_gaps": [],
    "moderate_gaps": [],
    "minor_gaps": []
  },
  "recommendations": [
    {
      "id": "rec1",
      "title": "Improve onboarding flow",
      "description": "Detailed description",
      "priority": "high",
      "impact": "high",
      "effort": "medium",
      "benchmark_reference": "Typeless",
      "specific_changes": ["change1", "change2"],
      "estimated_improvement": {
        "clarity": "+1.5",
        "efficiency": "+1.0",
        "delight": "+1.0"
      }
    }
  ],
  "actionable_tasks": [
    {
      "task": "Add onboarding tooltips",
      "file": "frontend/components/Onboarding.jsx",
      "changes": "specific code changes"
    }
  ],
  "created_at": "timestamp"
}
```

**Files:**
- `backend/services/uiuxEvaluationReport.js`
- `backend/api/evaluator/report.js`

### 6. Automated UX Improvement
**Endpoint:** POST `/api/evaluator/improve`

**Purpose:**
Automatically implement high-priority UX improvements based on evaluation.

**Input:**
```json
{
  "report_id": "uuid",
  "priority": "high" | "medium" | "low" | "all",
  "auto_apply": true
}
```

**Process:**
1. Parse recommendations from evaluation report
2. Generate code changes for improvements:
   - Onboarding flow improvements
   - Navigation enhancements
   - UI component updates
   - Copy and messaging improvements
   - Loading state improvements
   - Error handling enhancements
3. Apply changes to frontend codebase
4. Re-run evaluation to measure improvement

**Output:**
```json
{
  "improvement_id": "uuid",
  "report_id": "uuid",
  "changes_applied": [
    {
      "file": "frontend/components/Onboarding.jsx",
      "change_type": "added" | "modified" | "removed",
      "description": "Added tooltip guidance",
      "code_diff": "unified diff format"
    }
  ],
  "re_evaluation": {
    "before_scores": {},
    "after_scores": {},
    "improvement": {}
  },
  "created_at": "timestamp"
}
```

**Files:**
- `backend/services/uxImprovementEngine.js`
- `backend/api/evaluator/improve.js`

## Database Schema

### uiux_evaluations table
```sql
CREATE TABLE uiux_evaluations (
  id UUID PRIMARY KEY,
  frontend_url TEXT NOT NULL,
  evaluation_type VARCHAR(50), -- 'full', 'onboarding', 'module_specific'
  pages_analyzed JSONB,
  storyboard JSONB,
  overall_scores JSONB,
  status VARCHAR(20) DEFAULT 'completed', -- 'in_progress', 'completed', 'failed'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### uiux_benchmarks table
```sql
CREATE TABLE uiux_benchmarks (
  id UUID PRIMARY KEY,
  product_name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  onboarding_flow JSONB,
  key_patterns JSONB,
  strengths JSONB,
  screenshots JSONB,
  scores JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### uiux_comparisons table
```sql
CREATE TABLE uiux_comparisons (
  id UUID PRIMARY KEY,
  evaluation_id UUID REFERENCES uiux_evaluations(id),
  benchmark_id UUID REFERENCES uiux_benchmarks(id),
  comparison_data JSONB,
  gap_analysis JSONB,
  recommendations JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### uiux_reports table
```sql
CREATE TABLE uiux_reports (
  id UUID PRIMARY KEY,
  evaluation_id UUID REFERENCES uiux_evaluations(id),
  comparison_id UUID REFERENCES uiux_comparisons(id),
  report_data JSONB,
  recommendations JSONB,
  actionable_tasks JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### uiux_improvements table
```sql
CREATE TABLE uiux_improvements (
  id UUID PRIMARY KEY,
  report_id UUID REFERENCES uiux_reports(id),
  changes_applied JSONB,
  re_evaluation JSONB,
  before_scores JSONB,
  after_scores JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Environment Variables
```
# UI/UX Evaluator
EVALUATOR_ENABLED=true
EVALUATOR_AUTO_IMPROVE=true
EVALUATOR_MIN_SCORE=7.0

# Browser Automation (Puppeteer/Playwright)
BROWSER_HEADLESS=true
BROWSER_TIMEOUT=30000

# Benchmark Research
BENCHMARK_CACHE_TTL=604800  # 7 days
```

## Evaluation Criteria

### Onboarding
- First-time user experience clarity
- Time to value (how quickly users see value)
- Clarity of next steps
- Feature discovery effectiveness

### Feature Discovery
- How easily users find features
- How well features are explained
- Onboarding tooltips and guidance quality

### Task Completion
- Success rate for key user journeys
- Number of steps to complete tasks
- Error recovery effectiveness

### Error Prevention
- How well UI prevents user errors
- Error message clarity
- Recovery path clarity

### Visual Hierarchy
- Clarity of information architecture
- Visual organization
- Content prioritization

### Responsive Design
- Mobile experience quality
- Tablet experience quality
- Desktop experience quality
- Consistency across devices

### Accessibility
- Keyboard navigation support
- Screen reader support
- Focus management
- ARIA labels and semantic HTML

## Target Scores

**Minimum Acceptable Scores:**
- Clarity: 8/10
- Efficiency: 7/10
- Delight: 7/10
- Completion Rate: 80%+ for key flows
- Error Rate: <10% for key flows

**Benchmark Targets:**
- Match or exceed Typeless onboarding clarity (9/10)
- Match or exceed Lovable product creation flow (8/10)
- Match or exceed Cursor feature execution (8/10)

## Acceptance Criteria
- [ ] Market research on Typeless, Lovable, Cursor, and 5-10 other products
- [ ] Automated page-by-page analysis of NexSpark frontend
- [ ] Storyboard generation from page flows
- [ ] Benchmark comparison and gap analysis
- [ ] Comprehensive evaluation reports with recommendations
- [ ] Automated implementation of high-priority improvements
- [ ] Re-evaluation after improvements to measure gains
- [ ] Integration with build loop (triggers after Phase 10.10)
- [ ] Scheduled weekly evaluations
- [ ] Score tracking over time
- [ ] Pattern library of UX best practices

## Dependencies
- puppeteer or playwright (Browser automation)
- @anthropic-ai/sdk (Claude API for analysis)
- cheerio or jsdom (HTML parsing)
- mermaid (Diagram generation)
- pg (PostgreSQL for storage)
