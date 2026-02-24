/**
 * Stripe Payment Service
 * Handles payment processing for growth strategy reports
 */

import { createLogger } from '../utils/logger';
import {
  recordPayment as recordPaymentDb,
  hasPaymentForInterview,
  getLatestSuccessfulPayment
} from '../repositories/payment-repository';

export interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}

export interface PaymentVerification {
  paid: boolean;
  amount: number;
  customerEmail?: string;
  paymentIntentId: string;
}

/**
 * Create a Stripe payment intent for report purchase
 */
export async function createPaymentIntent(
  amount: number,
  currency: string,
  userId: string,
  userEmail: string,
  stripeSecretKey: string
): Promise<string> {
  const log = createLogger({ context: '[Payment]' });
  try {
    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        amount: amount.toString(),
        currency: currency,
        'metadata[userId]': userId,
        'metadata[product]': 'growth_strategy_report',
        'receipt_email': userEmail,
        'description': 'NexSpark Growth Strategy Report - Comprehensive 6-Month GTM Plan'
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Stripe API error: ${error.error?.message || response.statusText}`);
    }

    const paymentIntent = await response.json();

    return paymentIntent.client_secret;
  } catch (error) {
    log.error('Error creating payment intent', error);
    throw error;
  }
}

/**
 * Verify payment was completed successfully
 */
export async function verifyPayment(
  paymentIntentId: string,
  stripeSecretKey: string
): Promise<PaymentVerification> {
  const log = createLogger({ context: '[Payment]' });
  try {
    const response = await fetch(
      `https://api.stripe.com/v1/payment_intents/${paymentIntentId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${stripeSecretKey}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to verify payment: ${response.statusText}`);
    }

    const paymentIntent = await response.json();

    return {
      paid: paymentIntent.status === 'succeeded',
      amount: paymentIntent.amount,
      customerEmail: paymentIntent.receipt_email,
      paymentIntentId: paymentIntent.id
    };
  } catch (error) {
    log.error('Error verifying payment', error);
    throw error;
  }
}

/**
 * Record payment in database
 */
export async function recordPayment(
  db: D1Database,
  userId: string,
  interviewId: string,
  paymentIntentId: string,
  amount: number
): Promise<void> {
  await recordPaymentDb(db, {
    userId,
    interviewId,
    paymentIntentId,
    amount
  });
}

/**
 * Check if user has paid for a specific interview report
 */
export async function hasUserPaid(
  db: D1Database,
  userId: string,
  interviewId: string
): Promise<boolean> {
  return hasPaymentForInterview(db, userId, interviewId);
}

/**
 * Check if user has any successful payment (for pay-before-interview flow)
 * Returns true if user has paid for any report
 */
export async function hasUserPaidAny(
  db: D1Database,
  userId: string
): Promise<{ paid: boolean; paymentId?: string }> {
  const payment = await getLatestSuccessfulPayment(db, userId);

  if (payment?.payment_intent_id) {
    return { paid: true, paymentId: payment.payment_intent_id };
  }
  return { paid: false };
}
