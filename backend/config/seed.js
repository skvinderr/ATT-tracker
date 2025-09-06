const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();


// Import models
const User = require('../models/User');
const Branch = require('../models/Branch');
const Subject = require('../models/Subject');
const Timetable = require('../models/Timetable');
const AcademicCalendar = require('../models/AcademicCalendar');

// Sample data
const branchesData = [
    {
        name: 'Computer Science Engineering',
        code: 'CSE',
        description: 'Computer Science and Engineering program covering software development, algorithms, and computer systems.',
        department: 'Computer Science',
        establishedYear: 2005,
        headOfDepartment: {
            name: 'Dr. Rajesh Kumar',
            email: 'hod.cse@college.edu',
            phone: '9876543210'
        }
    },
    {
        name: 'Electronics and Communication Engineering',
        code: 'ECE',
        description: 'Electronics and Communication Engineering program focusing on electronic systems and communication technologies.',
        department: 'Electronics',
        establishedYear: 2003,
        headOfDepartment: {
            name: 'Prof. Priya Sharma',
            email: 'hod.ece@college.edu',
            phone: '9876543211'
        }
    },
    {
        name: 'Mechanical Engineering',
        code: 'ME',
        description: 'Mechanical Engineering program covering design, manufacturing, and thermal systems.',
        department: 'Mechanical',
        establishedYear: 2000,
        headOfDepartment: {
            name: 'Dr. Amit Singh',
            email: 'hod.me@college.edu',
            phone: '9876543212'
        }
    },
    {
        name: 'Civil Engineering',
        code: 'CE',
        description: 'Civil Engineering program focusing on construction, infrastructure, and environmental engineering.',
        department: 'Civil',
        establishedYear: 1998,
        headOfDepartment: {
            name: 'Prof. Sunita Gupta',
            email: 'hod.ce@college.edu',
            phone: '9876543213'
        }
    },
    {
        name: 'Information Technology',
        code: 'IT',
        description: 'Information Technology program specializing in software development and IT infrastructure.',
        department: 'Information Technology',
        establishedYear: 2010,
        headOfDepartment: {
            name: 'Dr. Kiran Patel',
            email: 'hod.it@college.edu',
            phone: '9876543214'
        }
    }
];

const seedDatabase = async () => {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for seeding');

        // Clear existing data
        console.log('Clearing existing data...');
        await User.deleteMany({});
        await Branch.deleteMany({});
        await Subject.deleteMany({});
        await Timetable.deleteMany({});
        await AcademicCalendar.deleteMany({});

        // Create branches
        console.log('Creating branches...');
        const branches = await Branch.create(branchesData);
        console.log(`Created ${branches.length} branches`);

        // Create admin user
        console.log('Creating admin user...');
        const adminUser = await User.create({
            name: 'System Administrator',
            email: 'admin@college.edu',
            password: 'Admin123',
            role: 'admin',
            isVerified: true
        });
        console.log('Admin user created');

        // Create sample students
        console.log('Creating sample students...');
        const students = [];
        
        for (const branch of branches) {
            // Create 3 students for each branch in semester 5
            for (let i = 1; i <= 3; i++) {
                const studentData = {
                    name: `Student ${branch.code}${i}`,
                    email: `student${branch.code.toLowerCase()}${i}@college.edu`,
                    password: 'Student123',
                    phone: `98765432${branch.code.charCodeAt(0) + i}`.slice(-10),
                    role: 'student',
                    branch: branch._id,
                    semester: 5,
                    studentId: `${branch.code}24${String(i).padStart(3, '0')}`,
                    isVerified: true
                };
                
                const student = await User.create(studentData);
                students.push(student);
            }
        }
        console.log(`Created ${students.length} sample students`);

        // Create subjects for CSE branch, semester 5
        const cseBranch = branches.find(b => b.code === 'CSE');
        if (cseBranch) {
            console.log('Creating CSE subjects...');
            const cseSubjects = [
                {
                    name: 'Data Structures and Algorithms',
                    code: 'CS501',
                    branch: cseBranch._id,
                    semester: 5,
                    credits: 4,
                    type: 'theory',
                    faculty: {
                        name: 'Dr. Sarah Johnson',
                        email: 'sarah.johnson@college.edu',
                        phone: '9876543220',
                        department: 'Computer Science'
                    },
                    description: 'Advanced data structures and algorithm analysis',
                    room: 'CS-101'
                },
                {
                    name: 'Database Management Systems',
                    code: 'CS502',
                    branch: cseBranch._id,
                    semester: 5,
                    credits: 3,
                    type: 'theory',
                    faculty: {
                        name: 'Prof. Michael Brown',
                        email: 'michael.brown@college.edu',
                        phone: '9876543221',
                        department: 'Computer Science'
                    },
                    description: 'Database design, SQL, and database administration',
                    room: 'CS-102'
                },
                {
                    name: 'Computer Networks',
                    code: 'CS503',
                    branch: cseBranch._id,
                    semester: 5,
                    credits: 3,
                    type: 'theory',
                    faculty: {
                        name: 'Dr. Lisa Wang',
                        email: 'lisa.wang@college.edu',
                        phone: '9876543222',
                        department: 'Computer Science'
                    },
                    description: 'Network protocols, architecture, and security',
                    room: 'CS-103'
                },
                {
                    name: 'Operating Systems',
                    code: 'CS504',
                    branch: cseBranch._id,
                    semester: 5,
                    credits: 4,
                    type: 'theory',
                    faculty: {
                        name: 'Prof. David Wilson',
                        email: 'david.wilson@college.edu',
                        phone: '9876543223',
                        department: 'Computer Science'
                    },
                    description: 'OS concepts, process management, and memory management',
                    room: 'CS-104'
                },
                {
                    name: 'Software Engineering',
                    code: 'CS505',
                    branch: cseBranch._id,
                    semester: 5,
                    credits: 3,
                    type: 'theory',
                    faculty: {
                        name: 'Dr. Emily Davis',
                        email: 'emily.davis@college.edu',
                        phone: '9876543224',
                        department: 'Computer Science'
                    },
                    description: 'Software development lifecycle and project management',
                    room: 'CS-105'
                },
                {
                    name: 'Database Lab',
                    code: 'CS506',
                    branch: cseBranch._id,
                    semester: 5,
                    credits: 2,
                    type: 'practical',
                    faculty: {
                        name: 'Prof. Michael Brown',
                        email: 'michael.brown@college.edu',
                        phone: '9876543221',
                        department: 'Computer Science'
                    },
                    description: 'Hands-on database implementation and management',
                    room: 'CS-Lab1'
                }
            ];

            const subjects = await Subject.create(cseSubjects);
            console.log(`Created ${subjects.length} CSE subjects`);

            // Create subjects for Civil Engineering branch
            const civilBranch = branches.find(b => b.code === 'CE');
            if (civilBranch) {
                console.log('Creating Civil Engineering subjects...');
                const civilSubjects = [
                    // Semester 3 subjects
                    {
                        name: 'Engineering Mechanics',
                        code: 'CE301',
                        branch: civilBranch._id,
                        semester: 3,
                        credits: 4,
                        type: 'theory',
                        faculty: {
                            name: 'Dr. Rajesh Verma',
                            email: 'rajesh.verma@college.edu',
                            phone: '9876543301',
                            department: 'Civil Engineering'
                        },
                        description: 'Statics and dynamics of engineering structures',
                        room: 'CE-101'
                    },
                    {
                        name: 'Survey and Geo',
                        code: 'CE302',
                        branch: civilBranch._id,
                        semester: 3,
                        credits: 3,
                        type: 'theory',
                        faculty: {
                            name: 'Prof. Geeta Sharma',
                            email: 'geeta.sharma@college.edu',
                            phone: '9876543302',
                            department: 'Civil Engineering'
                        },
                        description: 'Surveying techniques and geological engineering',
                        room: 'CE-102'
                    },
                    {
                        name: 'Fluid Mechanics',
                        code: 'CE303',
                        branch: civilBranch._id,
                        semester: 3,
                        credits: 4,
                        type: 'theory',
                        faculty: {
                            name: 'Dr. Amit Kumar',
                            email: 'amit.kumar@college.edu',
                            phone: '9876543303',
                            department: 'Civil Engineering'
                        },
                        description: 'Fluid properties, flow analysis, and hydraulics',
                        room: 'CE-103'
                    },
                    {
                        name: 'Sensor',
                        code: 'CE304',
                        branch: civilBranch._id,
                        semester: 3,
                        credits: 3,
                        type: 'theory',
                        faculty: {
                            name: 'Prof. Priya Singh',
                            email: 'priya.singh@college.edu',
                            phone: '9876543304',
                            department: 'Civil Engineering'
                        },
                        description: 'Sensor technology and applications in civil engineering',
                        room: 'CE-104'
                    },
                    {
                        name: 'UHV',
                        code: 'CE305',
                        branch: civilBranch._id,
                        semester: 3,
                        credits: 2,
                        type: 'theory',
                        faculty: {
                            name: 'Dr. Kavita Sharma',
                            email: 'kavita.sharma@college.edu',
                            phone: '9876543305',
                            department: 'Civil Engineering'
                        },
                        description: 'Universal Human Values and professional ethics',
                        room: 'CE-105'
                    },
                    {
                        name: 'Cyber Security',
                        code: 'CE306',
                        branch: civilBranch._id,
                        semester: 3,
                        credits: 3,
                        type: 'theory',
                        faculty: {
                            name: 'Prof. Ankit Gupta',
                            email: 'ankit.gupta@college.edu',
                            phone: '9876543306',
                            department: 'Civil Engineering'
                        },
                        description: 'Cybersecurity fundamentals and digital safety',
                        room: 'CE-106'
                    },
                    {
                        name: 'Survey Lab',
                        code: 'CE307',
                        branch: civilBranch._id,
                        semester: 3,
                        credits: 2,
                        type: 'practical',
                        faculty: {
                            name: 'Prof. Geeta Sharma',
                            email: 'geeta.sharma@college.edu',
                            phone: '9876543302',
                            department: 'Civil Engineering'
                        },
                        description: 'Practical surveying exercises and field work',
                        room: 'CE-Lab1'
                    },
                    {
                        name: 'FM Lab',
                        code: 'CE308',
                        branch: civilBranch._id,
                        semester: 3,
                        credits: 2,
                        type: 'practical',
                        faculty: {
                            name: 'Dr. Amit Kumar',
                            email: 'amit.kumar@college.edu',
                            phone: '9876543303',
                            department: 'Civil Engineering'
                        },
                        description: 'Fluid mechanics laboratory experiments',
                        room: 'CE-Lab2'
                    },
                    {
                        name: 'BPD Lab',
                        code: 'CE309',
                        branch: civilBranch._id,
                        semester: 3,
                        credits: 2,
                        type: 'practical',
                        faculty: {
                            name: 'Prof. Priya Singh',
                            email: 'priya.singh@college.edu',
                            phone: '9876543304',
                            department: 'Civil Engineering'
                        },
                        description: 'Basic Project Development laboratory',
                        room: 'CE-Lab3'
                    },
                    // Semester 5 subjects
                    {
                        name: 'Structural Analysis',
                        code: 'CE501',
                        branch: civilBranch._id,
                        semester: 5,
                        credits: 4,
                        type: 'theory',
                        faculty: {
                            name: 'Dr. Rajesh Verma',
                            email: 'rajesh.verma@college.edu',
                            phone: '9876543301',
                            department: 'Civil Engineering'
                        },
                        description: 'Statics and dynamics of engineering structures',
                        room: 'CE-101'
                    },
                    {
                        name: 'Survey and Geo',
                        code: 'CE502',
                        branch: civilBranch._id,
                        semester: 5,
                        credits: 3,
                        type: 'theory',
                        faculty: {
                            name: 'Prof. Geeta Sharma',
                            email: 'geeta.sharma@college.edu',
                            phone: '9876543302',
                            department: 'Civil Engineering'
                        },
                        description: 'Surveying techniques and geological engineering',
                        room: 'CE-102'
                    },
                    {
                        name: 'Fluid Mechanics',
                        code: 'CE503',
                        branch: civilBranch._id,
                        semester: 5,
                        credits: 4,
                        type: 'theory',
                        faculty: {
                            name: 'Dr. Amit Kumar',
                            email: 'amit.kumar@college.edu',
                            phone: '9876543303',
                            department: 'Civil Engineering'
                        },
                        description: 'Fluid properties, flow analysis, and hydraulics',
                        room: 'CE-103'
                    },
                    {
                        name: 'Sensor',
                        code: 'CE504',
                        branch: civilBranch._id,
                        semester: 5,
                        credits: 3,
                        type: 'theory',
                        faculty: {
                            name: 'Prof. Priya Singh',
                            email: 'priya.singh@college.edu',
                            phone: '9876543304',
                            department: 'Civil Engineering'
                        },
                        description: 'Sensor technology and instrumentation in civil engineering',
                        room: 'CE-104'
                    },
                    {
                        name: 'UHV',
                        code: 'CE505',
                        branch: civilBranch._id,
                        semester: 5,
                        credits: 2,
                        type: 'theory',
                        faculty: {
                            name: 'Dr. Sunita Gupta',
                            email: 'sunita.gupta@college.edu',
                            phone: '9876543305',
                            department: 'Civil Engineering'
                        },
                        description: 'Universal Human Values and Ethics',
                        room: 'CE-105'
                    },
                    {
                        name: 'Cyber Security',
                        code: 'CE506',
                        branch: civilBranch._id,
                        semester: 5,
                        credits: 3,
                        type: 'theory',
                        faculty: {
                            name: 'Prof. Vivek Pandey',
                            email: 'vivek.pandey@college.edu',
                            phone: '9876543306',
                            department: 'Civil Engineering'
                        },
                        description: 'Cybersecurity principles and applications in civil engineering',
                        room: 'CE-106'
                    },
                    {
                        name: 'Survey Lab',
                        code: 'CE507',
                        branch: civilBranch._id,
                        semester: 5,
                        credits: 2,
                        type: 'practical',
                        faculty: {
                            name: 'Prof. Geeta Sharma',
                            email: 'geeta.sharma@college.edu',
                            phone: '9876543302',
                            department: 'Civil Engineering'
                        },
                        description: 'Practical surveying techniques and field work',
                        room: 'CE-Lab1'
                    },
                    {
                        name: 'FM Lab',
                        code: 'CE508',
                        branch: civilBranch._id,
                        semester: 5,
                        credits: 2,
                        type: 'practical',
                        faculty: {
                            name: 'Dr. Amit Kumar',
                            email: 'amit.kumar@college.edu',
                            phone: '9876543303',
                            department: 'Civil Engineering'
                        },
                        description: 'Fluid mechanics laboratory experiments',
                        room: 'CE-Lab2'
                    },
                    {
                        name: 'BPD Lab',
                        code: 'CE509',
                        branch: civilBranch._id,
                        semester: 5,
                        credits: 2,
                        type: 'practical',
                        faculty: {
                            name: 'Prof. Anita Joshi',
                            email: 'anita.joshi@college.edu',
                            phone: '9876543307',
                            department: 'Civil Engineering'
                        },
                        description: 'Building Planning and Design laboratory',
                        room: 'CE-Lab3'
                    }
                ];

                const civilSubjectsCreated = await Subject.create(civilSubjects);
                console.log(`Created ${civilSubjectsCreated.length} Civil Engineering subjects`);

                // Create timetable for Civil Engineering semester 5
                console.log('Creating Civil Engineering timetable...');
                const civilTimetableData = {
                    branch: civilBranch._id,
                    semester: 5,
                    academicYear: '2024-2025',
                    effectiveFrom: new Date('2024-08-01'),
                    schedule: [
                        {
                            day: 'Monday',
                            timeSlots: [
                                { startTime: '09:00', endTime: '10:00', subject: civilSubjectsCreated[0]._id, room: 'CE-101', type: 'lecture' },
                                { startTime: '10:00', endTime: '11:00', subject: civilSubjectsCreated[1]._id, room: 'CE-102', type: 'lecture' },
                                { startTime: '11:00', endTime: '12:00', subject: civilSubjectsCreated[2]._id, room: 'CE-103', type: 'lecture' },
                                { startTime: '14:00', endTime: '17:00', subject: civilSubjectsCreated[6]._id, room: 'CE-Lab1', type: 'lab' }
                            ]
                        },
                        {
                            day: 'Tuesday',
                            timeSlots: [
                                { startTime: '09:00', endTime: '10:00', subject: civilSubjectsCreated[3]._id, room: 'CE-104', type: 'lecture' },
                                { startTime: '10:00', endTime: '11:00', subject: civilSubjectsCreated[4]._id, room: 'CE-105', type: 'lecture' },
                                { startTime: '11:00', endTime: '12:00', subject: civilSubjectsCreated[5]._id, room: 'CE-106', type: 'lecture' },
                                { startTime: '14:00', endTime: '17:00', subject: civilSubjectsCreated[7]._id, room: 'CE-Lab2', type: 'lab' }
                            ]
                        },
                        {
                            day: 'Wednesday',
                            timeSlots: [
                                { startTime: '09:00', endTime: '10:00', subject: civilSubjectsCreated[0]._id, room: 'CE-101', type: 'lecture' },
                                { startTime: '10:00', endTime: '11:00', subject: civilSubjectsCreated[2]._id, room: 'CE-103', type: 'lecture' },
                                { startTime: '11:00', endTime: '12:00', subject: civilSubjectsCreated[1]._id, room: 'CE-102', type: 'lecture' }
                            ]
                        },
                        {
                            day: 'Thursday',
                            timeSlots: [
                                { startTime: '09:00', endTime: '10:00', subject: civilSubjectsCreated[3]._id, room: 'CE-104', type: 'lecture' },
                                { startTime: '10:00', endTime: '11:00', subject: civilSubjectsCreated[5]._id, room: 'CE-106', type: 'lecture' },
                                { startTime: '14:00', endTime: '17:00', subject: civilSubjectsCreated[8]._id, room: 'CE-Lab3', type: 'lab' }
                            ]
                        },
                        {
                            day: 'Friday',
                            timeSlots: [
                                { startTime: '09:00', endTime: '10:00', subject: civilSubjectsCreated[0]._id, room: 'CE-101', type: 'lecture' },
                                { startTime: '10:00', endTime: '11:00', subject: civilSubjectsCreated[2]._id, room: 'CE-103', type: 'lecture' },
                                { startTime: '11:00', endTime: '12:00', subject: civilSubjectsCreated[4]._id, room: 'CE-105', type: 'lecture' }
                            ]
                        },
                        {
                            day: 'Saturday',
                            timeSlots: []
                        },
                        {
                            day: 'Sunday',
                            timeSlots: []
                        }
                    ]
                };

                const civilTimetable = await Timetable.create(civilTimetableData);
                console.log('Civil Engineering timetable created');
            }

            // Create timetable for CSE semester 5
            console.log('Creating CSE timetable...');
            const timetableData = {
                branch: cseBranch._id,
                semester: 5,
                academicYear: '2024-2025',
                effectiveFrom: new Date('2024-08-01'),
                schedule: [
                    {
                        day: 'Monday',
                        timeSlots: [
                            { startTime: '09:00', endTime: '10:00', subject: subjects[0]._id, room: 'CS-101', type: 'lecture' },
                            { startTime: '10:00', endTime: '11:00', subject: subjects[1]._id, room: 'CS-102', type: 'lecture' },
                            { startTime: '11:00', endTime: '12:00', subject: subjects[2]._id, room: 'CS-103', type: 'lecture' }
                        ]
                    },
                    {
                        day: 'Tuesday',
                        timeSlots: [
                            { startTime: '09:00', endTime: '10:00', subject: subjects[3]._id, room: 'CS-104', type: 'lecture' },
                            { startTime: '10:00', endTime: '11:00', subject: subjects[4]._id, room: 'CS-105', type: 'lecture' },
                            { startTime: '14:00', endTime: '17:00', subject: subjects[5]._id, room: 'CS-Lab1', type: 'lab' }
                        ]
                    },
                    {
                        day: 'Wednesday',
                        timeSlots: [
                            { startTime: '09:00', endTime: '10:00', subject: subjects[0]._id, room: 'CS-101', type: 'lecture' },
                            { startTime: '11:00', endTime: '12:00', subject: subjects[1]._id, room: 'CS-102', type: 'lecture' }
                        ]
                    },
                    {
                        day: 'Thursday',
                        timeSlots: [
                            { startTime: '09:00', endTime: '10:00', subject: subjects[2]._id, room: 'CS-103', type: 'lecture' },
                            { startTime: '10:00', endTime: '11:00', subject: subjects[3]._id, room: 'CS-104', type: 'lecture' },
                            { startTime: '11:00', endTime: '12:00', subject: subjects[4]._id, room: 'CS-105', type: 'lecture' }
                        ]
                    },
                    {
                        day: 'Friday',
                        timeSlots: [
                            { startTime: '09:00', endTime: '10:00', subject: subjects[0]._id, room: 'CS-101', type: 'lecture' },
                            { startTime: '10:00', endTime: '11:00', subject: subjects[1]._id, room: 'CS-102', type: 'lecture' }
                        ]
                    },
                    {
                        day: 'Saturday',
                        timeSlots: []
                    },
                    {
                        day: 'Sunday',
                        timeSlots: []
                    }
                ]
            };

            const timetable = await Timetable.create(timetableData);
            console.log('CSE timetable created');

            // Create some sample calendar events
            console.log('Creating academic calendar events...');
            const calendarEvents = [
                {
                    title: 'Semester Start',
                    description: 'Beginning of 5th semester',
                    startDate: new Date('2024-08-01'),
                    endDate: new Date('2024-08-01'),
                    type: 'semester-start',
                    academicYear: '2024-2025',
                    createdBy: adminUser._id,
                    priority: 'high',
                    color: '#28a745'
                },
                {
                    title: 'Mid-term Examinations',
                    description: 'Mid-semester examinations for all subjects',
                    startDate: new Date('2024-10-15'),
                    endDate: new Date('2024-10-25'),
                    type: 'exam',
                    academicYear: '2024-2025',
                    createdBy: adminUser._id,
                    priority: 'critical',
                    color: '#dc3545'
                },
                {
                    title: 'Diwali Holiday',
                    description: 'Festival holidays',
                    startDate: new Date('2024-11-01'),
                    endDate: new Date('2024-11-05'),
                    type: 'holiday',
                    academicYear: '2024-2025',
                    createdBy: adminUser._id,
                    priority: 'medium',
                    color: '#ffc107'
                }
            ];

            await AcademicCalendar.create(calendarEvents);
            console.log('Academic calendar events created');
        }

        console.log('✅ Database seeding completed successfully!');
        console.log('\n📋 Sample Login Credentials:');
        console.log('👨‍💼 Admin: admin@college.edu / Admin123');
        console.log('🎓 Student: studentcse1@college.edu / Student123');
        console.log('🎓 Student: studentcse2@college.edu / Student123');
        console.log('🎓 Student: studentcse3@college.edu / Student123');
        
    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed');
        process.exit(0);
    }
};

// Run seeding if this file is executed directly
if (require.main === module) {
    seedDatabase();
}

module.exports = seedDatabase;
