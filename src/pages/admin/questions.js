import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Head from 'next/head';

const QuestionPage = dynamic(() => import('../../components/pages/admin/QuestionPage'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function Questions() {
  return (
    <>
      <Head>
        <title>Admin Questions - SUBG QUIZ</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <Suspense fallback={<div>Loading...</div>}>
        <QuestionPage />
      </Suspense>
    </>
  );
}
