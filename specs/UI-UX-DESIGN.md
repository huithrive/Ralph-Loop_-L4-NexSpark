# NexSpark UI/UX Design Document
## Complete Design System & User Experience Specification

**Version:** 1.0
**Created:** January 2025
**Purpose:** Complete UI/UX specification for NexSpark AI Growth OS frontend development

---

## 1. Design System & Visual Identity

### 1.1 Design Philosophy
NexSpark embodies a **sci-fi cyberpunk aesthetic** with retro-futuristic elements inspired by LCARS (Star Trek) interface design. The visual identity positions NexSpark as an "AI Growth Operating System" rather than just a service, emphasizing premium AI technology through:

- **Immersive dark environment** with luminous interface elements
- **Gold/blue color harmony** suggesting premium technology
- **Geometric typography** with hard edges and fluid animations
- **Depth through layered transparency** creating sophisticated visual hierarchy

### 1.2 Color Palette & Design Tokens

#### Primary Colors
```css
:root {
  /* Brand Colors */
  --primary-gold: #FF9C00;
  --primary-blue: #99CCFF;
  --accent-purple: #CC99CC;
  --alert-red: #CC3333;
  --pale-gold: #FFCC99;

  /* Backgrounds */
  --bg-primary: #000000;
  --bg-surface: rgba(20, 20, 25, 0.9);
  --bg-overlay: rgba(0, 0, 0, 0.8);

  /* Text */
  --text-primary: #99CCFF;
  --text-secondary: #FFFFFF;
  --text-muted: rgba(153, 204, 255, 0.7);

  /* Functional Colors */
  --success: #00CC66;
  --warning: #FF9C00;
  --error: #CC3333;
  --info: #99CCFF;

  /* Borders & Accents */
  --border-gold: #FF9C00;
  --border-blue: #99CCFF;
  --border-subtle: rgba(153, 204, 255, 0.2);
}
```

#### Color Usage Guidelines
- **Gold (#FF9C00)**: Primary CTAs, active states, progress indicators, scrollbars
- **Blue (#99CCFF)**: Body text, secondary CTAs, links, data displays
- **Black/Dark**: Primary backgrounds, creating depth and focus
- **Purple (#CC99CC)**: Tertiary accents, special states
- **Red (#CC3333)**: Error states, alerts, warnings

### 1.3 Typography System

#### Font Stack
```css
/* Primary UI Font */
font-family: 'Rajdhani', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Display/Headers Font */
font-family: 'Antonio', 'Rajdhani', -apple-system, BlinkMacSystemFont, sans-serif;

/* Monospace/Code Font */
font-family: 'JetBrains Mono', 'SF Mono', Monaco, 'Cascadia Code', monospace;
```

#### Typography Scale
```css
/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-bold: 700;
--font-black: 900;

/* Letter Spacing */
--tracking-tight: -0.025em;
--tracking-normal: 0;
--tracking-wide: 0.025em;
--tracking-wider: 0.05em;
--tracking-widest: 0.125em; /* 2px equivalent for buttons */
```

### 1.4 Spacing & Layout System

#### Spacing Scale
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px - Primary spacing unit */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

#### Border Radius
```css
--radius-none: 0;
--radius-sm: 0.25rem;   /* 4px */
--radius-base: 0.375rem; /* 6px */
--radius-md: 0.5rem;    /* 8px */
--radius-lg: 0.75rem;   /* 12px */
--radius-xl: 1rem;      /* 16px */
--radius-2xl: 1.5rem;   /* 24px - LCARS style */
--radius-full: 9999px;
```

#### Container & Grid System
```css
/* Responsive Containers */
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1536px;

/* Grid Gutters */
--grid-gap: 1.5rem; /* 24px */
--grid-gap-sm: 1rem; /* 16px */
--grid-gap-lg: 2rem; /* 32px */
```

### 1.5 Component Design Language

#### Button Components
```css
.btn {
  font-family: 'Antonio', sans-serif;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: var(--tracking-widest); /* 2px */
  transition: all 0.2s ease;
  border-radius: var(--radius-base);
  padding: var(--space-3) var(--space-6);
}

.btn-primary {
  background: var(--primary-gold);
  color: var(--bg-primary);
  border: 2px solid var(--primary-gold);
}

.btn-primary:hover {
  filter: brightness(1.2);
  transform: translateX(5px);
}

.btn-secondary {
  background: transparent;
  color: var(--primary-blue);
  border: 2px solid var(--primary-blue);
}

.btn-ghost {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-subtle);
}
```

#### Card Components
```css
.card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  backdrop-filter: blur(10px);
  padding: var(--space-6);
  transition: all 0.3s ease;
}

.card:hover {
  border-color: var(--primary-gold);
  box-shadow: 0 8px 32px rgba(255, 156, 0, 0.1);
}

.card-header {
  border-bottom: 1px solid var(--border-subtle);
  padding-bottom: var(--space-4);
  margin-bottom: var(--space-6);
}
```

#### LCARS-Style Bracket Components
```css
.lcars-bracket {
  border-left: 12px solid var(--primary-gold);
  border-top: 12px solid var(--primary-gold);
  border-top-left-radius: var(--radius-2xl); /* 24px */
  padding-left: var(--space-5); /* 20px */
  padding-top: var(--space-5); /* 20px */
}

.lcars-accent {
  position: relative;
}

.lcars-accent::before {
  content: '';
  position: absolute;
  left: -12px;
  top: 0;
  width: 8px;
  height: 100%;
  background: var(--primary-gold);
}
```

#### Form Components
```css
.form-input {
  background: rgba(20, 20, 25, 0.6);
  border: 2px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-family: 'Rajdhani', sans-serif;
  padding: var(--space-3) var(--space-4);
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-gold);
  box-shadow: 0 0 0 3px rgba(255, 156, 0, 0.1);
}

.form-label {
  color: var(--text-primary);
  font-weight: var(--font-medium);
  margin-bottom: var(--space-2);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
}
```

#### Custom Scrollbar
```css
/* WebKit Scrollbar */
::-webkit-scrollbar {
  width: 12px;
}

::-webkit-scrollbar-track {
  background: var(--bg-primary);
}

::-webkit-scrollbar-thumb {
  background: var(--primary-gold);
  border-radius: 6px;
  border: 2px solid var(--bg-primary);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--pale-gold);
}
```

---

## 2. Information Architecture & Navigation

### 2.1 Application Structure

```
NexSpark AI Growth OS
├── 🏠 Dashboard (Overview & Quick Actions)
├── 🎯 Strategist (Module 1)
│   ├── Research Engine
│   ├── Voice Interview
│   └── GTM Reports
├── ⚡ Executor (Module 2)
│   ├── Landing Pages
│   ├── Shopify Store
│   ├── Domain Setup
│   └── Creative Studio
├── 📢 Advertiser (Module 3)
│   ├── Account Connections
│   ├── Meta Pixel Setup
│   ├── Campaign Builder
│   └── Ad Management
├── 📊 Analyzer (Module 4)
│   ├── Performance Dashboard
│   ├── Real-time Monitoring
│   ├── Optimization Engine
│   └── Weekly Reports
└── ⚙️ Settings
    ├── Account & Billing
    ├── API Credentials
    ├── Team Management
    └── Preferences
```

### 2.2 Navigation Patterns

#### Primary Navigation
- **Top Navigation Bar**: Logo, Module tabs, User avatar/menu
- **Module Tabs**: Strategist | Executor | Advertiser | Analyzer
- **Active State**: Gold underline with animated transition
- **Mobile**: Hamburger menu with slide-out drawer

#### Secondary Navigation
- **Sidebar**: Context-sensitive navigation within each module
- **Breadcrumbs**: Show current location within module flow
- **Progress Indicators**: Step-by-step progress for multi-stage flows

#### Quick Actions
- **Dashboard Widgets**: Direct shortcuts to common tasks
- **Floating Action Buttons**: Primary action for each screen
- **Command Palette**: Cmd+K for power users (search + shortcuts)

---

## 3. User Flows by Module

### 3.1 Module 1: Strategist Flow

#### Research → Interview → GTM Report

**Step 1: Market Research**
```
Landing on Research Engine
├── URL Input Field (primary focus)
├── Product Description Textarea
├── "Start Research" CTA (primary gold button)
└── Previous Research History (cards)

Research Processing
├── Progress Animation (animated dots/spinner)
├── Status Updates ("Analyzing website...", "Identifying competitors...")
├── Estimated Time Remaining
└── Cancel Option

Research Results
├── Market Size Overview (hero metrics)
├── Competitor Analysis (card grid)
├── Target Audience Profile (persona cards)
├── Recommended Channels (priority list)
├── Pain Points Analysis (tag cloud)
└── "Start Interview" CTA (next step)
```

**Step 2: Voice Interview**
```
Interview Setup
├── Research Summary Preview
├── Interview Overview (4 questions, ~10 minutes)
├── Microphone Permission Request
└── "Begin Interview" CTA

Interview Session
├── Question Progress (1/4, 2/4, 3/4, 4/4)
├── Current Question Display (large, readable)
├── Voice Recording Controls (record/stop/play)
├── Text Response Option (fallback)
├── "Next Question" / "Previous Question"
└── Real-time Transcript Display

Interview Analysis
├── Processing Animation
├── "Analyzing responses..." status
├── Transcript Review (editable)
└── Analysis Results Preview
```

**Step 3: GTM Report Generation**
```
Report Configuration
├── Research + Interview Summary
├── Report Options (sections, detail level, format)
├── Brand Assets Upload (logo, colors, fonts)
└── "Generate Report" CTA

Report Processing
├── Section-by-section progress indicator
├── Current section status ("Generating Market Analysis...")
├── Preview snippets as sections complete
└── Estimated completion time

Report Viewer
├── Navigation Sidebar (7 sections)
├── Executive Summary (overview)
├── Market Analysis (charts, data)
├── Target Audience Profiles (detailed personas)
├── Competitive Landscape (comparison tables)
├── Channel Strategy (prioritized roadmap)
├── 90-Day Action Plan (timeline view)
├── KPIs & Metrics (measurement framework)
├── Export Options (PDF, sharing, editing)
└── "Start Building" CTA → Executor Module
```

### 3.2 Module 2: Executor Flow

#### Landing Pages → Shopify → Creatives

**Step 1: Landing Page Builder**
```
Landing Page Setup
├── GTM Report Integration (auto-populate)
├── Template Selection (industry-specific)
├── Brand Assets Upload (logo, images, colors)
├── Value Proposition Editor
├── Target Audience Selector (from research)
└── "Generate Page" CTA

Page Generation
├── Progress Indicator (Lovable API processing)
├── "Building your landing page..." status
├── Preview Generation (real-time)
└── Estimated completion time

Page Review & Edit
├── Live Preview (responsive)
├── Edit Options (copy, images, layout)
├── A/B Testing Setup
├── SEO Configuration
├── Domain Connection Status
└── "Publish Page" / "Connect Store" CTAs
```

**Step 2: Shopify Store Setup**
```
Shopify Connection
├── OAuth Connect Button (primary)
├── Connection Status Display
├── Permissions Overview
└── "Connect Shopify" CTA

Store Configuration
├── Product Auto-Generation (from GTM report)
├── Category Setup (automated)
├── Pricing Strategy (from research)
├── Inventory Management
├── Payment Gateway Setup
└── Shipping Configuration

Product Creation
├── GTM-Based Product Ideas (auto-generated)
├── Product Editor (images, descriptions, pricing)
├── Bulk Actions (edit multiple)
├── SEO Optimization (auto-generated)
└── "Sync Products" CTA
```

**Step 3: Creative Studio**
```
Creative Generation
├── Project Overview (campaign integration)
├── Image Upload Area (drag & drop)
├── Prompt Editor (AI assistance)
├── Style Selection (anime, 3d, clay, cyberpunk, comic)
├── Video Configuration (duration, quality, motion)
├── Camera Movement Options
└── "Generate Creative" CTA

Generation Processing
├── Queue Position & Wait Time
├── Progress Stages (upload → generate → render → download)
├── Real-time Status Updates
├── Preview Generation (low-res preview while processing)
└── Cancel/Retry Options

Creative Library
├── Generated Assets Gallery (grid view)
├── Filter & Sort (by style, date, status)
├── Preview Player (video playback)
├── Download Options (multiple formats)
├── Usage Tracking (where used in campaigns)
└── "Use in Campaign" CTA → Advertiser Module
```

### 3.3 Module 3: Advertiser Flow

#### Account Connections → Pixel Setup → Campaign Creation

**Step 1: Account Connections**
```
Connection Dashboard
├── Platform Status Cards (Meta BM, Google Ads, Shopify)
├── OAuth Connect Buttons
├── Connection Health Indicators
├── Permissions Overview
└── Account Settings

OAuth Flow
├── Platform Selection (Meta/Google/Shopify)
├── Redirect to Platform (external OAuth)
├── Permission Grant (platform-specific)
├── Callback Handling (success/error states)
├── Connection Verification
└── Success Confirmation

Account Management
├── Connected Accounts List
├── Permission Audit (read/write access)
├── Token Status (valid/expired/refresh needed)
├── Disconnect Options
└── Troubleshooting Guide
```

**Step 2: Meta Pixel Installation**
```
Pixel Setup Overview
├── Shopify Store Status
├── Pixel Installation Guide
├── Event Tracking Preview
└── "Install Pixel" CTA

Installation Process
├── Automatic Script Injection
├── Installation Verification
├── Test Event Firing
├── Standard Events Configuration
├── Custom Events Setup (optional)
└── Verification Dashboard

Pixel Health Dashboard
├── Firing Status (real-time)
├── Event Volume (last 24h/7d/30d)
├── Event Types Tracking
├── Error Detection
├── Recommendations
└── Test Event Tool
```

**Step 3: Campaign Builder**
```
Campaign Setup
├── Platform Selection (Meta/Google/Both)
├── Campaign Objective (conversions/traffic/awareness)
├── Target Audience (from research data)
├── Budget Configuration (daily/lifetime)
├── Schedule Settings
└── Campaign Naming

Ad Creation
├── Creative Selection (from Executor library)
├── Ad Copy Editor (AI-assisted)
├── Call-to-Action Options
├── Landing Page Selector
├── Preview Renderer (platform-specific)
└── A/B Testing Setup

Campaign Review
├── Campaign Summary (all settings)
├── Budget Projection
├── Audience Size Estimate
├── Expected Performance (estimated reach/impressions)
├── Approval Checklist
└── "Launch Campaign" CTA → Analyzer Module
```

### 3.4 Module 4: Analyzer Flow

#### Performance Dashboard → Optimization → Reporting

**Step 1: Performance Dashboard**
```
Dashboard Overview
├── Campaign Performance Cards
├── Key Metrics Summary (ROAS, CPA, CTR, Spend)
├── Goal Progress (toward $10K target)
├── Quick Action Buttons
└── Real-time Status Indicators

Campaign Performance
├── Campaign Selector (dropdown/tabs)
├── Time Range Picker (24h/7d/30d/custom)
├── Metric Charts (interactive)
├── Platform Comparison (Meta vs Google)
├── Creative Performance Breakdown
└── Audience Insights

Real-time Monitoring
├── Live Metrics Dashboard
├── Alert Notifications
├── Performance Anomaly Detection
├── Budget Burn Rate
├── Optimization Opportunities
└── Auto-refresh Settings
```

**Step 2: Optimization Engine**
```
Optimization Hub
├── Campaign Health Overview
├── Automated Recommendations
├── Manual Optimization Tools
├── A/B Test Results
└── Historical Performance

Recommendation System
├── AI-Generated Suggestions
├── Impact Predictions
├── Effort vs Benefit Analysis
├── One-click Apply Options
├── Custom Optimization Rules
└── Approval Workflow

Optimization Actions
├── Budget Reallocation
├── Audience Refinement
├── Ad Creative Rotation
├── Bid Strategy Adjustment
├── Schedule Optimization
└── Performance Tracking
```

**Step 3: Weekly Reports**
```
Report Generation
├── Automated Report Schedule
├── Custom Report Builder
├── Stakeholder Distribution
├── Executive Summary
└── Detailed Breakdowns

Report Viewer
├── Executive Summary (key insights)
├── Performance Trends (charts/graphs)
├── Campaign Breakdown (by platform)
├── Optimization Impact
├── Goals Progress
├── Next Steps Recommendations
└── Export/Share Options
```

---

## 4. Screen-by-Screen Specifications

### 4.1 Dashboard (Home)

#### Layout Structure
```
Header
├── NexSpark Logo (left)
├── Module Navigation (center)
├── User Avatar & Settings (right)
└── Progress Bar (global completion status)

Hero Section
├── Welcome Message ("Good morning, [Name]")
├── Current Project Status
├── Next Recommended Action (primary CTA)
└── Goal Progress (toward $10K goal)

Quick Actions Grid (4x2 layout)
├── Start New Research
├── View Latest Report
├── Create Campaign
├── Check Performance
├── Generate Creative
├── Review Optimization
├── Export Report
└── Account Settings

Recent Activity Feed
├── Latest Actions (chronological)
├── System Notifications
├── Performance Alerts
└── Recommendation Updates

Status Overview Cards
├── Module Completion Status
├── Active Campaigns Summary
├── Current Month Performance
└── System Health
```

#### Component States

**Loading State**
- Skeleton loading for all cards
- Shimmer animation
- Progress indicators for data fetching

**Empty State**
- Welcome illustration
- "Get started" guidance
- Primary CTA to begin first research

**Error State**
- Error message with retry option
- Fallback to cached data if available
- Support contact information

**Success State**
- All data loaded and displayed
- Interactive elements active
- Real-time updates enabled

### 4.2 Research Engine (Strategist)

#### Market Research Form
```
Form Container (centered, max-width 800px)
├── Page Header
│   ├── Title: "Market Research Engine"
│   ├── Subtitle: "AI-powered analysis of your market opportunity"
│   └── Progress: "Step 1 of 3"
├── URL Input Section
│   ├── Label: "Website URL"
│   ├── Input Field (large, prominent)
│   ├── Validation Messages
│   └── Example: "e.g., https://yoursite.com"
├── Product Description Section
│   ├── Label: "Product Description"
│   ├── Textarea (expandable)
│   ├── Character Counter (max 5000)
│   └── AI Writing Assistant (optional)
├── Advanced Options (collapsible)
│   ├── Market Focus (global/regional/local)
│   ├── Competitor Depth (basic/detailed)
│   └── Analysis Timeline (immediate/deep)
└── Action Section
    ├── "Start Research" Button (primary, prominent)
    ├── "Save Draft" Button (secondary)
    └── Previous Research History Link
```

#### Research Results Display
```
Results Container (full-width layout)
├── Header Section
│   ├── Research Summary
│   ├── Confidence Score
│   ├── Export Options (PDF, JSON, Share)
│   └── "Start Interview" CTA
├── Market Size Overview (hero section)
│   ├── TAM (Total Addressable Market)
│   ├── SAM (Serviceable Addressable Market)
│   ├── SOM (Serviceable Obtainable Market)
│   └── Growth Projections Chart
├── Competitor Analysis (card grid)
│   ├── Competitor Cards (logo, name, strengths/weaknesses)
│   ├── Market Position Map (2D scatter plot)
│   ├── Feature Comparison Table
│   └── Competitive Advantage Opportunities
├── Target Audience Profile (persona cards)
│   ├── Primary Persona (detailed)
│   ├── Secondary Personas (summary)
│   ├── Demographic Breakdown
│   └── Behavioral Insights
├── Recommended Channels (priority list)
│   ├── Channel Cards (platform, cost, effort, impact)
│   ├── Channel Strategy Roadmap
│   └── Budget Allocation Recommendations
└── Pain Points Analysis
    ├── Pain Point Categories
    ├── Severity vs Frequency Matrix
    └── Solution Opportunity Mapping
```

### 4.3 Interview Session (Strategist)

#### Interview Interface
```
Interview Container (centered, focused layout)
├── Header Section
│   ├── Progress Indicator (1/4, 2/4, 3/4, 4/4)
│   ├── Session Timer
│   └── Exit/Save Options
├── Question Section (prominent)
│   ├── Question Number & Category
│   ├── Question Text (large, readable)
│   ├── Context/Help Text (if needed)
│   └── Example Responses (optional)
├── Response Section
│   ├── Voice Recording Controls
│   │   ├── Record Button (prominent, animated when active)
│   │   ├── Playback Controls
│   │   └── Recording Status (time, waveform visualization)
│   ├── Text Response Option
│   │   ├── Textarea (backup/supplement to voice)
│   │   └── AI Transcription (if voice is used)
│   └── Response Quality Indicator
├── Navigation Section
│   ├── "Previous Question" (if not first)
│   ├── "Next Question" / "Finish Interview"
│   └── "Save & Continue Later"
└── Sidebar (optional, collapsible)
    ├── All Questions Overview
    ├── Completion Status
    └── Research Summary Reference
```

#### Interview Analysis Results
```
Analysis Container (full-width layout)
├── Header Section
│   ├── Analysis Summary
│   ├── Interview Transcript (expandable)
│   ├── Edit/Refine Options
│   └── "Generate GTM Report" CTA
├── Brand Positioning Analysis
│   ├── Current Positioning
│   ├── Recommended Positioning
│   ├── Differentiation Opportunities
│   └── Brand Personality Profile
├── Channel Preferences
│   ├── Current Channel Mix
│   ├── Channel Performance Assessment
│   ├── Recommended Channel Strategy
│   └── Channel Optimization Opportunities
├── Growth Priorities
│   ├── Priority Matrix (impact vs effort)
│   ├── Timeline Recommendations
│   ├── Resource Requirements
│   └── Success Metrics
└── Strategic Insights
    ├── Key Findings Summary
    ├── Strategic Recommendations
    ├── Risk Assessment
    └── Implementation Roadmap
```

### 4.4 GTM Report Viewer (Strategist)

#### Report Layout
```
Report Container (document-style layout)
├── Header Section
│   ├── Report Title & Date
│   ├── Executive Summary Preview
│   ├── Export Options (PDF, Share, Print)
│   └── Edit/Regenerate Options
├── Navigation Sidebar
│   ├── Section Navigation (7 sections)
│   ├── Progress Indicator
│   ├── Search Within Report
│   └── Bookmark Feature
├── Content Area (scrollable)
│   ├── Executive Summary
│   │   ├── Key Findings
│   │   ├── Market Opportunity Size
│   │   ├── Recommended Strategy
│   │   └── Success Probability
│   ├── Market Analysis
│   │   ├── Market Size & Growth
│   │   ├── Market Trends
│   │   ├── Competitive Landscape
│   │   └── Market Opportunity Assessment
│   ├── Target Audience Profile
│   │   ├── Primary Customer Personas
│   │   ├── Customer Journey Mapping
│   │   ├── Pain Points & Motivations
│   │   └── Behavioral Insights
│   ├── Competitive Landscape
│   │   ├── Competitive Analysis
│   │   ├── Market Position Map
│   │   ├── Competitive Advantages
│   │   └── Differentiation Strategy
│   ├── Channel Strategy
│   │   ├── Channel Prioritization
│   │   ├── Channel-Specific Strategies
│   │   ├── Budget Allocation
│   │   └── Channel Integration Plan
│   ├── 90-Day Action Plan
│   │   ├── Phase 1: Foundation (Days 1-30)
│   │   ├── Phase 2: Launch (Days 31-60)
│   │   ├── Phase 3: Scale (Days 61-90)
│   │   └── Timeline & Milestones
│   └── KPIs & Metrics
│       ├── Success Metrics Framework
│       ├── Measurement Plan
│       ├── Reporting Schedule
│       └── Performance Benchmarks
└── Footer Actions
    ├── "Implement with Executor" CTA
    ├── Share with Team
    └── Schedule Review
```

### 4.5 Landing Page Builder (Executor)

#### Page Builder Interface
```
Builder Container (split-screen layout)
├── Control Panel (left sidebar, 30%)
│   ├── Template Library
│   ├── Brand Assets Upload
│   ├── Content Editor
│   ├── Design Customization
│   └── SEO Settings
├── Preview Area (center, 70%)
│   ├── Device Preview (desktop/tablet/mobile)
│   ├── Live Preview
│   ├── Interaction Testing
│   └── Loading Performance
└── Publishing Panel (right sidebar, expandable)
    ├── Domain Configuration
    ├── Analytics Setup
    ├── A/B Testing
    └── Publication Controls
```

#### Template Selection
```
Template Gallery (grid layout)
├── Category Filter
│   ├── Industry Categories
│   ├── Use Case Types
│   ├── Complexity Levels
│   └── Design Styles
├── Template Cards
│   ├── Preview Thumbnail
│   ├── Template Name
│   ├── Features List
│   ├── Customization Level
│   └── "Use Template" CTA
├── Custom Template Option
│   ├── AI-Generated Template
│   ├── Upload Own Design
│   └── Start from Scratch
└── Template Preview Modal
    ├── Full-Size Preview
    ├── Responsive Views
    ├── Feature Highlights
    └── "Select & Customize" CTA
```

### 4.6 Shopify Store Setup (Executor)

#### OAuth Connection Flow
```
Connection Page (centered layout)
├── Header Section
│   ├── Shopify Logo & NexSpark Integration
│   ├── Connection Benefits
│   └── Security Assurance
├── Connection Status
│   ├── Current Status Indicator
│   ├── Previous Connection History
│   └── Troubleshooting Links
├── Permission Overview
│   ├── Required Permissions List
│   ├── Data Usage Explanation
│   └── Privacy Policy
├── Connection Actions
│   ├── "Connect to Shopify" CTA (primary)
│   ├── Alternative Connection Methods
│   └── Skip/Manual Setup Option
└── Support Section
    ├── Common Issues
    ├── Contact Support
    └── Documentation Links
```

#### Store Configuration Dashboard
```
Configuration Container (tabbed interface)
├── Store Overview Tab
│   ├── Store Health Check
│   ├── Integration Status
│   ├── Sync Status
│   └── Performance Metrics
├── Product Management Tab
│   ├── Auto-Generated Products (from GTM)
│   ├── Bulk Product Editor
│   ├── Category Management
│   ├── Inventory Sync
│   └── SEO Optimization
├── Settings Tab
│   ├── Payment Gateway Setup
│   ├── Shipping Configuration
│   ├── Tax Settings
│   └── Store Policies
├── Marketing Tab
│   ├── Meta Pixel Integration
│   ├── Email Marketing Setup
│   ├── Discount Code Management
│   └── Customer Segmentation
└── Analytics Tab
    ├── Sales Performance
    ├── Traffic Analysis
    ├── Conversion Metrics
    └── Customer Behavior
```

### 4.7 Creative Studio (Executor)

#### Creative Generation Interface
```
Studio Container (workspace layout)
├── Project Panel (left sidebar)
│   ├── Current Project Info
│   ├── Asset Library
│   ├── Recent Generations
│   └── Project Settings
├── Creation Area (center)
│   ├── Image Upload Zone
│   │   ├── Drag & Drop Area
│   │   ├── Upload Progress
│   │   ├── Image Preview
│   │   └── Format Validation
│   ├── Prompt Editor
│   │   ├── Text Input Area
│   │   ├── AI Suggestions
│   │   ├── Prompt Templates
│   │   └── Character Counter
│   ├── Style Configuration
│   │   ├── Style Selection (visual grid)
│   │   ├── Quality Settings
│   │   ├── Duration Options
│   │   └── Advanced Settings
│   └── Generation Controls
│       ├── "Generate Video" CTA
│       ├── Queue Position
│       └── Cost Estimate
└── Preview Panel (right sidebar)
    ├── Generation Preview
    ├── Style Examples
    ├── Similar Results
    └── Improvement Suggestions
```

#### Creative Library
```
Library Container (gallery layout)
├── Filter & Sort Controls
│   ├── Date Range Picker
│   ├── Style Filter
│   ├── Status Filter
│   ├── Quality Filter
│   └── Sort Options
├── Asset Grid
│   ├── Asset Cards
│   │   ├── Preview Thumbnail/Video
│   │   ├── Generation Details
│   │   ├── Status Indicator
│   │   ├── Download Options
│   │   └── Usage Tracking
│   ├── Bulk Actions
│   ├── Selection Tools
│   └── Grid/List View Toggle
├── Asset Details Modal
│   ├── Full Preview Player
│   ├── Generation Parameters
│   ├── Download Options
│   ├── Share Links
│   ├── Edit/Regenerate
│   └── Usage Analytics
└── Management Actions
    ├── Bulk Export
    ├── Organize Collections
    ├── Archive/Delete
    └── Integration Options
```

### 4.8 Campaign Builder (Advertiser)

#### Account Connection Dashboard
```
Connection Container (card-based layout)
├── Platform Cards (3-column grid)
│   ├── Meta Business Manager Card
│   │   ├── Connection Status
│   │   ├── Account Details
│   │   ├── Permissions Status
│   │   ├── "Connect" / "Manage" CTA
│   │   └── Health Indicators
│   ├── Google Ads Card
│   │   ├── Connection Status
│   │   ├── Account Details
│   │   ├── API Quota Usage
│   │   ├── "Connect" / "Manage" CTA
│   │   └── Health Indicators
│   └── Shopify Card
│       ├── Store Connection Status
│       ├── Store Details
│       ├── Sync Status
│       ├── "Connect" / "Manage" CTA
│       └── Health Indicators
├── Global Actions
│   ├── "Connect All Accounts"
│   ├── Account Health Check
│   └── Troubleshooting Guide
└── Connection History
    ├── Recent Connections
    ├── Failed Attempts
    └── Support Tickets
```

#### Campaign Creation Flow
```
Campaign Builder (step-by-step wizard)
├── Step 1: Platform & Objective
│   ├── Platform Selection (Meta/Google/Both)
│   ├── Objective Selection (conversions/traffic/awareness)
│   ├── Campaign Type
│   └── Naming Convention
├── Step 2: Audience Targeting
│   ├── Audience Source (Research/Custom/Lookalike)
│   ├── Demographic Targeting
│   ├── Interest Targeting
│   ├── Behavioral Targeting
│   ├── Geographic Targeting
│   └── Audience Size Estimate
├── Step 3: Budget & Schedule
│   ├── Budget Type (daily/lifetime)
│   ├── Budget Amount
│   ├── Bid Strategy
│   ├── Schedule Settings
│   └── Budget Recommendations
├── Step 4: Ad Creative
│   ├── Creative Selection (from library)
│   ├── Ad Copy Editor
│   ├── CTA Button Options
│   ├── Landing Page Selection
│   └── Ad Preview
├── Step 5: Review & Launch
│   ├── Campaign Summary
│   ├── Cost Projection
│   ├── Performance Estimates
│   ├── Approval Checklist
│   └── "Launch Campaign" CTA
└── Navigation
    ├── Progress Indicator
    ├── Step Navigation
    ├── Save Draft
    └── Previous/Next Controls
```

### 4.9 Performance Dashboard (Analyzer)

#### Main Dashboard Layout
```
Dashboard Container (widget-based layout)
├── Header Controls
│   ├── Time Range Picker
│   ├── Campaign Filter
│   ├── Platform Filter
│   ├── Refresh Controls
│   └── Export Options
├── KPI Overview (top row, 4 widgets)
│   ├── Total Spend Widget
│   ├── Total Revenue Widget
│   ├── ROAS Widget
│   ├── Conversion Rate Widget
├── Performance Charts (second row, 2 widgets)
│   ├── Performance Trend Chart
│   └── Channel Comparison Chart
├── Campaign Performance (third row, full width)
│   ├── Campaign Performance Table
│   ├── Sort & Filter Controls
│   └── Drill-down Options
├── Goal Progress (fourth row, 2 widgets)
│   ├── $10K Goal Progress
│   └── Monthly Targets
└── Recent Activity (sidebar)
    ├── Latest Optimizations
    ├── Performance Alerts
    └── Recommendations
```

#### Campaign Detail View
```
Detail Container (comprehensive layout)
├── Campaign Header
│   ├── Campaign Name & Status
│   ├── Platform Indicators
│   ├── Last Updated
│   └── Quick Actions
├── Performance Summary (metrics row)
│   ├── Impressions
│   ├── Clicks
│   ├── CTR
│   ├── CPC
│   ├── Conversions
│   ├── CPA
│   ├── Revenue
│   └── ROAS
├── Performance Charts
│   ├── Time Series Chart (configurable metrics)
│   ├── Funnel Analysis
│   └── Attribution Analysis
├── Ad Performance Table
│   ├── Ad Set/Group Breakdown
│   ├── Individual Ad Performance
│   ├── Creative Performance
│   └── Audience Performance
├── Optimization Insights
│   ├── AI Recommendations
│   ├── Performance Anomalies
│   ├── Optimization Opportunities
│   └── Historical Changes
└── Action Panel
    ├── Budget Adjustments
    ├── Pause/Resume Controls
    ├── Optimization Actions
    └── Export/Share Options
```

---

## 5. API-UI Mapping Table

### 5.1 Module 1: Strategist API Mappings

| UI Action | API Endpoint | HTTP Method | UI Component | Data Flow |
|-----------|--------------|-------------|--------------|-----------|
| Submit Research Request | `/api/strategist/research` | POST | Research Form | Form → API → Results Page |
| View Research Result | `/api/strategist/research/:id` | GET | Research Display | Load → Parse → Display |
| Start Interview | `/api/strategist/interview/start` | POST | Interview Setup | Research ID → Session Creation |
| Submit Interview Response | `/api/strategist/interview/:id/respond` | POST | Interview Interface | Voice/Text → Storage → Next Question |
| Complete Interview | `/api/strategist/interview/:id/complete` | POST | Interview Completion | Analysis → Results |
| Generate GTM Report | `/api/strategist/reports/generate` | POST | Report Generator | Research + Interview → Report |
| View GTM Report | `/api/strategist/reports/:id` | GET | Report Viewer | Load → Format → Display |
| Preview Report Section | `/api/strategist/reports/preview` | POST | Section Preview | Partial Data → Preview |

### 5.2 Module 2: Executor API Mappings

| UI Action | API Endpoint | HTTP Method | UI Component | Data Flow |
|-----------|--------------|-------------|--------------|-----------|
| Generate Landing Page | `/api/executor/landing-pages/generate` | POST | Page Builder | GTM Report → Lovable → Page URL |
| Preview Landing Page | `/api/executor/landing-pages/preview` | POST | Preview Modal | Template + Data → Preview |
| Connect Shopify OAuth | `/api/executor/shopify/oauth/url` | GET | OAuth Button | User → Shopify → Callback |
| Handle OAuth Callback | `/api/executor/shopify/oauth/callback` | GET | Callback Handler | Auth Code → Token Storage |
| Create Shopify Products | `/api/executor/shopify/products` | POST | Product Manager | GTM Data → Product Creation |
| Upload Creative Image | `/api/executor/creative/generate` | POST | Upload Zone | Image + Prompt → Job Creation |
| Check Creative Status | `/api/executor/creative/:id/status` | GET | Status Polling | Job ID → Status Updates |
| List Creative Library | `/api/executor/creatives` | GET | Gallery View | Filter → Asset List |

### 5.3 Module 3: Advertiser API Mappings

| UI Action | API Endpoint | HTTP Method | UI Component | Data Flow |
|-----------|--------------|-------------|--------------|-----------|
| Generate Meta OAuth URL | `/api/advertiser/auth/meta/connect` | GET | Connect Button | User ID → OAuth URL |
| Handle Meta Callback | `/api/advertiser/auth/meta/callback` | GET | Callback Handler | Auth Code → Token Storage |
| Check OAuth Status | `/api/advertiser/auth/status` | GET | Connection Status | User ID → Platform Status |
| Install Meta Pixel | `/api/advertiser/pixel/install` | POST | Pixel Setup | Shop Domain → Script Installation |
| Verify Pixel Status | `/api/advertiser/pixel/verify/:id` | GET | Pixel Health | Pixel ID → Firing Status |
| Create Campaign | `/api/advertiser/campaign/create` | POST | Campaign Builder | Campaign Data → Platform APIs |
| List Campaigns | `/api/advertiser/campaigns` | GET | Campaign List | Filter → Campaign Data |
| Update Campaign Status | `/api/advertiser/campaign/:id/status` | PUT | Campaign Controls | Status Change → Platform Update |

### 5.4 Module 4: Analyzer API Mappings

| UI Action | API Endpoint | HTTP Method | UI Component | Data Flow |
|-----------|--------------|-------------|--------------|-----------|
| Get Performance Data | `/api/analyzer/performance` | GET | Dashboard Widgets | Filters → Metrics → Charts |
| Get Campaign Performance | `/api/analyzer/performance/:id` | GET | Campaign Detail | Campaign ID → Detailed Metrics |
| Run Optimization | `/api/analyzer/optimize/:id` | POST | Optimization Panel | Campaign ID → Recommendations |
| Get Dashboard Data | `/api/analyzer/dashboard/:user_id` | GET | Main Dashboard | User ID → Widget Data |
| Check System Health | `/api/analyzer/health/system` | GET | Status Page | System → Health Indicators |
| Generate Weekly Report | `/api/analyzer/reports/generate` | POST | Report Generator | Date Range → PDF Report |

---

## 6. Responsive Design & Breakpoints

### 6.1 Breakpoint System

```css
/* Responsive Breakpoints */
:root {
  --breakpoint-sm: 640px;   /* Small devices (phones) */
  --breakpoint-md: 768px;   /* Medium devices (tablets) */
  --breakpoint-lg: 1024px;  /* Large devices (laptops) */
  --breakpoint-xl: 1280px;  /* Extra large devices (desktops) */
  --breakpoint-2xl: 1536px; /* 2X large devices (large desktops) */
}

/* Media Query Mixins */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

### 6.2 Mobile-First Approach

#### Layout Adaptations by Screen Size

**Mobile (320px - 640px)**
- Single-column layouts
- Collapsible navigation (hamburger menu)
- Touch-friendly button sizes (44px minimum)
- Simplified data tables (card-based)
- Full-width components
- Stacked form layouts

**Tablet (640px - 1024px)**
- Two-column layouts where appropriate
- Expanded navigation (tab bar)
- Mixed card and table layouts
- Side-by-side forms
- Larger touch targets
- Adaptive spacing

**Desktop (1024px+)**
- Multi-column layouts
- Full navigation exposed
- Data-rich table views
- Advanced filtering
- Hover interactions
- Optimal spacing for productivity

### 6.3 Touch Target Guidelines

```css
/* Touch Target Sizes */
.touch-target {
  min-width: 44px;
  min-height: 44px;
  padding: var(--space-3); /* 12px minimum */
}

/* Interactive Elements */
.button-touch {
  min-height: 48px;
  padding: var(--space-3) var(--space-6);
}

.input-touch {
  min-height: 52px;
  padding: var(--space-4);
}

/* Card Touch Areas */
.card-touch {
  min-height: 72px;
  padding: var(--space-4);
}
```

---

## 7. Accessibility Standards

### 7.1 WCAG 2.1 AA Compliance

#### Color Accessibility
- **Contrast Ratios**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Color Independence**: Never rely solely on color to convey information
- **High Contrast Mode**: Support system high contrast preferences

#### Keyboard Navigation
- **Tab Order**: Logical tab sequence through all interactive elements
- **Focus Indicators**: Visible focus states for all focusable elements
- **Keyboard Shortcuts**: Implement common shortcuts (Escape, Enter, Space)
- **Skip Links**: "Skip to main content" for screen reader users

#### Screen Reader Support
```html
<!-- Semantic HTML Structure -->
<main role="main">
  <header role="banner">
    <nav role="navigation" aria-label="Main navigation">
      <ul>
        <li><a href="/dashboard" aria-current="page">Dashboard</a></li>
        <li><a href="/strategist">Strategist</a></li>
        <li><a href="/executor">Executor</a></li>
        <li><a href="/advertiser">Advertiser</a></li>
        <li><a href="/analyzer">Analyzer</a></li>
      </ul>
    </nav>
  </header>

  <section aria-labelledby="dashboard-title">
    <h1 id="dashboard-title">Performance Dashboard</h1>
    <!-- Content -->
  </section>
</main>
```

#### ARIA Labels and Descriptions
```html
<!-- Form Accessibility -->
<label for="website-url">Website URL</label>
<input
  id="website-url"
  type="url"
  aria-describedby="url-help"
  aria-required="true"
/>
<div id="url-help">Enter the full URL including https://</div>

<!-- Button Accessibility -->
<button
  aria-label="Start market research analysis"
  aria-describedby="research-info"
>
  Start Research
</button>

<!-- Chart Accessibility -->
<div
  role="img"
  aria-labelledby="chart-title"
  aria-describedby="chart-description"
>
  <h3 id="chart-title">Performance Trends</h3>
  <p id="chart-description">
    Chart showing campaign performance over the last 30 days,
    with revenue trending upward from $500 to $2,400.
  </p>
  <!-- Chart content -->
</div>
```

### 7.2 Focus Management

```css
/* Focus Styles */
.focus-visible:focus {
  outline: 3px solid var(--primary-gold);
  outline-offset: 2px;
  box-shadow: 0 0 0 5px rgba(255, 156, 0, 0.2);
}

/* Focus Within (for containers) */
.card:focus-within {
  border-color: var(--primary-gold);
  box-shadow: 0 0 0 3px rgba(255, 156, 0, 0.1);
}

/* Skip Link */
.skip-link {
  position: absolute;
  left: -9999px;
  z-index: 999;
  padding: var(--space-3) var(--space-4);
  background: var(--primary-gold);
  color: var(--bg-primary);
  text-decoration: none;
}

.skip-link:focus {
  left: var(--space-4);
  top: var(--space-4);
}
```

---

## 8. Performance & Loading States

### 8.1 Loading State Patterns

#### Skeleton Loading
```css
/* Skeleton Animation */
@keyframes skeleton-loading {
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 25%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.05) 75%
  );
  background-size: 200px 100%;
  animation: skeleton-loading 1.5s infinite;
}

/* Skeleton Components */
.skeleton-text {
  height: 1rem;
  border-radius: var(--radius-base);
}

.skeleton-button {
  height: 3rem;
  width: 8rem;
  border-radius: var(--radius-base);
}

.skeleton-card {
  height: 12rem;
  border-radius: var(--radius-lg);
}
```

#### Progress Indicators
```css
/* Circular Progress */
.progress-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: conic-gradient(
    var(--primary-gold) var(--progress-angle, 0deg),
    rgba(255, 156, 0, 0.1) 0deg
  );
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.progress-circle::before {
  content: '';
  width: 90px;
  height: 90px;
  background: var(--bg-surface);
  border-radius: 50%;
  position: absolute;
}

/* Linear Progress */
.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 156, 0, 0.1);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: var(--primary-gold);
  border-radius: var(--radius-full);
  transition: width 0.3s ease;
}
```

### 8.2 Error State Handling

#### Error Message Components
```jsx
// Error Boundary Component
const ErrorBoundary = ({ children, fallback }) => {
  return (
    <div className="error-boundary">
      <div className="error-icon">⚠️</div>
      <h3>Something went wrong</h3>
      <p>We're sorry, but something unexpected happened.</p>
      <button onClick={handleRetry} className="btn btn-primary">
        Try Again
      </button>
      {fallback && (
        <button onClick={handleFallback} className="btn btn-secondary">
          Use Cached Data
        </button>
      )}
    </div>
  );
};

// Network Error Component
const NetworkError = ({ onRetry }) => {
  return (
    <div className="network-error">
      <div className="error-icon">🌐</div>
      <h3>Connection Issue</h3>
      <p>Please check your internet connection and try again.</p>
      <button onClick={onRetry} className="btn btn-primary">
        Retry
      </button>
    </div>
  );
};
```

### 8.3 Empty State Guidelines

#### Empty State Components
```jsx
// Dashboard Empty State
const DashboardEmpty = () => {
  return (
    <div className="empty-state">
      <div className="empty-illustration">
        {/* AI-themed illustration */}
        <div className="ai-brain-icon">🧠</div>
      </div>
      <h2>Welcome to NexSpark</h2>
      <p>Let's start by analyzing your market opportunity</p>
      <button className="btn btn-primary">
        Start Your First Research
      </button>
    </div>
  );
};

// Campaign List Empty State
const CampaignsEmpty = () => {
  return (
    <div className="empty-state">
      <div className="empty-illustration">
        <div className="campaign-icon">📢</div>
      </div>
      <h3>No campaigns yet</h3>
      <p>Create your first campaign to start driving growth</p>
      <div className="empty-actions">
        <button className="btn btn-primary">Create Campaign</button>
        <button className="btn btn-ghost">View Tutorial</button>
      </div>
    </div>
  );
};

// Creative Library Empty State
const CreativesEmpty = () => {
  return (
    <div className="empty-state">
      <div className="empty-illustration">
        <div className="creative-icon">🎨</div>
      </div>
      <h3>Your creative studio is empty</h3>
      <p>Upload an image and generate your first AI video</p>
      <button className="btn btn-primary">Generate Creative</button>
    </div>
  );
};
```

---

## 9. Implementation Guidance for Claude

### 9.1 Recommended Technology Stack

#### Frontend Framework
```bash
# React with TypeScript (Recommended)
npx create-react-app nexspark-frontend --template typescript

# Alternative: Next.js for SSR benefits
npx create-next-app@latest nexspark-frontend --typescript --tailwind --eslint

# Alternative: Vue 3 with TypeScript
npm create vue@latest nexspark-frontend -- --typescript --pwa
```

#### Styling Solutions
```bash
# Tailwind CSS (Recommended for rapid development)
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Alternative: Styled Components
npm install styled-components @types/styled-components

# Alternative: Emotion
npm install @emotion/react @emotion/styled
```

#### State Management
```bash
# Zustand (Recommended for simplicity)
npm install zustand

# Alternative: Redux Toolkit
npm install @reduxjs/toolkit react-redux

# Alternative: Jotai (for atomic state)
npm install jotai
```

#### UI Component Libraries
```bash
# Headless UI (Recommended for accessibility)
npm install @headlessui/react @heroicons/react

# Alternative: Radix UI
npm install @radix-ui/react-dropdown-menu @radix-ui/react-dialog

# Alternative: Chakra UI
npm install @chakra-ui/react @emotion/react @emotion/styled framer-motion
```

### 9.2 API Integration Patterns

#### HTTP Client Setup
```typescript
// api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle auth errors
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

#### API Service Layer
```typescript
// services/strategist.ts
import apiClient from '../api/client';

export interface ResearchRequest {
  website_url: string;
  product_description: string;
}

export interface ResearchResult {
  id: string;
  market_size: any;
  competitors: any[];
  target_audience: any;
  channels: any[];
  pain_points: any[];
  created_at: string;
}

class StrategistService {
  async conductResearch(data: ResearchRequest): Promise<ResearchResult> {
    const response = await apiClient.post('/api/strategist/research', data);
    return response.data.data;
  }

  async getResearch(id: string): Promise<ResearchResult> {
    const response = await apiClient.get(`/api/strategist/research/${id}`);
    return response.data.data;
  }

  async startInterview(researchId: string): Promise<{ session_id: string; first_question: string }> {
    const response = await apiClient.post('/api/strategist/interview/start', {
      research_id: researchId
    });
    return response.data.data;
  }

  // ... other methods
}

export const strategistService = new StrategistService();
```

### 9.3 State Management Architecture

#### Store Structure (Zustand Example)
```typescript
// stores/useAppStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AppState {
  // Auth State
  user: User | null;
  isAuthenticated: boolean;

  // Research State
  currentResearch: ResearchResult | null;
  researchHistory: ResearchResult[];

  // Interview State
  currentInterview: InterviewSession | null;

  // Campaign State
  activeCampaigns: Campaign[];

  // UI State
  currentModule: 'strategist' | 'executor' | 'advertiser' | 'analyzer';
  sidebarCollapsed: boolean;

  // Actions
  setUser: (user: User) => void;
  setCurrentResearch: (research: ResearchResult) => void;
  addResearchToHistory: (research: ResearchResult) => void;
  setCurrentModule: (module: string) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        user: null,
        isAuthenticated: false,
        currentResearch: null,
        researchHistory: [],
        currentInterview: null,
        activeCampaigns: [],
        currentModule: 'strategist',
        sidebarCollapsed: false,

        // Actions
        setUser: (user) => set({ user, isAuthenticated: !!user }),
        setCurrentResearch: (research) => set({ currentResearch: research }),
        addResearchToHistory: (research) =>
          set((state) => ({
            researchHistory: [research, ...state.researchHistory].slice(0, 10)
          })),
        setCurrentModule: (currentModule) => set({ currentModule }),
        toggleSidebar: () =>
          set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      }),
      {
        name: 'nexspark-storage',
        partialize: (state) => ({
          user: state.user,
          researchHistory: state.researchHistory,
          currentModule: state.currentModule,
          sidebarCollapsed: state.sidebarCollapsed,
        }),
      }
    )
  )
);
```

### 9.4 Component Architecture

#### Component Organization
```
src/
├── components/
│   ├── common/
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Input/
│   │   ├── Modal/
│   │   └── Layout/
│   ├── strategist/
│   │   ├── ResearchForm/
│   │   ├── ResearchResults/
│   │   ├── InterviewInterface/
│   │   └── ReportViewer/
│   ├── executor/
│   │   ├── LandingPageBuilder/
│   │   ├── ShopifySetup/
│   │   └── CreativeStudio/
│   ├── advertiser/
│   │   ├── AccountConnections/
│   │   ├── CampaignBuilder/
│   │   └── PixelSetup/
│   └── analyzer/
│       ├── Dashboard/
│       ├── PerformanceCharts/
│       └── OptimizationPanel/
├── pages/
├── hooks/
├── services/
├── stores/
├── types/
└── utils/
```

#### Component Template
```tsx
// components/common/Button/Button.tsx
import React from 'react';
import { clsx } from 'clsx';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    children,
    disabled,
    ...props
  }, ref) => {
    return (
      <button
        className={clsx(
          // Base styles
          'btn inline-flex items-center justify-center font-medium transition-all',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold',

          // Variants
          {
            'btn-primary bg-gold text-black hover:brightness-110 hover:translate-x-1':
              variant === 'primary',
            'btn-secondary bg-transparent text-blue border-2 border-blue hover:bg-blue/10':
              variant === 'secondary',
            'btn-ghost bg-transparent text-blue border border-subtle hover:bg-blue/5':
              variant === 'ghost',
          },

          // Sizes
          {
            'text-sm px-3 py-2': size === 'sm',
            'text-base px-4 py-3': size === 'md',
            'text-lg px-6 py-4': size === 'lg',
          },

          // States
          {
            'opacity-50 cursor-not-allowed': disabled || loading,
          },

          className
        )}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading && (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
        )}
        {icon && !loading && <span className="mr-2">{icon}</span>}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

### 9.5 Development Workflow

#### Development Setup
```bash
# Clone and setup
git clone <repo-url> nexspark-frontend
cd nexspark-frontend
npm install

# Environment setup
cp .env.example .env.local
# Edit .env.local with API endpoints

# Development server
npm run dev
```

#### Build Process
```bash
# Development build with hot reload
npm run dev

# Production build
npm run build

# Build analysis
npm run analyze

# Linting and formatting
npm run lint
npm run format

# Type checking
npm run type-check
```

#### Testing Strategy
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Visual regression tests
npm run test:visual

# Accessibility tests
npm run test:a11y
```

---

## 10. Next Steps & Implementation Plan

### 10.1 Phase 1: Foundation Setup (Days 1-3)

#### Day 1: Project Setup
- [ ] Initialize React/Next.js project with TypeScript
- [ ] Configure Tailwind CSS with custom design tokens
- [ ] Set up component library structure
- [ ] Implement base layout components

#### Day 2: Design System Implementation
- [ ] Create design token CSS variables
- [ ] Build core components (Button, Card, Input, Modal)
- [ ] Implement LCARS-style bracket components
- [ ] Set up typography and spacing utilities

#### Day 3: Navigation & Layout
- [ ] Build main navigation component
- [ ] Implement responsive layout system
- [ ] Create dashboard shell structure
- [ ] Set up routing and page structure

### 10.2 Phase 2: Module 1 - Strategist UI (Days 4-8)

#### Days 4-5: Research Engine
- [ ] Build research form with validation
- [ ] Implement research results display
- [ ] Create competitor analysis components
- [ ] Build audience persona cards

#### Days 6-7: Interview Interface
- [ ] Implement voice recording interface
- [ ] Build question progression UI
- [ ] Create transcript display
- [ ] Add interview analysis viewer

#### Day 8: GTM Report Viewer
- [ ] Build report navigation system
- [ ] Implement section-by-section display
- [ ] Create export and sharing features
- [ ] Add report generation interface

### 10.3 Phase 3: Module 2 - Executor UI (Days 9-13)

#### Days 9-10: Landing Page Builder
- [ ] Build page builder interface
- [ ] Implement template selection
- [ ] Create preview system
- [ ] Add publishing controls

#### Days 11-12: Shopify Integration
- [ ] Build OAuth connection flow
- [ ] Implement store configuration dashboard
- [ ] Create product management interface
- [ ] Add sync status monitoring

#### Day 13: Creative Studio
- [ ] Build creative generation interface
- [ ] Implement asset library
- [ ] Create upload and processing UI
- [ ] Add status polling system

### 10.4 Phase 4: Module 3 - Advertiser UI (Days 14-18)

#### Days 14-15: Account Connections
- [ ] Build connection dashboard
- [ ] Implement OAuth flows for Meta/Google
- [ ] Create connection status monitoring
- [ ] Add account management interface

#### Days 16-17: Campaign Builder
- [ ] Build step-by-step campaign wizard
- [ ] Implement audience targeting interface
- [ ] Create budget and scheduling controls
- [ ] Add campaign preview and review

#### Day 18: Meta Pixel & Management
- [ ] Build pixel installation interface
- [ ] Implement pixel health monitoring
- [ ] Create campaign management dashboard
- [ ] Add performance monitoring

### 10.5 Phase 5: Module 4 - Analyzer UI (Days 19-23)

#### Days 19-20: Performance Dashboard
- [ ] Build main dashboard with widgets
- [ ] Implement performance charts
- [ ] Create campaign comparison tools
- [ ] Add real-time data updates

#### Days 21-22: Optimization Interface
- [ ] Build optimization recommendation system
- [ ] Implement optimization controls
- [ ] Create A/B testing interface
- [ ] Add automated rule management

#### Day 23: Reporting & Analytics
- [ ] Build report generation interface
- [ ] Implement weekly report viewer
- [ ] Create export and sharing features
- [ ] Add analytics deep-dive tools

### 10.6 Phase 6: Integration & Polish (Days 24-30)

#### Days 24-25: Cross-Module Integration
- [ ] Implement data flow between modules
- [ ] Build unified navigation experience
- [ ] Create progress tracking system
- [ ] Add cross-module actions

#### Days 26-27: Responsive & Mobile
- [ ] Optimize for mobile devices
- [ ] Implement tablet-specific layouts
- [ ] Add touch-friendly interactions
- [ ] Test across device sizes

#### Days 28-29: Accessibility & Performance
- [ ] Implement accessibility features
- [ ] Optimize loading performance
- [ ] Add error boundaries and fallbacks
- [ ] Test with screen readers

#### Day 30: Testing & Launch Preparation
- [ ] Comprehensive testing across all modules
- [ ] Performance optimization
- [ ] Security review
- [ ] Documentation completion

---

**Document Version:** 1.0
**Last Updated:** January 2025
**Total Estimated Development Time:** 30 days
**Developer Skill Level:** Intermediate to Advanced React/TypeScript

This comprehensive UI/UX design document provides everything needed to build a production-ready frontend for NexSpark AI Growth OS, maintaining consistency with the sci-fi cyberpunk aesthetic while ensuring excellent user experience across all four modules.