import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Head from 'next/head';

const AttemptQuizPage = dynamic(() => import('../../../components/pages/AttemptQuizPage'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function AttemptQuiz() {
  return (
    <>
      <Head>
        <title>Attempt Quiz - AajExam</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <Suspense fallback={<div>Loading...</div>}>
        <AttemptQuizPage />
      </Suspense>
    </>
  );
}
