'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { Application, ApplicationDocument, Property } from '../../lib/types'
import { 
  DocumentTextIcon, 
  EyeIcon, 
  ArrowDownTrayIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PaperClipIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline'

export default function ApplicationsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    fetchApplications()
  }, [user, filter])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const endpoint = user?.role === 'agent' 
        ? '/api/agent/applications' 
        : '/api/applications'

      const response = await fetch(`${endpoint}?status=${filter}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setApplications(data.applications)
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const uploadDocument = async (applicationId: string, file: File, type: string) => {
    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('applicationId', applicationId)
      formData.append('type', type)

      const token = localStorage.getItem('token')
      const response = await fetch('/api/applications/upload-document', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setApplications(prev => prev.map(app => 
          app.id === applicationId 
            ? { ...app, documents: [...app.documents, data.document] }
            : app
        ))
        setShowUploadModal(false)
      }
    } catch (error) {
      console.error('Failed to upload document:', error)
    } finally {
      setUploading(false)
    }
  }

  const updateApplicationStatus = async (applicationId: string, status: string, notes?: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, notes })
      })

      if (response.ok) {
        setApplications(prev => prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: status as any, notes, reviewedAt: new Date().toISOString() }
            : app
        ))
      }
    } catch (error) {
      console.error('Failed to update application:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'withdrawn':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5" />
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5" />
      case 'rejected':
        return <XCircleIcon className="h-5 w-5" />
      case 'withdrawn':
        return <XCircleIcon className="h-5 w-5" />
      default:
        return <DocumentTextIcon className="h-5 w-5" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true
    return app.status === filter
  })

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
              <h1 className="text-3xl font-bold text-gray-900">
                {user?.role === 'agent' ? 'Property Applications' : 'My Applications'}
              </h1>
              <p className="text-gray-600 mt-1">
                {user?.role === 'agent' 
                  ? 'Review and manage applications for your properties'
                  : 'Track your rental property applications'
                }
              </p>
            </div>
            {user?.role === 'tenant' && (
              <button
                onClick={() => router.push('/properties')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Browse Properties
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex space-x-2">
            {['all', 'pending', 'approved', 'rejected', 'withdrawn'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Applications Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredApplications.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
              <p className="text-gray-500">
                {filter === 'all' 
                  ? user?.role === 'agent'
                    ? 'No applications received yet'
                    : 'You haven\'t applied to any properties yet'
                  : `No ${filter} applications`
                }
              </p>
              {user?.role === 'tenant' && filter === 'all' && (
                <button
                  onClick={() => router.push('/properties')}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Start Browsing
                </button>
              )}
            </div>
          ) : (
            filteredApplications.map((application) => (
              <div key={application.id} className="bg-white rounded-lg shadow-md p-6">
                {/* Property Info */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {application.property.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {application.property.address.city}, {application.property.address.state}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{application.property.bedrooms} bed</span>
                      <span>{application.property.bathrooms} bath</span>
                      <span>{application.property.squareFeet} sqft</span>
                      <span className="font-semibold text-blue-600">
                        ${application.property.price.toLocaleString()}/month
                      </span>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(application.status)}`}>
                    {getStatusIcon(application.status)}
                    <span>{application.status.charAt(0).toUpperCase() + application.status.slice(1)}</span>
                  </div>
                </div>

                {/* Applicant Info (Agent View) */}
                {user?.role === 'agent' && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Applicant</h4>
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-gray-200">
                        {application.tenant.profile?.avatar ? (
                          <img
                            src={application.tenant.profile.avatar}
                            alt={application.tenant.name.first}
                            className="h-10 w-10 rounded-full"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-xs text-gray-600">
                              {application.tenant.name.first[0]}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {application.tenant.name.first} {application.tenant.name.last}
                        </p>
                        <p className="text-sm text-gray-500">{application.tenant.email}</p>
                        {application.tenant.profile?.phone && (
                          <p className="text-sm text-gray-500">{application.tenant.profile.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Application Message */}
                {application.message && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Application Message</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {application.message}
                    </p>
                  </div>
                )}

                {/* Documents */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-gray-900">Documents</h4>
                    {user?.role === 'tenant' && (
                      <button
                        onClick={() => {
                          setSelectedApplication(application)
                          setShowUploadModal(true)
                        }}
                        className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
                      >
                        <ArrowUpTrayIcon className="h-4 w-4 mr-1" />
                        Upload
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {application.documents.length === 0 ? (
                      <p className="text-sm text-gray-500">No documents uploaded</p>
                    ) : (
                      application.documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <PaperClipIcon className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-700">{doc.name}</span>
                            <span className="text-xs text-gray-500 capitalize">({doc.type})</span>
                          </div>
                          <div className="flex space-x-2">
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </a>
                            <a
                              href={doc.url}
                              download
                              className="text-gray-600 hover:text-gray-700"
                            >
                              <ArrowDownTrayIcon className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Notes (Agent View) */}
                {user?.role === 'agent' && application.notes && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Notes</h4>
                    <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">
                      {application.notes}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-sm text-gray-500">
                    Applied: {formatDate(application.submittedAt)}
                    {application.reviewedAt && (
                      <span className="ml-4">
                        Reviewed: {formatDate(application.reviewedAt)}
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    {user?.role === 'agent' && application.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateApplicationStatus(application.id, 'approved')}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateApplicationStatus(application.id, 'rejected')}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {user?.role === 'tenant' && application.status === 'pending' && (
                      <button
                        onClick={() => updateApplicationStatus(application.id, 'withdrawn')}
                        className="px-3 py-1 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700"
                      >
                        Withdraw
                      </button>
                    )}
                    <button
                      onClick={() => router.push(`/properties/${application.propertyId}`)}
                      className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
                    >
                      View Property
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Upload Modal */}
        {showUploadModal && selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Document</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  const file = formData.get('file') as File
                  const type = formData.get('type') as string
                  if (file) {
                    uploadDocument(selectedApplication.id, file, type)
                  }
                }}
              >
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Type
                  </label>
                  <select
                    name="type"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select type</option>
                    <option value="id">ID Document</option>
                    <option value="income">Income Proof</option>
                    <option value="employment">Employment Verification</option>
                    <option value="references">References</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File
                  </label>
                  <input
                    type="file"
                    name="file"
                    required
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    )
}
