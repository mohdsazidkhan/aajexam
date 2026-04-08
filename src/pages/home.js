import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Head from 'next/head';

import Seo from '../components/Seo';
import HomePageSkeleton from '../components/HomePageSkeleton';

const HomePage = dynamic(() => import('../components/pages/HomePage'), {
  ssr: false,
  loading: () => <HomePageSkeleton />
});

export default function Home() {
  return (
    <>
      <Seo
        title="Home - AajExam Platform"
        description="Welcome to AajExam! Explore practice tests, track your progress, climb the leaderboard, and prepare for government exams."
        noIndex={true}
      />
      <Head>
        <meta name="keywords" content="home, exam platform, practice tests, leaderboard, government exam preparation" />
      </Head>
      <Suspense fallback={<HomePageSkeleton />}>
        <HomePage />
      </Suspense>
    </>
  );
}
