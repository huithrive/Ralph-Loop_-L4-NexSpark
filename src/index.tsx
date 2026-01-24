/**
 * Main application entry point
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/cloudflare-workers';
import { renderToString } from 'react-dom/server';
import { REVISED_LANDING_HTML } from './revised-landing';
import { authRoutes } from './routes/auth.routes';
import { interviewRoutes } from './routes/interview.routes';
import { paymentRoutes } from './routes/payment.routes';
import { reportRoutes } from './routes/report.routes';
import { analysisRoutes } from './routes/analysis.routes';
import { conversationalRoutes } from './routes/conversational.routes';
import { agentRoutes } from './routes/agent.routes';
import { growthAuditRoutes } from './routes/growth-audit.routes';
import { previewRoutes } from './routes/preview.routes';
import { RATE_LIMITS } from './config';

const app = new Hono();

// ============================================================================
// Middleware
// ============================================================================

// Enable CORS for API routes
app.use('/api/*', cors());

// Serve static files
app.use('/static/*', serveStatic());

// Rate limiting middleware
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

app.use('/api/*', async (c, next) => {
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
    console.error('Transcribe error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Payment routes
app.route('/api/payment', paymentRoutes);

// Report routes
app.route('/api/report', reportRoutes);

// Reports list route (uses same handler but different path)
app.get('/api/reports/list', async (c) => {
  try {
    const userId = c.req.query('userId');
    const limit = parseInt(c.req.query('limit') || '10');
    const offset = parseInt(c.req.query('offset') || '0');

    if (!userId) {
      return c.json({ success: false, error: 'userId is required' }, 400);
    }

    const env: any = c.env;
    if (!env.DB) {
      return c.json({ success: true, reports: [], total: 0, hasMore: false });
    }

    const safeLimit = Math.min(Math.max(limit, 1), 50);
    const safeOffset = Math.max(offset, 0);

    const { getUserReports } = await import('./services/database');
    const result = await getUserReports(env.DB, userId, safeLimit, safeOffset);

    return c.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Get reports list error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Analysis routes
app.route('/api/analysis', analysisRoutes);

// Conversational interview routes
app.route('/api/conversational-interview', conversationalRoutes);

// Agent routes
app.route('/api/agent', agentRoutes);

// Growth audit routes
app.route('/api/growth-audit', growthAuditRoutes);

// Preview routes
app.route('/api/preview', previewRoutes);

// Brand registration route
app.post('/api/register/brand', async (c) => {
  try {
    const data = await c.req.json();
    console.log('Brand Registration:', data);

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

// Dashboard - redirect to static file
app.get('/dashboard', (c) => {
  return c.redirect('/static/dashboard.html');
});

// Auth pages
app.get('/login', (c) => {
  const url = new URL(c.req.url);
  const queryString = url.search;
  return c.redirect('/static/login.html' + queryString);
});
app.get('/register', (c) => {
  const url = new URL(c.req.url);
  const queryString = url.search;
  return c.redirect('/static/register.html' + queryString);
});

// Interview pages (voice interview v2 is now the default)
app.get('/voice-interview', (c) => c.redirect('/static/voice-interview-v2.html'));
app.get('/interview', (c) => c.redirect('/static/voice-interview-v2.html'));
app.get('/interview-v3', (c) => c.redirect('/static/voice-interview-v2.html'));
app.get('/interview-confirmation', (c) => c.redirect('/static/interview-confirmation.html'));
app.get('/interview-summary', (c) => c.redirect('/static/interview-summary.html'));
app.get('/website-confirmation', (c) => c.redirect('/static/website-confirmation.html'));

// Report pages
app.get('/generate-report', (c) => c.redirect('/static/generate-report.html'));
app.get('/report/:reportId', (c) => c.redirect('/static/report-viewer.html?reportId=' + c.req.param('reportId')));
app.get('/report-preview', (c) => {
  const url = new URL(c.req.url);
  const queryString = url.search;
  return c.redirect('/static/report-preview.html' + queryString);
});
app.get('/full-report', (c) => c.redirect('/static/full-report.html'));

// Strategy and audit pages
app.get('/strategy-analysis', (c) => c.redirect('/static/strategy-analysis.html'));
app.get('/growth-audit', (c) => c.redirect('/static/growth-audit.html'));

// Payment page
app.get('/payment', (c) => c.redirect('/static/payment.html'));

// Interview intro page (post-payment transition)
app.get('/interview-intro', (c) => c.redirect('/static/interview-intro.html'));

// Conversational interview page
app.get('/conversational-interview', (c) => c.redirect('/static/conversational-interview.html'));

// Test pages
app.get('/agent-test', (c) => c.redirect('/static/agent-test.html'));
app.get('/mvagent-test', (c) => c.redirect('/static/mvagent-test.html'));

// Admin pages
app.get('/admin/prompts', (c) => c.redirect('/static/admin-prompts.html'));

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
  console.error('Application error:', err);
  return c.json({
    success: false,
    error: 'Internal server error',
    message: err.message,
  }, 500);
});

export default app;
