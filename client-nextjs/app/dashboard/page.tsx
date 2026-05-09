'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { Property, Application, Message, Payment } from '../../lib/types'
import { 
  HomeIcon, 
  BuildingOfficeIcon, 
  DocumentTextIcon, 
  ChatBubbleLeftRightIcon,
  CreditCardIcon,
  UserIcon,
  BellIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeApplications: 0,
    unreadMessages: 0,
    pendingPayments: 0,
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    fetchDashboardData()
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      // Fetch user-specific dashboard data based on role
      const endpoint = user?.role === 'agent' 
        ? '/api/agent/dashboard' 
        : user?.role === 'admin'
        ? '/api/admin/dashboard'
        : '/api/tenant/dashboard'

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setRecentActivity(data.recentActivity)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDashboardCards = () => {
    const cards = [
      {
        title: 'Properties',
        value: stats.totalProperties,
        icon: BuildingOfficeIcon,
        color: 'bg-blue-500',
        href: '/properties',
      },
      {
        title: 'Applications',
        value: stats.activeApplications,
        icon: DocumentTextIcon,
        color: 'bg-green-500',
        href: '/applications',
      },
      {
        title: 'Messages',
        value: stats.unreadMessages,
        icon: ChatBubbleLeftRightIcon,
        color: 'bg-purple-500',
        href: '/messages',
      },
      {
        title: 'Payments',
        value: stats.pendingPayments,
        icon: CreditCardIcon,
        color: 'bg-yellow-500',
        href: '/payments',
      },
    ]

    // Agent-specific cards
    if (user?.role === 'agent') {
      cards.push({
        title: 'Total Views',
        value: 2500,
        icon: ArrowTrendingUpIcon,
        color: 'bg-indigo-500',
        href: '/agent/analytics',
      })
    }

    // Admin-specific cards
    if (user?.role === 'admin' || user?.role === 'super_admin') {
      cards.push({
        title: 'Total Users',
        value: 1234,
        icon: UserIcon,
        color: 'bg-red-500',
        href: '/admin/users',
      })
    }

    return cards
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    )
  }

  return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name.first}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your {user?.role === 'agent' ? 'property business' : 'rental journey'} today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {getDashboardCards().map((card, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(card.href)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-full`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Activity Feed */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No recent activity</p>
              ) : (
                recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${
                      activity.type === 'application' ? 'bg-green-100' :
                      activity.type === 'message' ? 'bg-blue-100' :
                      activity.type === 'payment' ? 'bg-yellow-100' :
                      'bg-gray-100'
                    }`}>
                      {activity.type === 'application' && <DocumentTextIcon className="h-4 w-4 text-green-600" />}
                      {activity.type === 'message' && <ChatBubbleLeftRightIcon className="h-4 w-4 text-blue-600" />}
                      {activity.type === 'payment' && <CreditCardIcon className="h-4 w-4 text-yellow-600" />}
                      {activity.type === 'view' && <HomeIcon className="h-4 w-4 text-gray-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {user?.role === 'tenant' && (
                <>
                  <button
                    onClick={() => router.push('/properties')}
                    className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-between"
                  >
                    <span className="flex items-center">
                      <HomeIcon className="h-5 w-5 text-gray-600 mr-3" />
                      Browse Properties
                    </span>
                    <span className="text-gray-400">→</span>
                  </button>
                  <button
                    onClick={() => router.push('/applications')}
                    className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-between"
                  >
                    <span className="flex items-center">
                      <DocumentTextIcon className="h-5 w-5 text-gray-600 mr-3" />
                      My Applications
                    </span>
                    <span className="text-gray-400">→</span>
                  </button>
                </>
              )}

              {user?.role === 'agent' && (
                <>
                  <button
                    onClick={() => router.push('/agent/properties/add')}
                    className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-between"
                  >
                    <span className="flex items-center">
                      <BuildingOfficeIcon className="h-5 w-5 text-gray-600 mr-3" />
                      Add Property
                    </span>
                    <span className="text-gray-400">→</span>
                  </button>
                  <button
                    onClick={() => router.push('/agent/applications')}
                    className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-between"
                  >
                    <span className="flex items-center">
                      <DocumentTextIcon className="h-5 w-5 text-gray-600 mr-3" />
                      Review Applications
                    </span>
                    <span className="text-gray-400">→</span>
                  </button>
                </>
              )}

              {user?.role === 'admin' && (
                <>
                  <button
                    onClick={() => router.push('/admin/users')}
                    className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-between"
                  >
                    <span className="flex items-center">
                      <UserIcon className="h-5 w-5 text-gray-600 mr-3" />
                      Manage Users
                    </span>
                    <span className="text-gray-400">→</span>
                  </button>
                  <button
                    onClick={() => router.push('/admin/reports')}
                    className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-between"
                  >
                    <span className="flex items-center">
                      <ArrowTrendingUpIcon className="h-5 w-5 text-gray-600 mr-3" />
                      View Reports
                    </span>
                    <span className="text-gray-400">→</span>
                  </button>
                </>
              )}

              <button
                onClick={() => router.push('/messages')}
                className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-between"
              >
                <span className="flex items-center">
                  <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-600 mr-3" />
                  Messages
                  {stats.unreadMessages > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {stats.unreadMessages}
                    </span>
                  )}
                </span>
                <span className="text-gray-400">→</span>
              </button>

              <button
                onClick={() => router.push('/profile')}
                className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-between"
              >
                <span className="flex items-center">
                  <UserIcon className="h-5 w-5 text-gray-600 mr-3" />
                  Profile Settings
                </span>
                <span className="text-gray-400">→</span>
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {user?.role === 'tenant' && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start">
              <BellIcon className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900">Stay Updated</h3>
                <p className="text-blue-700 mt-1">
                  Set up email alerts to get notified when new properties match your criteria.
                </p>
                <button
                  onClick={() => router.push('/profile/notifications')}
                  className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Configure Alerts
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
}
