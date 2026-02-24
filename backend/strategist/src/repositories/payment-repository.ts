/**
 * Payment repository - manages payment operations
 * Note: Errors propagate to route layer for centralized handling
 */

import { generateId } from './base-repository';
import { createLogger } from '../utils/logger';

const log = createLogger({ context: '[PaymentRepo]' });

export interface PaymentRecord {
  id: string;
  user_id: string;
  interview_id: string;
  payment_intent_id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}

/**
 * Record a payment in the database
 */
export async function recordPayment(
  db: D1Database,
  data: {
    userId: string;
    interviewId: string;
    paymentIntentId: string;
    amount: number;
    currency?: string;
    status?: string;
  }
): Promise<{ success: boolean; paymentId: string }> {
  const paymentId = generateId('payment_');

  await db.prepare(`
    INSERT INTO payments (
      id, user_id, interview_id, payment_intent_id,
      amount, currency, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    paymentId,
    data.userId,
    data.interviewId,
    data.paymentIntentId,
    data.amount,
    data.currency || 'usd',
    data.status || 'succeeded',
    new Date().toISOString()
  ).run();

  log.info('Payment recorded', {
    paymentId,
    userId: data.userId,
    amount: data.amount
  });

  return { success: true, paymentId };
}

/**
 * Check if user has paid for a specific interview
 */
export async function hasPaymentForInterview(
  db: D1Database,
  userId: string,
  interviewId: string
): Promise<boolean> {
  const result = await db.prepare(`
    SELECT COUNT(*) as count
    FROM payments
    WHERE user_id = ? AND interview_id = ? AND status = 'succeeded'
  `).bind(userId, interviewId).first<{ count: number }>();

  return (result?.count || 0) > 0;
}

/**
 * Get the latest successful payment for a user
 */
export async function getLatestSuccessfulPayment(
  db: D1Database,
  userId: string
): Promise<PaymentRecord | null> {
  const result = await db.prepare(`
    SELECT *
    FROM payments
    WHERE user_id = ? AND status = 'succeeded'
    ORDER BY created_at DESC
    LIMIT 1
  `).bind(userId).first<PaymentRecord>();

  return result || null;
}

/**
 * Get payment by payment intent ID
 */
export async function getPaymentByIntentId(
  db: D1Database,
  paymentIntentId: string
): Promise<PaymentRecord | null> {
  const result = await db.prepare(`
    SELECT *
    FROM payments
    WHERE payment_intent_id = ?
  `).bind(paymentIntentId).first<PaymentRecord>();

  return result || null;
}
