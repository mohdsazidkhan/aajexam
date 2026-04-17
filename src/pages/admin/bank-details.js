import dynamic from 'next/dynamic';
import Head from 'next/head';

const AdminBankDetails = dynamic(() => import('../../components/pages/admin/AdminBankDetails'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function AdminBankDetailsPage() {
  return (
    <>
      <Head>
        <title>Admin Bank Details - AajExam</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <AdminBankDetails />
    </>
  );
}
