/**
 * Conversational interview routes
 */

import { Hono } from 'hono';
import {
  generateNextQuestion,
  generateAcknowledgment,
  generateRealtimeSummary,
  getInitialQuestions,
  transcribeWithLanguage,
  synthesizeSpeech
} from '../services/conversational-interview';
import type { ConversationContext } from '../services/conversational-interview';
import { successResponse, errorResponse } from '../utils/api-response';

export const conversationalRoutes = new Hono();

// Get next question in conversational flow
conversationalRoutes.post('/next-question', async (c) => {
  try {
    const { conversationHistory, lastAnswer, language = 'en' } = await c.req.json();

    // Build context from conversation history
    const context: ConversationContext = {
      language,
      previousMessages: conversationHistory || [],
      currentTopic: 'growth',
      userProfile: {},
    };

    // Generate acknowledgment if there was a last answer
    let acknowledgment = null;
    if (lastAnswer) {
      acknowledgment = await generateAcknowledgment(context, lastAnswer, c.env);
    }

    // Generate next question
    const nextQuestion = await generateNextQuestion(context, c.env);

    return c.json({
      success: true,
      acknowledgment,
      nextQuestion,
    });
  } catch (error: any) {
    console.error('Conversational interview error:', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Get initial questions
conversationalRoutes.get('/initial-questions', async (c) => {
  try {
    const language = (c.req.query('language') || 'en') as 'en' | 'zh';
    const questions = getInitialQuestions(language);

    return c.json({
      success: true,
      questions,
    });
  } catch (error: any) {
    console.error('Get initial questions error:', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Transcribe audio with language detection
conversationalRoutes.post('/transcribe', async (c) => {
  try {
    const formData = await c.req.formData();
    const audioFile = formData.get('audio') as File;
    const language = (formData.get('language') || 'en') as 'en' | 'zh';

    if (!audioFile) {
      return c.json(errorResponse('No audio file provided'), 400);
    }

    const audioBuffer = await audioFile.arrayBuffer();
    const result = await transcribeWithLanguage(audioBuffer, language, c.env);

    return c.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Transcription error:', error);
    return c.json(errorResponse(error.message), 500);
  }
});
