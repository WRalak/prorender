import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { paymentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { CreditCardIcon, CalendarIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency } from '../../utils/formatCurrency';

const Payments = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);

  const { data: paymentsData, isLoading, error } = useQuery(
    ['payments', filter, page],
    () => paymentAPI.getPayments({ status: filter === 'all' ? undefined : filter, page }),
    {
      keepPreviousData: true,
    }
  );

  const payments = paymentsData?.payments || [];
  const pagination = paymentsData?.pagination || {};

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'failed':
        return 'text-red-600';
      case 'refunded':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5" />;
      case 'failed':
        return <ExclamationTriangleIcon className="h-5 w-5" />;
      case 'refunded':
        return <CreditCardIcon className="h-5 w-5" />;
      default:
        return <CalendarIcon className="h-5 w-5" />;
    }
  };

  const filters = [
    { value: 'all', label: 'All Payments' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { 'value': 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' },
  ];

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading && !payments.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" text="Loading payments..." />
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
        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load payments</h3>
        <p className="text-gray-600">Please try again later.</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
        <p className="mt-2 text-gray-600">
          Track your payment history and upcoming payments
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <Card.Body>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Paid</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${formatCurrency(
                    payments.reduce((sum, payment) => sum + payment.amount, 0)
                  )}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <CreditCardIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(
                    payments
                      .filter((p) => p.status === 'pending')
                      .reduce((sum, payment) => sum + payment.amount, 0)
                  )}
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(
                    payments
                      .filter((p) => p.status === 'pending' && new Date(p.dueDate) < new Date())
                      .reduce((sum, payment) => sum + payment.amount, 0)
                  )}
                </p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </Card.Body>
        </Card>
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

      {/* Payments List */}
      {payments.length === 0 ? (
        <div className="text-center py-12">
          <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
          <p className="text-gray-600 mb-4">
            {filter === 'all' 
              ? "You don't have any payment history yet."
              : `No ${filter.toLowerCase()} payments found.`}
          </p>
          <Link to="/properties">
            <Button variant="primary">Browse Properties</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment._id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(payment.status)}
                    <StatusBadge status={payment.status} />
                  </div>
                  
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {payment.type === 'rent' ? 'Rent Payment' : payment.type.charAt(0).toUpperCase() + payment.type.slice(1)}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium text-gray-900">Amount:</span>
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(payment.amount)}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Due Date:</span>
                      <p>{formatDate(payment.dueDate)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Property:</span>
                      <p className="truncate">{payment.property?.title || 'Unknown Property'}</p>
                    </div>
                  </div>

                  {payment.description && (
                    <div className="mt-4">
                      <span className="font-medium text-gray-900">Description:</span>
                      <p className="text-gray-600 mt-1">{payment.description}</p>
                    </div>
                  )}

                  {payment.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Notes:</span> {payment.notes}
                      </p>
                    </div>
                  )}

                  {payment.status === 'failed' && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-800">
                        <span className="font-medium">Reason:</span> {payment.failureReason || 'Payment failed'}
                      </p>
                    </div>
                  )}

                  {payment.status === 'refunded' && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm text-blue-800">
                        <span className="font-medium">Refund Reason:</span> {payment.refundReason || 'Refunded by request'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="ml-4 flex flex-col space-y-2">
                  <span className={`text-sm font-medium ${getStatusColor(payment.status)}`}>
                    {formatCurrency(payment.amount)}
                  </span>
                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => {
                      // Handle payment actions
                    }}
                  >
                    View Details
                  </Button>
                  {payment.status === 'pending' && (
                    <Button
                      variant="primary"
                      size="small"
                      onClick={() => {
                        // Handle payment
                      }}
                    >
                      Pay Now
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
    </div>
  );
};

export default Payments;
