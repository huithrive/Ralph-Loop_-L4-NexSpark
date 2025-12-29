import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { 
  transcribeAudio, 
  analyzeInterview, 
  generateGrowthStrategy,
  DEFAULT_INTERVIEW_QUESTIONS,
  type InterviewResponse
} from './services/voice-interview'
import {
  generateCompetitiveReport,
  fetchTrafficData,
  type CompetitorData
} from './services/growth-audit-agent'

const app = new Hono()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// API endpoint for brand registration
app.post('/api/register/brand', async (c) => {
  try {
    const data = await c.req.json()
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

// Google OAuth callback simulation (placeholder - requires actual OAuth setup)
app.get('/auth/google/callback', async (c) => {
  // TODO: Implement actual Google OAuth flow
  // For now, simulate successful authentication
  const mockUser = {
    id: 'user_' + Date.now(),
    email: 'demo@example.com',
    name: 'Demo User',
    picture: 'https://via.placeholder.com/150',
    created_at: new Date().toISOString()
  };
  
  // In production, store user in database and create session
  console.log('User authenticated:', mockUser);
  
  // Redirect to dashboard with user data (in production, use secure session)
  return c.html(`
    <script>
      localStorage.setItem('nexspark_user', JSON.stringify(${JSON.stringify(mockUser)}));
      window.location.href = '/dashboard';
    </script>
  `);
})

// Dashboard route - redirect to static file
app.get('/dashboard', (c) => c.redirect('/static/dashboard.html'))

// Growth Audit Agent route
app.get('/growth-audit', (c) => c.redirect('/static/growth-audit.html'))

// Interview route - redirect to v3 with real-time transcription
app.get('/interview', (c) => c.redirect('/static/interview-v3.html'))

// API: Check for existing interview
app.get('/api/interview/check', async (c) => {
  try {
    const userId = c.req.query('userId');
    
    if (!userId) {
      return c.json({ success: false, message: 'User ID required' }, 400);
    }
    
    // Check if DB binding exists
    if (!c.env.DB) {
      console.log('D1 database not configured, using localStorage fallback');
      return c.json({ exists: false });
    }
    
    const { getIncompleteInterview } = await import('./services/database');
    const interview = await getIncompleteInterview(c.env.DB, userId);
    
    return c.json({
      exists: !!interview,
      interview: interview
    });
  } catch (error) {
    console.error('Error checking interview:', error);
    return c.json({ exists: false });
  }
})

// API: Get interview history
app.get('/api/interview/history', async (c) => {
  try {
    const userId = c.req.query('userId');
    
    if (!userId) {
      return c.json({ success: false, message: 'User ID required' }, 400);
    }
    
    // Check if DB binding exists
    if (!c.env.DB) {
      console.log('D1 database not configured');
      return c.json({ success: true, interviews: [] });
    }
    
    const { getInterviewHistory } = await import('./services/database');
    const interviews = await getInterviewHistory(c.env.DB, userId);
    
    return c.json({
      success: true,
      interviews: interviews
    });
  } catch (error) {
    console.error('Error getting history:', error);
    return c.json({ success: false, message: 'Failed to load history' }, 500);
  }
})

// API: Get specific interview
app.get('/api/interview/:id', async (c) => {
  try {
    const interviewId = c.req.param('id');
    
    if (!c.env.DB) {
      return c.json({ success: false, message: 'Database not configured' }, 500);
    }
    
    const { getInterview } = await import('./services/database');
    const interview = await getInterview(c.env.DB, interviewId);
    
    if (!interview) {
      return c.json({ success: false, message: 'Interview not found' }, 404);
    }
    
    return c.json({
      success: true,
      interview: interview
    });
  } catch (error) {
    console.error('Error getting interview:', error);
    return c.json({ success: false, message: 'Failed to load interview' }, 500);
  }
})

// API: Complete interview
app.post('/api/interview/complete', async (c) => {
  try {
    const data = await c.req.json();
    const { interviewId, responses, userId } = data;
    
    console.log('Completing interview:', interviewId);
    
    // If DB exists, use it
    if (c.env.DB && interviewId) {
      const { completeInterview, saveInterview } = await import('./services/database');
      
      // Save final responses
      await saveInterview(c.env.DB, {
        userId,
        interviewId,
        currentQuestion: responses.length,
        responses,
        completed: true
      });
      
      // Mark as completed
      await completeInterview(c.env.DB, interviewId);
      
      return c.json({
        success: true,
        message: 'Interview completed successfully',
        interviewId
      });
    }
    
    // Fallback: just acknowledge
    return c.json({
      success: true,
      message: 'Interview completed (localStorage mode)',
      interviewId: interviewId || 'local_' + Date.now()
    });
  } catch (error) {
    console.error('Error completing interview:', error);
    return c.json({ success: false, message: 'Failed to complete interview' }, 500);
  }
})

// API endpoint for saving interview responses (updated with DB)
app.post('/api/interview/save', async (c) => {
  try {
    const data = await c.req.json()
    console.log('Saving interview data:', data.userId, data.interviewId);
    
    // If DB exists, use it
    if (c.env.DB) {
      const { saveInterview } = await import('./services/database');
      const result = await saveInterview(c.env.DB, data);
      
      return c.json({
        success: true,
        message: 'Interview saved to database',
        interviewId: result.interviewId
      });
    }
    
    // Fallback: just acknowledge (localStorage will handle it)
    return c.json({ 
      success: true, 
      message: 'Interview saved (localStorage mode)',
      interviewId: data.interviewId || 'local_' + Date.now()
    })
  } catch (error) {
    console.error('Error saving interview:', error);
    return c.json({ success: false, message: 'Failed to save interview data.' }, 400)
  }
})

// API endpoint for OpenAI Whisper transcription
app.post('/api/transcribe', async (c) => {
  try {
    const formData = await c.req.formData()
    const audioFile = formData.get('audio')
    
    if (!audioFile || !(audioFile instanceof File)) {
      return c.json({ success: false, message: 'No audio file provided' }, 400)
    }
    
    console.log('Audio file received for transcription:', audioFile.name, audioFile.type, audioFile.size);
    
    // Convert File to ArrayBuffer
    const arrayBuffer = await audioFile.arrayBuffer();
    
    // Transcribe using OpenAI Whisper - pass environment
    const transcript = await transcribeAudio(arrayBuffer, c.env);
    
    console.log('Transcription successful:', transcript.substring(0, 100));
    
    return c.json({ 
      success: true, 
      transcript: transcript,
      confidence: 0.95
    })
  } catch (error) {
    console.error('Transcription error:', error);
    return c.json({ 
      success: false, 
      message: 'Transcription failed: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, 500)
  }
})

// API endpoint for analyzing interview and generating growth strategy
app.post('/api/interview/analyze', async (c) => {
  try {
    const { responses } = await c.req.json() as { responses: InterviewResponse[] }
    
    if (!responses || responses.length === 0) {
      return c.json({ success: false, message: 'No interview responses provided' }, 400)
    }
    
    console.log('Analyzing interview with', responses.length, 'responses');
    
    // Analyze the interview
    const analysis = await analyzeInterview(responses);
    
    // Generate growth strategy
    const strategy = await generateGrowthStrategy(analysis);
    
    console.log('Analysis complete:', analysis.brandProfile.industry);
    
    return c.json({ 
      success: true, 
      analysis,
      strategy
    })
  } catch (error) {
    console.error('Analysis error:', error);
    return c.json({ 
      success: false, 
      message: 'Analysis failed: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, 500)
  }
})

// API endpoint to get default interview questions
app.get('/api/interview/questions', (c) => {
  return c.json({ 
    success: true, 
    questions: DEFAULT_INTERVIEW_QUESTIONS
  })
})

// ========================================
// GROWTH AUDIT AGENT API ENDPOINTS
// ========================================

// API: Generate Competitive Intelligence Report
app.post('/api/growth-audit/generate', async (c) => {
  try {
    const { env } = c;
    const { competitors, industryContext } = await c.req.json();

    if (!competitors || !Array.isArray(competitors) || competitors.length === 0) {
      return c.json({ 
        success: false, 
        message: 'Please provide at least one competitor' 
      }, 400);
    }

    // Get API keys from environment
    const rapidApiKey = env.RAPIDAPI_KEY || 'REDACTED_RAPIDAPI_KEY';
    const claudeApiKey = env.ANTHROPIC_API_KEY || 'REDACTED_ANTHROPIC_KEY';

    console.log('Generating competitive report for', competitors.length, 'competitors');

    // Generate the report
    const { html, report } = await generateCompetitiveReport(
      competitors,
      industryContext || 'General market analysis',
      rapidApiKey,
      claudeApiKey
    );

    return c.json({
      success: true,
      html,
      report,
      competitors: competitors.map((c: any) => c.name)
    });
  } catch (error) {
    console.error('Growth audit generation error:', error);
    return c.json({
      success: false,
      message: 'Failed to generate report: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, 500);
  }
});

// API: Fetch Traffic Data for a Single Domain
app.post('/api/growth-audit/traffic', async (c) => {
  try {
    const { env } = c;
    const { domain } = await c.req.json();

    if (!domain) {
      return c.json({ 
        success: false, 
        message: 'Domain is required' 
      }, 400);
    }

    const rapidApiKey = env.RAPIDAPI_KEY || 'REDACTED_RAPIDAPI_KEY';

    console.log('Fetching traffic data for:', domain);

    const trafficData = await fetchTrafficData(domain, rapidApiKey);

    return c.json({
      success: true,
      data: trafficData
    });
  } catch (error) {
    console.error('Traffic data fetch error:', error);
    return c.json({
      success: false,
      message: 'Failed to fetch traffic data: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, 500);
  }
});

// API: Get Growth Audit Agent Status
app.get('/api/growth-audit/status', (c) => {
  const { env } = c;
  
  return c.json({
    success: true,
    status: 'online',
    features: {
      competitiveAnalysis: true,
      trafficData: true,
      claudeAI: !!env.ANTHROPIC_API_KEY,
      rapidAPI: !!env.RAPIDAPI_KEY
    },
    version: '1.0.0'
  });
});

// Main landing page with LCARS/Jarvis-inspired design
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>NexSpark | The Airbnb for Market Growth</title>
        <meta name="description" content="AI-Powered Operating System for the $372B Agency Economy. Connect with world-class growth experts at affordable prices.">
        
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
          
          /* Custom Scrollbar */
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
          
          /* LCARS Brackets */
          .lcars-bracket {
            position: relative;
            border-left: 12px solid #FF9C00;
            border-top: 12px solid #FF9C00;
            border-top-left-radius: 24px;
            padding-left: 20px;
            padding-top: 20px;
          }
          
          .lcars-bracket-alt {
            position: relative;
            border-right: 12px solid #99CCFF;
            border-bottom: 12px solid #99CCFF;
            border-bottom-right-radius: 24px;
            padding-right: 20px;
            padding-bottom: 20px;
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
          
          /* Animated Background */
          @keyframes warp {
            0% { transform: translateZ(0) scale(1); }
            100% { transform: translateZ(100px) scale(1.5); }
          }
          
          @keyframes scan {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100%); }
          }
          
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
          
          .scan-line {
            animation: scan 2s linear infinite;
          }
          
          .blink {
            animation: blink 1s step-end infinite;
          }
        </style>
    </head>
    <body class="font-sans selection:bg-cyan-500/30 selection:text-cyan-100">
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
                    <span class="text-black font-header font-bold tracking-widest text-sm">GROWTH OS - v2.0</span>
                </div>
            </div>
            
            <div class="flex gap-2 mt-2">
                <button onclick="openModal('brand')" class="lcars-btn bg-nexspark-gold hover:bg-nexspark-pale text-black px-6 py-2 rounded-lg">
                    I'M A BRAND
                </button>
                <button onclick="openModal('agency')" class="lcars-btn bg-nexspark-purple hover:bg-nexspark-blue text-black px-6 py-2 rounded-lg">
                    I'M AN EXPERT
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
                            The <span class="text-nexspark-gold">Airbnb</span><br/>
                            <span class="text-nexspark-blue">For Market Growth</span>
                        </h1>

                        <!-- Sub-Headline with Data Panel -->
                        <div class="mb-8 max-w-4xl">
                            <h2 class="text-2xl md:text-3xl text-nexspark-gold font-header uppercase mb-4 tracking-wide">
                                AI-Powered Operating System for the $372B Agency Economy
                            </h2>
                            
                            <div class="bg-nexspark-blue/10 border-l-4 border-nexspark-blue p-4 md:p-6 mb-8 rounded-r-lg backdrop-blur-sm">
                                <div class="flex items-start gap-3">
                                    <i class="fas fa-database text-nexspark-blue text-xl mt-1"></i>
                                    <div>
                                        <div class="text-nexspark-blue font-mono text-xs uppercase tracking-widest mb-1">
                                            System Training Dataset:
                                        </div>
                                        <p class="text-white/90 font-mono text-sm md:text-base leading-relaxed">
                                            Built by operators who scaled to <span class="text-nexspark-gold">$100M+ IPO</span>. 
                                            Just as Airbnb built the trust layer for housing, we're doing the same for the marketing industry.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Trust Indicators Grid -->
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-4xl">
                            <div class="bg-black/60 border-t-4 border-nexspark-gold p-4 backdrop-blur-sm">
                                <div class="text-4xl font-header font-bold text-nexspark-gold mb-1">100%</div>
                                <div class="text-white/70 font-mono text-xs uppercase tracking-wide">Client Retention</div>
                            </div>
                            <div class="bg-black/60 border-t-4 border-nexspark-blue p-4 backdrop-blur-sm">
                                <div class="text-4xl font-header font-bold text-nexspark-blue mb-1">300%</div>
                                <div class="text-white/70 font-mono text-xs uppercase tracking-wide">Avg ROAS Lift</div>
                            </div>
                            <div class="bg-black/60 border-t-4 border-nexspark-purple p-4 backdrop-blur-sm">
                                <div class="text-4xl font-header font-bold text-nexspark-purple mb-1">20x</div>
                                <div class="text-white/70 font-mono text-xs uppercase tracking-wide">Client Scale</div>
                            </div>
                            <div class="bg-black/60 border-t-4 border-nexspark-red p-4 backdrop-blur-sm">
                                <div class="text-4xl font-header font-bold text-nexspark-red mb-1">$372B</div>
                                <div class="text-white/70 font-mono text-xs uppercase tracking-wide">Market Size</div>
                            </div>
                        </div>

                        <!-- CTA Buttons -->
                        <div class="flex flex-col sm:flex-row gap-4 mb-16">
                            <button onclick="openModal('brand')" class="lcars-btn bg-nexspark-blue hover:bg-white text-black px-10 py-4 rounded-lg text-xl flex items-center justify-center gap-2">
                                <i class="fas fa-building"></i> START GROWTH JOURNEY
                            </button>
                            <button onclick="openModal('agency')" class="lcars-btn bg-nexspark-purple hover:bg-nexspark-pale text-black px-10 py-4 rounded-lg text-xl flex items-center justify-center gap-2">
                                <i class="fas fa-user-tie"></i> JOIN AS EXPERT
                            </button>
                        </div>

                        <!-- 2-Step Process -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-3xl">
                            <div class="bg-black/40 border-t border-white/10 p-4 flex gap-4 items-start">
                                <div class="bg-nexspark-gold/20 text-nexspark-gold font-bold font-header text-xs px-2 py-1 rounded mt-1">REF 01</div>
                                <div>
                                    <h3 class="text-nexspark-gold font-header uppercase tracking-wider text-sm mb-1">The AI Layer</h3>
                                    <p class="text-slate-400 font-mono text-xs leading-relaxed">
                                        80% workflow automation with Fortune 500 quality output. Digital Leon AI interviews and strategizes.
                                    </p>
                                </div>
                            </div>

                            <div class="bg-black/40 border-t border-white/10 p-4 flex gap-4 items-start">
                                <div class="bg-nexspark-red/20 text-nexspark-red font-bold font-header text-xs px-2 py-1 rounded mt-1">REF 02</div>
                                <div>
                                    <h3 class="text-nexspark-red font-header uppercase tracking-wider text-sm mb-1">The Trust Layer</h3>
                                    <p class="text-slate-400 font-mono text-xs leading-relaxed">
                                        Escrow vault ensures financial safety. Money released only on verified proof of work.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- For Brands Section -->
        <section id="for-brands" class="relative z-10 py-20 px-4">
            <div class="max-w-7xl mx-auto">
                <!-- Section Header with LCARS style -->
                <div class="flex items-center gap-4 mb-12">
                    <div class="h-20 w-20 bg-nexspark-blue rounded-tl-3xl flex items-center justify-center">
                        <span class="text-black font-header text-4xl font-bold">02</span>
                    </div>
                    <div class="flex-1">
                        <h2 class="text-4xl md:text-6xl font-header font-bold text-white uppercase tracking-tight">
                            <i class="fas fa-building text-nexspark-gold mr-3"></i>
                            For Brands
                        </h2>
                        <p class="text-nexspark-blue font-mono text-sm uppercase tracking-widest mt-2">D2C & SaaS Growth Protocol</p>
                    </div>
                </div>

                <!-- Problem vs Solution Grid -->
                <div class="grid md:grid-cols-2 gap-8 mb-16">
                    <!-- Problem -->
                    <div class="lcars-bracket bg-nexspark-red/5 backdrop-blur-sm">
                        <div class="bg-nexspark-red/10 px-3 py-1 rounded inline-block mb-4">
                            <span class="text-nexspark-red font-header text-sm uppercase tracking-widest">⚠ System Error</span>
                        </div>
                        <h3 class="text-2xl font-header font-bold text-white mb-6 uppercase">The Agency Problem</h3>
                        <ul class="space-y-4">
                            <li class="flex items-start gap-3">
                                <i class="fas fa-times-circle text-nexspark-red text-xl mt-1"></i>
                                <div>
                                    <span class="text-white font-mono text-sm"><strong class="text-nexspark-red">$2,500+/month</strong> retainers for single-channel</span>
                                </div>
                            </li>
                            <li class="flex items-start gap-3">
                                <i class="fas fa-times-circle text-nexspark-red text-xl mt-1"></i>
                                <div>
                                    <span class="text-white font-mono text-sm"><strong class="text-nexspark-red">Opaque pricing</strong> with no guaranteed results</span>
                                </div>
                            </li>
                            <li class="flex items-start gap-3">
                                <i class="fas fa-times-circle text-nexspark-red text-xl mt-1"></i>
                                <div>
                                    <span class="text-white font-mono text-sm"><strong class="text-nexspark-red">Zero trust</strong> - Will they deliver?</span>
                                </div>
                            </li>
                            <li class="flex items-start gap-3">
                                <i class="fas fa-times-circle text-nexspark-red text-xl mt-1"></i>
                                <div>
                                    <span class="text-white font-mono text-sm"><strong class="text-nexspark-red">Slow turnaround</strong> and inconsistent quality</span>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <!-- Solution -->
                    <div class="lcars-bracket-alt bg-nexspark-blue/5 backdrop-blur-sm border-2 border-nexspark-blue/30">
                        <div class="bg-nexspark-blue/10 px-3 py-1 rounded inline-block mb-4">
                            <span class="text-nexspark-blue font-header text-sm uppercase tracking-widest">✓ System Online</span>
                        </div>
                        <h3 class="text-2xl font-header font-bold text-white mb-6 uppercase">The NexSpark Solution</h3>
                        <ul class="space-y-4">
                            <li class="flex items-start gap-3">
                                <i class="fas fa-check-circle text-nexspark-blue text-xl mt-1"></i>
                                <div>
                                    <span class="text-white font-mono text-sm"><strong class="text-nexspark-gold">$800/month</strong> for expert execution with AI</span>
                                </div>
                            </li>
                            <li class="flex items-start gap-3">
                                <i class="fas fa-check-circle text-nexspark-blue text-xl mt-1"></i>
                                <div>
                                    <span class="text-white font-mono text-sm"><strong class="text-nexspark-gold">Escrow protection</strong> - Money on verified work only</span>
                                </div>
                            </li>
                            <li class="flex items-start gap-3">
                                <i class="fas fa-check-circle text-nexspark-blue text-xl mt-1"></i>
                                <div>
                                    <span class="text-white font-mono text-sm"><strong class="text-nexspark-gold">AI strategy</strong> from Digital Leon ($100M+ experience)</span>
                                </div>
                            </li>
                            <li class="flex items-start gap-3">
                                <i class="fas fa-check-circle text-nexspark-blue text-xl mt-1"></i>
                                <div>
                                    <span class="text-white font-mono text-sm"><strong class="text-nexspark-gold">Fortune 500 quality</strong> with 80% automation</span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- 4-Step Process -->
                <div class="grid md:grid-cols-4 gap-6">
                    <div class="bg-nexspark-panel border-t-4 border-nexspark-gold p-6 backdrop-blur-sm">
                        <div class="w-16 h-16 bg-nexspark-gold rounded-full flex items-center justify-center mb-4 font-header text-2xl font-bold text-black">
                            01
                        </div>
                        <h4 class="text-lg font-header font-bold text-nexspark-gold uppercase mb-3 tracking-wider">Growth Diagnosis</h4>
                        <p class="text-white/70 font-mono text-xs leading-relaxed">
                            Interview with Digital Leon AI. Get custom strategy based on $100M+ scaling experience.
                        </p>
                    </div>

                    <div class="bg-nexspark-panel border-t-4 border-nexspark-blue p-6 backdrop-blur-sm">
                        <div class="w-16 h-16 bg-nexspark-blue rounded-full flex items-center justify-center mb-4 font-header text-2xl font-bold text-black">
                            02
                        </div>
                        <h4 class="text-lg font-header font-bold text-nexspark-blue uppercase mb-3 tracking-wider">Your Playbook</h4>
                        <p class="text-white/70 font-mono text-xs leading-relaxed">
                            3-6 month channel portfolio: which channels to build, test, and optimize for max ROI.
                        </p>
                    </div>

                    <div class="bg-nexspark-panel border-t-4 border-nexspark-purple p-6 backdrop-blur-sm">
                        <div class="w-16 h-16 bg-nexspark-purple rounded-full flex items-center justify-center mb-4 font-header text-2xl font-bold text-black">
                            03
                        </div>
                        <h4 class="text-lg font-header font-bold text-nexspark-purple uppercase mb-3 tracking-wider">Expert Matching</h4>
                        <p class="text-white/70 font-mono text-xs leading-relaxed">
                            Get matched with world-class growth experts at affordable prices. Vetted and verified.
                        </p>
                    </div>

                    <div class="bg-nexspark-panel border-t-4 border-nexspark-gold p-6 backdrop-blur-sm">
                        <div class="w-16 h-16 bg-nexspark-gold rounded-full flex items-center justify-center mb-4 font-header text-2xl font-bold text-black">
                            04
                        </div>
                        <h4 class="text-lg font-header font-bold text-nexspark-gold uppercase mb-3 tracking-wider">Escrow Safety</h4>
                        <p class="text-white/70 font-mono text-xs leading-relaxed">
                            Your money is protected. Released only when you verify work is done. Zero risk.
                        </p>
                    </div>
                </div>

                <div class="text-center mt-12">
                    <button onclick="openModal('brand')" class="lcars-btn bg-nexspark-blue hover:bg-white text-black px-12 py-5 rounded-lg text-xl">
                        <i class="fas fa-rocket mr-2"></i> INITIATE GROWTH PROTOCOL
                    </button>
                </div>
            </div>
        </section>

        <!-- For Agencies Section -->
        <section id="for-agencies" class="relative z-10 py-20 px-4">
            <div class="max-w-7xl mx-auto">
                <!-- Section Header with LCARS style -->
                <div class="flex items-center gap-4 mb-12">
                    <div class="h-20 w-20 bg-nexspark-purple rounded-tl-3xl flex items-center justify-center">
                        <span class="text-black font-header text-4xl font-bold">03</span>
                    </div>
                    <div class="flex-1">
                        <h2 class="text-4xl md:text-6xl font-header font-bold text-white uppercase tracking-tight">
                            <i class="fas fa-user-tie text-nexspark-purple mr-3"></i>
                            For Agencies
                        </h2>
                        <p class="text-nexspark-purple font-mono text-sm uppercase tracking-widest mt-2">Growth Experts & Freelancers</p>
                    </div>
                </div>

                <!-- Income Comparison Panel -->
                <div class="bg-nexspark-panel rounded-2xl p-8 mb-12 border border-nexspark-blue/30 backdrop-blur-sm">
                    <h3 class="text-3xl font-header font-bold text-white mb-8 text-center uppercase tracking-wider">
                        <span class="text-nexspark-gold">Income Transformation</span>
                    </h3>
                    <div class="grid md:grid-cols-2 gap-8">
                        <div class="text-center p-6 bg-nexspark-red/20 rounded-xl border-2 border-nexspark-red/50">
                            <div class="text-nexspark-red/70 font-mono text-sm mb-2 uppercase tracking-widest">Traditional Model</div>
                            <div class="text-5xl font-header font-bold text-white mb-2">$2,500<span class="text-2xl text-white/50">/mo</span></div>
                            <div class="text-white/70 font-mono text-sm mb-4">Managing 5 clients</div>
                            <div class="text-nexspark-red font-mono text-xs uppercase tracking-wider">
                                <i class="fas fa-exclamation-triangle mr-1"></i> 50% time on admin
                            </div>
                        </div>
                        <div class="text-center p-6 bg-nexspark-gold/20 rounded-xl border-2 border-nexspark-gold">
                            <div class="text-nexspark-gold font-mono text-sm mb-2 uppercase tracking-widest">NexSpark AI Model</div>
                            <div class="text-5xl font-header font-bold text-nexspark-gold mb-2">$10,000<span class="text-2xl text-nexspark-pale">/mo</span></div>
                            <div class="text-white/70 font-mono text-sm mb-4">Managing 20 clients</div>
                            <div class="text-nexspark-blue font-mono text-xs uppercase tracking-wider">
                                <i class="fas fa-check-circle mr-1"></i> 0% time on admin
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 3 Key Benefits -->
                <div class="grid md:grid-cols-3 gap-8 mb-12">
                    <div class="bg-nexspark-panel border-l-8 border-nexspark-gold p-6 backdrop-blur-sm hover:border-nexspark-pale transition-all">
                        <div class="text-5xl mb-4">🚀</div>
                        <h3 class="text-2xl font-header font-bold text-nexspark-gold mb-4 uppercase tracking-wider">4x Your Capacity</h3>
                        <p class="text-white/80 font-mono text-sm mb-4">
                            Go from 5 clients to <strong class="text-nexspark-blue">20 clients</strong> with our AI automation.
                        </p>
                        <ul class="space-y-2 text-xs font-mono">
                            <li class="flex items-center gap-2">
                                <i class="fas fa-check text-nexspark-blue"></i>
                                <span class="text-white/70">Auto-generated performance reports</span>
                            </li>
                            <li class="flex items-center gap-2">
                                <i class="fas fa-check text-nexspark-blue"></i>
                                <span class="text-white/70">AI strategy recommendations</span>
                            </li>
                            <li class="flex items-center gap-2">
                                <i class="fas fa-check text-nexspark-blue"></i>
                                <span class="text-white/70">0% admin time (vs 50% traditional)</span>
                            </li>
                        </ul>
                    </div>

                    <div class="bg-nexspark-panel border-l-8 border-nexspark-blue p-6 backdrop-blur-sm hover:border-nexspark-pale transition-all">
                        <div class="text-5xl mb-4">💰</div>
                        <h3 class="text-2xl font-header font-bold text-nexspark-blue mb-4 uppercase tracking-wider">Guaranteed Income</h3>
                        <p class="text-white/80 font-mono text-sm mb-4">
                            Earn <strong class="text-nexspark-gold">$10,000+/month</strong> managing 20 clients at $500 each.
                        </p>
                        <ul class="space-y-2 text-xs font-mono">
                            <li class="flex items-center gap-2">
                                <i class="fas fa-check text-nexspark-gold"></i>
                                <span class="text-white/70">Escrow-protected payments</span>
                            </li>
                            <li class="flex items-center gap-2">
                                <i class="fas fa-check text-nexspark-gold"></i>
                                <span class="text-white/70">Automated lead generation</span>
                            </li>
                            <li class="flex items-center gap-2">
                                <i class="fas fa-check text-nexspark-gold"></i>
                                <span class="text-white/70">Focus 100% on strategy</span>
                            </li>
                        </ul>
                    </div>

                    <div class="bg-nexspark-panel border-l-8 border-nexspark-purple p-6 backdrop-blur-sm hover:border-nexspark-pale transition-all">
                        <div class="text-5xl mb-4">🎯</div>
                        <h3 class="text-2xl font-header font-bold text-nexspark-purple mb-4 uppercase tracking-wider">Get Recognized</h3>
                        <p class="text-white/80 font-mono text-sm mb-4">
                            Digital Leon interviews you to identify your <strong class="text-nexspark-gold">unique strengths</strong>.
                        </p>
                        <ul class="space-y-2 text-xs font-mono">
                            <li class="flex items-center gap-2">
                                <i class="fas fa-check text-nexspark-purple"></i>
                                <span class="text-white/70">Matched with right-fit clients</span>
                            </li>
                            <li class="flex items-center gap-2">
                                <i class="fas fa-check text-nexspark-purple"></i>
                                <span class="text-white/70">Fair competition based on quality</span>
                            </li>
                            <li class="flex items-center gap-2">
                                <i class="fas fa-check text-nexspark-purple"></i>
                                <span class="text-white/70">Bonuses for retention & ROAS</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div class="text-center">
                    <button onclick="openModal('agency')" class="lcars-btn bg-nexspark-purple hover:bg-nexspark-pale text-black px-12 py-5 rounded-lg text-xl">
                        <i class="fas fa-briefcase mr-2"></i> JOIN EXPERT NETWORK
                    </button>
                </div>
            </div>
        </section>

        <!-- Pricing Section -->
        <section id="pricing" class="relative z-10 py-20 px-4">
            <div class="max-w-7xl mx-auto">
                <!-- Section Header -->
                <div class="flex items-center gap-4 mb-12">
                    <div class="h-20 w-20 bg-nexspark-gold rounded-tl-3xl flex items-center justify-center">
                        <span class="text-black font-header text-4xl font-bold">04</span>
                    </div>
                    <div class="flex-1">
                        <h2 class="text-4xl md:text-6xl font-header font-bold text-white uppercase tracking-tight">
                            <i class="fas fa-tag text-nexspark-gold mr-3"></i>
                            Pricing
                        </h2>
                        <p class="text-nexspark-gold font-mono text-sm uppercase tracking-widest mt-2">Transparent. Simple. Fair.</p>
                    </div>
                </div>

                <div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    <!-- Starter -->
                    <div class="bg-nexspark-panel border-t-4 border-nexspark-blue p-8 backdrop-blur-sm hover:border-nexspark-pale transition-all">
                        <div class="bg-nexspark-blue/20 px-3 py-1 rounded inline-block mb-4">
                            <span class="text-nexspark-blue font-header text-xs uppercase tracking-widest">Starter</span>
                        </div>
                        <div class="text-5xl font-header font-bold text-white mb-2">$800<span class="text-xl text-white/50">/mo</span></div>
                        <p class="text-white/60 font-mono text-sm mb-6">Perfect for testing</p>
                        <ul class="space-y-3 mb-8 text-sm font-mono">
                            <li class="flex items-center gap-2">
                                <i class="fas fa-check text-nexspark-blue"></i>
                                <span class="text-white/80">Single channel management</span>
                            </li>
                            <li class="flex items-center gap-2">
                                <i class="fas fa-check text-nexspark-blue"></i>
                                <span class="text-white/80">AI strategy consultation</span>
                            </li>
                            <li class="flex items-center gap-2">
                                <i class="fas fa-check text-nexspark-blue"></i>
                                <span class="text-white/80">Monthly reporting</span>
                            </li>
                            <li class="flex items-center gap-2">
                                <i class="fas fa-check text-nexspark-blue"></i>
                                <span class="text-white/80">Escrow protection</span>
                            </li>
                        </ul>
                        <button onclick="openModal('brand')" class="lcars-btn w-full bg-nexspark-blue hover:bg-white text-black py-3 rounded-lg">
                            GET STARTED
                        </button>
                    </div>

                    <!-- Growth (Most Popular) -->
                    <div class="bg-nexspark-panel border-t-4 border-nexspark-gold p-8 backdrop-blur-sm transform scale-105 relative">
                        <div class="absolute -top-4 right-4 bg-nexspark-gold text-black px-4 py-1 rounded-full font-header text-xs font-bold uppercase tracking-wider">
                            Most Popular
                        </div>
                        <div class="bg-nexspark-gold/20 px-3 py-1 rounded inline-block mb-4">
                            <span class="text-nexspark-gold font-header text-xs uppercase tracking-widest">Growth</span>
                        </div>
                        <div class="text-5xl font-header font-bold text-nexspark-gold mb-2">$2,400<span class="text-xl text-nexspark-pale">/mo</span></div>
                        <p class="text-white/60 font-mono text-sm mb-6">For scaling businesses</p>
                        <ul class="space-y-3 mb-8 text-sm font-mono">
                            <li class="flex items-center gap-2">
                                <i class="fas fa-check text-nexspark-gold"></i>
                                <span class="text-white/80">Multi-channel strategy</span>
                            </li>
                            <li class="flex items-center gap-2">
                                <i class="fas fa-check text-nexspark-gold"></i>
                                <span class="text-white/80">Dedicated growth team</span>
                            </li>
                            <li class="flex items-center gap-2">
                                <i class="fas fa-check text-nexspark-gold"></i>
                                <span class="text-white/80">Weekly performance reviews</span>
                            </li>
                            <li class="flex items-center gap-2">
                                <i class="fas fa-check text-nexspark-gold"></i>
                                <span class="text-white/80">Priority support</span>
                            </li>
                            <li class="flex items-center gap-2">
                                <i class="fas fa-check text-nexspark-gold"></i>
                                <span class="text-white/80">Advanced analytics</span>
                            </li>
                        </ul>
                        <button onclick="openModal('brand')" class="lcars-btn w-full bg-nexspark-gold hover:bg-nexspark-pale text-black py-3 rounded-lg font-bold">
                            START GROWING
                        </button>
                    </div>

                    <!-- Enterprise -->
                    <div class="bg-nexspark-panel border-t-4 border-nexspark-purple p-8 backdrop-blur-sm hover:border-nexspark-pale transition-all">
                        <div class="bg-nexspark-purple/20 px-3 py-1 rounded inline-block mb-4">
                            <span class="text-nexspark-purple font-header text-xs uppercase tracking-widest">Enterprise</span>
                        </div>
                        <div class="text-5xl font-header font-bold text-white mb-2">Custom</div>
                        <p class="text-white/60 font-mono text-sm mb-6">For large organizations</p>
                        <ul class="space-y-3 mb-8 text-sm font-mono">
                            <li class="flex items-center gap-2">
                                <i class="fas fa-check text-nexspark-purple"></i>
                                <span class="text-white/80">Full-stack growth OS</span>
                            </li>
                            <li class="flex items-center gap-2">
                                <i class="fas fa-check text-nexspark-purple"></i>
                                <span class="text-white/80">Custom integrations</span>
                            </li>
                            <li class="flex items-center gap-2">
                                <i class="fas fa-check text-nexspark-purple"></i>
                                <span class="text-white/80">Dedicated account manager</span>
                            </li>
                            <li class="flex items-center gap-2">
                                <i class="fas fa-check text-nexspark-purple"></i>
                                <span class="text-white/80">SLA guarantees</span>
                            </li>
                            <li class="flex items-center gap-2">
                                <i class="fas fa-check text-nexspark-purple"></i>
                                <span class="text-white/80">White-label options</span>
                            </li>
                        </ul>
                        <button onclick="openModal('brand')" class="lcars-btn w-full bg-nexspark-purple hover:bg-nexspark-pale text-black py-3 rounded-lg">
                            CONTACT SALES
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <!-- CTA Section -->
        <section class="relative z-10 py-20 px-4 my-20">
            <div class="max-w-5xl mx-auto">
                <div class="bg-gradient-to-r from-nexspark-gold/20 via-nexspark-blue/20 to-nexspark-purple/20 border-4 border-nexspark-gold/50 rounded-3xl p-12 backdrop-blur-sm text-center">
                    <h2 class="text-4xl md:text-5xl font-header font-bold text-white mb-6 uppercase tracking-tight">
                        Ready to Transform <span class="text-nexspark-gold">Your Growth?</span>
                    </h2>
                    <p class="text-xl text-white/80 font-mono mb-8">
                        Join hundreds of brands and experts already winning with NexSpark
                    </p>
                    <div class="flex flex-col sm:flex-row justify-center gap-4">
                        <button onclick="openModal('brand')" class="lcars-btn bg-white hover:bg-nexspark-gold text-black px-12 py-5 rounded-lg text-xl">
                            <i class="fas fa-rocket mr-2"></i> GET STARTED AS A BRAND
                        </button>
                        <button onclick="openModal('agency')" class="lcars-btn bg-nexspark-purple hover:bg-nexspark-pale text-black px-12 py-5 rounded-lg text-xl">
                            <i class="fas fa-user-tie mr-2"></i> JOIN AS AN EXPERT
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="relative z-10 py-12 px-4 border-t border-nexspark-blue/20">
            <div class="max-w-7xl mx-auto">
                <div class="grid md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <div class="flex items-center mb-4">
                            <i class="fas fa-bolt text-3xl text-nexspark-gold mr-2"></i>
                            <span class="text-2xl font-header font-bold text-white">NEXSPARK</span>
                        </div>
                        <p class="text-white/60 font-mono text-xs">The AI-Powered Operating System for the Agency Economy</p>
                    </div>
                    <div>
                        <h4 class="font-header font-bold text-white mb-4 uppercase tracking-wider">For Brands</h4>
                        <ul class="space-y-2 text-white/60 font-mono text-sm">
                            <li><a href="#for-brands" class="hover:text-nexspark-gold transition">How It Works</a></li>
                            <li><a href="#pricing" class="hover:text-nexspark-gold transition">Pricing</a></li>
                            <li><a href="#" class="hover:text-nexspark-gold transition">Case Studies</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="font-header font-bold text-white mb-4 uppercase tracking-wider">For Experts</h4>
                        <ul class="space-y-2 text-white/60 font-mono text-sm">
                            <li><a href="#for-agencies" class="hover:text-nexspark-purple transition">Join Platform</a></li>
                            <li><a href="#" class="hover:text-nexspark-purple transition">Income Calculator</a></li>
                            <li><a href="#" class="hover:text-nexspark-purple transition">Success Stories</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="font-header font-bold text-white mb-4 uppercase tracking-wider">Company</h4>
                        <ul class="space-y-2 text-white/60 font-mono text-sm">
                            <li><a href="#" class="hover:text-nexspark-blue transition">About Us</a></li>
                            <li><a href="mailto:founders@nexspark.io" class="hover:text-nexspark-blue transition">Contact</a></li>
                            <li><a href="https://nexspark.io" class="hover:text-nexspark-blue transition">Blog</a></li>
                        </ul>
                    </div>
                </div>
                <div class="border-t border-nexspark-blue/20 pt-8 text-center text-white/50 font-mono text-xs">
                    <p>&copy; 2025 NexSpark. The Airbnb for Market Growth. All rights reserved.</p>
                    <div class="mt-4 space-x-6">
                        <a href="https://linkedin.com/company/nexspark" class="hover:text-nexspark-blue transition">
                            <i class="fab fa-linkedin text-2xl"></i>
                        </a>
                        <a href="mailto:founders@nexspark.io" class="hover:text-nexspark-gold transition">
                            <i class="fas fa-envelope text-2xl"></i>
                        </a>
                    </div>
                </div>
            </div>
        </footer>

        <!-- Brand Registration Modal -->
        <div id="brandModal" class="hidden fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div class="bg-nexspark-panel border-2 border-nexspark-blue rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 backdrop-blur-xl">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-3xl font-header font-bold text-white uppercase tracking-wider">
                        <i class="fas fa-building text-nexspark-gold mr-2"></i>
                        Register Your Brand
                    </h3>
                    <button onclick="closeModal('brand')" class="text-white/60 hover:text-white text-3xl transition">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <!-- Google Sign-In Option -->
                <div class="mb-6">
                    <button type="button" onclick="signInWithGoogle()" class="w-full bg-white hover:bg-gray-100 text-black px-6 py-4 rounded-lg font-semibold text-base flex items-center justify-center gap-3 transition shadow-lg">
                        <svg class="w-6 h-6" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <span class="font-header uppercase tracking-wider">Sign in with Google</span>
                    </button>
                    <div class="relative my-6">
                        <div class="absolute inset-0 flex items-center">
                            <div class="w-full border-t border-nexspark-blue/30"></div>
                        </div>
                        <div class="relative flex justify-center text-sm">
                            <span class="px-4 bg-nexspark-panel text-nexspark-blue/70 font-mono uppercase tracking-wider">Or register manually</span>
                        </div>
                    </div>
                </div>
                
                <form id="brandForm" class="space-y-4">
                    <div>
                        <label class="block text-nexspark-blue font-mono text-xs uppercase tracking-widest mb-2">Company Name *</label>
                        <input type="text" name="companyName" required class="w-full px-4 py-3 rounded-lg bg-black border-2 border-nexspark-blue/50 text-white font-mono focus:border-nexspark-gold focus:outline-none transition">
                    </div>
                    <div>
                        <label class="block text-nexspark-blue font-mono text-xs uppercase tracking-widest mb-2">Your Name *</label>
                        <input type="text" name="name" required class="w-full px-4 py-3 rounded-lg bg-black border-2 border-nexspark-blue/50 text-white font-mono focus:border-nexspark-gold focus:outline-none transition">
                    </div>
                    <div>
                        <label class="block text-nexspark-blue font-mono text-xs uppercase tracking-widest mb-2">Email *</label>
                        <input type="email" name="email" required class="w-full px-4 py-3 rounded-lg bg-black border-2 border-nexspark-blue/50 text-white font-mono focus:border-nexspark-gold focus:outline-none transition">
                    </div>
                    <div>
                        <label class="block text-nexspark-blue font-mono text-xs uppercase tracking-widest mb-2">Phone</label>
                        <input type="tel" name="phone" class="w-full px-4 py-3 rounded-lg bg-black border-2 border-nexspark-blue/50 text-white font-mono focus:border-nexspark-gold focus:outline-none transition">
                    </div>
                    <div>
                        <label class="block text-nexspark-blue font-mono text-xs uppercase tracking-widest mb-2">Business Type *</label>
                        <select name="businessType" required class="w-full px-4 py-3 rounded-lg bg-black border-2 border-nexspark-blue/50 text-white font-mono focus:border-nexspark-gold focus:outline-none transition">
                            <option value="">Select type...</option>
                            <option value="d2c">D2C / E-commerce</option>
                            <option value="saas">SaaS</option>
                            <option value="b2b">B2B Services</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-nexspark-blue font-mono text-xs uppercase tracking-widest mb-2">Monthly Ad Spend *</label>
                        <select name="adSpend" required class="w-full px-4 py-3 rounded-lg bg-black border-2 border-nexspark-blue/50 text-white font-mono focus:border-nexspark-gold focus:outline-none transition">
                            <option value="">Select range...</option>
                            <option value="0-2k">$0 - $2,000</option>
                            <option value="2k-10k">$2,000 - $10,000</option>
                            <option value="10k-20k">$10,000 - $20,000</option>
                            <option value="20k-50k">$20,000 - $50,000</option>
                            <option value="50k+">$50,000+</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-nexspark-blue font-mono text-xs uppercase tracking-widest mb-2">Website</label>
                        <input type="url" name="website" placeholder="https://" class="w-full px-4 py-3 rounded-lg bg-black border-2 border-nexspark-blue/50 text-white font-mono focus:border-nexspark-gold focus:outline-none transition">
                    </div>
                    <div>
                        <label class="block text-nexspark-blue font-mono text-xs uppercase tracking-widest mb-2">Current Channels</label>
                        <textarea name="currentChannels" rows="2" placeholder="e.g., Facebook Ads, Google Ads, SEO..." class="w-full px-4 py-3 rounded-lg bg-black border-2 border-nexspark-blue/50 text-white font-mono focus:border-nexspark-gold focus:outline-none transition"></textarea>
                    </div>
                    <div>
                        <label class="block text-nexspark-blue font-mono text-xs uppercase tracking-widest mb-2">Biggest Growth Challenge</label>
                        <textarea name="challenge" rows="2" placeholder="Tell us about your main growth obstacles..." class="w-full px-4 py-3 rounded-lg bg-black border-2 border-nexspark-blue/50 text-white font-mono focus:border-nexspark-gold focus:outline-none transition"></textarea>
                    </div>
                    <button type="submit" class="lcars-btn w-full bg-nexspark-gold hover:bg-nexspark-pale text-black py-4 rounded-lg font-bold text-lg">
                        <i class="fas fa-paper-plane mr-2"></i> SUBMIT REGISTRATION
                    </button>
                </form>
                <div id="brandFormMessage" class="mt-4 hidden"></div>
            </div>
        </div>

        <!-- Agency Registration Modal -->
        <div id="agencyModal" class="hidden fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div class="bg-nexspark-panel border-2 border-nexspark-purple rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 backdrop-blur-xl">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-3xl font-header font-bold text-white uppercase tracking-wider">
                        <i class="fas fa-user-tie text-nexspark-purple mr-2"></i>
                        Join as Growth Expert
                    </h3>
                    <button onclick="closeModal('agency')" class="text-white/60 hover:text-white text-3xl transition">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <form id="agencyForm" class="space-y-4">
                    <div>
                        <label class="block text-nexspark-purple font-mono text-xs uppercase tracking-widest mb-2">Your Name *</label>
                        <input type="text" name="name" required class="w-full px-4 py-3 rounded-lg bg-black border-2 border-nexspark-purple/50 text-white font-mono focus:border-nexspark-gold focus:outline-none transition">
                    </div>
                    <div>
                        <label class="block text-nexspark-purple font-mono text-xs uppercase tracking-widest mb-2">Email *</label>
                        <input type="email" name="email" required class="w-full px-4 py-3 rounded-lg bg-black border-2 border-nexspark-purple/50 text-white font-mono focus:border-nexspark-gold focus:outline-none transition">
                    </div>
                    <div>
                        <label class="block text-nexspark-purple font-mono text-xs uppercase tracking-widest mb-2">Phone</label>
                        <input type="tel" name="phone" class="w-full px-4 py-3 rounded-lg bg-black border-2 border-nexspark-purple/50 text-white font-mono focus:border-nexspark-gold focus:outline-none transition">
                    </div>
                    <div>
                        <label class="block text-nexspark-purple font-mono text-xs uppercase tracking-widest mb-2">I am a... *</label>
                        <select name="expertType" required class="w-full px-4 py-3 rounded-lg bg-black border-2 border-nexspark-purple/50 text-white font-mono focus:border-nexspark-gold focus:outline-none transition">
                            <option value="">Select type...</option>
                            <option value="freelancer">Freelancer</option>
                            <option value="agency">Micro Agency (2-10 people)</option>
                            <option value="large-agency">Agency (10+ people)</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-nexspark-purple font-mono text-xs uppercase tracking-widest mb-2">Company/Agency Name</label>
                        <input type="text" name="companyName" class="w-full px-4 py-3 rounded-lg bg-black border-2 border-nexspark-purple/50 text-white font-mono focus:border-nexspark-gold focus:outline-none transition">
                    </div>
                    <div>
                        <label class="block text-nexspark-purple font-mono text-xs uppercase tracking-widest mb-2">Specialization *</label>
                        <select name="specialization" required class="w-full px-4 py-3 rounded-lg bg-black border-2 border-nexspark-purple/50 text-white font-mono focus:border-nexspark-gold focus:outline-none transition">
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
                        <label class="block text-nexspark-purple font-mono text-xs uppercase tracking-widest mb-2">Years of Experience *</label>
                        <select name="experience" required class="w-full px-4 py-3 rounded-lg bg-black border-2 border-nexspark-purple/50 text-white font-mono focus:border-nexspark-gold focus:outline-none transition">
                            <option value="">Select years...</option>
                            <option value="1-2">1-2 years</option>
                            <option value="3-5">3-5 years</option>
                            <option value="5-10">5-10 years</option>
                            <option value="10+">10+ years</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-nexspark-purple font-mono text-xs uppercase tracking-widest mb-2">Current Clients</label>
                        <input type="number" name="currentClients" placeholder="e.g., 5" class="w-full px-4 py-3 rounded-lg bg-black border-2 border-nexspark-purple/50 text-white font-mono focus:border-nexspark-gold focus:outline-none transition">
                    </div>
                    <div>
                        <label class="block text-nexspark-purple font-mono text-xs uppercase tracking-widest mb-2">Portfolio/LinkedIn URL</label>
                        <input type="url" name="portfolio" placeholder="https://" class="w-full px-4 py-3 rounded-lg bg-black border-2 border-nexspark-purple/50 text-white font-mono focus:border-nexspark-gold focus:outline-none transition">
                    </div>
                    <div>
                        <label class="block text-nexspark-purple font-mono text-xs uppercase tracking-widest mb-2">Notable Results</label>
                        <textarea name="results" rows="2" placeholder="e.g., Scaled client from $10k to $100k monthly revenue..." class="w-full px-4 py-3 rounded-lg bg-black border-2 border-nexspark-purple/50 text-white font-mono focus:border-nexspark-gold focus:outline-none transition"></textarea>
                    </div>
                    <div>
                        <label class="block text-nexspark-purple font-mono text-xs uppercase tracking-widest mb-2">Why Join NexSpark?</label>
                        <textarea name="motivation" rows="2" placeholder="Tell us what interests you..." class="w-full px-4 py-3 rounded-lg bg-black border-2 border-nexspark-purple/50 text-white font-mono focus:border-nexspark-gold focus:outline-none transition"></textarea>
                    </div>
                    <button type="submit" class="lcars-btn w-full bg-nexspark-purple hover:bg-nexspark-pale text-black py-4 rounded-lg font-bold text-lg">
                        <i class="fas fa-paper-plane mr-2"></i> SUBMIT APPLICATION
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
