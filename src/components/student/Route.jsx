'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated, isStudent } from '@/lib/utils/authUtils'
import { useGlobalError } from '@/contexts/GlobalErrorContext'
import useTranslate from '../../hooks/useTranslate';

export default function StudentRoute({ children }) {
  const { translate } = useTranslate();
  const router = useRouter()
  const { showError } = useGlobalError()

  useEffect(() => {
    if (!isAuthenticated()) {
      showError('Please log in to access this page.')
      router.push('/login')
      return
    }

    if (!isStudent()) {
      showError('Access denied. Student account required.')
      router.push('/student/dashboard')
    }
  }, [router, showError])

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!isStudent()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-page font-outfit p-4">
        <section className="max-w-md w-full bg-background-surface rounded-3xl p-5 xl:p-10 border border-border-primary text-center">
          <div className="flex items-center justify-center w-20 h-20 mx-auto bg-background-surface-secondary rounded-3xl mb-8 border border-white dark:border-slate-800">
            <svg className="w-10 h-10 text-content-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl xl:text-3xl font-bold text-content-primary tracking-tight mb-4">
            {translate('Students Only')}
          </h2>
          <p className="text-content-secondary uppercase tracking-[0.08em] text-[10px] font-bold leading-relaxed mb-8">
            {translate('This page is only for students. Please log in with a student account.')}
          </p>
          <button
            onClick={() => router.push('/student/dashboard')}
            className="w-full bg-primary-600 hover:bg-primary-600 text-on-primary font-bold py-5 px-8 rounded-3xl transition-all border-b-2 border-primary-600 active:translate-y-1 active:border-b-0 uppercase tracking-[0.08em] text-xs"
          >
            {translate('Go to Home')}
          </button>
        </section>
      </div>
    )
  }

  return <>{children}</>
}


