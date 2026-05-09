const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  }
});

// Basic middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// Test routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!', timestamp: new Date() });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Add auth routes
try {
  app.use('/api/auth', require('./routes/authRoutes'));
  console.log('✅ Auth routes loaded');
} catch (error) {
  console.error('❌ Failed to load auth routes:', error.message);
}

// Add user routes
try {
  app.use('/api/users', require('./routes/userRoutes'));
  console.log('✅ User routes loaded');
} catch (error) {
  console.error('❌ Failed to load user routes:', error.message);
}

// Add property routes
try {
  app.use('/api/properties', require('./routes/propertyRoutes'));
  console.log('✅ Property routes loaded');
} catch (error) {
  console.error('❌ Failed to load property routes:', error.message);
}

// Add remaining routes
const routes = [
  { path: '/api/applications', file: 'applicationRoutes', name: 'Application' },
  { path: '/api/chat', file: 'chatRoutes', name: 'Chat' },
  { path: '/api/payments', file: 'paymentRoutes', name: 'Payment' },
  { path: '/api/maintenance', file: 'maintenanceRoutes', name: 'Maintenance' },
  { path: '/api/spaces', file: 'spaceRoutes', name: 'Space' },
  { path: '/api/leases', file: 'leaseRoutes', name: 'Lease' },
  { path: '/api/subscriptions', file: 'subscriptionRoutes', name: 'Subscription' },
  { path: '/api/search', file: 'searchRoutes', name: 'Search' }
];

routes.forEach(route => {
  try {
    app.use(route.path, require(`./routes/${route.file}`));
    console.log(`✅ ${route.name} routes loaded`);
  } catch (error) {
    console.error(`❌ Failed to load ${route.name} routes:`, error.message);
  }
});

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/prorender', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
});

module.exports = { app, io };
