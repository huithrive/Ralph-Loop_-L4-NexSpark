/**
 * Agent Report HTML Template
 * Enhanced Euopho format with SEO and Geographic sections
 * Refactored with modular section renderers
 */

import type {
  GTMAgentReport,
  RecommendedTool,
  SixMonthPhase,
} from '../../types/gtm-agent-types';
import { escapeHtml } from '../../utils/html-escape';
import { getSvgIcon } from './utils/icons';
import { renderGrowthOpportunity } from './sections/growth-opportunity';
import { renderCompetitorDeepDive } from './sections/competitor-deep-dive';
import { renderMarketOpportunity } from './sections/market-opportunity';
import { renderICPs } from './sections/icp';
import { renderVerticalList } from './utils/shared-renderers';
import { getBaseStyles } from './styles/base-styles';
import { getGrowthOpportunityStyles } from './styles/growth-opportunity-styles';
import { getCompetitorStyles } from './styles/competitor-styles';
import { getICPStyles } from './styles/icp-styles';

/**
 * Normalize report data for backwards compatibility
 * Converts old format to new format if needed
 */
function normalizeReportData(report: any): any {
  const normalized = { ...report };

  // If old format but missing new growthOpportunity, create a synthetic one
  if (report.businessProfile && !report.growthOpportunity) {
    normalized.growthOpportunity = {
      insightHeadline: "Market Positioning Analysis",
      openingAnalysis: "Comprehensive market analysis shows significant opportunities for growth based on your unique positioning and target market dynamics.",
      marketPositioning: report.businessProfile.industry || "Market position analysis",
      targetAudienceFit: report.businessProfile.targetMarket || "Target audience analysis",
      platformRecommendationRationale: "Based on market analysis and competitor landscape",
      opportunityStats: {
        marketSize: report.executiveStats?.marketSize || "Market size data",
        growthRate: report.executiveStats?.growthRate || "Growth analysis",
        cacAdvantage: "Strategic CAC advantage",
        recommendedPlatform: report.executiveStats?.recommendedPlatform || "Meta"
      },
      connectionToGoals: "Strategic recommendations aligned with your business goals and market opportunity."
    };
  }

  return normalized;
}

/**
 * Generate complete HTML report from GTM Agent Report
 */
export function generateAgentReport(report: GTMAgentReport): string {
  const normalizedReport = normalizeReportData(report);

  return `<!DOCTYPE html>
<html lang="en">
<head>
${renderHead()}
<style>${getStyles()}</style>
</head>
<body>
<div class="container">
${renderHeader(normalizedReport)}
${renderExecutiveSummary(normalizedReport)}
${renderGrowthOpportunity(normalizedReport)}
${renderMarketOpportunity(normalizedReport)}
${renderCompetitorDeepDive(normalizedReport)}
${renderICPs(normalizedReport)}
${renderGeographicOpportunity(normalizedReport)}
${renderSEOAnalysis(normalizedReport)}
${renderBudgetAndPerformance(normalizedReport)}
${renderSixMonthRoadmap(normalizedReport)}
${renderABTesting(normalizedReport)}
${renderNextStepsAndResources(normalizedReport)}
${renderFooter()}
</div>
${renderChartScripts(normalizedReport)}
</body>
</html>`;
}

function renderHead(): string {
  return `    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Go-To-Market Strategy Report</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>`;
}

function getStyles(): string {
  return (
    getBaseStyles() +
    getGrowthOpportunityStyles() +
    getCompetitorStyles() +
    getICPStyles()
  );
}

function renderHeader(report: GTMAgentReport): string {
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  return `<div class="header">
    <h1>${escapeHtml(report.businessProfile.brandName)}</h1>
    <div class="subtitle">Go-To-Market Strategy Report</div>
    <div class="header-meta">
        <div class="header-meta-item">
            <span class="header-meta-label">Prepared For</span>
            <span>${escapeHtml(report.businessProfile.brandName)}</span>
        </div>
        <div class="header-meta-item">
            <span class="header-meta-label">Report Date</span>
            <span>${date}</span>
        </div>
        <div class="header-meta-item">
            <span class="header-meta-label">Report Type</span>
            <span>GTM Strategy Analysis</span>
        </div>
        <div class="header-meta-item">
            <span class="header-meta-label">Prepared By</span>
            <span>NexSpark</span>
        </div>
    </div>
</div>`;
}

function renderExecutiveSummary(report: GTMAgentReport): string {
  return `<div class="card exec-summary">
    <div class="card-header">
        <div class="icon">${getSvgIcon('chart')}</div>
        <h2>Executive Summary</h2>
    </div>
    <p style="font-size: 1.05rem; color: var(--dark); margin-bottom: 20px;">${escapeHtml(report.executiveSummary)}</p>
    <div class="exec-grid">
        <div class="exec-stat"><div class="value">${escapeHtml(report.executiveStats.marketSize)}</div><div class="label">Market Size</div></div>
        <div class="exec-stat"><div class="value">${escapeHtml(report.executiveStats.growthRate)}</div><div class="label">Growth Rate</div></div>
        <div class="exec-stat"><div class="value">${escapeHtml(report.executiveStats.startingBudget)}</div><div class="label">Starting Budget</div></div>
        <div class="exec-stat"><div class="value">${escapeHtml(report.executiveStats.recommendedPlatform)}</div><div class="label">Recommended Platform</div></div>
    </div>
</div>`;
}



function renderSEOAnalysis(report: GTMAgentReport): string {
  if (!report.seoAnalysis) return '';

  const seo = report.seoAnalysis;
  const categoryKeywords = seo.categoryKeywords || [];
  const quickWinRecommendations = seo.quickWinRecommendations || [];

  return `<div class="card">
    <div class="card-header"><div class="icon">${getSvgIcon('search')}</div><h2>SEO & Keyword Opportunity</h2></div>

    ${seo.brandKeywordAnalysis ? `
    <div style="padding: 20px; background: var(--light-gray); border-radius: 12px; margin-bottom: 24px;">
        <h4 style="margin-bottom: 16px;">Brand Keyword Analysis</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
            <div><strong>Search Query:</strong> "${seo.brandKeywordAnalysis.searchQuery}"</div>
            <div><strong>Your Position:</strong> #${seo.brandKeywordAnalysis.yourSitePosition}</div>
            <div><strong>Competitor Ads:</strong> ${seo.brandKeywordAnalysis.competitorAdsOnBrand ? 'Yes' : 'No'}</div>
        </div>
        <p style="margin-top: 12px; padding: 12px; background: white; border-radius: 8px;"><strong>Recommendation:</strong> ${seo.brandKeywordAnalysis.recommendation}</p>
    </div>` : ''}

    ${categoryKeywords.length > 0 ? `
    <h4 style="margin-bottom: 16px;">Category Keyword Opportunities</h4>
    <table class="competitor-table">
        <thead><tr><th>Keyword</th><th>Monthly Searches</th><th>CPC (US)</th><th>Competition</th><th>Priority</th></tr></thead>
        <tbody>
            ${categoryKeywords.map(kw => `
                <tr>
                    <td><strong>${kw.keyword}</strong></td>
                    <td>${kw.monthlySearches}</td>
                    <td>${kw.cpcUS}</td>
                    <td><span class="competitor-type ${kw.competition === 'Low' ? 'type-niche' : kw.competition === 'High' ? 'type-premium' : 'type-mass'}">${kw.competition}</span></td>
                    <td><span style="color: ${kw.priority === 'High' ? 'var(--primary)' : 'var(--gray)'}; font-weight: ${kw.priority === 'High' ? '700' : '400'};">${kw.priority}</span></td>
                </tr>
            `).join('')}
        </tbody>
    </table>` : ''}

    ${quickWinRecommendations.length > 0 ? `
    <div style="margin-top: 24px; padding: 20px; background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%); border-radius: 12px;">
        <h4 style="color: var(--accent); margin-bottom: 12px;">Quick Win Recommendations</h4>
        <ol style="padding-left: 20px;">
            ${quickWinRecommendations.map(rec => `<li style="padding: 8px 0;">${rec}</li>`).join('')}
        </ol>
    </div>` : ''}

    ${renderFootnotes(seo.footnotes)}
</div>`;
}

function renderGeographicOpportunity(report: GTMAgentReport): string {
  if (!report.geographicOpportunityAnalysis) return '';

  const geo = report.geographicOpportunityAnalysis;
  const topStates = geo.topStatesForLaunch || [];
  const avoidStates = geo.statesToAvoid || [];
  const marketTiers = geo.marketTiers || [];
  const regionalRestrictions = geo.regionalRestrictions || [];

  return `<div class="card">
    <div class="card-header"><div class="icon">${getSvgIcon('map')}</div><h2>Geographic Opportunity Analysis</h2></div>

    ${topStates.length > 0 ? `
    <h4 style="margin-bottom: 16px;">Top States for Launch</h4>
    <table class="competitor-table">
        <thead><tr><th>Rank</th><th>State</th><th>Why</th><th>CPM Savings</th></tr></thead>
        <tbody>
            ${topStates.map(state => `
                <tr>
                    <td><strong>#${state.rank}</strong></td>
                    <td>${state.state}</td>
                    <td>${state.reason}</td>
                    <td style="color: var(--success); font-weight: 600;">${state.cpmSavings}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>` : ''}

    ${avoidStates.length > 0 ? `
    <div style="margin-top: 24px; padding: 20px; background: #FEF2F2; border-radius: 12px;">
        <h4 style="color: var(--danger); margin-bottom: 12px;">States to Avoid Initially</h4>
        <table class="competitor-table" style="background: white;">
            <thead><tr><th>State</th><th>Why</th><th>When to Revisit</th></tr></thead>
            <tbody>
                ${avoidStates.map(state => `
                    <tr>
                        <td><strong>${state.state}</strong></td>
                        <td>${state.reason}</td>
                        <td>${state.whenToRevisit}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>` : ''}

    ${marketTiers.length > 0 ? `
    <h4 style="margin-bottom: 16px;">Market Tier Analysis</h4>
    ${marketTiers.map(tier => `
        <div style="margin-bottom: 16px; padding: 16px; background: ${tier.tier === 1 ? 'linear-gradient(135deg, #FDF4FF 0%, #FAE8FF 100%)' : tier.tier === 2 ? 'var(--light-gray)' : '#F1F5F9'}; border-radius: 12px;">
            <h5 style="color: ${tier.tier === 1 ? 'var(--primary)' : 'var(--dark)'}; margin-bottom: 8px;">Tier ${tier.tier}: ${tier.name}</h5>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${Array.isArray(tier.countries) ? tier.countries.map(c => `<span style="background: white; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem;">${c.country || c}${c.reason ? ` - ${c.reason}` : ''}</span>`).join('') : ''}
            </div>
        </div>
    `).join('')}` : ''}

    ${regionalRestrictions.length > 0 ? `
    <div style="margin-top: 24px; padding: 16px; background: #FEF3C7; border-radius: 12px;">
        <h5 style="color: var(--warning); margin-bottom: 8px;">Regional Restrictions</h5>
        <ul style="padding-left: 20px; font-size: 0.9rem;">
            ${regionalRestrictions.map(r => `<li>${r}</li>`).join('')}
        </ul>
    </div>` : ''}

    ${renderFootnotes(geo.footnotes)}
</div>`;
}


function renderBudgetAndPerformance(report: GTMAgentReport): string {
  // Support both old and new structure
  const reportAny = report as any;
  const budget = report.budgetAndPerformance?.budget || reportAny.budgetStrategy;
  const kpis = report.budgetAndPerformance?.kpis || reportAny.kpis || [];
  const industryBenchmarks = report.budgetAndPerformance?.industryBenchmarks || [];
  const scalingRules = report.budgetAndPerformance?.scalingRules || budget?.scalingRules;

  if (!budget) {
    console.warn('[renderBudgetAndPerformance] No budget data found');
    return '';
  }

  const breakdown = budget?.breakdown;
  const metaAds = breakdown?.metaAds || { amount: 'N/A', percent: 0 };
  const creative = breakdown?.creative || { amount: 'N/A', percent: 0 };
  const testing = breakdown?.testing || { amount: 'N/A', percent: 0 };

  return `<div class="card">
    <div class="card-header"><div class="icon">${getSvgIcon('dollar')}</div><h2>Budget & Performance Framework</h2></div>

    <h3 style="margin-bottom: 16px; font-size: 1.1rem; color: var(--dark);">Budget Allocation</h3>
    <div class="budget-card">
        <div class="budget-header">
            <div>
                <div class="budget-amount">${budget?.weeklyBudget || 'N/A'}</div>
                <div class="budget-period">${budget?.monthlyBudget || 'N/A'} | ${budget?.yearlyBudget || 'N/A'}</div>
            </div>
        </div>
        <div class="budget-breakdown">
            <div class="budget-item"><div class="amount">${metaAds.amount}</div><div class="category">Meta Ads</div><div class="percent">${metaAds.percent}%</div></div>
            <div class="budget-item"><div class="amount">${creative.amount}</div><div class="category">Creative & Content</div><div class="percent">${creative.percent}%</div></div>
            <div class="budget-item"><div class="amount">${testing.amount}</div><div class="category">Testing Reserve</div><div class="percent">${testing.percent}%</div></div>
        </div>
    </div>

    ${scalingRules ? `
    <div style="margin-top: 24px; padding: 20px; background: var(--light-gray); border-radius: 12px;">
        <h4 style="margin-bottom: 12px;">Budget Scaling Rules</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px;">
            ${scalingRules.scaleTriggers && Array.isArray(scalingRules.scaleTriggers) ? `
            <div>
                <h5 style="color: var(--success); font-size: 0.9rem; margin-bottom: 8px;">Scale Triggers</h5>
                <ul style="font-size: 0.85rem; padding-left: 20px;">
                    ${scalingRules.scaleTriggers.map(t => `<li style="padding: 4px 0;">${t}</li>`).join('')}
                </ul>
            </div>` : ''}
            ${scalingRules.safetyRules && Array.isArray(scalingRules.safetyRules) ? `
            <div>
                <h5 style="color: var(--warning); font-size: 0.9rem; margin-bottom: 8px;">Safety Rules</h5>
                <ul style="font-size: 0.85rem; padding-left: 20px;">
                    ${scalingRules.safetyRules.map(r => `<li style="padding: 4px 0;">${r}</li>`).join('')}
                </ul>
            </div>` : ''}
            ${scalingRules.pauseTriggers && Array.isArray(scalingRules.pauseTriggers) ? `
            <div>
                <h5 style="color: var(--danger); font-size: 0.9rem; margin-bottom: 8px;">Pause Triggers</h5>
                <ul style="font-size: 0.85rem; padding-left: 20px;">
                    ${scalingRules.pauseTriggers.map(t => `<li style="padding: 4px 0;">${t}</li>`).join('')}
                </ul>
            </div>` : ''}
        </div>
    </div>` : ''}

    <h3 style="margin: 32px 0 20px 0; font-size: 1.1rem; color: var(--dark);">Key Performance Indicators</h3>
    <div class="kpi-grid">
        ${kpis.map(kpi => `
            <div class="kpi-card">
                <div class="metric">${kpi.metric}</div>
                <div class="target">${kpi.target || kpi.month1_2 || 'N/A'}</div>
                <div class="benchmark">${kpi.benchmark || kpi.howToCalculate || ''}</div>
                ${kpi.week1Target ? `
                <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(0,0,0,0.1);">
                    <div style="font-size: 0.7rem; color: var(--gray); margin-bottom: 4px;">Weekly Progression:</div>
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; font-size: 0.75rem;">
                        <div style="text-align: center;"><div style="color: var(--gray);">W1</div><div style="font-weight: 600;">${kpi.week1Target}</div></div>
                        <div style="text-align: center;"><div style="color: var(--gray);">W4</div><div style="font-weight: 600;">${kpi.week4Target}</div></div>
                        <div style="text-align: center;"><div style="color: var(--gray);">W8</div><div style="font-weight: 600;">${kpi.week8Target}</div></div>
                        <div style="text-align: center;"><div style="color: var(--gray);">W12</div><div style="font-weight: 600; color: var(--success);">${kpi.week12Target}</div></div>
                    </div>
                </div>` : kpi.month1_2 ? `
                <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(0,0,0,0.1);">
                    <div style="font-size: 0.7rem; color: var(--gray); margin-bottom: 4px;">Monthly Progression:</div>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; font-size: 0.75rem;">
                        <div style="text-align: center;"><div style="color: var(--gray);">M1-2</div><div style="font-weight: 600;">${kpi.month1_2}</div></div>
                        <div style="text-align: center;"><div style="color: var(--gray);">M3-4</div><div style="font-weight: 600;">${kpi.month3_4}</div></div>
                        <div style="text-align: center;"><div style="color: var(--gray);">M5-6</div><div style="font-weight: 600; color: var(--success);">${kpi.month5_6}</div></div>
                    </div>
                </div>` : ''}
            </div>
        `).join('')}
    </div>

    <div class="chart-container" style="margin-top: 30px;"><canvas id="roasChart"></canvas></div>

    ${industryBenchmarks && industryBenchmarks.length > 0 ? `
    <div style="margin-top: 24px; padding: 20px; background: var(--light-gray); border-radius: 12px;">
        <h4 style="margin-bottom: 12px;">Industry Benchmarks</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
            ${industryBenchmarks.map(b => `
                <div style="padding: 12px; background: white; border-radius: 8px;">
                    <div style="font-size: 0.75rem; color: var(--gray); margin-bottom: 4px;">${b.category}</div>
                    <div style="font-weight: 600; color: var(--dark); margin-bottom: 2px;">${b.metric}</div>
                    <div style="font-size: 0.9rem; color: var(--primary); font-weight: 600;">${b.value}</div>
                </div>
            `).join('')}
        </div>
    </div>` : ''}

    ${renderFootnotes(report.budgetAndPerformance?.footnotes)}
</div>`;
}





function renderEmailMarketingSetup(phase: SixMonthPhase): string {
  const emailSetup = phase.emailMarketingSetup;
  const emailFramework = phase.emailSequenceFramework;

  if (!emailSetup && !emailFramework) return '';

  let html = '';

  if (emailSetup) {
    html += `
    <div style="margin-top: 16px; padding: 16px; background: white; border-radius: 8px;">
        <h5 style="color: var(--secondary); margin-bottom: 12px;">Email Marketing Setup</h5>
        ${emailSetup.platform ? `<p style="margin-bottom: 8px;"><strong>Platform:</strong> ${emailSetup.platform}</p>` : ''}
        ${emailSetup.welcomeSequence && typeof emailSetup.welcomeSequence === 'string' ? `<p style="margin-bottom: 8px;"><strong>Welcome Sequence:</strong> ${emailSetup.welcomeSequence}</p>` : ''}
        ${emailSetup.abandonedCart && typeof emailSetup.abandonedCart === 'string' ? `<p style="margin-bottom: 8px;"><strong>Abandoned Cart:</strong> ${emailSetup.abandonedCart}</p>` : ''}
        ${emailSetup.postPurchase ? `<p style="margin-bottom: 8px;"><strong>Post-Purchase:</strong> ${emailSetup.postPurchase}</p>` : ''}
        ${emailSetup.listGrowth ? `<p style="margin-bottom: 8px;"><strong>List Growth:</strong> ${emailSetup.listGrowth}</p>` : ''}
    </div>`;
  }

  if (emailFramework) {
    const welcomeSeq = emailFramework.welcomeSequence && Array.isArray(emailFramework.welcomeSequence) ? emailFramework.welcomeSequence : [];
    const abandonedSeq = emailFramework.abandonedCartSequence && Array.isArray(emailFramework.abandonedCartSequence) ? emailFramework.abandonedCartSequence : [];

    if (welcomeSeq.length > 0 || abandonedSeq.length > 0) {
      html += `
      <div style="margin-top: 16px; padding: 16px; background: var(--light-gray); border-radius: 8px;">
          <h5 style="color: var(--secondary); margin-bottom: 12px;">Email Sequence Details</h5>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              ${welcomeSeq.length > 0 ? `
              <div>
                  <h6 style="font-size: 0.85rem; color: var(--gray); margin-bottom: 8px;">Welcome Sequence</h6>
                  ${welcomeSeq.map(seq => `
                      <div style="display: flex; gap: 8px; padding: 6px 0; font-size: 0.85rem;">
                          <span style="color: var(--primary); font-weight: 600; min-width: 50px;">Day ${seq.day}:</span>
                          <span>${seq.subject}</span>
                      </div>
                  `).join('')}
              </div>` : ''}
              ${abandonedSeq.length > 0 ? `
              <div>
                  <h6 style="font-size: 0.85rem; color: var(--gray); margin-bottom: 8px;">Abandoned Cart Sequence</h6>
                  ${abandonedSeq.map(seq => `
                      <div style="display: flex; gap: 8px; padding: 6px 0; font-size: 0.85rem;">
                          <span style="color: var(--danger); font-weight: 600; min-width: 70px;">${seq.timing}:</span>
                          <span>${seq.purpose}</span>
                      </div>
                  `).join('')}
              </div>` : ''}
          </div>
      </div>`;
    }
  }

  return html;
}

function renderInfluencerStrategy(phase: SixMonthPhase): string {
  if (!phase.influencerStrategy) return '';

  const inf = phase.influencerStrategy;
  return `
    <div style="margin-top: 16px; padding: 16px; background: white; border-radius: 8px;">
        <h5 style="color: var(--accent); margin-bottom: 12px;">Influencer Strategy</h5>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 16px;">
            <div><strong style="font-size: 0.8rem; color: var(--gray);">Platform Focus:</strong><br>${inf.platformFocus}</div>
            <div><strong style="font-size: 0.8rem; color: var(--gray);">Creator Tier:</strong><br>${inf.creatorTier}</div>
            <div><strong style="font-size: 0.8rem; color: var(--gray);">Monthly Outreach:</strong><br>${inf.monthlyOutreach} creators</div>
            <div><strong style="font-size: 0.8rem; color: var(--gray);">Compensation:</strong><br>${inf.compensation}</div>
        </div>
        <div>
            <strong style="font-size: 0.8rem; color: var(--gray);">Weekly Framework:</strong>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 8px;">
                ${inf.weeklyFramework.map(week => `<div style="padding: 8px; background: var(--light-gray); border-radius: 6px; font-size: 0.8rem; text-align: center;">${week}</div>`).join('')}
            </div>
        </div>
    </div>`;
}

function renderVideoContentStrategy(phase: SixMonthPhase): string {
  if (!phase.videoContentStrategy || phase.videoContentStrategy.length === 0) return '';

  return `
    <div style="margin-top: 16px; padding: 16px; background: white; border-radius: 8px;">
        <h5 style="color: var(--warning); margin-bottom: 12px;">Video Content Strategy</h5>
        <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
            <thead>
                <tr style="border-bottom: 1px solid var(--light-gray);">
                    <th style="padding: 8px; text-align: left;">Type</th>
                    <th style="padding: 8px; text-align: center;">Qty/Month</th>
                    <th style="padding: 8px; text-align: left;">Platform</th>
                    <th style="padding: 8px; text-align: left;">Purpose</th>
                </tr>
            </thead>
            <tbody>
                ${phase.videoContentStrategy.map(video => `
                    <tr style="border-bottom: 1px solid var(--light-gray);">
                        <td style="padding: 8px;">${video.type}</td>
                        <td style="padding: 8px; text-align: center; font-weight: 600;">${video.quantityPerMonth}</td>
                        <td style="padding: 8px;">${video.platform}</td>
                        <td style="padding: 8px;">${video.purpose}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>`;
}

function renderSixMonthRoadmap(report: GTMAgentReport): string {
  if (!report.sixMonthRoadmap) return '';

  const phases = report.sixMonthRoadmap.phases;
  if (!phases || !Array.isArray(phases) || phases.length === 0) {
    console.warn('[renderSixMonthRoadmap] No phases array found');
    return '';
  }

  return `<div class="card">
    <div class="card-header"><div class="icon">${getSvgIcon('calendar')}</div><h2>Six-Month Strategic Overview</h2></div>
    <div style="display: flex; gap: 8px; margin-bottom: 24px; padding: 12px; background: var(--light-gray); border-radius: 8px; overflow-x: auto;">
        ${phases.map(p => `
            <div style="flex: 1; min-width: 150px; padding: 12px; background: ${p.phaseNumber === 1 ? 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' : 'white'}; color: ${p.phaseNumber === 1 ? 'white' : 'var(--dark)'}; border-radius: 8px; text-align: center;">
                <div style="font-size: 0.75rem; opacity: 0.8;">${p.months}</div>
                <div style="font-weight: 700;">${p.name}</div>
            </div>
        `).join('')}
    </div>
    ${phases.map(phase => `
        <div style="margin-bottom: 24px; padding: 24px; background: var(--light-gray); border-radius: 12px;">
            <h4 style="color: var(--primary); margin-bottom: 8px;">Phase ${phase.phaseNumber}: ${phase.name} (${phase.months})</h4>
            <p style="margin-bottom: 16px;"><strong>Goal:</strong> ${phase.goal}</p>
            <p style="margin-bottom: 16px;"><strong>Primary Focus:</strong> ${phase.primaryFocus}</p>
            <div style="margin-bottom: 16px;"><strong>Success Metrics:</strong><ul style="padding-left: 20px; margin-top: 8px;">${Array.isArray(phase.successMetrics) ? phase.successMetrics.map(m => `<li>${m}</li>`).join('') : ''}</ul></div>
            <div style="padding: 12px; background: white; border-radius: 8px;"><strong>Key Milestone:</strong> ${phase.keyMilestone}</div>
            ${renderEmailMarketingSetup(phase)}
            ${renderInfluencerStrategy(phase)}
            ${renderVideoContentStrategy(phase)}
        </div>
    `).join('')}
    ${renderFootnotes(report.sixMonthRoadmap.footnotes)}
</div>`;
}

function renderABTesting(report: GTMAgentReport): string {
  if (!report.abTestingFramework) return '';

  const tests = report.abTestingFramework.tests;
  const hypotheses = report.abTestingFramework.keyHypotheses;

  return `<div class="card">
    <div class="card-header"><div class="icon">${getSvgIcon('flask')}</div><h2>A/B Testing Framework</h2></div>
    <p style="margin-bottom: 20px;">Systematic testing approach to validate assumptions and optimize performance.</p>
    ${tests && Array.isArray(tests) && tests.length > 0 ? `
    <table class="competitor-table">
        <thead><tr><th style="width: 20%;">Test Category</th><th style="width: 20%;">Variable A</th><th style="width: 20%;">Variable B</th><th style="width: 20%;">Success Metric</th><th style="width: 20%;">Timeline</th></tr></thead>
        <tbody>
            ${tests.map(t => `
                <tr><td><strong>${t.testCategory}</strong></td><td>${t.variableA}</td><td>${t.variableB}</td><td>${t.successMetric}</td><td>${t.timeline}</td></tr>
            `).join('')}
        </tbody>
    </table>` : ''}
    ${hypotheses && Array.isArray(hypotheses) && hypotheses.length > 0 ? `
    <div style="margin-top: 30px; padding: 24px; background: linear-gradient(135deg, #FDF4FF 0%, #FAE8FF 100%); border-radius: 12px;">
        <h4 style="color: var(--primary); margin-bottom: 12px;">Key Hypotheses to Validate</h4>
        <ul style="list-style: none; display: grid; gap: 8px;">
            ${hypotheses.map(h => `<li style="display: flex; align-items: flex-start; gap: 8px;"><span style="color: var(--primary);">&#8594;</span> ${h}</li>`).join('')}
        </ul>
    </div>` : ''}
</div>`;
}


function renderRecommendedTools(tools?: RecommendedTool[]): string {
  if (!tools || tools.length === 0) return '';

  return `
    <div style="margin-top: 30px; padding: 20px; background: rgba(255,255,255,0.15); border-radius: 12px;">
        <h4 style="margin-bottom: 16px; opacity: 0.9;">Recommended Tools</h4>
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.3);">
                    <th style="padding: 12px 8px; text-align: left; font-size: 0.85rem; opacity: 0.9;">Category</th>
                    <th style="padding: 12px 8px; text-align: left; font-size: 0.85rem; opacity: 0.9;">Tool</th>
                    <th style="padding: 12px 8px; text-align: left; font-size: 0.85rem; opacity: 0.9;">Cost/Month</th>
                    <th style="padding: 12px 8px; text-align: left; font-size: 0.85rem; opacity: 0.9;">Why</th>
                </tr>
            </thead>
            <tbody>
                ${tools.map(tool => `
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                        <td style="padding: 12px 8px; font-size: 0.9rem;">${tool.category}</td>
                        <td style="padding: 12px 8px; font-size: 0.9rem; font-weight: 600;">${tool.tool}</td>
                        <td style="padding: 12px 8px; font-size: 0.9rem;">${tool.costPerMonth}</td>
                        <td style="padding: 12px 8px; font-size: 0.85rem; opacity: 0.9;">${tool.why}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>`;
}

function renderNextStepsAndResources(report: GTMAgentReport): string {
  // Support both old and new structure
  const nextSteps = report.nextStepsAndResources || report.summaryNextSteps;
  if (!nextSteps) return '';

  return `<div class="card" style="background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 50%, var(--accent) 100%); color: white;">
    <div class="card-header" style="border-bottom-color: rgba(255,255,255,0.2);">
        <div class="icon" style="background: rgba(255,255,255,0.2); color: white;">${getSvgIcon('rocket')}</div>
        <h2 style="color: white;">Next Steps & Resources</h2>
    </div>

    ${nextSteps.keyTakeaways ? `
    <div style="margin-bottom: 30px;">
        <h4 style="margin-bottom: 16px; opacity: 0.9;">Key Takeaways</h4>
        <ul style="list-style: none; display: grid; gap: 8px;">
            ${nextSteps.keyTakeaways.map(t => `<li style="padding: 8px 0; display: flex; gap: 8px;"><span>&#10003;</span> ${t}</li>`).join('')}
        </ul>
    </div>` : ''}

    ${nextSteps.immediateActions && nextSteps.immediateActions.length > 0 ? `
    <div style="margin-bottom: 30px;">
        <h4 style="margin-bottom: 16px; opacity: 0.9;">Immediate Actions (This Week)</h4>
        ${nextSteps.immediateActions[0].task ? `
        <div style="display: grid; gap: 16px;">
            ${nextSteps.immediateActions.map(action => `
                <div style="padding: 16px; background: rgba(255,255,255,0.15); border-radius: 12px; border-left: 3px solid rgba(255,255,255,0.5);">
                    <div style="font-weight: 600; margin-bottom: 8px;">${action.task}</div>
                    ${action.whyItMatters ? `<div style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 4px;"><strong>Why:</strong> ${action.whyItMatters}</div>` : ''}
                    ${action.timeEstimate ? `<div style="font-size: 0.85rem; opacity: 0.8;"><strong>Time:</strong> ${action.timeEstimate}</div>` : ''}
                </div>
            `).join('')}
        </div>` : `
        <ol style="padding-left: 20px;">${nextSteps.immediateActions.map(a => `<li style="padding: 8px 0;">${typeof a === 'string' ? a : a.task}</li>`).join('')}</ol>
        `}
    </div>` : ''}

    ${nextSteps.preLaunchChecklist && nextSteps.preLaunchChecklist.length > 0 ? `
    <div style="margin-bottom: 30px; padding: 20px; background: rgba(255,255,255,0.15); border-radius: 12px;">
        <h4 style="margin-bottom: 16px; opacity: 0.9;">Pre-Launch Technical Checklist</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px;">
            ${nextSteps.preLaunchChecklist.map(item => {
              const itemText = typeof item === 'string' ? item : item.item;
              const itemDesc = typeof item === 'object' && item.description ? item.description : '';
              return `<div style="display: flex; align-items: flex-start; gap: 8px;">
                <span style="color: var(--success); font-size: 1.2rem; flex-shrink: 0;">&#9744;</span>
                <div>
                  <div>${itemText}</div>
                  ${itemDesc ? `<div style="font-size: 0.85rem; opacity: 0.8; margin-top: 4px;">${itemDesc}</div>` : ''}
                </div>
              </div>`;
            }).join('')}
        </div>
    </div>` : ''}

    ${renderRecommendedTools(nextSteps.recommendedTools)}

    ${nextSteps.learningResources && nextSteps.learningResources.length > 0 ? `
    <div style="margin-top: 30px; padding: 20px; background: rgba(255,255,255,0.15); border-radius: 12px;">
        <h4 style="margin-bottom: 16px; opacity: 0.9;">Learning Resources</h4>
        <div style="display: grid; gap: 12px;">
            ${nextSteps.learningResources.map(resource => `
                <div style="padding: 12px; background: rgba(255,255,255,0.1); border-radius: 8px;">
                    <div style="font-weight: 600; margin-bottom: 4px;">${resource.title}</div>
                    <div style="font-size: 0.85rem; opacity: 0.9;"><strong>Format:</strong> ${resource.format} | <strong>Why:</strong> ${resource.why}</div>
                </div>
            `).join('')}
        </div>
    </div>` : ''}

    ${nextSteps.readyToAccelerate ? `
    <div style="margin-top: 30px; padding: 24px; background: rgba(255,255,255,0.1); border-radius: 12px; text-align: center;">
        <h4 style="margin-bottom: 12px; opacity: 0.9;">Ready to Accelerate?</h4>
        <p style="font-size: 1rem; margin-bottom: 16px; opacity: 0.95;">${nextSteps.readyToAccelerate.description}</p>
        ${nextSteps.readyToAccelerate.nextStep ? `<p style="font-size: 0.95rem; opacity: 0.9;">${nextSteps.readyToAccelerate.nextStep}</p>` : ''}
        ${nextSteps.readyToAccelerate.contactInfo ? `<p style="font-size: 0.9rem; margin-top: 12px; opacity: 0.85;">${nextSteps.readyToAccelerate.contactInfo}</p>` : ''}
    </div>` : nextSteps.callToAction ? `
    <div style="margin-top: 30px; padding: 20px; background: rgba(255,255,255,0.1); border-radius: 12px; text-align: center;">
        <p style="font-size: 1.1rem; margin-bottom: 16px;">${nextSteps.callToAction}</p>
    </div>` : ''}

    ${renderFootnotes(nextSteps.footnotes)}
</div>`;
}

function renderFooter(): string {
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  return `<div class="footer">
    <p>Prepared by <strong>NexSpark</strong> | AI-Powered Growth for Emerging Brands</p>
    <p style="margin-top: 8px;">${date}</p>
</div>`;
}

function renderFootnotes(footnotes?: string[]): string {
  if (!footnotes || footnotes.length === 0) return '';

  return `<div class="footnotes-box">
    <h5>Terms Explained:</h5>
    <ul>${footnotes.map(f => `<li>${f}</li>`).join('')}</ul>
</div>`;
}

function renderChartScripts(report: GTMAgentReport): string {
  return `<script>
    const marketCtx = document.getElementById('marketChart').getContext('2d');
    new Chart(marketCtx, {
        type: 'bar',
        data: ${JSON.stringify(report.charts.marketGrowth)},
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: true, position: 'top' }, title: { display: true, text: 'Market Growth Projection', font: { size: 16, weight: 'bold' } } },
            scales: { y: { beginAtZero: true, title: { display: true, text: 'Market Size ($ Billion)' } } }
        }
    });
    const roasCtx = document.getElementById('roasChart').getContext('2d');
    new Chart(roasCtx, {
        type: 'line',
        data: ${JSON.stringify(report.charts.roasProjection)},
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: true, position: 'top' }, title: { display: true, text: 'Projected ROAS Over 12 Week', font: { size: 16, weight: 'bold' } } },
            scales: { y: { beginAtZero: true, max: 4, title: { display: true, text: 'ROAS (Return on Ad Spend)' } } }
        }
    });
</script>`;
}
