/**
 * Data Normalizer
 * Normalizes competitor data and scrapes website content
 */

import type { CompetitorInsight } from '../types/report-formats';
import { createLogger } from './logger';

/**
 * Normalize competitors to ensure all required fields exist
 */
export function normalizeCompetitors(competitors: any[]): CompetitorInsight[] {
  return competitors.map(comp => ({
    name: comp.name || 'Unknown Competitor',
    website: comp.website || '',
    estimatedTraffic: comp.estimatedTraffic || 'Unknown',
    primaryChannels: Array.isArray(comp.primaryChannels) ? comp.primaryChannels : [],
    pricePoint: comp.pricePoint || 'Not specified',
    strengths: Array.isArray(comp.strengths) ? comp.strengths : [],
    weaknesses: Array.isArray(comp.weaknesses) ? comp.weaknesses : [],
    layoutAnalysis: Array.isArray(comp.layoutAnalysis) ? comp.layoutAnalysis : []
  }));
}

/**
 * Scrape website content with basic HTML cleaning
 */
export async function scrapeWebsiteContent(website: string): Promise<string> {
  const log = createLogger({ context: '[Scraper]' });
  const normalizedUrl = website.startsWith('http') ? website : `https://${website}`;
  let scrapedContent = '';

  try {
    const response = await fetch(normalizedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NexSpark/1.0; +https://nexspark.io)'
      }
    });

    if (response.ok) {
      const html = await response.text();
      scrapedContent = cleanHtmlContent(html);
      log.info('[scrapeWebsiteContent] Website content scraped', { website, length: scrapedContent.length });
    }
  } catch (error: any) {
    log.error('[scrapeWebsiteContent] Scraping failed', { website, error: error.message });
  }

  return scrapedContent;
}

/**
 * Clean HTML content by removing scripts, styles, and tags
 */
export function cleanHtmlContent(html: string, maxLength: number = 5000): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, maxLength);
}
