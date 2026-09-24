import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminDashboardSkeleton } from '../../../../components/admin/Skeletons';

const AdminUserAnalyticsDetail = dynamic(() => import('../../../../components/pages/admin/UserAnalyticsDetail'), {
    ssr: false,
    loading: () => <AdminDashboardSkeleton />
});

export default function UserAnalyticsDetailPage() {
    return (
        <>
            <Head>
                <title>User Analytics - SUBG Admin</title>
                <meta name="robots" content="noindex,nofollow" />
            </Head>
            <AdminUserAnalyticsDetail />
        </>
    );
}
