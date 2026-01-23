const { callClaude, callClaudeForJSON, getRateLimitStatus } = require('../services/claudeService');

// Mock the Anthropic SDK
jest.mock('@anthropic-ai/sdk');

describe('Claude Service', () => {
  let mockCreate;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock the Anthropic client
    const Anthropic = require('@anthropic-ai/sdk');
    mockCreate = jest.fn();

    Anthropic.mockImplementation(() => ({
      messages: {
        create: mockCreate
      }
    }));

    // Ensure API key is set for tests
    process.env.ANTHROPIC_API_KEY = 'test-api-key';
  });

  describe('callClaude', () => {
    test('should successfully call Claude with valid inputs', async () => {
      const mockResponse = {
        content: [{ text: 'Test response from Claude' }],
        usage: { input_tokens: 10, output_tokens: 5 }
      };

      mockCreate.mockResolvedValue(mockResponse);

      const result = await callClaude('Test system prompt', 'Test user message');

      expect(result.success).toBe(true);
      expect(result.content).toBe('Test response from Claude');
      expect(result.usage).toEqual({ input_tokens: 10, output_tokens: 5 });
      expect(mockCreate).toHaveBeenCalledWith({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        temperature: 0.7,
        system: 'Test system prompt',
        messages: [{ role: 'user', content: 'Test user message' }]
      });
    });

    test('should throw error when system prompt is missing', async () => {
      await expect(callClaude('', 'Test message')).rejects.toThrow('System prompt is required');
    });

    test('should throw error when user message is missing', async () => {
      await expect(callClaude('Test prompt', '')).rejects.toThrow('User message is required');
    });

    test('should handle API key missing error', async () => {
      delete process.env.ANTHROPIC_API_KEY;

      await expect(callClaude('Test prompt', 'Test message')).rejects.toThrow('ANTHROPIC_API_KEY environment variable is not set');
    });

    test('should handle 401 authentication error', async () => {
      const error = new Error('Unauthorized');
      error.status = 401;
      mockCreate.mockRejectedValue(error);

      await expect(callClaude('Test prompt', 'Test message')).rejects.toThrow('Invalid API key');
    });

    test('should handle 429 rate limit error', async () => {
      const error = new Error('Rate limited');
      error.status = 429;
      mockCreate.mockRejectedValue(error);

      await expect(callClaude('Test prompt', 'Test message')).rejects.toThrow('Rate limit exceeded');
    });
  });

  describe('callClaudeForJSON', () => {
    test('should parse JSON response correctly', async () => {
      const mockResponse = {
        content: [{ text: '{"test": "value", "number": 42}' }],
        usage: { input_tokens: 10, output_tokens: 5 }
      };

      mockCreate.mockResolvedValue(mockResponse);

      const result = await callClaudeForJSON('Test system prompt', 'Test user message');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ test: 'value', number: 42 });
      expect(result.usage).toEqual({ input_tokens: 10, output_tokens: 5 });
    });

    test('should handle JSON wrapped in code blocks', async () => {
      const mockResponse = {
        content: [{ text: '```json\n{"test": "value"}\n```' }],
        usage: { input_tokens: 10, output_tokens: 5 }
      };

      mockCreate.mockResolvedValue(mockResponse);

      const result = await callClaudeForJSON('Test system prompt', 'Test user message');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ test: 'value' });
    });

    test('should throw error for invalid JSON', async () => {
      const mockResponse = {
        content: [{ text: 'Invalid JSON response' }],
        usage: { input_tokens: 10, output_tokens: 5 }
      };

      mockCreate.mockResolvedValue(mockResponse);

      await expect(callClaudeForJSON('Test prompt', 'Test message')).rejects.toThrow('Failed to parse Claude response as JSON');
    });
  });

  describe('getRateLimitStatus', () => {
    test('should return current rate limit status', () => {
      const status = getRateLimitStatus();

      expect(status).toHaveProperty('requestsInLastMinute');
      expect(status).toHaveProperty('maxRequestsPerMinute');
      expect(status).toHaveProperty('canMakeRequest');
      expect(typeof status.canMakeRequest).toBe('boolean');
    });
  });
});