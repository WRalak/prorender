import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeftIcon, CurrencyDollarIcon, CalendarIcon, CheckCircleIcon, ExclamationTriangleIcon, ClockIcon, DocumentTextIcon, CreditCardIcon } from "@heroicons/react/24/outline";
import { useAuth } from '../../context/AuthContext';
import { paymentAPI } from '../../services/api';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate, formatCurrency } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';

const PaymentDetails = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showRefundModal, setShowRefundModal] = useState(false);

  const { data: payment, isLoading, error } = useQuery(
    ['payment', id],
    () => paymentAPI.getPaymentById(id),
    {
      enabled: !!id,
      retry: 1,
      onError: () => {
        toast.error('Payment not found');
        navigate('/payments');
      },
    }
  );

  const refundPaymentMutation = useMutation(
    ({ paymentId, reason }) => paymentAPI.refundPayment(paymentId, reason),
    {
      onSuccess: () => {
        toast.success('Refund request submitted successfully');
        setShowRefundModal(false);
        queryClient.invalidateQueries(['payment', id]);
      },
      onError: () => {
        toast.error('Failed to submit refund request');
      },
    }
  );

  const handleRefund = (reason) => {
    refundPaymentMutation.mutate({
      paymentId: id,
      reason,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'yellow';
      case 'processing':
        return 'blue';
      case 'completed':
        return 'green';
      case 'failed':
        return 'red';
      case 'cancelled':
        return 'gray';
      case 'refunded':
        return 'orange';
      case 'partially_refunded':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5" />;
      case 'processing':
        return <CurrencyDollarIcon className="h-5 w-5" />;
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'failed':
        return <ExclamationTriangleIcon className="h-5 w-5" />;
      case 'cancelled':
        return <ClockIcon className="h-5 w-5" />;
      case 'refunded':
        return <ArrowLeftIcon className="h-5 w-5" />;
      case 'partially_refunded':
        return <ArrowLeftIcon className="h-5 w-5" />;
      default:
        return <CurrencyDollarIcon className="h-5 w-5" />;
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'credit_card':
        return <CreditCardIcon className="h-5 w-5" />;
      case 'debit_card':
        return <CreditCardIcon className="h-5 w-5" />;
      case 'bank_transfer':
        return <BankNotesIcon className="h-5 w-5" />;
      case 'cash':
        return <BankNotesIcon className="h-5 w-5" />;
      default:
        return <CurrencyDollarIcon className="h-5 w-5" />;
    }
  };

  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case 'credit_card':
        return 'Credit Card';
      case 'debit_card':
        return 'Debit Card';
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'cash':
        return 'Cash';
      default:
        return method;
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="large" text="Loading payment details..." />;
  }

  if (error || !payment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Payment not found</h2>
          <p className="mt-2 text-gray-600">
            The payment you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/payments">
            <Button className="mt-4">View Payments</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/payments" className="text-gray-600 hover:text-gray-900">
              ← Back to Payments
            </Link>
            <div className="flex items-center space-x-4">
              {payment.status === 'completed' && (
                <Button
                  variant="outline"
                  onClick={() => setShowRefundModal(true)}
                  className="flex items-center"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Request Refund
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  // Handle receipt download
                  window.open(`/api/payments/${id}/receipt`, '_blank');
                }}
                className="flex items-center"
              >
                <DownloadIcon className="h-4 w-4 mr-2" />
                Download Receipt
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Payment Status */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Payment Status</h2>
                <StatusBadge
                  status={payment.status}
                  color={getStatusColor(payment.status)}
                  icon={getStatusIcon(payment.status)}
                />
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Payment ID</p>
                    <p className="text-lg font-mono text-gray-900">#{payment._id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(payment.amount)}
                    </p>
                  </div>
                </div>
              </div>
              {payment.status === 'completed' && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-green-800">
                      Payment completed successfully
                    </span>
                  </div>
                </div>
              )}
              {payment.status === 'failed' && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-center space-x-2">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                    <span className="text-sm text-red-800">
                      Payment failed. Please try again or contact support.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Payment Information */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Information</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Payment Type</label>
                    <p className="mt-1 text-sm text-gray-900 capitalize">
                      {payment.type}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                    <div className="mt-1 flex items-center text-sm text-gray-900">
                      {getPaymentMethodIcon(payment.paymentMethod)}
                      <span className="ml-2">
                        {getPaymentMethodLabel(payment.paymentMethod)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Due Date</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDate(payment.dueDate)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Paid Date</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {payment.paidAt ? formatDate(payment.paidAt) : 'Not paid yet'}
                    </p>
                  </div>
                </div>
                {payment.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {payment.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Related Information */}
          {payment.lease && (
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Related Lease</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Property</p>
                      <p className="text-sm text-gray-900">
                        {payment.lease.property?.title || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Lease Period</p>
                      <p className="text-sm text-gray-900">
                        {formatDate(payment.lease.startDate)} - {formatDate(payment.lease.endDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Tenant</p>
                      <p className="text-sm text-gray-900">
                        {payment.lease.tenant?.name || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Landlord</p>
                      <p className="text-sm text-gray-900">
                        {payment.lease.landlord?.name || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Transaction Details */}
          {payment.transaction && (
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Transaction Details</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
                      <p className="mt-1 text-sm font-mono text-gray-900">
                        {payment.transaction.id}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Gateway</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {payment.transaction.gateway || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Processor Response</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {payment.transaction.processorResponse || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Auth Code</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {payment.transaction.authCode || 'N/A'}
                      </p>
                    </div>
                  </div>
                  {payment.transaction.failureReason && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Failure Reason</label>
                      <p className="mt-1 text-sm text-red-600">
                        {payment.transaction.failureReason}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Refund Information */}
          {payment.refunds && payment.refunds.length > 0 && (
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Refund Information</h2>
                <div className="space-y-4">
                  {payment.refunds.map((refund, index) => (
                    <div key={index} className="border border-gray-200 rounded-md p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Refund #{refund._id}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(refund.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {formatCurrency(refund.amount)}
                          </p>
                          <StatusBadge
                            status={refund.status}
                            color={getStatusColor(refund.status)}
                          />
                        </div>
                      </div>
                      {refund.reason && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">Reason:</p>
                          <p className="text-sm text-gray-900">{refund.reason}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Actions</h2>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    window.open(`/api/payments/${id}/receipt`, '_blank');
                  }}
                  className="w-full"
                >
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  Download Receipt
                </Button>
                {payment.status === 'completed' && (
                  <Button
                    variant="outline"
                    onClick={() => setShowRefundModal(true)}
                    className="w-full"
                  >
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Request Refund
                  </Button>
                )}
                {payment.status === 'failed' && (
                  <Button
                    onClick={() => {
                      // Handle retry payment
                      navigate(`/payments/${id}/retry`);
                    }}
                    className="w-full"
                  >
                    Retry Payment
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Request Refund</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                handleRefund(formData.get('reason'));
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Refund Reason
                </label>
                <textarea
                  name="reason"
                  rows={4}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Please provide a reason for the refund request..."
                  required
                />
              </div>
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowRefundModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={refundPaymentMutation.isLoading}
                >
                  Submit Request
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentDetails;
