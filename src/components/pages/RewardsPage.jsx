'use client';

import React from 'react';
import Head from 'next/head';
import RewardsDashboard from '../RewardsDashboard';
import { useRewards } from '../../hooks/useRewards';
// MobileAppWrapper import removed
import Loading from '../Loading';

const RewardsPage = () => {
  const { rewards, loading, error } = useRewards();
  console.log(rewards, 'rewardsrewardsrewards')
  if (loading) {
    return <Loading fullScreen={true} size="lg" color="blue" message="Loading rewards..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-md lg:text-2xl font-bold text-gray-800 dark:text-white mb-2">Error Loading Rewards</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Rewards Dashboard - AajExam Earn & Track Rewards</title>
        <meta name="description" content="View your AajExam rewards dashboard. Track your earnings, daily, weekly, and monthly rewards, and achievements. See your progress towards all prize eligibility." />
        <meta name="keywords" content="AajExam rewards, quiz rewards, daily rewards, weekly rewards, monthly rewards, rewards dashboard, quiz earnings" />
        <meta property="og:title" content="Rewards Dashboard - AajExam Earn & Track Rewards" />
        <meta property="og:description" content="View your AajExam rewards dashboard. Track your earnings, daily, weekly, and monthly rewards, and achievements. See your progress towards all prize eligibility." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Rewards Dashboard - AajExam Earn & Track Rewards" />
        <meta name="twitter:description" content="View your AajExam rewards dashboard. Track your earnings, daily, weekly, and monthly rewards, and achievements. See your progress towards all prize eligibility." />
      </Head>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 lg:px-10 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl md:text-xl lg:text-3xl font-bold text-gray-900 dark:text-white">Rewards & Challenges</h1>
                <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base mt-1">
                  Track your progress and claim your earned rewards
                </p>
              </div>
              {rewards && (
                <div className="text-right">
                  <div className="text-sm text-gray-500 dark:text-gray-300">Total Claimable</div>
                  <div className="text-xl md:text-md lg:text-2xl font-bold text-green-600 dark:text-green-300">
                    ₹{rewards.claimableRewards?.toLocaleString() || '0'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <RewardsDashboard />
      </div>
    </>
  );
};

export default RewardsPage;




