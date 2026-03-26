import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const AdminUserWallets = dynamic(() => import('../../components/pages/admin/AdminUserWallets'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function AdminUserWalletsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminUserWallets />
    </Suspense>
  );
}
