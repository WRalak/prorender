import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const PropertyFilters = ({ filters, onFilterChange }) => {
  const propertyTypes = [
    { value: 'apartment', label: 'Apartment' },
    { value: 'house', label: 'House' },
    { value: 'condo', label: 'Condo' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'studio', label: 'Studio' },
    { value: 'loft', label: 'Loft' },
    { value: 'duplex', label: 'Duplex' },
  ];

  const amenities = [
    { value: 'parking', label: 'Parking' },
    { value: 'pool', label: 'Pool' },
    { value: 'gym', label: 'Gym' },
    { value: 'laundry', label: 'Laundry' },
    { value: 'ac', label: 'Air Conditioning' },
    { value: 'heating', label: 'Heating' },
    { value: 'balcony', label: 'Balcony' },
    { value: 'elevator', label: 'Elevator' },
    { value: 'furnished', label: 'Furnished' },
    { value: 'dishwasher', label: 'Dishwasher' },
    { value: 'washer_dryer', label: 'Washer/Dryer' },
    { value: 'fireplace', label: 'Fireplace' },
    { value: 'hardwood_floors', label: 'Hardwood Floors' },
    { value: 'walk_in_closet', label: 'Walk-in Closet' },
    { value: 'stainless_steel_appliances', label: 'Stainless Steel Appliances' },
  ];

  const bedroomOptions = [
    { value: '', label: 'Any' },
    { value: '0', label: 'Studio' },
    { value: '1', label: '1 Bedroom' },
    { value: '2', label: '2 Bedrooms' },
    { value: '3', label: '3 Bedrooms' },
    { value: '4', label: '4+ Bedrooms' },
  ];

  const bathroomOptions = [
    { value: '', label: 'Any' },
    { value: '1', label: '1 Bathroom' },
    { value: '2', label: '2 Bathrooms' },
    { value: '3', label: '3 Bathrooms' },
    { value: '4', label: '4+ Bathrooms' },
  ];

  const handleInputChange = (field, value) => {
    onFilterChange({ [field]: value });
  };

  const handleAmenityToggle = (amenity) => {
    const newAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter(a => a !== amenity)
      : [...filters.amenities, amenity];
    onFilterChange({ amenities: newAmenities });
  };

  const handleClearFilters = () => {
    onFilterChange({
      propertyType: '',
      bedrooms: '',
      bathrooms: '',
      minPrice: '',
      maxPrice: '',
      amenities: [],
      petFriendly: false,
    });
  };

  const hasActiveFilters = filters.propertyType || 
                          filters.bedrooms || 
                          filters.bathrooms || 
                          filters.minPrice || 
                          filters.maxPrice || 
                          filters.amenities.length > 0 || 
                          filters.petFriendly;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="text-sm text-blue-600 hover:text-blue-500 flex items-center"
          >
            <XMarkIcon className="h-4 w-4 mr-1" />
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Property Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property Type
          </label>
          <select
            value={filters.propertyType}
            onChange={(e) => handleInputChange('propertyType', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            {propertyTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Bedrooms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bedrooms
          </label>
          <select
            value={filters.bedrooms}
            onChange={(e) => handleInputChange('bedrooms', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {bedroomOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Bathrooms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bathrooms
          </label>
          <select
            value={filters.bathrooms}
            onChange={(e) => handleInputChange('bathrooms', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {bathroomOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price Range
          </label>
          <div className="flex space-x-2">
            <div className="flex-1">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => handleInputChange('minPrice', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => handleInputChange('maxPrice', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Pet Friendly */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.petFriendly}
              onChange={(e) => handleInputChange('petFriendly', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Pet Friendly</span>
          </label>
        </div>

        {/* Amenities */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amenities
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {amenities.map((amenity) => (
              <label key={amenity.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.amenities.includes(amenity.value)}
                  onChange={() => handleAmenityToggle(amenity.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{amenity.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Apply Filters Button */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={() => onFilterChange({ ...filters, page: 1 })}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyFilters;
