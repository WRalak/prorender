const mongoose = require('mongoose');

const leaseSchema = new mongoose.Schema({
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
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'pending_signatures', 'active', 'expired', 'terminated'],
    default: 'draft'
  },
  leaseTerms: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    monthlyRent: { type: Number, required: true },
    securityDeposit: { type: Number, required: true },
    lateFee: { type: Number, default: 0 },
    gracePeriod: { type: Number, default: 5 }, // days
    renewalOption: {
      enabled: { type: Boolean, default: false },
      noticePeriod: { type: Number, default: 60 }, // days
      rentIncrease: { type: Number, default: 0 } // percentage
    }
  },
  payments: {
    dueDate: { type: Number, default: 1 }, // day of month
    acceptedMethods: [{
      type: String,
      enum: ['bank_transfer', 'credit_card', 'debit_card', 'check', 'cash']
    }],
    autopay: {
      enabled: { type: Boolean, default: false },
      paymentMethodId: String,
      nextPaymentDate: Date
    }
  },
  utilities: {
    tenantResponsible: [{
      type: String,
      enum: ['electricity', 'gas', 'water', 'trash', 'internet', 'sewer']
    }],
    includedInRent: [{
      type: String,
      enum: ['electricity', 'gas', 'water', 'trash', 'internet', 'sewer']
    }]
  },
  maintenance: {
    emergencyContact: String,
    requestProcedure: String,
    responseTime: String
  },
  rules: {
    petsAllowed: { type: Boolean, default: false },
    smokingAllowed: { type: Boolean, default: false },
    guestsAllowed: { type: Boolean, default: true },
    quietHours: {
      start: String, // e.g., "22:00"
      end: String   // e.g., "07:00"
    },
    otherRules: [String]
  },
  documents: {
    leaseAgreement: {
      url: String,
      publicId: String,
      uploadedAt: { type: Date, default: Date.now }
    },
    signatures: [{
      party: {
        type: String,
        enum: ['tenant', 'landlord', 'agent', 'guarantor']
      },
      signedAt: Date,
      signatureUrl: String,
      ipAddress: String,
      email: String
    }]
  },
  inspections: [{
    type: {
      type: String,
      enum: ['move_in', 'move_out', 'routine', 'emergency']
    },
    date: Date,
    report: {
      url: String,
      publicId: String
    },
    conductedBy: String,
    notes: String
  }],
  termination: {
    reason: String,
    initiatedBy: {
      type: String,
      enum: ['tenant', 'landlord', 'mutual']
    },
    noticeDate: Date,
    terminationDate: Date,
    penalties: Number
  }
}, {
  timestamps: true
});

leaseSchema.index({ property: 1, tenant: 1 });
leaseSchema.index({ status: 1 });
leaseSchema.index({ 'leaseTerms.startDate': 1 });
leaseSchema.index({ 'leaseTerms.endDate': 1 });

module.exports = mongoose.model('Lease', leaseSchema);