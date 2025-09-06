// Authentication functionality for College Attendance Tracker

// Authentication manager
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        this.branches = []; // Cache branches for registration
    }

    // Initialize authentication system
    async init() {
        // Set initial theme
        themeUtils.setTheme(themeUtils.getTheme());

        // Check if user is already logged in
        if (this.token) {
            try {
                const response = await api.get(API_ENDPOINTS.ME);
                if (response.success) {
                    this.currentUser = response.user;
                    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(this.currentUser));
                    this.updateUI(true);
                    return true;
                }
            } catch (error) {
                console.error('Token validation failed:', error);
                this.logout();
            }
        }

        this.updateUI(false);
        return false;
    }

    // Login user
    async login(email, password, rememberMe = false) {
        try {
            const response = await api.post(API_ENDPOINTS.LOGIN, {
                email,
                password,
                rememberMe
            });

            if (response.success) {
                this.currentUser = response.user;
                this.token = response.token;
                
                // Store in localStorage
                api.setToken(this.token);
                localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(this.currentUser));
                
                this.updateUI(true);
                toast.success(`Welcome back, ${this.currentUser.name}!`);
                
                // Redirect to dashboard
                showPage('dashboard');
                
                return { success: true, user: this.currentUser };
            }
        } catch (error) {
            console.error('Login failed:', error);
            return { success: false, message: error.message };
        }
    }

    // Register user
    async register(userData) {
        try {
            const response = await api.post(API_ENDPOINTS.REGISTER, userData);

            if (response.success) {
                this.currentUser = response.user;
                this.token = response.token;
                
                // Store in localStorage
                api.setToken(this.token);
                localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(this.currentUser));
                
                this.updateUI(true);
                toast.success(`Welcome to College Attendance Tracker, ${this.currentUser.name}!`);
                
                // Redirect to dashboard
                showPage('dashboard');
                
                return { success: true, user: this.currentUser };
            }
        } catch (error) {
            console.error('Registration failed:', error);
            return { success: false, message: error.message };
        }
    }

    // Logout user
    async logout() {
        try {
            // Call logout endpoint
            await api.post(API_ENDPOINTS.LOGOUT);
        } catch (error) {
            console.error('Logout API call failed:', error);
        }

        // Clear local storage
        this.currentUser = null;
        this.token = null;
        api.setToken(null);
        localStorage.removeItem(STORAGE_KEYS.USER);
        
        this.updateUI(false);
        toast.info('You have been logged out successfully');
        
        // Redirect to login page
        showPage('login');
    }

    // Forgot password
    async forgotPassword(email) {
        try {
            const response = await api.post(API_ENDPOINTS.FORGOT_PASSWORD, { email });
            return { success: response.success, message: response.message };
        } catch (error) {
            console.error('Forgot password failed:', error);
            return { success: false, message: error.message };
        }
    }

    // Update profile
    async updateProfile(profileData) {
        try {
            const response = await api.put(API_ENDPOINTS.UPDATE_PROFILE, profileData);
            
            if (response.success) {
                this.currentUser = response.user;
                localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(this.currentUser));
                this.updateUserDisplay();
                return { success: true, user: this.currentUser };
            }
        } catch (error) {
            console.error('Profile update failed:', error);
            return { success: false, message: error.message };
        }
    }

    // Update password
    async updatePassword(currentPassword, newPassword) {
        try {
            const response = await api.put(API_ENDPOINTS.UPDATE_PASSWORD, {
                currentPassword,
                newPassword
            });
            
            if (response.success) {
                // Update token
                this.token = response.token;
                api.setToken(this.token);
                return { success: true };
            }
        } catch (error) {
            console.error('Password update failed:', error);
            return { success: false, message: error.message };
        }
    }

    // Load branches for registration
    async loadBranches() {
        console.log('Loading branches...');
        try {
            const response = await fetch('/api/branches');
            console.log('Branch API response status:', response.status);
            
            if (response.ok) {
                const result = await response.json();
                console.log('Branch API result:', result);
                this.branches = result.data || [];
                console.log('Loaded branches:', this.branches);
            } else {
                // Fallback to hardcoded branches if API fails
                console.warn('Failed to load branches from API, using fallback');
                this.branches = [
                    { _id: 'cse', name: 'Computer Science Engineering', code: 'CSE' },
                    { _id: 'ece', name: 'Electronics and Communication Engineering', code: 'ECE' },
                    { _id: 'me', name: 'Mechanical Engineering', code: 'ME' },
                    { _id: 'ce', name: 'Civil Engineering', code: 'CE' },
                    { _id: 'it', name: 'Information Technology', code: 'IT' },
                    { _id: 'eee', name: 'Electrical and Electronics Engineering', code: 'EEE' },
                    { _id: 'chem', name: 'Chemical Engineering', code: 'CHEM' },
                    { _id: 'bio', name: 'Biotechnology', code: 'BIO' }
                ];
            }
        } catch (error) {
            console.error('Error loading branches:', error);
            // Fallback to hardcoded branches
            this.branches = [
                { _id: 'cse', name: 'Computer Science Engineering', code: 'CSE' },
                { _id: 'ece', name: 'Electronics and Communication Engineering', code: 'ECE' },
                { _id: 'me', name: 'Mechanical Engineering', code: 'ME' },
                { _id: 'ce', name: 'Civil Engineering', code: 'CE' },
                { _id: 'it', name: 'Information Technology', code: 'IT' },
                { _id: 'eee', name: 'Electrical and Electronics Engineering', code: 'EEE' },
                { _id: 'chem', name: 'Chemical Engineering', code: 'CHEM' },
                { _id: 'bio', name: 'Biotechnology', code: 'BIO' }
            ];
        }

        // Populate branch select
        const branchSelect = document.getElementById('registerBranch');
        console.log('Branch select element:', branchSelect);
        
        if (branchSelect) {
            branchSelect.innerHTML = '<option value="">Select Branch</option>';
            this.branches.forEach(branch => {
                const option = document.createElement('option');
                // Use branch code instead of ObjectId for easier backend handling
                option.value = branch.code;
                option.textContent = `${branch.name} (${branch.code})`;
                branchSelect.appendChild(option);
            });
            console.log('Branch dropdown populated with', this.branches.length, 'options');
        } else {
            console.error('Branch select element not found');
        }

        return this.branches;
    }

    // Update UI based on authentication state
    updateUI(isAuthenticated) {
        const authButtons = document.getElementById('authButtons');
        const userDropdown = document.getElementById('userDropdown');
        const navItems = document.getElementById('navItems');

        if (isAuthenticated && this.currentUser) {
            // Hide auth buttons, show user dropdown
            authButtons.style.display = 'none';
            userDropdown.style.display = 'block';
            
            // Update user display
            this.updateUserDisplay();
            
            // Show navigation items based on role
            this.updateNavigation();
        } else {
            // Show auth buttons, hide user dropdown
            authButtons.style.display = 'flex';
            userDropdown.style.display = 'none';
            
            // Clear navigation items
            navItems.innerHTML = '';
        }
    }

    // Update user display in navigation
    updateUserDisplay() {
        if (this.currentUser) {
            const userNameNav = document.getElementById('userNameNav');
            const userNameDashboard = document.getElementById('userNameDashboard');
            
            if (userNameNav) {
                userNameNav.textContent = this.currentUser.name;
            }
            
            if (userNameDashboard) {
                userNameDashboard.textContent = this.currentUser.name;
            }
        }
    }

    // Update navigation based on user role
    updateNavigation() {
        const navItems = document.getElementById('navItems');
        
        if (!this.currentUser) return;

        let menuItems = [];

        if (this.currentUser.role === 'student') {
            menuItems = [
                { id: 'dashboard', text: 'Dashboard', icon: 'bi-speedometer2' },
                { id: 'markAttendance', text: 'Mark Attendance', icon: 'bi-check2-square' },
                { id: 'timetable', text: 'Timetable', icon: 'bi-calendar3' },
                { id: 'reports', text: 'Reports', icon: 'bi-graph-up' }
            ];
        } else if (this.currentUser.role === 'admin') {
            menuItems = [
                { id: 'dashboard', text: 'Dashboard', icon: 'bi-speedometer2' },
                { id: 'students', text: 'Students', icon: 'bi-people' },
                { id: 'subjects', text: 'Subjects', icon: 'bi-book' },
                { id: 'timetables', text: 'Timetables', icon: 'bi-calendar3' },
                { id: 'reports', text: 'Reports', icon: 'bi-graph-up' }
            ];
        }

        navItems.innerHTML = menuItems.map(item => `
            <li class="nav-item">
                <a class="nav-link" href="#" onclick="showPage('${item.id}')">
                    <i class="bi ${item.icon} me-1"></i>
                    ${item.text}
                </a>
            </li>
        `).join('');
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.currentUser !== null && this.token !== null;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if user has role
    hasRole(role) {
        return this.currentUser && this.currentUser.role === role;
    }
}

// Initialize authentication manager
const authManager = new AuthManager();

// Form event handlers
document.addEventListener('DOMContentLoaded', function() {
    // Login form handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const rememberMe = document.getElementById('rememberMe').checked;

            // Clear previous validation
            validation.clearFieldValidation(document.getElementById('loginEmail'));
            validation.clearFieldValidation(document.getElementById('loginPassword'));

            // Validate inputs
            let isValid = true;

            if (!email) {
                validation.showFieldError(document.getElementById('loginEmail'), 'Email is required');
                isValid = false;
            } else if (!validation.isValidEmail(email)) {
                validation.showFieldError(document.getElementById('loginEmail'), 'Please enter a valid email');
                isValid = false;
            }

            if (!password) {
                validation.showFieldError(document.getElementById('loginPassword'), 'Password is required');
                isValid = false;
            }

            if (!isValid) return;

            // Show loading state
            formUtils.setButtonLoading(submitBtn, true);

            try {
                const result = await authManager.login(email, password, rememberMe);
                
                if (!result.success) {
                    toast.error(result.message || 'Login failed');
                }
            } catch (error) {
                toast.error('An error occurred during login');
            } finally {
                formUtils.setButtonLoading(submitBtn, false);
            }
        });
    }

    // Register form handler
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        // Load branches initially for the registration form
        authManager.loadBranches();
        
        // Role change handler
        const roleSelect = document.getElementById('registerRole');
        const studentFields = document.getElementById('studentFields');
        
        roleSelect.addEventListener('change', function() {
            if (this.value === 'student') {
                studentFields.style.display = 'block';
                // Ensure branches are loaded when student role is selected
                if (authManager.branches.length === 0) {
                    authManager.loadBranches();
                }
            } else {
                studentFields.style.display = 'none';
            }
        });
        

        // Initial check if student role is already selected
        if (roleSelect.value === 'student') {
            studentFields.style.display = 'block';
        }

        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('button[type="submit"]');
            
            // Get form data
            const formData = {
                name: document.getElementById('registerName').value,
                email: document.getElementById('registerEmail').value,
                phone: document.getElementById('registerPhone').value,
                role: document.getElementById('registerRole').value,
                password: document.getElementById('registerPassword').value
            };

            const confirmPassword = document.getElementById('confirmPassword').value;

            // Add student-specific fields
            if (formData.role === 'student') {
                formData.branch = document.getElementById('registerBranch').value;
                formData.semester = parseInt(document.getElementById('registerSemester').value);
            }

            // Clear previous validation
            Object.keys(formData).forEach(key => {
                const field = document.getElementById(`register${key.charAt(0).toUpperCase() + key.slice(1)}`);
                if (field) validation.clearFieldValidation(field);
            });

            // Validate inputs
            let isValid = true;

            if (!formData.name) {
                validation.showFieldError(document.getElementById('registerName'), 'Name is required');
                isValid = false;
            }

            if (!formData.email) {
                validation.showFieldError(document.getElementById('registerEmail'), 'Email is required');
                isValid = false;
            } else if (!validation.isValidEmail(formData.email)) {
                validation.showFieldError(document.getElementById('registerEmail'), 'Please enter a valid email');
                isValid = false;
            }

            if (!formData.phone) {
                validation.showFieldError(document.getElementById('registerPhone'), 'Phone is required');
                isValid = false;
            } else if (!validation.isValidPhone(formData.phone)) {
                validation.showFieldError(document.getElementById('registerPhone'), 'Please enter a valid 10-digit phone number');
                isValid = false;
            }

            if (!formData.role) {
                validation.showFieldError(document.getElementById('registerRole'), 'Role is required');
                isValid = false;
            }

            if (formData.role === 'student') {
                if (!formData.branch) {
                    validation.showFieldError(document.getElementById('registerBranch'), 'Branch is required for students');
                    isValid = false;
                }
                
                if (!formData.semester) {
                    validation.showFieldError(document.getElementById('registerSemester'), 'Semester is required for students');
                    isValid = false;
                }
            }

            if (!formData.password) {
                validation.showFieldError(document.getElementById('registerPassword'), 'Password is required');
                isValid = false;
            } else {
                const passwordValidation = validation.validatePassword(formData.password);
                if (!passwordValidation.isValid) {
                    validation.showFieldError(document.getElementById('registerPassword'), passwordValidation.errors[0]);
                    isValid = false;
                }
            }

            if (formData.password !== confirmPassword) {
                validation.showFieldError(document.getElementById('confirmPassword'), 'Passwords do not match');
                isValid = false;
            }

            if (!isValid) return;

            // Show loading state
            formUtils.setButtonLoading(submitBtn, true);

            try {
                const result = await authManager.register(formData);
                
                if (!result.success) {
                    toast.error(result.message || 'Registration failed');
                }
            } catch (error) {
                toast.error('An error occurred during registration');
            } finally {
                formUtils.setButtonLoading(submitBtn, false);
            }
        });
    }

    // Forgot password form handler
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const email = document.getElementById('forgotEmail').value;

            // Clear previous validation
            validation.clearFieldValidation(document.getElementById('forgotEmail'));

            // Validate email
            if (!email) {
                validation.showFieldError(document.getElementById('forgotEmail'), 'Email is required');
                return;
            } else if (!validation.isValidEmail(email)) {
                validation.showFieldError(document.getElementById('forgotEmail'), 'Please enter a valid email');
                return;
            }

            // Show loading state
            formUtils.setButtonLoading(submitBtn, true);

            try {
                const result = await authManager.forgotPassword(email);
                
                if (result.success) {
                    toast.success('Password reset link has been sent to your email');
                    formUtils.clearForm(this);
                } else {
                    toast.error(result.message || 'Failed to send reset email');
                }
            } catch (error) {
                toast.error('An error occurred while processing your request');
            } finally {
                formUtils.setButtonLoading(submitBtn, false);
            }
        });
    }

    // Profile form handler
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('button[type="submit"]');
            
            const formData = {
                name: document.getElementById('profileName').value,
                email: document.getElementById('profileEmail').value,
                phone: document.getElementById('profilePhone').value
            };

            // Validate inputs
            let isValid = true;

            if (!formData.name) {
                validation.showFieldError(document.getElementById('profileName'), 'Name is required');
                isValid = false;
            }

            if (!formData.email) {
                validation.showFieldError(document.getElementById('profileEmail'), 'Email is required');
                isValid = false;
            } else if (!validation.isValidEmail(formData.email)) {
                validation.showFieldError(document.getElementById('profileEmail'), 'Please enter a valid email');
                isValid = false;
            }

            if (formData.phone && !validation.isValidPhone(formData.phone)) {
                validation.showFieldError(document.getElementById('profilePhone'), 'Please enter a valid phone number');
                isValid = false;
            }

            if (!isValid) return;

            // Show loading state
            formUtils.setButtonLoading(submitBtn, true);

            try {
                const result = await authManager.updateProfile(formData);
                
                if (result.success) {
                    toast.success('Profile updated successfully');
                } else {
                    toast.error(result.message || 'Failed to update profile');
                }
            } catch (error) {
                toast.error('An error occurred while updating profile');
            } finally {
                formUtils.setButtonLoading(submitBtn, false);
            }
        });
    }

    // Password change form handler
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmNewPassword = document.getElementById('confirmNewPassword').value;

            // Clear previous validation
            ['currentPassword', 'newPassword', 'confirmNewPassword'].forEach(id => {
                validation.clearFieldValidation(document.getElementById(id));
            });

            // Validate inputs
            let isValid = true;

            if (!currentPassword) {
                validation.showFieldError(document.getElementById('currentPassword'), 'Current password is required');
                isValid = false;
            }

            if (!newPassword) {
                validation.showFieldError(document.getElementById('newPassword'), 'New password is required');
                isValid = false;
            } else {
                const passwordValidation = validation.validatePassword(newPassword);
                if (!passwordValidation.isValid) {
                    validation.showFieldError(document.getElementById('newPassword'), passwordValidation.errors[0]);
                    isValid = false;
                }
            }

            if (newPassword !== confirmNewPassword) {
                validation.showFieldError(document.getElementById('confirmNewPassword'), 'Passwords do not match');
                isValid = false;
            }

            if (!isValid) return;

            // Show loading state
            formUtils.setButtonLoading(submitBtn, true);

            try {
                const result = await authManager.updatePassword(currentPassword, newPassword);
                
                if (result.success) {
                    toast.success('Password updated successfully');
                    formUtils.clearForm(this);
                } else {
                    toast.error(result.message || 'Failed to update password');
                }
            } catch (error) {
                toast.error('An error occurred while updating password');
            } finally {
                formUtils.setButtonLoading(submitBtn, false);
            }
        });
    }

    // Initialize authentication on page load
    authManager.init();
});

// Global logout function
function logout() {
    authManager.logout();
}
