// Check if user is already logged in
document.addEventListener('DOMContentLoaded', async function() {
    const currentUser = await apiClient.getCurrentUser();
    if (currentUser) {
        window.location.href = '../index.html';
        return;
    }
});

// Global variables
let loginData = null;
let otpTimer = null;
let otpExpiryTime = null;

// Initialize form validation
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing login...');
    
    // Check if required elements exist
    const loginForm = document.getElementById('loginForm');
    const otpForm = document.getElementById('otpForm');
    
    console.log('Login form found:', !!loginForm);
    console.log('OTP form found:', !!otpForm);
    
    // Set up form handlers
    setupLoginForm();
    setupOTPForm();
    
    console.log('Login initialization complete');
});

/**
 * Setup login form
 */
function setupLoginForm() {
    const form = document.getElementById('loginForm');
    
    if (!form) {
        console.error('Login form not found');
        return;
    }
    
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        console.log('Form submitted');
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        console.log('Form data:', data);
        
        // Direct call to handleLogin
        await handleLogin(data);
    });
}

/**
 * Setup OTP form
 */
function setupOTPForm() {
    const form = document.getElementById('otpForm');
    const resendBtn = document.getElementById('resendOtpBtn');
    const backBtn = document.getElementById('backToLoginBtn');
    
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Validate form
        const validation = FormValidationUtils.validateAndSubmit(
            form, 
            FormValidationUtils.getValidator('otp'),
            async (formData) => {
                await handleOTPLogin(formData);
            }
        );
    });
    
    // Resend OTP button
    resendBtn.addEventListener('click', async function() {
        await resendOTP();
    });
    
    // Back to login button
    backBtn.addEventListener('click', function() {
        backToLogin();
    });
}

async function handleLogin(data) {
  console.log('handleLogin called with:', data);
  
  // Hide any existing messages
  hideMessages();

  // Simple validation
  if (!data.email || !data.password) {
    showError('Please fill in all fields');
    return;
  }

  // Check if apiClient is available
  if (typeof apiClient === 'undefined') {
    console.error('apiClient is not defined');
    showError('Application not loaded properly. Please refresh the page.');
    return;
  }

  try {
    // Show loading state
    const submitBtn = document.querySelector('#loginForm button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;

    console.log('Checking demo user login...');
    
    // Check if it's a demo user - direct login
    if ((data.email === 'demo@studytracker.com' || data.email === 'demo') && data.password === '123456') {
      console.log('Demo user detected, attempting login...');
      const response = await apiClient.login(data.email, '123456');
      console.log('Login response:', response);
      showSuccess('Demo login successful! Redirecting...');
      
      setTimeout(() => {
        window.location.href = '../index.html';
      }, 1000);
      return;
    }

    // Store login data
    loginData = {
      email: data.email,
      password: data.password
    };

    // Request OTP for login
    const response = await apiClient.requestLoginOTP(data.email);
    
    // Show OTP form
    showOTPForm(data.email);
    
    // Start OTP timer
    startOTPTimer(response.expires_in);
    
    showSuccess('OTP sent to your email! Please check and enter the code.');

  } catch (error) {
    console.error('Login error:', error);
    showError(error.message || 'Login failed. Please check your credentials.');
  } finally {
    // Reset button state
    const submitBtn = document.querySelector('#loginForm button[type="submit"]');
    if (submitBtn) {
      submitBtn.textContent = '🔐 Login';
      submitBtn.disabled = false;
    }
  }
}

/**
 * Handle OTP login
 */
async function handleOTPLogin(data) {
  try {
    // Show loading state
    const submitBtn = document.querySelector('#otpForm button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Verifying...';
    submitBtn.disabled = true;

    // Login with OTP
    const response = await apiClient.loginWithOTP(loginData.email, loginData.password, data.otp_code);
    
    showSuccess('Login successful! Redirecting...');

    // Redirect to main page after 1 second
    setTimeout(() => {
      window.location.href = '../index.html';
    }, 1000);

  } catch (error) {
    console.error('OTP login error:', error);
    showError(error.message || 'OTP verification failed. Please try again.');
  } finally {
    // Reset button state
    const submitBtn = document.querySelector('#otpForm button[type="submit"]');
    submitBtn.textContent = '✅ Verify & Login';
    submitBtn.disabled = false;
  }
}

/**
 * Resend OTP
 */
async function resendOTP() {
  try {
    // Show loading state
    const resendBtn = document.getElementById('resendOtpBtn');
    const originalText = resendBtn.textContent;
    resendBtn.textContent = 'Sending...';
    resendBtn.disabled = true;
    
    // Request new OTP
    const response = await apiClient.requestLoginOTP(loginData.email);
    
    // Restart timer
    startOTPTimer(response.expires_in);
    
    showSuccess('New OTP sent to your email!');
    
  } catch (error) {
    console.error('Resend OTP error:', error);
    showError(error.message || 'Failed to resend OTP. Please try again.');
  } finally {
    // Reset button state
    const resendBtn = document.getElementById('resendOtpBtn');
    resendBtn.textContent = '🔄 Resend OTP';
    resendBtn.disabled = false;
  }
}

/**
 * Show OTP form
 */
function showOTPForm(email) {
  // Hide login form
  document.getElementById('loginForm').style.display = 'none';
  
  // Show OTP form
  document.getElementById('otpForm').style.display = 'block';
  
  // Set email in OTP form
  document.getElementById('userEmail').textContent = email;
  
  // Focus on OTP input
  document.getElementById('otpCode').focus();
}

/**
 * Back to login form
 */
function backToLogin() {
  // Hide OTP form
  document.getElementById('otpForm').style.display = 'none';
  
  // Show login form
  document.getElementById('loginForm').style.display = 'block';
  
  // Clear timer
  if (otpTimer) {
    clearInterval(otpTimer);
  }
  
  // Clear login data
  loginData = null;
}

/**
 * Start OTP timer
 */
function startOTPTimer(expiresIn) {
  otpExpiryTime = Date.now() + (expiresIn * 1000);
  
  // Clear existing timer
  if (otpTimer) {
    clearInterval(otpTimer);
  }
  
  // Update timer every second
  otpTimer = setInterval(updateOTPTimer, 1000);
  updateOTPTimer();
}

/**
 * Update OTP timer display
 */
function updateOTPTimer() {
  const now = Date.now();
  const timeLeft = Math.max(0, Math.floor((otpExpiryTime - now) / 1000));
  
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  const timerDisplay = document.querySelector('.otp-timer');
  if (timerDisplay) {
    timerDisplay.textContent = `Time left: ${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  
  if (timeLeft <= 0) {
    clearInterval(otpTimer);
    showError('OTP expired. Please request a new one.');
  }
}

/**
 * Format OTP input
 */
document.getElementById('otpCode').addEventListener('input', function(e) {
  // Only allow numbers
  e.target.value = e.target.value.replace(/\D/g, '');
  
  // Auto-submit when 6 digits are entered
  if (e.target.value.length === 6) {
    document.getElementById('otpForm').dispatchEvent(new Event('submit'));
  }
});

function showRegister() {
  window.location.href = '../register.html';
}

function showError(message) {
  const errorDiv = document.getElementById('error-message');
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
}

function showSuccess(message) {
  const successDiv = document.getElementById('success-message');
  successDiv.textContent = message;
  successDiv.style.display = 'block';
}

function hideMessages() {
  document.getElementById('error-message').style.display = 'none';
  document.getElementById('success-message').style.display = 'none';
}

// Add keyboard support for Enter key
document.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    handleLogin(e);
  }
}); 