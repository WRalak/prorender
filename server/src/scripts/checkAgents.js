const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

async function checkAgents() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/prorender', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('📊 Connected to MongoDB');
    
    // Check all users
    const allUsers = await User.find({});
    console.log(`\nTotal users in database: ${allUsers.length}`);
    
    // Check agents specifically
    const agents = await User.find({ role: 'agent' });
    console.log(`\nAgents in database: ${agents.length}`);
    
    if (agents.length > 0) {
      agents.forEach((agent, index) => {
        console.log(`\n${index + 1}. ${agent.name.first} ${agent.name.last}`);
        console.log(`   Email: ${agent.email}`);
        console.log(`   Role: ${agent.role}`);
        console.log(`   Status: ${agent.status}`);
        console.log(`   Company: ${agent.profile.companyName || 'N/A'}`);
        console.log(`   Has metadata: ${!!agent.metadata}`);
        if (agent.metadata) {
          console.log(`   Metadata keys: ${Object.keys(agent.metadata)}`);
        }
      });
    }
    
    // Test the exact query from controller
    const queryResult = await User.find({ 
      role: 'agent',
      status: 'active'
    }).select('-password -resetPasswordToken -resetPasswordExpires');
    
    console.log(`\nQuery result (active agents): ${queryResult.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkAgents();
