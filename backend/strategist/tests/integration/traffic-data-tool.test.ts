/**
 * Integration Tests for SimilarWeb Traffic Data Tool
 * Tests the AI tool calling functionality for fetching competitor traffic data
 */

import { fetchTrafficData } from '../../src/services/growth-audit-agent';
import { callClaudeJsonWithTools, type ClaudeTool } from '../../src/services/ai/claude-client';
import { AI_MODELS } from '../../src/config';

// Load environment variables from .dev.vars
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '';
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'similarweb-traffic-api-for-bulk.p.rapidapi.com';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

/**
 * Test: Direct API call to fetchTrafficData
 */
async function testDirectAPICall() {
  console.log('\n=== Test 1: Direct SimilarWeb API Call ===');

  const testDomain = 'google.com';
  console.log(`Testing domain: ${testDomain}`);

  try {
    const result = await fetchTrafficData(testDomain, RAPIDAPI_KEY, RAPIDAPI_HOST);
    console.log('SUCCESS - Traffic data fetched:');
    console.log(`   Domain: ${result.domain}`);
    console.log(`   Visits: ${result.visits.toLocaleString()}`);
    console.log(`   Page Views: ${result.pageViews.toLocaleString()}`);
    console.log(`   Bounce Rate: ${(result.bounceRate * 100).toFixed(2)}%`);
    console.log(`   Avg Duration: ${result.avgDuration.toFixed(0)}s`);
    console.log(`   Top Countries:`, result.topCountries.slice(0, 3));
    return true;
  } catch (error: any) {
    console.log('FAILED:', error.message);
    return false;
  }
}

/**
 * Test: Claude tool calling with traffic data tool
 */
async function testClaudeToolCall() {
  console.log('\n=== Test 2: Claude AI with Traffic Data Tool ===');

  const prompt = `Find 3 competitors for Google in the search engine market.
For each competitor, use the fetch_traffic_data tool to get their actual monthly traffic.

Return JSON format:
{
  "competitors": [
    {
      "name": "Competitor Name",
      "website": "competitor.com",
      "monthlyTraffic": "formatted traffic from tool (e.g., 2.5M or Unavailable)"
    }
  ]
}`;

  // Define the tool
  const tools: ClaudeTool[] = [
    {
      name: 'fetch_traffic_data',
      description: 'Fetches actual monthly traffic data from SimilarWeb API for a competitor website. Returns the actual traffic number or null if unavailable.',
      input_schema: {
        type: 'object',
        properties: {
          website: {
            type: 'string',
            description: 'The competitor website domain (e.g., "competitor.com")',
          },
        },
        required: ['website'],
      },
    },
  ];

  // Track tool calls
  let toolCallCount = 0;
  let lastRequestTime = 0;

  // Tool executor
  const toolExecutor = async (toolName: string, toolInput: any) => {
    console.log(`\n🔧 Tool Called #${++toolCallCount}: ${toolName}`, toolInput);

    if (toolName === 'fetch_traffic_data') {
      const domain = toolInput.website;

      // Add delay to avoid rate limiting
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequestTime;
      const requiredDelay = 2000;
      if (lastRequestTime > 0 && timeSinceLastRequest < requiredDelay) {
        const delayMs = requiredDelay - timeSinceLastRequest;
        console.log(`   ⏱️ Waiting ${delayMs}ms to avoid rate limit...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
      lastRequestTime = Date.now();

      try {
        const trafficData = await fetchTrafficData(domain, RAPIDAPI_KEY, RAPIDAPI_HOST);

        if (trafficData.visits > 0) {
          console.log(`   Traffic fetched: ${trafficData.visits.toLocaleString()} visits`);
          return { visits: trafficData.visits };
        } else {
          console.log(`   ⚠️ No data available`);
          return { visits: null };
        }
      } catch (error: any) {
        console.log(`   Failed: ${error.message}`);
        return { visits: null };
      }
    }
    return null;
  };

  try {
    console.log('Calling Claude with traffic data tool...');
    const result = await callClaudeJsonWithTools<{ competitors: any[] }>(
      prompt,
      ANTHROPIC_API_KEY,
      {
        model: AI_MODELS.claude.opus45,
        maxTokens: 2000,
        temperature: 0.7,
        tools,
      },
      toolExecutor
    );

    console.log('\nSUCCESS - Claude returned:');
    console.log(`   Found ${result.competitors.length} competitors`);
    result.competitors.forEach((comp, i) => {
      console.log(`   ${i + 1}. ${comp.name} (${comp.website}): ${comp.monthlyTraffic}`);
    });
    console.log(`\n   Total tool calls made: ${toolCallCount}`);
    return true;
  } catch (error: any) {
    console.log('FAILED:', error.message);
    return false;
  }
}

/**
 * Test: Rate limit handling
 */
async function testRateLimitHandling() {
  console.log('\n=== Test 3: Rate Limit Handling ===');

  const testDomains = ['example.com', 'test.com', 'demo.com'];
  console.log(`Testing ${testDomains.length} domains rapidly to trigger rate limit...`);

  let successCount = 0;
  let rateLimitCount = 0;
  let forbiddenCount = 0;

  for (const domain of testDomains) {
    try {
      console.log(`\nFetching: ${domain}`);
      const result = await fetchTrafficData(domain, RAPIDAPI_KEY, RAPIDAPI_HOST);
      console.log(`   Success: ${result.visits.toLocaleString()} visits`);
      successCount++;
    } catch (error: any) {
      if (error.message.includes('Too Many Requests')) {
        console.log(`   ⏱️ Rate limited (expected behavior)`);
        rateLimitCount++;
      } else if (error.message.includes('Forbidden')) {
        console.log(`   🚫 Forbidden (after rate limit exhaustion)`);
        forbiddenCount++;
      } else {
        console.log(`   Error: ${error.message}`);
      }
    }
  }

  console.log('\nResults:');
  console.log(`   Successful: ${successCount}`);
  console.log(`   Rate Limited: ${rateLimitCount}`);
  console.log(`   Forbidden: ${forbiddenCount}`);

  return true;
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  SimilarWeb Traffic Data Tool - Integration Tests     ║');
  console.log('╚════════════════════════════════════════════════════════╝');

  // Check environment variables
  if (!RAPIDAPI_KEY) {
    console.log('\nRAPIDAPI_KEY not found in environment');
    console.log('   Set it in .dev.vars file');
    process.exit(1);
  }

  if (!ANTHROPIC_API_KEY) {
    console.log('\nANTHROPIC_API_KEY not found in environment');
    console.log('   Set it in .dev.vars file');
    process.exit(1);
  }

  console.log('\nEnvironment variables loaded');
  console.log(`   RapidAPI Key: ${RAPIDAPI_KEY.substring(0, 10)}...`);
  console.log(`   Anthropic Key: ${ANTHROPIC_API_KEY.substring(0, 15)}...`);

  const results = [];

  // Run tests
  results.push(await testDirectAPICall());
  await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3s between tests

  results.push(await testClaudeToolCall());
  await new Promise(resolve => setTimeout(resolve, 3000));

  results.push(await testRateLimitHandling());

  // Summary
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║  Test Summary                                          ║');
  console.log('╚════════════════════════════════════════════════════════╝');

  const passed = results.filter(r => r).length;
  const failed = results.filter(r => !r).length;

  console.log(`\n   Passed: ${passed}/${results.length}`);
  console.log(`   Failed: ${failed}/${results.length}`);

  if (failed === 0) {
    console.log('\nAll tests passed!\n');
    process.exit(0);
  } else {
    console.log('\nSome tests failed\n');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('\n💥 Test runner crashed:', error);
  process.exit(1);
});