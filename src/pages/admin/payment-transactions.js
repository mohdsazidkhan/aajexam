import dynamic from 'next/dynamic';
import Head from 'next/head';

const AdminPaymentTransactions = dynamic(() => import('../../components/pages/admin/AdminPaymentTransactions'), {
  ssr: false,
  loading: () => <div>Loading...</div>
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
