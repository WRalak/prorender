// Validation schemas shared between client and server
import { REGEX_PATTERNS } from './constants.js';

// User validation schemas
export const userValidationSchemas = {
  register: {
    firstName: {
      type: 'string',
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z\s]+$/
    },
    lastName: {
      type: 'string',
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z\s]+$/
    },
    email: {
      type: 'string',
      required: true,
      pattern: REGEX_PATTERNS.EMAIL
    },
    password: {
      type: 'string',
      required: true,
      minLength: 8,
      pattern: REGEX_PATTERNS.PASSWORD
    },
    role: {
      type: 'string',
      required: true,
      enum: ['super_admin', 'admin', 'agent', 'tenant', 'landlord']
    },
    phone: {
      type: 'string',
      required: false,
      pattern: REGEX_PATTERNS.PHONE
    }
  },
  
  login: {
    email: {
      type: 'string',
      required: true,
      pattern: REGEX_PATTERNS.EMAIL
    },
    password: {
      type: 'string',
      required: true
    }
  },

  updateProfile: {
    firstName: {
      type: 'string',
      required: false,
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z\s]+$/
    },
    lastName: {
      type: 'string',
      required: false,
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z\s]+$/
    },
    phone: {
      type: 'string',
      required: false,
      pattern: REGEX_PATTERNS.PHONE
    },
    bio: {
      type: 'string',
      required: false,
      maxLength: 500
    }
  },

  changePassword: {
    currentPassword: {
      type: 'string',
      required: true
    },
    newPassword: {
      type: 'string',
      required: true,
      minLength: 8,
      pattern: REGEX_PATTERNS.PASSWORD
    },
    confirmPassword: {
      type: 'string',
      required: true,
      custom: (value, { newPassword }) => value === newPassword
    }
  }
};

// Property validation schemas
export const propertyValidationSchemas = {
  create: {
    title: {
      type: 'string',
      required: true,
      minLength: 5,
      maxLength: 100
    },
    description: {
      type: 'string',
      required: true,
      minLength: 20,
      maxLength: 2000
    },
    type: {
      type: 'string',
      required: true,
      enum: ['apartment', 'house', 'condo', 'townhouse', 'studio', 'loft', 'villa']
    },
    address: {
      street: {
        type: 'string',
        required: true,
        maxLength: 100
      },
      city: {
        type: 'string',
        required: true,
        maxLength: 50
      },
      state: {
        type: 'string',
        required: true,
        maxLength: 50
      },
      zipCode: {
        type: 'string',
        required: true,
        pattern: /^\d{5}(-\d{4})?$/
      },
      country: {
        type: 'string',
        required: true,
        maxLength: 50
      }
    },
    price: {
      type: 'number',
      required: true,
      min: 0,
      max: 1000000
    },
    bedrooms: {
      type: 'number',
      required: true,
      min: 0,
      max: 20
    },
    bathrooms: {
      type: 'number',
      required: true,
      min: 0,
      max: 20
    },
    squareFootage: {
      type: 'number',
      required: true,
      min: 100,
      max: 10000
    },
    amenities: {
      type: 'array',
      required: false,
      items: {
        type: 'string',
        maxLength: 50
      }
    },
    images: {
      type: 'array',
      required: false,
      maxItems: 10,
      items: {
        type: 'string',
        pattern: /^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i
      }
    },
    documents: {
      type: 'array',
      required: false,
      maxItems: 5,
      items: {
        type: 'object',
        properties: {
          fileName: { type: 'string', required: true },
          fileUrl: { type: 'string', required: true },
          fileType: { type: 'string', required: true }
        }
      }
    },
    availabilityDate: {
      type: 'date',
      required: true
    },
    leaseTerms: {
      type: 'string',
      required: true,
      enum: ['month_to_month', 'fixed_term', 'yearly']
    },
    depositRequired: {
      type: 'boolean',
      required: true
    },
    depositAmount: {
      type: 'number',
      required: false,
      min: 0,
      max: 10000
    }
  },

  update: {
    title: {
      type: 'string',
      required: false,
      minLength: 5,
      maxLength: 100
    },
    description: {
      type: 'string',
      required: false,
      minLength: 20,
      maxLength: 2000
    },
    price: {
      type: 'number',
      required: false,
      min: 0,
      max: 1000000
    },
    status: {
      type: 'string',
      required: false,
      enum: ['active', 'inactive', 'pending', 'suspended']
    }
  }
};

// Application validation schemas
export const applicationValidationSchemas = {
  create: {
    propertyId: {
      type: 'string',
      required: true
    },
    message: {
      type: 'string',
      required: true,
      minLength: 10,
      maxLength: 1000
    },
    proposedMoveInDate: {
      type: 'date',
      required: true
    },
    proposedLeaseDuration: {
      type: 'number',
      required: true,
      min: 1,
      max: 36
    },
    documents: {
      type: 'array',
      required: false,
      maxItems: 5,
      items: {
        type: 'object',
        properties: {
          fileName: { type: 'string', required: true },
          fileUrl: { type: 'string', required: true },
          fileType: { type: 'string', required: true }
        }
      }
    }
  },

  update: {
    status: {
      type: 'string',
      required: true,
      enum: ['pending', 'approved', 'rejected', 'expired', 'withdrawn']
    },
    adminMessage: {
      type: 'string',
      required: false,
      maxLength: 500
    }
  }
};

// Payment validation schemas
export const paymentValidationSchemas = {
  create: {
    applicationId: {
      type: 'string',
      required: true
    },
    amount: {
      type: 'number',
      required: true,
      min: 0.01,
      max: 10000
    },
    type: {
      type: 'string',
      required: true,
      enum: ['deposit', 'rent', 'fee', 'other']
    },
    description: {
      type: 'string',
      required: true,
      maxLength: 200
    },
    paymentMethod: {
      type: 'string',
      required: true,
      enum: ['credit_card', 'debit_card', 'bank_transfer', 'check', 'cash']
    }
  }
};

// Maintenance request validation schemas
export const maintenanceValidationSchemas = {
  create: {
    propertyId: {
      type: 'string',
      required: true
    },
    title: {
      type: 'string',
      required: true,
      minLength: 5,
      maxLength: 100
    },
    description: {
      type: 'string',
      required: true,
      minLength: 10,
      maxLength: 1000
    },
    priority: {
      type: 'string',
      required: true,
      enum: ['low', 'medium', 'high', 'urgent']
    },
    category: {
      type: 'string',
      required: true,
      enum: ['plumbing', 'electrical', 'hvac', 'appliance', 'structural', 'pest', 'other']
    },
    images: {
      type: 'array',
      required: false,
      maxItems: 5,
      items: {
        type: 'string',
        pattern: /^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i
      }
    }
  },

  update: {
    status: {
      type: 'string',
      required: true,
      enum: ['pending', 'in_progress', 'resolved', 'cancelled']
    },
    adminNotes: {
      type: 'string',
      required: false,
      maxLength: 500
    },
    estimatedCost: {
      type: 'number',
      required: false,
      min: 0,
      max: 10000
    }
  }
};

// Message validation schemas
export const messageValidationSchemas = {
  send: {
    receiverId: {
      type: 'string',
      required: true
    },
    content: {
      type: 'string',
      required: true,
      minLength: 1,
      maxLength: 1000
    },
    propertyId: {
      type: 'string',
      required: false
    },
    applicationId: {
      type: 'string',
      required: false
    }
  }
};

// Search and filter validation schemas
export const searchValidationSchemas = {
  propertySearch: {
    query: {
      type: 'string',
      required: false,
      maxLength: 100
    },
    type: {
      type: 'array',
      required: false,
      items: {
        type: 'string',
        enum: ['apartment', 'house', 'condo', 'townhouse', 'studio', 'loft', 'villa']
      }
    },
    priceMin: {
      type: 'number',
      required: false,
      min: 0
    },
    priceMax: {
      type: 'number',
      required: false,
      min: 0
    },
    bedrooms: {
      type: 'number',
      required: false,
      min: 0,
      max: 20
    },
    bathrooms: {
      type: 'number',
      required: false,
      min: 0,
      max: 20
    },
    city: {
      type: 'string',
      required: false,
      maxLength: 50
    },
    state: {
      type: 'string',
      required: false,
      maxLength: 50
    },
    zipCode: {
      type: 'string',
      required: false,
      pattern: /^\d{5}(-\d{4})?$/
    },
    page: {
      type: 'number',
      required: false,
      min: 1,
      default: 1
    },
    limit: {
      type: 'number',
      required: false,
      min: 1,
      max: 100,
      default: 20
    },
    sortBy: {
      type: 'string',
      required: false,
      enum: ['price', 'date', 'bedrooms', 'squareFootage'],
      default: 'date'
    },
    sortOrder: {
      type: 'string',
      required: false,
      enum: ['asc', 'desc'],
      default: 'desc'
    }
  }
};

// Utility validation functions
export const validateEmail = (email) => REGEX_PATTERNS.EMAIL.test(email);
export const validatePhone = (phone) => REGEX_PATTERNS.PHONE.test(phone);
export const validatePassword = (password) => REGEX_PATTERNS.PASSWORD.test(password);
export const validateUsername = (username) => REGEX_PATTERNS.USERNAME.test(username);
export const validateSlug = (slug) => REGEX_PATTERNS.SLUG.test(slug);

// Custom validation rules
export const customValidations = {
  passwordsMatch: (password, confirmPassword) => password === confirmPassword,
  dateIsFuture: (date) => new Date(date) > new Date(),
  dateIsPast: (date) => new Date(date) < new Date(),
  priceInRange: (price, min, max) => price >= min && price <= max,
  fileExtension: (filename, allowedExtensions) => {
    const ext = filename.split('.').pop().toLowerCase();
    return allowedExtensions.includes(ext);
  },
  fileSize: (size, maxSize) => size <= maxSize,
  arrayNotEmpty: (array) => Array.isArray(array) && array.length > 0,
  objectId: (id) => /^[0-9a-fA-F]{24}$/.test(id)
};