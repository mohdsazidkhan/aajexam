import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Head from 'next/head';

const QuizPage = dynamic(() => import('../../components/pages/admin/QuizPage'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function AdminQuizzesPage() {
  return (
    <>
      <Head>
        <title>Admin Quizzes - AajExam</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <Suspense fallback={<div>Loading...</div>}>
        <QuizPage />
      </Suspense>
    </>
  );
}
