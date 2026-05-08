import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  HomeIcon,
  DocumentTextIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  BellIcon,
  MapPinIcon,
  UserIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../../context/AuthContext';
import { applicationAPI } from '../../../services/api';
import { propertyAPI } from '../../../services/api';
import { maintenanceAPI } from '../../../services/api';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import StatusBadge from '../../../components/common/StatusBadge';
import { formatCurrency, formatDate } from '../../../utils/formatCurrency';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const { data: applications, isLoading: applicationsLoading } = useQuery(
    'user-applications',
    applicationAPI.getUserApplications,
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const { data: properties, isLoading: propertiesLoading } = useQuery(
    'user-properties',
    propertyAPI.getUserProperties,
    {
      staleTime: 5 * 60 * 1000,
    }
  );

  const { data: maintenanceRequests, isLoading: maintenanceLoading } = useQuery(
    'user-maintenance',
    maintenanceAPI.getUserMaintenanceRequests,
    {
      staleTime: 5 * 60 * 1000,
    }
  );

  const { data: favorites, isLoading: favoritesLoading } = useQuery(
    'user-favorites',
    propertyAPI.getUserFavorites,
    {
      staleTime: 5 * 60 * 1000,
    }
  );

  const recentApplications = applications?.data?.slice(0, 5) || [];
  const activeProperties = properties?.data?.filter(p => p.status === 'active') || [];
  const pendingMaintenance = maintenanceRequests?.data?.filter(m => m.status === 'open') || [];
  const favoriteProperties = favorites?.data || [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'gray';
      case 'submitted':
        return 'blue';
      case 'under_review':
        return 'yellow';
      case 'pending_documents':
        return 'orange';
      case 'approved':
        return 'green';
      case 'rejected':
        return 'red';
      case 'withdrawn':
        return 'gray';
      case 'expired':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getMaintenanceStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'blue';
      case 'in_progress':
        return 'yellow';
      case 'resolved':
        return 'green';
      case 'closed':
        return 'gray';
      case 'cancelled':
        return 'gray';
      default:
        return 'gray';
    }
  };

  if (applicationsLoading || propertiesLoading || maintenanceLoading || favoritesLoading) {
    return <LoadingSpinner size="large" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-500">
                Welcome back, {user?.name || 'User'}!
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative"
              >
                <BellIcon className="h-5 w-5" />
                {false && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                )}
              </Button>
              <Link to="/profile">
                <Button variant="outline">
                  <UserIcon className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DocumentTextIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Applications</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {applications?.data?.length || 0}
                  </p>
                  <p className="text-xs text-gray-500">
                    {recentApplications.filter(a => a.status === 'pending').length} pending
                  </p>
                </div>
              </div>
            </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BuildingOfficeIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Active Properties</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {activeProperties.length}
                  </p>
                  <p className="text-xs text-gray-500">
                    {properties?.data?.length || 0} total
                  </p>
                </div>
              </div>
            </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <HomeIcon className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Favorites</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {favoriteProperties.length}
                  </p>
                  <p className="text-xs text-gray-500">
                    Saved properties
                  </p>
                </div>
              </div>
            </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CalendarIcon className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Maintenance</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {pendingMaintenance.length}
                  </p>
                  <p className="text-xs text-gray-500">
                    Open requests
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Applications */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-gray-900">Recent Applications</h2>
                    <Link
                      to="/applications"
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View all
                    </Link>
                  </div>
                  {recentApplications.length > 0 ? (
                    <div className="space-y-4">
                      {recentApplications.map((application) => (
                        <div key={application._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                  <HomeIcon className="h-4 w-4 text-gray-400" />
                                </div>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {application.property?.title || 'Unknown Property'}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Applied: {formatDate(application.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <StatusBadge
                              status={application.status}
                              color={getStatusColor(application.status)}
                            />
                            <Link
                              to={`/applications/${application._id}`}
                              className="text-xs text-blue-600 hover:text-blue-800 mt-2"
                            >
                              View details
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No applications yet</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Start applying for properties to see them here
                      </p>
                      <Link to="/search">
                        <Button className="mt-4">Browse Properties</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </Card>

              {/* Maintenance Requests */}
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-gray-900">Maintenance Requests</h2>
                    <Link
                      to="/maintenance"
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View all
                    </Link>
                  </div>
                  {pendingMaintenance.length > 0 ? (
                    <div className="space-y-4">
                      {pendingMaintenance.slice(0, 3).map((request) => (
                        <div key={request._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                  <CalendarIcon className="h-4 w-4 text-orange-600" />
                                </div>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{request.title}</p>
                                <p className="text-sm text-gray-500">
                                  {request.property?.title || 'Unknown Property'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Submitted: {formatDate(request.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <StatusBadge
                              status={request.status}
                              color={getMaintenanceStatusColor(request.status)}
                            />
                            <Link
                              to={`/maintenance/${request._id}`}
                              className="text-xs text-blue-600 hover:text-blue-800 mt-2"
                            >
                              View details
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No maintenance requests</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        All your maintenance requests are resolved
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              {/* Quick Actions Card */}
              <Card>
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
                  <div className="space-y-3">
                    <Link
                      to="/search"
                      className="flex items-center justify-between w-full p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <MapPinIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-sm font-medium text-gray-900">Browse Properties</span>
                      </div>
                      <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                    </Link>
                    <Link
                      to="/applications/apply"
                      className="flex items-center justify-between w-full p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-sm font-medium text-gray-900">New Application</span>
                      </div>
                      <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                    </Link>
                    <Link
                      to="/maintenance/new"
                      className="flex items-center justify-between w-full p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-sm font-medium text-gray-900">Request Maintenance</span>
                      </div>
                      <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                    </Link>
                    <Link
                      to="/favorites"
                      className="flex items-center justify-between w-full p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <HomeIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-sm font-medium text-gray-900">View Favorites</span>
                      </div>
                      <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                    </Link>
                  </div>
                </div>
              </Card>

              {/* Favorite Properties */}
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-gray-900">Favorite Properties</h2>
                    <Link
                      to="/favorites"
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View all
                    </Link>
                  </div>
                  {favoriteProperties.length > 0 ? (
                    <div className="space-y-4">
                      {favoriteProperties.slice(0, 3).map((property) => (
                        <div key={property.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                          <div className="flex-shrink-0">
                            {property.images?.length > 0 ? (
                              <img
                                src={property.images[0]}
                                alt={property.title}
                                className="w-12 h-12 rounded-md object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                                <HomeIcon className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 line-clamp-1">
                              {property.title}
                            </p>
                            <p className="text-sm text-gray-500">
                              {property.address?.city}, {property.address?.state}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">
                              {formatCurrency(property.pricing?.rent || 0)}/mo
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <HomeIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No favorites yet</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Save properties you're interested in to see them here
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
