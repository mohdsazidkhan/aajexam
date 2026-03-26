import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Head from 'next/head';

const AdminMonthlyWinners = dynamic(() => import('../../components/pages/admin/AdminMonthlyWinners'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function AdminMonthlyWinnersPage() {
  return (
    <>
      <Head>
        <title>Admin Monthly Winners - SUBG</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <Suspense fallback={<div>Loading...</div>}>
        <AdminMonthlyWinners />
      </Suspense>
    </>
  );
}
