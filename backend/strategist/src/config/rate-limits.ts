/**
 * Rate limiting configurations
 */

export const RATE_LIMITS = {
  enabled: false, // Set to true to enable rate limiting
  maxAttempts: 100, // Increased for development - adjust lower for production
  windowMs: 900000, // 15 minutes
} as const;
