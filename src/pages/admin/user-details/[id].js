import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminTableSkeleton } from '../../../components/admin/Skeletons';

const UserFullDetail = dynamic(() => import('../../../components/pages/admin/UserFullDetail'), {
  ssr: false,
  loading: () => <AdminTableSkeleton />
});

export default function UserFullDetailRoute() {
  return (
    <>
      <Head>
        <title>User - AajExam Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <UserFullDetail />
    </>
  );
}
