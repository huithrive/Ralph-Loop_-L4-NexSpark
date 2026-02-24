/**
 * ID generation utilities
 */

/**
 * Generates a unique ID with a prefix
 */
export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Generates a user ID
 */
export function generateUserId(): string {
  return generateId('usr');
}

/**
 * Generates an interview ID
 */
export function generateInterviewId(): string {
  return generateId('int');
}

/**
 * Generates a report ID
 */
export function generateReportId(): string {
  return generateId('rpt');
}

/**
 * Generates a session token
 */
export function generateSessionToken(): string {
  return generateId('sess');
}

/**
 * Generates a generation ID for report generation
 */
export function generateGenerationId(): string {
  return generateId('gen');
}
