import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Head from 'next/head';

const AdminGovtExamCategories = dynamic(() => import('../../../components/pages/admin/AdminGovtExamCategories'), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>
});

export default function GovtExams() {
  return (
    <>
      <Head>
        <title>Government Exams - Categories | Admin - AajExam</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>}>
        <AdminGovtExamCategories />
      </Suspense>
    </>
  );
}


