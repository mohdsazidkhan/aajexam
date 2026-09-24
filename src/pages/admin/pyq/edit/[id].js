'use client';
import React from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminRoute from '../../../../components/admin/Route';
import AdminPYQForm from '../../../../components/pages/admin/PYQForm';

export default function EditPYQPage() {
    const router = useRouter();
    const { id } = router.query;
    if (!id) return null;
    return (
        <AdminRoute>
            <Head><title>Edit PYQ - Admin</title></Head>
            <AdminPYQForm mode="edit" pyqId={id} />
        </AdminRoute>
    );
}
