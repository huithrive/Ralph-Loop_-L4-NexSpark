/**
 * HTML Escape Utilities
 * Prevents XSS vulnerabilities in generated HTML templates
 */

const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/**
 * Escapes HTML special characters to prevent XSS attacks
 * Use when inserting user-generated content into HTML templates
 */
export function escapeHtml(text: string | undefined | null): string {
  if (!text) return '';
  return String(text).replace(/[&<>"']/g, char => HTML_ESCAPE_MAP[char] || char);
}

/**
 * Escapes a string for safe use in HTML attributes
 * More strict than escapeHtml - escapes all potentially dangerous chars
 */
export function escapeAttribute(text: string | undefined | null): string {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '&#10;')
    .replace(/\r/g, '&#13;');
}
