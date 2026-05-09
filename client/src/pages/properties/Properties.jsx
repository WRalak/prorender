import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import PropertyCard from '../../components/properties/PropertyCard';
import PropertyFilters from '../../components/properties/PropertyFilters';
import Pagination from '../../components/common/Pagination';

const Properties = () => {
  const [filters, setFilters] = useState({
    search: '',
    propertyType: '',
    bedrooms: '',
    bathrooms: '',
    minPrice: '',
    maxPrice: '',
    amenities: [],
    petFriendly: false,
    page: 1,
    limit: 12,
  });

  const [showFilters, setShowFilters] = useState(false);

  const { data: propertiesData, isLoading } = useQuery(
    ['properties', filters],
    async () => {
      const params = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) {
          if (Array.isArray(filters[key])) {
            filters[key].forEach(value => params.append(key, value));
          } else {
            params.append(key, filters[key]);
          }
        }
      });

      try {
        const response = await fetch(`/api/properties?${params}`);
        if (!response.ok) throw new Error('Failed to fetch properties');
        return response.json();
      } catch (error) {
        // Return mock data if API fails
        return {
          properties: [
            {
              _id: '1',
              title: 'Modern Downtown Apartment',
              type: 'apartment',
              price: 2500,
              bedrooms: 2,
              bathrooms: 2,
              area: 1200,
              address: '123 Main St, New York, NY',
              images: ['/api/placeholder/property1.jpg'],
              amenities: ['parking', 'pool', 'gym'],
              petFriendly: true,
              description: 'Beautiful modern apartment in downtown area',
              createdAt: new Date().toISOString(),
            },
            {
              _id: '2',
              title: 'Cozy Suburban House',
              type: 'house',
              price: 3500,
              bedrooms: 3,
              bathrooms: 2,
              area: 1800,
              address: '456 Oak Ave, Brooklyn, NY',
              images: ['/api/placeholder/property2.jpg'],
              amenities: ['parking', 'laundry', 'ac'],
              petFriendly: false,
              description: 'Spacious house perfect for families',
              createdAt: new Date().toISOString(),
            },
            {
              _id: '3',
              title: 'Luxury Penthouse Suite',
              type: 'condo',
              price: 5000,
              bedrooms: 3,
              bathrooms: 3,
              area: 2500,
              address: '789 Park Ave, Manhattan, NY',
              images: ['/api/placeholder/property3.jpg'],
              amenities: ['pool', 'gym', 'parking', 'laundry', 'ac'],
              petFriendly: true,
              description: 'Luxury penthouse with amazing city views',
              createdAt: new Date().toISOString(),
            },
          ],
          pagination: {
            page: 1,
            pages: 1,
            total: 3,
            limit: 12,
          },
        };
      }
    }
  );

  const properties = propertiesData?.properties || [];
  const pagination = propertiesData?.pagination || {};

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Find Your Perfect Home</h1>
        <p className="mt-2 text-gray-600">Browse through our selection of rental properties</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search by location, property name, or keywords..."
            value={filters.search}
            onChange={(e) => handleFilterChange({ search: e.target.value })}
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Filters Sidebar */}
        <div className={`${showFilters ? 'block' : 'hidden'} lg:block lg:w-80 flex-shrink-0`}>
          <PropertyFilters
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Properties Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : properties.length > 0 ? (
            <>
              <div className="mb-4 flex justify-between items-center">
                <p className="text-gray-600">
                  {pagination.total} {pagination.total === 1 ? 'property' : 'properties'} found
                </p>
                <select
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={filters.sort}
                  onChange={(e) => handleFilterChange({ sort: e.target.value })}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price-low">Price (Low to High)</option>
                  <option value="price-high">Price (High to Low)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <PropertyCard key={property._id} property={property} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.pages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg
                  className="mx-auto h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your filters or search criteria
              </p>
              <button
                onClick={() => setFilters({
                  search: '',
                  propertyType: '',
                  bedrooms: '',
                  bathrooms: '',
                  minPrice: '',
                  maxPrice: '',
                  amenities: [],
                  petFriendly: false,
                  page: 1,
                  limit: 12,
                })}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Properties;
