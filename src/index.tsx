import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// API endpoint for brand registration
app.post('/api/register/brand', async (c) => {
  try {
    const data = await c.req.json()
    
    // Here you would typically save to database (D1, KV, or external API)
    console.log('Brand Registration:', data)
    
    return c.json({ 
      success: true, 
      message: 'Thank you for registering! Our team will contact you within 24 hours.',
      data: data
    })
  } catch (error) {
    return c.json({ success: false, message: 'Registration failed. Please try again.' }, 400)
  }
})

// API endpoint for agency/freelancer registration
app.post('/api/register/agency', async (c) => {
  try {
    const data = await c.req.json()
    
    // Here you would typically save to database (D1, KV, or external API)
    console.log('Agency Registration:', data)
    
    return c.json({ 
      success: true, 
      message: 'Thank you for joining! We will review your profile and get back to you soon.',
      data: data
    })
  } catch (error) {
    return c.json({ success: false, message: 'Registration failed. Please try again.' }, 400)
  }
})

// Main landing page
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>NexSpark - The Airbnb for Market Growth | AI-Powered Growth OS</title>
        <meta name="description" content="Connect with world-class growth experts at affordable prices. AI-powered strategy, escrow protection, and proven results for D2C and SaaS brands.">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script>
          tailwind.config = {
            theme: {
              extend: {
                colors: {
                  brand: {
                    primary: '#6366f1',
                    secondary: '#8b5cf6',
                    accent: '#ec4899',
                  }
                }
              }
            }
          }
        </script>
        <style>
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          .float-animation {
            animation: float 3s ease-in-out infinite;
          }
          .gradient-text {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .glass-effect {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          .scroll-smooth {
            scroll-behavior: smooth;
          }
        </style>
    </head>
    <body class="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white scroll-smooth">
        <!-- Navigation -->
        <nav class="fixed top-0 w-full z-50 glass-effect">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center">
                        <i class="fas fa-bolt text-3xl text-yellow-400 mr-2"></i>
                        <span class="text-2xl font-bold gradient-text">NexSpark</span>
                    </div>
                    <div class="hidden md:flex space-x-8">
                        <a href="#for-brands" class="hover:text-purple-400 transition">For Brands</a>
                        <a href="#for-agencies" class="hover:text-purple-400 transition">For Agencies</a>
                        <a href="#how-it-works" class="hover:text-purple-400 transition">How It Works</a>
                        <a href="#pricing" class="hover:text-purple-400 transition">Pricing</a>
                    </div>
                    <div class="flex space-x-4">
                        <button onclick="openModal('brand')" class="bg-brand-primary hover:bg-purple-700 px-4 py-2 rounded-lg transition">
                            Get Started
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Hero Section -->
        <section class="pt-32 pb-20 px-4">
            <div class="max-w-7xl mx-auto text-center">
                <div class="float-animation inline-block mb-8">
                    <i class="fas fa-rocket text-6xl text-yellow-400"></i>
                </div>
                <h1 class="text-5xl md:text-7xl font-bold mb-6">
                    The <span class="gradient-text">Airbnb</span> for Market Growth
                </h1>
                <p class="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
                    Connect with world-class growth experts at affordable prices. 
                    <span class="text-purple-400 font-semibold">AI-powered strategy</span>, 
                    <span class="text-green-400 font-semibold">escrow protection</span>, and 
                    <span class="text-yellow-400 font-semibold">proven results</span>.
                </p>
                <div class="flex flex-col sm:flex-row justify-center gap-4 mb-12">
                    <button onclick="openModal('brand')" class="bg-brand-primary hover:bg-purple-700 px-8 py-4 rounded-lg text-lg font-semibold transition transform hover:scale-105">
                        <i class="fas fa-building mr-2"></i>
                        I'm a Brand
                    </button>
                    <button onclick="openModal('agency')" class="bg-brand-accent hover:bg-pink-700 px-8 py-4 rounded-lg text-lg font-semibold transition transform hover:scale-105">
                        <i class="fas fa-user-tie mr-2"></i>
                        I'm an Expert
                    </button>
                </div>
                
                <!-- Trust Indicators -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mt-16">
                    <div class="text-center">
                        <div class="text-4xl font-bold text-purple-400">100%</div>
                        <div class="text-gray-400">Client Retention</div>
                    </div>
                    <div class="text-center">
                        <div class="text-4xl font-bold text-green-400">300%</div>
                        <div class="text-gray-400">Avg ROAS Lift</div>
                    </div>
                    <div class="text-center">
                        <div class="text-4xl font-bold text-yellow-400">20x</div>
                        <div class="text-gray-400">Client Scale</div>
                    </div>
                    <div class="text-center">
                        <div class="text-4xl font-bold text-pink-400">$372B</div>
                        <div class="text-gray-400">Market Size</div>
                    </div>
                </div>
            </div>
        </section>

        <!-- For Brands Section -->
        <section id="for-brands" class="py-20 px-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30">
            <div class="max-w-7xl mx-auto">
                <div class="text-center mb-16">
                    <h2 class="text-4xl md:text-5xl font-bold mb-4">
                        <i class="fas fa-building text-purple-400 mr-3"></i>
                        For D2C & SaaS Brands
                    </h2>
                    <p class="text-xl text-gray-300">Stop wasting money on agencies that don't deliver. Get proven growth strategies and execution.</p>
                </div>

                <div class="grid md:grid-cols-2 gap-8 mb-12">
                    <!-- Problem Statement -->
                    <div class="glass-effect rounded-2xl p-8">
                        <h3 class="text-2xl font-bold mb-6 text-red-400">
                            <i class="fas fa-exclamation-triangle mr-2"></i>
                            The Agency Problem
                        </h3>
                        <ul class="space-y-4">
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-red-500 mr-3 mt-1"></i>
                                <span><strong>$2,500+/month</strong> retainers for single-channel management</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-red-500 mr-3 mt-1"></i>
                                <span><strong>Opaque pricing</strong> with no guaranteed results</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-red-500 mr-3 mt-1"></i>
                                <span><strong>Zero trust</strong> - "Will they deliver? Will I get my money back?"</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-red-500 mr-3 mt-1"></i>
                                <span><strong>Slow turnaround</strong> and inconsistent quality</span>
                            </li>
                        </ul>
                    </div>

                    <!-- Solution -->
                    <div class="glass-effect rounded-2xl p-8 border-2 border-purple-500">
                        <h3 class="text-2xl font-bold mb-6 text-green-400">
                            <i class="fas fa-check-circle mr-2"></i>
                            The NexSpark Solution
                        </h3>
                        <ul class="space-y-4">
                            <li class="flex items-start">
                                <i class="fas fa-check-circle text-green-500 mr-3 mt-1"></i>
                                <span><strong>$800/month</strong> for expert execution with AI support</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check-circle text-green-500 mr-3 mt-1"></i>
                                <span><strong>Escrow protection</strong> - Money released only on proof of work</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check-circle text-green-500 mr-3 mt-1"></i>
                                <span><strong>AI-powered strategy</strong> from Digital Leon (scaled to $100M+)</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check-circle text-green-500 mr-3 mt-1"></i>
                                <span><strong>Fortune 500 quality</strong> with 80% workflow automation</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- How It Works for Brands -->
                <div class="grid md:grid-cols-4 gap-6">
                    <div class="glass-effect rounded-xl p-6 text-center">
                        <div class="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-comments text-2xl"></i>
                        </div>
                        <h4 class="text-xl font-bold mb-3">1. Growth Diagnosis</h4>
                        <p class="text-gray-300">Interview with Digital Leon AI. Get a custom growth strategy based on $100M+ scaling experience.</p>
                    </div>

                    <div class="glass-effect rounded-xl p-6 text-center">
                        <div class="w-16 h-16 bg-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-book text-2xl"></i>
                        </div>
                        <h4 class="text-xl font-bold mb-3">2. Your Playbook</h4>
                        <p class="text-gray-300">3-6 month channel portfolio: which channels to build, test, and how much to spend for max ROI.</p>
                    </div>

                    <div class="glass-effect rounded-xl p-6 text-center">
                        <div class="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-users text-2xl"></i>
                        </div>
                        <h4 class="text-xl font-bold mb-3">3. Expert Matching</h4>
                        <p class="text-gray-300">Get matched with world-class growth experts at affordable prices. Vetted and verified.</p>
                    </div>

                    <div class="glass-effect rounded-xl p-6 text-center">
                        <div class="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-shield-alt text-2xl"></i>
                        </div>
                        <h4 class="text-xl font-bold mb-3">4. Escrow Safety</h4>
                        <p class="text-gray-300">Your money is protected. Released only when you verify the work is done. Zero risk.</p>
                    </div>
                </div>

                <div class="text-center mt-12">
                    <button onclick="openModal('brand')" class="bg-purple-600 hover:bg-purple-700 px-10 py-4 rounded-lg text-xl font-semibold transition transform hover:scale-105">
                        <i class="fas fa-rocket mr-2"></i>
                        Start Your Growth Journey
                    </button>
                </div>
            </div>
        </section>

        <!-- For Agencies Section -->
        <section id="for-agencies" class="py-20 px-4">
            <div class="max-w-7xl mx-auto">
                <div class="text-center mb-16">
                    <h2 class="text-4xl md:text-5xl font-bold mb-4">
                        <i class="fas fa-user-tie text-pink-400 mr-3"></i>
                        For Growth Agencies & Freelancers
                    </h2>
                    <p class="text-xl text-gray-300">Double your income. Halve your admin time. Get paid what you deserve.</p>
                </div>

                <div class="grid md:grid-cols-3 gap-8 mb-12">
                    <div class="glass-effect rounded-2xl p-8 hover:border-2 hover:border-pink-500 transition">
                        <div class="text-4xl mb-4">🚀</div>
                        <h3 class="text-2xl font-bold mb-4">4x Your Capacity</h3>
                        <p class="text-gray-300 mb-4">Go from 5 clients to <strong class="text-green-400">20 clients</strong> with our AI automation.</p>
                        <ul class="space-y-2 text-sm">
                            <li class="flex items-center">
                                <i class="fas fa-check text-green-500 mr-2"></i>
                                <span>Auto-generated performance reports</span>
                            </li>
                            <li class="flex items-center">
                                <i class="fas fa-check text-green-500 mr-2"></i>
                                <span>AI strategy recommendations</span>
                            </li>
                            <li class="flex items-center">
                                <i class="fas fa-check text-green-500 mr-2"></i>
                                <span>0% admin time (vs 50% traditional)</span>
                            </li>
                        </ul>
                    </div>

                    <div class="glass-effect rounded-2xl p-8 hover:border-2 hover:border-pink-500 transition">
                        <div class="text-4xl mb-4">💰</div>
                        <h3 class="text-2xl font-bold mb-4">Guaranteed Income</h3>
                        <p class="text-gray-300 mb-4">Earn <strong class="text-yellow-400">$10,000+/month</strong> managing 20 clients at $500 each.</p>
                        <ul class="space-y-2 text-sm">
                            <li class="flex items-center">
                                <i class="fas fa-check text-green-500 mr-2"></i>
                                <span>Escrow-protected payments</span>
                            </li>
                            <li class="flex items-center">
                                <i class="fas fa-check text-green-500 mr-2"></i>
                                <span>Automated lead generation</span>
                            </li>
                            <li class="flex items-center">
                                <i class="fas fa-check text-green-500 mr-2"></i>
                                <span>Focus 100% on strategy</span>
                            </li>
                        </ul>
                    </div>

                    <div class="glass-effect rounded-2xl p-8 hover:border-2 hover:border-pink-500 transition">
                        <div class="text-4xl mb-4">🎯</div>
                        <h3 class="text-2xl font-bold mb-4">Get Recognized</h3>
                        <p class="text-gray-300 mb-4">Digital Leon interviews you to identify your <strong class="text-purple-400">unique strengths</strong>.</p>
                        <ul class="space-y-2 text-sm">
                            <li class="flex items-center">
                                <i class="fas fa-check text-green-500 mr-2"></i>
                                <span>Matched with right-fit clients</span>
                            </li>
                            <li class="flex items-center">
                                <i class="fas fa-check text-green-500 mr-2"></i>
                                <span>Fair competition based on quality</span>
                            </li>
                            <li class="flex items-center">
                                <i class="fas fa-check text-green-500 mr-2"></i>
                                <span>Bonuses for retention & ROAS</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- Income Comparison -->
                <div class="glass-effect rounded-2xl p-8 max-w-4xl mx-auto mb-12">
                    <h3 class="text-3xl font-bold mb-8 text-center">Income Comparison</h3>
                    <div class="grid md:grid-cols-2 gap-8">
                        <div class="text-center p-6 bg-red-900/30 rounded-xl">
                            <div class="text-gray-400 text-lg mb-2">Traditional Agency Model</div>
                            <div class="text-4xl font-bold mb-4">$2,500<span class="text-xl">/mo</span></div>
                            <div class="text-gray-300">Managing 5 clients</div>
                            <div class="text-red-400 mt-2">50% time on admin</div>
                        </div>
                        <div class="text-center p-6 bg-green-900/30 rounded-xl border-2 border-green-500">
                            <div class="text-gray-400 text-lg mb-2">NexSpark Model</div>
                            <div class="text-4xl font-bold mb-4 text-green-400">$10,000<span class="text-xl">/mo</span></div>
                            <div class="text-gray-300">Managing 20 clients</div>
                            <div class="text-green-400 mt-2">0% time on admin</div>
                        </div>
                    </div>
                </div>

                <div class="text-center">
                    <button onclick="openModal('agency')" class="bg-pink-600 hover:bg-pink-700 px-10 py-4 rounded-lg text-xl font-semibold transition transform hover:scale-105">
                        <i class="fas fa-briefcase mr-2"></i>
                        Join as a Growth Expert
                    </button>
                </div>
            </div>
        </section>

        <!-- How It Works Section -->
        <section id="how-it-works" class="py-20 px-4 bg-gradient-to-r from-gray-900 to-purple-900/30">
            <div class="max-w-7xl mx-auto">
                <div class="text-center mb-16">
                    <h2 class="text-4xl md:text-5xl font-bold mb-4">
                        <i class="fas fa-cogs text-yellow-400 mr-3"></i>
                        How NexSpark Works
                    </h2>
                    <p class="text-xl text-gray-300">The Operating System for Growth</p>
                </div>

                <div class="grid md:grid-cols-2 gap-12">
                    <!-- AI Layer -->
                    <div class="glass-effect rounded-2xl p-8">
                        <div class="flex items-center mb-6">
                            <div class="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mr-4">
                                <i class="fas fa-robot text-3xl"></i>
                            </div>
                            <h3 class="text-3xl font-bold">The AI Layer</h3>
                        </div>
                        <p class="text-gray-300 mb-6">80% of workflow automated with Fortune 500 quality output</p>
                        <div class="space-y-4">
                            <div class="flex items-start">
                                <i class="fas fa-lightbulb text-yellow-400 mr-3 mt-1"></i>
                                <div>
                                    <strong>Strategy Generation</strong>
                                    <p class="text-gray-400 text-sm">AI-powered growth strategies based on proven $100M+ playbooks</p>
                                </div>
                            </div>
                            <div class="flex items-start">
                                <i class="fas fa-chart-line text-green-400 mr-3 mt-1"></i>
                                <div>
                                    <strong>Analytics & Reporting</strong>
                                    <p class="text-gray-400 text-sm">Automated performance tracking and insights</p>
                                </div>
                            </div>
                            <div class="flex items-start">
                                <i class="fas fa-sync text-blue-400 mr-3 mt-1"></i>
                                <div>
                                    <strong>Cross-channel Integration</strong>
                                    <p class="text-gray-400 text-sm">Unified data across all marketing channels</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Trust Layer -->
                    <div class="glass-effect rounded-2xl p-8">
                        <div class="flex items-center mb-6">
                            <div class="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mr-4">
                                <i class="fas fa-shield-alt text-3xl"></i>
                            </div>
                            <h3 class="text-3xl font-bold">The Trust Layer</h3>
                        </div>
                        <p class="text-gray-300 mb-6">Escrow vault ensures financial safety for both sides</p>
                        <div class="space-y-4">
                            <div class="flex items-start">
                                <i class="fas fa-lock text-yellow-400 mr-3 mt-1"></i>
                                <div>
                                    <strong>Secure Payments</strong>
                                    <p class="text-gray-400 text-sm">Funds held in escrow until work is verified</p>
                                </div>
                            </div>
                            <div class="flex items-start">
                                <i class="fas fa-user-check text-green-400 mr-3 mt-1"></i>
                                <div>
                                    <strong>Client Protection</strong>
                                    <p class="text-gray-400 text-sm">Protected from non-delivery and poor quality work</p>
                                </div>
                            </div>
                            <div class="flex items-start">
                                <i class="fas fa-dollar-sign text-blue-400 mr-3 mt-1"></i>
                                <div>
                                    <strong>Expert Protection</strong>
                                    <p class="text-gray-400 text-sm">Guaranteed payment for verified work completion</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Pricing Section -->
        <section id="pricing" class="py-20 px-4">
            <div class="max-w-7xl mx-auto">
                <div class="text-center mb-16">
                    <h2 class="text-4xl md:text-5xl font-bold mb-4">
                        <i class="fas fa-tag text-green-400 mr-3"></i>
                        Simple, Transparent Pricing
                    </h2>
                    <p class="text-xl text-gray-300">No hidden fees. Pay only for results.</p>
                </div>

                <div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    <!-- Starter -->
                    <div class="glass-effect rounded-2xl p-8 hover:border-2 hover:border-purple-500 transition">
                        <h3 class="text-2xl font-bold mb-4">Starter</h3>
                        <div class="text-4xl font-bold mb-2">$800<span class="text-xl">/mo</span></div>
                        <p class="text-gray-400 mb-6">Perfect for testing</p>
                        <ul class="space-y-3 mb-8">
                            <li class="flex items-center">
                                <i class="fas fa-check text-green-500 mr-2"></i>
                                <span>Single channel management</span>
                            </li>
                            <li class="flex items-center">
                                <i class="fas fa-check text-green-500 mr-2"></i>
                                <span>AI strategy consultation</span>
                            </li>
                            <li class="flex items-center">
                                <i class="fas fa-check text-green-500 mr-2"></i>
                                <span>Monthly reporting</span>
                            </li>
                            <li class="flex items-center">
                                <i class="fas fa-check text-green-500 mr-2"></i>
                                <span>Escrow protection</span>
                            </li>
                        </ul>
                        <button onclick="openModal('brand')" class="w-full bg-purple-600 hover:bg-purple-700 py-3 rounded-lg transition">
                            Get Started
                        </button>
                    </div>

                    <!-- Growth (Most Popular) -->
                    <div class="glass-effect rounded-2xl p-8 border-2 border-yellow-500 transform scale-105">
                        <div class="bg-yellow-500 text-gray-900 px-4 py-1 rounded-full text-sm font-semibold inline-block mb-4">
                            MOST POPULAR
                        </div>
                        <h3 class="text-2xl font-bold mb-4">Growth</h3>
                        <div class="text-4xl font-bold mb-2">$2,400<span class="text-xl">/mo</span></div>
                        <p class="text-gray-400 mb-6">For scaling businesses</p>
                        <ul class="space-y-3 mb-8">
                            <li class="flex items-center">
                                <i class="fas fa-check text-green-500 mr-2"></i>
                                <span>Multi-channel strategy</span>
                            </li>
                            <li class="flex items-center">
                                <i class="fas fa-check text-green-500 mr-2"></i>
                                <span>Dedicated growth team</span>
                            </li>
                            <li class="flex items-center">
                                <i class="fas fa-check text-green-500 mr-2"></i>
                                <span>Weekly performance reviews</span>
                            </li>
                            <li class="flex items-center">
                                <i class="fas fa-check text-green-500 mr-2"></i>
                                <span>Priority support</span>
                            </li>
                            <li class="flex items-center">
                                <i class="fas fa-check text-green-500 mr-2"></i>
                                <span>Advanced analytics</span>
                            </li>
                        </ul>
                        <button onclick="openModal('brand')" class="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 py-3 rounded-lg font-semibold transition">
                            Start Growing
                        </button>
                    </div>

                    <!-- Enterprise -->
                    <div class="glass-effect rounded-2xl p-8 hover:border-2 hover:border-purple-500 transition">
                        <h3 class="text-2xl font-bold mb-4">Enterprise</h3>
                        <div class="text-4xl font-bold mb-2">Custom</div>
                        <p class="text-gray-400 mb-6">For large organizations</p>
                        <ul class="space-y-3 mb-8">
                            <li class="flex items-center">
                                <i class="fas fa-check text-green-500 mr-2"></i>
                                <span>Full-stack growth OS</span>
                            </li>
                            <li class="flex items-center">
                                <i class="fas fa-check text-green-500 mr-2"></i>
                                <span>Custom integrations</span>
                            </li>
                            <li class="flex items-center">
                                <i class="fas fa-check text-green-500 mr-2"></i>
                                <span>Dedicated account manager</span>
                            </li>
                            <li class="flex items-center">
                                <i class="fas fa-check text-green-500 mr-2"></i>
                                <span>SLA guarantees</span>
                            </li>
                            <li class="flex items-center">
                                <i class="fas fa-check text-green-500 mr-2"></i>
                                <span>White-label options</span>
                            </li>
                        </ul>
                        <button onclick="openModal('brand')" class="w-full bg-purple-600 hover:bg-purple-700 py-3 rounded-lg transition">
                            Contact Sales
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <!-- CTA Section -->
        <section class="py-20 px-4 bg-gradient-to-r from-purple-900 to-pink-900">
            <div class="max-w-4xl mx-auto text-center">
                <h2 class="text-4xl md:text-5xl font-bold mb-6">
                    Ready to Transform Your Growth?
                </h2>
                <p class="text-xl text-gray-300 mb-8">
                    Join hundreds of brands and experts already winning with NexSpark
                </p>
                <div class="flex flex-col sm:flex-row justify-center gap-4">
                    <button onclick="openModal('brand')" class="bg-white text-purple-900 hover:bg-gray-100 px-10 py-4 rounded-lg text-xl font-semibold transition transform hover:scale-105">
                        <i class="fas fa-rocket mr-2"></i>
                        Get Started as a Brand
                    </button>
                    <button onclick="openModal('agency')" class="bg-pink-600 hover:bg-pink-700 px-10 py-4 rounded-lg text-xl font-semibold transition transform hover:scale-105">
                        <i class="fas fa-user-tie mr-2"></i>
                        Join as an Expert
                    </button>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="py-12 px-4 bg-gray-900">
            <div class="max-w-7xl mx-auto">
                <div class="grid md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <div class="flex items-center mb-4">
                            <i class="fas fa-bolt text-2xl text-yellow-400 mr-2"></i>
                            <span class="text-xl font-bold">NexSpark</span>
                        </div>
                        <p class="text-gray-400">The AI-Powered Operating System for the Agency Economy</p>
                    </div>
                    <div>
                        <h4 class="font-bold mb-4">For Brands</h4>
                        <ul class="space-y-2 text-gray-400">
                            <li><a href="#for-brands" class="hover:text-purple-400">How It Works</a></li>
                            <li><a href="#pricing" class="hover:text-purple-400">Pricing</a></li>
                            <li><a href="#" class="hover:text-purple-400">Case Studies</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="font-bold mb-4">For Experts</h4>
                        <ul class="space-y-2 text-gray-400">
                            <li><a href="#for-agencies" class="hover:text-purple-400">Join Platform</a></li>
                            <li><a href="#" class="hover:text-purple-400">Income Calculator</a></li>
                            <li><a href="#" class="hover:text-purple-400">Success Stories</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="font-bold mb-4">Company</h4>
                        <ul class="space-y-2 text-gray-400">
                            <li><a href="#" class="hover:text-purple-400">About Us</a></li>
                            <li><a href="mailto:founders@nexspark.io" class="hover:text-purple-400">Contact</a></li>
                            <li><a href="https://nexspark.io" class="hover:text-purple-400">Blog</a></li>
                        </ul>
                    </div>
                </div>
                <div class="border-t border-gray-800 pt-8 text-center text-gray-400">
                    <p>&copy; 2025 NexSpark. The Airbnb for Market Growth. All rights reserved.</p>
                    <div class="mt-4 space-x-4">
                        <a href="https://linkedin.com/company/nexspark" class="hover:text-purple-400">
                            <i class="fab fa-linkedin text-2xl"></i>
                        </a>
                        <a href="mailto:founders@nexspark.io" class="hover:text-purple-400">
                            <i class="fas fa-envelope text-2xl"></i>
                        </a>
                    </div>
                </div>
            </div>
        </footer>

        <!-- Registration Modals -->
        <div id="brandModal" class="hidden fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
            <div class="glass-effect rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-3xl font-bold">
                        <i class="fas fa-building text-purple-400 mr-2"></i>
                        Register Your Brand
                    </h3>
                    <button onclick="closeModal('brand')" class="text-gray-400 hover:text-white text-2xl">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <form id="brandForm" class="space-y-4">
                    <div>
                        <label class="block text-sm font-semibold mb-2">Company Name *</label>
                        <input type="text" name="companyName" required class="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-purple-500 focus:outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-2">Your Name *</label>
                        <input type="text" name="name" required class="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-purple-500 focus:outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-2">Email *</label>
                        <input type="email" name="email" required class="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-purple-500 focus:outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-2">Phone</label>
                        <input type="tel" name="phone" class="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-purple-500 focus:outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-2">Business Type *</label>
                        <select name="businessType" required class="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-purple-500 focus:outline-none">
                            <option value="">Select type...</option>
                            <option value="d2c">D2C / E-commerce</option>
                            <option value="saas">SaaS</option>
                            <option value="b2b">B2B Services</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-2">Monthly Ad Spend *</label>
                        <select name="adSpend" required class="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-purple-500 focus:outline-none">
                            <option value="">Select range...</option>
                            <option value="0-2k">$0 - $2,000</option>
                            <option value="2k-10k">$2,000 - $10,000</option>
                            <option value="10k-20k">$10,000 - $20,000</option>
                            <option value="20k-50k">$20,000 - $50,000</option>
                            <option value="50k+">$50,000+</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-2">Website</label>
                        <input type="url" name="website" placeholder="https://" class="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-purple-500 focus:outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-2">What channels are you currently using?</label>
                        <textarea name="currentChannels" rows="3" placeholder="e.g., Facebook Ads, Google Ads, SEO..." class="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-purple-500 focus:outline-none"></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-2">What's your biggest growth challenge?</label>
                        <textarea name="challenge" rows="3" placeholder="Tell us about your main growth obstacles..." class="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-purple-500 focus:outline-none"></textarea>
                    </div>
                    <button type="submit" class="w-full bg-purple-600 hover:bg-purple-700 py-4 rounded-lg font-semibold text-lg transition">
                        <i class="fas fa-paper-plane mr-2"></i>
                        Submit Registration
                    </button>
                </form>
                <div id="brandFormMessage" class="mt-4 hidden"></div>
            </div>
        </div>

        <div id="agencyModal" class="hidden fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
            <div class="glass-effect rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-3xl font-bold">
                        <i class="fas fa-user-tie text-pink-400 mr-2"></i>
                        Join as Growth Expert
                    </h3>
                    <button onclick="closeModal('agency')" class="text-gray-400 hover:text-white text-2xl">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <form id="agencyForm" class="space-y-4">
                    <div>
                        <label class="block text-sm font-semibold mb-2">Your Name *</label>
                        <input type="text" name="name" required class="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-pink-500 focus:outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-2">Email *</label>
                        <input type="email" name="email" required class="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-pink-500 focus:outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-2">Phone</label>
                        <input type="tel" name="phone" class="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-pink-500 focus:outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-2">I am a... *</label>
                        <select name="expertType" required class="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-pink-500 focus:outline-none">
                            <option value="">Select type...</option>
                            <option value="freelancer">Freelancer</option>
                            <option value="agency">Micro Agency (2-10 people)</option>
                            <option value="large-agency">Agency (10+ people)</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-2">Company/Agency Name (if applicable)</label>
                        <input type="text" name="companyName" class="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-pink-500 focus:outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-2">Your Specialization *</label>
                        <select name="specialization" required class="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-pink-500 focus:outline-none">
                            <option value="">Select specialization...</option>
                            <option value="facebook-ads">Facebook/Instagram Ads</option>
                            <option value="google-ads">Google Ads</option>
                            <option value="seo">SEO</option>
                            <option value="email">Email Marketing</option>
                            <option value="influencer">Influencer Marketing</option>
                            <option value="creative">Creative/Content</option>
                            <option value="analytics">Analytics & Strategy</option>
                            <option value="full-stack">Full-Stack Growth</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-2">Years of Experience *</label>
                        <select name="experience" required class="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-pink-500 focus:outline-none">
                            <option value="">Select years...</option>
                            <option value="1-2">1-2 years</option>
                            <option value="3-5">3-5 years</option>
                            <option value="5-10">5-10 years</option>
                            <option value="10+">10+ years</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-2">Current Number of Clients</label>
                        <input type="number" name="currentClients" placeholder="e.g., 5" class="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-pink-500 focus:outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-2">Portfolio/LinkedIn URL</label>
                        <input type="url" name="portfolio" placeholder="https://" class="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-pink-500 focus:outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-2">Notable Results/Case Studies</label>
                        <textarea name="results" rows="3" placeholder="e.g., Scaled client from $10k to $100k monthly revenue in 6 months..." class="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-pink-500 focus:outline-none"></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-2">Why do you want to join NexSpark?</label>
                        <textarea name="motivation" rows="3" placeholder="Tell us what interests you about the platform..." class="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-pink-500 focus:outline-none"></textarea>
                    </div>
                    <button type="submit" class="w-full bg-pink-600 hover:bg-pink-700 py-4 rounded-lg font-semibold text-lg transition">
                        <i class="fas fa-paper-plane mr-2"></i>
                        Submit Application
                    </button>
                </form>
                <div id="agencyFormMessage" class="mt-4 hidden"></div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

export default app
