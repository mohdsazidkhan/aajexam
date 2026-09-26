import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminFormSkeleton } from '../../components/admin/Skeletons';
import AdminRoute from '../../components/admin/Route';

const HomepageContentPage = dynamic(() => import('../../components/pages/admin/HomepageContentPage'), {
  ssr: false,
  loading: () => <AdminFormSkeleton />
});

export default function AdminHomepageContentPage() {
  return (
    <AdminRoute>
      <Head>
        <title>Homepage Content - Admin - AajExam</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <HomepageContentPage />
    </AdminRoute>
  );
}
