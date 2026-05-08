const { AppError } = require('./errorHandler');

// Check if user has required role
const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('You must be logged in to access this resource', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
};

// Check if user owns the resource or is admin
const checkOwnership = (resourceField = 'user') => {
  return (req, res, next) => {
    // Admin and super admin can access any resource
    if (['admin', 'super_admin'].includes(req.user.role)) {
      return next();
    }

    // Check if user owns the resource
    if (req.params.id && req.user.id !== req.params.id) {
      return next(new AppError('You can only access your own resources', 403));
    }

    next();
  };
};

// Check if user is the agent of the property
const checkPropertyAgent = async (req, res, next) => {
  try {
    const Property = require('../models/Property');
    const property = await Property.findById(req.params.id);

    if (!property) {
      return next(new AppError('Property not found', 404));
    }

    // Admin and super admin can access any property
    if (['admin', 'super_admin'].includes(req.user.role)) {
      req.property = property;
      return next();
    }

    // Check if user is the agent of the property
    if (property.agent.toString() !== req.user.id) {
      return next(new AppError('You can only manage your own properties', 403));
    }

    req.property = property;
    next();
  } catch (error) {
    next(error);
  }
};

// Check if user is tenant of the lease
const checkLeaseTenant = async (req, res, next) => {
  try {
    const Lease = require('../models/Lease');
    const lease = await Lease.findById(req.params.id);

    if (!lease) {
      return next(new AppError('Lease not found', 404));
    }

    // Admin and super admin can access any lease
    if (['admin', 'super_admin'].includes(req.user.role)) {
      req.lease = lease;
      return next();
    }

    // Check if user is the tenant of the lease
    if (lease.tenant.toString() !== req.user.id) {
      return next(new AppError('You can only access your own leases', 403));
    }

    req.lease = lease;
    next();
  } catch (error) {
    next(error);
  }
};

// Check if user is participant in conversation
const checkConversationParticipant = async (req, res, next) => {
  try {
    const Conversation = require('../models/Conversation');
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return next(new AppError('Conversation not found', 404));
    }

    // Check if user is a participant in the conversation
    const isParticipant = conversation.participants.some(
      participant => participant.user.toString() === req.user.id
    );

    if (!isParticipant) {
      return next(new AppError('You are not a participant in this conversation', 403));
    }

    req.conversation = conversation;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkRole,
  checkOwnership,
  checkPropertyAgent,
  checkLeaseTenant,
  checkConversationParticipant,
};