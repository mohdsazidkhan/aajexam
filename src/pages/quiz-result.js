import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Head from 'next/head';

const QuizResultPage = dynamic(() => import('../components/pages/QuizResultPage'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function QuizResult() {
  return (
    <>
      <Head>
        <title>Quiz Result - AajExam</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <Suspense fallback={<div>Loading...</div>}>
        <QuizResultPage />
      </Suspense>
    </>
  );
}
