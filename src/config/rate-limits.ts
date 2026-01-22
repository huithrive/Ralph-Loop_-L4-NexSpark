/**
 * Rate limiting configurations
 */

export const RATE_LIMITS = {
  maxAttempts: 5,
  windowMs: 900000, // 15 minutes
} as const;
