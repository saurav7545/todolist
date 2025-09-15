/**
 * API Client for Study Tracker Backend
 * Handles all communication with the FastAPI backend
 */

class APIClient {
    constructor() {
        this.baseURL = 'http://localhost:8000/api';
        this.token = localStorage.getItem('access_token');
        this.refreshToken = localStorage.getItem('refresh_token');
    }

    /**
     * Set authentication token
     */
    setToken(token, refreshToken = null) {
        this.token = token;
        if (refreshToken) {
            this.refreshToken = refreshToken;
        }
        localStorage.setItem('access_token', token);
        if (refreshToken) {
            localStorage.setItem('refresh_token', refreshToken);
        }
    }

    /**
     * Clear authentication tokens
     */
    clearTokens() {
        this.token = null;
        this.refreshToken = null;
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_info');
    }

    /**
     * Get headers for API requests
     */
    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (includeAuth && this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    /**
     * Make HTTP request
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getHeaders(options.includeAuth !== false),
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            // Handle token refresh if needed
            if (response.status === 401 && this.refreshToken) {
                const refreshed = await this.refreshAccessToken();
                if (refreshed) {
                    // Retry the original request with new token
                    config.headers = this.getHeaders();
                    const retryResponse = await fetch(url, config);
                    return await this.handleResponse(retryResponse);
                }
            }

            return await this.handleResponse(response);
        } catch (error) {
            console.error('API Request failed:', error);
            throw new Error(`Network error: ${error.message}`);
        }
    }

    /**
     * Handle API response
     */
    async handleResponse(response) {
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }
        return await response.text();
    }

    /**
     * Refresh access token
     */
    async refreshAccessToken() {
        if (!this.refreshToken) {
            return false;
        }

        try {
            const response = await fetch(`${this.baseURL}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refresh_token: this.refreshToken })
            });

            if (response.ok) {
                const data = await response.json();
                this.setToken(data.access_token, data.refresh_token);
                return true;
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
        }

        // If refresh fails, clear tokens and redirect to login
        this.clearTokens();
        window.location.href = '/login/login.html';
        return false;
    }

    // Authentication endpoints
    async login(username, password) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
            includeAuth: false
        });
        
        this.setToken(response.access_token, response.refresh_token);
        return response;
    }

    async register(userData) {
        return await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
            includeAuth: false
        });
    }

    async getCurrentUser() {
        return await this.request('/auth/me');
    }

    async logout() {
        try {
            await this.request('/auth/logout', { method: 'POST' });
        } finally {
            this.clearTokens();
        }
    }

    // Task endpoints
    async getTasks(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.request(`/tasks?${queryString}`);
    }

    async getTask(taskId) {
        return await this.request(`/tasks/${taskId}`);
    }

    async createTask(taskData) {
        return await this.request('/tasks', {
            method: 'POST',
            body: JSON.stringify(taskData)
        });
    }

    async updateTask(taskId, taskData) {
        return await this.request(`/tasks/${taskId}`, {
            method: 'PUT',
            body: JSON.stringify(taskData)
        });
    }

    async deleteTask(taskId) {
        return await this.request(`/tasks/${taskId}`, {
            method: 'DELETE'
        });
    }

    async startTaskSession(taskId) {
        return await this.request(`/tasks/${taskId}/start`, {
            method: 'POST'
        });
    }

    async completeTask(taskId) {
        return await this.request(`/tasks/${taskId}/complete`, {
            method: 'POST'
        });
    }

    async getTaskStats() {
        return await this.request('/tasks/stats');
    }

    // Notes endpoints
    async getNotes(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.request(`/notes?${queryString}`);
    }

    async createNote(noteData) {
        return await this.request('/notes', {
            method: 'POST',
            body: JSON.stringify(noteData)
        });
    }

    async updateNote(noteId, noteData) {
        return await this.request(`/notes/${noteId}`, {
            method: 'PUT',
            body: JSON.stringify(noteData)
        });
    }

    async deleteNote(noteId) {
        return await this.request(`/notes/${noteId}`, {
            method: 'DELETE'
        });
    }

    // Diary endpoints
    async getDiaryEntries(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.request(`/diary?${queryString}`);
    }

    async createDiaryEntry(entryData) {
        return await this.request('/diary', {
            method: 'POST',
            body: JSON.stringify(entryData)
        });
    }

    async updateDiaryEntry(entryId, entryData) {
        return await this.request(`/diary/${entryId}`, {
            method: 'PUT',
            body: JSON.stringify(entryData)
        });
    }

    async deleteDiaryEntry(entryId) {
        return await this.request(`/diary/${entryId}`, {
            method: 'DELETE'
        });
    }

    // Feedback endpoints
    async getFeedback(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.request(`/feedback?${queryString}`);
    }

    async createFeedback(feedbackData) {
        return await this.request('/feedback', {
            method: 'POST',
            body: JSON.stringify(feedbackData)
        });
    }

    async updateFeedback(feedbackId, feedbackData) {
        return await this.request(`/feedback/${feedbackId}`, {
            method: 'PUT',
            body: JSON.stringify(feedbackData)
        });
    }

    async deleteFeedback(feedbackId) {
        return await this.request(`/feedback/${feedbackId}`, {
            method: 'DELETE'
        });
    }

    // Notices endpoints
    async getNotices(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.request(`/notices?${queryString}`);
    }

    async getNotice(noticeId) {
        return await this.request(`/notices/${noticeId}`);
    }

    // Admin endpoints
    async adminLogin(username, password, email) {
        return await this.request('/admin/login', {
            method: 'POST',
            body: JSON.stringify({ username, password, email }),
            includeAuth: false
        });
    }

    async verifyOTP(otp) {
        return await this.request('/admin/verify-otp', {
            method: 'POST',
            body: JSON.stringify({ otp })
        });
    }

    async getAdminNotices(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.request(`/admin/notices?${queryString}`);
    }

    async createAdminNotice(noticeData) {
        return await this.request('/admin/notices', {
            method: 'POST',
            body: JSON.stringify(noticeData)
        });
    }

    async updateAdminNotice(noticeId, noticeData) {
        return await this.request(`/admin/notices/${noticeId}`, {
            method: 'PUT',
            body: JSON.stringify(noticeData)
        });
    }

    async deleteAdminNotice(noticeId) {
        return await this.request(`/admin/notices/${noticeId}`, {
            method: 'DELETE'
        });
    }

    async getAdminFeedback(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.request(`/admin/feedback?${queryString}`);
    }

    async replyToFeedback(feedbackId, reply) {
        return await this.request(`/admin/feedback/${feedbackId}/reply`, {
            method: 'POST',
            body: JSON.stringify({ reply })
        });
    }

    async getAdminStats() {
        return await this.request('/admin/stats');
    }
}

// Create global API client instance
window.apiClient = new APIClient();
