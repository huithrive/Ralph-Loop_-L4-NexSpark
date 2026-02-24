#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

function printTitle(title) {
  console.log('\n' + '='.repeat(88));
  console.log(title);
  console.log('='.repeat(88));
}

function formatValue(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function printRows(rows) {
  if (!rows || rows.length === 0) {
    console.log('(no rows)');
    return;
  }

  const headers = Object.keys(rows[0]);
  const widths = headers.map((header) => header.length);

  rows.forEach((row) => {
    headers.forEach((header, idx) => {
      widths[idx] = Math.max(widths[idx], formatValue(row[header]).length);
    });
  });

  const divider = '+' + widths.map((w) => '-'.repeat(w + 2)).join('+') + '+';
  const headerRow =
    '| ' +
    headers
      .map((h, i) => h.padEnd(widths[i], ' '))
      .join(' | ') +
    ' |';

  console.log(divider);
  console.log(headerRow);
  console.log(divider);

  rows.forEach((row) => {
    const line =
      '| ' +
      headers
        .map((h, i) => formatValue(row[h]).padEnd(widths[i], ' '))
        .join(' | ') +
      ' |';
    console.log(line);
  });

  console.log(divider);
  console.log(`rows: ${rows.length}`);
}

function normalizeResults(queryResult) {
  if (Array.isArray(queryResult)) return queryResult;
  return [queryResult];
}

async function runVerification() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is missing');
    }

    const sqlPath = path.join(__dirname, '..', 'migrations', '009_post_migration_verification.sql');
    const sql = await fs.readFile(sqlPath, 'utf8');

    console.log('Running verification SQL:', sqlPath);
    const rawResult = await pool.query(sql);
    const results = normalizeResults(rawResult);

    if (results.length < 4) {
      throw new Error(`Expected 4 result sets, got ${results.length}`);
    }

    const [constraintsResult, triggersResult, badDataResult, summaryResult] = results;

    printTitle('1) Constraint Check');
    printRows(constraintsResult.rows);

    printTitle('2) Trigger Check');
    printRows(triggersResult.rows);

    printTitle('3) Residual Bad Data Check');
    printRows(badDataResult.rows);

    printTitle('4) Overall Summary');
    printRows(summaryResult.rows);

    const summary = summaryResult.rows[0] || {};
    const overallStatus = summary.overall_status || 'UNKNOWN';
    const exitCode = overallStatus === 'PASS' ? 0 : 2;

    console.log('\nVerification overall status:', overallStatus);
    process.exitCode = exitCode;
  } catch (error) {
    console.error('\nVerification failed:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

runVerification();
