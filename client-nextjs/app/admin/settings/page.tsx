'use client'

import { useState } from 'react'
import { 
  Cog6ToothIcon, 
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  CreditCardIcon,
  DocumentTextIcon,
  UserGroupIcon,
  EnvelopeIcon,
  KeyIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline'

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState({
    general: {
      siteName: 'PropRent',
      siteDescription: 'Your trusted platform for finding the perfect rental home',
      contactEmail: 'support@proprent.com',
      supportPhone: '+1 555-0123',
      timezone: 'America/New_York',
      language: 'en'
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      newUserAlerts: true,
      propertyApprovalAlerts: true,
      systemAlerts: true
    },
    security: {
      twoFactorAuth: true,
      passwordMinLength: 8,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      ipWhitelist: '',
      enableCaptcha: true
    },
    payments: {
      stripeEnabled: true,
      paypalEnabled: false,
      commissionRate: 5,
      minimumPayout: 100,
      autoPayout: false,
      currency: 'USD'
    },
    content: {
      autoApproveProperties: false,
      autoApproveReviews: false,
      profanityFilter: true,
      imageModeration: true,
      maxPropertyImages: 20,
      maxImageSize: 10
    }
  })

  const tabs = [
    { id: 'general', name: 'General', icon: Cog6ToothIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'payments', name: 'Payments', icon: CreditCardIcon },
    { id: 'content', name: 'Content', icon: DocumentTextIcon }
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
    console.log('Saving settings:', settings)
    alert('Settings saved successfully!')
  }

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
          <input
            type="text"
            value={settings.general.siteName}
            onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
          <input
            type="email"
            value={settings.general.contactEmail}
            onChange={(e) => handleSettingChange('general', 'contactEmail', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
        <textarea
          value={settings.general.siteDescription}
          onChange={(e) => handleSettingChange('general', 'siteDescription', e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Support Phone</label>
          <input
            type="tel"
            value={settings.general.supportPhone}
            onChange={(e) => handleSettingChange('general', 'supportPhone', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
          <select
            value={settings.general.timezone}
            onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
          </select>
        </div>
      </div>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Notification Channels</h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.notifications.emailNotifications}
              onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
              className="mr-3"
            />
            <span className="text-gray-700">Email Notifications</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.notifications.pushNotifications}
              onChange={(e) => handleSettingChange('notifications', 'pushNotifications', e.target.checked)}
              className="mr-3"
            />
            <span className="text-gray-700">Push Notifications</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.notifications.smsNotifications}
              onChange={(e) => handleSettingChange('notifications', 'smsNotifications', e.target.checked)}
              className="mr-3"
            />
            <span className="text-gray-700">SMS Notifications</span>
          </label>
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Alert Types</h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.notifications.newUserAlerts}
              onChange={(e) => handleSettingChange('notifications', 'newUserAlerts', e.target.checked)}
              className="mr-3"
            />
            <span className="text-gray-700">New User Registration Alerts</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.notifications.propertyApprovalAlerts}
              onChange={(e) => handleSettingChange('notifications', 'propertyApprovalAlerts', e.target.checked)}
              className="mr-3"
            />
            <span className="text-gray-700">Property Approval Required</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.notifications.systemAlerts}
              onChange={(e) => handleSettingChange('notifications', 'systemAlerts', e.target.checked)}
              className="mr-3"
            />
            <span className="text-gray-700">System Maintenance Alerts</span>
          </label>
        </div>
      </div>
    </div>
  )

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.security.twoFactorAuth}
              onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
              className="mr-3"
            />
            <span className="text-gray-700">Two-Factor Authentication</span>
          </label>
        </div>
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.security.enableCaptcha}
              onChange={(e) => handleSettingChange('security', 'enableCaptcha', e.target.checked)}
              className="mr-3"
            />
            <span className="text-gray-700">Enable CAPTCHA</span>
          </label>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Password Min Length</label>
          <input
            type="number"
            value={settings.security.passwordMinLength}
            onChange={(e) => handleSettingChange('security', 'passwordMinLength', parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
          <input
            type="number"
            value={settings.security.sessionTimeout}
            onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
          <input
            type="number"
            value={settings.security.maxLoginAttempts}
            onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">IP Whitelist (comma-separated)</label>
        <input
          type="text"
          value={settings.security.ipWhitelist}
          onChange={(e) => handleSettingChange('security', 'ipWhitelist', e.target.value)}
          placeholder="192.168.1.1, 10.0.0.1"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  )

  const renderPaymentSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Payment Gateways</h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.payments.stripeEnabled}
              onChange={(e) => handleSettingChange('payments', 'stripeEnabled', e.target.checked)}
              className="mr-3"
            />
            <span className="text-gray-700">Enable Stripe</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.payments.paypalEnabled}
              onChange={(e) => handleSettingChange('payments', 'paypalEnabled', e.target.checked)}
              className="mr-3"
            />
            <span className="text-gray-700">Enable PayPal</span>
          </label>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Commission Rate (%)</label>
          <input
            type="number"
            value={settings.payments.commissionRate}
            onChange={(e) => handleSettingChange('payments', 'commissionRate', parseFloat(e.target.value))}
            step="0.1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Payout ($)</label>
          <input
            type="number"
            value={settings.payments.minimumPayout}
            onChange={(e) => handleSettingChange('payments', 'minimumPayout', parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.payments.autoPayout}
              onChange={(e) => handleSettingChange('payments', 'autoPayout', e.target.checked)}
              className="mr-3"
            />
            <span className="text-gray-700">Automatic Payouts</span>
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
          <select
            value={settings.payments.currency}
            onChange={(e) => handleSettingChange('payments', 'currency', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="CAD">CAD - Canadian Dollar</option>
          </select>
        </div>
      </div>
    </div>
  )

  const renderContentSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Content Moderation</h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.content.autoApproveProperties}
              onChange={(e) => handleSettingChange('content', 'autoApproveProperties', e.target.checked)}
              className="mr-3"
            />
            <span className="text-gray-700">Auto-approve Properties</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.content.autoApproveReviews}
              onChange={(e) => handleSettingChange('content', 'autoApproveReviews', e.target.checked)}
              className="mr-3"
            />
            <span className="text-gray-700">Auto-approve Reviews</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.content.profanityFilter}
              onChange={(e) => handleSettingChange('content', 'profanityFilter', e.target.checked)}
              className="mr-3"
            />
            <span className="text-gray-700">Enable Profanity Filter</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.content.imageModeration}
              onChange={(e) => handleSettingChange('content', 'imageModeration', e.target.checked)}
              className="mr-3"
            />
            <span className="text-gray-700">Enable Image Moderation</span>
          </label>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Max Property Images</label>
          <input
            type="number"
            value={settings.content.maxPropertyImages}
            onChange={(e) => handleSettingChange('content', 'maxPropertyImages', parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Max Image Size (MB)</label>
          <input
            type="number"
            value={settings.content.maxImageSize}
            onChange={(e) => handleSettingChange('content', 'maxImageSize', parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings()
      case 'notifications':
        return renderNotificationSettings()
      case 'security':
        return renderSecuritySettings()
      case 'payments':
        return renderPaymentSettings()
      case 'content':
        return renderContentSettings()
      default:
        return renderGeneralSettings()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
          <p className="text-gray-600 mt-1">Configure platform settings and preferences</p>
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
                  {tabs.find(t => t.id === activeTab)?.name} Settings
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
