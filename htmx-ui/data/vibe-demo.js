/**
 * Vibe Business Platform - Complete E2E Demo
 * AI-First Revenue Delivery Agent for DTC CPG Brands
 * Goal: 3X ROAS, 10X Revenue in 5 Weeks
 *
 * Based on YamaBushi Farms real performance data
 */

const vibeDemo = {
  // ═══════════════════════════════════════════════════════════════
  // CLIENT PROFILE
  // ═══════════════════════════════════════════════════════════════
  client: {
    name: 'Len Chen',
    company: 'YamaBushi Farms',
    website: 'yamabushifarms.com',
    industry: 'Health Supplements (Lion\'s Mane Mushroom)',
    avatar: 'LC',
    product: 'Organic Lion\'s Mane Mushroom Supplements',
    pricePoint: '$35-60',
    targetAudience: 'Health-conscious adults 35+, Nootropics enthusiasts',
  },

  // ═══════════════════════════════════════════════════════════════
  // PHASE 1: ONBOARDING FLOW
  // ═══════════════════════════════════════════════════════════════
  onboarding: {
    // Step 1: URL Input & Research
    research: {
      duration: '3.5 seconds',
      steps: [
        { text: 'Analyzing website structure...', done: true },
        { text: 'Identifying product catalog...', done: true },
        { text: 'Researching market size & trends...', done: true },
        { text: 'Mapping competitor landscape...', done: true },
        { text: 'Building customer personas...', done: true },
      ],
      preview: {
        marketSize: '$8.5B (Functional Mushrooms Market)',
        growthRate: '12.4% CAGR',
        competitors: ['Four Sigmatic', 'Host Defense', 'Real Mushrooms', 'Om Mushrooms'],
        opportunities: [
          'Cognitive health positioning underutilized',
          'Male 35-54 segment underpenetrated',
          'Educational content drives 2.3x higher conversion',
        ],
      },
    },

    // Step 2: Payment Gate 1 ($1.99)
    paymentGate1: {
      price: '$1.99',
      unlocks: 'Full GTM Strategy Report + Voice Interview',
      features: [
        'Complete market analysis',
        '6-month roadmap',
        '8-question voice interview',
        'Personalized strategy',
      ],
    },

    // Step 3: Voice Interview (8 Questions)
    voiceInterview: {
      questions: [
        {
          id: 1,
          question: 'Tell me about your brand story. What inspired you to start this business?',
          sampleAnswer: 'We started YamaBushi Farms after discovering the cognitive benefits of Lion\'s Mane during a trip to Japan. The quality difference from Asian farms was remarkable.',
        },
        {
          id: 2,
          question: 'What makes your product different from competitors?',
          sampleAnswer: 'We use 100% fruiting body, no mycelium fillers. Our mushrooms are grown on hardwood logs in controlled environments, not grain substrates.',
        },
        {
          id: 3,
          question: 'Who is your ideal customer? Describe them in detail.',
          sampleAnswer: 'Health-conscious professionals aged 35-55, interested in natural cognitive enhancement. They\'re willing to pay premium for quality supplements.',
        },
        {
          id: 4,
          question: 'What price point are you targeting and why?',
          sampleAnswer: 'Our flagship product is $45 for 60 capsules, positioning us as premium but accessible. Subscription drops it to $38.',
        },
        {
          id: 5,
          question: 'What are your top 3 marketing channels right now?',
          sampleAnswer: 'We\'ve focused on organic Instagram, some influencer partnerships, and Amazon. Haven\'t done much paid advertising yet.',
        },
        {
          id: 6,
          question: 'What\'s your current monthly revenue and growth goal?',
          sampleAnswer: 'Currently around $8K/month. Goal is to reach $25K/month within 6 months through DTC.',
        },
        {
          id: 7,
          question: 'What challenges are you facing with customer acquisition?',
          sampleAnswer: 'High CAC on the ads we\'ve tried. Hard to compete with bigger brands. Not sure which audience segments convert best.',
        },
        {
          id: 8,
          question: 'If you could wave a magic wand, what would you change about your marketing?',
          sampleAnswer: 'I\'d love to know exactly which creative and audience combinations work, and have someone handle the daily optimization.',
        },
      ],
    },

    // Step 4: Channel Audit & Connection
    channelConnect: {
      channels: [
        { name: 'Meta Business', icon: 'meta', status: 'connect', required: true },
        { name: 'Google Ads', icon: 'google', status: 'connect', required: true },
        { name: 'Google Analytics 4', icon: 'ga4', status: 'connect', required: true },
        { name: 'Shopify', icon: 'shopify', status: 'connect', required: true },
        { name: 'TikTok Ads', icon: 'tiktok', status: 'optional', required: false },
        { name: 'X (Twitter)', icon: 'x', status: 'optional', required: false },
      ],
    },

    // Step 5: Full GTM Report
    gtmReport: {
      sections: [
        { id: 'executive', title: 'Executive Summary', icon: '📋' },
        { id: 'market', title: 'Market Analysis', icon: '📊' },
        { id: 'audience', title: 'Target Audience', icon: '👥' },
        { id: 'competitive', title: 'Competitive Landscape', icon: '🎯' },
        { id: 'channel', title: 'Channel Strategy', icon: '📢' },
        { id: 'roadmap', title: '6-Month Roadmap', icon: '🗺️' },
        { id: 'kpis', title: 'KPIs & Projections', icon: '📈' },
      ],
    },

    // Step 6: Payment Gate 2 ($20)
    paymentGate2: {
      price: '$20/week',
      unlocks: 'Full Vibe Business Service',
      features: [
        'AI-managed ad campaigns',
        'Daily performance monitoring',
        'Weekly optimization syncs',
        'Creative generation',
        'Landing page optimization',
        '24/7 AI advisor access',
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // PHASE 2: EXECUTION SETUP
  // ═══════════════════════════════════════════════════════════════
  execution: {
    // Pre-Launch Checklist
    preLaunch: {
      meta: [
        { task: 'Business Manager & Ad Account Active', status: 'done' },
        { task: 'Payment Method Added', status: 'done' },
        { task: 'Meta Pixel Installed', status: 'done' },
        { task: 'Conversion Events Configured', status: 'done' },
        { task: 'Ad Account Permissions Set', status: 'done' },
      ],
      google: [
        { task: 'Google Ads Account Created', status: 'done' },
        { task: 'GA4 Installed & Linked', status: 'done' },
        { task: 'Conversion Events Set Up', status: 'done' },
        { task: 'Google Merchant Center Connected', status: 'done' },
        { task: 'Product Feed Uploaded', status: 'done' },
      ],
      creative: [
        { task: '2 Video Creatives Ready', status: 'done' },
        { task: '2 Image Creatives Ready', status: 'done' },
        { task: 'Ad Copy Variations Written', status: 'done' },
        { task: 'Landing Page Optimized', status: 'done' },
      ],
    },

    // Budget Plan (4 Weeks)
    budgetPlan: {
      total: '$800/month',
      weekly: '$200/week',
      split: {
        meta: { amount: '$120/week', percentage: 60, objective: 'Purchase Campaign' },
        metaAtc: { amount: '$80/week', percentage: 40, objective: 'Add to Cart Campaign' },
      },
      weeklyTargets: [
        { week: 1, goal: 'Brand Awareness + Creative Testing', kpi: 'CTR ≥ 1.5%, LPV ≥ 50', budget: '$200' },
        { week: 2, goal: 'Creative Optimization + Click Boost', kpi: 'CTR ≥ 2%, LPV ≥ 70', budget: '$200' },
        { week: 3, goal: 'Initial Conversions', kpi: 'ATC ≥ 3%, CTR ≥ 2%', budget: '$200' },
        { week: 4, goal: 'Retargeting + Conversion Scaling', kpi: 'CTR ≥ 2%, Purchase ≥ 1%', budget: '$200' },
      ],
    },

    // Campaign Structure
    campaignStructure: {
      meta: {
        campaign1: {
          name: 'Purchase Campaign',
          objective: 'Conversions (Purchase)',
          budget: '60% ($120/week)',
          adSets: [
            { name: 'Older Audience', targeting: '45+, Retirement, Health interests', budget: '$40/week' },
            { name: 'Health & Wellness', targeting: '30+, Well-being, Quality of life', budget: '$40/week' },
            { name: 'Nootropics', targeting: '25-55, Brain health, Focus, Productivity', budget: '$40/week' },
          ],
        },
        campaign2: {
          name: 'Add to Cart Campaign',
          objective: 'Conversions (Add to Cart)',
          budget: '40% ($80/week)',
          adSets: [
            { name: 'Broad Interest', targeting: 'Supplements, Natural health', budget: '$40/week' },
            { name: 'Lookalike 1%', targeting: 'Based on purchasers', budget: '$40/week' },
          ],
        },
      },
      google: {
        total: '$400/month ($100/week)',
        campaigns: [
          { name: 'Brand Search', budget: '$60 (15%)', goal: 'Capture branded searches' },
          { name: 'Product Search', budget: '$20 (5%)', goal: 'High-intent keywords' },
          { name: 'Performance Max', budget: '$200 (50%)', goal: 'Drive sales across networks' },
          { name: 'Shopping', budget: '$100 (25%)', goal: 'Product visibility' },
          { name: 'Display Remarketing', budget: '$20 (5%)', goal: 'Retarget visitors' },
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // PHASE 3: WEEKLY PERFORMANCE DATA (5 Weeks)
  // ═══════════════════════════════════════════════════════════════
  weeklyData: {
    week1: {
      date: 'Oct 8-13',
      theme: 'Launch & Learning',
      spending: 168.91,
      impressions: 2713,
      cpm: 62.26,
      clicks: 122,
      ctr: 4.50,
      cpc: 1.38,
      addToCarts: 17,
      costPerAtc: 9.94,
      checkouts: 9,
      purchases: 1,
      purchaseRate: 0.82,
      cpa: 168.91,
      gmv: 60,
      roas: 0.36,
      byAudience: [
        { name: 'Older Audience', spend: 83.57, impressions: 1262, ctr: 5.71, cpc: 1.16, atc: 7, purchases: 1, cpa: 83.57, roas: 0.72 },
        { name: 'Health & Wellness', spend: 85.82, impressions: 1466, ctr: 3.48, cpc: 1.68, atc: 10, purchases: 0, cpa: 0, roas: 0 },
      ],
      byCreative: [
        { name: 'Educational Video', spend: 60.33, impressions: 918, ctr: 5.77, cpc: 1.14, atc: 10, purchases: 0, roas: 0 },
        { name: 'Product Lifestyle', spend: 108.58, impressions: 1795, ctr: 3.84, cpc: 1.57, atc: 7, purchases: 1, roas: 0.55 },
      ],
      insights: [
        { type: 'positive', metric: 'CTR', detail: 'CTR at 4.50% - 3x improvement over baseline', action: 'Creative-audience match is strong' },
        { type: 'positive', metric: 'CPC', detail: 'CPC dropped 71% to $1.38', action: 'Continue current targeting' },
        { type: 'positive', metric: 'Add to Cart', detail: 'Cost per ATC down 70% to $9.94', action: 'Landing page converting well' },
        { type: 'warning', metric: 'ROAS', detail: 'ROAS at 0.36x - typical for learning phase', action: 'Expected to improve with data' },
      ],
      todos: [
        { action: 'Reallocate $40 unspent budget to this week', type: 'budget' },
        { action: 'Develop new creative variations for A/B testing', type: 'creative' },
        { action: 'Maintain steady delivery for algorithm learning', type: 'strategy' },
        { action: 'Prepare Lookalike audience once visitors reach 1,000', type: 'audience' },
      ],
    },

    week2: {
      date: 'Oct 14-20',
      theme: 'Optimization & Scale',
      spending: 252.68,
      impressions: 4410,
      cpm: 57.30,
      clicks: 198,
      ctr: 4.49,
      cpc: 1.28,
      addToCarts: 35,
      costPerAtc: 7.22,
      checkouts: 26,
      purchases: 4,
      purchaseRate: 2.02,
      cpa: 63.17,
      gmv: 176.75,
      roas: 0.70,
      byAudience: [
        { name: 'Older Audience', spend: 100.00, impressions: 1800, ctr: 4.80, cpc: 1.20, atc: 14, purchases: 2, cpa: 50.00, roas: 0.88 },
        { name: 'Nootropics', spend: 152.68, impressions: 2610, ctr: 4.30, cpc: 1.35, atc: 21, purchases: 2, cpa: 76.34, roas: 0.58 },
      ],
      byCreative: [
        { name: 'Brain Fog Text Creative', spend: 161.14, impressions: 3769, ctr: 1.06, cpc: 4.03, atc: 6, purchases: 2, roas: 0.51 },
        { name: 'Educational Video', spend: 91.54, impressions: 641, ctr: 8.27, cpc: 0.45, atc: 29, purchases: 2, roas: 0.97 },
      ],
      insights: [
        { type: 'positive', metric: 'Purchases', detail: '4 purchases this week vs 1 last week', action: '4x improvement in conversions' },
        { type: 'positive', metric: 'CPA', detail: 'CPA dropped from $168.91 to $63.17', action: '63% improvement' },
        { type: 'positive', metric: 'ROAS', detail: 'ROAS improved from 0.36x to 0.70x', action: 'Nearly doubled' },
        { type: 'insight', metric: 'Creative', detail: 'Educational video 8.27% CTR vs 1.06% text', action: 'Video driving engagement' },
      ],
      todos: [
        { action: 'Increase Older Audience budget by 20%', type: 'budget' },
        { action: 'Scale educational video creative', type: 'creative' },
        { action: 'Pause low-CTR text creative', type: 'creative' },
        { action: 'Test male-only targeting based on conversion data', type: 'audience' },
      ],
    },

    week3: {
      date: 'Oct 21-27',
      theme: 'Testing & Learning',
      spending: 198.49,
      impressions: 3289,
      cpm: 60.35,
      clicks: 75,
      ctr: 2.28,
      cpc: 2.65,
      addToCarts: 8,
      costPerAtc: 24.81,
      checkouts: 5,
      purchases: 3,
      purchaseRate: 4.00,
      cpa: 66.16,
      gmv: 128.28,
      roas: 0.65,
      byAudience: [
        { name: 'Vitamin Audience (New)', spend: 104.96, impressions: 1320, ctr: 2.12, cpc: 3.75, atc: 5, purchases: 3, cpa: 34.99, roas: 1.22 },
        { name: 'Supplements Audience', spend: 93.53, impressions: 1969, ctr: 2.38, cpc: 1.97, atc: 3, purchases: 0, cpa: 0, roas: 0 },
      ],
      byCreative: [
        { name: 'Black Background Text', spend: 104.96, impressions: 1320, ctr: 2.12, cpc: 3.75, atc: 5, purchases: 3, roas: 1.22 },
        { name: 'Product Carousel', spend: 93.53, impressions: 1969, ctr: 2.38, cpc: 1.97, atc: 3, purchases: 0, roas: 0 },
      ],
      insights: [
        { type: 'breakthrough', metric: 'Vitamin Audience', detail: 'New Vitamin audience showing 1.22x ROAS', action: 'Best performing segment found!' },
        { type: 'warning', metric: 'CTR Drop', detail: 'CTR dropped from 4.49% to 2.28%', action: 'Creative fatigue setting in' },
        { type: 'positive', metric: 'Purchase Rate', detail: 'Purchase rate improved to 4%', action: 'Better quality traffic' },
        { type: 'action', metric: 'Supplements', detail: 'Supplements audience at 0 ROAS', action: 'Consider pausing or merging' },
      ],
      todos: [
        { action: 'Increase Vitamin audience budget by 30%', type: 'budget' },
        { action: 'Create new creatives to combat fatigue', type: 'creative' },
        { action: 'Merge Supplements with other converting audiences', type: 'audience' },
        { action: 'Launch new Black Background Text variations', type: 'creative' },
      ],
    },

    week4: {
      date: 'Nov 4-10',
      theme: 'Scaling Winners',
      spending: 306.42,
      impressions: 4016,
      cpm: 76.30,
      clicks: 94,
      ctr: 2.34,
      cpc: 3.26,
      addToCarts: 18,
      costPerAtc: 17.02,
      checkouts: 12,
      purchases: 9,
      purchaseRate: 9.57,
      cpa: 34.05,
      gmv: 420.48,
      roas: 1.37,
      byAudience: [
        { name: 'Vitamin Audience', spend: 183.85, impressions: 2409, ctr: 2.45, cpc: 3.12, atc: 12, purchases: 7, cpa: 26.26, roas: 1.60 },
        { name: 'Consolidated Health', spend: 122.57, impressions: 1607, ctr: 2.17, cpc: 3.51, atc: 6, purchases: 2, cpa: 61.29, roas: 0.98 },
      ],
      byCreative: [
        { name: 'Black Background Text v2', spend: 200.19, impressions: 2620, ctr: 2.52, cpc: 3.04, atc: 13, purchases: 7, roas: 1.46 },
        { name: 'UGC Testimonial', spend: 106.23, impressions: 1396, ctr: 2.01, cpc: 3.78, atc: 5, purchases: 2, roas: 1.19 },
      ],
      insights: [
        { type: 'milestone', metric: 'ROAS', detail: 'ROAS hit 1.37x - first profitable week!', action: 'Exceeded 1.0x threshold' },
        { type: 'positive', metric: 'Purchases', detail: '9 purchases - 3x week 3', action: 'Scaling strategy working' },
        { type: 'positive', metric: 'CPA', detail: 'CPA at $34.05 - down from $66.16', action: '49% improvement' },
        { type: 'insight', metric: 'Vitamin Audience', detail: 'Vitamin driving 78% of purchases', action: 'Primary audience confirmed' },
      ],
      todos: [
        { action: 'Increase total weekly budget to $350', type: 'budget' },
        { action: 'Allocate 70% to Vitamin audience', type: 'budget' },
        { action: 'Create 2 more Black Background variations', type: 'creative' },
        { action: 'Prepare for BFCM with promotional creative', type: 'strategy' },
      ],
    },

    week5: {
      date: 'Nov 24-Dec 2',
      theme: 'BFCM & Recovery',
      spending: 273.93,
      impressions: 4058,
      cpm: 67.50,
      clicks: 96,
      ctr: 2.37,
      cpc: 2.85,
      addToCarts: 13,
      costPerAtc: 21.07,
      checkouts: 7,
      purchases: 5,
      purchaseRate: 5.21,
      cpa: 54.79,
      gmv: 159.21,
      roas: 0.58,
      byAudience: [
        { name: 'Vitamin', spend: 104.96, impressions: 1320, ctr: 2.12, cpc: 3.75, atc: 5, purchases: 5, cpa: 20.99, roas: 1.52 },
        { name: 'Supplements', spend: 168.97, impressions: 2738, ctr: 2.48, cpc: 2.48, atc: 8, purchases: 0, cpa: 0, roas: 0 },
      ],
      byCreative: [
        { name: 'Black Background Text', spend: 104.96, impressions: 1320, ctr: 2.12, cpc: 3.75, atc: 5, purchases: 5, roas: 1.52 },
        { name: 'Holiday Lifestyle', spend: 168.97, impressions: 2738, ctr: 2.48, cpc: 2.48, atc: 8, purchases: 0, roas: 0 },
      ],
      insights: [
        { type: 'context', metric: 'BFCM', detail: 'High CPM due to holiday competition', action: 'Expected seasonal spike' },
        { type: 'positive', metric: 'Vitamin ROAS', detail: 'Vitamin audience at 1.52x ROAS', action: 'Consistent winner' },
        { type: 'recovery', metric: 'Learning', detail: 'System relearning after 2-week pause', action: 'Normal post-pause behavior' },
        { type: 'action', metric: 'Supplements', detail: 'Supplements at 0 ROAS despite spend', action: 'Pause and reallocate' },
      ],
      todos: [
        { action: 'Keep budget flat during post-holiday stabilization', type: 'budget' },
        { action: 'Increase Vitamin budget by 20-30%', type: 'budget' },
        { action: 'Pause Supplements audience', type: 'audience' },
        { action: 'Launch placement/gender test campaign', type: 'strategy' },
        { action: 'Prepare Google Ads expansion', type: 'channel' },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // PHASE 4: INTERACTIVE CONVERSATIONS
  // ═══════════════════════════════════════════════════════════════
  conversations: {
    // Day 0: Pre-Launch Setup
    preLaunch: {
      date: 'Monday, Oct 7',
      theme: 'Pre-Launch Setup',
      channel: 'slack',
      messages: [
        {
          id: 1,
          time: '9:00 AM',
          sender: 'alexandar',
          type: 'text',
          content: "Good morning Len! Your GTM strategy is approved and we're ready to begin execution. I've completed the full audit of your accounts.",
        },
        {
          id: 2,
          time: '9:01 AM',
          sender: 'alexandar',
          type: 'card',
          cardType: 'checklist',
          title: '✅ Pre-Launch Audit Complete',
          content: 'Account setup status:',
          data: {
            items: [
              { task: 'Meta Business Manager active', status: 'done' },
              { task: 'Meta Pixel installed & verified', status: 'done' },
              { task: 'Conversion events (ViewContent, ATC, Purchase)', status: 'done' },
              { task: 'Shopify partner access granted', status: 'done' },
              { task: '4 ad creatives uploaded', status: 'done' },
              { task: 'Campaign structure ready', status: 'done' },
            ],
          },
        },
        {
          id: 3,
          time: '9:15 AM',
          sender: 'len',
          type: 'text',
          content: 'Great! What does the campaign structure look like?',
          waitForUser: true,
        },
        {
          id: 4,
          time: '9:16 AM',
          sender: 'alexandar',
          type: 'card',
          cardType: 'campaign',
          title: '📢 Meta Campaign Structure',
          content: 'Based on $200/week budget:',
          data: {
            campaigns: [
              { name: 'Campaign 1: Purchase', budget: '$120/week (60%)', objective: 'Conversions' },
              { name: 'Campaign 2: Add to Cart', budget: '$80/week (40%)', objective: 'Learning' },
            ],
            adSets: [
              { name: 'Older Audience', budget: '$40/wk', targeting: '45+, Retirement, Health interests' },
              { name: 'Health & Wellness', budget: '$40/wk', targeting: '30+, Well-being, Quality of life' },
              { name: 'Nootropics', budget: '$40/wk', targeting: '25-55, Brain health, Productivity' },
              { name: 'Broad Interest', budget: '$40/wk', targeting: 'Supplements, Natural health' },
              { name: 'Lookalike (Later)', budget: '$40/wk', targeting: 'Once we have 1,000+ visitors' },
            ],
          },
        },
        {
          id: 5,
          time: '9:20 AM',
          sender: 'alexandar',
          type: 'card',
          cardType: 'creative',
          title: '🎨 Creative Strategy',
          content: 'Testing 4 creative variations:',
          data: {
            creatives: [
              { name: 'Educational Video', format: 'Video 15s', angle: 'Lion\'s Mane benefits explained' },
              { name: 'Product Lifestyle', format: 'Static 1:1', angle: 'Morning routine imagery' },
              { name: 'Black Background Text', format: 'Static 1:1', angle: 'Bold claims on dark bg' },
              { name: 'UGC Testimonial', format: 'Video 30s', angle: 'Customer story' },
            ],
          },
        },
        {
          id: 6,
          time: '9:30 AM',
          sender: 'len',
          type: 'text',
          content: 'The educational video angle makes sense. When do we launch?',
          waitForUser: true,
        },
        {
          id: 7,
          time: '9:31 AM',
          sender: 'alexandar',
          type: 'approval',
          title: '🚀 Ready to Launch',
          content: 'All systems configured. Ready to go live tomorrow?',
          data: {
            totalBudget: '$200/week ($28.57/day)',
            launchTime: 'Tuesday 6:00 AM PST',
            firstReport: 'Tuesday 6:00 PM PST',
            week1Goal: 'CTR ≥ 1.5%, LPV ≥ 50',
          },
          actions: ['Approve Launch', 'Review Creatives First'],
        },
        {
          id: 8,
          time: '10:00 AM',
          sender: 'len',
          type: 'action',
          action: 'Approve Launch',
          content: "Let's do it! Approve launch.",
          waitForUser: true,
        },
        {
          id: 9,
          time: '10:01 AM',
          sender: 'alexandar',
          type: 'text',
          content: "✅ Launch approved! Campaigns scheduled for tomorrow 6 AM PST. I'll monitor 24/7 and send you daily updates. Let's grow YamaBushi! 🍄",
        },
      ],
    },

    // Week 1: Launch & Learning
    week1: {
      date: 'Monday, Oct 14',
      theme: 'Week 1 Sync',
      channel: 'slack',
      messages: [
        {
          id: 1,
          time: '9:00 AM',
          sender: 'alexandar',
          type: 'card',
          cardType: 'sync',
          title: '🍄 YamaBushi Farms - Weekly Sync',
          subtitle: 'Week 1: Oct 8-13',
          data: {
            status: '🟢 Strong Start',
            confidence: 'High',
          },
        },
        {
          id: 2,
          time: '9:01 AM',
          sender: 'alexandar',
          type: 'card',
          cardType: 'metrics',
          title: '📊 Week 1 Performance',
          data: {
            metrics: [
              { name: 'Spend', actual: '$168.91', target: '$200', status: '⚠️ Under' },
              { name: 'Impressions', actual: '2,713', target: '-', status: '✅' },
              { name: 'CTR', actual: '4.50%', target: '≥1.5%', status: '🚀 3x target' },
              { name: 'CPC', actual: '$1.38', target: '-', status: '✅ Excellent' },
              { name: 'Add to Carts', actual: '17', target: '-', status: '✅' },
              { name: 'Purchases', actual: '1', target: '0-1', status: '✅ On track' },
              { name: 'ROAS', actual: '0.36x', target: 'Learning', status: '📈 Expected' },
            ],
          },
        },
        {
          id: 3,
          time: '9:02 AM',
          sender: 'alexandar',
          type: 'card',
          cardType: 'insights',
          title: '💡 Key Insights',
          data: {
            learnings: [
              {
                finding: 'CTR 3x Higher Than Expected',
                detail: 'CTR at 4.50% vs 1.5% target. Creative-audience match is excellent.',
                action: 'Continue current targeting strategy',
              },
              {
                finding: 'CPC Down 71%',
                detail: 'CPC dropped from industry avg $4.76 to $1.38.',
                action: 'High-quality traffic at low cost',
              },
              {
                finding: 'Older Audience Leading',
                detail: '5.71% CTR with first purchase. Best performing segment.',
                action: 'Increase budget allocation',
              },
              {
                finding: 'ROAS Still Learning',
                detail: '0.36x ROAS typical for week 1 learning phase.',
                action: 'Expected to improve with data accumulation',
              },
            ],
          },
        },
        {
          id: 4,
          time: '9:05 AM',
          sender: 'len',
          type: 'text',
          content: 'The CTR numbers are impressive! Why did we underspend?',
          waitForUser: true,
        },
        {
          id: 5,
          time: '9:06 AM',
          sender: 'alexandar',
          type: 'text',
          content: "Good question. We set conservative daily caps during learning phase to let the algorithm stabilize. The $40 unspent will roll into this week. With the strong CTR data, I'm confident we can spend the full budget efficiently now.",
        },
        {
          id: 6,
          time: '9:07 AM',
          sender: 'alexandar',
          type: 'card',
          cardType: 'proposal',
          title: '📈 Week 2 Plan',
          content: 'Recommendations based on Week 1 data:',
          data: {
            budgetChange: '$200 + $40 rollover = $240',
            rationale: 'Strong CTR justifies full spend',
            allocation: [
              { audience: 'Older Audience', budget: '$80 (33%)', change: '+$40' },
              { audience: 'Nootropics', budget: '$80 (33%)', change: 'No change' },
              { audience: 'Health & Wellness', budget: '$80 (33%)', change: 'No change' },
            ],
            newCreatives: [
              'New Educational Video v2',
              'A/B test: benefit-focused headlines',
            ],
          },
        },
        {
          id: 7,
          time: '9:10 AM',
          sender: 'alexandar',
          type: 'approval',
          title: '✅ Week 2 Approval',
          content: 'Proceed with Week 2 optimizations?',
          data: {
            weeklyBudget: '$240',
            mainChange: 'Increase Older Audience allocation',
          },
          actions: ['Approve Plan', 'Discuss More'],
        },
        {
          id: 8,
          time: '9:30 AM',
          sender: 'len',
          type: 'action',
          action: 'Approve Plan',
          content: 'Looks good, approved!',
          waitForUser: true,
        },
        {
          id: 9,
          time: '9:31 AM',
          sender: 'alexandar',
          type: 'text',
          content: "✅ Week 2 plan approved. I'll implement the budget changes and launch new creatives today. Same time next Monday for Week 2 sync!",
        },
      ],
    },

    // Week 4: Breakthrough
    week4: {
      date: 'Monday, Nov 11',
      theme: 'Week 4 Sync - Breakthrough!',
      channel: 'slack',
      messages: [
        {
          id: 1,
          time: '9:00 AM',
          sender: 'alexandar',
          type: 'milestone',
          title: '🎉 BREAKTHROUGH WEEK!',
          content: 'First profitable week - ROAS exceeded 1.0x!',
        },
        {
          id: 2,
          time: '9:01 AM',
          sender: 'alexandar',
          type: 'card',
          cardType: 'sync',
          title: '🍄 YamaBushi Farms - Weekly Sync',
          subtitle: 'Week 4: Nov 4-10',
          data: {
            status: '🚀 Profitable!',
            confidence: 'Very High',
          },
        },
        {
          id: 3,
          time: '9:02 AM',
          sender: 'alexandar',
          type: 'card',
          cardType: 'metrics',
          title: '📊 Week 4 Performance',
          data: {
            metrics: [
              { name: 'Spend', actual: '$306.42', target: '$300', status: '✅' },
              { name: 'Purchases', actual: '9', target: '3-5', status: '🚀 3x target' },
              { name: 'Revenue', actual: '$420.48', target: '-', status: '✅' },
              { name: 'ROAS', actual: '1.37x', target: '≥1.0x', status: '🎉 PROFITABLE' },
              { name: 'CTR', actual: '2.34%', target: '≥2%', status: '✅' },
              { name: 'CPA', actual: '$34.05', target: '<$50', status: '✅ 32% under' },
              { name: 'Purchase Rate', actual: '9.57%', target: '-', status: '🚀 10x Week 1' },
            ],
          },
        },
        {
          id: 4,
          time: '9:03 AM',
          sender: 'alexandar',
          type: 'card',
          cardType: 'insights',
          title: '💡 Week 4 Insights',
          data: {
            learnings: [
              {
                finding: 'Vitamin Audience = Gold Mine',
                detail: '7 of 9 purchases (78%) from Vitamin audience. ROAS 1.60x.',
                action: 'This is our primary audience going forward',
              },
              {
                finding: 'Black Background Creative Wins',
                detail: 'Text-based creative at 1.46x ROAS, outperforming video.',
                action: 'Create more variations of this format',
              },
              {
                finding: 'CPA Cut in Half',
                detail: 'CPA dropped from $66.16 (Week 3) to $34.05.',
                action: 'System fully optimized now',
              },
              {
                finding: '10x Purchase Rate',
                detail: 'From 0.82% Week 1 to 9.57% Week 4.',
                action: 'Algorithm learned our customer profile',
              },
            ],
          },
        },
        {
          id: 5,
          time: '9:05 AM',
          sender: 'len',
          type: 'text',
          content: "This is incredible! 9 purchases and profitable! What's the plan for scaling?",
          waitForUser: true,
        },
        {
          id: 6,
          time: '9:06 AM',
          sender: 'alexandar',
          type: 'card',
          cardType: 'proposal',
          title: '📈 Scaling Proposal',
          content: 'Ready to increase spend with proven winners:',
          data: {
            budgetChange: '$300 → $350/week (+17%)',
            rationale: 'ROAS at 1.37x with stable CPA justifies scale',
            allocation: [
              { audience: 'Vitamin Audience', budget: '$245 (70%)', change: '+50%' },
              { audience: 'Consolidated Health', budget: '$70 (20%)', change: 'Maintain' },
              { audience: 'Lookalike Test', budget: '$35 (10%)', change: 'New' },
            ],
            newCreatives: [
              'Black Background v3 with testimonial',
              'Black Background v4 with statistics',
            ],
            projectedROAS: '1.3-1.6x',
            projectedRevenue: '$455-560/week',
          },
        },
        {
          id: 7,
          time: '9:07 AM',
          sender: 'alexandar',
          type: 'text',
          content: "**4-Week Summary:**\n\n📈 ROAS: 0.36x → 1.37x (280% improvement)\n💰 CPA: $168 → $34 (80% reduction)\n🛒 Purchases: 1 → 9 per week (9x increase)\n🎯 Winner: Vitamin audience + Text creative\n\nWe've found the winning formula. Now it's time to scale!",
        },
        {
          id: 8,
          time: '9:10 AM',
          sender: 'alexandar',
          type: 'approval',
          title: '💰 Scale to $350/week?',
          content: 'Approve scaling with Vitamin focus:',
          data: {
            currentBudget: '$300/week',
            proposedBudget: '$350/week',
            increase: '+$50 (+17%)',
            risk: 'Low - proven audiences and creatives',
          },
          actions: ['Approve $350', 'Approve $400', 'Stay at $300'],
        },
        {
          id: 9,
          time: '9:30 AM',
          sender: 'len',
          type: 'action',
          action: 'Approve $400',
          content: "Let's go aggressive - approve $400/week!",
          waitForUser: true,
        },
        {
          id: 10,
          time: '9:31 AM',
          sender: 'alexandar',
          type: 'text',
          content: "✅ Budget increased to $400/week! I love the confidence. With Black Friday coming up, we'll prepare promotional creatives. Expecting $500-600+ revenue per week at current ROAS. Let's make YamaBushi a household name! 🍄🚀",
        },
      ],
    },

    // Proactive Alert: CPM Spike
    alert: {
      date: 'Wednesday, Nov 27',
      theme: 'BFCM Alert',
      channel: 'whatsapp',
      messages: [
        {
          id: 1,
          time: '2:15 PM',
          sender: 'alexandar',
          type: 'alert',
          alertType: 'warning',
          title: '⚠️ CPM Spike Detected',
          content: 'Holiday competition driving costs up',
          data: {
            previousCPM: '$60.35',
            currentCPM: '$76.30',
            change: '+26%',
            cause: 'Black Friday / Cyber Monday competition',
          },
        },
        {
          id: 2,
          time: '2:16 PM',
          sender: 'alexandar',
          type: 'text',
          content: "CPM is elevated due to BFCM - this affects all advertisers. Our CTR remains strong (2.34%) which helps offset the higher costs. Here's my recommendation:",
        },
        {
          id: 3,
          time: '2:17 PM',
          sender: 'alexandar',
          type: 'card',
          cardType: 'recommendation',
          title: '💡 BFCM Strategy',
          data: {
            immediate: 'Keep budget flat this week - don\'t compete on CPM',
            shortTerm: 'Focus 100% on Vitamin audience (best ROAS)',
            test: 'Pause underperforming Supplements audience',
          },
        },
        {
          id: 4,
          time: '2:30 PM',
          sender: 'len',
          type: 'text',
          content: 'Makes sense. Should we pause completely during BFCM?',
          waitForUser: true,
        },
        {
          id: 5,
          time: '2:31 PM',
          sender: 'alexandar',
          type: 'text',
          content: "No - our Vitamin audience is still profitable at 1.52x ROAS even with higher CPM. Pausing would reset our learning data. I recommend:\n\n1. Maintain Vitamin at current budget\n2. Pause Supplements (0 ROAS)\n3. Resume aggressive scaling Dec 3 when CPM drops\n\nThis preserves our momentum while avoiding the worst competition.",
        },
        {
          id: 6,
          time: '2:32 PM',
          sender: 'alexandar',
          type: 'notification',
          notificationType: 'auto',
          title: '⚙️ Autonomous Action Taken',
          content: 'Within pre-authorized bounds, I\'ve paused the Supplements ad set ($168.97 spend, 0 purchases) and reallocated to Vitamin audience.',
        },
        {
          id: 7,
          time: '2:45 PM',
          sender: 'len',
          type: 'text',
          content: 'Good call. Thanks for staying on top of this!',
          waitForUser: true,
        },
        {
          id: 8,
          time: '2:46 PM',
          sender: 'alexandar',
          type: 'text',
          content: "That's what I'm here for! 24/7 monitoring so you can focus on your business. I'll send the post-BFCM recovery report on Monday. Enjoy the holiday! 🦃",
        },
      ],
    },

    // Voice Call Option
    voiceCall: {
      date: 'Anytime',
      theme: 'Voice Call',
      channel: 'voice',
      intro: 'Prefer talking? Start a voice call with Alexandar anytime.',
      sampleTopics: [
        'Walk me through this week\'s performance',
        'Why did CPA spike yesterday?',
        'Should I increase budget?',
        'Explain the campaign structure',
        'What creative should I test next?',
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // OVERALL RESULTS SUMMARY
  // ═══════════════════════════════════════════════════════════════
  results: {
    timeline: '5 weeks',
    totalSpend: 1200.43,
    totalRevenue: 945.22,
    totalPurchases: 23,
    finalROAS: 1.37,
    roasImprovement: '280%',
    cpaImprovement: '80%',
    purchaseGrowth: '9x',
    winningAudience: 'Vitamin Audience',
    winningCreative: 'Black Background Text',
    keyLearnings: [
      'Educational/text-based creatives outperform lifestyle imagery',
      'Vitamin audience converts 3x better than broad health interests',
      'Week 1 CTR is predictive of long-term success',
      'System needs 2-3 weeks to fully optimize',
      'BFCM requires defensive not aggressive strategy',
    ],
  },
};

module.exports = vibeDemo;
