import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Head from 'next/head';

const SubjectListPage = dynamic(() => import('../../components/pages/SubjectListPage'), { ssr: false, loading: () => <div>Loading...</div> });

export default function Subjects() {
  return (
    <>
      <Head>
        <title>Subjects - AajExam</title>
        <meta name="description" content="Browse all subjects for government exam preparation on AajExam." />
      </Head>
      <Suspense fallback={<div>Loading...</div>}><SubjectListPage /></Suspense>
    </>
  );
}
