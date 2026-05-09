const mongoose = require('mongoose');
const { logger } = require('../config/logger');
const emailService = require('../services/emailService');

// Models
const User = require('../models/User');
const Property = require('../models/Property');
const Application = require('../models/Application');
const Payment = require('../models/Payment');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const Notification = require('../models/Notification');

class EmailDigestJob {
  constructor() {
    this.isRunning = false;
  }

  // Main email digest function
  async runEmailDigest(options = {}) {
    if (this.isRunning) {
      logger.warn('Email digest job is already running');
      return { success: false, message: 'Email digest already in progress' };
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      logger.info('Starting email digest job');
      
      const digestOptions = {
        frequency: options.frequency || 'daily', // daily, weekly, monthly
        includeNewProperties: options.includeNewProperties !== false,
        includeApplicationUpdates: options.includeApplicationUpdates !== false,
        includePaymentReminders: options.includePaymentReminders !== false,
        includeMaintenanceUpdates: options.includeMaintenanceUpdates !== false,
        sendToInactiveUsers: options.sendToInactiveUsers || false
      };

      const results = {
        sent: 0,
        failed: 0,
        skipped: 0,
        totalUsers: 0,
        digestContent: {}
      };

      // Get users who should receive digest
      const users = await this.getDigestUsers(digestOptions);
      results.totalUsers = users.length;

      logger.info(`Found ${users.length} users for email digest`);

      // Generate digest content
      const digestContent = await this.generateDigestContent(digestOptions);
      results.digestContent = digestContent;

      // Send digest to each user
      for (const user of users) {
        try {
          const personalizedContent = await this.personalizeDigest(user, digestContent);
          await emailService.sendEmailDigest(user.email, personalizedContent);
          results.sent++;
          
          // Log digest sent for user
          await this.logDigestSent(user._id, digestOptions.frequency);
          
          logger.info(`Email digest sent to user: ${user.email}`);
        } catch (error) {
          logger.error(`Failed to send digest to user ${user.email}:`, error);
          results.failed++;
        }
      }

      const duration = Date.now() - startTime;
      logger.info(`Email digest job completed in ${duration}ms. Sent: ${results.sent}, Failed: ${results.failed}, Skipped: ${results.skipped}`);

      return {
        success: true,
        results,
        duration,
        message: `Email digest completed. Sent: ${results.sent}, Failed: ${results.failed}`
      };

    } catch (error) {
      logger.error('Email digest job failed:', error);
      return {
        success: false,
        error: error.message,
        message: 'Email digest job failed'
      };
    } finally {
      this.isRunning = false;
    }
  }

  // Get users who should receive email digest
  async getDigestUsers(options) {
    const cutoffDate = this.getCutoffDate(options.frequency);
    
    let query = {
      verified: true,
      status: 'active',
      'preferences.emailAlerts': true
    };

    // Add frequency preference filter
    if (options.frequency === 'daily') {
      query['preferences.digestFrequency'] = { $in: ['daily', 'weekly', 'monthly'] };
    } else if (options.frequency === 'weekly') {
      query['preferences.digestFrequency'] = { $in: ['weekly', 'monthly'] };
    } else if (options.frequency === 'monthly') {
      query['preferences.digestFrequency'] = 'monthly';
    }

    // Exclude users who recently received digest
    query['lastDigestSent'] = { $lt: cutoffDate };

    // Include inactive users if requested
    if (!options.sendToInactiveUsers) {
      const activeCutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days
      query.lastLoginAt = { $gt: activeCutoff };
    }

    const users = await User.find(query)
      .select('email firstName lastName role preferences lastDigestSent lastLoginAt')
      .lean();

    return users;
  }

  // Generate digest content
  async generateDigestContent(options) {
    const content = {};

    const timeRange = this.getTimeRange(options.frequency);

    // New properties
    if (options.includeNewProperties) {
      content.newProperties = await Property.find({
        createdAt: { $gte: timeRange.start, $lt: timeRange.end },
        status: 'active'
      })
      .select('title type price city state createdAt')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    }

    // Application updates
    if (options.includeApplicationUpdates) {
      content.applicationUpdates = await Application.find({
        updatedAt: { $gte: timeRange.start, $lt: timeRange.end },
        status: { $in: ['approved', 'rejected'] }
      })
      .populate('property', 'title')
      .populate('applicant', 'firstName lastName')
      .select('status property applicant updatedAt')
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean();
    }

    // Payment reminders
    if (options.includePaymentReminders) {
      content.paymentReminders = await Payment.find({
        dueDate: { 
          $gte: timeRange.start, 
          $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
        },
        status: 'pending'
      })
      .populate('payer', 'firstName lastName email')
      .populate('application', 'property')
      .select('amount dueDate payer application')
      .sort({ dueDate: 1 })
      .limit(10)
      .lean();
    }

    // Maintenance updates
    if (options.includeMaintenanceUpdates) {
      content.maintenanceUpdates = await MaintenanceRequest.find({
        updatedAt: { $gte: timeRange.start, $lt: timeRange.end },
        status: { $in: ['resolved', 'in_progress'] }
      })
      .populate('property', 'title')
      .populate('tenant', 'firstName lastName')
      .select('title status property tenant updatedAt')
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean();
    }

    // System statistics
    content.statistics = await this.getSystemStatistics();

    return content;
  }

  // Personalize digest content for specific user
  async personalizeDigest(user, digestContent) {
    const personalized = {
      userName: `${user.firstName} ${user.lastName}`,
      userRole: user.role,
      frequency: 'daily',
      date: new Date().toLocaleDateString(),
      sections: {}
    };

    // Personalize content based on user role
    if (user.role === 'tenant') {
      personalized.sections.relevantProperties = await this.getRelevantProperties(user._id);
      personalized.sections.myApplications = await this.getUserApplications(user._id);
      personalized.sections.upcomingPayments = await this.getUserUpcomingPayments(user._id);
    } else if (user.role === 'agent' || user.role === 'landlord') {
      personalized.sections.myProperties = await this.getUserProperties(user._id);
      personalized.sections.propertyApplications = await this.getPropertyApplications(user._id);
      personalized.sections.maintenanceRequests = await this.getUserMaintenanceRequests(user._id);
    } else if (user.role === 'admin' || user.role === 'super_admin') {
      personalized.sections = digestContent; // Admins get everything
    }

    // Add general content
    personalized.sections.systemUpdates = digestContent.applicationUpdates?.slice(0, 5) || [];
    personalized.sections.newListings = digestContent.newProperties?.slice(0, 5) || [];

    return personalized;
  }

  // Get relevant properties for user
  async getRelevantProperties(userId) {
    // This would implement property recommendation logic
    return Property.find({ status: 'active' })
      .select('title type price city state images')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
  }

  // Get user's applications
  async getUserApplications(userId) {
    return Application.find({ applicant: userId })
      .populate('property', 'title')
      .select('status property createdAt updatedAt')
      .sort({ updatedAt: -1 })
      .limit(5)
      .lean();
  }

  // Get user's upcoming payments
  async getUserUpcomingPayments(userId) {
    return Payment.find({
      payer: userId,
      dueDate: { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }, // Next 30 days
      status: 'pending'
    })
    .populate('application', 'property')
    .select('amount dueDate application')
    .sort({ dueDate: 1 })
    .limit(5)
    .lean();
  }

  // Get user's properties
  async getUserProperties(userId) {
    return Property.find({ owner: userId })
      .select('title status price createdAt')
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean();
  }

  // Get applications for user's properties
  async getPropertyApplications(userId) {
    const userProperties = await Property.find({ owner: userId }).select('_id').lean();
    const propertyIds = userProperties.map(p => p._id);

    return Application.find({
      property: { $in: propertyIds },
      updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    })
    .populate('property', 'title')
    .populate('applicant', 'firstName lastName email')
    .select('status property applicant createdAt updatedAt')
    .sort({ updatedAt: -1 })
    .limit(10)
    .lean();
  }

  // Get maintenance requests for user's properties
  async getUserMaintenanceRequests(userId) {
    const userProperties = await Property.find({ owner: userId }).select('_id').lean();
    const propertyIds = userProperties.map(p => p._id);

    return MaintenanceRequest.find({
      property: { $in: propertyIds },
      updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    })
    .populate('property', 'title')
    .populate('tenant', 'firstName lastName')
    .select('title status property tenant updatedAt')
    .sort({ updatedAt: -1 })
    .limit(10)
    .lean();
  }

  // Get system statistics
  async getSystemStatistics() {
    const stats = await Promise.all([
      User.countDocuments({ verified: true }),
      Property.countDocuments({ status: 'active' }),
      Application.countDocuments({ status: 'pending' }),
      Payment.countDocuments({ status: 'pending' }),
      MaintenanceRequest.countDocuments({ status: 'pending' })
    ]);

    return {
      totalUsers: stats[0],
      activeProperties: stats[1],
      pendingApplications: stats[2],
      pendingPayments: stats[3],
      pendingMaintenance: stats[4]
    };
  }

  // Get cutoff date based on frequency
  getCutoffDate(frequency) {
    const now = new Date();
    
    switch (frequency) {
      case 'daily':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
      case 'weekly':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
      case 'monthly':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      default:
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
  }

  // Get time range for content
  getTimeRange(frequency) {
    const end = new Date();
    const start = this.getCutoffDate(frequency);
    
    return { start, end };
  }

  // Log that digest was sent to user
  async logDigestSent(userId, frequency) {
    await User.findByIdAndUpdate(userId, {
      lastDigestSent: new Date(),
      $set: { 'preferences.lastDigestFrequency': frequency }
    });
  }

  // Schedule email digest to run periodically
  async scheduleDigest(cronExpressions = {}) {
    try {
      const cron = require('node-cron');
      
      const schedules = {
        daily: cronExpressions.daily || '0 8 * * *', // 8 AM daily
        weekly: cronExpressions.weekly || '0 8 * * 1', // 8 AM every Monday
        monthly: cronExpressions.monthly || '0 8 1 * *' // 8 AM on 1st of month
      };

      // Schedule daily digest
      if (schedules.daily) {
        cron.schedule(schedules.daily, async () => {
          logger.info('Running scheduled daily email digest');
          await this.runEmailDigest({ frequency: 'daily' });
        });
      }

      // Schedule weekly digest
      if (schedules.weekly) {
        cron.schedule(schedules.weekly, async () => {
          logger.info('Running scheduled weekly email digest');
          await this.runEmailDigest({ frequency: 'weekly' });
        });
      }

      // Schedule monthly digest
      if (schedules.monthly) {
        cron.schedule(schedules.monthly, async () => {
          logger.info('Running scheduled monthly email digest');
          await this.runEmailDigest({ frequency: 'monthly' });
        });
      }

      logger.info('Email digest jobs scheduled successfully');
    } catch (error) {
      logger.error('Failed to schedule email digest jobs:', error);
    }
  }

  // Get digest statistics
  async getDigestStats() {
    try {
      const stats = {
        users: {
          total: await User.countDocuments({ verified: true, 'preferences.emailAlerts': true }),
          daily: await User.countDocuments({ 'preferences.digestFrequency': 'daily' }),
          weekly: await User.countDocuments({ 'preferences.digestFrequency': 'weekly' }),
          monthly: await User.countDocuments({ 'preferences.digestFrequency': 'monthly' })
        },
        lastSent: {
          daily: await this.getLastDigestSent('daily'),
          weekly: await this.getLastDigestSent('weekly'),
          monthly: await this.getLastDigestSent('monthly')
        }
      };

      return stats;
    } catch (error) {
      logger.error('Failed to get digest statistics:', error);
      throw error;
    }
  }

  // Get last digest sent time
  async getLastDigestSent(frequency) {
    const user = await User.findOne({
      'preferences.lastDigestFrequency': frequency,
      lastDigestSent: { $exists: true }
    })
    .select('lastDigestSent')
    .sort({ lastDigestSent: -1 })
    .lean();

    return user?.lastDigestSent || null;
  }
}

// Create singleton instance
const emailDigestJob = new EmailDigestJob();

module.exports = emailDigestJob;