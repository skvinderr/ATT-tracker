const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Subject = require('./backend/models/Subject');

const checkSubjects = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check S&I subject
        const siSubject = await Subject.findOne({ code: 'S&I' });
        if (siSubject) {
            console.log('\n✅ S&I Subject found:');
            console.log(`Name: ${siSubject.name}`);
            console.log(`Code: ${siSubject.code}`);
            console.log(`Description: ${siSubject.description}`);
        } else {
            console.log('❌ S&I subject not found');
        }

        // List all CE 3rd semester subjects
        const allSubjects = await Subject.find({ semester: 3 }).populate('branch');
        console.log('\n📚 All CE 3rd Semester Subjects:');
        allSubjects.forEach(subject => {
            if (subject.branch.code === 'CE') {
                console.log(`- ${subject.code}: ${subject.name}`);
            }
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
    }
};

checkSubjects();
