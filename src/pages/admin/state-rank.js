import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminTableSkeleton } from '../../components/admin/Skeletons';

const RegionRankPage = dynamic(() => import('../../components/admin/pages/RegionRankPage'), {
  ssr: false,
  loading: () => <AdminTableSkeleton />
});

export default function AdminStateRank() {
  return (
    <>
      <Head>
        <title>State Rank - AajExam Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <RegionRankPage kind="state" />
    </>
  );
}
