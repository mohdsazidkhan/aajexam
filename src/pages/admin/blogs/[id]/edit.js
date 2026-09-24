import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminFormSkeleton } from '../../../../components/admin/Skeletons';

const AdminBlogForm = dynamic(() => import('../../../../components/pages/admin/BlogForm'), {
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
