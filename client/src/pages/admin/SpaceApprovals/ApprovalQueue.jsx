import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { ClockIcon, CheckCircleIcon, XMarkIcon, EyeIcon, FunnelIcon } from '@heroicons/react/24/outline';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import StatusBadge from '../../../components/common/StatusBadge';
import { formatDate } from '../../../utils/formatCurrency';
import toast from 'react-hot-toast';

const ApprovalQueue = () => {
  const [filters, setFilters] = useState({
    status: 'pending',
    priority: 'all',
    page: 1,
    limit: 20,
  });

  const queryClient = useQueryClient();

  const { data: queueData, isLoading } = useQuery(
    ['approval-queue', filters],
    () => {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== 'all') {
          params.append(key, filters[key]);
        }
      });
      return fetch(`/api/admin/approval-queue?${params}`).then(res => res.json());
    },
    {
      keepPreviousData: true,
    }
  );

  const updateApprovalMutation = useMutation(
    async ({ approvalId, action, notes }) => {
      const response = await fetch(`/api/admin/approval-queue/${approvalId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, notes }),
      });
      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('approval-queue');
        toast.success('Approval action completed successfully');
      },
      onError: (error) => {
        toast.error('Failed to process approval');
      },
    }
  );

  const approvals = queueData?.approvals || [];
  const pagination = queueData?.pagination || {};
  const stats = queueData?.stats || {};

  const handleAction = (approvalId, action, notes = '') => {
    updateApprovalMutation.mutate({ approvalId, action, notes });
  };

  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ];

  const priorities = [
    { value: 'all', label: 'All Priorities' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading && !approvals.length) {
    return <LoadingSpinner size="large" text="Loading approval queue..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Approval Queue</h1>
        <p className="mt-2 text-gray-600">
          Review and manage pending space approvals
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <Card.Body>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.totalApprovals || 0}</div>
              <div className="text-sm text-gray-600">Total in Queue</div>
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
              <div className="text-2xl font-bold text-red-600">{stats.urgentApprovals || 0}</div>
              <div className="text-sm text-gray-600">Urgent Items</div>
            </div>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.avgProcessingTime || 0}h</div>
              <div className="text-sm text-gray-600">Avg Processing Time</div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value, page: 1 })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {priorities.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quick Actions</label>
              <div className="flex space-x-2">
                <Button
                  onClick={() => {
                    // Process all urgent items
                    approvals
                      .filter(a => a.priority === 'urgent' && a.status === 'pending')
                      .forEach(approval => {
                        handleAction(approval._id, 'review', 'Auto-processed urgent item');
                      });
                  }}
                  variant="outline"
                  size="small"
                >
                  Process Urgent
                </Button>
                <Button
                  onClick={() => {
                    // Clear processed items
                    setFilters({ ...filters, status: 'pending' });
                  }}
                  variant="outline"
                  size="small"
                >
                  Clear Processed
                </Button>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Approval Queue */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-medium text-gray-900">Approval Queue</h3>
        </Card.Header>
        <Card.Body>
          {approvals.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <ClockIcon className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No items in queue</h3>
              <p className="text-gray-600">
                No approval items match your current filters.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {approvals.map((approval) => (
                <div
                  key={approval._id}
                  className={`border rounded-lg p-4 hover:bg-gray-50 ${
                    approval.priority === 'urgent' ? 'border-red-200 bg-red-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <StatusBadge status={approval.status} />
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(approval.priority)}`}>
                          {approval.priority}
                        </span>
                        <span className="text-xs text-gray-500">
                          {approval.type}
                        </span>
                        {approval.priority === 'urgent' && (
                          <span className="text-xs text-red-600 font-medium">URGENT</span>
                        )}
                      </div>
                      
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        {approval.title}
                      </h4>
                      
                      <p className="text-sm text-gray-600 mb-3">
                        {approval.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>
                          <strong>Submitted:</strong> {formatDate(approval.createdAt)}
                        </span>
                        <span>
                          <strong>Agent:</strong> {approval.agent?.name || 'N/A'}
                        </span>
                        {approval.estimatedProcessingTime && (
                          <span>
                            <strong>Est. Time:</strong> {approval.estimatedProcessingTime}h
                          </span>
                        )}
                      </div>

                      {approval.submitter && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Submitter Details</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Name:</span>
                              <p className="text-gray-900">
                                {approval.submitter.name?.first} {approval.submitter.name?.last}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500">Email:</span>
                              <p className="text-gray-900">
                                {approval.submitter.email}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500">Role:</span>
                              <p className="text-gray-900 capitalize">
                                {approval.submitter.role}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {approval.reviewNotes && (
                        <div className="mt-3 p-3 bg-yellow-50 rounded-md">
                          <h5 className="text-sm font-medium text-gray-900 mb-1">Review Notes</h5>
                          <p className="text-sm text-gray-600">{approval.reviewNotes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {approval.status === 'pending' && (
                        <button
                          onClick={() => handleAction(approval._id, 'review')}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          Review
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleAction(approval._id, 'approve', 'Approved by admin')}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                      >
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        Approve
                      </button>
                      
                      <button
                        onClick={() => handleAction(approval._id, 'reject', 'Rejected by admin')}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                      >
                        <XMarkIcon className="h-4 w-4 mr-1" />
                        Reject
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

export default ApprovalQueue;