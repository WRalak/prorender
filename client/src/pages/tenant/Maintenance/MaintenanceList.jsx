import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  WrenchScrewdriverIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  UserIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../../context/AuthContext';
import { maintenanceAPI } from '../../../services/api';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import StatusBadge from '../../../components/common/StatusBadge';
import Modal from '../../../components/common/Modal';
import { formatDate } from '../../../utils/formatCurrency';
import toast from 'react-hot-toast';

const MaintenanceList = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    page: 1,
    limit: 10,
  });

  const { data: maintenanceRequests, isLoading, refetch } = useQuery(
    ['maintenance-requests', filters],
    () => maintenanceAPI.getMaintenanceRequests(filters),
    {
      keepPreviousData: true,
    }
  );

  const createRequestMutation = useMutation(maintenanceAPI.createMaintenanceRequest, {
    onSuccess: () => {
      toast.success('Maintenance request created successfully');
      setShowNewRequestModal(false);
      refetch();
    },
    onError: (error) => {
      toast.error('Failed to create maintenance request');
    },
  });

  const updateRequestMutation = useMutation(
    ({ id, status }) => maintenanceAPI.updateMaintenanceRequest(id, { status }),
    {
      onSuccess: () => {
        toast.success('Request updated successfully');
        refetch();
      },
      onError: (error) => {
        toast.error('Failed to update request');
      },
    }
  );

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
        return <XCircleIcon className="h-5 w-5" />;
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5" />;
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

  const handleStatusUpdate = (requestId, newStatus) => {
    updateRequestMutation.mutate({ id: requestId, status: newStatus });
  };

  const requests = maintenanceRequests?.data || [];
  const totalPages = maintenanceRequests?.totalPages || 1;

  if (isLoading) {
    return <LoadingSpinner size="large" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Maintenance Requests</h1>
            <p className="mt-2 text-gray-600">
              Track and manage your maintenance requests
            </p>
          </div>
          <Button onClick={() => setShowNewRequestModal(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>
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
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value, page: 1 })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={() => refetch()}>Refresh</Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Requests List */}
      {requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id} className="hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {request.title}
                      </h3>
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
                    
                    <p className="text-gray-600 mb-4">{request.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Property:</span>
                        <p className="text-gray-900">
                          {request.property?.title || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Category:</span>
                        <p className="text-gray-900 capitalize">
                          {request.category || 'General'}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Reported:</span>
                        <p className="text-gray-900">
                          {formatDate(request.createdAt)}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Last Updated:</span>
                        <p className="text-gray-900">
                          {formatDate(request.updatedAt)}
                        </p>
                      </div>
                    </div>

                    {/* Images */}
                    {request.images && request.images.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Images</h4>
                        <div className="flex space-x-2">
                          {request.images.slice(0, 3).map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`Maintenance image ${index + 1}`}
                              className="h-20 w-20 object-cover rounded-md"
                            />
                          ))}
                          {request.images.length > 3 && (
                            <div className="h-20 w-20 bg-gray-200 rounded-md flex items-center justify-center">
                              <span className="text-gray-500 text-sm">
                                +{request.images.length - 3}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-4 flex space-x-3">
                      <Link
                        to={`/tenant/maintenance/${request.id}`}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        <EyeIcon className="h-4 w-4 mr-2" />
                        View Details
                      </Link>
                      
                      {request.status === 'open' && (
                        <Button
                          onClick={() => handleStatusUpdate(request.id, 'cancelled')}
                          variant="outline"
                          size="small"
                          loading={updateRequestMutation.isLoading}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <WrenchScrewdriverIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No maintenance requests found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filters.status !== 'all' || filters.priority !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first maintenance request'}
            </p>
            {filters.status !== 'all' || filters.priority !== 'all' ? (
              <Button
                onClick={() => setFilters({ status: 'all', priority: 'all', page: 1, limit: 10 })}
                className="mt-4"
              >
                Clear Filters
              </Button>
            ) : (
              <Button onClick={() => setShowNewRequestModal(true)} className="mt-4">
                Create Request
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <div className="flex space-x-2">
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

      {/* New Request Modal */}
      <Modal
        isOpen={showNewRequestModal}
        onClose={() => setShowNewRequestModal(false)}
        title="Create Maintenance Request"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = {
              title: formData.get('title'),
              description: formData.get('description'),
              category: formData.get('category'),
              priority: formData.get('priority'),
              property: formData.get('property'),
            };
            createRequestMutation.mutate(data);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              name="title"
              type="text"
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Brief description of the issue"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              required
              rows={4}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Detailed description of the maintenance issue"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                name="category"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                name="priority"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property *
            </label>
            <select
              name="property"
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Select a property</option>
              {/* This would be populated with user's properties */}
              <option value="property-1">123 Main St</option>
              <option value="property-2">456 Oak Ave</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowNewRequestModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={createRequestMutation.isLoading}
            >
              Create Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MaintenanceList;
