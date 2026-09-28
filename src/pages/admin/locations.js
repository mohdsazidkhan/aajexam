import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminTableSkeleton } from '../../components/admin/Skeletons';

const LocationsPageComponent = dynamic(() => import('../../components/pages/admin/LocationsPage'), {
  ssr: false,
  loading: () => <AdminTableSkeleton />
});

export default function LocationsPage() {
  return (
    <>
      <Head>
        <title>Admin Locations - AajExam</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <LocationsPageComponent />
    </>
  );
}
