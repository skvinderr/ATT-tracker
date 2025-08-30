// Main application JavaScript for College Attendance Tracker

// Application state
let currentPage = 'login';

// Page management
const PageManager = {
    // Show specific page
    showPage(pageId) {
        // Hide all pages
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => {
            page.style.display = 'none';
        });

        // Show requested page
        const targetPage = document.getElementById(pageId + 'Page');
        if (targetPage) {
            targetPage.style.display = 'block';
            currentPage = pageId;
            
            // Update URL without reloading
            window.history.pushState({ page: pageId }, '', `#${pageId}`);
            
            // Update page title
            this.updatePageTitle(pageId);
            
            // Load page data if needed
            this.loadPageData(pageId);
            
            // Update active navigation
            this.updateActiveNavigation(pageId);
        } else {
            console.error(`Page not found: ${pageId}Page`);
        }
    },

    // Update page title
    updatePageTitle(pageId) {
        const titles = {
            login: 'Login - College Attendance Tracker',
            register: 'Register - College Attendance Tracker',
            forgotPassword: 'Reset Password - College Attendance Tracker',
            dashboard: 'Dashboard - College Attendance Tracker',
            markAttendance: 'Mark Attendance - College Attendance Tracker',
            timetable: 'Timetable - College Attendance Tracker',
            reports: 'Reports - College Attendance Tracker',
            profile: 'Profile - College Attendance Tracker',
            students: 'Students - College Attendance Tracker',
            subjects: 'Subjects - College Attendance Tracker',
            timetables: 'Timetables - College Attendance Tracker'
        };
        
        document.title = titles[pageId] || 'College Attendance Tracker';
    },

    // Load page-specific data
    async loadPageData(pageId) {
        try {
            switch (pageId) {
                case 'dashboard':
                    if (authManager.isAuthenticated()) {
                        await this.loadDashboard();
                    }
                    break;
                    
                case 'markAttendance':
                    if (authManager.isAuthenticated() && authManager.hasRole('student')) {
                        await this.loadMarkAttendance();
                    }
                    break;
                    
                case 'profile':
                    if (authManager.isAuthenticated()) {
                        this.loadProfile();
                    }
                    break;
                    
                case 'reports':
                    if (authManager.isAuthenticated()) {
                        await this.loadReports();
                    }
                    break;
                    
                case 'timetable':
                    if (authManager.isAuthenticated() && authManager.hasRole('student')) {
                        await this.loadTimetable();
                    }
                    break;
                    
                case 'timetables':
                    if (authManager.isAuthenticated() && authManager.hasRole('admin')) {
                        await this.loadTimetables();
                    }
                    break;
                    
                case 'students':
                    if (authManager.isAuthenticated() && authManager.hasRole('admin')) {
                        await this.loadStudents();
                    }
                    break;
                    
                case 'subjects':
                    if (authManager.isAuthenticated() && authManager.hasRole('admin')) {
                        await this.loadSubjects();
                    }
                    break;
                    
                case 'register':
                    // Load branches for registration
                    authManager.loadBranches();
                    break;
            }
        } catch (error) {
            console.error(`Error loading data for page ${pageId}:`, error);
            toast.error('Failed to load page data');
        }
    },

    // Update active navigation
    updateActiveNavigation(pageId) {
        // Remove active class from all nav links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
        });

        // Find and activate current page nav link
        const activeLink = document.querySelector(`[onclick="showPage('${pageId}')"]`);
        if (activeLink && activeLink.classList.contains('nav-link')) {
            activeLink.classList.add('active');
        }
    },

    // Load dashboard data
    async loadDashboard() {
        const user = authManager.getCurrentUser();
        if (!user) return;

        // Update current date
        const currentDateElement = document.getElementById('currentDate');
        if (currentDateElement) {
            currentDateElement.textContent = dateUtils.getCurrentDate('long');
        }

        // Load dashboard data based on user role
        if (user.role === 'student') {
            await this.loadStudentDashboard();
        } else if (user.role === 'admin') {
            await this.loadAdminDashboard();
        }
    },

    // Load student dashboard
    async loadStudentDashboard() {
        try {
            // Show loading state
            this.showDashboardLoading();

            // For now, we'll use mock data since backend isn't fully implemented
            const mockData = {
                overallAttendance: 78,
                classesAttended: 42,
                totalClasses: 54,
                totalSubjects: 6,
                subjects: [
                    { name: 'Data Structures', code: 'CS301', attendance: 82, total: 20, attended: 16 },
                    { name: 'Database Systems', code: 'CS302', attendance: 75, total: 18, attended: 14 },
                    { name: 'Computer Networks', code: 'CS303', attendance: 68, total: 16, attended: 11 },
                    { name: 'Operating Systems', code: 'CS304', attendance: 85, total: 15, attended: 13 },
                    { name: 'Software Engineering', code: 'CS305', attendance: 90, total: 12, attended: 11 },
                    { name: 'Machine Learning', code: 'CS306', attendance: 70, total: 10, attended: 7 }
                ],
                todayClasses: [
                    { subject: 'Data Structures', time: '09:00-10:00', room: 'CS-101', status: 'upcoming' },
                    { subject: 'Database Systems', time: '11:00-12:00', room: 'CS-102', status: 'upcoming' }
                ]
            };

            // Update quick stats
            document.getElementById('overallAttendance').textContent = `${mockData.overallAttendance}%`;
            document.getElementById('classesAttended').textContent = mockData.classesAttended;
            document.getElementById('totalClasses').textContent = mockData.totalClasses;
            document.getElementById('totalSubjects').textContent = mockData.totalSubjects;

            // Update subject-wise attendance
            this.renderSubjectAttendance(mockData.subjects);

            // Update today's classes
            this.renderTodayClasses(mockData.todayClasses);

            // Create attendance chart
            this.createAttendanceChart(mockData.subjects);

        } catch (error) {
            console.error('Error loading student dashboard:', error);
            toast.error('Failed to load dashboard data');
        }
    },

    // Show dashboard loading state
    showDashboardLoading() {
        const subjectAttendanceList = document.getElementById('subjectAttendanceList');
        if (subjectAttendanceList) {
            subjectAttendanceList.innerHTML = `
                <div class="text-center text-muted py-5">
                    <div class="spinner-border" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2">Loading attendance data...</p>
                </div>
            `;
        }
    },

    // Render subject-wise attendance
    renderSubjectAttendance(subjects) {
        const container = document.getElementById('subjectAttendanceList');
        if (!container) return;

        container.innerHTML = subjects.map(subject => {
            const attendanceClass = attendanceUtils.getAttendanceClass(subject.attendance);
            const canMiss = attendanceUtils.calculateClassesToMiss(subject.attended, subject.total);
            const mustAttend = attendanceUtils.calculateClassesToAttend(subject.attended, subject.total);
            
            return `
                <div class="subject-card card mb-3">
                    <div class="card-body">
                        <div class="row align-items-center">
                            <div class="col-md-6">
                                <h6 class="card-title mb-1">${subject.name}</h6>
                                <small class="text-muted">${subject.code}</small>
                            </div>
                            <div class="col-md-3 text-center">
                                <span class="attendance-percentage ${attendanceClass}">${subject.attendance}%</span>
                                <br>
                                <small class="text-muted">${subject.attended}/${subject.total} classes</small>
                            </div>
                            <div class="col-md-3">
                                <div class="progress" style="height: 8px;">
                                    <div class="progress-bar bg-${attendanceClass === 'excellent' ? 'success' : attendanceClass === 'good' ? 'info' : attendanceClass === 'warning' ? 'warning' : 'danger'}" 
                                         style="width: ${subject.attendance}%"></div>
                                </div>
                                <small class="text-muted mt-1 d-block">
                                    ${subject.attendance >= 75 ? 
                                        (canMiss > 0 ? `Can miss ${canMiss} classes` : 'Maintain attendance') :
                                        `Must attend next ${mustAttend} classes`
                                    }
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    // Render today's classes
    renderTodayClasses(classes) {
        const container = document.getElementById('todayClasses');
        if (!container) return;

        if (classes.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted py-3">
                    <i class="bi bi-calendar-day mb-2" style="font-size: 2rem;"></i>
                    <p>No classes today</p>
                </div>
            `;
            return;
        }

        container.innerHTML = classes.map(classItem => `
            <div class="today-class ${classItem.status}">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-1">${classItem.subject}</h6>
                        <small class="text-muted">
                            <i class="bi bi-clock me-1"></i>${classItem.time}
                            <i class="bi bi-geo-alt ms-2 me-1"></i>${classItem.room}
                        </small>
                    </div>
                    <span class="badge bg-${classItem.status === 'completed' ? 'success' : 'primary'}">
                        ${classItem.status === 'completed' ? 'Attended' : 'Upcoming'}
                    </span>
                </div>
            </div>
        `).join('');
    },

    // Create attendance chart
    createAttendanceChart(subjects) {
        const canvas = document.getElementById('attendanceChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Destroy existing chart if it exists
        if (window.attendanceChartInstance) {
            window.attendanceChartInstance.destroy();
        }

        const data = {
            labels: subjects.map(s => s.code),
            datasets: [{
                label: 'Attendance Percentage',
                data: subjects.map(s => s.attendance),
                backgroundColor: subjects.map(s => attendanceUtils.getAttendanceColor(s.attendance) + '40'),
                borderColor: subjects.map(s => attendanceUtils.getAttendanceColor(s.attendance)),
                borderWidth: 2,
                borderRadius: 4,
                borderSkipped: false
            }]
        };

        const options = {
            ...chartUtils.getDefaultOptions(),
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.y}% attendance`;
                        }
                    }
                }
            }
        };

        window.attendanceChartInstance = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: options
        });
    },

    // Load admin dashboard (placeholder)
    async loadAdminDashboard() {
        // TODO: Implement admin dashboard loading
        console.log('Loading admin dashboard...');
    },

    // Load mark attendance page
    async loadMarkAttendance() {
        await attendanceManager.loadTodaysClasses();
    },

    // Load profile data
    loadProfile() {
        const user = authManager.getCurrentUser();
        if (!user) return;

        // Populate profile form
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            formUtils.populateForm(profileForm, {
                profileName: user.name,
                profileEmail: user.email,
                profilePhone: user.phone || '',
                profileStudentId: user.studentId || ''
            });
        }
    },

    // Load reports page
    async loadReports() {
        try {
            const user = authManager.getCurrentUser();
            if (!user) return;

            // Mock data for reports
            const mockReportsData = [
                { subject: 'Data Structures', total: 20, attended: 16, attendance: 80, status: 'good' },
                { subject: 'Database Systems', total: 18, attended: 14, attendance: 78, status: 'warning' },
                { subject: 'Computer Networks', total: 16, attended: 11, attendance: 69, status: 'danger' },
                { subject: 'Operating Systems', total: 15, attended: 13, attendance: 87, status: 'excellent' },
                { subject: 'Software Engineering', total: 12, attended: 11, attendance: 92, status: 'excellent' },
                { subject: 'Machine Learning', total: 10, attended: 7, attendance: 70, status: 'warning' }
            ];

            const tableBody = document.getElementById('reportsTableBody');
            if (tableBody) {
                tableBody.innerHTML = mockReportsData.map(subject => {
                    let statusClass = '';
                    let statusText = '';
                    
                    switch (subject.status) {
                        case 'excellent':
                            statusClass = 'text-success';
                            statusText = 'Excellent';
                            break;
                        case 'good':
                            statusClass = 'text-info';
                            statusText = 'Good';
                            break;
                        case 'warning':
                            statusClass = 'text-warning';
                            statusText = 'Warning';
                            break;
                        case 'danger':
                            statusClass = 'text-danger';
                            statusText = 'Critical';
                            break;
                    }

                    return `
                        <tr>
                            <td>${subject.subject}</td>
                            <td>${subject.total}</td>
                            <td>${subject.attended}</td>
                            <td>${subject.attendance}%</td>
                            <td><span class="${statusClass} fw-bold">${statusText}</span></td>
                        </tr>
                    `;
                }).join('');
            }

            // Set default date range (last 30 days)
            const today = new Date();
            const monthAgo = new Date(today);
            monthAgo.setDate(today.getDate() - 30);
            
            const dateFromInput = document.getElementById('reportDateFrom');
            const dateToInput = document.getElementById('reportDateTo');
            
            if (dateFromInput) dateFromInput.value = monthAgo.toISOString().split('T')[0];
            if (dateToInput) dateToInput.value = today.toISOString().split('T')[0];

        } catch (error) {
            console.error('Error loading reports:', error);
            toast.error('Failed to load reports');
        }
    },

    // Load timetable page (student view)
    async loadTimetable() {
        try {
            // Mock timetable data is already in the HTML
            // In a real implementation, this would fetch data from the backend
            console.log('Timetable page loaded');
        } catch (error) {
            console.error('Error loading timetable:', error);
            toast.error('Failed to load timetable');
        }
    },

    // Load timetables management page (admin view)
    async loadTimetables() {
        try {
            // Mock data for admin timetable management
            const mockTimetableData = [
                { branch: 'CSE', semester: '3', subject: 'Data Structures', day: 'Monday', time: '09:00-10:00', room: 'CS-101' },
                { branch: 'CSE', semester: '3', subject: 'Database Systems', day: 'Tuesday', time: '09:00-10:00', room: 'CS-102' },
                { branch: 'CSE', semester: '3', subject: 'Computer Networks', day: 'Wednesday', time: '09:00-10:00', room: 'CS-103' },
                { branch: 'ECE', semester: '2', subject: 'Digital Electronics', day: 'Monday', time: '10:00-11:00', room: 'ECE-201' },
                { branch: 'MECH', semester: '4', subject: 'Thermodynamics', day: 'Friday', time: '11:00-12:00', room: 'MECH-301' }
            ];

            const tableBody = document.getElementById('timetablesTableBody');
            if (tableBody) {
                tableBody.innerHTML = mockTimetableData.map((entry, index) => `
                    <tr>
                        <td>${entry.branch}</td>
                        <td>Semester ${entry.semester}</td>
                        <td>${entry.subject}</td>
                        <td>${entry.day}</td>
                        <td>${entry.time}</td>
                        <td>${entry.room}</td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary me-1" onclick="editTimetableEntry(${index})">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteTimetableEntry(${index})">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('');
            }

        } catch (error) {
            console.error('Error loading timetables:', error);
            toast.error('Failed to load timetables');
        }
    },

    // Load students management page (admin view)
    async loadStudents() {
        try {
            // Mock data for student management
            const mockStudentsData = [
                { id: 'STU001', name: 'John Doe', email: 'john.doe@example.com', branch: 'CSE', semester: '3', status: 'Active' },
                { id: 'STU002', name: 'Jane Smith', email: 'jane.smith@example.com', branch: 'ECE', semester: '2', status: 'Active' },
                { id: 'STU003', name: 'Bob Johnson', email: 'bob.johnson@example.com', branch: 'MECH', semester: '4', status: 'Active' },
                { id: 'STU004', name: 'Alice Brown', email: 'alice.brown@example.com', branch: 'CSE', semester: '1', status: 'Inactive' },
                { id: 'STU005', name: 'Charlie Wilson', email: 'charlie.wilson@example.com', branch: 'ECE', semester: '3', status: 'Active' }
            ];

            const tableBody = document.getElementById('studentsTableBody');
            if (tableBody) {
                tableBody.innerHTML = mockStudentsData.map((student, index) => `
                    <tr>
                        <td>${student.id}</td>
                        <td>${student.name}</td>
                        <td>${student.email}</td>
                        <td>${student.branch}</td>
                        <td>Semester ${student.semester}</td>
                        <td>
                            <span class="badge ${student.status === 'Active' ? 'bg-success' : 'bg-secondary'}">
                                ${student.status}
                            </span>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary me-1" onclick="editStudent(${index})">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteStudent(${index})">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('');
            }

        } catch (error) {
            console.error('Error loading students:', error);
            toast.error('Failed to load students');
        }
    },

    // Load subjects management page (admin view)
    async loadSubjects() {
        try {
            // Mock data for subject management
            const mockSubjectsData = [
                { code: 'CS301', name: 'Data Structures', branch: 'CSE', semester: '3', credits: 4 },
                { code: 'CS302', name: 'Database Systems', branch: 'CSE', semester: '3', credits: 3 },
                { code: 'CS303', name: 'Computer Networks', branch: 'CSE', semester: '3', credits: 3 },
                { code: 'ECE201', name: 'Digital Electronics', branch: 'ECE', semester: '2', credits: 4 },
                { code: 'MECH401', name: 'Thermodynamics', branch: 'MECH', semester: '4', credits: 3 }
            ];

            const tableBody = document.getElementById('subjectsTableBody');
            if (tableBody) {
                tableBody.innerHTML = mockSubjectsData.map((subject, index) => `
                    <tr>
                        <td>${subject.code}</td>
                        <td>${subject.name}</td>
                        <td>${subject.branch}</td>
                        <td>Semester ${subject.semester}</td>
                        <td>${subject.credits}</td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary me-1" onclick="editSubject(${index})">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteSubject(${index})">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('');
            }

        } catch (error) {
            console.error('Error loading subjects:', error);
            toast.error('Failed to load subjects');
        }
    }
};

// Global function to show pages
function showPage(pageId) {
    // Check authentication for protected pages
    const protectedPages = ['dashboard', 'markAttendance', 'timetable', 'reports', 'profile', 'students', 'subjects', 'timetables'];
    
    if (protectedPages.includes(pageId) && !authManager.isAuthenticated()) {
        toast.warning('Please login to access this page');
        PageManager.showPage('login');
        return;
    }

    // Check role-specific pages
    if (pageId === 'markAttendance' && !authManager.hasRole('student')) {
        toast.error('Access denied: Students only');
        return;
    }

    const adminPages = ['students', 'subjects', 'timetables'];
    if (adminPages.includes(pageId) && !authManager.hasRole('admin')) {
        toast.error('Access denied: Administrators only');
        return;
    }

    PageManager.showPage(pageId);
}

// Handle browser back/forward
window.addEventListener('popstate', function(event) {
    if (event.state && event.state.page) {
        showPage(event.state.page);
    }
});

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    // Check URL hash for initial page
    const hash = window.location.hash.substring(1);
    const initialPage = hash || 'login';
    
    // Wait a bit for authentication to initialize
    setTimeout(() => {
        if (authManager.isAuthenticated() && (initialPage === 'login' || initialPage === 'register')) {
            showPage('dashboard');
        } else {
            showPage(initialPage);
        }
    }, 100);

    // Initialize tooltips if Bootstrap is available
    if (typeof bootstrap !== 'undefined') {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function(tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }

    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + L for login page
        if ((e.ctrlKey || e.metaKey) && e.key === 'l' && !authManager.isAuthenticated()) {
            e.preventDefault();
            showPage('login');
        }
        
        // Ctrl/Cmd + D for dashboard (if authenticated)
        if ((e.ctrlKey || e.metaKey) && e.key === 'd' && authManager.isAuthenticated()) {
            e.preventDefault();
            showPage('dashboard');
        }
        
        // Escape key to close modals or go back
        if (e.key === 'Escape') {
            // Close any open Bootstrap modals
            const openModals = document.querySelectorAll('.modal.show');
            openModals.forEach(modal => {
                const modalInstance = bootstrap.Modal.getInstance(modal);
                if (modalInstance) {
                    modalInstance.hide();
                }
            });
        }
    });

    // Add click outside handler for dropdowns
    document.addEventListener('click', function(e) {
        const dropdowns = document.querySelectorAll('.dropdown-menu.show');
        dropdowns.forEach(dropdown => {
            if (!dropdown.contains(e.target) && !dropdown.previousElementSibling.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });
    });

    // Handle connection status
    window.addEventListener('online', function() {
        toast.success('Connection restored');
    });

    window.addEventListener('offline', function() {
        toast.warning('Connection lost. Some features may not work.');
    });

    // Add print functionality
    window.addEventListener('beforeprint', function() {
        // Add print-specific classes or modifications
        document.body.classList.add('printing');
    });

    window.addEventListener('afterprint', function() {
        document.body.classList.remove('printing');
    });

    // Add event delegation for navigation links and buttons
    document.addEventListener('click', function(e) {
        // Handle showPage links
        if (e.target.closest('[data-page]')) {
            e.preventDefault();
            const pageId = e.target.closest('[data-page]').getAttribute('data-page');
            showPage(pageId);
            return;
        }
        
        // Handle navigation links with onclick attributes (fallback)
        if (e.target.closest('[onclick*="showPage"]')) {
            e.preventDefault();
            const onclickAttr = e.target.closest('[onclick*="showPage"]').getAttribute('onclick');
            const pageMatch = onclickAttr.match(/showPage\('([^']+)'\)/);
            if (pageMatch) {
                showPage(pageMatch[1]);
            }
            return;
        }
        
        // Handle logout links
        if (e.target.closest('[onclick*="logout"]')) {
            e.preventDefault();
            logout();
            return;
        }
        
        // Handle any other navigation elements
        const target = e.target.closest('a, button');
        if (target) {
            const href = target.getAttribute('href');
            if (href === '#') {
                e.preventDefault();
            }
        }
    });
    
    console.log('College Attendance Tracker initialized successfully');
});

// Helper functions for timetable management
function addTimetableEntry() {
    const form = document.getElementById('addTimetableForm');
    const formData = new FormData(form);
    
    const entry = {
        branch: document.getElementById('timetableBranch').value,
        semester: document.getElementById('timetableSemester').value,
        subject: document.getElementById('timetableSubject').value,
        day: document.getElementById('timetableDay').value,
        time: document.getElementById('timetableTime').value,
        room: document.getElementById('timetableRoom').value
    };

    // Validate form
    if (!entry.branch || !entry.semester || !entry.subject || !entry.day || !entry.time || !entry.room) {
        toast.error('Please fill in all fields');
        return;
    }

    // In a real implementation, this would send data to the backend
    console.log('Adding timetable entry:', entry);
    toast.success('Timetable entry added successfully');
    
    // Close modal and reset form
    const modal = bootstrap.Modal.getInstance(document.getElementById('addTimetableModal'));
    modal.hide();
    form.reset();
    
    // Reload timetables
    PageManager.loadTimetables();
}

function editTimetableEntry(index) {
    // In a real implementation, this would open an edit modal with pre-filled data
    toast.info('Edit functionality would be implemented here');
}

function deleteTimetableEntry(index) {
    if (confirm('Are you sure you want to delete this timetable entry?')) {
        // In a real implementation, this would send a delete request to the backend
        toast.success('Timetable entry deleted successfully');
        PageManager.loadTimetables();
    }
}

function filterTimetables() {
    const branch = document.getElementById('timetableFilterBranch').value;
    const semester = document.getElementById('timetableFilterSemester').value;
    
    // In a real implementation, this would filter the timetable data
    console.log('Filtering timetables:', { branch, semester });
    toast.info('Filter functionality would be implemented here');
}

// Student management functions
function addStudent() {
    const form = document.getElementById('addStudentForm');
    
    const student = {
        id: document.getElementById('studentId').value,
        name: document.getElementById('studentName').value,
        email: document.getElementById('studentEmail').value,
        branch: document.getElementById('studentBranch').value,
        semester: document.getElementById('studentSemester').value,
        phone: document.getElementById('studentPhone').value
    };

    // Validate form
    if (!student.id || !student.name || !student.email || !student.branch || !student.semester) {
        toast.error('Please fill in all required fields');
        return;
    }

    // In a real implementation, this would send data to the backend
    console.log('Adding student:', student);
    toast.success('Student added successfully');
    
    // Close modal and reset form
    const modal = bootstrap.Modal.getInstance(document.getElementById('addStudentModal'));
    modal.hide();
    form.reset();
    
    // Reload students
    PageManager.loadStudents();
}

function editStudent(index) {
    // In a real implementation, this would open an edit modal with pre-filled data
    toast.info('Edit student functionality would be implemented here');
}

function deleteStudent(index) {
    if (confirm('Are you sure you want to delete this student?')) {
        // In a real implementation, this would send a delete request to the backend
        toast.success('Student deleted successfully');
        PageManager.loadStudents();
    }
}

// Subject management functions
function addSubject() {
    const form = document.getElementById('addSubjectForm');
    
    const subject = {
        code: document.getElementById('subjectCode').value,
        name: document.getElementById('subjectName').value,
        branch: document.getElementById('subjectBranch').value,
        semester: document.getElementById('subjectSemester').value,
        credits: document.getElementById('subjectCredits').value,
        description: document.getElementById('subjectDescription').value
    };

    // Validate form
    if (!subject.code || !subject.name || !subject.branch || !subject.semester || !subject.credits) {
        toast.error('Please fill in all required fields');
        return;
    }

    // In a real implementation, this would send data to the backend
    console.log('Adding subject:', subject);
    toast.success('Subject added successfully');
    
    // Close modal and reset form
    const modal = bootstrap.Modal.getInstance(document.getElementById('addSubjectModal'));
    modal.hide();
    form.reset();
    
    // Reload subjects
    PageManager.loadSubjects();
}

function editSubject(index) {
    // In a real implementation, this would open an edit modal with pre-filled data
    toast.info('Edit subject functionality would be implemented here');
}

function deleteSubject(index) {
    if (confirm('Are you sure you want to delete this subject?')) {
        // In a real implementation, this would send a delete request to the backend
        toast.success('Subject deleted successfully');
        PageManager.loadSubjects();
    }
}

// Export PageManager for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PageManager, showPage };
}
