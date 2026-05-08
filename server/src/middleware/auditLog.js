const AuditLog = require('../models/AuditLog');

const auditLog = (action, details = {}) => {
  return (req, res, next) => {
    // Only log if user is authenticated
    if (!req.user) {
      return next();
    }

    const logData = {
      user: req.user.id,
      action,
      details: {
        ...details,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        method: req.method,
        url: req.originalUrl,
        body: req.body,
        params: req.params,
        query: req.query
      },
      timestamp: new Date(),
      status: res.statusCode
    };

    // Create audit log asynchronously (don't wait for it)
    AuditLog.create(logData).catch(err => {
      console.error('Failed to create audit log:', err);
    });

    next();
  };
};

module.exports = auditLog;