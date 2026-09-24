'use client';
import React from 'react';
import Head from 'next/head';
import AdminRoute from '../../../components/admin/Route';
import AdminPYQForm from '../../../components/pages/admin/PYQForm';

export default function CreatePYQPage() {
    return (
        <AdminRoute>
            <Head><title>New PYQ Paper - Admin</title></Head>
            <AdminPYQForm mode="create" />
        </AdminRoute>
    );
}
