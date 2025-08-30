const mongoose = require('mongoose');

const academicCalendarSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    index: true
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(value) {
        return value >= this.startDate;
      },
      message: 'End date must be after or same as start date'
    }
  },
  type: {
    type: String,
    enum: ['holiday', 'exam', 'semester-start', 'semester-end', 'registration', 'event', 'break'],
    required: [true, 'Event type is required']
  },
  academicYear: {
    type: String,
    required: [true, 'Academic year is required'],
    match: [/^\d{4}-\d{4}$/, 'Academic year must be in format YYYY-YYYY']
  },
  branches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch'
  }],
  semesters: [{
    type: Number,
    min: 1,
    max: 12
  }],
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrencePattern: {
    type: String,
    enum: ['yearly', 'monthly', 'weekly'],
    required: function() {
      return this.isRecurring;
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  color: {
    type: String,
    default: '#007bff',
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please provide a valid hex color']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by is required']
  },
  notificationSent: {
    type: Boolean,
    default: false
  },
  notifyBefore: {
    type: Number,
    default: 1, // days before event
    min: [0, 'Notification days cannot be negative']
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
academicCalendarSchema.index({ startDate: 1, endDate: 1 });
academicCalendarSchema.index({ academicYear: 1 });
academicCalendarSchema.index({ type: 1 });
academicCalendarSchema.index({ branches: 1 });
academicCalendarSchema.index({ isActive: 1 });
academicCalendarSchema.index({ startDate: 1, type: 1 });

// Virtual to check if event is currently active
academicCalendarSchema.virtual('isCurrentlyActive').get(function() {
  const now = new Date();
  return this.isActive && now >= this.startDate && now <= this.endDate;
});

// Virtual to check if event is upcoming
academicCalendarSchema.virtual('isUpcoming').get(function() {
  const now = new Date();
  return this.isActive && this.startDate > now;
});

// Virtual to get event duration in days
academicCalendarSchema.virtual('durationInDays').get(function() {
  const timeDiff = this.endDate.getTime() - this.startDate.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
});

// Method to check if event applies to specific branch and semester
academicCalendarSchema.methods.appliesTo = function(branchId, semester) {
  const appliesToBranch = this.branches.length === 0 || this.branches.some(branch => branch.equals(branchId));
  const appliesToSemester = this.semesters.length === 0 || this.semesters.includes(semester);
  return appliesToBranch && appliesToSemester;
};

// Method to check if event is a holiday
academicCalendarSchema.methods.isHoliday = function() {
  return this.type === 'holiday' || this.type === 'break';
};

// Static method to get events for date range
academicCalendarSchema.statics.getEventsForDateRange = function(startDate, endDate, branchId = null, semester = null) {
  const query = {
    isActive: true,
    $or: [
      { startDate: { $gte: startDate, $lte: endDate } },
      { endDate: { $gte: startDate, $lte: endDate } },
      { startDate: { $lte: startDate }, endDate: { $gte: endDate } }
    ]
  };

  if (branchId) {
    query.$and = query.$and || [];
    query.$and.push({
      $or: [
        { branches: { $size: 0 } },
        { branches: branchId }
      ]
    });
  }

  if (semester) {
    query.$and = query.$and || [];
    query.$and.push({
      $or: [
        { semesters: { $size: 0 } },
        { semesters: semester }
      ]
    });
  }

  return this.find(query).populate('branches', 'name code').sort({ startDate: 1 });
};

// Static method to get upcoming events
academicCalendarSchema.statics.getUpcomingEvents = function(days = 30, branchId = null, semester = null) {
  const now = new Date();
  const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
  
  return this.getEventsForDateRange(now, futureDate, branchId, semester);
};

// Static method to get holidays for date range
academicCalendarSchema.statics.getHolidaysForDateRange = function(startDate, endDate, branchId = null, semester = null) {
  const query = {
    isActive: true,
    type: { $in: ['holiday', 'break'] },
    $or: [
      { startDate: { $gte: startDate, $lte: endDate } },
      { endDate: { $gte: startDate, $lte: endDate } },
      { startDate: { $lte: startDate }, endDate: { $gte: endDate } }
    ]
  };

  if (branchId) {
    query.$and = query.$and || [];
    query.$and.push({
      $or: [
        { branches: { $size: 0 } },
        { branches: branchId }
      ]
    });
  }

  if (semester) {
    query.$and = query.$and || [];
    query.$and.push({
      $or: [
        { semesters: { $size: 0 } },
        { semesters: semester }
      ]
    });
  }

  return this.find(query).populate('branches', 'name code').sort({ startDate: 1 });
};

// Static method to check if date is holiday
academicCalendarSchema.statics.isHoliday = async function(date, branchId = null, semester = null) {
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));
  
  const holidays = await this.getHolidaysForDateRange(startOfDay, endOfDay, branchId, semester);
  return holidays.length > 0;
};

// Static method to get events by type
academicCalendarSchema.statics.getEventsByType = function(type, academicYear = null, branchId = null, semester = null) {
  const query = {
    type: type,
    isActive: true
  };

  if (academicYear) {
    query.academicYear = academicYear;
  }

  if (branchId) {
    query.$and = query.$and || [];
    query.$and.push({
      $or: [
        { branches: { $size: 0 } },
        { branches: branchId }
      ]
    });
  }

  if (semester) {
    query.$and = query.$and || [];
    query.$and.push({
      $or: [
        { semesters: { $size: 0 } },
        { semesters: semester }
      ]
    });
  }

  return this.find(query).populate('branches', 'name code').sort({ startDate: 1 });
};

// Method to create recurring events
academicCalendarSchema.methods.createRecurringEvents = async function(numberOfOccurrences = 1) {
  if (!this.isRecurring || !this.recurrencePattern) {
    throw new Error('Event is not set as recurring');
  }

  const events = [];
  const CalendarModel = this.constructor;

  for (let i = 1; i <= numberOfOccurrences; i++) {
    const newStartDate = new Date(this.startDate);
    const newEndDate = new Date(this.endDate);

    switch (this.recurrencePattern) {
      case 'yearly':
        newStartDate.setFullYear(newStartDate.getFullYear() + i);
        newEndDate.setFullYear(newEndDate.getFullYear() + i);
        break;
      case 'monthly':
        newStartDate.setMonth(newStartDate.getMonth() + i);
        newEndDate.setMonth(newEndDate.getMonth() + i);
        break;
      case 'weekly':
        newStartDate.setDate(newStartDate.getDate() + (i * 7));
        newEndDate.setDate(newEndDate.getDate() + (i * 7));
        break;
    }

    const newEvent = new CalendarModel({
      title: this.title,
      description: this.description,
      startDate: newStartDate,
      endDate: newEndDate,
      type: this.type,
      academicYear: this.academicYear,
      branches: this.branches,
      semesters: this.semesters,
      isRecurring: false, // Recurring events create non-recurring instances
      priority: this.priority,
      color: this.color,
      location: this.location,
      createdBy: this.createdBy,
      notifyBefore: this.notifyBefore
    });

    events.push(await newEvent.save());
  }

  return events;
};

module.exports = mongoose.model('AcademicCalendar', academicCalendarSchema);
