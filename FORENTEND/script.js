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

// Timer variables
let timer, seconds = 0;

function addTask() {
  console.log("addTask function called");
  const todoList = document.getElementById("todo-list");
  const input = document.getElementById("task-input");
  const dateInput = document.getElementById("task-date");
  const startTimeInput = document.getElementById("task-start-time");
  const endTimeInput = document.getElementById("task-end-time");

  console.log("Elements found:", {
    todoList: !!todoList,
    input: !!input,
    dateInput: !!dateInput,
    startTimeInput: !!startTimeInput,
    endTimeInput: !!endTimeInput
  });

  const taskText = input.value.trim();
  const taskDate = dateInput.value;
  const startTime = startTimeInput.value;
  const endTime = endTimeInput.value;

  console.log("Task data:", { taskText, taskDate, startTime, endTime });

  // Validation - all fields are required
  if (!taskText) {
    alert("Please enter a topic!");
    input.focus();
    return;
  }

  if (!taskDate) {
    alert("Please select a date!");
    dateInput.focus();
    return;
  }

  if (!startTime) {
    alert("Please select start time!");
    startTimeInput.focus();
    return;
  }

  if (!endTime) {
    alert("Please select end time!");
    endTimeInput.focus();
    return;
  }

  // Check if end time is after start time
  if (startTime >= endTime) {
    alert("End time must be after start time!");
    endTimeInput.focus();
    return;
  }

  // Format date for display
  const formattedDate = new Date(taskDate).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  // Create task item with date and time
  const li = document.createElement("li");
  li.className = "task-item";

  li.innerHTML = `
    <div class="task-content">
      <div class="task-text">${taskText}</div>
      <div class="task-datetime">
        <span class="task-date">📅 ${formattedDate}</span>
        <span class="task-time">🕐 ${startTime} - ${endTime}</span>
      </div>
      <div class="task-actions">
        <button class="complete-btn" onclick="toggleComplete(this)">
          ⏳ Mark Complete
        </button>
        <button class="delete-btn" onclick="deleteTask(this)">
          🗑️ Delete
        </button>
      </div>
    </div>
  `;

  // Store task data
  li.dataset.completed = 'false';

  // Right click to delete
  li.oncontextmenu = (e) => {
    e.preventDefault();
    li.remove();
  };

  // Check if todoList exists before appending
  if (todoList) {
    todoList.appendChild(li);
    console.log("Task added successfully to todo list");
  } else {
    console.error("Todo list element not found!");
    alert("Error: Todo list element not found. Please refresh the page.");
    return;
  }

  // Clear only topic input, keep date and time with default values
  input.value = "";

  // Set default date and time for next task
  const today = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toTimeString().slice(0, 5);

  dateInput.value = today;
  startTimeInput.value = currentTime;
  endTimeInput.value = ""; // Keep end time empty for user to select

  // Update labels and readable inputs
  updateInputLabels();

  // Show success message
  showTaskAddedMessage();

  // Update task statistics
  updateTaskStats();

  console.log("addTask function completed successfully");
}

function startTimer() {
  if (timer) return;

  // Show motivational message when starting
  showMotivationalMessage('start');

  timer = setInterval(() => {
    seconds++;
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    const timerElement = document.getElementById("timer");
    if (timerElement) {
      timerElement.textContent = `${h}:${m}:${s}`;
    }
  }, 1000);
}

function stopTimer() {
  if (!timer) return;

  clearInterval(timer);
  timer = null;

  // Show completion message when stopping
  showMotivationalMessage('stop');
}

function resetTimer() {
  clearInterval(timer);
  timer = null;
  seconds = 0;
  const timerElement = document.getElementById("timer");
  if (timerElement) {
    timerElement.textContent = "00:00:00";
  }

  // Show reset message
  showMotivationalMessage('reset');
}

function showQuote() {
  const random = quotes[Math.floor(Math.random() * quotes.length)];
  document.getElementById("quote-box").textContent = `💡 ${random}`;
}

// Add keyboard support for Enter key
document.addEventListener('DOMContentLoaded', function () {
  const taskInput = document.getElementById("task-input");
  if (taskInput) {
    taskInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        addTask();
      }
    });
  }
});

// Add logout button event listener
document.addEventListener('DOMContentLoaded', function () {
  console.log("DOMContentLoaded event fired");
  const logoutBtn = document.getElementById('logout-btn');
  console.log("Logout button found:", !!logoutBtn);
  if (logoutBtn) {
    console.log("Adding click event listener to logout button");
    logoutBtn.addEventListener('click', function () {
      console.log("Logout button clicked!");
      logout();
    });
  } else {
    console.error("Logout button not found!");
  }

  // Set default date and time
  setDefaultDateTime();

  // Initialize task statistics
  updateTaskStats();

  // Add event listener for feedback form
  const feedbackForm = document.getElementById('feedbackForm');
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', handleFeedbackSubmit);
  }

  // Load dynamic notices
  loadDynamicNotices();

  // Add event listeners for date and time inputs to update labels
  const dateInput = document.getElementById('task-date');
  const startTimeInput = document.getElementById('task-start-time');
  const endTimeInput = document.getElementById('task-end-time');

  if (dateInput) {
    dateInput.addEventListener('change', updateInputLabels);
  }
  if (startTimeInput) {
    startTimeInput.addEventListener('change', updateInputLabels);
  }
  if (endTimeInput) {
    endTimeInput.addEventListener('change', updateInputLabels);
  }
});

// Function to update date and time
function updateDateTime() {
  const now = new Date();

  // Format date
  const dateOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  const formattedDate = now.toLocaleDateString('en-US', dateOptions);

  // Format time
  const timeOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  };
  const formattedTime = now.toLocaleTimeString('en-US', timeOptions);

  // Update DOM elements
  const dateElement = document.getElementById('current-date');
  const timeElement = document.getElementById('current-time');

  if (dateElement) dateElement.textContent = `📅 ${formattedDate}`;
  if (timeElement) timeElement.textContent = `🕐 ${formattedTime}`;
}

// Update date and time every second
setInterval(updateDateTime, 1000);

// Initial update
updateDateTime();

// Set default date to today
function setDefaultDateTime() {
  const today = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toTimeString().slice(0, 5);

  const dateInput = document.getElementById('task-date');
  const startTimeInput = document.getElementById('task-start-time');

  if (dateInput) dateInput.value = today;
  if (startTimeInput) startTimeInput.value = currentTime;

  // Update labels and readable inputs
  updateInputLabels();
  updateReadableInputs();
}

// Function to update input labels with readable format
function updateInputLabels() {
  const dateInput = document.getElementById('task-date');
  const startTimeInput = document.getElementById('task-start-time');
  const endTimeInput = document.getElementById('task-end-time');

  // Reset labels to default
  const dateLabel = document.querySelector('label[for="task-date"]');
  const startTimeLabel = document.querySelector('label[for="task-start-time"]');
  const endTimeLabel = document.querySelector('label[for="task-end-time"]');

  if (dateLabel) dateLabel.textContent = '📅 Date:';
  if (startTimeLabel) startTimeLabel.textContent = '⏰ Start Time:';
  if (endTimeLabel) endTimeLabel.textContent = '⏰ End Time:';

  // Update readable format in inputs
  updateReadableInputs();
}

// Function to update readable format in date/time inputs
function updateReadableInputs() {
  const dateInput = document.getElementById('task-date');
  const startTimeInput = document.getElementById('task-start-time');
  const endTimeInput = document.getElementById('task-end-time');

  // Update date input - show readable format in placeholder
  if (dateInput && dateInput.value) {
    const readableDate = new Date(dateInput.value).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    dateInput.setAttribute('placeholder', readableDate);
    dateInput.style.color = '#495057';
  } else if (dateInput) {
    dateInput.setAttribute('placeholder', 'Select Date');
    dateInput.style.color = '#6c757d';
  }

  // Update start time input - show readable format in placeholder
  if (startTimeInput && startTimeInput.value) {
    const time = startTimeInput.value;
    const [hours, minutes] = time.split(':');
    const readableTime = new Date(2000, 0, 1, hours, minutes).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    startTimeInput.setAttribute('placeholder', readableTime);
    startTimeInput.style.color = '#495057';
  } else if (startTimeInput) {
    startTimeInput.setAttribute('placeholder', 'Select Start Time');
    startTimeInput.style.color = '#6c757d';
  }

  // Update end time input - show readable format in placeholder
  if (endTimeInput && endTimeInput.value) {
    const time = endTimeInput.value;
    const [hours, minutes] = time.split(':');
    const readableTime = new Date(2000, 0, 1, hours, minutes).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    endTimeInput.setAttribute('placeholder', readableTime);
    endTimeInput.style.color = '#495057';
  } else if (endTimeInput) {
    endTimeInput.setAttribute('placeholder', 'Select End Time');
    endTimeInput.style.color = '#6c757d';
  }
}

// Show success message when task is added
function showTaskAddedMessage() {
  const message = document.createElement('div');
  message.className = 'task-success-message';
  message.textContent = '✅ Task added successfully!';
  message.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #28a745;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      z-index: 1000;
      box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);
    `;

  document.body.appendChild(message);

  // Remove message after 3 seconds
  setTimeout(() => {
    message.remove();
  }, 3000);
}

// Show motivational messages for timer actions
function showMotivationalMessage(type) {
  const messages = {
    start: [
      "🚀 Let's begin your study session! You've got this!",
      "💪 Time to focus and achieve your goals!",
      "⭐ Every minute of study brings you closer to success!",
      "🎯 Ready to conquer your studies? Let's go!",
      "🌟 Your dedication will lead to amazing results!",
      "📚 Knowledge is power - let's build it together!",
      "🔥 Your future self will thank you for this effort!",
      "💡 Great minds are built one study session at a time!"
    ],
    stop: [
      "🎉 Excellent work! You've completed your study session!",
      "👏 Well done! Every minute counts towards your success!",
      "🌟 You're making amazing progress! Keep it up!",
      "💪 Another productive session completed! You're unstoppable!",
      "⭐ Your dedication is inspiring! Great job!",
      "🎯 Mission accomplished! You're building a bright future!",
      "🔥 Fantastic work! Your consistency is paying off!",
      "💡 Knowledge gained, confidence earned! Well done!"
    ],
    reset: [
      "🔄 Fresh start! Ready for a new study session?",
      "🔄 Reset complete! Time for a new beginning!",
      "🔄 Clean slate! Let's start fresh and focused!",
      "🔄 Timer reset! Ready to tackle new challenges!",
      "🔄 Fresh start! Every reset is a new opportunity!",
      "🔄 Reset done! Time to begin a new productive session!",
      "🔄 Clean timer! Ready to make more progress!",
      "🔄 Fresh beginning! Let's achieve more today!"
    ]
  };

  const messageArray = messages[type];
  const randomMessage = messageArray[Math.floor(Math.random() * messageArray.length)];

  const message = document.createElement('div');
  message.className = 'motivational-message';
  message.textContent = randomMessage;

  // Different styling for start, stop, and reset messages
  let backgroundGradient;
  if (type === 'start') {
    backgroundGradient = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
  } else if (type === 'stop') {
    backgroundGradient = 'linear-gradient(135deg, #007bff 0%, #6610f2 100%)';
  } else if (type === 'reset') {
    backgroundGradient = 'linear-gradient(135deg, #fd7e14 0%, #e83e8c 100%)';
  }

  message.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: ${backgroundGradient};
    color: white;
    padding: 20px 30px;
    border-radius: 15px;
    font-weight: 600;
    font-size: 18px;
    z-index: 1000;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    text-align: center;
    max-width: 400px;
    animation: messageSlideIn 0.5s ease-out;
  `;

  document.body.appendChild(message);

  // Remove message after 4 seconds
  setTimeout(() => {
    message.style.animation = 'messageSlideOut 0.5s ease-in';
    setTimeout(() => {
      message.remove();
    }, 500);
  }, 4000);
}

// Toggle task completion
function toggleComplete(button) {
  const taskItem = button.closest('.task-item');
  const isCompleted = taskItem.dataset.completed === 'true';

  if (isCompleted) {
    // Mark as pending
    taskItem.dataset.completed = 'false';
    taskItem.classList.remove('completed');
    button.textContent = '⏳ Mark Complete';
    button.className = 'complete-btn';
  } else {
    // Mark as completed
    taskItem.dataset.completed = 'true';
    taskItem.classList.add('completed');
    button.textContent = '✅ Completed';
    button.className = 'complete-btn completed';
  }

  updateTaskStats();
}

// Delete task
function deleteTask(button) {
  const taskItem = button.closest('.task-item');
  if (confirm('Are you sure you want to delete this task?')) {
    taskItem.remove();
    updateTaskStats();
  }
}

// Filter tasks
function filterTasks(filter) {
  const tasks = document.querySelectorAll('.task-item');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const targetButton = document.getElementById(`${filter}-tasks`);

  // Update active button
  filterButtons.forEach(btn => btn.classList.remove('active'));
  if (targetButton) {
    targetButton.classList.add('active');
  }

  // Show/hide tasks based on filter
  tasks.forEach(task => {
    const isCompleted = task.dataset.completed === 'true';

    switch (filter) {
      case 'all':
        task.style.display = 'block';
        break;
      case 'completed':
        task.style.display = isCompleted ? 'block' : 'none';
        break;
      case 'pending':
        task.style.display = !isCompleted ? 'block' : 'none';
        break;
    }
  });
}

// Update task statistics
function updateTaskStats() {
  const tasks = document.querySelectorAll('.task-item');
  const totalTasks = tasks.length;
  const completedTasks = Array.from(tasks).filter(task =>
    task.dataset.completed === 'true'
  ).length;
  const pendingTasks = totalTasks - completedTasks;

  const totalElement = document.getElementById('total-count');
  const completedElement = document.getElementById('completed-count');
  const pendingElement = document.getElementById('pending-count');

  if (totalElement) totalElement.textContent = totalTasks;
  if (completedElement) completedElement.textContent = completedTasks;
  if (pendingElement) pendingElement.textContent = pendingTasks;
}

// Check if user is logged in
if (localStorage.getItem('isLoggedIn') !== 'true') {
  console.log("User not logged in, redirecting to login page");
  // Temporarily bypass login for testing - remove this in production
  console.log("Temporarily bypassing login for testing");
  localStorage.setItem('isLoggedIn', 'true');
  localStorage.setItem('currentUser', 'demo');
  // window.location.href = 'login/login.html';
} else {
  console.log("User is logged in, proceeding with application");
}

// Logout function
function logout() {
  console.log("Logout function called");
  alert("Logout function is working!");

  if (confirm('Are you sure you want to logout?')) {
    console.log("User confirmed logout");
    // Clear all localStorage data
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('notes');
    localStorage.removeItem('diaryEntries');
    console.log("LocalStorage cleared");

    // Redirect to login page
    console.log("Redirecting to login page");
    window.location.href = 'login/login.html';
  } else {
    console.log("User cancelled logout");
  }
}

// Handle feedback form submission
function handleFeedbackSubmit(event) {
  event.preventDefault();

  // Get form data
  const formData = new FormData(event.target);
  const feedbackData = {
    name: formData.get('name'),
    email: formData.get('email'),
    type: formData.get('type'),
    message: formData.get('message'),
    rating: formData.get('rating'),
    timestamp: new Date().toISOString()
  };

  // Save feedback to localStorage
  const existingFeedback = JSON.parse(localStorage.getItem('feedback') || '[]');
  existingFeedback.push(feedbackData);
  localStorage.setItem('feedback', JSON.stringify(existingFeedback));

  // Show success message
  showFeedbackSuccessMessage();

  // Reset form
  event.target.reset();
}

// Show feedback success message
function showFeedbackSuccessMessage() {
  const message = document.createElement('div');
  message.className = 'feedback-success-message';
  message.textContent = '✅ Thank you for your feedback! We appreciate your input.';
  message.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
    color: white;
    padding: 15px 30px;
    border-radius: 10px;
    font-weight: 600;
    font-size: 16px;
    z-index: 1000;
    box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
    text-align: center;
    max-width: 400px;
    animation: messageSlideIn 0.5s ease-out;
  `;

  document.body.appendChild(message);

  // Remove message after 4 seconds
  setTimeout(() => {
    message.style.animation = 'messageSlideOut 0.5s ease-in';
    setTimeout(() => {
      message.remove();
    }, 500);
  }, 4000);
}

// Load dynamic notices from admin panel
function loadDynamicNotices() {
  const notices = JSON.parse(localStorage.getItem('notices') || '[]');
  const noticeContent = document.querySelector('.notice-content');

  if (!noticeContent) return;

  if (notices.length === 0) {
    // Show default notices if no admin notices
    noticeContent.innerHTML = `
      <div class="notice-item">
        <span class="notice-date">📅 15 Dec 2024</span>
        <p>🎉 New features added! Timer with motivational messages, task completion tracking, and improved UI!</p>
      </div>
      <div class="notice-item">
        <span class="notice-date">📅 14 Dec 2024</span>
        <p>📝 Diary feature now available! Save your daily thoughts and experiences.</p>
      </div>
      <div class="notice-item">
        <span class="notice-date">📅 13 Dec 2024</span>
        <p>📋 Notes feature added! Create and manage your study notes easily.</p>
      </div>
    `;
  } else {
    // Show admin notices
    noticeContent.innerHTML = notices.map(notice => `
      <div class="notice-item">
        <span class="notice-date">📅 ${notice.date}</span>
        <p>${notice.message}</p>
      </div>
    `).join('');
  }
}
