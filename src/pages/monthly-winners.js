import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Head from 'next/head';

const MonthlyWinners = dynamic(() => import('../components/pages/MonthlyWinners'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function MonthlyWinnersPage() {
  return (
    <>
      <Head>
        <title>Winners - AajExam Platform</title>
        <meta name="description" content="View Daily, Weekly, and Monthly challenge winners on AajExam. See who won prizes and check their performance." />
        <meta name="keywords" content="challenge winners, prize winners, daily winners, weekly winners, monthly winners, AajExam winners" />
        <meta property="og:title" content="Winners - AajExam Platform" />
        <meta property="og:description" content="View monthly prize winners on AajExam Platform." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Winners - AajExam" />
        <meta name="twitter:description" content="View monthly prize winners on AajExam Platform." />
      </Head>
      <Suspense fallback={<div>Loading...</div>}>
        <MonthlyWinners />
      </Suspense>
    </>
  );
}

