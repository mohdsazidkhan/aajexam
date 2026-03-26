import dynamic from 'next/dynamic';
import React from 'react';

const AdminExpenses = dynamic(() => import('../../components/pages/admin/AdminExpenses'), {
    ssr: false,
});

const ExpensesPage = () => {
    return <AdminExpenses />;
};

export default ExpensesPage;
