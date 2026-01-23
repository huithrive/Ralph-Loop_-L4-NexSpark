const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

// Database connection configuration
const config = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // maximum number of connections
  idleTimeoutMillis: 30000, // close idle connections after 30 seconds
  connectionTimeoutMillis: 5000, // wait 5 seconds before timing out when connecting
};

const pool = new Pool(config);

// Connection retry logic
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

async function connectWithRetry(retries = 0) {
  try {
    const client = await pool.connect();
    console.log('Database connected successfully');
    client.release();
    return true;
  } catch (error) {
    console.error(`Database connection attempt ${retries + 1} failed:`, error.message);

    if (retries < MAX_RETRIES) {
      console.log(`Retrying in ${RETRY_DELAY / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return connectWithRetry(retries + 1);
    } else {
      console.error('Max database connection retries exceeded');
      throw error;
    }
  }
}

// Query wrapper with error handling
async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`Query executed in ${duration}ms:`, text.substring(0, 50) + '...');
    return result;
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error;
  }
}

// Health check function
async function healthCheck() {
  try {
    const result = await query('SELECT 1 as health');
    return result.rows[0].health === 1;
  } catch (error) {
    console.error('Database health check failed:', error.message);
    return false;
  }
}

// Graceful shutdown
async function closeConnection() {
  try {
    await pool.end();
    console.log('Database connection pool closed');
  } catch (error) {
    console.error('Error closing database connection:', error.message);
  }
}

// Handle process termination
process.on('SIGTERM', closeConnection);
process.on('SIGINT', closeConnection);

module.exports = {
  query,
  pool,
  connectWithRetry,
  healthCheck,
  closeConnection
};