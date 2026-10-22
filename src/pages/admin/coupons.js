import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminTableSkeleton } from '../../components/admin/Skeletons';

const CouponsPageComponent = dynamic(() => import('../../components/admin/pages/CouponsPage'), {
  ssr: false,
  loading: () => <AdminTableSkeleton />
});

export default function CouponsPage() {
  return (
    <>
      <Head>
        <title>Admin Coupons - AajExam</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <CouponsPageComponent />
    </>
  );
}
