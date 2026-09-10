import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminDashboardSkeleton } from '../../components/skeletons/AdminSkeletons';

const ReferralFraudDashboard = dynamic(() => import('../../components/pages/admin/ReferralFraudDashboard'), {
  ssr: false,
  loading: () => <AdminDashboardSkeleton />
});

export default function ReferralFraudPage() {
  return (
    <>
      <Head>
        <title>Referral Fraud - AajExam Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <ReferralFraudDashboard />
    </>
  );
}
