'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { Payment } from '../../lib/types'
import { 
  CreditCardIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ArrowPathIcon,
  BanknotesIcon,
  PhoneIcon
} from '@heroicons/react/24/outline'

export default function PaymentsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'mpesa'>('stripe')
  const [processing, setProcessing] = useState(false)
  const [mpesaPhone, setMpesaPhone] = useState('')

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    fetchPayments()
  }, [user, filter])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/payments?status=${filter}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPayments(data.payments)
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const processStripePayment = async (paymentId: string) => {
    try {
      setProcessing(true)
      const token = localStorage.getItem('token')
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ paymentId })
      })

      if (response.ok) {
        const data = await response.json()
        // Redirect to Stripe Checkout
        window.location.href = data.checkoutUrl
      }
    } catch (error) {
      console.error('Failed to create Stripe payment:', error)
    } finally {
      setProcessing(false)
    }
  }

  const processMpesaPayment = async (paymentId: string, phoneNumber: string) => {
    try {
      setProcessing(true)
      const token = localStorage.getItem('token')
      const response = await fetch('/api/payments/mpesa/stk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          paymentId, 
          phoneNumber: phoneNumber.startsWith('+') ? phoneNumber : `+254${phoneNumber.slice(1)}` 
        })
      })

      if (response.ok) {
        const data = await response.json()
        setShowPaymentModal(false)
        // Show success message and check payment status
        alert('M-Pesa STK push sent! Please check your phone to complete the payment.')
        fetchPayments() // Refresh payments list
      }
    } catch (error) {
      console.error('Failed to process M-Pesa payment:', error)
    } finally {
      setProcessing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'refunded':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5" />
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5" />
      case 'failed':
        return <XCircleIcon className="h-5 w-5" />
      case 'refunded':
        return <ArrowPathIcon className="h-5 w-5" />
      default:
        return <CreditCardIcon className="h-5 w-5" />
    }
  }

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'stripe':
        return <CreditCardIcon className="h-5 w-5" />
      case 'mpesa':
        return <PhoneIcon className="h-5 w-5" />
      case 'bank_transfer':
        return <BanknotesIcon className="h-5 w-5" />
      default:
        return <BanknotesIcon className="h-5 w-5" />
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const filteredPayments = payments.filter(payment => {
    if (filter === 'all') return true
    return payment.status === filter
  })

  const handlePayment = (paymentId: string) => {
    if (paymentMethod === 'stripe') {
      processStripePayment(paymentId)
    } else {
      setShowPaymentModal(true)
    }
  }

  const handleMpesaSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const selectedPayment = payments.find(p => p.status === 'pending')
    if (selectedPayment) {
      processMpesaPayment(selectedPayment.id, mpesaPhone)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    )
  }

  return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
              <p className="text-gray-600 mt-1">
                Manage your rent payments, deposits, and other transactions
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as 'stripe' | 'mpesa')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="stripe">Credit Card (Stripe)</option>
                <option value="mpesa">M-Pesa</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex space-x-2">
            {['all', 'pending', 'completed', 'failed', 'refunded'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Paid</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(
                    payments
                      .filter(p => p.status === 'completed')
                      .reduce((sum, p) => sum + p.amount, 0),
                    'KES'
                  )}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(
                    payments
                      .filter(p => p.status === 'pending')
                      .reduce((sum, p) => sum + p.amount, 0),
                    'KES'
                  )}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Next Payment</p>
                <p className="text-2xl font-bold text-gray-900">
                  {payments
                    .filter(p => p.status === 'pending' && p.dueDate)
                    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())[0]
                    ? formatCurrency(
                        payments
                          .filter(p => p.status === 'pending' && p.dueDate)
                          .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())[0].amount,
                        'KES'
                      )
                    : 'N/A'
                  }
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <CreditCardIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Payments List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCardIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
              <p className="text-gray-500">
                {filter === 'all' 
                  ? 'You haven\'t made any payments yet'
                  : `No ${filter} payments`
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {payment.description}
                          </div>
                          {payment.propertyId && (
                            <div className="text-sm text-gray-500">
                              Property ID: {payment.propertyId}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 capitalize">
                          {payment.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getPaymentIcon(payment.method)}
                          <span className="ml-2 text-sm text-gray-900 capitalize">
                            {payment.method.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(payment.amount, payment.currency)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                          {getStatusIcon(payment.status)}
                          <span className="ml-1">{payment.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.dueDate ? formatDate(payment.dueDate) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {payment.status === 'pending' ? (
                          <button
                            onClick={() => handlePayment(payment.id)}
                            disabled={processing}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                          >
                            {processing ? 'Processing...' : `Pay with ${paymentMethod === 'stripe' ? 'Card' : 'M-Pesa'}`}
                          </button>
                        ) : payment.status === 'completed' ? (
                          <button className="text-gray-600 hover:text-gray-900">
                            View Receipt
                          </button>
                        ) : (
                          <button className="text-red-600 hover:text-red-900">
                            Retry Payment
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* M-Pesa Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">M-Pesa Payment</h3>
              <form onSubmit={handleMpesaSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    M-Pesa Phone Number
                  </label>
                  <input
                    type="tel"
                    value={mpesaPhone}
                    onChange={(e) => setMpesaPhone(e.target.value)}
                    placeholder="07XX XXX XXX"
                    required
                    pattern="07[0-9]{8}"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter your M-Pesa registered phone number
                  </p>
                </div>
                <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    You will receive an STK push on your phone to complete the payment.
                    Please enter your M-Pesa PIN when prompted.
                  </p>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {processing ? 'Sending STK Push...' : 'Send STK Push'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    )
}
