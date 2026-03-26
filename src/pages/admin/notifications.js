import dynamic from 'next/dynamic';

const AdminNotificationsPage = dynamic(() => import('../../components/pages/admin/AdminNotificationsPage'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function AdminNotifications() {
  return <AdminNotificationsPage />;
}

