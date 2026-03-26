import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Head from 'next/head';

const AdminUsersAnalytics = dynamic(() => import('../../../../components/pages/admin/AdminUsersAnalytics'), {
    ssr: false,
    loading: () => <div>Loading...</div>
});

export default function UsersOverviewPage() {
    return (
        <>
            <Head>
                <title>All Users Analytics - SUBG Admin</title>
                <meta name="robots" content="noindex,nofollow" />
            </Head>
            <Suspense fallback={<div>Loading...</div>}>
                <AdminUsersAnalytics />
            </Suspense>
        </>
    );
}
