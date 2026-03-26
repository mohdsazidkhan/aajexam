import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Head from 'next/head';

const StudentsPage = dynamic(() => import('../../components/pages/admin/StudentsPage'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function AdminUsersPage() {
  return (
    <>
      <Head>
        <title>Admin Users - SUBG QUIZ</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <Suspense fallback={<div>Loading...</div>}>
        <StudentsPage />
      </Suspense>
    </>
  );
}
