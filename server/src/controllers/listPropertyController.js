const Property = require('../models/Property');
const Space = require('../models/Space');
const DraftProperty = require('../models/DraftProperty');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Get listing requirements and guidelines
exports.getListingRequirements = async (req, res, next) => {
  try {
    const requirements = {
      requiredFields: [
        'title',
        'description',
        'address',
        'pricing.rent',
        'details.bedrooms',
        'details.bathrooms',
        'details.squareFeet',
        'details.type',
        'location.city',
        'location.state',
        'location.zipCode'
      ],
      optionalFields: [
        'details.yearBuilt',
        'details.parking',
        'details.pets',
        'details.furnished',
        'details.amenities',
        'features.petsAllowed',
        'features.parkingIncluded',
        'features.utilitiesIncluded',
        'availability.availableFrom',
        'availability.leaseTerm'
      ],
      imageRequirements: {
        maxImages: 10,
        maxWidth: 4000,
        maxHeight: 3000,
        formats: ['jpg', 'jpeg', 'png', 'webp'],
        maxSize: '10MB'
      },
      guidelines: [
        'Provide accurate and detailed property information',
        'Include high-quality photos showing all main areas',
        'Set competitive pricing based on market rates',
        'Respond to inquiries promptly',
        'Keep property availability status up to date'
      ]
    };

    res.json({
      success: true,
      requirements
    });
  } catch (error) {
    next(error);
  }
};

// Get user's spaces for property listing
exports.getUserSpaces = async (req, res, next) => {
  try {
    const spaces = await Space.find({
      agent: req.user._id,
      status: 'active'
    })
      .populate('subscription')
      .select('name subscription plan limits');

    res.json({
      success: true,
      spaces
    });
  } catch (error) {
    next(error);
  }
};

// Create new property listing
exports.createPropertyListing = async (req, res, next) => {
  try {
    const propertyData = req.body;
    
    // Check space ownership and limits
    const space = await Space.findOne({
      _id: propertyData.space,
      agent: req.user._id
    }).populate('subscription');
    
    if (!space) {
      return res.status(403).json({
        success: false,
        message: 'You do not own this space'
      });
    }
    
    // Check subscription limits
    const propertyCount = await Property.countDocuments({ 
      space: space._id,
      deletedAt: null 
    });
    
    const planLimits = {
      basic: 10,
      pro: 50,
      enterprise: 200
    };
    
    const limit = planLimits[space.subscription.plan] || 10;
    
    if (propertyCount >= limit) {
      return res.status(403).json({
        success: false,
        message: `Your ${space.subscription.plan} plan allows only ${limit} active properties`
      });
    }
    
    // Generate SEO slug
    propertyData.seo = {
      slug: propertyData.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + '-' + Date.now(),
      metaTitle: propertyData.title,
      metaDescription: propertyData.description.substring(0, 160)
    };
    
    propertyData.agent = req.user._id;
    propertyData.space = space._id;
    propertyData.status = 'pending_approval';
    
    const property = await Property.create(propertyData);
    
    // Add to space
    space.properties.push(property._id);
    await space.save();
    
    // Update agent stats
    const User = require('../models/User');
    await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { 'profile.propertiesCount': 1 } }
    );
    
    res.status(201).json({
      success: true,
      property,
      message: 'Property listing created successfully and pending approval'
    });
  } catch (error) {
    next(error);
  }
};

// Upload property images
exports.uploadPropertyImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images provided'
      });
    }
    
    const uploadedImages = [];
    
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      
      // Upload to Cloudinary with optimization
      const result = await cloudinary.uploader.upload(file.path, {
        folder: `proprender/temp/${req.user._id}`,
        transformation: [
          { width: 1200, height: 800, crop: 'limit' },
          { quality: 'auto:best' },
          { fetch_format: 'auto' }
        ]
      });
      
      uploadedImages.push({
        url: result.secure_url,
        publicId: result.public_id,
        order: i,
        isPrimary: i === 0
      });
    }
    
    res.json({
      success: true,
      images: uploadedImages
    });
  } catch (error) {
    next(error);
  }
};

// Save draft listing
exports.saveDraftListing = async (req, res, next) => {
  try {
    const draftData = req.body;
    
    // Check if draft exists
    let draft;
    if (draftData._id) {
      draft = await DraftProperty.findOneAndUpdate(
        { 
          _id: draftData._id,
          agent: req.user._id
        },
        draftData,
        { new: true, upsert: false }
      );
    } else {
      draftData.agent = req.user._id;
      draft = await DraftProperty.create(draftData);
    }
    
    res.json({
      success: true,
      draft
    });
  } catch (error) {
    next(error);
  }
};

// Get draft listings
exports.getDraftListings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const drafts = await DraftProperty.find({ agent: req.user._id })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await DraftProperty.countDocuments({ agent: req.user._id });
    
    res.json({
      success: true,
      drafts,
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

// Publish draft listing
exports.publishDraftListing = async (req, res, next) => {
  try {
    const draft = await DraftProperty.findOne({
      _id: req.params.id,
      agent: req.user._id
    });
    
    if (!draft) {
      return res.status(404).json({
        success: false,
        message: 'Draft not found'
      });
    }
    
    // Check space ownership and limits
    const space = await Space.findOne({
      _id: draft.space,
      agent: req.user._id
    }).populate('subscription');
    
    if (!space) {
      return res.status(403).json({
        success: false,
        message: 'You do not own this space'
      });
    }
    
    // Check subscription limits
    const propertyCount = await Property.countDocuments({ 
      space: space._id,
      deletedAt: null 
    });
    
    const planLimits = {
      basic: 10,
      pro: 50,
      enterprise: 200
    };
    
    const limit = planLimits[space.subscription.plan] || 10;
    
    if (propertyCount >= limit) {
      return res.status(403).json({
        success: false,
        message: `Your ${space.subscription.plan} plan allows only ${limit} active properties`
      });
    }
    
    // Convert draft to property
    const propertyData = draft.toObject();
    delete propertyData._id;
    delete propertyData.__v;
    delete propertyData.createdAt;
    delete propertyData.updatedAt;
    
    propertyData.agent = req.user._id;
    propertyData.space = space._id;
    propertyData.status = 'pending_approval';
    propertyData.seo = {
      slug: propertyData.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + '-' + Date.now(),
      metaTitle: propertyData.title,
      metaDescription: propertyData.description.substring(0, 160)
    };
    
    const property = await Property.create(propertyData);
    
    // Add to space
    space.properties.push(property._id);
    await space.save();
    
    // Delete the draft
    await DraftProperty.findByIdAndDelete(req.params.id);
    
    res.status(201).json({
      success: true,
      property,
      message: 'Draft published successfully and pending approval'
    });
  } catch (error) {
    next(error);
  }
};

// Delete draft listing
exports.deleteDraftListing = async (req, res, next) => {
  try {
    const draft = await DraftProperty.findOneAndDelete({
      _id: req.params.id,
      agent: req.user._id
    });
    
    if (!draft) {
      return res.status(404).json({
        success: false,
        message: 'Draft not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Draft deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Estimate property value
exports.estimatePropertyValue = async (req, res, next) => {
  try {
    const { 
      location, 
      bedrooms, 
      bathrooms, 
      squareFeet, 
      propertyType,
      amenities 
    } = req.body;
    
    // Find similar properties in the area
    const similarProperties = await Property.find({
      'location.city': location.city,
      'details.bedrooms': bedrooms,
      'details.bathrooms': bathrooms,
      'details.type': propertyType,
      'availability.status': 'available',
      deletedAt: null
    })
      .select('pricing.rent details.squareFeet location')
      .limit(20);
    
    if (similarProperties.length === 0) {
      return res.json({
        success: true,
        estimate: {
          minRent: 0,
          maxRent: 0,
          avgRent: 0,
          confidence: 'low',
          comparableProperties: 0
        }
      });
    }
    
    const rents = similarProperties.map(p => p.pricing.rent);
    const minRent = Math.min(...rents);
    const maxRent = Math.max(...rents);
    const avgRent = Math.round(rents.reduce((a, b) => a + b, 0) / rents.length);
    
    // Calculate confidence based on number of comparable properties
    let confidence = 'low';
    if (similarProperties.length >= 10) confidence = 'high';
    else if (similarProperties.length >= 5) confidence = 'medium';
    
    res.json({
      success: true,
      estimate: {
        minRent,
        maxRent,
        avgRent,
        confidence,
        comparableProperties: similarProperties.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get similar properties for pricing reference
exports.getSimilarPropertiesForPricing = async (req, res, next) => {
  try {
    const {
      location,
      bedrooms,
      bathrooms,
      squareFeet,
      propertyType,
      radius = 5 // miles
    } = req.query;
    
    let query = {
      'availability.status': 'available',
      deletedAt: null
    };
    
    if (location) {
      query['location.city'] = { $regex: location, $options: 'i' };
    }
    
    if (bedrooms) {
      query['details.bedrooms'] = parseInt(bedrooms);
    }
    
    if (bathrooms) {
      query['details.bathrooms'] = parseInt(bathrooms);
    }
    
    if (propertyType) {
      query['details.type'] = propertyType;
    }
    
    const properties = await Property.find(query)
      .populate('agent', 'name profile')
      .select('title pricing.rent details.bedrooms details.bathrooms details.squareFeet location images')
      .sort({ 'pricing.rent': 1 })
      .limit(10);
    
    res.json({
      success: true,
      properties
    });
  } catch (error) {
    next(error);
  }
};
