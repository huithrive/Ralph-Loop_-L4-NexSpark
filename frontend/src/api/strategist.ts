/**
 * GTM Strategist API Services
 * API functions for the Strategist module
 */

import { apiClient } from './client'
import { APIResponse, ResearchProject, InterviewSession, GTMReport } from '../types'

export const strategistAPI = {
  /**
   * Research Management
   */
  async createResearch(data: {
    name: string
    description: string
    businessUrl: string
  }): Promise<APIResponse<ResearchProject>> {
    return apiClient.post('/api/strategist/research', data)
  },

  async getResearchList(): Promise<APIResponse<ResearchProject[]>> {
    return apiClient.get('/api/strategist/research')
  },

  async getResearch(id: string): Promise<APIResponse<ResearchProject>> {
    return apiClient.get(`/api/strategist/research/${id}`)
  },

  async updateResearch(
    id: string,
    data: Partial<ResearchProject>
  ): Promise<APIResponse<ResearchProject>> {
    return apiClient.put(`/api/strategist/research/${id}`, data)
  },

  async deleteResearch(id: string): Promise<APIResponse<void>> {
    return apiClient.delete(`/api/strategist/research/${id}`)
  },

  /**
   * Business Analysis
   */
  async analyzeWebsite(url: string): Promise<APIResponse<any>> {
    return apiClient.post('/api/strategist/analyze/website', { url })
  },

  async getBusinessInsights(researchId: string): Promise<APIResponse<any>> {
    return apiClient.get(`/api/strategist/analyze/insights/${researchId}`)
  },

  /**
   * Competitor Analysis
   */
  async analyzeCompetitors(researchId: string): Promise<APIResponse<any>> {
    return apiClient.post(`/api/strategist/competitors/${researchId}/analyze`)
  },

  async getCompetitorAnalysis(researchId: string): Promise<APIResponse<any>> {
    return apiClient.get(`/api/strategist/competitors/${researchId}`)
  },

  /**
   * Interview Management
   */
  async createInterviewSession(researchId: string): Promise<APIResponse<InterviewSession>> {
    return apiClient.post('/api/strategist/interviews', { researchId })
  },

  async getInterviewSession(sessionId: string): Promise<APIResponse<InterviewSession>> {
    return apiClient.get(`/api/strategist/interviews/${sessionId}`)
  },

  async submitInterviewResponse(
    sessionId: string,
    questionId: string,
    answer: string
  ): Promise<APIResponse<void>> {
    return apiClient.post(`/api/strategist/interviews/${sessionId}/responses`, {
      questionId,
      answer,
    })
  },

  async completeInterview(sessionId: string): Promise<APIResponse<any>> {
    return apiClient.post(`/api/strategist/interviews/${sessionId}/complete`)
  },

  /**
   * Report Generation
   */
  async generateReport(
    researchId: string,
    interviewSessionId?: string,
    options?: {
      generateBySections?: boolean
      autoImprove?: boolean
      qualityThreshold?: number
    }
  ): Promise<APIResponse<GTMReport>> {
    return apiClient.post('/api/strategist/reports/generate', {
      researchId,
      interviewSessionId,
      options,
    })
  },

  async getReportPreview(
    researchId: string,
    interviewSessionId?: string
  ): Promise<APIResponse<any>> {
    return apiClient.post('/api/strategist/reports/preview', {
      researchId,
      interviewSessionId,
    })
  },

  async validateInputs(
    researchId: string,
    interviewSessionId?: string
  ): Promise<APIResponse<any>> {
    return apiClient.post('/api/strategist/reports/validate-inputs', {
      researchId,
      interviewSessionId,
    })
  },

  async getReportOptions(): Promise<APIResponse<any>> {
    return apiClient.get('/api/strategist/reports/options')
  },

  async getDataSynthesis(
    researchId: string,
    interviewSessionId?: string
  ): Promise<APIResponse<any>> {
    const params = interviewSessionId ? `?interviewSessionId=${interviewSessionId}` : ''
    return apiClient.get(`/api/strategist/reports/data-synthesis/${researchId}${params}`)
  },

  /**
   * Health Check
   */
  async healthCheck(): Promise<APIResponse<any>> {
    return apiClient.get('/api/strategist/reports/health')
  },
}