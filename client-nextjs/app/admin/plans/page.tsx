'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  CreditCardIcon, 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'

export default function AdminPlansPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  // Mock data for subscription plans
  const plans = [
    {
      id: 1,
      name: 'Basic',
      description: 'Perfect for individual tenants',
      price: 0,
      billingCycle: 'monthly',
      features: [
        'Browse properties',
        'Save favorites',
        'Basic search filters',
        'Email support'
      ],
      limits: {
        maxApplications: 5,
        maxSavedSearches: 3,
        maxMessages: 50
      },
      status: 'active',
      popular: false,
      userCount: 523,
      revenue: 0
    },
    {
      id: 2,
      name: 'Premium',
      description: 'Great for serious renters',
      price: 29.99,
      billingCycle: 'monthly',
      features: [
        'Everything in Basic',
        'Unlimited applications',
        'Advanced search filters',
        'Priority support',
        'Property alerts',
        'Virtual tours'
      ],
      limits: {
        maxApplications: -1,
        maxSavedSearches: 20,
        maxMessages: 500
      },
      status: 'active',
      popular: true,
      userCount: 456,
      revenue: 13675.44
    },
    {
      id: 3,
      name: 'Agent Basic',
      description: 'For new real estate agents',
      price: 49.99,
      billingCycle: 'monthly',
      features: [
        'List up to 5 properties',
        'Basic analytics',
        'Lead management',
        'Email support'
      ],
      limits: {
        maxProperties: 5,
        maxPhotos: 10,
        maxListings: 5
      },
      status: 'active',
      popular: false,
      userCount: 89,
      revenue: 4449.11
    },
    {
      id: 4,
      name: 'Agent Pro',
      description: 'For established agents',
      price: 99.99,
      billingCycle: 'monthly',
      features: [
        'Unlimited property listings',
        'Advanced analytics',
        'CRM integration',
        'Priority support',
        'Featured listings',
        'Video tours'
      ],
      limits: {
        maxProperties: -1,
        maxPhotos: 50,
        maxListings: -1
      },
      status: 'active',
      popular: true,
      userCount: 156,
      revenue: 15598.44
    },
    {
      id: 5,
      name: 'Enterprise',
      description: 'For large agencies',
      price: 299.99,
      billingCycle: 'monthly',
      features: [
        'Everything in Agent Pro',
        'White-label options',
        'API access',
        'Dedicated support',
        'Custom integrations'
      ],
      limits: {
        maxProperties: -1,
        maxPhotos: -1,
        maxListings: -1,
        maxAgents: 50
      },
      status: 'inactive',
      popular: false,
      userCount: 0,
      revenue: 0
    }
  ]

  const filteredPlans = plans.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || plan.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'archived':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-4 w-4" />
      case 'inactive':
        return <XCircleIcon className="h-4 w-4" />
      default:
        return <CreditCardIcon className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Plans & Pricing</h1>
            <p className="text-gray-600 mt-1">Manage subscription plans and pricing tiers</p>
          </div>
          <button
            onClick={() => router.push('/admin/plans/new')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Create Plan
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CreditCardIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Plans</p>
                <p className="text-2xl font-bold text-gray-900">{plans.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Plans</p>
                <p className="text-2xl font-bold text-gray-900">
                  {plans.filter(p => p.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <UserGroupIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Subscribers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {plans.reduce((sum, plan) => sum + plan.userCount, 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${plans.reduce((sum, plan) => sum + plan.revenue, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search plans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">{plan.description}</p>
                  </div>
                  <div className="flex gap-2">
                    {plan.popular && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full flex items-center gap-1">
                        <StarIcon className="h-3 w-3" />
                        Popular
                      </span>
                    )}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getStatusColor(plan.status)}`}>
                      {getStatusIcon(plan.status)}
                      {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-gray-900">
                      ${plan.price === 0 ? 'Free' : plan.price.toFixed(2)}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-gray-500 ml-1">/{plan.billingCycle}</span>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Features</h4>
                  <ul className="space-y-2">
                    {plan.features.slice(0, 4).map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                    {plan.features.length > 4 && (
                      <li className="text-sm text-gray-500">
                        +{plan.features.length - 4} more features
                      </li>
                    )}
                  </ul>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Usage</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Users:</span>
                      <span className="font-medium">{plan.userCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Revenue:</span>
                      <span className="font-medium">${plan.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/admin/plans/${plan.id}`)}
                    className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => router.push(`/admin/plans/${plan.id}/edit`)}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <PencilIcon className="h-4 w-4 text-gray-600" />
                  </button>
                  <button
                    className="p-2 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <TrashIcon className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPlans.length === 0 && (
          <div className="text-center py-12">
            <CreditCardIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No plans found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}
