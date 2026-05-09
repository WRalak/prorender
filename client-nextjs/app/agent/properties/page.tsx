'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  BuildingOfficeIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'

export default function AgentPropertiesPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  // Mock data for agent properties
  const properties = [
    {
      id: 1,
      title: 'Modern Downtown Apartment',
      address: '123 Main St, New York, NY',
      type: 'Apartment',
      bedrooms: 2,
      bathrooms: 2,
      rent: 2500,
      status: 'available',
      views: 145,
      applications: 8,
      listedDate: '2024-01-15'
    },
    {
      id: 2,
      title: 'Cozy Suburban House',
      address: '456 Oak Ave, Brooklyn, NY',
      type: 'House',
      bedrooms: 3,
      bathrooms: 2,
      rent: 3200,
      status: 'rented',
      views: 89,
      applications: 12,
      listedDate: '2024-01-10'
    },
    {
      id: 3,
      title: 'Luxury Penthouse Suite',
      address: '789 Park Ave, Manhattan, NY',
      type: 'Penthouse',
      bedrooms: 4,
      bathrooms: 3,
      rent: 8500,
      status: 'available',
      views: 234,
      applications: 5,
      listedDate: '2024-01-20'
    }
  ]

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.address.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || property.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800'
      case 'rented':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
            <p className="text-gray-600 mt-1">Manage your property listings</p>
          </div>
          <button
            onClick={() => router.push('/agent/properties/new')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Add Property
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
                <option value="available">Available</option>
                <option value="rented">Rented</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <BuildingOfficeIcon className="h-16 w-16 text-gray-400" />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{property.title}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(property.status)}`}>
                    {property.status}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4">{property.address}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span>{property.bedrooms} beds</span>
                  <span>{property.bathrooms} baths</span>
                  <span>{property.type}</span>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-gray-900">${property.rent}/mo</span>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <EyeIcon className="h-4 w-4" />
                    {property.views} views
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">{property.applications} applications</span>
                  <span className="text-sm text-gray-500">Listed {property.listedDate}</span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/agent/properties/${property.id}`)}
                    className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => router.push(`/agent/properties/${property.id}/edit`)}
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

        {filteredProperties.length === 0 && (
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
