import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminDashboardSkeleton } from '../../../components/skeletons/AdminSkeletons';

const AdminReelAnalytics = dynamic(() => import('../../../components/pages/admin/AdminReelAnalytics'), {
  ssr: false,
  loading: () => <AdminDashboardSkeleton />
});

export default function AdminReelAnalyticsPage() {
  return (
    <>
      <Head>
        <title>Reel Analytics | Admin - AajExam</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <AdminReelAnalytics />
    </>
  );
}
