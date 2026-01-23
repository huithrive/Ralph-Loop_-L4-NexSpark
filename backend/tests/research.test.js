const request = require('supertest');
const express = require('express');
const researchRoutes = require('../api/strategist/research');
const {
  conductResearch,
  getResearchResult,
  getRecentResearch,
  deleteResearchResult
} = require('../services/researchService');
const { callClaudeForJSON } = require('../services/claudeService');
const ResearchResult = require('../models/ResearchResult');

// Mock dependencies
jest.mock('../services/claudeService');
jest.mock('../models/ResearchResult');
jest.mock('../services/researchService');

describe('Research API Endpoints', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/strategist', researchRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/strategist/research', () => {
    const validRequest = {
      website_url: 'https://example.com',
      product_description: 'A great product that solves customer problems effectively'
    };

    const mockResearchResult = {
      research_id: 'test-research-id',
      status: 'completed',
      cached: false,
      data: {
        id: 'test-research-id',
        website_url: 'https://example.com',
        marketSize: {
          tam: '$10B',
          sam: '$1B',
          growthRate: '15%',
          trends: ['Trend 1', 'Trend 2']
        },
        competitors: [
          {
            name: 'Competitor 1',
            website: 'https://competitor1.com',
            positioning: 'Market leader',
            strengths: ['Strong brand'],
            weaknesses: ['High prices']
          }
        ],
        channels: [
          {
            channel: 'Google Ads',
            priority: 'high',
            rationale: 'High intent traffic',
            estimatedCPA: '$50',
            expectedROAS: '4:1'
          }
        ]
      },
      duration: 5000,
      usage: { input_tokens: 100, output_tokens: 200 },
      metrics: {
        competitorsCount: 1,
        channelsCount: 1,
        hasMarketSize: true
      }
    };

    test('should conduct research successfully with valid input', async () => {
      conductResearch.mockResolvedValue(mockResearchResult);

      const response = await request(app)
        .post('/api/strategist/research')
        .send(validRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.research_id).toBe('test-research-id');
      expect(response.body.data.status).toBe('completed');
      expect(response.body.data.cached).toBe(false);
      expect(response.body.metadata.processing.duration).toBeDefined();

      expect(conductResearch).toHaveBeenCalledWith(
        validRequest.website_url,
        validRequest.product_description
      );
    });

    test('should return cached result when available', async () => {
      const cachedResult = { ...mockResearchResult, cached: true };
      conductResearch.mockResolvedValue(cachedResult);

      const response = await request(app)
        .post('/api/strategist/research')
        .send(validRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.cached).toBe(true);
    });

    test('should return 400 for missing website_url', async () => {
      const invalidRequest = {
        product_description: 'A great product'
      };

      const response = await request(app)
        .post('/api/strategist/research')
        .send(invalidRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details.validationErrors[0]).toContain('website_url');
    });

    test('should return 400 for invalid URL', async () => {
      const invalidRequest = {
        website_url: 'not-a-valid-url',
        product_description: 'A great product that solves customer problems'
      };

      const response = await request(app)
        .post('/api/strategist/research')
        .send(invalidRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('should return 400 for short product description', async () => {
      const invalidRequest = {
        website_url: 'https://example.com',
        product_description: 'Short'
      };

      const response = await request(app)
        .post('/api/strategist/research')
        .send(invalidRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('should handle rate limit errors', async () => {
      conductResearch.mockRejectedValue(new Error('Rate limit exceeded'));

      const response = await request(app)
        .post('/api/strategist/research')
        .send(validRequest)
        .expect(429);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('RATE_LIMIT');
    });

    test('should handle API errors', async () => {
      conductResearch.mockRejectedValue(new Error('API key invalid'));

      const response = await request(app)
        .post('/api/strategist/research')
        .send(validRequest)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('API_ERROR');
    });

    test('should handle generic research errors', async () => {
      conductResearch.mockRejectedValue(new Error('Unexpected error'));

      const response = await request(app)
        .post('/api/strategist/research')
        .send(validRequest)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('RESEARCH_ERROR');
    });
  });

  describe('GET /api/strategist/research/:id', () => {
    const mockResult = {
      research_id: 'test-id',
      data: {
        id: 'test-id',
        website_url: 'https://example.com',
        product_description: 'Test product',
        marketSize: { tam: '$10B' },
        competitors: []
      },
      created_at: '2026-01-23T10:00:00Z'
    };

    test('should get research result by ID', async () => {
      getResearchResult.mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/api/strategist/research/test-id')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.research_id).toBe('test-id');

      expect(getResearchResult).toHaveBeenCalledWith('test-id');
    });

    test('should return 404 when research not found', async () => {
      getResearchResult.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/strategist/research/non-existent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    test('should handle missing ID in route', async () => {
      const response = await request(app)
        .get('/api/strategist/research/')
        .expect(500); // The route matches but encounters error

      expect(response.body.success).toBe(false);
    });

    test('should handle service errors', async () => {
      getResearchResult.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/strategist/research/test-id')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('RETRIEVAL_ERROR');
    });
  });

  describe('GET /api/strategist/research', () => {
    test('should get recent research results with pagination', async () => {
      const mockResults = {
        results: [
          {
            research_id: 'test-1',
            website_url: 'https://example1.com',
            created_at: '2026-01-23T10:00:00Z',
            summary: { competitors_count: 5 }
          },
          {
            research_id: 'test-2',
            website_url: 'https://example2.com',
            created_at: '2026-01-23T09:00:00Z',
            summary: { competitors_count: 3 }
          }
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          pages: 1
        }
      };

      getRecentResearch.mockResolvedValue(mockResults);

      const response = await request(app)
        .get('/api/strategist/research')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.metadata.pagination).toBeDefined();
    });

    test('should handle pagination parameters', async () => {
      getRecentResearch.mockResolvedValue({
        results: [],
        pagination: { page: 2, limit: 10, total: 0, pages: 0 }
      });

      await request(app)
        .get('/api/strategist/research?page=2&limit=10')
        .expect(200);

      expect(getRecentResearch).toHaveBeenCalledWith(2, 10);
    });
  });

  describe('DELETE /api/strategist/research/:id', () => {
    test('should delete research result successfully', async () => {
      deleteResearchResult.mockResolvedValue(true);

      const response = await request(app)
        .delete('/api/strategist/research/test-id')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.deleted).toBe(true);

      expect(deleteResearchResult).toHaveBeenCalledWith('test-id');
    });

    test('should return 404 when research not found for deletion', async () => {
      deleteResearchResult.mockResolvedValue(false);

      const response = await request(app)
        .delete('/api/strategist/research/non-existent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });
});