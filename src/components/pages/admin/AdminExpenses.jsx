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
    Plus, Trash2, Edit3, Filter, Search, RotateCcw, IndianRupee,
    Calendar, Tag, Receipt, PieChart, TrendingDown,
    PlusCircle, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

    const formatAmount = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(n || 0);

    const expenseCategories = [
        { id: 'ads', label: 'Advertising', color: 'indigo' },
        { id: 'server', label: 'Cloud Infrastructure', color: 'slate' },
        { id: 'maintenance', label: 'Platform Maintenance', color: 'amber' },
        { id: 'marketing', label: 'Growth Marketing', color: 'emerald' },
        { id: 'other', label: 'Miscellaneous', color: 'rose' }
    ];

    return (
        <AdminMobileAppWrapper title="Expense Management">
            <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] text-slate-900 dark:text-white font-sans selection:bg-indigo-500/30">
                {userInfo?.role === 'admin' && <Sidebar />}

                <div className="adminContent p-4 lg:p-12 w-full max-w-[1600px] mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-[3.5rem] border-4 border-slate-100 dark:border-white/10 p-3 lg:p-12 mb-4 lg:mb-12 shadow-2xl overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-3 lg:p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Receipt className="w-64 h-64 text-indigo-500 -rotate-12" />
                        </div>

                        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                            <div className="space-y-3 lg:space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl">
                                        <TrendingDown className="w-6 h-6" />
                                    </div>
                                    <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em]">ADMIN // OPERATIONS</span>
                                </div>

                                <h1 className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none font-outfit">
                                    PLATFORM <span className="text-indigo-600">EXPENSES</span>
                                </h1>

                                <p className="max-w-2xl text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest leading-relaxed">
                                    Monitor and manage manual platform expenditures including advertising, infrastructure, and maintenance costs.
                                </p>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleOpenModal()}
                                className="flex items-center gap-4 px-4 lg:px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg lg:rounded-[2rem] shadow-2xl shadow-slate-900/20 group/btn"
                            >
                                <PlusCircle className="w-5 h-5 group-hover/btn:rotate-90 transition-transform" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">ADD NEW EXPENSE</span>
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-8 mb-4 lg:mb-12">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white/80 dark:bg-white/5 backdrop-blur-xl p-3 lg:p-8 rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/10 shadow-2xl relative overflow-hidden group"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
                            <div className="p-4 bg-red-500/10 text-red-500 rounded-2xl w-fit mb-6 group-hover:scale-125 transition-transform">
                                <IndianRupee className="w-6 h-6" />
                            </div>
                            <div className="text-3xl font-black tabular-nums tracking-tighter text-slate-900 dark:text-white mb-2">
                                {formatAmount(summary.totalAmount)}
                            </div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">TOTAL DISBURSEMENTS</div>
                        </motion.div>

                        {summary?.categories?.map((cat, i) => (
                            <motion.div
                                key={cat._id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white/80 dark:bg-white/5 backdrop-blur-xl p-3 lg:p-8 rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/10 shadow-2xl relative overflow-hidden group"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500" />
                                <div className="p-4 bg-indigo-500/10 text-indigo-500 rounded-2xl w-fit mb-6 group-hover:rotate-12 transition-transform capitalize font-black text-xs">
                                    {cat._id.charAt(0)}
                                </div>
                                <div className="text-3xl font-black tabular-nums tracking-tighter text-slate-900 dark:text-white mb-2">
                                    {formatAmount(cat.totalAmount)}
                                </div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none capitalize">{cat._id} SPENDING</div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col lg:flex-row items-center gap-3 lg:gap-6 mb-4 lg:mb-12">
                        <form onSubmit={handleSearch} className="relative group/search w-full lg:w-96">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/search:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="SEARCH BY TITLE..."
                                className="w-full pl-14 pr-8 py-5 bg-white/80 dark:bg-white/5 border-4 border-slate-100 dark:border-white/10 focus:border-indigo-500/50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all shadow-xl"
                            />
                        </form>

                        <div className="flex items-center gap-3 px-3 lg:px-6 py-3 bg-white dark:bg-white/10 rounded-lg lg:rounded-[2rem] shadow-xl border-4 border-slate-100 dark:border-white/5">
                            <Filter className="w-4 h-4 text-indigo-500" />
                            <select
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                className="bg-transparent text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest focus:outline-none cursor-pointer"
                            >
                                <option value="">ALL EXPENDITURES</option>
                                {expenseCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                            </select>
                        </div>

                        <motion.button
                            whileHover={{ rotate: 180 }}
                            onClick={() => { setSearch(''); setCategory(''); fetchExpenses(1); }}
                            className="p-4 rounded-full bg-white dark:bg-white/5 text-slate-400 border-4 border-slate-100 dark:border-white/10 shadow-xl hover:text-indigo-500 transition-colors ml-auto"
                        >
                            <RotateCcw className="w-5 h-5" />
                        </motion.button>
                    </div>

                    {/* List Table */}
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <div className="p-32 flex justify-center"><Loading size="md" color="yellow" message="Syncing expense ledger..." /></div>
                        ) : expenses.length === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-[4rem] border-4 border-dashed border-slate-200 dark:border-white/10 p-24 text-center shadow-2xl">
                                <PieChart className="w-20 h-20 text-slate-300 mx-auto mb-4 lg:mb-8 opacity-20" />
                                <h3 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4 font-outfit">Financial Void</h3>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-none">No expenditures recorded for this sector</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-[3.5rem] border-4 border-slate-100 dark:border-white/10 shadow-2xl overflow-hidden"
                            >
                                <div className="overflow-x-auto selection:bg-indigo-500/30 text-nowrap">
                                    <table className="w-full border-separate border-spacing-y-4 px-4 lg:px-8 py-4">
                                        <thead>
                                            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-left">
                                                <th className="px-3 lg:px-6 py-4">Expenditure Details</th>
                                                <th className="px-3 lg:px-6 py-4 text-center">Classification</th>
                                                <th className="px-3 lg:px-6 py-4 text-right">Value</th>
                                                <th className="px-3 lg:px-6 py-4">Recorded Date</th>
                                                <th className="px-3 lg:px-6 py-4 text-center">Controls</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {expenses.map((expense, idx) => (
                                                <motion.tr
                                                    key={expense._id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.03 }}
                                                    className="group bg-slate-50/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 transition-all shadow-sm hover:shadow-xl rounded-3xl"
                                                >
                                                    <td className="px-3 lg:px-6 py-3 lg:py-6 border-l-4 border-transparent group-hover:border-indigo-500 first:rounded-l-[2rem]">
                                                        <div className="font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-indigo-500 transition-colors leading-none mb-2">{expense.title}</div>
                                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest line-clamp-1 max-w-xs">{expense.description || 'No detailed metadata recorded'}</div>
                                                    </td>
                                                    <td className="px-3 lg:px-6 py-3 lg:py-6 text-center">
                                                        <span className="px-4 py-1.5 rounded-xl bg-indigo-500 text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20">
                                                            {expense.category}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 lg:px-6 py-3 lg:py-6 text-right tabular-nums font-black text-red-500 italic tracking-tighter text-lg">
                                                        {formatAmount(expense.amount)}
                                                    </td>
                                                    <td className="px-3 lg:px-6 py-3 lg:py-6">
                                                        <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tighter tabular-nums leading-none mb-1">{new Date(expense.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(expense.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                    </td>
                                                    <td className="px-3 lg:px-6 py-3 lg:py-6 last:rounded-r-[2rem]">
                                                        <div className="flex items-center justify-center gap-3">
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                onClick={() => handleOpenModal(expense)}
                                                                className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl hover:bg-indigo-500 hover:text-white transition-all shadow-sm"
                                                            >
                                                                <Edit3 className="w-4 h-4" />
                                                            </motion.button>
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                onClick={() => handleDelete(expense._id)}
                                                                className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </motion.button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-3 mt-16 bg-white/50 dark:bg-white/5 backdrop-blur-xl p-3 rounded-xl lg:rounded-[2.5rem] border-4 border-slate-100 dark:border-white/5 shadow-2xl w-fit mx-auto">
                            <motion.button
                                whileHover={{ x: -2 }}
                                onClick={() => fetchExpenses(page - 1)}
                                disabled={page === 1}
                                className="px-3 lg:px-6 py-3 rounded-2xl bg-white dark:bg-white/10 text-[10px] font-black text-slate-600 dark:text-white uppercase tracking-widest disabled:opacity-30 border border-slate-100 dark:border-white/10"
                            >
                                PREV
                            </motion.button>
                            <div className="px-3 lg:px-6 text-[10px] font-black text-indigo-500 uppercase tracking-widest border-x-2 border-slate-100 dark:border-white/10">
                                PAGE {page} OF {totalPages}
                            </div>
                            <motion.button
                                whileHover={{ x: 2 }}
                                onClick={() => fetchExpenses(page + 1)}
                                disabled={page === totalPages}
                                className="px-3 lg:px-6 py-3 rounded-2xl bg-white dark:bg-white/10 text-[10px] font-black text-slate-600 dark:text-white uppercase tracking-widest disabled:opacity-30 border border-slate-100 dark:border-white/10"
                            >
                                NEXT
                            </motion.button>
                        </div>
                    )}
                </div>
            </div>

            {/* Expense Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-3xl"
                            onClick={() => setShowModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white dark:bg-slate-900 w-full max-w-xl rounded-xl lg:rounded-[3rem] shadow-2xl overflow-hidden border-4 border-slate-100 dark:border-white/10"
                        >
                            <div className="bg-slate-900 p-4 lg:p-10 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-3 lg:p-8 opacity-10">
                                    <Receipt className="w-24 h-24 rotate-12" />
                                </div>
                                <div className="relative z-10">
                                    <h2 className="text-3xl font-black uppercase tracking-tighter italic mb-1 font-outfit leading-none">{isEditing ? 'REVISE' : 'RECORD'} EXPENDITURE</h2>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Update manual platform disbursements</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-4 lg:p-10 space-y-4 lg:space-y-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-4">Expenditure Metadata</label>
                                    <div className="relative group/field">
                                        <Tag className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/field:text-indigo-500 transition-colors" />
                                        <input
                                            required
                                            type="text"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="TITLE E.G. META ADS - AUG 2024"
                                            className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-indigo-500/20 rounded-lg lg:rounded-[2rem] text-xs font-black uppercase tracking-widest outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-4">Currency Value</label>
                                        <div className="relative group/field">
                                            <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/field:text-indigo-500 transition-colors" />
                                            <input
                                                required
                                                type="number"
                                                value={formData.amount}
                                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                                placeholder="0.00"
                                                className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-indigo-500/20 rounded-lg lg:rounded-[2rem] text-xs font-black uppercase tracking-widest outline-none transition-all tabular-nums"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-4">Disbursement Date</label>
                                        <div className="relative group/field">
                                            <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/field:text-indigo-500 transition-colors" />
                                            <input
                                                required
                                                type="date"
                                                value={formData.date}
                                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                                className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-indigo-500/20 rounded-lg lg:rounded-[2rem] text-xs font-black uppercase tracking-widest outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-4">Expenditure Sector</label>
                                    <select
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 lg:px-8 py-5 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-indigo-500/20 rounded-lg lg:rounded-[2rem] text-xs font-black uppercase tracking-widest outline-none transition-all cursor-pointer shadow-sm"
                                    >
                                        {expenseCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-4">Detailed Notes</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        rows="3"
                                        className="w-full px-4 lg:px-8 py-3 lg:py-6 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-indigo-500/20 rounded-lg lg:rounded-[2rem] text-xs font-black uppercase tracking-widest outline-none transition-all resize-none"
                                        placeholder="RECORD ADDITIONAL TRANSACTION DATA..."
                                    />
                                </div>

                                <div className="flex gap-3 lg:gap-6 pt-4">
                                    <motion.button
                                        whileHover={{ x: -5 }}
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-5 rounded-lg lg:rounded-[2rem] bg-slate-100 dark:bg-white/5 text-[10px] font-black text-slate-600 dark:text-white uppercase tracking-[0.2em] hover:bg-slate-200 transition-all border-2 border-transparent"
                                    >
                                        DISCARD
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ x: 5 }}
                                        type="submit"
                                        disabled={formLoading}
                                        className="flex-1 py-5 rounded-lg lg:rounded-[2rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl disabled:opacity-50"
                                    >
                                        {formLoading ? 'COMMITING...' : (isEditing ? 'REVISE ENTRY' : 'COMMIT RECORD')}
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AdminMobileAppWrapper>
    );
};

export default AdminExpenses;
