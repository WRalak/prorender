import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MapPinIcon,
  HomeIcon,
  BuildingOfficeIcon,
  BedIcon,
  BathIcon,
  SquareFootIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  HeartIcon,
  ShareIcon,
  CameraIcon,
  CheckCircleIcon,
  ClockIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../../context/AuthContext';
import { propertyAPI } from '../../../services/api';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import StatusBadge from '../../../components/common/StatusBadge';
import { formatCurrency, formatDate } from '../../../utils/formatCurrency';
import toast from 'react-hot-toast';

const PropertyDetail = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const { data: property, isLoading, error } = useQuery(
    ['property', id],
    () => propertyAPI.getPropertyById(id),
    {
      enabled: !!id,
    }
  );

  const toggleFavoriteMutation = useMutation(
    (propertyId) => propertyAPI.toggleFavorite(propertyId),
    {
      onSuccess: () => {
        setIsFavorite(!isFavorite);
        queryClient.invalidateQueries(['favorites']);
        toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
      },
      onError: () => {
        toast.error('Failed to update favorites');
      },
    }
  );

  const createApplicationMutation = useMutation(
    (propertyId) => propertyAPI.createApplication(propertyId),
    {
      onSuccess: (data) => {
        toast.success('Application submitted successfully!');
        // Navigate to application details or applications page
      },
      onError: () => {
        toast.error('Failed to submit application');
      },
    }
  );

  useEffect(() => {
    if (property) {
      setIsFavorite(property.isFavorite || false);
    }
  }, [property]);

  const handleImageClick = (index) => {
    setActiveImageIndex(index);
  };

  const handleFavoriteToggle = () => {
    if (!user) {
      toast.error('Please login to save favorites');
      return;
    }
    toggleFavoriteMutation.mutate(id);
  };

  const handleApply = () => {
    if (!user) {
      toast.error('Please login to apply for this property');
      return;
    }
    if (property.status !== 'available') {
      toast.error('This property is not available for applications');
      return;
    }
    createApplicationMutation.mutate(id);
  };

  const getPropertyTypeIcon = (type) => {
    switch (type) {
      case 'apartment':
        return <BuildingOfficeIcon className="h-5 w-5" />;
      case 'house':
        return <HomeIcon className="h-5 w-5" />;
      case 'condo':
        return <BuildingOfficeIcon className="h-5 w-5" />;
      case 'townhouse':
        return <HomeIcon className="h-5 w-5" />;
      case 'studio':
        return <HomeIcon className="h-5 w-5" />;
      default:
        return <HomeIcon className="h-5 w-5" />;
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'rented':
        return 'red';
      case 'maintenance':
        return 'orange';
      case 'inactive':
        return 'gray';
      default:
        return 'gray';
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="large" text="Loading property details..." />;
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <HomeIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Property not found</h2>
          <p className="mt-2 text-gray-600">
            The property you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/search">
            <Button className="mt-4">Browse Properties</Button>
          </Link>
        </div>
      </div>
    );
  }

  const images = property.images || [];
  const currentImage = images[activeImageIndex] || null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/search" className="text-gray-600 hover:text-gray-900">
              ← Back to Search
            </Link>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={handleFavoriteToggle}
                className="flex items-center"
              >
                <HeartIcon
                  className={`h-5 w-5 mr-2 ${
                    isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'
                  }`}
                />
                {isFavorite ? 'Saved' : 'Save'}
              </Button>
              <Button
                onClick={handleApply}
                disabled={property.status !== 'available'}
                className="flex items-center"
              >
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                Apply Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Property Images */}
      <div className="relative h-96 bg-gray-200">
        {currentImage ? (
          <img
            src={currentImage}
            alt={property.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <HomeIcon className="h-12 w-12 text-gray-400" />
          </div>
        )}
        
        {/* Image Gallery */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => handleImageClick(index)}
                className={`w-2 h-2 rounded-full bg-white bg-opacity-80 ${
                  activeIndex === index ? 'ring-2 ring-blue-500' : ''
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Property Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Status */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
                <StatusBadge
                  status={property.status}
                  color={getStatusColor(property.status)}
                />
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  {getPropertyTypeIcon(property.type)}
                  <span className="ml-1">{getPropertyTypeLabel(property.type)}</span>
                </div>
                <div className="flex items-center">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  <span>{property.address?.city}, {property.address?.state}</span>
                </div>
              </div>
              <p className="text-gray-600">{property.description}</p>
            </div>

            {/* Key Features */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Key Features</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <BedIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{property.bedrooms}</p>
                    <p className="text-sm text-gray-600">Bedrooms</p>
                  </div>
                  <div className="text-center">
                    <BathIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{property.bathrooms}</p>
                    <p className="text-sm text-gray-600">Bathrooms</p>
                  </div>
                  <div className="text-center">
                    <SquareFootIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{property.squareFeet}</p>
                    <p className="text-sm text-gray-600">Sq Ft</p>
                  </div>
                  <div className="text-center">
                    <CurrencyDollarIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(property.pricing?.rent || 0)}
                    </p>
                    <p className="text-sm text-gray-600">/mo</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-800"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* Description */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Description</h3>
                <div className="prose max-w-none text-gray-700">
                  {property.description}
                </div>
              </div>
            </Card>

            {/* Location */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Location</h3>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <MapPinIcon className="h-5 w-5 mr-2" />
                    <span>{property.address?.street}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPinIcon className="h-5 w-5 mr-2" />
                    <span>
                      {property.address?.city}, {property.address?.state} {property.address?.zipCode}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <Card>
              <div className="p-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Monthly Rent</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(property.pricing?.rent || 0)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {property.pricing?.deposit
                      ? `Deposit: ${formatCurrency(property.pricing.deposit)}`
                      : 'No deposit required'}
                  </p>
                </div>
              </div>
            </Card>

            {/* Owner Card */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Property Owner</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <HomeIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {property.owner?.name || 'Property Owner'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Member since {formatDate(property.owner?.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Availability Card */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Availability</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Status</span>
                    <StatusBadge
                      status={property.status}
                      color={getStatusColor(property.status)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Available</span>
                    <span className="text-sm text-gray-900 font-medium">
                      {property.availability?.status === 'available'
                        ? 'Now'
                        : formatDate(property.availability?.availableDate)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Actions Card */}
            <Card>
              <div className="p-6">
                <div className="space-y-3">
                  <Button
                    onClick={handleApply}
                    disabled={property.status !== 'available'}
                    className="w-full"
                  >
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Apply Now
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
