'use client';

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
// MobileAppWrapper import removed
import UnifiedFooter from '../UnifiedFooter';
import Loading from '../Loading';
import API from '../../lib/api';
import config from '../../lib/config/appConfig';
import { FaRupeeSign, FaArrowUp, FaArrowDown, FaWallet, FaTrophy, FaChartLine, FaUsers, FaUserFriends, FaUserPlus, FaGraduationCap, FaQuestionCircle, FaFolder, FaLayerGroup, FaBook, FaCoins, FaChartBar } from 'react-icons/fa';

const MyAnalyticsPage = () => {
  const [earningsData, setEarningsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await API.getAnalytics();
      if (response?.success) {
        setEarningsData(response.data);
      } else {
        setError(response?.message || 'Failed to load analytics data');
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Loading fullScreen={true} size="lg" color="blue" message="Loading analytics..." />
        <UnifiedFooter />
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
          <div className="text-center max-w-md w-full">
            <div className="text-6xl mb-4 animate-bounce">❌</div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-800 dark:text-white mb-2">Error Loading Analytics</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
            <button
              onClick={fetchEarnings}
              className="bg-gradient-to-r from-red-500 to-primary-500 text-white px-8 py-3 rounded-xl hover:from-secondary-600 hover:to-primary-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
            >
              Try Again
            </button>
          </div>
        </div>
        <UnifiedFooter />
      </>
    );
  }

  const { totalEarnings = 0, referralRewards = 0, blogEarnings = 0, quizEarnings = 0, totalExpenses = 0, netEarnings = 0, totalHighScoreWins = 0, averageAccuracy = 0, followersCount = 0, followingCount = 0, referralCount = 0, testAttemptsCount = 0, questionsPostedCount = 0, categoriesCreatedCount = 0, subcategoriesCreatedCount = 0, quizzesCreatedCount = 0, blogsCreatedCount = 0 } = earningsData || {};

  return (
    <>
      <Head>
        <title>My Analytics - AajExam Platform</title>
        <meta name="description" content="View your comprehensive analytics on AajExam Platform. Track your earnings, expenses, performance metrics, and content creation statistics." />
        <meta name="keywords" content="analytics, earnings, expenses, performance, statistics, quiz analytics" />
        <meta property="og:title" content="My Analytics - AajExam Platform" />
        <meta property="og:description" content="View your comprehensive analytics on AajExam Platform." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="My Analytics - AajExam" />
        <meta name="twitter:description" content="View your comprehensive analytics on AajExam Platform." />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-red-500 via-primary-500 to-secondary-500 dark:from-secondary-600 dark:via-primary-600 dark:to-secondary-600 shadow-xl">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative container mx-auto px-4 xl:px-10 py-4 sm:py-6 xl:py-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-white dark:bg-gray-800 bg-opacity-20 dark:bg-opacity-30 backdrop-blur-lg rounded-2xl p-4 shadow-lg">
                  <FaChartBar className="text-3xl md:text-4xl text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-4xl font-bold text-white drop-shadow-lg flex items-center gap-3">
                    My Analytics
                  </h1>
                  <p className="text-white text-opacity-90 text-sm md:text-base mt-2 font-medium">
                    Track your performance, earnings, and content statistics
                  </p>
                </div>
              </div>
              <div className={`w-full md:w-auto bg-green-500 backdrop-blur-lg rounded-xl px-6 py-3 shadow-lg ${netEarnings < 0 ? 'border-2 border-red-300 dark:border-red-500' : ''
                }`}>
                <div className="text-center md:text-left text-white text-opacity-80 text-xs md:text-sm font-bold">
                  {netEarnings >= 0 ? 'Net Profit' : 'Net Loss'}
                </div>
                <div className="flex justify-center md:justify-start items-baseline gap-1 mt-1">
                  <FaRupeeSign className="text-lg text-white" />
                  <span className={`text-2xl md:text-3xl font-bold ${netEarnings < 0 ? 'text-red-200 dark:text-red-300' : 'text-white'
                    }`}>
                    {Math.abs(netEarnings).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cards Section with Grouping */}
        <div className="container mx-auto px-4 lg:px-10 py-8">
          {/* Financial Metrics Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-2">
                <FaCoins className="text-white text-xl" />
              </div>
              <h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 dark:text-white">Financial Metrics</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-4 xl:gap-6">
              {/* Total Earnings Card */}
              <div className="group relative bg-gradient-to-br from-green-400 via-emerald-400 to-green-500 dark:from-green-600 dark:via-emerald-600 dark:to-green-700 rounded-2xl shadow-xl p-3 xl:p-6 text-gray-900 dark:text-white transform transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white dark:bg-gray-800 opacity-20 dark:opacity-10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-white dark:bg-gray-800 bg-opacity-40 dark:bg-opacity-30 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                      <FaArrowUp className="text-2xl text-green-700 dark:text-white" />
                    </div>
                    <span className="text-xs font-semibold bg-white dark:bg-gray-800 bg-opacity-40 dark:bg-opacity-30 backdrop-blur-sm px-3 py-1.5 rounded-full text-green-800 dark:text-white">
                      Total Earnings
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-baseline gap-2">
                      <FaRupeeSign className="text-xl text-green-800 dark:text-white opacity-90" />
                      <span className="text-2xl lg:text-3xl xl:text-4xl font-bold drop-shadow-lg text-green-900 dark:text-white">
                        {totalEarnings.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-green-800 dark:text-green-100 text-sm mt-3 font-medium">
                      Challenge winners + Referral rewards + Blog rewards + Quiz rewards
                    </p>
                  </div>
                </div>
              </div>

              {/* Total Expenses Card */}
              <div className="group relative bg-gradient-to-br from-red-400 via-rose-400 to-secondary-500 dark:from-secondary-600 dark:via-rose-600 dark:to-red-700 rounded-2xl shadow-xl p-3 xl:p-6 text-gray-900 dark:text-white transform transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white dark:bg-gray-800 opacity-20 dark:opacity-10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-white dark:bg-gray-800 bg-opacity-40 dark:bg-opacity-30 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                      <FaArrowDown className="text-2xl text-red-700 dark:text-white" />
                    </div>
                    <span className="text-xs font-semibold bg-white dark:bg-gray-800 bg-opacity-40 dark:bg-opacity-30 backdrop-blur-sm px-3 py-1.5 rounded-full text-red-800 dark:text-white">
                      Total Expenses
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-baseline gap-2">
                      <FaRupeeSign className="text-xl text-red-800 dark:text-white opacity-90" />
                      <span className="text-2xl lg:text-3xl xl:text-4xl font-bold drop-shadow-lg text-red-900 dark:text-white">
                        {totalExpenses.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-red-800 dark:text-red-100 text-sm mt-3 font-medium">
                      Successful subscription payments
                    </p>
                  </div>
                </div>
              </div>

              {/* Net Earnings Card */}
              <div className={`group relative bg-gradient-to-br rounded-2xl shadow-xl p-3 xl:p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden ${netEarnings >= 0
                ? 'from-secondary-400 via-cyan-400 to-secondary-500 dark:from-secondary-600 dark:via-cyan-600 dark:to-secondary-700 text-gray-900 dark:text-white'
                : 'from-red-400 via-rose-400 to-secondary-500 dark:from-secondary-600 dark:via-rose-600 dark:to-red-700 text-gray-900 dark:text-white'
                }`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white dark:bg-gray-800 opacity-20 dark:opacity-10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-white dark:bg-gray-800 bg-opacity-40 dark:bg-opacity-30 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                      <FaWallet className={`text-2xl ${netEarnings >= 0 ? 'text-secondary-700 dark:text-white' : 'text-red-700 dark:text-white'}`} />
                    </div>
                    <span className={`text-xs font-semibold bg-white dark:bg-gray-800 bg-opacity-40 dark:bg-opacity-30 backdrop-blur-sm px-3 py-1.5 rounded-full ${netEarnings >= 0 ? 'text-secondary-800 dark:text-white' : 'text-red-800 dark:text-white'}`}>
                      {netEarnings >= 0 ? 'Net Profit' : 'Net Loss'}
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-baseline gap-2">
                      <FaRupeeSign className={`text-xl opacity-90 ${netEarnings >= 0 ? 'text-secondary-800 dark:text-white' : 'text-red-800 dark:text-white'}`} />
                      <span className={`text-2xl lg:text-3xl xl:text-4xl font-bold drop-shadow-lg ${netEarnings >= 0 ? 'text-secondary-900 dark:text-white' : 'text-red-900 dark:text-white'}`}>
                        {Math.abs(netEarnings).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className={`text-sm mt-3 font-medium ${netEarnings >= 0 ? 'text-secondary-800 dark:text-secondary-100' : 'text-red-800 dark:text-red-100'}`}>
                      {netEarnings >= 0 ? 'Total profit' : 'Total loss'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Blog Earnings Card */}
              <div className="group relative bg-gradient-to-br from-primary-400 via-amber-400 to-primary-500 dark:from-primary-600 dark:via-amber-600 dark:to-primary-700 rounded-2xl shadow-xl p-3 xl:p-6 text-gray-900 dark:text-white transform transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white dark:bg-gray-800 opacity-20 dark:opacity-10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-white dark:bg-gray-800 bg-opacity-40 dark:bg-opacity-30 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                      <FaBook className="text-2xl text-primary-600 dark:text-white" />
                    </div>
                    <span className="text-xs font-semibold bg-white dark:bg-gray-800 bg-opacity-40 dark:bg-opacity-30 backdrop-blur-sm px-3 py-1.5 rounded-full text-primary-800 dark:text-white">
                      Blog Earnings
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-baseline gap-2">
                      <FaRupeeSign className="text-xl text-primary-800 dark:text-white opacity-90" />
                      <span className="text-2xl lg:text-3xl xl:text-4xl font-bold drop-shadow-lg text-primary-900 dark:text-white">
                        {blogEarnings.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-primary-800 dark:text-primary-100 text-sm mt-3 font-medium">
                      From approved blogs
                    </p>
                  </div>
                </div>
              </div>

              {/* Quiz Earnings Card */}
              <div className="group relative bg-gradient-to-br from-secondary-400 via-cyan-400 to-secondary-500 dark:from-secondary-600 dark:via-cyan-600 dark:to-secondary-700 rounded-2xl shadow-xl p-3 xl:p-6 text-gray-900 dark:text-white transform transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white dark:bg-gray-800 opacity-20 dark:opacity-10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-white dark:bg-gray-800 bg-opacity-40 dark:bg-opacity-30 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                      <FaQuestionCircle className="text-2xl text-secondary-700 dark:text-white" />
                    </div>
                    <span className="text-xs font-semibold bg-white dark:bg-gray-800 bg-opacity-40 dark:bg-opacity-30 backdrop-blur-sm px-3 py-1.5 rounded-full text-secondary-800 dark:text-white">
                      Quiz Earnings
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-baseline gap-2">
                      <FaRupeeSign className="text-xl text-secondary-800 dark:text-white opacity-90" />
                      <span className="text-2xl lg:text-3xl xl:text-4xl font-bold drop-shadow-lg text-secondary-900 dark:text-white">
                        {quizEarnings.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-secondary-800 dark:text-secondary-100 text-sm mt-3 font-medium">
                      From approved quizzes
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg p-2">
                <FaTrophy className="text-white text-xl" />
              </div>
              <h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 dark:text-white">Performance Metrics</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 xl:gap-6">
              {/* Total High Score Wins Card */}
              <div className="group relative bg-gradient-to-br from-purple-400 via-violet-400 from-red-500 dark:from-purple-600 dark:via-violet-600 dark:from-red-700 rounded-2xl shadow-xl p-3 xl:p-6 text-gray-900 dark:text-white transform transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white dark:bg-gray-800 opacity-20 dark:opacity-10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-white dark:bg-gray-800 bg-opacity-40 dark:bg-opacity-30 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                      <FaTrophy className="text-2xl text-primary-700 dark:text-white" />
                    </div>
                    <span className="text-xs font-semibold bg-white dark:bg-gray-800 bg-opacity-40 dark:bg-opacity-30 backdrop-blur-sm px-3 py-1.5 rounded-full text-primary-800 dark:text-white">
                      High Score Wins
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl lg:text-3xl xl:text-4xl font-bold drop-shadow-lg text-primary-900 dark:text-white">
                        {totalHighScoreWins.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-primary-800 dark:text-primary-100 text-sm mt-3 font-medium">
                      Total high score wins from monthly competitions
                    </p>
                  </div>
                </div>
              </div>

              {/* Average Accuracy Card */}
              <div className="group relative bg-gradient-to-br from-primary-400 via-secondary-400 to-indigo-500 dark:from-primary-600 dark:via-secondary-600 dark:to-indigo-700 rounded-2xl shadow-xl p-3 xl:p-6 text-gray-900 dark:text-white transform transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white dark:bg-gray-800 opacity-20 dark:opacity-10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-white dark:bg-gray-800 bg-opacity-40 dark:bg-opacity-30 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                      <FaChartLine className="text-2xl text-red-700 dark:text-white" />
                    </div>
                    <span className="text-xs font-semibold bg-white dark:bg-gray-800 bg-opacity-40 dark:bg-opacity-30 backdrop-blur-sm px-3 py-1.5 rounded-full text-red-800 dark:text-white">
                      Average Accuracy
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl lg:text-3xl xl:text-4xl font-bold drop-shadow-lg text-red-900 dark:text-white">
                        {averageAccuracy.toFixed(2)}%
                      </span>
                    </div>
                    <p className="text-red-800 dark:text-red-100 text-sm mt-3 font-medium">
                      Average accuracy across all winning months
                    </p>
                  </div>
                </div>
              </div>

              {/* Test Attempts Count Card */}
              <div className="group relative bg-gradient-to-br from-cyan-400 via-teal-400 to-cyan-500 dark:from-cyan-600 dark:via-teal-600 dark:to-cyan-700 rounded-2xl shadow-xl p-3 xl:p-6 text-gray-900 dark:text-white transform transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white dark:bg-gray-800 opacity-20 dark:opacity-10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-white dark:bg-gray-800 bg-opacity-40 dark:bg-opacity-30 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                      <FaGraduationCap className="text-2xl text-cyan-700 dark:text-white" />
                    </div>
                    <span className="text-xs font-semibold bg-white dark:bg-gray-800 bg-opacity-40 dark:bg-opacity-30 backdrop-blur-sm px-3 py-1.5 rounded-full text-cyan-800 dark:text-white">
                      Test Attempts
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl lg:text-3xl xl:text-4xl font-bold drop-shadow-lg text-cyan-900 dark:text-white">
                        {testAttemptsCount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-cyan-800 dark:text-cyan-100 text-sm mt-3 font-medium">
                      Total government exam test attempts
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Social Metrics Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg p-2">
                <FaUsers className="text-white text-xl" />
              </div>
              <h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 dark:text-white">Social Metrics</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 xl:gap-6">
              {/* Followers Count Card */}
              <div className="group relative bg-gradient-to-br from-pink-400 via-rose-400 to-pink-500 dark:from-pink-600 dark:via-rose-600 dark:to-pink-700 rounded-2xl shadow-xl p-3 xl:p-6 text-gray-900 dark:text-white transform transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white dark:bg-gray-800 opacity-20 dark:opacity-10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-white dark:bg-gray-800 bg-opacity-40 dark:bg-opacity-30 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                      <FaUsers className="text-2xl text-pink-700 dark:text-white" />
                    </div>
                    <span className="text-xs font-semibold bg-white dark:bg-gray-800 bg-opacity-40 dark:bg-opacity-30 backdrop-blur-sm px-3 py-1.5 rounded-full text-pink-800 dark:text-white">
                      Followers
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl lg:text-3xl xl:text-4xl font-bold drop-shadow-lg text-pink-900 dark:text-white">
                        {followersCount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-pink-800 dark:text-pink-100 text-sm mt-3 font-medium">
                      Total number of followers
                    </p>
                  </div>
                </div>
              </div>

              {/* Following Count Card */}
              <div className="group relative bg-gradient-to-br from-teal-400 via-cyan-400 to-teal-500 dark:from-teal-600 dark:via-cyan-600 dark:to-teal-700 rounded-2xl shadow-xl p-3 xl:p-6 text-gray-900 dark:text-white transform transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white dark:bg-gray-800 opacity-20 dark:opacity-10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-white dark:bg-gray-800 bg-opacity-40 dark:bg-opacity-30 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                      <FaUserFriends className="text-2xl text-teal-700 dark:text-white" />
                    </div>
                    <span className="text-xs font-semibold bg-white dark:bg-gray-800 bg-opacity-40 dark:bg-opacity-30 backdrop-blur-sm px-3 py-1.5 rounded-full text-teal-800 dark:text-white">
                      Following
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl lg:text-3xl xl:text-4xl font-bold drop-shadow-lg text-teal-900 dark:text-white">
                        {followingCount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-teal-800 dark:text-teal-100 text-sm mt-3 font-medium">
                      Total number of users you follow
                    </p>
                  </div>
                </div>
              </div>

              {/* Referral Count Card */}
              <div className="group relative bg-gradient-to-br from-amber-400 via-primary-400 to-amber-500 dark:from-amber-600 dark:via-primary-600 dark:to-amber-700 rounded-2xl shadow-xl p-3 xl:p-6 text-gray-900 dark:text-white transform transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white dark:bg-gray-800 opacity-20 dark:opacity-10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-white dark:bg-gray-800 bg-opacity-40 dark:bg-opacity-30 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                      <FaUserPlus className="text-2xl text-amber-700 dark:text-white" />
                    </div>
                    <span className="text-xs font-semibold bg-white dark:bg-gray-800 bg-opacity-40 dark:bg-opacity-30 backdrop-blur-sm px-3 py-1.5 rounded-full text-amber-800 dark:text-white">
                      Referrals
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl lg:text-3xl xl:text-4xl font-bold drop-shadow-lg text-amber-900 dark:text-white">
                        {referralCount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-amber-800 dark:text-amber-100 text-sm mt-3 font-medium">
                      Total users referred by you
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Creation Metrics Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-violet-500 from-red-500 rounded-lg p-2">
                <FaBook className="text-white text-xl" />
              </div>
              <h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 dark:text-white">Content Creation</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-4 xl:gap-6">
              {/* Questions Posted Count Card */}
              <div className="group relative bg-gradient-to-br from-violet-400 via-purple-400 to-violet-500 dark:from-violet-600 dark:via-secondary-500 dark:to-violet-700 rounded-2xl shadow-xl p-3 xl:p-6 text-gray-900 dark:text-white transform transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white dark:bg-gray-800 opacity-20 dark:opacity-10 rounded-full -mr-12 -mt-12"></div>
                <div className="relative z-10 flex justify-between items-center gap-2">
                  <div className="flex flex-col items-start mb-4">
                    <div className="bg-white dark:bg-gray-800 bg-opacity-40 dark:bg-opacity-30 backdrop-blur-sm rounded-xl p-3 shadow-lg mb-3">
                      <FaQuestionCircle className="text-xl text-violet-700 dark:text-white" />
                    </div>
                    <span className="text-xs font-semibold bg-white dark:bg-gray-800 bg-opacity-40 dark:bg-opacity-30 backdrop-blur-sm px-3 py-1.5 rounded-full text-violet-800 dark:text-white">
                      Questions
                    </span>
                  </div>
                  <div className="mt-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl md:text-3xl font-bold drop-shadow-lg text-violet-900 dark:text-white">
                        {questionsPostedCount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-violet-800 dark:text-violet-100 text-xs mt-2 font-medium">
                      Posted
                    </p>
                  </div>
                </div>
              </div>

              {/* Categories Created Count Card */}
              <div className="group relative bg-gradient-to-br from-rose-400 via-pink-400 to-rose-500 dark:from-rose-600 dark:via-pink-600 dark:to-rose-700 rounded-2xl shadow-xl p-3 xl:p-6 text-gray-900 dark:text-white transform transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white dark:bg-gray-800 opacity-20 dark:opacity-10 rounded-full -mr-12 -mt-12"></div>
                <div className="relative z-10 flex justify-between items-center gap-2">
                  <div className="flex flex-col items-start mb-4">
                    <div className="bg-white dark:bg-gray-800 bg-opacity-40 dark:bg-opacity-30 backdrop-blur-sm rounded-xl p-3 shadow-lg mb-3">
                      <FaFolder className="text-xl text-rose-700 dark:text-white" />
                    </div>
                    <span className="text-xs font-semibold bg-white dark:bg-gray-800 bg-opacity-40 dark:bg-opacity-30 backdrop-blur-sm px-3 py-1.5 rounded-full text-rose-800 dark:text-white">
                      Categories
                    </span>
                  </div>
                  <div className="mt-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl md:text-3xl font-bold drop-shadow-lg text-rose-900 dark:text-white">
                        {categoriesCreatedCount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-rose-800 dark:text-rose-100 text-xs mt-2 font-medium">
                      Created
                    </p>
                  </div>
                </div>
              </div>

              {/* Sub-Categories Created Count Card */}
              <div className="group relative bg-gradient-to-br from-emerald-400 via-green-400 to-emerald-500 dark:from-emerald-600 dark:via-green-600 dark:to-emerald-700 rounded-2xl shadow-xl p-3 xl:p-6 text-gray-900 dark:text-white transform transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white dark:bg-gray-800 opacity-20 dark:opacity-10 rounded-full -mr-12 -mt-12"></div>
                <div className="relative z-10 flex justify-between items-center gap-2">
                  <div className="flex flex-col items-start mb-4">
                    <div className="bg-white dark:bg-gray-800 bg-opacity-40 dark:bg-opacity-30 backdrop-blur-sm rounded-xl p-3 shadow-lg mb-3">
                      <FaLayerGroup className="text-xl text-emerald-700 dark:text-white" />
                    </div>
                    <span className="text-xs font-semibold bg-white dark:bg-gray-800 bg-opacity-40 dark:bg-opacity-30 backdrop-blur-sm px-3 py-1.5 rounded-full text-emerald-800 dark:text-white">
                      Sub-Categories
                    </span>
                  </div>
                  <div className="mt-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl md:text-3xl font-bold drop-shadow-lg text-emerald-900 dark:text-white">
                        {subcategoriesCreatedCount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-emerald-800 dark:text-emerald-100 text-xs mt-2 font-medium">
                      Created
                    </p>
                  </div>
                </div>
              </div>

              {/* Quizzes Created Count Card */}
              <div className="group relative bg-gradient-to-br from-sky-400 via-secondary-400 to-sky-500 dark:from-sky-600 dark:via-secondary-600 dark:to-sky-700 rounded-2xl shadow-xl p-3 xl:p-6 text-gray-900 dark:text-white transform transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white dark:bg-gray-800 opacity-20 dark:opacity-10 rounded-full -mr-12 -mt-12"></div>
                <div className="relative z-10 flex justify-between items-center gap-2">
                  <div className="flex flex-col items-start mb-4">
                    <div className="bg-white dark:bg-gray-800 bg-opacity-40 dark:bg-opacity-30 backdrop-blur-sm rounded-xl p-3 shadow-lg mb-3">
                      <FaBook className="text-xl text-sky-700 dark:text-white" />
                    </div>
                    <span className="text-xs font-semibold bg-white dark:bg-gray-800 bg-opacity-40 dark:bg-opacity-30 backdrop-blur-sm px-3 py-1.5 rounded-full text-sky-800 dark:text-white">
                      Quizzes
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl md:text-3xl font-bold drop-shadow-lg text-sky-900 dark:text-white">
                        {quizzesCreatedCount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-sky-800 dark:text-sky-100 text-xs mt-2 font-medium">
                      Created
                    </p>
                  </div>
                </div>
              </div>

              {/* Blogs Created Count Card */}
              <div className="group relative bg-gradient-to-br from-primary-400 via-amber-400 to-primary-500 dark:from-primary-600 dark:via-amber-600 dark:to-primary-700 rounded-2xl shadow-xl p-3 xl:p-6 text-gray-900 dark:text-white transform transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white dark:bg-gray-800 opacity-20 dark:opacity-10 rounded-full -mr-12 -mt-12"></div>
                <div className="relative z-10 flex justify-between items-center gap-2">
                  <div className="flex flex-col items-start mb-4">
                    <div className="bg-white dark:bg-gray-800 bg-opacity-40 dark:bg-opacity-30 backdrop-blur-sm rounded-xl p-3 shadow-lg mb-3">
                      <FaBook className="text-xl text-primary-600 dark:text-white" />
                    </div>
                    <span className="text-xs font-semibold bg-white dark:bg-gray-800 bg-opacity-40 dark:bg-opacity-30 backdrop-blur-sm px-3 py-1.5 rounded-full text-primary-800 dark:text-white">
                      Blogs
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl md:text-3xl font-bold drop-shadow-lg text-primary-900 dark:text-white">
                        {blogsCreatedCount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-primary-800 dark:text-primary-100 text-xs mt-2 font-medium">
                      Created
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info Section - Enhanced */}
          <div className="mt-12 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-3 xl:p-6 md:p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-secondary-500 to-indigo-500 rounded-lg p-2">
                <FaChartBar className="text-white text-xl" />
              </div>
              <h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 dark:text-white">
                About Your Analytics
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600 dark:text-gray-300">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-300 shadow-sm hover:shadow-md">
                <div className="bg-green-100 dark:bg-green-900 rounded-full p-2 mt-1 flex-shrink-0">
                  <FaArrowUp className="text-green-600 dark:text-green-300" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">Total Earnings</p>
                  <p className="text-sm leading-relaxed">
                    Includes all reward amounts from monthly winners competitions and referral rewards.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-300 shadow-sm hover:shadow-md">
                <div className="bg-red-100 dark:bg-red-900 rounded-full p-2 mt-1 flex-shrink-0">
                  <FaArrowDown className="text-primary-600 dark:text-red-300" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">Total Expenses</p>
                  <p className="text-sm leading-relaxed">
                    Sum of all successful subscription payments with "success" status.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-300 shadow-sm hover:shadow-md">
                <div className="bg-purple-100 dark:bg-purple-900 rounded-full p-2 mt-1 flex-shrink-0">
                  <FaTrophy className="text-primary-600 dark:text-primary-300" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">High Score Wins</p>
                  <p className="text-sm leading-relaxed">
                    Total high score wins ({config.QUIZ_CONFIG.QUIZ_HIGH_SCORE_PERCENTAGE}% or higher) from monthly competitions.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-300 shadow-sm hover:shadow-md">
                <div className="bg-indigo-100 dark:bg-indigo-900 rounded-full p-2 mt-1 flex-shrink-0">
                  <FaChartLine className="text-primary-600 dark:text-red-300" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">Average Accuracy</p>
                  <p className="text-sm leading-relaxed">
                    Average accuracy percentage calculated from all winning months.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyAnalyticsPage;
