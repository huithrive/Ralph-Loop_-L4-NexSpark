/**
 * advertisingService.js — Advertising Data Processing & Analysis
 * 
 * Standardizes, processes, and formats advertising data from GoMarble.
 * Supports Facebook Ads and Google Ads with unified interfaces.
 * 
 * Functions:
 * - processAccountData: Standardize account objects
 * - processCampaignData: Add summary metrics to campaign insights
 * - processAdData: Add summary metrics to ad-level insights
 * - getTopPerformers: Sort and filter top N performers
 * - comparePeriods: Compare current vs previous metrics
 * - formatAccountList: Pretty-print account list
 * - formatCampaignAnalysis: Detailed campaign report
 * - formatAdAnalysis: Detailed ad-level report
 */

// ============================================================================
// DATA PROCESSING
// ============================================================================

/**
 * Standardize account data across platforms.
 * @param {'facebook' | 'google'} platform
 * @param {Array} rawData - Raw account data from GoMarble
 * @returns {Array<{id, name, platform, currency, status}>}
 */
function processAccountData(platform, rawData) {
  if (!Array.isArray(rawData)) {
    return [];
  }

  return rawData.map(account => {
    if (platform === 'facebook') {
      return {
        id: account.id || account.account_id,
        name: account.name || 'Unnamed Account',
        platform: 'facebook',
        currency: account.currency || 'USD',
        status: account.account_status === 1 ? 'active' : 'inactive',
        raw: account,
      };
    } else if (platform === 'google') {
      return {
        id: account.customer_id,
        name: account.descriptive_name || 'Unnamed Account',
        platform: 'google',
        currency: account.currency_code || 'USD',
        status: 'active', // Google doesn't provide status in list
        raw: account,
      };
    }
    return null;
  }).filter(Boolean);
}

/**
 * Process campaign-level insights with summary metrics.
 * @param {'facebook' | 'google'} platform
 * @param {string} accountId
 * @param {Array} rawData - Campaign insights
 * @returns {Object} {campaigns, summary}
 */
function processCampaignData(platform, accountId, rawData) {
  if (!Array.isArray(rawData)) {
    return { campaigns: [], summary: {} };
  }

  const campaigns = rawData.map(campaign => {
    const spend = parseFloat(campaign.spend || 0);
    const impressions = parseInt(campaign.impressions || 0, 10);
    const clicks = parseInt(campaign.clicks || 0, 10);
    const ctr = parseFloat(campaign.ctr || 0);
    const cpm = parseFloat(campaign.cpm || 0);
    
    // ROAS extraction (Facebook format: [{value: X}])
    let roas = 0;
    if (campaign.purchase_roas && Array.isArray(campaign.purchase_roas) && campaign.purchase_roas.length > 0) {
      roas = parseFloat(campaign.purchase_roas[0].value || 0);
    } else if (typeof campaign.roas === 'number') {
      roas = campaign.roas;
    }

    return {
      name: campaign.campaign_name || campaign.name || 'Unnamed Campaign',
      spend,
      impressions,
      clicks,
      ctr,
      cpm,
      roas,
      revenue: spend * roas, // Estimated revenue
      profit: (spend * roas) - spend,
      platform,
      accountId,
      raw: campaign,
    };
  });

  // Summary metrics
  const summary = {
    totalSpend: campaigns.reduce((sum, c) => sum + c.spend, 0),
    totalImpressions: campaigns.reduce((sum, c) => sum + c.impressions, 0),
    totalClicks: campaigns.reduce((sum, c) => sum + c.clicks, 0),
    avgCtr: campaigns.length > 0 
      ? campaigns.reduce((sum, c) => sum + c.ctr, 0) / campaigns.length 
      : 0,
    avgCpm: campaigns.length > 0
      ? campaigns.reduce((sum, c) => sum + c.cpm, 0) / campaigns.length
      : 0,
    avgRoas: campaigns.length > 0
      ? campaigns.reduce((sum, c) => sum + c.roas, 0) / campaigns.length
      : 0,
    totalRevenue: campaigns.reduce((sum, c) => sum + c.revenue, 0),
    totalProfit: campaigns.reduce((sum, c) => sum + c.profit, 0),
    campaignCount: campaigns.length,
  };

  return { campaigns, summary };
}

/**
 * Process ad-level insights with summary metrics.
 * @param {'facebook' | 'google'} platform
 * @param {string} accountId
 * @param {Array} rawData - Ad insights
 * @returns {Object} {ads, summary}
 */
function processAdData(platform, accountId, rawData) {
  if (!Array.isArray(rawData)) {
    return { ads: [], summary: {} };
  }

  const ads = rawData.map(ad => {
    const spend = parseFloat(ad.spend || 0);
    const impressions = parseInt(ad.impressions || 0, 10);
    const clicks = parseInt(ad.clicks || 0, 10);
    const ctr = parseFloat(ad.ctr || 0);
    const cpm = parseFloat(ad.cpm || 0);
    
    let roas = 0;
    if (ad.purchase_roas && Array.isArray(ad.purchase_roas) && ad.purchase_roas.length > 0) {
      roas = parseFloat(ad.purchase_roas[0].value || 0);
    } else if (typeof ad.roas === 'number') {
      roas = ad.roas;
    }

    return {
      name: ad.ad_name || ad.name || 'Unnamed Ad',
      campaign: ad.campaign_name || ad.campaign || 'Unknown Campaign',
      spend,
      impressions,
      clicks,
      ctr,
      cpm,
      roas,
      revenue: spend * roas,
      profit: (spend * roas) - spend,
      platform,
      accountId,
      raw: ad,
    };
  });

  const summary = {
    totalSpend: ads.reduce((sum, a) => sum + a.spend, 0),
    totalImpressions: ads.reduce((sum, a) => sum + a.impressions, 0),
    totalClicks: ads.reduce((sum, a) => sum + a.clicks, 0),
    avgCtr: ads.length > 0 ? ads.reduce((sum, a) => sum + a.ctr, 0) / ads.length : 0,
    avgCpm: ads.length > 0 ? ads.reduce((sum, a) => sum + a.cpm, 0) / ads.length : 0,
    avgRoas: ads.length > 0 ? ads.reduce((sum, a) => sum + a.roas, 0) / ads.length : 0,
    totalRevenue: ads.reduce((sum, a) => sum + a.revenue, 0),
    totalProfit: ads.reduce((sum, a) => sum + a.profit, 0),
    adCount: ads.length,
  };

  return { ads, summary };
}

// ============================================================================
// ANALYSIS UTILITIES
// ============================================================================

/**
 * Get top N performers sorted by a metric.
 * @param {Array} data - Processed campaigns or ads
 * @param {'roas' | 'profit' | 'revenue' | 'spend' | 'ctr'} sortBy
 * @param {number} [limit=10] - Max results
 * @returns {Array}
 */
function getTopPerformers(data, sortBy = 'roas', limit = 10) {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }

  const sorted = [...data].sort((a, b) => {
    const aVal = a[sortBy] || 0;
    const bVal = b[sortBy] || 0;
    return bVal - aVal; // Descending
  });

  return sorted.slice(0, limit);
}

/**
 * Compare two periods and calculate changes.
 * @param {Object} currentData - Current period processed data
 * @param {Object} previousData - Previous period processed data
 * @param {Array<string>} metrics - Metrics to compare (e.g., ['spend', 'revenue', 'roas'])
 * @returns {Object} {metric: {current, previous, change, changePercent}}
 */
function comparePeriods(currentData, previousData, metrics = ['spend', 'revenue', 'roas']) {
  const comparison = {};

  for (const metric of metrics) {
    const current = currentData.summary?.[metric] || currentData[metric] || 0;
    const previous = previousData.summary?.[metric] || previousData[metric] || 0;
    const change = current - previous;
    const changePercent = previous !== 0 ? ((change / previous) * 100).toFixed(1) : 0;

    comparison[metric] = {
      current,
      previous,
      change,
      changePercent: parseFloat(changePercent),
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
    };
  }

  return comparison;
}

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

/**
 * Format account list for display.
 * @param {Array} accounts - Processed accounts
 * @returns {string}
 */
function formatAccountList(accounts) {
  if (!accounts || accounts.length === 0) {
    return 'No accounts found.';
  }

  let output = `Found ${accounts.length} account(s):\n\n`;
  accounts.forEach((acc, idx) => {
    output += `${idx + 1}. ${acc.name} (${acc.platform.toUpperCase()})\n`;
    output += `   ID: ${acc.id}\n`;
    output += `   Currency: ${acc.currency} | Status: ${acc.status}\n\n`;
  });
  return output;
}

/**
 * Format campaign analysis report.
 * @param {Object} processedData - Result from processCampaignData
 * @param {number} [topN=5] - Show top N campaigns
 * @returns {string}
 */
function formatCampaignAnalysis(processedData, topN = 5) {
  const { campaigns, summary } = processedData;

  if (!campaigns || campaigns.length === 0) {
    return 'No campaign data available.';
  }

  let output = `📊 CAMPAIGN ANALYSIS\n`;
  output += `${'='.repeat(60)}\n\n`;

  // Summary
  output += `SUMMARY (${summary.campaignCount} campaigns)\n`;
  output += `  Total Spend: $${summary.totalSpend.toFixed(2)}\n`;
  output += `  Total Revenue: $${summary.totalRevenue.toFixed(2)}\n`;
  output += `  Total Profit: $${summary.totalProfit.toFixed(2)}\n`;
  output += `  Avg ROAS: ${summary.avgRoas.toFixed(2)}x\n`;
  output += `  Avg CTR: ${summary.avgCtr.toFixed(2)}%\n`;
  output += `  Avg CPM: $${summary.avgCpm.toFixed(2)}\n\n`;

  // Top performers
  const topCampaigns = getTopPerformers(campaigns, 'roas', topN);
  output += `TOP ${topN} CAMPAIGNS (by ROAS)\n`;
  output += `${'-'.repeat(60)}\n`;
  topCampaigns.forEach((c, idx) => {
    output += `${idx + 1}. ${c.name}\n`;
    output += `   Spend: $${c.spend.toFixed(2)} | Revenue: $${c.revenue.toFixed(2)} | ROAS: ${c.roas.toFixed(2)}x\n`;
    output += `   Impressions: ${c.impressions.toLocaleString()} | Clicks: ${c.clicks.toLocaleString()} | CTR: ${c.ctr.toFixed(2)}%\n\n`;
  });

  return output;
}

/**
 * Format ad-level analysis report.
 * @param {Object} processedData - Result from processAdData
 * @param {number} [topN=5] - Show top N ads
 * @returns {string}
 */
function formatAdAnalysis(processedData, topN = 5) {
  const { ads, summary } = processedData;

  if (!ads || ads.length === 0) {
    return 'No ad data available.';
  }

  let output = `🎯 AD ANALYSIS\n`;
  output += `${'='.repeat(60)}\n\n`;

  // Summary
  output += `SUMMARY (${summary.adCount} ads)\n`;
  output += `  Total Spend: $${summary.totalSpend.toFixed(2)}\n`;
  output += `  Total Revenue: $${summary.totalRevenue.toFixed(2)}\n`;
  output += `  Total Profit: $${summary.totalProfit.toFixed(2)}\n`;
  output += `  Avg ROAS: ${summary.avgRoas.toFixed(2)}x\n`;
  output += `  Avg CTR: ${summary.avgCtr.toFixed(2)}%\n`;
  output += `  Avg CPM: $${summary.avgCpm.toFixed(2)}\n\n`;

  // Top performers
  const topAds = getTopPerformers(ads, 'roas', topN);
  output += `TOP ${topN} ADS (by ROAS)\n`;
  output += `${'-'.repeat(60)}\n`;
  topAds.forEach((ad, idx) => {
    output += `${idx + 1}. ${ad.name}\n`;
    output += `   Campaign: ${ad.campaign}\n`;
    output += `   Spend: $${ad.spend.toFixed(2)} | Revenue: $${ad.revenue.toFixed(2)} | ROAS: ${ad.roas.toFixed(2)}x\n`;
    output += `   Impressions: ${ad.impressions.toLocaleString()} | Clicks: ${ad.clicks.toLocaleString()} | CTR: ${ad.ctr.toFixed(2)}%\n\n`;
  });

  return output;
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Processing
  processAccountData,
  processCampaignData,
  processAdData,
  
  // Analysis
  getTopPerformers,
  comparePeriods,
  
  // Formatting
  formatAccountList,
  formatCampaignAnalysis,
  formatAdAnalysis,
};
