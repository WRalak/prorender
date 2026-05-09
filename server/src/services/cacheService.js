const Redis = require('ioredis');
const { logger } = require('../config/logger');
const ServerHelpers = require('../utils/helpers');

class CacheService {
  constructor() {
    this.redis = null;
    this.isConnected = false;
    this.defaultTTL = 300; // 5 minutes
    this.keyPrefix = 'prorender:';
  }

  // Initialize Redis connection
  async connect() {
    try {
      const redisConfig = {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        db: process.env.REDIS_DB || 0,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        keepAlive: 30000,
        connectTimeout: 10000,
        commandTimeout: 5000,
      };

      this.redis = new Redis(redisConfig);

      this.redis.on('connect', () => {
        logger.info('Redis connected successfully');
        this.isConnected = true;
      });

      this.redis.on('error', (error) => {
        logger.error('Redis connection error:', error);
        this.isConnected = false;
      });

      this.redis.on('close', () => {
        logger.warn('Redis connection closed');
        this.isConnected = false;
      });

      this.redis.on('reconnecting', () => {
        logger.info('Redis reconnecting...');
      });

      await this.redis.connect();
      return true;

    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      this.isConnected = false;
      return false;
    }
  }

  // Disconnect from Redis
  async disconnect() {
    if (this.redis) {
      await this.redis.disconnect();
      this.isConnected = false;
      logger.info('Redis disconnected');
    }
  }

  // Check if Redis is connected
  isRedisConnected() {
    return this.isConnected && this.redis && this.redis.status === 'ready';
  }

  // Generate cache key with prefix
  generateKey(...parts) {
    return this.keyPrefix + parts.join(':');
  }

  // Set value in cache
  async set(key, value, ttl = this.defaultTTL) {
    try {
      if (!this.isRedisConnected()) {
        logger.warn('Redis not connected, skipping cache set');
        return false;
      }

      const cacheKey = this.generateKey(key);
      const serializedValue = JSON.stringify(value);

      if (ttl > 0) {
        await this.redis.setex(cacheKey, ttl, serializedValue);
      } else {
        await this.redis.set(cacheKey, serializedValue);
      }

      logger.debug(`Cache set: ${cacheKey} (TTL: ${ttl}s)`);
      return true;

    } catch (error) {
      logger.error('Cache set error:', error);
      return false;
    }
  }

  // Get value from cache
  async get(key) {
    try {
      if (!this.isRedisConnected()) {
        logger.warn('Redis not connected, skipping cache get');
        return null;
      }

      const cacheKey = this.generateKey(key);
      const value = await this.redis.get(cacheKey);

      if (value === null) {
        logger.debug(`Cache miss: ${cacheKey}`);
        return null;
      }

      const parsedValue = JSON.parse(value);
      logger.debug(`Cache hit: ${cacheKey}`);
      return parsedValue;

    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  // Delete key from cache
  async del(key) {
    try {
      if (!this.isRedisConnected()) {
        logger.warn('Redis not connected, skipping cache delete');
        return false;
      }

      const cacheKey = this.generateKey(key);
      const result = await this.redis.del(cacheKey);

      logger.debug(`Cache delete: ${cacheKey} (deleted: ${result})`);
      return result > 0;

    } catch (error) {
      logger.error('Cache delete error:', error);
      return false;
    }
  }

  // Check if key exists
  async exists(key) {
    try {
      if (!this.isRedisConnected()) {
        return false;
      }

      const cacheKey = this.generateKey(key);
      const result = await this.redis.exists(cacheKey);

      return result === 1;

    } catch (error) {
      logger.error('Cache exists error:', error);
      return false;
    }
  }

  // Set expiration for existing key
  async expire(key, ttl) {
    try {
      if (!this.isRedisConnected()) {
        return false;
      }

      const cacheKey = this.generateKey(key);
      const result = await this.redis.expire(cacheKey, ttl);

      return result === 1;

    } catch (error) {
      logger.error('Cache expire error:', error);
      return false;
    }
  }

  // Get TTL for key
  async ttl(key) {
    try {
      if (!this.isRedisConnected()) {
        return -1;
      }

      const cacheKey = this.generateKey(key);
      return await this.redis.ttl(cacheKey);

    } catch (error) {
      logger.error('Cache TTL error:', error);
      return -1;
    }
  }

  // Set multiple values
  async mset(keyValuePairs, ttl = this.defaultTTL) {
    try {
      if (!this.isRedisConnected()) {
        return false;
      }

      const pipeline = this.redis.pipeline();

      Object.entries(keyValuePairs).forEach(([key, value]) => {
        const cacheKey = this.generateKey(key);
        const serializedValue = JSON.stringify(value);
        
        if (ttl > 0) {
          pipeline.setex(cacheKey, ttl, serializedValue);
        } else {
          pipeline.set(cacheKey, serializedValue);
        }
      });

      await pipeline.exec();
      logger.debug(`Cache mset: ${Object.keys(keyValuePairs).length} keys`);
      return true;

    } catch (error) {
      logger.error('Cache mset error:', error);
      return false;
    }
  }

  // Get multiple values
  async mget(keys) {
    try {
      if (!this.isRedisConnected()) {
        return {};
      }

      const cacheKeys = keys.map(key => this.generateKey(key));
      const values = await this.redis.mget(cacheKeys);

      const result = {};
      keys.forEach((key, index) => {
        const value = values[index];
        result[key] = value ? JSON.parse(value) : null;
      });

      logger.debug(`Cache mget: ${keys.length} keys`);
      return result;

    } catch (error) {
      logger.error('Cache mget error:', error);
      return {};
    }
  }

  // Delete multiple keys
  async mdel(keys) {
    try {
      if (!this.isRedisConnected()) {
        return 0;
      }

      const cacheKeys = keys.map(key => this.generateKey(key));
      const result = await this.redis.del(...cacheKeys);

      logger.debug(`Cache mdel: ${keys.length} keys (deleted: ${result})`);
      return result;

    } catch (error) {
      logger.error('Cache mdel error:', error);
      return 0;
    }
  }

  // Increment value
  async incr(key, amount = 1) {
    try {
      if (!this.isRedisConnected()) {
        return null;
      }

      const cacheKey = this.generateKey(key);
      const result = await this.redis.incrby(cacheKey, amount);

      logger.debug(`Cache incr: ${cacheKey} by ${amount} = ${result}`);
      return result;

    } catch (error) {
      logger.error('Cache incr error:', error);
      return null;
    }
  }

  // Decrement value
  async decr(key, amount = 1) {
    try {
      if (!this.isRedisConnected()) {
        return null;
      }

      const cacheKey = this.generateKey(key);
      const result = await this.redis.decrby(cacheKey, amount);

      logger.debug(`Cache decr: ${cacheKey} by ${amount} = ${result}`);
      return result;

    } catch (error) {
      logger.error('Cache decr error:', error);
      return null;
    }
  }

  // Get all keys matching pattern
  async keys(pattern) {
    try {
      if (!this.isRedisConnected()) {
        return [];
      }

      const cachePattern = this.generateKey(pattern);
      const keys = await this.redis.keys(cachePattern);

      // Remove prefix from keys
      const cleanKeys = keys.map(key => key.replace(this.keyPrefix, ''));
      return cleanKeys;

    } catch (error) {
      logger.error('Cache keys error:', error);
      return [];
    }
  }

  // Clear all cache
  async clear() {
    try {
      if (!this.isRedisConnected()) {
        return false;
      }

      const pattern = this.generateKey('*');
      const keys = await this.redis.keys(pattern);

      if (keys.length > 0) {
        await this.redis.del(...keys);
        logger.info(`Cache cleared: ${keys.length} keys deleted`);
      }

      return true;

    } catch (error) {
      logger.error('Cache clear error:', error);
      return false;
    }
  }

  // Cache wrapper with fallback function
  async wrap(key, fetchFunction, ttl = this.defaultTTL) {
    try {
      // Try to get from cache first
      let cached = await this.get(key);

      if (cached !== null) {
        logger.debug(`Cache wrap hit: ${key}`);
        return cached;
      }

      // Cache miss, execute fetch function
      logger.debug(`Cache wrap miss: ${key}, executing fetch function`);
      const result = await fetchFunction();

      // Store in cache
      await this.set(key, result, ttl);

      return result;

    } catch (error) {
      logger.error('Cache wrap error:', error);
      throw error;
    }
  }

  // Cache user session
  async cacheUserSession(userId, sessionData, ttl = 24 * 60 * 60) { // 24 hours
    return await this.set(`session:${userId}`, sessionData, ttl);
  }

  // Get user session
  async getUserSession(userId) {
    return await this.get(`session:${userId}`);
  }

  // Delete user session
  async deleteUserSession(userId) {
    return await this.del(`session:${userId}`);
  }

  // Cache user permissions
  async cacheUserPermissions(userId, permissions, ttl = 60 * 60) { // 1 hour
    return await this.set(`permissions:${userId}`, permissions, ttl);
  }

  // Get user permissions
  async getUserPermissions(userId) {
    return await this.get(`permissions:${userId}`);
  }

  // Cache API response
  async cacheApiResponse(endpoint, params, response, ttl = 5 * 60) { // 5 minutes
    const key = `api:${endpoint}:${JSON.stringify(params)}`;
    return await this.set(key, response, ttl);
  }

  // Get cached API response
  async getCachedApiResponse(endpoint, params) {
    const key = `api:${endpoint}:${JSON.stringify(params)}`;
    return await this.get(key);
  }

  // Cache database query result
  async cacheQuery(query, params, result, ttl = 10 * 60) { // 10 minutes
    const key = `query:${query}:${JSON.stringify(params)}`;
    return await this.set(key, result, ttl);
  }

  // Get cached query result
  async getCachedQuery(query, params) {
    const key = `query:${query}:${JSON.stringify(params)}`;
    return await this.get(key);
  }

  // Cache file metadata
  async cacheFileMetadata(fileId, metadata, ttl = 60 * 60) { // 1 hour
    return await this.set(`file:${fileId}`, metadata, ttl);
  }

  // Get cached file metadata
  async getCachedFileMetadata(fileId) {
    return await this.get(`file:${fileId}`);
  }

  // Cache rate limit data
  async cacheRateLimit(identifier, action, data, ttl = 60) { // 1 minute
    const key = `rate_limit:${action}:${identifier}`;
    return await this.set(key, data, ttl);
  }

  // Get rate limit data
  async getRateLimit(identifier, action) {
    const key = `rate_limit:${action}:${identifier}`;
    return await this.get(key);
  }

  // Increment rate limit counter
  async incrementRateLimit(identifier, action, ttl = 60) {
    const key = `rate_limit:${action}:${identifier}`;
    return await this.incr(key, 1);
  }

  // Cache email verification token
  async cacheEmailToken(email, tokenData, ttl = 24 * 60 * 60) { // 24 hours
    const key = `email_token:${email}`;
    return await this.set(key, tokenData, ttl);
  }

  // Get email verification token
  async getEmailToken(email) {
    const key = `email_token:${email}`;
    return await this.get(key);
  }

  // Delete email verification token
  async deleteEmailToken(email) {
    const key = `email_token:${email}`;
    return await this.del(key);
  }

  // Cache password reset token
  async cachePasswordResetToken(email, tokenData, ttl = 10 * 60) { // 10 minutes
    const key = `password_reset:${email}`;
    return await this.set(key, tokenData, ttl);
  }

  // Get password reset token
  async getPasswordResetToken(email) {
    const key = `password_reset:${email}`;
    return await this.get(key);
  }

  // Delete password reset token
  async deletePasswordResetToken(email) {
    const key = `password_reset:${email}`;
    return await this.del(key);
  }

  // Cache subscription data
  async cacheSubscription(userId, subscriptionData, ttl = 30 * 60) { // 30 minutes
    const key = `subscription:${userId}`;
    return await this.set(key, subscriptionData, ttl);
  }

  // Get cached subscription data
  async getCachedSubscription(userId) {
    const key = `subscription:${userId}`;
    return await this.get(key);
  }

  // Invalidate user-related cache
  async invalidateUserCache(userId) {
    const patterns = [
      `session:${userId}`,
      `permissions:${userId}`,
      `subscription:${userId}`,
      `email_token:${userId}`,
      `password_reset:${userId}`
    ];

    return await this.mdel(patterns);
  }

  // Invalidate cache by pattern
  async invalidatePattern(pattern) {
    try {
      const keys = await this.keys(pattern);
      if (keys.length > 0) {
        await this.mdel(keys);
        logger.info(`Cache invalidated: ${keys.length} keys for pattern ${pattern}`);
      }
      return keys.length;
    } catch (error) {
      logger.error('Cache invalidate pattern error:', error);
      return 0;
    }
  }

  // Get cache statistics
  async getStats() {
    try {
      if (!this.isRedisConnected()) {
        return { connected: false };
      }

      const info = await this.redis.info('memory');
      const keyspace = await this.redis.info('keyspace');

      const stats = {
        connected: true,
        memory: this.parseMemoryInfo(info),
        keyspace: this.parseKeyspaceInfo(keyspace),
        uptime: await this.redis.info('server').then(info => {
          const match = info.match(/uptime_in_seconds:(\d+)/);
          return match ? parseInt(match[1]) : 0;
        })
      };

      return stats;

    } catch (error) {
      logger.error('Cache stats error:', error);
      return { connected: false, error: error.message };
    }
  }

  // Parse Redis memory info
  parseMemoryInfo(info) {
    const lines = info.split('\r\n');
    const memory = {};

    lines.forEach(line => {
      if (line.startsWith('used_memory:')) {
        memory.used = parseInt(line.split(':')[1]);
      } else if (line.startsWith('used_memory_human:')) {
        memory.usedHuman = line.split(':')[1];
      } else if (line.startsWith('used_memory_peak:')) {
        memory.peak = parseInt(line.split(':')[1]);
      } else if (line.startsWith('used_memory_peak_human:')) {
        memory.peakHuman = line.split(':')[1];
      }
    });

    return memory;
  }

  // Parse Redis keyspace info
  parseKeyspaceInfo(info) {
    const lines = info.split('\r\n');
    const keyspace = {};

    lines.forEach(line => {
      if (line.startsWith('db')) {
        const parts = line.split(':');
        const db = parts[0];
        const stats = parts[1];
        
        const keys = stats.match(/keys=(\d+)/);
        const expires = stats.match(/expires=(\d+)/);
        
        keyspace[db] = {
          keys: keys ? parseInt(keys[1]) : 0,
          expires: expires ? parseInt(expires[1]) : 0
        };
      }
    });

    return keyspace;
  }

  // Health check
  async healthCheck() {
    try {
      if (!this.isRedisConnected()) {
        return { status: 'unhealthy', message: 'Redis not connected' };
      }

      const start = Date.now();
      await this.redis.ping();
      const latency = Date.now() - start;

      return {
        status: 'healthy',
        latency: `${latency}ms`,
        connected: true
      };

    } catch (error) {
      return {
        status: 'unhealthy',
        message: error.message,
        connected: false
      };
    }
  }
}

// Create singleton instance
const cacheService = new CacheService();

module.exports = cacheService;
