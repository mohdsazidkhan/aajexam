import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Head from 'next/head';

const RewardsPage = dynamic(() => import('../components/pages/RewardsPage'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function Rewards() {
  return (
    <>
      <Head>
        <title>Rewards & Challenges - SUBG QUIZ Platform</title>
        <meta name="description" content="Explore SUBG QUIZ's daily, weekly, and monthly performance recognition programs. Get recognized for academic excellence through consistent quiz performance and knowledge demonstration." />
        <meta name="keywords" content="performance recognition, academic rewards, quiz achievements, daily rewards, weekly rewards, monthly recognition, merit-based rewards, educational excellence" />
        <meta property="og:title" content="Rewards & Challenges - SUBG QUIZ Platform" />
        <meta property="og:description" content="Explore SUBG QUIZ's merit-based recognition program for top-performing students across daily, weekly, and monthly challenges." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Performance Recognition - SUBG QUIZ" />
        <meta name="twitter:description" content="Get recognized for academic excellence on SUBG QUIZ Platform." />
      </Head>
      <Suspense fallback={<div>Loading...</div>}>
        <RewardsPage />
      </Suspense>
    </>
  );
}
