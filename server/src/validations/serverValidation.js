const { logger } = require('../config/logger');
const ServerHelpers = require('../utils/helpers');

class ServerValidation {
  // User validation
  static validateUserRegistration(data) {
    const errors = [];

    // First name validation
    if (!data.firstName) {
      errors.push('First name is required');
    } else if (typeof data.firstName !== 'string' || data.firstName.trim().length < 2) {
      errors.push('First name must be at least 2 characters long');
    } else if (!/^[a-zA-Z\s]+$/.test(data.firstName)) {
      errors.push('First name can only contain letters and spaces');
    }

    // Last name validation
    if (!data.lastName) {
      errors.push('Last name is required');
    } else if (typeof data.lastName !== 'string' || data.lastName.trim().length < 2) {
      errors.push('Last name must be at least 2 characters long');
    } else if (!/^[a-zA-Z\s]+$/.test(data.lastName)) {
      errors.push('Last name can only contain letters and spaces');
    }

    // Email validation
    if (!data.email) {
      errors.push('Email is required');
    } else if (!ServerHelpers.isValidEmail(data.email)) {
      errors.push('Invalid email format');
    }

    // Password validation
    if (!data.password) {
      errors.push('Password is required');
    } else {
      if (typeof data.password !== 'string' || data.password.length < 8) {
        errors.push('Password must be at least 8 characters long');
      }
      if (!/(?=.*[a-z])/.test(data.password)) {
        errors.push('Password must contain at least one lowercase letter');
      }
      if (!/(?=.*[A-Z])/.test(data.password)) {
        errors.push('Password must contain at least one uppercase letter');
      }
      if (!/(?=.*\d)/.test(data.password)) {
        errors.push('Password must contain at least one number');
      }
      if (!/(?=.*[@$!%*?&])/.test(data.password)) {
        errors.push('Password must contain at least one special character');
      }
    }

    // Role validation
    if (!data.role) {
      errors.push('Role is required');
    } else if (!['super_admin', 'admin', 'agent', 'tenant', 'landlord'].includes(data.role)) {
      errors.push('Invalid role specified');
    }

    // Phone validation (optional)
    if (data.phone && !ServerHelpers.isValidPhone(data.phone)) {
      errors.push('Invalid phone number format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateUserLogin(data) {
    const errors = [];

    if (!data.email) {
      errors.push('Email is required');
    } else if (!ServerHelpers.isValidEmail(data.email)) {
      errors.push('Invalid email format');
    }

    if (!data.password) {
      errors.push('Password is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateUserUpdate(data) {
    const errors = [];

    // First name validation (optional)
    if (data.firstName !== undefined) {
      if (typeof data.firstName !== 'string' || data.firstName.trim().length < 2) {
        errors.push('First name must be at least 2 characters long');
      } else if (!/^[a-zA-Z\s]+$/.test(data.firstName)) {
        errors.push('First name can only contain letters and spaces');
      }
    }

    // Last name validation (optional)
    if (data.lastName !== undefined) {
      if (typeof data.lastName !== 'string' || data.lastName.trim().length < 2) {
        errors.push('Last name must be at least 2 characters long');
      } else if (!/^[a-zA-Z\s]+$/.test(data.lastName)) {
        errors.push('Last name can only contain letters and spaces');
      }
    }

    // Phone validation (optional)
    if (data.phone !== undefined && data.phone && !ServerHelpers.isValidPhone(data.phone)) {
      errors.push('Invalid phone number format');
    }

    // Bio validation (optional)
    if (data.bio !== undefined && data.bio && typeof data.bio !== 'string') {
      errors.push('Bio must be a string');
    } else if (data.bio && data.bio.length > 500) {
      errors.push('Bio must be less than 500 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validatePasswordChange(data) {
    const errors = [];

    if (!data.currentPassword) {
      errors.push('Current password is required');
    }

    if (!data.newPassword) {
      errors.push('New password is required');
    } else {
      if (typeof data.newPassword !== 'string' || data.newPassword.length < 8) {
        errors.push('New password must be at least 8 characters long');
      }
      if (!/(?=.*[a-z])/.test(data.newPassword)) {
        errors.push('New password must contain at least one lowercase letter');
      }
      if (!/(?=.*[A-Z])/.test(data.newPassword)) {
        errors.push('New password must contain at least one uppercase letter');
      }
      if (!/(?=.*\d)/.test(data.newPassword)) {
        errors.push('New password must contain at least one number');
      }
      if (!/(?=.*[@$!%*?&])/.test(data.newPassword)) {
        errors.push('New password must contain at least one special character');
      }
    }

    if (!data.confirmPassword) {
      errors.push('Password confirmation is required');
    } else if (data.newPassword !== data.confirmPassword) {
      errors.push('Passwords do not match');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Property validation
  static validatePropertyCreate(data) {
    const errors = [];

    // Title validation
    if (!data.title) {
      errors.push('Property title is required');
    } else if (typeof data.title !== 'string' || data.title.trim().length < 5) {
      errors.push('Title must be at least 5 characters long');
    } else if (data.title.length > 100) {
      errors.push('Title must be less than 100 characters');
    }

    // Description validation
    if (!data.description) {
      errors.push('Property description is required');
    } else if (typeof data.description !== 'string' || data.description.trim().length < 20) {
      errors.push('Description must be at least 20 characters long');
    } else if (data.description.length > 2000) {
      errors.push('Description must be less than 2000 characters');
    }

    // Type validation
    if (!data.type) {
      errors.push('Property type is required');
    } else if (!['apartment', 'house', 'condo', 'townhouse', 'studio', 'loft', 'villa'].includes(data.type)) {
      errors.push('Invalid property type');
    }

    // Address validation
    if (!data.address) {
      errors.push('Address is required');
    } else {
      if (!data.address.street || typeof data.address.street !== 'string' || data.address.street.trim().length < 5) {
        errors.push('Street address is required and must be at least 5 characters');
      }
      if (!data.address.city || typeof data.address.city !== 'string' || data.address.city.trim().length < 2) {
        errors.push('City is required and must be at least 2 characters');
      }
      if (!data.address.state || typeof data.address.state !== 'string' || data.address.state.trim().length < 2) {
        errors.push('State is required and must be at least 2 characters');
      }
      if (!data.address.zipCode || !/^\d{5}(-\d{4})?$/.test(data.address.zipCode)) {
        errors.push('Valid ZIP code is required');
      }
      if (!data.address.country || typeof data.address.country !== 'string' || data.address.country.trim().length < 2) {
        errors.push('Country is required and must be at least 2 characters');
      }
    }

    // Price validation
    if (data.price === undefined || data.price === null) {
      errors.push('Price is required');
    } else if (typeof data.price !== 'number' || data.price < 0) {
      errors.push('Price must be a positive number');
    } else if (data.price > 1000000) {
      errors.push('Price cannot exceed $1,000,000');
    }

    // Bedrooms validation
    if (data.bedrooms === undefined || data.bedrooms === null) {
      errors.push('Number of bedrooms is required');
    } else if (typeof data.bedrooms !== 'number' || data.bedrooms < 0 || data.bedrooms > 20) {
      errors.push('Bedrooms must be a number between 0 and 20');
    }

    // Bathrooms validation
    if (data.bathrooms === undefined || data.bathrooms === null) {
      errors.push('Number of bathrooms is required');
    } else if (typeof data.bathrooms !== 'number' || data.bathrooms < 0 || data.bathrooms > 20) {
      errors.push('Bathrooms must be a number between 0 and 20');
    }

    // Square footage validation
    if (data.squareFootage === undefined || data.squareFootage === null) {
      errors.push('Square footage is required');
    } else if (typeof data.squareFootage !== 'number' || data.squareFootage < 100 || data.squareFootage > 10000) {
      errors.push('Square footage must be between 100 and 10,000');
    }

    // Availability date validation
    if (!data.availabilityDate) {
      errors.push('Availability date is required');
    } else if (!(data.availabilityDate instanceof Date) && isNaN(Date.parse(data.availabilityDate))) {
      errors.push('Valid availability date is required');
    } else if (new Date(data.availabilityDate) < new Date()) {
      errors.push('Availability date cannot be in the past');
    }

    // Lease terms validation
    if (!data.leaseTerms) {
      errors.push('Lease terms are required');
    } else if (!['month_to_month', 'fixed_term', 'yearly'].includes(data.leaseTerms)) {
      errors.push('Invalid lease terms');
    }

    // Images validation (optional)
    if (data.images && Array.isArray(data.images)) {
      if (data.images.length > 10) {
        errors.push('Cannot have more than 10 images');
      }
      for (const image of data.images) {
        if (typeof image !== 'string' || !ServerHelpers.isValidUrl(image)) {
          errors.push('All images must be valid URLs');
        }
      }
    }

    // Amenities validation (optional)
    if (data.amenities && Array.isArray(data.amenities)) {
      for (const amenity of data.amenities) {
        if (typeof amenity !== 'string' || amenity.length > 50) {
          errors.push('All amenities must be strings less than 50 characters');
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Application validation
  static validateApplicationCreate(data) {
    const errors = [];

    // Property ID validation
    if (!data.propertyId) {
      errors.push('Property ID is required');
    } else if (!ServerHelpers.isValidObjectId(data.propertyId)) {
      errors.push('Invalid property ID format');
    }

    // Message validation
    if (!data.message) {
      errors.push('Message is required');
    } else if (typeof data.message !== 'string' || data.message.trim().length < 10) {
      errors.push('Message must be at least 10 characters long');
    } else if (data.message.length > 1000) {
      errors.push('Message must be less than 1000 characters');
    }

    // Move-in date validation
    if (!data.proposedMoveInDate) {
      errors.push('Proposed move-in date is required');
    } else if (!(data.proposedMoveInDate instanceof Date) && isNaN(Date.parse(data.proposedMoveInDate))) {
      errors.push('Valid move-in date is required');
    } else if (new Date(data.proposedMoveInDate) <= new Date()) {
      errors.push('Move-in date must be in the future');
    }

    // Lease duration validation
    if (data.proposedLeaseDuration === undefined || data.proposedLeaseDuration === null) {
      errors.push('Proposed lease duration is required');
    } else if (typeof data.proposedLeaseDuration !== 'number' || data.proposedLeaseDuration < 1 || data.proposedLeaseDuration > 36) {
      errors.push('Lease duration must be between 1 and 36 months');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Payment validation
  static validatePaymentCreate(data) {
    const errors = [];

    // Application ID validation
    if (!data.applicationId) {
      errors.push('Application ID is required');
    } else if (!ServerHelpers.isValidObjectId(data.applicationId)) {
      errors.push('Invalid application ID format');
    }

    // Amount validation
    if (data.amount === undefined || data.amount === null) {
      errors.push('Payment amount is required');
    } else if (typeof data.amount !== 'number' || data.amount <= 0) {
      errors.push('Payment amount must be a positive number');
    } else if (data.amount > 10000) {
      errors.push('Payment amount cannot exceed $10,000');
    }

    // Type validation
    if (!data.type) {
      errors.push('Payment type is required');
    } else if (!['deposit', 'rent', 'fee', 'other'].includes(data.type)) {
      errors.push('Invalid payment type');
    }

    // Description validation
    if (!data.description) {
      errors.push('Payment description is required');
    } else if (typeof data.description !== 'string' || data.description.trim().length < 3) {
      errors.push('Description must be at least 3 characters long');
    } else if (data.description.length > 200) {
      errors.push('Description must be less than 200 characters');
    }

    // Payment method validation
    if (!data.paymentMethod) {
      errors.push('Payment method is required');
    } else if (!['credit_card', 'debit_card', 'bank_transfer', 'check', 'cash'].includes(data.paymentMethod)) {
      errors.push('Invalid payment method');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Maintenance request validation
  static validateMaintenanceCreate(data) {
    const errors = [];

    // Property ID validation
    if (!data.propertyId) {
      errors.push('Property ID is required');
    } else if (!ServerHelpers.isValidObjectId(data.propertyId)) {
      errors.push('Invalid property ID format');
    }

    // Title validation
    if (!data.title) {
      errors.push('Maintenance request title is required');
    } else if (typeof data.title !== 'string' || data.title.trim().length < 5) {
      errors.push('Title must be at least 5 characters long');
    } else if (data.title.length > 100) {
      errors.push('Title must be less than 100 characters');
    }

    // Description validation
    if (!data.description) {
      errors.push('Description is required');
    } else if (typeof data.description !== 'string' || data.description.trim().length < 10) {
      errors.push('Description must be at least 10 characters long');
    } else if (data.description.length > 1000) {
      errors.push('Description must be less than 1000 characters');
    }

    // Priority validation
    if (!data.priority) {
      errors.push('Priority level is required');
    } else if (!['low', 'medium', 'high', 'urgent'].includes(data.priority)) {
      errors.push('Invalid priority level');
    }

    // Category validation
    if (!data.category) {
      errors.push('Category is required');
    } else if (!['plumbing', 'electrical', 'hvac', 'appliance', 'structural', 'pest', 'other'].includes(data.category)) {
      errors.push('Invalid category');
    }

    // Images validation (optional)
    if (data.images && Array.isArray(data.images)) {
      if (data.images.length > 5) {
        errors.push('Cannot have more than 5 images');
      }
      for (const image of data.images) {
        if (typeof image !== 'string' || !ServerHelpers.isValidUrl(image)) {
          errors.push('All images must be valid URLs');
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Message validation
  static validateMessageSend(data) {
    const errors = [];

    // Receiver ID validation
    if (!data.receiverId) {
      errors.push('Receiver ID is required');
    } else if (!ServerHelpers.isValidObjectId(data.receiverId)) {
      errors.push('Invalid receiver ID format');
    }

    // Content validation
    if (!data.content) {
      errors.push('Message content is required');
    } else if (typeof data.content !== 'string' || data.content.trim().length < 1) {
      errors.push('Message content cannot be empty');
    } else if (data.content.length > 1000) {
      errors.push('Message must be less than 1000 characters');
    }

    // Property ID validation (optional)
    if (data.propertyId && !ServerHelpers.isValidObjectId(data.propertyId)) {
      errors.push('Invalid property ID format');
    }

    // Application ID validation (optional)
    if (data.applicationId && !ServerHelpers.isValidObjectId(data.applicationId)) {
      errors.push('Invalid application ID format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Search validation
  static validatePropertySearch(query) {
    const errors = [];

    // Query validation (optional)
    if (query.query !== undefined && typeof query.query !== 'string') {
      errors.push('Search query must be a string');
    } else if (query.query && query.query.length > 100) {
      errors.push('Search query must be less than 100 characters');
    }

    // Type validation (optional)
    if (query.type !== undefined) {
      if (!Array.isArray(query.type)) {
        errors.push('Property type must be an array');
      } else {
        const validTypes = ['apartment', 'house', 'condo', 'townhouse', 'studio', 'loft', 'villa'];
        for (const type of query.type) {
          if (!validTypes.includes(type)) {
            errors.push(`Invalid property type: ${type}`);
          }
        }
      }
    }

    // Price range validation (optional)
    if (query.priceMin !== undefined) {
      if (typeof query.priceMin !== 'number' || query.priceMin < 0) {
        errors.push('Minimum price must be a positive number');
      }
    }

    if (query.priceMax !== undefined) {
      if (typeof query.priceMax !== 'number' || query.priceMax < 0) {
        errors.push('Maximum price must be a positive number');
      }
    }

    if (query.priceMin !== undefined && query.priceMax !== undefined && query.priceMin > query.priceMax) {
      errors.push('Minimum price cannot be greater than maximum price');
    }

    // Bedrooms validation (optional)
    if (query.bedrooms !== undefined) {
      if (typeof query.bedrooms !== 'number' || query.bedrooms < 0 || query.bedrooms > 20) {
        errors.push('Bedrooms must be a number between 0 and 20');
      }
    }

    // Bathrooms validation (optional)
    if (query.bathrooms !== undefined) {
      if (typeof query.bathrooms !== 'number' || query.bathrooms < 0 || query.bathrooms > 20) {
        errors.push('Bathrooms must be a number between 0 and 20');
      }
    }

    // Location validation (optional)
    if (query.city !== undefined && (typeof query.city !== 'string' || query.city.length > 50)) {
      errors.push('City must be a string less than 50 characters');
    }

    if (query.state !== undefined && (typeof query.state !== 'string' || query.state.length > 50)) {
      errors.push('State must be a string less than 50 characters');
    }

    if (query.zipCode !== undefined && !/^\d{5}(-\d{4})?$/.test(query.zipCode)) {
      errors.push('Invalid ZIP code format');
    }

    // Pagination validation
    const pagination = ServerHelpers.validatePaginationParams(query.page, query.limit);
    if (pagination.page !== parseInt(query.page) || pagination.limit !== parseInt(query.limit)) {
      errors.push('Invalid pagination parameters');
    }

    // Sort validation (optional)
    if (query.sortBy !== undefined) {
      const validSortFields = ['price', 'date', 'bedrooms', 'squareFootage'];
      if (!validSortFields.includes(query.sortBy)) {
        errors.push('Invalid sort field');
      }
    }

    if (query.sortOrder !== undefined && !['asc', 'desc'].includes(query.sortOrder)) {
      errors.push('Sort order must be either asc or desc');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // File upload validation
  static validateFileUpload(file, allowedTypes = [], maxSize = 10 * 1024 * 1024) {
    const errors = [];

    if (!file) {
      errors.push('No file provided');
      return { isValid: false, errors };
    }

    // File size validation
    if (file.size > maxSize) {
      errors.push(`File size cannot exceed ${ServerHelpers.formatFileSize(maxSize)}`);
    }

    // File type validation
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
      errors.push(`File type ${file.mimetype} is not allowed`);
    }

    // Filename validation
    if (!file.originalname || typeof file.originalname !== 'string') {
      errors.push('Invalid filename');
    } else if (file.originalname.length > 255) {
      errors.push('Filename is too long');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Pagination validation
  static validatePagination(page, limit) {
    const errors = [];

    const pagination = ServerHelpers.validatePaginationParams(page, limit);

    if (pagination.page < 1) {
      errors.push('Page must be greater than 0');
    }

    if (pagination.limit < 1 || pagination.limit > 100) {
      errors.push('Limit must be between 1 and 100');
    }

    return {
      isValid: errors.length === 0,
      errors,
      pagination
    };
  }

  // ID validation
  static validateObjectId(id, fieldName = 'ID') {
    const errors = [];

    if (!id) {
      errors.push(`${fieldName} is required`);
    } else if (!ServerHelpers.isValidObjectId(id)) {
      errors.push(`Invalid ${fieldName} format`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Email validation
  static validateEmail(email) {
    const errors = [];

    if (!email) {
      errors.push('Email is required');
    } else if (!ServerHelpers.isValidEmail(email)) {
      errors.push('Invalid email format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Phone validation
  static validatePhone(phone) {
    const errors = [];

    if (phone && !ServerHelpers.isValidPhone(phone)) {
      errors.push('Invalid phone number format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // URL validation
  static validateUrl(url, fieldName = 'URL') {
    const errors = [];

    if (url && !ServerHelpers.isValidUrl(url)) {
      errors.push(`Invalid ${fieldName} format`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Date validation
  static validateDate(date, fieldName = 'Date', allowPast = true, allowFuture = true) {
    const errors = [];

    if (!date) {
      errors.push(`${fieldName} is required`);
    } else if (!(date instanceof Date) && isNaN(Date.parse(date))) {
      errors.push(`Invalid ${fieldName} format`);
    } else {
      const dateObj = new Date(date);
      if (!allowPast && dateObj < new Date()) {
        errors.push(`${fieldName} cannot be in the past`);
      }
      if (!allowFuture && dateObj > new Date()) {
        errors.push(`${fieldName} cannot be in the future`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Number range validation
  static validateNumberRange(value, fieldName, min = null, max = null) {
    const errors = [];

    if (value === undefined || value === null) {
      errors.push(`${fieldName} is required`);
    } else if (typeof value !== 'number') {
      errors.push(`${fieldName} must be a number`);
    } else {
      if (min !== null && value < min) {
        errors.push(`${fieldName} must be at least ${min}`);
      }
      if (max !== null && value > max) {
        errors.push(`${fieldName} cannot exceed ${max}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // String length validation
  static validateStringLength(value, fieldName, minLength = null, maxLength = null) {
    const errors = [];

    if (value === undefined || value === null) {
      errors.push(`${fieldName} is required`);
    } else if (typeof value !== 'string') {
      errors.push(`${fieldName} must be a string`);
    } else {
      if (minLength !== null && value.length < minLength) {
        errors.push(`${fieldName} must be at least ${minLength} characters long`);
      }
      if (maxLength !== null && value.length > maxLength) {
        errors.push(`${fieldName} cannot exceed ${maxLength} characters`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Array validation
  static validateArray(value, fieldName, minItems = null, maxItems = null) {
    const errors = [];

    if (value === undefined || value === null) {
      errors.push(`${fieldName} is required`);
    } else if (!Array.isArray(value)) {
      errors.push(`${fieldName} must be an array`);
    } else {
      if (minItems !== null && value.length < minItems) {
        errors.push(`${fieldName} must have at least ${minItems} items`);
      }
      if (maxItems !== null && value.length > maxItems) {
        errors.push(`${fieldName} cannot have more than ${maxItems} items`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Enum validation
  static validateEnum(value, fieldName, allowedValues) {
    const errors = [];

    if (value === undefined || value === null) {
      errors.push(`${fieldName} is required`);
    } else if (!allowedValues.includes(value)) {
      errors.push(`Invalid ${fieldName}. Must be one of: ${allowedValues.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Regex pattern validation
  static validatePattern(value, fieldName, pattern, errorMessage = null) {
    const errors = [];

    if (value === undefined || value === null) {
      errors.push(`${fieldName} is required`);
    } else if (typeof value !== 'string') {
      errors.push(`${fieldName} must be a string`);
    } else if (!pattern.test(value)) {
      errors.push(errorMessage || `${fieldName} format is invalid`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Custom validation - combine multiple validations
  static validateCustom(data, validations) {
    const allErrors = [];

    for (const validation of validations) {
      const result = validation(data);
      if (!result.isValid) {
        allErrors.push(...result.errors);
      }
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors
    };
  }

  // Sanitize and validate input
  static sanitizeAndValidate(data, schema) {
    const sanitized = ServerHelpers.sanitizeQueryParams(data);
    const validation = this.validateCustom(sanitized, schema);
    
    return {
      sanitized,
      validation
    };
  }
}

module.exports = ServerValidation;
