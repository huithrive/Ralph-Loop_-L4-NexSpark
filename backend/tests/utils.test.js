const {
  isValidUrl,
  validateRequiredFields,
  validateResearchRequest,
  sanitizeString
} = require('../utils/validators');

const {
  success,
  error,
  validationError,
  notFound
} = require('../utils/responseFormatter');

const logger = require('../utils/logger');

describe('Validators', () => {
  describe('isValidUrl', () => {
    test('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://example.com')).toBe(true);
      expect(isValidUrl('https://sub.example.com/path')).toBe(true);
    });

    test('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('ftp://example.com')).toBe(false);
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl(null)).toBe(false);
    });
  });

  describe('validateRequiredFields', () => {
    test('should pass when all required fields are present', () => {
      const result = validateRequiredFields(
        { name: 'test', email: 'test@example.com' },
        ['name', 'email']
      );

      expect(result.valid).toBe(true);
      expect(result.missingFields).toEqual([]);
    });

    test('should fail when required fields are missing', () => {
      const result = validateRequiredFields(
        { name: 'test' },
        ['name', 'email']
      );

      expect(result.valid).toBe(false);
      expect(result.missingFields).toContain('email');
    });
  });

  describe('validateResearchRequest', () => {
    test('should validate correct research request', () => {
      const result = validateResearchRequest({
        website_url: 'https://example.com',
        product_description: 'A great product that solves problems'
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('should reject invalid research request', () => {
      const result = validateResearchRequest({
        website_url: 'not-a-url',
        product_description: 'short'
      });

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('sanitizeString', () => {
    test('should remove harmful characters', () => {
      const result = sanitizeString('<script>alert("xss")</script>');
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });

    test('should handle non-string input', () => {
      expect(sanitizeString(123)).toBe('');
      expect(sanitizeString(null)).toBe('');
    });
  });
});

describe('Response Formatter', () => {
  describe('success', () => {
    test('should format success response correctly', () => {
      const result = success({ id: 1 }, 'Operation completed');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Operation completed');
      expect(result.data).toEqual({ id: 1 });
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('error', () => {
    test('should format error response correctly', () => {
      const result = error('Something went wrong', 400, 'INVALID_REQUEST');

      expect(result.success).toBe(false);
      expect(result.error.message).toBe('Something went wrong');
      expect(result.error.statusCode).toBe(400);
      expect(result.error.code).toBe('INVALID_REQUEST');
    });
  });

  describe('validationError', () => {
    test('should format validation error correctly', () => {
      const result = validationError(['Field is required', 'Invalid format']);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_ERROR');
      expect(result.error.details.validationErrors).toEqual(['Field is required', 'Invalid format']);
    });
  });

  describe('notFound', () => {
    test('should format not found response', () => {
      const result = notFound('User');

      expect(result.success).toBe(false);
      expect(result.error.message).toBe('User not found');
      expect(result.error.statusCode).toBe(404);
    });
  });
});

describe('Logger', () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  test('should log info messages', () => {
    logger.info('Test message', { key: 'value' });

    expect(consoleSpy).toHaveBeenCalled();
    const logCall = consoleSpy.mock.calls[0][0];
    const logObject = JSON.parse(logCall);

    expect(logObject.level).toBe('INFO');
    expect(logObject.message).toBe('Test message');
    expect(logObject.key).toBe('value');
  });

  test('should create child logger with context', () => {
    const childLogger = logger.child({ requestId: '123' });
    childLogger.info('Child log');

    expect(consoleSpy).toHaveBeenCalled();
    const logCall = consoleSpy.mock.calls[0][0];
    const logObject = JSON.parse(logCall);

    expect(logObject.requestId).toBe('123');
  });
});