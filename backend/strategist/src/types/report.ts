/**
 * Report related types
 */

import { BusinessProfile, MarketResearch } from './business-profile';

export interface Report {
  id: string;
  userId: string;
  interviewId: string;
  brandName: string;
  htmlReport: string;
  createdAt: string;
  paid: boolean;
  paymentId?: string;
}

export type ReportGenerationState =
  | 'NOT_STARTED'
  | 'ANALYZING'
  | 'PROFILE_REVIEW'
  | 'RESEARCHING'
  | 'PREVIEW_READY'
  | 'PAYMENT_REQUIRED'
  | 'GENERATING_STRATEGY'
  | 'COMPLETE'
  | 'FAILED';

export interface ReportGeneration {
  id: string;
  userId: string;
  interviewId: string;
  currentState: ReportGenerationState;
  progressPercent: number;
  step1Data?: BusinessProfile;
  step2Data?: MarketResearch;
  step3Data?: any;
  step4Data?: any;
  reportId?: string;
  paid: boolean;
  paymentId?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportGenerationStep {
  step: number;
  name: string;
  description: string;
  execute: (generation: ReportGeneration) => Promise<Partial<ReportGeneration>>;
}

/**
 * Admin metrics types for unified report display
 */

export type ReportType = 'legacy' | 'agent';

export interface ToolUsage {
  webSearches: number;
  rapidApiCalls: number;
}

export interface NormalizedReportMetrics {
  id: string;
  reportType: ReportType;
  brandName: string;
  userId: string;
  totalCostCents: number;
  previewCostCents: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  generationTimeSeconds: number;
  modelId: string;
  createdAt: string;
  toolUsage?: ToolUsage;
  previewGenerated?: boolean;
  competitorsAnalyzedCount?: number;
}

export interface DailyMetrics {
  date: string;
  legacy: {
    totalReports: number;
    totalCostCents: number;
    avgGenerationTime: number;
  };
  agent: {
    totalReports: number;
    totalCostCents: number;
    avgGenerationTime: number;
  };
  combined: {
    totalReports: number;
    totalCostCents: number;
  };
}

export interface CombinedMetricsResponse {
  success: boolean;
  metrics: DailyMetrics[];
}

export interface UserCostSummary {
  userId: string;
  email: string;
  legacyReportsCount: number;
  agentReportsCount: number;
  totalReports: number;
  totalTokens: number;
  totalCostCents: number;
  reportsWithPreview: number;
  firstReportDate: string;
  lastReportDate: string;
}

export interface UserCostBreakdown {
  legacyCostCents: number;
  agentCostCents: number;
  legacyCount: number;
  agentCount: number;
}

export interface UserCostsResponse {
  success: boolean;
  user: UserCostSummary;
  legacyReports: NormalizedReportMetrics[];
  agentReports: NormalizedReportMetrics[];
  breakdown: UserCostBreakdown;
}
