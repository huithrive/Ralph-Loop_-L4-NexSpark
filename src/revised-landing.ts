// Auxora.ai — Premium D2C Brand Owner Landing Page
// Aesthetic: Clean white editorial, warm & human, premium artisan
// Inspired by: Glossier, Goop, Athletic Greens (AG1), Olipop, Warby Parker, Erewhon
// Fonts: Playfair Display (editorial headlines) + Plus Jakarta Sans (friendly body)

export const REVISED_LANDING_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Auxora — AI Growth Partner for D2C Brands</title>
    <meta name="description" content="The AI growth partner built for D2C founders. Get your personalized strategy, competitive analysis & 6-month roadmap for just $4.99.">

    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Lora:ital,wght@0,400;0,500;1,400;1,500&display=swap" rel="stylesheet">

    <script src="/static/shared/storage.js"></script>

    <script>
      tailwind.config = {
        theme: {
          extend: {
            fontFamily: {
              serif:    ['Playfair Display', 'Georgia', 'serif'],
              sans:     ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
              editorial:['Lora', 'Georgia', 'serif'],
            },
            colors: {
              cream:  '#FAF7F4',
              canvas: '#F5EFE8',
              warm:   '#EDE4D9',
              stone:  '#D6CCBF',
              mist:   '#C4BAB0',
              sand:   '#B09A85',
              rust:   '#BF6744',
              ember:  '#D4794A',
              ginger: '#E8946A',
              forest: '#4A6741',
              sage:   '#6E8B5E',
              fern:   '#8AAB78',
              ink:    '#1C1917',
              charcoal:'#3D3530',
              drift:  '#7A6E65',
              cloud:  '#A8A09A',
            }
          }
        }
      }
    </script>

    <style>
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; }

      body {
        background: #FAF7F4;
        color: #1C1917;
        font-family: 'Plus Jakarta Sans', sans-serif;
        -webkit-font-smoothing: antialiased;
        overflow-x: hidden;
      }

      /* ── Scrollbar ── */
      ::-webkit-scrollbar { width: 5px; }
      ::-webkit-scrollbar-track { background: #F5EFE8; }
      ::-webkit-scrollbar-thumb { background: #C4BAB0; border-radius: 3px; }

      /* ── Typography ── */
      .editorial {
        font-family: 'Playfair Display', serif;
        line-height: 1.1;
        letter-spacing: -0.02em;
      }
      .editorial-body {
        font-family: 'Lora', serif;
        line-height: 1.75;
      }
      .eyebrow {
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: #B09A85;
        font-family: 'Plus Jakarta Sans', sans-serif;
      }

      /* ── Nav ── */
      .nav-link {
        color: #7A6E65;
        font-size: 14px;
        font-weight: 400;
        text-decoration: none;
        transition: color 0.2s;
      }
      .nav-link:hover { color: #1C1917; }

      /* ── Buttons ── */
      .btn-primary {
        background: #1C1917;
        color: #FAF7F4;
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 14px;
        font-weight: 600;
        letter-spacing: 0.01em;
        padding: 14px 28px;
        border-radius: 100px;
        border: none;
        cursor: pointer;
        transition: all 0.2s ease;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        text-decoration: none;
      }
      .btn-primary:hover {
        background: #3D3530;
        transform: translateY(-1px);
        box-shadow: 0 6px 24px rgba(28,25,23,0.2);
      }

      .btn-outline {
        background: transparent;
        color: #1C1917;
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 14px;
        font-weight: 500;
        padding: 13px 26px;
        border-radius: 100px;
        border: 1.5px solid #D6CCBF;
        cursor: pointer;
        transition: all 0.2s ease;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        text-decoration: none;
      }
      .btn-outline:hover {
        border-color: #1C1917;
        transform: translateY(-1px);
      }

      .btn-rust {
        background: #BF6744;
        color: #FAF7F4;
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 15px;
        font-weight: 600;
        padding: 16px 36px;
        border-radius: 100px;
        border: none;
        cursor: pointer;
        transition: all 0.25s ease;
        display: inline-flex;
        align-items: center;
        gap: 9px;
        text-decoration: none;
      }
      .btn-rust:hover {
        background: #A85A3A;
        transform: translateY(-2px);
        box-shadow: 0 10px 32px rgba(191,103,68,0.32);
      }

      /* ── Cards ── */
      .card {
        background: #FFFFFF;
        border: 1px solid #EDE4D9;
        border-radius: 24px;
        transition: all 0.25s ease;
      }
      .card:hover {
        border-color: #D6CCBF;
        box-shadow: 0 12px 40px rgba(28,25,23,0.06);
        transform: translateY(-2px);
      }

      .card-canvas {
        background: #F5EFE8;
        border-radius: 24px;
      }
      .card-warm {
        background: #EDE4D9;
        border-radius: 24px;
      }

      /* ── Input ── */
      .url-input {
        background: white;
        border: 1.5px solid #D6CCBF;
        border-radius: 100px;
        color: #1C1917;
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 15px;
        padding: 15px 24px;
        outline: none;
        transition: border-color 0.2s;
        width: 100%;
      }
      .url-input::placeholder { color: #C4BAB0; }
      .url-input:focus { border-color: #1C1917; box-shadow: 0 0 0 3px rgba(28,25,23,0.06); }

      /* ── Dividers ── */
      .rule {
        height: 1px;
        background: linear-gradient(to right, transparent, #D6CCBF 30%, #D6CCBF 70%, transparent);
      }

      /* ── Badge pills ── */
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: white;
        border: 1px solid #EDE4D9;
        color: #7A6E65;
        font-size: 12px;
        font-weight: 500;
        padding: 6px 13px;
        border-radius: 100px;
        font-family: 'Plus Jakarta Sans', sans-serif;
      }
      .badge-rust {
        background: #FDF2EE;
        border-color: #F0CEBE;
        color: #BF6744;
      }
      .badge-sage {
        background: #EEF3EC;
        border-color: #CBDAC4;
        color: #4A6741;
      }
      .badge-canvas {
        background: #F5EFE8;
        border-color: #D6CCBF;
        color: #7A6E65;
      }

      /* ── Stats ── */
      .stat-num {
        font-family: 'Playfair Display', serif;
        font-weight: 700;
        font-size: clamp(44px, 5.5vw, 72px);
        line-height: 1;
        color: #1C1917;
      }

      /* ── Step dots ── */
      .step-dot {
        width: 52px;
        height: 52px;
        border-radius: 50%;
        background: #F5EFE8;
        border: 2px solid #D6CCBF;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Playfair Display', serif;
        font-weight: 700;
        font-size: 22px;
        color: #3D3530;
        flex-shrink: 0;
      }

      /* ── Testimonial ── */
      .quote-open {
        font-family: 'Playfair Display', serif;
        font-size: 72px;
        line-height: 0.7;
        color: #EDE4D9;
        display: block;
        margin-bottom: 12px;
      }

      /* ── Subtle texture header ── */
      .hero-bg {
        background: #FFFFFF;
        position: relative;
      }
      .hero-bg::after {
        content: '';
        position: absolute;
        bottom: 0; left: 0; right: 0;
        height: 300px;
        background: linear-gradient(to bottom, transparent, #FAF7F4);
        pointer-events: none;
      }

      /* ── Section spacing ── */
      .section     { padding: 100px 24px; }
      .section-sm  { padding: 64px 24px; }

      /* ── Hover lift ── */
      .hover-lift {
        transition: transform 0.22s ease, box-shadow 0.22s ease;
      }
      .hover-lift:hover {
        transform: translateY(-3px);
        box-shadow: 0 14px 44px rgba(28,25,23,0.09);
      }

      /* ── Smooth fade-in ── */
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(24px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .fade-up { animation: fadeUp 0.75s cubic-bezier(0.22,1,0.36,1) forwards; }
      .d1 { animation-delay: 0.05s; opacity: 0; }
      .d2 { animation-delay: 0.18s; opacity: 0; }
      .d3 { animation-delay: 0.32s; opacity: 0; }
      .d4 { animation-delay: 0.46s; opacity: 0; }
      .d5 { animation-delay: 0.60s; opacity: 0; }

      /* ── Ticker ── */
      @keyframes marquee {
        0%   { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      .ticker-track {
        display: flex;
        animation: marquee 30s linear infinite;
        width: max-content;
        gap: 0;
      }

      /* ── Dashed connector ── */
      .dash-line {
        flex: 1;
        height: 1px;
        border-top: 2px dashed #D6CCBF;
        margin: 0 12px;
        margin-top: 26px;
      }

      /* ── Channel icon chip ── */
      .icon-chip {
        width: 48px;
        height: 48px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      /* ── Play button ── */
      .play-circle {
        width: 68px;
        height: 68px;
        border-radius: 50%;
        background: white;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 6px 28px rgba(28,25,23,0.16);
        transition: transform 0.2s, box-shadow 0.2s;
        cursor: pointer;
      }
      .play-circle:hover {
        transform: scale(1.1);
        box-shadow: 0 10px 36px rgba(28,25,23,0.24);
      }

      /* ── FAQ ── */
      details summary { list-style: none; cursor: pointer; user-select: none; }
      details summary::-webkit-details-marker { display: none; }
      details[open] .faq-plus { transform: rotate(45deg); }
      .faq-plus { transition: transform 0.2s ease; }

      /* ── Pricing highlight ring ── */
      .price-popular {
        background: #1C1917;
        border-radius: 24px;
        position: relative;
        overflow: hidden;
      }
      .price-popular::before {
        content: '';
        position: absolute;
        top: -80px; right: -80px;
        width: 200px; height: 200px;
        background: radial-gradient(circle, rgba(191,103,68,0.18), transparent 70%);
        pointer-events: none;
      }

      /* ── Mobile ── */
      @media (max-width: 768px) {
        .section { padding: 72px 20px; }
        .hero-cols { grid-template-columns: 1fr !important; }
        .compare-cols { grid-template-columns: 1fr !important; }
        .steps-row { flex-direction: column !important; }
        .dash-line { display: none !important; }
        .agent-cols { grid-template-columns: 1fr 1fr !important; }
        .price-cols { grid-template-columns: 1fr !important; }
        .stats-row { grid-template-columns: 1fr 1fr !important; }
        .case-cols { grid-template-columns: 1fr !important; }
        .testi-cols { grid-template-columns: 1fr !important; }
        .hide-sm { display: none !important; }
        .footer-cols { flex-direction: column !important; gap: 20px !important; }
      }
    </style>
</head>
<body>

  <!-- ══════════════════════════════
       NAV
  ══════════════════════════════ -->
  <nav style="position:fixed;top:0;left:0;width:100%;z-index:200;background:rgba(250,247,244,0.94);backdrop-filter:blur(16px);border-bottom:1px solid #EDE4D9;">
    <div style="max-width:1200px;margin:0 auto;padding:0 24px;height:64px;display:flex;align-items:center;justify-content:space-between;">

      <!-- Logo -->
      <a href="/" style="text-decoration:none;display:flex;align-items:center;gap:10px;">
        <!-- Auxora logomark: A mark on dark pill -->
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="36" height="36" rx="11" fill="#1C1917"/>
          <path d="M11.5 25.5L18 10.5l6.5 15" stroke="#FAF7F4" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M14 20.5h8" stroke="#BF6744" stroke-width="2.2" stroke-linecap="round"/>
        </svg>
        <span style="font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:19px;color:#1C1917;letter-spacing:-0.04em;line-height:1;">Auxora</span>
      </a>

      <!-- Links -->
      <div style="display:flex;align-items:center;gap:28px;">
        <a href="#how-it-works" class="nav-link hide-sm">How it works</a>
        <a href="#results" class="nav-link hide-sm">Results</a>
        <a href="#pricing" class="nav-link hide-sm">Pricing</a>
        <a href="/login" class="nav-link" style="font-size:14px;">Sign in</a>
        <button onclick="startJourney()" class="btn-primary" style="padding:11px 22px;font-size:13px;">
          Get started →
        </button>
      </div>

    </div>
  </nav>


  <!-- ══════════════════════════════
       HERO
  ══════════════════════════════ -->
  <section style="padding:116px 24px 0;background:#FFFFFF;">
    <div style="max-width:1200px;margin:0 auto;">

      <!-- Eyebrow -->
      <div class="fade-up d1" style="text-align:center;margin-bottom:20px;">
        <span class="badge badge-rust" style="font-size:12px;">
          <span style="width:7px;height:7px;border-radius:50%;background:#BF6744;display:inline-block;animation:pulse 2s infinite;"></span>
          Trusted by 200+ D2C founders &nbsp;·&nbsp; Built by team behind $15M in 10 months
        </span>
      </div>

      <!-- Definition line — what Auxora IS -->
      <div class="fade-up d1" style="text-align:center;margin-bottom:28px;">
        <p style="font-size:13px;font-weight:700;letter-spacing:0.10em;text-transform:uppercase;color:#A8A09A;margin:0;">
          <span style="color:#1C1917;">Auxora:</span>&nbsp; The World's First &nbsp;<span style="color:#BF6744;">Vibe Business Agent</span>&nbsp;<span style="color:#A8A09A;">for D2C Brands</span>
        </p>
      </div>

      <!-- Headline -->
      <div class="fade-up d2" style="text-align:center;margin-bottom:20px;">
        <h1 class="editorial" style="font-size:clamp(44px,6vw,88px);color:#1C1917;max-width:980px;margin:0 auto;line-height:1.05;">
          What takes an agency 30 days &amp; $12,000<br/>
          <em style="color:#BF6744;font-style:italic;">we do in 1 day for $200.</em>
        </h1>
      </div>

      <!-- Sub-headline — single clean statement, no repetition -->
      <div class="fade-up d3" style="text-align:center;margin-bottom:48px;">
        <p style="font-size:19px;color:#7A6E65;max-width:640px;margin:0 auto;line-height:1.8;">
          Strategy · landing page · ads · email · SEO — fully automated.
          <br/>Live in <strong style="color:#1C1917;">24 hours</strong>, built to scale to <strong style="color:#1C1917;">$100M ARR</strong>.
          <br/><span style="font-size:15px;color:#A8A09A;">Priced for results, not retainers.</span>
        </p>
      </div>

      <!-- CTA row -->
      <div class="fade-up d4" style="text-align:center;margin-bottom:20px;">
        <form id="heroForm" style="display:inline-flex;gap:8px;max-width:480px;width:100%;background:white;border:1.5px solid #D6CCBF;border-radius:100px;padding:6px 6px 6px 20px;box-shadow:0 4px 24px rgba(28,25,23,0.07);">
          <input
            type="text"
            id="heroInput"
            placeholder="Enter your brand URL…"
            class="url-input"
            style="border:none;padding:10px 4px;box-shadow:none;font-size:15px;"
          />
          <button type="submit" class="btn-rust" style="padding:12px 28px;font-size:14px;flex-shrink:0;">
            Get started free →
          </button>
        </form>
      </div>

      <div class="fade-up d5" style="text-align:center;margin-bottom:0;">
        <span style="font-size:13px;color:#A8A09A;">
          No credit card to start &nbsp;·&nbsp; First audit $4.99 &nbsp;·&nbsp; Cancel anytime
        </span>
      </div>

      <!-- Hero: Agency vs Auxora comparison -->
      <div style="margin-top:60px;">

        <!-- Agency Timeline vs Auxora -->
        <div style="background:#F5EFE8;border-radius:24px;padding:36px;max-width:900px;margin:0 auto;">
          <p class="eyebrow" style="text-align:center;margin-bottom:28px;">The same full service — done in 1 day, not 30</p>
          <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:16px;align-items:start;">

            <!-- Agency -->
            <div>
              <div style="font-size:11px;font-weight:700;color:#BF6744;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:14px;">Agency · 30 days · $12,000</div>
              <div style="display:flex;flex-direction:column;gap:9px;">
                <div style="display:flex;align-items:center;gap:10px;"><div style="width:46px;height:22px;border-radius:100px;background:#F0D8CE;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><span style="font-size:8px;color:#BF6744;font-weight:700;">7 days</span></div><span style="font-size:13px;color:#7A6E65;">Strategy &amp; positioning</span></div>
                <div style="display:flex;align-items:center;gap:10px;"><div style="width:46px;height:22px;border-radius:100px;background:#F0D8CE;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><span style="font-size:8px;color:#BF6744;font-weight:700;">5 days</span></div><span style="font-size:13px;color:#7A6E65;">Landing page &amp; website</span></div>
                <div style="display:flex;align-items:center;gap:10px;"><div style="width:46px;height:22px;border-radius:100px;background:#F0D8CE;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><span style="font-size:8px;color:#BF6744;font-weight:700;">5 days</span></div><span style="font-size:13px;color:#7A6E65;">Ad creative production</span></div>
                <div style="display:flex;align-items:center;gap:10px;"><div style="width:46px;height:22px;border-radius:100px;background:#F0D8CE;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><span style="font-size:8px;color:#BF6744;font-weight:700;">5 days</span></div><span style="font-size:13px;color:#7A6E65;">Campaign setup &amp; launch</span></div>
                <div style="display:flex;align-items:center;gap:10px;"><div style="width:46px;height:22px;border-radius:100px;background:#F0D8CE;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><span style="font-size:8px;color:#BF6744;font-weight:700;">4 days</span></div><span style="font-size:13px;color:#7A6E65;">A/B testing setup</span></div>
                <div style="display:flex;align-items:center;gap:10px;"><div style="width:46px;height:22px;border-radius:100px;background:#F0D8CE;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><span style="font-size:8px;color:#BF6744;font-weight:700;">4 days</span></div><span style="font-size:13px;color:#7A6E65;">Email flows for LTV</span></div>
              </div>
              <div style="margin-top:14px;padding:10px 16px;background:#FDF2EE;border-radius:12px;border:1px solid #F0CEBE;">
                <div style="font-size:18px;font-weight:800;color:#BF6744;font-family:'Playfair Display',serif;">30 days total</div>
                <div style="font-size:11px;color:#A8A09A;margin-top:2px;">$12,000 · paid upfront · no guarantee</div>
              </div>
            </div>

            <!-- VS -->
            <div style="display:flex;flex-direction:column;align-items:center;padding:0 6px;">
              <div style="flex:1;width:1px;background:linear-gradient(to bottom,transparent,#D6CCBF);"></div>
              <div style="font-size:12px;font-weight:700;color:#1C1917;background:white;border:1.5px solid #D6CCBF;border-radius:100px;padding:5px 10px;margin:8px 0;">VS</div>
              <div style="flex:1;width:1px;background:linear-gradient(to bottom,#D6CCBF,transparent);"></div>
            </div>

            <!-- Auxora -->
            <div>
              <div style="font-size:11px;font-weight:700;color:#4A6741;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:14px;">Auxora · 24 hours · $200</div>
              <div style="display:flex;flex-direction:column;gap:9px;">
                <div style="display:flex;align-items:center;gap:10px;"><div style="width:46px;height:22px;border-radius:100px;background:#C8D8C2;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><span style="font-size:8px;color:#4A6741;font-weight:700;">2 hrs</span></div><span style="font-size:13px;color:#3D4A38;">Strategy &amp; positioning</span></div>
                <div style="display:flex;align-items:center;gap:10px;"><div style="width:46px;height:22px;border-radius:100px;background:#C8D8C2;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><span style="font-size:8px;color:#4A6741;font-weight:700;">4 hrs</span></div><span style="font-size:13px;color:#3D4A38;">Landing page &amp; website</span></div>
                <div style="display:flex;align-items:center;gap:10px;"><div style="width:46px;height:22px;border-radius:100px;background:#C8D8C2;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><span style="font-size:8px;color:#4A6741;font-weight:700;">3 hrs</span></div><span style="font-size:13px;color:#3D4A38;">AI-generated ad creatives</span></div>
                <div style="display:flex;align-items:center;gap:10px;"><div style="width:46px;height:22px;border-radius:100px;background:#C8D8C2;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><span style="font-size:8px;color:#4A6741;font-weight:700;">4 hrs</span></div><span style="font-size:13px;color:#3D4A38;">Auto campaign setup &amp; launch</span></div>
                <div style="display:flex;align-items:center;gap:10px;"><div style="width:46px;height:22px;border-radius:100px;background:#C8D8C2;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><span style="font-size:8px;color:#4A6741;font-weight:700;">3 hrs</span></div><span style="font-size:13px;color:#3D4A38;">Automated A/B testing</span></div>
                <div style="display:flex;align-items:center;gap:10px;"><div style="width:46px;height:22px;border-radius:100px;background:#C8D8C2;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><span style="font-size:8px;color:#4A6741;font-weight:700;">4 hrs</span></div><span style="font-size:13px;color:#3D4A38;">Email &amp; LTV automation</span></div>
              </div>
              <div style="margin-top:14px;padding:10px 16px;background:#EEF3EC;border-radius:12px;border:1px solid #C8D8C2;">
                <div style="font-size:18px;font-weight:800;color:#4A6741;font-family:'Playfair Display',serif;">24 hours total</div>
                <div style="font-size:11px;color:#A8A09A;margin-top:2px;">$200 · pay as you go · cancel anytime</div>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  </section>


  <!-- ══════════════════════════════
       RESULTS / CASE STUDY
  ══════════════════════════════ -->
  <section id="results" class="section" style="background:#FAF7F4;">
    <div style="max-width:1200px;margin:0 auto;">

      <div style="max-width:560px;margin:0 auto 48px;text-align:center;">
        <p class="eyebrow" style="margin-bottom:16px;">Real results</p>
        <h2 class="editorial" style="font-size:clamp(40px,4.5vw,62px);color:#1C1917;">
          Founders who stopped<br/>
          <em style="color:#BF6744;">grinding and grew.</em>
        </h2>
      </div>

      <!-- Brand social proof chips -->
      <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:10px;max-width:760px;margin:0 auto 56px;">
        <span style="font-size:12px;font-weight:600;color:#1C1917;background:white;border:1.5px solid #EDE4D9;border-radius:100px;padding:7px 18px;letter-spacing:0.02em;">Yamabushi Farms <span style="color:#BF6744;margin-left:4px;">10× revenue</span></span>
        <span style="font-size:12px;font-weight:600;color:#1C1917;background:white;border:1.5px solid #EDE4D9;border-radius:100px;padding:7px 18px;letter-spacing:0.02em;">Mourish <span style="color:#4A6741;margin-left:4px;">3× ROAS</span></span>
        <span style="font-size:12px;font-weight:600;color:#1C1917;background:white;border:1.5px solid #EDE4D9;border-radius:100px;padding:7px 18px;letter-spacing:0.02em;">Profeliz <span style="color:#BF6744;margin-left:4px;">live in 24h</span></span>
        <span style="font-size:12px;font-weight:600;color:#1C1917;background:white;border:1.5px solid #EDE4D9;border-radius:100px;padding:7px 18px;letter-spacing:0.02em;">Sakura Floor <span style="color:#4A6741;margin-left:4px;">62% lower CAC</span></span>
        <span style="font-size:12px;font-weight:600;color:#1C1917;background:white;border:1.5px solid #EDE4D9;border-radius:100px;padding:7px 18px;letter-spacing:0.02em;">NoExit <span style="color:#BF6744;margin-left:4px;">profitable in 6wk</span></span>
      </div>

      <!-- Hero case study card -->
      <div class="case-cols card" style="overflow:hidden;max-width:920px;margin:0 auto 24px;display:grid;grid-template-columns:1fr 1fr;border:1px solid #EDE4D9;">

        <!-- Video side -->
        <div style="position:relative;cursor:pointer;background:#E8DDD0;min-height:320px;overflow:hidden;" onclick="openVideoModal(0)">
          <img
            src="https://img.youtube.com/vi/nw1XYryhdIU/maxresdefault.jpg"
            alt="Yamabushi Farms case study"
            style="width:100%;height:100%;object-fit:cover;display:block;"
          />
          <div style="position:absolute;inset:0;background:linear-gradient(to bottom,rgba(28,25,23,0.1),rgba(28,25,23,0.5));"></div>
          <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;">
            <div class="play-circle">
              <i class="fas fa-play" style="color:#1C1917;font-size:20px;margin-left:3px;"></i>
            </div>
          </div>
          <div style="position:absolute;top:16px;left:16px;">
            <span class="badge badge-rust" style="font-size:11px;">🛒 D2C Case Study</span>
          </div>
          <div style="position:absolute;bottom:20px;left:20px;">
            <div class="editorial" style="font-size:20px;color:white;font-style:italic;">Watch the story →</div>
          </div>
        </div>

        <!-- Stats side -->
        <div style="padding:36px;background:white;">
          <p class="eyebrow" style="margin-bottom:10px;">Verified results</p>
          <h3 class="editorial" style="font-size:34px;color:#1C1917;margin-bottom:4px;">Yamabushi Farms</h3>
          <p style="font-size:13px;color:#A8A09A;margin-bottom:28px;">Japanese wellness · D2C direct</p>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:28px;">
            <div style="background:#FDF2EE;border-radius:14px;padding:16px;text-align:center;">
              <div class="editorial" style="font-size:38px;color:#BF6744;line-height:1;">10×</div>
              <div style="font-size:11px;color:#A8A09A;margin-top:4px;font-weight:500;">Revenue · 2 months</div>
            </div>
            <div style="background:#EEF3EC;border-radius:14px;padding:16px;text-align:center;">
              <div class="editorial" style="font-size:38px;color:#4A6741;line-height:1;">3×</div>
              <div style="font-size:11px;color:#A8A09A;margin-top:4px;font-weight:500;">ROAS · month 1</div>
            </div>
            <div style="background:#F5EFE8;border-radius:14px;padding:16px;text-align:center;">
              <div class="editorial" style="font-size:38px;color:#3D3530;line-height:1;">62%</div>
              <div style="font-size:11px;color:#A8A09A;margin-top:4px;font-weight:500;">CAC reduction</div>
            </div>
            <div style="background:#FDF2EE;border-radius:14px;padding:16px;text-align:center;">
              <div class="editorial" style="font-size:38px;color:#BF6744;line-height:1;">6wk</div>
              <div style="font-size:11px;color:#A8A09A;margin-top:4px;font-weight:500;">To profitability</div>
            </div>
          </div>

          <button onclick="openVideoModal(0)" class="btn-outline" style="width:100%;justify-content:center;">
            <i class="fas fa-play-circle" style="color:#BF6744;"></i> Watch the full story
          </button>
        </div>

      </div>

      <!-- Testimonials -->
      <div class="testi-cols" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;max-width:920px;margin:0 auto;">

        <div class="card" style="padding:32px;background:white;">
          <span class="quote-open">"</span>
          <p class="editorial-body" style="font-size:15px;color:#3D3530;line-height:1.8;margin-bottom:24px;">
            I was paying $5K a month to an agency with nothing to show for it. Auxora gave me a real strategy in 10 minutes — and the numbers started moving within two weeks.
          </p>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#BF6744,#D4845C);display:flex;align-items:center;justify-content:center;color:white;font-family:'Playfair Display',serif;font-size:17px;font-weight:600;flex-shrink:0;">S</div>
            <div style="flex:1;">
              <div style="font-size:14px;font-weight:600;color:#1C1917;">Sarah K.</div>
              <div class="eyebrow" style="font-size:10px;">Skincare founder</div>
            </div>
            <div style="display:flex;gap:2px;">
              <i class="fas fa-star" style="color:#D4795A;font-size:12px;"></i>
              <i class="fas fa-star" style="color:#D4795A;font-size:12px;"></i>
              <i class="fas fa-star" style="color:#D4795A;font-size:12px;"></i>
              <i class="fas fa-star" style="color:#D4795A;font-size:12px;"></i>
              <i class="fas fa-star" style="color:#D4795A;font-size:12px;"></i>
            </div>
          </div>
        </div>

        <div class="card" style="padding:32px;background:white;">
          <span class="quote-open">"</span>
          <p class="editorial-body" style="font-size:15px;color:#3D3530;line-height:1.8;margin-bottom:24px;">
            The $4.99 report was the most valuable thing I bought this year. It showed me exactly why my Meta ads weren't working and gave me a step-by-step fix. Genuinely insane value.
          </p>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#4A6741,#6E8B5E);display:flex;align-items:center;justify-content:center;color:white;font-family:'Playfair Display',serif;font-size:17px;font-weight:600;flex-shrink:0;">M</div>
            <div style="flex:1;">
              <div style="font-size:14px;font-weight:600;color:#1C1917;">Marcus T.</div>
              <div class="eyebrow" style="font-size:10px;">Pet accessories brand</div>
            </div>
            <div style="display:flex;gap:2px;">
              <i class="fas fa-star" style="color:#D4795A;font-size:12px;"></i>
              <i class="fas fa-star" style="color:#D4795A;font-size:12px;"></i>
              <i class="fas fa-star" style="color:#D4795A;font-size:12px;"></i>
              <i class="fas fa-star" style="color:#D4795A;font-size:12px;"></i>
              <i class="fas fa-star" style="color:#D4795A;font-size:12px;"></i>
            </div>
          </div>
        </div>

      </div>
    </div>
  </section>




  <!-- ══════════════════════════════
       CATEGORY BAR
  ══════════════════════════════ -->
  <div style="background:#F5EFE8;padding:20px 24px;border-top:1px solid #EDE4D9;border-bottom:1px solid #EDE4D9;overflow:hidden;">
    <div class="ticker-track">
      <!-- block 1 -->
      <div style="display:flex;align-items:center;gap:32px;padding:0 16px;white-space:nowrap;">
        <span style="font-family:'Playfair Display',serif;font-size:14px;color:#7A6E65;font-style:italic;">Wellness</span><span style="color:#D6CCBF;">✦</span>
        <span style="font-family:'Playfair Display',serif;font-size:14px;color:#7A6E65;font-style:italic;">Beauty & Skincare</span><span style="color:#D6CCBF;">✦</span>
        <span style="font-family:'Playfair Display',serif;font-size:14px;color:#7A6E65;font-style:italic;">Food & Beverage</span><span style="color:#D6CCBF;">✦</span>
        <span style="font-family:'Playfair Display',serif;font-size:14px;color:#7A6E65;font-style:italic;">Apparel & Fashion</span><span style="color:#D6CCBF;">✦</span>
        <span style="font-family:'Playfair Display',serif;font-size:14px;color:#7A6E65;font-style:italic;">Home Goods</span><span style="color:#D6CCBF;">✦</span>
        <span style="font-family:'Playfair Display',serif;font-size:14px;color:#7A6E65;font-style:italic;">Pet Care</span><span style="color:#D6CCBF;">✦</span>
        <span style="font-family:'Playfair Display',serif;font-size:14px;color:#7A6E65;font-style:italic;">Supplements</span><span style="color:#D6CCBF;">✦</span>
        <span style="font-family:'Playfair Display',serif;font-size:14px;color:#7A6E65;font-style:italic;">Baby & Kids</span><span style="color:#D6CCBF;">✦</span>
        <span style="font-family:'Playfair Display',serif;font-size:14px;color:#7A6E65;font-style:italic;">Outdoor & Active</span><span style="color:#D6CCBF;">✦</span>
        <span style="font-family:'Playfair Display',serif;font-size:14px;color:#7A6E65;font-style:italic;">Sustainable Goods</span><span style="color:#D6CCBF;">✦</span>
      </div>
      <!-- block 2 (mirror) -->
      <div style="display:flex;align-items:center;gap:32px;padding:0 16px;white-space:nowrap;">
        <span style="font-family:'Playfair Display',serif;font-size:14px;color:#7A6E65;font-style:italic;">Wellness</span><span style="color:#D6CCBF;">✦</span>
        <span style="font-family:'Playfair Display',serif;font-size:14px;color:#7A6E65;font-style:italic;">Beauty & Skincare</span><span style="color:#D6CCBF;">✦</span>
        <span style="font-family:'Playfair Display',serif;font-size:14px;color:#7A6E65;font-style:italic;">Food & Beverage</span><span style="color:#D6CCBF;">✦</span>
        <span style="font-family:'Playfair Display',serif;font-size:14px;color:#7A6E65;font-style:italic;">Apparel & Fashion</span><span style="color:#D6CCBF;">✦</span>
        <span style="font-family:'Playfair Display',serif;font-size:14px;color:#7A6E65;font-style:italic;">Home Goods</span><span style="color:#D6CCBF;">✦</span>
        <span style="font-family:'Playfair Display',serif;font-size:14px;color:#7A6E65;font-style:italic;">Pet Care</span><span style="color:#D6CCBF;">✦</span>
        <span style="font-family:'Playfair Display',serif;font-size:14px;color:#7A6E65;font-style:italic;">Supplements</span><span style="color:#D6CCBF;">✦</span>
        <span style="font-family:'Playfair Display',serif;font-size:14px;color:#7A6E65;font-style:italic;">Baby & Kids</span><span style="color:#D6CCBF;">✦</span>
        <span style="font-family:'Playfair Display',serif;font-size:14px;color:#7A6E65;font-style:italic;">Outdoor & Active</span><span style="color:#D6CCBF;">✦</span>
        <span style="font-family:'Playfair Display',serif;font-size:14px;color:#7A6E65;font-style:italic;">Sustainable Goods</span><span style="color:#D6CCBF;">✦</span>
      </div>
    </div>
  </div>


  <!-- ══════════════════════════════
       WHY AUXORA IS DIFFERENT
  ══════════════════════════════ -->
  <section style="background:#1C1917;padding:60px 24px;">
    <div style="max-width:1000px;margin:0 auto;">

      <p style="text-align:center;font-size:11px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#7A6E65;margin-bottom:40px;">Why Auxora is different — from the team that’s done it before</p>

      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;">

        <!-- Card 1: Speed -->
        <div style="background:#252220;border:1px solid #3D3530;border-radius:20px;padding:32px 26px;position:relative;overflow:hidden;">
          <div style="position:absolute;top:-40px;right:-40px;width:100px;height:100px;border-radius:50%;background:rgba(191,103,68,0.07);"></div>
          <div style="width:40px;height:40px;border-radius:12px;background:#3D3530;display:flex;align-items:center;justify-content:center;margin-bottom:18px;">
            <i class="fas fa-bolt" style="color:#BF6744;font-size:15px;"></i>
          </div>
          <div class="editorial" style="font-size:clamp(36px,3.5vw,50px);color:#FAF7F4;line-height:1;margin-bottom:6px;">1 day<br/><span style="color:#BF6744;font-size:0.5em;font-style:italic;">not 30 days</span></div>
          <p style="font-size:13px;color:#7A6E65;line-height:1.65;margin-top:10px;margin-bottom:16px;">An agency takes 30 days to do strategy, landing page, creatives, campaign setup, A/B tests, and email flows. Auxora’s AI does all of it in <strong style="color:#A8A09A;">24 hours</strong>.</p>
          <div style="display:flex;gap:5px;flex-wrap:wrap;">
            <span style="font-size:10px;padding:3px 9px;background:#1C1917;border:1px solid #3D3530;border-radius:100px;color:#7A6E65;">Strategy</span>
            <span style="font-size:10px;padding:3px 9px;background:#1C1917;border:1px solid #3D3530;border-radius:100px;color:#7A6E65;">Landing page</span>
            <span style="font-size:10px;padding:3px 9px;background:#1C1917;border:1px solid #3D3530;border-radius:100px;color:#7A6E65;">Creatives</span>
            <span style="font-size:10px;padding:3px 9px;background:#1C1917;border:1px solid #3D3530;border-radius:100px;color:#7A6E65;">Campaigns</span>
            <span style="font-size:10px;padding:3px 9px;background:#1C1917;border:1px solid #3D3530;border-radius:100px;color:#7A6E65;">A/B Tests</span>
            <span style="font-size:10px;padding:3px 9px;background:#1C1917;border:1px solid #3D3530;border-radius:100px;color:#7A6E65;">Email LTV</span>
          </div>
        </div>

        <!-- Card 2: Scale -->
        <div style="background:#252220;border:1px solid #3D3530;border-radius:20px;padding:32px 26px;position:relative;overflow:hidden;">
          <div style="position:absolute;top:-40px;right:-40px;width:100px;height:100px;border-radius:50%;background:rgba(74,103,65,0.07);"></div>
          <div style="width:40px;height:40px;border-radius:12px;background:#3D3530;display:flex;align-items:center;justify-content:center;margin-bottom:18px;">
            <i class="fas fa-chart-line" style="color:#6E8B5E;font-size:15px;"></i>
          </div>
          <div class="editorial" style="font-size:clamp(36px,3.5vw,50px);color:#FAF7F4;line-height:1;margin-bottom:6px;">$100M<br/><span style="color:#6E8B5E;font-size:0.5em;font-style:italic;">ARR-ready</span></div>
          <p style="font-size:13px;color:#7A6E65;line-height:1.65;margin-top:10px;margin-bottom:16px;">Our founding team scaled a product from <strong style="color:#A8A09A;">$100K → $15M ARR in 10 months</strong>. That same playbook — now fully automated and available to every founder.</p>
          <div style="padding:10px 14px;background:#1C1917;border-radius:10px;border:1px solid #3D3530;">
            <div style="font-size:11px;color:#7A6E65;">Track record: <span style="color:#FAF7F4;font-weight:600;">LAIX (FluentU) · XNG · Silicon Valley</span></div>
          </div>
        </div>

        <!-- Card 3: Cost -->
        <div style="background:#252220;border:1px solid #3D3530;border-radius:20px;padding:32px 26px;position:relative;overflow:hidden;">
          <div style="position:absolute;top:-40px;right:-40px;width:100px;height:100px;border-radius:50%;background:rgba(250,247,244,0.03);"></div>
          <div style="width:40px;height:40px;border-radius:12px;background:#3D3530;display:flex;align-items:center;justify-content:center;margin-bottom:18px;">
            <i class="fas fa-coins" style="color:#B09A85;font-size:15px;"></i>
          </div>
          <div class="editorial" style="font-size:clamp(36px,3.5vw,50px);color:#FAF7F4;line-height:1;margin-bottom:6px;">$200<br/><span style="color:#B09A85;font-size:0.5em;font-style:italic;">not $12,000</span></div>
          <p style="font-size:13px;color:#7A6E65;line-height:1.65;margin-top:10px;margin-bottom:16px;">Agencies charge <strong style="color:#A8A09A;">$12,000</strong> for the same full-service package — paid upfront with no performance guarantee. Auxora delivers it for <strong style="color:#A8A09A;">$200</strong>.</p>
          <div style="padding:10px 14px;background:#1C1917;border-radius:10px;border:1px solid #3D3530;display:flex;align-items:center;justify-content:space-around;">
            <div style="text-align:center;"><div style="font-size:16px;font-weight:700;color:#BF6744;font-family:'Playfair Display',serif;">$12K</div><div style="font-size:10px;color:#7A6E65;">Agency</div></div>
            <div style="color:#3D3530;font-size:14px;">→</div>
            <div style="text-align:center;"><div style="font-size:16px;font-weight:700;color:#FAF7F4;font-family:'Playfair Display',serif;">$200</div><div style="font-size:10px;color:#7A6E65;">Auxora</div></div>
            <div style="color:#3D3530;font-size:14px;">→</div>
            <div style="text-align:center;"><div style="font-size:16px;font-weight:700;color:#6E8B5E;font-family:'Playfair Display',serif;">60×</div><div style="font-size:10px;color:#7A6E65;">cheaper</div></div>
          </div>
        </div>

      </div>
    </div>
  </section>


  <!-- ══════════════════════════════
       HOW IT WORKS
  ══════════════════════════════ -->
  <section id="how-it-works" class="section" style="background:#FAF7F4;">
    <div style="max-width:1200px;margin:0 auto;">

      <div style="max-width:560px;margin:0 auto 80px;text-align:center;">
        <p class="eyebrow" style="margin-bottom:16px;">The process</p>
        <h2 class="editorial" style="font-size:clamp(40px,4.5vw,62px);color:#1C1917;">
          From your story<br/>to your strategy
        </h2>
      </div>

      <!-- 4 steps row -->
      <div class="steps-row" style="display:flex;align-items:flex-start;justify-content:center;max-width:960px;margin:0 auto 64px;gap:0;">

        <div style="flex:1;max-width:210px;text-align:center;padding:0 12px;">
          <div style="display:flex;justify-content:center;margin-bottom:20px;">
            <div class="step-dot">1</div>
          </div>
          <h3 class="editorial" style="font-size:20px;color:#1C1917;margin-bottom:10px;">Tell your brand story</h3>
          <p style="font-size:13px;color:#A8A09A;line-height:1.65;">A 10-minute AI-guided conversation. No forms, no jargon — just your vision and your customers.</p>
        </div>

        <div class="dash-line hide-sm"></div>

        <div style="flex:1;max-width:210px;text-align:center;padding:0 12px;">
          <div style="display:flex;justify-content:center;margin-bottom:20px;">
            <div class="step-dot">2</div>
          </div>
          <h3 class="editorial" style="font-size:20px;color:#1C1917;margin-bottom:10px;">AI researches your market</h3>
          <p style="font-size:13px;color:#A8A09A;line-height:1.65;">We analyse your competitors, market gaps, and the fastest path to profitable growth.</p>
        </div>

        <div class="dash-line hide-sm"></div>

        <div style="flex:1;max-width:210px;text-align:center;padding:0 12px;">
          <div style="display:flex;justify-content:center;margin-bottom:20px;">
            <div class="step-dot" style="background:#FDF2EE;border-color:#F0CEBE;color:#BF6744;">3</div>
          </div>
          <h3 class="editorial" style="font-size:20px;color:#1C1917;margin-bottom:10px;">Unlock your roadmap</h3>
          <p style="font-size:13px;color:#A8A09A;line-height:1.65;">Your personalised 6-month plan — channels, budgets, CAC targets, and quick wins — for just $4.99.</p>
        </div>

        <div class="dash-line hide-sm"></div>

        <div style="flex:1;max-width:210px;text-align:center;padding:0 12px;">
          <div style="display:flex;justify-content:center;margin-bottom:20px;">
            <div class="step-dot" style="background:#1C1917;border-color:#1C1917;color:#FAF7F4;">4</div>
          </div>
          <h3 class="editorial" style="font-size:20px;color:#1C1917;margin-bottom:10px;">Revenue in 24 hours</h3>
          <p style="font-size:13px;color:#A8A09A;line-height:1.65;">Your AI agent launches campaigns, drives traffic, and generates your first revenue — all within 24 hours of activation.</p>
        </div>

      </div>

      <div style="text-align:center;">
        <button onclick="startJourney()" class="btn-rust">
          <i class="fas fa-bolt" style="font-size:13px;"></i>
          Start your analysis free →
        </button>
      </div>

    </div>
  </section>


  <!-- ══════════════════════════════
       WHAT AUXORA HANDLES
  ══════════════════════════════ -->
  <section class="section" style="background:#FFFFFF;">
    <div style="max-width:1200px;margin:0 auto;">

      <div style="max-width:560px;margin:0 auto 72px;text-align:center;">
        <p class="eyebrow" style="margin-bottom:16px;">The full stack</p>
        <h2 class="editorial" style="font-size:clamp(40px,4.5vw,62px);color:#1C1917;">
          Your entire growth engine,<br/>
          <em style="color:#BF6744;">handled.</em>
        </h2>
      </div>

      <div class="agent-cols" style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;max-width:960px;margin:0 auto;">

        <div class="card" style="padding:28px;">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
            <div class="icon-chip" style="background:#E8F0FE;">
              <i class="fab fa-facebook" style="color:#1877F2;font-size:20px;"></i>
            </div>
            <div>
              <div style="font-weight:600;font-size:15px;color:#1C1917;">Meta Ads</div>
              <div><span class="badge badge-sage" style="font-size:10px;padding:3px 8px;margin-top:3px;">Auto-managed</span></div>
            </div>
          </div>
          <p style="font-size:13px;color:#A8A09A;line-height:1.7;">Campaign structure, audience testing, creative rotation, and bid optimisation — running without lifting a finger.</p>
        </div>

        <div class="card" style="padding:28px;">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
            <div class="icon-chip" style="background:#FEF3E8;">
              <i class="fab fa-google" style="color:#EA4335;font-size:20px;"></i>
            </div>
            <div>
              <div style="font-weight:600;font-size:15px;color:#1C1917;">Google Ads</div>
              <div><span class="badge badge-sage" style="font-size:10px;padding:3px 8px;margin-top:3px;">Auto-managed</span></div>
            </div>
          </div>
          <p style="font-size:13px;color:#A8A09A;line-height:1.7;">Search, Shopping, and Performance Max — built around your catalogue and CPA targets.</p>
        </div>

        <div class="card" style="padding:28px;">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
            <div class="icon-chip" style="background:#FDF2EE;">
              <i class="fas fa-envelope" style="color:#BF6744;font-size:18px;"></i>
            </div>
            <div>
              <div style="font-weight:600;font-size:15px;color:#1C1917;">Email & SMS</div>
              <div><span class="badge badge-sage" style="font-size:10px;padding:3px 8px;margin-top:3px;">Auto-managed</span></div>
            </div>
          </div>
          <p style="font-size:13px;color:#A8A09A;line-height:1.7;">Lifecycle flows, winback sequences, and broadcasts — all written and scheduled by the agent.</p>
        </div>

        <div class="card" style="padding:28px;">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
            <div class="icon-chip" style="background:#EEF3EC;">
              <i class="fas fa-search" style="color:#4A6741;font-size:17px;"></i>
            </div>
            <div>
              <div style="font-weight:600;font-size:15px;color:#1C1917;">SEO & Content</div>
              <div><span class="badge badge-canvas" style="font-size:10px;padding:3px 8px;margin-top:3px;">Building</span></div>
            </div>
          </div>
          <p style="font-size:13px;color:#A8A09A;line-height:1.7;">Keyword strategy, blog content, and link-building to build your long-term organic moat.</p>
        </div>

        <div class="card" style="padding:28px;">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
            <div class="icon-chip" style="background:#FCE8F3;">
              <i class="fab fa-instagram" style="color:#E1306C;font-size:20px;"></i>
            </div>
            <div>
              <div style="font-weight:600;font-size:15px;color:#1C1917;">Influencers</div>
              <div><span class="badge" style="font-size:10px;padding:3px 8px;margin-top:3px;">Coming soon</span></div>
            </div>
          </div>
          <p style="font-size:13px;color:#A8A09A;line-height:1.7;">AI-matched micro-influencer outreach, performance tracking, and UGC content briefs.</p>
        </div>

        <!-- CTA card -->
        <div style="background:linear-gradient(145deg,#1C1917 0%,#3D3530 100%);border-radius:24px;padding:28px;display:flex;flex-direction:column;justify-content:space-between;min-height:180px;">
          <div>
            <div class="editorial" style="font-size:26px;color:#FAF7F4;line-height:1.2;margin-bottom:10px;">All channels.<br/>One agent.</div>
            <p style="font-size:13px;color:#A8A09A;line-height:1.6;">Everything working in sync, compounding over time.</p>
          </div>
          <button onclick="startJourney()" class="btn-rust" style="margin-top:20px;justify-content:center;font-size:14px;">
            Activate →
          </button>
        </div>

      </div>
    </div>
  </section>

  <!-- ══════════════════════════════
       PRICING
  ══════════════════════════════ -->
  <section id="pricing" class="section" style="background:#FFFFFF;">
    <div style="max-width:1200px;margin:0 auto;">

      <div style="max-width:560px;margin:0 auto 72px;text-align:center;">
        <p class="eyebrow" style="margin-bottom:16px;">Pricing</p>
        <h2 class="editorial" style="font-size:clamp(40px,4.5vw,62px);color:#1C1917;">
          Start for $4.99.<br/>
          <em style="color:#BF6744;">Scale with the agent.</em>
        </h2>
        <p style="font-size:16px;color:#7A6E65;margin-top:16px;line-height:1.7;">No surprise fees. Cancel anytime. Your first report pays for itself.</p>
      </div>

      <div class="price-cols" style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;max-width:960px;margin:0 auto;">

        <!-- Starter -->
        <div class="card" style="padding:36px;">
          <p class="eyebrow" style="margin-bottom:16px;">Starter</p>
          <div class="editorial" style="font-size:52px;color:#1C1917;margin-bottom:4px;line-height:1;">$4.99</div>
          <div style="font-size:13px;color:#A8A09A;margin-bottom:32px;font-weight:500;">one-time · first strategy report</div>
          <ul style="list-style:none;display:flex;flex-direction:column;gap:12px;margin-bottom:32px;">
            <li style="font-size:14px;color:#7A6E65;display:flex;gap:10px;align-items:flex-start;line-height:1.5;">
              <i class="fas fa-check" style="color:#6E8B5E;font-size:12px;margin-top:3px;flex-shrink:0;"></i>
              Full competitor analysis
            </li>
            <li style="font-size:14px;color:#7A6E65;display:flex;gap:10px;align-items:flex-start;line-height:1.5;">
              <i class="fas fa-check" style="color:#6E8B5E;font-size:12px;margin-top:3px;flex-shrink:0;"></i>
              6-month GTM roadmap
            </li>
            <li style="font-size:14px;color:#7A6E65;display:flex;gap:10px;align-items:flex-start;line-height:1.5;">
              <i class="fas fa-check" style="color:#6E8B5E;font-size:12px;margin-top:3px;flex-shrink:0;"></i>
              Channel + budget plan
            </li>
            <li style="font-size:14px;color:#7A6E65;display:flex;gap:10px;align-items:flex-start;line-height:1.5;">
              <i class="fas fa-check" style="color:#6E8B5E;font-size:12px;margin-top:3px;flex-shrink:0;"></i>
              CAC/LTV projections
            </li>
            <li style="font-size:14px;color:#7A6E65;display:flex;gap:10px;align-items:flex-start;line-height:1.5;">
              <i class="fas fa-check" style="color:#6E8B5E;font-size:12px;margin-top:3px;flex-shrink:0;"></i>
              PDF + email delivery
            </li>
          </ul>
          <button onclick="startJourney()" class="btn-outline" style="width:100%;justify-content:center;font-size:14px;">
            Get my strategy
          </button>
        </div>

        <!-- Growth (highlighted) -->
        <div class="price-popular" style="padding:36px;">
          <div style="position:absolute;top:-1px;left:50%;transform:translateX(-50%);background:#BF6744;color:#FAF7F4;font-size:11px;font-weight:600;letter-spacing:0.12em;padding:5px 16px;border-radius:0 0 12px 12px;white-space:nowrap;">MOST POPULAR</div>
          <p class="eyebrow" style="color:#A8A09A;margin-top:16px;margin-bottom:16px;">Growth</p>
          <div class="editorial" style="font-size:52px;color:#FAF7F4;margin-bottom:4px;line-height:1;">$450</div>
          <div style="font-size:13px;color:#A8A09A;margin-bottom:32px;font-weight:500;">per month · vs $5K–20K agency · pay for results</div>
          <ul style="list-style:none;display:flex;flex-direction:column;gap:12px;margin-bottom:32px;">
            <li style="font-size:14px;color:#A8A09A;display:flex;gap:10px;align-items:flex-start;line-height:1.5;">
              <i class="fas fa-check" style="color:#BF6744;font-size:12px;margin-top:3px;flex-shrink:0;"></i>
              Everything in Starter
            </li>
            <li style="font-size:14px;color:#A8A09A;display:flex;gap:10px;align-items:flex-start;line-height:1.5;">
              <i class="fas fa-check" style="color:#BF6744;font-size:12px;margin-top:3px;flex-shrink:0;"></i>
              Meta + Google auto-management
            </li>
            <li style="font-size:14px;color:#A8A09A;display:flex;gap:10px;align-items:flex-start;line-height:1.5;">
              <i class="fas fa-check" style="color:#BF6744;font-size:12px;margin-top:3px;flex-shrink:0;"></i>
              Weekly AI optimisation
            </li>
            <li style="font-size:14px;color:#A8A09A;display:flex;gap:10px;align-items:flex-start;line-height:1.5;">
              <i class="fas fa-check" style="color:#BF6744;font-size:12px;margin-top:3px;flex-shrink:0;"></i>
              Email + SMS automation
            </li>
            <li style="font-size:14px;color:#A8A09A;display:flex;gap:10px;align-items:flex-start;line-height:1.5;">
              <i class="fas fa-check" style="color:#BF6744;font-size:12px;margin-top:3px;flex-shrink:0;"></i>
              Live performance dashboard
            </li>
          </ul>
          <button onclick="startJourney()" class="btn-rust" style="width:100%;justify-content:center;font-size:14px;">
            Activate growth →
          </button>
        </div>

        <!-- Scale -->
        <div class="card" style="padding:36px;">
          <p class="eyebrow" style="margin-bottom:16px;">Scale</p>
          <div class="editorial" style="font-size:52px;color:#1C1917;margin-bottom:4px;line-height:1;">$1,200</div>
          <div style="font-size:13px;color:#A8A09A;margin-bottom:32px;font-weight:500;">per month · white-glove execution</div>
          <ul style="list-style:none;display:flex;flex-direction:column;gap:12px;margin-bottom:32px;">
            <li style="font-size:14px;color:#7A6E65;display:flex;gap:10px;align-items:flex-start;line-height:1.5;">
              <i class="fas fa-check" style="color:#6E8B5E;font-size:12px;margin-top:3px;flex-shrink:0;"></i>
              Everything in Growth
            </li>
            <li style="font-size:14px;color:#7A6E65;display:flex;gap:10px;align-items:flex-start;line-height:1.5;">
              <i class="fas fa-check" style="color:#6E8B5E;font-size:12px;margin-top:3px;flex-shrink:0;"></i>
              Influencer outreach
            </li>
            <li style="font-size:14px;color:#7A6E65;display:flex;gap:10px;align-items:flex-start;line-height:1.5;">
              <i class="fas fa-check" style="color:#6E8B5E;font-size:12px;margin-top:3px;flex-shrink:0;"></i>
              SEO + content engine
            </li>
            <li style="font-size:14px;color:#7A6E65;display:flex;gap:10px;align-items:flex-start;line-height:1.5;">
              <i class="fas fa-check" style="color:#6E8B5E;font-size:12px;margin-top:3px;flex-shrink:0;"></i>
              Dedicated AI strategist
            </li>
            <li style="font-size:14px;color:#7A6E65;display:flex;gap:10px;align-items:flex-start;line-height:1.5;">
              <i class="fas fa-check" style="color:#6E8B5E;font-size:12px;margin-top:3px;flex-shrink:0;"></i>
              White-glove onboarding
            </li>
          </ul>
          <button onclick="startJourney()" class="btn-outline" style="width:100%;justify-content:center;font-size:14px;">
            Talk to us
          </button>
        </div>

      </div>

      <!-- Trust row under pricing -->
      <div style="display:flex;justify-content:center;align-items:center;gap:32px;flex-wrap:wrap;margin-top:44px;padding-top:40px;border-top:1px solid #EDE4D9;">
        <span style="font-size:13px;color:#A8A09A;display:flex;align-items:center;gap:8px;">
          <i class="fas fa-lock" style="color:#C4BAB0;"></i> Secured by Stripe
        </span>
        <span style="font-size:13px;color:#A8A09A;display:flex;align-items:center;gap:8px;">
          <i class="fas fa-undo-alt" style="color:#C4BAB0;"></i> Cancel anytime
        </span>
        <span style="font-size:13px;color:#A8A09A;display:flex;align-items:center;gap:8px;">
          <i class="fas fa-shield-alt" style="color:#C4BAB0;"></i> Privacy first
        </span>
        <span style="font-size:13px;color:#A8A09A;display:flex;align-items:center;gap:8px;">
          <i class="fas fa-headset" style="color:#C4BAB0;"></i> Founder support
        </span>
      </div>

    </div>
  </section>


  <!-- ══════════════════════════════
       FAQ
  ══════════════════════════════ -->
  <section class="section" style="background:#FAF7F4;">
    <div style="max-width:720px;margin:0 auto;">

      <div style="text-align:center;margin-bottom:60px;">
        <p class="eyebrow" style="margin-bottom:16px;">Questions</p>
        <h2 class="editorial" style="font-size:clamp(36px,4.5vw,56px);color:#1C1917;">Good to know</h2>
      </div>

      <div style="display:flex;flex-direction:column;gap:6px;">

        <details style="border:1px solid #EDE4D9;border-radius:16px;overflow:hidden;background:white;">
          <summary style="padding:22px 26px;display:flex;justify-content:space-between;align-items:center;font-size:15px;font-weight:600;color:#1C1917;font-family:'Plus Jakarta Sans',sans-serif;">
            What makes Auxora different from a regular marketing agency?
            <i class="fas fa-plus faq-plus" style="color:#A8A09A;font-size:13px;flex-shrink:0;margin-left:16px;"></i>
          </summary>
          <div style="padding:0 26px 22px;font-size:14px;color:#7A6E65;line-height:1.75;border-top:1px solid #EDE4D9;">
            Traditional agencies charge $5K–$20K/month with no performance guarantee — you pay whether results come or not. Auxora starts at $4.99, gets your brand earning within 24 hours, and charges at 1/10th the cost of an agency. The strategy is built to scale all the way to $100M ARR, not just your first $100K.
          </div>
        </details>

        <details style="border:1px solid #EDE4D9;border-radius:16px;overflow:hidden;background:white;">
          <summary style="padding:22px 26px;display:flex;justify-content:space-between;align-items:center;font-size:15px;font-weight:600;color:#1C1917;font-family:'Plus Jakarta Sans',sans-serif;">
            How quickly can I start seeing revenue?
            <i class="fas fa-plus faq-plus" style="color:#A8A09A;font-size:13px;flex-shrink:0;margin-left:16px;"></i>
          </summary>
          <div style="padding:0 26px 22px;font-size:14px;color:#7A6E65;line-height:1.75;border-top:1px solid #EDE4D9;">
            Brands on the Growth plan typically see their first attributed revenue within 24 hours of activation. Your AI agent launches campaigns immediately, targets your best-fit audiences, and starts optimising from hour one.
          </div>
        </details>

        <details style="border:1px solid #EDE4D9;border-radius:16px;overflow:hidden;background:white;">
          <summary style="padding:22px 26px;display:flex;justify-content:space-between;align-items:center;font-size:15px;font-weight:600;color:#1C1917;font-family:'Plus Jakarta Sans',sans-serif;">
            How quickly will I receive my strategy report?
            <i class="fas fa-plus faq-plus" style="color:#A8A09A;font-size:13px;flex-shrink:0;margin-left:16px;"></i>
          </summary>
          <div style="padding:0 26px 22px;font-size:14px;color:#7A6E65;line-height:1.75;border-top:1px solid #EDE4D9;">
            After your 10-minute brand interview and $4.99 payment, your report is generated in 2–3 minutes. You'll see it build live on screen, and we'll email you a PDF copy the moment it's done.
          </div>
        </details>

        <details style="border:1px solid #EDE4D9;border-radius:16px;overflow:hidden;background:white;">
          <summary style="padding:22px 26px;display:flex;justify-content:space-between;align-items:center;font-size:15px;font-weight:600;color:#1C1917;font-family:'Plus Jakarta Sans',sans-serif;">
            Is this only for established brands, or can I use it to launch?
            <i class="fas fa-plus faq-plus" style="color:#A8A09A;font-size:13px;flex-shrink:0;margin-left:16px;"></i>
          </summary>
          <div style="padding:0 26px 22px;font-size:14px;color:#7A6E65;line-height:1.75;border-top:1px solid #EDE4D9;">
            Both. If you're pre-launch, Auxora helps you validate positioning, identify your first channel, and build a go-to-market plan. If you're already selling, we optimise what's working and fix what isn't.
          </div>
        </details>

        <details style="border:1px solid #EDE4D9;border-radius:16px;overflow:hidden;background:white;">
          <summary style="padding:22px 26px;display:flex;justify-content:space-between;align-items:center;font-size:15px;font-weight:600;color:#1C1917;font-family:'Plus Jakarta Sans',sans-serif;">
            What types of D2C brands does Auxora work with?
            <i class="fas fa-plus faq-plus" style="color:#A8A09A;font-size:13px;flex-shrink:0;margin-left:16px;"></i>
          </summary>
          <div style="padding:0 26px 22px;font-size:14px;color:#7A6E65;line-height:1.75;border-top:1px solid #EDE4D9;">
            Auxora is built for product-first D2C brands — wellness, beauty, food & beverage, apparel, home goods, pet care, supplements, and more. If you sell physical products direct to consumers, we can help.
          </div>
        </details>

      </div>
    </div>
  </section>


  <!-- ══════════════════════════════
       FINAL CTA
  ══════════════════════════════ -->
  <section class="section-sm" style="background:#F5EFE8;border-top:1px solid #EDE4D9;">
    <div style="max-width:680px;margin:0 auto;text-align:center;">

      <p class="eyebrow" style="margin-bottom:20px;">Start today</p>
      <h2 class="editorial" style="font-size:clamp(44px,6vw,76px);color:#1C1917;margin-bottom:18px;line-height:1.05;">
        Revenue in 24 hours.<br/>
        <em style="color:#BF6744;">Growth to $100M.</em>
      </h2>
      <p style="font-size:17px;color:#7A6E65;line-height:1.75;margin-bottom:44px;max-width:480px;margin-left:auto;margin-right:auto;">
        Join 200+ D2C founders who went live in 24 hours and are scaling to $100M — at 1/10th agency cost.
      </p>

      <!-- CTA pill input -->
      <form id="ctaForm" style="display:flex;gap:8px;max-width:500px;margin:0 auto 20px;background:white;border:1.5px solid #D6CCBF;border-radius:100px;padding:6px 6px 6px 22px;box-shadow:0 4px 24px rgba(28,25,23,0.07);">
        <input
          type="text"
          id="ctaInput"
          placeholder="yourbrand.com"
          style="background:transparent;border:none;outline:none;font-family:'Plus Jakarta Sans',sans-serif;font-size:15px;color:#1C1917;flex:1;min-width:0;"
        />
        <button type="submit" class="btn-rust" style="padding:13px 28px;font-size:14px;flex-shrink:0;">
          Analyse my brand →
        </button>
      </form>

      <div style="display:flex;justify-content:center;gap:20px;flex-wrap:wrap;">
        <span style="font-size:13px;color:#A8A09A;display:flex;align-items:center;gap:6px;">
          <i class="fas fa-lock" style="color:#C4BAB0;font-size:11px;"></i> Secure via Stripe
        </span>
        <span style="font-size:13px;color:#D6CCBF;">·</span>
        <span style="font-size:13px;color:#A8A09A;">No subscription to start</span>
        <span style="font-size:13px;color:#D6CCBF;">·</span>
        <span style="font-size:13px;color:#A8A09A;">Cancel anytime</span>
      </div>

    </div>
  </section>


  <!-- ══════════════════════════════
       FOOTER
  ══════════════════════════════ -->
  <footer style="padding:40px 24px;background:#1C1917;border-top:1px solid #3D3530;">
    <div style="max-width:1200px;margin:0 auto;">
      <div class="footer-cols" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:20px;margin-bottom:32px;">

        <!-- Brand -->
        <div style="display:flex;align-items:center;gap:10px;">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="10" fill="#FAF7F4"/>
            <path d="M10 23L16 9l6 14" stroke="#1C1917" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12.5 18h7" stroke="#BF6744" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span style="font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:16px;color:#FAF7F4;letter-spacing:-0.04em;line-height:1;">Auxora</span>
        </div>

        <!-- Links -->
        <div style="display:flex;gap:28px;flex-wrap:wrap;">
          <a href="/login" style="color:#7A6E65;font-size:13px;text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='#A8A09A'" onmouseout="this.style.color='#7A6E65'">Sign in</a>
          <a href="/register" style="color:#7A6E65;font-size:13px;text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='#A8A09A'" onmouseout="this.style.color='#7A6E65'">Register</a>
          <a href="#pricing" style="color:#7A6E65;font-size:13px;text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='#A8A09A'" onmouseout="this.style.color='#7A6E65'">Pricing</a>
        </div>
      </div>

      <div class="rule" style="background:linear-gradient(to right,transparent,#3D3530,transparent);margin-bottom:20px;"></div>

      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
        <span style="font-size:12px;color:#5A5040;">© 2025 Auxora.ai — AI Growth Partner for D2C Brands</span>
        <span style="font-size:12px;color:#5A5040;">Built for founders who care about craft.</span>
      </div>
    </div>
  </footer>


  <!-- ══════════════════════════════
       VIDEO MODAL
  ══════════════════════════════ -->
  <div id="videoModal" style="display:none;position:fixed;inset:0;background:rgba(28,25,23,0.88);z-index:1000;align-items:center;justify-content:center;padding:24px;backdrop-filter:blur(12px);">
    <div style="position:relative;width:100%;max-width:880px;">
      <button onclick="closeVideoModal()" style="position:absolute;top:-44px;right:0;background:none;border:none;color:#7A6E65;font-size:24px;cursor:pointer;transition:color 0.2s;" onmouseover="this.style.color='#FAF7F4'" onmouseout="this.style.color='#7A6E65'">
        <i class="fas fa-times"></i>
      </button>
      <div class="card" style="overflow:hidden;padding:0;">
        <div style="aspect-ratio:16/9;">
          <iframe id="videoPlayer" width="100%" height="100%" src="" frameborder="0" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen></iframe>
        </div>
        <div style="padding:20px 24px;display:flex;justify-content:space-between;align-items:center;background:white;">
          <div>
            <div id="videoTitle" class="editorial" style="font-size:20px;color:#1C1917;"></div>
            <div id="videoDesc" style="font-size:13px;color:#A8A09A;margin-top:4px;"></div>
          </div>
          <button onclick="closeVideoModal()" class="btn-outline" style="padding:10px 20px;font-size:13px;flex-shrink:0;">Close</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Pulse animation for badge dot -->
  <style>
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50%       { opacity: 0.6; transform: scale(0.85); }
    }
  </style>

  <script>
    // ── Video data ──
    const videos = [
      { id: 'nw1XYryhdIU', title: 'Yamabushi Farms', desc: 'D2C Brand · 10× Revenue in 2 Months · 3× ROAS' }
    ];

    function openVideoModal(i) {
      const v = videos[i];
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
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeVideoModal(); });

    // ── Website form handler ──
    function handleWebsiteSubmit(inputId) {
      let w = (document.getElementById(inputId).value || '').trim();
      if (!w) { document.getElementById(inputId).focus(); return; }
      if (!w.startsWith('http://') && !w.startsWith('https://')) w = 'https://' + w;
      const user = typeof Storage !== 'undefined' ? Storage.getUser() : null;
      const session = typeof Storage !== 'undefined' ? Storage.getSession() : null;
      if (!user || !session) {
        window.location.href = '/login?returnUrl=' + encodeURIComponent('/report-preview?website=' + encodeURIComponent(w));
        return;
      }
      window.location.href = '/report-preview?website=' + encodeURIComponent(w);
    }

    document.getElementById('heroForm').addEventListener('submit', function(e) {
      e.preventDefault(); handleWebsiteSubmit('heroInput');
    });
    document.getElementById('ctaForm').addEventListener('submit', function(e) {
      e.preventDefault(); handleWebsiteSubmit('ctaInput');
    });

    // ── Start journey (no URL input) ──
    function startJourney() {
      const u = localStorage.getItem('auxora_user');
      window.location.href = u ? '/dashboard' : '/static/login.html';
    }

    // ── Smooth scroll for anchor links ──
    document.querySelectorAll('a[href^="#"]').forEach(function(a) {
      a.addEventListener('click', function(e) {
        e.preventDefault();
        const t = document.querySelector(a.getAttribute('href'));
        if (t) t.scrollIntoView({ behavior: 'smooth' });
      });
    });
  </script>

  <script src="/static/modal-utils.js"></script>
  <script src="/static/app.js"></script>
</body>
</html>
`;
