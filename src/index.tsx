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
import {
  analyzeInterview as analyzeInterviewTranscript,
  verifyWebsiteAndResearch,
  generateGTMStrategy,
  generateStrategyReport,
  type InterviewTranscript,
  type GTMStrategy
} from './services/post-interview-analysis'
import {
  createPaymentIntent,
  verifyPayment,
  recordPayment,
  hasUserPaid
} from './services/stripe-payment'
import { REVISED_LANDING_HTML } from './revised-landing'

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

// Strategy Analysis route (post-interview) - preserve query params
app.get('/strategy-analysis', (c) => {
  const query = new URL(c.req.url).search;
  return c.redirect(`/static/strategy-analysis.html${query}`)
})

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

// ==========================================
// POST-INTERVIEW ANALYSIS & PAYMENT ENDPOINTS
// ==========================================

// API: Analyze completed interview and generate business profile
app.post('/api/analysis/start', async (c) => {
  try {
    const { env } = c;
    const body = await c.req.json();
    const { interviewId, userId, responses } = body;

    if (!interviewId || !userId) {
      return c.json({ 
        success: false, 
        message: 'Interview ID and User ID are required' 
      }, 400);
    }

    let transcript: InterviewTranscript;

    // If database is configured, fetch from DB
    if (env.DB) {
      const { getInterview } = await import('./services/database');
      const interview = await getInterview(env.DB, interviewId);

      if (!interview) {
        return c.json({ 
          success: false, 
          message: 'Interview not found' 
        }, 404);
      }

      // Prepare transcript from database
      transcript = {
        userId: interview.user_id,
        interviewId: interview.id,
        responses: JSON.parse(interview.responses),
        completedAt: interview.updated_at
      };
    } else {
      // Fallback: Use responses from request body (localStorage mode)
      console.log('Database not configured - using localStorage mode');
      
      if (!responses || !Array.isArray(responses) || responses.length === 0) {
        return c.json({ 
          success: false, 
          message: 'Interview responses are required when database is not configured' 
        }, 400);
      }

      transcript = {
        userId,
        interviewId,
        responses,
        completedAt: new Date().toISOString()
      };
    }

    const claudeApiKey = env.ANTHROPIC_API_KEY || '';
    
    console.log('Analyzing interview transcript...', {
      mode: env.DB ? 'database' : 'localStorage',
      responseCount: transcript.responses.length,
      hasClaudeKey: !!claudeApiKey,
      keyLength: claudeApiKey ? claudeApiKey.length : 0
    });
    
    if (!claudeApiKey) {
      return c.json({
        success: false,
        error: 'Claude API key not configured',
        message: 'ANTHROPIC_API_KEY environment variable is not set. Please configure it in Cloudflare Pages settings.'
      }, 500);
    }
    
    // Analyze interview to extract business profile
    const businessProfile = await analyzeInterviewTranscript(transcript, claudeApiKey);

    return c.json({
      success: true,
      businessProfile,
      message: 'Interview analysis complete. Please verify your website.'
    });
  } catch (error) {
    console.error('Error starting analysis:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to analyze interview: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, 500);
  }
});

// API: Verify website and initiate competitor research
app.post('/api/analysis/research', async (c) => {
  try {
    const { env } = c;
    const { website, userId, interviewId } = await c.req.json();

    if (!website) {
      return c.json({ 
        success: false, 
        message: 'Website is required' 
      }, 400);
    }

    const claudeApiKey = env.ANTHROPIC_API_KEY || '';
    const rapidApiKey = env.RAPIDAPI_KEY || '';

    console.log('Verifying website and researching competitors:', website);

    // Verify website and identify competitors
    const research = await verifyWebsiteAndResearch(website, claudeApiKey, rapidApiKey);

    if (!research.valid) {
      return c.json({
        success: false,
        message: 'Could not verify website. Please check the URL and try again.'
      }, 400);
    }

    return c.json({
      success: true,
      website: website,
      competitors: research.competitors,
      websiteContent: research.scraped_content,
      message: 'Competitor research complete. Generating strategy...'
    });
  } catch (error) {
    console.error('Error researching competitors:', error);
    return c.json({
      success: false,
      message: 'Failed to research competitors: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, 500);
  }
});

// API: Generate GTM strategy (requires payment)
app.post('/api/analysis/generate-strategy', async (c) => {
  try {
    const { env } = c;
    const { userId, interviewId, businessProfile, competitors, websiteContent } = await c.req.json();

    if (!userId || !interviewId || !businessProfile) {
      return c.json({ 
        success: false, 
        message: 'Missing required parameters' 
      }, 400);
    }

    // Check if user has paid for this report
    if (env.DB) {
      const hasPaid = await hasUserPaid(env.DB, userId, interviewId);
      
      if (!hasPaid) {
        return c.json({
          success: false,
          requiresPayment: true,
          message: 'Payment required to access full strategy report',
          amount: 2000, // $20.00
          currency: 'usd'
        }, 402); // 402 Payment Required
      }
    }

    const claudeApiKey = env.ANTHROPIC_API_KEY || '';
    const rapidApiKey = env.RAPIDAPI_KEY || '';

    console.log('Generating GTM strategy for:', businessProfile.brandName);

    // Generate comprehensive GTM strategy
    const strategy = await generateGTMStrategy(
      businessProfile,
      competitors || [],
      websiteContent || '',
      claudeApiKey,
      rapidApiKey
    );

    // Generate HTML report
    const htmlReport = generateStrategyReport(strategy);

    // Save to database
    if (env.DB) {
      await env.DB.prepare(`
        INSERT INTO strategy_reports (
          id, user_id, interview_id, business_profile, gtm_strategy, html_report, paid, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        `report_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
        userId,
        interviewId,
        JSON.stringify(businessProfile),
        JSON.stringify(strategy),
        htmlReport,
        1,
        new Date().toISOString()
      ).run();
    }

    return c.json({
      success: true,
      strategy,
      htmlReport,
      message: 'GTM strategy generated successfully'
    });
  } catch (error) {
    console.error('Error generating strategy:', error);
    return c.json({
      success: false,
      message: 'Failed to generate strategy: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, 500);
  }
});

// API: Create payment intent for report purchase
app.post('/api/payment/create-intent', async (c) => {
  try {
    const { env } = c;
    const { userId, userEmail, interviewId } = await c.req.json();

    if (!userId || !userEmail || !interviewId) {
      return c.json({ 
        success: false, 
        message: 'Missing required parameters' 
      }, 400);
    }

    // Check if already paid
    if (env.DB) {
      const hasPaid = await hasUserPaid(env.DB, userId, interviewId);
      if (hasPaid) {
        return c.json({
          success: false,
          message: 'Report already purchased for this interview'
        }, 400);
      }
    }

    const stripeSecretKey = env.STRIPE_SECRET_KEY || '';
    
    if (!stripeSecretKey) {
      return c.json({
        success: false,
        message: 'Payment processing not configured'
      }, 500);
    }

    console.log('Creating payment intent for user:', userId);

    const paymentIntent = await createPaymentIntent(
      userId,
      userEmail,
      interviewId,
      stripeSecretKey
    );

    return c.json({
      success: true,
      clientSecret: paymentIntent.clientSecret,
      paymentIntentId: paymentIntent.paymentIntentId,
      amount: paymentIntent.amount
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return c.json({
      success: false,
      message: 'Failed to create payment: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, 500);
  }
});

// API: Verify payment and unlock report
app.post('/api/payment/verify', async (c) => {
  try {
    const { env } = c;
    const { paymentIntentId, userId, interviewId } = await c.req.json();

    if (!paymentIntentId || !userId || !interviewId) {
      return c.json({ 
        success: false, 
        message: 'Missing required parameters' 
      }, 400);
    }

    const stripeSecretKey = env.STRIPE_SECRET_KEY || '';

    console.log('Verifying payment:', paymentIntentId);

    const verification = await verifyPayment(paymentIntentId, stripeSecretKey);

    if (!verification.paid) {
      return c.json({
        success: false,
        message: 'Payment not completed'
      }, 402);
    }

    // Record payment in database
    if (env.DB) {
      await recordPayment(env.DB, userId, interviewId, paymentIntentId, verification.amount);
    }

    return c.json({
      success: true,
      paid: true,
      message: 'Payment verified successfully'
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return c.json({
      success: false,
      message: 'Failed to verify payment: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, 500);
  }
});

// API: Check payment status for interview
app.get('/api/payment/status', async (c) => {
  try {
    const { env } = c;
    const userId = c.req.query('userId');
    const interviewId = c.req.query('interviewId');

    if (!userId || !interviewId) {
      return c.json({ 
        success: false, 
        message: 'User ID and Interview ID are required' 
      }, 400);
    }

    if (!env.DB) {
      return c.json({ paid: false });
    }

    const hasPaid = await hasUserPaid(env.DB, userId, interviewId);

    return c.json({
      success: true,
      paid: hasPaid
    });
  } catch (error) {
    console.error('Error checking payment status:', error);
    return c.json({
      success: false,
      paid: false
    }, 500);
  }
});

// Main landing page - AI Growth Co-Founder Focus (Revised)
app.get('/', (c) => {
  return c.html(REVISED_LANDING_HTML)

})

export default app
