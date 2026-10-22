import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminDashboardSkeleton } from '../../components/admin/Skeletons';

const AdminMostActiveUsers = dynamic(() => import('../../components/admin/pages/MostActiveUsers'), {
    ssr: false,
    loading: () => <AdminDashboardSkeleton />
});

export default function AdminMostActiveUsersPage() {
    return (
        <>
            <Head>
                <title>Admin Most Active - AajExam</title>
                <meta name="robots" content="noindex,nofollow" />
            </Head>
            <AdminMostActiveUsers />
        </>
    );
}
