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
import {
  generateEnhancedSummary,
  generateComprehensiveReport,
  generateCompetitorPreview,
  type InterviewData,
  type CompetitorInsight,
  type FullReport
} from './services/report-generation'
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
app.get('/interview-summary', (c) => c.redirect('/static/interview-summary.html'))
app.get('/website-confirmation', (c) => c.redirect('/static/website-confirmation.html'))
app.get('/report-preview', (c) => c.redirect('/static/report-preview.html'))
app.get('/payment', (c) => c.redirect('/static/payment.html'))
app.get('/full-report', (c) => c.redirect('/static/full-report.html'))
app.get('/dashboard', (c) => c.redirect('/static/dashboard.html'))

// Admin routes
app.get('/admin/prompts', (c) => c.redirect('/static/admin-prompts.html'))

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
// INTERVIEW SUMMARY & PREVIEW ENDPOINTS
// ==========================================

// Helper: Get custom prompt or default
function getCustomPrompt(c: any, promptType: string, defaultPrompt: string): string {
  try {
    const customPromptsHeader = c.req.header('X-Custom-Prompts');
    if (customPromptsHeader) {
      const prompts = JSON.parse(customPromptsHeader);
      return prompts[promptType] || defaultPrompt;
    }
  } catch (error) {
    console.log('No custom prompts provided, using default');
  }
  return defaultPrompt;
}

// Helper: AI generation with Claude → OpenAI fallback
async function generateWithAI(
  prompt: string,
  env: any,
  systemMessage: string = 'You are a helpful business analyst. Return ONLY valid JSON, no markdown, no code blocks.'
): Promise<{ content: string; provider: string }> {
  const claudeApiKey = env.ANTHROPIC_API_KEY;
  const openaiApiKey = env.OPENAI_API_KEY;
  const openaiBaseUrl = env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

  // Try Claude first if available
  if (claudeApiKey && claudeApiKey.startsWith('sk-ant-')) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': claudeApiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 2048,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        return { content: data.content[0].text, provider: 'Claude' };
      }
    } catch (error) {
      console.warn('Claude failed, using OpenAI fallback');
    }
  }

  // Fallback to OpenAI
  if (openaiApiKey) {
    const response = await fetch(`${openaiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.7,
        max_tokens: 2048,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API failed: ${response.statusText}`);
    }

    const data = await response.json();
    return { content: data.choices[0].message.content.trim(), provider: 'OpenAI' };
  }

  throw new Error('No AI provider available');
}

// API: Generate enhanced summary with Claude 4.5 Sonnet
app.post('/api/interview/summarize', async (c) => {
  try {
    const { env } = c;
    const { responses } = await c.req.json();

    if (!responses || !Array.isArray(responses)) {
      return c.json({ 
        success: false, 
        message: 'Interview responses required' 
      }, 400);
    }

    console.log('📊 Generating enhanced summary with Claude 4.5 Sonnet...');

    // Use the enhanced summary generation with Claude 4.5 Sonnet
    const summary = await generateEnhancedSummary(responses, env);

    console.log(`✅ Enhanced summary generated successfully for ${summary.brandName}`);

    return c.json({
      success: true,
      summary,
      provider: 'Claude 4.5 Sonnet'
    });

  } catch (error) {
    console.error('Error generating summary:', error);
    
    // Fallback to basic summary if Claude fails
    try {
      console.log('⚠️ Claude failed, attempting OpenAI fallback...');
      
      const openaiApiKey = env.OPENAI_API_KEY;
      const openaiBaseUrl = env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
      
      if (!openaiApiKey) {
        throw new Error('No fallback AI provider available');
      }

      const transcript = responses.map((r: any, idx: number) => 
        `Q${idx + 1}: ${r.question}\nA${idx + 1}: ${r.answer}`
      ).join('\n\n');

      const prompt = `Based on this interview, provide a structured summary in JSON format:

${transcript}

Return ONLY a JSON object with this exact structure:
{
  "brandName": "...",
  "productDescription": "...",
  "currentRevenue": "...",
  "marketingChannels": ["..."],
  "biggestChallenge": "...",
  "idealCustomer": "...",
  "competitors": ["..."],
  "sixMonthGoal": "...",
  "industry": "..."
}`;

      const response = await fetch(`${openaiBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0.7,
          max_tokens: 2048,
          messages: [
            { role: 'system', content: 'Return ONLY valid JSON, no markdown.' },
            { role: 'user', content: prompt }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('OpenAI fallback also failed');
      }

      const data = await response.json();
      const summaryText = data.choices[0].message.content.trim();
      const jsonMatch = summaryText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('Failed to parse JSON from fallback');
      }

      const summary = JSON.parse(jsonMatch[0]);
      console.log('✅ Summary generated with OpenAI fallback');

      return c.json({
        success: true,
        summary,
        provider: 'OpenAI (fallback)'
      });

    } catch (fallbackError) {
      console.error('Both Claude and OpenAI failed:', fallbackError);
      return c.json({
        success: false,
        message: 'Failed to generate summary with both providers'
      }, 500);
    }
  }
});

// API: Generate competitor preview with Claude 4.5 Sonnet
app.post('/api/preview/competitors', async (c) => {
  try {
    const { env } = c;
    const { website, industry, competitors } = await c.req.json();

    if (!competitors || competitors.length === 0) {
      return c.json({ 
        success: false, 
        message: 'Competitors list required' 
      }, 400);
    }

    console.log('🔍 Generating competitor analysis with Claude 4.5 Sonnet...', { count: competitors.length, industry });

    // Use Claude 4.5 Sonnet for enhanced competitor analysis
    const competitorInsights = await generateCompetitorPreview(
      website || 'your-company.com',
      industry || 'Technology',
      competitors,
      env
    );

    console.log(`✅ Competitor analysis complete: analyzed ${competitorInsights.length} competitors`);

    return c.json({
      success: true,
      competitors: competitorInsights
    });

  } catch (error) {
    console.error('Error analyzing competitors:', error);
    return c.json({
      success: false,
      message: 'Failed to analyze competitors'
    }, 500);
  }
});

// API: Generate 6-month roadmap preview (high-level)
app.post('/api/preview/roadmap', async (c) => {
  try {
    const { env } = c;
    const { summary } = await c.req.json();

    if (!summary) {
      return c.json({ 
        success: false, 
        message: 'Interview summary required' 
      }, 400);
    }

    const prompt = `Based on this business summary, create a high-level 6-month growth roadmap preview with 3 phases:

Brand: ${summary.brandName}
Product: ${summary.productDescription}
Current Revenue: ${summary.currentRevenue}
Goal: ${summary.sixMonthGoal}
Challenge: ${summary.biggestChallenge}

Return ONLY a JSON object with this structure (no markdown, no explanations):
{
  "phases": [
    {
      "months": "1-2",
      "name": "...",
      "actions": ["...", "..."],
      "goal": "..."
    },
    {
      "months": "3-4",
      "name": "...",
      "actions": ["...", "..."],
      "goal": "..."
    },
    {
      "months": "5-6",
      "name": "...",
      "actions": ["...", "..."],
      "goal": "..."
    }
  ],
  "expectedOutcome": "..."
}`;

    console.log('📅 Generating roadmap preview...');
    const { content, provider } = await generateWithAI(prompt, env);
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse roadmap JSON');
    }

    const roadmap = JSON.parse(jsonMatch[0]);
    console.log(`✅ Roadmap generated with ${provider}`);

    return c.json({
      success: true,
      roadmap,
      provider
    });

  } catch (error) {
    console.error('Error generating roadmap preview:', error);
    return c.json({
      success: false,
      message: 'Failed to generate roadmap preview'
    }, 500);
  }
});

// API: Generate paid ads benchmarks preview
app.post('/api/preview/benchmarks', async (c) => {
  try {
    const { env } = c;
    const { summary } = await c.req.json();

    if (!summary) {
      return c.json({ 
        success: false, 
        message: 'Interview summary required' 
      }, 400);
    }

    const prompt = `Based on this business, provide realistic paid advertising benchmarks:

Product: ${summary.productDescription}
Industry: ${summary.industry || 'General'}
Current Revenue: ${summary.currentRevenue}

Return ONLY a JSON object with this structure (no markdown, no explanations):
{
  "googleAds": {
    "targetCPC": "$X.XX",
    "expectedCTR": "X.X%",
    "projectedCAC": "$XX",
    "recommendedBudget": "$X,XXX/month",
    "expectedROI": "Xx"
  },
  "facebookAds": {
    "targetCPM": "$XX",
    "expectedCTR": "X.X%",
    "projectedCAC": "$XX",
    "recommendedBudget": "$X,XXX/month",
    "expectedROI": "Xx"
  },
  "recommendation": "..."
}`;

    console.log('📈 Generating benchmarks preview...');
    const { content, provider } = await generateWithAI(prompt, env);
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse benchmarks JSON');
    }

    const benchmarks = JSON.parse(jsonMatch[0]);
    console.log(`✅ Benchmarks generated with ${provider}`);

    return c.json({
      success: true,
      benchmarks,
      provider
    });

  } catch (error) {
    console.error('Error generating benchmarks preview:', error);
    return c.json({
      success: false,
      message: 'Failed to generate benchmarks preview'
    }, 500);
  }
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
    const { userId, userEmail, interviewId, amount } = await c.req.json();

    if (!userId || !userEmail) {
      return c.json({ 
        success: false, 
        message: 'Missing required parameters (userId and userEmail)' 
      }, 400);
    }

    // Check if already paid (only if interviewId provided and DB available)
    if (interviewId && env.DB) {
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

    console.log('💳 Creating payment intent for user:', userId, 'email:', userEmail, 'amount:', amount || 2000);

    // Use provided interviewId or generate a temporary one
    const effectiveInterviewId = interviewId || `temp_${userId}_${Date.now()}`;

    const paymentIntent = await createPaymentIntent(
      userId,
      userEmail,
      effectiveInterviewId,
      stripeSecretKey
    );

    console.log('✅ Payment intent created:', paymentIntent.paymentIntentId);

    return c.json({
      success: true,
      clientSecret: paymentIntent.clientSecret,
      paymentIntentId: paymentIntent.paymentIntentId,
      amount: paymentIntent.amount
    });
  } catch (error) {
    console.error('❌ Error creating payment intent:', error);
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

// =============================================================================
// FULL REPORT GENERATION API (Claude 3.5 Sonnet)
// =============================================================================

// API: Generate comprehensive slide-formatted report
app.post('/api/report/generate', async (c) => {
  try {
    const { env } = c;
    const { summary, competitors, userId, interviewId } = await c.req.json();

    if (!summary) {
      return c.json({ 
        success: false, 
        message: 'Interview summary required' 
      }, 400);
    }

    // Optional: Verify payment before generating report
    if (userId && interviewId && env.DB) {
      const hasPaid = await hasUserPaid(env.DB, userId, interviewId);
      if (!hasPaid) {
        return c.json({
          success: false,
          message: 'Payment required to generate full report',
          requiresPayment: true
        }, 402);
      }
    }

    console.log(`📊 Generating comprehensive report for ${summary.brandName}...`);

    // Prepare competitor insights
    const competitorInsights: CompetitorInsight[] = competitors || [];

    // Generate comprehensive report with Claude 3.5 Sonnet
    const report: FullReport = await generateComprehensiveReport(
      summary as InterviewData,
      competitorInsights,
      env
    );

    console.log(`✅ Comprehensive report generated: ${report.slides.length} slides`);

    return c.json({
      success: true,
      report,
      metadata: {
        slideCount: report.slides.length,
        brandName: summary.brandName,
        generatedAt: report.metadata.generatedAt,
        provider: report.metadata.provider
      }
    });

  } catch (error) {
    console.error('Error generating comprehensive report:', error);
    return c.json({
      success: false,
      message: 'Failed to generate report: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, 500);
  }
});

// =============================================================================
// MINIMUM VIABLE AGENT API (Day 1)
// =============================================================================

import { MinimumViableAgent } from './services/agent/minimum-viable-agent'

// MVAgent test page
app.get('/mvagent-test', (c) => c.redirect('/static/mvagent-test.html'));

// Execute agent request
app.post('/api/agent/execute', async (c) => {
  try {
    const { userId, request, context } = await c.req.json();
    
    if (!userId || !request) {
      return c.json({
        success: false,
        message: 'userId and request are required'
      }, 400);
    }
    
    const agent = new MinimumViableAgent(c.env);
    const result = await agent.execute({ userId, request, context });
    
    return c.json(result);
    
  } catch (error: any) {
    console.error('[API] Error executing agent:', error);
    return c.json({
      success: false,
      message: error.message || 'Failed to execute agent'
    }, 500);
  }
});

// Get agent execution status
app.get('/api/agent/status/:executionId', async (c) => {
  try {
    const executionId = c.req.param('executionId');
    
    const agent = new MinimumViableAgent(c.env);
    const status = await agent.getStatus(executionId);
    
    if (!status) {
      return c.json({
        success: false,
        message: 'Execution not found'
      }, 404);
    }
    
    return c.json({
      success: true,
      execution: status
    });
    
  } catch (error: any) {
    console.error('[API] Error getting agent status:', error);
    return c.json({
      success: false,
      message: error.message || 'Failed to get status'
    }, 500);
  }
});

// Main landing page - AI Growth Co-Founder Focus (Revised)
app.get('/', (c) => {
  return c.html(REVISED_LANDING_HTML)

})

// ==========================================
// MINIMUM VIABLE AGENT API ENDPOINTS (Day 1)
// ==========================================

import { MinimumViableAgent } from './services/agent/minimum-viable-agent'

// Execute agent request
app.post('/api/agent/execute', async (c) => {
  try {
    const { userId, request, context } = await c.req.json()
    
    if (!userId || !request) {
      return c.json({
        success: false,
        message: 'userId and request are required'
      }, 400)
    }
    
    const agent = new MinimumViableAgent(c.env)
    const result = await agent.execute({ userId, request, context })
    
    return c.json(result)
  } catch (error: any) {
    console.error('[API] Agent execution error:', error)
    return c.json({
      success: false,
      message: error.message
    }, 500)
  }
})

// Get agent execution status
app.get('/api/agent/status/:executionId', async (c) => {
  try {
    const executionId = c.req.param('executionId')
    
    const agent = new MinimumViableAgent(c.env)
    const status = await agent.getStatus(executionId)
    
    if (!status) {
      return c.json({
        success: false,
        message: 'Execution not found'
      }, 404)
    }
    
    return c.json({
      success: true,
      execution: status
    })
  } catch (error: any) {
    console.error('[API] Agent status error:', error)
    return c.json({
      success: false,
      message: error.message
    }, 500)
  }
})

// Test endpoint - simple agent test
app.get('/api/agent/test', async (c) => {
  const agent = new MinimumViableAgent(c.env)
  const result = await agent.execute({
    userId: 'test-user',
    request: 'What are the top 3 growth strategies for a SaaS company targeting $100M revenue?'
  })
  
  return c.json(result)
})

// Agent test page
app.get('/agent-test', (c) => c.redirect('/static/agent-test.html'))

export default app
