const Property = require('../models/Property');
const User = require('../models/User');
const Application = require('../models/Application');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const AppError = require('../middleware/errorHandler');
const { catchAsync } = require('../middleware/errorHandler');

// Global search across all entities
exports.globalSearch = catchAsync(async (req, res, next) => {
  const { q, type = 'all', page = 1, limit = 20 } = req.query;
  
  if (!q) {
    return next(new AppError('Search query is required', 400));
  }

  const searchRegex = new RegExp(q, 'i');
  const results = {};
  const skip = (page - 1) * limit;

  // Search Properties
  if (type === 'all' || type === 'properties') {
    const propertyQuery = {
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { 'address.city': searchRegex },
        { 'address.state': searchRegex },
        { 'address.zipCode': searchRegex },
        { type: searchRegex },
        { tags: { $in: [searchRegex] } }
      ]
    };

    const properties = await Property.find(propertyQuery)
      .populate('agent', 'name email avatar')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const propertyTotal = await Property.countDocuments(propertyQuery);

    results.properties = {
      data: properties,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: propertyTotal,
        pages: Math.ceil(propertyTotal / limit)
      }
    };
  }

  // Search Users
  if (type === 'all' || type === 'users') {
    const userQuery = {
      $or: [
        { 'name.first': searchRegex },
        { 'name.last': searchRegex },
        { email: searchRegex },
        { role: searchRegex },
        { bio: searchRegex }
      ]
    };

    const users = await User.find(userQuery)
      .select('-password')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const userTotal = await User.countDocuments(userQuery);

    results.users = {
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: userTotal,
        pages: Math.ceil(userTotal / limit)
      }
    };
  }

  // Search Applications
  if (type === 'all' || type === 'applications') {
    const applicationQuery = {
      $or: [
        { 'property.title': searchRegex },
        { 'tenant.name.first': searchRegex },
        { 'tenant.name.last': searchRegex },
        { 'tenant.email': searchRegex },
        { status: searchRegex }
      ]
    };

    const applications = await Application.find(applicationQuery)
      .populate('property', 'title')
      .populate('tenant', 'name email')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const applicationTotal = await Application.countDocuments(applicationQuery);

    results.applications = {
      data: applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: applicationTotal,
        pages: Math.ceil(applicationTotal / limit)
      }
    };
  }

  // Search Maintenance Requests
  if (type === 'all' || type === 'maintenance') {
    const maintenanceQuery = {
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { status: searchRegex },
        { priority: searchRegex },
        { 'property.title': searchRegex },
        { 'tenant.name.first': searchRegex },
        { 'tenant.name.last': searchRegex }
      ]
    };

    const maintenanceRequests = await MaintenanceRequest.find(maintenanceQuery)
      .populate('property', 'title')
      .populate('tenant', 'name email')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const maintenanceTotal = await MaintenanceRequest.countDocuments(maintenanceQuery);

    results.maintenance = {
      data: maintenanceRequests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: maintenanceTotal,
        pages: Math.ceil(maintenanceTotal / limit)
      }
    };
  }

  res.json({
    success: true,
    query: q,
    type,
    results
  });
});

// Advanced property search with filters
exports.searchProperties = catchAsync(async (req, res, next) => {
  const {
    q,
    type,
    minPrice,
    maxPrice,
    bedrooms,
    bathrooms,
    minArea,
    maxArea,
    city,
    state,
    zipCode,
    amenities,
    furnished,
    available,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const query = {};

  // Text search
  if (q) {
    query.$or = [
      { title: new RegExp(q, 'i') },
      { description: new RegExp(q, 'i') },
      { 'address.city': new RegExp(q, 'i') },
      { 'address.state': new RegExp(q, 'i') }
    ];
  }

  // Filter by property type
  if (type) {
    query.type = type;
  }

  // Price range
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }

  // Bedrooms and bathrooms
  if (bedrooms) query.bedrooms = parseInt(bedrooms);
  if (bathrooms) query.bathrooms = parseInt(bathrooms);

  // Area range
  if (minArea || maxArea) {
    query.area = {};
    if (minArea) query.area.$gte = parseFloat(minArea);
    if (maxArea) query.area.$lte = parseFloat(maxArea);
  }

  // Location filters
  if (city) query['address.city'] = new RegExp(city, 'i');
  if (state) query['address.state'] = new RegExp(state, 'i');
  if (zipCode) query['address.zipCode'] = new RegExp(zipCode, 'i');

  // Amenities filter
  if (amenities) {
    const amenityArray = Array.isArray(amenities) ? amenities : amenities.split(',');
    query.amenities = { $all: amenityArray };
  }

  // Furnished filter
  if (furnished !== undefined) {
    query.furnished = furnished === 'true';
  }

  // Availability filter
  if (available !== undefined) {
    query.available = available === 'true';
  }

  // Sorting
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const properties = await Property.find(query)
    .populate('agent', 'name email avatar phone')
    .populate('images')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Property.countDocuments(query);

  res.json({
    success: true,
    properties,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    },
    filters: {
      q,
      type,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      minArea,
      maxArea,
      city,
      state,
      zipCode,
      amenities,
      furnished,
      available,
      sortBy,
      sortOrder
    }
  });
});

// Search users with advanced filters
exports.searchUsers = catchAsync(async (req, res, next) => {
  const {
    q,
    role,
    status,
    city,
    state,
    verified,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const query = {};

  // Text search
  if (q) {
    query.$or = [
      { 'name.first': new RegExp(q, 'i') },
      { 'name.last': new RegExp(q, 'i') },
      { email: new RegExp(q, 'i') },
      { bio: new RegExp(q, 'i') }
    ];
  }

  // Role filter
  if (role) {
    query.role = role;
  }

  // Status filter
  if (status) {
    query.status = status;
  }

  // Location filters
  if (city) query['address.city'] = new RegExp(city, 'i');
  if (state) query['address.state'] = new RegExp(state, 'i');

  // Verification filter
  if (verified !== undefined) {
    query.verified = verified === 'true';
  }

  // Sorting
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const users = await User.find(query)
    .select('-password')
    .populate('spaces', 'name')
    .sort(sort)
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
    },
    filters: {
      q,
      role,
      status,
      city,
      state,
      verified,
      sortBy,
      sortOrder
    }
  });
});

// Get search suggestions/autocomplete
exports.getSearchSuggestions = catchAsync(async (req, res, next) => {
  const { q, type = 'all' } = req.query;
  
  if (!q || q.length < 2) {
    return res.json({
      success: true,
      suggestions: []
    });
  }

  const searchRegex = new RegExp(q, 'i');
  const suggestions = {};

  // Property suggestions
  if (type === 'all' || type === 'properties') {
    const propertyTitles = await Property.find({
      title: searchRegex
    })
    .select('title type address.city address.state')
    .limit(5);

    suggestions.properties = propertyTitles.map(p => ({
      id: p._id,
      text: p.title,
      type: 'property',
      subtype: p.type,
      location: `${p.address.city}, ${p.address.state}`
    }));
  }

  // User suggestions
  if (type === 'all' || type === 'users') {
    const userNames = await User.find({
      $or: [
        { 'name.first': searchRegex },
        { 'name.last': searchRegex },
        { email: searchRegex }
      ]
    })
    .select('name email role')
    .limit(5);

    suggestions.users = userNames.map(u => ({
      id: u._id,
      text: `${u.name.first} ${u.name.last}`,
      type: 'user',
      subtype: u.role,
      email: u.email
    }));
  }

  // City suggestions
  if (type === 'all' || type === 'locations') {
    const cities = await Property.aggregate([
      { $match: { 'address.city': searchRegex } },
      { $group: { _id: '$address.city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    suggestions.cities = cities.map(c => ({
      text: c._id,
      type: 'location',
      subtype: 'city',
      count: c.count
    }));
  }

  // Combine all suggestions
  const allSuggestions = [
    ...(suggestions.properties || []),
    ...(suggestions.users || []),
    ...(suggestions.cities || [])
  ];

  res.json({
    success: true,
    query: q,
    suggestions: allSuggestions.slice(0, 10) // Limit to 10 total suggestions
  });
});

// Get available filters
exports.getAvailableFilters = catchAsync(async (req, res, next) => {
  const filters = {
    propertyTypes: ['apartment', 'house', 'condo', 'townhouse', 'studio', 'loft', 'villa'],
    priceRanges: [
      { label: 'Under $1000', min: 0, max: 1000 },
      { label: '$1000-$2000', min: 1000, max: 2000 },
      { label: '$2000-$3000', min: 2000, max: 3000 },
      { label: '$3000-$5000', min: 3000, max: 5000 },
      { label: '$5000+', min: 5000, max: 10000 }
    ],
    bedroomCounts: [1, 2, 3, 4, 5],
    bathroomCounts: [1, 2, 3, 4],
    amenities: [
      'parking', 'gym', 'pool', 'air_conditioning', 'heating',
      'laundry', 'furnished', 'pet_friendly', 'elevator', 'balcony'
    ],
    cities: await Property.distinct('address.city').sort(),
    states: await Property.distinct('address.state').sort()
  };

  res.json({
    success: true,
    filters
  });
});

// Advanced property search
exports.advancedPropertySearch = catchAsync(async (req, res, next) => {
  const filters = req.body;
  const { page = 1, limit = 20 } = req.query;
  
  const query = {};
  
  // Build query from filters
  if (filters.type) query.type = filters.type;
  if (filters.priceRange) {
    if (filters.priceRange.min) query.price = { $gte: filters.priceRange.min };
    if (filters.priceRange.max) query.price = { ...query.price, $lte: filters.priceRange.max };
  }
  if (filters.bedrooms) query.bedrooms = filters.bedrooms;
  if (filters.bathrooms) query.bathrooms = filters.bathrooms;
  if (filters.amenities && filters.amenities.length > 0) {
    query.amenities = { $all: filters.amenities };
  }
  if (filters.city) query['address.city'] = filters.city;
  if (filters.state) query['address.state'] = filters.state;
  
  const skip = (page - 1) * limit;
  
  const properties = await Property.find(query)
    .populate('owner', 'name email')
    .limit(limit)
    .skip(skip)
    .sort({ createdAt: -1 });
    
  const total = await Property.countDocuments(query);
  
  res.json({
    success: true,
    properties,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// Map-based property search
exports.mapSearch = catchAsync(async (req, res, next) => {
  const {
    ne_lat, ne_lng, sw_lat, sw_lng,
    propertyTypes,
    minPrice,
    maxPrice,
    page = 1,
    limit = 50
  } = req.query;
  
  const query = {
    'address.coordinates': {
      $geoWithin: {
        $box: [
          [parseFloat(sw_lng), parseFloat(sw_lat)],
          [parseFloat(ne_lng), parseFloat(ne_lat)]
        ]
      }
    }
  };
  
  if (propertyTypes) {
    const types = Array.isArray(propertyTypes) ? propertyTypes : [propertyTypes];
    query.type = { $in: types };
  }
  
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }
  
  const skip = (page - 1) * limit;
  
  const properties = await Property.find(query)
    .select('title type price address coordinates images')
    .limit(limit)
    .skip(skip);
    
  const total = await Property.countDocuments(query);
  
  res.json({
    success: true,
    properties,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// Get popular search terms
exports.getPopularSearches = catchAsync(async (req, res, next) => {
  // In a real implementation, you would track search queries in analytics
  // For now, return mock data
  const popularSearches = [
    { term: 'apartment in New York', count: 1250 },
    { term: 'house with 3 bedrooms', count: 980 },
    { term: 'furnished apartment', count: 756 },
    { term: 'pet friendly rental', count: 623 },
    { term: 'studio apartment', count: 512 },
    { term: 'luxury condo', count: 489 },
    { term: 'basement apartment', count: 445 },
    { term: 'duplex for rent', count: 398 }
  ];

  res.json({
    success: true,
    popularSearches
  });
});

// Save search for user
exports.saveSearch = catchAsync(async (req, res, next) => {
  const { name, query, filters } = req.body;

  if (!name || !query) {
    return next(new AppError('Name and query are required', 400));
  }

  // Add to user's saved searches
  const user = await User.findById(req.user.id);
  if (!user.savedSearches) {
    user.savedSearches = [];
  }

  // Check if search already exists
  const existingSearch = user.savedSearches.find(
    search => search.query === query && JSON.stringify(search.filters) === JSON.stringify(filters)
  );

  if (existingSearch) {
    return next(new AppError('Search already saved', 400));
  }

  user.savedSearches.push({
    name,
    query,
    filters,
    createdAt: new Date()
  });

  await user.save();

  res.status(201).json({
    success: true,
    message: 'Search saved successfully',
    savedSearch: user.savedSearches[user.savedSearches.length - 1]
  });
});

// Get user's saved searches
exports.getSavedSearches = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('savedSearches');

  res.json({
    success: true,
    savedSearches: user.savedSearches || []
  });
});

// Delete saved search
exports.deleteSavedSearch = catchAsync(async (req, res, next) => {
  const { searchId } = req.params;

  const user = await User.findById(req.user.id);
  user.savedSearches = user.savedSearches.filter(
    search => search._id.toString() !== searchId
  );

  await user.save();

  res.json({
    success: true,
    message: 'Saved search deleted successfully'
  });
});