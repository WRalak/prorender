const Report = require('../models/Report');
const AppError = require('../middleware/errorHandler');
const { catchAsync } = require('../middleware/errorHandler');
const fs = require('fs').promises;
const path = require('path');

// Get all reports for the current user
exports.getMyReports = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, type, status } = req.query;
  const query = { generatedBy: req.user.id };
  
  if (type) query.type = type;
  if (status) query.status = status;

  const reports = await Report.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Report.countDocuments(query);

  res.json({
    success: true,
    reports,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// Get a specific report
exports.getReport = catchAsync(async (req, res, next) => {
  const report = await Report.findOne({
    _id: req.params.id,
    generatedBy: req.user.id
  });

  if (!report) {
    return next(new AppError('Report not found', 404));
  }

  // Update access count and last accessed
  report.metadata.lastAccessed = new Date();
  report.metadata.accessCount += 1;
  await report.save();

  res.json({
    success: true,
    report
  });
});

// Create a new report
exports.createReport = catchAsync(async (req, res, next) => {
  const { title, type, description, parameters, format = 'pdf' } = req.body;

  // Validate required fields
  if (!title || !type) {
    return next(new AppError('Title and type are required', 400));
  }

  // Create report with 'generating' status
  const report = await Report.create({
    title,
    type,
    description,
    generatedBy: req.user.id,
    parameters,
    format,
    status: 'generating'
  });

  // In a real implementation, you would:
  // 1. Queue the report generation job
  // 2. Process it in the background
  // 3. Update status when complete
  
  // For now, we'll simulate the process
  setTimeout(async () => {
    try {
      // Generate report data based on type
      let reportData = {};
      
      switch (type) {
        case 'user_activity':
          reportData = await generateUserActivityReport(parameters);
          break;
        case 'property_summary':
          reportData = await generatePropertySummaryReport(parameters);
          break;
        case 'financial_summary':
          reportData = await generateFinancialSummaryReport(parameters);
          break;
        default:
          reportData = { message: 'Report generated successfully' };
      }

      report.data = reportData;
      report.status = 'completed';
      report.completedAt = new Date();
      await report.save();
    } catch (error) {
      report.status = 'failed';
      report.error = error.message;
      await report.save();
    }
  }, 3000);

  res.status(201).json({
    success: true,
    report,
    message: 'Report generation started'
  });
});

// Delete a report
exports.deleteReport = catchAsync(async (req, res, next) => {
  const report = await Report.findOne({
    _id: req.params.id,
    generatedBy: req.user.id
  });

  if (!report) {
    return next(new AppError('Report not found', 404));
  }

  // Delete associated file if it exists
  if (report.fileUrl) {
    try {
      const filePath = path.join(process.cwd(), report.fileUrl);
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error deleting report file:', error);
    }
  }

  await Report.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Report deleted successfully'
  });
});

// Share a report
exports.shareReport = catchAsync(async (req, res, next) => {
  const { shareable, expiresIn } = req.body;
  
  const report = await Report.findOne({
    _id: req.params.id,
    generatedBy: req.user.id
  });

  if (!report) {
    return next(new AppError('Report not found', 404));
  }

  report.shareable = shareable;
  
  if (shareable) {
    report.shareExpiresAt = new Date(Date.now() + (expiresIn || 7 * 24 * 60 * 60 * 1000));
  } else {
    report.shareToken = undefined;
    report.shareExpiresAt = undefined;
  }

  await report.save();

  res.json({
    success: true,
    report,
    message: shareable ? 'Report is now shareable' : 'Report sharing disabled'
  });
});

// Download a report
exports.downloadReport = catchAsync(async (req, res, next) => {
  const report = await Report.findOne({
    _id: req.params.id,
    generatedBy: req.user.id
  });

  if (!report) {
    return next(new AppError('Report not found', 404));
  }

  if (report.status !== 'completed') {
    return next(new AppError('Report is not ready for download', 400));
  }

  // In a real implementation, you would:
  // 1. Generate the file in the requested format
  // 2. Store it temporarily
  // 3. Return the file URL or stream the file

  res.json({
    success: true,
    downloadUrl: `/api/reports/${report._id}/file`,
    filename: `${report.title}.${report.format}`,
    message: 'Download link generated'
  });
});

// Helper functions for report generation
async function generateUserActivityReport(parameters) {
  // Implementation for user activity report
  return {
    summary: {
      totalUsers: 0,
      activeUsers: 0,
      newUsers: 0
    },
    data: []
  };
}

async function generatePropertySummaryReport(parameters) {
  // Implementation for property summary report
  return {
    summary: {
      totalProperties: 0,
      availableProperties: 0,
      occupiedProperties: 0
    },
    data: []
  };
}

async function generateFinancialSummaryReport(parameters) {
  // Implementation for financial summary report
  return {
    summary: {
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0
    },
    data: []
  };
}