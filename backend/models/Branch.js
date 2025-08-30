const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Branch name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Branch name cannot exceed 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Branch code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: [10, 'Branch code cannot exceed 10 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true,
    maxlength: [100, 'Department name cannot exceed 100 characters']
  },
  totalSemesters: {
    type: Number,
    required: [true, 'Total semesters is required'],
    min: [1, 'Total semesters must be at least 1'],
    max: [12, 'Total semesters cannot exceed 12'],
    default: 8
  },
  isActive: {
    type: Boolean,
    default: true
  },
  establishedYear: {
    type: Number,
    min: [1900, 'Established year must be after 1900'],
    max: [new Date().getFullYear(), 'Established year cannot be in the future']
  },
  headOfDepartment: {
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'HOD name cannot exceed 100 characters']
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
    }
  }
}, {
  timestamps: true
});

// Create index for faster queries
branchSchema.index({ code: 1 });
branchSchema.index({ name: 1 });
branchSchema.index({ isActive: 1 });

// Virtual to get total students
branchSchema.virtual('totalStudents', {
  ref: 'User',
  localField: '_id',
  foreignField: 'branch',
  count: true
});

// Method to get active students count
branchSchema.methods.getActiveStudentsCount = async function() {
  const User = mongoose.model('User');
  return await User.countDocuments({ branch: this._id, isActive: true, role: 'student' });
};

// Method to get students by semester
branchSchema.methods.getStudentsBySemester = async function(semester) {
  const User = mongoose.model('User');
  return await User.find({ 
    branch: this._id, 
    semester: semester, 
    role: 'student', 
    isActive: true 
  });
};

// Static method to get all active branches
branchSchema.statics.getActiveBranches = function() {
  return this.find({ isActive: true }).sort({ name: 1 });
};

// Static method to get branch with student count
branchSchema.statics.getBranchesWithCounts = async function() {
  return await this.aggregate([
    { $match: { isActive: true } },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: 'branch',
        as: 'students'
      }
    },
    {
      $addFields: {
        totalStudents: {
          $size: {
            $filter: {
              input: '$students',
              cond: { 
                $and: [
                  { $eq: ['$$this.role', 'student'] },
                  { $eq: ['$$this.isActive', true] }
                ]
              }
            }
          }
        }
      }
    },
    {
      $project: {
        students: 0
      }
    },
    { $sort: { name: 1 } }
  ]);
};

module.exports = mongoose.model('Branch', branchSchema);
