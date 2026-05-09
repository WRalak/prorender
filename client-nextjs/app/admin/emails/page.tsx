'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  EnvelopeIcon, 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PaperAirplaneIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

export default function AdminEmailsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  // Mock data for email templates
  const templates = [
    {
      id: 1,
      name: 'Welcome Email',
      subject: 'Welcome to PropRent - Find Your Perfect Home',
      type: 'transactional',
      status: 'active',
      description: 'Sent to new users upon registration',
      variables: ['{{user_name}}', '{{confirmation_link}}'],
      lastUsed: '2024-01-29',
      usageCount: 1247,
      openRate: 78.5,
      clickRate: 23.2
    },
    {
      id: 2,
      name: 'Property Application Received',
      subject: 'Your property application has been received',
      type: 'transactional',
      status: 'active',
      description: 'Sent when a user submits a property application',
      variables: ['{{user_name}}', '{{property_title}}', '{{application_id}}'],
      lastUsed: '2024-01-28',
      usageCount: 456,
      openRate: 85.2,
      clickRate: 45.6
    },
    {
      id: 3,
      name: 'Monthly Newsletter',
      subject: 'PropRent Monthly - New Properties & Tips',
      type: 'marketing',
      status: 'active',
      description: 'Monthly newsletter with property highlights and tips',
      variables: ['{{user_name}}', '{{featured_properties}}', '{{tips}}'],
      lastUsed: '2024-01-15',
      usageCount: 890,
      openRate: 42.3,
      clickRate: 12.8
    },
    {
      id: 4,
      name: 'Password Reset',
      subject: 'Reset your PropRent password',
      type: 'transactional',
      status: 'active',
      description: 'Sent when user requests password reset',
      variables: ['{{user_name}}', '{{reset_link}}', '{{expiry_time}}'],
      lastUsed: '2024-01-27',
      usageCount: 67,
      openRate: 92.1,
      clickRate: 78.9
    },
    {
      id: 5,
      name: 'Subscription Renewal Reminder',
      subject: 'Your subscription is expiring soon',
      type: 'transactional',
      status: 'draft',
      description: 'Reminder for subscription renewal',
      variables: ['{{user_name}}', '{{plan_name}}', '{{expiry_date}}', '{{renewal_link}}'],
      lastUsed: null,
      usageCount: 0,
      openRate: 0,
      clickRate: 0
    }
  ]

  // Mock data for recent campaigns
  const campaigns = [
    {
      id: 1,
      name: 'New Feature Launch',
      subject: 'Introducing Virtual Tours on PropRent',
      type: 'marketing',
      status: 'sent',
      sentDate: '2024-01-25',
      recipients: 5000,
      delivered: 4892,
      opened: 2134,
      clicked: 567
    },
    {
      id: 2,
      name: 'Holiday Promotion',
      subject: 'Special Holiday Offer - 20% Off Premium Plans',
      type: 'marketing',
      status: 'sent',
      sentDate: '2024-01-20',
      recipients: 3000,
      delivered: 2956,
      opened: 1234,
      clicked: 234
    }
  ]

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || template.type === filterType
    const matchesStatus = filterStatus === 'all' || template.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const getTypeColor = (type) => {
    switch (type) {
      case 'transactional':
        return 'bg-blue-100 text-blue-800'
      case 'marketing':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-4 w-4" />
      case 'draft':
        return <DocumentTextIcon className="h-4 w-4" />
      case 'inactive':
        return <XCircleIcon className="h-4 w-4" />
      default:
        return <EnvelopeIcon className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Email Templates</h1>
            <p className="text-gray-600 mt-1">Manage email templates and campaigns</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/admin/emails/campaigns')}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
              View Campaigns
            </button>
            <button
              onClick={() => router.push('/admin/emails/new')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Create Template
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <EnvelopeIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Templates</p>
                <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Templates</p>
                <p className="text-2xl font-bold text-gray-900">
                  {templates.filter(t => t.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <PaperAirplaneIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {templates.reduce((sum, t) => sum + t.usageCount, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <DocumentTextIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Draft Templates</p>
                <p className="text-2xl font-bold text-gray-900">
                  {templates.filter(t => t.status === 'draft').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="transactional">Transactional</option>
                  <option value="marketing">Marketing</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Templates List */}
        <div className="space-y-6">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getTypeColor(template.type)}`}>
                      {template.type.charAt(0).toUpperCase() + template.type.slice(1)}
                    </span>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getStatusColor(template.status)}`}>
                      {getStatusIcon(template.status)}
                      {template.status.charAt(0).toUpperCase() + template.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">{template.subject}</p>
                  <p className="text-sm text-gray-500 mb-3">{template.description}</p>
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <span>Used {template.usageCount} times</span>
                    {template.lastUsed && <span>Last used: {template.lastUsed}</span>}
                    {template.openRate > 0 && (
                      <span>Open rate: {template.openRate}% • Click rate: {template.clickRate}%</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/admin/emails/${template.id}`)}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <EyeIcon className="h-5 w-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => router.push(`/admin/emails/${template.id}/edit`)}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <PencilIcon className="h-5 w-5 text-gray-600" />
                  </button>
                  <button
                    className="p-2 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <TrashIcon className="h-5 w-5 text-red-600" />
                  </button>
                </div>
              </div>

              {template.variables.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Available Variables:</h4>
                  <div className="flex flex-wrap gap-2">
                    {template.variables.map((variable, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-mono"
                      >
                        {variable}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <EnvelopeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Recent Campaigns */}
        <div className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Campaigns</h2>
            <button
              onClick={() => router.push('/admin/emails/campaigns')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All Campaigns →
            </button>
          </div>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Campaign
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sent Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                          <div className="text-sm text-gray-500">{campaign.subject}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(campaign.type)}`}>
                          {campaign.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {campaign.sentDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="text-xs">
                          <div>Delivered: {campaign.delivered}/{campaign.recipients}</div>
                          <div>Opened: {campaign.opened} ({Math.round((campaign.opened / campaign.delivered) * 100)}%)</div>
                          <div>Clicked: {campaign.clicked} ({Math.round((campaign.clicked / campaign.delivered) * 100)}%)</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => router.push(`/admin/emails/campaigns/${campaign.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
