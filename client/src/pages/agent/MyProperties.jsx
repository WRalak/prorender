import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, HomeIcon, BuildingOfficeIcon, MapPinIcon, CurrencyDollarIcon, EyeIcon, PencilIcon, TrashIcon, CalendarIcon, CheckCircleIcon, ExclamationTriangleIcon, ClockIcon, StarIcon } from "@heroicons/react/24/outline";
import { useAuth } from '../../context/AuthContext';
import { propertyAPI } from '../../services/api';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate, formatCurrency } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';

const MyProperties = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    page: 1,
    limit: 12,
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);

  const { data: propertiesData, isLoading, refetch } = useQuery(
    ['agent-properties', filters],
    () => propertyAPI.getAgentProperties(filters),
    {
      keepPreviousData: true,
    }
  );

  const deletePropertyMutation = useMutation(
    (propertyId) => propertyAPI.deleteProperty(propertyId),
    {
      onSuccess: () => {
        toast.success('Property deleted successfully');
        queryClient.invalidateQueries(['agent-properties']);
        setShowDeleteModal(false);
        setPropertyToDelete(null);
      },
      onError: () => {
        toast.error('Failed to delete property');
      },
    }
  );

  const togglePropertyStatusMutation = useMutation(
    ({ propertyId, status }) => propertyAPI.updateProperty(propertyId, { status }),
    {
      onSuccess: () => {
        toast.success('Property status updated successfully');
        queryClient.invalidateQueries(['agent-properties']);
      },
      onError: () => {
        toast.error('Failed to update property status');
      },
    }
  );

  const handleDelete = (property) => {
    setPropertyToDelete(property);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (propertyToDelete) {
      deletePropertyMutation.mutate(propertyToDelete._id);
    }
  };

  const handleStatusToggle = (property) => {
    const newStatus = property.status === 'active' ? 'inactive' : 'active';
    togglePropertyStatusMutation.mutate({
      propertyId: property._id,
      status: newStatus,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'gray';
      case 'draft':
        return 'yellow';
      case 'maintenance':
        return 'orange';
      case 'rented':
        return 'blue';
      default:
        return 'gray';
    }
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

  const properties = propertiesData?.data || [];
  const totalPages = propertiesData?.totalPages || 1;
  const totalCount = propertiesData?.totalCount || 0;

  if (isLoading) {
    return <LoadingSpinner size="large" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
              <p className="text-sm text-gray-500">
                Manage your property listings
              </p>
            </div>
            <Button
              onClick={() => navigate('/agent/properties/add')}
              className="flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </div>
        </div>
      </div>

      {/* Filters and Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Stats Cards */}
          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <HomeIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Properties</p>
                  <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
                </div>
              </div>
            </div>
          </Card>
          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Active</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {properties.filter(p => p.status === 'active').length}
                  </p>
                </div>
              </div>
            </div>
          </Card>
          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {properties.filter(p => p.status === 'draft').length}
                  </p>
                </div>
              </div>
            </div>
          </Card>
          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Rented</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {properties.filter(p => p.status === 'rented').length}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="draft">Draft</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="rented">Rented</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
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
              <div className="flex items-end">
                <Button onClick={() => refetch()}>Refresh</Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Properties List */}
        {properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Card key={property._id} className="overflow-hidden hover:shadow-lg transition-shadow">
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
                      color={getStatusColor(property.status)}
                    />
                  </div>

                  {/* Actions */}
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => navigate(`/agent/properties/${property._id}`)}
                      className="p-2 bg-white rounded-full shadow-md hover:shadow-lg"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                  </div>
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

                  {/* Applications */}
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span>Applications: {property.applications?.length || 0}</span>
                    <span>Views: {property.views || 0}</span>
                  </div>

                  {/* Rating */}
                  {property.rating && (
                    <div className="flex items-center mb-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(property.rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-1 text-sm text-gray-600">
                        ({property.rating.toFixed(1)})
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/agent/properties/${property._id}`)}
                      className="flex-1"
                    >
                      <EyeIcon className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/agent/properties/${property._id}/edit`)}
                      className="flex-1"
                    >
                      <PencilIcon className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleStatusToggle(property)}
                      className="flex-1"
                    >
                      {property.status === 'active' ? 'Deactivate' : 'Activate'}
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
                {filters.status !== 'all' || filters.type !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Start by adding your first property'}
              </p>
              {filters.status !== 'all' || filters.type !== 'all' ? (
                <Button
                  onClick={() => setFilters({ status: 'all', type: 'all', page: 1, limit: 12 })}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              ) : (
                <Button
                  onClick={() => navigate('/agent/properties/add')}
                  className="mt-4"
                >
                  Add Property
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                disabled={filters.page === 1}
              >
                Previous
              </Button>
              <span className="px-4 py-2 text-sm text-gray-700">
                Page {filters.page} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                disabled={filters.page >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Property</h3>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete "{propertyToDelete?.title}"? This action cannot be undone.
            </p>
            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setPropertyToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={confirmDelete}
                loading={deletePropertyMutation.isLoading}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProperties;
