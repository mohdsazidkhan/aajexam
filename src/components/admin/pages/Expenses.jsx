'use client';

import Select from '../../common/ui/Select';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useSSR } from '../../../hooks/useSSR';
import API from '../../../lib/api';
import {
    Plus, Trash2, Edit3, Search, RotateCcw, IndianRupee,
    Calendar, Tag, Receipt, PieChart, TrendingDown,
    PlusCircle, X
} from 'lucide-react';
import { m as motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../Sidebar';
import { AdminTableSkeleton } from '../Skeletons';
import ResponsiveTable from '../../common/ResponsiveTable';
import Pagination from '../../common/Pagination';
import StyledSelect from '../../common/ui/StyledSelect';
import { DEFAULT_PAGE_SIZE } from '../../../lib/constants/pagination';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';


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
                    <div className="font-bold text-content-primary uppercase tracking-tight group-hover:text-primary-600 transition-colors leading-none mb-2">{expense.title}</div>
                    <div className="text-[10px] font-bold text-content-muted uppercase tracking-[0.08em] line-clamp-1 max-w-xs">{expense.description || 'No description'}</div>
                </>
            )
        },
        {
            key: 'category', header: 'Category', render: (_, expense) => (
                <div className="text-center">
                    <span className="px-4 py-1.5 rounded-lg xl:rounded-xl text-on-primary text-[9px] font-bold uppercase tracking-[0.08em] bg-primary-600">
                        {expense.category}
                    </span>
                </div>
            )
        },
        {
            key: 'amount', header: 'Amount', render: (_, expense) => (
                <div className="text-right tabular-nums font-bold text-content-primary italic tracking-tight text-lg">
                    {formatAmount(expense.amount)}
                </div>
            )
        },
        {
            key: 'date', header: 'Date', render: (_, expense) => (
                <>
                    <div className="text-[10px] font-bold text-content-primary uppercase tracking-tight tabular-nums leading-none mb-1">{new Date(expense.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                    <div className="text-[9px] font-bold text-content-muted uppercase tracking-[0.08em]">{new Date(expense.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </>
            )
        },
        {
            key: 'actions', header: 'Actions', render: (_, expense) => (
                <div className="flex items-center justify-center gap-3">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        onClick={() => handleOpenModal(expense)}
                        className="p-3 text-on-primary rounded-lg xl:rounded-xl hover:bg-primary-700 hover:text-white transition-all bg-primary-600"
                    >
                        <Edit3 className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        onClick={() => handleDelete(expense._id)}
                        className="p-3 bg-black/10 dark:bg-white/10 text-content-primary rounded-lg xl:rounded-xl hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all"
                    >
                        <Trash2 className="w-4 h-4" />
                    </motion.button>
                </div>
            )
        }
    ];

    const totalExpensesCard = (
        <div className="flex items-center gap-2 p-3 bg-background-surface rounded-xl xl:rounded-2xl border border-border-primary w-full xl:w-fit mb-4 shrink-0 relative">
            <div className="p-2 text-on-primary rounded-lg shrink-0 bg-primary-600"><IndianRupee className="w-4 h-4" /></div>
            <div className="min-w-0">
                <div className="text-sm xl:text-base font-bold text-content-primary tabular-nums tracking-tight truncate">{formatAmount(summary.totalAmount)}</div>
                <div className="text-[9px] font-bold text-content-muted uppercase tracking-[0.08em] truncate">Total Expenses</div>
            </div>
        </div>
    );

    const searchInput = (
        <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted" />
            <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by title..."
                className="w-full pl-9 pr-4 py-2 bg-background-surface border border-border-primary rounded-lg xl:rounded-xl text-sm"
            />
        </form>
    );

    const categorySelect = (
        <StyledSelect
            value={category}
            onChange={val => setCategory(val)}
            options={[{ value: '', label: 'All Categories' }, ...expenseCategories.map(cat => ({ value: cat.id, label: cat.label }))]}
            className="w-full"
        />
    );

    const resetFiltersButton = (
        <button
            onClick={() => { setSearch(''); setCategory(''); fetchExpenses(1); }}
            title="Reset filters"
            className="p-2 rounded-lg xl:rounded-xl bg-background-surface border border-border-primary text-content-muted hover:text-primary-600 shrink-0"
        >
            <RotateCcw className="w-4 h-4" />
        </button>
    );

    const addExpenseButton = (
        <button
            onClick={() => handleOpenModal()}
            className="w-full col-span-2 xl:col-span-1 flex items-center justify-center gap-2 text-on-primary px-4 py-2 rounded-lg xl:rounded-xl font-bold text-sm hover:brightness-110 bg-primary-600"
        >
            <PlusCircle className="w-4 h-4" /> Add Expense
        </button>
    );

    const paginationControl = expenses.length > 0 && (
        <Pagination
      compact
            currentPage={page}
            totalPages={totalPages}
            onPageChange={fetchExpenses}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
        />
    );

    useAdminMobileHeader({
        title: 'Expenses',
        count: totalItems,
        filters: (
            <>
                {searchInput}
                {categorySelect}
                {resetFiltersButton}
                {addExpenseButton}
                {paginationControl}
            </>
        )
    });

    if (!isMounted) return null;

    return (
        <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col text-content-primary font-sans">
            {userInfo?.role === 'admin' && <Sidebar />}

            <div className="py-4 w-full mx-auto text-content-primary font-outfit flex-1 min-h-0 overflow-auto flex flex-col">
                {/* Title + filters now live in the navbar (title/count) and the filter drawer (controls), on web and mobile alike */}

                {totalExpensesCard}

                {/* Stats bar */}
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2 xl:gap-0 xl:divide-x divide-border-primary mb-4 shrink-0 bg-background-surface rounded-xl border border-border-primary xl:p-0 p-2">
                    {summary?.categories?.map((cat) => (
                        <div key={cat._id} className="flex items-center gap-2 px-3 py-2">
                            <div className="p-1.5 text-on-primary rounded-lg shrink-0 uppercase font-bold text-[10px] w-7 h-7 flex items-center justify-center bg-primary-600">{cat._id.charAt(0)}</div>
                            <div className="min-w-0">
                                <div className="text-sm font-bold text-content-primary tabular-nums tracking-tight truncate">{formatAmount(cat.totalAmount)}</div>
                                <div className="text-[9px] font-bold text-content-muted uppercase tracking-[0.08em] truncate capitalize">{cat._id}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* List Table */}
                <div className="flex-1 min-h-0 overflow-auto flex flex-col">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <AdminTableSkeleton showHeader={false} showFilters={false} />
                    ) : expenses.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl xl:rounded-3xl border border-dashed border-border-primary p-24 text-center">
                            <PieChart className="w-20 h-20 text-slate-300 mx-auto mb-4 xl:mb-4 opacity-20" />
                            <h3 className="text-2xl xl:text-3xl font-bold text-content-primary tracking-tight mb-4 font-outfit">No Expenses Recorded</h3>
                            <p className="text-content-muted text-[10px] font-bold uppercase tracking-[0.08em] leading-none">Start by adding your first expense to track platform spending.</p>
                        </motion.div>
                    ) : (
                        <div className="bg-background-surface rounded-2xl border border-border-primary overflow-hidden h-auto flex flex-col relative">
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
                </div>

                {/* Expense Modal */}
                <AnimatePresence>
                    {showModal && (
                        <div className="fixed inset-0 z-[999]">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-slate-900/60"
                                onClick={() => setShowModal(false)}
                            />
                            <motion.div
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
                                className="absolute inset-y-0 right-0 left-0 w-full bg-background-surface xl:rounded-l-2xl overflow-hidden flex flex-col border-l-2 border-border-primary"
                            >
                                <section className="px-4 py-2.5 border-b-2 border-border-primary flex items-center justify-between shrink-0">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 text-on-primary rounded-xl bg-primary-600"><Receipt className="w-5 h-5" /></div>
                                        <section>
                                            <h2 className="text-base font-bold text-content-primary uppercase italic tracking-tight leading-none">{isEditing ? 'Edit Expense' : 'Add Expense'}</h2>
                                            <p className="text-[10px] font-bold text-content-muted uppercase tracking-[0.08em] leading-none mt-1">Enter the expense details below</p>
                                        </section>
                                    </div>
                                    <button aria-label="Close" onClick={() => setShowModal(false)} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-600 dark:text-red-400 transition-colors shrink-0">
                                        <X className="w-5 h-5" />
                                    </button>
                                </section>

                                <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col">
<div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 xl:p-5 space-y-3">
                                    <div className="space-y-2 xl:space-y-3">
                                        <label className="text-[10px] font-bold text-content-muted uppercase tracking-[0.08em] ml-4">Title</label>
                                        <div className="relative group/field">
                                            <Tag className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted group-focus-within/field:text-primary-600 transition-colors" />
                                            <input
                                                required
                                                type="text"
                                                value={formData.title}
                                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                                placeholder="TITLE E.G. META ADS - AUG 2024"
                                                className="w-full pl-14 pr-6 py-3 bg-background-surface border focus:border-primary-500/20 rounded-lg xl:rounded-3xl text-xs font-bold uppercase tracking-[0.08em] outline-none transition-all border-border-primary"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 xl:gap-4">
                                        <div className="space-y-2 xl:space-y-3">
                                            <label className="text-[10px] font-bold text-content-muted uppercase tracking-[0.08em] ml-4">Amount</label>
                                            <div className="relative group/field">
                                                <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted group-focus-within/field:text-primary-600 transition-colors" />
                                                <input
                                                    required
                                                    type="number"
                                                    value={formData.amount}
                                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                                    placeholder="0.00"
                                                    className="w-full pl-14 pr-6 py-3 bg-background-surface border focus:border-primary-500/20 rounded-lg xl:rounded-3xl text-xs font-bold uppercase tracking-[0.08em] outline-none transition-all tabular-nums border-border-primary"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2 xl:space-y-3">
                                            <label className="text-[10px] font-bold text-content-muted uppercase tracking-[0.08em] ml-4">Date</label>
                                            <div className="relative group/field">
                                                <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted group-focus-within/field:text-primary-600 transition-colors" />
                                                <input
                                                    required
                                                    type="date"
                                                    value={formData.date}
                                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                                    className="w-full pl-14 pr-6 py-3 bg-background-surface border focus:border-primary-500/20 rounded-lg xl:rounded-3xl text-xs font-bold uppercase tracking-[0.08em] outline-none transition-all border-border-primary"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 xl:space-y-3">
                                        <label className="text-[10px] font-bold text-content-muted uppercase tracking-[0.08em] ml-4">Category</label>
                                        <Select
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-4 xl:px-5 py-3 bg-background-surface border focus:border-primary-500/20 rounded-lg xl:rounded-3xl text-xs font-bold uppercase tracking-[0.08em] outline-none transition-all cursor-pointer border-border-primary"
                                        >
                                            {expenseCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                                        </Select>
                                    </div>

                                    <div className="space-y-2 xl:space-y-3">
                                        <label className="text-[10px] font-bold text-content-muted uppercase tracking-[0.08em] ml-4">Description</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            rows="3"
                                            className="w-full px-4 xl:px-5 py-2 xl:py-3 bg-background-surface border focus:border-primary-500/20 rounded-lg xl:rounded-3xl text-xs font-bold uppercase tracking-[0.08em] outline-none transition-all resize-none border-border-primary"
                                            placeholder="ADD A NOTE ABOUT THIS EXPENSE..."
                                        />
                                    </div>

                                    </div>
<div className="flex gap-3 shrink-0 px-4 xl:px-5 py-2.5 border-t border-border-primary bg-background-surface justify-end items-center">
 <motion.button
 whileHover={{ x: -5 }}
 type="button"
 onClick={() => setShowModal(false)}
 className="px-6 py-3 rounded-lg xl:rounded-3xl bg-background-surface-secondary text-[10px] font-bold text-content-secondary uppercase tracking-[0.08em] hover:bg-background-surface-secondary transition-all border border-transparent"
 >
 CANCEL
 </motion.button>
 <motion.button
 whileHover={{ x: 5 }}
 type="submit"
 disabled={formLoading}
 className="px-6 py-3 rounded-lg xl:rounded-3xl text-on-primary text-[10px] font-bold uppercase tracking-[0.08em] disabled:opacity-50 bg-primary-600"
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
