/**
 * Type definitions for GTM Agent Report System
 * Single-agent architecture with tool use (web search, RapidAPI)
 */

import type {
  GTMStrategy,
  CompetitorInsight,
  ICPPersona,
  ChartData,
} from './report-formats';

// ============================================================================
// AGENT TOOL TYPES
// ============================================================================

export interface AgentToolDefinition {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, { type: string; description: string }>;
    required: string[];
  };
}

export interface WebSearchToolInput {
  query: string;
}

export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface TrafficDataToolInput {
  domain: string;
}

export interface TrafficDataResult {
  domain: string;
  monthlyVisits: string;
  bounceRate: string;
  pagesPerVisit: string;
  avgVisitDuration: string;
  trafficSources: {
    direct: number;
    search: number;
    social: number;
    referral: number;
    paid: number;
    mail: number;
  };
  topCountries: Array<{ country: string; share: number }>;
  error?: string;
}

export interface ToolResult {
  toolName: string;
  input: TrafficDataToolInput;
  output: TrafficDataResult;
  timestamp: string;
}

// ============================================================================
// SEO ANALYSIS TYPES (New from Expert Prompt)
// ============================================================================

export interface KeywordOpportunity {
  keyword: string;
  monthlySearches: string;
  cpcUS: string;
  competition: 'Low' | 'Medium' | 'High';
  priority: 'High' | 'Medium' | 'Low';
}

export interface ContentGap {
  topic: string;
  competitorRanking: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  contentTypeNeeded: string;
}

export interface SEOAnalysis {
  brandKeywordAnalysis: {
    searchQuery: string;
    yourSitePosition: number;
    competitorAdsOnBrand: boolean;
    competitorsRunningAds: string[];
    recommendation: string;
  };
  categoryKeywords: KeywordOpportunity[];
  contentGapAnalysis: ContentGap[];
  quickWinRecommendations: string[];
  footnotes: string[];
}

// ============================================================================
// GEOGRAPHIC OPPORTUNITY TYPES (New from Expert Prompt)
// ============================================================================

export interface StateOpportunity {
  rank: number;
  state: string;
  reason: string;
  cpmSavings: string;
}

export interface StateToAvoid {
  state: string;
  reason: string;
  whenToRevisit: string;
}

export interface MarketTier {
  tier: 1 | 2 | 3;
  name: string;
  countries: Array<{
    country: string;
    reason?: string;
  }>;
}

export interface GeographicOpportunityAnalysis {
  // For D2C/E-commerce (US-focused)
  topStatesForLaunch?: StateOpportunity[];
  statesToAvoid?: StateToAvoid[];

  // For SaaS/Digital (Global)
  marketTiers?: MarketTier[];
  costComparisonTable?: Array<{
    market: string;
    estCPC: string;
    estCPM: string;
    language: string;
    recommendation: string;
  }>;

  regionalRestrictions: string[];
  footnotes: string[];
}

// ============================================================================
// ENHANCED ICP WITH VALIDATION PLAN (from Expert Prompt)
// ============================================================================

export interface ICPValidationPlan {
  audienceTests: string[];
  successMetrics: string[];
}

export interface EnhancedICPPersona extends ICPPersona {
  onlineBehavior?: {
    platforms: string[];
    searchTerms: string[];
    contentConsumption: string[];
  };
  buyingTrigger?: string;
}

// ============================================================================
// WEBSITE ANALYSIS (NEW from Expert Prompt)
// ============================================================================

// ============================================================================
// GROWTH OPPORTUNITY (NEW)
// ============================================================================

export interface GrowthOpportunity {
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
}

// ============================================================================
// COMPETITOR DEEP DIVE (NEW)
// ============================================================================

export interface CompetitorDeepDiveItem {
  name: string;
  website: string;
  estimatedMonthlyTraffic: string;
  primaryMarkets: string[];
  trafficTrend: string;
  stage: 'Startup' | 'Growth' | 'Mature';
  trafficSourceBreakdown: {
    direct: number;
    search: number;
    social: number;
    referral: number;
    paid: number;
    mail: number;
  };
  notableObservation: string;
  strengths: string[];
  weaknesses: string[];
  keyTakeaway: string;
}

export interface CompetitorDeepDive {
  competitors: CompetitorDeepDiveItem[];
  overallInsight: string;
  competitiveAdvantages: string[];
  competitivePositioningMap: CompetitivePositioningMap;
}

// ============================================================================
// COMPETITIVE POSITIONING MAP (NEW from Expert Prompt)
// ============================================================================

export interface CompetitivePositioningMap {
  xAxisLabel: string;
  yAxisLabel: string;
  positions: Array<{
    name: string;
    x: 'low' | 'medium' | 'high';
    y: 'low' | 'medium' | 'high';
    isClient: boolean;
  }>;
  strategicInsight: string;
}

// ============================================================================
// EMAIL & INFLUENCER STRATEGY (NEW from Expert Prompt)
// ============================================================================

export interface EmailMarketingSetup {
  platform: string;
  welcomeSequence: string;
  abandonedCart: string;
  postPurchase?: string;
  listGrowth?: string;
}

export interface EmailSequenceFramework {
  welcomeSequence: Array<{ day: number; subject: string }>;
  abandonedCartSequence: Array<{ timing: string; purpose: string }>;
}

export interface InfluencerStrategy {
  platformFocus: string;
  creatorTier: string;
  monthlyOutreach: number;
  compensation: string;
  weeklyFramework: string[];
}

export interface VideoContentItem {
  type: string;
  quantityPerMonth: number;
  platform: string;
  purpose: string;
}

export interface RecommendedTool {
  category: string;
  tool: string;
  costPerMonth: string;
  why: string;
}

// ============================================================================
// BUDGET & PERFORMANCE FRAMEWORK (COMBINED)
// ============================================================================

export interface BudgetAndPerformance {
  budget: {
    weeklyBudget: string;
    monthlyBudget: string;
    yearlyBudget: string;
    breakdown: {
      metaAds: { amount: string; percent: number };
      creative: { amount: string; percent: number };
      testing: { amount: string; percent: number };
    };
    monthOneAllocation?: Array<{
      channel: string;
      amount: string;
      percentage: string;
    }>;
  };
  scalingRules: {
    scaleTriggers: string[];
    safetyRules: string[];
    pauseTriggers: string[];
  };
  kpis: Array<{
    metric: string;
    target?: string;
    benchmark?: string;
    month1_2?: string;
    month3_4?: string;
    month5_6?: string;
    week1Target?: string;
    week4Target?: string;
    week8Target?: string;
    week12Target?: string;
    howToCalculate?: string;
  }>;
  aovOptimization: Array<{
    strategy: string;
    description: string;
  }>;
  industryBenchmarks?: Array<{
    category: string;
    metric: string;
    value: string;
  }>;
  budgetPhases: Array<{
    phaseNumber: number;
    title: string;
    duration: string;
    activities: string[];
  }>;
  footnotes?: string[];
}

// ============================================================================
// NEXT STEPS & RESOURCES (IMPROVED)
// ============================================================================

export interface NextStepsAndResources {
  immediateActions: Array<{
    task: string;
    whyItMatters: string;
    timeEstimate: string;
  }>;
  preLaunchChecklist: Array<{
    item: string;
    description: string;
  }>;
  recommendedTools: RecommendedTool[];
  learningResources?: Array<{
    title: string;
    format: string;
    why: string;
  }>;
  keyTakeaways: string[];
  readyToAccelerate?: {
    description: string;
    nextStep: string;
    contactInfo: string;
  };
  footnotes?: string[];
}

// ============================================================================
// SIX-MONTH ROADMAP TYPES (from Expert Prompt)
// ============================================================================

export interface SixMonthPhase {
  phaseNumber: 1 | 2 | 3;
  name: string;
  months: string;
  goal: string;
  primaryFocus: string;
  successMetrics: string[];
  keyMilestone: string;

  // Phase 1 specific fields
  metaAdsStrategy?: {
    weeklyBudget: string;
    campaignObjective: string;
    audienceTests: string;
    adFormat: string;
    creativeTests: string;
  };
  googleAdsStrategy?: {
    weeklyBudget: string;
    campaignTypes: string;
    keywordFocus: string;
    geographicTarget: string;
  };
  weeklyBudgetBreakdown?: Array<{
    channel: string;
    week1_2: string;
    week3_4: string;
    week5_6?: string;
    week7_8?: string;
  }>;
  safetyRule?: string;

  // Phase 2 specific fields
  emailMarketingSetup?: EmailMarketingSetup;
  emailSequenceFramework?: EmailSequenceFramework;
  seoImplementation?: {
    month3?: { technicalAudit: string; contentPublished: string; keywordsTargeted: string; linkBuilding: string };
    month4?: { technicalAudit: string; contentPublished: string; keywordsTargeted: string; linkBuilding: string };
  };
  continuedPaidAds?: string[];

  // Phase 3 specific fields
  influencerMarketing?: {
    platformFocus: string;
    creatorTier: string;
    monthlyOutreach: string;
    compensation: string;
    contentRights: string;
  };
  influencerOutreachFramework?: string[];
  videoContentStrategy?: Array<{
    contentType: string;
    quantityPerMonth: string;
    platform: string;
    purpose: string;
  }>;
  socialMediaOrganic?: {
    priorityPlatforms: string;
    postingCadence: string;
    contentPillars: string[];
    engagementTarget: string;
  };

  // Legacy/deprecated fields (keep for backward compatibility)
  activities?: {
    channel: string;
    recommendations: Array<{
      element: string;
      recommendation: string;
    }>;
  }[];
  weeklyBudget?: Array<{
    channel: string;
    weeks12: string;
    weeks34: string;
    weeks56?: string;
    weeks78?: string;
  }>;
  influencerStrategy?: InfluencerStrategy;
}

export interface SixMonthRoadmap {
  phases: SixMonthPhase[];
  budgetScalingRules: {
    scaleTriggers: string[];
    safetyRules: string[];
    pauseTriggers: string[];
  };
}

// ============================================================================
// MAIN GTM AGENT REPORT INTERFACE
// ============================================================================

export interface GTMAgentReport extends GTMStrategy {
  // New sections from Expert Prompt
  seoAnalysis?: SEOAnalysis;
  geographicOpportunityAnalysis?: GeographicOpportunityAnalysis;

  // Competitive positioning map (NEW from Expert Prompt)
  competitivePositioningMap?: CompetitivePositioningMap;

  // Enhanced ICP with validation
  icpValidationPlan?: ICPValidationPlan;

  // Budget & Performance Framework (COMBINED)
  budgetAndPerformance?: BudgetAndPerformance;

  // Six-month roadmap overview (in addition to 90-day)
  sixMonthRoadmap?: SixMonthRoadmap;

  // Next Steps & Resources (IMPROVED)
  nextStepsAndResources?: NextStepsAndResources;

  // Section footnotes (jargon explanations)
  sectionFootnotes?: Record<string, string[]>;
}

// ============================================================================
// AGENT REPORT DATABASE RECORD
// ============================================================================

export interface AgentReportRecord {
  id: string;
  interview_id: string;
  user_id: string;
  status: 'PENDING' | 'GENERATING' | 'READY' | 'FAILED';
  progress: number;
  error?: string;
  gtm_report?: string;
  html_report?: string;
  brand_name?: string;
  web_searches_count: number;
  rapidapi_calls_count: number;
  tool_results?: string;
  thinking_log?: string;
  total_input_tokens: number;
  total_output_tokens: number;
  total_cost_cents: number;
  model_id?: string;
  generation_time_seconds?: number;
  created_at: string;
  generation_started_at?: string;
  generation_completed_at?: string;
}

// ============================================================================
// AGENT GENERATION STATE
// ============================================================================

export interface AgentGenerationState {
  reportId: string;
  interviewId: string;
  userId: string;
  status: 'PENDING' | 'GENERATING' | 'READY' | 'FAILED';
  progress: number;
  toolResults: ToolResult[];
  webSearchesCount: number;
  rapidApiCallsCount: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  startTime: number;
  error?: string;
}

// ============================================================================
// THINKING LOG & WEBSOCKET TYPES
// ============================================================================

export interface ThinkingLogEntry {
  timestamp: string;
  type: 'tool_start' | 'tool_result' | 'progress' | 'thinking';
  toolName?: string;
  input?: { query?: string; domain?: string };
  output?: { resultCount?: number; visits?: string; error?: string };
  message?: string;
  progress?: number;
}

export interface WebSocketMessage {
  type: 'init' | 'thinking_log' | 'progress' | 'complete' | 'error';
  data:
    | { reportId: string; status: string; progress: number; thinkingLog: ThinkingLogEntry[] }
    | ThinkingLogEntry
    | { progress: number }
    | { reportId: string }
    | { error: string };
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isGTMAgentReport(report: unknown): report is GTMAgentReport {
  return (
    report !== null &&
    typeof report === 'object' &&
    'executiveStats' in report &&
    'idealCustomerProfiles' in report &&
    'roadmap90Day' in report
  );
}

export function hasSEOAnalysis(
  report: GTMAgentReport
): report is GTMAgentReport & { seoAnalysis: SEOAnalysis } {
  return report.seoAnalysis !== undefined;
}

export function hasGeographicAnalysis(
  report: GTMAgentReport
): report is GTMAgentReport & {
  geographicOpportunityAnalysis: GeographicOpportunityAnalysis;
} {
  return report.geographicOpportunityAnalysis !== undefined;
}
