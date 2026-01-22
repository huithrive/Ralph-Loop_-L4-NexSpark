/**
 * OpenAI API client wrapper
 */

import { API_ENDPOINTS, AI_MODELS, DEFAULT_MODEL_CONFIGS, TIMEOUTS } from '../../config';
import { fetchWithTimeout } from '../../utils/fetch-with-timeout';
import { extractJsonFromText } from '../../utils/json-parser';

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIChatOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  timeout?: number;
}

export interface OpenAIChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Call OpenAI Chat API
 */
export async function callOpenAI(
  prompt: string,
  apiKey: string,
  options: OpenAIChatOptions = {}
): Promise<string> {
  const {
    model = DEFAULT_MODEL_CONFIGS.openai.defaultModel,
    maxTokens = DEFAULT_MODEL_CONFIGS.openai.defaultMaxTokens,
    temperature = DEFAULT_MODEL_CONFIGS.openai.defaultTemperature,
    timeout = TIMEOUTS.api.default,
  } = options;

  const messages: OpenAIMessage[] = [
    {
      role: 'user',
      content: prompt,
    },
  ];

  const response = await fetchWithTimeout(API_ENDPOINTS.openai.chat, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
    }),
    timeout,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data: OpenAIChatResponse = await response.json();
  return data.choices[0].message.content;
}

/**
 * Call OpenAI Chat API with conversation history
 */
export async function callOpenAIWithHistory(
  messages: OpenAIMessage[],
  apiKey: string,
  options: OpenAIChatOptions = {}
): Promise<string> {
  const {
    model = DEFAULT_MODEL_CONFIGS.openai.defaultModel,
    maxTokens = DEFAULT_MODEL_CONFIGS.openai.defaultMaxTokens,
    temperature = DEFAULT_MODEL_CONFIGS.openai.defaultTemperature,
    timeout = TIMEOUTS.api.default,
  } = options;

  const response = await fetchWithTimeout(API_ENDPOINTS.openai.chat, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
    }),
    timeout,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data: OpenAIChatResponse = await response.json();
  return data.choices[0].message.content;
}

/**
 * Call OpenAI API and extract JSON response
 */
export async function callOpenAIJson<T = any>(
  prompt: string,
  apiKey: string,
  options: OpenAIChatOptions = {}
): Promise<T> {
  const text = await callOpenAI(prompt, apiKey, options);
  return extractJsonFromText(text);
}

/**
 * Transcribe audio using Whisper API
 */
export async function transcribeAudio(
  audioBlob: Blob,
  apiKey: string
): Promise<string> {
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');
  formData.append('model', AI_MODELS.openai.whisper);

  const response = await fetchWithTimeout(API_ENDPOINTS.openai.audio.transcriptions, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
    timeout: TIMEOUTS.api.default,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Whisper API error: ${error}`);
  }

  const data = await response.json();
  return data.text;
}

/**
 * Generate speech using TTS API
 */
export async function generateSpeech(
  text: string,
  apiKey: string,
  voice: string = 'alloy'
): Promise<Blob> {
  const response = await fetchWithTimeout(API_ENDPOINTS.openai.audio.speech, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: AI_MODELS.openai.tts,
      input: text,
      voice,
    }),
    timeout: TIMEOUTS.api.default,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`TTS API error: ${error}`);
  }

  return await response.blob();
}
