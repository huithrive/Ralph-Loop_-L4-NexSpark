# Strategist Module - GTM Report Generator

## Purpose
Synthesize research and interview data into a comprehensive Go-to-Market strategy report.

## Requirements

### Inputs
1. Research data from Deep Research Engine (JSON)
2. Interview analysis from Voice Interview Agent (JSON)
3. User profile data (name, email, brand name)
4. Optional: Brand assets (logo, colors, product images)

### Report Sections

**1. Executive Summary** (1 page)
- Market opportunity overview
- Target audience snapshot
- Recommended strategy summary (2-3 sentences)
- 90-day revenue projection to $10K
- Key success metrics

**2. Market Analysis** (2-3 pages)
- Market size and growth trends (TAM/SAM/SOM)
- Competitive landscape (competitor matrix, positioning map)
- Market gaps and opportunities
- Threats and challenges with mitigation

**3. Target Customer Personas** (2 pages)
- Primary persona: demographics, psychographics, pain points, goals, buying behavior
- Secondary persona: condensed version
- Persona cards with visuals

**4. Channel Strategy** (2 pages)
For top 3 recommended channels:
- Rationale based on persona
- Target audience on channel
- Content strategy (creative types, messaging)
- Budget allocation (daily budget, expected CPA/ROAS)
- Success metrics and benchmarks
- Quick start checklist

**5. 90-Day Growth Roadmap** (1-2 pages)

Phase 1: Foundation (Weeks 1-4)
- Week 1: Setup and preparation
- Week 2: Testing and validation
- Week 3: Optimization
- Week 4: Scale preparation
- Milestone: $1K revenue

Phase 2: Scale (Weeks 5-8)
- Week 5-6: Channel expansion
- Week 7-8: Acceleration
- Milestone: $3K-5K revenue

Phase 3: Accelerate (Weeks 9-12)
- Week 9-10: Maximize ROAS
- Week 11-12: Sprint to goal
- Milestone: $10K revenue

**6. Budget Allocation Framework** (1 page)
- Recommended monthly budget
- Allocation by channel (percentages and amounts)
- Budget scaling plan (when and how to increase)
- ROI projections by phase

**7. Success Metrics & KPIs** (1 page)
- Primary KPI: $10,000 revenue in 90 days
- Secondary KPIs: ROAS (3-5x target), CPA, Conversion Rate, AOV
- Weekly tracking framework
- Red flags and green flags

### Output Formats

**Format 1: PDF Report**
- Professional design, print-friendly
- 8-12 pages total
- Bookmarked sections
- Charts and visualizations
- User's brand colors/logo if provided

**Format 2: Interactive Dashboard**
- Web-based, responsive
- Clickable sections
- Interactive charts (hover for details)
- Editable assumptions
- Progress tracking integration

**Format 3: JSON Export**
- Structured data for downstream modules
- All report data accessible

## Technical Requirements

### API Endpoint
POST /api/strategist/report/generate

Request Body:
{
  "researchId": "uuid",
  "interviewId": "uuid",
  "userId": "uuid",
  "options": {
    "includeBrandAssets": "boolean",
    "format": "pdf|dashboard|both"
  }
}

### Processing Steps
1. Fetch research and interview data
2. Synthesize using Claude AI
3. Generate report content
4. Create visualizations
5. Generate PDF (if requested)
6. Generate dashboard HTML (if requested)
7. Store report in database
8. Return report URLs

### Claude Synthesis Prompt
Use Claude to analyze research + interview and create actionable GTM strategy tailored to user's constraints (time, budget, experience) and aligned with $10K/90-day goal.

### PDF Generation
- Library: Puppeteer or PDFKit
- Charts: Chart.js (render to canvas, export to image)
- Quality: 300 DPI
- File size: <5MB

### Dashboard
- Framework: React
- Charts: Recharts or Chart.js
- Styling: Tailwind CSS
- Load time: <3s

### Database Table: gtm_reports
- id (UUID, primary key)
- user_id (UUID, foreign key)
- research_id (UUID, foreign key)
- interview_id (UUID, foreign key)
- report_data (JSONB)
- pdf_url (TEXT, nullable)
- dashboard_url (TEXT, nullable)
- version (INTEGER, default 1)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### Performance
- Report generation: <60 seconds
- PDF file size: <5MB
- Dashboard load: <3s
- Mobile-responsive

## Acceptance Criteria
- [ ] Successfully combines research + interview data
- [ ] Generates all 7 report sections
- [ ] Creates professional PDF
- [ ] Creates interactive dashboard
- [ ] Stores report in database
- [ ] Returns accessible URLs
- [ ] Content is data-driven and actionable
- [ ] Design is professional and branded
- [ ] Works on mobile devices
- [ ] User can regenerate with updated inputs

## Dependencies
- @anthropic-ai/sdk (Claude)
- puppeteer or pdfkit (PDF generation)
- recharts or chart.js (Charts)
- react (Dashboard)
- handlebars (Template engine, optional)
