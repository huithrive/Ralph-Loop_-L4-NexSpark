/**
 * Interview API Routes for NexSpark Strategist
 *
 * HTTP endpoints for conducting AI-powered interviews to gather
 * brand insights, marketing history, and strategic constraints.
 */

const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const interviewService = require('../../services/interviewService');
const { ResearchResult } = require('../../models');
const logger = require('../../utils/logger');
const { error: formatErrorResponse } = require('../../utils/responseFormatter');

const router = express.Router();

/**
 * Validation middleware to check for validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation errors in interview API', {
      path: req.path,
      method: req.method,
      errors: errors.array()
    });
    return res.status(400).json(formatErrorResponse(
      'Validation failed',
      400,
      'VALIDATION_ERROR',
      errors.array()
    ));
  }
  next();
};

/**
 * POST /api/strategist/interview/start
 * Start a new interview session
 */
router.post('/start',
  [
    body('research_id')
      .isUUID()
      .withMessage('Research ID must be a valid UUID'),
    body('research_id')
      .notEmpty()
      .withMessage('Research ID is required')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { research_id } = req.body;
      const startTime = Date.now();

      logger.info('Starting interview session request', { research_id });

      // Verify research result exists
      const research = await ResearchResult.findById(research_id);
      if (!research) {
        return res.status(404).json(formatErrorResponse(
          'Research result not found',
          404,
          'RESEARCH_NOT_FOUND',
          { research_id }
        ));
      }

      // Start interview session
      const result = await interviewService.startSession(research_id);

      const duration = Date.now() - startTime;
      logger.info('Interview session started successfully', {
        research_id,
        session_id: result.data.session_id,
        duration
      });

      res.status(201).json(result);

    } catch (error) {
      logger.error('Failed to start interview session', {
        research_id: req.body.research_id,
        error: error.message,
        stack: error.stack
      });

      if (error.message.includes('Research ID is required')) {
        return res.status(400).json(formatErrorResponse(
          error.message,
          400,
          'VALIDATION_ERROR'
        ));
      }

      res.status(500).json(formatErrorResponse(
        'Failed to start interview session',
        500,
        'INTERVIEW_START_ERROR',
        { error: error.message }
      ));
    }
  }
);

/**
 * POST /api/strategist/interview/:sessionId/respond
 * Submit a response to the current interview question
 */
router.post('/:sessionId/respond',
  [
    param('sessionId')
      .isUUID()
      .withMessage('Session ID must be a valid UUID'),
    body('question_number')
      .isInt({ min: 1, max: 4 })
      .withMessage('Question number must be between 1 and 4'),
    body('response_text')
      .isString()
      .trim()
      .isLength({ min: 10, max: 5000 })
      .withMessage('Response text must be between 10 and 5000 characters'),
    body('response_text')
      .notEmpty()
      .withMessage('Response text is required')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { question_number, response_text } = req.body;
      const startTime = Date.now();

      logger.info('Submitting interview response', {
        sessionId,
        question_number,
        response_length: response_text.length
      });

      const result = await interviewService.submitResponse(
        sessionId,
        question_number,
        response_text
      );

      const duration = Date.now() - startTime;
      logger.info('Interview response submitted successfully', {
        sessionId,
        question_number,
        response_id: result.data.response_id,
        duration
      });

      res.status(200).json(result);

    } catch (error) {
      logger.error('Failed to submit interview response', {
        sessionId: req.params.sessionId,
        question_number: req.body.question_number,
        error: error.message
      });

      if (error.message.includes('not found')) {
        return res.status(404).json(formatErrorResponse(
          error.message,
          404,
          'SESSION_NOT_FOUND'
        ));
      }

      if (error.message.includes('not active') || error.message.includes('Invalid question')) {
        return res.status(400).json(formatErrorResponse(
          error.message,
          400,
          'INVALID_SESSION_STATE'
        ));
      }

      if (error.message.includes('too short') || error.message.includes('too long')) {
        return res.status(400).json(formatErrorResponse(
          error.message,
          400,
          'INVALID_RESPONSE'
        ));
      }

      res.status(500).json(formatErrorResponse(
        'Failed to submit response',
        500,
        'RESPONSE_SUBMISSION_ERROR',
        { error: error.message }
      ));
    }
  }
);

/**
 * GET /api/strategist/interview/:sessionId/next
 * Get the next question in the interview sequence
 */
router.get('/:sessionId/next',
  [
    param('sessionId')
      .isUUID()
      .withMessage('Session ID must be a valid UUID')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      const startTime = Date.now();

      logger.info('Getting next interview question', { sessionId });

      const result = await interviewService.getNextQuestion(sessionId);

      const duration = Date.now() - startTime;
      logger.info('Next interview question retrieved', {
        sessionId,
        status: result.data?.status || result.status,
        duration
      });

      res.status(200).json(result);

    } catch (error) {
      logger.error('Failed to get next interview question', {
        sessionId: req.params.sessionId,
        error: error.message
      });

      if (error.message.includes('not found')) {
        return res.status(404).json(formatErrorResponse(
          error.message,
          404,
          'SESSION_NOT_FOUND'
        ));
      }

      if (error.message.includes('not active')) {
        return res.status(400).json(formatErrorResponse(
          error.message,
          400,
          'INVALID_SESSION_STATE'
        ));
      }

      res.status(500).json(formatErrorResponse(
        'Failed to get next question',
        500,
        'NEXT_QUESTION_ERROR',
        { error: error.message }
      ));
    }
  }
);

/**
 * POST /api/strategist/interview/:sessionId/complete
 * Complete an interview session and trigger analysis
 */
router.post('/:sessionId/complete',
  [
    param('sessionId')
      .isUUID()
      .withMessage('Session ID must be a valid UUID')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      const startTime = Date.now();

      logger.info('Completing interview session', { sessionId });

      const result = await interviewService.completeSession(sessionId);

      const duration = Date.now() - startTime;
      logger.info('Interview session completed successfully', {
        sessionId,
        duration_minutes: result.data.duration_minutes,
        total_responses: result.data.total_responses,
        duration
      });

      res.status(200).json(result);

    } catch (error) {
      logger.error('Failed to complete interview session', {
        sessionId: req.params.sessionId,
        error: error.message
      });

      if (error.message.includes('not found')) {
        return res.status(404).json(formatErrorResponse(
          error.message,
          404,
          'SESSION_NOT_FOUND'
        ));
      }

      if (error.message.includes('already completed') || error.message.includes('incomplete')) {
        return res.status(400).json(formatErrorResponse(
          error.message,
          400,
          'INVALID_SESSION_STATE'
        ));
      }

      res.status(500).json(formatErrorResponse(
        'Failed to complete interview session',
        500,
        'COMPLETION_ERROR',
        { error: error.message }
      ));
    }
  }
);

/**
 * GET /api/strategist/interview/:sessionId
 * Get interview session status and details
 */
router.get('/:sessionId',
  [
    param('sessionId')
      .isUUID()
      .withMessage('Session ID must be a valid UUID')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      const startTime = Date.now();

      logger.info('Getting interview session status', { sessionId });

      const result = await interviewService.getSessionStatus(sessionId);

      const duration = Date.now() - startTime;
      logger.info('Interview session status retrieved', {
        sessionId,
        status: result.data.status,
        progress: result.data.progress_percentage,
        duration
      });

      res.status(200).json(result);

    } catch (error) {
      logger.error('Failed to get interview session status', {
        sessionId: req.params.sessionId,
        error: error.message
      });

      if (error.message.includes('not found')) {
        return res.status(404).json(formatErrorResponse(
          error.message,
          404,
          'SESSION_NOT_FOUND'
        ));
      }

      res.status(500).json(formatErrorResponse(
        'Failed to get session status',
        500,
        'SESSION_STATUS_ERROR',
        { error: error.message }
      ));
    }
  }
);

/**
 * GET /api/strategist/interview/research/:researchId
 * Get all interview sessions for a research result
 */
router.get('/research/:researchId',
  [
    param('researchId')
      .isUUID()
      .withMessage('Research ID must be a valid UUID')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { researchId } = req.params;
      const startTime = Date.now();

      logger.info('Getting interview sessions for research', { researchId });

      // Verify research exists
      const research = await ResearchResult.findById(researchId);
      if (!research) {
        return res.status(404).json(formatErrorResponse(
          'Research result not found',
          'RESEARCH_NOT_FOUND',
          { research_id: researchId }
        ));
      }

      const result = await interviewService.getSessionsByResearch(researchId);

      const duration = Date.now() - startTime;
      logger.info('Interview sessions retrieved for research', {
        researchId,
        session_count: result.data.sessions.length,
        duration
      });

      res.status(200).json(result);

    } catch (error) {
      logger.error('Failed to get interview sessions for research', {
        researchId: req.params.researchId,
        error: error.message
      });

      res.status(500).json(formatErrorResponse(
        'Failed to get interview sessions',
        500,
        'SESSIONS_RETRIEVAL_ERROR',
        { error: error.message }
      ));
    }
  }
);

/**
 * Error handling middleware for this router
 */
router.use((error, req, res, next) => {
  logger.error('Interview API error', {
    path: req.path,
    method: req.method,
    error: error.message,
    stack: error.stack
  });

  res.status(500).json(formatErrorResponse(
    'Internal server error in interview API',
    500,
    'INTERVIEW_API_ERROR',
    { error: error.message }
  ));
});

module.exports = router;