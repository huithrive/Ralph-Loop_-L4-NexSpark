/**
 * Interview routes
 */

import { Hono } from 'hono';
import {
  getIncompleteInterview,
  saveInterview,
  getInterview,
  completeInterview,
  getUserInterviews,
  deleteInterview,
  editInterviewResponses,
  saveResponse,
  createPreviewInterview,
  updateReport,
} from '../services/database';
import { updateAgentReport } from '../repositories/agent-report-repository';
import { checkAndIncrementQuota, getQuotaUsage } from '../repositories/user-repository';
import { transcribeAudio } from '../services/ai/openai-client';
import { successResponse, errorResponse } from '../utils/api-response';
import { generateInterviewId } from '../utils/id-generator';
import { DEFAULT_QUESTIONS } from '../config/defaults';
import { createRequestLogger } from '../utils/logger';
import { isReportTimedOut } from '../utils/report-timeout';
import { TIMEOUTS } from '../config/timeouts';
import { requireAuth, extractUserId } from '../middleware/auth.middleware';
import type { AuthContext } from '../middleware/types';

export const interviewRoutes = new Hono<AuthContext>();

interviewRoutes.use('/*', requireAuth());

// Get user's interviews (for dashboard - includes report status)
interviewRoutes.get('/list', async (c) => {
  const log = createRequestLogger(c);
  try {
    const userId = extractUserId(c);
    const limit = parseInt(c.req.query('limit') || '10');
    const offset = parseInt(c.req.query('offset') || '0');

    if (!c.env.DB) {
      log.warn('⚠️ D1 database not configured');
      return c.json({
        success: true,
        interviews: [],
        total: 0,
        page: 0,
        pageSize: limit,
        hasMore: false,
        hasPrevious: false
      });
    }

    const safeLimit = Math.min(Math.max(limit, 1), 50);
    const safeOffset = Math.max(offset, 0);

    const result = await getUserInterviews(c.env.DB, userId, safeLimit, safeOffset);

    // Check each interview for timed-out reports
    if (result.interviews && result.interviews.length > 0) {
      for (const interview of result.interviews) {
        // Check if report exists and is in GENERATING or PENDING status
        if (interview.report_id && (interview.report_status === 'GENERATING' || interview.report_status === 'PENDING')) {
          const report = {
            status: interview.report_status,
            generation_started_at: interview.report_generation_started_at || null,
            created_at: interview.report_created_at || null
          };

          // Check if report has timed out
          if (isReportTimedOut(report, TIMEOUTS.reportGeneration.maxDuration)) {
            log.warn('Report generation timed out', {
              reportId: interview.report_id,
              interviewId: interview.id,
              status: interview.report_status,
              startedAt: interview.report_generation_started_at,
              isAgentReport: interview.is_agent_report
            });

            // Update report to FAILED status in the appropriate table
            try {
              if (interview.is_agent_report) {
                await updateAgentReport(c.env.DB, interview.report_id, {
                  status: 'FAILED',
                  error: 'Report generation timed out after 10 minutes. Please try again.'
                });
              } else {
                await updateReport(c.env.DB, interview.report_id, {
                  status: 'FAILED',
                  error: 'Report generation timed out after 10 minutes. Please try again.'
                });
              }
              // Update local interview object to return correct status
              interview.report_status = 'FAILED';
            } catch (updateError) {
              log.error('Failed to update timed-out report status', {
                reportId: interview.report_id,
                isAgentReport: interview.is_agent_report,
                error: updateError
              });
            }
          }
        }
      }
    }

    log.info('Retrieved user interviews', { userId, count: result.interviews?.length });
    return c.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    log.error('Get user interviews error', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Check for existing interview
interviewRoutes.get('/check', async (c) => {
  const log = createRequestLogger(c);
  try {
    const userId = extractUserId(c);

    const interview = await getIncompleteInterview(c.env.DB, userId);

    if (interview) {
      log.info('Found incomplete interview', { userId, interviewId: interview.id });
      return c.json({
        success: true,
        exists: true,
        interview,
      });
    }

    return c.json({
      success: true,
      exists: false,
    });
  } catch (error: any) {
    log.error('Check interview error', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Create interview from URL (preview flow)
interviewRoutes.post('/create-from-url', async (c) => {
  const log = createRequestLogger(c);
  try {
    const { website } = await c.req.json();
    const userId = extractUserId(c);

    if (!website) {
      return c.json(errorResponse('website is required'), 400);
    }

    if (!c.env.DB) {
      return c.json(errorResponse('Database not configured'), 500);
    }

    // Atomic quota check and increment to prevent race conditions
    const quotaResult = await checkAndIncrementQuota(c.env.DB, userId);

    if (!quotaResult.allowed) {
      if (!quotaResult.quota) {
        return c.json(errorResponse('User not found'), 404);
      }

      log.warn('User exceeded interview quota', {
        userId,
        created: quotaResult.quota.used,
        max: quotaResult.quota.max,
      });
      return c.json({
        success: false,
        error: 'INTERVIEW_LIMIT_REACHED',
        message: `You have reached your interview limit (${quotaResult.quota.max}). Contact ${c.env.SUPPORT_EMAIL} or join our Discord at ${c.env.DISCORD_URL} for additional access.`,
        quota: {
          used: quotaResult.quota.used,
          max: quotaResult.quota.max,
        },
      }, 429);
    }

    // Proceed with interview creation (quota already incremented atomically)
    const result = await createPreviewInterview(c.env.DB, {
      userId,
      website
    });

    // Get updated user quota for logging
    const userQuota = await getQuotaUsage(c.env.DB, userId);
    const quotaPercentage = userQuota ? Math.round((userQuota.used / userQuota.max) * 100) : 0;
    log.info('Interview created, quota updated', {
      userId,
      interviewId: result.interviewId,
      reportId: result.reportId,
      website,
      quotaUsage: {
        used: userQuota?.used,
        max: userQuota?.max,
        percentageUsed: quotaPercentage,
      },
    });

    return c.json({
      success: true,
      interviewId: result.interviewId,
      reportId: result.reportId,
      message: 'Preview interview created'
    });
  } catch (error: any) {
    log.error('Create from URL error', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Get specific interview by ID
interviewRoutes.get('/:id', async (c) => {
  const log = createRequestLogger(c);
  try {
    const id = c.req.param('id');
    const userId = extractUserId(c);

    const interview = await getInterview(c.env.DB, id);

    if (!interview) {
      log.warn('Interview not found', { interviewId: id });
      return c.json(errorResponse('Interview not found'), 404);
    }

    if (interview.user_id !== userId) {
      log.warn('Authorization failed: User attempted to access another user\'s interview', {
        userId,
        interviewId: id,
        ownerId: interview.user_id
      });
      return c.json(errorResponse('Unauthorized'), 403);
    }

    log.info('Retrieved interview', { interviewId: id });
    return c.json({
      success: true,
      interview,
    });
  } catch (error: any) {
    log.error('Get interview error', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Save interview progress
interviewRoutes.post('/save', async (c) => {
  const log = createRequestLogger(c);
  try {
    const { interviewId, currentQuestion, responses, completed, timestamp } = await c.req.json();
    const userId = extractUserId(c);

    // Get interview to check status
    const interview = await getInterview(c.env.DB, interviewId);

    if (!interview) {
      return c.json(errorResponse('Interview not found'), 404);
    }

    if (interview.user_id !== userId) {
      return c.json(errorResponse('Unauthorized'), 403);
    }

    // Block updates if interview is already completed
    if (interview.status === 'COMPLETED') {
      return c.json({
        success: false,
        error: 'INTERVIEW_LOCKED',
        message: 'This interview has been completed and cannot be modified.',
      }, 403);
    }

    const result = await saveInterview(c.env.DB, {
      userId,
      interviewId,
      currentQuestion: currentQuestion || 0,
      responses: responses || [],
      completed: completed || false
    });

    log.info('Interview saved', { userId, interviewId: result.interviewId, completed });
    return c.json({
      success: true,
      interviewId: result.interviewId,
      status: result.status,
      message: 'Interview saved',
    });
  } catch (error: any) {
    log.error('Save interview error', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Save single response
interviewRoutes.post('/:interviewId/response', async (c) => {
  const log = createRequestLogger(c);
  try {
    const interviewId = c.req.param('interviewId');
    const userId = extractUserId(c);
    const { questionNumber, questionId, questionText, answer } = await c.req.json();

    if (!questionNumber || !answer) {
      return c.json(errorResponse('questionNumber and answer are required'), 400);
    }

    const interview = await getInterview(c.env.DB, interviewId);

    if (!interview) {
      log.warn('Interview not found', { interviewId });
      return c.json(errorResponse('Interview not found'), 404);
    }

    if (interview.user_id !== userId) {
      log.warn('Authorization failed: User attempted to modify another user\'s interview', {
        userId,
        interviewId,
        ownerId: interview.user_id
      });
      return c.json(errorResponse('Unauthorized'), 403);
    }

    await saveResponse(c.env.DB, interviewId, {
      questionNumber,
      questionId,
      question_text: questionText,
      answer
    });

    log.info('Response saved', { interviewId, questionNumber });
    return c.json(successResponse({ interviewId }, 'Response saved'));
  } catch (error: any) {
    log.error('Save response error', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Edit interview responses (creates new version)
interviewRoutes.patch('/:interviewId/responses', async (c) => {
  const log = createRequestLogger(c);
  try {
    const interviewId = c.req.param('interviewId');
    const userId = extractUserId(c);
    const { responses } = await c.req.json();

    if (!responses || !Array.isArray(responses)) {
      return c.json(errorResponse('responses array is required'), 400);
    }

    const interview = await getInterview(c.env.DB, interviewId);

    if (!interview) {
      log.warn('Interview not found', { interviewId });
      return c.json(errorResponse('Interview not found'), 404);
    }

    if (interview.user_id !== userId) {
      log.warn('Authorization failed: User attempted to edit another user\'s interview', {
        userId,
        interviewId,
        ownerId: interview.user_id
      });
      return c.json(errorResponse('Unauthorized'), 403);
    }

    const result = await editInterviewResponses(c.env.DB, interviewId, responses);

    log.info('Responses updated', { interviewId, version: result.version, count: responses.length });
    return c.json({
      success: true,
      version: result.version,
      message: 'Responses updated',
    });
  } catch (error: any) {
    log.error('Edit responses error', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Complete interview
interviewRoutes.post('/complete', async (c) => {
  const log = createRequestLogger(c);
  try {
    const { interviewId, responses, completedAt } = await c.req.json();
    const userId = extractUserId(c);

    if (!interviewId) {
      return c.json(errorResponse('interviewId is required'), 400);
    }

    // Get interview to check status
    const interview = await getInterview(c.env.DB, interviewId);

    if (!interview) {
      return c.json(errorResponse('Interview not found'), 404);
    }

    if (interview.user_id !== userId) {
      return c.json(errorResponse('Unauthorized'), 403);
    }

    // Block if already completed
    if (interview.status === 'COMPLETED') {
      return c.json({
        success: false,
        error: 'INTERVIEW_ALREADY_COMPLETED',
        message: 'This interview has already been completed.',
      }, 400);
    }

    log.info('Completing interview', { interviewId, responseCount: responses?.length });

    // First save/update the interview with all responses
    await saveInterview(c.env.DB, {
      userId,
      interviewId,
      currentQuestion: responses?.length || 0,
      responses: responses || [],
      completed: true
    });

    log.info('Interview saved and marked complete', { interviewId });

    return c.json({
      success: true,
      interviewId,
      message: 'Interview completed',
    });
  } catch (error: any) {
    log.error('Complete interview error', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Delete interview
interviewRoutes.delete('/:id', async (c) => {
  const log = createRequestLogger(c);
  try {
    const id = c.req.param('id');
    const userId = extractUserId(c);

    const interview = await getInterview(c.env.DB, id);

    if (!interview) {
      log.warn('Interview not found', { interviewId: id });
      return c.json(errorResponse('Interview not found'), 404);
    }

    if (interview.user_id !== userId) {
      log.warn('Authorization failed: User attempted to delete another user\'s interview', {
        userId,
        interviewId: id,
        ownerId: interview.user_id
      });
      return c.json(errorResponse('Unauthorized'), 403);
    }

    await deleteInterview(c.env.DB, id);

    log.info('Interview deleted', { interviewId: id });
    return c.json(successResponse(null, 'Interview deleted'));
  } catch (error: any) {
    log.error('Delete interview error', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Get default interview questions
interviewRoutes.get('/questions', (c) => {
  return c.json({
    success: true,
    questions: DEFAULT_QUESTIONS
  });
});

// Summarize interview
interviewRoutes.post('/summarize', async (c) => {
  const log = createRequestLogger(c);
  try {
    const { responses } = await c.req.json();

    if (!responses || !Array.isArray(responses)) {
      return c.json(errorResponse('responses array is required'), 400);
    }

    const { generateEnhancedSummary } = await import('../services/report-generation');
    const summary = await generateEnhancedSummary(responses, c.env.ANTHROPIC_API_KEY);

    log.info('Interview summarized', { responseCount: responses.length });
    return c.json({
      success: true,
      summary
    });
  } catch (error: any) {
    log.error('Summarize interview error', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Transcribe audio (Whisper)
interviewRoutes.post('/transcribe', async (c) => {
  const log = createRequestLogger(c);
  try {
    const formData = await c.req.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return c.json(errorResponse('No audio file provided'), 400);
    }

    const audioBlob = new Blob([await audioFile.arrayBuffer()], { type: audioFile.type });
    const transcript = await transcribeAudio(audioBlob, c.env.OPENAI_API_KEY);

    log.info('Audio transcribed', { audioSize: audioBlob.size });
    return c.json({
      success: true,
      transcript,
    });
  } catch (error: any) {
    log.error('Transcribe error', error);
    return c.json(errorResponse(error.message), 500);
  }
});
