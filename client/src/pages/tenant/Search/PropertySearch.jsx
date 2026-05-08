import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  MapPinIcon,
  HomeIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  BedIcon,
  BathIcon,
  SquareFootIcon,
  HeartIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { propertyAPI } from '../../../services/api';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import StatusBadge from '../../../components/common/StatusBadge';
import { formatCurrency } from '../../../utils/formatCurrency';
import toast from 'react-hot-toast';

const PropertySearch = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    query: searchParams.get('query') || '',
    propertyType: searchParams.get('propertyType') || 'all',
    priceMin: searchParams.get('priceMin') || '',
    priceMax: searchParams.get('priceMax') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    bathrooms: searchParams.get('bathrooms') || '',
    furnished: searchParams.get('furnished') === 'true',
    petsAllowed: searchParams.get('petsAllowed') === 'true',
    sortBy: searchParams.get('sortBy') || 'newest',
    page: parseInt(searchParams.get('page')) || 1,
    limit: 12,
  });

  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const { data: searchResults, isLoading, refetch } = useQuery(
    ['properties', filters],
    () => propertyAPI.searchProperties(filters),
    {
      keepPreviousData: true,
      onSuccess: (data) => {
        if (data.error) {
          toast.error(data.error);
        }
      },
    }
  );

  useEffect(() => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) {
        params.set(key, filters[key]);
      }
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to page 1 when filters change
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    refetch();
  };

  const toggleFavorite = (propertyId) => {
    const newFavorites = favorites.includes(propertyId)
      ? favorites.filter(id => id !== propertyId)
      : [...favorites, propertyId];
    
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const getPropertyTypeIcon = (type) => {
    switch (type) {
      case 'apartment':
        return <BuildingOfficeIcon className="h-4 w-4" />;
      case 'house':
        return <HomeIcon className="h-4 w-4" />;
      default:
        return <HomeIcon className="h-4 w-4" />;
    }
  };

  const getPropertyTypeLabel = (type) => {
    switch (type) {
      case 'apartment':
        return 'Apartment';
      case 'house':
        return 'House';
      case 'condo':
        return 'Condo';
      case 'townhouse':
        return 'Townhouse';
      case 'studio':
        return 'Studio';
      default:
        return type;
    }
  };

  const properties = searchResults?.data || [];
  const totalPages = searchResults?.totalPages || 1;
  const totalCount = searchResults?.totalCount || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Search Properties</h1>
        <p className="mt-2 text-gray-600">
          Find your perfect rental property
        </p>
      </div>

      {/* Search Bar */}
      <Card className="mb-6">
        <div className="p-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by location, property name, or keywords..."
                  value={filters.query}
                  onChange={(e) => handleFilterChange('query', e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <Button type="submit">Search</Button>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </form>
        </div>
      </Card>

      {/* Filters */}
      {showFilters && (
        <Card className="mb-6">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type
                </label>
                <select
                  value={filters.propertyType}
                  onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="condo">Condo</option>
                  <option value="townhouse">Townhouse</option>
                  <option value="studio">Studio</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.priceMin}
                    onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.priceMax}
                    onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bedrooms
                </label>
                <select
                  value={filters.bedrooms}
                  onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bathrooms
                </label>
                <select
                  value={filters.bathrooms}
                  onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="price_low">Price (Low to High)</option>
                  <option value="price_high">Price (High to Low)</option>
                  <option value="bedrooms_low">Bedrooms (Low to High)</option>
                  <option value="bedrooms_high">Bedrooms (High to Low)</option>
                </select>
              </div>

              <div className="flex items-end space-x-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="furnished"
                    checked={filters.furnished}
                    onChange={(e) => handleFilterChange('furnished', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="furnished" className="ml-2 block text-sm text-gray-900">
                    Furnished
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="petsAllowed"
                    checked={filters.petsAllowed}
                    onChange={(e) => handleFilterChange('petsAllowed', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="petsAllowed" className="ml-2 block text-sm text-gray-900">
                    Pets Allowed
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({
                    query: '',
                    propertyType: 'all',
                    priceMin: '',
                    priceMax: '',
                    bedrooms: '',
                    bathrooms: '',
                    furnished: false,
                    petsAllowed: false,
                    sortBy: 'newest',
                    page: 1,
                    limit: 12,
                  });
                }}
              >
                Clear Filters
              </Button>
              <Button onClick={() => setShowFilters(false)}>Apply Filters</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Results Summary */}
      <div className="mb-6 flex justify-between items-center">
        <p className="text-gray-600">
          {totalCount > 0 ? (
            <>
              Showing {properties.length} of {totalCount} properties
            </>
          ) : (
            'No properties found'
          )}
        </p>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">View:</span>
          <Button
            variant="outline"
            size="small"
            className="px-2 py-1"
          >
            Grid
          </Button>
          <Button
            variant="outline"
            size="small"
            className="px-2 py-1"
          >
            Map
          </Button>
        </div>
      </div>

      {/* Property Grid */}
      {isLoading ? (
        <LoadingSpinner size="large" />
      ) : properties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Property Image */}
              <div className="relative h-48 bg-gray-200">
                {property.images?.length > 0 ? (
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <HomeIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-2 left-2">
                  <StatusBadge
                    status={property.status}
                    color={property.status === 'available' ? 'green' : 'gray'}
                  />
                </div>

                {/* Favorite Button */}
                <button
                  onClick={() => toggleFavorite(property.id)}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                >
                  <HeartIcon
                    className={`h-5 w-5 ${
                      favorites.includes(property.id)
                        ? 'text-red-500 fill-current'
                        : 'text-gray-400'
                    }`}
                  />
                </button>
              </div>

              {/* Property Details */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getPropertyTypeIcon(property.type)}
                    <span className="text-sm text-gray-500">
                      {getPropertyTypeLabel(property.type)}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">
                    {formatCurrency(property.pricing?.rent || 0)}
                    <span className="text-sm text-gray-500">/mo</span>
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                  {property.title}
                </h3>

                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  <span className="line-clamp-1">
                    {property.address?.street}, {property.address?.city}
                  </span>
                </div>

                {/* Property Features */}
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <BedIcon className="h-4 w-4 mr-1" />
                      <span>{property.bedrooms} bed</span>
                    </div>
                    <div className="flex items-center">
                      <BathIcon className="h-4 w-4 mr-1" />
                      <span>{property.bathrooms} bath</span>
                    </div>
                    <div className="flex items-center">
                      <SquareFootIcon className="h-4 w-4 mr-1" />
                      <span>{property.squareFeet} sqft</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Button
                    onClick={() => navigate(`/properties/${property.id}`)}
                    className="flex-1"
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/applications/apply/${property.id}`)}
                    className="flex-1"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <HomeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No properties found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria or filters
            </p>
            <Button
              onClick={() => {
                setFilters({
                  query: '',
                  propertyType: 'all',
                  priceMin: '',
                  priceMax: '',
                  bedrooms: '',
                  bathrooms: '',
                  furnished: false,
                  petsAllowed: false,
                  sortBy: 'newest',
                  page: 1,
                  limit: 12,
                });
              }}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => handleFilterChange('page', filters.page - 1)}
              disabled={filters.page === 1}
            >
              Previous
            </Button>
            
            <span className="px-4 py-2 text-sm text-gray-700">
              Page {filters.page} of {totalPages}
            </span>
            
            <Button
              variant="outline"
              onClick={() => handleFilterChange('page', filters.page + 1)}
              disabled={filters.page >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertySearch;
