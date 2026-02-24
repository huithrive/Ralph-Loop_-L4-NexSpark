/**
 * Main application entry point
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/cloudflare-workers';
import { renderToString } from 'react-dom/server';
import { REVISED_LANDING_HTML } from './pages/landing-page';
import { authRoutes } from './routes/auth.routes';
import { adminRoutes } from './routes/admin.routes';
import { interviewRoutes } from './routes/interview.routes';
import { paymentRoutes } from './routes/payment.routes';
import { reportRoutes } from './routes/report.routes';
import { conversationalRoutes } from './routes/conversational.routes';
import { agentRoutes } from './routes/agent.routes';
import { previewRoutes } from './routes/preview.routes';
import { gtmAgentRoutes } from './routes/gtm-agent.routes';
import { RATE_LIMITS } from './config';
import { initializeLogger, createLogger } from './utils/logger';
import type { Env } from './types/env';

const app = new Hono<{ Bindings: Env }>();

// Initialize logger - will be updated per-request with actual env
const log = createLogger({ context: '[App]' });

// ============================================================================
// Middleware
// ============================================================================

// Enable CORS for API routes
app.use('/api/*', cors());

// Initialize logger with environment config
app.use('*', async (c, next) => {
  const logLevel = c.env.LOG_LEVEL || 'INFO';
  initializeLogger(logLevel);
  await next();
});

// Serve static files from assets binding
app.get('/static/*', async (c) => {
  const path = c.req.path.replace('/static/', '');
  try {
    const asset = await c.env.ASSETS.fetch(new Request(`https://placeholder/${path}`));
    return asset;
  } catch (error) {
    const log = createLogger({ context: '[Static]' });
    log.error('Asset fetch error', error);
    return c.notFound();
  }
});

// Rate limiting middleware (configurable via RATE_LIMITS.enabled)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

app.use('/api/*', async (c, next) => {
  // Skip rate limiting if disabled in config
  if (!RATE_LIMITS.enabled) {
    await next();
    return;
  }

  const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown';
  const now = Date.now();

  // Clean up old entries periodically
  if (Math.random() < 0.01) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }

  const rateLimit = rateLimitMap.get(ip);

  if (rateLimit) {
    if (now > rateLimit.resetTime) {
      // Reset the rate limit
      rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMITS.windowMs });
    } else if (rateLimit.count >= RATE_LIMITS.maxAttempts) {
      // Rate limit exceeded
      return c.json({
        success: false,
        error: 'Too many requests. Please try again later.'
      }, 429);
    } else {
      // Increment count
      rateLimit.count++;
    }
  } else {
    // First request
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMITS.windowMs });
  }

  await next();
});

// ============================================================================
// Route Registration
// ============================================================================

// Auth routes
app.route('/auth', authRoutes);
app.route('/api/auth', authRoutes);

// Admin routes (API key protected)
app.route('/api/admin', adminRoutes);

// Interview routes
app.route('/api/interview', interviewRoutes);

// Transcribe route
app.post('/api/transcribe', async (c) => {
  try {
    const formData = await c.req.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return c.json({ success: false, error: 'No audio file provided' }, 400);
    }

    const env: any = c.env;
    const { transcribeAudio } = await import('./services/ai/openai-client');
    const audioBlob = new Blob([await audioFile.arrayBuffer()], { type: audioFile.type });
    const transcript = await transcribeAudio(audioBlob, env.OPENAI_API_KEY);

    return c.json({
      success: true,
      transcript,
    });
  } catch (error: any) {
    const log = createLogger({ context: '[Transcribe]' });
    log.error('Transcribe error', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Payment routes
app.route('/api/payment', paymentRoutes);

// Report routes
app.route('/api/report', reportRoutes);

// Conversational interview routes
app.route('/api/conversational-interview', conversationalRoutes);

// Agent routes
app.route('/api/agent', agentRoutes);

// Preview routes
app.route('/api/preview', previewRoutes);

// GTM Agent routes
app.route('/api/gtm-agent', gtmAgentRoutes);

// Brand registration route
app.post('/api/register/brand', async (c) => {
  try {
    const data = await c.req.json();
    const log = createLogger({ context: '[Brand]' });
    log.info('Brand Registration', data);

    return c.json({
      success: true,
      message: 'Thank you for registering! Our team will contact you within 24 hours.',
      data: data
    });
  } catch (error) {
    return c.json({ success: false, message: 'Registration failed. Please try again.' }, 400);
  }
});

// ============================================================================
// Page Routes
// ============================================================================

// Landing page
app.get('/', (c) => {
  return c.html(REVISED_LANDING_HTML);
});


// ============================================================================
// Fallback / 404
// ============================================================================

app.notFound((c) => {
  return c.html('<h1>404 - Page Not Found</h1>', 404);
});

// ============================================================================
// Error Handler
// ============================================================================

app.onError((err, c) => {
  const log = createLogger({ context: '[App]' });
  log.error('Application error', err);
  return c.json({
    success: false,
    error: 'Internal server error',
    message: err.message,
  }, 500);
});

// ============================================================================
// Queue Consumers
// ============================================================================

import { handleReportGeneration, ReportGenerationMessage } from './queues/report-generation.queue';

// Export Durable Object class as named export (required by Cloudflare Workers)
export { ReportCoordinator } from './durable-objects/report-coordinator';

// Export HTTP handler (fetch) and Queue consumer (queue)
export default {
  fetch: app.fetch,
  async queue(
    batch: MessageBatch<ReportGenerationMessage>,
    env: any
  ): Promise<void> {
    await handleReportGeneration(batch, env);
  },
};
