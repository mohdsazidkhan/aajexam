import React from 'react'
import { useAppRouter as useRouter } from '@/hooks/useAppRouter';
import Head from 'next/head'
import { safeLocalStorage } from '../lib/utils/storage'
import useTranslate from '../hooks/useTranslate';

export default function Custom500() {
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
        <title>500 - Server Error | AajExam</title>
        <meta name="description" content="We're experiencing server issues. Please try again later." />
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <div className="min-h-screen flex items-center justify-center px-4 font-outfit relative overflow-hidden">
        {/* Background blobs */}

        <section className="max-w-md w-full overflow-hidden bg-background-surface p-6 xl:p-10 text-center border border-border-primary relative z-10">
          <div className="flex items-center justify-center w-24 h-24 mx-auto bg-background-surface-secondary rounded-3xl mb-8 border border-white dark:border-slate-800">
            <svg className="w-12 h-12 text-content-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h1 className="text-7xl font-bold text-content-primary mb-2 tracking-tight">
            500
          </h1>

          <h2 className="text-xl xl:text-2xl font-bold text-content-primary mb-4 tracking-tight">
            {translate('Something went wrong')}
          </h2>

          <p className="text-[10px] font-bold text-content-secondary uppercase tracking-[0.08em] leading-loose mb-10">
            {translate('We hit a server error on our end.')}<br />{translate('Our team is looking into it. Please try again in a moment.')}
          </p>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-primary-600 hover:bg-primary-600 text-on-primary font-bold py-5 px-8 rounded-3xl transition-all border-b-2 border-primary-600 active:translate-y-1 active:border-b-0 uppercase tracking-[0.08em] text-xs"
            >
              {translate('Try Again')}
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleGoHome}
                className="flex-1 bg-background-surface-secondary text-content-secondary font-bold py-4 px-8 rounded-2xl transition-all border-b-2 border-border-primary active:translate-y-0.5 active:border-b-2 uppercase tracking-[0.08em] text-[10px]"
              >
                {translate('Home')}
              </button>
              <button
                onClick={handleGoBack}
                className="flex-1 bg-background-surface-secondary text-content-secondary font-bold py-4 px-8 rounded-2xl transition-all border-b-2 border-border-primary active:translate-y-0.5 active:border-b-2 uppercase tracking-[0.08em] text-[10px]"
              >
                {translate('Back')}
              </button>
            </div>
          </div>

          <div className="mt-8 text-sm text-content-muted">
            <p>{translate('If the problem persists, please contact our support team.')}</p>
            <button
              onClick={() => router.push('/contact')}
              className="text-primary-600 hover:text-primary-600 dark:text-primary-600 dark:hover:text-primary-600 mt-2"
            >
              {translate('Contact Support')}
            </button>
          </div>
        </section>
      </div>
    </>
  )
}

