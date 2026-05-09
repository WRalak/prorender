'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  CalendarIcon, 
  ClockIcon, 
  UserIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  PhoneIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'

export default function AgentSchedulePage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  // Mock data for viewings
  const viewings = [
    {
      id: 1,
      propertyTitle: 'Modern Downtown Apartment',
      propertyAddress: '123 Main St, New York, NY',
      clientName: 'John Smith',
      clientEmail: 'john.smith@email.com',
      clientPhone: '+1 555-0123',
      date: '2024-01-30',
      time: '14:00',
      duration: 60,
      status: 'confirmed',
      notes: 'Client interested in the modern amenities and city views',
      requestedDate: '2024-01-25'
    },
    {
      id: 2,
      propertyTitle: 'Cozy Suburban House',
      propertyAddress: '456 Oak Ave, Brooklyn, NY',
      clientName: 'Sarah Johnson',
      clientEmail: 'sarah.j@email.com',
      clientPhone: '+1 555-0124',
      date: '2024-01-30',
      time: '16:30',
      duration: 45,
      status: 'pending',
      notes: 'Family looking for good school district',
      requestedDate: '2024-01-26'
    },
    {
      id: 3,
      propertyTitle: 'Luxury Penthouse Suite',
      propertyAddress: '789 Park Ave, Manhattan, NY',
      clientName: 'Michael Chen',
      clientEmail: 'm.chen@email.com',
      clientPhone: '+1 555-0125',
      date: '2024-01-31',
      time: '10:00',
      duration: 90,
      status: 'confirmed',
      notes: 'High-net-worth individual, interested in premium features',
      requestedDate: '2024-01-24'
    }
  ]

  const filteredViewings = viewings.filter(viewing => {
    const matchesSearch = viewing.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         viewing.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         viewing.clientEmail.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || viewing.status === filterStatus
    const matchesDate = viewing.date === selectedDate
    return matchesSearch && matchesFilter && matchesDate
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircleIcon className="h-4 w-4" />
      case 'pending':
        return <ClockIcon className="h-4 w-4" />
      case 'cancelled':
        return <XCircleIcon className="h-4 w-4" />
      default:
        return <CalendarIcon className="h-4 w-4" />
    }
  }

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Schedule Viewings</h1>
            <p className="text-gray-600 mt-1">Manage property viewing appointments</p>
          </div>
          <button
            onClick={() => router.push('/agent/schedule/new')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Schedule Viewing
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar and Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Date</h3>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Search & Filter</h3>
              <div className="space-y-4">
                <div>
                  <div className="relative">
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search viewings..."
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
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Slots</h3>
              <div className="grid grid-cols-2 gap-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => router.push(`/agent/schedule/new?time=${slot}&date=${selectedDate}`)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Viewings List */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {filteredViewings.map((viewing) => (
                <div key={viewing.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{viewing.clientName}</h3>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getStatusColor(viewing.status)}`}>
                          {getStatusIcon(viewing.status)}
                          {viewing.status.charAt(0).toUpperCase() + viewing.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-1">{viewing.clientEmail} • {viewing.clientPhone}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" />
                          {viewing.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <ClockIcon className="h-4 w-4" />
                          {viewing.time} ({viewing.duration} min)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <h4 className="font-medium text-gray-900">{viewing.propertyTitle}</h4>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <MapPinIcon className="h-4 w-4" />
                          {viewing.propertyAddress}
                        </p>
                      </div>
                    </div>

                    {viewing.notes && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Notes:</span> {viewing.notes}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/agent/schedule/${viewing.id}`)}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        View Details
                      </button>
                      {viewing.status === 'pending' && (
                        <>
                          <button
                            onClick={() => router.push(`/agent/schedule/${viewing.id}/confirm`)}
                            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => router.push(`/agent/schedule/${viewing.id}/cancel`)}
                            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-sm"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {viewing.status === 'confirmed' && (
                        <button
                          onClick={() => router.push(`/agent/schedule/${viewing.id}/complete`)}
                          className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredViewings.length === 0 && (
              <div className="text-center py-12">
                <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No viewings scheduled</h3>
                <p className="text-gray-500">Try selecting a different date or adjusting filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
