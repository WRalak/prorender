const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    required: true,
    enum: ['basic', 'pro', 'enterprise', 'custom']
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'inactive', 'cancelled', 'expired', 'suspended'],
    default: 'inactive'
  },
  stripeSubscriptionId: {
    type: String,
    unique: true,
    sparse: true
  },
  stripeCustomerId: {
    type: String,
    required: true
  },
  stripePriceId: {
    type: String,
    required: true
  },
  currentPeriodStart: {
    type: Date,
    required: true
  },
  currentPeriodEnd: {
    type: Date,
    required: true
  },
  trialEnd: Date,
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  canceledAt: Date,
  endedAt: Date,
  billingCycleAnchor: Date,
  quantity: {
    type: Number,
    default: 1
  },
  unitAmount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true,
    default: 'usd'
  },
  interval: {
    type: String,
    required: true,
    enum: ['day', 'week', 'month', 'year']
  },
  intervalCount: {
    type: Number,
    required: true,
    default: 1
  },
  features: [{
    name: String,
    enabled: Boolean,
    limit: Number,
    current: Number
  }],
  usage: {
    properties: {
      current: { type: Number, default: 0 },
      limit: { type: Number, default: 0 }
    },
    applications: {
      current: { type: Number, default: 0 },
      limit: { type: Number, default: 0 }
    },
    storage: {
      current: { type: Number, default: 0 },
      limit: { type: Number, default: 0 }
    },
    bandwidth: {
      current: { type: Number, default: 0 },
      limit: { type: Number, default: 0 }
    }
  },
  paymentMethods: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PaymentMethod'
  }],
  invoices: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice'
  }],
  metadata: {
    trialPeriodDays: Number,
    promotionCode: String,
    affiliateCode: String,
    source: String,
    campaign: String
  },
  history: [{
    action: {
      type: String,
      enum: ['created', 'updated', 'cancelled', 'renewed', 'upgraded', 'downgraded', 'suspended', 'reactivated']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    previousPlan: String,
    newPlan: String,
    reason: String,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    details: mongoose.Schema.Types.Mixed
  }]
}, {
  timestamps: true
});

// Indexes for efficient querying
subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ status: 1, currentPeriodEnd: 1 });
subscriptionSchema.index({ stripeSubscriptionId: 1 });
subscriptionSchema.index({ stripeCustomerId: 1 });

// Virtual for checking if subscription is active
subscriptionSchema.virtual('isActive').get(function() {
  return this.status === 'active' && this.currentPeriodEnd > new Date();
});

// Virtual for checking if subscription is in trial
subscriptionSchema.virtual('isInTrial').get(function() {
  return this.trialEnd && this.trialEnd > new Date();
});

// Virtual for days until expiration
subscriptionSchema.virtual('daysUntilExpiration').get(function() {
  if (this.currentPeriodEnd) {
    const diff = this.currentPeriodEnd.getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Pre-save hook to update status based on dates
subscriptionSchema.pre('save', function(next) {
  const now = new Date();
  
  // Mark as expired if period end has passed
  if (this.currentPeriodEnd < now && this.status === 'active') {
    this.status = 'expired';
    this.endedAt = now;
  }
  
  // Mark as cancelled if cancel at period end and period has passed
  if (this.cancelAtPeriodEnd && this.currentPeriodEnd < now && this.status === 'active') {
    this.status = 'cancelled';
    this.canceledAt = now;
    this.endedAt = now;
  }
  
  next();
});

module.exports = mongoose.model('Subscription', subscriptionSchema);