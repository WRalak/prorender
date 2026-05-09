// Application constants shared between client and server

// User roles
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  AGENT: 'agent',
  TENANT: 'tenant',
  LANDLORD: 'landlord'
};

// Property status
export const PROPERTY_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  SUSPENDED: 'suspended'
};

// Application status
export const APPLICATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
  WITHDRAWN: 'withdrawn'
};

// Payment status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled'
};

// Maintenance request status
export const MAINTENANCE_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CANCELLED: 'cancelled'
};

// Subscription plans
export const SUBSCRIPTION_PLANS = {
  FREE: 'free',
  BASIC: 'basic',
  PREMIUM: 'premium',
  ENTERPRISE: 'enterprise'
};

// Property types
export const PROPERTY_TYPES = {
  APARTMENT: 'apartment',
  HOUSE: 'house',
  CONDO: 'condo',
  TOWNHOUSE: 'townhouse',
  STUDIO: 'studio',
  LOFT: 'loft',
  VILLA: 'villa'
};

// Lease types
export const LEASE_TYPES = {
  MONTH_TO_MONTH: 'month_to_month',
  FIXED_TERM: 'fixed_term',
  YEARLY: 'yearly'
};

// Notification types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  SYSTEM: 'system'
};

// File upload limits
export const FILE_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
};

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  API: 'yyyy-MM-dd',
  DATETIME: 'MMM dd, yyyy HH:mm'
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password'
  },
  USERS: {
    PROFILE: '/users/profile',
    UPDATE: '/users/update',
    DELETE: '/users/delete'
  },
  PROPERTIES: {
    LIST: '/properties',
    CREATE: '/properties',
    UPDATE: '/properties/:id',
    DELETE: '/properties/:id',
    DETAILS: '/properties/:id'
  },
  APPLICATIONS: {
    LIST: '/applications',
    CREATE: '/applications',
    UPDATE: '/applications/:id',
    DELETE: '/applications/:id'
  },
  PAYMENTS: {
    LIST: '/payments',
    CREATE: '/payments',
    WEBHOOK: '/payments/webhook'
  },
  MAINTENANCE: {
    LIST: '/maintenance',
    CREATE: '/maintenance',
    UPDATE: '/maintenance/:id'
  }
};

// Error messages
export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION: 'Please check your input and try again.',
  FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
  INVALID_FILE_TYPE: 'Invalid file type.',
  SERVER_ERROR: 'Server error. Please try again later.'
};

// Success messages
export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: 'Profile updated successfully',
  PROPERTY_CREATED: 'Property created successfully',
  PROPERTY_UPDATED: 'Property updated successfully',
  PROPERTY_DELETED: 'Property deleted successfully',
  APPLICATION_SUBMITTED: 'Application submitted successfully',
  PAYMENT_PROCESSED: 'Payment processed successfully',
  MAINTENANCE_CREATED: 'Maintenance request created successfully',
  PASSWORD_CHANGED: 'Password changed successfully'
};

// Regex patterns
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-\(\)]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  SLUG: /^[a-z0-9-]+$/
};

// Environment variables (client-safe)
export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  API_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  UPLOAD_URL: process.env.REACT_APP_UPLOAD_URL || 'http://localhost:5000/uploads'
};