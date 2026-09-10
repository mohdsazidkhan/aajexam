import dynamic from 'next/dynamic';
import { AdminTableSkeleton } from '../../components/skeletons/AdminSkeletons';

const AdminUserWallets = dynamic(() => import('../../components/pages/admin/AdminUserWallets'), {
  ssr: false,
  loading: () => <AdminTableSkeleton />
});

export default function AdminUserWalletsPage() {
  return (
    <AdminUserWallets />
  );
}
