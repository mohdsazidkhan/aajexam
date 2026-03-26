import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const AdminWithdrawRequests = dynamic(() => import('../../components/pages/admin/AdminWithdrawRequests'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function WithdrawRequests() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminWithdrawRequests />
    </Suspense>
  );
}

