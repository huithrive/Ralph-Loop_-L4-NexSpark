const mock = {

  dashboard: {
    kpis: {
      revenue: { label: 'Revenue', value: '$4,280', change: '+18.3%', trend: 'up' },
      roas: { label: 'ROAS', value: '3.2x', change: '+0.4x', trend: 'up' },
      activeCampaigns: { label: 'Active Campaigns', value: '3', change: '+1', trend: 'up' },
      cpa: { label: 'CPA', value: '$12.40', change: '-$2.10', trend: 'down' },
    },
    goal: {
      target: 10000,
      current: 4280,
      label: '$10K Monthly Revenue Goal',
    },
    moduleStatus: [
      { id: 'strategist', name: 'Strategist', icon: '🎯', status: 'complete', progress: 100, description: 'Research & GTM plan ready' },
      { id: 'executor', name: 'Executor', icon: '⚡', status: 'in-progress', progress: 75, description: 'Landing pages live, creatives generating' },
      { id: 'advertiser', name: 'Advertiser', icon: '📢', status: 'in-progress', progress: 60, description: '3 campaigns running' },
      { id: 'analyzer', name: 'Analyzer', icon: '📊', status: 'active', progress: 40, description: 'Monitoring performance' },
    ],
    activityFeed: [
      { time: '2 min ago', text: 'Campaign "Summer Launch" ROAS improved to 3.8x', type: 'success' },
      { time: '15 min ago', text: 'New creative "Hero-Video-03" generation complete', type: 'info' },
      { time: '1 hr ago', text: 'Meta Pixel firing 142 events/hr — healthy', type: 'success' },
      { time: '2 hrs ago', text: 'Domain nexspark-demo.com DNS propagated', type: 'info' },
      { time: '4 hrs ago', text: 'Optimization: Pause underperforming ad set #4', type: 'warning' },
      { time: '6 hrs ago', text: 'Landing page A/B test: Variant B +22% conversion', type: 'success' },
      { time: '1 day ago', text: 'Shopify store synced — 8 products live', type: 'info' },
    ],
    chartData: {
      labels: Array.from({ length: 30 }, (_, i) => `Jan ${i + 1}`),
      revenue: [120, 180, 150, 220, 280, 200, 310, 250, 190, 340, 290, 370, 320, 410, 380, 350, 420, 460, 390, 510, 480, 440, 530, 570, 520, 600, 580, 550, 620, 650],
      spend: [80, 90, 85, 100, 110, 95, 120, 105, 92, 130, 115, 140, 125, 150, 142, 135, 155, 165, 148, 175, 170, 160, 180, 190, 178, 195, 192, 185, 200, 210],
    },
  },

  strategist: {
    recentResearch: [
      {
        id: 'res-001',
        name: 'Eco-Friendly Water Bottles',
        url: 'https://greenhydro.example.com',
        date: 'Jan 28, 2025',
        status: 'complete',
        marketSize: '$2.4B',
        competitors: 12,
        channels: 5,
      },
      {
        id: 'res-002',
        name: 'AI Fitness Coaching App',
        url: 'https://fitai.example.com',
        date: 'Jan 25, 2025',
        status: 'complete',
        marketSize: '$4.8B',
        competitors: 8,
        channels: 4,
      },
      {
        id: 'res-003',
        name: 'Premium Pet Food Subscription',
        url: 'https://pawmeals.example.com',
        date: 'Jan 20, 2025',
        status: 'complete',
        marketSize: '$1.9B',
        competitors: 15,
        channels: 6,
      },
    ],
    researchResult: {
      productName: 'Eco-Friendly Water Bottles',
      marketSize: '$2.4 Billion',
      growthRate: '8.2% CAGR',
      competitors: [
        { name: 'HydroFlask', strength: 'Brand Recognition', weakness: 'Premium pricing', share: '22%' },
        { name: 'S\'well', strength: 'Fashion-forward design', weakness: 'Limited sizes', share: '15%' },
        { name: 'Yeti', strength: 'Durability reputation', weakness: 'Heavy weight', share: '18%' },
        { name: 'Nalgene', strength: 'Affordability', weakness: 'Basic aesthetics', share: '12%' },
      ],
      channels: [
        { name: 'Meta Ads (Instagram)', priority: 'High', reason: 'Visual product, lifestyle targeting' },
        { name: 'Google Shopping', priority: 'High', reason: 'High purchase intent traffic' },
        { name: 'TikTok Ads', priority: 'Medium', reason: 'Trending eco-conscious content' },
        { name: 'Influencer Marketing', priority: 'Medium', reason: 'Eco-lifestyle creators' },
        { name: 'Email Marketing', priority: 'Low', reason: 'Post-purchase retention' },
      ],
      personas: [
        { name: 'Eco Emma', age: '25-34', income: '$55K-$85K', traits: 'Sustainability-focused, active lifestyle, social media savvy' },
        { name: 'Fitness Frank', age: '28-40', income: '$65K-$100K', traits: 'Gym-goer, values durability, brand-conscious' },
      ],
      painPoints: ['Single-use plastic guilt', 'Bottles that dent/break easily', 'Temperature retention issues', 'Heavy/bulky designs', 'Bland aesthetics'],
    },
    interviewQuestions: [
      { id: 1, question: 'Describe your ideal customer in detail. What does their typical day look like?', hint: 'Think about demographics, lifestyle, daily routines, and pain points.' },
      { id: 2, question: 'What makes your product different from the top 3 competitors in your space?', hint: 'Focus on unique features, pricing, quality, or experience differences.' },
      { id: 3, question: 'What is your budget range for the first 90 days of marketing?', hint: 'Include ad spend, content creation, and tool subscriptions.' },
      { id: 4, question: 'What does success look like for you in 6 months? What specific metrics matter most?', hint: 'Revenue targets, customer counts, ROAS goals, brand awareness metrics.' },
    ],
    sampleResponses: [
      'Our ideal customer is a 25-35 year old urban professional who cares about sustainability. They go to the gym 3-4 times a week, carry a reusable bottle everywhere, and are willing to pay $35-50 for a high-quality product.',
      'We use 100% recycled ocean plastic for the shell and triple-wall vacuum insulation. Competitors use virgin plastic. Our bottles keep drinks cold 30% longer than HydroFlask and weigh 20% less than Yeti.',
      'We have $5,000 allocated for the first 90 days. We want to focus primarily on Meta and Google ads, with a small budget for influencer seeding.',
      'In 6 months we want to hit $10K monthly revenue with a 3x ROAS. We want at least 500 customers and a 15% repeat purchase rate.',
    ],
    interviewAnalysis: {
      strengths: ['Clear target audience definition', 'Strong product differentiation', 'Realistic budget expectations', 'Measurable success metrics'],
      opportunities: ['TikTok eco-content trend alignment', 'Subscription model potential', 'B2B corporate gifting channel'],
      recommendations: ['Lead with sustainability messaging', 'Focus initial spend on Meta (Instagram Stories)', 'Build email list for retention from day 1'],
      confidenceScore: 87,
    },
    gtmReport: {
      sections: [
        {
          id: 'executive-summary',
          title: 'Executive Summary',
          content: 'GreenHydro is positioned to capture a growing segment of the $2.4B eco-friendly water bottle market. With a unique value proposition of 100% recycled ocean plastic construction and superior insulation, the brand targets environmentally conscious urban professionals aged 25-35. The recommended go-to-market strategy leverages Meta and Google ads with a $5,000 initial budget over 90 days, targeting $10K monthly revenue within 6 months.',
        },
        {
          id: 'market-analysis',
          title: 'Market Analysis',
          content: 'The reusable water bottle market is valued at $2.4B with an 8.2% CAGR. Key growth drivers include increasing environmental awareness (72% of millennials prefer eco-brands), fitness culture expansion, and corporate sustainability mandates. The eco-premium segment (bottles made from recycled materials) represents 18% of the market and is growing at 14.5% annually — nearly double the overall market rate.',
        },
        {
          id: 'target-audience',
          title: 'Target Audience Profiles',
          content: 'Primary: "Eco Emma" — Female, 25-34, urban, $55K-$85K income, values sustainability, active on Instagram. Buys based on environmental impact and aesthetics. Secondary: "Fitness Frank" — Male, 28-40, suburban, $65K-$100K income, values durability and performance. Buys based on functionality and brand reputation.',
        },
        {
          id: 'competitive-landscape',
          title: 'Competitive Landscape',
          content: 'The market is dominated by HydroFlask (22%), Yeti (18%), and S\'well (15%). However, none prominently feature recycled materials as their primary value proposition. GreenHydro can occupy the "premium eco-performance" positioning gap. Price point of $38-45 sits between affordable (Nalgene $12) and ultra-premium (Yeti $50+).',
        },
        {
          id: 'channel-strategy',
          title: 'Channel Strategy',
          content: 'Phase 1 (Days 1-30): Meta Ads — Instagram Stories/Reels targeting eco-conscious audiences. Budget: $2,000. Expected ROAS: 2.0x. Phase 2 (Days 31-60): Add Google Shopping ads for high-intent searches. Budget: $1,500. Expected ROAS: 2.8x. Phase 3 (Days 61-90): Scale winning channels, add TikTok testing. Budget: $1,500. Expected ROAS: 3.2x.',
        },
        {
          id: 'action-plan',
          title: '90-Day Action Plan',
          content: 'Week 1-2: Launch landing page, set up Shopify store, install Meta Pixel. Week 3-4: Launch Meta ad campaigns (3 ad sets, 4 creatives each). Week 5-6: Optimize based on initial data, add Google Shopping. Week 7-8: Scale winning ads, pause underperformers. Week 9-10: Add TikTok ads, launch email sequences. Week 11-12: Full optimization cycle, prepare for month 4 scaling.',
        },
        {
          id: 'kpis',
          title: 'KPIs & Measurement Framework',
          content: 'Primary KPIs: Monthly Revenue ($10K target at 6 months), ROAS (3.0x target), CPA (under $15). Secondary KPIs: CTR (>2.5%), Conversion Rate (>3.5%), Email List Size (500+ subscribers), Repeat Purchase Rate (>15%). Tracking: Meta Pixel + Google Analytics 4 + Shopify analytics. Weekly reporting cadence with monthly deep-dive reviews.',
        },
      ],
    },
  },

  executor: {
    landingPages: [
      { id: 'lp-001', name: 'GreenHydro — Hero Launch', url: 'https://greenhydro.nexspark.demo/launch', status: 'live', conversions: 142, views: 3840, conversionRate: '3.7%', createdAt: 'Jan 22, 2025' },
      { id: 'lp-002', name: 'GreenHydro — Eco Impact', url: 'https://greenhydro.nexspark.demo/eco', status: 'live', conversions: 98, views: 2210, conversionRate: '4.4%', createdAt: 'Jan 25, 2025' },
      { id: 'lp-003', name: 'GreenHydro — Holiday Bundle', url: 'https://greenhydro.nexspark.demo/holiday', status: 'draft', conversions: 0, views: 0, conversionRate: '—', createdAt: 'Jan 30, 2025' },
    ],
    shopify: {
      connected: true,
      storeName: 'GreenHydro Official',
      storeUrl: 'greenhydro-official.myshopify.com',
      products: [
        { id: 'prod-001', name: 'Ocean Blue 24oz', price: '$38.00', status: 'active', inventory: 245, image: '🫗' },
        { id: 'prod-002', name: 'Coral Pink 24oz', price: '$38.00', status: 'active', inventory: 189, image: '🫗' },
        { id: 'prod-003', name: 'Forest Green 32oz', price: '$42.00', status: 'active', inventory: 156, image: '🫗' },
        { id: 'prod-004', name: 'Midnight Black 32oz', price: '$42.00', status: 'active', inventory: 201, image: '🫗' },
        { id: 'prod-005', name: 'Sunset Gold 24oz', price: '$38.00', status: 'active', inventory: 134, image: '🫗' },
        { id: 'prod-006', name: 'Arctic White 32oz', price: '$42.00', status: 'draft', inventory: 300, image: '🫗' },
        { id: 'prod-007', name: 'Travel Bundle (3-pack)', price: '$99.00', status: 'active', inventory: 78, image: '📦' },
        { id: 'prod-008', name: 'Gift Set + Carrier', price: '$55.00', status: 'active', inventory: 92, image: '🎁' },
      ],
    },
    domainResults: [
      { domain: 'greenhydro.com', available: false, price: null },
      { domain: 'greenhydro.co', available: true, price: '$12.99/yr' },
      { domain: 'greenhydro.store', available: true, price: '$9.99/yr' },
      { domain: 'greenhydro.shop', available: true, price: '$11.99/yr' },
      { domain: 'getgreenhydro.com', available: true, price: '$10.99/yr' },
      { domain: 'mygreenhydro.com', available: true, price: '$10.99/yr' },
      { domain: 'greenhydro.eco', available: true, price: '$14.99/yr' },
    ],
    creatives: [
      { id: 'cr-001', name: 'Hero-Video-01', type: 'video', style: 'cinematic', status: 'complete', duration: '15s', thumbnail: '🎬', createdAt: 'Jan 23, 2025' },
      { id: 'cr-002', name: 'Product-Spin-01', type: 'video', style: '3d', status: 'complete', duration: '10s', thumbnail: '🎬', createdAt: 'Jan 24, 2025' },
      { id: 'cr-003', name: 'Lifestyle-Story-01', type: 'image', style: 'photo', status: 'complete', duration: null, thumbnail: '🖼️', createdAt: 'Jan 25, 2025' },
      { id: 'cr-004', name: 'Eco-Impact-Ad-01', type: 'image', style: 'anime', status: 'processing', duration: null, thumbnail: '⏳', createdAt: 'Jan 30, 2025' },
      { id: 'cr-005', name: 'UGC-Style-Video-01', type: 'video', style: 'ugc', status: 'queued', duration: '30s', thumbnail: '🕐', createdAt: 'Jan 30, 2025' },
    ],
  },

  advertiser: {
    connections: [
      { platform: 'Meta Business', icon: '📘', connected: true, accountName: 'GreenHydro BM #847291', status: 'healthy', lastSync: '2 min ago' },
      { platform: 'Google Ads', icon: '🔍', connected: true, accountName: 'GreenHydro Ads #331-882-9912', status: 'healthy', lastSync: '5 min ago' },
      { platform: 'Shopify', icon: '🛍️', connected: true, accountName: 'greenhydro-official', status: 'healthy', lastSync: '1 min ago' },
    ],
    pixel: {
      installed: true,
      pixelId: '482910384756',
      status: 'healthy',
      eventsLast24h: 3412,
      topEvents: [
        { name: 'PageView', count: 2180, status: 'firing' },
        { name: 'ViewContent', count: 842, status: 'firing' },
        { name: 'AddToCart', count: 234, status: 'firing' },
        { name: 'InitiateCheckout', count: 98, status: 'firing' },
        { name: 'Purchase', count: 58, status: 'firing' },
      ],
    },
    campaigns: [
      {
        id: 'camp-001',
        name: 'Summer Launch — Meta',
        platform: 'Meta',
        status: 'active',
        objective: 'Conversions',
        budget: '$50/day',
        spent: '$1,240',
        impressions: '48,200',
        clicks: '1,890',
        ctr: '3.92%',
        conversions: 86,
        cpa: '$14.42',
        roas: '3.8x',
        startDate: 'Jan 15, 2025',
      },
      {
        id: 'camp-002',
        name: 'Google Shopping — Core',
        platform: 'Google',
        status: 'active',
        objective: 'Sales',
        budget: '$35/day',
        spent: '$820',
        impressions: '22,100',
        clicks: '1,120',
        ctr: '5.07%',
        conversions: 52,
        cpa: '$15.77',
        roas: '2.9x',
        startDate: 'Jan 20, 2025',
      },
      {
        id: 'camp-003',
        name: 'Retargeting — Meta',
        platform: 'Meta',
        status: 'paused',
        objective: 'Conversions',
        budget: '$25/day',
        spent: '$380',
        impressions: '12,400',
        clicks: '620',
        ctr: '5.00%',
        conversions: 28,
        cpa: '$13.57',
        roas: '3.2x',
        startDate: 'Jan 22, 2025',
      },
    ],
    wizardSteps: ['Platform & Objective', 'Audience & Targeting', 'Budget & Schedule', 'Creative & Copy', 'Review & Launch'],
  },

  chat: {
    welcomeMessages: [
      { role: 'agent', type: 'text', showLabel: true, text: 'Welcome to <strong>NexSpark AI Growth OS</strong>. I\'m your AI growth strategist. I can help you research markets, build campaigns, analyze performance, and more.' },
      { role: 'agent', type: 'text', text: 'What would you like to work on today?' },
      {
        role: 'agent', type: 'choices',
        choices: [
          { label: 'View Dashboard', icon: '🏠', command: '/dashboard' },
          { label: 'Run Research', icon: '🎯', command: '/research' },
          { label: 'See Campaigns', icon: '📢', command: '/campaigns' },
          { label: 'View Report', icon: '📋', command: '/report' },
        ],
      },
    ],
    proactiveMessages: [
      {
        messages: [
          { role: 'agent', type: 'divider', text: 'Proactive Insight' },
          { role: 'agent', type: 'text', showLabel: true, text: 'I noticed your <strong>Summer Launch — Meta</strong> campaign ROAS jumped to 3.8x. This is 27% above your target. Consider scaling the daily budget to capture more conversions.' },
          { role: 'agent', type: 'choices', choices: [
            { label: 'View Optimizations', icon: '🔧', command: '/optimize' },
            { label: 'See Performance', icon: '📊', command: '/performance' },
          ]},
        ],
      },
      {
        messages: [
          { role: 'agent', type: 'divider', text: 'Creative Alert' },
          { role: 'agent', type: 'text', showLabel: true, text: 'Your <strong>Eco-Impact-Ad-01</strong> creative just finished processing. It\'s ready for review in the Creative Studio.' },
          { role: 'agent', type: 'choices', choices: [
            { label: 'Open Creative Studio', icon: '🎨', command: '/creative' },
          ]},
        ],
      },
      {
        messages: [
          { role: 'agent', type: 'divider', text: 'Performance Update' },
          { role: 'agent', type: 'text', showLabel: true, text: 'Weekly summary: You\'ve spent <strong>$2,440</strong> and generated <strong>$7,820</strong> in revenue this period. Overall ROAS is 3.2x — exceeding your 3.0x target.' },
          { role: 'agent', type: 'kpi-inline', kpis: [
            { label: 'Revenue', value: '$7,820', change: '+$1,380', trend: 'up' },
            { label: 'ROAS', value: '3.2x', change: '+0.4x', trend: 'up' },
          ]},
        ],
      },
    ],
    flows: {
      dashboard: {
        messages: [
          { role: 'agent', type: 'text', showLabel: true, text: 'Loading your dashboard with the latest KPIs and module status.' },
          { role: 'agent', type: 'kpi-inline', kpis: [
            { label: 'Revenue', value: '$4,280', change: '+18.3%', trend: 'up' },
            { label: 'ROAS', value: '3.2x', change: '+0.4x', trend: 'up' },
            { label: 'CPA', value: '$12.40', change: '-$2.10', trend: 'down' },
          ]},
          { role: 'agent', type: 'artifact-link', artifact: { id: 'dashboard', title: 'Dashboard', icon: '🏠', description: 'KPIs, goals, activity feed', route: '/canvas/dashboard' }},
          { role: 'agent', type: 'choices', choices: [
            { label: 'Run Research', icon: '🎯', command: '/research' },
            { label: 'See Campaigns', icon: '📢', command: '/campaigns' },
          ]},
        ],
      },
      research: {
        messages: [
          { role: 'agent', type: 'text', showLabel: true, text: 'Starting market research analysis for <strong>Eco-Friendly Water Bottles</strong>...' },
          { role: 'agent', type: 'progress', steps: [
            { text: 'Analyzing market size & trends', done: true },
            { text: 'Identifying competitors', done: true },
            { text: 'Mapping advertising channels', done: true },
            { text: 'Building customer personas', done: true },
            { text: 'Compiling research report', done: true },
          ]},
          { role: 'agent', type: 'text', text: 'Research complete. Found a <strong>$2.4B market</strong> growing at 8.2% CAGR with 12 competitors. The eco-premium segment is growing at 14.5% annually.' },
          { role: 'agent', type: 'artifact-link', artifact: { id: 'research', title: 'Market Research', icon: '🎯', description: 'Competitors, channels, personas', route: '/canvas/strategist/research' }},
          { role: 'agent', type: 'choices', choices: [
            { label: 'View GTM Report', icon: '📋', command: '/report' },
            { label: 'Start Interview', icon: '🎙️', command: '/interview' },
            { label: 'View Dashboard', icon: '🏠', command: '/dashboard' },
          ]},
        ],
      },
      report: {
        messages: [
          { role: 'agent', type: 'text', showLabel: true, text: 'Here\'s your Go-To-Market report for <strong>GreenHydro</strong>. It covers market analysis, target audience, competitive landscape, and the 90-day action plan.' },
          { role: 'agent', type: 'artifact-link', artifact: { id: 'report', title: 'GTM Report', icon: '📋', description: '7 sections — executive summary to KPIs', route: '/canvas/strategist/report' }},
          { role: 'agent', type: 'choices', choices: [
            { label: 'Build Landing Page', icon: '⚡', command: '/landing-page' },
            { label: 'Launch Campaigns', icon: '📢', command: '/campaigns' },
          ]},
        ],
      },
      'landing-page': {
        messages: [
          { role: 'agent', type: 'text', showLabel: true, text: 'You have <strong>3 landing pages</strong> — 2 are live and converting. The Eco Impact page leads with a 4.4% conversion rate.' },
          { role: 'agent', type: 'kpi-inline', kpis: [
            { label: 'Hero Launch', value: '3.7%', change: '142 conv' },
            { label: 'Eco Impact', value: '4.4%', change: '98 conv' },
          ]},
          { role: 'agent', type: 'artifact-link', artifact: { id: 'landing-pages', title: 'Landing Pages', icon: '⚡', description: 'View, create, and manage pages', route: '/canvas/executor/landing-pages' }},
          { role: 'agent', type: 'choices', choices: [
            { label: 'Generate Creatives', icon: '🎨', command: '/creative' },
            { label: 'Setup Shopify', icon: '🛍️', command: '/shopify' },
          ]},
        ],
      },
      campaigns: {
        messages: [
          { role: 'agent', type: 'text', showLabel: true, text: 'You have <strong>3 campaigns</strong> across Meta and Google. 2 are active, 1 is paused.' },
          { role: 'agent', type: 'kpi-inline', kpis: [
            { label: 'Active', value: '2' },
            { label: 'Total Spend', value: '$2,440' },
            { label: 'Avg ROAS', value: '3.2x', change: '+0.4x', trend: 'up' },
          ]},
          { role: 'agent', type: 'artifact-link', artifact: { id: 'campaigns', title: 'Campaigns', icon: '📢', description: 'Manage and create campaigns', route: '/canvas/advertiser/campaigns' }},
          { role: 'agent', type: 'choices', choices: [
            { label: 'View Performance', icon: '📊', command: '/performance' },
            { label: 'Optimize', icon: '🔧', command: '/optimize' },
          ]},
        ],
      },
      performance: {
        messages: [
          { role: 'agent', type: 'text', showLabel: true, text: 'Here\'s your campaign performance breakdown. <strong>Summer Launch — Meta</strong> is your top performer at 3.8x ROAS.' },
          { role: 'agent', type: 'kpi-inline', kpis: [
            { label: 'Total Revenue', value: '$7,820', change: '+$1,380', trend: 'up' },
            { label: 'Avg CPA', value: '$14.53', change: '-$1.80', trend: 'down' },
          ]},
          { role: 'agent', type: 'artifact-link', artifact: { id: 'performance', title: 'Campaign Performance', icon: '📊', description: 'Charts, tables, trends', route: '/canvas/analyzer/performance' }},
          { role: 'agent', type: 'choices', choices: [
            { label: 'Run Optimizations', icon: '🔧', command: '/optimize' },
            { label: 'View Campaigns', icon: '📢', command: '/campaigns' },
          ]},
        ],
      },
      optimize: {
        messages: [
          { role: 'agent', type: 'text', showLabel: true, text: 'I\'ve identified <strong>4 optimization opportunities</strong> that could add an estimated $2,900/mo in revenue.' },
          { role: 'agent', type: 'progress', steps: [
            { text: 'Increase Summer Launch budget ($50→$75/day) — +$1,200/mo', done: false },
            { text: 'Refresh Google Shopping creatives — +$400/mo', done: false },
            { text: 'Expand Meta lookalike to 2% — +$800/mo', done: false },
            { text: 'Resume retargeting with new creative — +$500/mo', done: false },
          ]},
          { role: 'agent', type: 'artifact-link', artifact: { id: 'optimize', title: 'Optimizations', icon: '🔧', description: 'Review and apply recommendations', route: '/canvas/analyzer/optimize' }},
          { role: 'agent', type: 'choices', choices: [
            { label: 'View Performance', icon: '📊', command: '/performance' },
            { label: 'Generate Creatives', icon: '🎨', command: '/creative' },
          ]},
        ],
      },
      creative: {
        messages: [
          { role: 'agent', type: 'text', showLabel: true, text: 'Your Creative Studio has <strong>5 assets</strong> — 3 complete, 1 processing, 1 queued. Open the studio to generate new creatives or review existing ones.' },
          { role: 'agent', type: 'artifact-link', artifact: { id: 'creative', title: 'Creative Studio', icon: '🎨', description: 'Videos, images, ad creatives', route: '/canvas/executor/creative' }},
          { role: 'agent', type: 'choices', choices: [
            { label: 'Build Landing Page', icon: '⚡', command: '/landing-page' },
            { label: 'View Campaigns', icon: '📢', command: '/campaigns' },
          ]},
        ],
      },
      shopify: {
        messages: [
          { role: 'agent', type: 'text', showLabel: true, text: 'Your Shopify store <strong>GreenHydro Official</strong> is connected with 8 products live. Inventory is healthy across all SKUs.' },
          { role: 'agent', type: 'artifact-link', artifact: { id: 'shopify', title: 'Shopify Store', icon: '🛍️', description: 'Products, inventory, sync status', route: '/canvas/executor/shopify' }},
          { role: 'agent', type: 'choices', choices: [
            { label: 'Build Landing Page', icon: '⚡', command: '/landing-page' },
            { label: 'Setup Domains', icon: '🌐', command: '/domains' },
          ]},
        ],
      },
      interview: {
        messages: [
          { role: 'agent', type: 'text', showLabel: true, text: 'The Voice Interview helps me understand your business deeply. I\'ll ask 4 questions about your customers, differentiators, budget, and success metrics.' },
          { role: 'agent', type: 'progress', steps: [
            { text: 'Ideal customer profile', done: false },
            { text: 'Competitive differentiators', done: false },
            { text: 'Budget & timeline', done: false },
            { text: 'Success metrics', done: false },
          ]},
          { role: 'agent', type: 'artifact-link', artifact: { id: 'interview', title: 'Voice Interview', icon: '🎙️', description: 'Interactive Q&A session', route: '/canvas/strategist/interview' }},
          { role: 'agent', type: 'choices', choices: [
            { label: 'View Research', icon: '🎯', command: '/research' },
            { label: 'View Report', icon: '📋', command: '/report' },
          ]},
        ],
      },
      connections: {
        messages: [
          { role: 'agent', type: 'text', showLabel: true, text: 'All <strong>3 platform connections</strong> are healthy — Meta Business, Google Ads, and Shopify are syncing normally.' },
          { role: 'agent', type: 'artifact-link', artifact: { id: 'connections', title: 'Connections', icon: '🔗', description: 'Platform integrations status', route: '/canvas/advertiser/connections' }},
          { role: 'agent', type: 'choices', choices: [
            { label: 'Setup Pixel', icon: '📍', command: '/pixel' },
            { label: 'Launch Campaigns', icon: '📢', command: '/campaigns' },
          ]},
        ],
      },
      pixel: {
        messages: [
          { role: 'agent', type: 'text', showLabel: true, text: 'Your Meta Pixel is <strong>healthy</strong> and firing 3,412 events in the last 24 hours. All 5 standard events (PageView through Purchase) are active.' },
          { role: 'agent', type: 'kpi-inline', kpis: [
            { label: 'Events/24h', value: '3,412' },
            { label: 'Status', value: 'Healthy' },
          ]},
          { role: 'agent', type: 'artifact-link', artifact: { id: 'pixel', title: 'Meta Pixel', icon: '📍', description: 'Event tracking and diagnostics', route: '/canvas/advertiser/pixel' }},
          { role: 'agent', type: 'choices', choices: [
            { label: 'View Connections', icon: '🔗', command: '/connections' },
            { label: 'View Campaigns', icon: '📢', command: '/campaigns' },
          ]},
        ],
      },
      domains: {
        messages: [
          { role: 'agent', type: 'text', showLabel: true, text: 'Search and register domains for your brand. Currently exploring options for <strong>GreenHydro</strong>.' },
          { role: 'agent', type: 'artifact-link', artifact: { id: 'domains', title: 'Domain Setup', icon: '🌐', description: 'Search and register domains', route: '/canvas/executor/domains' }},
          { role: 'agent', type: 'choices', choices: [
            { label: 'Setup Shopify', icon: '🛍️', command: '/shopify' },
            { label: 'Build Landing Page', icon: '⚡', command: '/landing-page' },
          ]},
        ],
      },
    },
    nlKeywords: {
      dashboard: ['dashboard', 'home', 'overview', 'kpi', 'summary', 'status'],
      research: ['research', 'market', 'analyze market', 'competitors', 'personas'],
      report: ['report', 'gtm', 'go to market', 'strategy', 'plan'],
      'landing-page': ['landing', 'landing page', 'pages', 'lp'],
      campaigns: ['campaign', 'campaigns', 'ads', 'advertising', 'ad campaigns'],
      performance: ['performance', 'analytics', 'metrics', 'results', 'data'],
      optimize: ['optimize', 'optimization', 'improve', 'recommendations', 'suggestions'],
      creative: ['creative', 'creatives', 'studio', 'design', 'images', 'videos', 'assets'],
      shopify: ['shopify', 'store', 'products', 'inventory', 'ecommerce'],
      interview: ['interview', 'questions', 'voice', 'qa', 'discovery'],
      connections: ['connections', 'connect', 'integrations', 'platforms'],
      pixel: ['pixel', 'meta pixel', 'tracking', 'events', 'facebook pixel'],
      domains: ['domain', 'domains', 'dns', 'url', 'website'],
    },
  },

  builder: {
    questions: [
      { id: 1, key: 'headline', text: 'What headline should grab your visitors\' attention?', hint: 'e.g. "The Last Water Bottle You\'ll Ever Need"', placeholder: 'Type your headline...' },
      { id: 2, key: 'cta', text: 'What should your call-to-action button say?', hint: 'e.g. "Shop Now", "Get 20% Off", "Start Free Trial"', placeholder: 'Type your CTA text...' },
      { id: 3, key: 'sellingPoints', text: 'List 3-4 key selling points (comma-separated).', hint: 'e.g. "100% recycled ocean plastic, 30hr cold retention, Lifetime warranty"', placeholder: 'Feature 1, Feature 2, Feature 3...' },
    ],
    templates: [
      { id: 'hero-bold', name: 'Hero Bold', description: 'Full-screen hero with bold headline, social proof bar, and prominent CTA.', tags: ['High Impact', 'Best for DTC'], recommended: true },
      { id: 'product-showcase', name: 'Product Showcase', description: 'Product-centered layout with feature grid and comparison table.', tags: ['Product Focus', 'E-commerce'], recommended: false },
      { id: 'story-scroll', name: 'Story Scroll', description: 'Narrative-driven long page with sequential sections and parallax feel.', tags: ['Brand Story', 'Engagement'], recommended: false },
      { id: 'minimal-cta', name: 'Minimal CTA', description: 'Clean, minimal design focused on a single conversion action.', tags: ['Simple', 'Fast Load'], recommended: false },
    ],
    generatedPage: {
      hero: {
        badge: 'Eco-Friendly Collection',
        headline: 'The Last Water Bottle You\'ll Ever Need',
        subheadline: 'Made from 100% recycled ocean plastic. Keeps drinks cold for 30 hours. Built to last a lifetime.',
        ctaText: 'Shop Now — 20% Off',
        subtext: 'Free shipping on orders over $35',
      },
      features: [
        { icon: '♻️', title: '100% Recycled Ocean Plastic', description: 'Every bottle removes 3 lbs of plastic from the ocean.' },
        { icon: '❄️', title: '30-Hour Cold Retention', description: 'Triple-wall vacuum insulation outperforms every competitor.' },
        { icon: '🪶', title: '20% Lighter Than Competitors', description: 'Aerospace-grade materials keep weight down without sacrificing durability.' },
        { icon: '🛡️', title: 'Lifetime Warranty', description: 'If it ever breaks, we replace it. No questions asked.' },
      ],
      socialProof: {
        rating: 4.9,
        reviewCount: 2847,
        testimonials: [
          { name: 'Sarah K.', text: 'Best water bottle I\'ve ever owned. Still ice cold after a full day at the beach.', stars: 5 },
          { name: 'Mike R.', text: 'Love that it\'s made from recycled ocean plastic. Feels premium and the weight is perfect.', stars: 5 },
          { name: 'Jenna L.', text: 'Bought 3 more for my family. The lifetime warranty sealed the deal for me.', stars: 5 },
        ],
      },
      pricing: {
        discountBadge: 'LAUNCH SPECIAL',
        originalPrice: '$48.00',
        salePrice: '$38.00',
        variants: ['Ocean Blue', 'Coral Pink', 'Forest Green', 'Midnight Black'],
        ctaText: 'Add to Cart',
      },
      trustFooter: [
        { icon: '✓', text: '30-Day Money-Back Guarantee' },
        { icon: '🚚', text: 'Free Shipping Over $35' },
        { icon: '🔒', text: 'Secure Checkout' },
      ],
    },
    refinements: {
      'bigger headline': { section: 'hero', field: 'headlineSize', value: 'large', ack: 'Made the headline larger and bolder.' },
      'larger headline': { section: 'hero', field: 'headlineSize', value: 'large', ack: 'Increased the headline size.' },
      'blue cta': { section: 'hero', field: 'ctaColor', value: 'blue', ack: 'Changed the CTA button to blue.' },
      'green cta': { section: 'hero', field: 'ctaColor', value: 'green', ack: 'Changed the CTA button to green.' },
      'red cta': { section: 'hero', field: 'ctaColor', value: 'red', ack: 'Changed the CTA button to red.' },
      'add pricing': { section: 'pricing', field: 'visible', value: true, ack: 'Added the pricing section.' },
      'remove pricing': { section: 'pricing', field: 'visible', value: false, ack: 'Removed the pricing section.' },
      'more testimonials': { section: 'socialProof', field: 'expanded', value: true, ack: 'Expanded the testimonials section.' },
      'dark mode': { section: 'hero', field: 'theme', value: 'dark', ack: 'Switched to dark theme.' },
      'light mode': { section: 'hero', field: 'theme', value: 'light', ack: 'Switched to light theme.' },
    },
  },

  creativeGen: {
    questions: [
      { id: 1, key: 'type', text: 'What type of creative do you need?', hint: 'Image for static ads, Video for dynamic content', placeholder: 'image or video' },
      { id: 2, key: 'style', text: 'What visual style should it have?', hint: 'e.g. cinematic, 3D render, anime, photo-realistic, UGC', placeholder: 'Type a style...' },
      { id: 3, key: 'prompt', text: 'Describe the scene or concept for your creative.', hint: 'e.g. "A person hiking with our water bottle at golden hour, ocean cliffs in background"', placeholder: 'Describe your creative...' },
    ],
    styles: [
      { id: 'cinematic', name: 'Cinematic', description: 'High-contrast, dramatic lighting' },
      { id: '3d', name: '3D Render', description: 'Clean product visualization' },
      { id: 'anime', name: 'Anime', description: 'Stylized illustration' },
      { id: 'photo', name: 'Photo-realistic', description: 'Natural photography look' },
      { id: 'ugc', name: 'UGC Style', description: 'Authentic user-generated feel' },
    ],
    generatedCreative: {
      name: 'Ad-Creative-Gen-01',
      type: 'image',
      style: 'cinematic',
      status: 'complete',
      resolution: '1080x1080',
      format: 'PNG',
      fileSize: '2.4 MB',
      prompt: 'A person hiking with our water bottle at golden hour, ocean cliffs in background',
      variations: [
        { id: 'var-1', label: 'Original', thumbnail: '🖼️', selected: true },
        { id: 'var-2', label: 'Variation A', thumbnail: '🖼️', selected: false },
        { id: 'var-3', label: 'Variation B', thumbnail: '🖼️', selected: false },
        { id: 'var-4', label: 'Variation C', thumbnail: '🖼️', selected: false },
      ],
      scores: {
        engagement: 87,
        brandFit: 92,
        clarity: 85,
      },
    },
  },

  analyzer: {
    kpis: {
      totalSpend: { label: 'Total Spend', value: '$2,440', change: '+$420', trend: 'up' },
      totalRevenue: { label: 'Total Revenue', value: '$7,820', change: '+$1,380', trend: 'up' },
      avgRoas: { label: 'Average ROAS', value: '3.2x', change: '+0.4x', trend: 'up' },
      avgCpa: { label: 'Average CPA', value: '$14.53', change: '-$1.80', trend: 'down' },
    },
    performanceData: [
      { campaign: 'Summer Launch — Meta', spend: '$1,240', revenue: '$4,712', roas: '3.8x', cpa: '$14.42', ctr: '3.92%', conversions: 86, status: 'active' },
      { campaign: 'Google Shopping — Core', spend: '$820', revenue: '$2,378', roas: '2.9x', cpa: '$15.77', ctr: '5.07%', conversions: 52, status: 'active' },
      { campaign: 'Retargeting — Meta', spend: '$380', revenue: '$896', roas: '3.2x', cpa: '$13.57', ctr: '5.00%', conversions: 28, status: 'paused' },
    ],
    chartData: {
      labels: ['Jan 15', 'Jan 17', 'Jan 19', 'Jan 21', 'Jan 23', 'Jan 25', 'Jan 27', 'Jan 29'],
      spend: [45, 62, 78, 85, 88, 92, 95, 85],
      revenue: [120, 180, 240, 280, 310, 350, 380, 340],
      roas: [2.7, 2.9, 3.1, 3.3, 3.5, 3.8, 4.0, 4.0],
    },
    optimizations: [
      { id: 'opt-001', type: 'budget', priority: 'high', title: 'Increase Summer Launch daily budget', description: 'Summer Launch — Meta has a 3.8x ROAS, significantly above the 3.0x target. Increasing daily budget from $50 to $75 could capture an estimated 40% more conversions while maintaining ROAS above 3.2x.', impact: '+$1,200/mo revenue', action: 'Increase Budget' },
      { id: 'opt-002', type: 'creative', priority: 'high', title: 'Refresh ad creatives for Google Shopping', description: 'Google Shopping CTR has plateaued at 5.07% for 5 days. New product images with lifestyle context could improve CTR by an estimated 15-20%.', impact: '+$400/mo revenue', action: 'Generate Creatives' },
      { id: 'opt-003', type: 'audience', priority: 'medium', title: 'Expand lookalike audience for Meta', description: 'Current 1% lookalike audience is showing diminishing returns. Testing a 2% lookalike could expand reach by 80% with an estimated ROAS of 2.8x.', impact: '+$800/mo revenue', action: 'Expand Audience' },
      { id: 'opt-004', type: 'pause', priority: 'low', title: 'Resume Retargeting campaign with new creative', description: 'Retargeting campaign was paused due to creative fatigue. With new creatives from the Executor module, resuming could recapture abandoned cart revenue.', impact: '+$500/mo revenue', action: 'Resume Campaign' },
    ],
  },
};

module.exports = mock;
