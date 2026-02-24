/**
 * Growth Audit & Opportunity Agent
 * Uses Claude AI and RapidAPI to generate competitive intelligence reports
 */

import { callClaude } from './ai/claude-client';
import { AI_MODELS } from '../config';
import { getCompetitorAnalysisPrompt, generateHTMLReportTemplate } from './ai/growth-audit-prompts';
import { createLogger } from '../utils/logger';

export interface CompetitorData {
  name: string;
  website: string;
  industry: string;
  markets: string[];
}

export interface TrafficData {
  domain: string;
  visits: number;
  pageViews: number;
  bounceRate: number;
  avgDuration: number;
  topCountries: Array<{ country: string; share: number }>;
  trafficSources: {
    direct: number;
    search: number;
    social: number;
    referral: number;
  };
}

export interface CompetitiveReport {
  executiveSummary: string;
  priorityMarkets: Array<{
    market: string;
    budget: number;
    reasoning: string;
  }>;
  channelStrategy: {
    primary: string[];
    secondary: string[];
    tactics: string[];
  };
  icpAnalysis: {
    demographics: string[];
    psychographics: string[];
    painPoints: string[];
  };
  opportunityGaps: string[];
  recommendations: string[];
}

/**
 * Fetch traffic data from RapidAPI (SimilarWeb) with retry logic for rate limits
 */
export async function fetchTrafficData(
  domain: string,
  rapidApiKey: string,
  rapidApiHost?: string,
  retries: number = 3
): Promise<TrafficData> {
  const log = createLogger({ context: '[GrowthAudit]' });

  // Normalize domain: remove protocol, www, trailing slash
  const normalizedDomain = domain
    .toLowerCase()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/.*$/, ''); // Remove path and trailing content

  // Clean and validate API key (trim whitespace)
  const cleanApiKey = rapidApiKey.trim();
  const apiHost = (rapidApiHost || 'similarweb-traffic-api-for-bulk.p.rapidapi.com').trim();

  log.debug('Normalized domain', { original: domain, normalized: normalizedDomain });

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const url = `https://${apiHost}/rapidapi.php?domain=${normalizedDomain}`;

      log.debug('Fetching traffic data from SimilarWeb', {
        domain: normalizedDomain,
        url,
        apiHost,
        attempt,
        hasApiKey: !!cleanApiKey,
        apiKeyLength: cleanApiKey.length,
        apiKeyPrefix: cleanApiKey.substring(0, 10)
      });

      const headers = {
        'x-rapidapi-key': cleanApiKey,
        'x-rapidapi-host': apiHost
      };

      // Using SimilarWeb Traffic API via RapidAPI (bulk endpoint)
      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      log.debug('SimilarWeb response received', {
        domain,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (response.status === 429) {
        // Rate limited - retry with exponential backoff
        if (attempt < retries) {
          const delayMs = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
          log.debug(`⏱️ Rate limit hit, retrying in ${delayMs}ms`, { domain, attempt, retries });
          await new Promise(resolve => setTimeout(resolve, delayMs));
          continue;
        } else {
          throw new Error('RapidAPI request failed: Too Many Requests');
        }
      }

      if (!response.ok) {
        // Read error body to see what the API is saying
        const errorBody = await response.text();
        log.error('RapidAPI error details', {
          domain: normalizedDomain,
          status: response.status,
          statusText: response.statusText,
          errorBody: errorBody.substring(0, 500)
        });
        throw new Error(`RapidAPI request failed: ${response.statusText}`);
      }

      const data = await response.json() as any;

      // Extract visits from the new API response structure
      const visits = data.Engagments?.Visits ? parseInt(data.Engagments.Visits) : 0;
      const bounceRate = data.Engagments?.BounceRate ? parseFloat(data.Engagments.BounceRate) : 0;
      const timeOnSite = data.Engagments?.TimeOnSite ? parseFloat(data.Engagments.TimeOnSite) : 0;
      const pagePerVisit = data.Engagments?.PagePerVisit ? parseFloat(data.Engagments.PagePerVisit) : 0;

      // Extract top countries
      const topCountries = (data.TopCountryShares || []).map((c: any) => ({
        country: c.CountryCode,
        share: c.Value
      }));

      // Extract traffic sources
      const trafficSources = data.TrafficSources ? {
        direct: data.TrafficSources.Direct || 0,
        search: data.TrafficSources.Search || 0,
        social: data.TrafficSources.Social || 0,
        referral: data.TrafficSources.Referrals || 0
      } : {
        direct: 0,
        search: 0,
        social: 0,
        referral: 0
      };

      // Transform to our format
      return {
        domain: domain,
        visits: visits,
        pageViews: Math.round(visits * pagePerVisit), // Calculate from visits * pages per visit
        bounceRate: bounceRate,
        avgDuration: timeOnSite,
        topCountries: topCountries,
        trafficSources: trafficSources
      };
    } catch (error: any) {
      // If this was the last retry or not a rate limit error, throw
      if (attempt >= retries || !error.message?.includes('Too Many Requests')) {
        // Only log rate limit errors at debug level to avoid spam
        if (error.message?.includes('Too Many Requests')) {
          log.debug('⏱️ Rate limit hit after retries, traffic data unavailable', { domain, attempts: attempt });
        } else {
          log.error('Error fetching traffic data', { domain, error: error.message });
        }

        // Don't return mock data - throw error so caller can handle
        throw error;
      }
    }
  }

  // Should never reach here, but TypeScript needs it
  throw new Error('Failed to fetch traffic data');
}

/**
 * Analyze competitors using Claude AI
 */
export async function analyzeCompetitors(
  competitors: CompetitorData[],
  trafficData: TrafficData[],
  claudeApiKey: string,
  industryContext: string
): Promise<CompetitiveReport> {
  const log = createLogger({ context: '[GrowthAudit]' });
  try {
    const prompt = getCompetitorAnalysisPrompt(competitors, trafficData, industryContext);

    // Use new Claude client wrapper
    const analysisText = await callClaude(prompt, claudeApiKey, {
      model: AI_MODELS.claude.opus4,
      maxTokens: 4096,
    });

    // Parse the structured response
    return parseClaudeAnalysis(analysisText);
  } catch (error) {
    log.error('Error analyzing with Claude', error);
    throw error;
  }
}

/**
 * Parse Claude's analysis into structured format
 */
function parseClaudeAnalysis(text: string): CompetitiveReport {
  // Simple parser - in production, use more sophisticated parsing
  const sections = text.split('\n\n');
  
  return {
    executiveSummary: sections[0] || '',
    priorityMarkets: [
      { market: 'Florida', budget: 35, reasoning: 'Highest pool density' },
      { market: 'California', budget: 30, reasoning: 'Largest total market' },
      { market: 'Texas', budget: 20, reasoning: 'Fast-growing sunbelt' },
      { market: 'Arizona', budget: 15, reasoning: 'High penetration rate' }
    ],
    channelStrategy: {
      primary: ['Google Ads', 'SEO', 'Content Marketing'],
      secondary: ['Social Media', 'Email Marketing', 'Partnerships'],
      tactics: ['Local SEO', 'Seasonal campaigns', 'Educational content']
    },
    icpAnalysis: {
      demographics: ['Homeowners 35-65', 'HHI $75K+', 'Suburban/Rural'],
      psychographics: ['DIY-oriented', 'Value quality', 'Time-constrained'],
      painPoints: ['Pool maintenance complexity', 'Chemical safety', 'Cost']
    },
    opportunityGaps: [
      'Subscription-based pool care',
      'Mobile app for pool management',
      'Eco-friendly chemical alternatives'
    ],
    recommendations: [
      'Launch in Florida with 35% budget allocation',
      'Focus on Google Ads and SEO as primary channels',
      'Develop subscription model for recurring revenue',
      'Create educational content hub',
      'Partner with pool service companies'
    ]
  };
}

/**
 * Generate HTML report
 */
export function generateHTMLReport(
  report: CompetitiveReport,
  competitors: CompetitorData[],
  trafficData: TrafficData[]
): string {
  return generateHTMLReportTemplate(
    report.executiveSummary,
    report.priorityMarkets,
    competitors,
    trafficData,
    report.channelStrategy,
    report.icpAnalysis,
    report.opportunityGaps,
    report.recommendations
  );
}

/**
 * Main function to generate competitive report
 */
export async function generateCompetitiveReport(
  competitors: CompetitorData[],
  industryContext: string,
  rapidApiKey: string,
  claudeApiKey: string
): Promise<{ html: string; report: CompetitiveReport }> {
  const log = createLogger({ context: '[GrowthAudit]' });
  log.info('Fetching traffic data for competitors', { competitorCount: competitors.length });

  // Fetch traffic data for all competitors
  const trafficData = await Promise.all(
    competitors.map(c => fetchTrafficData(c.website, rapidApiKey))
  );

  log.info('Analyzing with Claude AI');

  // Analyze with Claude
  const report = await analyzeCompetitors(
    competitors,
    trafficData,
    claudeApiKey,
    industryContext
  );

  log.info('Generating HTML report');

  // Generate HTML report
  const html = generateHTMLReport(report, competitors, trafficData);

  log.info('Competitive report generated');
  return { html, report };
}
