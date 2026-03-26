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
        <title>Error {statusCode || '500'} - SUBG QUIZ</title>
        <meta name="description" content="An error occurred while loading the page" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 dark:bg-red-900 rounded-full mb-6">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>

          <h1 className="text-xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {statusCode ? `Error ${statusCode}` : 'Something went wrong'}
          </h1>

          <p className="text-gray-600 dark:text-gray-300 mb-8">
            {statusCode === 404
              ? "The page you're looking for doesn't exist."
              : statusCode === 500
                ? "We're experiencing server issues. Please try again later."
                : "An unexpected error occurred. Please try again."
            }
          </p>

          <div className="flex flex-col space-y-3">
            <button
              onClick={handleGoHome}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Go to Home
            </button>
            <button
              onClick={handleGoBack}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Go Back
            </button>
            {statusCode !== 404 && (
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Refresh Page
              </button>
            )}
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
