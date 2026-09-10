import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminTableSkeleton } from '../../components/skeletons/AdminSkeletons';

const AdminContacts = dynamic(() => import('../../components/pages/admin/AdminContacts'), {
  ssr: false,
  loading: () => <AdminTableSkeleton />
});

export default function AdminContactsPage() {
  return (
    <>
      <Head>
        <title>Admin Contacts - SUBG</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <AdminContacts />
    </>
  );
}
