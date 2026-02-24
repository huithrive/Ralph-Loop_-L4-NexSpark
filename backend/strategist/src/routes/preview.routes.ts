/**
 * Preview routes - Generate preview data for reports
 */

import { Hono } from 'hono';
import {
  generateCompetitorPreview,
  generateRoadmapPreview,
  generateBenchmarksPreview
} from '../services/report-generation';
import { successResponse, errorResponse } from '../utils/api-response';
import { createRequestLogger } from '../utils/logger';
import { requireAuth } from '../middleware/auth.middleware';
import type { AuthContext } from '../middleware/types';

export const previewRoutes = new Hono<AuthContext>();

previewRoutes.use('/*', requireAuth());

// Generate competitor preview using AI (researches competitors automatically)
previewRoutes.post('/competitors', async (c) => {
  const log = createRequestLogger(c);
  try {
    const { website, businessProfile, summary } = await c.req.json();

    const profile = businessProfile || summary || {};
    const targetWebsite = website || profile.website;

    if (!targetWebsite) {
      return c.json(errorResponse('website is required'), 400);
    }

    const brandName = profile.brandName || profile.companyName || 'Your Company';
    const industry = profile.industry || 'technology';

    log.info('🔍 [Preview] Starting AI competitor research', { brandName, industry });

    const { competitors, usage, competitorCount } = await generateCompetitorPreview(
      targetWebsite,
      industry,
      brandName,
      c.env
    );

    log.info('[Preview] Generated competitor preview', { brandName, count: competitorCount, usage });

    return c.json({
      success: true,
      competitors,
      usage,
      competitorCount
    });
  } catch (error: any) {
    log.error('Competitor preview error', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Generate roadmap preview using AI
previewRoutes.post('/roadmap', async (c) => {
  const log = createRequestLogger(c);
  try {
    const { businessProfile, summary } = await c.req.json();

    const profile = businessProfile || summary || {};

    if (!profile.brandName && !profile.companyName) {
      return c.json(errorResponse('Business information is required'), 400);
    }

    const brandName = profile.brandName || profile.companyName || 'Your Company';
    const industry = profile.industry || 'technology';
    const stage = profile.businessStage || profile.stage || 'early stage';
    const budget = profile.budget || profile.monthlyBudget || '$5,000-$10,000/month';
    const challenges = Array.isArray(profile.mainChallenges) ? profile.mainChallenges : [profile.biggestChallenge || 'Growing revenue'];
    const goals = Array.isArray(profile.businessGoals) ? profile.businessGoals : [profile.sixMonthGoal || 'Increase growth'];

    log.info('📅 [Preview] Generating roadmap', { brandName, industry, stage });

    const { roadmap, usage } = await generateRoadmapPreview(
      brandName,
      industry,
      stage,
      budget,
      challenges,
      goals,
      c.env
    );

    log.info('[Preview] Roadmap generated', { brandName, usage });
    return c.json({
      success: true,
      roadmap,
      usage
    });
  } catch (error: any) {
    log.error('Roadmap preview error', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Generate benchmarks preview using AI
previewRoutes.post('/benchmarks', async (c) => {
  const log = createRequestLogger(c);
  try {
    const { businessProfile, summary } = await c.req.json();

    const profile = businessProfile || summary || {};

    if (!profile.brandName && !profile.companyName) {
      return c.json(errorResponse('Business information is required'), 400);
    }

    const brandName = profile.brandName || profile.companyName || 'Your Company';
    const industry = profile.industry || 'technology';
    const stage = profile.businessStage || profile.stage || 'early stage';
    const budget = profile.budget || profile.monthlyBudget || '$5,000-$10,000/month';
    const targetMarket = profile.targetMarket || profile.idealCustomer || 'B2B SaaS customers';

    log.info('📊 [Preview] Generating benchmarks', { brandName, industry, stage });

    const { benchmarks, usage } = await generateBenchmarksPreview(
      brandName,
      industry,
      stage,
      budget,
      targetMarket,
      c.env
    );

    log.info('[Preview] Benchmarks generated', { brandName, usage });
    return c.json({
      success: true,
      benchmarks,
      usage
    });
  } catch (error: any) {
    log.error('Benchmarks preview error', error);
    return c.json(errorResponse(error.message), 500);
  }
});
