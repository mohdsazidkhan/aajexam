import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const AdminSubscriptions = dynamic(() => import('../../components/pages/admin/AdminSubscriptions'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function Subscriptions() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminSubscriptions />
    </Suspense>
  );
}
