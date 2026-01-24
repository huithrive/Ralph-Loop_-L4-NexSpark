const fs = require('fs');
const { Pool } = require('pg');
require('dotenv').config();

async function runMigration() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    console.log('🗄️  Running Module 4 (Analyzer) database migration...\n');

    // Read the migration file
    const migrationSQL = fs.readFileSync('/Users/huithrive/nexspark/backend/migrations/005_analyzer_tables.sql', 'utf8');

    // Execute the migration
    await pool.query(migrationSQL);

    console.log('✅ Module 4 database migration completed successfully');

    // Verify tables were created
    const tableCheck = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('performance_snapshots', 'optimization_history', 'dashboard_configs', 'notification_queue', 'system_health_logs', 'weekly_reports')
      ORDER BY table_name
    `);

    console.log('\n📊 Created tables:', tableCheck.rows.map(row => row.table_name).join(', '));

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();