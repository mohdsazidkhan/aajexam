import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminDashboardSkeleton } from '../../../components/skeletons/AdminSkeletons';

const UserAnalytics = dynamic(() => import('../../../components/pages/admin/UserAnalytics'), {
  ssr: false,
  loading: () => <AdminDashboardSkeleton />
});

export default function UsersAnalyticsPage() {
  return (
    <>
      <Head>
        <title>Admin Users Analytics - SUBG</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <UserAnalytics />
    </>
  );
}


