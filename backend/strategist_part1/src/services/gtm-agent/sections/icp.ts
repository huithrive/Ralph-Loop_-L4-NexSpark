/**
 * ICP (Ideal Customer Profiles) Section Renderer
 */

import type { GTMAgentReport } from '../../../types/gtm-agent-types';
import { escapeHtml } from '../../../utils/html-escape';
import { getSvgIcon } from '../utils/icons';
import { renderKeyValueList } from '../utils/shared-renderers';

function renderFootnotes(footnotes?: string[]): string {
  if (!footnotes || footnotes.length === 0) return '';

  return `<div class="footnotes-box">
    <h5>Terms Explained:</h5>
    <ul>${footnotes.map(f => `<li>${escapeHtml(f)}</li>`).join('')}</ul>
</div>`;
}

export function renderICPs(report: GTMAgentReport): string {
  return `<div class="card">
    <div class="card-header"><div class="icon">${getSvgIcon('users')}</div><h2>Ideal Customer Profile (ICP)</h2></div>
    <p style="margin-bottom: 20px;">Based on industry trends and behavioral patterns, we've identified four primary customer segments.</p>
    <div class="icp-grid">
        ${report.idealCustomerProfiles.map(icp => `
            <div class="icp-card ${icp.isPrimary ? 'primary' : ''}">
                <div class="icp-header">
                    <div class="icp-avatar">${icp.emoji}</div>
                    <div class="icp-title"><h3>${escapeHtml(icp.name)}</h3><span>${escapeHtml(icp.subtitle)}</span></div>
                </div>
                <div class="icp-stats">
                    <div class="icp-stat"><div class="value">${escapeHtml(icp.stats.ageRange)}</div><div class="label">Age Range</div></div>
                    <div class="icp-stat"><div class="value">${escapeHtml(icp.stats.avgOrderValue)}</div><div class="label">Avg Order Value</div></div>
                    <div class="icp-stat"><div class="value">${escapeHtml(icp.stats.purchaseFrequency)}</div><div class="label">Purchase Freq</div></div>
                    <div class="icp-stat"><div class="value">${escapeHtml(icp.stats.gender)}</div><div class="label">Primary Gender</div></div>
                </div>
                <ul class="icp-traits">${icp.traits.map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul>
                ${icp.aovPotential || icp.cacEstimate ? `
                <div style="margin-top: 16px; padding: 12px; background: white; border-radius: 8px; border: 2px solid var(--primary);">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; text-align: center;">
                        ${icp.aovPotential ? `<div><div style="font-size: 0.7rem; color: var(--gray);">AOV Potential</div><div style="font-size: 1rem; font-weight: 700; color: var(--primary);">${escapeHtml(icp.aovPotential)}</div></div>` : ''}
                        ${icp.cacEstimate ? `<div><div style="font-size: 0.7rem; color: var(--gray);">CAC Estimate</div><div style="font-size: 1rem; font-weight: 700; color: var(--primary);">${escapeHtml(icp.cacEstimate)}</div></div>` : ''}
                    </div>
                </div>` : ''}
            </div>
        `).join('')}
    </div>
    ${report.icpValidationPlan ? `
    <div style="margin-top: 30px; padding: 20px; background: linear-gradient(135deg, #FDF4FF 0%, #FAE8FF 100%); border-radius: 12px;">
        <h4 style="color: var(--primary); margin-bottom: 12px;">ICP Validation Plan</h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div><strong>Audience Tests:</strong><ul style="margin-top: 8px; padding-left: 20px;">${report.icpValidationPlan.audienceTests.map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul></div>
            <div><strong>Success Metrics:</strong><ul style="margin-top: 8px; padding-left: 20px;">${report.icpValidationPlan.successMetrics.map(m => `<li>${escapeHtml(m)}</li>`).join('')}</ul></div>
        </div>
    </div>` : ''}
    ${renderKeyValueList('Geographic & Demographic Focus', [
        { label: 'Primary Markets', value: report.geographicFocus.primaryMarkets },
        { label: 'Key Cities', value: report.geographicFocus.keyCities },
        { label: 'Income Level', value: report.geographicFocus.incomeLevel },
        { label: 'Interests', value: report.geographicFocus.interests }
    ])}
    ${renderFootnotes(report.sectionFootnotes?.icpAnalysis)}
</div>`;
}
