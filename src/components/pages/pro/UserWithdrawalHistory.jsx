'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Pagination from "../../Pagination";
import API from '../../../lib/api';
import UnifiedFooter from "../../UnifiedFooter";
import Loading from "../../Loading";
import { useSSR } from '../../../hooks/useSSR';
import { FaHistory, FaRupeeSign, FaCalendarAlt, FaCheckCircle, FaExclamationCircle, FaHourglassHalf, FaWallet } from 'react-icons/fa';
import { toast } from 'react-toastify';

const PAGE_LIMIT = 20;

export default function UserWithdrawalHistory() {
    const { isMounted, isRouterReady, router } = useSSR();

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(PAGE_LIMIT);
    const [pagination, setPagination] = useState({});
    const [summary, setSummary] = useState({ totalRequested: 0, totalPaid: 0, count: 0 });

    const fetchHistory = async (pageNumber = 1) => {
        setLoading(true);
        try {
            const res = await API.getWithdrawalHistory({ page: pageNumber, limit });
            if (res.success) {
                setRequests(res.data);
                setPagination(res.pagination);
                setSummary(res.summary);
            } else {
                setError(res.message || "Failed to fetch withdrawal history");
            }
        } catch (err) {
            console.error("Error fetching withdrawal history:", err);
            setError(err.message || "Something went wrong while fetching history");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isMounted) {
            fetchHistory(page);
        }
    }, [isMounted, page]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'paid':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        <FaCheckCircle className="mr-1" /> Paid
                    </span>
                );
            case 'pending':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                        <FaHourglassHalf className="mr-1" /> Pending
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                        <FaExclamationCircle className="mr-1" /> Rejected
                    </span>
                );
            case 'approved':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        <FaCheckCircle className="mr-1" /> Approved
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        {status}
                    </span>
                );
        }
    };

    if (!isMounted) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                            <FaHistory size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Withdrawal History</h1>
                            <p className="text-gray-600 dark:text-gray-400">Track and manage your withdrawal requests</p>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push('/pro/wallet')}
                        className="mt-4 md:mt-0 flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                    >
                        <FaWallet />
                        <span>Back to Wallet</span>
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 text-center">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize">Total Requested</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(summary.totalRequested)}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize">Total Paid</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{formatCurrency(summary.totalPaid)}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize">Total Requests</p>
                        <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{summary.count}</p>
                    </div>
                </div>

                {/* Content Area */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    {loading ? (
                        <div className="py-20 flex justify-center">
                            <Loading size="lg" />
                        </div>
                    ) : error ? (
                        <div className="py-12 px-6 text-center">
                            <FaExclamationCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error Loading History</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
                            <button
                                onClick={() => fetchHistory(page)}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="py-20 px-6 text-center">
                            <FaWallet className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Withdrawal History</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">You haven't made any withdrawal requests yet. Your earnings will appear here once you request a payout.</p>
                            <button
                                onClick={() => router.push('/pro/wallet')}
                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                            >
                                Go to Wallet
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date & Time</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Method</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reference ID</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {requests.map((request) => (
                                        <tr key={request._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-sm text-gray-900 dark:text-gray-200">
                                                    <FaCalendarAlt className="mr-2 text-gray-400" />
                                                    {formatDate(request.requestedAt)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-gray-900 dark:text-white">
                                                    {formatCurrency(request.amount)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    {request.upi || 'Bank Details'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(request.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400 font-mono">
                                                {request._id.substring(0, 8)}...
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {/* Pagination */}
                            {pagination.pages > 1 && (
                                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/30">
                                    <Pagination
                                        currentPage={page}
                                        totalPages={pagination.pages}
                                        onPageChange={setPage}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <UnifiedFooter />
        </div>
    );
}
