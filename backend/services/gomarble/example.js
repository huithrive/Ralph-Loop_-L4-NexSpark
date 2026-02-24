#!/usr/bin/env node
/**
 * example.js — GoMarble Client Usage Examples
 * 
 * Run: node example.js
 * 
 * Demonstrates:
 * - Account listing
 * - Campaign insights fetching
 * - Data processing and analysis
 * - Formatted reporting
 */

const { getClient } = require('./index');
const { 
  processAccountData,
  processCampaignData, 
  getTopPerformers,
  comparePeriods,
  formatAccountList,
  formatCampaignAnalysis 
} = require('./advertisingService');

// ============================================================================
// EXAMPLE 1: List Accounts
// ============================================================================

async function listAccounts() {
  console.log('\n' + '='.repeat(70));
  console.log('EXAMPLE 1: List Facebook Ad Accounts');
  console.log('='.repeat(70) + '\n');
  
  const client = getClient();
  const response = await client.listFacebookAccounts();
  
  if (response._mock) {
    console.log('⚠️  Running in MOCK mode (no API key configured)\n');
  }
  
  const accounts = processAccountData('facebook', response.data);
  console.log(formatAccountList(accounts));
}

// ============================================================================
// EXAMPLE 2: Fetch Campaign Insights
// ============================================================================

async function fetchCampaignInsights() {
  console.log('\n' + '='.repeat(70));
  console.log('EXAMPLE 2: Fetch Campaign Insights (Last 7 Days)');
  console.log('='.repeat(70) + '\n');
  
  const client = getClient();
  
  // Get first account
  const accountsRes = await client.listFacebookAccounts();
  const accounts = processAccountData('facebook', accountsRes.data);
  const accountId = accounts[0].id;
  
  console.log(`Fetching insights for account: ${accounts[0].name} (${accountId})...\n`);
  
  // Fetch insights
  const insightsRes = await client.getFacebookInsights(accountId, {
    level: 'campaign',
    date_preset: 'last_7d',
    fields: 'campaign_name,spend,impressions,clicks,ctr,cpm,purchase_roas',
    limit: 50,
  });
  
  if (insightsRes._mock) {
    console.log('⚠️  Using MOCK data (API unavailable)\n');
  }
  
  // Process data
  const processed = processCampaignData('facebook', accountId, insightsRes.data);
  
  // Display formatted report
  console.log(formatCampaignAnalysis(processed, 5));
}

// ============================================================================
// EXAMPLE 3: Top Performers Analysis
// ============================================================================

async function analyzeTopPerformers() {
  console.log('\n' + '='.repeat(70));
  console.log('EXAMPLE 3: Top Performers by Different Metrics');
  console.log('='.repeat(70) + '\n');
  
  const client = getClient();
  
  // Get data
  const accountsRes = await client.listFacebookAccounts();
  const accountId = processAccountData('facebook', accountsRes.data)[0].id;
  
  const insightsRes = await client.getFacebookInsights(accountId);
  const { campaigns } = processCampaignData('facebook', accountId, insightsRes.data);
  
  // Top by ROAS
  const topByRoas = getTopPerformers(campaigns, 'roas', 3);
  console.log('TOP 3 BY ROAS:');
  topByRoas.forEach((c, i) => {
    console.log(`  ${i + 1}. ${c.name} — ${c.roas.toFixed(2)}x ROAS`);
  });
  
  // Top by revenue
  const topByRevenue = getTopPerformers(campaigns, 'revenue', 3);
  console.log('\nTOP 3 BY REVENUE:');
  topByRevenue.forEach((c, i) => {
    console.log(`  ${i + 1}. ${c.name} — $${c.revenue.toFixed(2)}`);
  });
  
  // Top by CTR
  const topByCtr = getTopPerformers(campaigns, 'ctr', 3);
  console.log('\nTOP 3 BY CTR:');
  topByCtr.forEach((c, i) => {
    console.log(`  ${i + 1}. ${c.name} — ${c.ctr.toFixed(2)}%`);
  });
}

// ============================================================================
// EXAMPLE 4: Period Comparison (Simulated)
// ============================================================================

async function comparePeriodPerformance() {
  console.log('\n' + '='.repeat(70));
  console.log('EXAMPLE 4: Period Comparison (Current vs Previous Week)');
  console.log('='.repeat(70) + '\n');
  
  const client = getClient();
  
  // Get data for "current" week
  const accountsRes = await client.listFacebookAccounts();
  const accountId = processAccountData('facebook', accountsRes.data)[0].id;
  
  const currentRes = await client.getFacebookInsights(accountId, { date_preset: 'last_7d' });
  const current = processCampaignData('facebook', accountId, currentRes.data);
  
  // Simulate "previous" week data (in real usage, fetch with different date range)
  const previous = {
    summary: {
      totalSpend: current.summary.totalSpend * 0.85,
      totalRevenue: current.summary.totalRevenue * 0.80,
      avgRoas: current.summary.avgRoas * 0.90,
    }
  };
  
  // Compare
  const comparison = comparePeriods(current, previous, ['totalSpend', 'totalRevenue', 'avgRoas']);
  
  console.log('WEEK-OVER-WEEK CHANGES:\n');
  
  for (const [metric, stats] of Object.entries(comparison)) {
    const arrow = stats.trend === 'up' ? '↑' : stats.trend === 'down' ? '↓' : '→';
    console.log(`${metric.toUpperCase()}:`);
    console.log(`  Current: ${stats.current.toFixed(2)}`);
    console.log(`  Previous: ${stats.previous.toFixed(2)}`);
    console.log(`  Change: ${arrow} ${stats.changePercent > 0 ? '+' : ''}${stats.changePercent}%\n`);
  }
}

// ============================================================================
// EXAMPLE 5: Full Analyzer Integration
// ============================================================================

async function demonstrateAnalyzerIntegration() {
  console.log('\n' + '='.repeat(70));
  console.log('EXAMPLE 5: Analyzer Module Integration');
  console.log('='.repeat(70) + '\n');
  
  // This simulates what analyzerModule.fetchLiveMetrics() does
  const client = getClient();
  
  console.log('Step 1: Fetching Facebook accounts...');
  const accountsRes = await client.listFacebookAccounts();
  const accounts = processAccountData('facebook', accountsRes.data);
  const primaryAccount = accounts[0];
  console.log(`✓ Using account: ${primaryAccount.name}\n`);
  
  console.log('Step 2: Fetching campaign insights (last 7 days)...');
  const insightsRes = await client.getFacebookInsights(primaryAccount.id, {
    level: 'campaign',
    date_preset: 'last_7d',
  });
  const { campaigns, summary } = processCampaignData('facebook', primaryAccount.id, insightsRes.data);
  console.log(`✓ Retrieved ${campaigns.length} campaigns\n`);
  
  console.log('Step 3: Structuring metrics for optimizer...');
  const metrics = {
    clientId: 'demo-client',
    platform: 'facebook',
    accountId: primaryAccount.id,
    accountName: primaryAccount.name,
    period: 'last_7d',
    fetchedAt: new Date().toISOString(),
    _mock: insightsRes._mock,
    
    // Summary
    totalSpend: summary.totalSpend,
    totalRevenue: summary.totalRevenue,
    avgRoas: summary.avgRoas,
    
    // Top performers
    topCampaigns: getTopPerformers(campaigns, 'roas', 3),
  };
  
  console.log('✓ Metrics structured for optimizer\n');
  console.log('METRICS SUMMARY:');
  console.log(`  Total Spend: $${metrics.totalSpend.toFixed(2)}`);
  console.log(`  Total Revenue: $${metrics.totalRevenue.toFixed(2)}`);
  console.log(`  Avg ROAS: ${metrics.avgRoas.toFixed(2)}x`);
  console.log(`  Mock Mode: ${metrics._mock ? 'Yes' : 'No'}`);
  console.log(`\nTop 3 Campaigns:`);
  metrics.topCampaigns.forEach((c, i) => {
    console.log(`  ${i + 1}. ${c.name} — ${c.roas.toFixed(2)}x ROAS, $${c.revenue.toFixed(2)} revenue`);
  });
}

// ============================================================================
// RUN ALL EXAMPLES
// ============================================================================

async function main() {
  console.log('\n🚀 GoMarble Client Examples\n');
  
  try {
    await listAccounts();
    await fetchCampaignInsights();
    await analyzeTopPerformers();
    await comparePeriodPerformance();
    await demonstrateAnalyzerIntegration();
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ All examples completed successfully!');
    console.log('='.repeat(70) + '\n');
    
  } catch (error) {
    console.error('\n❌ Error running examples:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { main };
