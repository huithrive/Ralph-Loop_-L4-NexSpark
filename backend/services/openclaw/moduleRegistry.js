/**
 * moduleRegistry.js — Pluggable Module System
 * 
 * Each domain capability (Strategist, Executor, Advertiser, Analyzer)
 * registers as a module with chat handling, heartbeat evaluation,
 * and effect handlers. The registry provides lookup by name or stage.
 * 
 * Inspired by NexSpark's AgentModule + Registry pattern.
 */

const logger = require('../../utils/logger');

// ============================================================================
// MODULE INTERFACE
// ============================================================================

/**
 * @typedef {Object} AuxoraModule
 * @property {string} name - Unique module identifier
 * @property {string} description - What this module does (for LLM routing)
 * @property {string[]} routingExamples - Example user messages this handles
 * @property {string[]} stages - Chat stages this module owns
 * @property {string} icon - Emoji icon
 * @property {string} label - Human-readable label
 * @property {string} color - Hex color for UI
 * 
 * @property {Function} [handleMessage] - async (session, userText, context) => Effect[]
 * @property {Function} [evaluateMetrics] - async (clientId, metrics) => rules[]
 * @property {Function} [generateCards] - async (clientId, rules, context) => cards[]
 * @property {Object} [effectHandlers] - { EffectType: async (effect, context) => EffectResult }
 * @property {Function} [getGreeting] - async (session) => Effect[] (for initial greeting)
 * @property {Function} [onStageEnter] - async (session, fromStage) => Effect[] (stage transition hook)
 */

// ============================================================================
// REGISTRY
// ============================================================================

const modules = new Map();
const stageIndex = new Map(); // stage -> module name

/**
 * Register a module
 * @param {AuxoraModule} mod
 */
function register(mod) {
  if (!mod.name) throw new Error('Module must have a name');
  if (modules.has(mod.name)) {
    throw new Error(`Module '${mod.name}' already registered`);
  }
  
  // Validate required fields
  if (!mod.stages || !Array.isArray(mod.stages)) {
    throw new Error(`Module '${mod.name}' must declare stages array`);
  }
  
  // Index stages
  for (const stage of mod.stages) {
    if (stageIndex.has(stage)) {
      throw new Error(
        `Stage '${stage}' already owned by module '${stageIndex.get(stage)}', ` +
        `cannot register for module '${mod.name}'`
      );
    }
    stageIndex.set(stage, mod.name);
  }
  
  // Register effect handlers with pipeline
  if (mod.effectHandlers) {
    const { pipeline } = require('./effectSystem');
    for (const [effectType, handler] of Object.entries(mod.effectHandlers)) {
      try {
        pipeline.registerHandler(effectType, handler);
      } catch (err) {
        logger.warn(`[moduleRegistry] Could not register effect handler for ${effectType}: ${err.message}`);
      }
    }
  }
  
  modules.set(mod.name, mod);
  logger.info(`[moduleRegistry] Registered module: ${mod.name} (stages: ${mod.stages.join(', ')})`);
}

/**
 * Get module by name
 * @param {string} name
 * @returns {AuxoraModule|null}
 */
function getModule(name) {
  return modules.get(name) || null;
}

/**
 * Get module that owns a chat stage
 * @param {string} stage
 * @returns {AuxoraModule|null}
 */
function getModuleForStage(stage) {
  const moduleName = stageIndex.get(stage);
  return moduleName ? modules.get(moduleName) : null;
}

/**
 * Get all registered modules
 * @returns {AuxoraModule[]}
 */
function getAllModules() {
  return Array.from(modules.values());
}

/**
 * Get module attribution for frontend display
 * @param {string} name
 * @returns {{ name, icon, label, color }}
 */
function getAttribution(name) {
  const mod = modules.get(name);
  if (!mod) return { name: 'unknown', icon: '🤖', label: 'Agent', color: '#6B7280' };
  return {
    name: mod.name,
    icon: mod.icon || '🤖',
    label: mod.label || mod.name,
    color: mod.color || '#6B7280',
  };
}

/**
 * Build routing context for LLM classifier
 * Returns descriptions + examples for each module that has a specialist
 * @returns {string}
 */
function buildRoutingPrompt() {
  const sections = [];
  
  for (const mod of modules.values()) {
    if (!mod.handleMessage) continue;
    
    let section = `**${mod.name}**: ${mod.description}`;
    if (mod.routingExamples && mod.routingExamples.length > 0) {
      const examples = mod.routingExamples
        .slice(0, 5)
        .map(ex => `  - "${ex}"`)
        .join('\n');
      section += `\n  Example queries:\n${examples}`;
    }
    sections.push(section);
  }
  
  return sections.join('\n\n');
}

/**
 * Clear all modules (for testing)
 */
function clear() {
  modules.clear();
  stageIndex.clear();
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  register,
  getModule,
  getModuleForStage,
  getAllModules,
  getAttribution,
  buildRoutingPrompt,
  clear,
};
