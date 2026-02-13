const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// 1. Environment Variable Validation
const validateEnv = require('./middleware/envValidator');
validateEnv();

// Import Firebase (this will attempt initialization)
const { db } = require('./models/firebase');

const authRoutes = require('./routes/auth');
const datasetRoutes = require('./routes/datasetRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const voteRoutes = require('./routes/voteRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();

// Render and other proxies trust settings
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan('dev'));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
});
app.use('/api/', limiter);

// 2. Database Initialization Check Middleware
// This prevents the server from crashing and provides a clear error to the client
app.use('/api', (req, res, next) => {
  if (req.path === '/health') return next();

  if (!db) {
    return res.status(503).json({
      success: false,
      error: "Database not initialized"
    });
  }
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    database: db ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/datasets', datasetRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/analytics', analyticsRoutes);

// Static Frontend Serving in Production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../client/dist');
  app.use(express.static(distPath));

  // Catch-all to serve index.html for SPA routing
  app.get(/^(?!\/api).+/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// 3. Global Error Handling Middleware
// Express 5 handles async errors automatically, but we still need a global handler
app.use((err, req, res, next) => {
  console.error('GLOBAL_ERROR_HANDLER:', err);

  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Something went wrong on the server',
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.stack
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server started successfully on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📅 Started at: ${new Date().toLocaleString()}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED_REJECTION:', err);
  // We don't exit to prevent restart loops, but we log the error
});

module.exports = app;
