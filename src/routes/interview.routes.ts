/**
 * Interview routes
 */

import { Hono } from 'hono';
import {
  getIncompleteInterview,
  saveInterview,
  getInterview,
  completeInterview,
  getInterviewHistory,
  deleteInterview,
} from '../services/database';
import { transcribeAudio } from '../services/ai/openai-client';
import { successResponse, errorResponse } from '../utils/api-response';
import { generateInterviewId } from '../utils/id-generator';
import { DEFAULT_QUESTIONS } from '../config/defaults';

export const interviewRoutes = new Hono();

// Get interview history (with pagination)
interviewRoutes.get('/history', async (c) => {
  try {
    const userId = c.req.query('userId');
    const limit = parseInt(c.req.query('limit') || '10');
    const offset = parseInt(c.req.query('offset') || '0');

    if (!userId) {
      return c.json(errorResponse('userId is required'), 400);
    }

    if (!c.env.DB) {
      console.warn('⚠️ D1 database not configured for interview history');
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

    const result = await getInterviewHistory(c.env.DB, userId, safeLimit, safeOffset);

    return c.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    console.error('Get interview history error:', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Check for existing interview
interviewRoutes.get('/check', async (c) => {
  try {
    const userId = c.req.query('userId');

    if (!userId) {
      return c.json(errorResponse('userId is required'), 400);
    }

    const interview = await getIncompleteInterview(c.env.DB, userId);

    if (interview) {
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
    console.error('Check interview error:', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Get specific interview by ID
interviewRoutes.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    const interview = await getInterview(c.env.DB, id);

    if (!interview) {
      return c.json(errorResponse('Interview not found'), 404);
    }

    return c.json({
      success: true,
      interview,
    });
  } catch (error: any) {
    console.error('Get interview error:', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Save interview progress
interviewRoutes.post('/save', async (c) => {
  try {
    const { userId, interviewId, currentQuestion, responses, completed, timestamp } = await c.req.json();

    if (!userId) {
      return c.json(errorResponse('userId is required'), 400);
    }

    const id = interviewId || generateInterviewId();
    const createdAt = timestamp || new Date().toISOString();

    await saveInterview(c.env.DB, {
      id,
      userId,
      responses: JSON.stringify(responses || []),
      completed: completed || false,
      createdAt,
      currentQuestion: currentQuestion || 0,
    });

    return c.json({
      success: true,
      interviewId: id,
      message: 'Interview saved',
    });
  } catch (error: any) {
    console.error('Save interview error:', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Complete interview
interviewRoutes.post('/complete', async (c) => {
  try {
    const { userId, interviewId, responses, completedAt } = await c.req.json();

    if (!userId || !interviewId) {
      return c.json(errorResponse('userId and interviewId are required'), 400);
    }

    // Complete takes just the interviewId
    await completeInterview(c.env.DB, interviewId);

    return c.json({
      success: true,
      interviewId,
      message: 'Interview completed',
    });
  } catch (error: any) {
    console.error('Complete interview error:', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Delete interview
interviewRoutes.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    await deleteInterview(c.env.DB, id);

    return c.json(successResponse(null, 'Interview deleted'));
  } catch (error: any) {
    console.error('Delete interview error:', error);
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

// Analyze interview
interviewRoutes.post('/analyze', async (c) => {
  try {
    const { interviewId } = await c.req.json();

    if (!interviewId) {
      return c.json(errorResponse('interviewId is required'), 400);
    }

    const { analyzeInterview } = await import('../services/post-interview-analysis-v2');
    const analysis = await analyzeInterview(interviewId, c.env.ANTHROPIC_API_KEY);

    return c.json({
      success: true,
      analysis
    });
  } catch (error: any) {
    console.error('Analyze interview error:', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Summarize interview
interviewRoutes.post('/summarize', async (c) => {
  try {
    const { responses } = await c.req.json();

    if (!responses || !Array.isArray(responses)) {
      return c.json(errorResponse('responses array is required'), 400);
    }

    const { generateEnhancedSummary } = await import('../services/report-generation');
    const summary = await generateEnhancedSummary(responses, c.env.ANTHROPIC_API_KEY);

    return c.json({
      success: true,
      summary
    });
  } catch (error: any) {
    console.error('Summarize interview error:', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Transcribe audio (Whisper)
interviewRoutes.post('/transcribe', async (c) => {
  try {
    const formData = await c.req.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return c.json(errorResponse('No audio file provided'), 400);
    }

    const audioBlob = new Blob([await audioFile.arrayBuffer()], { type: audioFile.type });
    const transcript = await transcribeAudio(audioBlob, c.env.OPENAI_API_KEY);

    return c.json({
      success: true,
      transcript,
    });
  } catch (error: any) {
    console.error('Transcribe error:', error);
    return c.json(errorResponse(error.message), 500);
  }
});
