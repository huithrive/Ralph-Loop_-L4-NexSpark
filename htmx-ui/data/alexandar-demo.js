/**
 * Alexandar CGO Demo Data
 * First Week Timeline for Sarah's Beverage Brand
 */

const alexandarDemo = {
  // Sarah's Business Profile
  user: {
    name: 'Sarah Chen',
    company: 'Bloom Beverages',
    role: 'Founder & CEO',
    location: 'San Francisco, CA',
    industry: 'D2C Beverages',
    product: 'Adaptogenic sparkling drinks',
    website: 'bloomdrinks.com',
    avatar: 'SC',
    timezone: 'America/Los_Angeles',
    preferences: {
      briefingTime: '8:00 AM',
      urgentAlerts: 'push',
      weeklyReportDay: 'Friday',
      riskTolerance: 'moderate',
      approvalThreshold: 500,
    },
  },

  // Alexandar's Identity
  agent: {
    name: 'Alexandar',
    shortName: 'Alex',
    title: 'Chief Growth Officer',
    avatar: 'A',
    status: 'active',
    deployedAt: '2026-02-10T09:00:00-08:00',
  },

  // Week 1 Timeline
  timeline: {
    week: 1,
    startDate: '2026-02-10',
    endDate: '2026-02-16',
    days: [
      // ═══════════════════════════════════════════════════════════════
      // DAY 1 - Monday: Onboarding & Deep Research
      // ═══════════════════════════════════════════════════════════════
      {
        day: 1,
        date: '2026-02-10',
        dayName: 'Monday',
        theme: 'Onboarding & Research',
        status: 'completed',
        briefing: {
          greeting: "Good morning, Sarah! I'm Alexandar, your new Chief Growth Officer. I'm excited to start driving growth for Bloom Beverages. Let me begin by deeply understanding your market.",
          agenda: [
            { time: '9:00 AM', task: 'Deep market research on adaptogenic beverages', status: 'completed' },
            { time: '10:30 AM', task: 'Competitor analysis (Recess, Kin, Moment)', status: 'completed' },
            { time: '12:00 PM', task: 'Voice interview with Sarah', status: 'completed' },
            { time: '2:00 PM', task: 'GTM strategy synthesis', status: 'completed' },
            { time: '4:00 PM', task: 'Present initial strategy for approval', status: 'completed' },
          ],
        },
        activities: [
          {
            time: '9:15 AM',
            type: 'research',
            title: 'Market Research Initiated',
            description: 'Analyzing the $4.2B functional beverage market with focus on adaptogenic drinks segment.',
            status: 'completed',
          },
          {
            time: '10:45 AM',
            type: 'insight',
            title: 'Competitor Intel',
            description: 'Identified 5 key competitors. Recess leads with 32% market share. Gap found: no brand owns the "focus + calm" positioning.',
            status: 'completed',
            data: {
              competitors: [
                { name: 'Recess', share: '32%', positioning: 'Calm' },
                { name: 'Kin Euphorics', share: '18%', positioning: 'Social' },
                { name: 'Moment', share: '12%', positioning: 'Stress Relief' },
                { name: 'Vybes', share: '8%', positioning: 'CBD Wellness' },
                { name: 'Others', share: '30%', positioning: 'Various' },
              ],
            },
          },
          {
            time: '12:30 PM',
            type: 'interview',
            title: 'Founder Interview Complete',
            description: 'Learned about Sarah\'s vision: "Making adaptogenic wellness accessible to busy professionals." Key differentiator: proprietary ashwagandha + L-theanine blend.',
            status: 'completed',
          },
          {
            time: '3:00 PM',
            type: 'strategy',
            title: 'GTM Strategy Draft',
            description: 'Created 6-month growth roadmap targeting $50K MRR. Recommended 60/40 Meta/Google split.',
            status: 'completed',
          },
          {
            time: '4:30 PM',
            type: 'approval_request',
            title: 'Strategy Approval Requested',
            description: 'Submitted GTM strategy for Sarah\'s review. Awaiting approval to proceed with execution.',
            status: 'approved',
            approvedAt: '5:15 PM',
          },
        ],
        metrics: {
          tasksCompleted: 5,
          tasksTotal: 5,
          approvalsPending: 0,
          alertsTriggered: 0,
        },
        endOfDay: {
          summary: "Day 1 complete. I've built a comprehensive understanding of Bloom Beverages and the functional drinks market. Your positioning around 'focus + calm' is unique and defensible. Tomorrow I'll start building your landing page and creative assets.",
          nextDay: 'Landing page development + ad creative generation',
        },
      },

      // ═══════════════════════════════════════════════════════════════
      // DAY 2 - Tuesday: Landing Page & Creative Development
      // ═══════════════════════════════════════════════════════════════
      {
        day: 2,
        date: '2026-02-11',
        dayName: 'Tuesday',
        theme: 'Build & Create',
        status: 'completed',
        briefing: {
          greeting: "Good morning, Sarah! Yesterday's research gave us a solid foundation. Today I'm building your conversion machine.",
          agenda: [
            { time: '9:00 AM', task: 'Design landing page structure', status: 'completed' },
            { time: '10:00 AM', task: 'Generate hero copy variations', status: 'completed' },
            { time: '11:30 AM', task: 'Create 8 ad creative variations', status: 'completed' },
            { time: '2:00 PM', task: 'A/B test setup for landing page', status: 'completed' },
            { time: '3:30 PM', task: 'Connect Meta & Google accounts', status: 'completed' },
          ],
          overnight: {
            spend: null,
            note: 'No campaigns live yet',
          },
        },
        activities: [
          {
            time: '9:30 AM',
            type: 'build',
            title: 'Landing Page Structure',
            description: 'Designed a high-converting landing page with hero, benefits, social proof, and pricing sections. Using your brand colors (sage green + warm coral).',
            status: 'completed',
          },
          {
            time: '10:45 AM',
            type: 'creative',
            title: 'Copy Variations Generated',
            description: 'Created 5 headline variations based on your "focus + calm" positioning. Top pick: "Finally, a drink that helps you focus AND relax."',
            status: 'completed',
            data: {
              headlines: [
                { text: 'Finally, a drink that helps you focus AND relax.', score: 94 },
                { text: 'Stress less. Think more. Bloom.', score: 88 },
                { text: 'The adaptogenic drink for modern minds.', score: 85 },
                { text: 'Your brain\'s new favorite beverage.', score: 82 },
                { text: 'Focus without the jitters. Calm without the crash.', score: 91 },
              ],
            },
          },
          {
            time: '12:00 PM',
            type: 'creative',
            title: 'Ad Creatives Generated',
            description: 'Generated 8 ad creative variations: 4 static images, 2 carousels, 2 video concepts. All optimized for Meta feed and stories.',
            status: 'completed',
            data: {
              creatives: [
                { type: 'image', name: 'Product Hero', format: '1:1', score: 92 },
                { type: 'image', name: 'Lifestyle Office', format: '1:1', score: 88 },
                { type: 'image', name: 'Ingredients Focus', format: '4:5', score: 85 },
                { type: 'image', name: 'Before/After Energy', format: '4:5', score: 90 },
                { type: 'carousel', name: 'Benefits Breakdown', slides: 5, score: 87 },
                { type: 'carousel', name: 'Customer Stories', slides: 4, score: 89 },
                { type: 'video', name: 'Day in the Life', duration: '15s', score: 91 },
                { type: 'video', name: 'Product Unboxing', duration: '30s', score: 86 },
              ],
            },
          },
          {
            time: '2:30 PM',
            type: 'build',
            title: 'Landing Page Live',
            description: 'Landing page deployed to bloom-launch.webflow.io. Lighthouse score: 94. Mobile-optimized with 1.2s load time.',
            status: 'completed',
            artifact: {
              type: 'landing_page',
              url: 'bloom-launch.webflow.io',
              lighthouse: 94,
              loadTime: '1.2s',
            },
          },
          {
            time: '4:00 PM',
            type: 'integration',
            title: 'Ad Accounts Connected',
            description: 'Successfully connected Meta Business Manager and Google Ads accounts. Pixel installed and firing correctly.',
            status: 'completed',
            approvalRequired: true,
            approvedBy: 'Sarah',
            approvedAt: '4:30 PM',
          },
        ],
        metrics: {
          tasksCompleted: 5,
          tasksTotal: 5,
          creativesGenerated: 8,
          landingPageScore: 94,
        },
        endOfDay: {
          summary: "Productive day! Your landing page is live with a 94 Lighthouse score. I've created 8 ad variations ready for testing. Tomorrow I'll set up your first campaigns and we'll go live.",
          nextDay: 'Campaign setup + launch',
        },
      },

      // ═══════════════════════════════════════════════════════════════
      // DAY 3 - Wednesday: Campaign Launch
      // ═══════════════════════════════════════════════════════════════
      {
        day: 3,
        date: '2026-02-12',
        dayName: 'Wednesday',
        theme: 'Campaign Launch',
        status: 'completed',
        briefing: {
          greeting: "Good morning, Sarah! Today's the big day - we're launching your first campaigns. I've prepared everything for a smooth liftoff.",
          agenda: [
            { time: '9:00 AM', task: 'Final creative review', status: 'completed' },
            { time: '10:00 AM', task: 'Configure Meta campaign structure', status: 'completed' },
            { time: '11:30 AM', task: 'Set up Google Shopping campaign', status: 'completed' },
            { time: '1:00 PM', task: 'Budget allocation confirmation', status: 'completed' },
            { time: '2:00 PM', task: 'Launch campaigns', status: 'completed' },
            { time: '4:00 PM', task: 'First performance check', status: 'completed' },
          ],
        },
        activities: [
          {
            time: '10:30 AM',
            type: 'campaign',
            title: 'Meta Campaign Structure',
            description: 'Created 3-tier campaign structure: Prospecting (60%), Retargeting (25%), Lookalike (15%). Testing all 8 creatives in prospecting.',
            status: 'completed',
            data: {
              campaigns: [
                { name: 'Bloom - Prospecting', budget: '$42/day', audiences: 3 },
                { name: 'Bloom - Retargeting', budget: '$17.50/day', audiences: 2 },
                { name: 'Bloom - Lookalike', budget: '$10.50/day', audiences: 2 },
              ],
            },
          },
          {
            time: '11:45 AM',
            type: 'campaign',
            title: 'Google Shopping Ready',
            description: 'Set up Google Shopping campaign with product feed. Targeting high-intent keywords: "adaptogenic drinks", "stress relief beverages", "focus drinks".',
            status: 'completed',
          },
          {
            time: '1:15 PM',
            type: 'approval_request',
            title: 'Budget Confirmation',
            description: 'Requesting approval for initial weekly budget of $500 ($70/day). Split: Meta $300, Google $200.',
            status: 'approved',
            approvedAt: '1:30 PM',
            data: {
              weeklyBudget: 500,
              dailyBudget: 70,
              metaBudget: 300,
              googleBudget: 200,
            },
          },
          {
            time: '2:15 PM',
            type: 'launch',
            title: '🚀 Campaigns Live!',
            description: 'All campaigns are now live and spending. Pixel is tracking. First impressions coming in.',
            status: 'completed',
            milestone: true,
          },
          {
            time: '5:00 PM',
            type: 'report',
            title: 'First 3 Hours Performance',
            description: 'Early results look promising. CTR above benchmark at 2.1%. 847 impressions, 18 clicks, 0 conversions yet (expected - learning phase).',
            status: 'completed',
            data: {
              impressions: 847,
              clicks: 18,
              ctr: '2.1%',
              spend: '$8.47',
              conversions: 0,
              note: 'Learning phase - conversions expected in 24-48 hours',
            },
          },
        ],
        metrics: {
          tasksCompleted: 6,
          tasksTotal: 6,
          campaignsLaunched: 4,
          totalSpend: '$8.47',
        },
        endOfDay: {
          summary: "We're live! 🎉 First 3 hours show strong CTR at 2.1% (benchmark is 1.5%). No conversions yet, but that's normal during the learning phase. I'll monitor overnight and report tomorrow morning.",
          nextDay: 'Performance monitoring + first optimizations',
        },
      },

      // ═══════════════════════════════════════════════════════════════
      // DAY 4 - Thursday: First Optimizations
      // ═══════════════════════════════════════════════════════════════
      {
        day: 4,
        date: '2026-02-13',
        dayName: 'Thursday',
        theme: 'Monitor & Optimize',
        status: 'completed',
        briefing: {
          greeting: "Good morning, Sarah! Great news from overnight - we got our first 3 sales! Here's what happened while you were sleeping:",
          overnight: {
            spend: '$61.53',
            impressions: 5247,
            clicks: 89,
            conversions: 3,
            revenue: '$87.00',
            roas: '1.41x',
          },
          agenda: [
            { time: '9:00 AM', task: 'Analyze overnight performance', status: 'completed' },
            { time: '10:00 AM', task: 'Identify winning creatives', status: 'completed' },
            { time: '11:00 AM', task: 'Pause underperformers', status: 'completed' },
            { time: '2:00 PM', task: 'Scale winning audiences', status: 'completed' },
            { time: '4:00 PM', task: 'Generate performance report', status: 'completed' },
          ],
          alerts: [
            {
              type: 'success',
              message: 'First conversions! 3 orders totaling $87 revenue.',
              time: '6:47 AM',
            },
          ],
        },
        activities: [
          {
            time: '9:30 AM',
            type: 'analysis',
            title: 'Performance Analysis Complete',
            description: 'Analyzed 24-hour data. "Product Hero" creative is the clear winner at 3.2% CTR. "Ingredients Focus" underperforming at 0.8% CTR.',
            status: 'completed',
            data: {
              topCreative: { name: 'Product Hero', ctr: '3.2%', conversions: 2 },
              bottomCreative: { name: 'Ingredients Focus', ctr: '0.8%', conversions: 0 },
            },
          },
          {
            time: '11:00 AM',
            type: 'optimization',
            title: 'Underperformers Paused',
            description: 'Paused 2 underperforming creatives: "Ingredients Focus" and "Product Unboxing" video. Reallocating budget to winners.',
            status: 'completed',
            autonomous: true,
            note: 'Within pre-authorized bounds (creative pause after $20 spend with 0 conversions)',
          },
          {
            time: '2:30 PM',
            type: 'optimization',
            title: 'Budget Reallocation',
            description: 'Increased budget for "Women 25-34, Wellness Interest" audience by 20% - showing 2.1x ROAS.',
            status: 'completed',
            autonomous: true,
          },
          {
            time: '4:00 PM',
            type: 'report',
            title: 'Day 1 Performance Report',
            description: 'Full 24-hour report generated. ROAS at 1.41x - ahead of 0.7x learning phase target.',
            status: 'completed',
            data: {
              spend: '$70.00',
              revenue: '$116.00',
              roas: '1.66x',
              orders: 4,
              aov: '$29.00',
              cpa: '$17.50',
              topAudience: 'Women 25-34, Wellness Interest',
            },
          },
        ],
        metrics: {
          tasksCompleted: 5,
          tasksTotal: 5,
          optimizationsMade: 3,
          roas: '1.66x',
          revenue: '$116.00',
        },
        endOfDay: {
          summary: "Excellent first full day! ROAS at 1.66x is well above our 0.7x learning phase target. I've paused underperformers and scaled winners. The 'Women 25-34, Wellness Interest' audience is our early champion.",
          nextDay: 'Continue scaling + creative refresh planning',
        },
      },

      // ═══════════════════════════════════════════════════════════════
      // DAY 5 - Friday: Scaling & Weekly Report
      // ═══════════════════════════════════════════════════════════════
      {
        day: 5,
        date: '2026-02-14',
        dayName: 'Friday',
        theme: 'Scale & Report',
        status: 'completed',
        briefing: {
          greeting: "Happy Friday, Sarah! Week 1 is almost complete. Overnight performance was strong - here's your morning briefing:",
          overnight: {
            spend: '$68.42',
            impressions: 6103,
            clicks: 112,
            conversions: 5,
            revenue: '$145.00',
            roas: '2.12x',
          },
          agenda: [
            { time: '9:00 AM', task: 'Review 48-hour trends', status: 'completed' },
            { time: '10:30 AM', task: 'Propose budget increase', status: 'completed' },
            { time: '12:00 PM', task: 'Generate new creative variations', status: 'completed' },
            { time: '3:00 PM', task: 'Compile Week 1 report', status: 'completed' },
            { time: '4:30 PM', task: 'Present Week 1 results', status: 'completed' },
          ],
          alerts: [
            {
              type: 'opportunity',
              message: 'ROAS hit 2.12x overnight. Recommend scaling budget 30%.',
              time: '7:15 AM',
            },
          ],
        },
        activities: [
          {
            time: '10:30 AM',
            type: 'approval_request',
            title: 'Budget Increase Proposal',
            description: 'ROAS is exceeding targets. Proposing to increase weekly budget from $500 to $700 (+40%).',
            status: 'approved',
            approvedAt: '11:00 AM',
            data: {
              currentBudget: 500,
              proposedBudget: 700,
              increase: '40%',
              expectedROAS: '1.8x',
              expectedRevenue: '$1,260/week',
            },
          },
          {
            time: '12:30 PM',
            type: 'creative',
            title: 'New Creative Batch',
            description: 'Generated 4 new creative variations based on winning elements: Product Hero style + "focus + calm" messaging.',
            status: 'completed',
            data: {
              newCreatives: [
                { name: 'Product Hero V2', type: 'image', score: 93 },
                { name: 'UGC Style Review', type: 'video', score: 89 },
                { name: 'Comparison Chart', type: 'carousel', score: 87 },
                { name: 'Founder Story', type: 'video', score: 91 },
              ],
            },
          },
          {
            time: '4:30 PM',
            type: 'report',
            title: 'Week 1 Report Delivered',
            description: 'Comprehensive Week 1 report sent to Sarah. Key metric: $378 revenue from $208 spend = 1.82x ROAS.',
            status: 'completed',
            milestone: true,
          },
        ],
        metrics: {
          tasksCompleted: 5,
          tasksTotal: 5,
          weeklySpend: '$208.42',
          weeklyRevenue: '$378.00',
          weeklyROAS: '1.82x',
          weeklyOrders: 13,
        },
        endOfDay: {
          summary: "Week 1 complete! 🎉 We achieved 1.82x ROAS on $208 spend, generating $378 in revenue and 13 orders. This significantly outperformed our 0.7x learning phase target. Next week I'll focus on scaling with the increased budget.",
          nextDay: 'Weekend monitoring (reduced activity)',
        },
      },

      // ═══════════════════════════════════════════════════════════════
      // DAY 6 - Saturday: Weekend Monitoring
      // ═══════════════════════════════════════════════════════════════
      {
        day: 6,
        date: '2026-02-15',
        dayName: 'Saturday',
        theme: 'Weekend Monitor',
        status: 'completed',
        briefing: {
          greeting: "Good morning, Sarah! Weekend update - campaigns running smoothly. I'll keep monitoring but no action needed from you.",
          overnight: {
            spend: '$72.15',
            impressions: 5892,
            clicks: 98,
            conversions: 4,
            revenue: '$116.00',
            roas: '1.61x',
          },
          agenda: [
            { time: '10:00 AM', task: 'Automated monitoring', status: 'completed' },
            { time: '2:00 PM', task: 'Mid-day check', status: 'completed' },
            { time: '8:00 PM', task: 'Evening summary', status: 'completed' },
          ],
          note: 'Reduced activity on weekends. Monitoring for anomalies only.',
        },
        activities: [
          {
            time: '10:00 AM',
            type: 'monitoring',
            title: 'Morning Check',
            description: 'All campaigns healthy. CPM slightly elevated (weekend competition) but within acceptable range.',
            status: 'completed',
            autonomous: true,
          },
          {
            time: '2:15 PM',
            type: 'alert',
            title: 'CPM Spike Detected',
            description: 'CPM increased 18% in past 2 hours. Likely due to Valentine\'s Day competition. Monitoring but not concerning.',
            status: 'resolved',
            severity: 'low',
            autonomous: true,
            resolution: 'No action needed - temporary spike',
          },
          {
            time: '8:00 PM',
            type: 'report',
            title: 'Saturday Summary',
            description: 'Good day despite Valentine\'s competition. 4 orders, $116 revenue. ROAS at 1.61x.',
            status: 'completed',
          },
        ],
        metrics: {
          tasksCompleted: 3,
          tasksTotal: 3,
          dailySpend: '$72.15',
          dailyRevenue: '$116.00',
          dailyROAS: '1.61x',
        },
        endOfDay: {
          summary: "Solid Saturday performance. ROAS dipped slightly to 1.61x due to Valentine's Day competition, but still well above target. No action needed - enjoy your weekend!",
          nextDay: 'Sunday monitoring',
        },
      },

      // ═══════════════════════════════════════════════════════════════
      // DAY 7 - Sunday: Week 1 Complete
      // ═══════════════════════════════════════════════════════════════
      {
        day: 7,
        date: '2026-02-16',
        dayName: 'Sunday',
        theme: 'Week 1 Complete',
        status: 'completed',
        briefing: {
          greeting: "Good morning, Sarah! Week 1 officially complete. Here's your comprehensive week-end summary:",
          overnight: {
            spend: '$68.90',
            impressions: 5103,
            clicks: 87,
            conversions: 3,
            revenue: '$87.00',
            roas: '1.26x',
          },
          weekSummary: {
            totalSpend: '$349.47',
            totalRevenue: '$581.00',
            totalROAS: '1.66x',
            totalOrders: 20,
            avgOrderValue: '$29.05',
            cpa: '$17.47',
            topCreative: 'Product Hero',
            topAudience: 'Women 25-34, Wellness Interest',
          },
        },
        activities: [
          {
            time: '10:00 AM',
            type: 'report',
            title: 'Week 1 Final Report',
            description: 'Generated comprehensive Week 1 performance report with insights and Week 2 recommendations.',
            status: 'completed',
            milestone: true,
          },
          {
            time: '12:00 PM',
            type: 'planning',
            title: 'Week 2 Strategy',
            description: 'Prepared Week 2 plan: Scale winning audiences, test new creatives, explore Google Performance Max.',
            status: 'completed',
          },
          {
            time: '4:00 PM',
            type: 'optimization',
            title: 'Pre-Week Prep',
            description: 'Uploaded new creatives for Week 2. Set up Google Performance Max campaign (pending approval).',
            status: 'completed',
          },
        ],
        metrics: {
          tasksCompleted: 3,
          tasksTotal: 3,
          weeklySpend: '$349.47',
          weeklyRevenue: '$581.00',
          weeklyROAS: '1.66x',
          weeklyOrders: 20,
        },
        endOfDay: {
          summary: "Week 1 complete! We exceeded all targets: 1.66x ROAS vs 0.7x target, 20 orders, $581 revenue. You're officially out of the learning phase. Week 2 is set up for scaling - I'll brief you tomorrow morning.",
          nextWeek: 'Scale to $1,000/week budget, test new audiences, launch Google Performance Max',
        },
      },
    ],
  },

  // Week 1 Summary Metrics
  weekSummary: {
    highlights: [
      { metric: 'Total Revenue', value: '$581.00', target: '$350', status: 'exceeded' },
      { metric: 'Total Spend', value: '$349.47', target: '$500', status: 'under_budget' },
      { metric: 'ROAS', value: '1.66x', target: '0.7x', status: 'exceeded' },
      { metric: 'Total Orders', value: '20', target: '12', status: 'exceeded' },
      { metric: 'CPA', value: '$17.47', target: '$25', status: 'exceeded' },
      { metric: 'AOV', value: '$29.05', target: '$29', status: 'on_target' },
    ],
    insights: [
      {
        type: 'winner',
        title: 'Top Performing Creative',
        description: '"Product Hero" image drove 45% of all conversions with 3.2% CTR.',
      },
      {
        type: 'winner',
        title: 'Best Audience',
        description: 'Women 25-34 with wellness interests converted at 2.8x the average.',
      },
      {
        type: 'opportunity',
        title: 'Untapped Potential',
        description: 'Male audience 25-40 showing high engagement but low conversions. Recommend male-focused creative test.',
      },
      {
        type: 'learning',
        title: 'Weekend Performance',
        description: 'ROAS dips 15-20% on weekends due to increased competition. Consider dayparting.',
      },
    ],
    week2Plan: [
      { priority: 1, task: 'Scale budget to $1,000/week (+186%)', status: 'pending_approval' },
      { priority: 2, task: 'Launch Google Performance Max', status: 'ready' },
      { priority: 3, task: 'Test male-focused creative variations', status: 'ready' },
      { priority: 4, task: 'Implement dayparting strategy', status: 'planned' },
      { priority: 5, task: 'Set up email capture on landing page', status: 'planned' },
    ],
  },

  // Alert History
  alerts: [
    {
      id: 1,
      timestamp: '2026-02-13T06:47:00-08:00',
      type: 'success',
      severity: 'info',
      title: 'First Conversions!',
      message: '3 orders totaling $87 revenue came in overnight.',
      status: 'acknowledged',
    },
    {
      id: 2,
      timestamp: '2026-02-14T07:15:00-08:00',
      type: 'opportunity',
      severity: 'info',
      title: 'Scale Opportunity',
      message: 'ROAS hit 2.12x overnight. Recommend scaling budget 30%.',
      status: 'actioned',
      action: 'Budget increased to $700/week',
    },
    {
      id: 3,
      timestamp: '2026-02-15T14:15:00-08:00',
      type: 'warning',
      severity: 'low',
      title: 'CPM Spike',
      message: "CPM increased 18% in past 2 hours due to Valentine's Day competition.",
      status: 'resolved',
      resolution: 'Temporary spike - no action needed',
    },
  ],

  // Approval Log
  approvals: [
    {
      id: 1,
      timestamp: '2026-02-10T17:15:00-08:00',
      type: 'strategy',
      title: 'GTM Strategy',
      description: '6-month growth roadmap targeting $50K MRR',
      status: 'approved',
      approvedBy: 'Sarah Chen',
    },
    {
      id: 2,
      timestamp: '2026-02-11T16:30:00-08:00',
      type: 'integration',
      title: 'Ad Account Access',
      description: 'Meta Business Manager and Google Ads account connection',
      status: 'approved',
      approvedBy: 'Sarah Chen',
    },
    {
      id: 3,
      timestamp: '2026-02-12T13:30:00-08:00',
      type: 'budget',
      title: 'Initial Campaign Budget',
      description: '$500/week budget split: Meta $300, Google $200',
      status: 'approved',
      approvedBy: 'Sarah Chen',
    },
    {
      id: 4,
      timestamp: '2026-02-14T11:00:00-08:00',
      type: 'budget',
      title: 'Budget Increase',
      description: 'Increase from $500 to $700/week (+40%)',
      status: 'approved',
      approvedBy: 'Sarah Chen',
    },
  ],
};

module.exports = alexandarDemo;
