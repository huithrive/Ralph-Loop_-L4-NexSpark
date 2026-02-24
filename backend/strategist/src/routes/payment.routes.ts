/**
 * Payment routes (Stripe integration)
 */

import { Hono } from 'hono';
import { createPaymentIntent } from '../services/stripe-payment';
import { markInterviewPaidWithStatus } from '../services/database';
import { successResponse, errorResponse } from '../utils/api-response';
import { PRICING } from '../config';
import { createRequestLogger } from '../utils/logger';
import { requireAuth, extractUserId } from '../middleware/auth.middleware';
import type { AuthContext } from '../middleware/types';

export const paymentRoutes = new Hono<AuthContext>();

paymentRoutes.use('/*', requireAuth());

// Create payment intent
paymentRoutes.post('/create-intent', async (c) => {
  const log = createRequestLogger(c);
  try {
    const { userEmail, amount = PRICING.report.amount } = await c.req.json();
    const userId = extractUserId(c);

    if (!userEmail) {
      return c.json(errorResponse('userEmail is required'), 400);
    }

    const clientSecret = await createPaymentIntent(
      amount,
      PRICING.report.currency,
      userId,
      userEmail,
      c.env.STRIPE_SECRET_KEY
    );

    log.info('Payment intent created', { userId, amount });
    return c.json({
      success: true,
      clientSecret,
    });
  } catch (error: any) {
    log.error('Create payment intent error', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Verify payment
paymentRoutes.post('/verify', async (c) => {
  const log = createRequestLogger(c);
  try {
    const { paymentIntentId } = await c.req.json();

    if (!paymentIntentId) {
      return c.json(errorResponse('paymentIntentId is required'), 400);
    }

    const { verifyPayment } = await import('../services/stripe-payment');
    const result = await verifyPayment(paymentIntentId, c.env.STRIPE_SECRET_KEY);

    log.info('Payment verified', { paymentIntentId, status: result.status });
    return c.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    log.error('Verify payment error', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Record payment (for pay-before-interview flow)
paymentRoutes.post('/record', async (c) => {
  const log = createRequestLogger(c);
  try {
    const { paymentIntentId, amount, interviewId } = await c.req.json();
    const userId = extractUserId(c);

    if (!paymentIntentId) {
      return c.json(errorResponse('paymentIntentId is required'), 400);
    }

    const { recordPayment } = await import('../services/stripe-payment');
    await recordPayment(
      c.env.DB,
      userId,
      interviewId || 'pre_interview',  // Use placeholder if no interview yet
      paymentIntentId,
      amount || 2000
    );

    log.info('Payment recorded', { userId, paymentIntentId, amount, interviewId });
    return c.json({
      success: true,
      message: 'Payment recorded'
    });
  } catch (error: any) {
    log.error('Record payment error', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Mark interview as paid (preview flow)
paymentRoutes.post('/mark-interview-paid', async (c) => {
  const log = createRequestLogger(c);
  try {
    const { interviewId, paymentId } = await c.req.json();

    if (!interviewId || !paymentId) {
      return c.json(errorResponse('interviewId and paymentId are required'), 400);
    }

    if (!c.env.DB) {
      return c.json(errorResponse('Database not configured'), 500);
    }

    await markInterviewPaidWithStatus(c.env.DB, interviewId, paymentId);

    log.info('Interview marked as paid', { interviewId, paymentId });
    return c.json({
      success: true,
      message: 'Interview marked as paid'
    });
  } catch (error: any) {
    log.error('Mark interview paid error', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Get payment status
paymentRoutes.get('/status', async (c) => {
  const log = createRequestLogger(c);
  try {
    const userId = extractUserId(c);
    const interviewId = c.req.query('interviewId');

    // If interviewId provided, check specific interview payment
    // Otherwise, check if user has any successful payment (pay-before-interview flow)
    if (interviewId) {
      const { hasUserPaid } = await import('../services/stripe-payment');
      const hasPaid = await hasUserPaid(c.env.DB, userId, interviewId);
      log.info('Payment status checked', { userId, interviewId, paid: hasPaid });
      return c.json({
        success: true,
        paid: hasPaid
      });
    } else {
      const { hasUserPaidAny } = await import('../services/stripe-payment');
      const result = await hasUserPaidAny(c.env.DB, userId);
      log.info('Payment status checked (any)', { userId, paid: result.paid });
      return c.json({
        success: true,
        paid: result.paid,
        paymentId: result.paymentId
      });
    }
  } catch (error: any) {
    log.error('Payment status error', error);
    return c.json(errorResponse(error.message), 500);
  }
});
