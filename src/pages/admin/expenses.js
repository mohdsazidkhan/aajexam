import dynamic from 'next/dynamic';
import React from 'react';

const AdminExpenses = dynamic(() => import('../../components/admin/pages/Expenses'), {
    ssr: false,
});

const ExpensesPage = () => {
    return <AdminExpenses />;
};

export default ExpensesPage;
