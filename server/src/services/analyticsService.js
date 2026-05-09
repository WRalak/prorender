const mongoose = require('mongoose');
const { logger } = require('../config/logger');
const cacheService = require('./cacheService');

// Models
const User = require('../models/User');
const Property = require('../models/Property');
const Application = require('../models/Application');
const Payment = require('../models/Payment');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const AuditLog = require('../models/AuditLog');

class AnalyticsService {
  constructor() {
    this.cacheTTL = 15 * 60; // 15 minutes
  }

  // Get dashboard statistics
  async getDashboardStats(timeRange = '30d') {
    try {
      const cacheKey = `dashboard_stats:${timeRange}`;
      
      // Try to get from cache first
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }

      const stats = await Promise.all([
        this.getUserStats(timeRange),
        this.getPropertyStats(timeRange),
        this.getApplicationStats(timeRange),
        this.getPaymentStats(timeRange),
        this.getMaintenanceStats(timeRange),
        this.getRevenueStats(timeRange),
      ]);

      const dashboardStats = {
        users: stats[0],
        properties: stats[1],
        applications: stats[2],
        payments: stats[3],
        maintenance: stats[4],
        revenue: stats[5],
        generatedAt: new Date(),
      };

      // Cache the results
      await cacheService.set(cacheKey, dashboardStats, this.cacheTTL);
      
      return dashboardStats;

    } catch (error) {
      logger.error('Error getting dashboard stats:', error);
      throw error;
    }
  }

  // Get user statistics
  async getUserStats(timeRange = '30d') {
    try {
      const { startDate, endDate } = this.parseTimeRange(timeRange);
      
      const [
        totalUsers,
        newUsers,
        activeUsers,
        verifiedUsers,
        usersByRole,
        userGrowthData,
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
        User.countDocuments({ lastLoginAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
        User.countDocuments({ verified: true }),
        this.getUsersByRole(),
        this.getUserGrowthData(timeRange),
      ]);

      return {
        total: totalUsers,
        new: newUsers,
        active: activeUsers,
        verified: verifiedUsers,
        verificationRate: totalUsers > 0 ? ((verifiedUsers / totalUsers) * 100).toFixed(1) : 0,
        byRole: usersByRole,
        growth: userGrowthData,
      };

    } catch (error) {
      logger.error('Error getting user stats:', error);
      throw error;
    }
  }

  // Get property statistics
  async getPropertyStats(timeRange = '30d') {
    try {
      const { startDate, endDate } = this.parseTimeRange(timeRange);
      
      const [
        totalProperties,
        newProperties,
        activeProperties,
        propertiesByType,
        propertiesByStatus,
        propertyGrowthData,
        averagePrice,
      ] = await Promise.all([
        Property.countDocuments(),
        Property.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
        Property.countDocuments({ status: 'active' }),
        this.getPropertiesByType(),
        this.getPropertiesByStatus(),
        this.getPropertyGrowthData(timeRange),
        this.getAveragePropertyPrice(),
      ]);

      return {
        total: totalProperties,
        new: newProperties,
        active: activeProperties,
        activeRate: totalProperties > 0 ? ((activeProperties / totalProperties) * 100).toFixed(1) : 0,
        byType: propertiesByType,
        byStatus: propertiesByStatus,
        growth: propertyGrowthData,
        averagePrice,
      };

    } catch (error) {
      logger.error('Error getting property stats:', error);
      throw error;
    }
  }

  // Get application statistics
  async getApplicationStats(timeRange = '30d') {
    try {
      const { startDate, endDate } = this.parseTimeRange(timeRange);
      
      const [
        totalApplications,
        newApplications,
        applicationsByStatus,
        applicationConversionRate,
        applicationTrendData,
        averageProcessingTime,
      ] = await Promise.all([
        Application.countDocuments(),
        Application.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
        this.getApplicationsByStatus(),
        this.getApplicationConversionRate(),
        this.getApplicationTrendData(timeRange),
        this.getAverageProcessingTime(),
      ]);

      return {
        total: totalApplications,
        new: newApplications,
        byStatus: applicationsByStatus,
        conversionRate: applicationConversionRate,
        trend: applicationTrendData,
        averageProcessingTime,
      };

    } catch (error) {
      logger.error('Error getting application stats:', error);
      throw error;
    }
  }

  // Get payment statistics
  async getPaymentStats(timeRange = '30d') {
    try {
      const { startDate, endDate } = this.parseTimeRange(timeRange);
      
      const [
        totalPayments,
        newPayments,
        paymentsByStatus,
        paymentsByType,
        totalRevenue,
        averagePaymentAmount,
        paymentTrendData,
      ] = await Promise.all([
        Payment.countDocuments(),
        Payment.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
        this.getPaymentsByStatus(),
        this.getPaymentsByType(),
        this.getTotalRevenue(timeRange),
        this.getAveragePaymentAmount(),
        this.getPaymentTrendData(timeRange),
      ]);

      return {
        total: totalPayments,
        new: newPayments,
        byStatus: paymentsByStatus,
        byType: paymentsByType,
        revenue: totalRevenue,
        averageAmount: averagePaymentAmount,
        trend: paymentTrendData,
      };

    } catch (error) {
      logger.error('Error getting payment stats:', error);
      throw error;
    }
  }

  // Get maintenance statistics
  async getMaintenanceStats(timeRange = '30d') {
    try {
      const { startDate, endDate } = this.parseTimeRange(timeRange);
      
      const [
        totalRequests,
        newRequests,
        requestsByStatus,
        requestsByPriority,
        requestsByCategory,
        averageResolutionTime,
        resolutionTrendData,
      ] = await Promise.all([
        MaintenanceRequest.countDocuments(),
        MaintenanceRequest.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
        this.getMaintenanceRequestsByStatus(),
        this.getMaintenanceRequestsByPriority(),
        this.getMaintenanceRequestsByCategory(),
        this.getAverageResolutionTime(),
        this.getResolutionTrendData(timeRange),
      ]);

      return {
        total: totalRequests,
        new: newRequests,
        byStatus: requestsByStatus,
        byPriority: requestsByPriority,
        byCategory: requestsByCategory,
        averageResolutionTime,
        resolutionTrend: resolutionTrendData,
      };

    } catch (error) {
      logger.error('Error getting maintenance stats:', error);
      throw error;
    }
  }

  // Get revenue statistics
  async getRevenueStats(timeRange = '30d') {
    try {
      const { startDate, endDate } = this.parseTimeRange(timeRange);
      
      const [
        totalRevenue,
        revenueByType,
        revenueTrendData,
        revenueGrowthRate,
        topRevenueProperties,
      ] = await Promise.all([
        this.getTotalRevenue(timeRange),
        this.getRevenueByType(timeRange),
        this.getRevenueTrendData(timeRange),
        this.getRevenueGrowthRate(timeRange),
        this.getTopRevenueProperties(timeRange),
      ]);

      return {
        total: totalRevenue,
        byType: revenueByType,
        trend: revenueTrendData,
        growthRate: revenueGrowthRate,
        topProperties: topRevenueProperties,
      };

    } catch (error) {
      logger.error('Error getting revenue stats:', error);
      throw error;
    }
  }

  // Helper methods for data aggregation

  async getUsersByRole() {
    const pipeline = [
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ];

    const results = await User.aggregate(pipeline);
    return results.map(item => ({ role: item._id, count: item.count }));
  }

  async getUserGrowthData(timeRange) {
    const { startDate, endDate } = this.parseTimeRange(timeRange);
    const days = this.getDaysBetweenDates(startDate, endDate);
    
    const pipeline = [
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ];

    const results = await User.aggregate(pipeline);
    return this.fillMissingDays(results, days);
  }

  async getPropertiesByType() {
    const pipeline = [
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ];

    const results = await Property.aggregate(pipeline);
    return results.map(item => ({ type: item._id, count: item.count }));
  }

  async getPropertiesByStatus() {
    const pipeline = [
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ];

    const results = await Property.aggregate(pipeline);
    return results.map(item => ({ status: item._id, count: item.count }));
  }

  async getPropertyGrowthData(timeRange) {
    const { startDate, endDate } = this.parseTimeRange(timeRange);
    const days = this.getDaysBetweenDates(startDate, endDate);
    
    const pipeline = [
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ];

    const results = await Property.aggregate(pipeline);
    return this.fillMissingDays(results, days);
  }

  async getAveragePropertyPrice() {
    const result = await Property.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, averagePrice: { $avg: '$price' } } }
    ]);

    return result.length > 0 ? result[0].averagePrice : 0;
  }

  async getApplicationsByStatus() {
    const pipeline = [
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ];

    const results = await Application.aggregate(pipeline);
    return results.map(item => ({ status: item._id, count: item.count }));
  }

  async getApplicationConversionRate() {
    const [total, approved] = await Promise.all([
      Application.countDocuments(),
      Application.countDocuments({ status: 'approved' })
    ]);

    return total > 0 ? ((approved / total) * 100).toFixed(1) : 0;
  }

  async getApplicationTrendData(timeRange) {
    const { startDate, endDate } = this.parseTimeRange(timeRange);
    const days = this.getDaysBetweenDates(startDate, endDate);
    
    const pipeline = [
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ];

    const results = await Application.aggregate(pipeline);
    return this.fillMissingDays(results, days);
  }

  async getAverageProcessingTime() {
    const pipeline = [
      {
        $match: {
          status: { $in: ['approved', 'rejected'] },
          createdAt: { $exists: true },
          updatedAt: { $exists: true }
        }
      },
      {
        $project: {
          processingTime: {
            $divide: [
              { $subtract: ['$updatedAt', '$createdAt'] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          averageProcessingTime: { $avg: '$processingTime' }
        }
      }
    ];

    const result = await Application.aggregate(pipeline);
    return result.length > 0 ? result[0].averageProcessingTime.toFixed(1) : 0;
  }

  async getPaymentsByStatus() {
    const pipeline = [
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ];

    const results = await Payment.aggregate(pipeline);
    return results.map(item => ({ status: item._id, count: item.count }));
  }

  async getPaymentsByType() {
    const pipeline = [
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ];

    const results = await Payment.aggregate(pipeline);
    return results.map(item => ({ type: item._id, count: item.count }));
  }

  async getTotalRevenue(timeRange) {
    const { startDate, endDate } = this.parseTimeRange(timeRange);
    
    const result = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    return result.length > 0 ? result[0].total : 0;
  }

  async getAveragePaymentAmount() {
    const result = await Payment.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: null,
          averageAmount: { $avg: '$amount' }
        }
      }
    ]);

    return result.length > 0 ? result[0].averageAmount : 0;
  }

  async getPaymentTrendData(timeRange) {
    const { startDate, endDate } = this.parseTimeRange(timeRange);
    const days = this.getDaysBetweenDates(startDate, endDate);
    
    const pipeline = [
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ];

    const results = await Payment.aggregate(pipeline);
    return this.fillMissingDays(results, days, ['amount', 'count']);
  }

  async getMaintenanceRequestsByStatus() {
    const pipeline = [
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ];

    const results = await MaintenanceRequest.aggregate(pipeline);
    return results.map(item => ({ status: item._id, count: item.count }));
  }

  async getMaintenanceRequestsByPriority() {
    const pipeline = [
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ];

    const results = await MaintenanceRequest.aggregate(pipeline);
    return results.map(item => ({ priority: item._id, count: item.count }));
  }

  async getMaintenanceRequestsByCategory() {
    const pipeline = [
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ];

    const results = await MaintenanceRequest.aggregate(pipeline);
    return results.map(item => ({ category: item._id, count: item.count }));
  }

  async getAverageResolutionTime() {
    const pipeline = [
      {
        $match: {
          status: 'resolved',
          createdAt: { $exists: true },
          completedDate: { $exists: true }
        }
      },
      {
        $project: {
          resolutionTime: {
            $divide: [
              { $subtract: ['$completedDate', '$createdAt'] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          averageResolutionTime: { $avg: '$resolutionTime' }
        }
      }
    ];

    const result = await MaintenanceRequest.aggregate(pipeline);
    return result.length > 0 ? result[0].averageResolutionTime.toFixed(1) : 0;
  }

  async getResolutionTrendData(timeRange) {
    const { startDate, endDate } = this.parseTimeRange(timeRange);
    const days = this.getDaysBetweenDates(startDate, endDate);
    
    const pipeline = [
      {
        $match: {
          status: 'resolved',
          completedDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedDate' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ];

    const results = await MaintenanceRequest.aggregate(pipeline);
    return this.fillMissingDays(results, days);
  }

  async getRevenueByType(timeRange) {
    const { startDate, endDate } = this.parseTimeRange(timeRange);
    
    const pipeline = [
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$type',
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { amount: -1 } }
    ];

    const results = await Payment.aggregate(pipeline);
    return results.map(item => ({ type: item._id, amount: item.amount, count: item.count }));
  }

  async getRevenueTrendData(timeRange) {
    const { startDate, endDate } = this.parseTimeRange(timeRange);
    const days = this.getDaysBetweenDates(startDate, endDate);
    
    const pipeline = [
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ];

    const results = await Payment.aggregate(pipeline);
    return this.fillMissingDays(results, days, ['revenue']);
  }

  async getRevenueGrowthRate(timeRange) {
    const { startDate, endDate } = this.parseTimeRange(timeRange);
    const previousPeriodStart = new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime()));
    
    const [currentRevenue, previousRevenue] = await Promise.all([
      this.getTotalRevenue(timeRange),
      this.getTotalRevenueForPeriod(previousPeriodStart, startDate)
    ]);

    if (previousRevenue === 0) return 0;
    return (((currentRevenue - previousRevenue) / previousRevenue) * 100).toFixed(1);
  }

  async getTotalRevenueForPeriod(startDate, endDate) {
    const result = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    return result.length > 0 ? result[0].total : 0;
  }

  async getTopRevenueProperties(timeRange, limit = 10) {
    const { startDate, endDate } = this.parseTimeRange(timeRange);
    
    const pipeline = [
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $lookup: {
          from: 'applications',
          localField: 'application',
          foreignField: '_id',
          as: 'application'
        }
      },
      {
        $lookup: {
          from: 'properties',
          localField: 'application.property',
          foreignField: '_id',
          as: 'property'
        }
      },
      { $unwind: '$application' },
      { $unwind: '$property' },
      {
        $group: {
          _id: '$property._id',
          title: { $first: '$property.title' },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: limit }
    ];

    return await Payment.aggregate(pipeline);
  }

  // Utility methods
  parseTimeRange(timeRange) {
    const endDate = new Date();
    let startDate;

    switch (timeRange) {
      case '7d':
        startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return { startDate, endDate };
  }

  getDaysBetweenDates(startDate, endDate) {
    const days = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      days.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }

  fillMissingDays(data, days, fields = ['count']) {
    const dataMap = new Map();
    
    data.forEach(item => {
      dataMap.set(item._id, item);
    });

    return days.map(day => {
      const existing = dataMap.get(day);
      if (existing) {
        return existing;
      }

      const filled = { _id: day };
      fields.forEach(field => {
        filled[field] = 0;
      });
      return filled;
    });
  }

  // Generate reports
  async generateReport(reportType, timeRange = '30d', format = 'json') {
    try {
      let data;

      switch (reportType) {
        case 'dashboard':
          data = await this.getDashboardStats(timeRange);
          break;
        case 'users':
          data = await this.getUserStats(timeRange);
          break;
        case 'properties':
          data = await this.getPropertyStats(timeRange);
          break;
        case 'applications':
          data = await this.getApplicationStats(timeRange);
          break;
        case 'payments':
          data = await this.getPaymentStats(timeRange);
          break;
        case 'maintenance':
          data = await this.getMaintenanceStats(timeRange);
          break;
        case 'revenue':
          data = await this.getRevenueStats(timeRange);
          break;
        default:
          throw new Error('Invalid report type');
      }

      return {
        type: reportType,
        timeRange,
        format,
        data,
        generatedAt: new Date(),
      };

    } catch (error) {
      logger.error('Error generating report:', error);
      throw error;
    }
  }

  // Export analytics data
  async exportData(data, format = 'csv') {
    try {
      switch (format) {
        case 'csv':
          return this.convertToCSV(data);
        case 'json':
          return JSON.stringify(data, null, 2);
        case 'xlsx':
          // Would need a library like exceljs
          throw new Error('XLSX export not implemented yet');
        default:
          throw new Error('Unsupported export format');
      }
    } catch (error) {
      logger.error('Error exporting data:', error);
      throw error;
    }
  }

  convertToCSV(data) {
    // Simple CSV conversion - would need to be enhanced for complex nested data
    if (Array.isArray(data) && data.length > 0) {
      const headers = Object.keys(data[0]);
      const csvRows = [headers.join(',')];
      
      data.forEach(row => {
        const values = headers.map(header => {
          const value = row[header];
          return typeof value === 'string' ? `"${value}"` : value;
        });
        csvRows.push(values.join(','));
      });
      
      return csvRows.join('\n');
    }
    
    return JSON.stringify(data);
  }
}

// Create singleton instance
const analyticsService = new AnalyticsService();

module.exports = analyticsService;
