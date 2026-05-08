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

class BackupJob {
  constructor() {
    this.backupDir = path.join(process.cwd(), 'backups');
    this.isRunning = false;
  }

  // Main backup function
  async runBackup(options = {}) {
    if (this.isRunning) {
      logger.warn('Backup job is already running');
      return { success: false, message: 'Backup already in progress' };
    }

    this.isRunning = true;
    const startTime = Date.now();
    const backupId = `backup_${startTime}`;

    try {
      logger.info(`Starting backup job: ${backupId}`);
      
      // Ensure backup directory exists
      await fs.mkdir(this.backupDir, { recursive: true });

      const backupOptions = {
        includeUsers: options.includeUsers !== false,
        includeProperties: options.includeProperties !== false,
        includeApplications: options.includeApplications !== false,
        includePayments: options.includePayments !== false,
        includeMaintenance: options.includeMaintenance !== false,
        compress: options.compress !== false,
        format: options.format || 'json'
      };

      // Create backup metadata
      const metadata = {
        id: backupId,
        startTime: new Date(startTime).toISOString(),
        options: backupOptions,
        status: 'running'
      };

      await this.saveMetadata(backupId, metadata);

      // Perform backup operations
      const backupData = {};
      
      if (backupOptions.includeUsers) {
        backupData.users = await this.backupUsers();
      }
      
      if (backupOptions.includeProperties) {
        backupData.properties = await this.backupProperties();
      }
      
      if (backupOptions.includeApplications) {
        backupData.applications = await this.backupApplications();
      }
      
      if (backupOptions.includePayments) {
        backupData.payments = await this.backupPayments();
      }
      
      if (backupOptions.includeMaintenance) {
        backupData.maintenanceRequests = await this.backupMaintenanceRequests();
      }

      // Save backup data
      const backupFile = await this.saveBackupData(backupId, backupData, backupOptions);
      
      // Update metadata
      const endTime = Date.now();
      metadata.endTime = new Date(endTime).toISOString();
      metadata.duration = endTime - startTime;
      metadata.status = 'completed';
      metadata.fileSize = backupFile.size;
      metadata.fileName = backupFile.fileName;

      await this.saveMetadata(backupId, metadata);

      logger.info(`Backup completed: ${backupId}`, {
        duration: metadata.duration,
        fileSize: metadata.fileSize,
        fileName: metadata.fileName
      });

      return {
        success: true,
        backupId,
        metadata
      };

    } catch (error) {
      logger.error('Backup job failed', { error: error.message, backupId });
      
      // Update metadata with error
      const metadata = {
        id: backupId,
        endTime: new Date().toISOString(),
        status: 'failed',
        error: error.message
      };
      
      await this.saveMetadata(backupId, metadata);
      
      return {
        success: false,
        message: error.message,
        backupId
      };
    } finally {
      this.isRunning = false;
    }
  }

  // Backup users collection
  async backupUsers() {
    try {
      const users = await User.find({})
        .select('-password') // Exclude passwords
        .lean(); // Get plain JavaScript objects

      logger.info(`Backed up ${users.length} users`);
      return users;
    } catch (error) {
      logger.error('Failed to backup users', { error: error.message });
      throw error;
    }
  }

  // Backup properties collection
  async backupProperties() {
    try {
      const properties = await Property.find({}).lean();
      logger.info(`Backed up ${properties.length} properties`);
      return properties;
    } catch (error) {
      logger.error('Failed to backup properties', { error: error.message });
      throw error;
    }
  }

  // Backup applications collection
  async backupApplications() {
    try {
      const applications = await Application.find({}).lean();
      logger.info(`Backed up ${applications.length} applications`);
      return applications;
    } catch (error) {
      logger.error('Failed to backup applications', { error: error.message });
      throw error;
    }
  }

  // Backup payments collection
  async backupPayments() {
    try {
      const payments = await Payment.find({}).lean();
      logger.info(`Backed up ${payments.length} payments`);
      return payments;
    } catch (error) {
      logger.error('Failed to backup payments', { error: error.message });
      throw error;
    }
  }

  // Backup maintenance requests collection
  async backupMaintenanceRequests() {
    try {
      const requests = await MaintenanceRequest.find({}).lean();
      logger.info(`Backed up ${requests.length} maintenance requests`);
      return requests;
    } catch (error) {
      logger.error('Failed to backup maintenance requests', { error: error.message });
      throw error;
    }
  }

  // Save backup data to file
  async saveBackupData(backupId, data, options) {
    try {
      const fileName = `${backupId}.${options.format}`;
      const filePath = path.join(this.backupDir, fileName);

      if (options.format === 'json') {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
      } else if (options.format === 'csv') {
        // Convert to CSV (simplified implementation)
        const csvData = this.convertToCSV(data);
        await fs.writeFile(filePath, csvData, 'utf8');
      }

      const stats = await fs.stat(filePath);
      
      return {
        fileName,
        filePath,
        size: stats.size,
        format: options.format
      };
    } catch (error) {
      logger.error('Failed to save backup data', { error: error.message });
      throw error;
    }
  }

  // Save backup metadata
  async saveMetadata(backupId, metadata) {
    try {
      const metadataPath = path.join(this.backupDir, `${backupId}_metadata.json`);
      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');
    } catch (error) {
      logger.error('Failed to save backup metadata', { error: error.message });
      throw error;
    }
  }

  // Convert data to CSV format (simplified)
  convertToCSV(data) {
    const csvLines = [];
    
    // Process each collection
    Object.keys(data).forEach(collectionName => {
      const items = data[collectionName];
      if (!items || items.length === 0) return;
      
      csvLines.push(`\n# ${collectionName.toUpperCase()}`);
      
      // Get headers from first item
      const headers = Object.keys(items[0]);
      csvLines.push(headers.join(','));
      
      // Add data rows
      items.forEach(item => {
        const row = headers.map(header => {
          const value = item[header];
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') return JSON.stringify(value);
          return `"${String(value).replace(/"/g, '""')}"`;
        });
        csvLines.push(row.join(','));
      });
    });
    
    return csvLines.join('\n');
  }

  // Clean up old backups
  async cleanupOldBackups(daysToKeep = 30) {
    try {
      const files = await fs.readdir(this.backupDir);
      const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
      
      let deletedCount = 0;
      
      for (const file of files) {
        const filePath = path.join(this.backupDir, file);
        const stats = await fs.stat(filePath);
        
        if (stats.mtime.getTime() < cutoffTime) {
          await fs.unlink(filePath);
          deletedCount++;
          logger.info(`Deleted old backup: ${file}`);
        }
      }
      
      logger.info(`Cleanup completed. Deleted ${deletedCount} old backups`);
      return { success: true, deletedCount };
    } catch (error) {
      logger.error('Failed to cleanup old backups', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  // Get backup status
  async getBackupStatus(backupId) {
    try {
      const metadataPath = path.join(this.backupDir, `${backupId}_metadata.json`);
      const metadataContent = await fs.readFile(metadataPath, 'utf8');
      return JSON.parse(metadataContent);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return { error: 'Backup not found' };
      }
      throw error;
    }
  }

  // List all backups
  async listBackups() {
    try {
      const files = await fs.readdir(this.backupDir);
      const backupFiles = files.filter(file => file.endsWith('_metadata.json'));
      
      const backups = [];
      
      for (const file of backupFiles) {
        try {
          const metadataPath = path.join(this.backupDir, file);
          const metadataContent = await fs.readFile(metadataPath, 'utf8');
          const metadata = JSON.parse(metadataContent);
          backups.push(metadata);
        } catch (error) {
          logger.warn(`Failed to read backup metadata: ${file}`, { error: error.message });
        }
      }
      
      // Sort by creation time (newest first)
      backups.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
      
      return backups;
    } catch (error) {
      logger.error('Failed to list backups', { error: error.message });
      throw error;
    }
  }

  // Restore from backup
  async restoreFromBackup(backupId, options = {}) {
    try {
      logger.info(`Starting restore from backup: ${backupId}`);
      
      const metadata = await this.getBackupStatus(backupId);
      if (metadata.status !== 'completed') {
        throw new Error('Backup is not completed, cannot restore');
      }

      const backupFile = path.join(this.backupDir, metadata.fileName);
      const backupData = JSON.parse(await fs.readFile(backupFile, 'utf8'));

      const restoreOptions = {
        clearExisting: options.clearExisting !== false,
        collections: options.collections || Object.keys(backupData)
      };

      // Clear existing data if requested
      if (restoreOptions.clearExisting) {
        await this.clearCollections(restoreOptions.collections);
      }

      // Restore each collection
      for (const collectionName of restoreOptions.collections) {
        if (backupData[collectionName]) {
          await this.restoreCollection(collectionName, backupData[collectionName]);
        }
      }

      logger.info(`Restore completed from backup: ${backupId}`);
      return { success: true, restoredCollections: restoreOptions.collections };
    } catch (error) {
      logger.error('Restore failed', { error: error.message, backupId });
      return { success: false, error: error.message };
    }
  }

  // Clear collections
  async clearCollections(collections) {
    const operations = [];
    
    for (const collectionName of collections) {
      switch (collectionName) {
        case 'users':
          operations.push(User.deleteMany({}));
          break;
        case 'properties':
          operations.push(Property.deleteMany({}));
          break;
        case 'applications':
          operations.push(Application.deleteMany({}));
          break;
        case 'payments':
          operations.push(Payment.deleteMany({}));
          break;
        case 'maintenanceRequests':
          operations.push(MaintenanceRequest.deleteMany({}));
          break;
      }
    }
    
    if (operations.length > 0) {
      await Promise.all(operations);
      logger.info(`Cleared collections: ${collections.join(', ')}`);
    }
  }

  // Restore individual collection
  async restoreCollection(collectionName, data) {
    try {
      let Model;
      
      switch (collectionName) {
        case 'users':
          Model = User;
          break;
        case 'properties':
          Model = Property;
          break;
        case 'applications':
          Model = Application;
          break;
        case 'payments':
          Model = Payment;
          break;
        case 'maintenanceRequests':
          Model = MaintenanceRequest;
          break;
        default:
          throw new Error(`Unknown collection: ${collectionName}`);
      }
      
      if (data.length > 0) {
        await Model.insertMany(data);
        logger.info(`Restored ${data.length} items to ${collectionName}`);
      }
    } catch (error) {
      logger.error(`Failed to restore ${collectionName}`, { error: error.message });
      throw error;
    }
  }
}

// Create singleton instance
const backupJob = new BackupJob();

module.exports = backupJob;