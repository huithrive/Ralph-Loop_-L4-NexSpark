/**
 * Tests for Interview API
 */

jest.mock('../../config/database', () => ({
  query: jest.fn(),
  connectWithRetry: jest.fn(),
  healthCheck: jest.fn(),
  closeConnection: jest.fn()
}));

jest.mock('../../services/claudeService', () => ({
  callClaudeForJSON: jest.fn(),
  callClaude: jest.fn(),
  getRateLimitStatus: jest.fn(),
  DEFAULT_OPTIONS: {}
}));

jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

jest.mock('uuid', () => ({ v4: () => 'test-session-uuid' }));

const { query } = require('../../config/database');
const { callClaudeForJSON } = require('../../services/claudeService');

describe('interviewQuestions', () => {
  const { INTERVIEW_QUESTIONS, TOTAL_QUESTIONS, getQuestion } = require('../../config/interviewQuestions');

  test('has 4 questions', () => {
    expect(TOTAL_QUESTIONS).toBe(4);
    expect(INTERVIEW_QUESTIONS).toHaveLength(4);
  });

  test('each question has required fields', () => {
    INTERVIEW_QUESTIONS.forEach(q => {
      expect(q.questionText).toBeTruthy();
      expect(q.followUpPrompts).toBeInstanceOf(Array);
      expect(q.validationRules).toBeDefined();
      expect(q.validationRules.required).toBe(true);
    });
  });

  test('getQuestion returns correct question', () => {
    expect(getQuestion(1).questionNumber).toBe(1);
    expect(getQuestion(5)).toBeNull();
  });
});

describe('interviewService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('startSession creates session and returns first question', async () => {
    const sessionRow = {
      id: 'test-session-uuid',
      research_id: 'res-123',
      status: 'in_progress',
      current_question: 1,
      analysis: null,
      started_at: new Date().toISOString(),
      completed_at: null
    };
    query.mockResolvedValueOnce({ rows: [sessionRow] });

    const { startSession } = require('../../services/interviewService');
    const result = await startSession('res-123');

    expect(result.session_id).toBe('test-session-uuid');
    expect(result.first_question.questionNumber).toBe(1);
    expect(result.total_questions).toBe(4);
  });

  test('submitResponse stores response and advances', async () => {
    // findById
    query.mockResolvedValueOnce({
      rows: [{
        id: 'sess-1', research_id: 'res-1', status: 'in_progress',
        current_question: 1, analysis: null, started_at: new Date().toISOString()
      }]
    });
    // InterviewResponse.create
    query.mockResolvedValueOnce({
      rows: [{
        id: 'resp-1', session_id: 'sess-1', question_number: 1,
        question_text: 'Q1', response_text: 'My detailed answer here about brand identity',
        created_at: new Date().toISOString()
      }]
    });
    // InterviewSession.update
    query.mockResolvedValueOnce({
      rows: [{
        id: 'sess-1', research_id: 'res-1', status: 'in_progress',
        current_question: 2, analysis: null
      }]
    });

    const { submitResponse } = require('../../services/interviewService');
    const result = await submitResponse('sess-1', 1, 'My detailed answer here about brand identity');
    expect(result.is_complete).toBe(false);
    expect(result.next_question.questionNumber).toBe(2);
  });
});

describe('interviewAnalysisService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('analyzeTranscript calls Claude and stores analysis', async () => {
    // findById
    query.mockResolvedValueOnce({
      rows: [{
        id: 'sess-1', research_id: 'res-1', status: 'in_progress',
        current_question: 4, analysis: null
      }]
    });
    // getSessionTranscript (findBySessionId)
    query.mockResolvedValueOnce({
      rows: [
        { id: 'r1', session_id: 'sess-1', question_number: 1, question_text: 'Q1', response_text: 'A1' },
        { id: 'r2', session_id: 'sess-1', question_number: 2, question_text: 'Q2', response_text: 'A2' }
      ]
    });

    const analysisData = {
      brand_summary: 'A test brand',
      channel_preferences: { current: [], recommended: [], avoid: [] },
      growth_priorities: [],
      strategic_insights: ['insight1']
    };

    callClaudeForJSON.mockResolvedValueOnce({
      success: true,
      content: JSON.stringify(analysisData)
    });

    // InterviewSession.complete
    query.mockResolvedValueOnce({
      rows: [{
        id: 'sess-1', status: 'completed', analysis: analysisData,
        completed_at: new Date().toISOString()
      }]
    });

    const { analyzeTranscript } = require('../../services/interviewAnalysisService');
    const result = await analyzeTranscript('sess-1');
    expect(result.session_id).toBe('sess-1');
    expect(result.analysis.brand_summary).toBe('A test brand');
    expect(callClaudeForJSON).toHaveBeenCalled();
  });
});
