import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const AdminUserQuestions = dynamic(() => import('../../components/pages/admin/AdminUserQuestions'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function AdminUserQuestionsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminUserQuestions />
    </Suspense>
  );
}
