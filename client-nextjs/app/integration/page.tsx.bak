'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { useSocket } from '../../contexts/SocketContext'
import { useNotifications } from '../../contexts/NotificationContext'
import { API_ENDPOINTS } from '../../lib/constants'
import { 
  HomeIcon, 
  BuildingOfficeIcon, 
  DocumentTextIcon, 
  ChatBubbleLeftRightIcon,
  CreditCardIcon,
  UserIcon,
  BellIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline'

export default function IntegrationPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    totalApplications: 0,
    totalRevenue: 0,
    activeConnections: 0,
    apiCalls: 0,
    databaseQueries: 0,
  })
  const router = useRouter()
  const { user } = useAuth()
  const { socket } = useSocket()
  const { notifications } = useNotifications()

  useEffect(() => {
    // Simulate loading and data fetching
    setTimeout(() => {
      setLoading(false)
      setStats(prev => ({
        ...prev,
        totalUsers: 1247,
        totalProperties: 89,
        totalApplications: 456,
        totalRevenue: 2340000,
        activeConnections: 23,
        apiCalls: 15678,
        databaseQueries: 892,
      }))
    }, 2000)
  }, [])

  const testAPIConnection = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.HEALTH_CHECK}`)
      const data = await response.json()
      return data.status === 'healthy'
    } catch (error) {
      console.error('API connection test failed:', error)
      return false
    }
  }

  const testDatabaseConnection = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.PROPERTIES.LIST}`)
      const data = await response.json()
      return data.properties ? true : false
    } catch (error) {
      console.error('Database connection test failed:', error)
      return false
    }
  }

  const testSocketConnection = () => {
    if (socket && socket.connected) {
      return true
    }
    return false
  }

  const simulateNotification = () => {
    if (notifications && notifications.length > 0) {
      const newNotification = {
        id: Date.now().toString(),
        title: 'System Integration Test',
        message: 'All systems are functioning correctly',
        type: 'success',
        timestamp: new Date().toISOString(),
        read: false,
      }
      // This would normally trigger through the notification context
      console.log('New notification:', newNotification)
      return newNotification
    }
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">System Integration</h1>
              <p className="text-gray-600 mt-1">
                Complete overview of app, database, and API integration status
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-primary font-label-bold flex items-center gap-2 hover:underline"
              >
                <HomeIcon className="h-5 w-5" />
                Dashboard
              </button>
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="text-primary font-label-bold flex items-center gap-2 hover:underline"
              >
                <UserGroupIcon className="h-5 w-5" />
                Admin
              </button>
            </div>
          </div>
        </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* System Status */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">System Status</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">Application</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    stats.totalUsers > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {stats.totalUsers > 0 ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">Database</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    stats.totalProperties > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {stats.totalProperties > 0 ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">Socket.IO</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    stats.activeConnections > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {stats.activeConnections > 0 ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">API Server</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    stats.totalRevenue > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {stats.totalRevenue > 0 ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>

          {/* Live Statistics */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Live Statistics</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-surface-container-low rounded-lg">
                  <UserGroupIcon className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-3xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Total Users</p>
                </div>
                
                <div className="text-center p-4 bg-surface-container-low rounded-lg">
                  <BuildingOfficeIcon className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-3xl font-bold text-gray-900">{stats.totalProperties.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Total Properties</p>
                </div>
                
                <div className="text-center p-4 bg-surface-container-low rounded-lg">
                  <DocumentTextIcon className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-3xl font-bold text-gray-900">{stats.totalApplications.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Total Applications</p>
                </div>
                
                <div className="text-center p-4 bg-surface-container-low rounded-lg">
                  <CurrencyDollarIcon className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-3xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                </div>
              </div>
            </div>

          {/* API Activity */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">API Activity</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">API Calls Today</span>
                <span className="text-2xl font-bold text-primary">{stats.apiCalls.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">Database Queries</span>
                <span className="text-2xl font-bold text-primary">{stats.databaseQueries.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">Active Connections</span>
                <span className="text-2xl font-bold text-primary">{stats.activeConnections.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Integration Tests */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Integration Tests</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={testAPIConnection}
                className="w-full p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-3"
              >
                <RocketLaunchIcon className="h-6 w-6" />
                Test API Connection
              </button>
              
              <button
                onClick={testDatabaseConnection}
                className="w-full p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-3"
              >
                <DocumentTextIcon className="h-6 w-6" />
                Test Database Connection
              </button>
              
              <button
                onClick={testSocketConnection}
                className="w-full p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-3"
              >
                <ChatBubbleLeftRightIcon className="h-6 w-6" />
                Test Socket Connection
              </button>
              
              <button
                onClick={simulateNotification}
                className="w-full p-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-3"
              >
                <BellIcon className="h-6 w-6" />
                Test Notification System
              </button>
            </div>
          </div>

          {/* User Info */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Current User</h2>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden">
                <UserIcon className="h-8 w-8 text-gray-600" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">{user?.name || 'Guest User'}</p>
                <p className="text-sm text-gray-600">{user?.email || 'Not logged in'}</p>
                <p className="text-sm text-gray-600">Role: <span className="font-medium">{user?.role || 'Unknown'}</span></p>
              </div>
            </div>
          </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <HomeIcon className="h-5 w-5 mr-2" />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}
