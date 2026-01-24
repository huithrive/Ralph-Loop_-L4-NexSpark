// Domain Management Service
// Part of NexSpark Executor Module - enables domain search, registration, and DNS management

const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Domain Management Service
 *
 * Supports multiple providers:
 * - DNSimple (developer-focused, comprehensive API)
 * - NameSilo (cost-effective, basic API)
 * - Mock provider (for testing and demos)
 */
class DomainService {
  constructor() {
    this.providers = {
      dnsimple: {
        name: 'DNSimple',
        baseUrl: 'https://api.dnsimple.com/v2',
        apiKey: process.env.DNSIMPLE_API_KEY,
        accountId: process.env.DNSIMPLE_ACCOUNT_ID,
        available: !!(process.env.DNSIMPLE_API_KEY && process.env.DNSIMPLE_ACCOUNT_ID)
      },
      namesilo: {
        name: 'NameSilo',
        baseUrl: 'https://www.namesilo.com/api',
        apiKey: process.env.NAMESILO_API_KEY,
        available: !!process.env.NAMESILO_API_KEY
      },
      mock: {
        name: 'Mock Provider',
        available: true
      }
    };

    this.defaultProvider = this.getDefaultProvider();
    this.validateConfiguration();

    logger.info('Domain service initialized', {
      defaultProvider: this.defaultProvider,
      availableProviders: this.getAvailableProviders()
    });
  }

  /**
   * Get default provider based on availability
   */
  getDefaultProvider() {
    if (this.providers.dnsimple.available) return 'dnsimple';
    if (this.providers.namesilo.available) return 'namesilo';
    return 'mock';
  }

  /**
   * Get list of available providers
   */
  getAvailableProviders() {
    return Object.keys(this.providers).filter(key => this.providers[key].available);
  }

  /**
   * Validate service configuration
   */
  validateConfiguration() {
    const availableProviders = this.getAvailableProviders();

    if (availableProviders.length === 0) {
      logger.warn('No domain providers configured, using mock provider');
    } else if (availableProviders.includes('mock') && availableProviders.length === 1) {
      logger.warn('Only mock provider available, configure real providers for production');
    }

    logger.info('Domain service configuration validated', {
      providers: availableProviders,
      defaultProvider: this.defaultProvider
    });
  }

  /**
   * Search for domain availability
   *
   * @param {string} domain - Domain name to search
   * @param {string} provider - Provider to use (optional)
   * @returns {Object} Domain availability and pricing info
   */
  async searchDomain(domain, provider = this.defaultProvider) {
    try {
      logger.info('Searching domain availability', { domain, provider });

      // Validate domain format
      if (!this.validateDomainFormat(domain)) {
        throw new Error('Invalid domain format');
      }

      let result;
      switch (provider) {
      case 'dnsimple':
        result = await this.searchDomainDNSimple(domain);
        break;
      case 'namesilo':
        result = await this.searchDomainNameSilo(domain);
        break;
      case 'mock':
        result = await this.searchDomainMock(domain);
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
      }

      logger.info('Domain search completed', {
        domain,
        provider,
        available: result.available,
        price: result.price
      });

      return result;

    } catch (error) {
      logger.error('Domain search failed', error, { domain, provider });
      throw new Error(`Domain search failed: ${error.message}`);
    }
  }

  /**
   * Register a domain
   *
   * @param {string} domain - Domain name to register
   * @param {Object} registrant - Registrant information
   * @param {Object} options - Registration options
   * @param {string} provider - Provider to use (optional)
   * @returns {Object} Registration result
   */
  async registerDomain(domain, registrant, options = {}, provider = this.defaultProvider) {
    try {
      logger.info('Registering domain', { domain, provider, options });

      // Validate inputs
      if (!this.validateDomainFormat(domain)) {
        throw new Error('Invalid domain format');
      }

      if (!this.validateRegistrant(registrant)) {
        throw new Error('Invalid registrant information');
      }

      let result;
      switch (provider) {
      case 'dnsimple':
        result = await this.registerDomainDNSimple(domain, registrant, options);
        break;
      case 'namesilo':
        result = await this.registerDomainNameSilo(domain, registrant, options);
        break;
      case 'mock':
        result = await this.registerDomainMock(domain, registrant, options);
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
      }

      logger.info('Domain registration completed', {
        domain,
        provider,
        registrationId: result.registration_id,
        status: result.status
      });

      return result;

    } catch (error) {
      logger.error('Domain registration failed', error, { domain, provider });
      throw new Error(`Domain registration failed: ${error.message}`);
    }
  }

  /**
   * Configure DNS records for domain
   *
   * @param {string} domain - Domain name
   * @param {Array} records - DNS records to configure
   * @param {string} provider - Provider to use (optional)
   * @returns {Object} DNS configuration result
   */
  async configureDNS(domain, records, provider = this.defaultProvider) {
    try {
      logger.info('Configuring DNS records', { domain, provider, recordCount: records.length });

      // Validate records
      if (!this.validateDNSRecords(records)) {
        throw new Error('Invalid DNS records format');
      }

      let result;
      switch (provider) {
      case 'dnsimple':
        result = await this.configureDNSDNSimple(domain, records);
        break;
      case 'namesilo':
        result = await this.configureDNSNameSilo(domain, records);
        break;
      case 'mock':
        result = await this.configureDNSMock(domain, records);
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
      }

      logger.info('DNS configuration completed', {
        domain,
        provider,
        recordsConfigured: result.records_configured
      });

      return result;

    } catch (error) {
      logger.error('DNS configuration failed', error, { domain, provider });
      throw new Error(`DNS configuration failed: ${error.message}`);
    }
  }

  /**
   * Generate domain suggestions based on keywords
   *
   * @param {string} keyword - Base keyword
   * @param {Array} extensions - TLD extensions to check
   * @returns {Object} Domain suggestions
   */
  async generateDomainSuggestions(keyword, extensions = ['com', 'net', 'org']) {
    try {
      logger.info('Generating domain suggestions', { keyword, extensions });

      const suggestions = [];
      const baseKeyword = keyword.toLowerCase().replace(/[^a-z0-9]/g, '');

      // Generate variations
      const variations = [
        baseKeyword,
        `${baseKeyword}app`,
        `${baseKeyword}io`,
        `${baseKeyword}hub`,
        `${baseKeyword}pro`,
        `get${baseKeyword}`,
        `my${baseKeyword}`,
        `${baseKeyword}hq`,
        `${baseKeyword}platform`,
        `${baseKeyword}tool`
      ];

      // Check availability for each variation and extension
      for (const variation of variations.slice(0, 5)) { // Limit to first 5 variations
        for (const ext of extensions.slice(0, 3)) { // Limit to first 3 extensions
          const domain = `${variation}.${ext}`;
          try {
            const availability = await this.searchDomain(domain);
            suggestions.push({
              domain,
              available: availability.available,
              price: availability.price,
              provider: availability.provider
            });

            // Add small delay to respect rate limits
            await this.delay(200);
          } catch (error) {
            logger.warn('Failed to check domain suggestion', error, { domain });
          }
        }
      }

      logger.info('Domain suggestions generated', {
        keyword,
        totalSuggestions: suggestions.length,
        availableSuggestions: suggestions.filter(s => s.available).length
      });

      return {
        keyword,
        suggestions: suggestions.filter(s => s.available).slice(0, 10), // Return top 10 available
        total_checked: suggestions.length,
        available_count: suggestions.filter(s => s.available).length
      };

    } catch (error) {
      logger.error('Domain suggestion generation failed', error, { keyword });
      throw new Error(`Domain suggestion generation failed: ${error.message}`);
    }
  }

  // =====================================
  // DNSimple Provider Implementation
  // =====================================

  async searchDomainDNSimple(domain) {
    const config = this.providers.dnsimple;

    const response = await axios.get(`${config.baseUrl}/${config.accountId}/registrar/domains/${domain}/check`, {
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const data = response.data.data;
    return {
      domain,
      available: data.available,
      price: data.premium ? 'Premium pricing' : 'Standard pricing',
      provider: 'dnsimple',
      premium: data.premium,
      currency: 'USD'
    };
  }

  async registerDomainDNSimple(domain, registrant, options) {
    const config = this.providers.dnsimple;

    const registrationData = {
      registrant_id: registrant.id || await this.createContactDNSimple(registrant),
      whois_privacy: options.privacy !== false,
      auto_renew: options.auto_renew !== false,
      extended_attributes: options.extended_attributes || {}
    };

    const response = await axios.post(
      `${config.baseUrl}/${config.accountId}/registrar/domains/${domain}/registrations`,
      registrationData,
      {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = response.data.data;
    return {
      domain,
      registration_id: data.id,
      status: data.state,
      expires_at: data.expires_at,
      provider: 'dnsimple',
      cost: 'Check account billing'
    };
  }

  async configureDNSDNSimple(domain, records) {
    const config = this.providers.dnsimple;
    const results = [];

    for (const record of records) {
      try {
        const response = await axios.post(
          `${config.baseUrl}/${config.accountId}/zones/${domain}/records`,
          {
            name: record.name,
            type: record.type,
            content: record.content,
            ttl: record.ttl || 3600
          },
          {
            headers: {
              'Authorization': `Bearer ${config.apiKey}`,
              'Content-Type': 'application/json'
            }
          }
        );

        results.push({
          name: record.name,
          type: record.type,
          status: 'created',
          record_id: response.data.data.id
        });
      } catch (error) {
        results.push({
          name: record.name,
          type: record.type,
          status: 'failed',
          error: error.message
        });
      }
    }

    return {
      domain,
      provider: 'dnsimple',
      records_configured: results.filter(r => r.status === 'created').length,
      total_records: records.length,
      results
    };
  }

  // =====================================
  // NameSilo Provider Implementation
  // =====================================

  async searchDomainNameSilo(domain) {
    const config = this.providers.namesilo;

    const response = await axios.get(`${config.baseUrl}/checkAvailability`, {
      params: {
        version: 1,
        type: 'json',
        key: config.apiKey,
        domains: domain
      }
    });

    const available = response.data.reply.available;
    const unavailable = response.data.reply.unavailable;

    return {
      domain,
      available: available && available.domain === domain,
      price: available ? 'Check pricing via API' : null,
      provider: 'namesilo',
      currency: 'USD'
    };
  }

  async registerDomainNameSilo(domain, registrant, options) {
    const config = this.providers.namesilo;

    const registrationData = {
      version: 1,
      type: 'json',
      key: config.apiKey,
      domain,
      years: options.years || 1,
      private: options.privacy !== false ? 1 : 0,
      auto_renew: options.auto_renew !== false ? 1 : 0,
      // Add registrant fields
      fn: registrant.first_name,
      ln: registrant.last_name,
      ad: registrant.address,
      cy: registrant.city,
      st: registrant.state,
      zp: registrant.postal_code,
      ct: registrant.country,
      ph: registrant.phone,
      em: registrant.email
    };

    const response = await axios.get(`${config.baseUrl}/registerDomain`, {
      params: registrationData
    });

    const data = response.data.reply;
    return {
      domain,
      registration_id: data.domain_id || 'unknown',
      status: 'registered',
      provider: 'namesilo',
      cost: data.total_cost || 'Unknown'
    };
  }

  async configureDNSNameSilo(domain, records) {
    const config = this.providers.namesilo;
    const results = [];

    for (const record of records) {
      try {
        const response = await axios.get(`${config.baseUrl}/dnsAddRecord`, {
          params: {
            version: 1,
            type: 'json',
            key: config.apiKey,
            domain,
            rrtype: record.type,
            rrhost: record.name,
            rrvalue: record.content,
            rrttl: record.ttl || 3600
          }
        });

        results.push({
          name: record.name,
          type: record.type,
          status: response.data.reply.code === '300' ? 'created' : 'failed',
          record_id: response.data.reply.record_id
        });
      } catch (error) {
        results.push({
          name: record.name,
          type: record.type,
          status: 'failed',
          error: error.message
        });
      }
    }

    return {
      domain,
      provider: 'namesilo',
      records_configured: results.filter(r => r.status === 'created').length,
      total_records: records.length,
      results
    };
  }

  // =====================================
  // Mock Provider Implementation
  // =====================================

  async searchDomainMock(domain) {
    // Simulate API delay
    await this.delay(500);

    // Simple availability logic for demo
    const isAvailable = !['google.com', 'facebook.com', 'twitter.com'].includes(domain);

    return {
      domain,
      available: isAvailable,
      price: isAvailable ? '$12.99' : null,
      provider: 'mock',
      currency: 'USD',
      note: 'Mock provider for testing and demos'
    };
  }

  async registerDomainMock(domain, registrant, options) {
    await this.delay(1000);

    return {
      domain,
      registration_id: `mock-${Date.now()}`,
      status: 'registered',
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      provider: 'mock',
      cost: '$12.99',
      note: 'Mock registration for testing'
    };
  }

  async configureDNSMock(domain, records) {
    await this.delay(800);

    const results = records.map(record => ({
      name: record.name,
      type: record.type,
      status: 'created',
      record_id: `mock-${Math.random().toString(36).substr(2, 9)}`
    }));

    return {
      domain,
      provider: 'mock',
      records_configured: results.length,
      total_records: records.length,
      results,
      note: 'Mock DNS configuration for testing'
    };
  }

  // =====================================
  // Validation and Utility Methods
  // =====================================

  validateDomainFormat(domain) {
    // More strict domain validation
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.([a-zA-Z]{2,})$/;

    // Additional checks for edge cases
    if (!domain || typeof domain !== 'string') return false;
    if (domain.includes('..')) return false; // Double dots
    if (domain.includes('--')) return false; // Double hyphens
    if (domain.includes(' ')) return false; // Spaces
    if (!/^[a-zA-Z0-9.-]+$/.test(domain)) return false; // Only allowed chars
    if (domain.startsWith('-') || domain.endsWith('-')) return false; // No leading/trailing hyphens
    if (domain.startsWith('.') || domain.endsWith('.')) return false; // No leading/trailing dots

    return domainRegex.test(domain);
  }

  validateRegistrant(registrant) {
    const required = ['first_name', 'last_name', 'email', 'address', 'city', 'country'];
    return required.every(field => registrant[field] && registrant[field].trim());
  }

  validateDNSRecords(records) {
    if (!Array.isArray(records)) return false;

    const validTypes = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS'];
    return records.every(record =>
      record.name && record.type && record.content &&
      validTypes.includes(record.type.toUpperCase())
    );
  }

  async createContactDNSimple(registrant) {
    // This would create a contact in DNSimple and return the contact ID
    // For now, return a mock ID
    return `contact-${Date.now()}`;
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get service health status
   */
  async getHealthStatus() {
    return {
      service: 'DomainService',
      status: 'operational',
      default_provider: this.defaultProvider,
      available_providers: this.getAvailableProviders(),
      providers: Object.keys(this.providers).reduce((acc, key) => {
        acc[key] = {
          name: this.providers[key].name,
          available: this.providers[key].available,
          configured: key !== 'mock' ? this.providers[key].available : true
        };
        return acc;
      }, {}),
      capabilities: [
        'Domain availability search',
        'Domain registration',
        'DNS record management',
        'Domain suggestions',
        'Multi-provider support'
      ]
    };
  }
}

module.exports = DomainService;