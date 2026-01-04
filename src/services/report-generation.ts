/**
 * Advanced Report Generation Service
 * Uses Claude 4.5 Sonnet to generate comprehensive, slide-formatted growth reports
 */

export interface InterviewData {
  brandName: string;
  productDescription: string;
  founded?: string;
  motivation?: string;
  currentRevenue: string;
  marketingChannels: string[];
  bestChannel?: string;
  biggestChallenge: string;
  idealCustomer: string;
  competitors: string[];
  sixMonthGoal: string;
  industry?: string;
  website?: string;
}

export interface CompetitorInsight {
  name: string;
  website: string;
  monthlyTraffic: string;
  strength: string;
  weakness: string;
  positioning?: string;
}

export interface ReportSlide {
  slideNumber: number;
  title: string;
  content: string;
  keyPoints?: string[];
  data?: any;
}

export interface FullReport {
  executiveSummary: string;
  slides: ReportSlide[];
  nextSteps: string[];
  metadata: {
    generatedAt: string;
    brandName: string;
    provider: string;
  };
}

/**
 * Generate a comprehensive growth report using Claude 4.5 Sonnet
 */
export async function generateComprehensiveReport(
  interviewData: InterviewData,
  competitors: CompetitorInsight[],
  env: any
): Promise<FullReport> {
  const claudeApiKey = env.ANTHROPIC_API_KEY;
  
  if (!claudeApiKey || !claudeApiKey.startsWith('sk-ant-')) {
    throw new Error('Claude API key is required for report generation');
  }

  const prompt = buildReportPrompt(interviewData, competitors);

  console.log(`📊 Generating comprehensive report for ${interviewData.brandName} with Claude 4.5 Sonnet...`);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': claudeApiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250514',
      max_tokens: 8000,
      temperature: 0.7,
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
    console.error('Claude API error:', errorBody);
    throw new Error(`Claude API failed: ${response.statusText}`);
  }

  const data = await response.json();
  const reportText = data.content[0].text;

  // Parse the structured report
  const report = parseReportResponse(reportText, interviewData.brandName);
  
  console.log(`✅ Report generated successfully with ${report.slides.length} slides`);
  
  return report;
}

/**
 * Build comprehensive prompt for Claude to generate the report
 */
function buildReportPrompt(data: InterviewData, competitors: CompetitorInsight[]): string {
  const competitorSection = competitors.map(c => 
    `- ${c.name} (${c.website}): ${c.monthlyTraffic} monthly visitors
     Strength: ${c.strength}
     Weakness: ${c.weakness}
     ${c.positioning ? `Positioning: ${c.positioning}` : ''}`
  ).join('\n');

  return `You are a senior growth strategist creating a comprehensive 6-month go-to-market strategy for a SaaS company.

COMPANY INFORMATION:
- Brand: ${data.brandName}
- Product: ${data.productDescription}
- Current Revenue: ${data.currentRevenue}
- 6-Month Goal: ${data.sixMonthGoal}
- Biggest Challenge: ${data.biggestChallenge}
- Ideal Customer: ${data.idealCustomer}
- Current Marketing Channels: ${data.marketingChannels.join(', ')}
${data.industry ? `- Industry: ${data.industry}` : ''}
${data.website ? `- Website: ${data.website}` : ''}

COMPETITOR LANDSCAPE:
${competitorSection}

Create a comprehensive, actionable 6-month growth strategy formatted as presentation slides. This is a $20 premium report, so it must provide exceptional value.

Return your response in the following JSON format:

{
  "executiveSummary": "A compelling 2-3 paragraph executive summary highlighting the main opportunity, strategy, and expected outcomes",
  "slides": [
    {
      "slideNumber": 1,
      "title": "Slide Title",
      "content": "Detailed content in HTML format with <h3>, <p>, <ul>, <li> tags. Include specific numbers, timelines, and actionable recommendations.",
      "keyPoints": ["Point 1", "Point 2", "Point 3"],
      "data": {
        // Optional: Include metrics, charts data, projections
      }
    }
  ],
  "nextSteps": [
    "Specific action item 1 with timeline",
    "Specific action item 2 with timeline",
    "Specific action item 3 with timeline"
  ]
}

REQUIRED SLIDES (minimum 12 slides):

1. **Market Positioning & Opportunity**
   - Current market position
   - White space analysis
   - Key differentiators vs competitors
   - Total Addressable Market (TAM) estimate

2. **Competitive Intelligence**
   - Deep dive on each competitor
   - Traffic analysis and trends
   - Positioning gaps and opportunities
   - How to win against each competitor

3. **Target Customer Profile**
   - Detailed ICP (Ideal Customer Profile)
   - Customer pain points and motivations
   - Buying triggers and decision criteria
   - Where they spend time online

4. **Marketing Channel Strategy - Phase 1 (Months 1-2)**
   - Primary channels to focus on
   - Budget allocation ($X per channel)
   - Expected KPIs (CAC, CTR, conversions)
   - Content strategy and messaging
   - Specific campaign ideas

5. **Marketing Channel Strategy - Phase 2 (Months 3-4)**
   - Channel expansion
   - Budget scaling recommendations
   - A/B testing priorities
   - Optimization tactics
   - Partnership opportunities

6. **Marketing Channel Strategy - Phase 3 (Months 5-6)**
   - Advanced tactics
   - Scale-up strategy
   - Retention and expansion focus
   - Community building

7. **Content & SEO Strategy**
   - Content pillars and themes
   - SEO keyword opportunities
   - Content calendar (first 3 months)
   - Distribution strategy

8. **Conversion Optimization**
   - Landing page strategy
   - Funnel optimization priorities
   - Lead magnet ideas
   - Email nurture sequences

9. **Financial Projections**
   - Month-by-month revenue projections
   - CAC and LTV analysis
   - ROI expectations per channel
   - Break-even analysis
   - Budget recommendations

10. **Growth Metrics Dashboard**
    - North Star Metric
    - Key metrics to track weekly
    - Leading vs lagging indicators
    - Benchmarks for success

11. **Risk Mitigation**
    - Potential obstacles and solutions
    - Budget contingencies
    - Plan B scenarios
    - Market risks to monitor

12. **Implementation Roadmap**
    - Week-by-week action plan for Month 1
    - Monthly milestones for Months 2-6
    - Team/resource requirements
    - Tools and technology needed

Each slide should be detailed, specific, and actionable. Include real numbers, timelines, and concrete recommendations. Make it worth $20.

Return ONLY the JSON object, no markdown formatting, no code blocks.`;
}

/**
 * Parse Claude's response into structured report format
 */
function parseReportResponse(responseText: string, brandName: string): FullReport {
  try {
    // Try to extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      executiveSummary: parsed.executiveSummary || '',
      slides: parsed.slides || [],
      nextSteps: parsed.nextSteps || [],
      metadata: {
        generatedAt: new Date().toISOString(),
        brandName: brandName,
        provider: 'Claude 3.5 Sonnet'
      }
    };
  } catch (error) {
    console.error('Failed to parse report response:', error);
    throw new Error('Failed to parse report from Claude response');
  }
}

/**
 * Generate enhanced summary with Claude 4.5 Sonnet
 */
export async function generateEnhancedSummary(
  responses: Array<{ question: string; answer: string }>,
  env: any
): Promise<InterviewData> {
  const claudeApiKey = env.ANTHROPIC_API_KEY;
  
  if (!claudeApiKey || !claudeApiKey.startsWith('sk-ant-')) {
    throw new Error('Claude API key is required for summary generation');
  }

  const transcript = responses.map((r, idx) => 
    `Q${idx + 1}: ${r.question}\nA${idx + 1}: ${r.answer}`
  ).join('\n\n');

  const prompt = `You are an expert business analyst. Analyze this interview transcript and extract key business information.

INTERVIEW TRANSCRIPT:
${transcript}

Return a comprehensive JSON object with the following structure:

{
  "brandName": "Company name from the interview",
  "productDescription": "Detailed description of what they do/sell (2-3 sentences)",
  "founded": "When the company was founded (if mentioned)",
  "motivation": "Founder's motivation and vision (1-2 sentences)",
  "currentRevenue": "Current monthly or annual revenue",
  "marketingChannels": ["Array of current marketing channels they use"],
  "bestChannel": "Their current best performing channel",
  "biggestChallenge": "Their main growth challenge (detailed)",
  "idealCustomer": "Detailed ideal customer profile",
  "competitors": ["Array of competitor names mentioned"],
  "sixMonthGoal": "Their 6-month revenue or growth goal",
  "industry": "Industry/category (e.g., SaaS, E-commerce, B2B Services)",
  "website": "Company website if mentioned"
}

Be thorough and specific. Extract all relevant details from the interview.

Return ONLY the JSON object, no markdown, no explanation.`;

  console.log('📊 Generating enhanced summary with Claude 4.5 Sonnet...');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': claudeApiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250514',
      max_tokens: 3000,
      temperature: 0.5,
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
    console.error('Claude API error:', errorBody);
    throw new Error(`Claude API failed: ${response.statusText}`);
  }

  const data = await response.json();
  const summaryText = data.content[0].text;

  // Parse JSON from Claude's response
  const jsonMatch = summaryText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse JSON from Claude response');
  }

  const summary: InterviewData = JSON.parse(jsonMatch[0]);
  console.log('✅ Enhanced summary generated successfully');
  
  return summary;
}

/**
 * Generate enhanced competitor preview with Claude 4.5 Sonnet
 */
export async function generateCompetitorPreview(
  website: string,
  industry: string,
  competitors: string[],
  env: any
): Promise<CompetitorInsight[]> {
  const claudeApiKey = env.ANTHROPIC_API_KEY;
  
  if (!claudeApiKey || !claudeApiKey.startsWith('sk-ant-')) {
    // Fallback to basic data
    return competitors.map(comp => ({
      name: comp.replace(/\.(com|io|net|org).*/, '').replace(/^www\./, ''),
      website: comp,
      monthlyTraffic: 'Unknown',
      strength: 'Established market presence',
      weakness: 'Opportunity for differentiation'
    }));
  }

  const prompt = `Analyze these competitors in the ${industry} space for a company at ${website}:

Competitors: ${competitors.join(', ')}

For each competitor, provide detailed intelligence:

{
  "competitors": [
    {
      "name": "Company name",
      "website": "website URL",
      "monthlyTraffic": "Estimated monthly traffic (e.g., 50M+, 100K-500K, or Unknown)",
      "strength": "Their main competitive advantage (specific and detailed)",
      "weakness": "Their vulnerability or gap (specific opportunity)",
      "positioning": "How they position themselves in the market"
    }
  ]
}

Be specific and insightful. Include traffic estimates if you know them, or use industry benchmarks.

Return ONLY the JSON object.`;

  console.log(`📊 Generating competitor analysis with Claude 4.5 Sonnet for ${website}...`);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': claudeApiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250514',
      max_tokens: 2000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    console.warn('Claude API failed for competitor analysis, using fallback');
    return competitors.map(comp => ({
      name: comp.replace(/\.(com|io|net|org).*/, '').replace(/^www\./, ''),
      website: comp,
      monthlyTraffic: 'Unknown',
      strength: 'Established market presence',
      weakness: 'Opportunity for differentiation'
    }));
  }

  const data = await response.json();
  const analysisText = data.content[0].text;

  try {
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    console.log(`✅ Competitor analysis generated for ${parsed.competitors?.length || 0} competitors`);
    
    return parsed.competitors || [];
  } catch (error) {
    console.warn('Failed to parse competitor analysis, using fallback');
    return competitors.map(comp => ({
      name: comp.replace(/\.(com|io|net|org).*/, '').replace(/^www\./, ''),
      website: comp,
      monthlyTraffic: 'Unknown',
      strength: 'Established market presence',
      weakness: 'Opportunity for differentiation'
    }));
  }
}
