import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminTableSkeleton } from '../../components/skeletons/AdminSkeletons';

const UserDetailsPage = dynamic(() => import('../../components/pages/admin/UserDetailsPage'), {
  ssr: false,
  loading: () => <AdminTableSkeleton />
});

export default function UserDetailsPageRoute() {
  return (
    <>
      <Head>
        <title>User Details - AajExam Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <UserDetailsPage />
    </>
  );
}

