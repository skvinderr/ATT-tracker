// Test script to verify timetable creation works with real database subjects
const https = require('https');
const http = require('http');

function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const req = (options.protocol === 'https:' ? https : http).request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    resolve({ ok: res.statusCode < 400, status: res.statusCode, data: parsed });
                } catch (error) {
                    resolve({ ok: false, status: res.statusCode, data: { message: body } });
                }
            });
        });
        
        req.on('error', reject);
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function testTimetableCreation() {
    const baseUrl = 'http://localhost:4000/api';
    
    try {
        // Step 1: Login as admin
        console.log('🔐 Logging in as admin...');
        const loginOptions = {
            hostname: 'localhost',
            port: 4000,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        const loginResult = await makeRequest(loginOptions, {
            email: 'admin@college.edu',
            password: 'Admin123'
        });
        
        if (!loginResult.ok) {
            throw new Error(`Login failed: ${loginResult.data.message}`);
        }
        
        const token = loginResult.data.token;
        console.log('✅ Admin login successful');
        
        // Step 2: Get subjects to find a real Civil Engineering subject ID
        console.log('📚 Fetching subjects...');
        const subjectsOptions = {
            hostname: 'localhost',
            port: 4000,
            path: '/api/subjects',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };
        
        const subjectsResult = await makeRequest(subjectsOptions);
        if (!subjectsResult.ok) {
            throw new Error(`Failed to fetch subjects: ${subjectsResult.data.message}`);
        }
        
        console.log(`Found ${subjectsResult.data.data.length} subjects`);
        
        // Find a Civil Engineering subject for semester 3
        const ceSubjects = subjectsResult.data.data.filter(subject => {
            const branchCode = subject.branch?.code || subject.branch?.name;
            return (branchCode === 'CE' || branchCode === 'Civil Engineering') && subject.semester === 3;
        });
        
        if (ceSubjects.length === 0) {
            throw new Error('No Civil Engineering subjects found for semester 3');
        }
        
        const testSubject = ceSubjects[0];
        console.log(`📖 Using subject: ${testSubject.name} (${testSubject.code}) - ID: ${testSubject._id}`);
        
        // Step 3: Create a timetable entry
        console.log('📅 Creating timetable entry...');
        const timetableData = {
            branch: 'CE',
            semester: 3,
            academicYear: '2024-2025',
            schedule: [{
                day: 'Monday',
                timeSlots: [{
                    startTime: '09:00',
                    endTime: '10:00',
                    subject: testSubject._id,
                    room: 'CE-101',
                    type: 'lecture'
                }]
            }]
        };
        
        console.log('Sending timetable data:', JSON.stringify(timetableData, null, 2));
        
        const timetableOptions = {
            hostname: 'localhost',
            port: 4000,
            path: '/api/timetable',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };
        
        const timetableResult = await makeRequest(timetableOptions, timetableData);
        
        if (!timetableResult.ok) {
            throw new Error(`Failed to create timetable: ${timetableResult.data.message}`);
        }
        
        console.log('✅ Timetable created successfully!');
        console.log('📋 Created timetable ID:', timetableResult.data.data._id);
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testTimetableCreation();
