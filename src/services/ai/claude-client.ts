/**
 * Claude API client wrapper
 */

import { API_ENDPOINTS, AI_MODELS, DEFAULT_MODEL_CONFIGS, TIMEOUTS } from '../../config';
import { fetchWithTimeout } from '../../utils/fetch-with-timeout';
import { extractJsonFromText } from '../../utils/json-parser';

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  timeout?: number;
}

export interface ClaudeResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{ type: string; text: string }>;
  model: string;
  stop_reason: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

/**
 * Call Claude API with a single prompt
 */
export async function callClaude(
  prompt: string,
  apiKey: string,
  options: ClaudeOptions = {}
): Promise<string> {
  const {
    model = DEFAULT_MODEL_CONFIGS.claude.defaultModel,
    maxTokens = DEFAULT_MODEL_CONFIGS.claude.defaultMaxTokens,
    temperature = DEFAULT_MODEL_CONFIGS.claude.defaultTemperature,
    systemPrompt,
    timeout = TIMEOUTS.api.extended,
  } = options;

  const messages: ClaudeMessage[] = [
    {
      role: 'user',
      content: prompt,
    },
  ];

  const body: any = {
    model,
    max_tokens: maxTokens,
    temperature,
    messages,
  };

  if (systemPrompt) {
    body.system = systemPrompt;
  }

  const response = await fetchWithTimeout(API_ENDPOINTS.anthropic.messages, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
    timeout,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${error}`);
  }

  const data: ClaudeResponse = await response.json();
  return data.content[0].text;
}

/**
 * Call Claude API with conversation history
 */
export async function callClaudeWithHistory(
  messages: ClaudeMessage[],
  apiKey: string,
  options: ClaudeOptions = {}
): Promise<string> {
  const {
    model = DEFAULT_MODEL_CONFIGS.claude.defaultModel,
    maxTokens = DEFAULT_MODEL_CONFIGS.claude.defaultMaxTokens,
    temperature = DEFAULT_MODEL_CONFIGS.claude.defaultTemperature,
    systemPrompt,
    timeout = TIMEOUTS.api.extended,
  } = options;

  const body: any = {
    model,
    max_tokens: maxTokens,
    temperature,
    messages,
  };

  if (systemPrompt) {
    body.system = systemPrompt;
  }

  const response = await fetchWithTimeout(API_ENDPOINTS.anthropic.messages, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
    timeout,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${error}`);
  }

  const data: ClaudeResponse = await response.json();
  return data.content[0].text;
}

/**
 * Call Claude API and extract JSON response
 */
export async function callClaudeJson<T = any>(
  prompt: string,
  apiKey: string,
  options: ClaudeOptions = {}
): Promise<T> {
  const text = await callClaude(prompt, apiKey, options);
  return extractJsonFromText(text);
}

/**
 * Call Claude API with streaming support
 */
export async function* callClaudeStream(
  prompt: string,
  apiKey: string,
  options: ClaudeOptions = {}
): AsyncGenerator<string, void, unknown> {
  const {
    model = DEFAULT_MODEL_CONFIGS.claude.defaultModel,
    maxTokens = DEFAULT_MODEL_CONFIGS.claude.defaultMaxTokens,
    temperature = DEFAULT_MODEL_CONFIGS.claude.defaultTemperature,
    systemPrompt,
  } = options;

  const messages: ClaudeMessage[] = [
    {
      role: 'user',
      content: prompt,
    },
  ];

  const body: any = {
    model,
    max_tokens: maxTokens,
    temperature,
    messages,
    stream: true,
  };

  if (systemPrompt) {
    body.system = systemPrompt;
  }

  const response = await fetch(API_ENDPOINTS.anthropic.messages, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${error}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
            yield parsed.delta.text;
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }
  }
}
