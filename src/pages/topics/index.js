import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Head from 'next/head';

const TopicListPage = dynamic(() => import('../../components/pages/TopicListPage'), { ssr: false, loading: () => <div>Loading...</div> });

export default function Topics() {
  return (
    <>
      <Head>
        <title>Topics - AajExam</title>
        <meta name="description" content="Browse all topics for exam preparation on AajExam." />
      </Head>
      <Suspense fallback={<div>Loading...</div>}><TopicListPage /></Suspense>
    </>
  );
}
