/**
 * Tests for GTM Reports API endpoints
 */

// Mock dependencies FIRST before any imports
jest.mock('../../../services/reportGenerationService');
jest.mock('../../../services/dataSynthesisService');
jest.mock('../../../utils/logger');
jest.mock('../../../models/ResearchResult');
jest.mock('../../../models/InterviewSession');

const request = require('supertest');
const express = require('express');
const reportRoutes = require('../../../api/strategist/reports');
const reportGenerationService = require('../../../services/reportGenerationService');
const dataSynthesisService = require('../../../services/dataSynthesisService');

const app = express();
app.use(express.json());
app.use('/api/strategist/reports', reportRoutes);

describe('Reports API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/strategist/reports/generate', () => {
    const validRequest = {
      researchId: '123e4567-e89b-42d3-a456-426614174001',
      options: {
        autoImprove: true,
        generateBySections: false
      }
    };

    const mockReport = {
      executiveSummary: {
        marketOpportunity: 'Large market opportunity',
        targetCustomer: 'Small businesses'
      },
      marketAnalysis: {
        marketSize: { tam: '$1B', sam: '$100M' }
      }
    };

    const mockResult = {
      report: mockReport,
      metadata: {
        generatedAt: '2024-01-01T00:00:00.000Z',
        researchId: validRequest.researchId,
        confidenceScore: 85,
        validation: { qualityScore: 85, isValid: true },
        generationTime: 5000
      }
    };

    test('should generate GTM report successfully', async () => {
      reportGenerationService.generateGTMReport.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/strategist/reports/generate')
        .send(validRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.report).toEqual(mockReport);
      expect(response.body.data.metadata.confidenceScore).toBe(85);
      expect(reportGenerationService.generateGTMReport).toHaveBeenCalledWith(
        validRequest.researchId,
        undefined,
        expect.objectContaining({
          autoImprove: true,
          generateBySections: false
        })
      );
    });

    test('should generate report with interview data', async () => {
      const requestWithInterview = {
        ...validRequest,
        interviewSessionId: '987fcdeb-51a2-44e5-b678-123456789def'
      };

      reportGenerationService.generateGTMReport.mockResolvedValue({
        ...mockResult,
        metadata: {
          ...mockResult.metadata,
          interviewSessionId: requestWithInterview.interviewSessionId
        }
      });

      const response = await request(app)
        .post('/api/strategist/reports/generate')
        .send(requestWithInterview)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(reportGenerationService.generateGTMReport).toHaveBeenCalledWith(
        requestWithInterview.researchId,
        requestWithInterview.interviewSessionId,
        expect.any(Object)
      );
    });

    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/strategist/reports/generate')
        .send({})
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'Research ID must be a valid UUID'
          })
        ])
      );
    });

    test('should validate UUID format', async () => {
      const response = await request(app)
        .post('/api/strategist/reports/generate')
        .send({
          researchId: 'invalid-uuid',
          interviewSessionId: 'also-invalid'
        })
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toHaveLength(2);
    });

    test('should handle resource not found errors', async () => {
      const error = new Error('Research result not found: invalid-id');
      reportGenerationService.generateGTMReport.mockRejectedValue(error);

      const response = await request(app)
        .post('/api/strategist/reports/generate')
        .send(validRequest)
        .expect(404);

      expect(response.body.error).toBe('Resource Not Found');
      expect(response.body.message).toContain('not found');
    });

    test('should handle invalid inputs errors', async () => {
      const error = new Error('Invalid inputs: Research not found');
      reportGenerationService.generateGTMReport.mockRejectedValue(error);

      const response = await request(app)
        .post('/api/strategist/reports/generate')
        .send(validRequest)
        .expect(400);

      expect(response.body.error).toBe('Invalid Request');
      expect(response.body.message).toContain('Invalid inputs');
    });

    test('should handle Claude API errors', async () => {
      const error = new Error('Claude API rate limit exceeded');
      error.code = 'CLAUDE_API_ERROR';
      reportGenerationService.generateGTMReport.mockRejectedValue(error);

      const response = await request(app)
        .post('/api/strategist/reports/generate')
        .send(validRequest)
        .expect(503);

      expect(response.body.error).toBe('AI Service Unavailable');
      expect(response.body.retryAfter).toBe(30);
    });

    test('should handle unexpected errors', async () => {
      const error = new Error('Database connection failed');
      reportGenerationService.generateGTMReport.mockRejectedValue(error);

      const response = await request(app)
        .post('/api/strategist/reports/generate')
        .send(validRequest)
        .expect(500);

      expect(response.body.error).toBe('Report Generation Failed');
    });

    test('should apply default options when not provided', async () => {
      const requestWithoutOptions = {
        researchId: validRequest.researchId
      };

      reportGenerationService.generateGTMReport.mockResolvedValue(mockResult);

      await request(app)
        .post('/api/strategist/reports/generate')
        .send(requestWithoutOptions)
        .expect(200);

      expect(reportGenerationService.generateGTMReport).toHaveBeenCalledWith(
        validRequest.researchId,
        undefined,
        expect.objectContaining({
          generateBySections: false,
          autoImprove: true,
          qualityThreshold: 80
        })
      );
    });
  });

  describe('POST /api/strategist/reports/preview', () => {
    const validRequest = {
      researchId: '123e4567-e89b-42d3-a456-426614174000'
    };

    const mockPreview = {
      executiveSummary: {
        marketOpportunity: 'Large market opportunity',
        targetCustomer: 'Small businesses'
      },
      metadata: {
        previewGeneratedAt: '2024-01-01T00:00:00.000Z',
        dataQuality: { confidenceScore: 85 },
        reportType: 'research-only'
      }
    };

    test('should generate report preview successfully', async () => {
      reportGenerationService.generateReportPreview.mockResolvedValue(mockPreview);

      const response = await request(app)
        .post('/api/strategist/reports/preview')
        .send(validRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockPreview);
      expect(reportGenerationService.generateReportPreview).toHaveBeenCalledWith(
        validRequest.researchId,
        undefined
      );
    });

    test('should generate preview with interview data', async () => {
      const requestWithInterview = {
        ...validRequest,
        interviewSessionId: '987fcdeb-51a2-44e5-b678-123456789def'
      };

      reportGenerationService.generateReportPreview.mockResolvedValue(mockPreview);

      const response = await request(app)
        .post('/api/strategist/reports/preview')
        .send(requestWithInterview)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(reportGenerationService.generateReportPreview).toHaveBeenCalledWith(
        requestWithInterview.researchId,
        requestWithInterview.interviewSessionId
      );
    });

    test('should validate required fields for preview', async () => {
      const response = await request(app)
        .post('/api/strategist/reports/preview')
        .send({})
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });

    test('should handle preview generation errors', async () => {
      const error = new Error('Research not found');
      reportGenerationService.generateReportPreview.mockRejectedValue(error);

      const response = await request(app)
        .post('/api/strategist/reports/preview')
        .send(validRequest)
        .expect(404);

      expect(response.body.error).toBe('Resource Not Found');
    });
  });

  describe('POST /api/strategist/reports/validate-inputs', () => {
    const validRequest = {
      researchId: '123e4567-e89b-42d3-a456-426614174000'
    };

    test('should validate inputs successfully', async () => {
      const mockValidation = {
        valid: true,
        issues: []
      };

      const mockContext = {
        dataQuality: {
          confidenceScore: 85,
          researchCompleteness: 90
        }
      };

      dataSynthesisService.validateSynthesisInputs.mockResolvedValue(mockValidation);
      dataSynthesisService.combineInputs.mockResolvedValue(mockContext);

      const response = await request(app)
        .post('/api/strategist/reports/validate-inputs')
        .send(validRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.valid).toBe(true);
      expect(response.body.data.dataQuality).toEqual(mockContext.dataQuality);
    });

    test('should return validation issues', async () => {
      const mockValidation = {
        valid: false,
        issues: ['Research not found', 'Interview incomplete']
      };

      dataSynthesisService.validateSynthesisInputs.mockResolvedValue(mockValidation);

      const response = await request(app)
        .post('/api/strategist/reports/validate-inputs')
        .send(validRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.valid).toBe(false);
      expect(response.body.data.issues).toEqual(mockValidation.issues);
    });

    test('should handle validation service errors', async () => {
      dataSynthesisService.validateSynthesisInputs.mockRejectedValue(
        new Error('Database error')
      );

      const response = await request(app)
        .post('/api/strategist/reports/validate-inputs')
        .send(validRequest)
        .expect(500);

      expect(response.body.error).toBe('Validation Failed');
    });
  });

  describe('GET /api/strategist/reports/options', () => {
    test('should return generation options', async () => {
      const mockOptions = {
        generateBySections: {
          description: 'Generate report section by section',
          default: false
        },
        autoImprove: {
          description: 'Auto improve low quality reports',
          default: true
        }
      };

      reportGenerationService.getGenerationOptions.mockReturnValue(mockOptions);

      const response = await request(app)
        .get('/api/strategist/reports/options')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.options).toEqual(mockOptions);
      expect(response.body.data.examples).toBeDefined();
    });

    test('should handle options retrieval errors', async () => {
      reportGenerationService.getGenerationOptions.mockImplementation(() => {
        throw new Error('Options not available');
      });

      const response = await request(app)
        .get('/api/strategist/reports/options')
        .expect(500);

      expect(response.body.error).toBe('Options Retrieval Failed');
    });
  });

  describe('GET /api/strategist/reports/data-synthesis/:researchId', () => {
    const researchId = '123e4567-e89b-42d3-a456-426614174000';

    const mockContext = {
      business: {
        websiteUrl: 'https://example.com',
        productDescription: 'Test product'
      },
      market: {
        size: { tam: '$1B', sam: '$100M' },
        competitors: [
          { name: 'Competitor 1', positioning: 'Premium', website: 'comp1.com' }
        ],
        painPoints: [
          { problem: 'High costs', severity: 'high', frequency: 'Often' }
        ],
        opportunities: ['Opportunity 1', 'Opportunity 2'],
        threats: ['Threat 1']
      },
      marketing: {
        channels: [
          { name: 'SEO', priority: 'high', rationale: 'Good ROI' }
        ]
      },
      dataQuality: { confidenceScore: 85 },
      meta: { reportType: 'research-only' }
    };

    test('should return data synthesis preview', async () => {
      dataSynthesisService.combineInputs.mockResolvedValue(mockContext);

      const response = await request(app)
        .get(`/api/strategist/reports/data-synthesis/${researchId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.business).toEqual(mockContext.business);
      expect(response.body.data.dataQuality).toEqual(mockContext.dataQuality);

      // Should filter sensitive data for preview
      expect(response.body.data.market.competitors[0]).not.toHaveProperty('website');
      expect(response.body.data.market.painPoints[0]).not.toHaveProperty('frequency');
    });

    test('should include interview session ID in query', async () => {
      const interviewSessionId = '987fcdeb-51a2-34e5-b678-123456789abc';
      dataSynthesisService.combineInputs.mockResolvedValue(mockContext);

      const response = await request(app)
        .get(`/api/strategist/reports/data-synthesis/${researchId}`)
        .query({ interviewSessionId })
        .expect(200);

      expect(dataSynthesisService.combineInputs).toHaveBeenCalledWith(
        researchId,
        interviewSessionId
      );
    });

    test('should validate researchId UUID format', async () => {
      const response = await request(app)
        .get('/api/strategist/reports/data-synthesis/invalid-uuid')
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });

    test('should handle synthesis errors', async () => {
      dataSynthesisService.combineInputs.mockRejectedValue(
        new Error('Research not found')
      );

      const response = await request(app)
        .get(`/api/strategist/reports/data-synthesis/${researchId}`)
        .expect(404);

      expect(response.body.error).toBe('Resource Not Found');
    });
  });

  describe('GET /api/strategist/reports/health', () => {
    test('should return healthy status when all services operational', async () => {
      // Mock successful Claude service test
      jest.doMock('../../../services/claudeService', () => ({
        callClaude: jest.fn().mockResolvedValue('OK')
      }));

      const response = await request(app)
        .get('/api/strategist/reports/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.status).toBe('healthy');
      expect(response.body.services.reportService).toBe('operational');
    });

    test('should return degraded status when Claude service fails', async () => {
      // Mock failed Claude service test
      jest.doMock('../../../services/claudeService', () => ({
        callClaude: jest.fn().mockRejectedValue(new Error('API Error'))
      }));

      const response = await request(app)
        .get('/api/strategist/reports/health')
        .expect(503);

      expect(response.body.status).toBe('degraded');
    });

    test('should handle health check errors', async () => {
      // Force an error in the health check
      jest.doMock('../../../services/claudeService', () => {
        throw new Error('Module error');
      });

      const response = await request(app)
        .get('/api/strategist/reports/health')
        .expect(503);

      expect(response.body.success).toBe(false);
      expect(response.body.status).toBe('unhealthy');
    });
  });
});