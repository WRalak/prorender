const winston = require('winston');
const path = require('path');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Define console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'prorent-server' },
  transports: [
    // Write all logs with importance level of 'error' or less to 'error.log'
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Write all logs with importance level of 'info' or less to 'combined.log'
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // Write audit logs separately
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'audit.log'),
      level: 'info',
      maxsize: 5242880, // 5MB
      maxFiles: 10,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ],
  
  // Handle exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'exceptions.log'),
      maxsize: 5242880,
      maxFiles: 3
    })
  ],
  
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'rejections.log'),
      maxsize: 5242880,
      maxFiles: 3
    })
  ]
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// Add console transport for production with error level only
if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.Console({
    level: 'error',
    format: consoleFormat
  }));
}

// Custom logging methods for different purposes
const auditLogger = {
  log: (action, userId, details = {}) => {
    logger.info('AUDIT_LOG', {
      action,
      userId,
      details,
      timestamp: new Date().toISOString(),
      ip: details.ip || 'unknown',
      userAgent: details.userAgent || 'unknown'
    });
  }
};

const securityLogger = {
  log: (event, details = {}) => {
    logger.warn('SECURITY_EVENT', {
      event,
      details,
      timestamp: new Date().toISOString()
    });
  }
};

const performanceLogger = {
  log: (operation, duration, details = {}) => {
    logger.info('PERFORMANCE', {
      operation,
      duration: `${duration}ms`,
      details,
      timestamp: new Date().toISOString()
    });
  }
};

const businessLogger = {
  log: (event, details = {}) => {
    logger.info('BUSINESS_EVENT', {
      event,
      details,
      timestamp: new Date().toISOString()
    });
  }
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      userId: req.user ? req.user._id : 'anonymous'
    };

    if (res.statusCode >= 400) {
      logger.warn('HTTP_REQUEST_ERROR', logData);
    } else {
      logger.info('HTTP_REQUEST', logData);
    }

    // Log slow requests (> 1 second)
    if (duration > 1000) {
      performanceLogger.log('SLOW_REQUEST', duration, {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode
      });
    }
  });

  next();
};

// Database query logging
const dbLogger = {
  log: (operation, collection, query, duration) => {
    if (process.env.LOG_DB_QUERIES === 'true') {
      logger.debug('DB_QUERY', {
        operation,
        collection,
        query: JSON.stringify(query),
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      });
    }
  }
};

// Error logging helper
const logError = (error, context = {}) => {
  logger.error('APPLICATION_ERROR', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString()
  });
};

// Helper function to create child loggers with additional context
const createChildLogger = (service, additionalMeta = {}) => {
  return logger.child({
    service,
    ...additionalMeta
  });
};

// Log rotation and cleanup (would typically be handled by external process)
const cleanupOldLogs = () => {
  logger.info('LOG_CLEANUP', {
    message: 'Log cleanup process started',
    timestamp: new Date().toISOString()
  });
};

// Export logger and custom loggers
module.exports = {
  logger,
  auditLogger,
  securityLogger,
  performanceLogger,
  businessLogger,
  requestLogger,
  dbLogger,
  logError,
  createChildLogger,
  cleanupOldLogs,
  
  // Convenience methods
  info: (message, meta = {}) => logger.info(message, meta),
  warn: (message, meta = {}) => logger.warn(message, meta),
  error: (message, meta = {}) => logger.error(message, meta),
  debug: (message, meta = {}) => logger.debug(message, meta),
  
  // Structured logging methods
  userAction: (userId, action, details = {}) => {
    auditLogger.log(action, userId, details);
  },
  
  securityEvent: (event, details = {}) => {
    securityLogger.log(event, details);
  },
  
  performanceMetric: (operation, duration, details = {}) => {
    performanceLogger.log(operation, duration, details);
  },
  
  businessEvent: (event, details = {}) => {
    businessLogger.log(event, details);
  }
};