/**
 * OpenAI API client wrapper
 */

import { API_ENDPOINTS, AI_MODELS, DEFAULT_MODEL_CONFIGS, TIMEOUTS } from '../../config';
import { fetchWithTimeout } from '../../utils/fetch-with-timeout';
import { extractJsonFromText } from '../../utils/json-parser';

export interface TokenUsage {
  input_tokens: number;
  output_tokens: number;
  model: string;
}

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAITool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, any>;
      required?: string[];
    };
  };
}

export interface OpenAIChatOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  timeout?: number;
  tools?: OpenAITool[];
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
      tool_calls?: Array<{
        id: string;
        type: string;
        function: {
          name: string;
          arguments: string;
        };
      }>;
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
): Promise<{ content: string; usage: TokenUsage }> {
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
  return {
    content: data.choices[0].message.content,
    usage: {
      input_tokens: data.usage.prompt_tokens,
      output_tokens: data.usage.completion_tokens,
      model: data.model,
    },
  };
}

/**
 * Call OpenAI Chat API with conversation history
 */
export async function callOpenAIWithHistory(
  messages: OpenAIMessage[],
  apiKey: string,
  options: OpenAIChatOptions = {}
): Promise<{ content: string; usage: TokenUsage }> {
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
  return {
    content: data.choices[0].message.content,
    usage: {
      input_tokens: data.usage.prompt_tokens,
      output_tokens: data.usage.completion_tokens,
      model: data.model,
    },
  };
}

/**
 * Call OpenAI API and extract JSON response
 */
export async function callOpenAIJson<T = any>(
  prompt: string,
  apiKey: string,
  options: OpenAIChatOptions = {}
): Promise<{ data: T; usage: TokenUsage }> {
  const { content, usage } = await callOpenAI(prompt, apiKey, options);
  const data = extractJsonFromText(content);
  return { data, usage };
}

/**
 * Call OpenAI API with tools support (for agentic behavior)
 */
export async function callOpenAIJsonWithTools<T = any>(
  prompt: string,
  apiKey: string,
  options: OpenAIChatOptions = {},
  toolExecutor?: (toolName: string, toolInput: any) => Promise<any>
): Promise<T> {
  const {
    model = DEFAULT_MODEL_CONFIGS.openai.defaultModel,
    maxTokens = DEFAULT_MODEL_CONFIGS.openai.defaultMaxTokens,
    temperature = DEFAULT_MODEL_CONFIGS.openai.defaultTemperature,
    timeout = TIMEOUTS.api.default,
    tools = [],
  } = options;

  const messages: any[] = [
    {
      role: 'user',
      content: prompt,
    },
  ];

  let continueLoop = true;
  let finalResponse: any = null;

  while (continueLoop) {
    const body: any = {
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
    };

    if (tools.length > 0) {
      body.tools = tools;
      body.tool_choice = 'auto';
    }

    const response = await fetchWithTimeout(API_ENDPOINTS.openai.chat, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      timeout,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data: OpenAIChatResponse = await response.json();
    const message = data.choices[0].message;

    // Check if OpenAI wants to use a tool
    if (message.tool_calls && message.tool_calls.length > 0 && toolExecutor) {
      // Add assistant's response to messages
      messages.push(message);

      // Execute each tool call
      for (const toolCall of message.tool_calls) {
        const toolResult = await toolExecutor(
          toolCall.function.name,
          JSON.parse(toolCall.function.arguments)
        );

        // Add tool result to messages
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(toolResult),
        });
      }
    } else {
      // No tool use, we have the final response
      continueLoop = false;
      finalResponse = message.content;
    }
  }

  return extractJsonFromText(finalResponse);
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
