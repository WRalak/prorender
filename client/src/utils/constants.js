// Application constants

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    ME: '/auth/me',
  },
  USERS: {
    PROFILE: '/users/profile',
    PASSWORD: '/users/password',
    AVATAR: '/users/avatar',
    ACCOUNT: '/users/account',
    FAVORITES: '/users/favorites',
    SAVED_SEARCHES: '/users/saved-searches',
    NOTIFICATIONS: '/users/notifications',
  },
  PROPERTIES: {
    LIST: '/properties',
    DETAIL: '/properties/:id',
    CREATE: '/properties',
    UPDATE: '/properties/:id',
    DELETE: '/properties/:id',
    IMAGES: '/properties/:id/images',
    FEATURED: '/properties/featured',
    SIMILAR: '/properties/:id/similar',
    SEARCH: '/properties/search',
    FAVORITE: '/properties/:id/favorite',
    INQUIRY: '/properties/:id/inquiry',
    SCHEDULE_VIEWING: '/properties/:id/schedule-viewing',
  },
  APPLICATIONS: {
    LIST: '/applications',
    DETAIL: '/applications/:id',
    CREATE: '/applications',
    UPDATE: '/applications/:id',
    DELETE: '/applications/:id',
    DOCUMENTS: '/applications/:id/documents',
    WITHDRAW: '/applications/:id/withdraw',
  },
  CHAT: {
    CONVERSATIONS: '/chat/conversations',
    CONVERSATION: '/chat/conversations/:id',
    MESSAGES: '/chat/conversations/:id/messages',
    SEND_MESSAGE: '/chat/conversations/:id/messages',
    MESSAGE: '/chat/messages/:id',
    TYPING: '/chat/conversations/:id/typing',
    ONLINE_USERS: '/chat/users/online',
    UNREAD_COUNT: '/chat/unread-count',
  },
  PAYMENTS: {
    CREATE_INTENT: '/payments/create-payment-intent',
    CONFIRM: '/payments/confirm',
    METHODS: '/payments/methods',
    HISTORY: '/payments/history',
    RENTAL: '/payments/rental',
    SCHEDULE: '/payments/schedule',
    STATS: '/payments/stats',
    EXPORT: '/payments/export',
    BILLING_ADDRESS: '/payments/billing-address',
  },
  SUBSCRIPTIONS: {
    CREATE: '/subscriptions/create',
    LIST: '/subscriptions',
    DETAIL: '/subscriptions/:id',
    CANCEL: '/subscriptions/:id/cancel',
    PAUSE: '/subscriptions/:id/pause',
    RESUME: '/subscriptions/:id/resume',
    UPDATE: '/subscriptions/:id',
    PLANS: '/subscriptions/plans',
  },
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    PROPERTIES: '/admin/properties',
    APPLICATIONS: '/admin/applications',
    MODERATION: '/admin/moderation',
    REPORTS: '/admin/reports',
    SYSTEM: '/admin/system',
    NOTIFICATIONS: '/admin/notifications',
    EXPORT: '/admin/export',
  },
  MAINTENANCE: {
    LIST: '/maintenance',
    DETAIL: '/maintenance/:id',
    CREATE: '/maintenance',
    UPDATE: '/maintenance/:id',
    IMAGES: '/maintenance/:id/images',
    STATUS: '/maintenance/:id/status',
    RATE: '/maintenance/:id/rate',
  },
};

// User roles
export const USER_ROLES = {
  TENANT: 'tenant',
  AGENT: 'agent',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
};

// Property types
export const PROPERTY_TYPES = {
  APARTMENT: 'apartment',
  HOUSE: 'house',
  CONDO: 'condo',
  TOWNHOUSE: 'townhouse',
  STUDIO: 'studio',
  LOFT: 'loft',
  DUPLEX: 'duplex',
  VILLA: 'villa',
  COTTAGE: 'cottage',
  OTHER: 'other',
};

// Property status
export const PROPERTY_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  RENTED: 'rented',
  MAINTENANCE: 'maintenance',
};

// Application status
export const APPLICATION_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  PENDING_DOCUMENTS: 'pending_documents',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
  EXPIRED: 'expired',
};

// Lease status
export const LEASE_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  EXPIRED: 'expired',
  TERMINATED: 'terminated',
  RENEWED: 'renewed',
};

// Payment status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded',
};

// Maintenance status
export const MAINTENANCE_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  CANCELLED: 'cancelled',
};

// Notification types
export const NOTIFICATION_TYPES = {
  APPLICATION_SUBMITTED: 'application_submitted',
  APPLICATION_APPROVED: 'application_approved',
  APPLICATION_REJECTED: 'application_rejected',
  LEASE_SIGNED: 'lease_signed',
  PAYMENT_DUE: 'payment_due',
  PAYMENT_RECEIVED: 'payment_received',
  MAINTENANCE_REQUEST: 'maintenance_request',
  MAINTENANCE_UPDATED: 'maintenance_updated',
  MESSAGE_RECEIVED: 'message_received',
  PROPERTY_APPROVED: 'property_approved',
  PROPERTY_REJECTED: 'property_rejected',
  SYSTEM_ANNOUNCEMENT: 'system_announcement',
};

// Chat message types
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
  SYSTEM: 'system',
};

// File types
export const FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  SPREADSHEET: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  COMPRESSED: ['application/zip', 'application/x-rar-compressed'],
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1,
};

// Date formats
export const DATE_FORMATS = {
  SHORT: 'MMM d, yyyy',
  LONG: 'MMMM d, yyyy',
  TIME: 'h:mm a',
  DATETIME: 'MMM d, yyyy h:mm a',
  ISO: 'yyyy-MM-dd',
  US: 'MM/dd/yyyy',
};

// Currency formats
export const CURRENCY_FORMATS = {
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  JPY: 'ja-JP',
};

// Time zones
export const TIME_ZONES = {
  PST: 'America/Los_Angeles',
  MST: 'America/Denver',
  CST: 'America/Chicago',
  EST: 'America/New_York',
  GMT: 'Europe/London',
  CET: 'Europe/Paris',
  JST: 'Asia/Tokyo',
  AEST: 'Australia/Sydney',
};

// Device breakpoints
export const BREAKPOINTS = {
  XS: 0,
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
};

// Animation durations
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  EXTRA_SLOW: 1000,
};

// Toast types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Modal sizes
export const MODAL_SIZES = {
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl',
  FULL: 'full',
};

// Button variants
export const BUTTON_VARIANTS = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  OUTLINE: 'outline',
  GHOST: 'ghost',
  LINK: 'link',
  DANGER: 'danger',
};

// Input types
export const INPUT_TYPES = {
  TEXT: 'text',
  EMAIL: 'email',
  PASSWORD: 'password',
  NUMBER: 'number',
  TEL: 'tel',
  URL: 'url',
  DATE: 'date',
  TIME: 'time',
  DATETIME_LOCAL: 'datetime-local',
  FILE: 'file',
  HIDDEN: 'hidden',
  CHECKBOX: 'checkbox',
  RADIO: 'radio',
  SELECT: 'select',
  TEXTAREA: 'textarea',
};

// Form validation rules
export const VALIDATION_RULES = {
  REQUIRED: { required: true },
  EMAIL: { type: 'email' },
  PHONE: { type: 'phone' },
  URL: { type: 'url' },
  NUMBER: { type: 'number' },
  PASSWORD_MIN: { minLength: 8 },
  NAME_MIN: { minLength: 2 },
  NAME_MAX: { maxLength: 50 },
  DESCRIPTION_MIN: { minLength: 10 },
  DESCRIPTION_MAX: { maxLength: 1000 },
  ZIP_CODE: { pattern: /^\d{5}(-\d{4})?$/ },
};

// Search filters
export const SEARCH_FILTERS = {
  PRICE_RANGE: 'priceRange',
  BEDROOMS: 'bedrooms',
  BATHROOMS: 'bathrooms',
  PROPERTY_TYPE: 'propertyType',
  SQUARE_FEET: 'squareFeet',
  YEAR_BUILT: 'yearBuilt',
  AMENITIES: 'amenities',
  PETS_ALLOWED: 'petsAllowed',
  PARKING: 'parking',
  LAUNDRY: 'laundry',
  FURNISHED: 'furnished',
};

// Sort options
export const SORT_OPTIONS = {
  PRICE_LOW: 'price_low',
  PRICE_HIGH: 'price_high',
  NEWEST: 'newest',
  OLDEST: 'oldest',
  BEDROOMS_LOW: 'bedrooms_low',
  BEDROOMS_HIGH: 'bedrooms_high',
  SQUARE_FEET_LOW: 'square_feet_low',
  SQUARE_FEET_HIGH: 'square_feet_high',
  RELEVANCE: 'relevance',
};

// Map styles
export const MAP_STYLES = {
  STREETS: 'streets',
  OUTDOORS: 'outdoors',
  LIGHT: 'light',
  DARK: 'dark',
  SATELLITE: 'satellite',
  SATELLITE_STREETS: 'satellite_streets',
};

// Distance units
export const DISTANCE_UNITS = {
  MILES: 'miles',
  KILOMETERS: 'kilometers',
};

// Application steps
export const APPLICATION_STEPS = {
  PERSONAL_INFO: 'personal_info',
  EMPLOYMENT_INFO: 'employment_info',
  HOUSING_HISTORY: 'housing_history',
  REFERENCES: 'references',
  DOCUMENTS: 'documents',
  REVIEW: 'review',
  SUBMIT: 'submit',
};

// Document types
export const DOCUMENT_TYPES = {
  ID_PROOF: 'id_proof',
  INCOME_PROOF: 'income_proof',
  EMPLOYMENT_VERIFICATION: 'employment_verification',
  RENTAL_HISTORY: 'rental_history',
  BANK_STATEMENTS: 'bank_statements',
  CREDIT_REPORT: 'credit_report',
  OTHER: 'other',
};

// Subscription plans
export const SUBSCRIPTION_PLANS = {
  BASIC: 'basic',
  PROFESSIONAL: 'professional',
  ENTERPRISE: 'enterprise',
};

// Feature flags
export const FEATURE_FLAGS = {
  MULTI_LANGUAGE: 'multi_language',
  DARK_MODE: 'dark_mode',
  REAL_TIME_NOTIFICATIONS: 'real_time_notifications',
  ADVANCED_SEARCH: 'advanced_search',
  VIRTUAL_TOURS: 'virtual_tours',
  AI_RECOMMENDATIONS: 'ai_recommendations',
};

// Error codes
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  SERVER_ERROR: 'SERVER_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  REGISTER_SUCCESS: 'Registration successful',
  LOGOUT_SUCCESS: 'Logout successful',
  PROFILE_UPDATED: 'Profile updated successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  APPLICATION_SUBMITTED: 'Application submitted successfully',
  PROPERTY_CREATED: 'Property created successfully',
  PROPERTY_UPDATED: 'Property updated successfully',
  PROPERTY_DELETED: 'Property deleted successfully',
  MESSAGE_SENT: 'Message sent successfully',
  PAYMENT_PROCESSED: 'Payment processed successfully',
  MAINTENANCE_CREATED: 'Maintenance request created successfully',
  DOCUMENT_UPLOADED: 'Document uploaded successfully',
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  AUTHENTICATION_ERROR: 'Please login to continue.',
  AUTHORIZATION_ERROR: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  TIMEOUT_ERROR: 'Request timeout. Please try again.',
  UNKNOWN_ERROR: 'An unknown error occurred. Please try again.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  EMAIL_EXISTS: 'An account with this email already exists.',
  WEAK_PASSWORD: 'Password does not meet security requirements.',
  FILE_TOO_LARGE: 'File size exceeds maximum limit.',
  INVALID_FILE_TYPE: 'Invalid file type.',
  PAYMENT_FAILED: 'Payment failed. Please try again.',
  UPLOAD_FAILED: 'Upload failed. Please try again.',
};

// Loading messages
export const LOADING_MESSAGES = {
  AUTHENTICATING: 'Authenticating...',
  LOADING: 'Loading...',
  SAVING: 'Saving...',
  DELETING: 'Deleting...',
  UPLOADING: 'Uploading...',
  PROCESSING: 'Processing...',
  SEARCHING: 'Searching...',
  CONNECTING: 'Connecting...',
};

// Placeholder texts
export const PLACEHOLDERS = {
  SEARCH: 'Search properties, locations, or keywords...',
  EMAIL: 'Enter your email address',
  PASSWORD: 'Enter your password',
  FIRST_NAME: 'Enter your first name',
  LAST_NAME: 'Enter your last name',
  PHONE: 'Enter your phone number',
  ADDRESS: 'Enter your address',
  CITY: 'Enter your city',
  STATE: 'Enter your state',
  ZIP_CODE: 'Enter your ZIP code',
  MESSAGE: 'Type your message...',
  DESCRIPTION: 'Enter description...',
};

// Default images
export const DEFAULT_IMAGES = {
  PROPERTY: '/images/property-placeholder.jpg',
  USER: '/images/user-placeholder.png',
  COMPANY: '/images/company-placeholder.png',
};

// Social media URLs
export const SOCIAL_MEDIA_URLS = {
  FACEBOOK: 'https://facebook.com',
  TWITTER: 'https://twitter.com',
  INSTAGRAM: 'https://instagram.com',
  LINKEDIN: 'https://linkedin.com',
  YOUTUBE: 'https://youtube.com',
};

// Support information
export const SUPPORT_INFO = {
  EMAIL: 'support@prorender.com',
  PHONE: '+1 (555) 123-4567',
  HOURS: 'Monday - Friday, 9:00 AM - 6:00 PM EST',
  FAQ: '/faq',
  HELP_CENTER: '/help',
};

// Legal links
export const LEGAL_LINKS = {
  TERMS_OF_SERVICE: '/terms',
  PRIVACY_POLICY: '/privacy',
  COOKIE_POLICY: '/cookies',
  DISCLAIMER: '/disclaimer',
};

// App metadata
export const APP_META = {
  NAME: 'PropRent',
  VERSION: '1.0.0',
  DESCRIPTION: 'Professional property rental management platform',
  KEYWORDS: 'rental, property, real estate, apartments, houses',
  AUTHOR: 'PropRent Team',
};