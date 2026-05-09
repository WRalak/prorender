'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { MaintenanceRequest } from '../../lib/types'
import { 
  WrenchScrewdriverIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  PhotoIcon,
  PlusIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'
import { MAINTENANCE_CATEGORIES, MAINTENANCE_PRIORITY } from '../../lib/constants'

export default function MaintenancePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    propertyId: '',
  })
  const [images, setImages] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    fetchMaintenanceRequests()
  }, [user, filter])

  const fetchMaintenanceRequests = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const endpoint = user?.role === 'agent' 
        ? '/api/agent/maintenance' 
        : '/api/maintenance'

      const response = await fetch(`${endpoint}?status=${filter}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setRequests(data.requests)
      }
    } catch (error) {
      console.error('Failed to fetch maintenance requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const createMaintenanceRequest = async () => {
    try {
      setSubmitting(true)
      const formDataToSend = new FormData()
      
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value)
      })
      
      images.forEach((image, index) => {
        formDataToSend.append(`images`, image)
      })

      const token = localStorage.getItem('token')
      const response = await fetch('/api/maintenance', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      })

      if (response.ok) {
        const data = await response.json()
        setRequests(prev => [data.request, ...prev])
        setShowCreateModal(false)
        resetForm()
      }
    } catch (error) {
      console.error('Failed to create maintenance request:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const updateRequestStatus = async (requestId: string, status: string, notes?: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/maintenance/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, notes })
      })

      if (response.ok) {
        setRequests(prev => prev.map(req => 
          req.id === requestId 
            ? { ...req, status: status as any, notes, completedAt: status === 'completed' ? new Date().toISOString() : undefined }
            : req
        ))
      }
    } catch (error) {
      console.error('Failed to update request:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      priority: 'medium',
      propertyId: '',
    })
    setImages([])
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setImages(prev => [...prev, ...files].slice(0, 5 - prev.length)) // Max 5 images
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <ClockIcon className="h-5 w-5" />
      case 'in_progress':
        return <WrenchScrewdriverIcon className="h-5 w-5" />
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5" />
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5" />
      default:
        return <ClockIcon className="h-5 w-5" />
    }
  }

  const getPriorityColor = (priority: string) => {
    const priorityConfig = MAINTENANCE_PRIORITY.find(p => p.value === priority)
    return priorityConfig?.color || 'gray'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true
    return request.status === filter
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
              <h1 className="text-3xl font-bold text-gray-900">Maintenance Requests</h1>
              <p className="text-gray-600 mt-1">
                {user?.role === 'agent' 
                  ? 'Manage maintenance requests for your properties'
                  : 'Submit and track maintenance requests'
                }
              </p>
            </div>
            {user?.role === 'tenant' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                New Request
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex space-x-2">
            {['all', 'open', 'in_progress', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Requests Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRequests.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <WrenchScrewdriverIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No maintenance requests</h3>
              <p className="text-gray-500">
                {filter === 'all' 
                  ? user?.role === 'tenant'
                    ? 'No maintenance requests submitted yet'
                    : 'No maintenance requests received yet'
                  : `No ${filter.replace('_', ' ')} requests`
                }
              </p>
              {user?.role === 'tenant' && filter === 'all' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Submit First Request
                </button>
              )}
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow-md p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {request.title}
                    </h3>
                    <div className="flex items-center space-x-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1">{request.status.replace('_', ' ')}</span>
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${getPriorityColor(request.priority)}-100 text-${getPriorityColor(request.priority)}-800`}>
                        {request.priority}
                      </span>
                      <span className="text-gray-500">
                        {request.category}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Property Info */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Property</h4>
                  <p className="text-sm text-gray-600">{request.property.title}</p>
                  <p className="text-sm text-gray-500">
                    {request.property.address.city}, {request.property.address.state}
                  </p>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {request.description}
                  </p>
                </div>

                {/* Images */}
                {request.images.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Photos</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {request.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Maintenance photo ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg cursor-pointer"
                            onClick={() => setSelectedRequest(request)}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-lg flex items-center justify-center transition-opacity">
                            <EyeIcon className="h-5 w-5 text-white opacity-0 group-hover:opacity-100" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes (Agent View) */}
                {user?.role === 'agent' && request.notes && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Notes</h4>
                    <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">
                      {request.notes}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-sm text-gray-500">
                    Submitted: {formatDate(request.createdAt)}
                    {request.completedAt && (
                      <span className="ml-4">
                        Completed: {formatDate(request.completedAt)}
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    {user?.role === 'agent' && request.status === 'open' && (
                      <>
                        <button
                          onClick={() => updateRequestStatus(request.id, 'in_progress')}
                          className="px-3 py-1 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700"
                        >
                          Start Work
                        </button>
                        <button
                          onClick={() => updateRequestStatus(request.id, 'completed')}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                        >
                          Mark Complete
                        </button>
                      </>
                    )}
                    {user?.role === 'tenant' && request.status === 'completed' && (
                      <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                        Confirm Complete
                      </button>
                    )}
                    <button
                      onClick={() => router.push(`/messages?property=${request.propertyId}`)}
                      className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 flex items-center"
                    >
                      <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                      Message
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create Request Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Maintenance Request</h3>
              <form onSubmit={(e) => {
                e.preventDefault()
                createMaintenanceRequest()
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property
                    </label>
                    <select
                      value={formData.propertyId}
                      onChange={(e) => setFormData({...formData, propertyId: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select property</option>
                      {/* This would be populated with user's rented properties */}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select category</option>
                      {MAINTENANCE_CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {MAINTENANCE_PRIORITY.map((priority) => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Photos (Max 5)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {images.length > 0 && (
                    <div className="mt-2 grid grid-cols-5 gap-2">
                      {images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-16 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false)
                      resetForm()
                    }}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Image Preview Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-4 max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedRequest.title}
                </h3>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedRequest.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Maintenance photo ${index + 1}`}
                    className="w-full rounded-lg"
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    )
}
