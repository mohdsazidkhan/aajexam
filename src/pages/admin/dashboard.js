import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminMainDashboardSkeleton } from '../../components/admin/Skeletons';

const DashboardPage = dynamic(() => import('../../components/pages/admin/DashboardPage'), {
  ssr: false,
  loading: () => <div className="my-4"><AdminMainDashboardSkeleton /></div>
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
