const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./backend/models/User');
const Branch = require('./backend/models/Branch');

async function createTestUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // First, create or find a branch
        let branch = await Branch.findOne({ code: 'CS' });
        if (!branch) {
            branch = await Branch.create({
                name: 'Computer Science',
                code: 'CS',
                description: 'Computer Science Engineering',
                department: 'Engineering',
                totalSemesters: 8
            });
            console.log('Created test branch:', branch.code);
        }

        // Check if test user already exists
        const existingUser = await User.findOne({ email: 'test@college.edu' });
        if (existingUser) {
            console.log('Test user already exists');
            process.exit(0);
        }

        // Create test user
        const testUser = await User.create({
            name: 'Test Student',
            email: 'test@college.edu',
            password: 'password123',
            studentId: 'CS2025001',
            role: 'student',
            branch: branch._id,
            semester: 5
        });

        console.log('Test user created successfully:', {
            name: testUser.name,
            email: testUser.email,
            studentId: testUser.studentId,
            role: testUser.role,
            semester: testUser.semester
        });

    } catch (error) {
        console.error('Error creating test user:', error.message);
    } finally {
        mongoose.disconnect();
        process.exit(0);
    }
}

createTestUser();
