const rateLimit = require('express-rate-limit');
const Redis = require('redis');
const { RedisStore } = require('rate-limit-redis');

// Redis client for rate limiting
const redisClient = Redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// General API rate limiter
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    store: process.env.NODE_ENV === 'production' ? new RedisStore({
      sendCommand: (...args) => redisClient.sendCommand(args),
    }) : undefined,
    windowMs,
    max,
    message: {
      success: false,
      message: message || 'Too many requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Different rate limiters for different endpoints
exports.authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts
  'Too many authentication attempts, please try again later.'
);

exports.passwordResetLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  3, // 3 attempts
  'Too many password reset attempts, please try again later.'
);

exports.emailVerificationLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  5, // 5 attempts
  'Too many email verification attempts, please try again later.'
);

exports.uploadLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  10, // 10 uploads
  'Too many upload attempts, please try again later.'
);

exports.searchLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  100, // 100 searches
  'Too many search requests, please try again later.'
);

exports.contactLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  5, // 5 contact attempts
  'Too many contact attempts, please try again later.'
);

// API rate limiter for general use
exports.apiLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  1000, // 1000 requests
  'Too many requests, please try again later.'
);

// Strict rate limiter for sensitive operations
exports.strictLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  10, // 10 requests
  'Too many requests, please try again later.'
);