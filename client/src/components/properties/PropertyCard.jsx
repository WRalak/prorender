import React from 'react';
import { Link } from 'react-router-dom';
import {
  HomeIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const PropertyCard = ({ property }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isFavorited, setIsFavorited] = useState(property.isFavorited || false);

  const favoriteMutation = useMutation(
    async () => {
      const method = isFavorited ? 'DELETE' : 'POST';
      const response = await fetch(`/api/properties/${property._id}/favorite`, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to update favorite status');
      }
      
      return response.json();
    },
    {
      onSuccess: () => {
        setIsFavorited(!isFavorited);
        toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
        queryClient.invalidateQueries('favorites');
      },
      onError: () => {
        toast.error('Failed to update favorite status');
      },
    }
  );

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to favorite properties');
      return;
    }
    favoriteMutation.mutate();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const primaryImage = property.media.images.find(img => img.isPrimary) || property.media.images[0];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <Link to={`/properties/${property._id}`}>
          <div className="aspect-w-16 aspect-h-9">
            {primaryImage ? (
              <img
                src={primaryImage.url}
                alt={property.title}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                <HomeIcon className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>
        </Link>
        
        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          disabled={favoriteMutation.isLoading}
          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow disabled:opacity-50"
        >
          {isFavorited ? (
            <HeartSolidIcon className="h-5 w-5 text-red-500" />
          ) : (
            <HeartIcon className="h-5 w-5 text-gray-400" />
          )}
        </button>

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            property.availability.status === 'available'
              ? 'bg-green-100 text-green-800'
              : property.availability.status === 'rented'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {property.availability.status.charAt(0).toUpperCase() + property.availability.status.slice(1)}
          </span>
        </div>
      </div>

      <div className="p-4">
        <Link to={`/properties/${property._id}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-1">
            {property.title}
          </h3>
        </Link>

        <div className="flex items-center text-gray-600 mb-3">
          <MapPinIcon className="h-4 w-4 mr-1" />
          <span className="text-sm">
            {property.address.city}, {property.address.state}
          </span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center text-gray-600">
            <HomeIcon className="h-4 w-4 mr-1" />
            <span className="text-sm">
              {property.details.bedrooms} bed • {property.details.bathrooms} bath • {property.details.squareFeet} sqft
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-5 w-5 text-green-600 mr-1" />
            <span className="text-xl font-bold text-gray-900">
              {formatPrice(property.pricing.rent)}
            </span>
            <span className="text-sm text-gray-600 ml-1">/mo</span>
          </div>
        </div>

        {/* Amenities */}
        {property.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {property.amenities.slice(0, 3).map((amenity) => (
              <span
                key={amenity}
                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800"
              >
                {amenity.replace('_', ' ').charAt(0).toUpperCase() + amenity.replace('_', ' ').slice(1)}
              </span>
            ))}
            {property.amenities.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                +{property.amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Pet Policy */}
        {property.petPolicy.allowed && (
          <div className="flex items-center text-green-600 text-sm">
            <span className="font-medium">Pet Friendly</span>
          </div>
        )}

        {/* Available Date */}
        <div className="text-xs text-gray-500 mt-2">
          Available {new Date(property.availability.availableDate).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
