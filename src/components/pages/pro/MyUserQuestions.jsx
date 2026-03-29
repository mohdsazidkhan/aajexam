'use client';

import React, { useEffect, useState } from 'react';
import UnifiedFooter from '../../UnifiedFooter';
import API from '../../../lib/api';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '../../../utils/authUtils';
import Loading from '../../Loading';

const MyUserQuestions = () => {
	const router = useRouter();
	const user = getCurrentUser();
	const [items, setItems] = useState([]);
	const [status, setStatus] = useState('');
	const [page, setPage] = useState(1);
	const [limit] = useState(20);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);
	const [stats, setStats] = useState({
		total: 0,
		pending: 0,
		approved: 0,
		rejected: 0
	});

	const load = async () => {
		setLoading(true);
		try {
			const res = await API.getMyUserQuestions({ status, page, limit });
			if (res?.success) {
				setItems(res.data || []);
				setTotal(res.pagination?.total || 0);
			}
		} catch (err) {
			console.error('Error loading questions:', err);
		} finally {
			setLoading(false);
		}
	};

	const loadStats = async () => {
		try {
			const [allRes, pendingRes, approvedRes, rejectedRes] = await Promise.all([
				API.getMyUserQuestions({ page: 1, limit: 1 }),
				API.getMyUserQuestions({ status: 'pending', page: 1, limit: 1 }),
				API.getMyUserQuestions({ status: 'approved', page: 1, limit: 1 }),
				API.getMyUserQuestions({ status: 'rejected', page: 1, limit: 1 })
			]);

			setStats({
				total: allRes?.pagination?.total || 0,
				pending: pendingRes?.pagination?.total || 0,
				approved: approvedRes?.pagination?.total || 0,
				rejected: rejectedRes?.pagination?.total || 0
			});
		} catch (err) {
			console.error('Error loading stats:', err);
		}
	};

	useEffect(() => {
		load();
		loadStats();
	}, [status, page]);

	const totalPages = Math.max(1, Math.ceil(total / limit));

	const getStatusColor = (status) => {
		switch (status) {
			case 'pending': return 'bg-primary-50 text-primary-700 border-primary-200 dark:bg-primary-900/20 dark:text-primary-200 dark:border-primary-800';
			case 'approved': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-200 dark:border-green-800';
			case 'rejected': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-200 dark:border-red-800';
			default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-200 dark:border-gray-800';
		}
	};

	const getStatusIcon = (status) => {
		switch (status) {
			case 'pending': return '🟡';
			case 'approved': return '✅';
			case 'rejected': return '❌';
			default: return '📝';
		}
	};

	const getStatusText = (status) => {
		switch (status) {
			case 'pending': return 'Under Review';
			case 'approved': return 'Approved';
			case 'rejected': return 'Rejected';
			default: return 'Unknown';
		}
	};

	return (
		<>
			<div className="min-h-screen bg-aajexam-light dark:bg-aajexam-dark py-4 lg:py-8 px-4">
				<div className="container mx-auto py-4 px-0 lg:px-10">
					{/* Header Section */}
					<div className="text-center mb-8">
						<div className="inline-flex items-center justify-center w-12 lg:w-16 h-12 lg:h-16 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full mb-4">
							<span className="text-md lg:text-2xl">📚</span>
						</div>
						<h1 className="text-xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
							My Questions
						</h1>
						<p className="text-sm lg:text-lg text-gray-600 dark:text-gray-300 mb-2">
							Track your submitted questions and their performance
						</p>
						<p className="text-secondary-600 dark:text-secondary-400 text-sm font-medium mb-4">
							📅 You Can Add Max 100 Questions Per Month
						</p>
						<Link
							href="/pro/questions/new"
							className="inline-flex items-center px-3 lg:px-6 py-2 lg:py-3 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
						>
							<span className="mr-2">🚀</span>
							Create New Question
						</Link>
					</div>

					{/* Stats Cards */}
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-6 mb-4 lg:mb-8">
						<div className="bg-white dark:bg-gray-800 rounded-xl p-2 lg:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Questions</p>
									<p className="text-xl lg:text-xl lg:text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
								</div>
								<div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
									<span className="text-md lg:text-2xl">📝</span>
								</div>
							</div>
						</div>

						<div className="bg-white dark:bg-gray-800 rounded-xl p-2 lg:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-gray-600 dark:text-gray-400">Under Review</p>
									<p className="text-xl lg:text-3xl font-bold text-primary-600 dark:text-primary-400">{stats.pending}</p>
								</div>
								<div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
									<span className="text-md lg:text-2xl">🟡</span>
								</div>
							</div>
						</div>

						<div className="bg-white dark:bg-gray-800 rounded-xl p-2 lg:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved</p>
									<p className="text-xl lg:text-3xl font-bold text-primary-600 dark:text-primary-400">{stats.approved}</p>
								</div>
								<div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
									<span className="text-md lg:text-2xl">✅</span>
								</div>
							</div>
						</div>

						<div className="bg-white dark:bg-gray-800 rounded-xl p-2 lg:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejected</p>
									<p className="text-xl lg:text-3xl font-bold text-primary-600 dark:text-red-400">{stats.rejected}</p>
								</div>
								<div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
									<span className="text-md lg:text-2xl">❌</span>
								</div>
							</div>
						</div>
					</div>

					{/* Filter Section */}
					<div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-2 lg:p-6 mb-4 lg:mb-8">
						<div className="flex flex-wrap items-center justify-between gap-4">
							<div className="flex items-center space-x-4">
								<label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Status:</label>
								<select
									value={status}
									onChange={e => { setPage(1); setStatus(e.target.value); }}
									className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
								>
									<option value="">📝 All Questions</option>
									<option value="pending">🟡 Under Review</option>
									<option value="approved">✅ Approved</option>
									<option value="rejected">❌ Rejected</option>
								</select>
							</div>
							<div className="text-sm text-gray-600 dark:text-gray-400">
								Showing {items.length} of {total} questions
							</div>
						</div>
					</div>

					{/* Questions List */}
					<div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
						{loading ? (
							<div className="p-8 text-center">
								<Loading size="sm" color="gray" message="Loading your questions..." />
							</div>
						) : items.length === 0 ? (
							<div className="p-8 text-center">
								<div className="text-6xl mb-4">🤔</div>
								<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No questions found</h3>
								<p className="text-gray-600 dark:text-gray-400 mb-4">
									{status === '' ? "You haven't created any questions yet." : `No ${status} questions found.`}
								</p>
								<Link
									href="/pro/questions/new"
									className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-medium rounded-lg transition-colors"
								>
									<span className="mr-2">🚀</span>
									Create Your First Question
								</Link>
							</div>
						) : (
							<div className="divide-y divide-gray-200 dark:divide-gray-700">
								{items.map((q, index) => (
									<div key={q._id} className="p-2 lg:p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
										<div className="flex items-start justify-between mb-2 lg:mb-4">
											<div className="flex-1">
												<div className="flex items-center space-x-3 mb-2">
													<span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(q.status)}`}>
														<span className="mr-1">{getStatusIcon(q.status)}</span>
														{getStatusText(q.status)}
													</span>
													<span className="text-sm text-gray-500 dark:text-gray-400">
														{new Date(q.createdAt).toLocaleDateString()}
													</span>
												</div>
												<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2">
													{q.questionText}
												</h3>
											</div>
										</div>

										{/* Question Options Preview */}
										<div className="mb-4">
											<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
												{(q.options || []).map((option, idx) => (
													<div key={idx} className={`flex items-center space-x-2 p-2 rounded-lg text-sm ${idx === q.correctOptionIndex
														? 'bg-green-50 dark:bg-green-900/50 text-green-800 dark:text-green-200'
														: 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
														}`}>
														<span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${idx === q.correctOptionIndex
															? 'bg-green-500 text-white'
															: 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
															}`}>
															{String.fromCharCode(65 + idx)}
														</span>
														<span className="truncate">{option}</span>
														{idx === q.correctOptionIndex && (
															<span className="text-green-600 dark:text-green-400">✓</span>
														)}
													</div>
												))}
											</div>
										</div>

										{/* Statistics */}
										<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-y-2 md:gap-y-0">
											<div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
												<div className="flex items-center space-x-1">
													<span>👁️</span>
													<span>{q.viewsCount || 0} views</span>
												</div>
												<div className="flex items-center space-x-1">
													<span>❤️</span>
													<span>{q.likesCount || 0} likes</span>
												</div>
												<div className="flex items-center space-x-1">
													<span>📤</span>
													<span>{q.sharesCount || 0} shares</span>
												</div>
												<div className="flex items-center space-x-1">
													<span>💬</span>
													<span>{(q.answers || []).length} answers</span>
												</div>
											</div>
											<div className="text-xs text-gray-500 dark:text-gray-400">
												Submitted {new Date(q.createdAt).toLocaleString()}
											</div>
										</div>

									</div>
								))}
							</div>
						)}
					</div>

					{/* Pagination */}
					{totalPages > 1 && (
						<div className="flex flex-col lg:flex-row items-center justify-between mt-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
							<div className="text-sm text-gray-600 dark:text-gray-400">
								Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} questions
							</div>
							<div className="mt-2 lg:mt-0 flex items-center space-x-2">
								<button
									disabled={page <= 1}
									onClick={() => setPage(p => p - 1)}
									className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
								>
									Previous
								</button>
								<div className="flex items-center space-x-1">
									{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
										const pageNum = i + 1;
										return (
											<button
												key={pageNum}
												onClick={() => setPage(pageNum)}
												className={`px-3 py-2 text-sm font-medium rounded-md ${page === pageNum
													? 'bg-primary-600 text-white'
													: 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700'
													}`}
											>
												{pageNum}
											</button>
										);
									})}
								</div>
								<button
									disabled={page >= totalPages}
									onClick={() => setPage(p => p + 1)}
									className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
								>
									Next
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
			<UnifiedFooter />
		</>
	);
};

export default MyUserQuestions;







