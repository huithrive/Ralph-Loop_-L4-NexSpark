/**
 * Preview routes - Generate preview data for reports
 */

import { Hono } from 'hono';
import { generateCompetitorPreview } from '../services/report-generation';
import { successResponse, errorResponse } from '../utils/api-response';
import { verifySessionToken } from '../services/google-oauth';

export const previewRoutes = new Hono();

// Auth middleware - require authentication for all preview routes
previewRoutes.use('/*', async (c, next) => {
  const authHeader = c.req.header('Authorization');


  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json(errorResponse('Authentication required'), 401);
  }

  const sessionToken = authHeader.replace('Bearer ', '');
  const jwtSecret = c.env.JWT_SECRET || c.env.GOOGLE_CLIENT_SECRET || 'dev-secret';

  try {
    const payload = await verifySessionToken(sessionToken, jwtSecret);

    if (!payload) {
      return c.json(errorResponse('Invalid or expired session'), 401);
    }

    // Store userId in context for later use
    c.set('userId', payload.sub);

    await next();
  } catch (error: any) {
    console.error('[Preview Auth] Auth middleware error:', error.message);
    return c.json(errorResponse('Authentication failed'), 401);
  }
});

// Generate competitor preview
previewRoutes.post('/competitors', async (c) => {
  try {
    const { website, industry, competitors } = await c.req.json();

    let competitorList = competitors;
    if (!competitors || competitors.length === 0) {
      console.log('⚠️ No competitors provided, generating sample competitors');
      competitorList = ['competitor1.com', 'competitor2.com', 'competitor3.com'];
    }

    const preview = await generateCompetitorPreview(
      website,
      industry || 'technology',
      competitorList,
      c.env
    );

    return c.json({
      success: true,
      competitors: preview
    });
  } catch (error: any) {
    console.error('Competitor preview error:', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Generate roadmap preview
previewRoutes.post('/roadmap', async (c) => {
  try {
    const { businessProfile, competitorData } = await c.req.json();

    // Simple roadmap preview with correct structure
    const roadmap = {
      phases: [
        {
          months: '1-2',
          name: 'Foundation & Launch',
          objectives: ['Set up marketing infrastructure', 'Launch initial campaigns'],
          tasks: ['Configure ad accounts', 'Set up tracking', 'Create initial ad sets'],
          expectedResults: 'Baseline performance data and initial learnings'
        },
        {
          months: '3-4',
          name: 'Testing & Optimization',
          objectives: ['Test different audiences and creatives', 'Optimize for best performance'],
          tasks: ['A/B test creatives', 'Refine targeting', 'Optimize bidding strategies'],
          expectedResults: 'Improved CTR and lower CAC'
        },
        {
          months: '5-6',
          name: 'Scaling & Expansion',
          objectives: ['Scale winning campaigns', 'Expand to new channels'],
          tasks: ['Increase budget on winners', 'Expand targeting', 'Launch retargeting'],
          expectedResults: 'Increased volume while maintaining efficiency'
        }
      ]
    };

    return c.json({
      success: true,
      roadmap
    });
  } catch (error: any) {
    console.error('Roadmap preview error:', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Generate benchmarks preview
previewRoutes.post('/benchmarks', async (c) => {
  try {
    const { summary } = await c.req.json();

    // Benchmark data matching frontend expectations
    const benchmarks = {
      googleAds: {
        targetCPC: '$2.50-$4.00',
        expectedCTR: '3.5-5.2%',
        projectedCAC: '$35-$55',
        recommendedBudget: '$3,000-$5,000/month',
        expectedROI: '3-5x'
      },
      metaAds: {
        targetCPM: '$12-$18',
        expectedCTR: '1.8-2.5%',
        projectedCAC: '$28-$42',
        recommendedBudget: '$2,500-$4,000/month',
        expectedROI: '4-6x'
      }
    };

    return c.json({
      success: true,
      benchmarks
    });
  } catch (error: any) {
    console.error('Benchmarks preview error:', error);
    return c.json(errorResponse(error.message), 500);
  }
});
