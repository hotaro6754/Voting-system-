const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

// 1. Environment Variable Validation
const requiredEnvVars = ['FIREBASE_SERVICE_ACCOUNT', 'JWT_SECRET', 'ADMIN_PASSWORD'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length > 0 && process.env.NODE_ENV === 'production') {
  console.error('CRITICAL: Missing required environment variables:', missingVars.join(', '));
  process.exit(1);
}

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

// Health check
app.get('/api/health', (req, res) => res.status(200).json({ status: 'ok', database: 'connected' }));

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

  app.get(/^(?!\/api).+/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('GLOBAL_ERROR_HANDLER:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong on the server',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
