import dynamic from 'next/dynamic';
import { AdminTableSkeleton } from '../../components/skeletons/AdminSkeletons';

const AdminNotificationsPage = dynamic(() => import('../../components/pages/admin/AdminNotificationsPage'), {
  ssr: false,
  loading: () => <AdminTableSkeleton />
});

export default function AdminNotifications() {
  return <AdminNotificationsPage />;
}

