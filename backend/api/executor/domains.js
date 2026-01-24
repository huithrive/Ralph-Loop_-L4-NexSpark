// Domain Management API
// Part of NexSpark Executor Module

const express = require('express');
const { body, validationResult, query } = require('express-validator');
const DomainService = require('../../services/domainService');
const logger = require('../../utils/logger');
const { formatSuccessResponse, formatErrorResponse } = require('../../utils/responseFormatter');

const router = express.Router();
const domainService = new DomainService();

/**
 * GET /api/executor/domains/search
 * Search for domain availability
 */
router.get('/search', [
  query('domain').notEmpty().withMessage('Domain parameter is required'),
  query('domain').matches(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/).withMessage('Invalid domain format'),
  query('provider').optional().isIn(['dnsimple', 'namesilo', 'mock']).withMessage('Invalid provider')
], async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(formatErrorResponse(
        'Invalid request parameters',
        'VALIDATION_ERROR',
        errors.array()
      ));
    }

    const { domain, provider } = req.query;

    logger.info('Domain search requested', { domain, provider });

    // Search domain availability
    const result = await domainService.searchDomain(domain, provider);

    logger.info('Domain search completed', {
      domain,
      available: result.available,
      provider: result.provider
    });

    res.status(200).json(formatSuccessResponse({
      domain: result.domain,
      available: result.available,
      price: result.price,
      currency: result.currency,
      provider: result.provider,
      premium: result.premium,
      search_timestamp: new Date().toISOString(),
      next_steps: result.available ? [
        'Use POST /api/executor/domains/register to register this domain',
        'Prepare registrant information (name, address, email, etc.)',
        'Consider privacy protection and auto-renewal options'
      ] : [
        'Domain is not available',
        'Try GET /api/executor/domains/suggestions for alternatives',
        'Consider different TLD extensions (.net, .org, .io)'
      ]
    }, result.available ? 'Domain is available for registration' : 'Domain is not available'));

  } catch (error) {
    logger.error('Domain search failed', error, { domain: req.query.domain });

    res.status(500).json(formatErrorResponse(
      'Domain search failed',
      'DOMAIN_SEARCH_ERROR',
      { error: error.message }
    ));
  }
});

/**
 * GET /api/executor/domains/suggestions
 * Generate domain suggestions based on keyword
 */
router.get('/suggestions', [
  query('keyword').notEmpty().withMessage('Keyword parameter is required'),
  query('keyword').isLength({ min: 2, max: 50 }).withMessage('Keyword must be 2-50 characters'),
  query('extensions').optional().isString().withMessage('Extensions must be comma-separated string')
], async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(formatErrorResponse(
        'Invalid request parameters',
        'VALIDATION_ERROR',
        errors.array()
      ));
    }

    const { keyword, extensions } = req.query;
    const tldExtensions = extensions ? extensions.split(',').map(ext => ext.trim()) : ['com', 'net', 'org'];

    logger.info('Domain suggestions requested', { keyword, extensions: tldExtensions });

    // Generate domain suggestions
    const result = await domainService.generateDomainSuggestions(keyword, tldExtensions);

    logger.info('Domain suggestions generated', {
      keyword,
      totalSuggestions: result.suggestions.length,
      availableCount: result.available_count
    });

    res.status(200).json(formatSuccessResponse({
      keyword: result.keyword,
      suggestions: result.suggestions,
      search_criteria: {
        extensions_checked: tldExtensions,
        total_domains_checked: result.total_checked,
        available_domains_found: result.available_count
      },
      generation_timestamp: new Date().toISOString(),
      next_steps: result.suggestions.length > 0 ? [
        'Review suggested domains and select your preferred option',
        'Use GET /api/executor/domains/search to verify individual domain availability',
        'Use POST /api/executor/domains/register to register your chosen domain'
      ] : [
        'No available domains found with current criteria',
        'Try different keywords or TLD extensions',
        'Consider longer or shorter domain variations'
      ]
    }, `Found ${result.suggestions.length} available domain suggestions`));

  } catch (error) {
    logger.error('Domain suggestions failed', error, { keyword: req.query.keyword });

    res.status(500).json(formatErrorResponse(
      'Domain suggestions generation failed',
      'DOMAIN_SUGGESTIONS_ERROR',
      { error: error.message }
    ));
  }
});

/**
 * POST /api/executor/domains/register
 * Register a domain
 */
router.post('/register', [
  body('domain').notEmpty().withMessage('Domain is required'),
  body('domain').matches(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/).withMessage('Invalid domain format'),
  body('registrant').isObject().withMessage('Registrant information is required'),
  body('registrant.first_name').notEmpty().withMessage('First name is required'),
  body('registrant.last_name').notEmpty().withMessage('Last name is required'),
  body('registrant.email').isEmail().withMessage('Valid email is required'),
  body('registrant.address').notEmpty().withMessage('Address is required'),
  body('registrant.city').notEmpty().withMessage('City is required'),
  body('registrant.country').notEmpty().withMessage('Country is required'),
  body('options.provider').optional().isIn(['dnsimple', 'namesilo', 'mock']).withMessage('Invalid provider'),
  body('options.years').optional().isInt({ min: 1, max: 10 }).withMessage('Years must be 1-10'),
  body('options.privacy').optional().isBoolean().withMessage('Privacy must be boolean'),
  body('options.auto_renew').optional().isBoolean().withMessage('Auto renew must be boolean')
], async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(formatErrorResponse(
        'Invalid request parameters',
        'VALIDATION_ERROR',
        errors.array()
      ));
    }

    const { domain, registrant, options = {} } = req.body;

    logger.info('Domain registration requested', {
      domain,
      provider: options.provider,
      registrant: `${registrant.first_name} ${registrant.last_name}`,
      privacy: options.privacy,
      autoRenew: options.auto_renew
    });

    // Check domain availability first
    const availability = await domainService.searchDomain(domain, options.provider);
    if (!availability.available) {
      return res.status(400).json(formatErrorResponse(
        'Domain is not available for registration',
        'DOMAIN_NOT_AVAILABLE',
        { domain, provider: availability.provider }
      ));
    }

    // Register domain
    const result = await domainService.registerDomain(domain, registrant, options, options.provider);

    logger.info('Domain registration completed', {
      domain,
      registrationId: result.registration_id,
      provider: result.provider,
      status: result.status
    });

    res.status(200).json(formatSuccessResponse({
      domain: result.domain,
      registration_id: result.registration_id,
      status: result.status,
      provider: result.provider,
      expires_at: result.expires_at,
      cost: result.cost,
      registrant: {
        name: `${registrant.first_name} ${registrant.last_name}`,
        email: registrant.email
      },
      options: {
        privacy_protection: options.privacy !== false,
        auto_renewal: options.auto_renew !== false,
        registration_years: options.years || 1
      },
      registration_timestamp: new Date().toISOString(),
      next_steps: [
        'Domain registration is complete',
        'Use POST /api/executor/domains/dns to configure DNS records',
        'Point your domain to your Shopify store or landing page',
        'Consider setting up SSL certificates'
      ]
    }, 'Domain registered successfully'));

  } catch (error) {
    logger.error('Domain registration failed', error, {
      domain: req.body.domain,
      provider: req.body.options?.provider
    });

    res.status(500).json(formatErrorResponse(
      'Domain registration failed',
      'DOMAIN_REGISTRATION_ERROR',
      { error: error.message }
    ));
  }
});

/**
 * POST /api/executor/domains/dns
 * Configure DNS records for domain
 */
router.post('/dns', [
  body('domain').notEmpty().withMessage('Domain is required'),
  body('domain').matches(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/).withMessage('Invalid domain format'),
  body('records').isArray({ min: 1 }).withMessage('DNS records array is required'),
  body('records.*.name').notEmpty().withMessage('Record name is required'),
  body('records.*.type').isIn(['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS']).withMessage('Invalid record type'),
  body('records.*.content').notEmpty().withMessage('Record content is required'),
  body('records.*.ttl').optional().isInt({ min: 300, max: 86400 }).withMessage('TTL must be 300-86400 seconds'),
  body('provider').optional().isIn(['dnsimple', 'namesilo', 'mock']).withMessage('Invalid provider')
], async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(formatErrorResponse(
        'Invalid request parameters',
        'VALIDATION_ERROR',
        errors.array()
      ));
    }

    const { domain, records, provider } = req.body;

    logger.info('DNS configuration requested', {
      domain,
      provider,
      recordCount: records.length,
      recordTypes: records.map(r => r.type).join(', ')
    });

    // Configure DNS records
    const result = await domainService.configureDNS(domain, records, provider);

    logger.info('DNS configuration completed', {
      domain,
      provider: result.provider,
      recordsConfigured: result.records_configured,
      totalRecords: result.total_records
    });

    res.status(200).json(formatSuccessResponse({
      domain: result.domain,
      provider: result.provider,
      records_configured: result.records_configured,
      total_records: result.total_records,
      success_rate: `${Math.round((result.records_configured / result.total_records) * 100)}%`,
      configuration_results: result.results,
      configuration_timestamp: new Date().toISOString(),
      next_steps: result.records_configured === result.total_records ? [
        'All DNS records configured successfully',
        'DNS propagation may take 24-48 hours to complete worldwide',
        'Test your domain configuration after propagation',
        'Monitor DNS resolution using dig or nslookup tools'
      ] : [
        `${result.records_configured}/${result.total_records} records configured successfully`,
        'Review failed records in configuration_results',
        'Retry failed record configurations if needed',
        'Contact provider support for persistent issues'
      ]
    }, `DNS configuration completed: ${result.records_configured}/${result.total_records} records successful`));

  } catch (error) {
    logger.error('DNS configuration failed', error, {
      domain: req.body.domain,
      provider: req.body.provider
    });

    res.status(500).json(formatErrorResponse(
      'DNS configuration failed',
      'DNS_CONFIGURATION_ERROR',
      { error: error.message }
    ));
  }
});

/**
 * POST /api/executor/domains/shopify-setup
 * Configure domain for Shopify store
 */
router.post('/shopify-setup', [
  body('domain').notEmpty().withMessage('Domain is required'),
  body('shopify_domain').notEmpty().withMessage('Shopify domain is required'),
  body('shopify_domain').matches(/^[a-zA-Z0-9-]+\.myshopify\.com$/).withMessage('Invalid Shopify domain format'),
  body('provider').optional().isIn(['dnsimple', 'namesilo', 'mock']).withMessage('Invalid provider')
], async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(formatErrorResponse(
        'Invalid request parameters',
        'VALIDATION_ERROR',
        errors.array()
      ));
    }

    const { domain, shopify_domain, provider } = req.body;

    logger.info('Shopify domain setup requested', { domain, shopify_domain, provider });

    // Configure DNS records for Shopify
    const shopifyRecords = [
      {
        name: '@',
        type: 'A',
        content: '23.227.38.65', // Shopify IP
        ttl: 3600
      },
      {
        name: 'www',
        type: 'CNAME',
        content: shopify_domain,
        ttl: 3600
      }
    ];

    const result = await domainService.configureDNS(domain, shopifyRecords, provider);

    logger.info('Shopify domain setup completed', {
      domain,
      shopify_domain,
      recordsConfigured: result.records_configured
    });

    res.status(200).json(formatSuccessResponse({
      domain: result.domain,
      shopify_domain,
      provider: result.provider,
      records_configured: result.records_configured,
      total_records: result.total_records,
      shopify_records: shopifyRecords,
      configuration_results: result.results,
      setup_timestamp: new Date().toISOString(),
      next_steps: [
        'DNS records configured for Shopify integration',
        'In Shopify admin, go to Settings > Domains',
        `Add ${domain} as a custom domain`,
        'Verify domain ownership in Shopify',
        'Enable SSL certificate in Shopify settings',
        'DNS propagation may take 24-48 hours to complete'
      ],
      shopify_instructions: {
        admin_url: `https://${shopify_domain}/admin/settings/domains`,
        verification_steps: [
          'Click "Connect existing domain"',
          `Enter your domain: ${domain}`,
          'Verify DNS configuration',
          'Enable SSL certificate'
        ]
      }
    }, 'Domain configured for Shopify store'));

  } catch (error) {
    logger.error('Shopify domain setup failed', error, {
      domain: req.body.domain,
      shopify_domain: req.body.shopify_domain
    });

    res.status(500).json(formatErrorResponse(
      'Shopify domain setup failed',
      'SHOPIFY_DOMAIN_SETUP_ERROR',
      { error: error.message }
    ));
  }
});

/**
 * GET /api/executor/domains/providers
 * Get available domain providers
 */
router.get('/providers', async (req, res) => {
  try {
    const providers = domainService.getAvailableProviders();
    const defaultProvider = domainService.defaultProvider;

    const providerDetails = providers.map(key => ({
      id: key,
      name: domainService.providers[key].name,
      available: domainService.providers[key].available,
      is_default: key === defaultProvider,
      capabilities: key === 'mock' ? ['Testing', 'Demo'] : ['Search', 'Register', 'DNS Management']
    }));

    res.status(200).json(formatSuccessResponse({
      default_provider: defaultProvider,
      total_providers: providers.length,
      providers: providerDetails,
      provider_notes: {
        dnsimple: 'Developer-focused with comprehensive API',
        namesilo: 'Cost-effective with basic API functionality',
        mock: 'For testing and demonstrations only'
      }
    }, 'Domain providers information retrieved'));

  } catch (error) {
    logger.error('Failed to get providers', error);

    res.status(500).json(formatErrorResponse(
      'Failed to retrieve providers information',
      'PROVIDERS_ERROR',
      { error: error.message }
    ));
  }
});

/**
 * GET /api/executor/domains/health
 * Health check for domain service
 */
router.get('/health', async (req, res) => {
  try {
    const healthStatus = await domainService.getHealthStatus();

    res.status(200).json(formatSuccessResponse(
      healthStatus,
      'Domain service is operational'
    ));

  } catch (error) {
    logger.error('Domain health check failed', error);

    res.status(500).json(formatErrorResponse(
      'Domain service health check failed',
      'HEALTH_CHECK_ERROR',
      { error: error.message }
    ));
  }
});

module.exports = router;