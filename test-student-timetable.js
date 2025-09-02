// Test script to verify timetable creation works for Civil Engineering students
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

async function testStudentTimetableAccess() {
    try {
        console.log('🔐 Testing Civil Engineering student login...');
        
        // Login as CE student
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
            email: 'studentce1@college.edu',
            password: 'Student123'
        });
        
        if (!loginResult.ok) {
            throw new Error(`Student login failed: ${loginResult.data.message}`);
        }
        
        const token = loginResult.data.token;
        const user = loginResult.data.user;
        console.log('✅ Student login successful');
        console.log(`📚 Student: ${user.name} (${user.email})`);
        console.log(`🏛️ Branch: ${user.branch} | Semester: ${user.semester}`);
        
        // Fetch student's timetable
        console.log('\n📅 Fetching student timetable...');
        const timetableOptions = {
            hostname: 'localhost',
            port: 4000,
            path: '/api/timetable',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };
        
        const timetableResult = await makeRequest(timetableOptions);
        if (!timetableResult.ok) {
            throw new Error(`Failed to fetch timetable: ${timetableResult.data.message}`);
        }
        
        console.log('✅ Timetable fetch successful');
        console.log(`📋 Found ${timetableResult.data.data.length} timetable(s)`);
        
        if (timetableResult.data.data.length > 0) {
            const timetable = timetableResult.data.data[0];
            console.log(`\n🎯 Timetable Details:`);
            console.log(`Branch: ${timetable.branch.name} (${timetable.branch.code})`);
            console.log(`Semester: ${timetable.semester}`);
            console.log(`Academic Year: ${timetable.academicYear}`);
            console.log(`\n📅 Schedule:`);
            
            timetable.schedule.forEach(day => {
                console.log(`  ${day.day}:`);
                day.timeSlots.forEach(slot => {
                    console.log(`    ${slot.startTime}-${slot.endTime}: ${slot.subject.name} (${slot.subject.code}) - ${slot.room}`);
                });
            });
            
            // Extract subjects for dashboard
            const subjectSet = new Set();
            timetable.schedule.forEach(day => {
                day.timeSlots.forEach(slot => {
                    if (slot.subject) {
                        subjectSet.add(`${slot.subject.name} (${slot.subject.code})`);
                    }
                });
            });
            
            console.log(`\n📖 Unique subjects for dashboard: ${Array.from(subjectSet).length}`);
            Array.from(subjectSet).forEach(subject => {
                console.log(`  - ${subject}`);
            });
            
            // Check today's classes
            const today = new Date();
            const todayName = today.toLocaleDateString('en-US', { weekday: 'long' });
            const todaySchedule = timetable.schedule.find(day => day.day === todayName);
            
            console.log(`\n🗓️ Today (${todayName}) classes:`);
            if (todaySchedule) {
                todaySchedule.timeSlots.forEach(slot => {
                    console.log(`  ${slot.startTime}-${slot.endTime}: ${slot.subject.name} - ${slot.room}`);
                });
            } else {
                console.log(`  No classes scheduled for ${todayName}`);
            }
            
        } else {
            console.log('❌ No timetables found for this student');
        }
        
        console.log('\n🎉 Test completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testStudentTimetableAccess();
