import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminTableSkeleton } from '../../components/admin/Skeletons';

const AdminBankDetails = dynamic(() => import('../../components/admin/pages/BankDetails'), {
  ssr: false,
  loading: () => <AdminTableSkeleton />
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
