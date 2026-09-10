import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminTableSkeleton } from '../../components/skeletons/AdminSkeletons';

const UserReferralDetail = dynamic(() => import('../../components/pages/admin/UserReferralDetail'), {
  ssr: false,
  loading: () => <AdminTableSkeleton />
});

export default function UserReferralDetailPage() {
  return (
    <>
      <Head>
        <title>User Referral Detail - AajExam Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <UserReferralDetail />
    </>
  );
}

