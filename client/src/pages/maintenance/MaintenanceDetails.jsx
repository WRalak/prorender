import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeftIcon,
  WrenchScrewdriverIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  HomeIcon,
  CameraIcon,
  DocumentTextIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { maintenanceAPI } from '../../services/api';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';

const MaintenanceDetails = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { data: request, isLoading, error } = useQuery(
    ['maintenance-request', id],
    () => maintenanceAPI.getMaintenanceRequestById(id),
    {
      enabled: !!id,
      retry: 1,
      onError: () => {
        toast.error('Maintenance request not found');
        navigate('/maintenance');
      },
    }
  );

  const updateRequestMutation = useMutation(
    ({ id, updates }) => maintenanceAPI.updateMaintenanceRequest(id, updates),
    {
      onSuccess: () => {
        toast.success('Maintenance request updated successfully');
        setIsEditing(false);
        queryClient.invalidateQueries(['maintenance-request', id]);
      },
      onError: () => {
        toast.error('Failed to update maintenance request');
      },
    }
  );

  const deleteRequestMutation = useMutation(
    (id) => maintenanceAPI.deleteMaintenanceRequest(id),
    {
      onSuccess: () => {
        toast.success('Maintenance request deleted successfully');
        navigate('/maintenance');
      },
      onError: () => {
        toast.error('Failed to delete maintenance request');
      },
    }
  );

  const handleUpdate = (updates) => {
    updateRequestMutation.mutate({ id, updates });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this maintenance request?')) {
      deleteRequestMutation.mutate(id);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'blue';
      case 'in_progress':
        return 'yellow';
      case 'resolved':
        return 'green';
      case 'closed':
        return 'gray';
      case 'cancelled':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <ExclamationTriangleIcon className="h-5 w-5" />;
      case 'in_progress':
        return <ClockIcon className="h-5 w-5" />;
      case 'resolved':
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'closed':
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'cancelled':
        return <ClockIcon className="h-5 w-5" />;
      default:
        return <WrenchScrewdriverIcon className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low':
        return 'gray';
      case 'medium':
        return 'blue';
      case 'high':
        return 'orange';
      case 'urgent':
        return 'red';
      default:
        return 'gray';
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="large" text="Loading maintenance request..." />;
  }

  if (error || !request) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <WrenchScrewdriverIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Maintenance request not found</h2>
          <p className="mt-2 text-gray-600">
            The maintenance request you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/maintenance">
            <Button className="mt-4">View Maintenance Requests</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/maintenance" className="text-gray-600 hover:text-gray-900">
              ← Back to Maintenance
            </Link>
            <div className="flex items-center space-x-4">
              {request.status === 'open' && (
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              {request.status === 'open' && (
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Request Status */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Request Status</h2>
                <div className="flex items-center space-x-3">
                  <StatusBadge
                    status={request.status}
                    color={getStatusColor(request.status)}
                    icon={getStatusIcon(request.status)}
                  />
                  <StatusBadge
                    status={request.priority}
                    color={getPriorityColor(request.priority)}
                  />
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="h-5 w-5 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    Created: {formatDate(request.createdAt)} • Last updated: {formatDate(request.updatedAt)}
                  </span>
                </div>
              </div>
              {request.status === 'resolved' && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-green-800">
                      Maintenance request has been resolved
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Request Details */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Request Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {request.title}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                    {request.description}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <p className="mt-1 text-sm text-gray-900 capitalize">
                      {request.category || 'General'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Priority</label>
                    <p className="mt-1 text-sm text-gray-900 capitalize">
                      {request.priority}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Property Information */}
          {request.property && (
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Property Information</h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <HomeIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {request.property.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {request.property.address?.street}, {request.property.address?.city}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Unit</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {request.property.unit || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {request.property.bedrooms} bed
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Bathrooms</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {request.property.bathrooms} bath
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Images */}
          {request.images && request.images.length > 0 && (
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Images</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {request.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.url}
                        alt={`Maintenance image ${index + 1}`}
                        className="w-full h-48 object-cover rounded-md"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="outline"
                          size="small"
                          onClick={() => window.open(image.url, '_blank')}
                        >
                          <CameraIcon className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Timeline</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <CalendarIcon className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-700">
                      {formatDate(request.createdAt)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Request submitted by {request.tenant?.name || 'Unknown'}
                    </p>
                  </div>
                </div>
                {request.updatedAt && request.updatedAt !== request.createdAt && (
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <ClockIcon className="h-4 w-4 text-gray-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-700">
                        {formatDate(request.updatedAt)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Last updated
                      </p>
                    </div>
                  </div>
                )}
                {request.status === 'resolved' && request.resolvedAt && (
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircleIcon className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-700">
                        {formatDate(request.resolvedAt)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Request resolved
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Actions */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Actions</h2>
              <div className="space-y-3">
                {request.status === 'open' && (
                  <>
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      className="w-full"
                    >
                      <PencilIcon className="h-4 w-4 mr-2" />
                      Edit Request
                    </Button>
                    <Button
                      onClick={() => setShowDeleteModal(true)}
                      variant="outline"
                      className="w-full"
                    >
                      <TrashIcon className="h-4 w-4 mr-2" />
                      Delete Request
                    </Button>
                  </>
                )}
                {request.status === 'in_progress' && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      toast.info('Request is currently being processed by maintenance staff');
                    }}
                    className="w-full"
                  >
                    Contact Support
                  </Button>
                )}
                {request.status === 'resolved' && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      toast.success('Request has been resolved. Thank you!');
                    }}
                    className="w-full"
                  >
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    Close Request
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Maintenance Request</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                handleUpdate({
                  title: formData.get('title'),
                  description: formData.get('description'),
                  category: formData.get('category'),
                  priority: formData.get('priority'),
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={request.title}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  rows={4}
                  defaultValue={request.description}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    name="category"
                    defaultValue={request.category || 'general'}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="hvac">HVAC</option>
                    <option value="appliance">Appliance</option>
                    <option value="structural">Structural</option>
                    <option value="pest_control">Pest Control</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <select
                    name="priority"
                    defaultValue={request.priority}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={updateRequestMutation.isLoading}
                >
                  Update Request
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Maintenance Request</h3>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete this maintenance request? This action cannot be undone.
            </p>
            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                loading={deleteRequestMutation.isLoading}
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

export default MaintenanceDetails;
