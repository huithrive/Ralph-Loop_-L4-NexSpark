/**
 * Market Opportunity Section Renderer
 */

import type { GTMAgentReport } from '../../../types/gtm-agent-types';
import { escapeHtml } from '../../../utils/html-escape';
import { getSvgIcon } from '../utils/icons';
import { renderVerticalList } from '../utils/shared-renderers';

function renderFootnotes(footnotes?: string[]): string {
  if (!footnotes || footnotes.length === 0) return '';

  return `<div class="footnotes-box">
    <h5>Terms Explained:</h5>
    <ul>${footnotes.map(f => `<li>${escapeHtml(f)}</li>`).join('')}</ul>
</div>`;
}

export function renderMarketOpportunity(report: GTMAgentReport): string {
  return `<div class="card">
    <div class="card-header"><div class="icon">${getSvgIcon('trending')}</div><h2>Market Opportunity</h2></div>
    <p style="margin-bottom: 20px;">The market is experiencing robust growth driven by industry trends and consumer behavior shifts.</p>
    <div class="market-stats">
        ${report.marketStats.map(stat => `
            <div class="market-stat-card">
                <div class="value">${escapeHtml(stat.value)}</div>
                <div class="label">${escapeHtml(stat.label)}</div>
                <div class="growth">${escapeHtml(stat.growth)}</div>
            </div>
        `).join('')}
    </div>
    <div class="chart-container" style="margin-top: 30px;"><canvas id="marketChart"></canvas></div>
    ${renderVerticalList('Key Market Drivers', report.marketAnalysis.keyDrivers)}
    ${renderFootnotes(report.sectionFootnotes?.marketOpportunity)}
</div>`;
}
