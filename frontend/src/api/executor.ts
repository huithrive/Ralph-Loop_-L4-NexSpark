/**
 * Creative Executor API Services
 * API functions for the Executor module
 */

import { apiClient } from './client'
import { APIResponse, Creative } from '@/types'

export const executorAPI = {
  /**
   * Creative Management
   */
  async createCreative(data: {
    type: Creative['type']
    content: Creative['content']
    campaignId?: string
    metadata: Creative['metadata']
  }): Promise<APIResponse<Creative>> {
    return apiClient.post('/api/executor/creatives', data)
  },

  async getCreatives(params?: {
    type?: Creative['type']
    campaignId?: string
    status?: Creative['status']
    limit?: number
    offset?: number
  }): Promise<APIResponse<Creative[]>> {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }
    return apiClient.get(`/api/executor/creatives?${searchParams}`)
  },

  async getCreative(id: string): Promise<APIResponse<Creative>> {
    return apiClient.get(`/api/executor/creatives/${id}`)
  },

  async updateCreative(
    id: string,
    data: Partial<Creative>
  ): Promise<APIResponse<Creative>> {
    return apiClient.put(`/api/executor/creatives/${id}`, data)
  },

  async deleteCreative(id: string): Promise<APIResponse<void>> {
    return apiClient.delete(`/api/executor/creatives/${id}`)
  },

  /**
   * AI Generation
   */
  async generateCreative(data: {
    type: Creative['type']
    prompt: string
    brand?: string
    audience?: string
    objective?: string
    platform?: string[]
    reference?: {
      imageUrl?: string
      style?: string
    }
  }): Promise<APIResponse<Creative>> {
    return apiClient.post('/api/executor/generate', data)
  },

  async generateVariations(
    creativeId: string,
    options: {
      count?: number
      variationType?: 'headline' | 'description' | 'cta' | 'visual'
    }
  ): Promise<APIResponse<Creative[]>> {
    return apiClient.post(`/api/executor/creatives/${creativeId}/variations`, options)
  },

  /**
   * Image/Video Generation
   */
  async generateImage(data: {
    prompt: string
    style?: string
    dimensions?: { width: number; height: number }
    brand?: string
  }): Promise<APIResponse<{ imageUrl: string }>> {
    return apiClient.post('/api/executor/generate/image', data)
  },

  async generateVideo(data: {
    imageUrl: string
    prompt?: string
    duration?: number
  }): Promise<APIResponse<{ videoUrl: string; status: string }>> {
    return apiClient.post('/api/executor/generate/video', data)
  },

  async getVideoStatus(taskId: string): Promise<APIResponse<{
    status: string
    videoUrl?: string
    progress?: number
  }>> {
    return apiClient.get(`/api/executor/generate/video/status/${taskId}`)
  },

  /**
   * Copy Generation
   */
  async generateCopy(data: {
    type: 'headline' | 'description' | 'cta' | 'long_copy'
    context: {
      product?: string
      audience?: string
      objective?: string
      tone?: string
      length?: string
    }
    variations?: number
  }): Promise<APIResponse<{ variations: string[] }>> {
    return apiClient.post('/api/executor/generate/copy', data)
  },

  /**
   * Brand Assets
   */
  async uploadBrandAsset(formData: FormData): Promise<APIResponse<{
    url: string
    type: string
    metadata: any
  }>> {
    return apiClient.upload('/api/executor/brand/upload', formData)
  },

  async getBrandAssets(): Promise<APIResponse<any[]>> {
    return apiClient.get('/api/executor/brand/assets')
  },

  async deleteBrandAsset(assetId: string): Promise<APIResponse<void>> {
    return apiClient.delete(`/api/executor/brand/assets/${assetId}`)
  },

  /**
   * Performance & Analytics
   */
  async getCreativePerformance(creativeId: string): Promise<APIResponse<any>> {
    return apiClient.get(`/api/executor/creatives/${creativeId}/performance`)
  },

  async getTopPerformingCreatives(params?: {
    metric?: string
    timeRange?: string
    limit?: number
  }): Promise<APIResponse<Creative[]>> {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }
    return apiClient.get(`/api/executor/creatives/top-performing?${searchParams}`)
  },

  /**
   * Templates & Library
   */
  async getTemplates(category?: string): Promise<APIResponse<any[]>> {
    const params = category ? `?category=${category}` : ''
    return apiClient.get(`/api/executor/templates${params}`)
  },

  async createFromTemplate(templateId: string, data: any): Promise<APIResponse<Creative>> {
    return apiClient.post(`/api/executor/templates/${templateId}/create`, data)
  },

  /**
   * Health Check
   */
  async healthCheck(): Promise<APIResponse<any>> {
    return apiClient.get('/api/executor/health')
  },
}