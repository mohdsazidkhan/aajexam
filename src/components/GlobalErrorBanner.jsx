'use client'

import React from 'react'
import { useGlobalError } from '@/contexts/GlobalErrorContext'

export default function GlobalErrorBanner() {
  const { error, clearError } = useGlobalError()

  if (!error) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white p-4 shadow-lg">
      <div className="container mx-auto px-0 lg:px-6 xl:px-8 flex items-center justify-between">
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <p className="font-medium">{error.message}</p>
            {error.details && (
              <p className="text-sm opacity-90 mt-1">{error.details}</p>
            )}
          </div>
        </div>
        <button
          onClick={clearError}
          className="ml-4 p-1 hover:bg-red-700 rounded-full transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
