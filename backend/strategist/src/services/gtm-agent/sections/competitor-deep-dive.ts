/**
 * Competitor Deep Dive Section Renderer
 * Handles both new format (competitorDeepDive) and legacy format (competitiveAnalysis)
 */

import { escapeHtml } from '../../../utils/html-escape';
import { getSvgIcon } from '../utils/icons';

export function renderCompetitorDeepDive(data: any): string {
  if (data.competitorDeepDive) {
    return renderNewFormat(data);
  } else if (data.competitiveAnalysis) {
    return renderLegacyFormat(data);
  }
  return '';
}

function renderNewFormat(data: any): string {
  const { competitorDeepDive } = data;
  if (!competitorDeepDive || !competitorDeepDive.competitors) return '';

  const competitorCards = competitorDeepDive.competitors.map((comp: any) => {
    const trendClass = comp.trafficTrend.startsWith('↑') ? 'trend-up' : 'trend-down';

    // Map traffic source labels for better display
    const sourceLabels: Record<string, string> = {
      direct: 'Direct',
      search: 'Search',
      social: 'Social',
      referral: 'Referral',
      paid: 'Paid Ads',
      mail: 'Mail'
    };

    const trafficBars = Object.entries(comp.trafficSourceBreakdown)
      .map(([source, percent]) => {
        const displaySource = sourceLabels[source] || source.replace(/([A-Z])/g, ' $1').trim();
        return `
          <div class="traffic-bar-row">
            <span class="source-label">${escapeHtml(displaySource)}</span>
            <div class="bar-container">
              <div class="bar-fill" style="width: ${percent}%"></div>
            </div>
            <span class="percent">${percent}%</span>
          </div>
        `;
      })
      .join('');

    const strengthsList = comp.strengths.map((s: string) => `<li>${escapeHtml(s)}</li>`).join('');
    const weaknessesList = comp.weaknesses.map((w: string) => `<li>${escapeHtml(w)}</li>`).join('');

    return `
      <div class="competitor-deep-card">
        <div class="competitor-header">
          <div class="competitor-logo">🏢</div>
          <div class="competitor-info">
            <h3>${escapeHtml(comp.name)}</h3>
            <div class="competitor-meta">
              <span>${escapeHtml(comp.estimatedMonthlyTraffic)}</span>
              <span class="trend ${trendClass}">
                ${escapeHtml(comp.trafficTrend)}
              </span>
              <span class="stage-badge">${escapeHtml(comp.stage)}</span>
            </div>
          </div>
        </div>

        <div class="traffic-breakdown">
          <h5>Traffic Sources</h5>
          <div class="traffic-bars">
            ${trafficBars}
          </div>
          <p class="traffic-note">${escapeHtml(comp.notableObservation)}</p>
        </div>

        <div class="strengths-weaknesses-grid">
          <div class="strengths-panel">
            <h5>What They're Doing Well</h5>
            <ul>${strengthsList}</ul>
          </div>
          <div class="weaknesses-panel">
            <h5>Where They're Vulnerable</h5>
            <ul>${weaknessesList}</ul>
          </div>
        </div>

        <div class="key-takeaway-box">
          <strong>Key Takeaway:</strong> ${escapeHtml(comp.keyTakeaway)}
        </div>
      </div>
    `;
  }).join('');

  const advantagesList = competitorDeepDive.competitiveAdvantages
    .map((adv: string) => `<li>${escapeHtml(adv)}</li>`)
    .join('');

  const positioningMap = renderCompetitivePositioningMap(competitorDeepDive.competitivePositioningMap);

  return `
    <div class="card competitor-deep-dive">
      <div class="card-header">
        <div class="icon">${getSvgIcon('target')}</div>
        <h2>Competitor Deep Dive</h2>
      </div>

      <div class="overall-insight">
        <p>${escapeHtml(competitorDeepDive.overallInsight)}</p>
      </div>

      <div class="competitor-cards-grid">
        ${competitorCards}
      </div>

      <div class="competitive-advantages">
        <h4>Your Competitive Advantages</h4>
        <ul>${advantagesList}</ul>
      </div>

      ${positioningMap}
    </div>
  `;
}

function renderLegacyFormat(data: any): string {
  const { competitiveAnalysis } = data;
  if (!competitiveAnalysis) return '';

  return `<div class="card">
    <div class="card-header"><div class="icon">${getSvgIcon('target')}</div><h2>Competitive Landscape</h2></div>
    <p style="margin-bottom: 20px;">Understanding competitor positioning helps identify unique advantages.</p>
    <table class="competitor-table">
        <thead><tr><th>Competitor</th><th>Type</th><th>Price Range</th><th>Strengths</th><th>Threat Level</th></tr></thead>
        <tbody>
            ${competitiveAnalysis.topCompetitors.map((comp: any) => `
                <tr>
                    <td><strong>${escapeHtml(comp.name)}</strong></td>
                    <td><span class="competitor-type type-${comp.competitorType.toLowerCase()}">${escapeHtml(comp.competitorType)}</span></td>
                    <td>${escapeHtml(comp.priceRange)}</td>
                    <td>${escapeHtml(comp.strengths)}</td>
                    <td><div class="threat-level"><div class="threat-dot threat-${comp.threatLevel.toLowerCase()}"></div>${escapeHtml(comp.threatLevel)}</div></td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    <div style="margin-top: 30px; padding: 24px; background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%); border-radius: 12px;">
        <h4 style="color: var(--success); margin-bottom: 12px;">Competitive Advantages</h4>
        <ul style="list-style: none; display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 12px;">
            ${competitiveAnalysis.competitiveAdvantages.map((adv: string) => `
                <li style="display: flex; align-items: center; gap: 8px;"><span style="color: var(--success);">&#10003;</span> ${escapeHtml(adv)}</li>
            `).join('')}
        </ul>
    </div>
</div>`;
}

function renderCompetitivePositioningMap(cpm: any): string {
  if (!cpm) return '';

  const getPosition = (x: string, y: string, index: number): { left: string; top: string } => {
    // Calculate positions with smart offset to prevent overlaps
    const baseOffset = (index * 7) % 15 - 7; // -7 to +7 offset

    let xPos: string;
    let yPos: string;

    // Map positions to percentages (with more spread)
    if (x === 'low') xPos = `${18 + baseOffset}%`;
    else if (x === 'high') xPos = `${82 + baseOffset}%`;
    else xPos = `${50 + baseOffset}%`;

    if (y === 'low') yPos = `${78 + baseOffset}%`;
    else if (y === 'high') yPos = `${22 + baseOffset}%`;
    else yPos = `${50 + baseOffset}%`;

    return { left: xPos, top: yPos };
  };

  const positions = cpm.positions.map((pos: any, index: number) => {
    const { left, top } = getPosition(pos.x, pos.y, index);

    if (pos.isClient) {
      // Your company - prominent filled circle with name inside
      return `
        <div style="position: absolute; left: ${left}; top: ${top}; transform: translate(-50%, -50%); text-align: center; z-index: 20;">
            <div style="min-width: 80px; padding: 16px 20px; border-radius: 12px; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 16px rgba(139, 92, 246, 0.4); border: 3px solid white;">
                <span style="color: white; font-weight: 700; font-size: 0.9rem; line-height: 1.3; text-align: center;">${escapeHtml(pos.name)}</span>
            </div>
        </div>`;
    } else {
      // Competitors - simple dot with label
      return `
        <div style="position: absolute; left: ${left}; top: ${top}; transform: translate(-50%, -50%); display: flex; align-items: center; gap: 8px; z-index: 5;">
            <div style="width: 10px; height: 10px; border-radius: 50%; background: var(--gray); box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);"></div>
            <div style="background: white; color: var(--dark); padding: 4px 10px; border-radius: 6px; font-weight: 600; font-size: 0.8rem; border: 1px solid var(--border); box-shadow: 0 1px 3px rgba(0,0,0,0.08); white-space: nowrap;">${escapeHtml(pos.name)}</div>
        </div>`;
    }
  }).join('');

  // Extract axis base labels (without parentheses content)
  const xAxisBase = cpm.xAxisLabel.split('(')[0].trim();
  const yAxisBase = cpm.yAxisLabel.split('(')[0].trim();

  return `
    <div style="margin-top: 36px; padding: 24px; background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
      <h4 style="color: var(--primary); margin-bottom: 8px; font-size: 1.1rem; font-weight: 700;">Competitive Positioning Map</h4>
      <p style="color: var(--gray); margin-bottom: 20px; font-size: 0.85rem;">Visual representation of how you compare to competitors</p>

      <div style="position: relative; width: 100%; height: 350px; background: linear-gradient(135deg, #FAFBFC 0%, #F9FAFB 100%); border-radius: 12px; border: 2px solid #E5E7EB; padding: 30px; margin-bottom: 20px;">

          <!-- Quadrant Background Colors (subtle) -->
          <div style="position: absolute; left: 30px; top: 30px; right: 50%; bottom: 50%; background: rgba(16, 185, 129, 0.03); border-radius: 6px 0 0 0;"></div>
          <div style="position: absolute; right: 30px; top: 30px; left: 50%; bottom: 50%; background: rgba(139, 92, 246, 0.05); border-radius: 0 6px 0 0;"></div>
          <div style="position: absolute; left: 30px; bottom: 30px; right: 50%; top: 50%; background: rgba(251, 191, 36, 0.03); border-radius: 0 0 0 6px;"></div>
          <div style="position: absolute; right: 30px; bottom: 30px; left: 50%; top: 50%; background: rgba(236, 72, 153, 0.03); border-radius: 0 0 6px 0;"></div>

          <!-- Axis Lines with Arrows -->
          <div style="position: absolute; left: 50%; top: 30px; bottom: 30px; width: 2px; background: linear-gradient(to bottom, var(--primary), var(--secondary));"></div>
          <div style="position: absolute; top: 50%; left: 30px; right: 30px; height: 2px; background: linear-gradient(to right, var(--primary), var(--secondary));"></div>

          <!-- Arrow heads -->
          <div style="position: absolute; left: 50%; top: 26px; width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-bottom: 8px solid var(--primary); transform: translateX(-50%);"></div>
          <div style="position: absolute; right: 26px; top: 50%; width: 0; height: 0; border-top: 5px solid transparent; border-bottom: 5px solid transparent; border-left: 8px solid var(--secondary); transform: translateY(-50%);"></div>

          <!-- Axis Labels (Clear and Bold) -->
          <div style="position: absolute; left: 50%; bottom: -6px; transform: translateX(-50%); font-size: 0.85rem; color: var(--dark); font-weight: 700; background: white; padding: 3px 12px; border-radius: 4px; box-shadow: 0 1px 4px rgba(0,0,0,0.1);">
              ${escapeHtml(xAxisBase)} →
          </div>
          <div style="position: absolute; left: -6px; top: 50%; transform: translateY(-50%); font-size: 0.85rem; color: var(--dark); font-weight: 700; background: white; padding: 3px 10px; border-radius: 4px; box-shadow: 0 1px 4px rgba(0,0,0,0.1); writing-mode: vertical-rl; text-orientation: mixed;">
              ↑ ${escapeHtml(yAxisBase)}
          </div>

          <!-- Corner Labels (cleaner) -->
          <div style="position: absolute; left: 40px; top: 40px; font-size: 0.7rem; color: var(--gray); font-weight: 500; opacity: 0.6;">
              Low ${escapeHtml(xAxisBase)}<br>High ${escapeHtml(yAxisBase)}
          </div>
          <div style="position: absolute; right: 40px; top: 40px; font-size: 0.7rem; color: var(--gray); font-weight: 500; opacity: 0.6; text-align: right;">
              High ${escapeHtml(xAxisBase)}<br>High ${escapeHtml(yAxisBase)}
          </div>
          <div style="position: absolute; left: 40px; bottom: 40px; font-size: 0.7rem; color: var(--gray); font-weight: 500; opacity: 0.6;">
              Low ${escapeHtml(xAxisBase)}<br>Low ${escapeHtml(yAxisBase)}
          </div>
          <div style="position: absolute; right: 40px; bottom: 40px; font-size: 0.7rem; color: var(--gray); font-weight: 500; opacity: 0.6; text-align: right;">
              High ${escapeHtml(xAxisBase)}<br>Low ${escapeHtml(yAxisBase)}
          </div>

          <!-- Positioned Companies -->
          ${positions}
      </div>

      <!-- Legend -->
      <div style="display: flex; justify-content: center; gap: 24px; margin-bottom: 16px; padding: 12px; background: #F9FAFB; border-radius: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
              <div style="padding: 6px 12px; border-radius: 6px; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); border: 2px solid white; box-shadow: 0 1px 4px rgba(139, 92, 246, 0.25);">
                  <span style="color: white; font-weight: 700; font-size: 0.7rem;">You</span>
              </div>
              <span style="font-size: 0.85rem; color: var(--dark); font-weight: 600;">Your Position</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 8px; height: 8px; border-radius: 50%; background: var(--gray); box-shadow: 0 1px 2px rgba(0,0,0,0.15);"></div>
              <span style="font-size: 0.85rem; color: var(--dark); font-weight: 600;">Competitors</span>
          </div>
      </div>

      <!-- Strategic Insight -->
      <div style="padding: 16px 20px; background: linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%); border-radius: 10px; border-left: 3px solid var(--primary);">
          <div style="display: flex; align-items: start; gap: 10px;">
              <div style="width: 28px; height: 28px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-weight: 700; font-size: 0.85rem;">💡</div>
              <div style="flex: 1;">
                  <strong style="color: var(--primary); font-size: 0.95rem; display: block; margin-bottom: 6px;">Strategic Insight</strong>
                  <p style="color: var(--dark); font-size: 0.9rem; line-height: 1.6; margin: 0;">${escapeHtml(cpm.strategicInsight)}</p>
              </div>
          </div>
      </div>
    </div>
  `;
}
