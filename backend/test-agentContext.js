/**
 * Test suite for agentContext.js
 * Run: node test-agentContext.js
 */

const agentContext = require('./services/openclaw/agentContext');

async function runTests() {
  console.log('🧪 Testing agentContext.js\n');
  console.log('='.repeat(70));
  
  // Test 1: Build context for each role
  console.log('\n📋 TEST 1: Build Context for Each Role\n');
  
  const roles = ['strategist', 'executor', 'advertiser', 'analyzer'];
  
  for (const role of roles) {
    try {
      const context = await agentContext.buildContext('demo', role, {
        triggeredBy: 'test',
        campaign: 'Test Campaign'
      });
      
      console.log(`✅ ${role}:`);
      console.log(`   - Client: ${context.meta.clientName} (${context.meta.brandName})`);
      console.log(`   - Preferences: ROAS ${context.meta.preferences.targetROAS}+, CPA <$${context.meta.preferences.maxCPA}`);
      console.log(`   - Learnings: ${context.meta.learnings.length} insights`);
      console.log(`   - Recent issues: ${context.meta.recentIssues.length} tracked`);
      console.log(`   - Prompt length: ${context.systemPrompt.length} chars`);
      console.log(`   - Role in prompt: ${context.systemPrompt.includes(role.charAt(0).toUpperCase() + role.slice(1)) ? '✓' : '✗'}`);
    } catch (error) {
      console.log(`❌ ${role}: ${error.message}`);
    }
  }
  
  // Test 2: Card enrichment
  console.log('\n' + '='.repeat(70));
  console.log('\n📋 TEST 2: Card Enrichment\n');
  
  const context = await agentContext.buildContext('demo', 'analyzer');
  
  const testCards = [
    {
      title: 'Your ads are losing money',
      body: 'Campaign performance has declined significantly.',
      severity: 'high'
    },
    {
      title: 'High CPA detected',
      body: 'Cost per acquisition is above target.',
      severity: 'medium'
    }
  ];
  
  for (const card of testCards) {
    const enriched = agentContext.enrichCardWithContext(card, context);
    console.log(`Original: "${card.title}"`);
    console.log(`Enriched: "${enriched.title}"`);
    console.log(`\nBody before:\n${card.body}`);
    console.log(`\nBody after:\n${enriched.body}\n`);
    console.log('-'.repeat(70) + '\n');
  }
  
  // Test 3: Cause analysis
  console.log('='.repeat(70));
  console.log('\n📋 TEST 3: Root Cause Analysis\n');
  
  const testRules = [
    { metric: 'roas', condition: 'below 2.5', threshold: 2.5 },
    { metric: 'cpa', condition: 'above 50', threshold: 50 },
    { metric: 'spend', condition: 'exceeds 650', threshold: 650 },
  ];
  
  for (const rule of testRules) {
    const analysis = agentContext.generateCauseAnalysis(rule, context);
    console.log(`Rule: ${rule.metric} ${rule.condition}`);
    console.log(`Analysis:\n${analysis}\n`);
    console.log('-'.repeat(70) + '\n');
  }
  
  // Test 4: Agent attribution
  console.log('='.repeat(70));
  console.log('\n📋 TEST 4: Agent Attribution (Frontend Display)\n');
  
  const allRoles = ['strategist', 'executor', 'advertiser', 'analyzer', 'unknown'];
  
  console.log('Role          | Icon | Label       | Color');
  console.log('-'.repeat(50));
  
  for (const role of allRoles) {
    const attr = agentContext.getAgentAttribution(role);
    console.log(`${role.padEnd(13)} | ${attr.icon}   | ${attr.label.padEnd(11)} | ${attr.color}`);
  }
  
  // Test 5: Verify all exports
  console.log('\n' + '='.repeat(70));
  console.log('\n📋 TEST 5: Module Exports Verification\n');
  
  const exports = Object.keys(agentContext);
  const expectedExports = [
    'ROLE_PROMPTS',
    'buildContext',
    'enrichCardWithContext',
    'generateCauseAnalysis',
    'getAgentAttribution'
  ];
  
  console.log('Expected exports:', expectedExports.length);
  console.log('Actual exports:', exports.length);
  
  for (const exp of expectedExports) {
    const exists = exports.includes(exp);
    console.log(`  ${exists ? '✅' : '❌'} ${exp}`);
  }
  
  // Test 6: Role prompts
  console.log('\n' + '='.repeat(70));
  console.log('\n📋 TEST 6: Role Prompts Preview\n');
  
  for (const [role, prompt] of Object.entries(agentContext.ROLE_PROMPTS)) {
    console.log(`${role.toUpperCase()}:`);
    console.log(prompt.substring(0, 150) + '...\n');
  }
  
  console.log('='.repeat(70));
  console.log('\n✅ All tests completed!\n');
}

runTests().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});
