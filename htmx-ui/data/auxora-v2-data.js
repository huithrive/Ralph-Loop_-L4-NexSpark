/**
 * Auxora V2 Demo Data
 * 8-chapter professional workspace data from real agency documents
 * (project sync sheet, ad placement plan, expert interview, weekly sync reports)
 */

var auxoraV2 = {

  brand: {
    name: 'Auxora',
    tagline: 'Your AI Growth Co-Founder',
    client: 'Len Chen',
    company: 'YamaBushi Farms',
    industry: 'Premium A5 Japanese Wagyu',
    website: 'yamabushifarms.com'
  },

  chapters: [
    { id: 1, key: 'discovery', title: 'Discovery & Research', icon: '🔍', short: 'Discovery' },
    { id: 2, key: 'brand', title: 'Brand & Visual Identity', icon: '🎨', short: 'Brand' },
    { id: 3, key: 'site', title: 'Site Build', icon: '🏪', short: 'Site' },
    { id: 4, key: 'adaccounts', title: 'Ad Accounts Setup', icon: '📡', short: 'Ad Setup' },
    { id: 5, key: 'campaigns', title: 'Campaign Planning', icon: '📊', short: 'Campaigns' },
    { id: 6, key: 'launch', title: 'Launch & Testing', icon: '🚀', short: 'Launch' },
    { id: 7, key: 'optimize', title: 'Optimization', icon: '⚡', short: 'Optimize' },
    { id: 8, key: 'results', title: 'Scale & Results', icon: '🏆', short: 'Results' }
  ],

  // ─── CH1: DISCOVERY & RESEARCH ───
  ch1: {
    market: {
      size: '$7.2B',
      label: 'Premium Beef Market (US)',
      growth: '8.3% CAGR',
      trend: 'DTC premium food rising 23% YoY',
      segments: [
        { name: 'Wagyu/A5 Grade', size: '$1.8B', share: '25%' },
        { name: 'Premium Cuts', size: '$3.1B', share: '43%' },
        { name: 'Organic/Grass-fed', size: '$2.3B', share: '32%' }
      ]
    },
    competitors: [
      { name: 'Snake River Farms', price: '$$$$', strength: 'Brand recognition', weakness: 'Limited A5 selection', traffic: '180K/mo', adSpend: '$50K/mo' },
      { name: 'Holy Grail Steak', price: '$$$$$', strength: 'Ultra-premium positioning', weakness: 'High prices limit market', traffic: '45K/mo', adSpend: '$20K/mo' },
      { name: 'Crowd Cow', price: '$$$', strength: 'Marketplace model', weakness: 'Less brand control', traffic: '320K/mo', adSpend: '$80K/mo' },
      { name: 'YamaBushi Farms', price: '$$$$', strength: 'Authentic Japanese sourcing', weakness: 'No paid marketing yet', traffic: '2K/mo', adSpend: '$0' }
    ],
    seasonality: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      data: [65, 55, 60, 70, 75, 80, 90, 85, 70, 75, 95, 100],
      peaks: ['Jul (Grilling season)', 'Nov-Dec (Holiday gifting)']
    },
    audiences: [
      {
        name: 'Wagyu Enthusiasts',
        size: '2.4M addressable',
        age: '35-55',
        income: '$120K+',
        interests: 'Fine dining, cooking, food media',
        behavior: 'Subscribe to food boxes, shop specialty grocers',
        platforms: 'Instagram, YouTube, Google Search'
      },
      {
        name: 'Health-Conscious Foodies',
        size: '5.1M addressable',
        age: '28-45',
        income: '$85K+',
        interests: 'Organic food, supplements, wellness',
        behavior: 'Read nutrition labels, follow health influencers',
        platforms: 'Meta, TikTok, Google'
      },
      {
        name: 'Gift Buyers',
        size: '8.2M addressable (seasonal)',
        age: '30-60',
        income: '$100K+',
        interests: 'Luxury gifts, experiences, holidays',
        behavior: 'Seasonal spenders, corporate gifting',
        platforms: 'Google Search, Meta, Email'
      }
    ]
  },

  // ─── CH2: BRAND & VISUAL IDENTITY ───
  ch2: {
    colors: [
      { name: 'Primary', hex: '#78350F', label: 'Wagyu Brown' },
      { name: 'Accent', hex: '#F59E0B', label: 'Golden Amber' },
      { name: 'Background', hex: '#FFFBEB', label: 'Cream White' }
    ],
    fonts: {
      heading: { name: 'Playfair Display', style: 'Elegant serif for premium feel', weight: '700' },
      body: { name: 'Inter', style: 'Clean sans-serif for readability', weight: '400' },
      detail: { name: 'JetBrains Mono', style: 'Monospace for data/prices', weight: '500' }
    },
    content: {
      slogan: 'From Japan\'s Finest Farms to Your Table',
      mission: 'Bringing authentic A5 Japanese Wagyu directly to American homes with uncompromising quality and transparent sourcing.',
      goals: 'Achieve 3X ROAS within 5 weeks, establish DTC brand presence, build repeat customer base of 500+ in Q1.',
      values: ['Authenticity', 'Quality', 'Transparency', 'Craftsmanship'],
      story: 'YamaBushi Farms partners with third-generation cattle farmers in Japan\'s Miyazaki prefecture, known for producing the world\'s finest Wagyu beef. Each cut is individually graded A5 by the Japanese Meat Grading Association.',
      strategy: 'Position as the authentic Japanese Wagyu source for discerning American consumers. Leverage farm-to-table storytelling, A5 certification, and premium unboxing experience.'
    }
  },

  // ─── CH3: SITE BUILD ───
  ch3: {
    template: {
      name: 'Dawn (Customized)',
      platform: 'Shopify',
      theme: 'Premium dark + amber accents',
      pages: ['Home', 'Shop', 'Our Story', 'Grading Guide', 'FAQ', 'Contact']
    },
    products: [
      { name: 'A5 Wagyu Ribeye', price: '$149.99', margin: '62%', type: 'hero', sku: 'WB-RIB-A5', weight: '12oz' },
      { name: 'A5 Wagyu Striploin', price: '$129.99', margin: '58%', type: 'secondary', sku: 'WB-STR-A5', weight: '10oz' },
      { name: 'A5 Wagyu Filet Mignon', price: '$169.99', margin: '65%', type: 'secondary', sku: 'WB-FIL-A5', weight: '8oz' },
      { name: 'Wagyu Tasting Set', price: '$349.99', margin: '55%', type: 'bundle', sku: 'WB-SET-3', weight: '30oz' },
      { name: 'Gift Box Premium', price: '$249.99', margin: '60%', type: 'gift', sku: 'WB-GIFT-P', weight: '20oz' }
    ],
    payments: [
      { name: 'Stripe', status: 'connected', icon: '💳' },
      { name: 'Apple Pay', status: 'connected', icon: '🍎' },
      { name: 'Google Pay', status: 'connected', icon: '📱' },
      { name: 'Shop Pay', status: 'connected', icon: '🛍️' },
      { name: 'PayPal', status: 'connected', icon: '🅿️' }
    ],
    plugins: [
      { name: 'Judge.me', purpose: 'Product reviews & social proof', status: 'installed' },
      { name: 'Klaviyo', purpose: 'Email marketing automation', status: 'installed' },
      { name: 'Boost AI Search', purpose: 'Smart search & filters', status: 'installed' },
      { name: 'ReConvert', purpose: 'Post-purchase upsells', status: 'installed' },
      { name: 'SEO Manager', purpose: 'SEO optimization tools', status: 'installed' }
    ],
    seo: [
      { item: 'Meta titles & descriptions', status: 'done' },
      { item: 'Schema markup (Product, Organization)', status: 'done' },
      { item: 'Image alt tags (all products)', status: 'done' },
      { item: 'Sitemap submitted to Google', status: 'done' },
      { item: 'Page speed optimization (<2s)', status: 'done' },
      { item: 'Mobile responsive check', status: 'done' }
    ]
  },

  // ─── CH4: AD ACCOUNTS SETUP ───
  ch4: {
    meta: {
      items: [
        { name: 'Business Manager', status: 'verified', detail: 'BM ID: 1234567890', icon: '🏢' },
        { name: 'Facebook Page', status: 'connected', detail: 'YamaBushi Farms Official', icon: '📄' },
        { name: 'Meta Pixel', status: 'active', detail: '5 events: PageView, ViewContent, AddToCart, InitiateCheckout, Purchase', icon: '📍' },
        { name: 'Conversions API', status: 'active', detail: '95% event match rate', icon: '🔗' }
      ]
    },
    google: {
      items: [
        { name: 'Google Ads Account', status: 'verified', detail: 'Account ID: 123-456-7890', icon: '📊' },
        { name: 'Google Analytics 4', status: 'connected', detail: 'Property: YamaBushi Farms', icon: '📈' },
        { name: 'Google Merchant Center', status: 'active', detail: '12 products approved, all feeds healthy', icon: '🛒' },
        { name: 'Conversion Tracking', status: 'active', detail: '3 actions: Purchase, Add to Cart, Begin Checkout', icon: '🎯' }
      ]
    }
  },

  // ─── CH5: CAMPAIGN PLANNING ───
  ch5: {
    budget: {
      total: 13000,
      days: 31,
      dailyAvg: 419,
      phases: 3
    },
    phases: [
      {
        id: 1,
        name: 'Data Collection & Learning',
        days: 10,
        budget: 3900,
        dailyBudget: 390,
        google: { pct: 70, amount: 2730, campaigns: [
          { type: 'Search Brand', budget: 546, goal: 'Protect brand terms' },
          { type: 'Search Non-Brand', budget: 819, goal: 'High-intent keywords' },
          { type: 'Performance Max', budget: 819, goal: 'Broad reach + shopping' },
          { type: 'YouTube Shorts', budget: 546, goal: 'Video awareness' }
        ]},
        meta: { pct: 30, amount: 1170, campaigns: [
          { type: 'Advantage+ Shopping', budget: 585, goal: 'Product catalog ads' },
          { type: 'Broad Interest', budget: 585, goal: 'Audience discovery' }
        ]}
      },
      {
        id: 2,
        name: 'Optimization & Scaling',
        days: 15,
        budget: 6240,
        dailyBudget: 416,
        google: { pct: 60, amount: 3744, campaigns: [
          { type: 'Search Brand', budget: 562, goal: 'Brand defense' },
          { type: 'Search Non-Brand', budget: 1123, goal: 'Scale winners' },
          { type: 'Performance Max', budget: 1123, goal: 'Scale + retarget' },
          { type: 'YouTube Shorts', budget: 936, goal: 'Expand reach' }
        ]},
        meta: { pct: 40, amount: 2496, campaigns: [
          { type: 'Advantage+ Shopping', budget: 998, goal: 'Scale top products' },
          { type: 'Lookalike Audiences', budget: 749, goal: 'Similar to purchasers' },
          { type: 'Retargeting', budget: 749, goal: 'Cart abandoners + viewers' }
        ]}
      },
      {
        id: 3,
        name: 'Scale & Profit',
        days: 6,
        budget: 2860,
        dailyBudget: 477,
        google: { pct: 53, amount: 1516, campaigns: [
          { type: 'Search Brand', budget: 303, goal: 'Maintain brand' },
          { type: 'Search Non-Brand', budget: 455, goal: 'Top performers only' },
          { type: 'Performance Max', budget: 455, goal: 'Max ROAS bidding' },
          { type: 'YouTube Shorts', budget: 303, goal: 'Scale proven creatives' }
        ]},
        meta: { pct: 47, amount: 1344, campaigns: [
          { type: 'Advantage+ Shopping', budget: 537, goal: 'Proven winners' },
          { type: 'Lookalike Audiences', budget: 403, goal: 'Expand 3-5%' },
          { type: 'Retargeting', budget: 404, goal: 'Final push conversions' }
        ]}
      }
    ],
    audiences: [
      {
        name: 'Vitamin & Supplement Shoppers',
        platform: 'Meta + Google',
        targeting: 'Interest: vitamins, supplements, organic products',
        size: '4.2M',
        rationale: 'Health-conscious buyers overlap heavily with premium food'
      },
      {
        name: 'Wagyu & Premium Meat Enthusiasts',
        platform: 'Google Search + YouTube',
        targeting: 'Keywords: wagyu beef, A5 wagyu, premium steak delivery',
        size: '1.8M',
        rationale: 'High intent, ready to purchase'
      },
      {
        name: 'Organic & Natural Product Buyers',
        platform: 'Meta + Google',
        targeting: 'Interest: organic food, natural products, farm-to-table',
        size: '6.1M',
        rationale: 'Quality-first mindset, willing to pay premium'
      },
      {
        name: 'Luxury Gift Shoppers',
        platform: 'Google + Meta',
        targeting: 'In-market: gifts, luxury food, gourmet baskets',
        size: '3.5M',
        rationale: 'High AOV, seasonal spikes'
      }
    ],
    creatives: [
      {
        name: 'Sizzle Video',
        format: 'Video 15s (Reels/Shorts)',
        description: 'Close-up A5 marbling + searing on hot grill, ASMR audio',
        cta: 'Shop Now',
        placement: 'Reels, YouTube Shorts, Stories'
      },
      {
        name: 'Unboxing Experience',
        format: 'Video 30s',
        description: 'Premium packaging reveal, dry ice effect, quality stamps',
        cta: 'Order Yours',
        placement: 'Feed, In-stream, Discovery'
      },
      {
        name: 'Farm Story Carousel',
        format: 'Carousel 4 slides',
        description: 'Japanese farm → grading → shipping → plate. Story format.',
        cta: 'Learn More',
        placement: 'Feed, Explore, Search'
      }
    ]
  },

  // ─── CH6: LAUNCH & TESTING (WEEKS 1-2) ───
  ch6: {
    weeks: [
      {
        week: 1,
        dateRange: 'Oct 7-13',
        phase: 'Learning Phase',
        metrics: {
          spend: 148.77,
          impressions: 18420,
          cpm: 8.08,
          clicks: 437,
          ctr: '2.37%',
          cpc: 0.34,
          addToCart: 12,
          purchases: 5,
          cpa: 29.75,
          gmv: 289.50,
          roas: 1.95
        },
        status: 'learning'
      },
      {
        week: 2,
        dateRange: 'Oct 14-20',
        phase: 'Early Optimization',
        metrics: {
          spend: 156.38,
          impressions: 21350,
          cpm: 7.32,
          clicks: 498,
          ctr: '2.33%',
          cpc: 0.31,
          addToCart: 15,
          purchases: 4,
          cpa: 39.10,
          gmv: 245.00,
          roas: 1.57
        },
        status: 'optimizing'
      }
    ],
    byAudience: [
      { name: 'Vitamin & Supplements', spend: 95.20, purchases: 4, roas: 1.52, cpa: 23.80, verdict: 'Top performer' },
      { name: 'Wagyu Enthusiasts', spend: 78.50, purchases: 3, roas: 1.85, cpa: 26.17, verdict: 'Strong intent' },
      { name: 'Organic Products', spend: 68.30, purchases: 1, roas: 0.73, cpa: 68.30, verdict: 'Needs optimization' },
      { name: 'Gift Shoppers', spend: 63.15, purchases: 1, roas: 0.89, cpa: 63.15, verdict: 'Too early (seasonal)' }
    ],
    byCreative: [
      { name: 'Sizzle Video', impressions: 15200, ctr: '3.1%', purchases: 5, roas: 2.15, verdict: 'Winner' },
      { name: 'Unboxing Experience', impressions: 12800, ctr: '2.0%', purchases: 2, roas: 1.22, verdict: 'Decent' },
      { name: 'Farm Story Carousel', impressions: 11770, ctr: '1.8%', purchases: 2, roas: 0.95, verdict: 'Underperforming' }
    ],
    analysis: {
      en: 'Week 1-2 shows promising early signals. Learning phase is progressing normally with 9 purchases at $33.65 avg CPA. Sizzle Video and Vitamin audience are early leaders. Google Search driving highest intent traffic.',
      zh: '第1-2周显示积极信号。学习阶段正常推进，共9笔成交，平均CPA $33.65。短视频和维生素受众表现突出。Google搜索带来最高转化意向流量。'
    },
    openclawActions: [
      'Paused Farm Carousel on Meta (ROAS < 0.5 after 500 impressions)',
      'Increased Sizzle Video budget by 15% (CTR 3.1% exceeds benchmark)',
      'Added negative keywords: "wagyu restaurant", "wagyu near me" on Google',
      'Shifted $12/day from Organic audience to Vitamin audience',
      'Created lookalike based on 5 purchasers (1% similarity)'
    ]
  },

  // ─── CH7: OPTIMIZATION (WEEKS 3-4) ───
  ch7: {
    weeks: [
      {
        week: 3,
        dateRange: 'Oct 21-27',
        phase: 'Scaling Winners',
        metrics: {
          spend: 178.92,
          impressions: 28900,
          cpm: 6.19,
          clicks: 612,
          ctr: '2.12%',
          cpc: 0.29,
          addToCart: 22,
          purchases: 6,
          cpa: 29.82,
          gmv: 356.00,
          roas: 1.99
        }
      },
      {
        week: 4,
        dateRange: 'Oct 28 - Nov 3',
        phase: 'Profit Push',
        metrics: {
          spend: 163.45,
          impressions: 26400,
          cpm: 6.19,
          clicks: 580,
          ctr: '2.20%',
          cpc: 0.28,
          addToCart: 19,
          purchases: 5,
          cpa: 32.69,
          gmv: 325.00,
          roas: 1.99
        }
      }
    ],
    comparison: {
      w12: { spend: 305.15, purchases: 9, roas: 1.75, cpa: 33.91, ctr: '2.35%' },
      w34: { spend: 342.37, purchases: 11, roas: 1.99, cpa: 31.12, ctr: '2.16%' },
      change: { spend: '+12.2%', purchases: '+22.2%', roas: '+13.7%', cpa: '-8.2%' }
    },
    trendData: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      roas: [1.95, 1.57, 1.99, 1.99],
      cpa: [29.75, 39.10, 29.82, 32.69],
      spend: [148.77, 156.38, 178.92, 163.45]
    },
    actions: [
      { date: 'Oct 22', action: 'Increased Vitamin audience budget by 25%', impact: 'ROAS improved to 1.52 → 1.85' },
      { date: 'Oct 24', action: 'Swapped Farm Carousel for Sizzle Video v2', impact: 'CTR up from 1.8% to 2.6%' },
      { date: 'Oct 26', action: 'Launched male audience test with Reels placement', impact: '3 purchases in first 48 hours' },
      { date: 'Oct 29', action: 'Consolidated Meta audiences (3 → 2 ad sets)', impact: 'CPM reduced 18%' },
      { date: 'Oct 31', action: 'Reactivated top ads from Week 1 with new copy', impact: 'Recovered 2.1X ROAS on restart' },
      { date: 'Nov 1', action: 'Duplicated winning Vitamin ad set with 20% higher budget', impact: 'Maintained ROAS while scaling' }
    ],
    recommendations: [
      { title: 'Scale Vitamin Audience +20-30%', detail: 'Consistent ROAS above 1.5X. Room to scale before saturation.', priority: 'high' },
      { title: 'Launch Male Audience + Reels', detail: 'Early test shows strong engagement. Male 25-45 underserved.', priority: 'high' },
      { title: 'Pause Organic Audience', detail: 'Persistent low ROAS (0.73). Reallocate budget to winners.', priority: 'medium' },
      { title: 'Test Holiday Messaging', detail: 'BFCM approaching. Start gifting angle creatives.', priority: 'medium' }
    ],
    metaStrategies: [
      'Reactivate top-performing ads from previous weeks',
      'Duplicate winning ad sets with incremental budget increases',
      'Consolidate small audiences into broader targeting',
      'Launch campaign budget optimization (CBO) across ad sets'
    ]
  },

  // ─── CH8: SCALE & RESULTS (WEEK 5) ───
  ch8: {
    week5: {
      week: 5,
      dateRange: 'Nov 4-10',
      phase: 'Scale & Profit',
      metrics: {
        spend: 121.40,
        impressions: 22100,
        cpm: 5.49,
        clicks: 524,
        ctr: '2.37%',
        cpc: 0.23,
        addToCart: 25,
        purchases: 12,
        cpa: 10.12,
        gmv: 945.00,
        roas: 7.78
      }
    },
    weeklyRevenue: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
      revenue: [289.50, 245.00, 356.00, 325.00, 945.00],
      spend: [148.77, 156.38, 178.92, 163.45, 121.40]
    },
    roasProgression: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
      data: [1.95, 1.57, 1.99, 1.99, 7.78],
      target: 3.0
    },
    finalMetrics: {
      totalSpend: 768.92,
      totalRevenue: 2160.50,
      finalROAS: 2.81,
      peakROAS: 7.78,
      totalPurchases: 37,
      avgCPA: 20.78,
      avgOrderValue: 58.39,
      bestAudience: 'Wagyu Enthusiasts',
      bestCreative: 'Sizzle Video'
    },
    bestPerformers: {
      audience: { name: 'Wagyu Enthusiasts + Vitamin Shoppers', roas: 3.2, detail: 'Combined targeting outperformed individual segments' },
      creative: { name: 'Sizzle Video (Original + v2)', roas: 2.8, detail: 'ASMR sizzle format consistently top CTR and conversion' },
      platform: { name: 'Google Search (Brand + Non-Brand)', roas: 3.5, detail: 'Highest intent channel, lowest CPA' }
    },
    scalingPlan: {
      month2Budget: 5000,
      newChannels: ['TikTok Ads', 'Email (Klaviyo flows)'],
      strategies: [
        'Scale Google Search to $2,500/mo (proven ROAS 3.5X)',
        'Expand Meta to $1,500/mo with Advantage+ and CBO',
        'Launch TikTok with Sizzle Video format ($500/mo test)',
        'Build Klaviyo welcome + abandon flows ($500/mo equivalent)',
        'Target 5X ROAS at $5K/mo spend'
      ]
    },
    holidayStrategy: {
      event: 'BFCM (Black Friday / Cyber Monday)',
      budget: '$2,000 additional',
      tactics: [
        'Gift box bundles at 15% discount',
        'Early access email to existing customers',
        'Retarget all site visitors from past 60 days',
        'Google Shopping priority listing',
        'Meta carousel: "Gift the Best Wagyu"'
      ]
    }
  },

  // ─── WHATSAPP MESSAGES PER CHAPTER ───
  whatsapp: {
    ch1: [
      { from: 'auxora', text: 'Market research complete! Premium beef market is $7.2B with 8.3% growth. 🎯', time: '9:15 AM' },
      { from: 'auxora', text: 'Found 3 main competitors. Snake River Farms is biggest at $50K/mo ad spend. You have a real gap to exploit with authentic A5 sourcing.', time: '9:16 AM' },
      { from: 'auxora', text: 'Identified 3 audience segments. Any competitors we missed?', time: '9:17 AM' },
      { from: 'len', text: 'Looks great! No one else comes to mind. Proceed! 👍', time: '9:20 AM' }
    ],
    ch2: [
      { from: 'auxora', text: 'Brand identity ready! Following Bella\'s advice: 3 colors max for premium feel.', time: '10:30 AM' },
      { from: 'auxora', text: 'Color palette: Wagyu Brown + Golden Amber + Cream. Fonts: Playfair Display + Inter.', time: '10:31 AM' },
      { from: 'auxora', text: 'Approve the palette? 🎨', time: '10:32 AM' },
      { from: 'len', text: '👍 Love it, very premium', time: '10:35 AM' }
    ],
    ch3: [
      { from: 'auxora', text: 'Store framework done! Shopify Dawn theme customized with your brand colors. 🏪', time: '2:00 PM' },
      { from: 'auxora', text: '5 products loaded, all payment gateways connected, 5 plugins installed.', time: '2:01 PM' },
      { from: 'auxora', text: 'Need your product photos for the hero section 📸', time: '2:02 PM' },
      { from: 'len', text: 'Sending photos now! Here\'s the ribeye shot 🥩', time: '2:15 PM' },
      { from: 'auxora', text: 'Perfect quality! Uploading to store now. SEO all green ✅', time: '2:18 PM' }
    ],
    ch4: [
      { from: 'auxora', text: 'All ad accounts set up and verified! ✅', time: '3:30 PM' },
      { from: 'auxora', text: 'Meta: BM ✅ Page ✅ Pixel ✅ CAPI ✅\nGoogle: Ads ✅ GA4 ✅ GMC ✅ Tracking ✅', time: '3:31 PM' },
      { from: 'auxora', text: 'Pixel match rate at 95% — that\'s excellent. 12 products approved in GMC.', time: '3:32 PM' },
      { from: 'len', text: 'Let\'s go! Everything green 🟢', time: '3:35 PM' }
    ],
    ch5: [
      { from: 'auxora', text: 'Budget plan ready! $13,000 over 31 days, 3 phases. 📊', time: '4:00 PM' },
      { from: 'auxora', text: 'Phase 1 (10 days): Data collection, Google 70% / Meta 30%\nPhase 2 (15 days): Optimization, 60/40\nPhase 3 (6 days): Scale & profit, 53/47', time: '4:01 PM' },
      { from: 'auxora', text: '4 audience segments, 3 creative formats. Phase 1 = data collection — ROAS will be low initially. Normal! Review the plan?', time: '4:02 PM' },
      { from: 'len', text: 'Approved 👍 Let\'s launch!', time: '4:10 PM' }
    ],
    ch6: [
      { from: 'auxora', text: 'Week 1 results: 5 purchases! CTR 2.37%. Learning phase is progressing normally. 📈', time: '10:00 AM' },
      { from: 'auxora', text: 'Sizzle Video is the early winner (3.1% CTR). Vitamin audience performing best.', time: '10:01 AM' },
      { from: 'auxora', text: 'Week 2: 4 more purchases. CPA trending to $33.65. OpenClaw already made 5 auto-optimizations.', time: '10:02 AM' },
      { from: 'len', text: 'Keep going 💪 Trust the process!', time: '10:15 AM' }
    ],
    ch7: [
      { from: 'auxora', text: 'Weeks 3-4 update: ROAS improved to 1.99! 11 purchases this period. ⚡', time: '11:00 AM' },
      { from: 'auxora', text: 'Vitamin audience ROAS 1.52 → 1.85 after budget increase. CPA down 8.2%.', time: '11:01 AM' },
      { from: 'auxora', text: 'Recommendation: Increase Vitamin budget 20-30% and launch male audience test with Reels. Approve?', time: '11:02 AM' },
      { from: 'len', text: 'Yes, scale it! 🚀', time: '11:10 AM' }
    ],
    ch8: [
      { from: 'auxora', text: '🎉 Week 5 RESULTS: ROAS 7.78X! $945 revenue this week alone!', time: '12:00 PM' },
      { from: 'auxora', text: '12 purchases in Week 5 — more than Weeks 1-2 combined! CPA dropped to $10.12.', time: '12:01 PM' },
      { from: 'auxora', text: '5-week total: $2,160 revenue on $769 spend = 2.81X ROAS. Peak week hit 7.78X! 🏆', time: '12:02 PM' },
      { from: 'auxora', text: 'Month 2 plan ready: Scale to $5K/mo, add TikTok, target 5X ROAS. Plus BFCM strategy! Ready to scale?', time: '12:03 PM' },
      { from: 'len', text: 'Amazing results! Let\'s scale! 🚀🚀🚀', time: '12:10 PM' }
    ]
  },

  // ─── CHAT PANEL MESSAGES (LEFT SIDE) ───
  chatMessages: [
    { from: 'auxora', text: 'Welcome back, Len! I\'ve prepared the full project workspace for YamaBushi Farms.' },
    { from: 'auxora', text: 'Use the chapter navigation above to explore each phase. The WhatsApp panel shows our key conversations.' },
    { from: 'auxora', text: 'Click any chapter to see the detailed work. Everything is editable — feel free to customize.' }
  ]
};

module.exports = auxoraV2;
