const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  studentId: {
    type: String,
    unique: true,
    sparse: true, // Allows null values for admin users
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: function() {
      return this.role === 'student';
    }
  },
  semester: {
    type: Number,
    min: 1,
    max: 8,
    required: function() {
      return this.role === 'student';
    }
  },
  profilePicture: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ studentId: 1 });
userSchema.index({ branch: 1, semester: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get full name for display
userSchema.methods.getFullName = function() {
  return this.name;
};

// Check if user can access admin features
userSchema.methods.isAdmin = function() {
  return this.role === 'admin';
};

// Generate student display ID
userSchema.methods.getDisplayId = function() {
  return this.studentId || this.email;
};

module.exports = mongoose.model('User', userSchema);
