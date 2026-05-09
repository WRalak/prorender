// API Configuration and Utilities
import { useState, useEffect } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// API Client with authentication
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Load token from localStorage on initialization
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('authToken');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // File upload
  async upload<T>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const headers: HeadersInit = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        body: formData,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('File Upload Error:', error);
      throw error;
    }
  }
}

// Create API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY_EMAIL: '/auth/verify-email',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },

  // Users
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',
    DELETE_ACCOUNT: '/users/delete-account',
  },

  // Agent Registration
  AGENT: {
    REGISTER: '/agent/register',
    VERIFY_LICENSE: '/agent/verify-license',
    SUBSCRIPTION: '/agent/subscription',
    DASHBOARD: '/agent/dashboard',
    PROPERTIES: '/agent/properties',
    CREATE_PROPERTY: '/agent/properties',
    UPDATE_PROPERTY: '/agent/properties',
    DELETE_PROPERTY: '/agent/properties',
    LEADS: '/agent/leads',
    ANALYTICS: '/agent/analytics',
    TENANTS: '/agent/tenants',
    RENT_COLLECTION: '/agent/rent-collection',
  },

  // Properties
  PROPERTIES: {
    LIST: '/properties',
    SEARCH: '/properties/search',
    DETAIL: '/properties',
    FAVORITES: '/properties/favorites',
    APPLY: '/properties/apply',
    CONTACT_AGENT: '/properties/contact-agent',
  },

  // Admin
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    SPACES: '/admin/spaces',
    APPROVE_SPACE: '/admin/spaces/approve',
    REJECT_SPACE: '/admin/spaces/reject',
    USERS: '/admin/users',
    MODERATE_CONTENT: '/admin/moderate',
    REPORTED_CONTENT: '/admin/reports',
    SYSTEM_HEALTH: '/admin/system-health',
  },

  // Super Admin
  SUPER_ADMIN: {
    SETTINGS: '/super-admin/settings',
    COMMISSION_RATES: '/super-admin/commission',
    SUBSCRIPTION_PLANS: '/super-admin/plans',
    API_KEYS: '/super-admin/api-keys',
    AUDIT_LOG: '/super-admin/audit-log',
    ADMIN_USERS: '/super-admin/admins',
    PROMOTE_ADMIN: '/super-admin/promote-admin',
    DEMOTE_ADMIN: '/super-admin/demote-admin',
  },

  // Payments
  PAYMENTS: {
    INTENT: '/payments/create-intent',
    CONFIRM: '/payments/confirm',
    SUBSCRIPTION: '/payments/subscription',
    RENT: '/payments/rent',
    REFUND: '/payments/refund',
    HISTORY: '/payments/history',
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: '/notifications/read',
    PREFERENCES: '/notifications/preferences',
  },
} as const;

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Error Types
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Utility Functions
export const handleApiError = (error: any): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }
  
  if (error.message) {
    return new ApiError(error.message);
  }
  
  return new ApiError('An unexpected error occurred');
};

export const isNetworkError = (error: any): boolean => {
  return error instanceof TypeError && error.message.includes('fetch');
};

// Request hooks for common patterns
export const createRequestHook = <T>(
  requestFn: () => Promise<T>,
  options: {
    immediate?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: ApiError) => void;
  } = {}
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const execute = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await requestFn();
      setData(result);
      options.onSuccess?.(result);
      return result;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      options.onError?.(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (options.immediate) {
      execute();
    }
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    refetch: execute,
  };
};
