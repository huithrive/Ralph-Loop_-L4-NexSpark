// Test setup for NexSpark backend
require('dotenv').config();

// Test database connection (you may want to use a separate test database)
const { connectWithRetry } = require('../config/database');

// Global test setup
beforeAll(async () => {
  try {
    await connectWithRetry();
    console.log('Test database connected');
  } catch (error) {
    console.error('Test database connection failed:', error.message);
    throw error;
  }
});

// Set test timeout
jest.setTimeout(30000);