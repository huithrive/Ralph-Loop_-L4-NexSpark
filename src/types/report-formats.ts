/**
 * Type definitions for GTM report formats
 * Supports both legacy (v1) and v2 reports
 */

// ============================================================================
// SHARED TYPES (Used by both formats)
// ============================================================================

export interface BusinessProfile {
  brandName: string;
  website?: string;
  industry: string;
  targetMarket: string;
  businessStage: string;
  mainChallenges: string[];
  businessGoals: string[];
  budget: string;
  additionalContext?: string;
}

// ============================================================================
// V2 FORMAT TYPES
// ============================================================================

export interface CustomerSegment {
  segment: string;
  description: string;
  aovPotential: string;
  cacEstimate: string;
}

export interface CompetitorInsight {
  name: string;
  website: string;
  estimatedTraffic: string; // e.g., "15K-25K monthly"
  primaryChannels: string[];
  pricePoint: string;
  strengths: string[]; // 4-5 items
  weaknesses: string[]; // 3-4 items
  layoutAnalysis: string[]; // 4-5 website design observations
}

export interface ChannelComparison {
  factor: string;
  metaAds: string;
  googleAds: string;
  winner: 'Meta' | 'Google' | 'Tie';
}

export interface CreativeRecommendation {
  type: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'TEST';
  format: string;
  purpose: string;
  examples: string[];
  notes?: string;
}

export interface AdSet {
  name: string;
  budget: string;
  targeting: string;
  creatives: string;
}

export interface Campaign {
  name: string;
  objective: string;
  budgetPercentage: number;
  adSets: AdSet[];
}

export interface ABTest {
  testCategory: string;
  variableA: string;
  variableB: string;
  successMetric: string;
  timeline: string;
}

export interface WeeklyPlan {
  weekNumber: number;
  title: string;
  objectives: string[];
  keyActivities: string[];
  metrics: {
    budget: string;
    targetCTR?: string;
    targetPurchases?: string;
    targetROAS?: string;
    [key: string]: string | undefined;
  };
}

export interface KPITarget {
  metric: string;
  week1: string;
  week2: string;
  week3: string;
  week4: string;
}

// ============================================================================
// V2 GTM STRATEGY INTERFACE
// ============================================================================

export interface GTMStrategyV2 {
  executiveSummary: string;
  businessProfile: BusinessProfile;

  marketAnalysis: {
    marketSize: string;
    growthRate: string;
    keyTrends: string[];
    customerSegments: CustomerSegment[];
  };

  competitiveAnalysis: {
    topCompetitors: CompetitorInsight[];
    keyInsights: string[];
  };

  channelRecommendation: {
    recommended: 'Meta' | 'Google';
    reasoning: string;
    comparisonTable: ChannelComparison[];
    yamabushiLearnings: string[];
  };

  creativeRecommendations: CreativeRecommendation[];

  campaignStructure: {
    weeklyBudget: string;
    campaigns: Campaign[];
  };

  abTestingPlan: {
    tests: ABTest[];
    keyHypotheses: string[];
  };

  fourWeekExecutionPlan: WeeklyPlan[];

  kpiTrackingFramework: KPITarget[];

  immediateNextSteps: {
    preLaunchChecklist: string[];
  };
}

// ============================================================================
// LEGACY FORMAT TYPES (for backward compatibility)
// ============================================================================

export interface ChannelStrategy {
  channel: string;
  priority: 'Primary' | 'Secondary' | 'Tertiary';
  rationale: string;
  tactics: string[];
  estimatedBudget: string;
  timeline: string;
  kpis: string[];
}

export interface RoadmapPhase {
  phase: string;
  timeline: string;
  objectives: string[];
  keyActivities: string[];
  milestones: string[];
  estimatedBudget: string;
}

export interface GTMStrategyLegacy {
  executiveSummary: string;
  businessProfile: BusinessProfile;

  marketAnalysis: {
    marketSize: string;
    growthRate: string;
    keyTrends: string[];
    opportunities: string[];
  };

  competitiveAnalysis: {
    topCompetitors: Array<{
      name: string;
      strengths: string[];
      weaknesses: string[];
      positioning: string;
    }>;
    competitiveAdvantages: string[];
    threats: string[];
  };

  targetAudience: {
    primarySegments: Array<{
      name: string;
      demographics: string;
      psychographics: string;
      painPoints: string[];
      valueProposition: string;
    }>;
    buyerPersonas: Array<{
      name: string;
      description: string;
      goals: string[];
      challenges: string[];
    }>;
  };

  channelStrategy: {
    recommendedChannels: ChannelStrategy[];
    integrationApproach: string;
  };

  sixMonthRoadmap: {
    phases: RoadmapPhase[];
    criticalPath: string[];
  };

  budgetProjections: {
    totalBudget: string;
    breakdown: Array<{
      category: string;
      amount: string;
      percentage: string;
    }>;
    assumptions: string[];
  };

  kpis: {
    metrics: Array<{
      name: string;
      target: string;
      measurement: string;
      frequency: string;
    }>;
    dashboardRecommendations: string[];
  };
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isV2Strategy(strategy: any): strategy is GTMStrategyV2 {
  return (
    strategy &&
    typeof strategy === 'object' &&
    'channelRecommendation' in strategy &&
    'fourWeekExecutionPlan' in strategy &&
    'kpiTrackingFramework' in strategy
  );
}

export function isLegacyStrategy(strategy: any): strategy is GTMStrategyLegacy {
  return (
    strategy &&
    typeof strategy === 'object' &&
    'targetAudience' in strategy &&
    'sixMonthRoadmap' in strategy &&
    'budgetProjections' in strategy
  );
}

// ============================================================================
// CONFIGURATION TYPE
// ============================================================================

export type ReportFormat = 'legacy' | 'v2';

export interface ReportGenerationConfig {
  format: ReportFormat;
  modelId: string;
  useRapidAPI: boolean;
}

export const REPORT_CONFIGS: Record<ReportFormat, ReportGenerationConfig> = {
  legacy: {
    format: 'legacy',
    modelId: 'claude-opus-4-20250514',
    useRapidAPI: true,
  },
  v2: {
    format: 'v2',
    modelId: 'claude-opus-4-5-20251101',
    useRapidAPI: false,
  },
};
