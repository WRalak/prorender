// Property Constants
export const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'condo', label: 'Condo' },
  { value: 'studio', label: 'Studio' },
  { value: 'townhouse', label: 'Townhouse' },
] as const;

export const PROPERTY_STATUS = [
  { value: 'available', label: 'Available', color: 'green' },
  { value: 'rented', label: 'Rented', color: 'gray' },
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'maintenance', label: 'Maintenance', color: 'red' },
] as const;

export const AMENITIES = [
  'Air Conditioning',
  'Heating',
  'Parking',
  'Laundry',
  'Dishwasher',
  'Balcony',
  'Gym',
  'Pool',
  'Security',
  'Elevator',
  'Pet Friendly',
  'Furnished',
  'Storage',
  'High-Speed Internet',
  'In-Unit Laundry',
  'Outdoor Space',
  'Doorman',
  'Fitness Center',
  'Roof Deck',
  'Garage Parking',
] as const;

// User Roles
export const USER_ROLES = [
  { value: 'tenant', label: 'Tenant' },
  { value: 'agent', label: 'Agent' },
  { value: 'admin', label: 'Admin' },
  { value: 'super_admin', label: 'Super Admin' },
] as const;

// Application Status
export const APPLICATION_STATUS = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'approved', label: 'Approved', color: 'green' },
  { value: 'rejected', label: 'Rejected', color: 'red' },
  { value: 'withdrawn', label: 'Withdrawn', color: 'gray' },
] as const;

// Payment Types
export const PAYMENT_TYPES = [
  { value: 'rent', label: 'Rent' },
  { value: 'deposit', label: 'Security Deposit' },
  { value: 'application_fee', label: 'Application Fee' },
  { value: 'subscription', label: 'Subscription' },
  { value: 'service', label: 'Service Fee' },
] as const;

export const PAYMENT_METHODS = [
  { value: 'stripe', label: 'Credit Card (Stripe)' },
  { value: 'mpesa', label: 'M-Pesa' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cash', label: 'Cash' },
] as const;

// Maintenance Categories
export const MAINTENANCE_CATEGORIES = [
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'appliance', label: 'Appliance' },
  { value: 'structural', label: 'Structural' },
  { value: 'other', label: 'Other' },
] as const;

export const MAINTENANCE_PRIORITY = [
  { value: 'low', label: 'Low', color: 'blue' },
  { value: 'medium', label: 'Medium', color: 'yellow' },
  { value: 'high', label: 'High', color: 'orange' },
  { value: 'urgent', label: 'Urgent', color: 'red' },
] as const;

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  basic: {
    name: 'Basic',
    price: 0,
    features: [
      'Browse Properties',
      'Save Favorites',
      'Email Alerts',
      'Basic Search',
    ],
    maxListings: 0,
  },
  premium: {
    name: 'Premium',
    price: 4900,
    currency: 'KES',
    features: [
      'Everything in Basic',
      'Advanced Search',
      'Map Search',
      'Unlimited Favorites',
      'Priority Support',
    ],
    maxListings: 0,
  },
  pro: {
    name: 'Pro',
    price: 9900,
    currency: 'KES',
    features: [
      'Everything in Premium',
      'AI Recommendations',
      'Virtual Tours',
      'Market Insights',
      'Premium Support',
    ],
    maxListings: 0,
  },
} as const;

export const AGENT_SUBSCRIPTION_PLANS = {
  basic: {
    name: 'Basic',
    price: 4900,
    currency: 'KES',
    features: [
      'Up to 10 Listings',
      'Basic Dashboard',
      'Tenant Messaging',
      'Monthly Reports',
    ],
    maxListings: 10,
    featuredListings: 0,
    advancedAnalytics: false,
    customBranding: false,
    prioritySupport: false,
  },
  pro: {
    name: 'Pro',
    price: 9900,
    currency: 'KES',
    features: [
      'Up to 50 Listings',
      'Advanced Dashboard',
      'Analytics & Insights',
      'Custom Branding',
      'Priority Support',
      'Google Calendar Sync',
      'E-Signature Integration',
    ],
    maxListings: 50,
    featuredListings: 5,
    advancedAnalytics: true,
    customBranding: true,
    prioritySupport: true,
  },
} as const;

// API Constants
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    VERIFY_EMAIL: '/api/auth/verify-email',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
  },
  // Properties
  PROPERTIES: {
    LIST: '/api/properties',
    DETAIL: (id: string) => `/api/properties/${id}`,
    CREATE: '/api/properties',
    UPDATE: (id: string) => `/api/properties/${id}`,
    DELETE: (id: string) => `/api/properties/${id}`,
    SEARCH: '/api/properties/search',
    MAP_SEARCH: '/api/properties/map-search',
  },
  // Applications
  APPLICATIONS: {
    LIST: '/api/applications',
    CREATE: '/api/applications',
    DETAIL: (id: string) => `/api/applications/${id}`,
    UPDATE: (id: string) => `/api/applications/${id}`,
    UPLOAD_DOCUMENT: '/api/applications/upload-document',
  },
  // Messages
  MESSAGES: {
    CONVERSATIONS: '/api/messages/conversations',
    CONVERSATION: (id: string) => `/api/messages/conversations/${id}`,
    SEND: '/api/messages/send',
    MARK_READ: (id: string) => `/api/messages/${id}/read`,
  },
  // Payments
  PAYMENTS: {
    LIST: '/api/payments',
    CREATE_INTENT: '/api/payments/create-intent',
    CONFIRM: '/api/payments/confirm',
    MPESA_STK: '/api/payments/mpesa/stk',
  },
  // Maintenance
  MAINTENANCE: {
    LIST: '/api/maintenance',
    CREATE: '/api/maintenance',
    DETAIL: (id: string) => `/api/maintenance/${id}`,
    UPDATE: (id: string) => `/api/maintenance/${id}`,
  },
  // Subscriptions
  SUBSCRIPTIONS: {
    PLANS: '/api/subscriptions/plans',
    CURRENT: '/api/subscriptions/current',
    UPGRADE: '/api/subscriptions/upgrade',
    CANCEL: '/api/subscriptions/cancel',
  },
} as const;

// Map Constants
export const MAPBOX_CONFIG = {
  accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '',
  style: 'mapbox://styles/mapbox/streets-v12',
  defaultCenter: [-1.2921, 36.8219], // Nairobi
  defaultZoom: 12,
  clusterMaxZoom: 14,
  clusterRadius: 50,
} as const;

// File Upload Constants
export const FILE_UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: {
    images: ['image/jpeg', 'image/png', 'image/webp'],
    documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  },
  UPLOAD_ENDPOINTS: {
    PROPERTY_IMAGE: '/api/upload/property-image',
    APPLICATION_DOCUMENT: '/api/upload/application-document',
    PROFILE_PICTURE: '/api/upload/profile-picture',
  },
} as const;
