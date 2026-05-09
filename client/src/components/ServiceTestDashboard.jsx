import React, { useState, useEffect } from 'react';
import { 
  moderationAPI, 
  auditAPI, 
  backupAPI, 
  calendarAPI, 
  notificationAPI, 
  paymentServiceAPI,
  healthAPI,
  searchAPI 
} from '../services/api';

const ServiceTestDashboard = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('health');

  const runTest = async (serviceName, testName, apiCall) => {
    setLoading(true);
    const startTime = Date.now();
    
    try {
      const result = await apiCall();
      const endTime = Date.now();
      
      setTestResults(prev => ({
        ...prev,
        [`${serviceName}-${testName}`]: {
          success: true,
          data: result,
          responseTime: endTime - startTime,
          timestamp: new Date().toISOString()
        }
      }));
    } catch (error) {
      const endTime = Date.now();
      
      setTestResults(prev => ({
        ...prev,
        [`${serviceName}-${testName}`]: {
          success: false,
          error: error.message,
          responseTime: endTime - startTime,
          timestamp: new Date().toISOString()
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    // Health Tests
    await runTest('health', 'server-health', () => healthAPI.getHealth());
    await runTest('health', 'server-info', () => healthAPI.getServerInfo());

    // Moderation Tests
    await runTest('moderation', 'moderate-content', () => 
      moderationAPI.moderateContent('This is a test message for moderation')
    );
    await runTest('moderation', 'moderation-stats', () => 
      moderationAPI.getModerationStats('24h')
    );

    // Audit Tests
    await runTest('audit', 'get-logs', () => 
      auditAPI.getLogs({ page: 1, limit: 10 })
    );
    await runTest('audit', 'audit-stats', () => 
      auditAPI.getStats('24h')
    );

    // Backup Tests
    await runTest('backup', 'backup-history', () => 
      backupAPI.getBackupHistory()
    );
    await runTest('backup', 'backup-stats', () => 
      backupAPI.getBackupStats()
    );

    // Calendar Tests
    await runTest('calendar', 'user-calendar', () => 
      calendarAPI.getUserCalendar('test-user', { page: 1, limit: 10 })
    );
    await runTest('calendar', 'calendar-stats', () => 
      calendarAPI.getCalendarStats('test-user', '30d')
    );

    // Notification Tests
    await runTest('notification', 'user-notifications', () => 
      notificationAPI.getUserNotifications('test-user', { page: 1, limit: 10 })
    );
    await runTest('notification', 'notification-stats', () => 
      notificationAPI.getNotificationStats('test-user', '30d')
    );

    // Payment Tests
    await runTest('payment', 'payment-methods', () => 
      paymentServiceAPI.getPaymentMethods()
    );
    await runTest('payment', 'payment-stats', () => 
      paymentServiceAPI.getPaymentStats('30d')
    );

    // Search Tests
    await runTest('search', 'search-filters', () => 
      searchAPI.getSearchFilters()
    );
    await runTest('search', 'search-suggestions', () => 
      searchAPI.getSearchSuggestions('apartment')
    );
  };

  const TestCard = ({ serviceName, tests }) => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <h3 className="text-lg font-semibold mb-4 capitalize">{serviceName} Service</h3>
      <div className="space-y-3">
        {tests.map(test => {
          const resultKey = `${serviceName}-${test.name}`;
          const result = testResults[resultKey];
          
          return (
            <div key={test.name} className="flex items-center justify-between">
              <div className="flex-1">
                <span className="text-sm font-medium">{test.description}</span>
                {result && (
                  <div className="text-xs mt-1">
                    {result.success ? (
                      <span className="text-green-600">
                        ✓ {result.responseTime}ms
                      </span>
                    ) : (
                      <span className="text-red-600">
                        ✗ {result.error}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={() => runTest(serviceName, test.name, test.apiCall)}
                disabled={loading}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                Test
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  const tabs = [
    { id: 'health', name: 'Health Check' },
    { id: 'moderation', name: 'AI Moderation' },
    { id: 'audit', name: 'Audit Service' },
    { id: 'backup', name: 'Backup Service' },
    { id: 'calendar', name: 'Calendar Service' },
    { id: 'notification', name: 'Notifications' },
    { id: 'payment', name: 'Payment Service' },
    { id: 'search', name: 'Search Service' }
  ];

  const serviceTests = {
    health: [
      { name: 'server-health', description: 'Server Health Check', apiCall: () => healthAPI.getHealth() },
      { name: 'server-info', description: 'Server Information', apiCall: () => healthAPI.getServerInfo() }
    ],
    moderation: [
      { name: 'moderate-content', description: 'Content Moderation', apiCall: () => moderationAPI.moderateContent('Test content') },
      { name: 'moderation-stats', description: 'Moderation Statistics', apiCall: () => moderationAPI.getModerationStats('24h') }
    ],
    audit: [
      { name: 'get-logs', description: 'Get Audit Logs', apiCall: () => auditAPI.getLogs({ page: 1, limit: 10 }) },
      { name: 'audit-stats', description: 'Audit Statistics', apiCall: () => auditAPI.getStats('24h') }
    ],
    backup: [
      { name: 'backup-history', description: 'Backup History', apiCall: () => backupAPI.getBackupHistory() },
      { name: 'backup-stats', description: 'Backup Statistics', apiCall: () => backupAPI.getBackupStats() }
    ],
    calendar: [
      { name: 'user-calendar', description: 'User Calendar', apiCall: () => calendarAPI.getUserCalendar('test-user', { page: 1, limit: 10 }) },
      { name: 'calendar-stats', description: 'Calendar Statistics', apiCall: () => calendarAPI.getCalendarStats('test-user', '30d') }
    ],
    notification: [
      { name: 'user-notifications', description: 'User Notifications', apiCall: () => notificationAPI.getUserNotifications('test-user', { page: 1, limit: 10 }) },
      { name: 'notification-stats', description: 'Notification Statistics', apiCall: () => notificationAPI.getNotificationStats('test-user', '30d') }
    ],
    payment: [
      { name: 'payment-methods', description: 'Payment Methods', apiCall: () => paymentServiceAPI.getPaymentMethods() },
      { name: 'payment-stats', description: 'Payment Statistics', apiCall: () => paymentServiceAPI.getPaymentStats('30d') }
    ],
    search: [
      { name: 'search-filters', description: 'Search Filters', apiCall: () => searchAPI.getSearchFilters() },
      { name: 'search-suggestions', description: 'Search Suggestions', apiCall: () => searchAPI.getSearchSuggestions('apartment') }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Service Test Dashboard</h1>
          <p className="text-gray-600 mb-6">Test all backend services and API endpoints</p>
          
          <div className="flex space-x-4 mb-6">
            <button
              onClick={runAllTests}
              disabled={loading}
              className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Running Tests...' : 'Run All Tests'}
            </button>
            <button
              onClick={() => setTestResults({})}
              className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Clear Results
            </button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded">
              <div className="text-2xl font-bold text-blue-600">
                {Object.keys(testResults).length}
              </div>
              <div className="text-sm text-gray-600">Total Tests</div>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <div className="text-2xl font-bold text-green-600">
                {Object.values(testResults).filter(r => r.success).length}
              </div>
              <div className="text-sm text-gray-600">Passed</div>
            </div>
            <div className="bg-red-50 p-4 rounded">
              <div className="text-2xl font-bold text-red-600">
                {Object.values(testResults).filter(r => !r.success).length}
              </div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded">
              <div className="text-2xl font-bold text-yellow-600">
                {Object.values(testResults).length > 0 
                  ? Math.round(Object.values(testResults).reduce((acc, r) => acc + r.responseTime, 0) / Object.values(testResults).length)
                  : 0}ms
              </div>
              <div className="text-sm text-gray-600">Avg Response</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <TestCard 
              serviceName={activeTab} 
              tests={serviceTests[activeTab]} 
            />
          </div>
        </div>

        {/* Detailed Results */}
        {Object.keys(testResults).length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
            <h2 className="text-xl font-bold mb-4">Detailed Results</h2>
            <div className="space-y-4">
              {Object.entries(testResults).map(([key, result]) => (
                <div key={key} className="border-l-4 border-blue-500 pl-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{key}</span>
                    <span className={`text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                      {result.success ? 'Success' : 'Failed'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Response Time: {result.responseTime}ms | 
                    Timestamp: {new Date(result.timestamp).toLocaleString()}
                  </div>
                  {!result.success && (
                    <div className="text-sm text-red-600 mt-1">
                      Error: {result.error}
                    </div>
                  )}
                  {result.success && result.data && (
                    <details className="mt-2">
                      <summary className="text-sm text-blue-600 cursor-pointer">View Response</summary>
                      <pre className="text-xs bg-gray-100 p-2 mt-2 rounded overflow-x-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceTestDashboard;
