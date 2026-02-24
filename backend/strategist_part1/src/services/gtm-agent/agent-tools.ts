/**
 * GTM Agent Tools
 * Tool definitions for Claude to use during report generation
 */

import type { ClaudeTool } from '../ai/claude-client';
import type { TrafficDataResult, ToolResult } from '../../types/gtm-agent-types';
import { createLogger } from '../../utils/logger';

const log = createLogger({ context: '[AgentTools]' });

// ============================================================================
// TOOL DEFINITIONS
// ============================================================================

// Native Claude API web search tool (server-side execution)
export const webSearchTool: ClaudeTool = {
  type: 'web_search_20250305',
  name: 'web_search',
  max_uses: 15,
};

export const trafficDataTool: ClaudeTool = {
  name: 'fetch_traffic_data',
  description:
    'Fetch website traffic data from Similarweb via RapidAPI. Returns monthly visits, bounce rate, traffic sources breakdown, and top countries. Use this to analyze competitor traffic and understand their channel mix.',
  input_schema: {
    type: 'object',
    properties: {
      domain: {
        type: 'string',
        description:
          'The website domain to analyze (e.g., "example.com"). Do not include protocol (http/https) or www prefix.',
      },
    },
    required: ['domain'],
  },
};

export const agentTools: ClaudeTool[] = [webSearchTool, trafficDataTool];

// ============================================================================
// TOOL EXECUTOR
// ============================================================================

interface ToolExecutorConfig {
  rapidApiKey?: string;
  rapidApiHost?: string;
}

/**
 * Execute custom agent tools (not server-side tools like web_search)
 * Note: web_search is now handled natively by Claude API
 */
export async function executeToolCall(
  toolName: string,
  toolInput: Record<string, unknown>,
  config: ToolExecutorConfig
): Promise<TrafficDataResult> {
  log.info('Executing tool', { toolName, input: toolInput });

  switch (toolName) {
    case 'fetch_traffic_data':
      return executeTrafficDataFetch(
        toolInput.domain as string,
        config.rapidApiKey,
        config.rapidApiHost
      );

    default:
      log.warn('Unknown tool called', { toolName });
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

// ============================================================================
// TRAFFIC DATA IMPLEMENTATION (RapidAPI/Similarweb)
// ============================================================================

/**
 * Fetch traffic data from Similarweb via RapidAPI
 */
async function executeTrafficDataFetch(
  domain: string,
  rapidApiKey?: string,
  rapidApiHost?: string
): Promise<TrafficDataResult> {
  log.info('Fetching traffic data', { domain });

  if (!rapidApiKey) {
    log.warn('RapidAPI key not configured, returning estimated data');
    return generateEstimatedTrafficData(domain);
  }

  try {
    const normalizedDomain = normalizeDomain(domain);
    const apiHost = (
      rapidApiHost || 'similarweb-traffic-api-for-bulk.p.rapidapi.com'
    ).trim();
    const url = `https://${apiHost}/rapidapi.php?domain=${normalizedDomain}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': rapidApiKey.trim(),
        'x-rapidapi-host': apiHost,
      },
    });

    if (response.status === 429) {
      log.warn('RapidAPI rate limit hit', { domain });
      return generateEstimatedTrafficData(domain, 'Rate limit reached');
    }

    if (!response.ok) {
      const errorBody = await response.text();
      log.error('RapidAPI error', {
        domain,
        status: response.status,
        error: errorBody.substring(0, 200),
      });
      return generateEstimatedTrafficData(domain, 'API request failed');
    }

    const data = (await response.json()) as RapidAPIResponse;
    return parseTrafficData(domain, data);
  } catch (error) {
    log.error('Error fetching traffic data', { domain, error });
    return generateEstimatedTrafficData(
      domain,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

interface RapidAPIResponse {
  Engagments?: {
    Visits?: string;
    BounceRate?: string;
    TimeOnSite?: string;
    PagePerVisit?: string;
  };
  TopCountryShares?: Array<{ CountryCode: string; Value: number }>;
  TrafficSources?: {
    Direct?: number;
    Search?: number;
    Social?: number;
    Referrals?: number;
    'Paid Referrals'?: number;
    Mail?: number;
  };
}

/**
 * Normalize domain string
 */
function normalizeDomain(domain: string): string {
  return domain
    .toLowerCase()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/.*$/, '');
}

/**
 * Parse RapidAPI response to our format
 */
function parseTrafficData(
  domain: string,
  data: RapidAPIResponse
): TrafficDataResult {
  const visits = data.Engagments?.Visits
    ? parseInt(data.Engagments.Visits)
    : 0;
  const bounceRate = data.Engagments?.BounceRate
    ? parseFloat(data.Engagments.BounceRate)
    : 0;
  const timeOnSite = data.Engagments?.TimeOnSite
    ? parseFloat(data.Engagments.TimeOnSite)
    : 0;
  const pagePerVisit = data.Engagments?.PagePerVisit
    ? parseFloat(data.Engagments.PagePerVisit)
    : 0;

  const topCountries = (data.TopCountryShares || []).map((c) => ({
    country: c.CountryCode,
    share: c.Value,
  }));

  const trafficSources = data.TrafficSources
    ? {
        direct: data.TrafficSources.Direct || 0,
        search: data.TrafficSources.Search || 0,
        social: data.TrafficSources.Social || 0,
        referral: data.TrafficSources.Referrals || 0,
        paid: data.TrafficSources['Paid Referrals'] || 0,
        mail: data.TrafficSources.Mail || 0,
      }
    : { direct: 0, search: 0, social: 0, referral: 0, paid: 0, mail: 0 };

  return {
    domain,
    monthlyVisits: formatNumber(visits),
    bounceRate: `${(bounceRate * 100).toFixed(1)}%`,
    pagesPerVisit: pagePerVisit.toFixed(1),
    avgVisitDuration: formatDuration(timeOnSite),
    trafficSources,
    topCountries,
  };
}

/**
 * Generate estimated traffic data when API is unavailable
 */
function generateEstimatedTrafficData(
  domain: string,
  error?: string
): TrafficDataResult {
  return {
    domain,
    monthlyVisits: 'Data unavailable',
    bounceRate: 'N/A',
    pagesPerVisit: 'N/A',
    avgVisitDuration: 'N/A',
    trafficSources: { direct: 0, search: 0, social: 0, referral: 0, paid: 0, mail: 0 },
    topCountries: [],
    error: error || 'Traffic data not available',
  };
}

/**
 * Format large numbers with K/M suffixes
 */
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

/**
 * Format duration in seconds to readable string
 */
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}m ${secs}s`;
}

// ============================================================================
// TOOL RESULT TRACKING
// ============================================================================

/**
 * Create a tool result record for storage
 */
export function createToolResult(
  toolName: string,
  input: { domain: string },
  output: TrafficDataResult
): ToolResult {
  return {
    toolName,
    input,
    output,
    timestamp: new Date().toISOString(),
  };
}
