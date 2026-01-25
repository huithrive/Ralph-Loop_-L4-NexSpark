/**
 * Performance Analyzer API Services
 * API functions for the Analyzer module
 */

import { apiClient } from './client'
import { APIResponse, AnalyticsData } from '@/types'

export const analyzerAPI = {
  /**
   * Analytics Data
   */
  async getAnalytics(params: {
    startDate: string
    endDate: string
    metrics?: string[]
    breakdowns?: string[]
    campaigns?: string[]
    platforms?: string[]
  }): Promise<APIResponse<AnalyticsData>> {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v))
        } else {
          searchParams.append(key, value.toString())
        }
      }
    })
    return apiClient.get(`/api/analyzer/analytics?${searchParams}`)
  },

  async getRealTimeMetrics(): Promise<APIResponse<any>> {
    return apiClient.get('/api/analyzer/real-time')
  },

  async getMetricHistory(
    metric: string,
    timeRange: string
  ): Promise<APIResponse<any>> {
    return apiClient.get(`/api/analyzer/metrics/${metric}/history?timeRange=${timeRange}`)
  },

  /**
   * Performance Tracking
   */
  async getCampaignPerformance(
    campaignId: string,
    timeRange?: string
  ): Promise<APIResponse<any>> {
    const params = timeRange ? `?timeRange=${timeRange}` : ''
    return apiClient.get(`/api/analyzer/campaigns/${campaignId}/performance${params}`)
  },

  async getCreativePerformance(
    creativeId: string,
    timeRange?: string
  ): Promise<APIResponse<any>> {
    const params = timeRange ? `?timeRange=${timeRange}` : ''
    return apiClient.get(`/api/analyzer/creatives/${creativeId}/performance${params}`)
  },

  async getAudiencePerformance(
    audienceId: string,
    timeRange?: string
  ): Promise<APIResponse<any>> {
    const params = timeRange ? `?timeRange=${timeRange}` : ''
    return apiClient.get(`/api/analyzer/audiences/${audienceId}/performance${params}`)
  },

  /**
   * Comparative Analysis
   */
  async compareCampaigns(
    campaignIds: string[],
    metrics: string[],
    timeRange: string
  ): Promise<APIResponse<any>> {
    return apiClient.post('/api/analyzer/compare/campaigns', {
      campaignIds,
      metrics,
      timeRange
    })
  },

  async compareCreatives(
    creativeIds: string[],
    metrics: string[],
    timeRange: string
  ): Promise<APIResponse<any>> {
    return apiClient.post('/api/analyzer/compare/creatives', {
      creativeIds,
      metrics,
      timeRange
    })
  },

  async comparePlatforms(
    platforms: string[],
    metrics: string[],
    timeRange: string
  ): Promise<APIResponse<any>> {
    return apiClient.post('/api/analyzer/compare/platforms', {
      platforms,
      metrics,
      timeRange
    })
  },

  /**
   * AI Insights & Recommendations
   */
  async getInsights(params?: {
    type?: string[]
    impact?: string[]
    confidence?: number
    limit?: number
  }): Promise<APIResponse<any[]>> {
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
    return apiClient.get(`/api/analyzer/insights?${searchParams}`)
  },

  async getOptimizationRecommendations(
    entityType: 'campaign' | 'creative' | 'audience',
    entityId: string
  ): Promise<APIResponse<any[]>> {
    return apiClient.get(`/api/analyzer/${entityType}s/${entityId}/recommendations`)
  },

  async generateCustomInsight(data: {
    question: string
    context: {
      campaigns?: string[]
      timeRange: string
      metrics?: string[]
    }
  }): Promise<APIResponse<any>> {
    return apiClient.post('/api/analyzer/insights/custom', data)
  },

  /**
   * Forecasting & Predictions
   */
  async getForecast(data: {
    metric: string
    entity: { type: string; id: string }
    horizon: number // days
    confidence?: number
  }): Promise<APIResponse<any>> {
    return apiClient.post('/api/analyzer/forecast', data)
  },

  async getSeasonalityAnalysis(
    metric: string,
    timeRange: string
  ): Promise<APIResponse<any>> {
    return apiClient.get(`/api/analyzer/seasonality?metric=${metric}&timeRange=${timeRange}`)
  },

  async getTrendAnalysis(
    metric: string,
    entities: Array<{ type: string; id: string }>
  ): Promise<APIResponse<any>> {
    return apiClient.post('/api/analyzer/trends', { metric, entities })
  },

  /**
   * Custom Reports
   */
  async createCustomReport(data: {
    name: string
    description?: string
    metrics: string[]
    breakdowns: string[]
    filters: Record<string, any>
    schedule?: {
      frequency: 'daily' | 'weekly' | 'monthly'
      recipients: string[]
    }
  }): Promise<APIResponse<any>> {
    return apiClient.post('/api/analyzer/reports/custom', data)
  },

  async getCustomReports(): Promise<APIResponse<any[]>> {
    return apiClient.get('/api/analyzer/reports/custom')
  },

  async generateReport(reportId: string): Promise<APIResponse<any>> {
    return apiClient.post(`/api/analyzer/reports/${reportId}/generate`)
  },

  async scheduleReport(
    reportId: string,
    schedule: {
      frequency: 'daily' | 'weekly' | 'monthly'
      recipients: string[]
      enabled: boolean
    }
  ): Promise<APIResponse<any>> {
    return apiClient.put(`/api/analyzer/reports/${reportId}/schedule`, schedule)
  },

  /**
   * Data Export
   */
  async exportData(data: {
    type: 'analytics' | 'performance' | 'insights'
    format: 'csv' | 'xlsx' | 'pdf'
    filters: Record<string, any>
    timeRange: string
  }): Promise<APIResponse<{ downloadUrl: string }>> {
    return apiClient.post('/api/analyzer/export', data)
  },

  async getExportHistory(): Promise<APIResponse<any[]>> {
    return apiClient.get('/api/analyzer/exports')
  },

  /**
   * Alerts & Monitoring
   */
  async createAlert(data: {
    name: string
    description?: string
    metric: string
    condition: {
      operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte'
      value: number
      threshold: number
    }
    entity: { type: string; id: string }
    notifications: {
      email?: string[]
      webhook?: string
    }
  }): Promise<APIResponse<any>> {
    return apiClient.post('/api/analyzer/alerts', data)
  },

  async getAlerts(active?: boolean): Promise<APIResponse<any[]>> {
    const params = active !== undefined ? `?active=${active}` : ''
    return apiClient.get(`/api/analyzer/alerts${params}`)
  },

  async updateAlert(alertId: string, data: any): Promise<APIResponse<any>> {
    return apiClient.put(`/api/analyzer/alerts/${alertId}`, data)
  },

  async deleteAlert(alertId: string): Promise<APIResponse<void>> {
    return apiClient.delete(`/api/analyzer/alerts/${alertId}`)
  },

  /**
   * Anomaly Detection
   */
  async getAnomalies(params?: {
    timeRange?: string
    sensitivity?: 'low' | 'medium' | 'high'
    entities?: string[]
  }): Promise<APIResponse<any[]>> {
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
    return apiClient.get(`/api/analyzer/anomalies?${searchParams}`)
  },

  async investigateAnomaly(anomalyId: string): Promise<APIResponse<any>> {
    return apiClient.get(`/api/analyzer/anomalies/${anomalyId}/investigate`)
  },

  /**
   * Health Check
   */
  async healthCheck(): Promise<APIResponse<any>> {
    return apiClient.get('/api/analyzer/health')
  },
}