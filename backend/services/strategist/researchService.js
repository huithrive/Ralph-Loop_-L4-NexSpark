/**
 * Research Service — Orchestrates business research
 * Uses SimilarWeb API for real competitor data
 */

const similarwebService = require('./similarwebService');
const axios = require('axios');

/**
 * Run complete business research
 * @param {object} collectedData - Interview answers
 * @returns {Promise<object>}
 */
async function runBusinessResearch(collectedData) {
  const { website, businessType, targetCustomers, currentRevenue, revenueGoal, marketingBudget } = collectedData;
  
  console.log('[researchService] Starting research for:', website);
  
  // 1. Identify competitor domains
  const competitorDomains = identifyCompetitors(website, businessType);
  
  // 2. Get real traffic data from SimilarWeb
  const competitors = await similarwebService.getCompetitorAnalysis(competitorDomains);
  
  // 3. Generate market insights
  const marketInsights = generateMarketInsights(businessType, targetCustomers, competitors);
  
  // 4. Generate keyword opportunities
  const keywordData = generateKeywordOpportunities(businessType, website);
  
  return {
    competitors,
    marketSize: marketInsights.marketSize,
    currentStage: inferCurrentStage(currentRevenue),
    growthPotential: marketInsights.growthPotential,
    trafficData: keywordData,
    researchedAt: new Date().toISOString()
  };
}

/**
 * Identify top 3 competitor domains based on business type
 * @param {string} website - User's website
 * @param {string} businessType
 * @returns {string[]}
 */
function identifyCompetitors(website, businessType) {
  // Competitor database by category
  const competitorMap = {
    'E-commerce / DTC Brand': ['warbyparker.com', 'allbirds.com', 'glossier.com'],
    'SaaS / Software': ['notion.so', 'airtable.com', 'linear.app'],
    'Local Service Business': ['thumbtack.com', 'yelp.com', 'nextdoor.com'],
    'Content / Media': ['substack.com', 'medium.com', 'ghost.org'],
    'B2B Services': ['hubspot.com', 'salesforce.com', 'mailchimp.com'],
    'Marketplace / Platform': ['etsy.com', 'shopify.com', 'faire.com']
  };
  
  const defaults = competitorMap[businessType] || ['example1.com', 'example2.com', 'example3.com'];
  
  // If user's website looks like it's in a specific niche, override
  const domain = website.replace(/^https?:\/\//, '').replace(/^www\./, '').toLowerCase();
  
  // Agriculture/farming detection
  if (domain.includes('farm') || domain.includes('agri') || domain.includes('harvest')) {
    return ['farmersonly.com', 'localfarmers.com', 'harvestbox.com'];
  }
  
  // Default to category competitors
  return defaults;
}

/**
 * Generate market insights
 * @param {string} businessType
 * @param {string} targetCustomers
 * @param {object[]} competitors
 * @returns {object}
 */
function generateMarketInsights(businessType, targetCustomers, competitors) {
  // Market size estimates by category
  const marketSizes = {
    'E-commerce / DTC Brand': '$1.2B TAM, growing 18% YoY',
    'SaaS / Software': '$850M TAM, growing 25% YoY',
    'Local Service Business': '$420M TAM, growing 12% YoY',
    'Content / Media': '$680M TAM, growing 22% YoY',
    'B2B Services': '$2.1B TAM, growing 15% YoY',
    'Marketplace / Platform': '$1.5B TAM, growing 20% YoY'
  };
  
  // Calculate aggregate competitor traffic
  const totalCompetitorTraffic = competitors.reduce((sum, comp) => {
    const traffic = comp.estimatedTraffic;
    const numMatch = traffic.match(/(\d+(\.\d+)?)[KM]/);
    if (numMatch) {
      const num = parseFloat(numMatch[1]);
      const multiplier = traffic.includes('M') ? 1000000 : 1000;
      return sum + (num * multiplier);
    }
    return sum;
  }, 0);
  
  const growthPotential = totalCompetitorTraffic > 1000000 
    ? 'High — proven market with significant traffic'
    : totalCompetitorTraffic > 100000
    ? 'Medium — growing market with competition'
    : 'Emerging — early mover advantage available';
  
  return {
    marketSize: marketSizes[businessType] || '$500M TAM, growing 15% YoY',
    growthPotential
  };
}

/**
 * Infer current business stage from revenue
 * @param {string} currentRevenue
 * @returns {string}
 */
function inferCurrentStage(currentRevenue) {
  if (!currentRevenue) return 'Pre-launch';
  
  const stages = {
    'Pre-revenue': 'Pre-launch — Building foundation',
    '$1K-$5K/mo': 'Early Stage — Finding product-market fit',
    '$5K-$20K/mo': 'Growth Stage — Scaling proven channels',
    '$20K-$50K/mo': 'Scale Stage — Optimizing unit economics',
    '$50K+/mo': 'Mature Stage — Expanding markets'
  };
  
  return stages[currentRevenue] || 'Early Stage';
}

/**
 * Generate keyword opportunities (mock for now, could integrate Ahrefs/SEMrush later)
 * @param {string} businessType
 * @param {string} website
 * @returns {object}
 */
function generateKeywordOpportunities(businessType, website) {
  return {
    organicSearchVolume: '45K monthly searches',
    topKeywords: [
      { keyword: `${businessType.toLowerCase()} for small business`, volume: '8.2K/mo', difficulty: 'Medium' },
      { keyword: `best ${businessType.toLowerCase()} 2026`, volume: '6.5K/mo', difficulty: 'High' },
      { keyword: `affordable ${businessType.toLowerCase()}`, volume: '4.1K/mo', difficulty: 'Low' }
    ]
  };
}

module.exports = {
  runBusinessResearch,
  identifyCompetitors
};
