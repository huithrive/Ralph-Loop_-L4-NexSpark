// D2C-Focused Landing Page
// Warm, friendly, light background design for Direct-to-Consumer brands

export const REVISED_LANDING_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NexSpark | AI Growth Strategy for D2C Brands</title>
    <meta name="description" content="Get your personalized D2C growth strategy in minutes. AI-powered insights trusted by direct-to-consumer brands. Start for just $4.99.">

    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet">

    <!-- Shared Modules -->
    <script src="/static/shared/storage.js"></script>

    <script>
      tailwind.config = {
        theme: {
          extend: {
            fontFamily: {
              sans: ['Inter', 'sans-serif'],
              display: ['Playfair Display', 'serif'],
            },
            colors: {
              brand: {
                orange:   '#F97316',
                orangeL:  '#FFEDD5',
                coral:    '#FB7185',
                rose:     '#FFF1F2',
                amber:    '#F59E0B',
                amberL:   '#FFFBEB',
                warm:     '#FDF8F4',
                cream:    '#FEFCE8',
                text:     '#1C1917',
                muted:    '#78716C',
                border:   '#E7E5E4',
                green:    '#22C55E',
                greenL:   '#F0FDF4',
                teal:     '#0EA5E9',
                tealL:    '#F0F9FF',
              }
            }
          }
        }
      }
    </script>

    <style>
      * { box-sizing: border-box; }
      body {
        background-color: #FAFAF9;
        color: #1C1917;
        font-family: 'Inter', sans-serif;
        overflow-x: hidden;
      }

      /* Smooth scroll */
      html { scroll-behavior: smooth; }

      /* Scrollbar */
      ::-webkit-scrollbar { width: 8px; }
      ::-webkit-scrollbar-track { background: #F5F5F4; }
      ::-webkit-scrollbar-thumb { background: #F97316; border-radius: 4px; }

      /* Gradient hero background */
      .hero-bg {
        background: linear-gradient(135deg, #FFF7ED 0%, #FEF3C7 30%, #FCE7F3 60%, #EFF6FF 100%);
      }

      /* Wavy divider */
      .wave-divider {
        width: 100%;
        overflow: hidden;
        line-height: 0;
        transform: rotate(180deg);
      }
      .wave-divider svg {
        display: block;
        width: calc(100% + 1.3px);
        height: 60px;
      }
      .wave-divider .shape-fill { fill: #FAFAF9; }

      /* Card hover effect */
      .card-hover {
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      .card-hover:hover {
        transform: translateY(-4px);
        box-shadow: 0 20px 40px rgba(0,0,0,0.08);
      }

      /* CTA gradient button */
      .btn-primary {
        background: linear-gradient(135deg, #F97316, #FB7185);
        color: white;
        font-weight: 700;
        transition: all 0.2s ease;
        box-shadow: 0 4px 15px rgba(249, 115, 22, 0.35);
      }
      .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(249, 115, 22, 0.45);
      }

      /* Badge pill */
      .pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 14px;
        border-radius: 999px;
        font-size: 13px;
        font-weight: 600;
      }

      /* Stat counter */
      .stat-card {
        background: white;
        border-radius: 16px;
        padding: 24px;
        text-align: center;
        border: 1px solid #E7E5E4;
        box-shadow: 0 2px 8px rgba(0,0,0,0.04);
      }

      /* Steps connector line */
      .step-connector {
        position: absolute;
        top: 32px;
        left: calc(50% + 40px);
        width: calc(100% - 80px);
        height: 2px;
        background: linear-gradient(to right, #F97316, #FB7185);
        opacity: 0.3;
      }

      /* Testimonial card */
      .testimonial-card {
        background: white;
        border-radius: 20px;
        padding: 28px;
        border: 1px solid #E7E5E4;
        box-shadow: 0 4px 16px rgba(0,0,0,0.05);
        position: relative;
      }
      .testimonial-card::before {
        content: '"';
        position: absolute;
        top: 12px;
        left: 20px;
        font-size: 80px;
        line-height: 1;
        color: #F97316;
        opacity: 0.15;
        font-family: 'Playfair Display', serif;
      }

      /* Input style */
      .website-input {
        border: 2px solid #E7E5E4;
        background: white;
        border-radius: 12px;
        padding: 16px 20px;
        font-size: 16px;
        width: 100%;
        transition: border-color 0.2s;
        outline: none;
      }
      .website-input:focus {
        border-color: #F97316;
        box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.1);
      }

      /* Price badge */
      .price-badge {
        background: linear-gradient(135deg, #F97316, #FB7185);
        color: white;
        font-weight: 800;
        font-size: 20px;
        padding: 6px 18px;
        border-radius: 999px;
        display: inline-block;
      }

      /* Floating animation */
      @keyframes floatUp {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-8px); }
      }
      .float-anim { animation: floatUp 4s ease-in-out infinite; }

      /* Fade in animation */
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .fade-in { animation: fadeIn 0.6s ease forwards; }
      .fade-in-delay-1 { animation-delay: 0.1s; opacity: 0; }
      .fade-in-delay-2 { animation-delay: 0.2s; opacity: 0; }
      .fade-in-delay-3 { animation-delay: 0.3s; opacity: 0; }

      /* Checkmark list */
      .check-list li {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        margin-bottom: 10px;
        font-size: 15px;
        color: #44403C;
      }
      .check-list li .icon {
        color: #22C55E;
        font-size: 14px;
        margin-top: 3px;
        flex-shrink: 0;
      }

      /* Section title underline */
      .section-title::after {
        content: '';
        display: block;
        width: 60px;
        height: 4px;
        background: linear-gradient(to right, #F97316, #FB7185);
        border-radius: 2px;
        margin: 12px auto 0;
      }
    </style>
</head>
<body>

    <!-- ========== NAVBAR ========== -->
    <nav class="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-brand-border">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div class="flex items-center gap-2">
                <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-orange to-brand-coral flex items-center justify-center">
                    <i class="fas fa-bolt text-white text-sm"></i>
                </div>
                <span class="text-xl font-bold text-brand-text tracking-tight">NexSpark</span>
                <span class="pill bg-brand-orangeL text-brand-orange text-xs ml-1 hidden sm:inline-flex">For D2C Brands</span>
            </div>
            <div class="flex items-center gap-3">
                <a href="/login" class="text-brand-muted hover:text-brand-text font-medium text-sm transition-colors hidden sm:block">Sign In</a>
                <button onclick="startInterview()" class="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold">
                    Get Started Free
                </button>
            </div>
        </div>
    </nav>

    <!-- ========== HERO ========== -->
    <section class="hero-bg pt-28 pb-16 px-4 relative overflow-hidden">
        <!-- Decorative circles -->
        <div class="absolute top-20 right-10 w-64 h-64 rounded-full bg-brand-orange/10 blur-3xl pointer-events-none"></div>
        <div class="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-brand-coral/10 blur-3xl pointer-events-none"></div>

        <div class="max-w-6xl mx-auto">
            <div class="flex flex-col lg:flex-row items-center gap-12">

                <!-- Left: Copy -->
                <div class="flex-1 text-center lg:text-left">
                    <!-- Trust badge -->
                    <div class="inline-flex items-center gap-2 bg-white border border-brand-border rounded-full px-4 py-2 text-sm font-medium text-brand-muted mb-6 shadow-sm fade-in fade-in-delay-1">
                        <span class="flex items-center gap-1 text-brand-orange font-semibold">
                            <i class="fas fa-star text-xs"></i> D2C Brand Growth Specialists
                        </span>
                        <span class="w-px h-4 bg-brand-border"></span>
                        <span>Trusted by 200+ brands</span>
                    </div>

                    <h1 class="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-brand-text leading-tight mb-6 fade-in fade-in-delay-1">
                        Grow Your <span class="text-brand-orange">D2C Brand</span><br/>
                        <span class="text-brand-coral">10× Faster</span> with AI
                    </h1>

                    <p class="text-lg sm:text-xl text-brand-muted leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0 fade-in fade-in-delay-2">
                        Get a personalized growth strategy built for <strong class="text-brand-text">direct-to-consumer brands</strong> — covering ads, channels, budget, and a 6-month roadmap. In minutes, not months.
                    </p>

                    <!-- Website input -->
                    <div class="bg-white rounded-2xl p-2 shadow-lg border border-brand-border max-w-xl mx-auto lg:mx-0 mb-6 fade-in fade-in-delay-2">
                        <form id="websiteForm" class="flex gap-2">
                            <input
                                type="text"
                                id="websiteInput"
                                placeholder="Enter your website (e.g. mybrand.com)"
                                class="website-input border-0 shadow-none flex-1 py-3"
                                required
                            />
                            <button type="submit" class="btn-primary px-6 py-3 rounded-xl whitespace-nowrap font-semibold flex items-center gap-2">
                                <i class="fas fa-bolt text-sm"></i>
                                <span class="hidden sm:inline">Analyze</span>
                            </button>
                        </form>
                    </div>

                    <!-- Social proof -->
                    <div class="flex items-center justify-center lg:justify-start gap-4 text-sm text-brand-muted fade-in fade-in-delay-3">
                        <div class="flex items-center gap-1">
                            <i class="fas fa-check-circle text-brand-green text-xs"></i>
                            <span>No credit card to start</span>
                        </div>
                        <div class="flex items-center gap-1">
                            <i class="fas fa-check-circle text-brand-green text-xs"></i>
                            <span>Results in 10 min</span>
                        </div>
                        <div class="flex items-center gap-1">
                            <i class="fas fa-check-circle text-brand-green text-xs"></i>
                            <span>First report $4.99</span>
                        </div>
                    </div>
                </div>

                <!-- Right: Hero Card -->
                <div class="flex-1 max-w-md w-full fade-in fade-in-delay-2">
                    <div class="bg-white rounded-3xl shadow-xl border border-brand-border p-6 relative float-anim">
                        <!-- Card header -->
                        <div class="flex items-center justify-between mb-5">
                            <div class="flex items-center gap-2">
                                <div class="w-8 h-8 rounded-lg bg-brand-greenL flex items-center justify-center">
                                    <i class="fas fa-chart-line text-brand-green text-sm"></i>
                                </div>
                                <span class="font-semibold text-sm text-brand-text">Your Growth Dashboard</span>
                            </div>
                            <span class="pill bg-brand-greenL text-brand-green text-xs">
                                <span class="w-1.5 h-1.5 rounded-full bg-brand-green"></span>
                                Live
                            </span>
                        </div>

                        <!-- Metrics grid -->
                        <div class="grid grid-cols-3 gap-3 mb-5">
                            <div class="bg-brand-orangeL rounded-xl p-3 text-center">
                                <div class="text-2xl font-bold text-brand-orange">10×</div>
                                <div class="text-xs text-brand-muted mt-0.5">Revenue</div>
                            </div>
                            <div class="bg-brand-rose rounded-xl p-3 text-center">
                                <div class="text-2xl font-bold text-brand-coral">3×</div>
                                <div class="text-xs text-brand-muted mt-0.5">ROAS</div>
                            </div>
                            <div class="bg-brand-greenL rounded-xl p-3 text-center">
                                <div class="text-2xl font-bold text-brand-green">6mo</div>
                                <div class="text-xs text-brand-muted mt-0.5">Roadmap</div>
                            </div>
                        </div>

                        <!-- Progress bars -->
                        <div class="space-y-3 mb-5">
                            <div>
                                <div class="flex justify-between text-xs text-brand-muted mb-1">
                                    <span>Meta Ads Performance</span>
                                    <span class="text-brand-orange font-semibold">+340%</span>
                                </div>
                                <div class="h-2 bg-brand-orangeL rounded-full">
                                    <div class="h-2 bg-gradient-to-r from-brand-orange to-brand-coral rounded-full" style="width: 78%"></div>
                                </div>
                            </div>
                            <div>
                                <div class="flex justify-between text-xs text-brand-muted mb-1">
                                    <span>Customer Acquisition</span>
                                    <span class="text-brand-green font-semibold">-62% CAC</span>
                                </div>
                                <div class="h-2 bg-brand-greenL rounded-full">
                                    <div class="h-2 bg-brand-green rounded-full" style="width: 62%"></div>
                                </div>
                            </div>
                            <div>
                                <div class="flex justify-between text-xs text-brand-muted mb-1">
                                    <span>Revenue Growth</span>
                                    <span class="text-brand-teal font-semibold">+$48K/mo</span>
                                </div>
                                <div class="h-2 bg-brand-tealL rounded-full">
                                    <div class="h-2 bg-brand-teal rounded-full" style="width: 90%"></div>
                                </div>
                            </div>
                        </div>

                        <!-- Bottom note -->
                        <div class="bg-brand-amberL rounded-xl p-3 flex items-center gap-2">
                            <i class="fas fa-award text-brand-amber text-base"></i>
                            <span class="text-xs text-brand-muted font-medium">Based on real NexSpark client results</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </section>

    <!-- Stats bar -->
    <section class="bg-white border-b border-brand-border py-8 px-4">
        <div class="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
            <div class="text-center">
                <div class="text-3xl font-bold text-brand-orange mb-1">200+</div>
                <div class="text-sm text-brand-muted">D2C Brands Served</div>
            </div>
            <div class="text-center">
                <div class="text-3xl font-bold text-brand-coral mb-1">10×</div>
                <div class="text-sm text-brand-muted">Avg Revenue Growth</div>
            </div>
            <div class="text-center">
                <div class="text-3xl font-bold text-brand-green mb-1">10 min</div>
                <div class="text-sm text-brand-muted">To Your Strategy</div>
            </div>
            <div class="text-center">
                <div class="text-3xl font-bold text-brand-text mb-1"><span class="price-badge">$4.99</span></div>
                <div class="text-sm text-brand-muted mt-1">First Report</div>
            </div>
        </div>
    </section>

    <!-- ========== WHO IT'S FOR ========== -->
    <section class="py-20 px-4 bg-brand-warm">
        <div class="max-w-6xl mx-auto">
            <div class="text-center mb-14">
                <span class="pill bg-brand-orangeL text-brand-orange mb-3">
                    <i class="fas fa-heart text-xs"></i> Built for You
                </span>
                <h2 class="text-3xl sm:text-4xl font-display font-bold text-brand-text section-title">
                    Made for D2C Brand Owners
                </h2>
                <p class="text-brand-muted mt-4 max-w-lg mx-auto text-base">
                    Whether you're launching your first product or scaling to $1M+, NexSpark gives you a clear path forward.
                </p>
            </div>

            <div class="grid md:grid-cols-3 gap-6">
                <!-- Card 1 -->
                <div class="card-hover bg-white rounded-2xl p-6 border border-brand-border">
                    <div class="w-12 h-12 rounded-2xl bg-brand-orangeL flex items-center justify-center mb-4">
                        <i class="fas fa-seedling text-brand-orange text-xl"></i>
                    </div>
                    <h3 class="text-lg font-bold text-brand-text mb-2">Just Starting Out?</h3>
                    <p class="text-brand-muted text-sm leading-relaxed mb-4">
                        Validate your product idea, understand your ideal customer, and choose the right channel to launch without wasting budget.
                    </p>
                    <ul class="check-list">
                        <li><i class="fas fa-check-circle icon"></i> Market validation report</li>
                        <li><i class="fas fa-check-circle icon"></i> Competitor analysis</li>
                        <li><i class="fas fa-check-circle icon"></i> First $10K roadmap</li>
                    </ul>
                </div>

                <!-- Card 2 -->
                <div class="card-hover bg-gradient-to-br from-brand-orange to-brand-coral rounded-2xl p-6 text-white relative overflow-hidden">
                    <div class="absolute top-3 right-3">
                        <span class="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">Most Popular</span>
                    </div>
                    <div class="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
                        <i class="fas fa-rocket text-white text-xl"></i>
                    </div>
                    <h3 class="text-lg font-bold mb-2">Ready to Scale?</h3>
                    <p class="text-white/85 text-sm leading-relaxed mb-4">
                        You have a proven product. Now get a data-driven strategy to 3× your revenue in the next 90 days with paid social and search.
                    </p>
                    <ul class="check-list">
                        <li><i class="fas fa-check-circle icon" style="color:#fff"></i> <span style="color:#ffe4d6">Meta + Google ads blueprint</span></li>
                        <li><i class="fas fa-check-circle icon" style="color:#fff"></i> <span style="color:#ffe4d6">CAC/LTV optimization</span></li>
                        <li><i class="fas fa-check-circle icon" style="color:#fff"></i> <span style="color:#ffe4d6">6-month GTM plan</span></li>
                    </ul>
                </div>

                <!-- Card 3 -->
                <div class="card-hover bg-white rounded-2xl p-6 border border-brand-border">
                    <div class="w-12 h-12 rounded-2xl bg-brand-greenL flex items-center justify-center mb-4">
                        <i class="fas fa-chart-bar text-brand-green text-xl"></i>
                    </div>
                    <h3 class="text-lg font-bold text-brand-text mb-2">Hitting a Growth Wall?</h3>
                    <p class="text-brand-muted text-sm leading-relaxed mb-4">
                        Ads aren't converting? CAC too high? Get an AI audit of your current strategy and a clear plan to fix what's broken.
                    </p>
                    <ul class="check-list">
                        <li><i class="fas fa-check-circle icon"></i> Full performance audit</li>
                        <li><i class="fas fa-check-circle icon"></i> Channel rebalancing plan</li>
                        <li><i class="fas fa-check-circle icon"></i> Profitability analysis</li>
                    </ul>
                </div>
            </div>
        </div>
    </section>

    <!-- ========== HOW IT WORKS ========== -->
    <section class="py-20 px-4 bg-white">
        <div class="max-w-6xl mx-auto">
            <div class="text-center mb-14">
                <span class="pill bg-brand-tealL text-brand-teal mb-3">
                    <i class="fas fa-magic text-xs"></i> Simple Process
                </span>
                <h2 class="text-3xl sm:text-4xl font-display font-bold text-brand-text section-title">
                    From Zero to Strategy in 3 Steps
                </h2>
            </div>

            <div class="grid md:grid-cols-3 gap-8 relative">

                <!-- Step 1 -->
                <div class="text-center relative">
                    <div class="w-16 h-16 rounded-2xl bg-brand-orangeL mx-auto mb-5 flex items-center justify-center">
                        <i class="fas fa-microphone text-brand-orange text-2xl"></i>
                    </div>
                    <div class="inline-block bg-brand-orange text-white text-xs font-bold px-3 py-1 rounded-full mb-3">Step 1</div>
                    <h3 class="text-xl font-bold text-brand-text mb-3">Tell Us About Your Brand</h3>
                    <p class="text-brand-muted text-sm leading-relaxed">
                        A quick 10-minute AI-powered interview. No jargon, no forms. Just tell us about your products, goals, and customers in plain English.
                    </p>
                </div>

                <!-- Connector (hidden on mobile) -->
                <div class="hidden md:flex items-start justify-center relative">
                    <div class="absolute top-7 left-0 right-0 h-px bg-gradient-to-r from-brand-orangeL via-brand-orange to-brand-coral opacity-40"></div>
                    <div class="w-16 h-16 rounded-2xl bg-brand-rose mx-auto mb-5 flex items-center justify-center relative z-10">
                        <i class="fas fa-brain text-brand-coral text-2xl"></i>
                    </div>
                </div>
                <div class="md:hidden text-center relative">
                    <div class="w-16 h-16 rounded-2xl bg-brand-rose mx-auto mb-5 flex items-center justify-center">
                        <i class="fas fa-brain text-brand-coral text-2xl"></i>
                    </div>
                    <div class="inline-block bg-brand-coral text-white text-xs font-bold px-3 py-1 rounded-full mb-3">Step 2</div>
                    <h3 class="text-xl font-bold text-brand-text mb-3">AI Builds Your Strategy</h3>
                    <p class="text-brand-muted text-sm leading-relaxed">
                        Our AI analyzes your competitors, market size, and best channels — then generates a custom 6-month growth plan just for you.
                    </p>
                </div>

            </div>

            <!-- Step row for desktop, restructured for clarity -->
            <div class="hidden md:grid md:grid-cols-3 gap-8 mt-6">
                <div class="text-center">
                    <!-- empty, step 1 desc above -->
                </div>
                <div class="text-center">
                    <div class="inline-block bg-brand-coral text-white text-xs font-bold px-3 py-1 rounded-full mb-3">Step 2</div>
                    <h3 class="text-xl font-bold text-brand-text mb-3">AI Builds Your Strategy</h3>
                    <p class="text-brand-muted text-sm leading-relaxed">
                        Our AI analyzes your competitors, market size, and best channels — then generates a custom 6-month growth plan just for you.
                    </p>
                </div>
                <div class="text-center">
                    <div class="w-16 h-16 rounded-2xl bg-brand-greenL mx-auto mb-5 flex items-center justify-center">
                        <i class="fas fa-file-chart-line text-brand-green text-2xl"></i>
                    </div>
                    <div class="inline-block bg-brand-green text-white text-xs font-bold px-3 py-1 rounded-full mb-3">Step 3</div>
                    <h3 class="text-xl font-bold text-brand-text mb-3">Get Your Report for $4.99</h3>
                    <p class="text-brand-muted text-sm leading-relaxed">
                        Unlock your full strategy report — with channel breakdowns, budget recommendations, and a step-by-step execution plan.
                    </p>
                </div>
            </div>
            <!-- Step 3 mobile -->
            <div class="md:hidden text-center mt-6">
                <div class="w-16 h-16 rounded-2xl bg-brand-greenL mx-auto mb-5 flex items-center justify-center">
                    <i class="fas fa-file-chart-line text-brand-green text-2xl"></i>
                </div>
                <div class="inline-block bg-brand-green text-white text-xs font-bold px-3 py-1 rounded-full mb-3">Step 3</div>
                <h3 class="text-xl font-bold text-brand-text mb-3">Get Your Report for $4.99</h3>
                <p class="text-brand-muted text-sm leading-relaxed">
                    Unlock your full strategy report — with channel breakdowns, budget recommendations, and a step-by-step execution plan.
                </p>
            </div>

            <div class="text-center mt-12">
                <button onclick="startInterview()" class="btn-primary px-10 py-4 rounded-2xl text-lg inline-flex items-center gap-3">
                    <i class="fas fa-rocket"></i>
                    Start My Free Analysis
                </button>
                <p class="text-brand-muted text-sm mt-3">
                    <i class="fas fa-lock text-xs mr-1"></i> Free to start · Full report just $4.99
                </p>
            </div>
        </div>
    </section>

    <!-- ========== SUCCESS STORY ========== -->
    <section id="proven-results" class="py-20 px-4 bg-brand-warm">
        <div class="max-w-6xl mx-auto">
            <div class="text-center mb-14">
                <span class="pill bg-brand-amberL text-brand-amber mb-3">
                    <i class="fas fa-trophy text-xs"></i> Real Results
                </span>
                <h2 class="text-3xl sm:text-4xl font-display font-bold text-brand-text section-title">
                    D2C Brands Love NexSpark
                </h2>
                <p class="text-brand-muted mt-4 max-w-lg mx-auto text-base">
                    See how real brands transformed their growth with AI-powered strategy.
                </p>
            </div>

            <!-- Case Study Card -->
            <div class="max-w-3xl mx-auto">
                <div class="card-hover bg-white rounded-3xl overflow-hidden border border-brand-border shadow-lg cursor-pointer" onclick="openVideoModal(0)">
                    <!-- Video Thumbnail -->
                    <div class="aspect-video relative bg-brand-orangeL overflow-hidden">
                        <img
                            src="https://img.youtube.com/vi/nw1XYryhdIU/maxresdefault.jpg"
                            alt="Yamabushi Farms Success Story"
                            class="w-full h-full object-cover"
                        />
                        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        <!-- Play button -->
                        <div class="absolute inset-0 flex items-center justify-center">
                            <div class="w-20 h-20 rounded-full bg-white/95 flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
                                <i class="fas fa-play text-brand-orange text-2xl ml-1"></i>
                            </div>
                        </div>
                        <!-- D2C Badge -->
                        <div class="absolute top-4 left-4">
                            <span class="bg-brand-orange text-white px-4 py-1.5 rounded-full font-semibold text-sm shadow-lg">
                                🛒 D2C Brand Story
                            </span>
                        </div>
                    </div>

                    <!-- Card Body -->
                    <div class="p-8">
                        <h3 class="text-2xl font-display font-bold text-brand-text mb-2">Yamabushi Farms</h3>
                        <p class="text-brand-muted text-sm mb-6">Japanese heritage D2C brand selling premium wellness products</p>

                        <div class="grid grid-cols-3 gap-4 mb-6">
                            <div class="text-center bg-brand-orangeL rounded-xl p-4">
                                <div class="text-3xl font-bold text-brand-orange">10×</div>
                                <div class="text-xs text-brand-muted mt-1">Revenue<br/>in 2 months</div>
                            </div>
                            <div class="text-center bg-brand-rose rounded-xl p-4">
                                <div class="text-3xl font-bold text-brand-coral">3×</div>
                                <div class="text-xs text-brand-muted mt-1">ROAS<br/>in 1 month</div>
                            </div>
                            <div class="text-center bg-brand-greenL rounded-xl p-4">
                                <div class="text-3xl font-bold text-brand-green">62%</div>
                                <div class="text-xs text-brand-muted mt-1">CAC<br/>reduction</div>
                            </div>
                        </div>

                        <div class="flex items-center justify-between pt-4 border-t border-brand-border">
                            <div class="flex items-center gap-2 text-sm text-brand-muted">
                                <i class="fas fa-tag text-xs text-brand-orange"></i>
                                <span>D2C CPG • Wellness Products</span>
                            </div>
                            <div class="flex items-center gap-2 text-brand-orange font-semibold text-sm">
                                <i class="fas fa-play-circle"></i>
                                Watch Story
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Testimonials -->
            <div class="grid md:grid-cols-2 gap-6 mt-10 max-w-3xl mx-auto">
                <div class="testimonial-card">
                    <div class="flex items-center gap-3 mb-4 relative z-10">
                        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-brand-orange to-brand-coral flex items-center justify-center text-white font-bold text-sm">
                            S
                        </div>
                        <div>
                            <div class="font-semibold text-sm text-brand-text">Sarah K.</div>
                            <div class="text-xs text-brand-muted">Skincare D2C Founder</div>
                        </div>
                        <div class="ml-auto flex gap-0.5">
                            <i class="fas fa-star text-brand-amber text-xs"></i>
                            <i class="fas fa-star text-brand-amber text-xs"></i>
                            <i class="fas fa-star text-brand-amber text-xs"></i>
                            <i class="fas fa-star text-brand-amber text-xs"></i>
                            <i class="fas fa-star text-brand-amber text-xs"></i>
                        </div>
                    </div>
                    <p class="text-brand-muted text-sm leading-relaxed relative z-10">
                        "I was spending $5K/mo on ads with almost no return. NexSpark identified exactly where my budget was leaking. Turned it around in 6 weeks."
                    </p>
                </div>
                <div class="testimonial-card">
                    <div class="flex items-center gap-3 mb-4 relative z-10">
                        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-brand-teal to-brand-green flex items-center justify-center text-white font-bold text-sm">
                            M
                        </div>
                        <div>
                            <div class="font-semibold text-sm text-brand-text">Marcus T.</div>
                            <div class="text-xs text-brand-muted">Pet Accessories Brand</div>
                        </div>
                        <div class="ml-auto flex gap-0.5">
                            <i class="fas fa-star text-brand-amber text-xs"></i>
                            <i class="fas fa-star text-brand-amber text-xs"></i>
                            <i class="fas fa-star text-brand-amber text-xs"></i>
                            <i class="fas fa-star text-brand-amber text-xs"></i>
                            <i class="fas fa-star text-brand-amber text-xs"></i>
                        </div>
                    </div>
                    <p class="text-brand-muted text-sm leading-relaxed relative z-10">
                        "The $4.99 strategy report was the best money I've ever spent on marketing. It gave me a roadmap that actually made sense for my stage."
                    </p>
                </div>
            </div>
        </div>
    </section>

    <!-- ========== WHAT'S IN THE REPORT ========== -->
    <section class="py-20 px-4 bg-white">
        <div class="max-w-6xl mx-auto">
            <div class="flex flex-col lg:flex-row gap-12 items-center">
                <!-- Left -->
                <div class="flex-1">
                    <span class="pill bg-brand-orangeL text-brand-orange mb-4">
                        <i class="fas fa-file-alt text-xs"></i> What You Get
                    </span>
                    <h2 class="text-3xl sm:text-4xl font-display font-bold text-brand-text mb-6">
                        Your Complete D2C<br/>
                        <span class="text-brand-orange">Growth Strategy Report</span>
                    </h2>
                    <p class="text-brand-muted text-base leading-relaxed mb-8">
                        For just $4.99, get a full strategic playbook tailored to your brand — the same quality you'd pay an agency $5,000+ to produce.
                    </p>

                    <div class="space-y-4">
                        <div class="flex items-start gap-4 p-4 rounded-xl bg-brand-warm border border-brand-border">
                            <div class="w-10 h-10 rounded-xl bg-brand-orangeL flex items-center justify-center flex-shrink-0">
                                <i class="fas fa-search text-brand-orange"></i>
                            </div>
                            <div>
                                <div class="font-semibold text-brand-text mb-0.5">Competitor Intelligence</div>
                                <div class="text-sm text-brand-muted">Top 5 competitors analyzed — their traffic, ads, and what's working</div>
                            </div>
                        </div>
                        <div class="flex items-start gap-4 p-4 rounded-xl bg-brand-warm border border-brand-border">
                            <div class="w-10 h-10 rounded-xl bg-brand-rose flex items-center justify-center flex-shrink-0">
                                <i class="fas fa-users text-brand-coral"></i>
                            </div>
                            <div>
                                <div class="font-semibold text-brand-text mb-0.5">Customer Profile & Targeting</div>
                                <div class="text-sm text-brand-muted">Detailed personas with platform targeting parameters for Meta & Google</div>
                            </div>
                        </div>
                        <div class="flex items-start gap-4 p-4 rounded-xl bg-brand-warm border border-brand-border">
                            <div class="w-10 h-10 rounded-xl bg-brand-amberL flex items-center justify-center flex-shrink-0">
                                <i class="fas fa-dollar-sign text-brand-amber"></i>
                            </div>
                            <div>
                                <div class="font-semibold text-brand-text mb-0.5">Budget & CAC Projections</div>
                                <div class="text-sm text-brand-muted">Recommended spend per channel with expected CAC and LTV modelling</div>
                            </div>
                        </div>
                        <div class="flex items-start gap-4 p-4 rounded-xl bg-brand-warm border border-brand-border">
                            <div class="w-10 h-10 rounded-xl bg-brand-greenL flex items-center justify-center flex-shrink-0">
                                <i class="fas fa-map text-brand-green"></i>
                            </div>
                            <div>
                                <div class="font-semibold text-brand-text mb-0.5">6-Month Execution Roadmap</div>
                                <div class="text-sm text-brand-muted">Week-by-week action plan from launch to profitable scale</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right: Price CTA -->
                <div class="flex-1 max-w-sm w-full mx-auto">
                    <div class="bg-gradient-to-br from-brand-orange to-brand-coral rounded-3xl p-8 text-white text-center shadow-xl relative overflow-hidden">
                        <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                        <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>

                        <div class="relative z-10">
                            <div class="text-white/80 text-sm font-medium mb-2">First D2C Strategy Report</div>
                            <div class="text-6xl font-bold mb-1">$4.99</div>
                            <div class="text-white/70 text-sm mb-8">One-time · Instant delivery</div>

                            <ul class="text-left space-y-3 mb-8">
                                <li class="flex items-center gap-2 text-sm">
                                    <i class="fas fa-check-circle text-white"></i> Full competitor analysis
                                </li>
                                <li class="flex items-center gap-2 text-sm">
                                    <i class="fas fa-check-circle text-white"></i> Custom audience targeting
                                </li>
                                <li class="flex items-center gap-2 text-sm">
                                    <i class="fas fa-check-circle text-white"></i> Channel & budget plan
                                </li>
                                <li class="flex items-center gap-2 text-sm">
                                    <i class="fas fa-check-circle text-white"></i> 6-month GTM roadmap
                                </li>
                                <li class="flex items-center gap-2 text-sm">
                                    <i class="fas fa-check-circle text-white"></i> PDF download + email
                                </li>
                            </ul>

                            <button onclick="startInterview()" class="w-full bg-white text-brand-orange font-bold py-4 rounded-2xl text-lg hover:bg-brand-orangeL transition-colors shadow-lg">
                                Get My Strategy →
                            </button>

                            <p class="text-white/60 text-xs mt-4">
                                <i class="fas fa-shield-alt mr-1"></i> Secure payment via Stripe
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- ========== FAQ ========== -->
    <section class="py-20 px-4 bg-brand-warm">
        <div class="max-w-3xl mx-auto">
            <div class="text-center mb-12">
                <h2 class="text-3xl sm:text-4xl font-display font-bold text-brand-text section-title">
                    Common Questions
                </h2>
            </div>
            <div class="space-y-4">
                <details class="bg-white rounded-2xl border border-brand-border p-6 group cursor-pointer">
                    <summary class="flex justify-between items-center font-semibold text-brand-text list-none">
                        What makes NexSpark different from a marketing agency?
                        <i class="fas fa-plus text-brand-orange group-open:rotate-45 transition-transform"></i>
                    </summary>
                    <p class="text-brand-muted text-sm mt-4 leading-relaxed">
                        Traditional agencies charge $5,000–$20,000 for a strategy that takes weeks. NexSpark delivers the same quality in 10 minutes for $4.99. We use AI trained on $100M+ in D2C ad spend data to give you insights that are actually actionable.
                    </p>
                </details>
                <details class="bg-white rounded-2xl border border-brand-border p-6 group cursor-pointer">
                    <summary class="flex justify-between items-center font-semibold text-brand-text list-none">
                        Do I need to connect my ad accounts?
                        <i class="fas fa-plus text-brand-orange group-open:rotate-45 transition-transform"></i>
                    </summary>
                    <p class="text-brand-muted text-sm mt-4 leading-relaxed">
                        No! You just answer a few questions about your brand and goals. No API keys, no ad account access, no technical setup required. We build your strategy from your answers and market research.
                    </p>
                </details>
                <details class="bg-white rounded-2xl border border-brand-border p-6 group cursor-pointer">
                    <summary class="flex justify-between items-center font-semibold text-brand-text list-none">
                        How quickly will I get my report?
                        <i class="fas fa-plus text-brand-orange group-open:rotate-45 transition-transform"></i>
                    </summary>
                    <p class="text-brand-muted text-sm mt-4 leading-relaxed">
                        After your 10-minute interview and payment, your report is generated in 2–3 minutes. You can stay on the page to watch it generate live, or we'll email it to you the moment it's ready.
                    </p>
                </details>
                <details class="bg-white rounded-2xl border border-brand-border p-6 group cursor-pointer">
                    <summary class="flex justify-between items-center font-semibold text-brand-text list-none">
                        Is it really only $4.99?
                        <i class="fas fa-plus text-brand-orange group-open:rotate-45 transition-transform"></i>
                    </summary>
                    <p class="text-brand-muted text-sm mt-4 leading-relaxed">
                        Yes — $4.99 for your first full D2C strategy report. It's intentionally affordable so you can see the quality before committing to anything bigger. No subscriptions, no hidden fees.
                    </p>
                </details>
            </div>
        </div>
    </section>

    <!-- ========== FINAL CTA ========== -->
    <section class="py-20 px-4 bg-white">
        <div class="max-w-3xl mx-auto text-center">
            <div class="bg-gradient-to-br from-brand-orangeL via-brand-rose to-brand-amberL rounded-3xl p-12 border border-brand-border shadow-lg">
                <div class="text-5xl mb-4">🚀</div>
                <h2 class="text-3xl sm:text-4xl font-display font-bold text-brand-text mb-4">
                    Ready to Grow Your D2C Brand?
                </h2>
                <p class="text-brand-muted text-lg mb-8 max-w-md mx-auto">
                    Join 200+ D2C brands who've used NexSpark to find their path to profitable growth.
                </p>
                <button onclick="startInterview()" class="btn-primary px-12 py-5 rounded-2xl text-xl inline-flex items-center gap-3 mx-auto">
                    <i class="fas fa-rocket"></i>
                    Start for Free
                </button>
                <p class="text-brand-muted text-sm mt-4">
                    Free to start · First strategy report just $4.99
                </p>
            </div>
        </div>
    </section>

    <!-- ========== FOOTER ========== -->
    <footer class="bg-brand-text text-white py-10 px-4">
        <div class="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-orange to-brand-coral flex items-center justify-center">
                    <i class="fas fa-bolt text-white text-xs"></i>
                </div>
                <span class="font-bold">NexSpark</span>
                <span class="text-white/40 text-sm">— AI Growth for D2C Brands</span>
            </div>
            <div class="flex items-center gap-6 text-sm text-white/50">
                <a href="/login" class="hover:text-white transition-colors">Sign In</a>
                <a href="/register" class="hover:text-white transition-colors">Register</a>
            </div>
        </div>
    </footer>

    <!-- ========== VIDEO MODAL ========== -->
    <div id="videoModal" class="hidden fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
        <div class="relative w-full max-w-4xl">
            <button onclick="closeVideoModal()" class="absolute -top-12 right-0 text-white hover:text-brand-orange transition-colors text-3xl">
                <i class="fas fa-times"></i>
            </button>
            <div class="bg-white rounded-3xl overflow-hidden shadow-2xl">
                <div class="aspect-video">
                    <iframe id="videoPlayer" width="100%" height="100%" src="" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </div>
                <div class="p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 id="videoTitle" class="text-xl font-bold text-brand-text"></h3>
                            <p id="videoDescription" class="text-brand-muted text-sm mt-1"></p>
                        </div>
                        <button onclick="closeVideoModal()" class="btn-primary px-6 py-2.5 rounded-xl text-sm">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
    // Video Modal
    const videoData = [
        {
            id: 'nw1XYryhdIU',
            title: 'Yamabushi Farms',
            description: 'D2C Brand · 10× Revenue in 2 Months · 3× ROAS'
        }
    ];

    let currentVideoIndex = 0;

    function openVideoModal(index) {
        currentVideoIndex = index;
        const video = videoData[index];
        document.getElementById('videoPlayer').src = 'https://www.youtube.com/embed/' + video.id + '?autoplay=1&rel=0';
        document.getElementById('videoTitle').textContent = video.title;
        document.getElementById('videoDescription').textContent = video.description;
        document.getElementById('videoModal').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeVideoModal() {
        document.getElementById('videoPlayer').src = '';
        document.getElementById('videoModal').classList.add('hidden');
        document.body.style.overflow = 'auto';
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeVideoModal();
    });

    // Website Form Handler
    document.getElementById('websiteForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        let website = document.getElementById('websiteInput').value.trim();
        if (!website) {
            alert('Please enter your website or brand name');
            return;
        }
        if (!website.startsWith('http://') && !website.startsWith('https://')) {
            website = 'https://' + website;
        }
        const user = Storage.getUser();
        const session = Storage.getSession();
        if (!user || !session) {
            const returnUrl = '/report-preview?website=' + encodeURIComponent(website);
            window.location.href = '/login?returnUrl=' + encodeURIComponent(returnUrl);
            return;
        }
        window.location.href = '/report-preview?website=' + encodeURIComponent(website);
    });

    // Start interview (requires login)
    function startInterview() {
        const existingUser = localStorage.getItem('nexspark_user');
        if (existingUser) {
            window.location.href = '/dashboard';
        } else {
            window.location.href = '/static/login.html';
        }
    }

    // Update CTA buttons
    document.addEventListener('DOMContentLoaded', () => {
        const buttons = document.querySelectorAll('button[onclick*=\'/interview\']');
        buttons.forEach(button => {
            button.onclick = (e) => {
                e.preventDefault();
                startInterview();
            };
        });
    });
    </script>

    <script src="/static/modal-utils.js"></script>
    <script src="/static/app.js"></script>
</body>
</html>
`;
