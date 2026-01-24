/**
 * Interview Service and API Tests for NexSpark Strategist
 *
 * Tests the complete interview flow including session management,
 * question progression, response handling, and analysis generation.
 */

const request = require('supertest');
const express = require('express');
const { InterviewSession, InterviewResponse, ResearchResult } = require('../models');
const interviewService = require('../services/interviewService');
const interviewAnalysisService = require('../services/interviewAnalysisService');
const { InterviewQuestionHelpers } = require('../config/interviewQuestions');
const { connectWithRetry, closeConnection } = require('../config/database');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/strategist/interview', require('../api/strategist/interview'));

describe('Interview System Tests', () => {
  let testResearchId;
  let testSessionId;

  beforeAll(async () => {
    await connectWithRetry();

    // Create test research result
    const researchData = {
      website_url: 'https://testcompany.com',
      product_description: 'Test SaaS product for interview testing',
      market_size: { tam: '1B', sam: '100M' },
      competitors: [{ name: 'TestComp', url: 'test.com' }],
      target_audience: { demographics: 'SMB owners' },
      channels: [{ name: 'Google Ads', priority: 'high' }],
      pain_points: ['expensive tools', 'complex setup']
    };

    const research = await ResearchResult.create(researchData);
    testResearchId = research.id;

    // Create a completed interview session for analysis testing
    const sessionData = {
      research_id: testResearchId,
      status: 'completed',
      current_question: 4,
      started_at: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      completed_at: new Date()
    };

    const session = await InterviewSession.create(sessionData);
    testSessionId = session.id;

    // Create sample interview responses
    const responses = [
      {
        session_id: testSessionId,
        question_number: 1,
        question_text: 'Tell me about your brand story. What motivated you to start this business, and what problem are you solving for your customers?',
        response_text: 'I started this business because I saw small business owners struggling with expensive and complex marketing tools. Our SaaS platform provides affordable, easy-to-use marketing automation that helps them compete with larger companies. We focus on simplicity and results.'
      },
      {
        session_id: testSessionId,
        question_number: 2,
        question_text: 'What marketing channels have you tried before? What worked well, what didn\'t, and which channels are you most interested in focusing on now?',
        response_text: 'I\'ve tried Google Ads with moderate success, but struggled with Facebook ads due to complexity. Email marketing worked well for customer retention. I want to focus on Google Ads and content marketing moving forward, as they align with our technical audience.'
      },
      {
        session_id: testSessionId,
        question_number: 3,
        question_text: 'What are your revenue targets for the next 90 days? And how do you position your brand compared to competitors?',
        response_text: 'My target is $10,000 monthly recurring revenue within 90 days. We position ourselves as the affordable alternative to expensive enterprise tools, with better customer support and simpler onboarding than competitors like HubSpot or Marketo.'
      },
      {
        session_id: testSessionId,
        question_number: 4,
        question_text: 'What does success look like for you personally? And what are your biggest concerns or constraints right now?',
        response_text: 'Success means financial freedom and helping other small businesses grow. My biggest constraints are time - I can dedicate about 20 hours per week to marketing - and budget, around $1500 per month. I worry about scaling too fast and compromising quality.'
      }
    ];

    // Create all responses
    for (const responseData of responses) {
      await InterviewResponse.create(responseData);
    }
  });

  afterAll(async () => {
    // Clean up test data in correct order (foreign key constraints)
    try {
      if (testSessionId) {
        // Delete responses first, then session
        try {
          await InterviewResponse.delete(testSessionId);
        } catch (error) {
          // Ignore if responses don't exist
        }
        try {
          await InterviewSession.delete(testSessionId);
        } catch (error) {
          // Ignore if session doesn't exist
        }
      }
      if (testResearchId) {
        // Delete research last
        try {
          await ResearchResult.delete(testResearchId);
        } catch (error) {
          // Ignore if research doesn't exist
        }
      }
    } catch (error) {
      console.warn('Cleanup error:', error.message);
    }
    await closeConnection();
  });

  describe('Interview Question Configuration', () => {
    test('should load all interview questions correctly', () => {
      const questions = InterviewQuestionHelpers.getAllQuestions();
      expect(questions).toHaveLength(4);
      expect(questions[0].questionNumber).toBe(1);
      expect(questions[0].category).toBe('brand_story');
      expect(questions[0].mainQuestion).toContain('Tell me about your brand story');
    });

    test('should get specific question by number', () => {
      const question = InterviewQuestionHelpers.getQuestion(2);
      expect(question).toBeDefined();
      expect(question.questionNumber).toBe(2);
      expect(question.category).toBe('channel_experience');
    });

    test('should validate responses correctly', () => {
      const shortResponse = 'Good';
      const validResponse = 'We started this company because we saw a gap in the market for affordable project management tools that small businesses could actually use without extensive training.';

      const shortValidation = InterviewQuestionHelpers.validateResponse(1, shortResponse);
      const validValidation = InterviewQuestionHelpers.validateResponse(1, validResponse);

      expect(shortValidation.isValid).toBe(false);
      expect(shortValidation.needsFollowUp).toBe(true);

      expect(validValidation.isValid).toBe(true);
      expect(validValidation.needsFollowUp).toBe(false);
    });

    test('should determine interview completion correctly', () => {
      expect(InterviewQuestionHelpers.isComplete(4)).toBe(false);
      expect(InterviewQuestionHelpers.isComplete(5)).toBe(true);

      expect(InterviewQuestionHelpers.getNextQuestion(3)).toBe(4);
      expect(InterviewQuestionHelpers.getNextQuestion(4)).toBe(null);
    });
  });

  describe('Interview Service', () => {
    test('should start interview session successfully', async () => {
      const result = await interviewService.startSession(testResearchId);

      expect(result.success).toBe(true);
      expect(result.data.session_id).toBeDefined();
      expect(result.data.current_question).toBe(1);
      expect(result.data.total_questions).toBe(4);
      expect(result.data.question.text).toContain('Tell me about your brand story');

      testSessionId = result.data.session_id;
    });

    test('should fail to start session with invalid research ID', async () => {
      const invalidId = '550e8400-e29b-41d4-a716-446655440000';
      await expect(interviewService.startSession(invalidId))
        .rejects.toThrow();
    });

    test('should submit response successfully', async () => {
      const response = 'We started our company because we noticed that small businesses struggle with project management tools that are either too complex or too expensive. Our solution provides an intuitive, affordable alternative that teams can start using immediately without extensive training or setup.';

      const result = await interviewService.submitResponse(testSessionId, 1, response);

      expect(result.success).toBe(true);
      expect(result.data.response_id).toBeDefined();
      expect(result.data.word_count).toBeGreaterThan(30);
      expect(result.data.quality_score).toBeGreaterThan(0);
      expect(result.data.next_action).toBe('next_question');
    });

    test('should reject too short responses', async () => {
      const shortResponse = 'Good business';

      await expect(interviewService.submitResponse(testSessionId, 2, shortResponse))
        .rejects.toThrow('too short');
    });

    test('should get next question after response', async () => {
      const result = await interviewService.getNextQuestion(testSessionId);

      expect(result.success).toBe(true);
      expect(result.data.current_question).toBe(2);
      expect(result.data.question.category).toBe('channel_experience');
      expect(result.data.progress).toBe(25); // 1/4 complete
    });

    test('should handle complete interview flow', async () => {
      const responses = [
        'We have tried Facebook Ads and Google Ads. Facebook worked well for brand awareness but Google Ads gave us better conversion rates. We had a successful campaign last year that generated 50 leads in a month. Our biggest challenge has been measuring ROI accurately.',
        'Our revenue target is $50,000 in the next 90 days. Currently we are at $15,000 monthly recurring revenue. Our main competitors are Asana and Monday.com, but we differentiate by being much simpler and more affordable at $19/month per user.',
        'Success means reaching $100K ARR and having a sustainable business that lets me work with my team remotely. My biggest constraints are time - I can dedicate about 20 hours per week to marketing, and budget - comfortable spending up to $3,000 monthly on marketing if we see good returns.'
      ];

      // Submit remaining responses
      for (let i = 0; i < responses.length; i++) {
        await interviewService.submitResponse(testSessionId, i + 2, responses[i]);

        if (i < responses.length - 1) {
          await interviewService.getNextQuestion(testSessionId);
        }
      }

      // Complete the interview
      const completion = await interviewService.completeSession(testSessionId);

      expect(completion.success).toBe(true);
      expect(completion.data.status).toBe('completed');
      expect(completion.data.total_responses).toBe(4);
      expect(completion.data.summary).toBeDefined();
    });

    test('should get session status correctly', async () => {
      const result = await interviewService.getSessionStatus(testSessionId);

      expect(result.success).toBe(true);
      expect(result.data.session_id).toBe(testSessionId);
      expect(result.data.status).toBe('completed');
      expect(result.data.responses_count).toBe(4);
      expect(result.data.progress_percentage).toBe(100);
    });

    test('should get sessions by research ID', async () => {
      const result = await interviewService.getSessionsByResearch(testResearchId);

      expect(result.success).toBe(true);
      expect(result.data.sessions).toHaveLength(1);
      expect(result.data.sessions[0].session_id).toBe(testSessionId);
    });
  });

  describe('Interview Analysis Service', () => {
    test('should analyze completed interview transcript', async () => {
      const result = await interviewAnalysisService.analyzeTranscript(testSessionId);

      expect(result.success).toBe(true);
      expect(result.data.analysis).toBeDefined();
      expect(result.data.analysis.brand_positioning).toBeDefined();
      expect(result.data.analysis.resource_constraints).toBeDefined();
      expect(result.data.analysis.growth_priorities).toBeDefined();
      expect(result.data.analysis.personal_motivations).toBeDefined();
    }, 30000); // Longer timeout for Claude API call

    test('should fail to analyze non-existent session', async () => {
      const invalidId = '550e8400-e29b-41d4-a716-446655440000';
      await expect(interviewAnalysisService.analyzeTranscript(invalidId))
        .rejects.toThrow('not found');
    });

    test('should calculate interview quality correctly', async () => {
      const transcript = {
        session_metadata: {
          session_id: testSessionId,
          total_words: 300,
          average_response_length: 75
        },
        interview_qa_pairs: [
          { response_text: 'Detailed response with specific numbers like $50000 revenue and 20 hours per week', word_count: 15 },
          { response_text: 'Another detailed response mentioning our 25% growth rate', word_count: 10 },
          { response_text: 'Good response', word_count: 2 },
          { response_text: 'Very detailed response with lots of context and background information', word_count: 11 }
        ]
      };

      const service = interviewAnalysisService;
      const quality = service.calculateInterviewQuality(transcript);

      expect(quality.total_score).toBeGreaterThan(0);
      expect(quality.percentage).toBeGreaterThan(0);
      expect(['low', 'medium', 'high']).toContain(quality.level);
    });
  });

  describe('Interview API Endpoints', () => {
    let apiSessionId;

    test('POST /api/strategist/interview/start should start session', async () => {
      const response = await request(app)
        .post('/api/strategist/interview/start')
        .send({ research_id: testResearchId })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.session_id).toBeDefined();
      apiSessionId = response.body.data.session_id;
    });

    test('POST /api/strategist/interview/start should validate research_id', async () => {
      await request(app)
        .post('/api/strategist/interview/start')
        .send({ research_id: 'invalid-id' })
        .expect(400);

      await request(app)
        .post('/api/strategist/interview/start')
        .send({})
        .expect(400);
    });

    test('POST /api/strategist/interview/:sessionId/respond should accept valid response', async () => {
      const response = await request(app)
        .post(`/api/strategist/interview/${apiSessionId}/respond`)
        .send({
          question_number: 1,
          response_text: 'Our company was founded to solve the project management crisis facing small businesses. Existing tools are either too complex like Jira or too expensive like Enterprise solutions. We provide a middle ground that teams can adopt quickly.'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.response_id).toBeDefined();
    });

    test('POST /api/strategist/interview/:sessionId/respond should validate response length', async () => {
      await request(app)
        .post(`/api/strategist/interview/${apiSessionId}/respond`)
        .send({
          question_number: 2,
          response_text: 'Too short'
        })
        .expect(400);
    });

    test('GET /api/strategist/interview/:sessionId/next should get next question', async () => {
      const response = await request(app)
        .get(`/api/strategist/interview/${apiSessionId}/next`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.current_question).toBe(2);
    });

    test('GET /api/strategist/interview/:sessionId should get session status', async () => {
      const response = await request(app)
        .get(`/api/strategist/interview/${apiSessionId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.session_id).toBe(apiSessionId);
      expect(response.body.data.status).toBe('in_progress');
    });

    test('GET /api/strategist/interview/research/:researchId should get sessions', async () => {
      const response = await request(app)
        .get(`/api/strategist/interview/research/${testResearchId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.sessions.length).toBeGreaterThan(0);
    });

    test('should handle 404 for non-existent session', async () => {
      const invalidId = '550e8400-e29b-41d4-a716-446655440000';
      await request(app)
        .get(`/api/strategist/interview/${invalidId}`)
        .expect(404);
    });

    // Clean up API session
    afterAll(async () => {
      if (apiSessionId) {
        try {
          await InterviewResponse.delete(apiSessionId);
          await InterviewSession.delete(apiSessionId);
        } catch (error) {
          // Ignore cleanup errors in tests
        }
      }
    });
  });

  describe('Error Handling', () => {
    test('should handle database connection errors gracefully', async () => {
      // Mock a database error
      const originalFindById = InterviewSession.findById;
      InterviewSession.findById = jest.fn().mockRejectedValue(new Error('Database connection failed'));

      await expect(interviewService.getSessionStatus('test-id'))
        .rejects.toThrow('Database connection failed');

      // Restore original method
      InterviewSession.findById = originalFindById;
    });

    test('should handle invalid session states', async () => {
      // Try to complete an already completed session
      await expect(interviewService.completeSession(testSessionId))
        .rejects.toThrow('already completed');
    });

    test('should validate question numbers', async () => {
      // Try to submit response for invalid question number
      await expect(interviewService.submitResponse(testSessionId, 5, 'Valid response text'))
        .rejects.toThrow();
    });
  });
});