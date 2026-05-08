import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  BuildingOfficeIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { applicationAPI } from '../../services/api';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate, formatCurrency } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';

const ApplicationDetails = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const { data: application, isLoading, error } = useQuery(
    ['application', id],
    () => applicationAPI.getApplicationById(id),
    {
      enabled: !!id,
      retry: 1,
      onError: () => {
        toast.error('Application not found');
        navigate('/applications');
      },
    }
  );

  const withdrawApplicationMutation = useMutation(
    (applicationId) => applicationAPI.withdrawApplication(applicationId),
    {
      onSuccess: () => {
        toast.success('Application withdrawn successfully');
        navigate('/applications');
      },
      onError: () => {
        toast.error('Failed to withdraw application');
      },
    }
  );

  const handleWithdraw = () => {
    if (window.confirm('Are you sure you want to withdraw this application?')) {
      withdrawApplicationMutation.mutate(id);
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
      case 'draft':
        return <DocumentTextIcon className="h-5 w-5" />;
      case 'submitted':
        return <ClockIcon className="h-5 w-5" />;
      case 'under_review':
        return <ClockIcon className="h-5 w-5" />;
      case 'pending_documents':
        return <ExclamationTriangleIcon className="h-5 w-5" />;
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'rejected':
        return <ExclamationTriangleIcon className="h-5 w-5" />;
      case 'withdrawn':
        return <ArrowLeftIcon className="h-5 w-5" />;
      case 'expired':
        return <ClockIcon className="h-5 w-5" />;
      default:
        return <DocumentTextIcon className="h-5 w-5" />;
    }
  };

  const formatDateWithTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return <LoadingSpinner size="large" text="Loading application details..." />;
  }

  if (error || !application) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Application not found</h2>
          <p className="mt-2 text-gray-600">
            The application you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/applications">
            <Button className="mt-4">View Applications</Button>
          </Link>
        </div>
      </div>
    );
  }

  const property = application.property;
  const applicant = application.applicant;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/applications" className="text-gray-600 hover:text-gray-900">
              ← Back to Applications
            </Link>
            <div className="flex items-center space-x-4">
              {application.status === 'draft' && (
                <Button
                  variant="outline"
                  onClick={() => navigate(`/applications/edit/${id}`)}
                >
                  Edit
                </Button>
              )}
              {(application.status === 'submitted' ||
                application.status === 'under_review' ||
                application.status === 'pending_documents') && (
                <Button
                  variant="outline"
                  onClick={() => setShowWithdrawModal(true)}
                >
                  Withdraw
                </Button>
              )}
              {application.status === 'approved' && (
                <Button
                  onClick={() => {
                    toast.success('Application approved! Preparing lease agreement...');
                  }}
                >
                  View Lease
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Application Status */}
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Application Status</h2>
                  <StatusBadge
                    status={application.status}
                    color={getStatusColor(application.status)}
                    icon={getStatusIcon(application.status)}
                  />
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      Last updated: {formatDateWithTime(application.updatedAt)}
                    </span>
                  </div>
                </div>
                {application.status === 'approved' && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center space-x-2">
                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      <span className="text-sm text-green-800">
                        Congratulations! Your application has been approved.
                      </span>
                    </div>
                  </div>
                )}
                {application.status === 'rejected' && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-center space-x-2">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                      <span className="text-sm text-red-800">
                        Your application was rejected. Contact support for more information.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Personal Information */}
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">First Name</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {applicant?.name?.first || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Name</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {applicant?.name?.last || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {applicant?.email || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {applicant?.phone || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Employment Information */}
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Employment Information</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Current Employer</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {application.employmentInfo?.employerName || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Position</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {application.employmentInfo?.position || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Monthly Income</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {application.employmentInfo?.income
                          ? formatCurrency(application.employmentInfo.income)
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Rental History */}
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Rental History</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Current Address</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {application.rentalHistory?.currentAddress || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Current Landlord</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {application.rentalHistory?.currentLandlord || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Reason for Moving</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {application.rentalHistory?.reasonForMoving || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Application Summary */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Application Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Application ID:</span>
                    <span className="text-sm font-mono text-gray-900">#{application._id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Submitted:</span>
                    <span className="text-sm text-gray-900">
                      {formatDateWithTime(application.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Property:</span>
                    <span className="text-sm text-gray-900 truncate max-w-xs">
                      {property?.title}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Status:</span>
                    <StatusBadge
                      status={application.status}
                      color={getStatusColor(application.status)}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Property Details */}
            {property && (
              <Card>
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Property Details</h2>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                      <span>{property.type}</span>
                      <span className="font-medium text-gray-900">
                        {property.bedrooms} bed, {property.bathrooms} bath
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPinIcon className="h-5 w-5 mr-2" />
                      <span>
                        {property.address?.street}, {property.address?.city}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium text-gray-900">
                        {formatCurrency(property.pricing?.rent || 0)}/mo
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Actions */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Actions</h2>
                <div className="space-y-3">
                  {application.status === 'draft' && (
                    <Button
                      onClick={() => navigate(`/applications/apply/${id}`)}
                      className="w-full"
                    >
                      Continue Application
                    </Button>
                  )}
                  {(application.status === 'submitted' ||
                    application.status === 'under_review' ||
                    application.status === 'pending_documents') && (
                    <Button
                      onClick={() => setShowWithdrawModal(true)}
                      variant="outline"
                      className="w-full"
                    >
                      Withdraw Application
                    </Button>
                  )}
                  {application.status === 'approved' && (
                    <Button
                      onClick={() => {
                        toast.success('Application approved! Preparing lease agreement...');
                      }}
                      className="w-full"
                    >
                      View Lease Agreement
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Withdraw Confirmation Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Withdraw Application</h3>
            <p className="text-sm text-gray-600">
              Are you sure you want to withdraw this application? You can reactivate it anytime.
            </p>
            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowWithdrawModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleWithdraw}
                loading={withdrawApplicationMutation.isLoading}
              >
                Withdraw
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationDetails;
