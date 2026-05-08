import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  CreditCardIcon,
  DocumentTextIcon,
  KeyIcon,
  ServerIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../services/api';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import toast from 'react-hot-toast';

const SystemSettings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: settings, isLoading, refetch } = useQuery(
    'system-settings',
    adminAPI.getSystemSettings,
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const updateSettingsMutation = useMutation(
    (settingsData) => adminAPI.updateSystemSettings(settingsData),
    {
      onSuccess: () => {
        toast.success('Settings updated successfully');
        queryClient.invalidateQueries('system-settings');
      },
      onError: () => {
        toast.error('Failed to update settings');
      },
    }
  );

  const regenerateApiKeyMutation = useMutation(
    adminAPI.regenerateApiKey,
    {
      onSuccess: () => {
        toast.success('API key regenerated successfully');
        queryClient.invalidateQueries('system-settings');
        setShowApiKeyModal(false);
      },
      onError: () => {
        toast.error('Failed to regenerate API key');
      },
    }
  );

  const testEmailMutation = useMutation(
    adminAPI.testEmailSettings,
    {
      onSuccess: () => {
        toast.success('Test email sent successfully');
      },
      onError: () => {
        toast.error('Failed to send test email');
      },
    }
  );

  const backupDatabaseMutation = useMutation(
    adminAPI.backupDatabase,
    {
      onSuccess: () => {
        toast.success('Database backup initiated successfully');
      },
      onError: () => {
        toast.error('Failed to initiate database backup');
      },
    }
  );

  const handleSettingsUpdate = (category, data) => {
    updateSettingsMutation.mutate({ category, ...data });
  };

  const handleRegenerateApiKey = () => {
    if (window.confirm('Are you sure you want to regenerate the API key? This will invalidate the current key.')) {
      regenerateApiKeyMutation.mutate();
    }
  };

  const handleTestEmail = () => {
    testEmailMutation.mutate({
      to: user.email,
      subject: 'Test Email from PropRent',
      message: 'This is a test email to verify email settings are working correctly.',
    });
  };

  const handleBackup = () => {
    if (window.confirm('Are you sure you want to initiate a database backup? This may take a few minutes.')) {
      backupDatabaseMutation.mutate();
    }
  };

  const tabs = [
    { id: 'general', name: 'General', icon: CogIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'integrations', name: 'Integrations', icon: GlobeAltIcon },
    { id: 'billing', name: 'Billing', icon: CreditCardIcon },
    { id: 'backup', name: 'Backup & Restore', icon: DocumentTextIcon },
  ];

  if (isLoading) {
    return <LoadingSpinner size="large" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
              <p className="text-sm text-gray-500">
                Configure system-wide settings and preferences
              </p>
            </div>
            <Button
              onClick={() => refetch()}
              variant="outline"
              className="flex items-center"
            >
              <CogIcon className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <div className="p-6">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                          activeTab === tab.id
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="h-5 w-5 mr-3" />
                        {tab.name}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </Card>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === 'general' && (
              <Card>
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">General Settings</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Site Name
                      </label>
                      <input
                        type="text"
                        defaultValue={settings?.general?.siteName || 'PropRent'}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Site Description
                      </label>
                      <textarea
                        rows={3}
                        defaultValue={settings?.general?.siteDescription || ''}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        defaultValue={settings?.general?.contactEmail || ''}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Support Phone
                      </label>
                      <input
                        type="tel"
                        defaultValue={settings?.general?.supportPhone || ''}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        onClick={() => handleSettingsUpdate('general', {
                          siteName: 'PropRent',
                          siteDescription: 'Real estate rental platform',
                          contactEmail: 'support@proprent.com',
                          supportPhone: '+1-555-0123',
                        })}
                        loading={updateSettingsMutation.isLoading}
                      >
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'notifications' && (
              <Card>
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">Notification Settings</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-md font-medium text-gray-900 mb-4">Email Notifications</h3>
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            defaultChecked={settings?.notifications?.email?.newUser || true}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            New user registration
                          </span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            defaultChecked={settings?.notifications?.email?.newApplication || true}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            New rental application
                          </span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            defaultChecked={settings?.notifications?.email?.paymentReceived || true}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            Payment received
                          </span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            defaultChecked={settings?.notifications?.email?.maintenanceRequest || true}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            Maintenance request
                          </span>
                        </label>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        onClick={handleTestEmail}
                        loading={testEmailMutation.isLoading}
                      >
                        Test Email
                      </Button>
                      <Button
                        onClick={() => handleSettingsUpdate('notifications', {
                          email: {
                            newUser: true,
                            newApplication: true,
                            paymentReceived: true,
                            maintenanceRequest: true,
                          },
                        })}
                        loading={updateSettingsMutation.isLoading}
                      >
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'security' && (
              <Card>
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">Security Settings</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-md font-medium text-gray-900 mb-4">API Key</h3>
                      <div className="bg-gray-50 p-4 rounded-md">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <KeyIcon className="h-5 w-5 text-gray-400 mr-2" />
                            <code className="text-sm text-gray-900">
                              {settings?.security?.apiKey ? '••••••••••••••••••••' : 'No API key generated'}
                            </code>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="small"
                              onClick={() => setShowApiKeyModal(!showApiKeyModal)}
                            >
                              {showApiKeyModal ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="outline"
                              size="small"
                              onClick={handleRegenerateApiKey}
                              loading={regenerateApiKeyMutation.isLoading}
                            >
                              Regenerate
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-md font-medium text-gray-900 mb-4">Session Settings</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Session Timeout (minutes)
                          </label>
                          <input
                            type="number"
                            defaultValue={settings?.security?.sessionTimeout || 30}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            defaultChecked={settings?.security?.requireTwoFactor || false}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            Require two-factor authentication for admins
                          </span>
                        </label>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        onClick={() => handleSettingsUpdate('security', {
                          sessionTimeout: 30,
                          requireTwoFactor: false,
                        })}
                        loading={updateSettingsMutation.isLoading}
                      >
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'integrations' && (
              <Card>
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">Third-Party Integrations</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-md font-medium text-gray-900 mb-4">Payment Gateway</h3>
                      <div className="bg-gray-50 p-4 rounded-md">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Stripe</p>
                            <p className="text-sm text-gray-500">Payment processing</p>
                          </div>
                          <StatusBadge
                            status={settings?.integrations?.stripe?.connected ? 'connected' : 'disconnected'}
                            color={settings?.integrations?.stripe?.connected ? 'green' : 'gray'}
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-md font-medium text-gray-900 mb-4">Email Service</h3>
                      <div className="bg-gray-50 p-4 rounded-md">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">SendGrid</p>
                            <p className="text-sm text-gray-500">Email delivery</p>
                          </div>
                          <StatusBadge
                            status={settings?.integrations?.sendgrid?.connected ? 'connected' : 'disconnected'}
                            color={settings?.integrations?.sendgrid?.connected ? 'green' : 'gray'}
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-md font-medium text-gray-900 mb-4">Storage</h3>
                      <div className="bg-gray-50 p-4 rounded-md">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">AWS S3</p>
                            <p className="text-sm text-gray-500">File storage</p>
                          </div>
                          <StatusBadge
                            status={settings?.integrations?.s3?.connected ? 'connected' : 'disconnected'}
                            color={settings?.integrations?.s3?.connected ? 'green' : 'gray'}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'billing' && (
              <Card>
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">Billing Settings</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-md font-medium text-gray-900 mb-4">Subscription Plans</h3>
                      <div className="space-y-4">
                        <div className="border border-gray-200 rounded-md p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">Free Plan</p>
                              <p className="text-sm text-gray-500">$0/month</p>
                            </div>
                            <StatusBadge status="active" color="green" />
                          </div>
                        </div>
                        <div className="border border-gray-200 rounded-md p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">Professional Plan</p>
                              <p className="text-sm text-gray-500">$99/month</p>
                            </div>
                            <StatusBadge status="inactive" color="gray" />
                          </div>
                        </div>
                        <div className="border border-gray-200 rounded-md p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">Enterprise Plan</p>
                              <p className="text-sm text-gray-500">$299/month</p>
                            </div>
                            <StatusBadge status="inactive" color="gray" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-md font-medium text-gray-900 mb-4">Billing Information</h3>
                      <div className="bg-gray-50 p-4 rounded-md">
                        <div className="space-y-2">
                          <p className="text-sm text-gray-900">
                            <strong>Current Plan:</strong> Free
                          </p>
                          <p className="text-sm text-gray-900">
                            <strong>Billing Cycle:</strong> Monthly
                          </p>
                          <p className="text-sm text-gray-900">
                            <strong>Next Billing:</strong> {new Date().toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'backup' && (
              <Card>
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">Backup & Restore</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-md font-medium text-gray-900 mb-4">Automatic Backups</h3>
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            defaultChecked={settings?.backup?.automatic || true}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            Enable automatic backups
                          </span>
                        </label>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Backup Frequency
                          </label>
                          <select
                            defaultValue={settings?.backup?.frequency || 'daily'}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-md font-medium text-gray-900 mb-4">Manual Backup</h3>
                      <div className="bg-gray-50 p-4 rounded-md">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-900">
                              <strong>Last Backup:</strong> {settings?.backup?.lastBackup ? new Date(settings.backup.lastBackup).toLocaleDateString() : 'Never'}
                            </p>
                            <p className="text-sm text-gray-500">
                              Backups are stored securely in cloud storage
                            </p>
                          </div>
                          <Button
                            onClick={handleBackup}
                            loading={backupDatabaseMutation.isLoading}
                          >
                            <ServerIcon className="h-4 w-4 mr-2" />
                            Backup Now
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        onClick={() => handleSettingsUpdate('backup', {
                          automatic: true,
                          frequency: 'daily',
                        })}
                        loading={updateSettingsMutation.isLoading}
                      >
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
