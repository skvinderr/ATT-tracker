const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

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

// Connect to database
connectDB();

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
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
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
