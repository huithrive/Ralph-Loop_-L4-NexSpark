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
