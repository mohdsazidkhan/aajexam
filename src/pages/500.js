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
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 dark:bg-red-900 rounded-full mb-6">
            <svg className="w-8 h-8 text-primary-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
            500
          </h1>

          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Internal Server Error
          </h2>

          <p className="text-gray-600 dark:text-gray-400 mb-8">
            We're experiencing server issues. Our team has been notified and is working to fix the problem.
          </p>

          <div className="flex flex-col space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-secondary-600 hover:bg-secondary-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={handleGoHome}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Go to Home
            </button>
            <button
              onClick={handleGoBack}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Go Back
            </button>
          </div>

          <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
            <p>If the problem persists, please contact our support team.</p>
            <button
              onClick={() => router.push('/contact')}
              className="text-secondary-600 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-300 mt-2"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
