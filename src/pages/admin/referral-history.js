import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminTableSkeleton } from '../../components/skeletons/AdminSkeletons';

const ReferralHistory = dynamic(() => import('../../components/pages/admin/ReferralHistory'), {
  ssr: false,
  loading: () => <AdminTableSkeleton />
});

export default function ReferralHistoryPage() {
  return (
    <>
      <Head>
        <title>Referral History - AajExam Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <ReferralHistory />
    </>
  );
}

