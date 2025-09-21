/**
 * Registration and OTP Verification Script
 */

// Global variables
let registrationData = null;
let otpTimer = null;
let otpExpiryTime = null;

// Initialize form validation
document.addEventListener('DOMContentLoaded', function() {
    // Set up form validation
    const registrationValidator = FormValidationUtils.getValidator('registration');
    const otpValidator = new FormValidator();
    
    // Add OTP validation rule
    otpValidator.addRule('otp_code', ValidationRules.required, 'OTP code is required');
    otpValidator.addRule('otp_code', (value) => /^\d{6}$/.test(value), 'OTP must be 6 digits');
    
    // Enable real-time validation
    registrationValidator.enableRealTimeValidation(document.getElementById('registrationForm'));
    otpValidator.enableRealTimeValidation(document.getElementById('otpForm'));
    
    // Set up form handlers
    setupRegistrationForm();
    setupOTPForm();
});

/**
 * Setup registration form
 */
function setupRegistrationForm() {
    const form = document.getElementById('registrationForm');
    
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Validate form
        const validation = FormValidationUtils.validateAndSubmit(
            form, 
            FormValidationUtils.getValidator('registration'),
            async (formData) => {
                await handleRegistration(formData);
            }
        );
    });
}

/**
 * Setup OTP form
 */
function setupOTPForm() {
    const form = document.getElementById('otpForm');
    const resendBtn = document.getElementById('resendOtpBtn');
    
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Validate form
        const validation = FormValidationUtils.validateAndSubmit(
            form, 
            FormValidationUtils.getValidator('otp'),
            async (formData) => {
                await handleOTPVerification(formData);
            }
        );
    });
    
    // Resend OTP button
    resendBtn.addEventListener('click', async function() {
        await resendOTP();
    });
}

/**
 * Handle user registration
 */
async function handleRegistration(data) {
    try {
        // Show loading state
        const submitBtn = document.querySelector('#registrationForm button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending OTP...';
        submitBtn.disabled = true;
        
        // Validate password confirmation
        if (data.password !== data.confirm_password) {
            throw new Error('Passwords do not match');
        }
        
        // Store registration data
        registrationData = {
            username: data.username,
            email: data.email,
            password: data.password,
            first_name: data.first_name,
            last_name: data.last_name
        };
        
        // Send registration request
        const response = await apiClient.register(registrationData);
        
        // Show OTP form
        showOTPForm(data.email);
        
        // Start OTP timer
        startOTPTimer(response.data.expires_in);
        
        Utils.showSuccess(response.message);
        
    } catch (error) {
        console.error('Registration error:', error);
        Utils.showError(error.message || 'Registration failed. Please try again.');
    } finally {
        // Reset button state
        const submitBtn = document.querySelector('#registrationForm button[type="submit"]');
        submitBtn.textContent = '📧 Register & Send OTP';
        submitBtn.disabled = false;
    }
}

/**
 * Handle OTP verification
 */
async function handleOTPVerification(data) {
    try {
        // Show loading state
        const submitBtn = document.querySelector('#otpForm button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Verifying...';
        submitBtn.disabled = true;
        
        // Verify OTP
        const response = await apiClient.verifyOTP(registrationData.email, data.otp_code);
        
        // Complete registration
        Utils.showSuccess(response.message);
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
            window.location.href = 'login/login.html';
        }, 2000);
        
    } catch (error) {
        console.error('OTP verification error:', error);
        Utils.showError(error.message || 'OTP verification failed. Please try again.');
    } finally {
        // Reset button state
        const submitBtn = document.querySelector('#otpForm button[type="submit"]');
        submitBtn.textContent = '✅ Verify & Complete Registration';
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
        const response = await apiClient.requestLoginOTP(registrationData.email);
        
        // Restart timer
        startOTPTimer(response.expires_in);
        
        Utils.showSuccess(response.message);
        
    } catch (error) {
        console.error('Resend OTP error:', error);
        Utils.showError(error.message || 'Failed to resend OTP. Please try again.');
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
    // Hide registration form
    document.getElementById('registrationForm').style.display = 'none';
    
    // Show OTP form
    document.getElementById('otpForm').style.display = 'block';
    
    // Set email in OTP form
    document.getElementById('userEmail').textContent = email;
    
    // Focus on OTP input
    document.getElementById('otpCode').focus();
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
        Utils.showWarning('OTP expired. Please request a new one.');
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

/**
 * Handle back to registration
 */
function backToRegistration() {
    // Hide OTP form
    document.getElementById('otpForm').style.display = 'none';
    
    // Show registration form
    document.getElementById('registrationForm').style.display = 'block';
    
    // Clear timer
    if (otpTimer) {
        clearInterval(otpTimer);
    }
    
    // Clear registration data
    registrationData = null;
}

