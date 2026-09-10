import dynamic from 'next/dynamic';
import { AdminTableSkeleton } from '../../components/skeletons/AdminSkeletons';

const AdminWithdrawRequests = dynamic(() => import('../../components/pages/admin/AdminWithdrawRequests'), {
  ssr: false,
  loading: () => <AdminTableSkeleton />
});

export default function WithdrawRequests() {
  return (
    <AdminWithdrawRequests />
  );
}

