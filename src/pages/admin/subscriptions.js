import dynamic from 'next/dynamic';
import { AdminTableSkeleton } from '../../components/skeletons/AdminSkeletons';

const AdminSubscriptions = dynamic(() => import('../../components/pages/admin/AdminSubscriptions'), {
  ssr: false,
  loading: () => <AdminTableSkeleton />
});

export default function Subscriptions() {
  return (
    <AdminSubscriptions />
  );
}
