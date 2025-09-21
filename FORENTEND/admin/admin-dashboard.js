// Check admin authentication
document.addEventListener('DOMContentLoaded', function () {
  if (localStorage.getItem('adminLoggedIn') !== 'true') {
    window.location.href = 'admin-login.html';
    return;
  }

  // Set admin username
  const adminUsername = localStorage.getItem('adminUsername') || 'Admin';
  document.getElementById('adminUsername').textContent = adminUsername;

  // Initialize dashboard
  initializeDashboard();
});

// Initialize dashboard
function initializeDashboard() {
  loadNotices();
  loadFeedback();
  updateStatistics();
  setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
  // Tab navigation
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }

  // Add notice
  document.getElementById('addNoticeBtn').addEventListener('click', () => openModal('noticeModal'));

  // Modal close buttons
  document.getElementById('closeNoticeModal').addEventListener('click', () => closeModal('noticeModal'));
  document.getElementById('closeReplyModal').addEventListener('click', () => closeModal('replyModal'));

  // Cancel buttons
  document.getElementById('cancelNotice').addEventListener('click', () => closeModal('noticeModal'));
  document.getElementById('cancelReply').addEventListener('click', () => closeModal('replyModal'));

  // Form submissions
  document.getElementById('addNoticeForm').addEventListener('submit', handleAddNotice);
  document.getElementById('replyForm').addEventListener('submit', handleReply);

  // Feedback filter
  document.getElementById('feedbackFilter').addEventListener('change', filterFeedback);

  // Close modals on outside click
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      e.target.classList.remove('active');
    }
  });
}

// Switch tabs
function switchTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  document.getElementById(tabName).classList.add('active');
}

// Load notices
function loadNotices() {
  const notices = JSON.parse(localStorage.getItem('notices') || '[]');
  const noticesList = document.getElementById('noticesList');

  if (notices.length === 0) {
    noticesList.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">No notices found. Add your first notice!</p>';
    return;
  }

  noticesList.innerHTML = notices.map((notice, index) => `
        <div class="notice-item">
            <div class="notice-header">
                <span class="notice-date">📅 ${notice.date}</span>
                <div class="notice-actions">
                    <button class="notice-btn edit-btn" onclick="editNotice(${index})" title="Edit">✏️</button>
                    <button class="notice-btn delete-btn" onclick="deleteNotice(${index})" title="Delete">🗑️</button>
                </div>
            </div>
            <div class="notice-message">${notice.message}</div>
        </div>
    `).join('');
}

// Load feedback
function loadFeedback() {
  const feedback = JSON.parse(localStorage.getItem('feedback') || '[]');
  const feedbackList = document.getElementById('feedbackList');

  if (feedback.length === 0) {
    feedbackList.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">No feedback found.</p>';
    return;
  }

  displayFeedback(feedback);
}

// Display feedback with filtering
function displayFeedback(feedback) {
  const feedbackList = document.getElementById('feedbackList');
  const filter = document.getElementById('feedbackFilter').value;

  let filteredFeedback = feedback;
  if (filter !== 'all') {
    filteredFeedback = feedback.filter(item => item.type === filter);
  }

  if (filteredFeedback.length === 0) {
    feedbackList.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">No feedback found for this category.</p>';
    return;
  }

  feedbackList.innerHTML = filteredFeedback.map((item, index) => `
        <div class="feedback-item">
            <div class="feedback-header">
                <div class="feedback-info">
                    <div class="feedback-name">${item.name}</div>
                    <div class="feedback-email">${item.email}</div>
                </div>
                <div class="feedback-type">${getFeedbackTypeIcon(item.type)} ${item.type}</div>
            </div>
            <div class="feedback-rating">
                ${generateStars(item.rating)}
            </div>
            <div class="feedback-message">${item.message}</div>
            ${item.reply ? `<div class="feedback-reply"><strong>Admin Reply:</strong> ${item.reply}</div>` : ''}
            <div class="feedback-actions">
                <button class="reply-btn" onclick="openReplyModal(${index})">💬 Reply</button>
            </div>
        </div>
    `).join('');
}

// Get feedback type icon
function getFeedbackTypeIcon(type) {
  const icons = {
    'suggestion': '💡',
    'bug': '🐛',
    'feature': '✨',
    'compliment': '🌟',
    'other': '📝'
  };
  return icons[type] || '📝';
}

// Generate stars
function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  let stars = '';

  for (let i = 0; i < fullStars; i++) {
    stars += '<span class="star">⭐</span>';
  }

  if (hasHalfStar) {
    stars += '<span class="star">⭐</span>';
  }

  return stars;
}

// Filter feedback
function filterFeedback() {
  const feedback = JSON.parse(localStorage.getItem('feedback') || '[]');
  displayFeedback(feedback);
}

// Add notice
function handleAddNotice(event) {
  event.preventDefault();

  const date = document.getElementById('noticeDate').value;
  const message = document.getElementById('noticeMessage').value;

  if (!date || !message) {
    showMessage('Please fill in all fields.', 'error');
    return;
  }

  const notices = JSON.parse(localStorage.getItem('notices') || '[]');
  notices.push({ date, message });
  localStorage.setItem('notices', JSON.stringify(notices));

  closeModal('noticeModal');
  loadNotices();
  updateStatistics();
  showMessage('Notice added successfully!', 'success');

  // Update main app notices
  updateMainAppNotices();
}

// Edit notice
function editNotice(index) {
  const notices = JSON.parse(localStorage.getItem('notices') || '[]');
  const notice = notices[index];

  document.getElementById('noticeDate').value = notice.date;
  document.getElementById('noticeMessage').value = notice.message;

  // Change form to edit mode
  const form = document.getElementById('addNoticeForm');
  const submitBtn = form.querySelector('.submit-btn');

  submitBtn.textContent = 'Update Notice';
  form.dataset.editIndex = index;

  openModal('noticeModal');
}

// Delete notice
function deleteNotice(index) {
  if (confirm('Are you sure you want to delete this notice?')) {
    const notices = JSON.parse(localStorage.getItem('notices') || '[]');
    notices.splice(index, 1);
    localStorage.setItem('notices', JSON.stringify(notices));

    loadNotices();
    updateStatistics();
    showMessage('Notice deleted successfully!', 'success');

    // Update main app notices
    updateMainAppNotices();
  }
}

// Open reply modal
function openReplyModal(index) {
  const feedback = JSON.parse(localStorage.getItem('feedback') || '[]');
  const item = feedback[index];

  document.getElementById('feedbackDetails').innerHTML = `
        <div><strong>From:</strong> ${item.name} (${item.email})</div>
        <div><strong>Type:</strong> ${getFeedbackTypeIcon(item.type)} ${item.type}</div>
        <div><strong>Rating:</strong> ${generateStars(item.rating)}</div>
        <div><strong>Message:</strong> ${item.message}</div>
        ${item.reply ? `<div><strong>Previous Reply:</strong> ${item.reply}</div>` : ''}
    `;

  document.getElementById('replyForm').dataset.feedbackIndex = index;
  openModal('replyModal');
}

// Handle reply
function handleReply(event) {
  event.preventDefault();

  const reply = document.getElementById('replyMessage').value;
  const index = parseInt(event.target.dataset.feedbackIndex);

  if (!reply) {
    showMessage('Please enter a reply.', 'error');
    return;
  }

  const feedback = JSON.parse(localStorage.getItem('feedback') || '[]');
  feedback[index].reply = reply;
  feedback[index].replyDate = new Date().toISOString();

  localStorage.setItem('feedback', JSON.stringify(feedback));

  closeModal('replyModal');
  loadFeedback();
  showMessage('Reply sent successfully!', 'success');
}

// Update statistics
function updateStatistics() {
  const notices = JSON.parse(localStorage.getItem('notices') || '[]');
  const feedback = JSON.parse(localStorage.getItem('feedback') || '[]');

  // Calculate average rating
  const totalRating = feedback.reduce((sum, item) => sum + parseInt(item.rating), 0);
  const avgRating = feedback.length > 0 ? (totalRating / feedback.length).toFixed(1) : '0.0';

  // Estimate active users (users who have submitted feedback)
  const uniqueUsers = new Set(feedback.map(item => item.email)).size;

  document.getElementById('totalNotices').textContent = notices.length;
  document.getElementById('totalFeedback').textContent = feedback.length;
  document.getElementById('avgRating').textContent = avgRating;
  document.getElementById('activeUsers').textContent = uniqueUsers;
}

// Update main app notices
function updateMainAppNotices() {
  const notices = JSON.parse(localStorage.getItem('notices') || '[]');
  // This would update the main app's notice board
  // For now, we'll store it in localStorage for the main app to read
  localStorage.setItem('mainAppNotices', JSON.stringify(notices));
}

// Modal functions
function openModal(modalId) {
  document.getElementById(modalId).classList.add('active');

  // Set default date to today for notice modal
  if (modalId === 'noticeModal') {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('noticeDate').value = today;
  }
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');

  // Reset forms
  if (modalId === 'noticeModal') {
    document.getElementById('addNoticeForm').reset();
    document.getElementById('addNoticeForm').removeAttribute('data-edit-index');
    document.querySelector('#addNoticeForm .submit-btn').textContent = 'Add Notice';
  } else if (modalId === 'replyModal') {
    document.getElementById('replyForm').reset();
    document.getElementById('replyForm').removeAttribute('data-feedback-index');
  }
}

// Show message
function showMessage(message, type) {
  const messageDiv = document.createElement('div');
  messageDiv.className = type === 'error' ? 'error-message' : 'success-message';
  messageDiv.textContent = message;
  messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1001;
        padding: 15px 25px;
        border-radius: 8px;
        font-weight: 600;
        animation: slideIn 0.3s ease-out;
    `;

  document.body.appendChild(messageDiv);

  setTimeout(() => {
    messageDiv.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => messageDiv.remove(), 300);
  }, 3000);
}

// Logout function
function logout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUsername');
    window.location.href = 'admin-login.html';
  }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style); 