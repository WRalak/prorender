import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Subscription = () => {
  const { user, hasSubscription, getSubscriptionPlan } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const plans = [
    {
      id: 'basic',
      name: 'Basic Agent',
      price: 4900,
      currency: 'KES',
      period: 'month',
      features: [
        'Up to 10 property listings',
        'Basic analytics dashboard',
        'Chat with tenants',
        'Schedule viewings',
        'Email support',
        'Basic branding options'
      ],
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro Agent',
      price: 9900,
      currency: 'KES',
      period: 'month',
      features: [
        'Up to 50 property listings',
        'Advanced analytics dashboard',
        'Chat with tenants (file attachments)',
        'Schedule viewings + Google Calendar sync',
        'Priority support',
        'Advanced branding options',
        'Lease generation tools',
        'Rent collection via Stripe'
      ],
      popular: true
    }
  ];

  const currentPlan = getSubscriptionPlan();

  const handleSubscribe = async (planId) => {
    setIsProcessing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update user with subscription
      const updatedUser = {
        ...user,
        subscription: {
          plan: planId,
          status: 'active',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      };
      
      // Update user in context
      // This would normally be handled by an API call
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast.success(`Successfully subscribed to ${planId.toUpperCase()} plan!`);
      setSelectedPlan(null);
    } catch (error) {
      toast.error('Failed to process subscription. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsProcessing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Remove subscription from user
      const updatedUser = {
        ...user,
        subscription: null
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast.success('Subscription cancelled successfully');
    } catch (error) {
      toast.error('Failed to cancel subscription. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600">
            Unlock powerful features to grow your rental business
          </p>
        </div>

        {hasSubscription ? (
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                You're on the {currentPlan?.toUpperCase()} Plan
              </h2>
              <p className="text-gray-600 mb-6">
                Your subscription is active and you have access to all {currentPlan} features.
              </p>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Current Plan Details:</h3>
                  <p className="text-gray-600">Plan: {currentPlan?.toUpperCase()}</p>
                  <p className="text-gray-600">Status: Active</p>
                  <p className="text-gray-600">Next billing: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={handleCancelSubscription}
                  disabled={isProcessing}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : 'Cancel Subscription'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-lg shadow-lg overflow-hidden ${
                  plan.popular ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {plan.popular && (
                  <div className="bg-blue-500 text-white text-center py-2 text-sm font-semibold">
                    MOST POPULAR
                  </div>
                )}
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.currency} {plan.price.toLocaleString()}
                    </span>
                    <span className="text-gray-600">/{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isProcessing}
                    className={`w-full py-3 px-4 rounded-md font-semibold transition-colors ${
                      plan.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isProcessing ? 'Processing...' : `Subscribe to ${plan.name}`}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <div className="bg-blue-50 rounded-lg p-8 max-w-3xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Why Choose PropRent?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">No Hidden Fees</h4>
                <p className="text-gray-600 text-sm">
                  Transparent pricing with no setup costs or hidden charges
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Cancel Anytime</h4>
                <p className="text-gray-600 text-sm">
                  No long-term commitments. Cancel your subscription anytime.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">24/7 Support</h4>
                <p className="text-gray-600 text-sm">
                  Get help when you need it with our dedicated support team.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
