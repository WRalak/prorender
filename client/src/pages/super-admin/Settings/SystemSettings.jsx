import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Cog6ToothIcon, ServerIcon, ShieldCheckIcon, GlobeAltIcon, BellIcon } from '@heroicons/react/24/outline';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      siteName: 'PropRent',
      siteUrl: 'https://prorender.com',
      supportEmail: 'support@prorender.com',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      currency: 'USD',
    },
    security: {
      passwordMinLength: 8,
      sessionTimeout: 24,
      maxLoginAttempts: 5,
      lockoutDuration: 30,
      requireEmailVerification: true,
      enableTwoFactorAuth: false,
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      welcomeEmail: true,
      paymentReminders: true,
      maintenanceAlerts: true,
    },
    features: {
      enableMaintenanceRequests: true,
      enableOnlinePayments: true,
      enableDocumentUpload: true,
      enableRealTimeChat: true,
      enablePropertyFavorites: true,
      enableSavedSearches: true,
    },
    limits: {
      maxPropertyImages: 10,
      maxDocumentSize: 10, // MB
      maxChatMessageLength: 1000,
      maxPropertiesPerAgent: 100,
      maxApplicationsPerTenant: 5,
    },
  });

  const queryClient = useQueryClient();

  const { data: currentSettings, isLoading } = useQuery('system-settings', async () => {
    const response = await fetch('/api/super-admin/settings');
    return response.json();
  });

  const updateSettingsMutation = useMutation(
    async (category, newSettings) => {
      const response = await fetch(`/api/super-admin/settings/${category}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings),
      });
      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('system-settings');
        toast.success('Settings updated successfully');
      },
      onError: (error) => {
        toast.error('Failed to update settings');
      },
    }
  );

  const handleSaveSettings = (category) => {
    updateSettingsMutation.mutate(category, settings[category]);
  };

  const handleSettingChange = (category, field, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
  };

  if (isLoading) {
    return <LoadingSpinner size="large" />;
  }

  const tabs = [
    { id: 'general', label: 'General', icon: GlobeAltIcon },
    { id: 'security', label: 'Security', icon: ShieldCheckIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'features', label: 'Features', icon: Cog6ToothIcon },
    { id: 'limits', label: 'Limits', icon: ServerIcon },
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Site Name
          </label>
          <input
            type="text"
            value={settings.general.siteName}
            onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Site URL
          </label>
          <input
            type="url"
            value={settings.general.siteUrl}
            onChange={(e) => handleSettingChange('general', 'siteUrl', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Support Email
          </label>
          <input
            type="email"
            value={settings.general.supportEmail}
            onChange={(e) => handleSettingChange('general', 'supportEmail', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Timezone
          </label>
          <select
            value={settings.general.timezone}
            onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="UTC">UTC</option>
            <option value="EST">EST</option>
            <option value="PST">PST</option>
            <option value="GMT">GMT</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date Format
          </label>
          <select
            value={settings.general.dateFormat}
            onChange={(e) => handleSettingChange('general', 'dateFormat', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Currency
          </label>
          <select
            value={settings.general.currency}
            onChange={(e) => handleSettingChange('general', 'currency', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="CAD">CAD</option>
          </select>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button
          onClick={() => handleSaveSettings('general')}
          loading={updateSettingsMutation.isLoading}
        >
          Save General Settings
        </Button>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Minimum Password Length
          </label>
          <input
            type="number"
            min="6"
            max="20"
            value={settings.security.passwordMinLength}
            onChange={(e) => handleSettingChange('security', 'passwordMinLength', parseInt(e.target.value))}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Session Timeout (hours)
          </label>
          <input
            type="number"
            min="1"
            max="168"
            value={settings.security.sessionTimeout}
            onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Login Attempts
          </label>
          <input
            type="number"
            min="3"
            max="10"
            value={settings.security.maxLoginAttempts}
            onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lockout Duration (minutes)
          </label>
          <input
            type="number"
            min="5"
            max="1440"
            value={settings.security.lockoutDuration}
            onChange={(e) => handleSettingChange('security', 'lockoutDuration', parseInt(e.target.value))}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="require-email-verification"
            checked={settings.security.requireEmailVerification}
            onChange={(e) => handleSettingChange('security', 'requireEmailVerification', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="require-email-verification" className="ml-2 block text-sm text-gray-900">
            Require Email Verification
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="enable-two-factor"
            checked={settings.security.enableTwoFactorAuth}
            onChange={(e) => handleSettingChange('security', 'enableTwoFactorAuth', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="enable-two-factor" className="ml-2 block text-sm text-gray-900">
            Enable Two-Factor Authentication
          </label>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button
          onClick={() => handleSaveSettings('security')}
          loading={updateSettingsMutation.isLoading}
        >
          Save Security Settings
        </Button>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="email-notifications"
            checked={settings.notifications.emailNotifications}
            onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="email-notifications" className="ml-2 block text-sm text-gray-900">
            Email Notifications
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="push-notifications"
            checked={settings.notifications.pushNotifications}
            onChange={(e) => handleSettingChange('notifications', 'pushNotifications', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="push-notifications" className="ml-2 block text-sm text-gray-900">
            Push Notifications
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="sms-notifications"
            checked={settings.notifications.smsNotifications}
            onChange={(e) => handleSettingChange('notifications', 'smsNotifications', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="sms-notifications" className="ml-2 block text-sm text-gray-900">
            SMS Notifications
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="welcome-email"
            checked={settings.notifications.welcomeEmail}
            onChange={(e) => handleSettingChange('notifications', 'welcomeEmail', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="welcome-email" className="ml-2 block text-sm text-gray-900">
            Welcome Email
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="payment-reminders"
            checked={settings.notifications.paymentReminders}
            onChange={(e) => handleSettingChange('notifications', 'paymentReminders', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="payment-reminders" className="ml-2 block text-sm text-gray-900">
            Payment Reminders
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="maintenance-alerts"
            checked={settings.notifications.maintenanceAlerts}
            onChange={(e) => handleSettingChange('notifications', 'maintenanceAlerts', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="maintenance-alerts" className="ml-2 block text-sm text-gray-900">
            Maintenance Alerts
          </label>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button
          onClick={() => handleSaveSettings('notifications')}
          loading={updateSettingsMutation.isLoading}
        >
          Save Notification Settings
        </Button>
      </div>
    </div>
  );

  const renderFeatureSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="maintenance-requests"
            checked={settings.features.enableMaintenanceRequests}
            onChange={(e) => handleSettingChange('features', 'enableMaintenanceRequests', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="maintenance-requests" className="ml-2 block text-sm text-gray-900">
            Maintenance Requests
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="online-payments"
            checked={settings.features.enableOnlinePayments}
            onChange={(e) => handleSettingChange('features', 'enableOnlinePayments', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="online-payments" className="ml-2 block text-sm text-gray-900">
            Online Payments
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="document-upload"
            checked={settings.features.enableDocumentUpload}
            onChange={(e) => handleSettingChange('features', 'enableDocumentUpload', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="document-upload" className="ml-2 block text-sm text-gray-900">
            Document Upload
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="realtime-chat"
            checked={settings.features.enableRealTimeChat}
            onChange={(e) => handleSettingChange('features', 'enableRealTimeChat', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="realtime-chat" className="ml-2 block text-sm text-gray-900">
            Real-time Chat
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="property-favorites"
            checked={settings.features.enablePropertyFavorites}
            onChange={(e) => handleSettingChange('features', 'enablePropertyFavorites', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="property-favorites" className="ml-2 block text-sm text-gray-900">
            Property Favorites
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="saved-searches"
            checked={settings.features.enableSavedSearches}
            onChange={(e) => handleSettingChange('features', 'enableSavedSearches', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="saved-searches" className="ml-2 block text-sm text-gray-900">
            Saved Searches
          </label>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button
          onClick={() => handleSaveSettings('features')}
          loading={updateSettingsMutation.isLoading}
        >
          Save Feature Settings
        </Button>
      </div>
    </div>
  );

  const renderLimitSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Property Images
          </label>
          <input
            type="number"
            min="1"
            max="50"
            value={settings.limits.maxPropertyImages}
            onChange={(e) => handleSettingChange('limits', 'maxPropertyImages', parseInt(e.target.value))}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Document Size (MB)
          </label>
          <input
            type="number"
            min="1"
            max="50"
            value={settings.limits.maxDocumentSize}
            onChange={(e) => handleSettingChange('limits', 'maxDocumentSize', parseInt(e.target.value))}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Chat Message Length
          </label>
          <input
            type="number"
            min="100"
            max="5000"
            value={settings.limits.maxChatMessageLength}
            onChange={(e) => handleSettingChange('limits', 'maxChatMessageLength', parseInt(e.target.value))}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Properties Per Agent
          </label>
          <input
            type="number"
            min="1"
            max="1000"
            value={settings.limits.maxPropertiesPerAgent}
            onChange={(e) => handleSettingChange('limits', 'maxPropertiesPerAgent', parseInt(e.target.value))}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Applications Per Tenant
          </label>
          <input
            type="number"
            min="1"
            max="50"
            value={settings.limits.maxApplicationsPerTenant}
            onChange={(e) => handleSettingChange('limits', 'maxApplicationsPerTenant', parseInt(e.target.value))}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button
          onClick={() => handleSaveSettings('limits')}
          loading={updateSettingsMutation.isLoading}
        >
          Save Limit Settings
        </Button>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'security':
        return renderSecuritySettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'features':
        return renderFeatureSettings();
      case 'limits':
        return renderLimitSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="mt-2 text-gray-600">
          Configure system-wide settings and preferences
        </p>
      </div>

      <Card>
        <Card.Header>
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <tab.icon className="h-5 w-5 mr-2" />
                    {tab.label}
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </Card.Header>
        <Card.Body>
          {renderTabContent()}
        </Card.Body>
      </Card>
    </div>
  );
};

export default SystemSettings;
