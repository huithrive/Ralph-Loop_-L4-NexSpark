/**
 * Node.js Client for Landing Bridge Service
 * 
 * Usage from executorModule or any Node.js code:
 * 
 * const { generateLandingPage, editLandingPage, getTaskStatus } = require('./landing-bridge/node_client');
 * 
 * const result = await generateLandingPage({
 *   projectId: 'proj_123',
 *   brief: 'Create a landing page for eco-friendly water bottles',
 *   brandName: 'HydroLife',
 *   industry: 'Consumer Goods',
 *   targetMarket: 'Environmentally conscious millennials',
 *   changeType: 'content'
 * });
 * 
 * console.log(result.code); // Generated React component code
 */

const axios = require('axios');

const BRIDGE_BASE_URL = process.env.LANDING_BRIDGE_URL || 'http://localhost:3002';

/**
 * Generate a new landing page
 * @param {Object} params
 * @param {string} params.projectId - Project identifier
 * @param {string} params.brief - Generation brief/instructions
 * @param {string} params.brandName - Brand name
 * @param {string} params.industry - Industry/category
 * @param {string} params.targetMarket - Target audience description
 * @param {string} [params.changeType='content'] - Type of change: 'structural', 'content', or 'micro'
 * @returns {Promise<Object>} Result with artifactId, title, code, etc.
 */
async function generateLandingPage({
  projectId,
  brief,
  brandName,
  industry,
  targetMarket,
  changeType = 'content'
}) {
  try {
    const response = await axios.post(`${BRIDGE_BASE_URL}/api/landing/generate`, {
      projectId,
      brief,
      brandName,
      industry,
      targetMarket,
      changeType
    }, {
      timeout: 60000, // 60 second timeout for Claude API calls
    });
    
    return response.data;
  } catch (error) {
    console.error('Landing page generation failed:', error.message);
    
    if (error.response) {
      throw new Error(`Bridge service error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      throw new Error('Bridge service not responding. Is it running on port 3002?');
    } else {
      throw error;
    }
  }
}

/**
 * Edit an existing landing page (micro changes)
 * @param {Object} params
 * @param {string} params.projectId - Project identifier
 * @param {string} params.brief - Edit instructions
 * @param {string} [params.changeType='micro'] - Change type (currently only 'micro' supported)
 * @returns {Promise<Object>} Result with artifactId, title, code, etc.
 */
async function editLandingPage({
  projectId,
  brief,
  changeType = 'micro'
}) {
  try {
    const response = await axios.post(`${BRIDGE_BASE_URL}/api/landing/edit`, {
      projectId,
      brief,
      changeType
    }, {
      timeout: 60000,
    });
    
    return response.data;
  } catch (error) {
    console.error('Landing page edit failed:', error.message);
    
    if (error.response) {
      throw new Error(`Bridge service error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      throw new Error('Bridge service not responding. Is it running on port 3002?');
    } else {
      throw error;
    }
  }
}

/**
 * Get status of an async task (for future use)
 * @param {string} taskId - Task identifier
 * @returns {Promise<Object>} Status object with status, progress, result
 */
async function getTaskStatus(taskId) {
  try {
    const response = await axios.get(`${BRIDGE_BASE_URL}/api/landing/status/${taskId}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error(`Task not found: ${taskId}`);
    }
    throw error;
  }
}

/**
 * Health check - verify bridge service is running
 * @returns {Promise<boolean>} True if service is healthy
 */
async function healthCheck() {
  try {
    const response = await axios.get(`${BRIDGE_BASE_URL}/health`, {
      timeout: 5000,
    });
    return response.data.status === 'healthy';
  } catch (error) {
    return false;
  }
}

module.exports = {
  generateLandingPage,
  editLandingPage,
  getTaskStatus,
  healthCheck,
  BRIDGE_BASE_URL
};
