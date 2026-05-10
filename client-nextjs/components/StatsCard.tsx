'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color?: 'blue' | 'green' | 'purple' | 'orange'
  trend?: {
    value: number
    direction: 'up' | 'down'
  }
}

export default function StatsCard({ title, value, icon, color = 'blue', trend }: StatsCardProps) {
  const getBgColor = () => {
    switch (color) {
      case 'blue':
        return 'bg-blue-50 border-blue-200'
      case 'green':
        return 'bg-green-50 border-green-200'
      case 'purple':
        return 'bg-purple-50 border-purple-200'
      case 'orange':
        return 'bg-orange-50 border-orange-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getTextColor = () => {
    switch (color) {
      case 'blue':
        return 'text-blue-600'
      case 'green':
        return 'text-green-600'
      case 'purple':
        return 'text-purple-600'
      case 'orange':
        return 'text-orange-600'
      default:
        return 'text-gray-600'
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  return (
    <div className={`p-6 rounded-xl border-2 ${getBgColor()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center w-12 h-12 bg-white rounded-lg">
            {icon}
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">{formatNumber(Number(value))}</p>
            <p className="text-sm text-gray-600">{title}</p>
          </div>
        </div>
        {trend && (
          <div className="flex items-center space-x-2">
            {trend.direction === 'up' ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span className={`text-sm ${trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend.direction === 'up' ? '+' : '-'}{Math.abs(trend.value)}%
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
