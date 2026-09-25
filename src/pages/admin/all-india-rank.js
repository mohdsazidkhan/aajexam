import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminTableSkeleton } from '../../components/admin/Skeletons';

const AllIndiaRankPage = dynamic(() => import('../../components/pages/admin/AllIndiaRankPage'), {
  ssr: false,
  loading: () => <AdminTableSkeleton />
});

export default function AdminAllIndiaRank() {
  return (
    <>
      <Head>
        <title>All India Rank - AajExam Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <AllIndiaRankPage />
    </>
  );
}
