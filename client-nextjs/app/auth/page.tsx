"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "../../hooks/useApi";

// Mock user roles data
const USER_ROLES = {
  TENANT: {
    name: "Tenant",
    description: "Browse properties, message agents, apply for rentals, and pay securely",
    features: [
      "Browse all property listings",
      "Message property agents", 
      "Submit rental applications",
      "Sign digital leases",
      "Pay via M-Pesa or Stripe",
      "No subscription required"
    ],
    icon: "home",
    color: "blue"
  },
  AGENT: {
    name: "Agent", 
    description: "List properties, manage tenants, and access professional tools",
    features: [
      "Create and manage Spaces",
      "List unlimited properties",
      "Lead scoring and analytics",
      "Automated rent collection",
      "Tenant management tools"
    ],
    icon: "business_center",
    color: "green",
    plans: [
      { name: "Basic", price: "KES 4,900", features: ["10 properties", "Basic analytics", "Email support"] },
      { name: "Pro", price: "KES 9,900", features: ["50 properties", "Advanced analytics", "Priority support", "Lead scoring"] }
    ]
  },
  ADMIN: {
    name: "Admin",
    description: "Platform operations and content moderation",
    features: [
      "Approve Spaces and listings",
      "Moderate content and users",
      "Manage user accounts",
      "Handle customer support",
      "Platform analytics dashboard"
    ],
    icon: "admin_panel_settings",
    color: "purple",
    limitations: [
      "Cannot access financial settings",
      "Cannot create other Admins",
      "Limited to operational tasks"
    ]
  },
  SUPER_ADMIN: {
    name: "Super Admin",
    description: "Complete system control and oversight",
    features: [
      "Unrestricted system access",
      "Promote/demote Admins",
      "Change commission rates",
      "Edit subscription plans",
      "Manage API keys",
      "Access immutable audit log"
    ],
    icon: "security",
    color: "red"
  }
};

export default function AuthPage() {
  const { login, loading, isAuthenticated } = useAuth();
  const [selectedRole, setSelectedRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [loginError, setLoginError] = useState("");
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const userRole = localStorage.getItem('userRole');
      switch (userRole) {
        case 'TENANT':
          router.push('/dashboard');
          break;
        case 'AGENT':
          router.push('/agent/dashboard');
          break;
        case 'ADMIN':
          router.push('/admin/dashboard');
          break;
        case 'SUPER_ADMIN':
          router.push('/admin/super-admin');
          break;
        default:
          router.push('/properties');
      }
    }
  }, [isAuthenticated, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    
    if (!selectedRole || !email || !password) {
      setLoginError("Please fill in all required fields");
      return;
    }

    if (selectedRole === 'AGENT' && !selectedPlan) {
      setLoginError("Please select a subscription plan");
      return;
    }

    try {
      await login(email, password, selectedRole);
      
      // Redirect will be handled by the useEffect above
    } catch (error: any) {
      setLoginError(error.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Image
            className="mx-auto h-16 w-auto"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJ8KofWPO5xUGFJkdwdoM58vvGpkgNXbzzF1m6N5BBw4Mxu6eX2nVj4lv1RlVtkbOv_OGNsAyipk9SFNYx4UBn-bGgDRxzyAqRksH8JftTUld9vwC25o_SxEwqleToK_4zrGFr5WuJNrKUxPTfVRAA1r0e2H-38KsNdtaVrYeTR_M71pq59bvGks6DMhOMGvzBQwd8Vpq1Jt7pdKTlnYOJVNyLskfxiERmE-HeIJZ_2nxKJBehhomlvm8xiGO7XDiU-tVV9uTASy8"
            alt="PropRent Logo"
            width={64}
            height={64}
          />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Welcome to PropRent
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Choose your role to get started
          </p>
        </div>

        {/* Role Selection */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Select Your Role</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(USER_ROLES).map(([key, role]) => (
              <div
                key={key}
                onClick={() => setSelectedRole(key)}
                className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedRole === key
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    role.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                    role.color === 'green' ? 'bg-green-100 text-green-600' :
                    role.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    <span className="material-symbols-outlined text-2xl">{role.icon}</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{role.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Features:</p>
                  <ul className="space-y-1">
                    {role.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Limitations for Admin */}
                {'limitations' in role && role.limitations && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-xs font-semibold text-yellow-800 uppercase tracking-wider mb-2">Limitations:</p>
                    <ul className="space-y-1">
                      {role.limitations.map((limitation, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-yellow-600 text-sm">warning</span>
                          <span className="text-sm text-yellow-800">{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Agent Plans */}
                {'plans' in role && role.plans && (
                  <div className="mt-4 space-y-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Choose Plan:</p>
                    <div className="space-y-2">
                      {role.plans.map((plan) => (
                        <div
                          key={plan.name}
                          onClick={() => setSelectedPlan(plan.name)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedPlan === plan.name
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-gray-900">{plan.name}</p>
                              <p className="text-sm text-gray-600">{plan.price}/month</p>
                            </div>
                          </div>
                          <div className="mt-2">
                            <div className="flex flex-wrap gap-1">
                              {plan.features.map((feature, idx) => (
                                <span key={idx} className="inline-block px-2 py-1 bg-gray-100 text-xs text-gray-700 rounded">
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Selection Indicator */}
                {selectedRole === key && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-sm">check</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {selectedRole === 'AGENT' && !selectedPlan && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Please select a subscription plan to continue as an Agent
                </p>
              </div>
            )}

            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{loginError}</p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={!selectedRole || (selectedRole === 'AGENT' && !selectedPlan) || loading}
                className="flex w-full justify-center items-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Forgot your password?
                </a>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">Don't have an account?</span>{' '}
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign up
                </a>
              </div>
            </div>
          </form>
        </div>

        {/* Quick Links */}
        <div className="mt-8 text-center">
          <div className="flex justify-center space-x-8">
            <a href="#" className="text-gray-500 hover:text-gray-700">
              <span className="material-symbols-outlined">help</span>
              <span className="ml-2 text-sm">Help Center</span>
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-700">
              <span className="material-symbols-outlined">privacy_tip</span>
              <span className="ml-2 text-sm">Privacy Policy</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
