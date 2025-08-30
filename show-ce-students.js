// Show available Civil Engineering students
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./backend/models/User');
const Branch = require('./backend/models/Branch');

async function showCEStudents() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const ceStudents = await User.find({ role: 'student' }).populate('branch', 'code name');
        
        console.log('📚 Available Civil Engineering Students:');
        console.log('=' .repeat(50));
        
        const filteredStudents = ceStudents.filter(student => student.branch?.code === 'CE');
        
        if (filteredStudents.length === 0) {
            console.log('❌ No Civil Engineering students found');
        } else {
            filteredStudents.forEach((student, index) => {
                console.log(`${index + 1}. ${student.name}`);
                console.log(`   📧 Email: ${student.email}`);
                console.log(`   🔑 Password: Student123`);
                console.log(`   🏛️ Branch: ${student.branch.name} (${student.branch.code})`);
                console.log(`   📖 Semester: ${student.semester}`);
                console.log(`   🆔 Student ID: ${student.studentId}`);
                console.log();
            });
            
            console.log('🎯 To test the timetable:');
            console.log('1. Login with any of the above Civil Engineering student credentials');
            console.log('2. Navigate to the Timetable tab');
            console.log('3. You should see the Civil Engineering semester 5 schedule');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        mongoose.connection.close();
    }
}

showCEStudents();
