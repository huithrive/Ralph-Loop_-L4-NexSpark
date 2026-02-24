/**
 * GTM Report generation prompt — shared by strategist module
 * Extracted from auxora-chat.js REPORT_PROMPT
 * 
 * Context provided includes:
 * - 6 interview fields: website, businessType, targetCustomers, currentRevenue, revenueGoal, marketingBudget
 * - Mock research data: competitors, market size, traffic data, SEO keywords
 */

module.exports = `Generate a comprehensive Go-to-Market Strategy Report as JSON matching this EXACT schema.
This is a professional consulting-grade report (McKinsey-style) with 9 detailed sections + executive summary.
Use the provided BUSINESS DATA and MARKET RESEARCH to generate realistic, specific recommendations.

{
  "companyName": "string",
  "reportTitle": "Go-to-Market Strategy Report",
  "preparedBy": "Auxora",
  "date": "string (e.g. February 2026)",
  "executiveSummary": {
    "whatItIs": "string",
    "marketGap": "string",
    "strategyPhases": [
      { "phase": "Discovery|Foundation|Scale", "timeline": "Months X-Y", "focus": "string", "investment": "$X,XXX/mo", "targetOutcome": "string" }
    ],
    "keySuccessFactors": ["string — 5 bullet points"]
  },
  "sections": [
    { "id": "growth-opportunity", "title": "Your Growth Opportunity", "sectionNumber": 1, "bigInsight": { "quote": "string", "analysis": "string", "bottomLine": "string" } },
    { "id": "market-landscape", "title": "Market Landscape", "sectionNumber": 2, "marketOverview": "string", "keyStrategicInsight": "string" },
    { "id": "competitor-deep-dive", "title": "Competitor Deep Dive", "sectionNumber": 3, "competitors": [{ "name": "string", "website": "string", "keyMetrics": {}, "trafficSources": [], "strengths": [], "weaknesses": [], "keyTakeaway": "string" }] },
    { "id": "ideal-customer-profile", "title": "Ideal Customer Profile", "sectionNumber": 4, "primaryPersona": { "name": "string", "demographics": [], "psychographics": [], "onlineBehavior": [], "triggerEvent": "string" }, "secondaryICPs": [], "validationPlan": [] },
    { "id": "geographic-opportunity", "title": "Geographic Opportunity", "sectionNumber": 5, "marketTiers": [], "costComparison": [], "launchStrategy": [] },
    { "id": "seo-keyword-opportunity", "title": "SEO & Keyword Opportunity", "sectionNumber": 6, "brandAnalysis": "string", "categoryKeywords": [], "contentGaps": [], "quickWins": [] },
    { "id": "growth-roadmap", "title": "Six-Month Growth Roadmap", "sectionNumber": 7, "phases": [] },
    { "id": "budget-metrics", "title": "Budget & Metrics Framework", "sectionNumber": 8, "monthlyAllocation": [], "scalingRules": {}, "kpiTargets": [] },
    { "id": "next-steps", "title": "Next Steps & Resources", "sectionNumber": 9, "immediateActions": [], "recommendedTools": [] }
  ]
}

RULES:
- Generate ALL 9 sections in order (sectionNumber 1-9)
- executiveSummary: 3 strategyPhases, 5 keySuccessFactors
- Section 3: 3 competitors, each with 3 strengths and 3 weaknesses
- Section 4: 1 primary persona, 3 secondary ICPs
- Section 5: 3 market tiers, 4 costComparison rows
- Section 6: 4 category keywords, 2 content gaps, 3 quick wins
- Section 7: 3 phases with 3 strategies and 3 metrics each
- Section 8: 4 channels, 4 KPI rows
- Section 9: 5 immediate actions, 4 recommended tools
- Keep text concise (1-2 sentences). Use realistic numbers.
- Respond ONLY with the JSON object. No markdown.`;
