import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminDashboardSkeleton } from '../../../components/admin/Skeletons';

const DashboardAnalytics = dynamic(() => import('../../../components/pages/admin/DashboardAnalytics'), {
  ssr: false,
  loading: () => <AdminDashboardSkeleton />
});

export default function AnalyticsDashboardPage() {
  return (
    <>
      <Head>
        <title>Analytics Overview - AajExam</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <DashboardAnalytics />
    </>
  );
}
