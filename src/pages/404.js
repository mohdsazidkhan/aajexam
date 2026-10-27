import React from 'react'
import { useAppRouter as useRouter } from '@/hooks/useAppRouter';
import Head from 'next/head'
import { safeLocalStorage } from '../lib/utils/storage'
import useTranslate from '../hooks/useTranslate';

export default function Custom404() {
  const { translate } = useTranslate();
  const router = useRouter()

  const handleGoHome = () => {
    // Check if user is logged in, redirect to home if logged in, otherwise to landing page
    const token = safeLocalStorage.getItem('token')
    router.push(token ? '/student/dashboard' : '/')
  }

  const handleGoBack = () => {
    router.back()
  }

  return (
    <>
      <Head>
        <title>404 - Page Not Found | AajExam</title>
        <meta name="description" content="The page you're looking for doesn't exist" />
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <div className="min-h-screen flex items-center justify-center px-4 font-outfit relative overflow-hidden">
        {/* Background blobs */}

        <section className="max-w-md w-full overflow-hidden bg-background-surface p-6 xl:p-10 text-center border border-border-primary relative z-10">
          <div className="flex items-center justify-center w-24 h-24 mx-auto bg-background-surface-secondary rounded-3xl mb-8 border border-white dark:border-slate-800">
            <svg className="w-12 h-12 text-content-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.084-2.33A7.962 7.962 0 014 12a8 8 0 1116 0z" />
            </svg>
          </div>

          <h1 className="text-7xl font-bold text-content-primary mb-2 tracking-tight">
            404
          </h1>

          <h2 className="text-xl xl:text-2xl font-bold text-content-primary mb-4 tracking-tight">
            {translate('Page Not Found')}
          </h2>

          <p className="text-[10px] font-bold text-content-secondary uppercase tracking-[0.08em] leading-loose mb-10">
            {translate('Sorry, the page you are looking for does not exist or has been moved.')}
          </p>

          <div className="flex flex-col gap-4">
            <button
              onClick={handleGoHome}
              className="w-full bg-primary-600 hover:bg-primary-600 text-on-primary font-bold py-5 px-8 rounded-3xl transition-all border-b-2 border-primary-600 active:translate-y-1 active:border-b-0 uppercase tracking-[0.08em] text-xs"
            >
              {translate('Go to Home')}
            </button>
            <button
              onClick={handleGoBack}
              className="w-full bg-background-surface-secondary text-content-secondary font-bold py-4 px-8 rounded-2xl transition-all border-b-2 border-border-primary active:translate-y-0.5 active:border-b-2 uppercase tracking-[0.08em] text-[10px]"
            >
              {translate('Go Back')}
            </button>
          </div>

          <div className="mt-8 text-sm text-content-muted">
            <p>{translate('Looking for something specific?')}</p>
            <div className="flex justify-center space-x-4 mt-3">
              <button
                onClick={() => router.push('/login')}
                className="text-primary-600 hover:text-primary-600 dark:text-primary-600 dark:hover:text-primary-600"
              >
                {translate('Login')}
              </button>
              <button
                onClick={() => router.push('/register')}
                className="text-primary-600 hover:text-primary-600 dark:text-primary-600 dark:hover:text-primary-600"
              >
                {translate('Register')}
              </button>
              <button
                onClick={() => router.push('/contact')}
                className="text-primary-600 hover:text-primary-600 dark:text-primary-600 dark:hover:text-primary-600"
              >
                {translate('Contact Us')}
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

