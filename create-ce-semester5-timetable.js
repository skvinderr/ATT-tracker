// Create Civil Engineering Semester 5 timetable to match existing students
const mongoose = require('mongoose');
require('dotenv').config();

const Timetable = require('./backend/models/Timetable');
const Subject = require('./backend/models/Subject');
const Branch = require('./backend/models/Branch');

async function createCESemester5Timetable() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find Civil Engineering branch
        const ceBranch = await Branch.findOne({ code: 'CE' });
        if (!ceBranch) {
            throw new Error('Civil Engineering branch not found');
        }
        console.log('Found CE branch:', ceBranch.name);

        // Find Civil Engineering semester 5 subjects
        const ceSubjects = await Subject.find({ 
            branch: ceBranch._id, 
            semester: 5 
        });
        
        console.log(`Found ${ceSubjects.length} CE semester 5 subjects:`, 
            ceSubjects.map(s => `${s.name} (${s.code})`));

        if (ceSubjects.length === 0) {
            throw new Error('No Civil Engineering semester 5 subjects found');
        }

        // Check if timetable already exists
        const existingTimetable = await Timetable.findOne({
            branch: ceBranch._id,
            semester: 5,
            academicYear: '2024-2025',
            isActive: true
        });

        if (existingTimetable) {
            console.log('Timetable already exists for CE semester 5');
            return;
        }

        // Create a sample timetable for CE semester 5
        const sampleTimetable = new Timetable({
            branch: ceBranch._id,
            semester: 5,
            academicYear: '2024-2025',
            schedule: [
                {
                    day: 'Monday',
                    timeSlots: [
                        {
                            startTime: '09:00',
                            endTime: '10:00',
                            subject: ceSubjects[0]._id,
                            room: 'CE-101',
                            type: 'lecture'
                        },
                        {
                            startTime: '10:00',
                            endTime: '11:00',
                            subject: ceSubjects[1] ? ceSubjects[1]._id : ceSubjects[0]._id,
                            room: 'CE-102',
                            type: 'lecture'
                        }
                    ]
                },
                {
                    day: 'Tuesday',
                    timeSlots: [
                        {
                            startTime: '09:00',
                            endTime: '10:00',
                            subject: ceSubjects[0]._id,
                            room: 'CE-103',
                            type: 'lecture'
                        }
                    ]
                },
                {
                    day: 'Wednesday',
                    timeSlots: [
                        {
                            startTime: '14:00',
                            endTime: '17:00',
                            subject: ceSubjects[1] ? ceSubjects[1]._id : ceSubjects[0]._id,
                            room: 'CE-Lab1',
                            type: 'lab'
                        }
                    ]
                }
            ],
            effectiveFrom: new Date(),
            isActive: true
        });

        await sampleTimetable.save();
        console.log('✅ Civil Engineering semester 5 timetable created successfully!');

        // Verify by fetching
        const verification = await Timetable.findById(sampleTimetable._id)
            .populate('branch', 'name code')
            .populate('schedule.timeSlots.subject', 'name code');
        
        console.log('📋 Created timetable verification:');
        console.log(`Branch: ${verification.branch.name} (${verification.branch.code})`);
        console.log(`Semester: ${verification.semester}`);
        console.log(`Academic Year: ${verification.academicYear}`);
        console.log('Schedule:');
        verification.schedule.forEach(day => {
            console.log(`  ${day.day}:`);
            day.timeSlots.forEach(slot => {
                console.log(`    ${slot.startTime}-${slot.endTime}: ${slot.subject.name} (${slot.subject.code}) - ${slot.room}`);
            });
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        mongoose.connection.close();
        console.log('Database connection closed');
    }
}

createCESemester5Timetable();
