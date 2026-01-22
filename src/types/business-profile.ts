/**
 * Business profile types
 */

export interface BusinessProfile {
  brandName: string;
  website?: string;
  industry: string;
  currentStage: string;
  targetMarket: string;
  mainChallenges: string[];
  productDescription?: string;
  currentRevenue?: string;
  marketingBudget?: string;
  marketingChannels?: string[];
  bestPerformingChannel?: string;
  idealCustomer?: string;
  competitors?: string[];
  goals?: string;
}

export interface CompetitorInsight {
  name: string;
  website?: string;
  strengths?: string[];
  weaknesses?: string[];
  differentiators?: string[];
}

export interface MarketResearch {
  competitors: CompetitorInsight[];
  marketSize?: string;
  trends?: string[];
  opportunities?: string[];
}
