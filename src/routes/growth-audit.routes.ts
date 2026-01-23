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

// Generate growth audit report
growthAuditRoutes.post('/generate', async (c) => {
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
      report,
    });
  } catch (error: any) {
    console.error('Growth audit generate error:', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Fetch traffic data for a domain
growthAuditRoutes.post('/traffic', async (c) => {
  try {
    const { domain } = await c.req.json();

    if (!domain) {
      return c.json(errorResponse('domain is required'), 400);
    }

    const rapidApiKey = c.env.RAPIDAPI_KEY || '';
    const trafficData = await fetchTrafficData(domain, rapidApiKey);

    return c.json({
      success: true,
      trafficData
    });
  } catch (error: any) {
    console.error('Traffic fetch error:', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Get growth audit status (simple status endpoint)
growthAuditRoutes.get('/status', (c) => {
  return c.json({
    success: true,
    status: 'ready',
    message: 'Growth audit service is operational'
  });
});
