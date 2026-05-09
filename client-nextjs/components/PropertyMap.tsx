'use client'

import { useEffect, useRef, useState } from 'react'
import { Property } from '../lib/types'
import PropertyCard from './PropertyCard'
import { HeartIcon, MapPinIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'

interface PropertyMapProps {
  properties: Property[]
  onPropertyClick: (propertyId: string) => void
  onPropertySave: (propertyId: string) => void
  savedProperties: string[]
}

export default function PropertyMap({
  properties,
  onPropertyClick,
  onPropertySave,
  savedProperties,
}: PropertyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [markers, setMarkers] = useState<any[]>([])
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [mapboxgl, setMapboxgl] = useState<any>(null)

  useEffect(() => {
    // Load Mapbox GL JS
    const loadMapbox = async () => {
      if (typeof window !== 'undefined' && !window.mapboxgl) {
        const script = document.createElement('script')
        script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js'
        script.onload = () => {
          initializeMap()
        }
        document.head.appendChild(script)

        // Load CSS
        const link = document.createElement('link')
        link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css'
        link.rel = 'stylesheet'
        document.head.appendChild(link)
      } else if (window.mapboxgl) {
        initializeMap()
      }
    }

    loadMapbox()
  }, [])

  const initializeMap = () => {
    if (!mapContainer.current || !window.mapboxgl) return

    window.mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''

    const mapInstance = new window.mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-1.2921, 36.8219], // Nairobi
      zoom: 12,
    })

    setMap(mapInstance)
    setMapboxgl(window.mapboxgl)

    // Add navigation control
    mapInstance.addControl(new window.mapboxgl.NavigationControl(), 'top-right')

    // Add markers when map loads
    mapInstance.on('load', () => {
      addMarkers(mapInstance)
    })
  }

  const addMarkers = (mapInstance: any) => {
    // Clear existing markers
    markers.forEach(marker => marker.remove())
    setMarkers([])

    // Create bounds to fit all markers
    const bounds = new window.mapboxgl.LngLatBounds()

    properties.forEach((property) => {
      const { lng, lat } = property.coordinates
      
      // Create custom marker element
      const markerElement = document.createElement('div')
      markerElement.className = 'custom-marker'
      markerElement.innerHTML = `
        <div class="relative">
          <div class="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold shadow-lg hover:bg-blue-700 transition-colors cursor-pointer">
            ${property.price.toLocaleString()}
          </div>
          ${property.featured ? '<div class="absolute -top-1 -right-1 bg-yellow-400 rounded-full w-3 h-3"></div>' : ''}
        </div>
      `

      const marker = new window.mapboxgl.Marker(markerElement)
        .setLngLat([lng, lat])
        .addTo(mapInstance)

      marker.getElement().addEventListener('click', () => {
        setSelectedProperty(property)
        // Center map on property
        mapInstance.flyTo({
          center: [lng, lat],
          zoom: 15,
        })
      })

      bounds.extend([lng, lat])
      markers.push(marker)
    })

    // Fit map to show all markers
    if (!bounds.isEmpty()) {
      mapInstance.fitBounds(bounds, { padding: 50 })
    }
  }

  useEffect(() => {
    if (map && properties.length > 0) {
      addMarkers(map)
    }
  }, [properties, map])

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="flex h-full">
      {/* Map */}
      <div className="flex-1 relative">
        <div ref={mapContainer} className="w-full h-full" />
        
        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3">
          <div className="text-xs font-medium text-gray-700 mb-2">Price Range</div>
          <div className="space-y-1">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
              <span className="text-xs text-gray-600">Available</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
              <span className="text-xs text-gray-600">Rented</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
              <span className="text-xs text-gray-600">Featured</span>
            </div>
          </div>
        </div>
      </div>

      {/* Property Details Sidebar */}
      {selectedProperty && (
        <div className="w-96 bg-white shadow-lg overflow-y-auto">
          <div className="p-4 border-b">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedProperty.title}
                </h3>
                <div className="flex items-center text-gray-600 text-sm mt-1">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  <span>
                    {selectedProperty.address.city}, {selectedProperty.address.state}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedProperty(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </div>

          <div className="p-4">
            {/* Price */}
            <div className="text-2xl font-bold text-blue-600 mb-4">
              {formatPrice(selectedProperty.price, selectedProperty.currency)}
              <span className="text-sm text-gray-500">/month</span>
            </div>

            {/* Images */}
            <div className="mb-4">
              <div className="h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                {selectedProperty.images[0] ? (
                  <img
                    src={selectedProperty.images[0]}
                    alt={selectedProperty.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <span className="text-gray-400">No Image</span>
                )}
              </div>
            </div>

            {/* Property Details */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {selectedProperty.bedrooms}
                </div>
                <div className="text-xs text-gray-500">Bedrooms</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {selectedProperty.bathrooms}
                </div>
                <div className="text-xs text-gray-500">Bathrooms</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {selectedProperty.squareFeet.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">Sq Ft</div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
              <p className="text-sm text-gray-600 line-clamp-3">
                {selectedProperty.description}
              </p>
            </div>

            {/* Amenities */}
            {selectedProperty.amenities.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Amenities</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedProperty.amenities.slice(0, 6).map((amenity, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                    >
                      {amenity}
                    </span>
                  ))}
                  {selectedProperty.amenities.length > 6 && (
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                      +{selectedProperty.amenities.length - 6} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={() => onPropertyClick(selectedProperty.id)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                View Details
              </button>
              <button
                onClick={() => onPropertySave(selectedProperty.id)}
                className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                {savedProperties.includes(selectedProperty.id) ? (
                  <HeartSolidIcon className="h-5 w-5 text-red-500 mr-2" />
                ) : (
                  <HeartIcon className="h-5 w-5 text-gray-600 mr-2" />
                )}
                {savedProperties.includes(selectedProperty.id) ? 'Saved' : 'Save Property'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Add Mapbox GL types to window
declare global {
  interface Window {
    mapboxgl: any
  }
}
