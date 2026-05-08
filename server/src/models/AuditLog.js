const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'login',
      'logout',
      'signup',
      'password_change',
      'password_reset',
      'email_verification',
      'profile_update',
      'property_create',
      'property_update',
      'property_delete',
      'application_create',
      'application_update',
      'application_delete',
      'payment_create',
      'payment_update',
      'maintenance_create',
      'maintenance_update',
      'message_send',
      'file_upload',
      'admin_action',
      'system_action'
    ]
  },
  details: {
    ip: String,
    userAgent: String,
    method: String,
    url: String,
    body: mongoose.Schema.Types.Mixed,
    params: mongoose.Schema.Types.Mixed,
    query: mongoose.Schema.Types.Mixed,
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  status: {
    type: Number,
    default: 200
  },
  success: {
    type: Boolean,
    default: true
  },
  errorMessage: String
}, {
  timestamps: true
});

// Index for efficient querying
auditLogSchema.index({ user: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);