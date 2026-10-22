import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminTableSkeleton } from '../../components/admin/Skeletons';

const Traffic = dynamic(() => import('../../components/admin/pages/Traffic'), {
  ssr: false,
  loading: () => <AdminTableSkeleton />
});

export default function TrafficPage() {
  return (
    <>
      <Head>
        <title>Admin Traffic - AajExam</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <Traffic />
    </>
  );
}
