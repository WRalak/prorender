'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../contexts/AuthContext'
import { User, Property, Application } from '../../../lib/types'
import { 
  UserIcon, 
  BuildingOfficeIcon, 
  DocumentTextIcon, 
  CurrencyDollarIcon,
  ChartBarIcon,
  UserGroupIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    totalApplications: 0,
    totalRevenue: 0,
  })
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000)
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Platform overview and system management
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <UserIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              <p className="text-sm text-gray-600">Total Users</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <BuildingOfficeIcon className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProperties}</p>
              <p className="text-sm text-gray-600">Total Properties</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <DocumentTextIcon className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
              <p className="text-sm text-gray-600">Total Applications</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Total Revenue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Manage Users</h3>
          <p className="text-gray-600 mb-4">View and manage platform users</p>
          <button
            onClick={() => router.push('/admin/users')}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            <UserGroupIcon className="h-5 w-5 mr-2" />
            Manage Users
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Analytics</h3>
          <p className="text-gray-600 mb-4">View detailed platform analytics</p>
          <button
            onClick={() => router.push('/admin/analytics')}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            <ChartBarIcon className="h-5 w-5 mr-2" />
            View Analytics
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Settings</h3>
          <p className="text-gray-600 mb-4">Configure platform features and settings</p>
          <button
            onClick={() => router.push('/admin/settings')}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            <ChartBarIcon className="h-5 w-5 mr-2" />
            Settings
          </button>
        </div>
      </div>
    </div>
  )
}
