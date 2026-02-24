/**
 * GTM Agent API Routes
 * Single-agent report generation with tool use
 */

import { Hono } from 'hono';
import { getInterview } from '../services/database';
import {
  createAgentReport,
  updateAgentReport,
  getAgentReport,
  getLatestAgentReport,
} from '../repositories/agent-report-repository';
import {
  generateGTMAgentReport,
  extractBusinessProfile,
} from '../services/gtm-agent/gtm-report-agent';
import { successResponse, errorResponse } from '../utils/api-response';
import { createRequestLogger, createLogger } from '../utils/logger';
import { isReportTimedOut } from '../utils/report-timeout';
import { TIMEOUTS } from '../config/timeouts';
import type { Env } from '../types/env';
import type { WebSocketMessage } from '../types/gtm-agent-types';
import { requireAuth, extractUserId } from '../middleware/auth.middleware';
import { verifySessionToken } from '../services/google-oauth';
import type { AuthContext } from '../middleware/types';

export const gtmAgentRoutes = new Hono<AuthContext>();

/**
 * GET /api/gtm-agent/ws/:reportId
 * WebSocket endpoint for real-time thinking process updates
 * Note: Registered BEFORE requireAuth middleware since browsers cannot send custom headers
 */
gtmAgentRoutes.get('/ws/:reportId', async (c) => {
  const log = createRequestLogger(c);

  try {
    const upgradeHeader = c.req.header('upgrade');
    if (upgradeHeader !== 'websocket') {
      return c.json(errorResponse('Expected WebSocket upgrade'), 426);
    }

    const reportId = c.req.param('reportId');

    // WebSocket auth: browsers cannot send Authorization header, so use query param
    const token = c.req.query('token');
    if (!token) {
      log.warn('WebSocket connection missing auth token', { reportId });
      return c.json(errorResponse('Authentication token required'), 401);
    }

    const jwtSecret = c.env.JWT_SECRET;
    if (!jwtSecret) {
      log.error('JWT_SECRET not configured');
      return c.json(errorResponse('Authentication service unavailable'), 500);
    }

    let userId: string;
    try {
      const payload = await verifySessionToken(token, jwtSecret);
      if (!payload || !payload.sub) {
        return c.json(errorResponse('Invalid or expired token'), 401);
      }
      userId = payload.sub;
    } catch (error) {
      log.warn('WebSocket token verification failed', { reportId, error });
      return c.json(errorResponse('Invalid or expired token'), 401);
    }

    const report = await getAgentReport(c.env.DB, reportId);

    if (!report) {
      return c.json(errorResponse('Report not found'), 404);
    }

    if (report.user_id !== userId) {
      log.warn('Authorization failed: User attempted to connect to another user\'s report WebSocket', {
        userId,
        reportId,
        ownerId: report.user_id
      });
      return c.json(errorResponse('Unauthorized'), 403);
    }

    log.info('WebSocket connection requested', { reportId });

    // Prepare initial state message
    const existingLog = report.thinking_log ? JSON.parse(report.thinking_log) : [];
    const initialMessage = JSON.stringify({
      type: 'init',
      data: {
        reportId,
        status: report.status,
        progress: report.progress,
        thinkingLog: existingLog
      }
    });

    // Get Durable Object stub for this report
    const doId = c.env.REPORT_COORDINATOR.idFromName(reportId);
    const doStub = c.env.REPORT_COORDINATOR.get(doId);

    // Create new request with initial state in headers
    const wsRequest = new Request(c.req.raw.url, {
      headers: {
        ...Object.fromEntries(c.req.raw.headers),
        'x-initial-state': initialMessage
      }
    });

    // Forward WebSocket upgrade to Durable Object
    const response = await doStub.fetch(wsRequest);

    log.debug('WebSocket connection established', {
      reportId,
      status: report.status,
      logEntries: existingLog.length
    });

    return response;
  } catch (error) {
    log.error('WebSocket connection error', error);
    return c.json(errorResponse(error instanceof Error ? error.message : 'Unknown error'), 500);
  }
});

// Apply auth middleware to all other routes
gtmAgentRoutes.use('/*', requireAuth());

/**
 * POST /api/gtm-agent/generate
 * Start GTM agent report generation
 */
gtmAgentRoutes.post('/generate', async (c) => {
  const log = createRequestLogger(c);

  try {
    const { interviewId } = await c.req.json();

    log.info('=== GTM Agent Generate Request ===', { interviewId });

    if (!interviewId) {
      log.warn('Missing interviewId in request');
      return c.json(errorResponse('interviewId is required'), 400);
    }

    const authenticatedUserId = extractUserId(c);
    log.info('Authenticated user', { authenticatedUserId, interviewId });

    // Get interview data
    const interview = await getInterview(c.env.DB, interviewId);
    if (!interview) {
      return c.json(errorResponse('Interview not found'), 404);
    }

    // Verify ownership
    if (interview.user_id !== authenticatedUserId) {
      return c.json(errorResponse('Unauthorized: Interview does not belong to user'), 403);
    }

    // Get userId from interview record
    const userId = interview.user_id as string;
    if (!userId) {
      return c.json(errorResponse('Interview has no associated user'), 400);
    }

    // Check for existing report
    // TODO: Re-enable regeneration after beta
    // Always return existing report (regeneration temporarily disabled)
    const existingReport = await getLatestAgentReport(c.env.DB, interviewId);
    if (existingReport) {
      const status = existingReport.status;

      if (status === 'GENERATING' || status === 'PENDING') {
        // Check for timeout
        if (isReportTimedOut(existingReport, TIMEOUTS.reportGeneration.maxDuration)) {
          await updateAgentReport(c.env.DB, existingReport.id, {
            status: 'FAILED',
            error: 'Report generation timed out. Please try again.',
          });
        } else {
          log.info('Returning existing in-progress agent report', {
            reportId: existingReport.id,
          });
          return c.json({
            success: true,
            reportId: existingReport.id,
            status: status,
            progress: existingReport.progress,
            message: 'Report generation already in progress',
            isExisting: true,
          });
        }
      }

      if (status === 'READY') {
        log.info('Returning existing agent report (regeneration disabled during beta)', {
          reportId: existingReport.id,
          status: existingReport.status,
        });
        return c.json({
          success: true,
          reportId: existingReport.id,
          status: 'READY',
          progress: 100,
          message: 'Report already exists (regeneration disabled during beta)',
          isExisting: true,
        });
      }
    }

    // Create new agent report (extraction will happen in background worker)
    const { reportId } = await createAgentReport(c.env.DB, {
      interviewId,
      userId,
      brandName: undefined, // Will be set after extraction in worker
    });

    log.info('Created agent report, queuing for generation', {
      reportId,
      interviewId,
    });

    // For local dev: use waitUntil (queues don't work reliably in wrangler dev)
    // For production: use queue for longer execution limits
    const isLocalDev = c.req.header('host')?.includes('localhost');

    if (isLocalDev) {
      log.info('Local dev detected - using waitUntil instead of queue', { reportId });
      c.executionCtx.waitUntil(
        executeGTMAgentGeneration(c.env, reportId, interviewId, userId, log)
      );
    } else {
      await c.env.REPORT_QUEUE.send({
        type: 'gtm-agent',
        reportId,
        interviewId,
        userId,
      });
      log.info('Queued GTM agent report generation', { reportId });
    }

    return c.json({
      success: true,
      reportId,
      status: 'GENERATING',
      progress: 5,
      message: 'Report generation started',
      isExisting: false,
    });
  } catch (error) {
    log.error('Start agent report generation error', error);
    return c.json(errorResponse(error instanceof Error ? error.message : 'Unknown error'), 500);
  }
});

/**
 * POST /api/gtm-agent/test
 * Test endpoint - creates mock interview and triggers generation
 * Use for local development testing only
 */
gtmAgentRoutes.post('/test', async (c) => {
  const log = createRequestLogger(c);

  try {
    const userId = extractUserId(c);
    const body = await c.req.json().catch(() => ({}));
    const website = body.website || 'lovart.ai';
    const brandName = body.brandName || 'Lovart';

    log.info('=== TEST ENDPOINT: Creating mock interview ===', { website, brandName });

    // Create mock interview directly in DB
    const interviewId = `int_test_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

    // Insert interview record
    await c.env.DB.prepare(`
      INSERT INTO interviews (id, user_id, status, preview_url, created_at)
      VALUES (?, ?, 'COMPLETED', ?, datetime('now'))
    `).bind(interviewId, userId, website).run();

    // Insert mock responses
    const mockResponses = [
      { q: 'What is your brand name?', a: brandName },
      { q: 'What is your website URL?', a: website },
      { q: 'What industry are you in?', a: 'AI Art Generation' },
      { q: 'Who is your target audience?', a: 'Artists, designers, and creative professionals' },
      { q: 'What is your business stage?', a: 'Growth stage' },
      { q: 'What is your marketing budget?', a: '$500/week' },
      { q: 'What are your main challenges?', a: 'Customer acquisition, brand awareness' },
      { q: 'What are your business goals?', a: 'Increase user signups, improve retention' },
    ];

    for (let i = 0; i < mockResponses.length; i++) {
      const responseId = `resp_test_${Date.now()}_${i}`;
      await c.env.DB.prepare(`
        INSERT INTO interview_responses (id, interview_id, question_number, question_id, question_text, answer)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(responseId, interviewId, i + 1, `q${i + 1}`, mockResponses[i].q, mockResponses[i].a).run();
    }

    log.info('Mock interview created', { interviewId });

    // Create agent report
    const { reportId } = await createAgentReport(c.env.DB, {
      interviewId,
      userId,
      brandName,
    });

    await updateAgentReport(c.env.DB, reportId, {
      status: 'GENERATING',
      progress: 5,
    });

    log.info('=== TEST ENDPOINT: Starting generation ===', { reportId, interviewId });

    // Always use direct execution for test endpoint
    c.executionCtx.waitUntil(
      executeGTMAgentGeneration(c.env, reportId, interviewId, userId, log)
    );

    const host = c.req.header('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    return c.json({
      success: true,
      message: 'Test generation started',
      reportId,
      interviewId,
      websocketUrl: `${baseUrl}/api/gtm-agent/ws/${reportId}`,
      statusUrl: `${baseUrl}/api/gtm-agent/status/${reportId}`,
      viewUrl: `${baseUrl}/static/generate-agent-report.html?interviewId=${interviewId}`,
    });
  } catch (error) {
    log.error('Test endpoint error', error);
    return c.json(errorResponse(error instanceof Error ? error.message : 'Unknown error'), 500);
  }
});

/**
 * POST /api/gtm-agent/re-render
 * Re-render an existing report with current template
 * TODO: Re-enable after beta
 * Temporarily disabled re-render endpoint for beta release
 */
gtmAgentRoutes.post('/re-render', async (c) => {
  return c.json({
    success: false,
    error: 'FEATURE_TEMPORARILY_DISABLED',
    message: `Report regeneration is temporarily disabled during beta. Contact ${c.env.SUPPORT_EMAIL} for assistance.`,
  }, 403);
});

/**
 * GET /api/gtm-agent/status/:reportId
 * Get report generation status
 */
gtmAgentRoutes.get('/status/:reportId', async (c) => {
  const log = createRequestLogger(c);

  try {
    const reportId = c.req.param('reportId');
    const userId = extractUserId(c);

    const report = await getAgentReport(c.env.DB, reportId);
    if (!report) {
      return c.json(errorResponse('Report not found'), 404);
    }

    if (report.user_id !== userId) {
      log.warn('Authorization failed: User attempted to access another user\'s report status', {
        userId,
        reportId,
        ownerId: report.user_id
      });
      return c.json(errorResponse('Unauthorized'), 403);
    }

    // Check for timeout
    if (
      (report.status === 'GENERATING' || report.status === 'PENDING') &&
      isReportTimedOut(report, TIMEOUTS.reportGeneration.maxDuration)
    ) {
      await updateAgentReport(c.env.DB, reportId, {
        status: 'FAILED',
        error: 'Report generation timed out. Please try again.',
      });
      report.status = 'FAILED';
      report.error = 'Report generation timed out. Please try again.';
    }

    log.debug('Agent report status', { reportId, status: report.status });

    // Parse thinking log if available
    let thinkingLog = [];
    if (report.thinking_log) {
      try {
        thinkingLog = JSON.parse(report.thinking_log);
      } catch (e) {
        log.warn('Failed to parse thinking_log JSON', { reportId });
      }
    }

    return c.json({
      success: true,
      reportId: report.id,
      status: report.status,
      progress: report.progress,
      error: report.error,
      brandName: report.brand_name,
      thinkingLog,
      metrics: {
        webSearches: report.web_searches_count,
        rapidApiCalls: report.rapidapi_calls_count,
        totalCostCents: report.total_cost_cents,
        generationTime: report.generation_time_seconds,
      },
    });
  } catch (error) {
    log.error('Get agent report status error', error);
    return c.json(errorResponse(error instanceof Error ? error.message : 'Unknown error'), 500);
  }
});

/**
 * GET /api/gtm-agent/report/:reportId
 * Get completed report
 */
gtmAgentRoutes.get('/report/:reportId', async (c) => {
  const log = createRequestLogger(c);

  try {
    const reportId = c.req.param('reportId');
    const userId = extractUserId(c);

    const report = await getAgentReport(c.env.DB, reportId);
    if (!report) {
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

    // Parse GTM report JSON if available
    let gtmReport = null;
    if (report.gtm_report) {
      try {
        gtmReport = JSON.parse(report.gtm_report);
      } catch (e) {
        log.warn('Failed to parse gtm_report JSON', { reportId });
      }
    }

    log.info('Retrieved agent report', { reportId, status: report.status });

    return c.json({
      success: true,
      report: {
        id: report.id,
        status: report.status,
        progress: report.progress,
        brandName: report.brand_name,
        htmlReport: report.html_report,
        gtmReport,
        error: report.error,
        metrics: {
          webSearches: report.web_searches_count,
          rapidApiCalls: report.rapidapi_calls_count,
          inputTokens: report.total_input_tokens,
          outputTokens: report.total_output_tokens,
          totalCostCents: report.total_cost_cents,
          modelId: report.model_id,
          generationTime: report.generation_time_seconds,
        },
        createdAt: report.created_at,
        completedAt: report.generation_completed_at,
      },
    });
  } catch (error) {
    log.error('Get agent report error', error);
    return c.json(errorResponse(error instanceof Error ? error.message : 'Unknown error'), 500);
  }
});

/**
 * GET /api/gtm-agent/interview/:interviewId
 * Get latest agent report for interview
 */
gtmAgentRoutes.get('/interview/:interviewId', async (c) => {
  const log = createRequestLogger(c);

  try {
    const interviewId = c.req.param('interviewId');
    const userId = extractUserId(c);

    const interview = await getInterview(c.env.DB, interviewId);
    if (!interview) {
      return c.json(errorResponse('Interview not found'), 404);
    }

    if (interview.user_id !== userId) {
      log.warn('Authorization failed: User attempted to access another user\'s interview report', {
        userId,
        interviewId,
        ownerId: interview.user_id
      });
      return c.json(errorResponse('Unauthorized'), 403);
    }

    const report = await getLatestAgentReport(c.env.DB, interviewId);
    if (!report) {
      return c.json({
        success: true,
        exists: false,
        status: null,
      });
    }

    log.debug('Got latest agent report for interview', {
      interviewId,
      reportId: report.id,
    });

    return c.json({
      success: true,
      exists: true,
      reportId: report.id,
      status: report.status,
      progress: report.progress,
      error: report.error,
    });
  } catch (error) {
    log.error('Get interview agent report error', error);
    return c.json(errorResponse(error instanceof Error ? error.message : 'Unknown error'), 500);
  }
});

/**
 * Direct execution for local development (queues don't work in wrangler dev)
 */
async function executeGTMAgentGeneration(
  env: Env,
  reportId: string,
  interviewId: string,
  userId: string,
  requestLog: ReturnType<typeof createRequestLogger>
): Promise<void> {
  const log = createLogger({ context: '[GTMAgentLocal]', reportId });

  log.info('=== LOCAL DEV: GTM AGENT STARTED ===', { reportId, interviewId });
  const startTime = Date.now();

  try {
    const { getInterview } = await import('../services/database');
    const interview = await getInterview(env.DB, interviewId);
    if (!interview) {
      throw new Error(`Interview ${interviewId} not found`);
    }

    // Setup WebSocket broadcast function
    const wsBroadcast = async (message: WebSocketMessage) => {
      try {
        const doId = env.REPORT_COORDINATOR.idFromName(reportId);
        const doStub = env.REPORT_COORDINATOR.get(doId);
        await doStub.fetch(
          new Request('http://do/broadcast', {
            method: 'POST',
            body: JSON.stringify(message),
          })
        );
      } catch (error) {
        log.warn('WebSocket broadcast failed', { error });
      }
    };

    // Update progress: Extraction starting
    await updateAgentReport(env.DB, reportId, {
      status: 'GENERATING',
      progress: 1,
    });

    await wsBroadcast({
      type: 'thinking_log',
      data: {
        timestamp: new Date().toISOString(),
        type: 'progress',
        message: 'Extracting business profile from interview responses...',
        progress: 1,
      },
    });

    // Extract business profile from interview using AI
    log.info('Extracting business profile', { reportId });
    const businessProfile = await extractBusinessProfile(interview, env.ANTHROPIC_API_KEY);

    // Update progress: Extraction complete
    await updateAgentReport(env.DB, reportId, {
      progress: 5,
    });

    await wsBroadcast({
      type: 'thinking_log',
      data: {
        timestamp: new Date().toISOString(),
        type: 'progress',
        message: `Business profile extracted: ${businessProfile.brandName}`,
        progress: 5,
      },
    });

    log.info('Business profile extracted', { reportId, brandName: businessProfile.brandName });

    const { report, htmlReport, metrics } = await generateGTMAgentReport(
      {
        claudeApiKey: env.ANTHROPIC_API_KEY,
        rapidApiKey: env.RAPIDAPI_KEY,
        rapidApiHost: env.RAPIDAPI_HOST,
      },
      reportId,
      interviewId,
      userId,
      businessProfile,
      [],
      '',
      env.DB,
      wsBroadcast
    );

    await updateAgentReport(env.DB, reportId, {
      status: 'READY',
      progress: 100,
      gtmReport: report,
      htmlReport,
      webSearchesCount: metrics.webSearchesCount,
      rapidApiCallsCount: metrics.rapidApiCallsCount,
      toolResults: metrics.toolResults,
      totalInputTokens: metrics.totalInputTokens,
      totalOutputTokens: metrics.totalOutputTokens,
      totalCostCents: metrics.totalCostCents,
      modelId: metrics.modelId,
      generationTimeSeconds: metrics.generationTimeSeconds,
    });

    await wsBroadcast({ type: 'complete', data: { reportId } });

    const elapsed = Math.round((Date.now() - startTime) / 1000);
    log.info('=== LOCAL DEV: GTM AGENT COMPLETE ===', { reportId, elapsedSeconds: elapsed });

  } catch (error: any) {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    log.error('=== LOCAL DEV: GTM AGENT FAILED ===', { reportId, elapsedSeconds: elapsed, error: error.message });

    await updateAgentReport(env.DB, reportId, {
      status: 'FAILED',
      error: error.message || 'Unknown error',
    });

    try {
      const doId = env.REPORT_COORDINATOR.idFromName(reportId);
      const doStub = env.REPORT_COORDINATOR.get(doId);
      await doStub.fetch(
        new Request('http://do/broadcast', {
          method: 'POST',
          body: JSON.stringify({ type: 'error', data: { error: error.message } }),
        })
      );
    } catch {
      // Ignore broadcast errors
    }
  }
}

