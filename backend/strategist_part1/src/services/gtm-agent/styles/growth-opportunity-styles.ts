/**
 * Growth Opportunity Section Styles
 */

export function getGrowthOpportunityStyles(): string {
  return `
/* Growth Opportunity Section */
.growth-opportunity {
  background: #FFFFFF;
}
.growth-opportunity:focus-within {
  outline: 2px solid var(--secondary);
  outline-offset: 2px;
}

.insight-headline {
  background: #FEF2F2;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.insight-headline h3 {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--dark);
  margin: 0;
}

.opportunity-analysis {
  margin: 24px 0;
  font-size: 1rem;
  line-height: 1.9;
}

.opportunity-analysis p {
  margin-bottom: 20px;
}

.opportunity-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin: 28px 0;
}

.opportunity-stat {
  background: white;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 20px;
  text-align: left;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.opportunity-stat:hover {
  box-shadow: var(--shadow-sm);
  transform: translateY(-2px);
}

.opportunity-stat .value {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--dark);
  line-height: 1.3;
  order: 1;
}

.opportunity-stat .label {
  font-size: 0.8rem;
  color: var(--gray);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
  order: 2;
}

@media (max-width: 768px) {
  .opportunity-stats-grid {
    grid-template-columns: 1fr;
  }
}

.connection-box {
  background: #F8F9FA;
  padding: 24px;
  border-radius: 12px;
  margin-top: 28px;
}

.connection-box h4 {
  font-size: 1.15rem;
  color: var(--primary);
  margin-bottom: 12px;
}

.connection-box p {
  line-height: 1.7;
  font-size: 0.98rem;
}
`;
}
