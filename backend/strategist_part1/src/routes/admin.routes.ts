/**
 * Admin routes with API key authentication
 * Endpoints for managing invitation codes
 */

import { Hono } from 'hono';
import {
  createInvitationCode,
  listInvitationCodes,
  deactivateInvitationCode,
  getInvitationUsage,
  getInvitationStats
} from '../services/invitation';
import { successResponse, errorResponse } from '../utils/api-response';
import { createRequestLogger } from '../utils/logger';
import { updateUserQuota } from '../repositories/user-repository';
import {
  getDailyReportMetrics,
  getCombinedDailyMetrics,
  getReportMetricsById,
  getMetricsByModel,
  getMetricsByStep,
  listUsersWithActivity,
  getUserDetailWithCosts,
  getUserInterviewsAdmin,
  getCostsByUser,
  getUserCostBreakdown,
  getAgentReportDailyMetrics,
  getAgentToolUsageMetrics,
  getAgentReportMetricsById,
  getRecentUserInterviews
} from '../repositories/admin-repository';

export const adminRoutes = new Hono();

/**
 * Admin API Key Middleware
 * Validates X-Admin-API-Key header against ADMIN_API_KEY environment variable
 */
adminRoutes.use('*', async (c, next) => {
  const log = createRequestLogger(c);
  const apiKey = c.req.header('X-Admin-API-Key');
  const adminKey = c.env.ADMIN_API_KEY;

  if (!adminKey) {
    log.error('ADMIN_API_KEY not configured in environment');
    return c.json(errorResponse('Admin API not configured'), 500);
  }

  if (!apiKey || apiKey !== adminKey) {
    log.warn('Unauthorized admin API access attempt', { hasKey: !!apiKey });
    return c.json(errorResponse('Unauthorized'), 401);
  }

  await next();
});

/**
 * POST /admin/invitations/create
 * Create new invitation code
 */
adminRoutes.post('/invitations/create', async (c) => {
  const log = createRequestLogger(c);
  try {
    const body = await c.req.json();
    const {
      maxUses,
      assignedEmail,
      expiresInDays,
      notes
    } = body;

    const result = await createInvitationCode(c.env.DB, {
      maxUses: maxUses ? parseInt(maxUses) : undefined,
      assignedEmail,
      expiresInDays: expiresInDays ? parseInt(expiresInDays) : undefined,
      createdBy: 'admin-api',
      notes
    });

    log.info('Invitation code created via API', { code: result.code, maxUses: result.maxUses });

    return c.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    log.error('Error creating invitation code', error);
    return c.json(errorResponse(error.message), 500);
  }
});

/**
 * GET /admin/invitations/list
 * List invitation codes with optional filtering
 */
adminRoutes.get('/invitations/list', async (c) => {
  const log = createRequestLogger(c);
  try {
    const status = c.req.query('status') as 'active' | 'used' | 'expired' | 'all' || 'all';
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = parseInt(c.req.query('offset') || '0');

    const result = await listInvitationCodes(c.env.DB, {
      status,
      limit,
      offset
    });

    log.info('Listed invitation codes', { status, count: result.invitations.length, total: result.total });

    return c.json({
      success: true,
      invitations: result.invitations,
      total: result.total,
      page: {
        limit,
        offset
      }
    });
  } catch (error: any) {
    log.error('Error listing invitation codes', error);
    return c.json(errorResponse(error.message), 500);
  }
});

/**
 * POST /admin/invitations/:id/deactivate
 * Deactivate an invitation code
 */
adminRoutes.post('/invitations/:id/deactivate', async (c) => {
  const log = createRequestLogger(c);
  try {
    const invitationId = c.req.param('id');

    const success = await deactivateInvitationCode(c.env.DB, invitationId);

    if (!success) {
      return c.json(errorResponse('Invitation code not found'), 404);
    }

    log.info('Invitation code deactivated', { invitationId });

    return c.json({
      success: true,
      message: 'Invitation code deactivated successfully'
    });
  } catch (error: any) {
    log.error('Error deactivating invitation code', error);
    return c.json(errorResponse(error.message), 500);
  }
});

/**
 * GET /admin/invitations/:id/usage
 * Get usage details for specific invitation code
 */
adminRoutes.get('/invitations/:id/usage', async (c) => {
  const log = createRequestLogger(c);
  try {
    const invitationId = c.req.param('id');

    const usage = await getInvitationUsage(c.env.DB, invitationId);

    if (!usage) {
      return c.json(errorResponse('Invitation code not found'), 404);
    }

    log.info('Retrieved invitation usage', { invitationId, currentUses: usage.currentUses });

    return c.json({
      success: true,
      code: usage.code,
      uses: {
        current: usage.currentUses,
        max: usage.maxUses
      },
      isActive: usage.isActive,
      usageHistory: usage.usageHistory
    });
  } catch (error: any) {
    log.error('Error retrieving invitation usage', error);
    return c.json(errorResponse(error.message), 500);
  }
});

/**
 * GET /admin/invitations/stats
 * Get overall invitation statistics
 */
adminRoutes.get('/invitations/stats', async (c) => {
  const log = createRequestLogger(c);
  try {
    const stats = await getInvitationStats(c.env.DB);

    log.info('Retrieved invitation stats', stats);

    return c.json({
      success: true,
      ...stats
    });
  } catch (error: any) {
    log.error('Error retrieving invitation stats', error);
    return c.json(errorResponse(error.message), 500);
  }
});

/**
 * GET /admin/reports/metrics
 * Get aggregate cost and usage metrics with preview breakdown
 */
adminRoutes.get('/reports/metrics', async (c) => {
  const log = createRequestLogger(c);
  try {
    const metrics = await getDailyReportMetrics(c.env.DB, 30);

    log.info('Retrieved report metrics', { count: metrics.length });

    return c.json({
      success: true,
      metrics
    });
  } catch (error: any) {
    log.error('Error retrieving report metrics', error);
    return c.json(errorResponse(error.message), 500);
  }
});

/**
 * GET /admin/reports/metrics/combined
 * Get daily aggregated metrics for BOTH legacy and agent reports
 */
adminRoutes.get('/reports/metrics/combined', async (c) => {
  const log = createRequestLogger(c);
  try {
    const combined = await getCombinedDailyMetrics(c.env.DB, 30);

    log.info('Retrieved combined report metrics', { days: combined.length });

    return c.json({
      success: true,
      metrics: combined.map((row: any) => ({
        date: row.date,
        legacy: {
          total_reports: row.legacy_reports || 0,
          total_cost_cents: row.legacy_cost_cents || 0,
          avg_generation_time: row.legacy_avg_time || 0
        },
        agent: {
          total_reports: row.agent_reports || 0,
          total_cost_cents: row.agent_cost_cents || 0,
          avg_generation_time: row.agent_avg_time || 0
        },
        combined: {
          total_reports: row.combined_reports || 0,
          total_cost_cents: row.combined_cost_cents || 0
        }
      }))
    });
  } catch (error: any) {
    log.error('Error retrieving combined metrics', error);
    return c.json(errorResponse(error.message), 500);
  }
});

/**
 * GET /admin/reports/:reportId/metrics
 * Get detailed metrics for specific report
 */
adminRoutes.get('/reports/:reportId/metrics', async (c) => {
  const log = createRequestLogger(c);
  try {
    const reportId = c.req.param('reportId');

    const report = await getReportMetricsById(c.env.DB, reportId);

    if (!report) {
      return c.json(errorResponse('Report not found'), 404);
    }

    log.info('Retrieved report metrics', { reportId });

    return c.json({
      success: true,
      report: {
        ...report,
        step_metrics: report.step_metrics ? JSON.parse(report.step_metrics as string) : null,
        preview_cost_dollars: ((report.preview_cost_cents as number || 0) / 100).toFixed(4),
        full_cost_dollars: ((report.total_cost_cents as number || 0) / 100).toFixed(4),
        total_cost_dollars: (((report.preview_cost_cents as number || 0) + (report.total_cost_cents as number || 0)) / 100).toFixed(4),
      }
    });
  } catch (error: any) {
    log.error('Error retrieving report metrics', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// ============================================================================
// User Management
// ============================================================================

/**
 * GET /admin/users
 * Get all users with their profiles and activity
 */
adminRoutes.get('/users', async (c) => {
  const log = createRequestLogger(c);
  try {
    const limit = parseInt(c.req.query('limit') || '100');
    const offset = parseInt(c.req.query('offset') || '0');
    const search = c.req.query('search') || '';

    const { users, total } = await listUsersWithActivity(c.env.DB, { limit, offset, search });

    log.info('Retrieved users', { count: users.length, total });

    return c.json({
      success: true,
      users: users.map((u: any) => ({
        ...u,
        total_cost_dollars: ((u.total_cost_cents as number) / 100).toFixed(2),
        quota_usage: `${u.interviews_count}/${u.max_interviews || 'unlimited'}`
      })),
      total,
      limit,
      offset
    });
  } catch (error: any) {
    log.error('Error retrieving users', error);
    return c.json(errorResponse(error.message), 500);
  }
});

/**
 * GET /admin/users/:userId
 * Get detailed information for a specific user
 */
adminRoutes.get('/users/:userId', async (c) => {
  const log = createRequestLogger(c);
  try {
    const userId = c.req.param('userId');

    const user = await getUserDetailWithCosts(c.env.DB, userId);

    if (!user) {
      return c.json(errorResponse('User not found'), 404);
    }

    const interviews = await getRecentUserInterviews(c.env.DB, userId, 10);

    log.info('Retrieved user details', { userId, email: user.email });

    return c.json({
      success: true,
      user: {
        ...user,
        total_cost_dollars: ((user.total_cost_cents as number) / 100).toFixed(2),
      },
      recent_interviews: interviews
    });
  } catch (error: any) {
    log.error('Error retrieving user details', error);
    return c.json(errorResponse(error.message), 500);
  }
});

/**
 * PUT /admin/users/:userId/quota
 * Update user's interview quota
 */
adminRoutes.put('/users/:userId/quota', async (c) => {
  const log = createRequestLogger(c);
  try {
    const userId = c.req.param('userId');
    const body = await c.req.json();
    const { max_interviews } = body;

    if (typeof max_interviews !== 'number' || max_interviews < 0) {
      return c.json(errorResponse('Invalid max_interviews value'), 400);
    }

    const result = await updateUserQuota(c.env.DB, userId, max_interviews);

    if (!result.success) {
      return c.json(errorResponse('User not found'), 404);
    }

    log.info('Updated user quota', { userId, max_interviews });

    return c.json({
      success: true,
      message: 'Quota updated successfully',
      max_interviews
    });
  } catch (error: any) {
    log.error('Error updating user quota', error);
    return c.json(errorResponse(error.message), 500);
  }
});

/**
 * GET /admin/users/:userId/interviews
 * Get all interviews for a specific user
 */
adminRoutes.get('/users/:userId/interviews', async (c) => {
  const log = createRequestLogger(c);
  try {
    const userId = c.req.param('userId');

    const interviews = await getUserInterviewsAdmin(c.env.DB, userId);

    log.info('Retrieved user interviews', { userId, count: interviews.length });

    return c.json({
      success: true,
      interviews: interviews.map((i: any) => ({
        ...i,
        report_cost_dollars: i.total_cost_cents ? ((i.total_cost_cents as number) / 100).toFixed(2) : null
      }))
    });
  } catch (error: any) {
    log.error('Error retrieving user interviews', error);
    return c.json(errorResponse(error.message), 500);
  }
});

/**
 * GET /admin/costs/by-user
 * Get user-level cost aggregation
 */
adminRoutes.get('/costs/by-user', async (c) => {
  const log = createRequestLogger(c);
  try {
    const userCosts = await getCostsByUser(c.env.DB, 100);

    log.info('Retrieved user costs', { count: userCosts.length });

    return c.json({
      success: true,
      users: userCosts.map((u: any) => ({
        ...u,
        total_cost_dollars: ((u.total_cost_cents as number) / 100).toFixed(2),
      }))
    });
  } catch (error: any) {
    log.error('Error retrieving user costs', error);
    return c.json(errorResponse(error.message), 500);
  }
});

/**
 * GET /admin/users/:userId/costs
 * Get detailed cost breakdown for specific user (BOTH legacy and agent reports)
 */
adminRoutes.get('/users/:userId/costs', async (c) => {
  const log = createRequestLogger(c);
  try {
    const userId = c.req.param('userId');

    const breakdown = await getUserCostBreakdown(c.env.DB, userId);

    if (!breakdown || breakdown.summary.total_reports === 0) {
      return c.json(errorResponse('User not found or has no reports'), 404);
    }

    const legacyCost = breakdown.legacyReports.reduce((sum: number, r: any) =>
      sum + (r.preview_cost_cents || 0) + (r.total_cost_cents || 0), 0);
    const agentCost = breakdown.agentReports.reduce((sum: number, r: any) =>
      sum + (r.total_cost_cents || 0), 0);

    log.info('Retrieved user cost details', {
      userId,
      legacyCount: breakdown.legacyReports.length,
      agentCount: breakdown.agentReports.length
    });

    return c.json({
      success: true,
      user: {
        ...breakdown.summary,
        total_cost_dollars: ((breakdown.summary.total_cost_cents as number) / 100).toFixed(2),
      },
      legacyReports: breakdown.legacyReports.map((r: any) => ({
        ...r,
        report_id: r.id,
        competitors_analyzed: r.competitors_analyzed_count,
        total_cost_dollars: (((r.preview_cost_cents || 0) + (r.total_cost_cents || 0)) / 100).toFixed(4),
      })),
      agentReports: breakdown.agentReports.map((r: any) => ({
        ...r,
        report_id: r.id,
        total_cost_dollars: ((r.total_cost_cents || 0) / 100).toFixed(4),
      })),
      breakdown: {
        legacy_cost_cents: legacyCost,
        agent_cost_cents: agentCost,
        legacy_count: breakdown.legacyReports.length,
        agent_count: breakdown.agentReports.length
      }
    });
  } catch (error: any) {
    log.error('Error retrieving user cost details', error);
    return c.json(errorResponse(error.message), 500);
  }
});

/**
 * GET /admin/reports/metrics/by-model
 * Get aggregate costs grouped by model_id
 */
adminRoutes.get('/reports/metrics/by-model', async (c) => {
  const log = createRequestLogger(c);
  try {
    const modelMetrics = await getMetricsByModel(c.env.DB);

    log.info('Retrieved model metrics', { count: modelMetrics.length });

    return c.json({
      success: true,
      by_model: modelMetrics.map((m: any) => ({
        model_id: m.model_id,
        total_reports: m.total_reports,
        total_cost_cents: m.total_cost_cents,
        avg_cost_cents: Math.round(m.avg_cost_cents as number),
        avg_generation_time: m.avg_generation_time ? parseFloat((m.avg_generation_time as number).toFixed(1)) : null,
        total_input_tokens: m.total_input_tokens,
        total_output_tokens: m.total_output_tokens
      }))
    });
  } catch (error: any) {
    log.error('Error retrieving model metrics', error);
    return c.json(errorResponse(error.message), 500);
  }
});

/**
 * GET /admin/reports/metrics/by-step
 * Get average costs per generation step
 */
adminRoutes.get('/reports/metrics/by-step', async (c) => {
  const log = createRequestLogger(c);
  try {
    const reports = await getMetricsByStep(c.env.DB);

    if (reports.length === 0) {
      return c.json({
        success: true,
        step_averages: {}
      });
    }

    const stepTotals: Record<string, { cost: number, tokens: number, duration: number, count: number }> = {
      step1: { cost: 0, tokens: 0, duration: 0, count: 0 },
      step2: { cost: 0, tokens: 0, duration: 0, count: 0 },
      step4: { cost: 0, tokens: 0, duration: 0, count: 0 }
    };

    for (const report of reports) {
      const metrics = JSON.parse((report as any).step_metrics as string);

      for (const [step, data] of Object.entries(metrics)) {
        if (stepTotals[step]) {
          const stepData = data as any;
          stepTotals[step].cost += stepData.cost_cents || 0;
          stepTotals[step].tokens += (stepData.input_tokens || 0) + (stepData.output_tokens || 0);
          stepTotals[step].duration += stepData.duration_seconds || 0;
          stepTotals[step].count += 1;
        }
      }
    }

    const stepAverages: Record<string, { avg_cost_cents: number, avg_tokens: number, avg_duration: number }> = {};

    for (const [step, totals] of Object.entries(stepTotals)) {
      if (totals.count > 0) {
        stepAverages[step] = {
          avg_cost_cents: Math.round(totals.cost / totals.count),
          avg_tokens: Math.round(totals.tokens / totals.count),
          avg_duration: parseFloat((totals.duration / totals.count).toFixed(1))
        };
      }
    }

    log.info('Retrieved step metrics', { reportsAnalyzed: reports.length });

    return c.json({
      success: true,
      step_averages: stepAverages
    });
  } catch (error: any) {
    log.error('Error retrieving step metrics', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// ============================================================================
// Agent Report Metrics
// ============================================================================

/**
 * GET /api/admin/agent-reports/metrics
 * Get daily aggregated metrics for agent reports
 */
adminRoutes.get('/agent-reports/metrics', async (c) => {
  const log = createRequestLogger(c);

  try {
    const metrics = await getAgentReportDailyMetrics(c.env.DB, 30);

    log.info('Retrieved agent report metrics', { days: metrics.length });

    return c.json({
      success: true,
      metrics
    });
  } catch (error: any) {
    log.error('Error retrieving agent report metrics', error);
    return c.json(errorResponse(error.message), 500);
  }
});

/**
 * GET /api/admin/agent-reports/metrics/by-tool
 * Get tool usage breakdown for agent reports
 */
adminRoutes.get('/agent-reports/metrics/by-tool', async (c) => {
  const log = createRequestLogger(c);

  try {
    const byTool = await getAgentToolUsageMetrics(c.env.DB);

    log.info('Retrieved agent report tool metrics');

    return c.json({
      success: true,
      byTool
    });
  } catch (error: any) {
    log.error('Error retrieving agent report tool metrics', error);
    return c.json(errorResponse(error.message), 500);
  }
});

/**
 * GET /admin/agent-reports/:reportId/metrics
 * Get detailed metrics for specific agent report
 */
adminRoutes.get('/agent-reports/:reportId/metrics', async (c) => {
  const log = createRequestLogger(c);
  try {
    const reportId = c.req.param('reportId');

    if (!reportId || !reportId.startsWith('agrep_')) {
      return c.json(errorResponse('Invalid agent report ID format'), 400);
    }

    const report = await getAgentReportMetricsById(c.env.DB, reportId);

    if (!report) {
      return c.json(errorResponse('Agent report not found'), 404);
    }

    log.info('Retrieved agent report metrics', { reportId });

    return c.json({
      success: true,
      report: {
        ...report,
        tool_results: report.tool_results ? JSON.parse(report.tool_results as string) : null,
        total_cost_dollars: ((report.total_cost_cents as number || 0) / 100).toFixed(4),
      }
    });
  } catch (error: any) {
    log.error('Error retrieving agent report metrics', error);
    return c.json(errorResponse(error.message), 500);
  }
});
