/**
 * Interview Analysis Service for NexSpark Strategist
 *
 * Analyzes completed interview transcripts using Claude AI to extract
 * strategic insights, brand positioning, resource constraints, and
 * growth priorities for GTM strategy development.
 */

const claudeService = require('./claudeService');
const { InterviewResponse, InterviewSession } = require('../models');
const { ANALYSIS_PROMPTS, InterviewQuestionHelpers } = require('../config/interviewQuestions');
const logger = require('../utils/logger');
const { success: formatSuccessResponse } = require('../utils/responseFormatter');

class InterviewAnalysisService {
  /**
   * Analyze complete interview transcript and extract strategic insights
   * @param {string} sessionId - Interview session ID
   * @returns {Object} Comprehensive interview analysis
   */
  async analyzeTranscript(sessionId) {
    try {
      logger.info('Starting interview transcript analysis', { sessionId });

      // Get session and validate
      const session = await InterviewSession.findById(sessionId);
      if (!session) {
        throw new Error('Interview session not found');
      }

      if (session.status !== 'completed') {
        throw new Error('Interview session must be completed before analysis');
      }

      // Get all responses
      const responses = await InterviewResponse.findBySessionId(sessionId);
      if (responses.length === 0) {
        throw new Error('No interview responses found for analysis');
      }

      // Format transcript for analysis
      const transcript = await this.formatTranscriptForAnalysis(sessionId, responses);

      // Generate analysis using Claude
      const analysis = await this.generateAnalysisWithClaude(transcript);

      // Store analysis in session
      await InterviewSession.update(sessionId, {
        analysis: analysis,
        updated_at: new Date()
      });

      logger.info('Interview transcript analysis completed', {
        sessionId,
        analysisKeys: Object.keys(analysis)
      });

      return formatSuccessResponse({
        session_id: sessionId,
        analysis: analysis,
        analyzed_at: new Date().toISOString()
      }, 'Interview analysis completed successfully');

    } catch (error) {
      logger.error('Failed to analyze interview transcript', {
        sessionId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Format interview responses into a structured transcript for Claude analysis
   * @param {string} sessionId - Session ID
   * @param {Array} responses - Interview responses
   * @returns {Object} Formatted transcript with context
   */
  async formatTranscriptForAnalysis(sessionId, responses) {
    try {
      const session = await InterviewSession.findById(sessionId);
      const stats = await InterviewResponse.getSessionStats(sessionId);

      // Build structured transcript
      const transcript = {
        session_metadata: {
          session_id: sessionId,
          research_id: session.research_id,
          duration_minutes: session.getDurationMinutes(),
          total_responses: responses.length,
          total_words: stats.totalWords,
          average_response_length: Math.round(stats.totalWords / responses.length),
          completed_at: session.completed_at
        },
        interview_qa_pairs: responses.map(response => {
          const question = InterviewQuestionHelpers.getQuestion(response.question_number);
          const validation = InterviewQuestionHelpers.validateResponse(
            response.question_number,
            response.response_text
          );

          return {
            question_number: response.question_number,
            category: question.category,
            question_text: response.question_text,
            response_text: response.response_text.trim(),
            word_count: validation.wordCount,
            quality_score: validation.qualityScore,
            extraction_targets: question.extractionTargets
          };
        }),
        analysis_focus: [
          'Brand positioning and differentiation',
          'Marketing experience and channel preferences',
          'Resource constraints (time, budget, team)',
          'Growth priorities and success definitions',
          'Personal motivations and concerns'
        ]
      };

      return transcript;

    } catch (error) {
      logger.error('Failed to format transcript for analysis', {
        sessionId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Use Claude AI to analyze the interview transcript and extract insights
   * @param {Object} transcript - Formatted interview transcript
   * @returns {Object} Strategic analysis insights
   */
  async generateAnalysisWithClaude(transcript) {
    try {
      const systemPrompt = this.buildAnalysisSystemPrompt();
      const analysisPrompt = this.buildAnalysisPrompt(transcript);

      logger.info('Generating interview analysis with Claude', {
        sessionId: transcript.session_metadata.session_id,
        totalWords: transcript.session_metadata.total_words,
        responseCount: transcript.interview_qa_pairs.length
      });

      const claudeResponse = await claudeService.callClaudeForJSON(
        systemPrompt,
        analysisPrompt,
        {
          max_tokens: 4000,
          temperature: 0.3 // Lower temperature for more consistent analysis
        }
      );

      // Validate and enrich analysis
      const enrichedAnalysis = await this.enrichAnalysis(claudeResponse, transcript);

      return enrichedAnalysis;

    } catch (error) {
      logger.error('Failed to generate analysis with Claude', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Build the system prompt for Claude interview analysis
   * @returns {string} System prompt
   */
  buildAnalysisSystemPrompt() {
    return `You are a strategic business analyst specializing in growth marketing and go-to-market strategy. You analyze interview transcripts to extract actionable insights about entrepreneurs and their businesses.

Your role is to:
1. Extract clear, specific insights from interview responses
2. Identify resource constraints and capabilities
3. Assess marketing maturity and channel preferences
4. Understand personal motivations and success definitions
5. Determine growth priorities and urgency levels
6. Flag potential concerns or red flags

Focus on actionable insights that can inform a 90-day GTM strategy. Be specific and evidence-based in your analysis.

Return your analysis as valid JSON only, with no additional text or markdown formatting.`;
  }

  /**
   * Build the analysis prompt with interview transcript
   * @param {Object} transcript - Formatted interview transcript
   * @returns {string} Analysis prompt
   */
  buildAnalysisPrompt(transcript) {
    const prompt = `Analyze this interview transcript and extract strategic insights:

INTERVIEW DATA:
Session Duration: ${transcript.session_metadata.duration_minutes} minutes
Total Responses: ${transcript.session_metadata.total_responses}
Average Response Length: ${transcript.session_metadata.average_response_length} words

INTERVIEW TRANSCRIPT:
${transcript.interview_qa_pairs.map(qa => `
Q${qa.question_number} [${qa.category}]: ${qa.question_text}

Response (${qa.word_count} words): ${qa.response_text}

Extraction Targets: ${qa.extraction_targets.join(', ')}
`).join('\n---\n')}

ANALYSIS REQUIREMENTS:
Provide a comprehensive analysis in the following JSON structure:

{
  "brand_positioning": {
    "value_proposition": "Clear statement of unique value",
    "differentiators": ["key differentiator 1", "key differentiator 2"],
    "positioning_clarity": "high|medium|low",
    "brand_maturity": "early|developing|established",
    "market_understanding": "Score 1-10 with brief justification"
  },
  "resource_constraints": {
    "time_availability": "Specific hours/week available for marketing",
    "budget_range": "Monthly marketing budget comfort zone",
    "team_size": "Number of people available (solo/small team/larger team)",
    "technical_capability": "low|medium|high",
    "marketing_experience": "beginner|intermediate|advanced",
    "primary_limitations": ["main constraint 1", "main constraint 2"]
  },
  "growth_priorities": [
    {
      "priority": "Specific growth goal or focus area",
      "urgency": "low|medium|high",
      "timeline": "Expected timeframe",
      "success_metric": "How they'll measure success"
    }
  ],
  "channel_preferences": {
    "proven_channels": ["channels with previous success"],
    "interested_channels": ["channels they want to try"],
    "avoided_channels": ["channels they've failed with or want to avoid"],
    "comfort_level": "digital_native|digital_learner|traditional_preferred",
    "analytics_maturity": "none|basic|intermediate|advanced"
  },
  "personal_motivations": {
    "primary_driver": "Main motivation for business success",
    "success_definition": "How they personally define success",
    "emotional_factors": ["fear", "excitement", "pressure", "ambition"],
    "timeline_pressure": "none|moderate|high",
    "external_factors": ["family pressure", "financial needs", "market timing", etc.]
  },
  "strategic_insights": {
    "strengths": ["key business/personal strengths"],
    "opportunities": ["immediate opportunities identified"],
    "concerns": ["potential challenges or red flags"],
    "recommended_focus": ["2-3 focus areas for next 90 days"],
    "risk_factors": ["factors that could derail success"]
  },
  "gtm_readiness": {
    "overall_score": "Score 1-10",
    "readiness_factors": {
      "product_market_fit": "Score 1-10",
      "resource_availability": "Score 1-10",
      "market_understanding": "Score 1-10",
      "execution_capability": "Score 1-10"
    },
    "immediate_needs": ["what they need most right now"],
    "blockers": ["what could prevent GTM success"]
  }
}

Extract specific, actionable insights based on the actual responses. If information is missing, note it rather than guessing.`;

    return prompt;
  }

  /**
   * Enrich the Claude analysis with additional insights and validation
   * @param {Object} claudeAnalysis - Raw Claude analysis
   * @param {Object} transcript - Original transcript
   * @returns {Object} Enriched analysis
   */
  async enrichAnalysis(claudeAnalysis, transcript) {
    try {
      // Add metadata and validation scores
      const enriched = {
        ...claudeAnalysis,
        analysis_metadata: {
          analyzed_at: new Date().toISOString(),
          session_id: transcript.session_metadata.session_id,
          interview_quality: this.calculateInterviewQuality(transcript),
          confidence_score: this.calculateConfidenceScore(claudeAnalysis, transcript),
          completeness_score: this.calculateCompletenessScore(claudeAnalysis)
        }
      };

      // Add derived insights
      enriched.derived_insights = {
        recommended_budget_range: this.deriveBudgetRecommendation(enriched),
        suggested_timeline: this.deriveTimelineRecommendation(enriched),
        channel_priority_ranking: this.deriveChannelPriorities(enriched),
        risk_assessment: this.deriveRiskAssessment(enriched)
      };

      return enriched;

    } catch (error) {
      logger.error('Failed to enrich analysis', { error: error.message });
      // Return original analysis if enrichment fails
      return claudeAnalysis;
    }
  }

  /**
   * Calculate interview quality score based on response characteristics
   * @param {Object} transcript - Interview transcript
   * @returns {Object} Quality assessment
   */
  calculateInterviewQuality(transcript) {
    const responses = transcript.interview_qa_pairs;
    const avgWordCount = transcript.session_metadata.average_response_length;
    const totalWords = transcript.session_metadata.total_words;

    let qualityScore = 0;

    // Length quality (0-3 points)
    if (avgWordCount >= 50) qualityScore += 3;
    else if (avgWordCount >= 30) qualityScore += 2;
    else if (avgWordCount >= 20) qualityScore += 1;

    // Completeness (0-2 points)
    if (responses.length === 4) qualityScore += 2;
    else if (responses.length >= 3) qualityScore += 1;

    // Detail level (0-3 points) - based on total words
    if (totalWords >= 400) qualityScore += 3;
    else if (totalWords >= 250) qualityScore += 2;
    else if (totalWords >= 150) qualityScore += 1;

    // Specificity (0-2 points) - responses with numbers or specific examples
    const specificResponses = responses.filter(r =>
      r.response_text.match(/\d+/) ||
      r.response_text.length > r.response_text.toLowerCase().length
    );
    if (specificResponses.length >= 3) qualityScore += 2;
    else if (specificResponses.length >= 2) qualityScore += 1;

    return {
      total_score: qualityScore,
      max_score: 10,
      percentage: Math.round((qualityScore / 10) * 100),
      level: qualityScore >= 8 ? 'high' : qualityScore >= 5 ? 'medium' : 'low'
    };
  }

  /**
   * Calculate confidence score for analysis accuracy
   * @param {Object} analysis - Claude analysis
   * @param {Object} transcript - Original transcript
   * @returns {number} Confidence score 1-10
   */
  calculateConfidenceScore(analysis, transcript) {
    let confidence = 5; // Base confidence

    const quality = this.calculateInterviewQuality(transcript);

    // Adjust based on interview quality
    if (quality.level === 'high') confidence += 2;
    else if (quality.level === 'low') confidence -= 2;

    // Adjust based on response completeness
    const responses = transcript.interview_qa_pairs;
    if (responses.length === 4) confidence += 1;
    else if (responses.length < 3) confidence -= 2;

    // Adjust based on analysis completeness
    const completeness = this.calculateCompletenessScore(analysis);
    if (completeness >= 80) confidence += 1;
    else if (completeness < 50) confidence -= 1;

    return Math.max(1, Math.min(10, confidence));
  }

  /**
   * Calculate how complete the analysis is
   * @param {Object} analysis - Claude analysis
   * @returns {number} Completeness percentage
   */
  calculateCompletenessScore(analysis) {
    const requiredFields = [
      'brand_positioning.value_proposition',
      'brand_positioning.positioning_clarity',
      'resource_constraints.time_availability',
      'resource_constraints.budget_range',
      'resource_constraints.marketing_experience',
      'growth_priorities',
      'personal_motivations.primary_driver',
      'strategic_insights.strengths',
      'strategic_insights.recommended_focus'
    ];

    let completedFields = 0;

    requiredFields.forEach(field => {
      const value = this.getNestedProperty(analysis, field);
      if (value && value !== '' && (Array.isArray(value) ? value.length > 0 : true)) {
        completedFields++;
      }
    });

    return Math.round((completedFields / requiredFields.length) * 100);
  }

  /**
   * Derive budget recommendation based on analysis
   * @param {Object} analysis - Enriched analysis
   * @returns {Object} Budget recommendation
   */
  deriveBudgetRecommendation(analysis) {
    const mentioned = analysis.resource_constraints.budget_range;
    const experience = analysis.resource_constraints.marketing_experience;

    // Provide general guidance based on experience level
    let recommendation = {
      mentioned_budget: mentioned,
      recommended_range: '$500-2000/month',
      rationale: 'Standard recommendation for SMB growth marketing'
    };

    if (experience === 'beginner') {
      recommendation.recommended_range = '$300-1000/month';
      recommendation.rationale = 'Conservative start to learn what works';
    } else if (experience === 'advanced') {
      recommendation.recommended_range = '$1000-5000/month';
      recommendation.rationale = 'Higher budget justified by experience and execution capability';
    }

    return recommendation;
  }

  /**
   * Derive timeline recommendation based on goals and constraints
   * @param {Object} analysis - Enriched analysis
   * @returns {Object} Timeline recommendation
   */
  deriveTimelineRecommendation(analysis) {
    const urgency = analysis.personal_motivations.timeline_pressure;
    const experience = analysis.resource_constraints.marketing_experience;

    let timeframe = '90-120 days';
    let rationale = 'Standard timeframe for GTM strategy execution';

    if (urgency === 'high' && experience !== 'beginner') {
      timeframe = '60-90 days';
      rationale = 'Accelerated timeline due to high urgency and capability';
    } else if (experience === 'beginner' || urgency === 'none') {
      timeframe = '120-180 days';
      rationale = 'Extended timeline for learning and gradual scaling';
    }

    return {
      recommended_timeframe: timeframe,
      rationale: rationale,
      key_milestones: [
        'Week 1-2: Setup and preparation',
        'Week 3-6: Initial campaign launch',
        'Week 7-10: Optimization and scaling',
        'Week 11-12: Evaluation and planning'
      ]
    };
  }

  /**
   * Derive channel priorities based on experience and preferences
   * @param {Object} analysis - Enriched analysis
   * @returns {Array} Prioritized channel recommendations
   */
  deriveChannelPriorities(analysis) {
    const proven = analysis.channel_preferences.proven_channels || [];
    const interested = analysis.channel_preferences.interested_channels || [];
    const avoided = analysis.channel_preferences.avoided_channels || [];
    const experience = analysis.resource_constraints.marketing_experience;

    // Start with proven channels
    const priorities = proven.map(channel => ({
      channel: channel,
      priority: 'high',
      rationale: 'Previous success with this channel'
    }));

    // Add interested channels based on experience
    interested.forEach(channel => {
      if (!avoided.includes(channel)) {
        priorities.push({
          channel: channel,
          priority: experience === 'beginner' ? 'medium' : 'high',
          rationale: 'Expressed interest and capability to execute'
        });
      }
    });

    return priorities.slice(0, 3); // Top 3 priorities
  }

  /**
   * Derive risk assessment based on constraints and goals
   * @param {Object} analysis - Enriched analysis
   * @returns {Object} Risk assessment
   */
  deriveRiskAssessment(analysis) {
    const risks = [];
    const mitigations = [];

    // Check for common risk factors
    if (analysis.resource_constraints.marketing_experience === 'beginner') {
      risks.push('Limited marketing experience may slow execution');
      mitigations.push('Start with proven channels and focus on learning');
    }

    if (analysis.personal_motivations.timeline_pressure === 'high') {
      risks.push('High timeline pressure may lead to rushed decisions');
      mitigations.push('Focus on quick wins while building sustainable systems');
    }

    if (analysis.gtm_readiness?.readiness_factors?.resource_availability < 5) {
      risks.push('Limited resources may constrain growth velocity');
      mitigations.push('Prioritize high-ROI activities and automate where possible');
    }

    return {
      risk_level: risks.length >= 3 ? 'high' : risks.length >= 1 ? 'medium' : 'low',
      identified_risks: risks,
      mitigation_strategies: mitigations
    };
  }

  /**
   * Helper function to get nested property from object
   * @param {Object} obj - Object to search
   * @param {string} path - Dot notation path
   * @returns {*} Property value
   */
  getNestedProperty(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }
}

module.exports = new InterviewAnalysisService();