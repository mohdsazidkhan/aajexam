import React from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { safeLocalStorage } from '../lib/utils/storage'

export default function Custom500() {
  const router = useRouter()

  const handleGoHome = () => {
    // Check if user is logged in, redirect to home if logged in, otherwise to landing page
    const token = safeLocalStorage.getItem('token')
    router.push(token ? '/home' : '/')
  }

  const handleGoBack = () => {
    router.back()
  }

  return (
    <>
      <Head>
        <title>500 - Server Error | AajExam</title>
        <meta name="description" content="We're experiencing server issues. Please try again later." />
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <div className="min-h-screen  flex items-center justify-center px-4 font-outfit relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-500/5 rounded-full blur-[100px] -ml-48 -mb-48 pointer-events-none" />

        <div className="max-w-md w-full bg-white dark:bg-slate-900 shadow-2xl rounded-[3rem] p-10 text-center border-2 border-b-8 border-slate-200 dark:border-slate-800 relative z-10">
          <div className="flex items-center justify-center w-24 h-24 mx-auto bg-rose-100 dark:bg-rose-900/30 rounded-[2rem] mb-8 shadow-duo-secondary border-4 border-white dark:border-slate-800">
            <svg className="w-12 h-12 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h1 className="text-7xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tighter">
            500
          </h1>

          <h2 className="text-xl lg:text-2xl font-black text-slate-800 dark:text-slate-200 mb-4 uppercase tracking-tight">
            System Overload
          </h2>

          <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest leading-loose mb-10">
            Internal mission protocols have encountered a critical anomaly.<br />Our core team is currently re-calibrating the matrix.
          </p>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-black py-5 px-8 rounded-3xl transition-all shadow-duo-primary border-b-4 border-primary-700 active:translate-y-1 active:border-b-0 uppercase tracking-widest text-xs"
            >
              Re-Initiate Protocol
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleGoHome}
                className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black py-4 px-8 rounded-2xl transition-all shadow-duo border-b-4 border-slate-200 dark:border-slate-700 active:translate-y-0.5 active:border-b-2 uppercase tracking-widest text-[10px]"
              >
                Base
              </button>
              <button
                onClick={handleGoBack}
                className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black py-4 px-8 rounded-2xl transition-all shadow-duo border-b-4 border-slate-200 dark:border-slate-700 active:translate-y-0.5 active:border-b-2 uppercase tracking-widest text-[10px]"
              >
                Back
              </button>
            </div>
          </div>

          <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
            <p>If the problem persists, please contact our support team.</p>
            <button
              onClick={() => router.push('/contact')}
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 mt-2"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

