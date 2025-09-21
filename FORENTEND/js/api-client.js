/**
 * Local Storage Client for Study Tracker Frontend
 * Handles all data storage using localStorage (no backend required)
 */

class LocalStorageClient {
    constructor() {
        this.storageKey = 'study_tracker_data';
        this.initializeData();
    }

    /**
     * Initialize default data structure
     */
    initializeData() {
        if (!localStorage.getItem(this.storageKey)) {
            const defaultData = {
                users: [
                    {
                        id: '1',
                        username: 'demo',
                        email: 'demo@studytracker.com',
                        password: '123456', // In real app, this would be hashed
                        first_name: 'Demo',
                        last_name: 'User',
                        role: 'user',
                        is_active: true,
                        created_at: new Date().toISOString()
                    }
                ],
                tasks: [],
                notes: [],
                diary: [],
                feedback: [],
                notices: [
                    {
                        id: '1',
                        title: 'Welcome to Study Tracker!',
                        content: 'This is a standalone version of Study Tracker that works without a backend. All your data is stored locally in your browser.',
                        is_active: true,
                        priority: 'high',
                        created_at: new Date().toISOString()
                    }
                ],
                currentUser: null
            };
            localStorage.setItem(this.storageKey, JSON.stringify(defaultData));
        }
    }

    /**
     * Get all data
     */
    getData() {
        return JSON.parse(localStorage.getItem(this.storageKey) || '{}');
    }

    /**
     * Save all data
     */
    saveData(data) {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }

    /**
     * Generate unique ID
     */
    generateId() {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }

    // Authentication methods
    async login(username, password) {
        const data = this.getData();
        const user = data.users.find(u => 
            (u.username === username || u.email === username) && 
            u.password === password
        );
        
        if (user) {
            data.currentUser = user;
            this.saveData(data);
            return {
                success: true,
                user: user,
                message: 'Login successful'
            };
        } else {
            throw new Error('Invalid credentials');
        }
    }

    async register(userData) {
        const data = this.getData();
        
        // Check if user already exists
        const existingUser = data.users.find(u => 
            u.username === userData.username || u.email === userData.email
        );
        
        if (existingUser) {
            throw new Error('User already exists with this username or email');
        }
        
        // Generate OTP for verification
        const otpCode = this.generateOTP();
        const otpExpiry = Date.now() + (10 * 60 * 1000); // 10 minutes
        
        // Store pending registration
        if (!data.pendingRegistrations) {
            data.pendingRegistrations = [];
        }
        
        const pendingRegistration = {
            id: this.generateId(),
            ...userData,
            otp_code: otpCode,
            otp_expiry: otpExpiry,
            created_at: new Date().toISOString()
        };
        
        data.pendingRegistrations.push(pendingRegistration);
        this.saveData(data);
        
        // In a real app, you would send OTP via email
        // For demo purposes, we'll show it in console and alert
        console.log(`OTP for ${userData.email}: ${otpCode}`);
        alert(`Demo OTP for ${userData.email}: ${otpCode}\n\n(In production, this would be sent via email)`);
        
        return {
            success: true,
            message: 'Registration successful! Please check your email for OTP verification.',
            data: {
                email: userData.email,
                expires_in: 600 // 10 minutes
            }
        };
    }

    async verifyOTP(email, otpCode) {
        const data = this.getData();
        
        if (!data.pendingRegistrations) {
            throw new Error('No pending registration found');
        }
        
        const pendingRegistration = data.pendingRegistrations.find(pr => 
            pr.email === email && 
            pr.otp_code === otpCode &&
            pr.otp_expiry > Date.now()
        );
        
        if (!pendingRegistration) {
            throw new Error('Invalid or expired OTP');
        }
        
        // Create user account
        const user = {
            id: this.generateId(),
            username: pendingRegistration.username,
            email: pendingRegistration.email,
            password: pendingRegistration.password, // In real app, this would be hashed
            first_name: pendingRegistration.first_name,
            last_name: pendingRegistration.last_name,
            role: 'user',
            is_active: true,
            is_email_verified: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            preferences: {
                theme: 'light',
                notifications: true,
                language: 'en'
            },
            study_stats: {
                total_tasks: 0,
                completed_tasks: 0,
                total_study_time: 0,
                streak_days: 0
            }
        };
        
        // Add user to users array
        data.users.push(user);
        
        // Remove pending registration
        data.pendingRegistrations = data.pendingRegistrations.filter(pr => pr.id !== pendingRegistration.id);
        
        this.saveData(data);
        
        return {
            success: true,
            message: 'Email verified successfully! You can now login.',
            data: { email: email }
        };
    }

    async requestLoginOTP(email) {
        const data = this.getData();
        const user = data.users.find(u => u.email === email);
        
        if (!user) {
            throw new Error('User not found');
        }
        
        // Generate OTP
        const otpCode = this.generateOTP();
        const otpExpiry = Date.now() + (10 * 60 * 1000); // 10 minutes
        
        // Store OTP for login
        if (!data.loginOTPs) {
            data.loginOTPs = [];
        }
        
        const loginOTP = {
            email: email,
            otp_code: otpCode,
            otp_expiry: otpExpiry,
            created_at: new Date().toISOString()
        };
        
        data.loginOTPs.push(loginOTP);
        this.saveData(data);
        
        // In a real app, you would send OTP via email
        console.log(`Login OTP for ${email}: ${otpCode}`);
        alert(`Demo Login OTP for ${email}: ${otpCode}\n\n(In production, this would be sent via email)`);
        
        return {
            message: 'OTP sent to your email',
            expires_in: 600, // 10 minutes
            email: email
        };
    }

    async logout() {
        const data = this.getData();
        data.currentUser = null;
        this.saveData(data);
        return { success: true, message: 'Logged out successfully' };
    }

    async getCurrentUser() {
        const data = this.getData();
        return data.currentUser;
    }

    /**
     * Generate 6-digit OTP
     */
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Task methods
    async getTasks() {
        const data = this.getData();
        return data.tasks.filter(task => task.user_id === data.currentUser?.id);
    }

    async createTask(taskData) {
        const data = this.getData();
        const task = {
            id: this.generateId(),
            user_id: data.currentUser.id,
            ...taskData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        data.tasks.push(task);
        this.saveData(data);
        return task;
    }

    async updateTask(taskId, taskData) {
        const data = this.getData();
        const taskIndex = data.tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            data.tasks[taskIndex] = {
                ...data.tasks[taskIndex],
                ...taskData,
                updated_at: new Date().toISOString()
            };
            this.saveData(data);
            return data.tasks[taskIndex];
        }
        throw new Error('Task not found');
    }

    async deleteTask(taskId) {
        const data = this.getData();
        data.tasks = data.tasks.filter(t => t.id !== taskId);
        this.saveData(data);
        return { success: true };
    }

    // Notes methods
    async getNotes() {
        const data = this.getData();
        return data.notes.filter(note => note.user_id === data.currentUser?.id);
    }

    async createNote(noteData) {
        const data = this.getData();
        const note = {
            id: this.generateId(),
            user_id: data.currentUser.id,
            ...noteData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        data.notes.push(note);
        this.saveData(data);
        return note;
    }

    async updateNote(noteId, noteData) {
        const data = this.getData();
        const noteIndex = data.notes.findIndex(n => n.id === noteId);
        if (noteIndex !== -1) {
            data.notes[noteIndex] = {
                ...data.notes[noteIndex],
                ...noteData,
                updated_at: new Date().toISOString()
            };
            this.saveData(data);
            return data.notes[noteIndex];
        }
        throw new Error('Note not found');
    }

    async deleteNote(noteId) {
        const data = this.getData();
        data.notes = data.notes.filter(n => n.id !== noteId);
        this.saveData(data);
        return { success: true };
    }

    // Diary methods
    async getDiaryEntries() {
        const data = this.getData();
        return data.diary.filter(entry => entry.user_id === data.currentUser?.id);
    }

    async createDiaryEntry(entryData) {
        const data = this.getData();
        const entry = {
            id: this.generateId(),
            user_id: data.currentUser.id,
            ...entryData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        data.diary.push(entry);
        this.saveData(data);
        return entry;
    }

    async updateDiaryEntry(entryId, entryData) {
        const data = this.getData();
        const entryIndex = data.diary.findIndex(e => e.id === entryId);
        if (entryIndex !== -1) {
            data.diary[entryIndex] = {
                ...data.diary[entryIndex],
                ...entryData,
                updated_at: new Date().toISOString()
            };
            this.saveData(data);
            return data.diary[entryIndex];
        }
        throw new Error('Diary entry not found');
    }

    async deleteDiaryEntry(entryId) {
        const data = this.getData();
        data.diary = data.diary.filter(e => e.id !== entryId);
        this.saveData(data);
        return { success: true };
    }

    // Feedback methods
    async getFeedback() {
        const data = this.getData();
        return data.feedback;
    }

    async createFeedback(feedbackData) {
        const data = this.getData();
        const feedback = {
            id: this.generateId(),
            user_id: data.currentUser?.id,
            ...feedbackData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        data.feedback.push(feedback);
        this.saveData(data);
        return feedback;
    }

    // Notices methods
    async getNotices() {
        const data = this.getData();
        return data.notices.filter(notice => notice.is_active);
    }

    // Admin methods (simplified for demo)
    async adminLogin(username, password, email) {
        if (username === 'admin' && password === 'admin123' && email === 'admin@studytracker.com') {
            return { success: true, message: 'Admin login successful' };
        }
        throw new Error('Invalid admin credentials');
    }

    async getAdminStats() {
        const data = this.getData();
        return {
            total_users: data.users.length,
            total_tasks: data.tasks.length,
            total_notes: data.notes.length,
            total_diary_entries: data.diary.length,
            total_feedback: data.feedback.length
        };
    }
}

// Create global client instance
window.apiClient = new LocalStorageClient();
