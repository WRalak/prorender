const mongoose = require('mongoose');

const draftPropertySchema = new mongoose.Schema({
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  space: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Space',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'USA' },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  location: {
    city: String,
    state: String,
    zipCode: String,
    neighborhood: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  pricing: {
    rent: Number,
    deposit: Number,
    applicationFee: Number,
    petFee: Number,
    parkingFee: Number,
    utilitiesIncluded: [String],
    additionalFees: [{
      name: String,
      amount: Number,
      recurring: Boolean
    }]
  },
  details: {
    type: {
      type: String,
      enum: ['apartment', 'house', 'condo', 'townhouse', 'studio', 'loft', 'single_family', 'multi_family'],
      required: true
    },
    bedrooms: Number,
    bathrooms: Number,
    squareFeet: Number,
    yearBuilt: Number,
    floors: Number,
    furnished: Boolean,
    parking: {
      type: String,
      enum: ['none', 'street', 'driveway', 'garage', 'carport']
    },
    pets: {
      allowed: Boolean,
      types: [String],
      restrictions: String
    },
    amenities: [String],
    features: [String]
  },
  availability: {
    availableFrom: Date,
    leaseTerm: {
      type: String,
      enum: ['month_to_month', '6_months', '1_year', '2_years', 'custom']
    },
    customLeaseTerm: String,
    noticePeriod: String,
    status: {
      type: String,
      enum: ['available', 'rented', 'maintenance', 'unavailable'],
      default: 'available'
    }
  },
  features: {
    petsAllowed: Boolean,
    parkingIncluded: Boolean,
    utilitiesIncluded: Boolean,
    furnished: Boolean,
    airConditioning: Boolean,
    heating: Boolean,
    laundry: Boolean,
    dishwasher: Boolean,
    balcony: Boolean,
    patio: Boolean,
    yard: Boolean,
    pool: Boolean,
    gym: Boolean,
    security: Boolean,
    elevator: Boolean,
    wheelchairAccessible: Boolean
  },
  media: {
    images: [{
      url: String,
      publicId: String,
      order: Number,
      isPrimary: Boolean,
      caption: String
    }],
    videos: [{
      url: String,
      publicId: String,
      order: Number,
      caption: String
    }],
    virtualTour: String,
    floorPlan: String
  },
  contact: {
    preferredContact: {
      type: String,
      enum: ['email', 'phone', 'both'],
      default: 'both'
    },
    showPhone: Boolean,
    showEmail: Boolean,
    responseTime: String
  },
  showAddress: {
    type: Boolean,
    default: true
  },
  showExactLocation: {
    type: Boolean,
    default: false
  },
  draftVersion: {
    type: Number,
    default: 1
  },
  completionPercentage: {
    type: Number,
    default: 0
  },
  lastSection: String
}, {
  timestamps: true
});

// Indexes
draftPropertySchema.index({ agent: 1, updatedAt: -1 });
draftPropertySchema.index({ space: 1 });

// Calculate completion percentage
draftPropertySchema.pre('save', function(next) {
  let completed = 0;
  let total = 0;
  
  // Required fields
  const requiredFields = [
    'title',
    'description',
    'address.city',
    'pricing.rent',
    'details.type',
    'details.bedrooms',
    'details.bathrooms'
  ];
  
  requiredFields.forEach(field => {
    total++;
    const value = field.split('.').reduce((obj, key) => obj && obj[key], this);
    if (value) completed++;
  });
  
  this.completionPercentage = Math.round((completed / total) * 100);
  next();
});

module.exports = mongoose.model('DraftProperty', draftPropertySchema);
