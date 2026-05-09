# Frontend Integration - ProRender Property Rental Platform

## 🎯 Overview

Your existing React frontend has been successfully integrated with all the new backend services we implemented. The integration includes comprehensive API endpoints and a testing dashboard.

## 🚀 New Features Added

### 1. **Enhanced API Service** (`src/services/api.js`)
- ✅ **AI Moderation API** - Content moderation with ML/AI
- ✅ **Audit Service API** - Comprehensive audit logging
- ✅ **Backup Service API** - Database backup and restore
- ✅ **Calendar Service API** - Event scheduling and management
- ✅ **Notification Service API** - Multi-channel notifications
- ✅ **Enhanced Payment Service API** - Complete payment processing
- ✅ **Health Check API** - Server health monitoring
- ✅ **Enhanced Search API** - Advanced property search

### 2. **Service Test Dashboard** (`src/components/ServiceTestDashboard.jsx`)
- 🧪 **Comprehensive Testing** - Test all backend services
- 📊 **Real-time Results** - See response times and success rates
- 📈 **Statistics** - Overall service health metrics
- 🔍 **Detailed Logs** - View API responses and errors
- 🎛️ **Interactive Interface** - Individual service testing

### 3. **Quick Access Navigation** (`src/components/ServiceTestNav.jsx`)
- 🎯 **Floating Button** - Easy access to test dashboard
- 📍 **Fixed Position** - Always available on all pages
- 🎨 **Modern Design** - Clean and intuitive UI

## 🛠️ How to Use

### 1. **Start the Backend Server**
```bash
cd server
npm start
```
Server will run on: `http://localhost:5001`

### 2. **Start the Frontend**
```bash
cd client
npm run dev
```
Frontend will run on: `http://localhost:5173`

### 3. **Access the Service Test Dashboard**
- Navigate to: `http://localhost:5173/test-services`
- Or click the "Test Services" button (bottom-right corner)

## 📋 Available API Endpoints

### 🤖 AI Moderation API
```javascript
import { moderationAPI } from '../services/api';

// Moderate content
await moderationAPI.moderateContent('Test message');

// Get moderation statistics
await moderationAPI.getModerationStats('24h');

// Moderate property listing
await moderationAPI.moderateProperty(propertyData);
```

### 🔍 Audit Service API
```javascript
import { auditAPI } from '../services/api';

// Get audit logs
await auditAPI.getLogs({ page: 1, limit: 10 });

// Get audit statistics
await auditAPI.getStats('24h');

// Log security event
await auditAPI.logSecurityEvent(eventData);
```

### 💾 Backup Service API
```javascript
import { backupAPI } from '../services/api';

// Get backup history
await backupAPI.getBackupHistory();

// Create backup
await backupAPI.createBackup({ type: 'full' });

// Get backup statistics
await backupAPI.getBackupStats();
```

### 📅 Calendar Service API
```javascript
import { calendarAPI } from '../services/api';

// Get user calendar
await calendarAPI.getUserCalendar(userId, filters);

// Create calendar event
await calendarAPI.createCalendarEvent(userId, eventData);

// Schedule viewing
await calendarAPI.scheduleViewing(propertyId, userId, viewingData);
```

### 🔔 Notification Service API
```javascript
import { notificationAPI } from '../services/api';

// Send notification
await notificationAPI.sendNotification(userId, notificationData);

// Get user notifications
await notificationAPI.getUserNotifications(userId, filters);

// Get notification statistics
await notificationAPI.getNotificationStats(userId, '30d');
```

### 💳 Enhanced Payment Service API
```javascript
import { paymentServiceAPI } from '../services/api';

// Process payment
await paymentServiceAPI.processPayment(paymentData);

// Get payment methods
await paymentServiceAPI.getPaymentMethods();

// Create payment intent
await paymentServiceAPI.createPaymentIntent(paymentData);
```

### 🏥 Health Check API
```javascript
import { healthAPI } from '../services/api';

// Check server health
await healthAPI.getHealth();

// Get server information
await healthAPI.getServerInfo();
```

### 🔍 Enhanced Search API
```javascript
import { searchAPI } from '../services/api';

// Get search filters
await searchAPI.getSearchFilters();

// Get search suggestions
await searchAPI.getSearchSuggestions('apartment');

// Search properties
await searchAPI.searchProperties(searchParams);
```

## 🧪 Testing Dashboard Features

### **Service Categories**
1. **Health Check** - Server status and information
2. **AI Moderation** - Content moderation testing
3. **Audit Service** - Audit log and statistics
4. **Backup Service** - Backup management testing
5. **Calendar Service** - Calendar and scheduling
6. **Notifications** - Notification system testing
7. **Payment Service** - Payment processing testing
8. **Search Service** - Search functionality testing

### **Test Results**
- ✅ **Success Rate** - Pass/fail indicators
- ⏱️ **Response Times** - Performance metrics
- 📊 **Statistics** - Overall health overview
- 🔍 **Detailed Logs** - API responses and errors
- 🔄 **Real-time Updates** - Live test results

## 🔧 Configuration

### **API Base URL**
The frontend is configured to connect to `http://localhost:5001` by default. You can override this by setting the `VITE_SERVER_URL` environment variable:

```bash
VITE_SERVER_URL=http://your-server-url npm run dev
```

### **Proxy Configuration**
The Vite development server is configured to proxy API requests to the backend:

```javascript
// vite.config.js
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:5001',
      changeOrigin: true,
      secure: false,
    }
  }
}
```

## 🎨 UI Components

### **Service Test Dashboard**
- **Tabbed Interface** - Organized by service category
- **Test Cards** - Individual test controls for each service
- **Summary Statistics** - Overall test results overview
- **Detailed Results** - Expandable API response details
- **Real-time Updates** - Live test execution feedback

### **Navigation**
- **Floating Button** - Quick access to test dashboard
- **Modern Design** - Clean, intuitive interface
- **Responsive Layout** - Works on all screen sizes

## 📊 Monitoring & Analytics

### **Performance Metrics**
- Response time tracking
- Success/failure rates
- Error logging
- Service availability monitoring

### **Health Monitoring**
- Server status checks
- Database connectivity
- Service health indicators
- Performance benchmarks

## 🔒 Security Features

### **Authentication**
- JWT token handling
- Automatic token refresh
- Session management
- Protected routes

### **API Security**
- Request validation
- Error handling
- Rate limiting support
- CORS configuration

## 🚀 Production Deployment

### **Environment Variables**
```bash
VITE_SERVER_URL=https://your-production-server.com
VITE_API_KEY=your-api-key
```

### **Build Process**
```bash
npm run build
npm run preview
```

## 📝 Usage Examples

### **Testing All Services**
```javascript
// Click "Run All Tests" button in the dashboard
// Or programmatically:
import { 
  healthAPI, 
  moderationAPI, 
  auditAPI, 
  backupAPI,
  calendarAPI,
  notificationAPI,
  paymentServiceAPI,
  searchAPI
} from '../services/api';

// Test each service
const results = await Promise.allSettled([
  healthAPI.getHealth(),
  moderationAPI.moderateContent('test'),
  auditAPI.getStats('24h'),
  backupAPI.getBackupHistory(),
  calendarAPI.getUserCalendar('user123', {}),
  notificationAPI.getUserNotifications('user123', {}),
  paymentServiceAPI.getPaymentMethods(),
  searchAPI.getSearchFilters()
]);
```

### **Custom Service Testing**
```javascript
// Add your own test cases
const customTest = async () => {
  try {
    const result = await moderationAPI.moderateContent('Your test content');
    console.log('Moderation result:', result);
  } catch (error) {
    console.error('Test failed:', error);
  }
};
```

## 🎯 Next Steps

1. **Run the Test Dashboard** - Access `/test-services` to verify all services
2. **Review API Responses** - Check that all endpoints return expected data
3. **Monitor Performance** - Use the dashboard to track response times
4. **Integrate in Your App** - Use the API services in your components
5. **Customize Tests** - Add your own test cases as needed

## 📞 Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify the backend server is running
3. Ensure API endpoints are accessible
4. Review the test results in the dashboard

## 🎉 Success!

Your frontend is now fully integrated with all backend services! The comprehensive API integration and testing dashboard provide everything you need to develop, test, and monitor your property rental platform.

**🚀 Ready for Development and Testing!**
