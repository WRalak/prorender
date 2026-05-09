'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  FlagIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  TrashIcon,
  UserIcon,
  BuildingOfficeIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

export default function AdminModerationPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  // Mock data for reported content
  const reports = [
    {
      id: 1,
      type: 'property',
      title: 'Modern Downtown Apartment',
      reportedBy: 'John Doe',
      reporterEmail: 'john.doe@email.com',
      reason: 'Misleading information about property size',
      description: 'The property is listed as 1200 sq ft but actual size is much smaller',
      status: 'pending',
      reportedDate: '2024-01-28',
      targetId: 123,
      targetOwner: 'Sarah Johnson'
    },
    {
      id: 2,
      type: 'review',
      title: 'Fake review for Cozy Suburban House',
      reportedBy: 'Jane Smith',
      reporterEmail: 'jane.smith@email.com',
      reason: 'Suspicious review activity',
      description: 'Multiple 5-star reviews from the same IP address within minutes',
      status: 'under_review',
      reportedDate: '2024-01-27',
      targetId: 456,
      targetOwner: 'Michael Chen'
    },
    {
      id: 3,
      type: 'user',
      title: 'Inappropriate behavior',
      reportedBy: 'Admin System',
      reporterEmail: 'admin@proprent.com',
      reason: 'Harassment and spam messages',
      description: 'User sending multiple spam messages to other users',
      status: 'resolved',
      reportedDate: '2024-01-26',
      targetId: 789,
      targetOwner: 'Robert Wilson'
    },
    {
      id: 4,
      type: 'message',
      title: 'Scam attempt',
      reportedBy: 'Emily Davis',
      reporterEmail: 'emily.d@email.com',
      reason: 'Request for payment outside platform',
      description: 'User asking for direct payment to avoid platform fees',
      status: 'pending',
      reportedDate: '2024-01-29',
      targetId: 101,
      targetOwner: 'Unknown User'
    }
  ]

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reportedBy.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || report.type === filterType
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const getTypeIcon = (type) => {
    switch (type) {
      case 'property':
        return <BuildingOfficeIcon className="h-5 w-5" />
      case 'review':
        return <DocumentTextIcon className="h-5 w-5" />
      case 'user':
        return <UserIcon className="h-5 w-5" />
      case 'message':
        return <ChatBubbleLeftRightIcon className="h-5 w-5" />
      default:
        return <FlagIcon className="h-5 w-5" />
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'property':
        return 'bg-blue-100 text-blue-800'
      case 'review':
        return 'bg-purple-100 text-purple-800'
      case 'user':
        return 'bg-green-100 text-green-800'
      case 'message':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-red-100 text-red-800'
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800'
      case 'resolved':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ExclamationTriangleIcon className="h-4 w-4" />
      case 'under_review':
        return <EyeIcon className="h-4 w-4" />
      case 'resolved':
        return <CheckCircleIcon className="h-4 w-4" />
      default:
        return <FlagIcon className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Content Moderation</h1>
            <p className="text-gray-600 mt-1">Review and moderate reported content</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reports.filter(r => r.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <EyeIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Under Review</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reports.filter(r => r.status === 'under_review').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reports.filter(r => r.status === 'resolved').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FlagIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
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
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="property">Property</option>
                  <option value="review">Review</option>
                  <option value="user">User</option>
                  <option value="message">Message</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-6">
          {filteredReports.map((report) => (
            <div key={report.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getTypeColor(report.type)}`}>
                      {getTypeIcon(report.type)}
                      {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                    </span>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getStatusColor(report.status)}`}>
                      {getStatusIcon(report.status)}
                      {report.status.replace('_', ' ').charAt(0).toUpperCase() + report.status.replace('_', ' ').slice(1)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span>Reported by: {report.reportedBy}</span>
                    <span>({report.reporterEmail})</span>
                    <span>on {report.reportedDate}</span>
                  </div>
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Reason: {report.reason}</p>
                    <p className="text-sm text-gray-600">{report.description}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    Target: {report.targetOwner} (ID: {report.targetId})
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/admin/moderation/${report.id}`)}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <EyeIcon className="h-5 w-5 text-gray-600" />
                  </button>
                  {report.status !== 'resolved' && (
                    <button
                      className="p-2 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <TrashIcon className="h-5 w-5 text-red-600" />
                    </button>
                  )}
                </div>
              </div>

              {report.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => router.push(`/admin/moderation/${report.id}/review`)}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Start Review
                  </button>
                  <button
                    onClick={() => router.push(`/admin/moderation/${report.id}/resolve`)}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Mark Resolved
                  </button>
                  <button
                    onClick={() => router.push(`/admin/moderation/${report.id}/dismiss`)}
                    className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Dismiss Report
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredReports.length === 0 && (
          <div className="text-center py-12">
            <FlagIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}
