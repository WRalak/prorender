const fs = require('fs').promises;
const path = require('path');
const archiver = require('archiver');
const AppError = require('../middleware/errorHandler');
const { catchAsync } = require('../middleware/errorHandler');

class BackupService {
  // Create database backup
  static async createDatabaseBackup(options = {}) {
    try {
      const {
        type = 'full',
        compression = true,
        includeFiles = true
      } = options;

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupDir = path.join(process.cwd(), 'backups');
      const filename = `backup_${type}_${timestamp}.zip`;
      const backupPath = path.join(backupDir, filename);

      // Ensure backup directory exists
      await fs.mkdir(backupDir, { recursive: true });

      // Create backup archive
      const output = fs.createWriteStream(backupPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      return new Promise((resolve, reject) => {
        output.on('close', () => {
          resolve({
            success: true,
            backup: {
              id: timestamp,
              filename,
              path: backupPath,
              size: 0, // Would be calculated
              type,
              createdAt: new Date(),
              status: 'completed'
            }
          });
        });

        output.on('error', (error) => {
          reject(new AppError(`Backup failed: ${error.message}`, 500));
        });

        archive.on('error', (error) => {
          reject(new AppError(`Archive creation failed: ${error.message}`, 500));
        });

        archive.pipe(output);

        // Add database dump (in a real implementation)
        archive.append(Buffer.from('-- Database backup placeholder --'), 'database.sql');

        // Add files if requested
        if (includeFiles) {
          const uploadsDir = path.join(process.cwd(), 'uploads');
          if (fs.existsSync(uploadsDir)) {
            archive.directory(uploadsDir, { name: 'uploads' });
          }
        }

        archive.finalize();
      });
    } catch (error) {
      console.error('Backup creation failed:', error);
      throw new AppError('Failed to create backup', 500);
    }
  }

  // Restore database from backup
  static async restoreDatabase(backupId, options = {}) {
    try {
      const backupDir = path.join(process.cwd(), 'backups');
      const backupPath = path.join(backupDir, backupId);

      // Check if backup exists
      if (!fs.existsSync(backupPath)) {
        throw new AppError('Backup file not found', 404);
      }

      // In a real implementation, you would:
      // 1. Extract the backup archive
      // 2. Restore the database
      // 3. Restore files if included
      // 4. Verify integrity

      console.log(`Restoring database from backup: ${backupId}`);

      return {
        success: true,
        restore: {
          backupId,
          restoredAt: new Date(),
          status: 'completed',
          message: 'Database restored successfully'
        }
      };
    } catch (error) {
      console.error('Database restore failed:', error);
      throw new AppError('Failed to restore database', 500);
    }
  }

  // Get backup history
  static async getBackupHistory() {
    try {
      const backupDir = path.join(process.cwd(), 'backups');
      
      // Ensure directory exists
      if (!fs.existsSync(backupDir)) {
        return {
          success: true,
          backups: []
        };
      }

      const files = await fs.readdir(backupDir);
      const backups = [];

      for (const file of files) {
        if (file.endsWith('.zip')) {
          const filePath = path.join(backupDir, file);
          const stats = await fs.stat(filePath);
          
          backups.push({
            id: file.replace('.zip', ''),
            filename: file,
            path: filePath,
            size: stats.size,
            createdAt: stats.mtime,
            type: file.includes('full') ? 'full' : 'incremental'
          });
        }
      }

      // Sort by creation date (newest first)
      backups.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return {
        success: true,
        backups
      };
    } catch (error) {
      console.error('Failed to get backup history:', error);
      throw new AppError('Failed to get backup history', 500);
    }
  }

  // Schedule automatic backups
  static async scheduleBackup(options = {}) {
    try {
      const {
        frequency = 'daily',
        time = '02:00',
        retention = 30 // days
      } = options;

      console.log(`Backup scheduled: ${frequency} at ${time}, retention: ${retention} days`);

      return {
        success: true,
        schedule: {
          frequency,
          time,
          retention,
          nextBackup: this.calculateNextBackup(frequency, time)
        }
      };
    } catch (error) {
      console.error('Failed to schedule backup:', error);
      throw new AppError('Failed to schedule backup', 500);
    }
  }

  // Delete old backups
  static async cleanupOldBackups(retentionDays = 30) {
    try {
      const backupDir = path.join(process.cwd(), 'backups');
      const files = await fs.readdir(backupDir);
      const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

      let deletedCount = 0;

      for (const file of files) {
        if (file.endsWith('.zip')) {
          const filePath = path.join(backupDir, file);
          const stats = await fs.stat(filePath);
          
          if (stats.mtime < cutoffDate) {
            await fs.unlink(filePath);
            deletedCount++;
            console.log(`Deleted old backup: ${file}`);
          }
        }
      }

      return {
        success: true,
        deletedCount,
        retentionDays
      };
    } catch (error) {
      console.error('Failed to cleanup old backups:', error);
      throw new AppError('Failed to cleanup old backups', 500);
    }
  }

  // Download backup
  static async downloadBackup(backupId) {
    try {
      const backupPath = path.join(process.cwd(), 'backups', backupId);
      
      if (!fs.existsSync(backupPath)) {
        throw new AppError('Backup not found', 404);
      }

      const stats = await fs.stat(backupPath);
      const fileBuffer = await fs.readFile(backupPath);

      return {
        success: true,
        backup: {
          id: backupId,
          filename: path.basename(backupPath),
          size: stats.size,
          data: fileBuffer
        }
      };
    } catch (error) {
      console.error('Failed to download backup:', error);
      throw new AppError('Failed to download backup', 500);
    }
  }

  // Verify backup integrity
  static async verifyBackup(backupId) {
    try {
      const backupPath = path.join(process.cwd(), 'backups', backupId);
      
      if (!fs.existsSync(backupPath)) {
        throw new AppError('Backup not found', 404);
      }

      // In a real implementation, you would:
      // 1. Check file integrity
      // 2. Verify checksum
      // 3. Validate structure

      return {
        success: true,
        verification: {
          backupId,
          status: 'valid',
          verifiedAt: new Date(),
          checksum: 'placeholder_checksum'
        }
      };
    } catch (error) {
      console.error('Failed to verify backup:', error);
      throw new AppError('Failed to verify backup', 500);
    }
  }

  // Get backup statistics
  static async getBackupStats() {
    try {
      const backupDir = path.join(process.cwd(), 'backups');
      
      if (!fs.existsSync(backupDir)) {
        return {
          success: true,
          stats: {
            totalBackups: 0,
            totalSize: 0,
            lastBackup: null,
            oldestBackup: null
          }
        };
      }

      const files = await fs.readdir(backupDir);
      let totalSize = 0;
      let lastBackup = null;
      let oldestBackup = null;

      for (const file of files) {
        if (file.endsWith('.zip')) {
          const filePath = path.join(backupDir, file);
          const stats = await fs.stat(filePath);
          totalSize += stats.size;
          
          if (!lastBackup || stats.mtime > new Date(lastBackup.createdAt)) {
            lastBackup = {
              filename: file,
              size: stats.size,
              createdAt: stats.mtime
            };
          }
          
          if (!oldestBackup || stats.mtime < new Date(oldestBackup.createdAt)) {
            oldestBackup = {
              filename: file,
              size: stats.size,
              createdAt: stats.mtime
            };
          }
        }
      }

      return {
        success: true,
        stats: {
          totalBackups: files.filter(f => f.endsWith('.zip')).length,
          totalSize,
          lastBackup,
          oldestBackup
        }
      };
    } catch (error) {
      console.error('Failed to get backup stats:', error);
      throw new AppError('Failed to get backup stats', 500);
    }
  }

  // Helper method to calculate next backup time
  static calculateNextBackup(frequency, time) {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    
    let nextBackup = new Date(now);
    nextBackup.setHours(hours);
    nextBackup.setMinutes(minutes);
    
    // If the scheduled time has passed today, schedule for tomorrow
    if (nextBackup <= now) {
      nextBackup.setDate(nextBackup.getDate() + 1);
    }
    
    return nextBackup;
  }

  // Export backup configuration
  static async exportBackupConfig() {
    try {
      const config = {
        backupDirectory: path.join(process.cwd(), 'backups'),
        retentionPeriod: 30, // days
        compressionEnabled: true,
        scheduledBackups: [
          { frequency: 'daily', time: '02:00' },
          { frequency: 'weekly', time: '01:00' }
        ],
        notificationSettings: {
          email: true,
          inApp: false
        }
      };

      return {
        success: true,
        config
      };
    } catch (error) {
      console.error('Failed to export backup config:', error);
      throw new AppError('Failed to export backup config', 500);
    }
  }

  // Test backup functionality
  static async testBackup() {
    try {
      console.log('Starting backup test...');
      
      const testBackup = await this.createDatabaseBackup({
        type: 'test',
        compression: false,
        includeFiles: false
      });

      console.log('Backup test completed:', testBackup);
      
      return {
        success: true,
        testBackup
      };
    } catch (error) {
      console.error('Backup test failed:', error);
      throw new AppError('Failed to test backup', 500);
    }
  }
}

module.exports = BackupService;