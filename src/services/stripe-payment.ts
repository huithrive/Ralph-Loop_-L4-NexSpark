/**
 * Stripe Payment Service
 * Handles payment processing for growth strategy reports
 */

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
    console.error('Error creating payment intent:', error);
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
    console.error('Error verifying payment:', error);
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
  try {
    await db.prepare(`
      INSERT INTO payments (
        id,
        user_id,
        interview_id,
        payment_intent_id,
        amount,
        currency,
        status,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      `payment_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
      userId,
      interviewId,
      paymentIntentId,
      amount,
      'usd',
      'succeeded',
      new Date().toISOString()
    ).run();

    console.log(`Payment recorded: ${paymentIntentId} for user ${userId}`);
  } catch (error) {
    console.error('Error recording payment:', error);
    throw error;
  }
}

/**
 * Check if user has paid for a specific interview report
 */
export async function hasUserPaid(
  db: D1Database,
  userId: string,
  interviewId: string
): Promise<boolean> {
  try {
    const result = await db.prepare(`
      SELECT COUNT(*) as count
      FROM payments
      WHERE user_id = ? AND interview_id = ? AND status = 'succeeded'
    `).bind(userId, interviewId).first<{ count: number }>();

    return (result?.count || 0) > 0;
  } catch (error) {
    console.error('Error checking payment status:', error);
    return false;
  }
}

/**
 * Check if user has any successful payment (for pay-before-interview flow)
 * Returns true if user has paid for any report
 */
export async function hasUserPaidAny(
  db: D1Database,
  userId: string
): Promise<{ paid: boolean; paymentId?: string }> {
  try {
    const result = await db.prepare(`
      SELECT payment_intent_id
      FROM payments
      WHERE user_id = ? AND status = 'succeeded'
      ORDER BY created_at DESC
      LIMIT 1
    `).bind(userId).first<{ payment_intent_id: string }>();

    if (result?.payment_intent_id) {
      return { paid: true, paymentId: result.payment_intent_id };
    }
    return { paid: false };
  } catch (error) {
    console.error('Error checking user payment status:', error);
    return { paid: false };
  }
}
