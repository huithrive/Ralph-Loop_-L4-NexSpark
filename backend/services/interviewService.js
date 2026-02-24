/**
 * Interview Service — manages interview session lifecycle
 */

const InterviewSession = require('../models/InterviewSession');
const InterviewResponse = require('../models/InterviewResponse');
const { INTERVIEW_QUESTIONS, TOTAL_QUESTIONS, getQuestion } = require('../config/interviewQuestions');
const logger = require('../utils/logger');

/**
 * Start a new interview session
 * @param {string} researchId - Associated research result ID
 * @returns {Promise<{ session_id: string, first_question: object, total_questions: number }>}
 */
async function startSession(researchId) {
  const session = await InterviewSession.create({
    research_id: researchId,
    status: 'in_progress',
    current_question: 1
  });

  const firstQuestion = getQuestion(1);

  return {
    session_id: session.id,
    first_question: firstQuestion,
    total_questions: TOTAL_QUESTIONS
  };
}

/**
 * Get the next question for a session
 * @param {string} sessionId - Session ID
 * @returns {Promise<{ question: object|null, is_complete: boolean }>}
 */
async function getNextQuestion(sessionId) {
  const session = await InterviewSession.findById(sessionId);
  if (!session) throw new Error('Session not found');

  if (session.status === 'completed') {
    return { question: null, is_complete: true };
  }

  const question = getQuestion(session.current_question);
  if (!question) {
    return { question: null, is_complete: true };
  }

  return {
    question,
    is_complete: false,
    current: session.current_question,
    total: TOTAL_QUESTIONS
  };
}

/**
 * Submit a response and advance to next question
 * @param {string} sessionId - Session ID
 * @param {number} questionNumber - Question number
 * @param {string} responseText - User's response
 * @returns {Promise<{ next_question: object|null, is_complete: boolean }>}
 */
async function submitResponse(sessionId, questionNumber, responseText) {
  const session = await InterviewSession.findById(sessionId);
  if (!session) throw new Error('Session not found');
  if (session.status === 'completed') throw new Error('Session already completed');

  const question = getQuestion(questionNumber);
  if (!question) throw new Error('Invalid question number');

  // Validate response
  const rules = question.validationRules;
  if (rules.required && (!responseText || responseText.trim().length < rules.minLength)) {
    throw new Error(`Response must be at least ${rules.minLength} characters`);
  }

  // Store response
  await InterviewResponse.create({
    session_id: sessionId,
    question_number: questionNumber,
    question_text: question.questionText,
    response_text: responseText
  });

  // Advance or complete
  const nextQuestionNumber = questionNumber + 1;
  if (nextQuestionNumber > TOTAL_QUESTIONS) {
    // All questions answered
    return { next_question: null, is_complete: true };
  }

  await InterviewSession.update(sessionId, { current_question: nextQuestionNumber });

  const nextQuestion = getQuestion(nextQuestionNumber);
  return {
    next_question: nextQuestion,
    is_complete: false,
    current: nextQuestionNumber,
    total: TOTAL_QUESTIONS
  };
}

/**
 * Complete a session (mark as completed)
 * @param {string} sessionId - Session ID
 * @returns {Promise<InterviewSession>}
 */
async function completeSession(sessionId) {
  const session = await InterviewSession.findById(sessionId);
  if (!session) throw new Error('Session not found');

  const completed = await InterviewSession.update(sessionId, {
    status: 'completed',
    completed_at: new Date().toISOString()
  });

  return completed;
}

module.exports = {
  startSession,
  getNextQuestion,
  submitResponse,
  completeSession
};
