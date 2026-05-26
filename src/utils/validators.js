/**
 * Validation utility functions
 */

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with score and feedback
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, score: 0, feedback: 'Password is required' };
  }

  let score = 0;
  const feedback = [];

  // Length check
  if (password.length >= 8) {
    score++;
  } else {
    feedback.push('At least 8 characters');
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score++;
  } else {
    feedback.push('One uppercase letter');
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score++;
  } else {
    feedback.push('One lowercase letter');
  }

  // Number check
  if (/\d/.test(password)) {
    score++;
  } else {
    feedback.push('One number');
  }

  // Special character check
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score++;
  } else {
    feedback.push('One special character');
  }

  return {
    isValid: score >= 3,
    score,
    feedback: feedback.length > 0 ? feedback.join(', ') : 'Strong password'
  };
};

/**
 * Get password strength label
 * @param {number} score - Password score
 * @returns {string} Strength label
 */
export const getPasswordStrengthLabel = (score) => {
  if (score <= 1) return 'Weak';
  if (score === 2) return 'Fair';
  if (score === 3) return 'Good';
  if (score === 4) return 'Strong';
  return 'Very Strong';
};

/**
 * Get password strength color
 * @param {number} score - Password score
 * @returns {string} Color hex code
 */
export const getPasswordStrengthColor = (score) => {
  if (score <= 1) return '#ff4757';
  if (score === 2) return '#ffa502';
  if (score === 3) return '#2ed573';
  if (score === 4) return '#1e90ff';
  return '#a55eea';
};

/**
 * Validate username
 * @param {string} username - Username to validate
 * @returns {Object} Validation result
 */
export const validateUsername = (username) => {
  if (!username || username.trim().length === 0) {
    return { isValid: false, message: 'Username is required' };
  }

  if (username.length < 3) {
    return { isValid: false, message: 'Username must be at least 3 characters' };
  }

  if (username.length > 50) {
    return { isValid: false, message: 'Username must be less than 50 characters' };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { isValid: false, message: 'Username can only contain letters, numbers, and underscores' };
  }

  return { isValid: true, message: '' };
};

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {boolean} Is valid URL
 */
export const isValidURL = (url) => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate required field
 * @param {*} value - Value to check
 * @param {string} fieldName - Field name for error message
 * @returns {Object} Validation result
 */
export const validateRequired = (value, fieldName = 'Field') => {
  if (!value || (typeof value === 'string' && value.trim().length === 0)) {
    return { isValid: false, message: `${fieldName} is required` };
  }
  return { isValid: true, message: '' };
};

/**
 * Validate minimum length
 * @param {string} value - Value to check
 * @param {number} minLength - Minimum length
 * @param {string} fieldName - Field name for error message
 * @returns {Object} Validation result
 */
export const validateMinLength = (value, minLength, fieldName = 'Field') => {
  if (value && value.length < minLength) {
    return { isValid: false, message: `${fieldName} must be at least ${minLength} characters` };
  }
  return { isValid: true, message: '' };
};

/**
 * Validate maximum length
 * @param {string} value - Value to check
 * @param {number} maxLength - Maximum length
 * @param {string} fieldName - Field name for error message
 * @returns {Object} Validation result
 */
export const validateMaxLength = (value, maxLength, fieldName = 'Field') => {
  if (value && value.length > maxLength) {
    return { isValid: false, message: `${fieldName} must be less than ${maxLength} characters` };
  }
  return { isValid: true, message: '' };
};

/**
 * Validate number range
 * @param {number} value - Value to check
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {string} fieldName - Field name for error message
 * @returns {Object} Validation result
 */
export const validateNumberRange = (value, min, max, fieldName = 'Field') => {
  const num = Number(value);
  if (isNaN(num)) {
    return { isValid: false, message: `${fieldName} must be a number` };
  }
  if (num < min) {
    return { isValid: false, message: `${fieldName} must be at least ${min}` };
  }
  if (num > max) {
    return { isValid: false, message: `${fieldName} must be less than ${max}` };
  }
  return { isValid: true, message: '' };
};

/**
 * Validate file type
 * @param {File} file - File to validate
 * @param {string[]} allowedTypes - Array of allowed MIME types
 * @returns {Object} Validation result
 */
export const validateFileType = (file, allowedTypes) => {
  if (!file) {
    return { isValid: false, message: 'File is required' };
  }
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, message: `File type not allowed. Allowed: ${allowedTypes.join(', ')}` };
  }
  return { isValid: true, message: '' };
};

/**
 * Validate file size
 * @param {File} file - File to validate
 * @param {number} maxSizeInMB - Maximum file size in MB
 * @returns {Object} Validation result
 */
export const validateFileSize = (file, maxSizeInMB = 500) => {
  if (!file) {
    return { isValid: false, message: 'File is required' };
  }
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    return { isValid: false, message: `File size must be less than ${maxSizeInMB}MB` };
  }
  return { isValid: true, message: '' };
};

/**
 * Validate audio file
 * @param {File} file - Audio file to validate
 * @returns {Object} Validation result
 */
export const validateAudioFile = (file) => {
  const allowedTypes = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/x-m4a',
    'audio/mp4'
  ];

  const typeResult = validateFileType(file, allowedTypes);
  if (!typeResult.isValid) return typeResult;

  const sizeResult = validateFileSize(file, 500);
  if (!sizeResult.isValid) return sizeResult;

  return { isValid: true, message: '' };
};

/**
 * Validate image file
 * @param {File} file - Image file to validate
 * @returns {Object} Validation result
 */
export const validateImageFile = (file) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ];

  const typeResult = validateFileType(file, allowedTypes);
  if (!typeResult.isValid) return typeResult;

  const sizeResult = validateFileSize(file, 10);
  if (!sizeResult.isValid) return sizeResult;

  return { isValid: true, message: '' };
};

/**
 * Validate form data against rules
 * @param {Object} data - Form data
 * @param {Object} rules - Validation rules
 * @returns {Object} Errors object
 */
export const validateForm = (data, rules) => {
  const errors = {};

  Object.keys(rules).forEach((field) => {
    const value = data[field];
    const fieldRules = rules[field];

    if (fieldRules.required) {
      const requiredResult = validateRequired(value, fieldRules.label || field);
      if (!requiredResult.isValid) {
        errors[field] = requiredResult.message;
        return;
      }
    }

    if (value) {
      if (fieldRules.minLength) {
        const minResult = validateMinLength(value, fieldRules.minLength, fieldRules.label || field);
        if (!minResult.isValid) {
          errors[field] = minResult.message;
          return;
        }
      }

      if (fieldRules.maxLength) {
        const maxResult = validateMaxLength(value, fieldRules.maxLength, fieldRules.label || field);
        if (!maxResult.isValid) {
          errors[field] = maxResult.message;
          return;
        }
      }

      if (fieldRules.email) {
        if (!isValidEmail(value)) {
          errors[field] = 'Please enter a valid email address';
          return;
        }
      }

      if (fieldRules.pattern) {
        if (!fieldRules.pattern.test(value)) {
          errors[field] = fieldRules.patternMessage || 'Invalid format';
          return;
        }
      }

      if (fieldRules.custom) {
        const customResult = fieldRules.custom(value, data);
        if (customResult) {
          errors[field] = customResult;
          return;
        }
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};