import dynamic from 'next/dynamic';

const AdminUserWallets = dynamic(() => import('../../components/pages/admin/AdminUserWallets'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function AdminUserWalletsPage() {
  return (
    <AdminUserWallets />
  );
}
