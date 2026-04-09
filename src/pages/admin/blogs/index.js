import dynamic from 'next/dynamic';
import Head from 'next/head';

const AdminBlogs = dynamic(() => import('../../../components/pages/admin/AdminBlogs'), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>
});

export default function BlogsAdmin() {
  return (
    <>
      <Head>
        <title>Blog Management | Admin - AajExam</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <AdminBlogs />
    </>
  );
}
