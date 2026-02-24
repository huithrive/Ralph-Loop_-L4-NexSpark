/**
 * Report generation routes
 */

import { Hono } from 'hono';
import {
  createReport,
  updateReport,
  getReport,
  getLatestReport,
  getInterview,
  deleteReport,
  savePreviewData,
} from '../services/database';
import { markPreviewGenerated } from '../repositories/report-repository';
import { successResponse, errorResponse } from '../utils/api-response';
import { generateGenerationId, generateReportId } from '../utils/id-generator';
import type { ReportGenerationState } from '../types';
import { createRequestLogger } from '../utils/logger';
import { isReportTimedOut } from '../utils/report-timeout';
import { TIMEOUTS } from '../config/timeouts';
import { requireAuth, extractUserId } from '../middleware/auth.middleware';
import type { AuthContext } from '../middleware/types';

export const reportRoutes = new Hono<AuthContext>();

reportRoutes.use('/*', requireAuth());

// Get report status for interview (must be before /:reportId to avoid conflicts)
reportRoutes.get('/status/:interviewId', async (c) => {
  const log = createRequestLogger(c);
  try {
    const interviewId = c.req.param('interviewId');
    const userId = extractUserId(c);

    const interview = await getInterview(c.env.DB, interviewId);
    if (!interview) {
      return c.json(errorResponse('Interview not found'), 404);
    }

    if (interview.user_id !== userId) {
      log.warn('Authorization failed: User attempted to access another user\'s report status', {
        userId,
        interviewId,
        ownerId: interview.user_id
      });
      return c.json(errorResponse('Unauthorized'), 403);
    }

    const report = await getLatestReport(c.env.DB, interviewId);

    if (!report) {
      return c.json({
        success: true,
        exists: false,
        status: null
      });
    }

    // Check if report has timed out
    if (isReportTimedOut(report, TIMEOUTS.reportGeneration.maxDuration)) {
      log.warn('Report generation timed out', {
        reportId: report.id,
        interviewId,
        startedAt: report.generation_started_at
      });

      // Update report to FAILED status
      await updateReport(c.env.DB, report.id, {
        status: 'FAILED',
        error: 'Report generation timed out after 10 minutes. Please try again.'
      });

      // Update local report object to return correct status
      report.status = 'FAILED';
      report.error = 'Report generation timed out after 10 minutes. Please try again.';
    }

    const status = report.status;

    // Check if preview data exists
    let hasPreviewData = false;
    try {
      if (report.preview_data) {
        const previewData = JSON.parse(report.preview_data);
        hasPreviewData = !!(previewData.competitors || previewData.roadmap || previewData.benchmarks);
      }
    } catch (e) {
      // Invalid JSON or no preview data
      hasPreviewData = false;
    }

    log.debug('Report status retrieved', { interviewId, reportId: report.id, status: report.status });
    return c.json({
      success: true,
      exists: true,
      reportId: report.id,
      status: status,
      progress: report.progress,
      needsRegeneration: report.needs_regeneration,
      error: report.error,
      version: report.version,
      hasPreviewData: hasPreviewData
    });
  } catch (error: any) {
    log.error('Get report status error', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Get preview status for report by reportId
reportRoutes.get('/preview-status/:reportId', async (c) => {
  const log = createRequestLogger(c);
  try {
    const reportId = c.req.param('reportId');
    const userId = extractUserId(c);

    const report = await getReport(c.env.DB, reportId);

    if (!report) {
      return c.json(errorResponse('Report not found'), 404);
    }

    if (report.user_id !== userId) {
      log.warn('Authorization failed: User attempted to access another user\'s report preview', {
        userId,
        reportId,
        ownerId: report.user_id
      });
      return c.json(errorResponse('Unauthorized'), 403);
    }

    // Parse preview data
    let hasPreviewData = false;
    let previewData = null;

    try {
      if (report.preview_data) {
        previewData = JSON.parse(report.preview_data);
        hasPreviewData = !!(previewData.competitors || previewData.roadmap || previewData.benchmarks);
      }
    } catch (e) {
      log.warn('Failed to parse preview data', { reportId, error: e });
      hasPreviewData = false;
      previewData = null;
    }

    log.info('Preview status retrieved', { reportId, hasPreviewData });

    return c.json({
      success: true,
      reportId: report.id,
      hasPreviewData: hasPreviewData,
      previewData: previewData,
      status: report.status,
      progress: report.progress || 0
    });
  } catch (error: any) {
    log.error('Get preview status error', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Regenerate report for interview (after edits)
// TODO: Re-enable after beta
reportRoutes.post('/regenerate/:interviewId', async (c) => {
  // BETA: Disable regeneration during beta
  return c.json({
    success: false,
    error: 'FEATURE_TEMPORARILY_DISABLED',
    message: `Report regeneration is temporarily disabled during beta. Contact ${c.env.SUPPORT_EMAIL} for assistance.`,
  }, 403);
});

// Start report generation for interview (idempotent)
reportRoutes.post('/generate/:interviewId', async (c) => {
  const log = createRequestLogger(c);
  try {
    const interviewId = c.req.param('interviewId');
    const { reportFormat, brandName, forceNew } = await c.req.json();
    const userId = extractUserId(c);

    // Check if interview exists
    const interview = await getInterview(c.env.DB, interviewId);

    if (!interview) {
      return c.json(errorResponse('Interview not found'), 404);
    }

    if (interview.user_id !== userId) {
      log.warn('Authorization failed: User attempted to generate report for another user\'s interview', {
        userId,
        interviewId,
        ownerId: interview.user_id
      });
      return c.json(errorResponse('Unauthorized'), 403);
    }

    // Check for existing report
    // TODO: Re-enable regeneration after beta by respecting forceNew parameter
    // For now, always return existing report (regeneration temporarily disabled)
    const existingReport = await getLatestReport(c.env.DB, interviewId);

    if (existingReport) {
      const status = existingReport.status;

      // Log if regeneration was requested but disabled
      if (forceNew) {
        log.info('Regeneration requested but disabled during beta', {
          reportId: existingReport.id,
          interviewId
        });
      }

      // If report is in progress, return it (don't create new one)
      if (status === 'GENERATING' || status === 'PENDING') {
        log.info('📋 Returning existing in-progress report', {
          reportId: existingReport.id,
          interviewId,
          status
        });

        return c.json({
          success: true,
          reportId: existingReport.id,
          version: existingReport.version,
          status: status,
          progress: existingReport.progress || 0,
          message: 'Report generation already in progress',
          isExisting: true
        });
      }

      // If report is completed, return it
      if (status === 'COMPLETED') {
        log.info('Returning existing completed report', {
          reportId: existingReport.id,
          interviewId
        });

        return c.json({
          success: true,
          reportId: existingReport.id,
          version: existingReport.version,
          status: 'COMPLETED',
          progress: 100,
          message: 'Report already exists (regeneration disabled during beta)',
          isExisting: true
        });
      }

      // If status is FAILED, we'll create a new report below
      if (status === 'FAILED') {
        log.info('🔄 Previous report failed, creating new version', {
          interviewId,
          previousVersion: existingReport.version
        });
      }
    }

    // Create new report (either no existing report, failed report, or forceNew requested)
    const result = await createReport(c.env.DB, {
      interviewId,
      userId,
      reportFormat: reportFormat || 'legacy',
      brandName
    });

    // Queue report generation
    await updateReport(c.env.DB, result.reportId, {
      status: 'GENERATING',
      progress: 0
    });

    // Send to queue for background processing
    await c.env.REPORT_QUEUE.send({
      reportId: result.reportId,
      interviewId,
      userId,
      brandName
    });

    log.info('📤 Queued report generation', {
      reportId: result.reportId,
      interviewId,
      format: reportFormat,
      isRetry: forceNew || (existingReport?.status === 'FAILED')
    });

    return c.json({
      success: true,
      reportId: result.reportId,
      version: result.version,
      status: 'GENERATING',
      progress: 0,
      message: 'Report generation queued',
      isExisting: false
    });
  } catch (error: any) {
    log.error('Start report generation error', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Get report by ID
reportRoutes.get('/:reportId', async (c) => {
  const log = createRequestLogger(c);
  try {
    const reportId = c.req.param('reportId');
    const userId = extractUserId(c);

    const report = await getReport(c.env.DB, reportId);

    if (!report) {
      log.warn('Report not found', { reportId });
      return c.json(errorResponse('Report not found'), 404);
    }

    if (report.user_id !== userId) {
      log.warn('Authorization failed: User attempted to access another user\'s report', {
        userId,
        reportId,
        ownerId: report.user_id
      });
      return c.json(errorResponse('Unauthorized'), 403);
    }

    log.info('Retrieved report', { reportId, status: report.status });
    return c.json({
      success: true,
      report: {
        ...report,
        html_report: report.html_report,
        brand_name: report.brand_name,
      },
    });
  } catch (error: any) {
    log.error('Get report error', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Save preview data to report
reportRoutes.post('/:reportId/save-preview', async (c) => {
  const log = createRequestLogger(c);
  try {
    const reportId = c.req.param('reportId');
    const userId = extractUserId(c);
    const { competitors, roadmap, benchmarks, competitorUsage, roadmapUsage, benchmarksUsage } = await c.req.json();

    if (!c.env.DB) {
      return c.json(errorResponse('Database not configured'), 500);
    }

    const report = await getReport(c.env.DB, reportId);

    if (!report) {
      return c.json(errorResponse('Report not found'), 404);
    }

    if (report.user_id !== userId) {
      log.warn('Authorization failed: User attempted to modify another user\'s report preview', {
        userId,
        reportId,
        ownerId: report.user_id
      });
      return c.json(errorResponse('Unauthorized'), 403);
    }

    // Validate preview data structure
    if (!competitors && !roadmap && !benchmarks) {
      return c.json(errorResponse('At least one preview data field is required'), 400);
    }

    await savePreviewData(c.env.DB, reportId, {
      competitors,
      roadmap,
      benchmarks
    });

    // Mark preview as generated since preview data was saved
    await markPreviewGenerated(c.env.DB, reportId);

    log.info('Preview data saved and marked as generated', { reportId });

    log.info('Preview data saved', { reportId, hasCompetitors: !!competitors, hasRoadmap: !!roadmap, hasBenchmarks: !!benchmarks });
    return c.json({
      success: true,
      message: 'Preview data saved'
    });
  } catch (error: any) {
    log.error('Save preview data error', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Delete report
reportRoutes.delete('/:reportId', async (c) => {
  const log = createRequestLogger(c);
  try {
    const reportId = c.req.param('reportId');
    const userId = extractUserId(c);

    const report = await getReport(c.env.DB, reportId);

    if (!report) {
      log.warn('Report not found', { reportId });
      return c.json(errorResponse('Report not found'), 404);
    }

    if (report.user_id !== userId) {
      log.warn('Authorization failed: User attempted to delete another user\'s report', {
        userId,
        reportId,
        ownerId: report.user_id
      });
      return c.json(errorResponse('Unauthorized'), 403);
    }

    await deleteReport(c.env.DB, reportId);

    log.info('Report deleted', { reportId });
    return c.json(successResponse(null, 'Report deleted'));
  } catch (error: any) {
    log.error('Delete report error', error);
    return c.json(errorResponse(error.message), 500);
  }
});

