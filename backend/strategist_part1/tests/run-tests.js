#!/usr/bin/env node

/**
 * Simple test runner for integration tests
 * Loads .dev.vars and executes TypeScript tests using tsx
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .dev.vars file
const devVarsPath = path.join(__dirname, '..', '.dev.vars');

if (!fs.existsSync(devVarsPath)) {
  console.error('.dev.vars file not found');
  process.exit(1);
}

console.log('🔧 Loading environment from .dev.vars...');

// Parse .dev.vars
const envContent = fs.readFileSync(devVarsPath, 'utf-8');
const envVars = {};

envContent.split('\n').forEach(line => {
  line = line.trim();
  if (line && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  }
});

console.log('Environment loaded');
console.log(`   Found ${Object.keys(envVars).length} variables`);

// Set environment variables
Object.assign(process.env, envVars);

// Run the TypeScript test using tsx
console.log('\n🚀 Running integration tests...\n');

try {
  execSync('npx tsx tests/integration/traffic-data-tool.test.ts', {
    stdio: 'inherit',
    env: process.env
  });
  console.log('\nTests completed');
} catch (error) {
  console.log('\nTests failed');
  process.exit(1);
}