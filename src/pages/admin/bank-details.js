import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Head from 'next/head';

const AdminBankDetails = dynamic(() => import('../../components/pages/admin/AdminBankDetails'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function AdminBankDetailsPage() {
  return (
    <>
      <Head>
        <title>Admin Bank Details - SUBG QUIZ</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <Suspense fallback={<div>Loading...</div>}>
        <AdminBankDetails />
      </Suspense>
    </>
  );
}
