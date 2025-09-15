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
        const response = await apiClient.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(registrationData)
        });
        
        // Show OTP form
        showOTPForm(data.email);
        
        // Start OTP timer
        startOTPTimer(response.data.expires_in);
        
        Utils.showSuccess('Registration successful! Please check your email for OTP verification.');
        
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
        const response = await apiClient.request('/auth/verify-otp', {
            method: 'POST',
            body: JSON.stringify({
                email: registrationData.email,
                otp_code: data.otp_code
            })
        });
        
        // Complete registration
        await completeRegistration();
        
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
 * Complete user registration
 */
async function completeRegistration() {
    try {
        // Create user in database
        const userData = {
            username: registrationData.username,
            email: registrationData.email,
            password_hash: await hashPassword(registrationData.password),
            first_name: registrationData.first_name,
            last_name: registrationData.last_name,
            is_active: true,
            is_email_verified: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        // In a real implementation, you would send this to your backend
        // For now, we'll simulate success
        Utils.showSuccess('Registration completed successfully! Redirecting to login...');
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
            window.location.href = 'login/login.html';
        }, 2000);
        
    } catch (error) {
        console.error('Complete registration error:', error);
        Utils.showError('Failed to complete registration. Please try again.');
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
        const response = await apiClient.request('/auth/request-login-otp', {
            method: 'POST',
            body: JSON.stringify({
                email: registrationData.email,
                otp_type: 'registration'
            })
        });
        
        // Restart timer
        startOTPTimer(response.expires_in);
        
        Utils.showSuccess('New OTP sent to your email!');
        
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
 * Hash password (client-side simulation)
 * In a real implementation, this would be done on the server
 */
async function hashPassword(password) {
    // This is just a simulation - in reality, password hashing should be done on the server
    return btoa(password); // Base64 encoding (NOT secure for production)
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

