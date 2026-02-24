/**
 * JSON parsing utilities for extracting JSON from AI responses
 */

import { createLogger } from './logger';

/**
 * Extracts JSON from text that may contain markdown code blocks or other formatting
 */
export function extractJsonFromText(text: string): any {
  // Try to parse directly first
  try {
    return JSON.parse(text);
  } catch (e) {
    // Continue to extraction methods
  }

  // Try to extract from markdown code block
  const codeBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\}|\[[\s\S]*?\])\s*```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1]);
    } catch (e) {
      // Continue to next method
    }
  }

  // Try to find JSON object or array in the text
  const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch (e) {
      // Continue to next method
    }
  }

  throw new Error('No valid JSON found in text');
}

/**
 * Safely parses JSON with fallback
 */
export function safeJsonParse<T = any>(text: string, fallback: T): T {
  const log = createLogger({ context: '[JSON]' });
  try {
    return extractJsonFromText(text);
  } catch (e) {
    log.warn('JSON parse failed, using fallback', e);
    return fallback;
  }
}

/**
 * Extracts specific field from JSON text
 */
export function extractJsonField<T = any>(text: string, field: string): T | null {
  try {
    const json = extractJsonFromText(text);
    return json[field] ?? null;
  } catch (e) {
    return null;
  }
}
