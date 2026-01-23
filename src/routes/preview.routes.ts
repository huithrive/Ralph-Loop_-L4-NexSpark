/**
 * Preview routes - Generate preview data for reports
 */

import { Hono } from 'hono';
import { generateCompetitorPreview } from '../services/report-generation';
import { successResponse, errorResponse } from '../utils/api-response';

export const previewRoutes = new Hono();

// Generate competitor preview
previewRoutes.post('/competitors', async (c) => {
  try {
    const { website, industry, competitors } = await c.req.json();

    let competitorList = competitors;
    if (!competitors || competitors.length === 0) {
      console.log('⚠️ No competitors provided, generating sample competitors');
      competitorList = [
        { name: 'Industry Leader A', website: 'competitor1.com' },
        { name: 'Industry Leader B', website: 'competitor2.com' },
        { name: 'Industry Leader C', website: 'competitor3.com' }
      ];
    }

    const preview = await generateCompetitorPreview(
      website,
      competitorList,
      c.env.ANTHROPIC_API_KEY
    );

    return c.json({
      success: true,
      preview
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

    // Simple roadmap preview
    const roadmap = {
      weeks: [
        { week: 1, focus: 'Setup & Launch', tasks: ['Configure campaigns', 'Set up tracking'] },
        { week: 2, focus: 'Initial Testing', tasks: ['A/B test creatives', 'Monitor CAC'] },
        { week: 3, focus: 'Optimization', tasks: ['Scale winners', 'Cut losers'] },
        { week: 4, focus: 'Scaling', tasks: ['Increase budget', 'Expand targeting'] }
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
    const { industry, revenue } = await c.req.json();

    // Simple benchmark data
    const benchmarks = {
      averageCAC: '$25-45',
      averageLTV: '$150-300',
      industryROAS: '3-5x',
      conversionRate: '2-4%'
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
