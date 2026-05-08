import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  HomeIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  CreditCardIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

const Dashboard = () => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();

  // Fetch dashboard data based on user role
  const { data: dashboardData, isLoading } = useQuery(
    'dashboard',
    async () => {
      const endpoint = user.role === 'agent' ? '/agent/dashboard' : '/tenant/dashboard';
      const response = await fetch(`/api${endpoint}`);
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      return response.json();
    }
  );

  const stats = dashboardData?.stats || {};
  const recentActivity = dashboardData?.recentActivity || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const tenantStats = [
    {
      name: 'Applications',
      value: stats.applications || 0,
      icon: DocumentTextIcon,
      color: 'bg-blue-500',
      link: '/applications',
    },
    {
      name: 'Active Leases',
      value: stats.activeLeases || 0,
      icon: HomeIcon,
      color: 'bg-green-500',
      link: '/leases',
    },
    {
      name: 'Messages',
      value: unreadCount || 0,
      icon: ChatBubbleLeftRightIcon,
      color: 'bg-purple-500',
      link: '/messages',
    },
    {
      name: 'Maintenance Requests',
      value: stats.maintenanceRequests || 0,
      icon: WrenchScrewdriverIcon,
      color: 'bg-orange-500',
      link: '/maintenance',
    },
  ];

  const agentStats = [
    {
      name: 'Properties',
      value: stats.properties || 0,
      icon: BuildingOfficeIcon,
      color: 'bg-blue-500',
      link: '/agent/properties',
    },
    {
      name: 'Applications',
      value: stats.applications || 0,
      icon: DocumentTextIcon,
      color: 'bg-green-500',
      link: '/agent/applications',
    },
    {
      name: 'Messages',
      value: unreadCount || 0,
      icon: ChatBubbleLeftRightIcon,
      color: 'bg-purple-500',
      link: '/messages',
    },
    {
      name: 'Active Leases',
      value: stats.activeLeases || 0,
      icon: HomeIcon,
      color: 'bg-orange-500',
      link: '/leases',
    },
  ];

  const displayStats = user.role === 'agent' ? agentStats : tenantStats;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name?.first}!
          </h1>
          <p className="mt-2 text-gray-600">
            Here's what's happening with your {user.role === 'agent' ? 'properties' : 'rental'} today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {displayStats.map((stat) => (
            <Link
              key={stat.name}
              to={stat.link}
              className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <dt>
                <div className={`absolute rounded-md p-3 ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <p className="ml-16 text-sm font-medium text-gray-500 truncate">{stat.name}</p>
              </dt>
              <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </dd>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Recent Activity
              </h3>
              {recentActivity.length > 0 ? (
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
                                  activity.type === 'application' ? 'bg-blue-500' :
                                  activity.type === 'message' ? 'bg-purple-500' :
                                  activity.type === 'payment' ? 'bg-green-500' :
                                  'bg-gray-500'
                                }`}
                              >
                                <span className="text-white text-xs font-medium">
                                  {activity.type === 'application' ? 'A' :
                                   activity.type === 'message' ? 'M' :
                                   activity.type === 'payment' ? 'P' : 'N'}
                                </span>
                              </span>
                            </div>
                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p className="text-sm text-gray-500">{activity.description}</p>
                              </div>
                              <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                <time dateTime={activity.timestamp}>
                                  {new Date(activity.timestamp).toLocaleDateString()}
                                </time>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No recent activity</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                {user.role === 'agent' ? (
                  <>
                    <Link
                      to="/agent/properties/add"
                      className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Add New Property
                    </Link>
                    <Link
                      to="/agent/applications"
                      className="block w-full text-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                    >
                      Review Applications
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/properties"
                      className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Browse Properties
                    </Link>
                    <Link
                      to="/applications"
                      className="block w-full text-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                    >
                      My Applications
                    </Link>
                  </>
                )}
                <Link
                  to="/messages"
                  className="block w-full text-center bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
                >
                  Messages {unreadCount > 0 && `(${unreadCount})`}
                </Link>
                <Link
                  to="/payments"
                  className="block w-full text-center bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
                >
                  Payment History
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
