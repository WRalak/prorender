import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  UsersIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency } from '../../utils/formatCurrency';

const AdminDashboard = () => {
  const { data: dashboardData, isLoading } = useQuery('admin-dashboard', async () => {
    const response = await fetch('/api/admin/dashboard');
    return response.json();
  });

  const stats = dashboardData?.stats || {};
  const recentActivity = dashboardData?.recentActivity || [];
  const alerts = dashboardData?.alerts || [];

  if (isLoading) {
    return <LoadingSpinner size="large" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Manage users, properties, and system operations
        </p>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card>
          <Card.Header className="bg-yellow-50 border-yellow-200">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
              <h3 className="text-lg font-medium text-yellow-900">Pending Items</h3>
            </div>
          </Card.Header>
          <Card.Body className="bg-yellow-50">
            <div className="space-y-2">
              {alerts.map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-md border border-yellow-200">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                      <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                      <p className="text-xs text-gray-600">{alert.description}</p>
                    </div>
                  </div>
                  <Link
                    to={alert.actionLink}
                    className="px-3 py-1 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700"
                  >
                    {alert.actionText}
                  </Link>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <Card.Body>
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <UsersIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalUsers || 0}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <span className="text-green-600">+{stats.newUsersThisMonth || 0}</span>
                <span className="text-gray-500 ml-1">this month</span>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <BuildingOfficeIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Properties</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalProperties || 0}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <span className="text-green-600">+{stats.newPropertiesThisMonth || 0}</span>
                <span className="text-gray-500 ml-1">this month</span>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <CurrencyDollarIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Monthly Revenue</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(stats.monthlyRevenue || 0)}
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <span className="text-green-600">+{stats.revenueGrowth || 0}%</span>
                <span className="text-gray-500 ml-1">vs last month</span>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <DocumentTextIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Applications</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.pendingApplications || 0}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <span className="text-yellow-600">{stats.pendingApplications || 0}</span>
                <span className="text-gray-500 ml-1">need review</span>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </Card.Header>
          <Card.Body>
            <div className="space-y-3">
              <Link
                to="/admin/users"
                className="block p-3 border border-gray-200 rounded-md hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <UsersIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Manage Users</p>
                    <p className="text-xs text-gray-500">View and manage user accounts</p>
                  </div>
                </div>
              </Link>
              
              <Link
                to="/admin/reports"
                className="block p-3 border border-gray-200 rounded-md hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <ChartBarIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">View Reports</p>
                    <p className="text-xs text-gray-500">Generate system reports</p>
                  </div>
                </div>
              </Link>
              
              <Link
                to="/admin/moderation"
                className="block p-3 border border-gray-200 rounded-md hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Content Moderation</p>
                    <p className="text-xs text-gray-500">Review flagged content</p>
                  </div>
                </div>
              </Link>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h3 className="text-lg font-medium text-gray-900">System Overview</h3>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Users Today</span>
                <span className="text-sm text-gray-900">{stats.activeUsersToday || 0}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Properties Listed</span>
                <span className="text-sm text-gray-900">{stats.propertiesListed || 0}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Applications Today</span>
                <span className="text-sm text-gray-900">{stats.applicationsToday || 0}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Messages Sent</span>
                <span className="text-sm text-gray-900">{stats.messagesSent || 0}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Support Tickets</span>
                <span className="text-sm text-gray-900">{stats.supportTickets || 0}</span>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        </Card.Header>
        <Card.Body>
          <div className="flow-root">
            <ul className="-mb-8">
              {recentActivity.length === 0 ? (
                <li>
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">
                      <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No recent activity</h3>
                    <p className="text-gray-600">System activity will appear here.</p>
                  </div>
                </li>
              ) : (
                recentActivity.map((activity, activityIdx) => (
                  <li key={activityIdx}>
                    <div className="relative pb-8">
                      {activityIdx !== recentActivity.length - 1 ? (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span
                            className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                              activity.type === 'user' ? 'bg-blue-500' :
                              activity.type === 'system' ? 'bg-gray-500' :
                              activity.type === 'property' ? 'bg-green-500' :
                              'bg-yellow-500'
                            }`}
                          >
                            <span className="text-white text-xs font-medium">
                              {activity.type === 'user' ? 'U' :
                               activity.type === 'system' ? 'S' :
                               activity.type === 'property' ? 'P' : '!'}
                            </span>
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">{activity.description}</p>
                            <p className="text-xs text-gray-400">
                              {activity.user?.name} • {new Date(activity.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            {activity.ipAddress}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AdminDashboard;