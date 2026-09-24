import dynamic from 'next/dynamic';
import { AdminTableSkeleton } from '../../components/admin/Skeletons';

const AdminSubscriptions = dynamic(() => import('../../components/pages/admin/Subscriptions'), {
  ssr: false,
  loading: () => <AdminTableSkeleton />
});

export default function Subscriptions() {
  return (
    <AdminSubscriptions />
  );
}
