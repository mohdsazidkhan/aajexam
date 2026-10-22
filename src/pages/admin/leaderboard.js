import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminTableSkeleton } from '../../components/admin/Skeletons';

const LeaderboardPage = dynamic(() => import('../../components/admin/pages/LeaderboardPage'), {
  ssr: false,
  loading: () => <AdminTableSkeleton />
});

export default function AdminLeaderboard() {
  return (
    <>
      <Head>
        <title>Leaderboard - AajExam Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <LeaderboardPage />
    </>
  );
}
