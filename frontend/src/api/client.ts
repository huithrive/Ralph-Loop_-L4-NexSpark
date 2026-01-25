/**
 * NexSpark API Client
 * Central API client for communicating with the NexSpark backend
 */

import { APIResponse } from '@/types'

class APIClient {
  private baseURL: string
  private defaultHeaders: Record<string, string>

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  }

  /**
   * Generic HTTP request method
   */
  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const url = `${this.baseURL}${endpoint}`

    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    }

    // Add auth token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('nexspark_token')
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        }
      }
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      return data as APIResponse<T>
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  /**
   * POST request
   */
  async post<T = any>(endpoint: string, data?: any): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * PUT request
   */
  async put<T = any>(endpoint: string, data?: any): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  /**
   * Upload file
   */
  async upload<T = any>(endpoint: string, formData: FormData): Promise<APIResponse<T>> {
    const headers = { ...this.defaultHeaders }
    delete headers['Content-Type'] // Let browser set content-type for FormData

    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers,
    })
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<APIResponse> {
    try {
      return await this.get('/health')
    } catch (error) {
      return {
        success: false,
        error: 'API is unavailable',
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('nexspark_token', token)
    }
  }

  /**
   * Clear authentication token
   */
  clearAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nexspark_token')
    }
  }

  /**
   * Get current authentication token
   */
  getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('nexspark_token')
    }
    return null
  }
}

// Export singleton instance
export const apiClient = new APIClient()
export default apiClient