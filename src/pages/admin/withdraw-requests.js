import dynamic from 'next/dynamic';
import { AdminTableSkeleton } from '../../components/admin/Skeletons';

const AdminWithdrawRequests = dynamic(() => import('../../components/pages/admin/WithdrawRequests'), {
  ssr: false,
  loading: () => <AdminTableSkeleton />
});

export default function WithdrawRequests() {
  return (
    <AdminWithdrawRequests />
  );
}

