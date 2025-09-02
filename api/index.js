const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');

// For serverless functions, we need to handle environment variables differently
if (!process.env.VERCEL) {
  require('dotenv').config();
}

// Initialize Express app
const app = express();

// Global variable to track database connection
global.dbConnected = false;

// Import database connection
const connectDB = require('../backend/config/database');

// Initialize database connection
async function initializeDatabase() {
  if (!global.dbConnected) {
    try {
      await connectDB();
      global.dbConnected = true;
      console.log('Database connected successfully');
    } catch (error) {
      console.error('Database connection failed:', error);
      global.dbConnected = false;
      // Don't throw in serverless - just continue without DB
    }
  }
}

// Security middleware with relaxed CSP for development
app.use(helmet({
  contentSecurityPolicy: false, // Disable for now to avoid issues
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, 'https://vercel.app', 'https://*.vercel.app']
    : true, // Allow all origins in development
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Initialize database for each request (serverless-friendly)
app.use(async (req, res, next) => {
  try {
    await initializeDatabase();
  } catch (error) {
    console.error('Database initialization error:', error);
  }
  next();
});

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Import routes only after database setup
let authRoutes, timetableRoutes, subjectRoutes, branchRoutes, dashboardRoutes;

try {
  authRoutes = require('../backend/routes/auth');
  timetableRoutes = require('../backend/routes/timetable');
  subjectRoutes = require('../backend/routes/subjects');
  branchRoutes = require('../backend/routes/branches');
  dashboardRoutes = require('../backend/routes/dashboard');
  
  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/timetable', timetableRoutes);
  app.use('/api/subjects', subjectRoutes);
  app.use('/api/branches', branchRoutes);
  app.use('/api/dashboard', dashboardRoutes);
} catch (error) {
  console.error('Error loading routes:', error);
  // Continue without API routes if there's an error
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  const envCheck = {
    MONGODB_URI: !!process.env.MONGODB_URI,
    JWT_SECRET: !!process.env.JWT_SECRET,
    NODE_ENV: process.env.NODE_ENV || 'not set',
    VERCEL: !!process.env.VERCEL
  };
  
  res.status(global.dbConnected ? 200 : 503).json({ 
    status: global.dbConnected ? 'OK' : 'Error', 
    message: global.dbConnected ? 'Server is running' : 'Database connection failed',
    database: global.dbConnected ? 'Connected' : 'Disconnected',
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
    database: global.dbConnected,
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
