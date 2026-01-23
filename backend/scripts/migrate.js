#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { query, connectWithRetry } = require('../config/database');

async function runMigration(migrationFile) {
  try {
    console.log(`Running migration: ${migrationFile}`);

    const migrationPath = path.join(__dirname, '../migrations', migrationFile);
    const sql = await fs.readFile(migrationPath, 'utf8');

    await query(sql);
    console.log(`✅ Migration ${migrationFile} completed successfully`);

    return true;
  } catch (error) {
    console.error(`❌ Migration ${migrationFile} failed:`, error.message);
    return false;
  }
}

async function createMigrationsTable() {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      migration_name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await query(createTableSQL);
    console.log('✅ Schema migrations table ready');
  } catch (error) {
    console.error('❌ Failed to create schema_migrations table:', error.message);
    throw error;
  }
}

async function getMigrationStatus(migrationFile) {
  const checkSQL = 'SELECT migration_name FROM schema_migrations WHERE migration_name = $1';
  const result = await query(checkSQL, [migrationFile]);
  return result.rows.length > 0;
}

async function recordMigration(migrationFile) {
  const insertSQL = 'INSERT INTO schema_migrations (migration_name) VALUES ($1)';
  await query(insertSQL, [migrationFile]);
}

async function runMigrations() {
  try {
    console.log('🚀 Starting database migrations...\n');

    // Test database connection
    await connectWithRetry();

    // Ensure migrations tracking table exists
    await createMigrationsTable();

    // Get list of migration files
    const migrationsDir = path.join(__dirname, '../migrations');
    const files = await fs.readdir(migrationsDir);
    const migrationFiles = files
      .filter(file => file.endsWith('.sql'))
      .sort();

    if (migrationFiles.length === 0) {
      console.log('No migrations found.');
      return;
    }

    console.log(`Found ${migrationFiles.length} migration(s)\n`);

    let completedCount = 0;

    for (const migrationFile of migrationFiles) {
      const alreadyRun = await getMigrationStatus(migrationFile);

      if (alreadyRun) {
        console.log(`⏭️  Skipping ${migrationFile} (already executed)`);
        continue;
      }

      const success = await runMigration(migrationFile);

      if (success) {
        await recordMigration(migrationFile);
        completedCount++;
      } else {
        console.error('\n❌ Migration failed. Stopping here.');
        process.exit(1);
      }
    }

    if (completedCount > 0) {
      console.log(`\n🎉 Successfully executed ${completedCount} migration(s)`);
    } else {
      console.log('\n✨ Database is up to date - no migrations needed');
    }

  } catch (error) {
    console.error('\n💥 Migration process failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('\n✅ Migration process completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration process failed:', error.message);
      process.exit(1);
    });
}

module.exports = { runMigrations, runMigration };