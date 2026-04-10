import dynamic from 'next/dynamic';
import Head from 'next/head';

const AdminReels = dynamic(() => import('../../../components/pages/admin/AdminReels'), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>
});

export default function AdminReelsPage() {
  return (
    <>
      <Head>
        <title>Reels Management | Admin - AajExam</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <AdminReels />
    </>
  );
}
