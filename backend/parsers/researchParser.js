/**
 * Parser for Claude AI research responses
 */

const logger = require('../utils/logger');

/**
 * Parse Claude's research response into structured data
 * @param {string} responseText - Raw text response from Claude
 * @returns {object} - Parsed research data
 */
function parseResearchResponse(responseText) {
  try {
    if (!responseText || typeof responseText !== 'string') {
      throw new Error('Invalid response text provided');
    }

    // Clean the response text
    let cleanResponse = responseText.trim();

    // Remove markdown code blocks if present
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    // Remove any leading/trailing non-JSON text
    const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanResponse = jsonMatch[0];
    }

    // Parse JSON
    const parsedData = JSON.parse(cleanResponse);

    // Validate and structure the data
    const researchData = validateAndStructureResearchData(parsedData);

    logger.info('Research response parsed successfully', {
      hasMarketSize: !!researchData.marketSize,
      competitorsCount: researchData.competitors?.length || 0,
      channelsCount: researchData.channels?.length || 0,
      painPointsCount: researchData.painPoints?.length || 0
    });

    return researchData;

  } catch (error) {
    logger.error('Failed to parse research response', error, {
      responseLength: responseText?.length || 0,
      responsePreview: responseText?.substring(0, 200) || 'N/A'
    });

    // Return a fallback structure
    return createFallbackResearchData(error.message);
  }
}

/**
 * Validate and structure research data to ensure all required fields are present
 * @param {object} rawData - Raw parsed data from Claude
 * @returns {object} - Validated and structured research data
 */
function validateAndStructureResearchData(rawData) {
  const structured = {
    marketSize: validateMarketSize(rawData.marketSize),
    targetAudience: validateTargetAudience(rawData.targetAudience),
    competitors: validateCompetitors(rawData.competitors),
    channels: validateChannels(rawData.channels),
    painPoints: validatePainPoints(rawData.painPoints),
    opportunities: validateOpportunities(rawData.opportunities),
    threats: validateThreats(rawData.threats),
    recommendations: validateRecommendations(rawData.recommendations)
  };

  return structured;
}

/**
 * Validate market size data
 * @param {object} marketSize - Market size data
 * @returns {object} - Validated market size
 */
function validateMarketSize(marketSize) {
  if (!marketSize || typeof marketSize !== 'object') {
    return {
      tam: 'Not determined',
      sam: 'Not determined',
      growthRate: 'Not determined',
      trends: []
    };
  }

  return {
    tam: marketSize.tam || 'Not determined',
    sam: marketSize.sam || 'Not determined',
    growthRate: marketSize.growthRate || 'Not determined',
    trends: Array.isArray(marketSize.trends) ? marketSize.trends : []
  };
}

/**
 * Validate target audience data
 * @param {object} targetAudience - Target audience data
 * @returns {object} - Validated target audience
 */
function validateTargetAudience(targetAudience) {
  if (!targetAudience || typeof targetAudience !== 'object') {
    return {
      primary: {
        demographics: {},
        psychographics: {}
      },
      secondary: {
        description: 'Not determined',
        size: 'Not determined'
      }
    };
  }

  const primary = targetAudience.primary || {};
  const demographics = primary.demographics || {};
  const psychographics = primary.psychographics || {};

  return {
    primary: {
      demographics: {
        age: demographics.age || 'Not determined',
        gender: demographics.gender || 'Not determined',
        income: demographics.income || 'Not determined',
        education: demographics.education || 'Not determined',
        location: demographics.location || 'Not determined'
      },
      psychographics: {
        interests: Array.isArray(psychographics.interests) ? psychographics.interests : [],
        values: Array.isArray(psychographics.values) ? psychographics.values : [],
        behaviors: Array.isArray(psychographics.behaviors) ? psychographics.behaviors : [],
        painPoints: Array.isArray(psychographics.painPoints) ? psychographics.painPoints : []
      }
    },
    secondary: {
      description: targetAudience.secondary?.description || 'Not determined',
      size: targetAudience.secondary?.size || 'Not determined'
    }
  };
}

/**
 * Validate competitors data
 * @param {array} competitors - Competitors array
 * @returns {array} - Validated competitors
 */
function validateCompetitors(competitors) {
  if (!Array.isArray(competitors)) {
    return [];
  }

  return competitors.map(competitor => ({
    name: competitor.name || 'Unknown',
    website: competitor.website || 'Not provided',
    positioning: competitor.positioning || 'Not analyzed',
    strengths: Array.isArray(competitor.strengths) ? competitor.strengths : [],
    weaknesses: Array.isArray(competitor.weaknesses) ? competitor.weaknesses : [],
    marketShare: competitor.marketShare || 'Not determined',
    pricing: competitor.pricing || 'Not determined'
  }));
}

/**
 * Validate marketing channels data
 * @param {array} channels - Channels array
 * @returns {array} - Validated channels
 */
function validateChannels(channels) {
  if (!Array.isArray(channels)) {
    return [];
  }

  return channels.map(channel => ({
    channel: channel.channel || 'Unknown',
    priority: ['high', 'medium', 'low'].includes(channel.priority) ? channel.priority : 'medium',
    rationale: channel.rationale || 'Not provided',
    estimatedCPA: channel.estimatedCPA || 'Not estimated',
    expectedROAS: channel.expectedROAS || 'Not estimated'
  }));
}

/**
 * Validate pain points data
 * @param {array} painPoints - Pain points array
 * @returns {array} - Validated pain points
 */
function validatePainPoints(painPoints) {
  if (!Array.isArray(painPoints)) {
    return [];
  }

  return painPoints.map(painPoint => ({
    problem: painPoint.problem || 'Not specified',
    severity: ['high', 'medium', 'low'].includes(painPoint.severity) ? painPoint.severity : 'medium',
    frequency: painPoint.frequency || 'Not determined',
    currentSolutions: Array.isArray(painPoint.currentSolutions) ? painPoint.currentSolutions : [],
    opportunity: painPoint.opportunity || 'Not identified'
  }));
}

/**
 * Validate opportunities data
 * @param {array} opportunities - Opportunities array
 * @returns {array} - Validated opportunities
 */
function validateOpportunities(opportunities) {
  if (!Array.isArray(opportunities)) {
    return [];
  }

  return opportunities.map(opportunity => ({
    title: opportunity.title || 'Untitled opportunity',
    description: opportunity.description || 'No description provided',
    impact: ['high', 'medium', 'low'].includes(opportunity.impact) ? opportunity.impact : 'medium',
    effort: ['high', 'medium', 'low'].includes(opportunity.effort) ? opportunity.effort : 'medium',
    timeframe: opportunity.timeframe || 'Not specified'
  }));
}

/**
 * Validate threats data
 * @param {array} threats - Threats array
 * @returns {array} - Validated threats
 */
function validateThreats(threats) {
  if (!Array.isArray(threats)) {
    return [];
  }

  return threats.map(threat => ({
    threat: threat.threat || 'Not specified',
    severity: ['high', 'medium', 'low'].includes(threat.severity) ? threat.severity : 'medium',
    probability: ['high', 'medium', 'low'].includes(threat.probability) ? threat.probability : 'medium',
    mitigation: threat.mitigation || 'No mitigation strategy provided'
  }));
}

/**
 * Validate recommendations data
 * @param {object} recommendations - Recommendations object
 * @returns {object} - Validated recommendations
 */
function validateRecommendations(recommendations) {
  if (!recommendations || typeof recommendations !== 'object') {
    return {
      immediate: [],
      shortTerm: [],
      longTerm: []
    };
  }

  return {
    immediate: Array.isArray(recommendations.immediate) ? recommendations.immediate : [],
    shortTerm: Array.isArray(recommendations.shortTerm) ? recommendations.shortTerm : [],
    longTerm: Array.isArray(recommendations.longTerm) ? recommendations.longTerm : []
  };
}

/**
 * Create fallback research data when parsing fails
 * @param {string} errorMessage - Error message
 * @returns {object} - Fallback research data
 */
function createFallbackResearchData(errorMessage) {
  logger.warn('Creating fallback research data due to parsing error', { error: errorMessage });

  return {
    marketSize: {
      tam: 'Analysis failed',
      sam: 'Analysis failed',
      growthRate: 'Analysis failed',
      trends: []
    },
    targetAudience: {
      primary: {
        demographics: {
          age: 'Analysis failed',
          gender: 'Analysis failed',
          income: 'Analysis failed',
          education: 'Analysis failed',
          location: 'Analysis failed'
        },
        psychographics: {
          interests: [],
          values: [],
          behaviors: [],
          painPoints: []
        }
      },
      secondary: {
        description: 'Analysis failed',
        size: 'Analysis failed'
      }
    },
    competitors: [],
    channels: [],
    painPoints: [],
    opportunities: [],
    threats: [],
    recommendations: {
      immediate: ['Retry market research analysis'],
      shortTerm: ['Conduct manual market research'],
      longTerm: ['Develop comprehensive market strategy']
    },
    parseError: {
      message: errorMessage,
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Extract key metrics from research data for quick overview
 * @param {object} researchData - Parsed research data
 * @returns {object} - Key metrics summary
 */
function extractKeyMetrics(researchData) {
  return {
    competitorsCount: researchData.competitors?.length || 0,
    channelsCount: researchData.channels?.length || 0,
    painPointsCount: researchData.painPoints?.length || 0,
    opportunitiesCount: researchData.opportunities?.length || 0,
    threatsCount: researchData.threats?.length || 0,
    hasMarketSize: !!(researchData.marketSize?.tam && researchData.marketSize.tam !== 'Not determined'),
    hasTargetAudience: !!(researchData.targetAudience?.primary?.demographics?.age &&
                          researchData.targetAudience.primary.demographics.age !== 'Not determined'),
    parseError: !!researchData.parseError
  };
}

module.exports = {
  parseResearchResponse,
  validateAndStructureResearchData,
  extractKeyMetrics,
  createFallbackResearchData
};