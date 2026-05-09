'use client'

import { useState } from 'react'
import { 
  DocumentTextIcon, 
  ChartBarIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

export default function AdminReportsPage() {
  const [selectedReport, setSelectedReport] = useState('overview')
  const [dateRange, setDateRange] = useState('30days')

  const reports = [
    {
      id: 'overview',
      name: 'Platform Overview',
      description: 'Comprehensive platform performance metrics',
      icon: ChartBarIcon,
      metrics: ['Total Users', 'Active Properties', 'Revenue', 'Growth Rate']
    },
    {
      id: 'users',
      name: 'User Analytics',
      description: 'Detailed user registration and activity data',
      icon: UserGroupIcon,
      metrics: ['New Users', 'User Retention', 'User Demographics', 'Activity Levels']
    },
    {
      id: 'properties',
      name: 'Property Performance',
      description: 'Property listings and rental performance',
      icon: BuildingOfficeIcon,
      metrics: ['Listed Properties', 'Occupancy Rate', 'Average Rent', 'Popular Locations']
    },
    {
      id: 'financial',
      name: 'Financial Summary',
      description: 'Revenue, expenses, and financial projections',
      icon: CurrencyDollarIcon,
      metrics: ['Total Revenue', 'Commission Income', 'Subscription Revenue', 'Profit Margins']
    },
    {
      id: 'growth',
      name: 'Growth Metrics',
      description: 'Platform growth and trend analysis',
      icon: ArrowTrendingUpIcon,
      metrics: ['User Growth', 'Revenue Growth', 'Market Expansion', 'Predictive Analytics']
    }
  ]

  const reportData = {
    overview: {
      totalUsers: 1247,
      activeProperties: 89,
      totalRevenue: 245678,
      growthRate: 12.5,
      monthlyActiveUsers: 890,
      conversionRate: 3.2,
      averageSessionDuration: '8m 45s',
      bounceRate: 42.3
    },
    users: {
      newUsers: 156,
      returningUsers: 891,
      userRetention: 78.5,
      demographics: {
        age: '25-45',
        location: 'Urban',
        income: '$50k-$100k'
      },
      topActivities: ['Property Search', 'Applications', 'Messages', 'Profile Updates']
    },
    properties: {
      totalListed: 89,
      occupied: 67,
      occupancyRate: 75.3,
      averageRent: 3200,
      popularLocations: ['Downtown', 'Suburban', 'Waterfront'],
      propertyTypes: ['Apartment (45%)', 'House (30%)', 'Condo (25%)']
    },
    financial: {
      totalRevenue: 245678,
      commissionIncome: 45678,
      subscriptionRevenue: 89000,
      profitMargin: 23.5,
      expenses: 187890,
      netProfit: 57788,
      projectedRevenue: 289000
    },
    growth: {
      userGrowth: 15.2,
      revenueGrowth: 12.5,
      marketExpansion: 8.7,
      predictiveGrowth: 18.3,
      newMarkets: ['Boston', 'Philadelphia', 'Washington DC'],
      growthChannels: ['Organic (45%)', 'Paid (30%)', 'Referral (25%)']
    }
  }

  const renderReportContent = () => {
    const data = reportData[selectedReport]
    
    switch (selectedReport) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <UserGroupIcon className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{data.totalUsers.toLocaleString()}</p>
                  <p className="text-sm text-green-600">+{data.monthlyActiveUsers} active</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <BuildingOfficeIcon className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Properties</p>
                  <p className="text-2xl font-bold text-gray-900">{data.activeProperties}</p>
                  <p className="text-sm text-gray-500">75.3% occupied</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <CurrencyDollarIcon className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${data.totalRevenue.toLocaleString()}</p>
                  <p className="text-sm text-green-600">+{data.growthRate}% growth</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <ChartBarIcon className="h-8 w-8 text-orange-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{data.conversionRate}%</p>
                  <p className="text-sm text-gray-500">{data.averageSessionDuration} avg session</p>
                </div>
              </div>
            </div>
          </div>
        )
      
      case 'users':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Activity</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">New Users</span>
                  <span className="font-semibold">{data.newUsers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Returning Users</span>
                  <span className="font-semibold">{data.returningUsers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Retention Rate</span>
                  <span className="font-semibold text-green-600">{data.userRetention}%</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Demographics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Primary Age Group</span>
                  <span className="font-semibold">{data.demographics.age}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Primary Location</span>
                  <span className="font-semibold">{data.demographics.location}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Income Range</span>
                  <span className="font-semibold">{data.demographics.income}</span>
                </div>
              </div>
            </div>
          </div>
        )
      
      case 'properties':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Listed</span>
                  <span className="font-semibold">{data.totalListed}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Occupied</span>
                  <span className="font-semibold text-green-600">{data.occupied}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Occupancy Rate</span>
                  <span className="font-semibold text-green-600">{data.occupancyRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average Rent</span>
                  <span className="font-semibold">${data.averageRent}/mo</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Locations</h3>
              <div className="space-y-2">
                {data.popularLocations.map((location, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-600">{location}</span>
                    <span className="font-semibold">{Math.floor(Math.random() * 50) + 10} properties</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      
      default:
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center py-12">
              <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Detailed report data would be displayed here</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600 mt-1">Generate and view platform performance reports</p>
          </div>
          <div className="flex gap-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="1year">Last Year</option>
            </select>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <ArrowDownTrayIcon className="h-5 w-5" />
              Export Report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Report Types Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Types</h3>
              <div className="space-y-2">
                {reports.map((report) => (
                  <button
                    key={report.id}
                    onClick={() => setSelectedReport(report.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedReport === report.id
                        ? 'bg-blue-50 border-blue-200 text-blue-900'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <report.icon className="h-5 w-5 mr-3" />
                      <div>
                        <p className="font-medium">{report.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{report.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Report Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {reports.find(r => r.id === selectedReport)?.name}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {reports.find(r => r.id === selectedReport)?.description}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <EyeIcon className="h-5 w-5 text-gray-600" />
                  </button>
                  <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <ArrowDownTrayIcon className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {renderReportContent()}

              {/* Chart Placeholder */}
              <div className="mt-6 h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Interactive chart would be displayed here</p>
                  <p className="text-sm text-gray-400">Showing {selectedReport} metrics over time</p>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {reports.find(r => r.id === selectedReport)?.metrics.map((metric, index) => (
                  <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">{metric}</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">
                      {Math.floor(Math.random() * 1000) + 100}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
