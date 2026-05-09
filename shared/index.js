// Main entry point for shared modules
// Export all shared constants, utilities, types, and validation schemas

// Constants
export * from './constants.js';

// Validation schemas
export * from './validationSchemas.js';

// Utilities
export * from './utils.js';

// Types and interfaces
export * from './types.js';

// Re-export commonly used items for convenience
export {
  // User-related
  USER_ROLES,
  PROPERTY_STATUS,
  APPLICATION_STATUS,
  PAYMENT_STATUS,
  MAINTENANCE_STATUS,
  SUBSCRIPTION_PLANS,
  
  // Property-related
  PROPERTY_TYPES,
  LEASE_TYPES,
  
  // System
  NOTIFICATION_TYPES,
  FILE_LIMITS,
  PAGINATION,
  DATE_FORMATS,
  API_ENDPOINTS,
  
  // Messages
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  
  // Patterns
  REGEX_PATTERNS,
  ENV
} from './constants.js';

export {
  userValidationSchemas,
  propertyValidationSchemas,
  applicationValidationSchemas,
  paymentValidationSchemas,
  maintenanceValidationSchemas,
  messageValidationSchemas,
  searchValidationSchemas,
  validateEmail,
  validatePhone,
  validatePassword,
  validateUsername,
  validateSlug,
  customValidations
} from './validationSchemas.js';

export {
  dateUtils,
  stringUtils,
  numberUtils,
  arrayUtils,
  objectUtils,
  fileUtils,
  urlUtils,
  colorUtils,
  validationUtils
} from './utils.js';

export {
  Interfaces,
  Types,
  UserInterface,
  PropertyInterface,
  ApplicationInterface,
  PaymentInterface,
  MaintenanceInterface,
  MessageInterface,
  NotificationInterface,
  SubscriptionInterface,
  AuditLogInterface,
  ApiResponseInterface,
  PaginationInterface,
  FilterOptionsInterface,
  FileUploadInterface,
  SearchResultInterface,
  WebSocketMessageInterface,
  ErrorInterface
} from './types.js';
