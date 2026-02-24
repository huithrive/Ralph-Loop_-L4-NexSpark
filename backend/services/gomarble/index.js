/**
 * index.js — GoMarble Service Singleton
 * 
 * Exports a shared GoMarble client instance configured from environment.
 */

const GoMarbleClient = require('./gomarbleClient');

// Singleton instance
let clientInstance = null;

/**
 * Get the shared GoMarble client instance.
 * @returns {GoMarbleClient}
 */
function getClient() {
  if (!clientInstance) {
    clientInstance = new GoMarbleClient();
  }
  return clientInstance;
}

module.exports = {
  GoMarbleClient,
  getClient,
  // Shorthand: default export is the singleton getter
  default: getClient,
};
