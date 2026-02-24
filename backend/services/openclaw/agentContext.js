/**
 * agentContext.js — Multi-Agent Context Builder
 * 
 * Each module (Strategist, Executor, Advertiser, Analyzer) gets a tailored
 * context window. Shared base (SOUL + USER + MEMORY) + role-specific instructions.
 * 
 * Functions:
 * - buildContext(clientId, role, taskContext) — Build full context for an agent role
 * - enrichCardWithContext(card, context) — Add client-specific details to action cards
 * - generateCauseAnalysis(rule, context) — Root cause analysis from memory/logs
 * - getAgentAttribution(role) — Frontend display metadata for agent modules
 */

const memoryService = require('./memoryService');
const openclawConfig = require('../../config/openclawConfig');

// ============================================================================
// ROLE PROMPTS — What each agent module does
// ============================================================================

const ROLE_PROMPTS = {
  strategist: `You are the Strategist module of Auxora. Your job is to research the client's market, analyze competitors, conduct customer interviews, and generate a comprehensive GTM (Go-To-Market) report.

You think like a senior growth strategist at a top agency, but you communicate in plain language. Focus on actionable insights, not jargon.`,

  executor: `You are the Executor module of Auxora. Your job is to set up the client's growth infrastructure: Shopify store optimization, landing page creation, ad creative generation, domain setup, and campaign configuration.

You are precise, methodical, and always explain what you're doing and why.`,

  advertiser: `You are the Advertiser module of Auxora. Your job is to manage ad campaigns across Meta and Google. You handle campaign creation, budget allocation, audience targeting, bid strategy, and creative rotation.

You optimize for the client's ROAS and CPA targets. You explain every decision in plain English.`,

  analyzer: `You are the Analyzer/OpenClaw module of Auxora. Your job is to monitor campaign performance, detect issues (budget overspend, low ROAS, high CPA, ad fatigue), generate action cards for the user, and auto-execute safety measures when needed.

You are the client's 24/7 guardian. When generating alerts, be clear, specific, and actionable. No jargon — the user is a D2C brand owner, not a marketer.`,
};

// ============================================================================
// MAIN CONTEXT BUILDER
// ============================================================================

/**
 * Build context for a specific agent role + task
 * @param {string} clientId - Client identifier
 * @param {string} role - Agent role (strategist, executor, advertiser, analyzer)
 * @param {object} taskContext - Specific task data (metrics, events, etc.)
 * @returns {Promise<object>} Full context object with systemPrompt, meta, etc.
 */
async function buildContext(clientId, role, taskContext = {}) {
  // Get raw context components for extraction
  const soul = await memoryService.readSoul();
  const { user, memory, dailyLogs } = await memoryService.readUserContext(clientId);
  const rolePrompt = ROLE_PROMPTS[role] || ROLE_PROMPTS.analyzer;
  
  // Format daily logs for display (last 3 days only)
  const recentLogs = dailyLogs
    .slice(0, 3)
    .map(log => `### ${log.date}\n${log.content}`)
    .join('\n---\n');
  
  // Build the full context object
  return {
    systemPrompt: [
      soul || '',
      '---',
      `## Your Role: ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      rolePrompt,
      '---',
      '## Client Context',
      user || '(No client profile yet)',
      '---',
      '## Client History & Learnings',
      memory || '(No accumulated learnings yet)',
      '---',
      '## Recent Activity (Last 3 Days)',
      recentLogs || '(No recent activity)',
    ].join('\n'),
    
    taskContext: taskContext, // Specific to this invocation
    clientId,
    role,
    
    // Metadata for card generation (using raw markdown for extraction)
    meta: {
      clientName: extractClientName(user),
      brandName: extractBrandName(user),
      preferences: extractPreferences(user),
      recentIssues: extractRecentIssues(memory),
      learnings: extractLearnings(memory),
    }
  };
}

// ============================================================================
// EXTRACTION HELPERS — Parse markdown context into structured data
// ============================================================================

/**
 * Extract client contact name from USER.md
 */
function extractClientName(userMd) {
  if (!userMd) return 'Client';
  
  const match = userMd.match(/\*\*Client Contact:\*\*\s*([^\n]+)/i);
  return match ? match[1].trim() : 'Client';
}

/**
 * Extract brand name from USER.md
 */
function extractBrandName(userMd) {
  if (!userMd) return 'Your Brand';
  
  const match = userMd.match(/\*\*Brand Name:\*\*\s*([^\n]+)/i);
  return match ? match[1].trim() : 'Your Brand';
}

/**
 * Extract client preferences (communication, risk tolerance, etc.)
 */
function extractPreferences(userMd) {
  if (!userMd) return {};
  
  const prefs = {};
  
  // Extract target ROAS
  const roasMatch = userMd.match(/Target ROAS:\s*([0-9.]+)/i);
  if (roasMatch) prefs.targetROAS = parseFloat(roasMatch[1]);
  
  // Extract max CPA
  const cpaMatch = userMd.match(/Max CPA:\s*\$?([0-9.]+)/i);
  if (cpaMatch) prefs.maxCPA = parseFloat(cpaMatch[1]);
  
  // Extract communication preference
  const commMatch = userMd.match(/\*\*Communication Preference:\*\*\s*([^\n]+)/i);
  if (commMatch) prefs.communication = commMatch[1].trim();
  
  // Extract budget
  const budgetMatch = userMd.match(/Budget:\s*\$?([0-9,]+)/i);
  if (budgetMatch) prefs.monthlyBudget = parseInt(budgetMatch[1].replace(/,/g, ''));
  
  return prefs;
}

/**
 * Extract recent issues from MEMORY.md (last 3 mentioned problems)
 */
function extractRecentIssues(memoryMd) {
  if (!memoryMd) return [];
  
  const issues = [];
  
  // Look for "What's Not Working" section
  const notWorkingMatch = memoryMd.match(/### What's Not Working\n([\s\S]*?)(?=\n###|\n##|$)/);
  if (notWorkingMatch) {
    const bullets = notWorkingMatch[1].match(/^- (.+)$/gm);
    if (bullets) {
      issues.push(...bullets.slice(0, 3).map(b => b.replace(/^- /, '').trim()));
    }
  }
  
  // Also check for recent paused campaigns
  const pausedMatches = memoryMd.matchAll(/\*\*([^*]+)\*\*.*?paused/gi);
  for (const match of pausedMatches) {
    if (issues.length < 3) {
      issues.push(`${match[1]} was paused`);
    }
  }
  
  return issues.slice(0, 3);
}

/**
 * Extract key learnings from MEMORY.md
 */
function extractLearnings(memoryMd) {
  if (!memoryMd) return [];
  
  const learnings = [];
  
  // Find all "Learning:" entries
  const learningMatches = memoryMd.matchAll(/\*\*Learning:\*\*\s*([^\n]+)/gi);
  for (const match of learningMatches) {
    learnings.push(match[1].trim());
  }
  
  // If no explicit learnings, extract from "High Performers" section
  if (learnings.length === 0) {
    const highPerfMatch = memoryMd.match(/### High Performers\n([\s\S]*?)(?=\n###|\n##|$)/);
    if (highPerfMatch) {
      const bullets = highPerfMatch[1].match(/^- \*\*([^*]+)\*\*.*?([0-9.]+\s*ROAS)/gim);
      if (bullets) {
        learnings.push(...bullets.slice(0, 3).map(b => {
          const nameMatch = b.match(/\*\*([^*]+)\*\*/);
          const roasMatch = b.match(/([0-9.]+\s*ROAS)/);
          return `${nameMatch?.[1]} performing at ${roasMatch?.[1]}`;
        }));
      }
    }
  }
  
  return learnings.slice(0, 5);
}

// ============================================================================
// CARD ENRICHMENT — Add context to action cards
// ============================================================================

/**
 * Enrich an action card with client-specific context from memory
 * Transforms generic alerts into specific, contextualized messages
 * 
 * @param {object} card - Action card with title, body, severity, etc.
 * @param {object} context - Context object from buildContext()
 * @returns {object} Enriched card
 */
function enrichCardWithContext(card, context) {
  if (!card || !context) return card;
  
  const enriched = { ...card };
  const { brandName } = context.meta;
  
  // Enrich title with brand name if not already present
  if (enriched.title && !enriched.title.includes(brandName)) {
    enriched.title = enriched.title.replace(/Your (campaign|ads?|budget)/, `Your ${brandName} $1`);
  }
  
  // Add context clues from recent memory
  if (enriched.body && context.meta.recentIssues.length > 0) {
    // Check if card is about a known issue
    const relatedIssue = context.meta.recentIssues.find(issue => {
      const issueKeywords = issue.toLowerCase().split(' ');
      const bodyLower = enriched.body.toLowerCase();
      return issueKeywords.some(kw => bodyLower.includes(kw));
    });
    
    if (relatedIssue) {
      enriched.body += `\n\n💡 **Context:** This may be related to: ${relatedIssue}`;
    }
  }
  
  // Add learning context if relevant
  if (enriched.body && context.meta.learnings.length > 0) {
    const bodyLower = enriched.body.toLowerCase();
    const relevantLearning = context.meta.learnings.find(learning => {
      const learningKeywords = learning.toLowerCase().split(' ').slice(0, 3);
      return learningKeywords.some(kw => kw.length > 3 && bodyLower.includes(kw));
    });
    
    if (relevantLearning) {
      enriched.body += `\n\n📚 **Past Learning:** ${relevantLearning}`;
    }
  }
  
  return enriched;
}

// ============================================================================
// CAUSE ANALYSIS — Why did this issue occur?
// ============================================================================

/**
 * Generate root cause analysis from recent logs and memory
 * @param {object} rule - The rule that triggered (with condition details)
 * @param {object} context - Context object from buildContext()
 * @returns {string} Human-readable cause analysis
 */
function generateCauseAnalysis(rule, context) {
  if (!rule || !context) return 'Cause unknown — insufficient data.';
  
  const { memory, user } = context.meta;
  const analysis = [];
  
  // Check daily logs for recent changes
  if (context.taskContext?.dailyLogs) {
    const recentChanges = context.taskContext.dailyLogs
      .filter(log => /adjust|change|pause|launch|scale/i.test(log))
      .slice(-3);
    
    if (recentChanges.length > 0) {
      analysis.push(`**Recent Changes:** ${recentChanges.join('; ')}`);
    }
  }
  
  // Map rule types to likely causes from memory
  if (rule.metric === 'roas' && rule.condition?.includes('below')) {
    const poorPerformers = context.meta.recentIssues.filter(i => 
      /low|poor|bad|underperform/i.test(i)
    );
    
    if (poorPerformers.length > 0) {
      analysis.push(`**Likely Cause:** ${poorPerformers[0]}`);
    } else {
      analysis.push('**Likely Cause:** Audience fatigue, creative saturation, or increased competition.');
    }
  }
  
  if (rule.metric === 'cpa' && rule.condition?.includes('above')) {
    analysis.push('**Likely Cause:** Higher CPCs, lower conversion rate, or targeting too broad.');
    
    // Check if broad match was mentioned
    if (context.meta.recentIssues.some(i => /broad/i.test(i))) {
      analysis.push('Note: Broad match keywords have historically driven up CPA for this client.');
    }
  }
  
  if (rule.metric === 'spend' && rule.condition?.includes('exceeds')) {
    analysis.push('**Likely Cause:** Campaign pacing too aggressive or manual bid adjustments.');
  }
  
  // Add what's working context
  if (context.meta.learnings.length > 0) {
    const topPerformer = context.meta.learnings[0];
    analysis.push(`**What's Still Working:** ${topPerformer}`);
  }
  
  return analysis.length > 0 
    ? analysis.join('\n\n') 
    : 'Cause analysis pending — monitoring for patterns.';
}

// ============================================================================
// AGENT ATTRIBUTION — Frontend display metadata
// ============================================================================

/**
 * Get display metadata for an agent role (for frontend card attribution)
 * @param {string} role - Agent role identifier
 * @returns {object} { role, icon, label, color }
 */
function getAgentAttribution(role) {
  const attributions = {
    strategist: {
      role: 'strategist',
      icon: '🎯',
      label: 'Strategist',
      color: '#3B82F6', // Blue
    },
    executor: {
      role: 'executor',
      icon: '⚙️',
      label: 'Executor',
      color: '#8B5CF6', // Purple
    },
    advertiser: {
      role: 'advertiser',
      icon: '📢',
      label: 'Advertiser',
      color: '#10B981', // Green
    },
    analyzer: {
      role: 'analyzer',
      icon: '🔍',
      label: 'Analyzer',
      color: '#F59E0B', // Amber
    },
  };
  
  return attributions[role] || {
    role: 'unknown',
    icon: '🤖',
    label: 'Agent',
    color: '#6B7280', // Gray
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  ROLE_PROMPTS,
  buildContext,
  enrichCardWithContext,
  generateCauseAnalysis,
  getAgentAttribution,
};
