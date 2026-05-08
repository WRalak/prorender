// MongoDB initialization script

// Create application database
db = db.getSiblingDB('proprender');

// Create application user
db.createUser({
  user: 'proprender_user',
  pwd: 'proprender_password',
  roles: [
    {
      role: 'readWrite',
      db: 'proprender'
    }
  ]
});

// Create collections with validation schemas
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'password', 'role'],
      properties: {
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
        },
        password: {
          bsonType: 'string',
          minLength: 8
        },
        role: {
          bsonType: 'string',
          enum: ['tenant', 'agent', 'admin', 'super_admin']
        },
        isActive: {
          bsonType: 'bool'
        },
        createdAt: {
          bsonType: 'date'
        }
      }
    }
  }
});

db.createCollection('properties', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'description', 'type', 'address', 'pricing', 'ownerId'],
      properties: {
        title: {
          bsonType: 'string',
          minLength: 3,
          maxLength: 100
        },
        description: {
          bsonType: 'string',
          minLength: 10,
          maxLength: 2000
        },
        type: {
          bsonType: 'string',
          enum: ['apartment', 'house', 'condo', 'townhouse', 'studio', 'loft', 'duplex', 'villa', 'cottage', 'other']
        },
        status: {
          bsonType: 'string',
          enum: ['draft', 'pending', 'approved', 'rejected', 'active', 'inactive', 'rented', 'maintenance']
        },
        bedrooms: {
          bsonType: 'int',
          minimum: 0
        },
        bathrooms: {
          bsonType: 'int',
          minimum: 0
        },
        squareFeet: {
          bsonType: 'int',
          minimum: 1
        },
        pricing: {
          bsonType: 'object',
          required: ['rent'],
          properties: {
            rent: {
              bsonType: 'double',
              minimum: 0
            },
            deposit: {
              bsonType: 'double',
              minimum: 0
            },
            currency: {
              bsonType: 'string',
              pattern: '^[A-Z]{3}$'
            }
          }
        },
        address: {
          bsonType: 'object',
          required: ['street', 'city', 'state', 'zipCode'],
          properties: {
            street: {
              bsonType: 'string',
              minLength: 5
            },
            city: {
              bsonType: 'string',
              minLength: 2
            },
            state: {
              bsonType: 'string',
              minLength: 2
            },
            zipCode: {
              bsonType: 'string',
              pattern: '^\\d{5}(-\\d{4})?$'
            },
            coordinates: {
              bsonType: 'array',
              items: {
                bsonType: 'double'
              },
              minItems: 2,
              maxItems: 2
            }
          }
        },
        ownerId: {
          bsonType: 'objectId'
        },
        createdAt: {
          bsonType: 'date'
        },
        updatedAt: {
          bsonType: 'date'
        }
      }
    }
  }
});

db.createCollection('applications', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['propertyId', 'applicantId', 'status'],
      properties: {
        propertyId: {
          bsonType: 'objectId'
        },
        applicantId: {
          bsonType: 'objectId'
        },
        status: {
          bsonType: 'string',
          enum: ['draft', 'submitted', 'under_review', 'pending_documents', 'approved', 'rejected', 'withdrawn', 'expired']
        },
        personalInfo: {
          bsonType: 'object',
          properties: {
            firstName: {
              bsonType: 'string',
              minLength: 2
            },
            lastName: {
              bsonType: 'string',
              minLength: 2
            },
            email: {
              bsonType: 'string',
              pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
            },
            phone: {
              bsonType: 'string',
              pattern: '^\\+?[\\d\\s\\-\\(\\)]+$'
            }
          }
        },
        employmentInfo: {
          bsonType: 'object',
          properties: {
            employer: {
              bsonType: 'string',
              minLength: 2
            },
            position: {
              bsonType: 'string',
              minLength: 2
            },
            income: {
              bsonType: 'double',
              minimum: 0
            }
          }
        },
        createdAt: {
          bsonType: 'date'
        },
        updatedAt: {
          bsonType: 'date'
        }
      }
    }
  }
});

db.createCollection('leases', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['propertyId', 'tenantId', 'landlordId', 'startDate', 'endDate', 'rent'],
      properties: {
        propertyId: {
          bsonType: 'objectId'
        },
        tenantId: {
          bsonType: 'objectId'
        },
        landlordId: {
          bsonType: 'objectId'
        },
        status: {
          bsonType: 'string',
          enum: ['draft', 'active', 'expired', 'terminated', 'renewed']
        },
        startDate: {
          bsonType: 'date'
        },
        endDate: {
          bsonType: 'date'
        },
        rent: {
          bsonType: 'double',
          minimum: 0
        },
        deposit: {
          bsonType: 'double',
          minimum: 0
        },
        createdAt: {
          bsonType: 'date'
        },
        updatedAt: {
          bsonType: 'date'
        }
      }
    }
  }
});

db.createCollection('payments', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['leaseId', 'amount', 'status', 'type'],
      properties: {
        leaseId: {
          bsonType: 'objectId'
        },
        tenantId: {
          bsonType: 'objectId'
        },
        amount: {
          bsonType: 'double',
          minimum: 0
        },
        status: {
          bsonType: 'string',
          enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded']
        },
        type: {
          bsonType: 'string',
          enum: ['rent', 'deposit', 'late_fee', 'maintenance', 'other']
        },
        dueDate: {
          bsonType: 'date'
        },
        paidDate: {
          bsonType: 'date'
        },
        createdAt: {
          bsonType: 'date'
        }
      }
    }
  }
});

db.createCollection('maintenance', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['propertyId', 'tenantId', 'title', 'description', 'status'],
      properties: {
        propertyId: {
          bsonType: 'objectId'
        },
        tenantId: {
          bsonType: 'objectId'
        },
        title: {
          bsonType: 'string',
          minLength: 3,
          maxLength: 100
        },
        description: {
          bsonType: 'string',
          minLength: 10,
          maxLength: 1000
        },
        status: {
          bsonType: 'string',
          enum: ['open', 'in_progress', 'resolved', 'closed', 'cancelled']
        },
        priority: {
          bsonType: 'string',
          enum: ['low', 'medium', 'high', 'urgent']
        },
        images: {
          bsonType: 'array',
          items: {
            bsonType: 'string'
          }
        },
        createdAt: {
          bsonType: 'date'
        },
        updatedAt: {
          bsonType: 'date'
        }
      }
    }
  }
});

db.createCollection('messages', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['conversationId', 'senderId', 'content', 'type'],
      properties: {
        conversationId: {
          bsonType: 'objectId'
        },
        senderId: {
          bsonType: 'objectId'
        },
        content: {
          bsonType: 'string',
          minLength: 1,
          maxLength: 1000
        },
        type: {
          bsonType: 'string',
          enum: ['text', 'image', 'file', 'system']
        },
        read: {
          bsonType: 'bool'
        },
        createdAt: {
          bsonType: 'date'
        }
      }
    }
  }
});

db.createCollection('conversations', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['participants'],
      properties: {
        participants: {
          bsonType: 'array',
          items: {
            bsonType: 'objectId'
          },
          minItems: 2,
          maxItems: 2
        },
        lastMessage: {
          bsonType: 'objectId'
        },
        createdAt: {
          bsonType: 'date'
        },
        updatedAt: {
          bsonType: 'date'
        }
      }
    }
  }
});

db.createCollection('notifications', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'type', 'title', 'message'],
      properties: {
        userId: {
          bsonType: 'objectId'
        },
        type: {
          bsonType: 'string',
          enum: ['application_submitted', 'application_approved', 'application_rejected', 'lease_signed', 'payment_due', 'payment_received', 'maintenance_request', 'maintenance_updated', 'message_received', 'property_approved', 'property_rejected', 'system_announcement']
        },
        title: {
          bsonType: 'string',
          minLength: 1,
          maxLength: 100
        },
        message: {
          bsonType: 'string',
          minLength: 1,
          maxLength: 500
        },
        read: {
          bsonType: 'bool'
        },
        createdAt: {
          bsonType: 'date'
        }
      }
    }
  }
});

// Create indexes for performance optimization

// Users collection indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ isActive: 1 });
db.users.createIndex({ createdAt: 1 });

// Properties collection indexes
db.properties.createIndex({ ownerId: 1 });
db.properties.createIndex({ type: 1 });
db.properties.createIndex({ status: 1 });
db.properties.createIndex({ 'pricing.rent': 1 });
db.properties.createIndex({ bedrooms: 1 });
db.properties.createIndex({ bathrooms: 1 });
db.properties.createIndex({ squareFeet: 1 });
db.properties.createIndex({ 'address.coordinates': '2dsphere' });
db.properties.createIndex({ createdAt: 1 });
db.properties.createIndex({ updatedAt: 1 });

// Applications collection indexes
db.applications.createIndex({ propertyId: 1 });
db.applications.createIndex({ applicantId: 1 });
db.applications.createIndex({ status: 1 });
db.applications.createIndex({ createdAt: 1 });
db.applications.createIndex({ updatedAt: 1 });

// Leases collection indexes
db.leases.createIndex({ propertyId: 1 });
db.leases.createIndex({ tenantId: 1 });
db.leases.createIndex({ landlordId: 1 });
db.leases.createIndex({ status: 1 });
db.leases.createIndex({ startDate: 1 });
db.leases.createIndex({ endDate: 1 });
db.leases.createIndex({ createdAt: 1 });

// Payments collection indexes
db.payments.createIndex({ leaseId: 1 });
db.payments.createIndex({ tenantId: 1 });
db.payments.createIndex({ status: 1 });
db.payments.createIndex({ type: 1 });
db.payments.createIndex({ dueDate: 1 });
db.payments.createIndex({ paidDate: 1 });
db.payments.createIndex({ createdAt: 1 });

// Maintenance collection indexes
db.maintenance.createIndex({ propertyId: 1 });
db.maintenance.createIndex({ tenantId: 1 });
db.maintenance.createIndex({ status: 1 });
db.maintenance.createIndex({ priority: 1 });
db.maintenance.createIndex({ createdAt: 1 });
db.maintenance.createIndex({ updatedAt: 1 });

// Messages collection indexes
db.messages.createIndex({ conversationId: 1 });
db.messages.createIndex({ senderId: 1 });
db.messages.createIndex({ createdAt: 1 });

// Conversations collection indexes
db.conversations.createIndex({ participants: 1 });
db.conversations.createIndex({ lastMessage: 1 });
db.conversations.createIndex({ updatedAt: 1 });

// Notifications collection indexes
db.notifications.createIndex({ userId: 1 });
db.notifications.createIndex({ type: 1 });
db.notifications.createIndex({ read: 1 });
db.notifications.createIndex({ createdAt: 1 });

// Create text search indexes
db.properties.createIndex({
  title: 'text',
  description: 'text',
  'address.street': 'text',
  'address.city': 'text',
  'address.state': 'text'
});

print('MongoDB initialization completed successfully');
