/**
 * Shared API client for frontend
 */

// API Base configuration
const API_BASE = '';

/**
 * Make an API request with standard error handling
 */
async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

/**
 * API methods for authentication
 */
const AuthAPI = {
  login: (email, password) =>
    apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (email, password, name, type = 'brand') =>
    apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, type }),
    }),

  logout: () =>
    apiRequest('/api/auth/logout', {
      method: 'POST',
    }),

  verify: (sessionToken) =>
    apiRequest('/api/auth/verify', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    }),
};

/**
 * API methods for interviews
 */
const InterviewAPI = {
  check: (userId) =>
    apiRequest(`/api/interview/check?userId=${userId}`),

  get: (interviewId) =>
    apiRequest(`/api/interview/${interviewId}`),

  getUserInterviews: (userId) =>
    apiRequest(`/api/interview/user/${userId}`),

  save: (interviewData) =>
    apiRequest('/api/interview/save', {
      method: 'POST',
      body: JSON.stringify(interviewData),
    }),

  complete: (interviewData) =>
    apiRequest('/api/interview/complete', {
      method: 'POST',
      body: JSON.stringify(interviewData),
    }),

  delete: (interviewId) =>
    apiRequest(`/api/interview/${interviewId}`, {
      method: 'DELETE',
    }),

  transcribe: (audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');
    return fetch('/api/interview/transcribe', {
      method: 'POST',
      body: formData,
    }).then((res) => res.json());
  },
};

/**
 * API methods for reports
 */
const ReportAPI = {
  start: (interviewId, userId) =>
    apiRequest('/api/report/start', {
      method: 'POST',
      body: JSON.stringify({ interviewId, userId }),
    }),

  getState: (generationId) =>
    apiRequest(`/api/report/state/${generationId}`),

  updateState: (generationId, updates) =>
    apiRequest(`/api/report/state/${generationId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  executeStep: (generationId, step, data = {}) =>
    apiRequest('/api/report/execute-step', {
      method: 'POST',
      body: JSON.stringify({ generationId, step, data }),
    }),

  resume: (generationId) =>
    apiRequest(`/api/report/resume/${generationId}`, {
      method: 'POST',
    }),

  get: (reportId) =>
    apiRequest(`/api/report/${reportId}`),

  getUserReports: (userId) =>
    apiRequest(`/api/report/user/${userId}`),
};

/**
 * API methods for payments
 */
const PaymentAPI = {
  createIntent: (userId, userEmail, amount = 2000) =>
    apiRequest('/api/payment/create-intent', {
      method: 'POST',
      body: JSON.stringify({ userId, userEmail, amount }),
    }),

  createCheckout: (userId, userEmail, successUrl, cancelUrl) =>
    apiRequest('/api/payment/create-checkout', {
      method: 'POST',
      body: JSON.stringify({ userId, userEmail, successUrl, cancelUrl }),
    }),
};

/**
 * API methods for analysis
 */
const AnalysisAPI = {
  analyze: (interviewId, transcript) =>
    apiRequest('/api/analysis/analyze', {
      method: 'POST',
      body: JSON.stringify({ interviewId, transcript }),
    }),

  research: (website, businessProfile) =>
    apiRequest('/api/analysis/research', {
      method: 'POST',
      body: JSON.stringify({ website, businessProfile }),
    }),

  gtmStrategy: (businessProfile, competitorData) =>
    apiRequest('/api/analysis/gtm-strategy', {
      method: 'POST',
      body: JSON.stringify({ businessProfile, competitorData }),
    }),

  generateReport: (businessProfile, competitorData, gtmStrategy) =>
    apiRequest('/api/analysis/generate-report', {
      method: 'POST',
      body: JSON.stringify({ businessProfile, competitorData, gtmStrategy }),
    }),
};
