/**
 * Structured logging utility for NexSpark backend
 */

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

// Current log level (configurable via environment)
const CURRENT_LOG_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL?.toUpperCase()] ?? LOG_LEVELS.INFO;

/**
 * Format log message with timestamp and level
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {object} metadata - Additional metadata
 * @returns {object} - Formatted log object
 */
function formatLogMessage(level, message, metadata = {}) {
  const logObject = {
    timestamp: new Date().toISOString(),
    level: level.toUpperCase(),
    message,
    environment: process.env.NODE_ENV || 'development',
    service: 'nexspark-backend',
    ...metadata
  };

  return logObject;
}

/**
 * Output log message to console
 * @param {object} logObject - Formatted log object
 */
function outputLog(logObject) {
  const logString = JSON.stringify(logObject);

  switch (logObject.level) {
  case 'ERROR':
    console.error(logString);
    break;
  case 'WARN':
    console.warn(logString);
    break;
  case 'DEBUG':
    console.debug(logString);
    break;
  default:
    console.log(logString);
  }
}

/**
 * Check if log level should be output
 * @param {string} level - Log level to check
 * @returns {boolean} - Whether to output this level
 */
function shouldLog(level) {
  const levelValue = LOG_LEVELS[level.toUpperCase()];
  return levelValue !== undefined && levelValue <= CURRENT_LOG_LEVEL;
}

/**
 * Log error message
 * @param {string} message - Error message
 * @param {Error|object} error - Error object or metadata
 * @param {object} metadata - Additional metadata
 */
function error(message, error = {}, metadata = {}) {
  if (!shouldLog('ERROR')) return;

  const errorMetadata = {
    ...metadata
  };

  // Extract error details if it's an Error object
  if (error instanceof Error) {
    errorMetadata.error = {
      name: error.name,
      message: error.message,
      stack: error.stack
    };
  } else if (typeof error === 'object') {
    errorMetadata.error = error;
  }

  const logObject = formatLogMessage('ERROR', message, errorMetadata);
  outputLog(logObject);
}

/**
 * Log warning message
 * @param {string} message - Warning message
 * @param {object} metadata - Additional metadata
 */
function warn(message, metadata = {}) {
  if (!shouldLog('WARN')) return;

  const logObject = formatLogMessage('WARN', message, metadata);
  outputLog(logObject);
}

/**
 * Log info message
 * @param {string} message - Info message
 * @param {object} metadata - Additional metadata
 */
function info(message, metadata = {}) {
  if (!shouldLog('INFO')) return;

  const logObject = formatLogMessage('INFO', message, metadata);
  outputLog(logObject);
}

/**
 * Log debug message
 * @param {string} message - Debug message
 * @param {object} metadata - Additional metadata
 */
function debug(message, metadata = {}) {
  if (!shouldLog('DEBUG')) return;

  const logObject = formatLogMessage('DEBUG', message, metadata);
  outputLog(logObject);
}

/**
 * Log HTTP request
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {number} duration - Request duration in ms
 */
function httpRequest(req, res, duration) {
  if (!shouldLog('INFO')) return;

  const logObject = formatLogMessage('INFO', 'HTTP Request', {
    http: {
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      duration: duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      contentLength: res.get('Content-Length') || 0
    }
  });

  outputLog(logObject);
}

/**
 * Log database query
 * @param {string} query - SQL query (truncated)
 * @param {number} duration - Query duration in ms
 * @param {number} rowCount - Number of rows affected/returned
 */
function dbQuery(query, duration, rowCount = 0) {
  if (!shouldLog('DEBUG')) return;

  const logObject = formatLogMessage('DEBUG', 'Database Query', {
    database: {
      query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
      duration: duration,
      rowCount: rowCount
    }
  });

  outputLog(logObject);
}

/**
 * Log API call to external service
 * @param {string} service - Service name
 * @param {string} endpoint - API endpoint
 * @param {number} duration - Call duration in ms
 * @param {boolean} success - Whether call was successful
 * @param {object} metadata - Additional metadata
 */
function apiCall(service, endpoint, duration, success, metadata = {}) {
  if (!shouldLog('INFO')) return;

  const logObject = formatLogMessage('INFO', 'External API Call', {
    api: {
      service,
      endpoint,
      duration,
      success,
      ...metadata
    }
  });

  outputLog(logObject);
}

/**
 * Log application startup
 * @param {number} port - Server port
 * @param {string} environment - Environment name
 */
function startup(port, environment) {
  const logObject = formatLogMessage('INFO', 'Application Started', {
    server: {
      port,
      environment,
      nodeVersion: process.version,
      pid: process.pid
    }
  });

  outputLog(logObject);
}

/**
 * Log application shutdown
 * @param {string} reason - Shutdown reason
 */
function shutdown(reason) {
  const logObject = formatLogMessage('INFO', 'Application Shutdown', {
    shutdown: {
      reason,
      uptime: process.uptime()
    }
  });

  outputLog(logObject);
}

/**
 * Create a child logger with additional context
 * @param {object} context - Additional context to include in all logs
 * @returns {object} - Child logger instance
 */
function child(context = {}) {
  return {
    error: (message, error = {}, metadata = {}) =>
      error(message, error, { ...context, ...metadata }),
    warn: (message, metadata = {}) =>
      warn(message, { ...context, ...metadata }),
    info: (message, metadata = {}) =>
      info(message, { ...context, ...metadata }),
    debug: (message, metadata = {}) =>
      debug(message, { ...context, ...metadata })
  };
}

module.exports = {
  error,
  warn,
  info,
  debug,
  httpRequest,
  dbQuery,
  apiCall,
  startup,
  shutdown,
  child,
  LOG_LEVELS,
  shouldLog
};