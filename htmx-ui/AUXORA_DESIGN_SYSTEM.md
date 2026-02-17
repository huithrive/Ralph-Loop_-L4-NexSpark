# Auxora Design System (OpenClaw Style)

A warm, light theme design system based on the Alexandar CGO design document.

## Quick Start

To use the Auxora theme instead of the default dark theme:

```html
<!-- Replace this -->
<link rel="stylesheet" href="/css/nexspark.css">
<link rel="stylesheet" href="/css/guided.css">

<!-- With this -->
<link rel="stylesheet" href="/css/auxora.css">
<link rel="stylesheet" href="/css/guided.css">
```

---

## Design Tokens

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--primary-coral` | `#C4704A` | Primary actions, accents |
| `--primary-coral-hover` | `#B05A3A` | Hover states |
| `--primary-coral-light` | `#D97757` | Lighter variant |
| `--primary-coral-glow` | `#E8956F` | Gradients, glows |
| `--bg-primary` | `#FAF7F2` | Page background |
| `--bg-surface` | `#FFFFFF` | Cards, panels |
| `--bg-muted` | `#F5EDE3` | Input backgrounds |
| `--text-primary` | `#1A1A2E` | Headings, body |
| `--text-muted` | `#6B7280` | Secondary text |
| `--success` | `#22C55E` | Success states |
| `--error` | `#EF4444` | Error states |
| `--warning` | `#F59E0B` | Warning states |
| `--info` | `#3B82F6` | Info states |

### Typography

| Token | Value | Usage |
|-------|-------|-------|
| `--font-body` | `'Inter'` | Body text |
| `--font-display` | `'Montserrat'` | Headings, logo |
| `--font-mono` | `'IBM Plex Mono'` | Code, inputs |

### Spacing & Radius

| Token | Value |
|-------|-------|
| `--radius-sm` | `6px` |
| `--radius-md` | `12px` |
| `--radius-lg` | `16px` |
| `--radius-xl` | `20px` |
| `--radius-full` | `9999px` |

### Shadows

| Token | Value |
|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(26, 26, 46, 0.04)` |
| `--shadow-md` | `0 2px 8px rgba(26, 26, 46, 0.06)` |
| `--shadow-lg` | `0 4px 16px rgba(26, 26, 46, 0.08)` |
| `--shadow-coral` | `0 8px 25px rgba(196, 112, 74, 0.35)` |

---

## Components

### Buttons

```html
<!-- Primary Button (Coral, rounded) -->
<button class="btn btn-primary">Start a project</button>

<!-- Secondary Button (Outline) -->
<button class="btn btn-secondary">See packages</button>

<!-- Ghost Button -->
<button class="btn btn-ghost">Learn more</button>

<!-- Icon Button -->
<button class="btn btn-icon">
  <svg>...</svg>
</button>
```

### Cards

```html
<!-- Standard Card -->
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Card Title</h3>
    <p class="card-subtitle">Optional subtitle</p>
  </div>
  <div class="card-body">
    Content here
  </div>
</div>

<!-- Glass Card (Signature Auxora style) -->
<div class="glass-card">
  Content with subtle border and shadow
</div>
```

### Badges

```html
<span class="badge badge-coral">AI Powered</span>
<span class="badge badge-success">Complete</span>
<span class="badge badge-warning">Pending</span>
<span class="badge badge-error">Failed</span>
<span class="badge badge-info">New</span>
```

### Inputs

```html
<!-- Standard Input -->
<input type="text" class="input" placeholder="Enter text...">

<!-- Input with Icon -->
<div class="input-with-icon">
  <svg class="input-icon">...</svg>
  <input type="url" class="input" placeholder="https://your-website.com">
</div>
```

### Progress Bar

```html
<div class="progress-bar">
  <div class="progress-bar-fill" style="width: 65%"></div>
</div>
```

---

## Alexandar Agent UI

Special components for the AI agent interface.

### Agent Avatar

```html
<div class="alex-avatar">A</div>
<div class="alex-avatar thinking">A</div>
```

### Briefing Card

```html
<div class="alex-briefing">
  <div class="alex-briefing-header">
    <div class="alex-avatar">A</div>
    <div>
      <div class="alex-briefing-title">Morning Briefing</div>
      <div class="alex-briefing-date">February 17, 2026</div>
    </div>
  </div>

  <div class="alex-briefing-metrics">
    <div class="alex-metric">
      <div class="alex-metric-label">Spend</div>
      <div class="alex-metric-value">$47.83</div>
      <div class="alex-metric-change positive">On track</div>
    </div>
    <!-- More metrics -->
  </div>
</div>
```

### Action Card

```html
<div class="alex-action-card">
  <div class="alex-action-header">
    <div class="alex-action-icon">💰</div>
    <span class="alex-action-title">Budget Adjustment Recommended</span>
  </div>
  <div class="alex-action-content">
    Vitamin audience is performing at 1.52x ROAS.
    Recommendation: Scale budget 30%.
  </div>
  <div class="alex-action-buttons">
    <button class="btn btn-primary">Approve</button>
    <button class="btn btn-secondary">Decline</button>
  </div>
</div>
```

### Typing Indicator

```html
<div class="typing-indicator">
  <span class="typing-dot"></span>
  <span class="typing-dot"></span>
  <span class="typing-dot"></span>
</div>
```

---

## Layout

### Split Layout (Chat + Canvas)

```html
<div class="app-shell">
  <header class="topbar">
    <div class="topbar-left">
      <div class="topbar-logo">
        <div class="logo-icon">N</div>
        <span class="logo-text">NexSpark</span>
      </div>
    </div>
    <div class="topbar-right">
      <div class="status-indicator">
        <span class="status-dot"></span>
        All Systems Online
      </div>
    </div>
  </header>

  <div class="split-layout">
    <aside class="chat-panel">
      <div class="chat-messages">...</div>
      <div class="chat-input-area">...</div>
    </aside>

    <section class="canvas-panel">
      <div class="canvas-tabs">...</div>
      <div class="canvas-body">...</div>
    </section>
  </div>
</div>
```

---

## Feature Cards

```html
<div class="feature-grid">
  <div class="feature-card">
    <div class="feature-icon">
      <svg>...</svg>
    </div>
    <h3 class="feature-title">AI Strategy</h3>
    <p class="feature-desc">
      Deep market research and competitor analysis powered by AI.
    </p>
  </div>
  <!-- More cards -->
</div>
```

---

## Pricing Cards

```html
<div class="pricing-grid">
  <div class="pricing-card">
    <div class="pricing-tier">Strategy Report</div>
    <div class="pricing-price">$1.99</div>
    <div class="pricing-period">One-time</div>
    <ul class="pricing-features">
      <li class="pricing-feature">
        <svg>✓</svg>
        Deep market research
      </li>
      <!-- More features -->
    </ul>
    <button class="btn btn-secondary">Get Started</button>
  </div>

  <div class="pricing-card featured">
    <div class="pricing-tier">Full Vibe Business</div>
    <div class="pricing-price">$20</div>
    <div class="pricing-period">+ ad spend</div>
    <ul class="pricing-features">...</ul>
    <button class="btn btn-primary">Start Vibing</button>
  </div>
</div>
```

---

## Animation Classes

```css
.animate-fade-in      /* Fade in with slight upward motion */
.animate-slide-in-left  /* Slide in from left */
.animate-slide-in-right /* Slide in from right */
```

---

## Utility Classes

```css
/* Text Colors */
.text-coral    /* Primary coral */
.text-muted    /* Muted gray */
.text-success  /* Green */
.text-error    /* Red */

/* Backgrounds */
.bg-muted      /* Muted cream */
.bg-surface    /* White */

/* Typography */
.font-display  /* Montserrat */
.font-mono     /* IBM Plex Mono */

/* Border Radius */
.rounded-lg    /* 16px */
.rounded-xl    /* 20px */
.rounded-full  /* Pill shape */
```

---

## Design Principles

1. **Warm & Approachable** - Light cream backgrounds with coral accents create a friendly, professional feel

2. **Generous Spacing** - More whitespace than typical dark themes; content breathes

3. **Subtle Depth** - Light shadows and borders instead of heavy drop shadows

4. **Coral as Action** - Reserve `--primary-coral` for interactive elements and calls-to-action

5. **Rounded Everything** - Use `--radius-lg` or `--radius-full` for a modern, soft look

---

## Files

- `/public/css/auxora.css` - Full Auxora theme CSS
- `/public/css/nexspark.css` - Original dark theme (still available)
- `/public/css/guided.css` - Guided flow styles (works with both themes)

---

## Credits

Based on the **Alexandar: Chief Growth Officer** design document from the Auxora project, implementing the OpenClaw "Pepper Potts" pattern for AI-driven growth platforms.
