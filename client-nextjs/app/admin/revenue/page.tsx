'use client'

import { useState } from 'react'
import { 
  CurrencyDollarIcon, 
  CreditCardIcon,
  BanknotesIcon,
  ChartBarIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'

export default function AdminRevenuePage() {
  const [timeRange, setTimeRange] = useState('30days')
  const [selectedMetric, setSelectedMetric] = useState('revenue')

  // Mock revenue data
  const revenueStats = {
    totalRevenue: 245678,
    monthlyGrowth: 12.5,
    activeSubscriptions: 1247,
    commissionEarned: 45678,
    transactionFees: 12345,
    premiumSubscriptions: 89,
    averageRevenuePerUser: 196.89,
    projectedRevenue: 289000
  }

  const monthlyData = [
    { month: 'Jul', revenue: 180000, subscriptions: 1100, commissions: 35000 },
    { month: 'Aug', revenue: 195000, subscriptions: 1150, commissions: 38000 },
    { month: 'Sep', revenue: 210000, subscriptions: 1180, commissions: 40000 },
    { month: 'Oct', revenue: 225000, subscriptions: 1200, commissions: 42000 },
    { month: 'Nov', revenue: 238000, subscriptions: 1220, commissions: 44000 },
    { month: 'Dec', revenue: 245678, subscriptions: 1247, commissions: 45678 }
  ]

  const revenueStreams = [
    {
      name: 'Commission Fees',
      amount: 45678,
      percentage: 18.6,
      color: 'bg-blue-500',
      change: 8.2
    },
    {
      name: 'Subscription Revenue',
      amount: 89000,
      percentage: 36.2,
      color: 'bg-green-500',
      change: 15.3
    },
    {
      name: 'Transaction Fees',
      amount: 12345,
      percentage: 5.0,
      color: 'bg-purple-500',
      change: -2.1
    },
    {
      name: 'Premium Features',
      amount: 67890,
      percentage: 27.6,
      color: 'bg-yellow-500',
      change: 22.7
    },
    {
      name: 'Other Revenue',
      amount: 30765,
      percentage: 12.6,
      color: 'bg-gray-500',
      change: 5.4
    }
  ]

  const recentTransactions = [
    {
      id: 'TRX001',
      type: 'Commission',
      description: 'Property rental commission - Downtown Apartment',
      amount: 750,
      date: '2024-01-29',
      status: 'completed'
    },
    {
      id: 'TRX002',
      type: 'Subscription',
      description: 'Premium agent subscription - Monthly',
      amount: 99,
      date: '2024-01-29',
      status: 'completed'
    },
    {
      id: 'TRX003',
      type: 'Transaction Fee',
      description: 'Payment processing fee',
      amount: 25,
      date: '2024-01-28',
      status: 'completed'
    },
    {
      id: 'TRX004',
      type: 'Commission',
      description: 'Property rental commission - Suburban House',
      amount: 960,
      date: '2024-01-28',
      status: 'pending'
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
            <h1 className="text-3xl font-bold text-gray-900">Revenue Analytics</h1>
            <p className="text-gray-600 mt-1">Track platform revenue and financial performance</p>
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
                <CurrencyDollarIcon className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${revenueStats.totalRevenue.toLocaleString()}</p>
                </div>
              </div>
              <div className={`flex items-center ${getChangeColor(revenueStats.monthlyGrowth)}`}>
                {getChangeIcon(revenueStats.monthlyGrowth)}
                <span className="text-sm font-medium">+{revenueStats.monthlyGrowth}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CreditCardIcon className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                <p className="text-2xl font-bold text-gray-900">{revenueStats.activeSubscriptions.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Premium: {revenueStats.premiumSubscriptions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <BanknotesIcon className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Commission Earned</p>
                <p className="text-2xl font-bold text-gray-900">${revenueStats.commissionEarned.toLocaleString()}</p>
                <p className="text-sm text-gray-500">+ Transaction fees</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Revenue/User</p>
                <p className="text-2xl font-bold text-gray-900">${revenueStats.averageRevenuePerUser}</p>
                <p className="text-sm text-gray-500">Per month</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Revenue Overview</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedMetric('revenue')}
                  className={`px-3 py-1 text-sm rounded-lg ${selectedMetric === 'revenue' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}
                >
                  Revenue
                </button>
                <button
                  onClick={() => setSelectedMetric('subscriptions')}
                  className={`px-3 py-1 text-sm rounded-lg ${selectedMetric === 'subscriptions' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}
                >
                  Subscriptions
                </button>
                <button
                  onClick={() => setSelectedMetric('commissions')}
                  className={`px-3 py-1 text-sm rounded-lg ${selectedMetric === 'commissions' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}
                >
                  Commissions
                </button>
              </div>
            </div>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Interactive revenue chart would be displayed here</p>
                <p className="text-sm text-gray-400">Showing {selectedMetric} trends over time</p>
              </div>
            </div>
          </div>

          {/* Revenue Streams */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Revenue Streams</h2>
            <div className="space-y-4">
              {revenueStreams.map((stream, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <div className={`w-3 h-3 rounded-full ${stream.color} mr-3`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{stream.name}</p>
                      <p className="text-xs text-gray-500">{stream.percentage}% of total</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">${stream.amount.toLocaleString()}</p>
                    <div className={`flex items-center justify-end text-xs ${getChangeColor(stream.change)}`}>
                      {getChangeIcon(stream.change)}
                      {stream.change > 0 ? '+' : ''}{stream.change}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Transactions</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {transaction.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.type}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${transaction.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaction.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
