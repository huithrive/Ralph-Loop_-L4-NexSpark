/**
 * Advertiser API Services
 * API functions for the Meta & Google Ads module
 */

import { apiClient } from './client'
import { APIResponse, Campaign } from '@/types'

export const advertiserAPI = {
  /**
   * Campaign Management
   */
  async createCampaign(data: {
    name: string
    objective: Campaign['objective']
    platform: Campaign['platform']
    budget: Campaign['budget']
    targeting: Campaign['targeting']
    creatives: string[]
    schedule: Campaign['schedule']
    metadata?: Campaign['metadata']
  }): Promise<APIResponse<Campaign>> {
    return apiClient.post('/api/advertiser/campaigns', data)
  },

  async getCampaigns(params?: {
    status?: Campaign['status']
    platform?: string
    limit?: number
    offset?: number
  }): Promise<APIResponse<Campaign[]>> {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }
    return apiClient.get(`/api/advertiser/campaigns?${searchParams}`)
  },

  async getCampaign(id: string): Promise<APIResponse<Campaign>> {
    return apiClient.get(`/api/advertiser/campaigns/${id}`)
  },

  async updateCampaign(
    id: string,
    data: Partial<Campaign>
  ): Promise<APIResponse<Campaign>> {
    return apiClient.put(`/api/advertiser/campaigns/${id}`, data)
  },

  async deleteCampaign(id: string): Promise<APIResponse<void>> {
    return apiClient.delete(`/api/advertiser/campaigns/${id}`)
  },

  /**
   * Campaign Control
   */
  async pauseCampaign(id: string): Promise<APIResponse<Campaign>> {
    return apiClient.post(`/api/advertiser/campaigns/${id}/pause`)
  },

  async resumeCampaign(id: string): Promise<APIResponse<Campaign>> {
    return apiClient.post(`/api/advertiser/campaigns/${id}/resume`)
  },

  async duplicateCampaign(
    id: string,
    name: string
  ): Promise<APIResponse<Campaign>> {
    return apiClient.post(`/api/advertiser/campaigns/${id}/duplicate`, { name })
  },

  /**
   * Meta Ads (Facebook/Instagram)
   */
  async connectMetaAccount(accessToken: string): Promise<APIResponse<any>> {
    return apiClient.post('/api/advertiser/meta/connect', { accessToken })
  },

  async getMetaBusinessManagers(): Promise<APIResponse<any[]>> {
    return apiClient.get('/api/advertiser/meta/business-managers')
  },

  async getMetaAdAccounts(businessManagerId: string): Promise<APIResponse<any[]>> {
    return apiClient.get(`/api/advertiser/meta/business-managers/${businessManagerId}/ad-accounts`)
  },

  async createMetaCampaign(
    adAccountId: string,
    campaignData: any
  ): Promise<APIResponse<any>> {
    return apiClient.post(`/api/advertiser/meta/ad-accounts/${adAccountId}/campaigns`, campaignData)
  },

  async getMetaCampaignPerformance(campaignId: string): Promise<APIResponse<any>> {
    return apiClient.get(`/api/advertiser/meta/campaigns/${campaignId}/performance`)
  },

  /**
   * Google Ads
   */
  async connectGoogleAdsAccount(refreshToken: string): Promise<APIResponse<any>> {
    return apiClient.post('/api/advertiser/google/connect', { refreshToken })
  },

  async getGoogleAdsCustomers(): Promise<APIResponse<any[]>> {
    return apiClient.get('/api/advertiser/google/customers')
  },

  async createGoogleAdsCampaign(
    customerId: string,
    campaignData: any
  ): Promise<APIResponse<any>> {
    return apiClient.post(`/api/advertiser/google/customers/${customerId}/campaigns`, campaignData)
  },

  async getGoogleCampaignPerformance(campaignId: string): Promise<APIResponse<any>> {
    return apiClient.get(`/api/advertiser/google/campaigns/${campaignId}/performance`)
  },

  /**
   * Pixel Management
   */
  async installMetaPixel(data: {
    storeUrl: string
    accessToken: string
    pixelId: string
  }): Promise<APIResponse<any>> {
    return apiClient.post('/api/advertiser/pixel/install', data)
  },

  async verifyPixelInstallation(data: {
    storeUrl: string
    pixelId: string
  }): Promise<APIResponse<any>> {
    return apiClient.post('/api/advertiser/pixel/verify', data)
  },

  async uninstallPixel(data: {
    storeUrl: string
    pixelId: string
  }): Promise<APIResponse<any>> {
    return apiClient.post('/api/advertiser/pixel/uninstall', data)
  },

  /**
   * Audience Management
   */
  async createCustomAudience(data: {
    name: string
    description: string
    type: string
    source: any
    platform: string
  }): Promise<APIResponse<any>> {
    return apiClient.post('/api/advertiser/audiences/custom', data)
  },

  async createLookalikeAudience(data: {
    name: string
    sourceAudienceId: string
    targetCountries: string[]
    audienceSize: number
    platform: string
  }): Promise<APIResponse<any>> {
    return apiClient.post('/api/advertiser/audiences/lookalike', data)
  },

  async getAudiences(platform?: string): Promise<APIResponse<any[]>> {
    const params = platform ? `?platform=${platform}` : ''
    return apiClient.get(`/api/advertiser/audiences${params}`)
  },

  /**
   * Performance & Analytics
   */
  async getCampaignInsights(
    campaignId: string,
    params?: {
      startDate?: string
      endDate?: string
      metrics?: string[]
      breakdowns?: string[]
    }
  ): Promise<APIResponse<any>> {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, v))
          } else {
            searchParams.append(key, value.toString())
          }
        }
      })
    }
    return apiClient.get(`/api/advertiser/campaigns/${campaignId}/insights?${searchParams}`)
  },

  async getAccountPerformance(
    platform: string,
    accountId: string
  ): Promise<APIResponse<any>> {
    return apiClient.get(`/api/advertiser/${platform}/accounts/${accountId}/performance`)
  },

  /**
   * Optimization
   */
  async getOptimizationRecommendations(campaignId: string): Promise<APIResponse<any>> {
    return apiClient.get(`/api/advertiser/campaigns/${campaignId}/optimize`)
  },

  async applyOptimization(
    campaignId: string,
    optimizationId: string
  ): Promise<APIResponse<any>> {
    return apiClient.post(`/api/advertiser/campaigns/${campaignId}/optimize/${optimizationId}`)
  },

  /**
   * Bulk Operations
   */
  async bulkUpdateCampaigns(
    campaignIds: string[],
    updates: Partial<Campaign>
  ): Promise<APIResponse<Campaign[]>> {
    return apiClient.post('/api/advertiser/campaigns/bulk-update', {
      campaignIds,
      updates
    })
  },

  async exportCampaigns(
    params?: {
      startDate?: string
      endDate?: string
      format?: 'csv' | 'xlsx'
    }
  ): Promise<APIResponse<{ downloadUrl: string }>> {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }
    return apiClient.get(`/api/advertiser/campaigns/export?${searchParams}`)
  },

  /**
   * Health Check
   */
  async healthCheck(): Promise<APIResponse<any>> {
    return apiClient.get('/api/advertiser/health')
  },
}