"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../contexts/AuthContext'
import { apiClient } from "../../../lib/api";
import { 
  BuildingOfficeIcon, 
  DocumentTextIcon, 
  EyeIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  StarIcon,
  PlusIcon,
  ChartBarIcon,
  HomeIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline'

export default function AgentDashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [agent, setAgent] = useState<any>(null)
  const [currentView, setCurrentView] = useState("dashboard")
  const [stats, setStats] = useState<any>(null)
  const [recentProperties, setRecentProperties] = useState<any[]>([])
  const [recentApplications, setRecentApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Utility functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const currentDate = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  const formattedDate = currentDate.toLocaleDateString("en-US", options);

  useEffect(() => {
    if (!user || user?.role !== 'agent') {
      router.push('/dashboard')
      return
    }
    fetchAgentData()
  }, [user])

  const fetchAgentData = async () => {
    try {
      setLoading(true);
      // Fetch real agent data from API using hooks
      const agentData = await apiClient.get('/agent/profile');
      const statsData = await apiClient.get('/agent/analytics');
      const propertiesData = await apiClient.get('/agent/properties');
      
      setAgent(agentData);
      setStats(statsData);
      setRecentProperties(propertiesData?.slice(0, 3) || []);
    } catch (error) {
      console.error('Failed to fetch agent data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Navigation items for sidebar
const navItems = [
  { icon: HomeIcon, label: "Dashboard", active: true, href: "#" },
  { icon: BuildingOfficeIcon, label: "My Listings", active: false, href: "#" },
  { icon: UserGroupIcon, label: "Leads", active: false, href: "#" },
  { icon: ArrowTrendingUpIcon, label: "Performance", active: false, href: "#" },
  { icon: CurrencyDollarIcon, label: "Subscription", active: false, href: "#" },
];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen flex">
      {/* SideNavBar Component */}
      <aside className="flex flex-col h-screen sticky top-0 p-4 gap-2 h-full w-64 border-r bg-white border-gray-200">
        <div className="mb-8 px-2">
          <span className="text-xl font-bold text-blue-900">PropRent</span>
        </div>
        <div className="flex items-center gap-3 p-3 mb-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <Image
            alt={agent?.name || 'Agent'}
            className="w-10 h-10 rounded-full object-cover"
            src={agent?.avatar || '/default-avatar.png'}
            width={40}
            height={40}
          />
          <div className="flex flex-col">
            <h3 className="font-headline-sm text-on-surface">{agent?.name || 'Loading...'}</h3>
            <p className="font-body-sm text-outline">{agent?.company || 'Loading...'}</p>
            <p className="font-body-xs text-outline-variant">{agent?.license || 'Loading...'}</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => setCurrentView(item.label.toLowerCase())}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 ease-in-out rounded-lg ${
                item.active
                  ? "bg-blue-50 text-blue-900 font-semibold"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="mt-auto space-y-1 pt-4 border-t border-gray-200">
          <div className="p-4 bg-blue-600 text-white rounded-xl mb-4">
            <p className="text-xs mb-2 opacity-80">Current Usage</p>
            <div className="flex items-end justify-between mb-1">
              <span className="font-bold text-white">42/50 Listings</span>
              <span className="text-xs text-blue-200">84%</span>
            </div>
            <div className="w-full bg-blue-900/40 rounded-full h-1.5">
              <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: "84%" }}></div>
            </div>
            <button className="w-full mt-4 bg-white text-blue-600 font-semibold py-2 rounded-lg hover:bg-blue-50 transition-colors">
              Upgrade Plan
            </button>
          </div>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-100 transition-all">
            <Cog6ToothIcon className="h-5 w-5" />
            <span className="text-sm">Settings</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-100 transition-all">
            <SupportIcon className="h-5 w-5" />
            <span className="text-sm">Support</span>
          </button>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Good morning, {agent?.name || 'Agent'}</h1>
            <p className="text-gray-600 mt-1">Today is {formattedDate}</p>
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg font-semibold text-gray-700 hover:shadow-md transition-all">
              <FilterListIcon className="h-5 w-5" />
              Filter View
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow-lg hover:bg-blue-700 transition-all">
              <PlusIcon className="h-5 w-5" />
              List Property
            </button>
          </div>
        </header>

        {/* Metrics Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Views */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <EyeIcon className="h-6 w-6" />
              </div>
              <span className="text-green-600 font-semibold flex items-center gap-1">
                <ArrowTrendingUpIcon className="h-4 w-4" />
                12%
              </span>
            </div>
            <h3 className="text-xs text-gray-600 uppercase tracking-wider">Total Views</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
            <div className="mt-4 h-8 flex items-end gap-1">
              <div className="flex-1 bg-blue-100 h-3 rounded-sm"></div>
              <div className="flex-1 bg-blue-100 h-5 rounded-sm"></div>
              <div className="flex-1 bg-blue-100 h-4 rounded-sm"></div>
              <div className="flex-1 bg-blue-400 h-7 rounded-sm"></div>
              <div className="flex-1 bg-blue-600 h-8 rounded-sm"></div>
            </div>
          </div>

          {/* New Leads */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                <UserGroupIcon className="h-6 w-6" />
              </div>
              <span className="text-green-600 font-semibold flex items-center gap-1">
                <ArrowTrendingUpIcon className="h-4 w-4" />
                8%
              </span>
            </div>
            <h3 className="text-xs text-gray-600 uppercase tracking-wider">New Leads</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.newLeads}</p>
            <div className="mt-4 h-8 flex items-end gap-1">
              <div className="flex-1 bg-green-100 h-4 rounded-sm"></div>
              <div className="flex-1 bg-green-100 h-6 rounded-sm"></div>
              <div className="flex-1 bg-green-400 h-5 rounded-sm"></div>
              <div className="flex-1 bg-green-100 h-3 rounded-sm"></div>
              <div className="flex-1 bg-green-600 h-7 rounded-sm"></div>
            </div>
          </div>

          {/* Active Listings */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <HomeIcon className="h-6 w-6" />
              </div>
              <span className="text-gray-600 font-semibold flex items-center gap-1">
                <span className="text-xs">—</span>
                0%
              </span>
            </div>
            <h3 className="text-xs text-gray-600 uppercase tracking-wider">Active Listings</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.activeListings}</p>
            <div className="mt-4 h-8 flex items-end gap-1">
              <div className="flex-1 bg-blue-400 h-6 rounded-sm"></div>
              <div className="flex-1 bg-blue-400 h-6 rounded-sm"></div>
              <div className="flex-1 bg-blue-400 h-6 rounded-sm"></div>
              <div className="flex-1 bg-blue-400 h-6 rounded-sm"></div>
              <div className="flex-1 bg-blue-400 h-6 rounded-sm"></div>
            </div>
          </div>

          {/* Conv. Rate */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                <ChartBarIcon className="h-6 w-6" />
              </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.monthlyRevenue)}</p>
            <p className="text-xs text-green-500 mt-1">{stats.monthlyRevenue > 0 ? `+${((stats.monthlyRevenue - stats.previousMonthlyRevenue) / stats.previousMonthlyRevenue) * 100}% this month` : '+0% this month'}</p>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Rating</span>
                <div className="flex items-center">
                  <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                  <span className="text-sm font-medium text-gray-900">{stats.averageRating.toFixed(1)}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Response Rate</span>
                <span className="text-sm font-medium text-gray-900">{stats.responseRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Response Time</span>
                <span className="text-sm font-medium text-gray-900">2 hours</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Current Plan</span>
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {agent?.subscription.type || 'Basic'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Properties Used</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats.totalProperties}/{agent?.subscription.maxListings || 10}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Monthly Fee</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(agent?.subscription.amount || 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => router.push('/agent/properties')}
                className="w-full text-left px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-between"
              >
                <span className="flex items-center">
                  <BuildingOfficeIcon className="h-4 w-4 text-gray-600 mr-2" />
                  Manage Properties
                </span>
                <span className="text-gray-400">→</span>
              </button>
              <button
                onClick={() => router.push('/agent/applications')}
                className="w-full text-left px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-between"
              >
                <span className="flex items-center">
                  <DocumentTextIcon className="h-4 w-4 text-gray-600 mr-2" />
                  Review Applications
                </span>
                <span className="text-gray-400">→</span>
              </button>
              <button
                onClick={() => router.push('/agent/analytics')}
                className="w-full text-left px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-between"
              >
                <span className="flex items-center">
                  <ChartBarIcon className="h-4 w-4 text-gray-600 mr-2" />
                  View Analytics
                </span>
                <span className="text-gray-400">→</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Properties */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Properties</h3>
              <button
                onClick={() => router.push('/agent/properties')}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                View All
              </button>
            </div>
            <div className="space-y-4">
              {recentProperties.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No properties listed yet</p>
              ) : (
                recentProperties.map((property) => (
                  <div key={property.id} className="flex items-center space-x-3 p-3 border border-gray-100 rounded-lg">
                    <div className="h-12 w-12 bg-gray-200 rounded-lg flex-shrink-0">
                      {property.images[0] ? (
                        <img
                          src={property.images[0]}
                          alt={property.title}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-gray-300 flex items-center justify-center">
                          <BuildingOfficeIcon className="h-6 w-6 text-gray-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {property.title}
                      </h4>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm text-blue-600 font-medium">
                          {formatCurrency(property.price)}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          property.status === 'available' ? 'bg-green-100 text-green-800' :
                          property.status === 'rented' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {property.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Applications */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Applications</h3>
              <button
                onClick={() => router.push('/agent/applications')}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                View All
              </button>
            </div>
            <div className="space-y-4">
              {recentApplications.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No applications received yet</p>
              ) : (
                recentApplications.map((application) => (
                  <div key={application.id} className="p-3 border border-gray-100 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {application.property.title}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {application.tenant.name.first} {application.tenant.name.last}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        application.status === 'approved' ? 'bg-green-100 text-green-800' :
                        application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {application.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {formatDate(application.submittedAt)}
                      </span>
                      <button
                        onClick={() => router.push(`/applications?id=${application.id}`)}
                        className="text-blue-600 hover:text-blue-700 text-xs"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Upgrade Prompt */}
        {agent?.subscription.type === 'basic' && (
          <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Upgrade to Pro Plan</h3>
                <p className="text-blue-100">
                  Get up to 50 property listings, advanced analytics, custom branding, and priority support.
                </p>
              </div>
              <button
                onClick={() => router.push('/agent/subscription')}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        )}
      </div>
    )
}
