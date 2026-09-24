import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminDashboardSkeleton } from '../../../../components/admin/Skeletons';

const AdminUsersAnalytics = dynamic(() => import('../../../../components/pages/admin/UsersAnalytics'), {
    ssr: false,
    loading: () => <AdminDashboardSkeleton />
});

export default function UsersOverviewPage() {
    return (
        <>
            <Head>
                <title>All Users Analytics - SUBG Admin</title>
                <meta name="robots" content="noindex,nofollow" />
            </Head>
            <AdminUsersAnalytics />
        </>
    );
}
