import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Head from 'next/head';

const PerformanceAnalytics = dynamic(() => import('../../../components/pages/admin/PerformanceAnalytics'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function PerformanceAnalyticsPage() {
  return (
    <>
      <Head>
        <title>Admin Performance Analytics - SUBG</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <Suspense fallback={<div>Loading...</div>}>
        <PerformanceAnalytics />
      </Suspense>
    </>
  );
}
