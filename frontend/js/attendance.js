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
            // For now, using mock data since backend isn't fully implemented
            const mockClasses = [
                {
                    id: 'class1',
                    subject: 'Data Structures',
                    code: 'CS301',
                    time: '09:00-10:00',
                    room: 'CS-101',
                    faculty: 'Dr. Smith',
                    status: null
                },
                {
                    id: 'class2',
                    subject: 'Database Systems',
                    code: 'CS302',
                    time: '11:00-12:00',
                    room: 'CS-102',
                    faculty: 'Prof. Johnson',
                    status: null
                },
                {
                    id: 'class3',
                    subject: 'Computer Networks',
                    code: 'CS303',
                    time: '14:00-15:00',
                    room: 'CS-103',
                    faculty: 'Dr. Brown',
                    status: 'present'
                }
            ];

            this.renderTodaysClasses(mockClasses);
            this.updateTodayStats();
            
        } catch (error) {
            console.error('Error loading today\'s classes:', error);
            toast.error('Failed to load today\'s classes');
        }
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
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        const [startTime, endTime] = timeString.split('-');
        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);
        
        const classStart = startHour * 60 + startMin;
        const classEnd = endHour * 60 + endMin;
        
        return currentTime >= classStart && currentTime <= classEnd;
    },

    // Check if class has ended
    isPastClass(timeString) {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        const [, endTime] = timeString.split('-');
        const [endHour, endMin] = endTime.split(':').map(Number);
        const classEnd = endHour * 60 + endMin;
        
        return currentTime > classEnd;
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
