'use client'

import { useState } from 'react'
import { RocketLaunchIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

interface ApiTestButtonProps {
  label: string
  testFunction: () => Promise<boolean>
  icon: React.ReactNode
  variant?: 'blue' | 'green' | 'purple' | 'orange'
}

export default function ApiTestButton({ label, testFunction, icon, variant = 'blue' }: ApiTestButtonProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<'idle' | 'success' | 'error'>('idle')

  const runTest = async () => {
    setLoading(true)
    setResult('idle')
    
    try {
      const success = await testFunction()
      setResult(success ? 'success' : 'error')
    } catch (error) {
      console.error(`${label} test failed:`, error)
      setResult('error')
    } finally {
      setLoading(false)
    }
  }

  const getVariantClasses = () => {
    switch (variant) {
      case 'blue':
        return 'bg-blue-600 hover:bg-blue-700 text-white'
      case 'green':
        return 'bg-green-600 hover:bg-green-700 text-white'
      case 'purple':
        return 'bg-purple-600 hover:bg-purple-700 text-white'
      case 'orange':
        return 'bg-orange-600 hover:bg-orange-700 text-white'
      default:
        return 'bg-gray-600 hover:bg-gray-700 text-white'
    }
  }

  return (
    <button
      onClick={runTest}
      disabled={loading}
      className={`w-full p-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-3 ${getVariantClasses()} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
      ) : (
        <>
          {icon}
          <span>{label}</span>
          {result === 'success' && (
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
          )}
          {result === 'error' && (
            <XCircleIcon className="h-5 w-5 text-red-500" />
          )}
          {result === 'idle' && (
            <RocketLaunchIcon className="h-5 w-5 text-blue-500" />
          )}
        </>
      )}
    </button>
  )
}
