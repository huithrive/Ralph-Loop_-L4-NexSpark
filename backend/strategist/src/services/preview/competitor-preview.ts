/**
 * Competitor Preview Generation Module
 * Finds and analyzes TOP 5 competitors using Claude Opus 4.5 with SimilarWeb traffic tool
 */

import { AI_MODELS } from '../../config';
import { buildCompetitorPreviewPrompt } from '../ai/preview-prompts';
import type { CompetitorInsight } from '../report-generation';
import { createLogger } from '../../utils/logger';
import {
  fetchCompetitorTrafficData,
  verifyCompetitorWebsite,
  deduplicateCompetitors
} from '../../utils/competitor-utils';
import type { ClaudeTool, TokenUsage } from '../ai/claude-client';

/**
 * Generate competitor preview for report preview page
 * Finds and analyzes TOP 5 competitors using Claude Opus 4.5 with SimilarWeb tool
 * Returns only verified competitors (could be 1-5 depending on validation)
 */
export async function generateCompetitorPreview(
  website: string,
  industry: string,
  brandName: string,
  env: any
): Promise<{ competitors: CompetitorInsight[]; usage: TokenUsage; competitorCount: number }> {
  const log = createLogger({ context: '[Preview]' });
  const claudeApiKey = env.ANTHROPIC_API_KEY;

  if (!claudeApiKey) {
    throw new Error('ANTHROPIC_API_KEY is required for competitor preview generation');
  }

  log.info('📊 [Preview] Scraping website to understand business', { website, brandName });

  // Try to scrape website for context
  let websiteContext = '';
  try {
    const normalizedUrl = website.startsWith('http') ? website : `https://${website}`;
    const response = await fetch(normalizedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NexSpark/1.0; +https://nexspark.io)'
      }
    });

    if (response.ok) {
      const html = await response.text();
      // Extract basic text content
      const textContent = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 2000); // First 2000 chars for context

      websiteContext = `\n\nWebsite content context:\n${textContent}`;
      log.info('📊 [Preview] Website scraped successfully', { contentLength: textContent.length });
    }
  } catch (scrapeError) {
    log.warn('⚠️ [Preview] Could not scrape website, using URL-based analysis');
  }

  const prompt = buildCompetitorPreviewPrompt(website, industry, brandName, websiteContext);

  log.info('📊 [Preview] AI researching top 5 competitors using Claude Opus 4.5', { industry, brandName });

  try {
    const { callClaudeJson } = await import('../ai/claude-client');

    const { data: parsed, usage } = await callClaudeJson(prompt, claudeApiKey, {
      model: AI_MODELS.claude.opus45,
      maxTokens: 3000,
      temperature: 0.7,
    });

    const competitors = parsed.competitors || [];
    log.info('📋 [Preview] Claude suggested competitors', { count: competitors.length, usage });

    // Fetch traffic data for all competitors in parallel
    if (env.RAPIDAPI_KEY && competitors.length > 0) {
      await fetchCompetitorTrafficData(competitors, env.RAPIDAPI_KEY, env.RAPIDAPI_HOST);
    }

    // Verify each competitor website actually exists
    const verifiedCompetitors = [];
    for (const comp of competitors) {
      if (verifiedCompetitors.length >= 5) break;

      const isValid = await verifyCompetitorWebsite(comp.name, comp.website);
      if (isValid) {
        verifiedCompetitors.push(comp);
      }
    }

    log.info('[Preview] Verified real competitors with traffic data', { count: verifiedCompetitors.length });

    // Deduplicate by website domain
    const deduplicatedCompetitors = deduplicateCompetitors(verifiedCompetitors);

    // Return only verified competitors (even if less than 3)
    if (deduplicatedCompetitors.length === 0) {
      log.warn('⚠️ No competitors could be verified, returning empty array');
      return { competitors: [], usage, competitorCount: 0 };
    }

    // Return top 3 (AI already sorted them by traffic using the tool)
    const top3 = deduplicatedCompetitors.slice(0, 3);
    log.info('📊 [Preview] Returning top competitors', { count: top3.length });
    return { competitors: top3, usage, competitorCount: top3.length };
  } catch (error) {
    log.error('[Preview] Failed to generate competitor analysis', error);
    throw error;
  }
}
