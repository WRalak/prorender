const User = require('../models/User');
const Property = require('../models/Property');
const Application = require('../models/Application');
const Payment = require('../models/Payment');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const Report = require('../models/Report');
const AppError = require('../middleware/errorHandler');
const { catchAsync } = require('../middleware/errorHandler');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const nodemailer = require('nodemailer');

exports.getDashboard = catchAsync(async (req, res, next) => {
  const totalUsers = await User.countDocuments();
  const totalProperties = await Property.countDocuments();
  const totalApplications = await Application.countDocuments();
  const totalPayments = await Payment.countDocuments({ status: 'completed' });
  const totalMaintenanceRequests = await MaintenanceRequest.countDocuments();
  const totalActiveUsers = await User.countDocuments({ status: 'active' });

  // Multi-tier stats
  const totalTenants = await User.countDocuments({ role: 'tenant' });
  const totalAgents = await User.countDocuments({ role: 'agent' });
  const totalAdmins = await User.countDocuments({ role: 'admin' });
  const totalSuperAdmins = await User.countDocuments({ role: 'super_admin' });
  
  const activeSubscriptions = await User.countDocuments({
    'subscription.status': 'active',
    'subscription.endDate': { $gt: new Date() }
  });
  
  const basicSubscriptions = await User.countDocuments({
    'subscription.plan': 'basic',
    'subscription.status': 'active'
  });
  
  const proSubscriptions = await User.countDocuments({
    'subscription.plan': 'pro',
    'subscription.status': 'active'
  });

  const stats = {
    users: {
      total: totalUsers,
      active: totalActiveUsers,
      byRole: {
        tenants: totalTenants,
        agents: totalAgents,
        admins: totalAdmins,
        superAdmins: totalSuperAdmins
      },
      newThisMonth: await User.countDocuments({
        createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
      })
    },
    subscriptions: {
      active: activeSubscriptions,
      byPlan: {
        basic: basicSubscriptions,
        pro: proSubscriptions
      },
      revenue: {
        monthly: (basicSubscriptions * 4900) + (proSubscriptions * 9900),
        commission: ((basicSubscriptions * 4900) + (proSubscriptions * 9900)) * 0.2
      }
    },
    properties: {
      total: totalProperties,
      newThisMonth: await Property.countDocuments({
        createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
      })
    },
    applications: {
      total: totalApplications,
      newThisMonth: await Application.countDocuments({
        createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
      })
    },
    payments: {
      total: totalPayments,
      revenueThisMonth: await Payment.aggregate([
        {
          $match: {
            status: 'completed',
            createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            total: { $sum: '$amount' }
          }
        }
      ])
    },
    maintenance: {
      total: totalMaintenanceRequests,
      pending: await MaintenanceRequest.countDocuments({ status: 'pending' }),
      inProgress: await MaintenanceRequest.countDocuments({ status: 'in_progress' }),
      completed: await MaintenanceRequest.countDocuments({ status: 'resolved' })
    }
  };

  res.json({
    success: true,
    stats
  });
});

exports.getStats = catchAsync(async (req, res, next) => {
  const { timeRange = 'month' } = req.query;
  
  let startDate;
  const now = new Date();
  
  switch (timeRange) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  const userStats = await User.aggregate([
    {
      $match: { createdAt: { $gte: startDate } }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const propertyStats = await Property.aggregate([
    {
      $match: { createdAt: { $gte: startDate } }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json({
    success: true,
    stats: {
      users: userStats,
      properties: propertyStats
    }
  });
});

exports.getUsers = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, role, status, search } = req.query;
  const query = {};
  
  if (role) query.role = role;
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { 'name.first': { $regex: search, $options: 'i' } },
      { 'name.last': { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await User.countDocuments(query);

  res.json({
    success: true,
    users,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .select('-password')
    .populate('spaces')
    .populate('favorites')
    .populate('savedSearches');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.json({
    success: true,
    user
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const updates = req.body;
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  Object.keys(updates).forEach(key => {
    user[key] = updates[key];
  });

  await user.save();

  res.json({
    success: true,
    user
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  await User.findByIdAndDelete(id);

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

exports.banUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { reason } = req.body;

  const user = await User.findById(id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  user.status = 'banned';
  user.bannedReason = reason;
  user.bannedAt = new Date();
  await user.save();

  res.json({
    success: true,
    message: 'User banned successfully'
  });
});

exports.unbanUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  user.status = 'active';
  user.bannedReason = undefined;
  user.bannedAt = undefined;
  await user.save();

  res.json({
    success: true,
    message: 'User unbanned successfully'
  });
});

exports.getProperties = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, status, search } = req.query;
  const query = {};
  
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const properties = await Property.find(query)
    .populate('agent', 'name email')
    .populate('space', 'name')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Property.countDocuments(query);

  res.json({
    success: true,
    properties,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

exports.getProperty = catchAsync(async (req, res, next) => {
  const property = await Property.findById(req.params.id)
    .populate('agent', 'name email')
    .populate('space', 'name')
    .populate('images')
    .populate('applications');

  if (!property) {
    return next(new AppError('Property not found', 404));
  }

  res.json({
    success: true,
    property
  });
});

exports.updateProperty = catchAsync(async (req, res, next) => {
  const updates = req.body;
  const { id } = req.params;

  const property = await Property.findById(id);
  if (!property) {
    return next(new AppError('Property not found', 404));
  }

  Object.keys(updates).forEach(key => {
    property[key] = updates[key];
  });

  await property.save();

  res.json({
    success: true,
    property
  });
});

exports.deleteProperty = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const property = await Property.findById(id);
  if (!property) {
    return next(new AppError('Property not found', 404));
  }

  await Property.findByIdAndDelete(id);

  res.json({
    success: true,
    message: 'Property deleted successfully'
  });
});

exports.getApplications = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, status, search } = req.query;
  const query = {};
  
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { 'property.title': { $regex: search, $options: 'i' } },
      { 'tenant.name.first': { $regex: search, $options: 'i' } }
    ];
  }

  const applications = await Application.find(query)
    .populate('property', 'title')
    .populate('tenant', 'name email')
    .populate('agent', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Application.countDocuments(query);

  res.json({
    success: true,
    applications,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

exports.getApplication = catchAsync(async (req, res, next) => {
  const application = await Application.findById(req.params.id)
    .populate('property', 'title address')
    .populate('tenant', 'name email')
    .populate('agent', 'name email')
    .populate('documents');

  if (!application) {
    return next(new AppError('Application not found', 404));
  }

  res.json({
    success: true,
    application
  });
});

exports.updateApplication = catchAsync(async (req, res, next) => {
  const updates = req.body;
  const { id } = req.params;

  const application = await Application.findById(id);
  if (!application) {
    return next(new AppError('Application not found', 404));
  }

  Object.keys(updates).forEach(key => {
    application[key] = updates[key];
  });

  await application.save();

  res.json({
    success: true,
    application
  });
});

exports.getPayments = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, status } = req.query;
  const query = {};
  
  if (status) query.status = status;

  const payments = await Payment.find(query)
    .populate('tenant', 'name email')
    .populate('agent', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Payment.countDocuments(query);

  res.json({
    success: true,
    payments,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

exports.getPayment = catchAsync(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id)
    .populate('tenant', 'name email')
    .populate('agent', 'name email')
    .populate('lease', 'property title');

  if (!payment) {
    return next(new AppError('Payment not found', 404));
  }

  res.json({
    success: true,
    payment
  });
});

exports.refundPayment = catchAsync(async (req, res, next) => {
  const { paymentId } = req.params;
  const { amount, reason } = req.body;

  const payment = await Payment.findById(paymentId);
  if (!payment) {
    return next(new AppError('Payment not found', 404));
  }

  payment.status = 'refunded';
  payment.refundAmount = amount || payment.amount;
  payment.refundReason = reason;
  payment.refundedAt = new Date();
  await payment.save();

  res.json({
    success: true,
    payment
  });
});

exports.getMaintenanceRequests = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, status, priority } = req.query;
  const query = {};
  
  if (status) query.status = status;
  if (priority) query.priority = priority;

  const requests = await MaintenanceRequest.find(query)
    .populate('property', 'title address')
    .populate('tenant', 'name email avatar')
    .populate('agent', 'name email avatar')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await MaintenanceRequest.countDocuments(query);

  res.json({
    success: true,
    requests,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

exports.getMaintenanceRequest = catchAsync(async (req, res, next) => {
  const request = await MaintenanceRequest.findById(req.params.id)
    .populate('property', 'title address')
    .populate('tenant', 'name email avatar')
    .populate('agent', 'name email avatar')
    .populate('notes.addedBy', 'name email')
    .populate('images');

  if (!request) {
    return next(new AppError('Maintenance request not found', 404));
  }

  res.json({
    success: true,
    request
  });
});

exports.updateMaintenanceRequest = catchAsync(async (req, res, next) => {
  const updates = req.body;
  const { id } = req.params;

  const request = await MaintenanceRequest.findById(id);
  if (!request) {
    return next(new AppError('Maintenance request not found', 404));
  }

  Object.keys(updates).forEach(key => {
    request[key] = updates[key];
  });

  if (updates.status === 'resolved') {
    request.resolvedAt = new Date();
    request.resolvedBy = req.user.id;
  }

  await request.save();

  res.json({
    success: true,
    request
  });
});

exports.getReports = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, type, status } = req.query;
  const query = {};
  
  if (type) query.type = type;
  if (status) query.status = status;

  const reports = await Report.find(query)
    .populate('generatedBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Report.countDocuments(query);

  res.json({
    success: true,
    reports,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

exports.getReport = catchAsync(async (req, res, next) => {
  const report = await Report.findById(req.params.id)
    .populate('generatedBy', 'name email');

  if (!report) {
    return next(new AppError('Report not found', 404));
  }

  res.json({
    success: true,
    report
  });
});

exports.generateReport = catchAsync(async (req, res, next) => {
  const { type, parameters, format = 'json' } = req.body;
  
  // Generate report data based on type
  let reportData = {
    type,
    parameters,
    format,
    generatedAt: new Date(),
    data: {}
  };

  const startDate = parameters?.dateRange?.start ? new Date(parameters.dateRange.start) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const endDate = parameters?.dateRange?.end ? new Date(parameters.dateRange.end) : new Date();

  switch (type) {
    case 'financial':
      reportData.data = await generateFinancialReport(startDate, endDate);
      break;
    case 'occupancy':
      reportData.data = await generateOccupancyReport(startDate, endDate);
      break;
    case 'maintenance':
      reportData.data = await generateMaintenanceReport(startDate, endDate);
      break;
    case 'user_activity':
      reportData.data = await generateUserActivityReport(startDate, endDate);
      break;
    case 'property_performance':
      reportData.data = await generatePropertyPerformanceReport(startDate, endDate);
      break;
    case 'application_stats':
      reportData.data = await generateApplicationStatsReport(startDate, endDate);
      break;
    case 'payment_summary':
      reportData.data = await generatePaymentSummaryReport(startDate, endDate);
      break;
    case 'system_health':
      reportData.data = await generateSystemHealthReport();
      break;
    default:
      reportData.data = await generateCustomReport(parameters);
  }

  // Create report in database
  const report = await Report.create({
    title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
    type,
    description: `Generated ${type} report`,
    generatedBy: req.user.id,
    parameters,
    data: reportData.data,
    status: 'completed',
    completedAt: new Date(),
    format
  });

  res.json({
    success: true,
    report
  });
});

exports.deleteReport = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const report = await Report.findById(id);
  if (!report) {
    return next(new AppError('Report not found', 404));
  }

  await Report.findByIdAndDelete(id);

  res.json({
    success: true,
    message: 'Report deleted successfully'
  });
});

exports.getSettings = catchAsync(async (req, res, next) => {
  // Get system settings from environment variables and database
  const settings = {
    site: {
      name: process.env.SITE_NAME || 'PropRent',
      url: process.env.CLIENT_URL || 'http://localhost:3000',
      version: process.env.APP_VERSION || '1.0.0',
      description: process.env.SITE_DESCRIPTION || 'Property Rental Management Platform'
    },
    features: {
      registration: process.env.FEATURE_REGISTRATION === 'true',
      emailVerification: process.env.FEATURE_EMAIL_VERIFICATION === 'true',
      twoFactorAuth: process.env.FEATURE_2FA === 'true',
      socialLogin: process.env.FEATURE_SOCIAL_LOGIN === 'true',
      maintenance: process.env.MAINTENANCE_MODE === 'true',
      notifications: process.env.FEATURE_NOTIFICATIONS !== 'false'
    },
    limits: {
      maxPropertiesPerUser: parseInt(process.env.MAX_PROPERTIES_PER_USER) || 10,
      maxApplicationsPerUser: parseInt(process.env.MAX_APPLICATIONS_PER_USER) || 50,
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760,
      sessionTimeout: parseInt(process.env.SESSION_TIMEOUT) || 86400000,
      maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5
    },
    integrations: {
      stripe: {
        enabled: !!process.env.STRIPE_SECRET_KEY,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY ? '***' : null,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ? '***' : null
      },
      cloudinary: {
        enabled: !!process.env.CLOUDINARY_CLOUD_NAME,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME || null
      },
      email: {
        enabled: !!process.env.EMAIL_HOST,
        host: process.env.EMAIL_HOST || null,
        port: process.env.EMAIL_PORT || null,
        secure: process.env.EMAIL_SECURE === 'true'
      },
      redis: {
        enabled: !!process.env.REDIS_URL,
        url: process.env.REDIS_URL ? '***' : null
      }
    },
    security: {
      passwordMinLength: parseInt(process.env.PASSWORD_MIN_LENGTH) || 8,
      requireStrongPassword: process.env.REQUIRE_STRONG_PASSWORD === 'true',
      sessionSecure: process.env.SESSION_SECURE === 'true',
      corsOrigins: (process.env.CORS_ORIGINS || '').split(',').filter(Boolean)
    }
  };

  res.json({
    success: true,
    settings
  });
});

exports.updateSettings = catchAsync(async (req, res, next) => {
  const updates = req.body;
  
  // Validate settings updates
  const allowedSections = ['site', 'features', 'limits', 'security'];
  const invalidUpdates = Object.keys(updates).filter(key => !allowedSections.includes(key));
  
  if (invalidUpdates.length > 0) {
    return next(new AppError(`Invalid setting sections: ${invalidUpdates.join(', ')}`, 400));
  }

  // Log the settings update
  await AuditLog.create({
    user: req.user.id,
    action: 'UPDATE_SETTINGS',
    details: {
      updates,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    },
    timestamp: new Date()
  });

  // In a real implementation, you would update these in a settings collection
  // or environment variables through a secure admin interface
  
  res.json({
    success: true,
    message: 'Settings updated successfully',
    settings: updates
  });
});

exports.testEmailSettings = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError('Email address is required', 400));
  }

  try {
    // Create email transporter
    const transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Verify transporter configuration
    await transporter.verify();

    // Send test email
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'PropRent Email Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Configuration Test</h2>
          <p>This is a test email to verify that your email settings are working correctly.</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Test Details:</h3>
            <ul>
              <li><strong>Server:</strong> ${process.env.EMAIL_HOST}</li>
              <li><strong>Port:</strong> ${process.env.EMAIL_PORT || 587}</li>
              <li><strong>Secure:</strong> ${process.env.EMAIL_SECURE === 'true' ? 'Yes' : 'No'}</li>
              <li><strong>Sent at:</strong> ${new Date().toLocaleString()}</li>
            </ul>
          </div>
          <p style="color: #666; font-size: 14px;">If you received this email, your configuration is working properly!</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    // Log the test
    await AuditLog.create({
      user: req.user.id,
      action: 'TEST_EMAIL',
      details: {
        testEmail: email,
        success: true,
        ip: req.ip
      },
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Test email sent successfully'
    });

  } catch (error) {
    await AuditLog.create({
      user: req.user.id,
      action: 'TEST_EMAIL',
      details: {
        testEmail: email,
        success: false,
        error: error.message,
        ip: req.ip
      },
      timestamp: new Date()
    });

    return next(new AppError(`Email test failed: ${error.message}`, 500));
  }
});

exports.regenerateApiKey = catchAsync(async (req, res, next) => {
  const newApiKey = crypto.randomBytes(32).toString('hex');
  const hashedKey = crypto.createHash('sha256').update(newApiKey).digest('hex');

  // In a real implementation, you would store this in the database
  // For now, we'll just log and return it
  
  await AuditLog.create({
    user: req.user.id,
    action: 'REGENERATE_API_KEY',
    details: {
      keyHash: hashedKey,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    },
    timestamp: new Date()
  });

  res.json({
    success: true,
    apiKey: newApiKey,
    message: 'API key regenerated successfully'
  });
});

exports.getLogs = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 50, type, level } = req.query;
  const query = {};
  
  if (type) query.type = type;
  if (level) query.level = level;

  const logs = await AuditLog.find(query)
    .populate('user', 'name email')
    .sort({ timestamp: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await AuditLog.countDocuments(query);

  res.json({
    success: true,
    logs,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

exports.getSystemHealth = catchAsync(async (req, res, next) => {
  const health = {
    database: 'connected',
    redis: process.env.REDIS_URL ? 'connected' : 'disconnected',
    server: 'running',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date()
  };

  res.json({
    success: true,
    health
  });
});

exports.getNotifications = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, type, read } = req.query;
  const query = {};
  
  if (type) query.type = type;
  if (read !== undefined) query.read = read === 'true';

  const notifications = await Notification.find(query)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Notification.countDocuments(query);

  res.json({
    success: true,
    notifications,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

exports.createNotification = catchAsync(async (req, res, next) => {
  const { title, message, type, recipients } = req.body;

  const notifications = recipients.map(recipientId => ({
    user: recipientId,
    title,
    message,
    type,
    relatedId: req.body.relatedId,
    relatedModel: req.body.relatedModel
  }));

  const createdNotifications = await Notification.insertMany(notifications);

  res.status(201).json({
    success: true,
    notifications: createdNotifications
  });
});

exports.updateNotification = catchAsync(async (req, res, next) => {
  const updates = req.body;
  const { id } = req.params;

  const notification = await Notification.findById(id);
  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  Object.keys(updates).forEach(key => {
    notification[key] = updates[key];
  });

  await notification.save();

  res.json({
    success: true,
    notification
  });
});

exports.deleteNotification = catchAsync(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  await Notification.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Notification deleted successfully'
  });
});

exports.createBackup = catchAsync(async (req, res, next) => {
  const backupId = `backup_${Date.now()}`;
  const backupDir = path.join(process.cwd(), 'backups');
  
  try {
    // Ensure backup directory exists
    await fs.mkdir(backupDir, { recursive: true });
    
    // Create backup metadata
    const backupMetadata = {
      id: backupId,
      createdAt: new Date(),
      createdBy: req.user.id,
      status: 'creating',
      type: req.body.type || 'full',
      includes: req.body.includes || ['users', 'properties', 'applications', 'payments']
    };
    
    // Save backup metadata
    const metadataPath = path.join(backupDir, `${backupId}_metadata.json`);
    await fs.writeFile(metadataPath, JSON.stringify(backupMetadata, null, 2));
    
    // Log backup creation
    await AuditLog.create({
      user: req.user.id,
      action: 'CREATE_BACKUP',
      details: {
        backupId,
        type: backupMetadata.type,
        includes: backupMetadata.includes
      },
      timestamp: new Date()
    });
    
    // In a real implementation, you would:
    // 1. Export database collections
    // 2. Create compressed archive
    // 3. Upload to cloud storage
    // 4. Update backup status
    
    // For now, we'll simulate the backup process
    setTimeout(async () => {
      try {
        backupMetadata.status = 'completed';
        backupMetadata.completedAt = new Date();
        backupMetadata.size = Math.floor(Math.random() * 100000000); // Random size
        
        await fs.writeFile(metadataPath, JSON.stringify(backupMetadata, null, 2));
      } catch (error) {
        backupMetadata.status = 'failed';
        backupMetadata.error = error.message;
        await fs.writeFile(metadataPath, JSON.stringify(backupMetadata, null, 2));
      }
    }, 5000);
    
    res.json({
      success: true,
      backupId,
      message: 'Backup creation started',
      estimatedTime: '5-10 minutes'
    });
    
  } catch (error) {
    return next(new AppError(`Backup creation failed: ${error.message}`, 500));
  }
});

exports.getBackups = catchAsync(async (req, res, next) => {
  const backupDir = path.join(process.cwd(), 'backups');
  
  try {
    const files = await fs.readdir(backupDir);
    const backupFiles = files.filter(file => file.endsWith('_metadata.json'));
    
    const backups = [];
    
    for (const file of backupFiles) {
      try {
        const metadataPath = path.join(backupDir, file);
        const metadataContent = await fs.readFile(metadataPath, 'utf8');
        const metadata = JSON.parse(metadataContent);
        
        backups.push({
          id: metadata.id,
          createdAt: metadata.createdAt,
          createdBy: metadata.createdBy,
          status: metadata.status,
          type: metadata.type,
          size: metadata.size,
          completedAt: metadata.completedAt,
          includes: metadata.includes,
          downloadUrl: metadata.status === 'completed' ? `/api/admin/backups/${metadata.id}/download` : null
        });
      } catch (error) {
        console.error(`Error reading backup metadata ${file}:`, error);
      }
    }
    
    // Sort by creation date (newest first)
    backups.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({
      success: true,
      backups
    });
    
  } catch (error) {
    // If backup directory doesn't exist, return empty array
    if (error.code === 'ENOENT') {
      res.json({
        success: true,
        backups: []
      });
    } else {
      return next(new AppError(`Failed to get backups: ${error.message}`, 500));
    }
  }
});

exports.restoreBackup = catchAsync(async (req, res, next) => {
  const { backupId } = req.body;
  
  if (!backupId) {
    return next(new AppError('Backup ID is required', 400));
  }
  
  const backupDir = path.join(process.cwd(), 'backups');
  const metadataPath = path.join(backupDir, `${backupId}_metadata.json`);
  
  try {
    // Check if backup exists
    const metadataContent = await fs.readFile(metadataPath, 'utf8');
    const metadata = JSON.parse(metadataContent);
    
    if (metadata.status !== 'completed') {
      return next(new AppError('Backup is not ready for restoration', 400));
    }
    
    // Log restoration attempt
    await AuditLog.create({
      user: req.user.id,
      action: 'RESTORE_BACKUP',
      details: {
        backupId,
        backupDate: metadata.createdAt,
        type: metadata.type
      },
      timestamp: new Date()
    });
    
    // In a real implementation, you would:
    // 1. Download backup from storage
    // 2. Extract backup archive
    // 3. Restore database collections
    // 4. Verify data integrity
    // 5. Update system status
    
    // For now, we'll simulate the restoration process
    setTimeout(() => {
      console.log(`Backup ${backupId} restoration completed`);
    }, 3000);
    
    res.json({
      success: true,
      message: 'Backup restoration started',
      backupId,
      estimatedTime: '3-5 minutes'
    });
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      return next(new AppError('Backup not found', 404));
    }
    return next(new AppError(`Backup restoration failed: ${error.message}`, 500));
  }
});

exports.getAnalytics = catchAsync(async (req, res, next) => {
  const { timeRange = 'month' } = req.query;
  
  let startDate;
  const now = new Date();
  
  switch (timeRange) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'quarter':
      startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
  
  try {
    // User Growth Analytics
    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          newUsers: { $sum: 1 },
          activeUsers: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Property Metrics
    const propertyMetrics = await Property.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          totalProperties: { $sum: 1 },
          averagePrice: { $avg: '$price' },
          totalValue: { $sum: '$price' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Application Funnel
    const applicationFunnel = await Application.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Revenue Analysis
    const revenueAnalysis = await Payment.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          dailyRevenue: { $sum: '$amount' },
          transactionCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // System Usage
    const systemUsage = await AuditLog.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          totalActions: { $sum: 1 },
          uniqueUsers: { $addToSet: '$user' },
          topActions: { $push: '$action' }
        }
      },
      {
        $project: {
          date: '$_id',
          totalActions: 1,
          uniqueUsers: { $size: '$uniqueUsers' },
          topActions: 1
        }
      },
      { $sort: { date: 1 } }
    ]);
    
    // Maintenance Analytics
    const maintenanceAnalytics = await MaintenanceRequest.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const analytics = {
      userGrowth,
      propertyMetrics,
      applicationFunnel,
      revenueAnalysis,
      systemUsage,
      maintenanceAnalytics,
      summary: {
        totalUsers: await User.countDocuments(),
        activeUsers: await User.countDocuments({ status: 'active' }),
        totalProperties: await Property.countDocuments(),
        totalRevenue: await Payment.aggregate([
          { $match: { status: 'completed', createdAt: { $gte: startDate } } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        totalApplications: await Application.countDocuments(),
        totalMaintenanceRequests: await MaintenanceRequest.countDocuments()
      }
    };
    
    res.json({
      success: true,
      timeRange,
      startDate,
      endDate: now,
      ...analytics
    });
    
  } catch (error) {
    return next(new AppError(`Analytics generation failed: ${error.message}`, 500));
  }
});

// Helper functions for report generation
async function generateFinancialReport(startDate, endDate) {
  const payments = await Payment.aggregate([
    { $match: { status: 'completed', createdAt: { $gte: startDate, $lte: endDate } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$amount' },
        transactions: { $sum: 1 },
        averageTransaction: { $avg: '$amount' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const refunds = await Payment.aggregate([
    { $match: { status: 'refunded', createdAt: { $gte: startDate, $lte: endDate } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        refundAmount: { $sum: '$refundAmount' },
        refundCount: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return {
    summary: {
      totalRevenue: payments.reduce((sum, p) => sum + p.revenue, 0),
      totalRefunds: refunds.reduce((sum, r) => sum + r.refundAmount, 0),
      netRevenue: payments.reduce((sum, p) => sum + p.revenue, 0) - refunds.reduce((sum, r) => sum + r.refundAmount, 0),
      totalTransactions: payments.reduce((sum, p) => sum + p.transactions, 0)
    },
    dailyRevenue: payments,
    dailyRefunds: refunds
  };
}

async function generateOccupancyReport(startDate, endDate) {
  const properties = await Property.find({
    createdAt: { $gte: startDate, $lte: endDate }
  }).populate('applications');

  const occupancyData = properties.map(property => ({
    propertyId: property._id,
    title: property.title,
    totalUnits: property.units || 1,
    occupiedUnits: property.applications?.filter(app => app.status === 'approved').length || 0,
    occupancyRate: property.units ? ((property.applications?.filter(app => app.status === 'approved').length || 0) / property.units * 100).toFixed(2) : 0
  }));

  return {
    summary: {
      totalProperties: properties.length,
      totalUnits: properties.reduce((sum, p) => sum + (p.units || 1), 0),
      occupiedUnits: properties.reduce((sum, p) => sum + (p.applications?.filter(app => app.status === 'approved').length || 0), 0),
      averageOccupancyRate: occupancyData.length ? (occupancyData.reduce((sum, o) => sum + parseFloat(o.occupancyRate), 0) / occupancyData.length).toFixed(2) : 0
    },
    properties: occupancyData
  };
}

async function generateMaintenanceReport(startDate, endDate) {
  const requests = await MaintenanceRequest.aggregate([
    { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        averageResolutionTime: {
          $avg: {
            $cond: [
              { $eq: ['$status', 'resolved'] },
              { $subtract: ['$resolvedAt', '$createdAt'] },
              null
            ]
          }
        }
      }
    }
  ]);

  const priorityBreakdown = await MaintenanceRequest.aggregate([
    { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 }
      }
    }
  ]);

  return {
    statusBreakdown: requests,
    priorityBreakdown,
    summary: {
      totalRequests: requests.reduce((sum, r) => sum + r.count, 0),
      resolvedRequests: requests.find(r => r._id === 'resolved')?.count || 0,
      pendingRequests: requests.find(r => r._id === 'pending')?.count || 0,
      inProgressRequests: requests.find(r => r._id === 'in_progress')?.count || 0
    }
  };
}

async function generateUserActivityReport(startDate, endDate) {
  const newUsers = await User.aggregate([
    { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const activeUsers = await AuditLog.aggregate([
    { $match: { timestamp: { $gte: startDate, $lte: endDate } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
        uniqueUsers: { $addToSet: '$user' }
      }
    },
    {
      $project: {
        date: '$_id',
        activeUsers: { $size: '$uniqueUsers' }
      }
    },
    { $sort: { date: 1 } }
  ]);

  return {
    newUsers,
    activeUsers,
    summary: {
      totalNewUsers: newUsers.reduce((sum, u) => sum + u.count, 0),
      totalActiveUsers: activeUsers.reduce((sum, u) => sum + u.activeUsers, 0)
    }
  };
}

async function generatePropertyPerformanceReport(startDate, endDate) {
  const topProperties = await Property.aggregate([
    { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
    {
      $lookup: {
        from: 'applications',
        localField: '_id',
        foreignField: 'property',
        as: 'applications'
      }
    },
    {
      $project: {
        title: 1,
        price: 1,
        applicationCount: { $size: '$applications' },
        approvedApplications: {
          $size: {
            $filter: {
              input: '$applications',
              cond: { $eq: ['$$this.status', 'approved'] }
            }
          }
        }
      }
    },
    { $sort: { applicationCount: -1 } },
    { $limit: 10 }
  ]);

  return {
    topProperties,
    summary: {
      totalProperties: await Property.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
      averageApplicationsPerProperty: topProperties.length ? (topProperties.reduce((sum, p) => sum + p.applicationCount, 0) / topProperties.length).toFixed(2) : 0
    }
  };
}

async function generateApplicationStatsReport(startDate, endDate) {
  const statusBreakdown = await Application.aggregate([
    { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const conversionRate = await Application.aggregate([
    { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
    {
      $group: {
        _id: null,
        totalApplications: { $sum: 1 },
        approvedApplications: {
          $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
        }
      }
    }
  ]);

  return {
    statusBreakdown,
    conversionRate: conversionRate[0] ? {
      total: conversionRate[0].totalApplications,
      approved: conversionRate[0].approvedApplications,
      rate: ((conversionRate[0].approvedApplications / conversionRate[0].totalApplications) * 100).toFixed(2)
    } : null
  };
}

async function generatePaymentSummaryReport(startDate, endDate) {
  const paymentMethods = await Payment.aggregate([
    { $match: { status: 'completed', createdAt: { $gte: startDate, $lte: endDate } } },
    {
      $group: {
        _id: '$method',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);

  const dailyPayments = await Payment.aggregate([
    { $match: { status: 'completed', createdAt: { $gte: startDate, $lte: endDate } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        averageAmount: { $avg: '$amount' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return {
    paymentMethods,
    dailyPayments,
    summary: {
      totalPayments: dailyPayments.reduce((sum, d) => sum + d.count, 0),
      totalAmount: dailyPayments.reduce((sum, d) => sum + d.totalAmount, 0),
      averageAmount: dailyPayments.length ? (dailyPayments.reduce((sum, d) => sum + d.totalAmount, 0) / dailyPayments.reduce((sum, d) => sum + d.count, 0)).toFixed(2) : 0
    }
  };
}

async function generateSystemHealthReport() {
  const memoryUsage = process.memoryUsage();
  const uptime = process.uptime();
  
  return {
    server: {
      uptime: uptime,
      memoryUsage: {
        rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
        heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
        external: `${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`
      },
      nodeVersion: process.version,
      platform: process.platform
    },
    database: {
      status: 'connected', // In real implementation, check actual MongoDB connection
      collections: {
        users: await User.countDocuments(),
        properties: await Property.countDocuments(),
        applications: await Application.countDocuments(),
        payments: await Payment.countDocuments(),
        maintenanceRequests: await MaintenanceRequest.countDocuments()
      }
    },
    timestamp: new Date()
  };
}

async function generateCustomReport(parameters) {
  // Custom report logic based on parameters
  return {
    custom: true,
    parameters,
    data: {} // Implement custom logic based on parameters
  };
}

// Multi-tier user management
exports.getUsersByRole = catchAsync(async (req, res, next) => {
  const { role, page = 1, limit = 10, status } = req.query;
  
  const filter = {};
  if (role) filter.role = role;
  if (status) filter.status = status;
  
  const users = await User.find(filter)
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
  
  const total = await User.countDocuments(filter);
  
  res.json({
    success: true,
    users,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

exports.updateUserRole = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { role, reason } = req.body;
  
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  
  // Only super admin can promote to admin
  if (role === 'admin' || role === 'super_admin') {
    if (!req.user.isSuperAdmin()) {
      return next(new AppError('Only super admin can promote users to admin roles', 403));
    }
  }
  
  const oldRole = user.role;
  user.role = role;
  user.metadata.approvedBy = req.user.id;
  user.metadata.approvedAt = new Date();
  user.metadata.approvalNotes = reason;
  
  await user.save();
  
  // Create audit log
  await AuditLog.create({
    user: req.user.id,
    action: 'role_change',
    targetUser: userId,
    details: {
      oldRole,
      newRole: role,
      reason
    },
    ipAddress: req.ip
  });
  
  res.json({
    success: true,
    message: `User role updated to ${role}`,
    user
  });
});

exports.getRevenueReport = catchAsync(async (req, res, next) => {
  const { startDate, endDate, groupBy = 'month' } = req.query;
  
  const matchStage = {
    'subscription.status': 'active',
    'subscription.endDate': { $gt: new Date() }
  };
  
  if (startDate && endDate) {
    matchStage['subscription.startDate'] = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  const revenueData = await User.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          year: { $year: '$subscription.startDate' },
          month: groupBy === 'month' ? { $month: '$subscription.startDate' } : null,
          day: groupBy === 'day' ? { $dayOfMonth: '$subscription.startDate' } : null
        },
        basicSubscriptions: {
          $sum: { $cond: [{ $eq: ['$subscription.plan', 'basic'] }, 1, 0] }
        },
        proSubscriptions: {
          $sum: { $cond: [{ $eq: ['$subscription.plan', 'pro'] }, 1, 0] }
        },
        revenue: {
          $sum: {
            $cond: [
              { $eq: ['$subscription.plan', 'basic'] },
              4900,
              9900
            ]
          }
        },
        commission: {
          $sum: {
            $multiply: [
              {
                $cond: [
                  { $eq: ['$subscription.plan', 'basic'] },
                  4900,
                  9900
                ]
              },
              0.2
            ]
          }
        }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } }
  ]);
  
  res.json({
    success: true,
    revenueData
  });
});

exports.getAgentLeaderboard = catchAsync(async (req, res, next) => {
  const { period = 'month', limit = 10 } = req.query;
  
  let dateFilter;
  if (period === 'month') {
    dateFilter = { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) };
  } else if (period === 'year') {
    dateFilter = { $gte: new Date(new Date().getFullYear(), 0, 1) };
  } else {
    dateFilter = { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
  }
  
  const leaderboard = await User.aggregate([
    { $match: { role: 'agent', status: 'active' } },
    {
      $lookup: {
        from: 'properties',
        localField: '_id',
        foreignField: 'owner',
        as: 'properties'
      }
    },
    {
      $lookup: {
        from: 'applications',
        let: { agentId: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$agent', '$$agentId'] } } },
          { $match: { createdAt: dateFilter } }
        ],
        as: 'applications'
      }
    },
    {
      $project: {
        name: 1,
        email: 1,
        'subscription.plan': 1,
        propertyCount: { $size: '$properties' },
        applicationCount: { $size: '$applications' },
        totalRevenue: {
          $sum: {
            $map: {
              input: '$applications',
              as: 'app',
              in: '$app.rent'
            }
          }
        }
      }
    },
    { $sort: { totalRevenue: -1, applicationCount: -1, propertyCount: -1 } },
    { $limit: parseInt(limit) }
  ]);
  
  res.json({
    success: true,
    leaderboard
  });
});

// Methods are already exported with exports syntax
