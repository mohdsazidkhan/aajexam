import dynamic from 'next/dynamic';
import { AdminTableSkeleton } from '../../components/admin/Skeletons';

const AdminUserWallets = dynamic(() => import('../../components/pages/admin/UserWallets'), {
  ssr: false,
  loading: () => <AdminTableSkeleton />
});

export default function AdminUserWalletsPage() {
  return (
    <AdminUserWallets />
  );
}
