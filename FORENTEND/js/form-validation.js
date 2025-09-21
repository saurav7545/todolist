/**
 * Form Validation Utilities for Study Tracker
 */

class FormValidator {
    constructor() {
        this.rules = {};
        this.messages = {};
    }

    /**
     * Add validation rule for a field
     */
    addRule(fieldName, rule, message) {
        if (!this.rules[fieldName]) {
            this.rules[fieldName] = [];
        }
        this.rules[fieldName].push(rule);
        
        if (!this.messages[fieldName]) {
            this.messages[fieldName] = [];
        }
        this.messages[fieldName].push(message);
    }

    /**
     * Validate a single field
     */
    validateField(fieldName, value) {
        const fieldRules = this.rules[fieldName] || [];
        const fieldMessages = this.messages[fieldName] || [];
        
        for (let i = 0; i < fieldRules.length; i++) {
            const rule = fieldRules[i];
            const message = fieldMessages[i];
            
            if (!rule(value)) {
                return {
                    isValid: false,
                    message: message
                };
            }
        }
        
        return { isValid: true };
    }

    /**
     * Validate entire form
     */
    validateForm(formData) {
        const errors = {};
        let isValid = true;
        
        for (const [fieldName, value] of Object.entries(formData)) {
            const result = this.validateField(fieldName, value);
            if (!result.isValid) {
                errors[fieldName] = result.message;
                isValid = false;
            }
        }
        
        return {
            isValid,
            errors
        };
    }

    /**
     * Show validation errors in UI
     */
    showErrors(errors, formElement) {
        // Clear previous errors
        this.clearErrors(formElement);
        
        for (const [fieldName, message] of Object.entries(errors)) {
            const field = formElement.querySelector(`[name="${fieldName}"]`);
            if (field) {
                this.showFieldError(field, message);
            }
        }
    }

    /**
     * Show error for a specific field
     */
    showFieldError(field, message) {
        field.classList.add('error');
        
        // Create error message element
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        
        // Insert after field
        field.parentNode.insertBefore(errorElement, field.nextSibling);
    }

    /**
     * Clear all validation errors
     */
    clearErrors(formElement) {
        // Remove error classes
        const errorFields = formElement.querySelectorAll('.error');
        errorFields.forEach(field => field.classList.remove('error'));
        
        // Remove error messages
        const errorMessages = formElement.querySelectorAll('.field-error');
        errorMessages.forEach(msg => msg.remove());
    }

    /**
     * Real-time validation on input
     */
    enableRealTimeValidation(formElement) {
        const inputs = formElement.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                const fieldName = input.name;
                const value = input.value;
                
                if (fieldName && this.rules[fieldName]) {
                    const result = this.validateField(fieldName, value);
                    if (!result.isValid) {
                        this.showFieldError(input, result.message);
                    } else {
                        input.classList.remove('error');
                        const errorMsg = input.parentNode.querySelector('.field-error');
                        if (errorMsg) errorMsg.remove();
                    }
                }
            });
            
            input.addEventListener('input', () => {
                // Clear error on input
                input.classList.remove('error');
                const errorMsg = input.parentNode.querySelector('.field-error');
                if (errorMsg) errorMsg.remove();
            });
        });
    }
}

// Common validation rules
const ValidationRules = {
    required: (value) => value && value.trim().length > 0,
    
    minLength: (min) => (value) => value && value.length >= min,
    
    maxLength: (max) => (value) => !value || value.length <= max,
    
    email: (value) => {
        if (!value) return true; // Optional field
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    },
    
    password: (value) => {
        if (!value) return true;
        return Utils.validatePassword(value).isValid;
    },
    
    username: (value) => {
        if (!value) return true;
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        return usernameRegex.test(value);
    },
    
    phone: (value) => {
        if (!value) return true;
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(value.replace(/\s/g, ''));
    },
    
    date: (value) => {
        if (!value) return true;
        const date = new Date(value);
        return date instanceof Date && !isNaN(date);
    },
    
    time: (value) => {
        if (!value) return true;
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(value);
    },
    
    futureDate: (value) => {
        if (!value) return true;
        const date = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date >= today;
    },
    
    timeRange: (startTimeField) => (value, formData) => {
        if (!value || !formData[startTimeField]) return true;
        return value > formData[startTimeField];
    },
    
    numeric: (value) => {
        if (!value) return true;
        return !isNaN(value) && !isNaN(parseFloat(value));
    },
    
    positiveNumber: (value) => {
        if (!value) return true;
        const num = parseFloat(value);
        return !isNaN(num) && num > 0;
    },
    
    integer: (value) => {
        if (!value) return true;
        return Number.isInteger(parseFloat(value));
    },
    
    url: (value) => {
        if (!value) return true;
        try {
            new URL(value);
            return true;
        } catch {
            return false;
        }
    },
    
    fileSize: (maxSizeMB) => (file) => {
        if (!file) return true;
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        return file.size <= maxSizeBytes;
    },
    
    fileType: (allowedTypes) => (file) => {
        if (!file) return true;
        return allowedTypes.includes(file.type);
    }
};

// Pre-configured validators for common forms
const FormValidators = {
    // Task form validator
    task: new FormValidator(),
    
    // User registration validator
    registration: new FormValidator(),
    
    // Login form validator
    login: new FormValidator(),
    
    // Admin login validator
    adminLogin: new FormValidator(),
    
    // Feedback form validator
    feedback: new FormValidator(),
    
    // Note form validator
    note: new FormValidator(),
    
    // Diary entry validator
    diary: new FormValidator()
};

// Configure task form validation
FormValidators.task.addRule('title', ValidationRules.required, 'Task title is required');
FormValidators.task.addRule('title', ValidationRules.minLength(3), 'Task title must be at least 3 characters');
FormValidators.task.addRule('title', ValidationRules.maxLength(100), 'Task title must be less than 100 characters');
FormValidators.task.addRule('scheduled_date', ValidationRules.required, 'Date is required');
FormValidators.task.addRule('scheduled_date', ValidationRules.date, 'Please enter a valid date');
FormValidators.task.addRule('start_time', ValidationRules.required, 'Start time is required');
FormValidators.task.addRule('start_time', ValidationRules.time, 'Please enter a valid time');
FormValidators.task.addRule('end_time', ValidationRules.required, 'End time is required');
FormValidators.task.addRule('end_time', ValidationRules.time, 'Please enter a valid time');

// Configure registration form validation
FormValidators.registration.addRule('username', ValidationRules.required, 'Username is required');
FormValidators.registration.addRule('username', ValidationRules.username, 'Username must be 3-20 characters, letters, numbers, and underscores only');
FormValidators.registration.addRule('email', ValidationRules.required, 'Email is required');
FormValidators.registration.addRule('email', ValidationRules.email, 'Please enter a valid email address');
FormValidators.registration.addRule('password', ValidationRules.required, 'Password is required');
FormValidators.registration.addRule('password', ValidationRules.password, 'Password must be at least 8 characters with uppercase, lowercase, number, and special character');
FormValidators.registration.addRule('confirm_password', ValidationRules.required, 'Please confirm your password');

// Configure login form validation
FormValidators.login.addRule('username', ValidationRules.required, 'Username is required');
FormValidators.login.addRule('password', ValidationRules.required, 'Password is required');

// Configure admin login validation
FormValidators.adminLogin.addRule('username', ValidationRules.required, 'Username is required');
FormValidators.adminLogin.addRule('password', ValidationRules.required, 'Password is required');
FormValidators.adminLogin.addRule('email', ValidationRules.required, 'Email is required');
FormValidators.adminLogin.addRule('email', ValidationRules.email, 'Please enter a valid email address');

// Configure feedback form validation
FormValidators.feedback.addRule('subject', ValidationRules.required, 'Subject is required');
FormValidators.feedback.addRule('subject', ValidationRules.minLength(5), 'Subject must be at least 5 characters');
FormValidators.feedback.addRule('message', ValidationRules.required, 'Message is required');
FormValidators.feedback.addRule('message', ValidationRules.minLength(10), 'Message must be at least 10 characters');

// Configure note form validation
FormValidators.note.addRule('title', ValidationRules.required, 'Note title is required');
FormValidators.note.addRule('title', ValidationRules.minLength(3), 'Note title must be at least 3 characters');
FormValidators.note.addRule('content', ValidationRules.required, 'Note content is required');

// Configure diary form validation
FormValidators.diary.addRule('title', ValidationRules.required, 'Entry title is required');
FormValidators.diary.addRule('title', ValidationRules.minLength(3), 'Entry title must be at least 3 characters');
FormValidators.diary.addRule('content', ValidationRules.required, 'Entry content is required');
FormValidators.diary.addRule('content', ValidationRules.minLength(10), 'Entry content must be at least 10 characters');

// Utility functions for form validation
const FormValidationUtils = {
    /**
     * Validate and submit form
     */
    async validateAndSubmit(formElement, validator, submitCallback) {
        const formData = new FormData(formElement);
        const data = Object.fromEntries(formData.entries());
        
        // Validate form
        const validation = validator.validateForm(data);
        
        if (!validation.isValid) {
            validator.showErrors(validation.errors, formElement);
            return false;
        }
        
        // Clear any existing errors
        validator.clearErrors(formElement);
        
        // Submit form
        try {
            await submitCallback(data);
            return true;
        } catch (error) {
            Utils.showError(error.message || 'Form submission failed');
            return false;
        }
    },
    
    /**
     * Add custom validation rule
     */
    addCustomRule(name, ruleFunction) {
        ValidationRules[name] = ruleFunction;
    },
    
    /**
     * Get validator for form type
     */
    getValidator(formType) {
        return FormValidators[formType] || new FormValidator();
    },
    
    /**
     * Validate password confirmation
     */
    validatePasswordConfirmation(password, confirmPassword) {
        return password === confirmPassword;
    },
    
    /**
     * Validate time range
     */
    validateTimeRange(startTime, endTime) {
        if (!startTime || !endTime) return true;
        return endTime > startTime;
    }
};

// Make validation utilities globally available
window.FormValidator = FormValidator;
window.ValidationRules = ValidationRules;
window.FormValidators = FormValidators;
window.FormValidationUtils = FormValidationUtils;
