const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['tenant', 'agent', 'landlord', 'admin']
    },
    joinedAt: { type: Date, default: Date.now }
  }],
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  },
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  },
  type: {
    type: String,
    enum: ['property_inquiry', 'application_discussion', 'lease_negotiation', 'maintenance_request', 'payment_discussion', 'general'],
    default: 'general'
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'closed'],
    default: 'active'
  },
  lastMessage: {
    content: String,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: Date
  },
  unreadCounts: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    count: { type: Number, default: 0 }
  }],
  metadata: {
    subject: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    tags: [String]
  },
  archivedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    archivedAt: Date
  }]
}, {
  timestamps: true
});

conversationSchema.index({ 'participants.user': 1 });
conversationSchema.index({ property: 1 });
conversationSchema.index({ application: 1 });
conversationSchema.index({ status: 1 });
conversationSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);