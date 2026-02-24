/**
 * Type definitions for GTM report formats
 * Euopho template format (single consolidated version)
 */

// ============================================================================
// SHARED TYPES (Used by all formats)
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
// EUOPHO TEMPLATE TYPES
// ============================================================================

// Product information (optional - skip for service businesses)
export interface ProductInfo {
  emoji: string;        // Direct emoji (e.g., "🌿")
  name: string;         // Product name
  price: string;        // Price display
}

// USP boxes
export interface USPBox {
  emoji: string;        // Icon emoji
  title: string;
  description: string;
}

// Market stats
export interface MarketStat {
  value: string;        // e.g., "$26B"
  label: string;        // e.g., "Global Home Fragrance (2025)"
  growth: string;       // e.g., "↑ 6.6% CAGR to $40.5B by 2032"
}

// Enhanced competitor with all Euopho fields
export interface CompetitorInsight {
  name: string;
  website: string;
  competitorType: 'Premium' | 'Mass' | 'Niche' | 'Retail';
  priceRange: string;
  strengths: string;    // Summary for table
  threatLevel: 'High' | 'Medium' | 'Low';
  estimatedTraffic: string;
  primaryChannels: string[];
  pricePoint: string;
  strengthsList: string[];    // Detailed list
  weaknessesList: string[];
  layoutAnalysis: string[];
}

// ICP Persona
export interface ICPPersona {
  emoji: string;              // Avatar emoji
  name: string;               // "The Wellness Seeker"
  subtitle: string;           // "Primary Target (50% of revenue)"
  isPrimary: boolean;
  stats: {
    ageRange: string;
    avgOrderValue: string;
    purchaseFrequency: string;
    gender: string;
  };
  traits: string[];
  aovPotential?: string;      // "$80-200" - estimated AOV range
  cacEstimate?: string;       // "$15-25" - estimated CAC
}

// Budget phase
export interface BudgetPhase {
  phaseNumber: 1 | 2 | 3;
  title: string;
  duration: string;
  activities: string[];
}

// Platform comparison
export interface PlatformComparison {
  platform: 'Meta' | 'TikTok' | 'Google';
  emoji: string;              // Platform logo emoji
  isRecommended: boolean;
  fitScore: number;           // 0-100
  scoreLevel: 'high' | 'medium';
  pros: string[];
}

// Campaign example (simplified view)
export interface CampaignExample {
  emoji: string;
  title: string;
  budget: string;
  objective: string;
  targeting: string;
  creative: string;
  placements?: string;
}

// Ad Set for detailed campaign structure
export interface AdSet {
  name: string;
  budget: string;
  targeting: string;
  creatives: string;
}

// Campaign with detailed structure
export interface DetailedCampaign {
  title: string;
  objective: string;
  budgetPercentage: number;
  adSets: AdSet[];
}

// Creative recommendation with priority
export interface CreativeRecommendation {
  type: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'TEST';
  format: string;
  purpose: string;
  examples: string[];
}

// A/B Test
export interface ABTest {
  testCategory: string;
  variableA: string;
  variableB: string;
  successMetric: string;
  timeline: string;
}

// KPI with weekly progression
export interface KPIWithProgression {
  metric: string;
  target: string;
  benchmark: string;
  week1Target?: string;
  week4Target?: string;
  week8Target?: string;
  week12Target?: string;
}

// Risk item
export interface RiskItem {
  emoji: string;
  title: string;
  risk: string;
  mitigation: string;
  severity: 'high' | 'medium' | 'low';
}

// Roadmap entry
export interface RoadmapEntry {
  week: string;
  focusArea: string;
  keyActions: string[];
  successCriteria: string;
}

// Chart data for Chart.js
export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    tension?: number;
    fill?: boolean;
    pointRadius?: number;
    borderDash?: number[];
    pointBackgroundColor?: string;
  }>;
}

// ============================================================================
// MAIN GTM STRATEGY INTERFACE (Euopho Format)
// ============================================================================

export interface GTMStrategy {
  // Executive Summary Section
  executiveSummary: string;
  executiveStats: {
    marketSize: string;
    growthRate: string;
    startingBudget: string;
    recommendedPlatform: string;
  };

  // Growth Opportunity Section (NEW - optional for backwards compatibility)
  growthOpportunity?: {
    insightHeadline: string;
    openingAnalysis: string;
    marketPositioning: string;
    targetAudienceFit: string;
    platformRecommendationRationale: string;
    opportunityStats: {
      marketSize: string;
      growthRate: string;
      cacAdvantage: string;
      recommendedPlatform: string;
    };
    connectionToGoals: string;
  };

  // Business Profile Section (kept for backwards compatibility)
  businessProfile: {
    brandName: string;
    website: string;
    industry: string;
    targetMarket: string;
    businessStage: string;
    budget: string;
    mainChallenges: string[];
    businessGoals: string[];
  };

  // Product Line (optional - only for product businesses)
  productLine?: ProductInfo[];

  // USPs
  usps: USPBox[];

  // Market Opportunity Section
  marketStats: MarketStat[];
  marketAnalysis: {
    marketSize: string;
    growthRate: string;
    keyTrends: string[];
    keyDrivers: Array<{
      title: string;
      description: string;
    }>;
  };

  // Competitive Landscape Section
  competitiveAnalysis: {
    topCompetitors: CompetitorInsight[];
    competitiveAdvantages: string[];
    keyInsights: string[];
  };

  // Competitor Deep Dive (NEW - optional for backwards compatibility)
  competitorDeepDive?: {
    competitors: Array<{
      name: string;
      website: string;
      estimatedMonthlyTraffic: string;
      primaryMarkets: string[];
      trafficTrend: string;
      stage: 'Startup' | 'Growth' | 'Mature';
      trafficSourceBreakdown: {
        direct: number;
        search: number;    // Combined organic + paid search from Similarweb
        social: number;
        referral: number;
        paid: number;      // Display/banner ads, not search ads
      };
      notableObservation: string;
      strengths: string[];
      weaknesses: string[];
      keyTakeaway: string;
    }>;
    overallInsight: string;
    competitiveAdvantages: string[];
    competitivePositioningMap: {
      xAxisLabel: string;
      yAxisLabel: string;
      positions: Array<{
        name: string;
        x: 'low' | 'medium' | 'high';
        y: 'low' | 'medium' | 'high';
        isClient: boolean;
      }>;
      strategicInsight: string;
    };
  };

  // Ideal Customer Profiles Section
  idealCustomerProfiles: ICPPersona[];

  // Geographic Focus
  geographicFocus: {
    primaryMarkets: string;
    keyCities: string;
    incomeLevel: string;
    interests: string;
  };

  // Budget Strategy Section
  budgetStrategy: {
    weeklyBudget: string;
    monthlyBudget: string;
    yearlyBudget: string;
    breakdown: {
      metaAds: { amount: string; percent: number };
      creative: { amount: string; percent: number };
      testing: { amount: string; percent: number };
    };
    phases: BudgetPhase[];
  };

  // Platform Strategy Section
  platformStrategy: {
    platforms: PlatformComparison[];
    recommendedPlatform: 'Meta' | 'TikTok' | 'Google';
    reasoning: string;
    campaignExamples?: CampaignExample[];  // Optional - legacy format
    campaignStructure?: DetailedCampaign[];  // Optional - new format
    creativeRecommendations?: CreativeRecommendation[];  // Optional - new format
    creativeBestPractices?: {  // Optional - legacy format
      imageAds: string[];
      videoAds: string[];
      copyFramework: string[];
    };
  };

  // Success Metrics Section
  kpis: Array<{
    metric: string;
    target: string;
    benchmark: string;
    week1Target?: string;
    week4Target?: string;
    week8Target?: string;
    week12Target?: string;
  }>;

  aovOptimization: Array<{
    strategy: string;
    description: string;
  }>;

  // Risks & Mitigations Section
  risks: RiskItem[];

  // 90-Day Roadmap Section
  roadmap90Day: RoadmapEntry[];

  // Charts
  charts: {
    marketGrowth: ChartData;
    roasProjection: ChartData;
  };

  // A/B Testing Framework (optional)
  abTestingFramework?: {
    tests: ABTest[];
    keyHypotheses: string[];
  };

  // Strategic Insights (optional)
  strategicInsights?: string[];

  // Summary & Next Steps Section
  summaryNextSteps: {
    keyTakeaways: string[];
    immediateActions: string[];
    preLaunchChecklist?: string[];
    callToAction: string;
    recommendedTools?: Array<{
      category: string;
      tool: string;
      costPerMonth: string;
      why: string;
    }>;
  };
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isGTMStrategy(strategy: any): strategy is GTMStrategy {
  return (
    strategy &&
    typeof strategy === 'object' &&
    'executiveStats' in strategy &&
    'idealCustomerProfiles' in strategy &&
    'roadmap90Day' in strategy &&
    'charts' in strategy
  );
}

// ============================================================================
// CONFIGURATION TYPE
// ============================================================================

export type ReportFormat = 'euopho';

export interface ReportGenerationConfig {
  format: ReportFormat;
  modelId: string;
  useRapidAPI: boolean;
}

export const REPORT_CONFIG: ReportGenerationConfig = {
  format: 'euopho',
  modelId: 'claude-opus-4-5-20251101',
  useRapidAPI: false,
};
