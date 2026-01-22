/**
 * Pricing and payment configurations
 */

export const PRICING = {
  report: {
    amount: 2000, // $20.00 in cents
    currency: 'usd',
    description: 'NexSpark Growth Strategy Report',
  },
} as const;

export const STRIPE_CONFIG = {
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'REDACTED_STRIPE_PUBLISHABLE',
} as const;
