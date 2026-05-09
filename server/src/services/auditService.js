const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const AppError = require('../middleware/errorHandler');
const { catchAsync } = require('../middleware/errorHandler');

class AuditService {
  // Create audit log entry
  static async createLog(entry) {
    try {
      const auditLog = await AuditLog.create({
        user: entry.user,
        action: entry.action,
        resource: entry.resource,
        details: entry.details || {},
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        timestamp: new Date(),
        severity: entry.severity || 'info',
        category: entry.category || 'general'
      });

      return {
        success: true,
        auditLog
      };
    } catch (error) {
      console.error('Failed to create audit log:', error);
      throw new AppError('Failed to create audit log', 500);
    }
  }

  // Get audit logs with filtering
  static async getLogs(filters = {}) {
    try {
      const {
        page = 1,
        limit = 50,
        user,
        action,
        resource,
        category,
        severity,
        startDate,
        endDate,
        search
      } = filters;

      // Build query
      const query = {};
      
      if (user) {
        query.user = user;
      }
      
      if (action) {
        query.action = action;
      }
      
      if (resource) {
        query.resource = resource;
      }
      
      if (category) {
        query.category = category;
      }
      
      if (severity) {
        query.severity = severity;
      }

      // Date range filtering
      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) {
          query.timestamp.$gte = new Date(startDate);
        }
        if (endDate) {
          query.timestamp.$lte = new Date(endDate);
        }
      }

      // Text search
      if (search) {
        query.$or = [
          { 'details.message': { $regex: search, $options: 'i' } },
          { 'details.description': { $regex: search, $options: 'i' } },
          { action: { $regex: search, $options: 'i' } },
          { resource: { $regex: search, $options: 'i' } }
        ];
      }

      const skip = (page - 1) * limit;
      
      const logs = await AuditLog.find(query)
        .populate('user', 'name email')
        .sort({ timestamp: -1 })
        .limit(limit)
        .skip(skip);

      const total = await AuditLog.countDocuments(query);

      return {
        success: true,
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        filters: {
          applied: filters,
          count: logs.length
        }
      };
    } catch (error) {
      console.error('Failed to get audit logs:', error);
      throw new AppError('Failed to get audit logs', 500);
    }
  }

  // Get audit statistics
  static async getStats(timeRange = '24h') {
    try {
      const now = new Date();
      let startDate;

      switch (timeRange) {
        case '1h':
          startDate = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }

      const stats = await AuditLog.aggregate([
        {
          $match: {
            timestamp: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$action',
            count: { $sum: 1 },
            users: { $addToSet: '$user' }
          }
        },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: '$severity',
            count: { $sum: 1 }
          }
        }
      ]);

      return {
        success: true,
        timeRange,
        stats: {
          totalLogs: await AuditLog.countDocuments({ timestamp: { $gte: startDate } }),
          actionBreakdown: stats[0] || [],
          categoryBreakdown: stats[1] || [],
          severityBreakdown: stats[2] || [],
          topUsers: stats[3] ? stats[3].users : []
        }
      };
    } catch (error) {
      console.error('Failed to get audit stats:', error);
      throw new AppError('Failed to get audit stats', 500);
    }
  }

  // Get user activity logs
  static async getUserActivity(userId, timeRange = '24h') {
    try {
      const now = new Date();
      let startDate;

      switch (timeRange) {
        case '1h':
          startDate = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }

      const logs = await AuditLog.find({
        user: userId,
        timestamp: { $gte: startDate }
      })
        .populate('user', 'name email')
        .sort({ timestamp: -1 })
        .limit(100);

      return {
        success: true,
        userId,
        timeRange,
        activity: logs
      };
    } catch (error) {
      console.error('Failed to get user activity:', error);
      throw new AppError('Failed to get user activity', 500);
    }
  }

  // Security event logging
  static async logSecurityEvent(event) {
    try {
      const securityLog = await this.createLog({
        user: event.user,
        action: event.action,
        resource: event.resource,
        details: event.details || {},
        severity: 'high',
        category: 'security',
        ipAddress: event.ipAddress,
        userAgent: event.userAgent
      });

      // Trigger security alerts for critical events
      if (event.action === 'login_failed' || event.action === 'unauthorized_access') {
        // In a real implementation, you would send notifications to admins
        console.warn(`SECURITY ALERT: ${event.action} by ${event.ipAddress}`);
      }

      return securityLog;
    } catch (error) {
      console.error('Failed to log security event:', error);
      throw new AppError('Failed to log security event', 500);
    }
  }

  // Data access logging
  static async logDataAccess(userId, resource, action, details = {}) {
    try {
      return await this.createLog({
        user: userId,
        action: `data_${action}`,
        resource,
        details,
        category: 'data_access',
        severity: 'medium'
      });
    } catch (error) {
      console.error('Failed to log data access:', error);
      throw new AppError('Failed to log data access', 500);
    }
  }

  // System event logging
  static async logSystemEvent(event, details = {}) {
    try {
      return await this.createLog({
        user: 'system',
        action: event.action,
        resource: event.resource,
        details,
        category: 'system',
        severity: event.severity || 'info'
      });
    } catch (error) {
      console.error('Failed to log system event:', error);
      throw new AppError('Failed to log system event', 500);
    }
  }

  // Compliance reporting
  static async generateComplianceReport(reportType = 'all', dateRange = '30d') {
    try {
      const now = new Date();
      let startDate;

      switch (dateRange) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      const report = await AuditLog.aggregate([
        {
          $match: {
            timestamp: { $gte: startDate },
            category: { $in: ['security', 'data_access', 'compliance'] }
          }
        },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: '$severity',
            count: { $sum: 1 }
          }
        }
      ]);

      return {
        success: true,
        reportType,
        dateRange,
        generatedAt: new Date(),
        data: {
          summary: report,
          totalEvents: await AuditLog.countDocuments({
            timestamp: { $gte: startDate },
            category: { $in: ['security', 'data_access', 'compliance'] }
          })
        }
      };
    } catch (error) {
      console.error('Failed to generate compliance report:', error);
      throw new AppError('Failed to generate compliance report', 500);
    }
  }

  // Export audit data
  static async exportAuditData(filters = {}) {
    try {
      const { format = 'json', dateRange = '30d' } = filters;
      
      const logs = await this.getLogs({ ...filters, dateRange });
      
      let exportData;
      let contentType;

      switch (format.toLowerCase()) {
        case 'csv':
          exportData = this.convertToCSV(logs.logs);
          contentType = 'text/csv';
          break;
        case 'excel':
          exportData = this.convertToExcel(logs.logs);
          contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          break;
        default:
          exportData = JSON.stringify(logs, null, 2);
          contentType = 'application/json';
      }

      return {
        success: true,
        format,
        contentType,
        data: exportData,
        filename: `audit_logs_${new Date().toISOString().split('T')[0]}.${format}`
      };
    } catch (error) {
      console.error('Failed to export audit data:', error);
      throw new AppError('Failed to export audit data', 500);
    }
  }

  // Helper method to convert to CSV
  static convertToCSV(logs) {
    const headers = ['timestamp', 'user', 'action', 'resource', 'severity', 'category'];
    const csvRows = [headers.join(',')];

    logs.forEach(log => {
      const row = [
        log.timestamp,
        log.user?.name || '',
        log.action,
        log.resource,
        log.severity,
        log.category
      ];
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  }

  // Helper method to convert to Excel (simplified)
  static convertToExcel(logs) {
    // In a real implementation, you would use a library like xlsx
    // For now, return JSON formatted for Excel
    return JSON.stringify(logs, null, 2);
  }
}

module.exports = AuditService;