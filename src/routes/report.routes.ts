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

    const generationId = generateGenerationId();
    const now = new Date().toISOString();

    await createReportGeneration(c.env.DB, {
      id: generationId,
      userId,
      interviewId,
      currentState: 'NOT_STARTED',
      progressPercent: 0,
      paid: false,
      createdAt: now,
      updatedAt: now,
    });

    return c.json({
      success: true,
      generationId,
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
      userId,
      interviewId,
      currentState: 'NOT_STARTED',
      progressPercent: 0,
      paid: false,
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
  const { analyzeInterview } = await import('../services/report-generation');

  const step1Data = await analyzeInterview(generation.interviewId, env);

  return {
    currentState: 'PROFILE_REVIEW' as ReportGenerationState,
    progressPercent: 25,
    step1Data: JSON.stringify(step1Data),
  };
}

async function executeStep2(env: any, generation: any, data: any) {
  const { researchCompetitors } = await import('../services/report-generation');

  const step1Data = generation.step1Data ? JSON.parse(generation.step1Data) : {};
  const step2Data = await researchCompetitors(step1Data, env);

  return {
    currentState: 'PREVIEW_READY' as ReportGenerationState,
    progressPercent: 50,
    step2Data: JSON.stringify(step2Data),
  };
}

async function executeStep4(env: any, generation: any) {
  const step1Data = generation.step1Data ? JSON.parse(generation.step1Data) : {};
  const step2Data = generation.step2Data ? JSON.parse(generation.step2Data) : {};

  const { generateReport } = await import('../services/report-generation');
  const reportHtml = await generateReport(
    generation.interviewId,
    step1Data,
    step2Data,
    env
  );

  const reportId = generateReportId();

  // Save report to database
  await env.DB.prepare(`
    INSERT INTO strategy_reports (
      id, user_id, interview_id, generation_id,
      brand_name, html_report, report_format,
      version, is_latest, paid, payment_id, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, 'v2', 1, 1, ?, ?, CURRENT_TIMESTAMP)
  `).bind(
    reportId,
    generation.userId,
    generation.interviewId,
    generation.id,
    step1Data.brandName || 'Unknown',
    reportHtml,
    generation.paid ? 1 : 0,
    generation.paymentId || null
  ).run();

  // Update generation to complete
  const { completeGeneration } = await import('../services/database');
  await completeGeneration(env.DB, generation.id, reportId);

  return {
    currentState: 'COMPLETE' as ReportGenerationState,
    progressPercent: 100,
    reportId,
  };
}
