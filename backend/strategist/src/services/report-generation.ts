/**
 * Advanced Report Generation Service (Facade)
 * This file re-exports functions from modular preview components for backward compatibility
 */

import { callClaudeJson } from './ai/claude-client';
import { AI_MODELS } from '../config';
import { buildReportPrompt } from './ai/preview-prompts';
import { createLogger } from '../utils/logger';

// Re-export preview functions
export { generateCompetitorPreview } from './preview/competitor-preview';
export { generateRoadmapPreview } from './preview/roadmap-preview';
export { generateBenchmarksPreview } from './preview/benchmarks-preview';
export { generateEnhancedSummary } from './preview/enhanced-summary';

// Type definitions
export interface InterviewData {
  brandName: string;
  productDescription: string;
  founded?: string;
  motivation?: string;
  currentRevenue: string;
  marketingChannels: string[];
  bestChannel?: string;
  biggestChallenge: string;
  idealCustomer: string;
  competitors: string[];
  sixMonthGoal: string;
  industry?: string;
  website?: string;
}

export interface CompetitorInsight {
  name: string;
  website: string;
  monthlyTraffic: string;
  strength: string;
  weakness: string;
  positioning?: string;
  _trafficValue?: number | null; // Internal field for sorting
}

export interface ReportSlide {
  slideNumber: number;
  title: string;
  content: string;
  keyPoints?: string[];
  data?: any;
}

export interface FullReport {
  executiveSummary: string;
  slides: ReportSlide[];
  nextSteps: string[];
  metadata: {
    generatedAt: string;
    brandName: string;
    provider: string;
  };
}

/**
 * Generate a comprehensive growth report using Claude 4.5 Sonnet
 */
export async function generateComprehensiveReport(
  interviewData: InterviewData,
  competitors: CompetitorInsight[],
  env: any
): Promise<FullReport> {
  const log = createLogger({ context: '[ReportGen]' });
  const claudeApiKey = env.ANTHROPIC_API_KEY;

  if (!claudeApiKey || !claudeApiKey.startsWith('sk-ant-')) {
    throw new Error('Claude API key is required for report generation');
  }

  const prompt = buildReportPrompt(interviewData, competitors);

  log.info('📊 Generating comprehensive report with Claude 4.5 Sonnet', { brandName: interviewData.brandName });

  // Use new Claude client wrapper
  const reportData = await callClaudeJson<FullReport>(prompt, claudeApiKey, {
    model: AI_MODELS.claude.opus4,
    maxTokens: 8000,
    temperature: 0.7,
  });

  // Ensure metadata is populated
  const report = {
    ...reportData,
    metadata: {
      generatedAt: new Date().toISOString(),
      brandName: interviewData.brandName,
      provider: 'Claude Opus 4',
    },
  };

  log.info('Report generated successfully', { brandName: interviewData.brandName, slideCount: report.slides.length });

  return report;
}
