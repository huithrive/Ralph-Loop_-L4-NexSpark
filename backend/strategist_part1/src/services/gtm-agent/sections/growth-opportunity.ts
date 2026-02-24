/**
 * Growth Opportunity Section Renderer
 */

import { escapeHtml } from '../../../utils/html-escape';
import { getSvgIcon } from '../utils/icons';

export function renderGrowthOpportunity(data: any): string {
  const { growthOpportunity } = data;
  if (!growthOpportunity) return '';

  const analysisParagraphs = escapeHtml(growthOpportunity.openingAnalysis)
    .split('\n\n')
    .filter(p => p.trim())
    .map(p => `<p>${p}</p>`)
    .join('');

  return `
    <div class="card growth-opportunity">
      <div class="card-header">
        <div class="icon">${getSvgIcon('growth')}</div>
        <h2>Your Growth Opportunity</h2>
      </div>

      <div class="insight-headline">
        <h3>${escapeHtml(growthOpportunity.insightHeadline)}</h3>
      </div>

      <div class="opportunity-analysis">
        ${analysisParagraphs}
      </div>

      <div class="opportunity-stats-grid">
        <div class="opportunity-stat">
          <div class="value">${escapeHtml(growthOpportunity.opportunityStats.marketSize)}</div>
          <div class="label">Market Size</div>
        </div>
        <div class="opportunity-stat">
          <div class="value">${escapeHtml(growthOpportunity.opportunityStats.growthRate)}</div>
          <div class="label">Growth Rate</div>
        </div>
        <div class="opportunity-stat">
          <div class="value">${escapeHtml(growthOpportunity.opportunityStats.cacAdvantage)}</div>
          <div class="label">CAC Advantage</div>
        </div>
        <div class="opportunity-stat">
          <div class="value">${escapeHtml(growthOpportunity.opportunityStats.recommendedPlatform)}</div>
          <div class="label">Recommended Platform</div>
        </div>
      </div>

      <div class="connection-box">
        <h4>What This Means for You</h4>
        <p>${escapeHtml(growthOpportunity.connectionToGoals)}</p>
      </div>
    </div>
  `;
}
