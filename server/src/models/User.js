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
    enum: ['active', 'banned', 'suspended', 'pending_approval'],
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
    licenseNumber: String,
    businessAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['basic', 'pro'],
      default: null
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired', 'pending'],
      default: null
    },
    startDate: Date,
    endDate: Date,
    autoRenew: { type: Boolean, default: false },
    stripeSubscriptionId: String,
    stripeCustomerId: String,
    canceledAt: Date,
    cancelReason: String,
    trialEndsAt: Date
  },
  metadata: {
    lastLogin: Date,
    loginCount: { type: Number, default: 0 },
    emailVerifiedAt: Date,
    ipAddresses: [String],
    propertyCount: { type: Number, default: 0 },
    applicationCount: { type: Number, default: 0 },
    leaseCount: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    commissionPaid: { type: Number, default: 0 },
    approvalNotes: String,
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: Date
  },
  permissions: {
    canListProperties: { type: Boolean, default: false },
    canManageUsers: { type: Boolean, default: false },
    canManagePlatform: { type: Boolean, default: false },
    canApproveSpaces: { type: Boolean, default: false },
    canModerateContent: { type: Boolean, default: false },
    canViewRevenue: { type: Boolean, default: false },
    canManagePlans: { type: Boolean, default: false },
    canEditTemplates: { type: Boolean, default: false },
    canManageBackups: { type: Boolean, default: false }
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

// Role-based permission methods
userSchema.methods.isTenant = function() {
  return this.role === 'tenant';
};

userSchema.methods.isAgent = function() {
  return this.role === 'agent';
};

userSchema.methods.isAdmin = function() {
  return this.role === 'admin';
};

userSchema.methods.isSuperAdmin = function() {
  return this.role === 'super_admin';
};

userSchema.methods.hasActiveSubscription = function() {
  return this.subscription && 
         this.subscription.status === 'active' && 
         this.subscription.endDate && 
         new Date(this.subscription.endDate) > new Date();
};

userSchema.methods.getPropertyLimit = function() {
  if (!this.hasActiveSubscription()) return 0;
  return this.subscription.plan === 'basic' ? 10 : 50;
};

userSchema.methods.canListProperties = function() {
  return this.permissions.canListProperties || this.isAgent() || this.isAdmin() || this.isSuperAdmin();
};

userSchema.methods.canManageUsers = function() {
  return this.permissions.canManageUsers || this.isAdmin() || this.isSuperAdmin();
};

userSchema.methods.canManagePlatform = function() {
  return this.permissions.canManagePlatform || this.isSuperAdmin();
};

userSchema.methods.canApproveSpaces = function() {
  return this.permissions.canApproveSpaces || this.isAdmin() || this.isSuperAdmin();
};

userSchema.methods.canModerateContent = function() {
  return this.permissions.canModerateContent || this.isAdmin() || this.isSuperAdmin();
};

userSchema.methods.canViewRevenue = function() {
  return this.permissions.canViewRevenue || this.isAdmin() || this.isSuperAdmin();
};

userSchema.methods.canManagePlans = function() {
  return this.permissions.canManagePlans || this.isSuperAdmin();
};

// Update permissions based on role
userSchema.methods.updatePermissions = function() {
  switch (this.role) {
    case 'tenant':
      this.permissions = {
        canListProperties: false,
        canManageUsers: false,
        canManagePlatform: false,
        canApproveSpaces: false,
        canModerateContent: false,
        canViewRevenue: false,
        canManagePlans: false,
        canEditTemplates: false,
        canManageBackups: false
      };
      break;
    case 'agent':
      this.permissions = {
        canListProperties: true,
        canManageUsers: false,
        canManagePlatform: false,
        canApproveSpaces: false,
        canModerateContent: false,
        canViewRevenue: false,
        canManagePlans: false,
        canEditTemplates: false,
        canManageBackups: false
      };
      break;
    case 'admin':
      this.permissions = {
        canListProperties: true,
        canManageUsers: true,
        canManagePlatform: false,
        canApproveSpaces: true,
        canModerateContent: true,
        canViewRevenue: true,
        canManagePlans: false,
        canEditTemplates: false,
        canManageBackups: false
      };
      break;
    case 'super_admin':
      this.permissions = {
        canListProperties: true,
        canManageUsers: true,
        canManagePlatform: true,
        canApproveSpaces: true,
        canModerateContent: true,
        canViewRevenue: true,
        canManagePlans: true,
        canEditTemplates: true,
        canManageBackups: true
      };
      break;
  }
};

// Pre-save middleware to update permissions
userSchema.pre('save', function(next) {
  if (this.isModified('role')) {
    this.updatePermissions();
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
