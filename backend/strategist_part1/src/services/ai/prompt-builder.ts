/**
 * Prompt Builder
 * Constructs prompts for Euopho GTM strategy generation
 */

import type { BusinessProfile, CompetitorInsight } from '../../types/report-formats';

/**
 * Build comprehensive GTM strategy generation prompt for Euopho format
 */
export function buildStrategyPrompt(
  businessProfile: BusinessProfile,
  normalizedCompetitors: CompetitorInsight[],
  websiteContent: string,
  additionalContext: string
): string {
  const isProductBusiness = businessProfile.industry?.toLowerCase().includes('product') ||
                           businessProfile.industry?.toLowerCase().includes('e-commerce') ||
                           businessProfile.industry?.toLowerCase().includes('retail') ||
                           businessProfile.targetMarket?.toLowerCase().includes('product');

  return `You are a performance marketing strategist specializing in Meta and TikTok Ads for D2C brands.

BUSINESS PROFILE:
${JSON.stringify(businessProfile, null, 2)}

COMPETITOR RESEARCH:
${JSON.stringify(normalizedCompetitors, null, 2)}

${websiteContent ? `WEBSITE CONTENT:\n${websiteContent.substring(0, 2000)}\n\n` : ''}
${additionalContext}

BUDGET CONTEXT:
- Weekly budget: ${businessProfile.budget}
- Focus: Meta-first strategy with data-driven testing
- Timeline: 90-day roadmap with 3 scaling phases

EMOJI USAGE - SELECTIVE USAGE:
Use emojis selectively where they add visual value, not as decoration. Use emojis ONLY for:
- Product emojis (🌿, 🌹, 💐, etc. - choose relevant emojis for each product)
- ICP avatar emojis (🧘‍♀️, ✨, 🚗, etc.)
- Platform emojis (📸 for Meta, 🎵 for TikTok, 🔍 for Google)
Keep the report professional - avoid excessive emoji usage in USPs, campaigns, risks, or section headers.

CREATE A COMPREHENSIVE GTM STRATEGY REPORT WITH THE FOLLOWING SECTIONS:

1. EXECUTIVE SUMMARY
   - Write 2-3 compelling paragraphs summarizing the opportunity
   - Include market positioning, target audience, and Meta-first recommendation
   - Executive stats with 4 key metrics:
     * Market Size (e.g., "$26B")
     * Growth Rate (e.g., "6.6%")
     * Starting Budget (from profile)
     * Recommended Platform ("Meta" or "TikTok")

2. BUSINESS PROFILE
   - Brand name, website, industry, target market, business stage, budget
   - Main challenges (array)
   - Business goals (array)
   ${isProductBusiness ? `- Product Line (3-6 products):
     * Product emoji (🌿, 🌹, etc. - choose relevant emojis)
     * Product name
     * Price (e.g., "$8.00")` : ''}
   - USPs (3-4 boxes):
     * Emoji icon (🧪, 🌍, etc.)
     * Title
     * Description

3. MARKET OPPORTUNITY
   - Market stats (3-4 stat cards):
     * Value (e.g., "$26B")
     * Label (e.g., "Global Market Size 2025")
     * Growth (e.g., "↑ 6.6% CAGR to $40.5B by 2032")
   - Market analysis:
     * Market size
     * Growth rate
     * Key trends (5-6 points)
     * Key drivers (4 drivers with title and description)
   - Chart data for market growth:
     * Generate realistic 9-year projection based on market size and CAGR
     * Use year labels (e.g., 2024-2032)
     * Single dataset showing market growth in billions

4. COMPETITIVE LANDSCAPE
   - Use all 5+ competitors provided
   - For each competitor, ensure ALL fields are present:
     * name, website
     * competitorType: "Premium", "Mass", "Niche", or "Retail"
     * priceRange (e.g., "$14-20/sachet")
     * strengths: Brief summary for table column
     * threatLevel: "High", "Medium", or "Low"
     * estimatedTraffic, primaryChannels (array), pricePoint
     * strengthsList (array of 4-5 detailed strengths)
     * weaknessesList (array of 3-4 weaknesses)
     * layoutAnalysis (array of 4-5 website observations)
   - Competitive advantages (6 points highlighting unique positioning)
   - Key insights (4-5 strategic takeaways)

5. IDEAL CUSTOMER PROFILES
   - Create EXACTLY 3 personas with:
     * Emoji avatar (🧘‍♀️, ✨, 🚗, etc.)
     * Name (e.g., "The Wellness Seeker" - be creative)
     * Subtitle (e.g., "Primary Target (50% of revenue)")
     * isPrimary: true for first persona, false for others
     * Stats object:
       - ageRange (e.g., "22-35")
       - avgOrderValue (e.g., "$24-40")
       - purchaseFrequency (e.g., "4-6x/yr")
       - gender (e.g., "Female", "Both", "Male")
     * Traits (5 behavioral/psychographic points)
     * Financial metrics:
       - aovPotential (e.g., "$80-200" - estimated AOV range for this segment)
       - cacEstimate (e.g., "$15-25" - estimated CAC for this segment)
   - Geographic focus:
     * Primary markets (states)
     * Key cities
     * Income level (household income range)
     * Interests (comma-separated)

6. BUDGET STRATEGY
   - Weekly, monthly, yearly budget calculations
   - Breakdown with 3 categories:
     * metaAds: {amount, percent} - typically 70%
     * creative: {amount, percent} - typically 20%
     * testing: {amount, percent} - typically 10%
   - Phases (EXACTLY 3 fixed phases):
     * Phase 1: Discovery Phase
       - phaseNumber: 1
       - title: "Discovery Phase"
       - duration: "Week 1-3 | Goal: Find Winning Audiences"
       - activities: 5-6 activities for testing and learning
     * Phase 2: Optimization Phase
       - phaseNumber: 2
       - title: "Optimization Phase"
       - duration: "Week 4-6 | Goal: Improve ROAS"
       - activities: 5-6 activities for optimization
     * Phase 3: Scale Phase
       - phaseNumber: 3
       - title: "Scale Phase"
       - duration: "Week 7+ | Goal: Profitable Growth"
       - activities: 5-6 activities for scaling

7. PLATFORM STRATEGY
   - Platforms array (EXACTLY 2 platforms - choose the 2 BEST FIT from Meta, Google, and TikTok):
     * Evaluate all 3 platforms based on business type:
       - Meta: Best for D2C, visual products, broad audiences, retargeting
       - Google: Best for B2B, high-intent search, local services, search-based businesses
       - TikTok: Best for Gen Z/Millennial, viral content, entertainment products
     * Select the TOP 2 platforms and rank them:
     * Platform 1 (Recommended):
       - platform: "Meta" or "Google" or "TikTok"
       - emoji: "📸" (Meta), "🔍" (Google), or "🎵" (TikTok)
       - isRecommended: true
       - fitScore: 85-95 (0-100 scale)
       - scoreLevel: "high"
       - pros: 7-8 reasons why this platform fits
     * Platform 2 (Secondary):
       - platform: Different from Platform 1
       - emoji: Corresponding platform emoji
       - isRecommended: false
       - fitScore: 65-75
       - scoreLevel: "medium"
       - pros: 7-8 points (include some "BUT:" caveats)
   - Recommended platform: "Meta", "Google", or "TikTok" (choose based on business fit)
   - Reasoning (2-3 sentences explaining the choice)
   - Campaign structure (3 detailed campaigns):
     * Campaign 1: Primary Campaign
       - title, objective, budgetPercentage (e.g., 50%)
       - adSets (2-3 ad sets):
         * name (e.g., "Core Audience 25-45")
         * budget (e.g., "$70/week")
         * targeting (detailed targeting info)
         * creatives (which creative types from recommendations)
     * Campaign 2: Secondary Campaign
       - Same structure as Campaign 1
     * Campaign 3: Retargeting Campaign
       - Same structure as Campaign 1
   - Creative recommendations (4 creative types):
     * Type 1 (HIGH priority):
       - type (e.g., "Lifestyle Product Shots")
       - priority: "HIGH"
       - format (e.g., "Static Image / Carousel")
       - purpose (e.g., "Show product in real-world use")
       - examples: [3-4 specific creative examples]
     * Type 2 (HIGH priority):
       - Same structure as Type 1
     * Type 3 (MEDIUM priority):
       - Same structure as Type 1
     * Type 4 (TEST priority):
       - Same structure as Type 1

8. SUCCESS METRICS
   - KPIs (6 metrics with weekly progression):
     * metric name (e.g., "Click-Through Rate (CTR)")
     * target (e.g., "≥ 2.0%")
     * benchmark (e.g., "Industry: 1.2% | Wellness: 2.5%+")
     * week1Target (e.g., "1.5%")
     * week4Target (e.g., "1.8%")
     * week8Target (e.g., "2.0%")
     * week12Target (e.g., "2.2%+")
   - AOV optimization (4 strategies with strategy name and description)
   - Chart data for ROAS projection:
     * Generate realistic 12-week ROAS progression
     * Labels: ["Week 1", "Week 2", ..., "Week 12"]
     * Dataset 1: Projected ROAS (start low ~0.5, ramp to 3.5-3.7)
     * Dataset 2: Break-even line at 1.5x (flat line)
     * Dataset 3: Target ROAS at 3x (flat line)

9. RISKS & MITIGATIONS
   - Create 4 risk items:
     * emoji (💵, 🏪, 👃, 📦, etc.)
     * title (short risk name)
     * risk (what the risk is)
     * mitigation (how to address it)
     * severity: "high", "medium", or "low"

10. 90-DAY ROADMAP
    - Create 6 roadmap entries covering all 12 weeks:
      * Week 1: Setup & Foundation (6-8 detailed actions - CRITICAL foundation week)
      * Week 2-3: Launch & Test (6-8 detailed actions - testing phase)
      * Week 4: First Optimization (6-8 detailed actions - early optimization)
      * Week 5-6: Scale Winners (5-6 actions - scaling phase)
      * Week 7-8: Expand & Diversify (4-5 actions - expansion)
      * Week 9-12: Optimize & Sustain (4-5 actions - sustain)
    - For each entry:
      * week (e.g., "Week 1", "Week 2-3")
      * focusArea (e.g., "Setup & Foundation")
      * keyActions (array - MORE DETAIL in early weeks, 6-8 actions for Week 1-4, use • prefix)
      * successCriteria (e.g., "Pixel firing, Catalog synced")

11. A/B TESTING FRAMEWORK
    - Create 6 specific A/B tests:
      * testCategory (e.g., "Creative Format", "Audience", "Copy", "Offer", "Landing Page", "Placement")
      * variableA (what to test as variant A)
      * variableB (what to test as variant B)
      * successMetric (how to measure success - CTR, CPA, ROAS, etc.)
      * timeline (when to run test - "Week 1", "Week 2-3", etc.)
    - Key hypotheses (5 hypotheses to validate through testing)

12. STRATEGIC INSIGHTS
    - Create 4-5 business-specific strategic insights
    - NOT generic advice - tailor to the specific brand, industry, and market
    - Focus on GTM-specific recommendations based on business context
    - Examples: "Your organic ingredient story positions you against mass-market competitors", "High AOV ($50+) makes lookalike audiences more profitable than broad targeting"

13. SUMMARY & NEXT STEPS
    - Key takeaways (6 points summarizing the strategy)
    - Immediate actions (6 action items for this week)
    - Pre-launch checklist (6 technical setup items):
      * Shopify/website setup items
      * Pixel installation and verification
      * Catalog sync (if product business)
      * Business Manager setup
      * Landing page optimization
      * Analytics and tracking setup
    - Call to action (1-2 sentences offering next step support)

CRITICAL JSON REQUIREMENTS:
- ALL fields shown in the structure below are REQUIRED
- EMOJIS should be used SELECTIVELY (product emojis, ICP avatars, platform emojis only - keep it professional)
- Arrays MUST have the specified number of elements
- Chart data must have realistic projections based on industry benchmarks
- For competitors: Ensure ALL fields match the new CompetitorInsight interface
- Platform choices: Choose 2 best platforms from "Meta", "Google", or "TikTok" based on business fit
- Respond ONLY with valid JSON - no markdown, no explanations
- Use realistic, data-driven numbers for chart projections
- Think like a professional GTM Manager: actionable, data-driven, concise

Generate specific, actionable, industry-appropriate content for this business.

${isProductBusiness ? 'This is a PRODUCT business - include the productLine array with 3-6 products.' : 'This is a SERVICE business - OMIT the productLine field entirely.'}

Respond in valid JSON format matching this exact structure:

{
  "executiveSummary": "2-3 paragraphs...",
  "executiveStats": {
    "marketSize": "$26B",
    "growthRate": "6.6%",
    "startingBudget": "${businessProfile.budget}",
    "recommendedPlatform": "Meta"
  },
  "businessProfile": {
    "brandName": "${businessProfile.brandName}",
    "website": "${businessProfile.website || 'Not provided'}",
    "industry": "${businessProfile.industry}",
    "targetMarket": "${businessProfile.targetMarket}",
    "businessStage": "${businessProfile.businessStage}",
    "budget": "${businessProfile.budget}",
    "mainChallenges": ${JSON.stringify(businessProfile.mainChallenges)},
    "businessGoals": ${JSON.stringify(businessProfile.businessGoals)}
  },
  ${isProductBusiness ? `"productLine": [
    {
      "emoji": "🌿",
      "name": "Product Name",
      "price": "$8.00"
    }
  ],` : ''}
  "usps": [
    {
      "emoji": "",
      "title": "USP Title",
      "description": "Brief description"
    }
  ],
  "marketStats": [
    {
      "value": "$26B",
      "label": "Global Market (2025)",
      "growth": "↑ 6.6% CAGR to $40.5B by 2032"
    }
  ],
  "marketAnalysis": {
    "marketSize": "$26B+",
    "growthRate": "6.6% CAGR",
    "keyTrends": ["...", "...", "...", "...", "..."],
    "keyDrivers": [
      {
        "title": "Driver Title",
        "description": "Driver description"
      }
    ]
  },
  "competitiveAnalysis": {
    "topCompetitors": ${JSON.stringify(normalizedCompetitors)},
    "competitiveAdvantages": ["...", "...", "...", "...", "...", "..."],
    "keyInsights": ["...", "...", "...", "..."]
  },
  "idealCustomerProfiles": [
    {
      "emoji": "🧘‍♀️",
      "name": "The Wellness Seeker",
      "subtitle": "Primary Target (50% of revenue)",
      "isPrimary": true,
      "stats": {
        "ageRange": "22-35",
        "avgOrderValue": "$24-40",
        "purchaseFrequency": "4-6x/yr",
        "gender": "Female"
      },
      "traits": ["...", "...", "...", "...", "..."],
      "aovPotential": "$80-200",
      "cacEstimate": "$15-25"
    }
  ],
  "geographicFocus": {
    "primaryMarkets": "California, New York, Texas, Florida",
    "keyCities": "LA, NYC, SF, Austin",
    "incomeLevel": "$60K-$150K household income",
    "interests": "Wellness, Design, Sustainability"
  },
  "budgetStrategy": {
    "weeklyBudget": "${businessProfile.budget}",
    "monthlyBudget": "Calculate from weekly",
    "yearlyBudget": "Calculate from weekly * 52",
    "breakdown": {
      "metaAds": { "amount": "$140", "percent": 70 },
      "creative": { "amount": "$40", "percent": 20 },
      "testing": { "amount": "$20", "percent": 10 }
    },
    "phases": [
      {
        "phaseNumber": 1,
        "title": "Discovery Phase",
        "duration": "Week 1-3 | Goal: Find Winning Audiences",
        "activities": ["...", "...", "...", "...", "..."]
      },
      {
        "phaseNumber": 2,
        "title": "Optimization Phase",
        "duration": "Week 4-6 | Goal: Improve ROAS",
        "activities": ["...", "...", "...", "...", "..."]
      },
      {
        "phaseNumber": 3,
        "title": "Scale Phase",
        "duration": "Week 7+ | Goal: Profitable Growth",
        "activities": ["...", "...", "...", "...", "..."]
      }
    ]
  },
  "platformStrategy": {
    "platforms": [
      {
        "platform": "Meta",
        "emoji": "📸",
        "isRecommended": true,
        "fitScore": 95,
        "scoreLevel": "high",
        "pros": ["...", "...", "...", "...", "...", "...", "..."]
      },
      {
        "platform": "Google",
        "emoji": "🔍",
        "isRecommended": false,
        "fitScore": 70,
        "scoreLevel": "medium",
        "pros": ["...", "...", "...", "...", "...", "...", "..."]
      }
    ],
    "recommendedPlatform": "Meta",
    "reasoning": "2-3 sentences explaining choice",
    "creativeRecommendations": [
      {
        "type": "Lifestyle Product Shots",
        "priority": "HIGH",
        "format": "Static Image / Carousel",
        "purpose": "Show product in real-world use",
        "examples": ["Example 1", "Example 2", "Example 3"]
      }
    ],
    "campaignStructure": [
      {
        "title": "Primary Campaign",
        "objective": "Sales (Purchase conversions)",
        "budgetPercentage": 50,
        "adSets": [
          {
            "name": "Core Audience 25-45",
            "budget": "$70/week",
            "targeting": "Detailed targeting info",
            "creatives": "Lifestyle Product Shots + UGC Videos"
          }
        ]
      }
    ]
  },
  "kpis": [
    {
      "metric": "Click-Through Rate (CTR)",
      "target": "≥ 2.0%",
      "benchmark": "Industry: 1.2% | Wellness: 2.5%+",
      "week1Target": "1.5%",
      "week4Target": "1.8%",
      "week8Target": "2.0%",
      "week12Target": "2.2%+"
    }
  ],
  "aovOptimization": [
    {
      "strategy": "Bundle Offers",
      "description": "Description of strategy"
    }
  ],
  "risks": [
    {
      "emoji": "",
      "title": "Risk Title",
      "risk": "Description of risk",
      "mitigation": "How to mitigate",
      "severity": "high"
    }
  ],
  "abTestingFramework": {
    "tests": [
      {
        "testCategory": "Creative Format",
        "variableA": "Static Image",
        "variableB": "Video",
        "successMetric": "CTR",
        "timeline": "Week 2-3"
      }
    ],
    "keyHypotheses": ["Hypothesis 1", "Hypothesis 2", "Hypothesis 3", "Hypothesis 4", "Hypothesis 5"]
  },
  "strategicInsights": [
    "Business-specific insight 1",
    "Business-specific insight 2",
    "Business-specific insight 3",
    "Business-specific insight 4"
  ],
  "roadmap90Day": [
    {
      "week": "Week 1",
      "focusArea": "Setup & Foundation",
      "keyActions": ["• Action 1", "• Action 2", "• Action 3"],
      "successCriteria": "Pixel firing, Catalog synced"
    }
  ],
  "charts": {
    "marketGrowth": {
      "labels": ["2024", "2025", "2026", "2027", "2028", "2029", "2030", "2031", "2032"],
      "datasets": [{
        "label": "Global Market ($B)",
        "data": [24.89, 26.00, 27.71, 29.52, 31.46, 33.52, 35.72, 38.06, 40.55],
        "backgroundColor": "rgba(139, 92, 246, 0.7)",
        "borderColor": "rgba(139, 92, 246, 1)",
        "borderWidth": 2,
        "borderRadius": 8
      }]
    },
    "roasProjection": {
      "labels": ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7", "Week 8", "Week 9", "Week 10", "Week 11", "Week 12"],
      "datasets": [
        {
          "label": "Projected ROAS",
          "data": [0.5, 1.2, 1.8, 2.2, 2.5, 2.8, 3.0, 3.2, 3.4, 3.5, 3.6, 3.7],
          "borderColor": "rgba(139, 92, 246, 1)",
          "backgroundColor": "rgba(139, 92, 246, 0.1)",
          "fill": true,
          "tension": 0.4,
          "borderWidth": 3,
          "pointRadius": 5,
          "pointBackgroundColor": "rgba(139, 92, 246, 1)"
        },
        {
          "label": "Break-even Line (1.5x)",
          "data": [1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5],
          "borderColor": "rgba(239, 68, 68, 0.7)",
          "borderDash": [5, 5],
          "borderWidth": 2,
          "pointRadius": 0,
          "fill": false
        },
        {
          "label": "Target ROAS (3x)",
          "data": [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
          "borderColor": "rgba(16, 185, 129, 0.7)",
          "borderDash": [5, 5],
          "borderWidth": 2,
          "pointRadius": 0,
          "fill": false
        }
      ]
    }
  },
  "summaryNextSteps": {
    "keyTakeaways": ["...", "...", "...", "...", "...", "..."],
    "immediateActions": ["...", "...", "...", "...", "...", "..."],
    "preLaunchChecklist": [
      "Set up Meta Business Manager and Ad Account",
      "Install Meta Pixel and verify events firing",
      "Sync product catalog (if e-commerce)",
      "Create landing pages with conversion tracking",
      "Set up Google Analytics 4 and conversion goals",
      "Test checkout flow and payment processing"
    ],
    "callToAction": "Ready to launch? We can help..."
  }
}`;
}
