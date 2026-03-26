import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Head from 'next/head';

const UserReferralDetail = dynamic(() => import('../../components/pages/admin/UserReferralDetail'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function UserReferralDetailPage() {
  return (
    <>
      <Head>
        <title>User Referral Detail - SUBG QUIZ Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <Suspense fallback={<div>Loading...</div>}>
        <UserReferralDetail />
      </Suspense>
    </>
  );
}

