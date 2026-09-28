import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminTableSkeleton } from '../../components/admin/Skeletons';

const AnnouncementsPageComponent = dynamic(() => import('../../components/pages/admin/AnnouncementsPage'), {
  ssr: false,
  loading: () => <AdminTableSkeleton />
});

export default function AnnouncementsPage() {
  return (
    <>
      <Head>
        <title>Admin Announcements - AajExam</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <AnnouncementsPageComponent />
    </>
  );
}
