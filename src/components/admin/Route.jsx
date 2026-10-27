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
      router.push('/student/dashboard')
    }
  }, [router, showError])

  if (!isAdmin() || !hasAdminPrivileges()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-page font-outfit p-4">
        <section className="max-w-md w-full bg-background-surface rounded-3xl p-4 xl:p-10 border border-border-primary text-center relative">
          <div className="flex items-center justify-center w-20 h-20 mx-auto bg-background-surface-secondary rounded-3xl mb-4 border border-white dark:border-slate-800">
            <svg className="w-10 h-10 text-content-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl xl:text-3xl font-bold text-content-primary tracking-tight mb-4">
            Admin Only
          </h2>
          <p className="text-content-secondary uppercase tracking-[0.08em] text-[10px] font-bold leading-relaxed mb-4">
            This page is only for admins. Please log in with an admin account to continue.
          </p>
          <button
            onClick={() => router.push('/student/dashboard')}
            className="w-full hover:bg-primary-600 text-on-primary font-bold py-3 px-5 rounded-3xl transition-all border-b-2 border-primary-600 active:translate-y-1 active:border-b-0 uppercase tracking-[0.08em] text-xs bg-primary-600"
          >
            Go to Home
          </button>
        </section>
      </div>
    )
  }

  return <>{children}</>
}

