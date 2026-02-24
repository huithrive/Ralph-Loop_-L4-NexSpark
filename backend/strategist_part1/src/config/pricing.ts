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
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_51SSbFe21JIRAZauk4bh3SqTBDCG7G40fCbSBDtHX9AdoqJTpFiN6HjvVIekKle3tCAkOmaZUJUkRAUTCp606efIc006AcceWac',
} as const;
