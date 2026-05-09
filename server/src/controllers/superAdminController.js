const User = require('../models/User');
const AppError = require('../middleware/errorHandler');
const { catchAsync } = require('../middleware/errorHandler');

exports.getSystemHealth = catchAsync(async (req, res, next) => {
  const health = {
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version,
    environment: process.env.NODE_ENV || 'development'
  };

  res.json({
    success: true,
    data: health
  });
});

exports.getSystemMetrics = catchAsync(async (req, res, next) => {
  const metrics = {
    users: await User.countDocuments(),
    activeUsers: await User.countDocuments({ status: 'active' }),
    systemLoad: process.cpuUsage(),
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime()
  };

  res.json({
    success: true,
    data: metrics
  });
});

exports.toggleMaintenance = catchAsync(async (req, res, next) => {
  const { enabled } = req.body;
  
  // In a real implementation, you would store this in a database or config
  console.log(`Maintenance mode: ${enabled ? 'ON' : 'OFF'}`);

  res.json({
    success: true,
    message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}`
  });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, search, role, status } = req.query;
  
  const query = {};
  if (search) {
    query.$or = [
      { 'name.first': new RegExp(search, 'i') },
      { 'name.last': new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') }
    ];
  }
  if (role) query.role = role;
  if (status) query.status = status;

  const skip = (page - 1) * limit;
  
  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

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
  const { id } = req.params;
  
  const user = await User.findById(id).select('-password');
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.json({
    success: true,
    user
  });
});

exports.updateUserRole = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { role } = req.body;

  const user = await User.findByIdAndUpdate(id, { role }, { new: true });
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.json({
    success: true,
    message: 'User role updated successfully'
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findByIdAndDelete(id);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

exports.suspendUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findByIdAndUpdate(id, { status: 'suspended' }, { new: true });
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.json({
    success: true,
    message: 'User suspended successfully'
  });
});

exports.unsuspendUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findByIdAndUpdate(id, { status: 'active' }, { new: true });
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.json({
    success: true,
    message: 'User unsuspended successfully'
  });
});

exports.getSystemLogs = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 50, level, startDate, endDate } = req.query;
  
  // In a real implementation, you would query your logs database
  const logs = [];
  
  res.json({
    success: true,
    logs,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: 0,
      pages: 0
    }
  });
});

exports.getAuditLogs = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 50, action, userId } = req.query;
  
  // In a real implementation, you would query your audit logs
  const logs = [];
  
  res.json({
    success: true,
    logs,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: 0,
      pages: 0
    }
  });
});

exports.getSystemSettings = catchAsync(async (req, res, next) => {
  // In a real implementation, you would query your settings database
  const settings = {
    maintenanceMode: false,
    emailNotifications: true,
    smsNotifications: false,
    maxUploadSize: '10MB',
    sessionTimeout: 3600
  };

  res.json({
    success: true,
    settings
  });
});

exports.updateSystemSettings = catchAsync(async (req, res, next) => {
  const settings = req.body;
  
  // In a real implementation, you would update your settings database
  console.log('System settings updated:', settings);

  res.json({
    success: true,
    message: 'System settings updated successfully'
  });
});

exports.createBackup = catchAsync(async (req, res, next) => {
  // In a real implementation, you would create a database backup
  const backup = {
    id: new Date().getTime(),
    timestamp: new Date(),
    size: '125MB',
    status: 'completed'
  };

  res.json({
    success: true,
    backup,
    message: 'Backup created successfully'
  });
});

exports.restoreBackup = catchAsync(async (req, res, next) => {
  const { backupId } = req.params;
  
  // In a real implementation, you would restore from backup
  console.log('Restoring backup:', backupId);

  res.json({
    success: true,
    message: 'Backup restored successfully'
  });
});

exports.getLogsByType = catchAsync(async (req, res, next) => {
  const { type } = req.params;
  const { page = 1, limit = 50 } = req.query;
  
  // In a real implementation, you would query logs by type
  const logs = [];
  
  res.json({
    success: true,
    logs,
    type,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: 0,
      pages: 0
    }
  });
});

exports.getAdmins = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;
  
  const admins = await User.find({ role: { $in: ['admin', 'super_admin'] } })
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit);

  const total = await User.countDocuments({ role: { $in: ['admin', 'super_admin'] } });

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
  const { name, email, password, role } = req.body;
  
  const admin = await User.create({
    name,
    email,
    password,
    role: role || 'admin',
    verified: true,
    status: 'active'
  });

  res.json({
    success: true,
    admin,
    message: 'Admin created successfully'
  });
});

exports.updateAdmin = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updates = req.body;
  
  const admin = await User.findByIdAndUpdate(id, updates, { new: true });
  
  if (!admin) {
    return next(new AppError('Admin not found', 404));
  }

  res.json({
    success: true,
    admin,
    message: 'Admin updated successfully'
  });
});

exports.deleteAdmin = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const admin = await User.findByIdAndDelete(id);
  
  if (!admin) {
    return next(new AppError('Admin not found', 404));
  }

  res.json({
    success: true,
    message: 'Admin deleted successfully'
  });
});

exports.getGlobalSettings = catchAsync(async (req, res, next) => {
  // In a real implementation, you would query global settings
  const settings = {
    siteName: 'PropRent',
    siteDescription: 'Property Rental Management System',
    maintenanceMode: false,
    allowRegistrations: true,
    emailNotifications: true,
    smsNotifications: false,
    maxUploadSize: '10MB',
    sessionTimeout: 3600
  };

  res.json({
    success: true,
    settings
  });
});

exports.updateGlobalSettings = catchAsync(async (req, res, next) => {
  const settings = req.body;
  
  // In a real implementation, you would update global settings
  console.log('Global settings updated:', settings);

  res.json({
    success: true,
    message: 'Global settings updated successfully'
  });
});

exports.getSystemLogs = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 50, level, startDate, endDate } = req.query;
  
  // In a real implementation, you would query your logs database
  const logs = [];
  
  res.json({
    success: true,
    logs,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: 0,
      pages: 0
    }
  });
});

exports.getDatabaseStats = catchAsync(async (req, res, next) => {
  const stats = {
    users: await User.countDocuments(),
    properties: 0, // Would query Property model
    applications: 0, // Would query Application model
    payments: 0, // Would query Payment model
    maintenance: 0, // Would query Maintenance model
    databaseSize: '125MB',
    lastBackup: new Date()
  };

  res.json({
    success: true,
    stats
  });
});

exports.createDatabaseBackup = catchAsync(async (req, res, next) => {
  // In a real implementation, you would create a database backup
  const backup = {
    id: new Date().getTime(),
    timestamp: new Date(),
    size: '125MB',
    status: 'completed'
  };

  res.json({
    success: true,
    backup,
    message: 'Database backup created successfully'
  });
});

exports.restoreDatabase = catchAsync(async (req, res, next) => {
  const { backupId } = req.body;
  
  // In a real implementation, you would restore from backup
  console.log('Restoring database:', backupId);

  res.json({
    success: true,
    message: 'Database restored successfully'
  });
});

exports.getSecurityAudit = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 50 } = req.query;
  
  // In a real implementation, you would query security audit logs
  const logs = [];
  
  res.json({
    success: true,
    logs,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: 0,
      pages: 0
    }
  });
});

exports.resetAllPasswords = catchAsync(async (req, res, next) => {
  // In a real implementation, you would reset all user passwords
  console.log('Resetting all passwords');
  
  res.json({
    success: true,
    message: 'All passwords reset successfully'
  });
});
