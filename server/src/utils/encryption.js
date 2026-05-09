const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { logger } = require('../config/logger');

class EncryptionUtils {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32;
    this.ivLength = 16;
    this.tagLength = 16;
    this.saltLength = 32;
  }

  // Get encryption key from environment or generate one
  getEncryptionKey() {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
      throw new Error('ENCRYPTION_KEY environment variable is not set');
    }
    return Buffer.from(key, 'hex');
  }

  // Generate a random key for encryption
  static generateKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Generate a random salt
  static generateSalt(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  // Encrypt sensitive data
  encrypt(text) {
    try {
      if (!text) return null;

      const key = this.getEncryptionKey();
      const iv = crypto.randomBytes(this.ivLength);
      
      const cipher = crypto.createCipher(this.algorithm, key, iv);
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      // Combine IV, encrypted data, and tag
      const combined = iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted;
      
      return combined;
    } catch (error) {
      logger.error('Encryption error:', error);
      throw new Error('Data encryption failed');
    }
  }

  // Decrypt sensitive data
  decrypt(encryptedData) {
    try {
      if (!encryptedData) return null;

      const key = this.getEncryptionKey();
      
      // Split combined data
      const parts = encryptedData.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }
      
      const iv = Buffer.from(parts[0], 'hex');
      const tag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];
      
      const decipher = crypto.createDecipher(this.algorithm, key, iv);
      decipher.setAuthTag(tag);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      logger.error('Decryption error:', error);
      throw new Error('Data decryption failed');
    }
  }

  // Hash password with bcrypt
  static async hashPassword(password, saltRounds = 12) {
    try {
      return await bcrypt.hash(password, saltRounds);
    } catch (error) {
      logger.error('Password hashing error:', error);
      throw new Error('Password hashing failed');
    }
  }

  // Compare password with hash
  static async comparePassword(password, hash) {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      logger.error('Password comparison error:', error);
      throw new Error('Password comparison failed');
    }
  }

  // Generate secure random token
  static generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  // Generate UUID v4
  static generateUUID() {
    return crypto.randomUUID();
  }

  // Create hash of data
  static createHash(data, algorithm = 'sha256') {
    return crypto.createHash(algorithm).update(data).digest('hex');
  }

  // Create HMAC
  static createHMAC(data, secret, algorithm = 'sha256') {
    return crypto.createHmac(algorithm, secret).update(data).digest('hex');
  }

  // Verify HMAC
  static verifyHMAC(data, signature, secret, algorithm = 'sha256') {
    const expectedSignature = crypto.createHmac(algorithm, secret).update(data).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  }

  // Encrypt JSON object
  encryptObject(obj) {
    try {
      const jsonString = JSON.stringify(obj);
      return this.encrypt(jsonString);
    } catch (error) {
      logger.error('Object encryption error:', error);
      throw new Error('Object encryption failed');
    }
  }

  // Decrypt JSON object
  decryptObject(encryptedData) {
    try {
      const decryptedString = this.decrypt(encryptedData);
      return JSON.parse(decryptedString);
    } catch (error) {
      logger.error('Object decryption error:', error);
      throw new Error('Object decryption failed');
    }
  }

  // Encrypt file buffer
  encryptBuffer(buffer) {
    try {
      const key = this.getEncryptionKey();
      const iv = crypto.randomBytes(this.ivLength);
      
      const cipher = crypto.createCipher(this.algorithm, key, iv);
      
      const encrypted = Buffer.concat([
        cipher.update(buffer),
        cipher.final()
      ]);
      
      const tag = cipher.getAuthTag();
      
      // Combine IV, tag, and encrypted data
      return Buffer.concat([iv, tag, encrypted]);
    } catch (error) {
      logger.error('Buffer encryption error:', error);
      throw new Error('Buffer encryption failed');
    }
  }

  // Decrypt file buffer
  decryptBuffer(encryptedBuffer) {
    try {
      const key = this.getEncryptionKey();
      
      // Extract IV, tag, and encrypted data
      const iv = encryptedBuffer.slice(0, this.ivLength);
      const tag = encryptedBuffer.slice(this.ivLength, this.ivLength + this.tagLength);
      const encrypted = encryptedBuffer.slice(this.ivLength + this.tagLength);
      
      const decipher = crypto.createDecipher(this.algorithm, key, iv);
      decipher.setAuthTag(tag);
      
      return Buffer.concat([
        decipher.update(encrypted),
        decipher.final()
      ]);
    } catch (error) {
      logger.error('Buffer decryption error:', error);
      throw new Error('Buffer decryption failed');
    }
  }

  // Generate password reset token
  static generatePasswordResetToken() {
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    return { token, expiry };
  }

  // Generate email verification token
  static generateEmailVerificationToken() {
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    return { token, expiry };
  }

  // Generate API key
  static generateAPIKey() {
    const prefix = 'pk_';
    const key = crypto.randomBytes(32).toString('hex');
    return prefix + key;
  }

  // Generate session token
  static generateSessionToken() {
    return crypto.randomBytes(64).toString('base64');
  }

  // Encrypt sensitive fields in an object
  encryptSensitiveFields(obj, sensitiveFields) {
    try {
      const encryptedObj = { ...obj };
      
      sensitiveFields.forEach(field => {
        if (encryptedObj[field]) {
          encryptedObj[field] = this.encrypt(encryptedObj[field]);
        }
      });
      
      return encryptedObj;
    } catch (error) {
      logger.error('Field encryption error:', error);
      throw new Error('Field encryption failed');
    }
  }

  // Decrypt sensitive fields in an object
  decryptSensitiveFields(obj, sensitiveFields) {
    try {
      const decryptedObj = { ...obj };
      
      sensitiveFields.forEach(field => {
        if (decryptedObj[field]) {
          decryptedObj[field] = this.decrypt(decryptedObj[field]);
        }
      });
      
      return decryptedObj;
    } catch (error) {
      logger.error('Field decryption error:', error);
      throw new Error('Field decryption failed');
    }
  }

  // Mask sensitive data for logging
  static maskSensitiveData(data, fieldsToMask = ['password', 'token', 'secret', 'key']) {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const masked = { ...data };
    
    fieldsToMask.forEach(field => {
      if (masked[field]) {
        const value = String(masked[field]);
        masked[field] = value.length > 4 ? 
          value.substring(0, 2) + '*'.repeat(value.length - 4) + value.substring(value.length - 2) :
          '*'.repeat(value.length);
      }
    });

    return masked;
  }

  // Generate secure random number within range
  static secureRandom(min, max) {
    const range = max - min + 1;
    const bytesNeeded = Math.ceil(Math.log2(range) / 8);
    const maxValue = Math.pow(256, bytesNeeded);
    const threshold = maxValue - (maxValue % range);
    
    let randomBytes;
    do {
      randomBytes = crypto.randomBytes(bytesNeeded);
    } while (randomBytes.readUIntBE(0, bytesNeeded) >= threshold);
    
    return min + (randomBytes.readUIntBE(0, bytesNeeded) % range);
  }

  // Derive key from password using PBKDF2
  static deriveKey(password, salt, iterations = 100000, keyLength = 32) {
    return crypto.pbkdf2Sync(password, salt, iterations, keyLength, 'sha256');
  }

  // Constant-time comparison to prevent timing attacks
  static constantTimeCompare(a, b) {
    if (a.length !== b.length) {
      return false;
    }
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    
    return result === 0;
  }

  // Generate cryptographic nonce
  static generateNonce(length = 16) {
    return crypto.randomBytes(length).toString('base64');
  }

  // Create digital signature
  static signData(data, privateKey, algorithm = 'RSA-SHA256') {
    try {
      const sign = crypto.createSign(algorithm);
      sign.update(data);
      return sign.sign(privateKey, 'base64');
    } catch (error) {
      logger.error('Data signing error:', error);
      throw new Error('Data signing failed');
    }
  }

  // Verify digital signature
  static verifySignature(data, signature, publicKey, algorithm = 'RSA-SHA256') {
    try {
      const verify = crypto.createVerify(algorithm);
      verify.update(data);
      return verify.verify(publicKey, signature, 'base64');
    } catch (error) {
      logger.error('Signature verification error:', error);
      throw new Error('Signature verification failed');
    }
  }
}

module.exports = EncryptionUtils;