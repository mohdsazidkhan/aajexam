import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminTableSkeleton } from '../../components/admin/Skeletons';

const ReferralDashboard = dynamic(() => import('../../components/admin/pages/ReferralDashboard'), {
  ssr: false,
  loading: () => <AdminTableSkeleton />
});

export default function ReferralsPage() {
  return (
    <>
      <Head>
        <title>Referral Dashboard - AajExam Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <ReferralDashboard />
    </>
  );
}

