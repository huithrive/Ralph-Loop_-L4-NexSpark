/**
 * Tests for Report Generation Service
 */

const reportGenerationService = require('../../services/reportGenerationService');
const claudeService = require('../../services/claudeService');
const dataSynthesisService = require('../../services/dataSynthesisService');

// Mock dependencies
jest.mock('../../services/claudeService');
jest.mock('../../services/dataSynthesisService');
jest.mock('../../utils/logger');

describe('Report Generation Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateGTMReport', () => {
    const mockContext = {
      business: {
        websiteUrl: 'https://example.com',
        productDescription: 'Test product',
        hasInterview: false
      },
      market: {
        size: { tam: '$1B', sam: '$100M' },
        competitors: [{ name: 'Competitor 1', positioning: 'Premium' }],
        painPoints: [{ problem: 'High costs', severity: 'high' }]
      },
      marketing: {
        channels: [{ name: 'SEO', priority: 'high' }]
      },
      dataQuality: {
        confidenceScore: 85,
        researchCompleteness: 90,
        interviewCompleteness: 0
      },
      meta: {
        reportType: 'research-only',
        researchId: 'test-research-id'
      }
    };

    const mockReport = {
      executiveSummary: {
        marketOpportunity: 'Large market opportunity',
        targetCustomer: 'Small businesses',
        competitiveAdvantage: 'Lower cost solution',
        revenueProjection: '$10K in 90 days'
      },
      marketAnalysis: {
        marketSize: { tam: '$1B', sam: '$100M', som: '$1M' }
      },
      targetAudience: {
        primaryPersona: { name: 'Business Owner' }
      },
      channelStrategy: {
        recommendedChannels: [{ channel: 'SEO', priority: 'high' }]
      },
      actionPlan: {
        phase1: { name: 'Foundation', milestone: '$1K' }
      },
      budgetFramework: {
        monthlyBudget: { month1: { amount: '$1000' } }
      },
      successMetrics: {
        primaryKPI: { metric: 'Revenue', target: '$10K' }
      }
    };

    test('should generate complete GTM report successfully', async () => {
      // Setup mocks
      dataSynthesisService.validateSynthesisInputs.mockResolvedValue({
        valid: true,
        issues: []
      });
      dataSynthesisService.combineInputs.mockResolvedValue(mockContext);
      claudeService.callClaudeForJSON.mockResolvedValue(mockReport);

      const result = await reportGenerationService.generateGTMReport('research-id');

      expect(result).toHaveProperty('report');
      expect(result).toHaveProperty('metadata');
      expect(result.report).toEqual(mockReport);
      expect(result.metadata.confidenceScore).toBe(85);
      expect(result.metadata.reportType).toBe('research-only');
    });

    test('should fail with invalid inputs', async () => {
      dataSynthesisService.validateSynthesisInputs.mockResolvedValue({
        valid: false,
        issues: ['Research not found']
      });

      await expect(
        reportGenerationService.generateGTMReport('invalid-id')
      ).rejects.toThrow('Invalid inputs: Research not found');
    });

    test('should generate report by sections when option enabled', async () => {
      dataSynthesisService.validateSynthesisInputs.mockResolvedValue({
        valid: true,
        issues: []
      });
      dataSynthesisService.combineInputs.mockResolvedValue(mockContext);

      // Mock section-by-section generation
      claudeService.callClaudeForJSON
        .mockResolvedValueOnce(mockReport.executiveSummary)
        .mockResolvedValueOnce(mockReport.marketAnalysis)
        .mockResolvedValueOnce(mockReport.targetAudience)
        .mockResolvedValueOnce(mockReport.channelStrategy)
        .mockResolvedValueOnce(mockReport.actionPlan)
        .mockResolvedValueOnce(mockReport.budgetFramework)
        .mockResolvedValueOnce(mockReport.successMetrics)
        .mockResolvedValue({ isValid: true, qualityScore: 85 }); // validation

      const result = await reportGenerationService.generateGTMReport(
        'research-id',
        null,
        { generateBySections: true }
      );

      expect(result.report).toHaveProperty('executiveSummary');
      expect(result.report).toHaveProperty('marketAnalysis');
      expect(claudeService.callClaudeForJSON).toHaveBeenCalledTimes(8); // 7 sections + validation
    });

    test('should handle Claude API errors gracefully', async () => {
      dataSynthesisService.validateSynthesisInputs.mockResolvedValue({
        valid: true,
        issues: []
      });
      dataSynthesisService.combineInputs.mockResolvedValue(mockContext);

      const claudeError = new Error('Claude API rate limit exceeded');
      claudeError.code = 'CLAUDE_API_ERROR';
      claudeService.callClaudeForJSON.mockRejectedValue(claudeError);

      await expect(
        reportGenerationService.generateGTMReport('research-id')
      ).rejects.toThrow('Claude API rate limit exceeded');
    });

    test('should auto-improve low quality reports', async () => {
      dataSynthesisService.validateSynthesisInputs.mockResolvedValue({
        valid: true,
        issues: []
      });
      dataSynthesisService.combineInputs.mockResolvedValue(mockContext);

      // Mock low quality initial report
      claudeService.callClaudeForJSON
        .mockResolvedValueOnce(mockReport) // initial report
        .mockResolvedValueOnce({ isValid: false, qualityScore: 60 }) // validation
        .mockResolvedValueOnce(mockReport); // improved report

      const result = await reportGenerationService.generateGTMReport(
        'research-id',
        null,
        { autoImprove: true }
      );

      expect(claudeService.callClaudeForJSON).toHaveBeenCalledTimes(3);
      expect(result.report).toEqual(mockReport);
    });
  });

  describe('generateReportPreview', () => {
    test('should generate executive summary preview', async () => {
      const mockContext = {
        business: { websiteUrl: 'https://example.com' },
        dataQuality: { confidenceScore: 85 },
        meta: { reportType: 'research-only' }
      };

      const mockSummary = {
        marketOpportunity: 'Large opportunity',
        targetCustomer: 'SMBs',
        revenueProjection: '$10K in 90 days'
      };

      dataSynthesisService.combineInputs.mockResolvedValue(mockContext);
      claudeService.callClaudeForJSON.mockResolvedValue(mockSummary);

      const result = await reportGenerationService.generateReportPreview('research-id');

      expect(result).toHaveProperty('executiveSummary', mockSummary);
      expect(result).toHaveProperty('metadata');
      expect(result.metadata.dataQuality.confidenceScore).toBe(85);
    });

    test('should handle preview generation errors', async () => {
      dataSynthesisService.combineInputs.mockRejectedValue(
        new Error('Research not found')
      );

      await expect(
        reportGenerationService.generateReportPreview('invalid-id')
      ).rejects.toThrow('Research not found');
    });
  });

  describe('validateReportStructure', () => {
    test('should validate complete report structure', () => {
      const completeReport = {
        executiveSummary: {},
        marketAnalysis: {},
        targetAudience: {},
        channelStrategy: {},
        actionPlan: {},
        budgetFramework: {},
        successMetrics: {}
      };

      expect(() => {
        reportGenerationService.validateReportStructure(completeReport);
      }).not.toThrow();
    });

    test('should reject incomplete report structure', () => {
      const incompleteReport = {
        executiveSummary: {},
        marketAnalysis: {}
        // Missing required sections
      };

      expect(() => {
        reportGenerationService.validateReportStructure(incompleteReport);
      }).toThrow('Missing required sections');
    });
  });

  describe('getGenerationOptions', () => {
    test('should return available generation options', () => {
      const options = reportGenerationService.getGenerationOptions();

      expect(options).toHaveProperty('generateBySections');
      expect(options).toHaveProperty('autoImprove');
      expect(options).toHaveProperty('model');
      expect(options.generateBySections).toHaveProperty('description');
      expect(options.autoImprove.default).toBe(true);
    });
  });

  describe('generateFullReport', () => {
    test('should generate report in single Claude call', async () => {
      const mockContext = {
        business: { websiteUrl: 'https://example.com' },
        market: {
          size: { tam: '$1B', sam: '$100M' },
          competitors: [{ name: 'Competitor 1' }],
          painPoints: [{ problem: 'High costs' }]
        },
        marketing: {
          channels: [{ name: 'SEO', priority: 'high' }]
        },
        dataQuality: { confidenceScore: 85 },
        meta: { reportType: 'research-only' }
      };

      const mockReport = {
        executiveSummary: { marketOpportunity: 'Test' },
        marketAnalysis: {},
        targetAudience: {},
        channelStrategy: {},
        actionPlan: {},
        budgetFramework: {},
        successMetrics: {}
      };

      claudeService.callClaudeForJSON.mockResolvedValue(mockReport);

      const result = await reportGenerationService.generateFullReport(mockContext);

      expect(result).toEqual(mockReport);
      expect(claudeService.callClaudeForJSON).toHaveBeenCalledWith(
        expect.stringContaining('Generate a comprehensive Go-to-Market strategy report'),
        expect.objectContaining({
          maxRetries: 3,
          timeout: 120000
        })
      );
    });

    test('should handle invalid Claude response', async () => {
      const mockContext = {
        business: { websiteUrl: 'https://example.com' },
        market: {
          size: { tam: '$1B', sam: '$100M' },
          competitors: [{ name: 'Competitor 1' }],
          painPoints: [{ problem: 'High costs' }]
        },
        marketing: {
          channels: [{ name: 'SEO', priority: 'high' }]
        },
        dataQuality: { confidenceScore: 85 },
        meta: { reportType: 'research-only' }
      };

      claudeService.callClaudeForJSON.mockResolvedValue(null);

      await expect(
        reportGenerationService.generateFullReport(mockContext)
      ).rejects.toThrow('Invalid report format received from Claude');
    });
  });

  describe('generateReportBySections', () => {
    test('should generate all sections sequentially', async () => {
      const mockContext = { meta: { reportType: 'research-only' } };

      // Mock responses for each section
      const mockSections = {
        executiveSummary: { marketOpportunity: 'Test' },
        marketAnalysis: { marketSize: 'Large' },
        targetAudience: { primaryPersona: 'SMB Owner' },
        channelStrategy: { recommendedChannels: [] },
        actionPlan: { phase1: {} },
        budgetFramework: { monthlyBudget: {} },
        successMetrics: { primaryKPI: {} }
      };

      claudeService.callClaudeForJSON
        .mockResolvedValueOnce(mockSections.executiveSummary)
        .mockResolvedValueOnce(mockSections.marketAnalysis)
        .mockResolvedValueOnce(mockSections.targetAudience)
        .mockResolvedValueOnce(mockSections.channelStrategy)
        .mockResolvedValueOnce(mockSections.actionPlan)
        .mockResolvedValueOnce(mockSections.budgetFramework)
        .mockResolvedValueOnce(mockSections.successMetrics);

      const result = await reportGenerationService.generateReportBySections(mockContext);

      expect(result).toEqual(mockSections);
      expect(claudeService.callClaudeForJSON).toHaveBeenCalledTimes(7);
    });

    test('should handle section generation failures gracefully', async () => {
      claudeService.callClaudeForJSON
        .mockResolvedValueOnce({ marketOpportunity: 'Test' }) // executiveSummary
        .mockRejectedValueOnce(new Error('API Error')) // marketAnalysis fails
        .mockResolvedValueOnce({ primaryPersona: 'Test' }); // targetAudience

      const result = await reportGenerationService.generateReportBySections({});

      expect(result.executiveSummary).toEqual({ marketOpportunity: 'Test' });
      expect(result.marketAnalysis).toEqual({
        error: 'Failed to generate marketAnalysis',
        fallback: true
      });
    });
  });

  describe('validateReport', () => {
    test('should validate report using Claude', async () => {
      const mockValidation = {
        isValid: true,
        qualityScore: 85,
        completeness: {
          executiveSummary: 'complete',
          marketAnalysis: 'complete'
        }
      };

      claudeService.callClaudeForJSON.mockResolvedValue(mockValidation);

      const result = await reportGenerationService.validateReport({}, {});

      expect(result).toEqual(mockValidation);
    });

    test('should use fallback validation when Claude fails', async () => {
      claudeService.callClaudeForJSON.mockRejectedValue(new Error('API Error'));

      const report = {
        executiveSummary: {},
        marketAnalysis: {},
        targetAudience: {},
        channelStrategy: {}
      };

      const result = await reportGenerationService.validateReport(report, {});

      expect(result.isValid).toBe(true); // Has required sections
      expect(result.qualityScore).toBeGreaterThan(0);
      expect(result.validationError).toBe('API Error');
    });
  });

  describe('improveReport', () => {
    test('should improve report based on validation feedback', async () => {
      const originalReport = { executiveSummary: { marketOpportunity: 'Weak' } };
      const improvedReport = { executiveSummary: { marketOpportunity: 'Strong opportunity' } };
      const validationResult = { qualityScore: 60, issues: ['Too generic'] };

      claudeService.callClaudeForJSON.mockResolvedValue(improvedReport);

      const result = await reportGenerationService.improveReport(
        originalReport,
        validationResult,
        {}
      );

      expect(result).toEqual(improvedReport);
    });

    test('should return original report if improvement fails', async () => {
      const originalReport = { executiveSummary: {} };
      claudeService.callClaudeForJSON.mockRejectedValue(new Error('API Error'));

      const result = await reportGenerationService.improveReport(
        originalReport,
        {},
        {}
      );

      expect(result).toEqual(originalReport);
    });
  });
});