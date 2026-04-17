import dynamic from 'next/dynamic';

const AdminWithdrawRequests = dynamic(() => import('../../components/pages/admin/AdminWithdrawRequests'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function WithdrawRequests() {
  return (
    <AdminWithdrawRequests />
  );
}

