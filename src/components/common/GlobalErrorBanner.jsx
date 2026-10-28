'use client'

import React from 'react'
import { useGlobalError } from '@/contexts/GlobalErrorContext'
import useTranslate from '../../hooks/useTranslate';

export default function GlobalErrorBanner() {
  const { translate } = useTranslate();
  const { error, clearError } = useGlobalError()

  if (!error) return null

  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-3rem)] max-w-xl animate-bounce-in pointer-events-auto">
      <div className="bg-background-surface border border-black dark:border-white rounded-3xl p-6 flex items-center justify-between gap-6 relative overflow-hidden group">
        <div className="absolute inset-0 bg-black/5 dark:bg-white/5 pointer-events-none group-hover:bg-black/10 dark:group-hover:bg-white/10 transition-colors"></div>
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-14 h-14 border border-primary-600 rounded-md flex items-center justify-center text-primary-600 border border-white dark:border-slate-800 rotate-3 group-hover:rotate-6 transition-transform">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="space-y-1">
            <p className="text-base font-bold text-content-primary uppercase tracking-tight leading-none">{translate('Security Breach!')}</p>
            <p className="text-[10px] font-bold text-content-secondary uppercase tracking-[0.08em] leading-relaxed">{error.message}</p>
          </div>
        </div>

        <button
          onClick={clearError}
          className="p-4 hover:bg-background-surface-secondary rounded-2xl border border-border-primary transition-all active:translate-y-1 relative z-10 group/btn"
        >
          <svg className="w-5 h-5 text-content-secondary group-hover/btn:text-black dark:group-hover/btn:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

