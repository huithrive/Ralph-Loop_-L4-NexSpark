/**
 * Conversational interview routes
 */

import { Hono } from 'hono';
import {
  generateNextQuestion,
  generateAcknowledgment,
  generateRealtimeSummary,
  getInitialQuestions,
  getInterviewIntroduction,
  transcribeWithLanguage,
  synthesizeSpeech
} from '../services/conversational-interview';
import type { ConversationContext } from '../services/conversational-interview';
import { successResponse, errorResponse } from '../utils/api-response';
import { createRequestLogger } from '../utils/logger';

export const conversationalRoutes = new Hono();

// Get initial questions by language
conversationalRoutes.get('/initial-questions/:language', async (c) => {
  const log = createRequestLogger(c);
  try {
    const language = c.req.param('language') as 'en' | 'zh';
    const questions = getInitialQuestions(language);

    log.info('Retrieved initial questions', { language, count: questions.length });
    return c.json({
      success: true,
      questions,
    });
  } catch (error: any) {
    log.error('Get initial questions error', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Get interview introduction by language
conversationalRoutes.get('/introduction/:language', async (c) => {
  const log = createRequestLogger(c);
  try {
    const language = c.req.param('language') as 'en' | 'zh';
    const introduction = getInterviewIntroduction(language);

    log.info('Retrieved introduction', { language });
    return c.json({
      success: true,
      ...introduction
    });
  } catch (error: any) {
    log.error('Get introduction error', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Get specific question by language and index
conversationalRoutes.get('/question/:language/:index', async (c) => {
  const log = createRequestLogger(c);
  try {
    const language = c.req.param('language') as 'en' | 'zh';
    const index = parseInt(c.req.param('index'));
    const questions = getInitialQuestions(language);

    if (index < 0 || index >= questions.length) {
      return c.json(errorResponse('Invalid question index'), 400);
    }

    log.info('Retrieved question', { language, index });
    return c.json({
      success: true,
      question: questions[index],
      index,
      totalQuestions: questions.length
    });
  } catch (error: any) {
    log.error('Get question error', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Generate acknowledgment
conversationalRoutes.post('/acknowledgment', async (c) => {
  const log = createRequestLogger(c);
  try {
    const { userAnswer, context } = await c.req.json();

    if (!userAnswer || !context) {
      return c.json(errorResponse('userAnswer and context are required'), 400);
    }

    const acknowledgment = await generateAcknowledgment(userAnswer, context, c.env);

    log.info('Acknowledgment generated', { questionIndex: context.currentQuestionIndex });
    return c.json({
      success: true,
      acknowledgment
    });
  } catch (error: any) {
    log.error('Acknowledgment generation error', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Get next question in conversational flow
conversationalRoutes.post('/next-question', async (c) => {
  const log = createRequestLogger(c);
  try {
    const { context } = await c.req.json();

    if (!context) {
      return c.json(errorResponse('context is required'), 400);
    }

    const nextQuestion = await generateNextQuestion(context, c.env);

    log.info('Next question generated', { questionIndex: context.currentQuestionIndex });
    return c.json({
      success: true,
      nextQuestion,
    });
  } catch (error: any) {
    log.error('Next question error', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Generate real-time summary
conversationalRoutes.post('/summary', async (c) => {
  const log = createRequestLogger(c);
  try {
    const { context } = await c.req.json();

    if (!context) {
      return c.json(errorResponse('context is required'), 400);
    }

    const summary = await generateRealtimeSummary(context, c.env);

    log.info('Real-time summary generated', { answersCount: context.answers?.length });
    return c.json({
      success: true,
      summary
    });
  } catch (error: any) {
    log.error('Summary generation error', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Transcribe audio with language detection
conversationalRoutes.post('/transcribe', async (c) => {
  const log = createRequestLogger(c);
  try {
    const formData = await c.req.formData();
    const audioFile = formData.get('audio') as File;
    const language = (formData.get('language') || 'en') as 'en' | 'zh';

    if (!audioFile) {
      return c.json(errorResponse('No audio file provided'), 400);
    }

    log.debug('Received audio file', {
      name: audioFile.name,
      type: audioFile.type,
      size: audioFile.size,
      language
    });

    // Validate file size
    if (audioFile.size < 1000) {
      return c.json(errorResponse('Audio file too small. Please record a longer message.'), 400);
    }

    const audioBuffer = await audioFile.arrayBuffer();
    const result = await transcribeWithLanguage(audioBuffer, language, c.env);

    log.info('Audio transcribed', { language, size: audioFile.size });
    return c.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    log.error('Transcription error', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Synthesize speech
conversationalRoutes.post('/synthesize', async (c) => {
  const log = createRequestLogger(c);
  try {
    const { text, language = 'en' } = await c.req.json();

    if (!text) {
      return c.json(errorResponse('text is required'), 400);
    }

    const audioBuffer = await synthesizeSpeech(text, language, c.env);

    log.info('Speech synthesized', { language, textLength: text.length });
    // Return audio as blob
    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (error: any) {
    log.error('Speech synthesis error', error);
    return c.json(errorResponse(error.message), 500);
  }
});
