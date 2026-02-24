/**
 * Centralized logging utility for backend services
 * Supports log levels, structured logging, and request tracing
 */

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

interface LogContext {
  requestId?: string;
  userId?: string;
  context?: string; // e.g., '[V2]', '[Preview]', '[Step 1]'
  [key: string]: any;
}

/**
 * Logger class with support for log levels, context, and structured logging
 */
class Logger {
  private logLevel: LogLevel;
  private context: LogContext;

  constructor(context: LogContext = {}, logLevel?: LogLevel) {
    this.context = context;
    // Default to INFO if not specified
    this.logLevel = logLevel || 'INFO';
  }

  /**
   * Set the log level from environment
   */
  setLogLevel(level: LogLevel) {
    this.logLevel = level;
  }

  /**
   * Check if a log level should be output
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  /**
   * Format log message with timestamp, level, and context
   */
  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const contextStr = this.context.requestId ? `[${this.context.requestId}]` : '';
    const prefix = this.context.context || '';

    let output = `[${level}] ${timestamp} ${contextStr}`;
    if (prefix) {
      output += ` ${prefix}`;
    }
    output += ` - ${message}`;

    // Add metadata if present
    if (data !== undefined) {
      if (data instanceof Error) {
        output += `\nError: ${data.message}`;
        if (data.stack) {
          output += `\nStack: ${data.stack}`;
        }
      } else if (typeof data === 'object') {
        try {
          output += ` ${JSON.stringify(data)}`;
        } catch (e) {
          output += ` [Unable to stringify data]`;
        }
      } else {
        output += ` ${data}`;
      }
    }

    return output;
  }

  /**
   * Log a debug message (hidden in production when LOG_LEVEL=INFO)
   */
  debug(message: string, metadata?: any) {
    if (this.shouldLog('DEBUG')) {
      console.log(this.formatMessage('DEBUG', message, metadata));
    }
  }

  /**
   * Log an info message
   */
  info(message: string, metadata?: any) {
    if (this.shouldLog('INFO')) {
      console.log(this.formatMessage('INFO', message, metadata));
    }
  }

  /**
   * Log a warning message
   */
  warn(message: string, metadata?: any) {
    if (this.shouldLog('WARN')) {
      console.warn(this.formatMessage('WARN', message, metadata));
    }
  }

  /**
   * Log an error message
   */
  error(message: string, error?: any) {
    if (this.shouldLog('ERROR')) {
      console.error(this.formatMessage('ERROR', message, error));
    }
  }

  /**
   * Create a child logger with additional context
   */
  child(additionalContext: LogContext): Logger {
    return new Logger(
      { ...this.context, ...additionalContext },
      this.logLevel
    );
  }
}

// Global logger instance
let globalLogger: Logger | null = null;

/**
 * Initialize the global logger with environment-based log level
 */
export function initializeLogger(logLevel?: LogLevel) {
  const level = logLevel || 'INFO';
  globalLogger = new Logger({}, level);
  return globalLogger;
}

/**
 * Get the global logger instance
 */
function getGlobalLogger(): Logger {
  if (!globalLogger) {
    globalLogger = new Logger({}, 'INFO');
  }
  return globalLogger;
}

/**
 * Create a logger with custom context
 */
export function createLogger(context?: LogContext): Logger {
  const baseLogger = getGlobalLogger();
  if (!context || Object.keys(context).length === 0) {
    return baseLogger;
  }
  return baseLogger.child(context);
}

/**
 * Generate a unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Create a logger from Hono context with request ID
 */
export function createRequestLogger(c: any): Logger {
  const requestId = generateRequestId();

  // Try to extract user ID if available
  let userId: string | undefined;
  try {
    const user = c.get('user');
    if (user && user.id) {
      userId = user.id;
    }
  } catch (e) {
    // User not available in context
  }

  return createLogger({ requestId, userId });
}

/**
 * Default export for convenience
 */
export default {
  createLogger,
  createRequestLogger,
  initializeLogger,
};
