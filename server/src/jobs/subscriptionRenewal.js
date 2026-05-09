const mongoose = require('mongoose');
const { logger } = require('../config/logger');
const emailService = require('../services/emailService');
const paymentService = require('../services/paymentService');

// Models
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

class SubscriptionRenewalJob {
  constructor() {
    this.isRunning = false;
  }

  // Main subscription renewal function
  async runSubscriptionRenewal(options = {}) {
    if (this.isRunning) {
      logger.warn('Subscription renewal job is already running');
      return { success: false, message: 'Subscription renewal already in progress' };
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      logger.info('Starting subscription renewal job');
      
      const renewalOptions = {
        daysInAdvance: options.daysInAdvance || 7,
        dryRun: options.dryRun || false,
        includeExpired: options.includeExpired || false,
        sendNotifications: options.sendNotifications !== false
      };

      const results = {
        processed: 0,
        renewed: 0,
        failed: 0,
        expired: 0,
        notificationsSent: 0,
        totalAmount: 0
      };

      // Get subscriptions due for renewal
      const subscriptions = await this.getSubscriptionsDueForRenewal(renewalOptions);
      results.processed = subscriptions.length;

      logger.info(`Found ${subscriptions.length} subscriptions due for renewal`);

      // Process each subscription
      for (const subscription of subscriptions) {
        try {
          const renewalResult = await this.processSubscriptionRenewal(subscription, renewalOptions);
          
          if (renewalResult.renewed) {
            results.renewed++;
            results.totalAmount += renewalResult.amount;
          } else if (renewalResult.expired) {
            results.expired++;
          }

          if (renewalResult.notificationSent) {
            results.notificationsSent++;
          }

        } catch (error) {
          logger.error(`Failed to process subscription ${subscription._id}:`, error);
          results.failed++;
        }
      }

      // Handle expired subscriptions
      if (renewalOptions.includeExpired) {
        const expiredResult = await this.handleExpiredSubscriptions();
        results.expired += expiredResult.expired;
        results.notificationsSent += expiredResult.notificationsSent;
      }

      const duration = Date.now() - startTime;
      logger.info(`Subscription renewal job completed in ${duration}ms. Renewed: ${results.renewed}, Failed: ${results.failed}, Expired: ${results.expired}`);

      return {
        success: true,
        results,
        duration,
        message: `Subscription renewal completed. Renewed: ${results.renewed}, Failed: ${results.failed}, Expired: ${results.expired}`
      };

    } catch (error) {
      logger.error('Subscription renewal job failed:', error);
      return {
        success: false,
        error: error.message,
        message: 'Subscription renewal job failed'
      };
    } finally {
      this.isRunning = false;
    }
  }

  // Get subscriptions due for renewal
  async getSubscriptionsDueForRenewal(options) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + options.daysInAdvance);

    let query = {
      status: 'active',
      autoRenew: true,
      endDate: { $lte: cutoffDate }
    };

    // Exclude recently processed subscriptions
    const processedCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    query.$or = [
      { lastRenewalAttempt: { $lt: processedCutoff } },
      { lastRenewalAttempt: { $exists: false } }
    ];

    const subscriptions = await Subscription.find(query)
      .populate('user', 'firstName lastName email')
      .populate('paymentMethod')
      .sort({ endDate: 1 })
      .lean();

    return subscriptions;
  }

  // Process individual subscription renewal
  async processSubscriptionRenewal(subscription, options) {
    const result = {
      renewed: false,
      expired: false,
      notificationSent: false,
      amount: 0
    };

    try {
      // Check if subscription is already expired
      if (subscription.endDate < new Date()) {
        result.expired = true;
        await this.expireSubscription(subscription._id);
        return result;
      }

      // Get pricing for the plan
      const pricing = await this.getPlanPricing(subscription.plan);
      if (!pricing) {
        throw new Error(`Pricing not found for plan: ${subscription.plan}`);
      }

      result.amount = pricing.amount;

      // If dry run, just log what would happen
      if (options.dryRun) {
        logger.info(`DRY RUN: Would renew subscription ${subscription._id} for $${pricing.amount}`);
        result.renewed = true;
        return result;
      }

      // Process payment
      const paymentResult = await this.processRenewalPayment(subscription, pricing);
      
      if (paymentResult.success) {
        // Update subscription
        const newEndDate = this.calculateNewEndDate(subscription.endDate, pricing.duration);
        await this.updateSubscription(subscription._id, newEndDate, pricing.amount);
        
        result.renewed = true;

        // Send confirmation notification
        if (options.sendNotifications) {
          await this.sendRenewalConfirmation(subscription, pricing.amount, newEndDate);
          result.notificationSent = true;
        }

        // Log successful renewal
        await this.logRenewal(subscription.user._id, subscription._id, pricing.amount, 'success');

      } else {
        // Payment failed
        await this.handlePaymentFailure(subscription, paymentResult.error);
        
        // Log failed renewal
        await this.logRenewal(subscription.user._id, subscription._id, pricing.amount, 'failed', paymentResult.error);
      }

      return result;

    } catch (error) {
      logger.error(`Error processing subscription renewal for ${subscription._id}:`, error);
      throw error;
    }
  }

  // Process renewal payment
  async processRenewalPayment(subscription, pricing) {
    try {
      const paymentData = {
        userId: subscription.user._id,
        amount: pricing.amount,
        type: 'subscription',
        description: `Subscription renewal - ${subscription.plan}`,
        paymentMethodId: subscription.paymentMethod?._id,
        metadata: {
          subscriptionId: subscription._id,
          plan: subscription.plan,
          renewal: true
        }
      };

      const payment = await paymentService.processPayment(paymentData);
      
      return {
        success: true,
        paymentId: payment._id,
        transactionId: payment.transactionId
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update subscription with new end date
  async updateSubscription(subscriptionId, newEndDate, amount) {
    await Subscription.findByIdAndUpdate(subscriptionId, {
      endDate: newEndDate,
      lastRenewalAttempt: new Date(),
      lastPaymentAmount: amount,
      lastPaymentDate: new Date()
    });

    logger.info(`Subscription ${subscriptionId} renewed until ${newEndDate}`);
  }

  // Expire subscription
  async expireSubscription(subscriptionId) {
    await Subscription.findByIdAndUpdate(subscriptionId, {
      status: 'expired',
      endDate: new Date()
    });

    logger.info(`Subscription ${subscriptionId} expired`);
  }

  // Handle payment failure
  async handlePaymentFailure(subscription, error) {
    // Update subscription with failure info
    await Subscription.findByIdAndUpdate(subscription._id, {
      lastRenewalAttempt: new Date(),
      renewalFailureReason: error
    });

    // Send failure notification
    await this.sendRenewalFailureNotification(subscription, error);

    // Check if we should retry or cancel
    const failureCount = await this.getRenewalFailureCount(subscription._id);
    if (failureCount >= 3) {
      await this.handleExcessiveFailures(subscription);
    }
  }

  // Get renewal failure count
  async getRenewalFailureCount(subscriptionId) {
    // This would count recent renewal failures
    // For now, return 0 as placeholder
    return 0;
  }

  // Handle excessive renewal failures
  async handleExcessiveFailures(subscription) {
    // Disable auto-renewal after multiple failures
    await Subscription.findByIdAndUpdate(subscription._id, {
      autoRenew: false,
      status: 'suspended'
    });

    await this.sendAutoRenewalDisabledNotification(subscription);
  }

  // Handle expired subscriptions
  async handleExpiredSubscriptions() {
    const result = {
      expired: 0,
      notificationsSent: 0
    };

    const expiredSubscriptions = await Subscription.find({
      status: 'active',
      endDate: { $lt: new Date() }
    })
    .populate('user', 'firstName lastName email')
    .lean();

    for (const subscription of expiredSubscriptions) {
      await this.expireSubscription(subscription._id);
      await this.sendExpirationNotification(subscription);
      
      result.expired++;
      result.notificationsSent++;
    }

    return result;
  }

  // Get plan pricing
  async getPlanPricing(plan) {
    const pricingMap = {
      free: { amount: 0, duration: 'monthly' },
      basic: { amount: 9.99, duration: 'monthly' },
      premium: { amount: 29.99, duration: 'monthly' },
      enterprise: { amount: 99.99, duration: 'monthly' }
    };

    return pricingMap[plan] || null;
  }

  // Calculate new end date
  calculateNewEndDate(currentEndDate, duration) {
    const newEndDate = new Date(currentEndDate);
    
    switch (duration) {
      case 'monthly':
        newEndDate.setMonth(newEndDate.getMonth() + 1);
        break;
      case 'yearly':
        newEndDate.setFullYear(newEndDate.getFullYear() + 1);
        break;
      default:
        newEndDate.setMonth(newEndDate.getMonth() + 1);
    }

    return newEndDate;
  }

  // Send renewal confirmation
  async sendRenewalConfirmation(subscription, amount, newEndDate) {
    const emailData = {
      to: subscription.user.email,
      subject: 'Subscription Renewed Successfully',
      template: 'subscription-renewed',
      data: {
        userName: `${subscription.user.firstName} ${subscription.user.lastName}`,
        plan: subscription.plan,
        amount: amount,
        newEndDate: newEndDate.toLocaleDateString(),
        autoRenew: subscription.autoRenew
      }
    };

    await emailService.sendEmail(emailData);
  }

  // Send renewal failure notification
  async sendRenewalFailureNotification(subscription, error) {
    const emailData = {
      to: subscription.user.email,
      subject: 'Subscription Renewal Failed',
      template: 'renewal-failed',
      data: {
        userName: `${subscription.user.firstName} ${subscription.user.lastName}`,
        plan: subscription.plan,
        error: error,
        endDate: subscription.endDate.toLocaleDateString()
      }
    };

    await emailService.sendEmail(emailData);
  }

  // Send expiration notification
  async sendExpirationNotification(subscription) {
    const emailData = {
      to: subscription.user.email,
      subject: 'Subscription Expired',
      template: 'subscription-expired',
      data: {
        userName: `${subscription.user.firstName} ${subscription.user.lastName}`,
        plan: subscription.plan,
        expiredDate: new Date().toLocaleDateString()
      }
    };

    await emailService.sendEmail(emailData);
  }

  // Send auto-renewal disabled notification
  async sendAutoRenewalDisabledNotification(subscription) {
    const emailData = {
      to: subscription.user.email,
      subject: 'Auto-Renewal Disabled',
      template: 'auto-renewal-disabled',
      data: {
        userName: `${subscription.user.firstName} ${subscription.user.lastName}`,
        plan: subscription.plan
      }
    };

    await emailService.sendEmail(emailData);
  }

  // Log renewal attempt
  async logRenewal(userId, subscriptionId, amount, status, error = null) {
    const logData = {
      user: userId,
      action: 'subscription_renewal',
      resource: 'subscription',
      resourceId: subscriptionId,
      details: {
        amount: amount,
        status: status,
        error: error
      },
      timestamp: new Date()
    };

    await AuditLog.create(logData);
  }

  // Send renewal reminder notifications
  async sendRenewalReminders(daysInAdvance = 7) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() + daysInAdvance);

      const subscriptions = await Subscription.find({
        status: 'active',
        autoRenew: true,
        endDate: { 
          $gte: new Date(),
          $lte: cutoffDate 
        },
        renewalReminderSent: { $ne: true }
      })
      .populate('user', 'firstName lastName email')
      .lean();

      let sentCount = 0;

      for (const subscription of subscriptions) {
        await this.sendRenewalReminder(subscription, daysInAdvance);
        await Subscription.findByIdAndUpdate(subscription._id, {
          renewalReminderSent: true
        });
        sentCount++;
      }

      logger.info(`Sent ${sentCount} renewal reminder notifications`);
      return { sent: sentCount };

    } catch (error) {
      logger.error('Failed to send renewal reminders:', error);
      throw error;
    }
  }

  // Send individual renewal reminder
  async sendRenewalReminder(subscription, daysInAdvance) {
    const emailData = {
      to: subscription.user.email,
      subject: `Subscription Renewing in ${daysInAdvance} Days`,
      template: 'renewal-reminder',
      data: {
        userName: `${subscription.user.firstName} ${subscription.user.lastName}`,
        plan: subscription.plan,
        renewalDate: subscription.endDate.toLocaleDateString(),
        daysInAdvance: daysInAdvance,
        autoRenew: subscription.autoRenew
      }
    };

    await emailService.sendEmail(emailData);
  }

  // Get subscription statistics
  async getSubscriptionStats() {
    try {
      const stats = {
        total: await Subscription.countDocuments(),
        active: await Subscription.countDocuments({ status: 'active' }),
        expired: await Subscription.countDocuments({ status: 'expired' }),
        cancelled: await Subscription.countDocuments({ status: 'cancelled' }),
        suspended: await Subscription.countDocuments({ status: 'suspended' }),
        byPlan: {},
        renewingSoon: 0,
        expiringSoon: 0
      };

      // Stats by plan
      const plans = ['free', 'basic', 'premium', 'enterprise'];
      for (const plan of plans) {
        stats.byPlan[plan] = await Subscription.countDocuments({ 
          plan: plan, 
          status: 'active' 
        });
      }

      // Renewing soon (next 7 days)
      const renewingCutoff = new Date();
      renewingCutoff.setDate(renewingCutoff.getDate() + 7);
      stats.renewingSoon = await Subscription.countDocuments({
        status: 'active',
        autoRenew: true,
        endDate: { $lte: renewingCutoff }
      });

      // Expiring soon (next 7 days)
      const expiringCutoff = new Date();
      expiringCutoff.setDate(expiringCutoff.getDate() + 7);
      stats.expiringSoon = await Subscription.countDocuments({
        status: 'active',
        endDate: { $lte: expiringCutoff }
      });

      return stats;

    } catch (error) {
      logger.error('Failed to get subscription statistics:', error);
      throw error;
    }
  }

  // Schedule subscription renewal job
  async scheduleRenewalJob(cronExpression = '0 2 * * *') {
    try {
      const cron = require('node-cron');
      
      // Schedule renewal job (runs daily at 2 AM)
      cron.schedule(cronExpression, async () => {
        logger.info('Running scheduled subscription renewal job');
        await this.runSubscriptionRenewal();
      });

      // Schedule renewal reminders (runs daily at 9 AM)
      cron.schedule('0 9 * * *', async () => {
        logger.info('Running scheduled renewal reminder job');
        await this.sendRenewalReminders();
      });

      logger.info('Subscription renewal jobs scheduled successfully');
    } catch (error) {
      logger.error('Failed to schedule subscription renewal jobs:', error);
    }
  }
}

// Create singleton instance
const subscriptionRenewalJob = new SubscriptionRenewalJob();

module.exports = subscriptionRenewalJob;