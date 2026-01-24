/**
 * Standard API response formatting utilities for NexSpark backend
 */

/**
 * Format a successful response
 * @param {*} data - Response data
 * @param {string} message - Optional success message
 * @param {object} metadata - Optional metadata (pagination, etc.)
 * @returns {object} - Formatted success response
 */
function success(data, message = 'Success', metadata = {}) {
  const response = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };

  // Add metadata if provided
  if (Object.keys(metadata).length > 0) {
    response.metadata = metadata;
  }

  return response;
}

/**
 * Format an error response
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {string} errorCode - Optional error code for client handling
 * @param {object} details - Optional error details
 * @returns {object} - Formatted error response
 */
function error(message, statusCode = 500, errorCode = null, details = {}) {
  const response = {
    success: false,
    error: {
      message,
      code: errorCode,
      statusCode,
      timestamp: new Date().toISOString()
    }
  };

  // Add error_code at top level for test compatibility
  if (errorCode) {
    response.error_code = errorCode;
  }

  // Add details if provided and not empty
  if (Object.keys(details).length > 0) {
    response.error.details = details;
    // Also add details at top level as 'data' for test compatibility
    response.data = details;
  }

  // Don't expose internal error details in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500 && !errorCode) {
    response.error.message = 'Internal server error';
  }

  return response;
}

/**
 * Format validation error response
 * @param {string[]} validationErrors - Array of validation error messages
 * @returns {object} - Formatted validation error response
 */
function validationError(validationErrors) {
  return error(
    'Validation failed',
    400,
    'VALIDATION_ERROR',
    { validationErrors }
  );
}

/**
 * Format not found error response
 * @param {string} resource - Name of the resource that wasn't found
 * @returns {object} - Formatted not found response
 */
function notFound(resource = 'Resource') {
  return error(
    `${resource} not found`,
    404,
    'NOT_FOUND'
  );
}

/**
 * Format unauthorized error response
 * @returns {object} - Formatted unauthorized response
 */
function unauthorized() {
  return error(
    'Unauthorized access',
    401,
    'UNAUTHORIZED'
  );
}

/**
 * Format forbidden error response
 * @returns {object} - Formatted forbidden response
 */
function forbidden() {
  return error(
    'Access forbidden',
    403,
    'FORBIDDEN'
  );
}

/**
 * Format rate limit error response
 * @param {number} retryAfter - Seconds to wait before retrying
 * @returns {object} - Formatted rate limit response
 */
function rateLimitExceeded(retryAfter = 60) {
  return error(
    'Rate limit exceeded. Please try again later.',
    429,
    'RATE_LIMIT_EXCEEDED',
    { retryAfter }
  );
}

/**
 * Format paginated response
 * @param {array} items - Array of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total number of items
 * @param {string} message - Optional success message
 * @returns {object} - Formatted paginated response
 */
function paginated(items, page, limit, total, message = 'Success') {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return success(
    items,
    message,
    {
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
        nextPage: hasNext ? page + 1 : null,
        prevPage: hasPrev ? page - 1 : null
      }
    }
  );
}

/**
 * Format async operation response (for long-running tasks)
 * @param {string} operationId - ID to track the operation
 * @param {string} status - Operation status
 * @param {string} message - Optional message
 * @returns {object} - Formatted async response
 */
function asyncOperation(operationId, status, message = 'Operation started') {
  return success(
    {
      operationId,
      status
    },
    message,
    {
      async: true,
      statusUrl: `/api/operations/${operationId}/status`
    }
  );
}

/**
 * Send a formatted response using Express response object
 * @param {object} res - Express response object
 * @param {object} responseData - Formatted response data
 * @param {number} statusCode - HTTP status code (optional, extracted from response)
 */
function sendResponse(res, responseData, statusCode = null) {
  // Extract status code from response if not provided
  const code = statusCode || (responseData.error ? responseData.error.statusCode : 200);

  res.status(code).json(responseData);
}

/**
 * Send success response using Express response object
 * @param {object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Optional success message
 * @param {object} metadata - Optional metadata
 */
function sendSuccess(res, data, message = 'Success', metadata = {}) {
  const responseData = success(data, message, metadata);
  sendResponse(res, responseData, 200);
}

/**
 * Send error response using Express response object
 * @param {object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {string} errorCode - Optional error code
 * @param {object} details - Optional error details
 */
function sendError(res, message, statusCode = 500, errorCode = null, details = {}) {
  const responseData = error(message, statusCode, errorCode, details);
  sendResponse(res, responseData, statusCode);
}

module.exports = {
  success,
  error,
  validationError,
  notFound,
  unauthorized,
  forbidden,
  rateLimitExceeded,
  paginated,
  asyncOperation,
  sendResponse,
  sendSuccess,
  sendError
};