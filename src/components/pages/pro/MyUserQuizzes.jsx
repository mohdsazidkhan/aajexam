'use client';

import React, { useState, useEffect } from 'react';
import UnifiedFooter from '../../UnifiedFooter';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import API from '../../../lib/api';
import { getCurrentUser } from '../../../utils/authUtils';
import { toast } from 'react-toastify';
import Loading from '../../Loading';
import ViewToggle from '../../ViewToggle';
import { FaTrophy } from 'react-icons/fa';

const MyUserQuizzes = () => {
	const router = useRouter();
	const user = getCurrentUser();

	const [quizzes, setQuizzes] = useState([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
	const [stats, setStats] = useState(null);
	const [viewMode, setViewMode] = useState('grid'); // Default to grid

	useEffect(() => {
		// Set initial view mode based on screen size only on client
		if (typeof window !== 'undefined' && window.innerWidth < 768) {
			setViewMode('grid');
		}
	}, []);

	useEffect(() => {
		fetchQuizzes();
		fetchStats();
	}, [filter]);

	const fetchQuizzes = async () => {
		setLoading(true);
		try {
			const params = filter !== 'all' ? { status: filter } : {};
			const response = await API.getMyQuizzes(params);
			if (response?.success) {
				setQuizzes(response.data || []);
			}
		} catch (err) {
			console.error('Error fetching quizzes:', err);
			toast.error('Failed to load quizzes');
		} finally {
			setLoading(false);
		}
	};

	const fetchStats = async () => {
		try {
			const response = await API.getQuizCreationStats();
			if (response?.success) {
				setStats(response.data);
			}
		} catch (err) {
			console.error('Error fetching stats:', err);
		}
	};

	const handleDelete = async (id) => {
		if (!window.confirm('Are you sure you want to delete this quiz?')) return;

		try {
			await API.deleteUserQuiz(id);
			toast.success('Quiz deleted successfully');
			fetchQuizzes();
		} catch (err) {
			toast.error(err?.message || 'Failed to delete quiz');
		}
	};

	const getStatusColor = (status) => {
		switch (status) {
			case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
			case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
			default: return 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400';
		}
	};

	const renderGridView = () => (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-6">
			{quizzes.map(quiz => (
				<div key={quiz._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col h-full">
					<div className="p-6 flex-1">
						<div className="flex justify-between items-start mb-3">
							<h3 className="text-md lg:text-xl font-bold text-gray-800 dark:text-white line-clamp-2" title={quiz.title}>
								{quiz.title}
							</h3>
							<span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(quiz.status)} flex-shrink-0 ml-2`}>
								{quiz.status}
							</span>
						</div>

						<p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
							{quiz.description || 'No description'}
						</p>

						<div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
							<div className="flex justify-between">
								<span>Category:</span>
								<span className="font-medium text-gray-800 dark:text-white">
									{quiz.category?.name || 'N/A'}
								</span>
							</div>
							<div className="flex justify-between">
								<span>Difficulty:</span>
								<span className="font-medium text-gray-800 dark:text-white capitalize">
									{quiz.difficulty}
								</span>
							</div>
							<div className="flex justify-between">
								<span>Questions:</span>
								<span className="font-medium text-gray-800 dark:text-white">
									{quiz.questionCount || 0}
								</span>
							</div>
							<div className="flex justify-between">
								<span>Level:</span>
								<span className="font-medium text-gray-800 dark:text-white">
									{quiz.requiredLevel}
								</span>
							</div>
							{quiz.viewsCount !== undefined && (
								<div className="flex justify-between">
									<span>Views:</span>
									<span className="font-medium text-gray-800 dark:text-white">
										{quiz.viewsCount}
									</span>
								</div>
							)}
							{quiz.status === 'approved' && quiz.rewardAmount > 0 && (
								<div className="flex justify-between">
									<span className="text-green-600 dark:text-green-400 font-semibold">Reward Earned:</span>
									<span className="font-bold text-green-600 dark:text-green-400">
										₹{quiz.rewardAmount}
									</span>
								</div>
							)}
						</div>

						{quiz.adminNotes && (
							<div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
								<div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
									Admin Notes:
								</div>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									{quiz.adminNotes}
								</p>
							</div>
						)}
					</div>
					<div className="p-4 bg-gray-50 dark:bg-gray-700/50 mt-auto flex gap-2">
						{quiz.status === 'pending' && (
							<button
								onClick={() => handleDelete(quiz._id)}
								className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-semibold transition-colors"
							>
								Delete
							</button>
						)}
						<button
							onClick={() => router.push(`/pro/quiz/${quiz._id}`)}
							className="flex-1 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 text-sm font-semibold transition-colors"
						>
							View Details
						</button>
					</div>
				</div>
			))}
		</div>
	);

	const renderListView = () => (
		<div className="space-y-4">
			{quizzes.map(quiz => (
				<div key={quiz._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-col lg:flex-row gap-4">
					<div className="flex-1">
						<div className="flex items-start justify-between mb-2">
							<h3 className="text-lg font-bold text-gray-800 dark:text-white" title={quiz.title}>
								{quiz.title}
							</h3>
							<span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(quiz.status)}`}>
								{quiz.status}
							</span>
						</div>
						<p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">
							{quiz.description || 'No description'}
						</p>
						<div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
							<span className="flex items-center gap-1">
								<strong>Category:</strong> {quiz.category?.name || 'N/A'}
							</span>
							<span className="flex items-center gap-1">
								<strong>Difficulty:</strong> <span className="capitalize">{quiz.difficulty}</span>
							</span>
							<span className="flex items-center gap-1">
								<strong>Questions:</strong> {quiz.questionCount || 0}
							</span>
							<span className="flex items-center gap-1">
								<strong>Level:</strong> {quiz.requiredLevel}
							</span>
							{quiz.viewsCount !== undefined && (
								<span className="flex items-center gap-1">
									<strong>Views:</strong> {quiz.viewsCount}
								</span>
							)}
							{quiz.status === 'approved' && quiz.rewardAmount > 0 && (
								<span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold">
									<strong>Reward:</strong> ₹{quiz.rewardAmount}
								</span>
							)}
						</div>
						{quiz.adminNotes && (
							<div className="mt-3 p-2 bg-primary-50 dark:bg-primary-900/20 rounded text-sm">
								<span className="font-semibold text-gray-700 dark:text-gray-300">Admin Notes: </span>
								<span className="text-gray-600 dark:text-gray-400">{quiz.adminNotes}</span>
							</div>
						)}
					</div>
					<div className="flex lg:flex-col gap-2 min-w-[150px] justify-center">
						{quiz.status === 'pending' && (
							<button
								onClick={() => handleDelete(quiz._id)}
								className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-semibold transition-colors"
							>
								Delete
							</button>
						)}
						<button
							onClick={() => router.push(`/pro/quiz/${quiz._id}`)}
							className="flex-1 py-2 px-4 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 text-sm font-semibold transition-colors"
						>
							View Details
						</button>
					</div>
				</div>
			))}
		</div>
	);

	const renderTableView = () => (
		<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
			<div className="overflow-x-auto">
				<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
					<thead className="bg-gray-50 dark:bg-gray-700">
						<tr>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title / Description</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Details</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Stats</th>
							<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
						</tr>
					</thead>
					<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
						{quizzes.map(quiz => (
							<tr key={quiz._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
								<td className="px-6 py-4">
									<div className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1" title={quiz.title}>
										{quiz.title}
									</div>
									<div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1" title={quiz.description}>
										{quiz.description || 'No description'}
									</div>
									{quiz.adminNotes && (
										<div className="mt-1 text-xs text-primary-600 dark:text-primary-400">
											Note: {quiz.adminNotes}
										</div>
									)}
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(quiz.status)}`}>
										{quiz.status}
									</span>
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
									<div><span className="font-semibold">Cat:</span> {quiz.category?.name || 'N/A'}</div>
									<div><span className="font-semibold">Diff:</span> <span className="capitalize">{quiz.difficulty}</span></div>
									<div><span className="font-semibold">Lvl:</span> {quiz.requiredLevel}</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
									<div><span className="font-semibold">Q:</span> {quiz.questionCount || 0}</div>
									{quiz.viewsCount !== undefined && (
										<div><span className="font-semibold">Views:</span> {quiz.viewsCount}</div>
									)}
									{quiz.status === 'approved' && quiz.rewardAmount > 0 && (
										<div className="text-green-600 dark:text-green-400 font-bold">₹{quiz.rewardAmount}</div>
									)}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-right">
									<div className="flex flex-col gap-2 items-end">
										<button
											onClick={() => router.push(`/pro/quiz/${quiz._id}`)}
											className="text-secondary-600 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-secondary-300 font-medium"
										>
											View
										</button>
										{quiz.status === 'pending' && (
											<button
												onClick={() => handleDelete(quiz._id)}
												className="text-primary-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 font-medium"
											>
												Delete
											</button>
										)}
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);

	return (
		<>
			<div className="min-h-screen bg-gradient-to-br from-secondary-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-2">
				<div className="container mx-auto py-4 px-2 lg:px-10">
					{/* Header */}
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 lg:p-4 mb-1 lg:mb-6">
						<div className="flex flex-col lg:flex-row justify-between items-center mb-4 gap-4">
							<h1 className="text-xl lg:text-3xl font-bold text-gray-800 dark:text-white">
								My Quizzes
							</h1>
							<div className="flex items-center gap-3 w-full lg:w-auto">
								<Link
									href="/pro/user-quiz-rewards"
									className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 lg:px-6 py-2 lg:py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-white border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 font-semibold shadow-sm transition-colors"
								>
									<FaTrophy className="text-primary-500" /> Quiz Rewards
								</Link>
								<Link
									href="/pro/quiz/create"
									className="flex-1 lg:flex-none text-center px-4 lg:px-6 py-2 lg:py-3 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 font-semibold shadow-md transition-colors"
								>
									+ Create New Quiz
								</Link>
							</div>
						</div>

						{/* Statistics */}
						{stats && (
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
								<div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
									<div className="text-sm text-gray-600 dark:text-gray-400">Approved</div>
									<div className="text-2xl font-bold text-green-600 dark:text-green-400">
										{stats.totalApproved || 0}
									</div>
								</div>
								<div className="bg-secondary-50 dark:bg-secondary-900/20 p-4 rounded-lg">
									<div className="text-sm text-gray-600 dark:text-gray-400">This Month</div>
									<div className="text-2xl font-bold text-secondary-600 dark:text-secondary-400">
										{stats.monthlyCount || 0} / {stats.monthlyLimit || 99}
									</div>
								</div>
								{stats.nextMilestone && (
									<>
										<div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
											<div className="text-sm text-gray-600 dark:text-gray-400">Next Milestone</div>
											<div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
												{stats.nextMilestone.count}
											</div>
											<div className="text-xs text-gray-500 mt-1">
												{stats.nextMilestone.tier}
											</div>
										</div>
										<div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg">
											<div className="text-sm text-gray-600 dark:text-gray-400">Progress</div>
											<div className="text-md lg:text-2xl font-bold text-primary-600 dark:text-secondary-400">
												{stats.progressToNextMilestone}%
											</div>
										</div>
									</>
								)}
							</div>
						)}

						{/* Filters and View Toggle */}
						<div className="flex flex-col sm:flex-row justify-between items-center gap-4">
							<div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 hide-scrollbar">
								{['all', 'pending', 'approved', 'rejected'].map(f => (
									<button
										key={f}
										onClick={() => setFilter(f)}
										className={`px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg font-medium capitalize text-sm whitespace-nowrap transition-colors ${filter === f
											? 'bg-secondary-600 text-white'
											: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
											}`}
									>
										{f}
									</button>
								))}
							</div>

							<ViewToggle
								currentView={viewMode}
								onViewChange={setViewMode}
								views={['grid', 'list', 'table']}
							/>
						</div>
					</div>

					{/* Quiz List */}
					{loading ? (
						<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
							<Loading size="md" color="blue" message="Loading quizzes..." />
						</div>
					) : quizzes.length === 0 ? (
						<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
							<p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
								No quizzes found
							</p>
							<Link
								href="/pro/quiz/create"
								className="inline-block px-4 lg:px-6 py-2 lg:py-3 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 font-semibold"
							>
								Create Your First Quiz
							</Link>
						</div>
					) : (
						<>
							{viewMode === 'table' ? renderTableView() : viewMode === 'list' ? renderListView() : renderGridView()}
						</>
					)}
				</div>
			</div>
			<UnifiedFooter />
		</>
	);
};

export default MyUserQuizzes;
