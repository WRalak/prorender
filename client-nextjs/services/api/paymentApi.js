import { API_BASE_URL } from '../api';

class PaymentAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get auth token from localStorage
  getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Create payment intent
  async createPaymentIntent(amount, currency = 'usd', metadata = {}) {
    const response = await fetch(`${this.baseURL}/payments/create-intent`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount, currency, metadata }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create payment intent');
    }

    return response.json();
  }

  // Confirm payment
  async confirmPayment(paymentIntentId, paymentMethodId) {
    const response = await fetch(`${this.baseURL}/payments/confirm`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentIntentId, paymentMethodId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to confirm payment');
    }

    return response.json();
  }

  // Get payment methods
  async getPaymentMethods() {
    const response = await fetch(`${this.baseURL}/payments/methods`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get payment methods');
    }

    return response.json();
  }

  // Add payment method
  async addPaymentMethod(paymentMethodData) {
    const response = await fetch(`${this.baseURL}/payments/methods`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentMethodData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add payment method');
    }

    return response.json();
  }

  // Remove payment method
  async removePaymentMethod(paymentMethodId) {
    const response = await fetch(`${this.baseURL}/payments/methods/${paymentMethodId}`, {
      method: 'DELETE',
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to remove payment method');
    }

    return response.json();
  }

  // Set default payment method
  async setDefaultPaymentMethod(paymentMethodId) {
    const response = await fetch(`${this.baseURL}/payments/methods/${paymentMethodId}/default`, {
      method: 'POST',
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to set default payment method');
    }

    return response.json();
  }

  // Get payment history
  async getPaymentHistory(page = 1, limit = 20, filters = {}) {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });

    const response = await fetch(`${this.baseURL}/payments/history?${params}`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get payment history');
    }

    return response.json();
  }

  // Get payment by ID
  async getPayment(paymentId) {
    const response = await fetch(`${this.baseURL}/payments/${paymentId}`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get payment');
    }

    return response.json();
  }

  // Refund payment
  async refundPayment(paymentId, amount, reason = '') {
    const response = await fetch(`${this.baseURL}/payments/${paymentId}/refund`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount, reason }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to refund payment');
    }

    return response.json();
  }

  // Create subscription
  async createSubscription(priceId, paymentMethodId, metadata = {}) {
    const response = await fetch(`${this.baseURL}/subscriptions/create`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ priceId, paymentMethodId, metadata }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create subscription');
    }

    return response.json();
  }

  // Get subscriptions
  async getSubscriptions() {
    const response = await fetch(`${this.baseURL}/subscriptions`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get subscriptions');
    }

    return response.json();
  }

  // Get subscription by ID
  async getSubscription(subscriptionId) {
    const response = await fetch(`${this.baseURL}/subscriptions/${subscriptionId}`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get subscription');
    }

    return response.json();
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId, reason = '') {
    const response = await fetch(`${this.baseURL}/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to cancel subscription');
    }

    return response.json();
  }

  // Pause subscription
  async pauseSubscription(subscriptionId) {
    const response = await fetch(`${this.baseURL}/subscriptions/${subscriptionId}/pause`, {
      method: 'POST',
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to pause subscription');
    }

    return response.json();
  }

  // Resume subscription
  async resumeSubscription(subscriptionId) {
    const response = await fetch(`${this.baseURL}/subscriptions/${subscriptionId}/resume`, {
      method: 'POST',
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to resume subscription');
    }

    return response.json();
  }

  // Update subscription
  async updateSubscription(subscriptionId, updates) {
    const response = await fetch(`${this.baseURL}/subscriptions/${subscriptionId}`, {
      method: 'PATCH',
      headers: {
        ...this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update subscription');
    }

    return response.json();
  }

  // Get pricing plans
  async getPricingPlans() {
    const response = await fetch(`${this.baseURL}/subscriptions/plans`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get pricing plans');
    }

    return response.json();
  }

  // Process rental payment
  async processRentalPayment(leaseId, amount, paymentMethodId) {
    const response = await fetch(`${this.baseURL}/payments/rental`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ leaseId, amount, paymentMethodId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to process rental payment');
    }

    return response.json();
  }

  // Get rental payment history
  async getRentalPaymentHistory(leaseId, page = 1, limit = 20) {
    const response = await fetch(
      `${this.baseURL}/payments/rental/${leaseId}?page=${page}&limit=${limit}`,
      {
        headers: this.getAuthHeader(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get rental payment history');
    }

    return response.json();
  }

  // Schedule recurring payment
  async scheduleRecurringPayment(leaseId, amount, paymentMethodId, frequency) {
    const response = await fetch(`${this.baseURL}/payments/schedule`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ leaseId, amount, paymentMethodId, frequency }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to schedule recurring payment');
    }

    return response.json();
  }

  // Get scheduled payments
  async getScheduledPayments(page = 1, limit = 20) {
    const response = await fetch(
      `${this.baseURL}/payments/scheduled?page=${page}&limit=${limit}`,
      {
        headers: this.getAuthHeader(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get scheduled payments');
    }

    return response.json();
  }

  // Cancel scheduled payment
  async cancelScheduledPayment(scheduleId) {
    const response = await fetch(`${this.baseURL}/payments/scheduled/${scheduleId}`, {
      method: 'DELETE',
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to cancel scheduled payment');
    }

    return response.json();
  }

  // Get payment statistics
  async getPaymentStats(timeRange = 'month') {
    const response = await fetch(`${this.baseURL}/payments/stats?range=${timeRange}`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get payment statistics');
    }

    return response.json();
  }

  // Export payment data
  async exportPaymentData(format = 'csv', filters = {}) {
    const params = new URLSearchParams({ format });
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });

    const response = await fetch(`${this.baseURL}/payments/export?${params}`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to export payment data');
    }

    return response.blob();
  }

  // Validate payment method
  async validatePaymentMethod(paymentMethodId) {
    const response = await fetch(`${this.baseURL}/payments/methods/${paymentMethodId}/validate`, {
      method: 'POST',
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to validate payment method');
    }

    return response.json();
  }

  // Get billing address
  async getBillingAddress() {
    const response = await fetch(`${this.baseURL}/payments/billing-address`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get billing address');
    }

    return response.json();
  }

  // Update billing address
  async updateBillingAddress(addressData) {
    const response = await fetch(`${this.baseURL}/payments/billing-address`, {
      method: 'PUT',
      headers: {
        ...this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(addressData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update billing address');
    }

    return response.json();
  }
}

export default new PaymentAPI();