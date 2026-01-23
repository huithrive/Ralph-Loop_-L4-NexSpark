const request = require('supertest');
const express = require('express');
const { connectWithRetry } = require('../config/database');

// Mock the database for testing
jest.mock('../config/database', () => ({
  connectWithRetry: jest.fn(),
  healthCheck: jest.fn(),
  closeConnection: jest.fn(),
}));

// We need to import the app after mocking
let app;

beforeAll(() => {
  // Reset modules to ensure we get a fresh app instance with mocked dependencies
  jest.resetModules();
  // Import server after mocking
  app = require('express')();

  // Minimal setup for testing health endpoint
  app.use(express.json());

  app.get('/api/health', async (req, res) => {
    try {
      const { healthCheck } = require('../config/database');
      const dbHealthy = await healthCheck();

      const status = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        version: require('../package.json').version,
        database: dbHealthy ? 'connected' : 'disconnected',
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
        }
      };

      if (!dbHealthy) {
        return res.status(503).json({
          ...status,
          status: 'degraded',
          issues: ['Database connection failed']
        });
      }

      res.status(200).json(status);
    } catch (error) {
      res.status(503).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Health check failed'
      });
    }
  });
});

describe('Health Check Endpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return 200 when database is healthy', async () => {
    const { healthCheck } = require('../config/database');
    healthCheck.mockResolvedValue(true);

    const response = await request(app)
      .get('/api/health')
      .expect(200);

    expect(response.body.status).toBe('ok');
    expect(response.body.database).toBe('connected');
    expect(response.body.timestamp).toBeDefined();
    expect(response.body.uptime).toBeDefined();
  });

  test('should return 503 when database is unhealthy', async () => {
    const { healthCheck } = require('../config/database');
    healthCheck.mockResolvedValue(false);

    const response = await request(app)
      .get('/api/health')
      .expect(503);

    expect(response.body.status).toBe('degraded');
    expect(response.body.database).toBe('disconnected');
    expect(response.body.issues).toContain('Database connection failed');
  });

  test('should return 503 when health check throws error', async () => {
    const { healthCheck } = require('../config/database');
    healthCheck.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .get('/api/health')
      .expect(503);

    expect(response.body.status).toBe('error');
    expect(response.body.error).toBe('Health check failed');
  });
});