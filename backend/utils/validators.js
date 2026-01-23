/**
 * Shared validation utilities for NexSpark backend
 */

/**
 * Validate if a string is a valid URL
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid URL
 */
function isValidUrl(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const urlObject = new URL(url);
    return urlObject.protocol === 'http:' || urlObject.protocol === 'https:';
  } catch (error) {
    return false;
  }
}

/**
 * Validate required fields in an object
 * @param {object} data - Data object to validate
 * @param {string[]} requiredFields - Array of required field names
 * @returns {object} - Validation result { valid: boolean, missingFields: string[] }
 */
function validateRequiredFields(data, requiredFields) {
  if (!data || typeof data !== 'object') {
    return {
      valid: false,
      missingFields: requiredFields,
      errors: ['Data must be an object']
    };
  }

  const missingFields = requiredFields.filter(field => {
    const value = data[field];
    return value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
  });

  return {
    valid: missingFields.length === 0,
    missingFields,
    errors: missingFields.length > 0 ? [`Missing required fields: ${missingFields.join(', ')}`] : []
  };
}

/**
 * Validate string length
 * @param {string} value - String to validate
 * @param {number} minLength - Minimum length (default: 0)
 * @param {number} maxLength - Maximum length (default: Infinity)
 * @returns {object} - Validation result
 */
function validateStringLength(value, minLength = 0, maxLength = Infinity) {
  if (typeof value !== 'string') {
    return {
      valid: false,
      error: 'Value must be a string'
    };
  }

  const trimmedLength = value.trim().length;

  if (trimmedLength < minLength) {
    return {
      valid: false,
      error: `String must be at least ${minLength} characters long`
    };
  }

  if (trimmedLength > maxLength) {
    return {
      valid: false,
      error: `String must be no more than ${maxLength} characters long`
    };
  }

  return { valid: true };
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate UUID format
 * @param {string} uuid - UUID to validate
 * @returns {boolean} - True if valid UUID
 */
function isValidUUID(uuid) {
  if (!uuid || typeof uuid !== 'string') {
    return false;
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Sanitize string input by removing harmful characters
 * @param {string} input - Input string to sanitize
 * @returns {string} - Sanitized string
 */
function sanitizeString(input) {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes that could cause injection
    .substring(0, 10000); // Limit length to prevent DoS
}

/**
 * Validate research request data
 * @param {object} data - Research request data
 * @returns {object} - Validation result
 */
function validateResearchRequest(data) {
  const errors = [];

  // Check required fields
  const requiredValidation = validateRequiredFields(data, ['website_url', 'product_description']);
  if (!requiredValidation.valid) {
    errors.push(...requiredValidation.errors);
  }

  // Validate URL
  if (data.website_url && !isValidUrl(data.website_url)) {
    errors.push('website_url must be a valid HTTP or HTTPS URL');
  }

  // Validate product description length
  if (data.product_description) {
    const lengthValidation = validateStringLength(data.product_description, 10, 5000);
    if (!lengthValidation.valid) {
      errors.push(`product_description: ${lengthValidation.error}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate pagination parameters
 * @param {object} params - Query parameters
 * @returns {object} - Validated pagination parameters
 */
function validatePagination(params = {}) {
  let { page = 1, limit = 20 } = params;

  // Convert to numbers
  page = parseInt(page, 10);
  limit = parseInt(limit, 10);

  // Apply constraints
  if (isNaN(page) || page < 1) {
    page = 1;
  }

  if (isNaN(limit) || limit < 1) {
    limit = 20;
  } else if (limit > 100) {
    limit = 100; // Max limit to prevent DoS
  }

  return {
    page,
    limit,
    offset: (page - 1) * limit
  };
}

module.exports = {
  isValidUrl,
  validateRequiredFields,
  validateStringLength,
  isValidEmail,
  isValidUUID,
  sanitizeString,
  validateResearchRequest,
  validatePagination
};