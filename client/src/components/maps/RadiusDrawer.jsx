import React, { useState, useEffect } from 'react';
import { MapPinIcon, XMarkIcon } from '@heroicons/react/24/outline';

const RadiusDrawer = ({ isOpen, onClose, center, radius, onRadiusChange, onLocationChange }) => {
  const [localRadius, setLocalRadius] = useState(radius || 5);
  const [localCenter, setLocalCenter] = useState(center);

  useEffect(() => {
    setLocalRadius(radius || 5);
    setLocalCenter(center);
  }, [radius, center]);

  const handleRadiusChange = (value) => {
    setLocalRadius(value);
    onRadiusChange?.(value);
  };

  const handleLocationChange = (field, value) => {
    const newCenter = { ...localCenter, [field]: value };
    setLocalCenter(newCenter);
    onLocationChange?.(newCenter);
  };

  const presetLocations = [
    { name: 'Downtown', lat: 40.7128, lng: -74.0060 },
    { name: 'Midtown', lat: 40.7580, lng: -73.9855 },
    { name: 'Upper East Side', lat: 40.7736, lng: -73.9566 },
    { name: 'Upper West Side', lat: 40.7870, lng: -73.9754 },
    { name: 'Brooklyn', lat: 40.6782, lng: -73.9442 },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 max-w-full w-full bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Search Radius</h2>
            <button
              onClick={onClose}
              className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
            {/* Radius Control */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Radius: {localRadius} miles
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={localRadius}
                onChange={(e) => handleRadiusChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1 mile</span>
                <span>50 miles</span>
              </div>
            </div>

            {/* Location Control */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location Center
              </label>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={localCenter?.lat || ''}
                    onChange={(e) => handleLocationChange('lat', parseFloat(e.target.value))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="40.7128"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={localCenter?.lng || ''}
                    onChange={(e) => handleLocationChange('lng', parseFloat(e.target.value))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="-74.0060"
                  />
                </div>
              </div>
            </div>

            {/* Preset Locations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preset Locations
              </label>
              <div className="space-y-2">
                {presetLocations.map((location) => (
                  <button
                    key={location.name}
                    onClick={() => handleLocationChange('lat', location.lat) || handleLocationChange('lng', location.lng)}
                    className="w-full text-left px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{location.name}</span>
                      <MapPinIcon className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="text-xs text-gray-500">
                      {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Current Location */}
            <div>
              <button
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        handleLocationChange('lat', position.coords.latitude);
                        handleLocationChange('lng', position.coords.longitude);
                      },
                      (error) => {
                        console.error('Error getting location:', error);
                      }
                    );
                  }
                }}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Use Current Location
              </button>
            </div>

            {/* Search Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Search Area</h4>
              <div className="text-sm text-blue-700">
                <p>• Radius: {localRadius} miles</p>
                <p>• Center: {localCenter?.lat?.toFixed(4) || 'N/A'}, {localCenter?.lng?.toFixed(4) || 'N/A'}</p>
                <p>• Area: ~{(Math.PI * localRadius * localRadius).toFixed(1)} sq miles</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RadiusDrawer;