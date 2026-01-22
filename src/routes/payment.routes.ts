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

// Create checkout session - Placeholder for future Stripe Checkout integration
paymentRoutes.post('/create-checkout', async (c) => {
  try {
    // For now, we only support Payment Intents (embedded card form)
    // Stripe Checkout can be added later if needed
    return c.json(errorResponse('Checkout sessions not implemented yet. Use payment intents.'), 501);
  } catch (error: any) {
    console.error('Create checkout session error:', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Webhook for Stripe events (if needed)
paymentRoutes.post('/webhook', async (c) => {
  try {
    const sig = c.req.header('stripe-signature');
    const body = await c.req.text();

    // TODO: Verify webhook signature and process events
    console.log('Stripe webhook received');

    return c.json(successResponse());
  } catch (error: any) {
    console.error('Webhook error:', error);
    return c.json(errorResponse(error.message), 500);
  }
});
