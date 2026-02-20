/**
 * Pricing and payment configurations
 */

export const PRICING = {
  report: {
    amount: 499, // $4.99 in cents - first D2C strategist report
    currency: 'usd',
    description: 'NexSpark D2C Growth Strategy Report',
  },
} as const;

export const STRIPE_CONFIG = {
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
} as const;
