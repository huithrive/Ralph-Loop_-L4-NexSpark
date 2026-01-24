// Reports API - Module 4 Analyzer
// Weekly report generation and management

const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const ReportService = require('../../services/analyzer/reportService');
const logger = require('../../utils/logger');
const { success: formatSuccessResponse, error: formatErrorResponse } = require('../../utils/responseFormatter');

const router = express.Router();
const reportService = new ReportService();

/**
 * POST /api/analyzer/reports/generate
 * Generate a new performance report
 */
router.post('/generate', [
  body('user_id').isUUID().withMessage('Valid user_id is required'),
  body('report_type').optional().isIn(['weekly_performance', 'monthly_summary', 'custom']).withMessage('Invalid report_type'),
  body('start_date').optional().isISO8601().withMessage('Invalid start_date format'),
  body('end_date').optional().isISO8601().withMessage('Invalid end_date format'),
  body('include_pdf').optional().isBoolean().withMessage('include_pdf must be boolean'),
  body('send_email').optional().isBoolean().withMessage('send_email must be boolean'),
  body('email_address').optional().isEmail().withMessage('Invalid email address')
], async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(formatErrorResponse(
        'Invalid request parameters',
        400,
        'VALIDATION_ERROR',
        { validationErrors: errors.array() }
      ));
    }

    const {
      user_id,
      report_type = 'weekly_performance',
      start_date,
      end_date,
      include_pdf = false,
      send_email = false,
      email_address
    } = req.body;

    // Validate email if sending email
    if (send_email && !email_address) {
      return res.status(400).json(formatErrorResponse(
        'Email address is required when send_email is true',
        400,
        'MISSING_EMAIL_ADDRESS'
      ));
    }

    logger.info('Report generation requested', {
      user_id,
      report_type,
      start_date,
      end_date,
      include_pdf,
      send_email
    });

    // Parse dates if provided
    let startDate, endDate;
    if (start_date) {
      startDate = new Date(start_date);
    }
    if (end_date) {
      endDate = new Date(end_date);
    }

    // Generate report
    const report = await reportService.generateWeeklyReport(user_id, {
      startDate,
      endDate,
      reportType: report_type,
      includePDF: include_pdf,
      sendEmail: send_email,
      emailAddress: email_address
    });

    logger.info('Report generated successfully', {
      user_id,
      report_id: report.report_id,
      report_type,
      has_pdf: !!report.pdf_url,
      email_sent: send_email
    });

    const message = send_email ?
      `Report generated and sent to ${email_address}` :
      'Report generated successfully';

    res.status(200).json(formatSuccessResponse(report, message));

  } catch (error) {
    logger.error('Report generation failed', error, {
      user_id: req.body.user_id,
      report_type: req.body.report_type
    });

    res.status(500).json(formatErrorResponse(
      'Report generation failed',
      500,
      'REPORT_GENERATION_ERROR',
      { user_id: req.body.user_id, error: error.message }
    ));
  }
});

/**
 * GET /api/analyzer/reports/:user_id
 * Get report history for a user
 */
router.get('/:user_id', [
  param('user_id').isUUID().withMessage('Valid user_id is required'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be 1-50'),
  query('report_type').optional().isIn(['weekly_performance', 'monthly_summary', 'custom']).withMessage('Invalid report_type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(formatErrorResponse(
        'Invalid request parameters',
        400,
        'VALIDATION_ERROR',
        { validationErrors: errors.array() }
      ));
    }

    const { user_id } = req.params;
    const {
      limit = 20,
      report_type
    } = req.query;

    logger.info('Report history requested', { user_id, limit, report_type });

    // Get report history
    const reports = await reportService.getReportHistory(user_id, parseInt(limit));

    // Filter by report type if specified
    let filteredReports = reports;
    if (report_type) {
      filteredReports = reports.filter(r => r.report_type === report_type);
    }

    const response = {
      user_id,
      total_reports: filteredReports.length,
      reports: filteredReports,
      summary: {
        by_type: filteredReports.reduce((acc, report) => {
          acc[report.report_type] = (acc[report.report_type] || 0) + 1;
          return acc;
        }, {}),
        with_pdf: filteredReports.filter(r => r.pdf_url).length,
        emailed: filteredReports.filter(r => r.email_sent).length,
        latest_report: filteredReports[0]?.created_at || null
      },
      filters: {
        limit: parseInt(limit),
        report_type: report_type || 'all'
      }
    };

    logger.info('Report history retrieved', {
      user_id,
      reports_count: filteredReports.length
    });

    res.status(200).json(formatSuccessResponse(
      response,
      `Retrieved ${filteredReports.length} reports`
    ));

  } catch (error) {
    logger.error('Failed to get report history', error, {
      user_id: req.params.user_id
    });

    res.status(500).json(formatErrorResponse(
      'Failed to retrieve report history',
      500,
      'REPORT_HISTORY_ERROR',
      { user_id: req.params.user_id, error: error.message }
    ));
  }
});

/**
 * GET /api/analyzer/reports/:user_id/:report_id
 * Get a specific report
 */
router.get('/:user_id/:report_id', [
  param('user_id').isUUID().withMessage('Valid user_id is required'),
  param('report_id').isUUID().withMessage('Valid report_id is required'),
  query('format').optional().isIn(['json', 'summary']).withMessage('Format must be json or summary')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(formatErrorResponse(
        'Invalid request parameters',
        400,
        'VALIDATION_ERROR',
        { validationErrors: errors.array() }
      ));
    }

    const { user_id, report_id } = req.params;
    const { format = 'json' } = req.query;

    logger.info('Specific report requested', { user_id, report_id, format });

    // Get report from database
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    const query = `
      SELECT id, report_type, date_range_start, date_range_end, report_data, pdf_url, email_sent, status, created_at
      FROM weekly_reports
      WHERE user_id = $1 AND report_data->>'report_id' = $2
    `;

    const result = await pool.query(query, [user_id, report_id]);

    if (result.rows.length === 0) {
      return res.status(404).json(formatErrorResponse(
        'Report not found',
        404,
        'REPORT_NOT_FOUND',
        { user_id, report_id }
      ));
    }

    const reportRow = result.rows[0];
    const fullReport = reportRow.report_data;

    let response;

    if (format === 'summary') {
      // Return summary only
      response = {
        report_id: fullReport.report_id,
        user_id,
        report_type: fullReport.report_type,
        date_range: fullReport.date_range,
        generated_at: fullReport.generated_at,
        executive_summary: fullReport.executive_summary,
        key_metrics: {
          total_spend: fullReport.performance_overview?.spend || 0,
          total_revenue: fullReport.performance_overview?.revenue || 0,
          roas: fullReport.performance_overview?.roas || 0,
          campaigns_count: fullReport.campaigns_count || 0,
          goal_progress: fullReport.goal_progress?.progress_percentage || 0
        },
        recommendations_count: fullReport.recommendations?.length || 0,
        pdf_url: reportRow.pdf_url,
        email_sent: reportRow.email_sent
      };
    } else {
      // Return full report
      response = {
        ...fullReport,
        database_metadata: {
          db_id: reportRow.id,
          pdf_url: reportRow.pdf_url,
          email_sent: reportRow.email_sent,
          status: reportRow.status,
          stored_at: reportRow.created_at
        }
      };
    }

    logger.info('Report retrieved', {
      user_id,
      report_id,
      format,
      report_type: fullReport.report_type
    });

    res.status(200).json(formatSuccessResponse(
      response,
      `Report retrieved in ${format} format`
    ));

  } catch (error) {
    logger.error('Failed to get specific report', error, {
      user_id: req.params.user_id,
      report_id: req.params.report_id
    });

    res.status(500).json(formatErrorResponse(
      'Failed to retrieve report',
      500,
      'REPORT_GET_ERROR',
      {
        user_id: req.params.user_id,
        report_id: req.params.report_id,
        error: error.message
      }
    ));
  }
});

/**
 * POST /api/analyzer/reports/:user_id/:report_id/resend
 * Resend report via email
 */
router.post('/:user_id/:report_id/resend', [
  param('user_id').isUUID().withMessage('Valid user_id is required'),
  param('report_id').isUUID().withMessage('Valid report_id is required'),
  body('email_address').isEmail().withMessage('Valid email address is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(formatErrorResponse(
        'Invalid request parameters',
        400,
        'VALIDATION_ERROR',
        { validationErrors: errors.array() }
      ));
    }

    const { user_id, report_id } = req.params;
    const { email_address } = req.body;

    logger.info('Report resend requested', { user_id, report_id, email_address });

    // Get report from database
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    const query = `
      SELECT report_data
      FROM weekly_reports
      WHERE user_id = $1 AND report_data->>'report_id' = $2
    `;

    const result = await pool.query(query, [user_id, report_id]);

    if (result.rows.length === 0) {
      return res.status(404).json(formatErrorResponse(
        'Report not found',
        404,
        'REPORT_NOT_FOUND',
        { user_id, report_id }
      ));
    }

    const report = result.rows[0].report_data;

    // Send email
    const emailSent = await reportService.sendEmailReport(email_address, report);

    if (!emailSent) {
      throw new Error('Failed to send email');
    }

    const response = {
      user_id,
      report_id,
      email_address,
      sent_at: new Date().toISOString(),
      status: 'sent'
    };

    logger.info('Report resent successfully', {
      user_id,
      report_id,
      email_address
    });

    res.status(200).json(formatSuccessResponse(
      response,
      `Report resent to ${email_address}`
    ));

  } catch (error) {
    logger.error('Failed to resend report', error, {
      user_id: req.params.user_id,
      report_id: req.params.report_id
    });

    res.status(500).json(formatErrorResponse(
      'Failed to resend report',
      500,
      'REPORT_RESEND_ERROR',
      {
        user_id: req.params.user_id,
        report_id: req.params.report_id,
        error: error.message
      }
    ));
  }
});

/**
 * DELETE /api/analyzer/reports/:user_id/:report_id
 * Delete a report
 */
router.delete('/:user_id/:report_id', [
  param('user_id').isUUID().withMessage('Valid user_id is required'),
  param('report_id').isUUID().withMessage('Valid report_id is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(formatErrorResponse(
        'Invalid request parameters',
        400,
        'VALIDATION_ERROR',
        { validationErrors: errors.array() }
      ));
    }

    const { user_id, report_id } = req.params;

    logger.info('Report deletion requested', { user_id, report_id });

    // Delete report from database
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    const query = `
      DELETE FROM weekly_reports
      WHERE user_id = $1 AND report_data->>'report_id' = $2
      RETURNING id
    `;

    const result = await pool.query(query, [user_id, report_id]);

    if (result.rows.length === 0) {
      return res.status(404).json(formatErrorResponse(
        'Report not found',
        404,
        'REPORT_NOT_FOUND',
        { user_id, report_id }
      ));
    }

    const response = {
      user_id,
      report_id,
      deleted_at: new Date().toISOString(),
      status: 'deleted'
    };

    logger.info('Report deleted successfully', { user_id, report_id });

    res.status(200).json(formatSuccessResponse(
      response,
      'Report deleted successfully'
    ));

  } catch (error) {
    logger.error('Failed to delete report', error, {
      user_id: req.params.user_id,
      report_id: req.params.report_id
    });

    res.status(500).json(formatErrorResponse(
      'Failed to delete report',
      500,
      'REPORT_DELETE_ERROR',
      {
        user_id: req.params.user_id,
        report_id: req.params.report_id,
        error: error.message
      }
    ));
  }
});

/**
 * POST /api/analyzer/reports/schedule
 * Schedule automatic report generation
 */
router.post('/schedule', [
  body('user_id').isUUID().withMessage('Valid user_id is required'),
  body('schedule_type').isIn(['weekly', 'monthly', 'custom']).withMessage('Invalid schedule_type'),
  body('day_of_week').optional().isInt({ min: 0, max: 6 }).withMessage('day_of_week must be 0-6 (Sunday=0)'),
  body('day_of_month').optional().isInt({ min: 1, max: 31 }).withMessage('day_of_month must be 1-31'),
  body('time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format (HH:MM)'),
  body('email_address').optional().isEmail().withMessage('Invalid email address'),
  body('include_pdf').optional().isBoolean().withMessage('include_pdf must be boolean'),
  body('enabled').optional().isBoolean().withMessage('enabled must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(formatErrorResponse(
        'Invalid request parameters',
        400,
        'VALIDATION_ERROR',
        { validationErrors: errors.array() }
      ));
    }

    const {
      user_id,
      schedule_type,
      day_of_week = 1, // Monday
      day_of_month = 1,
      time = '09:00',
      email_address,
      include_pdf = true,
      enabled = true
    } = req.body;

    logger.info('Report schedule request', {
      user_id,
      schedule_type,
      day_of_week,
      day_of_month,
      time,
      enabled
    });

    // Mock implementation - in production, store in database and set up cron job
    const scheduleId = require('uuid').v4();

    const response = {
      schedule_id: scheduleId,
      user_id,
      schedule_type,
      schedule_config: {
        day_of_week: schedule_type === 'weekly' ? day_of_week : null,
        day_of_month: schedule_type === 'monthly' ? day_of_month : null,
        time
      },
      email_address,
      include_pdf,
      enabled,
      next_execution: this.calculateNextExecution(schedule_type, day_of_week, day_of_month, time),
      created_at: new Date().toISOString()
    };

    logger.info('Report schedule created', {
      schedule_id: scheduleId,
      user_id,
      schedule_type,
      next_execution: response.next_execution
    });

    res.status(200).json(formatSuccessResponse(
      response,
      `Report schedule created for ${schedule_type} delivery`
    ));

  } catch (error) {
    logger.error('Failed to create report schedule', error, req.body);

    res.status(500).json(formatErrorResponse(
      'Failed to create report schedule',
      500,
      'SCHEDULE_ERROR',
      { error: error.message }
    ));
  }
});

/**
 * GET /api/analyzer/reports/health
 * Get report service health status
 */
router.get('/health', async (req, res) => {
  try {
    const healthStatus = await reportService.getHealthStatus();

    res.status(200).json(formatSuccessResponse(
      healthStatus,
      'Report service health check completed'
    ));

  } catch (error) {
    logger.error('Report service health check failed', error);

    res.status(500).json(formatErrorResponse(
      'Report service health check failed',
      500,
      'HEALTH_CHECK_ERROR',
      { error: error.message }
    ));
  }
});

// Helper method for schedule calculation
function calculateNextExecution(scheduleType, dayOfWeek, dayOfMonth, time) {
  const now = new Date();
  const [hours, minutes] = time.split(':').map(Number);

  let nextExecution = new Date();
  nextExecution.setHours(hours, minutes, 0, 0);

  if (scheduleType === 'weekly') {
    // Set to next occurrence of the specified day of week
    const daysUntilNext = (dayOfWeek - now.getDay() + 7) % 7;
    if (daysUntilNext === 0 && now > nextExecution) {
      // If it's the same day but past the time, schedule for next week
      nextExecution.setDate(nextExecution.getDate() + 7);
    } else {
      nextExecution.setDate(nextExecution.getDate() + daysUntilNext);
    }
  } else if (scheduleType === 'monthly') {
    // Set to next occurrence of the specified day of month
    nextExecution.setDate(dayOfMonth);
    if (now > nextExecution) {
      // If past this month's date, go to next month
      nextExecution.setMonth(nextExecution.getMonth() + 1);
    }
  }

  return nextExecution.toISOString();
}

// Attach helper method to router
router.calculateNextExecution = calculateNextExecution;

module.exports = router;