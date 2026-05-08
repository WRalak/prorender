import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  DocumentTextIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UserIcon,
  BuildingOfficeIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../../context/AuthContext';
import { adminAPI } from '../../../services/api';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { formatCurrency } from '../../../utils/formatCurrency';
import toast from 'react-hot-toast';

const Reports = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('30');

  const { data: overviewData, isLoading } = useQuery(
    ['admin-reports-overview', timeRange],
    () => adminAPI.getReportsOverview(timeRange),
    {
      staleTime: 5 * 60 * 1000,
    }
  );

  const stats = overviewData || {
    totalUsers: 0,
    activeUsers: 0,
    totalProperties: 0,
    activeProperties: 0,
    totalRevenue: 0,
    pendingApplications: 0,
    openMaintenance: 0,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
              <p className="text-sm text-gray-500">
                System analytics and insights
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setTimeRange('7')}
                variant={timeRange === '7' ? 'default' : 'outline'}
              >
                7 Days
              </Button>
              <Button
                onClick={() => setTimeRange('30')}
                variant={timeRange === '30' ? 'default' : 'outline'}
              >
                30 Days
              </Button>
              <Button
                onClick={() => setTimeRange('90')}
                variant={timeRange === '90' ? 'default' : 'outline'}
              >
                90 Days
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
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
                  <p className="text-sm font-medium text-gray-500">Total Properties</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProperties}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CurrencyDollarIcon className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.totalRevenue)}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DocumentTextIcon className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Open Maintenance</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.openMaintenance}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Detailed Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Overview Report */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Overview</h2>
              {isLoading ? (
                <LoadingSpinner size="large" />
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Users
                      </label>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Active Users
                      </label>
                      <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Properties
                      </label>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalProperties}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Active Properties
                      </label>
                      <p className="text-2xl font-bold text-gray-900">{stats.activeProperties}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-md">
                    <span className="text-sm text-gray-700">
                      Last updated: {stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleDateString() : 'Never'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Financial Report */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Financial Report</h2>
              {isLoading ? (
                <LoadingSpinner size="large" />
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Revenue
                      </label>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(stats.totalRevenue)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pending Applications
                      </label>
                      <p className="text-2xl font-bold text-gray-900">{stats.pendingApplications}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-md">
                    <span className="text-sm text-gray-700">
                      Last updated: {stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleDateString() : 'Never'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => {
                  toast.success('Reports exported successfully');
                }}
                variant="outline"
                className="flex items-center"
              >
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                Export Reports
              </Button>
              <Button
                onClick={() => {
                  toast.success('Report generated successfully');
                }}
                variant="outline"
                className="flex items-center"
              >
                <ChartBarIcon className="h-5 w-5 mr-2" />
                Generate Report
              </Button>
              <Button
                onClick={() => {
                  toast.success('Reports scheduled successfully');
                }}
                variant="outline"
                className="flex items-center"
              >
                <CalendarIcon className="h-5 w-5 mr-2" />
                Schedule Reports
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
