/**
 * Cost Calculator for AI API Usage
 * Pricing as of January 2026 (update when prices change)
 */

export interface ModelPricing {
  inputCostPer1M: number;
  outputCostPer1M: number;
}

const ANTHROPIC_PRICING: Record<string, ModelPricing> = {
  'claude-opus-4-5-20251101': {
    inputCostPer1M: 3.00,
    outputCostPer1M: 15.00,
  },
  'claude-opus-4-20250514': {
    inputCostPer1M: 15.00,
    outputCostPer1M: 75.00,
  },
  'claude-sonnet-4-5-20250929': {
    inputCostPer1M: 3.00,
    outputCostPer1M: 15.00,
  },
  'claude-3-5-haiku-20241022': {
    inputCostPer1M: 1.00,
    outputCostPer1M: 5.00,
  },
};

const OPENAI_PRICING: Record<string, ModelPricing> = {
  'gpt-4o': {
    inputCostPer1M: 2.50,
    outputCostPer1M: 10.00,
  },
  'gpt-4o-mini': {
    inputCostPer1M: 0.15,
    outputCostPer1M: 0.60,
  },
};

const ALL_PRICING = {
  ...ANTHROPIC_PRICING,
  ...OPENAI_PRICING,
};

export function calculateCost(
  inputTokens: number,
  outputTokens: number,
  modelId: string
): number {
  let pricing = ALL_PRICING[modelId];

  if (!pricing) {
    console.warn(`Unknown model pricing: ${modelId}, using Opus 4.5 rates`);
    pricing = ANTHROPIC_PRICING['claude-opus-4-5-20251101'];
  }

  const inputCost = (inputTokens / 1_000_000) * pricing.inputCostPer1M;
  const outputCost = (outputTokens / 1_000_000) * pricing.outputCostPer1M;

  return Math.round((inputCost + outputCost) * 100);
}

export function calculateStepCost(
  inputTokens: number,
  outputTokens: number,
  modelId: string
): {
  inputCostCents: number;
  outputCostCents: number;
  totalCostCents: number;
} {
  let pricing = ALL_PRICING[modelId];

  if (!pricing) {
    console.warn(`Unknown model pricing: ${modelId}, using Opus 4.5 rates`);
    pricing = ANTHROPIC_PRICING['claude-opus-4-5-20251101'];
  }

  const inputCost = (inputTokens / 1_000_000) * pricing.inputCostPer1M;
  const outputCost = (outputTokens / 1_000_000) * pricing.outputCostPer1M;

  return {
    inputCostCents: Math.round(inputCost * 100),
    outputCostCents: Math.round(outputCost * 100),
    totalCostCents: Math.round((inputCost + outputCost) * 100),
  };
}
