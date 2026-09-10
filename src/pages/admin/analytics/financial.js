import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminDashboardSkeleton } from '../../../components/skeletons/AdminSkeletons';

const FinancialAnalytics = dynamic(() => import('../../../components/pages/admin/FinancialAnalytics'), {
  ssr: false,
  loading: () => <AdminDashboardSkeleton />
});

export default function FinancialAnalyticsPage() {
  return (
    <>
      <Head>
        <title>Admin Financial Analytics - SUBG</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <FinancialAnalytics />
    </>
  );
}
