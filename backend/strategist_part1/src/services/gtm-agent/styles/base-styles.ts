/**
 * Base Styles for Agent Report Template
 * Extracted from agent-report-template.ts
 */

export function getBaseStyles(): string {
  return `
        :root {
            --primary: #6366F1;
            --primary-light: #818CF8;
            --primary-dark: #4F46E5;
            --secondary: #EC4899;
            --accent: #14B8A6;
            --success: #10B981;
            --warning: #F59E0B;
            --warning-dark: #D97706;
            --danger: #EF4444;
            --danger-dark: #DC2626;
            --dark: #1F2937;
            --gray: #6B7280;
            --light-gray: #F3F4F6;
            --white: #FFFFFF;
            --border: #E5E7EB;
            --shadow-xs: 0 2px 8px rgba(0,0,0,0.04);
            --shadow-sm: 0 2px 10px rgba(0,0,0,0.05);
            --shadow-md: 0 4px 20px rgba(0,0,0,0.08);
            --shadow-lg: 0 8px 30px rgba(0,0,0,0.12);
            --shadow-primary: 0 8px 30px rgba(99, 102, 241, 0.15);
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: #FFFFFF;
            color: var(--dark);
            line-height: 1.7;
            min-height: 100vh;
        }
        p {
            line-height: 1.8;
            margin-bottom: 16px;
            text-align: justify;
        }
        h1 { font-size: 2.5rem; line-height: 1.2; margin-bottom: 16px; }
        h2 { font-size: 1.75rem; line-height: 1.3; margin-bottom: 14px; }
        h3 { font-size: 1.35rem; line-height: 1.4; margin-bottom: 12px; }
        h4 { font-size: 1.1rem; line-height: 1.4; margin-bottom: 10px; }
        .card p + p {
            margin-top: 16px;
        }
        .container { max-width: 1100px; margin: 0 auto; padding: 60px 40px; }
        .header {
            background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 30%, #EC4899 70%, #F43F5E 100%);
            color: white;
            padding: 60px 40px;
            border-radius: 24px;
            margin-bottom: 40px;
            position: relative;
            overflow: hidden;
        }
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -20%;
            width: 400px;
            height: 400px;
            background: rgba(255,255,255,0.1);
            border-radius: 50%;
        }
        .header h1 {
            font-size: 2.8rem;
            font-weight: 800;
            margin-bottom: 10px;
            color: white;
            position: relative;
        }
        .header .subtitle {
            font-size: 1.3rem;
            color: white;
            opacity: 0.9;
            font-weight: 400;
            position: relative;
        }
        .header-meta {
            display: flex;
            gap: 32px;
            font-size: 0.85rem;
            color: white;
            opacity: 0.8;
            padding-top: 20px;
            border-top: 1px solid rgba(255,255,255,0.3);
            margin-top: 20px;
            position: relative;
        }
        .header-meta-item {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        .header-meta-label {
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-size: 0.75rem;
            opacity: 0.9;
        }
        .card {
            background: var(--white);
            border-radius: 16px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: var(--shadow-md);
        }
        .card:focus-within {
            outline: 2px solid var(--primary);
            outline-offset: 2px;
        }
        .card-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 2px solid var(--light-gray);
        }
        .card-header .icon {
            width: 48px; height: 48px;
            background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
            border-radius: 12px; display: flex; align-items: center;
            justify-content: center; font-size: 24px;
            flex-shrink: 0;
        }
        .card-header h2 { font-size: 1.5rem; font-weight: 700; color: var(--dark); flex: 1; margin: 0; line-height: 48px; }
        .section-number {
            font-size: 0.85rem;
            color: var(--gray);
            font-weight: 600;
        }
        .exec-summary { background: #FAFBFC; }
        .exec-summary .card-header {
            margin-bottom: 12px;
        }
        .exec-summary > p:first-of-type {
            margin-top: 0;
        }
        .exec-summary p {
            text-align: justify;
            hyphens: auto;
        }
        .exec-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-top: 20px; }
        .exec-stat {
            background: white;
            padding: 24px 20px;
            border-radius: 12px;
            text-align: center;
            box-shadow: var(--shadow-sm);
            min-height: 140px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        .exec-stat .value {
            font-size: 1.6rem;
            font-weight: 800;
            color: var(--primary);
            line-height: 1.3;
            word-break: break-word;
            hyphens: auto;
        }
        .exec-stat .label {
            font-size: 0.85rem;
            color: var(--gray);
            margin-top: 8px;
            line-height: 1.4;
        }
        .profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
        @media (max-width: 768px) { .profile-grid { grid-template-columns: 1fr; } }
        .profile-item { padding: 20px; background: var(--light-gray); border-radius: 12px; }
        .profile-item h4 { font-size: 0.85rem; color: var(--gray); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
        .profile-item p { font-size: 1.1rem; font-weight: 600; color: var(--dark); }
        .usp-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-top: 20px; }
        .usp-box { background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%); padding: 20px; border-radius: 12px; text-align: center; border: 2px solid var(--accent); transition: outline 0.2s ease; }
        .usp-box:focus-within {
            outline: 2px solid var(--primary);
            outline-offset: 2px;
        }
        .usp-box .icon { font-size: 32px; margin-bottom: 8px; }
        .usp-box h4 { font-size: 1rem; font-weight: 700; color: var(--dark); margin-bottom: 4px; }
        .usp-box p { font-size: 0.85rem; color: var(--gray); }
        .market-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 20px; }
        .market-stat-card { background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); color: white; padding: 24px; border-radius: 16px; text-align: center; }
        .market-stat-card .value { font-size: 2.2rem; font-weight: 800; }
        .market-stat-card .label { font-size: 0.9rem; opacity: 0.9; margin-top: 4px; }
        .market-stat-card .growth { display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; margin-top: 8px; }
        .chart-container { position: relative; height: 300px; margin: 20px 0; }
        .competitor-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin-top: 20px;
            border: 1px solid var(--border);
            border-radius: 12px;
            overflow: hidden;
        }
        .competitor-table th {
            background: linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%);
            color: var(--dark);
            padding: 16px 12px;
            text-align: left;
            font-weight: 700;
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 2px solid var(--primary);
        }
        .competitor-table td {
            padding: 16px 12px;
            border-bottom: 1px solid var(--light-gray);
            font-size: 0.9rem;
            vertical-align: top;
        }
        .competitor-table tbody tr {
            transition: background 0.2s ease;
        }
        .competitor-table tbody tr:hover {
            background: #F9FAFB;
        }
        .competitor-table tbody tr:last-child td {
            border-bottom: none;
        }
        .competitor-table tbody tr:nth-child(even) {
            background: #FAFBFC;
        }
        .competitor-type { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
        .type-premium { background: #F3E8FF; color: #7C3AED; }
        .type-mass { background: #FEF3C7; color: #B45309; }
        .type-niche { background: #D1FAE5; color: #065F46; }
        .type-retail { background: #DBEAFE; color: #1D4ED8; }
        .threat-level { display: flex; align-items: center; gap: 8px; }
        .threat-dot { width: 12px; height: 12px; border-radius: 50%; }
        .threat-high { background: #EF4444; }
        .threat-medium { background: #F59E0B; }
        .threat-low { background: #10B981; }
        .footnotes-box { margin-top: 24px; padding: 16px; background: var(--light-gray); border-radius: 12px; }
        .footnotes-box h5 { font-size: 0.9rem; color: var(--accent); margin-bottom: 12px; }
        .footnotes-box ul { list-style: none; font-size: 0.85rem; color: var(--gray); }
        .footnotes-box li { padding: 4px 0; }

        /* Budget Section Styles */
        .budget-card {
            background: #FAFBFC;
            padding: 32px;
            border-radius: 12px;
            border: 1px solid var(--border);
        }
        .budget-header {
            margin-bottom: 28px;
        }
        .budget-amount {
            font-size: 2.2rem;
            font-weight: 700;
            color: var(--dark);
            line-height: 1.2;
            margin-bottom: 8px;
        }
        .budget-period {
            font-size: 0.95rem;
            color: var(--gray);
        }
        .budget-breakdown {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
        }
        .budget-item {
            background: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            border: 1px solid var(--border);
            transition: all 0.2s ease;
        }
        .budget-item:hover {
            box-shadow: var(--shadow-sm);
        }
        .budget-item .amount {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--dark);
            margin-bottom: 8px;
        }
        .budget-item .category {
            font-size: 0.85rem;
            color: var(--gray);
            margin-bottom: 10px;
        }
        .budget-item .percent {
            font-size: 1rem;
            font-weight: 600;
            color: var(--success);
        }

        /* Platform Comparison Styles */
        .platform-comparison {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 24px;
            margin-top: 24px;
        }
        .platform-card {
            background: white;
            border: 2px solid var(--light-gray);
            border-radius: 16px;
            padding: 24px;
            transition: all 0.3s ease;
        }
        .platform-card.recommended {
            border-color: var(--primary);
            box-shadow: 0 8px 30px rgba(79, 70, 229, 0.15);
            background: linear-gradient(135deg, #F5F3FF 0%, #FFFFFF 100%);
        }
        .platform-logo {
            font-size: 48px;
            text-align: center;
            margin-bottom: 16px;
        }
        .platform-name {
            font-size: 1.3rem;
            font-weight: 700;
            text-align: center;
            margin-bottom: 20px;
            color: var(--dark);
        }
        .platform-score {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-bottom: 20px;
        }
        .score-bar {
            height: 8px;
            background: var(--light-gray);
            border-radius: 4px;
            overflow: hidden;
        }
        .score-fill {
            height: 100%;
            border-radius: 4px;
            transition: width 0.5s ease;
        }
        .score-fill.high {
            background: linear-gradient(90deg, var(--success) 0%, var(--accent) 100%);
        }
        .score-fill.medium {
            background: linear-gradient(90deg, var(--warning-dark) 0%, var(--secondary) 100%);
        }
        .platform-pros ul {
            list-style: none;
            padding: 0;
        }
        .platform-pros li {
            padding: 6px 0;
            font-size: 0.9rem;
            display: flex;
            gap: 8px;
        }

        /* KPI Grid Styles */
        .kpi-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 20px;
            margin-top: 24px;
        }
        .kpi-card {
            background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%);
            border: 2px solid var(--primary-light);
            border-radius: 16px;
            padding: 24px;
            transition: all 0.3s ease;
        }
        .kpi-card:hover {
            border-color: var(--primary);
            box-shadow: 0 8px 24px rgba(79, 70, 229, 0.2);
            transform: translateY(-2px);
        }
        .kpi-card .metric {
            font-size: 0.9rem;
            font-weight: 600;
            color: var(--primary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 12px;
        }
        .kpi-card .target {
            font-size: 1.8rem;
            font-weight: 800;
            color: var(--dark);
            margin-bottom: 8px;
        }
        .kpi-card .benchmark {
            font-size: 0.85rem;
            color: var(--gray);
        }

        /* Phase Timeline Styles */
        .phase-timeline {
            display: flex;
            flex-direction: column;
            gap: 20px;
            margin-top: 24px;
        }
        .phase {
            display: flex;
            gap: 20px;
            align-items: flex-start;
        }
        .phase-marker {
            width: 44px;
            height: 44px;
            background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.1rem;
            font-weight: 700;
            flex-shrink: 0;
            box-shadow: 0 2px 8px rgba(79, 70, 229, 0.25);
        }
        .phase-content {
            flex: 1;
            background: #FAFBFC;
            padding: 20px 24px;
            border-radius: 10px;
            border: 1px solid var(--border);
        }
        .phase-content h4 {
            color: var(--primary);
            margin: 0 0 6px 0;
            font-size: 1.05rem;
            font-weight: 600;
        }
        .phase-content .duration {
            font-size: 0.85rem;
            color: var(--gray);
            margin-bottom: 16px;
            font-weight: 500;
        }
        .phase-content ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .phase-content li {
            padding: 8px 0 8px 20px;
            font-size: 0.9rem;
            line-height: 1.6;
            position: relative;
            text-align: left;
        }
        .phase-content li::before {
            content: '→';
            position: absolute;
            left: 0;
            color: var(--primary);
            font-weight: 600;
        }

        /* Risk Item Styles */
        .risk-item {
            display: flex;
            gap: 20px;
            padding: 20px;
            background: var(--light-gray);
            border-radius: 12px;
            margin-bottom: 16px;
            transition: all 0.3s ease;
        }
        .risk-item:hover {
            background: #E5E7EB;
        }
        .risk-icon {
            width: 60px;
            height: 60px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            flex-shrink: 0;
        }
        .risk-icon.high {
            background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%);
        }
        .risk-icon.medium {
            background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
        }
        .risk-icon.low {
            background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%);
        }
        .risk-content {
            flex: 1;
        }
        .risk-content h4 {
            font-size: 1.1rem;
            color: var(--dark);
            margin-bottom: 8px;
        }
        .risk-content p {
            font-size: 0.9rem;
            line-height: 1.6;
        }
        .footer {
            background: white;
            border-top: 1px solid var(--border);
            padding: 40px 40px;
            margin-top: 60px;
            text-align: center;
            color: var(--gray);
            font-size: 0.9rem;
        }
        .footer strong {
            color: var(--dark);
        }
        @media (max-width: 768px) {
            .container {
                padding: 24px 16px;
            }
            .card {
                padding: 24px;
                border-radius: 8px;
            }
            .header h1 {
                font-size: 2rem;
            }
            .exec-grid,
            .market-stats {
                grid-template-columns: 1fr;
            }
            .opportunity-stats-grid {
                grid-template-columns: 1fr 1fr;
            }
            .competitor-table {
                font-size: 0.8rem;
            }
            .competitor-table th,
            .competitor-table td {
                padding: 10px 8px;
            }
        }
        @media print {
            body {
                background: white !important;
            }
            .container {
                max-width: 100%;
                padding: 20px;
            }
            .card {
                break-inside: avoid;
                page-break-inside: avoid;
                box-shadow: none;
                border: 1px solid var(--border);
                margin-bottom: 24px;
            }
            .header {
                break-after: page;
                color: var(--dark) !important;
                background: white !important;
                border: 1px solid var(--border);
            }
            .header h1,
            .header .subtitle,
            .header-meta {
                color: var(--dark) !important;
                opacity: 1 !important;
            }
            .exec-summary {
                background: white !important;
            }
            .usp-box,
            .market-stat-card,
            .platform-card.recommended,
            .kpi-card {
                background: white !important;
                border: 1px solid var(--border) !important;
                color: var(--dark) !important;
            }
            h1, h2, h3 {
                page-break-after: avoid;
            }
        }
`;
}
