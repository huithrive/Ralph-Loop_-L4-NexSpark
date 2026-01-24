#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Load environment variables
require('dotenv').config();

async function runMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🗄️  Running migration 005_analyzer_tables.sql...');

    const migrationPath = path.join(__dirname, '..', 'migrations', '005_analyzer_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    await pool.query(migrationSQL);

    console.log('✅ Migration 005_analyzer_tables.sql completed successfully');

    // Verify tables were created
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('performance_snapshots', 'optimization_actions', 'system_health_logs', 'weekly_reports', 'dashboard_configs', 'notification_queue')
      ORDER BY table_name;
    `);

    console.log('📋 Created tables:');
    result.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();