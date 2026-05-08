import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { maintenanceAPI } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { WrenchScrewdriverIcon, PlusIcon, CameraIcon } from '@heroicons/react/24/outline';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const Maintenance = () => {
  const { user } = useAuth();
  const { isConnected } = useSocket();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);

  const { data: maintenanceData, isLoading, error } = useQuery(
    ['maintenance', filter, page],
    () => maintenanceAPI.getMaintenanceRequests({ status: filter === 'all' ? undefined : filter, page }),
    {
      keepPreviousData: true,
    }
  );

  const createMutation = useMutation(maintenanceAPI.createMaintenanceRequest, {
    onSuccess: () => {
      queryClient.invalidateQueries('maintenance');
      setShowModal(false);
      toast.success('Maintenance request submitted successfully');
    },
    onError: (error) => {
      toast.error('Failed to submit maintenance request');
    },
  });

  const updateStatusMutation = useMutation(
    ({ id, status }) => maintenanceAPI.updateStatus(id, { status }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('maintenance');
        toast.success('Status updated successfully');
      },
      onError: (error) => {
        toast.error('Failed to update status');
      },
    }
  );

  const requests = maintenanceData?.requests || [];
  const pagination = maintenanceData?.pagination || {};

  const categories = [
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'hvac', label: 'HVAC' },
    { value: 'appliance', label: 'Appliance' },
    { value: 'structural', label: 'Structural' },
    { value: 'pest_control', label: 'Pest Control' },
    { value: 'other', label: 'Other' },
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ];

  const filters = [
    { value: 'all', label: 'All Requests' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const handleSubmitRequest = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      property: formData.get('property'),
      category: formData.get('category'),
      priority: formData.get('priority'),
      title: formData.get('title'),
      description: formData.get('description'),
    };
    createMutation.mutate(data);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading && !requests.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" text="Loading maintenance requests..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">
          <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load maintenance requests</h3>
        <p className="text-gray-600">Please try again later.</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Maintenance Requests</h1>
          <p className="mt-2 text-gray-600">
            Track and manage maintenance requests for your properties
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            You are currently offline. Some features may not be available.
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((filterOption) => (
          <button
            key={filterOption.value}
            onClick={() => {
              setFilter(filterOption.value);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === filterOption.value
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {filterOption.label}
          </button>
        ))}
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="text-center py-12">
          <WrenchScrewdriverIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No maintenance requests found</h3>
          <p className="text-gray-600 mb-4">
            {filter === 'all' 
              ? "You don't have any maintenance requests yet."
              : `No ${filter.toLowerCase()} maintenance requests found.`}
          </p>
          <Button onClick={() => setShowModal(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Request
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request._id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <StatusBadge status={request.priority} />
                    <StatusBadge status={request.status} />
                  </div>
                  
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {request.title}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium text-gray-900">Category:</span>
                      <p className="capitalize">{request.category.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Property:</span>
                      <p className="truncate">{request.property?.title || 'Unknown Property'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Submitted:</span>
                      <p>{formatDate(request.createdAt)}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <span className="font-medium text-gray-900">Description:</span>
                    <p className="text-gray-600 mt-1">{request.description}</p>
                  </div>

                  {request.images && request.images.length > 0 && (
                    <div className="mt-4">
                      <span className="font-medium text-gray-900">Images:</span>
                      <div className="flex space-x-2 mt-2">
                        {request.images.slice(0, 3).map((image, index) => (
                          <img
                            key={index}
                            src={image.url}
                            alt={`Maintenance image ${index + 1}`}
                            className="h-20 w-20 object-cover rounded-md"
                          />
                        ))}
                        {request.images.length > 3 && (
                          <div className="h-20 w-20 bg-gray-200 rounded-md flex items-center justify-center">
                            <span className="text-gray-600 text-sm">+{request.images.length - 3}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {request.timeline && request.timeline.length > 0 && (
                    <div className="mt-4">
                      <span className="font-medium text-gray-900">Timeline:</span>
                      <div className="space-y-2 mt-2">
                        {request.timeline.slice(-3).map((entry, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm">
                            <span className="text-gray-500">{formatDate(entry.timestamp)}:</span>
                            <span className="text-gray-700">{entry.note}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="ml-4 flex flex-col space-y-2">
                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => setSelectedRequest(request)}
                  >
                    View Details
                  </Button>
                  
                  {user?.role === 'agent' && request.status === 'pending' && (
                    <Button
                      variant="primary"
                      size="small"
                      onClick={() => {
                        updateStatusMutation.mutate({
                          id: request._id,
                          status: 'in_progress'
                        });
                      }}
                    >
                      Start Work
                    </Button>
                  )}
                  
                  {user?.role === 'agent' && request.status === 'in_progress' && (
                    <Button
                      variant="success"
                      size="small"
                      onClick={() => {
                        updateStatusMutation.mutate({
                          id: request._id,
                          status: 'completed'
                        });
                      }}
                    >
                      Complete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="mt-8 flex justify-center">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <span className="px-3 py-2 text-sm text-gray-700">
              Page {page} of {pagination.pages}
            </span>
            
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === pagination.pages}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* New Request Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Maintenance Request">
        <form onSubmit={handleSubmitRequest}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property
              </label>
              <select
                name="property"
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Select a property</option>
                {/* Add property options */}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                name="category"
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                name="priority"
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Select a priority</option>
                {priorities.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                name="title"
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Brief description of the issue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                required
                rows={4}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Detailed description of the maintenance issue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                <CameraIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Click to upload images</p>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  id="images"
                />
                <label
                  htmlFor="images"
                  className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Choose Files
                </label>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={createMutation.isLoading}
            >
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Maintenance;
