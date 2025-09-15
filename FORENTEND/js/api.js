// API Configuration
const config = {
    API_URL: window.location.hostname === 'localhost' 
        ? 'http://localhost:8000/api'
        : 'https://study-tracker-api.onrender.com/api',
    TOKEN_KEY: 'study_tracker_token',
    REFRESH_TOKEN_KEY: 'study_tracker_refresh_token'
};

// API Helper Functions
async function apiRequest(endpoint, options = {}) {
    const url = `${config.API_URL}/${endpoint}`;
    const token = localStorage.getItem(config.TOKEN_KEY);
    
    const defaultHeaders = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        });

        if (response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem(config.TOKEN_KEY);
            window.location.href = '/login/login.html';
            return null;
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

// Auth Functions
async function registerUser(userData) {
    return apiRequest('auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
    });
}

async function loginUser(credentials) {
    return apiRequest('auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
    });
}

async function verifyOTP(otpData) {
    return apiRequest('auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify(otpData)
    });
}

// Task Functions
async function getTasks() {
    return apiRequest('tasks');
}

async function createTask(taskData) {
    return apiRequest('tasks', {
        method: 'POST',
        body: JSON.stringify(taskData)
    });
}

async function updateTask(taskId, taskData) {
    return apiRequest(`tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(taskData)
    });
}

async function deleteTask(taskId) {
    return apiRequest(`tasks/${taskId}`, {
        method: 'DELETE'
    });
}

// Export the functions and config
window.api = {
    config,
    auth: {
        register: registerUser,
        login: loginUser,
        verifyOTP: verifyOTP
    },
    tasks: {
        get: getTasks,
        create: createTask,
        update: updateTask,
        delete: deleteTask
    }
};