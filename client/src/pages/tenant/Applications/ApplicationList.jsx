import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { applicationAPI } from '../../../services/api';
import { EyeIcon, PencilIcon, TrashIcon, DocumentTextIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import StatusBadge from '../../../components/common/StatusBadge';
import { formatDate } from '../../../utils/formatCurrency';
import toast from 'react-hot-toast';

const ApplicationList = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    status: 'all',
    propertyType: 'all',
  });
  const [page, setPage] = useState(1);

  const { data: applications, isLoading, refetch } = useQuery({
    queryKey: ['applications', page, filters],
    queryFn: () => applicationAPI.getApplications({ page, limit: 10, ...filters }),
    keepPreviousData: true,
  });

  const withdrawMutation = useMutation({
    mutationFn: applicationAPI.withdrawApplication,
    onSuccess: () => {
      toast.success('Application withdrawn successfully');
      refetch();
    },
    onError: (error) => {
      toast.error('Failed to withdraw application');
    },
  });

  const handleWithdraw = (applicationId) => {
    if (window.confirm('Are you sure you want to withdraw this application?')) {
      withdrawMutation.mutate(applicationId);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'gray';
      case 'submitted':
        return 'blue';
      case 'under_review':
        return 'yellow';
      case 'pending_documents':
        return 'orange';
      case 'approved':
        return 'green';
      case 'rejected':
        return 'red';
      case 'withdrawn':
        return 'gray';
      case 'expired':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5" />;
      case 'under_review':
      case 'pending_documents':
        return <ClockIcon className="h-5 w-5" />;
      default:
        return <DocumentTextIcon className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="large" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
        <p className="mt-2 text-gray-600">
          Track your rental applications and their status
        </p>
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
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="pending_documents">Pending Documents</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Type
              </label>
              <select
                value={filters.propertyType}
                onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
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

      {/* Applications List */}
      {applications?.data?.length > 0 ? (
        <div className="space-y-4">
          {applications.data.map((application) => (
            <Card key={application.id} className="hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {application.property?.title || 'Property Application'}
                      </h3>
                      <StatusBadge
                        status={application.status}
                        color={getStatusColor(application.status)}
                        icon={getStatusIcon(application.status)}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Property:</span>
                        <p className="text-gray-900">
                          {application.property?.address?.street || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Applied:</span>
                        <p className="text-gray-900">
                          {formatDate(application.createdAt)}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Status:</span>
                        <p className="text-gray-900 capitalize">
                          {application.status.replace('_', ' ')}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Monthly Rent:</span>
                        <p className="text-gray-900">
                          ${application.property?.pricing?.rent || 'N/A'}/mo
                        </p>
                      </div>
                    </div>

                    {/* Application Details */}
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Application Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Applicant:</span>
                          <p className="text-gray-900">
                            {application.applicant?.name?.first} {application.applicant?.name?.last}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Email:</span>
                          <p className="text-gray-900">{application.applicant?.email}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Phone:</span>
                          <p className="text-gray-900">{application.applicant?.phone || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Income:</span>
                          <p className="text-gray-900">
                            ${application.employmentInfo?.income || 'N/A'}/mo
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex space-x-3">
                      <Link
                        to={`/tenant/applications/${application.id}`}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        <EyeIcon className="h-4 w-4 mr-2" />
                        View Details
                      </Link>
                      
                      {(application.status === 'draft' || application.status === 'submitted') && (
                        <Button
                          onClick={() => handleWithdraw(application.id)}
                          variant="outline"
                          size="small"
                          loading={withdrawMutation.isLoading}
                        >
                          <TrashIcon className="h-4 w-4 mr-2" />
                          Withdraw
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
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filters.status !== 'all' || filters.propertyType !== 'all'
                ? 'Try adjusting your filters'
                : 'Start by applying for properties'}
            </p>
            {filters.status !== 'all' || filters.propertyType !== 'all' ? (
              <Button
                onClick={() => setFilters({ status: 'all', propertyType: 'all' })}
                className="mt-4"
              >
                Clear Filters
              </Button>
            ) : (
              <Link to="/search">
                <Button className="mt-4">Browse Properties</Button>
              </Link>
            )}
          </div>
        </Card>
      )}

      {/* Pagination */}
      {applications?.data?.length > 0 && (
        <div className="mt-6 flex justify-center">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="px-4 py-2 text-sm text-gray-700">
              Page {page} of {applications?.totalPages || 1}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={page >= (applications?.totalPages || 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationList;
