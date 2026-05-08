import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../../../context/AuthContext';
import { EyeIcon, CheckCircleIcon, XMarkIcon, ClockIcon } from '@heroicons/react/24/outline';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import StatusBadge from '../../../components/common/StatusBadge';
import { formatDate } from '../../../utils/formatCurrency';
import toast from 'react-hot-toast';

const SpaceApprovals = () => {
  const [filters, setFilters] = useState({
    status: 'all',
    page: 1,
    limit: 20,
  });

  const { data: approvalsData, isLoading } = useQuery(
    ['space-approvals', filters],
    () => {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== 'all') {
          params.append(key, filters[key]);
        }
      });
      return fetch(`/api/admin/space-approvals?${params}`).then(res => res.json());
    },
    {
      keepPreviousData: true,
    }
  );

  const approvals = approvalsData?.approvals || [];
  const pagination = approvalsData?.pagination || {};
  const stats = approvalsData?.stats || {};

  const queryClient = useQueryClient();

  const updateApprovalMutation = useMutation(
    async ({ approvalId, status, notes }) => {
      const response = await fetch(`/api/admin/space-approvals/${approvalId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, notes }),
      });
      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('space-approvals');
        toast.success('Approval status updated successfully');
      },
      onError: (error) => {
        toast.error('Failed to update approval');
      },
    }
  );

  const handleStatusUpdate = (approvalId, status, notes = '') => {
    updateApprovalMutation.mutate({ approvalId, status, notes });
  };

  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value 'under_review', label: 'Under Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  if (isLoading && !approvals.length) {
    return <LoadingSpinner size="large" text="Loading space approvals..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Space Approvals</h1>
        <p className="mt-2 text-gray-600">
          Review and approve property listings and space requests
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <Card.Body>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.totalApprovals || 0}</div>
              <div className="text-sm text-gray-600">Total Approvals</div>
            </div>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingApprovals || 0}</div>
              <div className="text-sm text-gray-600">Pending Review</div>
            </div>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.approvedToday || 0}</div>
              <div className="text-sm text-gray-600">Approved Today</div>
            </div>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.rejectedToday || 0}</div>
              <div className="text-sm text-gray-600">Rejected Today</div>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        </Card.Header>
        <Card.Body>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Approvals List */}
      <Card>
        <Card.Header>
          <h3 className="text-600 text-lg font-medium text-gray-900">Space Approvals</h3>
        </Card.Header>
        <Card.Body>
          {approvals.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <ClockIcon className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No space approvals found</h3>
              <p className="text-gray-600">
                No space approvals match your current filters.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {approvals.map((approval) => (
                <div
                  key={approval._id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <StatusBadge status={approval.status} />
                        <span className="text-xs text-gray-500">
                          {approval.type}
                        </span>
                      </div>
                      
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        {approval.title}
                      </h4>
                      
                      <p className="text-sm text-gray-600 mb-3">
                        {approval.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>
                          <strong>Space:</strong> {approval.space?.title || 'N/A'}
                        </span>
                        <span>
                          <strong>Agent:</strong> {approval.agent?.name || 'N/A'}
                        </span>
                        <span>
                          <strong>Submitted:</strong> {formatDate(approval.createdAt)}
                        </span>
                      </div>

                      {approval.property && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Property Details</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Address:</span>
                              <p className="text-gray-900">
                                {approval.property.address?.street}, {approval.property?.address?.city}, {approval.property?.address?.state}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500">Rent:</span>
                              <p className="text-gray-900">${approval.property?.pricing?.rent}/month</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Size:</span>
                              <p className="text-gray-900">
                                {approval.property?.details?.bedrooms} bed, {approval.property?.details?.bathrooms} bath
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {approval.applicant && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-md">
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Applicant Details</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Name:</span>
                              <p className="text-gray-900">
                                {approval.applicant?.name?.first} {approval.applicant?.name?.last}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500">Email:</span>
                              <p className="text-gray-900">
                                {approval.applicant?.email}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500">Phone:</span>
                              <p className="text-gray-900">
                                {approval.applicant?.phone || 'Not provided'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {approval.notes && (
                        <div className="mt-3 p-3 bg-yellow-50 rounded-md">
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Notes</h5>
                          <p className="text-sm text-gray-600">{approval.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {approval.status === 'pending' && (
                        <button
                          onClick={() => handleStatusUpdate(approval._id, 'under_review')}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                        >
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          Review
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleStatusUpdate(approval._id, 'approved')}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                      >
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        Approve
                      </button>
                      
                      <button
                        onClick={() => handleStatusUpdate(approval._id, 'rejected')}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                      >
                        <XMarkIcon className="h-4 w-4 mr-1" />
                        Reject
                      </button>
                      
                      <button
                        onClick={() => handleStatusUpdate(approval._id, 'cancelled')}
                        className="px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700"
                      >
                        <ClockIcon className="h-4 w-4 mr-1" />
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card.Body>
        
        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((filters.page - 1) * filters.limit) + 1} to{' '}
                {Math.min(filters.page * filters.limit, pagination.total)} of {pagination.total} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  disabled={filters.page === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-700">
                  Page {filters.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  disabled={filters.page === pagination.pages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default SpaceApprovals;
