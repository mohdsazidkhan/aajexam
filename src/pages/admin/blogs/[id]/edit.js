import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminFormSkeleton } from '../../../../components/skeletons/AdminSkeletons';

const AdminBlogForm = dynamic(() => import('../../../../components/pages/admin/AdminBlogForm'), {
  ssr: false,
  loading: () => <AdminFormSkeleton />
});

export default function EditBlog() {
  return (
    <>
      <Head>
        <title>Edit Blog | Admin - AajExam</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <AdminBlogForm />
    </>
  );
}
