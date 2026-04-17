import dynamic from 'next/dynamic';

const AdminSubscriptions = dynamic(() => import('../../components/pages/admin/AdminSubscriptions'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function Subscriptions() {
  return (
    <AdminSubscriptions />
  );
}
