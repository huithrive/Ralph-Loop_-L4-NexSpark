require('dotenv').config({ path: '../.env' });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { connectWithRetry, healthCheck, closeConnection } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://nexspark.com'] // Add production domains here
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbHealthy = await healthCheck();

    const status = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: require('./package.json').version,
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
    console.error('Health check failed:', error.message);
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

// API routes
const researchRoutes = require('./api/strategist/research');
app.use('/api/strategist', researchRoutes);

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error.stack);

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development'
      ? error.message
      : 'An unexpected error occurred',
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  try {
    await closeConnection();
    console.log('Database connections closed.');

    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error.message);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server only if database connection succeeds
async function startServer() {
  try {
    console.log('🚀 Starting NexSpark Backend API...\n');

    // Verify database connection
    await connectWithRetry();
    console.log('✅ Database connection verified');

    app.listen(PORT, () => {
      console.log(`\n✨ Server running on port ${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log('\n📋 Available endpoints:');
      console.log(`   GET  /api/health - Health check`);
      console.log(`   *    /api/strategist/* - (Not implemented yet)`);
      console.log('\n' + '='.repeat(50));
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Start the server
startServer();