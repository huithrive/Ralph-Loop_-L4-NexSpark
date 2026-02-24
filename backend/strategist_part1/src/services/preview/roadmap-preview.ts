/**
 * Roadmap Preview Generation Module
 * Creates a 3-phase, 6-month roadmap tailored to the business
 */

import { AI_MODELS } from '../../config';
import { buildRoadmapPreviewPrompt } from '../ai/preview-prompts';
import { createLogger } from '../../utils/logger';
import type { TokenUsage } from '../ai/openai-client';

/**
 * Generate roadmap preview for report preview page
 * Creates a 3-phase, 6-month roadmap tailored to the business
 */
export async function generateRoadmapPreview(
  brandName: string,
  industry: string,
  stage: string,
  budget: string,
  challenges: string[],
  goals: string[],
  env: any
): Promise<{ roadmap: any; usage: TokenUsage }> {
  const log = createLogger({ context: '[Preview]' });
  const openaiApiKey = env.OPENAI_API_KEY;

  if (!openaiApiKey || !openaiApiKey.startsWith('sk-')) {
    throw new Error('Valid OPENAI_API_KEY is required for roadmap preview generation');
  }

  const prompt = buildRoadmapPreviewPrompt(brandName, industry, stage, budget, challenges, goals);

  log.info('📅 [Preview] Generating roadmap with OpenAI', { brandName, industry });

  try {
    const { callOpenAIJson } = await import('../ai/openai-client');
    const { data: roadmap, usage } = await callOpenAIJson(prompt, openaiApiKey, {
      model: AI_MODELS.openai.gpt4o,
      maxTokens: 1500,
      temperature: 0.7,
    });

    log.info('[Preview] Roadmap generated', { brandName, phaseCount: roadmap.phases?.length || 0, usage });
    return { roadmap, usage };
  } catch (error) {
    log.error('[Preview] Roadmap generation failed', error);
    throw error;
  }
}
