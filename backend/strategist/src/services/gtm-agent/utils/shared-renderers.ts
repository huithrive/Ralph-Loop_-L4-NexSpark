/**
 * Shared rendering utilities for consistent formatting across sections
 */

import { escapeHtml } from '../../../utils/html-escape';

/**
 * Renders items as a grid of stat cards
 * Used for opportunity stats and similar numeric/metric data
 */
export function renderStatsGrid(
  items: Array<{ title: string; description: string }>,
  options?: {
    marginTop?: string;
  }
): string {
  const marginTop = options?.marginTop || '24px';

  return `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-top: ${marginTop};">
        ${items.map(item => `
            <div style="background: white; border: 1px solid var(--border); border-radius: 10px; padding: 20px; text-align: left; border-left: 3px solid var(--primary); transition: all 0.2s ease;">
                <div style="font-size: 1.1rem; font-weight: 700; color: var(--dark); margin-bottom: 8px; line-height: 1.3;">${escapeHtml(item.description)}</div>
                <div style="font-size: 0.8rem; color: var(--gray); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">${escapeHtml(item.title)}</div>
            </div>
        `).join('')}
    </div>
  `;
}

/**
 * Renders a list of items in clean, compact format
 * Used for Key Market Drivers, AOV Optimization, etc.
 */
export function renderVerticalList(
  title: string,
  items: Array<{ title: string; description: string }>,
  options?: {
    marginTop?: string;
  }
): string {
  const marginTop = options?.marginTop || '30px';

  return `
    <div style="margin-top: ${marginTop};">
        <h3 style="margin-bottom: 20px; font-size: 1.3rem; color: var(--dark); font-weight: 700;">${escapeHtml(title)}</h3>
        <div style="display: flex; flex-direction: column; gap: 16px;">
            ${items.map(item => `
                <div style="display: grid; grid-template-columns: 200px 1fr; gap: 20px; align-items: baseline;">
                    <strong style="font-size: 0.95rem; color: var(--dark); font-weight: 600;">${escapeHtml(item.title)}:</strong>
                    <span style="color: var(--gray); font-size: 0.95rem; line-height: 1.6;">${escapeHtml(item.description)}</span>
                </div>
            `).join('')}
        </div>
    </div>
  `;
}

/**
 * Renders key-value pairs in a clean, compact format
 * Used for Geographic & Demographic Focus and similar data sections
 */
export function renderKeyValueList(
  title: string,
  items: Array<{ label: string; value: string }>,
  options?: {
    marginTop?: string;
    labelWidth?: string;
  }
): string {
  const marginTop = options?.marginTop || '30px';
  const labelWidth = options?.labelWidth || '200px';

  return `
    <div style="margin-top: ${marginTop};">
        <h3 style="margin-bottom: 20px; font-size: 1.3rem; color: var(--dark); font-weight: 700;">${escapeHtml(title)}</h3>
        <div style="display: flex; flex-direction: column; gap: 16px;">
            ${items.map(item => `
                <div style="display: grid; grid-template-columns: ${labelWidth} 1fr; gap: 20px; align-items: baseline;">
                    <strong style="font-size: 0.95rem; color: var(--dark); font-weight: 600;">${escapeHtml(item.label)}:</strong>
                    <span style="color: var(--gray); font-size: 0.95rem; line-height: 1.6;">${escapeHtml(item.value)}</span>
                </div>
            `).join('')}
        </div>
    </div>
  `;
}
