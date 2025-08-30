const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required']
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: [true, 'Subject is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    index: true
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide valid time in HH:MM format']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide valid time in HH:MM format']
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late'],
    required: [true, 'Attendance status is required']
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Marked by is required']
  },
  markedAt: {
    type: Date,
    default: Date.now
  },
  classType: {
    type: String,
    enum: ['lecture', 'lab', 'tutorial', 'seminar'],
    default: 'lecture'
  },
  room: {
    type: String,
    trim: true,
    maxlength: [20, 'Room number cannot exceed 20 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [200, 'Notes cannot exceed 200 characters']
  },
  isModified: {
    type: Boolean,
    default: false
  },
  modificationHistory: [{
    previousStatus: {
      type: String,
      enum: ['present', 'absent', 'late']
    },
    newStatus: {
      type: String,
      enum: ['present', 'absent', 'late']
    },
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    modifiedAt: {
      type: Date,
      default: Date.now
    },
    reason: {
      type: String,
      trim: true,
      maxlength: [200, 'Reason cannot exceed 200 characters']
    }
  }],
  academicYear: {
    type: String,
    required: [true, 'Academic year is required'],
    match: [/^\d{4}-\d{4}$/, 'Academic year must be in format YYYY-YYYY']
  }
}, {
  timestamps: true
});

// Create compound index for unique attendance record per student, subject, date, and time
attendanceSchema.index({ student: 1, subject: 1, date: 1, startTime: 1 }, { unique: true });
attendanceSchema.index({ student: 1, date: 1 });
attendanceSchema.index({ subject: 1, date: 1 });
attendanceSchema.index({ date: 1, status: 1 });
attendanceSchema.index({ academicYear: 1 });

// Virtual to check if attendance was marked late
attendanceSchema.virtual('isLateMarked').get(function() {
  const classDateTime = new Date(this.date);
  const [hours, minutes] = this.endTime.split(':');
  classDateTime.setHours(parseInt(hours), parseInt(minutes));
  
  return this.markedAt > classDateTime;
});

// Method to modify attendance status
attendanceSchema.methods.modifyStatus = function(newStatus, modifiedBy, reason) {
  if (this.status !== newStatus) {
    this.modificationHistory.push({
      previousStatus: this.status,
      newStatus: newStatus,
      modifiedBy: modifiedBy,
      modifiedAt: new Date(),
      reason: reason || 'Status updated'
    });
    
    this.status = newStatus;
    this.isModified = true;
  }
};

// Static method to get attendance summary for student
attendanceSchema.statics.getStudentAttendanceSummary = async function(studentId, subjectId = null, startDate = null, endDate = null) {
  const matchConditions = { student: studentId };
  
  if (subjectId) {
    matchConditions.subject = subjectId;
  }
  
  if (startDate || endDate) {
    matchConditions.date = {};
    if (startDate) matchConditions.date.$gte = new Date(startDate);
    if (endDate) matchConditions.date.$lte = new Date(endDate);
  }
  
  const summary = await this.aggregate([
    { $match: matchConditions },
    {
      $group: {
        _id: '$subject',
        totalClasses: { $sum: 1 },
        presentCount: {
          $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
        },
        absentCount: {
          $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] }
        },
        lateCount: {
          $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] }
        }
      }
    },
    {
      $addFields: {
        attendancePercentage: {
          $cond: [
            { $gt: ['$totalClasses', 0] },
            { $multiply: [{ $divide: ['$presentCount', '$totalClasses'] }, 100] },
            0
          ]
        }
      }
    },
    {
      $lookup: {
        from: 'subjects',
        localField: '_id',
        foreignField: '_id',
        as: 'subject'
      }
    },
    {
      $unwind: '$subject'
    },
    {
      $project: {
        subjectId: '$_id',
        subjectName: '$subject.name',
        subjectCode: '$subject.code',
        totalClasses: 1,
        presentCount: 1,
        absentCount: 1,
        lateCount: 1,
        attendancePercentage: { $round: ['$attendancePercentage', 2] }
      }
    }
  ]);
  
  return summary;
};

// Static method to get subject attendance summary
attendanceSchema.statics.getSubjectAttendanceSummary = async function(subjectId, startDate = null, endDate = null) {
  const matchConditions = { subject: subjectId };
  
  if (startDate || endDate) {
    matchConditions.date = {};
    if (startDate) matchConditions.date.$gte = new Date(startDate);
    if (endDate) matchConditions.date.$lte = new Date(endDate);
  }
  
  const summary = await this.aggregate([
    { $match: matchConditions },
    {
      $group: {
        _id: '$student',
        totalClasses: { $sum: 1 },
        presentCount: {
          $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
        },
        absentCount: {
          $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] }
        },
        lateCount: {
          $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] }
        }
      }
    },
    {
      $addFields: {
        attendancePercentage: {
          $cond: [
            { $gt: ['$totalClasses', 0] },
            { $multiply: [{ $divide: ['$presentCount', '$totalClasses'] }, 100] },
            0
          ]
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'student'
      }
    },
    {
      $unwind: '$student'
    },
    {
      $project: {
        studentId: '$_id',
        studentName: '$student.name',
        studentNumber: '$student.studentId',
        totalClasses: 1,
        presentCount: 1,
        absentCount: 1,
        lateCount: 1,
        attendancePercentage: { $round: ['$attendancePercentage', 2] }
      }
    },
    {
      $sort: { attendancePercentage: -1 }
    }
  ]);
  
  return summary;
};

// Static method to get daily attendance count
attendanceSchema.statics.getDailyAttendanceCount = async function(date = null) {
  const targetDate = date ? new Date(date) : new Date();
  const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
  
  const dailyCount = await this.aggregate([
    {
      $match: {
        date: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const result = {
    present: 0,
    absent: 0,
    late: 0,
    total: 0
  };
  
  dailyCount.forEach(item => {
    result[item._id] = item.count;
    result.total += item.count;
  });
  
  return result;
};

// Static method to get attendance trends
attendanceSchema.statics.getAttendanceTrends = async function(studentId, days = 30) {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
  
  const trends = await this.aggregate([
    {
      $match: {
        student: studentId,
        date: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$date'
          }
        },
        totalClasses: { $sum: 1 },
        presentCount: {
          $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
        }
      }
    },
    {
      $addFields: {
        attendancePercentage: {
          $cond: [
            { $gt: ['$totalClasses', 0] },
            { $multiply: [{ $divide: ['$presentCount', '$totalClasses'] }, 100] },
            0
          ]
        }
      }
    },
    {
      $sort: { '_id': 1 }
    }
  ]);
  
  return trends;
};

// Method to check if attendance can be modified
attendanceSchema.methods.canModify = function() {
  const now = new Date();
  const classDate = new Date(this.date);
  const daysDifference = Math.ceil((now - classDate) / (1000 * 60 * 60 * 24));
  
  // Allow modification within 7 days of class
  return daysDifference <= 7;
};

module.exports = mongoose.model('Attendance', attendanceSchema);
