/**
 * Data Synthesis Service for NexSpark GTM Report Generation
 *
 * Combines research and interview data into unified context for Claude analysis
 */

const ResearchResult = require('../models/ResearchResult');
const InterviewSession = require('../models/InterviewSession');
const InterviewResponse = require('../models/InterviewResponse');
const logger = require('../utils/logger');

/**
 * Synthesize research and interview data into unified context for report generation
 * @param {string} researchId - Research result ID
 * @param {string} interviewSessionId - Interview session ID (optional)
 * @returns {Promise<object>} - Synthesized context object for Claude
 */
async function combineInputs(researchId, interviewSessionId = null) {
  try {
    const startTime = Date.now();

    logger.info('Starting data synthesis', {
      researchId,
      interviewSessionId: interviewSessionId || 'none'
    });

    // Fetch research data (required)
    const researchData = await fetchResearchData(researchId);

    // Fetch interview data (optional)
    const interviewData = interviewSessionId
      ? await fetchInterviewData(interviewSessionId)
      : null;

    // Validate data integrity
    validateDataIntegrity(researchData, interviewData);

    // Combine into unified context
    const synthesizedContext = synthesizeContext(researchData, interviewData);

    const duration = Date.now() - startTime;

    logger.info('Data synthesis completed', {
      researchId,
      interviewSessionId,
      hasInterview: !!interviewData,
      duration,
      contextSections: Object.keys(synthesizedContext).length
    });

    return synthesizedContext;

  } catch (error) {
    logger.error('Data synthesis failed', error, {
      researchId,
      interviewSessionId
    });
    throw error;
  }
}

/**
 * Fetch research data from database
 * @param {string} researchId - Research ID
 * @returns {Promise<object>} - Research data
 */
async function fetchResearchData(researchId) {
  const researchResult = await ResearchResult.findById(researchId);

  if (!researchResult) {
    throw new Error(`Research result not found: ${researchId}`);
  }

  return {
    id: researchResult.id,
    websiteUrl: researchResult.website_url,
    productDescription: researchResult.product_description,
    marketSize: researchResult.market_size || {},
    competitors: researchResult.competitors || [],
    targetAudience: researchResult.target_audience || {},
    channels: researchResult.channels || [],
    painPoints: researchResult.pain_points || [],
    createdAt: researchResult.created_at,
    // Parse additional data from raw_response if available
    rawAnalysis: parseRawAnalysis(researchResult.raw_response)
  };
}

/**
 * Fetch interview data from database
 * @param {string} interviewSessionId - Interview session ID
 * @returns {Promise<object>} - Interview data with responses and analysis
 */
async function fetchInterviewData(interviewSessionId) {
  const session = await InterviewSession.findById(interviewSessionId);

  if (!session) {
    throw new Error(`Interview session not found: ${interviewSessionId}`);
  }

  // Get all responses for this session
  const responses = await InterviewResponse.findBySessionId(interviewSessionId);

  return {
    sessionId: session.id,
    researchId: session.research_id,
    status: session.status,
    currentQuestion: session.current_question,
    analysis: session.analysis || {},
    startedAt: session.started_at,
    completedAt: session.completed_at,
    duration: session.getDurationMinutes(),
    responses: responses.map(r => ({
      questionNumber: r.question_number,
      questionText: r.question_text,
      responseText: r.response_text,
      wordCount: r.getWordCount(),
      isEmpty: r.isEmpty(),
      createdAt: r.created_at
    })),
    stats: await InterviewResponse.getSessionStats(interviewSessionId),
    transcript: await InterviewResponse.getSessionTranscript(interviewSessionId)
  };
}

/**
 * Parse additional insights from research raw response
 * @param {string} rawResponse - Raw response JSON string
 * @returns {object} - Parsed opportunities, threats, recommendations
 */
function parseRawAnalysis(rawResponse) {
  try {
    if (!rawResponse) return {};

    const parsed = JSON.parse(rawResponse);

    return {
      opportunities: parsed.opportunities || [],
      threats: parsed.threats || [],
      recommendations: parsed.recommendations || {},
      claudeResponse: parsed.claudeResponse || {}
    };
  } catch (error) {
    logger.warn('Failed to parse raw research analysis', { error: error.message });
    return {};
  }
}

/**
 * Validate data integrity and completeness
 * @param {object} researchData - Research data
 * @param {object} interviewData - Interview data (optional)
 */
function validateDataIntegrity(researchData, interviewData) {
  // Validate research data completeness
  const researchIssues = [];

  if (!researchData.websiteUrl) {
    researchIssues.push('Missing website URL');
  }

  if (!researchData.productDescription) {
    researchIssues.push('Missing product description');
  }

  if (!researchData.competitors || researchData.competitors.length === 0) {
    researchIssues.push('No competitors identified');
  }

  if (!researchData.channels || researchData.channels.length === 0) {
    researchIssues.push('No marketing channels identified');
  }

  // Validate interview data if present
  if (interviewData) {
    const interviewIssues = [];

    if (interviewData.status !== 'completed') {
      interviewIssues.push(`Interview not completed (status: ${interviewData.status})`);
    }

    if (!interviewData.responses || interviewData.responses.length < 4) {
      interviewIssues.push(`Insufficient responses (${interviewData.responses?.length || 0}/4)`);
    }

    if (!interviewData.analysis || Object.keys(interviewData.analysis).length === 0) {
      interviewIssues.push('Interview analysis missing');
    }

    if (interviewIssues.length > 0) {
      logger.warn('Interview data quality issues', {
        interviewSessionId: interviewData.sessionId,
        issues: interviewIssues
      });
    }
  }

  if (researchIssues.length > 0) {
    logger.warn('Research data quality issues', {
      researchId: researchData.id,
      issues: researchIssues
    });
  }
}

/**
 * Synthesize research and interview data into unified context
 * @param {object} researchData - Research data
 * @param {object} interviewData - Interview data (optional)
 * @returns {object} - Synthesized context for Claude
 */
function synthesizeContext(researchData, interviewData) {
  const context = {
    // Core Business Information
    business: {
      websiteUrl: researchData.websiteUrl,
      productDescription: researchData.productDescription,
      hasInterview: !!interviewData
    },

    // Market Intelligence
    market: {
      size: researchData.marketSize,
      competitors: researchData.competitors.map(formatCompetitor),
      targetAudience: researchData.targetAudience,
      painPoints: researchData.painPoints.map(formatPainPoint),
      opportunities: researchData.rawAnalysis.opportunities || [],
      threats: researchData.rawAnalysis.threats || []
    },

    // Marketing Strategy
    marketing: {
      channels: researchData.channels.map(formatChannel),
      recommendations: researchData.rawAnalysis.recommendations || {}
    },

    // Strategic Insights (from interview if available)
    strategy: interviewData ? extractStrategicInsights(interviewData) : {},

    // Data Quality Indicators
    dataQuality: {
      researchCompleteness: calculateResearchCompleteness(researchData),
      interviewCompleteness: interviewData ? calculateInterviewCompleteness(interviewData) : 0,
      confidenceScore: calculateConfidenceScore(researchData, interviewData),
      dataFreshness: {
        researchAge: getDataAge(researchData.createdAt),
        interviewAge: interviewData ? getDataAge(interviewData.startedAt) : null
      }
    },

    // Generation Context
    meta: {
      synthesizedAt: new Date().toISOString(),
      researchId: researchData.id,
      interviewSessionId: interviewData?.sessionId || null,
      dataSourcesUsed: interviewData ? ['research', 'interview'] : ['research'],
      reportType: interviewData ? 'comprehensive' : 'research-only'
    }
  };

  return context;
}

/**
 * Format competitor data for consistent structure
 * @param {object} competitor - Raw competitor data
 * @returns {object} - Formatted competitor
 */
function formatCompetitor(competitor) {
  return {
    name: competitor.name || 'Unknown',
    website: competitor.website || null,
    positioning: competitor.positioning || 'Not specified',
    marketShare: competitor.marketShare || 'Unknown',
    pricing: competitor.pricing || 'Not specified',
    strengths: competitor.strengths || [],
    weaknesses: competitor.weaknesses || []
  };
}

/**
 * Format pain point data for consistent structure
 * @param {object} painPoint - Raw pain point data
 * @returns {object} - Formatted pain point
 */
function formatPainPoint(painPoint) {
  return {
    problem: painPoint.problem || 'Not specified',
    severity: painPoint.severity || 'medium',
    frequency: painPoint.frequency || 'Unknown',
    currentSolutions: painPoint.currentSolutions || [],
    opportunity: painPoint.opportunity || 'Not identified'
  };
}

/**
 * Format channel data for consistent structure
 * @param {object} channel - Raw channel data
 * @returns {object} - Formatted channel
 */
function formatChannel(channel) {
  return {
    name: channel.channel || 'Unknown',
    priority: channel.priority || 'medium',
    rationale: channel.rationale || 'Not specified',
    estimatedCPA: channel.estimatedCPA || 'Not estimated',
    expectedROAS: channel.expectedROAS || 'Not estimated'
  };
}

/**
 * Extract strategic insights from interview data
 * @param {object} interviewData - Interview data
 * @returns {object} - Strategic insights
 */
function extractStrategicInsights(interviewData) {
  const analysis = interviewData.analysis || {};

  return {
    brandPositioning: analysis.brandPositioning || {},
    resourceConstraints: analysis.resourceConstraints || {},
    growthPriorities: analysis.growthPriorities || [],
    channelPreferences: analysis.channelPreferences || {},
    personalMotivations: analysis.personalMotivations || {},
    strategicInsights: analysis.strategicInsights || {},
    gtmReadiness: analysis.gtmReadiness || {},
    responses: {
      brandStory: findResponseByQuestion(interviewData.responses, 1),
      channelExperience: findResponseByQuestion(interviewData.responses, 2),
      revenueTargets: findResponseByQuestion(interviewData.responses, 3),
      personalGoals: findResponseByQuestion(interviewData.responses, 4)
    }
  };
}

/**
 * Find response by question number
 * @param {Array} responses - Interview responses
 * @param {number} questionNumber - Question number
 * @returns {string} - Response text or empty string
 */
function findResponseByQuestion(responses, questionNumber) {
  const response = responses.find(r => r.questionNumber === questionNumber);
  return response ? response.responseText || '' : '';
}

/**
 * Calculate research data completeness score
 * @param {object} researchData - Research data
 * @returns {number} - Completeness score (0-100)
 */
function calculateResearchCompleteness(researchData) {
  const requiredFields = [
    'websiteUrl',
    'productDescription',
    'marketSize.tam',
    'competitors',
    'targetAudience.primary',
    'channels',
    'painPoints'
  ];

  let completedFields = 0;

  requiredFields.forEach(field => {
    const value = getNestedValue(researchData, field);
    if (value && (Array.isArray(value) ? value.length > 0 : true)) {
      completedFields++;
    }
  });

  return Math.round((completedFields / requiredFields.length) * 100);
}

/**
 * Calculate interview data completeness score
 * @param {object} interviewData - Interview data
 * @returns {number} - Completeness score (0-100)
 */
function calculateInterviewCompleteness(interviewData) {
  let score = 0;

  // Session completion (40%)
  if (interviewData.status === 'completed') {
    score += 40;
  }

  // Response completeness (40%)
  const expectedResponses = 4;
  const actualResponses = interviewData.responses?.filter(r => !r.isEmpty).length || 0;
  score += Math.round((actualResponses / expectedResponses) * 40);

  // Analysis completeness (20%)
  if (interviewData.analysis && Object.keys(interviewData.analysis).length > 0) {
    score += 20;
  }

  return Math.min(score, 100);
}

/**
 * Calculate overall confidence score for report generation
 * @param {object} researchData - Research data
 * @param {object} interviewData - Interview data (optional)
 * @returns {number} - Confidence score (0-100)
 */
function calculateConfidenceScore(researchData, interviewData) {
  const researchScore = calculateResearchCompleteness(researchData);

  if (!interviewData) {
    // Research-only report: base confidence on research quality
    return Math.round(researchScore * 0.8); // Cap at 80% without interview
  }

  const interviewScore = calculateInterviewCompleteness(interviewData);

  // Weighted average: 60% research, 40% interview
  return Math.round((researchScore * 0.6) + (interviewScore * 0.4));
}

/**
 * Get data age in hours
 * @param {string|Date} timestamp - Timestamp
 * @returns {number} - Age in hours
 */
function getDataAge(timestamp) {
  if (!timestamp) return null;

  const now = new Date();
  const created = new Date(timestamp);
  const ageMs = now.getTime() - created.getTime();

  return Math.round(ageMs / (1000 * 60 * 60)); // Convert to hours
}

/**
 * Get nested object value by dot notation
 * @param {object} obj - Object to search
 * @param {string} path - Dot notation path
 * @returns {any} - Value or undefined
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

/**
 * Check if synthesis is possible with given inputs
 * @param {string} researchId - Research ID
 * @param {string} interviewSessionId - Interview session ID (optional)
 * @returns {Promise<object>} - Validation result
 */
async function validateSynthesisInputs(researchId, interviewSessionId = null) {
  try {
    const issues = [];

    // Check research exists
    const research = await ResearchResult.findById(researchId);
    if (!research) {
      issues.push(`Research not found: ${researchId}`);
    }

    // Check interview if provided
    if (interviewSessionId) {
      const interview = await InterviewSession.findById(interviewSessionId);
      if (!interview) {
        issues.push(`Interview session not found: ${interviewSessionId}`);
      } else if (interview.research_id !== researchId) {
        issues.push(`Interview session ${interviewSessionId} does not belong to research ${researchId}`);
      }
    }

    return {
      valid: issues.length === 0,
      issues
    };

  } catch (error) {
    return {
      valid: false,
      issues: [`Validation error: ${error.message}`]
    };
  }
}

module.exports = {
  combineInputs,
  validateSynthesisInputs,
  fetchResearchData,
  fetchInterviewData,
  synthesizeContext,
  calculateConfidenceScore
};