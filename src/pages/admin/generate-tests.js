import dynamic from 'next/dynamic';
import Head from 'next/head';

const AdminGenerateTestsComponent = dynamic(
  () => import('../../components/pages/admin/AdminGenerateTests'),
  {
    ssr: false,
    loading: () => <div style={{ padding: 20, color: '#64748b' }}>Loading…</div>,
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
