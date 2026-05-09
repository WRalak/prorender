'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  DocumentTextIcon, 
  UserIcon, 
  BuildingOfficeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'

export default function AgentApplicationsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  // Mock data for applications
  const applications = [
    {
      id: 1,
      propertyTitle: 'Modern Downtown Apartment',
      propertyAddress: '123 Main St, New York, NY',
      applicantName: 'John Smith',
      applicantEmail: 'john.smith@email.com',
      applicantPhone: '+1 555-0123',
      status: 'pending',
      submittedDate: '2024-01-25',
      income: 75000,
      creditScore: 720,
      employmentStatus: 'Employed',
      desiredMoveIn: '2024-02-15'
    },
    {
      id: 2,
      propertyTitle: 'Cozy Suburban House',
      propertyAddress: '456 Oak Ave, Brooklyn, NY',
      applicantName: 'Sarah Johnson',
      applicantEmail: 'sarah.j@email.com',
      applicantPhone: '+1 555-0124',
      status: 'approved',
      submittedDate: '2024-01-20',
      income: 95000,
      creditScore: 780,
      employmentStatus: 'Employed',
      desiredMoveIn: '2024-02-01'
    },
    {
      id: 3,
      propertyTitle: 'Luxury Penthouse Suite',
      propertyAddress: '789 Park Ave, Manhattan, NY',
      applicantName: 'Michael Chen',
      applicantEmail: 'm.chen@email.com',
      applicantPhone: '+1 555-0125',
      status: 'rejected',
      submittedDate: '2024-01-18',
      income: 120000,
      creditScore: 680,
      employmentStatus: 'Self-Employed',
      desiredMoveIn: '2024-03-01'
    }
  ]

  const filteredApplications = applications.filter(application => {
    const matchesSearch = application.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         application.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         application.applicantEmail.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || application.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-4 w-4" />
      case 'approved':
        return <CheckCircleIcon className="h-4 w-4" />
      case 'rejected':
        return <XCircleIcon className="h-4 w-4" />
      default:
        return <DocumentTextIcon className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Rental Applications</h1>
            <p className="text-gray-600 mt-1">Review and manage property applications</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search applications..."
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
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-6">
          {filteredApplications.map((application) => (
            <div key={application.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{application.applicantName}</h3>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getStatusColor(application.status)}`}>
                      {getStatusIcon(application.status)}
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-1">{application.applicantEmail} • {application.applicantPhone}</p>
                  <p className="text-sm text-gray-500">Applied on {application.submittedDate}</p>
                </div>
                <button
                  onClick={() => router.push(`/agent/applications/${application.id}`)}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <EyeIcon className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <h4 className="font-medium text-gray-900">{application.propertyTitle}</h4>
                    <p className="text-sm text-gray-500">{application.propertyAddress}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Annual Income</p>
                    <p className="font-medium text-gray-900">${application.income.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Credit Score</p>
                    <p className="font-medium text-gray-900">{application.creditScore}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Employment</p>
                    <p className="font-medium text-gray-900">{application.employmentStatus}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Desired Move-in</p>
                    <p className="font-medium text-gray-900">{application.desiredMoveIn}</p>
                  </div>
                </div>
              </div>

              {application.status === 'pending' && (
                <div className="flex gap-3 mt-4 pt-4 border-t">
                  <button
                    onClick={() => router.push(`/agent/applications/${application.id}/approve`)}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Approve Application
                  </button>
                  <button
                    onClick={() => router.push(`/agent/applications/${application.id}/reject`)}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Reject Application
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredApplications.length === 0 && (
          <div className="text-center py-12">
            <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}
