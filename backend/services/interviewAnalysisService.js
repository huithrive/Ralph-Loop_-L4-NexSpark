/**
 * Interview Analysis Service — analyzes completed interview transcripts via Claude
 */

const InterviewSession = require('../models/InterviewSession');
const InterviewResponse = require('../models/InterviewResponse');
const { callClaudeForJSON } = require('./claudeService');
const logger = require('../utils/logger');

const ANALYSIS_SYSTEM_PROMPT = `You are a senior marketing strategist analyzing interview responses from a business owner.
Extract and return a JSON object with:
{
  "brand_summary": "2-3 sentence summary of the brand identity and positioning",
  "channel_preferences": {
    "current": ["channels currently used"],
    "recommended": ["channels to add or prioritize"],
    "avoid": ["channels to deprioritize"]
  },
  "growth_priorities": [
    { "priority": "Description", "impact": "high|medium|low", "timeframe": "immediate|short_term|long_term" }
  ],
  "strategic_insights": [
    "Key insight 1",
    "Key insight 2",
    "Key insight 3"
  ],
  "risk_factors": ["risk1", "risk2"],
  "recommended_budget_split": {
    "acquisition": 0.0,
    "retention": 0.0,
    "brand": 0.0
  }
}
Return ONLY valid JSON.`;

/**
 * Analyze a completed interview session
 * @param {string} sessionId - Session ID
 * @returns {Promise<{ session_id: string, analysis: object, summary: string }>}
 */
async function analyzeTranscript(sessionId) {
  const session = await InterviewSession.findById(sessionId);
  if (!session) throw new Error('Session not found');

  // Get transcript
  const transcript = await InterviewResponse.getSessionTranscript(sessionId);
  if (!transcript) throw new Error('No responses found for this session');

  // Call Claude for analysis
  const response = await callClaudeForJSON(
    ANALYSIS_SYSTEM_PROMPT,
    `Analyze the following interview transcript:\n\n${transcript}`,
    { max_tokens: 4000, temperature: 0.3 }
  );

  const analysis = typeof response.content === 'string' ? JSON.parse(response.content) : response.content;

  // Store analysis on session
  await InterviewSession.complete(sessionId, analysis);

  logger.info('Interview analysis completed', { sessionId });

  return {
    session_id: sessionId,
    analysis,
    summary: analysis.brand_summary || ''
  };
}

module.exports = { analyzeTranscript };
