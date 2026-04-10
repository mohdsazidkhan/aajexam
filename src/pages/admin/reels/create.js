import dynamic from 'next/dynamic';
import Head from 'next/head';

const AdminReelCreate = dynamic(() => import('../../../components/pages/admin/AdminReelCreate'), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>
});

export default function AdminReelCreatePage() {
  return (
    <>
      <Head>
        <title>Create Reel | Admin - AajExam</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <AdminReelCreate />
    </>
  );
}
