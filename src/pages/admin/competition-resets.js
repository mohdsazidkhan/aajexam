import dynamic from 'next/dynamic';

const AdminCompetitionResets = dynamic(() => import('../../components/pages/admin/AdminCompetitionResets'), {
  ssr: false,
  loading: () => <div className="p-8 text-center text-gray-500">Loading reset manager...</div>
});

export default function CompetitionResetsPage() {
  return <AdminCompetitionResets />;
}
