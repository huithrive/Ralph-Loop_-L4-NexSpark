require('dotenv').config(); // Load .env from current directory

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
      defaultSrc: ['\'self\''],
      styleSrc: ['\'self\'', '\'unsafe-inline\''],
      scriptSrc: ['\'self\''],
      imgSrc: ['\'self\'', 'data:', 'https:'],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://nexspark.com'] // Add production domains here
    : '*', // Allow all origins in development for file:// protocol support
  credentials: process.env.NODE_ENV === 'production',
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

// API routes - Strategist Module
const researchRoutes = require('./api/strategist/research');
const interviewRoutes = require('./api/strategist/interview');
const reportRoutes = require('./api/strategist/reports');
app.use('/api/strategist', researchRoutes);
app.use('/api/strategist/interview', interviewRoutes);
app.use('/api/strategist/reports', reportRoutes);

// API routes - Executor Module
const landingPageRoutes = require('./api/executor/landingPages');
const shopifyRoutes = require('./api/executor/shopify');
const domainRoutes = require('./api/executor/domains');
const creativeRoutes = require('./api/executor/creative');
app.use('/api/executor/landing-pages', landingPageRoutes);
app.use('/api/executor/shopify', shopifyRoutes);
app.use('/api/executor/domains', domainRoutes);
app.use('/api/executor/creative', creativeRoutes);

// API routes - Advertiser Module
const campaignRoutes = require('./api/advertiser/campaign');
const advertiserAuthRoutes = require('./api/advertiser/auth');
const pixelRoutes = require('./api/advertiser/pixel');
app.use('/api/advertiser/campaigns', campaignRoutes);
app.use('/api/advertiser/campaign', campaignRoutes); // Support both singular and plural for backward compatibility
app.use('/api/advertiser/auth', advertiserAuthRoutes);
app.use('/api/advertiser/pixel', pixelRoutes);

// API routes - Analyzer Module
const performanceRoutes = require('./api/analyzer/performance');
const optimizeRoutes = require('./api/analyzer/optimize');
const dashboardRoutes = require('./api/analyzer/dashboard');
const healthRoutes = require('./api/analyzer/health');
const analyzerReportsRoutes = require('./api/analyzer/reports');
app.use('/api/analyzer/performance', performanceRoutes);
app.use('/api/analyzer/optimize', optimizeRoutes);
app.use('/api/analyzer/dashboard', dashboardRoutes);
app.use('/api/analyzer/health', healthRoutes);
app.use('/api/analyzer/reports', analyzerReportsRoutes);

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
      console.log('   GET  /api/health - Health check');
      console.log('   POST /api/strategist/research - Market research');
      console.log('   GET  /api/strategist/research/:id - Get research');
      console.log('   POST /api/strategist/interview/start - Start interview');
      console.log('   POST /api/strategist/interview/:id/respond - Submit response');
      console.log('   POST /api/strategist/interview/:id/complete - Complete interview');
      console.log('   POST /api/strategist/reports/generate - Generate GTM report');
      console.log('   POST /api/strategist/reports/preview - Generate report preview');
      console.log('   GET  /api/strategist/reports/health - Report service health');
      console.log('   POST /api/executor/creative/generate - Generate video from image');
      console.log('   GET  /api/executor/creative/:id - Get creative details');
      console.log('   GET  /api/executor/creative/:id/status - Poll status updates');
      console.log('   GET  /api/executor/creatives - List creatives');
      console.log('   POST /api/advertiser/campaigns/create - Create Meta/Google campaign');
      console.log('   GET  /api/advertiser/campaigns/:id - Get campaign details');
      console.log('   PUT  /api/advertiser/campaigns/:id/status - Update campaign status');
      console.log('   GET  /api/advertiser/campaigns - List campaigns');
      console.log('   POST /api/advertiser/pixel/install - Install Meta Pixel');
      console.log('   GET  /api/advertiser/auth/meta/connect - Connect Meta Business Manager');
      console.log('   GET  /api/advertiser/auth/google/connect - Connect Google Ads');
      console.log('   GET  /api/analyzer/performance/:campaign_id - Get campaign performance');
      console.log('   GET  /api/analyzer/performance - Get multi-campaign performance');
      console.log('   POST /api/analyzer/optimize/:campaign_id - Run campaign optimization');
      console.log('   GET  /api/analyzer/dashboard/:user_id - Get dashboard data');
      console.log('   GET  /api/analyzer/health/system - Get system health status');
      console.log('   POST /api/analyzer/reports/generate - Generate weekly report');
      console.log('\n' + '='.repeat(50));
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Start the server
startServer();