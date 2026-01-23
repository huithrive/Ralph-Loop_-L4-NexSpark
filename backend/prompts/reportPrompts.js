/**
 * Claude AI prompts for NexSpark GTM Report Generation
 *
 * Structured prompts for generating comprehensive go-to-market strategy reports
 */

/**
 * System prompt for GTM report generation
 */
const GTM_SYSTEM_PROMPT = `You are a senior strategic consultant and go-to-market expert with 15+ years of experience helping startups and scale-ups achieve rapid growth. You specialize in:

- Market analysis and competitive intelligence
- Customer segmentation and persona development
- Channel strategy and budget optimization
- Growth roadmap planning with clear milestones
- Performance metrics and KPI frameworks

Your reports are known for being:
- Data-driven and actionable
- Focused on $10K revenue in 90 days
- Specific rather than generic
- Realistic given resource constraints
- Professional but accessible

You will receive synthesized market research and interview data to create a comprehensive GTM strategy report.`;

/**
 * Generate complete GTM report prompt
 * @param {object} context - Synthesized research and interview context
 * @returns {string} - Complete report generation prompt
 */
function createFullReportPrompt(context) {
  const hasInterview = context.meta.reportType === 'comprehensive';
  const confidenceLevel = context.dataQuality.confidenceScore;

  return `Generate a comprehensive Go-to-Market strategy report based on the following data:

**BUSINESS CONTEXT:**
Website: ${context.business.websiteUrl}
Product: ${context.business.productDescription}
Report Type: ${context.meta.reportType}
Data Confidence: ${confidenceLevel}% ${getConfidenceDescription(confidenceLevel)}

**MARKET INTELLIGENCE:**
Market Size: ${context.market.size.tam || 'Not determined'} (TAM), ${context.market.size.sam || 'Not determined'} (SAM)
Growth Rate: ${context.market.size.growthRate || 'Not determined'}
Competitors: ${context.market.competitors.length} identified
Marketing Channels: ${context.marketing.channels.length} analyzed
Pain Points: ${context.market.painPoints.length} identified

${hasInterview ? `**STRATEGIC INSIGHTS (from interview):**
Brand Positioning: ${JSON.stringify(context.strategy.brandPositioning, null, 2)}
Resource Constraints: ${JSON.stringify(context.strategy.resourceConstraints, null, 2)}
Growth Priorities: ${JSON.stringify(context.strategy.growthPriorities, null, 2)}
Personal Motivations: ${JSON.stringify(context.strategy.personalMotivations, null, 2)}` : ''}

**FULL CONTEXT DATA:**
${JSON.stringify(context, null, 2)}

Generate a complete GTM strategy report with these 7 sections in JSON format:

{
  "executiveSummary": {
    "marketOpportunity": "2-3 sentence summary of market opportunity",
    "targetCustomer": "1 sentence describing primary customer",
    "competitiveAdvantage": "1 sentence about key differentiation",
    "revenueProjection": "Specific $10K/90-day pathway",
    "keySuccess": ["Critical success factor 1", "Critical success factor 2", "Critical success factor 3"],
    "investmentRequired": "Estimated budget needed",
    "timeline": "90-day milestone summary"
  },
  "marketAnalysis": {
    "marketSize": {
      "tam": "Total addressable market with reasoning",
      "sam": "Serviceable addressable market calculation",
      "som": "Serviceable obtainable market (90-day target)"
    },
    "competitiveLandscape": {
      "directCompetitors": [{"name": "Name", "threat": "high/medium/low", "advantage": "how to beat them"}],
      "indirectCompetitors": [{"category": "Category", "impact": "description"}],
      "competitiveAdvantages": ["Advantage 1", "Advantage 2", "Advantage 3"],
      "marketPosition": "How to position against competition"
    },
    "marketTrends": ["Trend 1 and impact", "Trend 2 and impact", "Trend 3 and impact"],
    "threats": [{"threat": "description", "mitigation": "strategy"}],
    "opportunities": [{"opportunity": "description", "potential": "impact"}]
  },
  "targetAudience": {
    "primaryPersona": {
      "name": "Persona name (e.g., 'Growth-Focused Founder')",
      "demographics": {"age": "range", "income": "range", "location": "focus areas", "role": "job title"},
      "psychographics": {"goals": ["Goal 1", "Goal 2"], "challenges": ["Challenge 1", "Challenge 2"], "values": ["Value 1", "Value 2"]},
      "buyingBehavior": {"decisionFactors": ["Factor 1", "Factor 2"], "researchProcess": "how they research", "timeline": "decision timeline"},
      "painPoints": ["Pain 1", "Pain 2", "Pain 3"],
      "messaging": "Core message that resonates"
    },
    "secondaryPersona": {
      "name": "Secondary persona name",
      "size": "Percentage of primary",
      "keyDifferences": ["Difference 1", "Difference 2"]
    }
  },
  "channelStrategy": {
    "recommendedChannels": [
      {
        "channel": "Channel name",
        "priority": "high/medium/low",
        "rationale": "Why this channel works for target audience",
        "budget": {"monthly": "$X", "percentage": "X% of total"},
        "metrics": {"cpa": "$X", "roas": "X:1", "conversionRate": "X%"},
        "implementation": ["Step 1", "Step 2", "Step 3"],
        "timeline": "When to start and scale",
        "expectedResults": "What to expect in 90 days"
      }
    ],
    "contentStrategy": {
      "keyMessages": ["Message 1", "Message 2", "Message 3"],
      "contentTypes": ["Type 1", "Type 2", "Type 3"],
      "contentCalendar": "High-level content approach"
    },
    "budgetAllocation": {
      "totalMonthly": "$X recommendation",
      "channelBreakdown": {"Channel 1": "$X", "Channel 2": "$X"},
      "scalingPlan": "How to increase budget over 90 days"
    }
  },
  "actionPlan": {
    "phase1": {
      "name": "Foundation (Weeks 1-4)",
      "milestone": "$1,000 revenue",
      "objectives": ["Objective 1", "Objective 2", "Objective 3"],
      "tactics": [
        {"week": 1, "focus": "Setup", "actions": ["Action 1", "Action 2"]},
        {"week": 2, "focus": "Launch", "actions": ["Action 1", "Action 2"]},
        {"week": 3, "focus": "Test", "actions": ["Action 1", "Action 2"]},
        {"week": 4, "focus": "Optimize", "actions": ["Action 1", "Action 2"]}
      ]
    },
    "phase2": {
      "name": "Scale (Weeks 5-8)",
      "milestone": "$3,000-5,000 revenue",
      "objectives": ["Objective 1", "Objective 2"],
      "tactics": [
        {"week": 5, "focus": "Expand", "actions": ["Action 1", "Action 2"]},
        {"week": 6, "focus": "Scale", "actions": ["Action 1", "Action 2"]},
        {"week": 7, "focus": "Optimize", "actions": ["Action 1", "Action 2"]},
        {"week": 8, "focus": "Accelerate", "actions": ["Action 1", "Action 2"]}
      ]
    },
    "phase3": {
      "name": "Accelerate (Weeks 9-12)",
      "milestone": "$10,000 revenue",
      "objectives": ["Objective 1", "Objective 2"],
      "tactics": [
        {"week": 9, "focus": "Maximize", "actions": ["Action 1", "Action 2"]},
        {"week": 10, "focus": "Sprint", "actions": ["Action 1", "Action 2"]},
        {"week": 11, "focus": "Push", "actions": ["Action 1", "Action 2"]},
        {"week": 12, "focus": "Achieve", "actions": ["Action 1", "Action 2"]}
      ]
    },
    "criticalPath": ["Must-do item 1", "Must-do item 2", "Must-do item 3"],
    "riskMitigation": [{"risk": "Risk description", "mitigation": "How to address"}]
  },
  "budgetFramework": {
    "monthlyBudget": {
      "month1": {"amount": "$X", "allocation": {"Marketing": "$X", "Tools": "$X", "Content": "$X"}},
      "month2": {"amount": "$X", "allocation": {"Marketing": "$X", "Tools": "$X", "Content": "$X"}},
      "month3": {"amount": "$X", "allocation": {"Marketing": "$X", "Tools": "$X", "Content": "$X"}}
    },
    "roiProjection": {
      "month1": {"spend": "$X", "revenue": "$X", "roi": "X%"},
      "month2": {"spend": "$X", "revenue": "$X", "roi": "X%"},
      "month3": {"spend": "$X", "revenue": "$X", "roi": "X%"}
    },
    "scalingStrategy": "When and how to increase budget",
    "costOptimization": ["Cost saving tip 1", "Cost saving tip 2"]
  },
  "successMetrics": {
    "primaryKPI": {
      "metric": "$10,000 revenue in 90 days",
      "tracking": "How to measure",
      "milestones": {"30days": "$X", "60days": "$X", "90days": "$10,000"}
    },
    "secondaryKPIs": [
      {"metric": "Customer Acquisition Cost (CAC)", "target": "$X", "importance": "why it matters"},
      {"metric": "Return on Ad Spend (ROAS)", "target": "X:1", "importance": "why it matters"},
      {"metric": "Conversion Rate", "target": "X%", "importance": "why it matters"},
      {"metric": "Average Order Value (AOV)", "target": "$X", "importance": "why it matters"}
    ],
    "trackingFramework": {
      "daily": ["Metric 1", "Metric 2"],
      "weekly": ["Metric 1", "Metric 2"],
      "monthly": ["Metric 1", "Metric 2"]
    },
    "redFlags": ["Warning sign 1", "Warning sign 2"],
    "greenFlags": ["Success indicator 1", "Success indicator 2"]
  }
}

CRITICAL REQUIREMENTS:
1. Be specific with dollar amounts and percentages
2. Base recommendations on the actual market data provided
3. Account for resource constraints if interview data is available
4. Focus on realistic $10K/90-day achievement
5. Provide actionable tactics, not generic advice
6. Return ONLY the JSON object, no additional text
7. Ensure all sections are complete and detailed
${hasInterview ? '8. Leverage interview insights for personalized recommendations' : '8. Base strategy purely on market research data'}

Return the complete JSON report now:`;
}

/**
 * Generate individual section prompts for targeted generation
 */
const sectionPrompts = {

  executiveSummary: (context) => `${GTM_SYSTEM_PROMPT}

Create an executive summary for a GTM strategy report based on this data:

${JSON.stringify(context, null, 2)}

Generate ONLY the executiveSummary section in this JSON format:

{
  "marketOpportunity": "Compelling 2-3 sentence market opportunity statement",
  "targetCustomer": "Clear 1-sentence primary customer description",
  "competitiveAdvantage": "Unique value proposition in 1 sentence",
  "revenueProjection": "Specific pathway to $10K in 90 days with key assumptions",
  "keySuccess": ["Critical success factor 1", "Critical success factor 2", "Critical success factor 3"],
  "investmentRequired": "Total budget estimate needed for success",
  "timeline": "High-level 90-day milestone summary"
}

Focus on being specific, compelling, and realistic based on the market data provided.`,

  marketAnalysis: (context) => `${GTM_SYSTEM_PROMPT}

Create a comprehensive market analysis section based on this data:

${JSON.stringify(context, null, 2)}

Generate ONLY the marketAnalysis section in JSON format with detailed competitive intelligence, market sizing, and strategic opportunities.`,

  targetAudience: (context) => `${GTM_SYSTEM_PROMPT}

Create detailed customer personas based on this data:

${JSON.stringify(context, null, 2)}

Generate ONLY the targetAudience section with rich primary and secondary personas including demographics, psychographics, buying behavior, and messaging strategy.`,

  channelStrategy: (context) => `${GTM_SYSTEM_PROMPT}

Create a comprehensive channel strategy based on this data:

${JSON.stringify(context, null, 2)}

Generate ONLY the channelStrategy section with prioritized channels, budget allocations, implementation plans, and expected ROI for each channel.`,

  actionPlan: (context) => `${GTM_SYSTEM_PROMPT}

Create a detailed 90-day action plan based on this data:

${JSON.stringify(context, null, 2)}

Generate ONLY the actionPlan section with 3 phases, weekly tactics, milestones ($1K→$3-5K→$10K), and risk mitigation strategies.`,

  budgetFramework: (context) => `${GTM_SYSTEM_PROMPT}

Create a comprehensive budget framework based on this data:

${JSON.stringify(context, null, 2)}

Generate ONLY the budgetFramework section with monthly budgets, ROI projections, scaling strategies, and cost optimization recommendations.`,

  successMetrics: (context) => `${GTM_SYSTEM_PROMPT}

Create a comprehensive success metrics framework based on this data:

${JSON.stringify(context, null, 2)}

Generate ONLY the successMetrics section with KPIs, tracking frameworks, milestones, and success/warning indicators.`
};

/**
 * Get confidence description for reporting
 * @param {number} score - Confidence score (0-100)
 * @returns {string} - Human-readable description
 */
function getConfidenceDescription(score) {
  if (score >= 90) return '(Excellent)';
  if (score >= 80) return '(Very Good)';
  if (score >= 70) return '(Good)';
  if (score >= 60) return '(Fair)';
  if (score >= 50) return '(Moderate)';
  return '(Limited)';
}

/**
 * Create validation prompt for generated report
 * @param {object} reportData - Generated report data
 * @param {object} context - Original synthesis context
 * @returns {string} - Report validation prompt
 */
function createValidationPrompt(reportData, context) {
  return `${GTM_SYSTEM_PROMPT}

Review this generated GTM strategy report for quality, completeness, and alignment with the source data.

**ORIGINAL DATA:**
${JSON.stringify(context, null, 2)}

**GENERATED REPORT:**
${JSON.stringify(reportData, null, 2)}

Validate the report and return a validation assessment in this JSON format:

{
  "isValid": true/false,
  "qualityScore": 1-100,
  "completeness": {
    "executiveSummary": "complete/partial/missing",
    "marketAnalysis": "complete/partial/missing",
    "targetAudience": "complete/partial/missing",
    "channelStrategy": "complete/partial/missing",
    "actionPlan": "complete/partial/missing",
    "budgetFramework": "complete/partial/missing",
    "successMetrics": "complete/partial/missing"
  },
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "issues": ["Issue 1", "Issue 2"],
  "recommendations": ["Improvement 1", "Improvement 2"],
  "dataAlignment": "How well the report aligns with source data (1-10)",
  "actionability": "How actionable the recommendations are (1-10)",
  "realism": "How realistic the $10K/90-day goal is (1-10)"
}`;
}

/**
 * Create report improvement prompt
 * @param {object} reportData - Report data to improve
 * @param {object} validationResult - Validation feedback
 * @param {object} context - Original context
 * @returns {string} - Improvement prompt
 */
function createImprovementPrompt(reportData, validationResult, context) {
  return `${GTM_SYSTEM_PROMPT}

Improve this GTM strategy report based on the validation feedback provided.

**ORIGINAL CONTEXT:**
${JSON.stringify(context, null, 2)}

**CURRENT REPORT:**
${JSON.stringify(reportData, null, 2)}

**VALIDATION FEEDBACK:**
${JSON.stringify(validationResult, null, 2)}

Generate an improved version of the complete report addressing the issues identified. Return the full improved report in JSON format with all 7 sections.

Focus on:
1. Addressing specific issues mentioned in validation
2. Improving actionability and realism
3. Better alignment with source data
4. More specific tactics and recommendations
5. Realistic budget and timeline projections

Return the complete improved JSON report:`;
}

module.exports = {
  GTM_SYSTEM_PROMPT,
  createFullReportPrompt,
  sectionPrompts,
  createValidationPrompt,
  createImprovementPrompt,
  getConfidenceDescription
};