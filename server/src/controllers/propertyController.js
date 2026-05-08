const Property = require('../models/Property');
const Space = require('../models/Space');
const cloudinary = require('cloudinary').v2;
const { deleteFromCloudinary } = require('../services/storageService');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Add aliases for missing methods that routes expect
exports.getProperties = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    let query = { deletedAt: null };
    
    // Filter by space
    if (req.query.spaceId) {
      query.space = req.query.spaceId;
    }
    
    // Filter by status
    if (req.query.status) {
      query['availability.status'] = req.query.status;
    }
    
    // Search by title/description
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }
    
    // Price range
    if (req.query.minPrice || req.query.maxPrice) {
      query['pricing.rent'] = {};
      if (req.query.minPrice) query['pricing.rent'].$gte = parseInt(req.query.minPrice);
      if (req.query.maxPrice) query['pricing.rent'].$lte = parseInt(req.query.maxPrice);
    }
    
    // Bedrooms
    if (req.query.bedrooms) {
      query['details.bedrooms'] = parseInt(req.query.bedrooms);
    }
    
    // Sort
    let sort = {};
    if (req.query.sort === 'price_asc') sort['pricing.rent'] = 1;
    else if (req.query.sort === 'price_desc') sort['pricing.rent'] = -1;
    else if (req.query.sort === 'newest') sort.createdAt = -1;
    else if (req.query.sort === 'most_viewed') sort['features.views'] = -1;
    else sort.createdAt = -1;
    
    const properties = await Property.find(query)
      .populate('space', 'name logo')
      .populate('agent', 'name profile')
      .sort(sort)
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

exports.getProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('space', 'name logo stats')
      .populate('agent', 'name profile email metadata');
    
    if (!property || property.deletedAt) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
    
    // Increment view count
    property.features.views += 1;
    await property.save();
    
    res.json({
      success: true,
      property
    });
  } catch (error) {
    next(error);
  }
};

exports.getFeaturedProperties = async (req, res, next) => {
  try {
    const properties = await Property.find({ 
      'features.featured': true,
      'availability.status': 'available',
      deletedAt: null
    })
      .populate('space', 'name logo')
      .populate('agent', 'name profile')
      .sort({ 'features.views': -1 })
      .limit(10);
    
    res.json({
      success: true,
      properties
    });
  } catch (error) {
    next(error);
  }
};

exports.searchProperties = async (req, res, next) => {
  try {
    const { q, location, type, minPrice, maxPrice, bedrooms, bathrooms } = req.query;
    
    let query = { 
      'availability.status': 'available',
      deletedAt: null
    };
    
    if (q) {
      query.$text = { $search: q };
    }
    
    if (location) {
      query['location.city'] = { $regex: location, $options: 'i' };
    }
    
    if (type) {
      query['details.type'] = type;
    }
    
    if (minPrice || maxPrice) {
      query['pricing.rent'] = {};
      if (minPrice) query['pricing.rent'].$gte = parseInt(minPrice);
      if (maxPrice) query['pricing.rent'].$lte = parseInt(maxPrice);
    }
    
    if (bedrooms) {
      query['details.bedrooms'] = parseInt(bedrooms);
    }
    
    if (bathrooms) {
      query['details.bathrooms'] = parseInt(bathrooms);
    }
    
    const properties = await Property.find(query)
      .populate('space', 'name logo')
      .populate('agent', 'name profile')
      .sort({ createdAt: -1 })
      .limit(20);
    
    res.json({
      success: true,
      properties
    });
  } catch (error) {
    next(error);
  }
};

exports.getSimilarProperties = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property || property.deletedAt) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
    
    const similar = await Property.find({
      _id: { $ne: property._id },
      'location.city': property.location.city,
      'details.type': property.details.type,
      'availability.status': 'available',
      deletedAt: null
    })
      .populate('space', 'name logo')
      .populate('agent', 'name profile')
      .limit(5);
    
    res.json({
      success: true,
      properties: similar
    });
  } catch (error) {
    next(error);
  }
};

// Placeholder methods for routes that expect them
exports.toggleFavorite = async (req, res, next) => {
  res.json({ success: true, message: 'Toggle favorite - placeholder' });
};

exports.sendInquiry = async (req, res, next) => {
  res.json({ success: true, message: 'Send inquiry - placeholder' });
};

exports.scheduleViewing = async (req, res, next) => {
  res.json({ success: true, message: 'Schedule viewing - placeholder' });
};

exports.toggleFeatured = async (req, res, next) => {
  res.json({ success: true, message: 'Toggle featured - placeholder' });
};

exports.approveProperty = async (req, res, next) => {
  res.json({ success: true, message: 'Approve property - placeholder' });
};

exports.suspendProperty = async (req, res, next) => {
  res.json({ success: true, message: 'Suspend property - placeholder' });
};

exports.createProperty = async (req, res, next) => {
  try {
    const propertyData = req.body;
    
    // Check space ownership
    const space = await Space.findOne({
      _id: propertyData.space,
      agent: req.user._id
    });
    
    if (!space) {
      return res.status(403).json({
        success: false,
        message: 'You do not own this space'
      });
    }
    
    // Check subscription limits
    const propertyCount = await Property.countDocuments({ space: space._id });
    const planLimits = { basic: 10, pro: 50 };
    const limit = planLimits[space.subscription.plan];
    
    if (propertyCount >= limit) {
      return res.status(403).json({
        success: false,
        message: `Your ${space.subscription.plan} plan allows only ${limit} properties`
      });
    }
    
    // Generate slug
    propertyData.seo = {
      slug: propertyData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      metaTitle: propertyData.title,
      metaDescription: propertyData.description.substring(0, 160)
    };
    
    propertyData.agent = req.user._id;
    
    const property = await Property.create(propertyData);
    
    // Add to space
    space.properties.push(property._id);
    await space.save();
    
    res.status(201).json({
      success: true,
      property
    });
  } catch (error) {
    next(error);
  }
};

exports.uploadImages = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const property = await Property.findOne({
      _id: propertyId,
      agent: req.user._id
    });
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
    
    const uploadedImages = [];
    
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      
      // Upload to Cloudinary with optimization
      const result = await cloudinary.uploader.upload(file.path, {
        folder: `proprender/properties/${propertyId}`,
        transformation: [
          { width: 1200, height: 800, crop: 'limit' },
          { quality: 'auto:best' },
          { fetch_format: 'auto' }
        ]
      });
      
      uploadedImages.push({
        url: result.secure_url,
        publicId: result.public_id,
        order: property.media.images.length + i,
        isPrimary: property.media.images.length === 0 && i === 0
      });
    }
    
    property.media.images.push(...uploadedImages);
    await property.save();
    
    res.json({
      success: true,
      images: uploadedImages
    });
  } catch (error) {
    next(error);
  }
};

exports.reorderImages = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const { imageOrders } = req.body; // Array of { id, order }
    
    const property = await Property.findOne({
      _id: propertyId,
      agent: req.user._id
    });
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
    
    imageOrders.forEach(({ publicId, order }) => {
      const image = property.media.images.find(img => img.publicId === publicId);
      if (image) image.order = order;
    });
    
    property.media.images.sort((a, b) => a.order - b.order);
    await property.save();
    
    res.json({
      success: true,
      images: property.media.images
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteImage = async (req, res, next) => {
  try {
    const { propertyId, imageId } = req.params;
    
    const property = await Property.findOne({
      _id: propertyId,
      agent: req.user._id
    });
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
    
    const image = property.media.images.find(img => img.publicId === imageId);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }
    
    // Delete from Cloudinary
    await deleteFromCloudinary(image.publicId);
    
    // Remove from array
    property.media.images = property.media.images.filter(img => img.publicId !== imageId);
    
    // Update primary if needed
    if (image.isPrimary && property.media.images.length > 0) {
      property.media.images[0].isPrimary = true;
    }
    
    await property.save();
    
    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllProperties = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    let query = {};
    
    // Filter by space
    if (req.query.spaceId) {
      query.space = req.query.spaceId;
    }
    
    // Filter by status
    if (req.query.status) {
      query['availability.status'] = req.query.status;
    }
    
    // Search by title/description
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }
    
    // Price range
    if (req.query.minPrice || req.query.maxPrice) {
      query['pricing.rent'] = {};
      if (req.query.minPrice) query['pricing.rent'].$gte = parseInt(req.query.minPrice);
      if (req.query.maxPrice) query['pricing.rent'].$lte = parseInt(req.query.maxPrice);
    }
    
    // Bedrooms
    if (req.query.bedrooms) {
      query['details.bedrooms'] = parseInt(req.query.bedrooms);
    }
    
    // Sort
    let sort = {};
    if (req.query.sort === 'price_asc') sort['pricing.rent'] = 1;
    else if (req.query.sort === 'price_desc') sort['pricing.rent'] = -1;
    else if (req.query.sort === 'newest') sort.createdAt = -1;
    else if (req.query.sort === 'most_viewed') sort['features.views'] = -1;
    else sort.createdAt = -1;
    
    const properties = await Property.find(query)
      .populate('space', 'name logo')
      .populate('agent', 'name profile')
      .sort(sort)
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

exports.getPropertyById = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('space', 'name logo stats')
      .populate('agent', 'name profile email metadata');
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
    
    // Increment view count
    property.features.views += 1;
    await property.save();
    
    res.json({
      success: true,
      property
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProperty = async (req, res, next) => {
  try {
    const property = await Property.findOneAndUpdate(
      { _id: req.params.id, agent: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
    
    res.json({
      success: true,
      property
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findOne({
      _id: req.params.id,
      agent: req.user._id
    });
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
    
    // Soft delete - 30 day restore window
    property.deletedAt = new Date();
    property.restoreExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    property['availability.status'] = 'archived';
    await property.save();
    
    res.json({
      success: true,
      message: 'Property soft deleted. Can be restored within 30 days.'
    });
  } catch (error) {
    next(error);
  }
};

exports.restoreProperty = async (req, res, next) => {
  try {
    const property = await Property.findOne({
      _id: req.params.id,
      agent: req.user._id,
      deletedAt: { $ne: null },
      restoreExpiresAt: { $gt: Date.now() }
    });
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found or restore window expired'
      });
    }
    
    property.deletedAt = undefined;
    property.restoreExpiresAt = undefined;
    property['availability.status'] = 'available';
    await property.save();
    
    res.json({
      success: true,
      message: 'Property restored successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.exportToCSV = async (req, res, next) => {
  try {
    const properties = await Property.find({ agent: req.user._id });
    
    const csvData = properties.map(p => ({
      Title: p.title,
      Address: p.fullAddress,
      Bedrooms: p.details.bedrooms,
      Bathrooms: p.details.bathrooms,
      'Square Feet': p.details.squareFeet,
      Rent: p.pricing.rent,
      Status: p.availability.status,
      'Created At': p.createdAt.toISOString()
    }));
    
    res.json({
      success: true,
      data: csvData
    });
  } catch (error) {
    next(error);
  }
};