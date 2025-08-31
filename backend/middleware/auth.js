const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes middleware
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password').populate('branch', 'name code');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!req.user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User account is deactivated'
        });
      }

      // Update last login
      req.user.lastLogin = new Date();
      await req.user.save();

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }
};

// Admin role middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this resource`
      });
    }
    next();
  };
};

// Student only middleware
const studentOnly = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Access restricted to students only'
    });
  }
  next();
};

// Admin only middleware
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access restricted to administrators only'
    });
  }
  next();
};

// Optional auth middleware - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password').populate('branch', 'name code');
      
      if (req.user && req.user.isActive) {
        req.user.lastLogin = new Date();
        await req.user.save();
      } else {
        req.user = null;
      }
    } catch (error) {
      req.user = null;
    }
  }

  next();
};

// Check if user owns the resource or is admin
const ownerOrAdmin = (resourceField = 'student') => {
  return (req, res, next) => {
    const resourceId = req.params.id || req.body[resourceField] || req.query[resourceField];
    
    if (req.user.role === 'admin') {
      return next();
    }
    
    if (req.user.role === 'student' && req.user._id.toString() === resourceId) {
      return next();
    }
    
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this resource'
    });
  };
};

// Rate limiting check - DISABLED FOR DEVELOPMENT
const checkRateLimit = (req, res, next) => {
  // DISABLED FOR DEVELOPMENT - Skip all rate limiting
  next();
  
  // Original rate limiting code (commented out for development)
  /*
  // This could be enhanced with Redis for production
  const userIP = req.ip;
  const now = Date.now();
  
  if (!req.session.rateLimitData) {
    req.session.rateLimitData = {};
  }
  
  if (!req.session.rateLimitData[userIP]) {
    req.session.rateLimitData[userIP] = [];
  }
  
  // Clean old requests (older than 15 minutes)
  req.session.rateLimitData[userIP] = req.session.rateLimitData[userIP].filter(
    timestamp => now - timestamp < 15 * 60 * 1000
  );
  
  // Check if rate limit exceeded (max 100 requests per 15 minutes)
  if (req.session.rateLimitData[userIP].length >= 100) {
    return res.status(429).json({
      success: false,
      message: 'Rate limit exceeded. Please try again later.'
    });
  }
  
  // Add current request timestamp
  req.session.rateLimitData[userIP].push(now);
  next();
  */
};

module.exports = {
  protect,
  authorize,
  studentOnly,
  adminOnly,
  optionalAuth,
  ownerOrAdmin,
  checkRateLimit
};
