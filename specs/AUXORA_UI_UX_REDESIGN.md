# Auxora.ai — Complete UI/UX Design Scheme
## The First End-to-End Vibe Business Agent

**Version:** 2.0
**Date:** 2026-02-18
**Authors:** CEO/Founder × Interactive Designer × Developer
**Status:** Design Scheme — Ready for Review

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [User Journey & Storyboard](#2-user-journey--storyboard)
3. [Information Architecture](#3-information-architecture)
4. [Screen-by-Screen Design](#4-screen-by-screen-design)
5. [Component Library](#5-component-library)
6. [Interaction Patterns](#6-interaction-patterns)
7. [Mobile & Multi-Channel](#7-mobile--multi-channel)
8. [Design Tokens](#8-design-tokens)
9. [Acceptance Criteria](#9-acceptance-criteria)

---

## 1. Design Philosophy

### 1.1 Core Thesis

Auxora.ai is not a dashboard. It is not a SaaS tool. It is a **conversational AI agency** — a digital colleague that runs your entire paid advertising operation through messaging.

The brand owner's experience should feel like texting a brilliant, always-available marketing partner who:
- Proactively shares insights and recommendations
- Handles all technical complexity behind the scenes
- Asks only for the decisions that truly need human judgment
- Remembers everything and gets smarter over time

### 1.2 Three Design Principles

**Principle 1: Chat IS the Product**
There is no separate "dashboard" to learn. The conversation is the entire interface. Reports, charts, data tables, approval buttons — everything renders as rich inline cards within the chat. If you can use WhatsApp, you can use Auxora.

**Principle 2: Proactive Over Reactive**
Auxora initiates 80% of interactions. The brand owner responds and decides. This inverts the traditional SaaS model where users must "go to the tool" and figure out what to look at. Auxora comes to you with what matters.

**Principle 3: Progressive Disclosure**
Show only what's needed at each moment. A D2C brand owner managing a $1K/month budget doesn't need to see campaign-level metrics by default. But a marketing professional running $50K/month should be able to drill into creative-level ROAS. The interface adapts.

### 1.3 Design Metaphor

**Auxora = Your agency's Slack channel, compressed into one intelligent thread.**

Instead of:
- A strategist sending you a report PDF
- A media buyer emailing weekly stats
- An account manager scheduling a sync call
- A designer asking for creative feedback

You get:
- One conversation with Auxora that covers all of this
- Rich inline cards for every deliverable
- One-tap decisions for every approval
- An always-visible stage rail showing where your business is in its growth journey

---

## 2. User Journey & Storyboard

### 2.1 Act 1: Discovery (Minutes 0-15)

**Goal:** Brand owner arrives, provides basic info, receives a free GTM report.

```
Scene 1: Landing Page
┌─────────────────────────────────────────────────────┐
│  [Auxora.ai logo]                    [Log in]       │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │                                             │    │
│  │   Your AI Growth Team.                      │    │
│  │   From strategy to execution.               │    │
│  │                                             │    │
│  │   We help D2C brands grow revenue           │    │
│  │   with certainty through AI-driven          │    │
│  │   paid advertising.                         │    │
│  │                                             │    │
│  │   [ Start Growing → ]                       │    │
│  │                                             │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │ Strategy │  │ Execution│  │ 24/7     │         │
│  │ Report   │  │ & Ads    │  │ Optimize │         │
│  │ $1.99    │  │ $20/mo   │  │ Included │         │
│  └──────────┘  └──────────┘  └──────────┘         │
│                                                     │
│  "Powered by OpenClaw autonomous monitoring"        │
└─────────────────────────────────────────────────────┘
```

**Interaction:** Click "Start Growing" → transitions to full-screen chat.

```
Scene 2: First Conversation
┌─────────────────────────────────────────────────────┐
│ ○ Discovery → ○ Strategy → ○ Contract → ...         │
│─────────────────────────────────────────────────────│
│                                                     │
│  ┌─A─┐                                             │
│  │   │  Hi! I'm Auxora, your AI growth partner.    │
│  └───┘  I help D2C brands grow revenue through     │
│         paid advertising on Meta and Google.        │
│                                                     │
│         Let me learn about your business so I can   │
│         create a personalized growth strategy.      │
│                                                     │
│         What's your brand's website?                │
│                                                     │
│  ┌──────────────────────────────────────────┐       │
│  │  https://yamabushifarms.com              │       │
│  └──────────────────────────────────────────┘       │
│                                                     │
│                                          [Send →]   │
└─────────────────────────────────────────────────────┘
```

**Auxora's guided questions (5-7 questions, one at a time):**

1. "What's your brand's website?" → `yamabushifarms.com`
2. "What do you sell?" → Quick-select chips: [Supplements] [Fashion] [Beauty] [Food] [Home] [Other]
3. "What's your current monthly revenue?" → Slider or input: `$50,000`
4. "What's your revenue goal for the next 6 months?" → `$250,000`
5. "What's your monthly advertising budget?" → Range chips: [<$1K] [$1K-$5K] [$5K-$20K] [$20K+]
6. "Are you currently running paid ads?" → [Yes, on Meta] [Yes, on Google] [Both] [Not yet]
7. "Anything specific you're struggling with?" → Free text (optional)

After each answer, Auxora acknowledges and asks the next question — natural conversation flow.

```
Scene 3: Research In Progress
┌─────────────────────────────────────────────────────┐
│ ● Discovery → ○ Strategy → ○ Contract → ...         │
│─────────────────────────────────────────────────────│
│                                                     │
│  ┌─A─┐                                             │
│  │ ♡ │  Great! I'm now researching your market.     │
│  └───┘  This usually takes about 2 minutes.        │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ ◉ Analyzing yamabushifarms.com...           │    │
│  │ ◉ Researching lion's mane supplement market │    │
│  │ ○ Identifying competitors...                │    │
│  │ ○ Building audience segments...             │    │
│  │ ○ Calculating channel strategy...           │    │
│  │ ○ Generating 6-month roadmap...             │    │
│  │                                             │    │
│  │ ████████████░░░░░░░░  42%                   │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Key detail:** The progress card updates in real-time. Each step checks off as it completes. This builds anticipation and demonstrates Auxora's capability.

```
Scene 4: GTM Report Delivered (Inline)
┌─────────────────────────────────────────────────────┐
│ ✓ Discovery → ○ Strategy → ○ Contract → ...         │
│─────────────────────────────────────────────────────│
│                                                     │
│  ┌─A─┐                                             │
│  │   │  Your growth strategy is ready!              │
│  └───┘                                              │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ 📊 YAMABUSHI FARMS — GROWTH STRATEGY       │    │
│  │                                             │    │
│  │ Market Opportunity                          │    │
│  │ The lion's mane supplement market is        │    │
│  │ growing at 18% CAGR. Your top 3            │    │
│  │ competitors spend $15K-$40K/mo on ads.     │    │
│  │                                             │    │
│  │ ┌────────┐ ┌────────┐ ┌────────┐           │    │
│  │ │ $2.1B  │ │ 18%    │ │ 47     │           │    │
│  │ │ Market │ │ Growth │ │ Compet.│           │    │
│  │ └────────┘ └────────┘ └────────┘           │    │
│  │                                             │    │
│  │ Recommended Strategy                        │    │
│  │ • Meta Ads (30%) — Awareness + Retarget    │    │
│  │ • Google Ads (70%) — Search + Shopping     │    │
│  │ • 3-stage budget: Seed → Ramp → Scale      │    │
│  │                                             │    │
│  │ Revenue Projection                          │    │
│  │ ▁▂▃▄▅▆▇█  $50K → $250K in 6 months        │    │
│  │                                             │    │
│  │ [View Full Report ↗]  [Download PDF]        │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  ┌─A─┐                                             │
│  │   │  Want me to execute this strategy for you?   │
│  └───┘  I'll handle everything — campaigns,        │
│         optimization, weekly reporting.              │
│                                                     │
│         [Yes, let's go →]    [I have questions]     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

### 2.2 Act 2: Strategy Consensus (Minutes 15-30)

**Goal:** Walk through strategy assumptions. Brand owner confirms or adjusts each one.

```
Scene 5: Assumption Confirmation Cards
┌─────────────────────────────────────────────────────┐
│ ✓ Discovery → ● Strategy → ○ Contract → ...         │
│─────────────────────────────────────────────────────│
│                                                     │
│  ┌─A─┐                                             │
│  │   │  Let's align on the key decisions.           │
│  └───┘  I'll walk you through each one.            │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ DECISION 1 of 5                             │    │
│  │                                             │    │
│  │ Revenue Target                              │    │
│  │ Goal: $250,000/month by month 6             │    │
│  │ Current: $50,000/month                      │    │
│  │ Growth needed: 5x                           │    │
│  │                                             │    │
│  │ This is ambitious but achievable based on   │    │
│  │ your market size and competitor benchmarks.  │    │
│  │                                             │    │
│  │ [✓ Confirm]  [Adjust target]  [Skip]        │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**5 Decision Cards in sequence:**

1. **Revenue Target** — $250K/mo in 6 months
2. **ROAS Target** — 4.5x blended by month 6
3. **Channel Mix** — Google 70% / Meta 30%
4. **Budget Plan** — 3 stages (30% / 48% / 22% allocation)
5. **Priority Audiences** — Based on research (Supplements enthusiasts, Health-conscious 35-55, etc.)

Each card is a self-contained decision unit. [Confirm] advances to next. [Adjust] opens inline editing. [Skip] defers to later.

After all 5 confirmed:

```
Scene 6: Consensus Complete
┌─────────────────────────────────────────────────────┐
│  ┌─A─┐                                             │
│  │   │  All set! Here's your agreed strategy:       │
│  └───┘                                              │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ ✅ STRATEGY CONFIRMED                       │    │
│  │                                             │    │
│  │ Target: $250K/mo | ROAS: 4.5x              │    │
│  │ Channels: Google 70% / Meta 30%            │    │
│  │ Budget: 3-stage ramp                       │    │
│  │ Audiences: 4 segments defined              │    │
│  │                                             │    │
│  │ Ready to proceed to the service agreement?  │    │
│  │                                             │    │
│  │ [Review Agreement →]                        │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

### 2.3 Act 3: Service Agreement (Minutes 30-40)

**Goal:** Present contract terms in plain language. Collect sign-off.

```
Scene 7: Agreement Walkthrough
┌─────────────────────────────────────────────────────┐
│ ✓ Discovery → ✓ Strategy → ● Contract → ...         │
│─────────────────────────────────────────────────────│
│                                                     │
│  ┌─A─┐                                             │
│  │   │  Here's how our partnership works.           │
│  └───┘  I'll explain each term simply.             │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ 📋 SERVICE AGREEMENT                        │    │
│  │                                             │    │
│  │ Trial Period                                │    │
│  │ 14 days free. Cancel anytime, no questions. │    │
│  │                                             │    │
│  │ Monthly Fee                                 │    │
│  │ $500/month retainer + 5-10% of ad spend    │    │
│  │                                             │    │
│  │ What You Get                                │    │
│  │ ✓ Full campaign management (Meta + Google)  │    │
│  │ ✓ Weekly performance reports                │    │
│  │ ✓ 24/7 AI optimization (OpenClaw)          │    │
│  │ ✓ Creative recommendations                 │    │
│  │ ✓ Strategy adjustments                     │    │
│  │                                             │    │
│  │ What We Need From You                       │    │
│  │ • Access to ad accounts                    │    │
│  │ • Creative assets (photos/videos)          │    │
│  │ • Response to weekly check-ins             │    │
│  │                                             │    │
│  │ Cancellation                                │    │
│  │ 30 days notice. No lock-in after trial.    │    │
│  │                                             │    │
│  │ [View Full Agreement PDF ↗]                 │    │
│  │                                             │    │
│  │ [ I agree — Start my trial → ]              │    │
│  │                                             │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**After sign-off:** Stage gate passes. Auxora transitions to setup.

---

### 2.4 Act 4: Setup & Launch (Days 1-7)

**Goal:** Collect credentials, set up tracking, launch initial campaigns.

```
Scene 8: Credential Collection
┌─────────────────────────────────────────────────────┐
│ ✓ ✓ ✓ → ● Execution → ○ Weekly Sync → ...          │
│─────────────────────────────────────────────────────│
│                                                     │
│  ┌─A─┐                                             │
│  │   │  Let's get your accounts connected.          │
│  └───┘  I'll walk you through each one.            │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ 🔗 ACCOUNT SETUP  (2 of 4 complete)         │    │
│  │                                             │    │
│  │ ✅ Meta Business Manager — Connected        │    │
│  │ ✅ Shopify Store — Connected                │    │
│  │ ⬜ Google Ads — Needs access                │    │
│  │ ⬜ Google Analytics — Needs access          │    │
│  │                                             │    │
│  │ For Google Ads, I need you to:              │    │
│  │ 1. Go to ads.google.com/settings           │    │
│  │ 2. Click "Account Access"                  │    │
│  │ 3. Invite: agent@auxora.ai                 │    │
│  │                                             │    │
│  │ [I've done it ✓]  [Help me →]  [Later]      │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

```
Scene 9: Campaign Launch
┌─────────────────────────────────────────────────────┐
│                                                     │
│  ┌─A─┐                                             │
│  │ ♡ │  Everything's connected! I'm now setting     │
│  └───┘  up your first campaigns.                   │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ 🚀 LAUNCH CHECKLIST                         │    │
│  │                                             │    │
│  │ ✅ Meta Pixel installed and verified        │    │
│  │ ✅ Google conversion tracking active        │    │
│  │ ✅ UTM parameters configured               │    │
│  │ ✅ Audience segments created (4 segments)   │    │
│  │ ✅ Ad creatives uploaded (6 variants)       │    │
│  │ ⏳ Campaign review (Meta approval pending)  │    │
│  │ ⬜ Google campaigns launching tomorrow      │    │
│  │                                             │    │
│  │ Stage 1 Budget: $200/week                   │    │
│  │ Channels: Meta 30% ($60) | Google 70% ($140)│    │
│  │                                             │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  ┌─A─┐                                             │
│  │   │  Your Meta campaigns are live! 🎯            │
│  └───┘  I'll monitor everything and send you       │
│         your first performance update in 48 hours.  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

### 2.5 Act 5: Weekly Sync Loop (Week 2+)

**Goal:** Every week, Auxora delivers performance insights and next-week recommendations.

This is the ongoing operational heartbeat. The brand owner receives this every Monday:

```
Scene 10: Weekly Briefing Card
┌─────────────────────────────────────────────────────┐
│ ✓ ✓ ✓ ✓ → ● Weekly Sync → ○ Optimization           │
│─────────────────────────────────────────────────────│
│                                                     │
│  ┌─A─┐  Good morning! Here's your Week 3 report.   │
│  └───┘                                              │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ 📊 WEEK 3 PERFORMANCE  (02/03 - 02/09)     │    │
│  │                                             │    │
│  │ ┌────────┐ ┌────────┐ ┌────────┐ ┌───────┐ │    │
│  │ │ $697   │ │ 15     │ │ $46.49 │ │ 0.84x │ │    │
│  │ │ Spend  │ │ Sales  │ │ CPA    │ │ ROAS  │ │    │
│  │ │ ↗+12%  │ │ ↗+25%  │ │ ↘-8%  │ │ ↗+15% │ │    │
│  │ └────────┘ └────────┘ └────────┘ └───────┘ │    │
│  │                                             │    │
│  │ ── By Channel ──                            │    │
│  │ Meta    $497 | 15 purchases | ROAS 0.84x   │    │
│  │ Google  $200 | 0 purchases  | Learning...  │    │
│  │                                             │    │
│  │ ── What Worked ──                           │    │
│  │ ✅ Supplements audience: ROAS 1.52x         │    │
│  │ ✅ Video-1 creative: CTR 4.49%             │    │
│  │ ✅ Meta CPM decreased 11%                   │    │
│  │                                             │    │
│  │ ── Needs Attention ──                       │    │
│  │ ⚠️ Google: 0 purchases (still learning)     │    │
│  │ ⚠️ Broad audience: CPA $68 (too high)       │    │
│  │ ⚠️ Static image ads underperforming -40%    │    │
│  │                                             │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  ┌─A─┐  Based on this data, here are my            │
│  └───┘  recommendations for next week:              │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ NEXT WEEK ACTIONS (3 items)                 │    │
│  │                                             │    │
│  │ 1. Scale Supplements audience budget +30%   │    │
│  │    Impact: Est. +4 purchases/week           │    │
│  │    [Approve ✓]  [Adjust]  [Skip]            │    │
│  │                                             │    │
│  │ 2. Pause Broad audience (save $180/week)    │    │
│  │    Impact: CPA improves to ~$38             │    │
│  │    [Approve ✓]  [Adjust]  [Skip]            │    │
│  │                                             │    │
│  │ 3. Create Video-1 derivative for testing    │    │
│  │    Impact: Test if we can beat 4.49% CTR    │    │
│  │    [Approve ✓]  [Adjust]  [Skip]            │    │
│  │                                             │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

### 2.6 Act 6: OpenClaw Autonomous Optimization (Continuous)

**Goal:** Between weekly syncs, OpenClaw monitors 24/7 and handles urgent issues.

```
Scene 11: Real-Time Alert (Push Notification → Chat)
┌─────────────────────────────────────────────────────┐
│ ✓ ✓ ✓ ✓ ✓ → ● Optimization                         │
│─────────────────────────────────────────────────────│
│                                                     │
│  ┌─A─┐                                             │
│  │ ⚡│  Heads up — I detected an issue.             │
│  └───┘                                              │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ ⚠️ ALERT: CPA Spike Detected                │    │
│  │ Severity: Medium | Confidence: 81%          │    │
│  │                                             │    │
│  │ What happened:                              │    │
│  │ "Health & Wellness" audience CPA jumped     │    │
│  │ from $34 to $52 (+53%) in the last 24h.    │    │
│  │                                             │    │
│  │ Likely cause:                               │    │
│  │ Creative fatigue — CTR dropped while        │    │
│  │ frequency increased 2.1x over 7 days.      │    │
│  │                                             │    │
│  │ My recommendation:                          │    │
│  │ Pause this audience and reallocate $60/week │    │
│  │ to Supplements audience (ROAS 1.52x).      │    │
│  │                                             │    │
│  │ [Approve ✓]  [Keep Running]  [Tell Me More] │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ ✅ AUTO-ACTION COMPLETED                    │    │
│  │                                             │    │
│  │ I automatically added 12 negative keywords  │    │
│  │ to your Google Search campaign based on     │    │
│  │ today's search term report.                 │    │
│  │                                             │    │
│  │ Est. savings: $45/week                      │    │
│  │ Policy: Pre-authorized (negative keywords)  │    │
│  │                                             │    │
│  │ [View Details]  [Undo]                      │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

```
Scene 12: Daily Digest (Morning Briefing)
┌─────────────────────────────────────────────────────┐
│                                                     │
│  ┌─A─┐  Good morning! Quick update:                 │
│  └───┘                                              │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ ☀️ DAILY BRIEFING — Tuesday, Feb 18          │    │
│  │                                             │    │
│  │ Yesterday's Numbers                         │    │
│  │ Spend: $98.20 | Revenue: $185 | ROAS: 1.88 │    │
│  │                                             │    │
│  │ Heartbeat Status: ♡ Healthy                 │    │
│  │ Last check: 8 min ago | Next: 22 min       │    │
│  │ Active alerts: 0 | Actions today: 1         │    │
│  │                                             │    │
│  │ On Track For This Week                      │    │
│  │ ████████████░░░░  75% of weekly budget      │    │
│  │ Goal: 12 purchases | Current: 9             │    │
│  │                                             │    │
│  │ Nothing needs your attention right now. ✨    │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

### 2.7 Act 7: Growth Milestones

**Goal:** Celebrate wins and recommend scaling.

```
Scene 13: Milestone Achievement
┌─────────────────────────────────────────────────────┐
│                                                     │
│  ┌─A─┐                                             │
│  │ 🎯│  We just hit a major milestone!              │
│  └───┘                                              │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ 🏆 MILESTONE: ROAS Target Reached!          │    │
│  │                                             │    │
│  │ Your blended ROAS hit 1.5x this week —     │    │
│  │ up from 0.84x when we started 6 weeks ago. │    │
│  │                                             │    │
│  │  Start ▁▂▂▃▃▄▅▅▆▇ Now                      │    │
│  │  0.84x                          1.52x      │    │
│  │                                             │    │
│  │ Stage 1 (Traffic Seeding) is complete.      │    │
│  │ Ready to enter Stage 2 (Conversion Ramp)?  │    │
│  │                                             │    │
│  │ Stage 2 means:                              │    │
│  │ • Budget increases to $350/week             │    │
│  │ • Focus shifts to conversion optimization   │    │
│  │ • Target ROAS: 1.0-1.5x                    │    │
│  │                                             │    │
│  │ [Move to Stage 2 →]  [Stay in Stage 1]     │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 3. Information Architecture

### 3.1 Screen Hierarchy

```
auxora.ai
├── Landing Page (marketing, pricing, "Start Growing")
│
├── Chat Interface (THE primary interface)
│   ├── Stage Rail (top — always visible)
│   ├── Message Thread (center — scrollable conversation)
│   │   ├── Text Messages (Auxora + User)
│   │   ├── Rich Cards (reports, data, charts)
│   │   ├── Action Cards (decisions needing approval)
│   │   ├── Progress Cards (setup, research, processing)
│   │   └── Milestone Cards (celebrations, transitions)
│   └── Input Area (bottom — text input + quick actions)
│
├── Expanded Views (slide-over panels, triggered from cards)
│   ├── Full GTM Report
│   ├── Full Weekly Sync Report
│   ├── Agreement Details
│   ├── Account Settings
│   └── OpenClaw Policy Settings
│
└── Settings (accessible from avatar menu)
    ├── Profile & Business Info
    ├── Connected Accounts
    ├── Notification Preferences
    ├── OpenClaw Trust Boundaries
    └── Billing
```

### 3.2 Stage Rail States

The stage rail is the persistent navigation showing the brand owner's journey:

```
┌──────────────────────────────────────────────────────────────┐
│ [✓] Discovery → [✓] Strategy → [●] Contract → [○] Exec → [○] Sync → [○] Optimize │
└──────────────────────────────────────────────────────────────┘
```

| State | Icon | Color | Meaning |
|-------|------|-------|---------|
| Complete | ✓ | Coral filled | Phase done, gate passed |
| Active | ● | Coral pulsing | Currently in this phase |
| Locked | ○ | Gray outline | Not yet reached |
| Blocked | ⚠ | Amber | Needs user action to proceed |

**Stage definitions (simplified from 6-phase spec):**

| # | Stage | Gate Requirement |
|---|-------|-----------------|
| 1 | Discovery | Website + basic info provided |
| 2 | Strategy | All 5 assumptions confirmed |
| 3 | Contract | Agreement signed |
| 4 | Execution | Accounts connected + campaigns launched |
| 5 | Weekly Sync | First full week of data collected |
| 6 | Optimization | OpenClaw active, 4+ weeks of data |

### 3.3 Card Type System

All content in the chat is delivered as typed cards:

| Card Type | Purpose | Interactive? |
|-----------|---------|-------------|
| `TextMessage` | Regular conversation | No |
| `QuestionCard` | Collects input (text, select, slider) | Yes |
| `ReportCard` | Data presentation (KPIs, charts, tables) | Expandable |
| `ActionCard` | Requires decision (approve/decline/adjust) | Yes |
| `ProgressCard` | Shows ongoing process | Auto-updating |
| `ChecklistCard` | Multi-step setup or verification | Yes |
| `AlertCard` | OpenClaw notification (warning/critical) | Yes |
| `AutoActionCard` | OpenClaw auto-applied action log | Undoable |
| `MilestoneCard` | Celebration, stage transition | Yes |
| `AgreementCard` | Contract terms and sign-off | Yes |

---

## 4. Screen-by-Screen Design

### 4.1 Landing Page

**Purpose:** Convert visitors to users. Simple, warm, direct.

**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│ [Logo: Auxora.ai]                          [Log in]      │
│                                                          │
│         ┌────────────────────────────────┐               │
│         │                                │               │
│         │  Your AI Growth Team           │               │
│         │  From strategy to execution    │               │
│         │                                │               │
│         │  [ Start Growing → ]           │               │
│         │                                │               │
│         └────────────────────────────────┘               │
│                                                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│  │ 1. Strategy │ │ 2. Execute  │ │ 3. Optimize │        │
│  │ AI research │ │ Launch ads  │ │ 24/7 AI     │        │
│  │ & GTM plan  │ │ on Meta +   │ │ monitoring  │        │
│  │             │ │ Google      │ │ & scaling   │        │
│  └─────────────┘ └─────────────┘ └─────────────┘        │
│                                                          │
│  ┌───────────────────────────────────────────────┐       │
│  │ "Auxora grew our revenue from $50K to $180K   │       │
│  │  in 4 months. It's like having a full agency  │       │
│  │  team for $20/month." — Yamabushi Farms       │       │
│  └───────────────────────────────────────────────┘       │
│                                                          │
│  ┌──────────────────────────────────────────────┐        │
│  │ Pricing                                      │        │
│  │                                              │        │
│  │ Free GTM Report    Full Service    Enterprise│        │
│  │ $1.99 one-time     $20/mo + spend  Custom    │        │
│  │ • Market analysis  • Everything    • Custom  │        │
│  │ • Competitor data   in Free, plus:   SLAs    │        │
│  │ • Strategy plan    • Campaign mgmt • Dedicated│       │
│  │                    • Weekly reports   account │        │
│  │ [Get Report]       • 24/7 OpenClaw           │        │
│  │                    [Start Trial →]  [Talk]   │        │
│  └──────────────────────────────────────────────┘        │
│                                                          │
│  Powered by OpenClaw — Autonomous advertising AI         │
└──────────────────────────────────────────────────────────┘
```

**Design notes:**
- Warm cream background (`#FAF7F2`)
- Coral CTA buttons
- No jargon — "Your AI Growth Team" not "AI-Powered Marketing Automation Platform"
- Social proof from real client
- Clear pricing (low barrier entry)

### 4.2 Chat Interface (Main App)

**Purpose:** The primary workspace. Everything happens here.

```
┌──────────────────────────────────────────────────────────┐
│ ┌────────────────────────────────────────────────────┐   │
│ │ [✓]─[✓]─[✓]─[●]─[○]─[○]   Stage Rail        [⚙] │   │
│ │ Disc Strat Cont Exec Sync Opt                      │   │
│ └────────────────────────────────────────────────────┘   │
│                                                          │
│ ┌────────────────────────────────────────────────────┐   │
│ │                                                    │   │
│ │  Message Thread (scrollable)                       │   │
│ │                                                    │   │
│ │  ┌─A─┐  Text message from Auxora                   │   │
│ │  └───┘                                             │   │
│ │                                                    │   │
│ │  ┌─────────────────────────────────────────┐       │   │
│ │  │  [Rich Card — Report/Action/Alert]      │       │   │
│ │  │  Interactive content with buttons       │       │   │
│ │  └─────────────────────────────────────────┘       │   │
│ │                                                    │   │
│ │                        User message ─┐             │   │
│ │                                      │             │   │
│ │  ┌─A─┐  Auxora response                            │   │
│ │  └───┘                                             │   │
│ │                                                    │   │
│ └────────────────────────────────────────────────────┘   │
│                                                          │
│ ┌────────────────────────────────────────────────────┐   │
│ │ [📎] Ask Auxora anything...                   [→]  │   │
│ └────────────────────────────────────────────────────┘   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Key UI elements:**

**Stage Rail (top):**
- Compact horizontal progress indicator
- Always visible, never scrolls
- Tapping a completed stage scrolls to that section in chat history
- Settings gear icon on right → opens account/preferences

**Message Thread (center):**
- Full-width, scrollable
- Auxora messages aligned left with avatar
- User messages aligned right
- Rich cards take full width with rounded corners and subtle shadows
- Smooth scroll-to-bottom on new messages
- "Jump to latest" fab when scrolled up

**Input Area (bottom):**
- Sticky at bottom
- Text input with placeholder
- Attachment button (for creative uploads, screenshots)
- Send button (coral)
- Quick-action chips appear contextually above input:
  `[📊 This week's stats]  [💰 Budget status]  [❓ Help]`

### 4.3 Expanded View (Slide-Over Panel)

When a card has a "View Full Report" link, it opens a slide-over:

```
┌────────────────────────────────────────────────────────────────────┐
│                                              ┌────────────────────┐│
│  Chat (dimmed, still visible)                │ FULL REPORT        ││
│                                              │                    ││
│  ┌─A─┐  Your growth strategy is ready!       │ Market Analysis    ││
│  └───┘                                       │ ─────────────────  ││
│                                              │ [Charts]           ││
│  ┌──────────────────────────┐                │ [Tables]           ││
│  │ 📊 GTM REPORT (summary) │                │ [Competitor Data]  ││
│  │ ...                      │                │ [Audience Segments]││
│  │ [View Full Report ↗] ────┼──────────────→ │ [6-Month Roadmap]  ││
│  └──────────────────────────┘                │                    ││
│                                              │ [Download PDF]     ││
│                                              │ [✕ Close]          ││
│                                              └────────────────────┘│
└────────────────────────────────────────────────────────────────────┘
```

- Slides in from the right (40-60% width)
- Chat dims but remains visible underneath
- Close button returns to full chat
- Contains full detailed content (tables, charts, long-form analysis)
- This is where the "Advanced User" mode lives — full data access

### 4.4 Settings Panel

```
┌─────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────┐    │
│  │ SETTINGS                                    [✕]     │    │
│  │                                                     │    │
│  │ ┌─────────────────┐                                 │    │
│  │ │ 🏢 Business     │ Company name, website, industry │    │
│  │ └─────────────────┘                                 │    │
│  │ ┌─────────────────┐                                 │    │
│  │ │ 🔗 Connections  │ Meta, Google, Shopify status    │    │
│  │ └─────────────────┘                                 │    │
│  │ ┌─────────────────┐                                 │    │
│  │ │ 🔔 Notifications│ WhatsApp, Slack, Email config   │    │
│  │ └─────────────────┘                                 │    │
│  │ ┌─────────────────┐                                 │    │
│  │ │ 🤖 OpenClaw     │ Trust boundaries & auto-actions │    │
│  │ │                 │                                 │    │
│  │ │ Auto-execute:   │ Budget shifts < [$200]          │    │
│  │ │ Ask first:      │ Budget shifts $200-$1000        │    │
│  │ │ Always ask:     │ Budget shifts > $1000           │    │
│  │ │ Max auto/day:   │ [3] actions                     │    │
│  │ │ Cooldown:       │ [180] minutes                   │    │
│  │ └─────────────────┘                                 │    │
│  │ ┌─────────────────┐                                 │    │
│  │ │ 💳 Billing      │ Plan, payment, invoices         │    │
│  │ └─────────────────┘                                 │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Component Library

### 5.1 Auxora Avatar

The Auxora avatar is ever-present and communicates system state:

```
Normal:     ┌─A─┐   Coral circle with "A", subtle shadow
             └───┘

Thinking:   ┌─A─┐   Pulsing glow animation (coral → light → coral)
             └───┘   3 dots typing indicator

Alert:      ┌─A─┐   Red ring around avatar
             └─⚡┘   Lightning badge

Celebrating:┌─A─┐   Sparkle particles animation
             └─🎯┘

Heartbeat:  ┌─A─┐   Subtle heartbeat pulse every 2s
             └─♡─┘   Shows OpenClaw is active
```

### 5.2 Rich Card Components

#### ReportCard

```html
<div class="card report-card">
  <div class="card-header">
    <span class="card-icon">📊</span>
    <span class="card-title">WEEK 3 PERFORMANCE</span>
    <span class="card-badge">02/03 - 02/09</span>
  </div>
  <div class="card-body">
    <div class="kpi-grid">
      <div class="kpi">
        <span class="kpi-value">$697</span>
        <span class="kpi-label">Spend</span>
        <span class="kpi-delta positive">↗+12%</span>
      </div>
      <!-- More KPIs -->
    </div>
    <div class="card-sections">
      <!-- Expandable sections -->
    </div>
  </div>
  <div class="card-footer">
    <button class="btn-link">View Full Report ↗</button>
    <button class="btn-link">Download PDF</button>
  </div>
</div>
```

**Variants:**
- `report-card` — Weekly sync, GTM report, monthly review
- `report-card--compact` — Daily briefing (fewer metrics)
- `report-card--expanded` — Full detail view in slide-over

#### ActionCard

```html
<div class="card action-card action-card--warning">
  <div class="card-header">
    <span class="severity-badge warning">⚠️ Medium</span>
    <span class="confidence">Confidence: 81%</span>
  </div>
  <div class="card-body">
    <h4>CPA Spike Detected</h4>
    <p>Health & Wellness audience CPA jumped from $34 to $52 (+53%)</p>
    <div class="recommendation">
      <strong>Recommendation:</strong>
      Pause this audience and reallocate $60/week to Supplements.
    </div>
  </div>
  <div class="card-actions">
    <button class="btn btn-primary">Approve ✓</button>
    <button class="btn btn-secondary">Keep Running</button>
    <button class="btn btn-ghost">Tell Me More</button>
  </div>
</div>
```

**Severity variants:**
- `action-card--critical` — Red left border, red badge
- `action-card--warning` — Amber left border, amber badge
- `action-card--info` — Blue left border, blue badge
- `action-card--success` — Green left border (positive recommendation)

**States:**
- Default: Action buttons visible
- Approved: Card collapses, shows "✓ Approved — Action executed"
- Declined: Card collapses, shows "✗ Declined — Monitoring continues"
- Expired: Buttons disabled, shows "⏰ Auto-resolved"

#### QuestionCard

```html
<div class="card question-card">
  <div class="card-body">
    <p class="question-text">What's your monthly advertising budget?</p>
    <div class="chip-select">
      <button class="chip">< $1K</button>
      <button class="chip">$1K - $5K</button>
      <button class="chip active">$5K - $20K</button>
      <button class="chip">$20K+</button>
    </div>
  </div>
</div>
```

**Input variants:**
- `chip-select` — Quick-select options
- `text-input` — Free text field
- `slider-input` — Numeric range
- `file-upload` — Image/document upload
- `confirmation` — Yes/No with explanation

#### ProgressCard

```html
<div class="card progress-card">
  <div class="card-body">
    <div class="progress-step done">✅ Analyzing website...</div>
    <div class="progress-step active">◉ Researching market...</div>
    <div class="progress-step pending">○ Building audience segments</div>
    <div class="progress-step pending">○ Generating strategy</div>
    <div class="progress-bar">
      <div class="progress-fill" style="width: 42%"></div>
    </div>
    <span class="progress-label">42% complete</span>
  </div>
</div>
```

#### AutoActionCard

```html
<div class="card auto-action-card">
  <div class="card-header">
    <span class="auto-badge">✅ AUTO-ACTION</span>
    <span class="timestamp">2:14 PM</span>
  </div>
  <div class="card-body">
    <p>Added 12 negative keywords to Google Search campaign.</p>
    <p class="impact">Est. savings: $45/week</p>
    <p class="policy">Policy: Pre-authorized (negative keywords)</p>
  </div>
  <div class="card-actions">
    <button class="btn btn-ghost btn-sm">View Details</button>
    <button class="btn btn-ghost btn-sm">Undo</button>
  </div>
</div>
```

#### MilestoneCard

```html
<div class="card milestone-card">
  <div class="card-body">
    <div class="milestone-icon">🏆</div>
    <h3>ROAS Target Reached!</h3>
    <p>Blended ROAS hit 1.5x — up from 0.84x at start.</p>
    <div class="sparkline">▁▂▂▃▃▄▅▅▆▇</div>
    <p>Ready for Stage 2?</p>
  </div>
  <div class="card-actions">
    <button class="btn btn-primary">Move to Stage 2 →</button>
    <button class="btn btn-secondary">Stay in Stage 1</button>
  </div>
</div>
```

### 5.3 Quick Action Chips

Contextual chips that appear above the input area based on current stage:

```
Discovery stage:
[📝 Edit my answers]  [❓ What happens next?]

Execution stage:
[📊 This week's stats]  [💰 Budget status]  [🔗 Account status]

Weekly Sync stage:
[📊 Latest report]  [📋 Action items]  [⚠️ Active alerts]

Optimization stage:
[♡ Heartbeat status]  [📊 Weekly report]  [⚙️ OpenClaw settings]
```

---

## 6. Interaction Patterns

### 6.1 The OpenClaw Communication Rhythm

Based on the "Pepper Potts" pattern, Auxora communicates on a predictable cadence:

| Time | Type | Content |
|------|------|---------|
| 8:00 AM Mon | Weekly Briefing | Full weekly sync report card |
| 8:00 AM Tue-Fri | Daily Briefing | Quick daily stats card |
| Real-time | Alert | OpenClaw threshold breaches |
| Real-time | Auto-Action | Completed autonomous actions |
| End of month | Monthly Review | Strategy assessment card |
| On milestone | Celebration | Achievement card |

### 6.2 Message Flow Rules

**Auxora messages:**
- Always start with avatar on left
- Text messages use regular weight, warm tone
- Cards appear after a brief typing indicator (500ms)
- Never send more than 2 messages in rapid succession (pace like a human)
- Use "..." typing indicator before complex cards (1-2 seconds)

**User messages:**
- Aligned right, no avatar
- Coral background bubble
- Sent immediately on Enter/Send

**Card interactions:**
- Approval buttons disable after tap (prevent double-tap)
- Card collapses to summary after action taken
- Undo available for 30 seconds after action
- Cards with no action after 48h show "still pending" reminder

### 6.3 Approval Flow State Machine

```
[Action Card Appears]
       │
       ├── [Approve] → Execute → [Success Card] → Done
       │                    └── [Failure Card] → Retry/Escalate
       │
       ├── [Decline] → [Acknowledged Card] → Done
       │
       ├── [Adjust] → [Edit Panel] → [Modified Action Card] → (loop)
       │
       ├── [Tell Me More] → [Detail Expansion] → (back to card)
       │
       └── [No Action 48h] → [Reminder Message] → [No Action 7d] → Auto-resolve
```

### 6.4 Progressive Disclosure Pattern

**Level 0 — Card Summary (everyone sees this):**
```
Week 3: Spend $697 | ROAS 0.84x | 15 sales
```

**Level 1 — Expanded Card (tap to see):**
```
By Channel: Meta $497 / Google $200
What Worked: Supplements audience, Video-1 creative
Needs Attention: Google learning, Broad audience CPA
```

**Level 2 — Full Report (slide-over panel):**
```
Full KPI tables by channel/campaign/audience/creative
Charts with trend lines
Detailed diagnosis text
Next week action plan with owners
Risk register
Decision log
```

### 6.5 Error & Empty States

**No data yet:**
```
┌─A─┐  Your campaigns just launched. I'll have your
└───┘  first performance data in about 48 hours.
       In the meantime, everything's running smoothly! ♡
```

**Connection error:**
```
┌─────────────────────────────────────────┐
│ ⚠️ CONNECTION ISSUE                     │
│                                         │
│ I can't reach your Meta Ads account.    │
│ This might be a temporary API issue.    │
│                                         │
│ I'll retry automatically in 30 min.     │
│ [Retry Now]  [Check Account Settings]   │
└─────────────────────────────────────────┘
```

**First time empty:**
```
┌─A─┐  Welcome to Auxora! I'm your AI growth partner.
└───┘  Let's get started — tell me about your business.

       [Start Growing →]
```

---

## 7. Mobile & Multi-Channel

### 7.1 Responsive Behavior

The chat-first design is inherently mobile-friendly. Adjustments:

**Desktop (>1024px):**
- Chat is centered, max-width 720px
- Slide-over panels appear from right (40-60% width)
- Stage rail is horizontal

**Tablet (768px-1024px):**
- Chat is full width
- Slide-over panels are 70% width
- Stage rail is horizontal but compact

**Mobile (<768px):**
- Chat is full width, full height
- Slide-over panels are full-screen (with back button)
- Stage rail collapses to current stage badge:
  `[● Execution — Week 3]`
- Quick action chips horizontally scrollable
- Cards stack vertically, full width

### 7.2 WhatsApp / Slack Mirror

The same message experience mirrors across channels:

**WhatsApp rendering:**
- Text messages → WhatsApp text
- Rich cards → WhatsApp formatted message with buttons (WhatsApp Business API interactive messages)
- Action cards → WhatsApp buttons: [Approve] [Decline] [View in App]
- Charts/tables → Image attachment + link to full view in web app
- File uploads → WhatsApp media message

**Slack rendering:**
- Text messages → Slack message
- Rich cards → Slack Block Kit (sections, fields, buttons)
- Action cards → Slack interactive messages with buttons
- Charts/tables → Slack attachment with image
- Deep links back to web app for full detail

**Sync rules:**
- Messages sent from any channel appear in all channels
- Actions taken in WhatsApp update the web app immediately
- Web app shows channel indicator: "Approved via WhatsApp ✓"
- Unread indicators sync across channels

### 7.3 Push Notifications

**Critical (immediate push):**
- OpenClaw critical alerts (ROAS crash, budget depleted)
- Account connection failures
- Campaign paused by platform

**Important (daily digest):**
- Morning briefing
- Weekly report ready
- Pending approvals reminder

**Optional (in-app only):**
- Auto-action completed
- Milestone approaching
- Optimization suggestions

---

## 8. Design Tokens

### 8.1 Colors (Warm Coral Theme — Updated)

```css
:root {
  /* ── Primary ── */
  --color-coral: #C4704A;
  --color-coral-hover: #B05A3A;
  --color-coral-light: #D97757;
  --color-coral-glow: #E8956F;
  --color-coral-10: rgba(196, 112, 74, 0.10);
  --color-coral-20: rgba(196, 112, 74, 0.20);

  /* ── Backgrounds ── */
  --bg-page: #FAF7F2;
  --bg-surface: #FFFFFF;
  --bg-muted: #F5EDE3;
  --bg-input: #F9F5F0;
  --bg-user-bubble: #C4704A;
  --bg-auxora-bubble: #FFFFFF;

  /* ── Text ── */
  --text-primary: #1A1A2E;
  --text-secondary: #4A4A5A;
  --text-muted: #6B7280;
  --text-inverse: #FFFFFF;
  --text-coral: #C4704A;

  /* ── Semantic ── */
  --color-success: #22C55E;
  --color-success-light: #F0FDF4;
  --color-warning: #F59E0B;
  --color-warning-light: #FFFBEB;
  --color-error: #EF4444;
  --color-error-light: #FEF2F2;
  --color-info: #3B82F6;
  --color-info-light: #EFF6FF;

  /* ── Stage Rail ── */
  --stage-complete: #C4704A;
  --stage-active: #C4704A;
  --stage-locked: #D1D5DB;
  --stage-blocked: #F59E0B;

  /* ── Borders ── */
  --border-subtle: rgba(26, 26, 46, 0.08);
  --border-medium: rgba(26, 26, 46, 0.15);
  --border-strong: rgba(26, 26, 46, 0.25);
  --border-coral: #C4704A;
}
```

### 8.2 Typography

```css
:root {
  /* ── Font Families ── */
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-display: 'Montserrat', 'Inter', sans-serif;
  --font-mono: 'IBM Plex Mono', 'SF Mono', monospace;

  /* ── Font Sizes ── */
  --text-xs: 0.75rem;     /* 12px — Timestamps, badges */
  --text-sm: 0.875rem;    /* 14px — Secondary text, labels */
  --text-base: 1rem;      /* 16px — Body text, chat messages */
  --text-lg: 1.125rem;    /* 18px — Card titles */
  --text-xl: 1.25rem;     /* 20px — Section headers */
  --text-2xl: 1.5rem;     /* 24px — Page titles */
  --text-3xl: 2rem;       /* 32px — Hero text */
  --text-kpi: 1.75rem;    /* 28px — KPI values */

  /* ── Font Weights ── */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* ── Line Heights ── */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
}
```

### 8.3 Spacing & Radius

```css
:root {
  /* ── Spacing ── */
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */

  /* ── Border Radius ── */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-2xl: 24px;
  --radius-full: 9999px;

  /* ── Card radius ── */
  --radius-card: var(--radius-xl);
  --radius-bubble: var(--radius-lg);
  --radius-button: var(--radius-full);
  --radius-input: var(--radius-md);
  --radius-badge: var(--radius-full);
  --radius-chip: var(--radius-full);

  /* ── Shadows ── */
  --shadow-sm: 0 1px 2px rgba(26, 26, 46, 0.04);
  --shadow-md: 0 2px 8px rgba(26, 26, 46, 0.06);
  --shadow-lg: 0 4px 16px rgba(26, 26, 46, 0.08);
  --shadow-xl: 0 8px 32px rgba(26, 26, 46, 0.10);
  --shadow-card: 0 2px 12px rgba(26, 26, 46, 0.06);
  --shadow-coral: 0 8px 25px rgba(196, 112, 74, 0.25);
}
```

### 8.4 Animations

```css
:root {
  /* ── Transitions ── */
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
  --transition-slow: 400ms ease;

  /* ── Animations ── */
  --anim-fade-in: fadeIn 300ms ease;
  --anim-slide-up: slideUp 300ms ease;
  --anim-slide-right: slideRight 400ms ease;
  --anim-heartbeat: heartbeat 2s infinite;
  --anim-typing: typing 1.4s infinite;
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes typing {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideRight {
  from { opacity: 0; transform: translateX(-100%); }
  to { opacity: 1; transform: translateX(0); }
}
```

---

## 9. Acceptance Criteria

### 9.1 Novice User (D2C Brand Owner)

- [ ] Can complete Discovery → Strategy → Contract in under 30 minutes without help
- [ ] Never needs to understand ad-tech terminology
- [ ] Can approve/decline recommendations with one tap
- [ ] Receives proactive updates without logging in (via WhatsApp/Slack)
- [ ] Can see current business health in under 5 seconds (daily briefing card)
- [ ] Never encounters a screen with more than 3 actions to choose from
- [ ] Stage rail clearly shows where they are and what's next

### 9.2 Advanced User (Marketing Professional)

- [ ] Can access full 4-level KPI data (channel → campaign → audience → creative)
- [ ] Can edit strategy assumptions, budget splits, and audience targeting
- [ ] Can configure OpenClaw trust boundaries and auto-action policies
- [ ] Can download full reports as PDF
- [ ] Can view decision log and audit trail
- [ ] Slide-over panels provide full operational depth

### 9.3 System Behavior

- [ ] OpenClaw heartbeat runs on schedule (every 30 min)
- [ ] Alerts appear in chat within 1 minute of detection
- [ ] Auto-actions log with full audit trail (policy snapshot, why, impact, rollback)
- [ ] Stage gates enforce progression (cannot skip without completing requirements)
- [ ] WhatsApp/Slack messages mirror web chat bidirectionally
- [ ] All critical mutations produce decision log entries

### 9.4 Performance

- [ ] Chat loads in under 2 seconds
- [ ] Cards render in under 500ms
- [ ] Slide-over panels open in under 300ms
- [ ] Works on mobile (iOS Safari, Chrome) without layout breaks
- [ ] Works offline with cached data (read-only mode)

---

## Appendix A: Page Map

```
/                       → Landing page
/app                    → Chat interface (main)
/app/report/:id         → Slide-over: Full GTM report
/app/weekly/:id         → Slide-over: Full weekly sync
/app/agreement/:id      → Slide-over: Full agreement
/app/settings           → Slide-over: Settings
/app/settings/openclaw  → Slide-over: OpenClaw policy
/login                  → Authentication
/signup                 → New account (→ redirects to /app)
```

## Appendix B: Card Type → Stage Mapping

| Card Type | Discovery | Strategy | Contract | Execution | Weekly Sync | Optimization |
|-----------|:---------:|:--------:|:--------:|:---------:|:-----------:|:------------:|
| TextMessage | ● | ● | ● | ● | ● | ● |
| QuestionCard | ● | ● | ● | ● | | |
| ReportCard | ● | | | | ● | ● |
| ActionCard | | ● | | | ● | ● |
| ProgressCard | ● | | | ● | | |
| ChecklistCard | | | | ● | | |
| AlertCard | | | | | | ● |
| AutoActionCard | | | | | | ● |
| MilestoneCard | | | | ● | ● | ● |
| AgreementCard | | | ● | | | |

## Appendix C: Storyboard Summary (8 Key Scenes)

| Scene | Stage | User Action | Auxora Response | Card Type |
|-------|-------|-------------|-----------------|-----------|
| 1 | Discovery | Enters website URL | Asks follow-up questions | QuestionCard |
| 2 | Discovery | Answers 5-7 questions | "Researching now..." | ProgressCard |
| 3 | Discovery | Waits | Delivers GTM report | ReportCard |
| 4 | Strategy | Confirms assumptions | Presents next decision | ActionCard |
| 5 | Contract | Signs agreement | "Let's set up accounts" | AgreementCard |
| 6 | Execution | Grants access | "Campaigns are live!" | ChecklistCard |
| 7 | Weekly Sync | Reviews weekly report | "Here are my recommendations" | ReportCard + ActionCard |
| 8 | Optimization | Approves alert action | "Done! Monitoring results." | AlertCard → AutoActionCard |

---

*This document is the complete UI/UX design scheme for Auxora.ai v2. It defines the interaction model, visual system, component library, and user journey for the first end-to-end vibe business agent. Ready for implementation.*
