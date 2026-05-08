const mongoose = require('mongoose');

const spaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Space name is required'],
    trim: true,
    maxlength: [100, 'Space name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  logo: {
    url: String,
    publicId: String
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  properties: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  }],
  subscription: {
    plan: {
      type: String,
      enum: ['basic', 'pro', 'enterprise'],
      default: 'basic'
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'canceled', 'trialing'],
      default: 'trialing'
    },
    trialEndsAt: Date,
    currentPeriodEndsAt: Date,
    stripeSubscriptionId: String,
    stripeCustomerId: String
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvalNote: String,
  rejectionReason: String,
  approvedAt: Date,
  isFeatured: { type: Boolean, default: false },
  settings: {
    allowInstantBookings: { type: Boolean, default: false },
    autoResponderMessage: String,
    responseTimeGoal: { type: Number, default: 60 },
    timezone: { type: String, default: 'UTC' },
    currency: { type: String, default: 'USD' },
    language: { type: String, default: 'en' }
  },
  stats: {
    totalViews: { type: Number, default: 0 },
    totalMessages: { type: Number, default: 0 },
    totalLeasesSigned: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    responseTime: Number
  }
}, {
  timestamps: true
});

// Generate slug before saving
spaceSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
  next();
});

module.exports = mongoose.model('Space', spaceSchema);