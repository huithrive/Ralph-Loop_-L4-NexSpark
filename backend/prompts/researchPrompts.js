/**
 * Claude AI prompts for market research analysis
 */

/**
 * System prompt for market research
 */
const RESEARCH_SYSTEM_PROMPT = `You are a senior business strategist and market research expert. Your task is to analyze a company's website and product description to provide comprehensive market intelligence.

You will conduct thorough analysis in these areas:
1. Market size estimation (TAM/SAM)
2. Competitive landscape analysis
3. Target audience identification
4. Customer pain points
5. Recommended marketing channels

Your analysis should be data-driven, actionable, and focused on growth opportunities.`;

/**
 * User prompt template for market research
 * @param {string} websiteUrl - Website URL to analyze
 * @param {string} productDescription - Product description
 * @returns {string} - Formatted research prompt
 */
function createResearchPrompt(websiteUrl, productDescription) {
  return `Please analyze the following company and provide comprehensive market research:

**Company Website:** ${websiteUrl}
**Product Description:** ${productDescription}

Conduct deep market research and provide your analysis in the following JSON format:

{
  "marketSize": {
    "tam": "Total Addressable Market estimate in USD",
    "sam": "Serviceable Addressable Market estimate in USD",
    "growthRate": "Annual market growth rate percentage",
    "trends": ["Key market trend 1", "Key market trend 2", "Key market trend 3"]
  },
  "targetAudience": {
    "primary": {
      "demographics": {
        "age": "Age range",
        "gender": "Gender distribution",
        "income": "Income level",
        "education": "Education level",
        "location": "Geographic focus"
      },
      "psychographics": {
        "interests": ["Interest 1", "Interest 2", "Interest 3"],
        "values": ["Value 1", "Value 2", "Value 3"],
        "behaviors": ["Behavior 1", "Behavior 2", "Behavior 3"],
        "painPoints": ["Pain point 1", "Pain point 2", "Pain point 3"]
      }
    },
    "secondary": {
      "description": "Secondary audience description",
      "size": "Relative size compared to primary"
    }
  },
  "competitors": [
    {
      "name": "Competitor Name",
      "website": "competitor-url",
      "positioning": "How they position themselves",
      "strengths": ["Strength 1", "Strength 2"],
      "weaknesses": ["Weakness 1", "Weakness 2"],
      "marketShare": "Estimated market share percentage",
      "pricing": "Pricing model/range"
    }
  ],
  "channels": [
    {
      "channel": "Marketing channel name",
      "priority": "high|medium|low",
      "rationale": "Why this channel is recommended",
      "estimatedCPA": "Estimated cost per acquisition",
      "expectedROAS": "Expected return on ad spend"
    }
  ],
  "painPoints": [
    {
      "problem": "Customer problem description",
      "severity": "high|medium|low",
      "frequency": "How often customers face this",
      "currentSolutions": ["Current solution 1", "Current solution 2"],
      "opportunity": "How the product addresses this"
    }
  ],
  "opportunities": [
    {
      "title": "Opportunity title",
      "description": "Detailed opportunity description",
      "impact": "high|medium|low",
      "effort": "high|medium|low",
      "timeframe": "Short/medium/long term"
    }
  ],
  "threats": [
    {
      "threat": "Threat description",
      "severity": "high|medium|low",
      "probability": "high|medium|low",
      "mitigation": "Suggested mitigation strategy"
    }
  ],
  "recommendations": {
    "immediate": ["Action item 1", "Action item 2"],
    "shortTerm": ["3-month goal 1", "3-month goal 2"],
    "longTerm": ["12-month vision 1", "12-month vision 2"]
  }
}

Important guidelines:
- Base your analysis on publicly available information and market research best practices
- Provide realistic market size estimates with reasoning
- Include 5-7 direct competitors when possible
- Focus on actionable insights
- Prioritize channels based on audience and budget efficiency
- Consider both B2B and B2C perspectives as appropriate
- Include quantitative estimates where possible (market size, pricing, CPA, ROAS)

Return ONLY the JSON object with no additional text or formatting.`;
}

/**
 * Alternative research prompt for when initial analysis needs refinement
 * @param {string} websiteUrl - Website URL
 * @param {string} productDescription - Product description
 * @param {string} focusArea - Specific area to focus on
 * @returns {string} - Focused research prompt
 */
function createFocusedResearchPrompt(websiteUrl, productDescription, focusArea) {
  const focusPrompts = {
    competitors: `Focus specifically on competitive analysis. Identify 7-10 direct and indirect competitors, their positioning, pricing, strengths, and weaknesses.`,
    audience: `Focus specifically on target audience analysis. Create detailed buyer personas with demographics, psychographics, pain points, and behavioral patterns.`,
    channels: `Focus specifically on marketing channel recommendations. Analyze which channels would be most effective based on the target audience and provide specific recommendations for budget allocation.`,
    market: `Focus specifically on market size and opportunity analysis. Provide detailed TAM/SAM calculations, growth projections, and market trends.`
  };

  return `Analyze this company with specific focus on ${focusArea}:

**Company Website:** ${websiteUrl}
**Product Description:** ${productDescription}

${focusPrompts[focusArea] || focusPrompts.market}

Provide your analysis in JSON format with detailed insights for the specified focus area.`;
}

/**
 * Validation prompt to check research quality
 * @param {object} researchData - Previously generated research data
 * @returns {string} - Validation prompt
 */
function createValidationPrompt(researchData) {
  return `Please review and validate this market research analysis. Check for:

1. Data consistency and logical coherence
2. Realistic market size estimates
3. Comprehensive competitor analysis
4. Actionable insights and recommendations
5. Missing critical information

Research Data:
${JSON.stringify(researchData, null, 2)}

Provide a validation report in JSON format:
{
  "isValid": true/false,
  "score": 1-10,
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "improvements": ["improvement 1", "improvement 2"],
  "missingData": ["missing item 1", "missing item 2"]
}

Return ONLY the JSON object.`;
}

module.exports = {
  RESEARCH_SYSTEM_PROMPT,
  createResearchPrompt,
  createFocusedResearchPrompt,
  createValidationPrompt
};