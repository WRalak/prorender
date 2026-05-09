'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  DocumentTextIcon, 
  UserIcon, 
  BuildingOfficeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'

export default function LeasesPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  // Mock data for leases
  const leases = [
    {
      id: 1,
      propertyTitle: 'Modern Downtown Apartment',
      propertyAddress: '123 Main St, New York, NY',
      tenantName: 'John Smith',
      tenantEmail: 'john.smith@email.com',
      monthlyRent: 2500,
      securityDeposit: 5000,
      startDate: '2024-02-01',
      endDate: '2025-01-31',
      status: 'active',
      nextPaymentDue: '2024-02-01',
      daysUntilDue: 5
    },
    {
      id: 2,
      propertyTitle: 'Cozy Suburban House',
      propertyAddress: '456 Oak Ave, Brooklyn, NY',
      tenantName: 'Sarah Johnson',
      tenantEmail: 'sarah.j@email.com',
      monthlyRent: 3200,
      securityDeposit: 6400,
      startDate: '2024-01-15',
      endDate: '2025-01-14',
      status: 'active',
      nextPaymentDue: '2024-02-15',
      daysUntilDue: 19
    },
    {
      id: 3,
      propertyTitle: 'Luxury Penthouse Suite',
      propertyAddress: '789 Park Ave, Manhattan, NY',
      tenantName: 'Michael Chen',
      tenantEmail: 'm.chen@email.com',
      monthlyRent: 8500,
      securityDeposit: 17000,
      startDate: '2023-06-01',
      endDate: '2024-05-31',
      status: 'expiring',
      nextPaymentDue: '2024-02-01',
      daysUntilDue: 5
    }
  ]

  const filteredLeases = leases.filter(lease => {
    const matchesSearch = lease.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lease.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lease.tenantEmail.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || lease.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'expiring':
        return 'bg-yellow-100 text-yellow-800'
      case 'expired':
        return 'bg-red-100 text-red-800'
      case 'terminated':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-4 w-4" />
      case 'expiring':
        return <ExclamationTriangleIcon className="h-4 w-4" />
      case 'expired':
        return <ClockIcon className="h-4 w-4" />
      default:
        return <DocumentTextIcon className="h-4 w-4" />
    }
  }

  const getPaymentStatusColor = (daysUntilDue) => {
    if (daysUntilDue <= 0) return 'text-red-600'
    if (daysUntilDue <= 7) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lease Management</h1>
            <p className="text-gray-600 mt-1">Manage active leases and rental agreements</p>
          </div>
          <button
            onClick={() => router.push('/leases/new')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <DocumentTextIcon className="h-5 w-5" />
            Create Lease
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search leases..."
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
                <option value="expiring">Expiring Soon</option>
                <option value="expired">Expired</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Leases List */}
        <div className="space-y-6">
          {filteredLeases.map((lease) => (
            <div key={lease.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{lease.tenantName}</h3>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getStatusColor(lease.status)}`}>
                      {getStatusIcon(lease.status)}
                      {lease.status.charAt(0).toUpperCase() + lease.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-1">{lease.tenantEmail}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/leases/${lease.id}`)}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <EyeIcon className="h-5 w-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => router.push(`/leases/${lease.id}/edit`)}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <PencilIcon className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <h4 className="font-medium text-gray-900">{lease.propertyTitle}</h4>
                    <p className="text-sm text-gray-500">{lease.propertyAddress}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Monthly Rent</p>
                    <p className="font-medium text-gray-900">${lease.monthlyRent.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Security Deposit</p>
                    <p className="font-medium text-gray-900">${lease.securityDeposit.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Lease Period</p>
                    <p className="font-medium text-gray-900">{lease.startDate} - {lease.endDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Next Payment Due</p>
                    <p className={`font-medium ${getPaymentStatusColor(lease.daysUntilDue)}`}>
                      {lease.nextPaymentDue} ({lease.daysUntilDue > 0 ? `in ${lease.daysUntilDue} days` : 'Overdue'})
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-4 pt-4 border-t">
                <button
                  onClick={() => router.push(`/leases/${lease.id}/payments`)}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Payments
                </button>
                <button
                  onClick={() => router.push(`/leases/${lease.id}/renew`)}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Renew Lease
                </button>
                <button
                  onClick={() => router.push(`/leases/${lease.id}/terminate`)}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Terminate
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredLeases.length === 0 && (
          <div className="text-center py-12">
            <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No leases found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}
