// API Endpoints Configuration
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    VERIFY_EMAIL: '/api/auth/verify-email',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    REFRESH_TOKEN: '/api/auth/refresh-token',
  },
  
  // Properties
  PROPERTIES: {
    LIST: '/api/properties',
    CREATE: '/api/properties',
    UPDATE: '/api/properties/:id',
    DELETE: '/api/properties/:id',
    SEARCH: '/api/properties/search',
    FEATURED: '/api/properties/featured',
  },
  
  // Applications
  APPLICATIONS: {
    LIST: '/api/applications',
    CREATE: '/api/applications',
    UPDATE: '/api/applications/:id',
    DELETE: '/api/applications/:id',
    UPDATE_STATUS: '/api/applications/:id/status',
  },
  
  // Users
  USERS: {
    LIST: '/api/users',
    CREATE: '/api/users',
    UPDATE: '/api/users/:id',
    DELETE: '/api/users/:id',
    UPDATE_ROLE: '/api/users/:id/role',
    BULK_ACTION: '/api/users/bulk-action',
  },
  
  // Payments
  PAYMENTS: {
    CREATE_INTENT: '/api/payments/create-intent',
    CONFIRM: '/api/payments/confirm',
    CANCEL: '/api/payments/cancel',
    HISTORY: '/api/payments/history',
    MPESA_PROCESS: '/api/payments/mpesa/process',
    STRIPE_PROCESS: '/api/payments/stripe/process',
  },
  
  // Notifications
  NOTIFICATIONS: {
    LIST: '/api/notifications',
    MARK_READ: '/api/notifications/:id/read',
    MARK_ALL_READ: '/api/notifications/mark-all-read',
    CREATE: '/api/notifications',
    DELETE: '/api/notifications/:id',
  },
  
  // Analytics
  ANALYTICS: {
    OVERVIEW: '/api/analytics/overview',
    PROPERTIES: '/api/analytics/properties',
    USERS: '/api/analytics/users',
    REVENUE: '/api/analytics/revenue',
    APPLICATIONS: '/api/analytics/applications',
    ENGAGEMENT: '/api/analytics/engagement',
  },
  
  // System
  SYSTEM: {
    HEALTH_CHECK: '/api/system/health',
    STATUS: '/api/system/status',
    METRICS: '/api/system/metrics',
    LOGS: '/api/system/logs',
    CONFIG: '/api/system/config',
  },
  
  // File Upload
  FILES: {
    UPLOAD: '/api/files/upload',
    DELETE: '/api/files/:id',
    GET: '/api/files/:id',
    LIST: '/api/files',
  },
  
  // Messages
  MESSAGES: {
    LIST: '/api/messages',
    CREATE: '/api/messages',
    SEND: '/api/messages/send',
    MARK_READ: '/api/messages/:id/read',
    DELETE: '/api/messages/:id',
  },
  
  // Maintenance
  MAINTENANCE: {
    LIST: '/api/maintenance',
    CREATE: '/api/maintenance',
    UPDATE: '/api/maintenance/:id',
    DELETE: '/api/maintenance/:id',
  },
  
  // Subscriptions
  SUBSCRIPTIONS: {
    LIST: '/api/subscriptions',
    CREATE: '/api/subscriptions',
    UPDATE: '/api/subscriptions/:id',
    CANCEL: '/api/subscriptions/:id/cancel',
    RENEW: '/api/subscriptions/:id/renew',
  },
  
  // Reviews
  REVIEWS: {
    LIST: '/api/reviews',
    CREATE: '/api/reviews',
    UPDATE: '/api/reviews/:id',
    DELETE: '/api/reviews/:id',
  },
  
  // Search
  SEARCH: {
    GLOBAL: '/api/search',
    SUGGESTIONS: '/api/search/suggestions',
    AUTOCOMPLETE: '/api/search/autocomplete',
  },
  
  // Webhooks
  WEBHOOKS: {
    STRIPE: '/api/webhooks/stripe',
    MPESA: '/api/webhooks/mpesa',
    EMAIL: '/api/webhooks/email',
  },
} as const

// Helper function to get full URL
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
  return `${baseUrl}${endpoint}`
}
