// Form validation utilities

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
    errors: {
      minLength: password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
    },
    message: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
      ? ''
      : 'Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters',
  };
};

// Phone number validation
export const validatePhone = (phone) => {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

// Name validation
export const validateName = (name) => {
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  return nameRegex.test(name) && name.trim().length >= 2;
};

// URL validation
export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Required field validation
export const validateRequired = (value) => {
  return value !== null && value !== undefined && value.toString().trim() !== '';
};

// Number validation
export const validateNumber = (value, min = null, max = null) => {
  const num = parseFloat(value);
  if (isNaN(num)) return false;
  
  if (min !== null && num < min) return false;
  if (max !== null && num > max) return false;
  
  return true;
};

// Date validation
export const validateDate = (date, minDate = null, maxDate = null) => {
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) return false;
  
  if (minDate && parsedDate < new Date(minDate)) return false;
  if (maxDate && parsedDate > new Date(maxDate)) return false;
  
  return true;
};

// File validation
export const validateFile = (file, maxSize = 5 * 1024 * 1024, allowedTypes = []) => {
  if (!file) return { isValid: false, error: 'No file provided' };
  
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}` 
    };
  }
  
  if (file.size > maxSize) {
    return { 
      isValid: false, 
      error: `File size ${file.size} exceeds maximum size of ${maxSize / 1024 / 1024}MB` 
    };
  }
  
  return { isValid: true, error: null };
};

// Address validation
export const validateAddress = (address) => {
  const errors = {};
  
  if (!address.street || address.street.trim().length < 5) {
    errors.street = 'Street address must be at least 5 characters';
  }
  
  if (!address.city || address.city.trim().length < 2) {
    errors.city = 'City is required';
  }
  
  if (!address.state || address.state.trim().length < 2) {
    errors.state = 'State is required';
  }
  
  if (!address.zipCode || !/^\d{5}(-\d{4})?$/.test(address.zipCode)) {
    errors.zipCode = 'Invalid ZIP code format';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Credit card validation
export const validateCreditCard = (cardNumber) => {
  // Remove spaces and dashes
  const cleaned = cardNumber.replace(/[\s-]/g, '');
  
  // Check if it's numeric and has valid length
  if (!/^\d+$/.test(cleaned) || cleaned.length < 13 || cleaned.length > 19) {
    return { isValid: false, error: 'Invalid card number' };
  }

  // Luhn algorithm
  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  const isValid = sum % 10 === 0;
  return {
    isValid,
    error: isValid ? null : 'Invalid card number',
    cardType: getCardType(cleaned),
  };
};

// Get card type from number
export const getCardType = (cardNumber) => {
  const cleaned = cardNumber.replace(/[\s-]/g, '');

  if (/^4/.test(cleaned)) return 'visa';
  if (/^5[1-5]/.test(cleaned)) return 'mastercard';
  if (/^3[47]/.test(cleaned)) return 'american_express';
  if (/^6(?:011|5)/.test(cleaned)) return 'discover';
  if (/^3(?:0[0-5]|[68])/.test(cleaned)) return 'diners_club';
  if (/^35/.test(cleaned)) return 'jcb';

  return 'unknown';
};

// CVV validation
export const validateCVV = (cvv, cardType = 'unknown') => {
  const cvvRegex = cardType === 'american_express' ? /^\d{4}$/ : /^\d{3}$/;
  return {
    isValid: cvvRegex.test(cvv),
    error: cvvRegex.test(cvv) ? null : `Invalid CVV for ${cardType}`,
  };
};

// Expiry date validation
export const validateExpiry = (expiry) => {
  const match = expiry.match(/^(\d{2})\/(\d{4})$/);
  if (!match) {
    return { isValid: false, error: 'Invalid format. Use MM/YYYY' };
  }

  const month = parseInt(match[1]);
  const year = parseInt(match[2]);

  if (month < 1 || month > 12) {
    return { isValid: false, error: 'Invalid month' };
  }

  const now = new Date();
  const expiryDate = new Date(year, month - 1, 1);
  const currentDate = new Date(now.getFullYear(), now.getMonth(), 1);

  const isValid = expiryDate >= currentDate;
  return {
    isValid,
    error: isValid ? null : 'Card has expired',
  };
};

// Property validation
export const validateProperty = (property) => {
  const errors = {};
  
  if (!property.title || property.title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters';
  }
  
  if (!property.description || property.description.trim().length < 10) {
    errors.description = 'Description must be at least 10 characters';
  }
  
  if (!property.type) {
    errors.type = 'Property type is required';
  }
  
  if (!property.pricing || !property.pricing.rent || property.pricing.rent <= 0) {
    errors.rent = 'Rent amount must be greater than 0';
  }
  
  if (!property.address || !validateAddress(property.address).isValid) {
    errors.address = 'Valid address is required';
  }
  
  if (!property.bedrooms || property.bedrooms < 0) {
    errors.bedrooms = 'Number of bedrooms must be 0 or greater';
  }
  
  if (!property.bathrooms || property.bathrooms < 0) {
    errors.bathrooms = 'Number of bathrooms must be 0 or greater';
  }
  
  if (!property.squareFeet || property.squareFeet <= 0) {
    errors.squareFeet = 'Square footage must be greater than 0';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Application validation
export const validateApplication = (application) => {
  const errors = {};
  
  if (!application.personalInfo) {
    errors.personalInfo = 'Personal information is required';
  } else {
    if (!validateName(application.personalInfo.firstName)) {
      errors.firstName = 'Valid first name is required';
    }
    
    if (!validateName(application.personalInfo.lastName)) {
      errors.lastName = 'Valid last name is required';
    }
    
    if (!validateEmail(application.personalInfo.email)) {
      errors.email = 'Valid email is required';
    }
    
    if (!validatePhone(application.personalInfo.phone)) {
      errors.phone = 'Valid phone number is required';
    }
  }
  
  if (!application.employmentInfo) {
    errors.employmentInfo = 'Employment information is required';
  } else {
    if (!application.employmentInfo.employer || application.employmentInfo.employer.trim().length < 2) {
      errors.employer = 'Employer name is required';
    }
    
    if (!validateNumber(application.employmentInfo.income, 0)) {
      errors.income = 'Valid income amount is required';
    }
    
    if (!application.employmentInfo.position || application.employmentInfo.position.trim().length < 2) {
      errors.position = 'Position is required';
    }
  }
  
  if (!application.references || application.references.length < 2) {
    errors.references = 'At least 2 references are required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Form field validation helper
export const validateField = (value, rules) => {
  const errors = [];
  
  rules.forEach(rule => {
    if (rule.required && !validateRequired(value)) {
      errors.push(rule.message || 'This field is required');
      return;
    }
    
    if (rule.type === 'email' && value && !validateEmail(value)) {
      errors.push(rule.message || 'Invalid email format');
    }
    
    if (rule.type === 'phone' && value && !validatePhone(value)) {
      errors.push(rule.message || 'Invalid phone number');
    }
    
    if (rule.type === 'number' && value && !validateNumber(value, rule.min, rule.max)) {
      errors.push(rule.message || 'Invalid number');
    }
    
    if (rule.type === 'url' && value && !validateUrl(value)) {
      errors.push(rule.message || 'Invalid URL format');
    }
    
    if (rule.minLength && value && value.length < rule.minLength) {
      errors.push(rule.message || `Minimum length is ${rule.minLength}`);
    }
    
    if (rule.maxLength && value && value.length > rule.maxLength) {
      errors.push(rule.message || `Maximum length is ${rule.maxLength}`);
    }
    
    if (rule.pattern && value && !rule.pattern.test(value)) {
      errors.push(rule.message || 'Invalid format');
    }
    
    if (rule.custom && rule.custom(value) === false) {
      errors.push(rule.message || 'Invalid value');
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Real-time validation for forms
export const createValidator = (schema) => {
  return (data) => {
    const errors = {};
    let isValid = true;
    
    Object.keys(schema).forEach(field => {
      const rules = schema[field];
      const value = data[field];
      
      const validation = validateField(value, rules);
      
      if (!validation.isValid) {
        errors[field] = validation.errors;
        isValid = false;
      }
    });
    
    return {
      isValid,
      errors,
    };
  };
};

// Sanitize input
export const sanitizeInput = (input) => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove potential JavaScript
    .replace(/on\w+=/gi, ''); // Remove potential event handlers
};

// Validate and sanitize
export const validateAndSanitize = (value, rules) => {
  const sanitized = sanitizeInput(value);
  const validation = validateField(sanitized, rules);
  
  return {
    value: sanitized,
    ...validation,
  };
};