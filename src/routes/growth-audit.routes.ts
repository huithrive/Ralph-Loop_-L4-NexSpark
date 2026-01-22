/**
 * Growth audit routes
 */

import { Hono } from 'hono';
import {
  generateCompetitiveReport,
  fetchTrafficData,
} from '../services/growth-audit-agent';
import { successResponse, errorResponse } from '../utils/api-response';

export const growthAuditRoutes = new Hono();

// Run growth audit
growthAuditRoutes.post('/run', async (c) => {
  try {
    const { competitors, industryContext } = await c.req.json();

    if (!competitors || !Array.isArray(competitors)) {
      return c.json(errorResponse('competitors array is required'), 400);
    }

    const claudeApiKey = c.env.ANTHROPIC_API_KEY;
    const rapidApiKey = c.env.RAPIDAPI_KEY || '';

    // Fetch traffic data for each competitor
    const trafficData = await Promise.all(
      competitors.map((comp: any) =>
        fetchTrafficData(comp.website, rapidApiKey).catch(() => ({
          domain: comp.website,
          visits: 0,
          pageViews: 0,
          bounceRate: 0,
          avgDuration: 0,
          topCountries: [],
          trafficSources: { direct: 0, search: 0, social: 0, referral: 0 }
        }))
      )
    );

    const report = await generateCompetitiveReport(
      competitors,
      trafficData,
      claudeApiKey,
      industryContext || ''
    );

    return c.json({
      success: true,
      audit: report,
    });
  } catch (error: any) {
    console.error('Growth audit error:', error);
    return c.json(errorResponse(error.message), 500);
  }
});
