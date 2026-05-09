'use client'

import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

interface SystemStatusProps {
  title: string
  status: 'online' | 'offline' | 'warning'
  description: string
  icon: React.ReactNode
}

export default function SystemStatus({ title, status, description, icon }: SystemStatusProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'offline':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'online':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />
      case 'offline':
        return <XCircleIcon className="h-5 w-5 text-red-600" />
      case 'warning':
        return <XCircleIcon className="h-5 w-5 text-yellow-600" />
      default:
        return <div className="h-5 w-5 bg-gray-400 rounded-full" />
    }
  }

  return (
    <div className={`p-4 rounded-lg border-2 ${getStatusColor()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {icon}
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          status === 'online' ? 'bg-green-600 text-white' :
          status === 'offline' ? 'bg-red-600 text-white' :
          'bg-yellow-600 text-white'
        }`}>
          {status === 'online' ? 'Online' : status === 'offline' ? 'Offline' : 'Warning'}
        </div>
      </div>
    </div>
  )
}
