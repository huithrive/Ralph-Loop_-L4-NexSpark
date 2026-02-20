// Auxora.ai — "Vibe Business" Landing Page
// Aesthetic: "Infrastructure with a Soul"
// Dark premium backbone · Warm living energy · Autonomous revenue engine

export const REVISED_LANDING_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Auxora — The Vibe Business OS</title>
    <meta name="description" content="You build the product. Auxora builds the profit. The world's first autonomous revenue agent for D2C founders.">
    <meta property="og:title" content="Auxora — The Vibe Business OS">
    <meta property="og:description" content="Stop grinding. Enter flow. Auxora autonomously runs your entire growth stack.">

    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">

    <!-- Shared Modules -->
    <script src="/static/shared/storage.js"></script>

    <script>
      tailwind.config = {
        theme: {
          extend: {
            fontFamily: {
              display: ['Syne', 'sans-serif'],
              body:    ['Inter', 'sans-serif'],
              mono:    ['Space Mono', 'monospace'],
            },
            colors: {
              ax: {
                // Core dark
                void:    '#08090C',
                deep:    '#0E1018',
                surface: '#14161F',
                raised:  '#1C1F2E',
                border:  '#252840',
                // Primary energy: electric violet → magenta
                volt:    '#7C3AED',
                glow:    '#A855F7',
                pulse:   '#D946EF',
                // Warm accent: amber
                amber:   '#F59E0B',
                gold:    '#FBBF24',
                // Signal green
                signal:  '#10B981',
                // Text
                text:    '#F0F2FF',
                muted:   '#8B8FA8',
                faint:   '#4A4D66',
              }
            }
          }
        }
      }
    </script>

    <style>
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      html { scroll-behavior: smooth; }

      body {
        background-color: #08090C;
        color: #F0F2FF;
        font-family: 'Inter', sans-serif;
        overflow-x: hidden;
        -webkit-font-smoothing: antialiased;
      }

      /* ─── Scrollbar ─── */
      ::-webkit-scrollbar { width: 6px; }
      ::-webkit-scrollbar-track { background: #0E1018; }
      ::-webkit-scrollbar-thumb { background: #7C3AED; border-radius: 3px; }

      /* ─── Noise texture overlay ─── */
      body::before {
        content: '';
        position: fixed;
        inset: 0;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
        pointer-events: none;
        z-index: 1;
        opacity: 0.4;
      }

      /* ─── Grid lines background ─── */
      .grid-bg {
        background-image:
          linear-gradient(rgba(124, 58, 237, 0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(124, 58, 237, 0.04) 1px, transparent 1px);
        background-size: 60px 60px;
      }

      /* ─── Glow effects ─── */
      .glow-violet {
        box-shadow: 0 0 40px rgba(124, 58, 237, 0.25), 0 0 80px rgba(168, 85, 247, 0.1);
      }
      .glow-amber {
        box-shadow: 0 0 30px rgba(245, 158, 11, 0.3), 0 0 60px rgba(251, 191, 36, 0.1);
      }
      .text-glow-violet {
        text-shadow: 0 0 40px rgba(168, 85, 247, 0.6);
      }
      .text-glow-amber {
        text-shadow: 0 0 30px rgba(245, 158, 11, 0.5);
      }

      /* ─── Gradient text ─── */
      .grad-volt {
        background: linear-gradient(135deg, #A855F7 0%, #D946EF 50%, #F59E0B 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      .grad-warm {
        background: linear-gradient(135deg, #F59E0B 0%, #F97316 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      .grad-cool {
        background: linear-gradient(135deg, #7C3AED 0%, #A855F7 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      /* ─── CTA Buttons ─── */
      .btn-primary {
        background: linear-gradient(135deg, #7C3AED, #D946EF);
        color: white;
        font-family: 'Syne', sans-serif;
        font-weight: 700;
        letter-spacing: 0.03em;
        border-radius: 12px;
        transition: all 0.25s ease;
        position: relative;
        overflow: hidden;
      }
      .btn-primary::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, transparent, rgba(255,255,255,0.08));
        opacity: 0;
        transition: opacity 0.2s;
      }
      .btn-primary:hover::after { opacity: 1; }
      .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 30px rgba(124, 58, 237, 0.5), 0 0 0 1px rgba(168, 85, 247, 0.3);
      }

      .btn-ghost {
        background: transparent;
        color: #F0F2FF;
        font-family: 'Syne', sans-serif;
        font-weight: 600;
        letter-spacing: 0.03em;
        border: 1px solid rgba(124, 58, 237, 0.4);
        border-radius: 12px;
        transition: all 0.25s ease;
      }
      .btn-ghost:hover {
        border-color: #A855F7;
        background: rgba(124, 58, 237, 0.1);
        box-shadow: 0 0 20px rgba(124, 58, 237, 0.2);
      }

      /* ─── Card styles ─── */
      .card {
        background: #14161F;
        border: 1px solid #252840;
        border-radius: 20px;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }
      .card::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(124, 58, 237, 0.03), transparent);
        pointer-events: none;
      }
      .card:hover {
        border-color: rgba(168, 85, 247, 0.3);
        transform: translateY(-3px);
        box-shadow: 0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(124, 58, 237, 0.15);
      }

      /* ─── Pill badge ─── */
      .pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 14px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 600;
        font-family: 'Space Mono', monospace;
        letter-spacing: 0.05em;
      }
      .pill-volt {
        background: rgba(124, 58, 237, 0.15);
        border: 1px solid rgba(168, 85, 247, 0.25);
        color: #A855F7;
      }
      .pill-amber {
        background: rgba(245, 158, 11, 0.12);
        border: 1px solid rgba(245, 158, 11, 0.25);
        color: #F59E0B;
      }
      .pill-green {
        background: rgba(16, 185, 129, 0.12);
        border: 1px solid rgba(16, 185, 129, 0.25);
        color: #10B981;
      }

      /* ─── Divider ─── */
      .gradient-divider {
        height: 1px;
        background: linear-gradient(to right, transparent, rgba(124, 58, 237, 0.4), rgba(217, 70, 239, 0.4), transparent);
      }

      /* ─── Stat number ─── */
      .stat-num {
        font-family: 'Syne', sans-serif;
        font-weight: 800;
        font-size: clamp(2rem, 4vw, 3.5rem);
        line-height: 1;
        background: linear-gradient(135deg, #A855F7, #D946EF);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      /* ─── Hero orbit decoration ─── */
      @keyframes orbit {
        from { transform: rotate(0deg) translateX(120px) rotate(0deg); }
        to   { transform: rotate(360deg) translateX(120px) rotate(-360deg); }
      }
      @keyframes orbit2 {
        from { transform: rotate(120deg) translateX(180px) rotate(-120deg); }
        to   { transform: rotate(480deg) translateX(180px) rotate(-480deg); }
      }
      .orbit-dot {
        width: 8px; height: 8px;
        border-radius: 50%;
        background: #A855F7;
        box-shadow: 0 0 12px rgba(168, 85, 247, 0.8);
        position: absolute;
        top: 50%; left: 50%;
        margin: -4px 0 0 -4px;
        animation: orbit 8s linear infinite;
      }
      .orbit-dot-2 {
        width: 5px; height: 5px;
        margin: -2.5px 0 0 -2.5px;
        background: #F59E0B;
        box-shadow: 0 0 10px rgba(245, 158, 11, 0.8);
        animation: orbit2 12s linear infinite;
      }

      /* ─── Terminal window ─── */
      .terminal {
        background: #0A0C14;
        border: 1px solid #252840;
        border-radius: 16px;
        font-family: 'Space Mono', monospace;
        font-size: 13px;
      }
      .terminal-bar {
        padding: 12px 16px;
        border-bottom: 1px solid #252840;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .terminal-dot {
        width: 10px; height: 10px;
        border-radius: 50%;
      }

      /* ─── Shimmer animation ─── */
      @keyframes shimmer {
        0%   { background-position: -200% center; }
        100% { background-position: 200% center; }
      }
      .shimmer-text {
        background: linear-gradient(90deg, #A855F7 0%, #D946EF 25%, #F59E0B 50%, #D946EF 75%, #A855F7 100%);
        background-size: 200% auto;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: shimmer 4s linear infinite;
      }

      /* ─── Ticker ─── */
      @keyframes ticker {
        0%   { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      .ticker-track {
        display: flex;
        animation: ticker 30s linear infinite;
        width: max-content;
      }

      /* ─── Pulse dot ─── */
      @keyframes pulseDot {
        0%, 100% { opacity: 1; transform: scale(1); }
        50%       { opacity: 0.4; transform: scale(0.8); }
      }
      .pulse-dot {
        width: 8px; height: 8px;
        border-radius: 50%;
        background: #10B981;
        box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
        animation: pulseDot 2s ease-in-out infinite;
        display: inline-block;
      }

      /* ─── Fade in ─── */
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(24px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .fade-up { animation: fadeUp 0.7s ease forwards; }
      .delay-1 { animation-delay: 0.1s; opacity: 0; }
      .delay-2 { animation-delay: 0.2s; opacity: 0; }
      .delay-3 { animation-delay: 0.35s; opacity: 0; }
      .delay-4 { animation-delay: 0.5s; opacity: 0; }

      /* ─── Section glow bg ─── */
      .section-glow {
        position: relative;
      }
      .section-glow::before {
        content: '';
        position: absolute;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        width: 600px; height: 400px;
        background: radial-gradient(ellipse, rgba(124, 58, 237, 0.08) 0%, transparent 70%);
        pointer-events: none;
        z-index: 0;
      }

      /* ─── Input style ─── */
      .ax-input {
        background: #0E1018;
        border: 1px solid #252840;
        border-radius: 12px;
        color: #F0F2FF;
        font-family: 'Inter', sans-serif;
        font-size: 15px;
        padding: 14px 18px;
        transition: all 0.2s;
        outline: none;
        width: 100%;
      }
      .ax-input::placeholder { color: #4A4D66; }
      .ax-input:focus {
        border-color: #7C3AED;
        box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.15);
      }

      /* ─── Flow stage indicator ─── */
      .flow-stage {
        position: relative;
      }
      .flow-stage::after {
        content: '';
        position: absolute;
        top: 28px; left: calc(100% + 0px);
        width: 100%;
        height: 1px;
        background: linear-gradient(to right, rgba(124, 58, 237, 0.5), rgba(124, 58, 237, 0.1));
      }
      .flow-stage:last-child::after { display: none; }

      /* ─── Agent card live border ─── */
      @keyframes borderPulse {
        0%, 100% { border-color: rgba(124, 58, 237, 0.3); }
        50%       { border-color: rgba(217, 70, 239, 0.6); }
      }
      .agent-card {
        animation: borderPulse 3s ease-in-out infinite;
      }

      /* ─── Toggle comparison ─── */
      .grind-flow {
        position: relative;
      }
    </style>
</head>
<body class="grid-bg">
  <div style="position:relative; z-index:2;">

    <!-- ══════════════════════════════════════════════
         NAVBAR
    ══════════════════════════════════════════════ -->
    <nav style="position:fixed;top:0;left:0;width:100%;z-index:100;border-bottom:1px solid rgba(37,40,64,0.8);backdrop-filter:blur(16px);background:rgba(8,9,12,0.85);">
      <div style="max-width:1280px;margin:0 auto;padding:0 24px;height:64px;display:flex;align-items:center;justify-content:space-between;">
        <!-- Logo -->
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#7C3AED,#D946EF);display:flex;align-items:center;justify-content:center;box-shadow:0 0 20px rgba(124,58,237,0.4);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <span style="font-family:'Syne',sans-serif;font-weight:800;font-size:20px;letter-spacing:-0.02em;color:#F0F2FF;">Auxora</span>
          <span class="pill pill-volt" style="font-size:10px;padding:3px 10px;">BETA</span>
        </div>

        <!-- Nav links -->
        <div style="display:flex;align-items:center;gap:28px;">
          <a href="#how-it-works" style="color:#8B8FA8;font-size:14px;font-weight:500;text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='#F0F2FF'" onmouseout="this.style.color='#8B8FA8'">How It Works</a>
          <a href="#results" style="color:#8B8FA8;font-size:14px;font-weight:500;text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='#F0F2FF'" onmouseout="this.style.color='#8B8FA8'" class="hidden sm:block">Results</a>
          <a href="#pricing" style="color:#8B8FA8;font-size:14px;font-weight:500;text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='#F0F2FF'" onmouseout="this.style.color='#8B8FA8'" class="hidden sm:block">Pricing</a>
          <a href="/login" style="color:#8B8FA8;font-size:14px;font-weight:500;text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='#F0F2FF'" onmouseout="this.style.color='#8B8FA8'">Sign In</a>
          <button onclick="startJourney()" class="btn-primary" style="padding:9px 22px;font-size:14px;">
            Enter Flow State →
          </button>
        </div>
      </div>
    </nav>


    <!-- ══════════════════════════════════════════════
         HERO — "The Entrance"
    ══════════════════════════════════════════════ -->
    <section style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:100px 24px 60px;position:relative;overflow:hidden;">

      <!-- Radial glow backlight -->
      <div style="position:absolute;top:20%;left:50%;transform:translateX(-50%);width:800px;height:600px;background:radial-gradient(ellipse at center, rgba(124,58,237,0.12) 0%, rgba(217,70,239,0.06) 40%, transparent 70%);pointer-events:none;z-index:0;"></div>
      <div style="position:absolute;bottom:0;left:30%;width:400px;height:400px;background:radial-gradient(ellipse, rgba(245,158,11,0.05) 0%, transparent 60%);pointer-events:none;"></div>

      <div style="position:relative;z-index:1;max-width:900px;width:100%;text-align:center;">

        <!-- Category badge -->
        <div class="fade-up delay-1" style="margin-bottom:24px;">
          <span class="pill pill-volt">
            <span class="pulse-dot"></span>
            Introducing the Vibe Business OS
          </span>
        </div>

        <!-- Main headline -->
        <h1 class="fade-up delay-2" style="font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(42px,7vw,88px);line-height:1.0;letter-spacing:-0.03em;margin-bottom:28px;">
          <span style="color:#F0F2FF;">You build</span><br/>
          <span style="color:#F0F2FF;">the product.</span><br/>
          <span class="shimmer-text">Auxora builds</span><br/>
          <span class="shimmer-text">the profit.</span>
        </h1>

        <!-- Sub-headline -->
        <p class="fade-up delay-3" style="font-size:clamp(16px,2vw,20px);color:#8B8FA8;max-width:640px;margin:0 auto 40px;line-height:1.7;font-weight:400;">
          The world's first <strong style="color:#A855F7;">autonomous revenue agent</strong> for D2C founders.
          We run your entire growth stack — Ads, SEO, Email, Influencers — through pure brand energy.
          <br/><br/>
          <em style="color:#F59E0B;font-style:normal;font-weight:600;">Stop grinding. Enter flow.</em>
        </p>

        <!-- CTA row -->
        <div class="fade-up delay-4" style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:48px;">
          <button onclick="startJourney()" class="btn-primary" style="padding:16px 36px;font-size:16px;display:flex;align-items:center;gap:10px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Activate Auxora — Free
          </button>
          <button onclick="window.location.href='#how-it-works'" class="btn-ghost" style="padding:16px 28px;font-size:16px;">
            See How It Works
          </button>
        </div>

        <!-- Social proof strip -->
        <div class="fade-up delay-4" style="display:flex;align-items:center;justify-content:center;gap:24px;flex-wrap:wrap;">
          <div style="display:flex;align-items:center;gap-8px;">
            <div style="display:flex;gap:4px;margin-right:10px;">
              <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#7C3AED,#D946EF);border:2px solid #08090C;"></div>
              <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#F59E0B,#F97316);border:2px solid #08090C;margin-left:-8px;"></div>
              <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#10B981,#0EA5E9);border:2px solid #08090C;margin-left:-8px;"></div>
            </div>
            <span style="color:#8B8FA8;font-size:13px;">200+ D2C founders in flow</span>
          </div>
          <div style="width:1px;height:20px;background:#252840;"></div>
          <div style="display:flex;align-items:center;gap:6px;">
            <i class="fas fa-star" style="color:#F59E0B;font-size:12px;"></i>
            <i class="fas fa-star" style="color:#F59E0B;font-size:12px;"></i>
            <i class="fas fa-star" style="color:#F59E0B;font-size:12px;"></i>
            <i class="fas fa-star" style="color:#F59E0B;font-size:12px;"></i>
            <i class="fas fa-star" style="color:#F59E0B;font-size:12px;"></i>
            <span style="color:#8B8FA8;font-size:13px;margin-left:4px;">4.9 · First report $4.99</span>
          </div>
          <div style="width:1px;height:20px;background:#252840;"></div>
          <div style="display:flex;align-items:center;gap:6px;">
            <span class="pulse-dot" style="background:#10B981;box-shadow:0 0 8px rgba(16,185,129,0.6);"></span>
            <span style="color:#8B8FA8;font-size:13px;">Agent active now</span>
          </div>
        </div>
      </div>

      <!-- Hero live terminal -->
      <div class="fade-up delay-4" style="position:relative;z-index:1;max-width:680px;width:100%;margin-top:60px;">
        <div class="terminal glow-violet">
          <div class="terminal-bar">
            <div class="terminal-dot" style="background:#FF5F57;"></div>
            <div class="terminal-dot" style="background:#FFBD2E;"></div>
            <div class="terminal-dot" style="background:#28C940;"></div>
            <span style="color:#4A4D66;font-size:11px;margin-left:8px;">auxora-agent v2.1 · revenue mode active</span>
            <span style="margin-left:auto;" class="pill pill-green" style="font-size:10px;padding:2px 8px;">RUNNING</span>
          </div>
          <div id="terminalOutput" style="padding:20px 20px 24px;line-height:1.8;min-height:160px;">
            <div style="color:#4A4D66;">$ auxora start --brand yamabushi-farms --mode autonomous</div>
            <div id="termLine1" style="color:#A855F7;opacity:0;transition:opacity 0.3s;">◆ Scanning 847 competitor ad creatives...</div>
            <div id="termLine2" style="color:#10B981;opacity:0;transition:opacity 0.3s;">✓ Identified 3 high-converting angles for your niche</div>
            <div id="termLine3" style="color:#A855F7;opacity:0;transition:opacity 0.3s;">◆ Building Meta + Google campaign structure...</div>
            <div id="termLine4" style="color:#10B981;opacity:0;transition:opacity 0.3s;">✓ Budget allocated: $1,200/mo · Projected ROAS: 3.2×</div>
            <div id="termLine5" style="color:#A855F7;opacity:0;transition:opacity 0.3s;">◆ Launching 6-month GTM roadmap...</div>
            <div id="termLine6" style="color:#F59E0B;opacity:0;transition:opacity 0.3s;">⚡ Revenue engine online. Your vibe business is live.</div>
            <div id="termCursor" style="display:inline-block;width:8px;height:16px;background:#A855F7;vertical-align:middle;opacity:0;"></div>
          </div>
        </div>
      </div>
    </section>


    <!-- ══════════════════════════════════════════════
         TICKER — Category definition
    ══════════════════════════════════════════════ -->
    <div style="overflow:hidden;padding:14px 0;border-top:1px solid #252840;border-bottom:1px solid #252840;background:#0E1018;">
      <div class="ticker-track" style="gap:0;">
        <span style="white-space:nowrap;padding:0 40px;color:#4A4D66;font-family:'Space Mono',monospace;font-size:12px;letter-spacing:0.05em;">AUTONOMOUS ADS</span>
        <span style="color:#A855F7;padding:0 12px;">◆</span>
        <span style="white-space:nowrap;padding:0 40px;color:#4A4D66;font-family:'Space Mono',monospace;font-size:12px;letter-spacing:0.05em;">VIBE BUSINESS</span>
        <span style="color:#F59E0B;padding:0 12px;">◆</span>
        <span style="white-space:nowrap;padding:0 40px;color:#4A4D66;font-family:'Space Mono',monospace;font-size:12px;letter-spacing:0.05em;">REVENUE ON AUTOPILOT</span>
        <span style="color:#A855F7;padding:0 12px;">◆</span>
        <span style="white-space:nowrap;padding:0 40px;color:#4A4D66;font-family:'Space Mono',monospace;font-size:12px;letter-spacing:0.05em;">D2C BRAND GROWTH</span>
        <span style="color:#10B981;padding:0 12px;">◆</span>
        <span style="white-space:nowrap;padding:0 40px;color:#4A4D66;font-family:'Space Mono',monospace;font-size:12px;letter-spacing:0.05em;">STOP GRINDING</span>
        <span style="color:#D946EF;padding:0 12px;">◆</span>
        <span style="white-space:nowrap;padding:0 40px;color:#4A4D66;font-family:'Space Mono',monospace;font-size:12px;letter-spacing:0.05em;">ENTER FLOW</span>
        <span style="color:#A855F7;padding:0 12px;">◆</span>
        <!-- Duplicate for seamless loop -->
        <span style="white-space:nowrap;padding:0 40px;color:#4A4D66;font-family:'Space Mono',monospace;font-size:12px;letter-spacing:0.05em;">AUTONOMOUS ADS</span>
        <span style="color:#A855F7;padding:0 12px;">◆</span>
        <span style="white-space:nowrap;padding:0 40px;color:#4A4D66;font-family:'Space Mono',monospace;font-size:12px;letter-spacing:0.05em;">VIBE BUSINESS</span>
        <span style="color:#F59E0B;padding:0 12px;">◆</span>
        <span style="white-space:nowrap;padding:0 40px;color:#4A4D66;font-family:'Space Mono',monospace;font-size:12px;letter-spacing:0.05em;">REVENUE ON AUTOPILOT</span>
        <span style="color:#A855F7;padding:0 12px;">◆</span>
        <span style="white-space:nowrap;padding:0 40px;color:#4A4D66;font-family:'Space Mono',monospace;font-size:12px;letter-spacing:0.05em;">D2C BRAND GROWTH</span>
        <span style="color:#10B981;padding:0 12px;">◆</span>
        <span style="white-space:nowrap;padding:0 40px;color:#4A4D66;font-family:'Space Mono',monospace;font-size:12px;letter-spacing:0.05em;">STOP GRINDING</span>
        <span style="color:#D946EF;padding:0 12px;">◆</span>
        <span style="white-space:nowrap;padding:0 40px;color:#4A4D66;font-family:'Space Mono',monospace;font-size:12px;letter-spacing:0.05em;">ENTER FLOW</span>
        <span style="color:#A855F7;padding:0 12px;">◆</span>
      </div>
    </div>


    <!-- ══════════════════════════════════════════════
         GRIND vs FLOW — The Category Definition
    ══════════════════════════════════════════════ -->
    <section style="padding:100px 24px;position:relative;overflow:hidden;" class="section-glow">
      <div style="max-width:1200px;margin:0 auto;position:relative;z-index:1;">
        <div style="text-align:center;margin-bottom:64px;">
          <span class="pill pill-amber" style="margin-bottom:16px;">The Category Shift</span>
          <h2 style="font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(32px,5vw,56px);letter-spacing:-0.03em;line-height:1.1;margin-top:16px;">
            <span style="color:#8B8FA8;">From the</span> <span class="grad-warm">Marketing Grind</span><br/>
            <span style="color:#8B8FA8;">to the</span> <span class="grad-volt">Revenue Flow</span>
          </h2>
          <p style="color:#8B8FA8;font-size:17px;max-width:560px;margin:20px auto 0;line-height:1.7;">
            Every D2C founder knows the feeling. You're brilliant at building products. But growth became a second full-time job. Auxora ends that.
          </p>
        </div>

        <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:24px;align-items:start;">

          <!-- GRIND side -->
          <div class="card" style="padding:36px;border-color:rgba(239,68,68,0.2);">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:28px;">
              <div style="width:44px;height:44px;border-radius:12px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);display:flex;align-items:center;justify-content:center;">
                <i class="fas fa-fire" style="color:#EF4444;font-size:18px;"></i>
              </div>
              <div>
                <div style="font-family:'Syne',sans-serif;font-weight:700;font-size:18px;color:#F0F2FF;">The Grind</div>
                <div style="color:#EF4444;font-size:12px;font-family:'Space Mono',monospace;">CURRENT STATE</div>
              </div>
            </div>
            <ul style="list-style:none;display:flex;flex-direction:column;gap:14px;">
              <li style="display:flex;gap:10px;align-items:flex-start;color:#8B8FA8;font-size:14px;">
                <i class="fas fa-times-circle" style="color:#EF4444;margin-top:2px;flex-shrink:0;"></i>
                <span>Spending 30+ hrs/week on ads that don't convert</span>
              </li>
              <li style="display:flex;gap:10px;align-items:flex-start;color:#8B8FA8;font-size:14px;">
                <i class="fas fa-times-circle" style="color:#EF4444;margin-top:2px;flex-shrink:0;"></i>
                <span>Hiring agencies for $5K/mo with zero accountability</span>
              </li>
              <li style="display:flex;gap:10px;align-items:flex-start;color:#8B8FA8;font-size:14px;">
                <i class="fas fa-times-circle" style="color:#EF4444;margin-top:2px;flex-shrink:0;"></i>
                <span>CAC spiraling, ROAS collapsing, growth stalling</span>
              </li>
              <li style="display:flex;gap:10px;align-items:flex-start;color:#8B8FA8;font-size:14px;">
                <i class="fas fa-times-circle" style="color:#EF4444;margin-top:2px;flex-shrink:0;"></i>
                <span>Brilliant product, zero distribution leverage</span>
              </li>
              <li style="display:flex;gap:10px;align-items:flex-start;color:#8B8FA8;font-size:14px;">
                <i class="fas fa-times-circle" style="color:#EF4444;margin-top:2px;flex-shrink:0;"></i>
                <span>No clear roadmap — just reacting to what's on fire</span>
              </li>
            </ul>
          </div>

          <!-- Center arrow -->
          <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding-top:40px;gap:12px;">
            <div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#7C3AED,#D946EF);display:flex;align-items:center;justify-content:center;box-shadow:0 0 30px rgba(124,58,237,0.4);">
              <i class="fas fa-arrow-right" style="color:white;font-size:20px;"></i>
            </div>
            <span style="font-family:'Space Mono',monospace;font-size:10px;color:#4A4D66;text-align:center;writing-mode:vertical-rl;display:none;">AUXORA</span>
          </div>

          <!-- FLOW side -->
          <div class="card" style="padding:36px;border-color:rgba(124,58,237,0.3);" class="glow-violet">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:28px;">
              <div style="width:44px;height:44px;border-radius:12px;background:rgba(124,58,237,0.15);border:1px solid rgba(124,58,237,0.3);display:flex;align-items:center;justify-content:center;">
                <i class="fas fa-infinity" style="color:#A855F7;font-size:18px;"></i>
              </div>
              <div>
                <div style="font-family:'Syne',sans-serif;font-weight:700;font-size:18px;color:#F0F2FF;">The Flow</div>
                <div style="color:#10B981;font-size:12px;font-family:'Space Mono',monospace;">WITH AUXORA</div>
              </div>
            </div>
            <ul style="list-style:none;display:flex;flex-direction:column;gap:14px;">
              <li style="display:flex;gap:10px;align-items:flex-start;color:#8B8FA8;font-size:14px;">
                <i class="fas fa-check-circle" style="color:#10B981;margin-top:2px;flex-shrink:0;"></i>
                <span>Agent runs your full ad stack <strong style="color:#F0F2FF;">24/7 autonomously</strong></span>
              </li>
              <li style="display:flex;gap:10px;align-items:flex-start;color:#8B8FA8;font-size:14px;">
                <i class="fas fa-check-circle" style="color:#10B981;margin-top:2px;flex-shrink:0;"></i>
                <span>$4.99 strategy report instead of $5K agency retainer</span>
              </li>
              <li style="display:flex;gap:10px;align-items:flex-start;color:#8B8FA8;font-size:14px;">
                <i class="fas fa-check-circle" style="color:#10B981;margin-top:2px;flex-shrink:0;"></i>
                <span>CAC optimized, ROAS maximized in real-time</span>
              </li>
              <li style="display:flex;gap:10px;align-items:flex-start;color:#8B8FA8;font-size:14px;">
                <i class="fas fa-check-circle" style="color:#10B981;margin-top:2px;flex-shrink:0;"></i>
                <span>Brand energy converted into distribution leverage</span>
              </li>
              <li style="display:flex;gap:10px;align-items:flex-start;color:#8B8FA8;font-size:14px;">
                <i class="fas fa-check-circle" style="color:#10B981;margin-top:2px;flex-shrink:0;"></i>
                <span>6-month roadmap, updated weekly by your AI co-founder</span>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </section>


    <!-- ══════════════════════════════════════════════
         STATS BAR
    ══════════════════════════════════════════════ -->
    <div class="gradient-divider"></div>
    <div style="background:#0E1018;padding:48px 24px;">
      <div style="max-width:1000px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">
        <div style="text-align:center;padding:24px 12px;border-right:1px solid #252840;">
          <div class="stat-num">10×</div>
          <div style="color:#8B8FA8;font-size:13px;margin-top:8px;">Avg Revenue<br/>Multiplier</div>
        </div>
        <div style="text-align:center;padding:24px 12px;border-right:1px solid #252840;">
          <div class="stat-num">3×</div>
          <div style="color:#8B8FA8;font-size:13px;margin-top:8px;">Average<br/>ROAS</div>
        </div>
        <div style="text-align:center;padding:24px 12px;border-right:1px solid #252840;">
          <div class="stat-num">$4.99</div>
          <div style="color:#8B8FA8;font-size:13px;margin-top:8px;">First Full<br/>Strategy</div>
        </div>
        <div style="text-align:center;padding:24px 12px;">
          <div class="stat-num">10m</div>
          <div style="color:#8B8FA8;font-size:13px;margin-top:8px;">To Your<br/>Roadmap</div>
        </div>
      </div>
    </div>
    <div class="gradient-divider"></div>


    <!-- ══════════════════════════════════════════════
         HOW IT WORKS — The Agent Protocol
    ══════════════════════════════════════════════ -->
    <section id="how-it-works" style="padding:100px 24px;position:relative;overflow:hidden;">
      <div style="position:absolute;top:50%;right:-100px;width:500px;height:500px;background:radial-gradient(ellipse,rgba(217,70,239,0.06) 0%,transparent 60%);pointer-events:none;transform:translateY(-50%);"></div>

      <div style="max-width:1200px;margin:0 auto;position:relative;z-index:1;">
        <div style="text-align:center;margin-bottom:72px;">
          <span class="pill pill-volt" style="margin-bottom:16px;">The Protocol</span>
          <h2 style="font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(32px,5vw,52px);letter-spacing:-0.03em;margin-top:16px;color:#F0F2FF;">
            How the <span class="grad-volt">Revenue Agent</span><br/>Actually Works
          </h2>
          <p style="color:#8B8FA8;font-size:17px;max-width:520px;margin:20px auto 0;line-height:1.7;">
            Five minutes of your brand's voice. A lifetime of autonomous execution.
          </p>
        </div>

        <!-- Steps -->
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;position:relative;">

          <div class="card flow-stage" style="padding:28px;text-align:center;">
            <div style="width:56px;height:56px;border-radius:16px;background:linear-gradient(135deg,rgba(124,58,237,0.2),rgba(124,58,237,0.05));border:1px solid rgba(124,58,237,0.3);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
              <i class="fas fa-microphone" style="color:#A855F7;font-size:22px;"></i>
            </div>
            <div style="font-family:'Space Mono',monospace;font-size:10px;color:#4A4D66;letter-spacing:0.1em;margin-bottom:8px;">01</div>
            <h3 style="font-family:'Syne',sans-serif;font-weight:700;font-size:16px;color:#F0F2FF;margin-bottom:8px;">Brand Interview</h3>
            <p style="color:#8B8FA8;font-size:13px;line-height:1.6;">10-minute voice conversation. Our AI captures your brand's DNA — voice, values, audience, and goals.</p>
          </div>

          <div class="card flow-stage" style="padding:28px;text-align:center;">
            <div style="width:56px;height:56px;border-radius:16px;background:linear-gradient(135deg,rgba(217,70,239,0.2),rgba(217,70,239,0.05));border:1px solid rgba(217,70,239,0.3);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
              <i class="fas fa-search" style="color:#D946EF;font-size:22px;"></i>
            </div>
            <div style="font-family:'Space Mono',monospace;font-size:10px;color:#4A4D66;letter-spacing:0.1em;margin-bottom:8px;">02</div>
            <h3 style="font-family:'Syne',sans-serif;font-weight:700;font-size:16px;color:#F0F2FF;margin-bottom:8px;">Market Intelligence</h3>
            <p style="color:#8B8FA8;font-size:13px;line-height:1.6;">We scan 1,000+ competitor ads, find the gaps, and model your fastest path to profitability.</p>
          </div>

          <div class="card flow-stage" style="padding:28px;text-align:center;">
            <div style="width:56px;height:56px;border-radius:16px;background:linear-gradient(135deg,rgba(245,158,11,0.2),rgba(245,158,11,0.05));border:1px solid rgba(245,158,11,0.3);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
              <i class="fas fa-bolt" style="color:#F59E0B;font-size:22px;"></i>
            </div>
            <div style="font-family:'Space Mono',monospace;font-size:10px;color:#4A4D66;letter-spacing:0.1em;margin-bottom:8px;">03</div>
            <h3 style="font-family:'Syne',sans-serif;font-weight:700;font-size:16px;color:#F0F2FF;margin-bottom:8px;">Strategy Unlock</h3>
            <p style="color:#8B8FA8;font-size:13px;line-height:1.6;">$4.99 unlocks your full 6-month GTM roadmap — channels, budget, CAC targets, creative angles.</p>
          </div>

          <div class="card" style="padding:28px;text-align:center;border-color:rgba(16,185,129,0.3);">
            <div style="width:56px;height:56px;border-radius:16px;background:linear-gradient(135deg,rgba(16,185,129,0.2),rgba(16,185,129,0.05));border:1px solid rgba(16,185,129,0.3);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
              <i class="fas fa-infinity" style="color:#10B981;font-size:22px;"></i>
            </div>
            <div style="font-family:'Space Mono',monospace;font-size:10px;color:#4A4D66;letter-spacing:0.1em;margin-bottom:8px;">04</div>
            <h3 style="font-family:'Syne',sans-serif;font-weight:700;font-size:16px;color:#F0F2FF;margin-bottom:8px;">Autonomous Execution</h3>
            <p style="color:#8B8FA8;font-size:13px;line-height:1.6;">Agent launches and optimizes your campaigns. Revenue compounds. You stay in flow.</p>
          </div>

        </div>

        <div style="text-align:center;margin-top:48px;">
          <button onclick="startJourney()" class="btn-primary" style="padding:16px 40px;font-size:15px;">
            Start the Protocol — Free
          </button>
        </div>
      </div>
    </section>


    <!-- ══════════════════════════════════════════════
         THE AGENT STACK — What Auxora Runs
    ══════════════════════════════════════════════ -->
    <section style="padding:100px 24px;background:#0E1018;position:relative;overflow:hidden;">
      <div style="position:absolute;top:-100px;left:50%;transform:translateX(-50%);width:1px;height:200px;background:linear-gradient(to bottom,transparent,#A855F7,transparent);"></div>

      <div style="max-width:1200px;margin:0 auto;">
        <div style="text-align:center;margin-bottom:72px;">
          <span class="pill pill-volt" style="margin-bottom:16px;">The Agent Stack</span>
          <h2 style="font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(32px,5vw,52px);letter-spacing:-0.03em;margin-top:16px;">
            <span style="color:#F0F2FF;">Your Entire Growth Stack.</span><br/>
            <span class="grad-volt">Handled.</span>
          </h2>
        </div>

        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;">

          <div class="card agent-card" style="padding:32px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
              <div style="display:flex;align-items:center;gap:12px;">
                <div style="width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#1877F2,#0A52B5);display:flex;align-items:center;justify-content:center;">
                  <i class="fab fa-facebook" style="color:white;font-size:16px;"></i>
                </div>
                <span style="font-family:'Syne',sans-serif;font-weight:700;color:#F0F2FF;">Meta Ads</span>
              </div>
              <span class="pill pill-green" style="font-size:10px;padding:3px 8px;">AUTO</span>
            </div>
            <p style="color:#8B8FA8;font-size:13px;line-height:1.7;margin-bottom:16px;">Campaign creation, audience targeting, creative testing, bid optimization — all running without you.</p>
            <div style="background:#14161F;border-radius:10px;padding:12px;border:1px solid #252840;">
              <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                <span style="color:#4A4D66;font-family:'Space Mono',monospace;font-size:11px;">ROAS TARGET</span>
                <span style="color:#10B981;font-family:'Space Mono',monospace;font-size:11px;font-weight:700;">3.2×</span>
              </div>
              <div style="height:4px;background:#252840;border-radius:2px;"><div style="height:4px;background:linear-gradient(to right,#1877F2,#A855F7);border-radius:2px;width:78%;"></div></div>
            </div>
          </div>

          <div class="card agent-card" style="padding:32px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
              <div style="display:flex;align-items:center;gap:12px;">
                <div style="width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#EA4335,#FBBC05);display:flex;align-items:center;justify-content:center;">
                  <i class="fab fa-google" style="color:white;font-size:16px;"></i>
                </div>
                <span style="font-family:'Syne',sans-serif;font-weight:700;color:#F0F2FF;">Google Ads</span>
              </div>
              <span class="pill pill-green" style="font-size:10px;padding:3px 8px;">AUTO</span>
            </div>
            <p style="color:#8B8FA8;font-size:13px;line-height:1.7;margin-bottom:16px;">Search + Shopping campaigns with AI-driven keyword selection, negative lists, and CPA optimization.</p>
            <div style="background:#14161F;border-radius:10px;padding:12px;border:1px solid #252840;">
              <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                <span style="color:#4A4D66;font-family:'Space Mono',monospace;font-size:11px;">CPC EFFICIENCY</span>
                <span style="color:#10B981;font-family:'Space Mono',monospace;font-size:11px;font-weight:700;">−42%</span>
              </div>
              <div style="height:4px;background:#252840;border-radius:2px;"><div style="height:4px;background:linear-gradient(to right,#EA4335,#FBBC05);border-radius:2px;width:65%;"></div></div>
            </div>
          </div>

          <div class="card agent-card" style="padding:32px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
              <div style="display:flex;align-items:center;gap:12px;">
                <div style="width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#A855F7,#D946EF);display:flex;align-items:center;justify-content:center;">
                  <i class="fas fa-chart-line" style="color:white;font-size:16px;"></i>
                </div>
                <span style="font-family:'Syne',sans-serif;font-weight:700;color:#F0F2FF;">SEO + Content</span>
              </div>
              <span class="pill pill-volt" style="font-size:10px;padding:3px 8px;">BUILDING</span>
            </div>
            <p style="color:#8B8FA8;font-size:13px;line-height:1.7;margin-bottom:16px;">Long-term organic moat. AI generates keyword strategies, content calendars, and link-building plans.</p>
            <div style="background:#14161F;border-radius:10px;padding:12px;border:1px solid #252840;">
              <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                <span style="color:#4A4D66;font-family:'Space Mono',monospace;font-size:11px;">ORGANIC TRAFFIC</span>
                <span style="color:#A855F7;font-family:'Space Mono',monospace;font-size:11px;font-weight:700;">+340%</span>
              </div>
              <div style="height:4px;background:#252840;border-radius:2px;"><div style="height:4px;background:linear-gradient(to right,#A855F7,#D946EF);border-radius:2px;width:88%;"></div></div>
            </div>
          </div>

          <div class="card agent-card" style="padding:32px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
              <div style="display:flex;align-items:center;gap:12px;">
                <div style="width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#F59E0B,#F97316);display:flex;align-items:center;justify-content:center;">
                  <i class="fas fa-envelope" style="color:white;font-size:16px;"></i>
                </div>
                <span style="font-family:'Syne',sans-serif;font-weight:700;color:#F0F2FF;">Email & SMS</span>
              </div>
              <span class="pill pill-green" style="font-size:10px;padding:3px 8px;">AUTO</span>
            </div>
            <p style="color:#8B8FA8;font-size:13px;line-height:1.7;margin-bottom:16px;">Lifecycle flows, winback campaigns, and segmented broadcasts that convert at every stage of the funnel.</p>
            <div style="background:#14161F;border-radius:10px;padding:12px;border:1px solid #252840;">
              <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                <span style="color:#4A4D66;font-family:'Space Mono',monospace;font-size:11px;">OPEN RATE</span>
                <span style="color:#F59E0B;font-family:'Space Mono',monospace;font-size:11px;font-weight:700;">38%</span>
              </div>
              <div style="height:4px;background:#252840;border-radius:2px;"><div style="height:4px;background:linear-gradient(to right,#F59E0B,#F97316);border-radius:2px;width:72%;"></div></div>
            </div>
          </div>

          <div class="card agent-card" style="padding:32px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
              <div style="display:flex;align-items:center;gap:12px;">
                <div style="width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#EC4899,#8B5CF6);display:flex;align-items:center;justify-content:center;">
                  <i class="fab fa-instagram" style="color:white;font-size:16px;"></i>
                </div>
                <span style="font-family:'Syne',sans-serif;font-weight:700;color:#F0F2FF;">Influencers</span>
              </div>
              <span class="pill pill-volt" style="font-size:10px;padding:3px 8px;">SOON</span>
            </div>
            <p style="color:#8B8FA8;font-size:13px;line-height:1.7;margin-bottom:16px;">AI-matched micro-influencer outreach, performance tracking, and UGC content briefs tailored to your brand.</p>
            <div style="background:#14161F;border-radius:10px;padding:12px;border:1px solid #252840;">
              <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                <span style="color:#4A4D66;font-family:'Space Mono',monospace;font-size:11px;">ENGAGEMENT</span>
                <span style="color:#EC4899;font-family:'Space Mono',monospace;font-size:11px;font-weight:700;">6.2%</span>
              </div>
              <div style="height:4px;background:#252840;border-radius:2px;"><div style="height:4px;background:linear-gradient(to right,#EC4899,#8B5CF6);border-radius:2px;width:55%;"></div></div>
            </div>
          </div>

          <div class="card" style="padding:32px;background:linear-gradient(135deg,rgba(124,58,237,0.1),rgba(217,70,239,0.05));border-color:rgba(124,58,237,0.3);">
            <div style="height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;gap:16px;">
              <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#7C3AED,#D946EF);display:flex;align-items:center;justify-content:center;box-shadow:0 0 30px rgba(124,58,237,0.4);">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </div>
              <h3 style="font-family:'Syne',sans-serif;font-weight:800;font-size:20px;color:#F0F2FF;">Full Stack<br/>Orchestration</h3>
              <p style="color:#8B8FA8;font-size:13px;line-height:1.6;">All channels working in sync. One agent, one strategy, compounding results.</p>
              <button onclick="startJourney()" class="btn-primary" style="padding:12px 28px;font-size:14px;width:100%;">
                Activate Now →
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>


    <!-- ══════════════════════════════════════════════
         RESULTS — Proven in the Wild
    ══════════════════════════════════════════════ -->
    <section id="results" style="padding:100px 24px;position:relative;overflow:hidden;" class="section-glow">
      <div style="max-width:1200px;margin:0 auto;position:relative;z-index:1;">
        <div style="text-align:center;margin-bottom:72px;">
          <span class="pill pill-amber" style="margin-bottom:16px;">Proof of Flow</span>
          <h2 style="font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(32px,5vw,52px);letter-spacing:-0.03em;margin-top:16px;color:#F0F2FF;">
            Real Brands. <span class="grad-warm">Real Revenue.</span>
          </h2>
        </div>

        <!-- Hero case study -->
        <div class="card" style="padding:0;overflow:hidden;margin-bottom:24px;border-color:rgba(245,158,11,0.2);">
          <div style="display:grid;grid-template-columns:1fr 1fr;">
            <!-- Video side -->
            <div style="position:relative;cursor:pointer;background:#000;" onclick="openVideoModal(0)">
              <img src="https://img.youtube.com/vi/nw1XYryhdIU/maxresdefault.jpg" alt="Yamabushi Farms" style="width:100%;aspect-ratio:16/9;object-fit:cover;opacity:0.8;display:block;"/>
              <div style="position:absolute;inset:0;background:linear-gradient(to right,transparent 50%,rgba(8,9,12,0.9));"></div>
              <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;">
                <div style="width:72px;height:72px;border-radius:50%;background:rgba(245,158,11,0.9);display:flex;align-items:center;justify-content:center;box-shadow:0 0 30px rgba(245,158,11,0.5);transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                  <i class="fas fa-play" style="color:black;font-size:24px;margin-left:4px;"></i>
                </div>
              </div>
              <div style="position:absolute;top:16px;left:16px;">
                <span class="pill pill-amber">🛒 D2C Case Study</span>
              </div>
            </div>

            <!-- Stats side -->
            <div style="padding:40px;">
              <div style="font-family:'Space Mono',monospace;font-size:11px;color:#4A4D66;letter-spacing:0.1em;margin-bottom:12px;">CASE STUDY · VERIFIED RESULTS</div>
              <h3 style="font-family:'Syne',sans-serif;font-weight:800;font-size:28px;color:#F0F2FF;margin-bottom:6px;">Yamabushi Farms</h3>
              <p style="color:#8B8FA8;font-size:14px;margin-bottom:28px;">Japanese heritage wellness brand · D2C direct</p>

              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:28px;">
                <div style="background:#0E1018;border-radius:12px;padding:16px;border:1px solid rgba(245,158,11,0.2);">
                  <div style="font-family:'Syne',sans-serif;font-weight:800;font-size:32px;color:#F59E0B;">10×</div>
                  <div style="color:#8B8FA8;font-size:12px;margin-top:4px;">Revenue in<br/>2 months</div>
                </div>
                <div style="background:#0E1018;border-radius:12px;padding:16px;border:1px solid rgba(16,185,129,0.2);">
                  <div style="font-family:'Syne',sans-serif;font-weight:800;font-size:32px;color:#10B981;">3×</div>
                  <div style="color:#8B8FA8;font-size:12px;margin-top:4px;">ROAS in<br/>first month</div>
                </div>
                <div style="background:#0E1018;border-radius:12px;padding:16px;border:1px solid rgba(168,85,247,0.2);">
                  <div style="font-family:'Syne',sans-serif;font-weight:800;font-size:32px;color:#A855F7;">62%</div>
                  <div style="color:#8B8FA8;font-size:12px;margin-top:4px;">CAC<br/>reduction</div>
                </div>
                <div style="background:#0E1018;border-radius:12px;padding:16px;border:1px solid rgba(217,70,239,0.2);">
                  <div style="font-family:'Syne',sans-serif;font-weight:800;font-size:32px;color:#D946EF;">6wk</div>
                  <div style="color:#8B8FA8;font-size:12px;margin-top:4px;">To<br/>profitability</div>
                </div>
              </div>

              <button onclick="openVideoModal(0)" class="btn-ghost" style="width:100%;padding:14px;font-size:14px;display:flex;align-items:center;justify-content:center;gap:8px;">
                <i class="fas fa-play-circle" style="color:#F59E0B;"></i>
                Watch the Full Story
              </button>
            </div>
          </div>
        </div>

        <!-- Testimonials -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <div class="card" style="padding:28px;">
            <div style="display:flex;gap:1px;margin-bottom:12px;">
              <i class="fas fa-star" style="color:#F59E0B;font-size:13px;"></i>
              <i class="fas fa-star" style="color:#F59E0B;font-size:13px;"></i>
              <i class="fas fa-star" style="color:#F59E0B;font-size:13px;"></i>
              <i class="fas fa-star" style="color:#F59E0B;font-size:13px;"></i>
              <i class="fas fa-star" style="color:#F59E0B;font-size:13px;"></i>
            </div>
            <p style="color:#8B8FA8;font-size:14px;line-height:1.7;margin-bottom:20px;font-style:italic;">"I was drowning in Meta Ads dashboards. Auxora took that entire thing off my plate. Now I just check the dashboard on Friday mornings and the numbers are going up."</p>
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#A855F7,#D946EF);display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-weight:700;font-size:14px;color:white;">S</div>
              <div>
                <div style="font-weight:600;font-size:13px;color:#F0F2FF;">Sarah K.</div>
                <div style="color:#4A4D66;font-size:12px;font-family:'Space Mono',monospace;">Skincare D2C Founder</div>
              </div>
            </div>
          </div>

          <div class="card" style="padding:28px;">
            <div style="display:flex;gap:1px;margin-bottom:12px;">
              <i class="fas fa-star" style="color:#F59E0B;font-size:13px;"></i>
              <i class="fas fa-star" style="color:#F59E0B;font-size:13px;"></i>
              <i class="fas fa-star" style="color:#F59E0B;font-size:13px;"></i>
              <i class="fas fa-star" style="color:#F59E0B;font-size:13px;"></i>
              <i class="fas fa-star" style="color:#F59E0B;font-size:13px;"></i>
            </div>
            <p style="color:#8B8FA8;font-size:14px;line-height:1.7;margin-bottom:20px;font-style:italic;">"The $4.99 report was insane value. It showed me exactly why my ads weren't converting and gave me a week-by-week plan. Best marketing spend I've ever made."</p>
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#10B981,#0EA5E9);display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-weight:700;font-size:14px;color:white;">M</div>
              <div>
                <div style="font-weight:600;font-size:13px;color:#F0F2FF;">Marcus T.</div>
                <div style="color:#4A4D66;font-size:12px;font-family:'Space Mono',monospace;">Pet Accessories Brand</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>


    <!-- ══════════════════════════════════════════════
         PRICING — The Entry Point
    ══════════════════════════════════════════════ -->
    <section id="pricing" style="padding:100px 24px;background:#0E1018;position:relative;overflow:hidden;">
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:700px;height:500px;background:radial-gradient(ellipse,rgba(124,58,237,0.08) 0%,transparent 60%);pointer-events:none;"></div>

      <div style="max-width:1200px;margin:0 auto;position:relative;z-index:1;">
        <div style="text-align:center;margin-bottom:72px;">
          <span class="pill pill-volt" style="margin-bottom:16px;">Pricing</span>
          <h2 style="font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(32px,5vw,52px);letter-spacing:-0.03em;margin-top:16px;color:#F0F2FF;">
            Start for $4.99.<br/><span class="grad-volt">Scale with the Agent.</span>
          </h2>
        </div>

        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;max-width:960px;margin:0 auto;">

          <!-- Starter -->
          <div class="card" style="padding:32px;">
            <div style="font-family:'Space Mono',monospace;font-size:10px;color:#4A4D66;letter-spacing:0.1em;margin-bottom:16px;">ENTRY</div>
            <div style="font-family:'Syne',sans-serif;font-weight:800;font-size:40px;color:#F0F2FF;margin-bottom:4px;">$4.99</div>
            <div style="color:#8B8FA8;font-size:13px;margin-bottom:24px;">one-time · first report</div>
            <ul style="list-style:none;display:flex;flex-direction:column;gap:12px;margin-bottom:28px;">
              <li style="display:flex;gap:8px;align-items:flex-start;color:#8B8FA8;font-size:13px;"><i class="fas fa-check" style="color:#10B981;margin-top:2px;flex-shrink:0;"></i> Full competitor intelligence</li>
              <li style="display:flex;gap:8px;align-items:flex-start;color:#8B8FA8;font-size:13px;"><i class="fas fa-check" style="color:#10B981;margin-top:2px;flex-shrink:0;"></i> 6-month GTM roadmap</li>
              <li style="display:flex;gap:8px;align-items:flex-start;color:#8B8FA8;font-size:13px;"><i class="fas fa-check" style="color:#10B981;margin-top:2px;flex-shrink:0;"></i> Channel + budget plan</li>
              <li style="display:flex;gap:8px;align-items:flex-start;color:#8B8FA8;font-size:13px;"><i class="fas fa-check" style="color:#10B981;margin-top:2px;flex-shrink:0;"></i> CAC/LTV projections</li>
              <li style="display:flex;gap:8px;align-items:flex-start;color:#8B8FA8;font-size:13px;"><i class="fas fa-check" style="color:#10B981;margin-top:2px;flex-shrink:0;"></i> PDF + email delivery</li>
            </ul>
            <button onclick="startJourney()" class="btn-ghost" style="width:100%;padding:14px;font-size:14px;">
              Get My Strategy →
            </button>
          </div>

          <!-- Growth — highlighted -->
          <div class="card" style="padding:32px;border-color:rgba(124,58,237,0.4);background:linear-gradient(160deg,rgba(124,58,237,0.08),rgba(14,16,24,0.9));position:relative;">
            <div style="position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#7C3AED,#D946EF);color:white;font-family:'Syne',sans-serif;font-weight:700;font-size:11px;letter-spacing:0.05em;padding:5px 16px;border-radius:999px;">MOST POPULAR</div>
            <div style="font-family:'Space Mono',monospace;font-size:10px;color:#A855F7;letter-spacing:0.1em;margin-bottom:16px;">GROWTH</div>
            <div style="font-family:'Syne',sans-serif;font-weight:800;font-size:40px;color:#F0F2FF;margin-bottom:4px;">$450<span style="font-size:20px;color:#8B8FA8;">/mo</span></div>
            <div style="color:#8B8FA8;font-size:13px;margin-bottom:24px;">autonomous agent · billed monthly</div>
            <ul style="list-style:none;display:flex;flex-direction:column;gap:12px;margin-bottom:28px;">
              <li style="display:flex;gap:8px;align-items:flex-start;color:#8B8FA8;font-size:13px;"><i class="fas fa-check" style="color:#A855F7;margin-top:2px;flex-shrink:0;"></i> Everything in Entry</li>
              <li style="display:flex;gap:8px;align-items:flex-start;color:#8B8FA8;font-size:13px;"><i class="fas fa-check" style="color:#A855F7;margin-top:2px;flex-shrink:0;"></i> Meta + Google auto-management</li>
              <li style="display:flex;gap:8px;align-items:flex-start;color:#8B8FA8;font-size:13px;"><i class="fas fa-check" style="color:#A855F7;margin-top:2px;flex-shrink:0;"></i> Weekly AI optimization</li>
              <li style="display:flex;gap:8px;align-items:flex-start;color:#8B8FA8;font-size:13px;"><i class="fas fa-check" style="color:#A855F7;margin-top:2px;flex-shrink:0;"></i> Email + SMS flows</li>
              <li style="display:flex;gap:8px;align-items:flex-start;color:#8B8FA8;font-size:13px;"><i class="fas fa-check" style="color:#A855F7;margin-top:2px;flex-shrink:0;"></i> Real-time dashboard</li>
            </ul>
            <button onclick="startJourney()" class="btn-primary" style="width:100%;padding:14px;font-size:14px;">
              Enter Flow State →
            </button>
          </div>

          <!-- Scale -->
          <div class="card" style="padding:32px;">
            <div style="font-family:'Space Mono',monospace;font-size:10px;color:#4A4D66;letter-spacing:0.1em;margin-bottom:16px;">SCALE</div>
            <div style="font-family:'Syne',sans-serif;font-weight:800;font-size:40px;color:#F0F2FF;margin-bottom:4px;">$1,200<span style="font-size:20px;color:#8B8FA8;">/mo</span></div>
            <div style="color:#8B8FA8;font-size:13px;margin-bottom:24px;">full stack · custom execution</div>
            <ul style="list-style:none;display:flex;flex-direction:column;gap:12px;margin-bottom:28px;">
              <li style="display:flex;gap:8px;align-items:flex-start;color:#8B8FA8;font-size:13px;"><i class="fas fa-check" style="color:#F59E0B;margin-top:2px;flex-shrink:0;"></i> Everything in Growth</li>
              <li style="display:flex;gap:8px;align-items:flex-start;color:#8B8FA8;font-size:13px;"><i class="fas fa-check" style="color:#F59E0B;margin-top:2px;flex-shrink:0;"></i> Influencer outreach</li>
              <li style="display:flex;gap:8px;align-items:flex-start;color:#8B8FA8;font-size:13px;"><i class="fas fa-check" style="color:#F59E0B;margin-top:2px;flex-shrink:0;"></i> SEO + content engine</li>
              <li style="display:flex;gap:8px;align-items:flex-start;color:#8B8FA8;font-size:13px;"><i class="fas fa-check" style="color:#F59E0B;margin-top:2px;flex-shrink:0;"></i> Dedicated AI strategist</li>
              <li style="display:flex;gap:8px;align-items:flex-start;color:#8B8FA8;font-size:13px;"><i class="fas fa-check" style="color:#F59E0B;margin-top:2px;flex-shrink:0;"></i> White-glove onboarding</li>
            </ul>
            <button onclick="startJourney()" class="btn-ghost" style="width:100%;padding:14px;font-size:14px;">
              Talk to Us →
            </button>
          </div>

        </div>
      </div>
    </section>


    <!-- ══════════════════════════════════════════════
         WEBSITE INPUT — Direct CTA
    ══════════════════════════════════════════════ -->
    <section style="padding:80px 24px;position:relative;overflow:hidden;">
      <div style="max-width:640px;margin:0 auto;text-align:center;">
        <span class="pill pill-volt" style="margin-bottom:20px;">Start Now</span>
        <h2 style="font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(28px,4vw,44px);letter-spacing:-0.03em;color:#F0F2FF;margin:16px 0 12px;">
          Enter Your Brand URL.<br/><span class="grad-volt">Let the Agent Begin.</span>
        </h2>
        <p style="color:#8B8FA8;margin-bottom:32px;font-size:16px;">Auxora analyzes your market in seconds. No setup, no credit card.</p>

        <div style="background:#14161F;border-radius:16px;padding:8px;border:1px solid #252840;box-shadow:0 0 40px rgba(124,58,237,0.1);">
          <form id="websiteForm" style="display:flex;gap:8px;">
            <input
              type="text"
              id="websiteInput"
              placeholder="yourbrand.com"
              class="ax-input"
              style="flex:1;border:0;background:transparent;border-radius:10px;padding:14px 18px;"
              required
            />
            <button type="submit" class="btn-primary" style="padding:14px 28px;font-size:15px;white-space:nowrap;border-radius:10px;">
              <i class="fas fa-bolt" style="margin-right:6px;"></i> Analyze
            </button>
          </form>
        </div>

        <div style="display:flex;justify-content:center;gap:20px;margin-top:16px;flex-wrap:wrap;">
          <span style="display:flex;align-items:center;gap:6px;color:#4A4D66;font-size:12px;font-family:'Space Mono',monospace;">
            <i class="fas fa-check" style="color:#10B981;"></i> Free to start
          </span>
          <span style="display:flex;align-items:center;gap:6px;color:#4A4D66;font-size:12px;font-family:'Space Mono',monospace;">
            <i class="fas fa-check" style="color:#10B981;"></i> Results in 10 min
          </span>
          <span style="display:flex;align-items:center;gap:6px;color:#4A4D66;font-size:12px;font-family:'Space Mono',monospace;">
            <i class="fas fa-check" style="color:#10B981;"></i> First report $4.99
          </span>
        </div>
      </div>
    </section>


    <!-- ══════════════════════════════════════════════
         FOOTER
    ══════════════════════════════════════════════ -->
    <div class="gradient-divider"></div>
    <footer style="padding:40px 24px;background:#08090C;">
      <div style="max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;">
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:30px;height:30px;border-radius:8px;background:linear-gradient(135deg,#7C3AED,#D946EF);display:flex;align-items:center;justify-content:center;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <span style="font-family:'Syne',sans-serif;font-weight:800;font-size:16px;color:#F0F2FF;">Auxora</span>
          <span style="color:#4A4D66;font-size:13px;">— The Vibe Business OS</span>
        </div>
        <div style="display:flex;gap:24px;">
          <a href="/login" style="color:#4A4D66;font-size:13px;text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='#8B8FA8'" onmouseout="this.style.color='#4A4D66'">Sign In</a>
          <a href="/register" style="color:#4A4D66;font-size:13px;text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='#8B8FA8'" onmouseout="this.style.color='#4A4D66'">Register</a>
          <span style="color:#4A4D66;font-size:13px;">© 2025 Auxora.ai</span>
        </div>
      </div>
    </footer>


    <!-- ══════════════════════════════════════════════
         VIDEO MODAL
    ══════════════════════════════════════════════ -->
    <div id="videoModal" style="display:none;position:fixed;inset:0;background:rgba(8,9,12,0.95);z-index:1000;align-items:center;justify-content:center;padding:24px;backdrop-filter:blur(12px);">
      <div style="position:relative;width:100%;max-width:900px;">
        <button onclick="closeVideoModal()" style="position:absolute;top:-44px;right:0;background:none;border:none;color:#8B8FA8;font-size:24px;cursor:pointer;transition:color 0.2s;" onmouseover="this.style.color='#A855F7'" onmouseout="this.style.color='#8B8FA8'">
          <i class="fas fa-times"></i>
        </button>
        <div class="card" style="overflow:hidden;padding:0;border-color:rgba(124,58,237,0.3);">
          <div style="aspect-ratio:16/9;">
            <iframe id="videoPlayer" width="100%" height="100%" src="" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          </div>
          <div style="padding:24px;display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div id="videoTitle" style="font-family:'Syne',sans-serif;font-weight:700;font-size:18px;color:#F0F2FF;"></div>
              <div id="videoDescription" style="color:#8B8FA8;font-size:13px;margin-top:4px;"></div>
            </div>
            <button onclick="closeVideoModal()" class="btn-ghost" style="padding:10px 20px;font-size:13px;">Close</button>
          </div>
        </div>
      </div>
    </div>

  </div><!-- /z-index wrapper -->


  <!-- ══════════════════════════════════════════════
       SCRIPTS
  ══════════════════════════════════════════════ -->
  <script>
  // ── Terminal animation ──
  (function animateTerminal() {
    const lines = [
      { el: 'termLine1', delay: 800 },
      { el: 'termLine2', delay: 1600 },
      { el: 'termLine3', delay: 2600 },
      { el: 'termLine4', delay: 3600 },
      { el: 'termLine5', delay: 4800 },
      { el: 'termLine6', delay: 5800 },
      { el: 'termCursor', delay: 6200 },
    ];
    lines.forEach(({ el, delay }) => {
      setTimeout(() => {
        const e = document.getElementById(el);
        if (e) e.style.opacity = '1';
      }, delay);
    });
    // Cursor blink
    setTimeout(() => {
      const cursor = document.getElementById('termCursor');
      if (!cursor) return;
      let visible = true;
      setInterval(() => {
        cursor.style.opacity = (visible = !visible) ? '1' : '0';
      }, 500);
    }, 6200);
  })();

  // ── Video Modal ──
  const videoData = [
    { id: 'nw1XYryhdIU', title: 'Yamabushi Farms', description: 'D2C Brand · 10× Revenue in 2 Months · 3× ROAS' }
  ];

  function openVideoModal(index) {
    const v = videoData[index];
    document.getElementById('videoPlayer').src = 'https://www.youtube.com/embed/' + v.id + '?autoplay=1&rel=0';
    document.getElementById('videoTitle').textContent = v.title;
    document.getElementById('videoDescription').textContent = v.description;
    const modal = document.getElementById('videoModal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
  function closeVideoModal() {
    document.getElementById('videoPlayer').src = '';
    document.getElementById('videoModal').style.display = 'none';
    document.body.style.overflow = '';
  }
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeVideoModal(); });

  // ── Website form ──
  document.getElementById('websiteForm').addEventListener('submit', function(e) {
    e.preventDefault();
    let w = document.getElementById('websiteInput').value.trim();
    if (!w) return;
    if (!w.startsWith('http://') && !w.startsWith('https://')) w = 'https://' + w;
    const user = typeof Storage !== 'undefined' ? Storage.getUser() : null;
    const session = typeof Storage !== 'undefined' ? Storage.getSession() : null;
    if (!user || !session) {
      window.location.href = '/login?returnUrl=' + encodeURIComponent('/report-preview?website=' + encodeURIComponent(w));
      return;
    }
    window.location.href = '/report-preview?website=' + encodeURIComponent(w);
  });

  // ── Start journey ──
  function startInterview() {
    const u = localStorage.getItem('auxora_user');
    window.location.href = u ? '/dashboard' : '/static/login.html';
  }
  function startJourney() { startInterview(); }

  // ── Smooth scroll for anchor links ──
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });
  </script>

  <script src="/static/modal-utils.js"></script>
  <script src="/static/app.js"></script>
</body>
</html>
`;
