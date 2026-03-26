import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Head from 'next/head';

const AdminPrevMonthPlayedUsers = dynamic(() => import('../../../components/pages/admin/AdminPrevMonthPlayedUsers'), {
    ssr: false,
    loading: () => <div>Loading...</div>
});

export default function PrevMonthPlayedUsersPage() {
    return (
        <>
            <Head>
                <title>Prev Month Played Users - Admin - SUBG</title>
                <meta name="robots" content="noindex,nofollow" />
            </Head>
            <Suspense fallback={<div>Loading...</div>}>
                <AdminPrevMonthPlayedUsers />
            </Suspense>
        </>
    );
}
