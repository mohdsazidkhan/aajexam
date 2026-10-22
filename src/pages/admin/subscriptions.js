import dynamic from 'next/dynamic';
import { AdminTableSkeleton } from '../../components/admin/Skeletons';

const AdminSubscriptions = dynamic(() => import('../../components/admin/pages/Subscriptions'), {
  ssr: false,
  loading: () => <AdminTableSkeleton />
});

export default function Subscriptions() {
  return (
    <AdminSubscriptions />
  );
}
