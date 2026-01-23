/**
 * Report Generation Service for NexSpark GTM Strategy Reports
 *
 * Orchestrates the complete GTM report generation process using Claude AI
 */

const claudeService = require('./claudeService');
const dataSynthesisService = require('./dataSynthesisService');
const {
  GTM_SYSTEM_PROMPT,
  createFullReportPrompt,
  sectionPrompts,
  createValidationPrompt,
  createImprovementPrompt
} = require('../prompts/reportPrompts');
const logger = require('../utils/logger');

/**
 * Generate complete GTM strategy report
 * @param {string} researchId - Research result ID
 * @param {string} interviewSessionId - Interview session ID (optional)
 * @param {object} options - Generation options
 * @returns {Promise<object>} - Generated report and metadata
 */
async function generateGTMReport(researchId, interviewSessionId = null, options = {}) {
  const startTime = Date.now();

  try {
    logger.info('Starting GTM report generation', {
      researchId,
      interviewSessionId: interviewSessionId || 'none',
      options
    });

    // Step 1: Validate inputs
    const validation = await dataSynthesisService.validateSynthesisInputs(researchId, interviewSessionId);
    if (!validation.valid) {
      throw new Error(`Invalid inputs: ${validation.issues.join(', ')}`);
    }

    // Step 2: Synthesize data
    const context = await dataSynthesisService.combineInputs(researchId, interviewSessionId);

    logger.info('Data synthesized for report generation', {
      researchId,
      dataQuality: context.dataQuality,
      reportType: context.meta.reportType
    });

    // Step 3: Generate initial report
    let report;
    if (options.generateBySections) {
      report = await generateReportBySections(context);
    } else {
      report = await generateFullReport(context);
    }

    // Step 4: Validate report quality
    const validation_result = await validateReport(report, context);

    // Step 5: Improve if needed
    if (options.autoImprove && (!validation_result.isValid || validation_result.qualityScore < 80)) {
      logger.info('Report quality below threshold, attempting improvement', {
        qualityScore: validation_result.qualityScore,
        issues: validation_result.issues
      });

      report = await improveReport(report, validation_result, context);
    }

    const duration = Date.now() - startTime;

    logger.info('GTM report generation completed', {
      researchId,
      interviewSessionId,
      duration,
      qualityScore: validation_result.qualityScore,
      reportSections: Object.keys(report).length
    });

    return {
      report,
      metadata: {
        generatedAt: new Date().toISOString(),
        researchId,
        interviewSessionId,
        reportType: context.meta.reportType,
        dataQuality: context.dataQuality,
        validation: validation_result,
        generationTime: duration,
        confidenceScore: context.dataQuality.confidenceScore
      }
    };

  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error('GTM report generation failed', error, {
      researchId,
      interviewSessionId,
      duration,
      errorStage: error.stage || 'unknown'
    });

    throw error;
  }
}

/**
 * Generate complete report in single Claude call
 * @param {object} context - Synthesized research and interview context
 * @returns {Promise<object>} - Generated GTM report
 */
async function generateFullReport(context) {
  try {
    const prompt = createFullReportPrompt(context);

    logger.debug('Generating full report with single Claude call', {
      contextSize: JSON.stringify(context).length,
      reportType: context.meta.reportType
    });

    const response = await claudeService.callClaudeForJSON(prompt, {
      maxRetries: 3,
      timeout: 120000, // 2 minutes for complex report
      model: 'claude-sonnet-4-20250514'
    });

    if (!response || typeof response !== 'object') {
      throw new Error('Invalid report format received from Claude');
    }

    // Validate report structure
    validateReportStructure(response);

    return response;

  } catch (error) {
    error.stage = 'full_report_generation';
    logger.error('Full report generation failed', error);
    throw error;
  }
}

/**
 * Generate report section by section (alternative approach)
 * @param {object} context - Synthesized research and interview context
 * @returns {Promise<object>} - Generated GTM report
 */
async function generateReportBySections(context) {
  try {
    logger.debug('Generating report by sections', {
      contextSize: JSON.stringify(context).length,
      sections: Object.keys(sectionPrompts).length
    });

    const report = {};
    const sectionNames = Object.keys(sectionPrompts);

    // Generate each section sequentially to maintain coherence
    for (const sectionName of sectionNames) {
      try {
        const sectionPrompt = sectionPrompts[sectionName](context);

        const sectionData = await claudeService.callClaudeForJSON(sectionPrompt, {
          maxRetries: 2,
          timeout: 60000,
          model: 'claude-sonnet-4-20250514'
        });

        if (sectionData && typeof sectionData === 'object') {
          report[sectionName] = sectionData;
        } else {
          throw new Error(`Invalid ${sectionName} section format`);
        }

        logger.debug(`Generated ${sectionName} section`, {
          sectionSize: JSON.stringify(sectionData).length
        });

      } catch (error) {
        logger.error(`Failed to generate ${sectionName} section`, error);
        // Continue with other sections rather than failing completely
        report[sectionName] = {
          error: `Failed to generate ${sectionName}`,
          fallback: true
        };
      }
    }

    return report;

  } catch (error) {
    error.stage = 'sectional_report_generation';
    logger.error('Sectional report generation failed', error);
    throw error;
  }
}

/**
 * Validate generated report quality
 * @param {object} reportData - Generated report
 * @param {object} context - Original synthesis context
 * @returns {Promise<object>} - Validation result
 */
async function validateReport(reportData, context) {
  try {
    const validationPrompt = createValidationPrompt(reportData, context);

    const validation = await claudeService.callClaudeForJSON(validationPrompt, {
      maxRetries: 2,
      timeout: 30000,
      model: 'claude-sonnet-4-20250514'
    });

    return validation || {
      isValid: false,
      qualityScore: 0,
      issues: ['Validation failed - no response'],
      recommendations: ['Retry generation']
    };

  } catch (error) {
    logger.error('Report validation failed', error);

    // Fallback validation based on structure
    return {
      isValid: hasRequiredSections(reportData),
      qualityScore: calculateBasicQualityScore(reportData),
      issues: ['Automated validation unavailable'],
      recommendations: ['Manual review recommended'],
      validationError: error.message
    };
  }
}

/**
 * Improve report based on validation feedback
 * @param {object} reportData - Report to improve
 * @param {object} validationResult - Validation feedback
 * @param {object} context - Original context
 * @returns {Promise<object>} - Improved report
 */
async function improveReport(reportData, validationResult, context) {
  try {
    const improvementPrompt = createImprovementPrompt(reportData, validationResult, context);

    const improvedReport = await claudeService.callClaudeForJSON(improvementPrompt, {
      maxRetries: 2,
      timeout: 90000,
      model: 'claude-sonnet-4-20250514'
    });

    if (!improvedReport || typeof improvedReport !== 'object') {
      logger.warn('Report improvement failed, returning original');
      return reportData;
    }

    logger.info('Report improved successfully', {
      originalQuality: validationResult.qualityScore,
      improvementAttempted: true
    });

    return improvedReport;

  } catch (error) {
    logger.error('Report improvement failed', error);
    return reportData; // Return original if improvement fails
  }
}

/**
 * Validate report has required sections
 * @param {object} report - Report to validate
 * @returns {boolean} - True if all required sections present
 */
function validateReportStructure(report) {
  const requiredSections = [
    'executiveSummary',
    'marketAnalysis',
    'targetAudience',
    'channelStrategy',
    'actionPlan',
    'budgetFramework',
    'successMetrics'
  ];

  const missingSections = requiredSections.filter(section => !report[section]);

  if (missingSections.length > 0) {
    throw new Error(`Missing required sections: ${missingSections.join(', ')}`);
  }

  return true;
}

/**
 * Check if report has required sections (fallback validation)
 * @param {object} report - Report to check
 * @returns {boolean} - True if main sections exist
 */
function hasRequiredSections(report) {
  const requiredSections = [
    'executiveSummary',
    'marketAnalysis',
    'targetAudience',
    'channelStrategy'
  ];

  return requiredSections.every(section =>
    report[section] && typeof report[section] === 'object'
  );
}

/**
 * Calculate basic quality score based on content length and structure
 * @param {object} report - Report to score
 * @returns {number} - Quality score (0-100)
 */
function calculateBasicQualityScore(report) {
  let score = 0;
  const sections = Object.keys(report);

  // Section completeness (40%)
  if (sections.length >= 7) {
    score += 40;
  } else {
    score += Math.round((sections.length / 7) * 40);
  }

  // Content depth (40%)
  const contentScore = sections.reduce((acc, section) => {
    const content = report[section];
    if (content && typeof content === 'object') {
      const contentLength = JSON.stringify(content).length;
      if (contentLength > 500) return acc + 1; // Good depth
      if (contentLength > 200) return acc + 0.5; // Moderate depth
    }
    return acc;
  }, 0);

  score += Math.round((contentScore / sections.length) * 40);

  // Structure quality (20%)
  const hasGoodStructure = sections.some(section => {
    const content = report[section];
    return content && Object.keys(content).length >= 3;
  });

  if (hasGoodStructure) {
    score += 20;
  }

  return Math.min(score, 100);
}

/**
 * Generate report preview (executive summary only)
 * @param {string} researchId - Research ID
 * @param {string} interviewSessionId - Interview session ID (optional)
 * @returns {Promise<object>} - Executive summary preview
 */
async function generateReportPreview(researchId, interviewSessionId = null) {
  try {
    logger.info('Generating report preview', { researchId, interviewSessionId });

    const context = await dataSynthesisService.combineInputs(researchId, interviewSessionId);

    const executiveSummaryPrompt = sectionPrompts.executiveSummary(context);

    const summary = await claudeService.callClaudeForJSON(executiveSummaryPrompt, {
      maxRetries: 2,
      timeout: 30000,
      model: 'claude-sonnet-4-20250514'
    });

    return {
      executiveSummary: summary,
      metadata: {
        previewGeneratedAt: new Date().toISOString(),
        dataQuality: context.dataQuality,
        reportType: context.meta.reportType
      }
    };

  } catch (error) {
    logger.error('Report preview generation failed', error);
    throw error;
  }
}

/**
 * Get available report generation options
 * @returns {object} - Available options and their descriptions
 */
function getGenerationOptions() {
  return {
    generateBySections: {
      description: 'Generate report section by section for better error recovery',
      default: false,
      recommended: 'For complex reports with high data volumes'
    },
    autoImprove: {
      description: 'Automatically improve report if quality score is below threshold',
      default: true,
      recommended: 'Always enabled for production reports'
    },
    model: {
      description: 'Claude model to use for generation',
      options: ['claude-sonnet-4-20250514'],
      default: 'claude-sonnet-4-20250514'
    },
    timeout: {
      description: 'Maximum generation time in milliseconds',
      default: 120000,
      range: '30000-300000'
    },
    qualityThreshold: {
      description: 'Minimum quality score before auto-improvement kicks in',
      default: 80,
      range: '0-100'
    }
  };
}

module.exports = {
  generateGTMReport,
  generateReportPreview,
  getGenerationOptions,
  validateReport,
  // Export for testing
  generateFullReport,
  generateReportBySections,
  improveReport,
  validateReportStructure
};