import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminTableSkeleton } from '../../../components/skeletons/AdminSkeletons';

const AdminBlogs = dynamic(() => import('../../../components/pages/admin/AdminBlogs'), {
  ssr: false,
  loading: () => <AdminTableSkeleton />
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
