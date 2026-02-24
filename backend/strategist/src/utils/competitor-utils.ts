/**
 * Competitor Research Utilities
 * Shared functions for competitor analysis
 */

import { createLogger } from './logger';
import { fetchTrafficData } from '../services/growth-audit-agent';

const log = createLogger({ context: '[CompetitorUtils]' });

/**
 * Format traffic numbers to human-readable format
 */
export function formatTraffic(visits: number): string {
  if (visits >= 1_000_000) {
    return `${(visits / 1_000_000).toFixed(1)}M monthly`;
  } else if (visits >= 1_000) {
    return `${Math.round(visits / 1_000)}K monthly`;
  } else {
    return `${visits} monthly`;
  }
}

/**
 * Normalize domain by removing protocol and www
 */
export function normalizeDomain(url: string): string {
  return url
    .toLowerCase()
    .replace(/^https?:\/\/(www\.)?/, '')
    .replace(/\/$/, '');
}

/**
 * Fetch traffic data for all competitors in parallel
 */
export async function fetchCompetitorTrafficData(
  competitors: any[],
  rapidApiKey: string,
  rapidApiHost: string
): Promise<any[]> {
  log.info('Fetching traffic data for all competitors in parallel', { count: competitors.length });

  const trafficPromises = competitors.map(async (comp: any) => {
    const domain = normalizeDomain(comp.website);
    try {
      const trafficData = await fetchTrafficData(domain, rapidApiKey, rapidApiHost);
      if (trafficData.visits > 0) {
        log.info('Traffic data fetched', { domain, visits: trafficData.visits });
        comp.monthlyTraffic = formatTraffic(trafficData.visits);
        comp.estimatedTraffic = formatTraffic(trafficData.visits);
      } else {
        log.warn('No traffic data available', { domain });
        comp.monthlyTraffic = 'Unavailable';
        comp.estimatedTraffic = 'Unavailable';
      }
    } catch (error: any) {
      log.warn('Traffic fetch failed', { domain, error: error.message });
      comp.monthlyTraffic = 'Unavailable';
      comp.estimatedTraffic = 'Unavailable';
    }
    return comp;
  });

  await Promise.all(trafficPromises);
  log.info('All traffic data fetched');
  return competitors;
}

/**
 * Verify competitor website exists
 */
export async function verifyCompetitorWebsite(
  name: string,
  website: string
): Promise<boolean> {
  try {
    const url = website.startsWith('http') ? website : `https://${website}`;
    log.debug('Verifying competitor', { name, url });

    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NexSpark/1.0; +https://nexspark.io)'
      },
      redirect: 'follow'
    });

    if (response.ok || response.status === 403) {
      log.info('Verified competitor exists', { name });
      return true;
    }

    log.debug('Rejected competitor', { name, status: response.status });
    return false;
  } catch (error: any) {
    log.debug('Rejected competitor', { name, error: error.message });
    return false;
  }
}

/**
 * Deduplicate competitors by domain
 */
export function deduplicateCompetitors(competitors: any[]): any[] {
  const seenDomains = new Set<string>();
  const deduplicated = competitors.filter(comp => {
    const normalizedDomain = normalizeDomain(comp.website);

    if (seenDomains.has(normalizedDomain)) {
      log.debug('Skipping duplicate', { name: comp.name, domain: normalizedDomain });
      return false;
    }

    seenDomains.add(normalizedDomain);
    return true;
  });

  if (deduplicated.length < competitors.length) {
    log.info('Removed duplicate competitors', { removed: competitors.length - deduplicated.length });
  }

  return deduplicated;
}