import dynamic from 'next/dynamic';

import Seo from '../../components/common/Seo';
import HomePageSkeleton from '../../components/student/HomePageSkeleton';

const HomePage = dynamic(() => import('../../components/student/pages/HomePage'), {
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
