/**
 * Auxora.ai Unified Demo Data
 * AI Growth Co-Founder in OpenClaw Mode
 *
 * Combines: Alexandar (workflow) + Sakura (GTM report) + Vibe (YamaBushi performance)
 */

const auxoraDemo = {
  // Brand Identity
  brand: {
    name: 'Auxora',
    tagline: 'Your AI Growth Co-Founder',
    description: 'End-to-end revenue delivery agent for D2C CPG brands',
    colors: {
      primary: '#F59E0B',
      secondary: '#D97706',
      accent: '#FBBF24'
    }
  },

  // Demo Client Profile
  client: {
    id: 'demo-client-001',
    name: 'Len Chen',
    email: 'len@yamabushifarms.com',
    company: 'YamaBushi Farms',
    website: 'https://yamabushifarms.com',
    industry: 'Premium Food & Beverage (Wagyu)',
    description: 'Premium A5 Japanese Wagyu beef delivered direct to consumers across the US. Farm-to-table experience with authentic Japanese beef grading.',
    persona: 'D2C brand owner with NO growth experience',
    goals: {
      roas: 3.0,
      revenueMultiple: 10,
      timeframe: '5 weeks'
    }
  },

  // ===== PHASE 1: ONBOARDING JOURNEY =====
  onboarding: {
    // Step 1: Landing & URL Input
    landing: {
      headline: 'Launch Your Brand to 3X ROAS in 5 Weeks',
      subheadline: 'AI-powered growth engine that handles strategy, execution, and optimization',
      valueProps: [
        'Deep market research in minutes, not weeks',
        'Voice interview captures your brand DNA',
        'Complete GTM strategy with action plan',
        'Autonomous optimization 24/7'
      ]
    },

    // Step 2: Deep Research Preview
    research: {
      status: 'completed',
      websiteUrl: 'https://yamabushifarms.com',
      duration: '45 seconds',
      preview: {
        marketSize: '$7.2B premium beef market',
        competitors: ['Snake River Farms', 'Holy Grail Steak', 'Crowd Cow'],
        targetAudience: 'Affluent food enthusiasts, 35-55',
        channels: ['Meta Ads', 'Google Ads', 'Email Marketing']
      }
    },

    // Step 3: Payment Gate 1 - Strategy Preview
    paymentGate1: {
      amount: 1.99,
      currency: 'USD',
      label: 'GTM Strategy Preview',
      features: [
        'Complete market analysis',
        'Voice interview session',
        'GTM strategy report',
        'Channel recommendations'
      ],
      demoMode: {
        autoComplete: true,
        delay: 2000
      }
    },

    // Step 4: Voice Interview
    voiceInterview: {
      duration: '8-10 minutes',
      questions: [
        {
          id: 1,
          text: "Tell me about your brand. What makes YamaBushi Farms special?",
          category: 'brand_identity',
          expectedResponse: "We source authentic A5 Japanese Wagyu directly from select farms in Japan. Our beef is certified by the Japanese Meat Grading Association..."
        },
        {
          id: 2,
          text: "What marketing channels have you tried before, if any?",
          category: 'past_marketing',
          expectedResponse: "We've mainly relied on word of mouth and some Instagram posts. Haven't really done paid advertising yet..."
        },
        {
          id: 3,
          text: "What are your revenue goals for the next quarter?",
          category: 'revenue_goals',
          expectedResponse: "We'd like to hit $50,000 in monthly revenue. Currently we're doing about $5,000..."
        },
        {
          id: 4,
          text: "Tell me about any past advertising performance data you have.",
          category: 'past_performance',
          expectedResponse: "We tried a small Facebook campaign last year, spent about $200, got a few sales but not sure about the exact numbers..."
        },
        {
          id: 5,
          text: "What's your monthly marketing budget?",
          category: 'budget',
          expectedResponse: "We can start with $200 per week, so about $800-1000 per month total..."
        },
        {
          id: 6,
          text: "Describe your ideal customer. Who buys your wagyu?",
          category: 'target_audience',
          expectedResponse: "Usually professionals in their 40s-50s who appreciate fine dining. They often buy for special occasions or as gifts..."
        },
        {
          id: 7,
          text: "Who are your main competitors and how do you differentiate?",
          category: 'competition',
          expectedResponse: "Snake River Farms and Holy Grail are the big ones. We differentiate through our direct Japan sourcing and certification..."
        },
        {
          id: 8,
          text: "What's your #1 growth priority right now?",
          category: 'priorities',
          expectedResponse: "Getting consistent sales. The product is great, we just need more people to know about us..."
        }
      ],
      analysis: {
        brandPositioning: 'Premium authentic Japanese Wagyu with direct farm sourcing',
        resourceConstraints: 'Limited budget ($800/month), no marketing experience',
        growthPriorities: ['Customer acquisition', 'Brand awareness', 'Consistent revenue'],
        channelRecommendations: ['Meta Ads (primary)', 'Google Search', 'Email nurture']
      }
    },

    // Step 5: GTM Report (Sakura-style)
    gtmReport: {
      title: 'Go-To-Market Strategy: YamaBushi Farms',
      generatedAt: new Date().toISOString(),
      sections: {
        executiveSummary: {
          opportunity: 'YamaBushi Farms has strong product differentiation in the $7.2B premium beef market',
          recommendation: 'Launch Meta Ads campaign targeting affluent food enthusiasts with video-first creative',
          projectedOutcome: '3X ROAS achievable within 5 weeks with $800/month budget'
        },
        marketAnalysis: {
          marketSize: '$7.2 billion (US premium beef market)',
          growthRate: '8.5% CAGR',
          trends: [
            'Increasing demand for premium proteins',
            'D2C food brands growing 35% YoY',
            'Video content driving food purchases'
          ]
        },
        targetAudience: {
          primary: {
            name: 'Affluent Foodies',
            age: '35-55',
            income: '$150K+',
            interests: ['Fine dining', 'Cooking', 'Japanese cuisine', 'Premium ingredients'],
            painPoints: ['Finding authentic wagyu', 'Quality consistency', 'Trust in sourcing']
          },
          secondary: {
            name: 'Gift Givers',
            age: '30-60',
            occasions: ['Holidays', 'Birthdays', 'Corporate gifts'],
            behavior: 'High AOV, seasonal spikes'
          }
        },
        channelStrategy: {
          primary: {
            channel: 'Meta Ads',
            allocation: '70%',
            rationale: 'Visual platform ideal for food products, strong lookalike capabilities'
          },
          secondary: {
            channel: 'Google Ads',
            allocation: '30%',
            rationale: 'Capture high-intent searches for "buy wagyu online"'
          }
        },
        actionPlan: {
          week1: 'Launch 3 audience tests with video creative',
          week2: 'Analyze performance, pause losers, scale winners',
          week3: 'Introduce retargeting, expand to Google',
          week4: 'Optimize for conversions, test new creative',
          week5: 'Scale winning combinations to target ROAS'
        },
        budgetAllocation: {
          total: 800,
          period: 'monthly',
          breakdown: [
            { channel: 'Meta Ads', amount: 560, percentage: 70 },
            { channel: 'Google Ads', amount: 240, percentage: 30 }
          ]
        },
        kpis: [
          { metric: 'ROAS', target: 3.0, current: 0 },
          { metric: 'CPA', target: 45, current: null },
          { metric: 'CTR', target: 1.5, current: null },
          { metric: 'Monthly Revenue', target: 2400, current: 0 }
        ]
      }
    },

    // Step 6: Payment Gate 2 - Full Service
    paymentGate2: {
      amount: 20.00,
      currency: 'USD',
      label: 'Full Service Launch',
      features: [
        'Campaign setup & launch',
        'Creative development',
        'Landing page optimization',
        'OpenClaw 24/7 monitoring',
        'Daily performance reports',
        'Autonomous optimization'
      ],
      demoMode: {
        autoComplete: true,
        delay: 2000
      }
    }
  },

  // ===== PHASE 2: EXECUTION SETUP =====
  execution: {
    // Channel Connections
    channelConnect: {
      channels: [
        {
          id: 'meta',
          name: 'Meta Business Manager',
          icon: 'facebook',
          status: 'connected',
          connectedAt: '2025-02-15T10:00:00Z',
          accountId: 'act_123456789',
          permissions: ['ads_management', 'ads_read', 'business_management']
        },
        {
          id: 'google',
          name: 'Google Ads',
          icon: 'google',
          status: 'connected',
          connectedAt: '2025-02-15T10:05:00Z',
          accountId: '123-456-7890',
          permissions: ['campaigns', 'reports']
        },
        {
          id: 'ga4',
          name: 'Google Analytics 4',
          icon: 'analytics',
          status: 'connected',
          connectedAt: '2025-02-15T10:08:00Z',
          propertyId: 'G-XXXXXXXXXX'
        },
        {
          id: 'shopify',
          name: 'Shopify Store',
          icon: 'shopify',
          status: 'connected',
          connectedAt: '2025-02-15T10:12:00Z',
          storeName: 'yamabushi-farms.myshopify.com'
        },
        {
          id: 'tiktok',
          name: 'TikTok Ads',
          icon: 'tiktok',
          status: 'pending',
          message: 'Optional - Connect later'
        }
      ]
    },

    // Budget Simulation
    budgetSimulation: {
      initialBudget: 200,
      period: '4 weeks',
      dailyBudget: 7.14,
      projections: {
        conservative: {
          roas: 1.5,
          revenue: 300,
          purchases: 3
        },
        moderate: {
          roas: 2.5,
          revenue: 500,
          purchases: 5
        },
        optimistic: {
          roas: 3.5,
          revenue: 700,
          purchases: 7
        }
      },
      weeklyAllocation: [
        { week: 1, amount: 50, focus: 'Testing (3 audiences)' },
        { week: 2, amount: 50, focus: 'Optimize (pause losers)' },
        { week: 3, amount: 50, focus: 'Scale (double winners)' },
        { week: 4, amount: 50, focus: 'Maximize (full optimization)' }
      ],
      riskLevel: 'low',
      riskExplanation: 'Starting small allows learning without significant financial risk'
    },

    // Testing Plan
    testingPlan: {
      audiences: [
        {
          id: 'aud-1',
          name: 'Foodies - Broad',
          targeting: 'Interest: Fine Dining, Cooking, Food & Wine',
          size: '2.5M',
          budget: 70,
          status: 'approved'
        },
        {
          id: 'aud-2',
          name: 'Wagyu Enthusiasts',
          targeting: 'Interest: Wagyu, Japanese Food, Steak',
          size: '850K',
          budget: 70,
          status: 'approved'
        },
        {
          id: 'aud-3',
          name: 'High-Income Gift Buyers',
          targeting: 'Income: Top 10%, Interest: Luxury Gifts',
          size: '1.2M',
          budget: 60,
          status: 'approved'
        }
      ],
      creatives: [
        {
          id: 'cr-1',
          name: 'Sizzle Video',
          type: 'video',
          duration: '15s',
          thumbnail: '/images/demo/creative-sizzle.jpg',
          status: 'approved'
        },
        {
          id: 'cr-2',
          name: 'Unboxing Experience',
          type: 'video',
          duration: '30s',
          thumbnail: '/images/demo/creative-unbox.jpg',
          status: 'approved'
        },
        {
          id: 'cr-3',
          name: 'Farm Story',
          type: 'carousel',
          slides: 5,
          thumbnail: '/images/demo/creative-farm.jpg',
          status: 'pending_approval'
        }
      ],
      timeline: [
        { phase: 'Launch', days: '1-3', action: 'All audiences go live, monitor delivery' },
        { phase: 'Learn', days: '4-7', action: 'Collect 50+ link clicks per audience' },
        { phase: 'Optimize', days: '8-14', action: 'Pause CTR < 1%, scale CTR > 2%' },
        { phase: 'Scale', days: '15-28', action: 'Increase budget on ROAS > 2 audiences' }
      ]
    },

    // Pre-Launch Checklist
    preLaunchChecklist: [
      { id: 1, task: 'Meta Pixel installed and verified', status: 'completed', icon: 'check' },
      { id: 2, task: 'Conversion API configured', status: 'completed', icon: 'check' },
      { id: 3, task: 'Payment gateway connected', status: 'completed', icon: 'check' },
      { id: 4, task: 'Product catalog synced', status: 'completed', icon: 'check' },
      { id: 5, task: 'Ad creative approved', status: 'completed', icon: 'check' },
      { id: 6, task: 'Landing page optimized', status: 'completed', icon: 'check' },
      { id: 7, task: 'Budget and schedule confirmed', status: 'completed', icon: 'check' },
      { id: 8, task: 'OpenClaw monitoring activated', status: 'completed', icon: 'check' }
    ],

    // Campaign Structure
    campaignStructure: {
      meta: {
        campaign: {
          name: 'YamaBushi - Conversion - Q1',
          objective: 'CONVERSIONS',
          budget: 560,
          budgetType: 'MONTHLY'
        },
        adSets: [
          {
            name: 'Foodies - Broad',
            audience: 'Interest: Fine Dining, Cooking',
            placement: 'Automatic',
            budget: 200
          },
          {
            name: 'Wagyu Enthusiasts',
            audience: 'Interest: Wagyu, Japanese Food',
            placement: 'Automatic',
            budget: 200
          },
          {
            name: 'High-Income Gifters',
            audience: 'Income Top 10%, Luxury',
            placement: 'Automatic',
            budget: 160
          }
        ]
      },
      google: {
        campaign: {
          name: 'YamaBushi - Search - Q1',
          type: 'SEARCH',
          budget: 240,
          budgetType: 'MONTHLY'
        },
        adGroups: [
          {
            name: 'Buy Wagyu Online',
            keywords: ['buy wagyu online', 'wagyu beef delivery', 'order wagyu'],
            budget: 120
          },
          {
            name: 'A5 Wagyu',
            keywords: ['a5 wagyu', 'japanese wagyu', 'authentic wagyu'],
            budget: 120
          }
        ]
      }
    }
  },

  // ===== PHASE 3: OPENCLAW MONITORING =====
  openClaw: {
    // Current Status
    status: {
      heartbeat: 'OK',
      lastCheck: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
      nextCheck: new Date(Date.now() + 28 * 60 * 1000).toISOString(), // in 28 minutes
      activeAlerts: 1,
      actionsToday: 3,
      autonomousActionsEnabled: true
    },

    // Heartbeat History
    heartbeatHistory: [
      { timestamp: '2025-02-17T09:00:00Z', status: 'OK', alerts: 0, actions: 0 },
      { timestamp: '2025-02-17T09:30:00Z', status: 'OK', alerts: 0, actions: 1 },
      { timestamp: '2025-02-17T10:00:00Z', status: 'ALERT', alerts: 1, actions: 2 },
      { timestamp: '2025-02-17T10:30:00Z', status: 'OK', alerts: 0, actions: 0 }
    ],

    // Active Alerts
    alerts: [
      {
        id: 'alert-001',
        severity: 'warning',
        type: 'roas_drop',
        message: 'ROAS dropped to 0.8 on "Foodies - Broad" ad set',
        metric: 'ROAS',
        currentValue: 0.8,
        threshold: 1.0,
        createdAt: '2025-02-17T10:00:00Z',
        acknowledged: false,
        recommendedAction: {
          type: 'pause_ad_set',
          target: 'Foodies - Broad',
          rationale: 'Performance below threshold for 48 hours'
        }
      }
    ],

    // Autonomous Actions Taken
    actionsTaken: [
      {
        id: 'action-001',
        type: 'budget_reallocation',
        description: 'Reallocated $15 from "Foodies - Broad" to "Wagyu Enthusiasts"',
        beforeState: { 'Foodies - Broad': 200, 'Wagyu Enthusiasts': 200 },
        afterState: { 'Foodies - Broad': 185, 'Wagyu Enthusiasts': 215 },
        rationale: 'Wagyu Enthusiasts ROAS (2.3) significantly higher than Foodies - Broad (0.8)',
        autonomous: true,
        executedAt: '2025-02-17T09:35:00Z'
      },
      {
        id: 'action-002',
        type: 'creative_swap',
        description: 'Swapped underperforming "Farm Story" carousel with "Sizzle Video"',
        beforeState: { creative: 'Farm Story', ctr: 0.4 },
        afterState: { creative: 'Sizzle Video', ctr: 2.1 },
        rationale: 'Farm Story CTR (0.4%) below 0.5% threshold after 1,200 impressions',
        autonomous: true,
        executedAt: '2025-02-17T08:15:00Z'
      },
      {
        id: 'action-003',
        type: 'bid_adjustment',
        description: 'Increased bid by 10% on high-performing placement',
        beforeState: { bid: 1.50 },
        afterState: { bid: 1.65 },
        rationale: 'Instagram Stories showing 2.5X ROAS, room for scale',
        autonomous: true,
        executedAt: '2025-02-17T07:00:00Z'
      }
    ],

    // Permissions/Boundaries
    permissions: {
      budgetReallocationLimit: 0.20, // 20% max shift
      autoPauseRoasThreshold: 0.50,
      autoScaleRoasThreshold: 2.00,
      creativeSwapCtrThreshold: 0.50,
      dailyActionLimit: 10,
      requireApprovalAbove: 100.00
    },

    // Daily Check-in Conversation
    dailyCheckin: {
      timestamp: '2025-02-17T09:00:00Z',
      messages: [
        {
          role: 'auxora',
          content: "Good morning, Len! Here's your daily snapshot for YamaBushi Farms.",
          timestamp: '09:00'
        },
        {
          role: 'auxora',
          content: "**Yesterday's Performance:**\n- Spend: $28.45\n- Revenue: $71.00\n- ROAS: 2.49\n- Purchases: 2",
          timestamp: '09:00'
        },
        {
          role: 'auxora',
          content: "**Top Performer:** Wagyu Enthusiasts audience with 3.1X ROAS. I've increased its budget by 10%.",
          timestamp: '09:00'
        },
        {
          role: 'auxora',
          content: "**Action Needed:** The 'Foodies - Broad' audience dropped to 0.8 ROAS. Should I pause it and reallocate to Wagyu Enthusiasts?",
          timestamp: '09:00',
          actions: [
            { label: 'Approve', action: 'pause_and_reallocate' },
            { label: 'Keep Running', action: 'continue' },
            { label: 'Let me decide', action: 'manual' }
          ]
        }
      ]
    },

    // Weekly Sync Report (YamaBushi Style)
    weeklyReport: {
      week: 4,
      dateRange: 'Feb 10-16, 2025',
      summary: {
        totalSpend: 198.67,
        totalRevenue: 396.00,
        roas: 1.99,
        purchases: 5,
        cpa: 39.73,
        impressions: 45230,
        clicks: 892,
        ctr: 1.97
      },
      comparison: {
        roasChange: 0.31,
        roasChangePercent: 18.5,
        revenueChange: 96.00,
        revenueChangePercent: 32.0
      },
      topPerformers: {
        audiences: [
          { name: 'Wagyu Enthusiasts', roas: 3.1, spend: 85.20, revenue: 264.00, status: 'scale' },
          { name: 'High-Income Gifters', roas: 1.8, spend: 62.30, revenue: 112.00, status: 'optimize' }
        ],
        creatives: [
          { name: 'Sizzle Video', ctr: 2.4, roas: 2.8, impressions: 18500 },
          { name: 'Unboxing Experience', ctr: 1.9, roas: 2.1, impressions: 15200 }
        ]
      },
      bottomPerformers: {
        audiences: [
          { name: 'Foodies - Broad', roas: 0.8, spend: 51.17, revenue: 41.00, recommendation: 'Pause' }
        ],
        creatives: [
          { name: 'Farm Story', ctr: 0.4, roas: 0.6, recommendation: 'Replace' }
        ]
      },
      insights: [
        'Wagyu enthusiast audience responds best to cooking/preparation content',
        'Video creative outperforms static images by 2.5X',
        'Weekend performance 40% higher than weekdays',
        'Instagram Stories driving 35% of conversions'
      ],
      nextWeekPlan: [
        { priority: 1, action: 'Scale Wagyu Enthusiasts budget to $150/week' },
        { priority: 2, action: 'Pause Foodies - Broad, reallocate budget' },
        { priority: 3, action: 'Launch new video creative featuring chef preparation' },
        { priority: 4, action: 'Add weekend bid modifier +20%' }
      ]
    }
  },

  // ===== PHASE 4: 5-WEEK TRANSFORMATION =====
  weeklyData: {
    week1: {
      week: 1,
      dateRange: 'Jan 20-26',
      phase: 'Learning',
      metrics: {
        spend: 48.23,
        revenue: 38.50,
        roas: 0.80,
        purchases: 1,
        impressions: 12450,
        clicks: 187,
        ctr: 1.50,
        cpc: 0.26,
        cpa: 48.23
      },
      highlights: [
        'Campaign launched successfully',
        'Collecting initial data across 3 audiences',
        'Pixel firing correctly on all events'
      ],
      openclawActions: [
        'Monitored delivery across all ad sets',
        'No interventions needed - learning phase'
      ]
    },
    week2: {
      week: 2,
      dateRange: 'Jan 27 - Feb 2',
      phase: 'Optimization',
      metrics: {
        spend: 52.15,
        revenue: 78.00,
        roas: 1.50,
        purchases: 2,
        impressions: 18920,
        clicks: 312,
        ctr: 1.65,
        cpc: 0.17,
        cpa: 26.08
      },
      highlights: [
        'Identified top performer: Wagyu Enthusiasts',
        'Paused underperforming creative',
        'ROAS improved 87% week-over-week'
      ],
      openclawActions: [
        'Auto-paused "Farm Story" creative (CTR 0.4%)',
        'Reallocated $10 to Wagyu Enthusiasts',
        'Adjusted bid strategy on Instagram'
      ]
    },
    week3: {
      week: 3,
      dateRange: 'Feb 3-9',
      phase: 'Scaling',
      metrics: {
        spend: 156.42,
        revenue: 312.00,
        roas: 1.99,
        purchases: 4,
        impressions: 32100,
        clicks: 584,
        ctr: 1.82,
        cpc: 0.27,
        cpa: 39.11
      },
      highlights: [
        'Doubled budget on winning audience',
        'Launched Google Ads campaign',
        'Achieved near-target ROAS'
      ],
      openclawActions: [
        'Increased Wagyu Enthusiasts budget by 50%',
        'Paused Foodies - Broad temporarily',
        'Set up retargeting campaign'
      ]
    },
    week4: {
      week: 4,
      dateRange: 'Feb 10-16',
      phase: 'Optimization',
      metrics: {
        spend: 198.67,
        revenue: 396.00,
        roas: 1.99,
        purchases: 5,
        impressions: 45230,
        clicks: 892,
        ctr: 1.97,
        cpc: 0.22,
        cpa: 39.73
      },
      highlights: [
        'Consistent ROAS maintained',
        'Weekend performance optimization',
        'New creative in testing'
      ],
      openclawActions: [
        'Added weekend bid modifier',
        'Tested new chef video creative',
        'Optimized for purchase conversions'
      ]
    },
    week5: {
      week: 5,
      dateRange: 'Feb 17-23',
      phase: 'Maximum Scale',
      metrics: {
        spend: 312.45,
        revenue: 945.00,
        roas: 3.02,
        purchases: 12,
        impressions: 68400,
        clicks: 1456,
        ctr: 2.13,
        cpc: 0.21,
        cpa: 26.04
      },
      highlights: [
        'TARGET ACHIEVED: 3X ROAS',
        'Highest revenue week',
        'All systems optimized'
      ],
      openclawActions: [
        'Scaled winning combinations',
        'Maintained performance with increased spend',
        'Prepared for month 2 scale plan'
      ]
    }
  },

  // Results Summary
  results: {
    timeline: '5 weeks',
    totalSpend: 768.92,
    totalRevenue: 1769.50,
    finalROAS: 2.30,
    averageROAS: 1.86,
    peakROAS: 3.02,
    totalPurchases: 24,
    customerAcquisitionCost: 32.04,
    topAudience: 'Wagyu Enthusiasts',
    topCreative: 'Sizzle Video',
    autonomousActions: 18,
    alertsHandled: 7,
    keyWins: [
      'Achieved 3X ROAS target in Week 5',
      'Reduced CPA by 46% from Week 1 to Week 5',
      'Identified scalable audience segment',
      'Built foundation for $5K+ monthly revenue'
    ]
  },

  // Demo Navigation State
  navigation: {
    sections: [
      {
        id: 'onboarding',
        label: 'Onboarding',
        icon: 'rocket',
        subsections: [
          { id: 'landing', label: 'Enter URL', status: 'completed' },
          { id: 'research', label: 'Deep Research', status: 'completed' },
          { id: 'payment1', label: 'Strategy ($1.99)', status: 'completed' },
          { id: 'interview', label: 'Voice Interview', status: 'completed' },
          { id: 'gtm', label: 'GTM Report', status: 'completed' },
          { id: 'payment2', label: 'Full Service ($20)', status: 'completed' }
        ]
      },
      {
        id: 'execution',
        label: 'Execution',
        icon: 'cog',
        subsections: [
          { id: 'channels', label: 'Connect Channels', status: 'completed' },
          { id: 'budget', label: 'Budget Simulation', status: 'completed' },
          { id: 'testing', label: 'Testing Plan', status: 'completed' },
          { id: 'creative', label: 'Creative Development', status: 'completed' },
          { id: 'launch', label: 'Pre-Launch Checklist', status: 'completed' }
        ]
      },
      {
        id: 'openclaw',
        label: 'OpenClaw',
        icon: 'heart-pulse',
        subsections: [
          { id: 'dashboard', label: 'Live Dashboard', status: 'active' },
          { id: 'daily', label: 'Daily Check-in', status: 'active' },
          { id: 'alerts', label: 'Alerts & Actions', status: 'active' },
          { id: 'weekly', label: 'Weekly Report', status: 'active' }
        ]
      },
      {
        id: 'results',
        label: 'Results',
        icon: 'trophy',
        subsections: [
          { id: 'timeline', label: '5-Week Journey', status: 'completed' },
          { id: 'metrics', label: 'Final Metrics', status: 'completed' },
          { id: 'next', label: 'Next Steps', status: 'active' }
        ]
      }
    ],
    currentSection: 'openclaw',
    currentSubsection: 'dashboard'
  }
};

module.exports = auxoraDemo;
