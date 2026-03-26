import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Head from 'next/head';

const MyUserQuizzes = dynamic(() => import('../../../components/pages/pro/MyUserQuizzes'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function MyQuizzes() {
  return (
    <>
      <Head>
        <title>My Quizzes - AajExam Pro</title>
        <meta name="description" content="View and manage all your created quizzes. Track quiz performance, participant stats, and engagement metrics for quizzes you've created." />
        <meta name="keywords" content="my quizzes, manage quizzes, created quizzes, quiz performance, pro dashboard" />
        <meta property="og:title" content="My Quizzes - AajExam Pro" />
        <meta property="og:description" content="View and manage all your created quizzes on AajExam Pro." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="My Quizzes - AajExam Pro" />
        <meta name="twitter:description" content="Manage your quizzes on AajExam Pro." />
      </Head>
      <Suspense fallback={<div>Loading...</div>}>
        <MyUserQuizzes />
      </Suspense>
    </>
  );
}
