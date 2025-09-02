// Utility functions for College Attendance Tracker

// API configuration
const API_BASE_URL = window.location.origin;
const API_ENDPOINTS = {
    // Auth endpoints
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
    UPDATE_PROFILE: '/api/auth/updateprofile',
    UPDATE_PASSWORD: '/api/auth/updatepassword',
    FORGOT_PASSWORD: '/api/auth/forgotpassword',
    RESET_PASSWORD: '/api/auth/resetpassword',
    
    // Dashboard endpoints
    DASHBOARD: '/api/dashboard',
    ATTENDANCE_SUMMARY: '/api/attendance/summary',
    MARK_ATTENDANCE: '/api/attendance/mark',
    TODAY_CLASSES: '/api/timetable/today',
    UPCOMING_CLASSES: '/api/timetable/upcoming',
    
    // Admin endpoints
    ADMIN_DASHBOARD: '/api/admin/dashboard',
    MANAGE_STUDENTS: '/api/admin/students',
    MANAGE_BRANCHES: '/api/admin/branches',
    MANAGE_SUBJECTS: '/api/admin/subjects',
    MANAGE_TIMETABLES: '/api/admin/timetables'
};

// Local storage keys
const STORAGE_KEYS = {
    TOKEN: 'attendance_token',
    USER: 'attendance_user',
    THEME: 'attendance_theme',
    LANGUAGE: 'attendance_language'
};

// Utility class for HTTP requests
class APIClient {
    constructor() {
        this.token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    }

    // Set authorization token
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        } else {
            localStorage.removeItem(STORAGE_KEYS.TOKEN);
        }
    }

    // Get authorization headers
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (this.token) {
            headers.Authorization = `Bearer ${this.token}`;
        }

        return headers;
    }

    // Make HTTP request
    async request(url, options = {}) {
        const config = {
            headers: this.getHeaders(),
            ...options
        };

        try {
            const response = await fetch(API_BASE_URL + url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // GET request
    async get(url) {
        return this.request(url, { method: 'GET' });
    }

    // POST request
    async post(url, data = {}) {
        return this.request(url, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // PUT request
    async put(url, data = {}) {
        return this.request(url, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // DELETE request
    async delete(url) {
        return this.request(url, { method: 'DELETE' });
    }
}

// Global API client instance
const api = new APIClient();

// Toast notification system
class ToastManager {
    constructor() {
        this.container = document.getElementById('toastContainer');
        this.toastCounter = 0;
    }

    show(message, type = 'info', duration = 5000) {
        const toastId = `toast-${++this.toastCounter}`;
        const iconMap = {
            success: 'bi-check-circle-fill',
            error: 'bi-exclamation-triangle-fill',
            warning: 'bi-exclamation-triangle-fill',
            info: 'bi-info-circle-fill'
        };

        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-bg-${type === 'error' ? 'danger' : type} border-0`;
        toast.id = toastId;
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="bi ${iconMap[type]} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;

        this.container.appendChild(toast);

        const bsToast = new bootstrap.Toast(toast, { autohide: duration > 0, delay: duration });
        bsToast.show();

        // Remove toast element after it's hidden
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });

        return toastId;
    }

    success(message, duration = 5000) {
        return this.show(message, 'success', duration);
    }

    error(message, duration = 7000) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration = 6000) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration = 5000) {
        return this.show(message, 'info', duration);
    }
}

// Global toast manager instance
const toast = new ToastManager();

// Loading overlay utilities
const loadingOverlay = {
    show() {
        document.getElementById('loadingOverlay').style.display = 'flex';
    },

    hide() {
        document.getElementById('loadingOverlay').style.display = 'none';
    }
};

// Form utilities
const formUtils = {
    // Show loading state on button
    setButtonLoading(button, loading = true) {
        const textSpan = button.querySelector('.btn-text');
        const spinner = button.querySelector('.btn-spinner');

        if (loading) {
            if (textSpan) textSpan.classList.add('d-none');
            if (spinner) spinner.classList.remove('d-none');
            button.disabled = true;
        } else {
            if (textSpan) textSpan.classList.remove('d-none');
            if (spinner) spinner.classList.add('d-none');
            button.disabled = false;
        }
    },

    // Get form data as object
    getFormData(form) {
        const formData = new FormData(form);
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        return data;
    },

    // Populate form with data
    populateForm(form, data) {
        Object.keys(data).forEach(key => {
            const field = form.querySelector(`[name="${key}"], #${key}`);
            if (field) {
                if (field.type === 'checkbox') {
                    field.checked = data[key];
                } else if (field.type === 'radio') {
                    const radio = form.querySelector(`[name="${key}"][value="${data[key]}"]`);
                    if (radio) radio.checked = true;
                } else {
                    field.value = data[key];
                }
            }
        });
    },

    // Clear form
    clearForm(form) {
        form.reset();
        // Clear any validation states
        form.classList.remove('was-validated');
        const fields = form.querySelectorAll('.form-control, .form-select');
        fields.forEach(field => {
            field.classList.remove('is-valid', 'is-invalid');
        });
    }
};

// Date and time utilities
const dateUtils = {
    // Format date for display
    formatDate(date, format = 'short') {
        const d = new Date(date);
        const options = {
            short: { year: 'numeric', month: 'short', day: 'numeric' },
            long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
            time: { hour: '2-digit', minute: '2-digit' },
            datetime: { 
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit' 
            }
        };
        return d.toLocaleDateString('en-US', options[format]);
    },

    // Get current date string
    getCurrentDate(format = 'short') {
        return this.formatDate(new Date(), format);
    },

    // Check if date is today
    isToday(date) {
        const today = new Date();
        const checkDate = new Date(date);
        return today.toDateString() === checkDate.toDateString();
    },

    // Get day of week
    getDayOfWeek(date) {
        return new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    },

    // Format time (HH:MM)
    formatTime(timeString) {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':');
        return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    }
};

// Attendance utilities
const attendanceUtils = {
    // Calculate attendance percentage
    calculatePercentage(attended, total) {
        if (total === 0) return 0;
        return Math.round((attended / total) * 100);
    },

    // Get attendance status class
    getAttendanceClass(percentage) {
        if (percentage >= 90) return 'excellent';
        if (percentage >= 80) return 'good';
        if (percentage >= 75) return 'warning';
        return 'danger';
    },

    // Get attendance color
    getAttendanceColor(percentage) {
        if (percentage >= 90) return '#28a745';
        if (percentage >= 80) return '#20c997';
        if (percentage >= 75) return '#ffc107';
        return '#dc3545';
    },

    // Calculate classes that can be missed
    calculateClassesToMiss(attended, total, targetPercentage = 75) {
        // Formula: (attended - targetPercentage * (total + x)) / (1 - targetPercentage/100) = x
        // Where x is the number of classes that can be missed
        const target = targetPercentage / 100;
        let canMiss = 0;
        
        while (true) {
            const newTotal = total + canMiss + 1;
            const newPercentage = (attended / newTotal) * 100;
            if (newPercentage >= targetPercentage) {
                canMiss++;
            } else {
                break;
            }
        }
        
        return canMiss;
    },

    // Calculate classes that must be attended
    calculateClassesToAttend(attended, total, targetPercentage = 75) {
        const currentPercentage = this.calculatePercentage(attended, total);
        if (currentPercentage >= targetPercentage) return 0;
        
        const target = targetPercentage / 100;
        // Formula: (attended + x) / (total + x) >= target
        // Solving: x >= (target * total - attended) / (1 - target)
        const mustAttend = Math.ceil((target * total - attended) / (1 - target));
        return Math.max(0, mustAttend);
    }
};

// Validation utilities
const validation = {
    // Email validation
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Phone validation
    isValidPhone(phone) {
        const phoneRegex = /^[0-9]{10}$/;
        return phoneRegex.test(phone.replace(/\D/g, ''));
    },

    // Password validation
    validatePassword(password) {
        const errors = [];
        
        if (password.length < 6) {
            errors.push('Password must be at least 6 characters long');
        }
        
        if (!/(?=.*[a-z])/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        
        if (!/(?=.*[A-Z])/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        
        if (!/(?=.*\d)/.test(password)) {
            errors.push('Password must contain at least one number');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    },

    // Show field validation error
    showFieldError(field, message) {
        field.classList.add('is-invalid');
        field.classList.remove('is-valid');
        
        let feedback = field.parentNode.querySelector('.invalid-feedback');
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.className = 'invalid-feedback';
            field.parentNode.appendChild(feedback);
        }
        feedback.textContent = message;
    },

    // Show field validation success
    showFieldSuccess(field) {
        field.classList.add('is-valid');
        field.classList.remove('is-invalid');
        
        const feedback = field.parentNode.querySelector('.invalid-feedback');
        if (feedback) {
            feedback.remove();
        }
    },

    // Clear field validation
    clearFieldValidation(field) {
        field.classList.remove('is-valid', 'is-invalid');
        const feedback = field.parentNode.querySelector('.invalid-feedback');
        if (feedback) {
            feedback.remove();
        }
    }
};

// Theme utilities
const themeUtils = {
    // Set theme
    setTheme(theme) {
        document.body.className = theme === 'dark' ? 'dark-mode' : '';
        localStorage.setItem(STORAGE_KEYS.THEME, theme);
    },

    // Get current theme
    getTheme() {
        return localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
    },

    // Toggle theme
    toggleTheme() {
        const currentTheme = this.getTheme();
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
        return newTheme;
    }
};

// Chart utilities
const chartUtils = {
    // Common chart options
    getDefaultOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        };
    },

    // Generate colors for charts
    generateColors(count) {
        const colors = [
            '#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8',
            '#6610f2', '#e83e8c', '#fd7e14', '#20c997', '#6f42c1'
        ];
        
        const result = [];
        for (let i = 0; i < count; i++) {
            result.push(colors[i % colors.length]);
        }
        return result;
    }
};

// Export utilities for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        API_ENDPOINTS,
        STORAGE_KEYS,
        api,
        toast,
        loadingOverlay,
        formUtils,
        dateUtils,
        attendanceUtils,
        validation,
        themeUtils,
        chartUtils
    };
}
