const mongoose = require('mongoose');

const savedSearchSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Search name cannot exceed 100 characters']
  },
  criteria: {
    location: {
      city: String,
      state: String,
      zipCode: String,
      coordinates: {
        lat: Number,
        lng: Number,
        radius: Number // miles
      }
    },
    propertyType: [{
      type: String,
      enum: ['apartment', 'house', 'condo', 'townhouse', 'studio', 'loft', 'duplex']
    }],
    priceRange: {
      min: Number,
      max: Number
    },
    bedrooms: {
      min: Number,
      max: Number
    },
    bathrooms: {
      min: Number,
      max: Number
    },
    squareFeet: {
      min: Number,
      max: Number
    },
    amenities: [{
      type: String,
      enum: ['parking', 'pool', 'gym', 'laundry', 'ac', 'heating', 'balcony', 
             'elevator', 'furnished', 'dishwasher', 'washer_dryer', 'fireplace',
             'hardwood_floors', 'walk_in_closet', 'stainless_steel_appliances']
    }],
    petPolicy: {
      allowed: Boolean
    },
    availability: {
      moveInDate: {
        type: Date,
        default: () => new Date()
      }
    },
    keywords: String
  },
  notifications: {
    enabled: { type: Boolean, default: true },
    frequency: {
      type: String,
      enum: ['immediate', 'daily', 'weekly'],
      default: 'daily'
    },
    lastNotifiedAt: Date
  },
  isActive: { type: Boolean, default: true },
  resultsCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

savedSearchSchema.index({ user: 1 });
savedSearchSchema.index({ isActive: 1 });
savedSearchSchema.index({ 'notifications.lastNotifiedAt': 1 });

module.exports = mongoose.model('SavedSearch', savedSearchSchema);