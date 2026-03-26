'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Pagination from "../../Pagination";
import API from '../../../lib/api';
import UnifiedFooter from "../../UnifiedFooter";
import Loading from "../../Loading";
import ViewToggle from "../../ViewToggle";
import { useSSR } from '../../../hooks/useSSR';
import { FaTrophy, FaRupeeSign, FaCalendarAlt, FaCheckCircle, FaExclamationCircle, FaPlusCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { isMobile } from 'react-device-detect';

const PAGE_LIMIT = 20;

export default function UserQuizRewards() {
    const { isMounted, isRouterReady, router } = useSSR();

    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(PAGE_LIMIT);
    const [pagination, setPagination] = useState({});
    const [summary, setSummary] = useState(null);
    const [quizCount, setQuizCount] = useState({
        currentCount: 0,
        limit: 30,
        remaining: 30,
        canAddMore: true
    });
    const [viewMode, setViewMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return (isMobile || window.innerWidth < 768) ? 'grid' : 'table';
        }
        return isMobile ? 'list' : 'table';
    });

    const fetchCurrentMonthQuizCount = async () => {
        try {
            // Assuming API has a similar endpoint for quiz stats or reuse existing
            // For now, using default/mock if specific endpoint isn't ready, or try getQuizCreationStats
            const response = await API.getQuizCreationStats();
            if (response.success && response.data) {
                const { monthlyCount, monthlyLimit } = response.data;
                setQuizCount({
                    currentCount: monthlyCount,
                    limit: monthlyLimit,
                    remaining: Math.max(0, monthlyLimit - monthlyCount),
                    canAddMore: monthlyCount < monthlyLimit
                });
            }
        } catch (error) {
            console.error('Error fetching current month quiz count:', error);
        }
    };

    useEffect(() => {
        if (isMounted) {
            fetchQuizRewardsHistory(page, limit);
            fetchCurrentMonthQuizCount();
        }
    }, [isMounted, page, limit]);

    const fetchQuizRewardsHistory = async (page = 1, limit = 20) => {
        try {
            setLoading(true);
            setError(null);
            const params = {
                page,
                limit,
            };

            const response = await API.getQuizRewardsHistory(params);

            if (response?.success) {
                setTransactions(response.data?.transactions || []);
                setPagination(response.data?.pagination || {});
                setSummary(response.data?.summary || null);
            } else {
                const errorMsg = response?.message || response?.error || 'Failed to fetch quiz rewards history';
                setError(errorMsg);
                toast.error(errorMsg);
            }
        } catch (err) {
            console.error('Error fetching quiz rewards history:', err);
            const errorMessage = err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                'Failed to fetch quiz rewards history.';
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

    if (!isMounted) {
        return null;
    }

    return (
        <>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
                <div className="container mx-auto px-0 lg:px-6 xl:px-8">
                    <div className="flex items-center justify-between mb-2">
                        {/* Header */}
                        <div className="mb-2">
                            <h2 className="text-xl lg:text-2xl xl:text-xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                🏆 Quiz Rewards History
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                View your historical earnings from approved quizzes
                            </p>

                        </div>

                        {/* View Toggle */}
                        {!loading && !error && transactions.length > 0 && (
                            <div className="mb-4 flex items-center gap-4 justify-end">
                                <button
                                    onClick={() => router.push('/pro/quiz/create')}
                                    className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-yellow-500 text-white px-5 py-2.5 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all w-fit shadow-md"
                                >
                                    <FaPlusCircle /> Create New Quiz
                                </button>
                                <ViewToggle
                                    currentView={viewMode}
                                    onViewChange={setViewMode}
                                    views={['table', 'list', 'grid']}
                                />
                            </div>
                        )}
                    </div>

                    {/* Monthly Quiz Limit Info */}
                    <div className={`mb-4 lg:mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border ${!quizCount.canAddMore
                        ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20'
                        : 'border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20'
                        }`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-sm font-medium ${!quizCount.canAddMore
                                    ? 'text-red-800 dark:text-red-300'
                                    : 'text-red-800 dark:text-red-300'
                                    }`}>
                                    Monthly Quiz Limit
                                </p>
                                <p className={`text-xs mt-1 ${!quizCount.canAddMore
                                    ? 'text-red-600 dark:text-red-400'
                                    : 'text-red-700 dark:text-red-400'
                                    }`}>
                                    {quizCount.currentCount} / {quizCount.limit} quizzes this month
                                    {quizCount.canAddMore && ` (${quizCount.remaining} remaining)`}
                                </p>
                            </div>
                            {!quizCount.canAddMore && (
                                <span className="text-red-600 dark:text-red-400 font-semibold text-sm">
                                    Limit Reached
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Summary Stats */}
                    {summary && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Quiz Earnings</div>
                                        <div className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">
                                            ₹{summary.totalRewards?.toLocaleString('en-IN') || 0}
                                        </div>
                                    </div>
                                    <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-4">
                                        <FaRupeeSign className="text-2xl text-green-600 dark:text-green-400" />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Quizzes Rewarded</div>
                                        <div className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">
                                            {summary.totalTransactions || 0}
                                        </div>
                                    </div>
                                    <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-4">
                                        <FaTrophy className="text-2xl text-blue-600 dark:text-blue-400" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Content */}
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loading size="lg" color="blue" message="" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <div className="text-red-500 text-6xl mb-4">⚠️</div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                Error loading quiz rewards history
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">{error}</p>
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">
                                🏆
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                No quiz rewards found
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Keep contributing quality quizzes to help the community learn!
                            </p>
                            <button
                                onClick={() => router.push('/pro/quiz/create')}
                                className="bg-gradient-to-r from-yellow-500 from-red-500 text-white px-6 py-2 rounded-lg hover:from-yellow-600 hover:from-red-600 transition-all"
                            >
                                Create Your First Quiz
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Table View */}
                            {viewMode === 'table' && (
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className="bg-gradient-to-r from-yellow-500 from-red-500">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                                        Quiz
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                                        Description
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                                        Amount
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                                        Balance After
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                                        Date
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                {transactions.map((tx, index) => (
                                                    <tr key={tx._id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                        <td className="px-4 py-4 whitespace-nowrap">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex-shrink-0 h-12 w-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center text-xl">
                                                                    🧩
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                                        {tx.metadata?.quizTitle || tx.description || 'Verified Quiz'}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                            Approved
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-bold text-green-600 dark:text-green-400">
                                                                +₹{tx.amount?.toLocaleString('en-IN') || 0}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900 dark:text-white">
                                                                ₹{tx.balance?.toLocaleString('en-IN') || 0}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-500 dark:text-gray-400">
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
                                        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-t border-gray-200 dark:border-gray-600">
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
                                <div className="space-y-3">
                                    {transactions.map((tx, index) => (
                                        <div
                                            key={tx._id || index}
                                            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex flex-col sm:flex-row gap-4">
                                                {/* Icon */}
                                                <div className="flex-shrink-0">
                                                    <div className="w-full sm:w-16 h-16 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-3xl">
                                                        🧩
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                                    <div className="flex-1">
                                                        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                                                            {tx.metadata?.quizTitle || tx.description || 'Verified Quiz'}
                                                        </h3>
                                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                                            <div className="flex items-center gap-1">
                                                                <FaRupeeSign className="text-green-600 dark:text-green-400" />
                                                                <span className="font-bold text-green-600 dark:text-green-400">
                                                                    +₹{tx.amount?.toLocaleString('en-IN') || 0}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <span>Balance:</span>
                                                                <span className="font-medium">₹{tx.balance?.toLocaleString('en-IN') || 0}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <FaCalendarAlt className="text-gray-400" />
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
                                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow px-4 py-3 border border-gray-200 dark:border-gray-700 mt-4">
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
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {transactions.map((tx, index) => (
                                        <div
                                            key={tx._id || index}
                                            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all hover:scale-105"
                                        >
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-xl">
                                                    🧩
                                                </div>
                                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
                                                    {tx.metadata?.quizTitle || tx.description || 'Verified Quiz'}
                                                </h3>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-600 dark:text-gray-400">Reward</span>
                                                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                                        +₹{tx.amount?.toLocaleString('en-IN') || 0}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-600 dark:text-gray-400">Balance After</span>
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                        ₹{tx.balance?.toLocaleString('en-IN') || 0}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                                                    <FaCalendarAlt />
                                                    <span>{formatDate(tx.createdAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Pagination */}
                                    {pagination.pages > 1 && (
                                        <div className="col-span-full bg-white dark:bg-gray-800 rounded-lg shadow px-4 py-3 border border-gray-200 dark:border-gray-700 mt-4">
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
