const express = require('express');
const router = express.Router();
const Timetable = require('../models/Timetable');
const Subject = require('../models/Subject');
const Branch = require('../models/Branch');
const { protect, adminOnly } = require('../middleware/auth');

// @desc    Get all timetables with filters
// @route   GET /api/timetable
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { branch, semester, academicYear, day } = req.query;
        let query = { isActive: true };

        // If user is a student, filter by their branch and semester
        if (req.user.role === 'student') {
            query.branch = req.user.branch;
            query.semester = req.user.semester;
        } else {
            // Admin can filter by specific criteria
            if (branch) {
                // Handle branch as either ObjectId or code
                if (branch.length === 24) {
                    query.branch = branch;
                } else {
                    // Look up branch by code
                    const branchDoc = await Branch.findOne({ code: branch.toUpperCase() });
                    if (branchDoc) {
                        query.branch = branchDoc._id;
                    }
                }
            }
            if (semester) query.semester = parseInt(semester);
        }

        if (academicYear) query.academicYear = academicYear;

        const timetables = await Timetable.find(query)
            .populate('branch', 'name code')
            .populate('schedule.timeSlots.subject', 'name code')
            .sort({ branch: 1, semester: 1 });

        // If day filter is provided, filter the schedule
        let filteredTimetables = timetables;
        if (day) {
            filteredTimetables = timetables.map(timetable => {
                const daySchedule = timetable.schedule.find(s => s.day === day);
                return {
                    ...timetable.toObject(),
                    schedule: daySchedule ? [daySchedule] : []
                };
            });
        }

        res.status(200).json({
            success: true,
            count: filteredTimetables.length,
            data: filteredTimetables
        });
    } catch (error) {
        console.error('Error fetching timetables:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching timetables'
        });
    }
});

// @desc    Get specific timetable by ID
// @route   GET /api/timetable/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const timetable = await Timetable.findById(req.params.id)
            .populate('branch', 'name code')
            .populate('schedule.timeSlots.subject', 'name code');

        if (!timetable) {
            return res.status(404).json({
                success: false,
                message: 'Timetable not found'
            });
        }

        res.status(200).json({
            success: true,
            data: timetable
        });
    } catch (error) {
        console.error('Error fetching timetable:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching timetable'
        });
    }
});

// @desc    Create new timetable
// @route   POST /api/timetable
// @access  Private (Admin only)
router.post('/', protect, adminOnly, async (req, res) => {
    try {
        const { branch, semester, academicYear, schedule } = req.body;

        // Validate required fields
        if (!branch || !semester || !academicYear || !schedule) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields (branch, semester, academicYear, schedule)'
            });
        }

        // Find branch by code or name
        let branchDoc = await Branch.findOne({
            $or: [
                { code: branch.toUpperCase() },
                { name: new RegExp(branch, 'i') }
            ]
        });

        if (!branchDoc) {
            return res.status(400).json({
                success: false,
                message: 'Invalid branch. Please provide a valid branch code or name.'
            });
        }

        // Check for existing active timetable
        const existingTimetable = await Timetable.findOne({
            branch: branchDoc._id,
            semester,
            academicYear,
            isActive: true
        });

        if (existingTimetable) {
            // Add to existing timetable instead of creating new one
            const newDay = schedule[0];
            const existingDay = existingTimetable.schedule.find(d => d.day === newDay.day);
            
            if (existingDay) {
                // Add time slots to existing day
                existingDay.timeSlots.push(...newDay.timeSlots);
                // Sort by start time
                existingDay.timeSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));
            } else {
                // Add new day to schedule
                existingTimetable.schedule.push(newDay);
            }

            const updatedTimetable = await existingTimetable.save();
            await updatedTimetable.populate('branch', 'name code');
            await updatedTimetable.populate('schedule.timeSlots.subject', 'name code');

            return res.status(200).json({
                success: true,
                message: 'Timetable entry added successfully',
                data: updatedTimetable
            });
        }

        // Validate all subjects exist
        const subjectIds = [];
        for (const day of schedule) {
            for (const slot of day.timeSlots) {
                if (!subjectIds.includes(slot.subject)) {
                    subjectIds.push(slot.subject);
                }
            }
        }

        // Check if all subjects exist
        const existingSubjects = await Subject.find({ _id: { $in: subjectIds } });
        if (existingSubjects.length !== subjectIds.length) {
            const missingSubjects = subjectIds.filter(id => 
                !existingSubjects.some(subject => subject._id.toString() === id)
            );
            return res.status(400).json({
                success: false,
                message: `Invalid subjects: ${missingSubjects.join(', ')}`
            });
        }

        const newTimetable = new Timetable({
            branch: branchDoc._id,
            semester,
            academicYear,
            schedule,
            effectiveFrom: new Date(),
            isActive: true
        });

        const savedTimetable = await newTimetable.save();
        
        await savedTimetable.populate('branch', 'name code');
        await savedTimetable.populate('schedule.timeSlots.subject', 'name code');

        res.status(201).json({
            success: true,
            message: 'Timetable created successfully',
            data: savedTimetable
        });
    } catch (error) {
        console.error('Error creating timetable:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating timetable'
        });
    }
});

// @desc    Update timetable
// @route   PUT /api/timetable/:id
// @access  Private (Admin only)
router.put('/:id', protect, adminOnly, async (req, res) => {
    try {
        const { schedule, notes, effectiveFrom, effectiveTo } = req.body;

        const timetable = await Timetable.findById(req.params.id);
        if (!timetable) {
            return res.status(404).json({
                success: false,
                message: 'Timetable not found'
            });
        }

        // Validate subjects if schedule is being updated
        if (schedule) {
            const subjectIds = [];
            schedule.forEach(day => {
                day.timeSlots.forEach(slot => {
                    subjectIds.push(slot.subject);
                });
            });

            const validSubjects = await Subject.find({ _id: { $in: subjectIds } });
            if (validSubjects.length !== subjectIds.length) {
                return res.status(400).json({
                    success: false,
                    message: 'One or more invalid subject IDs'
                });
            }
        }

        // Update fields
        if (schedule) timetable.schedule = schedule;
        if (notes !== undefined) timetable.notes = notes;
        if (effectiveFrom) timetable.effectiveFrom = new Date(effectiveFrom);
        if (effectiveTo) timetable.effectiveTo = new Date(effectiveTo);

        const updatedTimetable = await timetable.save();
        
        await updatedTimetable.populate('branch', 'name code');
        await updatedTimetable.populate('schedule.timeSlots.subject', 'name code');

        res.status(200).json({
            success: true,
            message: 'Timetable updated successfully',
            data: updatedTimetable
        });
    } catch (error) {
        console.error('Error updating timetable:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating timetable'
        });
    }
});

// @desc    Delete timetable
// @route   DELETE /api/timetable/:id
// @access  Private (Admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const timetable = await Timetable.findById(req.params.id);
        if (!timetable) {
            return res.status(404).json({
                success: false,
                message: 'Timetable not found'
            });
        }

        await Timetable.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Timetable deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting timetable:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting timetable'
        });
    }
});

// @desc    Add time slot to specific day
// @route   POST /api/timetable/:id/timeslot
// @access  Private (Admin only)
router.post('/:id/timeslot', protect, adminOnly, async (req, res) => {
    try {
        const { day, startTime, endTime, subject, room, type } = req.body;

        if (!day || !startTime || !endTime || !subject) {
            return res.status(400).json({
                success: false,
                message: 'Please provide day, start time, end time, and subject'
            });
        }

        const timetable = await Timetable.findById(req.params.id);
        if (!timetable) {
            return res.status(404).json({
                success: false,
                message: 'Timetable not found'
            });
        }

        // Check if subject exists
        const subjectExists = await Subject.findById(subject);
        if (!subjectExists) {
            return res.status(400).json({
                success: false,
                message: 'Invalid subject ID'
            });
        }

        // Check for time conflicts
        if (timetable.hasTimeConflict(day, startTime, endTime)) {
            return res.status(400).json({
                success: false,
                message: 'Time slot conflicts with existing schedule'
            });
        }

        // Find or create day schedule
        let daySchedule = timetable.schedule.find(d => d.day === day);
        if (!daySchedule) {
            daySchedule = { day, timeSlots: [] };
            timetable.schedule.push(daySchedule);
        }

        // Add new time slot
        const newTimeSlot = {
            startTime,
            endTime,
            subject,
            room: room || '',
            type: type || 'lecture'
        };

        daySchedule.timeSlots.push(newTimeSlot);

        // Sort time slots by start time
        daySchedule.timeSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));

        const updatedTimetable = await timetable.save();
        await updatedTimetable.populate('branch', 'name code');
        await updatedTimetable.populate('schedule.timeSlots.subject', 'name code');

        res.status(200).json({
            success: true,
            message: 'Time slot added successfully',
            data: updatedTimetable
        });
    } catch (error) {
        console.error('Error adding time slot:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while adding time slot'
        });
    }
});

// @desc    Get current week timetable for student
// @route   GET /api/timetable/current-week
// @access  Private (Students only)
router.get('/current-week', protect, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({
                success: false,
                message: 'This endpoint is for students only'
            });
        }

        const timetable = await Timetable.getCurrentTimetable(req.user.branch, req.user.semester);
        
        if (!timetable) {
            return res.status(404).json({
                success: false,
                message: 'No active timetable found for your branch and semester'
            });
        }

        res.status(200).json({
            success: true,
            data: timetable
        });
    } catch (error) {
        console.error('Error fetching current week timetable:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching timetable'
        });
    }
});

// @desc    Update specific time slot
// @route   PUT /api/timetable/:id/timeslot/:slotId
// @access  Private (Admin only)
router.put('/:id/timeslot/:slotId', protect, adminOnly, async (req, res) => {
    try {
        const { startTime, endTime, subject, room, type } = req.body;
        if (!startTime || !endTime || !subject) {
            return res.status(400).json({
                success: false,
                message: 'Please provide start time, end time, and subject'
            });
        }
        const timetable = await Timetable.findById(req.params.id);
        if (!timetable) {
            return res.status(404).json({
                success: false,
                message: 'Timetable not found'
            });
        }
        let updated = false;
        for (const daySchedule of timetable.schedule) {
            const slotIndex = daySchedule.timeSlots.findIndex(slot => slot._id && slot._id.toString() === req.params.slotId);
            if (slotIndex !== -1) {
                daySchedule.timeSlots[slotIndex] = {
                    ...daySchedule.timeSlots[slotIndex],
                    startTime,
                    endTime,
                    subject,
                    room: room || '',
                    type: type || 'lecture'
                };
                updated = true;
                break;
            }
        }
        // Fallback: try to parse slotId as day-index (e.g., Monday-0)
        if (!updated && req.params.slotId.includes('-')) {
            const [dayName, slotIdx] = req.params.slotId.split('-');
            const slotIndex = parseInt(slotIdx);
            const daySchedule = timetable.schedule.find(day => day.day === dayName);
            if (daySchedule && daySchedule.timeSlots[slotIndex]) {
                daySchedule.timeSlots[slotIndex] = {
                    ...daySchedule.timeSlots[slotIndex],
                    startTime,
                    endTime,
                    subject,
                    room: room || '',
                    type: type || 'lecture'
                };
                updated = true;
            }
        }
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Time slot not found'
            });
        }
        const updatedTimetable = await timetable.save();
        await updatedTimetable.populate('branch', 'name code');
        await updatedTimetable.populate('schedule.timeSlots.subject', 'name code');
        res.status(200).json({
            success: true,
            message: 'Time slot updated successfully',
            data: updatedTimetable
        });
    } catch (error) {
        console.error('Error updating time slot:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating time slot'
        });
    }
});

// @desc    Delete specific time slot
// @route   DELETE /api/timetable/:id/timeslot/:slotId
// @access  Private (Admin only)
router.delete('/:id/timeslot/:slotId', protect, adminOnly, async (req, res) => {
    try {
        const timetable = await Timetable.findById(req.params.id);
        if (!timetable) {
            return res.status(404).json({
                success: false,
                message: 'Timetable not found'
            });
        }
        let removed = false;
        for (const daySchedule of timetable.schedule) {
            const slotIndex = daySchedule.timeSlots.findIndex(slot => slot._id && slot._id.toString() === req.params.slotId);
            if (slotIndex !== -1) {
                daySchedule.timeSlots.splice(slotIndex, 1);
                removed = true;
                break;
            }
        }
        // Fallback: try to parse slotId as day-index (e.g., Monday-0)
        if (!removed && req.params.slotId.includes('-')) {
            const [dayName, slotIdx] = req.params.slotId.split('-');
            const slotIndex = parseInt(slotIdx);
            const daySchedule = timetable.schedule.find(day => day.day === dayName);
            if (daySchedule && daySchedule.timeSlots[slotIndex]) {
                daySchedule.timeSlots.splice(slotIndex, 1);
                removed = true;
            }
        }
        if (!removed) {
            return res.status(404).json({
                success: false,
                message: 'Time slot not found'
            });
        }
        timetable.schedule = timetable.schedule.filter(day => day.timeSlots.length > 0);
        if (timetable.schedule.length === 0) {
            await Timetable.findByIdAndDelete(req.params.id);
            return res.status(200).json({
                success: true,
                message: 'Timetable deleted (was empty after removing slot)'
            });
        }
        const updatedTimetable = await timetable.save();
        await updatedTimetable.populate('branch', 'name code');
        await updatedTimetable.populate('schedule.timeSlots.subject', 'name code');
        res.status(200).json({
            success: true,
            message: 'Time slot deleted successfully',
            data: updatedTimetable
        });
    } catch (error) {
        console.error('Error deleting time slot:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting time slot'
        });
    }
});

// @desc    Delete specific time slot by day and index (legacy endpoint)
// @route   DELETE /api/timetable/:id/day/:dayName/slot/:slotIndex
// @access  Private (Admin only)
router.delete('/:id/day/:dayName/slot/:slotIndex', protect, adminOnly, async (req, res) => {
    try {
        const { dayName, slotIndex } = req.params;
        const index = parseInt(slotIndex);
        
        if (isNaN(index) || index < 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid slot index'
            });
        }

        const timetable = await Timetable.findById(req.params.id);
        if (!timetable) {
            return res.status(404).json({
                success: false,
                message: 'Timetable not found'
            });
        }

        const daySchedule = timetable.schedule.find(day => day.day === dayName);
        if (!daySchedule || !daySchedule.timeSlots[index]) {
            return res.status(404).json({
                success: false,
                message: 'Time slot not found'
            });
        }

        // Remove the slot
        daySchedule.timeSlots.splice(index, 1);

        // Remove empty days
        timetable.schedule = timetable.schedule.filter(day => day.timeSlots.length > 0);

        // If no days left, delete the timetable
        if (timetable.schedule.length === 0) {
            await Timetable.findByIdAndDelete(req.params.id);
            return res.status(200).json({
                success: true,
                message: 'Timetable deleted (was empty after removing slot)'
            });
        }

        const updatedTimetable = await timetable.save();
        await updatedTimetable.populate('branch', 'name code');
        await updatedTimetable.populate('schedule.timeSlots.subject', 'name code');

        res.status(200).json({
            success: true,
            message: 'Time slot deleted successfully',
            data: updatedTimetable
        });
    } catch (error) {
        console.error('Error deleting time slot by day/index:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting time slot'
        });
    }
});

// @desc    Update specific time slot by day and index (legacy endpoint)
// @route   PUT /api/timetable/:id/day/:dayName/slot/:slotIndex
// @access  Private (Admin only)
router.put('/:id/day/:dayName/slot/:slotIndex', protect, adminOnly, async (req, res) => {
    try {
        const { dayName, slotIndex } = req.params;
        const { startTime, endTime, subject, room, type } = req.body;
        const index = parseInt(slotIndex);
        
        if (!startTime || !endTime || !subject) {
            return res.status(400).json({
                success: false,
                message: 'Please provide start time, end time, and subject'
            });
        }

        if (isNaN(index) || index < 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid slot index'
            });
        }

        const timetable = await Timetable.findById(req.params.id);
        if (!timetable) {
            return res.status(404).json({
                success: false,
                message: 'Timetable not found'
            });
        }

        const daySchedule = timetable.schedule.find(day => day.day === dayName);
        if (!daySchedule || !daySchedule.timeSlots[index]) {
            return res.status(404).json({
                success: false,
                message: 'Time slot not found'
            });
        }

        // Update the slot
        daySchedule.timeSlots[index] = {
            ...daySchedule.timeSlots[index],
            startTime,
            endTime,
            subject,
            room: room || '',
            type: type || 'lecture'
        };

        const updatedTimetable = await timetable.save();
        await updatedTimetable.populate('branch', 'name code');
        await updatedTimetable.populate('schedule.timeSlots.subject', 'name code');

        res.status(200).json({
            success: true,
            message: 'Time slot updated successfully',
            data: updatedTimetable
        });
    } catch (error) {
        console.error('Error updating time slot by day/index:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating time slot'
        });
    }
});

module.exports = router;
