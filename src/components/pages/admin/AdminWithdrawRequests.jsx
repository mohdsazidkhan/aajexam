'use client';

import React, { useEffect, useState, useCallback } from 'react';
import API from '../../../lib/api';
import { toast } from 'react-toastify';
import Sidebar from '../../Sidebar';
import { useSelector } from 'react-redux';
import AdminMobileAppWrapper from '../../AdminMobileAppWrapper';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '../../../utils/authUtils';
import ResponsiveTable from '../../ResponsiveTable';
import Pagination from '../../Pagination';
import SearchFilter from '../../SearchFilter';
import { useSSR } from '../../../hooks/useSSR';
import ViewToggle from '../../ViewToggle';
import Loading from '../../Loading';
import Button from '../../ui/Button';

const AdminWithdrawRequests = () => {
	const { isMounted, isRouterReady, router } = useSSR();
	const [items, setItems] = useState([]);
	const [allItems, setAllItems] = useState([]); // Store all requests for client-side filtering
	const [status, setStatus] = useState('all');
	const [page, setPage] = useState(1);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);
	const [updating, setUpdating] = useState(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [itemsPerPage, setItemsPerPage] = useState(20);
	const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
	const [viewMode, setViewMode] = useState(() => {
		if (typeof window !== "undefined") {
			return window.innerWidth < 768 ? "list" : "table";
		}
		return "table";
	});

	// // always in admin route in this page
	const isOpen = useSelector((state) => state.sidebar.isOpen);
	const isAdminRoute = router?.pathname?.startsWith('/admin') || false;
	const user = getCurrentUser();

	// Load all requests initially (without status or search filter)
	useEffect(() => {
		const loadAll = async () => {
			setLoading(true);
			try {
				const params = {
					page: 1,
					limit: 1000 // Fetch a large number to get all requests
				};
				const res = await API.getAdminWithdrawRequests(params);
				if (res?.success) {
					const allData = res.data || [];
					setAllItems(allData);
				}
			} catch (err) {
				toast.error(err?.message || 'Failed to load withdraw requests');
			} finally {
				setLoading(false);
			}
		};

		loadAll();
	}, []); // Only run once on mount

	// Filter and paginate when status, page, or itemsPerPage changes (client-side)
	useEffect(() => {
		if (allItems.length === 0) return;

		let filteredData = allItems;

		// Filter by status
		if (status !== 'all') {
			filteredData = allItems.filter(item => item.status === status);
		}

		// Apply search filter if exists
		if (searchTerm) {
			const searchLower = searchTerm.toLowerCase();
			filteredData = filteredData.filter(item =>
				item.user?.name?.toLowerCase().includes(searchLower) ||
				item.user?.email?.toLowerCase().includes(searchLower) ||
				item.upiId?.toLowerCase().includes(searchLower) ||
				item.accountNumber?.toLowerCase().includes(searchLower)
			);
		}

		// Apply pagination
		const startIndex = (page - 1) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		const paginatedData = filteredData.slice(startIndex, endIndex);

		const dataWithIndex = paginatedData.map((item, index) => ({
			...item,
			_sno: startIndex + index + 1
		}));

		setItems(dataWithIndex);
		setTotal(filteredData.length);
		setPagination({
			page,
			limit: itemsPerPage,
			total: filteredData.length,
			totalPages: Math.ceil(filteredData.length / itemsPerPage)
		});
	}, [status, page, itemsPerPage, allItems, searchTerm]);

	// Handle window resize to update view mode
	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth < 768 && viewMode === "table") {
				setViewMode("list");
			} else if (window.innerWidth >= 768 && viewMode === "list") {
				setViewMode("table");
			}
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, [viewMode]);

	const updateStatus = async (id, newStatus) => {
		setUpdating(id);
		try {
			await API.updateWithdrawRequestStatus(id, newStatus);
			toast.success(`Withdraw request ${newStatus} successfully!`);

			// Update the item in allItems
			setAllItems(prevItems =>
				prevItems.map(item =>
					item._id === id ? { ...item, status: newStatus } : item
				)
			);
		} catch (err) {
			toast.error(err?.message || 'Update failed');
		} finally {
			setUpdating(null);
		}
	};

	const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));

	const getStatusColor = (status) => {
		switch (status) {
			case 'pending': return 'bg-primary-100 text-primary-800 border-primary-200 dark:bg-primary-900 dark:text-primary-200';
			case 'approved': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200';
			case 'rejected': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200';
			case 'paid': return 'bg-secondary-100 text-secondary-800 border-secondary-200 dark:bg-secondary-900 dark:text-secondary-200';
			default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-200';
		}
	};

	const getStatusIcon = (status) => {
		switch (status) {
			case 'pending': return '⏳';
			case 'approved': return '✅';
			case 'rejected': return '❌';
			case 'paid': return '💳';
			default: return '❓';
		}
	};

	const handleItemsPerPageChange = (e) => {
		setItemsPerPage(parseInt(e.target.value));
		setPage(1);
	};

	const handleSearch = (search) => {
		setSearchTerm(search);
		setPage(1);
	};

	const formatCurrency = (amount) => {
		return new Intl.NumberFormat('en-IN', {
			style: 'currency',
			currency: 'INR',
			minimumFractionDigits: 0,
			maximumFractionDigits: 2
		}).format(amount);
	};

	const formatDate = (dateString) => {
		const date = new Date(dateString);
		const day = date.getDate().toString().padStart(2, '0');
		const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
		const month = monthNames[date.getMonth()];
		const year = date.getFullYear();
		return `${day}-${month}-${year}`;
	};

	const formatTime = (date) => {
		return new Date(date).toLocaleTimeString('en-US', {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true
		});
	};

	// Define table columns for ResponsiveTable
	const columns = [
		{
			key: 'sno',
			header: 'S.No.',
			render: (value, req) => {
				return (
					<div className="text-sm text-gray-600 dark:text-gray-300">
						{req._sno || 'N/A'}
					</div>
				);
			}
		},
		{
			key: 'request',
			header: 'Request Details',
			render: (_, req) => (
				<div className="space-y-2">
					<div className="text-sm font-medium text-gray-900 dark:text-white">
						Request ID: {req._id?.slice(-8) || 'N/A'}
					</div>
					<div className="flex items-center gap-2">
						<span className={`px-2 py-0.5 rounded text-xs font-medium ${req.requestType === 'referral'
							? 'bg-purple-100 text-primary-800 border border-purple-200 dark:bg-purple-900 dark:text-primary-200 dark:border-purple-800'
							: 'bg-secondary-100 text-secondary-800 border border-secondary-200 dark:bg-secondary-900 dark:text-secondary-200 dark:border-secondary-800'
							}`}>
							{req.requestType === 'referral' ? '🎁 Referral' : '👤 Pro User'}
						</span>
					</div>
					{req.processedAt && (
						<div className="text-xs text-gray-500 dark:text-gray-400">
							Processed: {formatDate(req.processedAt)} at {formatTime(req.processedAt)}
						</div>
					)}
				</div>
			)
		},
		{
			key: 'createdAt',
			header: 'Created At',
			render: (_, req) => (
				<div className="text-sm">
					<div className="font-medium text-gray-900 dark:text-white">
						{formatDate(req.requestedAt)}
					</div>
					<div className="text-xs text-gray-500 dark:text-gray-400">
						{formatTime(req.requestedAt)}
					</div>
				</div>
			)
		},
		{
			key: 'user',
			header: 'User Info',
			render: (_, req) => (
				<div className="text-sm space-y-1">
					<div className="font-medium text-gray-900 dark:text-white">
						{req.userId?.name || 'N/A'}
					</div>
					<div className="text-gray-600 dark:text-gray-400 text-xs">
						📧 {req.userId?.email || 'N/A'}
					</div>
					<div className="text-gray-600 dark:text-gray-400 text-xs">
						📱 {req.userId?.phone || 'N/A'}
					</div>
				</div>
			)
		},
		{
			key: 'amount',
			header: 'Amount',
			render: (_, req) => (
				<div className="space-y-1">
					<div className="text-lg font-bold text-green-600 dark:text-green-400">
						{formatCurrency(req.amount)}
					</div>
					{req.upi && (
						<div className="text-xs text-primary-600 dark:text-primary-400">
							<div className="font-semibold">UPI ID</div>
							<div className="font-mono">{req.upi}</div>
						</div>
					)}
				</div>
			)
		},
		{
			key: 'bankDetails',
			header: 'Bank Details',
			render: (_, req) => (
				<div className="text-xs">
					{req.bankDetail ? (
						<div className="space-y-1 text-gray-700 dark:text-gray-300">
							<div><strong>A/C Holder:</strong> {req.bankDetail.accountHolderName}</div>
							<div><strong>Bank:</strong> {req.bankDetail.bankName}</div>
							<div><strong>A/C No:</strong> <span className="font-mono">{req.bankDetail.accountNumber}</span></div>
							<div><strong>IFSC:</strong> <span className="font-mono">{req.bankDetail.ifscCode}</span></div>
							{req.bankDetail.branchName && <div><strong>Branch:</strong> {req.bankDetail.branchName}</div>}
						</div>
					) : (
						<div className="text-gray-500 dark:text-gray-400 italic">No bank details</div>
					)}
				</div>
			)
		},
		{
			key: 'status',
			header: 'Status & Actions',
			render: (_, req) => (
				<div className="space-y-2">
					<div className={`px-3 py-1 rounded-lg text-sm font-medium border ${getStatusColor(req.status)}`}>
						{getStatusIcon(req.status)} {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
					</div>
					{req.status === 'pending' && (
						<div className="flex space-x-1">
							<Button
								onClick={() => updateStatus(req._id, 'approved')}
								disabled={updating === req._id}
								variant="admin"
								size="small"
								loading={updating === req._id}
								className="text-xs"
							>
								{updating === req._id ? "Processing..." : "Approve"}
							</Button>
							<Button
								onClick={() => updateStatus(req._id, 'rejected')}
								disabled={updating === req._id}
								variant="admin"
								size="small"
								loading={updating === req._id}
								className="text-xs"
							>
								{updating === req._id ? "Processing..." : "Reject"}
							</Button>
						</div>
					)}
					{req.status === 'approved' && (
						<Button
							onClick={() => updateStatus(req._id, 'paid')}
							disabled={updating === req._id}
							variant="admin"
							size="small"
							loading={updating === req._id}
							className="text-xs"
						>
							{updating === req._id ? "Processing..." : "Mark as Paid"}
						</Button>
					)}
				</div>
			)
		}
	];

	// default view handled by custom mobile/desktop render below

	const content = (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			<div className="mx-auto p-2 lg:p-4">
				{/* Header */}
				<div className="mb-4">
					<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
						<div>
							<h1 className="text-xl lg:text-xl lg:text-3xl font-bold text-gray-900 dark:text-white flex items-center">

								Withdraw Requests ({total})
							</h1>
							<p className="mt-2 text-gray-600 dark:text-gray-400">
								Manage user withdrawal requests
							</p>
						</div>
						<SearchFilter
							onSearch={handleSearch}
							placeholder="Search requests..."
							className="w-full sm:w-60"
						/>
						<div className="flex items-center space-x-2">
							<label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
								Status:
							</label>
							<select
								value={status}
								onChange={(e) => { setPage(1); setStatus(e.target.value); }}
								className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
							>
								<option value="all">All Requests</option>
								<option value="pending">⏳ Pending</option>
								<option value="approved">✅ Approved</option>
								<option value="rejected">❌ Rejected</option>
								<option value="paid">💳 Paid</option>
							</select>
						</div>
						<div className="flex items-center space-x-2 flex-shrink-0 gap-2">
							<ViewToggle currentView={viewMode} onViewChange={setViewMode} />
							<label className="text-xs sm:text-lg text-gray-600 dark:text-gray-400 whitespace-nowrap">Show:</label>
							<select
								value={itemsPerPage}
								onChange={handleItemsPerPageChange}
								className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs sm:text-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-w-0"
							>
								<option value={5}>5</option>
								<option value={10}>10</option>
								<option value={20}>20</option>
								<option value={50}>50</option>
								<option value={100}>100</option>
								<option value={250}>250</option>
								<option value={500}>500</option>
								<option value={1000}>1000</option>
							</select>
						</div>
					</div>
				</div>

				{/* Content */}
				{loading ? (
					<div className="flex items-center justify-center h-64">
						<Loading size="md" color="gray" message="" />
					</div>
				) : items.length === 0 ? (
					<div className="text-center py-12">
						<div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">💰</div>
						<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
							No withdraw requests found
						</h3>
						<p className="text-gray-600 dark:text-gray-400">
							{status === 'all' ? 'No withdraw requests found.' : status === 'pending' ? 'No pending withdraw requests to review.' : `No ${status} withdraw requests found.`}
						</p>
					</div>
				) : (
					<>
						{/* Table view */}
						{viewMode === "table" && (
							<div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
								<ResponsiveTable
									data={items}
									columns={columns}
									viewModes={['table']}
									defaultView={'table'}
									showPagination={false}
									showViewToggle={false}
								/>
							</div>
						)}

						{/* List view */}
						{viewMode === "list" && (
							<div className="space-y-3">
								{items.map((req) => (
									<div key={req._id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
										<div className="flex items-center justify-between mb-3">
											<div className="text-lg font-bold text-green-600 dark:text-green-400">₹{req.amount}</div>
											<div className="flex items-center gap-2">
												<span className={`px-2 py-0.5 rounded text-xs font-medium ${req.requestType === 'referral'
													? 'bg-purple-100 text-primary-800 border border-purple-200 dark:bg-purple-900 dark:text-primary-200 dark:border-purple-800'
													: 'bg-secondary-100 text-secondary-800 border border-secondary-200 dark:bg-secondary-900 dark:text-secondary-200 dark:border-secondary-800'
													}`}>
													{req.requestType === 'referral' ? '🎁 Referral' : '👤 Pro User'}
												</span>
												<div className={`px-2 py-0.5 rounded text-xs border ${getStatusColor(req.status)}`}>{getStatusIcon(req.status)} {req.status}</div>
											</div>
										</div>

										<div className="space-y-2 mb-3">
											<div className="text-sm">
												<div className="font-semibold text-gray-900 dark:text-white">{req.userId?.name || 'N/A'}</div>
												<div className="text-xs text-gray-600 dark:text-gray-400">📧 {req.userId?.email || 'N/A'}</div>
												<div className="text-xs text-gray-600 dark:text-gray-400">📱 {req.userId?.phone || 'N/A'}</div>
											</div>
											<div className="text-xs text-gray-500 dark:text-gray-400">
												Requested: {formatDate(req.requestedAt)} at {formatTime(req.requestedAt)}
											</div>
										</div>

										{req.bankDetail && (
											<div className="mb-3 text-xs bg-secondary-50 dark:bg-secondary-900/30 p-2 rounded border border-secondary-200 dark:border-secondary-800">
												<div className="font-semibold text-secondary-700 dark:text-secondary-300 mb-1">Bank Details</div>
												<div className="text-secondary-600 dark:text-secondary-400 space-y-1">
													<div>{req.bankDetail.accountHolderName}</div>
													<div>{req.bankDetail.bankName}</div>
													<div className="font-mono">{req.bankDetail.accountNumber}</div>
													<div className="font-mono">{req.bankDetail.ifscCode}</div>
												</div>
											</div>
										)}

										{req.upi && (
											<div className="mb-3 text-xs bg-purple-50 dark:bg-purple-900/30 p-2 rounded border border-purple-200 dark:border-purple-800">
												<div className="font-semibold text-primary-700 dark:text-primary-300 mb-1">UPI ID</div>
												<div className="text-primary-600 dark:text-primary-400 font-mono">{req.upi}</div>
											</div>
										)}

										{req.status === 'pending' && (
											<div className="mt-2 flex gap-2">
												<button onClick={() => updateStatus(req._id, 'approved')} className="flex-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs">✅ Approve</button>
												<button onClick={() => updateStatus(req._id, 'rejected')} className="flex-1 px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">❌ Reject</button>
											</div>
										)}
										{req.status === 'approved' && (
											<button onClick={() => updateStatus(req._id, 'paid')} className="w-full px-2 py-1 bg-secondary-600 hover:bg-secondary-700 text-white rounded text-xs">💳 Mark as Paid</button>
										)}
									</div>
								))}
							</div>
						)}

						{/* Grid view */}
						{viewMode === "grid" && (
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
								{items.map((req) => (
									<div key={req._id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg transition-shadow">
										<div className="flex items-center justify-between mb-3">
											<div className="text-lg font-bold text-green-600 dark:text-green-400">{formatCurrency(req.amount)}</div>
											<div className="flex items-center gap-2">
												<span className={`px-2 py-0.5 rounded text-xs font-medium ${req.requestType === 'referral'
													? 'bg-purple-100 text-primary-800 border border-purple-200 dark:bg-purple-900 dark:text-primary-200 dark:border-purple-800'
													: 'bg-secondary-100 text-secondary-800 border border-secondary-200 dark:bg-secondary-900 dark:text-secondary-200 dark:border-secondary-800'
													}`}>
													{req.requestType === 'referral' ? '🎁 Referral' : '👤 Pro User'}
												</span>
												<div className={`px-2 py-0.5 rounded text-xs border ${getStatusColor(req.status)}`}>{getStatusIcon(req.status)} {req.status}</div>
											</div>
										</div>

										<div className="space-y-2 mb-3">
											<div className="text-sm">
												<div className="font-semibold text-gray-900 dark:text-white">{req.userId?.name || 'N/A'}</div>
												<div className="text-xs text-gray-600 dark:text-gray-400">📧 {req.userId?.email || 'N/A'}</div>
												<div className="text-xs text-gray-600 dark:text-gray-400">📱 {req.userId?.phone || 'N/A'}</div>
											</div>
											<div className="text-xs text-gray-500 dark:text-gray-400">
												Requested: {formatDate(req.requestedAt)} at {formatTime(req.requestedAt)}
											</div>
										</div>

										{req.bankDetail && (
											<div className="mb-3 text-xs bg-secondary-50 dark:bg-secondary-900/30 p-2 rounded border border-secondary-200 dark:border-secondary-800">
												<div className="font-semibold text-secondary-700 dark:text-secondary-300 mb-1">Bank Details</div>
												<div className="text-secondary-600 dark:text-secondary-400 space-y-1">
													<div>{req.bankDetail.accountHolderName}</div>
													<div>{req.bankDetail.bankName}</div>
													<div className="font-mono">{req.bankDetail.accountNumber}</div>
													<div className="font-mono">{req.bankDetail.ifscCode}</div>
												</div>
											</div>
										)}

										{req.upi && (
											<div className="mb-3 text-xs bg-purple-50 dark:bg-purple-900/30 p-2 rounded border border-purple-200 dark:border-purple-800">
												<div className="font-semibold text-primary-700 dark:text-primary-300 mb-1">UPI ID</div>
												<div className="text-primary-600 dark:text-primary-400 font-mono">{req.upi}</div>
											</div>
										)}

										{req.status === 'pending' && (
											<div className="mt-2 flex gap-2">
												<button onClick={() => updateStatus(req._id, 'approved')} className="flex-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs">✅ Approve</button>
												<button onClick={() => updateStatus(req._id, 'rejected')} className="flex-1 px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">❌ Reject</button>
											</div>
										)}
										{req.status === 'approved' && (
											<button onClick={() => updateStatus(req._id, 'paid')} className="w-full px-2 py-1 bg-secondary-600 hover:bg-secondary-700 text-white rounded text-xs">💳 Mark as Paid</button>
										)}
									</div>
								))}
							</div>
						)}

						{/* Pagination */}
						{pagination.totalPages > 1 && (
							<div className="mt-6">
								<Pagination
									currentPage={pagination.page || page}
									totalPages={pagination.totalPages || totalPages}
									onPageChange={setPage}
									totalItems={pagination.total || total}
									itemsPerPage={pagination.limit || itemsPerPage}
								/>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);

	return (
		<AdminMobileAppWrapper title="Withdraw Requests">
			<div className={`adminPanel ${isOpen ? 'showPanel' : 'hidePanel'}`}>
				{user?.role === 'admin' && isAdminRoute && <Sidebar />}
				<div className="adminContent w-full text-gray-900 dark:text-white">
					{content}
				</div>
			</div>
		</AdminMobileAppWrapper>
	);
};

export default AdminWithdrawRequests;




