import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Head from 'next/head';

const QuizAnalytics = dynamic(() => import('../../../components/pages/admin/QuizAnalytics'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function QuizAnalyticsPage() {
  return (
    <>
      <Head>
        <title>Admin Quiz Analytics - SUBG</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <Suspense fallback={<div>Loading...</div>}>
        <QuizAnalytics />
      </Suspense>
    </>
  );
}
