/**
 * Benchmarks Preview Generation Module
 * Creates industry-specific performance benchmarks
 */

import { AI_MODELS } from '../../config';
import { buildBenchmarksPreviewPrompt } from '../ai/preview-prompts';
import { createLogger } from '../../utils/logger';
import type { TokenUsage } from '../ai/openai-client';

/**
 * Generate benchmarks preview for report preview page
 * Creates industry-specific performance benchmarks
 */
export async function generateBenchmarksPreview(
  brandName: string,
  industry: string,
  stage: string,
  budget: string,
  targetMarket: string,
  env: any
): Promise<{ benchmarks: any; usage: TokenUsage }> {
  const log = createLogger({ context: '[Preview]' });
  const openaiApiKey = env.OPENAI_API_KEY;

  if (!openaiApiKey || !openaiApiKey.startsWith('sk-')) {
    throw new Error('Valid OPENAI_API_KEY is required for benchmarks preview generation');
  }

  const prompt = buildBenchmarksPreviewPrompt(brandName, industry, stage, budget, targetMarket);

  log.info('📊 [Preview] Generating benchmarks with OpenAI', { brandName, industry });

  try {
    const { callOpenAIJson } = await import('../ai/openai-client');
    const { data: benchmarks, usage } = await callOpenAIJson(prompt, openaiApiKey, {
      model: AI_MODELS.openai.gpt4o,
      maxTokens: 800,
      temperature: 0.5,
    });

    log.info('[Preview] Benchmarks generated', { brandName, usage });
    return { benchmarks, usage };
  } catch (error) {
    log.error('[Preview] Benchmarks generation failed', error);
    throw error;
  }
}
