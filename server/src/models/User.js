const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    select: false
  },
  name: {
    first: { type: String, required: true, trim: true },
    last: { type: String, required: true, trim: true }
  },
  role: {
    type: String,
    enum: ['tenant', 'agent', 'admin', 'super_admin'],
    default: 'tenant'
  },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  status: {
    type: String,
    enum: ['active', 'banned', 'suspended'],
    default: 'active'
  },
  banReason: String,
  profile: {
    avatar: {
      type: String,
      default: 'https://ui-avatars.com/api/?background=random'
    },
    phone: String,
    bio: String,
    companyName: String,
    licenseNumber: String
  },
  metadata: {
    lastLogin: Date,
    loginCount: { type: Number, default: 0 },
    emailVerifiedAt: Date,
    ipAddresses: [String]
  },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: String,
  spaces: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Space' }],
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],
  savedSearches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SavedSearch' }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get full name
userSchema.virtual('fullName').get(function() {
  return `${this.name.first} ${this.name.last}`;
});

module.exports = mongoose.model('User', userSchema);
