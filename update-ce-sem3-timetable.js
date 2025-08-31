const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./backend/models/User');
const Branch = require('./backend/models/Branch');
const Subject = require('./backend/models/Subject');
const Timetable = require('./backend/models/Timetable');

// Civil Engineering 3rd Semester Subjects based on the provided timetable
const ce3rdSemSubjects = [
    {
        name: 'Engineering Mechanics',
        code: 'EM',
        semester: 3,
        credits: 4,
        type: 'theory',
        faculty: {
            name: 'Dr. SH Sharma',
            email: 'sh.sharma@college.edu',
            phone: '9876543230',
            department: 'Civil Engineering'
        },
        description: 'Study of forces and their effects on structures',
        room: 'CE-201'
    },
    {
        name: 'Surveying and Geomatics',
        code: 'SUR&GEO',
        semester: 3,
        credits: 4,
        type: 'theory',
        faculty: {
            name: 'Prof. RA Rajesh',
            email: 'ra.rajesh@college.edu',
            phone: '9876543231',
            department: 'Civil Engineering'
        },
        description: 'Land surveying principles and modern geomatics',
        room: 'CE-202'
    },
    {
        name: 'Fluid Mechanics',
        code: 'FM',
        semester: 3,
        credits: 4,
        type: 'theory',
        faculty: {
            name: 'Dr. HKG Hegde',
            email: 'hkg.hegde@college.edu',
            phone: '9876543232',
            department: 'Civil Engineering'
        },
        description: 'Properties and behavior of fluids in motion and at rest',
        room: 'CE-203'
    },
    {
        name: 'Sensor and Instrumentation',
        code: 'S&I',
        semester: 3,
        credits: 4,
        type: 'theory',
        faculty: {
            name: 'Prof. SK Singh',
            email: 'sk.singh@college.edu',
            phone: '9876543233',
            department: 'Civil Engineering'
        },
        description: 'Sensor technology and instrumentation systems',
        room: 'CE-204'
    },
    {
        name: 'Computer Science',
        code: 'CS',
        semester: 3,
        credits: 3,
        type: 'theory',
        faculty: {
            name: 'Dr. SU Suman',
            email: 'su.suman@college.edu',
            phone: '9876543234',
            department: 'Computer Science'
        },
        description: 'Programming and computational methods for engineers',
        room: 'CS-101'
    },
    {
        name: 'Universal Human Values',
        code: 'UHV',
        semester: 3,
        credits: 2,
        type: 'theory',
        faculty: {
            name: 'Prof. AK Anil',
            email: 'ak.anil@college.edu',
            phone: '9876543235',
            department: 'Humanities'
        },
        description: 'Ethics, values and human relationships',
        room: 'HU-101'
    },
    {
        name: 'Geotechnical Engineering Lab',
        code: 'GEOTECH',
        semester: 3,
        credits: 2,
        type: 'practical',
        faculty: {
            name: 'Dr. VG Verma',
            email: 'vg.verma@college.edu',
            phone: '9876543236',
            department: 'Civil Engineering'
        },
        description: 'Soil mechanics and foundation engineering lab',
        room: 'CE-Lab1'
    },
    {
        name: 'Computer Aided Design Lab',
        code: 'CAD',
        semester: 3,
        credits: 2,
        type: 'practical',
        faculty: {
            name: 'Prof. CH Chandra',
            email: 'ch.chandra@college.edu',
            phone: '9876543237',
            department: 'Civil Engineering'
        },
        description: 'AutoCAD and design software for civil engineers',
        room: 'CE-Lab2'
    },
    {
        name: 'Building Planning and Drawing Lab',
        code: 'BPD',
        semester: 3,
        credits: 2,
        type: 'practical',
        faculty: {
            name: 'Ar. SH Sharma',
            email: 'sh.arch@college.edu',
            phone: '9876543238',
            department: 'Civil Engineering'
        },
        description: 'Architectural drawing and building planning',
        room: 'CE-Lab3'
    },
    {
        name: 'Project Work and SEAA',
        code: 'PROJECT1',
        semester: 3,
        credits: 2,
        type: 'project',
        faculty: {
            name: 'Prof. Multi Faculty',
            email: 'projects@college.edu',
            phone: '9876543239',
            department: 'Civil Engineering'
        },
        description: 'Project work and Self Employed Activity and Awareness',
        room: 'CE-Project'
    }
];

// CE 3rd Semester Timetable based on the provided schedule
const ce3rdSemTimetable = {
    semester: 3,
    schedule: [
        {
            day: 'Monday',
            timeSlots: [
                {
                    startTime: '09:30',
                    endTime: '10:20',
                    subject: null, // Will be set after subject creation
                    subjectCode: 'EM',
                    room: 'CE-201',
                    faculty: 'Dr. SH Sharma',
                    type: 'lecture'
                },
                {
                    startTime: '10:20',
                    endTime: '11:10',
                    subject: null,
                    subjectCode: 'SUR&GEO',
                    room: 'CE-202',
                    faculty: 'Prof. RA Rajesh',
                    type: 'lecture'
                },
                {
                    startTime: '11:10',
                    endTime: '12:00',
                    subject: null,
                    subjectCode: 'FM',
                    room: 'CE-203',
                    faculty: 'Dr. HKG Hegde',
                    type: 'lecture'
                },
                {
                    startTime: '12:00',
                    endTime: '12:50',
                    subject: null,
                    subjectCode: 'S&I',
                    room: 'CE-204',
                    faculty: 'Prof. SK Singh',
                    type: 'lecture'
                },
                {
                    startTime: '14:00',
                    endTime: '14:50',
                    subject: null,
                    subjectCode: 'SUR&GEO',
                    room: 'CE-Lab1',
                    faculty: 'Prof. VG/RA',
                    type: 'lab'
                },
                {
                    startTime: '14:50',
                    endTime: '15:40',
                    subject: null,
                    subjectCode: 'BPD',
                    room: 'CE-Lab3',
                    faculty: 'Ar. SH Sharma',
                    type: 'lab'
                }
            ]
        },
        {
            day: 'Tuesday',
            timeSlots: [
                {
                    startTime: '09:30',
                    endTime: '10:20',
                    subject: null,
                    subjectCode: 'S&I',
                    room: 'CE-204',
                    faculty: 'Prof. SK Singh',
                    type: 'lecture'
                },
                {
                    startTime: '10:20',
                    endTime: '11:10',
                    subject: null,
                    subjectCode: 'SUR&GEO',
                    room: 'CE-202',
                    faculty: 'Prof. RA Rajesh',
                    type: 'lecture'
                },
                {
                    startTime: '11:10',
                    endTime: '12:00',
                    subject: null,
                    subjectCode: 'UHV',
                    room: 'HU-101',
                    faculty: 'Prof. AK Anil',
                    type: 'lecture'
                },
                {
                    startTime: '12:00',
                    endTime: '12:50',
                    subject: null,
                    subjectCode: 'EM',
                    room: 'CE-201',
                    faculty: 'Dr. SH Sharma',
                    type: 'lecture'
                },
                {
                    startTime: '14:00',
                    endTime: '14:50',
                    subject: null,
                    subjectCode: 'SUR&GEO',
                    room: 'CE-Lab1',
                    faculty: 'Prof. VG/RA',
                    type: 'lab'
                },
                {
                    startTime: '14:50',
                    endTime: '15:40',
                    subject: null,
                    subjectCode: 'FM',
                    room: 'CE-Lab2',
                    faculty: 'Dr. CH/HKG',
                    type: 'lab'
                }
            ]
        },
        {
            day: 'Wednesday',
            timeSlots: [
                {
                    startTime: '09:30',
                    endTime: '10:20',
                    subject: null,
                    subjectCode: 'S&I',
                    room: 'CE-204',
                    faculty: 'Prof. SK Singh',
                    type: 'lecture'
                },
                {
                    startTime: '10:20',
                    endTime: '11:10',
                    subject: null,
                    subjectCode: 'SUR&GEO',
                    room: 'CE-202',
                    faculty: 'Prof. RA Rajesh',
                    type: 'lecture'
                },
                {
                    startTime: '11:10',
                    endTime: '12:00',
                    subject: null,
                    subjectCode: 'FM',
                    room: 'CE-203',
                    faculty: 'Dr. HKG Hegde',
                    type: 'lecture'
                },
                {
                    startTime: '12:00',
                    endTime: '12:50',
                    subject: null,
                    subjectCode: 'CS',
                    room: 'CS-101',
                    faculty: 'Dr. SU Suman',
                    type: 'lecture'
                },
                {
                    startTime: '14:00',
                    endTime: '14:50',
                    subject: null,
                    subjectCode: 'GEOTECH',
                    room: 'CE-Lab1',
                    faculty: 'Dr. VG/BP',
                    type: 'lab'
                },
                {
                    startTime: '14:50',
                    endTime: '15:40',
                    subject: null,
                    subjectCode: 'CAD',
                    room: 'CE-Lab2',
                    faculty: 'Prof. SH/CH',
                    type: 'lab'
                }
            ]
        },
        {
            day: 'Thursday',
            timeSlots: [
                {
                    startTime: '09:30',
                    endTime: '10:20',
                    subject: null,
                    subjectCode: 'CS',
                    room: 'CS-101',
                    faculty: 'Dr. SU Suman',
                    type: 'lecture'
                },
                {
                    startTime: '10:20',
                    endTime: '11:10',
                    subject: null,
                    subjectCode: 'SUR&GEO',
                    room: 'CE-202',
                    faculty: 'Prof. RA Rajesh',
                    type: 'tutorial'
                },
                {
                    startTime: '11:10',
                    endTime: '12:00',
                    subject: null,
                    subjectCode: 'S&I',
                    room: 'CE-204',
                    faculty: 'Prof. SK Singh',
                    type: 'tutorial'
                },
                {
                    startTime: '12:00',
                    endTime: '12:50',
                    subject: null,
                    subjectCode: 'UHV',
                    room: 'HU-101',
                    faculty: 'Prof. AK Anil',
                    type: 'lecture'
                },
                {
                    startTime: '14:00',
                    endTime: '14:50',
                    subject: null,
                    subjectCode: 'GEOTECH',
                    room: 'CE-Lab1',
                    faculty: 'Dr. VG/BP',
                    type: 'lab'
                },
                {
                    startTime: '14:50',
                    endTime: '15:40',
                    subject: null,
                    subjectCode: 'CAD',
                    room: 'CE-Lab2',
                    faculty: 'Prof. SH/CH',
                    type: 'lab'
                }
            ]
        },
        {
            day: 'Friday',
            timeSlots: [
                {
                    startTime: '10:20',
                    endTime: '11:10',
                    subject: null,
                    subjectCode: 'EM',
                    room: 'CE-201',
                    faculty: 'Dr. SH Sharma',
                    type: 'lecture'
                },
                {
                    startTime: '11:10',
                    endTime: '12:00',
                    subject: null,
                    subjectCode: 'FM',
                    room: 'CE-203',
                    faculty: 'Dr. HKG Hegde',
                    type: 'lecture'
                },
                {
                    startTime: '14:00',
                    endTime: '14:50',
                    subject: null,
                    subjectCode: 'FM',
                    room: 'CE-Lab2',
                    faculty: 'Dr. CH/HKG',
                    type: 'lab'
                },
                {
                    startTime: '14:50',
                    endTime: '15:40',
                    subject: null,
                    subjectCode: 'BPD',
                    room: 'CE-Lab3',
                    faculty: 'Ar. SH Sharma',
                    type: 'lab'
                }
            ]
        },
        {
            day: 'Saturday',
            timeSlots: [
                {
                    startTime: '10:20',
                    endTime: '11:10',
                    subject: null,
                    subjectCode: 'EM',
                    room: 'CE-201',
                    faculty: 'Dr. SH Sharma',
                    type: 'lecture'
                },
                {
                    startTime: '11:10',
                    endTime: '12:00',
                    subject: null,
                    subjectCode: 'UHV',
                    room: 'HU-101',
                    faculty: 'Prof. AK Anil',
                    type: 'lecture'
                },
                {
                    startTime: '14:50',
                    endTime: '15:40',
                    subject: null,
                    subjectCode: 'PROJECT1',
                    room: 'CE-Project',
                    faculty: 'Prof. Multi Faculty',
                    type: 'seminar'
                }
            ]
        }
    ]
};

const updateCE3rdSemester = async () => {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for CE 3rd Semester update');

        // Find Civil Engineering branch
        const ceBranch = await Branch.findOne({ code: 'CE' });
        if (!ceBranch) {
            console.log('Civil Engineering branch not found');
            return;
        }
        console.log('Found Civil Engineering branch:', ceBranch.name);

        // Delete existing CE 3rd semester subjects and timetable
        console.log('Removing existing CE 3rd semester data...');
        await Subject.deleteMany({ branch: ceBranch._id, semester: 3 });
        await Timetable.deleteMany({ branch: ceBranch._id, semester: 3 });

        // Create CE 3rd semester subjects
        console.log('Creating CE 3rd semester subjects...');
        const subjectsWithBranch = ce3rdSemSubjects.map(subject => ({
            ...subject,
            branch: ceBranch._id
        }));
        
        const createdSubjects = await Subject.create(subjectsWithBranch);
        console.log(`Created ${createdSubjects.length} subjects for CE 3rd semester`);

        // Create subject code to ID mapping
        const subjectMap = {};
        createdSubjects.forEach(subject => {
            subjectMap[subject.code] = subject._id;
        });

        // Update timetable with subject IDs
        const updatedSchedule = ce3rdSemTimetable.schedule.map(day => ({
            ...day,
            timeSlots: day.timeSlots.map(slot => ({
                ...slot,
                subject: subjectMap[slot.subjectCode]
            }))
        }));

        // Create CE 3rd semester timetable
        console.log('Creating CE 3rd semester timetable...');
        const timetableData = {
            branch: ceBranch._id,
            semester: ce3rdSemTimetable.semester,
            schedule: updatedSchedule,
            academicYear: '2024-2025',
            effectiveFrom: new Date(),
            isActive: true
        };

        const createdTimetable = await Timetable.create(timetableData);
        console.log('CE 3rd semester timetable created successfully');

        // Update all CE students to semester 3
        console.log('Updating CE students to semester 3...');
        const updateResult = await User.updateMany(
            { branch: ceBranch._id, role: 'student' },
            { $set: { semester: 3 } }
        );
        console.log(`Updated ${updateResult.modifiedCount} CE students to semester 3`);

        // Create additional CE 3rd semester students if needed
        console.log('Creating additional CE 3rd semester students...');
        const existingStudents = await User.find({ branch: ceBranch._id, role: 'student' });
        
        if (existingStudents.length < 5) {
            const additionalStudents = [];
            for (let i = existingStudents.length + 1; i <= 5; i++) {
                const studentData = {
                    name: `CE Student ${i}`,
                    email: `studentce${i}@college.edu`,
                    password: 'Student123',
                    phone: `98765432${30 + i}`.slice(-10),
                    role: 'student',
                    branch: ceBranch._id,
                    semester: 3,
                    studentId: `CE24${String(i).padStart(3, '0')}`,
                    isVerified: true
                };
                additionalStudents.push(studentData);
            }
            
            if (additionalStudents.length > 0) {
                await User.create(additionalStudents);
                console.log(`Created ${additionalStudents.length} additional CE 3rd semester students`);
            }
        }

        console.log('\n✅ CE 3rd Semester Update completed successfully!');
        console.log('\n📋 Updated Login Credentials:');
        console.log('👨‍💼 Admin: admin@college.edu / Admin123');
        
        const ceStudents = await User.find({ branch: ceBranch._id, role: 'student' });
        ceStudents.forEach((student, index) => {
            console.log(`🎓 CE Student ${index + 1}: ${student.email} / Student123`);
        });

        console.log('\n📚 Subjects created for CE 3rd Semester:');
        createdSubjects.forEach(subject => {
            console.log(`- ${subject.code}: ${subject.name} (${subject.type})`);
        });

        console.log('\n📅 Timetable created with classes Monday to Saturday');
        console.log('🎯 All CE students are now in semester 3 with the new timetable');

    } catch (error) {
        console.error('Error updating CE 3rd semester:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
};

// Run the update
updateCE3rdSemester();
