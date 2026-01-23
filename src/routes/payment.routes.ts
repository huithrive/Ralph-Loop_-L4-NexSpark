/**
 * Payment routes (Stripe integration)
 */

import { Hono } from 'hono';
import { createPaymentIntent } from '../services/stripe-payment';
import { successResponse, errorResponse } from '../utils/api-response';
import { PRICING } from '../config';

export const paymentRoutes = new Hono();

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

// Get payment status
paymentRoutes.get('/status', async (c) => {
  try {
    const userId = c.req.query('userId');
    const reportId = c.req.query('reportId');

    if (!userId) {
      return c.json(errorResponse('userId is required'), 400);
    }

    const { hasUserPaid } = await import('../services/stripe-payment');
    const hasPaid = await hasUserPaid(c.env.DB, userId, reportId);

    return c.json({
      success: true,
      paid: hasPaid
    });
  } catch (error: any) {
    console.error('Payment status error:', error);
    return c.json(errorResponse(error.message), 500);
  }
});
