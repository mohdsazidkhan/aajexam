'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useSSR } from '../../../hooks/useSSR';
import API from '../../../lib/api';
import {
    Plus, Trash2, Edit3, Search, RotateCcw, IndianRupee,
    Calendar, Tag, Receipt, PieChart, TrendingDown,
    PlusCircle, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../../Sidebar';
import { AdminTableSkeleton } from '../../skeletons/AdminSkeletons';
import ResponsiveTable from '../../ResponsiveTable';
import Pagination from '../../Pagination';
import { DEFAULT_PAGE_SIZE } from '../../../lib/constants/pagination';


const AdminExpenses = () => {
    const { isMounted } = useSSR();
    const userInfo = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('userInfo') || 'null') : null;
    const router = useRouter();

    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [page, setPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_PAGE_SIZE);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
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
            const params = { page: pg, limit: itemsPerPage };
            if (search) params.search = search;
            if (category) params.category = category;

            const res = await API.getAdminExpenses(params);
            if (res.success) {
                setExpenses(res.data || []);
                setTotalPages(res.totalPages || 1);
                setTotalItems(res.totalExpenses || 0);
                setPage(pg);
            }
        } catch (err) {
            setError(err.message || 'Failed to fetch expenses');
        } finally {
            setLoading(false);
        }
    }, [search, category, itemsPerPage]);

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

    const handleItemsPerPageChange = (val) => {
        setItemsPerPage(val);
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

    const formatAmount = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(n || 0);

    const expenseCategories = [
        { id: 'ads', label: 'Advertising', color: 'primary' },
        { id: 'server', label: 'Hosting & Servers', color: 'slate' },
        { id: 'maintenance', label: 'Maintenance', color: 'primary' },
        { id: 'marketing', label: 'Marketing', color: 'primary' },
        { id: 'other', label: 'Other', color: 'primary' }
    ];

    const expenseTableColumns = [
        {
            key: 'expense', header: 'Expense', render: (_, expense) => (
                <>
                    <div className="font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-primary-600 transition-colors leading-none mb-2">{expense.title}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest line-clamp-1 max-w-xs">{expense.description || 'No description'}</div>
                </>
            )
        },
        {
            key: 'category', header: 'Category', render: (_, expense) => (
                <div className="text-center">
                    <span className="px-4 py-1.5 rounded-lg lg:rounded-xl bg-primary-600 text-white text-[9px] font-black uppercase tracking-widest shadow-sm">
                        {expense.category}
                    </span>
                </div>
            )
        },
        {
            key: 'amount', header: 'Amount', render: (_, expense) => (
                <div className="text-right tabular-nums font-black text-black dark:text-white italic tracking-tighter text-lg">
                    {formatAmount(expense.amount)}
                </div>
            )
        },
        {
            key: 'date', header: 'Date', render: (_, expense) => (
                <>
                    <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tighter tabular-nums leading-none mb-1">{new Date(expense.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(expense.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </>
            )
        },
        {
            key: 'actions', header: 'Actions', render: (_, expense) => (
                <div className="flex items-center justify-center gap-3">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        onClick={() => handleOpenModal(expense)}
                        className="p-3 bg-primary-500/10 text-primary-600 rounded-lg lg:rounded-xl hover:bg-primary-700 hover:text-white transition-all shadow-sm"
                    >
                        <Edit3 className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        onClick={() => handleDelete(expense._id)}
                        className="p-3 bg-black/10 dark:bg-white/10 text-black dark:text-white rounded-lg lg:rounded-xl hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all shadow-sm"
                    >
                        <Trash2 className="w-4 h-4" />
                    </motion.button>
                </div>
            )
        }
    ];

    return (
        <div className="h-[calc(100vh-64px)] max-md:h-[calc(100vh-112px)] overflow-hidden flex flex-col text-slate-900 dark:text-white font-sans selection:bg-primary-500/30">
            {userInfo?.role === 'admin' && <Sidebar />}

            <div className="adminContent w-full mx-auto text-slate-900 dark:text-white font-outfit flex-1 min-h-0 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4 shrink-0">
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 shrink-0"><Receipt className="w-6 h-6 text-primary-600 shrink-0" /> Expenses <span className="text-slate-400 dark:text-slate-500">({totalItems})</span></h1>

                    <div className="grid grid-cols-2 lg:flex lg:items-center gap-2 lg:gap-3 w-full lg:w-auto">
                        <div className="col-span-2 lg:col-span-1 flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 rounded-lg lg:rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
                            <div className="p-1.5 bg-primary-500/10 text-primary-600 rounded-lg shrink-0"><IndianRupee className="w-3.5 h-3.5" /></div>
                            <div className="min-w-0">
                                <div className="text-sm font-black text-slate-900 dark:text-white tabular-nums tracking-tight truncate">{formatAmount(summary.totalAmount)}</div>
                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">Total Expenses</div>
                            </div>
                        </div>
                        <form onSubmit={handleSearch} className="relative col-span-2 sm:w-56">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search by title..."
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-sm"
                            />
                        </form>
                        <select
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                            className="px-3 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-sm"
                        >
                            <option value="">All Categories</option>
                            {expenseCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                        </select>
                        <button
                            onClick={() => { setSearch(''); setCategory(''); fetchExpenses(1); }}
                            title="Reset filters"
                            className="p-2 rounded-lg lg:rounded-xl bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 text-slate-500 hover:text-primary-600 shrink-0"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleOpenModal()}
                            className="col-span-2 lg:col-span-1 flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg lg:rounded-xl font-bold text-sm hover:bg-primary-700 shrink-0"
                        >
                            <PlusCircle className="w-4 h-4" /> Add Expense
                        </button>
                    </div>
                </div>

                {/* Stats bar */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 lg:gap-0 lg:divide-x divide-slate-100 dark:divide-slate-700 mb-4 shrink-0 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 lg:p-0 p-2">
                    {summary?.categories?.map((cat) => (
                        <div key={cat._id} className="flex items-center gap-2 px-3 py-2">
                            <div className="p-1.5 bg-primary-500/10 text-primary-600 rounded-lg shrink-0 uppercase font-black text-[10px] w-7 h-7 flex items-center justify-center">{cat._id.charAt(0)}</div>
                            <div className="min-w-0">
                                <div className="text-sm font-black text-slate-900 dark:text-white tabular-nums tracking-tight truncate">{formatAmount(cat.totalAmount)}</div>
                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate capitalize">{cat._id}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* List Table */}
                <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <AdminTableSkeleton showHeader={false} showFilters={false} />
                    ) : expenses.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-[4rem] border-2 border-dashed border-slate-200 dark:border-white/10 p-24 text-center shadow-sm">
                            <PieChart className="w-20 h-20 text-slate-300 mx-auto mb-4 lg:mb-8 opacity-20" />
                            <h3 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4 font-outfit">No Expenses Recorded</h3>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-none">Start by adding your first expense to track platform spending.</p>
                        </motion.div>
                    ) : (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden h-full flex flex-col">
                            <ResponsiveTable
                                data={expenses}
                                columns={expenseTableColumns}
                                viewModes={['table']}
                                defaultView="table"
                                showPagination={false}
                                showViewToggle={false}
                                fillHeight
                            />
                        </div>
                    )}
                </AnimatePresence>

                {/* Pagination */}
                {expenses.length > 0 && (
                    <div className="shrink-0">
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={fetchExpenses}
                            totalItems={totalItems}
                            itemsPerPage={itemsPerPage}
                            onItemsPerPageChange={handleItemsPerPageChange}
                        />
                    </div>
                )}
                </div>

                {/* Expense Modal */}
                <AnimatePresence>
                    {showModal && (
                        <div className="fixed inset-0 z-[100]">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-slate-900/60 backdrop-blur-3xl"
                                onClick={() => setShowModal(false)}
                            />
                            <motion.div
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
                                className="absolute top-16 right-0 bottom-0 left-0 lg:left-64 bg-white dark:bg-slate-900 lg:rounded-l-[2rem] shadow-2xl overflow-hidden flex flex-col border-l-2 border-slate-100 dark:border-white/10"
                            >
                                <div className="bg-slate-900 p-4 lg:p-10 text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-3 lg:p-8 opacity-10">
                                        <Receipt className="w-24 h-24 rotate-12" />
                                    </div>
                                    <div className="relative z-10">
                                        <h2 className="text-xl lg:text-2xl font-black uppercase tracking-tighter italic mb-1 font-outfit leading-none">{isEditing ? 'Edit Expense' : 'Add Expense'}</h2>
                                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Enter the expense details below</p>
                                    </div>
                                    <button onClick={() => setShowModal(false)} className="absolute top-2 right-2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="flex-1 p-4 lg:p-10 space-y-2 lg:space-y-4 lg:space-y-8 overflow-y-auto">
                                    <div className="space-y-2 lg:space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-4">Title</label>
                                        <div className="relative group/field">
                                            <Tag className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/field:text-primary-600 transition-colors" />
                                            <input
                                                required
                                                type="text"
                                                value={formData.title}
                                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                                placeholder="TITLE E.G. META ADS - AUG 2024"
                                                className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-black border-2 border-transparent focus:border-primary-500/20 rounded-lg lg:rounded-[2rem] text-xs font-black uppercase tracking-widest outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-8">
                                        <div className="space-y-2 lg:space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-4">Amount</label>
                                            <div className="relative group/field">
                                                <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/field:text-primary-600 transition-colors" />
                                                <input
                                                    required
                                                    type="number"
                                                    value={formData.amount}
                                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                                    placeholder="0.00"
                                                    className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-black border-2 border-transparent focus:border-primary-500/20 rounded-lg lg:rounded-[2rem] text-xs font-black uppercase tracking-widest outline-none transition-all tabular-nums"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2 lg:space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-4">Date</label>
                                            <div className="relative group/field">
                                                <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/field:text-primary-600 transition-colors" />
                                                <input
                                                    required
                                                    type="date"
                                                    value={formData.date}
                                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                                    className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-black border-2 border-transparent focus:border-primary-500/20 rounded-lg lg:rounded-[2rem] text-xs font-black uppercase tracking-widest outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 lg:space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-4">Category</label>
                                        <select
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-4 lg:px-8 py-5 bg-slate-50 dark:bg-black border-2 border-transparent focus:border-primary-500/20 rounded-lg lg:rounded-[2rem] text-xs font-black uppercase tracking-widest outline-none transition-all cursor-pointer shadow-sm"
                                        >
                                            {expenseCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-2 lg:space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-4">Description</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            rows="3"
                                            className="w-full px-4 lg:px-8 py-3 lg:py-6 bg-slate-50 dark:bg-black border-2 border-transparent focus:border-primary-500/20 rounded-lg lg:rounded-[2rem] text-xs font-black uppercase tracking-widest outline-none transition-all resize-none"
                                            placeholder="ADD A NOTE ABOUT THIS EXPENSE..."
                                        />
                                    </div>

                                    <div className="flex gap-3 lg:gap-6 pt-4">
                                        <motion.button
                                            whileHover={{ x: -5 }}
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            className="flex-1 py-5 rounded-lg lg:rounded-[2rem] bg-slate-100 dark:bg-white/5 text-[10px] font-black text-slate-600 dark:text-white uppercase tracking-[0.2em] hover:bg-slate-200 transition-all border-2 border-transparent"
                                        >
                                            CANCEL
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ x: 5 }}
                                            type="submit"
                                            disabled={formLoading}
                                            className="flex-1 py-5 rounded-lg lg:rounded-[2rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm disabled:opacity-50"
                                        >
                                            {formLoading ? 'SAVING...' : (isEditing ? 'SAVE CHANGES' : 'ADD EXPENSE')}
                                        </motion.button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div >
    );
};

export default AdminExpenses;
