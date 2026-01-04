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

// API: Generate Claude summary of interview responses
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

    // Build transcript for AI
    const transcript = responses.map((r: any, idx: number) => 
      `Q${idx + 1}: ${r.question}\nA${idx + 1}: ${r.answer}`
    ).join('\n\n');

    const defaultPrompt = `Based on this interview, please provide a structured summary in JSON format:

${transcript}

Return ONLY a JSON object with this exact structure (no markdown, no explanation):
{
  "brandName": "...",
  "productDescription": "...",
  "founded": "...",
  "motivation": "...",
  "currentRevenue": "...",
  "marketingChannels": ["..."],
  "bestChannel": "...",
  "biggestChallenge": "...",
  "idealCustomer": "...",
  "competitors": ["..."],
  "sixMonthGoal": "..."
}`;

    const prompt = getCustomPrompt(c, 'summary', defaultPrompt)
      .replace('{transcript}', transcript)
      .replace('{responseCount}', responses.length.toString());

    // Try Claude first, fallback to OpenAI if Claude fails
    const claudeApiKey = env.ANTHROPIC_API_KEY;
    const openaiApiKey = env.OPENAI_API_KEY;
    const openaiBaseUrl = env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

    let summary;
    let usedProvider = 'none';

    // Try Claude first if available
    if (claudeApiKey && claudeApiKey.startsWith('sk-ant-')) {
      try {
        console.log('📊 Generating interview summary with Claude...');
        
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
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ]
          })
        });

        if (response.ok) {
          const data = await response.json();
          const summaryText = data.content[0].text;
          
          // Parse JSON from Claude's response
          const jsonMatch = summaryText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            summary = JSON.parse(jsonMatch[0]);
            usedProvider = 'Claude';
          }
        } else {
          const errorBody = await response.text();
          console.warn('Claude API failed, falling back to OpenAI:', errorBody);
        }
      } catch (claudeError) {
        console.warn('Claude error, falling back to OpenAI:', claudeError);
      }
    }

    // Fallback to OpenAI if Claude failed or not configured
    if (!summary && openaiApiKey) {
      try {
        console.log('📊 Generating interview summary with OpenAI...');
        
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
              {
                role: 'system',
                content: 'You are a business analyst helping startup founders. Return ONLY valid JSON, no markdown formatting, no code blocks, no explanations.'
              },
              {
                role: 'user',
                content: prompt
              }
            ]
          })
        });

        if (!response.ok) {
          const errorBody = await response.text();
          console.error('OpenAI API error:', errorBody);
          throw new Error(`OpenAI API failed: ${response.statusText}`);
        }

        const data = await response.json();
        const summaryText = data.choices[0].message.content.trim();
        
        // Parse JSON from OpenAI's response (handle potential markdown)
        const jsonMatch = summaryText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('Failed to parse JSON from OpenAI response');
        }
        
        summary = JSON.parse(jsonMatch[0]);
        usedProvider = 'OpenAI';
      } catch (openaiError) {
        console.error('OpenAI error:', openaiError);
        throw openaiError;
      }
    }

    if (!summary) {
      throw new Error('No AI provider available or all failed');
    }

    console.log(`✅ Interview summary generated successfully using ${usedProvider}`);

    return c.json({
      success: true,
      summary,
      provider: usedProvider
    });

  } catch (error) {
    console.error('Error generating summary:', error);
    return c.json({
      success: false,
      message: 'Failed to generate summary: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, 500);
  }
});

// API: Generate competitor preview (lightweight version)
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

    const rapidApiKey = env.RAPIDAPI_KEY;
    const rapidApiHost = 'similarweb-data.p.rapidapi.com';

    console.log('🔍 Analyzing competitors...', { count: competitors.length, industry });

    // Comprehensive database of known competitors with traffic estimates
    const knownCompetitors: Record<string, {traffic: string, strength: string, weakness: string}> = {
      // E-commerce giants
      'amazon.com': { traffic: '2.5B+', strength: 'Massive product selection & Prime ecosystem', weakness: 'Crowded marketplace, hard to differentiate' },
      'walmart.com': { traffic: '410M+', strength: 'Trusted brand & competitive pricing', weakness: 'Limited online innovation' },
      'target.com': { traffic: '180M+', strength: 'Curated product selection & brand partnerships', weakness: 'Smaller scale than Amazon/Walmart' },
      'ebay.com': { traffic: '850M+', strength: 'Auction model & unique items', weakness: 'Quality concerns & seller disputes' },
      'etsy.com': { traffic: '450M+', strength: 'Handmade & vintage focus', weakness: 'Niche market, higher prices' },
      'shopify.com': { traffic: '110M+', strength: 'Easy store setup & integrations', weakness: 'Monthly fees & transaction costs' },
      
      // Social media
      'facebook.com': { traffic: '3B+', strength: 'Massive user base & ad targeting', weakness: 'Declining youth engagement' },
      'instagram.com': { traffic: '2B+', strength: 'Visual content & influencer marketing', weakness: 'Algorithm changes affect reach' },
      'twitter.com': { traffic: '500M+', strength: 'Real-time news & trends', weakness: 'Bot accounts & content moderation' },
      'x.com': { traffic: '500M+', strength: 'Real-time engagement', weakness: 'Platform instability' },
      'linkedin.com': { traffic: '310M+', strength: 'Professional networking & B2B leads', weakness: 'High ad costs' },
      'tiktok.com': { traffic: '1.5B+', strength: 'Viral content & young audience', weakness: 'Short attention spans' },
      'pinterest.com': { traffic: '450M+', strength: 'Visual discovery & shopping intent', weakness: 'Female-skewed audience' },
      'snapchat.com': { traffic: '400M+', strength: 'Augmented reality & youth engagement', weakness: 'Difficult to track ROI' },
      
      // Tech & productivity
      'google.com': { traffic: '5B+', strength: 'Dominant search & advertising', weakness: 'Privacy concerns' },
      'microsoft.com': { traffic: '1.2B+', strength: 'Enterprise dominance & Office suite', weakness: 'Complex pricing' },
      'apple.com': { traffic: '900M+', strength: 'Premium brand & ecosystem lock-in', weakness: 'High prices limit market' },
      'slack.com': { traffic: '50M+', strength: 'Team collaboration & integrations', weakness: 'Can be overwhelming, notification fatigue' },
      'asana.com': { traffic: '35M+', strength: 'Project management & workflow automation', weakness: 'Learning curve for complex features' },
      'notion.so': { traffic: '100M+', strength: 'All-in-one workspace & flexibility', weakness: 'Can be slow, steep learning curve' },
      'trello.com': { traffic: '45M+', strength: 'Simple kanban boards', weakness: 'Limited advanced features' },
      'monday.com': { traffic: '40M+', strength: 'Visual project tracking', weakness: 'Expensive for small teams' },
      'zoom.us': { traffic: '300M+', strength: 'Reliable video conferencing', weakness: 'Security concerns' },
      
      // SaaS & marketing
      'salesforce.com': { traffic: '150M+', strength: 'CRM leader & AppExchange', weakness: 'Complex & expensive' },
      'hubspot.com': { traffic: '75M+', strength: 'All-in-one marketing platform', weakness: 'Can get expensive as you scale' },
      'mailchimp.com': { traffic: '85M+', strength: 'Easy email marketing', weakness: 'Limited automation on free plan' },
      'canva.com': { traffic: '130M+', strength: 'Easy graphic design', weakness: 'Less control than professional tools' },
      'squarespace.com': { traffic: '50M+', strength: 'Beautiful templates', weakness: 'Less flexible than custom solutions' },
      'wix.com': { traffic: '110M+', strength: 'Drag-and-drop builder', weakness: 'Can be slow, limited customization' },
      'wordpress.com': { traffic: '400M+', strength: 'Flexible & extensible', weakness: 'Requires technical knowledge' },
      
      // Streaming & content
      'netflix.com': { traffic: '1.8B+', strength: 'Original content & recommendation engine', weakness: 'Rising subscription costs' },
      'youtube.com': { traffic: '2.5B+', strength: 'Massive content library & creators', weakness: 'Ad fatigue' },
      'spotify.com': { traffic: '500M+', strength: 'Music streaming leader & podcasts', weakness: 'Artist payout concerns' },
      'twitch.tv': { traffic: '240M+', strength: 'Live streaming & gaming community', weakness: 'Toxic content issues' },
      
      // Finance & crypto
      'paypal.com': { traffic: '450M+', strength: 'Trusted payment processor', weakness: 'High fees for merchants' },
      'coinbase.com': { traffic: '60M+', strength: 'User-friendly crypto exchange', weakness: 'High trading fees' },
      'binance.com': { traffic: '140M+', strength: 'Low fees & many crypto options', weakness: 'Regulatory uncertainty' }
    };

    // Helper function to estimate traffic based on domain
    function estimateTrafficByDomain(domain: string): {traffic: string, strength: string, weakness: string} | null {
      const cleanDomain = domain.toLowerCase().replace(/^www\./, '');
      return knownCompetitors[cleanDomain] || null;
    }

    // Helper function to generate AI-based competitor analysis
    async function analyzeCompetitorWithAI(competitorName: string): Promise<{traffic: string, strength: string, weakness: string}> {
      try {
        const prompt = `Analyze this competitor in the ${industry || 'general'} industry: "${competitorName}"

Return ONLY a JSON object with this EXACT structure (no markdown, no explanation):
{
  "traffic": "estimated monthly visitors (e.g., '2.5M', '500K', '<50K')",
  "strength": "one key competitive advantage (max 60 chars)",
  "weakness": "one opportunity to differentiate (max 60 chars)"
}

Be realistic with traffic estimates. Most small/medium businesses have <100K monthly visitors.`;

        const { content } = await generateWithAI(
          prompt,
          'claude-sonnet-4-5-20250929',
          512,
          env
        );

        // Parse AI response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0]);
          return {
            traffic: analysis.traffic || '~50K',
            strength: analysis.strength || 'Established market player',
            weakness: analysis.weakness || 'Opportunity for differentiation'
          };
        }
      } catch (err) {
        console.warn(`  ⚠️ AI analysis failed for ${competitorName}:`, err);
      }

      // Fallback estimates based on industry
      const industryDefaults: Record<string, string> = {
        'saas': '~75K',
        'ecommerce': '~150K',
        'marketing': '~60K',
        'technology': '~90K',
        'default': '~50K'
      };
      
      const defaultTraffic = industryDefaults[industry?.toLowerCase() || 'default'] || industryDefaults['default'];
      
      return {
        traffic: defaultTraffic,
        strength: 'Established market presence',
        weakness: 'Opportunity for differentiation'
      };
    }

    // Helper function to fetch traffic data from RapidAPI
    async function fetchTrafficData(domain: string) {
      try {
        const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
        
        const response = await fetch(
          `https://${rapidApiHost}/v1/similar-rank/${encodeURIComponent(cleanDomain)}/all`,
          {
            method: 'GET',
            headers: {
              'X-RapidAPI-Key': rapidApiKey,
              'X-RapidAPI-Host': rapidApiHost
            }
          }
        );

        if (!response.ok) {
          console.warn(`  ⚠️ API returned ${response.status} for ${cleanDomain}`);
          return null;
        }

        const data = await response.json();
        
        // Parse traffic from response
        if (data.similarRank?.globalRank) {
          const rank = data.similarRank.globalRank;
          if (rank < 1000) return `${Math.round(50000000 / rank)}M+`;
          if (rank < 10000) return `${Math.round(5000000 / rank)}M`;
          if (rank < 100000) return `${Math.round(500000 / rank)}K`;
          if (rank < 1000000) return `${Math.round(50000 / rank)}K`;
          return '<10K';
        }
        
        return null;
      } catch (err) {
        return null;
      }
    }

    // Process competitors (max 3)
    const competitorData = await Promise.all(
      competitors.slice(0, 3).map(async (comp: string, index: number) => {
        const cleanDomain = comp.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
        console.log(`  → Analyzing: ${cleanDomain}`);

        // Strategy: Try multiple methods in order
        let result = null;

        // 1. Check if it's a well-known domain from our database
        result = estimateTrafficByDomain(cleanDomain);
        
        if (result) {
          console.log(`  ✅ ${cleanDomain}: ${result.traffic} (known competitor)`);
          return {
            name: comp,
            website: cleanDomain,
            monthlyTraffic: result.traffic,
            strength: result.strength,
            weakness: result.weakness
          };
        }

        // 2. Try RapidAPI if we have the key
        if (rapidApiKey) {
          const trafficData = await fetchTrafficData(cleanDomain);
          if (trafficData) {
            console.log(`  ✅ ${cleanDomain}: ${trafficData} (from API)`);
            return {
              name: comp,
              website: cleanDomain,
              monthlyTraffic: trafficData,
              strength: 'Active market competitor',
              weakness: 'Opportunity for differentiation'
            };
          }
        }

        // 3. Use AI to analyze unknown competitors
        const aiAnalysis = await analyzeCompetitorWithAI(comp);
        console.log(`  ✅ ${cleanDomain}: ${aiAnalysis.traffic} (AI estimate)`);

        return {
          name: comp,
          website: cleanDomain,
          monthlyTraffic: aiAnalysis.traffic,
          strength: aiAnalysis.strength,
          weakness: aiAnalysis.weakness
        };
      })
    );

    console.log('✅ Competitor analysis complete');

    return c.json({
      success: true,
      competitors: competitorData
    });

  } catch (error) {
    console.error('❌ Error generating competitor preview:', error);
    return c.json({
      success: false,
      message: 'Failed to generate competitor preview'
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
