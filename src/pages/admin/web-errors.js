import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminTableSkeleton } from '../../components/admin/Skeletons';

const ClientErrors = dynamic(() => import('../../components/pages/admin/ClientErrors'), {
  ssr: false,
  loading: () => <AdminTableSkeleton />
});

export default function WebErrorsPage() {
  return (
    <>
      <Head>
        <title>Admin Web Errors - AajExam</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <ClientErrors kind="web" />
    </>
  );
}
