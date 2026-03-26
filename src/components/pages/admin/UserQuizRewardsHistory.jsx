'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "../../Sidebar";
import { useSelector } from "react-redux";
import Pagination from "../../Pagination";
import SearchFilter from "../../SearchFilter";
import ViewToggle from "../../ViewToggle";
import API from '../../../lib/api';
import useDebounce from "../../../hooks/useDebounce";
import AdminMobileAppWrapper from "../../AdminMobileAppWrapper";
import Loading from "../../Loading";
import { useSSR } from '../../../hooks/useSSR';
import { isMobile } from 'react-device-detect';
import { FaQuestionCircle } from 'react-icons/fa';

const PAGE_LIMIT = 20;

export default function UserQuizRewardsHistory({ userId }) {
    const { isMounted, isRouterReady, router } = useSSR();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(PAGE_LIMIT);
    const [searchTerm, setSearchTerm] = useState("");
    const [pagination, setPagination] = useState({});
    const [summary, setSummary] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [viewMode, setViewMode] = useState(() => {
        try {
            if (typeof window !== 'undefined') {
                return (isMobile || window.innerWidth < 768) ? 'grid' : 'table';
            }
        } catch (e) { }
        return isMobile ? 'grid' : 'table';
    });

    const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("userInfo") || 'null') : null;
    const isAdminRoute = router?.pathname?.startsWith("/admin") || false;
    const isOpen = useSelector((state) => state.sidebar.isOpen);

    const debouncedSearch = useDebounce(searchTerm, 1000);

    useEffect(() => {
        if (userId && isMounted) {
            fetchUserQuizRewardsHistory(page, limit, debouncedSearch);
        }
    }, [userId, debouncedSearch, page, limit, isMounted]);

    const fetchUserQuizRewardsHistory = async (page = 1, limit = 20, search = "") => {
        try {
            setLoading(true);
            const params = {
                page,
                limit,
                userId: userId,
            };

            if (search) {
                params.search = search;
            }

            const response = await API.getAdminQuizRewardsHistory(params);

            if (response?.success) {
                setTransactions(response.data?.transactions || []);
                setPagination(response.data?.pagination || {});
                setSummary(response.data?.summary || null);

                // Extract user info from first transaction if available, or populate if backend sends separate user info
                if (response.data?.transactions?.length > 0 && response.data.transactions[0].user) {
                    setUserInfo(response.data.transactions[0].user);
                } else if (response.data?.user) {
                    setUserInfo(response.data.user);
                }
            } else {
                setError(response?.message || 'Failed to fetch quiz rewards history');
            }
        } catch (err) {
            setError(err.message || 'Failed to fetch quiz rewards history');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (value) => {
        setSearchTerm(value);
        setPage(1);
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Ensure Grid on small screens after mount and on orientation change
    useEffect(() => {
        try {
            const enforceGridOnSmall = () => {
                if (typeof window !== 'undefined' && window.innerWidth < 768) {
                    setViewMode('grid');
                }
            };
            enforceGridOnSmall();
            window.addEventListener('orientationchange', enforceGridOnSmall);
            return () => {
                window.removeEventListener('orientationchange', enforceGridOnSmall);
            };
        } catch (e) { }
    }, []);

    const renderTableView = () => (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Quiz / Description
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Balance After
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {transactions.map((tx) => (
                            <tr key={tx._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {formatDate(tx.createdAt)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {tx.user?.name || 'N/A'}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {tx.user?.email || 'N/A'}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <FaQuestionCircle className="text-secondary-500" />
                                        <span className="text-sm text-gray-900 dark:text-white">
                                            {tx.description || 'Quiz Reward'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                                    +₹{tx.amount}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    ₹{tx.balance?.toLocaleString() || 0}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderListView = () => (
        <div className="space-y-4">
            {transactions.map((tx) => (
                <div key={tx._id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="h-12 w-12 bg-secondary-100 dark:bg-secondary-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                            <FaQuestionCircle className="text-xl text-secondary-600 dark:text-secondary-400" />
                        </div>
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {tx.description || 'Quiz Reward'}
                                </h3>
                            </div>
                            <div className="mt-1 text-sm text-gray-600 dark:text-gray-300 flex flex-wrap gap-4">
                                <span>User: {tx.user?.name || 'N/A'} ({tx.user?.email || 'N/A'})</span>
                            </div>
                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Date: {formatDate(tx.createdAt)}
                            </div>
                            <div className="mt-2 flex items-center gap-4">
                                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                    Amount: +₹{tx.amount}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    Balance: ₹{tx.balance?.toLocaleString() || 0}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderGridView = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {transactions.map((tx) => (
                <div key={tx._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 bg-secondary-100 dark:bg-secondary-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                            <FaQuestionCircle className="text-secondary-600 dark:text-secondary-400" />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
                            {tx.description || 'Quiz Reward'}
                        </h3>
                    </div>
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        <div>User: {tx.user?.name || 'N/A'}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{tx.user?.email || 'N/A'}</div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Date: {formatDate(tx.createdAt)}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                            +₹{tx.amount}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            Balance: ₹{tx.balance?.toLocaleString() || 0}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <AdminMobileAppWrapper title="User Quiz Rewards History">
            <div className={`adminPanel ${isOpen ? "showPanel" : "hidePanel"}`}>
                {user?.role === "admin" && isAdminRoute && <Sidebar />}
                <div className="adminContent p-4 w-full text-gray-900 dark:text-white">
                    <div className="mx-auto">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Link
                                        href="/admin/quiz-rewards-history"
                                        className="text-secondary-600 dark:text-secondary-400 hover:text-secondary-800 dark:hover:text-secondary-300 text-sm"
                                    >
                                        ← Back to All Rewards
                                    </Link>
                                </div>
                                <h2 className="text-md lg:text-2xl font-bold text-gray-900 dark:text-white">
                                    Quiz Rewards History
                                </h2>
                                {userInfo && (
                                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                                        {userInfo.name} ({userInfo.email})
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 items-center">
                                <ViewToggle currentView={viewMode} onViewChange={setViewMode} views={['table', 'list', 'grid']} />
                                <SearchFilter
                                    searchTerm={searchTerm}
                                    onSearchChange={handleSearch}
                                    placeholder="Search by quiz title..."
                                />
                            </div>
                        </div>

                        {/* Summary Cards */}
                        {summary && (
                            <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Rewards</div>
                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        ₹{summary.totalRewards?.toLocaleString() || 0}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                        Total paid out
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Transactions</div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {summary.totalTransactions || 0}
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
                                    No quiz reward transactions found
                                </h3>
                            </div>
                        ) : (
                            viewMode === 'table' ? renderTableView() :
                                viewMode === 'list' ? renderListView() :
                                    renderGridView()
                        )}

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <Pagination
                                currentPage={pagination.currentPage}
                                totalPages={pagination.totalPages}
                                onPageChange={handlePageChange}
                                totalItems={pagination.totalItems}
                                itemsPerPage={limit}
                            />
                        )}
                    </div>
                </div>
            </div>
        </AdminMobileAppWrapper>
    );
}
