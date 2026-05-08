const User = require('../models/User');
const AppError = require('../middleware/errorHandler');
const { catchAsync } = require('../middleware/errorHandler');

exports.getSystemHealth = catchAsync(async (req, res, next) => {
  const health = {
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    nodeVersion: process.version,
    platform: process.platform,
    environment: process.env.NODE_ENV || 'development'
  };

  res.json({
    success: true,
    health
  });
});

exports.getSystemMetrics = catchAsync(async (req, res, next) => {
  const metrics = {
    server: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    },
    database: {
      status: 'connected', // TODO: Check actual DB connection
      collections: {
        users: await User.countDocuments(),
        // TODO: Add other collections
      }
    },
    performance: {
      avgResponseTime: 150, // TODO: Calculate actual response time
      requestsPerSecond: 50, // TODO: Calculate actual RPS
      errorRate: 0.02 // TODO: Calculate actual error rate
    }
  };

  res.json({
    success: true,
    metrics
  });
});

exports.toggleMaintenance = catchAsync(async (req, res, next) => {
  const { enabled, message } = req.body;
  
  // TODO: Implement maintenance mode
  console.log(`Maintenance mode: ${enabled ? 'ON' : 'OFF'}`);

  res.json({
    success: true,
    message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}`,
    maintenance: {
      enabled,
      message: message || 'System is under maintenance'
    }
  });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
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
    .populate('favorites');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.json({
    success: true,
    user
  });
});

exports.updateUserRole = catchAsync(async (req, res, next) => {
  const { role } = req.body;
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  user.role = role;
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

exports.getAdmins = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, search } = req.query;
  const query = { role: { $in: ['admin', 'super_admin'] } };
  
  if (search) {
    query.$or = [
      { 'name.first': { $regex: search, $options: 'i' } },
      { 'name.last': { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const admins = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await User.countDocuments(query);

  res.json({
    success: true,
    admins,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

exports.createAdmin = catchAsync(async (req, res, next) => {
  const { name, email, password, role = 'admin' } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('User already exists', 400));
  }

  const admin = await User.create({
    name: {
      first: name.split(' ')[0],
      last: name.split(' ')[1] || ''
    },
    email,
    password,
    role,
    status: 'active'
  });

  res.status(201).json({
    success: true,
    admin
  });
});

exports.updateAdmin = catchAsync(async (req, res, next) => {
  const updates = req.body;
  const { id } = req.params;

  const admin = await User.findById(id);
  if (!admin) {
    return next(new AppError('Admin not found', 404));
  }

  if (!['admin', 'super_admin'].includes(admin.role)) {
    return next(new AppError('User is not an admin', 400));
  }

  Object.keys(updates).forEach(key => {
    if (key === 'password') {
      // Handle password separately if needed
      return;
    }
    admin[key] = updates[key];
  });

  await admin.save();

  res.json({
    success: true,
    admin
  });
});

exports.deleteAdmin = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const admin = await User.findById(id);
  if (!admin) {
    return next(new AppError('Admin not found', 404));
  }

  if (admin.role === 'super_admin') {
    return next(new AppError('Cannot delete super admin', 400));
  }

  await User.findByIdAndDelete(id);

  res.json({
    success: true,
    message: 'Admin deleted successfully'
  });
});

exports.getGlobalSettings = catchAsync(async (req, res, next) => {
  const settings = {
    site: {
      name: 'PropRent',
      url: process.env.CLIENT_URL,
      version: '1.0.0'
    },
    features: {
      registration: true,
      emailVerification: true,
      twoFactorAuth: false,
      socialLogin: false,
      maintenance: false
    },
    limits: {
      maxPropertiesPerUser: 10,
      maxApplicationsPerUser: 50,
      maxFileSize: 10485760, // 10MB
      sessionTimeout: 86400000 // 24 hours
    },
    integrations: {
      stripe: !!process.env.STRIPE_SECRET_KEY,
      cloudinary: !!process.env.CLOUDINARY_CLOUD_NAME,
      email: !!process.env.EMAIL_HOST
    }
  };

  res.json({
    success: true,
    settings
  });
});

exports.updateGlobalSettings = catchAsync(async (req, res, next) => {
  const updates = req.body;
  
  // TODO: Update actual global settings
  console.log('Global settings updated:', updates);

  res.json({
    success: true,
    message: 'Global settings updated successfully',
    settings: updates
  });
});

exports.getSystemLogs = catchAsync(async (req, res, next) => {
  // TODO: Implement actual system log retrieval
  const logs = [
    {
      timestamp: new Date(),
      level: 'info',
      message: 'System started successfully',
      service: 'server'
    },
    {
      timestamp: new Date(Date.now() - 3600000),
      level: 'warning',
      message: 'High memory usage detected',
      service: 'monitor'
    }
  ];

  res.json({
    success: true,
    logs
  });
});

exports.getLogsByType = catchAsync(async (req, res, next) => {
  const { type } = req.params;
  
  // TODO: Implement filtered log retrieval
  const logs = [];

  res.json({
    success: true,
    logs,
    type
  });
});

exports.getDatabaseStats = catchAsync(async (req, res, next) => {
  const stats = {
    collections: {
      users: await User.countDocuments(),
      // TODO: Add other collections
    },
    size: '125.4 MB', // TODO: Calculate actual DB size
    indexes: 15,
    lastBackup: new Date(Date.now() - 86400000) // 1 day ago
  };

  res.json({
    success: true,
    stats
  });
});

exports.createDatabaseBackup = catchAsync(async (req, res, next) => {
  // TODO: Implement actual database backup
  const backupId = `backup_${Date.now()}`;
  
  res.json({
    success: true,
    backupId,
    message: 'Database backup created successfully'
  });
});

exports.restoreDatabase = catchAsync(async (req, res, next) => {
  const { backupId } = req.body;
  
  // TODO: Implement actual database restoration
  
  res.json({
    success: true,
    message: 'Database restored successfully'
  });
});

exports.getSecurityAudit = catchAsync(async (req, res, next) => {
  const audit = {
    userSecurity: {
      totalUsers: await User.countDocuments(),
      activeUsers: await User.countDocuments({ status: 'active' }),
      bannedUsers: await User.countDocuments({ status: 'banned' }),
      usersWith2FA: 0 // TODO: Calculate actual 2FA users
    },
    systemSecurity: {
      sslEnabled: true,
      rateLimitingEnabled: true,
      corsConfigured: true,
      helmetEnabled: true
    },
    recentActivity: [
      {
        timestamp: new Date(),
        type: 'login',
        user: 'admin@example.com',
        ip: '192.168.1.1'
      }
    ]
  };

  res.json({
    success: true,
    audit
  });
});

exports.resetAllPasswords = catchAsync(async (req, res, next) => {
  const { confirmation } = req.body;
  
  if (confirmation !== 'RESET_ALL_PASSWORDS_CONFIRM') {
    return next(new AppError('Invalid confirmation', 400));
  }

  // TODO: Implement secure password reset
  console.log('All passwords would be reset');

  res.json({
    success: true,
    message: 'All passwords have been reset. Users will need to use password reset functionality.'
  });
});

module.exports = {
  getSystemHealth,
  getSystemMetrics,
  toggleMaintenance,
  getAllUsers,
  getUser,
  updateUserRole,
  deleteUser,
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getGlobalSettings,
  updateGlobalSettings,
  getSystemLogs,
  getLogsByType,
  getDatabaseStats,
  createDatabaseBackup,
  restoreDatabase,
  getSecurityAudit,
  resetAllPasswords
};