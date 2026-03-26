'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { useSSR } from '../../../hooks/useSSR';
import Sidebar from '../../Sidebar';
import AdminMobileAppWrapper from '../../AdminMobileAppWrapper';
import Loading from '../../Loading';
import API from '../../../lib/api';
import {
    FaPlus, FaTrash, FaEdit, FaFilter, FaSearch, FaSyncAlt, FaRupeeSign, FaCalendarAlt, FaTag
} from 'react-icons/fa';

const AdminExpenses = () => {
    const { isMounted } = useSSR();
    const isOpen = useSelector(state => state.sidebar.isOpen);
    const userInfo = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('userInfo') || 'null') : null;
    const router = useRouter();

    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [summary, setSummary] = useState({ totalAmount: 0, count: 0, categories: [] });

    // Form state
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentExpenseId, setCurrentExpenseId] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: 'other',
        date: new Date().toISOString().split('T')[0],
        description: ''
    });
    const [formLoading, setFormLoading] = useState(false);

    const fetchExpenses = useCallback(async (pg = 1) => {
        try {
            setLoading(true);
            const params = { page: pg, limit: 10 };
            if (search) params.search = search;
            if (category) params.category = category;

            const res = await API.getAdminExpenses(params);
            if (res.success) {
                setExpenses(res.data || []);
                setTotalPages(res.totalPages || 1);
                setPage(pg);
            }
        } catch (err) {
            setError(err.message || 'Failed to fetch expenses');
        } finally {
            setLoading(false);
        }
    }, [search, category]);

    const fetchSummary = async () => {
        try {
            const res = await API.getAdminExpenseSummary();
            if (res.success) {
                setSummary(res.data);
            }
        } catch (err) {
            console.error('Failed to fetch summary:', err);
        }
    };

    useEffect(() => {
        if (isMounted) {
            fetchExpenses(1);
            fetchSummary();
        }
    }, [isMounted, category]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchExpenses(1);
    };

    const handleOpenModal = (expense = null) => {
        if (expense) {
            setIsEditing(true);
            setCurrentExpenseId(expense._id);
            setFormData({
                title: expense.title,
                amount: expense.amount,
                category: expense.category,
                date: new Date(expense.date).toISOString().split('T')[0],
                description: expense.description || ''
            });
        } else {
            setIsEditing(false);
            setCurrentExpenseId(null);
            setFormData({
                title: '',
                amount: '',
                category: 'other',
                date: new Date().toISOString().split('T')[0],
                description: ''
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            if (isEditing) {
                await API.updateAdminExpense(currentExpenseId, formData);
            } else {
                await API.createAdminExpense(formData);
            }
            setShowModal(false);
            fetchExpenses(page);
            fetchSummary();
        } catch (err) {
            alert(err.message || 'Failed to save expense');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this expense?')) {
            try {
                await API.deleteAdminExpense(id);
                fetchExpenses(page);
                fetchSummary();
            } catch (err) {
                alert(err.message || 'Failed to delete expense');
            }
        }
    };

    if (!isMounted) return null;

    return (
        <AdminMobileAppWrapper title="Platform Expenses">
            <div className={`adminPanel ${isOpen ? 'showPanel' : 'hidePanel'} bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen`}>
                {userInfo?.role === 'admin' && <Sidebar />}

                <div className="adminContent p-3 md:p-6 w-full">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold">Platform Expenses</h1>
                            <p className="text-gray-500 dark:text-gray-400">Manage manual expenses like ads, server costs, etc.</p>
                        </div>
                        <button
                            onClick={() => handleOpenModal()}
                            className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-yellow-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:shadow-xl transition transform hover:scale-105"
                        >
                            <FaPlus /> Add Expense
                        </button>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-4">
                                <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-xl text-red-500">
                                    <FaRupeeSign size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Expenses</p>
                                    <h2 className="text-2xl font-bold">₹{summary.totalAmount.toLocaleString('en-IN')}</h2>
                                </div>
                            </div>
                        </div>
                        {summary?.categories?.map(cat => (
                            <div key={cat._id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-4">
                                    <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-xl text-yellow-600 capitalize text-sm font-bold">
                                        {cat._id.substring(0, 2)}
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium capitalize">{cat._id} Costs</p>
                                        <h2 className="text-2xl font-bold">₹{cat.totalAmount.toLocaleString('en-IN')}</h2>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Filters */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow mb-6 flex flex-wrap items-center gap-4">
                        <form onSubmit={handleSearch} className="flex-1 min-w-[200px] relative">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search by title..."
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                            />
                        </form>
                        <select
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition capitalize"
                        >
                            <option value="">All Categories</option>
                            <option value="ads">Ads</option>
                            <option value="server">Server</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="marketing">Marketing</option>
                            <option value="other">Other</option>
                        </select>
                        <button
                            onClick={() => { setSearch(''); setCategory(''); fetchExpenses(1); }}
                            className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                        >
                            <FaSyncAlt />
                        </button>
                    </div>

                    {/* List Table */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-hidden border border-gray-100 dark:border-gray-700">
                        {loading ? (
                            <div className="p-20 flex justify-center"><Loading /></div>
                        ) : expenses.length === 0 ? (
                            <div className="p-20 text-center text-gray-500">No expenses found. Add your first expense!</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                                            <th className="px-6 py-4 font-bold">Expense Details</th>
                                            <th className="px-6 py-4 font-bold">Category</th>
                                            <th className="px-6 py-4 font-bold">Amount</th>
                                            <th className="px-6 py-4 font-bold">Date</th>
                                            <th className="px-6 py-4 font-bold text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {expenses.map(expense => (
                                            <tr key={expense._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-900 dark:text-white">{expense.title}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{expense.description || 'No description'}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold capitalize">
                                                        {expense.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-red-500">
                                                    ₹{expense.amount.toLocaleString('en-IN')}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                    {new Date(expense.date).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-3">
                                                        <button
                                                            onClick={() => handleOpenModal(expense)}
                                                            className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 hover:bg-indigo-100 transition"
                                                        >
                                                            <FaEdit />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(expense._id)}
                                                            className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 transition"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-6">
                            <button
                                onClick={() => fetchExpenses(page - 1)}
                                disabled={page === 1}
                                className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 disabled:opacity-50"
                            >
                                Prev
                            </button>
                            <span className="text-sm font-bold">Page {page} of {totalPages}</span>
                            <button
                                onClick={() => fetchExpenses(page + 1)}
                                disabled={page === totalPages}
                                className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Expense Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-gradient-to-r from-red-500 to-yellow-500 p-6 text-white">
                            <h2 className="text-xl font-bold">{isEditing ? 'Edit Expense' : 'Add New Expense'}</h2>
                            <p className="text-white/80 text-sm">Fill in the details below</p>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-1 ml-1 text-gray-700 dark:text-gray-300">Title</label>
                                <div className="relative">
                                    <FaTag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        required
                                        type="text"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g. Meta Ads - Aug 2024"
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold mb-1 ml-1 text-gray-700 dark:text-gray-300">Amount (₹)</label>
                                    <div className="relative">
                                        <FaRupeeSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            required
                                            type="number"
                                            value={formData.amount}
                                            onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                            placeholder="0.00"
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1 ml-1 text-gray-700 dark:text-gray-300">Date</label>
                                    <div className="relative">
                                        <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            required
                                            type="date"
                                            value={formData.date}
                                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1 ml-1 text-gray-700 dark:text-gray-300">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition capitalize"
                                >
                                    <option value="ads">Ads</option>
                                    <option value="server">Server</option>
                                    <option value="maintenance">Maintenance</option>
                                    <option value="marketing">Marketing</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1 ml-1 text-gray-700 dark:text-gray-300">Description (Optional)</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    rows="2"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                                    placeholder="Add notes..."
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-200 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-500 to-yellow-500 text-white font-bold shadow-lg hover:shadow-xl transition disabled:opacity-50"
                                >
                                    {formLoading ? 'Saving...' : 'Save Expense'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminMobileAppWrapper>
    );
};

export default AdminExpenses;
