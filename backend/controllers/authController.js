const User = require('../models/User');
const Branch = require('../models/Branch');
const { generateToken, generateResetToken, hashResetToken, sanitizeUser, getCurrentAcademicYear, generateStudentId } = require('../utils/auth');
const { sendPasswordResetEmail, sendWelcomeEmail } = require('../utils/sendEmail');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, phone, branch, semester, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Validate branch for students
    if (role === 'student') {
      if (!branch || !semester) {
        return res.status(400).json({
          success: false,
          message: 'Branch and semester are required for students'
        });
      }

      const branchExists = await Branch.findById(branch);
      if (!branchExists) {
        return res.status(400).json({
          success: false,
          message: 'Invalid branch selected'
        });
      }
    }

    // Create user data
    const userData = {
      name,
      email,
      password,
      phone,
      role: role || 'student'
    };

    // Add student-specific data
    if (role === 'student') {
      const branchInfo = await Branch.findById(branch);
      const studentId = generateStudentId(branchInfo.code);
      
      // Ensure unique student ID
      let isUnique = false;
      let attempts = 0;
      while (!isUnique && attempts < 10) {
        const existingStudentId = await User.findOne({ studentId });
        if (!existingStudentId) {
          isUnique = true;
        } else {
          studentId = generateStudentId(branchInfo.code);
          attempts++;
        }
      }

      userData.studentId = studentId;
      userData.branch = branch;
      userData.semester = semester;
    }

    // Create user
    const user = await User.create(userData);

    // Send welcome email
    try {
      await sendWelcomeEmail(user);
    } catch (emailError) {
      console.error('Welcome email failed:', emailError);
      // Don't fail registration if email fails
    }

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    const sanitizedUser = sanitizeUser(user);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: sanitizedUser
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user and include password for comparison
    const user = await User.findOne({ email }).select('+password').populate('branch', 'name code');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.'
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Set cookie if remember me is checked
    if (rememberMe) {
      const cookieOptions = {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
      };

      res.cookie('token', token, cookieOptions);
    }

    // Remove password from response
    const sanitizedUser = sanitizeUser(user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: sanitizedUser
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
const logout = async (req, res) => {
  try {
    // Clear cookie
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      message: 'User logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('branch', 'name code');
    
    const sanitizedUser = sanitizeUser(user);

    res.status(200).json({
      success: true,
      user: sanitizedUser
    });

  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user data'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/updateprofile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone
    };

    // Only allow students to update certain fields
    if (req.user.role === 'student') {
      // Students can only update name, email, and phone
      delete fieldsToUpdate.role;
      delete fieldsToUpdate.branch;
      delete fieldsToUpdate.semester;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    ).populate('branch', 'name code');

    const sanitizedUser = sanitizeUser(user);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: sanitizedUser
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current password and new password'
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isCurrentPasswordMatch = await user.comparePassword(currentPassword);

    if (!isCurrentPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
      token
    });

  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update password',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email address'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email address'
      });
    }

    // Generate reset token
    const { resetToken, hashedToken } = generateResetToken();

    // Set reset token and expiration
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/resetpassword/${resetToken}`;

    try {
      await sendPasswordResetEmail(user, resetToken, resetUrl);

      res.status(200).json({
        success: true,
        message: 'Password reset email sent successfully'
      });

    } catch (emailError) {
      console.error('Password reset email error:', emailError);
      
      // Clear reset token fields
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      return res.status(500).json({
        success: false,
        message: 'Email could not be sent'
      });
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request'
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { resettoken } = req.params;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide new password'
      });
    }

    // Hash the token and find user
    const hashedToken = hashResetToken(resettoken);

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
      token
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  updatePassword,
  forgotPassword,
  resetPassword
};
