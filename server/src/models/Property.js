const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Property title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: true,
    maxlength: [10000, 'Description cannot exceed 10000 characters']
  },
  space: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Space',
    required: true
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true, default: 'USA' },
    fullAddress: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  details: {
    propertyType: {
      type: String,
      enum: ['apartment', 'house', 'condo', 'townhouse', 'studio', 'loft', 'duplex'],
      required: true
    },
    bedrooms: { type: Number, required: true, min: 0, max: 20 },
    bathrooms: { type: Number, required: true, min: 0, max: 20 },
    squareFeet: { type: Number, required: true, min: 0, max: 50000 }
  },
  pricing: {
    rent: { type: Number, required: true, min: 0 },
    securityDeposit: { type: Number, required: true, min: 0 },
    applicationFee: { type: Number, default: 0 }
  },
  availability: {
    status: {
      type: String,
      enum: ['available', 'rented', 'pending', 'coming_soon', 'archived'],
      default: 'available'
    },
    availableDate: { type: Date, required: true },
    leaseTerms: [{
      type: Number,
      enum: [6, 12, 18, 24]
    }]
  },
  utilities: {
    water: { type: Boolean, default: false },
    electricity: { type: Boolean, default: false },
    gas: { type: Boolean, default: false },
    internet: { type: Boolean, default: false },
    trash: { type: Boolean, default: false }
  },
  amenities: [{
    type: String,
    enum: ['parking', 'pool', 'gym', 'laundry', 'ac', 'heating', 'balcony', 
           'elevator', 'furnished', 'dishwasher', 'washer_dryer', 'fireplace',
           'hardwood_floors', 'walk_in_closet', 'stainless_steel_appliances']
  }],
  petPolicy: {
    allowed: { type: Boolean, default: false },
    petRent: { type: Number, default: 0 },
    petDeposit: { type: Number, default: 0 },
    restrictions: String,
    maxPets: { type: Number, default: 2 }
  },
  parking: {
    included: { type: Boolean, default: false },
    spots: { type: Number, default: 0 },
    type: { type: String, enum: ['garage', 'carport', 'street', 'lot'] }
  },
  laundry: {
    type: { type: String, enum: ['in_unit', 'in_building', 'none'] },
    inUnit: Boolean
  },
  media: {
    images: [{
      url: String,
      publicId: String,
      order: Number,
      isPrimary: { type: Boolean, default: false }
    }],
    virtualTourUrl: String,
    floorPlanUrl: String
  },
  features: {
    isFeatured: { type: Boolean, default: false },
    featuredExpiresAt: Date,
    scheduledPublishDate: Date,
    views: { type: Number, default: 0 },
    uniqueViews: { type: Number, default: 0 }
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    slug: { type: String, unique: true }
  },
  deletedAt: Date,
  restoreExpiresAt: Date
}, {
  timestamps: true
});

// Indexes for search
propertySchema.index({ 'address.city': 1, 'address.state': 1 });
propertySchema.index({ 'details.bedrooms': 1, 'details.bathrooms': 1 });
propertySchema.index({ 'pricing.rent': 1 });
propertySchema.index({ 'features.isFeatured': -1, createdAt: -1 });
propertySchema.index({ 'address.coordinates': '2dsphere' });

// Virtual for full address
propertySchema.virtual('fullAddress').get(function() {
  return `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.zipCode}`;
});

module.exports = mongoose.model('Property', propertySchema);