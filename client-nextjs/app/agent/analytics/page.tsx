'use client'

import { useState } from 'react'
import { 
  ChartBarIcon, 
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  EyeIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'

export default function AgentAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30days')

  // Mock analytics data
  const stats = {
    totalViews: 12450,
    totalApplications: 156,
    conversionRate: 1.25,
    totalRevenue: 124000,
    averageRent: 3200,
    occupiedProperties: 12,
    vacantProperties: 3,
    totalProperties: 15
  }

  const performanceData = [
    { month: 'Jan', views: 3200, applications: 45, revenue: 28000 },
    { month: 'Feb', views: 3800, applications: 52, revenue: 32000 },
    { month: 'Mar', views: 4100, applications: 48, revenue: 31000 },
    { month: 'Apr', views: 3900, applications: 58, revenue: 33000 },
    { month: 'May', views: 4200, applications: 62, revenue: 35000 },
    { month: 'Jun', views: 4500, applications: 68, revenue: 38000 }
  ]

  const topProperties = [
    {
      id: 1,
      title: 'Modern Downtown Apartment',
      views: 2340,
      applications: 28,
      conversionRate: 1.2
    },
    {
      id: 2,
      title: 'Cozy Suburban House',
      views: 1890,
      applications: 35,
      conversionRate: 1.85
    },
    {
      id: 3,
      title: 'Luxury Penthouse Suite',
      views: 1560,
      applications: 12,
      conversionRate: 0.77
    }
  ]

  const getChangeColor = (value) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600'
  }

  const getChangeIcon = (value) => {
    return value >= 0 ? <ArrowTrendingUpIcon className="h-4 w-4" /> : <ArrowTrendingDownIcon className="h-4 w-4" />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Track your property performance and business metrics</p>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="1year">Last Year</option>
          </select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <EyeIcon className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Views</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
                </div>
              </div>
              <div className={`flex items-center ${getChangeColor(12.5)}`}>
                {getChangeIcon(12.5)}
                <span className="text-sm font-medium">+12.5%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <UserGroupIcon className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
                </div>
              </div>
              <div className={`flex items-center ${getChangeColor(8.3)}`}>
                {getChangeIcon(8.3)}
                <span className="text-sm font-medium">+8.3%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <CurrencyDollarIcon className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
                </div>
              </div>
              <div className={`flex items-center ${getChangeColor(15.2)}`}>
                {getChangeIcon(15.2)}
                <span className="text-sm font-medium">+15.2%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <ArrowTrendingUpIcon className="h-8 w-8 text-orange-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.conversionRate}%</p>
                </div>
              </div>
              <div className={`flex items-center ${getChangeColor(-2.1)}`}>
                {getChangeIcon(-2.1)}
                <span className="text-sm font-medium">-2.1%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Performance Overview</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Interactive chart would be displayed here</p>
              <p className="text-sm text-gray-400">Showing views, applications, and revenue trends</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Property Performance */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Top Performing Properties</h2>
            <div className="space-y-4">
              {topProperties.map((property, index) => (
                <div key={property.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium text-gray-900">{property.title}</h4>
                      <p className="text-xs text-gray-500">{property.views} views • {property.applications} applications</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{property.conversionRate}%</p>
                    <p className="text-xs text-gray-500">conversion</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Property Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Property Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <BuildingOfficeIcon className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Occupied Properties</h4>
                    <p className="text-xs text-gray-500">Currently generating revenue</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">{stats.occupiedProperties}</p>
                  <p className="text-xs text-gray-500">units</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <BuildingOfficeIcon className="h-8 w-8 text-yellow-600 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Vacant Properties</h4>
                    <p className="text-xs text-gray-500">Available for rent</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-yellow-600">{stats.vacantProperties}</p>
                  <p className="text-xs text-gray-500">units</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <CurrencyDollarIcon className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Average Rent</h4>
                    <p className="text-xs text-gray-500">Across all properties</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">${stats.averageRent}</p>
                  <p className="text-xs text-gray-500">per month</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
