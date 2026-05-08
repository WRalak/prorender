import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import { CameraIcon } from '@heroicons/react/24/outline';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const { data: profile, isLoading } = useQuery('profile', userAPI.getProfile);

  const updateProfileMutation = useMutation(userAPI.updateProfile, {
    onSuccess: (data) => {
      queryClient.setQueryData('profile', data);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update profile');
    },
  });

  const updateAvatarMutation = useMutation(userAPI.updateAvatar, {
    onSuccess: (data) => {
      queryClient.setQueryData('profile', (oldData) => ({
        ...oldData,
        user: {
          ...oldData.user,
          profile: {
            ...oldData.user.profile,
            avatar: data.user.profile.avatar,
          },
        },
      }));
      toast.success('Avatar updated successfully');
      setAvatarPreview(null);
    },
    onError: (error) => {
      toast.error('Failed to update avatar');
    },
  });

  const handleProfileUpdate = (formData) => {
    updateProfileMutation.mutate(formData);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleAvatarUpload = () => {
    const fileInput = document.getElementById('avatar-input');
    if (fileInput.files[0]) {
      const formData = new FormData();
      formData.append('avatar', fileInput.files[0]);
      updateAvatarMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="large" />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="mt-2 text-gray-600">
          Manage your personal information and preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Information */}
        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
              )}
            </div>
          </Card.Header>
          
          <Card.Body>
            <div className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center space-x-6">
                <div className="shrink-0">
                  {avatarPreview || profile?.user?.profile?.avatar ? (
                    <img
                      src={avatarPreview || profile.user.profile.avatar}
                      alt="Profile"
                      className="h-20 w-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center">
                      <CameraIcon className="h-8 w-8 text-gray-600" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-4">
                    <div>
                      <label htmlFor="avatar-input" className="cursor-pointer">
                        <div className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                          Change Avatar
                        </div>
                        <input
                          id="avatar-input"
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                      </label>
                      {avatarPreview && (
                        <div className="flex space-x-2">
                          <Button
                            onClick={handleAvatarUpload}
                            loading={updateAvatarMutation.isLoading}
                            variant="primary"
                            size="small"
                          >
                            Upload
                          </Button>
                          <Button
                            onClick={() => setAvatarPreview(null)}
                            variant="outline"
                            size="small"
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      defaultValue={profile?.user?.name?.first}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      defaultValue={profile?.user?.name?.last}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profile?.user?.email}
                      disabled
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      defaultValue={profile?.user?.profile?.phone}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      rows={4}
                      defaultValue={profile?.user?.profile?.bio}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <span className="text-sm font-medium text-gray-700">First Name</span>
                    <p className="mt-1 text-sm text-gray-900">{profile?.user?.name?.first}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Last Name</span>
                    <p className="mt-1 text-sm text-gray-900">{profile?.user?.name?.last}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Email</span>
                    <p className="mt-1 text-sm text-gray-900">{profile?.user?.email}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Phone</span>
                    <p className="mt-1 text-sm text-gray-900">
                      {profile?.user?.profile?.phone || 'Not provided'}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-sm font-medium text-gray-700">Bio</span>
                    <p className="mt-1 text-sm text-gray-900">
                      {profile?.user?.profile?.bio || 'No bio provided'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card.Body>

          {isEditing && (
            <Card.Footer>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    const formData = {
                      name: {
                        first: document.querySelector('input[placeholder="First Name"]').value,
                        last: document.querySelector('input[placeholder="Last Name"]').value,
                      },
                      profile: {
                        phone: document.querySelector('input[placeholder="Phone"]').value,
                        bio: document.querySelector('textarea[placeholder="Tell us about yourself..."]').value,
                      },
                    };
                    handleProfileUpdate(formData);
                  }}
                  loading={updateProfileMutation.isLoading}
                >
                  Save Changes
                </Button>
              </div>
            </Card.Footer>
          )}
        </Card>

        {/* Account Information */}
        <Card>
          <Card.Header>
            <h2 className="text-xl font-semibold text-gray-900">Account Information</h2>
          </Card.Header>
          
          <Card.Body>
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-700">Account Type</span>
                <p className="mt-1 text-sm text-gray-900 capitalize">{profile?.user?.role}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Member Since</span>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(profile?.user?.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Email Verified</span>
                <p className="mt-1 text-sm text-gray-900">
                  {profile?.user?.isEmailVerified ? 'Verified' : 'Not Verified'}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Status</span>
                <p className="mt-1 text-sm text-gray-900 capitalize">{profile?.user?.status}</p>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Danger Zone */}
        <Card>
          <Card.Header>
            <h2 className="text-xl font-semibold text-red-600">Danger Zone</h2>
          </Card.Header>
          
          <Card.Body>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <Button
                variant="danger"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                    // Handle account deletion
                    userAPI.deleteAccount().then(() => {
                      localStorage.clear();
                      window.location.href = '/';
                    });
                  }
                }}
              >
                Delete Account
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
