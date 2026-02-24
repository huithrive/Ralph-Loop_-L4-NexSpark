// Revised Landing Page - Launch Focus
// From $0 to $10K MRR with AI Growth Co-Founder

export const REVISED_LANDING_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NexSpark | Launch with Your AI Growth Co-Founder</title>
    <meta name="description" content="From $0 to $10K MRR. Your AI-powered growth co-founder.">
    
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
    <link href="https://fonts.googleapis.com/css2?family=Antonio:wght@400;600;700&family=JetBrains+Mono:wght@400;500;700&family=Rajdhani:wght@400;500;600;700&display=swap" rel="stylesheet">

    <!-- Shared Modules -->
    <script src="/static/shared/storage.js"></script>
    <script src="/static/shared/header.js"></script>
    <script src="/static/shared/analysis-utils.js"></script>
    
    <script>
      tailwind.config = {
        theme: {
          extend: {
            fontFamily: {
              sans: ['Rajdhani', 'sans-serif'],
              header: ['Antonio', 'sans-serif'],
              mono: ['JetBrains Mono', 'monospace'],
            },
            colors: {
              nexspark: {
                bg: '#000000',
                gold: '#FF9C00',
                pale: '#FFCC99',
                red: '#CC3333',
                blue: '#99CCFF',
                purple: '#CC99CC',
                dark: '#111111',
                panel: 'rgba(20, 20, 25, 0.9)'
              }
            }
          }
        }
      }
    </script>
    
    <style>
      body {
        background-color: #000000;
        color: #99CCFF;
        overflow-x: hidden;
      }
      
      ::-webkit-scrollbar {
        width: 12px;
        background: #000;
      }
      ::-webkit-scrollbar-track {
        background: #000;
        border-left: 1px solid #333;
      }
      ::-webkit-scrollbar-thumb {
        background: #FF9C00;
        border-radius: 6px;
        border: 2px solid #000;
      }
      
      .lcars-bracket {
        position: relative;
        border-left: 12px solid #FF9C00;
        border-top: 12px solid #FF9C00;
        border-top-left-radius: 24px;
        padding-left: 20px;
        padding-top: 20px;
      }
      
      .lcars-btn {
        text-transform: uppercase;
        letter-spacing: 2px;
        font-family: 'Antonio', sans-serif;
        font-weight: 700;
        transition: all 0.2s;
      }
      
      .lcars-btn:hover {
        filter: brightness(1.2);
        transform: translateX(5px);
      }
      
      @keyframes warp {
        0% { transform: translateZ(0) scale(1); }
        100% { transform: translateZ(100px) scale(1.5); }
      }

      /* Slot machine animation - each word visible for exactly 3 seconds */
      @keyframes slotSpin {
        0% {
          opacity: 0;
          transform: translateY(20px);
        }
        5% {
          opacity: 1;
          transform: translateY(0);
        }
        28% {
          opacity: 1;
          transform: translateY(0);
        }
        33% {
          opacity: 0;
          transform: translateY(-20px);
        }
        100% {
          opacity: 0;
          transform: translateY(-20px);
        }
      }

      .slot-container {
        position: relative;
        min-width: 300px;
        min-height: 80px;
        display: inline-block;
        vertical-align: middle;
      }

      @media (min-width: 768px) {
        .slot-container {
          min-width: 400px;
          min-height: 100px;
        }
      }

      @media (min-width: 1024px) {
        .slot-container {
          min-width: 500px;
          min-height: 120px;
        }
      }

      .slot-item {
        position: absolute;
        top: 0;
        left: 0;
        opacity: 0;
        animation: slotSpin 9s infinite;
        white-space: nowrap;
      }

      .slot-item:nth-child(1) {
        animation-delay: 0s;
      }

      .slot-item:nth-child(2) {
        animation-delay: 3s;
      }

      .slot-item:nth-child(3) {
        animation-delay: 6s;
      }

      /* Scroll Indicator Animation */
      @keyframes scrollBounce {
        0%, 100% {
          transform: translateY(0);
          opacity: 0.7;
        }
        50% {
          transform: translateY(10px);
          opacity: 1;
        }
      }

      @keyframes scrollGlow {
        0%, 100% {
          box-shadow: 0 0 10px rgba(255, 156, 0, 0.3);
        }
        50% {
          box-shadow: 0 0 25px rgba(255, 156, 0, 0.8), 0 0 40px rgba(255, 156, 0, 0.4);
        }
      }

      .scroll-indicator {
        position: absolute;
        bottom: 40px;
        left: 50%;
        transform: translateX(-50%);
        animation: scrollBounce 2s ease-in-out infinite;
        cursor: pointer;
        z-index: 20;
      }

      .scroll-indicator-icon {
        width: 50px;
        height: 50px;
        border: 2px solid #FF9C00;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(10px);
        animation: scrollGlow 2s ease-in-out infinite;
        transition: all 0.3s ease;
      }

      .scroll-indicator:hover .scroll-indicator-icon {
        background: rgba(255, 156, 0, 0.2);
        transform: scale(1.1);
      }

      .scroll-indicator-text {
        color: #FF9C00;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 2px;
        margin-top: 8px;
        text-align: center;
        font-weight: bold;
      }
    </style>
</head>
<body class="font-sans">
    <!-- Animated Background Canvas -->
    <canvas id="bgCanvas" class="fixed top-0 left-0 w-full h-full pointer-events-none z-0"></canvas>

    <!-- Header (rendered by header.js) -->
    <div id="appHeader"></div>

    <!-- Hero Section -->
    <section class="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12 md:py-20">
        <div class="max-w-7xl w-full mt-16 md:mt-20">
            <div class="flex flex-col lg:flex-row gap-12">
                
                <!-- LCARS Sidebar -->
                <div class="hidden lg:flex flex-col w-32 shrink-0">
                    <div class="h-40 w-full bg-nexspark-gold rounded-tl-3xl mb-2 flex items-end justify-end p-2">
                        <span class="text-black font-header text-6xl font-bold">01</span>
                    </div>
                    <div class="h-32 w-full bg-nexspark-pale rounded-l-lg mb-2"></div>
                    <div class="flex-1 min-h-[200px] w-16 bg-nexspark-purple rounded-bl-3xl ml-auto border-r-8 border-black"></div>
                </div>

                <div class="flex-1">
                    <!-- Main Headline with Slot Machine Effect -->
                    <div class="mb-8">
                        <!-- First Line: "Built with [ROTATING]" -->
                        <div class="flex flex-wrap items-baseline gap-3 md:gap-4 mb-4">
                            <h1 class="text-5xl md:text-7xl lg:text-8xl font-header font-bold text-white uppercase tracking-wider">
                                Built with
                            </h1>

                            <!-- Rotating Slot -->
                            <div class="slot-container">
                                <div class="slot-item">
                                    <h1 class="text-5xl md:text-7xl lg:text-8xl font-header font-bold text-nexspark-gold uppercase tracking-wider">
                                        CLAUDE
                                    </h1>
                                </div>
                                <div class="slot-item">
                                    <h1 class="text-5xl md:text-7xl lg:text-8xl font-header font-bold text-nexspark-purple uppercase tracking-wider">
                                        CURSOR
                                    </h1>
                                </div>
                                <div class="slot-item">
                                    <h1 class="text-5xl md:text-7xl lg:text-8xl font-header font-bold text-nexspark-blue uppercase tracking-wider">
                                        LOVABLE
                                    </h1>
                                </div>
                            </div>
                        </div>

                        <!-- Second Line: "Launch with NEXSPARK" -->
                        <div class="flex flex-wrap items-center gap-3 md:gap-4">
                            <h1 class="text-5xl md:text-7xl lg:text-8xl font-header font-bold text-white uppercase tracking-wider">
                                Launch with
                            </h1>
                            <h1 class="text-5xl md:text-7xl lg:text-8xl font-header font-bold text-nexspark-gold uppercase tracking-wider">
                                NEXSPARK
                            </h1>
                        </div>
                    </div>

                    <!-- Value Prop -->
                    <div class="mb-8 max-w-4xl">
                        <div class="bg-nexspark-gold/10 border-l-4 border-nexspark-gold p-4 md:p-6 rounded-r-lg backdrop-blur-sm">
                            <div class="flex items-start gap-3">
                                <i class="fas fa-rocket text-nexspark-gold text-xl mt-1"></i>
                                <div>
                                    <div class="text-nexspark-gold font-mono text-xs uppercase tracking-widest mb-1">
                                        Launch Agent:
                                    </div>
                                    <p class="text-white/90 font-mono text-sm md:text-base leading-relaxed">
                                        The best launch agent to bring you from <span class="text-nexspark-gold">pre-revenue</span> to your first <span class="text-nexspark-purple">$10,000 monthly recurring revenue</span>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Website Input Form -->
                    <div class="mb-8 max-w-4xl">
                        <div class="bg-nexspark-panel border-2 border-nexspark-gold/30 rounded-xl p-6 backdrop-blur-sm">
                            <form id="websiteForm" class="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="text"
                                    id="websiteInput"
                                    placeholder="Enter your website (e.g., yamabushifarms.com)"
                                    class="flex-1 px-6 py-4 text-lg bg-nexspark-dark text-white border-2 border-nexspark-blue/30 focus:border-nexspark-gold focus:outline-none rounded-lg font-mono"
                                    required
                                />
                                <button
                                    type="submit"
                                    class="lcars-btn bg-nexspark-gold hover:bg-nexspark-pale text-black px-8 py-4 rounded-lg text-lg whitespace-nowrap font-bold"
                                >
                                    <i class="fas fa-bolt mr-2"></i>LAUNCH ANALYSIS
                                </button>
                            </form>
                            <p class="text-white/50 text-sm mt-3 font-mono">
                                <i class="fas fa-info-circle mr-1"></i>Enter your domain or brand name to get started
                            </p>
                        </div>
                    </div>

                    <!-- Trust Indicators Grid -->
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-4xl">
                        <div class="bg-black/60 border-t-4 border-nexspark-gold p-4 backdrop-blur-sm">
                            <div class="text-4xl font-header font-bold text-nexspark-gold mb-1">$10K</div>
                            <div class="text-white/70 font-mono text-xs uppercase tracking-wide">MRR Target</div>
                        </div>
                        <div class="bg-black/60 border-t-4 border-nexspark-blue p-4 backdrop-blur-sm">
                            <div class="text-4xl font-header font-bold text-nexspark-blue mb-1">5min</div>
                            <div class="text-white/70 font-mono text-xs uppercase tracking-wide">Preview Ready</div>
                        </div>
                        <div class="bg-black/60 border-t-4 border-nexspark-purple p-4 backdrop-blur-sm">
                            <div class="text-4xl font-header font-bold text-nexspark-purple mb-1">$20</div>
                            <div class="text-white/70 font-mono text-xs uppercase tracking-wide">Full Strategy</div>
                        </div>
                        <div class="bg-black/60 border-t-4 border-nexspark-red p-4 backdrop-blur-sm">
                            <div class="text-4xl font-header font-bold text-nexspark-red mb-1">AI</div>
                            <div class="text-white/70 font-mono text-xs uppercase tracking-wide">Co-Founder</div>
                        </div>
                    </div>

                    <!-- Key Message -->
                    <div class="max-w-3xl mb-12">
                        <div class="bg-black/40 border-t border-white/10 p-4 flex gap-4 items-start">
                            <div class="bg-nexspark-gold/20 text-nexspark-gold font-bold font-header text-xs px-2 py-1 rounded mt-1">LAUNCH</div>
                            <div>
                                <h3 class="text-nexspark-gold font-header uppercase tracking-wider text-sm mb-1">Best Launch Agent</h3>
                                <p class="text-slate-400 font-mono text-xs leading-relaxed">
                                    Pre-revenue to $10K MRR. Complete strategy, execution, and growth.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Scroll Indicator -->
        <div class="scroll-indicator" onclick="document.querySelector('#proven-results').scrollIntoView({ behavior: 'smooth' })">
            <div class="scroll-indicator-icon">
                <i class="fas fa-chevron-down text-nexspark-gold text-2xl"></i>
            </div>
            <div class="scroll-indicator-text font-mono">
                Scroll to See Results
            </div>
        </div>
    </section>

    <!-- Success Stories Section -->
    <section id="proven-results" class="relative z-10 py-20 px-4">
        <div class="max-w-7xl mx-auto">
            <div class="flex items-center gap-4 mb-12">
                <div class="h-20 w-20 bg-nexspark-gold rounded-tl-3xl flex items-center justify-center">
                    <span class="text-black font-header text-4xl font-bold">02</span>
                </div>
                <div class="flex-1">
                    <h2 class="text-4xl md:text-6xl font-header font-bold text-white uppercase tracking-tight">
                        Proven Results
                    </h2>
                    <p class="text-nexspark-gold font-mono text-sm uppercase tracking-widest mt-2">Real Clients, Real Growth</p>
                </div>
            </div>

            <!-- Positioning Statement -->
            <div class="bg-nexspark-gold/10 border-l-4 border-nexspark-gold p-6 rounded-r-lg mb-12">
                <p class="text-white/90 font-mono text-base leading-relaxed">
                    <i class="fas fa-chart-line text-nexspark-gold mr-3"></i>
                    We don't just work with SaaS and subscription software—we excel with <span class="text-nexspark-gold font-bold">D2C brands</span> and <span class="text-nexspark-blue font-bold">B2C companies</span> selling directly to consumers. From physical products to digital subscriptions, we deliver exceptional results across all sectors.
                </p>
            </div>

            <!-- Case Studies Showcase -->
            <div class="max-w-3xl mx-auto mb-8">
                <!-- Yamabushi Case Study (Video) -->
                <div class="group relative bg-nexspark-panel rounded-xl overflow-hidden border-2 border-nexspark-gold/30 hover:border-nexspark-gold transition-all duration-300 cursor-pointer" onclick="openVideoModal(0)">
                    <div class="aspect-video relative overflow-hidden bg-black">
                        <img src="https://img.youtube.com/vi/nw1XYryhdIU/maxresdefault.jpg" alt="Yamabushi Success Story" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                        <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                        <div class="absolute inset-0 flex items-center justify-center">
                            <div class="w-24 h-24 rounded-full bg-nexspark-gold/90 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <i class="fas fa-play text-black text-3xl ml-1"></i>
                            </div>
                        </div>
                        <div class="absolute top-4 left-4">
                            <span class="bg-nexspark-gold text-black px-4 py-2 rounded-full font-header font-bold text-sm uppercase">
                                D2C Brand
                            </span>
                        </div>
                    </div>
                    <div class="p-8">
                        <h3 class="text-3xl md:text-4xl font-header font-bold text-nexspark-gold uppercase mb-4">
                            Yamabushi Farms
                        </h3>
                        <div class="grid md:grid-cols-2 gap-4 mb-6">
                            <div class="bg-black/40 p-4 rounded-lg border-l-4 border-nexspark-gold">
                                <div class="flex items-start gap-3">
                                    <i class="fas fa-rocket text-nexspark-gold text-xl mt-1"></i>
                                    <div>
                                        <p class="text-white/90 font-mono text-base">
                                            <span class="text-nexspark-gold font-bold text-xl">10x Revenue</span>
                                        </p>
                                        <p class="text-white/60 font-mono text-sm">in just 2 months</p>
                                    </div>
                                </div>
                            </div>
                            <div class="bg-black/40 p-4 rounded-lg border-l-4 border-nexspark-gold">
                                <div class="flex items-start gap-3">
                                    <i class="fas fa-chart-bar text-nexspark-gold text-xl mt-1"></i>
                                    <div>
                                        <p class="text-white/90 font-mono text-base">
                                            <span class="text-nexspark-gold font-bold text-xl">3x ROAS</span>
                                        </p>
                                        <p class="text-white/60 font-mono text-sm">achieved in 1 month</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center justify-between pt-4 border-t border-nexspark-gold/20">
                            <span class="text-nexspark-blue font-mono text-sm uppercase tracking-wider">D2C CPG Brands</span>
                            <span class="text-white/60 font-mono text-sm">
                                <i class="fas fa-video mr-2"></i> Click to Watch Full Story
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- CTA -->
            <div class="text-center">
                <p class="text-white/70 font-mono text-sm mb-4">
                    <i class="fas fa-award text-nexspark-gold mr-2"></i>
                    Join successful brands who've transformed their growth with NexSpark
                </p>
            </div>
        </div>
    </section>

    <!-- How It Works Section -->
    <section class="relative z-10 py-20 px-4">
        <div class="max-w-7xl mx-auto">
            <div class="flex items-center gap-4 mb-12">
                <div class="h-20 w-20 bg-nexspark-blue rounded-tl-3xl flex items-center justify-center">
                    <span class="text-black font-header text-4xl font-bold">03</span>
                </div>
                <div class="flex-1">
                    <h2 class="text-4xl md:text-6xl font-header font-bold text-white uppercase tracking-tight">
                        How It Works
                    </h2>
                    <p class="text-nexspark-blue font-mono text-sm uppercase tracking-widest mt-2">AI-Powered Growth Protocol</p>
                </div>
            </div>

            <div class="grid md:grid-cols-4 gap-6">
                <div class="bg-nexspark-panel border-t-4 border-nexspark-gold p-6 backdrop-blur-sm">
                    <div class="w-16 h-16 bg-nexspark-gold rounded-full flex items-center justify-center mb-4 font-header text-2xl font-bold text-black">
                        01
                    </div>
                    <h4 class="text-lg font-header font-bold text-nexspark-gold uppercase mb-3 tracking-wider">Nexspark Interview</h4>
                    <p class="text-white/70 font-mono text-xs leading-relaxed">
                        10-minute voice interview. AI understands your business, goals, and challenges.
                    </p>
                </div>

                <div class="bg-nexspark-panel border-t-4 border-nexspark-blue p-6 backdrop-blur-sm">
                    <div class="w-16 h-16 bg-nexspark-blue rounded-full flex items-center justify-center mb-4 font-header text-2xl font-bold text-black">
                        02
                    </div>
                    <h4 class="text-lg font-header font-bold text-nexspark-blue uppercase mb-3 tracking-wider">AI Strategy Generation</h4>
                    <p class="text-white/70 font-mono text-xs leading-relaxed">
                        Instant 6-month GTM playbook. Channel mix, budget allocation, CAC projections.
                    </p>
                </div>

                <div class="bg-nexspark-panel border-t-4 border-nexspark-purple p-6 backdrop-blur-sm">
                    <div class="w-16 h-16 bg-nexspark-purple rounded-full flex items-center justify-center mb-4 font-header text-2xl font-bold text-black">
                        03
                    </div>
                    <h4 class="text-lg font-header font-bold text-nexspark-purple uppercase mb-3 tracking-wider">Automated Execution</h4>
                    <p class="text-white/70 font-mono text-xs leading-relaxed">
                        AI handles 90% of work. You focus on creative and strategic decisions only.
                    </p>
                </div>

                <div class="bg-nexspark-panel border-t-4 border-nexspark-gold p-6 backdrop-blur-sm">
                    <div class="w-16 h-16 bg-nexspark-gold rounded-full flex items-center justify-center mb-4 font-header text-2xl font-bold text-black">
                        04
                    </div>
                    <h4 class="text-lg font-header font-bold text-nexspark-gold uppercase mb-3 tracking-wider">Continuous Optimization</h4>
                    <p class="text-white/70 font-mono text-xs leading-relaxed">
                        Real-time performance tracking. AI adapts strategy based on results.
                    </p>
                </div>
            </div>

            <div class="text-center mt-12">
                <button onclick="document.getElementById('websiteInput').scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => document.getElementById('websiteInput').focus(), 500);" class="lcars-btn bg-nexspark-blue hover:bg-white text-black px-12 py-5 rounded-lg text-xl">
                    <i class="fas fa-rocket mr-2"></i> START NOW
                </button>
            </div>
        </div>
    </section>

    <!-- Video Modal -->
    <div id="videoModal" class="hidden fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4">
        <div class="relative w-full max-w-6xl">
            <button onclick="closeVideoModal()" class="absolute -top-12 right-0 text-white hover:text-nexspark-gold transition-colors">
                <i class="fas fa-times text-3xl"></i>
            </button>
            <div class="bg-nexspark-panel rounded-xl overflow-hidden border-2 border-nexspark-gold">
                <div class="aspect-video">
                    <iframe id="videoPlayer" width="100%" height="100%" src="" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </div>
                <div class="p-6 bg-black/50">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 id="videoTitle" class="text-2xl font-header font-bold text-white uppercase mb-2"></h3>
                            <p id="videoDescription" class="text-white/70 font-mono text-sm"></p>
                        </div>
                        <button id="nextVideoBtn" onclick="nextVideo()" class="px-6 py-3 bg-nexspark-gold text-black font-header font-bold uppercase rounded-lg hover:bg-nexspark-gold/80 transition-all">
                            Next Case <i class="fas fa-arrow-right ml-2"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Background Animation Script -->
    <script>
    // Render header
    Header.renderLanding();

    (() => {
      const canvas = document.getElementById('bgCanvas');
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const stars = Array.from({ length: 800 }, () => ({
        x: Math.random() * canvas.width - canvas.width / 2,
        y: Math.random() * canvas.height - canvas.height / 2,
        z: Math.random() * 1000,
        color: ['#FF9C00', '#99CCFF', '#CC99CC', '#FFFFFF'][Math.floor(Math.random() * 4)]
      }));

      function animate() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        stars.forEach(star => {
          star.z -= 2;
          if (star.z <= 0) {
            star.z = 1000;
            star.x = Math.random() * canvas.width - centerX;
            star.y = Math.random() * canvas.height - centerY;
          }

          const scale = 1000 / star.z;
          const x = centerX + star.x * scale;
          const y = centerY + star.y * scale;
          const size = Math.max(0, (1 - star.z / 1000) * 3);

          ctx.fillStyle = star.color;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = star.color;
          ctx.lineWidth = size;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(centerX + star.x * (1000 / (star.z + 2)), centerY + star.y * (1000 / (star.z + 2)));
          ctx.stroke();
        });

        requestAnimationFrame(animate);
      }

      animate();

      window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      });
    })();

    // Video Modal Functionality
    const videoData = [
        {
            id: 'nw1XYryhdIU',
            title: 'Yamabushi Farms',
            description: 'D2C Brand • 10x Revenue in 2 Months • 3x ROAS in 1 Month'
        }
    ];

    let currentVideoIndex = 0;

    function openVideoModal(index) {
        currentVideoIndex = index;
        const video = videoData[index];
        const modal = document.getElementById('videoModal');
        const player = document.getElementById('videoPlayer');
        const title = document.getElementById('videoTitle');
        const description = document.getElementById('videoDescription');
        const nextBtn = document.getElementById('nextVideoBtn');

        // Set video source with autoplay
        player.src = 'https://www.youtube.com/embed/' + video.id + '?autoplay=1&rel=0';
        title.textContent = video.title;
        description.textContent = video.description;

        // Show/hide next button
        if (index === videoData.length - 1) {
            nextBtn.textContent = 'Close';
            nextBtn.onclick = closeVideoModal;
        } else {
            nextBtn.innerHTML = 'Next Case <i class="fas fa-arrow-right ml-2"></i>';
            nextBtn.onclick = nextVideo;
        }

        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeVideoModal() {
        const modal = document.getElementById('videoModal');
        const player = document.getElementById('videoPlayer');

        // Stop video
        player.src = '';
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }

    function nextVideo() {
        currentVideoIndex = (currentVideoIndex + 1) % videoData.length;
        openVideoModal(currentVideoIndex);
    }

    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeVideoModal();
        }
    });

    // Website Form Handler (Login-Required Preview)
    document.getElementById('websiteForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const websiteInput = document.getElementById('websiteInput');
        let website = websiteInput.value.trim();

        // Validate input
        if (!website) {
            alert('Please enter a website or brand name');
            return;
        }

        // Normalize URL - add https:// if not present
        if (!website.startsWith('http://') && !website.startsWith('https://')) {
            website = 'https://' + website;
        }

        // Always redirect to report-preview page
        // The report-preview page will handle auth check and interview/report creation
        const previewUrl = '/static/report-preview?website=' + encodeURIComponent(website);
        console.log('Redirecting to preview:', previewUrl);
        window.location.href = previewUrl;
    });

    // Start interview (requires login)
    function startInterview() {
      // Check if user is already logged in
      const existingUser = localStorage.getItem('nexspark_user');

      if (existingUser) {
        // User already authenticated, go to dashboard
        window.location.href = '/dashboard';
      } else {
        // Redirect to login page
        window.location.href = '/static/login.html';
      }
    }
    
    // Update all GET STARTED buttons to use the function
    document.addEventListener('DOMContentLoaded', () => {
      const buttons = document.querySelectorAll('button[onclick*="/interview"]');
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
