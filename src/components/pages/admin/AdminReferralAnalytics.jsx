'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import Sidebar from '../../Sidebar';
import API from '../../../lib/api';
import { toast } from 'react-toastify';
import { FaUsers, FaCalendarAlt, FaSearch, FaDownload, FaUserFriends, FaTh, FaList, FaTable, FaUser } from 'react-icons/fa';
import AdminMobileAppWrapper from '../../AdminMobileAppWrapper';
import Loading from '../../Loading';
import { isMobile } from 'react-device-detect';
import Button from '../../ui/Button';

const AdminReferralAnalytics = () => {
    const [analytics, setAnalytics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState(isMobile ? 'grid' : 'table'); // 'grid', 'list', 'table'

    // Get current year and month
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');

    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    });

    const [summary, setSummary] = useState({
        totalUsers: 0,
        usersWithReferrals: 0,
        totalReferralsSum: 0,
        monthlyReferralsSum: 0
    });

    const isOpen = useSelector((state) => state.sidebar.isOpen);

    // Generate last 5 years + current year (total 6 years)
    const availableYears = [];
    for (let i = 0; i < 6; i++) {
        availableYears.push(currentYear - i);
    }

    // All 12 months
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const fetchAnalytics = useCallback(async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams({
                page: pagination.page,
                limit: pagination.limit,
                ...(searchTerm && { search: searchTerm }),
                ...(selectedYear !== 'all' && { year: selectedYear }),
                ...(selectedMonth !== 'all' && { month: selectedMonth })
            });

            const response = await API.request(`/api/admin/referral-analytics?${params.toString()}`);

            setAnalytics(response.analytics || []);
            setSummary(response.summary || {
                totalUsers: 0,
                usersWithReferrals: 0,
                totalReferralsSum: 0,
                monthlyReferralsSum: 0
            });
            setPagination(prev => ({
                ...prev,
                total: response.pagination.total,
                totalPages: response.pagination.totalPages
            }));
        } catch (error) {
            console.error('Error fetching referral analytics:', error);
            toast.error('Failed to fetch referral analytics');
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit, searchTerm, selectedYear, selectedMonth]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchAnalytics();
        }, 300); // Debounce search

        return () => clearTimeout(timer);
    }, [fetchAnalytics]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 on search
    };

    const handleYearChange = (e) => {
        const value = e.target.value;
        setSelectedYear(value === 'all' ? 'all' : parseInt(value));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleMonthChange = (e) => {
        setSelectedMonth(e.target.value);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    const exportToCSV = () => {
        const monthName = selectedMonth === 'all' ? 'All Months' : months[parseInt(selectedMonth) - 1];
        const yearText = selectedYear === 'all' ? 'All Years' : selectedYear;
        const headers = ['S.No.', 'Name', 'Email', 'Referral Code', 'Total Referrals', `Monthly Referrals (${monthName} ${yearText})`];
        const csvData = analytics.map((user, index) => [
            index + 1 + (pagination.page - 1) * pagination.limit,
            user.name,
            user.email,
            user.referralCode,
            user.totalReferrals,
            user.monthlyReferrals
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `referral-analytics-${yearText}-${monthName}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('CSV exported successfully!');
    };

    // Use summary from backend (filtered totals)
    const totalReferralsSum = summary.totalReferralsSum;
    const monthlyReferralsSum = summary.monthlyReferralsSum;
    const usersWithReferrals = summary.usersWithReferrals;

    return (
        <AdminMobileAppWrapper title="Referral Analytics">
            <div className={`adminPanel ${isOpen ? 'showPanel' : 'hidePanel'}`}>
                <Sidebar />
                <div className="adminContent p-4 w-full text-gray-900 dark:text-white">
                    <div className="mx-auto">
                        {/* Header */}
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
                            <div>
                                <h1 className="text-md lg:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                                    <FaUserFriends className="text-blue-600" />
                                    Referral Analytics
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Track total and monthly referral counts for users with referrals
                                </p>
                            </div>

                            {/* View Toggle Buttons */}
                            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${viewMode === 'grid'
                                        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                                        }`}
                                >
                                    <FaTh className="text-lg" />
                                    <span>Grid</span>
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${viewMode === 'list'
                                        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                                        }`}
                                >
                                    <FaList className="text-lg" />
                                    <span>List</span>
                                </button>
                                <button
                                    onClick={() => setViewMode('table')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${viewMode === 'table'
                                        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                                        }`}
                                >
                                    <FaTable className="text-lg" />
                                    <span>Table</span>
                                </button>
                            </div>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-6 mb-4 lg:mb-8">
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-100 text-sm font-medium mb-1">Total Users</p>
                                        <p className="text-3xl font-bold">{pagination.total}</p>
                                    </div>
                                    <FaUsers className="text-4xl text-blue-200" />
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-100 text-sm font-medium mb-1">Users with Referrals</p>
                                        <p className="text-3xl font-bold">{usersWithReferrals}</p>
                                    </div>
                                    <FaUserFriends className="text-4xl text-green-200" />
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-purple-500 from-red-600 rounded-xl shadow-lg p-6 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-yellow-100 text-sm font-medium mb-1">Total Referrals (All Time)</p>
                                        <p className="text-3xl font-bold">{totalReferralsSum}</p>
                                    </div>
                                    <FaUserFriends className="text-4xl text-yellow-200" />
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-orange-100 text-sm font-medium mb-1">
                                            Monthly Referrals ({selectedMonth === 'all' ? 'All' : months[parseInt(selectedMonth) - 1]})
                                        </p>
                                        <p className="text-3xl font-bold">{monthlyReferralsSum}</p>
                                    </div>
                                    <FaCalendarAlt className="text-4xl text-orange-200" />
                                </div>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {/* Search */}
                                <div className="relative">
                                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name or email..."
                                        value={searchTerm}
                                        onChange={handleSearch}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>

                                {/* Year Selector */}
                                <div className="relative">
                                    <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <select
                                        value={selectedYear}
                                        onChange={handleYearChange}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white appearance-none"
                                    >
                                        <option value="all">All Years</option>
                                        {availableYears.map(year => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Month Selector */}
                                <div className="relative">
                                    <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <select
                                        value={selectedMonth}
                                        onChange={handleMonthChange}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white appearance-none"
                                    >
                                        <option value="all">All Months</option>
                                        {months.map((month, index) => (
                                            <option key={index + 1} value={(index + 1).toString().padStart(2, '0')}>
                                                {month}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Export Button */}
                                <Button
                                    variant="admin"
                                    onClick={exportToCSV}
                                    disabled={analytics.length === 0}
                                    className="flex items-center justify-center gap-2"
                                >
                                    <FaDownload />
                                    Export CSV
                                </Button>
                            </div>
                        </div>

                        {/* Content */}
                        {loading ? (
                            <Loading />
                        ) : analytics.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">👥</div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    No users with referrals found
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Try adjusting your filters or search criteria
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Grid View */}
                                {viewMode === 'grid' && (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-6">
                                        {analytics.map((user, index) => (
                                            <div key={user._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow">
                                                <div className="bg-gradient-to-r from-blue-500 from-red-600 p-4 text-white">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                                                            <FaUser className="text-2xl" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="font-bold text-lg truncate">{user.name}</h3>
                                                            <p className="text-sm opacity-90 truncate">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-4 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">Referral Code</span>
                                                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                            {user.referralCode}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Referrals</span>
                                                        <span className="text-xl font-bold text-orange-700 dark:text-yellow-400">
                                                            {user.totalReferrals}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Referrals</span>
                                                        <span className="text-xl font-bold text-orange-700 dark:text-orange-400">
                                                            {user.monthlyReferrals}
                                                        </span>
                                                    </div>

                                                    <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            Joined: {new Date(user.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* List View */}
                                {viewMode === 'list' && (
                                    <div className="space-y-4">
                                        {analytics.map((user, index) => (
                                            <div key={user._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow">
                                                <div className="p-4 lg:p-6">
                                                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                                                        <div className="flex items-center gap-4 flex-1">
                                                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 from-red-600 flex items-center justify-center text-white font-bold text-xl">
                                                                {user.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="flex-1">
                                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{user.name}</h3>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                                        {user.referralCode}
                                                                    </span>
                                                                    <span className="text-xs text-gray-400 dark:text-gray-500">
                                                                        Joined: {new Date(user.createdAt).toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-6">
                                                            <div className="text-center">
                                                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Referrals</div>
                                                                <div className="text-2xl font-bold text-orange-700 dark:text-yellow-400">{user.totalReferrals}</div>
                                                            </div>
                                                            <div className="text-center">
                                                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Monthly</div>
                                                                <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">{user.monthlyReferrals}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Table View */}
                                {viewMode === 'table' && (
                                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                <thead className="bg-gray-50 dark:bg-gray-900">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                            S.No.
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                            User
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                            Referral Code
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                            Total Referrals
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                            Monthly Referrals
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                            Joined Date
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                    {analytics.map((user, index) => (
                                                        <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                                {index + 1 + (pagination.page - 1) * pagination.limit}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                    {user.name}
                                                                </div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {user.email}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                                    {user.referralCode}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm font-bold text-orange-700 dark:text-yellow-400">
                                                                    {user.totalReferrals}
                                                                </div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                    all time
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm font-bold text-orange-700 dark:text-orange-400">
                                                                    {user.monthlyReferrals}
                                                                </div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {selectedMonth === 'all' ? 'All Months' : months[parseInt(selectedMonth) - 1]} {selectedYear === 'all' ? '' : selectedYear}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                                {new Date(user.createdAt).toLocaleDateString()}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Pagination */}
                                {pagination.totalPages > 1 && (
                                    <div className="mt-6 bg-gray-50 dark:bg-gray-900 px-6 py-4 flex items-center justify-between border border-gray-200 dark:border-gray-700 rounded-lg">
                                        <div className="text-sm text-gray-700 dark:text-gray-300">
                                            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handlePageChange(pagination.page - 1)}
                                                disabled={pagination.page === 1}
                                                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                Previous
                                            </button>
                                            <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                                                {pagination.page} / {pagination.totalPages}
                                            </span>
                                            <button
                                                onClick={() => handlePageChange(pagination.page + 1)}
                                                disabled={pagination.page === pagination.totalPages}
                                                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </AdminMobileAppWrapper>
    );
};

export default AdminReferralAnalytics;
