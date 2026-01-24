/**
 * Report generation routes
 */

import { Hono } from 'hono';
import {
  createReportGeneration,
  getGenerationState,
  updateGenerationState,
  getReport,
  getUserReports,
} from '../services/database';
import { generateReport } from '../services/report-generator';
import { successResponse, errorResponse } from '../utils/api-response';
import { generateGenerationId, generateReportId } from '../utils/id-generator';
import type { ReportGenerationState } from '../types';

export const reportRoutes = new Hono();

// Start report generation
reportRoutes.post('/start', async (c) => {
  try {
    const { interviewId, userId } = await c.req.json();

    if (!interviewId || !userId) {
      return c.json(errorResponse('interviewId and userId are required'), 400);
    }

    // Ensure user exists in database (create if not)
    try {
      const existingUser = await c.env.DB.prepare(
        'SELECT id FROM users WHERE id = ?'
      ).bind(userId).first();

      if (!existingUser) {
        // Create user record
        await c.env.DB.prepare(`
          INSERT INTO users (id, email, name, type, created_at, updated_at)
          VALUES (?, ?, ?, 'anonymous', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `).bind(userId, `${userId}@anonymous.local`, 'Anonymous User').run();
        console.log('Created anonymous user:', userId);
      }
    } catch (userError) {
      console.warn('User check/create error:', userError);
    }

    // Ensure interview exists in database
    const existingInterview = await c.env.DB.prepare(
      'SELECT id FROM interviews WHERE id = ?'
    ).bind(interviewId).first();

    if (!existingInterview) {
      // Create interview record if it doesn't exist
      const { getLatestVersion } = await import('../services/database');
      const version = await getLatestVersion(c.env.DB, userId);

      await c.env.DB.prepare(`
        INSERT INTO interviews (id, user_id, version, current_question, completed, created_at, updated_at)
        VALUES (?, ?, ?, 0, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).bind(interviewId, userId, version).run();
      console.log('Created interview record:', interviewId);
    }

    // Check if user has already paid (pay-before-interview flow)
    let alreadyPaid = false;
    let paymentId: string | null = null;

    try {
      const { hasUserPaidAny } = await import('../services/stripe-payment');
      const paymentStatus = await hasUserPaidAny(c.env.DB, userId);
      alreadyPaid = paymentStatus.paid === true;
      paymentId = typeof paymentStatus.paymentId === 'string' ? paymentStatus.paymentId : null;
      console.log('Payment status check:', { alreadyPaid, paymentId });
    } catch (paymentCheckError) {
      console.warn('Failed to check payment status, defaulting to unpaid:', paymentCheckError);
    }

    const generationId = generateGenerationId();
    const now = new Date().toISOString();

    await createReportGeneration(c.env.DB, {
      id: generationId,
      userId: String(userId),
      interviewId: String(interviewId),
      currentState: 'NOT_STARTED',
      progressPercent: 0,
      paid: alreadyPaid,
      paymentId: paymentId,
      createdAt: now,
      updatedAt: now,
    });

    return c.json({
      success: true,
      generationId,
      alreadyPaid,
    });
  } catch (error: any) {
    console.error('Start report generation error:', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Get generation state
reportRoutes.get('/state/:generationId', async (c) => {
  try {
    const generationId = c.req.param('generationId');

    const generation = await getGenerationState(c.env.DB, generationId);

    if (!generation) {
      return c.json(errorResponse('Generation not found'), 404);
    }

    return c.json({
      success: true,
      ...generation,
    });
  } catch (error: any) {
    console.error('Get generation state error:', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Update generation state (for payment confirmation)
reportRoutes.patch('/state/:generationId', async (c) => {
  try {
    const generationId = c.req.param('generationId');
    const updates = await c.req.json();

    await updateGenerationState(c.env.DB, generationId, updates);

    return c.json(successResponse());
  } catch (error: any) {
    console.error('Update generation state error:', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Execute generation step
reportRoutes.post('/execute-step', async (c) => {
  try {
    const { generationId, step, data } = await c.req.json();

    if (!generationId || !step) {
      return c.json(errorResponse('generationId and step are required'), 400);
    }

    const generation = await getGenerationState(c.env.DB, generationId);

    if (!generation) {
      return c.json(errorResponse('Generation not found'), 404);
    }

    // Execute the appropriate step
    let updates: any = {};

    switch (step) {
      case 1:
        // Step 1: Analyze interview
        updates = await executeStep1(c.env, generation);
        break;

      case 2:
        // Step 2: Research competitors
        updates = await executeStep2(c.env, generation, data);
        break;

      case 3:
        // Step 3: Payment (handled externally)
        updates = { currentState: 'PAYMENT_REQUIRED', progressPercent: 75 };
        break;

      case 4:
        // Step 4: Generate full strategy
        updates = await executeStep4(c.env, generation);
        break;

      default:
        return c.json(errorResponse('Invalid step number'), 400);
    }

    await updateGenerationState(c.env.DB, generationId, updates);

    return c.json(successResponse());
  } catch (error: any) {
    console.error('Execute step error:', error);

    // Update generation to failed state
    try {
      const { markGenerationFailed } = await import('../services/database');
      await markGenerationFailed(c.env.DB, generationId, error.message);
    } catch (updateError) {
      console.error('Failed to update error state:', updateError);
    }

    return c.json(errorResponse(error.message), 500);
  }
});

// Get report by ID
reportRoutes.get('/:reportId', async (c) => {
  try {
    const reportId = c.req.param('reportId');

    const report = await getReport(c.env.DB, reportId);

    if (!report) {
      return c.json(errorResponse('Report not found'), 404);
    }

    return c.json({
      success: true,
      report: {
        ...report,
        html_report: report.html_report,
        brand_name: report.brand_name,
      },
    });
  } catch (error: any) {
    console.error('Get report error:', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Delete report
reportRoutes.delete('/:reportId', async (c) => {
  try {
    const reportId = c.req.param('reportId');

    const { deleteReport } = await import('../services/database');
    await deleteReport(c.env.DB, reportId);

    return c.json(successResponse(null, 'Report deleted'));
  } catch (error: any) {
    console.error('Delete report error:', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Generate report (alternative flow)
reportRoutes.post('/generate', async (c) => {
  try {
    const { interviewId, userId } = await c.req.json();

    if (!interviewId || !userId) {
      return c.json(errorResponse('interviewId and userId are required'), 400);
    }

    // Use ReportGenerator for full generation
    const { ReportGenerator } = await import('../services/report-generator');
    const generator = new ReportGenerator(c.env.DB, c.env, 'v2');

    const generationId = generateGenerationId();
    await generator.createGeneration(generationId, userId, interviewId);

    // Get interview data
    const { getInterview } = await import('../services/database');
    const interview = await getInterview(c.env.DB, interviewId);

    if (!interview) {
      return c.json(errorResponse('Interview not found'), 404);
    }

    // Execute all steps
    await generator.executeStep1(generationId, interview);
    const state = await generator.getState(generationId);

    if (state?.step1Data?.website) {
      await generator.executeStep2(generationId, state.step1Data.website);
    }

    return c.json({
      success: true,
      generationId,
      message: 'Report generation started'
    });
  } catch (error: any) {
    console.error('Generate report error:', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Regenerate report for interview
reportRoutes.post('/regenerate/:interviewId', async (c) => {
  try {
    const interviewId = c.req.param('interviewId');
    const { userId } = await c.req.json();

    if (!userId) {
      return c.json(errorResponse('userId is required'), 400);
    }

    // Create new generation
    const generationId = generateGenerationId();
    const now = new Date().toISOString();

    await createReportGeneration(c.env.DB, {
      id: generationId,
      userId: String(userId),
      interviewId: String(interviewId),
      currentState: 'NOT_STARTED',
      progressPercent: 0,
      paid: false,
      paymentId: null,
      createdAt: now,
      updatedAt: now,
    });

    return c.json({
      success: true,
      generationId
    });
  } catch (error: any) {
    console.error('Regenerate report error:', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Helper functions for step execution
async function executeStep1(env: any, generation: any) {
  const { ReportGenerator } = await import('../services/report-generator');
  const generator = new ReportGenerator(env.DB, env, 'v2');

  // Get interview data
  const interview = await env.DB.prepare(`
    SELECT i.*, GROUP_CONCAT(r.answer, '|||') as answers, GROUP_CONCAT(r.question, '|||') as questions
    FROM interviews i
    LEFT JOIN interview_responses r ON i.id = r.interview_id
    WHERE i.id = ?
    GROUP BY i.id
  `).bind(generation.interviewId).first();

  if (!interview) {
    throw new Error('Interview not found');
  }

  // Parse responses
  const answers = interview.answers ? interview.answers.split('|||') : [];
  const questions = interview.questions ? interview.questions.split('|||') : [];
  interview.responses = answers.map((answer: string, idx: number) => ({
    question: questions[idx] || '',
    answer: answer
  }));

  console.log('Executing step 1 with interview:', interview.id);
  const businessProfile = await generator.executeStep1(generation.id, interview);

  return {
    currentState: 'PROFILE_REVIEW' as ReportGenerationState,
    progressPercent: 25,
    step1Data: JSON.stringify(businessProfile),
  };
}

async function executeStep2(env: any, generation: any, data: any) {
  const { ReportGenerator } = await import('../services/report-generator');
  const generator = new ReportGenerator(env.DB, env, 'v2');

  const step1Data = generation.step1Data ? JSON.parse(generation.step1Data) : generation.step_1_analysis ? JSON.parse(generation.step_1_analysis) : {};

  if (!step1Data.website) {
    throw new Error('Missing website from step 1 data');
  }

  console.log('Executing step 2 with website:', step1Data.website);
  const researchData = await generator.executeStep2(generation.id, step1Data.website, step1Data);

  return {
    currentState: 'PREVIEW_READY' as ReportGenerationState,
    progressPercent: 50,
    step2Data: JSON.stringify(researchData),
  };
}

async function executeStep4(env: any, generation: any) {
  const { ReportGenerator } = await import('../services/report-generator');
  const generator = new ReportGenerator(env.DB, env, 'v2');

  // Check payment
  if (!generation.paid) {
    throw new Error('Payment required before generating strategy');
  }

  console.log('Executing step 4 for generation:', generation.id);
  const result = await generator.executeStep4(generation.id);

  return {
    currentState: 'COMPLETE' as ReportGenerationState,
    progressPercent: 100,
    reportId: result.reportId,
  };
}
