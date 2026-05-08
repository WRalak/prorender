import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { applicationAPI } from '../../services/api';
import { EyeIcon, DocumentTextIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Applications = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery(
    ['applications', filter, page],
    () => applicationAPI.getApplications({ status: filter === 'all' ? undefined : filter, page }),
    {
      keepPreviousData: true,
    }
  );

  const applications = data?.applications || [];
  const pagination = data?.pagination || {};

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filters = [
    { value: 'all', label: 'All Applications' },
    { value: 'pending', label: 'Pending' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'withdrawn', label: 'Withdrawn' },
  ];

  if (isLoading && !applications.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
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
        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load applications</h3>
        <p className="text-gray-600">Please try again later.</p>
        <Button onClick={() => window.location.reload()} variant="primary">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
        <p className="mt-2 text-gray-600">
          Track the status of your rental applications
        </p>
      </div>

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

      {/* Applications List */}
      {applications.length === 0 ? (
        <div className="text-center py-12">
          <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
          <p className="text-gray-600 mb-4">
            {filter === 'all' 
              ? "You haven't applied to any properties yet. Start browsing to find your perfect home!"
              : `No ${filter.toLowerCase()} applications found.`}
          </p>
          <Link to="/properties">
            <Button variant="primary">Browse Properties</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <div
              key={application._id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(application.status)}
                    <StatusBadge status={application.status} />
                  </div>
                  
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {application.property?.title || 'Property Application'}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium text-gray-900">Address:</span>
                      <p className="truncate">
                        {application.property?.address?.street}, {application.property?.address?.city}, {application.property?.address?.state}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Applied:</span>
                      <p>{formatDate(application.createdAt)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Rent:</span>
                      <p>${application.property?.pricing?.rent}/month</p>
                    </div>
                  </div>

                  {application.notes && (
                    <div className="mt-4">
                      <span className="font-medium text-gray-900">Notes:</span>
                      <p className="text-gray-600 mt-1">{application.notes}</p>
                    </div>
                  )}

                  {application.rejectionReason && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-800">
                        <span className="font-medium">Reason for rejection:</span> {application.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>

                <div className="ml-4 flex flex-col space-y-2">
                  <Link
                    to={`/applications/${application._id}`}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    View Details
                  </Link>
                  
                  {application.status === 'pending' && (
                    <button
                      onClick={() => {
                        // Handle withdrawal logic
                      }}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                    >
                      Withdraw
                    </button>
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
    </div>
  );
};

export default Applications;
