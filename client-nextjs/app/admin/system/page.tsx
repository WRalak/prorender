'use client'

import { useState } from 'react'
import { 
  ServerIcon, 
  CloudIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

export default function AdminSystemPage() {
  const [activeTab, setActiveTab] = useState('overview')

  // Mock system data
  const systemStats = {
    overview: {
      version: '2.1.0',
      uptime: '99.9%',
      lastDeploy: '2024-01-28 14:30:00',
      environment: 'production',
      status: 'healthy'
    },
    database: {
      status: 'healthy',
      connections: 45,
      maxConnections: 100,
      size: '2.3 GB',
      backupStatus: 'success',
      lastBackup: '2024-01-29 02:00:00'
    },
    storage: {
      status: 'healthy',
      used: '45.2 GB',
      total: '100 GB',
      percentage: 45.2,
      cdnStatus: 'operational'
    },
    api: {
      status: 'healthy',
      requestsPerMinute: 1250,
      averageResponseTime: '120ms',
      errorRate: '0.1%',
      rateLimitStatus: 'active'
    },
    cache: {
      status: 'healthy',
      hitRate: '92.5%',
      memoryUsage: '1.2 GB',
      evictionRate: '0.05%'
    }
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ServerIcon },
    { id: 'database', name: 'Database', icon: ServerIcon },
    { id: 'storage', name: 'Storage', icon: CloudIcon },
    { id: 'api', name: 'API', icon: ChartBarIcon },
    { id: 'cache', name: 'Cache', icon: Cog6ToothIcon }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100'
      case 'warning':
        return 'text-yellow-600 bg-yellow-100'
      case 'error':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon className="h-5 w-5" />
      case 'warning':
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5" />
      default:
        return <ServerIcon className="h-5 w-5" />
    }
  }

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">System Status</span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getStatusColor(systemStats.overview.status)}`}>
              {getStatusIcon(systemStats.overview.status)}
              {systemStats.overview.status}
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900">Operational</div>
          <p className="text-sm text-gray-500">All systems running</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <ServerIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Version</p>
              <p className="text-xl font-bold text-gray-900">{systemStats.overview.version}</p>
              <p className="text-sm text-gray-500">Current release</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Uptime</p>
              <p className="text-xl font-bold text-gray-900">{systemStats.overview.uptime}</p>
              <p className="text-sm text-gray-500">Last 30 days</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CloudIcon className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Environment</p>
              <p className="text-xl font-bold text-gray-900">{systemStats.overview.environment}</p>
              <p className="text-sm text-gray-500">Production</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Deployment</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Last Deploy:</span>
                <span className="font-medium">{systemStats.overview.lastDeploy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Deploy Method:</span>
                <span className="font-medium">CI/CD Pipeline</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Git Branch:</span>
                <span className="font-medium">main</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Quick Actions</h4>
            <div className="space-y-2">
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                <ArrowDownTrayIcon className="h-4 w-4" />
                Download System Logs
              </button>
              <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                <ServerIcon className="h-4 w-4" />
                Create Backup
              </button>
              <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                <Cog6ToothIcon className="h-4 w-4" />
                System Maintenance
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderDatabase = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Status</span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getStatusColor(systemStats.database.status)}`}>
              {getStatusIcon(systemStats.database.status)}
              {systemStats.database.status}
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900">Connected</div>
          <p className="text-sm text-gray-500">Database operational</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <ServerIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Connections</p>
              <p className="text-xl font-bold text-gray-900">{systemStats.database.connections}</p>
              <p className="text-sm text-gray-500">of {systemStats.database.maxConnections} max</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CloudIcon className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Database Size</p>
              <p className="text-xl font-bold text-gray-900">{systemStats.database.size}</p>
              <p className="text-sm text-gray-500">Total storage</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <ShieldCheckIcon className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Backup Status</p>
              <p className="text-xl font-bold text-green-600">{systemStats.database.backupStatus}</p>
              <p className="text-sm text-gray-500">{systemStats.database.lastBackup}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Operations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
            <ArrowDownTrayIcon className="h-4 w-4" />
            Export Database
          </button>
          <button className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
            <ArrowUpTrayIcon className="h-4 w-4" />
            Import Database
          </button>
          <button className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
            <ServerIcon className="h-4 w-4" />
            Run Backup Now
          </button>
        </div>
      </div>
    </div>
  )

  const renderStorage = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Status</span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getStatusColor(systemStats.storage.status)}`}>
              {getStatusIcon(systemStats.storage.status)}
              {systemStats.storage.status}
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900">Operational</div>
          <p className="text-sm text-gray-500">Storage available</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CloudIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Storage Used</p>
              <p className="text-xl font-bold text-gray-900">{systemStats.storage.used}</p>
              <p className="text-sm text-gray-500">of {systemStats.storage.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Usage</p>
              <p className="text-xl font-bold text-gray-900">{systemStats.storage.percentage}%</p>
              <p className="text-sm text-gray-500">of total capacity</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <ServerIcon className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">CDN Status</p>
              <p className="text-xl font-bold text-green-600">{systemStats.storage.cdnStatus}</p>
              <p className="text-sm text-gray-500">Content delivery</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Storage Usage Breakdown</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Property Images</span>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
              <span className="text-sm font-medium">27.1 GB</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">User Documents</span>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '25%' }}></div>
              </div>
              <span className="text-sm font-medium">11.3 GB</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Database Backups</span>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '15%' }}></div>
              </div>
              <span className="text-sm font-medium">6.8 GB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAPI = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Status</span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getStatusColor(systemStats.api.status)}`}>
              {getStatusIcon(systemStats.api.status)}
              {systemStats.api.status}
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900">Operational</div>
          <p className="text-sm text-gray-500">API responding</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Requests/Min</p>
              <p className="text-xl font-bold text-gray-900">{systemStats.api.requestsPerMinute}</p>
              <p className="text-sm text-gray-500">Current rate</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <ServerIcon className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Response Time</p>
              <p className="text-xl font-bold text-gray-900">{systemStats.api.averageResponseTime}</p>
              <p className="text-sm text-gray-500">Average</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <ShieldCheckIcon className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Error Rate</p>
              <p className="text-xl font-bold text-yellow-600">{systemStats.api.errorRate}</p>
              <p className="text-sm text-gray-500">Last 24h</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">API Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Rate Limiting</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium text-green-600">{systemStats.api.rateLimitStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Limit per hour:</span>
                <span className="font-medium">1000 requests</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Burst limit:</span>
                <span className="font-medium">100 requests</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">API Documentation</h4>
            <div className="space-y-2">
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                View API Docs
              </button>
              <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                Download OpenAPI Spec
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderCache = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Status</span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getStatusColor(systemStats.cache.status)}`}>
              {getStatusIcon(systemStats.cache.status)}
              {systemStats.cache.status}
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900">Active</div>
          <p className="text-sm text-gray-500">Cache operational</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Hit Rate</p>
              <p className="text-xl font-bold text-gray-900">{systemStats.cache.hitRate}</p>
              <p className="text-sm text-gray-500">Performance</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CloudIcon className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Memory Usage</p>
              <p className="text-xl font-bold text-gray-900">{systemStats.cache.memoryUsage}</p>
              <p className="text-sm text-gray-500">RAM allocated</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <ServerIcon className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Eviction Rate</p>
              <p className="text-xl font-bold text-gray-900">{systemStats.cache.evictionRate}</p>
              <p className="text-sm text-gray-500">Key removals</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cache Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
            <Cog6ToothIcon className="h-4 w-4" />
            Clear Cache
          </button>
          <button className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
            <ChartBarIcon className="h-4 w-4" />
            View Cache Stats
          </button>
          <button className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
            <ServerIcon className="h-4 w-4" />
            Warm Cache
          </button>
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview()
      case 'database':
        return renderDatabase()
      case 'storage':
        return renderStorage()
      case 'api':
        return renderAPI()
      case 'cache':
        return renderCache()
      default:
        return renderOverview()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">System Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage system infrastructure</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <tab.icon className="mr-3 h-5 w-5" />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {tabs.find(t => t.id === activeTab)?.name}
                </h2>
              </div>

              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
