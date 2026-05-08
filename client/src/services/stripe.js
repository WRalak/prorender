class StripeService {
  constructor() {
    this.publishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '';
    this.stripe = null;
  }

  // Initialize Stripe
  async initialize() {
    if (!this.publishableKey) {
      throw new Error('Stripe publishable key is required');
    }

    // Load Stripe.js dynamically
    if (!window.Stripe) {
      await this.loadStripeScript();
    }

    this.stripe = window.Stripe(this.publishableKey);
    return this.stripe;
  }

  // Load Stripe.js script
  loadStripeScript() {
    return new Promise((resolve, reject) => {
      if (window.Stripe) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.async = true;

      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Stripe.js'));

      document.head.appendChild(script);
    });
  }

  // Create payment intent
  async createPaymentIntent(amount, currency = 'usd', metadata = {}) {
    try {
      const response = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          amount,
          currency,
          metadata,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create payment intent');
      }

      const { clientSecret } = await response.json();
      return clientSecret;
    } catch (error) {
      console.error('Payment intent creation error:', error);
      throw error;
    }
  }

  // Confirm card payment
  async confirmCardPayment(clientSecret, cardElement, billingDetails = {}) {
    if (!this.stripe) {
      await this.initialize();
    }

    try {
      const { error, paymentIntent } = await this.stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: billingDetails,
        },
      });

      if (error) {
        throw error;
      }

      return paymentIntent;
    } catch (error) {
      console.error('Card payment confirmation error:', error);
      throw error;
    }
  }

  // Confirm payment with existing payment method
  async confirmPayment(clientSecret, paymentMethodId) {
    if (!this.stripe) {
      await this.initialize();
    }

    try {
      const { error, paymentIntent } = await this.stripe.confirmPayment(clientSecret, {
        payment_method: paymentMethodId,
      });

      if (error) {
        throw error;
      }

      return paymentIntent;
    } catch (error) {
      console.error('Payment confirmation error:', error);
      throw error;
    }
  }

  // Create and confirm payment in one step
  async createAndConfirmPayment(amount, cardElement, billingDetails = {}, currency = 'usd', metadata = {}) {
    try {
      const clientSecret = await this.createPaymentIntent(amount, currency, metadata);
      return await this.confirmCardPayment(clientSecret, cardElement, billingDetails);
    } catch (error) {
      console.error('Create and confirm payment error:', error);
      throw error;
    }
  }

  // Setup payment method for future use
  async setupPaymentMethod(cardElement, billingDetails = {}) {
    if (!this.stripe) {
      await this.initialize();
    }

    try {
      const response = await fetch('/api/payments/setup-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create setup intent');
      }

      const { clientSecret } = await response.json();

      const { error, setupIntent } = await this.stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: billingDetails,
        },
      });

      if (error) {
        throw error;
      }

      return setupIntent;
    } catch (error) {
      console.error('Setup payment method error:', error);
      throw error;
    }
  }

  // Create payment method without setup
  async createPaymentMethod(cardElement, billingDetails = {}) {
    if (!this.stripe) {
      await this.initialize();
    }

    try {
      const { error, paymentMethod } = await this.stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: billingDetails,
      });

      if (error) {
        throw error;
      }

      return paymentMethod;
    } catch (error) {
      console.error('Create payment method error:', error);
      throw error;
    }
  }

  // Retrieve payment method
  async retrievePaymentMethod(paymentMethodId) {
    if (!this.stripe) {
      await this.initialize();
    }

    try {
      const paymentMethod = await this.stripe.retrievePaymentMethod(paymentMethodId);
      return paymentMethod;
    } catch (error) {
      console.error('Retrieve payment method error:', error);
      throw error;
    }
  }

  // Attach payment method to customer
  async attachPaymentMethod(paymentMethodId, customerId) {
    try {
      const response = await fetch('/api/payments/attach-payment-method', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          paymentMethodId,
          customerId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to attach payment method');
      }

      return await response.json();
    } catch (error) {
      console.error('Attach payment method error:', error);
      throw error;
    }
  }

  // Detach payment method from customer
  async detachPaymentMethod(paymentMethodId) {
    try {
      const response = await fetch('/api/payments/detach-payment-method', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          paymentMethodId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to detach payment method');
      }

      return await response.json();
    } catch (error) {
      console.error('Detach payment method error:', error);
      throw error;
    }
  }

  // Create subscription
  async createSubscription(priceId, paymentMethodId, customerId = null) {
    try {
      const response = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          priceId,
          paymentMethodId,
          customerId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create subscription');
      }

      return await response.json();
    } catch (error) {
      console.error('Create subscription error:', error);
      throw error;
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId) {
    try {
      const response = await fetch(`/api/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to cancel subscription');
      }

      return await response.json();
    } catch (error) {
      console.error('Cancel subscription error:', error);
      throw error;
    }
  }

  // Update subscription
  async updateSubscription(subscriptionId, updates) {
    try {
      const response = await fetch(`/api/subscriptions/${subscriptionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update subscription');
      }

      return await response.json();
    } catch (error) {
      console.error('Update subscription error:', error);
      throw error;
    }
  }

  // Create checkout session
  async createCheckoutSession(priceId, successUrl, cancelUrl, metadata = {}) {
    try {
      const response = await fetch('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          priceId,
          successUrl,
          cancelUrl,
          metadata,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      return sessionId;
    } catch (error) {
      console.error('Create checkout session error:', error);
      throw error;
    }
  }

  // Redirect to checkout
  async redirectToCheckout(sessionId) {
    if (!this.stripe) {
      await this.initialize();
    }

    try {
      const { error } = await this.stripe.redirectToCheckout({
        sessionId,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Redirect to checkout error:', error);
      throw error;
    }
  }

  // Create and redirect to checkout in one step
  async createAndRedirectToCheckout(priceId, successUrl, cancelUrl, metadata = {}) {
    try {
      const sessionId = await this.createCheckoutSession(priceId, successUrl, cancelUrl, metadata);
      await this.redirectToCheckout(sessionId);
    } catch (error) {
      console.error('Create and redirect to checkout error:', error);
      throw error;
    }
  }

  // Create customer portal session
  async createCustomerPortalSession(returnUrl) {
    try {
      const response = await fetch('/api/payments/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          returnUrl,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create customer portal session');
      }

      const { url } = await response.json();
      return url;
    } catch (error) {
      console.error('Create customer portal session error:', error);
      throw error;
    }
  }

  // Redirect to customer portal
  async redirectToCustomerPortal(returnUrl) {
    try {
      const portalUrl = await this.createCustomerPortalSession(returnUrl);
      window.location.href = portalUrl;
    } catch (error) {
      console.error('Redirect to customer portal error:', error);
      throw error;
    }
  }

  // Get payment methods for customer
  async getPaymentMethods(customerId, type = 'card') {
    try {
      const response = await fetch(`/api/payments/payment-methods?customer=${customerId}&type=${type}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get payment methods');
      }

      return await response.json();
    } catch (error) {
      console.error('Get payment methods error:', error);
      throw error;
    }
  }

  // Get subscriptions for customer
  async getSubscriptions(customerId) {
    try {
      const response = await fetch(`/api/subscriptions?customer=${customerId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get subscriptions');
      }

      return await response.json();
    } catch (error) {
      console.error('Get subscriptions error:', error);
      throw error;
    }
  }

  // Get payment history
  async getPaymentHistory(customerId, limit = 20) {
    try {
      const response = await fetch(`/api/payments/history?customer=${customerId}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get payment history');
      }

      return await response.json();
    } catch (error) {
      console.error('Get payment history error:', error);
      throw error;
    }
  }

  // Format currency amount
  formatAmount(amount, currency = 'usd') {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    });

    return formatter.format(amount / 100); // Stripe amounts are in cents
  }

  // Validate card number (basic validation)
  validateCardNumber(cardNumber) {
    // Remove spaces and dashes
    const cleaned = cardNumber.replace(/[\s-]/g, '');
    
    // Check if it's numeric and has valid length
    if (!/^\d+$/.test(cleaned) || cleaned.length < 13 || cleaned.length > 19) {
      return false;
    }

    // Luhn algorithm
    let sum = 0;
    let isEven = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  // Validate expiry date
  validateExpiryDate(expiry) {
    const match = expiry.match(/^(\d{2})\/(\d{4})$/);
    if (!match) return false;

    const month = parseInt(match[1]);
    const year = parseInt(match[2]);

    if (month < 1 || month > 12) return false;

    const now = new Date();
    const expiryDate = new Date(year, month - 1, 1);
    const currentDate = new Date(now.getFullYear(), now.getMonth(), 1);

    return expiryDate >= currentDate;
  }

  // Validate CVC
  validateCVC(cvc) {
    return /^\d{3,4}$/.test(cvc);
  }

  // Get card type from number
  getCardType(cardNumber) {
    const cleaned = cardNumber.replace(/[\s-]/g, '');

    if (/^4/.test(cleaned)) return 'visa';
    if (/^5[1-5]/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'american_express';
    if (/^6(?:011|5)/.test(cleaned)) return 'discover';
    if (/^3(?:0[0-5]|[68])/.test(cleaned)) return 'diners_club';
    if (/^35/.test(cleaned)) return 'jcb';

    return 'unknown';
  }
}

export default new StripeService();