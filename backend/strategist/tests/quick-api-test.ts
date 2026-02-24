#!/usr/bin/env tsx

/**
 * Quick test script for SimilarWeb API
 * Run: npx tsx tests/quick-api-test.ts
 */

import { fetchTrafficData } from '../src/services/growth-audit-agent';

// Load from environment
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '';
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'similarweb-traffic-api-for-bulk.p.rapidapi.com';

if (!RAPIDAPI_KEY) {
  console.error('RAPIDAPI_KEY not set in environment');
  console.log('   Run: source <(grep -v "^#" .dev.vars | sed "s/^/export /")');
  process.exit(1);
}

console.log('╔════════════════════════════════════════════════════════╗');
console.log('║  SimilarWeb API Quick Test                            ║');
console.log('╚════════════════════════════════════════════════════════╝');
console.log('');
console.log(`API Key: ${RAPIDAPI_KEY.substring(0, 10)}...`);
console.log(`API Host: ${RAPIDAPI_HOST}`);
console.log('');

async function testDomain(domain: string) {
  console.log(`Testing: ${domain}`);
  console.log('─'.repeat(60));

  try {
    const start = Date.now();
    const result = await fetchTrafficData(domain, RAPIDAPI_KEY, RAPIDAPI_HOST);
    const duration = Date.now() - start;

    console.log(`Success (${duration}ms)`);
    console.log(`   Domain: ${result.domain}`);
    console.log(`   Visits: ${result.visits.toLocaleString()}`);
    console.log(`   Page Views: ${result.pageViews.toLocaleString()}`);
    console.log(`   Bounce Rate: ${(result.bounceRate * 100).toFixed(2)}%`);
    console.log(`   Avg Duration: ${result.avgDuration.toFixed(0)}s`);

    if (result.topCountries.length > 0) {
      console.log(`   Top Countries:`);
      result.topCountries.slice(0, 3).forEach(c => {
        console.log(`      - ${c.country}: ${(c.share * 100).toFixed(1)}%`);
      });
    }

    console.log(`   Traffic Sources:`);
    console.log(`      - Direct: ${(result.trafficSources.direct * 100).toFixed(1)}%`);
    console.log(`      - Search: ${(result.trafficSources.search * 100).toFixed(1)}%`);
    console.log(`      - Social: ${(result.trafficSources.social * 100).toFixed(1)}%`);
    console.log(`      - Referral: ${(result.trafficSources.referral * 100).toFixed(1)}%`);

    return true;
  } catch (error: any) {
    console.log(`Failed: ${error.message}`);
    return false;
  }
}

async function main() {
  // Test a few domains
  const domains = ['google.com', 'facebook.com'];

  for (let i = 0; i < domains.length; i++) {
    const success = await testDomain(domains[i]);
    console.log('');

    // Wait 3 seconds between requests to avoid rate limit
    if (i < domains.length - 1) {
      console.log('⏱️  Waiting 3 seconds before next test...');
      console.log('');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  Test Complete                                         ║');
  console.log('╚════════════════════════════════════════════════════════╝');
}

main().catch(error => {
  console.error('\n💥 Test crashed:', error);
  process.exit(1);
});