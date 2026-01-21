/**
 * Post-Interview Analysis Service V2
 * Generates V2-style reports focused on SEM strategy,
 * small budget testing ($200/week), and 4-week execution plans.
 *
 * Key Differences from Legacy (V1):
 * - No RapidAPI dependency (Claude-only competitor research)
 * - Uses Claude Opus 4.5
 * - 4-week SEM execution plan (instead of 6-month roadmap)
 * - Meta vs Google channel recommendation
 * - Detailed creative recommendations
 * - A/B testing plan
 * - Green color scheme
 */

import type {
  BusinessProfile,
  GTMStrategyV2,
  CompetitorInsight,
  CustomerSegment,
  ChannelComparison,
  CreativeRecommendation,
  Campaign,
  ABTest,
  WeeklyPlan,
  KPITarget,
} from '../types/report-formats';

/**
 * Fetch with timeout wrapper to prevent hanging requests
 */
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number = 120000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs / 1000}s`);
    }
    throw error;
  }
}

export interface InterviewTranscript {
  userId: string;
  interviewId: string;
  responses: Array<{
    question: string;
    answer: string;
    timestamp: string;
  }>;
  completedAt: string;
}

/**
 * Step 1: Analyze interview transcript to extract business profile
 * Enhanced to capture weekly budget explicitly
 */
export async function analyzeInterview(
  transcript: InterviewTranscript,
  claudeApiKey: string
): Promise<BusinessProfile> {
  console.log('[V2 analyzeInterview] Starting interview analysis');
  console.log('[V2 analyzeInterview] Interview ID:', transcript.interviewId);
  console.log('[V2 analyzeInterview] Responses count:', transcript.responses.length);

  // Validate API key
  if (!claudeApiKey || claudeApiKey.trim() === '') {
    console.error('[V2 analyzeInterview] ERROR: API key missing!');
    throw new Error('Claude API key is not configured. Please set ANTHROPIC_API_KEY in Cloudflare environment variables.');
  }

  console.log('[V2 analyzeInterview] API key validated, length:', claudeApiKey.length);

  const transcriptText = transcript.responses
    .map((r, i) => `Q${i + 1}: ${r.question}\nA${i + 1}: ${r.answer}`)
    .join('\n\n');

  console.log('[V2 analyzeInterview] Transcript prepared, length:', transcriptText.length, 'chars');

  const prompt = `You are a business analyst extracting key information from an interview transcript for SEM campaign planning.

INTERVIEW TRANSCRIPT:
${transcriptText}

Extract and structure the following information:
1. Brand name (if mentioned)
2. Website URL (if mentioned)
3. Industry/sector
4. Target market (geographic, demographic)
5. Current business stage (startup, growth, mature)
6. Main challenges mentioned
7. Business goals
8. Available budget (weekly or monthly - specify the timeframe)

IMPORTANT: For budget, if they mention a monthly amount, also calculate the weekly equivalent.

Respond in JSON format:
{
  "brandName": "...",
  "website": "...",
  "industry": "...",
  "targetMarket": "...",
  "businessStage": "...",
  "mainChallenges": ["...", "..."],
  "businessGoals": ["...", "..."],
  "budget": "..."
}`;

  try {
    console.log('[V2 analyzeInterview] Calling Claude API with model: claude-opus-4-5-20251101');
    console.log('[V2 analyzeInterview] Prompt length:', prompt.length, 'chars');

    const requestBody = {
      model: 'claude-opus-4-5-20251101',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    };

    console.log('[V2 analyzeInterview] Making fetch request to Claude API with 2min timeout...');

    const response = await fetchWithTimeout(
      'https://api.anthropic.com/v1/messages',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': claudeApiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(requestBody)
      },
      300000 // 5 minute timeout
    );

    console.log('[V2 analyzeInterview] Fetch completed, status:', response.status);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('[V2 analyzeInterview] Claude API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody
      });
      throw new Error(`Claude API failed: ${response.statusText} (${response.status}). ${errorBody}`);
    }

    console.log('[V2 analyzeInterview] Response OK, parsing JSON...');
    const data = await response.json();

    console.log('[V2 analyzeInterview] JSON parsed, content blocks:', data.content?.length);
    const analysisText = data.content[0].text;
    console.log('[V2 analyzeInterview] Analysis text length:', analysisText.length);

    // Extract JSON from response
    console.log('[V2 analyzeInterview] Extracting JSON from response...');
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[V2 analyzeInterview] ERROR: No JSON found in response');
      console.error('[V2 analyzeInterview] Response text:', analysisText.substring(0, 500));
      throw new Error('Failed to parse business profile from Claude response');
    }

    console.log('[V2 analyzeInterview] JSON matched, parsing business profile...');
    const businessProfile: BusinessProfile = JSON.parse(jsonMatch[0]);
    console.log('[V2 analyzeInterview] Business profile extracted successfully');
    console.log('[V2 analyzeInterview] Brand name:', businessProfile.brandName);
    console.log('[V2 analyzeInterview] Industry:', businessProfile.industry);
    return businessProfile;
  } catch (error) {
    console.error('[V2 analyzeInterview] ERROR:', error);
    console.error('[V2 analyzeInterview] Error message:', error.message);
    console.error('[V2 analyzeInterview] Error stack:', error.stack);
    throw error;
  }
}

/**
 * Step 2: Verify website and perform competitor research (WITHOUT RapidAPI)
 * Uses Claude Opus 4.5 for comprehensive competitor analysis including layout analysis
 */
export async function verifyWebsiteAndResearch(
  website: string,
  businessProfile: BusinessProfile,
  claudeApiKey: string
): Promise<{ valid: boolean; scraped_content?: string; competitors: CompetitorInsight[] }> {
  console.log('[V2 verifyWebsiteAndResearch] Starting research');
  console.log('[V2 verifyWebsiteAndResearch] Website:', website);
  console.log('[V2 verifyWebsiteAndResearch] Brand:', businessProfile.brandName);

  try {
    // First, validate the website format
    console.log('[V2 verifyWebsiteAndResearch] Validating website URL format...');
    const urlPattern = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b/;
    if (!urlPattern.test(website)) {
      console.log('[V2 verifyWebsiteAndResearch] Invalid URL format');
      return { valid: false, competitors: [] };
    }

    // Normalize URL
    const normalizedUrl = website.startsWith('http') ? website : `https://${website}`;
    console.log('[V2 verifyWebsiteAndResearch] Normalized URL:', normalizedUrl);

    // Scrape basic website content (for context)
    console.log('[V2 verifyWebsiteAndResearch] Attempting to scrape website...');
    let scrapedContent = '';
    try {
      const response = await fetch(normalizedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; NexSpark/1.0; +https://nexspark.io)'
        }
      });

      console.log('[V2 verifyWebsiteAndResearch] Website fetch status:', response.status);

      if (response.ok) {
        const html = await response.text();
        console.log('[V2 verifyWebsiteAndResearch] HTML fetched, length:', html.length);
        // Extract text content (simplified)
        scrapedContent = html
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 5000); // Limit to 5000 chars
        console.log('[V2 verifyWebsiteAndResearch] Scraped content length:', scrapedContent.length);
      }
    } catch (error) {
      console.log('[V2 verifyWebsiteAndResearch] Website scraping failed:', error.message);
      console.log('[V2 verifyWebsiteAndResearch] Will proceed with domain analysis only');
    }

    // Use Claude Opus 4.5 to identify and analyze top 5 competitors
    console.log('[V2 verifyWebsiteAndResearch] Preparing competitor analysis prompt...');
    const competitorPrompt = `You are a competitive intelligence analyst specializing in SEM and D2C brands.

BUSINESS CONTEXT:
- Brand: ${businessProfile.brandName}
- Website: ${website}
- Industry: ${businessProfile.industry}
- Target Market: ${businessProfile.targetMarket}

${scrapedContent ? `WEBSITE CONTENT EXCERPT:\n${scrapedContent}\n\n` : ''}

TASK: Identify the top 5 direct competitors in the US market and perform comprehensive analysis.

For each competitor, provide:
1. Brand name and website URL
2. Estimated monthly traffic (based on your knowledge; use "15K-25K monthly" format)
3. Primary marketing channels (e.g., Amazon, DTC, Google Ads, Meta Ads, SEO)
4. Price point positioning (e.g., "Mid-range ($15-25)", "Premium ($30+)")
5. Key strengths (4-5 specific points about their marketing, product, or brand)
6. Key weaknesses (3-4 specific points about gaps or limitations)
7. Website layout analysis (4-5 observations about:
   - Hero section design and messaging
   - Navigation structure
   - Trust signals (reviews, certifications)
   - Product display approach
   - Call-to-action placement)

IMPORTANT: Use your knowledge to provide accurate, detailed insights. If you're unsure about traffic numbers, provide reasonable estimates based on the brand's market position.

Respond in JSON format:
{
  "competitors": [
    {
      "name": "Competitor Name",
      "website": "competitor.com",
      "estimatedTraffic": "15K-25K monthly",
      "primaryChannels": ["Amazon", "DTC"],
      "pricePoint": "Mid-range ($15-25 for 200pc)",
      "strengths": ["...", "...", "...", "..."],
      "weaknesses": ["...", "...", "..."],
      "layoutAnalysis": ["...", "...", "...", "...", "..."]
    }
  ]
}`;

    console.log('[V2 verifyWebsiteAndResearch] Calling Claude API for competitor analysis...');
    console.log('[V2 verifyWebsiteAndResearch] Prompt length:', competitorPrompt.length);

    const response = await fetchWithTimeout(
      'https://api.anthropic.com/v1/messages',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': claudeApiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-opus-4-5-20251101',
          max_tokens: 8192,
          temperature: 0.7,
          messages: [
            {
              role: 'user',
              content: competitorPrompt
            }
          ]
        })
      },
      120000 // 2 minute timeout
    );

    console.log('[V2 verifyWebsiteAndResearch] Claude API response status:', response.status);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('[V2 verifyWebsiteAndResearch] Claude API error:', errorBody);
      throw new Error(`Claude API failed: ${response.statusText}`);
    }

    console.log('[V2 verifyWebsiteAndResearch] Parsing response...');
    const data = await response.json();
    const competitorsText = data.content[0].text;
    console.log('[V2 verifyWebsiteAndResearch] Response text length:', competitorsText.length);

    // Extract JSON from response
    console.log('[V2 verifyWebsiteAndResearch] Extracting JSON from response...');
    const jsonMatch = competitorsText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[V2 verifyWebsiteAndResearch] Failed to parse competitors JSON');
      console.error('[V2 verifyWebsiteAndResearch] Response text:', competitorsText.substring(0, 500));
      return { valid: true, scraped_content: scrapedContent, competitors: [] };
    }

    console.log('[V2 verifyWebsiteAndResearch] JSON matched, parsing...');
    const result = JSON.parse(jsonMatch[0]);

    console.log('[V2 verifyWebsiteAndResearch] Successfully identified', result.competitors.length, 'competitors');

    console.log('[V2 verifyWebsiteAndResearch] Research complete, returning results');
    return {
      valid: true,
      scraped_content: scrapedContent,
      competitors: result.competitors
    };
  } catch (error) {
    console.error('[V2 verifyWebsiteAndResearch] ERROR:', error);
    console.error('[V2 verifyWebsiteAndResearch] Error message:', error.message);
    console.error('[V2 verifyWebsiteAndResearch] Error stack:', error.stack);
    return { valid: false, competitors: [] };
  }
}

/**
 * Step 3: Generate comprehensive V2 GTM strategy
 * Complete overhaul for 4-week SEM execution plan
 */
export async function generateGTMStrategy(
  businessProfile: BusinessProfile,
  competitors: CompetitorInsight[],
  websiteContent: string,
  claudeApiKey: string
): Promise<GTMStrategyV2> {
  const prompt = `You are a performance marketing strategist specializing in SEM (Google and Meta Ads) for D2C brands with small budgets.

BUSINESS PROFILE:
${JSON.stringify(businessProfile, null, 2)}

COMPETITOR RESEARCH:
${JSON.stringify(competitors, null, 2)}

${websiteContent ? `WEBSITE CONTENT:\n${websiteContent.substring(0, 2000)}\n\n` : ''}

BUDGET CONTEXT:
- Weekly budget: ${businessProfile.budget}
- Focus: Small budget A/B testing to identify paying customers
- Timeline: 4-week initial testing phase

REFERENCE SUCCESS CASE:
Yamabushi Farms (supplement brand) tripled ROAS in 4 weeks using:
- Meta Ads with $200/week budget
- Text-based educational creatives (outperformed lifestyle images)
- 60% Purchase campaign, 40% Add-to-Cart campaign
- Interest-based audience segmentation
- "Vitamin" interest audience outperformed "Supplements" (1.52x ROAS vs 0x)

CREATE A COMPREHENSIVE GTM STRATEGY REPORT INCLUDING:

1. EXECUTIVE SUMMARY (2-3 paragraphs)
   - Market opportunity summary
   - Clear channel recommendation (Meta OR Google - choose one to start with)
   - Testing strategy overview

2. MARKET ANALYSIS
   - Market size and growth rate estimates
   - Key trends (5-6 points about industry direction)
   - Target customer segments (3-4 segments) with:
     * Segment name and description
     * AOV Potential (e.g., "$80-200")
     * CAC Estimate (e.g., "$15-25")

3. COMPETITOR RESEARCH
   - Use the 5 competitors provided
   - Add 4-5 "Key Competitive Insights" specific to this brand's opportunities

4. CHANNEL RECOMMENDATION: META vs GOOGLE
   - Comparison table with 7-8 factors:
     * Average CPC
     * Budget Efficiency (clicks per week)
     * Creative Testing capabilities
     * Audience Discovery
     * Purchase Intent
     * Learning Speed
     * B2B Targeting (if relevant)
     * Industry-specific fit
   - Clear winner for each factor (Meta, Google, or Tie)
   - Overall recommendation with reasoning
   - 4-5 "Yamabushi Learnings" - insights from the case study applied to this business

5. CREATIVE RECOMMENDATIONS
   - 4 creative types with:
     * Creative Type name (e.g., "Educational/Text-Based")
     * Priority: HIGH, MEDIUM, LOW, or TEST
     * Format: Detailed description of visual format
     * Purpose: Why this creative type matters
     * Examples: 3-4 specific headline/visual ideas
     * Optional notes

6. CAMPAIGN STRUCTURE
   - Weekly budget (from profile)
   - 2 campaigns with:
     * Campaign name and objective
     * Budget percentage (should total 100%)
     * 2-3 ad sets per campaign with:
       - Ad set name
       - Budget allocation
       - Targeting details (interests, demographics)
       - Which creatives to use

7. A/B TESTING PLAN
   - 6 tests with:
     * Test Category (e.g., "Creative Type")
     * Variable A vs Variable B
     * Success Metric
     * Timeline (which week)
   - 5 "Key Hypotheses to Validate"

8. 4-WEEK EXECUTION PLAN
   - Week 1: Foundation & Creative Testing
     * Title, 3-4 objectives, 5-7 key activities
     * Metrics: Budget, Target CTR, Landing page views, Add to carts
   - Week 2: Creative Optimization & Audience Learning
     * Title, 3-4 objectives, 5-7 key activities
     * Metrics: Budget, Target CTR, Landing page views, Purchases
   - Week 3: Conversion Optimization & Offer Testing
     * Title, 3-4 objectives, 5-7 key activities
     * Metrics: Budget, Add to cart rate, Purchases, ROAS
   - Week 4: Scaling Winners & Retargeting
     * Title, 3-4 objectives, 5-7 key activities
     * Metrics: Budget, ROAS, Purchases, Target CPA

9. KPI TRACKING FRAMEWORK
   - 8 metrics with weekly targets:
     * Spend, Impressions, CTR, CPC, Landing Page Views, Add to Carts, Purchases, ROAS

10. IMMEDIATE NEXT STEPS
    - Pre-launch checklist (6 items covering: Shopify setup, Pixel installation, Business Manager, Creative assets, Landing page, Offer strategy)

Respond in valid JSON format matching this structure exactly. Be specific, actionable, and data-driven.

{
  "executiveSummary": "...",
  "marketAnalysis": {
    "marketSize": "...",
    "growthRate": "...",
    "keyTrends": ["...", "...", "...", "...", "..."],
    "customerSegments": [
      {
        "segment": "...",
        "description": "...",
        "aovPotential": "...",
        "cacEstimate": "..."
      }
    ]
  },
  "competitiveAnalysis": {
    "topCompetitors": ${JSON.stringify(competitors)},
    "keyInsights": ["...", "...", "...", "..."]
  },
  "channelRecommendation": {
    "recommended": "Meta",
    "reasoning": "...",
    "comparisonTable": [
      {
        "factor": "Average CPC",
        "metaAds": "...",
        "googleAds": "...",
        "winner": "Meta"
      }
    ],
    "yamabushiLearnings": ["...", "...", "...", "..."]
  },
  "creativeRecommendations": [
    {
      "type": "...",
      "priority": "HIGH",
      "format": "...",
      "purpose": "...",
      "examples": ["...", "...", "..."],
      "notes": "..."
    }
  ],
  "campaignStructure": {
    "weeklyBudget": "${businessProfile.budget}",
    "campaigns": [
      {
        "name": "...",
        "objective": "...",
        "budgetPercentage": 60,
        "adSets": [
          {
            "name": "...",
            "budget": "...",
            "targeting": "...",
            "creatives": "..."
          }
        ]
      }
    ]
  },
  "abTestingPlan": {
    "tests": [
      {
        "testCategory": "...",
        "variableA": "...",
        "variableB": "...",
        "successMetric": "...",
        "timeline": "Week 1"
      }
    ],
    "keyHypotheses": ["...", "...", "...", "...", "..."]
  },
  "fourWeekExecutionPlan": [
    {
      "weekNumber": 1,
      "title": "Foundation & Creative Testing",
      "objectives": ["...", "...", "..."],
      "keyActivities": ["...", "...", "...", "...", "..."],
      "metrics": {
        "budget": "$200",
        "targetCTR": "≥1.5%",
        "other": "..."
      }
    }
  ],
  "kpiTrackingFramework": [
    {
      "metric": "Spend",
      "week1": "$200",
      "week2": "$200",
      "week3": "$200",
      "week4": "$200"
    }
  ],
  "immediateNextSteps": {
    "preLaunchChecklist": ["...", "...", "...", "...", "...", "..."]
  }
}`;

  try {
    console.log('Generating V2 GTM strategy with Claude Opus 4.5...');
    console.log('Using 3 minute timeout for large response (32k tokens)...');

    const response = await fetchWithTimeout(
      'https://api.anthropic.com/v1/messages',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': claudeApiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-opus-4-5-20251101',
          max_tokens: 32768,
          temperature: 0.7,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      },
      300000 // 5 minute timeout for large strategy generation
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Claude API failed: ${response.statusText}. ${errorBody}`);
    }

    const data = await response.json();
    const strategyText = data.content[0].text;

    // Extract JSON from response
    const jsonMatch = strategyText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Failed to parse strategy JSON from response:', strategyText.substring(0, 500));
      throw new Error('Failed to parse GTM strategy from Claude response');
    }

    const strategy: GTMStrategyV2 = JSON.parse(jsonMatch[0]);

    // Add business profile to strategy
    strategy.businessProfile = businessProfile;

    console.log('V2 GTM strategy generated successfully');
    return strategy;
  } catch (error) {
    console.error('Error generating GTM strategy:', error);
    throw error;
  }
}

/**
 * Generate V2 HTML report from GTM strategy
 * Complete redesign with green color scheme and new sections
 */
export function generateStrategyReport(strategy: GTMStrategyV2): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SEM Strategy Report - ${strategy.businessProfile.brandName}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        :root {
          --primary-green: #16a085;
          --light-green: #d5f4e6;
          --accent-green: #1abc9c;
          --dark-text: #2c3e50;
          --light-gray: #ecf0f1;
          --success: #27ae60;
          --warning: #f39c12;
          --info: #3498db;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: var(--dark-text);
            background: linear-gradient(135deg, #16a085 0%, #1abc9c 100%);
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }

        .header {
            text-align: center;
            padding: 40px 0;
            border-bottom: 4px solid var(--primary-green);
            margin-bottom: 40px;
        }

        .header h1 {
            font-size: 2.5em;
            color: var(--primary-green);
            margin-bottom: 10px;
        }

        .header .subtitle {
            font-size: 1.2em;
            color: #7f8c8d;
        }

        .section {
            margin: 40px 0;
            page-break-inside: avoid;
        }

        .section h2 {
            font-size: 2em;
            color: var(--primary-green);
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid var(--light-gray);
        }

        .section h3 {
            font-size: 1.5em;
            color: #34495e;
            margin: 20px 0 10px 0;
        }

        .executive-summary {
            background: var(--light-green);
            padding: 30px;
            border-radius: 10px;
            font-size: 1.1em;
            line-height: 1.8;
            border-left: 6px solid var(--primary-green);
        }

        .profile-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }

        .profile-item {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            border-left: 4px solid var(--primary-green);
        }

        .profile-item strong {
            display: block;
            color: var(--primary-green);
            margin-bottom: 5px;
        }

        .metric-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }

        .metric {
            background: linear-gradient(135deg, var(--primary-green) 0%, var(--accent-green) 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
        }

        .metric-value {
            font-size: 2em;
            font-weight: bold;
            display: block;
        }

        .metric-label {
            font-size: 0.9em;
            opacity: 0.9;
        }

        .comparison-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .comparison-table th {
            background: var(--primary-green);
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 600;
        }

        .comparison-table td {
            padding: 12px 15px;
            border-bottom: 1px solid var(--light-gray);
        }

        .comparison-table tr:hover {
            background: #f8f9fa;
        }

        .winner-meta {
            color: var(--primary-green);
            font-weight: bold;
        }

        .winner-google {
            color: #4285f4;
            font-weight: bold;
        }

        .winner-tie {
            color: #7f8c8d;
            font-weight: bold;
        }

        .competitor-card {
            background: #f8f9fa;
            padding: 20px;
            margin: 15px 0;
            border-radius: 10px;
            border-left: 4px solid #e74c3c;
        }

        .competitor-card h4 {
            color: #e74c3c;
            margin-bottom: 10px;
        }

        .creative-card {
            border: 2px solid var(--light-gray);
            padding: 20px;
            margin: 15px 0;
            border-radius: 10px;
            transition: transform 0.2s;
        }

        .creative-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .creative-card.high-priority {
            border-left: 6px solid var(--success);
            background: #eafaf1;
        }

        .creative-card.medium-priority {
            border-left: 6px solid var(--warning);
            background: #fef9e7;
        }

        .creative-card.low-priority {
            border-left: 6px solid #95a5a6;
            background: #f8f9fa;
        }

        .creative-card.test-priority {
            border-left: 6px solid var(--info);
            background: #ebf5fb;
        }

        .priority-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: bold;
            margin-bottom: 10px;
        }

        .badge-high { background: var(--success); color: white; }
        .badge-medium { background: var(--warning); color: white; }
        .badge-low { background: #95a5a6; color: white; }
        .badge-test { background: var(--info); color: white; }

        .week-card {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 10px;
            border-left: 6px solid var(--primary-green);
            margin: 20px 0;
        }

        .week-card h4 {
            color: var(--primary-green);
            font-size: 1.4em;
            margin-bottom: 15px;
        }

        .metric-boxes {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin: 15px 0;
        }

        .metric-box {
            background: var(--light-green);
            padding: 15px;
            border-radius: 8px;
            text-align: center;
        }

        .metric-box strong {
            display: block;
            color: var(--primary-green);
            font-size: 0.9em;
            margin-bottom: 5px;
        }

        .metric-box span {
            font-size: 1.2em;
            font-weight: 600;
        }

        .insights-box {
            background: #fff3cd;
            border-left: 6px solid #ffc107;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }

        .insights-box h4 {
            color: #856404;
            margin-bottom: 10px;
        }

        .recommendation-box {
            background: var(--light-green);
            border: 2px solid var(--primary-green);
            padding: 25px;
            border-radius: 10px;
            margin: 20px 0;
        }

        .recommendation-box h3 {
            color: var(--primary-green);
            margin-top: 0;
        }

        .campaign-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }

        .campaign-table th {
            background: var(--primary-green);
            color: white;
            padding: 12px;
            text-align: left;
        }

        .campaign-table td {
            padding: 10px 12px;
            border-bottom: 1px solid var(--light-gray);
        }

        .campaign-table tr:nth-child(even) {
            background: #f8f9fa;
        }

        .checklist {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
        }

        .checklist-item {
            padding: 10px;
            margin: 8px 0;
            background: white;
            border-left: 4px solid var(--primary-green);
            border-radius: 5px;
        }

        .checklist-item:before {
            content: "☐ ";
            color: var(--primary-green);
            font-weight: bold;
            margin-right: 10px;
        }

        ul {
            margin-left: 20px;
            margin-top: 10px;
        }

        li {
            margin: 8px 0;
        }

        a {
            color: var(--primary-green);
            text-decoration: none;
        }

        a:hover {
            text-decoration: underline;
        }

        @media print {
            body { background: white; padding: 0; }
            .container { box-shadow: none; }
        }

        @media (max-width: 768px) {
            .container { padding: 20px; }
            .header h1 { font-size: 1.8em; }
            .section h2 { font-size: 1.5em; }
            .profile-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>🌸 SEM Strategy & 4-Week Execution Plan</h1>
            <div class="subtitle">${strategy.businessProfile.brandName}</div>
            <div class="subtitle" style="font-size: 0.9em; margin-top: 10px;">
                Powered by NexSpark Growth OS • ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
        </div>

        <!-- Executive Summary -->
        <div class="section">
            <h2>📋 Executive Summary</h2>
            <div class="executive-summary">
                ${strategy.executiveSummary}
                <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid var(--primary-green);">
                    <strong>Recommended Primary Channel: ${strategy.channelRecommendation.recommended} Ads</strong>
                </div>
            </div>
        </div>

        <!-- Business Profile -->
        <div class="section">
            <h2>🏢 Business Profile</h2>
            <div class="profile-grid">
                <div class="profile-item">
                    <strong>Brand Name</strong>
                    ${strategy.businessProfile.brandName}
                </div>
                <div class="profile-item">
                    <strong>Website</strong>
                    <a href="${strategy.businessProfile.website}" target="_blank">${strategy.businessProfile.website}</a>
                </div>
                <div class="profile-item">
                    <strong>Industry</strong>
                    ${strategy.businessProfile.industry}
                </div>
                <div class="profile-item">
                    <strong>Target Market</strong>
                    ${strategy.businessProfile.targetMarket}
                </div>
                <div class="profile-item">
                    <strong>Business Stage</strong>
                    ${strategy.businessProfile.businessStage}
                </div>
                <div class="profile-item">
                    <strong>Weekly Budget</strong>
                    ${strategy.businessProfile.budget}
                </div>
            </div>

            <h3>Main Challenges</h3>
            <ul>
                ${strategy.businessProfile.mainChallenges.map(c => `<li>${c}</li>`).join('')}
            </ul>

            <h3>Business Goals</h3>
            <ul>
                ${strategy.businessProfile.businessGoals.map(g => `<li>${g}</li>`).join('')}
            </ul>
        </div>

        <!-- Market Analysis -->
        <div class="section">
            <h2>📊 Market Analysis</h2>
            <div class="metric-grid">
                <div class="metric">
                    <span class="metric-value">${strategy.marketAnalysis.marketSize}</span>
                    <span class="metric-label">Market Size</span>
                </div>
                <div class="metric">
                    <span class="metric-value">${strategy.marketAnalysis.growthRate}</span>
                    <span class="metric-label">Growth Rate</span>
                </div>
            </div>

            <h3>Key Trends</h3>
            <ul>
                ${strategy.marketAnalysis.keyTrends.map(t => `<li>${t}</li>`).join('')}
            </ul>

            <h3>Target Customer Segments</h3>
            <table class="comparison-table">
                <thead>
                    <tr>
                        <th>Segment</th>
                        <th>Description</th>
                        <th>AOV Potential</th>
                        <th>CAC Estimate</th>
                    </tr>
                </thead>
                <tbody>
                    ${strategy.marketAnalysis.customerSegments.map(seg => `
                        <tr>
                            <td><strong>${seg.segment}</strong></td>
                            <td>${seg.description}</td>
                            <td>${seg.aovPotential}</td>
                            <td>${seg.cacEstimate}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <!-- Competitive Analysis -->
        <div class="section">
            <h2>🎯 Competitor Research</h2>

            <h3>Top 5 Competitors</h3>
            ${strategy.competitiveAnalysis.topCompetitors.map((comp, idx) => `
                <div class="competitor-card">
                    <h4>${idx + 1}. ${comp.name}</h4>
                    <p><strong>Website:</strong> <a href="https://${comp.website}" target="_blank">${comp.website}</a></p>
                    <p><strong>Estimated Traffic:</strong> ${comp.estimatedTraffic}</p>
                    <p><strong>Primary Channels:</strong> ${comp.primaryChannels.join(', ')}</p>
                    <p><strong>Price Point:</strong> ${comp.pricePoint}</p>

                    <div style="margin-top: 15px;">
                        <strong>Strengths:</strong>
                        <ul>
                            ${comp.strengths.map(s => `<li>${s}</li>`).join('')}
                        </ul>
                    </div>

                    <div style="margin-top: 15px;">
                        <strong>Weaknesses:</strong>
                        <ul>
                            ${comp.weaknesses.map(w => `<li>${w}</li>`).join('')}
                        </ul>
                    </div>

                    <div style="margin-top: 15px;">
                        <strong>Website Layout Analysis:</strong>
                        <ul>
                            ${comp.layoutAnalysis.map(l => `<li>${l}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `).join('')}

            <div class="insights-box">
                <h4>💡 Key Competitive Insights</h4>
                <ul>
                    ${strategy.competitiveAnalysis.keyInsights.map(i => `<li>${i}</li>`).join('')}
                </ul>
            </div>
        </div>

        <!-- Channel Recommendation -->
        <div class="section">
            <h2>🎯 Channel Recommendation: Meta vs Google</h2>

            <div class="recommendation-box">
                <h3>Recommended: ${strategy.channelRecommendation.recommended} Ads</h3>
                <p>${strategy.channelRecommendation.reasoning}</p>
            </div>

            <h3>Comparison Analysis</h3>
            <table class="comparison-table">
                <thead>
                    <tr>
                        <th>Factor</th>
                        <th>Meta Ads</th>
                        <th>Google Ads</th>
                        <th>Winner</th>
                    </tr>
                </thead>
                <tbody>
                    ${strategy.channelRecommendation.comparisonTable.map(comp => `
                        <tr>
                            <td><strong>${comp.factor}</strong></td>
                            <td>${comp.metaAds}</td>
                            <td>${comp.googleAds}</td>
                            <td class="winner-${comp.winner.toLowerCase()}">${comp.winner}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="insights-box">
                <h4>🌸 Yamabushi Learnings Applied</h4>
                <ul>
                    ${strategy.channelRecommendation.yamabushiLearnings.map(l => `<li>${l}</li>`).join('')}
                </ul>
            </div>
        </div>

        <!-- Creative Recommendations -->
        <div class="section">
            <h2>🎨 Creative Recommendations</h2>
            ${strategy.creativeRecommendations.map(creative => `
                <div class="creative-card ${creative.priority.toLowerCase()}-priority">
                    <span class="priority-badge badge-${creative.priority.toLowerCase()}">${creative.priority} PRIORITY</span>
                    <h3>${creative.type}</h3>
                    <p><strong>Format:</strong> ${creative.format}</p>
                    <p><strong>Purpose:</strong> ${creative.purpose}</p>

                    <div style="margin-top: 15px;">
                        <strong>Examples:</strong>
                        <ul>
                            ${creative.examples.map(e => `<li>${e}</li>`).join('')}
                        </ul>
                    </div>

                    ${creative.notes ? `<p style="margin-top: 10px; font-style: italic;"><strong>Note:</strong> ${creative.notes}</p>` : ''}
                </div>
            `).join('')}
        </div>

        <!-- Campaign Structure -->
        <div class="section">
            <h2>🚀 Campaign Structure</h2>
            <div class="profile-item" style="margin: 20px 0;">
                <strong>Weekly Budget</strong>
                ${strategy.campaignStructure.weeklyBudget}
            </div>

            ${strategy.campaignStructure.campaigns.map((campaign, idx) => `
                <div style="margin: 30px 0;">
                    <h3>Campaign ${idx + 1}: ${campaign.name}</h3>
                    <p><strong>Objective:</strong> ${campaign.objective}</p>
                    <p><strong>Budget Allocation:</strong> ${campaign.budgetPercentage}%</p>

                    <table class="campaign-table" style="margin-top: 15px;">
                        <thead>
                            <tr>
                                <th>Ad Set</th>
                                <th>Budget</th>
                                <th>Targeting</th>
                                <th>Creatives</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${campaign.adSets.map(adSet => `
                                <tr>
                                    <td><strong>${adSet.name}</strong></td>
                                    <td>${adSet.budget}</td>
                                    <td>${adSet.targeting}</td>
                                    <td>${adSet.creatives}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `).join('')}
        </div>

        <!-- A/B Testing Plan -->
        <div class="section">
            <h2>🧪 A/B Testing Plan</h2>

            <table class="comparison-table">
                <thead>
                    <tr>
                        <th>Test Category</th>
                        <th>Variable A</th>
                        <th>Variable B</th>
                        <th>Success Metric</th>
                        <th>Timeline</th>
                    </tr>
                </thead>
                <tbody>
                    ${strategy.abTestingPlan.tests.map(test => `
                        <tr>
                            <td><strong>${test.testCategory}</strong></td>
                            <td>${test.variableA}</td>
                            <td>${test.variableB}</td>
                            <td>${test.successMetric}</td>
                            <td>${test.timeline}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="insights-box">
                <h4>🔬 Key Hypotheses to Validate</h4>
                <ul>
                    ${strategy.abTestingPlan.keyHypotheses.map(h => `<li>${h}</li>`).join('')}
                </ul>
            </div>
        </div>

        <!-- 4-Week Execution Plan -->
        <div class="section">
            <h2>📅 4-Week Execution Plan</h2>

            ${strategy.fourWeekExecutionPlan.map(week => `
                <div class="week-card">
                    <h4>Week ${week.weekNumber}: ${week.title}</h4>

                    <div style="margin-top: 15px;">
                        <strong>Objectives:</strong>
                        <ul>
                            ${week.objectives.map(o => `<li>${o}</li>`).join('')}
                        </ul>
                    </div>

                    <div style="margin-top: 15px;">
                        <strong>Key Activities:</strong>
                        <ul>
                            ${week.keyActivities.map(a => `<li>${a}</li>`).join('')}
                        </ul>
                    </div>

                    <div class="metric-boxes" style="margin-top: 20px;">
                        ${Object.entries(week.metrics).map(([key, value]) => `
                            <div class="metric-box">
                                <strong>${key.replace(/([A-Z])/g, ' $1').trim()}</strong>
                                <span>${value}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>

        <!-- KPI Tracking Framework -->
        <div class="section">
            <h2>📈 KPI Tracking Framework</h2>

            <table class="comparison-table">
                <thead>
                    <tr>
                        <th>Metric</th>
                        <th>Week 1</th>
                        <th>Week 2</th>
                        <th>Week 3</th>
                        <th>Week 4</th>
                    </tr>
                </thead>
                <tbody>
                    ${strategy.kpiTrackingFramework.map(kpi => `
                        <tr>
                            <td><strong>${kpi.metric}</strong></td>
                            <td>${kpi.week1}</td>
                            <td>${kpi.week2}</td>
                            <td>${kpi.week3}</td>
                            <td style="background: var(--light-green);"><strong>${kpi.week4}</strong></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <!-- Immediate Next Steps -->
        <div class="section">
            <h2>✅ Immediate Next Steps</h2>

            <h3>Pre-Launch Checklist</h3>
            <div class="checklist">
                ${strategy.immediateNextSteps.preLaunchChecklist.map(item => `
                    <div class="checklist-item">${item}</div>
                `).join('')}
            </div>
        </div>

        <!-- Footer -->
        <div class="section" style="text-align: center; padding-top: 40px; border-top: 2px solid var(--light-gray);">
            <p style="color: #7f8c8d; font-size: 0.9em;">
                Generated by <strong>NexSpark Growth OS V2</strong> • Powered by Claude Opus 4.5<br>
                For questions or support: founders@nexspark.io
            </p>
        </div>
    </div>
</body>
</html>
  `;
}
