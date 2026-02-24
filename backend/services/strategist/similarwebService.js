/**
 * SimilarWeb API Service
 * Real competitor research data via RapidAPI
 */

const axios = require('axios');

const RAPIDAPI_KEY = '7e33689537mshbdba25e19a60d5ap1d4b02jsn6908c79e01ac';
const RAPIDAPI_HOST = 'similarweb-traffic-api-for-bulk.p.rapidapi.com';

/**
 * Get traffic data for a domain
 * @param {string} domain - Domain without protocol (e.g., "google.com")
 * @returns {Promise<object>}
 */
async function getTrafficData(domain) {
  try {
    // Clean domain
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    
    const response = await axios.get(`https://${RAPIDAPI_HOST}/rapidapi.php`, {
      params: { domain: cleanDomain },
      headers: {
        'x-rapidapi-host': RAPIDAPI_HOST,
        'x-rapidapi-key': RAPIDAPI_KEY
      },
      timeout: 15000
    });
    
    return {
      success: true,
      domain: cleanDomain,
      data: response.data
    };
  } catch (error) {
    console.error('SimilarWeb API error:', error.message);
    return {
      success: false,
      domain,
      error: error.message,
      fallback: generateFallbackData(domain)
    };
  }
}

/**
 * Get competitor analysis for multiple domains
 * @param {string[]} domains - Array of competitor domains
 * @returns {Promise<object[]>}
 */
async function getCompetitorAnalysis(domains) {
  const results = await Promise.all(
    domains.map(domain => getTrafficData(domain))
  );
  
  return results.map((result, i) => {
    if (result.success) {
      return formatCompetitorData(result.domain, result.data);
    } else {
      return result.fallback;
    }
  });
}

/**
 * Format SimilarWeb API response into competitor data
 * @param {string} domain
 * @param {object} apiData
 * @returns {object}
 */
function formatCompetitorData(domain, apiData) {
  // Parse SimilarWeb response structure
  // Adapt this based on actual API response format
  const traffic = apiData.monthlyVisits || apiData.visits || 0;
  const topCountries = apiData.topCountries || [];
  const trafficSources = apiData.trafficSources || {};
  
  return {
    name: domain,
    website: `https://${domain}`,
    estimatedTraffic: formatTraffic(traffic),
    topCountries: topCountries.slice(0, 3).map(c => c.country || c.name),
    trafficSources: formatTrafficSources(trafficSources),
    estimatedAdSpend: estimateAdSpend(traffic, trafficSources.paid || 0),
    dataSource: 'SimilarWeb (Real)'
  };
}

function formatTraffic(visits) {
  if (visits >= 1000000) {
    return `${(visits / 1000000).toFixed(1)}M monthly visits`;
  } else if (visits >= 1000) {
    return `${(visits / 1000).toFixed(0)}K monthly visits`;
  } else {
    return `${visits} monthly visits`;
  }
}

function formatTrafficSources(sources) {
  const channels = [];
  if (sources.organic) channels.push(`Organic Search (${Math.round(sources.organic)}%)`);
  if (sources.paid) channels.push(`Paid Ads (${Math.round(sources.paid)}%)`);
  if (sources.social) channels.push(`Social Media (${Math.round(sources.social)}%)`);
  if (sources.direct) channels.push(`Direct (${Math.round(sources.direct)}%)`);
  if (sources.referral) channels.push(`Referral (${Math.round(sources.referral)}%)`);
  
  return channels.length > 0 ? channels : ['Data not available'];
}

function estimateAdSpend(traffic, paidPercent) {
  // Rough estimation: assume $1-3 CPM for display, $5-15 for search
  // If 20% of traffic is paid, and traffic is 500K/mo -> 100K paid visits
  // At $2 CPM average = $200/mo
  const paidVisits = (traffic * (paidPercent / 100));
  const estimatedSpend = paidVisits * 0.002; // $2 CPM average
  
  if (estimatedSpend >= 10000) {
    return `$${(estimatedSpend / 1000).toFixed(0)}K/mo`;
  } else if (estimatedSpend >= 1000) {
    return `$${(estimatedSpend / 1000).toFixed(1)}K/mo`;
  } else {
    return `$${Math.round(estimatedSpend)}/mo`;
  }
}

/**
 * Generate fallback mock data if API fails
 * @param {string} domain
 * @returns {object}
 */
function generateFallbackData(domain) {
  return {
    name: domain,
    website: `https://${domain}`,
    estimatedTraffic: '150K monthly visits (estimated)',
    topCountries: ['United States', 'United Kingdom', 'Canada'],
    trafficSources: [
      'Organic Search (40%)',
      'Paid Ads (25%)',
      'Social Media (20%)',
      'Direct (15%)'
    ],
    estimatedAdSpend: '$5K/mo (estimated)',
    dataSource: 'Mock Data (API unavailable)'
  };
}

module.exports = {
  getTrafficData,
  getCompetitorAnalysis,
  formatCompetitorData
};
