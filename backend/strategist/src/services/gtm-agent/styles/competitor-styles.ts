/**
 * Competitor Deep Dive Section Styles
 */

export function getCompetitorStyles(): string {
  return `
/* Competitor Deep Dive Cards */
.competitor-cards-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  margin: 24px 0;
}

.competitor-deep-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 2px solid var(--border);
  transition: all 0.3s ease;
  box-shadow: var(--shadow-xs);
}

.competitor-deep-card:hover {
  border-color: var(--primary);
  box-shadow: 0 8px 30px rgba(99, 102, 241, 0.25);
}

.competitor-deep-card:focus-within {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

.competitor-header {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--border);
}

.competitor-logo {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.competitor-info h3 {
  margin: 0 0 4px 0;
  font-size: 1.2rem;
  color: var(--dark);
}

.competitor-meta {
  display: flex;
  gap: 16px;
  font-size: 0.85rem;
  color: var(--gray);
  margin-top: 4px;
  flex-wrap: wrap;
  align-items: center;
}

.trend-up {
  color: var(--success);
  font-weight: 600;
  display: inline-flex;
  align-items: center;
}

.trend-down {
  color: var(--danger);
  font-weight: 600;
  display: inline-flex;
  align-items: center;
}

.stage-badge {
  background: var(--light-gray);
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
}

.traffic-breakdown {
  margin: 20px 0;
  padding: 20px;
  background: var(--light-gray);
  border-radius: 12px;
}

.traffic-breakdown h5 {
  font-size: 0.9rem;
  color: var(--dark);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.traffic-bars {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.traffic-bar-row {
  display: grid;
  grid-template-columns: 100px 1fr 50px;
  gap: 12px;
  align-items: center;
}

.source-label {
  font-size: 0.85rem;
  font-weight: 500;
  text-transform: capitalize;
}

.bar-container {
  height: 24px;
  background: rgba(255,255,255,0.8);
  border-radius: 12px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%);
  border-radius: 12px;
  transition: width 0.3s ease;
}

.percent {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--dark);
  text-align: right;
}

.traffic-note {
  margin-top: 12px;
  font-size: 0.85rem;
  font-style: italic;
  color: var(--gray);
}

.strengths-weaknesses-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin: 20px 0;
}

.strengths-panel, .weaknesses-panel {
  padding: 16px;
  border-radius: 12px;
}

.strengths-panel {
  background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%);
}

.weaknesses-panel {
  background: linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%);
}

.strengths-panel h5 {
  color: var(--success);
  font-size: 0.9rem;
  margin-bottom: 12px;
}

.weaknesses-panel h5 {
  color: var(--danger);
  font-size: 0.9rem;
  margin-bottom: 12px;
}

.strengths-panel ul, .weaknesses-panel ul {
  list-style: none;
  padding: 0;
}

.strengths-panel li, .weaknesses-panel li {
  padding: 6px 0;
  font-size: 0.85rem;
  display: flex;
  gap: 8px;
}

.strengths-panel li::before {
  content: '✓';
  color: var(--success);
  font-weight: bold;
}

.weaknesses-panel li::before {
  content: '✗';
  color: var(--danger);
  font-weight: bold;
}

.key-takeaway-box {
  background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%);
  padding: 16px;
  border-radius: 12px;
  border-left: 3px solid var(--primary);
  font-size: 0.95rem;
  font-style: italic;
}

.key-takeaway-box strong {
  color: var(--primary);
  font-weight: 700;
}

.overall-insight {
  margin: 24px 0;
  padding: 20px;
  background: var(--light-gray);
  border-radius: 12px;
  font-size: 1rem;
  line-height: 1.8;
}

.competitive-advantages {
  margin-top: 36px;
  padding: 28px;
  background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%);
  border-radius: 12px;
}

.competitive-advantages h4 {
  color: var(--success);
  margin-bottom: 16px;
  font-size: 1.15rem;
}

.competitive-advantages ul {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
}

.competitive-advantages li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 0;
  line-height: 1.6;
}

.competitive-advantages li::before {
  content: '✓';
  color: var(--success);
  font-weight: bold;
}

@media (max-width: 768px) {
  .strengths-weaknesses-grid {
    grid-template-columns: 1fr;
  }

  .traffic-bar-row {
    grid-template-columns: 80px 1fr 40px;
  }
}
`;
}
