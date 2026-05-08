const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  lease: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lease',
    required: true
  },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  type: {
    type: String,
    enum: ['rent', 'security_deposit', 'application_fee', 'late_fee', 'maintenance', 'utilities', 'other'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  dueDate: {
    type: Date,
    required: true
  },
  paidDate: Date,
  method: {
    type: String,
    enum: ['bank_transfer', 'credit_card', 'debit_card', 'check', 'cash', 'autopay']
  },
  transactionId: String,
  stripePaymentIntentId: String,
  description: String,
  notes: String,
  lateFee: {
    applied: { type: Boolean, default: false },
    amount: { type: Number, default: 0 },
    calculatedAt: Date
  },
  refund: {
    amount: { type: Number, default: 0 },
    reason: String,
    processedAt: Date,
    refundId: String
  },
  reminders: [{
    sentAt: Date,
    type: {
      type: String,
      enum: ['due_date_reminder', 'late_payment', 'payment_failed']
    }
  }]
}, {
  timestamps: true
});

paymentSchema.index({ lease: 1, dueDate: 1 });
paymentSchema.index({ tenant: 1, status: 1 });
paymentSchema.index({ status: 1, dueDate: 1 });

module.exports = mongoose.model('Payment', paymentSchema);