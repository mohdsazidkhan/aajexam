'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Pagination from "../../Pagination";
import API from '../../../lib/api';
import UnifiedFooter from "../../UnifiedFooter";
import Loading from "../../Loading";
import ViewToggle from "../../ViewToggle";
import { useSSR } from '../../../hooks/useSSR';
import { FaQuestionCircle, FaRupeeSign, FaCalendarAlt, FaCheckCircle, FaPlusCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { isMobile } from 'react-device-detect';
import { getCurrentUser } from '../../../utils/authUtils';

const PAGE_LIMIT = 20;

export default function UserQuestionRewards() {
    const { isMounted, isRouterReady, router } = useSSR();
    const user = getCurrentUser();

    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(PAGE_LIMIT);
    const [pagination, setPagination] = useState({});
    const [summary, setSummary] = useState(null);
    const [questionCount, setQuestionCount] = useState({
        currentCount: 0,
        limit: 50, // Default limit
        remaining: 50,
        canAddMore: true
    });
    const [viewMode, setViewMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return (isMobile || window.innerWidth < 768) ? 'grid' : 'table';
        }
        return isMobile ? 'list' : 'table';
    });

    const fetchCurrentMonthQuestionCount = async () => {
        if (!user?.id) return;
        try {
            const response = await API.getCurrentMonthQuestionCount(user.id);
            if (response.success && response.data) {
                const { count, monthlyLimit } = response.data;
                setQuestionCount({
                    currentCount: count,
                    limit: monthlyLimit || 50,
                    remaining: Math.max(0, (monthlyLimit || 50) - count),
                    canAddMore: count < (monthlyLimit || 50)
                });
            }
        } catch (error) {
            console.error('Error fetching current month question count:', error);
        }
    };

    useEffect(() => {
        if (isMounted) {
            fetchQuestionRewardsHistory(page, limit);
            fetchCurrentMonthQuestionCount();
        }
    }, [isMounted, page, limit]);

    const fetchQuestionRewardsHistory = async (page = 1, limit = 20) => {
        try {
            setLoading(true);
            setError(null);
            const params = {
                page,
                limit,
            };

            const response = await API.getQuestionRewardsHistory(params);

            if (response?.success) {
                setTransactions(response.data?.transactions || []);
                setPagination(response.data?.pagination || {});
                setSummary(response.data?.summary || null);
            } else {
                const errorMsg = response?.message || response?.error || 'Failed to fetch question rewards history';
                setError(errorMsg);
                toast.error(errorMsg);
            }
        } catch (err) {
            console.error('Error fetching question rewards history:', err);
            const errorMessage = err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                'Failed to fetch question rewards history.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getDisplayQuestionText = (tx) => {
        // 1. Try populated questionId
        if (tx.questionId && typeof tx.questionId === 'object' && tx.questionId.questionText) {
            return tx.questionId.questionText;
        }

        // 2. Try metadata
        if (tx.metadata?.questionText) {
            return tx.metadata.questionText;
        }

        // 3. Fallback to description with cleaning
        if (tx.description) {
            let cleaned = tx.description;
            // Remove common generic prefixes
            cleaned = cleaned.replace('Question approved: ', '');
            cleaned = cleaned.replace('amount credit in user wallet for question ', '');
            cleaned = cleaned.replace('amount credit in user wallet for ', '');
            cleaned = cleaned.replace('amount credit in user waller for question ', '');
            cleaned = cleaned.replace('amount credit in user waller for ', '');

            // If it's still generic or empty after cleaning
            if (cleaned.toLowerCase().includes('amount credit in user') || !cleaned || cleaned.length < 3) {
                return 'Verified Practice Question';
            }
            return cleaned;
        }

        return 'Verified Practice Question';
    };

    if (!isMounted) {
        return null;
    }

    return (
        <>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
                <div className="container mx-auto px-0 lg:px-6 xl:px-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                        {/* Header */}
                        <div>
                            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                <FaQuestionCircle className="text-primary-500" /> Question Rewards History
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                View your earnings from approved practice questions
                            </p>
                        </div>

                        {/* View Toggle & Action */}
                        {!loading && !error && (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => router.push('/pro/questions/new')}
                                    className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-primary-500 text-white px-5 py-2.5 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all w-fit shadow-md whitespace-nowrap"
                                >
                                    <FaPlusCircle /> Post New Question
                                </button>
                                {transactions.length > 0 && (
                                    <ViewToggle
                                        currentView={viewMode}
                                        onViewChange={setViewMode}
                                        views={['table', 'list', 'grid']}
                                    />
                                )}
                            </div>
                        )}
                    </div>

                    {/* Monthly Question Limit Info */}
                    <div className={`mb-6 bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border ${!questionCount.canAddMore
                        ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20'
                        : 'border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/10'
                        }`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${!questionCount.canAddMore ? 'bg-red-100 dark:bg-red-900' : 'bg-primary-100 dark:bg-primary-900'}`}>
                                    <FaQuestionCircle className={!questionCount.canAddMore ? 'text-primary-600' : 'text-secondary-600'} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                                        Monthly Question Limit
                                    </p>
                                    <p className={`text-sm mt-1 ${!questionCount.canAddMore ? 'text-primary-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                        {questionCount.currentCount} / {questionCount.limit} questions posted this month
                                        {questionCount.canAddMore && ` (${questionCount.remaining} remaining)`}
                                    </p>
                                </div>
                            </div>
                            {!questionCount.canAddMore && (
                                <span className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tight">
                                    Limit Reached
                                </span>
                            )}
                        </div>
                        {/* Progress Bar */}
                        <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full transition-all duration-500 ${!questionCount.canAddMore ? 'bg-red-500' : 'bg-primary-500'}`}
                                style={{ width: `${Math.min(100, (questionCount.currentCount / questionCount.limit) * 100)}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Summary Stats */}
                    {summary && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Question Earnings</div>
                                        <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                                            ₹{summary.totalRewards?.toLocaleString('en-IN') || 0}
                                        </div>
                                    </div>
                                    <div className="bg-green-100 dark:bg-green-900/30 rounded-2xl p-4">
                                        <FaRupeeSign className="text-2xl text-green-600 dark:text-green-400" />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Items Approved</div>
                                        <div className="text-3xl font-bold text-secondary-600 dark:text-secondary-400">
                                            {summary.totalTransactions || 0}
                                        </div>
                                    </div>
                                    <div className="bg-secondary-100 dark:bg-secondary-900/30 rounded-2xl p-4">
                                        <FaCheckCircle className="text-2xl text-secondary-600 dark:text-secondary-400" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Content */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-4">
                            <Loading size="lg" color="yellow" message="" />
                            <p className="text-gray-500">Fetching your reward records...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center shadow-sm border border-gray-200 dark:border-gray-700">
                            <div className="text-red-500 text-6xl mb-4">⚠️</div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                Error loading history
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
                            <button
                                onClick={() => fetchQuestionRewardsHistory(page, limit)}
                                className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2 rounded-xl font-bold hover:opacity-90 transition-opacity"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center shadow-sm border border-gray-200 dark:border-gray-700">
                            <div className="text-gray-400 dark:text-gray-500 text-7xl mb-6">
                                📋
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                No Question Rewards Yet
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                                Start posting high-quality practice questions for the community. You'll earn rewards once they are reviewed and approved by administrators!
                            </p>
                            <button
                                onClick={() => router.push('/pro/questions/new')}
                                className="bg-gradient-to-r from-red-500 to-primary-500 text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                            >
                                Post Your First Question
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Table View */}
                            {viewMode === 'table' && (
                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Question / Description
                                                    </th>
                                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Reward
                                                    </th>
                                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Balance After
                                                    </th>
                                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Approved On
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                                                {transactions.map((tx, index) => (
                                                    <tr key={tx._id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                                        <td className="px-6 py-5">
                                                            <div className="flex items-center gap-4">
                                                                <div className="flex-shrink-0 h-10 w-10 bg-primary-100 dark:bg-primary-900/40 rounded-xl flex items-center justify-center text-lg">
                                                                    ❓
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-md">
                                                                        {getDisplayQuestionText(tx)}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                                        ID: {tx._id.slice(-6).toUpperCase()}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5 whitespace-nowrap">
                                                            <div className="text-sm font-extrabold text-green-600 dark:text-green-400">
                                                                +₹{tx.amount?.toLocaleString('en-IN') || 0}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                ₹{tx.balance?.toLocaleString('en-IN') || 0}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5 whitespace-nowrap">
                                                            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                                                {formatDate(tx.createdAt)}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    {pagination.pages > 1 && (
                                        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700">
                                            <Pagination
                                                currentPage={pagination.page || 1}
                                                totalPages={pagination.pages || 1}
                                                onPageChange={handlePageChange}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* List View */}
                            {viewMode === 'list' && (
                                <div className="space-y-4">
                                    {transactions.map((tx, index) => (
                                        <div
                                            key={tx._id || index}
                                            className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all"
                                        >
                                            <div className="flex flex-col sm:flex-row gap-5">
                                                {/* Icon */}
                                                <div className="flex-shrink-0">
                                                    <div className="w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-2xl shadow-sm">
                                                        ❓
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                                            {getDisplayQuestionText(tx)}
                                                        </h3>
                                                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
                                                            <div className="flex items-center gap-1.5 font-bold text-green-600 dark:text-green-400">
                                                                <FaRupeeSign className="text-xs" />
                                                                <span>+₹{tx.amount?.toLocaleString('en-IN') || 0}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 font-medium">
                                                                <span className="text-gray-400">Balance:</span>
                                                                <span className="text-gray-900 dark:text-white">₹{tx.balance?.toLocaleString('en-IN') || 0}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <FaCalendarAlt className="text-gray-400 text-xs" />
                                                                <span>{formatDate(tx.createdAt)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Pagination */}
                                    {pagination.pages > 1 && (
                                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 mt-6 shadow-sm">
                                            <Pagination
                                                currentPage={pagination.page || 1}
                                                totalPages={pagination.pages || 1}
                                                onPageChange={handlePageChange}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Grid View */}
                            {viewMode === 'grid' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {transactions.map((tx, index) => (
                                        <div
                                            key={tx._id || index}
                                            className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl shadow-sm transition-all hover:-translate-y-1"
                                        >
                                            <div className="flex items-start gap-4 mb-5">
                                                <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-xl shadow-inner">
                                                    ❓
                                                </div>
                                                <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 mt-1">
                                                    {getDisplayQuestionText(tx)}
                                                </h3>
                                            </div>

                                            <div className="space-y-4 pt-4 border-t border-gray-50 dark:border-gray-700/50">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">Reward</span>
                                                    <span className="text-xl font-black text-green-600 dark:text-green-400">
                                                        +₹{tx.amount?.toLocaleString('en-IN') || 0}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">Wallet Balance</span>
                                                    <span className="text-sm font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-lg">
                                                        ₹{tx.balance?.toLocaleString('en-IN') || 0}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest pt-2">
                                                    <FaCalendarAlt />
                                                    <span>{formatDate(tx.createdAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Pagination */}
                                    {pagination.pages > 1 && (
                                        <div className="col-span-full bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 mt-6 text-center shadow-sm">
                                            <Pagination
                                                currentPage={pagination.page || 1}
                                                totalPages={pagination.pages || 1}
                                                onPageChange={handlePageChange}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
            <UnifiedFooter />
        </>
    );
}
