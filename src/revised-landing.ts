// Revised Landing Page - AI Growth Co-Founder Focus
// This replaces the old "Airbnb for Market Growth" positioning

export const REVISED_LANDING_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NexSpark | Your AI Growth Co-Founder</title>
    <meta name="description" content="Digital Leon: Your AI Growth Co-Founder with $100M+ IPO Experience. 90% cost reduction. 18-24 month path to profitability.">
    
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Antonio:wght@400;600;700&family=JetBrains+Mono:wght@400;500;700&family=Rajdhani:wght@400;500;600;700&display=swap" rel="stylesheet">
    
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
    </style>
</head>
<body class="font-sans">
    <!-- Animated Background Canvas -->
    <canvas id="bgCanvas" class="fixed top-0 left-0 w-full h-full pointer-events-none z-0"></canvas>

    <!-- Top Navigation Bar -->
    <div class="fixed top-0 left-0 w-full flex items-center justify-between p-4 gap-2 opacity-90 z-50 backdrop-blur-sm">
        <div class="flex items-center gap-2 flex-1">
            <div class="h-12 bg-white rounded-full flex items-center justify-center px-6 min-w-[180px]">
                <i class="fas fa-bolt text-3xl text-yellow-500 mr-2"></i>
                <span class="text-2xl font-header font-bold text-black tracking-wider">NEXSPARK</span>
            </div>
            <div class="h-8 w-16 bg-nexspark-red rounded-full self-start mt-2 hidden md:block"></div>
            <div class="h-8 w-64 bg-nexspark-blue rounded-full flex items-center justify-center px-6 self-start mt-2 hidden lg:flex">
                <span class="text-black font-header font-bold tracking-widest text-sm">AI GROWTH OS - v3.0</span>
            </div>
        </div>
        
        <div class="flex gap-2 mt-2">
            <button onclick="window.location.href='/interview'" class="lcars-btn bg-nexspark-gold hover:bg-nexspark-pale text-black px-8 py-3 rounded-lg text-lg">
                <i class="fas fa-rocket mr-2"></i> GET STARTED
            </button>
        </div>
    </div>

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
                    <!-- Main Headline -->
                    <h1 class="text-5xl md:text-7xl lg:text-8xl font-header font-bold text-white tracking-tighter uppercase leading-[0.9] mb-8">
                        Your <span class="text-nexspark-gold">AI Growth</span><br/>
                        <span class="text-nexspark-blue">Co-Founder</span>
                    </h1>

                    <!-- Sub-Headline with Data Panel -->
                    <div class="mb-8 max-w-4xl">
                        <h2 class="text-2xl md:text-3xl text-nexspark-gold font-header uppercase mb-4 tracking-wide">
                            Digital Leon: $100M+ IPO Experience in AI Form
                        </h2>
                        
                        <div class="bg-nexspark-blue/10 border-l-4 border-nexspark-blue p-4 md:p-6 mb-8 rounded-r-lg backdrop-blur-sm">
                            <div class="flex items-start gap-3">
                                <i class="fas fa-robot text-nexspark-blue text-xl mt-1"></i>
                                <div>
                                    <div class="text-nexspark-blue font-mono text-xs uppercase tracking-widest mb-1">
                                        AI-First Growth Engine:
                                    </div>
                                    <p class="text-white/90 font-mono text-sm md:text-base leading-relaxed">
                                        Trained on <span class="text-nexspark-gold">$100M+ IPO scaling experience</span>. 
                                        <span class="text-nexspark-blue">90% cost reduction</span> (40h → 4h). 
                                        <span class="text-nexspark-purple">18-24 months to profitability</span>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Trust Indicators Grid -->
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-4xl">
                        <div class="bg-black/60 border-t-4 border-nexspark-gold p-4 backdrop-blur-sm">
                            <div class="text-4xl font-header font-bold text-nexspark-gold mb-1">90%</div>
                            <div class="text-white/70 font-mono text-xs uppercase tracking-wide">Cost Reduction</div>
                        </div>
                        <div class="bg-black/60 border-t-4 border-nexspark-blue p-4 backdrop-blur-sm">
                            <div class="text-4xl font-header font-bold text-nexspark-blue mb-1">4h</div>
                            <div class="text-white/70 font-mono text-xs uppercase tracking-wide">vs 40h Manual</div>
                        </div>
                        <div class="bg-black/60 border-t-4 border-nexspark-purple p-4 backdrop-blur-sm">
                            <div class="text-4xl font-header font-bold text-nexspark-purple mb-1">18-24</div>
                            <div class="text-white/70 font-mono text-xs uppercase tracking-wide">Months to Profit</div>
                        </div>
                        <div class="bg-black/60 border-t-4 border-nexspark-red p-4 backdrop-blur-sm">
                            <div class="text-4xl font-header font-bold text-nexspark-red mb-1">$372B</div>
                            <div class="text-white/70 font-mono text-xs uppercase tracking-wide">Market Disruption</div>
                        </div>
                    </div>

                    <!-- CTA Button -->
                    <div class="flex flex-col sm:flex-row gap-4 mb-16">
                        <button onclick="window.location.href='/interview'" class="lcars-btn bg-nexspark-gold hover:bg-white text-black px-10 py-4 rounded-lg text-xl flex items-center justify-center gap-2">
                            <i class="fas fa-microphone"></i> START WITH DIGITAL LEON
                        </button>
                    </div>

                    <!-- 2-Key Messages -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-3xl">
                        <div class="bg-black/40 border-t border-white/10 p-4 flex gap-4 items-start">
                            <div class="bg-nexspark-gold/20 text-nexspark-gold font-bold font-header text-xs px-2 py-1 rounded mt-1">AI-FIRST</div>
                            <div>
                                <h3 class="text-nexspark-gold font-header uppercase tracking-wider text-sm mb-1">Fortune 500 Quality</h3>
                                <p class="text-slate-400 font-mono text-xs leading-relaxed">
                                    Digital Leon delivers billion-dollar strategy and execution. No agencies needed.
                                </p>
                            </div>
                        </div>

                        <div class="bg-black/40 border-t border-white/10 p-4 flex gap-4 items-start">
                            <div class="bg-nexspark-blue/20 text-nexspark-blue font-bold font-header text-xs px-2 py-1 rounded mt-1">AGGRESSIVE</div>
                            <div>
                                <h3 class="text-nexspark-blue font-header uppercase tracking-wider text-sm mb-1">Move Fast or Die</h3>
                                <p class="text-slate-400 font-mono text-xs leading-relaxed">
                                    AI is eating the $372B agency economy. Be early or be left behind.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- How It Works Section -->
    <section class="relative z-10 py-20 px-4">
        <div class="max-w-7xl mx-auto">
            <div class="flex items-center gap-4 mb-12">
                <div class="h-20 w-20 bg-nexspark-blue rounded-tl-3xl flex items-center justify-center">
                    <span class="text-black font-header text-4xl font-bold">02</span>
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
                    <h4 class="text-lg font-header font-bold text-nexspark-gold uppercase mb-3 tracking-wider">Digital Leon Interview</h4>
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
                <button onclick="window.location.href='/interview'" class="lcars-btn bg-nexspark-blue hover:bg-white text-black px-12 py-5 rounded-lg text-xl">
                    <i class="fas fa-rocket mr-2"></i> START NOW
                </button>
            </div>
        </div>
    </section>

    <!-- Pricing Section -->
    <section class="relative z-10 py-20 px-4">
        <div class="max-w-7xl mx-auto">
            <div class="flex items-center gap-4 mb-12">
                <div class="h-20 w-20 bg-nexspark-gold rounded-tl-3xl flex items-center justify-center">
                    <span class="text-black font-header text-4xl font-bold">03</span>
                </div>
                <div class="flex-1">
                    <h2 class="text-4xl md:text-6xl font-header font-bold text-white uppercase tracking-tight">
                        Pricing
                    </h2>
                    <p class="text-nexspark-gold font-mono text-sm uppercase tracking-widest mt-2">AI-Powered Value Tiers</p>
                </div>
            </div>

            <div class="grid md:grid-cols-4 gap-6 max-w-7xl mx-auto">
                <!-- Launch -->
                <div class="bg-nexspark-panel border-t-4 border-nexspark-blue p-6 backdrop-blur-sm">
                    <div class="bg-nexspark-blue/20 px-3 py-1 rounded inline-block mb-4">
                        <span class="text-nexspark-blue font-header text-xs uppercase tracking-widest">Launch</span>
                    </div>
                    <div class="text-4xl font-header font-bold text-white mb-2">$5.4K<span class="text-xl text-white/50">/yr</span></div>
                    <p class="text-white/60 font-mono text-xs mb-6">Month 1 • Single Channel</p>
                    <ul class="space-y-3 mb-6 text-xs font-mono">
                        <li class="flex items-center gap-2">
                            <i class="fas fa-check text-nexspark-blue"></i>
                            <span class="text-white/80">Digital Leon interview</span>
                        </li>
                        <li class="flex items-center gap-2">
                            <i class="fas fa-check text-nexspark-blue"></i>
                            <span class="text-white/80">1 channel GTM strategy</span>
                        </li>
                        <li class="flex items-center gap-2">
                            <i class="fas fa-check text-nexspark-blue"></i>
                            <span class="text-white/80">AI execution support</span>
                        </li>
                    </ul>
                    <button onclick="window.location.href='/interview'" class="lcars-btn w-full bg-nexspark-blue hover:bg-white text-black py-3 rounded-lg text-sm">
                        GET STARTED
                    </button>
                </div>

                <!-- Scale -->
                <div class="bg-nexspark-panel border-t-4 border-nexspark-purple p-6 backdrop-blur-sm">
                    <div class="bg-nexspark-purple/20 px-3 py-1 rounded inline-block mb-4">
                        <span class="text-nexspark-purple font-header text-xs uppercase tracking-widest">Scale</span>
                    </div>
                    <div class="text-4xl font-header font-bold text-white mb-2">$18.6K<span class="text-xl text-white/50">/yr</span></div>
                    <p class="text-white/60 font-mono text-xs mb-6">Month 3 • Multi-Channel</p>
                    <ul class="space-y-3 mb-6 text-xs font-mono">
                        <li class="flex items-center gap-2">
                            <i class="fas fa-check text-nexspark-purple"></i>
                            <span class="text-white/80">3-channel portfolio</span>
                        </li>
                        <li class="flex items-center gap-2">
                            <i class="fas fa-check text-nexspark-purple"></i>
                            <span class="text-white/80">Advanced automation</span>
                        </li>
                        <li class="flex items-center gap-2">
                            <i class="fas fa-check text-nexspark-purple"></i>
                            <span class="text-white/80">Weekly optimization</span>
                        </li>
                    </ul>
                    <button onclick="window.location.href='/interview'" class="lcars-btn w-full bg-nexspark-purple hover:bg-nexspark-pale text-black py-3 rounded-lg text-sm">
                        START SCALING
                    </button>
                </div>

                <!-- Growth (Most Popular) -->
                <div class="bg-nexspark-panel border-t-4 border-nexspark-gold p-6 backdrop-blur-sm relative">
                    <div class="absolute -top-4 right-4 bg-nexspark-gold text-black px-4 py-1 rounded-full font-header text-xs font-bold uppercase tracking-wider">
                        Popular
                    </div>
                    <div class="bg-nexspark-gold/20 px-3 py-1 rounded inline-block mb-4">
                        <span class="text-nexspark-gold font-header text-xs uppercase tracking-widest">Growth</span>
                    </div>
                    <div class="text-4xl font-header font-bold text-nexspark-gold mb-2">$30.6K<span class="text-xl text-nexspark-pale">/yr</span></div>
                    <p class="text-white/60 font-mono text-xs mb-6">Month 3 • Full Portfolio</p>
                    <ul class="space-y-3 mb-6 text-xs font-mono">
                        <li class="flex items-center gap-2">
                            <i class="fas fa-check text-nexspark-gold"></i>
                            <span class="text-white/80">Full channel mix</span>
                        </li>
                        <li class="flex items-center gap-2">
                            <i class="fas fa-check text-nexspark-gold"></i>
                            <span class="text-white/80">Real-time optimization</span>
                        </li>
                        <li class="flex items-center gap-2">
                            <i class="fas fa-check text-nexspark-gold"></i>
                            <span class="text-white/80">Dedicated AI support</span>
                        </li>
                    </ul>
                    <button onclick="window.location.href='/interview'" class="lcars-btn w-full bg-nexspark-gold hover:bg-nexspark-pale text-black py-3 rounded-lg text-sm font-bold">
                        ACCELERATE GROWTH
                    </button>
                </div>

                <!-- Enterprise -->
                <div class="bg-nexspark-panel border-t-4 border-nexspark-red p-6 backdrop-blur-sm">
                    <div class="bg-nexspark-red/20 px-3 py-1 rounded inline-block mb-4">
                        <span class="text-nexspark-red font-header text-xs uppercase tracking-widest">Enterprise</span>
                    </div>
                    <div class="text-4xl font-header font-bold text-white mb-2">$42K+<span class="text-xl text-white/50">/yr</span></div>
                    <p class="text-white/60 font-mono text-xs mb-6">Month 4+ • Custom</p>
                    <ul class="space-y-3 mb-6 text-xs font-mono">
                        <li class="flex items-center gap-2">
                            <i class="fas fa-check text-nexspark-red"></i>
                            <span class="text-white/80">Custom AI models</span>
                        </li>
                        <li class="flex items-center gap-2">
                            <i class="fas fa-check text-nexspark-red"></i>
                            <span class="text-white/80">White-label platform</span>
                        </li>
                        <li class="flex items-center gap-2">
                            <i class="fas fa-check text-nexspark-red"></i>
                            <span class="text-white/80">API access</span>
                        </li>
                    </ul>
                    <button onclick="window.location.href='/interview'" class="lcars-btn w-full bg-nexspark-red hover:bg-red-600 text-white py-3 rounded-lg text-sm">
                        CONTACT US
                    </button>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="relative z-10 py-20 px-4">
        <div class="max-w-4xl mx-auto text-center">
            <h2 class="text-4xl md:text-6xl font-header font-bold text-white uppercase mb-6">
                The Future is <span class="text-nexspark-gold">AI-First</span>
            </h2>
            <p class="text-xl text-white/70 font-mono mb-12">
                Traditional agencies cost 10x more. Digital Leon delivers Fortune 500 quality at 90% lower cost.
            </p>
            <button onclick="window.location.href='/interview'" class="lcars-btn bg-nexspark-gold hover:bg-nexspark-pale text-black px-16 py-6 rounded-lg text-2xl">
                <i class="fas fa-bolt mr-3"></i> START WITH DIGITAL LEON
            </button>
        </div>
    </section>

    <!-- Background Animation Script -->
    <script>
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
    
    // Create demo user and redirect to interview
    function startInterview() {
      // Create demo user if not exists
      if (!localStorage.getItem('nexspark_user')) {
        const demoUser = {
          id: 'demo_user_' + Date.now(),
          email: 'demo@nexspark.ai',
          name: 'Demo User',
          picture: 'https://via.placeholder.com/150',
          created_at: new Date().toISOString()
        };
        localStorage.setItem('nexspark_user', JSON.stringify(demoUser));
        console.log('✅ Demo user created:', demoUser.id);
      }
      
      // Redirect to interview
      window.location.href = '/interview';
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
</body>
</html>
`;
