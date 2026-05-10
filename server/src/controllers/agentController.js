const User = require('../models/User');
const Property = require('../models/Property');
const Review = require('../models/Review');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Get all agents with filtering and pagination
exports.getAgents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    let query = { 
      role: 'agent',
      status: 'active'
    };
    
    // Search by name or company
    if (req.query.search) {
      query.$or = [
        { 'name.first': { $regex: req.query.search, $options: 'i' } },
        { 'name.last': { $regex: req.query.search, $options: 'i' } },
        { 'profile.companyName': { $regex: req.query.search, $options: 'i' } },
        { 'metadata.specialties': { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Filter by specialty
    if (req.query.specialty) {
      query['metadata.specialties'] = { $in: [req.query.specialty] };
    }
    
    // Filter by location (using business address)
    if (req.query.location) {
      query['profile.businessAddress.city'] = { $regex: req.query.location, $options: 'i' };
    }
    
    // Sort
    let sort = {};
    if (req.query.sort === 'rating') sort['metadata.rating'] = -1;
    else if (req.query.sort === 'reviews') sort['metadata.reviewCount'] = -1;
    else if (req.query.sort === 'properties') sort['metadata.propertiesCount'] = -1;
    else if (req.query.sort === 'newest') sort.createdAt = -1;
    else sort['metadata.rating'] = -1;
    
    const agents = await User.find(query)
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const total = await User.countDocuments(query);
    
    res.json({
      success: true,
      agents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get featured agents
exports.getFeaturedAgents = async (req, res, next) => {
  try {
    const agents = await User.find({
      role: 'agent',
      status: 'active',
      'profile.verified': true,
      'profile.featured': true
    })
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .sort({ 'profile.rating': -1 })
      .limit(6);
    
    res.json({
      success: true,
      agents
    });
  } catch (error) {
    next(error);
  }
};

// Search agents
exports.searchAgents = async (req, res, next) => {
  try {
    const { q, location, specialty, minRating } = req.query;
    
    let query = { 
      role: 'agent',
      status: 'active',
      'profile.verified': true
    };
    
    if (q) {
      query.$or = [
        { 'name.first': { $regex: q, $options: 'i' } },
        { 'name.last': { $regex: q, $options: 'i' } },
        { 'profile.bio': { $regex: q, $options: 'i' } }
      ];
    }
    
    if (location) {
      query['profile.location'] = { $regex: location, $options: 'i' };
    }
    
    if (specialty) {
      query['profile.specialties'] = { $in: [specialty] };
    }
    
    if (minRating) {
      query['profile.rating'] = { $gte: parseFloat(minRating) };
    }
    
    const agents = await User.find(query)
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .sort({ 'profile.rating': -1 })
      .limit(20);
    
    res.json({
      success: true,
      agents
    });
  } catch (error) {
    next(error);
  }
};

// Get single agent by ID
exports.getAgent = async (req, res, next) => {
  try {
    const agent = await User.findOne({
      _id: req.params.id,
      role: 'agent',
      status: 'active'
    })
      .select('-password -resetPasswordToken -resetPasswordExpires');
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }
    
    // Get agent's properties count
    const propertiesCount = await Property.countDocuments({
      agent: agent._id,
      deletedAt: null
    });
    
    // Update agent's properties count if needed
    if (agent.profile.propertiesCount !== propertiesCount) {
      agent.profile.propertiesCount = propertiesCount;
      await agent.save();
    }
    
    res.json({
      success: true,
      agent
    });
  } catch (error) {
    next(error);
  }
};

// Get agent's properties
exports.getAgentProperties = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    let query = {
      agent: req.params.id,
      deletedAt: null
    };
    
    // Filter by status
    if (req.query.status) {
      query['availability.status'] = req.query.status;
    } else {
      query['availability.status'] = 'available';
    }
    
    // Filter by type
    if (req.query.type) {
      query['details.type'] = req.query.type;
    }
    
    const properties = await Property.find(query)
      .populate('space', 'name logo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Property.countDocuments(query);
    
    res.json({
      success: true,
      properties,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get agent's reviews
exports.getAgentReviews = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const reviews = await Review.find({
      agent: req.params.id,
      status: 'approved'
    })
      .populate('user', 'name profile')
      .populate('property', 'title address')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Review.countDocuments({
      agent: req.params.id,
      status: 'approved'
    });
    
    res.json({
      success: true,
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update agent profile
exports.updateAgentProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'name',
      'email',
      'phone',
      'profile.bio',
      'profile.detailedBio',
      'profile.location',
      'profile.specialties',
      'profile.languages',
      'profile.experience',
      'profile.license',
      'profile.company',
      'profile.website',
      'profile.socialLinks',
      'profile.workingHours',
      'profile.responseTime'
    ];
    
    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });
    
    const agent = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -resetPasswordToken -resetPasswordExpires');
    
    res.json({
      success: true,
      agent
    });
  } catch (error) {
    next(error);
  }
};

// Upload profile image
exports.uploadProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: `proprender/agents/${req.user._id}`,
      transformation: [
        { width: 400, height: 400, crop: 'fill' },
        { quality: 'auto:best' },
        { fetch_format: 'auto' }
      ]
    });
    
    // Update user profile
    const agent = await User.findByIdAndUpdate(
      req.user._id,
      { 'profile.avatar': result.secure_url },
      { new: true }
    ).select('-password -resetPasswordToken -resetPasswordExpires');
    
    res.json({
      success: true,
      avatar: result.secure_url,
      agent
    });
  } catch (error) {
    next(error);
  }
};

// Update availability
exports.updateAvailability = async (req, res, next) => {
  try {
    const { available, responseTime, workingHours } = req.body;
    
    const updateData = {};
    if (available !== undefined) updateData['profile.available'] = available;
    if (responseTime !== undefined) updateData['profile.responseTime'] = responseTime;
    if (workingHours !== undefined) updateData['profile.workingHours'] = workingHours;
    
    const agent = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select('-password -resetPasswordToken -resetPasswordExpires');
    
    res.json({
      success: true,
      agent
    });
  } catch (error) {
    next(error);
  }
};

// Contact agent
exports.contactAgent = async (req, res, next) => {
  try {
    const { message, propertyId, phone, email } = req.body;
    
    const agent = await User.findOne({
      _id: req.params.id,
      role: 'agent',
      status: 'active'
    });
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }
    
    // Here you would typically:
    // 1. Save the inquiry to database
    // 2. Send email notification to agent
    // 3. Send confirmation email to user
    
    res.json({
      success: true,
      message: 'Message sent successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Toggle favorite agent
exports.toggleFavoriteAgent = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const agentId = req.params.id;
    
    const favoriteIndex = user.profile.favoriteAgents?.indexOf(agentId);
    
    if (favoriteIndex > -1) {
      // Remove from favorites
      user.profile.favoriteAgents.splice(favoriteIndex, 1);
    } else {
      // Add to favorites
      if (!user.profile.favoriteAgents) {
        user.profile.favoriteAgents = [];
      }
      user.profile.favoriteAgents.push(agentId);
    }
    
    await user.save();
    
    res.json({
      success: true,
      isFavorite: favoriteIndex === -1
    });
  } catch (error) {
    next(error);
  }
};

// Add review for agent
exports.addAgentReview = async (req, res, next) => {
  try {
    const { rating, comment, propertyId } = req.body;
    
    // Check if user has reviewed this agent before
    const existingReview = await Review.findOne({
      agent: req.params.id,
      user: req.user._id,
      property: propertyId
    });
    
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this agent for this property'
      });
    }
    
    // Create review
    const review = await Review.create({
      agent: req.params.id,
      user: req.user._id,
      property: propertyId,
      rating,
      comment,
      status: 'pending' // Requires admin approval
    });
    
    res.status(201).json({
      success: true,
      review,
      message: 'Review submitted successfully and pending approval'
    });
  } catch (error) {
    next(error);
  }
};

// Verify agent (admin only)
exports.verifyAgent = async (req, res, next) => {
  try {
    const agent = await User.findByIdAndUpdate(
      req.params.id,
      { 'profile.verified': true },
      { new: true }
    ).select('-password -resetPasswordToken -resetPasswordExpires');
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }
    
    res.json({
      success: true,
      agent,
      message: 'Agent verified successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Suspend agent (admin only)
exports.suspendAgent = async (req, res, next) => {
  try {
    const { reason } = req.body;
    
    const agent = await User.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'suspended',
        'profile.suspensionReason': reason,
        'profile.suspendedAt': new Date()
      },
      { new: true }
    ).select('-password -resetPasswordToken -resetPasswordExpires');
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }
    
    res.json({
      success: true,
      agent,
      message: 'Agent suspended successfully'
    });
  } catch (error) {
    next(error);
  }
};
