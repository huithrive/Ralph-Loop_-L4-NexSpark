// Lovable Landing Page Generation Service
// Uses Lovable.dev's "Build with URL" API for programmatic page creation

const logger = require('../utils/logger');

/**
 * Lovable Landing Page Service
 *
 * Note: Lovable.dev uses a URL-based API rather than traditional REST/SDK approach.
 * See: https://docs.lovable.dev/integrations/build-with-url
 */
class LovableService {
  constructor() {
    this.baseUrl = 'https://lovable.dev';
    this.autoSubmit = true;

    // Validate environment configuration
    this.validateConfiguration();
  }

  /**
   * Validate service configuration
   */
  validateConfiguration() {
    // Note: Lovable doesn't require API keys for URL-based generation
    // but users need to be logged in to their platform
    logger.info('Lovable service initialized', {
      baseUrl: this.baseUrl,
      autoSubmit: this.autoSubmit
    });
  }

  /**
   * Generate a landing page URL based on GTM report data
   *
   * @param {Object} gtmReport - The GTM report object
   * @param {Object} options - Additional options for page generation
   * @returns {Object} Landing page generation result
   */
  async generateLandingPage(gtmReport, options = {}) {
    try {
      logger.info('Generating landing page with Lovable', {
        reportId: gtmReport.id,
        hasExecutiveSummary: !!gtmReport.report_data?.executive_summary
      });

      // Extract key information from GTM report
      const reportData = gtmReport.report_data || {};
      const executiveSummary = reportData.executive_summary || {};
      const targetAudience = reportData.target_audience || {};
      const channelStrategy = reportData.channel_strategy || {};

      // Build landing page prompt from GTM report
      const prompt = this.buildLandingPagePrompt({
        executiveSummary,
        targetAudience,
        channelStrategy,
        ...options
      });

      // Generate Lovable URL
      const lovableUrl = this.buildLovableUrl(prompt, options.images);

      logger.info('Landing page URL generated', {
        reportId: gtmReport.id,
        urlLength: lovableUrl.length,
        promptLength: prompt.length
      });

      return {
        success: true,
        data: {
          lovable_url: lovableUrl,
          prompt_used: prompt,
          page_type: options.pageType || 'landing_page',
          generation_method: 'lovable_url_api',
          instructions: [
            '1. Click the generated Lovable URL to open the page builder',
            '2. Log into your Lovable account when prompted',
            '3. Select your workspace to begin building',
            '4. The landing page will be generated automatically based on your GTM strategy',
            '5. Customize colors, content, and layout as needed',
            '6. Publish when ready'
          ]
        }
      };

    } catch (error) {
      logger.error('Failed to generate landing page', error, {
        reportId: gtmReport?.id || 'unknown'
      });
      throw new Error(`Landing page generation failed: ${error.message}`);
    }
  }

  /**
   * Build landing page prompt from GTM report data
   *
   * @param {Object} data - Extracted GTM report data
   * @returns {string} Landing page prompt
   */
  buildLandingPagePrompt(data) {
    const { executiveSummary = {}, targetAudience = {}, channelStrategy = {} } = data || {};

    let prompt = 'Create a high-converting landing page with the following specifications:\n\n';

    // Executive Summary -> Value Proposition
    if (executiveSummary.market_opportunity) {
      prompt += `VALUE PROPOSITION:\n${executiveSummary.market_opportunity}\n\n`;
    }

    if (executiveSummary.recommended_strategy) {
      prompt += `STRATEGY FOCUS:\n${executiveSummary.recommended_strategy}\n\n`;
    }

    // Target Audience -> Hero Section & Copy
    if (targetAudience.primary_persona) {
      const persona = targetAudience.primary_persona;
      prompt += 'TARGET AUDIENCE:\n';
      prompt += `Demographics: ${persona.demographics || 'Not specified'}\n`;
      prompt += `Pain Points: ${(persona.pain_points || []).join(', ')}\n`;
      prompt += `Goals: ${(persona.goals || []).join(', ')}\n\n`;
    }

    // Channel Strategy -> CTA and Design
    if (channelStrategy.recommended_channels) {
      prompt += `RECOMMENDED CHANNELS:\n${channelStrategy.recommended_channels.slice(0, 3).map(channel =>
        `- ${channel.channel}: ${channel.rationale || ''}`
      ).join('\n')}\n\n`;
    }

    // Design requirements
    prompt += 'DESIGN REQUIREMENTS:\n';
    prompt += '- Modern, clean design with high conversion focus\n';
    prompt += '- Clear value proposition in hero section\n';
    prompt += '- Trust signals and social proof\n';
    prompt += '- Strong call-to-action buttons\n';
    prompt += '- Mobile responsive design\n';
    prompt += '- Fast loading and SEO optimized\n';
    prompt += '- Contact form or lead capture\n';
    prompt += '- Professional color scheme and typography\n\n';

    prompt += 'Create a landing page that effectively converts the target audience and supports the recommended growth strategy.';

    return prompt;
  }

  /**
   * Build Lovable URL with proper encoding
   *
   * @param {string} prompt - The page generation prompt
   * @param {Array} images - Optional image URLs
   * @returns {string} Complete Lovable URL
   */
  buildLovableUrl(prompt, images = []) {
    try {
      // Start with base URL and autosubmit parameter
      let url = `${this.baseUrl}/?autosubmit=true#`;

      // Add encoded prompt
      const encodedPrompt = encodeURIComponent(prompt);
      url += `prompt=${encodedPrompt}`;

      // Add images if provided (max 10)
      if (images && images.length > 0) {
        const validImages = images.slice(0, 10).filter(img =>
          typeof img === 'string' && (img.includes('.jpg') || img.includes('.png') || img.includes('.webp'))
        );

        validImages.forEach(img => {
          url += `&images=${encodeURIComponent(img)}`;
        });
      }

      // Check URL length (browser limitations)
      if (url.length > 8192) {
        logger.warn('Lovable URL may be too long', {
          urlLength: url.length,
          promptLength: prompt.length
        });
      }

      return url;

    } catch (error) {
      logger.error('Failed to build Lovable URL', error);
      throw new Error(`URL generation failed: ${error.message}`);
    }
  }

  /**
   * Validate images for Lovable compatibility
   *
   * @param {Array} images - Array of image URLs
   * @returns {Array} Valid image URLs
   */
  validateImages(images) {
    if (!Array.isArray(images)) return [];

    return images.filter(img => {
      if (typeof img !== 'string') return false;
      if (!img.startsWith('http')) return false;
      if (!/\.(jpg|jpeg|png|webp)$/i.test(img)) return false;
      return true;
    }).slice(0, 10); // Max 10 images
  }

  /**
   * Get service health status
   *
   * @returns {Object} Service health information
   */
  async getHealthStatus() {
    return {
      service: 'LovableService',
      status: 'operational',
      base_url: this.baseUrl,
      api_method: 'url_based',
      documentation: 'https://docs.lovable.dev/integrations/build-with-url',
      limitations: [
        'Requires user login to Lovable platform',
        'URL-based API with length constraints',
        'No server-to-server authentication'
      ]
    };
  }
}

module.exports = LovableService;