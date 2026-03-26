import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Head from 'next/head';

const MyUserQuestions = dynamic(() => import('../../../components/pages/pro/MyUserQuestions'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function MyQuestions() {
  return (
    <>
      <Head>
        <title>My Questions - AajExam Pro</title>
        <meta name="description" content="View and manage all your submitted questions. Track approval status, engagement metrics, and performance of each question you've posted." />
        <meta name="keywords" content="my questions, manage questions, question status, submitted questions, pro dashboard" />
        <meta property="og:title" content="My Questions - AajExam Pro" />
        <meta property="og:description" content="View and manage all your submitted questions on AajExam Pro." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="My Questions - AajExam Pro" />
        <meta name="twitter:description" content="Manage your questions on AajExam Pro." />
      </Head>
      <Suspense fallback={<div>Loading...</div>}>
        <MyUserQuestions />
      </Suspense>
    </>
  );
}
