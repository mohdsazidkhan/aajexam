import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminDashboardSkeleton } from '../../../components/admin/Skeletons';

const AdminReelAnalytics = dynamic(() => import('../../../components/admin/pages/ReelAnalytics'), {
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
