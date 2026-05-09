"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheckIcon,
  CurrencyDollarIcon,
  KeyIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

// Mock data for super admin settings
const SYSTEM_SETTINGS = {
  commissionRates: {
    agentCommission: 8.5,
    platformFee: 2.0,
    paymentGatewayFee: 1.5
  },
  subscriptionPlans: [
    {
      id: 1,
      name: "Basic",
      price: 4900,
      currency: "KES",
      billing: "monthly",
      features: ["10 properties", "Basic analytics", "Email support"],
      activeUsers: 1250,
      maxUsers: -1
    },
    {
      id: 2,
      name: "Pro",
      price: 9900,
      currency: "KES",
      billing: "monthly",
      features: ["50 properties", "Advanced analytics", "Priority support", "Lead scoring"],
      activeUsers: 890,
      maxUsers: -1
    },
    {
      id: 3,
      name: "Enterprise",
      price: 24900,
      currency: "KES",
      billing: "monthly",
      features: ["Unlimited properties", "Custom branding", "API access", "Dedicated support"],
      activeUsers: 156,
      maxUsers: 500
    }
  ],
  apiKeys: [
    {
      id: 1,
      name: "Production API",
      key: "pk_live_5123abc789def0123456789abcdef",
      permissions: ["read", "write"],
      lastUsed: "2 hours ago",
      status: "active"
    },
    {
      id: 2,
      name: "Development API",
      key: "pk_test_5123abc789def0123456789abcdef",
      permissions: ["read", "write", "admin"],
      lastUsed: "1 day ago",
      status: "active"
    },
    {
      id: 3,
      name: "Analytics API",
      key: "pk_analytics_5123abc789def0123456789abcdef",
      permissions: ["read"],
      lastUsed: "5 minutes ago",
      status: "active"
    }
  ],
  auditLog: [
    {
      id: 1,
      timestamp: "2024-01-15 14:30:00",
      user: "super_admin@prorent.com",
      action: "COMMISSION_RATE_CHANGED",
      details: "Agent commission changed from 8.0% to 8.5%",
      severity: "info",
      immutable: true
    },
    {
      id: 2,
      timestamp: "2024-01-15 12:15:00",
      user: "admin@prorent.com",
      action: "ADMIN_DEMOTED",
      details: "Admin user 'john.doe@company.com' demoted to regular user",
      severity: "warning",
      immutable: false
    },
    {
      id: 3,
      timestamp: "2024-01-15 10:30:00",
      user: "super_admin@prorent.com",
      action: "PLAN_CREATED",
      details: "New Enterprise plan created at KES 24,900/month",
      severity: "success",
      immutable: false
    },
    {
      id: 4,
      timestamp: "2024-01-14 16:45:00",
      user: "system@prorent.com",
      action: "SYSTEM_BACKUP",
      details: "Automated system backup completed successfully",
      severity: "info",
      immutable: true
    }
  ],
  adminUsers: [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.johnson@prorent.com",
      role: "admin",
      status: "active",
      lastLogin: "2 hours ago",
      permissions: ["spaces", "users", "content"]
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "michael.chen@prorent.com",
      role: "admin",
      status: "active",
      lastLogin: "1 day ago",
      permissions: ["spaces", "users"]
    },
    {
      id: 3,
      name: "David Kim",
      email: "david.kim@prorent.com",
      role: "admin",
      status: "suspended",
      lastLogin: "3 days ago",
      permissions: [],
      reason: "Policy violation"
    }
  ]
};

export default function SuperAdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user has super admin privileges
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'SUPER_ADMIN') {
      router.push('/auth');
    }
  }, [router]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
    }, 1500);
  };

  const handlePromoteAdmin = async (adminId: number) => {
    console.log(`Promoting admin ${adminId}`);
    // Simulate API call
  };

  const handleDemoteAdmin = async (adminId: number) => {
    console.log(`Demoting admin ${adminId}`);
    // Simulate API call
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Super Admin Header */}
      <header className="bg-red-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-800 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-red-200">security</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Super Admin Settings</h1>
                <p className="text-red-200">System Control & Configuration</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="p-2 text-red-200 hover:text-white hover:bg-red-800 rounded-lg">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <div className="flex items-center gap-2 pl-4 border-l border-red-700">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">Super Admin</p>
                  <p className="text-xs text-red-200">root@prorent.com</p>
                </div>
                <div className="w-10 h-10 bg-red-800 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-red-200">account_circle</span>
                </div>
              </div>
              <button className="p-2 text-red-200 hover:text-white hover:bg-red-800 rounded-lg">
                <span className="material-symbols-outlined">logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Warning Banner */}
        <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">Super Admin Access</h3>
              <p className="text-red-700">
                You have unrestricted access to all system settings. Changes made here can affect the entire platform. Please proceed with caution.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "overview"
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("commission")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "commission"
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Commission
            </button>
            <button
              onClick={() => setActiveTab("subscriptions")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "subscriptions"
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Subscriptions
            </button>
            <button
              onClick={() => setActiveTab("api")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "api"
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              API Keys
            </button>
            <button
              onClick={() => setActiveTab("audit")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "audit"
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Audit Log
            </button>
            <button
              onClick={() => setActiveTab("admins")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "admins"
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Admin Users
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <UserGroupIcon className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">2,847</p>
                  <p className="text-sm text-gray-600">Total Users</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">3</p>
                  <p className="text-sm text-gray-600">Admin Users</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <KeyIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">7</p>
                  <p className="text-sm text-gray-600">API Keys Active</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <CurrencyDollarIcon className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">KES 39.7M</p>
                  <p className="text-sm text-gray-600">Monthly Revenue</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "commission" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Commission Rates</h2>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agent Commission Rate (%)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      value={SYSTEM_SETTINGS.commissionRates.agentCommission}
                      step="0.1"
                      min="0"
                      max="100"
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                    />
                    <span className="text-gray-600">%</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform Fee (%)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      value={SYSTEM_SETTINGS.commissionRates.platformFee}
                      step="0.1"
                      min="0"
                      max="100"
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                    />
                    <span className="text-gray-600">%</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Gateway Fee (%)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      value={SYSTEM_SETTINGS.commissionRates.paymentGatewayFee}
                      step="0.1"
                      min="0"
                      max="100"
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                    />
                    <span className="text-gray-600">%</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isSaving ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "subscriptions" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Subscription Plans</h2>
              <button className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700">
                Create New Plan
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plan Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Active Users
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Max Users
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {SYSTEM_SETTINGS.subscriptionPlans.map((plan) => (
                      <tr key={plan.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="font-medium text-gray-900">{plan.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-900">
                            {plan.currency} {plan.price.toLocaleString()}/month
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-900">{plan.activeUsers.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-900">
                            {plan.maxUsers === -1 ? 'Unlimited' : plan.maxUsers.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            plan.maxUsers === -1 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            Active
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button className="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700">
                              Edit
                            </button>
                            <button className="px-2 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "api" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">API Keys Management</h2>
              <button className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700">
                Generate New Key
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow">
              <div className="divide-y divide-gray-200">
                {SYSTEM_SETTINGS.apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="p-6 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{apiKey.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            apiKey.status === 'active' ? 'bg-green-100 text-green-800' : 
                            apiKey.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            apiKey.status === 'flagged' ? 'bg-red-100 text-red-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {apiKey.status}
                          </span>
                          <span className="text-xs text-gray-500">Last used: {apiKey.lastUsed}</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 font-mono bg-gray-100 p-3 rounded">
                        {apiKey.key.substring(0, 20)}...
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700">
                        Regenerate
                      </button>
                      <button className="px-3 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700">
                        Revoke
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "audit" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Immutable Audit Log</h2>
            
            <div className="bg-white rounded-lg shadow">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-600">Immutable entries cannot be modified</span>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">
                  Export Log
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Severity
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {SYSTEM_SETTINGS.auditLog.map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{entry.timestamp}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{entry.user}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(entry.severity)}`}>
                            {entry.action.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{entry.details}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(entry.severity)}`}>
                            {entry.severity.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "admins" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Admin User Management</h2>
              <button className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700">
                Promote New Admin
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Admin User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Login
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {SYSTEM_SETTINGS.adminUsers.map((admin) => (
                      <tr key={admin.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <span className="material-symbols-outlined text-purple-600">admin_panel_settings</span>
                            </div>
                            <span className="font-medium text-gray-900">{admin.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{admin.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            admin.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handlePromoteAdmin(admin.id)}
                              disabled={admin.role === 'admin'}
                              className="px-2 py-1 bg-yellow-600 text-white text-xs font-medium rounded hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                              Promote
                            </button>
                            <button
                              onClick={() => handleDemoteAdmin(admin.id)}
                              disabled={admin.role !== 'admin'}
                              className="px-2 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                              Demote
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
