/**
 * GTM Report Agent
 * Single-agent orchestrator for generating GTM reports with tool use
 */

import { callClaudeJsonWithTools, callClaudeJson, callClaude } from '../ai/claude-client';
import { AI_MODELS, TIMEOUTS } from '../../config';
import { buildHybridPrompt } from './hybrid-prompt';
import { agentTools, executeToolCall, createToolResult } from './agent-tools';
import { generateAgentReport } from './agent-report-template';
import { calculateCost } from '../cost-calculator';
import { createLogger } from '../../utils/logger';
import { extractJsonFromText } from '../../utils/json-parser';
import { appendThinkingLog } from '../../repositories/agent-report-repository';
import { scrapeWebsite } from '../ai/web-scraper';
import type { BusinessProfile, CompetitorInsight } from '../../types/report-formats';
import type {
  GTMAgentReport,
  AgentGenerationState,
  ToolResult,
  WebSocketMessage,
} from '../../types/gtm-agent-types';

const log = createLogger({ context: '[GTMAgent]' });

// ============================================================================
// AGENT CONFIGURATION
// ============================================================================

interface AgentConfig {
  claudeApiKey: string;
  rapidApiKey?: string;
  rapidApiHost?: string;
  model?: string;
  maxTokens?: number;
  timeout?: number;
}

// ============================================================================
// MAIN AGENT CLASS
// ============================================================================

export class GTMReportAgent {
  private config: AgentConfig;
  private state: AgentGenerationState;
  private toolResults: ToolResult[] = [];
  private totalInputTokens = 0;
  private totalOutputTokens = 0;
  private db?: D1Database;
  private wsBroadcast?: (message: WebSocketMessage) => Promise<void>;

  constructor(
    config: AgentConfig,
    reportId: string,
    interviewId: string,
    userId: string,
    db?: D1Database,
    wsBroadcast?: (message: WebSocketMessage) => Promise<void>
  ) {
    this.config = config;
    this.state = {
      reportId,
      interviewId,
      userId,
      status: 'PENDING',
      progress: 0,
      toolResults: [],
      webSearchesCount: 0,
      rapidApiCallsCount: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      startTime: Date.now(),
    };
    this.db = db;
    this.wsBroadcast = wsBroadcast;
  }

  /**
   * Generate GTM report with tool use
   */
  async generate(
    businessProfile: BusinessProfile,
    competitors: CompetitorInsight[],
    websiteContent: string
  ): Promise<{
    report: GTMAgentReport;
    htmlReport: string;
    metrics: GenerationMetrics;
  }> {
    log.info('Starting GTM agent generation', {
      reportId: this.state.reportId,
      brandName: businessProfile.brandName,
    });

    this.state.status = 'GENERATING';
    this.state.progress = 10;

    try {
      // Build prompt with business context
      const toolResultsJson = this.formatToolResults();
      const prompt = buildHybridPrompt(
        businessProfile,
        competitors,
        websiteContent,
        toolResultsJson
      );

      log.info('Executing Claude with tools', {
        reportId: this.state.reportId,
        toolCount: agentTools.length,
      });

      this.state.progress = 30;

      // Execute Claude with tool use capability
      const report = await this.executeWithTools(prompt);

      this.state.progress = 70;

      // Save JSON report to database immediately after generation
      log.info('Saving JSON report to database', {
        reportId: this.state.reportId,
      });

      if (this.db) {
        const { updateAgentReport } = await import('../../repositories/agent-report-repository');
        await updateAgentReport(this.db, this.state.reportId, {
          gtmReport: report,
          progress: 75,
        });
        log.info('JSON report saved successfully', {
          reportId: this.state.reportId,
        });
      }

      this.state.progress = 80;

      // Broadcast that we're formatting the report
      if (this.wsBroadcast) {
        await this.wsBroadcast({
          type: 'thinking_log',
          data: {
            type: 'progress',
            message: 'Compiling recommendations and action items...',
            progress: 85,
            timestamp: new Date().toISOString(),
          },
        });
        await this.wsBroadcast({ type: 'progress', data: { progress: 85 } });
      }

      log.info('Generating HTML report', {
        reportId: this.state.reportId,
      });

      // Broadcast that we're generating the final report
      if (this.wsBroadcast) {
        await this.wsBroadcast({
          type: 'thinking_log',
          data: {
            type: 'progress',
            message: 'Finalizing your personalized GTM report...',
            progress: 90,
            timestamp: new Date().toISOString(),
          },
        });
        await this.wsBroadcast({ type: 'progress', data: { progress: 90 } });
      }

      // Generate HTML from report
      const htmlReport = generateAgentReport(report);

      this.state.progress = 100;
      this.state.status = 'READY';

      // Calculate metrics
      const generationTime = Math.round((Date.now() - this.state.startTime) / 1000);
      const costCents = calculateCost(
        this.totalInputTokens,
        this.totalOutputTokens,
        this.config.model || AI_MODELS.claude.opus45
      );

      const metrics: GenerationMetrics = {
        totalInputTokens: this.totalInputTokens,
        totalOutputTokens: this.totalOutputTokens,
        totalCostCents: costCents,
        generationTimeSeconds: generationTime,
        webSearchesCount: this.state.webSearchesCount,
        rapidApiCallsCount: this.state.rapidApiCallsCount,
        modelId: this.config.model || AI_MODELS.claude.opus45,
        toolResults: this.toolResults,
      };

      log.info('GTM agent generation complete', {
        reportId: this.state.reportId,
        generationTime,
        costCents,
        toolCalls: this.toolResults.length,
      });

      return { report, htmlReport, metrics };
    } catch (error) {
      this.state.status = 'FAILED';
      this.state.error = error instanceof Error ? error.message : 'Unknown error';
      log.error('GTM agent generation failed', {
        reportId: this.state.reportId,
        error: this.state.error,
      });
      throw error;
    }
  }

  /**
   * Execute Claude with tool use loop
   * Note: web_search is handled natively by Claude API, only custom tools need execution
   */
  private async executeWithTools(prompt: string): Promise<GTMAgentReport> {
    const toolExecutor = async (
      toolName: string,
      toolInput: Record<string, unknown>
    ): Promise<unknown> => {
      // Only custom tools (like fetch_traffic_data) need execution
      // web_search is handled automatically by Claude API
      if (toolName === 'fetch_traffic_data') {
        this.state.rapidApiCallsCount++;
      }

      // Execute tool
      const result = await executeToolCall(toolName, toolInput, {
        rapidApiKey: this.config.rapidApiKey,
        rapidApiHost: this.config.rapidApiHost,
      });

      // Store result for custom tools
      const toolResult = createToolResult(
        toolName,
        { domain: toolInput.domain as string },
        result
      );
      this.toolResults.push(toolResult);
      this.state.toolResults.push(toolResult);

      return result;
    };

    // Setup progress callbacks for thinking log
    const callbacks = {
      onToolCall: async (name: string, input: unknown) => {
        const entry = {
          type: 'tool_start' as const,
          toolName: name,
          input: input as { query?: string; domain?: string },
          timestamp: new Date().toISOString(),
        };

        // Persist to DB
        if (this.db) {
          await appendThinkingLog(this.db, this.state.reportId, entry);
        }

        // Broadcast via WebSocket
        if (this.wsBroadcast) {
          await this.wsBroadcast({ type: 'thinking_log', data: entry });
        }
      },

      onToolResult: async (name: string, result: unknown) => {
        const entry = {
          type: 'tool_result' as const,
          toolName: name,
          output: this.summarizeResult(name, result),
          timestamp: new Date().toISOString(),
        };

        // Persist to DB
        if (this.db) {
          await appendThinkingLog(this.db, this.state.reportId, entry);
        }

        // Broadcast via WebSocket
        if (this.wsBroadcast) {
          await this.wsBroadcast({ type: 'thinking_log', data: entry });
        }
      },

      onWebSearch: async (count: number) => {
        const entry = {
          type: 'progress' as const,
          message: `Completed ${count} web search${count > 1 ? 'es' : ''}`,
          progress: this.state.progress,
          timestamp: new Date().toISOString(),
        };

        // Broadcast via WebSocket
        if (this.wsBroadcast) {
          await this.wsBroadcast({ type: 'thinking_log', data: entry });
        }
      },
    };

    // Broadcast that research is starting (before the long Claude API call)
    if (this.wsBroadcast) {
      await this.wsBroadcast({
        type: 'thinking_log',
        data: {
          type: 'progress',
          message: 'Starting market research and competitive analysis...',
          progress: 30,
          timestamp: new Date().toISOString(),
        },
      });
      await this.wsBroadcast({ type: 'progress', data: { progress: 30 } });
    }

    // Call Claude with tools (includes native web_search)
    const { data: report, webSearchCount, usage } = await callClaudeJsonWithTools<GTMAgentReport>(
      prompt,
      this.config.claudeApiKey,
      {
        model: this.config.model || AI_MODELS.claude.opus45,
        maxTokens: this.config.maxTokens || 16384,
        temperature: 1,
        timeout: this.config.timeout || TIMEOUTS.api.long,
        tools: agentTools,
        ...callbacks,
      },
      toolExecutor
    );

    // Track native web search usage from Claude API response
    this.state.webSearchesCount = webSearchCount;
    this.totalInputTokens = usage.input_tokens;
    this.totalOutputTokens = usage.output_tokens;

    // Broadcast research completion with search count
    if (this.wsBroadcast) {
      await this.wsBroadcast({
        type: 'thinking_log',
        data: {
          type: 'progress',
          message: `Research complete: ${webSearchCount} web searches performed`,
          progress: 70,
          timestamp: new Date().toISOString(),
        },
      });
      await this.wsBroadcast({ type: 'progress', data: { progress: 70 } });
    }

    // Broadcast that we're analyzing the research data
    if (this.wsBroadcast) {
      await this.wsBroadcast({
        type: 'thinking_log',
        data: {
          type: 'progress',
          message: 'Analyzing market insights and structuring strategy...',
          progress: 75,
          timestamp: new Date().toISOString(),
        },
      });
      await this.wsBroadcast({ type: 'progress', data: { progress: 75 } });
    }

    return report;
  }

  /**
   * Summarize tool result for thinking log
   */
  private summarizeResult(
    toolName: string,
    result: unknown
  ): { resultCount?: number; visits?: string; error?: string } {
    if (toolName === 'fetch_traffic_data') {
      const trafficResult = result as { monthlyVisits?: string; error?: string };
      return {
        visits: trafficResult.monthlyVisits,
        error: trafficResult.error,
      };
    }
    return {};
  }

  /**
   * Format tool results as JSON string for prompt context
   */
  private formatToolResults(): string {
    if (this.toolResults.length === 0) {
      return '';
    }

    return JSON.stringify(
      this.toolResults.map((r) => ({
        tool: r.toolName,
        input: r.input,
        output: r.output,
      })),
      null,
      2
    );
  }

  /**
   * Get current generation state
   */
  getState(): AgentGenerationState {
    return { ...this.state };
  }
}

// ============================================================================
// GENERATION METRICS
// ============================================================================

export interface GenerationMetrics {
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCostCents: number;
  generationTimeSeconds: number;
  webSearchesCount: number;
  rapidApiCallsCount: number;
  modelId: string;
  toolResults: ToolResult[];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create and run GTM agent for a report
 */
export async function generateGTMAgentReport(
  config: AgentConfig,
  reportId: string,
  interviewId: string,
  userId: string,
  businessProfile: BusinessProfile,
  competitors: CompetitorInsight[],
  websiteContent: string,
  db?: D1Database,
  wsBroadcast?: (message: WebSocketMessage) => Promise<void>
): Promise<{
  report: GTMAgentReport;
  htmlReport: string;
  metrics: GenerationMetrics;
}> {
  const agent = new GTMReportAgent(config, reportId, interviewId, userId, db, wsBroadcast);
  return agent.generate(businessProfile, competitors, websiteContent);
}

/**
 * Sanitize text for safe inclusion in LLM prompts
 * Removes control characters and limits length to prevent prompt injection
 */
function sanitizeForPrompt(text: string | undefined): string {
  if (!text) return '';
  return text
    .substring(0, 5000)
    .replace(/[\x00-\x1F\x7F]/g, ' ')
    .trim();
}

/**
 * Build interview section of prompt
 */
function buildInterviewSection(
  responses: Array<{ question_text: string; answer: string }>
): string {
  const hasResponses = responses && responses.length > 0 &&
    responses.some(r => r.answer && r.answer.trim().length > 0);

  return hasResponses
    ? `INTERVIEW RESPONSES:
${responses.map(r => `Q: ${sanitizeForPrompt(r.question_text)}\nA: ${sanitizeForPrompt(r.answer)}`).join('\n\n')}\n\n`
    : 'INTERVIEW RESPONSES: None provided\n\n';
}

/**
 * Build website section of prompt
 */
function buildWebsiteSection(
  websiteData: { url: string; title?: string; description?: string; content?: string } | null
): string {
  if (!websiteData) {
    return 'WEBSITE DATA: None provided\n\n';
  }

  if (!websiteData.title) {
    return `WEBSITE URL: ${sanitizeForPrompt(websiteData.url)} (scraping failed)\n\n`;
  }

  return `WEBSITE DATA:
URL: ${sanitizeForPrompt(websiteData.url)}
TITLE: ${sanitizeForPrompt(websiteData.title)}
DESCRIPTION: ${sanitizeForPrompt(websiteData.description) || 'N/A'}
CONTENT PREVIEW: ${sanitizeForPrompt(websiteData.content?.substring(0, 3000))}\n\n`;
}

/**
 * Build business profile extraction prompt with both interview responses and website data
 *
 * CRITICAL: This function explicitly handles empty responses by including text that
 * tells the LLM "None provided" rather than passing an empty string. This prevents
 * the "No valid JSON found in text" error that occurred when responses were empty.
 */
function buildBusinessProfilePrompt(
  responses: Array<{ question_text: string; answer: string }>,
  websiteData: { url: string; title?: string; description?: string; content?: string } | null,
  metadata: { brandName?: string }
): string {
  const metadataSection = metadata.brandName
    ? `METADATA: Brand Name = ${sanitizeForPrompt(metadata.brandName)}\n\n`
    : '';

  const interviewSection = buildInterviewSection(responses);
  const websiteSection = buildWebsiteSection(websiteData);

  return `You are a business analyst extracting structured information to create a marketing strategy.

${metadataSection}${interviewSection}${websiteSection}TASK:
Extract business profile information from the available data above. Use your best judgment to interpret and combine information from both interview responses and website data.

IMPORTANT:
- If interview responses are empty, extract everything from website data
- If website data is missing, extract from interview responses
- If both sources are available, cross-reference them for accuracy
- Use "NOT_FOUND" only if information is truly unavailable from ALL sources

Return ONLY valid JSON with this exact structure:
{
  "brandName": "string or NOT_FOUND",
  "website": "string or NOT_FOUND",
  "industry": "string or NOT_FOUND",
  "targetMarket": "string or NOT_FOUND",
  "businessStage": "string or NOT_FOUND",
  "budget": "string or NOT_FOUND",
  "mainChallenges": ["challenge1", "challenge2"] or [],
  "businessGoals": ["goal1", "goal2"] or []
}

EXTRACTION RULES:
- brandName: Extract as proper noun (1-4 words). Use metadata if provided, otherwise from interview/website
- website: Use the provided URL if available
- industry: Specific vertical (e.g., "SaaS CRM", "property management", "skincare")
- targetMarket: Geographic markets and customer segments
- businessStage: Infer from context (e.g., "Startup", "Growth Stage", "Established")
- budget: Marketing budget (weekly/monthly/yearly) - usually only in interview responses
- mainChallenges: 2-4 specific business challenges
- businessGoals: 2-4 specific business goals`;
}

/**
 * Derive brand name from URL domain as fallback
 * Example: "latios.ai" -> "Latios"
 */
function deriveBrandNameFromUrl(url: string): string {
  try {
    const normalized = url.startsWith('http') ? url : `https://${url}`;
    const urlObj = new URL(normalized);
    const domain = urlObj.hostname.replace('www.', '');
    const mainPart = domain.split('.')[0];
    return mainPart.charAt(0).toUpperCase() + mainPart.slice(1);
  } catch (e) {
    const cleaned = url.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('.')[0];
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
}

/**
 * Extract business profile from interview data (PUBLIC API)
 * Uses unified approach: scrapes website + passes both sources to single LLM call
 */
export async function extractBusinessProfile(
  interviewData: {
    responses: Array<{ question_text: string; answer: string }>;
    brand_name?: string;
    preview_url?: string;
  },
  apiKey: string
): Promise<BusinessProfile> {
  const log = createLogger({ context: '[ProfileExtraction]' });

  // Validate and filter responses
  const responses = (interviewData.responses || []).filter(
    r => r &&
      typeof r.question_text === 'string' &&
      typeof r.answer === 'string'
  );

  const websiteUrl = interviewData.preview_url;

  // Validate: need at least one data source
  const hasValidResponses = responses.length > 0 &&
    responses.some(r => r.answer && r.answer.trim().length > 0);

  if (!hasValidResponses && !websiteUrl) {
    throw new Error('Cannot extract business profile: no valid interview responses and no website URL provided');
  }

  log.info('Starting unified profile extraction', {
    hasResponses: hasValidResponses,
    hasWebsite: Boolean(websiteUrl),
    responseCount: responses.length,
  });

  // Scrape website if URL provided (optional - will gracefully handle scrape failures)
  let websiteData: { url: string; title?: string; description?: string; content?: string } | null = null;

  if (websiteUrl) {
    const scraped = await scrapeWebsite(websiteUrl);

    if (!scraped.error && scraped.title) {
      websiteData = {
        url: websiteUrl,
        title: scraped.title,
        description: scraped.description,
        content: scraped.content,
      };
      log.info('Website scraped successfully', {
        url: websiteUrl,
        hasTitle: Boolean(scraped.title),
        hasDescription: Boolean(scraped.description),
        contentLength: scraped.content?.length || 0,
      });
    } else {
      websiteData = { url: websiteUrl };
      log.warn('Website scrape incomplete', {
        url: websiteUrl,
        hasTitle: Boolean(scraped.title),
        error: scraped.error,
      });
    }
  }

  // Build prompt with both data sources
  // This prompt explicitly handles empty responses by telling the LLM
  // "INTERVIEW RESPONSES: None provided" instead of passing empty string
  const prompt = buildBusinessProfilePrompt(
    responses,
    websiteData,
    { brandName: interviewData.brand_name }
  );

  // Single LLM call with robust prompt
  const { data: extracted, usage } = await callClaudeJson<{
    brandName: string;
    website: string;
    industry: string;
    targetMarket: string;
    businessStage: string;
    budget: string;
    mainChallenges: string[];
    businessGoals: string[];
  }>(prompt, apiKey, {
    model: AI_MODELS.claude.haiku,
    maxTokens: 2000,
    temperature: 0.3,
    timeout: TIMEOUTS.api.extended,
  });

  const costCents = calculateCost(usage.input_tokens, usage.output_tokens, AI_MODELS.claude.haiku);
  log.info('Profile extraction complete', {
    costCents,
    inputTokens: usage.input_tokens,
    outputTokens: usage.output_tokens,
    brandNameFound: extracted.brandName !== 'NOT_FOUND',
  });

  // Apply final fallbacks for brand name
  let brandName = extracted.brandName;
  if (brandName === 'NOT_FOUND' && websiteUrl) {
    try {
      brandName = deriveBrandNameFromUrl(websiteUrl);
      log.info('Derived brand name from URL', { url: websiteUrl, brandName });
    } catch (err) {
      log.error('URL-based derivation failed, using fallback', { error: err });
      brandName = 'Unknown Brand';
    }
  } else if (brandName === 'NOT_FOUND') {
    log.warn('No brand name found and no URL available');
    brandName = 'Unknown Brand';
  }

  const profile: BusinessProfile = {
    brandName,
    website: extracted.website !== 'NOT_FOUND' ? extracted.website : websiteUrl,
    industry: extracted.industry === 'NOT_FOUND' ? 'Consumer Products' : extracted.industry,
    targetMarket: extracted.targetMarket === 'NOT_FOUND' ? 'United States' : extracted.targetMarket,
    businessStage: extracted.businessStage === 'NOT_FOUND' ? 'Early Stage' : extracted.businessStage,
    budget: extracted.budget !== 'NOT_FOUND' ? extracted.budget : '$200/week',
    mainChallenges: extracted.mainChallenges.length > 0
      ? extracted.mainChallenges
      : ['Growing brand awareness', 'Acquiring customers profitably'],
    businessGoals: extracted.businessGoals.length > 0
      ? extracted.businessGoals
      : ['Increase revenue', 'Build brand presence'],
  };

  log.info('Business profile ready', {
    brandName: profile.brandName,
    hasWebsite: Boolean(profile.website),
  });

  return profile;
}
