/**
 * Base repository utilities
 */

// Generate unique ID
export function generateId(prefix: string = ''): string {
  return `${prefix}${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}
