/**
 * Timeout configurations (in milliseconds)
 */

export const TIMEOUTS = {
  // API request timeouts
  api: {
    default: 120000, // 2 minutes
    extended: 300000, // 5 minutes
    long: 600000, // 10 minutes
  },
  // Rate limiting
  rateLimit: {
    window: 900000, // 15 minutes
    cleanupInterval: 60000, // 1 minute
  },
  // Session expiration
  session: {
    duration: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
} as const;
