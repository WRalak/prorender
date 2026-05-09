'use client'

import { useState } from 'react'
import { 
  Cog6ToothIcon, 
  GlobeAltIcon,
  ServerIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  DocumentTextIcon,
  BellIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline'

export default function AdminPlatformPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [settings, setSettings] = useState({
    platform: {
      name: 'PropRent',
      version: '2.1.0',
      environment: 'production',
      maintenance: false,
      registrationOpen: true,
      maxUsers: 10000,
      currentUsers: 1247
    },
    system: {
      apiStatus: 'healthy',
      databaseStatus: 'healthy',
      cacheStatus: 'healthy',
      storageStatus: 'healthy',
      uptime: '99.9%',
      responseTime: '120ms',
      errorRate: '0.1%'
    },
    features: {
      messaging: true,
      notifications: true,
      payments: true,
      analytics: true,
      aiRecommendations: false,
      videoTours: false,
      virtualStaging: false
    },
    limits: {
      maxPropertyImages: 20,
      maxFileSize: 10,
      maxMessagesPerDay: 100,
      maxSearchResults: 50,
      sessionTimeout: 30,
      apiRateLimit: 1000
    }
  })

  const tabs = [
    { id: 'overview', name: 'Overview', icon: GlobeAltIcon },
    { id: 'system', name: 'System Health', icon: ServerIcon },
    { id: 'features', name: 'Features', icon: WrenchScrewdriverIcon },
    { id: 'limits', name: 'Limits & Quotas', icon: ChartBarIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon }
  ]

  const handleSettingChange = (category, field, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }))
  }

  const saveSettings = () => {
    console.log('Saving platform settings:', settings)
    alert('Platform settings saved successfully!')
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100'
      case 'warning':
        return 'text-yellow-600 bg-yellow-100'
      case 'error':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <GlobeAltIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Platform Name</p>
              <p className="text-xl font-bold text-gray-900">{settings.platform.name}</p>
              <p className="text-sm text-gray-500">v{settings.platform.version}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Users</p>
              <p className="text-xl font-bold text-gray-900">{settings.platform.currentUsers}</p>
              <p className="text-sm text-gray-500">of {settings.platform.maxUsers} max</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <ServerIcon className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Environment</p>
              <p className="text-xl font-bold text-gray-900">{settings.platform.environment}</p>
              <p className="text-sm text-gray-500 capitalize">{settings.platform.maintenance ? 'Maintenance' : 'Live'}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Uptime</p>
              <p className="text-xl font-bold text-gray-900">{settings.system.uptime}</p>
              <p className="text-sm text-gray-500">{settings.system.responseTime} avg</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center mb-4">
              <input
                type="checkbox"
                checked={settings.platform.maintenance}
                onChange={(e) => handleSettingChange('platform', 'maintenance', e.target.checked)}
                className="mr-3"
              />
              <span className="text-gray-700">Maintenance Mode</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.platform.registrationOpen}
                onChange={(e) => handleSettingChange('platform', 'registrationOpen', e.target.checked)}
                className="mr-3"
              />
              <span className="text-gray-700">Open Registration</span>
            </label>
          </div>
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Users</label>
              <input
                type="number"
                value={settings.platform.maxUsers}
                onChange={(e) => handleSettingChange('platform', 'maxUsers', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSystemHealth = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">API Status</span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(settings.system.apiStatus)}`}>
              {settings.system.apiStatus}
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900">Operational</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Database</span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(settings.system.databaseStatus)}`}>
              {settings.system.databaseStatus}
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900">Connected</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Cache</span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(settings.system.cacheStatus)}`}>
              {settings.system.cacheStatus}
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900">Active</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Storage</span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(settings.system.storageStatus)}`}>
              {settings.system.storageStatus}
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900">Available</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Uptime</label>
            <div className="text-2xl font-bold text-green-600">{settings.system.uptime}</div>
            <p className="text-sm text-gray-500">Last 30 days</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Response Time</label>
            <div className="text-2xl font-bold text-blue-600">{settings.system.responseTime}</div>
            <p className="text-sm text-gray-500">Average response</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Error Rate</label>
            <div className="text-2xl font-bold text-yellow-600">{settings.system.errorRate}</div>
            <p className="text-sm text-gray-500">Last 24 hours</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderFeatures = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Toggles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.features.messaging}
                onChange={(e) => handleSettingChange('features', 'messaging', e.target.checked)}
                className="mr-3"
              />
              <div>
                <span className="text-gray-700">Messaging System</span>
                <p className="text-sm text-gray-500">Enable user-to-user messaging</p>
              </div>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.features.notifications}
                onChange={(e) => handleSettingChange('features', 'notifications', e.target.checked)}
                className="mr-3"
              />
              <div>
                <span className="text-gray-700">Push Notifications</span>
                <p className="text-sm text-gray-500">Send push notifications to users</p>
              </div>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.features.payments}
                onChange={(e) => handleSettingChange('features', 'payments', e.target.checked)}
                className="mr-3"
              />
              <div>
                <span className="text-gray-700">Payment Processing</span>
                <p className="text-sm text-gray-500">Enable online payments</p>
              </div>
            </label>
          </div>
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.features.analytics}
                onChange={(e) => handleSettingChange('features', 'analytics', e.target.checked)}
                className="mr-3"
              />
              <div>
                <span className="text-gray-700">Analytics Dashboard</span>
                <p className="text-sm text-gray-500">Show analytics to users</p>
              </div>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.features.aiRecommendations}
                onChange={(e) => handleSettingChange('features', 'aiRecommendations', e.target.checked)}
                className="mr-3"
              />
              <div>
                <span className="text-gray-700">AI Recommendations</span>
                <p className="text-sm text-gray-500">AI-powered property suggestions</p>
              </div>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.features.videoTours}
                onChange={(e) => handleSettingChange('features', 'videoTours', e.target.checked)}
                className="mr-3"
              />
              <div>
                <span className="text-gray-700">Video Tours</span>
                <p className="text-sm text-gray-500">Allow video property tours</p>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )

  const renderLimits = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Limits & Quotas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Property Images</label>
            <input
              type="number"
              value={settings.limits.maxPropertyImages}
              onChange={(e) => handleSettingChange('limits', 'maxPropertyImages', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max File Size (MB)</label>
            <input
              type="number"
              value={settings.limits.maxFileSize}
              onChange={(e) => handleSettingChange('limits', 'maxFileSize', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Messages Per Day</label>
            <input
              type="number"
              value={settings.limits.maxMessagesPerDay}
              onChange={(e) => handleSettingChange('limits', 'maxMessagesPerDay', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Search Results</label>
            <input
              type="number"
              value={settings.limits.maxSearchResults}
              onChange={(e) => handleSettingChange('limits', 'maxSearchResults', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
            <input
              type="number"
              value={settings.limits.sessionTimeout}
              onChange={(e) => handleSettingChange('limits', 'sessionTimeout', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">API Rate Limit (per hour)</label>
            <input
              type="number"
              value={settings.limits.apiRateLimit}
              onChange={(e) => handleSettingChange('limits', 'apiRateLimit', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderSecurity = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Authentication</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-3" />
                  <span className="text-gray-700">Two-Factor Authentication</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-3" />
                  <span className="text-gray-700">Password Strength Requirements</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-3" />
                  <span className="text-gray-700">Account Lockout Protection</span>
                </label>
              </div>
            </div>
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Data Protection</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-3" />
                  <span className="text-gray-700">Data Encryption</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-3" />
                  <span className="text-gray-700">Regular Backups</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-3" />
                  <span className="text-gray-700">Audit Logging</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview()
      case 'system':
        return renderSystemHealth()
      case 'features':
        return renderFeatures()
      case 'limits':
        return renderLimits()
      case 'security':
        return renderSecurity()
      default:
        return renderOverview()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
          <p className="text-gray-600 mt-1">Configure platform-wide settings and features</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <tab.icon className="mr-3 h-5 w-5" />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {tabs.find(t => t.id === activeTab)?.name}
                </h2>
              </div>

              {renderTabContent()}

              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-end">
                  <button
                    onClick={saveSettings}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
