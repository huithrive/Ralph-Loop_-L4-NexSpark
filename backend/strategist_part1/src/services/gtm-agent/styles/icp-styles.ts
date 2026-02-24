/**
 * ICP (Ideal Customer Profiles) Styles
 */

export function getICPStyles(): string {
  return `
    .icp-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 24px;
      margin-top: 24px;
    }
    .icp-card {
      background: white;
      border: 2px solid var(--border);
      border-radius: 16px;
      padding: 24px;
      transition: all 0.3s ease;
      box-shadow: var(--shadow-xs);
      display: flex;
      flex-direction: column;
    }
    .icp-card.primary {
      border-color: var(--primary);
      box-shadow: 0 8px 30px rgba(99, 102, 241, 0.25);
      background: linear-gradient(135deg, #EEF2FF 0%, #FFFFFF 100%);
    }
    .icp-card:focus-within {
      outline: 2px solid var(--primary);
      outline-offset: 2px;
    }
    .icp-header {
      display: flex;
      gap: 16px;
      align-items: flex-start;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 2px solid var(--border);
    }
    .icp-avatar {
      font-size: 48px;
      width: 64px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      border-radius: 12px;
      flex-shrink: 0;
    }
    .icp-title {
      flex: 1;
      min-width: 0;
    }
    .icp-title h3 {
      margin: 0 0 6px 0;
      font-size: 1.3rem;
      color: var(--dark);
      font-weight: 700;
      line-height: 1.2;
    }
    .icp-title span {
      font-size: 0.9rem;
      color: var(--gray);
      line-height: 1.4;
      display: block;
    }
    .icp-stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin: 20px 0;
    }
    .icp-stat {
      text-align: center;
      padding: 18px 12px;
      background: #FAFBFC;
      border-radius: 10px;
      border: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 100px;
    }
    .icp-stat .value {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--dark);
      margin-bottom: 8px;
      line-height: 1.3;
      word-break: break-word;
    }
    .icp-stat .label {
      font-size: 0.7rem;
      color: var(--gray);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      line-height: 1.3;
      font-weight: 600;
    }
    .icp-traits {
      list-style: none;
      padding: 0;
      margin: 16px 0 0 0;
      flex: 1;
    }
    .icp-traits li {
      padding: 8px 0;
      font-size: 0.9rem;
      display: flex;
      gap: 10px;
      align-items: flex-start;
      line-height: 1.5;
    }
    .icp-traits li::before {
      content: '✓';
      color: var(--success);
      font-weight: bold;
      flex-shrink: 0;
    }
    @media (max-width: 768px) {
      .icp-stats {
        grid-template-columns: 1fr;
      }
      .icp-grid {
        grid-template-columns: 1fr;
      }
    }
  `;
}
