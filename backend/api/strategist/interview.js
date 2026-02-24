/**
 * Interview API endpoints
 * POST /api/strategist/interview/start
 * POST /api/strategist/interview/respond
 * POST /api/strategist/interview/complete
 */

const express = require('express');
const router = express.Router();
const interviewService = require('../../services/interviewService');
const { analyzeTranscript } = require('../../services/interviewAnalysisService');
const logger = require('../../utils/logger');

/**
 * POST /start — Start a new interview session
 */
router.post('/start', async (req, res) => {
  try {
    const { research_id } = req.body;
    if (!research_id) {
      return res.status(400).json({ success: false, error: 'research_id is required' });
    }

    const result = await interviewService.startSession(research_id);
    res.json({ success: true, ...result });
  } catch (error) {
    logger.error('Interview start error', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /respond — Submit a response to a question
 */
router.post('/respond', async (req, res) => {
  try {
    const { session_id, question_number, response_text } = req.body;

    if (!session_id || !question_number || !response_text) {
      return res.status(400).json({
        success: false,
        error: 'session_id, question_number, and response_text are required'
      });
    }

    const result = await interviewService.submitResponse(session_id, question_number, response_text);
    res.json({ success: true, ...result });
  } catch (error) {
    logger.error('Interview respond error', error);
    const status = error.message.includes('not found') ? 404 : 400;
    res.status(status).json({ success: false, error: error.message });
  }
});

/**
 * POST /complete — Complete session and trigger analysis
 */
router.post('/complete', async (req, res) => {
  try {
    const { session_id } = req.body;
    if (!session_id) {
      return res.status(400).json({ success: false, error: 'session_id is required' });
    }

    const result = await analyzeTranscript(session_id);
    res.json({ success: true, ...result });
  } catch (error) {
    logger.error('Interview complete error', error);
    const status = error.message.includes('not found') ? 404 : 500;
    res.status(status).json({ success: false, error: error.message });
  }
});

module.exports = router;
