import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import {
  UsersIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import Card from '../../../components/common/Card';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { formatCurrency } from '../../../utils/formatCurrency';

const SuperAdminDashboard = () => {
  const { data: dashboardData, isLoading } = useQuery('super-admin-dashboard', async () => {
    const response = await fetch('/api/super-admin/dashboard');
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
        <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">
          System-wide overview and management controls
        </p>
      </div>

      {/* Critical Alerts */}
      {alerts.length > 0 && (
        <Card>
          <Card.Header className="bg-red-50 border-red-200">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
              <h3 className="text-lg font-medium text-red-900">Critical Alerts</h3>
            </div>
          </Card.Header>
          <Card.Body className="bg-red-50">
            <div className="space-y-2">
              {alerts.map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-md border border-red-200">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
                      <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                      <p className="text-xs text-gray-600">{alert.description}</p>
                    </div>
                  </div>
                  <Link
                    to={alert.actionLink}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Applications</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.activeApplications || 0}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <span className="text-yellow-600">{stats.pendingApplications || 0}</span>
                <span className="text-gray-500 ml-1">pending</span>
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
                to="/super-admin/users"
                className="block p-3 border border-gray-200 rounded-md hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <UsersIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Manage Users</p>
                    <p className="text-xs text-gray-500">View and manage all system users</p>
                  </div>
                </div>
              </Link>
              
              <Link
                to="/super-admin/audit-logs"
                className="block p-3 border border-gray-200 rounded-md hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <ShieldCheckIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Audit Logs</p>
                    <p className="text-xs text-gray-500">View system activity logs</p>
                  </div>
                </div>
              </Link>
              
              <Link
                to="/super-admin/system-health"
                className="block p-3 border border-gray-200 rounded-md hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <ChartBarIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">System Health</p>
                    <p className="text-xs text-gray-500">Monitor system performance</p>
                  </div>
                </div>
              </Link>
              
              <Link
                to="/super-admin/settings"
                className="block p-3 border border-gray-200 rounded-md hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">System Settings</p>
                    <p className="text-xs text-gray-500">Configure system parameters</p>
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
                <span className="text-sm text-gray-600">Database Status</span>
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  Healthy
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Response Time</span>
                <span className="text-sm text-gray-900">{stats.apiResponseTime || 0}ms</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Server Uptime</span>
                <span className="text-sm text-gray-900">{stats.uptime || 99.9}%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Sessions</span>
                <span className="text-sm text-gray-900">{stats.activeSessions || 0}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Storage Used</span>
                <span className="text-sm text-gray-900">{stats.storageUsed || '45%'}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Backup</span>
                <span className="text-sm text-gray-900">
                  {stats.lastBackup ? new Date(stats.lastBackup).toLocaleDateString() : 'Never'}
                </span>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-medium text-gray-900">Recent System Activity</h3>
        </Card.Header>
        <Card.Body>
          <div className="flow-root">
            <ul className="-mb-8">
              {recentActivity.map((activity, activityIdx) => (
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
                            activity.type === 'security' ? 'bg-red-500' :
                            'bg-green-500'
                          }`}
                        >
                          <span className="text-white text-xs font-medium">
                            {activity.type === 'user' ? 'U' :
                             activity.type === 'system' ? 'S' :
                             activity.type === 'security' ? '!' : '✓'}
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
              ))}
            </ul>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default SuperAdminDashboard;