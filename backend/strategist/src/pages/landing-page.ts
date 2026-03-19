// Auxora Landing Page — Solopreneur ICP v3
// Pivoted from D2C / CPG brands → one-person businesses, solo practitioners, freelancers
//
// SEO primary keywords:
//   "AI marketing for solopreneurs"
//   "virtual CMO for small business"
//   "done for you marketing solopreneur"
//   "solopreneur marketing automation"
//   "therapist private practice marketing"
//   "AI tools for one person business"
//   "freelancer get more clients AI"
//   "affordable Meta ads for small business"
//   "marketing on autopilot solopreneur"
//
// Organic growth strategy:
//   - Reddit-ready copy (r/freelance, r/solopreneur, r/entrepreneur)
//   - LinkedIn outreach–aligned messaging
//   - Blog SEO hooks embedded in section copy
//   - Three value-prop variants: time-saving | growth/outcome | expertise/cost
//   - CTA: "Get Early Access" (email capture) + "$4.99 GTM report"

export const REVISED_LANDING_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- ═══ SEO: Primary title — high-intent solopreneur queries ═══ -->
  <title>Auxora — Your Virtual CMO | Strategy, Ads &amp; SEO Done in 48 Hours from $49</title>
  <meta name="description" content="28 million one-person businesses in the US have no marketing team. Auxora is your AI virtual CMO — marketing strategy, landing page, Meta &amp; Google ads, SEO and email flows. Everything that takes 30 days and $2,000+ to set up, done in 48 hours from $49.">

  <!-- Open Graph -->
  <meta property="og:title" content="Auxora — The Virtual CMO for One-Person Businesses">
  <meta property="og:description" content="28M US businesses run solo with no marketing team. Auxora gives you AI-powered strategy, ads, SEO and landing pages — everything that costs $2,000+ to set up elsewhere, done in 48 hours from $49.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://auxora.ai">
  <meta property="og:image" content="https://auxora.ai/static/og-image.png">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Auxora — Virtual CMO for One-Person Businesses">
  <meta name="twitter:description" content="No marketing team? No problem. Auxora handles your strategy, ads, SEO and landing pages — done in 48 hours from $49. 28 million solo businesses. Built for you.">

  <!-- Canonical -->
  <link rel="canonical" href="https://auxora.ai">

  <!-- Structured Data: SoftwareApplication -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Auxora",
    "url": "https://auxora.ai",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "description": "AI-powered virtual CMO for one-person businesses. Marketing strategy, landing pages, Meta & Google ads, SEO and email flows — everything that takes 30 days and $2,000+ to set up elsewhere, done in 48 hours from $49.",
    "offers": [
      {
        "@type": "Offer",
        "name": "GTM Strategy Report",
        "price": "4.99",
        "priceCurrency": "USD",
        "description": "Your complete go-to-market plan — ICP, positioning, channels, SEO keywords — delivered in minutes."
      },
      {
        "@type": "Offer",
        "name": "Growth Build",
        "price": "200",
        "priceCurrency": "USD",
        "description": "Full marketing stack: landing page, ad creatives, 1 live ad channel, email flows — delivered in 24 hours."
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "53"
    }
  }
  </script>

  <!-- Organization structured data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Auxora",
    "url": "https://auxora.ai",
    "description": "AI-powered virtual CMO and done-for-you marketing platform. Your marketing on autopilot — SEO, Meta ads, Google ads, email flows for solo entrepreneurs.",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "email": "hello@auxora.ai"
    }
  }
  </script>

  <!-- Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-EBTW4ZCV98"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-EBTW4ZCV98');
  </script>

  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

  <style>
    :root {
      --cream:  #FAF7F4;
      --warm:   #F5EFE8;
      --border: #EDE4D9;
      --ink:    #1C1917;
      --muted:  #7A6E65;
      --rust:   #BF6744;
      --rust-l: #D4845C;
      --sage:   #4A6741;
      --sage-l: #6E8B5E;
      --dark:   #252220;
      --darker: #1A1816;
      --gold:   #D4A853;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      font-family: 'Inter', sans-serif;
      background: var(--cream);
      color: var(--ink);
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
    }

    /* ── Typography ── */
    .editorial { font-family: 'Playfair Display', Georgia, serif; }
    .eyebrow {
      font-size: 11px; font-weight: 700;
      letter-spacing: 0.14em; text-transform: uppercase;
      color: var(--rust);
    }

    /* ── Marquee ticker ── */
    .ticker-wrap { overflow: hidden; }
    .ticker-track {
      display: flex; width: max-content;
      animation: marquee 32s linear infinite;
    }
    @keyframes marquee {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }

    /* ── Utility ── */
    .section { padding: 88px 24px; }
    .container { max-width: 1200px; margin: 0 auto; }

    .badge {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
      text-transform: uppercase; border-radius: 100px;
      padding: 5px 14px;
    }
    .badge-rust  { background: #FDF2EE; color: var(--rust); }
    .badge-sage  { background: #EEF3EC; color: var(--sage); }
    .badge-gold  { background: #FBF3E3; color: var(--gold); }

    .card {
      background: white;
      border: 1px solid var(--border);
      border-radius: 20px;
      transition: box-shadow 0.2s;
    }
    .card:hover { box-shadow: 0 8px 32px rgba(28,25,23,0.08); }

    .btn-primary {
      display: inline-flex; align-items: center; gap: 10px;
      background: var(--rust); color: white;
      font-weight: 700; font-size: 15px;
      border-radius: 12px; padding: 16px 32px;
      border: none; cursor: pointer;
      transition: background 0.2s, transform 0.15s;
      text-decoration: none;
    }
    .btn-primary:hover { background: var(--rust-l); transform: translateY(-2px); }

    .btn-ghost {
      display: inline-flex; align-items: center; gap: 10px;
      background: transparent; color: var(--ink);
      font-weight: 600; font-size: 14px;
      border: 1.5px solid var(--border);
      border-radius: 12px; padding: 14px 28px;
      cursor: pointer; transition: border-color 0.2s, background 0.2s;
      text-decoration: none;
    }
    .btn-ghost:hover { border-color: var(--rust); background: #FDF2EE; }

    /* ── Nav ── */
    nav {
      position: sticky; top: 0; z-index: 100;
      background: rgba(250,247,244,0.94);
      backdrop-filter: blur(14px);
      border-bottom: 1px solid var(--border);
      padding: 0 24px;
    }
    .nav-inner {
      max-width: 1200px; margin: 0 auto;
      height: 64px; display: flex;
      align-items: center; justify-content: space-between;
    }
    .nav-logo {
      font-family: 'Playfair Display', serif;
      font-size: 22px; font-weight: 700;
      color: var(--ink); text-decoration: none;
      letter-spacing: -0.02em;
    }
    .nav-links { display: flex; align-items: center; gap: 28px; }
    .nav-links a {
      font-size: 14px; font-weight: 500;
      color: var(--muted); text-decoration: none;
      transition: color 0.2s;
    }
    .nav-links a:hover { color: var(--ink); }
    @media (max-width: 640px) { .nav-links { display: none; } }

    /* ── Hero ── */
    .hero { padding: 84px 24px 68px; background: var(--cream); }
    .hero-inner { max-width: 780px; margin: 0 auto; text-align: center; }
    .hero h1 {
      font-family: 'Playfair Display', serif;
      font-size: clamp(40px, 5.5vw, 74px);
      line-height: 1.07; color: var(--ink);
      margin-bottom: 24px; letter-spacing: -0.02em;
    }
    .hero h1 em { color: var(--rust); font-style: italic; }
    .hero-sub {
      font-size: clamp(16px, 2vw, 20px);
      color: var(--muted); line-height: 1.7;
      max-width: 580px; margin: 0 auto 40px;
    }
    .hero-ctas {
      display: flex; align-items: center;
      justify-content: center; gap: 16px; flex-wrap: wrap;
    }
    .hero-trust {
      margin-top: 44px; font-size: 12px; color: var(--muted);
      display: flex; align-items: center;
      justify-content: center; gap: 20px; flex-wrap: wrap;
    }
    .hero-trust span { display: flex; align-items: center; gap: 6px; }

    /* ── Social proof logos row ── */
    .as-seen-bar {
      background: var(--warm);
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
      padding: 20px 24px;
      text-align: center;
    }
    .as-seen-label {
      font-size: 10px; font-weight: 700;
      letter-spacing: 0.14em; text-transform: uppercase;
      color: var(--muted); margin-bottom: 14px;
    }
    .as-seen-logos {
      display: flex; align-items: center;
      justify-content: center; gap: 36px; flex-wrap: wrap;
    }
    .as-seen-logos span {
      font-size: 13px; font-weight: 700;
      color: var(--muted); opacity: 0.55;
      letter-spacing: 0.04em;
    }

    /* ── Proof ticker ── */
    .proof-ticker {
      background: var(--ink); padding: 12px 0;
    }
    .proof-chip {
      white-space: nowrap; font-size: 12px; font-weight: 600;
      color: rgba(255,255,255,0.75);
      padding: 0 28px;
      display: flex; align-items: center; gap: 8px;
    }
    .proof-chip .dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: var(--rust-l); flex-shrink: 0;
    }

    /* ── Pain section ── */
    .pain-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px; margin-top: 48px;
    }
    .pain-card {
      background: white; border: 1px solid var(--border);
      border-radius: 16px; padding: 28px 24px;
    }
    .pain-card .icon { font-size: 26px; margin-bottom: 14px; }
    .pain-card h3 { font-size: 16px; font-weight: 700; color: var(--ink); margin-bottom: 8px; }
    .pain-card p { font-size: 14px; color: var(--muted); line-height: 1.65; }

    /* ── Steps ── */
    .steps {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 24px; margin-top: 56px;
    }
    .step { text-align: center; padding: 32px 24px; }
    .step-num {
      width: 52px; height: 52px; border-radius: 50%;
      background: var(--rust); color: white;
      font-family: 'Playfair Display', serif;
      font-size: 22px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 20px;
    }
    .step h3 { font-size: 17px; font-weight: 700; color: var(--ink); margin-bottom: 10px; }
    .step p { font-size: 14px; color: var(--muted); line-height: 1.65; }

    /* ── Browser chrome ── */
    .browser-chrome {
      background: var(--darker);
      border-radius: 16px 16px 0 0;
      padding: 14px 20px 12px;
      display: flex; align-items: center; gap: 12px;
    }
    .browser-dots { display: flex; gap: 6px; }
    .browser-dots span { width: 12px; height: 12px; border-radius: 50%; }
    .browser-url {
      flex: 1; background: rgba(255,255,255,0.08);
      border-radius: 6px; padding: 6px 14px;
      font-size: 12px; color: rgba(255,255,255,0.5); font-family: monospace;
    }
    .browser-live { font-size: 10px; font-weight: 700; color: #4ade80; letter-spacing: 0.1em; }
    .browser-video {
      border-radius: 0 0 16px 16px; overflow: hidden; background: #FAF7F4;
    }
    .browser-video video, .browser-video img { width: 100%; display: block; }

    /* ── Pricing ── */
    .pricing-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px; margin-top: 52px;
      max-width: 960px; margin-left: auto; margin-right: auto;
    }
    .plan {
      border-radius: 20px; padding: 36px 32px;
      border: 1.5px solid var(--border);
      background: white; position: relative;
    }
    .plan.featured {
      border-color: var(--rust);
      box-shadow: 0 0 0 4px rgba(191,103,68,0.08);
    }
    .plan-badge {
      position: absolute; top: -14px; left: 50%;
      transform: translateX(-50%);
      background: var(--rust); color: white;
      font-size: 10px; font-weight: 800;
      letter-spacing: 0.12em; text-transform: uppercase;
      border-radius: 100px; padding: 5px 16px;
    }
    .plan-price {
      font-family: 'Playfair Display', serif;
      font-size: 52px; font-weight: 700;
      color: var(--ink); line-height: 1;
    }
    .plan-price sup { font-size: 22px; vertical-align: super; line-height: 1; font-weight: 400; }
    .plan-label { font-size: 12px; color: var(--muted); margin-top: 6px; margin-bottom: 24px; }
    .plan-features { list-style: none; margin-bottom: 32px; }
    .plan-features li {
      display: flex; align-items: flex-start; gap: 10px;
      font-size: 14px; color: var(--ink);
      padding: 8px 0; border-bottom: 1px solid var(--border);
    }
    .plan-features li:last-child { border-bottom: none; }
    .plan-features li i { color: var(--sage); margin-top: 2px; flex-shrink: 0; }

    /* ── Testimonials ── */
    .testi {
      padding: 36px; background: white;
      border: 1px solid var(--border); border-radius: 20px;
    }
    .testi-quote {
      font-size: 42px; line-height: 1;
      font-family: 'Playfair Display', serif;
      color: var(--rust); margin-bottom: -8px;
    }
    .testi-text {
      font-size: 15px; color: #3D3530;
      line-height: 1.8; margin-bottom: 24px;
    }
    .testi-avatar {
      width: 40px; height: 40px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-family: 'Playfair Display', serif;
      font-size: 17px; font-weight: 700; color: white; flex-shrink: 0;
    }
    .stars { display: flex; gap: 3px; }
    .stars i { color: var(--rust-l); font-size: 12px; }

    /* ── Dark sections ── */
    .dark-section { background: var(--dark); color: rgba(255,255,255,0.9); }
    .dark-section .eyebrow { color: var(--rust-l); }

    /* ── FAQ ── */
    .faq-item { border-bottom: 1px solid var(--border); padding: 20px 0; }
    .faq-q {
      font-size: 16px; font-weight: 600; color: var(--ink);
      cursor: pointer; display: flex; justify-content: space-between; align-items: center;
    }
    .faq-a {
      font-size: 14px; color: var(--muted); line-height: 1.75;
      margin-top: 12px; display: none;
    }
    .faq-item.open .faq-a { display: block; }
    .faq-item.open .faq-icon { transform: rotate(45deg); }
    .faq-icon { transition: transform 0.2s; color: var(--muted); }

    /* ── Early access form ── */
    .access-form {
      display: flex; gap: 12px; flex-wrap: wrap;
      justify-content: center; max-width: 520px; margin: 0 auto;
    }
    .access-form input[type="email"] {
      flex: 1; min-width: 240px;
      padding: 16px 20px; border-radius: 12px;
      border: 1.5px solid var(--border);
      font-size: 15px; color: var(--ink);
      background: white; outline: none;
      transition: border-color 0.2s;
    }
    .access-form input[type="email"]:focus { border-color: var(--rust); }
    .access-form input::placeholder { color: var(--muted); }

    /* ── Challenge pills ── */
    .challenge-pills {
      display: flex; gap: 10px; flex-wrap: wrap;
      justify-content: center; margin-top: 18px;
    }
    .challenge-pill {
      padding: 8px 18px; border-radius: 100px;
      border: 1.5px solid var(--border);
      font-size: 13px; font-weight: 500; color: var(--muted);
      cursor: pointer; transition: all 0.2s;
      background: white;
    }
    .challenge-pill:hover,
    .challenge-pill.selected {
      border-color: var(--rust); color: var(--rust);
      background: #FDF2EE;
    }

    /* ── Footer ── */
    footer { background: var(--darker); color: rgba(255,255,255,0.5); padding: 48px 24px 32px; }
    .footer-inner {
      max-width: 1200px; margin: 0 auto;
      display: flex; justify-content: space-between;
      align-items: flex-start; flex-wrap: wrap; gap: 32px;
    }
    footer a { color: rgba(255,255,255,0.5); text-decoration: none; }
    footer a:hover { color: rgba(255,255,255,0.85); }

    /* ── Responsive ── */
    @media (max-width: 768px) {
      .section { padding: 60px 20px; }
      .hero { padding: 56px 20px 48px; }
    }
    @media (max-width: 560px) {
      .access-form { flex-direction: column; }
      .access-form input[type="email"] { min-width: 100%; }
    }

    /* ── Scroll-in animation ── */
    .fade-up {
      opacity: 0; transform: translateY(24px);
      transition: opacity 0.6s ease, transform 0.6s ease;
    }
    .fade-up.visible { opacity: 1; transform: translateY(0); }
  </style>
</head>
<body>

<!-- ═══════════════════════════════════════
     NAV
═══════════════════════════════════════ -->
<nav aria-label="Main navigation">
  <div class="nav-inner">
    <a href="/" class="nav-logo">Auxora</a>
    <div class="nav-links">
      <a href="#how-it-works">How it works</a>
      <a href="#who-its-for">Who it's for</a>
      <a href="#pricing">Pricing</a>
      <a href="#results">Results</a>
      <a href="#faq">FAQ</a>
    </div>
    <a href="#early-access" class="btn-primary" style="padding:10px 22px;font-size:13px;">
      Get Early Access <i class="fas fa-arrow-right"></i>
    </a>
  </div>
</nav>


<!-- ═══════════════════════════════════════
     HERO
     SEO target: "AI marketing for solopreneurs"
                 "replace your marketing agency with AI"
                 "get clients without an agency"
═══════════════════════════════════════ -->
<section class="hero" id="hero" aria-labelledby="hero-h1">
  <div class="hero-inner">

    <p class="eyebrow" style="margin-bottom:20px;">
      <i class="fas fa-circle" style="font-size:7px;vertical-align:middle;margin-right:6px;color:var(--sage);"></i>
      28 million one-person businesses in the US — none of them have a marketing team
    </p>

    <h1 id="hero-h1">
      Your marketing,<br/>
      <em>on autopilot.</em>
    </h1>

    <p class="hero-sub">
      Auxora is your <strong>AI-powered virtual CMO</strong> — strategy, landing page, 
      Meta &amp; Google ads, SEO and email flows. Everything that normally takes 
      <strong>30 days and $2,000+ to set up</strong>, done for you in 48 hours 
      starting at <strong>$49</strong>.
    </p>

    <div class="hero-ctas">
      <a href="#early-access" class="btn-primary" style="font-size:16px;padding:17px 34px;">
        Get Early Access — Free
        <i class="fas fa-arrow-right"></i>
      </a>
    </div>

    <div class="hero-trust">
      <span><i class="fas fa-check-circle" style="color:var(--sage);"></i> Start from $49</span>
      <span><i class="fas fa-check-circle" style="color:var(--sage);"></i> Clients in 48 hours</span>
      <span><i class="fas fa-check-circle" style="color:var(--sage);"></i> Pay only when ads perform</span>
      <span><i class="fas fa-star" style="color:var(--gold);"></i> 4.9 / 5 · 53 early users</span>
    </div>

  </div>
</section>


<!-- ═══════════════════════════════════════
     THREE VALUE PROP VARIANTS
     (mirrors the A/B messaging in GTM plan)
═══════════════════════════════════════ -->
<div style="background:var(--warm);border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:32px 24px;">
  <div class="container">
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:0;max-width:900px;margin:0 auto;">

      <!-- Pillar 1: Auto-drive marketing -->
      <div style="padding:24px 28px;border-right:1px solid var(--border);text-align:center;" class="resp-card">
        <div style="font-size:28px;margin-bottom:10px;">🚗</div>
        <h3 style="font-size:15px;font-weight:700;color:var(--ink);margin-bottom:8px;">Marketing on autopilot —<br/>like auto-drive for growth</h3>
        <p style="font-size:13px;color:var(--muted);line-height:1.6;">Describe your business once. Auxora builds, launches and optimises your ads and content — fully done for you, every day, without lifting a finger.</p>
      </div>

      <!-- Pillar 2: Done-for-you results -->
      <div style="padding:24px 28px;border-right:1px solid var(--border);text-align:center;" class="resp-card">
        <div style="font-size:28px;margin-bottom:10px;">📈</div>
        <h3 style="font-size:15px;font-weight:700;color:var(--ink);margin-bottom:8px;">Clients in — not just<br/>a strategy document out</h3>
        <p style="font-size:13px;color:var(--muted);line-height:1.6;">From your first message to a live campaign with real traffic. We measure success in revenue, not reports.</p>
      </div>

      <!-- Pillar 3: cheaper than Yelp + no setup fees -->
      <div style="padding:24px 28px;text-align:center;" class="resp-card">
        <div style="font-size:28px;margin-bottom:10px;">💰</div>
        <h3 style="font-size:15px;font-weight:700;color:var(--ink);margin-bottom:8px;">From $49 — a fraction of<br/>what it costs anywhere else</h3>
        <p style="font-size:13px;color:var(--muted);line-height:1.6;">Strategy, ads, SEO and landing pages together normally take 30 days and $2,000+ to set up. Auxora does it all in 48 hours, starting at $49.</p>
      </div>

    </div>
  </div>
</div>


<!-- ═══════════════════════════════════════
     PROOF TICKER
═══════════════════════════════════════ -->
<div class="proof-ticker" aria-label="Early user results">
  <div class="ticker-wrap">
    <div class="ticker-track">
      <div style="display:flex;align-items:center;gap:0;">
        <div class="proof-chip"><span class="dot"></span>Freelance consultant — 3 new retainer clients in 3 weeks</div>
        <div class="proof-chip"><span class="dot" style="background:var(--sage-l);"></span>Therapist (NYC) — calendar fully booked within 5 weeks</div>
        <div class="proof-chip"><span class="dot"></span>Solo founder — first $10K MRR in 6 weeks</div>
        <div class="proof-chip"><span class="dot" style="background:var(--gold);"></span>Pest control operator — 62% lower cost per lead</div>
        <div class="proof-chip"><span class="dot"></span>Life coach — replaced $5K/month agency, same results</div>
        <div class="proof-chip"><span class="dot" style="background:var(--sage-l);"></span>One-person e-commerce — 3× ROAS on first Meta campaign</div>
        <div class="proof-chip" style="color:rgba(255,255,255,0.4);font-style:italic;font-weight:400;">
          <i class="fas fa-heart" style="color:var(--rust-l);font-size:11px;"></i> Therapists &amp; Coaches
        </div>
        <div class="proof-chip" style="color:rgba(255,255,255,0.4);font-style:italic;font-weight:400;">
          <i class="fas fa-briefcase" style="color:var(--rust-l);font-size:11px;"></i> Freelancers &amp; Consultants
        </div>
        <div class="proof-chip" style="color:rgba(255,255,255,0.4);font-style:italic;font-weight:400;">
          <i class="fas fa-tools" style="color:var(--rust-l);font-size:11px;"></i> Home Services
        </div>
        <div class="proof-chip" style="color:rgba(255,255,255,0.4);font-style:italic;font-weight:400;">
          <i class="fas fa-store" style="color:var(--rust-l);font-size:11px;"></i> Solo Founders
        </div>
      </div>
      <!-- Duplicate for seamless loop -->
      <div style="display:flex;align-items:center;gap:0;">
        <div class="proof-chip"><span class="dot"></span>Freelance consultant — 3 new retainer clients in 3 weeks</div>
        <div class="proof-chip"><span class="dot" style="background:var(--sage-l);"></span>Therapist (NYC) — calendar fully booked within 5 weeks</div>
        <div class="proof-chip"><span class="dot"></span>Solo founder — first $10K MRR in 6 weeks</div>
        <div class="proof-chip"><span class="dot" style="background:var(--gold);"></span>Pest control operator — 62% lower cost per lead</div>
        <div class="proof-chip"><span class="dot"></span>Life coach — replaced $5K/month agency, same results</div>
        <div class="proof-chip"><span class="dot" style="background:var(--sage-l);"></span>One-person e-commerce — 3× ROAS on first Meta campaign</div>
        <div class="proof-chip" style="color:rgba(255,255,255,0.4);font-style:italic;font-weight:400;">
          <i class="fas fa-heart" style="color:var(--rust-l);font-size:11px;"></i> Therapists &amp; Coaches
        </div>
        <div class="proof-chip" style="color:rgba(255,255,255,0.4);font-style:italic;font-weight:400;">
          <i class="fas fa-briefcase" style="color:var(--rust-l);font-size:11px;"></i> Freelancers &amp; Consultants
        </div>
        <div class="proof-chip" style="color:rgba(255,255,255,0.4);font-style:italic;font-weight:400;">
          <i class="fas fa-tools" style="color:var(--rust-l);font-size:11px;"></i> Home Services
        </div>
        <div class="proof-chip" style="color:rgba(255,255,255,0.4);font-style:italic;font-weight:400;">
          <i class="fas fa-store" style="color:var(--rust-l);font-size:11px;"></i> Solo Founders
        </div>
      </div>
    </div>
  </div>
</div>


<!-- ═══════════════════════════════════════
     PAIN SECTION
     SEO: "solopreneur marketing problems"
          "why solopreneurs struggle with marketing"
          "marketing too expensive solo business"
═══════════════════════════════════════ -->
<section class="section" style="background:var(--cream);" id="problem" aria-labelledby="pain-h2">
  <div class="container">
    <div style="max-width:640px;margin:0 auto;text-align:center;">
      <p class="eyebrow" style="margin-bottom:16px;">Sound familiar?</p>
      <h2 id="pain-h2" class="editorial" style="font-size:clamp(32px,4vw,52px);color:var(--ink);line-height:1.15;">
        You're great at what you do.<br/>
        <em style="color:var(--rust);">Marketing keeps getting in the way.</em>
      </h2>
      <p style="font-size:16px;color:var(--muted);margin-top:16px;line-height:1.7;">
        Most solopreneurs already spend money on TikTok, Instagram or a Yelp subscription 
        to get warm leads. But growing beyond word-of-mouth feels impossible — paid ads 
        are complex, expensive to set up, and easy to waste money on.
      </p>
    </div>

    <div class="pain-grid" style="max-width:960px;margin:48px auto 0;">
      <div class="pain-card">
        <div class="icon">💸</div>
        <h3>Meta &amp; Google ads feel like a black box</h3>
        <p>The setup alone costs $2,000 with an agency. DIY, and you burn your budget in a week with nothing to show. Most solopreneurs give up before they see results.</p>
      </div>
      <div class="pain-card">
        <div class="icon">⏳</div>
        <h3>DIY marketing eats your whole week</h3>
        <p>You became a therapist / consultant / freelancer to do the work — not to spend 12 hours A/B testing copy on Meta.</p>
      </div>
      <div class="pain-card">
        <div class="icon">🎯</div>
        <h3>Your niche isn't served by generic tools</h3>
        <p>Most marketing tools are built for e-commerce teams. You need a strategy built for your specific clients, your location, your price point.</p>
      </div>
      <div class="pain-card">
        <div class="icon">📉</div>
        <h3>Warm leads from Yelp &amp; referrals dry up</h3>
        <p>TikTok, Instagram, and a $150 Yelp plan get you started — but they plateau. Scaling to consistent inbound clients requires a real acquisition system, not just posts.</p>
      </div>
    </div>
  </div>
</section>


<!-- ═══════════════════════════════════════
     PRODUCT DEMO VIDEO
     (auto-play, loop, 3x speed — from Au-full.mp4)
═══════════════════════════════════════ -->
<section style="background:var(--ink);padding:72px 24px;" id="demo" aria-labelledby="demo-h2">
  <div class="container">
    <div style="max-width:580px;margin:0 auto 48px;text-align:center;">
      <p class="eyebrow" style="margin-bottom:16px;color:var(--rust-l);">See it in action</p>
      <h2 id="demo-h2" class="editorial" style="font-size:clamp(28px,3.5vw,48px);color:white;line-height:1.18;">
        One conversation.<br/>
        <em style="color:var(--rust-l);">Your AI team builds the rest.</em>
      </h2>
      <p style="font-size:15px;color:rgba(255,255,255,0.5);margin-top:16px;line-height:1.7;">
        Chat-as-OS: describe your business in plain language. Auxora's AI agents — 
        powered by Claude, GoMarble and Shopify integrations — produce your full 
        virtual CMO stack end-to-end. Not just advice. The actual work, done.
      </p>
    </div>

    <div style="max-width:980px;margin:0 auto;">
      <div class="browser-chrome">
        <div class="browser-dots">
          <span style="background:#FF5F57;"></span>
          <span style="background:#FEBC2E;"></span>
          <span style="background:#28C840;"></span>
        </div>
        <div class="browser-url">app.auxora.ai/workspace</div>
        <div class="browser-live">● LIVE</div>
      </div>
      <div class="browser-video">
        <video autoplay loop muted playsinline style="width:100%;display:block;">
          <source src="/static/auxora_demo.webm" type="video/webm">
          <source src="/static/auxora_demo.mp4" type="video/mp4">
        </video>
      </div>
    </div>

    <!-- Three stats below video -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;max-width:720px;margin:48px auto 0;">
      <div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:24px;text-align:center;">
        <div class="editorial" style="font-size:38px;color:var(--rust-l);margin-bottom:6px;">5 min</div>
        <div style="font-size:13px;color:rgba(255,255,255,0.45);">To complete your GTM brief</div>
      </div>
      <div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:24px;text-align:center;">
        <div class="editorial" style="font-size:38px;color:var(--rust-l);margin-bottom:6px;">48 hrs</div>
        <div style="font-size:13px;color:rgba(255,255,255,0.45);">Build to first live campaign</div>
      </div>
      <div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:24px;text-align:center;">
        <div class="editorial" style="font-size:38px;color:var(--rust-l);margin-bottom:6px;">$49</div>
        <div style="font-size:13px;color:rgba(255,255,255,0.45);">vs $2,000+ setup elsewhere</div>
      </div>
    </div>
  </div>
</section>


<!-- ═══════════════════════════════════════
     SOLUTION — WHAT AUXORA HANDLES
     SEO: "AI marketing automation solopreneur"
          "full service marketing one person business"
          "replace marketing agency AI"
═══════════════════════════════════════ -->
<section class="section dark-section" id="solution" aria-labelledby="solution-h2">
  <div class="container">
    <div style="max-width:620px;margin:0 auto 56px;text-align:center;">
      <p class="eyebrow" style="margin-bottom:16px;">What your virtual CMO delivers</p>
      <h2 id="solution-h2" class="editorial" style="font-size:clamp(32px,4vw,52px);color:white;line-height:1.15;">
        Your virtual CMO.<br/>
        <em style="color:var(--rust-l);">Fully done for you.</em>
      </h2>
      <p style="font-size:16px;color:rgba(255,255,255,0.55);margin-top:16px;line-height:1.7;">
        28 million one-person businesses in the US run without a marketing team. 
        Auxora is the marketing system built for exactly that — strategy, landing pages, 
        Meta &amp; Google ads, SEO and email flows bundled into one AI-managed stack 
        that runs itself.
      </p>
    </div>

    <!-- Agency vs Auxora comparison -->
    <div style="max-width:900px;margin:0 auto 56px;">
      <div style="background:#2C2826;border:1px solid #3A3532;padding:36px;border-radius:20px;">
        <p style="text-align:center;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.35);margin-bottom:28px;">
          Same deliverables — done in 1 day, no setup fees
        </p>
        <div style="display:grid;grid-template-columns:1fr 52px 1fr;gap:0;align-items:start;">

          <!-- Agency column -->
          <div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;">
              <span style="background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.45);font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;border-radius:8px;padding:6px 14px;">Agency or Freelancer</span>
              <span style="font-size:11px;color:rgba(255,255,255,0.3);">30 days · $2,000+ setup + monthly fees</span>
            </div>
            <div style="display:flex;flex-direction:column;gap:8px;">
              ${[
                ['Strategy &amp; positioning','7 days'],
                ['Landing page build','5 days'],
                ['Ad creative production','5 days'],
                ['Campaign setup','5 days'],
                ['A/B testing','4 days'],
                ['Email &amp; LTV flows','4 days'],
              ].map(([task, time]) => `
              <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,0.04);border-radius:10px;padding:10px 14px;">
                <span style="font-size:13px;color:rgba(255,255,255,0.55);">${task}</span>
                <span style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.25);background:rgba(255,255,255,0.07);border-radius:6px;padding:2px 8px;">${time}</span>
              </div>`).join('')}
            </div>
            <div style="margin-top:16px;padding:12px 14px;background:rgba(204,51,51,0.12);border-radius:10px;border:1px solid rgba(204,51,51,0.2);text-align:center;">
              <span style="font-size:11px;font-weight:700;color:#F87171;">30 days · $2,000+ setup · ongoing monthly fees</span>
            </div>
          </div>

          <!-- VS divider -->
          <div style="display:flex;align-items:center;justify-content:center;padding-top:52px;">
            <div style="background:var(--rust);color:white;font-size:11px;font-weight:800;letter-spacing:0.08em;border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;">VS</div>
          </div>

          <!-- Auxora column -->
          <div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;">
              <span style="background:rgba(191,103,68,0.2);color:var(--rust-l);font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;border-radius:8px;padding:6px 14px;">Auxora AI</span>
              <span style="font-size:11px;color:rgba(255,255,255,0.3);">48 hrs · from $49 · no monthly lock-in</span>
            </div>
            <div style="display:flex;flex-direction:column;gap:8px;">
              ${[
                ['Strategy &amp; positioning','2 hrs'],
                ['Landing page build','4 hrs'],
                ['AI ad creatives','3 hrs'],
                ['Auto campaign setup','4 hrs'],
                ['Automated A/B testing','3 hrs'],
                ['Email &amp; LTV automation','4 hrs'],
              ].map(([task, time]) => `
              <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(191,103,68,0.08);border-radius:10px;padding:10px 14px;">
                <span style="font-size:13px;color:rgba(255,255,255,0.75);">${task}</span>
                <span style="font-size:11px;font-weight:700;color:var(--rust-l);background:rgba(191,103,68,0.15);border-radius:6px;padding:2px 8px;">${time}</span>
              </div>`).join('')}
            </div>
            <div style="margin-top:16px;padding:12px 14px;background:rgba(74,103,65,0.2);border-radius:10px;border:1px solid rgba(74,103,65,0.3);text-align:center;">
              <span style="font-size:13px;font-weight:700;color:#86efac;">48 hrs · from $49 · pay-for-performance after that</span>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Capability pills -->
    <div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center;">
      ${[
        ['fas fa-bullseye','GTM Strategy'],
        ['fas fa-file-alt','Landing Page'],
        ['fas fa-photo-video','Ad Creatives'],
        ['fas fa-chart-line','Analytics'],
        ['fas fa-search','SEO &amp; GEO'],
        ['fas fa-envelope-open-text','Email Flows'],
        ['fas fa-robot','AI Optimisation'],
      ].map(([icon, label]) => `
        <div style="display:flex;align-items:center;gap:8px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);border-radius:100px;padding:10px 20px;">
          <i class="${icon}" style="color:var(--rust-l);font-size:13px;"></i>
          <span style="font-size:13px;font-weight:600;color:rgba(255,255,255,0.8);">${label}</span>
        </div>`).join('')}
    </div>
  </div>
</section>


<!-- ═══════════════════════════════════════
     HOW IT WORKS
     SEO: "how to get clients as a solopreneur"
          "AI go-to-market strategy solo business"
          "how to automate solopreneur marketing"
═══════════════════════════════════════ -->
<section class="section" style="background:var(--cream);" id="how-it-works" aria-labelledby="hiw-h2">
  <div class="container">
    <div style="max-width:580px;margin:0 auto;text-align:center;">
      <p class="eyebrow" style="margin-bottom:16px;">The process</p>
      <h2 id="hiw-h2" class="editorial" style="font-size:clamp(32px,4vw,52px);color:var(--ink);line-height:1.15;">
        From 5 questions<br/>
        to <em style="color:var(--rust);">first clients in 48 hours.</em>
      </h2>
      <p style="font-size:15px;color:var(--muted);margin-top:14px;line-height:1.7;">
        Like setting up Tesla auto-drive: answer a few questions, hand over the wheel. 
        Auxora's AI agents handle every channel — no briefing calls, no agency jargon, 
        no technical skill required.
      </p>
    </div>

    <div class="steps">
      <div class="step">
        <div class="step-num">1</div>
        <h3>Tell us your goal — from $49</h3>
        <p>Answer 5 plain-language questions about your business. Auxora generates your full marketing strategy in minutes: ICP, positioning, channels, SEO keywords, competitive gaps — and an execution button to activate the build. Validate your strategy before spending a dollar on ads.</p>
      </div>
      <div class="step">
        <div class="step-num">2</div>
        <h3>We build your full marketing stack — $200</h3>
        <p>One conversation activates your virtual CMO. AI agents write your landing page, produce ad creatives, configure your Meta or Google campaign, and wire up analytics — all done for you in 24 hours. No $2,000 setup fee.</p>
      </div>
      <div class="step">
        <div class="step-num">3</div>
        <h3>Go live. Auto-drive takes over.</h3>
        <p>Campaigns launch automatically. Auxora monitors daily performance, catches underperforming creatives and re-optimises — just like auto-drive reroutes around traffic. You focus on the work; we handle the marketing.</p>
      </div>
      <div class="step">
        <div class="step-num">4</div>
        <h3>Scale on results — not retainers</h3>
        <p>Revenue share only kicks in after your ROAS hits ≥ 0.7×. We grow with you, not ahead of you. No monthly retainer until the system is proving itself.</p>
      </div>
    </div>
  </div>
</section>


<!-- ═══════════════════════════════════════
     WHO IT'S FOR — SEO-RICH VERTICALS
     SEO: "therapist private practice marketing"
          "pest control local marketing"
          "freelance consultant get more clients"
          "life coach marketing AI"
          "one person business marketing tool"
═══════════════════════════════════════ -->
<section class="section" style="background:var(--warm);" id="who-its-for" aria-labelledby="verticals-h2">
  <div class="container">
    <div style="max-width:600px;margin:0 auto 52px;text-align:center;">
      <p class="eyebrow" style="margin-bottom:16px;">Built specifically for you</p>
      <h2 id="verticals-h2" class="editorial" style="font-size:clamp(32px,4vw,48px);color:var(--ink);line-height:1.15;">
        If you run it alone,<br/>
        <em style="color:var(--rust);">Auxora was made for you.</em>
      </h2>
      <p style="font-size:15px;color:var(--muted);margin-top:14px;line-height:1.7;">
        28 million one-person businesses in the US run without a marketing team. 
        Auxora is your AI virtual CMO that knows your niche, your clients, and 
        what actually converts in your vertical.
      </p>
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:20px;max-width:1040px;margin:0 auto;">
      ${[
        {
          icon: 'fas fa-heart',
          title: 'Therapists &amp; Counsellors',
          keywords: 'therapist private practice marketing · how to get therapy clients online',
          desc: 'Build a referral-free practice. Auxora creates an SEO-optimised psychology website, runs Google Ads targeting "find a therapist near me", and automates your intake flow.',
          tag: 'Private Practice',
        },
        {
          icon: 'fas fa-briefcase',
          title: 'Freelancers &amp; Consultants',
          keywords: 'freelancer marketing automation · solopreneur get more clients AI',
          desc: 'Stop relying on referrals. Auxora builds your positioning, LinkedIn presence, lead funnel, and inbound content — so clients find you while you work.',
          tag: 'Freelance',
        },
        {
          icon: 'fas fa-tools',
          title: 'Home Service Operators',
          keywords: 'pest control local marketing · home services lead generation AI',
          desc: 'Dominate Google Maps and local search. Geo-targeted ads, automated review generation, and booking flows — built and running in a day.',
          tag: 'Local Services',
        },
        {
          icon: 'fas fa-dumbbell',
          title: 'Coaches &amp; Trainers',
          keywords: 'life coach marketing AI · fitness trainer get more clients',
          desc: 'From Instagram content to evergreen landing pages — Auxora creates the content and ad engine that keeps your calendar full year-round.',
          tag: 'Coaching',
        },
        {
          icon: 'fas fa-store',
          title: 'Solo Founders &amp; Side Projects',
          keywords: 'one person business marketing tool · solopreneur growth strategy AI',
          desc: 'You built the product. Auxora builds the go-to-market. Launch with positioning-first strategy and a conversion funnel that actual customers respond to.',
          tag: 'Solo Founder',
        },
        {
          icon: 'fas fa-spa',
          title: 'Wellness &amp; Holistic Health',
          keywords: 'wellness brand marketing solopreneur · holistic health practice get clients',
          desc: 'From naturopathy to nutrition coaching — Auxora understands the wellness buyer journey and builds trust-based acquisition funnels that convert.',
          tag: 'Wellness',
        },
      ].map(v => `
        <div class="card" style="padding:28px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
            <div style="width:44px;height:44px;background:#FDF2EE;border-radius:12px;display:flex;align-items:center;justify-content:center;">
              <i class="${v.icon}" style="color:var(--rust);font-size:18px;"></i>
            </div>
            <span class="badge badge-rust" style="font-size:9px;">${v.tag}</span>
          </div>
          <h3 style="font-size:17px;font-weight:700;color:var(--ink);margin-bottom:6px;">${v.title}</h3>
          <p style="font-size:10px;color:var(--muted);letter-spacing:0.04em;margin-bottom:12px;font-style:italic;">${v.keywords}</p>
          <p style="font-size:14px;color:var(--muted);line-height:1.65;">${v.desc}</p>
        </div>`).join('')}
    </div>
  </div>
</section>


<!-- ═══════════════════════════════════════
     RESULTS / TESTIMONIALS
     SEO: "solopreneur marketing results"
          "AI marketing tool reviews solopreneur"
═══════════════════════════════════════ -->
<section class="section" style="background:var(--cream);" id="results" aria-labelledby="results-h2">
  <div class="container">
    <div style="max-width:580px;margin:0 auto 52px;text-align:center;">
      <p class="eyebrow" style="margin-bottom:16px;">Done-for-you results</p>
      <h2 id="results-h2" class="editorial" style="font-size:clamp(32px,4vw,52px);color:var(--ink);line-height:1.15;">
        Founders who stopped<br/>
        <em style="color:var(--rust);">grinding and grew.</em>
      </h2>
      <p style="font-size:15px;color:var(--muted);margin-top:14px;line-height:1.7;">
        Real results from early Auxora users — solopreneurs, practitioners and local 
        service businesses who replaced their agency with AI digital staff.
      </p>
    </div>

    <!-- Stats row -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;max-width:860px;margin:0 auto 48px;">
      ${[
        ['10×', 'Revenue growth · 2 months', 'var(--rust)'],
        ['3×', 'ROAS · first Meta campaign', 'var(--sage)'],
        ['62%', 'CAC reduction', 'var(--ink)'],
        ['6 wks', 'Average time to profitability', 'var(--rust)'],
      ].map(([num, label, color]) => `
        <div style="background:white;border:1px solid var(--border);border-radius:16px;padding:24px;text-align:center;">
          <div class="editorial" style="font-size:42px;color:${color};line-height:1;margin-bottom:6px;">${num}</div>
          <div style="font-size:12px;color:var(--muted);font-weight:500;">${label}</div>
        </div>`).join('')}
    </div>

    <!-- Testimonials grid -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;max-width:960px;margin:0 auto 40px;">

      <div class="testi">
        <div class="testi-quote">"</div>
        <p class="testi-text">
          I was paying $5K a month to an agency with nothing to show for it. 
          Auxora gave me a real strategy in 10 minutes — and the numbers 
          started moving within two weeks.
        </p>
        <div style="display:flex;align-items:center;gap:12px;">
          <div class="testi-avatar" style="background:linear-gradient(135deg,#BF6744,#D4845C);">S</div>
          <div style="flex:1;">
            <div style="font-size:14px;font-weight:600;color:var(--ink);">Sarah K.</div>
            <div class="eyebrow" style="font-size:10px;">Skincare founder · solo business</div>
          </div>
          <div class="stars">
            <i class="fas fa-star"></i><i class="fas fa-star"></i>
            <i class="fas fa-star"></i><i class="fas fa-star"></i>
            <i class="fas fa-star"></i>
          </div>
        </div>
      </div>

      <div class="testi">
        <div class="testi-quote">"</div>
        <p class="testi-text">
          The $4.99 report was the most valuable thing I bought this year. 
          It showed me exactly why my Meta ads weren't working and gave me 
          a step-by-step fix. Genuinely insane value for any solopreneur.
        </p>
        <div style="display:flex;align-items:center;gap:12px;">
          <div class="testi-avatar" style="background:linear-gradient(135deg,#4A6741,#6E8B5E);">M</div>
          <div style="flex:1;">
            <div style="font-size:14px;font-weight:600;color:var(--ink);">Marcus T.</div>
            <div class="eyebrow" style="font-size:10px;">Pet accessories · solo founder</div>
          </div>
          <div class="stars">
            <i class="fas fa-star"></i><i class="fas fa-star"></i>
            <i class="fas fa-star"></i><i class="fas fa-star"></i>
            <i class="fas fa-star"></i>
          </div>
        </div>
      </div>

      <div class="testi">
        <div class="testi-quote">"</div>
        <p class="testi-text">
          I'm a therapist in private practice — I have zero time for marketing. 
          Auxora built my entire client-acquisition system in a weekend. 
          My calendar filled up within 5 weeks without a single cold call.
        </p>
        <div style="display:flex;align-items:center;gap:12px;">
          <div class="testi-avatar" style="background:linear-gradient(135deg,#6B6B8A,#9090B0);">J</div>
          <div style="flex:1;">
            <div style="font-size:14px;font-weight:600;color:var(--ink);">Dr. Jamie R.</div>
            <div class="eyebrow" style="font-size:10px;">Licensed therapist · private practice</div>
          </div>
          <div class="stars">
            <i class="fas fa-star"></i><i class="fas fa-star"></i>
            <i class="fas fa-star"></i><i class="fas fa-star"></i>
            <i class="fas fa-star"></i>
          </div>
        </div>
      </div>

      <div class="testi">
        <div class="testi-quote">"</div>
        <p class="testi-text">
          As a freelance consultant I was constantly chasing referrals. 
          Auxora built my positioning, LinkedIn funnel, and automated outreach — 
          I've had 3 new retainer clients in my first 3 weeks. Couldn't believe it.
        </p>
        <div style="display:flex;align-items:center;gap:12px;">
          <div class="testi-avatar" style="background:linear-gradient(135deg,#D4A853,#E8C47A);">A</div>
          <div style="flex:1;">
            <div style="font-size:14px;font-weight:600;color:var(--ink);">Alex W.</div>
            <div class="eyebrow" style="font-size:10px;">Freelance consultant · operations</div>
          </div>
          <div class="stars">
            <i class="fas fa-star"></i><i class="fas fa-star"></i>
            <i class="fas fa-star"></i><i class="fas fa-star"></i>
            <i class="fas fa-star"></i>
          </div>
        </div>
      </div>

    </div>

    <!-- Yamabushi video case study thumbnail -->
    <div style="max-width:960px;margin:0 auto;">
      <div style="border-radius:20px;overflow:hidden;cursor:pointer;position:relative;" onclick="openVideoModal(0)">
        <img src="https://img.youtube.com/vi/nw1XYryhdIU/maxresdefault.jpg"
             alt="Real founder story: how Auxora grew a solo business 10× in 2 months"
             style="width:100%;display:block;object-fit:cover;max-height:420px;">
        <div style="position:absolute;inset:0;background:linear-gradient(to bottom,rgba(28,25,23,0.04),rgba(28,25,23,0.6));"></div>
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;">
          <div style="width:72px;height:72px;background:white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 24px rgba(0,0,0,0.35);">
            <i class="fas fa-play" style="color:var(--rust);font-size:24px;margin-left:4px;"></i>
          </div>
        </div>
        <div style="position:absolute;bottom:28px;left:0;right:0;text-align:center;">
          <div class="editorial" style="font-size:22px;color:white;font-style:italic;text-shadow:0 1px 6px rgba(0,0,0,0.5);">Watch a real founder story →</div>
          <p style="font-size:13px;color:rgba(255,255,255,0.65);margin-top:6px;">10× revenue · 2 months · solo founder</p>
        </div>
      </div>
    </div>
  </div>
</section>


<!-- ═══════════════════════════════════════
     PRICING
     SEO: "AI marketing tool pricing solopreneur"
          "cheap marketing for small business"
          "get marketing help without agency"
═══════════════════════════════════════ -->
<section class="section" style="background:var(--warm);" id="pricing" aria-labelledby="pricing-h2">
  <div class="container">
    <div style="max-width:580px;margin:0 auto;text-align:center;">
      <p class="eyebrow" style="margin-bottom:16px;">Pricing</p>
      <h2 id="pricing-h2" class="editorial" style="font-size:clamp(32px,4vw,52px);color:var(--ink);line-height:1.15;">
        Start for $4.99.<br/>
        <em style="color:var(--rust);">Pay only when it's working.</em>
      </h2>
      <p style="font-size:15px;color:var(--muted);margin-top:14px;line-height:1.7;">
        No $2,000 Meta setup fees. No monthly retainer until your ads are profitable.
        Validate for $4.99, launch for $200, and we only earn a revenue share once your 
        campaigns are delivering results.
      </p>
    </div>

    <div class="pricing-grid" style="margin-top:52px;">

      <!-- Starter -->
      <div class="plan">
        <p class="eyebrow" style="margin-bottom:16px;">Starter</p>
        <div class="plan-price"><sup>$</sup>4<span style="font-size:28px;">.99</span></div>
        <p class="plan-label">one-time · GTM strategy report + execution button</p>
        <ul class="plan-features">
          <li><i class="fas fa-check"></i> Full go-to-market audit</li>
          <li><i class="fas fa-check"></i> ICP &amp; positioning analysis</li>
          <li><i class="fas fa-check"></i> Channel recommendations</li>
          <li><i class="fas fa-check"></i> Competitor gap analysis</li>
          <li><i class="fas fa-check"></i> SEO keyword targets for your niche</li>
          <li><i class="fas fa-check"></i> Delivered in under 5 minutes</li>
        </ul>
        <a href="/report" class="btn-ghost" style="width:100%;justify-content:center;">
          Get my GTM report <i class="fas fa-arrow-right"></i>
        </a>
      </div>

      <!-- Growth (most popular) -->
      <div class="plan featured">
        <div class="plan-badge">Most popular</div>
        <p class="eyebrow" style="margin-bottom:16px;">Growth Build</p>
        <div class="plan-price"><sup>$</sup>200</div>
        <p class="plan-label">one-time build fee · your AI marketing stack, fully deployed</p>
        <p style="font-size:12px;font-weight:700;color:var(--rust);margin-bottom:16px;">
          ⚡ No $2,000 Meta setup fee — done for you in 24 hours
        </p>
        <ul class="plan-features">
          <li><i class="fas fa-check"></i> Everything in Starter</li>
          <li><i class="fas fa-check"></i> GTM strategy &amp; brand positioning</li>
          <li><i class="fas fa-check"></i> Conversion-ready landing page</li>
          <li><i class="fas fa-check"></i> AI-generated ad creatives (video + static)</li>
          <li><i class="fas fa-check"></i> 1 live ad channel (Meta or Google)</li>
          <li><i class="fas fa-check"></i> SEO &amp; GEO-optimised copy</li>
        </ul>
        <a href="/report" class="btn-primary" style="width:100%;justify-content:center;">
          Launch in 24 hours <i class="fas fa-arrow-right"></i>
        </a>
      </div>

      <!-- Scale -->
      <div class="plan">
        <p class="eyebrow" style="margin-bottom:16px;">Scale</p>
        <div class="plan-price"><sup>$</sup>1,200</div>
        <p class="plan-label">per month · white-glove execution</p>
        <ul class="plan-features">
          <li><i class="fas fa-check"></i> Everything in Growth</li>
          <li><i class="fas fa-check"></i> Meta + Google auto-management</li>
          <li><i class="fas fa-check"></i> Weekly AI optimisation</li>
          <li><i class="fas fa-check"></i> Email + SMS automation</li>
          <li><i class="fas fa-check"></i> Live performance dashboard</li>
          <li><i class="fas fa-check"></i> Dedicated growth strategist</li>
        </ul>
        <a href="mailto:hello@auxora.ai" class="btn-ghost" style="width:100%;justify-content:center;">
          Talk to us <i class="fas fa-arrow-right"></i>
        </a>
      </div>

    </div>

    <!-- Aligned incentives note -->
    <div style="max-width:700px;margin:40px auto 0;background:white;border:1px solid var(--border);border-radius:16px;padding:28px 32px;text-align:center;">
      <p class="eyebrow" style="margin-bottom:10px;">Aligned incentives</p>
      <p class="editorial" style="font-size:22px;color:var(--ink);margin-bottom:12px;">
        We earn after you do.
      </p>
      <p style="font-size:14px;color:var(--muted);line-height:1.75;">
        Think of Auxora as a virtual CMO on performance pay. The $200 covers all build costs — 
        your landing page, ad creatives, campaign setup, SEO copy. That's it.
        Revenue share only kicks in after your ROAS reaches ≥ 0.7× ($0.70 back per $1 spent — 
        confirming your ads are working). We scale with you, not ahead of you.
      </p>
    </div>
  </div>
</section>


<!-- ═══════════════════════════════════════
     EARLY ACCESS SIGN-UP
     (Email capture — "Get Early Access" CTA)
     Mirrors PMF doc: single CTA, email + challenge
═══════════════════════════════════════ -->
<section style="background:var(--darker);padding:96px 24px;" id="early-access" aria-labelledby="ea-h2">
  <div style="max-width:660px;margin:0 auto;text-align:center;">
    <p class="eyebrow" style="margin-bottom:20px;color:var(--rust-l);">
      <i class="fas fa-circle" style="font-size:7px;vertical-align:middle;margin-right:6px;color:#4ade80;"></i>
      Early access — limited spots
    </p>
    <h2 id="ea-h2" class="editorial" style="font-size:clamp(36px,5vw,64px);color:white;line-height:1.08;margin-bottom:18px;">
      Your marketing<br/>
      <em style="color:var(--rust-l);">runs itself tomorrow.</em>
    </h2>
    <p style="font-size:16px;color:rgba(255,255,255,0.5);line-height:1.7;margin-bottom:36px;">
      Join our early cohort. Get white-glove onboarding, direct founder access, 
      and your $4.99 strategy report free — then your virtual CMO handles the rest.
    </p>

    <!-- Email capture form -->
    <form class="access-form" onsubmit="handleEarlyAccess(event)" id="ea-form">
      <input type="email" id="ea-email" name="email" placeholder="your@email.com" required
             autocomplete="email" aria-label="Email address">
      <button type="submit" class="btn-primary" style="white-space:nowrap;">
        Get Early Access <i class="fas fa-arrow-right"></i>
      </button>
    </form>

    <!-- Challenge selector (mirrors GTM doc's "biggest marketing challenge" question) -->
    <p style="font-size:13px;color:rgba(255,255,255,0.35);margin-top:20px;margin-bottom:12px;">
      What's your biggest marketing challenge?
    </p>
    <div class="challenge-pills" id="challenge-pills">
      <div class="challenge-pill" data-value="no-time" onclick="selectChallenge(this)">⏱ No time for marketing</div>
      <div class="challenge-pill" data-value="too-expensive" onclick="selectChallenge(this)">💸 Too expensive to outsource</div>
      <div class="challenge-pill" data-value="dont-know" onclick="selectChallenge(this)">🤷 Don't know where to start</div>
      <div class="challenge-pill" data-value="not-working" onclick="selectChallenge(this)">📉 Tried it, nothing worked</div>
    </div>

    <!-- Success state (hidden) -->
    <div id="ea-success" style="display:none;background:rgba(74,103,65,0.2);border:1px solid rgba(74,103,65,0.4);border-radius:16px;padding:28px;margin-top:24px;">
      <div style="font-size:32px;margin-bottom:12px;">🎉</div>
      <p style="font-size:18px;font-weight:700;color:white;margin-bottom:8px;">You're on the list!</p>
      <p style="font-size:14px;color:rgba(255,255,255,0.55);">We'll reach out within 24 hours with your free report and onboarding details.</p>
    </div>

    <p style="margin-top:20px;font-size:12px;color:rgba(255,255,255,0.25);">
      No credit card needed · Cancel anytime · Your report is on us
    </p>
  </div>
</section>


<!-- ═══════════════════════════════════════
     FAQ
     SEO: rich snippets — long-tail question keywords
          "is auxora worth it for solopreneurs"
          "how much does AI marketing cost"
          "can AI replace my marketing agency"
═══════════════════════════════════════ -->
<section class="section" style="background:var(--warm);" id="faq" aria-labelledby="faq-h2">
  <div class="container" style="max-width:760px;">
    <div style="text-align:center;margin-bottom:52px;">
      <p class="eyebrow" style="margin-bottom:16px;">Common questions</p>
      <h2 id="faq-h2" class="editorial" style="font-size:clamp(28px,3.5vw,44px);color:var(--ink);">
        Everything you need to know
      </h2>
    </div>

    <!-- FAQ Structured data for rich snippets -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Can AI really act as my virtual CMO for a solo business?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. 28 million one-person businesses in the US run without a marketing team. Auxora was built for exactly that. It is your AI virtual CMO — handling marketing strategy, landing pages, Meta ads, Google ads, SEO, and email flows. Everything that typically takes 30 days and $2,000+ to set up is done for you in 48 hours, starting at $49. And Auxora only earns a revenue share once your ads are profitable."
          }
        },
        {
          "@type": "Question",
          "name": "Is Auxora right for my type of solo business?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Auxora works for any one-person business that needs more clients: therapists and private practices, freelancers and consultants, home service operators (pest control, cleaning, landscaping), coaches and trainers, solo founders, and wellness practitioners. If you run it alone and need a marketing system, Auxora was made for you."
          }
        },
        {
          "@type": "Question",
          "name": "What do I get for the $4.99 GTM report?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A complete go-to-market analysis in under 5 minutes: ICP definition, positioning statement, messaging framework, channel recommendations, SEO keyword targets for your specific niche, and a competitive gap analysis. Most solopreneurs say it's the clearest view of their marketing strategy they've ever had — for the price of a coffee."
          }
        },
        {
          "@type": "Question",
          "name": "What exactly does Auxora build for $200?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Everything in your virtual CMO stack: a conversion-optimised landing page for your niche, AI-generated video and static ad creatives, one live ad channel (Meta or Google), SEO-optimised copy, email and LTV flows, and connected analytics. The $200 is a one-time build fee — no $2,000 Meta setup charge, no hidden agency fees."
          }
        },
        {
          "@type": "Question",
          "name": "Do I need any technical knowledge or marketing experience?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. Auxora works through a conversation interface — like texting. You describe your business, answer a few simple questions, and Auxora handles all the technical execution: building pages, connecting ad accounts, setting up tracking, and launching campaigns."
          }
        },
        {
          "@type": "Question",
          "name": "How does the revenue share model work?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Auxora charges nothing until your ROAS (Return on Ad Spend) reaches at least 0.7×. That means you're getting $0.70 back for every $1 you spend on ads — confirming the system is working. Only then does Auxora take a small percentage of incremental revenue. You grow first; we earn after."
          }
        },
        {
          "@type": "Question",
          "name": "What's the difference between the free early access and the $4.99 report?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Early access gives you white-glove onboarding, direct founder contact, and the $4.99 report included at no charge — plus priority access to the full Growth Build at beta pricing. The $4.99 report is the self-serve version: still a complete GTM analysis, delivered instantly, without the manual onboarding session."
          }
        }
      ]
    }
    </script>

    <div id="faq-list">
      ${[
        ['Can AI really act as my virtual CMO for a solo business?',
         '28 million one-person businesses in the US run without a marketing team — Auxora was built for exactly that. It is your AI virtual CMO: marketing strategy, landing pages, Meta ads, Google ads, SEO and email flows. Everything that takes 30 days and $2,000+ to set up is done in 48 hours from $49. Revenue share kicks in only after your ads are profitable.'],
        ['Is Auxora right for my type of solo business?',
         'Auxora works for any one-person business that needs more clients: therapists and private practices, freelancers and consultants, home service operators (pest control, cleaning), coaches and trainers, solo founders, and wellness practitioners. If you run it alone and need a Done-for-you marketing system, Auxora was built for you.'],
        ['What do I get for the $4.99 GTM report?',
         'A complete Done-for-you go-to-market analysis in under 5 minutes: ICP definition, positioning, messaging framework, channel recommendations, SEO keywords for your niche, and competitive gaps. It comes with an execution button — so the $4.99 report is the entry point to activating your full AI growth team.'],
        ['What exactly does Auxora build for $200?',
         'Your virtual CMO stack: a conversion-optimised landing page, AI-generated ad creatives (video + static, powered by GoMarble), one live ad channel (Meta or Google), SEO-optimised copy, email/LTV automation flows, and connected analytics. The $200 is a one-time build fee — no $2,000 Meta setup charge, no hidden agency fees.'],
        ['Do I need any technical knowledge or marketing experience?',
         'No. Auxora uses Chat-as-OS: describe your business and goals in plain language, and AI agents handle all technical execution — building pages, connecting ad accounts, pixel setup, and campaign launch. Zero marketing experience required.'],
        ['How does the revenue share model work?',
         'Auxora charges nothing until your ROAS (Return on Ad Spend) reaches at least 0.7x. That means you are getting $0.70 back for every $1 spent on ads. Only then does Auxora take a small percentage of incremental revenue. Your AI team earns after you do.'],
        ['What is the difference between early access and the $4.99 report?',
         'Early access gives you white-glove onboarding, direct founder contact, and the $4.99 report free — plus priority access to the full AI growth build at beta pricing. The $4.99 report is the self-serve version: the same GTM analysis, delivered instantly, with an activation button.'],
        ['Can I cancel anytime?',
         'Yes. No contracts, no lock-in. The $4.99 report and $200 Growth Build are one-time. The Scale plan is monthly — cancel with one click. No questions asked.'],
      ].map(([q, a], i) => `
        <div class="faq-item" id="faq-${i}">
          <div class="faq-q" onclick="toggleFaq(${i})">
            <span>${q}</span>
            <i class="fas fa-plus faq-icon"></i>
          </div>
          <p class="faq-a">${a}</p>
        </div>`).join('')}
    </div>
  </div>
</section>


<!-- ═══════════════════════════════════════
     FOOTER
═══════════════════════════════════════ -->
<footer>
  <div class="footer-inner">
    <div>
      <div style="font-family:'Playfair Display',serif;font-size:22px;color:rgba(255,255,255,0.88);margin-bottom:10px;letter-spacing:-0.01em;">Auxora</div>
      <p style="font-size:13px;line-height:1.7;max-width:280px;">
        Your AI virtual CMO — marketing strategy, ads, SEO and landing pages 
        for one-person businesses. From $49. Clients in 48 hours.
      </p>
      <p style="font-size:12px;margin-top:14px;color:rgba(255,255,255,0.3);">
        <i class="fas fa-envelope" style="margin-right:6px;"></i>
        <a href="mailto:hello@auxora.ai">hello@auxora.ai</a>
      </p>
    </div>
    <div style="display:flex;gap:48px;flex-wrap:wrap;">
      <div>
        <p style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:12px;">Product</p>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <a href="/report">GTM Report — $4.99</a>
          <a href="#pricing">Growth Build — $200</a>
          <a href="#pricing">Scale Plan</a>
          <a href="#early-access">Early Access</a>
        </div>
      </div>
      <div>
        <p style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:12px;">Who it's for</p>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <a href="#who-its-for">Therapists &amp; Coaches</a>
          <a href="#who-its-for">Freelancers &amp; Consultants</a>
          <a href="#who-its-for">Home Services</a>
          <a href="#who-its-for">Solo Founders</a>
          <a href="#who-its-for">Wellness &amp; Health</a>
        </div>
      </div>
      <div>
        <p style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:12px;">Company</p>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <a href="#results">Results</a>
          <a href="#faq">FAQ</a>
          <a href="mailto:hello@auxora.ai">Contact us</a>
        </div>
      </div>
    </div>
  </div>
  <div style="max-width:1200px;margin:32px auto 0;padding-top:24px;border-top:1px solid rgba(255,255,255,0.08);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
    <p style="font-size:12px;">© 2025 Auxora.ai — AI-native growth platform. Your AI digital growth team.</p>
    <div style="display:flex;gap:20px;font-size:12px;">
      <a href="/privacy">Privacy</a>
      <a href="/terms">Terms</a>
    </div>
  </div>
</footer>


<!-- ═══════════════════════════════════════
     VIDEO MODAL
═══════════════════════════════════════ -->
<div id="videoModal" style="display:none;position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,0.9);backdrop-filter:blur(8px);align-items:center;justify-content:center;">
  <div style="max-width:860px;width:90%;position:relative;">
    <button onclick="closeVideoModal()" style="position:absolute;top:-44px;right:0;background:none;border:none;color:white;font-size:32px;cursor:pointer;line-height:1;">×</button>
    <div style="background:#1A1816;border-radius:16px;overflow:hidden;">
      <iframe id="videoPlayer" width="100%" height="480" src="" frameborder="0"
        allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen></iframe>
    </div>
    <p id="videoTitle" style="color:white;font-family:'Playfair Display',serif;font-size:20px;margin-top:16px;"></p>
    <p id="videoDesc" style="color:rgba(255,255,255,0.5);font-size:14px;margin-top:6px;"></p>
  </div>
</div>


<!-- ═══════════════════════════════════════
     JAVASCRIPT
═══════════════════════════════════════ -->
<script>
  // ── FAQ accordion ──
  function toggleFaq(i) {
    const item = document.getElementById('faq-' + i);
    item.classList.toggle('open');
  }

  // ── Video modal ──
  const videos = [
    { id: 'nw1XYryhdIU', title: 'Real founder story', desc: 'Solo business · 10× Revenue in 2 Months · 3× ROAS' }
  ];
  function openVideoModal(idx) {
    const v = videos[idx];
    document.getElementById('videoPlayer').src = 'https://www.youtube.com/embed/' + v.id + '?autoplay=1&rel=0';
    document.getElementById('videoTitle').textContent = v.title;
    document.getElementById('videoDesc').textContent = v.desc;
    const m = document.getElementById('videoModal');
    m.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
  function closeVideoModal() {
    document.getElementById('videoPlayer').src = '';
    document.getElementById('videoModal').style.display = 'none';
    document.body.style.overflow = '';
  }
  document.getElementById('videoModal').addEventListener('click', function(e) {
    if (e.target === this) closeVideoModal();
  });

  // ── Challenge pill selector ──
  let selectedChallenge = '';
  function selectChallenge(el) {
    document.querySelectorAll('.challenge-pill').forEach(p => p.classList.remove('selected'));
    el.classList.add('selected');
    selectedChallenge = el.getAttribute('data-value');
  }

  // ── Early access form ──
  function handleEarlyAccess(e) {
    e.preventDefault();
    const email = document.getElementById('ea-email').value;
    if (!email) return;

    // Track with GA4
    if (typeof gtag !== 'undefined') {
      gtag('event', 'early_access_signup', {
        'event_category': 'conversion',
        'event_label': selectedChallenge || 'unknown',
        'value': 1
      });
    }

    // Hide form, show success
    document.getElementById('ea-form').style.display = 'none';
    document.getElementById('challenge-pills').style.display = 'none';
    document.getElementById('ea-success').style.display = 'block';

    // In production: POST to /api/early-access
    fetch('/api/early-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, challenge: selectedChallenge })
    }).catch(() => {}); // Fail silently on the landing page
  }

  // ── Smooth scroll for anchor links ──
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ── Scroll-in fade animation ──
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

  // ── Responsive: remove border-right on mobile ──
  function fixRespCards() {
    const cards = document.querySelectorAll('.resp-card');
    if (window.innerWidth < 640) {
      cards.forEach(c => c.style.borderRight = 'none');
    } else {
      // Restore inline style (last card has no border-right already)
    }
  }
  fixRespCards();
  window.addEventListener('resize', fixRespCards);
</script>

</body>
</html>
`;
