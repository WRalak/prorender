'use client'

import { useState } from 'react'
import { PROPERTY_TYPES, AMENITIES } from '../lib/constants'

interface PropertyFiltersProps {
  filters: any
  onFilterChange: (filters: any) => void
}

export default function PropertyFilters({ filters, onFilterChange }: PropertyFiltersProps) {
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    price: false,
    amenities: false,
    location: false,
  })

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof expandedSections],
    }))
  }

  const handleInputChange = (field: string, value: any) => {
    onFilterChange({ [field]: value })
  }

  const handleAmenityToggle = (amenity: string) => {
    const currentAmenities = filters.amenities || []
    const newAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter((a: string) => a !== amenity)
      : [...currentAmenities, amenity]
    
    onFilterChange({ amenities: newAmenities })
  }

  const clearFilters = () => {
    onFilterChange({
      search: '',
      type: '',
      status: 'available',
      priceMin: '',
      priceMax: '',
      bedrooms: '',
      bathrooms: '',
      amenities: [],
      location: '',
      radius: 5,
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        <button
          onClick={clearFilters}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Clear all
        </button>
      </div>

      {/* Basic Filters */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('basic')}
          className="flex justify-between items-center w-full mb-4"
        >
          <h3 className="text-sm font-medium text-gray-900">Basic</h3>
          <span className="text-gray-400">
            {expandedSections.basic ? '−' : '+'}
          </span>
        </button>

        {expandedSections.basic && (
          <div className="space-y-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                value={filters.search || ''}
                onChange={(e) => handleInputChange('search', e.target.value)}
                placeholder="Keywords, location..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Type
              </label>
              <select
                value={filters.type || ''}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                {PROPERTY_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Bedrooms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bedrooms
              </label>
              <select
                value={filters.bedrooms || ''}
                onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
              </select>
            </div>

            {/* Bathrooms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bathrooms
              </label>
              <select
                value={filters.bathrooms || ''}
                onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('price')}
          className="flex justify-between items-center w-full mb-4"
        >
          <h3 className="text-sm font-medium text-gray-900">Price Range</h3>
          <span className="text-gray-400">
            {expandedSections.price ? '−' : '+'}
          </span>
        </button>

        {expandedSections.price && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Price
              </label>
              <input
                type="number"
                value={filters.priceMin || ''}
                onChange={(e) => handleInputChange('priceMin', e.target.value)}
                placeholder="No minimum"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Price
              </label>
              <input
                type="number"
                value={filters.priceMax || ''}
                onChange={(e) => handleInputChange('priceMax', e.target.value)}
                placeholder="No maximum"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Amenities */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('amenities')}
          className="flex justify-between items-center w-full mb-4"
        >
          <h3 className="text-sm font-medium text-gray-900">Amenities</h3>
          <span className="text-gray-400">
            {expandedSections.amenities ? '−' : '+'}
          </span>
        </button>

        {expandedSections.amenities && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {AMENITIES.map((amenity) => (
              <label key={amenity} className="flex items-center">
                <input
                  type="checkbox"
                  checked={(filters.amenities || []).includes(amenity)}
                  onChange={() => handleAmenityToggle(amenity)}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{amenity}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Location */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('location')}
          className="flex justify-between items-center w-full mb-4"
        >
          <h3 className="text-sm font-medium text-gray-900">Location</h3>
          <span className="text-gray-400">
            {expandedSections.location ? '−' : '+'}
          </span>
        </button>

        {expandedSections.location && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={filters.location || ''}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="City, neighborhood..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Radius (km)
              </label>
              <select
                value={filters.radius || 5}
                onChange={(e) => handleInputChange('radius', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>1 km</option>
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={25}>25 km</option>
                <option value={50}>50 km</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Apply Filters Button */}
      <button
        onClick={() => onFilterChange(filters)}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
      >
        Apply Filters
      </button>
    </div>
  )
}
