import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import {
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  GlobeAltIcon,
  MoonIcon,
  SunIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const { data: profile, isLoading } = useQuery('profile', userAPI.getProfile);

  const updateProfileMutation = useMutation(userAPI.updateProfile, {
    onSuccess: () => {
      toast.success('Profile updated successfully');
      queryClient.invalidateQueries('profile');
    },
    onError: (error) => {
      toast.error('Failed to update profile');
    },
  });

  const updatePasswordMutation = useMutation(userAPI.changePassword, {
    onSuccess: () => {
      toast.success('Password changed successfully');
      setShowPasswordForm(false);
    },
    onError: (error) => {
      toast.error('Failed to change password');
    },
  });

  const updatePreferencesMutation = useMutation(userAPI.updatePreferences, {
    onSuccess: () => {
      toast.success('Preferences updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update preferences');
    },
  });

  const deleteAccountMutation = useMutation(userAPI.deleteAccount, {
    onSuccess: () => {
      toast.success('Account deleted successfully');
      localStorage.clear();
      window.location.href = '/';
    },
    onError: (error) => {
      toast.error('Failed to delete account');
    },
  });

  const handleProfileUpdate = (formData) => {
    updateProfileMutation.mutate(formData);
  };

  const handlePasswordChange = (formData) => {
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    updatePasswordMutation.mutate({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
    });
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      deleteAccountMutation.mutate();
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'billing', name: 'Billing', icon: CreditCardIcon },
    { id: 'preferences', name: 'Preferences', icon: GlobeAltIcon },
  ];

  if (isLoading) {
    return <LoadingSpinner size="large" />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">
          Manage your account settings and preferences
        </p>
      </div>

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
          {activeTab === 'profile' && (
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Profile Information</h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    handleProfileUpdate({
                      firstName: formData.get('firstName'),
                      lastName: formData.get('lastName'),
                      phone: formData.get('phone'),
                      bio: formData.get('bio'),
                    });
                  }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        defaultValue={profile?.user?.name?.first}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        defaultValue={profile?.user?.name?.last}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        defaultValue={profile?.user?.email}
                        disabled
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        defaultValue={profile?.user?.profile?.phone}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      rows={4}
                      defaultValue={profile?.user?.profile?.bio}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      loading={updateProfileMutation.isLoading}
                    >
                      Save Changes
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Notification Preferences</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-4">Email Notifications</h3>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={emailNotifications}
                          onChange={(e) => setEmailNotifications(e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Receive email notifications about your account activity
                        </span>
                      </label>
                      <div className="ml-6 space-y-2 text-sm text-gray-500">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2">Application updates</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2">Payment reminders</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2">Maintenance updates</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-4">Push Notifications</h3>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={pushNotifications}
                        onChange={(e) => setPushNotifications(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Receive push notifications in your browser
                      </span>
                    </label>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => updatePreferencesMutation.mutate({
                        emailNotifications,
                        pushNotifications,
                      })}
                      loading={updatePreferencesMutation.isLoading}
                    >
                      Save Preferences
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
                
                {/* Change Password */}
                <div className="mb-8">
                  <h3 className="text-md font-medium text-gray-900 mb-4">Change Password</h3>
                  {!showPasswordForm ? (
                    <Button
                      onClick={() => setShowPasswordForm(true)}
                      variant="outline"
                    >
                      Change Password
                    </Button>
                  ) : (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target);
                        handlePasswordChange({
                          currentPassword: formData.get('currentPassword'),
                          newPassword: formData.get('newPassword'),
                          confirmPassword: formData.get('confirmPassword'),
                        });
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Current Password
                        </label>
                        <input
                          type="password"
                          name="currentPassword"
                          required
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          New Password
                        </label>
                        <input
                          type="password"
                          name="newPassword"
                          required
                          minLength={8}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          required
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      <div className="flex space-x-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowPasswordForm(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          loading={updatePasswordMutation.isLoading}
                        >
                          Change Password
                        </Button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Two-Factor Authentication */}
                <div className="mb-8">
                  <h3 className="text-md font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Add an extra layer of security to your account
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Not enabled
                        </p>
                      </div>
                      <Button variant="outline" size="small">
                        Enable 2FA
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Active Sessions */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Active Sessions</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <GlobeAltIcon className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Current Session</p>
                          <p className="text-xs text-gray-500">
                            Chrome on Windows • Active now
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-green-600 font-medium">Current</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'billing' && (
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Billing Information</h2>
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-600">
                      Billing features are not yet available. This section will include:
                    </p>
                    <ul className="mt-2 text-sm text-gray-600 space-y-1">
                      <li>• Payment method management</li>
                      <li>• Billing history</li>
                      <li>• Subscription management</li>
                      <li>• Invoice downloads</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'preferences' && (
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Preferences</h2>
                <div className="space-y-6">
                  {/* Theme */}
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-4">Appearance</h3>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setIsDarkMode(false)}
                        className={`p-2 rounded-md ${
                          !isDarkMode
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-400 hover:bg-gray-100'
                        }`}
                      >
                        <SunIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setIsDarkMode(true)}
                        className={`p-2 rounded-md ${
                          isDarkMode
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-400 hover:bg-gray-100'
                        }`}
                      >
                        <MoonIcon className="h-5 w-5" />
                      </button>
                      <span className="text-sm text-gray-700">
                        {isDarkMode ? 'Dark' : 'Light'} Mode
                      </span>
                    </div>
                  </div>

                  {/* Language */}
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-4">Language</h3>
                    <select className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </div>

                  {/* Timezone */}
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-4">Timezone</h3>
                    <select className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                      <option value="UTC">UTC</option>
                      <option value="EST">Eastern Time</option>
                      <option value="CST">Central Time</option>
                      <option value="MST">Mountain Time</option>
                      <option value="PST">Pacific Time</option>
                    </select>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => updatePreferencesMutation.mutate({
                        theme: isDarkMode ? 'dark' : 'light',
                      })}
                      loading={updatePreferencesMutation.isLoading}
                    >
                      Save Preferences
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <Card className="mt-8 border-red-200">
        <div className="p-6">
          <h2 className="text-lg font-medium text-red-600 mb-4">Danger Zone</h2>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <Button
              variant="danger"
              onClick={handleDeleteAccount}
              loading={deleteAccountMutation.isLoading}
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
