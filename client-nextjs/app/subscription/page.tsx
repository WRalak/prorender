'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { Subscription } from '../../lib/types'
import { AGENT_SUBSCRIPTION_PLANS, SUBSCRIPTION_PLANS } from '../../lib/constants'
import { 
  CreditCardIcon, 
  CheckIcon, 
  StarIcon,
  PhoneIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'

export default function SubscriptionPage() {
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000)
  }, [])

  const getPlans = () => {
    return user?.role === 'agent' ? AGENT_SUBSCRIPTION_PLANS : SUBSCRIPTION_PLANS
  }

  const getYearlyPrice = (monthlyPrice: number) => {
    return Math.round(monthlyPrice * 12 * 0.8) // 20% discount for yearly
  }

  const plans = getPlans()

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
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Choose Your Perfect Plan
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          {user?.role === 'agent' 
            ? 'Powerful tools for property agents to grow their business'
            : 'Unlock premium features for your rental journey'
          }
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-md font-medium ${
              billingCycle === 'monthly'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2 rounded-md font-medium ${
              billingCycle === 'yearly'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Yearly (Save 20%)
          </button>
        </div>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Object.values(plans).map((plan) => (
          <div
            key={plan.id}
            className={`bg-white rounded-xl shadow-lg p-8 border-2 transition-all ${
              selectedPlan === plan.id
                ? 'border-blue-500 shadow-xl'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-gray-600">{plan.description}</p>
            </div>

            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                ${billingCycle === 'yearly' ? getYearlyPrice(plan.price) : plan.price}
                <span className="text-lg text-gray-600">
                  /{billingCycle === 'yearly' ? 'year' : 'month'}
                </span>
              </div>
              {billingCycle === 'yearly' && (
                <p className="text-sm text-green-600 font-medium">
                  Save ${Math.round(plan.price * 12 * 0.2)} per year
                </p>
              )}
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => setSelectedPlan(plan.id)}
              className={`w-full py-3 px-6 rounded-lg font-medium transition-all ${
                selectedPlan === plan.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {selectedPlan === plan.id ? 'Selected' : 'Choose Plan'}
            </button>
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Can I change plans anytime?
            </h3>
            <p className="text-gray-600">
              Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              What payment methods do you accept?
            </h3>
            <p className="text-gray-600">
              We accept all major credit cards, debit cards, and M-Pesa for local payments.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Is there a setup fee?
            </h3>
            <p className="text-gray-600">
              No, we don't charge any setup fees. You only pay for your monthly or yearly subscription.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Can I cancel anytime?
            </h3>
            <p className="text-gray-600">
              Absolutely. You can cancel your subscription at any time. Your access will continue until the end of your current billing period.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center mt-12">
        <button
          disabled={!selectedPlan}
          className="px-8 py-4 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {selectedPlan ? 'Continue to Payment' : 'Select a Plan to Continue'}
        </button>
      </div>
    </div>
  )
}
