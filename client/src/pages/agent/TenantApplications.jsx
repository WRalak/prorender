import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserIcon, HomeIcon, CalendarIcon, ClockIcon, CheckCircleIcon, ExclamationTriangleIcon, EyeIcon, MapPinIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { useAuth } from '../../context/AuthContext';
import { applicationAPI } from '../../services/api';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate, formatCurrency } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';

const TenantApplications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    status: 'all',
    propertyType: 'all',
    dateRange: 'all',
    page: 1,
    limit: 12,
  });

  const { data: applicationsData, isLoading, refetch } = useQuery(
    ['agent-applications', filters],
    () => applicationAPI.getAgentApplications(filters),
    {
      keepPreviousData: true,
    }
  );

  const updateApplicationStatusMutation = useMutation(
    ({ applicationId, status }) => applicationAPI.updateApplicationStatus(applicationId, { status }),
    {
      onSuccess: () => {
        toast.success('Application status updated successfully');
        queryClient.invalidateQueries(['agent-applications']);
      },
      onError: () => {
        toast.error('Failed to update application status');
      },
    }
  );

  const handleStatusUpdate = (applicationId, newStatus) => {
    updateApplicationStatusMutation.mutate({
      applicationId,
      status: newStatus,
    });
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
      case 'draft':
        return <ClockIcon className="h-5 w-5" />;
      case 'submitted':
        return <CalendarIcon className="h-5 w-5" />;
      case 'under_review':
        return <ClockIcon className="h-5 w-5" />;
      case 'pending_documents':
        return <ExclamationTriangleIcon className="h-5 w-5" />;
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'rejected':
        return <ExclamationTriangleIcon className="h-5 w-5" />;
      case 'withdrawn':
        return <ClockIcon className="h-5 w-5" />;
      case 'expired':
        return <ClockIcon className="h-5 w-5" />;
      default:
        return <CalendarIcon className="h-5 w-5" />;
    }
  };

  const applications = applicationsData?.data || [];
  const totalCount = applicationsData?.totalCount || 0;

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
              <h1 className="text-2xl font-bold text-gray-900">Tenant Applications</h1>
              <p className="text-sm text-gray-500">
                Review and manage rental applications
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => refetch()}
                className="flex items-center"
              >
                <FilterIcon className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
                </div>
              </div>
            </div>
          </Card>
          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CalendarIcon className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {applications.filter(a => a.status === 'pending_documents').length}
                  </p>
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
                  <p className="text-sm font-medium text-gray-500">Approved</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {applications.filter(a => a.status === 'approved').length}
                  </p>
                </div>
              </div>
            </div>
          </Card>
          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Rejected</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {applications.filter(a => a.status === 'rejected').length}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Applications List */}
        {applications.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications.map((application) => (
              <Card key={application._id} className="hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                        {application.applicant?.name || 'Unknown Applicant'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Applied: {formatDate(application.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <StatusBadge
                        status={application.status}
                        color={getStatusColor(application.status)}
                        icon={getStatusIcon(application.status)}
                      />
                    </div>
                  </div>

                  {/* Property Info */}
                  <div className="space-y-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <HomeIcon className="h-4 w-4 mr-1" />
                      <span className="line-clamp-1">
                        {application.property?.title || 'Unknown Property'}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      <span className="line-clamp-1">
                        {application.property?.address?.street}, {application.property?.address?.city}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                      <span className="font-medium text-gray-900">
                        {formatCurrency(application.property?.pricing?.rent || 0)}/mo
                      </span>
                    </div>
                  </div>

                  {/* Applicant Info */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {application.applicant?.email || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {application.applicant?.phone || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3">
                    <Link
                      to={`/agent/applications/${application._id}`}
                      className="inline-flex items-center px-3 py-2 border border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <EyeIcon className="h-4 w-4 mr-2" />
                      View Details
                    </Link>
                    {application.status === 'under_review' && (
                      <Button
                        variant="outline"
                        size="small"
                        onClick={() => handleStatusUpdate(application._id, 'approved')}
                        className="inline-flex items-center px-3 py-2 border border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <CheckCircleIcon className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <div className="text-center py-12">
              <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
              <p className="mt-1 text-sm text-gray-600">
                No applications yet
              </p>
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  When tenants start applying, their applications will appear here
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TenantApplications;
