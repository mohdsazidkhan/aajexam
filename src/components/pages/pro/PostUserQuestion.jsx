'use client';
import React, { useState, useEffect, useRef } from 'react';
import UnifiedFooter from '../../UnifiedFooter';
import { useRouter } from 'next/navigation';
import API from '../../../lib/api';
import { getCurrentUser } from '../../../lib/utils/authUtils';
import { toast } from 'react-hot-toast';
import Loading from '../../Loading';

const PostUserQuestion = () => {
	const router = useRouter();
	const user = getCurrentUser();
	const [questionText, setQuestionText] = useState('');
	const [options, setOptions] = useState(['', '', '', '']);
	const [correctOptionIndex, setCorrectOptionIndex] = useState(0);
	const [loading, setLoading] = useState(false);
	const [focusedField, setFocusedField] = useState(null);
	const [monthlyCount, setMonthlyCount] = useState(null);
	const [dailyCount, setDailyCount] = useState(null);
	const hasFetchedCounts = useRef(false);

	// Redirect only if user is not authenticated
	useEffect(() => {
		if (!user) {
			router.push('/login');
			return;
		}
	}, [user, router]);

	// Show loading if user is not loaded yet
	if (!user) {
		return <Loading fullScreen={true} size="lg" color="blue" message="Loading..." />;
	}

	// Fetch monthly and daily counts on component mount (only once)
	useEffect(() => {
		const fetchCounts = async () => {
			if (user && user._id && !hasFetchedCounts.current) {
				hasFetchedCounts.current = true;

				try {
					console.log('Fetching counts for user:', user._id);
					console.log('User token:', localStorage.getItem('token') ? 'Present' : 'Missing');

					// Fetch monthly count
					const monthlyResponse = await API.getCurrentMonthQuestionCount(user._id);
					console.log('Monthly response:', monthlyResponse);

					if (monthlyResponse && monthlyResponse.success !== false) {
						setMonthlyCount(monthlyResponse.data || monthlyResponse);
					} else {
						console.log('Monthly response not successful, using defaults');
						setMonthlyCount({ currentCount: 0, limit: 100, remaining: 100, canAddMore: true });
					}

					// Fetch daily count
					const dailyResponse = await API.getCurrentDayQuestionCount(user._id);
					console.log('Daily response:', dailyResponse);

					if (dailyResponse && dailyResponse.success !== false) {
						setDailyCount(dailyResponse.data || dailyResponse);
					} else {
						console.log('Daily response not successful, using defaults');
						setDailyCount({ currentCount: 0, limit: 5, remaining: 5, canAddMore: true });
					}

				} catch (err) {
					console.error('Error fetching counts:', err);
					console.error('Error details:', err.response);

					// Set default values as fallback
					setMonthlyCount({ currentCount: 0, limit: 100, remaining: 100, canAddMore: true });
					setDailyCount({ currentCount: 0, limit: 5, remaining: 5, canAddMore: true });
				}
			}
		};

		fetchCounts();
	}, []); // Empty dependency array - only run once

	const handleOptionChange = (idx, val) => {
		const next = [...options];
		next[idx] = val;
		setOptions(next);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!questionText.trim() || options.some(o => !o.trim())) {
			toast.error('Please fill question and all 4 options');
			return;
		}

		// Check daily limit before submitting
		if (dailyCount && !dailyCount.canAddMore) {
			toast.error('You can add max 5 questions per day');
			return;
		}

		// Check monthly limit before submitting
		if (monthlyCount && !monthlyCount.canAddMore) {
			toast.error('You can add max 100 questions in a month');
			return;
		}

		setLoading(true);
		try {
			await API.createUserQuestion({ questionText, options, correctOptionIndex });
			toast.success('Question submitted for review');
			router.push('/pro/questions/mine');
		} catch (err) {
			if (err?.response?.status === 429) {
				const errorData = err?.response?.data;
				if (errorData?.error === 'DAILY_LIMIT_EXCEEDED') {
					toast.error('You can add max 5 questions per day');
				} else if (errorData?.error === 'MONTHLY_LIMIT_EXCEEDED') {
					toast.error('You can add max 100 questions in a month');
				} else {
					toast.error(errorData?.message || 'Daily/Monthly limit exceeded');
				}
			} else {
				toast.error(err?.message || 'Failed to submit question');
			}
		} finally {
			setLoading(false);
		}
	};

	const isFormValid = questionText.trim() && options.every(o => o.trim()) &&
		monthlyCount?.canAddMore !== false && dailyCount?.canAddMore !== false;

	// Calculate form completion percentage
	const formProgress = () => {
		let completed = 0;
		if (questionText.trim()) completed += 25;
		if (options[0].trim()) completed += 18.75;
		if (options[1].trim()) completed += 18.75;
		if (options[2].trim()) completed += 18.75;
		if (options[3].trim()) completed += 18.75;
		return completed;
	};

	return (
		<>
			<div className="min-h-screen bg-subg-light dark:bg-subg-dark py-4 lg:py-8 px-4">
				<div className="container mx-auto py-0 lg:py-4 px-0 lg:px-10">
					{/* Header Section */}
					<div className="text-center mb-6 md:mb-8">
						<div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-yellow-600 to-red-600 rounded-full mb-3 md:mb-4">
							<span className="text-sm md:text-lg lg:text-xl xl:text-2xl">💭</span>
						</div>
						<h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
							Post Your Question
						</h1>
						<p className="text-sm md:text-lg text-gray-600 dark:text-gray-300 mb-3 md:mb-4 px-4">
							Share your knowledge with the community
						</p>
						<div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-3 md:mb-4">

							<div className="inline-flex items-center px-3 py-1 md:px-4 md:py-2 bg-gradient-to-r from-blue-100 from-red-100 dark:from-blue-800 dark:from-red-800 rounded-full">
								<span className="text-xs md:text-sm text-blue-700 dark:text-blue-200 font-medium">📅 Max 5 Questions Per Day</span>
							</div>
							<div className="inline-flex items-center px-3 py-1 md:px-4 md:py-2 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-800 dark:to-blue-800 rounded-full">
								<span className="text-xs md:text-sm text-green-700 dark:text-green-200 font-medium">📊 Max 100 Questions Per Month</span>
							</div>
						</div>
					</div>

					{/* Daily Count Display */}
					{dailyCount && (
						<div className="mb-4 md:mb-6 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 md:p-6">
							<div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
								<div className="flex-shrink-0">
									<span className="text-sm md:text-lg lg:text-xl xl:text-2xl">📅</span>
								</div>
								<div className="flex-1">
									<h3 className="text-base md:text-lg font-medium text-orange-800 dark:text-orange-200">
										Daily Question Count
									</h3>
									<p className="text-sm md:text-base text-orange-700 dark:text-orange-300 mt-1">
										You have created <span className="font-bold">{dailyCount.currentCount}</span> out of <span className="font-bold">{dailyCount.limit}</span> questions today
									</p>
									<div className="mt-2 w-full bg-orange-200 dark:bg-orange-800 rounded-full h-2">
										<div
											className="bg-orange-600 dark:bg-orange-400 h-2 rounded-full transition-all duration-300"
											style={{ width: `${(dailyCount.currentCount / dailyCount.limit) * 100}%` }}
										></div>
									</div>
									<p className="text-xs md:text-sm text-orange-700 dark:text-orange-400 mt-1">
										{dailyCount.remaining} questions remaining today
									</p>
								</div>
							</div>
						</div>
					)}

					{/* Monthly Count Display */}
					{monthlyCount && (
						<div className="mb-6 md:mb-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 md:p-6">
							<div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
								<div className="flex-shrink-0">
									<span className="text-sm md:text-lg lg:text-xl xl:text-2xl">📊</span>
								</div>
								<div className="flex-1">
									<h3 className="text-base md:text-lg font-medium text-blue-800 dark:text-blue-200">
										Monthly Question Count
									</h3>
									<p className="text-sm md:text-base text-blue-600 dark:text-blue-300 mt-1">
										You have created <span className="font-bold">{monthlyCount.currentCount}</span> out of <span className="font-bold">{monthlyCount.limit}</span> questions this month
									</p>
									<div className="mt-2 w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
										<div
											className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
											style={{ width: `${(monthlyCount.currentCount / monthlyCount.limit) * 100}%` }}
										></div>
									</div>
									<p className="text-xs md:text-sm text-blue-600 dark:text-blue-400 mt-1">
										{monthlyCount.remaining} questions remaining this month
									</p>
								</div>
							</div>
						</div>
					)}

					{/* Pro Status Alert removed - all users can post */}

					{/* Main Form */}
					<div className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
						{/* Form Header */}
						<div className="bg-gradient-to-r from-yellow-600 to-red-600 px-4 md:px-8 py-4 md:py-6">
							<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
								<div>
									<h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl font-bold text-white mb-1 md:mb-2">Question Details</h2>
									<p className="text-yellow-100 text-sm md:text-base">Fill in your question and options below</p>
								</div>
								<div className="text-left sm:text-right">
									<div className="text-white font-semibold mb-1 text-sm md:text-base">{Math.round(formProgress())}% Complete</div>
									<div className="w-full sm:w-24 h-2 bg-white/30 rounded-full overflow-hidden">
										<div
											className="h-full bg-white rounded-full transition-all duration-500 ease-out"
											style={{ width: `${formProgress()}%` }}
										></div>
									</div>
								</div>
							</div>
						</div>

						<form onSubmit={handleSubmit} className="p-4 md:p-8 space-y-6 md:space-y-8">
							{/* Question Text */}
							<div className="space-y-2">
								<label className="block text-base md:text-lg font-semibold text-gray-900 dark:text-white">
									📝 Your Question
								</label>
								<div className="relative">
									<textarea
										className={`w-full border-2 rounded-lg md:rounded-xl p-3 md:p-4 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 transition-all duration-200 resize-none text-sm md:text-base ${focusedField === 'question'
											? 'border-red-500 ring-2 md:ring-4 ring-red-200 dark:ring-red-800'
											: 'border-gray-300 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-600'
											}`}
										rows={3}
										placeholder="Enter your question here... (e.g., What is the capital of France?)"
										value={questionText}
										onChange={e => setQuestionText(e.target.value)}
										onFocus={() => setFocusedField('question')}
										onBlur={() => setFocusedField(null)}
									/>
									<div className={`absolute bottom-2 md:bottom-3 right-2 md:right-3 text-xs md:text-sm ${questionText.length > 450 ? 'text-red-500' :
										questionText.length > 400 ? 'text-yellow-500' :
											'text-gray-400 dark:text-gray-500'
										}`}>
										{questionText.length}/500
									</div>
								</div>
							</div>

							{/* Options */}
							<div className="space-y-3 md:space-y-4">
								<label className="block text-base md:text-lg font-semibold text-gray-900 dark:text-white">
									🎯 Answer Options
								</label>
								<div className="space-y-3 md:space-y-4">
									{[0, 1, 2, 3].map(i => (
										<div key={i} className="relative">
											<div className={`flex items-center space-x-2 md:space-x-4 p-3 md:p-4 rounded-lg md:rounded-xl border-2 transition-all duration-200 ${correctOptionIndex === i
												? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
												: focusedField === `option-${i}`
													? 'border-red-500 bg-red-50 dark:bg-red-900/20'
													: 'border-gray-300 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-600'
												}`}>
												{/* Custom Radio Button */}
												<div className="flex-shrink-0">
													<div
														onClick={() => setCorrectOptionIndex(i)}
														className={`relative w-6 h-6 rounded-full border-2 cursor-pointer transition-all duration-200 ${correctOptionIndex === i
															? 'border-yellow-500 bg-yellow-500'
															: 'border-gray-300 dark:border-gray-600 hover:border-yellow-400'
															}`}
													>
														{correctOptionIndex === i && (
															<div className="absolute inset-0 flex items-center justify-center">
																<div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
															</div>
														)}
														{correctOptionIndex === i && (
															<div className="absolute -inset-1 rounded-full border-2 border-yellow-400 animate-ping opacity-30"></div>
														)}
													</div>
												</div>

												{/* Option Letter */}
												<div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-xs md:text-sm transition-all duration-200 ${correctOptionIndex === i
													? 'bg-yellow-600 text-white shadow-lg transform scale-110'
													: 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
													}`}>
													<span className={`transition-all duration-200 ${correctOptionIndex === i ? 'animate-pulse' : ''
														}`}>
														{String.fromCharCode(65 + i)}
													</span>
												</div>

												{/* Input Field */}
												<div className="flex-1">
													<input
														className="w-full border-none bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none text-sm md:text-lg"
														placeholder={`Option ${i + 1}...`}
														value={options[i]}
														onChange={e => handleOptionChange(i, e.target.value)}
														onFocus={() => setFocusedField(`option-${i}`)}
														onBlur={() => setFocusedField(null)}

													/>
												</div>

												{/* Correct Answer Indicator */}
												{correctOptionIndex === i && (
													<div className="flex-shrink-0">
														<div className="w-6 h-6 md:w-8 md:h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
															<span className="text-white text-sm md:text-lg font-bold">✓</span>
														</div>
													</div>
												)}
											</div>

											{/* Option Helper Text */}
											{correctOptionIndex === i && (
												<div className="ml-12 md:ml-16 mt-2 flex items-center space-x-2 animate-fade-in">
													<div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
													<p className="text-xs md:text-sm text-orange-700 dark:text-yellow-400 font-medium">
														This is the correct answer ✨
													</p>
												</div>
											)}
										</div>
									))}
								</div>
							</div>

							{/* Instructions */}
							<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg md:rounded-xl p-4 md:p-6">
								<h3 className="text-base md:text-lg font-semibold text-red-900 dark:text-red-200 mb-3">
									💡 Tips for creating great questions:
								</h3>
								<ul className="space-y-2 text-sm md:text-base text-red-800 dark:text-red-300">
									<li className="flex items-start space-x-2">
										<span className="text-red-600 dark:text-red-400 mt-1">•</span>
										<span>Make your question clear and specific</span>
									</li>
									<li className="flex items-start space-x-2">
										<span className="text-red-600 dark:text-red-400 mt-1">•</span>
										<span>Ensure all options are plausible</span>
									</li>
									<li className="flex items-start space-x-2">
										<span className="text-red-600 dark:text-red-400 mt-1">•</span>
										<span>Mark the correct answer clearly</span>
									</li>
									<li className="flex items-start space-x-2">
										<span className="text-red-600 dark:text-red-400 mt-1">•</span>
										<span>Your question will be reviewed before going live</span>
									</li>
								</ul>
							</div>

							{/* Submit Button */}
							<div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4 md:pt-6">
								<button
									disabled={!isFormValid || loading}
									className="flex-1 bg-gradient-to-r from-yellow-600 to-red-600 hover:from-yellow-700 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 md:py-4 px-6 md:px-8 rounded-lg md:rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl text-sm md:text-base"
								>
									{loading ? (
										<div className="flex items-center justify-center space-x-2">
											<div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-white"></div>
											<span>Submitting Question...</span>
										</div>
									) : (
										<div className="flex items-center justify-center space-x-2">
											<span>🚀</span>
											<span>Submit for Review</span>
										</div>
									)}
								</button>

								<button
									type="button"
									onClick={() => router.push('/pro/questions/mine')}
									className="px-6 md:px-8 py-3 md:py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg md:rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm md:text-base"
								>
									View My Questions
								</button>
							</div>
						</form>
					</div>

					{/* Bottom Info */}
					<div className="mt-6 md:mt-8 text-center px-4">
						<p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
							Questions are reviewed by admin. You'll see your question in community when questions are approved! 🎉
						</p>
					</div>
				</div>
			</div>
			<UnifiedFooter />
		</>
	);
};

export default PostUserQuestion;







