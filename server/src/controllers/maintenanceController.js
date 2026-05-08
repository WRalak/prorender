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
    .populate('notes.addedBy', 'name email');

  if (!request) {
    return next(new AppError('Maintenance request not found', 404));
  }

  // Check permissions
  if (req.user.role === 'tenant' && request.tenant._id.toString() !== req.user.id) {
    return next(new AppError('Not authorized to view this request', 403));
  }

  if (req.user.role === 'agent' && request.agent._id.toString() !== req.user.id) {
    return next(new AppError('Not authorized to view this request', 403));
  }

  res.json({
    success: true,
    request
  });
});

exports.createMaintenanceRequest = catchAsync(async (req, res, next) => {
  const { propertyId, title, description, priority, category, preferredDate } = req.body;

  const property = await Property.findById(propertyId);
  if (!property) {
    return next(new AppError('Property not found', 404));
  }

  // Check permissions
  if (req.user.role === 'tenant' && property.tenant.toString() !== req.user.id) {
    return next(new AppError('Not authorized to create request for this property', 403));
  }

  const request = await MaintenanceRequest.create({
    property: propertyId,
    tenant: req.user.id,
    agent: property.agent,
    title,
    description,
    priority,
    category,
    preferredDate,
    status: 'pending'
  });

  // Notify agent
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
  const updates = req.body;
  const { id } = req.params;

  const request = await MaintenanceRequest.findById(id);
  if (!request) {
    return next(new AppError('Maintenance request not found', 404));
  }

  // Check permissions
  if (req.user.role === 'tenant' && request.tenant.toString() !== req.user.id) {
    return next(new AppError('Not authorized to update this request', 403));
  }

  if (req.user.role === 'agent' && request.agent.toString() !== req.user.id) {
    return next(new AppError('Not authorized to update this request', 403));
  }

  Object.keys(updates).forEach(key => {
    request[key] = updates[key];
  });

  if (updates.status === 'resolved') {
    request.resolvedAt = new Date();
    request.resolvedBy = req.user.id;
  }

  await request.save();

  // Notify tenant if resolved
  if (updates.status === 'resolved' && req.user.role === 'agent') {
    await Notification.create({
      user: request.tenant,
      type: 'maintenance_resolved',
      title: 'Maintenance Request Resolved',
      message: `Your maintenance request has been marked as resolved`,
      relatedId: request._id,
      relatedModel: 'MaintenanceRequest'
    });
  }

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
  const { requestId, content, type = 'text' } = req.body;

  const request = await MaintenanceRequest.findById(requestId);
  if (!request) {
    return next(new AppError('Maintenance request not found', 404));
  }

  // Check permissions
  if (req.user.role === 'tenant' && request.tenant.toString() !== req.user.id) {
    return next(new AppError('Not authorized to add notes to this request', 403));
  }

  if (req.user.role === 'agent' && request.agent.toString() !== req.user.id) {
    return next(new AppError('Not authorized to add notes to this request', 403));
  }

  const note = {
    content,
    type,
    addedBy: req.user.id,
    addedAt: new Date()
  };

  request.notes.push(note);
  await request.save();

  // Notify other party
  const notifyUser = req.user.role === 'tenant' ? request.agent : request.tenant;
  await Notification.create({
    user: notifyUser,
    type: 'maintenance_note',
    title: 'New Note Added',
    message: `A new note has been added to the maintenance request`,
    relatedId: request._id,
    relatedModel: 'MaintenanceRequest'
  });

  res.status(201).json({
    success: true,
    note
  });
});

exports.uploadMaintenanceImages = catchAsync(async (req, res, next) => {
  const { requestId } = req.params;

  const request = await MaintenanceRequest.findById(requestId);
  if (!request) {
    return next(new AppError('Maintenance request not found', 404));
  }

  // Check permissions
  if (req.user.role === 'tenant' && request.tenant.toString() !== req.user.id) {
    return next(new AppError('Not authorized to upload images to this request', 403));
  }

  if (req.user.role === 'agent' && request.agent.toString() !== req.user.id) {
    return next(new AppError('Not authorized to upload images to this request', 403));
  }

  const uploadedImages = [];
  
  for (let i = 0; i < req.files.length; i++) {
    const file = req.files[i];
    uploadedImages.push({
      url: file.path,
      filename: file.filename,
      uploadedBy: req.user.id,
      uploadedAt: new Date()
    });
  }

  request.images.push(...uploadedImages);
  await request.save();

  res.status(201).json({
    success: true,
    images: uploadedImages
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

  // Filter based on user role
  const query = { createdAt: { $gte: startDate } };
  if (req.user.role === 'tenant') {
    query.tenant = req.user.id;
  } else if (req.user.role === 'agent') {
    const agentProperties = await Property.find({ agent: req.user.id }).select('_id');
    query.property = { $in: agentProperties.map(p => p._id) };
  }

  const requests = await MaintenanceRequest.find(query);

  const statusStats = {
    pending: requests.filter(r => r.status === 'pending').length,
    in_progress: requests.filter(r => r.status === 'in_progress').length,
    resolved: requests.filter(r => r.status === 'resolved').length,
    cancelled: requests.filter(r => r.status === 'cancelled').length
  };

  const priorityStats = {
    low: requests.filter(r => r.priority === 'low').length,
    medium: requests.filter(r => r.priority === 'medium').length,
    high: requests.filter(r => r.priority === 'high').length,
    urgent: requests.filter(r => r.priority === 'urgent').length
  };

  res.json({
    success: true,
    stats: {
      byStatus: statusStats,
      byPriority: priorityStats
    }
  });
});

// Add missing methods that routes expect
exports.uploadImages = catchAsync(async (req, res, next) => {
  const { requestId } = req.params;

  const request = await MaintenanceRequest.findById(requestId);
  if (!request) {
    return next(new AppError('Maintenance request not found', 404));
  }

  // Check permissions
  if (req.user.role === 'tenant' && request.tenant.toString() !== req.user.id) {
    return next(new AppError('Not authorized to upload images to this request', 403));
  }

  if (req.user.role === 'agent' && request.agent.toString() !== req.user.id) {
    return next(new AppError('Not authorized to upload images to this request', 403));
  }

  const uploadedImages = [];
  
  for (let i = 0; i < req.files.length; i++) {
    const file = req.files[i];
    uploadedImages.push({
      url: file.path,
      filename: file.filename,
      uploadedBy: req.user.id,
      uploadedAt: new Date()
    });
  }

  request.images.push(...uploadedImages);
  await request.save();

  res.status(201).json({
    success: true,
    images: uploadedImages
  });
});

exports.rateMaintenance = catchAsync(async (req, res, next) => {
  const { requestId } = req.params;
  const { rating, feedback } = req.body;

  const request = await MaintenanceRequest.findById(requestId);
  if (!request) {
    return next(new AppError('Maintenance request not found', 404));
  }

  // Check permissions
  if (req.user.role !== 'tenant') {
    return next(new AppError('Only tenants can rate maintenance', 403));
  }

  if (request.tenant.toString() !== req.user.id) {
    return next(new AppError('Not authorized to rate this request', 403));
  }

  request.rating = rating;
  request.feedback = feedback;
  request.ratedAt = new Date();
  await request.save();

  res.json({
    success: true,
    message: 'Maintenance rated successfully'
  });
});

exports.updateStatus = catchAsync(async (req, res, next) => {
  const { requestId } = req.params;
  const { status } = req.body;

  const request = await MaintenanceRequest.findById(requestId);
  if (!request) {
    return next(new AppError('Maintenance request not found', 404));
  }

  // Check permissions
  if (req.user.role === 'tenant' && request.tenant.toString() !== req.user.id) {
    return next(new AppError('Not authorized to update this request', 403));
  }

  if (req.user.role === 'agent' && request.agent.toString() !== req.user.id) {
    return next(new AppError('Not authorized to update this request', 403));
  }

  request.status = status;
  if (status === 'resolved') {
    request.resolvedAt = new Date();
    request.resolvedBy = req.user.id;
  }
  await request.save();

  res.json({
    success: true,
    request
  });
});

exports.assignTechnician = catchAsync(async (req, res, next) => {
  const { requestId } = req.params;
  const { technicianId } = req.body;

  const request = await MaintenanceRequest.findById(requestId);
  if (!request) {
    return next(new AppError('Maintenance request not found', 404));
  }

  // Check permissions
  if (req.user.role === 'tenant') {
    return next(new AppError('Not authorized to assign technician', 403));
  }

  if (req.user.role === 'agent' && request.agent.toString() !== req.user.id) {
    return next(new AppError('Not authorized to assign technician', 403));
  }

  request.assignedTechnician = technicianId;
  request.assignedAt = new Date();
  await request.save();

  res.json({
    success: true,
    request
  });
});

exports.addTimelineEntry = catchAsync(async (req, res, next) => {
  const { requestId } = req.params;
  const { entry, type = 'note' } = req.body;

  const request = await MaintenanceRequest.findById(requestId);
  if (!request) {
    return next(new AppError('Maintenance request not found', 404));
  }

  // Check permissions
  if (req.user.role === 'tenant' && request.tenant.toString() !== req.user.id) {
    return next(new AppError('Not authorized to add timeline entry', 403));
  }

  if (req.user.role === 'agent' && request.agent.toString() !== req.user.id) {
    return next(new AppError('Not authorized to add timeline entry', 403));
  }

  const timelineEntry = {
    entry,
    type,
    addedBy: req.user.id,
    addedAt: new Date()
  };

  request.timeline.push(timelineEntry);
  await request.save();

  res.status(201).json({
    success: true,
    timelineEntry
  });
});

exports.updateCost = catchAsync(async (req, res, next) => {
  const { requestId } = req.params;
  const { cost, description } = req.body;

  const request = await MaintenanceRequest.findById(requestId);
  if (!request) {
    return next(new AppError('Maintenance request not found', 404));
  }

  // Check permissions
  if (req.user.role === 'tenant') {
    return next(new AppError('Not authorized to update cost', 403));
  }

  if (req.user.role === 'agent' && request.agent.toString() !== req.user.id) {
    return next(new AppError('Not authorized to update cost', 403));
  }

  request.cost = cost;
  request.costDescription = description;
  request.costUpdatedBy = req.user.id;
  request.costUpdatedAt = new Date();
  await request.save();

  res.json({
    success: true,
    request
  });
});

exports.getAllMaintenanceRequests = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, status, priority } = req.query;
  const query = {};
  
  if (status) query.status = status;
  if (priority) query.priority = priority;

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

exports.getMaintenanceAnalytics = catchAsync(async (req, res, next) => {
  res.json({ success: true, message: 'Maintenance analytics - placeholder' });
});

exports.getCategories = catchAsync(async (req, res, next) => {
  const categories = [
    { id: 'plumbing', name: 'Plumbing' },
    { id: 'electrical', name: 'Electrical' },
    { id: 'hvac', name: 'HVAC' },
    { id: 'appliances', name: 'Appliances' },
    { id: 'structural', name: 'Structural' },
    { id: 'pest_control', name: 'Pest Control' },
    { id: 'landscaping', name: 'Landscaping' },
    { id: 'cleaning', name: 'Cleaning' },
    { id: 'other', name: 'Other' }
  ];

  res.json({
    success: true,
    categories
  });
});

// Methods are already exported with exports syntax
