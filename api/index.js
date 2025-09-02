const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

// Import database connection
const connectDB = require('../backend/config/database');

// Import routes
const authRoutes = require('../backend/routes/auth');
const timetableRoutes = require('../backend/routes/timetable');
const subjectRoutes = require('../backend/routes/subjects');
const branchRoutes = require('../backend/routes/branches');
const dashboardRoutes = require('../backend/routes/dashboard');

// Initialize Express app
const app = express();

// Connect to database with error handling
let dbConnected = false;
connectDB()
  .then(() => {
    dbConnected = true;
    console.log('Database connected successfully');
  })
  .catch(err => {
    console.error('Failed to connect to database:', err);
    dbConnected = false;
  });

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      'script-src-attr': ["'unsafe-inline'"]
    }
  }
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, 'https://vercel.app', 'https://*.vercel.app']
    : ['http://localhost:3000', 'http://localhost:4000', 'http://localhost:5000', 'http://127.0.0.1:5500'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const envCheck = {
    MONGODB_URI: !!process.env.MONGODB_URI,
    JWT_SECRET: !!process.env.JWT_SECRET,
    NODE_ENV: process.env.NODE_ENV || 'not set'
  };
  
  res.status(dbConnected ? 200 : 503).json({ 
    status: dbConnected ? 'OK' : 'Error', 
    message: dbConnected ? 'Server is running' : 'Database connection failed',
    database: dbConnected ? 'Connected' : 'Disconnected',
    environment: envCheck,
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint for troubleshooting
app.get('/api/debug', (req, res) => {
  res.status(200).json({
    message: 'Debug endpoint',
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      hasMongoURI: !!process.env.MONGODB_URI,
      hasJWTSecret: !!process.env.JWT_SECRET,
      isVercel: !!process.env.VERCEL,
      platform: process.platform,
      nodeVersion: process.version
    },
    database: dbConnected,
    timestamp: new Date().toISOString()
  });
});

// Simple test endpoint that doesn't require database
app.get('/api/test', (req, res) => {
  res.status(200).json({
    message: 'API is working',
    timestamp: new Date().toISOString()
  });
});

// Serve app.html for /app route
app.get('/app', (req, res) => {
  console.log(`${new Date().toISOString()} - GET /app`);
  console.log('✅ GET /app - App request received!');
  res.sendFile(path.join(__dirname, '../frontend', 'app.html'));
});

// Serve home.html for root and all other routes
app.get('*', (req, res) => {
  console.log(`${new Date().toISOString()} - GET ${req.path}`);
  console.log(`✅ GET ${req.path} - Homepage request received!`);
  res.sendFile(path.join(__dirname, '../frontend', 'home.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Export the Express app
module.exports = app;
