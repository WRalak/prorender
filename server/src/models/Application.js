const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  personalInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    dateOfBirth: Date,
    ssn: String,
    driverLicense: String
  },
  employmentInfo: {
    employer: String,
    position: String,
    income: { type: Number, required: true },
    employmentLength: String,
    employerPhone: String,
    employerAddress: String
  },
  rentalHistory: [{
    address: String,
    landlordName: String,
    landlordPhone: String,
    rentAmount: Number,
    moveInDate: Date,
    moveOutDate: Date,
    reasonForLeaving: String
  }],
  references: [{
    name: String,
    relationship: String,
    phone: String,
    email: String
  }],
  documents: [{
    type: {
      type: String,
      enum: ['id_proof', 'income_proof', 'rental_history', 'credit_report', 'other']
    },
    url: String,
    publicId: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  backgroundCheck: {
    status: {
      type: String,
      enum: ['pending', 'passed', 'failed', 'not_required'],
      default: 'not_required'
    },
    creditScore: Number,
    criminalRecord: Boolean,
    evictionHistory: Boolean,
    completedAt: Date
  },
  notes: String,
  reviewedAt: Date,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectionReason: String,
  approvedAt: Date,
  leaseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lease'
  }
}, {
  timestamps: true
});

applicationSchema.index({ property: 1, tenant: 1 }, { unique: true });
applicationSchema.index({ status: 1 });
applicationSchema.index({ tenant: 1 });
applicationSchema.index({ property: 1 });

module.exports = mongoose.model('Application', applicationSchema);