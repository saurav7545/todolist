/**
 * Study Tracker Main Script - Backend Integrated Version
 * This version integrates with the FastAPI backend instead of using localStorage
 */

// Global variables
let currentUser = null;
let tasks = [];
let timer = null;
let seconds = 0;
let currentTaskId = null;

// Motivational quotes
const quotes = [
  "Success is the sum of small efforts repeated daily. - सफलता रोज़ के छोटे प्रयासों का परिणाम है।",
  "Push yourself because no one else is going to do it for you.",
  "Hard work beats talent when talent doesn't work hard.",
  "Dream big. Work hard. Stay focused.",
  "आपकी मेहनत ही आपकी पहचान बनेगी।",
  "You can do it! | तुम इससे कर सकते हो!",
  "Every step counts. | हर कदम मायने रखता है।",
  "Keep moving forward. | आगे बढ़ते रहो।",
  "Don't give up. | हार मत मानो।",
  "Stay focused. | ध्यान केंद्रित रखो।",
  "Success needs consistency. | सफलता के लिए निरंतरता ज़रूरी है।"
];

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Study Tracker initializing...');
    
    // Check authentication
    if (!Utils.requireAuth()) {
        return;
    }

    try {
        // Load user data
        await loadUserData();
        
        // Load tasks from backend
        await loadTasks();
        
        // Load notices
        await loadNotices();
        
        // Initialize UI
        initializeUI();
        
        // Update date/time display
        updateDateTime();
        setInterval(updateDateTime, 1000);
        
        console.log('Study Tracker initialized successfully');
    } catch (error) {
        console.error('Failed to initialize Study Tracker:', error);
        Utils.showError('Failed to load application data. Please refresh the page.');
    }
});

/**
 * Load user data from backend
 */
async function loadUserData() {
    try {
        currentUser = await apiClient.getCurrentUser();
        console.log('User loaded:', currentUser);
        
        // Update UI with user info
        const userInfoElement = document.getElementById('user-info');
        if (userInfoElement) {
            userInfoElement.textContent = `Welcome, ${currentUser.username}!`;
        }
    } catch (error) {
        console.error('Failed to load user data:', error);
        throw error;
    }
}

/**
 * Load tasks from backend
 */
async function loadTasks() {
    try {
        const response = await apiClient.getTasks({ limit: 100 });
        tasks = response.items || [];
        console.log('Tasks loaded:', tasks.length);
        
        // Render tasks
        renderTasks();
        
        // Update statistics
        updateTaskStats();
    } catch (error) {
        console.error('Failed to load tasks:', error);
        Utils.showError('Failed to load tasks. Please try again.');
    }
}

/**
 * Render tasks in the UI
 */
function renderTasks() {
    const todoList = document.getElementById('todo-list');
    if (!todoList) return;

    // Clear existing tasks
    todoList.innerHTML = '';

    // Sort tasks by date (newest first)
    const sortedTasks = [...tasks].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    sortedTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.status === 'completed' ? 'completed' : ''}`;
        li.dataset.taskId = task.id;

        // Format date for display
        const formattedDate = new Date(task.scheduled_date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });

        li.innerHTML = `
            <div class="task-content">
                <div class="task-text">${Utils.sanitizeHTML(task.title)}</div>
                <div class="task-datetime">
                    <span class="task-date">📅 ${formattedDate}</span>
                    <span class="task-time">🕐 ${task.start_time} - ${task.end_time}</span>
                </div>
                <div class="task-actions">
                    <button class="complete-btn" onclick="toggleComplete('${task.id}')">
                        ${task.status === 'completed' ? '✅ Completed' : '⏳ Mark Complete'}
                    </button>
                    <button class="delete-btn" onclick="deleteTask('${task.id}')">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `;

        todoList.appendChild(li);
    });
}

/**
 * Add a new task
 */
async function addTask() {
    const input = document.getElementById('task-input');
    const dateInput = document.getElementById('task-date');
    const startTimeInput = document.getElementById('task-start-time');
    const endTimeInput = document.getElementById('task-end-time');

    const taskText = input.value.trim();
    const taskDate = dateInput.value;
    const startTime = startTimeInput.value;
    const endTime = endTimeInput.value;

    // Validation
    if (!taskText) {
        Utils.showError('Please enter a topic!');
        input.focus();
        return;
    }

    if (!taskDate) {
        Utils.showError('Please select a date!');
        dateInput.focus();
        return;
    }

    if (!startTime) {
        Utils.showError('Please select start time!');
        startTimeInput.focus();
        return;
    }

    if (!endTime) {
        Utils.showError('Please select end time!');
        endTimeInput.focus();
        return;
    }

    if (startTime >= endTime) {
        Utils.showError('End time must be after start time!');
        endTimeInput.focus();
        return;
    }

    try {
        // Create task data
        const taskData = {
            title: taskText,
            description: '',
            scheduled_date: taskDate,
            start_time: startTime,
            end_time: endTime,
            priority: 'medium',
            status: 'pending'
        };

        // Send to backend
        const newTask = await apiClient.createTask(taskData);
        
        // Add to local tasks array
        tasks.unshift(newTask);
        
        // Re-render tasks
        renderTasks();
        
        // Clear form
        input.value = '';
        const today = new Date().toISOString().split('T')[0];
        const currentTime = new Date().toTimeString().slice(0, 5);
        dateInput.value = today;
        startTimeInput.value = currentTime;
        endTimeInput.value = '';
        
        // Update labels
        updateInputLabels();
        
        // Show success message
        Utils.showSuccess('Task added successfully!');
        
        // Update statistics
        updateTaskStats();
        
    } catch (error) {
        console.error('Failed to add task:', error);
        Utils.showError('Failed to add task. Please try again.');
    }
}

/**
 * Toggle task completion status
 */
async function toggleComplete(taskId) {
    try {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
        
        // Update task in backend
        await apiClient.updateTask(taskId, { status: newStatus });
        
        // Update local task
        task.status = newStatus;
        
        // Re-render tasks
        renderTasks();
        
        // Update statistics
        updateTaskStats();
        
        Utils.showSuccess(`Task ${newStatus === 'completed' ? 'completed' : 'reopened'}!`);
        
    } catch (error) {
        console.error('Failed to update task:', error);
        Utils.showError('Failed to update task. Please try again.');
    }
}

/**
 * Delete a task
 */
async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }

    try {
        // Delete from backend
        await apiClient.deleteTask(taskId);
        
        // Remove from local tasks array
        tasks = tasks.filter(t => t.id !== taskId);
        
        // Re-render tasks
        renderTasks();
        
        // Update statistics
        updateTaskStats();
        
        Utils.showSuccess('Task deleted successfully!');
        
    } catch (error) {
        console.error('Failed to delete task:', error);
        Utils.showError('Failed to delete task. Please try again.');
    }
}

/**
 * Start study timer
 */
async function startTimer() {
    if (timer) return;

    // Show motivational message
    showMotivationalMessage('start');

    timer = setInterval(() => {
        seconds++;
        updateTimerDisplay();
    }, 1000);

    // Update button
    const startBtn = document.getElementById('start-timer-btn');
    if (startBtn) {
        startBtn.textContent = '⏸️ Pause Timer';
        startBtn.onclick = pauseTimer;
    }

    Utils.showInfo('Timer started! Focus on your studies.');
}

/**
 * Pause study timer
 */
function pauseTimer() {
    if (!timer) return;

    clearInterval(timer);
    timer = null;

    // Update button
    const startBtn = document.getElementById('start-timer-btn');
    if (startBtn) {
        startBtn.textContent = '▶️ Resume Timer';
        startBtn.onclick = resumeTimer;
    }

    Utils.showInfo('Timer paused.');
}

/**
 * Resume study timer
 */
function resumeTimer() {
    if (timer) return;

    timer = setInterval(() => {
        seconds++;
        updateTimerDisplay();
    }, 1000);

    // Update button
    const startBtn = document.getElementById('start-timer-btn');
    if (startBtn) {
        startBtn.textContent = '⏸️ Pause Timer';
        startBtn.onclick = pauseTimer;
    }

    Utils.showInfo('Timer resumed!');
}

/**
 * Stop study timer
 */
function stopTimer() {
    if (!timer) return;

    clearInterval(timer);
    timer = null;
    seconds = 0;

    // Update button
    const startBtn = document.getElementById('start-timer-btn');
    if (startBtn) {
        startBtn.textContent = '▶️ Start Timer';
        startBtn.onclick = startTimer;
    }

    // Update display
    updateTimerDisplay();
    
    Utils.showSuccess('Timer stopped! Great work!');
}

/**
 * Update timer display
 */
function updateTimerDisplay() {
    const timerDisplay = document.getElementById('timer-display');
    if (timerDisplay) {
        timerDisplay.textContent = Utils.formatDuration(seconds);
    }
}

/**
 * Show motivational message
 */
function showMotivationalMessage(type) {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    const messages = {
        start: `🚀 Let's go! ${randomQuote}`,
        pause: `⏸️ Take a break! ${randomQuote}`,
        stop: `🎉 Great work! ${randomQuote}`
    };
    
    Utils.showInfo(messages[type] || randomQuote, 5000);
}

/**
 * Update task statistics
 */
function updateTaskStats() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = totalTasks - completedTasks;

    // Update stats display
    const statsElement = document.getElementById('task-stats');
    if (statsElement) {
        statsElement.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Total:</span>
                <span class="stat-value">${totalTasks}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Completed:</span>
                <span class="stat-value">${completedTasks}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Pending:</span>
                <span class="stat-value">${pendingTasks}</span>
            </div>
        `;
    }
}

/**
 * Load notices from backend
 */
async function loadNotices() {
    try {
        const response = await apiClient.getNotices({ limit: 5, active_only: true });
        const notices = response.items || [];
        
        const noticesContainer = document.getElementById('notices-container');
        if (noticesContainer) {
            if (notices.length === 0) {
                noticesContainer.innerHTML = '<p class="no-notices">No notices at the moment.</p>';
            } else {
                noticesContainer.innerHTML = notices.map(notice => `
                    <div class="notice-item">
                        <h4>${Utils.sanitizeHTML(notice.title)}</h4>
                        <p>${Utils.sanitizeHTML(notice.content)}</p>
                        <small>${Utils.formatDate(notice.created_at)}</small>
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Failed to load notices:', error);
        // Don't show error for notices as it's not critical
    }
}

/**
 * Submit feedback
 */
async function submitFeedback() {
    const feedbackForm = document.getElementById('feedback-form');
    if (!feedbackForm) return;

    const formData = new FormData(feedbackForm);
    const feedbackData = {
        type: formData.get('feedback-type'),
        subject: formData.get('feedback-subject'),
        message: formData.get('feedback-message'),
        rating: parseInt(formData.get('feedback-rating'))
    };

    // Validation
    if (!feedbackData.subject || !feedbackData.message) {
        Utils.showError('Please fill in all required fields.');
        return;
    }

    try {
        await apiClient.createFeedback(feedbackData);
        Utils.showSuccess('Feedback submitted successfully! Thank you for your input.');
        feedbackForm.reset();
    } catch (error) {
        console.error('Failed to submit feedback:', error);
        Utils.showError('Failed to submit feedback. Please try again.');
    }
}

/**
 * Logout user
 */
async function logout() {
    try {
        await apiClient.logout();
        Utils.showSuccess('Logged out successfully!');
        setTimeout(() => {
            window.location.href = '/login/login.html';
        }, 1000);
    } catch (error) {
        console.error('Logout error:', error);
        // Clear local data anyway
        apiClient.clearTokens();
        window.location.href = '/login/login.html';
    }
}

/**
 * Update date and time display
 */
function updateDateTime() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    const dateElement = document.getElementById('current-date');
    const timeElement = document.getElementById('current-time');
    
    if (dateElement) dateElement.textContent = dateStr;
    if (timeElement) timeElement.textContent = timeStr;
}

/**
 * Update input labels
 */
function updateInputLabels() {
    const dateInput = document.getElementById('task-date');
    const startTimeInput = document.getElementById('task-start-time');
    const endTimeInput = document.getElementById('task-end-time');

    if (dateInput && dateInput.value) {
        const date = new Date(dateInput.value);
        const label = date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
        dateInput.title = `Selected: ${label}`;
    }

    if (startTimeInput && startTimeInput.value) {
        startTimeInput.title = `Start time: ${startTimeInput.value}`;
    }

    if (endTimeInput && endTimeInput.value) {
        endTimeInput.title = `End time: ${endTimeInput.value}`;
    }
}

/**
 * Initialize UI elements
 */
function initializeUI() {
    // Set default date and time
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().slice(0, 5);
    
    const dateInput = document.getElementById('task-date');
    const startTimeInput = document.getElementById('task-start-time');
    
    if (dateInput) dateInput.value = today;
    if (startTimeInput) startTimeInput.value = currentTime;
    
    // Update labels
    updateInputLabels();
    
    // Add event listeners
    const feedbackForm = document.getElementById('feedback-form');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', (e) => {
            e.preventDefault();
            submitFeedback();
        });
    }
    
    // Add input event listeners for real-time label updates
    const inputs = ['task-date', 'task-start-time', 'task-end-time'];
    inputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('change', updateInputLabels);
        }
    });
}

// Make functions globally available
window.addTask = addTask;
window.toggleComplete = toggleComplete;
window.deleteTask = deleteTask;
window.startTimer = startTimer;
window.pauseTimer = pauseTimer;
window.resumeTimer = resumeTimer;
window.stopTimer = stopTimer;
window.logout = logout;
window.submitFeedback = submitFeedback;
