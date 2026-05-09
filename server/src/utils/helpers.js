const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { logger } = require('../config/logger');

// Server-side utility functions
class ServerHelpers {
  // Password utilities
  static async hashPassword(password) {
    try {
      const saltRounds = 12;
      return await bcrypt.hash(password, saltRounds);
    } catch (error) {
      logger.error('Error hashing password:', error);
      throw new Error('Password hashing failed');
    }
  }

  static async comparePassword(password, hashedPassword) {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      logger.error('Error comparing password:', error);
      throw new Error('Password comparison failed');
    }
  }

  // JWT utilities
  static generateToken(payload, expiresIn = '24h') {
    try {
      return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
    } catch (error) {
      logger.error('Error generating token:', error);
      throw new Error('Token generation failed');
    }
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      logger.error('Error verifying token:', error);
      throw new Error('Token verification failed');
    }
  }

  static generateRefreshToken(payload) {
    try {
      return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    } catch (error) {
      logger.error('Error generating refresh token:', error);
      throw new Error('Refresh token generation failed');
    }
  }

  // String utilities
  static sanitizeString(str) {
    if (!str) return '';
    return str.trim().replace(/[<>]/g, '');
  }

  static generateRandomString(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  static generateSlug(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  static extractFileName(url) {
    if (!url) return '';
    return url.split('/').pop().split('?')[0];
  }

  // File utilities
  static getFileExtension(filename) {
    if (!filename) return '';
    return filename.split('.').pop().toLowerCase();
  }

  static isImageFile(filename) {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    return imageExtensions.includes(this.getFileExtension(filename));
  }

  static isDocumentFile(filename) {
    const docExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
    return docExtensions.includes(this.getFileExtension(filename));
  }

  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Date utilities
  static formatDate(date, format = 'YYYY-MM-DD') {
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day);
  }

  static addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  static isDateInPast(date) {
    return new Date(date) < new Date();
  }

  static isDateInFuture(date) {
    return new Date(date) > new Date();
  }

  static getDaysDifference(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((new Date(date1) - new Date(date2)) / oneDay));
  }

  // Validation utilities
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidPhone(phone) {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return phoneRegex.test(phone);
  }

  static isValidObjectId(id) {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }

  static isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  }

  // Number utilities
  static formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  static roundToTwoDecimals(num) {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }

  static calculatePercentage(part, total) {
    if (total === 0) return 0;
    return Math.round((part / total) * 100);
  }

  // Array utilities
  static removeDuplicates(array, key) {
    if (!key) {
      return [...new Set(array)];
    }
    const seen = new Set();
    return array.filter(item => {
      const value = item[key];
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
  }

  static chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  static shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Object utilities
  static pickKeys(obj, keys) {
    return keys.reduce((result, key) => {
      if (obj && obj.hasOwnProperty(key)) {
        result[key] = obj[key];
      }
      return result;
    }, {});
  }

  static omitKeys(obj, keys) {
    const result = { ...obj };
    keys.forEach(key => delete result[key]);
    return result;
  }

  static deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => this.deepClone(item));
    if (typeof obj === 'object') {
      const cloned = {};
      Object.keys(obj).forEach(key => {
        cloned[key] = this.deepClone(obj[key]);
      });
      return cloned;
    }
  }

  static isEmpty(value) {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
  }

  // Database utilities
  static buildMongoQuery(filters) {
    const query = {};
    
    Object.keys(filters).forEach(key => {
      const value = filters[key];
      if (value === undefined || value === null || value === '') return;
      
      if (typeof value === 'object' && value.$regex) {
        query[key] = value;
      } else if (Array.isArray(value)) {
        query[key] = { $in: value };
      } else if (typeof value === 'object' && value.min !== undefined || value.max !== undefined) {
        const rangeQuery = {};
        if (value.min !== undefined) rangeQuery.$gte = value.min;
        if (value.max !== undefined) rangeQuery.$lte = value.max;
        query[key] = rangeQuery;
      } else {
        query[key] = value;
      }
    });
    
    return query;
  }

  static buildSortQuery(sortBy, sortOrder = 'desc') {
    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1; // Default sort
    }
    return sort;
  }

  // Pagination utilities
  static getPaginationOptions(page = 1, limit = 20) {
    const parsedPage = Math.max(1, parseInt(page));
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit)));
    
    return {
      page: parsedPage,
      limit: parsedLimit,
      skip: (parsedPage - 1) * parsedLimit
    };
  }

  static buildPaginationMeta(total, page, limit) {
    const totalPages = Math.ceil(total / limit);
    
    return {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };
  }

  // Error utilities
  static createError(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.code = code;
    return error;
  }

  static handleDatabaseError(error) {
    logger.error('Database error:', error);
    
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyValue)[0];
      return this.createError(`${field} already exists`, 409, 'DUPLICATE_ERROR');
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return this.createError(messages.join(', '), 400, 'VALIDATION_ERROR');
    }
    
    if (error.name === 'CastError') {
      return this.createError('Invalid ID format', 400, 'INVALID_ID');
    }
    
    return this.createError('Database operation failed', 500, 'DATABASE_ERROR');
  }

  // Response utilities
  static successResponse(data, message = 'Success', meta = null) {
    const response = {
      success: true,
      message,
      data
    };
    
    if (meta) {
      response.meta = meta;
    }
    
    return response;
  }

  static errorResponse(message, errors = null, code = null) {
    const response = {
      success: false,
      message
    };
    
    if (errors) {
      response.errors = errors;
    }
    
    if (code) {
      response.code = code;
    }
    
    return response;
  }

  // Cache utilities
  static generateCacheKey(prefix, params) {
    const keyString = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join(':');
    return `${prefix}:${keyString}`;
  }

  static async cacheWithFallback(cacheKey, fetchFunction, ttl = 300) {
    // This would integrate with your cache service (Redis, etc.)
    // For now, just return the fetched data
    try {
      return await fetchFunction();
    } catch (error) {
      logger.error('Cache fetch error:', error);
      throw error;
    }
  }

  // Rate limiting utilities
  static generateRateLimitKey(identifier, action) {
    return `rate_limit:${action}:${identifier}`;
  }

  static async checkRateLimit(key, limit, windowMs) {
    // This would integrate with your rate limiting service
    // For now, return true (allow request)
    return {
      allowed: true,
      remaining: limit,
      resetTime: new Date(Date.now() + windowMs)
    };
  }

  // Logging utilities
  static logUserAction(userId, action, resource, details = {}) {
    logger.info('User action', {
      userId,
      action,
      resource,
      details,
      timestamp: new Date().toISOString()
    });
  }

  static logSecurityEvent(event, details = {}) {
    logger.warn('Security event', {
      event,
      details,
      timestamp: new Date().toISOString()
    });
  }

  static logSystemEvent(event, details = {}) {
    logger.info('System event', {
      event,
      details,
      timestamp: new Date().toISOString()
    });
  }

  // Environment utilities
  static isDevelopment() {
    return process.env.NODE_ENV === 'development';
  }

  static isProduction() {
    return process.env.NODE_ENV === 'production';
  }

  static isTest() {
    return process.env.NODE_ENV === 'test';
  }

  static getEnvVar(key, defaultValue = null) {
    return process.env[key] || defaultValue;
  }

  // API utilities
  static sanitizeQueryParams(query) {
    const sanitized = {};
    
    Object.keys(query).forEach(key => {
      const value = query[key];
      
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value);
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(item => 
          typeof item === 'string' ? this.sanitizeString(item) : item
        );
      } else {
        sanitized[key] = value;
      }
    });
    
    return sanitized;
  }

  static validatePaginationParams(page, limit) {
    const parsedPage = parseInt(page) || 1;
    const parsedLimit = parseInt(limit) || 20;
    
    return {
      page: Math.max(1, parsedPage),
      limit: Math.min(100, Math.max(1, parsedLimit))
    };
  }
}

module.exports = ServerHelpers;
