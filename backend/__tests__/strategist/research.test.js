/**
 * Tests for Deep Research API
 */

// Mock dependencies before requiring modules
jest.mock('../../services/claudeService', () => ({
  callClaudeForJSON: jest.fn(),
  callClaude: jest.fn(),
  getRateLimitStatus: jest.fn(),
  DEFAULT_OPTIONS: {}
}));

jest.mock('../../config/database', () => ({
  query: jest.fn(),
  connectWithRetry: jest.fn(),
  healthCheck: jest.fn(),
  closeConnection: jest.fn()
}));

jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

jest.mock('uuid', () => ({ v4: () => 'test-uuid-1234' }));

const { validateResearchInput } = require('../../validators/researchValidator');
const { callClaudeForJSON } = require('../../services/claudeService');
const { query } = require('../../config/database');

describe('Research Validator', () => {
  test('valid input passes', () => {
    const result = validateResearchInput({
      website_url: 'https://example.com',
      product_description: 'A great product that solves problems'
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('invalid URL fails', () => {
    const result = validateResearchInput({
      website_url: 'not-a-url',
      product_description: 'A great product that solves problems'
    });
    expect(result.valid).toBe(false);
    expect(result.errors[0].field).toBe('website_url');
  });

  test('missing fields fails', () => {
    const result = validateResearchInput({});
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBe(2);
  });

  test('short description fails', () => {
    const result = validateResearchInput({
      website_url: 'https://example.com',
      product_description: 'Short'
    });
    expect(result.valid).toBe(false);
    expect(result.errors[0].field).toBe('product_description');
  });
});

describe('conductResearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns cached result when available', async () => {
    const cachedRow = {
      id: 'cached-id',
      website_url: 'https://example.com',
      product_description: 'test desc longer than ten',
      market_size: { tam: '$1B' },
      competitors: [],
      target_audience: {},
      channels: [],
      pain_points: [],
      raw_response: '{}',
      created_at: new Date().toISOString(),
      updated_at: null
    };

    // findRecentByUrl query
    query.mockResolvedValueOnce({ rows: [cachedRow] });

    const { conductResearch } = require('../../services/strategist/researchService');
    const result = await conductResearch('https://example.com', 'test desc longer than ten');
    expect(result.cached).toBe(true);
    expect(result.research_id).toBe('cached-id');
  });

  test('calls Claude on cache miss', async () => {
    // findRecentByUrl returns nothing
    query.mockResolvedValueOnce({ rows: [] });

    // Claude response
    callClaudeForJSON.mockResolvedValueOnce({
      success: true,
      content: JSON.stringify({
        marketSize: { tam: '$500M', sam: '$100M', growthRate: '15%', trends: [] },
        competitors: [],
        targetAudience: { primary: { demographics: {}, psychographics: {} }, secondary: {} },
        channels: [],
        painPoints: [],
        opportunities: [],
        threats: [],
        recommendations: { immediate: [], shortTerm: [], longTerm: [] }
      })
    });

    // ResearchResult.create INSERT query
    const insertedRow = {
      id: 'test-uuid-1234',
      website_url: 'https://example.com',
      product_description: 'A valid product description here',
      market_size: JSON.stringify({ tam: '$500M' }),
      competitors: '[]',
      target_audience: '{}',
      channels: '[]',
      pain_points: '[]',
      raw_response: '{}',
      created_at: new Date().toISOString()
    };
    query.mockResolvedValueOnce({ rows: [insertedRow] });

    const { conductResearch } = require('../../services/strategist/researchService');
    const result = await conductResearch('https://example.com', 'A valid product description here');
    expect(result.cached).toBe(false);
    expect(callClaudeForJSON).toHaveBeenCalled();
  });

  test('throws on validation error', async () => {
    const { conductResearch } = require('../../services/strategist/researchService');
    await expect(conductResearch('bad-url', 'short')).rejects.toThrow('Validation failed');
  });
});
