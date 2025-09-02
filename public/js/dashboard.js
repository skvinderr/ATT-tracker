// Dashboard-specific functionality for College Attendance Tracker

// Dashboard utilities and functions
const dashboardUtils = {
    // Refresh dashboard data
    async refreshData() {
        if (!authManager.isAuthenticated()) return;
        
        try {
            loadingOverlay.show();
            await PageManager.loadDashboard();
            toast.success('Dashboard updated');
        } catch (error) {
            console.error('Error refreshing dashboard:', error);
            toast.error('Failed to refresh dashboard');
        } finally {
            loadingOverlay.hide();
        }
    },

    // Export attendance data
    exportAttendanceData(format = 'pdf') {
        const user = authManager.getCurrentUser();
        if (!user) return;

        // Create a printable version of attendance data
        const printContent = this.generatePrintableReport();
        
        if (format === 'pdf') {
            // Open print dialog for PDF generation
            const printWindow = window.open('', '_blank');
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.print();
        }
    },

    // Generate printable report
    generatePrintableReport() {
        const user = authManager.getCurrentUser();
        const currentDate = dateUtils.getCurrentDate('long');
        
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Attendance Report - ${user.name}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .info { margin-bottom: 20px; }
                    .attendance-table { width: 100%; border-collapse: collapse; }
                    .attendance-table th, .attendance-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    .attendance-table th { background-color: #f2f2f2; }
                    .excellent { color: #28a745; font-weight: bold; }
                    .good { color: #17a2b8; font-weight: bold; }
                    .warning { color: #ffc107; font-weight: bold; }
                    .danger { color: #dc3545; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>College Attendance Report</h1>
                    <p>Generated on: ${currentDate}</p>
                </div>
                <div class="info">
                    <p><strong>Student Name:</strong> ${user.name}</p>
                    <p><strong>Student ID:</strong> ${user.studentId || 'N/A'}</p>
                    <p><strong>Email:</strong> ${user.email}</p>
                </div>
                <h3>Subject-wise Attendance</h3>
                <p>This is a placeholder report. Full implementation requires backend integration.</p>
            </body>
            </html>
        `;
    },

    // Get attendance insights
    getAttendanceInsights(subjects) {
        const insights = {
            criticalSubjects: [],
            excellentSubjects: [],
            improvementNeeded: [],
            totalClassesMissed: 0
        };

        subjects.forEach(subject => {
            const missed = subject.total - subject.attended;
            insights.totalClassesMissed += missed;

            if (subject.attendance < 75) {
                insights.criticalSubjects.push(subject);
            } else if (subject.attendance >= 90) {
                insights.excellentSubjects.push(subject);
            } else if (subject.attendance < 80) {
                insights.improvementNeeded.push(subject);
            }
        });

        return insights;
    },

    // Show attendance insights modal
    showInsightsModal(subjects) {
        const insights = this.getAttendanceInsights(subjects);
        
        // Create modal content
        let modalContent = `
            <div class="modal fade" id="insightsModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Attendance Insights</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
        `;

        if (insights.criticalSubjects.length > 0) {
            modalContent += `
                <div class="alert alert-danger">
                    <h6><i class="bi bi-exclamation-triangle me-2"></i>Critical Subjects (Below 75%)</h6>
                    <ul class="mb-0">
                        ${insights.criticalSubjects.map(s => `<li>${s.name}: ${s.attendance}%</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        if (insights.improvementNeeded.length > 0) {
            modalContent += `
                <div class="alert alert-warning">
                    <h6><i class="bi bi-exclamation me-2"></i>Needs Improvement (Below 80%)</h6>
                    <ul class="mb-0">
                        ${insights.improvementNeeded.map(s => `<li>${s.name}: ${s.attendance}%</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        if (insights.excellentSubjects.length > 0) {
            modalContent += `
                <div class="alert alert-success">
                    <h6><i class="bi bi-check-circle me-2"></i>Excellent Attendance (90%+)</h6>
                    <ul class="mb-0">
                        ${insights.excellentSubjects.map(s => `<li>${s.name}: ${s.attendance}%</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        modalContent += `
                    <div class="mt-3">
                        <h6>Summary Statistics</h6>
                        <ul>
                            <li>Total Classes Missed: ${insights.totalClassesMissed}</li>
                            <li>Subjects Needing Attention: ${insights.criticalSubjects.length + insights.improvementNeeded.length}</li>
                        </ul>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" onclick="dashboardUtils.exportAttendanceData()">
                        <i class="bi bi-download me-2"></i>Export Report
                    </button>
                </div>
            </div>
        </div>
    </div>
        `;

        // Remove existing modal if present
        const existingModal = document.getElementById('insightsModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to DOM
        document.body.insertAdjacentHTML('beforeend', modalContent);

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('insightsModal'));
        modal.show();
    }
};

// Add dashboard-specific event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Add refresh button functionality if it exists
    const refreshBtn = document.getElementById('refreshDashboard');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', dashboardUtils.refreshData);
    }

    // Add insights button functionality
    const insightsBtn = document.getElementById('showInsights');
    if (insightsBtn) {
        insightsBtn.addEventListener('click', function() {
            // This would normally get real data from the dashboard
            const mockSubjects = [
                { name: 'Data Structures', code: 'CS301', attendance: 82, total: 20, attended: 16 },
                { name: 'Database Systems', code: 'CS302', attendance: 75, total: 18, attended: 14 },
                { name: 'Computer Networks', code: 'CS303', attendance: 68, total: 16, attended: 11 }
            ];
            dashboardUtils.showInsightsModal(mockSubjects);
        });
    }
});
