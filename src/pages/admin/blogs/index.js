import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminTableSkeleton } from '../../../components/admin/Skeletons';

const AdminBlogs = dynamic(() => import('../../../components/pages/admin/Blogs'), {
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
