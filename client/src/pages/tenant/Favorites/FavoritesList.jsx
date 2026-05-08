import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  HeartIcon,
  HomeIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  BedIcon,
  BathIcon,
  SquareFootIcon,
  EyeIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { propertyAPI } from '../../../services/api';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import StatusBadge from '../../../components/common/StatusBadge';
import { formatCurrency } from '../../../utils/formatCurrency';
import toast from 'react-hot-toast';

const FavoritesList = () => {
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const { data: favoriteProperties, isLoading, refetch } = useQuery(
    ['favoriteProperties', favorites],
    () => {
      if (favorites.length === 0) return { data: [] };
      return Promise.all(
        favorites.map(id => propertyAPI.getPropertyById(id))
      );
    },
    {
      enabled: favorites.length > 0,
    }
  );

  const properties = favoriteProperties?.data || [];

  const toggleFavorite = (propertyId) => {
    const newFavorites = favorites.includes(propertyId)
      ? favorites.filter(id => id !== propertyId)
      : [...favorites, propertyId];
    
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    
    if (newFavorites.length === 0) {
      refetch();
    }
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

  if (isLoading) {
    return <LoadingSpinner size="large" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
            <p className="mt-2 text-gray-600">
              Properties you've saved for later
            </p>
          </div>
          <div className="text-sm text-gray-600">
            {properties.length} {properties.length === 1 ? 'property' : 'properties'} saved
          </div>
        </div>
      </div>

      {/* Favorites List */}
      {properties.length > 0 ? (
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
                  <HeartIcon className="h-5 w-5 text-red-500 fill-current" />
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

                {/* Additional Details */}
                <div className="space-y-2 mb-4">
                  {property.amenities?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {property.amenities.slice(0, 3).map((amenity, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800"
                        >
                          {amenity}
                        </span>
                      ))}
                      {property.amenities.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                          +{property.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Link to={`/properties/${property.id}`} className="flex-1">
                    <Button className="w-full">
                      <EyeIcon className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => toggleFavorite(property.id)}
                    className="flex-1"
                  >
                    <HeartIcon className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <HeartIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No favorites yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start saving properties you're interested in
            </p>
            <Link to="/search">
              <Button className="mt-4">
                Browse Properties
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Summary Stats */}
      {properties.length > 0 && (
        <Card className="mt-8">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Favorites Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <CurrencyDollarIcon className="mx-auto h-8 w-8 text-blue-500 mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(
                    properties.reduce((sum, p) => sum + (p.pricing?.rent || 0), 0)
                  )}
                </div>
                <div className="text-sm text-gray-500">Average Rent</div>
                <div className="text-lg font-semibold text-gray-900 mt-1">
                  {formatCurrency(
                    properties.reduce((sum, p) => sum + (p.pricing?.rent || 0), 0) / properties.length
                  )}
                </div>
              </div>
              <div className="text-center">
                <HomeIcon className="mx-auto h-8 w-8 text-green-500 mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {properties.length}
                </div>
                <div className="text-sm text-gray-500">Properties</div>
                <div className="text-sm text-gray-600 mt-1">
                  {new Set(properties.map(p => p.type)).size} types
                </div>
              </div>
              <div className="text-center">
                <MapPinIcon className="mx-auto h-8 w-8 text-purple-500 mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {new Set(properties.map(p => p.address?.city)).size}
                </div>
                <div className="text-sm text-gray-500">Cities</div>
                <div className="text-sm text-gray-600 mt-1">
                  {new Set(properties.map(p => p.address?.state)).size} states
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      {properties.length > 0 && (
        <Card className="mt-6">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  const email = 'friend@example.com';
                  const subject = 'Check out these properties I found!';
                  const body = `Hi,\n\nI found these great rental properties that I thought you might be interested in:\n\n${properties.map(p => `${p.title} - ${formatCurrency(p.pricing?.rent || 0)}/mo - ${p.address?.street}, ${p.address?.city}`).join('\n')}\n\nCheck them out!`;
                  
                  window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                }}
              >
                Share Favorites
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const csvContent = [
                    ['Title', 'Type', 'Rent', 'Bedrooms', 'Bathrooms', 'Square Feet', 'Address', 'City', 'State'],
                    ...properties.map(p => [
                      p.title,
                      p.type,
                      p.pricing?.rent || 0,
                      p.bedrooms,
                      p.bathrooms,
                      p.squareFeet,
                      p.address?.street,
                      p.address?.city,
                      p.address?.state
                    ])
                  ].map(row => row.join(',')).join('\n');
                  
                  const blob = new Blob([csvContent], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'favorites.csv';
                  a.click();
                  window.URL.revokeObjectURL(url);
                }}
              >
                Export to CSV
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default FavoritesList;
