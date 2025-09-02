// Attendance-specific functionality for College Attendance Tracker

// Attendance management utilities
const attendanceManager = {
    // Mark attendance for a class
    async markAttendance(classId, status, notes = '') {
        try {
            const response = await api.post(API_ENDPOINTS.MARK_ATTENDANCE, {
                classId,
                status,
                notes
            });

            if (response.success) {
                toast.success('Attendance marked successfully');
                this.updateAttendanceUI(classId, status);
                this.updateTodayStats();
                return true;
            }
        } catch (error) {
            console.error('Error marking attendance:', error);
            toast.error(error.message || 'Failed to mark attendance');
            return false;
        }
    },

    // Update attendance UI after marking
    updateAttendanceUI(classId, status) {
        const classElement = document.querySelector(`[data-class-id="${classId}"]`);
        if (classElement) {
            // Update button states
            const buttons = classElement.querySelectorAll('.attendance-btn');
            buttons.forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.status === status) {
                    btn.classList.add('active');
                }
            });

            // Update status display
            const statusElement = classElement.querySelector('.attendance-status');
            if (statusElement) {
                statusElement.textContent = status.charAt(0).toUpperCase() + status.slice(1);
                statusElement.className = `attendance-status badge bg-${
                    status === 'present' ? 'success' : 
                    status === 'absent' ? 'danger' : 'warning'
                }`;
            }
        }
    },

    // Update today's attendance statistics
    updateTodayStats() {
        // Count marked attendance for today
        const attendanceButtons = document.querySelectorAll('.attendance-btn.active');
        const presentCount = document.querySelectorAll('.attendance-btn.active[data-status="present"]').length;
        const totalCount = document.querySelectorAll('[data-class-id]').length;
        
        // Update display elements
        const todayPresentElement = document.getElementById('todayPresent');
        const todayTotalElement = document.getElementById('todayTotal');
        const todayPercentageElement = document.getElementById('todayAttendancePercentage');
        
        if (todayPresentElement) todayPresentElement.textContent = presentCount;
        if (todayTotalElement) todayTotalElement.textContent = totalCount;
        
        if (todayPercentageElement && totalCount > 0) {
            const percentage = Math.round((presentCount / totalCount) * 100);
            todayPercentageElement.textContent = `${percentage}%`;
        }
    },

    // Load today's classes for attendance marking
    async loadTodaysClasses() {
        try {
            const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
            const today = new Date();
            const todayName = today.toLocaleDateString('en-US', { weekday: 'long' });
            
            console.log('Loading today\'s classes for:', todayName);
            
            // Fetch student's timetable
            const timetableResponse = await fetch('/api/timetable', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            let todayClasses = [];
            
            if (timetableResponse.ok) {
                const timetableResult = await timetableResponse.json();
                console.log('Timetable data for attendance:', timetableResult);
                
                if (timetableResult.success && timetableResult.data && timetableResult.data.length > 0) {
                    const timetable = timetableResult.data[0];
                    
                    // Find today's schedule
                    const todaySchedule = timetable.schedule.find(day => day.day === todayName);
                    
                    if (todaySchedule) {
                        todayClasses = todaySchedule.timeSlots.map((slot, index) => ({
                            id: `class_${slot.subject._id}_${index}`,
                            subject: slot.subject.name,
                            code: slot.subject.code,
                            time: `${slot.startTime}-${slot.endTime}`,
                            room: slot.room,
                            faculty: slot.faculty || 'Faculty Name',
                            status: null,
                            type: slot.type || 'lecture'
                        }));
                        
                        console.log('Today\'s classes from timetable:', todayClasses);
                    } else {
                        console.log('No classes scheduled for today');
                    }
                }
            } else {
                console.log('Failed to fetch timetable for attendance');
            }
            
            // Show special message if no classes
            if (todayClasses.length === 0) {
                this.renderNoClassesMessage();
                return;
            }

            this.renderTodaysClasses(todayClasses);
            this.updateTodayStats();
            
        } catch (error) {
            console.error('Error loading today\'s classes:', error);
            
            // Show a user-friendly message instead of an error
            this.renderNoClassesMessage();
        }
    },

    // Render no classes message
    renderNoClassesMessage() {
        const container = document.getElementById('markAttendanceList');
        if (!container) return;

        const today = new Date();
        const todayName = today.toLocaleDateString('en-US', { weekday: 'long' });
        
        // Check if it's weekend
        const isWeekend = todayName === 'Saturday' || todayName === 'Sunday';
        
        container.innerHTML = `
            <div class="text-center py-5">
                <div class="mb-4">
                    <i class="bi bi-calendar-heart" style="font-size: 4rem; color: #28a745;"></i>
                </div>
                <h4 class="text-success mb-3">
                    ${isWeekend ? '🎉 Weekend Vibes!' : '🎊 No Classes Today!'}
                </h4>
                <p class="text-muted mb-4">
                    ${isWeekend 
                        ? 'It\'s ' + todayName + '! Time to relax and enjoy your weekend. 🌟' 
                        : 'You don\'t have any scheduled classes today. Make the most of your free time! ✨'
                    }
                </p>
                <div class="alert alert-info d-inline-block" role="alert">
                    <i class="bi bi-lightbulb me-2"></i>
                    <strong>Pro tip:</strong> ${isWeekend 
                        ? 'Use this time to catch up on studies or pursue hobbies!' 
                        : 'Perfect day for extra study sessions or project work!'
                    }
                </div>
            </div>
        `;
        
        // Update stats to show 0
        const todayPresentElement = document.getElementById('todayPresent');
        const todayTotalElement = document.getElementById('todayTotal');
        const todayPercentageElement = document.getElementById('todayAttendancePercentage');
        
        if (todayPresentElement) todayPresentElement.textContent = '0';
        if (todayTotalElement) todayTotalElement.textContent = '0';
        if (todayPercentageElement) todayPercentageElement.textContent = '0%';
    },

    // Render today's classes for attendance marking
    renderTodaysClasses(classes) {
        const container = document.getElementById('markAttendanceList');
        if (!container) return;

        if (classes.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted py-5">
                    <i class="bi bi-calendar-x mb-2" style="font-size: 3rem;"></i>
                    <h5>No Classes Today</h5>
                    <p>You don't have any scheduled classes today.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = classes.map(classItem => {
            const isCurrentTime = this.isCurrentClass(classItem.time);
            const isPastClass = this.isPastClass(classItem.time);
            
            return `
                <div class="card mb-3 ${isCurrentTime ? 'border-primary' : ''}" data-class-id="${classItem.id}">
                    <div class="card-body">
                        <div class="row align-items-center">
                            <div class="col-md-6">
                                <h6 class="card-title mb-1">
                                    ${classItem.subject}
                                    ${isCurrentTime ? '<span class="badge bg-primary ms-2">Current</span>' : ''}
                                    ${isPastClass && !classItem.status ? '<span class="badge bg-warning ms-2">Missed</span>' : ''}
                                </h6>
                                <p class="card-text mb-1">
                                    <small class="text-muted">
                                        <i class="bi bi-book me-1"></i>${classItem.code}
                                        <i class="bi bi-clock ms-2 me-1"></i>${classItem.time}
                                        <i class="bi bi-geo-alt ms-2 me-1"></i>${classItem.room}
                                        <i class="bi bi-person ms-2 me-1"></i>${classItem.faculty}
                                    </small>
                                </p>
                                ${classItem.status ? `
                                    <span class="attendance-status badge bg-${
                                        classItem.status === 'present' ? 'success' : 
                                        classItem.status === 'absent' ? 'danger' : 'warning'
                                    }">
                                        ${classItem.status.charAt(0).toUpperCase() + classItem.status.slice(1)}
                                    </span>
                                ` : ''}
                            </div>
                            <div class="col-md-6">
                                <div class="attendance-btn-group text-end">
                                    <button 
                                        class="btn btn-success attendance-btn ${classItem.status === 'present' ? 'active' : ''}"
                                        data-status="present"
                                        onclick="attendanceManager.handleAttendanceClick('${classItem.id}', 'present')"
                                        ${isPastClass && !classItem.status ? 'disabled' : ''}
                                    >
                                        <i class="bi bi-check-circle me-1"></i>
                                        Present
                                    </button>
                                    <button 
                                        class="btn btn-danger attendance-btn ${classItem.status === 'absent' ? 'active' : ''}"
                                        data-status="absent"
                                        onclick="attendanceManager.handleAttendanceClick('${classItem.id}', 'absent')"
                                        ${isPastClass && !classItem.status ? 'disabled' : ''}
                                    >
                                        <i class="bi bi-x-circle me-1"></i>
                                        Absent
                                    </button>
                                    <button 
                                        class="btn btn-warning attendance-btn ${classItem.status === 'late' ? 'active' : ''}"
                                        data-status="late"
                                        onclick="attendanceManager.handleAttendanceClick('${classItem.id}', 'late')"
                                        ${isPastClass && !classItem.status ? 'disabled' : ''}
                                    >
                                        <i class="bi bi-clock me-1"></i>
                                        Late
                                    </button>
                                </div>
                                ${isPastClass && !classItem.status ? `
                                    <small class="text-muted d-block mt-2">
                                        <i class="bi bi-info-circle me-1"></i>
                                        This class has ended. Contact your instructor to mark attendance.
                                    </small>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    // Handle attendance button clicks
    async handleAttendanceClick(classId, status) {
        const success = await this.markAttendance(classId, status);
        
        if (success) {
            // Show confirmation
            const className = document.querySelector(`[data-class-id="${classId}"] .card-title`).textContent.trim();
            toast.success(`Marked ${status} for ${className}`);
        }
    },

    // Check if class is currently running
    isCurrentClass(timeString) {
        if (!timeString || timeString === 'N/A') return false;
        
        try {
            const now = new Date();
            const currentTime = now.getHours() * 60 + now.getMinutes();
            
            const [startTime, endTime] = timeString.split('-');
            const [startHour, startMin] = startTime.split(':').map(Number);
            const [endHour, endMin] = endTime.split(':').map(Number);
            
            const classStart = startHour * 60 + startMin;
            const classEnd = endHour * 60 + endMin;
            
            return currentTime >= classStart && currentTime <= classEnd;
        } catch (error) {
            console.error('Error parsing time:', timeString, error);
            return false;
        }
    },

    // Check if class has ended
    isPastClass(timeString) {
        if (!timeString || timeString === 'N/A') return false;
        
        try {
            const now = new Date();
            const currentTime = now.getHours() * 60 + now.getMinutes();
            
            const [, endTime] = timeString.split('-');
            const [endHour, endMin] = endTime.split(':').map(Number);
            const classEnd = endHour * 60 + endMin;
            
            return currentTime > classEnd;
        } catch (error) {
            console.error('Error parsing time:', timeString, error);
            return false;
        }
    },

    // Bulk mark attendance
    async bulkMarkAttendance(attendanceData) {
        try {
            loadingOverlay.show();
            
            const promises = attendanceData.map(item => 
                this.markAttendance(item.classId, item.status, item.notes)
            );
            
            const results = await Promise.allSettled(promises);
            const successful = results.filter(r => r.status === 'fulfilled').length;
            
            if (successful === attendanceData.length) {
                toast.success('All attendance marked successfully');
            } else {
                toast.warning(`${successful}/${attendanceData.length} attendance records marked`);
            }
            
        } catch (error) {
            console.error('Error in bulk attendance marking:', error);
            toast.error('Failed to mark attendance');
        } finally {
            loadingOverlay.hide();
        }
    }
};

// Attendance history utilities
const attendanceHistory = {
    // Get attendance history
    async getHistory(filters = {}) {
        try {
            // Mock data for now
            const mockHistory = [
                {
                    date: '2024-08-27',
                    subject: 'Data Structures',
                    status: 'present',
                    time: '09:00-10:00'
                },
                {
                    date: '2024-08-26',
                    subject: 'Database Systems',
                    status: 'absent',
                    time: '11:00-12:00'
                }
            ];
            
            return mockHistory;
        } catch (error) {
            console.error('Error fetching attendance history:', error);
            throw error;
        }
    },

    // Show attendance history modal
    async showHistoryModal() {
        try {
            const history = await this.getHistory();
            
            let modalContent = `
                <div class="modal fade" id="attendanceHistoryModal" tabindex="-1">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Attendance History</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <div class="table-responsive">
                                    <table class="table table-striped">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Subject</th>
                                                <th>Time</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
            `;

            history.forEach(record => {
                modalContent += `
                    <tr>
                        <td>${dateUtils.formatDate(record.date)}</td>
                        <td>${record.subject}</td>
                        <td>${record.time}</td>
                        <td>
                            <span class="badge bg-${
                                record.status === 'present' ? 'success' : 
                                record.status === 'absent' ? 'danger' : 'warning'
                            }">
                                ${record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </span>
                        </td>
                    </tr>
                `;
            });

            modalContent += `
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Remove existing modal if present
            const existingModal = document.getElementById('attendanceHistoryModal');
            if (existingModal) {
                existingModal.remove();
            }

            // Add modal to DOM and show
            document.body.insertAdjacentHTML('beforeend', modalContent);
            const modal = new bootstrap.Modal(document.getElementById('attendanceHistoryModal'));
            modal.show();
            
        } catch (error) {
            toast.error('Failed to load attendance history');
        }
    }
};

// Initialize attendance functionality
document.addEventListener('DOMContentLoaded', function() {
    // Load today's classes when mark attendance page is shown
    if (document.getElementById('markAttendancePage')) {
        // This will be called when the page is actually shown
        // The page loading is handled by the main app.js file
    }
    
    // Add event listeners for attendance history button
    const historyBtn = document.getElementById('showAttendanceHistory');
    if (historyBtn) {
        historyBtn.addEventListener('click', attendanceHistory.showHistoryModal);
    }
});
