import dynamic from 'next/dynamic';
import { AdminTableSkeleton } from '../../components/admin/Skeletons';

const AdminNotificationsPage = dynamic(() => import('../../components/pages/admin/NotificationsPage'), {
  ssr: false,
  loading: () => <AdminTableSkeleton />
});

export default function AdminNotifications() {
  return <AdminNotificationsPage />;
}

