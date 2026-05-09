"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  CreditCardIcon,
  CheckCircleIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ChartBarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

// Subscription plans
const SUBSCRIPTION_PLANS = {
  BASIC: {
    name: "Basic",
    price: 4900,
    currency: "KES",
    billing: "monthly",
    features: [
      "List up to 10 properties",
      "Basic analytics dashboard",
      "Email support (48hr response)",
      "Standard listing templates",
      "Mobile app access"
    ],
    limitations: [
      "No lead scoring",
      "No advanced analytics",
      "No priority support"
    ],
    color: "gray",
    popular: false
  },
  PRO: {
    name: "Pro", 
    price: 9900,
    currency: "KES",
    billing: "monthly",
    features: [
      "List up to 50 properties",
      "Advanced analytics & insights",
      "Lead scoring algorithm",
      "Priority support (24hr response)",
      "Custom branding options",
      "Automated rent collection",
      "Tenant screening tools",
      "Mobile app with premium features"
    ],
    limitations: [],
    color: "blue",
    popular: true
  }
};

export default function AgentSubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState("BASIC");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [currentPlan, setCurrentPlan] = useState("BASIC");
  const [isUpgrading, setIsUpgrading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Simulate fetching current subscription
    setCurrentPlan("BASIC");
  }, []);

  const handleSubscribe = async (plan: string) => {
    setIsUpgrading(true);
    
    // Simulate API call
    setTimeout(() => {
      setCurrentPlan(plan);
      setIsUpgrading(false);
      router.push('/agent/dashboard');
    }, 2000);
  };

  const calculateSavings = () => {
    if (billingCycle === 'yearly') {
      return Math.round((SUBSCRIPTION_PLANS.PRO.price * 12 * 0.9)); // 10% discount for yearly
    }
    return SUBSCRIPTION_PLANS.PRO.price;
  };

  const getPlanPrice = (plan: typeof SUBSCRIPTION_PLANS.BASIC | typeof SUBSCRIPTION_PLANS.PRO) => {
    const basePrice = plan.price;
    if (billingCycle === 'yearly') {
      return Math.round(basePrice * 12 * 0.9);
    }
    return basePrice;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Agent Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Unlock powerful tools to grow your rental business and manage properties efficiently
          </p>
        </div>

        {/* Current Plan Alert */}
        {currentPlan && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-600">business_center</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Current Plan: <span className="font-bold">{SUBSCRIPTION_PLANS[currentPlan as keyof typeof SUBSCRIPTION_PLANS].name}</span>
                  </p>
                  <p className="text-xs text-blue-700">
                    {currentPlan === 'BASIC' ? '3/10 properties used' : '12/50 properties used'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push('/agent/dashboard')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-sm p-1 flex">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
                billingCycle === 'yearly'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                Save 10%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => {
            const isSelected = selectedPlan === key;
            const isCurrent = currentPlan === key;
            
            return (
              <div
                key={key}
                onClick={() => setSelectedPlan(key)}
                className={`relative bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-all ${
                  isSelected ? 'ring-2 ring-blue-500 scale-105' : 'hover:shadow-xl'
                } ${isCurrent ? 'opacity-75' : ''}`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                {/* Current Plan Badge */}
                {isCurrent && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      CURRENT PLAN
                    </span>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {plan.name}
                    </h3>
                    <div className="text-right">
                      <p className="text-4xl font-bold text-gray-900">
                        {plan.currency} {getPlanPrice(plan).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        /{billingCycle}
                      </p>
                      {billingCycle === 'yearly' && (
                        <p className="text-xs text-green-600 font-medium">
                          Save {plan.currency} {calculateSavings().toLocaleString()}/year
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-4">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}

                    {/* Limitations */}
                    {plan.limitations && plan.limitations.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-sm font-medium text-gray-500 mb-3">Limitations:</p>
                        <div className="space-y-2">
                          {plan.limitations.map((limitation, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                              <span className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5">•</span>
                              <span className="text-sm text-gray-600">{limitation}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <div className="p-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => handleSubscribe(key)}
                    disabled={isCurrent || isUpgrading}
                    className={`w-full py-3 px-4 rounded-lg text-sm font-semibold transition-colors ${
                      isCurrent
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : plan.color === 'blue' 
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-900 text-white hover:bg-gray-800'
                    } disabled:opacity-75`}
                  >
                    {isUpgrading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </div>
                    ) : isCurrent ? (
                      'Current Plan'
                    ) : (
                      `Get ${plan.name}`
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Compare Plans
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature List */}
            <div className="space-y-4">
              <div className="text-sm font-medium text-gray-700">Properties</div>
              <div className="text-sm font-medium text-gray-700">Analytics</div>
              <div className="text-sm font-medium text-gray-700">Support</div>
              <div className="text-sm font-medium text-gray-700">Lead Scoring</div>
              <div className="text-sm font-medium text-gray-700">Rent Collection</div>
              <div className="text-sm font-medium text-gray-700">Custom Branding</div>
            </div>

            {/* Basic Plan */}
            <div className="space-y-4">
              <div className="text-2xl font-bold text-gray-900">10</div>
              <div className="text-sm text-gray-600">Basic</div>
              <div className="text-sm text-gray-600">Email (48hr)</div>
              <div className="text-gray-400 text-2xl">—</div>
              <div className="text-gray-400 text-2xl">—</div>
              <div className="text-gray-400 text-2xl">—</div>
            </div>

            {/* Pro Plan */}
            <div className="space-y-4 bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">50</div>
              <div className="text-sm text-blue-600">Advanced</div>
              <div className="text-sm text-blue-600">Priority (24hr)</div>
              <div className="text-green-600 text-2xl">✓</div>
              <div className="text-green-600 text-2xl">✓</div>
              <div className="text-green-600 text-2xl">✓</div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center space-x-8 mb-8">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-600">30-day money-back guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <StarIcon className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-gray-600">4.8/5 rating from agents</span>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Frequently Asked Questions
          </h3>
          
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Can I change plans anytime?
              </h4>
              <p className="text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. When upgrading, you'll have immediate access to new features. When downgrading, changes take effect at the next billing cycle.
              </p>
            </div>
            
            <div className="border-b border-gray-200 pb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                What payment methods are accepted?
              </h4>
              <p className="text-gray-600">
                We accept M-Pesa, credit cards, and bank transfers for all subscription payments. All transactions are secured with industry-standard encryption.
              </p>
            </div>
            
            <div className="pb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Is there a contract or commitment?
              </h4>
              <p className="text-gray-600">
                No contracts! All our plans are month-to-month with no long-term commitments. You can cancel your subscription at any time without penalties.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
