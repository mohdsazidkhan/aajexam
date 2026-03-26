import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Head from 'next/head';

import Seo from '../components/Seo';

const HomePage = dynamic(() => import('../components/pages/HomePage'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function Home() {
  return (
    <>
      <Seo
        title="Home - AajExam Platform"
        description="Welcome to AajExam! Explore trending quizzes, track your progress, climb the leaderboard, and challenge yourself with knowledge-based quizzes."
        noIndex={true}
      />
      <Head>
        <meta name="keywords" content="home, quiz platform, trending quizzes, leaderboard, knowledge test" />
      </Head>
      <Suspense fallback={<div>Loading...</div>}>
        <HomePage />
      </Suspense>
    </>
  );
}
