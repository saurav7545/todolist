// Check if admin is already logged in
document.addEventListener('DOMContentLoaded', function () {
  if (localStorage.getItem('adminLoggedIn') === 'true') {
    window.location.href = 'admin-dashboard.html';
  }

  // Initialize OTP functionality
  initializeOTPInputs();
});

// Admin login form handling
document.getElementById('adminLoginForm').addEventListener('submit', function (event) {
  event.preventDefault();

  const username = document.getElementById('adminUsername').value;
  const password = document.getElementById('adminPassword').value;
  const email = document.getElementById('adminEmail').value;

  // Admin credentials (in real app, this would be server-side)
  const adminCredentials = {
    username: 'indianhacker',
    password: 'hacker@8756',
    email: 'game@changer.com'
  };

  // Check credentials
  if (username === adminCredentials.username && password === adminCredentials.password && email === adminCredentials.email) {
    // Store email for OTP verification
    localStorage.setItem('adminEmail', email);

    // Generate and send OTP
    const otp = generateOTP();
    localStorage.setItem('adminOTP', otp);
    localStorage.setItem('otpExpiry', Date.now() + (5 * 60 * 1000)); // 5 minutes expiry

    // Show OTP form
    showOTPForm(email);

    // Start timer
    startOTPTimer();

    // Show success message
    showMessage('📧 OTP sent to your email!', 'success');
  } else {
    // Show error message
    showMessage('❌ Invalid credentials! Please check username, password, and email.', 'error');

    // Clear password field
    document.getElementById('adminPassword').value = '';
  }
});

// Handle OTP form submission
document.getElementById('otpForm').addEventListener('submit', function (event) {
  event.preventDefault();

  const enteredOTP = getEnteredOTP();
  const storedOTP = localStorage.getItem('adminOTP');
  const otpExpiry = localStorage.getItem('otpExpiry');

  // Check if OTP is expired
  if (Date.now() > parseInt(otpExpiry)) {
    showMessage('⏰ OTP has expired! Please request a new one.', 'error');
    return;
  }

  // Verify OTP
  if (enteredOTP === storedOTP) {
    // Store admin login status
    localStorage.setItem('adminLoggedIn', 'true');
    localStorage.setItem('adminUsername', document.getElementById('adminUsername').value);

    // Clear OTP data
    localStorage.removeItem('adminOTP');
    localStorage.removeItem('otpExpiry');
    localStorage.removeItem('adminEmail');

    // Show success message
    showMessage('✅ OTP verified! Login successful! Redirecting to admin dashboard...', 'success');

    // Redirect to admin dashboard
    setTimeout(() => {
      window.location.href = 'admin-dashboard.html';
    }, 1500);
  } else {
    showMessage('❌ Invalid OTP! Please try again.', 'error');
    clearOTPInputs();
  }
});

// OTP Functions
function generateOTP() {
  // For demo purposes, return a fixed OTP
  // In real implementation, this would be generated randomly and sent via email
  return '544145';
}

function showOTPForm(email) {
  document.getElementById('adminLoginForm').classList.remove('active');
  document.getElementById('otpForm').classList.add('active');
  document.getElementById('emailDisplay').textContent = email;
  clearOTPInputs();
}

function backToLogin() {
  document.getElementById('otpForm').classList.remove('active');
  document.getElementById('adminLoginForm').classList.add('active');
  clearOTPInputs();
  stopOTPTimer();
}

function initializeOTPInputs() {
  const otpInputs = document.querySelectorAll('.otp-input');

  otpInputs.forEach((input, index) => {
    input.addEventListener('input', function (e) {
      const value = e.target.value;

      if (value.length === 1) {
        input.classList.add('filled');

        // Move to next input
        if (index < otpInputs.length - 1) {
          otpInputs[index + 1].focus();
        }
      } else {
        input.classList.remove('filled');
      }
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Backspace' && !e.target.value && index > 0) {
        otpInputs[index - 1].focus();
      }
    });
  });
}

function getEnteredOTP() {
  const otpInputs = document.querySelectorAll('.otp-input');
  let otp = '';
  otpInputs.forEach(input => {
    otp += input.value;
  });
  return otp;
}

function clearOTPInputs() {
  const otpInputs = document.querySelectorAll('.otp-input');
  otpInputs.forEach(input => {
    input.value = '';
    input.classList.remove('filled');
  });
  otpInputs[0].focus();
}

let otpTimerInterval;

function startOTPTimer() {
  let timeLeft = 60;
  const timerElement = document.getElementById('timerCount');
  const resendBtn = document.querySelector('.resend-btn');

  resendBtn.disabled = true;

  otpTimerInterval = setInterval(() => {
    timeLeft--;
    timerElement.textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(otpTimerInterval);
      document.getElementById('otpTimer').textContent = 'OTP expired';
      resendBtn.disabled = false;
    }
  }, 1000);
}

function stopOTPTimer() {
  if (otpTimerInterval) {
    clearInterval(otpTimerInterval);
  }
}

function resendOTP() {
  const email = localStorage.getItem('adminEmail');
  if (!email) {
    showMessage('❌ Email not found! Please go back and try again.', 'error');
    return;
  }

  // Generate new OTP
  const newOTP = generateOTP();
  localStorage.setItem('adminOTP', newOTP);
  localStorage.setItem('otpExpiry', Date.now() + (5 * 60 * 1000));

  // Clear inputs and restart timer
  clearOTPInputs();
  stopOTPTimer();
  startOTPTimer();

  showMessage('📧 New OTP sent to your email!', 'success');
}

// Show message function
function showMessage(message, type) {
  // Remove existing messages
  const existingMessage = document.querySelector('.error-message, .success-message');
  if (existingMessage) {
    existingMessage.remove();
  }

  // Create new message
  const messageDiv = document.createElement('div');
  messageDiv.className = type === 'error' ? 'error-message' : 'success-message';
  messageDiv.textContent = message;

  // Insert message before the form
  const form = document.querySelector('.login-form.active');
  form.parentNode.insertBefore(messageDiv, form);

  // Auto-remove error messages after 5 seconds
  if (type === 'error') {
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, 5000);
  }
} 