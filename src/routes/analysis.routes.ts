/**
 * Analysis routes (post-interview analysis v2)
 */

import { Hono } from 'hono';
import {
  analyzeInterview,
  verifyWebsiteAndResearch,
  generateGTMStrategy,
  generateStrategyReport,
} from '../services/post-interview-analysis-v2';
import { successResponse, errorResponse } from '../utils/api-response';

export const analysisRoutes = new Hono();

// Start analysis (same as analyze but different response format)
analysisRoutes.post('/start', async (c) => {
  try {
    const { interviewId, userId, responses } = await c.req.json();

    if (!interviewId || !userId) {
      return c.json(errorResponse('interviewId and userId are required'), 400);
    }

    const analysis = await analyzeInterview(interviewId, c.env.ANTHROPIC_API_KEY);

    return c.json({
      success: true,
      analysis,
      businessProfile: analysis
    });
  } catch (error: any) {
    console.error('Analysis start error:', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Analyze interview transcript
analysisRoutes.post('/analyze', async (c) => {
  try {
    const { interviewId, transcript } = await c.req.json();

    if (!interviewId) {
      return c.json(errorResponse('interviewId is required'), 400);
    }

    const analysis = await analyzeInterview(interviewId, c.env);

    return c.json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    console.error('Analysis error:', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Verify website and research competitors
analysisRoutes.post('/research', async (c) => {
  try {
    const { website, businessProfile } = await c.req.json();

    if (!website) {
      return c.json(errorResponse('website is required'), 400);
    }

    const research = await verifyWebsiteAndResearch(website, businessProfile, c.env.ANTHROPIC_API_KEY);

    return c.json({
      success: true,
      research,
    });
  } catch (error: any) {
    console.error('Research error:', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Generate GTM strategy
analysisRoutes.post('/gtm-strategy', async (c) => {
  try {
    const { businessProfile, competitorData } = await c.req.json();

    if (!businessProfile) {
      return c.json(errorResponse('businessProfile is required'), 400);
    }

    const strategy = await generateGTMStrategy(businessProfile, competitorData || [], '', c.env.ANTHROPIC_API_KEY);

    return c.json({
      success: true,
      strategy,
    });
  } catch (error: any) {
    console.error('GTM strategy error:', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Generate full strategy report
analysisRoutes.post('/generate-report', async (c) => {
  try {
    const { businessProfile, competitorData, gtmStrategy } = await c.req.json();

    if (!businessProfile || !gtmStrategy) {
      return c.json(errorResponse('businessProfile and gtmStrategy are required'), 400);
    }

    const reportHtml = generateStrategyReport(gtmStrategy);

    return c.json({
      success: true,
      reportHtml,
    });
  } catch (error: any) {
    console.error('Generate report error:', error);
    return c.json(errorResponse(error.message), 500);
  }
});
