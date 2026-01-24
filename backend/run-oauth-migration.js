const fs = require('fs');
const { Pool } = require('pg');
require('dotenv').config();

async function runOAuthMigration() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    console.log('🔐 Running OAuth Token Management migration...\n');

    // Read the migration file
    const migrationSQL = fs.readFileSync('/Users/huithrive/nexspark/backend/migrations/006_oauth_tokens.sql', 'utf8');

    // Execute the migration
    await pool.query(migrationSQL);

    console.log('✅ OAuth token management migration completed successfully');

    // Verify tables were created
    const tableCheck = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('oauth_states', 'oauth_tokens')
      ORDER BY table_name
    `);

    console.log('\n📊 Created tables:', tableCheck.rows.map(row => row.table_name).join(', '));

    // Verify indexes were created
    const indexCheck = await pool.query(`
      SELECT indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
      AND tablename IN ('oauth_states', 'oauth_tokens')
      ORDER BY indexname
    `);

    console.log('🗂️  Created indexes:', indexCheck.rows.map(row => row.indexname).join(', '));

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runOAuthMigration();