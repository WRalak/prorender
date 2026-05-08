import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShieldCheckIcon, ExclamationTriangleIcon, CheckCircleIcon, EyeIcon, FunnelIcon } from '@heroicons/react/24/outline';
import Card from '../../../components/common/Card';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import StatusBadge from '../../../components/common/StatusBadge';
import { formatDate } from '../../../utils/formatCurrency';

const ModerationLog = () => {
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    page: 1,
    limit: 20,
  });

  const { data: moderationData, isLoading } = useQuery(
    ['moderation-log', filters],
    () => {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== 'all') {
          params.append(key, filters[key]);
        }
      });
      return fetch(`/api/admin/moderation/log?${params}`).then(res => res.json());
    },
    {
      keepPreviousData: true,
    }
  );

  const logs = moderationData?.logs || [];
  const pagination = moderationData?.pagination || {};
  const stats = moderationData?.stats || {};

  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'resolved', label: 'Resolved' },
  ];

  const types = [
    { value: 'all', label: 'All Types' },
    { value: 'property', label: 'Property' },
    { value: 'user', label: 'User' },
    { value: 'review', label: 'Review' },
    {handleActionClick: 'message', label: 'Message' },
    { value: 'image', label: 'Image' },
    { value: 'listing', label: 'Listing' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'resolved':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'property':
        return <BuildingOfficeIcon className="h-5 w-5" />;
      case 'user':
        return <UsersIcon className="h-5 w-5" />;
      case 'review':
        return <StarIcon className="h-5 w-5" />;
      case 'message':
        return <ChatBubbleLeftRightIcon className="h-5 w-5" />;
      case 'image':
        return <PhotoIcon className="h-5 w-5" />;
      case 'listing':
        return <DocumentTextIcon className="h-5 w-5" />;
      default:
        return <ShieldCheckIcon className="h-5 w-5" />;
    }
  };

  const handleAction = async (logId, action, notes) => {
    try {
      const response = await fetch(`/api/admin/moderation/${logId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, notes }),
      });
      
      if (response.ok) {
        // Refresh the data
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to take action:', error);
    }
  };

  if (isLoading && !logs.length) {
    return <LoadingSpinner size="large" text="Loading moderation log..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Moderation Log</h1>
        <p className="mt-2 text-gray-600">
          Review and manage flagged content and user reports
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <Card.Body>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.totalReports || 0}</div>
              <div className="text-sm text-gray-600">Total Reports</div>
            </div>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingReports || 0}</div>
              <div className="text-sm text-gray-600">Pending Review</div>
            </div>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.resolvedToday || 0}</div>
              <div className="text-sm text-gray-600">Resolved Today</div>
            </div>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.activeModerators || 0}</div>
              <div className="text-sm text-gray-600">Active Moderators</div>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {types.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={filters.search || ''}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                  className="pl-10 block w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Moderation Log */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-medium text-gray-900">Moderation Log</h3>
        </Card.Header>
        <Card.Body>
          {logs.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <ShieldCheckIcon className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No moderation activity</h3>
              <p className="text-gray-600">
                No moderation records found for the selected criteria.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div
                  key={log._id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getTypeIcon(log.type)}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(log.status)}`}>
                          {log.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {log.type}
                        </span>
                      </div>
                      
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        {log.title}
                      </h4>
                      
                      <p className="text-sm text-gray-600 mb-3">
                        {log.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>
                          <strong>Reported by:</strong> {log.reportedBy?.name || 'Anonymous'}
                        </span>
                        <span>
                          <strong>Date:</strong> {formatDate(log.createdAt)}
                        </span>
                        {log.targetId && (
                          <span>
                            <strong>ID:</strong> {log.targetId}
                          </span>
                        )}
                      </div>

                      {log.evidence && (
                        <div className="mt-3">
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Evidence</h5>
                          <div className="space-y-2">
                            {log.evidence.map((evidence, index) => (
                              <div
                                key={index}
                                className="flex items-center space-x-3 p-2 bg-gray-50 rounded"
                              >
                                <span className="text-sm text-gray-600">
                                  {evidence.type}
                                </span>
                                <span className="text-sm text-gray-900">
                                  {evidence.description}
                                </span>
                                <button
                                  onClick={() => window.open(evidence.url, '_blank')}
                                  className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  View
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {log.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                          <h5 className="text-sm font-medium text-gray-900 mb-1">Notes</h5>
                          <p className="text-sm text-gray-600">{log.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {log.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAction(log._id, 'approve')}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                          >
                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(log._id, 'reject')}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                          >
                            <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setShowDetails(log)}
                        className="px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        Details
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

export default ModerationLog;