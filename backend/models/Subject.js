const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Subject name is required'],
    trim: true,
    maxlength: [100, 'Subject name cannot exceed 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Subject code is required'],
    uppercase: true,
    trim: true,
    maxlength: [20, 'Subject code cannot exceed 20 characters']
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: [true, 'Branch is required']
  },
  semester: {
    type: Number,
    required: [true, 'Semester is required'],
    min: [1, 'Semester must be at least 1'],
    max: [12, 'Semester cannot exceed 12']
  },
  credits: {
    type: Number,
    required: [true, 'Credits are required'],
    min: [1, 'Credits must be at least 1'],
    max: [10, 'Credits cannot exceed 10']
  },
  type: {
    type: String,
    enum: ['theory', 'practical', 'project', 'seminar'],
    required: [true, 'Subject type is required']
  },
  faculty: {
    name: {
      type: String,
      required: [true, 'Faculty name is required'],
      trim: true,
      maxlength: [100, 'Faculty name cannot exceed 100 characters']
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
    },
    department: {
      type: String,
      trim: true,
      maxlength: [100, 'Department name cannot exceed 100 characters']
    }
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  syllabus: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  minimumAttendance: {
    type: Number,
    default: 75,
    min: [0, 'Minimum attendance cannot be negative'],
    max: [100, 'Minimum attendance cannot exceed 100']
  },
  totalLectures: {
    type: Number,
    default: 0,
    min: [0, 'Total lectures cannot be negative']
  },
  room: {
    type: String,
    trim: true,
    maxlength: [20, 'Room number cannot exceed 20 characters']
  }
}, {
  timestamps: true
});

// Create compound index for unique subject per branch and semester
subjectSchema.index({ code: 1, branch: 1, semester: 1 }, { unique: true });
subjectSchema.index({ branch: 1, semester: 1 });
subjectSchema.index({ faculty: 1 });
subjectSchema.index({ isActive: 1 });

// Virtual to get subject's full identifier
subjectSchema.virtual('fullCode').get(function() {
  return `${this.code}`;
});

// Virtual to get subject display name
subjectSchema.virtual('displayName').get(function() {
  return `${this.name} (${this.code})`;
});

// Method to get total students enrolled
subjectSchema.methods.getEnrolledStudentsCount = async function() {
  const User = mongoose.model('User');
  return await User.countDocuments({ 
    branch: this.branch, 
    semester: this.semester, 
    role: 'student', 
    isActive: true 
  });
};

// Method to get students with attendance
subjectSchema.methods.getStudentsWithAttendance = async function() {
  const User = mongoose.model('User');
  const Attendance = mongoose.model('Attendance');
  
  const students = await User.find({ 
    branch: this.branch, 
    semester: this.semester, 
    role: 'student', 
    isActive: true 
  }).select('name studentId email');

  const studentsWithAttendance = [];
  
  for (const student of students) {
    const attendanceRecords = await Attendance.find({
      student: student._id,
      subject: this._id
    });
    
    const totalClasses = attendanceRecords.length;
    const attendedClasses = attendanceRecords.filter(record => record.status === 'present').length;
    const attendancePercentage = totalClasses > 0 ? (attendedClasses / totalClasses * 100).toFixed(2) : 0;
    
    studentsWithAttendance.push({
      student,
      totalClasses,
      attendedClasses,
      attendancePercentage: parseFloat(attendancePercentage)
    });
  }
  
  return studentsWithAttendance;
};

// Static method to get subjects by branch and semester
subjectSchema.statics.getSubjectsByBranchAndSemester = function(branchId, semester) {
  return this.find({ 
    branch: branchId, 
    semester: semester, 
    isActive: true 
  }).populate('branch', 'name code');
};

// Static method to get subjects by faculty
subjectSchema.statics.getSubjectsByFaculty = function(facultyEmail) {
  return this.find({ 
    'faculty.email': facultyEmail, 
    isActive: true 
  }).populate('branch', 'name code');
};

// Method to calculate average attendance for subject
subjectSchema.methods.getAverageAttendance = async function() {
  const Attendance = mongoose.model('Attendance');
  
  const attendanceStats = await Attendance.aggregate([
    { $match: { subject: this._id } },
    {
      $group: {
        _id: '$student',
        totalClasses: { $sum: 1 },
        attendedClasses: {
          $sum: {
            $cond: [{ $eq: ['$status', 'present'] }, 1, 0]
          }
        }
      }
    },
    {
      $addFields: {
        attendancePercentage: {
          $cond: [
            { $gt: ['$totalClasses', 0] },
            { $multiply: [{ $divide: ['$attendedClasses', '$totalClasses'] }, 100] },
            0
          ]
        }
      }
    },
    {
      $group: {
        _id: null,
        averageAttendance: { $avg: '$attendancePercentage' },
        totalStudents: { $sum: 1 }
      }
    }
  ]);

  return attendanceStats.length > 0 ? {
    averageAttendance: parseFloat(attendanceStats[0].averageAttendance.toFixed(2)),
    totalStudents: attendanceStats[0].totalStudents
  } : {
    averageAttendance: 0,
    totalStudents: 0
  };
};

module.exports = mongoose.model('Subject', subjectSchema);
