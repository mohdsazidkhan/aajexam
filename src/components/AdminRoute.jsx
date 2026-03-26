'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isAdmin, hasAdminPrivileges } from '../../lib/utils/adminUtils'
import { useGlobalError } from '../../contexts/GlobalErrorContext'

export default function AdminRoute({ children }) {
  const router = useRouter()
  const { showError } = useGlobalError()

  useEffect(() => {
    if (!isAdmin() || !hasAdminPrivileges()) {
      showError('Access denied. Admin privileges required.')
      router.push('/home')
    }
  }, [router, showError])

  if (!isAdmin() || !hasAdminPrivileges()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900 rounded-full mb-4">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
            You don't have the required admin privileges to access this page.
          </p>
          <button
            onClick={() => router.push('/home')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
