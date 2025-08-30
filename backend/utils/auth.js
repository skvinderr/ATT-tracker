const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

// Generate refresh token
const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString('hex');
};

// Verify JWT Token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Generate password reset token
const generateResetToken = () => {
  const resetToken = crypto.randomBytes(20).toString('hex');
  
  // Hash token and set to resetPasswordToken field
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  return { resetToken, hashedToken };
};

// Hash password reset token for comparison
const hashResetToken = (token) => {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
};

// Generate random student ID
const generateStudentId = (branch = 'CS', year = new Date().getFullYear()) => {
  const yearSuffix = year.toString().slice(-2);
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${branch}${yearSuffix}${randomNum}`;
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Generate OTP for two-factor authentication
const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  
  return otp;
};

// Calculate token expiration time
const getTokenExpirationTime = (minutes = 15) => {
  return new Date(Date.now() + minutes * 60 * 1000);
};

// Check if token is expired
const isTokenExpired = (expirationTime) => {
  return new Date() > new Date(expirationTime);
};

// Clean expired tokens from user records
const cleanExpiredTokens = async (User) => {
  try {
    const now = new Date();
    await User.updateMany(
      { resetPasswordExpire: { $lt: now } },
      { 
        $unset: { 
          resetPasswordToken: 1,
          resetPasswordExpire: 1 
        } 
      }
    );
  } catch (error) {
    console.error('Error cleaning expired tokens:', error);
  }
};

// Generate secure cookie options
const getCookieOptions = () => {
  return {
    expires: new Date(Date.now() + parseInt(process.env.COOKIE_MAX_AGE) || 86400000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };
};

// Extract user info for JWT payload
const getUserPayload = (user) => {
  return {
    id: user._id,
    email: user.email,
    role: user.role,
    studentId: user.studentId,
    branch: user.branch,
    semester: user.semester
  };
};

// Generate academic year based on current date
const getCurrentAcademicYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 0-based month
  
  // Academic year typically starts in July/August
  if (month >= 7) {
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
};

// Sanitize user object for response (remove sensitive data)
const sanitizeUser = (user) => {
  const userObj = user.toObject ? user.toObject() : user;
  
  delete userObj.password;
  delete userObj.resetPasswordToken;
  delete userObj.resetPasswordExpire;
  
  return userObj;
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  generateResetToken,
  hashResetToken,
  generateStudentId,
  isValidEmail,
  validatePassword,
  generateOTP,
  getTokenExpirationTime,
  isTokenExpired,
  cleanExpiredTokens,
  getCookieOptions,
  getUserPayload,
  getCurrentAcademicYear,
  sanitizeUser
};
