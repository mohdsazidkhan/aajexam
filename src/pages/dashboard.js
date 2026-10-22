import dynamic from 'next/dynamic';

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
      <HomePage />
    </>
  );
}
