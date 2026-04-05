'use client'

import React from 'react'
import { useGlobalError } from '@/contexts/GlobalErrorContext'

export default function GlobalErrorBanner() {
  const { error, clearError } = useGlobalError()

  if (!error) return null

  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-3rem)] max-w-xl animate-bounce-in pointer-events-auto">
      <div className="bg-white dark:bg-slate-900 border-4 border-b-[12px] border-rose-500 rounded-[2.5rem] p-6 shadow-2xl flex items-center justify-between gap-6 relative overflow-hidden group">
        <div className="absolute inset-0 bg-rose-500/5 pointer-events-none group-hover:bg-rose-500/10 transition-colors"></div>
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-14 h-14 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-duo-primary border-4 border-white dark:border-slate-800 rotate-3 group-hover:rotate-6 transition-transform">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="space-y-1">
            <p className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">Security Breach!</p>
            <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-relaxed">{error.message}</p>
          </div>
        </div>

        <button
          onClick={clearError}
          className="p-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl border-2 border-b-4 border-slate-100 dark:border-slate-700 transition-all shadow-duo active:translate-y-1 relative z-10 group/btn"
        >
          <svg className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover/btn:text-rose-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

