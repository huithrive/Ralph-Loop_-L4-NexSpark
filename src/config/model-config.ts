/**
 * AI model configurations
 */

export const AI_MODELS = {
  claude: {
    opus4: 'claude-opus-4-20250514',
    opus45: 'claude-opus-4-5-20251101',
    sonnet35: 'claude-3-5-sonnet-20241022',
    haiku: 'claude-3-5-haiku-20241022',
  },
  openai: {
    gpt4: 'gpt-4',
    gpt4o: 'gpt-4o',
    gpt4oMini: 'gpt-4o-mini',
    whisper: 'whisper-1',
    tts: 'tts-1',
  },
} as const;

export const DEFAULT_MODEL_CONFIGS = {
  claude: {
    defaultModel: AI_MODELS.claude.opus45,
    defaultMaxTokens: 16384,
    defaultTemperature: 1,
  },
  openai: {
    defaultModel: AI_MODELS.openai.gpt4oMini,
    defaultMaxTokens: 4096,
    defaultTemperature: 0.7,
  },
} as const;
