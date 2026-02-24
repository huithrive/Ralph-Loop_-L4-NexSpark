/**
 * Conversational Interview Service
 * Multilingual, empathetic AI interviewer with real-time engagement
 */

import { transcribeAudio, callOpenAIWithHistory, generateSpeech } from './ai/openai-client';
import type { OpenAIMessage } from './ai/openai-client';
import { AI_MODELS } from '../config';
import { createLogger } from '../utils/logger';
import {
  getAcknowledgmentPrompt,
  buildAcknowledgmentUserPrompt,
  getNextQuestionPrompt,
  buildNextQuestionUserPrompt,
  getRealtimeSummaryPrompt,
  buildRealtimeSummaryUserPrompt,
  getInitialQuestions as getInitialQuestionsFromPrompts,
  getSampleAnswers as getSampleAnswersFromPrompts,
  getInterviewIntroduction as getInterviewIntroductionFromPrompts,
  getFallbackAcknowledgment,
  getFallbackQuestions,
  getDefaultSummary
} from './ai/conversational-prompts';

export interface ConversationMessage {
  role: 'interviewer' | 'user';
  content: string;
  language: 'en' | 'zh';
  timestamp: string;
  type: 'question' | 'acknowledgment' | 'follow-up' | 'answer';
}

export interface ConversationContext {
  language: 'en' | 'zh';
  previousMessages: ConversationMessage[];
  currentTopic: string;
  userProfile: {
    brandName?: string;
    industry?: string;
    stage?: string;
  };
}

export interface RealtimeSummary {
  keyPoints: string[];
  industry: string;
  stage?: string;
  challenges: string[];
  opportunities: string[];
  nextFocus: string;
}

/**
 * Initialize OpenAI client with multilingual support
 */
function getOpenAIClient(env?: any) {
  const apiKey = env?.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  const baseURL = env?.OPENAI_BASE_URL || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required');
  }

  return {
    apiKey,
    baseURL
  };
}

/**
 * Transcribe audio with language auto-detection
 */
export async function transcribeWithLanguage(
  audioBuffer: ArrayBuffer,
  preferredLanguage: 'en' | 'zh',
  env?: any
): Promise<{ text: string; language: 'en' | 'zh' }> {
  const log = createLogger({ context: '[Conversational]' });
  try {
    const { apiKey } = getOpenAIClient(env);

    log.debug('Transcribing audio', {
      bufferSize: audioBuffer.byteLength,
      preferredLanguage
    });

    // Validate audio buffer
    if (audioBuffer.byteLength < 1000) {
      throw new Error('Audio buffer too small. Recording may be corrupted.');
    }

    // Create blob for transcription (keep original format)
    const blob = new Blob([audioBuffer], { type: 'audio/webm' });

    // Use new transcription client wrapper
    const text = await transcribeAudio(blob, apiKey);

    log.info('Transcription result', { preview: text.substring(0, 100) });

    // Detect if response is Chinese
    const isChinese = /[\u4e00-\u9fa5]/.test(text);
    const detectedLanguage = isChinese ? 'zh' : 'en';

    return {
      text,
      language: detectedLanguage
    };
  } catch (error) {
    log.error('Transcription error', error);
    throw error;
  }
}

/**
 * Generate empathetic response/acknowledgment
 * Shows understanding and encourages further engagement
 */
export async function generateAcknowledgment(
  userAnswer: string,
  context: ConversationContext,
  env?: any
): Promise<string> {
  const log = createLogger({ context: '[Conversational]' });
  try {
    const { apiKey, baseURL } = getOpenAIClient(env);

    const systemPrompt = getAcknowledgmentPrompt(context.language);

    const conversationHistory = context.previousMessages
      .slice(-4)
      .map(m => `${m.role === 'interviewer' ? 'Interviewer' : 'User'}: ${m.content}`)
      .join('\n');

    const userPrompt = buildAcknowledgmentUserPrompt(conversationHistory, userAnswer, context.language);

    // Use new OpenAI client wrapper
    const messages: OpenAIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const response = await callOpenAIWithHistory(messages, apiKey, {
      model: AI_MODELS.openai.gpt4,
      maxTokens: 20,
      temperature: 0.8
    });

    return response.trim();
  } catch (error) {
    log.error('Acknowledgment generation error', error);
    // Fallback acknowledgments
    return getFallbackAcknowledgment(context.language);
  }
}

/**
 * Generate next question with context awareness
 */
export async function generateNextQuestion(
  context: ConversationContext,
  env?: any
): Promise<string> {
  const log = createLogger({ context: '[Conversational]' });
  try {
    const { apiKey, baseURL } = getOpenAIClient(env);

    const systemPrompt = getNextQuestionPrompt(context.language, context.currentTopic, context.userProfile);

    const conversationHistory = context.previousMessages
      .map(m => `${m.role === 'interviewer' ? 'Interviewer' : 'User'}: ${m.content}`)
      .join('\n');

    const userPrompt = buildNextQuestionUserPrompt(conversationHistory);

    // Use new OpenAI client wrapper
    const messages: OpenAIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const response = await callOpenAIWithHistory(messages, apiKey, {
      model: AI_MODELS.openai.gpt4,
      maxTokens: 150,
      temperature: 0.7
    });

    return response.trim();
  } catch (error) {
    log.error('Question generation error', error);
    // Fallback questions
    const fallbacks = getFallbackQuestions(context.language);
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
}

/**
 * Generate real-time summary as user speaks
 */
export async function generateRealtimeSummary(
  context: ConversationContext,
  env?: any
): Promise<RealtimeSummary> {
  const log = createLogger({ context: '[Conversational]' });
  try {
    const { apiKey, baseURL } = getOpenAIClient(env);

    // Extract user answers from conversation
    const conversationHistory = context.previousMessages
      .filter(m => m.role === 'user')
      .map(m => m.content)
      .join('\n\n');

    // Perform website research if URL is provided
    let websiteContext = '';
    if (context.userProfile?.websiteUrl) {
      try {
        log.info('🔍 Researching website', { url: context.userProfile.websiteUrl });
        const siteResponse = await fetch(context.userProfile.websiteUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; NexSpark/1.0; +https://nexspark.io)'
          }
        });
        
        if (siteResponse.ok) {
          let htmlContent = await siteResponse.text();
          // Extract meaningful content
          htmlContent = htmlContent
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 3000); // Limit to 3000 chars
          
          websiteContext = `\n\nWebsite Content:\n${htmlContent}`;
          log.info('Website content extracted successfully');
        }
      } catch (error) {
        log.warn('Website research failed, continuing with interview data only', error);
      }
    }
    
    const systemPrompt = getRealtimeSummaryPrompt(context.language);

    const userPrompt = buildRealtimeSummaryUserPrompt(
      conversationHistory,
      websiteContext,
      context.userProfile?.brandName,
      context.userProfile?.websiteUrl
    );

    // Use new OpenAI client wrapper
    const messages: OpenAIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const responseText = await callOpenAIWithHistory(messages, apiKey, {
      model: AI_MODELS.openai.gpt4,
      maxTokens: 800,
      temperature: 0.3
    });

    const summary = JSON.parse(responseText);
    const defaults = getDefaultSummary(context.language);

    return {
      keyPoints: summary.keyPoints || [],
      industry: summary.industry || defaults.industry,
      stage: summary.stage || defaults.stage,
      challenges: summary.challenges || [],
      opportunities: summary.opportunities || [],
      nextFocus: summary.nextFocus || defaults.nextFocus
    };
  } catch (error) {
    log.error('Summary generation error', error);
    const defaults = getDefaultSummary(context.language);
    return {
      keyPoints: [],
      industry: defaults.industry,
      stage: defaults.stage,
      challenges: [],
      opportunities: [],
      nextFocus: defaults.nextFocus
    };
  }
}

/**
 * Text-to-Speech with language support
 */
export async function synthesizeSpeech(
  text: string,
  language: 'en' | 'zh',
  env?: any
): Promise<ArrayBuffer> {
  const log = createLogger({ context: '[Conversational]' });
  try {
    const { apiKey } = getOpenAIClient(env);

    // Choose appropriate voice for language
    const voice = language === 'zh' ? 'nova' : 'alloy'; // nova has better multilingual support

    // Use new TTS client wrapper
    const blob = await generateSpeech(text, apiKey, voice);
    return await blob.arrayBuffer();
  } catch (error) {
    log.error('Speech synthesis error', error);
    throw error;
  }
}

/**
 * Initial interview questions by language (8 essential questions)
 */
export function getInitialQuestions(language: 'en' | 'zh'): string[] {
  return getInitialQuestionsFromPrompts(language);
}

/**
 * Get sample answers for each question
 */
export function getSampleAnswers(language: 'en' | 'zh', questionIndex: number): string {
  return getSampleAnswersFromPrompts(language, questionIndex);
}

/**
 * Get interview introduction by language
 */
export function getInterviewIntroduction(language: 'en' | 'zh'): {
  title: string;
  purpose: string[];
  guidelines: string[];
} {
  return getInterviewIntroductionFromPrompts(language);
}
