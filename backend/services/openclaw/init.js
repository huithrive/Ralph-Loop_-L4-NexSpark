/**
 * init.js — OpenClaw Module System Bootstrap
 * 
 * Registers all modules with the registry. Import this once at app startup.
 * 
 * Usage:
 *   require('./services/openclaw/init');
 *   // Then use chatRouter normally
 */

const registry = require('./moduleRegistry');
const logger = require('../../utils/logger');

// Import modules
const strategistModule = require('./modules/strategistModule');
const executorModule = require('./modules/executorModule');
const advertiserModule = require('./modules/advertiserModule');
const analyzerModule = require('./modules/analyzerModule');

// Register in order
const modules = [
  strategistModule,
  executorModule,
  advertiserModule,
  analyzerModule,
];

for (const mod of modules) {
  try {
    registry.register(mod);
  } catch (err) {
    logger.error(`[openclaw:init] Failed to register module '${mod.name}':`, err.message);
  }
}

logger.info(`[openclaw:init] ${registry.getAllModules().length} modules registered`);

module.exports = { registry };
