// Landing Page - "Nexspark is Calling You" Experience
// Position: $2,000/hour top marketing CMO calling to diagnose your business

export const REVISED_LANDING_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nexspark | Your Expert Marketing CMO is Calling</title>
    <meta name="description" content="Nexspark: The $2,000/hour marketing CMO calling to diagnose your business. Get to $100M with unclaimed growth data.">
    
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    
    <script>
      tailwind.config = {
        theme: {
          extend: {
            fontFamily: {
              sans: ['Inter', 'sans-serif'],
            },
            colors: {
              nexspark: {
                orange: '#FF6B35',
                dark: '#0A0E27',
                blue: '#00D9FF',
                purple: '#7B61FF',
                gray: '#1A1F3A'
              }
            },
            animation: {
              'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              'ring': 'ring 1.5s ease-in-out infinite',
              'float': 'float 3s ease-in-out infinite',
            },
            keyframes: {
              ring: {
                '0%, 100%': { transform: 'scale(1)', opacity: '1' },
                '50%': { transform: 'scale(1.1)', opacity: '0.8' },
              },
              float: {
                '0%, 100%': { transform: 'translateY(0px)' },
                '50%': { transform: 'translateY(-20px)' },
              }
            }
          }
        }
      }
    </script>
    
    <style>
      body {
        background: linear-gradient(135deg, #0A0E27 0%, #1A1F3A 100%);
        min-height: 100vh;
      }
      
      .phone-glow {
        box-shadow: 0 0 80px rgba(255, 107, 53, 0.4), 
                    0 0 120px rgba(255, 107, 53, 0.2),
                    0 20px 60px rgba(0, 0, 0, 0.5);
      }
      
      .text-glow {
        text-shadow: 0 0 20px rgba(255, 107, 53, 0.5),
                     0 0 40px rgba(255, 107, 53, 0.3);
      }
      
      .call-button {
        background: linear-gradient(135deg, #FF6B35 0%, #FF8A5B 100%);
        box-shadow: 0 10px 40px rgba(255, 107, 53, 0.4),
                    0 0 60px rgba(255, 107, 53, 0.2);
        transition: all 0.3s ease;
      }
      
      .call-button:hover {
        transform: translateY(-5px) scale(1.05);
        box-shadow: 0 20px 60px rgba(255, 107, 53, 0.6),
                    0 0 80px rgba(255, 107, 53, 0.3);
      }
      
      .call-button:active {
        transform: translateY(-2px) scale(1.02);
      }
      
      .gradient-text {
        background: linear-gradient(135deg, #FF6B35 0%, #00D9FF 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      @keyframes ripple {
        0% {
          transform: scale(1);
          opacity: 1;
        }
        100% {
          transform: scale(2);
          opacity: 0;
        }
      }
      
      .ripple {
        animation: ripple 2s infinite;
      }
      
      .stat-card {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
      }
      
      .stat-card:hover {
        background: rgba(255, 255, 255, 0.05);
        border-color: rgba(255, 107, 53, 0.3);
        transform: translateY(-5px);
      }
    </style>
</head>
<body class="font-sans text-white">

    <!-- Header -->
    <header class="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-nexspark-dark/80 border-b border-white/10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-gradient-to-br from-nexspark-orange to-nexspark-blue rounded-lg flex items-center justify-center">
                        <i class="fas fa-bolt text-white text-xl"></i>
                    </div>
                    <span class="text-2xl font-bold tracking-tight">Nexspark</span>
                </div>
                
                <button onclick="window.location.href='/interview'" class="px-6 py-2.5 bg-nexspark-orange hover:bg-nexspark-orange/90 rounded-lg font-semibold transition-all">
                    Answer the Call
                </button>
            </div>
        </div>
    </header>

    <!-- Hero Section - Phone Call Experience -->
    <section class="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div class="max-w-7xl mx-auto">
            <div class="grid lg:grid-cols-2 gap-16 items-center">
                
                <!-- Left: Message -->
                <div class="space-y-8">
                    <!-- Calling Badge -->
                    <div class="inline-flex items-center gap-3 px-6 py-3 bg-nexspark-orange/10 border border-nexspark-orange/30 rounded-full animate-pulse-slow">
                        <div class="relative">
                            <div class="w-3 h-3 bg-nexspark-orange rounded-full animate-ring"></div>
                            <div class="absolute inset-0 w-3 h-3 bg-nexspark-orange rounded-full opacity-50 ripple"></div>
                        </div>
                        <span class="text-nexspark-orange font-semibold text-sm">Incoming Call</span>
                    </div>
                    
                    <!-- Main Headline -->
                    <div>
                        <h1 class="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-6">
                            <span class="text-glow">Nexspark</span><br/>
                            <span class="text-white/90">is calling</span><br/>
                            <span class="gradient-text">you.</span>
                        </h1>
                        
                        <p class="text-xl sm:text-2xl text-white/70 leading-relaxed mb-4">
                            The <span class="text-nexspark-orange font-bold">$2,000/hour marketing CMO</span> you've always wanted.
                        </p>
                        
                        <p class="text-lg text-white/60 leading-relaxed">
                            Ready to understand your business, diagnose what's holding you back, 
                            and chart your path to <span class="text-nexspark-blue font-semibold">$100M</span>.
                        </p>
                    </div>

                    <!-- What Happens -->
                    <div class="space-y-4">
                        <p class="text-sm uppercase tracking-widest text-white/40 font-semibold">What happens on the call:</p>
                        
                        <div class="space-y-3">
                            <div class="flex items-start gap-3">
                                <div class="w-6 h-6 rounded-full bg-nexspark-orange/20 flex items-center justify-center shrink-0 mt-0.5">
                                    <i class="fas fa-check text-nexspark-orange text-xs"></i>
                                </div>
                                <p class="text-white/80"><span class="font-semibold">10-minute diagnostic interview</span> — We learn your business inside and out</p>
                            </div>
                            
                            <div class="flex items-start gap-3">
                                <div class="w-6 h-6 rounded-full bg-nexspark-blue/20 flex items-center justify-center shrink-0 mt-0.5">
                                    <i class="fas fa-check text-nexspark-blue text-xs"></i>
                                </div>
                                <p class="text-white/80"><span class="font-semibold">Uncover hidden growth data</span> — Find opportunities your competitors are missing</p>
                            </div>
                            
                            <div class="flex items-start gap-3">
                                <div class="w-6 h-6 rounded-full bg-nexspark-purple/20 flex items-center justify-center shrink-0 mt-0.5">
                                    <i class="fas fa-check text-nexspark-purple text-xs"></i>
                                </div>
                                <p class="text-white/80"><span class="font-semibold">Get your complete growth strategy</span> — 6-month roadmap to scale revenue</p>
                            </div>
                        </div>
                    </div>

                    <!-- CTA Button -->
                    <div>
                        <button onclick="window.location.href='/interview'" class="call-button w-full sm:w-auto px-12 py-5 rounded-2xl font-bold text-xl text-white inline-flex items-center justify-center gap-4">
                            <i class="fas fa-phone text-2xl animate-ring"></i>
                            <span>ANSWER THE CALL</span>
                        </button>
                        
                        <p class="text-sm text-white/50 mt-4">
                            <i class="fas fa-clock mr-2"></i>Takes 10 minutes • No credit card required
                        </p>
                    </div>
                </div>

                <!-- Right: Phone Visual -->
                <div class="relative lg:block hidden">
                    <div class="relative animate-float">
                        <!-- Phone Device -->
                        <div class="phone-glow bg-gradient-to-b from-nexspark-gray to-nexspark-dark rounded-[60px] p-4 border-8 border-nexspark-dark/50">
                            <div class="bg-black rounded-[50px] p-8 min-h-[600px] flex flex-col">
                                <!-- Status Bar -->
                                <div class="flex items-center justify-between text-white/60 text-sm mb-12">
                                    <span>9:41 AM</span>
                                    <div class="flex items-center gap-1">
                                        <i class="fas fa-signal"></i>
                                        <i class="fas fa-wifi"></i>
                                        <i class="fas fa-battery-full"></i>
                                    </div>
                                </div>

                                <!-- Caller Info -->
                                <div class="flex-1 flex flex-col items-center justify-center space-y-8">
                                    <!-- Profile -->
                                    <div class="relative">
                                        <div class="w-32 h-32 rounded-full bg-gradient-to-br from-nexspark-orange to-nexspark-blue flex items-center justify-center text-5xl">
                                            <i class="fas fa-bolt text-white"></i>
                                        </div>
                                        <!-- Ripple Effect -->
                                        <div class="absolute inset-0 w-32 h-32 rounded-full border-4 border-nexspark-orange animate-ping opacity-50"></div>
                                    </div>

                                    <div class="text-center space-y-2">
                                        <h3 class="text-3xl font-bold text-white">Nexspark</h3>
                                        <p class="text-nexspark-orange font-semibold">Your Marketing CMO</p>
                                        <p class="text-white/50 text-sm">Calling...</p>
                                    </div>

                                    <!-- Incoming Call Animation -->
                                    <div class="flex items-center gap-2">
                                        <div class="w-2 h-8 bg-nexspark-orange rounded-full animate-pulse"></div>
                                        <div class="w-2 h-12 bg-nexspark-orange rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
                                        <div class="w-2 h-16 bg-nexspark-orange rounded-full animate-pulse" style="animation-delay: 0.4s"></div>
                                        <div class="w-2 h-12 bg-nexspark-orange rounded-full animate-pulse" style="animation-delay: 0.6s"></div>
                                        <div class="w-2 h-8 bg-nexspark-orange rounded-full animate-pulse" style="animation-delay: 0.8s"></div>
                                    </div>
                                </div>

                                <!-- Call Action Buttons -->
                                <div class="flex items-center justify-center gap-8 mt-8">
                                    <!-- Decline -->
                                    <button class="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                                        <i class="fas fa-phone-slash text-red-500 text-xl"></i>
                                    </button>
                                    
                                    <!-- Accept (Pulsing) -->
                                    <button onclick="window.location.href='/interview'" class="relative w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center animate-ring">
                                        <i class="fas fa-phone text-white text-2xl"></i>
                                        <div class="absolute inset-0 w-20 h-20 rounded-full border-4 border-green-500 animate-ping opacity-30"></div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </section>

    <!-- Stats Section -->
    <section class="py-20 px-4 sm:px-6 lg:px-8 bg-black/20">
        <div class="max-w-7xl mx-auto">
            <div class="text-center mb-12">
                <h2 class="text-3xl sm:text-4xl font-bold mb-4">
                    Why top founders are <span class="gradient-text">taking this call</span>
                </h2>
                <p class="text-xl text-white/60 max-w-3xl mx-auto">
                    Nexspark uncovers the unclaimed growth data your competitors don't see
                </p>
            </div>

            <div class="grid md:grid-cols-3 gap-8">
                <!-- Stat 1 -->
                <div class="stat-card rounded-2xl p-8 text-center">
                    <div class="text-5xl font-black text-nexspark-orange mb-3">$100M</div>
                    <h3 class="text-xl font-semibold mb-2">Revenue Target</h3>
                    <p class="text-white/60">Clear path from where you are to $100M in revenue</p>
                </div>

                <!-- Stat 2 -->
                <div class="stat-card rounded-2xl p-8 text-center">
                    <div class="text-5xl font-black text-nexspark-blue mb-3">10 min</div>
                    <h3 class="text-xl font-semibold mb-2">Expert Diagnosis</h3>
                    <p class="text-white/60">Full business analysis in less time than a coffee break</p>
                </div>

                <!-- Stat 3 -->
                <div class="stat-card rounded-2xl p-8 text-center">
                    <div class="text-5xl font-black text-nexspark-purple mb-3">$20</div>
                    <h3 class="text-xl font-semibold mb-2">Complete Strategy</h3>
                    <p class="text-white/60">Get your full 6-month growth roadmap for $20</p>
                </div>
            </div>
        </div>
    </section>

    <!-- How It Works -->
    <section class="py-20 px-4 sm:px-6 lg:px-8">
        <div class="max-w-5xl mx-auto">
            <div class="text-center mb-16">
                <h2 class="text-4xl sm:text-5xl font-bold mb-4">
                    Simple. Fast. <span class="gradient-text">Powerful.</span>
                </h2>
            </div>

            <div class="space-y-8">
                <!-- Step 1 -->
                <div class="flex gap-6 items-start">
                    <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-nexspark-orange to-nexspark-orange/50 flex items-center justify-center shrink-0">
                        <span class="text-3xl font-black text-white">1</span>
                    </div>
                    <div class="flex-1">
                        <h3 class="text-2xl font-bold mb-2">Answer the Call</h3>
                        <p class="text-lg text-white/70">10 simple questions about your business. Takes 10 minutes.</p>
                    </div>
                </div>

                <!-- Step 2 -->
                <div class="flex gap-6 items-start">
                    <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-nexspark-blue to-nexspark-blue/50 flex items-center justify-center shrink-0">
                        <span class="text-3xl font-black text-white">2</span>
                    </div>
                    <div class="flex-1">
                        <h3 class="text-2xl font-bold mb-2">Get Your Diagnosis</h3>
                        <p class="text-lg text-white/70">We analyze your competitors, find unclaimed opportunities, and chart your growth path.</p>
                    </div>
                </div>

                <!-- Step 3 -->
                <div class="flex gap-6 items-start">
                    <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-nexspark-purple to-nexspark-purple/50 flex items-center justify-center shrink-0">
                        <span class="text-3xl font-black text-white">3</span>
                    </div>
                    <div class="flex-1">
                        <h3 class="text-2xl font-bold mb-2">Execute Your Strategy</h3>
                        <p class="text-lg text-white/70">Follow your custom 6-month roadmap. Track progress. Hit milestones. Scale to $100M.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Final CTA -->
    <section class="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-nexspark-orange/10 to-nexspark-blue/10">
        <div class="max-w-4xl mx-auto text-center">
            <div class="inline-flex items-center gap-3 px-6 py-3 bg-nexspark-orange/10 border border-nexspark-orange/30 rounded-full mb-8 animate-pulse-slow">
                <div class="relative">
                    <div class="w-3 h-3 bg-nexspark-orange rounded-full animate-ring"></div>
                    <div class="absolute inset-0 w-3 h-3 bg-nexspark-orange rounded-full opacity-50 ripple"></div>
                </div>
                <span class="text-nexspark-orange font-semibold">The call is waiting</span>
            </div>

            <h2 class="text-4xl sm:text-5xl lg:text-6xl font-black mb-6">
                Ready to uncover your<br/>
                <span class="gradient-text">hidden growth opportunities?</span>
            </h2>
            
            <p class="text-xl text-white/70 mb-10 max-w-2xl mx-auto">
                Join the founders who answered the call and discovered their path to $100M
            </p>

            <button onclick="window.location.href='/interview'" class="call-button px-16 py-6 rounded-2xl font-bold text-2xl text-white inline-flex items-center gap-4 mb-6">
                <i class="fas fa-phone text-3xl animate-ring"></i>
                <span>ANSWER THE CALL NOW</span>
            </button>

            <p class="text-sm text-white/50">
                <i class="fas fa-shield-alt mr-2"></i>100% secure • No credit card to start • Cancel anytime
            </p>
        </div>
    </section>

    <!-- Footer -->
    <footer class="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div class="max-w-7xl mx-auto">
            <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-gradient-to-br from-nexspark-orange to-nexspark-blue rounded-lg flex items-center justify-center">
                        <i class="fas fa-bolt text-white text-xl"></i>
                    </div>
                    <span class="text-xl font-bold">Nexspark</span>
                </div>
                
                <p class="text-white/50 text-sm">
                    © 2025 Nexspark. Unclaim your growth data.
                </p>
            </div>
        </div>
    </footer>

</body>
</html>
`
