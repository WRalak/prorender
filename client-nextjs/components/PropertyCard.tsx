'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Property } from '../lib/types'
import { HeartIcon, MapPinIcon, HomeIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'

interface PropertyCardProps {
  property: Property
  isSaved?: boolean
  onClick?: () => void
  onSave?: () => void
  showAgent?: boolean
}

export default function PropertyCard({
  property,
  isSaved = false,
  onClick,
  onSave,
  showAgent = true,
}: PropertyCardProps) {
  const [imageError, setImageError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800'
      case 'rented':
        return 'bg-gray-100 text-gray-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'maintenance':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSave?.()
  }

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className="relative h-48">
        {!imageError && property.images[0] ? (
          <Image
            src={property.images[0]}
            alt={property.title}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No Image</span>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(property.status)}`}>
            {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
          </span>
        </div>

        {/* Save Button */}
        {onSave && (
          <div className="absolute top-2 right-2">
            <button
              onClick={handleSaveClick}
              className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
            >
              {isSaved ? (
                <HeartSolidIcon className="h-5 w-5 text-red-500" />
              ) : (
                <HeartIcon className="h-5 w-5 text-gray-600 hover:text-red-500" />
              )}
            </button>
          </div>
        )}

        {/* Featured Badge */}
        {property.featured && (
          <div className="absolute bottom-2 left-2">
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-400 text-yellow-900">
              Featured
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title and Price */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
            {property.title}
          </h3>
          <div className="text-right">
            <div className="text-xl font-bold text-blue-600">
              {formatPrice(property.price, property.currency)}
            </div>
            <div className="text-xs text-gray-500">/month</div>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center text-gray-600 text-sm mb-3">
          <MapPinIcon className="h-4 w-4 mr-1" />
          <span className="line-clamp-1">
            {property.address.city}, {property.address.state}
          </span>
        </div>

        {/* Property Details */}
        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center">
            <HomeIcon className="h-4 w-4 mr-1" />
            <span>{property.bedrooms} bed</span>
          </div>
          <div className="flex items-center">
            <BuildingOfficeIcon className="h-4 w-4 mr-1" />
            <span>{property.bathrooms} bath</span>
          </div>
          <div className="flex items-center">
            <span>{property.squareFeet.toLocaleString()} sqft</span>
          </div>
        </div>

        {/* Amenities */}
        {property.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {property.amenities.slice(0, 3).map((amenity, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
              >
                {amenity}
              </span>
            ))}
            {property.amenities.length > 3 && (
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                +{property.amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Agent Info */}
        {showAgent && property.agent && (
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-gray-200 mr-2">
                {property.agent.user.profile?.avatar ? (
                  <Image
                    src={property.agent.user.profile.avatar}
                    alt={property.agent.user.name.first}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-xs text-gray-600">
                      {property.agent.user.name.first[0]}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {property.agent.user.name.first} {property.agent.user.name.last}
                </div>
                <div className="text-xs text-gray-500">
                  {property.agent.rating.toFixed(1)} ⭐ ({property.agent.reviews.length} reviews)
                </div>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                // Handle message agent
              }}
              className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100"
            >
              Message
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
