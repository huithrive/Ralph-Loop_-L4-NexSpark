/**
 * Interview Service for NexSpark Strategist
 *
 * Orchestrates the conversational interview flow, manages session state,
 * and handles question progression based on user responses.
 */

const { InterviewSession, InterviewResponse } = require('../models');
const { InterviewQuestionHelpers, INTERVIEW_CONFIG, INTERVIEW_SCRIPT } = require('../config/interviewQuestions');
const logger = require('../utils/logger');
const { success: formatSuccessResponse } = require('../utils/responseFormatter');

class InterviewService {
  /**
   * Start a new interview session
   * @param {string} researchId - Research result ID to base interview on
   * @returns {Object} Session with first question
   */
  async startSession(researchId) {
    try {
      logger.info('Starting interview session', { researchId });

      // Verify research exists (basic check)
      if (!researchId) {
        throw new Error('Research ID is required to start interview');
      }

      // Create new interview session
      const sessionData = {
        research_id: researchId,
        status: 'in_progress',
        current_question: 1,
        started_at: new Date()
      };

      const session = await InterviewSession.create(sessionData);
      const firstQuestion = InterviewQuestionHelpers.getQuestion(1);

      const response = {
        session_id: session.id,
        status: 'started',
        current_question: 1,
        total_questions: INTERVIEW_CONFIG.totalQuestions,
        estimated_duration: INTERVIEW_CONFIG.estimatedDuration,
        welcome_message: INTERVIEW_SCRIPT.welcome,
        question: {
          number: firstQuestion.questionNumber,
          category: firstQuestion.category,
          text: firstQuestion.mainQuestion,
          time_limit: firstQuestion.timeLimit
        }
      };

      logger.info('Interview session started successfully', {
        sessionId: session.id,
        researchId
      });

      return formatSuccessResponse(response, 'Interview session started successfully');

    } catch (error) {
      logger.error('Failed to start interview session', {
        researchId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get the next question for a session
   * @param {string} sessionId - Interview session ID
   * @returns {Object} Next question or completion status
   */
  async getNextQuestion(sessionId) {
    try {
      logger.info('Getting next question', { sessionId });

      const session = await InterviewSession.findById(sessionId);
      if (!session) {
        throw new Error('Interview session not found');
      }

      if (session.status !== 'in_progress') {
        throw new Error('Interview session is not active');
      }

      const nextQuestionNumber = InterviewQuestionHelpers.getNextQuestion(session.current_question);

      // Check if interview is complete
      if (!nextQuestionNumber) {
        return {
          status: 'ready_for_completion',
          message: 'All questions answered. Ready to complete interview.',
          session_id: sessionId,
          total_responses: session.current_question
        };
      }

      const nextQuestion = InterviewQuestionHelpers.getQuestion(nextQuestionNumber);

      const response = {
        session_id: sessionId,
        status: 'in_progress',
        current_question: nextQuestionNumber,
        total_questions: INTERVIEW_CONFIG.totalQuestions,
        progress: Math.round((nextQuestionNumber - 1) / INTERVIEW_CONFIG.totalQuestions * 100),
        transition_message: InterviewQuestionHelpers.getScript('transitions', 'between_questions'),
        question: {
          number: nextQuestion.questionNumber,
          category: nextQuestion.category,
          text: nextQuestion.mainQuestion,
          time_limit: nextQuestion.timeLimit
        }
      };

      logger.info('Next question retrieved', { sessionId, questionNumber: nextQuestionNumber });
      return formatSuccessResponse(response, 'Next question ready');

    } catch (error) {
      logger.error('Failed to get next question', {
        sessionId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Submit a response to the current question
   * @param {string} sessionId - Interview session ID
   * @param {number} questionNumber - Question number being answered
   * @param {string} responseText - User's response
   * @returns {Object} Response acknowledgment and next steps
   */
  async submitResponse(sessionId, questionNumber, responseText) {
    try {
      logger.info('Submitting response', {
        sessionId,
        questionNumber,
        responseLength: responseText?.length
      });

      // Validate inputs
      if (!sessionId || !questionNumber || !responseText) {
        throw new Error('Session ID, question number, and response text are required');
      }

      const session = await InterviewSession.findById(sessionId);
      if (!session) {
        throw new Error('Interview session not found');
      }

      if (session.status !== 'in_progress') {
        throw new Error('Interview session is not active');
      }

      // Validate response quality
      const validation = InterviewQuestionHelpers.validateResponse(questionNumber, responseText);
      if (!validation.isValid) {
        throw new Error(`Response is too ${validation.wordCount < 10 ? 'short' : 'long'}. Please provide a more detailed response.`);
      }

      // Get question details
      const question = InterviewQuestionHelpers.getQuestion(questionNumber);
      if (!question) {
        throw new Error('Invalid question number');
      }

      // Store the response
      const responseData = {
        session_id: sessionId,
        question_number: questionNumber,
        question_text: question.mainQuestion,
        response_text: responseText.trim()
      };

      const savedResponse = await InterviewResponse.create(responseData);

      // Advance session to next question
      const updatedSession = await InterviewSession.advanceQuestion(sessionId);

      // Determine if follow-up is needed
      const needsFollowUp = validation.needsFollowUp;
      let followUpSuggestion = null;

      if (needsFollowUp && question.followUps.length > 0) {
        // Select an appropriate follow-up question
        followUpSuggestion = {
          suggested: true,
          text: question.followUps[0], // Use first follow-up for simplicity
          reason: 'Your response was helpful, but I\'d love to hear more details to create a better strategy for you.'
        };
      }

      const response = {
        session_id: sessionId,
        response_id: savedResponse.id,
        status: 'response_saved',
        question_number: questionNumber,
        word_count: validation.wordCount,
        quality_score: validation.qualityScore,
        follow_up: followUpSuggestion,
        next_action: InterviewQuestionHelpers.isComplete(updatedSession.current_question) ?
          'complete_interview' : 'next_question'
      };

      logger.info('Response submitted successfully', {
        sessionId,
        questionNumber,
        responseId: savedResponse.id,
        qualityScore: validation.qualityScore
      });

      return formatSuccessResponse(response, 'Response saved successfully');

    } catch (error) {
      logger.error('Failed to submit response', {
        sessionId,
        questionNumber,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Complete an interview session and trigger analysis
   * @param {string} sessionId - Interview session ID
   * @returns {Object} Completion confirmation
   */
  async completeSession(sessionId) {
    try {
      logger.info('Completing interview session', { sessionId });

      const session = await InterviewSession.findById(sessionId);
      if (!session) {
        throw new Error('Interview session not found');
      }

      if (session.status === 'completed') {
        throw new Error('Interview session already completed');
      }

      // Get all responses for validation
      const responses = await InterviewResponse.findBySessionId(sessionId);

      if (responses.length < INTERVIEW_CONFIG.totalQuestions) {
        throw new Error(`Interview incomplete. Expected ${INTERVIEW_CONFIG.totalQuestions} responses, got ${responses.length}`);
      }

      // Mark session as completed
      const completedSession = await InterviewSession.complete(sessionId);

      // Generate session summary
      const summary = await this.generateSessionSummary(sessionId, responses);

      const response = {
        session_id: sessionId,
        status: 'completed',
        completed_at: completedSession.completed_at,
        total_responses: responses.length,
        duration_minutes: completedSession.getDurationMinutes(),
        summary: summary,
        closing_message: INTERVIEW_SCRIPT.closing,
        next_steps: {
          action: 'generate_gtm_report',
          message: 'Your interview analysis will be combined with your market research to create a comprehensive GTM strategy report.'
        }
      };

      logger.info('Interview session completed successfully', {
        sessionId,
        totalResponses: responses.length,
        durationMinutes: completedSession.getDurationMinutes()
      });

      return formatSuccessResponse(response, 'Interview completed successfully');

    } catch (error) {
      logger.error('Failed to complete interview session', {
        sessionId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get interview session status and progress
   * @param {string} sessionId - Interview session ID
   * @returns {Object} Session status and details
   */
  async getSessionStatus(sessionId) {
    try {
      logger.info('Getting session status', { sessionId });

      const session = await InterviewSession.findById(sessionId);
      if (!session) {
        throw new Error('Interview session not found');
      }

      const responses = await InterviewResponse.findBySessionId(sessionId);
      const currentQuestion = InterviewQuestionHelpers.getQuestion(session.current_question);

      const status = {
        session_id: sessionId,
        research_id: session.research_id,
        status: session.status,
        current_question: session.current_question,
        total_questions: INTERVIEW_CONFIG.totalQuestions,
        responses_count: responses.length,
        progress_percentage: Math.round((responses.length / INTERVIEW_CONFIG.totalQuestions) * 100),
        started_at: session.started_at,
        completed_at: session.completed_at,
        duration_minutes: session.getDurationMinutes(),
        is_complete: session.status === 'completed',
        current_question_details: currentQuestion ? {
          number: currentQuestion.questionNumber,
          category: currentQuestion.category,
          text: currentQuestion.mainQuestion
        } : null
      };

      logger.info('Session status retrieved', { sessionId, status: session.status });
      return formatSuccessResponse(status, 'Session status retrieved');

    } catch (error) {
      logger.error('Failed to get session status', {
        sessionId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Generate a summary of the interview session
   * @param {string} sessionId - Interview session ID
   * @param {Array} responses - Interview responses
   * @returns {Object} Interview summary
   */
  async generateSessionSummary(sessionId, responses) {
    try {
      const transcript = await InterviewResponse.getSessionTranscript(sessionId);
      const stats = await InterviewResponse.getSessionStats(sessionId);

      const summary = {
        total_responses: responses.length,
        total_words: stats.totalWords,
        average_response_length: Math.round(stats.totalWords / responses.length),
        completion_rate: 100, // Since we only call this on completed sessions
        response_quality: {
          detailed_responses: responses.filter(r => r.getWordCount() >= 30).length,
          brief_responses: responses.filter(r => r.getWordCount() < 30).length,
          average_quality_score: responses.reduce((sum, r) => {
            const validation = InterviewQuestionHelpers.validateResponse(r.question_number, r.response_text);
            return sum + validation.qualityScore;
          }, 0) / responses.length
        },
        key_topics_covered: [
          'Brand story and motivation',
          'Marketing channel experience',
          'Revenue goals and competitive positioning',
          'Resource constraints and success definition'
        ]
      };

      return summary;

    } catch (error) {
      logger.error('Failed to generate session summary', {
        sessionId,
        error: error.message
      });
      // Return basic summary on error
      return {
        total_responses: responses.length,
        completion_rate: 100,
        note: 'Detailed analysis will be available in your GTM report'
      };
    }
  }

  /**
   * Get all sessions for a research ID
   * @param {string} researchId - Research result ID
   * @returns {Array} List of interview sessions
   */
  async getSessionsByResearch(researchId) {
    try {
      logger.info('Getting sessions by research ID', { researchId });

      const sessions = await InterviewSession.findByResearchId(researchId);

      const sessionList = await Promise.all(sessions.map(async (session) => {
        const responses = await InterviewResponse.findBySessionId(session.id);

        return {
          session_id: session.id,
          status: session.status,
          current_question: session.current_question,
          responses_count: responses.length,
          progress_percentage: Math.round((responses.length / INTERVIEW_CONFIG.totalQuestions) * 100),
          started_at: session.started_at,
          completed_at: session.completed_at,
          duration_minutes: session.getDurationMinutes()
        };
      }));

      logger.info('Sessions retrieved by research ID', {
        researchId,
        sessionCount: sessionList.length
      });

      return formatSuccessResponse({ sessions: sessionList }, 'Sessions retrieved successfully');

    } catch (error) {
      logger.error('Failed to get sessions by research ID', {
        researchId,
        error: error.message
      });
      throw error;
    }
  }
}

module.exports = new InterviewService();