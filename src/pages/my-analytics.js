import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Head from 'next/head';
import Seo from '../components/Seo';

const MyAnalyticsPage = dynamic(() => import('../components/pages/UserAnalyticsPage'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function MyAnalytics() {
  return (
    <>
      <Seo
        title="My Analytics - SUBG QUIZ Platform"
        description="View your comprehensive analytics on SUBG QUIZ Platform. Track your earnings, expenses, performance metrics, and content creation statistics."
        noIndex={true}
      />
      <Suspense fallback={<div>Loading...</div>}>
        <MyAnalyticsPage />
      </Suspense>
    </>
  );
}

