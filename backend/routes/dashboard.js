const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get dashboard data
// @route   GET /api/dashboard
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        // Return mock dashboard data for now
        const dashboardData = {
            success: true,
            data: {
                overallAttendance: 85,
                totalClasses: 120,
                attendedClasses: 102,
                missedClasses: 18,
                subjects: [
                    {
                        name: 'Mathematics',
                        code: 'MATH101',
                        attendance: 90,
                        total: 20,
                        attended: 18
                    },
                    {
                        name: 'Physics',
                        code: 'PHY101',
                        attendance: 80,
                        total: 25,
                        attended: 20
                    },
                    {
                        name: 'Chemistry',
                        code: 'CHEM101',
                        attendance: 88,
                        total: 22,
                        attended: 19
                    }
                ],
                todayClasses: [
                    {
                        subject: 'Mathematics',
                        time: '09:00 AM',
                        duration: '1 hour',
                        room: 'Room 101',
                        status: 'present'
                    },
                    {
                        subject: 'Physics',
                        time: '11:00 AM',
                        duration: '1.5 hours',
                        room: 'Lab 201',
                        status: 'upcoming'
                    }
                ],
                upcomingClasses: [
                    {
                        subject: 'Chemistry',
                        time: 'Tomorrow 10:00 AM',
                        room: 'Lab 301'
                    }
                ]
            }
        };

        res.status(200).json(dashboardData);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
});

// @desc    Get attendance summary
// @route   GET /api/dashboard/attendance/summary
// @access  Private
router.get('/attendance/summary', protect, async (req, res) => {
    try {
        const summaryData = {
            success: true,
            data: {
                overallPercentage: 85.5,
                totalClasses: 120,
                attendedClasses: 102,
                missedClasses: 18,
                monthlyAttendance: [
                    { month: 'Jan', percentage: 88 },
                    { month: 'Feb', percentage: 92 },
                    { month: 'Mar', percentage: 85 },
                    { month: 'Apr', percentage: 83 },
                    { month: 'May', percentage: 87 }
                ]
            }
        };

        res.status(200).json(summaryData);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
});

module.exports = router;
