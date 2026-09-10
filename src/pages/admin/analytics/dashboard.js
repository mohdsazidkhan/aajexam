import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminDashboardSkeleton } from '../../../components/skeletons/AdminSkeletons';

const DashboardAnalytics = dynamic(() => import('../../../components/pages/admin/DashboardAnalytics'), {
  ssr: false,
  loading: () => <AdminDashboardSkeleton />
});

export default function AnalyticsDashboardPage() {
  return (
    <>
      <Head>
        <title>Admin Analytics - AajExam</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <DashboardAnalytics />
    </>
  );
}
