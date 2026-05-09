const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const AppError = require('../middleware/errorHandler');
const { catchAsync } = require('../middleware/errorHandler');

class PaymentService {
  // Process payment
  static async processPayment(paymentData) {
    try {
      const {
        userId,
        propertyId,
        amount,
        currency = 'USD',
        method,
        paymentIntentId,
        type = 'rent'
      } = paymentData;

      // Validate required fields
      if (!userId || !propertyId || !amount || !method) {
        throw new AppError('Missing required fields: userId, propertyId, amount, method', 400);
      }

      // In a real implementation, you would integrate with Stripe or another payment processor
      const payment = await Payment.create({
        userId,
        propertyId,
        amount,
        currency,
        method,
        paymentIntentId,
        type,
        status: 'processing',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log(`Payment processed: ${amount} ${currency} for property ${propertyId}`);

      return {
        success: true,
        payment
      };
    } catch (error) {
      console.error('Failed to process payment:', error);
      throw new AppError('Failed to process payment', 500);
    }
  }

  // Get payment by ID
  static async getPaymentById(paymentId) {
    try {
      const payment = await Payment.findById(paymentId)
        .populate('user', 'name email')
        .populate('property', 'title address');

      if (!payment) {
        throw new AppError('Payment not found', 404);
      }

      return {
        success: true,
        payment
      };
    } catch (error) {
      console.error('Failed to get payment:', error);
      throw new AppError('Failed to get payment', 500);
    }
  }

  // Get user payments
  static async getUserPayments(userId, filters = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        startDate,
        endDate,
        type
      } = filters;

      // Build query
      const query = { userId };
      
      if (status) {
        query.status = status;
      }
      
      if (type) {
        query.type = type;
      }
      
      // Date range filtering
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) {
          query.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
          query.createdAt.$lte = new Date(endDate);
        }
      }

      const skip = (page - 1) * limit;
      
      const payments = await Payment.find(query)
        .populate('user', 'name email')
        .populate('property', 'title address')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);

      const total = await Payment.countDocuments(query);

      return {
        success: true,
        userId,
        payments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        filters: {
          applied: filters,
          count: payments.length
        }
      };
    } catch (error) {
      console.error('Failed to get user payments:', error);
      throw new AppError('Failed to get user payments', 500);
    }
  }

  // Update payment status
  static async updatePaymentStatus(paymentId, status, metadata = {}) {
    try {
      const payment = await Payment.findByIdAndUpdate(
        paymentId,
        { 
          status,
          updatedAt: new Date(),
          ...metadata
        },
        { new: true }
      );

      console.log(`Payment status updated: ${paymentId} to ${status}`);

      return {
        success: true,
        payment
      };
    } catch (error) {
      console.error('Failed to update payment status:', error);
      throw new AppError('Failed to update payment status', 500);
    }
  }

  // Refund payment
  static async refundPayment(paymentId, refundData) {
    try {
      const {
        amount,
        reason,
        processedBy
        refundId
      } = refundData;

      // Validate required fields
      if (!paymentId || !amount || !reason) {
        throw new AppError('Missing required fields: paymentId, amount, reason', 400);
      }

      const payment = await Payment.findById(paymentId);
      
      if (!payment) {
        throw new AppError('Payment not found', 404);
      }

      // In a real implementation, you would process the refund
      const refund = {
        id: refundId || new Date().getTime().toString(),
        paymentId,
        amount,
        reason,
        processedBy,
        status: 'processed',
        processedAt: new Date(),
        createdAt: new Date()
      };

      console.log(`Payment refunded: ${amount} for payment ${paymentId}`);

      return {
        success: true,
        refund
      };
    } catch (error) {
      console.error('Failed to refund payment:', error);
      throw new AppError('Failed to refund payment', 500);
    }
  }

  // Get payment statistics
  static async getPaymentStats(filters = {}) {
    try {
      const {
        timeRange = '30d',
        userId,
        propertyId
      } = filters;

      let startDate;
      const now = new Date();

      switch (timeRange) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      // Build query
      const query = {};
      
      if (userId) {
        query.userId = userId;
      }
      
      if (propertyId) {
        query.propertyId = propertyId;
      }
      
      if (startDate) {
        query.createdAt = { $gte: startDate };
      }

      const stats = await Payment.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            total: { $sum: '$amount' }
          }
        },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            total: { $sum: '$amount' }
          }
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            total: { $sum: '$amount' }
          }
        }
      ]);

      return {
        success: true,
        timeRange,
        stats
      };
    } catch (error) {
      console.error('Failed to get payment stats:', error);
      throw new AppError('Failed to get payment stats', 500);
    }
  }

  // Create payment intent (for Stripe)
  static async createPaymentIntent(paymentData) {
    try {
      const {
        amount,
        currency = 'USD',
        paymentMethodId,
        description,
        metadata = {}
      } = paymentData;

      // In a real implementation, you would create a Stripe PaymentIntent
      const paymentIntent = {
        id: new Date().getTime().toString(),
        amount,
        currency,
        paymentMethodId,
        description,
        metadata,
        status: 'requires_payment_method',
        clientSecret: 'pi_client_secret_' + Math.random().toString(36).substr(2, 9),
        createdAt: new Date()
      };

      console.log(`Payment intent created: ${amount} ${currency}`);

      return {
        success: true,
        paymentIntent
      };
    } catch (error) {
      console.error('Failed to create payment intent:', error);
      throw new AppError('Failed to create payment intent', 500);
    }
  }

  // Confirm payment intent
  static async confirmPaymentIntent(paymentIntentId, paymentData) {
    try {
      const {
        paymentMethodId
      } = paymentData;

      // In a real implementation, you would confirm the PaymentIntent with Stripe
      const payment = await Payment.findByIdAndUpdate(
        paymentIntentId,
        { 
          status: 'succeeded',
          updatedAt: new Date()
        },
        { new: true }
      );

      console.log(`Payment intent confirmed: ${paymentIntentId}`);

      return {
        success: true,
        payment
      };
    } catch (error) {
      console.error('Failed to confirm payment intent:', error);
      throw new AppError('Failed to confirm payment intent', 500);
    }
  }

  // Handle webhook from payment processor
  static async handleWebhook(webhookData, provider) {
    try {
      const {
        type,
        data,
        event,
        id
      } = webhookData;

      console.log(`Webhook received: ${provider} - ${type}`);

      // In a real implementation, you would:
      // 1. Verify webhook signature
      // 2. Process the event
      // 3. Update database records

      switch (type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(data);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailure(data);
          break;
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(data);
          break;
        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(data);
          break;
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(data);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(data);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(data);
          break;
        default:
          console.log(`Unhandled webhook event: ${type}`);
      }

      return {
        success: true,
        provider,
        type,
        id,
        processedAt: new Date()
      };
    } catch (error) {
      console.error('Failed to handle webhook:', error);
      throw new AppError('Failed to handle webhook', 500);
    }
  }

  // Handle successful payment
  static async handlePaymentSuccess(paymentData) {
    try {
      const paymentIntentId = paymentData.id;
      
      // Update payment record
      const payment = await Payment.findOneAndUpdate(
        { paymentIntentId },
        { 
          status: 'completed',
          paidAt: new Date(),
          updatedAt: new Date()
        },
        { new: true }
      );

      // Update subscription if applicable
      if (payment.subscriptionId) {
        await Subscription.findByIdAndUpdate(
          payment.subscriptionId,
          {
            status: 'active',
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          }
        );
      }

      console.log(`Payment succeeded: ${paymentIntentId}`);

      return {
        success: true,
        payment
      };
    } catch (error) {
      console.error('Failed to handle payment success:', error);
      throw new AppError('Failed to handle payment success', 500);
    }
  }

  // Handle failed payment
  static async handlePaymentFailure(paymentData) {
    try {
      const paymentIntentId = paymentData.id;
      
      // Update payment record
      const payment = await Payment.findOneAndUpdate(
        { paymentIntentId },
        { 
          status: 'failed',
          failureReason: paymentData.last_payment_error?.message || 'Payment failed',
          updatedAt: new Date()
        },
        { new: true }
      );

      console.log(`Payment failed: ${paymentIntentId}`);

      return {
        success: true,
        payment
      };
    } catch (error) {
      console.error('Failed to handle payment failure:', error);
      throw new AppError('Failed to handle payment failure', 500);
    }
  }

  // Handle invoice payment succeeded
  static async handleInvoicePaymentSucceeded(invoiceData) {
    try {
      const subscriptionId = invoiceData.subscription;
      
      if (subscriptionId) {
        await Subscription.findByIdAndUpdate(
          subscriptionId,
          {
            status: 'active',
            currentPeriodEnd: new Date(invoice.current_period_end * 1000)
          }
        );
      }

      console.log(`Invoice payment succeeded: ${invoice.id}`);

      return {
        success: true,
        invoice: invoiceData
      };
    } catch (error) {
      console.error('Failed to handle invoice payment succeeded:', error);
      throw new AppError('Failed to handle invoice payment succeeded', 500);
    }
  }

  // Handle invoice payment failed
  static async handleInvoicePaymentFailed(invoiceData) {
    try {
      const subscriptionId = invoiceData.subscription;
      
      if (subscriptionId) {
        await Subscription.findByIdAndUpdate(
          subscriptionId,
          {
            status: 'past_due'
          }
        );
      }

      console.log(`Invoice payment failed: ${invoice.id}`);

      return {
        success: true,
        invoice: invoiceData
      };
    } catch (error) {
      console.error('Failed to handle invoice payment failed:', error);
      throw new AppError('Failed to handle invoice payment failed', 500);
    }
  }

  // Handle subscription created
  static async handleSubscriptionCreated(subscriptionData) {
    try {
      const subscriptionId = subscriptionData.id;
      
      // Create or update subscription record
      await Subscription.findOneAndUpdate(
        { stripeSubscriptionId: subscriptionId },
        {
          status: 'active',
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          createdAt: new Date()
        },
        { upsert: true }
      );

      console.log(`Subscription created: ${subscriptionId}`);

      return {
        success: true,
        subscription: subscriptionData
      };
    } catch (error) {
      console.error('Failed to handle subscription created:', error);
      throw new AppError('Failed to handle subscription created', 500);
    }
  }

  // Handle subscription updated
  static async handleSubscriptionUpdated(subscriptionData) {
    try {
      const subscriptionId = subscriptionData.id;
      
      // Update subscription record
      await Subscription.findOneAndUpdate(
        { stripeSubscriptionId: subscriptionId },
        {
          status: subscriptionData.status,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscriptionData.cancel_at_period_end,
          updatedAt: new Date()
        },
        { new: true }
      );

      console.log(`Subscription updated: ${subscriptionId}`);

      return {
        success: true,
        subscription: subscriptionData
      };
    } catch (error) {
      console.error('Failed to handle subscription updated:', error);
      throw new AppError('Failed to handle subscription updated', 500);
    }
  }

  // Handle subscription deleted
  static async handleSubscriptionDeleted(subscriptionData) {
    try {
      const subscriptionId = subscriptionData.id;
      
      // Update subscription record
      await Subscription.findOneAndUpdate(
        { stripeSubscriptionId: subscriptionId },
        {
          status: 'canceled',
          endedAt: new Date(),
          updatedAt: new Date()
        },
        { new: true }
      );

      console.log(`Subscription deleted: ${subscriptionId}`);

      return {
        success: true,
        subscription: subscriptionData
      };
    } catch (error) {
      console.error('Failed to handle subscription deleted:', error);
      throw new AppError('Failed to handle subscription deleted', 500);
    }
  }

  // Get payment methods
  static async getPaymentMethods() {
    try {
      // In a real implementation, you would query your payment methods
      const methods = [
        {
          id: 'card',
          name: 'Credit Card',
          type: 'card',
          enabled: true,
          fees: {
            percentage: 2.9,
            fixed: 0.30
          }
        },
        {
          id: 'bank_transfer',
          name: 'Bank Transfer',
          type: 'bank',
          enabled: true,
          fees: {
            percentage: 0,
            fixed: 5.00
          }
        },
        {
          id: 'paypal',
          name: 'PayPal',
          type: 'wallet',
          enabled: true,
          fees: {
            percentage: 3.4,
            fixed: 0.30
          }
        }
      ];

      return {
        success: true,
        methods
      };
    } catch (error) {
      console.error('Failed to get payment methods:', error);
      throw new AppError('Failed to get payment methods', 500);
    }
  }

  // Get payment history
  static async getPaymentHistory(userId, filters = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        startDate,
        endDate,
        status,
        type
      } = filters;

      // Build query
      const query = { userId };
      
      if (status) {
        query.status = status;
      }
      
      if (type) {
        query.type = type;
      }

      // Date range filtering
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) {
          query.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
          query.createdAt.$lte = new Date(endDate);
        }
      }

      const skip = (page - 1) * limit;
      
      const payments = await Payment.find(query)
        .populate('user', 'name email')
        .populate('property', 'title address')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);

      const total = await Payment.countDocuments(query);

      return {
        success: true,
        userId,
        payments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        filters: {
          applied: filters,
          count: payments.length
        }
      };
    } catch (error) {
      console.error('Failed to get payment history:', error);
      throw new AppError('Failed to get payment history', 500);
    }
  }

  // Export payment data
  static async exportPaymentData(userId, format = 'csv', filters = {}) {
    try {
      const payments = await this.getUserPayments(userId, filters);
      
      let exportData;
      let contentType;

      switch (format.toLowerCase()) {
        case 'csv':
          exportData = this.convertToCSV(payments.payments);
          contentType = 'text/csv';
          break;
        case 'excel':
          exportData = this.convertToExcel(payments.payments);
          contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          break;
        default:
          exportData = JSON.stringify(payments.payments, null, 2);
          contentType = 'application/json';
      }

      return {
        success: true,
        format,
        contentType,
        data: exportData,
        filename: `payments_${userId}_${new Date().toISOString().split('T')[0]}.${format}`
      };
    } catch (error) {
      console.error('Failed to export payment data:', error);
      throw new AppError('Failed to export payment data', 500);
    }
  }

  // Helper method to convert to CSV
  static convertToCSV(payments) {
    const headers = ['id', 'userId', 'propertyId', 'amount', 'currency', 'status', 'type', 'createdAt', 'paidAt'];
    const csvRows = [headers.join(',')];

    payments.forEach(payment => {
      const row = [
        payment.id,
        payment.userId,
        payment.propertyId,
        payment.amount,
        payment.currency,
        payment.status,
        payment.type,
        payment.createdAt,
        payment.paidAt || ''
      ];
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  }

  // Helper method to convert to Excel (simplified)
  static convertToExcel(payments) {
    // In a real implementation, you would use a library like xlsx
    // For now, return JSON formatted for Excel
    return JSON.stringify(payments, null, 2);
  }
  }
}

module.exports = PaymentService;