/**
 * Web scraping utilities
 */

import { fetchWithTimeout } from '../../utils/fetch-with-timeout';
import { TIMEOUTS } from '../../config';

export interface ScrapedWebsite {
  url: string;
  title: string;
  description: string;
  content: string;
  error?: string;
}

/**
 * Scrape a website and extract key information
 */
export async function scrapeWebsite(url: string): Promise<ScrapedWebsite> {
  try {
    // Ensure URL has protocol
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;

    const response = await fetchWithTimeout(normalizedUrl, {
      timeout: TIMEOUTS.api.default,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AuxoraBot/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';

    // Extract meta description
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    const description = descMatch ? descMatch[1].trim() : '';

    // Extract visible text (simplified - remove scripts, styles, tags)
    let content = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 10000); // Limit content length

    return {
      url: normalizedUrl,
      title,
      description,
      content,
    };
  } catch (error) {
    return {
      url,
      title: '',
      description: '',
      content: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Scrape multiple websites in parallel
 */
export async function scrapeWebsites(urls: string[]): Promise<ScrapedWebsite[]> {
  return Promise.all(urls.map((url) => scrapeWebsite(url)));
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string {
  try {
    const normalized = url.startsWith('http') ? url : `https://${url}`;
    const urlObj = new URL(normalized);
    return urlObj.hostname.replace('www.', '');
  } catch (e) {
    return url;
  }
}
