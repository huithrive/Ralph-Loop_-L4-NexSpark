/**
 * Post-Interview Analysis Service
 * Analyzes interview transcripts and generates comprehensive GTM strategies
 */

import { fetchTrafficData } from './growth-audit-agent';

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

export interface BusinessProfile {
  brandName: string;
  website: string;
  industry: string;
  targetMarket: string;
  currentStage: string;
  mainChallenges: string[];
  goals: string[];
  budget: string;
}

export interface CompetitorInsight {
  name: string;
  website: string;
  monthlyTraffic: number;
  topChannels: string[];
  strengths: string[];
  weaknesses: string[];
}

export interface GTMStrategy {
  executiveSummary: string;
  businessProfile: BusinessProfile;
  marketAnalysis: {
    marketSize: string;
    growthRate: string;
    keyTrends: string[];
    opportunities: string[];
    threats: string[];
  };
  competitiveAnalysis: {
    topCompetitors: CompetitorInsight[];
    competitiveAdvantages: string[];
    positioningRecommendation: string;
  };
  targetAudience: {
    primarySegment: {
      demographics: string[];
      psychographics: string[];
      painPoints: string[];
      buyingBehavior: string;
    };
    secondarySegment?: {
      demographics: string[];
      psychographics: string[];
      painPoints: string[];
      buyingBehavior: string;
    };
  };
  channelStrategy: {
    priorityChannels: Array<{
      channel: string;
      priority: 'High' | 'Medium' | 'Low';
      budgetAllocation: string;
      expectedROI: string;
      tactics: string[];
    }>;
  };
  sixMonthRoadmap: {
    month1: RoadmapMonth;
    month2: RoadmapMonth;
    month3: RoadmapMonth;
    month4: RoadmapMonth;
    month5: RoadmapMonth;
    month6: RoadmapMonth;
  };
  budgetProjections: {
    totalBudget: string;
    channelBreakdown: Array<{
      channel: string;
      budget: string;
      percentage: number;
    }>;
    expectedCAC: string;
    expectedLTV: string;
    projectedROI: string;
  };
  kpis: Array<{
    metric: string;
    currentValue: string;
    sixMonthTarget: string;
    trackingMethod: string;
  }>;
}

interface RoadmapMonth {
  focus: string;
  objectives: string[];
  keyActivities: string[];
  expectedResults: {
    traffic: string;
    conversions: string;
    revenue: string;
  };
  budget: string;
}

/**
 * Step 1: Analyze interview transcript to extract business profile
 */
export async function analyzeInterview(
  transcript: InterviewTranscript,
  claudeApiKey: string
): Promise<BusinessProfile> {
  // Validate API key
  if (!claudeApiKey || claudeApiKey.trim() === '') {
    throw new Error('Claude API key is not configured. Please set ANTHROPIC_API_KEY in Cloudflare environment variables.');
  }

  const transcriptText = transcript.responses
    .map((r, i) => `Q${i + 1}: ${r.question}\nA${i + 1}: ${r.answer}`)
    .join('\n\n');

  const prompt = `You are a business analyst extracting key information from an interview transcript.

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
8. Available budget (if mentioned)

Respond in JSON format:
{
  "brandName": "...",
  "website": "...",
  "industry": "...",
  "targetMarket": "...",
  "currentStage": "...",
  "mainChallenges": ["...", "..."],
  "goals": ["...", "..."],
  "budget": "..."
}`;

  try {
    console.log('Calling Claude API with model: claude-opus-4-20250514');
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-20250514',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Claude API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody
      });
      throw new Error(`Claude API failed: ${response.statusText} (${response.status}). ${errorBody}`);
    }

    const data = await response.json();
    const analysisText = data.content[0].text;
    
    // Extract JSON from response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse business profile from Claude response');
    }

    const businessProfile: BusinessProfile = JSON.parse(jsonMatch[0]);
    console.log('Business profile extracted successfully');
    return businessProfile;
  } catch (error) {
    console.error('Error analyzing interview:', error);
    throw error;
  }
}

/**
 * Step 2: Verify website and perform deep research
 */
export async function verifyWebsiteAndResearch(
  website: string,
  claudeApiKey: string,
  rapidApiKey: string
): Promise<{ valid: boolean; scraped_content?: string; competitors: string[] }> {
  try {
    // First, validate the website format
    const urlPattern = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b/;
    if (!urlPattern.test(website)) {
      return { valid: false, competitors: [] };
    }

    // Normalize URL
    const normalizedUrl = website.startsWith('http') ? website : `https://${website}`;

    // Scrape website content (simplified - in production use proper scraping API)
    let scrapedContent = '';
    try {
      const response = await fetch(normalizedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; NexSpark/1.0; +https://nexspark.io)'
        }
      });
      
      if (response.ok) {
        const html = await response.text();
        // Extract text content (simplified)
        scrapedContent = html
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 5000); // Limit to 5000 chars
      }
    } catch (error) {
      console.log('Website scraping failed, will proceed with domain analysis:', error);
    }

    // Use Claude to identify competitors based on website content and domain
    const competitorPrompt = `Based on the website "${website}" and its content, identify the top 3-5 direct competitors.

${scrapedContent ? `Website content excerpt:\n${scrapedContent}\n\n` : ''}

Respond with ONLY a JSON array of competitor websites (just the domain names):
["competitor1.com", "competitor2.com", "competitor3.com"]`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: competitorPrompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API failed: ${response.statusText}`);
    }

    const data = await response.json();
    const competitorsText = data.content[0].text;
    
    // Extract JSON array
    const jsonMatch = competitorsText.match(/\[[\s\S]*?\]/);
    const competitors = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    return {
      valid: true,
      scraped_content: scrapedContent,
      competitors: competitors
    };
  } catch (error) {
    console.error('Error verifying website:', error);
    return { valid: false, competitors: [] };
  }
}

/**
 * Step 3: Generate comprehensive GTM strategy
 */
export async function generateGTMStrategy(
  businessProfile: BusinessProfile,
  competitors: string[],
  websiteContent: string,
  claudeApiKey: string,
  rapidApiKey: string
): Promise<GTMStrategy> {
  // Fetch traffic data for all competitors
  const competitorTrafficData = await Promise.all(
    competitors.map(async (domain) => {
      try {
        const traffic = await fetchTrafficData(domain, rapidApiKey);
        return { domain, traffic };
      } catch (error) {
        console.error(`Failed to fetch traffic for ${domain}:`, error);
        return { domain, traffic: null };
      }
    })
  );

  // Build comprehensive analysis prompt
  const analysisPrompt = `You are a senior growth strategist creating a comprehensive Go-To-Market (GTM) strategy.

BUSINESS PROFILE:
- Brand: ${businessProfile.brandName}
- Website: ${businessProfile.website}
- Industry: ${businessProfile.industry}
- Target Market: ${businessProfile.targetMarket}
- Stage: ${businessProfile.currentStage}
- Challenges: ${businessProfile.mainChallenges.join(', ')}
- Goals: ${businessProfile.goals.join(', ')}
- Budget: ${businessProfile.budget}

WEBSITE ANALYSIS:
${websiteContent.substring(0, 3000)}

COMPETITOR DATA:
${competitorTrafficData.map((c, i) => `
${i + 1}. ${c.domain}
   - Monthly Visits: ${c.traffic?.visits.toLocaleString() || 'N/A'}
   - Page Views: ${c.traffic?.pageViews.toLocaleString() || 'N/A'}
   - Traffic Sources: Direct ${c.traffic?.trafficSources.direct || 'N/A'}%, Search ${c.traffic?.trafficSources.search || 'N/A'}%, Social ${c.traffic?.trafficSources.social || 'N/A'}%
`).join('\n')}

Create a comprehensive GTM strategy including:

1. EXECUTIVE SUMMARY (2-3 paragraphs)
2. MARKET ANALYSIS
   - Market size estimate
   - Growth rate
   - Key trends (3-5)
   - Opportunities (3-5)
   - Threats (2-3)

3. COMPETITIVE ANALYSIS
   - Top competitors with strengths/weaknesses
   - Your competitive advantages
   - Positioning recommendation

4. TARGET AUDIENCE (Primary + Secondary if applicable)
   - Demographics
   - Psychographics
   - Pain points
   - Buying behavior

5. CHANNEL STRATEGY (Prioritize 4-6 channels)
   For each: channel name, priority (High/Medium/Low), budget %, expected ROI, specific tactics

6. 6-MONTH ROADMAP
   For each month (1-6): focus area, 3-4 objectives, 5-7 key activities, expected results (traffic, conversions, revenue), monthly budget

7. BUDGET PROJECTIONS
   - Total budget allocation by channel
   - Expected CAC (Customer Acquisition Cost)
   - Expected LTV (Lifetime Value)
   - Projected ROI

8. KEY KPIs (5-7 metrics)
   - Metric name, current value, 6-month target, tracking method

Respond in valid JSON format following this structure:
{
  "executiveSummary": "...",
  "marketAnalysis": {
    "marketSize": "...",
    "growthRate": "...",
    "keyTrends": ["..."],
    "opportunities": ["..."],
    "threats": ["..."]
  },
  "competitiveAnalysis": {
    "topCompetitors": [
      {
        "name": "...",
        "website": "...",
        "monthlyTraffic": 0,
        "topChannels": ["..."],
        "strengths": ["..."],
        "weaknesses": ["..."]
      }
    ],
    "competitiveAdvantages": ["..."],
    "positioningRecommendation": "..."
  },
  "targetAudience": {
    "primarySegment": {
      "demographics": ["..."],
      "psychographics": ["..."],
      "painPoints": ["..."],
      "buyingBehavior": "..."
    }
  },
  "channelStrategy": {
    "priorityChannels": [
      {
        "channel": "...",
        "priority": "High",
        "budgetAllocation": "30%",
        "expectedROI": "3.5x",
        "tactics": ["..."]
      }
    ]
  },
  "sixMonthRoadmap": {
    "month1": {
      "focus": "...",
      "objectives": ["..."],
      "keyActivities": ["..."],
      "expectedResults": {
        "traffic": "...",
        "conversions": "...",
        "revenue": "..."
      },
      "budget": "..."
    },
    ... (repeat for months 2-6)
  },
  "budgetProjections": {
    "totalBudget": "...",
    "channelBreakdown": [{"channel": "...", "budget": "...", "percentage": 30}],
    "expectedCAC": "...",
    "expectedLTV": "...",
    "projectedROI": "..."
  },
  "kpis": [
    {
      "metric": "...",
      "currentValue": "...",
      "sixMonthTarget": "...",
      "trackingMethod": "..."
    }
  ]
}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-20250514',
        max_tokens: 16384,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: analysisPrompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API failed: ${response.statusText}`);
    }

    const data = await response.json();
    const strategyText = data.content[0].text;
    
    // Extract JSON from response
    const jsonMatch = strategyText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse GTM strategy from Claude response');
    }

    const strategy: GTMStrategy = JSON.parse(jsonMatch[0]);
    
    // Add business profile to strategy
    strategy.businessProfile = businessProfile;
    
    return strategy;
  } catch (error) {
    console.error('Error generating GTM strategy:', error);
    throw error;
  }
}

/**
 * Generate HTML report from GTM strategy
 */
export function generateStrategyReport(strategy: GTMStrategy): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Growth Strategy Report - ${strategy.businessProfile.brandName}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #2c3e50;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
            border-bottom: 4px solid #667eea;
            margin-bottom: 40px;
        }
        .header h1 {
            font-size: 2.5em;
            color: #667eea;
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
            color: #667eea;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #ecf0f1;
        }
        .section h3 {
            font-size: 1.5em;
            color: #34495e;
            margin: 20px 0 10px 0;
        }
        .executive-summary {
            background: linear-gradient(135deg, #667eea10 0%, #764ba210 100%);
            padding: 30px;
            border-radius: 10px;
            font-size: 1.1em;
            line-height: 1.8;
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
            border-left: 4px solid #667eea;
        }
        .profile-item strong {
            display: block;
            color: #667eea;
            margin-bottom: 5px;
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
        .metric-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        .metric {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
        .channel-card {
            background: white;
            border: 2px solid #ecf0f1;
            padding: 20px;
            margin: 15px 0;
            border-radius: 10px;
        }
        .channel-card.high { border-left: 6px solid #27ae60; }
        .channel-card.medium { border-left: 6px solid #f39c12; }
        .channel-card.low { border-left: 6px solid #95a5a6; }
        .channel-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        .priority-badge {
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: bold;
        }
        .priority-high { background: #27ae60; color: white; }
        .priority-medium { background: #f39c12; color: white; }
        .priority-low { background: #95a5a6; color: white; }
        .roadmap-month {
            background: #f8f9fa;
            padding: 25px;
            margin: 20px 0;
            border-radius: 10px;
            border-left: 6px solid #667eea;
        }
        .roadmap-month h4 {
            color: #667eea;
            font-size: 1.3em;
            margin-bottom: 15px;
        }
        ul {
            margin-left: 20px;
            margin-top: 10px;
        }
        li {
            margin: 8px 0;
        }
        .kpi-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .kpi-table th {
            background: #667eea;
            color: white;
            padding: 15px;
            text-align: left;
        }
        .kpi-table td {
            padding: 15px;
            border-bottom: 1px solid #ecf0f1;
        }
        .kpi-table tr:hover {
            background: #f8f9fa;
        }
        @media print {
            body { background: white; padding: 0; }
            .container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>🚀 Growth Strategy Report</h1>
            <div class="subtitle">${strategy.businessProfile.brandName}</div>
            <div class="subtitle" style="font-size: 0.9em; margin-top: 10px;">
                Generated by NexSpark Growth OS • ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
        </div>

        <!-- Executive Summary -->
        <div class="section">
            <h2>📋 Executive Summary</h2>
            <div class="executive-summary">
                ${strategy.executiveSummary}
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
                    <strong>Current Stage</strong>
                    ${strategy.businessProfile.currentStage}
                </div>
                <div class="profile-item">
                    <strong>Budget</strong>
                    ${strategy.businessProfile.budget}
                </div>
            </div>
            
            <h3>Main Challenges</h3>
            <ul>
                ${strategy.businessProfile.mainChallenges.map(c => `<li>${c}</li>`).join('')}
            </ul>
            
            <h3>Business Goals</h3>
            <ul>
                ${strategy.businessProfile.goals.map(g => `<li>${g}</li>`).join('')}
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
            
            <h3>Opportunities</h3>
            <ul>
                ${strategy.marketAnalysis.opportunities.map(o => `<li>${o}</li>`).join('')}
            </ul>
            
            <h3>Threats</h3>
            <ul>
                ${strategy.marketAnalysis.threats.map(t => `<li>${t}</li>`).join('')}
            </ul>
        </div>

        <!-- Competitive Analysis -->
        <div class="section">
            <h2>🎯 Competitive Analysis</h2>
            
            <h3>Top Competitors</h3>
            ${strategy.competitiveAnalysis.topCompetitors.map(comp => `
                <div class="competitor-card">
                    <h4>${comp.name}</h4>
                    <p><strong>Website:</strong> <a href="${comp.website}" target="_blank">${comp.website}</a></p>
                    <p><strong>Monthly Traffic:</strong> ${comp.monthlyTraffic.toLocaleString()} visits</p>
                    <p><strong>Top Channels:</strong> ${comp.topChannels.join(', ')}</p>
                    
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
                </div>
            `).join('')}
            
            <h3>Your Competitive Advantages</h3>
            <ul>
                ${strategy.competitiveAnalysis.competitiveAdvantages.map(a => `<li>${a}</li>`).join('')}
            </ul>
            
            <h3>Positioning Recommendation</h3>
            <div class="executive-summary">
                ${strategy.competitiveAnalysis.positioningRecommendation}
            </div>
        </div>

        <!-- Target Audience -->
        <div class="section">
            <h2>👥 Target Audience</h2>
            
            <h3>Primary Segment</h3>
            <div class="profile-grid">
                <div class="profile-item">
                    <strong>Demographics</strong>
                    <ul>
                        ${strategy.targetAudience.primarySegment.demographics.map(d => `<li>${d}</li>`).join('')}
                    </ul>
                </div>
                <div class="profile-item">
                    <strong>Psychographics</strong>
                    <ul>
                        ${strategy.targetAudience.primarySegment.psychographics.map(p => `<li>${p}</li>`).join('')}
                    </ul>
                </div>
            </div>
            
            <h3>Pain Points</h3>
            <ul>
                ${strategy.targetAudience.primarySegment.painPoints.map(p => `<li>${p}</li>`).join('')}
            </ul>
            
            <h3>Buying Behavior</h3>
            <p>${strategy.targetAudience.primarySegment.buyingBehavior}</p>
        </div>

        <!-- Channel Strategy -->
        <div class="section">
            <h2>📢 Channel Strategy</h2>
            ${strategy.channelStrategy.priorityChannels.map(channel => `
                <div class="channel-card ${channel.priority.toLowerCase()}">
                    <div class="channel-header">
                        <h3>${channel.channel}</h3>
                        <span class="priority-badge priority-${channel.priority.toLowerCase()}">
                            ${channel.priority} Priority
                        </span>
                    </div>
                    <div class="profile-grid" style="margin-top: 15px;">
                        <div class="profile-item">
                            <strong>Budget Allocation</strong>
                            ${channel.budgetAllocation}
                        </div>
                        <div class="profile-item">
                            <strong>Expected ROI</strong>
                            ${channel.expectedROI}
                        </div>
                    </div>
                    <h4 style="margin-top: 15px;">Tactics:</h4>
                    <ul>
                        ${channel.tactics.map(t => `<li>${t}</li>`).join('')}
                    </ul>
                </div>
            `).join('')}
        </div>

        <!-- 6-Month Roadmap -->
        <div class="section">
            <h2>🗓️ 6-Month Growth Roadmap</h2>
            
            ${Object.entries(strategy.sixMonthRoadmap).map(([key, month], index) => `
                <div class="roadmap-month">
                    <h4>Month ${index + 1}: ${month.focus}</h4>
                    
                    <div style="margin-top: 15px;">
                        <strong>Objectives:</strong>
                        <ul>
                            ${month.objectives.map(o => `<li>${o}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div style="margin-top: 15px;">
                        <strong>Key Activities:</strong>
                        <ul>
                            ${month.keyActivities.map(a => `<li>${a}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="metric-grid" style="margin-top: 20px;">
                        <div class="profile-item">
                            <strong>Expected Traffic</strong>
                            ${month.expectedResults.traffic}
                        </div>
                        <div class="profile-item">
                            <strong>Expected Conversions</strong>
                            ${month.expectedResults.conversions}
                        </div>
                        <div class="profile-item">
                            <strong>Expected Revenue</strong>
                            ${month.expectedResults.revenue}
                        </div>
                        <div class="profile-item">
                            <strong>Monthly Budget</strong>
                            ${month.budget}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>

        <!-- Budget Projections -->
        <div class="section">
            <h2>💰 Budget Projections & ROI</h2>
            
            <div class="metric-grid">
                <div class="metric">
                    <span class="metric-value">${strategy.budgetProjections.totalBudget}</span>
                    <span class="metric-label">Total Budget</span>
                </div>
                <div class="metric">
                    <span class="metric-value">${strategy.budgetProjections.expectedCAC}</span>
                    <span class="metric-label">Expected CAC</span>
                </div>
                <div class="metric">
                    <span class="metric-value">${strategy.budgetProjections.expectedLTV}</span>
                    <span class="metric-label">Expected LTV</span>
                </div>
                <div class="metric">
                    <span class="metric-value">${strategy.budgetProjections.projectedROI}</span>
                    <span class="metric-label">Projected ROI</span>
                </div>
            </div>
            
            <h3>Channel Budget Breakdown</h3>
            <div class="profile-grid">
                ${strategy.budgetProjections.channelBreakdown.map(item => `
                    <div class="profile-item">
                        <strong>${item.channel}</strong>
                        ${item.budget} (${item.percentage}%)
                    </div>
                `).join('')}
            </div>
        </div>

        <!-- KPIs -->
        <div class="section">
            <h2>📈 Key Performance Indicators (KPIs)</h2>
            <table class="kpi-table">
                <thead>
                    <tr>
                        <th>Metric</th>
                        <th>Current Value</th>
                        <th>6-Month Target</th>
                        <th>Tracking Method</th>
                    </tr>
                </thead>
                <tbody>
                    ${strategy.kpis.map(kpi => `
                        <tr>
                            <td><strong>${kpi.metric}</strong></td>
                            <td>${kpi.currentValue}</td>
                            <td><strong style="color: #27ae60;">${kpi.sixMonthTarget}</strong></td>
                            <td>${kpi.trackingMethod}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <!-- Footer -->
        <div class="section" style="text-align: center; padding-top: 40px; border-top: 2px solid #ecf0f1;">
            <p style="color: #7f8c8d; font-size: 0.9em;">
                Generated by <strong>NexSpark Growth OS</strong> • Powered by Claude AI<br>
                For questions or support: founders@nexspark.io
            </p>
        </div>
    </div>
</body>
</html>
  `;
}
