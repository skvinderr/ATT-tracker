const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

// Initialize Express app first
const app = express();

// Basic error handling to prevent crashes
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  console.error('Stack:', err.stack);
  // Don't exit in development
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit in development
});

// Import database connection with error handling
let connectDB;
try {
  connectDB = require('./config/database');
  
  // Try to connect to database but don't crash if it fails
  connectDB().catch(err => {
    console.error('Database connection failed:', err.message);
    console.log('Server will continue without database connection');
  });
} catch (error) {
  console.error('Error loading database module:', error.message);
  console.log('Server will continue without database connection');
}

// Import routes with error handling
let authRoutes, timetableRoutes, subjectRoutes, branchRoutes, dashboardRoutes;

try {
  authRoutes = require('./routes/auth');
  timetableRoutes = require('./routes/timetable');
  subjectRoutes = require('./routes/subjects');
  branchRoutes = require('./routes/branches');
  dashboardRoutes = require('./routes/dashboard');
} catch (error) {
  console.error('Error loading routes:', error.message);
  console.log('Some API routes may not be available');
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development to avoid issues
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourproductiondomain.com'] // Replace with your domain
    : true, // Allow all origins in development
  credentials: true
}));

// Rate limiting - DISABLED FOR DEVELOPMENT
// const limiter = rateLimit({
//   windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
//   max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
//   message: {
//     success: false,
//     message: 'Too many requests from this IP, please try again later.'
//   },
//   standardHeaders: true,
//   legacyHeaders: false
// });

// app.use(limiter); // DISABLED FOR DEVELOPMENT

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser middleware
app.use(cookieParser());

// Static files middleware - serve frontend files
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.static(path.join(__dirname, '../public')));

// Request logging middleware (always enabled for debugging)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Routes (only if they loaded successfully)
if (authRoutes) app.use('/api/auth', authRoutes);
if (dashboardRoutes) app.use('/api/dashboard', dashboardRoutes);
if (timetableRoutes) app.use('/api/timetable', timetableRoutes);
if (subjectRoutes) app.use('/api/subjects', subjectRoutes);
if (branchRoutes) app.use('/api/branches', branchRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'College Attendance Tracker API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      health: '/api/health'
    },
    documentation: 'See README.md for detailed API documentation'
  });
});

// Serve frontend for all non-API routes (SPA support)
app.get('/', (req, res) => {
  console.log(`${new Date().toISOString()} - ✅ GET / - Homepage request received!`);
  // Try to serve simple-home.html first, fall back to home.html
  res.sendFile(path.join(__dirname, '../frontend', 'simple-home.html'), (err) => {
    if (err) {
      console.log('simple-home.html not found, trying home.html');
      res.sendFile(path.join(__dirname, '../frontend', 'home.html'), (err2) => {
        if (err2) {
          console.error('Error serving homepage:', err2.message);
          res.status(500).send('<h1>Error loading homepage</h1><p>Please check server logs</p>');
        }
      });
    }
  });
});

app.get('/test', (req, res) => {
  console.log(`${new Date().toISOString()} - ✅ GET /test - Test route accessed!`);
  res.send(`
    <html>
      <body style="background: green; color: white; padding: 50px; text-align: center; font-family: Arial;">
        <h1>✅ SERVER IS WORKING!</h1>
        <p>If you can see this page, the server is running correctly.</p>
        <a href="/" style="color: yellow;">Try Homepage</a> | 
        <a href="/app" style="color: yellow;">Go to App</a>
      </body>
    </html>
  `);
});

app.get('/home', (req, res) => {
  console.log(`${new Date().toISOString()} - GET /home`);
  res.sendFile(path.join(__dirname, '../frontend', 'homepage-simple.html'));
});

app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'app.html'));
});

app.get('*', (req, res) => {
  console.log(`${new Date().toISOString()} - 🔍 Request: ${req.originalUrl}`);
  
  // Don't serve frontend for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      message: 'API endpoint not found'
    });
  }
  
  // Skip dev tools and favicon requests
  if (req.path.includes('.well-known') || req.path.includes('favicon')) {
    return res.status(404).end();
  }
  
  // For ANY other request, serve the homepage
  console.log(`${new Date().toISOString()} - ✅ Serving home.html for: ${req.originalUrl}`);
  res.sendFile(path.join(__dirname, '../frontend', 'home.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  let error = { ...err };
  error.message = err.message;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`📱 Frontend served at: http://localhost:${PORT}`);
  console.log(`🔗 API available at: http://localhost:${PORT}/api`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`Uncaught Exception: ${err.message}`);
  console.error('Stack trace:', err.stack);
  // Don't exit the process in development
  if (process.env.NODE_ENV === 'production') {
    console.log('Shutting down the server due to uncaught exception');
    process.exit(1);
  } else {
    console.log('Continuing in development mode...');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = app;
