const ResearchResult = require('../models/ResearchResult');
const InterviewSession = require('../models/InterviewSession');
const InterviewResponse = require('../models/InterviewResponse');
const GTMReport = require('../models/GTMReport');
const { query } = require('../config/database');

// Mock the database
jest.mock('../config/database');

describe('Database Models', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ResearchResult Model', () => {
    test('should create research result with valid data', async () => {
      const mockData = {
        website_url: 'https://example.com',
        product_description: 'A great product',
        market_size: { tam: 1000000 },
        competitors: [{ name: 'Competitor 1' }],
        target_audience: { age: '25-35' },
        channels: ['social', 'email'],
        pain_points: ['Problem 1', 'Problem 2']
      };

      query.mockResolvedValue({
        rows: [{
          id: 'test-id',
          ...mockData,
          created_at: new Date().toISOString()
        }]
      });

      const result = await ResearchResult.create(mockData);

      expect(result).toBeInstanceOf(ResearchResult);
      expect(result.website_url).toBe(mockData.website_url);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO research_results'),
        expect.arrayContaining([
          expect.any(String), // UUID
          mockData.website_url,
          mockData.product_description,
          JSON.stringify(mockData.market_size),
          JSON.stringify(mockData.competitors),
          JSON.stringify(mockData.target_audience),
          JSON.stringify(mockData.channels),
          JSON.stringify(mockData.pain_points),
          undefined // raw_response
        ])
      );
    });

    test('should find research result by ID', async () => {
      const mockRow = {
        id: 'test-id',
        website_url: 'https://example.com',
        product_description: 'Test product',
        market_size: '{"tam": 1000000}',
        competitors: '[{"name": "Test"}]',
        target_audience: '{"age": "25-35"}',
        channels: '["social"]',
        pain_points: '["Problem 1"]',
        created_at: new Date().toISOString()
      };

      query.mockResolvedValue({ rows: [mockRow] });

      const result = await ResearchResult.findById('test-id');

      expect(result).toBeInstanceOf(ResearchResult);
      expect(result.id).toBe('test-id');
      expect(result.market_size).toEqual({ tam: 1000000 });
      expect(query).toHaveBeenCalledWith(
        'SELECT * FROM research_results WHERE id = $1',
        ['test-id']
      );
    });

    test('should return null when research result not found', async () => {
      query.mockResolvedValue({ rows: [] });

      const result = await ResearchResult.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('InterviewSession Model', () => {
    test('should create interview session', async () => {
      const mockData = {
        research_id: 'research-id',
        status: 'in_progress',
        current_question: 1
      };

      query.mockResolvedValue({
        rows: [{
          id: 'session-id',
          ...mockData,
          started_at: new Date().toISOString()
        }]
      });

      const result = await InterviewSession.create(mockData);

      expect(result).toBeInstanceOf(InterviewSession);
      expect(result.research_id).toBe(mockData.research_id);
      expect(result.status).toBe(mockData.status);
    });

    test('should advance to next question', async () => {
      const mockUpdatedSession = {
        id: 'session-id',
        research_id: 'research-id',
        status: 'in_progress',
        current_question: 2,
        started_at: new Date().toISOString()
      };

      query.mockResolvedValue({ rows: [mockUpdatedSession] });

      const result = await InterviewSession.advanceQuestion('session-id');

      expect(result.current_question).toBe(2);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE interview_sessions'),
        ['session-id']
      );
    });
  });

  describe('InterviewResponse Model', () => {
    test('should create interview response', async () => {
      const mockData = {
        session_id: 'session-id',
        question_number: 1,
        question_text: 'What is your business?',
        response_text: 'We sell widgets'
      };

      query.mockResolvedValue({
        rows: [{
          id: 'response-id',
          ...mockData,
          created_at: new Date().toISOString()
        }]
      });

      const result = await InterviewResponse.create(mockData);

      expect(result).toBeInstanceOf(InterviewResponse);
      expect(result.session_id).toBe(mockData.session_id);
      expect(result.question_number).toBe(mockData.question_number);
    });

    test('should calculate word count correctly', () => {
      const response = new InterviewResponse({
        response_text: 'This is a test response with seven words'
      });

      expect(response.getWordCount()).toBe(8);
    });

    test('should detect empty responses', () => {
      const emptyResponse = new InterviewResponse({
        response_text: ''
      });

      const nonEmptyResponse = new InterviewResponse({
        response_text: 'Not empty'
      });

      expect(emptyResponse.isEmpty()).toBe(true);
      expect(nonEmptyResponse.isEmpty()).toBe(false);
    });
  });

  describe('GTMReport Model', () => {
    test('should create GTM report', async () => {
      const mockData = {
        research_id: 'research-id',
        interview_session_id: 'session-id',
        report_data: {
          executiveSummary: { content: 'Executive summary' },
          marketAnalysis: { content: 'Market analysis' }
        },
        status: 'draft'
      };

      query.mockResolvedValue({
        rows: [{
          id: 'report-id',
          ...mockData,
          report_data: JSON.stringify(mockData.report_data),
          created_at: new Date().toISOString()
        }]
      });

      const result = await GTMReport.create(mockData);

      expect(result).toBeInstanceOf(GTMReport);
      expect(result.research_id).toBe(mockData.research_id);
      expect(result.status).toBe(mockData.status);
    });

    test('should calculate completion percentage', () => {
      const partialReport = new GTMReport({
        report_data: {
          executiveSummary: { content: 'Summary' },
          marketAnalysis: { content: 'Analysis' },
          targetAudience: null,
          competitiveLandscape: null,
          channelStrategy: null,
          actionPlan: null,
          kpisMetrics: null
        }
      });

      // Should be 2/7 = ~28.57% = 29% (rounded)
      expect(partialReport.getCompletionPercentage()).toBe(29);
    });

    test('should detect if report is complete', () => {
      const incompleteReport = new GTMReport({
        report_data: {
          executiveSummary: { content: 'Summary' },
          marketAnalysis: null
        }
      });

      const completeReport = new GTMReport({
        report_data: {
          executiveSummary: { content: 'Summary' },
          marketAnalysis: { content: 'Analysis' },
          targetAudience: { content: 'Audience' },
          competitiveLandscape: { content: 'Competition' },
          channelStrategy: { content: 'Channels' },
          actionPlan: { content: 'Plan' },
          kpisMetrics: { content: 'KPIs' }
        }
      });

      expect(incompleteReport.isComplete()).toBe(false);
      expect(completeReport.isComplete()).toBe(true);
    });
  });
});