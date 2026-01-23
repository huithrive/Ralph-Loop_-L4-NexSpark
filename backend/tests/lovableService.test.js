// Tests for Lovable Landing Page Service
const LovableService = require('../services/lovableService');

describe('Lovable Service Tests', () => {
  let lovableService;

  beforeEach(() => {
    lovableService = new LovableService();
  });

  describe('Service Initialization', () => {
    test('should initialize service correctly', () => {
      expect(lovableService.baseUrl).toBe('https://lovable.dev');
      expect(lovableService.autoSubmit).toBe(true);
    });

    test('should provide health status', async () => {
      const health = await lovableService.getHealthStatus();

      expect(health.service).toBe('LovableService');
      expect(health.status).toBe('operational');
      expect(health.api_method).toBe('url_based');
      expect(Array.isArray(health.limitations)).toBe(true);
    });
  });

  describe('URL Generation', () => {
    test('should build basic Lovable URL', () => {
      const prompt = 'Create a simple landing page';
      const url = lovableService.buildLovableUrl(prompt);

      expect(url).toContain('https://lovable.dev');
      expect(url).toContain('autosubmit=true');
      expect(url).toContain('prompt=');
      expect(url).toContain(encodeURIComponent(prompt));
    });

    test('should handle images in URL generation', () => {
      const prompt = 'Create a landing page';
      const images = ['https://example.com/logo.png', 'https://example.com/hero.jpg'];
      const url = lovableService.buildLovableUrl(prompt, images);

      expect(url).toContain('images=');
      expect(url).toContain(encodeURIComponent(images[0]));
      expect(url).toContain(encodeURIComponent(images[1]));
    });

    test('should limit images to maximum 10', () => {
      const prompt = 'Create a landing page';
      const images = Array(15).fill(0).map((_, i) => `https://example.com/image${i}.jpg`);
      const url = lovableService.buildLovableUrl(prompt, images);

      // Count image parameters
      const imageCount = (url.match(/images=/g) || []).length;
      expect(imageCount).toBeLessThanOrEqual(10);
    });
  });

  describe('Prompt Generation', () => {
    test('should build landing page prompt from GTM data', () => {
      const data = {
        executiveSummary: {
          market_opportunity: 'Test market opportunity',
          recommended_strategy: 'Test strategy'
        },
        targetAudience: {
          primary_persona: {
            demographics: 'Test demographics',
            pain_points: ['Pain 1', 'Pain 2'],
            goals: ['Goal 1', 'Goal 2']
          }
        },
        channelStrategy: {
          recommended_channels: [
            { channel: 'Facebook Ads', rationale: 'High reach' },
            { channel: 'Google Ads', rationale: 'Intent-based' }
          ]
        }
      };

      const prompt = lovableService.buildLandingPagePrompt(data);

      expect(prompt).toContain('VALUE PROPOSITION');
      expect(prompt).toContain('Test market opportunity');
      expect(prompt).toContain('TARGET AUDIENCE');
      expect(prompt).toContain('Test demographics');
      expect(prompt).toContain('RECOMMENDED CHANNELS');
      expect(prompt).toContain('Facebook Ads');
      expect(prompt).toContain('DESIGN REQUIREMENTS');
    });

    test('should handle missing GTM data gracefully', () => {
      const data = {};
      const prompt = lovableService.buildLandingPagePrompt(data);

      expect(prompt).toContain('Create a high-converting landing page');
      expect(prompt).toContain('DESIGN REQUIREMENTS');
    });
  });

  describe('Image Validation', () => {
    test('should validate image URLs correctly', () => {
      const validImages = [
        'https://example.com/image.jpg',
        'https://example.com/image.png',
        'https://example.com/image.webp'
      ];
      const invalidImages = [
        'not-a-url',
        'https://example.com/image.gif',
        'ftp://example.com/image.jpg',
        null,
        123
      ];

      const allImages = [...validImages, ...invalidImages];
      const validated = lovableService.validateImages(allImages);

      expect(validated).toEqual(validImages);
    });

    test('should limit validated images to 10', () => {
      const manyImages = Array(15).fill(0).map((_, i) => `https://example.com/image${i}.jpg`);
      const validated = lovableService.validateImages(manyImages);

      expect(validated.length).toBe(10);
    });

    test('should handle non-array input', () => {
      const validated = lovableService.validateImages('not-an-array');
      expect(validated).toEqual([]);
    });
  });

  describe('Landing Page Generation', () => {
    test('should generate landing page for valid GTM report', async () => {
      const mockGtmReport = {
        id: 'test-report-id',
        report_data: {
          executive_summary: {
            market_opportunity: 'Test opportunity',
            recommended_strategy: 'Test strategy'
          },
          target_audience: {
            primary_persona: {
              demographics: 'Test demographics',
              pain_points: ['Pain 1'],
              goals: ['Goal 1']
            }
          },
          channel_strategy: {
            recommended_channels: [
              { channel: 'Facebook Ads', rationale: 'High reach' }
            ]
          }
        }
      };

      const options = {
        pageType: 'landing_page',
        images: ['https://example.com/logo.png']
      };

      const result = await lovableService.generateLandingPage(mockGtmReport, options);

      expect(result.success).toBe(true);
      expect(result.data.lovable_url).toContain('https://lovable.dev');
      expect(result.data.generation_method).toBe('lovable_url_api');
      expect(Array.isArray(result.data.instructions)).toBe(true);
      expect(result.data.prompt_used).toContain('Create a high-converting landing page');
    });

    test('should handle GTM report with minimal data', async () => {
      const mockGtmReport = {
        id: 'minimal-report',
        report_data: {
          executive_summary: {
            market_opportunity: 'Basic opportunity'
          }
        }
      };

      const result = await lovableService.generateLandingPage(mockGtmReport);

      expect(result.success).toBe(true);
      expect(result.data.lovable_url).toContain('https://lovable.dev');
    });

    test('should handle generation error gracefully', async () => {
      const invalidReport = null;

      await expect(lovableService.generateLandingPage(invalidReport))
        .rejects.toThrow('Landing page generation failed');
    });
  });
});