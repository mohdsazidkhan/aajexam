import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminTableSkeleton } from '../../components/admin/Skeletons';

// Withdrawal requests + referral rewards live on one "Withdraw Requests" page (tabs).
const PayoutsPage = dynamic(() => import('../../components/admin/pages/PayoutsPage'), {
  ssr: false,
  loading: () => <AdminTableSkeleton />
});

export default function WithdrawRequests() {
  return (
    <>
      <Head>
        <title>Withdraw Requests - AajExam Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <PayoutsPage />
    </>
  );
}
