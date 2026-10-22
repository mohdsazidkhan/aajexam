import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminTableSkeleton } from '../../components/admin/Skeletons';

const AdminGenerateTestsComponent = dynamic(
  () => import('../../components/admin/pages/GenerateTests'),
  {
    ssr: false,
    loading: () => <AdminTableSkeleton />,
  }
);

export default function AdminGenerateTestsPage() {
  return (
    <>
      <Head>
        <title>AI Test Generator - Admin | AajExam</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <AdminGenerateTestsComponent />
    </>
  );
}
