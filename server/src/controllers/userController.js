const User = require('../models/User');
const Favorite = require('../models/Favorite');
const SavedSearch = require('../models/SavedSearch');
const Notification = require('../models/Notification');
const { AppError } = require('../middleware/errorHandler');
const { catchAsync } = require('../middleware/errorHandler');

// Get user profile
exports.getProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .populate('favorites')
    .populate('savedSearches')
    .select('-password');

  res.json({
    success: true,
    user
  });
});

// Update user profile
exports.updateProfile = catchAsync(async (req, res, next) => {
  const allowedFields = ['name', 'profile'];
  const updates = {};
  
  Object.keys(req.body).forEach(field => {
    if (allowedFields.includes(field)) {
      updates[field] = req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(
    req.user.id,
    updates,
    { new: true, runValidators: true }
  ).select('-password');

  res.json({
    success: true,
    user
  });
});

// Update password
exports.updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.comparePassword(currentPassword))) {
    return next(new AppError('Current password is incorrect', 400));
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password updated successfully'
  });
});

// Update avatar
exports.updateAvatar = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload an image', 400));
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { 'profile.avatar': req.file.path },
    { new: true }
  ).select('-password');

  res.json({
    success: true,
    user
  });
});

// Delete account
exports.deleteAccount = catchAsync(async (req, res, next) => {
  await User.findByIdAndDelete(req.user.id);

  res.json({
    success: true,
    message: 'Account deleted successfully'
  });
});

// Get favorites
exports.getFavorites = catchAsync(async (req, res, next) => {
  const favorites = await Favorite.find({ user: req.user.id })
    .populate('property')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    favorites
  });
});

// Add to favorites
exports.addToFavorites = catchAsync(async (req, res, next) => {
  const { propertyId } = req.params;

  // Check if already favorited
  const existingFavorite = await Favorite.findOne({
    user: req.user.id,
    property: propertyId
  });

  if (existingFavorite) {
    return next(new AppError('Property already in favorites', 400));
  }

  const favorite = await Favorite.create({
    user: req.user.id,
    property: propertyId
  });

  await favorite.populate('property');

  res.json({
    success: true,
    favorite
  });
});

// Remove from favorites
exports.removeFromFavorites = catchAsync(async (req, res, next) => {
  const { propertyId } = req.params;

  await Favorite.findOneAndDelete({
    user: req.user.id,
    property: propertyId
  });

  res.json({
    success: true,
    message: 'Property removed from favorites'
  });
});

// Get saved searches
exports.getSavedSearches = catchAsync(async (req, res, next) => {
  const savedSearches = await SavedSearch.find({ user: req.user.id })
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    savedSearches
  });
});

// Create saved search
exports.createSavedSearch = catchAsync(async (req, res, next) => {
  const savedSearch = await SavedSearch.create({
    ...req.body,
    user: req.user.id
  });

  res.status(201).json({
    success: true,
    savedSearch
  });
});

// Update saved search
exports.updateSavedSearch = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const savedSearch = await SavedSearch.findOneAndUpdate(
    { _id: id, user: req.user.id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!savedSearch) {
    return next(new AppError('Saved search not found', 404));
  }

  res.json({
    success: true,
    savedSearch
  });
});

// Delete saved search
exports.deleteSavedSearch = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const savedSearch = await SavedSearch.findOneAndDelete({
    _id: id,
    user: req.user.id
  });

  if (!savedSearch) {
    return next(new AppError('Saved search not found', 404));
  }

  res.json({
    success: true,
    message: 'Saved search deleted successfully'
  });
});

// Get notifications
exports.getNotifications = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, unread = false } = req.query;
  
  const query = { recipient: req.user.id };
  if (unread === 'true') {
    query.read = false;
  }

  const notifications = await Notification.find(query)
    .populate('sender', 'name')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Notification.countDocuments(query);
  const unreadCount = await Notification.countDocuments({
    recipient: req.user.id,
    read: false
  });

  res.json({
    success: true,
    notifications,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    },
    unreadCount
  });
});

// Mark notification as read
exports.markNotificationAsRead = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const notification = await Notification.findOneAndUpdate(
    { _id: id, recipient: req.user.id },
    { read: true, readAt: new Date() },
    { new: true }
  );

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  res.json({
    success: true,
    notification
  });
});

// Mark all notifications as read
exports.markAllNotificationsAsRead = catchAsync(async (req, res, next) => {
  await Notification.updateMany(
    { recipient: req.user.id, read: false },
    { read: true, readAt: new Date() }
  );

  res.json({
    success: true,
    message: 'All notifications marked as read'
  });
});

// Delete notification
exports.deleteNotification = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const notification = await Notification.findOneAndDelete({
    _id: id,
    recipient: req.user.id
  });

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  res.json({
    success: true,
    message: 'Notification deleted successfully'
  });
});

// Admin: Get all users
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, role, status } = req.query;
  
  const query = {};
  if (role) query.role = role;
  if (status) query.status = status;

  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await User.countDocuments(query);

  res.json({
    success: true,
    users,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// Admin: Get single user
exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.json({
    success: true,
    user
  });
});

// Admin: Update user status
exports.updateUserStatus = catchAsync(async (req, res, next) => {
  const { status, banReason } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { status, banReason },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.json({
    success: true,
    user
  });
});

// Admin: Delete user
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});