const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./backend/models/User');
const Branch = require('./backend/models/Branch');
const Subject = require('./backend/models/Subject');
const Timetable = require('./backend/models/Timetable');

const verifyUpdate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for verification');

        // Check CE students
        const ceStudents = await User.find({ 
            role: 'student',
            semester: 3
        }).populate('branch');

        console.log('\n🎓 CE 3rd Semester Students:');
        ceStudents.forEach(student => {
            if (student.branch.code === 'CE') {
                console.log(`  - ${student.name}: ${student.email} (Semester ${student.semester})`);
            }
        });

        // Check CE 3rd semester subjects
        const ceSubjects = await Subject.find({ 
            semester: 3
        }).populate('branch');

        console.log('\n📚 CE 3rd Semester Subjects:');
        ceSubjects.forEach(subject => {
            if (subject.branch.code === 'CE') {
                console.log(`  - ${subject.code}: ${subject.name} (${subject.type})`);
            }
        });

        // Check CE 3rd semester timetable
        const ceTimetable = await Timetable.findOne({ 
            semester: 3
        }).populate('branch').populate('schedule.timeSlots.subject');

        if (ceTimetable && ceTimetable.branch.code === 'CE') {
            console.log('\n📅 CE 3rd Semester Timetable:');
            console.log(`  - Academic Year: ${ceTimetable.academicYear}`);
            console.log(`  - Days with classes: ${ceTimetable.schedule.length}`);
            
            ceTimetable.schedule.forEach(day => {
                console.log(`  - ${day.day}: ${day.timeSlots.length} classes`);
                day.timeSlots.forEach(slot => {
                    console.log(`    ${slot.startTime}-${slot.endTime}: ${slot.subject.name} (${slot.type})`);
                });
            });
        }

        console.log('\n✅ Verification completed successfully!');

    } catch (error) {
        console.error('Error during verification:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
};

verifyUpdate();
