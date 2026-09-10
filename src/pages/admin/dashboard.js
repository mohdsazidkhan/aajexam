import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminDashboardSkeleton } from '../../components/skeletons/AdminSkeletons';

const DashboardPage = dynamic(() => import('../../components/pages/admin/DashboardPage'), {
  ssr: false,
  loading: () => <AdminDashboardSkeleton />
});

export default function Dashboard() {
  return (
    <>
      <Head>
        <title>Admin Dashboard - AajExam</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <DashboardPage />
    </>
  );
}
