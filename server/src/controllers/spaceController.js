const Space = require('../models/Space');
const Property = require('../models/Property');
const User = require('../models/User');
const AppError = require('../middleware/errorHandler');
const { catchAsync } = require('../middleware/errorHandler');

exports.getSpaces = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, type, status, search } = req.query;
  const query = {};
  
  if (type) query.type = type;
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  
  // Filter based on user role
  if (req.user.role === 'tenant') {
    query.tenant = req.user.id;
  } else if (req.user.role === 'agent') {
    query.agent = req.user.id;
  }

  const spaces = await Space.find(query)
    .populate('agent', 'name email avatar')
    .populate('tenant', 'name email avatar')
    .populate('property', 'title address')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Space.countDocuments(query);

  res.json({
    success: true,
    spaces,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

exports.getSpace = catchAsync(async (req, res, next) => {
  const space = await Space.findById(req.params.id)
    .populate('agent', 'name email avatar')
    .populate('tenant', 'name email avatar')
    .populate('property', 'title address')
    .populate('amenities');

  if (!space) {
    return next(new AppError('Space not found', 404));
  }

  // Check permissions
  if (req.user.role === 'tenant' && space.tenant._id.toString() !== req.user.id) {
    return next(new AppError('Not authorized to view this space', 403));
  }

  res.json({
    success: true,
    space
  });
});

exports.createSpace = catchAsync(async (req, res, next) => {
  const {
    title,
    description,
    type,
    propertyId,
    capacity,
    area,
    amenities,
    pricing,
    availability,
    images
  } = req.body;

  const property = await Property.findById(propertyId);
  if (!property) {
    return next(new AppError('Property not found', 404));
  }

  // Check permissions
  if (req.user.role === 'tenant') {
    return next(new AppError('Tenants cannot create spaces', 403));
  }

  const space = await Space.create({
    title,
    description,
    type,
    property: propertyId,
    agent: req.user.id,
    capacity,
    area,
    amenities: amenities || [],
    pricing,
    availability,
    images: images || [],
    status: 'available'
  });

  const populatedSpace = await Space.findById(space._id)
    .populate('agent', 'name email avatar')
    .populate('property', 'title address');

  res.status(201).json({
    success: true,
    space: populatedSpace
  });
});

exports.updateSpace = catchAsync(async (req, res, next) => {
  const updates = req.body;
  const { id } = req.params;

  const space = await Space.findById(id);
  if (!space) {
    return next(new AppError('Space not found', 404));
  }

  // Check permissions
  if (req.user.role === 'tenant') {
    return next(new AppError('Tenants cannot update spaces', 403));
  }

  if (req.user.role === 'agent' && space.agent.toString() !== req.user.id) {
    return next(new AppError('Not authorized to update this space', 403));
  }

  Object.keys(updates).forEach(key => {
    space[key] = updates[key];
  });

  await space.save();

  const populatedSpace = await Space.findById(space._id)
    .populate('agent', 'name email avatar')
    .populate('property', 'title address');

  res.json({
    success: true,
    space: populatedSpace
  });
});

exports.deleteSpace = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const space = await Space.findById(id);
  if (!space) {
    return next(new AppError('Space not found', 404));
  }

  // Check permissions
  if (req.user.role === 'tenant') {
    return next(new AppError('Tenants cannot delete spaces', 403));
  }

  if (req.user.role === 'agent' && space.agent.toString() !== req.user.id) {
    return next(new AppError('Not authorized to delete this space', 403));
  }

  await Space.findByIdAndDelete(id);

  res.json({
    success: true,
    message: 'Space deleted successfully'
  });
});

exports.getSpaceStats = catchAsync(async (req, res, next) => {
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
    query.agent = req.user.id;
  }

  const pipeline = [
    {
      $match: query
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 }
      }
    }
  ];

  const typeStats = await Space.aggregate(pipeline);

  const statusStats = await Space.aggregate([
    {
      $match: query
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  res.json({
    success: true,
    stats: {
      byType: typeStats,
      byStatus: statusStats
    }
  });
});

// Methods are already exported with exports syntax
