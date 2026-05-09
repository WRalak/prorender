// Type definitions and interfaces shared between client and server

// Base user types
export const UserTypes = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  AGENT: 'agent',
  TENANT: 'tenant',
  LANDLORD: 'landlord'
};

// User interface definition
export const UserInterface = {
  _id: 'string',
  firstName: 'string',
  lastName: 'string',
  email: 'string',
  password: 'string (hashed)',
  role: 'UserTypes',
  phone: 'string (optional)',
  avatar: 'string (URL, optional)',
  bio: 'string (optional)',
  verified: 'boolean',
  status: 'active | inactive | suspended',
  subscription: {
    plan: 'free | basic | premium | enterprise',
    startDate: 'Date',
    endDate: 'Date',
    autoRenew: 'boolean'
  },
  preferences: {
    notifications: 'boolean',
    emailAlerts: 'boolean',
    smsAlerts: 'boolean',
    language: 'string',
    timezone: 'string'
  },
  createdAt: 'Date',
  updatedAt: 'Date',
  lastLoginAt: 'Date (optional)'
};

// Property interface
export const PropertyInterface = {
  _id: 'string',
  title: 'string',
  description: 'string',
  type: 'apartment | house | condo | townhouse | studio | loft | villa',
  address: {
    street: 'string',
    city: 'string',
    state: 'string',
    zipCode: 'string',
    country: 'string',
    coordinates: {
      lat: 'number',
      lng: 'number'
    }
  },
  price: 'number',
  bedrooms: 'number',
  bathrooms: 'number',
  squareFootage: 'number',
  amenities: 'string[]',
  images: 'string[] (URLs)',
  documents: [{
    fileName: 'string',
    fileUrl: 'string',
    fileType: 'string',
    uploadDate: 'Date'
  }],
  status: 'active | inactive | pending | suspended',
  availabilityDate: 'Date',
  leaseTerms: 'month_to_month | fixed_term | yearly',
  depositRequired: 'boolean',
  depositAmount: 'number (optional)',
  owner: 'string (User ID)',
  createdAt: 'Date',
  updatedAt: 'Date'
};

// Application interface
export const ApplicationInterface = {
  _id: 'string',
  property: 'string (Property ID)',
  applicant: 'string (User ID)',
  message: 'string',
  status: 'pending | approved | rejected | expired | withdrawn',
  proposedMoveInDate: 'Date',
  proposedLeaseDuration: 'number (months)',
  documents: [{
    fileName: 'string',
    fileUrl: 'string',
    fileType: 'string',
    uploadDate: 'Date'
  }],
  backgroundCheck: {
    status: 'pending | passed | failed',
    completedAt: 'Date (optional)',
    reportUrl: 'string (optional)'
  },
  creditCheck: {
    status: 'pending | passed | failed',
    score: 'number (optional)',
    completedAt: 'Date (optional)',
    reportUrl: 'string (optional)'
  },
  references: [{
    name: 'string',
    email: 'string',
    phone: 'string',
    relationship: 'string'
  }],
  adminMessage: 'string (optional)',
  reviewedBy: 'string (User ID, optional)',
  reviewedAt: 'Date (optional)',
  createdAt: 'Date',
  updatedAt: 'Date'
};

// Payment interface
export const PaymentInterface = {
  _id: 'string',
  application: 'string (Application ID)',
  payer: 'string (User ID)',
  amount: 'number',
  type: 'deposit | rent | fee | other',
  description: 'string',
  status: 'pending | completed | failed | refunded | cancelled',
  paymentMethod: 'credit_card | debit_card | bank_transfer | check | cash',
  transactionId: 'string (optional)',
  stripePaymentIntentId: 'string (optional)',
  dueDate: 'Date',
  paidDate: 'Date (optional)',
  refundedAmount: 'number (optional)',
  refundDate: 'Date (optional)',
  notes: 'string (optional)',
  createdAt: 'Date',
  updatedAt: 'Date'
};

// Maintenance request interface
export const MaintenanceInterface = {
  _id: 'string',
  property: 'string (Property ID)',
  tenant: 'string (User ID)',
  title: 'string',
  description: 'string',
  priority: 'low | medium | high | urgent',
  category: 'plumbing | electrical | hvac | appliance | structural | pest | other',
  status: 'pending | in_progress | resolved | cancelled',
  images: 'string[] (URLs)',
  assignedTo: 'string (User ID, optional)',
  estimatedCost: 'number (optional)',
  actualCost: 'number (optional)',
  scheduledDate: 'Date (optional)',
  completedDate: 'Date (optional)',
  adminNotes: 'string (optional)',
  tenantNotes: 'string (optional)',
  createdAt: 'Date',
  updatedAt: 'Date'
};

// Message interface
export const MessageInterface = {
  _id: 'string',
  sender: 'string (User ID)',
  receiver: 'string (User ID)',
  content: 'string',
  property: 'string (Property ID, optional)',
  application: 'string (Application ID, optional)',
  status: 'sent | delivered | read',
  attachments: [{
    fileName: 'string',
    fileUrl: 'string',
    fileType: 'string'
  }],
  readAt: 'Date (optional)',
  createdAt: 'Date',
  updatedAt: 'Date'
};

// Notification interface
export const NotificationInterface = {
  _id: 'string',
  user: 'string (User ID)',
  type: 'info | success | warning | error | system',
  title: 'string',
  message: 'string',
  data: 'object (optional)',
  read: 'boolean',
  readAt: 'Date (optional)',
  createdAt: 'Date',
  updatedAt: 'Date'
};

// Subscription interface
export const SubscriptionInterface = {
  _id: 'string',
  user: 'string (User ID)',
  plan: 'free | basic | premium | enterprise',
  status: 'active | inactive | cancelled | expired',
  startDate: 'Date',
  endDate: 'Date',
  autoRenew: 'boolean',
  paymentMethod: 'string',
  lastPaymentDate: 'Date (optional)',
  nextBillingDate: 'Date (optional)',
  cancellationDate: 'Date (optional)',
  cancellationReason: 'string (optional)',
  features: 'string[]',
  limits: {
    maxProperties: 'number',
    maxApplications: 'number',
    maxStorage: 'number (bytes)',
    prioritySupport: 'boolean'
  },
  createdAt: 'Date',
  updatedAt: 'Date'
};

// Audit log interface
export const AuditLogInterface = {
  _id: 'string',
  user: 'string (User ID)',
  action: 'string',
  resource: 'string',
  resourceId: 'string (optional)',
  details: 'object (optional)',
  ipAddress: 'string',
  userAgent: 'string',
  timestamp: 'Date'
};

// API Response types
export const ApiResponseTypes = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Standard API response interface
export const ApiResponseInterface = {
  success: 'boolean',
  message: 'string',
  data: 'any (optional)',
  error: 'string (optional)',
  errors: 'string[] (optional)',
  meta: {
    page: 'number (optional)',
    limit: 'number (optional)',
    total: 'number (optional)',
    totalPages: 'number (optional)'
  }
};

// Pagination interface
export const PaginationInterface = {
  page: 'number',
  limit: 'number',
  total: 'number',
  totalPages: 'number',
  hasNext: 'boolean',
  hasPrev: 'boolean'
};

// Filter options interface
export const FilterOptionsInterface = {
  search: 'string (optional)',
  status: 'string[] (optional)',
  type: 'string[] (optional)',
  dateRange: {
    start: 'Date',
    end: 'Date'
  },
  priceRange: {
    min: 'number',
    max: 'number'
  },
  sortBy: 'string',
  sortOrder: 'asc | desc',
  page: 'number',
  limit: 'number'
};

// File upload interface
export const FileUploadInterface = {
  fileName: 'string',
  originalName: 'string',
  mimeType: 'string',
  size: 'number',
  url: 'string',
  path: 'string',
  uploadedBy: 'string (User ID)',
  uploadedAt: 'Date'
};

// Search result interface
export const SearchResultInterface = {
  items: 'any[]',
  total: 'number',
  page: 'number',
  limit: 'number',
  facets: {
    types: 'object',
    statuses: 'object',
    priceRanges: 'object'
  }
};

// WebSocket message types
export const WebSocketMessageTypes = {
  CHAT_MESSAGE: 'chat_message',
  TYPING_INDICATOR: 'typing_indicator',
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',
  NOTIFICATION: 'notification',
  PROPERTY_UPDATE: 'property_update',
  APPLICATION_UPDATE: 'application_update',
  PAYMENT_UPDATE: 'payment_update'
};

// WebSocket message interface
export const WebSocketMessageInterface = {
  type: 'WebSocketMessageTypes',
  data: 'any',
  sender: 'string (User ID)',
  receiver: 'string (User ID, optional)',
  room: 'string (optional)',
  timestamp: 'Date'
};

// Error types
export const ErrorTypes = {
  VALIDATION_ERROR: 'ValidationError',
  AUTHENTICATION_ERROR: 'AuthenticationError',
  AUTHORIZATION_ERROR: 'AuthorizationError',
  NOT_FOUND_ERROR: 'NotFoundError',
  DUPLICATE_ERROR: 'DuplicateError',
  RATE_LIMIT_ERROR: 'RateLimitError',
  PAYMENT_ERROR: 'PaymentError',
  FILE_ERROR: 'FileError',
  DATABASE_ERROR: 'DatabaseError',
  EXTERNAL_SERVICE_ERROR: 'ExternalServiceError'
};

// Error interface
export const ErrorInterface = {
  name: 'ErrorTypes',
  message: 'string',
  code: 'string (optional)',
  statusCode: 'number',
  details: 'any (optional)',
  stack: 'string (development only)',
  timestamp: 'Date'
};

// Export all interfaces as a collection
export const Interfaces = {
  User: UserInterface,
  Property: PropertyInterface,
  Application: ApplicationInterface,
  Payment: PaymentInterface,
  Maintenance: MaintenanceInterface,
  Message: MessageInterface,
  Notification: NotificationInterface,
  Subscription: SubscriptionInterface,
  AuditLog: AuditLogInterface,
  ApiResponse: ApiResponseInterface,
  Pagination: PaginationInterface,
  FilterOptions: FilterOptionsInterface,
  FileUpload: FileUploadInterface,
  SearchResult: SearchResultInterface,
  WebSocketMessage: WebSocketMessageInterface,
  Error: ErrorInterface
};

// Export all types as a collection
export const Types = {
  User: UserTypes,
  ApiResponse: ApiResponseTypes,
  WebSocketMessage: WebSocketMessageTypes,
  Error: ErrorTypes
};
