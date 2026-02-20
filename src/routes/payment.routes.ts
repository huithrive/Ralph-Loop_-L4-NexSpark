/**
 * Payment routes (Stripe integration)
 */

import { Hono } from 'hono';
import { createPaymentIntent } from '../services/stripe-payment';
import { successResponse, errorResponse } from '../utils/api-response';
import { PRICING } from '../config';

export const paymentRoutes = new Hono();

// Get Stripe publishable key (safe to expose - it's meant to be public)
paymentRoutes.get('/config', (c) => {
  const publishableKey = (c.env as any).STRIPE_PUBLISHABLE_KEY || '';
  return c.json({
    success: true,
    publishableKey,
  });
});

// Create payment intent
paymentRoutes.post('/create-intent', async (c) => {
  try {
    const { userId, userEmail, amount = PRICING.report.amount } = await c.req.json();

    if (!userId || !userEmail) {
      return c.json(errorResponse('userId and userEmail are required'), 400);
    }

    const clientSecret = await createPaymentIntent(
      amount,
      PRICING.report.currency,
      userId,
      userEmail,
      c.env.STRIPE_SECRET_KEY
    );

    return c.json({
      success: true,
      clientSecret,
    });
  } catch (error: any) {
    console.error('Create payment intent error:', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Verify payment
paymentRoutes.post('/verify', async (c) => {
  try {
    const { paymentIntentId } = await c.req.json();

    if (!paymentIntentId) {
      return c.json(errorResponse('paymentIntentId is required'), 400);
    }

    const { verifyPayment } = await import('../services/stripe-payment');
    const result = await verifyPayment(paymentIntentId, c.env.STRIPE_SECRET_KEY);

    return c.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    console.error('Verify payment error:', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Record payment (for pay-before-interview flow)
paymentRoutes.post('/record', async (c) => {
  try {
    const { userId, paymentIntentId, amount, interviewId } = await c.req.json();

    if (!userId || !paymentIntentId) {
      return c.json(errorResponse('userId and paymentIntentId are required'), 400);
    }

    const { recordPayment } = await import('../services/stripe-payment');
    await recordPayment(
      c.env.DB,
      userId,
      interviewId || 'pre_interview',  // Use placeholder if no interview yet
      paymentIntentId,
      amount || 2000
    );

    return c.json({
      success: true,
      message: 'Payment recorded'
    });
  } catch (error: any) {
    console.error('Record payment error:', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Get payment status
paymentRoutes.get('/status', async (c) => {
  try {
    const userId = c.req.query('userId');
    const interviewId = c.req.query('interviewId');

    if (!userId) {
      return c.json(errorResponse('userId is required'), 400);
    }

    // If interviewId provided, check specific interview payment
    // Otherwise, check if user has any successful payment (pay-before-interview flow)
    if (interviewId) {
      const { hasUserPaid } = await import('../services/stripe-payment');
      const hasPaid = await hasUserPaid(c.env.DB, userId, interviewId);
      return c.json({
        success: true,
        paid: hasPaid
      });
    } else {
      const { hasUserPaidAny } = await import('../services/stripe-payment');
      const result = await hasUserPaidAny(c.env.DB, userId);
      return c.json({
        success: true,
        paid: result.paid,
        paymentId: result.paymentId
      });
    }
  } catch (error: any) {
    console.error('Payment status error:', error);
    return c.json(errorResponse(error.message), 500);
  }
});
