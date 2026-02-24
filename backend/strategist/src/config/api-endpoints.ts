/**
 * External API endpoint configurations
 */

export const API_ENDPOINTS = {
  anthropic: {
    base: 'https://api.anthropic.com/v1',
    messages: 'https://api.anthropic.com/v1/messages',
  },
  openai: {
    base: 'https://api.openai.com/v1',
    chat: 'https://api.openai.com/v1/chat/completions',
    audio: {
      transcriptions: 'https://api.openai.com/v1/audio/transcriptions',
      speech: 'https://api.openai.com/v1/audio/speech',
    },
  },
  google: {
    oauth: {
      token: 'https://oauth2.googleapis.com/token',
      userInfo: 'https://www.googleapis.com/oauth2/v2/userinfo',
    },
  },
  stripe: {
    base: 'https://api.stripe.com/v1',
  },
} as const;
