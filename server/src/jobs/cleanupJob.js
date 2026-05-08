const fs = require('fs').promises;
const path = require('path');
const mongoose = require('mongoose');
const { logger } = require('../config/logger');

// Models
const User = require('../models/User');
const Property = require('../models/Property');
const Application = require('../models/Application');
const Payment = require('../models/Payment');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

class CleanupJob {
  constructor() {
    this.isRunning = false;
  }

  // Main cleanup function
  async runCleanup(options = {}) {
    if (this.isRunning) {
      logger.warn('Cleanup job is already running');
      return { success: false, message: 'Cleanup already in progress' };
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      logger.info('Starting cleanup job');

      const cleanupOptions = {
        cleanupOldUsers: options.cleanupOldUsers !== false,
        cleanupUnverifiedUsers: options.cleanupUnverifiedUsers !== false,
        cleanupOldProperties: options.cleanupOldProperties !== false,
        cleanupOldApplications: options.cleanupOldApplications !== false,
        cleanupOldNotifications: options.cleanupOldNotifications !== false,
        cleanupOldAuditLogs: options.cleanupOldAuditLogs !== false,
        cleanupTempFiles: options.cleanupTempFiles !== false,
        daysToKeep: options.daysToKeep || 30
      };

      const results = {};

      // Clean up old unverified users
      if (cleanupOptions.cleanupUnverifiedUsers) {
        results.unverifiedUsers = await this.cleanupUnverifiedUsers(cleanupOptions.daysToKeep);
      }

      // Clean up old inactive users
      if (cleanupOptions.cleanupOldUsers) {
        results.oldUsers = await this.cleanupOldUsers(cleanupOptions.daysToKeep);
      }

      // Clean up old properties
      if (cleanupOptions.cleanupOldProperties) {
        results.oldProperties = await this.cleanupOldProperties(cleanupOptions.daysToKeep);
      }

      // Clean up old applications
      if (cleanupOptions.cleanupOldApplications) {
        results.oldApplications = await this.cleanupOldApplications(cleanupOptions.daysToKeep);
      }

      // Clean up old notifications
      if (cleanupOptions.cleanupOldNotifications) {
        results.oldNotifications = await this.cleanupOldNotifications(cleanupOptions.daysToKeep);
      }

      // Clean up old audit logs
      if (cleanupOptions.cleanupOldAuditLogs) {
        results.oldAuditLogs = await this.cleanupOldAuditLogs(cleanupOptions.daysToKeep);
      }

      // Clean up temporary files
      if (cleanupOptions.cleanupTempFiles) {
        results.tempFiles = await this.cleanupTempFiles();
      }

      const duration = Date.now() - startTime;
      logger.info('Cleanup job completed', {
        duration,
        results
      });

      return {
        success: true,
        duration,
        results
      };

    } catch (error) {
      logger.error('Cleanup job failed', { error: error.message });
      return {
        success: false,
        error: error.message
      };
    } finally {
      this.isRunning = false;
    }
  }

  // Clean up unverified users older than specified days
  async cleanupUnverifiedUsers(daysToKeep) {
    try {
      const cutoffDate = new Date(Date.now() - (daysToKeep * 24 * 60 * 60 * 1000));
      
      const result = await User.deleteMany({
        verified: false,
        createdAt: { $lt: cutoffDate }
      });

      logger.info(`Cleaned up ${result.deletedCount} unverified users older than ${daysToKeep} days`);
      
      return {
        deletedCount: result.deletedCount,
        type: 'unverified_users'
      };
    } catch (error) {
      logger.error('Failed to cleanup unverified users', { error: error.message });
      throw error;
    }
  }

  // Clean up inactive users (no login for specified days)
  async cleanupOldUsers(daysToKeep) {
    try {
      const cutoffDate = new Date(Date.now() - (daysToKeep * 24 * 60 * 60 * 1000));
      
      const result = await User.deleteMany({
        lastLogin: { $lt: cutoffDate },
        status: 'inactive'
      });

      logger.info(`Cleaned up ${result.deletedCount} inactive users older than ${daysToKeep} days`);
      
      return {
        deletedCount: result.deletedCount,
        type: 'inactive_users'
      };
    } catch (error) {
      logger.error('Failed to cleanup old users', { error: error.message });
      throw error;
    }
  }

  // Clean up old properties (inactive for specified days)
  async cleanupOldProperties(daysToKeep) {
    try {
      const cutoffDate = new Date(Date.now() - (daysToKeep * 24 * 60 * 60 * 1000));
      
      const result = await Property.deleteMany({
        status: 'inactive',
        updatedAt: { $lt: cutoffDate }
      });

      logger.info(`Cleaned up ${result.deletedCount} inactive properties older than ${daysToKeep} days`);
      
      return {
        deletedCount: result.deletedCount,
        type: 'inactive_properties'
      };
    } catch (error) {
      logger.error('Failed to cleanup old properties', { error: error.message });
      throw error;
    }
  }

  // Clean up old applications (rejected/expired for specified days)
  async cleanupOldApplications(daysToKeep) {
    try {
      const cutoffDate = new Date(Date.now() - (daysToKeep * 24 * 60 * 60 * 1000));
      
      const result = await Application.deleteMany({
        $or: [
          { status: 'rejected', updatedAt: { $lt: cutoffDate } },
          { status: 'expired', updatedAt: { $lt: cutoffDate } },
          { status: 'withdrawn', updatedAt: { $lt: cutoffDate } }
        ]
      });

      logger.info(`Cleaned up ${result.deletedCount} old applications older than ${daysToKeep} days`);
      
      return {
        deletedCount: result.deletedCount,
        type: 'old_applications'
      };
    } catch (error) {
      logger.error('Failed to cleanup old applications', { error: error.message });
      throw error;
    }
  }

  // Clean up old notifications
  async cleanupOldNotifications(daysToKeep) {
    try {
      const cutoffDate = new Date(Date.now() - (daysToKeep * 24 * 60 * 60 * 1000));
      
      const result = await Notification.deleteMany({
        createdAt: { $lt: cutoffDate },
        read: true // Only delete read notifications
      });

      logger.info(`Cleaned up ${result.deletedCount} old notifications older than ${daysToKeep} days`);
      
      return {
        deletedCount: result.deletedCount,
        type: 'old_notifications'
      };
    } catch (error) {
      logger.error('Failed to cleanup old notifications', { error: error.message });
      throw error;
    }
  }

  // Clean up old audit logs
  async cleanupOldAuditLogs(daysToKeep) {
    try {
      const cutoffDate = new Date(Date.now() - (daysToKeep * 24 * 60 * 60 * 1000));
      
      const result = await AuditLog.deleteMany({
        timestamp: { $lt: cutoffDate }
      });

      logger.info(`Cleaned up ${result.deletedCount} old audit logs older than ${daysToKeep} days`);
      
      return {
        deletedCount: result.deletedCount,
        type: 'old_audit_logs'
      };
    } catch (error) {
      logger.error('Failed to cleanup old audit logs', { error: error.message });
      throw error;
    }
  }

  // Clean up temporary files
  async cleanupTempFiles() {
    try {
      const tempDir = path.join(process.cwd(), 'temp');
      const uploadsDir = path.join(process.cwd(), 'uploads', 'temp');
      
      let deletedCount = 0;
      
      // Clean temp directory
      if (fs.existsSync(tempDir)) {
        const files = await fs.readdir(tempDir);
        for (const file of files) {
          const filePath = path.join(tempDir, file);
          const stats = await fs.stat(filePath);
          
          // Delete files older than 24 hours
          if (Date.now() - stats.mtime.getTime() > 24 * 60 * 60 * 1000) {
            await fs.unlink(filePath);
            deletedCount++;
          }
        }
      }

      // Clean uploads/temp directory
      if (fs.existsSync(uploadsDir)) {
        const files = await fs.readdir(uploadsDir);
        for (const file of files) {
          const filePath = path.join(uploadsDir, file);
          const stats = await fs.stat(filePath);
          
          // Delete files older than 24 hours
          if (Date.now() - stats.mtime.getTime() > 24 * 60 * 60 * 1000) {
            await fs.unlink(filePath);
            deletedCount++;
          }
        }
      }

      logger.info(`Cleaned up ${deletedCount} temporary files`);
      
      return {
        deletedCount,
        type: 'temp_files'
      };
    } catch (error) {
      logger.error('Failed to cleanup temporary files', { error: error.message });
      throw error;
    }
  }

  // Clean up orphaned files (files without corresponding database entries)
  async cleanupOrphanedFiles() {
    try {
      const uploadsDir = path.join(process.cwd(), 'uploads');
      let deletedCount = 0;

      if (!fs.existsSync(uploadsDir)) {
        return { deletedCount: 0, type: 'orphaned_files' };
      }

      const files = await fs.readdir(uploadsDir);
      
      for (const file of files) {
        const filePath = path.join(uploadsDir, file);
        const stats = await fs.stat(filePath);
        
        if (stats.isFile()) {
          // Check if this file exists in any database record
          const existsInDB = await this.checkFileExistsInDB(file);
          
          if (!existsInDB) {
            await fs.unlink(filePath);
            deletedCount++;
            logger.info(`Deleted orphaned file: ${file}`);
          }
        }
      }

      logger.info(`Cleaned up ${deletedCount} orphaned files`);
      
      return {
        deletedCount,
        type: 'orphaned_files'
      };
    } catch (error) {
      logger.error('Failed to cleanup orphaned files', { error: error.message });
      throw error;
    }
  }

  // Check if file exists in any database record
  async checkFileExistsInDB(fileName) {
    try {
      // Check in properties
      const propertyCount = await Property.countDocuments({
        $or: [
          { 'images': fileName },
          { 'documents': fileName }
        ]
      });

      // Check in applications
      const applicationCount = await Application.countDocuments({
        'documents.fileName': fileName
      });

      // Check in maintenance requests
      const maintenanceCount = await MaintenanceRequest.countDocuments({
        'images': fileName
      });

      // Check in users
      const userCount = await User.countDocuments({
        $or: [
          { 'avatar': fileName },
          { 'documents.fileName': fileName }
        ]
      });
      
      return propertyCount > 0 || applicationCount > 0 || maintenanceCount > 0 || userCount > 0;
    } catch (error) {
      logger.error('Failed to check file existence in DB', { error: error.message });
      return false;
    }
  }
}

class CleanupJob {
  // ...

  // Get cleanup statistics
  async getCleanupStats() {
    try {
      // TO DO: implement cleanup statistics
      const stats = {};
      return stats;
    } catch (error) {
      logger.error('Failed to get cleanup statistics', { error: error.message });
      throw error;
    }
  }

  // Schedule cleanup job to run periodically
  async scheduleCleanup(cronExpression = '0 2 * * *') {
    try {
      const cron = require('node-cron');
      
      cron.schedule(cronExpression, async () => {
        logger.info('Running scheduled cleanup job');
        await this.runCleanup({
          cleanupUnverifiedUsers: true,
          cleanupOldNotifications: true,
          cleanupTempFiles: true,
          daysToKeep: 30
        });
      });

      logger.info(`Cleanup job scheduled with cron: ${cronExpression}`);
    } catch (error) {
      logger.error('Failed to schedule cleanup job', { error: error.message });
    }
  }
}

// Create singleton instance
const cleanupJob = new CleanupJob();

module.exports = cleanupJob;