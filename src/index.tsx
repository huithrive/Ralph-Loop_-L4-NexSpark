/**
 * Main application entry point
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/cloudflare-workers';
import { renderToString } from 'react-dom/server';
import { REVISED_LANDING_HTML } from './revised-landing';
import {
  authRoutes,
  interviewRoutes,
  paymentRoutes,
  reportRoutes,
  analysisRoutes,
  conversationalRoutes,
  agentRoutes,
  growthAuditRoutes,
} from './routes';
import { RATE_LIMITS } from './config';

const app = new Hono();

// ============================================================================
// Middleware
// ============================================================================

// Enable CORS for API routes
app.use('/api/*', cors());

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }));

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

// Payment routes
app.route('/api/payment', paymentRoutes);

// Report routes
app.route('/api/report', reportRoutes);

// Analysis routes
app.route('/api/analysis', analysisRoutes);

// Conversational interview routes
app.route('/api/conversational-interview', conversationalRoutes);

// Agent routes
app.route('/api/agent', agentRoutes);

// Growth audit routes
app.route('/api/growth-audit', growthAuditRoutes);

// ============================================================================
// Page Routes
// ============================================================================

// Landing page
app.get('/', (c) => {
  return c.html(REVISED_LANDING_HTML);
});

// Dashboard
app.get('/dashboard', serveStatic({ path: './public/static/dashboard.html' }));

// Interview pages
app.get('/interview-v3', serveStatic({ path: './public/static/interview-v3.html' }));
app.get('/interview-confirmation', serveStatic({ path: './public/static/interview-confirmation.html' }));

// Report pages
app.get('/generate-report', serveStatic({ path: './public/static/generate-report.html' }));
app.get('/report/:reportId', serveStatic({ path: './public/static/report-viewer.html' }));

// Strategy analysis
app.get('/strategy-analysis', serveStatic({ path: './public/static/strategy-analysis.html' }));

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
