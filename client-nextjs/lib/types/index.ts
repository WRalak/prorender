// User Types
export interface User {
  id: string;
  email: string;
  name: {
    first: string;
    last: string;
  };
  role: 'tenant' | 'agent' | 'admin' | 'super_admin';
  profile?: {
    avatar?: string;
    phone?: string;
    bio?: string;
    location?: string;
  };
  subscription?: Subscription;
  createdAt: string;
  updatedAt: string;
}

// Property Types
export interface Property {
  id: string;
  title: string;
  description: string;
  type: 'apartment' | 'house' | 'condo' | 'studio' | 'townhouse';
  status: 'available' | 'rented' | 'pending' | 'maintenance';
  price: number;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
  amenities: string[];
  images: string[];
  agentId: string;
  agent?: Agent;
  createdAt: string;
  updatedAt: string;
  featured?: boolean;
}

// Agent Types
export interface Agent {
  id: string;
  userId: string;
  user: User;
  licenseNumber?: string;
  company?: string;
  bio?: string;
  specialties: string[];
  languages: string[];
  responseRate: number;
  responseTime: string;
  totalListings: number;
  rating: number;
  reviews: Review[];
  subscription: AgentSubscription;
  createdAt: string;
}

// Application Types
export interface Application {
  id: string;
  propertyId: string;
  property: Property;
  tenantId: string;
  tenant: User;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  documents: ApplicationDocument[];
  message?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
}

export interface ApplicationDocument {
  id: string;
  name: string;
  url: string;
  type: 'id' | 'income' | 'employment' | 'references' | 'other';
  uploadedAt: string;
}

// Message Types
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: User;
  content: string;
  type: 'text' | 'file' | 'image';
  fileUrl?: string;
  fileName?: string;
  readAt?: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: User[];
  propertyId?: string;
  property?: Property;
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

// Payment Types
export interface Payment {
  id: string;
  type: 'rent' | 'deposit' | 'application_fee' | 'subscription' | 'service';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  method: 'stripe' | 'mpesa' | 'bank_transfer' | 'cash';
  propertyId?: string;
  tenantId?: string;
  agentId?: string;
  dueDate?: string;
  paidAt?: string;
  description: string;
  metadata?: Record<string, any>;
}

// Lease Types
export interface Lease {
  id: string;
  propertyId: string;
  property: Property;
  tenantId: string;
  tenant: User;
  agentId: string;
  agent: Agent;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  securityDeposit: number;
  terms: string;
  status: 'draft' | 'pending_signature' | 'active' | 'expired' | 'terminated';
  documents: LeaseDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface LeaseDocument {
  id: string;
  name: string;
  url: string;
  type: 'lease' | 'addendum' | 'inspection' | 'other';
  signedAt?: string;
  signedBy?: string;
}

// Maintenance Types
export interface MaintenanceRequest {
  id: string;
  propertyId: string;
  property: Property;
  tenantId: string;
  tenant: User;
  title: string;
  description: string;
  category: 'plumbing' | 'electrical' | 'appliance' | 'structural' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  images: string[];
  scheduledDate?: string;
  completedAt?: string;
  assignedTo?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Subscription Types
export interface Subscription {
  id: string;
  type: 'basic' | 'premium' | 'pro';
  status: 'active' | 'inactive' | 'cancelled' | 'expired';
  startDate: string;
  endDate: string;
  amount: number;
  currency: string;
  features: string[];
  autoRenew: boolean;
}

export interface AgentSubscription extends Subscription {
  maxListings: number;
  featuredListings: number;
  advancedAnalytics: boolean;
  customBranding: boolean;
  prioritySupport: boolean;
}

// Review Types
export interface Review {
  id: string;
  rating: number;
  comment: string;
  author: User;
  targetId: string;
  targetType: 'property' | 'agent' | 'tenant';
  createdAt: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'message' | 'application' | 'payment' | 'lease' | 'maintenance' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
