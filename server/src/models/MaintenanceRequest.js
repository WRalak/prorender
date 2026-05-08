const mongoose = require('mongoose');

const maintenanceRequestSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lease: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lease',
    required: true
  },
  category: {
    type: String,
    enum: ['plumbing', 'electrical', 'hvac', 'appliance', 'pest_control', 'structural', 'other'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'emergency'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  status: {
    type: String,
    enum: ['reported', 'acknowledged', 'in_progress', 'completed', 'cancelled'],
    default: 'reported'
  },
  images: [{
    url: String,
    publicId: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  accessInstructions: String,
  preferredContactMethod: {
    type: String,
    enum: ['phone', 'email', 'text'],
    default: 'email'
  },
  availableTimes: [{
    date: Date,
    startTime: String,
    endTime: String
  }],
  timeline: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    notes: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  estimatedCost: Number,
  actualCost: Number,
  completedAt: Date,
  completionNotes: String,
  tenantRating: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String,
    ratedAt: Date
  }
}, {
  timestamps: true
});

maintenanceRequestSchema.index({ property: 1, status: 1 });
maintenanceRequestSchema.index({ tenant: 1 });
maintenanceRequestSchema.index({ priority: 1, status: 1 });
maintenanceRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('MaintenanceRequest', maintenanceRequestSchema);