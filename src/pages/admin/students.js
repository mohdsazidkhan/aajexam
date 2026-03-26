import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Head from 'next/head';

const StudentsPageComponent = dynamic(() => import('../../components/pages/admin/StudentsPage'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function StudentsPage() {
  return (
    <>
      <Head>
        <title>Admin Students - SUBG QUIZ</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <Suspense fallback={<div>Loading...</div>}>
        <StudentsPageComponent />
      </Suspense>
    </>
  );
}
