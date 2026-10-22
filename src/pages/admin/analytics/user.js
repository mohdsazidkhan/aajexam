import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminDashboardSkeleton } from '../../../components/admin/Skeletons';

const UserAnalytics = dynamic(() => import('../../../components/admin/pages/UserAnalytics'), {
  ssr: false,
  loading: () => <AdminDashboardSkeleton />
});

export default function UserAnalyticsPage() {
  return (
    <>
      <Head>
        <title>Admin User Analytics - SUBG</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <UserAnalytics />
    </>
  );
}
