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

export interface CustomTool {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface ServerTool {
  type: string; // e.g. "web_search_20250305"
  name: string;
  max_uses?: number;
}

export type ClaudeTool = CustomTool | ServerTool;

export interface ClaudeOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  timeout?: number;
  tools?: ClaudeTool[];
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

export interface TokenUsage {
  input_tokens: number;
  output_tokens: number;
  model: string;
}

/**
 * Call Claude API with a single prompt
 */
export async function callClaude(
  prompt: string,
  apiKey: string,
  options: ClaudeOptions = {}
): Promise<{ content: string; usage: TokenUsage }> {
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
  return {
    content: data.content[0].text,
    usage: {
      input_tokens: data.usage.input_tokens,
      output_tokens: data.usage.output_tokens,
      model: data.model,
    },
  };
}

/**
 * Call Claude API with conversation history
 */
export async function callClaudeWithHistory(
  messages: ClaudeMessage[],
  apiKey: string,
  options: ClaudeOptions = {}
): Promise<{ content: string; usage: TokenUsage }> {
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
  return {
    content: data.content[0].text,
    usage: {
      input_tokens: data.usage.input_tokens,
      output_tokens: data.usage.output_tokens,
      model: data.model,
    },
  };
}

/**
 * Call Claude API and extract JSON response
 */
export async function callClaudeJson<T = any>(
  prompt: string,
  apiKey: string,
  options: ClaudeOptions = {}
): Promise<{ data: T; usage: TokenUsage }> {
  const { content, usage } = await callClaude(prompt, apiKey, options);
  const data = extractJsonFromText(content);
  return { data, usage };
}

/**
 * Call Claude API with streaming and return full text (avoids 524 timeout)
 */
export async function callClaudeStreaming(
  prompt: string,
  apiKey: string,
  options: ClaudeOptions = {}
): Promise<{ content: string; usage: TokenUsage }> {
  let fullText = '';
  let usage: TokenUsage = {
    input_tokens: 0,
    output_tokens: 0,
    model: options.model || DEFAULT_MODEL_CONFIGS.claude.defaultModel,
  };

  const generator = callClaudeStream(prompt, apiKey, options);
  for await (const chunk of generator) {
    fullText += chunk;
  }

  const result = await generator.next();
  if (result.value) {
    usage = result.value;
  }

  return { content: fullText, usage };
}

/**
 * Call Claude API with streaming and extract JSON (avoids 524 timeout)
 */
export async function callClaudeJsonStreaming<T = any>(
  prompt: string,
  apiKey: string,
  options: ClaudeOptions = {}
): Promise<{ data: T; usage: TokenUsage }> {
  const { content, usage } = await callClaudeStreaming(prompt, apiKey, options);
  const data = extractJsonFromText(content);
  return { data, usage };
}

export interface ProgressCallbacks {
  onToolCall?: (toolName: string, input: unknown) => Promise<void>;
  onToolResult?: (toolName: string, result: unknown) => Promise<void>;
  onWebSearch?: (resultCount: number) => Promise<void>;
}

export interface ToolCallResult<T = any> {
  data: T;
  webSearchCount: number;
  usage: TokenUsage;
}

/**
 * Call Claude API with tools support using streaming (avoids 524 timeout)
 * Supports both custom tools (executed via toolExecutor) and server-side tools (like web_search)
 */
export async function callClaudeJsonWithTools<T = any>(
  prompt: string,
  apiKey: string,
  options: ClaudeOptions & ProgressCallbacks = {},
  toolExecutor?: (toolName: string, toolInput: any) => Promise<any>
): Promise<ToolCallResult<T>> {
  const {
    model = DEFAULT_MODEL_CONFIGS.claude.defaultModel,
    maxTokens = DEFAULT_MODEL_CONFIGS.claude.defaultMaxTokens,
    temperature = DEFAULT_MODEL_CONFIGS.claude.defaultTemperature,
    systemPrompt,
    tools = [],
  } = options;

  const messages: any[] = [{ role: 'user', content: prompt }];

  let continueLoop = true;
  let finalResponse: any = null;
  let iterationCount = 0;
  let webSearchCount = 0;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  const maxIterations = 20;

  while (continueLoop && iterationCount < maxIterations) {
    iterationCount++;

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

    if (tools.length > 0) {
      body.tools = tools;
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

    // Parse streaming response into complete message
    const data = await parseToolStreamResponse(response);

    // Track token usage - input tokens only reported on first message_start
    if (data.usage.input_tokens > 0) {
      totalInputTokens += data.usage.input_tokens;
    }
    totalOutputTokens += data.usage.output_tokens;

    // Count web searches from server tool results
    const webSearchResults = data.content.filter(
      (block: any) => block.type === 'web_search_tool_result'
    );
    webSearchCount += webSearchResults.length;

    if (webSearchResults.length > 0 && options.onWebSearch) {
      await options.onWebSearch(webSearchResults.length);
    }

    // Check for custom tool use blocks
    const customToolUseBlocks = data.content.filter(
      (block: any) => block.type === 'tool_use'
    );

    const needsToolExecution = customToolUseBlocks.length > 0 && toolExecutor;

    if (needsToolExecution) {
      console.log(`[Claude Tool Use] ${customToolUseBlocks.length} custom tool(s) called`);

      messages.push({ role: 'assistant', content: data.content });

      const toolResults = [];
      for (const toolUseBlock of customToolUseBlocks) {
        console.log(`[Claude Tool Use] ${toolUseBlock.name}`, toolUseBlock.input);

        if (options.onToolCall) {
          await options.onToolCall(toolUseBlock.name, toolUseBlock.input);
        }

        const toolResult = await toolExecutor(toolUseBlock.name, toolUseBlock.input);

        console.log(`[Claude Tool Result] ${toolUseBlock.name}`, toolResult);

        if (options.onToolResult) {
          await options.onToolResult(toolUseBlock.name, toolResult);
        }

        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolUseBlock.id,
          content: JSON.stringify(toolResult),
        });
      }

      messages.push({ role: 'user', content: toolResults });
    } else if (data.stop_reason === 'end_turn' || !needsToolExecution) {
      continueLoop = false;
      const textBlock = data.content.find((block: any) => block.type === 'text');
      finalResponse = textBlock ? textBlock.text : '';
    }
  }

  if (iterationCount >= maxIterations) {
    throw new Error('Claude tool use exceeded maximum iterations');
  }

  return {
    data: extractJsonFromText(finalResponse),
    webSearchCount,
    usage: { input_tokens: totalInputTokens, output_tokens: totalOutputTokens, model },
  };
}

/**
 * Parse streaming response into a complete message object
 */
async function parseToolStreamResponse(response: Response): Promise<{
  content: any[];
  stop_reason: string;
  usage: { input_tokens: number; output_tokens: number };
}> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();
  let buffer = '';
  const contentBlocks: Map<number, any> = new Map();
  let stopReason = 'end_turn';
  let inputTokens = 0;
  let outputTokens = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6);
      if (data === '[DONE]') continue;

      try {
        const event = JSON.parse(data);

        switch (event.type) {
          case 'message_start':
            inputTokens = event.message?.usage?.input_tokens || 0;
            break;

          case 'content_block_start': {
            const idx = event.index;
            const block = event.content_block || {};
            // Construct each block type with only valid API fields
            if (block.type === 'text') {
              contentBlocks.set(idx, { type: 'text', text: block.text || '' });
            } else if (block.type === 'tool_use') {
              contentBlocks.set(idx, {
                type: 'tool_use',
                id: block.id,
                name: block.name,
                input: {},
                _inputJson: '',
              });
            } else if (block.type === 'server_tool_use') {
              contentBlocks.set(idx, {
                type: 'server_tool_use',
                id: block.id,
                name: block.name,
                input: block.input || {},
              });
            } else if (block.type === 'web_search_tool_result') {
              contentBlocks.set(idx, {
                type: 'web_search_tool_result',
                tool_use_id: block.tool_use_id,
                content: block.content || [],
              });
            }
            break;
          }

          case 'content_block_delta': {
            const idx = event.index;
            const block = contentBlocks.get(idx);
            if (!block) break;

            if (event.delta?.type === 'text_delta') {
              block.text = (block.text || '') + (event.delta.text || '');
            } else if (event.delta?.type === 'input_json_delta' && block.type === 'tool_use') {
              // Only accumulate input JSON for custom tool_use blocks, not server tools
              block._inputJson = (block._inputJson || '') + (event.delta.partial_json || '');
            }
            break;
          }

          case 'content_block_stop': {
            const idx = event.index;
            const block = contentBlocks.get(idx);
            if (block?.type === 'tool_use') {
              if (block._inputJson) {
                try {
                  block.input = JSON.parse(block._inputJson);
                } catch {
                  console.warn(`Failed to parse tool input JSON for ${block.name}`);
                  block.input = {};
                }
                delete block._inputJson;
              }
              if (!block.id) {
                throw new Error(`Malformed tool_use block: missing id for ${block.name}`);
              }
            }
            break;
          }

          case 'message_delta':
            stopReason = event.delta?.stop_reason || stopReason;
            outputTokens = event.usage?.output_tokens || outputTokens;
            break;
        }
      } catch {
        // Skip invalid JSON lines
      }
    }
  }

  // Process any remaining content in buffer (handles missing newline at end of stream)
  if (buffer.trim() && buffer.startsWith('data: ')) {
    const data = buffer.slice(6);
    if (data !== '[DONE]') {
      try {
        const event = JSON.parse(data);
        if (event.type === 'message_delta') {
          stopReason = event.delta?.stop_reason || stopReason;
          outputTokens = event.usage?.output_tokens || outputTokens;
        }
      } catch {
        // Skip invalid JSON
      }
    }
  }

  // Convert map to sorted array
  const content = Array.from(contentBlocks.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([, block]) => block);

  return { content, stop_reason: stopReason, usage: { input_tokens: inputTokens, output_tokens: outputTokens } };
}

/**
 * Call Claude API with streaming support
 */
export async function* callClaudeStream(
  prompt: string,
  apiKey: string,
  options: ClaudeOptions = {}
): AsyncGenerator<string, TokenUsage, unknown> {
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
  let usage: TokenUsage = {
    input_tokens: 0,
    output_tokens: 0,
    model: model,
  };

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
          } else if (parsed.type === 'message_delta' && parsed.usage) {
            usage.output_tokens = parsed.usage.output_tokens || 0;
          } else if (parsed.type === 'message_start' && parsed.message?.usage) {
            usage.input_tokens = parsed.message.usage.input_tokens || 0;
            usage.model = parsed.message.model || model;
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }
  }

  return usage;
}
