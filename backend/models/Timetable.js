const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
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
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: [true, 'Subject is required']
  },
  room: {
    type: String,
    trim: true,
    maxlength: [20, 'Room number cannot exceed 20 characters']
  },
  type: {
    type: String,
    enum: ['lecture', 'lab', 'tutorial', 'seminar'],
    default: 'lecture'
  }
}, { _id: true });

const dayScheduleSchema = new mongoose.Schema({
  day: {
    type: String,
    required: [true, 'Day is required'],
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  timeSlots: [timeSlotSchema]
}, { _id: false });

const timetableSchema = new mongoose.Schema({
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
  academicYear: {
    type: String,
    required: [true, 'Academic year is required'],
    match: [/^\d{4}-\d{4}$/, 'Academic year must be in format YYYY-YYYY']
  },
  schedule: [dayScheduleSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  effectiveFrom: {
    type: Date,
    required: [true, 'Effective from date is required']
  },
  effectiveTo: {
    type: Date
  },
  version: {
    type: Number,
    default: 1
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Create compound index for unique timetable per branch, semester and academic year
timetableSchema.index({ branch: 1, semester: 1, academicYear: 1, version: 1 }, { unique: true });
timetableSchema.index({ branch: 1, semester: 1 });
timetableSchema.index({ isActive: 1 });
timetableSchema.index({ effectiveFrom: 1, effectiveTo: 1 });

// Virtual to check if timetable is currently effective
timetableSchema.virtual('isCurrentlyActive').get(function() {
  const now = new Date();
  const effectiveFrom = new Date(this.effectiveFrom);
  const effectiveTo = this.effectiveTo ? new Date(this.effectiveTo) : new Date('2099-12-31');
  
  return this.isActive && now >= effectiveFrom && now <= effectiveTo;
});

// Method to get today's schedule
timetableSchema.methods.getTodaysSchedule = function() {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todaySchedule = this.schedule.find(day => day.day === today);
  return todaySchedule ? todaySchedule.timeSlots : [];
};

// Method to get schedule for specific day
timetableSchema.methods.getScheduleForDay = function(dayName) {
  const daySchedule = this.schedule.find(day => day.day === dayName);
  return daySchedule ? daySchedule.timeSlots : [];
};

// Method to get all subjects in timetable
timetableSchema.methods.getAllSubjects = function() {
  const subjectIds = new Set();
  this.schedule.forEach(day => {
    day.timeSlots.forEach(slot => {
      subjectIds.add(slot.subject.toString());
    });
  });
  return Array.from(subjectIds);
};

// Method to check for time conflicts
timetableSchema.methods.hasTimeConflict = function(day, startTime, endTime) {
  const daySchedule = this.schedule.find(d => d.day === day);
  if (!daySchedule) return false;
  
  return daySchedule.timeSlots.some(slot => {
    return (startTime < slot.endTime && endTime > slot.startTime);
  });
};

// Static method to get current active timetable
timetableSchema.statics.getCurrentTimetable = function(branchId, semester) {
  const now = new Date();
  return this.findOne({
    branch: branchId,
    semester: semester,
    isActive: true,
    effectiveFrom: { $lte: now },
    $or: [
      { effectiveTo: { $gte: now } },
      { effectiveTo: { $exists: false } }
    ]
  }).populate('branch', 'name code').populate('schedule.timeSlots.subject');
};

// Static method to get timetables by branch and semester
timetableSchema.statics.getTimetablesByBranchAndSemester = function(branchId, semester) {
  return this.find({
    branch: branchId,
    semester: semester
  }).populate('branch', 'name code').sort({ version: -1 });
};

// Method to create new version of timetable
timetableSchema.methods.createNewVersion = async function(newSchedule, effectiveFrom) {
  const NewTimetable = this.constructor;
  
  // Find the highest version number for this branch/semester/year
  const latestVersion = await NewTimetable.findOne({
    branch: this.branch,
    semester: this.semester,
    academicYear: this.academicYear
  }).sort({ version: -1 });
  
  const newVersion = latestVersion ? latestVersion.version + 1 : 1;
  
  // Deactivate current timetable
  this.isActive = false;
  this.effectiveTo = new Date(effectiveFrom.getTime() - 1);
  await this.save();
  
  // Create new timetable version
  const newTimetable = new NewTimetable({
    branch: this.branch,
    semester: this.semester,
    academicYear: this.academicYear,
    schedule: newSchedule,
    effectiveFrom: effectiveFrom,
    version: newVersion,
    isActive: true
  });
  
  return await newTimetable.save();
};

// Method to get weekly class count by subject
timetableSchema.methods.getWeeklyClassCount = function() {
  const subjectCount = {};
  
  this.schedule.forEach(day => {
    day.timeSlots.forEach(slot => {
      const subjectId = slot.subject.toString();
      subjectCount[subjectId] = (subjectCount[subjectId] || 0) + 1;
    });
  });
  
  return subjectCount;
};

// Method to get next class for student
timetableSchema.methods.getNextClass = function() {
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
  
  // Check remaining classes today
  const todaySchedule = this.getScheduleForDay(currentDay);
  const nextTodayClass = todaySchedule.find(slot => slot.startTime > currentTime);
  
  if (nextTodayClass) {
    return {
      day: currentDay,
      ...nextTodayClass
    };
  }
  
  // Check next days
  const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const currentDayIndex = daysOrder.indexOf(currentDay);
  
  for (let i = 1; i < 7; i++) {
    const nextDayIndex = (currentDayIndex + i) % 7;
    const nextDay = daysOrder[nextDayIndex];
    const nextDaySchedule = this.getScheduleForDay(nextDay);
    
    if (nextDaySchedule.length > 0) {
      return {
        day: nextDay,
        ...nextDaySchedule[0]
      };
    }
  }
  
  return null;
};

module.exports = mongoose.model('Timetable', timetableSchema);
