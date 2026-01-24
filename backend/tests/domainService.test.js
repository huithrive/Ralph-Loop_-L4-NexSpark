// Tests for Domain Management Service
const DomainService = require('../services/domainService');
const axios = require('axios');

// Mock axios to avoid real API calls
jest.mock('axios');
const mockedAxios = axios;

// Mock environment variables
const originalEnv = process.env;

describe('Domain Service Tests', () => {
  let domainService;

  beforeEach(() => {
    // Reset environment variables
    process.env = {
      ...originalEnv,
      DNSIMPLE_API_KEY: 'test-dnsimple-key',
      DNSIMPLE_ACCOUNT_ID: 'test-account-id',
      NAMESILO_API_KEY: 'test-namesilo-key'
    };

    // Mock console to reduce test output noise
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // Reset axios mock
    mockedAxios.get.mockReset();
    mockedAxios.post.mockReset();

    domainService = new DomainService();
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  describe('Service Initialization', () => {
    test('should initialize with all providers when configured', () => {
      expect(domainService.defaultProvider).toBe('dnsimple');
      expect(domainService.getAvailableProviders()).toContain('dnsimple');
      expect(domainService.getAvailableProviders()).toContain('namesilo');
      expect(domainService.getAvailableProviders()).toContain('mock');
    });

    test('should fall back to mock provider when no APIs configured', () => {
      delete process.env.DNSIMPLE_API_KEY;
      delete process.env.NAMESILO_API_KEY;

      const service = new DomainService();
      expect(service.defaultProvider).toBe('mock');
      expect(service.getAvailableProviders()).toEqual(['mock']);
    });

    test('should provide health status', async () => {
      const health = await domainService.getHealthStatus();

      expect(health.service).toBe('DomainService');
      expect(health.status).toBe('operational');
      expect(health.default_provider).toBe('dnsimple');
      expect(Array.isArray(health.available_providers)).toBe(true);
      expect(Array.isArray(health.capabilities)).toBe(true);
    });
  });

  describe('Domain Validation', () => {
    test('should validate valid domain formats', () => {
      const validDomains = [
        'example.com',
        'test-domain.org',
        'my-site.io',
        'business123.net',
        'a.co'
      ];

      validDomains.forEach(domain => {
        expect(domainService.validateDomainFormat(domain)).toBe(true);
      });
    });

    test('should reject invalid domain formats', () => {
      const invalidDomains = [
        'invalid',
        'no-tld',
        '-invalid.com',
        'invalid-.com',
        'too--many--dashes.com',
        'spaces in domain.com',
        'special!chars.com'
      ];

      invalidDomains.forEach(domain => {
        expect(domainService.validateDomainFormat(domain)).toBe(false);
      });
    });
  });

  describe('Registrant Validation', () => {
    test('should validate complete registrant information', () => {
      const validRegistrant = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        address: '123 Main St',
        city: 'Anytown',
        country: 'US'
      };

      expect(domainService.validateRegistrant(validRegistrant)).toBe(true);
    });

    test('should reject incomplete registrant information', () => {
      const incompleteRegistrants = [
        {}, // Empty
        { first_name: 'John' }, // Missing required fields
        {
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com'
          // Missing address, city, country
        },
        {
          first_name: '',
          last_name: 'Doe',
          email: 'john@example.com',
          address: '123 Main St',
          city: 'Anytown',
          country: 'US'
        }
      ];

      incompleteRegistrants.forEach(registrant => {
        expect(domainService.validateRegistrant(registrant)).toBe(false);
      });
    });
  });

  describe('DNS Records Validation', () => {
    test('should validate valid DNS records', () => {
      const validRecords = [
        {
          name: '@',
          type: 'A',
          content: '192.168.1.1'
        },
        {
          name: 'www',
          type: 'CNAME',
          content: 'example.com'
        },
        {
          name: '@',
          type: 'MX',
          content: '10 mail.example.com'
        }
      ];

      expect(domainService.validateDNSRecords(validRecords)).toBe(true);
    });

    test('should reject invalid DNS records', () => {
      const invalidRecords = [
        // Not an array
        'invalid',
        // Missing required fields
        [{ name: '@' }],
        // Invalid record type
        [{ name: '@', type: 'INVALID', content: '192.168.1.1' }],
        // Empty content
        [{ name: '@', type: 'A', content: '' }]
      ];

      invalidRecords.forEach(records => {
        expect(domainService.validateDNSRecords(records)).toBe(false);
      });
    });
  });

  describe('Mock Provider Implementation', () => {
    beforeEach(() => {
      // Force mock provider for consistent testing
      domainService.defaultProvider = 'mock';
    });

    test('should search domain availability with mock provider', async () => {
      const result = await domainService.searchDomain('test-domain.com', 'mock');

      expect(result.domain).toBe('test-domain.com');
      expect(result.available).toBe(true);
      expect(result.provider).toBe('mock');
      expect(result.price).toBe('$12.99');
      expect(result.note).toContain('Mock provider');
    });

    test('should mark popular domains as unavailable', async () => {
      const result = await domainService.searchDomain('google.com', 'mock');

      expect(result.domain).toBe('google.com');
      expect(result.available).toBe(false);
      expect(result.price).toBe(null);
    });

    test('should register domain with mock provider', async () => {
      const registrant = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        address: '123 Main St',
        city: 'Anytown',
        country: 'US'
      };

      const result = await domainService.registerDomain('test-domain.com', registrant, {}, 'mock');

      expect(result.domain).toBe('test-domain.com');
      expect(result.status).toBe('registered');
      expect(result.provider).toBe('mock');
      expect(result.registration_id).toMatch(/^mock-\d+$/);
      expect(result.note).toContain('Mock registration');
    });

    test('should configure DNS with mock provider', async () => {
      const records = [
        {
          name: '@',
          type: 'A',
          content: '192.168.1.1'
        },
        {
          name: 'www',
          type: 'CNAME',
          content: 'test-domain.com'
        }
      ];

      const result = await domainService.configureDNS('test-domain.com', records, 'mock');

      expect(result.domain).toBe('test-domain.com');
      expect(result.provider).toBe('mock');
      expect(result.records_configured).toBe(2);
      expect(result.total_records).toBe(2);
      expect(result.results).toHaveLength(2);
      expect(result.results[0].status).toBe('created');
    });
  });

  describe('DNSimple Provider Implementation', () => {
    test('should search domain with DNSimple API', async () => {
      const mockResponse = {
        data: {
          data: {
            available: true,
            premium: false
          }
        }
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await domainService.searchDomainDNSimple('test-domain.com');

      expect(result.domain).toBe('test-domain.com');
      expect(result.available).toBe(true);
      expect(result.provider).toBe('dnsimple');
      expect(result.premium).toBe(false);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.dnsimple.com/v2/test-account-id/registrar/domains/test-domain.com/check',
        expect.objectContaining({
          headers: {
            'Authorization': 'Bearer test-dnsimple-key',
            'Content-Type': 'application/json'
          }
        })
      );
    });

    test('should register domain with DNSimple API', async () => {
      const mockResponse = {
        data: {
          data: {
            id: 12345,
            state: 'registered',
            expires_at: '2025-12-31T00:00:00Z'
          }
        }
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const registrant = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        address: '123 Main St',
        city: 'Anytown',
        country: 'US'
      };

      const result = await domainService.registerDomainDNSimple('test-domain.com', registrant, {});

      expect(result.domain).toBe('test-domain.com');
      expect(result.registration_id).toBe(12345);
      expect(result.status).toBe('registered');
      expect(result.provider).toBe('dnsimple');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.dnsimple.com/v2/test-account-id/registrar/domains/test-domain.com/registrations',
        expect.objectContaining({
          whois_privacy: true,
          auto_renew: true
        }),
        expect.objectContaining({
          headers: {
            'Authorization': 'Bearer test-dnsimple-key',
            'Content-Type': 'application/json'
          }
        })
      );
    });

    test('should configure DNS with DNSimple API', async () => {
      const mockResponse = {
        data: {
          data: {
            id: 54321
          }
        }
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const records = [
        {
          name: '@',
          type: 'A',
          content: '192.168.1.1'
        }
      ];

      const result = await domainService.configureDNSDNSimple('test-domain.com', records);

      expect(result.domain).toBe('test-domain.com');
      expect(result.provider).toBe('dnsimple');
      expect(result.records_configured).toBe(1);
      expect(result.results[0].status).toBe('created');
      expect(result.results[0].record_id).toBe(54321);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.dnsimple.com/v2/test-account-id/zones/test-domain.com/records',
        {
          name: '@',
          type: 'A',
          content: '192.168.1.1',
          ttl: 3600
        },
        expect.objectContaining({
          headers: {
            'Authorization': 'Bearer test-dnsimple-key',
            'Content-Type': 'application/json'
          }
        })
      );
    });
  });

  describe('NameSilo Provider Implementation', () => {
    test('should search domain with NameSilo API', async () => {
      const mockResponse = {
        data: {
          reply: {
            available: {
              domain: 'test-domain.com'
            },
            unavailable: null
          }
        }
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await domainService.searchDomainNameSilo('test-domain.com');

      expect(result.domain).toBe('test-domain.com');
      expect(result.available).toBe(true);
      expect(result.provider).toBe('namesilo');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://www.namesilo.com/api/checkAvailability',
        expect.objectContaining({
          params: {
            version: 1,
            type: 'json',
            key: 'test-namesilo-key',
            domains: 'test-domain.com'
          }
        })
      );
    });

    test('should register domain with NameSilo API', async () => {
      const mockResponse = {
        data: {
          reply: {
            domain_id: 'NS123456',
            total_cost: '12.99'
          }
        }
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const registrant = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        address: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        postal_code: '12345',
        country: 'US',
        phone: '+1.5551234567'
      };

      const result = await domainService.registerDomainNameSilo('test-domain.com', registrant, {});

      expect(result.domain).toBe('test-domain.com');
      expect(result.registration_id).toBe('NS123456');
      expect(result.status).toBe('registered');
      expect(result.provider).toBe('namesilo');
      expect(result.cost).toBe('12.99');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://www.namesilo.com/api/registerDomain',
        expect.objectContaining({
          params: expect.objectContaining({
            domain: 'test-domain.com',
            fn: 'John',
            ln: 'Doe',
            em: 'john@example.com'
          })
        })
      );
    });

    test('should configure DNS with NameSilo API', async () => {
      const mockResponse = {
        data: {
          reply: {
            code: '300',
            record_id: 'R12345'
          }
        }
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const records = [
        {
          name: '@',
          type: 'A',
          content: '192.168.1.1'
        }
      ];

      const result = await domainService.configureDNSNameSilo('test-domain.com', records);

      expect(result.domain).toBe('test-domain.com');
      expect(result.provider).toBe('namesilo');
      expect(result.records_configured).toBe(1);
      expect(result.results[0].status).toBe('created');
      expect(result.results[0].record_id).toBe('R12345');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://www.namesilo.com/api/dnsAddRecord',
        expect.objectContaining({
          params: {
            version: 1,
            type: 'json',
            key: 'test-namesilo-key',
            domain: 'test-domain.com',
            rrtype: 'A',
            rrhost: '@',
            rrvalue: '192.168.1.1',
            rrttl: 3600
          }
        })
      );
    });
  });

  describe('Domain Suggestions', () => {
    beforeEach(() => {
      // Force mock provider for consistent testing
      domainService.defaultProvider = 'mock';
    });

    test('should generate domain suggestions', async () => {
      const result = await domainService.generateDomainSuggestions('testapp', ['com', 'net']);

      expect(result.keyword).toBe('testapp');
      expect(Array.isArray(result.suggestions)).toBe(true);
      expect(result.total_checked).toBeGreaterThan(0);
      expect(result.available_count).toBeGreaterThan(0);

      // All suggestions should be available and properly formatted
      result.suggestions.forEach(suggestion => {
        expect(suggestion.domain).toMatch(/^[a-zA-Z0-9-]+\.(com|net)$/);
        expect(suggestion.available).toBe(true);
        expect(suggestion.provider).toBe('mock');
      });
    });

    test('should limit suggestion results', async () => {
      const result = await domainService.generateDomainSuggestions('popular', ['com']);

      expect(result.suggestions.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Error Handling', () => {
    test('should handle search errors gracefully', async () => {
      await expect(domainService.searchDomain('invalid-domain'))
        .rejects.toThrow('Domain search failed');
    });

    test('should handle registration errors gracefully', async () => {
      const invalidRegistrant = {};

      await expect(domainService.registerDomain('test.com', invalidRegistrant))
        .rejects.toThrow('Domain registration failed');
    });

    test('should handle DNS configuration errors gracefully', async () => {
      const invalidRecords = 'not-an-array';

      await expect(domainService.configureDNS('test.com', invalidRecords))
        .rejects.toThrow('DNS configuration failed');
    });

    test('should handle unsupported provider errors', async () => {
      await expect(domainService.searchDomain('test.com', 'unsupported'))
        .rejects.toThrow('Unsupported provider');
    });

    test('should handle API failures', async () => {
      mockedAxios.get.mockRejectedValue(new Error('API Error'));

      await expect(domainService.searchDomainDNSimple('test.com'))
        .rejects.toThrow('API Error');
    });
  });

  describe('Utility Functions', () => {
    test('should implement delay function', async () => {
      const start = Date.now();
      await domainService.delay(10);
      const end = Date.now();

      expect(end - start).toBeGreaterThanOrEqual(10);
    });
  });
});