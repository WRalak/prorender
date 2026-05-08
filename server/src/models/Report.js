const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'financial',
      'occupancy',
      'maintenance',
      'user_activity',
      'property_performance',
      'application_stats',
      'payment_summary',
      'system_health',
      'custom'
    ]
  },
  description: {
    type: String,
    trim: true
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parameters: {
    dateRange: {
      start: Date,
      end: Date
    },
    filters: mongoose.Schema.Types.Mixed,
    groupBy: String,
    sortBy: String,
    limit: Number
  },
  data: {
    summary: mongoose.Schema.Types.Mixed,
    charts: [{
      type: {
        type: String,
        enum: ['bar', 'line', 'pie', 'area', 'scatter']
      },
      title: String,
      data: mongoose.Schema.Types.Mixed,
      config: mongoose.Schema.Types.Mixed
    }],
    tables: [{
      title: String,
      headers: [String],
      rows: [mongoose.Schema.Types.Mixed],
      config: mongoose.Schema.Types.Mixed
    }],
    metrics: [{
      name: String,
      value: mongoose.Schema.Types.Mixed,
      unit: String,
      trend: {
        direction: {
          type: String,
          enum: ['up', 'down', 'stable']
        },
        percentage: Number
      }
    }]
  },
  status: {
    type: String,
    enum: ['generating', 'completed', 'failed', 'scheduled'],
    default: 'generating'
  },
  scheduledAt: Date,
  completedAt: Date,
  expiresAt: Date,
  fileUrl: String,
  fileSize: Number,
  format: {
    type: String,
    enum: ['pdf', 'excel', 'csv', 'json'],
    default: 'pdf'
  },
  shareable: {
    type: Boolean,
    default: false
  },
  shareToken: String,
  shareExpiresAt: Date,
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [String],
  metadata: {
    processingTime: Number,
    recordCount: Number,
    lastAccessed: Date,
    accessCount: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
reportSchema.index({ generatedBy: 1, createdAt: -1 });
reportSchema.index({ type: 1, createdAt: -1 });
reportSchema.index({ status: 1 });
reportSchema.index({ scheduledAt: 1 });
reportSchema.index({ expiresAt: 1 });

// Virtual for checking if report is expired
reportSchema.virtual('isExpired').get(function() {
  return this.expiresAt && this.expiresAt < new Date();
});

// Pre-save hook to generate share token if shareable
reportSchema.pre('save', function(next) {
  if (this.shareable && !this.shareToken) {
    this.shareToken = require('crypto').randomBytes(32).toString('hex');
    if (!this.shareExpiresAt) {
      this.shareExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    }
  }
  next();
});

module.exports = mongoose.model('Report', reportSchema);