'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import UnifiedFooter from '../../UnifiedFooter';
import API from '../../../lib/api';
import { getCurrentUser } from '../../../utils/authUtils';
import { toast } from 'react-toastify';
import Loading from '../../Loading';

const MIN_WITHDRAW_AMOUNT = parseInt(process.env.NEXT_PUBLIC_MIN_WITHDRAW_AMOUNT || '1000', 10);

const UserWallet = () => {
	const router = useRouter();
	const user = getCurrentUser();
	const [walletInfo, setWalletInfo] = useState({
		walletBalance: 0,
		claimableRewards: 0,
		referralRewards: [],
		referralCount: 0,
		isTopPerformer: false,
		rewardBreakdown: {
			quiz_reward: 0,
			blog_reward: 0,
			question_reward: 0,
			referral: 0,
			bonus: 0
		}
	});
	const [upi, setUpi] = useState('');
	const [loading, setLoading] = useState(false);
	const [walletLoading, setWalletLoading] = useState(true);
	const [isClaiming, setIsClaiming] = useState(false);
	const [focusedField, setFocusedField] = useState(null);
	const fetchRef = useRef(false);

	const load = useCallback(async () => {
		setWalletLoading(true);
		try {
			const res = await API.getWalletData();
			if (res && res.success && res.data) {
				const data = res.data;
				setWalletInfo({
					walletBalance: data.walletBalance || 0,
					claimableRewards: data.claimableRewards || 0,
					referralRewards: data.referralRewards || [],
					referralCount: data.referralCount || 0,
					isTopPerformer: data.isTopPerformer || false,
					subscriptionStatus: data.subscriptionStatus || 'free',
					rewardBreakdown: data.rewardBreakdown || {
						quiz_reward: 0,
						blog_reward: 0,
						question_reward: 0,
						referral: 0,
						bonus: 0
					}
				});
			}
		} catch (e) {
			console.error('Error loading wallet:', e);
			toast.error('Failed to load wallet data');
		} finally {
			setWalletLoading(false);
		}
	}, []);

	useEffect(() => {
		if (user && !fetchRef.current) {
			fetchRef.current = true;
			load();
		}
	}, [load, !!user]);

	const handleClaimRewards = async (e) => {
		if (e) e.preventDefault();

		if (walletInfo.claimableRewards <= 0) {
			toast.error("No rewards to claim!");
			return;
		}

		if (!walletInfo.isTopPerformer) {
			toast.error("Only Monthly Top Performers can claim rewards!");
			return;
		}

		try {
			setIsClaiming(true);
			const res = await API.claimRewards();
			if (res.success) {
				toast.success(res.message);
				setWalletInfo(prev => ({
					...prev,
					walletBalance: res.data.walletBalance,
					claimableRewards: res.data.claimableRewards
				}));
			} else {
				toast.error(res.message || "Failed to claim rewards");
			}
		} catch (err) {
			toast.error(err.message || "Something went wrong while claiming");
		} finally {
			setIsClaiming(false);
		}
	};

	const submitWithdraw = async (e) => {
		e.preventDefault();

		const withdrawAmount = walletInfo.walletBalance;

		if (withdrawAmount <= 0) {
			toast.error('No referral balance available for withdrawal');
			return;
		}

		if (withdrawAmount < MIN_WITHDRAW_AMOUNT) {
			toast.error(`Minimum withdrawal amount for Referral Wallet is ₹${MIN_WITHDRAW_AMOUNT}. Your current balance is ₹${withdrawAmount}`);
			return;
		}

		if (!upi) {
			toast.error('Please enter UPI ID or bank details');
			return;
		}

		setLoading(true);
		try {
			const res = await API.createReferralWithdrawRequest({
				amount: withdrawAmount,
				upi
			});
			if (res?.success) {
				toast.success('Withdrawal request submitted successfully! 💰');
				setUpi('');
				load();
			}
		} catch (err) {
			toast.error(err?.response?.data?.message || err?.message || 'Failed to submit withdrawal request');
		} finally {
			setLoading(false);
		}
	};

	const formatCurrency = (amount) => {
		return new Intl.NumberFormat('en-IN', {
			style: 'currency',
			currency: 'INR',
			minimumFractionDigits: 0,
			maximumFractionDigits: 2
		}).format(amount);
	};

	// Calculate withdrawal eligibility
	const canWithdraw = walletInfo.walletBalance >= MIN_WITHDRAW_AMOUNT && walletInfo.isTopPerformer;

	return (
		<>
			<div className="min-h-screen bg-subg-light dark:bg-subg-dark py-4 lg:py-8 px-4">
				<div className="container mx-auto py-0 lg:py-4 px-0 lg:px-10">
					{/* Header Section */}
					<div className="text-center mb-6 md:mb-8">
						<div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-yellow-600 to-red-600 rounded-full mb-3 md:mb-4">
							<span className="text-sm md:text-lg lg:text-xl xl:text-2xl">💰</span>
						</div>
						<h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
							My Wallet
						</h1>
						<p className="text-sm md:text-lg text-gray-600 dark:text-gray-300 px-4">
							Manage your earnings and competition rewards
						</p>
					</div>

					{/* Wallet Stats Cards */}
					{walletLoading ? (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
							{[1, 2].map(i => (
								<div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-lg border border-gray-200 dark:border-gray-700 animate-pulse">
									<div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
									<div className="h-8 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
									<div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
								</div>
							))}
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
							{/* Referral Wallet Card */}
							<div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-200">
								<div className="flex items-center justify-between mb-4">
									<div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
										<span className="text-sm md:text-lg lg:text-xl xl:text-2xl">💰</span>
									</div>
									<div className="text-right">
										<p className="text-xs md:text-sm font-medium text-green-600 dark:text-green-400">Main Wallet (Withdrawable)</p>
									</div>
								</div>
								<div className="space-y-2">
									<h3 className="text-2xl md:text-xl lg:text-3xl font-bold text-gray-900 dark:text-white">
										{formatCurrency(walletInfo.walletBalance)}
									</h3>
									<div className="flex items-center justify-between">
										<p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
											Referral, Quiz & Blog Rewards
										</p>
										<span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
											Min. ₹{MIN_WITHDRAW_AMOUNT}
										</span>
									</div>
								</div>
							</div>

							{/* Competition Rewards Card */}
							<div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-200">
								<div className="flex items-center justify-between mb-4">
									<div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
										<span className="text-sm md:text-lg lg:text-xl xl:text-2xl">🏆</span>
									</div>
									<div className="text-right">
										<p className="text-xs md:text-sm font-medium text-yellow-600 dark:text-yellow-400">Competition Rewards (Claimable)</p>
									</div>
								</div>
								<div className="space-y-2">
									<h3 className="text-2xl md:text-xl lg:text-3xl font-bold text-gray-900 dark:text-white">
										{formatCurrency(walletInfo.claimableRewards)}
									</h3>
									<div className="flex items-center justify-between">
										<p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
											Daily, Weekly & Monthly Rewards
										</p>
										<button
											onClick={handleClaimRewards}
											disabled={isClaiming || walletInfo.claimableRewards <= 0}
											className={`text-xs px-4 py-1.5 rounded-lg font-semibold transition-all duration-200 ${walletInfo.isTopPerformer && walletInfo.claimableRewards > 0
												? 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
												: 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
												}`}
										>
											{isClaiming ? 'Claiming...' : 'Claim Now'}
										</button>
									</div>
									{!walletInfo.isTopPerformer && walletInfo.claimableRewards > 0 && (
										<p className="text-[10px] text-red-500 mt-1">Requires Monthly Top Performer status to claim</p>
									)}
								</div>
							</div>
						</div>
					)}

					{/* Reward Breakdown Cards */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
						{/* Quiz Rewards Card */}
						<div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border-l-4 border-green-500">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600">🧠</div>
								<div>
									<p className="text-xs text-gray-500 uppercase tracking-wider">Quiz Earnings</p>
									<p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(walletInfo.rewardBreakdown?.quiz_reward || 0)}</p>
								</div>
							</div>
						</div>
						{/* Blog Rewards Card */}
						<div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border-l-4 border-blue-500">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600">📝</div>
								<div>
									<p className="text-xs text-gray-500 uppercase tracking-wider">Blog Earnings</p>
									<p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(walletInfo.rewardBreakdown?.blog_reward || 0)}</p>
								</div>
							</div>
						</div>
						{/* Question Rewards Card */}
						<div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border-l-4 border-yellow-500">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-yellow-600">❓</div>
								<div>
									<p className="text-xs text-gray-500 uppercase tracking-wider">Question Earnings</p>
									<p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(walletInfo.rewardBreakdown?.question_reward || 0)}</p>
								</div>
							</div>
						</div>
						{/* Referral Rewards Card */}
						<div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border-l-4 border-purple-500">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600">📊</div>
								<div>
									<p className="text-xs text-gray-500 uppercase tracking-wider">Referral Rewards</p>
									<p className="text-lg font-bold text-gray-900 dark:text-white">
										{formatCurrency((walletInfo.rewardBreakdown?.bonus || 0) + (walletInfo.rewardBreakdown?.referral || 0))}
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* View History Buttons */}
					<div className="flex flex-wrap justify-center items-center mb-6 md:mb-8 gap-3 md:gap-4 lg:gap-6">
						<button
							onClick={() => router.push('/referral-history')}
							className="flex-1 lg:flex-none bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg text-xs md:text-sm flex items-center justify-center space-x-2 min-w-[160px]"
						>
							<span>📊</span>
							<span>Referral Rewards</span>
						</button>
						<button
							onClick={() => router.push('/pro/user-quiz-rewards')}
							className="flex-1 lg:flex-none bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg text-xs md:text-sm flex items-center justify-center space-x-2 min-w-[160px]"
						>
							<span>🧠</span>
							<span>Quiz Rewards</span>
						</button>
						<button
							onClick={() => router.push('/pro/question-rewards-history')}
							className="flex-1 lg:flex-none bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg text-xs md:text-sm flex items-center justify-center space-x-2 min-w-[170px]"
						>
							<span>❓</span>
							<span>Question Rewards</span>
						</button>
						<button
							onClick={() => router.push('/pro/blog-rewards-history')}
							className="flex-1 lg:flex-none bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg text-xs md:text-sm flex items-center justify-center space-x-2 min-w-[160px]"
						>
							<span>📝</span>
							<span>Blog Rewards</span>
						</button>
						<button
							onClick={() => router.push('/pro/withdrawal-history')}
							className="flex-1 lg:flex-none bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg text-xs md:text-sm flex items-center justify-center space-x-2 min-w-[160px]"
						>
							<span>💸</span>
							<span>Withdraw Records</span>
						</button>
					</div>

					{/* Withdrawal Rules */}
					<div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 md:p-6 mb-6 md:mb-8">
						<h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4">Withdrawal & Rewards Rules:</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<h3 className="text-sm font-bold text-green-600 dark:text-green-400 uppercase tracking-wider mb-2">Referral Wallet</h3>
								<ul className="space-y-1 text-xs md:text-sm text-gray-700 dark:text-gray-300">
									<li className="flex items-start">
										<span className="mr-2">•</span>
										<span>Minimum withdrawal: ₹{MIN_WITHDRAW_AMOUNT}</span>
									</li>
									<li className="flex items-start">
										<span className="mr-2">•</span>
										<span>Balance is earned from valid user referrals.</span>
									</li>
								</ul>
								<div className={`mt-3 p-2 rounded-lg ${walletInfo.walletBalance >= MIN_WITHDRAW_AMOUNT ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
									<p className={`text-[10px] md:text-xs font-medium ${walletInfo.walletBalance >= MIN_WITHDRAW_AMOUNT ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
										{walletInfo.walletBalance >= MIN_WITHDRAW_AMOUNT
											? '✅ Eligible to withdraw'
											: `❌ Need ₹${Math.max(0, MIN_WITHDRAW_AMOUNT - walletInfo.walletBalance)} more to withdraw`}
									</p>
								</div>
							</div>
							<div>
								<h3 className="text-sm font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-wider mb-2">Competition Rewards</h3>
								<ul className="space-y-1 text-xs md:text-sm text-gray-700 dark:text-gray-300">
									<li className="flex items-start">
										<span className="mr-2">•</span>
										<span>Only **Monthly Top Performers** can claim.</span>
									</li>
									<li className="flex items-start">
										<span className="mr-2">•</span>
										<span>Rewards from Daily, Weekly, and Monthly competitions.</span>
									</li>
								</ul>
								<div className={`mt-3 p-2 rounded-lg ${walletInfo.isTopPerformer ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-gray-100 dark:bg-gray-700/50'}`}>
									<p className={`text-[10px] md:text-xs font-medium ${walletInfo.isTopPerformer ? 'text-yellow-800 dark:text-yellow-200' : 'text-gray-500'}`}>
										{walletInfo.isTopPerformer
											? '✅ You are a Top Performer! You can claim rewards.'
											: '🔒 Only Monthly Top Performers are eligible to claim.'}
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Withdrawal Section */}
					<div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
						{/* Section Header */}
						<div className="bg-gradient-to-r from-yellow-600 to-red-600 px-4 md:px-8 py-4 md:py-6">
							<div className="flex items-center space-x-3">
								<div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-lg flex items-center justify-center">
									<span className="text-lg md:text-xl">💸</span>
								</div>
								<div>
									<h2 className="text-lg md:text-xl font-bold text-white">Withdraw Funds</h2>
								</div>
							</div>
						</div>

						{/* Withdrawal Info */}
						{!canWithdraw && (
							<div className="p-4 md:p-6 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
								<div className="flex items-start space-x-3">
									<div className="flex-shrink-0">
										<span className="text-sm md:text-lg lg:text-xl xl:text-2xl">⏳</span>
									</div>
									<div>
										<h3 className="text-sm md:text-base font-medium text-yellow-800 dark:text-yellow-200 mb-1">
											Withdrawal Not Yet Available
										</h3>
										<p className="text-xs text-orange-700 dark:text-yellow-400 mt-1">
											{walletInfo.walletBalance < MIN_WITHDRAW_AMOUNT
												? `You need ₹${MIN_WITHDRAW_AMOUNT - walletInfo.walletBalance} more to withdraw`
												: 'You must be a Top Performer in the previous month to withdraw'}
										</p>
									</div>
								</div>
							</div>
						)}

						{/* Withdrawal Form */}
						{canWithdraw && (
							<form
								onSubmit={submitWithdraw}
								className="p-4 md:p-8 space-y-4 md:space-y-6">
								{/* Withdrawal Amount Display (Read-only) */}
								<div className="space-y-2">
									<label className="block text-sm md:text-base font-semibold text-gray-900 dark:text-white">
										💰 Withdrawal Amount
									</label>
									<div className="relative">
										<div className="w-full border-2 rounded-lg md:rounded-xl p-3 md:p-4 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600">
											<div className="flex items-center justify-between">
												<span className="text-gray-900 dark:text-white text-sm md:text-base font-semibold">
													{formatCurrency(walletInfo.walletBalance)}
												</span>
												<span className="text-gray-500 dark:text-gray-400 text-sm">₹</span>
											</div>
										</div>
									</div>
									<p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
										Full referral balance will be withdrawn • Minimum: ₹{MIN_WITHDRAW_AMOUNT}
									</p>
								</div>

								{/* UPI Input */}
								<div className="space-y-2">
									<label className="block text-sm md:text-base font-semibold text-gray-900 dark:text-white">
										📱 UPI ID or Bank Details
									</label>
									<input
										type="text"
										className={`w-full border-2 rounded-lg md:rounded-xl p-3 md:p-4 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 transition-all duration-200 text-sm md:text-base ${focusedField === 'upi'
											? 'border-red-500 ring-2 md:ring-4 ring-red-200 dark:ring-red-800'
											: 'border-gray-300 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-600'
											}`}
										placeholder="Enter UPI ID (e.g., username@paytm) or bank details"
										value={upi}
										onChange={e => setUpi(e.target.value)}
										onFocus={() => setFocusedField('upi')}
										onBlur={() => setFocusedField(null)}
									/>
									<p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
										You can also update bank details in your profile
									</p>
								</div>

								{/* Submit Button */}
								<button
									disabled={loading || !upi || walletInfo.walletBalance < MIN_WITHDRAW_AMOUNT}
									type="submit"
									className="w-full bg-gradient-to-r from-yellow-600 to-red-600 hover:from-yellow-700 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 md:py-4 px-6 md:px-8 rounded-lg md:rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:shadow-none text-sm md:text-base"
								>
									{loading ? (
										<div className="flex items-center justify-center space-x-2">
											<div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-white"></div>
											<span>Processing Withdrawal...</span>
										</div>
									) : (
										<div className="flex items-center justify-center space-x-2">
											<span>🚀</span>
											<span>Request Withdrawal</span>
										</div>
									)}
								</button>
							</form>
						)}

						{/* Help Section */}
						<div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
							<div className="flex items-start space-x-3">
								<div className="flex-shrink-0">
									<span className="text-lg md:text-xl">💡</span>
								</div>
								<div>
									<h3 className="text-sm md:text-base font-medium text-gray-900 dark:text-white mb-2">
										How it works:
									</h3>
									<ul className="space-y-1 text-xs md:text-sm text-gray-600 dark:text-gray-400">
										<li className="flex items-start space-x-2">
											<span className="text-orange-700 dark:text-yellow-400 mt-1">•</span>
											<span>You earn rewards when your friend purchases a Pro plan.</span>
										</li>
									</ul>
								</div>
							</div>
						</div>
					</div>

					{/* Bottom Info */}
					<div className="mt-6 md:mt-8 text-center px-4">
						<p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
							Keep referring friends and performing well in quizzes to earn more! 🎯
						</p>
					</div>
				</div>
			</div>
			<UnifiedFooter />
		</>
	);
};

export default UserWallet;
