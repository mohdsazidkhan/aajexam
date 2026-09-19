'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isAdmin, hasAdminPrivileges } from '../lib/utils/adminUtils'
import { useGlobalError } from '../contexts/GlobalErrorContext'

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
      <div className="min-h-screen flex items-center justify-center bg-background-page font-outfit p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 shadow-sm rounded-[2.5rem] p-5 lg:p-10 border-2 border-slate-200 dark:border-slate-800 text-center">
          <div className="flex items-center justify-center w-20 h-20 mx-auto bg-slate-100 dark:bg-slate-800 dark:bg-white/30 rounded-[2rem] mb-8 shadow-sm border-2 border-white dark:border-slate-800">
            <svg className="w-10 h-10 text-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">
            Admin Only
          </h2>
          <p className="text-slate-600 dark:text-slate-400 uppercase tracking-widest text-[10px] font-black leading-relaxed mb-8">
            This page is only for admins. Please log in with an admin account to continue.
          </p>
          <button
            onClick={() => router.push('/home')}
            className="w-full bg-primary-700 hover:bg-primary-600 text-white font-black py-5 px-8 rounded-3xl transition-all shadow-sm border-b-2 border-primary-700 active:translate-y-1 active:border-b-0 uppercase tracking-widest text-xs"
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

