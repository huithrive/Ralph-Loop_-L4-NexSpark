/**
 * AI Prompt Templates for Preview Generation
 * Contains all prompt templates used by preview generation functions
 */

import type { InterviewData, CompetitorInsight } from '../report-generation';

/**
 * Build comprehensive prompt for Claude to generate the full report
 */
export function buildReportPrompt(data: InterviewData, competitors: CompetitorInsight[]): string {
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
 * Build prompt for enhanced interview summary
 */
export function buildEnhancedSummaryPrompt(transcript: string): string {
  return `You are an expert business analyst. Analyze this interview transcript and extract key business information.

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
}

/**
 * Build prompt for roadmap preview generation
 */
export function buildRoadmapPreviewPrompt(
  brandName: string,
  industry: string,
  stage: string,
  budget: string,
  challenges: string[],
  goals: string[]
): string {
  return `Generate a 6-month growth roadmap for ${brandName} in ${industry} (${stage}).

Context:
- Budget: ${budget}
- Main Challenge: ${challenges[0] || 'Growing revenue'}
- Primary Goal: ${goals[0] || 'Increase growth'}

Create 3 phases (2 months each) with specific, actionable steps.

JSON format:
{
  "phases": [
    {
      "months": "1-2",
      "name": "Phase name",
      "actions": ["Specific action 1", "Specific action 2", "Specific action 3", "Specific action 4"],
      "goal": "Measurable outcome for this phase"
    }
  ]
}

RULES:
- Each phase needs 4-5 concrete actions
- Make actions specific to ${industry} industry
- Include actual tools, tactics, and numbers
- Goal should be a measurable outcome

Return ONLY valid JSON.`;
}

/**
 * Build prompt for benchmarks preview generation
 */
export function buildBenchmarksPreviewPrompt(
  brandName: string,
  industry: string,
  stage: string,
  budget: string,
  targetMarket: string
): string {
  return `Generate realistic ad performance benchmarks for ${brandName} in ${industry}.

Business: ${stage} stage, ${budget} budget, targeting ${targetMarket}

Provide industry-specific benchmarks for Google Ads and Meta Ads.
Use real industry data, adjust for their stage and budget.

JSON format:
{
  "googleAds": {
    "targetCPC": "$X.XX-$X.XX",
    "expectedCTR": "X.X-X.X%",
    "projectedCAC": "$XX-$XX",
    "recommendedBudget": "$X,XXX-$X,XXX/month",
    "expectedROI": "Xx-Xx"
  },
  "metaAds": {
    "targetCPM": "$XX-$XX",
    "expectedCTR": "X.X-X.X%",
    "projectedCAC": "$XX-$XX",
    "recommendedBudget": "$X,XXX-$X,XXX/month",
    "expectedROI": "Xx-Xx"
  }
}

Be conservative. Use ranges. Base on ${industry} industry data.

Return ONLY valid JSON.`;
}

/**
 * Build prompt for competitor preview generation
 */
export function buildCompetitorPreviewPrompt(
  website: string,
  industry: string,
  brandName: string,
  websiteContext: string
): string {
  return `You are a competitive intelligence analyst. Research and find the TOP 5 REAL, EXISTING COMPETITORS for the company at ${website}.

CRITICAL INSTRUCTIONS:
1. First, understand what ${website} actually does by analyzing their website content
2. Find 5 DIRECT competitors - REAL companies with REAL websites that actually exist
3. ONLY suggest competitors you are CERTAIN exist - do not make up company names or websites

⚠️ ANTI-HALLUCINATION RULES:
- DO NOT invent company names or websites
- DO NOT suggest hypothetical competitors
- DO NOT make up website URLs
- If you're not sure a competitor exists, DO NOT include it

The competitors must:
- Offer similar products/services to ${website}
- Target the same customer segments
- Actually exist and have working websites

Return a JSON object with UP TO 5 VERIFIED competitors:
{
  "competitors": [
    {
      "name": "REAL competitor company name",
      "website": "REAL, EXISTING website URL (verified to exist, format: domain.com)",
      "monthlyTraffic": "Pending",
      "strength": "Their single biggest competitive advantage (one specific sentence)",
      "weakness": "Their single biggest vulnerability or gap (one specific opportunity sentence)",
      "positioning": "How they position themselves in one sentence"
    }
  ]
}

Brand being analyzed: ${brandName}
Website: ${website}
Industry: ${industry}

IMPORTANT:
- Only include competitors you are confident actually exist
- Better to return 2-3 real competitors than 5 made-up ones
- For website field, use clean domain format (e.g., "competitor.com" not "https://competitor.com")
- Set monthlyTraffic to "Pending" - it will be fetched separately
${websiteContext}

Return ONLY the JSON object with up to 5 competitors.`;
}
