const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('../models/User');

const sampleAgents = [
  {
    name: {
      first: 'Sarah',
      last: 'Johnson'
    },
    email: 'sarah.johnson@prorent.com',
    password: 'password123',
    phone: '+1 (555) 123-4567',
    role: 'agent',
    status: 'active',
    subscription: {
      plan: 'pro',
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      autoRenew: true
    },
    profile: {
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=3b82f6&color=fff',
      bio: 'Experienced real estate agent specializing in residential properties with over 8 years in the industry.',
      phone: '+1 (555) 123-4567',
      companyName: 'Manhattan Properties Group',
      licenseNumber: 'NY Real Estate License #104512345',
      businessAddress: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      }
    },
    // Add agent-specific fields in metadata for now
    metadata: {
      specialties: ['Residential', 'Luxury', 'Investment'],
      languages: ['English', 'Spanish'],
      rating: 4.8,
      reviewCount: 127,
      propertiesCount: 45,
      verified: true,
      responseTime: 'Within 2 hours',
      experience: '8+ years',
      website: 'www.sarahjohnson.realty',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/sarahjohnson',
        twitter: 'https://twitter.com/sarahjohnson'
      },
      achievements: [
        'Top Producer 2023',
        'President\'s Club 2022-2023',
        '100+ Successful Transactions'
      ],
      workingHours: {
        monday: '9:00 AM - 7:00 PM',
        tuesday: '9:00 AM - 7:00 PM',
        wednesday: '9:00 AM - 7:00 PM',
        thursday: '9:00 AM - 7:00 PM',
        friday: '9:00 AM - 7:00 PM',
        saturday: '10:00 AM - 5:00 PM',
        sunday: 'Closed'
      }
    }
  },
  {
    name: {
      first: 'Michael',
      last: 'Chen'
    },
    email: 'michael.chen@prorent.com',
    password: 'password123',
    phone: '+1 (555) 234-5678',
    role: 'agent',
    status: 'active',
    subscription: {
      plan: 'pro',
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      autoRenew: true
    },
    profile: {
      avatar: 'https://ui-avatars.com/api/?name=Michael+Chen&background=10b981&color=fff',
      bio: 'Commercial real estate expert helping businesses find the perfect space for their needs.',
      phone: '+1 (555) 234-5678',
      companyName: 'Bay Area Commercial Realty',
      licenseNumber: 'CA Real Estate License #01987654',
      businessAddress: {
        street: '456 Market St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        country: 'USA'
      }
    },
    metadata: {
      specialties: ['Commercial', 'Retail', 'Office'],
      languages: ['English', 'Mandarin'],
      rating: 4.9,
      reviewCount: 89,
      propertiesCount: 32,
      verified: true,
      responseTime: 'Within 1 hour',
      experience: '6+ years',
      website: 'www.michaelchen.commercial',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/michaelchen'
      }
    }
  },
  {
    name: {
      first: 'Emily',
      last: 'Rodriguez'
    },
    email: 'emily.rodriguez@prorent.com',
    password: 'password123',
    phone: '+1 (555) 345-6789',
    role: 'agent',
    status: 'active',
    subscription: {
      plan: 'basic',
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      autoRenew: false
    },
    profile: {
      avatar: 'https://ui-avatars.com/api/?name=Emily+Rodriguez&background=8b5cf6&color=fff',
      bio: 'Family-focused real estate agent helping families find their perfect homes in the suburbs.',
      phone: '+1 (555) 345-6789',
      companyName: 'Austin Family Realty',
      licenseNumber: 'TX Real Estate License #06789012',
      businessAddress: {
        street: '789 Congress Ave',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        country: 'USA'
      }
    },
    metadata: {
      specialties: ['Family Homes', 'Suburban', 'First-Time Buyers'],
      languages: ['English', 'Spanish'],
      rating: 4.7,
      reviewCount: 95,
      propertiesCount: 38,
      verified: true,
      responseTime: 'Within 3 hours',
      experience: '5+ years',
      achievements: [
        'Rookie of the Year 2020',
        'Family Homes Specialist Certification'
      ]
    }
  }
];

async function seedAgents() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/prorender', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('📊 Connected to MongoDB');
    
    // Clear existing agents
    await User.deleteMany({ role: 'agent' });
    console.log('🗑️  Cleared existing agents');
    
    // Hash passwords and create agents
    const agentsWithHashedPasswords = await Promise.all(
      sampleAgents.map(async (agent) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(agent.password, salt);
        
        return {
          ...agent,
          password: hashedPassword
        };
      })
    );
    
    // Insert agents
    const insertedAgents = await User.insertMany(agentsWithHashedPasswords);
    console.log(`✅ Successfully created ${insertedAgents.length} agents`);
    
    // Display created agents
    insertedAgents.forEach((agent, index) => {
      console.log(`\n${index + 1}. ${agent.name.first} ${agent.name.last}`);
      console.log(`   Email: ${agent.email}`);
      console.log(`   Company: ${agent.profile.companyName || 'N/A'}`);
      console.log(`   Specialties: ${agent.metadata?.specialties?.join(', ') || 'N/A'}`);
      console.log(`   Rating: ${agent.metadata?.rating || 'N/A'}`);
      console.log(`   Verified: ${agent.metadata?.verified || false}`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding agents:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the seed function
seedAgents();
