import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { ExclamationTriangleIcon, EyeIcon, CheckCircleIcon, XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import StatusBadge from '../../../components/common/StatusBadge';
import { formatDate } from '../../../utils/formatCurrency';
import toast from 'react-hot-toast';

const ReportedProperties = () => {
  const [filters, setFilters] = useState({
    status: 'all',
    severity: 'all',
    page: 1,
    limit: 20,
  });

  const queryClient = useQueryClient();

  const { data: reportsData, isLoading } = useQuery(
    ['reported-properties', filters],
    () => {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== 'all') {
          params.append(key, filters[key]);
        }
      });
      return fetch(`/api/admin/moderation/reported-properties?${params}`).then(res => res.json());
    },
    {
      keepPreviousData: true,
    }
  );

  const updateReportMutation = useMutation(
    async ({ reportId, action, notes }) => {
      const response = await fetch(`/api/admin/moderation/reported-properties/${reportId}`, {
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
        queryClient.invalidateQueries('reported-properties');
        toast.success('Report action completed successfully');
      },
      onError: (error) => {
        toast.error('Failed to process report');
      },
    }
  );

  const reports = reportsData?.reports || [];
  const pagination = reportsData?.pagination || {};
  const stats = reportsData?.stats || {};

  const handleAction = (reportId, action, notes = '') => {
    updateReportMutation.mutate({ reportId, action, notes });
  };

  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending Review' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'dismissed', label: 'Dismissed' },
    { value: 'action_taken', label: 'Action Taken' },
  ];

  const severities = [
    { value: 'all', label: 'All Severities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
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

  if (isLoading && !reports.length) {
    return <LoadingSpinner size="large" text="Loading reported properties..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reported Properties</h1>
        <p className="mt-2 text-gray-600">
          Review and manage reported property listings
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
              <div className="text-2xl font-bold text-red-600">{stats.criticalReports || 0}</div>
              <div className="text-sm text-gray-600">Critical Issues</div>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
              <select
                value={filters.severity}
                onChange={(e) => setFilters({ ...filters, severity: e.target.value, page: 1 })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {severities.map((severity) => (
                  <option key={severity.value} value={severity.value}>
                    {severity.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quick Actions</label>
              <div className="flex space-x-2">
                <Button
                  onClick={() => {
                    // Process all critical items
                    reports
                      .filter(r => r.severity === 'critical' && r.status === 'pending')
                      .forEach(report => {
                        handleAction(report._id, 'review', 'Auto-processed critical report');
                      });
                  }}
                  variant="outline"
                  size="small"
                >
                  Process Critical
                </Button>
                <Button
                  onClick={() => {
                    // Clear resolved items
                    setFilters({ ...filters, status: 'pending' });
                  }}
                  variant="outline"
                  size="small"
                >
                  Clear Resolved
                </Button>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Reports List */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-medium text-gray-900">Reported Properties</h3>
        </Card.Header>
        <Card.Body>
          {reports.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <ExclamationTriangleIcon className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
              <p className="text-gray-600">
                No property reports match your current filters.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report._id}
                  className={`border rounded-lg p-4 hover:bg-gray-50 ${
                    report.severity === 'critical' ? 'border-red-200 bg-red-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <StatusBadge status={report.status} />
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(report.severity)}`}>
                          {report.severity}
                        </span>
                        <span className="text-xs text-gray-500">
                          Report ID: {report._id.slice(-8)}
                        </span>
                        {report.severity === 'critical' && (
                          <span className="text-xs text-red-600 font-medium">CRITICAL</span>
                        )}
                      </div>
                      
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        {report.property?.title || 'Unknown Property'}
                      </h4>
                      
                      <p className="text-sm text-gray-600 mb-3">
                        {report.reason}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <span>
                          <strong>Reported by:</strong> {report.reportedBy?.name || 'Anonymous'}
                        </span>
                        <span>
                          <strong>Date:</strong> {formatDate(report.createdAt)}
                        </span>
                        <span>
                          <strong>Property ID:</strong> {report.property?._id?.slice(-8) || 'N/A'}
                        </span>
                      </div>

                      {/* Property Details */}
                      {report.property && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Property Details</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Address:</span>
                              <p className="text-gray-900">
                                {report.property.address?.street}, {report.property.address?.city}, {report.property.address?.state}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500">Agent:</span>
                              <p className="text-gray-900">
                                {report.property.agent?.name || 'Not assigned'}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500">Status:</span>
                              <p className="text-gray-900">{report.property.status}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Price:</span>
                              <p className="text-gray-900">${report.property.pricing?.rent}/month</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Evidence */}
                      {report.evidence && report.evidence.length > 0 && (
                        <div className="mt-3 p-3 bg-yellow-50 rounded-md">
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Evidence</h5>
                          <div className="space-y-2">
                            {report.evidence.map((evidence, index) => (
                              <div
                                key={index}
                                className="flex items-center space-x-3 p-2 bg-white rounded border border-yellow-200"
                              >
                                <span className="text-sm text-gray-600">
                                  {evidence.type}
                                </span>
                                <span className="text-sm text-gray-900">
                                  {evidence.description}
                                </span>
                                {evidence.url && (
                                  <button
                                    onClick={() => window.open(evidence.url, '_blank')}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                  >
                                    View
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Admin Notes */}
                      {report.adminNotes && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-md">
                          <h5 className="text-sm font-medium text-gray-900 mb-1">Admin Notes</h5>
                          <p className="text-sm text-gray-600">{report.adminNotes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {report.status === 'pending' && (
                        <button
                          onClick={() => handleAction(report._id, 'review')}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          Review
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleAction(report._id, 'resolve', 'Issue resolved by admin')}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                      >
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        Resolve
                      </button>
                      
                      <button
                        onClick={() => handleAction(report._id, 'dismiss', 'Report dismissed')}
                        className="px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700"
                      >
                        <XMarkIcon className="h-4 w-4 mr-1" />
                        Dismiss
                      </button>
                      
                      <button
                        onClick={() => handleAction(report._id, 'action_taken', 'Action taken on property')}
                        className="px-3 py-1 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700"
                      >
                        Action Taken
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

export default ReportedProperties;