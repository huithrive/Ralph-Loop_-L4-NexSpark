/**
 * Enhanced Summary Generation Module
 * Generates enhanced summary with Claude 4.5 Sonnet
 */

import { callClaudeJson } from '../ai/claude-client';
import { AI_MODELS } from '../../config';
import { buildEnhancedSummaryPrompt } from '../ai/preview-prompts';
import type { InterviewData } from '../report-generation';
import { createLogger } from '../../utils/logger';

/**
 * Generate enhanced summary with Claude 4.5 Sonnet
 */
export async function generateEnhancedSummary(
  responses: Array<{ question: string; answer: string }>,
  env: any
): Promise<InterviewData> {
  const log = createLogger({ context: '[Preview]' });
  const claudeApiKey = env.ANTHROPIC_API_KEY;

  if (!claudeApiKey || !claudeApiKey.startsWith('sk-ant-')) {
    throw new Error('Claude API key is required for summary generation');
  }

  const transcript = responses.map((r, idx) =>
    `Q${idx + 1}: ${r.question}\nA${idx + 1}: ${r.answer}`
  ).join('\n\n');

  const prompt = buildEnhancedSummaryPrompt(transcript);

  log.info('📊 Generating enhanced summary with Claude 4.5 Sonnet', { responseCount: responses.length });

  // Use new Claude client wrapper
  const summary: InterviewData = await callClaudeJson<InterviewData>(prompt, claudeApiKey, {
    model: AI_MODELS.claude.opus4,
    maxTokens: 3000,
    temperature: 0.5,
  });

  log.info('Enhanced summary generated successfully', { brandName: summary.brandName });

  return summary;
}
