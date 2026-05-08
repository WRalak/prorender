const MaintenanceRequest = require('../models/MaintenanceRequest');
const Property = require('../models/Property');
const User = require('../models/User');
const Notification = require('../models/Notification');
const AppError = require('../middleware/errorHandler');
const { catchAsync } = require('../middleware/errorHandler');

exports.getMaintenanceRequests = catchAsync(async (req, res, next) => {
  const { status, priority, page = 1, limit = 10 } = req.query;
  const query = {};
  
  if (status) query.status = status;
  if (priority) query.priority = priority;
  
  // Filter based on user role
  if (req.user.role === 'tenant') {
    query.tenant = req.user.id;
  } else if (req.user.role === 'agent') {
    // Get properties managed by this agent
    const agentProperties = await Property.find({ agent: req.user.id }).select('_id');
    query.property = { $in: agentProperties.map(p => p._id) };
  }

  const requests = await MaintenanceRequest.find(query)
    .populate('property', 'title address')
    .populate('tenant', 'name email avatar')
    .populate('agent', 'name email avatar')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await MaintenanceRequest.countDocuments(query);

  res.json({
    success: true,
    requests,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

exports.getMaintenanceRequest = catchAsync(async (req, res, next) => {
  const request = await MaintenanceRequest.findById(req.params.id)
    .populate('property', 'title address')
    .populate('tenant', 'name email avatar')
    .populate('agent', 'name email avatar')
    .populate('images');

  if (!request) {
    return next(new AppError('Maintenance request not found', 404));
  }

  // Check permissions
  if (req.user.role === 'tenant' && request.tenant._id.toString() !== req.user.id) {
    return next(new AppError('Not authorized to view this request', 403));
  }

  res.json({
    success: true,
    request
  });
});

exports.createMaintenanceRequest = catchAsync(async (req, res, next) => {
  const { propertyId, title, description, priority = 'medium', images } = req.body;

  const property = await Property.findById(propertyId);
  if (!property) {
    return next(new AppError('Property not found', 404));
  }

  // Check if tenant is associated with this property
  if (req.user.role === 'tenant') {
    // For now, allow any tenant to create requests (in real app, check lease)
  }

  const request = await MaintenanceRequest.create({
    property: propertyId,
    tenant: req.user.id,
    agent: property.agent,
    title,
    description,
    priority,
    images: images || [],
    status: 'pending'
  });

  // Notify the agent
  await Notification.create({
    user: property.agent,
    type: 'maintenance_request',
    title: 'New Maintenance Request',
    message: `A new maintenance request has been submitted for ${property.title}`,
    relatedId: request._id,
    relatedModel: 'MaintenanceRequest'
  });

  const populatedRequest = await MaintenanceRequest.findById(request._id)
    .populate('property', 'title address')
    .populate('tenant', 'name email avatar')
    .populate('agent', 'name email avatar');

  res.status(201).json({
    success: true,
    request: populatedRequest
  });
});

exports.updateMaintenanceRequest = catchAsync(async (req, res, next) => {
  const { status, notes, estimatedCost, scheduledDate } = req.body;
  const { id } = req.params;

  const request = await MaintenanceRequest.findById(id);
  if (!request) {
    return next(new AppError('Maintenance request not found', 404));
  }

  // Check permissions
  if (req.user.role === 'tenant') {
    return next(new AppError('Tenants cannot update maintenance requests', 403));
  }

  if (status) request.status = status;
  if (notes) request.notes = notes;
  if (estimatedCost) request.estimatedCost = estimatedCost;
  if (scheduledDate) request.scheduledDate = scheduledDate;
  
  if (status === 'in_progress') {
    request.startedAt = new Date();
  } else if (status === 'completed') {
    request.completedAt = new Date();
  }

  await request.save();

  // Notify the tenant
  await Notification.create({
    user: request.tenant,
    type: 'maintenance_update',
    title: 'Maintenance Request Updated',
    message: `Your maintenance request "${request.title}" has been updated to ${status}`,
    relatedId: request._id,
    relatedModel: 'MaintenanceRequest'
  });

  const populatedRequest = await MaintenanceRequest.findById(request._id)
    .populate('property', 'title address')
    .populate('tenant', 'name email avatar')
    .populate('agent', 'name email avatar');

  res.json({
    success: true,
    request: populatedRequest
  });
});

exports.addMaintenanceNote = catchAsync(async (req, res, next) => {
  const { content } = req.body;
  const { id } = req.params;

  const request = await MaintenanceRequest.findById(id);
  if (!request) {
    return next(new AppError('Maintenance request not found', 404));
  }

  // Check permissions
  if (req.user.role === 'tenant' && request.tenant.toString() !== req.user.id) {
    return next(new AppError('Not authorized to add notes to this request', 403));
  }

  const note = {
    author: req.user.id,
    content,
    createdAt: new Date()
  };

  request.notes.push(note);
  await request.save();

  // Notify other party
  const notifyUser = req.user.role === 'tenant' ? request.agent : request.tenant;
  await Notification.create({
    user: notifyUser,
    type: 'maintenance_note',
    title: 'New Note Added',
    message: `A new note has been added to maintenance request "${request.title}"`,
    relatedId: request._id,
    relatedModel: 'MaintenanceRequest'
  });

  res.status(201).json({
    success: true,
    note
  });
});

exports.uploadMaintenanceImages = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const request = await MaintenanceRequest.findById(id);
  if (!request) {
    return next(new AppError('Maintenance request not found', 404));
  }

  // Check permissions
  if (req.user.role === 'tenant' && request.tenant.toString() !== req.user.id) {
    return next(new AppError('Not authorized to upload images to this request', 403));
  }

  const images = req.files.map(file => ({
    url: file.path,
    filename: file.filename,
    uploadedBy: req.user.id,
    uploadedAt: new Date()
  }));

  request.images.push(...images);
  await request.save();

  res.status(201).json({
    success: true,
    images
  });
});

exports.getMaintenanceStats = catchAsync(async (req, res, next) => {
  const { timeRange = 'month' } = req.query;
  
  let startDate;
  const now = new Date();
  
  switch (timeRange) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  const pipeline = [
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ];

  const statusStats = await MaintenanceRequest.aggregate(pipeline);

  const priorityStats = await MaintenanceRequest.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 }
      }
    }
  ]);

  res.json({
    success: true,
    stats: {
      byStatus: statusStats,
      byPriority: priorityStats
    }
  });
});

module.exports = {
  getMaintenanceRequests,
  getMaintenanceRequest,
  createMaintenanceRequest,
  updateMaintenanceRequest,
  addMaintenanceNote,
  uploadMaintenanceImages,
  getMaintenanceStats
};
