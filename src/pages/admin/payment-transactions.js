import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminTableSkeleton } from '../../components/admin/Skeletons';

const AdminPaymentTransactions = dynamic(() => import('../../components/pages/admin/PaymentTransactions'), {
  ssr: false,
  loading: () => <AdminTableSkeleton />
});

export default function PaymentTransactions() {
  return (
    <>
      <Head>
        <title>Admin Payment Transactions - AajExam</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <AdminPaymentTransactions />
    </>
  );
}
