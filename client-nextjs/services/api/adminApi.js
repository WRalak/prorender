import { API_BASE_URL } from '../api';

class AdminAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get auth token from localStorage
  getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Get dashboard stats
  async getDashboardStats() {
    const response = await fetch(`${this.baseURL}/admin/dashboard/stats`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get dashboard stats');
    }

    return response.json();
  }

  // Get users
  async getUsers(page = 1, limit = 20, filters = {}) {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });

    const response = await fetch(`${this.baseURL}/admin/users?${params}`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get users');
    }

    return response.json();
  }

  // Get user by ID
  async getUser(userId) {
    const response = await fetch(`${this.baseURL}/admin/users/${userId}`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get user');
    }

    return response.json();
  }

  // Update user
  async updateUser(userId, userData) {
    const response = await fetch(`${this.baseURL}/admin/users/${userId}`, {
      method: 'PATCH',
      headers: {
        ...this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update user');
    }

    return response.json();
  }

  // Suspend user
  async suspendUser(userId, reason, duration) {
    const response = await fetch(`${this.baseURL}/admin/users/${userId}/suspend`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason, duration }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to suspend user');
    }

    return response.json();
  }

  // Unsuspend user
  async unsuspendUser(userId) {
    const response = await fetch(`${this.baseURL}/admin/users/${userId}/unsuspend`, {
      method: 'POST',
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to unsuspend user');
    }

    return response.json();
  }

  // Delete user
  async deleteUser(userId) {
    const response = await fetch(`${this.baseURL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete user');
    }

    return response.json();
  }

  // Get properties
  async getProperties(page = 1, limit = 20, filters = {}) {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });

    const response = await fetch(`${this.baseURL}/admin/properties?${params}`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get properties');
    }

    return response.json();
  }

  // Get property by ID
  async getProperty(propertyId) {
    const response = await fetch(`${this.baseURL}/admin/properties/${propertyId}`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get property');
    }

    return response.json();
  }

  // Update property
  async updateProperty(propertyId, propertyData) {
    const response = await fetch(`${this.baseURL}/admin/properties/${propertyId}`, {
      method: 'PATCH',
      headers: {
        ...this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(propertyData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update property');
    }

    return response.json();
  }

  // Approve property
  async approveProperty(propertyId) {
    const response = await fetch(`${this.baseURL}/admin/properties/${propertyId}/approve`, {
      method: 'POST',
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to approve property');
    }

    return response.json();
  }

  // Reject property
  async rejectProperty(propertyId, reason) {
    const response = await fetch(`${this.baseURL}/admin/properties/${propertyId}/reject`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to reject property');
    }

    return response.json();
  }

  // Get applications
  async getApplications(page = 1, limit = 20, filters = {}) {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });

    const response = await fetch(`${this.baseURL}/admin/applications?${params}`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get applications');
    }

    return response.json();
  }

  // Get application by ID
  async getApplication(applicationId) {
    const response = await fetch(`${this.baseURL}/admin/applications/${applicationId}`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get application');
    }

    return response.json();
  }

  // Update application
  async updateApplication(applicationId, applicationData) {
    const response = await fetch(`${this.baseURL}/admin/applications/${applicationId}`, {
      method: 'PATCH',
      headers: {
        ...this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(applicationData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update application');
    }

    return response.json();
  }

  // Approve application
  async approveApplication(applicationId) {
    const response = await fetch(`${this.baseURL}/admin/applications/${applicationId}/approve`, {
      method: 'POST',
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to approve application');
    }

    return response.json();
  }

  // Reject application
  async rejectApplication(applicationId, reason) {
    const response = await fetch(`${this.baseURL}/admin/applications/${applicationId}/reject`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to reject application');
    }

    return response.json();
  }

  // Get moderation log
  async getModerationLog(page = 1, limit = 20, filters = {}) {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });

    const response = await fetch(`${this.baseURL}/admin/moderation/log?${params}`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get moderation log');
    }

    return response.json();
  }

  // Get reported properties
  async getReportedProperties(page = 1, limit = 20, filters = {}) {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });

    const response = await fetch(`${this.baseURL}/admin/moderation/reported-properties?${params}`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get reported properties');
    }

    return response.json();
  }

  // Update reported property
  async updateReportedProperty(reportId, action, notes) {
    const response = await fetch(`${this.baseURL}/admin/moderation/reported-properties/${reportId}`, {
      method: 'PATCH',
      headers: {
        ...this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, notes }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update reported property');
    }

    return response.json();
  }

  // Get flagged messages
  async getFlaggedMessages(page = 1, limit = 20, filters = {}) {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });

    const response = await fetch(`${this.baseURL}/admin/moderation/flagged-messages?${params}`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get flagged messages');
    }

    return response.json();
  }

  // Update flagged message
  async updateFlaggedMessage(messageId, action, notes) {
    const response = await fetch(`${this.baseURL}/admin/moderation/flagged-messages/${messageId}`, {
      method: 'PATCH',
      headers: {
        ...this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, notes }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update flagged message');
    }

    return response.json();
  }

  // Get space approvals
  async getSpaceApprovals(page = 1, limit = 20, filters = {}) {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });

    const response = await fetch(`${this.baseURL}/admin/space-approvals?${params}`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get space approvals');
    }

    return response.json();
  }

  // Update space approval
  async updateSpaceApproval(approvalId, action, notes) {
    const response = await fetch(`${this.baseURL}/admin/space-approvals/${approvalId}`, {
      method: 'PATCH',
      headers: {
        ...this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, notes }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update space approval');
    }

    return response.json();
  }

  // Get reports
  async getReports(type, page = 1, limit = 20, filters = {}) {
    const params = new URLSearchParams({ 
      page: page.toString(), 
      limit: limit.toString(),
      type 
    });
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });

    const response = await fetch(`${this.baseURL}/admin/reports?${params}`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get reports');
    }

    return response.json();
  }

  // Get system logs
  async getSystemLogs(page = 1, limit = 20, filters = {}) {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });

    const response = await fetch(`${this.baseURL}/admin/system/logs?${params}`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get system logs');
    }

    return response.json();
  }

  // Get system settings
  async getSystemSettings() {
    const response = await fetch(`${this.baseURL}/admin/system/settings`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get system settings');
    }

    return response.json();
  }

  // Update system settings
  async updateSystemSettings(settings) {
    const response = await fetch(`${this.baseURL}/admin/system/settings`, {
      method: 'PATCH',
      headers: {
        ...this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update system settings');
    }

    return response.json();
  }

  // Get analytics
  async getAnalytics(type, timeRange = '30d') {
    const response = await fetch(`${this.baseURL}/admin/analytics/${type}?range=${timeRange}`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get analytics');
    }

    return response.json();
  }

  // Export data
  async exportData(type, format = 'csv', filters = {}) {
    const params = new URLSearchParams({ type, format });
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });

    const response = await fetch(`${this.baseURL}/admin/export?${params}`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to export data');
    }

    return response.blob();
  }

  // Send notification
  async sendNotification(notificationData) {
    const response = await fetch(`${this.baseURL}/admin/notifications`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send notification');
    }

    return response.json();
  }

  // Get notifications
  async getNotifications(page = 1, limit = 20, filters = {}) {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });

    const response = await fetch(`${this.baseURL}/admin/notifications?${params}`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get notifications');
    }

    return response.json();
  }
}

export default new AdminAPI();