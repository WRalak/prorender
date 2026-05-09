'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  BuildingOfficeIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  PencilIcon,
  MapPinIcon,
  UserIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'

export default function AdminSpacesPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  // Mock data for spaces/properties awaiting approval
  const spaces = [
    {
      id: 1,
      title: 'Modern Downtown Apartment',
      address: '123 Main St, New York, NY',
      type: 'Apartment',
      bedrooms: 2,
      bathrooms: 2,
      rent: 2500,
      ownerName: 'John Smith',
      ownerEmail: 'john.smith@email.com',
      status: 'pending',
      submittedDate: '2024-01-25',
      lastUpdated: '2024-01-26',
      images: 8,
      description: 'Beautiful modern apartment with city views',
      amenities: ['Gym', 'Parking', 'Pool', 'Security']
    },
    {
      id: 2,
      title: 'Cozy Suburban House',
      address: '456 Oak Ave, Brooklyn, NY',
      type: 'House',
      bedrooms: 3,
      bathrooms: 2,
      rent: 3200,
      ownerName: 'Sarah Johnson',
      ownerEmail: 'sarah.j@email.com',
      status: 'approved',
      submittedDate: '2024-01-20',
      lastUpdated: '2024-01-22',
      images: 12,
      description: 'Perfect family home in quiet neighborhood',
      amenities: ['Garden', 'Garage', 'Storage']
    },
    {
      id: 3,
      title: 'Luxury Penthouse Suite',
      address: '789 Park Ave, Manhattan, NY',
      type: 'Penthouse',
      bedrooms: 4,
      bathrooms: 3,
      rent: 8500,
      ownerName: 'Michael Chen',
      ownerEmail: 'm.chen@email.com',
      status: 'rejected',
      submittedDate: '2024-01-18',
      lastUpdated: '2024-01-19',
      images: 15,
      description: 'Ultra-luxury penthouse with panoramic views',
      amenities: ['Concierge', 'Gym', 'Pool', 'Spa', 'Wine Cellar']
    }
  ]

  const filteredSpaces = spaces.filter(space => {
    const matchesSearch = space.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         space.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         space.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || space.status === filterStatus
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
        return <BuildingOfficeIcon className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Space Approval</h1>
            <p className="text-gray-600 mt-1">Review and approve property listings</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {spaces.filter(s => s.status === 'pending').length}
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
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {spaces.filter(s => s.status === 'approved').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">
                  {spaces.filter(s => s.status === 'rejected').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{spaces.length}</p>
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
                  placeholder="Search properties..."
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

        {/* Spaces List */}
        <div className="space-y-6">
          {filteredSpaces.map((space) => (
            <div key={space.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{space.title}</h3>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getStatusColor(space.status)}`}>
                      {getStatusIcon(space.status)}
                      {space.status.charAt(0).toUpperCase() + space.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <span className="flex items-center gap-1">
                      <MapPinIcon className="h-4 w-4" />
                      {space.address}
                    </span>
                    <span>{space.type}</span>
                    <span>{space.bedrooms} beds • {space.bathrooms} baths</span>
                    <span className="font-semibold text-gray-900">${space.rent}/mo</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{space.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <UserIcon className="h-4 w-4" />
                      {space.ownerName}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      Submitted {space.submittedDate}
                    </span>
                    <span>{space.images} images</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/admin/spaces/${space.id}`)}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <EyeIcon className="h-5 w-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => router.push(`/admin/spaces/${space.id}/edit`)}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <PencilIcon className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  {space.amenities.map((amenity, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>

                {space.status === 'pending' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => router.push(`/admin/spaces/${space.id}/approve`)}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Approve Listing
                    </button>
                    <button
                      onClick={() => router.push(`/admin/spaces/${space.id}/reject`)}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Reject Listing
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredSpaces.length === 0 && (
          <div className="text-center py-12">
            <BuildingOfficeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}
