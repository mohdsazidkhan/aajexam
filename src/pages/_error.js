import React from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { safeLocalStorage } from '../lib/utils/storage'

function Error({ statusCode }) {
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
        <title>Error {statusCode || '500'} - AajExam</title>
        <meta name="description" content="An error occurred while loading the page" />
      </Head>
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center px-4 font-outfit relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-500/5 rounded-full blur-[100px] -ml-48 -mb-48 pointer-events-none" />

        <div className="max-w-md w-full bg-white dark:bg-slate-900 shadow-2xl rounded-[3rem] p-10 text-center border-2 border-b-8 border-slate-200 dark:border-slate-800 relative z-10">
          <div className="flex items-center justify-center w-24 h-24 mx-auto bg-rose-100 dark:bg-rose-900/30 rounded-[2rem] mb-8 shadow-duo-secondary border-4 border-white dark:border-slate-800">
            <svg className="w-12 h-12 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>

          <h1 className="text-2xl lg:text-5xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tighter">
            {statusCode ? `Error ${statusCode}` : 'Anomaly Detected'}
          </h1>

          <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest leading-loose mb-10">
            {statusCode === 404
              ? "The destination coordinates are invalid or restricted."
              : statusCode === 500
                ? "Core systems are experiencing a synchronized failure."
                : "An unexpected temporal rift has occurred in the system."
            }
          </p>

          <div className="flex flex-col gap-4">
            <button
              onClick={handleGoHome}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-black py-5 px-8 rounded-3xl transition-all shadow-duo-primary border-b-4 border-primary-700 active:translate-y-1 active:border-b-0 uppercase tracking-widest text-xs"
            >
              Return to Base
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleGoBack}
                className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black py-4 px-8 rounded-2xl transition-all shadow-duo border-b-4 border-slate-200 dark:border-slate-700 active:translate-y-0.5 active:border-b-2 uppercase tracking-widest text-[10px]"
              >
                Back
              </button>
              {statusCode !== 404 && (
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 px-8 rounded-2xl transition-all shadow-duo border-b-4 border-emerald-700 active:translate-y-0.5 active:border-b-2 uppercase tracking-widest text-[10px]"
                >
                  Sync
                </button>
              )}
            </div>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <details className="mt-6">
              <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400">
                Error Details (Development)
              </summary>
              <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-700 p-3 rounded overflow-auto">
                Status Code: {statusCode || 'Unknown'}
                <br />
                URL: {typeof window !== 'undefined' ? window.location.href : 'Server-side'}
              </pre>
            </details>
          )}
        </div>
      </div>
    </>
  )
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error

