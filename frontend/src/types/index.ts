/**
 * NexSpark AI Growth OS - Type Definitions
 * Common TypeScript interfaces and types for the frontend application
 */

export type ModuleId = 'dashboard' | 'strategist' | 'executor' | 'advertiser' | 'analyzer'

export type ModuleStatus = 'available' | 'in_progress' | 'completed' | 'locked'

export interface Module {
  id: ModuleId
  title: string
  description: string
  features: string[]
  status: ModuleStatus
  progress: number
  path: string
}

export interface ModuleProgress {
  moduleId: ModuleId
  percentage: number
  currentStep?: string
  totalSteps?: number
}

export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp?: string
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  preferences?: UserPreferences
}

export interface UserPreferences {
  theme: 'light' | 'dark'
  notifications: boolean
  autoSave: boolean
  defaultModule: ModuleId
}

// GTM Strategist Module Types
export interface ResearchProject {
  id: string
  name: string
  description: string
  businessUrl: string
  status: 'draft' | 'in_progress' | 'completed'
  createdAt: string
  updatedAt: string
}

export interface InterviewSession {
  id: string
  researchId: string
  status: 'pending' | 'in_progress' | 'completed'
  responses: InterviewResponse[]
  createdAt: string
}

export interface InterviewResponse {
  questionId: string
  question: string
  answer: string
  timestamp: string
}

export interface GTMReport {
  id: string
  researchId: string
  executiveSummary: ExecutiveSummary
  marketAnalysis: MarketAnalysis
  competitorAnalysis: CompetitorAnalysis
  targetCustomers: TargetCustomer[]
  marketingStrategy: MarketingStrategy
  metadata: ReportMetadata
}

export interface ExecutiveSummary {
  marketOpportunity: string
  targetCustomer: string
  uniqueValue: string
  recommendedStrategy: string
}

export interface MarketAnalysis {
  marketSize: {
    tam: string // Total Addressable Market
    sam: string // Serviceable Addressable Market
    som: string // Serviceable Obtainable Market
  }
  growthRate: string
  keyTrends: string[]
  challenges: string[]
  opportunities: string[]
}

export interface CompetitorAnalysis {
  directCompetitors: Competitor[]
  indirectCompetitors: Competitor[]
  competitiveAdvantages: string[]
  threats: string[]
}

export interface Competitor {
  name: string
  website: string
  positioning: string
  strengths: string[]
  weaknesses: string[]
  marketShare?: string
}

export interface TargetCustomer {
  segment: string
  demographics: Record<string, any>
  psychographics: Record<string, any>
  painPoints: string[]
  motivations: string[]
  channels: string[]
}

export interface MarketingStrategy {
  positioning: string
  channels: MarketingChannel[]
  messaging: Record<string, string>
  timeline: string[]
  budget: Record<string, number>
}

export interface MarketingChannel {
  name: string
  priority: 'high' | 'medium' | 'low'
  budget: number
  expectedROI: string
  timeline: string
  rationale: string
}

export interface ReportMetadata {
  generatedAt: string
  researchId: string
  interviewSessionId?: string
  confidenceScore: number
  validation: {
    qualityScore: number
    isValid: boolean
  }
  generationTime: number
}

// Creative Executor Module Types
export interface Creative {
  id: string
  campaignId?: string
  type: 'image' | 'video' | 'copy' | 'carousel'
  content: CreativeContent
  performance?: CreativePerformance
  status: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'active'
  metadata: CreativeMetadata
  createdAt: string
  updatedAt: string
}

export interface CreativeContent {
  headline?: string
  description?: string
  callToAction?: string
  imageUrl?: string
  videoUrl?: string
  copyText?: string
  tags?: string[]
}

export interface CreativePerformance {
  impressions: number
  clicks: number
  conversions: number
  ctr: number // Click-through rate
  cvr: number // Conversion rate
  cost: number
  revenue?: number
}

export interface CreativeMetadata {
  generatedBy: 'ai' | 'user'
  brand: string
  audience: string
  objective: string
  platform: string[]
  dimensions?: {
    width: number
    height: number
  }
}

// Advertiser Module Types
export interface Campaign {
  id: string
  name: string
  objective: CampaignObjective
  platform: Platform[]
  budget: CampaignBudget
  targeting: CampaignTargeting
  creatives: string[] // Creative IDs
  status: CampaignStatus
  performance?: CampaignPerformance
  schedule: CampaignSchedule
  metadata: CampaignMetadata
  createdAt: string
  updatedAt: string
}

export type CampaignObjective =
  | 'awareness'
  | 'traffic'
  | 'engagement'
  | 'leads'
  | 'sales'
  | 'app_installs'

export type Platform = 'meta' | 'google_ads' | 'tiktok' | 'linkedin' | 'twitter'

export interface CampaignBudget {
  type: 'daily' | 'lifetime'
  amount: number
  currency: string
  bidStrategy: 'manual' | 'automatic' | 'target_cpa' | 'target_roas'
}

export interface CampaignTargeting {
  demographics: {
    ageMin?: number
    ageMax?: number
    gender?: 'male' | 'female' | 'all'
  }
  geography: {
    countries?: string[]
    regions?: string[]
    cities?: string[]
    radius?: number
  }
  interests: string[]
  behaviors: string[]
  customAudiences?: string[]
  lookalikes?: string[]
}

export type CampaignStatus = 'draft' | 'pending' | 'active' | 'paused' | 'completed' | 'cancelled'

export interface CampaignPerformance {
  impressions: number
  clicks: number
  conversions: number
  spend: number
  revenue?: number
  ctr: number
  cvr: number
  cpm: number // Cost per mille
  cpc: number // Cost per click
  cpa?: number // Cost per acquisition
  roas?: number // Return on ad spend
}

export interface CampaignSchedule {
  startDate: string
  endDate?: string
  timezone: string
  dayParting?: {
    [day: string]: { start: string; end: string }[]
  }
}

export interface CampaignMetadata {
  createdBy: string
  source: 'manual' | 'ai_generated'
  tags: string[]
  notes?: string
}

// Analyzer Module Types
export interface AnalyticsData {
  timeRange: {
    start: string
    end: string
  }
  metrics: AnalyticsMetrics
  breakdowns: AnalyticsBreakdown[]
  insights: AnalyticsInsight[]
}

export interface AnalyticsMetrics {
  impressions: MetricValue
  clicks: MetricValue
  conversions: MetricValue
  spend: MetricValue
  revenue?: MetricValue
  ctr: MetricValue
  cvr: MetricValue
  roas?: MetricValue
}

export interface MetricValue {
  current: number
  previous?: number
  change?: number
  changePercent?: number
  trend: 'up' | 'down' | 'stable'
}

export interface AnalyticsBreakdown {
  dimension: string
  values: { [key: string]: number }
}

export interface AnalyticsInsight {
  id: string
  type: 'opportunity' | 'issue' | 'trend' | 'recommendation'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  confidence: number
  actionItems?: string[]
  dataPoints?: Record<string, any>
}