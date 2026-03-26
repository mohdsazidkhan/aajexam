import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Head from 'next/head';

const ReferralHistory = dynamic(() => import('../../components/pages/admin/ReferralHistory'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function ReferralHistoryPage() {
  return (
    <>
      <Head>
        <title>Referral History - AajExam Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <Suspense fallback={<div>Loading...</div>}>
        <ReferralHistory />
      </Suspense>
    </>
  );
}

