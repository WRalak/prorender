const API_BASE_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5001';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get auth token from localStorage
  getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? `Bearer ${token}` : '';
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}/api${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth header if token exists
    const authHeader = this.getAuthHeader();
    if (authHeader) {
      config.headers.Authorization = authHeader;
    }

    try {
      const response = await fetch(url, config);
      
      // Handle 401 Unauthorized
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }

      // Handle other HTTP errors
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // HTTP methods
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url);
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // File upload method
  async upload(endpoint, file, additionalData = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    const url = `${this.baseURL}/api${endpoint}`;
    const config = {
      method: 'POST',
      body: formData,
      headers: {},
    };

    // Add auth header if token exists
    const authHeader = this.getAuthHeader();
    if (authHeader) {
      config.headers.Authorization = authHeader;
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const api = new ApiService();

// Export specific API methods for better organization
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.patch(`/auth/reset-password/${token}`, { password }),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  getMe: () => api.get('/auth/me'),
};

export const propertyAPI = {
  getProperties: (params) => api.get('/properties', params),
  getProperty: (id) => api.get(`/properties/${id}`),
  searchProperties: (params) => api.post('/properties/search', params),
  getFeaturedProperties: () => api.get('/properties/featured'),
  getSimilarProperties: (id) => api.get(`/properties/${id}/similar`),
  createProperty: (data) => api.post('/properties', data),
  updateProperty: (id, data) => api.patch(`/properties/${id}`, data),
  deleteProperty: (id) => api.delete(`/properties/${id}`),
  uploadImages: (id, files) => api.upload(`/properties/${id}/images`, files[0]),
  toggleFavorite: (id) => api.post(`/properties/${id}/favorite`),
  sendInquiry: (id, message) => api.post(`/properties/${id}/inquiry`, { message }),
  scheduleViewing: (id, data) => api.post(`/properties/${id}/schedule-viewing`, data),
};

export const applicationAPI = {
  getApplications: (params) => api.get('/applications', params),
  getApplication: (id) => api.get(`/applications/${id}`),
  createApplication: (data) => api.post('/applications', data),
  updateApplication: (id, data) => api.patch(`/applications/${id}`, data),
  uploadDocument: (id, file, type) => api.upload(`/applications/${id}/documents`, file, { type }),
  withdrawApplication: (id) => api.patch(`/applications/${id}/withdraw`),
};

export const chatAPI = {
  getConversations: () => api.get('/chat/conversations'),
  getConversation: (id) => api.get(`/chat/conversations/${id}`),
  createConversation: (data) => api.post('/chat/conversations', data),
  getMessages: (conversationId) => api.get(`/chat/conversations/${conversationId}/messages`),
  sendMessage: (conversationId, content) => api.post(`/chat/conversations/${conversationId}/messages`, { content }),
  markMessageAsRead: (messageId) => api.patch(`/chat/messages/${messageId}/read`),
  editMessage: (messageId, content) => api.patch(`/chat/messages/${messageId}`, { content }),
  deleteMessage: (messageId) => api.delete(`/chat/messages/${messageId}`),
};

export const paymentAPI = {
  getPayments: (params) => api.get('/payments', params),
  getPayment: (id) => api.get(`/payments/${id}`),
  createPayment: (data) => api.post('/payments', data),
  createPaymentIntent: (data) => api.post('/payments/create-payment-intent', data),
  confirmPayment: (data) => api.post('/payments/confirm-payment', data),
  processRefund: (paymentId) => api.post(`/payments/refund/${paymentId}`),
  setupAutopay: (data) => api.post('/payments/setup-autopay', data),
  cancelAutopay: (paymentMethodId) => api.delete(`/payments/cancel-autopay/${paymentMethodId}`),
  getPaymentHistory: (params) => api.get('/payments/history', params),
  getMonthlyStatement: (month, year) => api.get(`/payments/statement/${month}/${year}`),
};

export const maintenanceAPI = {
  getMaintenanceRequests: (params) => api.get('/maintenance', params),
  getMaintenanceRequest: (id) => api.get(`/maintenance/${id}`),
  createMaintenanceRequest: (data) => api.post('/maintenance', data),
  updateMaintenanceRequest: (id, data) => api.patch(`/maintenance/${id}`, data),
  uploadImages: (id, files) => api.upload(`/maintenance/${id}/images`, files[0]),
  updateStatus: (id, status) => api.patch(`/maintenance/${id}/status`, { status }),
  rateMaintenance: (id, rating, feedback) => api.patch(`/maintenance/${id}/rate`, { rating, feedback }),
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.patch('/users/profile', data),
  updatePassword: (data) => api.patch('/users/password', data),
  updateAvatar: (file) => api.upload('/users/avatar', file),
  deleteAccount: () => api.delete('/users/account'),
  getFavorites: () => api.get('/users/favorites'),
  addToFavorites: (propertyId) => api.post(`/users/favorites/${propertyId}`),
  removeFromFavorites: (propertyId) => api.delete(`/users/favorites/${propertyId}`),
  getSavedSearches: () => api.get('/users/saved-searches'),
  createSavedSearch: (data) => api.post('/users/saved-searches', data),
  updateSavedSearch: (id, data) => api.patch(`/users/saved-searches/${id}`, data),
  deleteSavedSearch: (id) => api.delete(`/users/saved-searches/${id}`),
  getNotifications: () => api.get('/users/notifications'),
  markNotificationAsRead: (id) => api.patch(`/users/notifications/${id}/read`),
  markAllNotificationsAsRead: () => api.patch('/users/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/users/notifications/${id}`),
};

export const adminAPI = {
  getReportsOverview: (timeRange) => api.get(`/admin/reports/overview?timeRange=${timeRange}`),
  getFinancialReports: (timeRange) => api.get(`/admin/reports/financial?timeRange=${timeRange}`),
  getUserStats: (timeRange) => api.get(`/admin/reports/users?timeRange=${timeRange}`),
  getSystemSettings: () => api.get('/admin/settings'),
  updateSystemSettings: (data) => api.patch('/admin/settings', data),
  regenerateApiKey: () => api.post('/admin/settings/regenerate-api-key'),
  testEmailSettings: (data) => api.post('/admin/settings/test-email', data),
  backupDatabase: () => api.post('/admin/backup'),
};

export default api;
