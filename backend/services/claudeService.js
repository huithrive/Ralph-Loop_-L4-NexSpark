const Anthropic = require('@anthropic-ai/sdk');

// Initialize Claude client
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Default configuration
const DEFAULT_OPTIONS = {
  model: 'claude-sonnet-4-20250514',
  max_tokens: 4000,
  temperature: 0.7
};

// Rate limiting tracking (simple in-memory store)
const rateLimitTracker = {
  requests: [],
  maxRequestsPerMinute: 50,

  canMakeRequest() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Clean old requests
    this.requests = this.requests.filter(timestamp => timestamp > oneMinuteAgo);

    return this.requests.length < this.maxRequestsPerMinute;
  },

  recordRequest() {
    this.requests.push(Date.now());
  }
};

/**
 * Call Claude AI with system prompt and user message
 * @param {string} systemPrompt - System prompt to set context
 * @param {string} userMessage - User message/query
 * @param {object} options - Optional configuration overrides
 * @returns {Promise<object>} Claude response object
 */
async function callClaude(systemPrompt, userMessage, options = {}) {
  try {
    // Validate inputs
    if (!systemPrompt || typeof systemPrompt !== 'string') {
      throw new Error('System prompt is required and must be a string');
    }

    if (!userMessage || typeof userMessage !== 'string') {
      throw new Error('User message is required and must be a string');
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    }

    // Check rate limiting
    if (!rateLimitTracker.canMakeRequest()) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    // Merge options with defaults
    const config = {
      ...DEFAULT_OPTIONS,
      ...options
    };

    const startTime = Date.now();

    // Prepare messages array
    const messages = [
      {
        role: 'user',
        content: userMessage
      }
    ];

    // Make API call to Claude
    const response = await client.messages.create({
      model: config.model,
      max_tokens: config.max_tokens,
      temperature: config.temperature,
      system: systemPrompt,
      messages: messages
    });

    const duration = Date.now() - startTime;

    // Record the request for rate limiting
    rateLimitTracker.recordRequest();

    // Log successful request
    console.log(`Claude API call completed in ${duration}ms`);
    console.log(`Tokens - Input: ${response.usage.input_tokens}, Output: ${response.usage.output_tokens}`);

    return {
      success: true,
      content: response.content[0].text,
      usage: response.usage,
      duration: duration,
      model: config.model
    };

  } catch (error) {
    console.error('Claude API call failed:', error.message);

    // Handle specific Anthropic API errors
    if (error.status === 401) {
      throw new Error('Invalid API key. Please check your ANTHROPIC_API_KEY.');
    } else if (error.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    } else if (error.status === 500) {
      throw new Error('Claude API server error. Please try again.');
    } else if (error.status === 400) {
      throw new Error(`Invalid request: ${error.message}`);
    }

    // Re-throw other errors
    throw error;
  }
}

/**
 * Call Claude for JSON-structured responses
 * @param {string} systemPrompt - System prompt to set context
 * @param {string} userMessage - User message/query
 * @param {object} options - Optional configuration overrides
 * @returns {Promise<object>} Parsed JSON response
 */
async function callClaudeForJSON(systemPrompt, userMessage, options = {}) {
  try {
    // Add JSON instruction to system prompt
    const jsonSystemPrompt = `${systemPrompt}

IMPORTANT: Your response must be valid JSON format only. Do not include any markdown formatting, code blocks, or explanatory text. Return only the JSON object.`;

    const response = await callClaude(jsonSystemPrompt, userMessage, options);

    if (!response.success) {
      throw new Error('Claude API call failed');
    }

    // Parse JSON response
    let parsedContent;
    try {
      // Remove any markdown code blocks if present
      let cleanContent = response.content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }

      parsedContent = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError.message);
      console.error('Raw response:', response.content);
      throw new Error('Failed to parse Claude response as JSON');
    }

    return {
      success: true,
      data: parsedContent,
      usage: response.usage,
      duration: response.duration,
      model: response.model
    };

  } catch (error) {
    console.error('Claude JSON API call failed:', error.message);
    throw error;
  }
}

/**
 * Get current rate limit status
 * @returns {object} Rate limit information
 */
function getRateLimitStatus() {
  const now = Date.now();
  const oneMinuteAgo = now - 60000;

  // Clean old requests
  rateLimitTracker.requests = rateLimitTracker.requests.filter(timestamp => timestamp > oneMinuteAgo);

  return {
    requestsInLastMinute: rateLimitTracker.requests.length,
    maxRequestsPerMinute: rateLimitTracker.maxRequestsPerMinute,
    canMakeRequest: rateLimitTracker.canMakeRequest()
  };
}

module.exports = {
  callClaude,
  callClaudeForJSON,
  getRateLimitStatus,
  DEFAULT_OPTIONS
};